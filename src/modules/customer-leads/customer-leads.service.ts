import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { firstValueFrom } from 'rxjs';

import { CreateFromNetsuiteDTO } from '~core/dto/create-from-netsuite.dto';
import {
  CustomerLeadHrc,
  CustomerLead,
} from '~core/interfaces/customer-lead.interface';
import { NetsuiteRequest } from '~core/interfaces/netsuite-request.interface';

import { EmployeesService } from '../employees/employees.service';

import { CreateLeadAddressDTO } from './dto/create-address.dto';
import { CreateLeadDTO } from './dto/create-lead.dto';
import {
  CreateAddressToNetsuiteDTO,
  CreateToNetsuiteDTO,
} from './dto/create-to-netsuite.dto';

import { CustomerLeadModel } from './models/customer-lead.model';
import { userProject } from './projects/user.project';

@Injectable()
export class CustomerLeadsService {
  constructor(
    @InjectModel(CustomerLeadModel.name)
    private customerLeadProvider: PaginateModel<CustomerLeadModel>,
    private httpService: HttpService,
    private employessService: EmployeesService,
  ) {}

  /**
   * @description Obtiene los leads de un asesor o busca leads por un criterio
   *
   * @param id - Sales Rep ID
   * @param page - Page number
   * @param limit - Limit per page
   * @param query - Search query
   * @returns PaginateResult<CustomerLeadModel[]>
   */
  async findAll(id: string, page = 1, limit = 10, query?: string) {
    // Si hay un query se usa un text search para buscar en todos los datos
    // Si no hay query se usa una query normal que busca por el id del asesor
    const querySearch = query
      ? [
          {
            $search: {
              index: 'search-by-entity',
              text: {
                query,
                path: {
                  wildcard: '*',
                },
              },
            },
          },
        ]
      : [
          {
            $match: {
              salesrep_id: id,
            },
          },
        ];

    // se calcula de cuanto será el salto de página
    const skip = (page - 1) * limit;

    // Promesa que obtiene los leads
    const searchPromise = this.customerLeadProvider
      .aggregate(
        [
          ...querySearch,
          {
            $project: userProject,
          },
        ],
        {
          maxTimeMS: 10000,
        },
      )
      .skip(skip)
      .limit(limit > 0 ? limit : 20)
      .exec();

    // Promesa que obtiene el total de leads para la busqueda
    const countPromise = this.customerLeadProvider
      .aggregate([...querySearch])
      .count('total')
      .exec();

    // Se espera a que las promesas se resuelvan
    const [search, count] = await Promise.all([searchPromise, countPromise]);

    // se calcula el total de páginas
    const pages =
      limit > 0 ? Math.ceil((count[0]?.total || 0) / limit) || 1 : null;

    // Se retorna el resultado
    const result: Partial<PaginateResult<CustomerLead>> = {
      docs: search,
      hasNextPage: page < pages,
      totalDocs: count[0]?.total || 0,
      nextPage: page < pages ? page + 1 : null,
    };

    return result;
  }

  /**
   * @deprecated No se usa
   */
  async paginate(page: number, limit: number, id?: string, search?: string) {
    const query = search ? { $text: { $search: search } } : { salesrep_id: id };

    return this.customerLeadProvider.paginate(
      {
        ...query,
        isinactive: false,
      },
      {
        page,
        limit,
        projection: userProject,
      },
    );
  }

  /**
   * @description Obtiene un lead por su id
   *
   * @param id - Customer ID
   * @returns CustomerLeadModel
   */
  async findOne(id: number) {
    // ! TODO pasar esto a una transacción
    const user = await this.customerLeadProvider
      .findOne({ _id: id }, userProject)
      .lean();

    if (!user) {
      throw new NotFoundException();
    }

    // Se ordenan las direcciones por default shipping
    const { addresses } = user;
    const orderedAddresses = addresses.sort((a) => {
      return a.defaultshipping ? -1 : 1;
    });

    let sales_rep = null;
    let referrer = null;
    let parent = null;

    // Si el lead tiene un asesor se obtiene su información
    if (user.salesrep_id) {
      sales_rep = await this.employessService.findOne(+user.salesrep_id);
    }

    if (user.parent_id) {
      parent = await this.customerLeadProvider
        .findOne(
          { _id: `${user.parent_id}` },
          { _id: 1, firstname: 1, lastname: 1, entitynumber: 1 },
        )
        .lean();
    }

    // Si el lead tiene un referrer se obtiene su información
    if (user.referred_by) {
      referrer = await this.customerLeadProvider.findOne(
        {
          _id: +user.referred_by,
        },
        { _id: 1, firstname: 1, lastname: 1, entitynumber: 1 },
      );
    }

    return {
      ...user,
      addresses: orderedAddresses,
      sales_rep,
      referrer,
      parent,
    };
  }

  /**
   * @description Valida si un lead existe por una propiedad y valor
   *
   * @param property - Nombre de la propiedad
   * @param value - Valor de la propiedad
   * @returns CustomerLeadModel
   */
  async validateByProperty(
    property: 'mobilephone' | 'token' | 'id',
    value: string | number,
  ) {
    return this.customerLeadProvider
      .findOne({ [property]: value }, { _id: 1, stage: 1 })
      .lean();
  }

  /**
   * @description Crea un lead desde una entidad Netsuite
   * @param dto - DTO con los datos del lead
   */
  async create(dto: CreateFromNetsuiteDTO) {
    try {
      const { fields, sublists } = dto;

      // Se elimina el email si no viene
      // No recuerdo por que se usa pero no se si es necesario
      if (!fields.email) {
        delete fields.email;
      }

      const fullname = `${fields.firstname} ${fields.lastname}`;
      const addresses = sublists.addressbook.map((address) => {
        // Para las direcciones se crea un addresse con el nombre del lead si no viene
        const addresse = address.addresse ? address.addresse : fullname;

        return {
          ...address,
          addresse,
        };
      });

      // Campos ligados a tissini plus
      const hrc: CustomerLeadHrc = { ...dto.fields };

      // Se crea el lead
      const customerLead: CustomerLead = {
        ...fields,
        hrc,
        addresses,
        salesrep_id: sublists.salesteam['line 1'].employee,
        _id: fields.id,
        name: `${fields.firstname} ${fields.lastname}`,
        email: fields.email ? fields.email.toLowerCase() : null,
      };

      // Se valida si el lead ya existe
      const exists = await this.customerLeadProvider.exists({ _id: fields.id });
      if (exists) {
        // Si el lead ya existe se actualiza
        await this.customerLeadProvider.updateOne(
          { _id: fields.id },
          {
            $set: {
              ...customerLead,
              parent_id: fields.parent_id ?? null,
            },
          },
        );
      } else {
        // Si no existe se crea
        await this.customerLeadProvider.create(customerLead);
      }
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

  /**
   * @description Actualiza un lead con un token de recuperación
   *
   * @param id - Customer ID
   * @param token - Token de la entidad
   * @returns CustomerLeadModel
   */
  async setRefreshToken(id: number, token: string | null) {
    return this.customerLeadProvider.updateOne(
      { id },
      { $set: { refresh_token: token } },
    );
  }

  /**
   * Se crea un lead en Netsuite
   *
   * @param dto - DTO con los datos del lead
   */
  async createLead(dto: CreateLeadDTO) {
    try {
      const lead: CreateToNetsuiteDTO = {
        ...dto,
      };

      // Request que se envia a Netsuite
      const request: NetsuiteRequest<CreateToNetsuiteDTO> = {
        method: 'CustomerController.create',
        values: lead,
      };

      // Se crea el lead en Netsuite
      const { data } = await firstValueFrom(
        this.httpService.post(
          'https://ns.tissini.cloud/api/v1/1539/1',
          request,
          {
            headers: {
              'X-API-KEY': process.env.NETSUITE_API_KEY,
            },
          },
        ),
      );
      return { data };
    } catch (error) {
      console.log(error.response);
      throw new Error('An error ocurred while creating lead');
    }
  }

  /**
   * @description Actualiza o crea una dirección de un lead en Netsuite
   * @param dto - DTO con los datos de la dirección
   * @returns
   */
  async createOrUpdateAddress(dto: CreateLeadAddressDTO) {
    try {
      if (!dto.addressId) {
        delete dto.addressId;
      }
      const request: NetsuiteRequest<CreateAddressToNetsuiteDTO> = {
        method: 'CustomerController.updateOrCreateAddress',
        values: dto,
      };

      const { data } = await firstValueFrom(
        this.httpService.post(
          'https://ns.tissini.cloud/api/v1/1539/1',
          request,
          {
            headers: {
              'X-API-KEY': process.env.NETSUITE_API_KEY,
            },
          },
        ),
      );
      return { data };
    } catch (error) {
      throw new Error('Something went bad');
    }
  }

  /**
   * @description Genera el token de ingreso de un lead
   *
   * @param id - Customer ID
   * @returns token - Token de la entidad
   */
  async generateToken(id: number) {
    const url = `https://v3.tissini.app/api/v3/login/by/id/${id}`;
    const authorization =
      'Bearer 401bcdbb561927501a396f244119f3e007026e6a4cd2beeb0f46b9e0f7437244';
    const { data } = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: authorization,
        },
      }),
    );
    const { token } = data.customer;
    return { token };
  }

  /**
   * @description Elimina un lead de Netsuite
   * @param id - Customer ID
   */
  delete(id: number) {
    return this.customerLeadProvider.deleteOne({ _id: id });
  }

  /**
   * @description Obtiene las direcciones de un lead
   * @param id - Customer ID
   */
  async getAddresses(id: number) {
    const customer = await this.customerLeadProvider.findOne(
      { _id: id },
      { addresses: 1 },
    );

    if (!customer) {
      throw new NotFoundException();
    }

    const { addresses } = customer;

    const orderedAddresses = addresses.sort((a) => {
      return a.defaultshipping ? -1 : 1;
    });

    return orderedAddresses;
  }

  async getByPhoneNumber(phoneNumber: string) {
    const customer = await this.customerLeadProvider.findOne(
      {
        mobilephone: phoneNumber,
      },
      { _id: 1 },
    );

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}

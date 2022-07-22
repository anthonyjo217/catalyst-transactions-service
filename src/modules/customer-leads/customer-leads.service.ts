import * as getLocalInfo from '@er1c/chronomouse';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { getTimeZone, TimeZoneI } from 'src/helpers/time-zone-list';

import { CreateFromNetsuiteDTO } from '~core/dto/create-from-netsuite.dto';
import {
  CustomerLeadHrc,
  CustomerLead,
} from '~core/interfaces/customer-lead.interface';
import { NetsuiteRequest } from '~core/interfaces/netsuite-request.interface';
import { TissiniPlusResponse } from '~core/interfaces/tissini-plus-response';

import { EmployeesService } from '../employees/employees.service';

import { CreateLeadAddressDTO } from './dto/create-address.dto';
import { CreateLeadDTO } from './dto/create-lead.dto';
import {
  CreateAddressToNetsuiteDTO,
  CreateToNetsuiteDTO,
} from './dto/create-to-netsuite.dto';
import { UpdateTCoinsDTO } from './dto/update-tcoins.dto';

import { CustomerLeadModel } from './models/customer-lead.model';
import { searchProject, userProject } from './projects/user.project';

@Injectable()
export class CustomerLeadsService {
  constructor(
    @InjectModel(CustomerLeadModel.name)
    private customerLeadProvider: PaginateModel<CustomerLeadModel>,
    private httpService: HttpService,
    private employessService: EmployeesService,
    private configService: ConfigService,
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
              text: { query, path: { wildcard: '*' } },
            },
          },
        ]
      : [{ $match: { salesrep_id: id } }];

    // se calcula de cuanto será el salto de página
    const skip = (page - 1) * limit;

    // Promesa que obtiene los leads
    const searchPromise = this.customerLeadProvider
      .aggregate([...querySearch, { $project: searchProject }], {
        maxTimeMS: 10000,
      })
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
    const user = await this.customerLeadProvider
      .findOne({ _id: id }, userProject)
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException();
    }

    // Se ordenan las direcciones por default shipping
    const { addresses } = user;
    const orderedAddresses = addresses
      .filter(({ is_deleted }) => !is_deleted)
      .sort((a) => {
        return a.defaultshipping ? -1 : 1;
      });

    let sales_rep = null;
    let referrer = null;
    let parent = null;
    const resultado_de_contacto =
      user.resultado_de_contacto ||
      user.custentity_resultado_de_contacto_con_cli;

    user.resultado_de_contacto = resultado_de_contacto;

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
        .lean()
        .exec();
    }

    // Si el lead tiene un referrer se obtiene su información
    if (user.referred_by) {
      referrer = await this.customerLeadProvider
        .findOne(
          {
            _id: +user.referred_by,
          },
          { _id: 1, firstname: 1, lastname: 1, entitynumber: 1 },
        )
        .lean()
        .exec();
    }

    const timeZone: TimeZoneI = getTimeZone(user.time_zone);
    const phoneNumber: string = user.mobilephone.slice(0, 3);
    const currentTime: string =
      timeZone !== undefined
        ? getLocalInfo(timeZone?.Code, { military: false }).time.display
        : getLocalInfo(phoneNumber, { military: false }).time.display;

    return {
      ...user,
      addresses: orderedAddresses,
      sales_rep,
      referrer,
      parent,
      currentTime,
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
      const customer = await this.customerLeadProvider
        .findOne({ _id: fields.id }, { addresses: 1 })
        .lean()
        .exec();
      if (customer) {
        // Si el lead ya existe se actualiza

        const deletedAddresses = customer.addresses.filter(
          ({ is_deleted }) => is_deleted,
        );

        const mappedAddresses = customerLead.addresses.map((address) => {
          const isDeleted = !!deletedAddresses.find(
            ({ _id }) => _id === address._id,
          );

          return isDeleted ? { ...address, is_deleted: true } : address;
        });

        customerLead.addresses = mappedAddresses;

        await this.customerLeadProvider
          .updateOne(
            { _id: fields.id },
            {
              $set: {
                ...customerLead,
                hrc: {
                  ...customerLead.hrc,
                },
                parent_id: fields.parent_id ?? null,
              },
            },
          )
          .exec();
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
        custentity_is_final_client: false,
      };

      let isFinalClient = Boolean(lead.parent);
      if (dto.id) {
        const leadIfExists = await this.customerLeadProvider
          .findOne(
            {
              _id: Number(dto.id),
            },
            { parent_id: 1 },
          )
          .lean()
          .exec();
        isFinalClient = Boolean(leadIfExists.parent_id) && !lead.parent;
      }

      lead.custentity_is_final_client = isFinalClient;

      // Request que se envia a Netsuite
      const request: NetsuiteRequest<CreateToNetsuiteDTO> = {
        method: 'CustomerController.create',
        values: lead,
      };

      const service = this.configService.get('NETSUITE_SERVICE');
      const key = this.configService.get('NETSUITE_API_KEY');

      // Se crea el lead en Netsuite
      const { data } = await firstValueFrom(
        this.httpService.post(service, request, {
          headers: {
            'X-API-KEY': key,
          },
        }),
      );
      return { data };
    } catch (error) {
      console.log(error);
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

      const service = this.configService.get('NETSUITE_SERVICE');
      const key = this.configService.get('NETSUITE_API_KEY');

      const { data } = await firstValueFrom(
        this.httpService.post(service, request, {
          headers: {
            'X-API-KEY': key,
          },
        }),
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
    const customer = await this.customerLeadProvider
      .findOne({ _id: id }, { addresses: 1 })
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException();
    }

    const { addresses } = customer;

    return addresses
      .filter(({ is_deleted }) => !is_deleted)
      .sort((a) => {
        return a.defaultshipping ? -1 : 1;
      });
  }

  async getByPhoneNumber(phoneNumber: string) {
    const customer = await this.customerLeadProvider
      .findOne(
        {
          $or: [
            { mobilephone: phoneNumber },
            { mobilephone: `1${phoneNumber}` },
          ],
        },
        { _id: 1 },
      )
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async getTissiniPlus(id: number) {
    const discountFields = [
      'descue_primera_azul',
      'descue_primera_celeste',
      'descue_primera_turquesa',
      'descue_primera_lila',
      'descue_primera_rosa',
      'descue_primera_magenta',
    ];

    const bonoFields = [
      'acumuladas_rosa',
      'acumuladas_magenta',
      'acumuladas_lila',
    ];

    const oneDollarFiels = [
      'realiza3compras',
      'realiza3compras_rosa',
      'realiza3compras_celeste',
      'realiza3compras_magenta',
      'realiza3compras_azul',
      'realiza3compras_lila',
    ];

    const take11Fields = [
      'compra10_lleva11',
      'compra10_lleva11_lila',
      'compra10_lleva11_rosa',
      'compra10_lleva11_magenta',
    ];

    const projectFields = [
      ...discountFields,
      ...bonoFields,
      ...oneDollarFiels,
      ...take11Fields,
    ];

    const project = projectFields.reduce((acc, curr) => {
      return { ...acc, [`hrc.${curr}`]: 1 };
    }, {});

    const customer = await this.customerLeadProvider
      .findOne(
        { _id: id },
        {
          ...project,
          'hrc.envio_gratis_25_descuento': 1,
        },
      )
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException();
    }

    const hasPercentageDiscount = discountFields.some(
      (field) => customer.hrc[field],
    );

    const hasBono = bonoFields.some((field) => customer.hrc[field]);
    const hasOneDollar = oneDollarFiels.some((field) => customer.hrc[field]);
    const hasTake11 = take11Fields.some((field) => customer.hrc[field]);

    const response: TissiniPlusResponse = {
      has_first_order_discount: hasPercentageDiscount,
      has_bono: hasBono,
      has_onedollar: hasOneDollar,
      has_pay10take11: hasTake11,
      has_free_shipping: customer.hrc.envio_gratis_25_descuento,
    };

    return response;
  }

  async getCaminoPlus(id: number) {
    return this.customerLeadProvider.findOne({ _id: id }, { hrc: 1 });
  }

  async updateTCoins(dto: UpdateTCoinsDTO, id: number) {
    const customer = await this.customerLeadProvider
      .findOne(
        { _id: id },
        {
          'hrc.tcoins_ganados': 1,
          'hrc.tcoins_disponibles': 1,
          'hrc.tcoins_gastados': 1,
          'hrc.tcoins_perdidos': 1,
        },
      )
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException(`Customer ${id} not found`);
    }

    await this.customerLeadProvider
      .updateOne(
        { _id: id },
        {
          $set: {
            'hrc.tcoins_ganados':
              dto.tcoins_ganados ?? customer.hrc.tcoins_ganados,
            'hrc.tcoins_disponibles':
              dto.tcoins_disponibles ?? customer.hrc.tcoins_disponibles,
            'hrc.tcoins_gastados':
              dto.tcoins_gastados ?? customer.hrc.tcoins_gastados,
            'hrc.tcoins_perdidos':
              dto.tcoins_perdidos ?? customer.hrc.tcoins_perdidos,
          },
        },
      )
      .exec();

    return { success: true, dto, customer, id };
  }

  async refreshData(id: number) {
    const request: NetsuiteRequest = {
      method: 'CustomerController.refreshCustomer',
      values: {
        userId: id,
      },
    };

    const service = this.configService.get('NETSUITE_SERVICE');
    const key = this.configService.get('NETSUITE_API_KEY');

    const { data } = await firstValueFrom(
      this.httpService.post(service, request, {
        headers: {
          'X-API-KEY': key,
        },
      }),
    );
    return { data };
  }

  async deleteAddress(customerId: number, addressId: number) {
    const customer = await this.customerLeadProvider
      .findOne(
        { _id: customerId },
        {
          addresses: {
            defaultbilling: 1,
            defaultshipping: 1,
            _id: 1,
            is_deleted: 1,
          },
        },
      )
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException(`Customer ${customerId} not found`);
    }

    const { addresses } = customer;

    const address = addresses.find(
      ({ _id, is_deleted }) => _id === addressId && !is_deleted,
    );
    if (!address) {
      throw new NotFoundException(`Address ${addressId} not found`);
    }

    const canBeDeleted = !address.defaultshipping && addresses.length > 1;
    if (!canBeDeleted) {
      throw new BadRequestException(
        `The address ${addressId} can't be deleted`,
      );
    }

    const response = await this.customerLeadProvider
      .updateOne(
        {
          _id: customerId,
          'addresses._id': addressId,
        },
        {
          $set: {
            'addresses.$.is_deleted': true,
          },
        },
      )
      .exec();

    return { success: true, response };
  }
}

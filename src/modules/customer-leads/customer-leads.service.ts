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

  async findAll(id: string, page = 1, limit = 10, query?: string) {
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

    const skip = (page - 1) * limit;

    const searchPromise = this.customerLeadProvider
      .aggregate([
        ...querySearch,
        {
          $project: userProject,
        },
      ])
      .skip(skip)
      .limit(limit > 0 ? limit : 20)
      .exec();

    const countPromise = this.customerLeadProvider
      .aggregate([...querySearch])
      .count('total')
      .exec();

    const [search, count] = await Promise.all([searchPromise, countPromise]);
    const pages =
      limit > 0 ? Math.ceil((count[0]?.total || 0) / limit) || 1 : null;

    const result: Partial<PaginateResult<CustomerLead>> = {
      docs: search,
      hasNextPage: page < pages,
      totalDocs: count[0]?.total || 0,
      nextPage: page < pages ? page + 1 : null,
    };

    return result;
  }

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

  async findOne(id: number) {
    const user = await this.customerLeadProvider
      .findOne({ _id: id }, userProject)
      .lean();

    if (!user) {
      throw new NotFoundException();
    }

    let sales_rep = null;
    let referrer = null;

    if (user.salesrep_id) {
      sales_rep = await this.employessService.findOne(+user.salesrep_id);
    }

    if (user.referred_by) {
      referrer = await this.customerLeadProvider.findOne(
        {
          _id: +user.referred_by,
        },
        { _id: 1, firstname: 1, lastname: 1 },
      );
    }

    return { ...user, sales_rep, referrer };
  }

  async validateByProperty(
    property: 'mobilephone' | 'token' | 'id',
    value: string | number,
  ) {
    return this.customerLeadProvider
      .findOne({ [property]: value }, { _id: 1, stage: 1 })
      .lean();
  }

  async create(dto: CreateFromNetsuiteDTO) {
    try {
      const { fields, sublists } = dto;

      if (!fields.email) {
        delete fields.email;
      }

      const fullname = `${fields.firstname} ${fields.lastname}`;
      const addresses = sublists.addressbook.map((address) => {
        const addresse = address.addresse ? address.addresse : fullname;

        return {
          ...address,
          addresse,
        };
      });

      const hrc: CustomerLeadHrc = { ...dto.fields };
      const customerLead: CustomerLead = {
        ...fields,
        hrc,
        addresses,
        salesrep_id: sublists.salesteam['line 1'].employee,
        _id: fields.id,
        name: `${fields.firstname} ${fields.lastname}`,
      };

      const exists = await this.customerLeadProvider.exists({ _id: fields.id });
      if (exists) {
        await this.customerLeadProvider.updateOne(
          { _id: fields.id },
          { $set: { ...customerLead } },
        );
      } else {
        await this.customerLeadProvider.create(customerLead);
      }
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  }

  async setRefreshToken(id: number, token: string | null) {
    return this.customerLeadProvider.updateOne(
      { id },
      { $set: { refresh_token: token } },
    );
  }

  async createLead(dto: CreateLeadDTO) {
    try {
      const lead: CreateToNetsuiteDTO = {
        ...dto,
      };

      const request: NetsuiteRequest<CreateToNetsuiteDTO> = {
        method: 'CustomerController.create',
        values: lead,
      };

      const { data } = await firstValueFrom(
        this.httpService.post(process.env.NETSUITE_SERVICE, request, {
          headers: {
            'X-API-KEY': process.env.NETSUITE_API_KEY,
          },
        }),
      );
      return { data };
    } catch (error) {
      console.log(error.response);
      throw new Error('An error ocurred while creating lead');
    }
  }

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
        this.httpService.post(process.env.NETSUITE_SERVICE, request, {
          headers: {
            'X-API-KEY': process.env.NETSUITE_API_KEY,
          },
        }),
      );
      return { data };
    } catch (error) {
      throw new Error('Something went bad');
    }
  }

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

  delete(id: number) {
    return this.customerLeadProvider.deleteOne({ _id: id });
  }
}

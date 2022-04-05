import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CreateFromNetsuiteDTO } from '~core/dto/create-from-netsuite.dto';
import {
  CustomerLeadHrc,
  CustomerLead,
} from '~core/interfaces/customer-lead.interface';
import { NetsuiteRequest } from '~core/interfaces/netsuite-request.interface';
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
    private customerLeadProvider: Model<CustomerLeadModel>,
    private httpService: HttpService,
  ) {}

  async findAll(id: string, limit = 20, startId = 322, skip = 0, query = '') {
    const querySearch = query
      ? [
          {
            $search: {
              index: 'search-by-entity',
              text: {
                query,
                path: ['firstname', 'lastname', 'email'],
              },
            },
          },
        ]
      : [];

    console.log({ querySearch });

    const users = await this.customerLeadProvider
      .aggregate([
        ...querySearch,
        {
          $match: {
            salesrep_id: id,
            _id: { $gt: startId },
          },
        },
        {
          $project: userProject,
        },
      ])
      .skip(skip)
      .limit(limit > 0 ? limit : 20)
      .exec();

    let newStartId: number | null;
    if (users.length > 2) {
      newStartId = users[limit - 1]?._id;
    }

    return { users, next: { startId: newStartId } };
  }

  async findOne(id: number) {
    const user = await this.customerLeadProvider
      .findOne({ _id: id }, { refresh_token: 0, password: 0 })
      .lean();

    if (!user) {
      throw new NotFoundException();
    }
    return user;
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

      const hrc: CustomerLeadHrc = { ...dto.fields };
      const customerLead: CustomerLead = {
        ...fields,
        hrc,
        addresses: sublists.addressbook,
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
      console.log(error);
      throw new Error('Something went bad');
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
}

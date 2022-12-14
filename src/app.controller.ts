import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiKey } from '~core/decorators/api-key.decorator';

import { IsPublic } from '~core/decorators/is-public.decorator';
import {
  USER_TYPES,
  CreateFromNetsuiteDTO,
} from '~core/dto/create-from-netsuite.dto';
import { ApiKeyGuard } from '~core/guards/api-key.guard';
import { PaginationParams } from '~core/interfaces/pagination-params.interface';

import { CustomerLeadsService } from './modules/customer-leads/customer-leads.service';
import { CreateLeadAddressDTO } from './modules/customer-leads/dto/create-address.dto';
import { CreateLeadDTO } from './modules/customer-leads/dto/create-lead.dto';
import { EmployeesService } from './modules/employees/employees.service';

@Controller({
  path: 'users',
  version: '1',
})
export class AppController {
  constructor(
    private employeeService: EmployeesService,
    private customerLeadService: CustomerLeadsService,
  ) {}

  @IsPublic()
  @Get('health')
  async health(@Res() res: Response) {
    res.status(HttpStatus.OK).json({ status: 'OK' });
  }

  @Get()
  async getUsers(
    @Req() req,
    @Query() { query, limit, page }: PaginationParams,
  ) {
    const { user } = req;
    const id = `${user._id}`;
    return this.customerLeadService.findAll(
      id,
      +page || 1,
      +limit || 20,
      query,
    );
  }

  @Get(':id')
  async getUser(@Param('id', new ParseIntPipe()) id: number) {
    return this.customerLeadService.findOne(id);
  }

  @Post('lead/create')
  async createLead(@Body() dto: CreateLeadDTO) {
    return this.customerLeadService.createLead(dto);
  }

  @Post('address/create')
  async createLeadAddress(@Body() dto: CreateLeadAddressDTO) {
    return this.customerLeadService.createOrUpdateAddress(dto);
  }

  @IsPublic()
  @Post('refresh-token')
  async setRefreshToken(@Body() { id, token }: any, @Req() req) {
    const { user } = req;

    if (user.stage === USER_TYPES.SALESREP) {
      return this.employeeService.setRefreshToken(id, token);
    } else {
      return this.customerLeadService.setRefreshToken(id, token);
    }
  }

  @Delete(':user-id/refresh-token')
  async unsetRefreshToken(
    @Req() req,
    @Param('user-id', new ParseIntPipe()) id: number,
  ) {
    const { user } = req;

    if (user.stage === USER_TYPES.SALESREP) {
      return this.employeeService.setRefreshToken(id, null);
    } else {
      return this.customerLeadService.setRefreshToken(id, null);
    }
  }

  @IsPublic()
  @ApiKey()
  @UseGuards(ApiKeyGuard)
  @Post(':id')
  async createFromNetsuite(@Body() dto: CreateFromNetsuiteDTO) {
    if (dto.type === USER_TYPES.SALESREP) {
      return this.employeeService.create(dto.fields);
    } else {
      return this.customerLeadService.create(dto);
    }
  }

  @IsPublic()
  @ApiKey()
  @UseGuards(ApiKeyGuard)
  @Delete(':id')
  async deleteFromNetsuite(@Param('id', new ParseIntPipe()) id: number) {
    return this.customerLeadService.delete(id);
  }

  @Get(':id/token')
  async generateToken(@Param('id', new ParseIntPipe()) id: number) {
    return this.customerLeadService.generateToken(id);
  }

  @IsPublic()
  @ApiKey()
  @UseGuards(ApiKeyGuard)
  @Get(':id/customer-leads/:phone')
  async getCustomerLeads(
    @Param('id') employeeId: string,
    @Param('phone') phone: string,
  ) {
    const employee = (await this.employeeService.getBy88Id(employeeId))._id;
    const customer = (await this.customerLeadService.getByPhoneNumber(phone))
      ._id;

    return { employee, customer };
  }
}

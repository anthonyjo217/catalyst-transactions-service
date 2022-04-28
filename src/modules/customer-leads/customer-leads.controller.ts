import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiKey } from '~core/decorators/api-key.decorator';
import { IsPublic } from '~core/decorators/is-public.decorator';
import { CreateFromNetsuiteDTO } from '~core/dto/create-from-netsuite.dto';
import { PaginationParams } from '~core/interfaces/pagination-params.interface';

import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { CustomerLeadsService } from './customer-leads.service';
import { CreateLeadAddressDTO } from './dto/create-address.dto';
import { CreateLeadDTO } from './dto/create-lead.dto';

@Controller({
  path: 'customer-leads',
  version: '1',
})
export class CustomerLeadsController {
  constructor(private readonly customerLeadsService: CustomerLeadsService) {}

  @Get()
  async getAll(@Req() req, @Query() { limit, page, query }: PaginationParams) {
    const { user } = req;
    const id = `${user._id}`;
    return this.customerLeadsService.paginate(
      page || 1,
      limit || 10,
      id,
      query,
    );
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.customerLeadsService.findOne(+id);
  }

  @IsPublic()
  @ApiKey()
  @UseGuards(ApiKeyGuard)
  @Get(':id/addresses')
  async getAddresses(@Param('id') id: string) {
    return this.customerLeadsService.getAddresses(+id);
  }

  @Post()
  async createLead(@Body() dto: CreateLeadDTO) {
    return this.customerLeadsService.createLead(dto);
  }

  @Post(':id/address')
  async createLeadAddress(@Body() dto: CreateLeadAddressDTO) {
    return this.customerLeadsService.createOrUpdateAddress(dto);
  }

  @Post(':id/netsuite')
  async createFromNetsuite(@Body() dto: CreateFromNetsuiteDTO) {
    return await this.customerLeadsService.create(dto);
  }
}

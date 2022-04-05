import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { CreateFromNetsuiteDTO } from '~core/dto/create-from-netsuite.dto';
import { PaginationParams } from '~core/interfaces/pagination-params.interface';
import { CustomerLeadsService } from './customer-leads.service';
import { CreateLeadAddressDTO } from './dto/create-address.dto';
import { CreateLeadDTO } from './dto/create-lead.dto';

@Controller('customer-leads')
export class CustomerLeadsController {
  constructor(private readonly customerLeadsService: CustomerLeadsService) {}

  @Get()
  async getAll(
    @Req() req,
    @Query() { limit, skip, startId, query }: PaginationParams,
  ) {
    const { user } = req;
    const id = `${user._id}`;
    return this.customerLeadsService.findAll(id, +limit, +startId, skip, query);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.customerLeadsService.findOne(id);
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

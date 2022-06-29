import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { ApiKey } from '~core/decorators/api-key.decorator';
import { IsPublic } from '~core/decorators/is-public.decorator';
import { CreateFromNetsuiteDTO } from '~core/dto/create-from-netsuite.dto';
import { PaginationParams } from '~core/interfaces/pagination-params.interface';

import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { CustomerLeadsService } from './customer-leads.service';
import { CreateLeadAddressDTO } from './dto/create-address.dto';
import { CreateLeadDTO } from './dto/create-lead.dto';
import { UpdateTCoinsDTO } from './dto/update-tcoins.dto';

/**
 * Este controlador es para separar las logicas de negocio que están ligadas
 * a las customers o leads.
 *
 * Hay varios endpoints que están acá que se prodrían empezar a usar en el frontend
 * y tener una mejor organización de las rutas.
 */
@Controller({
  path: 'customer-leads',
  version: '1',
})
export class CustomerLeadsController {
  constructor(private readonly customerLeadsService: CustomerLeadsService) {}

  /**
   * Obtiene una lista de leads de un asesor o busca leads por un query
   *
   * @param req Request
   * @param param1 PaginatinParams
   * @returns Promise<any>
   */
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

  /**
   * Obtiene un lead por su id
   *
   *
   * @param id id del lead
   * @returns Promise<any>
   */
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.customerLeadsService.findOne(+id);
  }

  /**
   * Obtiene las direcciones de un lead
   *
   * @param id id del lead
   * @returns Promise<any>
   */
  @IsPublic()
  @ApiKey()
  @UseGuards(ApiKeyGuard)
  @Get(':id/addresses')
  async getAddresses(@Param('id') id: string) {
    return this.customerLeadsService.getAddresses(+id);
  }

  /**
   * Crea una nueva lead desde el frontend
   *
   * @param dto DTO con los datos de la lead
   * @returns Promise<any>
   */
  @Post()
  async createLead(@Body() dto: CreateLeadDTO) {
    return this.customerLeadsService.createLead(dto);
  }

  /**
   * Crea o actualiza una dirección de un lead
   *
   * @param dto DTO con los datos de la  direccion
   * @returns Promise<any>
   */
  @Post(':id/address')
  async createLeadAddress(@Body() dto: CreateLeadAddressDTO) {
    return this.customerLeadsService.createOrUpdateAddress(dto);
  }

  /**
   * Crea o actualiza una lead desde netsuite
   * @param dto DTO con los datos de la lead a crear o actualizar
   * @returns Promise<any>
   */
  @Post(':id/netsuite')
  async createFromNetsuite(@Body() dto: CreateFromNetsuiteDTO) {
    return await this.customerLeadsService.create(dto);
  }

  @IsPublic()
  @Get(':id/tissini-plus')
  async getTissiniPlus(@Param('id', new ParseIntPipe()) id: number) {
    return this.customerLeadsService.getTissiniPlus(id);
  }

  @Get(':id/camino-plus')
  async getCaminoPlus(@Param('id', new ParseIntPipe()) id: number) {
    return this.customerLeadsService.getCaminoPlus(id);
  }

  @IsPublic()
  @ApiKey()
  @UseGuards(ApiKeyGuard)
  @Post(':id/t-coins')
  async updateTCoins(@Body() dto, @Param('id', new ParseIntPipe()) id: number) {
    const dtoTranformed = plainToInstance(UpdateTCoinsDTO, dto, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
    });
    return this.customerLeadsService.updateTCoins(dtoTranformed, id);
  }
}

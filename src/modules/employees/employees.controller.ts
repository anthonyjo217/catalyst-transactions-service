import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ApiKey } from '~core/decorators/api-key.decorator';
import { IsPublic } from '~core/decorators/is-public.decorator';

import { CreateFromNetsuiteDTO } from '~core/dto/create-from-netsuite.dto';
import { ApiKeyGuard } from '~core/guards/api-key.guard';
import { BearerTokenGuard } from '~core/guards/bearer-token.guard';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

/**
 * Employees Controller
 * La razon de ser de este controlador también es separar la logica de negocio
 * debería empezar a usarse en donde se deba
 */
@Controller({
  path: 'employees',
  version: '1',
})
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private httpService: HttpService,
  ) {}

  /**
   * Crea o actualiza un usuario
   *
   * @param dto UpdateEmployeeDTO
   * @returns Promise<Employee>
   */
  @Post(':id/netsuite')
  async createFromNetsuite(@Body() dto: CreateFromNetsuiteDTO) {
    return this.employeesService.create(dto.fields);
  }

  @Patch(':id')
  async update(
    @Body() dto: UpdateEmployeeDTO,
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException();
    }

    return this.employeesService.update(id, dto);
  }

  @IsPublic()
  @ApiKey()
  @UseGuards(ApiKeyGuard)
  @Patch(':id/microsoft-graph-id')
  async addMicrosoftGraphId(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: { microsoft_graph_id: string },
  ) {
    return this.employeesService.addMicrosoftGraphId(
      id,
      dto.microsoft_graph_id,
    );
  }

  @IsPublic()
  @UseGuards(BearerTokenGuard)
  @Get('leaders')
  async getLeaders() {
    return this.employeesService.getLeaders();
  }

  @IsPublic()
  @Get(':id/free-shipping')
  async freeShippingBySalesrep(@Param('id', new ParseIntPipe()) id: number) {
    return this.employeesService.freeShippingBySalesrep(id);
  }

  @IsPublic()
  @Post('/product-by-variants')
  async getProductsByVariantsIds(@Body() dto: number[]) {
    const start = new Date().valueOf();
    const { data } = await firstValueFrom(
      this.httpService.post('http://localhost:3000/v1/products/variants', dto),
    );
    const end = new Date().valueOf();
    return { data, start, end };
  }
}

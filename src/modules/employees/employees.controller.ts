import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { CreateFromNetsuiteDTO } from '~core/dto/create-from-netsuite.dto';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@Controller({
  path: 'employees',
  version: '1',
})
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post(':id/netsuite')
  async createFromNetsuite(@Body() dto: CreateFromNetsuiteDTO) {
    return await this.employeesService.create(dto.fields);
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

    return await this.employeesService.update(id, dto);
  }
}

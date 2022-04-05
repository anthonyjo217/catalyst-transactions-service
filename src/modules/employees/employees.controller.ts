import { Body, Controller, Post } from '@nestjs/common';
import { CreateFromNetsuiteDTO } from '~core/dto/create-from-netsuite.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post(':id/netsuite')
  async createFromNetsuite(@Body() dto: CreateFromNetsuiteDTO) {
    return await this.employeesService.create(dto.fields);
  }
}

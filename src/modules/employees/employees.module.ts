import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmployeeModel, EmployeeSchema } from './models/employee.model';

import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EmployeeModel.name,
        schema: EmployeeSchema,
        collection: 'employees',
      },
    ]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}

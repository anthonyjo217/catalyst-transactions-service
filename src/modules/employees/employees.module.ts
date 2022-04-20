import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmployeeModel, EmployeeSchema } from './models/employee.model';

import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EmployeeModel.name,
        schema: EmployeeSchema,
        collection: 'employees',
      },
    ]),
    EmailModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}

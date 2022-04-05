import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';

@Module({
  imports: [MongooseModule.forFeature([])],
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}

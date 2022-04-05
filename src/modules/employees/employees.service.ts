import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as brcypt from 'bcrypt';

import { Fields } from '~core/dto/create-from-netsuite.dto';

import { EmployeeModel } from './models/employee.model';
import { Employee } from '~core/interfaces/employee.interface';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(EmployeeModel.name)
    private employeeProvider: Model<EmployeeModel>,
  ) {}

  async validate(email: string, password: string) {
    const employee = await this.employeeProvider.findOne({ email }).lean();

    if (!employee) {
      return null;
    }

    const { password: hashed, ...rest } = employee;
    const isValid = await brcypt.compare(password, hashed);
    if (!isValid) {
      return null;
    }
    return rest;
  }

  async setRefreshToken(id: number, token: string | null) {
    return this.employeeProvider.updateOne(
      { _id: id },
      { refreshToken: token },
    );
  }

  async create(info: Fields) {
    const employee: Employee = {
      ...info,
      _id: info.id,
      name: `${info.firstname} ${info.lastname}`,
      stage: 'EMPLOYEE',
    };

    const exists = await this.employeeProvider.exists({ _id: employee._id });
    if (exists) {
      await this.employeeProvider.updateOne(
        { _id: employee._id },
        { $set: employee },
      );
    } else {
      const password = 'HsuFO5Z5Jn';
      const salt = await brcypt.genSalt(10);
      const hashed = await brcypt.hash(password, salt);
      await this.employeeProvider.create({ ...employee, password: hashed });
    }
    return { success: true };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as brcypt from 'bcrypt';

import { Fields } from '~core/dto/create-from-netsuite.dto';
import { Employee } from '~core/interfaces/employee.interface';

import { EmployeeModel } from './models/employee.model';
import { EmailOptions } from '../email/interfaces/email-options.interface';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import generatePasswordUrl from '../../helpers/generate-password-url';
import { EmailService } from '../email/email.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(EmployeeModel.name)
    private employeeProvider: Model<EmployeeModel>,
    private emailService: EmailService,
  ) {}

  async validate(email: string, password: string) {
    const employee = await this.employeeProvider.findOne({ email }).lean();

    if (!employee) {
      return null;
    }

    const { password: hashed, ...rest } = employee;
    const isValid = await brcypt.compare(password, hashed);

    console.log(password.length);

    if (!isValid) {
      return null;
    }
    return rest;
  }

  async setIsLoggedIn(id: number, isLoggedIn: boolean) {
    return this.employeeProvider.updateOne(
      { _id: id },
      { is_logged_in: isLoggedIn },
    );
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
      const params = {
        createPassword: true,
      };
      const { url, token } = generatePasswordUrl(params);
      const options: EmailOptions = {
        subject: 'Bienvenido a Tissini Seller',
        text: '',
        to: employee.email,
        template: 'create-password',
        variables: {
          url,
        },
      };

      this.emailService.sendEmail(options);
      await this.employeeProvider.create({
        ...employee,
        password: '',
        recover_password_token: token,
      });
    }
    return { success: true };
  }

  async findOne(id: number) {
    return this.employeeProvider
      .findOne({ _id: id }, { _id: 1, firstname: 1, lastname: 1 })
      .lean();
  }

  async update(id: number, dto: UpdateEmployeeDTO) {
    if (dto.password) {
      const salt = await brcypt.genSalt(10);
      const hashed = await brcypt.hash(dto.password, salt);
      dto.password = hashed;
      return this.employeeProvider.updateOne({ _id: id }, dto);
    }

    return this.employeeProvider.updateOne({ _id: id }, dto);
  }

  async getByEmail(email: string, isCheck = false) {
    const project = isCheck
      ? { email: 1, firstname: 1, lastname: 1, _id: 0 }
      : {};
    return this.employeeProvider.findOne({ email }, project).lean();
  }

  async setRecoverToken(id: number, token: string) {
    return this.employeeProvider.updateOne(
      { _id: id },
      { recover_password_token: token },
    );
  }

  async getByRecoverToken(token: string) {
    return this.employeeProvider
      .findOne({ recover_password_token: token })
      .lean();
  }

  async setPassword(id: number, password: string) {
    const salt = await brcypt.genSalt(10);
    const hashed = await brcypt.hash(password, salt);
    return this.employeeProvider.updateOne({ _id: id }, { password: hashed });
  }
}

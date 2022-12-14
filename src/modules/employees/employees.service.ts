import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import * as brcypt from 'bcrypt';

import { Fields } from '~core/dto/create-from-netsuite.dto';
import { Employee } from '~core/interfaces/employee.interface';

import { EmployeeModel } from './models/employee.model';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import generatePasswordUrl from '../../helpers/generate-password-url';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(EmployeeModel.name)
    private employeeProvider: Model<EmployeeModel>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * Gets an employee by its email and validate the password
   *
   * @param email The email of the employee
   * @param password The password of the employee
   */
  async validate(email: string, password: string) {
    const employee = await this.getByEmail(email, true);
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

  /**
   * Setea si el usuario esta activo o no
   *
   * @param id The id of the employee
   * @param isLoggedIn The flag that indicates if the employee is logged in
   */
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

  /**
   * Crea un asesor desde netsuite
   *
   * @param info The info of the employee
   */
  async create(info: Fields) {
    const employee: Employee = {
      ...info,
      _id: info.id,
      name: `${info.firstname} ${info.lastname}`,
      stage: 'EMPLOYEE',
    };

    const exists = await this.employeeProvider
      .exists({ _id: employee._id })
      .exec();

    if (exists) {
      const { email, ...rest } = employee;
      await this.employeeProvider
        .updateOne(
          { _id: employee._id },
          {
            $set: {
              ...rest,
            },
          },
        )
        .exec();
    } else {
      const params = {
        createPassword: true,
      };
      const { token, url } = generatePasswordUrl(params);

      const emailOptions = {
        to: employee.email,
        subject: 'Cambio de contrase??a',
        template: 'create-password',
        'h:X-Mailgun-Variables': {
          url,
        },
      };

      const notService = this.configService.get('NOTIFICATION_SERVICE');

      try {
        await firstValueFrom(
          this.httpService.post(`${notService}/v1/email`, emailOptions),
        );
      } catch (error) {
        console.log({ error });
      }

      await this.employeeProvider.create({
        ...employee,
        password: '',
        recover_password_token: token,
        email: employee.email.toLowerCase(),
        updated_email: employee.email.toLowerCase(),
      });
    }
    return { success: true };
  }

  async findOne(id: number) {
    return this.employeeProvider
      .findOne({ _id: id }, { _id: 1, firstname: 1, lastname: 1 })
      .lean();
  }

  /**
   *
   * @param id The id of the employee
   * @param dto The data to update
   */
  async update(id: number, dto: UpdateEmployeeDTO) {
    if (dto.password) {
      // Si se actualiza la contrase??a, se hashea y se guarda
      const salt = await brcypt.genSalt(10);
      const hashed = await brcypt.hash(dto.password, salt);
      dto.password = hashed;
      return this.employeeProvider.updateOne({ _id: id }, dto);
    }

    return this.employeeProvider.updateOne({ _id: id }, dto);
  }

  async getByEmail(
    email: string,
    withPassword = false,
  ): Promise<Partial<Employee>> {
    const project = {
      entityid: 1,
      firstname: 1,
      lastname: 1,
      stage: 1,
      id_8x8: 1,
      is_logged_in: 1,
      updated_email: 1,
      microsoft_graph_id: 1,
    };

    if (withPassword) {
      project['password'] = 1;
    }

    const result = await this.employeeProvider
      .aggregate([
        {
          $project: {
            ...project,
            email: { $toLower: '$email' },
          },
        },
        {
          $match: { email: email.toLowerCase() },
        },
      ])
      .exec();

    return result[0];
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

  async getBy88Id(id: string) {
    const employee = await this.employeeProvider
      .findOne({ id_8x8: id }, { _id: 1 })
      .lean()
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async checkEmail(emailToCheck: string) {
    const employee = await this.getByEmail(emailToCheck);
    const { email, firstname, lastname } = employee;
    return { email, firstname, lastname };
  }

  async addMicrosoftGraphId(id: number, microsoft_graph_id: string) {
    const exists = await this.employeeProvider.exists({ _id: id }).exec();

    if (!exists) {
      throw new NotFoundException('Employee not found');
    }

    this.employeeProvider
      .findOneAndUpdate({ _id: exists._id }, { $set: { microsoft_graph_id } })
      .exec();

    return {
      success: true,
    };
  }

  getLeaders() {
    return this.employeeProvider
      .find(
        {
          emp_status: { $in: [/^lider/i, /^jefe/i, /^director/i] },
        },
        { emp_status: 1, entityid: 1, _id: 1 },
      )
      .sort('entityid');
  }

  async freeShippingBySalesrep(id: number) {
    const employee = await this.employeeProvider.findOne(
      { _id: id },
      { emp_status: 1 },
    );

    let has_free_shipping = false;

    if (employee.emp_status) {
      has_free_shipping = employee.emp_status
        .toLocaleLowerCase()
        .includes('desarrollo');
    }

    return {
      has_free_shipping,
    };
  }
}

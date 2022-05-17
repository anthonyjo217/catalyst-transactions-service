import { Injectable, NotFoundException } from '@nestjs/common';
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

    // Se valida si el usuario ya existe
    const exists = await this.employeeProvider.exists({ _id: employee._id });
    if (exists) {
      // Si existe se actualiza
      await this.employeeProvider.updateOne(
        { _id: employee._id },
        {
          $set: {
            ...employee,
            email: info.email.toLowerCase(),
          },
        },
      );
    } else {
      // Si no existe se crea y se envia un correo para que cambie la contraseña
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
        email: employee.email.toLowerCase(),
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
      // Si se actualiza la contraseña, se hashea y se guarda
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
    };

    if (withPassword) {
      project['password'] = 1;
    }

    const result = await this.employeeProvider.aggregate([
      {
        $project: {
          ...project,
          email: { $toLower: '$email' },
        },
      },
      {
        $match: {
          email: email.toLowerCase(),
        },
      },
    ]);

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
      .lean();

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
}

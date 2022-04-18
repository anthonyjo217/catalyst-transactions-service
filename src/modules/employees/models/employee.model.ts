import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Employee } from '~core/interfaces/employee.interface';
import { UserModel } from '~core/models/user.model';

@Schema({
  versionKey: false,
})
export class EmployeeModel extends UserModel implements Employee {
  @Prop()
  queue_id_8x8: string;

  @Prop()
  id_8x8: string;

  @Prop()
  recover_password_token: string;

  @Prop()
  password?: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(EmployeeModel);

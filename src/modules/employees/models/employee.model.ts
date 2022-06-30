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

  @Prop({
    default: false,
  })
  is_logged_in: boolean;

  @Prop()
  microsoft_graph_id: string;

  @Prop({ default: null })
  updated_email?: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(EmployeeModel);

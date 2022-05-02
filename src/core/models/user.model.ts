import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { User } from '~core/interfaces/user.interface';

export type UserDocument = UserModel & Document;

/**
 * User Schema
 *
 * @export UserModel
 * @interface UserModel
 */
@Schema({
  timestamps: true,
})
export class UserModel implements User {
  @Prop()
  _id: number;

  @Prop({
    index: true,
    unique: true,
    sparse: true,
  })
  entityid: string;

  @Prop()
  name: string;

  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop({
    index: true,
    sparse: true,
  })
  email: string;

  @Prop({
    index: true,
  })
  mobilephone: string;

  @Prop({
    index: true,
  })
  stage: string;

  @Prop({
    default: false,
  })
  isinactive: boolean;

  @Prop()
  refresh_token: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

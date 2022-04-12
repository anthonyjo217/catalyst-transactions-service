import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Address } from '~core/interfaces/address.interface';

@Schema()
export class AddressModel extends Document implements Address {
  @Prop()
  _id: number;

  @Prop()
  address: string;

  @Prop()
  address_2?: string;

  @Prop()
  address_3?: string;

  @Prop()
  zipcode: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  country: string;

  @Prop()
  defaultbilling: boolean;

  @Prop()
  defaultshipping: boolean;

  @Prop()
  isresidential: boolean;

  @Prop()
  phone: string;

  @Prop()
  addresse: string;

  @Prop()
  key: string;
}

export const AddressSchema = SchemaFactory.createForClass(AddressModel);

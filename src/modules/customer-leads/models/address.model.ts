import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Address } from '~core/interfaces/address.interface';

@Schema()
export class AddressModel extends Document implements Address {
  @Prop()
  _id: number;

  @Prop({
    required: true,
  })
  address: string;

  @Prop()
  address_2?: string;

  @Prop()
  address_3?: string;

  @Prop({
    required: true,
  })
  zipcode: string;

  @Prop({
    required: true,
  })
  city: string;

  @Prop({
    required: true,
  })
  state: string;

  @Prop({
    required: true,
  })
  country: string;

  @Prop({
    required: true,
  })
  defaultbilling: boolean;

  @Prop({
    required: true,
  })
  defaultshipping: boolean;

  @Prop({
    required: true,
  })
  isresidential: boolean;

  @Prop()
  phone: string;

  @Prop({
    required: true,
  })
  addresse: string;

  @Prop({
    required: true,
  })
  key: string;
}

export const AddressSchema = SchemaFactory.createForClass(AddressModel);

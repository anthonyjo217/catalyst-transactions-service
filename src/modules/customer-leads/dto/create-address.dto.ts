import { Expose, Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsPostalCode,
  Length,
  IsBoolean,
  Allow,
  IsNumberString,
} from 'class-validator';

// Estos son los dtos que se usan para crear o actualizar una dirección desde el frontend

export class CreateAddressDTO {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'address' })
  address1: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'address_2' })
  address2?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'address_3' })
  address3?: string;

  @IsPostalCode('US')
  zipcode: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  state: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsBoolean()
  @Expose({ name: 'default_shipping' })
  defaultShipping: boolean;

  @IsBoolean()
  @Expose({ name: 'default_billing' })
  defaultBilling: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'is_residential' })
  isResidential: boolean;

  @IsString()
  @Expose({ name: 'phone' })
  mobilephone: string;

  @IsString()
  @Expose({ name: 'addresse' })
  attention: string;
}

export class CreateLeadAddressDTO {
  @IsNumberString()
  @Transform(({ value }) => `${value}`)
  @Expose({ name: 'user_id' })
  userId: string;

  @IsOptional()
  @Transform(({ value }) => (value ? `${value}` : undefined))
  @Expose({ name: 'address_id' })
  addressId?: string;

  @Allow()
  @Type(() => CreateAddressDTO)
  address: CreateAddressDTO;
}

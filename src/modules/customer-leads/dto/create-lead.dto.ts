import { Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsArray,
  IsMobilePhone,
  IsBoolean,
  IsNumberString,
  ValidateIf,
} from 'class-validator';

export class CreateLeadDTO {
  @IsOptional()
  @IsNumberString()
  @Expose({ name: '_id' })
  id?: string;

  @ValidateIf((object) => !Boolean(object.id))
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'firstname' })
  firstname: string;

  @ValidateIf((object) => !Boolean(object.id))
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'lastname' })
  lastname: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @ValidateIf((object) => !Boolean(object.id))
  @IsMobilePhone(['en-US'])
  mobilephone: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'dreams' })
  custentitydream_1: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Expose({ name: 'dream_in_money' })
  custentity_dream_in_money: number;

  @IsOptional()
  @IsNumberString()
  @Expose({ name: 'salesrep_id' })
  salesrep: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'store_name' })
  custentity_multivendor_store_name?: string;

  // ? Is this field explicit enough?
  @IsOptional()
  @IsInt()
  parent_id: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => CreateAddressDTO)
  addresses: CreateAddressDTO[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'instagram' })
  custentity_instagram_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'twitter' })
  custentity_twitter_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'pinterest' })
  custentity_pinterest_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'facebook' })
  custentity_facebook_id?: string;

  @IsOptional()
  @IsInt()
  @Expose({ name: 'time_zone' })
  custentity_kissts01_time_zone: number;

  @IsOptional()
  @IsString()
  hobbie: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'birthdate' })
  custentity1: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'rango_edad' })
  custentity_rango_edad: string;

  @IsOptional()
  @IsInt()
  @Expose({ name: 'purchase_type' })
  custentity_tipo_1: number;

  @IsOptional()
  @IsInt()
  leadsource: number;

  @IsOptional()
  @IsNumberString()
  @Expose({ name: 'referred_by' })
  custentity10: string;

  @IsOptional()
  @IsMobilePhone()
  homephone: string;

  @IsOptional()
  @IsNumberString()
  custentity_resultado_de_contacto_con_cli: string;

  @IsOptional()
  @IsInt()
  @Expose({ name: 'nacionalidad' })
  custentity_nacionalidad: number;

  @IsOptional()
  @Expose({ name: 'job' })
  custentity_ocupacion: string;

  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'rma_available' })
  custentity_tissiniapp_rma_available: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'state_restriction_override' })
  custentity_state_restriction_override: boolean;

  @IsOptional()
  @IsString()
  @Expose({ name: 'first_child_name' })
  custentity4: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'first_child_birthdate' })
  custentity5: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'second_child_name' })
  custentity6: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'second_child_birthdate' })
  custentity8: string;
}

export class CreateAddressDTO {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'address' })
  address: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'address_2' })
  address2?: string;

  @IsOptional()
  @IsString()
  @Expose({ name: 'address_3' })
  address3?: string;

  @IsString()
  zipcode: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  state: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'defaultshipping' })
  defaultShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'defaultbilling' })
  defaultBilling?: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose({ name: 'isresidential' })
  isResidential?: boolean;

  @IsString()
  @Expose({ name: 'phone' })
  mobilephone: string;

  @IsString()
  @Expose({ name: 'addresse' })
  attention: string;
}

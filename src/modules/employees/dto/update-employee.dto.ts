import { IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDTO {
  @IsOptional()
  @IsString()
  password: string;
}

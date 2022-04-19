import { IsString } from 'class-validator';

export class RecoverPasswordDTO {
  @IsString()
  password: string;

  @IsString()
  token: string;
}

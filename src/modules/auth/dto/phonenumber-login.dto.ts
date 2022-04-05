import { IsString } from 'class-validator';
import { LoginDTO } from './login.dto';

export class PhonenumberLoginDTO implements Omit<LoginDTO, 'password'> {
  @IsString()
  username: string;
}

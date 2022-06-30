import { IsInt } from 'class-validator';

export class RefreshDataDTO {
  @IsInt()
  id: number;
}

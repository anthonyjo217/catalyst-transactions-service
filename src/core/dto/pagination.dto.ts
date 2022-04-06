import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class Pagination {
  @Transform(({ value }) => Number(value))
  page: number;

  @Transform(({ value }) => Number(value))
  limit: number;

  @IsOptional()
  @IsString()
  query: string;
}

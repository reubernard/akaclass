import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateClassLevelDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsInt()
  @Min(1)
  order!: number;
}
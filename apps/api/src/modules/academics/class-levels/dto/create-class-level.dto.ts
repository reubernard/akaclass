import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateClassLevelDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  order!: number;
}
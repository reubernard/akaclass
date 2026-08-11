import { IsString, MinLength } from 'class-validator';

export class CreateClassArmDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  code!: string;
}
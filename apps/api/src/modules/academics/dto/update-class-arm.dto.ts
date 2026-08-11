import {
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateClassArmDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;
}
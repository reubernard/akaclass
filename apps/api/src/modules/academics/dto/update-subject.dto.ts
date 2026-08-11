import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(30)
  code?: string;

  @IsBoolean()
  @IsOptional()
  isCore?: boolean;
}
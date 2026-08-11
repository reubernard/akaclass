import {
  IsDateString,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

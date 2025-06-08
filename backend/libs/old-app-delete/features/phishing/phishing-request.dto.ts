import { IsEmail, IsMongoId } from 'class-validator';

export class PhishingRequestDto {
  @IsEmail()
  email: string;

  @IsMongoId()
  id?: string;
}

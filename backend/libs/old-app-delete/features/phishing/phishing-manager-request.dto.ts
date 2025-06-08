import { IsEmail } from 'class-validator';

export class PhishingManagerRequestDto {
  @IsEmail()
  email: string;
}

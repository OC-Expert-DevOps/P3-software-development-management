import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'L\'email doit être valide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  email!: string;

  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password!: string;
}

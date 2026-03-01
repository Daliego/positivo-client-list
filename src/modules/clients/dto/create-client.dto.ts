import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome completo do cliente',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'maria@empresa.com',
    description: 'Email do cliente (deve ser único)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '35655874075',
    description: 'CPF (11 dígitos) ou CNPJ (14 dígitos), apenas números',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11,14}$/, {
    message:
      'document must contain only digits and be 11 (CPF) or 14 (CNPJ) characters long',
  })
  document: string;
}

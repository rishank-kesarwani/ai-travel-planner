import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UpdatePreferencesDto } from '../../users/dto/update-user.dto';

export class RegisterDto {
  @ApiProperty({ example: 'Rishank K' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'rishank@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ type: () => UpdatePreferencesDto })
  @IsOptional()
  preferences?: UpdatePreferencesDto;
}

export class LoginDto {
  @ApiProperty({ example: 'rishank@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token if not passed in cookie' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

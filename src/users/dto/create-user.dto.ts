import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '../../onboarding-token/dto/create-onboarding-token.dto';

export class CreateUserDto {
  @ApiProperty()
  password: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional({ enum: AccountType })
  accountType?: AccountType;

  @ApiProperty()
  privateKeyEncWithPassword: string;

  @ApiProperty()
  privateKeyEncWithRecovery: string;

  @ApiPropertyOptional()
  recoveryPassword?: string;

  @ApiPropertyOptional()
  addressString?: string;
}

export class CreateUserRegisterDto {
  @ApiProperty()
  password: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  onboardingToken: string;

  @ApiProperty()
  privateKeyEncWithPassword: string;

  @ApiProperty()
  privateKeyEncWithRecovery: string;

  @ApiPropertyOptional()
  recoveryPassword?: string;

  @ApiPropertyOptional()
  addressString?: string;
}

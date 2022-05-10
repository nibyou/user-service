import { ApiProperty } from '@nestjs/swagger';

export enum AccountType {
  PATIENT = 'PATIENT',
  PRACTITIONER = 'PRACTITIONER',
}

export class CreateOnboardingTokenDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  validUntil: Date;

  @ApiProperty({ enum: AccountType })
  accountType: AccountType;
}

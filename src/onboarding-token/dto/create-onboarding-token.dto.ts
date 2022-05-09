import { ApiProperty } from '@nestjs/swagger';

export class CreateOnboardingTokenDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  validUntil: Date;
}

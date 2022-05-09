import { PartialType } from '@nestjs/swagger';
import { CreateOnboardingTokenDto } from './create-onboarding-token.dto';

export class UpdateOnboardingTokenDto extends PartialType(
  CreateOnboardingTokenDto,
) {}

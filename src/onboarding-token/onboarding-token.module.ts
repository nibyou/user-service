import { Module } from '@nestjs/common';
import { OnboardingTokenService } from './onboarding-token.service';
import { OnboardingTokenController } from './onboarding-token.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemata/user.schema';
import {
  OnboardingToken,
  OnboardingTokenSchema,
} from './schemata/onboarding-token.schema';

@Module({
  controllers: [OnboardingTokenController],
  providers: [OnboardingTokenService],
  exports: [OnboardingTokenService],
  imports: [
    MongooseModule.forFeature([
      { name: OnboardingToken.name, schema: OnboardingTokenSchema },
    ]),
  ],
})
export class OnboardingTokenModule {}

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemata/user.schema';
import {
  OnboardingToken,
  OnboardingTokenSchema,
} from '../onboarding-token/schemata/onboarding-token.schema';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: OnboardingToken.name, schema: OnboardingTokenSchema },
    ]),
  ],
  exports: [UsersService],
})
export class UsersModule {}

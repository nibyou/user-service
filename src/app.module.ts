import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KeycloakModule } from '@nibyou/keycloak';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingTokenModule } from './onboarding-token/onboarding-token.module';

const mongoOptions = {
  user: process.env.MONGO_USER || '',
  pass: process.env.MONGO_PASS || '',
};

@Module({
  imports: [
    KeycloakModule,
    UsersModule,
    MongooseModule.forRoot(process.env.MONGO_URL, mongoOptions),
    OnboardingTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

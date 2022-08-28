import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AccountType,
  CreateOnboardingTokenDto,
} from './dto/create-onboarding-token.dto';
import {
  OnboardingToken,
  OnboardingTokenDocument,
} from './schemata/onboarding-token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthUser } from '@nibyou/types';
import { filterInactive } from '../query-helpers/global.query-helpers';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import fetch from 'node-fetch';

@Injectable()
export class OnboardingTokenService {
  private readonly kcAdminClient: KcAdminClient;
  constructor(
    @InjectModel(OnboardingToken.name)
    private readonly onboardingTokenModel: Model<OnboardingTokenDocument>,
  ) {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_URL,
      realmName: process.env.KEYCLOAK_ADMIN_REALM,
    });
  }

  async create(
    createOnboardingTokenDto: CreateOnboardingTokenDto,
    user: AuthUser,
  ): Promise<OnboardingToken> {
    if (!AuthUser.isAdmin(user)) {
      createOnboardingTokenDto.accountType = AccountType.PATIENT; // ignore account type if not admin
    }

    const onboardingToken = new this.onboardingTokenModel(
      createOnboardingTokenDto,
    );

    await this.kcAdminClient.auth({
      username: process.env.KEYCLOAK_ADMIN_USER,
      password: process.env.KEYCLOAK_ADMIN_PASS,
      grantType: 'password',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT,
    });

    const accessToken = await this.kcAdminClient.getAccessToken();

    const emailBody = {
      to: [
        {
          email: onboardingToken.email,
          name: onboardingToken.email,
        },
      ],
      templateId: +process.env.MAIL_TEMPLATE_ONBOARDING_PRACTITIONER,
      params: {
        TOKEN: onboardingToken._id,
        PRACTICE_NAME: '',
      },
    };

    if (createOnboardingTokenDto.accountType === AccountType.PATIENT) {
      emailBody.params.PRACTICE_NAME = 'Nibyou';
      emailBody.templateId = +process.env.MAIL_TEMPLATE_ONBOARDING_PATIENT;
    }

    let email = await fetch(process.env.MAIL_SERVICE_BASE_URL + '/email', {
      method: 'POST',
      body: JSON.stringify(emailBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    email = await email.json();

    console.log(email.data);

    return onboardingToken.save();
  }

  async findAll(user: AuthUser): Promise<OnboardingToken[]> {
    if (AuthUser.isAdmin(user)) {
      return this.onboardingTokenModel.find({ ...filterInactive });
    }
  }

  async findOne(id: string): Promise<OnboardingToken> {
    try {
      const token = await this.onboardingTokenModel.findOne({
        _id: id,
        ...filterInactive,
      });
      if (token) {
        return token;
      }
    } catch (e) {
      throw new HttpException(
        'Invalid onboarding token',
        HttpStatus.BAD_REQUEST,
      );
    }
    throw new HttpException('Invalid onboarding token', HttpStatus.BAD_REQUEST);
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    if (AuthUser.isAdmin(user)) {
      await this.onboardingTokenModel.findOneAndDelete({ _id: id });
    }
  }
}

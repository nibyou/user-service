import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOnboardingTokenDto } from './dto/create-onboarding-token.dto';
import { UpdateOnboardingTokenDto } from './dto/update-onboarding-token.dto';
import {
  OnboardingToken,
  OnboardingTokenDocument,
} from './schemata/onboarding-token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthUser, JsonResponse } from '@nibyou/types';
import { filterInactive } from '../query-helpers/global.query-helpers';

@Injectable()
export class OnboardingTokenService {
  constructor(
    @InjectModel(OnboardingToken.name)
    private readonly onboardingTokenModel: Model<OnboardingTokenDocument>,
  ) {}

  async create(
    createOnboardingTokenDto: CreateOnboardingTokenDto,
    user: AuthUser,
  ): Promise<OnboardingToken> {
    if (AuthUser.isAdmin(user)) {
      const onboardingToken = new this.onboardingTokenModel(
        createOnboardingTokenDto,
      );
      return onboardingToken.save();
    }
  }

  async findAll(user: AuthUser): Promise<OnboardingToken[]> {
    if (AuthUser.isAdmin(user)) {
      return this.onboardingTokenModel.find({ ...filterInactive });
    }
  }

  async findOne(id: string, user: AuthUser): Promise<OnboardingToken> {
    if (AuthUser.isAdmin(user)) {
      return this.onboardingTokenModel.findOne({ _id: id, ...filterInactive });
    }
  }

  update(id: number, updateOnboardingTokenDto: UpdateOnboardingTokenDto) {
    throw new HttpException('Not Implemented', HttpStatus.NOT_IMPLEMENTED);
  }

  async remove(id: string, user: AuthUser): Promise<JsonResponse> {
    if (AuthUser.isAdmin(user)) {
      await this.onboardingTokenModel.findOneAndDelete({ _id: id });
      return new JsonResponse().setMessage('Onboarding Token Deleted');
    }
  }
}

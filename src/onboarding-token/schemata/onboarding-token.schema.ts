import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GlobalStatus } from '@nibyou/types';
import { AccountType } from '../dto/create-onboarding-token.dto';

export type OnboardingTokenDocument = OnboardingToken & Document;

@Schema()
export class OnboardingToken {
  @Prop({ required: true })
  @ApiProperty()
  email: string;

  @Prop({ type: () => GlobalStatus, default: GlobalStatus.ACTIVE })
  @ApiProperty()
  status: GlobalStatus;

  @Prop({ required: true })
  @ApiProperty()
  validUntil: Date;

  @Prop({ required: true, type: () => AccountType })
  @ApiProperty()
  accountType: AccountType;
}

export const OnboardingTokenSchema =
  SchemaFactory.createForClass(OnboardingToken);

import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GlobalStatus } from '@nibyou/types';

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
}

export const OnboardingTokenSchema =
  SchemaFactory.createForClass(OnboardingToken);

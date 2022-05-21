import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GlobalStatus } from '@nibyou/types';

export type InvoiceInformationDocument = InvoiceInformation & Document;

@Schema()
export class InvoiceInformation {
  @Prop({ required: true })
  @ApiProperty()
  email: string;

  @Prop({ type: () => GlobalStatus, default: GlobalStatus.ACTIVE })
  @ApiProperty()
  status: GlobalStatus;

  @Prop({ required: true })
  @ApiProperty()
  validUntil: Date;

  @Prop({ required: true })
  @ApiProperty()
  createdAt: Date;

  @Prop({ required: true, type: () => PhysicalAddress })
  @ApiProperty()
  physicalAddress: PhysicalAddress;
}

export const InvoiceInformationSchema =
  SchemaFactory.createForClass(InvoiceInformation);

export class PhysicalAddress {
  @Prop()
  @ApiProperty()
  name: string;

  @Prop()
  @ApiProperty()
  attn: string;

  @Prop()
  @ApiProperty()
  street: string;

  @Prop()
  @ApiProperty()
  city: string;

  @Prop()
  @ApiProperty()
  state: string;

  @Prop()
  @ApiProperty()
  zip: string;

  @Prop()
  @ApiProperty()
  country: string;
}
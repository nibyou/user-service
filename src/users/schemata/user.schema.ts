import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GlobalStatus } from '@nibyou/types';

export type UserDocument = User & Document;

export class PrivateKey {
  @Prop()
  @ApiProperty()
  encWithPassword: string;

  @Prop()
  @ApiProperty()
  encWithRecovery: string;
}

export class SymmetricKey {
  @Prop()
  @ApiProperty()
  encWithPublicKey: string;

  @Prop()
  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  keyId: string;
}

export class CryptoData {
  @Prop({ type: () => PrivateKey })
  @ApiProperty({ type: PrivateKey })
  privateKey: PrivateKey;

  @Prop({ type: () => [SymmetricKey], nullable: true })
  @ApiPropertyOptional({ type: [SymmetricKey] })
  symKeys: SymmetricKey[];
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  @ApiProperty()
  email: string;

  @Prop({ required: true })
  @ApiProperty()
  firstName: string;

  @Prop({ required: true })
  @ApiProperty()
  lastName: string;

  @Prop({ type: () => GlobalStatus, default: GlobalStatus.PENDING })
  @ApiProperty()
  status: GlobalStatus;

  @Prop()
  @ApiProperty()
  keycloakId: string;

  @Prop()
  @ApiProperty()
  cryptoData: CryptoData;

  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  _id: string;

  @Prop()
  @ApiProperty()
  createdAt: Date;

  @Prop()
  @ApiProperty()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

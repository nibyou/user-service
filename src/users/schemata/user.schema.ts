import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GlobalStatus } from '@nibyou/types';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  @ApiProperty()
  email: string;

  @Prop({ required: true })
  @ApiProperty()
  firstName: string;

  @Prop({ required: true })
  @ApiProperty()
  lastName: string;

  @Prop({
    default(): any {
      return new Date().toISOString();
    },
  })
  @ApiProperty()
  createdAt: Date;

  @Prop()
  @ApiProperty()
  updatedAt: Date;

  @Prop({ type: () => GlobalStatus, default: GlobalStatus.PENDING })
  @ApiProperty()
  status: GlobalStatus;

  @Prop()
  @ApiProperty()
  keycloakId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class AddProfileUpdateDto {
  @ApiProperty()
  profileId: string;
  @ApiProperty()
  type: 'practitioner' | 'profile';
}

export class UpdateUserEmailDto {
  @ApiProperty()
  email: string;
}

export class UpdateUserNameDto {
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
}

export class UpdateUserPrivateKeyDto {
  @ApiProperty()
  privateKeyEncWithPassword: string;
  @ApiProperty()
  privateKeyEncWithRecovery: string;
}

export class AddSymKeyDto {
  @ApiProperty()
  encWithPublicKey: string;
  @ApiProperty()
  keyId: string;
}

export class RemoveSymKeyDto {
  @ApiProperty()
  keyId: string;
}

export class RemoveUserProfileDto {
  @ApiProperty()
  profileId: string;
}

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class AddProfileUpdateDto {
  @ApiProperty()
  profileId: string;
  @ApiProperty()
  type: 'practitioner' | 'profile';
}

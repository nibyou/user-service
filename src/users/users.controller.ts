import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserRegisterDto } from './dto/create-user.dto';
import {
  AddProfileUpdateDto,
  AddSymKeyDto,
  RemoveSymKeyDto,
  RemoveUserProfileDto,
  UpdateUserDto,
  UpdateUserEmailDto,
  UpdateUserNameDto,
  UpdateUserPrivateKeyDto,
} from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { AuthUser, JsonResponse, RealmRoles } from '@nibyou/types';
import { User } from './schemata/user.schema';
import {
  CreateRequest,
  DeleteRequest,
  ReadRequest,
  UpdateRequest,
} from '@nibyou/types';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @CreateRequest({
    summary: 'Create a new User',
    description: 'The user has been successfully created.',
    returnType: User,
    roles: [RealmRoles.ADMIN],
  })
  create(
    @Body() createUserDto: CreateUserDto,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<User> {
    return this.usersService.create(createUserDto, user);
  }

  @CreateRequest({
    path: 'register',
    summary: 'Let a user register their account',
    description: 'The user has been successfully created.',
    returnType: User,
    roles: false, // register is public
  })
  register(
    @Body() createUserRegisterDto: CreateUserRegisterDto,
  ): Promise<User> {
    return this.usersService.register(createUserRegisterDto);
  }

  @ReadRequest({
    summary: 'Find all users',
    description: 'The list of users has been successfully returned.',
    returnType: [User],
    roles: [RealmRoles.ADMIN],
  })
  findAll(@AuthenticatedUser() user: AuthUser): Promise<User[]> {
    return this.usersService.findAll(user);
  }

  @ReadRequest({
    path: 'me',
    summary: 'Find a single user',
    description: 'The user has been successfully returned.',
    returnType: User,
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PRACTITIONER,
      RealmRoles.USER_PATIENT,
    ],
  })
  findMe(@AuthenticatedUser() user: AuthUser): Promise<User> {
    return this.usersService.findMe(user);
  }

  @ReadRequest({
    path: ':id',
    summary: 'Find a single user',
    description: 'The user has been successfully returned.',
    returnType: User,
    roles: [RealmRoles.ADMIN],
  })
  findOne(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<User> {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UpdateRequest({
    path: ':id/email',
    summary: "Update a user's email",
    description: "The user's email has been updated.",
    returnType: User,
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PATIENT,
      RealmRoles.USER_PRACTITIONER,
    ],
  })
  updateEmail(
    @Param('id') id: string,
    @Body() dto: UpdateUserEmailDto,
    @AuthenticatedUser() user: AuthUser,
  ) {
    if (AuthUser.isAdmin(user) || id === user.userId)
      return this.usersService.updateEmail(id, dto);
    else throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
  }

  @UpdateRequest({
    path: ':id/name',
    summary: "Update a user's name",
    description: "The user's name has been updated.",
    returnType: User,
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PATIENT,
      RealmRoles.USER_PRACTITIONER,
    ],
  })
  updateName(
    @Param('id') id: string,
    @Body() dto: UpdateUserNameDto,
    @AuthenticatedUser() user: AuthUser,
  ) {
    if (AuthUser.isAdmin(user) || id === user.userId)
      return this.usersService.updateName(id, dto);
    else throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
  }

  @UpdateRequest({
    path: ':id/private-key',
    summary: "Update a user's private key",
    description: "The user's private key has been updated.",
    returnType: User,
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PATIENT,
      RealmRoles.USER_PRACTITIONER,
    ],
  })
  updatePrivateKey(
    @Param('id') id: string,
    @Body() dto: UpdateUserPrivateKeyDto,
    @AuthenticatedUser() user: AuthUser,
  ) {
    if (AuthUser.isAdmin(user) || id === user.userId)
      return this.usersService.updatePrivateKey(id, dto);
  }

  @CreateRequest({
    path: ':id/symmetric-key',
    summary: 'Add a new symmetric key to a user',
    description: 'The symmetric key has been added to the user',
    returnType: User,
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PATIENT,
      RealmRoles.USER_PRACTITIONER,
    ],
  })
  addSymmetricKey(@Param('id') id: string, @Body() dto: AddSymKeyDto) {
    return this.usersService.addSymmetricKey(id, dto);
  }

  @DeleteRequest({
    path: ':id/symmetric-key',
    summary: 'Remove a symmetric key from a user',
    description: 'The symmetric key has been removed from the user',
    returnType: User,
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PATIENT,
      RealmRoles.USER_PRACTITIONER,
    ],
  })
  removeSymmetricKey(
    @Param('id') id: string,
    @Body() dto: RemoveSymKeyDto,
    @AuthenticatedUser() user: AuthUser,
  ) {
    if (AuthUser.isAdmin(user) || id === user.userId)
      return this.usersService.removeSymmetricKey(id, dto);
    else throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
  }

  @CreateRequest({
    path: ':id/profile',
    summary: 'Add a new profile/practitioner to a user',
    description: 'The profile has been successfully added to the user.',
    returnType: User,
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PATIENT,
      RealmRoles.USER_PRACTITIONER,
    ],
  })
  addProfile(
    @Param('id') id: string,
    @Body() updates: AddProfileUpdateDto,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<User> {
    if (AuthUser.isAdmin(user) || id === user.userId)
      return this.usersService.addProfile(id, updates.profileId, updates.type);
    else throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
  }

  @DeleteRequest({
    path: ':id/profile',
    summary: 'Remove a profile/practitioner from a user',
    description:
      'The profile/practitioner has been successfully removed from the user.',
    returnType: User,
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PATIENT,
      RealmRoles.USER_PRACTITIONER,
    ],
  })
  removeProfile(
    @Param('id') id: string,
    @Body() body: RemoveUserProfileDto,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<User> {
    if (AuthUser.isAdmin(user) || id === user.userId)
      return this.usersService.removeProfile(id, body);
    else throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
  }

  @DeleteRequest({
    path: ':id',
    summary: 'Delete a user',
    description: 'The user has been successfully deleted.',
    returnType: JsonResponse,
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PRACTITIONER,
      RealmRoles.USER_PATIENT,
    ],
  })
  remove(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<JsonResponse> {
    if (!AuthUser.isAdmin(user) && id !== user.userId)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    //return this.usersService.remove(id, user);
    return this.usersService.markDeleted(id, user);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserRegisterDto } from './dto/create-user.dto';
import { AddProfileUpdateDto, UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { AuthUser, JsonResponse, RealmRoles } from '@nibyou/types';
import { User } from './schemata/user.schema';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Roles({ roles: [RealmRoles.ADMIN] })
  create(
    @Body() createUserDto: CreateUserDto,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<User> {
    return this.usersService.create(createUserDto, user);
  }

  @Post('/register')
  @ApiOperation({
    summary: 'Let a user register their account',
  })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  @Public() // register is public
  register(
    @Body() createUserRegisterDto: CreateUserRegisterDto,
  ): Promise<User> {
    return this.usersService.register(createUserRegisterDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Find all users',
  })
  @ApiOkResponse({
    description: 'The list of users has been successfully returned.',
    type: [User],
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Roles({ roles: [RealmRoles.ADMIN] })
  findAll(@AuthenticatedUser() user: AuthUser): Promise<User[]> {
    return this.usersService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Find a single user',
  })
  @ApiOkResponse({
    description: 'The user has been successfully returned.',
    type: User,
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Roles({ roles: [RealmRoles.ADMIN] })
  findOne(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<User> {
    return this.usersService.findOne(id, user);
  }

  @Get('/me')
  @ApiOperation({
    summary: 'Get the current user',
  })
  @ApiOkResponse({
    description: 'The user has been successfully returned.',
    type: User,
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Roles({
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PRACTITIONER,
      RealmRoles.USER_PATIENT,
    ],
  })
  findMe(@AuthenticatedUser() user: AuthUser): Promise<User> {
    return this.usersService.findMe(user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/profile')
  @ApiOperation({
    summary: 'Add a new profile/practitioner to a user',
  })
  @ApiOkResponse({
    description: 'The user has been successfully deleted.',
    type: User,
  })
  @ApiBody({ type: AddProfileUpdateDto })
  @Roles({
    roles: [
      RealmRoles.ADMIN,
      RealmRoles.USER_PATIENT,
      RealmRoles.USER_PRACTITIONER,
    ],
  })
  addProfile(
    @Param('id') id: string,
    @Body() updates: AddProfileUpdateDto,
  ): Promise<User> {
    return this.usersService.addProfile(id, updates.profileId, updates.type);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
  })
  @ApiOkResponse({
    description: 'The user .',
    type: JsonResponse,
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Roles({ roles: [RealmRoles.ADMIN] })
  remove(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<JsonResponse> {
    //return this.usersService.remove(id, user);
    return this.usersService.markDeleted(id, user);
  }
}

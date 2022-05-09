import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserRegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';
import { AuthUser, JsonResponse, RealmRoles } from '@nibyou/types';
import { User } from './schemata/user.schema';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @HttpCode(201)
  @Roles({ roles: [RealmRoles.ADMIN] })
  create(
    @Body() createUserDto: CreateUserDto,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<User> {
    return this.usersService.create(createUserDto, user);
  }

  @Post('/register')
  @ApiCreatedResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: User,
  })
  @HttpCode(201)
  @Public() // register is public
  register(
    @Body() createUserRegisterDto: CreateUserRegisterDto,
  ): Promise<User> {
    return this.usersService.register(createUserRegisterDto);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'The list of users has been successfully returned.',
    type: [User],
  })
  @HttpCode(200)
  @Roles({ roles: [RealmRoles.ADMIN] })
  findAll(@AuthenticatedUser() user: AuthUser): Promise<User[]> {
    return this.usersService.findAll(user);
  }

  @Get(':id')
  @ApiOkResponse({
    status: 200,
    description: 'The user has been successfully returned.',
    type: User,
  })
  @HttpCode(200)
  @Roles({ roles: [RealmRoles.ADMIN] })
  findOne(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<User> {
    return this.usersService.findOne(id, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOkResponse({
    status: 200,
    description: 'The user .',
    type: JsonResponse,
  })
  @HttpCode(200)
  @Roles({ roles: [RealmRoles.ADMIN] })
  remove(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<JsonResponse> {
    //return this.usersService.remove(id, user);
    return this.usersService.markDeleted(id, user);
  }
}

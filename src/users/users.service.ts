import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, CreateUserRegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUser, GlobalStatus, JsonResponse } from '@nibyou/types';
import { User, UserDocument } from './schemata/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import {
  filterDeleted,
  filterInactive,
} from '../query-helpers/global.query-helpers';
import {
  OnboardingToken,
  OnboardingTokenDocument,
} from '../onboarding-token/schemata/onboarding-token.schema';

@Injectable()
export class UsersService {
  private readonly kcAdminClient: KcAdminClient;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(OnboardingToken.name)
    private readonly onboardingTokenModel: Model<OnboardingTokenDocument>,
  ) {
    this.kcAdminClient = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_URL,
      realmName: process.env.KEYCLOAK_ADMIN_REALM,
    });
  }

  async register(createUserRegisterDto: CreateUserRegisterDto): Promise<User> {
    await this.kcAdminClient.auth({
      username: process.env.KEYCLOAK_ADMIN_USER,
      password: process.env.KEYCLOAK_ADMIN_PASS,
      grantType: 'password',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT,
    });

    if (await this.doesUserExist(createUserRegisterDto.email)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    try {
      const onboardingToken = await this.onboardingTokenModel.findOne({
        ...filterInactive,
        _id: createUserRegisterDto.onboardingToken,
        email: createUserRegisterDto.email,
        validUntil: { $gt: new Date() },
      });

      if (!onboardingToken) {
        throw 'does not exist';
      }

      await this.onboardingTokenModel.deleteOne({
        _id: createUserRegisterDto.onboardingToken,
      });
    } catch (error) {
      console.log('error in getting onboarding token', error);
      throw new HttpException(
        'Invalid onboarding token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = new this.userModel(createUserRegisterDto);
    const userReturn = await newUser.save();
    const id = userReturn._id;

    const kcResponse = await this.kcAdminClient.users.create({
      username: createUserRegisterDto.email,
      email: createUserRegisterDto.email,
      credentials: [
        {
          type: 'password',
          value: createUserRegisterDto.password,
          temporary: false,
        },
      ],
      attributes: {
        userId: id,
      },
      firstName: createUserRegisterDto.firstName,
      lastName: createUserRegisterDto.lastName,
      realm: process.env.KEYCLOAK_REALM,
    });
    console.log(kcResponse);
    return userReturn;
  }

  async create(createUserDto: CreateUserDto, user: AuthUser): Promise<User> {
    if (AuthUser.isAdmin(user)) {
      await this.kcAdminClient.auth({
        username: process.env.KEYCLOAK_ADMIN_USER,
        password: process.env.KEYCLOAK_ADMIN_PASS,
        grantType: 'password',
        clientId: process.env.KEYCLOAK_ADMIN_CLIENT,
      });

      if (await this.doesUserExist(createUserDto.email)) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      console.log('Creating user');
      const newUser = new this.userModel(createUserDto);
      const userReturn = await newUser.save();
      const id = userReturn._id;

      console.log('Created user', userReturn, id);

      const kcResponse = await this.kcAdminClient.users.create({
        username: createUserDto.email,
        email: createUserDto.email,
        credentials: [
          {
            type: 'password',
            value: createUserDto.password,
            temporary: false,
          },
        ],
        attributes: {
          userId: id,
        },
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        realm: process.env.KEYCLOAK_REALM,
      });
      console.log(kcResponse);
      return userReturn;
    }
  }

  async findAll(user: AuthUser): Promise<User[]> {
    if (AuthUser.isAdmin(user)) {
      return this.userModel.find({ ...filterDeleted });
    }
  }

  async findOne(id: string, user: AuthUser): Promise<User> {
    if (AuthUser.isAdmin(user)) {
      return this.userModel.findOne({ _id: id, ...filterDeleted });
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    throw new HttpException('Not implemented', HttpStatus.NOT_IMPLEMENTED);
  }

  async remove(id: string, user: AuthUser) {
    if (AuthUser.isAdmin(user)) {
      await this.userModel.deleteOne({ _id: id });
      return new JsonResponse().setMessage('User deleted');
    }
  }

  async markDeleted(id: string, user: AuthUser) {
    if (AuthUser.isAdmin(user)) {
      await this.userModel.updateOne(
        { _id: id, ...filterDeleted },
        { status: GlobalStatus.DELETED },
      );
      return new JsonResponse().setMessage('User deleted');
    }
  }

  private async doesUserExist(email: string) {
    const userExistsMongo = await this.userModel.findOne({
      email: email,
    });

    const allUsers = await this.kcAdminClient.users.find({
      realm: process.env.KEYCLOAK_REALM,
    });

    const userExistsKeycloak = allUsers.find((u) => u.email === email);

    return userExistsMongo || userExistsKeycloak;
  }
}

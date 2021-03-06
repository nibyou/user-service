import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, CreateUserRegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  AuthUser,
  GlobalStatus,
  JsonResponse,
  RealmRoles,
} from '@nibyou/types';
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
import { AccountType } from '../onboarding-token/dto/create-onboarding-token.dto';
import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import fetch from 'node-fetch';

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
      realmName: process.env.KEYCLOAK_UM_REALM,
    });
  }

  async register(createUserRegisterDto: CreateUserRegisterDto): Promise<User> {
    let onboardingToken: OnboardingTokenDocument;

    try {
      onboardingToken = await this.onboardingTokenModel.findOne({
        ...filterInactive,
        ...filterDeleted,
        _id: createUserRegisterDto.onboardingToken,
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

    const dto: CreateUserDto = {
      ...createUserRegisterDto,
      accountType: onboardingToken.accountType,
    };

    return this.addNewUser(dto);
  }

  async create(createUserDto: CreateUserDto, user: AuthUser): Promise<User> {
    if (AuthUser.isAdmin(user)) {
      return this.addNewUser(createUserDto);
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

  async findMe(user: AuthUser): Promise<User> {
    return this.userModel.findOne({ _id: user.userId, ...filterDeleted });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    throw new HttpException('Not implemented', HttpStatus.NOT_IMPLEMENTED);
  }

  async addProfile(
    id: string,
    profileId: string,
    type: 'profile' | 'practitioner',
  ) {
    let user: UserDocument;
    try {
      user = await this.userModel.findOne({ _id: id });
    } catch (e) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (type === 'profile') {
      if (!user.profiles) user.profiles = [];
      user.profiles = [...user.profiles, profileId];
    } else if (type === 'practitioner') {
      if (!user.practitioners) user.practitioners = [];
      user.practitioners = [...user.practitioners, profileId];
    }
    await user.save();
    return user;
  }

  async remove(id: string, user: AuthUser) {
    if (AuthUser.isAdmin(user)) {
      const userToDelete = await this.userModel.findOneAndDelete({ _id: id });
      await this.kcAdminClient.users.del({
        realm: process.env.KEYCLOAK_REALM,
        id: userToDelete.keycloakId,
      });
      return new JsonResponse().setMessage('User deleted');
    }
  }

  async markDeleted(id: string, user: AuthUser) {
    if (AuthUser.isAdmin(user)) {
      const userToDelete = await this.userModel.findOneAndUpdate(
        { _id: id, ...filterDeleted },
        { status: GlobalStatus.DELETED },
      );

      await this.kcAdminClient.users.del({
        realm: process.env.KEYCLOAK_REALM,
        id: userToDelete.keycloakId,
      });

      return new JsonResponse().setMessage('User deleted');
    }
  }

  private async doesUserExist(
    email: string,
    kcAC: KcAdminClient = this.kcAdminClient,
  ): Promise<boolean> {
    const userExistsMongo = await this.userModel.findOne({
      email: email,
    });
    const allUsers = await kcAC.users.find({
      realm: process.env.KEYCLOAK_REALM,
      email,
    });

    const userExistsKeycloak = allUsers.find((u) => u.email === email);

    return !!userExistsMongo || !!userExistsKeycloak;
  }

  private async addNewUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      await this.kcAdminClient.auth({
        username: process.env.KEYCLOAK_UM_USER,
        password: process.env.KEYCLOAK_UM_PASS,
        grantType: 'password',
        clientId: process.env.KEYCLOAK_UM_CLIENT,
      });
    } catch (e) {
      console.log('error in authing to keycloak', e);
      throw new HttpException(
        'Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (await this.doesUserExist(createUserDto.email, this.kcAdminClient)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    (createUserDto as any).cryptoData = {
      privateKey: {
        encWithPassword: createUserDto.privateKeyEncWithPassword,
        encWithRecovery: createUserDto.privateKeyEncWithRecovery,
      },
    };

    delete createUserDto.privateKeyEncWithRecovery;
    delete createUserDto.privateKeyEncWithPassword;

    const newUser = new this.userModel(createUserDto);
    const userReturn = await newUser.save().catch((error) => {
      console.log('error in saving user', error);
      throw new HttpException(
        'Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
    const id = userReturn._id;

    const userRep = {
      username: createUserDto.email,
      email: createUserDto.email,
      enabled: true,
      emailVerified: true,
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
    };

    const kcResponse = await this.kcAdminClient.users
      .create(userRep)
      .catch((error) => {
        console.log('error in creating kc user', error);
        throw new HttpException(
          'Something went wrong.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    const roles: RoleMappingPayload[] = [];

    const patientRole = await this.kcAdminClient.roles.findOneByName({
      realm: process.env.KEYCLOAK_REALM,
      name: RealmRoles.USER_PATIENT.split(':')[1],
    });

    const practitionerRole = await this.kcAdminClient.roles.findOneByName({
      realm: process.env.KEYCLOAK_REALM,
      name: RealmRoles.USER_PRACTITIONER.split(':')[1],
    });

    if (createUserDto.accountType === AccountType.PRACTITIONER) {
      roles.push(practitionerRole as RoleMappingPayload);
    } else if (createUserDto.accountType === AccountType.PATIENT) {
      roles.push(patientRole as RoleMappingPayload);
    }

    try {
      await this.kcAdminClient.users.addRealmRoleMappings({
        id: kcResponse.id,
        roles,
        realm: process.env.KEYCLOAK_REALM,
      });
    } catch (error) {
      console.log('error in adding roles', error);
      throw new HttpException(
        'Something went wrong.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.userModel
      .updateOne(
        { _id: id, ...filterDeleted },
        {
          $set: {
            keycloakId: kcResponse.id,
            status: GlobalStatus.ACTIVE,
          },
        },
      )
      .catch((error) => {
        console.log('error in updating user', error);
        throw new HttpException(
          'Something went wrong.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });

    if (createUserDto.addressString && createUserDto.recoveryPassword) {
      const accessToken = await this.kcAdminClient.getAccessToken();
      const letter = {
        name: `${createUserDto.firstName} ${createUserDto.lastName}`,
        address: createUserDto.addressString,
        recoveryPassword: createUserDto.recoveryPassword,
      };

      await fetch(
        process.env.MAIL_SERVICE_BASE_URL + '/letter/onboarding-letter',
        {
          method: 'POST',
          body: JSON.stringify(letter),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    }
    userReturn.keycloakId = kcResponse.id;
    userReturn.status = GlobalStatus.ACTIVE;
    return userReturn;
  }
}

import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, } from '@nestjs/common';
import { OnboardingTokenService } from './onboarding-token.service';
import { CreateOnboardingTokenDto } from './dto/create-onboarding-token.dto';
import { UpdateOnboardingTokenDto } from './dto/update-onboarding-token.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OnboardingToken } from './schemata/onboarding-token.schema';
import { AuthenticatedUser, Roles } from 'nest-keycloak-connect';
import { AuthUser, JsonResponse, RealmRoles } from '@nibyou/types';

@ApiTags('onboarding-token')
@Controller('onboarding-token')
export class OnboardingTokenController {
  constructor(
    private readonly onboardingTokenService: OnboardingTokenService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    status: 201,
    description: 'The onboarding token has been successfully created.',
    type: OnboardingToken,
  })
  @HttpCode(201)
  @Roles({ roles: [RealmRoles.ADMIN, RealmRoles.USER_PRACTITIONER] })
  create(
    @Body() createOnboardingTokenDto: CreateOnboardingTokenDto,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<OnboardingToken> {
    return this.onboardingTokenService.create(createOnboardingTokenDto, user);
  }

  @Get()
  @ApiOkResponse({
    status: 200,
    description: 'The onboarding tokens have been successfully retrieved.',
    type: [OnboardingToken],
  })
  @HttpCode(200)
  @Roles({ roles: [RealmRoles.ADMIN] })
  findAll(@AuthenticatedUser() user: AuthUser): Promise<OnboardingToken[]> {
    return this.onboardingTokenService.findAll(user);
  }

  @Get(':id')
  @ApiOkResponse({
    status: 200,
    description: 'The onboarding token has been successfully retrieved.',
    type: OnboardingToken,
  })
  @HttpCode(200)
  @Roles({ roles: [RealmRoles.ADMIN] })
  findOne(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<OnboardingToken> {
    return this.onboardingTokenService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOnboardingTokenDto: UpdateOnboardingTokenDto,
  ) {
    return this.onboardingTokenService.update(+id, updateOnboardingTokenDto);
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
    return this.onboardingTokenService.remove(id, user);
  }
}

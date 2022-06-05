import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { OnboardingTokenService } from './onboarding-token.service';
import { CreateOnboardingTokenDto } from './dto/create-onboarding-token.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Create a new onboarding token',
  })
  @ApiCreatedResponse({
    description: 'The onboarding token has been successfully created.',
    type: OnboardingToken,
  })
  @ApiBody({ type: CreateOnboardingTokenDto })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Roles({ roles: [RealmRoles.ADMIN, RealmRoles.USER_PRACTITIONER] })
  create(
    @Body() createOnboardingTokenDto: CreateOnboardingTokenDto,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<OnboardingToken> {
    return this.onboardingTokenService.create(createOnboardingTokenDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Find all onboarding tokens',
  })
  @ApiOkResponse({
    description: 'The onboarding tokens have been successfully retrieved.',
    type: [OnboardingToken],
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Roles({ roles: [RealmRoles.ADMIN] })
  findAll(@AuthenticatedUser() user: AuthUser): Promise<OnboardingToken[]> {
    return this.onboardingTokenService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Find a single onboarding token',
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiOkResponse({
    description: 'The onboarding token has been successfully retrieved.',
    type: OnboardingToken,
  })
  @Roles({ roles: [RealmRoles.ADMIN] })
  findOne(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<OnboardingToken> {
    return this.onboardingTokenService.findOne(id, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove an onboarding token',
  })
  @ApiNoContentResponse({
    description: 'The user .',
    type: JsonResponse,
  })
  @HttpCode(204)
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @Roles({ roles: [RealmRoles.ADMIN] })
  remove(
    @Param('id') id: string,
    @AuthenticatedUser() user: AuthUser,
  ): Promise<void> {
    return this.onboardingTokenService.remove(id, user);
  }
}

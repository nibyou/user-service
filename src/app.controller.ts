import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { JsonResponse } from '@nibyou/types';
import { Public } from 'nest-keycloak-connect';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOkResponse({
    status: 200,
    description: 'API health check',
    type: JsonResponse,
  })
  @HttpCode(200)
  @Public()
  getHealth(): JsonResponse {
    return this.appService.getHealth();
  }
}

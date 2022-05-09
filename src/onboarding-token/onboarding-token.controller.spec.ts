import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingTokenController } from './onboarding-token.controller';
import { OnboardingTokenService } from './onboarding-token.service';

describe('OnboardingTokenController', () => {
  let controller: OnboardingTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnboardingTokenController],
      providers: [OnboardingTokenService],
    }).compile();

    controller = module.get<OnboardingTokenController>(
      OnboardingTokenController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

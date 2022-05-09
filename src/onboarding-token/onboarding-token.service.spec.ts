import { Test, TestingModule } from '@nestjs/testing';
import { OnboardingTokenService } from './onboarding-token.service';

describe('OnboardingTokenService', () => {
  let service: OnboardingTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnboardingTokenService],
    }).compile();

    service = module.get<OnboardingTokenService>(OnboardingTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

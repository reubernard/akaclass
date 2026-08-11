import { Test, TestingModule } from '@nestjs/testing';
import { ClassLevelsService } from './class-levels.service';

describe('ClassLevelsService', () => {
  let service: ClassLevelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassLevelsService],
    }).compile();

    service = module.get<ClassLevelsService>(ClassLevelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

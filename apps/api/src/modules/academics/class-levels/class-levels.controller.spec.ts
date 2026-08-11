import { Test, TestingModule } from '@nestjs/testing';
import { ClassLevelsController } from './class-levels.controller';

describe('ClassLevelsController', () => {
  let controller: ClassLevelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassLevelsController],
    }).compile();

    controller = module.get<ClassLevelsController>(ClassLevelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

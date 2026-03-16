import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = {
        status: 'OK',
        timestamp: new Date(),
      };
      jest
        .spyOn(global.Date, 'now')
        .mockImplementation(() => result.timestamp.getTime());
      expect(appController.getHealth()).toEqual(result);
    });
  });
});

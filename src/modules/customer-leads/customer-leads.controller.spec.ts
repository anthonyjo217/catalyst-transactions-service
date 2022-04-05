import { Test, TestingModule } from '@nestjs/testing';
import { CustomerLeadsController } from './customer-leads.controller';
import { CustomerLeadsService } from './customer-leads.service';

describe('CustomerLeadsController', () => {
  let controller: CustomerLeadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerLeadsController],
      providers: [CustomerLeadsService],
    }).compile();

    controller = module.get<CustomerLeadsController>(CustomerLeadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

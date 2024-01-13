import { Test, TestingModule } from '@nestjs/testing';
import { PartyGateway } from './party.gateway';

describe('PartyGateway', () => {
  let gateway: PartyGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartyGateway],
    }).compile();

    gateway = module.get<PartyGateway>(PartyGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

import { Module } from '@nestjs/common';
import { PartyGateway } from './party.gateway';

@Module({
  providers: [PartyGateway]
})
export class PartyModule {}

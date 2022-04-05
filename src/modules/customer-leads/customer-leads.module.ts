import { Module } from '@nestjs/common';
import { CustomerLeadsService } from './customer-leads.service';
import { CustomerLeadsController } from './customer-leads.controller';

@Module({
  controllers: [CustomerLeadsController],
  providers: [CustomerLeadsService]
})
export class CustomerLeadsModule {}

import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

import { CustomerLeadsService } from './customer-leads.service';
import { CustomerLeadsController } from './customer-leads.controller';
import {
  CustomerLeadModel,
  CustomerLeadSchema,
} from './models/customer-lead.model';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: CustomerLeadModel.name,
        schema: CustomerLeadSchema,
        collection: 'users',
      },
    ]),
  ],
  controllers: [CustomerLeadsController],
  providers: [CustomerLeadsService],
})
export class CustomerLeadsModule {}

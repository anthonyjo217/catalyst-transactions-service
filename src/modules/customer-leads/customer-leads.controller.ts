import { Controller } from '@nestjs/common';
import { CustomerLeadsService } from './customer-leads.service';

@Controller('customer-leads')
export class CustomerLeadsController {
  constructor(private readonly customerLeadsService: CustomerLeadsService) {}
}

import { Module } from '@nestjs/common';
import { InvoiceInformationService } from './invoice-information.service';
import { InvoiceInformationController } from './invoice-information.controller';

@Module({
  controllers: [InvoiceInformationController],
  providers: [InvoiceInformationService]
})
export class InvoiceInformationModule {}

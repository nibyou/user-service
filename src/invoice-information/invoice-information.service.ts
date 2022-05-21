import { Injectable } from '@nestjs/common';
import { CreateInvoiceInformationDto } from './dto/create-invoice-information.dto';
import { UpdateInvoiceInformationDto } from './dto/update-invoice-information.dto';

@Injectable()
export class InvoiceInformationService {
  create(createInvoiceInformationDto: CreateInvoiceInformationDto) {
    return 'This action adds a new invoiceInformation';
  }

  findAll() {
    return `This action returns all invoiceInformation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invoiceInformation`;
  }

  update(id: number, updateInvoiceInformationDto: UpdateInvoiceInformationDto) {
    return `This action updates a #${id} invoiceInformation`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoiceInformation`;
  }
}

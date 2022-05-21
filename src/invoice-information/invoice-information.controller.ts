import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvoiceInformationService } from './invoice-information.service';
import { CreateInvoiceInformationDto } from './dto/create-invoice-information.dto';
import { UpdateInvoiceInformationDto } from './dto/update-invoice-information.dto';

@Controller('invoice-information')
export class InvoiceInformationController {
  constructor(private readonly invoiceInformationService: InvoiceInformationService) {}

  @Post()
  create(@Body() createInvoiceInformationDto: CreateInvoiceInformationDto) {
    return this.invoiceInformationService.create(createInvoiceInformationDto);
  }

  @Get()
  findAll() {
    return this.invoiceInformationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceInformationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoiceInformationDto: UpdateInvoiceInformationDto) {
    return this.invoiceInformationService.update(+id, updateInvoiceInformationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceInformationService.remove(+id);
  }
}

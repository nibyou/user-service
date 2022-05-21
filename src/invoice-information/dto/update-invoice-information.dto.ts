import { PartialType } from '@nestjs/swagger';
import { CreateInvoiceInformationDto } from './create-invoice-information.dto';

export class UpdateInvoiceInformationDto extends PartialType(CreateInvoiceInformationDto) {}

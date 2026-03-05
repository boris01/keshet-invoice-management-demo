import { Controller, Get, Param, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { InvoiceService } from '../application/invoice.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { PaginatedInvoiceResponseDto } from './dto/paginated-invoice-response.dto';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get('status-counts')
  async getStatusCounts() {
    return this.invoiceService.getStatusCounts();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const invoice = await this.invoiceService.getById(id);
    return plainToInstance(InvoiceResponseDto, invoice, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.invoiceService.findPaginated(query);
    return plainToInstance(
      PaginatedInvoiceResponseDto,
      {
        ...result,
        items: result.items.map((item) =>
          plainToInstance(InvoiceResponseDto, item, {
            excludeExtraneousValues: true,
          }),
        ),
      },
      { excludeExtraneousValues: true },
    );
  }
}

import { Injectable } from '@nestjs/common';
import { IInvoice, InvoiceStatus } from '@keshet/shared';
import { join } from 'path';
import PDFDocument = require('pdfkit');

const FONT_DIR = join(__dirname, 'assets', 'fonts');
const FONT_REGULAR = join(FONT_DIR, 'LiberationSans-Regular.ttf');
const FONT_BOLD = join(FONT_DIR, 'LiberationSans-Bold.ttf');

@Injectable()
export class InvoicePdfService {
  generate(invoice: IInvoice): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      doc.registerFont('Sans', FONT_REGULAR);
      doc.registerFont('Sans-Bold', FONT_BOLD);
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;
      const accentColor = '#ea4335';

      // --- HEADER ---
      doc
        .fontSize(28)
        .font('Sans-Bold')
        .text('INVOICE', margin, margin);

      // Company logo (simple triangle/mountain) + name on the right
      const logoX = pageWidth - margin - 80;
      const logoY = margin;
      doc
        .save()
        .moveTo(logoX + 40, logoY)
        .lineTo(logoX + 20, logoY + 30)
        .lineTo(logoX + 60, logoY + 30)
        .closePath()
        .fill(accentColor);
      doc
        .moveTo(logoX + 50, logoY + 10)
        .lineTo(logoX + 35, logoY + 30)
        .lineTo(logoX + 65, logoY + 30)
        .closePath()
        .fill(accentColor);
      doc.restore();

      doc
        .fontSize(10)
        .font('Sans-Bold')
        .text('WANDERERS INC.', logoX - 10, logoY + 35, {
          width: 100,
          align: 'center',
        });

      // --- Divider ---
      const dividerY = 110;
      doc
        .moveTo(margin, dividerY)
        .lineTo(pageWidth - margin, dividerY)
        .strokeColor(accentColor)
        .lineWidth(2)
        .stroke();

      // --- BILL TO + Invoice Info ---
      const infoY = 125;
      doc
        .fontSize(10)
        .font('Sans-Bold')
        .fillColor('#333333')
        .text('BILL TO:', margin, infoY);
      doc
        .fontSize(9)
        .font('Sans')
        .text(invoice.supplier, margin, infoY + 15)
        .text('123 Business Avenue', margin, infoY + 28)
        .text('Tel Aviv, Israel', margin, infoY + 41);

      // Right side: Invoice number + date
      const rightX = pageWidth - margin - 180;
      doc
        .fontSize(10)
        .font('Sans-Bold')
        .text('INVOICE NUMBER:', rightX, infoY, { width: 180, align: 'right' });
      doc
        .fontSize(9)
        .font('Sans')
        .text(invoice.invoiceNumber, rightX, infoY + 15, {
          width: 180,
          align: 'right',
        });
      doc
        .fontSize(10)
        .font('Sans-Bold')
        .text('DATE:', rightX, infoY + 35, { width: 180, align: 'right' });
      doc
        .fontSize(9)
        .font('Sans')
        .text(invoice.issueDate, rightX, infoY + 50, {
          width: 180,
          align: 'right',
        });

      // --- Table Header ---
      const tableTop = 220;
      const col1 = margin;
      const col2 = margin + contentWidth * 0.5;
      const col3 = margin + contentWidth * 0.65;
      const col4 = margin + contentWidth * 0.8;

      // Table header background
      doc
        .rect(margin, tableTop, contentWidth, 25)
        .fill(accentColor);
      doc
        .fontSize(9)
        .font('Sans-Bold')
        .fillColor('#ffffff')
        .text('DESCRIPTION', col1 + 8, tableTop + 8)
        .text('HOURS', col2, tableTop + 8, { width: 60, align: 'center' })
        .text('PRICE', col3, tableTop + 8, { width: 60, align: 'center' })
        .text('TOTAL', col4, tableTop + 8, { width: 80, align: 'right' });

      // Table row
      const rowY = tableTop + 30;
      doc
        .fillColor('#333333')
        .font('Sans')
        .fontSize(9)
        .text(invoice.description, col1 + 8, rowY + 5, {
          width: contentWidth * 0.45,
        })
        .text('--', col2, rowY + 5, { width: 60, align: 'center' })
        .text(
          formatCurrency(invoice.amountBeforeVat),
          col3,
          rowY + 5,
          { width: 60, align: 'center' },
        )
        .text(
          formatCurrency(invoice.amountBeforeVat),
          col4,
          rowY + 5,
          { width: 80, align: 'right' },
        );

      // Row divider
      doc
        .moveTo(margin, rowY + 25)
        .lineTo(pageWidth - margin, rowY + 25)
        .strokeColor('#dddddd')
        .lineWidth(0.5)
        .stroke();

      // --- Totals ---
      const totalsY = rowY + 45;
      const totalsX = col3;

      doc
        .fontSize(9)
        .font('Sans')
        .fillColor('#333333')
        .text('Subtotal:', totalsX, totalsY, { width: 60 })
        .text(formatCurrency(invoice.amountBeforeVat), col4, totalsY, {
          width: 80,
          align: 'right',
        });

      doc
        .text('VAT (17%):', totalsX, totalsY + 18, { width: 60 })
        .text(formatCurrency(invoice.vatAmount), col4, totalsY + 18, {
          width: 80,
          align: 'right',
        });

      doc
        .moveTo(totalsX, totalsY + 38)
        .lineTo(pageWidth - margin, totalsY + 38)
        .strokeColor(accentColor)
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(11)
        .font('Sans-Bold')
        .text('TOTAL:', totalsX, totalsY + 45, { width: 60 })
        .text(formatCurrency(invoice.totalAmount), col4, totalsY + 45, {
          width: 80,
          align: 'right',
        });

      // --- Payment Method ---
      const paymentY = totalsY + 90;
      doc
        .fontSize(10)
        .font('Sans-Bold')
        .fillColor('#333333')
        .text('PAYMENT METHOD', margin, paymentY);
      doc
        .fontSize(9)
        .font('Sans')
        .text('Bank Transfer / Wire', margin, paymentY + 15)
        .text('Payment due within 30 days of invoice date.', margin, paymentY + 28);

      // --- Notes ---
      const notesY = paymentY + 60;
      doc
        .fontSize(10)
        .font('Sans-Bold')
        .text('NOTES', margin, notesY);
      doc
        .fontSize(9)
        .font('Sans')
        .text(
          'Please include the invoice number as reference when making payment.',
          margin,
          notesY + 15,
          { width: contentWidth },
        );

      // --- Thank you + Signature ---
      const thankY = notesY + 55;
      doc
        .fontSize(16)
        .font('Sans-Bold')
        .fillColor(accentColor)
        .text('Thank you!', margin, thankY);

      const sigY = thankY + 35;
      doc
        .moveTo(margin, sigY)
        .lineTo(margin + 180, sigY)
        .strokeColor('#333333')
        .lineWidth(1)
        .stroke();
      doc
        .fontSize(9)
        .font('Sans')
        .fillColor('#333333')
        .text('Authorized Signature', margin, sigY + 5);

      // --- Footer ---
      const footerY = doc.page.height - margin - 20;
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text('www.reallygreatsite.com', margin, footerY, {
          width: contentWidth,
          align: 'center',
        });

      // --- REJECTED watermark ---
      if (invoice.status === InvoiceStatus.REJECTED) {
        doc.save();
        doc
          .fontSize(72)
          .font('Sans-Bold')
          .fillColor('red')
          .opacity(0.2)
          .translate(pageWidth / 2, doc.page.height / 2)
          .rotate(-45, { origin: [0, 0] })
          .text('REJECTED', -150, -30);
        doc.restore();
      }

      doc.end();
    });
  }
}

function formatCurrency(amount: number): string {
  return `$${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

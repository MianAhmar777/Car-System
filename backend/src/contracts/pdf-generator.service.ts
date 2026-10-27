import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as crypto from 'crypto';

@Injectable()
export class PdfGeneratorService {
  async generateContractPdf(data: {
    contractNumber: string;
    versionNumber: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    carDetails: string;
    registrationNumber: string;
    pickupLocation: string;
    returnLocation: string;
    pickupDate: string;
    returnDate: string;
    rentalDays: number;
    totalAmount: number;
    securityDeposit: number;
    termsText: string;
    signatureDataUrl?: string;
    signedAt?: string;
  }): Promise<{ pdfBuffer: Buffer; checksum: string }> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        const checksum = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
        resolve({ pdfBuffer, checksum });
      });
      doc.on('error', (err) => reject(err));

      // Header
      doc.fontSize(20).fillColor('#1E293B').text('AUTOMOTIVE RENTAL AGREEMENT', { align: 'center' });
      doc.fontSize(10).fillColor('#64748B').text(`Contract #: ${data.contractNumber} | Version: v${data.versionNumber}`, { align: 'center' });
      doc.moveDown(1.5);

      // Section: Booking Details
      doc.fontSize(14).fillColor('#0F172A').text('1. Rental Information', { underline: true });
      doc.fontSize(10).fillColor('#334155');
      doc.text(`Customer: ${data.customerName} (${data.customerEmail})`);
      doc.text(`Vehicle: ${data.carDetails} [Reg: ${data.registrationNumber}]`);
      doc.text(`Pickup Location: ${data.pickupLocation} | Date: ${data.pickupDate}`);
      doc.text(`Return Location: ${data.returnLocation} | Date: ${data.returnDate}`);
      doc.text(`Rental Duration: ${data.rentalDays} Day(s)`);
      doc.text(`Total Total Amount: \$${data.totalAmount.toFixed(2)}`);
      doc.text(`Security Deposit Required: \$${data.securityDeposit.toFixed(2)}`);
      doc.moveDown();

      // Section: Terms & Conditions
      doc.fontSize(14).fillColor('#0F172A').text('2. Terms & Conditions', { underline: true });
      doc.fontSize(9).fillColor('#475569').text(data.termsText, { align: 'justify' });
      doc.moveDown(2);

      // Section: Signature Box
      doc.fontSize(12).fillColor('#0F172A').text('3. Authorization & Signature');
      if (data.signatureDataUrl && data.signedAt) {
        doc.fontSize(10).fillColor('#166534').text(`[ELECTRONICALLY SIGNED ONLINE]`);
        doc.fontSize(9).fillColor('#334155').text(`Signed Date: ${data.signedAt}`);

        try {
          const base64Data = data.signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
          const imgBuffer = Buffer.from(base64Data, 'base64');
          doc.image(imgBuffer, { width: 180, height: 60 });
        } catch (e) {
          doc.text('(Signature Image Embedded)');
        }
      } else {
        doc.fontSize(10).fillColor('#94A3B8').text('Signature Required Below:');
        doc.moveDown(3);
        doc.text('____________________________          ____________________________');
        doc.text('Customer Signature                    Company Representative');
      }

      doc.end();
    });
  }
}

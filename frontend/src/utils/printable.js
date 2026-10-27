import { formatPKR } from './formatters';

export function printInvoice(booking) {
  const printWindow = window.open('', '_blank', 'width=900,height=900');
  if (!printWindow) return;

  const invoice = booking.invoices?.[0] || {};
  const services = booking.services || [];

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${invoice.invoiceNumber || booking.bookingReference}</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #0284c7; }
          .inv-title { text-align: right; }
          .inv-number { font-size: 20px; font-weight: bold; color: #1e293b; }
          .inv-date { font-size: 12px; color: #64748b; margin-top: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; }
          .box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .box-title { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          th { text-align: left; background: #f1f5f9; padding: 12px; font-weight: 700; color: #334155; border-bottom: 1px solid #cbd5e1; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .total-section { width: 320px; margin-left: auto; font-size: 13px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
          .total-row.grand { font-size: 16px; font-weight: bold; color: #0284c7; border-bottom: 2px solid #0284c7; padding-top: 10px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #dcfce7; color: #166534; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">DriveElite Car Rentals</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium Fleet & Mobility Solutions</div>
          </div>
          <div class="inv-title">
            <div class="inv-number">INVOICE #${invoice.invoiceNumber || booking.bookingReference}</div>
            <div class="inv-date">Issued: ${new Date(booking.createdAt).toLocaleDateString()}</div>
            <div style="margin-top: 6px;"><span class="badge">${booking.paymentStatus === 'SUCCESS' ? 'PAID IN FULL' : 'PENDING PAYMENT'}</span></div>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <div class="box-title">Billed To</div>
            <strong>${booking.customer?.fullName || 'Valued Customer'}</strong><br/>
            Email: ${booking.customer?.email || 'N/A'}<br/>
            Phone: ${booking.customer?.phone || 'N/A'}<br/>
            CNIC/Passport: ${booking.customer?.cnicPassport || 'N/A'}
          </div>
          <div class="box">
            <div class="box-title">Rental Details</div>
            <strong>${booking.car?.make} ${booking.car?.model} (${booking.car?.year})</strong><br/>
            Registration: ${booking.car?.registrationNumber || 'N/A'}<br/>
            Period: ${new Date(booking.startDate).toLocaleDateString()} &mdash; ${new Date(booking.endDate).toLocaleDateString()} (${booking.rentalDays} Days)<br/>
            Pickup: ${booking.pickupLocation?.name || 'Main Office'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty / Days</th>
              <th>Rate</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base Rental Rate (${booking.car?.make} ${booking.car?.model})</td>
              <td>${booking.rentalDays} Days</td>
              <td>${formatPKR(booking.basePrice / booking.rentalDays)} / day</td>
              <td style="text-align: right;">${formatPKR(booking.basePrice)}</td>
            </tr>
            ${services.map(s => `
              <tr>
                <td>Option/Addon: ${s.service?.name || 'Extra Service'}</td>
                <td>1</td>
                <td>${formatPKR(s.price || 0)}</td>
                <td style="text-align: right;">${formatPKR(s.price || 0)}</td>
              </tr>
            `).join('')}
            ${booking.discountAmount > 0 ? `
              <tr style="color: #166534;">
                <td>Applied Promotional Discount</td>
                <td>-</td>
                <td>-</td>
                <td style="text-align: right;">-${formatPKR(booking.discountAmount)}</td>
              </tr>
            ` : ''}
            <tr>
              <td>Refundable Security Deposit</td>
              <td>1</td>
              <td>${formatPKR(booking.securityDeposit)}</td>
              <td style="text-align: right;">${formatPKR(booking.securityDeposit)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row"><span>Base Rate:</span> <span>${formatPKR(booking.basePrice)}</span></div>
          <div class="total-row"><span>Services Fee:</span> <span>${formatPKR(booking.servicesFee)}</span></div>
          <div class="total-row"><span>Taxes (10%):</span> <span>${formatPKR(booking.taxAmount)}</span></div>
          <div class="total-row"><span>Security Deposit:</span> <span>${formatPKR(booking.securityDeposit)}</span></div>
          <div class="total-row grand"><span>Total Payable:</span> <span>${formatPKR(booking.totalAmount + booking.securityDeposit)}</span></div>
        </div>

        <div class="footer">
          Thank you for choosing DriveElite Car Rentals. For billing inquiries, contact support@carrental.com.<br/>
          This is a computer-generated invoice and valid without physical signature.
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printContract(contract, booking) {
  if (contract.pdfUrl) {
    window.open(contract.pdfUrl, '_blank');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=900,height=900');
  if (!printWindow) return;

  const b = booking || contract.booking;
  const latestVersion = contract.versions?.[0];
  const signature = contract.signatures?.[0];

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Contract #${contract.contractNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; font-size: 13px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 22px; font-weight: 800; text-transform: uppercase; color: #0f172a; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .meta { display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 25px; font-size: 12px; }
          .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin: 20px 0 10px 0; color: #0284c7; }
          .terms { background: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #eee; font-size: 12px; color: #334155; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
          .sig-box { text-align: center; }
          .sig-line { border-bottom: 1px solid #0f172a; margin-top: 60px; margin-bottom: 8px; }
          .sig-img { max-height: 80px; margin: 10px auto; display: block; border: 1px dashed #cbd5e1; padding: 5px; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #dcfce7; color: #166534; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">VEHICLE RENTAL AGREEMENT</div>
          <div class="subtitle">DriveElite Car Rentals &bull; Legal Contract #${contract.contractNumber} (v${latestVersion?.versionNumber || contract.currentVersion || 1})</div>
        </div>

        <div class="meta">
          <div>
            <strong>Contract #:</strong> ${contract.contractNumber}<br/>
            <strong>Booking Ref #:</strong> ${b?.bookingReference || 'N/A'}<br/>
            <strong>Status:</strong> <span class="badge">${contract.status}</span>
          </div>
          <div>
            <strong>Date Generated:</strong> ${new Date(contract.createdAt).toLocaleDateString()}<br/>
            <strong>Vehicle:</strong> ${b?.car?.make || ''} ${b?.car?.model || ''} (${b?.car?.registrationNumber || ''})<br/>
            <strong>Customer:</strong> ${b?.customer?.fullName || contract.customer?.fullName || 'Customer'} (${b?.customer?.email || contract.customer?.email || ''})
          </div>
        </div>

        <div class="section-title">1. BOOKING DETAILS & FINANCIAL TERMS</div>
        <p>
          Customer: <strong>${b?.customer?.fullName || contract.customer?.fullName || 'Customer'}</strong> (${b?.customer?.email || contract.customer?.email || ''})<br/>
          Vehicle: <strong>${b?.car?.make || ''} ${b?.car?.model || ''}</strong> [Reg: ${b?.car?.registrationNumber || 'N/A'}]<br/>
          Rental Period: <strong>${b?.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A'} to ${b?.endDate ? new Date(b.endDate).toLocaleDateString() : 'N/A'}</strong> (${b?.rentalDays || 1} Days)<br/>
          Total Amount: <strong>${formatPKR(b?.totalAmount || 0)}</strong> | Security Deposit: <strong>${formatPKR(b?.securityDeposit || 0)}</strong>
        </p>

        <div class="section-title">2. MANDATORY TERMS & CONDITIONS</div>
        <div class="terms">
          ${latestVersion?.contentSnapshot || `
            <ol style="margin: 0; padding-left: 20px;">
              <li>1. RENTAL PERIOD & VEHICLE HANDOVER: The Lessor agrees to rent the specified vehicle to Lessee for the selected dates. Lessee agrees to return the vehicle in identical condition at the agreed return location.</li>
              <li>2. SECURITY DEPOSIT: The Lessee provides a refundable security deposit to cover potential toll violations, fuel shortages, or minor damage.</li>
              <li>3. DIGITAL SIGNATURE IMMUTABILITY: Electronic signatures executed inside this application or verified PDF document uploads represent binding legal consent under standard digital transaction laws.</li>
            </ol>
          `}
        </div>

        <div class="section-title">3. DIGITAL SIGNATURE & VERIFICATION</div>
        <div style="font-size: 11px; font-mono; color: #64748b; margin-bottom: 15px;">
          Checksum SHA-256: <strong>${latestVersion?.checksum || signature?.documentHash || 'Verified'}</strong>
        </div>

        <div class="signatures">
          <div class="sig-box">
            ${signature?.signatureData ? `
              <img src="${signature.signatureData}" class="sig-img" alt="Customer Signature" />
              <div style="font-size: 11px; color: #64748b;">Signed IP: ${signature.ipAddress || '127.0.0.1'}</div>
              <div style="font-size: 11px; color: #64748b;">Timestamp: ${new Date(signature.signedAt).toLocaleString()}</div>
            ` : `
              <div class="sig-line"></div>
            `}
            <strong>Customer Signature</strong><br/>
            ${b?.customer?.fullName || contract.customer?.fullName || 'Customer'}
          </div>
          <div class="sig-box">
            <div style="height: 80px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #0284c7; border: 1px dashed #0284c7; margin-bottom: 10px; border-radius: 4px;">
              OFFICIALLY VERIFIED & STAMPED BY ADMIN
            </div>
            <strong>DriveElite Authorized Representative</strong><br/>
            Car Rental System Management
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printHandoverReceipt(booking, releaseAuth, inspections) {
  const printWindow = window.open('', '_blank', 'width=900,height=900');
  if (!printWindow) return;

  const pickupInspection = inspections?.find(i => i.type === 'PICKUP');
  const returnInspection = inspections?.find(i => i.type === 'RETURN');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Handover Certificate - ${booking?.bookingReference || 'Receipt'}</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; font-size: 13px; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 22px; font-weight: 800; color: #0284c7; }
          .subtitle { font-size: 12px; color: #64748b; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; }
          .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin: 25px 0 12px 0; color: #1e293b; }
          .checklist { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .check-item { background: #f1f5f9; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; justify-content: space-between; }
          .pass { color: #166534; }
          .fail { color: #991b1b; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th { text-align: left; background: #e2e8f0; padding: 8px 12px; }
          td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">VEHICLE HANDOVER & RELEASE CERTIFICATE</div>
          <div class="subtitle">DriveElite Operations & Fleet Management</div>
        </div>

        <div class="meta">
          <div>
            <strong>Booking Ref #:</strong> ${booking?.bookingReference || 'N/A'}<br/>
            <strong>Customer:</strong> ${booking?.customer?.fullName || 'Customer'}<br/>
            <strong>Phone:</strong> ${booking?.customer?.phone || 'N/A'}<br/>
            <strong>CNIC/Passport:</strong> ${booking?.customer?.cnicPassport || 'N/A'}
          </div>
          <div>
            <strong>Vehicle:</strong> ${booking?.car?.make || ''} ${booking?.car?.model || ''} (${booking?.car?.year || ''})<br/>
            <strong>Registration Plate #:</strong> ${booking?.car?.registrationNumber || 'N/A'}<br/>
            <strong>Pickup Location:</strong> ${booking?.pickupLocation?.name || 'Main Office'}<br/>
            <strong>Handover Status:</strong> <strong style="color: #166534;">${releaseAuth?.isAuthorized ? 'AUTHORIZED & COMPLETED' : 'PENDING'}</strong>
          </div>
        </div>

        <div class="section-title">1. FOUR-POINT RELEASE CHECKLIST VERIFICATION</div>
        <div class="checklist">
          <div class="check-item"><span>1. Payment Verified:</span> <span class="${releaseAuth?.checklist?.isPaid ? 'pass' : 'fail'}">${releaseAuth?.checklist?.isPaid ? '✓ PASS' : '✗ PENDING'}</span></div>
          <div class="check-item"><span>2. Customer Documents:</span> <span class="${releaseAuth?.checklist?.isDocumentVerified ? 'pass' : 'fail'}">${releaseAuth?.checklist?.isDocumentVerified ? '✓ VERIFIED' : '✗ PENDING'}</span></div>
          <div class="check-item"><span>3. E-Contract Approved:</span> <span class="${releaseAuth?.checklist?.isContractSigned ? 'pass' : 'fail'}">${releaseAuth?.checklist?.isContractSigned ? '✓ SIGNED' : '✗ PENDING'}</span></div>
          <div class="check-item"><span>4. Inspection Photo/Mileage:</span> <span class="${releaseAuth?.checklist?.isPrePickupInspected ? 'pass' : 'fail'}">${releaseAuth?.checklist?.isPrePickupInspected ? '✓ COMPLETED' : '✗ PENDING'}</span></div>
        </div>

        <div class="section-title">2. PRE-PICKUP INSPECTION RECORD</div>
        ${pickupInspection ? `
          <table>
            <thead>
              <tr>
                <th>Odometer Mileage</th>
                <th>Fuel Level</th>
                <th>Inspector / Notes</th>
                <th>Inspected At</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${pickupInspection.mileage} KM</strong></td>
                <td><strong>${pickupInspection.fuelLevel}% Full</strong></td>
                <td>${pickupInspection.notes || 'No pre-existing damages noted'}</td>
                <td>${new Date(pickupInspection.inspectedAt).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        ` : `
          <p style="color: #64748b; font-style: italic;">No pre-pickup inspection record created yet.</p>
        `}

        ${returnInspection ? `
          <div class="section-title">3. POST-RETURN INSPECTION RECORD</div>
          <table>
            <thead>
              <tr>
                <th>Return Odometer</th>
                <th>Return Fuel</th>
                <th>Additional Fee</th>
                <th>Inspector / Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${returnInspection.mileage} KM</strong></td>
                <td><strong>${returnInspection.fuelLevel}% Full</strong></td>
                <td>${formatPKR(returnInspection.additionalFee || 0)}</td>
                <td>${returnInspection.notes || 'Vehicle returned cleanly.'}</td>
              </tr>
            </tbody>
          </table>
        ` : ''}

        ${releaseAuth?.overrideReason ? `
          <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 10px; border-radius: 6px; margin-top: 15px;">
            <strong>Staff Override Log:</strong> ${releaseAuth.overrideReason}
          </div>
        ` : ''}

        <div class="footer">
          DriveElite Car Rentals &bull; Vehicle Handover Certificate &bull; Printed on ${new Date().toLocaleString()}
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

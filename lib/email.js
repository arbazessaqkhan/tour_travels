export async function sendBookingEmail(bookingData) {
  try {
    // If RESEND_API_KEY is available, use Resend
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9933, #00A676); padding: 30px; text-align: center; color: white; }
            .content { background: #f5f7fa; padding: 30px; }
            .detail-row { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
            .label { font-weight: bold; color: #1A237E; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .btn { background: #00A676; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏔️ Waadi Kashmir Travels</h1>
              <p>Booking Confirmation</p>
            </div>
            <div class="content">
              <h2>Hello ${bookingData.name}!</h2>
              <p>Thank you for choosing Waadi Kashmir Travels. Your booking has been received.</p>
              
              <div class="detail-row">
                <span class="label">📧 Email:</span> ${bookingData.email}
              </div>
              <div class="detail-row">
                <span class="label">📱 Phone:</span> ${bookingData.phone}
              </div>
              <div class="detail-row">
                <span class="label">🗓️ Tour Type:</span> ${bookingData.tourType}
              </div>
              <div class="detail-row">
                <span class="label">📅 Dates:</span> ${bookingData.dates}
              </div>
              <div class="detail-row">
                <span class="label">👥 Guests:</span> ${bookingData.guests}
              </div>
              ${bookingData.message ? `<div class="detail-row"><span class="label">💬 Message:</span> ${bookingData.message}</div>` : ''}
              
              <div style="text-align: center;">
                <a href="tel:${process.env.PRIMARY_PHONE}" class="btn">Call Us: ${process.env.PRIMARY_PHONE}</a>
              </div>
              
              <p>Our team will contact you shortly to confirm your booking details.</p>
            </div>
            <div class="footer">
              <p>📧 ${process.env.BUSINESS_EMAIL}</p>
              <p>📞 ${process.env.PRIMARY_PHONE} | ${process.env.SECONDARY_PHONE}</p>
              <p>© 2026 Waadi Kashmir Travels. Licensed by J&K Tourism</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      await resend.emails.send({
        from: 'Waadi Kashmir <bookings@waadikashmir.com>',
        to: [bookingData.email, process.env.BUSINESS_EMAIL],
        subject: `Booking Confirmation - ${bookingData.tourType}`,
        html: emailHtml
      });
      
      return { success: true, provider: 'resend' };
    }
    
    // Fallback: Log to console (for development without API key)
    console.log('📧 Email would be sent (no API key configured):', {
      to: [bookingData.email, process.env.BUSINESS_EMAIL],
      subject: `Booking Confirmation - ${bookingData.tourType}`,
      data: bookingData
    });
    
    return { success: true, provider: 'mock', message: 'Email logged (configure RESEND_API_KEY for actual sending)' };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendAdminNotification(bookingData) {
  // Send internal notification to admin
  console.log('📬 Admin notification:', bookingData);
  return { success: true };
}
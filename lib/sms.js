export async function sendBookingSMS(bookingData) {
  try {
    // If Twilio credentials are available, use Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = await import('twilio');
      const client = twilio.default(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      
      const message = `New Booking Alert!
Customer: ${bookingData.name}
Phone: ${bookingData.phone}
Tour: ${bookingData.tourType}
Dates: ${bookingData.dates}
Guests: ${bookingData.guests}`;
      
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.SMS_NOTIFICATION_PHONE
      });
      
      return { success: true, provider: 'twilio' };
    }
    
    // Fallback: Log to console (for development without API key)
    console.log('📱 SMS would be sent (no Twilio configured):', {
      to: process.env.SMS_NOTIFICATION_PHONE,
      message: `New Booking: ${bookingData.name} - ${bookingData.tourType} - ${bookingData.dates}`
    });
    
    return { success: true, provider: 'mock', message: 'SMS logged (configure Twilio for actual sending)' };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
}
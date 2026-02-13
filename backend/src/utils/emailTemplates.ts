export const getOrderConfirmationEmail = (userName: string, orderDetails: { amount: number, date: string, items: string }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1B9AAA;">🎉 Congratulations!</h1>
        <p style="font-size: 16px; color: #555;">Your order has been confirmed.</p>
      </div>

      <div style="background-color: #F5EFE6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #2F2F2F; margin-top: 0;">Hi ${userName},</h3>
        <p style="color: #5C5C5C;">Thank you for shopping with <strong>FindMyPet</strong>. We are excited to get your smart pet gear to you!</p>
        
        <p style="color: #5C5C5C;">Here are your order details:</p>
        <ul style="color: #5C5C5C;">
          <li><strong>Item:</strong> ${orderDetails.items}</li>
          <li><strong>Amount Paid:</strong> ₹${orderDetails.amount}</li>
          <li><strong>Date:</strong> ${orderDetails.date}</li>
        </ul>
        
        <p style="color: #5C5C5C;">Expected Delivery: <strong>3-5 Business Days</strong></p>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
        <p>If you have any questions, simply reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} FindMyPet. All rights reserved.</p>
      </div>
    </div>
  `;
};



const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  amount: Number,
  message: String,
  paymentId: String,
  productName: String,      // new field for product name
  videoWishes: String,      // new field for video wishes (URL or text)
  recipientName: String,    // new field for recipient name
  photoUrl: String,         // new field for photo URL or base64 string
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema);

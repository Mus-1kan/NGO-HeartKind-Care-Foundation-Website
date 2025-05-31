// 1. Dependencies
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. MongoDB Connection
mongoose.connect('mongodb+srv://ngo_admin:mnbvcxz098@ngo-cluster.3gf92df.mongodb.net/?retryWrites=true&w=majority&appName=ngo-cluster', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection failed:', err));

// 3. Schema with Added Fields
const formSchema = new mongoose.Schema({
  name: String,
  recipientName: String,
  phoneNumber: String,
  email: String,
  amount: Number,
  message: String,
  paymentId: String,
  videoWishes: String,
  donorPhotoBase64: String,
  donorPhotoURL: String // add this to schema too
});
const FormData = mongoose.model('FormData', formSchema);

// 4. Submit Form Endpoint
app.post('/submit-form', async (req, res) => {
  try {
    const {
      name,
      recipientName,
      phoneNumber,
      productName ,
      email,
      amount,
      message,
      paymentId,
      videoWishes,
      donorPhotoBase64
    } = req.body;



    let imageURL = '';

if (donorPhotoBase64) {
  // Get the base64 string and extension
  const matches = donorPhotoBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (matches) {
    const ext = matches[1].split('/')[1]; // jpeg, png, etc.
    const buffer = Buffer.from(matches[2], 'base64');

    // Create a unique filename
    const filename = `donor_${Date.now()}.${ext}`;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Ensure 'uploads' folder exists
    if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
      fs.mkdirSync(path.join(__dirname, 'uploads'));
    }

    // Save image to local uploads folder
    fs.writeFileSync(filePath, buffer);

    // Publicly accessible image URL (change the domain when deploying)
    imageURL = `http://localhost:5000/uploads/${filename}`;
  }
}

    // Save data to DB
    const formData = new FormData({
      name,
      recipientName,
      phoneNumber,
      productName ,
      email,
      amount,
      message,
      paymentId,
      videoWishes,
      donorPhotoBase64,
      donorPhotoURL: imageURL // add this to schema too
    });
    await formData.save();

    // Setup mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'heartkindcarengo@gmail.com',
        pass: 'zxanroafihyabluz' // Gmail App Password
      }
    });

    // Mail content
   const donorPhotoWithPrefix = donorPhotoBase64?.startsWith('data:image')
  ? donorPhotoBase64
  : `data:image/jpeg;base64,${donorPhotoBase64}`; // or "image/png" if needed
const mailOptions = {
  from: 'heartkindcarengo@gmail.com',
  to: `${email}, heartkindcarengo@gmail.com`,
  subject: 'Donation Receipt - HeartKind Care Foundation',
 html: `
  <h2>Thank you for your donation of ₹${amount}</h2>
  <p><strong>Donor Name:</strong> ${name}</p>
  <p><strong>Phone Number:</strong> ${phoneNumber}</p>
  <p><strong>Recipient Name:</strong> ${recipientName || 'N/A'}</p>
    <p><strong>Product Name:</strong> ${productName}</p>
  <p><strong>Message:</strong> ${message}</p>
  <p><strong>Video Wishes:</strong> ${videoWishes || 'N/A'}</p>
  <p><strong>Payment ID:</strong> ${paymentId || 'N/A'}</p>
  ${imageURL ? `
  <p><strong>Donor Photo:</strong> <a href="${imageURL}" target="_blank">View Photo</a></p>
` : ''}

`
  }

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");

res.status(200).json({ success: true, message: 'Form submitted and receipt sent successfully.' });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: 'Failed to submit form.' });
  }
});

// 5. Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Complete Donation Frontend Integration
// Function to initiate payment process
async function payNow() {
  const donorName = document.getElementById("donor-name").value.trim();
  const donorEmail = document.getElementById("donor-email").value.trim();
  const donorContact = document.getElementById("donor-contact").value.trim();
  const productName = document.getElementById("product-name").value.trim();
  const recipientName = document.getElementById("recipient-name").value.trim();

  if (!donorName || !donorEmail || !donorContact) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/initiate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donorName, donorEmail, donorContact, productName, recipientName })
    });

    const data = await response.json();

    if (data.success) {
      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "HeartKind Care Foundation",
        description: "Donation Payment",
        image: "/path/to/logo.png",
        order_id: data.orderId,
        handler: async function (response) {
          await fetch("http://localhost:5000/api/confirm-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: response.razorpay_payment_id, donorEmail })
          });

          alert("Payment Successful!");
          window.location.href = "/thank-you?transaction_id=" + response.razorpay_payment_id;
        },
        prefill: { name: donorName, email: donorEmail, contact: donorContact }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } else {
      alert("Failed to initiate payment. Please try again.");
    }
  } catch (error) {
    console.error("Error during payment initiation:", error);
    alert("Error processing payment. Please try again.");
  }
}

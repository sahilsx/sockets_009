import React, { useState } from "react";

const Payment = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
  });
  const [orderId, setOrderId] = useState(null); // To store the order ID generated from backend
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:4000/admin/CreatePaymentGateway",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            amount: formData.amount,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        console.log("Order Created: ", data);
        setOrderId(data.orderId);
        initiatePayment(
          data.orderId,
          data.amount,
          formData.name,
          formData.phone
        );
      } else {
        alert("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error during order creation:", error);
    }
  };

  const initiatePayment = (orderId, amount, name, phone) => {
    const options = {
      key: "rzp_test_lagBIu9ruBstxI",
      amount: amount,
      currency: "INR",
      name: name,
      description: "Test Transaction",
      order_id: orderId,
      handler: async (response) => {
        try {
          const captureResponse = await fetch(
            "http://localhost:4000/admin/capturePayment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: orderId,
                amount: amount,
              }),
            }
          );

          const captureData = await captureResponse.json();
          if (captureData.success) {
            setPaymentSuccess(true);
            setPaymentDetails(captureData.paymentDetails);
            alert("Payment captured successfully!");
          } else {
            alert("Payment capture failed. Please try again.");
          }
        } catch (error) {
          console.error("Error capturing payment: ", error);
        }
      },
      prefill: {
        name: name,
        contact: phone,
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div>
      <h1>Make a Payment</h1>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <br />

        <label>Phone:</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
        <br />

        <label>Amount (INR):</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          required
        />
        <br />

        <button type="submit">Pay Now</button>
      </form>

      {paymentSuccess && paymentDetails && (
        <div>
          <h2>Payment Details</h2>
          <p>Payment ID: {paymentDetails.id}</p>
          <p>Amount: {paymentDetails.amount / 100} INR</p>
          <p>Currency: {paymentDetails.currency}</p>
          <p>Status: {paymentDetails.status}</p>
        </div>
      )}
    </div>
  );
};

export default Payment;

"use client";

import React, { useState } from "react";
import axios from "axios";

const Cart = () => {
  const [amount, setAmount] = useState(1); // default amount
  const [formData, setFormData] = useState(null);

  const handlePayment = async () => {
    try {
      // This will open the PayU payment page automatically
      // const res = await axios.post("http://localhost:5000/payment", {
      const res = await axios.post("https://payu-socd.onrender.com/payment", {
        items: [{ name: "Sample Product", price: amount, quantity: 1 }],
        total: amount,
      });

      // Open the response (HTML) in a new tab
      const newWindow = window.open();
      newWindow.document.write(res.data);
    } catch (err) {
      console.error("Payment API error:", err);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-10">
      {/* Amount input and button */}
      {!formData && (
        <>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full border px-4 py-2 rounded mb-4"
          />
          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Generate PayU Form
          </button>
        </>
      )}

      {/* Show the form if formData is received */}
      {formData && (
        <form name="payu" method="post" action="https://test.payu.in/_payment">
          <input type="hidden" name="key" value={formData.key} />
          <input type="hidden" name="txnid" value={formData.txnid} />
          <input type="hidden" name="amount" value={formData.amount} />
          <input
            type="hidden"
            name="productinfo"
            value={formData.productinfo}
          />
          <input type="hidden" name="firstname" value={formData.firstname} />
          <input type="hidden" name="email" value={formData.email} />
          <input type="hidden" name="phone" value={formData.phone} />
          <input type="hidden" name="surl" value={formData.surl} />
          <input type="hidden" name="furl" value={formData.furl} />
          <input type="hidden" name="hash" value={formData.hash} />

          <input type="submit" value="Pay Now" />
        </form>
      )}
    </div>
  );
};

export default Cart;

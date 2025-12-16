"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const Cart = () => {
  const initialCartItems = [
    {
      id: 1,
      name: "Apple iMac (2023) 24-inch",
      description: "Apple M3, 24-inch Retina 4.5K, 8GB, SSD 256GB",
      price: 1499,
      quantity: 2,
      image:
        "https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front.svg",
    },
    {
      id: 2,
      name: "Apple Watch Series 8",
      description: "GPS, 41mm Midnight Aluminum Case",
      price: 598,
      quantity: 1,
      image:
        "https://flowbite.s3.amazonaws.com/blocks/e-commerce/apple-watch-light.svg",
    },
    {
      id: 3,
      name: "MacBook Pro 16-inch",
      description: "M3 Pro chip, 36GB Memory, 512GB SSD",
      price: 1799,
      quantity: 1,
      image:
        "https://flowbite.s3.amazonaws.com/blocks/e-commerce/macbook-pro-light.svg",
    },
    {
      id: 4,
      name: "iPhone 15",
      description: "256GB, Gold",
      price: 999,
      quantity: 3,
      image:
        "https://flowbite.s3.amazonaws.com/blocks/e-commerce/iphone-light.svg",
    },
  ];

  const [cartItems, setCartItems] = useState(initialCartItems);
  const [promoCode, setPromoCode] = useState("");
  const [form, setForm] = useState("");

  const handleQuantityChange = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const calculateSubtotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const calculateTax = () => calculateSubtotal() * 0.08;
  const calculateTotal = () => calculateSubtotal() + calculateTax() + 99;

  const handleCheckout = async () => {
    const orderData = {
      items: cartItems,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      shipping: 99,
      total: calculateTotal(),
      promoCode,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/payment",
        orderData,
        {
          withCredentials: true,
        }
      );

      setForm(response.data);

      console.log("Payment API response:", response.data);
    } catch (error) {
      console.error("Payment API error:", error);
    }

    console.log("Proceeding to payment with data:", orderData);
  };

  useEffect(() => {
    const formData = document.getElementById("payment_post");

    if (formData) formData.submit();
  }, [form]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {form && <div dangerouslySetInnerHTML={{ __html: form }} />}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-6 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-contain"
                    />
                    <div className="grow">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <span className="text-lg">-</span>
                          </button>
                          <span className="w-12 text-center text-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                          >
                            <span className="text-lg">+</span>
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.price} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-blue-500">
                    ${calculateSubtotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-blue-500">$99.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium text-blue-500">
                    ${calculateTax().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-black">Total</span>
                  <span className="text-blue-500">
                    ${calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 mb-4"
              >
                Proceed to Checkout
              </button>

              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full mb-4 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

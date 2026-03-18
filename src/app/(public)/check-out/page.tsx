'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { data: session, status } = useSession();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    invoiceNo: string;
    trCode: string | null;
    deliveryCode: string | null;
  } | null>(null);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // No discount applied
  const discount = 0;
  const finalTotal = totalPrice;
  const payableTotal = Math.round(finalTotal); // optional rounding, can remove if not needed

  // Calculate delivery date based on current time
  const getDeliveryDate = (): string => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour > 11 || (currentHour === 11 && currentMinute > 0)) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      return tomorrow.toLocaleDateString('bn-BD', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else {
      return now.toLocaleDateString('bn-BD', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const deliveryDate = getDeliveryDate();

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const orderItems = items.map(item => ({
        id: item.id,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems, totalPrice }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      setOrderDetails({
        invoiceNo: data.invoiceNo,
        trCode: data.trCode,
        deliveryCode: data.deliveryCode,
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    router.push('/history');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
        <Link
          href="/products"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white font-medium rounded-lg hover:opacity-90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

      {/* Mobile Order Summary */}
      <div className="block md:hidden mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="grid grid-cols-2 font-medium text-gray-500 text-sm pb-2 border-b border-gray-200 mb-2">
            <div>Item</div>
            <div className="text-right">Amount</div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-right font-medium text-gray-800">৳{totalPrice.toFixed(2)}</span>
            </div>
            {/* Discount row removed */}
            <div className="grid grid-cols-2 font-semibold border-t border-gray-200 pt-2">
              <span>Total</span>
              <span className="text-right text-[#0F9D8F]">৳{payableTotal}</span>
            </div>
          </div>

          <div className="mt-6 mb-6">
            <p className="text-sm text-gray-500">Estimated delivery date:</p>
            <p className="text-lg font-semibold text-[#0F9D8F]">{deliveryDate}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className="w-full py-3 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Items in your order */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Items in your order</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#0F9D8F]">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Order Summary */}
        <div className="hidden md:block md:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="grid grid-cols-2 font-medium text-gray-500 text-sm pb-2 border-b border-gray-200 mb-2">
              <div>Item</div>
              <div className="text-right">Amount</div>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-right font-medium text-gray-800">৳{totalPrice.toFixed(2)}</span>
              </div>
              {/* Discount row removed */}
              <div className="grid grid-cols-2 font-semibold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span className="text-right text-[#0F9D8F]">৳{finalTotal.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-right font-medium text-green-600">Free</span>
              </div>
              <div className="grid grid-cols-2 text-gray-800">
                <span>Payable Total</span>
                <span className="text-right font-bold text-[#0F9D8F]">৳{payableTotal}</span>
              </div>
            </div>

            <div className="mt-6 mb-6">
              <p className="text-sm text-gray-500">Estimated delivery date:</p>
              <p className="text-lg font-semibold text-[#0F9D8F]">{deliveryDate}</p>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full py-3 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={closeSuccessModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 z-50 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Order Placed Successfully!</h2>
              <div className="space-y-3 text-gray-700">
                <p><span className="font-semibold">Invoice No:</span> {orderDetails?.invoiceNo}</p>
                <p><span className="font-semibold">TR Code:</span> {orderDetails?.trCode || '—'}</p>
                <p><span className="font-semibold">Delivery Code:</span> {orderDetails?.deliveryCode || '—'}</p>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={closeSuccessModal}
                  className="px-6 py-2 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white rounded-lg"
                >
                  View Order History
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
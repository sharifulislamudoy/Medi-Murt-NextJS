'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';

interface OrderItem {
  id: string;
  product: {
    name: string;
    image: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  invoiceNo: string;
  orderDate: string;
  deliveryDate: string;
  customerName: string;
  customerShopName: string | null;
  customerAddress: string;
  customerPhone: string;
  paymentMethod: string;
  paymentStatus: 'DUE' | 'PAID';
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export default function ViewOrderModal({ isOpen, onClose, order }: Props) {
  if (!order) return null;

  const paid = order.paymentStatus === 'PAID' ? order.totalAmount : 0;
  const due = order.totalAmount - paid;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-h-[80vh] overflow-y-auto p-1"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Order Info */}
        <div className="border-b pb-4 mb-4">
          <p><span className="font-semibold text-black">Invoice:</span> <span className="text-gray-600">{order.invoiceNo}</span></p>
          <p><span className="font-semibold text-black">Order Date:</span> <span className="text-gray-600">{new Date(order.orderDate).toLocaleString()}</span></p>
          <p><span className="font-semibold text-black">Delivery Date:</span> <span className="text-gray-600">{new Date(order.deliveryDate).toLocaleDateString()}</span></p>
          <p><span className="font-semibold text-black">Status:</span> 
            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
              order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {order.status}
            </span>
          </p>
          <p><span className="font-semibold text-black">Payment:</span> <span className="text-gray-600">{order.paymentMethod} ({order.paymentStatus})</span></p>
        </div>

        {/* Customer Info */}
        <div className="border-b pb-4 mb-4">
          <h3 className="font-semibold text-black text-lg mb-2">Customer Details</h3>
          <p><span className="font-medium text-black">Name:</span> <span className="text-gray-600">{order.customerName}</span></p>
          {order.customerShopName && <p><span className="font-medium text-black">Shop:</span> <span className="text-gray-600">{order.customerShopName}</span></p>}
          <p><span className="font-medium text-black">Address:</span> <span className="text-gray-600">{order.customerAddress}</span></p>
          <p><span className="font-medium text-black">Phone:</span> <span className="text-gray-600">{order.customerPhone}</span></p>
        </div>

        {/* Items */}
        <h3 className="font-semibold text-black text-lg mb-2">Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image src={item.product.image} alt={item.product.name} fill className="object-contain rounded" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.product.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0F9D8F]">৳{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t mt-4 pt-4 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-black">Subtotal</span>
            <span className="text-gray-600">৳{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-black">Paid</span>
            <span className="text-green-600">৳{paid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-black">Due</span>
            <span className="text-red-600">৳{due.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2">
            <span className="text-black">Total</span>
            <span className="text-[#0F9D8F]">৳{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
}
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Order {
  id: string;
  invoiceNo: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  status: string;
}

interface Props {
  initialOrders: Order[];
}

export default function DeliveryBoyOrdersClient({ initialOrders }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliverModal, setDeliverModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMarkDelivered = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/deliveryboy/orders/${selectedOrder.id}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to mark delivered");
      toast.success("Order marked as delivered");
      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      setDeliverModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.invoiceNo}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.customerName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.customerPhone}</td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{order.customerAddress}</td>
                <td className="px-6 py-4 text-sm font-medium text-[#0F9D8F]">৳{order.totalAmount.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(`/orders/${order.id}`, "_blank")}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setDeliverModal(true);
                      }}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Mark as Delivered"
                    >
                      <CheckCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-gray-500">No orders assigned for delivery.</div>
        )}
      </div>

      {/* Deliver Confirmation Modal */}
      <AnimatePresence>
        {deliverModal && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => !loading && setDeliverModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 z-50 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delivery</h3>
              <p className="text-gray-600 mb-6">
                Mark order <span className="font-semibold">{selectedOrder.invoiceNo}</span> as delivered?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeliverModal(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkDelivered}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
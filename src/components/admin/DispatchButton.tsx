"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  processingCount: number;
}

export default function DispatchButton({ processingCount }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDispatch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dispatch", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch");
      toast.success(`Dispatched ${data.count} orders to delivery boys`);
      setShowConfirm(false);
      // Optionally refresh page or update UI
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={processingCount === 0}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Truck size={20} />
        <span>Dispatch ({processingCount})</span>
      </button>

      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => !loading && setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 z-50 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Dispatch</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to dispatch all {processingCount} processing orders? They will be marked as <strong>SHIPPED</strong> and assigned to the respective delivery boys.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatch}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Dispatching..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
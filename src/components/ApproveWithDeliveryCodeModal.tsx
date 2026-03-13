// components/ApproveWithDeliveryCodeModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

interface DeliveryCode {
  id: string;
  code: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export default function ApproveWithDeliveryCodeModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: Props) {
  const [deliveryCodes, setDeliveryCodes] = useState<DeliveryCode[]>([]);
  const [selectedCodeId, setSelectedCodeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchUnassignedCodes();
    } else {
      setSelectedCodeId("");
    }
  }, [isOpen]);

  const fetchUnassignedCodes = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/delivery/delivery-codes/unassigned");
      const data = await res.json();
      setDeliveryCodes(data);
    } catch {
      toast.error("Failed to load delivery codes");
    } finally {
      setFetching(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedCodeId) {
      toast.error("Please select a delivery code");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Approving delivery boy...");

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED", deliveryCodeId: selectedCodeId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to approve");
      }

      toast.success("Delivery boy approved and code assigned", { id: toastId });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Assign Delivery Code</h2>
        <p className="text-gray-600 mb-6">
          Select a delivery code for this delivery boy. Only unassigned codes are shown.
        </p>

        {fetching ? (
          <div className="text-center py-4 text-gray-500">Loading codes...</div>
        ) : deliveryCodes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No unassigned delivery codes available.
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
            {deliveryCodes.map((code) => (
              <label
                key={code.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="radio"
                  name="deliveryCode"
                  value={code.id}
                  checked={selectedCodeId === code.id}
                  onChange={(e) => setSelectedCodeId(e.target.value)}
                  className="h-4 w-4 text-[#0F9D8F] border-gray-300 focus:ring-[#0F9D8F]"
                />
                <span className="font-mono text-gray-800">{code.code}</span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApprove}
            disabled={loading || fetching || deliveryCodes.length === 0 || !selectedCodeId}
            className="px-4 py-2 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Approving..." : "Approve & Assign"}
          </motion.button>
        </div>
      </motion.div>
    </Modal>
  );
}
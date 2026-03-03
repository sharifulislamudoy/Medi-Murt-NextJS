"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ResetStoreButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (confirmText !== "Reset My Store") {
      toast.error("Confirmation text does not match");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Resetting store...");

    try {
      const res = await fetch("/api/admin/reset-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reset");
      }

      toast.success("Store reset successfully", { id: toastId });
      setIsModalOpen(false);
      setConfirmText("");
      router.refresh(); // refresh server components
    } catch (error: any) {
      toast.error(error.message || "Failed to reset", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-700"
      >
        Reset Store
      </motion.button>

      <Modal isOpen={isModalOpen} onClose={() => !loading && setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reset Store</h2>
          <p className="text-gray-600 mb-4">
            This will delete <strong>all stock quantities</strong> from your store. Products themselves will remain, but their stock will be set to zero. This action cannot be undone.
          </p>
          <p className="text-gray-600 mb-2">
            Please type <span className="font-mono bg-gray-100 px-2 py-1 rounded">Reset My Store</span> to confirm.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            placeholder="Reset My Store"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={loading || confirmText !== "Reset My Store"}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Confirm Reset"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
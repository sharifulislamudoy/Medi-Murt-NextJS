'use client';

import { motion } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import { Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoiceNo: string;
  loading?: boolean;
}

export default function DeleteOrderModal({ isOpen, onClose, onConfirm, invoiceNo, loading }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-1"
      >
        <div className="flex items-center gap-3 mb-4 text-red-600">
          <Trash2 size={28} />
          <h2 className="text-2xl font-bold text-gray-800">Delete Order</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete order <span className="font-semibold">{invoiceNo}</span>? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </Modal>
  );
}
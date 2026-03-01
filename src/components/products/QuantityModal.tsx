// components/products/QuantityModal.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import { Minus, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  product: Product | null;
  maxQuantity?: number; // optional, not enforced
}

export default function QuantityModal({ isOpen, onClose, onConfirm, product, maxQuantity = 9999 }: Props) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Quantity</h3>
        <p className="text-sm text-gray-600 mb-4">{product.name}</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={decrement}
            disabled={quantity <= 1}
            className="p-2 rounded-full border border-gray-300 disabled:opacity-50"
          >
            <Minus size={20} />
          </button>
          <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
          <button
            onClick={increment}
            className="p-2 rounded-full border border-gray-300"
          >
            <Plus size={20} />
          </button>
        </div>
        {/* No stock message */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(quantity)}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#156A98] to-[#0F9D8F] rounded-lg hover:opacity-90"
          >
            Add to Cart
          </button>
        </div>
      </motion.div>
    </Modal>
  );
}
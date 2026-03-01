// components/products/ProductDetailsModal.tsx
"use client";

import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string; // still present from API but we won't display
  mrp: number;
  generic: { name: string } | null;
  brand: { name: string } | null;
  image: string;
  description: string;
  sellPrice: number;
  stock: number; // not shown
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductDetailsModal({ isOpen, onClose, product }: Props) {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-6"
      >
        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
          <Image src={product.image} alt={product.name} fill className="object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
        {/* SKU removed */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{product.category.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Generic</p>
            <p className="font-medium">{product.generic?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Brand</p>
            <p className="font-medium">{product.brand?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">MRP</p>
            <p className="font-medium">৳{product.mrp}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sell Price</p>
            <p className="font-medium text-[#0F9D8F]">৳{product.sellPrice}</p>
          </div>
          {/* Stock removed */}
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Description</p>
          <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      </motion.div>
    </Modal>
  );
}
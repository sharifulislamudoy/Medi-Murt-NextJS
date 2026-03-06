'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    image: string;
    sku: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  invoiceNo: string;
  items: OrderItem[];
  totalAmount: number;
}

interface ProductSearchResult {
  id: string;
  name: string;
  image: string;
  sku: string;
  sellPrice: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: () => void;
}

export default function EditOrderModal({ isOpen, onClose, order, onSuccess }: Props) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setItems(order.items);
    }
  }, [order]);

  // Debounced search
  useEffect(() => {
    const handler = debounce(async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/products/search?search=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setSearchResults(data.products || []);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setSearching(false);
      }
    }, 300);
    handler();
    return () => handler.cancel();
  }, [searchTerm]);

  const addOrUpdateItem = (product: ProductSearchResult) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        // Increase quantity by 1
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        // Add new item with quantity 1
        const newItem: OrderItem = {
          id: '', // temporary, will be replaced on save
          productId: product.id,
          product: {
            name: product.name,
            image: product.image,
            sku: product.sku,
          },
          quantity: 1,
          price: product.sellPrice,
        };
        return [...prev, newItem];
      }
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    if (newQuantity === 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: newQuantity } : i))
      );
    }
  };

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSave = async () => {
    if (!order) return;
    if (items.length === 0) {
      toast.error('Order must have at least one item');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Order updated');
      onSuccess();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-h-[80vh] overflow-y-auto p-1"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Order #{order.invoiceNo}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#0F9D8F] focus:border-[#0F9D8F] outline-none text-black"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          {searching && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0F9D8F]"></div>
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addOrUpdateItem(product)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image src={product.image} alt={product.name} fill className="object-contain rounded" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-sm font-semibold text-[#0F9D8F]">৳{product.sellPrice}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image src={item.product.image} alt={item.product.name} fill className="object-contain rounded" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.product.name}</p>
                <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                >
                  –
                </button>
                <span className="w-12 text-center text-black">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <div className="text-right w-20">
                <p className="font-semibold text-[#0F9D8F]">৳{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t mt-6 pt-4 flex justify-between font-bold text-lg">
          <span className="text-black">Total</span>
          <span className="text-[#0F9D8F]">৳{totalAmount.toFixed(2)}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#0F9D8F] text-white py-2 rounded-lg hover:bg-[#0c7d72] transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </Modal>
  );
}
"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Product {
    id: string;
    name: string;
    image: string;
    sellPrice: number;
}

export default function AddToCartButton({ product }: { product: Product }) {
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));

    const handleAdd = () => {
        addItem(product, quantity);
        setQuantity(1); // reset after adding
    };

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                    onClick={decrement}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:text-[#0F9D8F] disabled:opacity-50"
                >
                    <Minus size={20} />
                </button>
                <span className="w-12 text-center text-black font-medium">{quantity}</span>
                <button
                    onClick={increment}
                    className="px-3 py-2 text-gray-600 hover:text-[#0F9D8F]"
                >
                    <Plus size={20} />
                </button>
            </div>
            <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white py-2 px-6 rounded-lg hover:opacity-90"
            >
                <ShoppingCart size={20} />
                Add to Cart
            </button>
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Eye, LayoutGrid, Table, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import ProductDetailsModal from "@/components/products/ProductDetailsModal";
import QuantityModal from "@/components/products/QuantityModal";

interface Product {
    id: string;
    name: string;
    category: string;
    sku: string;
    mrp: number;
    generic: { name: string } | null;
    brand: { name: string } | null;
    image: string;
    description: string;
    sellPrice: number;
    stock: number;
    availability: boolean;
}

type ViewMode = "card" | "table";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("card");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isQuantityOpen, setIsQuantityOpen] = useState(false);
    const [productToAdd, setProductToAdd] = useState<Product | null>(null);
    const { addItem } = useCart();

    // Load products
    useEffect(() => {
        fetch("/api/products")
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setFiltered(data);
            });
    }, []);

    // Load saved view mode
    useEffect(() => {
        const saved = localStorage.getItem("productViewMode") as ViewMode | null;
        if (saved && (saved === "card" || saved === "table")) {
            setViewMode(saved);
        }
    }, []);

    // Save view mode
    useEffect(() => {
        localStorage.setItem("productViewMode", viewMode);
    }, [viewMode]);

    // Filter products
    useEffect(() => {
        const lower = search.toLowerCase();
        setFiltered(
            products.filter(
                p =>
                    p.name.toLowerCase().includes(lower) ||
                    p.generic?.name.toLowerCase().includes(lower) ||
                    p.brand?.name.toLowerCase().includes(lower)
            )
        );
    }, [search, products]);

    const handleAddToCart = (product: Product) => {
        setProductToAdd(product);
        setIsQuantityOpen(true);
    };

    const handleQuantityConfirm = (quantity: number) => {
        if (productToAdd) {
            addItem(productToAdd, quantity);
            setIsQuantityOpen(false);
            setProductToAdd(null);
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.03, duration: 0.3 },
        }),
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
            {/* Header with search and toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0F9D8F] focus:border-[#0F9D8F] outline-none"
                    />
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("card")}
                            className={`p-2 rounded-md transition ${viewMode === "card" ? "bg-white shadow text-[#0F9D8F]" : "text-gray-600"
                                }`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-md transition ${viewMode === "table" ? "bg-white shadow text-[#0F9D8F]" : "text-gray-600"
                                }`}
                        >
                            <Table size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Display */}
            {viewMode === "card" ? (
                /* ---------- CARD VIEW ---------- */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filtered.map((product, i) => (
                            <motion.div
                                key={product.id}
                                custom={i}
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                            >
                                <div className="relative h-48 w-full">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">{product.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {product.generic?.name} {product.brand?.name && `| ${product.brand.name}`}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xl font-bold text-[#0F9D8F]">৳{product.sellPrice}</span>
                                        <span className={`text-sm ${product.availability ? 'text-green-600' : 'text-red-500'}`}>
                                            {product.availability ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setIsDetailsOpen(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                                        >
                                            <Eye size={18} /> Details
                                        </button>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white py-2 rounded-lg hover:opacity-90"
                                        >
                                            <ShoppingCart size={18} /> Add
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                /* ---------- TABLE VIEW ---------- */
                <>
                    {/* Desktop Table (7 columns) - hidden on small screens */}
                    <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Generic</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Brand</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Availability</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filtered.map((product, i) => (
                                        <motion.tr
                                            key={product.id}
                                            custom={i}
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit={{ opacity: 0, x: -20 }}
                                            layout
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{product.generic?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{product.brand?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">৳{product.sellPrice}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`text-sm ${product.availability ? 'text-green-600' : 'text-red-500'}`}>
                                                    {product.availability ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setIsDetailsOpen(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        <ShoppingCart size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="text-center py-12 text-gray-500">No products found.</div>
                        )}
                    </div>

                    {/* Mobile Table (3 columns: Image, Info, Actions) - shown only on small screens */}
                    <div className="block md:hidden bg-white rounded-xl shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Image</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product Info</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filtered.map((product, i) => (
                                        <motion.tr
                                            key={product.id}
                                            custom={i}
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit={{ opacity: 0, x: -20 }}
                                            layout
                                            className="hover:bg-gray-50"
                                        >
                                            {/* Image Column */}
                                            <td className="px-4 py-4">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                </div>
                                            </td>

                                            {/* Combined Info Column */}
                                            <td className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-600">
                                                        {product.generic?.name && <span>{product.generic.name} |</span>}
                                                        {product.brand?.name && <span> {product.brand.name}</span>}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-semibold text-[#0F9D8F]">৳{product.sellPrice}</span>
                                                        <span className={`text-sm ${product.availability ? 'text-green-600' : 'text-red-500'}`}>
                                                            {product.availability ? 'In Stock' : 'Out of Stock'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Actions Column */}
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setIsDetailsOpen(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        aria-label="Details"
                                                    >
                                                        <Eye size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        className="text-green-600 hover:text-green-800"
                                                        aria-label="Add to cart"
                                                    >
                                                        <ShoppingCart size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="text-center py-12 text-gray-500">No products found.</div>
                        )}
                    </div>
                </>
            )}

            {/* Modals */}
            <ProductDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                product={selectedProduct}
            />
            <QuantityModal
                isOpen={isQuantityOpen}
                onClose={() => {
                    setIsQuantityOpen(false);
                    setProductToAdd(null);
                }}
                onConfirm={handleQuantityConfirm}
                product={productToAdd}
                maxQuantity={9999}
            />
        </motion.div>
    );
}
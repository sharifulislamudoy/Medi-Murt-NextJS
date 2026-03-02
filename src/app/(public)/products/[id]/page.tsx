import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/products/AddToCartButton"; // We'll create this component

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: Props) {
    const { id } = await params;

    // Fetch main product
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            generic: true,
            brand: true,
        },
    });

    if (!product) {
        notFound();
    }

    // Fetch similar products: same generic, different brand (or any brand if same generic)
    const similarProducts = await prisma.product.findMany({
        where: {
            genericId: product.genericId,
            id: { not: product.id },
            status: true,
        },
        include: {
            brand: true,
            generic: true,
        },
        take: 4,
    });

    // Fetch suggested products: same brand, different generic
    const suggestedProducts = await prisma.product.findMany({
        where: {
            brandId: product.brandId,
            id: { not: product.id },
            status: true,
            genericId: { not: product.genericId }, // different generic
        },
        include: {
            brand: true,
            generic: true,
        },
        take: 4,
    });

    const discount = product.mrp > product.sellPrice
        ? Math.round(((product.mrp - product.sellPrice) / product.mrp) * 100)
        : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm mb-6">
                <Link href="/" className="text-gray-500 hover:text-[#0F9D8F]">Home</Link>
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/products" className="text-gray-500 hover:text-[#0F9D8F]">Products</Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-700">{product.name}</span>
            </nav>

            {/* Main Product */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="md:flex">
                    {/* Image */}
                    <div className="md:w-1/2 relative h-80 md:h-auto">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                        />
                        {discount > 0 && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                {discount}% OFF
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="md:w-1/2 p-6 md:p-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                        <p className="text-gray-600 mb-4">
                            {product.generic?.name} {product.brand?.name && `by ${product.brand.name}`}
                        </p>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-3xl font-bold text-[#0F9D8F]">৳{product.sellPrice}</span>
                            {product.mrp > product.sellPrice && (
                                <span className="text-xl text-gray-400 line-through">৳{product.mrp}</span>
                            )}
                        </div>

                        <div className="space-y-3 mb-6">
                            <p><span className="font-medium text-gray-700">Category:</span> {product.category.replace('_', ' ')}</p>
                            <p><span className="font-medium text-gray-700">Availability:</span> 
                                <span className={`ml-2 ${product.availability ? 'text-green-600' : 'text-red-500'}`}>
                                    {product.availability ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </p>
                            {product.stock > 0 && (
                                <p><span className="font-medium text-gray-700">Stock:</span> {product.stock} units</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
                        </div>

                        {/* Add to Cart button (client component) */}
                        <AddToCartButton product={product} />
                    </div>
                </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Products (Same Generic)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {similarProducts.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* Suggested Products */}
            {suggestedProducts.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Suggested Products (Same Brand)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {suggestedProducts.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

// Helper component for product cards in related sections
function ProductCard({ product }: { product: any }) {
    const discount = product.mrp > product.sellPrice
        ? Math.round(((product.mrp - product.sellPrice) / product.mrp) * 100)
        : 0;

    return (
        <Link href={`/products/${product.id}`} className="group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="relative h-40 w-full">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                    />
                    {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {discount}% OFF
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {product.generic?.name} | {product.brand?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-[#0F9D8F]">৳{product.sellPrice}</span>
                        {product.mrp > product.sellPrice && (
                            <span className="text-xs text-gray-400 line-through">৳{product.mrp}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function DeliveryBoyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "DELIVERY_BOY") {
    return <div className="text-center py-12 text-red-600">Unauthorized</div>;
  }

  const { id } = await params;

  // Get delivery boy's assigned delivery code
  const deliveryBoy = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { deliveryCodeId: true },
  });

  if (!deliveryBoy?.deliveryCodeId) {
    return <div className="text-center py-12">No delivery area assigned.</div>;
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { name: true, image: true } },
        },
      },
    },
  });

  if (!order || order.deliveryCodeId !== deliveryBoy.deliveryCodeId) {
    return <div className="text-center py-12">Order not found or not assigned to you.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/deliveryboy/orders" className="text-[#0F9D8F] hover:underline mb-4 inline-block">
        ← Back to orders
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order #{order.invoiceNo}</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        {/* Customer Info */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer Details</h2>
          <p><span className="font-medium">Name:</span> {order.customerName}</p>
          {order.customerShopName && <p><span className="font-medium">Shop:</span> {order.customerShopName}</p>}
          <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
          <p><span className="font-medium">Address:</span> {order.customerAddress}</p>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-contain" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.product.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#0F9D8F]">৳{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-[#0F9D8F]">৳{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
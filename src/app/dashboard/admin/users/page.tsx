// app/dashboard/admin/users/page.tsx

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersTable from "@/components/UsersTable";


export default async function AdminUsersPage() {
  // 🔒 Check if user is logged in
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 🔒 Only admin can access this page
  if (session.user.role !== "ADMIN") {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
        <p className="text-gray-600 mt-2">You do not have access to this page.</p>
      </div>
    );
  }

  // 📦 Fetch ALL users from the database
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      shopName: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" }, // newest first
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 mt-1">
          View and manage all registered users
        </p>
      </div>
      <UsersTable
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(), // convert Date → string
        }))}
      />
    </div>
  );
}
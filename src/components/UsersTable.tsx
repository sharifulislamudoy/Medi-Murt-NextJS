// components/UsersTable.tsx
"use client";

import { useState } from "react";
import StatusActionButton from "@/components/StatusActionButton";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  shopName: string | null;
  role: "ADMIN" | "SHOP_OWNER" | "DELIVERY_BOY" | "SUPPLIER";
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  createdAt: string;
};

type Props = {
  users: User[];
};

const TABS: { label: string; status: User["status"] | null }[] = [
  { label: "All", status: null },
  { label: "Approved", status: "APPROVED" },
  { label: "Pending", status: "PENDING" },
  { label: "Rejected", status: "REJECTED" },
  { label: "Suspended", status: "SUSPENDED" },
];

export default function UsersTable({ users }: Props) {
  const [activeTab, setActiveTab] = useState<User["status"] | null>(null);

  const filteredUsers =
    activeTab === null
      ? users
      : users.filter((user) => user.status === activeTab);

  const statusBadge: Record<User["status"], string> = {
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    SUSPENDED: "bg-gray-100 text-gray-800",
  };

  const roleBadge: Record<User["role"], string> = {
    ADMIN: "bg-purple-100 text-purple-800",
    SHOP_OWNER: "bg-blue-100 text-blue-800",
    DELIVERY_BOY: "bg-orange-100 text-orange-800",
    SUPPLIER: "bg-teal-100 text-teal-800",
  };

  return (
    <div>
      {/* ===== TABS ===== */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl shadow p-1 w-fit flex-wrap">
        {TABS.map((tab) => {
          const count =
            tab.status === null
              ? users.length
              : users.filter((u) => u.status === tab.status).length;

          const isActive = activeTab === tab.status;

          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? "bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ===== TABLE or EMPTY STATE ===== */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No users found
          </h3>
          <p className="mt-1 text-gray-500">
            There are no users with this status.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Address",
                    "Shop Name",
                    "Role",
                    "Status",
                    "Registered",
                    "Actions", // 👈 new column
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                        heading === "Actions" ? "text-right" : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.email}</div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.phone}</div>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4">
                      <div
                        className="text-sm text-gray-700 max-w-[160px] truncate"
                        title={user.address}
                      >
                        {user.address}
                      </div>
                    </td>

                    {/* Shop Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {user.shopName ?? (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleBadge[user.role]}`}
                      >
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBadge[user.status]}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>

                    {/* 
                      ===== ACTION BUTTON =====
                      Pass the user's id and current status.
                      The component figures out which actions to show.
                    */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <StatusActionButton
                        userId={user.id}
                        currentStatus={user.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
}
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

// Define a union type for filter values
type FilterValue =
  | { type: "status"; value: User["status"] }
  | { type: "role"; value: User["role"] }
  | null; // null represents "All"


type TabItem =
  | {
    label: string;
    filter: FilterValue;
    isSeparator?: false;
  }
  | {
    isSeparator: true;
    label?: string;
    filter?: null;
  };
// Tab configuration – each tab has a label and a corresponding filter value
const TABS: TabItem[] = [
  { label: "All", filter: null },

  // Status tabs
  { label: "Approved", filter: { type: "status", value: "APPROVED" } },
  { label: "Pending", filter: { type: "status", value: "PENDING" } },
  { label: "Rejected", filter: { type: "status", value: "REJECTED" } },
  { label: "Suspended", filter: { type: "status", value: "SUSPENDED" } },

  // Separator
  { isSeparator: true },

  // Role tabs
  { label: "Shop Owner", filter: { type: "role", value: "SHOP_OWNER" } },
  { label: "Delivery Boy", filter: { type: "role", value: "DELIVERY_BOY" } },
  { label: "Supplier", filter: { type: "role", value: "SUPPLIER" } },
  { label: "Admin", filter: { type: "role", value: "ADMIN" } },
];



export default function UsersTable({ users }: Props) {
  const [currentFilter, setCurrentFilter] = useState<FilterValue>(null);

  // Filter users based on current filter
  const filteredUsers = users.filter((user) => {
    if (currentFilter === null) return true;
    if (currentFilter.type === "status") {
      return user.status === currentFilter.value;
    } else {
      return user.role === currentFilter.value;
    }
  });

  // Helper to get count for a tab
  const getCount = (filter: FilterValue) => {
    if (filter === null) return users.length;
    if (filter.type === "status") {
      return users.filter((u) => u.status === filter.value).length;
    } else {
      return users.filter((u) => u.role === filter.value).length;
    }
  };

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
      {/* ===== COMBINED TABS (Status + Role) ===== */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl shadow p-1 w-fit flex-wrap items-center">
        {TABS.map((tab, index) => {
          // Special handling for separator
          if (tab.isSeparator) {
            return (
              <span
                key={`sep-${index}`}
                className="w-px h-6 bg-gray-300 mx-2"
                aria-hidden="true"
              />
            );
          }

          const count = getCount(tab.filter);
          const isActive =
            tab.filter === null
              ? currentFilter === null
              : currentFilter !== null &&
              currentFilter.type === tab.filter.type &&
              currentFilter.value === tab.filter.value;

          return (
            <button
              key={tab.label}
              onClick={() => setCurrentFilter(tab.filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive
                ? "bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 hidden 2xl:flex rounded-full ${isActive
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
            Try selecting a different filter.
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
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${heading === "Actions" ? "text-right" : "text-left"
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

                    {/* Action Button */}
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
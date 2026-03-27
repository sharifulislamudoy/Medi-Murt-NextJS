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
  vehicle?: string | null;
  createdAt: string;
  area: { name: string; trCode: string } | null;
  deliveryCode?: { id: string; code: string } | null;
  bankAccountNumber?: string | null;
  bankBranch?: string | null;
  accountHolderName?: string | null;
};

type Props = { users: User[] };

type FilterValue =
  | { type: "status"; value: User["status"] }
  | { type: "role"; value: User["role"] }
  | null;

type TabItem =
  | { label: string; filter: FilterValue; isSeparator?: false }
  | { isSeparator: true; label?: string; filter?: null };

const TABS: TabItem[] = [
  { label: "All", filter: null },
  { label: "Approved", filter: { type: "status", value: "APPROVED" } },
  { label: "Pending", filter: { type: "status", value: "PENDING" } },
  { label: "Rejected", filter: { type: "status", value: "REJECTED" } },
  { label: "Suspended", filter: { type: "status", value: "SUSPENDED" } },
  { isSeparator: true },
  { label: "Shop Owner", filter: { type: "role", value: "SHOP_OWNER" } },
  { label: "Delivery Boy", filter: { type: "role", value: "DELIVERY_BOY" } },
  { label: "Supplier", filter: { type: "role", value: "SUPPLIER" } },
  { label: "Admin", filter: { type: "role", value: "ADMIN" } },
];

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function UsersTable({ users }: Props) {
  const [currentFilter, setCurrentFilter] = useState<FilterValue>(null);

  const filteredUsers = users.filter((user) => {
    if (currentFilter === null) return true;
    if (currentFilter.type === "status") {
      return user.status === currentFilter.value;
    } else {
      return user.role === currentFilter.value;
    }
  });

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

  type Column = {
    key: string;
    header: string;
    render: (user: User) => React.ReactNode;
    align?: "left" | "right";
  };

  const getColumns = (filter: FilterValue): Column[] => {
    const nameCol: Column = {
      key: "name",
      header: "Name",
      render: (user) => (
        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
      ),
    };
    const emailCol: Column = {
      key: "email",
      header: "Email",
      render: (user) => <div className="text-sm text-gray-700">{user.email}</div>,
    };
    const phoneCol: Column = {
      key: "phone",
      header: "Phone",
      render: (user) => <div className="text-sm text-gray-700">{user.phone}</div>,
    };
    const roleCol: Column = {
      key: "role",
      header: "Role",
      render: (user) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            roleBadge[user.role]
          }`}
        >
          {user.role.replace(/_/g, " ")}
        </span>
      ),
    };
    const statusCol: Column = {
      key: "status",
      header: "Status",
      render: (user) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            statusBadge[user.status]
          }`}
        >
          {user.status}
        </span>
      ),
    };
    const registeredCol: Column = {
      key: "registered",
      header: "Registered",
      render: (user) => (
        <div className="text-sm text-gray-700">{formatDate(user.createdAt)}</div>
      ),
    };
    const actionsCol: Column = {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (user) => (
        <StatusActionButton
          userId={user.id}
          currentStatus={user.status}
          userRole={user.role}
          currentDeliveryCodeId={user.deliveryCode?.id}
        />
      ),
    };

    const addressCol: Column = {
      key: "address",
      header: "Address",
      render: (user) => (
        <div className="text-sm text-gray-700 max-w-[160px] truncate" title={user.address}>
          {user.address}
        </div>
      ),
    };
    const shopNameCol: Column = {
      key: "shopName",
      header: "Shop Name",
      render: (user) => (
        <div className="text-sm text-gray-700">
          {user.shopName ?? <span className="text-gray-400 italic">N/A</span>}
        </div>
      ),
    };
    const trCodeCol: Column = {
      key: "trCode",
      header: "TR Code",
      render: (user) => (
        <div className="text-sm text-gray-700">
          {user.area?.trCode ?? <span className="text-gray-400 italic">—</span>}
        </div>
      ),
    };
    const vehicleCol: Column = {
      key: "vehicle",
      header: "Vehicle",
      render: (user) => (
        <div className="text-sm text-gray-700">
          {user.vehicle ?? <span className="text-gray-400 italic">—</span>}
        </div>
      ),
    };
    const deliveryCodeCol: Column = {
      key: "deliveryCode",
      header: "Delivery Code",
      render: (user) => (
        <div className="text-sm text-gray-700">
          {user.deliveryCode?.code ?? <span className="text-gray-400 italic">Not assigned</span>}
        </div>
      ),
    };

    // New bank details column for suppliers
    const bankDetailsCol: Column = {
      key: "bankDetails",
      header: "Bank Details",
      render: (user) => (
        <div className="text-xs text-gray-700 space-y-0.5">
          <div><span className="font-medium">Account:</span> {user.bankAccountNumber || '—'}</div>
          <div><span className="font-medium">Branch:</span> {user.bankBranch || '—'}</div>
          <div><span className="font-medium">Holder:</span> {user.accountHolderName || '—'}</div>
        </div>
      ),
    };

    if (filter === null || filter.type === "status") {
      return [
        nameCol,
        emailCol,
        phoneCol,
        roleCol,
        statusCol,
        registeredCol,
        actionsCol,
      ];
    }

    const role = filter.value;
    switch (role) {
      case "SHOP_OWNER":
        return [
          nameCol,
          emailCol,
          phoneCol,
          addressCol,
          shopNameCol,
          trCodeCol,
          roleCol,
          statusCol,
          registeredCol,
          actionsCol,
        ];
      case "DELIVERY_BOY":
        return [
          nameCol,
          emailCol,
          phoneCol,
          vehicleCol,
          deliveryCodeCol,
          roleCol,
          statusCol,
          registeredCol,
          actionsCol,
        ];
      case "SUPPLIER":
        return [
          nameCol,
          emailCol,
          phoneCol,
          shopNameCol,
          addressCol,
          bankDetailsCol,
          roleCol,
          statusCol,
          registeredCol,
          actionsCol,
        ];
      case "ADMIN":
        return [
          nameCol,
          emailCol,
          phoneCol,
          roleCol,
          statusCol,
          registeredCol,
          actionsCol,
        ];
      default:
        return [
          nameCol,
          emailCol,
          phoneCol,
          roleCol,
          statusCol,
          registeredCol,
          actionsCol,
        ];
    }
  };

  const columns = getColumns(currentFilter);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl shadow p-1 w-fit flex-wrap items-center">
        {TABS.map((tab, index) => {
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? "bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 hidden 2xl:flex rounded-full ${
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

      {/* Table */}
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
          <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-gray-500">Try selecting a different filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={`${user.id}-${col.key}`}
                        className={`px-6 py-4 whitespace-nowrap ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {col.render(user)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
}
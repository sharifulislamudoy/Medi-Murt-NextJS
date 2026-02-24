// components/StatusActionButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

type Props = {
  userId: string;
  currentStatus: UserStatus;
};

// 📝 What actions are available from each status
const ALLOWED_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  PENDING: ["APPROVED", "REJECTED", "SUSPENDED"],
  APPROVED: ["REJECTED", "SUSPENDED"],
  REJECTED: ["APPROVED"],
  SUSPENDED: ["APPROVED"],
};

// 🎨 Button style for each target status
const ACTION_STYLES: Record<UserStatus, string> = {
  APPROVED: "text-green-700 hover:bg-green-50",
  REJECTED: "text-red-700 hover:bg-red-50",
  SUSPENDED: "text-gray-700 hover:bg-gray-50",
  PENDING: "text-yellow-700 hover:bg-yellow-50",
};

// 🎨 Icon for each target status
const ACTION_ICONS: Record<UserStatus, string> = {
  APPROVED: "✅",
  REJECTED: "❌",
  SUSPENDED: "🔒",
  PENDING: "⏳",
};

export default function StatusActionButton({ userId, currentStatus }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 🔍 Get the list of available transitions for this user
  const availableActions = ALLOWED_TRANSITIONS[currentStatus];

  // 🖱️ Close dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚀 Handle the status change API call
  async function handleStatusChange(newStatus: UserStatus) {
    setIsLoading(true);
    setIsOpen(false);

    try {
      const res = await fetch("/api/admin/users/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      // 🔄 Refresh the page data without full reload
      // This re-runs the server component and gets fresh data from DB
      router.refresh();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // If no actions available (edge case), show nothing
  if (availableActions.length === 0) {
    return <span className="text-xs text-gray-400 italic">No actions</span>;
  }

  return (
    // Relative wrapper so the dropdown positions correctly
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* ===== TRIGGER BUTTON ===== */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[#156A98] to-[#0F9D8F] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {isLoading ? (
          // Loading spinner
          <>
            <svg
              className="animate-spin h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Updating...
          </>
        ) : (
          <>
            Actions
            {/* Chevron icon — flips when open */}
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {/* ===== DROPDOWN MENU ===== */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {/* Label at the top of dropdown */}
            <p className="px-3 py-1.5 text-xs text-gray-400 font-medium uppercase tracking-wider border-b border-gray-100 mb-1">
              Change Status
            </p>

            {/* Render one button per available action */}
            {availableActions.map((action) => (
              <button
                key={action}
                onClick={() => handleStatusChange(action)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${ACTION_STYLES[action]}`}
              >
                <span>{ACTION_ICONS[action]}</span>
                {/* Format: SHOP_OWNER → Shop Owner style */}
                Mark as {action.charAt(0) + action.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
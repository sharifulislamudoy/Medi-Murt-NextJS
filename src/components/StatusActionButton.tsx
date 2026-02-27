"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal"; // Reuse your existing modal

type UserStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

type Props = {
  userId: string;
  currentStatus: UserStatus;
};

const ALLOWED_TRANSITIONS: Record<UserStatus, UserStatus[]> = {
  PENDING: ["APPROVED", "REJECTED", "SUSPENDED"],
  APPROVED: ["REJECTED", "SUSPENDED"],
  REJECTED: ["APPROVED"],
  SUSPENDED: ["APPROVED"],
};

const ACTION_STYLES: Record<UserStatus, string> = {
  APPROVED: "text-green-700 hover:bg-green-50",
  REJECTED: "text-red-700 hover:bg-red-50",
  SUSPENDED: "text-gray-700 hover:bg-gray-50",
  PENDING: "text-yellow-700 hover:bg-yellow-50",
};

const ACTION_ICONS: Record<UserStatus, string> = {
  APPROVED: "✅",
  REJECTED: "❌",
  SUSPENDED: "🔒",
  PENDING: "⏳",
};

export default function StatusActionButton({ userId, currentStatus }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<UserStatus | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const availableActions = ALLOWED_TRANSITIONS[currentStatus];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActionClick = (newStatus: UserStatus) => {
    setPendingAction(newStatus);
    setShowConfirm(true);
    setIsOpen(false);
  };

  const confirmStatusChange = async () => {
    if (!pendingAction) return;
    setIsLoading(true);
    setShowConfirm(false);

    const toastId = toast.loading(`Updating status to ${pendingAction.toLowerCase()}...`);

    try {
      const res = await fetch("/api/admin/users/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newStatus: pendingAction }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      toast.success(`Status updated to ${pendingAction.toLowerCase()}`, { id: toastId });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong", { id: toastId });
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  if (availableActions.length === 0) {
    return <span className="text-xs text-gray-400 italic">No actions</span>;
  }

  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-[#156A98] to-[#0F9D8F] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Updating...
            </>
          ) : (
            <>
              Actions
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <p className="px-3 py-1.5 text-xs text-gray-400 font-medium uppercase tracking-wider border-b border-gray-100 mb-1">
                Change Status
              </p>
              {availableActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleActionClick(action)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${ACTION_STYLES[action]}`}
                >
                  <span>{ACTION_ICONS[action]}</span>
                  Mark as {action.charAt(0) + action.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-left">Confirm Status Change</h3>
          <p className="text-sm text-gray-500 text-left">
            Are you sure you want to change this user's status to{" "}
            <span className="font-semibold">{pendingAction?.toLowerCase()}</span>?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmStatusChange}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#156A98] to-[#0F9D8F] rounded-lg hover:opacity-90"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
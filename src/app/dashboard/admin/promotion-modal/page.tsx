"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import CreatePromotionModal from "@/components/admin/CreatePromotionModal";
import EditPromotionModal from "@/components/admin/EditPromotionModal";

interface PromotionModal {
  id: string;
  title: string;
  imageUrl: string;
  hyperlink?: string;
  isVisible: boolean;
}

export default function PromotionModalPage() {
  const [modals, setModals] = useState<PromotionModal[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedModal, setSelectedModal] = useState<PromotionModal | null>(null);

  // Confirmation state
  const [confirmDelete, setConfirmDelete] = useState<PromotionModal | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<PromotionModal | null>(null);

  const fetchModals = async () => {
    const res = await fetch("/api/admin/promotion-modal");
    const data = await res.json();
    setModals(data);
  };

  useEffect(() => {
    fetchModals();
  }, []);

  const handleDelete = async (modal: PromotionModal) => {
    const toastId = toast.loading("Deleting promotion modal...");
    try {
      const res = await fetch(`/api/admin/promotion-modal/${modal.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Promotion modal deleted", { id: toastId });
      fetchModals();
    } catch (error) {
      toast.error("Failed to delete", { id: toastId });
    }
    setConfirmDelete(null);
  };

  const handleToggleVisibility = async (modal: PromotionModal) => {
    const newVisibility = !modal.isVisible;
    // Optimistic update
    setModals((prev) =>
      prev.map((m) => (m.id === modal.id ? { ...m, isVisible: newVisibility } : m))
    );

    const toastId = toast.loading(newVisibility ? "Showing modal..." : "Hiding modal...");
    try {
      const res = await fetch(`/api/admin/promotion-modal/${modal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: newVisibility }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update");
      }
      toast.success(newVisibility ? "Modal is now visible" : "Modal hidden", { id: toastId });
      // Refresh to get correct order (only one visible)
      fetchModals();
    } catch (error: any) {
      // Revert optimistic update
      setModals((prev) =>
        prev.map((m) => (m.id === modal.id ? { ...m, isVisible: modal.isVisible } : m))
      );
      toast.error(error.message || "Failed to update visibility", { id: toastId });
    }
    setConfirmToggle(null);
  };

  const handleEdit = (modal: PromotionModal) => {
    setSelectedModal(modal);
    setIsEditModalOpen(true);
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Promotion Modals</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-colors"
        >
          + Create Promotion Modal
        </motion.button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Visible
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {modals.map((modal, index) => (
                <motion.tr
                  key={modal.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={modal.imageUrl}
                        alt={modal.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{modal.title}</td>

                  {/* Toggle Switch with Confirmation */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setConfirmToggle(modal)}
                      className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#156A98]"
                      style={{ backgroundColor: modal.isVisible ? "#16a34a" : "#d1d5db" }}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                          modal.isVisible ? "left-[calc(100%-18px)]" : "left-[2px]"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(modal)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        aria-label="Edit promotion modal"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(modal)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        aria-label="Delete promotion modal"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {modals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-gray-500"
          >
            No promotion modals yet.
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreatePromotionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchModals}
      />
      <EditPromotionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedModal(null);
        }}
        onSuccess={fetchModals}
        modal={selectedModal}
      />

      {/* Confirmation Modal for Delete */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{confirmDelete?.title}</span>? This action cannot be
            undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Toggle Visibility */}
      <Modal isOpen={!!confirmToggle} onClose={() => setConfirmToggle(null)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Visibility Change</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to {confirmToggle?.isVisible ? "hide" : "show"}{" "}
            <span className="font-semibold">{confirmToggle?.title}</span>?
            {!confirmToggle?.isVisible &&
              " This will make this modal visible and hide any currently visible modal."}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setConfirmToggle(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => confirmToggle && handleToggleVisibility(confirmToggle)}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#156A98] to-[#0F9D8F] rounded-lg hover:opacity-90"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
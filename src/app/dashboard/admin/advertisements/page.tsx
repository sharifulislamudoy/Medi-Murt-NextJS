"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateAdvertisementModal from "@/components/admin/CreateAdvertisementModal";
import EditAdvertisementModal from "@/components/admin/EditAdvertisementModal";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal"; // For confirmation

interface Ad {
  id: string;
  title: string;
  category: string;
  isVisible: boolean;
  imageUrl: string;
  hyperlink?: string;
}

export default function AdvertisementPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  // Confirmation state
  const [confirmDelete, setConfirmDelete] = useState<Ad | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Ad | null>(null);

  const fetchAds = async () => {
    const res = await fetch("/api/admin/advertisement");
    const data = await res.json();
    setAds(data);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (ad: Ad) => {
    const toastId = toast.loading("Deleting advertisement...");
    try {
      const res = await fetch(`/api/admin/advertisement/${ad.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Advertisement deleted", { id: toastId });
      fetchAds();
    } catch (error) {
      toast.error("Failed to delete", { id: toastId });
    }
    setConfirmDelete(null);
  };

  const handleToggleVisibility = async (ad: Ad) => {
    const newVisibility = !ad.isVisible;
    // Optimistic update
    setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, isVisible: newVisibility } : a)));

    const toastId = toast.loading(newVisibility ? "Showing ad..." : "Hiding ad...");
    try {
      const res = await fetch(`/api/admin/advertisement/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ad, isVisible: newVisibility }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(newVisibility ? "Ad is now visible" : "Ad hidden", { id: toastId });
    } catch (error) {
      // Revert on error
      setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, isVisible: ad.isVisible } : a)));
      toast.error("Failed to update visibility", { id: toastId });
    }
    setConfirmToggle(null);
  };

  const handleEdit = (ad: Ad) => {
    setSelectedAd(ad);
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
        <h1 className="text-3xl font-bold text-gray-800">Advertisements</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-colors"
        >
          + Create Advertisement
        </motion.button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Visible</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {ads.map((ad, index) => (
                <motion.tr
                  key={ad.id}
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
                      <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ad.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ad.category}</td>

                  {/* Toggle Switch with Confirmation */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setConfirmToggle(ad)}
                      className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#156A98]"
                      style={{ backgroundColor: ad.isVisible ? "#16a34a" : "#d1d5db" }}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200 ${
                          ad.isVisible ? "left-[calc(100%-18px)]" : "left-[2px]"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(ad)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        aria-label="Edit advertisement"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(ad)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        aria-label="Delete advertisement"
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
        {ads.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-500">
            No advertisements yet.
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateAdvertisementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchAds}
      />
      <EditAdvertisementModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAd(null);
        }}
        onSuccess={fetchAds}
        ad={selectedAd}
      />

      {/* Confirmation Modal for Delete */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete <span className="font-semibold">{confirmDelete?.title}</span>? This action cannot be undone.
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
            Are you sure you want to {confirmToggle?.isVisible ? "hide" : "show"} <span className="font-semibold">{confirmToggle?.title}</span>?
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
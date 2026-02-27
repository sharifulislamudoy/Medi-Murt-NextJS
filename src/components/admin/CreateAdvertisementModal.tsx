"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import toast from "react-hot-toast";

const cloudName = "dohhfubsa";
const uploadPreset = "react_unsigned";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAdvertisementModal({ isOpen, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ANNOUNCEMENT");
  const [hyperlink, setHyperlink] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploading(false);
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !category) {
      toast.error("Required fields missing");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating advertisement...");

    try {
      const res = await fetch("/api/admin/advertisement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl, category, hyperlink, isVisible }),
      });

      if (!res.ok) throw new Error("Failed to create");

      toast.success("Advertisement created", { id: toastId });
      onSuccess();
      onClose();
      // Reset form
      setTitle("");
      setCategory("ANNOUNCEMENT");
      setHyperlink("");
      setIsVisible(true);
      setImageUrl("");
    } catch (error) {
      toast.error("Failed to create advertisement", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Advertisement</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              placeholder="e.g. Summer Sale"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0F9D8F] focus:border-[#0F9D8F] outline-none transition text-black"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <motion.select
              whileFocus={{ scale: 1.01 }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0F9D8F] focus:border-[#0F9D8F] outline-none transition text-black"
              required
            >
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="PRODUCT">Product</option>
            </motion.select>
          </div>

          {/* Hyperlink */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hyperlink (optional)</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              placeholder="https://example.com"
              value={hyperlink}
              onChange={(e) => setHyperlink(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#0F9D8F] focus:border-[#0F9D8F] outline-none transition text-black"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image *</label>
            <motion.input
              whileHover={{ scale: 1.01 }}
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (!e.target.files) return;
                const url = await uploadImage(e.target.files[0]);
                setImageUrl(url);
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0F9D8F]/10 file:text-[#0F9D8F] hover:file:bg-[#0F9D8F]/20 transition"
              required
            />
            {uploading && <p className="mt-2 text-xs text-gray-500">Uploading...</p>}
            {imageUrl && !uploading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                <p className="text-xs text-green-600 mb-1">✅ Uploaded successfully</p>
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                  <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Visibility */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <motion.input
              whileTap={{ scale: 0.95 }}
              type="checkbox"
              checked={isVisible}
              onChange={() => setIsVisible(!isVisible)}
              className="w-5 h-5 text-[#0F9D8F] rounded focus:ring-[#0F9D8F]"
            />
            <span className="text-sm text-gray-700">Visible on site</span>
          </label>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Advertisement"
            )}
          </motion.button>
        </form>
      </motion.div>
    </Modal>
  );
}
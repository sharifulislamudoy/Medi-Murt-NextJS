"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [copied, setCopied] = useState(false);

  // Messages in Bengali
  let title = " Authentication Error";
  let message = "লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
  let supportMessage = "";

  if (error === "ACCOUNT_NOT_APPROVED") {
    message = "আপনার অ্যাকাউন্ট Approved হয়নি। অনুগ্রহ করে নিচের নম্বরে কল করে সহায়তা নিন।";
    supportMessage = "সাহায্যের জন্য যোগাযোগ করুন:";
  }

  const phoneNumber = "01995322023";
  const displayPhone = "০১৯৯৫৩২২০২৩"; // Bengali digits

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        {/* Decorative top border gradient */}
        <div className="h-1 w-full bg-gradient-to-r from-[#156A98] via-[#0F9D8F] to-[#156A98] rounded-full" />

        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#156A98] to-[#0F9D8F] flex items-center justify-center">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#156A98] to-[#0F9D8F] bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">{message}</p>
        </div>

        {/* Support Contact Section (only for ACCOUNT_NOT_APPROVED) */}
        {error === "ACCOUNT_NOT_APPROVED" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-[#156A98]/5 to-[#0F9D8F]/5 p-5 rounded-xl border border-[#156A98]/10"
          >
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">
              {supportMessage}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href={`tel:${phoneNumber}`}
                className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-[#0F9D8F] hover:shadow-md transition-all duration-200"
              >
                <svg
                  className="h-5 w-5 text-[#0F9D8F]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-lg font-semibold text-gray-800">
                  {displayPhone}
                </span>
              </a>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-gray-400 hover:bg-gray-500 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                <span>{copied ? "কপি হয়েছে!" : "কপি করুন"}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              আমাদের গ্রাহক সেবা দল ২৪/৭ সহায়তার জন্য প্রস্তুত।
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <Link href="/login" className="block w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative group bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white px-5 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <svg
                className="h-5 w-5 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span className="relative z-10">Back to Login</span>
            </motion.button>
          </Link>

          <div className="flex justify-center gap-4 text-sm">
            <Link href="/" className="text-gray-400 hover:text-[#0F9D8F] transition-colors">
              Home
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="text-gray-400 hover:text-[#0F9D8F] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
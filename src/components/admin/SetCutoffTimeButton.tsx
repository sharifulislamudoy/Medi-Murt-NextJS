'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SetCutoffTimeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cutoffTime, setCutoffTime] = useState('17:00'); // default 5:00 PM
  const router = useRouter();

  const handleProcess = async () => {
    setIsLoading(true);
    try {
      // Construct a Date object for today at the selected time
      const today = new Date();
      const [hours, minutes] = cutoffTime.split(':').map(Number);
      const cutoffDate = new Date(today);
      cutoffDate.setHours(hours, minutes, 0, 0);

      const res = await fetch('/api/admin/process-orders-by-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cutoff: cutoffDate.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(`${data.count} order${data.count !== 1 ? 's' : ''} moved to PROCESSING.`);
      router.refresh();
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
      >
        Set Cutoff Time
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 max-w-md w-full"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Set Cutoff Time</h3>
              <p className="text-gray-600 mb-4">
                All pending orders placed <strong>before</strong> this time today will be moved to PROCESSING.
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cutoff time (HH:MM)
                </label>
                <input
                  type="time"
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0F9D8F] focus:border-[#0F9D8F] outline-none text-black"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border text-gray-500 border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Process'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
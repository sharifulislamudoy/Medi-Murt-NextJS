"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile menu on window resize above md breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white shadow-sm"
          }`}
      >
        {/* Decorative top border gradient */}
        <div className="h-1 w-full bg-gradient-to-r from-[#156A98] via-[#0F9D8F] to-[#156A98]" />

        {/* First row: Hamburger + Logo, Desktop Nav, Login */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-2">
              {/* Hamburger Menu Button (visible only on mobile) */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#156A98] hover:bg-[#156A98]/10 focus:outline-none transition-all duration-200"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </motion.button>

              {/* Logo + Brand Name */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                <div className="relative">
                  <Image
                    src="/Logo.png"
                    alt="Medi Murt Logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                    priority
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-[#0F9D8F] rounded-full"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#156A98] to-[#0F9D8F] bg-clip-text text-transparent hidden sm:inline">
                  Medi Murt
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation (hidden on mobile) */}
            <div className="hidden md:flex items-center space-x-1">
              {["Home", "Products / Catalog", "Services", "About", "Contact"].map(
                (item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={`/${item.toLowerCase().replace(/\s+/g, "")}`}
                      className="relative group px-3 py-2 rounded-lg text-gray-700 font-medium hover:text-[#0F9D8F] transition-all duration-200"
                    >
                      <span>{item}</span>
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-[#156A98] to-[#0F9D8F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </Link>
                  </motion.div>
                )
              )}
            </div>

            {/* Right: Login Button */}
            <div className="flex items-center gap-3">
              <Link href={'/login'}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 overflow-hidden"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="relative z-10">Login</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

        {/* Second row: Search bar (always visible) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 md:pb-4">
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-full md:w-1/2 lg:w-2/5 group"
            >
              <input
                type="text"
                placeholder="Search medicines..."
                className="w-full text-black border border-gray-200 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#0F9D8F]/50 focus:border-[#0F9D8F] transition-all duration-300 group-hover:shadow-md"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-hover:text-[#0F9D8F] transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {/* Decorative search bar glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#156A98]/20 to-[#0F9D8F]/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu with only navigation links */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-100"
            >
              <div className="px-4 py-4 space-y-2">
                {["Home", "Products / Catalog", "Services", "About", "Contact"].map(
                  (item, index) => (
                    <motion.div
                      key={item}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={`/${item.toLowerCase().replace(/\s+/g, "")}`}
                        className="block text-gray-700 font-medium hover:text-[#0F9D8F] transition py-2 px-3 rounded-lg hover:bg-[#0F9D8F]/5"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item}
                      </Link>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Overlay to close mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
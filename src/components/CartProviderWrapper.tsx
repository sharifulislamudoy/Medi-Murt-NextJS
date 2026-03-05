// components/CartProviderWrapper.tsx
"use client";

import { CartProvider } from "@/contexts/CartContext";
import { FavouritesProvider } from "@/contexts/FavouritesContext";

export default function CartProviderWrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>
    <FavouritesProvider>
      {children}
    </FavouritesProvider>
  </CartProvider>;
}
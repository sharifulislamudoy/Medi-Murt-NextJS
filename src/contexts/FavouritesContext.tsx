// contexts/FavouritesContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface FavouriteItem {
  id: string;
  name: string;
  image: string;
  price: number;
  brand?: { name: string } | null;
  generic?: { name: string } | null;
}

interface FavouritesContextType {
  favourites: FavouriteItem[];
  addFavourite: (product: any) => void;  // product can be any shape containing id, name, image, sellPrice, brand, generic
  removeFavourite: (id: string) => void;
  isFavourite: (id: string) => boolean;
  clearFavourites: () => void;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error("useFavourites must be used within FavouritesProvider");
  return context;
};

export const FavouritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("favourites");
    if (stored) {
      try {
        setFavourites(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favourites", e);
      }
    }
  }, []);

  // Save to localStorage whenever favourites change
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  const addFavourite = (product: any) => {
    setFavourites(prev => {
      // avoid duplicates
      if (prev.some(item => item.id === product.id)) return prev;
      const newItem: FavouriteItem = {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.sellPrice,
        brand: product.brand,
        generic: product.generic,
      };
      return [...prev, newItem];
    });
    toast.success("Added to favourites");
  };

  const removeFavourite = (id: string) => {
    setFavourites(prev => prev.filter(item => item.id !== id));
    toast.success("Removed from favourites");
  };

  const isFavourite = (id: string) => favourites.some(item => item.id === id);

  const clearFavourites = () => {
    setFavourites([]);
    toast.success("Favourites cleared");
  };

  return (
    <FavouritesContext.Provider value={{ favourites, addFavourite, removeFavourite, isFavourite, clearFavourites }}>
      {children}
    </FavouritesContext.Provider>
  );
};
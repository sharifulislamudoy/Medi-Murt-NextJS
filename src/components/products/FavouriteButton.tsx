// components/products/FavouriteButton.tsx
"use client";

import { useFavourites } from "@/contexts/FavouritesContext";

interface Props {
  product: {
    id: string;
    name: string;
    image: string;
    sellPrice: number;
    brand?: { name: string } | null;
    generic?: { name: string } | null;
  };
}

export default function FavouriteButton({ product }: Props) {
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();
  const favourited = isFavourite(product.id);

  const toggleFavourite = () => {
    if (favourited) {
      removeFavourite(product.id);
    } else {
      addFavourite(product);
    }
  };

  return (
    <button
      onClick={toggleFavourite}
      className={`p-3 rounded-lg border transition ${
        favourited
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
      }`}
      aria-label="Add to favourites"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={favourited ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
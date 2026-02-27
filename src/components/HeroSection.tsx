"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import Image from "next/image";

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  hyperlink?: string;
}

export default function HeroSection() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch("/api/advertisement/visible")
      .then((res) => res.json())
      .then((data) => setAds(data));
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className="w-full">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop
        className="h-full"
      >
        {ads.map((ad) => (
          <SwiperSlide key={ad.id}>
            <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px]">
              <Image
                src={ad.imageUrl}
                alt={ad.title}
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-black/5 flex flex-col justify-end p-4 md:p-8">
                {ad.hyperlink && (
                  <Link
                    href={ad.hyperlink}
                    className="mt-4 self-end text-xs md:text-sm lg:text-lg bg-gradient-to-r from-[#156A98] to-[#0F9D8F] text-white px-4 py-2 md:px-5 md:py-3 lg:px-8 rounded hover:shadow-lg transition-all duration-300"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
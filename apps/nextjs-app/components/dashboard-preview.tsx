"use client";

import Image from "next/image";
import { useState } from "react";

export function DashboardPreview() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleVideoClick = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="w-[calc(100vw-32px)] lg:w-[1100px]">
      <div className="bg-primary-light/50 rounded-2xl py-2 shadow-2xl mt-0">
        <div className="relative w-full h-full">
          {!isVideoPlaying ? (
            // Custom thumbnail overlay
            <div
              className="relative w-full h-full cursor-pointer group"
              onClick={handleVideoClick}
            >
              <Image
                src="/images/dashboard-preview.png"
                alt="Dashboard preview"
                width={1280}
                height={700}
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
              {/* Video play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl group-hover:bg-black/30 transition-all duration-300">
                <div className="relative">
                  {/* Animated video icon */}
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <div className="w-0 h-0 border-l-[16px] border-l-primary border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                  </div>
                  {/* Pulse animation ring */}
                  <div className="absolute inset-0 w-20 h-20 bg-white/30 rounded-full animate-ping" />
                  <div className="absolute inset-0 w-20 h-20 bg-white/20 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            // YouTube iframe
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ZK-rNEhJIDs?si=sIqv9d1OuDv9f3nn&controls=1&autoplay=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full object-cover rounded-xl shadow-lg"
              style={{ aspectRatio: "1280/700" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

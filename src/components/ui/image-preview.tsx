"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MediaResponse } from "@/src/types";
import { getMediaUrl } from "@/src/utils/functions";
import RightIcon from "@/public/icons/chevron-right-icon.svg";
import LeftIcon from "@/public/icons/chevron-left-icon.svg";
import CloseIcon from "@/public/icons/close-icon.svg";

interface ImagePreviewProps {
  images: MediaResponse[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export function ImagePreview({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  alt = "Preview",
}: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleArrowKeys);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleArrowKeys);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="Close preview"
      >
        <CloseIcon className="w-5 h-5" fill="currentColor" />
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Previous image"
        >
          <LeftIcon className="w-5 h-5" fill="currentColor" />
        </button>
      )}

      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
          <Image
            src={getMediaUrl(images[currentIndex].mediaUrl)}
            alt={`${alt} ${currentIndex + 1}`}
            width={1920}
            height={1080}
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
        </div>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Next image"
        >
          <RightIcon className="w-5 h-5" fill="currentColor" />
        </button>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

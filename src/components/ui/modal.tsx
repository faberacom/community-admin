"use client";

import { useEffect, ReactNode } from "react";
import PlaceholderIcon from "@/public/icons/placeholder.svg";
import CloseIcon from "@/public/icons/close-icon.svg";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = "md",
}: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-xl  h-max max-h-[80vh] md:max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 pl-6 border-b border-gray-100 relative">
            {/* {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-900 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <CloseIcon className="w-5 h-5" fill="currentColor" />
              </button>
            )} */}
            {title && (
              <h2
                id="modal-title"
                className="flex-1 text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 text-gray-900 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors absolute right-4 top-4"
                aria-label="Close"
              >
                <CloseIcon className="w-5 h-5" fill="currentColor" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}

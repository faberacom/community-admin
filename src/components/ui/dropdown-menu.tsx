"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

export interface DropdownMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  header?: ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({
  trigger,
  items,
  header,
  align = "right",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const defaultItems = items.filter((item) => item.variant !== "danger");
  const dangerItems = items.filter((item) => item.variant === "danger");

  return (
    <div
      className="relative"
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 z-50 w-56 bg-white rounded-xl shadow-lg border border-gray-100 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {header && (
            <div className="px-4 py-3 border-b border-gray-100">{header}</div>
          )}

          {defaultItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {item.icon && (
                <span className="w-5 h-5 flex items-center justify-center shrink-0">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}

          {dangerItems.length > 0 && (
            <>
              {defaultItems.length > 0 && (
                <div className="border-t border-gray-100 my-1" />
              )}
              {dangerItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  {item.icon && (
                    <span className="w-5 h-5 flex items-center justify-center shrink-0">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

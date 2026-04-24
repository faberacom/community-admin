"use client";

import { useState, ReactNode } from "react";
import PlaceholderIcon from "@/public/icons/placeholder.svg";
import ChevronDownIcon from "@/public/icons/chevron-down-icon.svg";

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  children,
  // defaultOpen = true,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-100">
      {/* <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-base font-semibold text-primary">{title}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-primary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
        />
      </button> */}
      <div className="w-full flex items-center  py-5 text-left">
        <span className="text-base font-semibold text-primary">{title}</span>
      </div>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-500 pb-5" : "max-h-0"
        }`}
      >
        <div className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
}

export function Accordion({ children }: AccordionProps) {
  return <div className="divide-y divide-gray-100">{children}</div>;
}

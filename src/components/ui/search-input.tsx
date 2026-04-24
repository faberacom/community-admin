"use client";

import { useRef } from "react";
import SearchIcon from "@/public/icons/search.svg";
import CloseIcon from "@/public/icons/close-icon.svg";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  className = "",
  autoFocus,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    onChange("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className} `}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none " />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-9 pr-8 py-2 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-gray-300 focus:bg-white transition-colors"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

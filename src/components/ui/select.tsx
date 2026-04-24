"use client";

import { forwardRef, SelectHTMLAttributes, ReactNode } from "react";
import ChevronDownIcon from "@/public/icons/chevron-down-icon.svg";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      required,
      leftIcon,
      className = "",
      id,
      children,
      ...props
    },
    ref,
  ) => (
    <div className="">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-900 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            w-full py-2.5 bg-gray-50 border text-sm text-gray-900 rounded-lg appearance-none
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors pr-10
            ${leftIcon ? "pl-10" : "px-4"}
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200"}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  ),
);

Select.displayName = "Select";

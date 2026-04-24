"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      required,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="w-full">
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
          <input
            ref={ref}
            id={id}
            className={`
              w-full py-2.5 bg-gray-50 border text-sm text-gray-900 placeholder-gray-400 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              ${leftIcon ? "pl-10" : "px-4"}
              ${rightIcon ? "pr-10" : "pr-4"}
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200"}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
        )}
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

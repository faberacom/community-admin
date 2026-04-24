"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import ViewPassIcon from "@/public/icons/view-password.svg";
import HidePasssIcon from "@/public/icons/hide-password.svg";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, hint, leftIcon, type, className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={`
              w-full px-4 py-3 bg-gray-50 border rounded-lg text-sm
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              ${leftIcon ? "pl-10" : ""}
              ${isPassword ? "pr-10" : ""}
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200"}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <HidePasssIcon className="w-5 h-5" fill="currentColor" />
              ) : (
                <ViewPassIcon className="w-5 h-5" fill="currentColor" />
              )}
            </button>
          )}
        </div>
        {hint && !error && (
          <p className="mt-1.5 text-xs lg:text-sm text-gray-500">{hint}</p>
        )}
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";

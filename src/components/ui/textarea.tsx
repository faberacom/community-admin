"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      required,
      showCount,
      maxLength,
      value,
      className = "",
      id,
      ...props
    },
    ref,
  ) => {
    const currentLength = typeof value === "string" ? value.length : 0;

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
        <textarea
          ref={ref}
          id={id}
          value={value}
          maxLength={maxLength}
          className={`
            w-full px-4 py-2.5 bg-gray-50 border text-sm text-gray-900 placeholder-gray-400 rounded-lg resize-y
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200"}
            ${className}
          `}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          <div>
            {hint && !error && (
              <p className="text-xs text-gray-500">{hint}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          {showCount && maxLength != null && (
            <p className="text-xs text-gray-400 ml-auto">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

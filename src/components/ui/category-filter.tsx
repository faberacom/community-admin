"use client";

import { useState } from "react";

const INITIAL_VISIBLE = 6;

interface CategoryItem<T extends string> {
  id: T;
  label: string;
}

interface CategoryFilterProps<T extends string> {
  title?: string;
  items: CategoryItem<T>[];
  selected: T | null;
  onChange: (id: T | null) => void;
}

export function CategoryFilter<T extends string>({
  title = "Categories",
  items,
  selected,
  onChange,
}: CategoryFilterProps<T>) {
  const [showAllCategories, setShowAllCategories] = useState(false);

  const visibleItems = showAllCategories
    ? items
    : items.slice(0, INITIAL_VISIBLE);

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </p>
      <div className="space-y-1">
        {visibleItems.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selected === item.id}
              onChange={() => onChange(selected === item.id ? null : item.id)}
              className="w-4 h-4 rounded border-gray-300 text-primary accent-primary"
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </label>
        ))}
      </div>

      {!showAllCategories && items.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAllCategories(true)}
          className="mt-3 text-sm text-primary font-medium hover:underline"
        >
          View all categories
        </button>
      )}
    </div>
  );
}

interface CategoryChipsProps<T extends string> {
  chips: { id: T | null; label: string }[];
  selected: T | null;
  onChange: (id: T | null) => void;
}

export function CategoryChips<T extends string>({
  chips,
  selected,
  onChange,
}: CategoryChipsProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide lg:hidden px-4">
      {chips.map((chip) => (
        <button
          key={chip.id ?? "all"}
          onClick={() => onChange(chip.id)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selected === chip.id
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

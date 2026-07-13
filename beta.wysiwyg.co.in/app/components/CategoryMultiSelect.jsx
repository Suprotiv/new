"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const CategoryMultiSelect = ({ categories, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLabels = useMemo(() => {
    const selected = new Set(value);
    return categories
      .filter((category) => selected.has(category.slug))
      .map((category) => category.name);
  }, [categories, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (slug) => {
    const selected = new Set(value);

    if (selected.has(slug)) {
      selected.delete(slug);
    } else {
      selected.add(slug);
    }

    onChange(Array.from(selected));
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-[0.95rem]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={selectedLabels.length ? "text-black" : "text-gray-500"}
        >
          {selectedLabels.length
            ? selectedLabels.join(", ")
            : "Select categories"}
        </span>
        <span aria-hidden="true">v</span>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg"
          role="listbox"
          aria-multiselectable="true"
        >
          {categories.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">No categories found</p>
          ) : (
            categories.map((category) => (
              <label
                key={category.slug}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={value.includes(category.slug)}
                  onChange={() => toggleCategory(category.slug)}
                />
                <span>{category.name}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryMultiSelect;

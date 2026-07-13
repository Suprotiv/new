"use client";

import React, { useState, useEffect, use } from "react";
import Portfolio from "../../components/Portfolio";
import TextComponent from "../../components/TextComponent";

const decodeSlug = (slug) => {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

const Page = ({ params }) => {
  const { category: categorySlug } = use(params); // unwrap params

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories`
        );
        const data = await res.json();
        const decodedCategorySlug = decodeSlug(categorySlug);
        const matchedCategory = data.find(
          (cat) =>
            cat.slug === categorySlug ||
            decodeSlug(cat.slug) === decodedCategorySlug
        );
        setCategory(matchedCategory);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="mt-25 text-center min-h-screen py-20 bg-[#fefdf8] text-gray-500">
        Loading category...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mt-25 text-center py-20 text-red-500">
        Category not found.
      </div>
    );
  }

  return (
    <div className="mt-25 min-h-screen bg-[#fefdf8] relative z-30">
      <div className="flex flex-col items-center justify-center">
        <TextComponent project={category.name} />
        <Portfolio category={category.slug} />
      </div>
    </div>
  );
};

export default Page;

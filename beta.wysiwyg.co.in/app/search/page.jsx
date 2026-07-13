// /app/search/page.tsx or /pages/search.tsx (depending on your setup)
"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const SearchPage = dynamic(() => import("../components/SearchPage"), {
  ssr: false,
});

export default function SearchWrapper() {
  return (
    <div className="min-h-screen bg-[#111010] relative z-10">
      <Suspense
        fallback={
          <div className="text-white h-screen p-10">Loading search...</div>
        }
      >
        <SearchPage />
      </Suspense>
    </div>
  );
}

"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SiteContentContext = createContext(null);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

export function resolveContentImage(src) {
  if (!src) return src;
  if (src.startsWith("http") || src.startsWith("/_next") || src.startsWith("/images/")) {
    return src.startsWith("/images/site-content") ? `${baseUrl}${src}` : src;
  }
  return src;
}

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState({ text: {}, images: {} });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const exp = Number(localStorage.getItem("exp") || 0);
    setIsAdmin(Boolean(token && (!exp || exp * 1000 > Date.now())));
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(`${baseUrl}/site-content`);
        setContent({
          text: res.data?.text || {},
          images: res.data?.images || {},
        });
      } catch (error) {
        console.error("Failed to fetch site content:", error);
      }
    };

    if (baseUrl) fetchContent();
  }, []);

  const updateText = async (key, value) => {
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `${baseUrl}/site-content/text`,
      { key, value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setContent(res.data.content);
  };

  const updateImage = async (key, file) => {
    const token = localStorage.getItem("token");
    const payload = new FormData();
    payload.append("key", key);
    payload.append("image", file);
    const res = await axios.post(`${baseUrl}/site-content/image`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    setContent(res.data.content);
  };

  const value = useMemo(
    () => ({
      content,
      isAdmin,
      getText: (key, fallback = "") => content.text?.[key] ?? fallback,
      getImage: (key, fallback = "") =>
        resolveContentImage(content.images?.[key] || fallback),
      updateText,
      updateImage,
    }),
    [content, isAdmin]
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    return {
      content: { text: {}, images: {} },
      isAdmin: false,
      getText: (_key, fallback = "") => fallback,
      getImage: (_key, fallback = "") => fallback,
      updateText: async () => {},
      updateImage: async () => {},
    };
  }
  return context;
}

"use client";

import Image from "next/image";
import { ImageUp } from "lucide-react";
import { useRef, useState } from "react";
import { useSiteContent } from "./SiteContentProvider";

export default function EditableImage({
  keyName,
  fallback,
  alt,
  className = "",
  wrapperClassName = "",
  ...imageProps
}) {
  const { getImage, isAdmin, updateImage } = useSiteContent();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const src = getImage(keyName, fallback);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await updateImage(keyName, file);
    } catch (error) {
      console.error("Failed to update image:", error);
      alert("Image update failed. Please login again.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const wrapperPositionClass = wrapperClassName ? "" : "relative";

  return (
    <span
      className={`group/editable-image block ${wrapperPositionClass} ${wrapperClassName}`}
    >
      <Image src={src} alt={alt} className={className} {...imageProps} />
      {isAdmin ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              inputRef.current?.click();
            }}
            disabled={uploading}
            aria-label="Edit image"
            title="Edit image"
            className="absolute right-2 top-2 z-50 rounded-full bg-white p-2 text-black opacity-90 shadow-lg ring-1 ring-black/10 transition hover:opacity-100 disabled:opacity-60"
          >
            <ImageUp size={16} />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      ) : null}
    </span>
  );
}

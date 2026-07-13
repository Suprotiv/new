"use client";

import { Check, Edit3, X } from "lucide-react";
import { useState } from "react";
import { useSiteContent } from "./SiteContentProvider";

export default function EditableText({
  as: Tag = "span",
  keyName,
  fallback = "",
  className = "",
  multiline = false,
  wrapperClassName = "",
  children,
  ...props
}) {
  const { getText, isAdmin, updateText } = useSiteContent();
  const value = getText(keyName, fallback);
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraft(value);
    setEditing(true);
  };

  const save = async (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    try {
      setSaving(true);
      await updateText(keyName, draft);
      setEditing(false);
    } catch (error) {
      console.error("Failed to update text:", error);
      alert("Text update failed. Please login again.");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <span className="relative inline-flex w-full min-w-[220px] items-start gap-2 rounded-md bg-white p-2 text-black shadow-lg ring-2 ring-[#72814B]">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-[120px] flex-1 resize-y rounded border border-neutral-300 p-2 text-sm leading-relaxed text-black"
          />
        ) : (
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-w-0 flex-1 rounded border border-neutral-300 p-2 text-sm text-black"
          />
        )}
        <span className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            aria-label="Save text"
            title="Save text"
            className="rounded bg-[#72814B] p-2 text-white disabled:opacity-60"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(false);
            }}
            aria-label="Cancel editing"
            title="Cancel editing"
            className="rounded bg-neutral-700 p-2 text-white"
          >
            <X size={16} />
          </button>
        </span>
      </span>
    );
  }

  const wrapperDisplayClass = wrapperClassName ? "" : "inline-block";

  return (
    <span
      className={`group/editable relative ${wrapperDisplayClass} ${wrapperClassName}`}
    >
      <Tag className={className} {...props}>
        {children ? children(value) : multiline ? renderLines(value) : value}
      </Tag>
      {isAdmin ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            startEditing();
          }}
          aria-label="Edit text"
          title="Edit text"
          className="absolute -right-8 -top-2 z-50 rounded-full bg-white p-1.5 text-black opacity-80 shadow-lg ring-1 ring-black/10 transition hover:opacity-100"
        >
          <Edit3 size={14} />
        </button>
      ) : null}
    </span>
  );
}

function renderLines(value) {
  return String(value)
    .split("\n")
    .map((line, index, lines) => (
      <span key={`${line}-${index}`}>
        {line}
        {index < lines.length - 1 ? <br /> : null}
      </span>
    ));
}

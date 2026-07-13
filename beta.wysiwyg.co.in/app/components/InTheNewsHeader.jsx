"use client";
import { Playfair_Display } from "next/font/google";
import EditableText from "./EditableText";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-playfair",
  display: "swap",
});

function StyledHeaderText({ text, className = "" }) {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return null;
  }

  const lastToken = words[words.length - 1];
  const hasTrailingDot = lastToken.endsWith(".");
  const lastWord = hasTrailingDot ? lastToken.slice(0, -1) : lastToken;
  const prefixWords = words.slice(0, -1);
  const prefix = prefixWords.join(" ");

  return (
    <div
      className={`text-[#fefdf8] text-2xl md:text-4xl tracking-wide text-center ${className}`}
    >
      {prefix ? (
        <span className={playfair.className}>{prefix} </span>
      ) : null}
      <span >{lastWord}</span>
      {hasTrailingDot ? <span className={playfair.className}>.</span> : null}
    </div>
  );
}

export default function InTheNewsHeader({
  text = "In the news",
  keyName,
  className = "",
}) {
  if (keyName) {
    return (
      <EditableText keyName={keyName} fallback={text} wrapperClassName="block w-full">
        {(value) => <StyledHeaderText text={value} className={className} />}
      </EditableText>
    );
  }

  return <StyledHeaderText text={text} className={className} />;
}

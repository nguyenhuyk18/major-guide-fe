import React from "react";
import { Link } from "react-router-dom";

// Only same-site paths are clickable; anything else the AI writes stays plain text.
export const isInternalHref = (href) =>
  typeof href === "string" &&
  href.startsWith("/") &&
  !href.startsWith("//") &&
  !href.includes("\\") &&
  !/^\/*[a-z]+:/i.test(href);

const TOKEN = /(\[[^\]\n]{1,120}\]\([^)\s]{1,300}\)|`[^`\n]+`|\*\*[^*\n]+\*\*)/g;

/** Renders **bold**, `code` and [label](/internal-link) inside one line of AI text. */
export const renderAiInline = (text, onNavigate) =>
  String(text || "")
    .split(TOKEN)
    .filter((part) => part !== "")
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
        return <code key={index}>{part.slice(1, -1)}</code>;
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const [, label, href] = link;
        return isInternalHref(href) ? (
          <Link key={index} to={href} className="ai-inline-link" onClick={onNavigate}>
            {label}
          </Link>
        ) : (
          <span key={index}>{label}</span>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });

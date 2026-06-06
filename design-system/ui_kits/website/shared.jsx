// Shared helpers for the RISE website kit
const { useState, useEffect, useRef } = React;

// Re-render Lucide icons whenever deps change
function useLucide(deps = []) {
  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, deps); // eslint-disable-line
}

// Placeholder photo — a user-fillable <image-slot>. Click or drag a photo onto it.
function Placeholder({ id, label = "Drop a photo here", src, className = "", style = {} }) {
  const props = {
    id,
    shape: "rounded",
    radius: "20",
    placeholder: label,
    className,
    style: { width: "100%", display: "block", ...style },
  };
  if (src) props.src = src;
  return React.createElement("image-slot", props);
}

const LOGO = window.RISE_LOGO || "../../assets/logo-mark.svg";

window.useLucide = useLucide;
window.Placeholder = Placeholder;
window.LOGO = LOGO;

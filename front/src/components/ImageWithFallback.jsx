import { useState } from "react";

export function ImageWithFallback({ src, alt = "", className = "", fallback = "sem foto" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={className ? `${className} image-placeholder` : "image-placeholder"}>{fallback}</div>;
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}

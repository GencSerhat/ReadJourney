import { useState } from "react";
import styles from "./CoverImage.module.css";
import { toAbsoluteUrl } from "../../utils/url";

function initialsFromTitle(title = "") {
  const t = String(title).trim();
  if (!t) return "";
  const words = t.split(/\s+/).slice(0, 2);
  return words.map(w => w[0]?.toUpperCase() || "").join("");
}

export default function CoverImage({ src, title, className }) {
  const [broken, setBroken] = useState(false);
  const url = toAbsoluteUrl(src);

  return (
    <div className={`${styles.root} ${className || ""}`}>
      {!broken && url ? (
        <img
          className={styles.img}
          src={url}
          alt={title}
          onError={() => setBroken(true)}
          loading="lazy"
        />
      ) : (
        <>
          <div className={styles.ph}>
            <div className={styles.title}>{title || "No cover"}</div>
          </div>
          <div className={styles.initials}>{initialsFromTitle(title)}</div>
        </>
      )}
    </div>
  );
}

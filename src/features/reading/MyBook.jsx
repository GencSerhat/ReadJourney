import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import styles from "./MyBook.module.css";
import { readingPageSchema } from "./validation.js";
import {
  startReadingApi,
  stopReadingApi,
  fetchReadingDetails,
  deleteDiaryEntry,
} from "../../services/readingApi.js";
import { fetchBookById } from "../../services/booksApi.js";
import { toAbsoluteUrl } from "../../utils/url";
import { http } from "../../services/http";
import { findCover } from "../../utils/coverCache";
import toast from "react-hot-toast";
import BookFinishedModal from "../../components/BookFinishedModal/BookFinishedModal.jsx";
// Prop/response içindeki olası kapak alanları
const pickRawCover = (b) =>
  b?.cover ||
  b?.image ||
  b?.imageUrl ||
  b?.imageURL ||
  b?.coverUrl ||
  b?.coverURL ||
  b?.img ||
  b?.thumbnail ||
  b?.thumb ||
  b?.book_image ||
  b?.book_image_url ||
  "";

export default function MyBook({ book }) {
  const [mode, setMode] = useState("idle"); // "reading" | "idle"
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [details, setDetails] = useState({
    diary: [],
    stats: {},
    activeReadingId: null,
  });

  // Sol panelde ikonla geçiş
  const [sideTab, setSideTab] = useState("diary"); // "diary" | "stats"

  // Başlık/kapak/yazar
  const [meta, setMeta] = useState({
    title: "",
    author: "",
    cover: "",
    totalPages: 0,
  });
  // Görsel kaynağı (<img src>)
  const [imgUrl, setImgUrl] = useState("");
  const [triedBlob, setTriedBlob] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const prevCompletionRef = useRef(0);

  const bookId = book?.bookId || book?.id;

  /* ── META HYDRATE ───────────────────────────────────────────── */
  useEffect(() => {
    let ignore = false;
    async function hydrate() {
      if (!bookId) return;

      // Prop’dan gelenler
      const fromProp = {
        title: book?.title ?? book?.name ?? "",
        author: book?.author ?? book?.authors ?? "",
        cover: toAbsoluteUrl(pickRawCover(book)),
        totalPages:
          Number(
            book?.totalPages ??
              book?.pages ??
              book?.pageCount ??
              book?.total_pages ??
              0,
          ) || 0,
      };

      // Kapak yoksa cache
      if (!fromProp.cover) {
        const cached = findCover({
          id: bookId,
          title: fromProp.title,
          author: fromProp.author,
        });
        if (cached) fromProp.cover = toAbsoluteUrl(cached);
      }

      // Eksikse id ile detay getir
      const needsFetch = !fromProp.title || !fromProp.author || !fromProp.cover;
      if (needsFetch) {
        try {
          const b = await fetchBookById(bookId);
          const raw = {
            title: b?.title ?? fromProp.title,
            author: b?.author ?? fromProp.author,
            cover: toAbsoluteUrl(pickRawCover(b) || b?.cover || fromProp.cover),
            totalPages: Number(b?.totalPages || fromProp.totalPages || 0),
          };
          if (!raw.cover) {
            const cached2 = findCover({
              id: bookId,
              title: raw.title,
              author: raw.author,
            });
            if (cached2) raw.cover = toAbsoluteUrl(cached2);
          }
          if (!ignore) setMeta(raw);
        } catch {
          if (!ignore) setMeta(fromProp);
        }
      } else {
        if (!ignore) setMeta(fromProp);
      }
    }
    hydrate();
    return () => {
      ignore = true;
    };
  }, [bookId, book]);

  /* ── COVER <img> SRC + BLOP FALLBACK ───────────────────────── */
  useEffect(() => {
    setImgUrl(meta.cover ? toAbsoluteUrl(meta.cover) : "");
    setTriedBlob(false);
  }, [meta.cover]);

  const tryFetchBlob = async () => {
    if (triedBlob) return;
    setTriedBlob(true);

    const coverId =
      book?.coverId ||
      book?.imageId ||
      book?._raw?.coverId ||
      book?._raw?.imageId ||
      null;

    const candidates = [
      meta.cover,
      coverId ? `/files/${coverId}` : null,
      coverId ? `/uploads/${coverId}` : null,
      bookId ? `/books/${bookId}/cover` : null,
      pickRawCover(book) || null,
    ].filter(Boolean);

    for (const c of candidates) {
      try {
        const url = toAbsoluteUrl(c);
        const res = await http.get(url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        setImgUrl(blobUrl);
        return;
      } catch {
        // sonraki adayı dene
      }
    }
    setImgUrl("");
  };

  /* ── READING DETAILS ───────────────────────────────────────── */
 const load = async () => {
  setLoading(true);
  try {
    const d = await fetchReadingDetails({ bookId });
    setDetails(d);
    setMode(d.activeReadingId ? "reading" : "idle");

    // ⬇️ tamamlanma yüzdesi izleme
    const current = Number(d?.stats?.completion || 0);
    const prev = Number(prevCompletionRef.current || 0);
    if (prev < 100 && current >= 100) {
      setShowFinished(true);        // pop-up
    }
    prevCompletionRef.current = current;
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (bookId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  /* ── FORM: START/STOP ───────────────────────────────────────── */
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting, isValid, isSubmitted },
  } = useForm({
    resolver: yupResolver(readingPageSchema),
    mode: "onTouched",
    defaultValues: { page: "" },
  });

  const onSubmit = async ({ page }) => {
    try {
      setBusy(true);
      if (mode === "idle") {
        await startReadingApi({ bookId, page: Number(page) });
        setMode("reading");
        toast.success("Reading started");
      } else {
        await stopReadingApi({ bookId, page: Number(page) });
        setMode("idle");
        toast.success("Reading stopped");
      }
      reset({ page: "" });
      load();
    } catch (err) {
      const code = err?.response?.status || 0;
      toast.error(
        code === 409
          ? mode === "idle"
            ? "You have already started reading this book"
            : "You haven't started reading this book"
          : err?.response?.data?.message ||
              err?.normalizedMessage ||
              err?.message ||
              "Reading action failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const onRecordClick = () => {
    const val = getValues("page");
    if (!val) toast("Enter page number first");
    handleSubmit(onSubmit)();
  };

  const onDeleteEntry = async (entryId) => {
    try {
      await deleteDiaryEntry({ bookId, entryId });
      toast.success("Entry deleted");
      load();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.normalizedMessage ||
          err?.message ||
          "Failed to delete entry",
      );
    }
  };

  /* ── Hız sparkline ölçeği ─────────────────────────────────── */
  const maxSpeed = useMemo(() => {
    return (details.diary || []).reduce((acc, d) => {
      const s =
        d.pages && d.minutes ? (d.pages * 60) / d.minutes : d.speed || 0;
      return Math.max(acc, s);
    }, 1);
  }, [details.diary]);

  const buttonLabel = mode === "idle" ? "To start" : "To stop";

  /* ── RENDER ───────────────────────────────────────────────── */
  return (
    <div className={styles.layout}>
      {/* SOL PANEL */}
      <aside className={styles.side}>
        {/* Start/Stop kartı */}
        <section className={styles.card}>
          <div className={styles.sideTitle}>Stop page:</div>
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <input
              className={styles.input}
              type="number"
              min={1}
              placeholder="Page number:"
              {...register("page")}
              aria-invalid={Boolean(errors.page) || undefined}
            />
            {errors.page?.message ? (
              <div className={styles.note} role="alert">
                {errors.page.message}
              </div>
            ) : null}
            <button
              className={`${styles.pillBtn} ${mode === "reading" ? styles.pillBtnStop : ""}`}
              type="submit"
              disabled={busy || isSubmitting || (isSubmitted && !isValid)}
            >
              {isSubmitting
                ? mode === "idle"
                  ? "Starting..."
                  : "Stopping..."
                : buttonLabel}
            </button>
          </form>
        </section>

        {/* Diary / Statistics kartı */}
        <section className={styles.card}>
          <div className={styles.sideRow}>
            <h3 className={styles.sideHeading}>
              {sideTab === "stats" ? "Statistics" : "Diary"}
            </h3>

            <div
              className={styles.iconBar}
              role="tablist"
              aria-label="Diary / Statistics"
            >
              <button
                type="button"
                className={`${styles.iconBtn} ${sideTab === "diary" ? styles.iconActive : ""}`}
                onClick={() => setSideTab("diary")}
                title="Diary"
                role="tab"
                aria-selected={sideTab === "diary"}
              >
                ⏳
              </button>
              <button
                type="button"
                className={`${styles.iconBtn} ${sideTab === "stats" ? styles.iconActive : ""}`}
                onClick={() => setSideTab("stats")}
                title="Statistics"
                role="tab"
                aria-selected={sideTab === "stats"}
              >
                📊
              </button>
            </div>
          </div>

          {/* İçerik */}
          {sideTab === "diary" ? (
            loading ? (
              <div className={styles.note}>Loading…</div>
            ) : details.diary?.length ? (
              <ul className={styles.diaryList}>
                {details.diary.map((d) => {
                  const percent = Math.max(
                    0,
                    Math.min(100, Math.round(d.percent ?? d.completion ?? 0)),
                  );
                  const speed =
                    d.pages && d.minutes
                      ? Math.round((d.pages * 60) / d.minutes)
                      : Math.round(d.speed || 0);
                  const date = d.date
                    ? new Date(d.date).toLocaleDateString()
                    : "—";

                  return (
                    <li key={d.id} className={styles.diaryItem}>
                      <div className={styles.diaryLeft}>
                        <div className={styles.diaryDate}>{date}</div>
                        <div className={styles.diaryStatBig}>{percent}%</div>
                        <div className={styles.diaryMinor}>
                          {d.minutes ?? 0} minutes
                        </div>
                      </div>

                      <div className={styles.diaryGraphCol}>
                        <div
                          className={styles.barWrap}
                          aria-label="progress bar"
                        >
                          <div
                            className={styles.barFill}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <svg
                          className={styles.spark}
                          viewBox="0 0 72 20"
                          preserveAspectRatio="none"
                        >
                          <polyline
                            points={`0,19 72,${Math.max(
                              2,
                              19 -
                                Math.min(
                                  17,
                                  ((speed || 0) / Math.max(1, maxSpeed)) * 17,
                                ),
                            )}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>

                        <div className={styles.speedRow}>
                          <span>{speed} pages</span>
                          <span>per hour</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.trash}
                        title={d.active ? "Active session" : "Delete"}
                        onClick={() => !d.active && onDeleteEntry(d.id)}
                        disabled={d.active}
                      >
                        🗑
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={styles.note}>Henüz okuma kaydı yok.</div>
            )
          ) : (
            /* ---- STATISTICS ---- */
            <div className={styles.statsWrap}>
              <p className={styles.note}>
                Each page, each chapter is a new round of knowledge. As we
                improve our understanding by reading statistics, we create our
                own reading history.
              </p>

              {/* Donut */}
              <div className={styles.donutBox}>
                {(() => {
                  const completion = Number(details?.stats?.completion || 0);
                  const radius = 48;
                  const circ = 2 * Math.PI * radius;
                  const dash =
                    (Math.max(0, Math.min(100, completion)) / 100) * circ;
                  return (
                    <svg
                      className={styles.donut}
                      viewBox="0 0 120 120"
                      width="120"
                      height="120"
                      aria-label="Completion"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        className={styles.donutTrack}
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        className={styles.donutFill}
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset="0"
                      />
                      <text
                        x="60"
                        y="66"
                        textAnchor="middle"
                        className={styles.donutText}
                      >
                        {Math.round(completion)}%
                      </text>
                    </svg>
                  );
                })()}
              </div>

              <div className={styles.statsLines}>
                <div className={styles.statsLine}>
                  <span className={styles.note}>Total read:</span>
                  <b>{details?.stats?.totalRead ?? 0} pages</b>
                </div>
                <div className={styles.statsLine}>
                  <span className={styles.note}>Completion:</span>
                  <b>{details?.stats?.completion ?? 0}%</b>
                </div>
                <div className={styles.statsLine}>
                  <span className={styles.note}>Average speed:</span>
                  <b>{details?.stats?.avgSpeed ?? 0} pages/hour</b>
                </div>
              </div>
            </div>
          )}
        </section>
      </aside>

      {/* SAĞ SAHA */}
      <main className={styles.stage}>
        <h2 className={styles.stageTitle}>My reading</h2>

        <div className={styles.coverWrap}>
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={meta.title || "Cover"}
              className={styles.cover}
              loading="lazy"
              draggable={false}
              onError={tryFetchBlob} // korumalı dosyalarda blob fallback
            />
          ) : (
            <div className={styles.cover} />
          )}
        </div>

        <div className={styles.bookTitle}>{meta.title || book?.title}</div>
        {(meta.author || book?.author) && (
          <div className={styles.bookAuthor}>{meta.author || book?.author}</div>
        )}

        <button
          type="button"
          className={`${styles.recordBtn} ${mode === "reading" ? styles.recordActive : ""}`}
          onClick={onRecordClick}
          aria-label={mode === "reading" ? "Stop reading" : "Start reading"}
        >
          <span className={styles.recordDot} />
        </button>
      </main>
      <BookFinishedModal open={showFinished} onClose={() => setShowFinished(false)} />
    </div>
  );
}

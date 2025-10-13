import { useEffect, useMemo, useState } from "react";
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
import toast from "react-hot-toast";

export default function MyBook({ book }) {
  const [mode, setMode] = useState("idle"); // "reading" | "idle"
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    diary: [],
    stats: {},
    activeReadingId: null,
  });
  const [tab, setTab] = useState("diary");
  const [busy, setBusy] = useState(false);

  const bookId = book?.bookId || book?.id; // /reading/:bookId ile gelmişti
  //const ownId = book?.ownId || null;

  // RHF
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, isSubmitted },
  } = useForm({
    resolver: yupResolver(readingPageSchema),
    mode: "onTouched",
    defaultValues: { page: "" },
  });

  // Detayları yükle
  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchReadingDetails({ bookId });
      setDetails(d);
      // Sunucuya göre modu belirle
      setMode(d.activeReadingId ? "reading" : "idle");
    } catch (err) {
      // sorun olursa sessiz geçelim; kullanıcı “start/stop” yapınca güncellenecek
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // Start/Stop
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
        // sunucudan gelen hız/istatistik dönerse details’i tazele
      }
      reset({ page: "" });
      load();
    } catch (err) {
      // 409’ları kullanıcı dostu göster
      const code = err?.response?.status || 0;
      if (code === 409) {
        if (mode === "idle")
          toast.error("You have already started reading this book");
        else toast.error("You haven't started reading this book");
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.normalizedMessage ||
          err?.message ||
          "Reading action failed";
        toast.error(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  // Diary’den tek kayıt sil
  const onDeleteEntry = async (entryId) => {
    try {
      await deleteDiaryEntry({ bookId, entryId });
      toast.success("Entry deleted");
      load();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.normalizedMessage ||
        err?.message ||
        "Failed to delete entry";
      toast.error(msg);
    }
  };

  const buttonLabel = mode === "idle" ? "To start" : "To stop";

  // Basit diyagram hazır değilde; stats metin
  const StatLine = ({ label, value }) => (
    <div style={{ display: "flex", gap: 6 }}>
      <div className={styles.note} style={{ minWidth: 120 }}>
        {label}
      </div>
      <div>
        <b>{value}</b>
      </div>
    </div>
  );

  return (
    <div className={styles.wrap}>
      {/* Üst bilgi / durum bandı */}
      <section className={styles.banner}>
        <div className={styles.head}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              {book?.title || "Selected book"}
            </div>
            <div className={styles.note}>
              ID: <b>{bookId}</b>
            </div>
          </div>
          <span className={styles.badge}>
            {mode === "reading" ? "Reading now" : "Not started"}
          </span>
        </div>

        {/* AddReading formu */}
        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label className={styles.note}>
              Page number
              <input
                className={styles.input}
                type="number"
                min={1}
                placeholder="Enter page..."
                {...register("page")}
                aria-invalid={Boolean(errors.page) || undefined}
              />
            </label>
            {errors.page?.message ? (
              <div className={styles.note} role="alert">
                {errors.page.message}
              </div>
            ) : null}
          </div>
          <button
            className={styles.btn}
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

      {/* Tab’ler */}
      <div className={styles.tabs} role="tablist" aria-label="Reading details">
        <button
          type="button"
          className={styles.tab}
          role="tab"
          aria-selected={tab === "diary"}
          onClick={() => setTab("diary")}
        >
          Diary
        </button>
        <button
          type="button"
          className={styles.tab}
          role="tab"
          aria-selected={tab === "stats"}
          onClick={() => setTab("stats")}
        >
          Statistics
        </button>
      </div>

      {/* Paneller */}
      {tab === "diary" ? (
        <section className={styles.panel}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Diary</div>
          {loading ? (
            <div className={styles.note}>Loading…</div>
          ) : details.diary?.length ? (
            <ul style={{ display: "grid", gap: 8 }}>
              {details.diary.map((d) => (
                <li
                  key={d.id}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <div
                    style={{ minWidth: 90, fontVariantNumeric: "tabular-nums" }}
                  >
                    {d.date ? new Date(d.date).toLocaleString() : "—"}
                  </div>
                  <div className={styles.note}>pages:</div>
                  <b>{d.pages}</b>
                  <div className={styles.note}>minutes:</div>
                  <b>{d.minutes}</b>
                  <div className={styles.note}>progress:</div>
                  <b>{d.percent}%</b>
                  <button
                    type="button"
                    className={styles.btn}
                    style={{ marginLeft: "auto" }}
                    onClick={() => !d.active && onDeleteEntry(d.id)}
                    disabled={d.active}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.note}>Henüz okuma kaydı yok.</div>
          )}
        </section>
      ) : (
        <section className={styles.panel}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Statistics</div>
          <div style={{ display: "grid", gap: 6 }}>
            <StatLine
              label="Total pages"
              value={details.stats?.totalPages ?? 0}
            />
            <StatLine
              label="Total read pages"
              value={details.stats?.totalRead ?? 0}
            />
            <StatLine
              label="Completion (%)"
              value={details.stats?.completion ?? 0}
            />

            <StatLine
              label="Avg speed (pages/min)"
              value={details.stats?.avgSpeed ?? 0}
            />
          </div>
        </section>
      )}
    </div>
  );
}

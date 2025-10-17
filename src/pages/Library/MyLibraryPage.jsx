import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Dashboard from "../../features/dashboard/Dashboard.jsx";
import MyLibraryBooks from "../../features/library/MyLibraryBooks.jsx";
import { addBookSchema } from "../../features/library/validation.js";
import {
  addOwnBookApi,
  fetchLibraryList,
  removeLibraryBook,
} from "../../services/libraryApi.js";
import Modal from "../../components/Modal/Modal.jsx";
import styles from "./MyLibraryPage.module.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function MyLibraryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(""); // filtre
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const onStartReading = (item) => {
    const id = item?.bookId || item?.id;
    if (!id) return;
    navigate(`/reading/${id}`);
  };

  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, isSubmitted },
  } = useForm({
    resolver: yupResolver(addBookSchema),
    mode: "onTouched",
    defaultValues: { title: "", author: "", totalPages: "" },
  });

  // Listeyi getir
  const load = async (st = status) => {
    setLoading(true);
    try {
      const list = await fetchLibraryList(st);
      setItems(list);
      console.log("OWN RAW SAMPLE", list[0]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.normalizedMessage ||
        err?.message ||
        "Failed to load library";
      toast.error(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(status);
 
  }, [status]);

  // Add
  const onSubmit = async (values) => {
    try {
      await addOwnBookApi(values);
      setShowSuccess(true);
      toast.success("Book added to your library!");
      reset();
      load(status);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.normalizedMessage ||
        err?.message ||
        "Failed to add book";
      toast.error(msg);
    }
  };

  // Remove
  const onRemove = async (item) => {
    try {
      await removeLibraryBook(item);
      toast.success("Book removed");
      load(status);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.normalizedMessage ||
        err?.message ||
        "Failed to remove book";
      toast.error(msg);
    }
  };

  // SOL PANEL (aside)
  const aside = (
    <div className={styles.asideStack}>
      {/* Create your library */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Create your library:</h3>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <input
            className={styles.input}
            type="text"
            placeholder="Book title"
            {...register("title")}
            aria-invalid={Boolean(errors.title) || undefined}
          />
          {errors.title?.message ? (
            <span className={styles.note}>{errors.title.message}</span>
          ) : null}

          <input
            className={styles.input}
            type="text"
            placeholder="The author"
            {...register("author")}
            aria-invalid={Boolean(errors.author) || undefined}
          />
          {errors.author?.message ? (
            <span className={styles.note}>{errors.author.message}</span>
          ) : null}

          <input
            className={styles.input}
            type="number"
            min={1}
            placeholder="Number of pages"
            {...register("totalPages")}
            aria-invalid={Boolean(errors.totalPages) || undefined}
          />
          {errors.totalPages?.message ? (
            <span className={styles.note}>{errors.totalPages.message}</span>
          ) : null}

          <button
            className={styles.btn}
            type="submit"
            disabled={isSubmitting || (isSubmitted && !isValid)}
          >
            {isSubmitting ? "Adding..." : "Add book"}
          </button>
        </form>
      </section>

 
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Recommended books</h3>
        <div className={styles.recoGrid}>
      
          <div className={styles.recoSkeleton} />
          <div className={styles.recoSkeleton} />
          <div className={styles.recoSkeleton} />
        </div>
        <div className={styles.cardFooter}>
          <span>Home</span>
          <span aria-hidden="true">↗</span>
        </div>
      </section>
    </div>
  );

  return (
    <Dashboard title="My library" aside={aside}>

      <MyLibraryBooks
        items={loading ? [] : items}
        onFilterChange={setStatus}
        onRemove={onRemove}
        onStartReading={onStartReading}
      />

 
      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} title="">
        <div style={{ textAlign: "center", padding: "8px 6px" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👍</div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Good job</div>
          <div style={{ color: "#6b7280" }}>
            Your book has been successfully added to <b>My library</b>.
          </div>
        </div>
      </Modal>
    </Dashboard>
  );
}

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

export default function MyLibraryPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(""); // filtre
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // RHF
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

  // ilk yükleme + filtre değişince
  useEffect(() => {
    load(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Add
  const onSubmit = async (values) => {
    try {
      await addOwnBookApi(values);
      setShowSuccess(true);
      toast.success("Book added to your library!");
      reset();
      // Başarı modalını hemen kapatmadan önce listeyi tazele (anında yansısın)
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
      load(status); // tazele
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.normalizedMessage ||
        err?.message ||
        "Failed to remove book";
      toast.error(msg);
    }
  };

  const aside = (
    <div>
      <p className={styles.note}>
        Buradan kendi kütüphanene kitap ekleyebilir ve mevcut kitaplarını
        yönetebilirsin. Önerileri görmek için “Recommended” sayfasına
        geçebilirsin.
      </p>
    </div>
  );

  return (
    <Dashboard title="My library" aside={aside}>
      <div className={styles.stack}>
        {/* AddBook formu */}
        <section>
          <h2 className={styles.subTitle}>Add a book</h2>
          <form
            className={styles.form}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <input
              className={styles.input}
              type="text"
              placeholder="Title"
              {...register("title")}
              aria-invalid={Boolean(errors.title) || undefined}
            />
            {errors.title?.message ? (
              <span className={styles.note}>{errors.title.message}</span>
            ) : null}

            <input
              className={styles.input}
              type="text"
              placeholder="Author"
              {...register("author")}
              aria-invalid={Boolean(errors.author) || undefined}
            />
            {errors.author?.message ? (
              <span className={styles.note}>{errors.author.message}</span>
            ) : null}

            <input
              className={styles.input}
              type="number"
              placeholder="Total pages"
              min={1}
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

        {/* Liste */}
        <MyLibraryBooks
          items={loading ? [] : items}
          onFilterChange={setStatus}
          onRemove={onRemove}
        />
      </div>

      {/* Başarı pop-up (Modal) */}
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

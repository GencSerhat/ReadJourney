import { useParams } from "react-router-dom";
import Dashboard from "../../features/dashboard/Dashboard.jsx";
import MyBook from "../../features/reading/MyBook.jsx";

export default function ReadingPage() {
  const { bookId } = useParams();

  // Not: Gerçek veri sonraki adımda API'den gelecek.
  // Şimdilik sadece ID’yi MyBook’a geçiyoruz.
  const book = { id: bookId };

  return (
    <Dashboard title="Reading">
      <MyBook book={book} />
    </Dashboard>
  );
}

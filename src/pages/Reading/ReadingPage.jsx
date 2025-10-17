import { useParams } from "react-router-dom";
import Dashboard from "../../features/dashboard/Dashboard.jsx";
import MyBook from "../../features/reading/MyBook.jsx";

export default function ReadingPage() {
  const { bookId } = useParams();


  const book = { id: bookId };

  return (
    <Dashboard title="Reading">
      <MyBook book={book} />
    </Dashboard>
  );
}

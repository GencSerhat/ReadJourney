import { useParams } from "react-router-dom";
import Dashboard from "../../features/dashboard/Dashboard.jsx";

export default function ReadingPage() {
  const { bookId } = useParams();
  return (
    <Dashboard title="Reading">
      <div style={{ padding: 8 }}>
        <h2 style={{ fontWeight: 800 }}>Reading book</h2>
        <div>Book ID: <b>{bookId}</b></div>
        {/* Sonraki adımlarda: AddReading formu, Diary/Statistics, vb. */}
      </div>
    </Dashboard>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter.jsx";
import "./styles/global.css";

import { Provider } from "react-redux";
import { store } from "./app/store.js";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
      <Toaster position="top-right" />
    </Provider>
  </React.StrictMode>,
);

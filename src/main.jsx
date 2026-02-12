import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Routes from "./routes.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes />
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  </StrictMode>,
);

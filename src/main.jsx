import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Routes from "./routes.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./lib/query-client.js";
import { QueryClientProvider } from "@tanstack/react-query";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes />
        <Toaster position="top-right" reverseOrder={false} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("react-widget-ai-chatbot")).render(
  <StrictMode>
    <HeroUIProvider>
      <ToastProvider />

      <App />
    </HeroUIProvider>
  </StrictMode>
);

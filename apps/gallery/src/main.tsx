import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "./gallery.css";
import { App } from "./app.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* honour prefers-reduced-motion in every block's entrance animation */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);

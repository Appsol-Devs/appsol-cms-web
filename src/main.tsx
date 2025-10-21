import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { store } from "./store.ts";
import { Provider } from "react-redux";

const AppRoutes = lazy(() => import("./routes/AppRoutes.tsx"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={<div>Loading...</div>}>
        <AppRoutes />
      </Suspense>
    </Provider>
  </StrictMode>
);

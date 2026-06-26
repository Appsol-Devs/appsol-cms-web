import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import { store } from "./store.ts";
import { Provider } from "react-redux";
import LoadingComponent from "./components/LoadingComponent.tsx";

registerSW({ immediate: true });

const AppRoutes = lazy(() => import("./routes/AppRoutes.tsx"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={<LoadingComponent loading />}>
        <AppRoutes />
      </Suspense>
    </Provider>
  </StrictMode>
);

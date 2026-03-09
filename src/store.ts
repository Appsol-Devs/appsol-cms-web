import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { userReducer } from "./pages/auth/login/common/loginSlice";
import { loginApi } from "./pages/auth/login/common/loginApi";
import { rolesApi } from "./pages/roles/common/rolesApi";
import { customersApi } from "./pages/customer/common/customersApi";
import { settingsApi } from "./pages/settings/common/settingsApi";
import { apiErrorMiddleware } from "./lib/apiErrorMiddleware";
import { usersApi } from "./pages/users/common/usersApi";
import { complaintsApi } from "./pages/complaint/common/complaintsApi";
import { leadsApi } from "./pages/leads/common/leadsApi";
import { dashboardApi } from "./pages/dashboard/common/dashboardApi";
import { outReachApi } from "./pages/outreach/common/OutReachApi";
import { customerOutreachApi } from "./pages/customer-outreaches/common/customerOutreachApi";
import { subscriptionsApi } from "./pages/subscriptions/common/subscriptionsApi";
import { paymentsApi } from "./pages/payments/common/paymentsApi";
import { sidebarReducer } from "./pages/layout/sidebar/common/sidebarSlice";
import { notificationsApi } from "./pages/layout/notification/common/notificationsApi";

const persistConfig = {
  key: "root",
  storage,
};

const persistedUser = persistReducer(persistConfig, userReducer);
const persistedSidebar = persistReducer(persistConfig, sidebarReducer);

export const store = configureStore({
  reducer: {
    user: persistedUser,
    sidebar: persistedSidebar,
    [loginApi.reducerPath]: loginApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [complaintsApi.reducerPath]: complaintsApi.reducer,
    [leadsApi.reducerPath]: leadsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [outReachApi.reducerPath]: outReachApi.reducer,
    [customerOutreachApi.reducerPath]: customerOutreachApi.reducer,
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: { warnAfter: 0 },
      serializableCheck: {
        warnAfter: 0,
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(
        loginApi.middleware,
        rolesApi.middleware,
        settingsApi.middleware,
        customersApi.middleware,
        usersApi.middleware,
        complaintsApi.middleware,
        leadsApi.middleware,
        dashboardApi.middleware,
        outReachApi.middleware,
        customerOutreachApi.middleware,
        subscriptionsApi.middleware,
        paymentsApi.middleware,
        notificationsApi.middleware
      )
      .concat(apiErrorMiddleware),
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
export { persistor };

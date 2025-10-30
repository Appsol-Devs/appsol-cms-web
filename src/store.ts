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

const persistConfig = {
  key: "root",
  storage,
};

const persistedUser = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUser,
    [loginApi.reducerPath]: loginApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: { warnAfter: 0 },
      serializableCheck: {
        warnAfter: 0,
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(loginApi.middleware, rolesApi.middleware),
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
export { persistor };

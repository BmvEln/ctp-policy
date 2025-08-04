import { configureStore } from "@reduxjs/toolkit";
import { policiesApi } from "../services/policiesApi";

export const store = configureStore({
  reducer: {
    [policiesApi.reducerPath]: policiesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(policiesApi.middleware),
});

import { showToast } from "@/components/ui/CustomToast";
import type {
  Middleware,
  //   MiddlewareAPI,
} from "@reduxjs/toolkit";
import { isRejectedWithValue } from "@reduxjs/toolkit";

/**
 * Global RTK Query error handling middleware
 * Displays user-friendly error messages via showToast
 */

export const apiErrorMiddleware: Middleware =
  () => (next) => async (action) => {
    //   (api: MiddlewareAPI) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      const error = action.payload as {
        status?: number;
        data?: any;
      };

      if (!error) return;

      const errorObj = await error.data.json();

      const message = errorObj?.message;

      if (message) {
        showToast({
          title: "Error",
          message,
          type: "error",
        });
        return next(action);
      } else {
        switch (error?.status) {
          case 401:
            showToast({
              title: "Error 401",
              message: "Session expired. Please log in again.",
              type: "error",
            });
            break;

          case 403:
            showToast({
              title: "Error 403",
              message: "You are not authorized to perform this action.",
              type: "error",
            });
            break;

          case 404:
            showToast({
              title: "Error 404",
              message: "Requested resource not found.",
              type: "error",
            });
            break;

          case 500:
            showToast({
              title: "Error",
              message: "Something unexpected occurred.",
              type: "error",
            });
            break;

          default:
            showToast({
              title: "Error",
              message,
              type: "error",
            });
            break;
        }
      }

      console.error("RTK Query Error:", error);
    }

    return next(action);
  };

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isUserLoggedIn = () => {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    const state = JSON.parse(currentUser);
    if (state && state.signedIn === true) {
      return true;
    }
    return false;
  }
  // return true;
};

import { setSidebarState } from "@/pages/layout/sidebar/common/sidebarSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useToggleSidebarForNotLargeScreens = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const checkScreen = () => {
      const isSmall = window.innerWidth < 1024;
      dispatch(setSidebarState(isSmall));
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, [dispatch]);
};

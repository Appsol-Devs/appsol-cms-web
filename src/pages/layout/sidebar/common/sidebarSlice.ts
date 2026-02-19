import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ISidebarState {
  isSidebarToggled: boolean;
}

const initialState: ISidebarState = {
  isSidebarToggled: false,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarToggled = !state.isSidebarToggled;
    },
    setSidebarState: (state, action: PayloadAction<boolean>) => {
      state.isSidebarToggled = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarState } = sidebarSlice.actions;

export const sidebarReducer = sidebarSlice.reducer;

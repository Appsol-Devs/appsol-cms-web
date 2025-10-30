import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ILoggedInUser, ILoginResponse } from "./login";

const initialState: ILoggedInUser = {
  user: null,
  //   currentOutlet: null,
};

const saveActiveUser = (
  state: ILoggedInUser,
  action: PayloadAction<ILoginResponse>
) => {
  state.user = action.payload;
};

// const saveActiveOutlet = (
//   state: ILoggedInUser,
//   action: PayloadAction<IOutlet>
// ) => {
//   state.currentOutlet = action.payload;
// };

const userSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logoutUser: () => initialState,
    setCurrentUser: saveActiveUser,
    // setActiveDepartment: saveActiveDepartment,
    // setSystemSettings: saveSystemSettings,
    // setCurrentOutlet: saveActiveOutlet,
  },
});

export const userReducer = userSlice.reducer;
export const { logoutUser, setCurrentUser } = userSlice.actions;

import { configureStore } from "@reduxjs/toolkit";
import mentorRequestsReducer from "./mentorRequestsSlice";

export const store = configureStore({
  reducer: {
    mentorRequests: mentorRequestsReducer,
  },
});
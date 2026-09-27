import { configureStore } from "@reduxjs/toolkit";
import mentorRequestsReducer from "./mentorRequestsSlice";
import communitiesReducer from "./communitiesSlice";

export const store = configureStore({
  reducer: {
    mentorRequests: mentorRequestsReducer,
    communities: communitiesReducer,
  },
});
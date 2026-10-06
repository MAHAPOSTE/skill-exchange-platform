import { configureStore } from "@reduxjs/toolkit";
import mentorRequestsReducer from "./mentorRequestsSlice";
import communitiesReducer from "./communitiesSlice";
import sessionReducer from "./sessionSlice";
import profileReducer from "./profileSlice";
import aiReducer from "./aiSlice";

export const store = configureStore({
  reducer: {
    mentorRequests: mentorRequestsReducer,
    communities: communitiesReducer,
    sessions: sessionReducer,
    profile: profileReducer,
    ai: aiReducer,
  },
});
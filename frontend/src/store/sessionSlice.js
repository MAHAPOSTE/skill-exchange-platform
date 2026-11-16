
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

// Fetch Sessions
export const fetchSessions = createAsyncThunk(
  "sessions/fetchSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/sessions");
      return response.data.sessions;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch sessions")
      );
    }
  }
);

// Fetch Accepted Exchange Requests
export const fetchAcceptedRequests = createAsyncThunk(
  "sessions/fetchAcceptedRequests",
  async (_, { rejectWithValue }) => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        api.get("/api/skill-exchange-requests/sent"),
        api.get("/api/skill-exchange-requests/received"),
      ]);

      const requests = [
        ...(sentResponse.data.requests || []),
        ...(receivedResponse.data.requests || []),
      ];

      const uniqueRequests = requests.filter(
        (request, index) =>
          requests.findIndex(
            (candidate) => candidate._id === request._id
          ) === index
      );

      return {
        acceptedRequests: uniqueRequests.filter(
          (request) => request.status === "accepted"
        ),
        sentRequests: sentResponse.data.requests || [],
      };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Failed to fetch accepted exchange requests"
        )
      );
    }
  }
);

// Create Session
export const createSession = createAsyncThunk(
  "sessions/createSession",
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/sessions", sessionData);
      return response.data.session;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to schedule session")
      );
    }
  }
);

// Update Session
export const updateSession = createAsyncThunk(
  "sessions/updateSession",
  async ({ id, ...sessionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/api/sessions/${id}`,
        sessionData
      );
      return response.data.session;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to update session")
      );
    }
  }
);

// Cancel Session
export const cancelSession = createAsyncThunk(
  "sessions/cancelSession",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/api/sessions/${id}/cancel`
      );
      return response.data.session;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to cancel session")
      );
    }
  }
);

// Complete Session
export const completeSession = createAsyncThunk(
  "sessions/completeSession",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/api/sessions/${id}/complete`
      );
      return response.data.session;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to complete session")
      );
    }
  }
);

// Update Session in Redux State
const updateSessionInList = (state, updatedSession) => {
  const sessionIndex = state.sessions.findIndex(
    (session) => session._id === updatedSession._id
  );

  if (sessionIndex !== -1) {
    state.sessions[sessionIndex] = {
      ...state.sessions[sessionIndex],
      ...updatedSession,
    };
  }
};

const sessionSlice = createSlice({
  name: "sessions",

  initialState: {
    sessions: [],
    acceptedRequests: [],
    sentRequests: [],
    loading: false,
    error: "",
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch Sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Accepted Requests
      .addCase(fetchAcceptedRequests.pending, (state) => {
        state.error = "";
      })
      .addCase(fetchAcceptedRequests.fulfilled, (state, action) => {
        state.acceptedRequests = action.payload.acceptedRequests;
        state.sentRequests = action.payload.sentRequests;
      })
      .addCase(fetchAcceptedRequests.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Create Session
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions.push(action.payload);
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Session
      .addCase(updateSession.fulfilled, (state, action) => {
        updateSessionInList(state, action.payload);
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Cancel Session
      .addCase(cancelSession.fulfilled, (state, action) => {
        updateSessionInList(state, action.payload);
      })
      .addCase(cancelSession.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Complete Session
      .addCase(completeSession.fulfilled, (state, action) => {
        updateSessionInList(state, action.payload);
      })
      .addCase(completeSession.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default sessionSlice.reducer;

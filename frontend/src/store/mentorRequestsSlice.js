import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchMentorRequests = createAsyncThunk(
  "mentorRequests/fetchMentorRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        "/api/mentor-requests",
        getAuthHeaders()
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch mentor requests"
      );
    }
  }
);

export const approveMentorRequest = createAsyncThunk(
  "mentorRequests/approveMentorRequest",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/api/mentor-requests/${id}/approve`,
        {},
        getAuthHeaders()
      );

      return {
        id,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve mentor request"
      );
    }
  }
);

export const rejectMentorRequest = createAsyncThunk(
  "mentorRequests/rejectMentorRequest",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/api/mentor-requests/${id}/reject`,
        {},
        getAuthHeaders()
      );

      return {
        id,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject mentor request"
      );
    }
  }
);

const mentorRequestsSlice = createSlice({
  name: "mentorRequests",

  initialState: {
    requests: [],
    loading: false,
    error: "",
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchMentorRequests.pending, (state) => {
        state.loading = true;
        state.error = "";
      })

      .addCase(fetchMentorRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests;
      })

      .addCase(fetchMentorRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(approveMentorRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (request) => request._id !== action.payload.id
        );
      })

      .addCase(approveMentorRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(rejectMentorRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (request) => request._id !== action.payload.id
        );
      })

      .addCase(rejectMentorRequest.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default mentorRequestsSlice.reducer;
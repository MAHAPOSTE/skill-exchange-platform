import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api";

export const askAI = createAsyncThunk(
  "ai/askAI",
  async (question, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/api/ai/ask",
        {
          question,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to get AI response"
      );
    }
  }
);

const aiSlice = createSlice({
  name: "ai",

  initialState: {
    messages: [],
    loading: false,
    error: "",
  },

  reducers: {
    clearChat: (state) => {
      state.messages = [];
      state.error = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(askAI.pending, (state, action) => {
        state.loading = true;
        state.error = "";

        state.messages.push({
          role: "user",
          content: action.meta.arg,
        });
      })

      .addCase(askAI.fulfilled, (state, action) => {
        state.loading = false;

        state.messages.push({
          role: "assistant",
          content:
            action.payload.answer ||
            action.payload.response ||
            action.payload.message ||
            "No response received.",
        });
      })

      .addCase(askAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        state.messages.push({
          role: "assistant",
          content:
            action.payload ||
            "Something went wrong while contacting the AI.",
        });
      });
  },
});

export const { clearChat } = aiSlice.actions;

export default aiSlice.reducer;
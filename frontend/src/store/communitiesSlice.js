import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api";


export const fetchCommunities = createAsyncThunk(
  "communities/fetchCommunities",
  async (
    { search = "", sort = "newest", page = 1, limit = 10 } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/api/communities", {
        params: {
          search,
          sort,
          page,
          limit,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch communities"
      );
    }
  }
);

const communitiesSlice = createSlice({
  name: "communities",

  initialState: {
    communities: [],
    totalCommunities: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: false,
    error: "",
  },

  reducers: {},

  extraReducers: (builder) => {
  builder
    .addCase(fetchCommunities.pending, (state) => {
      state.loading = true;
      state.error = "";
    })

    .addCase(fetchCommunities.fulfilled, (state, action) => {
      state.loading = false;
      state.communities = action.payload.communities;
      state.totalCommunities = action.payload.totalCommunities;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
    })

    .addCase(fetchCommunities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    .addCase(joinCommunity.fulfilled, (state, action) => {
      const joinedCommunity = action.payload.community;

      const community = state.communities.find(
        (item) => item._id === joinedCommunity._id
      );

      if (community) {
        community.members = joinedCommunity.members;
      }
    })

    .addCase(joinCommunity.rejected, (state, action) => {
      state.error = action.payload;
    })

    .addCase(leaveCommunity.rejected, (state, action) => {
      state.error = action.payload;
    });
}
});

export const joinCommunity = createAsyncThunk(
  "communities/joinCommunity",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        `/api/communities/${id}/join`,
        {},
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
          "Failed to join community"
      );
    }
  }
);

export const leaveCommunity = createAsyncThunk(
  "communities/leaveCommunity",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(
        `/api/communities/${id}/leave`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        id,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to leave community"
      );
    }
  }
);

export default communitiesSlice.reducer;
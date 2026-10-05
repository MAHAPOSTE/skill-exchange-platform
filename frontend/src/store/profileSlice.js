import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api";

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.profile;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch profile"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async ({ name, bio }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        "/api/users/profile",
        {
          name,
          bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.profile;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    }
  }
);

export const uploadProfileImage = createAsyncThunk(
  "profile/uploadProfileImage",
  async (file, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await api.put(
        "/api/users/profile/image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.profile;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to upload profile image"
      );
    }
  }
);

const profileSlice = createSlice({
  name: "profile",

  initialState: {
    profile: null,
    loading: false,
    updating: false,
    uploadingImage: false,
    error: "",
    successMessage: "",
  },

  reducers: {
    clearProfileMessage: (state) => {
      state.error = "";
      state.successMessage = "";
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = "";
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })

      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = "";
        state.successMessage = "";
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.successMessage =
          "Profile updated successfully";
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      .addCase(uploadProfileImage.pending, (state) => {
        state.uploadingImage = true;
        state.error = "";
        state.successMessage = "";
      })

      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.uploadingImage = false;
        state.profile = action.payload;
        state.successMessage =
          "Profile image updated successfully";
      })

      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.uploadingImage = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileMessage } =
  profileSlice.actions;

export default profileSlice.reducer;
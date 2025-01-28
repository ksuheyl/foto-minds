import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosConfig from "../../api/axiosConfig";

import toast from "react-hot-toast";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosConfig.post(`api/auth/login`, {
        ...credentials,
        userName: credentials.email,
      });
      const data = response.data;

      if (data.success && data && data.access_token) {
        localStorage.setItem("token", data.access_token);
        toast.success("Giriş Başarılı");
        return data;
      }
      return rejectWithValue(data.message);
    } catch (error) {
      toast.error("An error occurred during login.");
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials) => {
    try {
      const response = await axiosConfig.post(`api/auth/register`, {
        ...credentials,
      });
      const data = response.data;

      if (data.success && data && data.access_token) {
        localStorage.setItem("token", data.access_token);

        toast.success("Kayıt Başarılı");
      }

      return data;
    } catch (error) {
      // Handle error here
      console.error("Login error:", error);
      throw error; // Re-throwing error to be caught elsewhere if necessary
    }
  }
);
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosConfig.post(`api/auth/auto-login`, {
        token: localStorage.token,
      });
      const data = response.data;

      if (data.success) {
        return data;
      }
      return rejectWithValue("Failed to load user");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    localStorage.removeItem("token");

    toast.success("Çıkış Başarılı");

    return {
      token: null,
      isAuthenticated: false,
      loading: false,
    };
  } catch (error) {
    console.log(error);
  }
});



export const ResetForgottenPassword = createAsyncThunk(
  "auth/ResetForgottenPassword",
  async (values) => {
    try {
      const response = await axiosConfig.post(
        `api/auth/forgot-password`,
        values
      );
      const data = response.data;
      return data;
    } catch (error) {
      console.error("An error occurred forgot password", error);
      throw error;
    }
  }
);
export const uploadUserPicture = createAsyncThunk(
  "auth/uploadUserPicture",
  async (formData, userName) => {
    try {
      const response = await axiosConfig.post(
        "api/auth/change-user-photo",
        formData,
        {
          userName,
        }
      );
      const data = response.data;
      return data;
    } catch (error) {
      console.error("An error occurred upload user picture", error);
      throw error;
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token"),
    isAuthenticated: false,
    loading: true,
    email: "",
    profilePicture: "",
    user: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.email = action.payload.email;
      state.user = {...action.payload.user}
      state.loading = false;
    });
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(login.rejected, (state) => {
      state.loading = false;
      toast.error("Kullanıcı Bilgileri Hatalı")
    });

    builder.addCase(uploadUserPicture.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(uploadUserPicture.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
      toast.success("Başarıyla Yüklendi");
      state.profilePicture = `${"/uploads/".concat(
        action.payload.file.webpFileName
      )}`;
    });

    builder.addCase(uploadUserPicture.rejected, (state, action) => {
      state.loading = false;
      toast.error("Yükleme Başarısız");
      state.error = action.payload; // Hata mesajını al
    });

    builder.addCase(register.fulfilled, (state, action) => {
      if (localStorage.token) {
        state.isAuthenticated = true;
        state.email = action.payload.email;
      }
      state.loading = false;
    });

    builder.addCase(loadUser.fulfilled, (state, action) => {
      console.log(action.payload
      )
      state.isAuthenticated = true;
      state.email = action.payload.email;
      state.loading = false;
      state.user = {...action.payload.user}
    });
    builder.addCase(loadUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadUser.rejected, (state) => {
      state.loading = false;
      localStorage.removeItem("token");
      state.isAuthenticated = false;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.userName = null;
      state.loading = false;
    });
    //ResetForgottenPassword işlemi
    builder.addCase(ResetForgottenPassword.pending, (state) => {
      state.loading = true;
      state.error = null; // Hata durumunu sıfırla
      state.successMessage = null; // Başarı mesajını sıfırla
    });
    builder.addCase(ResetForgottenPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message; // Başarı mesajını al
    });
    builder.addCase(ResetForgottenPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload; // Hata mesajını al
    });
  },
});
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;

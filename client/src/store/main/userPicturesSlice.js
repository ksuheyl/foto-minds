import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
  } from "@reduxjs/toolkit";
  import toast from "react-hot-toast";
  import axiosConfig from "../../api/axiosConfig";

export const addUserPictures = createAsyncThunk(
    "userPictures/addUserPictures",
    async (formData, { rejectWithValue }) => {
      try {
        console.log(formData);
  
        const response = await axiosConfig.post("/api/userPictures", formData);
        if (response.status === 201) {
          return response.data;
        }
      } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
      }
    }
  );

  export const getUserPictures = createAsyncThunk(
    "userPictures/getUserPictures",
    async (id) => {
      const response = await axiosConfig.get(`/api/userPictures`,id);
      return response.data;
    }
  );
  const userPicturesAdapter = createEntityAdapter({
    selectId: (picture) => picture.id,
  });
  export const { selectAll: selectUserPictures, selectById: selectUserPictureById } =
  userPicturesAdapter.getSelectors((state) => state.userPictures);

const userPicturesSlice = createSlice({
  name: "userPictures",
  initialState: userPicturesAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserPictures.fulfilled, (state, action) => {
        userPicturesAdapter.setAll(state, action.payload);
      })
      .addCase(addUserPictures.fulfilled, (state, action) => {
        state.loading = false;
        userPicturesAdapter.addMany(state, action.payload);
        toast.success("Fotoğraf Başarıyla Kaydedildi");
      })
      .addCase(addUserPictures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUserPictures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to upload userPictures.";
        toast.error("Fotoğraf Yüklenirken Bir Hata Oluştu");
      })

  },
});

export default userPicturesSlice.reducer;
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosConfig from "../../api/axiosConfig";
import axios from "axios";
import { aiProxy } from "../../api/proxy";

export const addPictures = createAsyncThunk(
  "pictures/addPictures",
  async (formData, { rejectWithValue }) => {
    try {
      console.log(formData);

      const response = await axiosConfig.post("/api/pictures", formData);
      if (response.status === 201) {
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const getPictures = createAsyncThunk(
  "pictures/getPictures",
  async () => {
    const response = await axiosConfig.get(`/api/pictures`);
    return response.data;
  }
);

// Async thunk for enhancing image
export const enhanceImage = createAsyncThunk(
  "pictures/enhanceImage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/auto-enhance",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log('response', response)
      return response.data.processed_image;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const aestheticAnalysis = createAsyncThunk(
  "pictures/aestheticAnalysis",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/analyze-aesthetic",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const vanGoghStyle = createAsyncThunk(
  "pictures/vanGoghStyle",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/vangogh-style",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.processed_image;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeBackground = createAsyncThunk(
  "pictures/removeBackground",
  async (formData) => {
    try {
      const response = await axios.post(
        `${aiProxy}/remove-background`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.processed_image;
    } catch (error) {
      console.log(error);
    }
  }
);

export const replaceBackground = createAsyncThunk(
  "pictures/replaceBackground",
  async ( formData ) => {
    try {
      const response = await axios.post(
        `${aiProxy}/replace-background`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.processed_image;
    } catch (error) {
      console.log("error", error);
    }
  }
);

export const faceEnhancer = createAsyncThunk(
  "pictures/listBackgrounds",
  async (formData) => {
    try {
      const response = await axios.post(
        `${aiProxy}/enhance-face`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.processed_image;;
    } catch (error) {
      console.log("error", error);
    }
  }
);

const picturesAdapter = createEntityAdapter({
  selectId: (picture) => picture.id,
});

export const { selectAll: selectPictures, selectById: selectPictureById } =
  picturesAdapter.getSelectors((state) => state.pictures);

const picturesSlice = createSlice({
  name: "pictures",
  initialState: picturesAdapter.getInitialState({
    enhancedImage: null,
    aestheticAnalysis: null,
    loading: false,
    error: null,
    availableBackgrounds: [],
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPictures.fulfilled, (state, action) => {
        picturesAdapter.setAll(state, action.payload);
      })
      .addCase(addPictures.fulfilled, (state, action) => {
        state.loading = false;
        picturesAdapter.addMany(state, action.payload);
        toast.success("Fotoğraf Başarıyla Kaydedildi");
      })
      .addCase(addPictures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPictures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to upload pictures.";
        toast.error("Fotoğraf Yüklenirken Bir Hata Oluştu");
      })
      .addCase(enhanceImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enhanceImage.fulfilled, (state, action) => {
        state.loading = false;
        state.enhancedImage = action.payload;
      })
      .addCase(enhanceImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(aestheticAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(aestheticAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.aestheticAnalysis = action.payload;
      })
      .addCase(aestheticAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(vanGoghStyle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(vanGoghStyle.fulfilled, (state, action) => {
        state.loading = false;
        state.enhancedImage = action.payload;
      })
      .addCase(vanGoghStyle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeBackground.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeBackground.fulfilled, (state, action) => {
        state.loading = false;
        state.enhancedImage = action.payload;
      })
      .addCase(removeBackground.rejected, (state) => {
        state.loading = false;
      })
      .addCase(replaceBackground.pending, (state) => {
        state.loading = true;
      })
      .addCase(replaceBackground.fulfilled, (state, action) => {
        state.loading = false;
        state.enhancedImage = action.payload;
      })
      .addCase(replaceBackground.rejected, (state) => {
        state.loading = false;
      })
      .addCase(faceEnhancer.pending, (state) => {
        state.loading = true;
      })
      .addCase(faceEnhancer.fulfilled, (state, action) => {
        state.loading = false;
        state.enhancedImage = action.payload;
      })
      .addCase(faceEnhancer.rejected, (state) => {
        state.loading = false;
      })
  },
});

export default picturesSlice.reducer;

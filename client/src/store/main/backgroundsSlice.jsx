import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
  } from "@reduxjs/toolkit";
  import axiosConfig from "../../api/axiosConfig";
  
  export const getBackgrounds = createAsyncThunk(
    "backgrounds/getBackgrounds",
    async () => {
      const response = await axiosConfig.get(`/api/backgrounds`);
      return response.data;
    }
  );
  export const addBackground = createAsyncThunk(
    "backgrounds/addBackground",
    async (background, { rejectWithValue }) => {
      try {
        const response = await axiosConfig.post(`/api/backgrounds`, background);
        if (response.status === 201) {
          return response.data;
        } else {
          return rejectWithValue("Failed to add background");
        }
      } catch (error) {
        console.error("Error:", error);
        return rejectWithValue(error.message);
      }
    }
  );
  
  // Adapter
  const backgroundsAdapter = createEntityAdapter({
    selectId: (background) => background.id,
  });
  
  export const { selectAll: selectBackgrounds, selectById: selectBackgroundsById } =
    backgroundsAdapter.getSelectors((state) => state.backgrounds);
  
  // Initial State
  const initialState = backgroundsAdapter.getInitialState({
    loading: false,
    error: null,
    searchText: "",
    backgroundDialog: {
      type: "new",
      props: {
        open: false,
      },
      data: null,
    },
  });
  
  const backgroundsSlice = createSlice({
    name: "backgrounds",
    initialState,
    reducers: {
      setBackgroundSearchText: {
        reducer: (state, action) => {
          state.searchText = action.payload;
        },
        prepare: (event) => ({ payload: event.target.value || "" }),
      },
      openNewBackgroundDialog: (state, action) => {
        state.backgroundDialog = {
          type: "new",
          props: { open: true },
          data: action.payload,
        };
      },
      closeNewBackgroundDialog: (state) => {
        state.backgroundDialog = {
          type: "new",
          props: { open: false },
          data: null,
        };
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(getBackgrounds.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(getBackgrounds.fulfilled, (state, action) => {
          state.loading = false;
          backgroundsAdapter.setAll(state, action.payload);
        })
        .addCase(getBackgrounds.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        })
        .addCase(addBackground.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(addBackground.fulfilled, (state, action) => {
          state.loading = false;
          state.newlyAddedBackground = action.payload.id;
          backgroundsAdapter.addOne(state, action.payload);
        })
        .addCase(addBackground.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        });
    },
  });
  
  export const {
    setBackgroundSearchText,
    openNewBackgroundDialog,
    closeNewBackgroundDialog,
  } = backgroundsSlice.actions;
  
  export const selectBackgroundsLoading = (state) => state.backgrounds.loading;
  export const selectBackgroundsError = (state) => state.backgrounds.error;
  
  export default backgroundsSlice.reducer;
  
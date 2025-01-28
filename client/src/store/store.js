import { configureStore } from '@reduxjs/toolkit';
import pictures from './pictures/picturesSlice';
import logger from 'redux-logger';
import auth from "./auth/authSlice"
import backgrounds from "./main/backgroundsSlice"
import userPictures from "./main/userPicturesSlice"
const store = configureStore({
  reducer: {
    pictures,
    auth,
    backgrounds,
    userPictures,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;

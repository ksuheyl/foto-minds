import { useDispatch, useSelector } from "react-redux";
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";

import { resultProxy } from "../../api/proxy";
import { addUserPictures } from "../../store/main/userPicturesSlice";

const Results = () => {
  const result = useSelector((state) => state.pictures.enhancedImage);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.pictures.loading);
  const userId = useSelector((state) => state.auth.user.id);
  const url = useSelector((state) => state.pictures.enhancedImage);
  const handleAddPicture = () => {
    dispatch(addUserPictures({ userId: userId, url: url }));
  };
  console.log('resultProxy.concat(result)', resultProxy.concat(result))
  return (
    <Paper
      elevation={2}
      sx={{
        width: "450px",
        height: "350px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: "4.5px",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Sonuçlar
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          justifyContent: result ? "flex-start" : "center",
        }}
      >
        {!loading && result ? (
          <Box
            sx={{
              textAlign: "center",
              justifyContent: loading ? "center" : "none",
            }}
          >
            <img
              src={resultProxy.concat(result)}
              alt="Enhanced"
              style={{ width: "400px", height: "250px", objectFit: "contain" }}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddPicture}
                size="small"
              >
                Resmi Kaydet
              </Button>
            </Box>
          </Box>
        ) : loading ? (
          <CircularProgress color="success" />
        ) : (
          <Typography color="text.secondary">Henüz sonuç yok</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default Results;

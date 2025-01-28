import { useState } from "react";
import Dropzone from "react-dropzone";
import { Button, Paper, Typography, Box } from "@mui/material";

const Upload = ({setImage}) => {
  const [preview, setPreview] = useState(null);
  const handleDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setImage(file)
    setPreview(URL.createObjectURL(file));
  };
  const handleRemovePreview = () => {
    setPreview(null);
    setImage(null);
  };

  return (
    <Paper elevation={2} sx={{ 
      width: '450px',
      height: '350px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      p: 2
    }}>
      <Typography variant="h6" gutterBottom>
        Resim Yükle
      </Typography>
      { !preview && <Dropzone onDrop={handleDrop}>
        {({ getRootProps, getInputProps }) => (
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #cccccc',
              borderRadius: 1,
              p: 3,
              cursor: 'pointer',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <input {...getInputProps()} />
            <Typography>
              Bir resmi buraya sürükleyip bırakın veya birini seçmek için tıklayın
            </Typography>
          </Box>
        )}
      </Dropzone>}
      {preview && (
        <Box sx={{ textAlign: 'center' }}>
          <img
            src={preview}
            alt="Preview"
            style={{ width: "400px", height: "250px", objectFit: 'contain' }}
          />
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleRemovePreview}
              size="small"
            >
              Resmi Kaldır
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default Upload;

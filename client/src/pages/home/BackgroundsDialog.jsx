import {
  Box,
  Typography,
  Modal,
  TextField,
  Button,
  IconButton,
  Checkbox,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  addBackground,
  closeNewBackgroundDialog,
  selectBackgrounds,
} from "../../store/main/backgroundsSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Carousel from "react-material-ui-carousel";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState, useEffect } from "react";
import { expressProxy } from "../../api/proxy";

import { toast } from "react-hot-toast";
import { replaceBackground } from "../../store/pictures/picturesSlice";

const schema = yup
  .object({
    backgroundName: yup.string().required("Arka Plan İsmi Zorunludur"),
    imageFile: yup
      .mixed()
      .required("Lütfen bir fotoğraf seçin")
      .test("fileType", "Sadece resim dosyaları yüklenebilir", (value) => {
        if (!value) return false;
        return value && value.type.startsWith("image/");
      }),
  })
  .required();

const StyledModal = styled(Modal)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
const CarouselImageContainer = styled("div")({
  width: "100%",
  position: "relative",
  display: "inline-block",
});
const ContentBox = styled(Box)(({ theme }) => ({
  position: "relative",
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  width: "600px",
  maxWidth: "90vw",
  maxHeight: "90vh",
  overflow: "auto",
}));

const ImagePreview = styled("img")({
  width: "100%",
  height: "300px",
  borderRadius: "8px",
  marginTop: "16px",
});

const CarouselImage = styled("img")({
  width: "100%",
  height: "300px",
  objectFit: "cover",
  borderRadius: "8px",
});

export default function BackgroundsDialog({ image }) {
  const backgroundDialog = useSelector(
    (state) => state.backgrounds.backgroundDialog
  );
  const dispatch = useDispatch();
  const imageList = useSelector(selectBackgrounds);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectedBackground, setSelectedBackground] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      backgroundName: "",
      imageFile: null,
    },
  });

  const selectedFile = watch("imageFile");
  const onClose = () => {
    dispatch(closeNewBackgroundDialog());
    setValue("imageFile", null);
    setValue("backgroundName", "");
  };
  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("imageFile", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleUpload = (data) => {
    if (!data.imageFile) return;

    const formData = new FormData();
    formData.append("photo", data.imageFile);
    formData.append("backgroundName", data.backgroundName);
    dispatch(addBackground(formData));
    dispatch(closeNewBackgroundDialog());
  }; 

  const handleCheckboxChange = (imageUrl) => {
    setSelectedImages((prev) => {
      const newSelectedImages = new Set(prev);
      if (newSelectedImages.has(imageUrl)) {
        newSelectedImages.delete(imageUrl);
      } else {
        newSelectedImages.clear();
        newSelectedImages.add(imageUrl);
      }
      setSelectedBackground(newSelectedImages);
      return newSelectedImages;
    });
  };
  const handleChangeBackground = () => {
    if (!image || !selectedBackground) {
      toast.error("Lütfen bir resim ve arka plan seçin");
      return;
    }

    const formData = new FormData();
    formData.append("photo", image);
    formData.append("background", `${[...selectedBackground][0]}`);
    dispatch(replaceBackground(formData))
      .then(() => {
        dispatch(closeNewBackgroundDialog());
        toast.success("Arka plan başarıyla değiştirildi");
      })
      .catch((error) => {
        toast.error("Arka plan değiştirme işlemi başarısız oldu");
        console.error('Error:', error);
      });
  };
  return (
    <StyledModal
      open={backgroundDialog?.props?.open || false}
      onClose={() => {
        setPreviewUrl(null);
        onClose();
      }}
    >
      <ContentBox>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2">
            Yeni Arka Plan Ekle
          </Typography>
          <IconButton size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit(handleUpload)}>
          <TextField
            {...register("backgroundName")}
            label="Arka Plan İsmi"
            fullWidth
            error={!!errors.backgroundName}
            helperText={errors.backgroundName?.message}
            sx={{ mb: 3 }}
          />

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 3 }}
            startIcon={<UploadFileIcon />}
          >
            Arkaplan Resmini Yükle
            <input
              type="file"
              hidden
              accept="image/*"
              {...register("imageFile", {
                onChange: (e) => onFileChange(e),
              })}
            />
          </Button>

          {errors.imageFile && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.imageFile.message}
            </Typography>
          )}

          {previewUrl && <ImagePreview src={previewUrl} alt="Preview" />}

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Kullanılabilen Arka planlar
          </Typography>

          <Carousel>
            {imageList.map((image, index) => (
              <CarouselImageContainer key={index}>
                <CarouselImage
                  onClick={() => handleCheckboxChange(image.url)}
                  src={expressProxy.concat(image.url)}
                  alt={`Background ${index + 1}`}
                  sx={{ cursor: "pointer" }}
                />
                <Checkbox
                  checked={selectedImages.has(image.url)}
                  onChange={() => handleCheckboxChange(image.url)}
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "50px",
                    zIndex: 10,
                    color: "wheat",
                  }}
                  size="medium"
                />
              </CarouselImageContainer>
            ))}
          </Carousel>

          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}
          >
            <Button disabled={!image} variant="outlined" onClick={() => handleChangeBackground()}>
              İşlemi Başlat
            </Button>
            <Box sx={{ display: "flex", gap: "1rem" }}>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                disabled={!selectedFile}
              >
                Arka planı Kaydet
              </Button>
              <Button variant="outlined" onClick={() => onClose()}>
                İptal
              </Button>
            </Box>
          </Box>
        </form>
      </ContentBox>
    </StyledModal>
  );
}

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Upload from "./Upload";
import FilterCards from "../../components/Cards/Cards";
import imageFilter1 from "../../assets/filter1.jpg";
import imageFilter2 from "../../assets/filter2.jpeg";
import imageFilter3 from "../../assets/StilTransferi.jpg";
import imageFilter4 from "../../assets/removeBack.png"; 
import imageFilter5 from "../../assets/changeBack.jpeg";
// import imageFilter6 from "../../assets/FaceEnhancer.jpeg"
import Results from "./Results";
import BackgroundsDialog from "./BackgroundsDialog"
import { useDispatch, useSelector } from "react-redux";
import {
  aestheticAnalysis,
  enhanceImage,
  vanGoghStyle,
  removeBackground,
  // faceEnhancer,
} from "../../store/pictures/picturesSlice";
import CustomToast from "../../components/custom/CustomToast";
import { getBackgrounds, openNewBackgroundDialog } from "../../store/main/backgroundsSlice";

const Home = () => {
  const analysisData = useSelector((state) => state.pictures.aestheticAnalysis);
  console.log("analysisData", analysisData);
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();

  const handleAutoColorEdit = () => {
    const formData = new FormData();
    formData.append("photo", image);
    dispatch(enhanceImage(formData));
  };
  const handleEstheticAnalysis = () => {
    const formData = new FormData();
    formData.append("photo", image);
    dispatch(aestheticAnalysis(formData));
  };
  const handleVanGoghStyle = () => {
    const formData = new FormData();
    formData.append("photo", image);
    dispatch(vanGoghStyle(formData));
  };
  const handleRemoveBackground = () => {
    const formData = new FormData();
    formData.append("photo", image);
    dispatch(removeBackground(formData));
  };
  const handleReplaceBackground = () => {
  dispatch(openNewBackgroundDialog())
    
    // const formData = new FormData();
    // formData.append("photo", image);
    // dispatch(replaceBackground({ formData, backgroundName: selectedBackground }));
  };
// const handleFaceEnhancer = ()=>{
//   const formData = new FormData();
//   formData.append("photo", image);
//   dispatch(faceEnhancer(formData));
// }
  useEffect(() => {
    if (analysisData) {
      CustomToast({ analysisData });
    }
  }, [analysisData]);

  useEffect(() => {
    dispatch(getBackgrounds());
  }, [dispatch]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "90vh",
      }}
    >
      {/* Top Section */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          justifyContent: "space-around",
          borderBottom: "1px solid #eee",
          padding: "10px",
        }}
      >
        <Upload setImage={setImage} />
        <Results />
      </Box>

      {/* Bottom Section */}
      <Box
        sx={{
          display: "flex",
          padding: "20px",
          gap: ".5rem",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <FilterCards
          onClick={handleAutoColorEdit}
          title={"Otomatik Renk Düzenle"}
          src={imageFilter1}
        />
        <FilterCards
          onClick={handleEstheticAnalysis}
          title={"Estetik Analiz Yap"}
          src={imageFilter2}
        />
        <FilterCards
          onClick={handleVanGoghStyle}
          title={"Van Gogh stil Transferi"}
          src={imageFilter3}
        />
        <FilterCards
          onClick={handleRemoveBackground}
          title={"Arka Planı Kaldır"}
          src={imageFilter4}
        />
        <FilterCards
          onClick={handleReplaceBackground}
          title={"Arka Planı Değiştir"}
          src={imageFilter5}
        />
          {/* <FilterCards
          onClick={handleFaceEnhancer}
          title={"Yüz ifadesini Düzelt"}
          src={imageFilter6}
        /> */}
        
      </Box>

<BackgroundsDialog image={image}/>
    </Box>
  );
};

export default Home;

import { Box } from "@mui/system";
import Header from "../components/Headers/Header";

const BaseLayout = (props) => {
  return (
    <Box>
      <Header />
      {props.children}
    </Box>
  );
};

export default BaseLayout;

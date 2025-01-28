import toast from "react-hot-toast";
import { Card, CardContent, Typography, IconButton, Box, List, ListItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from '@mui/icons-material/Image';

const CustomToast = ({ analysisData }) => {
  return toast.custom((t) => (
    <Card
      sx={{
        maxWidth: '400px',
        width: '100%',
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 2,
        opacity: t.visible ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ImageIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            Image Analysis Score: {analysisData.score}/10
          </Typography>
        </Box>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Composition:
        </Typography>
        <Typography variant="body2" gutterBottom>
          Aspect Ratio: {analysisData.composition.aspect_ratio}
          {analysisData.composition.follows_rule_of_thirds && (
            <span>, Follows Rule of Thirds</span>
          )}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Exposure:
        </Typography>
        <Typography variant="body2" gutterBottom>
          Brightness: {analysisData.exposure.brightness}
          {analysisData.exposure.is_well_exposed && (
            <span>, Well Exposed</span>
          )}
        </Typography>

        {analysisData.suggestions && analysisData.suggestions.length > 0 && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Suggestions:
            </Typography>
            <List dense sx={{ mt: 1 }}>
              {analysisData.suggestions.map((suggestion, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <Typography variant="body2" color="error.main">
                    • {suggestion}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
      
      <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
        <IconButton
          onClick={() => toast.dismiss(t.id)}
          color="primary"
          sx={{ p: 1, width: '100%' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Card>
  ));
};

export default CustomToast;


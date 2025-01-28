import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { selectUserPictures } from '../../store/main/userPicturesSlice';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { resultProxy } from '../../api/proxy';
import { styled } from '@mui/system';

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: theme.shadows[6],
  '&:hover': {
    boxShadow: theme.shadows[12],
    transform: 'scale(1.02)',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  },
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
}));

const Profile = () => {
  const userPictures = useSelector(selectUserPictures);

  const handleDownload = async (url) => {
    try {
      const response = await fetch(`${resultProxy}/${url}`);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "image.png"; 
      link.click();
      URL.revokeObjectURL(link.href); 
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {userPictures.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} sx={{width:"35%"}} key={index}>
            <ModernCard>
              <Box sx={{ position: 'relative', height: 0, paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
                <CardMedia
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    objectFit: 'cover',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                  image={`${resultProxy}/${item.url}`}
                  title={`User Picture ${index + 1}`}
                />
              </Box>
              <CardContent sx={{ padding: 2 }}>
                <Typography gutterBottom variant="h6" component="div" color="text.primary">
                  Fotoğraf {index + 1}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', paddingX: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  sx={{
                    paddingX: 3,
                    transition: '0.3s',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  onClick={() => window.open(`${resultProxy}/${item.url}`, '_blank')}
                >
                  Görüntüle
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    paddingX: 3,
                    transition: '0.3s',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                  }}
                  onClick={() => handleDownload(item.url)}
                >
                  İndir
                </Button>
              </CardActions>
            </ModernCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Profile;

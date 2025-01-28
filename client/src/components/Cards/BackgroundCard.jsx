import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import { Tooltip, Typography } from "@mui/material";
import { CloudUpload, RestartAlt } from "@mui/icons-material";

export default function BackgroundCard({
  title,
  description,
  src,
  onClick,
  onClick2,
}) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia component="img" height="120" image={src} alt="filterCard" />
      <CardContent sx={{ py: 1 }}>
        <Typography
          gutterBottom
          sx={{ fontSize: "1rem", color: "text.secondary" }}
          variant="h6"
          component="div"
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontSize: ".1rem", color: "text.secondary" }}
        >
          {description}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <Tooltip title="Fotoğraf Seç">
          <IconButton onClick={onClick} aria-label="add to favorites">
            <CloudUpload />
          </IconButton>
        </Tooltip>
        <Tooltip title="İşlemi Başlat">
          <IconButton onClick={onClick2} aria-label="share">
          <RestartAlt />

          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

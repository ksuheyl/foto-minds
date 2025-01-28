import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

const FilterCards = ({title,description, src, onClick }) => {
  return (
    <Card onClick={onClick} sx={{ width: 220 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="120"
          image={src}
          alt="filterCard"
        />
        <CardContent sx={{ py: 1 }}>
          <Typography gutterBottom  sx={{fontSize:"1rem", color: 'text.secondary' }} variant="h6" component="div">
           {title}
          </Typography>
          <Typography variant="body2" sx={{fontSize:".1rem", color: 'text.secondary' }}>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default FilterCards
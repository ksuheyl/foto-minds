import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import authFoto from "../../assets/login4.jpeg"
import { login } from '../../store/auth/authSlice';
import { useDispatch } from 'react-redux';
const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const dispatch = useDispatch();
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Geçersiz E posta').required('E-posta Zorunludur'),
      password: Yup.string().required('Şifre Zorunludur'),
    }),
    onSubmit: (values) => {
      dispatch(login(values))
    },
  });

  return (
    <Container
      maxWidth="100%"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${authFoto})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Box
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          p: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Oturum Aç
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="E Posta"
            variant="outlined"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Şifre"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
          >
            Giriş Yap
          </Button>
        </form>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Forgot password?
        </Typography>
        <Link to="/register" color="textSecondary" style={{ mt: 2, textDecoration:"none" }}>
          Hesabın Yok mu Hesap Oluştur
        </Link>
      </Box>
    </Container>
  );
};

export default Login;

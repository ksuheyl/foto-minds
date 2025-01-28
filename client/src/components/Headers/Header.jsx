import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { useDispatch } from "react-redux";
import { logout } from "../../store/auth/authSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export default function Header() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    dispatch(logout());
  };
  const navigate = useNavigate();
  const { pathname } = useLocation();
  console.log("location", pathname);

  const getButtonStyle = (path) => {
    return {
      my: 2,
      color: pathname === path ? "white" : "rgba(255, 255, 255, 0.7)",
      backgroundColor: pathname === path ? "blue" : "transparent",
      display: "block",
      borderRadius: "4px",
      padding: "8px 16px",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: pathname === path ? "darkviolet" : "rgba(255, 255, 255, 0.1)",
      },
    };
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, marginRight: "1rem" }}>
              Foto Minds
            </Typography>
            <Button onClick={() => { navigate("/home"); }} sx={getButtonStyle("/home")}>
              Home
            </Button>
            <Button onClick={() => { navigate("/profile"); }} sx={getButtonStyle("/profile")}>
              Profilim
            </Button>
          </Box>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem>
                <Link
                  style={{ color: "black", textDecoration: "none" }}
                  to={"/profile"}
                >
                  Profilim
                </Link>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

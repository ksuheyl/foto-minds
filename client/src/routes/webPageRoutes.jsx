import Icon from "@mui/material/Icon";
import Register from "../pages/auth/Register";

import Login from "../pages/auth/Login";

const webPageRoutes = [
  {
    name: "Giriş Yap",
    key: "sign-in",
    icon: <Icon>Giriş Yap</Icon>,
    route: "/login",
    component: <Login />,
  },
  {
    name: "Kayıt Ol",
    key: "sign-up",
    icon: <Icon>Kayıt Ol</Icon>,
    route: "/register",
    component: <Register />,
  },
];

export default webPageRoutes;

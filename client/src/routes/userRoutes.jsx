import Icon from "@mui/material/Icon";
import Home from "../pages/home/Home";
import ProfileDashboard from "../pages/profile/ProfileDashboard";

const userRoutes = [
  {
    name: "Ev",
    key: "home",
    icon: <Icon>Home</Icon>,
    route: "/home",
    component: <Home />,
  },
  {
    name: "Profil",
    key: "profil",
    icon: <Icon>Profile</Icon>,
    route: "/profile",
    component: <ProfileDashboard />,
  },
];

export default userRoutes;

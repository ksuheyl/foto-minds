import { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux"
import { getUserPictures } from "../../store/main/userPicturesSlice";
import Profile from "./Profile";


const ProfileDashboard = () => {
const dispatch = useDispatch()
const {id} = useSelector((state)=> state.auth.user)

  useEffect(() => {
    dispatch(getUserPictures(id))
  },[]);
  return (
    <Profile/>
  )
};

export default ProfileDashboard;

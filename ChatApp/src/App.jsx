import { Route, Routes, useNavigate } from "react-router-dom";
import { Chat } from "./Pages/Chat/Chat";
import { Login } from "./Pages/LoginPage/Login";
import { ProfileUpdate } from "./Pages/ProfileUpdate/ProfileUpdate";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { AppContext } from "./context/AppContext";

const App = () => {

  const navigate = useNavigate();
  const { loadUserData } = useContext(AppContext);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      // if(user){
      //   navigate('/chat');
      //   await loadUserData(user.uid)
      // }else{
      //   navigate('/');
      // }

      if (user) {
        await loadUserData(user.uid);
      } else {
        navigate('/');
      }

    })
  }, [])
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/profile' element={<ProfileUpdate />} />
      </Routes>
    </>
  )
}

export default App;
import { useContext, useEffect, useState } from "react"
import "./ProfileUpdate.css"
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import upload from "../../library/upload";
import { AppContext } from "../../context/AppContext";

export const ProfileUpdate = () => {

    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [prevImage, setPrevImage] = useState("");
    const [uid, setUid] = useState("");
    const { setUserData } = useContext(AppContext);

    // const handleProfileUpdate = async(event) => {
    //     event.preventDefault();
    //     try {
    //         if(!prevImage && !profileImage){
    //             toast.error("Upload Profile Picture");
    //         }

    //         const docRef = doc(db,'users',uid);
    //         if(profileImage){
    //             const imgUrl = await upload(profileImage);
    //             setPrevImage(imgUrl);
    //             await updateDoc(docRef,{
    //                 avatar: imgUrl,
    //                 bio: bio,
    //                 name: name
    //             })
    //         }

    //         else{
    //             await updateDoc(docRef,{
    //                 bio: bio,
    //                 name: name
    //             })
    //         }
    //         const snap = await getDoc(docRef);
    //         setUserData(snap.data());
    //         navigate('/chat')
    //     } catch (error) {
    //         console.error(error);
    //         toast.error(error.message)
    //     }
    // }

    // new proflie update ---------------------
    const handleProfileUpdate = async (event) => {
        event.preventDefault();

        try {
            const docRef = doc(db, "users", uid);

            await updateDoc(docRef, {
                name: name,
                bio: bio
            });

            const snap = await getDoc(docRef);

            setUserData(snap.data());

            navigate("/chat");

        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUid(user.uid)
                const docRef = doc(db, "users", user.uid);
                const docSnap = getDoc(docRef);

                if ((await docSnap).data().name) {
                    setName((await docSnap).data().name);
                }

                if ((await docSnap).data().bio) {
                    setBio((await docSnap).data().bio);
                }

                if ((await docSnap).data().avatar) {
                    setPrevImage((await docSnap).data().avatar);
                }
            } else {
                navigate('/')
            }
        })
    }, [])

    return (
        <div className="profile">
            <div className="profile-container">
                <form onSubmit={handleProfileUpdate}>
                    <h3>Profile Deatil</h3>
                    {/* <label htmlFor="avatar">
                    <input type="file" onChange={(e) => setProfileImage(e.target.files[0])} id="avatar" accept=".png, .jpg, .jpeg" hidden />
                    <img src={profileImage ? URL.createObjectURL(profileImage) : "avatar_icon.png"}/>
                    upload profile image
                    </label> */}
                    <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="Your name" required />
                    <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder="write your bio" required></textarea>
                    <button type="submit">Save</button>
                </form>
                {/* <img className="profile-pic" src={profileImage ? URL.createObjectURL(profileImage) : prevImage ? prevImage : "chatapp.png"} /> */}
                <img
                    className="profile-pic"
                    src="chatapp.png"
                />
            </div>
        </div>
    )
}
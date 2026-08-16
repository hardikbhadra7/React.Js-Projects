import { HiEllipsisVertical, HiMagnifyingGlass } from "react-icons/hi2";
import './LeftSidebar.css'
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

export const LeftSidebar = () => {

    const { userData, chatData, chatUser, setChatUser, setMesaagesId, messagesId, chatVisible, setChatVisible } = useContext(AppContext)
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const handleInput = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);
                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                    let userExist = false;
                    chatData.map((user) => {
                        if (user.rId === querySnap.docs[0].data().id) {
                            userExist = true;
                        }
                    })
                    if (!userExist) {
                        setUser(querySnap.docs[0].data());
                    }
                }
                else {
                    setUser(null);
                }
            }
            else {
                setShowSearch(false);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const addChat = async () => {
        const messageRef = collection(db, "messages");
        const chatRef = collection(db, "chats");
        try {
            const newMessageRef = doc(messageRef);

            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                messages: []
            })

            await updateDoc(doc(chatRef, user.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })
            await updateDoc(doc(chatRef, userData.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            })
            const uSnap = await getDoc(doc(db, 'users', user.id));
            const uData = uSnap.data();
            setChat({
                messagesId: newMessageRef.id,
                lastMessage: "",
                rId: user.id,
                updatedAt: Date.now(),
                messageSeen: true,
                userData: uData
            })
            setShowSearch(false);
            setChatVisible(true);
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    }

    const setChat = async (currUser) => {
        try {
            setMesaagesId(currUser.messageId);
            setChatUser(currUser);
            const userChatsRef = doc(db, 'chats', userData.id);
            const userCharsSnapshot = await getDoc(userChatsRef);
            const userChatData = userCharsSnapshot.data();
            const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === currUser.messageId);
            userChatData.chatData[chatIndex].messageSeen = true;
            await updateDoc(userChatsRef, {
                chatData: userChatData.chatData
            })
            setChatVisible(true);
            console.log("Clicked:", currUser);
setChatVisible(true);
console.log("setChatVisible called");
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        const updatedChatUserData = async () => {
            if(chatUser){
                const userRef = doc(db, 'users', chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev => ({...prev, userData:userData}));
            }
        }
        updatedChatUserData();
    }, [chatData])

    return (
        <div className={`leftSidebar ${chatVisible ? "hidden" : ""}`}>
            <div className="leftSidebar-top">
                <div className="nav">
                    <img src="chatapp.png" alt="chatapp" className="logo" />
                    <div className="menu">
                        <HiEllipsisVertical className="three-dot" size={24} />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <HiMagnifyingGlass className="search-icon" />
                    <input onChange={handleInput} type="text" placeholder="Search Friend" />
                </div>
            </div>
            <div className="user-list">
                {showSearch && user
                    ? <div onClick={addChat} className="friends add-user">
                        <img src={user.avatar || "profile-img.png"} />
                        <p>{user.name}</p>
                    </div>
                    : chatData.map((currUser, index) => (
                        <div onClick={() => setChat(currUser)} key={index}
                            className={`friends ${currUser.messageSeen || currUser.messageId === messagesId ? "" : "border"}`}>
                            <img src={currUser.userData.avatar || "profile-img.png"} />
                            <div>
                                <p>{currUser.userData.name}</p>
                                <span>{currUser.lastMessage}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

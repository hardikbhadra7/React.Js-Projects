import { useContext, useEffect, useRef, useState } from 'react'
import './Chatbox.css'
import { AppContext } from '../../context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import upload from '../../library/upload';

export const Chatbox = () => {

    const { userData, messages, setMessages, messagesId, chatUser, chatVisible, setChatVisible } = useContext(AppContext);
    const [input, setInput] = useState("");
    const [selectMessage, setSelectMessage] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({
        x: 0,
        y: 0,
    });
    const [editMessage, setEditMessage] = useState(null);
    const chatBoxRef = useRef(null);
    const menuRef = useRef(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (editMessage) {
            const messageRef = doc(db, "messages", messagesId);
            const messageSnap = await getDoc(messageRef);
            const allMessages = messageSnap.data().messages;
            const updateEditMessage = allMessages.map((msg) => {
                if (msg.createdAt.isEqual(editMessage.createdAt)) {
                    return {
                        ...msg,
                        text: input
                    }
                } else {
                    return msg;
                }
            })

            await updateDoc(doc(db, "messages", messagesId), {
                messages: updateEditMessage,
            });

            // leftsidebar lastseen message update 
            const userIDs = [chatUser.rId, userData.id];

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "chats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatData = userChatsSnapshot.data();

                    const chatIndex = userChatData.chatData.findIndex(
                        (chat) => chat.messageId === messagesId
                    );

                    if (chatIndex !== -1) {
                        userChatData.chatData[chatIndex].lastMessage = input.slice(0, 30);

                        await updateDoc(userChatsRef, {
                            chatData: userChatData.chatData,
                        });
                    }
                }
            });

            setInput("");
            setEditMessage(null);
            setShowMenu(false);
        } else {
            try {
                if (input && messagesId) {
                    await updateDoc(doc(db, "messages", messagesId), {
                        messages: arrayUnion({
                            sId: userData.id,
                            text: input,
                            createdAt: new Date()
                        })
                    })

                    const userIDs = [chatUser.rId, userData.id];

                    userIDs.forEach(async (id) => {
                        const userChatsRef = doc(db, 'chats', id);
                        const userCharsSnapshot = await getDoc(userChatsRef);

                        if (userCharsSnapshot.exists()) {
                            const userChatData = userCharsSnapshot.data();
                            const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === messagesId);
                            userChatData.chatData[chatIndex].lastMessage = input.slice(0, 30);
                            userChatData.chatData[chatIndex].updatedAt = Date.now();
                            if (userChatData.chatData[chatIndex].rId === userData.id) {
                                userChatData.chatData[chatIndex].messageSeen = false;
                            }
                            await updateDoc(userChatsRef, {
                                chatData: userChatData.chatData
                            })
                        }
                    })
                }
            } catch (error) {
                toast.error(error.message)
            }
            setInput("");
        }
    }

    const sendImage = async (e) => {
        try {
            const fileUrl = await upload(e.target.files[0]);
            if (fileUrl && messagesId) {
                await updateDoc(doc(db, "messages", messagesId), {
                    messages: arrayUnion({
                        sId: userData.id,
                        image: fileUrl,
                        createdAt: new Date()
                    })
                })

                const userIDs = [chatUser.rId, userData.id];

                userIDs.forEach(async (id) => {
                    const userChatsRef = doc(db, 'chats', id);
                    const userCharsSnapshot = await getDoc(userChatsRef);

                    if (userCharsSnapshot.exists()) {
                        const userChatData = userCharsSnapshot.data();
                        const chatIndex = userChatData.chatData.findIndex((c) => c.messageId === messagesId);
                        userChatData.chatData[chatIndex].lastMessage = "Image"
                        userChatData.chatData[chatIndex].updatedAt = Date.now();
                        if (userChatData.chatData[chatIndex].rId === userData.id) {
                            userChatData.chatData[chatIndex].messageSeen = false;
                        }
                        await updateDoc(userChatsRef, {
                            chatData: userChatData.chatData
                        })
                    }
                })


            }
        } catch (error) {
            toast.error(error.message);

        }
    }

    const convertTimeStamp = (timestamp) => {
        let date = timestamp.toDate();
        let hour = date.getHours();
        let minutes = date.getMinutes();

        if (hour > 12) {
            return hour - 12 + ":" + minutes + " PM";
        }
        else {
            return hour + ":" + minutes + " AM";

        }
    }

    useEffect(() => {
        console.log("Current messagesId:", messagesId);

        if (messagesId) {
            const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
                console.log("Exists:", res.exists());
                console.log("Doc ID:", messagesId);

                if (!res.exists()) {
                    console.log("Document not found");
                    return;
                }

                console.log(res.data());

                setMessages([...res.data().messages].reverse());
            });

            return () => unSub();
        }
    }, [messagesId]);

    // copy feature 
    const handleCopyButton = async () => {
        await navigator.clipboard.writeText(selectMessage.text);
        setShowMenu(false);
    }
    const handleOutsideClick = (e) => {
        if (menuRef.current && menuRef.current.contains(e.target)) {
            return;
        }
        setShowMenu(false);
    }
    useEffect(() => {
        document.addEventListener("click", handleOutsideClick);

        return () => {
            document.removeEventListener("click", handleOutsideClick);
        }
    }, [])

    const handleDeleteChatMessage = async () => {
        try {
            const messageRef = doc(db, "messages", messagesId);
            const messageSnap = await getDoc(messageRef);
            const allMessages = messageSnap.data().messages;
            // console.log(allMessages);
            const updatedMessage = allMessages.filter((msg) => {
                return (!msg.createdAt.isEqual(selectMessage.createdAt));
            })
            console.log("Updated:", updatedMessage);
            await updateDoc(doc(db, "messages", messagesId), {
                messages: updatedMessage,
            })
            setShowMenu(false);
            console.log("Selected:", selectMessage);
            console.log("All:", allMessages);
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    }

    const handleEditMessage = () => {
        setEditMessage(selectMessage)
        setInput(selectMessage.text)
        setShowMenu(false)
    }
    return chatUser ? (
        <div className={`chat-box ${chatVisible ? "" : "hidden"}`} ref={chatBoxRef}>
            <div className="chat-user">
                <img src={chatUser.userData.avatar_icon || "profile-img.png"} />
                <p>{chatUser.userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src="green_dot.png" className='dot' /> : null}</p>
                <img src="help_icon.png" className='help' />
                <img onClick={() => setChatVisible(false)} src="arrow_icon.png" alt="arrow icon" className='arrow' />
            </div>

            <div className="chat-msg">
                {/* sender msg  */}
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? "sender-msg" : "our-msg"}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            setSelectMessage(msg);
                            setShowMenu(true);
                            const rect = chatBoxRef.current.getBoundingClientRect();
                            setMenuPosition({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                            })
                            console.log(msg);
                            console.log(menuPosition);
                        }}>
                        {msg["image"]
                            ? <img className='msg-img' src={msg.image} alt="loading" />
                            : <p className='msg'>{msg.text}</p>
                        }
                        <div>
                            <img src="profile-img.png" />
                            <p>{convertTimeStamp(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}

            </div>

            {/* edit delete copy feature  */}
            {
                showMenu && (
                    <div className="message-menu"
                        style={{
                            left: menuPosition.x,
                            top: menuPosition.y
                        }} ref={menuRef}>
                        <p onClick={handleCopyButton}>Copy</p>
                        <p onClick={handleEditMessage}>Edit</p>
                        <p onClick={handleDeleteChatMessage}>Delete</p>
                    </div>
                )
            }
            <div className="chat-input">
                <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='send a message' />
                <input onChange={(sendImage)} type="file" id='image' accept='image/png, image/jpeg' hidden />
                <label htmlFor="image">
                    <img src="gallery_icon.png" />
                </label>
                <img onClick={sendMessage} src="send_button.png" />
            </div>
        </div>

    )
        : <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
            <img src="logo.png" />
            <p>chat anytime, anywhere</p>
        </div>
}

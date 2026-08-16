import { useContext, useEffect, useState } from 'react'
import { logOut } from '../../config/firebase'
import './RightSidebar.css'
import { AppContext } from '../../context/AppContext'

export const RightSidebar = () => {

    const {chatUser, messages} = useContext(AppContext);
    const [msgImages, setMsgImages] = useState([]);

    useEffect(() => {
        let tempVar = [];
        messages.map((msg) => {
            if(msg.image){
                tempVar.push(msg.image);
            }
        })
        setMsgImages(tempVar);
    },[messages])
    return chatUser ? (
        <div className="rightSidebar">
            <div className="rightSidebar-profile">
                <img src={chatUser.userData.avatar || "profile-img.png"} />
                <h3>{chatUser.userData.name}{Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src="green_dot.png" className='dot' /> : null}</h3>
                <p>{chatUser.userData.bio}</p>
            </div>

            <hr />

            <div className='rightSidebar-media'>
                <h2>media</h2>
                <div>
                    {msgImages.map((url, index) => (<img key={index} onClick={() => window.open(url)} src={url} />))}
                    <img src="pic1.png" />
                    <img src="pic2.png" />
                    <img src="pic3.png" />
                    <img src="pic1.png" />
                    <img src="pic2.png" />
                    <img src="pic3.png" />
                </div>

            </div>
                <button onClick={() => logOut()}>Logout</button>
        </div>
    )
    : (
        <div className="rightSidebar">
            <button onClick={() => logOut()}>Logout</button>
        </div>
    )
}
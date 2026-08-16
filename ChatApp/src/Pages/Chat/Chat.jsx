import { useContext, useEffect, useState } from 'react'
import { Chatbox } from '../../components/Chatbox/Chatbox'
import { LeftSidebar } from '../../components/LeftSidebar/LeftSidebar'
import { RightSidebar } from '../../components/RightSidebar/RightSidebar'
import './Chat.css'
import { AppContext } from '../../context/AppContext'

export const Chat = () => {

    const { chatData, userData } = useContext(AppContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(chatData && userData){
            setLoading(false);
        }
    },[chatData, userData])
    return (
        <div className="chat">
            {
                loading
                    ? <p className='loading'>Loading...</p>
                    : <div className="chat-container">
                        <LeftSidebar />
                        <Chatbox />
                        <RightSidebar />
                    </div>
            }
        </div>
    )
}
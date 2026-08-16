import { useState } from 'react'
import './Login.css'
import { signup, login, resetPassword } from '../../config/firebase';
export const Login = () => {
    const [userName, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [curState, setCurState] = useState("Sign Up");

    const handleFormSubmit = (event) => {
        event.preventDefault();
        if(curState === "Sign Up"){
            signup(userName, email, password);
        }else{
            login(email, password)
        }
    }
    return(
        <div className="login">
            <img src="./logo.png" alt="logo" className='logo-img' />

            <form onSubmit={handleFormSubmit} className="login-form">
                <h2>{curState}</h2>
                {
                    curState === "Sign Up" ? <input onChange={(e) => setUserName(e.target.value)}
                     value={userName} type="text" placeholder='Full Name' className="form-input" required />
                    : null
                }
                <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder='Email Id' className="form-input" required />
                <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder='Password' className="form-input" required />
                <button type='submit'>{curState === "Sign Up" ? "Create account" : "Login"}</button>
                <div className="login-term">
                    <input type="checkbox" />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>
                <div className="login-forgot">
                    {
                        curState === "Sign Up" ? <p className="login-toggle">already have an account 
                        <span onClick={() => setCurState("Login")}>Login</span></p>
                        : <p className="login-toggle">Create new account <span onClick={() => setCurState("Sign Up")}>click here</span></p>
                    }
                    {curState === "Login" ? <p className="login-toggle">Forgot Password<span onClick={() => resetPassword(email)}>Reset here</span></p> : null}
                </div>
            </form>
        </div>
    )
}
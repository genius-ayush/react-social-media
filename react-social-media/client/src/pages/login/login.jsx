import './login.css'
import {useState, useEffect, useContext, useRef} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Context } from '../../contextapi/Context'
import Button from 'react-bootstrap/Button';



export default function Login(){
const navigate = useNavigate()

const {fetchUser} = useContext(Context)

const username = useRef()
const password = useRef()

//login method which sends user credentials to login route
const LoginUser = async function(userCredentials){
    try{
        await axios({
            method: "POST",
            data:userCredentials,
            withCredentials: true,
            url:'/users/api/login'
            //if response is successful, updates user stored in context, and fetches the user from context
        }).then(res=>{
            fetchUser()
            navigate('/')
        })
    }catch(err){
        alert(err)
    }
}

//submit the login request on button click
const handleSubmit = (e)=>{
    e.preventDefault()
    let userCredentials = {
        username: username.current.value,
        password: password.current.value
    }
    LoginUser(userCredentials)
}
    return(
        <div className="login-container">
            <div className="login-wrapper">
                <div className="login-header">
                    <h3 className="slogan">Radsocial</h3>
                    <span className="slogancaption">Connect with friends and family</span>
                </div>
                <div className="login-form">
                    <div className="login-form-wrapper">
                        <input type="username" className='form-item email' ref={username} placeholder='enter your username' />
                        <input type="password" className='form-item password' ref={password} placeholder='enter your password' />
                        <Button className='loginbutton' variant='primary'  onClick={handleSubmit} >Login</Button>
                        <span className='forgot'>forgot your password?</span>
                        <Button className='loginbutton' variant='success'  href='/register' >Register</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
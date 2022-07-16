import './register.css'
import {useRef} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import Button from 'react-bootstrap/Button';


export default function Register(){
    const name = useRef()
    const username = useRef()
    const password = useRef()
    const email = useRef()
    const navigate = useNavigate()

    //function to create a user then redirect to login, otherwise logs error. 
    //if there isnt an error in mongoose when creating user, createuser controller will send 200 status and page will navigate to login,
    //if post register route sends 400 status however due to mongoose error, error will be logged. 
    const handleSubmit = async function(e){
        e.preventDefault()
        try{
            //will go through if backend sends status of 200
            await axios.post('/users/api/register', {
                email: email.current.value,
                username: username.current.value,
                password: password.current.value,
              //must include res, since register controller will return either success or failure, which will trigger either error or success  
              }).then((res)=>{
                    navigate('/login')
              })
            //any status code other than 200 will trigger error
            }catch(err){
                alert('that email and/or username has been taken')
            }
    }
    return(
        <div className="register-container">
            <div className="register-wrapper">
                <div className="register-header">
                    <h3 className="slogan">Radsocial</h3>
                    <span className="slogancaption">Connect with friends and family</span>
                </div>
                <div className="register-form">
                    <div className="register-form-wrapper">
                        <input type="text" ref={name} className="form-item name" placeholder='enter your name' />
                        <input type="email" ref={email} className='form-item email' placeholder='email' />
                        <input type="text" ref={username} className='form-item name' placeholder='enter your username' />
                        <input type="password" ref={password} className='form-item password' placeholder='enter your password' />
                        <Button className='registerbutton' variant='success' onClick={handleSubmit}>Sign Up</Button>
                        <hr className='separator'></hr>
                        <Link to='/login'>Already have an account?</Link>   
                    </div>
                </div>
            </div>
        </div>
    )
}
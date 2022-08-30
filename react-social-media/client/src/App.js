import './App.css';
import Home from './pages/home/home';
import Profile from './pages/profile/profile';
import Login from './pages/login/login';
import Register from './pages/register/register';
import {
  Routes,
  Route,
  BrowserRouter
} from "react-router-dom";
import Message from './pages/messages/messages'
import { Context } from './contextapi/Context';
import { useContext, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  //checks if theres a user in session, then stores it in context. Empty array so its renders donly once
  const {currentUser, fetchUser} = useContext(Context) //grabs the state from context
  
  //-------updates the current user in context every time route is switched, or page is refreshed.---------
  //that way, current user doesnt need to be refreshed unecessarily.
  //thats cause app component always has to be mounted on refresh or route change

  useEffect(()=>{
    fetchUser()
  },[])

  
  //---------------------------------------------------------------
 
    return (
      <div className="App">
          <Routes>
            <Route exact path='/login' element={<Login/> }/>
            <Route exact path='/register' element={ <Register/> }/>
            <Route exact path='/profile/:id' element={<Profile/>}/>
            <Route exact path="/" element={currentUser ? <Home /> : <Login/>}/>
            <Route exact path='/messages' element={ <Message/> }/>          
          </Routes>
      </div>
  );
}

export default App;

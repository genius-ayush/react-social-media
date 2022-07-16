import '../../components/feed/feed'
import Feed from '../../components/feed/feed'
import '../../components/left-sidebar/left-sidebar'
import Leftsidebar from '../../components/left-sidebar/left-sidebar'
import '../../components/rightbar/rightbar'
import Rightbar from '../../components/rightbar/rightbar'
import './home.css'
import Topbar from '../../components/topbar/topbar'
import { useContext, useEffect } from 'react'
import { Context } from '../../contextapi/Context'
import Timeline from '../../components/timeline/timeline'


export default function Home(){ //passing userId and user from app component    
    return(
        <div className="home-container">
            <Topbar />
            <div className="content">
                <Leftsidebar />
                <Timeline/>
                <Rightbar />
            </div>
        </div>
    )
}
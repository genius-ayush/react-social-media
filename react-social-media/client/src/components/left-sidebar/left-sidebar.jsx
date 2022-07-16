import './left-sidebar.css'
import {
    RssFeed,
    Chat,
    PlayCircleFilledOutlined,
    Group,
    Bookmark,
    HelpOutline,
    WorkOutline,
    Event,
    School,
  } from "@material-ui/icons";
  import Recentfriends from '../recentfriends/recentfriends';
  import { useContext, useEffect } from 'react'
  import { Context } from '../../contextapi/Context';


export default function Leftsidebar(){

   const {currentUser} = useContext(Context)
   
    return (
         <div className='Leftsidebar-container'>
            <div className="leftsidebar-wrapper">
            <ul className="sidebar-items">
                 <li className="sidebar-item">
                    <RssFeed className='sidebar-icon' />
                    <span className="sidebar-item-text">Feed</span>
                 </li>
                 <li className="sidebar-item">
                    <Chat className='sidebar-icon' />
                    <span className="sidebar-item-text">Messenger</span>
                 </li>
                 <li className="sidebar-item">
                    <PlayCircleFilledOutlined className='sidebar-icon' />
                    <span className="sidebar-item-text">Videos</span>
                 </li>
                 <li className="sidebar-item">
                    <Group className='sidebar-icon' />
                    <span className="sidebar-item-text">Groups</span>
                 </li>
                 <li className="sidebar-item">
                    <Bookmark className='sidebar-icon'/>
                    <span className="sidebar-item-text">Bookmarks</span>
                 </li>
                 <li className="sidebar-item">
                    <HelpOutline className='sidebar-icon' />
                    <span className="sidebar-item-text">Help</span>
                 </li>
                 <li className="sidebar-item">
                    <WorkOutline className='sidebar-icon' />
                    <span className="sidebar-item-text">Jobs</span>
                 </li>
                 <li className="sidebar-item">
                    <Event className='sidebar-icon' />
                    <span className="sidebar-item-text">Events</span>
                 </li>
                 <li className="sidebar-item">
                    <School className='sidebar-icon' />
                    <span className="sidebar-item-text">Courses</span>
                 </li>
                 <button className="showmore">Show More</button>
             </ul>
             <hr className='hr'/>
             <ul className="friendlist"> 
               {currentUser.followerCount && currentUser.followerCount.map(e=>(
                  currentUser.followingCount.includes(e) && <Recentfriends key={e} id={e}/>
               ))}
             </ul>
         </div>
            </div>
    );
}





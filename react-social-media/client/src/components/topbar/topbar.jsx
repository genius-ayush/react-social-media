import './topbar.css'
import { Person, Search, Notifications, Chat } from '@material-ui/icons'
import { Context } from '../../contextapi/Context'
import { useEffect, useContext} from 'react'
import { Link, useNavigate } from 'react-router-dom'


export default function Topbar(){
    const {currentUser} = useContext(Context) //grabs the state from context
    let navigate = useNavigate()
    const user = currentUser

    const pub = process.env.REACT_APP_PUBLIC
    return(
        <div className='Topbar-container'>
            <div className="Topbar-left">
                <Link to='/' style={{textDecoration:'none'}}>
                <span className="logo">RadSocial</span>
            </Link>
        </div><div className="Topbar-center">
                <Search className='search-icon' />
                <input type="text" placeholder='search for a friend, post, or video' className='search-input' />            </div><div className="Topbar-right">
                <div className="topbar-links">
                    <span className="topbar-link-item">Homepage</span>
                    <span className="topbar-link-item">Timeline</span>
                </div>
                <div className="topbar-icons">
                    <div className="topbar-icon-item">
                        <Person />
                        <span className="topbar-link-item-notification">1</span>
                    </div>
                    <div className="topbar-icon-item">
                        <Chat />
                        <span className="topbar-link-item-notification">2</span>
                    </div>
                    <div className="topbar-icon-item">
                        <Notifications />
                        <span className="topbar-link-item-notification">3</span>
                    </div>
                </div>
                <a href={`/profile/${user._id}`}>
                    <div className="profile-pic">
                        {user.profilePicture ?
                            (<img src={user.profilePicture} alt="" className="topbar-profileImg" />) :
                            (<img src='/assets/profile.png' alt="" className="topbar-profileImg" />)}
                    </div>
                </a>
                <a className='logoutbutton' href='/users/api/logout'>Logout</a>
            </div>
        </div>
    )
}
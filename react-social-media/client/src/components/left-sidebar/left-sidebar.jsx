import './left-sidebar.css'
  import { Person, Search, Chat } from '@material-ui/icons'
  import Recentfriends from '../../components/recentfriends/recentfriends'
  import { useState, useContext } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { Context } from '../../contextapi/Context';
  import axios from 'axios'
  import Button from 'react-bootstrap/esm/Button'


export default function Leftsidebar({ profile }){

   const {currentUser} = useContext(Context)

   const navigate = useNavigate()
   
   const [search, setSearch] = useState('')


   //follow and unfollow requests
      const follow = async function(){
         await axios.put(`/users/api/${profile.id}/follow`).then(res=>{window.location.reload()}) //rerender entire page when request completes
     }
     const unfollow = async function(){
         await axios.put(`/users/api/${profile.id}/unfollow`).then(res=>{window.location.reload()})
     }


       //search profile of a person
       const handleSearch = async function(){
           await axios.get(`/users/api/username/${search}`).then(res=>{
               if(res.data.username){
                   navigate(`/profile/${res.data._id}`)
                   window.location.reload()
               }else{
                   alert('user not found')
               }
           })
       }
   
    return (
      <div className="leftbar-container">
                  <div className="item search">
                                 <div className="search-button" style={{cursor:"pointer"}} onClick={handleSearch}>
                                    <Search className='search-icon' />
                                 </div>
                                 <input type="text" value={search} style={{border:"1px solid #dcdcdc",padding:'5px'}} onChange={(e)=>{setSearch(e.target.value)}} placeholder='search...' className='search-input' />
                              </div>
                        <div className='links'>
                              <div className='item linkitem'>
                                 <a className='link' href='/messages'>
                                    <Chat className='leftbar-icon' style={{'height': '40px','width':'40px', 'color':'#0e6efc', marginRight:'20px'}} />
                                    <span className="menu-item" href="/messages">Messenger</span>
                                 </a>
                              </div>
                              <div className='item linkitem'>
                                 <a className='link' href={`/profile/${currentUser?._id}`}>
                                    <Person className='leftbar-icon' style={{'height': '40px','width':'40px', 'color':'#0e6efc', marginRight:'20px'}} />
                                    <span className="menu-item" href="/messages">Profile Page</span>
                                 </a>
                              </div>
                              {/*follow/unfollow buttons */}
                              {/* nested ternary, first checks to see if you are viewing your profile, since you cant follow yourself, it will render no button */}
                              {/*first checks if currentuser is loaded into state (after first render cycle), then checks if the user is followed or not, conditionally rendering the buttons */}
                              {currentUser && profile && currentUser._id !== profile.id ? 
                                 (currentUser && !currentUser.followingCount.includes(profile.id) ? 
                                    (<Button style={{width:'100%', marginTop:'30px'}} className='followbutton'  variant='primary' onClick={follow}>follow</Button>)
                                    : 
                                    (<Button style={{width:'100%', marginTop:'30px'}} className='followbutton' variant='primary'  onClick={unfollow}>unfollow</Button>)
                                 ) 
                                 : 
                                 ('')
                              }
                        </div>
                        <div className='friends'>
                              <span className='title'>Friends List</span>
                              <hr className='separator'/>
                              <ul className="friendslist"> 
                              {currentUser.followerCount && currentUser.followerCount.map(e=>(
                                 currentUser.followingCount.includes(e) && <Recentfriends key={e} id={e}/>
                              ))}
                              </ul>
                        </div>
                     </div>
    );
}





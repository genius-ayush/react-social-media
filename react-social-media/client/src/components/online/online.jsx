import './online.css'
export default function Online({friend}){

    return(
        <div>
                <li className='onlineitem'>
                    <span className='status'></span>
                    <img className='profile' src={`/assets${friend.img}`} alt="" />
                    <span className='username'>{friend.username}</span>
                </li>
        </div>
    )

}
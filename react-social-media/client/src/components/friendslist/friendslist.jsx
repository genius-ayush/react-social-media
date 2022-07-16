import './friendslist.css'

export default function Friendslist( {friend} ){
    return (
        <div className='friendslistcontainer'>
            <div className="friendslistwrapper">
                <img className='friendimg' src={`/assets${friend.img}`} alt="" />
                <p>{friend.username}</p>
            </div>
        </div>
    )
}
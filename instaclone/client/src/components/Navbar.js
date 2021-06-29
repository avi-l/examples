import React, { useContext, useRef, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { UserContext } from '../App'
import M from 'materialize-css'
const NavBar = () => {
    const history = useHistory()
    const [search, setSearch] = useState("")
    const [userDetails, setUserDetails] = useState([])
    const { state, dispatch } = useContext(UserContext)
    const searchModal = useRef(null)
    useEffect(() => {
        M.Modal.init(searchModal.current)
    }, [])
    const renderList = () => {
        if (state) {
            console.log(`STATESTATE: ${JSON.stringify(state)}`)
            return [

                <div className="nav-icons">
                    <li key="1"><i className="large material-icons modal-trigger" data-target="modal1">search</i></li>
                    <li key="2"><Link to="/profile"><img src={state?.profilepic} alt="" /></Link></li>,
                <li key="3"><Link to="/friendsposts"><i className="material-icons">group</i></Link></li>,
                <li key="4"><Link to="/createpost"><i className="material-icons">add_a_photo</i></Link></li>
                    <li>

                        <button className="btn waves-effect waves-light #64b5f6 red lighten-3"
                            onClick={() => {
                                localStorage.clear()
                                dispatch({ type: "CLEAR" })
                                history.push('/signin')
                            }}
                        >
                            Logout
                </button>
                    </li>
                </div>


            ]
        }
        else {
            return [
                <li key="5"><Link to="/signin">Signin</Link></li>,
                <li key="6"><Link to="/signup">Signup</Link></li>
            ]
        }
    }
    const fetchUsers = (query) => {
        setSearch(query)
        fetch('/search-users', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query
            })
        })
            .then(res => res.json())
            .then(results => {
                console.log(results)
                setUserDetails(results.user)
            })
    }
    return (
        <nav>
            <div className="nav-wrapper white" >
                <Link key="7" to={state ? "/" : "/signin"} className="brand-logo left">Instasham</Link>
                <ul key="8" id="nav-mobile" className="right">
                    {renderList()}
                </ul>
            </div>
            <div id="modal1" className="modal" ref={searchModal}>
                <div className="modal-content">
                    <input
                        type="text"
                        placeholder="search users"
                        value={search}
                        onChange={(e) => fetchUsers(e.target.value)}
                    />
                    <ul className="collection">
                        {userDetails?.map(item => {
                            console.log(`ITEM: ${item._id} state: ${state._id}`)
                            return (
                                <>
                                <Link key={item._id} to={item._id !== state._id ? "/profile/" + item?._id : "/profile"}
                                    onClick={() => {
                                        M.Modal.getInstance(searchModal.current).close()
                                        setSearch('')
                                        setUserDetails([])
                             }} >
                                    <li className="collection-item avatar">
                                        <img src={item?.profilepic} alt="" className="circle" />
                                        {item?.name}
                                        </li>
                                </Link>
                              </>
                            )
                        })}
                    </ul>

                </div>
                <div className="modal-footer">
                    <button className="modal-close waves-effect waves-green btn-flat" onClick={() => setSearch('')}>Close</button>
                </div>
            </div>
        </nav >

    )

}
export default NavBar;
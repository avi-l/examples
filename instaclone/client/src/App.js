import React, {useEffect,createContext,useReducer,useContext} from 'react';
import NavBar from './components/Navbar'
import './App.css'
import { BrowserRouter, Route, Switch ,useHistory} from 'react-router-dom'
import Home from './components/screens/Home';
import Signin from './components/screens/Signin';
import Profile from './components/screens/Profile';
import Signup from './components/screens/Signup';
import CreatePost from './components/screens/CreatePost';
import UserProfile from './components/screens/UserProfile';
import {reducer,initialState} from './reducers/useReducer'
import SubscribeUserPosts from './components/screens/SubscribeUserPosts';
import UploadProfilePic from './components/screens/UploadProfilePic';

export const UserContext = createContext()

const Routing = () =>{
  const history = useHistory()
  const {state,dispatch} = useContext(UserContext)
  useEffect(()=>{
      const user = JSON.parse(localStorage.getItem("user"))

      if(user){
        dispatch({type:"USER",payload:user})
      }
      else{
        history.push('/signin')
      }
  },[])
  return (
    <Switch>
      <Route exact path="/" component={Home}/>
      <Route exact path="/signin" component={Signin}/>
      <Route exact path="/profile" component={Profile}/>
      <Route exact path="/profile/:userid" component={UserProfile}/>
      <Route exact path="/signup" component={Signup}/>
      <Route exact path="/createpost" component={CreatePost}/>
      <Route exact path="/friendsposts" component={SubscribeUserPosts}/>
      <Route exact path="/profilepic" component={UploadProfilePic}/>
    </Switch>
  )
}
function App() {
  const [state,dispatch] = useReducer(reducer,initialState)
  return (
    <UserContext.Provider value={{state,dispatch}}>
    <BrowserRouter>
      <NavBar />
      <Routing />
    </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;

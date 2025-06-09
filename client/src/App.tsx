import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Game from './Game'
import Menu from './pages/menu'
import { io } from 'socket.io-client'
function App() {
  const [count, setCount] = useState(0)
  const socket = io("https://frog-wars.onrender.com")
  
  return (
    <>
    <Menu socket={socket}/>
    {/* <Game/> */}
    </>
  )
}


export default App

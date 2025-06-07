import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Game from './Game'
import Menu from './pages/menu'
import { io } from 'socket.io-client'
function App() {
  const [count, setCount] = useState(0)
  const socket = io("http://localhost:5000")
  
  return (
    <>
    <Menu socket={socket}/>
    {/* <Game/> */}
    </>
  )
}

export default App

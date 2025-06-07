import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Game from './Game'
import Menu from './pages/menu'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Menu/>
    {/* <Game/> */}
    </>
  )
}

export default App

import { Button } from '@/components/ui/button';
import Game from '@/Game';
import type { IGameProps } from '@/types';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
interface IMenuProps {
  socket: Socket;
}
const Menu: React.FunctionComponent<IMenuProps> = ({socket}) => {
  const [gameId, setGameId] = useState("");
    const [gameCodeInput, setGameCodeInput] = useState("");
    const [gameProps, setGameProps] = useState<IGameProps | null>(null);
    const handleRandom = () => {
    }
    useEffect(() => {
      const onGameStart = (props: IGameProps) => {
          setGameProps(props);
      }
      socket.on("gameStart", (props) => onGameStart(props))
      return () => {socket.off("gameStart", onGameStart)};
    })
    const joinQueue = () => {
      socket.emit("joinQueue");
    }
  return (
    <>
    <div>
        {/* <input type="text" value={gameCodeInput} placeholder='Enter a rooom Code' onChange={(e) => setGameCodeInput(e.target.value)}/>
        <Button onClick={handleSubmit}>Submit</Button>
        <Button onClick={handleRandomGenerate}>Generate room Code</Button> */}
        {gameProps ? <Game gameId={gameProps.gameId} opponent={gameProps.opponent} socket={socket}/> :
        <Button onClick={joinQueue}>Shadow pair</Button>
        }

    </div>
    </>
  );
};

export default Menu;

import kaboom from 'kaboom';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
interface IGameProps {
}

const Game: React.FunctionComponent<IGameProps> = (props) => {
    let GameCanvas = useRef<HTMLCanvasElement | null>(null);
    useEffect(()=>{
        if(GameCanvas.current){
            // start the game
        const {rotate, debug, Color, center, vec2, onUpdate, rgb, anchor, outline, width, height, rect, scale, add, sprite, pos, area, body, onKeyPress, loadSprite, loadBean, setGravity } = kaboom({
            global: false,
            canvas: GameCanvas.current,
            width: window.innerWidth,
            height: window.innerHeight,
            scale: 1,
            background: [0, 0, 255],
        });    
        setGravity(1600)
        loadSprite("greenIdle","/public/GreenBlue/ToxicFrogGreenBlue_Idle.png", {
            sliceX: 8,
            sliceY: 1,
            anims: {
                idle:{
                    from: 0,
                    to: 7,
                    speed: 15,
                    loop: true,
                    
                }
            }
        })
        loadSprite("purpleIdle","/public/PurpleBlue/ToxicFrogPurpleBlue_Idle.png", {
            sliceX: 8,
            sliceY: 1,
            anims: {
                idle:{
                    from: 0,
                    to: 7,
                    speed: 15,
                    loop: true,
                    
                }
            }
        })
        const greenFrog = add([
            sprite("greenIdle", {frame: 0}),
            pos(100,height()-250),
            scale(2),
            area(),
            body(),
        ])
        greenFrog.play("idle");
        const purpleFrog = add([
            sprite("purpleIdle", {frame: 0}),
            pos(width()-100,height()-250),
            scale(2),
            area(),
            body(),
        ])
        purpleFrog.play("idle");
        purpleFrog.flipX = true;
        const tempGround = add([
            rect(width(),3),
            pos(0,height()-100),
            area(), 
            body({isStatic: true}),
            outline(2)
        ])

        onKeyPress("space", () => {
            greenFrog.jump();
        })
        greenFrog.onGround(()=>{
            debug.log("ouch");
        })
        }
    },[])
  return <canvas ref={GameCanvas}/>;
};

export default Game;

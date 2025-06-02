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
            const k = kaboom({
            global: false,
            canvas: GameCanvas.current,
            width: window.innerWidth,
            height: window.innerHeight,
            scale: 1,
            background: [0, 0, 255],
        });    
        const {z,destroy, onKeyDown, rotate, Color, center, vec2, onUpdate, rgb, anchor, outline, width, height, rect, scale, add, sprite, pos, area, body, onKeyPress, loadSprite, loadBean, setGravity } = k;
        const tempGround = add([
            rect(width(),48),
            pos(0,height()-100),
            area(), 
            body({isStatic: true}),
            outline(10)
        ])
        loadSprite("tongue_start","/public/tongue/tongue_start.png");
        loadSprite("tongue_middle","/public/tongue/tongue_middle.png");
        loadSprite("tongue_end","/public/tongue/tongue_end.png");
        const tongueComp = (start: {x:number, y:number}) => {
            return({
                id: "tongue",
                require: [],
                segments: [],
                length: 0,
                update(){
                    for(let s of this.segments){
                        destroy(s);
                    }
                    this.segments = [];
                    add([
                        sprite("tongue_start"),
                        pos(start.x,start.y),
                        z(10)
                    ])
                    const middleTileLength = 32;
                    const startTileLength = 10;
                    let numberOfTiles = Math.ceil(this.length/middleTileLength);
                    let tilePos = start.x;
                    for(let i = 1; i <= numberOfTiles; i++){
                        add([
                            sprite("tongue_middle"),
                            pos(start.x+ i*middleTileLength,start.y),
                            z(10)
                        ])
                        tilePos = start.x+ i*middleTileLength;
                    }
                    add([
                        sprite("tongue_end"),
                        pos(tilePos + middleTileLength,start.y),
                        z(10)
                    ])
                }
            })
        }
        
        setGravity(1600)
        // Frog animations
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
        // Frog initialization
        const greenFrog = add([
            sprite("greenIdle", {frame: 0}),
            pos(100,height()-400),
            scale(5),
            area(),
            body(),
        ])
        greenFrog.play("idle");
        const purpleFrog = add([
            sprite("purpleIdle", {frame: 0}),
            pos(width()-400,height()-400),
            scale(5),
            area(),
            body(),
        ])
        purpleFrog.play("idle");
        purpleFrog.flipX = true;
        const SPEED = 500;
        let start_x = greenFrog.pos.x;
        let start_y = greenFrog.pos.y;
        const tongue = add([
            tongueComp({x: start_x, y: start_y}),
        ])
        tongue.length = 500;
        onKeyDown("a", () => {
            greenFrog.move(-SPEED, 0);
            greenFrog.flipX = true;
        })
        onKeyDown("d", () => {
            greenFrog.move(SPEED, 0);
            greenFrog.flipX = false;
        })
        // onKeyPress("t", () => {

        // })
        // onChange((e)=>{

        // })
        // k.debug.inspect = true;
        onKeyPress("space", () => {
            if(greenFrog.isGrounded()){
                greenFrog.jump();
            }
        })
        greenFrog.onGround(()=>{
            k.debug.log("ouch");
        })
        }   
    },[])
  return <canvas ref={GameCanvas}/>;
};

export default Game;

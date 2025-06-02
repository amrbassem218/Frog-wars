import kaboom, { type GameObj } from 'kaboom';
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
            debug: true,
        });    
        const {wait, dt, z,destroy, onKeyDown, rotate, Color, center, vec2, onUpdate, rgb, anchor, outline, width, height, rect, scale, add, sprite, pos, area, body, onKeyPress, loadSprite, loadBean, setGravity } = k;
        const tempGround = add([
            rect(width(),48),
            pos(0,height()-200),
            area(), 
            body({isStatic: true}),
            outline(10)
        ])
        loadSprite("tongue_start","/public/tongue/tongue_start.png");
        loadSprite("tongue_middle","/public/tongue/tongue_middle.png");
        loadSprite("tongue_end","/public/tongue/tongue_end.png");
        
        setGravity(1600)
        // Frog animations
        // loadSprite("greenIdle","/public/GreenBlue/ToxicFrogGreenBlue_Idle.png", {
        //     sliceX: 8,
        //     sliceY: 1,
        //     anims: {
        //         idle:{
        //             from: 0,
        //             to: 7,
        //             speed: 15,
        //             loop: true,
                    
        //         }
        //     }
        // })
        loadSprite("greenSheet","/public/GreenBlue/ToxicFrogGreenBlue_Sheet.png", {
            sliceX: 9,
            sliceY: 5,
            anims: {
                tongueExtend:{
                    from: 18,
                    to: 23,
                    speed: 15,
                    loop: false,
                },
                idle:{
                    from: 0,
                    to: 7,
                    speed: 15,
                    loop: true,
                    
                },
            }
        })
        loadSprite("purpleIdle","/public/PurpleBlue/ToxicFrogPurpleBlue_Idle.png", {
            sliceX: 8,
            sliceY: 1,
            // frameWidth: 32,
            // frameHeight: 32,
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
            sprite("greenSheet", {frame: 0}),
            pos(100,height()-400),
            scale(5),
            area(),
            body(),
            anchor("top"),
            // z(50)
        ])
        greenFrog.play("idle");
        const purpleFrog = add([
            sprite("purpleIdle", {frame: 0}),
            pos(width()-400,height()-400),
            scale(5),
            area(),
            body(),
            anchor("top")
        ])

        purpleFrog.play("idle");
        purpleFrog.flipX = true;
        const SPEED = 500;
        let start_x = greenFrog.pos.x;
        let start_y = greenFrog.pos.y;
        const tongueComp = () => {
            return({
                id: "tongue",
                require: [],
                segments: [] as GameObj[],
                length: 0,
                visibleLength: 0,
                isExtending: false,
                isRetracting: false,
                speed: 5000,
                extended: false,
                start(){
                    let dir = (greenFrog.flipX ? -1 : 1);
                    let startx = (dir == 1) ? greenFrog.pos.x+(27) : greenFrog.pos.x - 60;
                    let starty = greenFrog.pos.y+95;
                    for(let s of this.segments){
                        destroy(s);
                    }
                    this.segments = [];
                    let start =  add([
                        sprite("tongue_start"),
                        pos(startx,starty),
                        z(10),
                    ]);
                    start.flipX = greenFrog.flipX;
                    this.segments.push(start);
                    const middleTileLength = 32;
                    const endTileLength = 64;
                    let numberOfTiles = Math.floor((this.length-endTileLength)/middleTileLength);
                    let tilePos = startx;
                    for(let i = 1; i <= numberOfTiles; i++){
                        let mid = add([
                            sprite("tongue_middle"),
                            pos(startx+ i*middleTileLength * dir,starty),
                            z(10)
                        ]);
                        mid.flipX = greenFrog.flipX;
                        this.segments.push(mid);
                        tilePos = startx+ i*middleTileLength * dir;
                    }
                    let end = add([
                        sprite("tongue_end"),
                        pos((dir == 1) ? (tilePos + middleTileLength) : (tilePos - middleTileLength),starty),
                    ])
                    end.flipX = greenFrog.flipX;
                    this.segments.push(end);
                    this.segments.forEach(e=>e.hidden = true)
                },
                update(){
                    this.start();
                    let showedLength = 0;
                    const segLength = 36;
                    this.segments.forEach((seg, i) => {
                        if(showedLength < this.visibleLength){
                            showedLength = i*segLength;
                            seg.hidden = false;
                        }
                    })
                    if(this.isExtending && this.visibleLength < this.length){
                        this.visibleLength += this.speed * dt();
                        if(this.visibleLength >= this.length){
                            this.visibleLength = this.length;
                            this.isExtending = false;
                        }
                    }
                    if(this.isRetracting && this.visibleLength > 0){
                        this.visibleLength -= this.speed * dt();
                        if(this.visibleLength <= 0){
                            this.visibleLength = 0;
                            this.isRetracting = false;
                        }
                    }
                },
                extend(){
                    this.isExtending = true;
                    this.isRetracting = false;
                    this.extended = true;
                },
                retract(){
                    this.isExtending = false;
                    this.isRetracting = true;
                    this.extended = false;
                },
            })
        }
        
        const tongue = add([
            tongueComp(),
        ])
        tongue.length = 500;
        tongue.start();
        k.debug.fps();
        // hotkeys
        onKeyDown("a", () => {
            greenFrog.move(-SPEED, 0);
            greenFrog.flipX = true;
        })
        // greenFrog.play("tongueExtend");
        onKeyDown("t", () => {
            if(!tongue.extended){
                greenFrog.play("tongueExtend");
                wait(0.3,() => {
                    tongue.extend();
                })
            }
            else{
                greenFrog.play("tongueExtend");
                wait(0.3,() => {
                    tongue.retract();
                })
                wait(0.5,() => {
                    // tongue.retract();
                    greenFrog.play("idle");
                })

            }
        })
        onKeyDown("d", () => {
            greenFrog.move(SPEED, 0);
            greenFrog.flipX = false;
        })
        onKeyPress("space", () => {
            if(greenFrog.isGrounded()){
                greenFrog.stop();
                greenFrog.frame = 0;
                greenFrog.jump();
            }
        })
        greenFrog.onGround(()=>{
            greenFrog.play("idle");
            k.debug.log("ouch");
        })
        }   
    },[])
  return <canvas ref={GameCanvas}/>;
};

export default Game;

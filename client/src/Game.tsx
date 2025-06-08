import kaboom, {type GameObj } from 'kaboom';
import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { IGameProps, IPlyaerProps } from './types';

const Game: React.FunctionComponent<IGameProps> = ({gameId, opponent, socket}) => {
    let GameCanvas = useRef<HTMLCanvasElement | null>(null);
    const [playerProps, setPlayerProps] = useState<IPlyaerProps | null>(null);
    useEffect(()=>{
        socket.on("message", (message) => {
            console.log(message)
        })
        socket.emit("message",`hey ${opponent} we're in ${gameId}`);
        if(GameCanvas.current){
        const k = kaboom({
            global: false,
            canvas: GameCanvas.current,
            width: window.innerWidth,
            height: window.innerHeight,
            scale: 1,
            background: [0, 0, 255],
            debug: true,
        });    
        const {onCollide, wait, dt, z,destroy, onKeyDown, rotate, Color, center, vec2, onUpdate, rgb, anchor, outline, width, height, rect, scale, add, sprite, pos, area, body, onKeyPress, loadSprite, loadBean, setGravity } = k;
        
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
        loadSprite("greenSheet","/GreenBlue/ToxicFrogGreenBlue_Sheet.png", {
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
        loadSprite("purpleSheet","/PurpleBlue/ToxicFrogPurpleBlue_Sheet.png", {
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
        // Frog initialization
        const greenFrog = add([
            sprite("greenSheet", {frame: 0}),
            pos(100,height()-400),
            scale(5),
            area(),
            body(),
            anchor("top"),
            {
                name: "greenFrog",
                isBreaking: false
            },
            "greenFrog"
        ])
        greenFrog.play("idle");
        const purpleFrog = add([
            sprite("purpleSheet", {frame: 0}),
            pos(width()-400,height()-400),
            scale(5),
            area(),
            body(),
            anchor("top"),
            {
                name: "purpleFrog",
                isBreaking: false
            },
            "purpleFrog",
        ])
        
        purpleFrog.play("idle");
        purpleFrog.flipX = true;
        const SPEED = 500;
        let collisionFlag = false;
        const tongueComp = (targetFrog: GameObj) => {
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
                isColliding: false,
                start(){
                    let dir = (targetFrog.flipX ? -1 : 1);
                    let startx = (dir == 1) ? targetFrog.pos.x+(27) : targetFrog.pos.x - 60;
                    let starty = targetFrog.pos.y+95;
                    for(let s of this.segments){
                        destroy(s);
                    }
                    this.segments = [];
                    this.isColliding = false;
                    let start =  add([
                        sprite("tongue_start"),
                        pos(startx,starty),
                        z(10),
                        area(),
                        `tongue_part_${targetFrog.name}`
                    ]);
                    start.flipX = targetFrog.flipX;
                    this.segments.push(start);
                    const middleTileLength = 32;
                    const endTileLength = 64;
                    let numberOfTiles = Math.floor((this.length-endTileLength)/middleTileLength);
                    let tilePos = startx;
                    for(let i = 1; i <= numberOfTiles; i++){
                        let mid = add([
                            sprite("tongue_middle"),
                            pos(startx+ i*middleTileLength * dir,starty),
                            z(10),
                            area(),
                        `tongue_part_${targetFrog.name}`
                        ]);
                        mid.flipX = targetFrog.flipX;
                        this.segments.push(mid);
                        tilePos = startx+ i*middleTileLength * dir;
                    }
                    let end = add([
                        sprite("tongue_end"),
                        pos((dir == 1) ? (tilePos + middleTileLength) : (tilePos - middleTileLength),starty),
                        area(),
                        `tongue_part_${targetFrog.name}`
                    ])
                    end.flipX = targetFrog.flipX;
                    this.segments.push(end);
                    if(!collisionFlag && this.extended){
                        collisionFlag = true;
                        let cancel = onCollide(`tongue_part_${targetFrog.name}`, (targetFrog.name === "purpleFrog" ? "greenFrog" : "purpleFrog"), () => {
                            this.isColliding = true;
                            console.log(this.isColliding);
                            if(!this.extended){
                                cancel.cancel();
                                collisionFlag = false;
                                this.isColliding = false;
                            }
                        })
                    }
                    this.segments.forEach(e =>{
                        e.hidden = true;
                    })
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
        
        const greenFrogTongue = add([
            tongueComp(greenFrog),
        ])
        greenFrogTongue.length = 400;
        greenFrogTongue.start();
        const purpleFrogTongue = add([
            tongueComp(purpleFrog),
        ])
        purpleFrogTongue.length = 400;
        purpleFrogTongue.start();
        let pullForce = 0;
        let pushForce = 0;
        // hotkeys
        onKeyDown("a", () => {
            greenFrog.move(-SPEED, 0);
            greenFrog.flipX = true;
        })
        onKeyPress("t", () => {
            if(!greenFrogTongue.extended){
                greenFrog.play("tongueExtend");
                wait(0.3,() => {
                    greenFrogTongue.extend();
                })
                onKeyPress("e", () => {
                    if(greenFrogTongue.isColliding){
                        if(purpleFrog.isBreaking){
                            greenFrog.move(SPEED*7, 0);
                        }
                        else{
                            console.log("did my part");
                            pullForce = SPEED*7;
                        }
                    }
                    greenFrog.play("tongueExtend");
                    wait(0.3,() => {
                        greenFrogTongue.retract();
                    })
                    wait(0.5,() => {
                        // tongue.retract();
                        greenFrog.play("idle");
                    })
                })
            }
            else{
                greenFrog.play("tongueExtend");
                wait(0.3,() => {
                    greenFrogTongue.retract();
                })
                wait(0.5,() => {
                    // tongue.retract();
                    greenFrog.play("idle");
                })

            }
        })
        onKeyDown("w", () => {
            greenFrog.move(SPEED, 0);
        })
        onKeyDown("s", () => {
            greenFrog.move(-SPEED, 0);
        })
        onKeyDown("d", () => {
            greenFrog.move(SPEED, 0);
            greenFrog.flipX = false;
        })
        onKeyPress("space", () => {
            if(greenFrog.isGrounded()){
                greenFrog.jump();
            }
        })
        greenFrog.onGround(()=>{
            greenFrog.play("idle");
            k.debug.log("ouch");
        })
        socket.on("frogState", (state) => {
            greenFrog.move(state.pull,0);
            console.log("pull: ", state.pull);
            pullForce = 0;
            const invertedX = width() - state.pos.x;
            purpleFrog.pos = vec2(invertedX, state.pos.y);
            purpleFrog.vel = vec2(-state.vel.x, state.vel.y);
            purpleFrog.flipX = !state.flipX;
            if(state.anim && state.anim != purpleFrog.curAnim()){
                console.log(state.anim);
                purpleFrog.play(state.anim);
            }
            purpleFrogTongue.length = state.tongue.length;
            purpleFrogTongue.visibleLength = state.tongue.visibleLength;
            purpleFrogTongue.isExtending = state.tongue.isExtending;
            purpleFrogTongue.isRetracting = state.tongue.isRetracting;
            purpleFrogTongue.extended = state.tongue.extended;
            purpleFrogTongue.segments.forEach((seg) => seg.flipX = purpleFrog.flipX);
        })
        onUpdate(() => {
            const state = {
                pos: greenFrog.pos,
                pull: pullForce,
                vel: greenFrog.vel,
                flipX: greenFrog.flipX,
                anim: greenFrog.curAnim(),
                tongue: {
                    length: greenFrogTongue.length,
                    visibleLength: greenFrogTongue.visibleLength,
                    isExtending: greenFrogTongue.isExtending,
                    isRetracting: greenFrogTongue.isRetracting,
                    extended: greenFrogTongue.extended,
                }
            }
            socket.emit("frogState",state);
            // pullForce = 0;
            // pushForce = 0;
        })
        }   
        return () => {socket.off("message", (message) => {
            console.log(message)
        })};
    },[])
  return <canvas ref={GameCanvas}/>;
};

export default Game;

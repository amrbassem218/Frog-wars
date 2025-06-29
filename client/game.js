// Global variables
let socket;
let gameProps = null;
let k;
let greenFrog, purpleFrog, greenFrogTongue, purpleFrogTongue;
let tempGround, tempGround2, tempGround3;
let collisionFlag = false;
let pullForce = 0;
let pushForce = 0;
let gameReady = false;
const SPEED = 500;

// Initialize socket connection
function initSocket() {
    socket = io("https://frog-wars.onrender.com");
    socket.on("connect", () => {
        console.log("Connected to server");
        document.getElementById('loading').style.display = 'none';
    });
    
    socket.on("message", (message) => {
        console.log(message);
    });
    
    socket.on("gameStart", (props) => {
        gameProps = props;
        startGame();
    });
    
    socket.on("result", (res) => {
        console.log("Game result:", res);
        // Handle game result (win/lose dialog)
    });
    
    socket.on("gameOver", (data) => {
        let result = (data && data.result) ? data.result : undefined;
        showGameOverOverlay(data && data.message ? data.message : "Game Over! Ribbit! Better luck next time!", result);
    });
}

// Join queue function
function joinQueue() {
    document.getElementById('loading').style.display = 'block';
    socket.emit("joinQueue");
}

// Start the game
function startGame() {
    console.log("Starting game...");
    console.log("Menu element:", document.getElementById('menu'));
    console.log("Canvas element:", document.getElementById('gameCanvas'));
    
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    
    console.log("Canvas display style after setting:", document.getElementById('gameCanvas').style.display);
    
    initKaboom();
}

// Initialize Kaboom.js
function initKaboom() {
    const canvas = document.getElementById('gameCanvas');
    
    k = kaboom({
        global: false,
        canvas: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        scale: 1,
        background: [0, 0, 255],
        debug: true,
    });
    
    const { 
        onLoad, onCollide, wait, dt, z, destroy, onKeyDown, rotate, Color, 
        center, vec2, onUpdate, rgb, anchor, outline, width, height, rect, 
        scale, add, sprite, pos, area, body, onKeyPress, loadSprite, loadBean, setGravity 
    } = k;
    
    // Load sprites
    console.log("Loading sprites...");
    loadSprite("bg", "public/backgrounds/river_bg_with_lillypads.png");
    loadSprite("tongue_start", "public/tongue/tongue_start.png");
    loadSprite("tongue_middle", "public/tongue/tongue_middle.png");
    loadSprite("tongue_end", "public/tongue/tongue_end.png");
    
    // Load frog sprites
    loadSprite("greenSheet", "public/GreenBlue/ToxicFrogGreenBlue_Sheet.png", {
        sliceX: 9,
        sliceY: 5,
        anims: {
            tongueExtend: {
                from: 18,
                to: 23,
                speed: 15,
                loop: false,
            },
            idle: {
                from: 0,
                to: 7,
                speed: 15,
                loop: true,
            },
            break: {
                from: 9,
                to: 12,
                speed: 15,
                loop: false,
            },
            reverseBreak: {
                from: 12,
                to: 9,
                speed: 15,
                loop: false,
            },
        }
    });
    
    loadSprite("purpleSheet", "public/PurpleBlue/ToxicFrogPurpleBlue_Sheet.png", {
        sliceX: 9,
        sliceY: 5,
        anims: {
            tongueExtend: {
                from: 18,
                to: 23,
                speed: 15,
                loop: false,
            },
            idle: {
                from: 0,
                to: 7,
                speed: 15,
                loop: true,
            },
            break: {
                from: 9,
                to: 12,
                speed: 15,
                loop: false,
            },
            reverseBreak: {
                from: 12,
                to: 9,
                speed: 15,
                loop: false,
            },
        }
    });
    
    // Setup game
    onLoad(() => {
        console.log("Sprites loaded, setting up game...");
        setupGame();
    });
}

// Setup the game objects
function setupGame() {
    console.log("Setting up game objects...");
    const { 
        onLoad, onCollide, wait, dt, z, destroy, onKeyDown, rotate, Color, 
        center, vec2, onUpdate, rgb, anchor, outline, width, height, rect, 
        scale, add, sprite, pos, area, body, onKeyPress, loadSprite, loadBean, setGravity 
    } = k;
    
    // Background
    console.log("Creating background...");
    const bg = add([
        sprite("bg"),
        pos(0, 0),
        scale(1),
        z(-10),
    ]);
    bg.scale = vec2(width() / bg.width, height() / bg.height);
    console.log("Background created:", bg);
    
    // Ground platforms
    console.log("Creating ground platforms...");
    tempGround = add([
        rect(width() / 8, 48),
        pos(width() / 2 - width() / 2.5, height() - 70),
        area(),
        body({ isStatic: true }),
        outline(10, Color.RED) // Red outline for debugging
    ]);
    
    tempGround2 = add([
        rect(width() / 8, 48),
        pos(width() / 2 - width() / 12, height() - 70),
        area(),
        body({ isStatic: true }),
        outline(10, Color.RED) // Red outline for debugging
    ]);
    
    tempGround3 = add([
        rect(width() / 8, 48),
        pos(width() / 2 + width() / 5, height() - 70),
        area(),
        body({ isStatic: true }),
        outline(10, Color.RED) // Red outline for debugging
    ]);
    
    // Show ground platforms for debugging (remove .hidden = true)
    tempGround.hidden = true;
    tempGround2.hidden = true;
    tempGround3.hidden = true;
    
    // Set gravity
    setGravity(1600);
    
    // Create frogs with custom area for better collision detection
    console.log("Creating frogs...");
    greenFrog = add([
        sprite("greenSheet", { frame: 0 }),
        pos(width() / 2 - width() / 2.5 + 100, height() - 400),
        scale(5),
        area({
            shape: new k.Rect(vec2(0, 0), 40, 60),
            offset: vec2(0, 20)
        }),
        body({
            shape: new k.Rect(vec2(0, 0), 40, 60),
            offset: vec2(0, 20)
        }),
        anchor("top"),
        { name: "greenFrog", isBreaking: false },
        "greenFrog"
    ]);
    
    greenFrog.play("idle");
    console.log("Green frog created:", greenFrog);
    
    purpleFrog = add([
        sprite("purpleSheet", { frame: 0 }),
        pos((width() / 2 + width() / 5), height() - 400),
        scale(5),
        area({
            shape: new k.Rect(vec2(0, 0), 40, 60),
            offset: vec2(0, 20)
        }),
        body({
            shape: new k.Rect(vec2(0, 0), 40, 60),
            offset: vec2(0, 20)
        }),
        anchor("top"),
        { name: "purpleFrog", isBreaking: false },
        "purpleFrog"
    ]);
    
    purpleFrog.play("idle");
    purpleFrog.flipX = true;
    console.log("Purple frog created:", purpleFrog);
    
    // Create tongues
    greenFrogTongue = add([tongueComp(greenFrog)]);
    greenFrogTongue.length = 400;
    greenFrogTongue.start();
    
    purpleFrogTongue = add([tongueComp(purpleFrog)]);
    purpleFrogTongue.length = 400;
    purpleFrogTongue.start();
    
    // Setup controls
    setupControls();
    
    // Setup socket events
    setupSocketEvents();
    
    // Setup game loop
    setupGameLoop();
    
    // Mark game as ready
    gameReady = true;
    console.log("Game is ready!");
}

// Tongue component
function tongueComp(targetFrog) {
    const { destroy, onCollide, dt, add, sprite, pos, z, area, vec2 } = k;
    
    return {
        id: "tongue",
        require: [],
        segments: [],
        length: 0,
        visibleLength: 0,
        isExtending: false,
        isRetracting: false,
        speed: 5000,
        extended: false,
        isColliding: false,
        
        start() {
            let dir = (targetFrog.flipX ? -1 : 1);
            let startx = (dir == 1) ? targetFrog.pos.x + (27) : targetFrog.pos.x - 60;
            let starty = targetFrog.pos.y + 95;
            
            for (let s of this.segments) {
                destroy(s);
            }
            this.segments = [];
            this.isColliding = false;
            
            let start = add([
                sprite("tongue_start"),
                pos(startx, starty),
                z(10),
                area(),
                `tongue_part_${targetFrog.name}`
            ]);
            start.flipX = targetFrog.flipX;
            this.segments.push(start);
            
            const middleTileLength = 32;
            const endTileLength = 64;
            let numberOfTiles = Math.floor((this.length - endTileLength) / middleTileLength);
            let tilePos = startx;
            
            for (let i = 1; i <= numberOfTiles; i++) {
                let mid = add([
                    sprite("tongue_middle"),
                    pos(startx + i * middleTileLength * dir, starty),
                    z(10),
                    area(),
                    `tongue_part_${targetFrog.name}`
                ]);
                mid.flipX = targetFrog.flipX;
                this.segments.push(mid);
                tilePos = startx + i * middleTileLength * dir;
            }
            
            let end = add([
                sprite("tongue_end"),
                pos((dir == 1) ? (tilePos + middleTileLength) : (tilePos - middleTileLength), starty),
                area(),
                `tongue_part_${targetFrog.name}`
            ]);
            end.flipX = targetFrog.flipX;
            this.segments.push(end);
            
            if (!collisionFlag && this.extended) {
                collisionFlag = true;
                let cancel = onCollide(`tongue_part_${targetFrog.name}`, (targetFrog.name === "purpleFrog" ? "greenFrog" : "purpleFrog"), () => {
                    this.isColliding = true;
                    console.log(this.isColliding);
                    if (!this.extended) {
                        cancel.cancel();
                        collisionFlag = false;
                        this.isColliding = false;
                    }
                });
            }
            
            this.segments.forEach(e => {
                e.hidden = true;
            });
        },
        
        update() {
            this.start();
            let showedLength = 0;
            const segLength = 36;
            
            this.segments.forEach((seg, i) => {
                if (showedLength < this.visibleLength) {
                    showedLength = i * segLength;
                    seg.hidden = false;
                }
            });
            
            if (this.isExtending && this.visibleLength < this.length) {
                this.visibleLength += this.speed * dt();
                if (this.visibleLength >= this.length) {
                    this.visibleLength = this.length;
                    this.isExtending = false;
                }
            }
            
            if (this.isRetracting && this.visibleLength > 0) {
                this.visibleLength -= this.speed * dt();
                if (this.visibleLength <= 0) {
                    this.visibleLength = 0;
                    this.isRetracting = false;
                }
            }
        },
        
        extend() {
            this.isExtending = true;
            this.isRetracting = false;
            this.extended = true;
        },
        
        retract() {
            this.isExtending = false;
            this.isRetracting = true;
            this.extended = false;
        },
    };
}

// Setup controls
function setupControls() {
    const { onKeyDown, onKeyPress, wait } = k;
    
    onKeyDown("w", () => {
        greenFrog.move(SPEED, 0);
    });
    
    onKeyDown("d", () => {
        greenFrog.move(SPEED, 0);
        greenFrog.flipX = false;
    });
    
    onKeyDown("s", () => {
        greenFrog.move(-SPEED, 0);
    });
    
    onKeyDown("a", () => {
        greenFrog.move(-SPEED, 0);
        greenFrog.flipX = true;
    });
    
    onKeyPress("space", () => {
        if (greenFrog.isGrounded()) {
            greenFrog.jump();
        }
    });
    
    onKeyPress("g", () => {
        if (greenFrog.isBreaking) {
            greenFrog.play("reverseBreak");
            wait(0.3, () => {
                greenFrog.play("idle");
            });
            greenFrog.isBreaking = false;
        } else {
            greenFrog.play("break");
            greenFrog.isBreaking = true;
        }
    });
    
    onKeyPress("t", () => {
        if (!greenFrogTongue.extended) {
            greenFrog.play("tongueExtend");
            wait(0.3, () => {
                greenFrogTongue.extend();
            });
            
            onKeyPress("e", () => {
                if (greenFrogTongue.isColliding) {
                    if (purpleFrog.isBreaking) {
                        greenFrog.move(SPEED * 12, 0);
                    } else {
                        console.log("did my part");
                        pullForce = SPEED * 12;
                    }
                }
                greenFrog.play("tongueExtend");
                wait(0.3, () => {
                    greenFrogTongue.retract();
                });
                wait(0.5, () => {
                    greenFrog.play("idle");
                });
            });
        } else {
            greenFrog.play("tongueExtend");
            wait(0.3, () => {
                greenFrogTongue.retract();
            });
            wait(0.5, () => {
                greenFrog.play("idle");
            });
        }
    });
    
    greenFrog.onGround(() => {
        greenFrog.play("idle");
        k.debug.log("ouch");
    });
}

// Setup socket events
function setupSocketEvents() {
    const { vec2 } = k;
    
    socket.on("frogState", (state) => {
        if (!gameReady) {
            console.log("Game not ready yet, ignoring frogState");
            return;
        }
        
        if (!greenFrog || !purpleFrog) {
            console.error("Game objects not initialized yet");
            return;
        }
        
        if (!state) {
            console.error("Received null/undefined frogState");
            return;
        }
        
        if (!state.pos) {
            console.error("Received frogState without pos:", state);
            return;
        }
        
        if (!state.vel) {
            console.error("Received frogState without vel:", state);
            return;
        }
        
        // Safely access properties with defaults
        const pull = state.pull || 0;
        const posX = state.pos.x || 0;
        const posY = state.pos.y || 0;
        const velX = state.vel.x || 0;
        const velY = state.vel.y || 0;
        const flipX = state.flipX || false;
        const isBreaking = state.break || false;
        
        greenFrog.move(pull, 0);
        console.log("pull: ", pull);
        pullForce = 0;
        
        const invertedX = k.width() - posX;
        purpleFrog.pos = vec2(invertedX, posY);
        purpleFrog.vel = vec2(-velX, velY);
        purpleFrog.flipX = !flipX;
        purpleFrog.isBreaking = isBreaking;
        
        if (state.anim && state.anim != purpleFrog.curAnim()) {
            console.log(state.anim);
            purpleFrog.play(state.anim);
        }
        
        if (state.tongue) {
            purpleFrogTongue.length = state.tongue.length || 0;
            purpleFrogTongue.visibleLength = state.tongue.visibleLength || 0;
            purpleFrogTongue.isExtending = state.tongue.isExtending || false;
            purpleFrogTongue.isRetracting = state.tongue.isRetracting || false;
            purpleFrogTongue.extended = state.tongue.extended || false;
            purpleFrogTongue.segments.forEach((seg) => seg.flipX = purpleFrog.flipX);
        }
    });
}

// Setup game loop
function setupGameLoop() {
    const { onUpdate, width, height } = k;
    
    onUpdate(() => {
        if (!gameReady || !greenFrog || !purpleFrog) {
            return;
        }
        
        const state = {
            pos: greenFrog.pos || { x: 0, y: 0 },
            pull: pullForce || 0,
            break: greenFrog.isBreaking || false,
            vel: greenFrog.vel || { x: 0, y: 0 },
            flipX: greenFrog.flipX || false,
            anim: greenFrog.curAnim() || 'idle',
            tongue: {
                length: greenFrogTongue.length || 0,
                visibleLength: greenFrogTongue.visibleLength || 0,
                isExtending: greenFrogTongue.isExtending || false,
                isRetracting: greenFrogTongue.isRetracting || false,
                extended: greenFrogTongue.extended || false,
            }
        };
        
        socket.emit("frogState", state);
        
        // Check win/lose conditions using more accurate detection
        const greenFrogCenterX = greenFrog.pos.x;
        const greenFrogCenterY = greenFrog.pos.y;
        const purpleFrogCenterX = purpleFrog.pos.x;
        const purpleFrogCenterY = purpleFrog.pos.y;
        
        // Define lily pad boundaries more precisely
        const lily1Left = tempGround.pos.x;
        const lily1Right = tempGround.pos.x + tempGround.width;
        const lily1Top = tempGround.pos.y;
        
        const lily2Left = tempGround2.pos.x;
        const lily2Right = tempGround2.pos.x + tempGround2.width;
        const lily2Top = tempGround2.pos.y;
        
        const lily3Left = tempGround3.pos.x;
        const lily3Right = tempGround3.pos.x + tempGround3.width;
        const lily3Top = tempGround3.pos.y;
        
        // Check if green frog is on any lily pad
        const greenFrogOnLily1 = greenFrogCenterX >= lily1Left && greenFrogCenterX <= lily1Right && 
                                greenFrogCenterY >= lily1Top - 10 && greenFrogCenterY <= lily1Top + 10;
        const greenFrogOnLily2 = greenFrogCenterX >= lily2Left && greenFrogCenterX <= lily2Right && 
                                greenFrogCenterY >= lily2Top - 10 && greenFrogCenterY <= lily2Top + 10;
        const greenFrogOnLily3 = greenFrogCenterX >= lily3Left && greenFrogCenterX <= lily3Right && 
                                greenFrogCenterY >= lily3Top - 10 && greenFrogCenterY <= lily3Top + 10;
        
        // Check if purple frog is on any lily pad
        const purpleFrogOnLily1 = purpleFrogCenterX >= lily1Left && purpleFrogCenterX <= lily1Right && 
                                 purpleFrogCenterY >= lily1Top - 10 && purpleFrogCenterY <= lily1Top + 10;
        const purpleFrogOnLily2 = purpleFrogCenterX >= lily2Left && purpleFrogCenterX <= lily2Right && 
                                 purpleFrogCenterY >= lily2Top - 10 && purpleFrogCenterY <= lily2Top + 10;
        const purpleFrogOnLily3 = purpleFrogCenterX >= lily3Left && purpleFrogCenterX <= lily3Right && 
                                 purpleFrogCenterY >= lily3Top - 10 && purpleFrogCenterY <= lily3Top + 10;
        
        // Debug logging (comment out in production)
        if (greenFrogOnLily1 || greenFrogOnLily2 || greenFrogOnLily3) {
            console.log("Green frog on lily pad:", { lily1: greenFrogOnLily1, lily2: greenFrogOnLily2, lily3: greenFrogOnLily3 });
        }
        if (purpleFrogOnLily1 || purpleFrogOnLily2 || purpleFrogOnLily3) {
            console.log("Purple frog on lily pad:", { lily1: purpleFrogOnLily1, lily2: purpleFrogOnLily2, lily3: purpleFrogOnLily3 });
        }
        
        // Green frog loses if not on any lily pad and falling
        if (!greenFrogOnLily1 && !greenFrogOnLily2 && !greenFrogOnLily3 && 
            greenFrog.vel && greenFrog.vel.y > 0) {
            console.log("Green frog fell in water!");
            socket.emit("gameOver", { loser: "player1", result: "lose" });
            showGameOverOverlay("You fell in the water!", "lose");
        }

        // Purple frog loses if not on any lily pad and falling
        if (!purpleFrogOnLily1 && !purpleFrogOnLily2 && !purpleFrogOnLily3 && 
            purpleFrog.vel && purpleFrog.vel.y > 0) {
            console.log("Purple frog fell in water!");
            socket.emit("gameOver", { loser: "player2", result: "win" });
            showGameOverOverlay("Your opponent fell in the water!", "win");
        }

        // Green frog falls off screen
        if (greenFrog.pos.y > height()) {
            console.log("Green frog fell off screen!");
            socket.emit("gameOver", { loser: "player1", result: "lose" });
            showGameOverOverlay("You fell in the water!", "lose");
        }
        // Purple frog falls off screen
        if (purpleFrog.pos.y > height()) {
            console.log("Purple frog fell off screen!");
            socket.emit("gameOver", { loser: "player2", result: "win" });
            showGameOverOverlay("Your opponent fell in the water!", "win");
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initSocket();
    
    // Emit initial message
    if (gameProps) {
        socket.emit("message", `hey ${gameProps.opponent} we're in ${gameProps.gameId}`);
    }
});

function showGameOverOverlay(message, result) {
    const overlay = document.getElementById('gameOverOverlay');
    const msg = document.getElementById('gameOverMessage');
    const heading = overlay.querySelector('h1');
    if (overlay && msg && heading) {
        overlay.style.display = 'flex';
        msg.textContent = message || "Ribbit! Better luck next time!";
        if (result === "win") {
            heading.textContent = "You Win!";
        } else if (result === "lose") {
            heading.textContent = "You Lose!";
        } else {
            heading.textContent = "Game Over!";
        }
    }
    document.getElementById('gameCanvas').style.display = 'none';
}

// Add Play Again button handler
window.addEventListener('DOMContentLoaded', function() {
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
        playAgainBtn.onclick = function() {
            window.location.reload();
        };
    }
});
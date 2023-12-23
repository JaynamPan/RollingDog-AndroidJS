document.addEventListener("DOMContentLoaded", function () {
    var preLoadAudio = new Audio();
    preLoadAudio.src = "./hit.mp3";
    var preLoadAudio2 = new Audio();
    preLoadAudio2.src = "./gameover.mp3";

});
window.addEventListener("load", function () {
    const canvas = this.document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 500;
    canvas.style.display = "block";

    const states = {
        SITTING: 0,
        RUNNING: 1,
        JUMPING: 2,
        FALLING: 3,
        ROLLING: 4,
        DIVING: 5,
        HIT: 6,
    }

    const btnBaseSize = 50;
    const btnBaseUp = this.document.getElementById("btnUp");
    const btnBaseDown = this.document.getElementById("btnDown");
    const btnBaseLeft = this.document.getElementById("btnLeft");
    const btnBaseRight = this.document.getElementById("btnRight");
    const btnBaseRoll = this.document.getElementById("btnRoll");

    function displayBtns() {
        let rect = canvas.getBoundingClientRect();

        //calculate the position
        let baseUpX = rect.width * 0.1 + rect.left;
        let baseUpY = rect.height * 0.54 + rect.top;
        let baseDownX = baseUpX;
        let baseDownY = rect.height * 0.77 + rect.top;
        let baseLeftX = rect.width * 0.042 + rect.left;
        let baseLeftY = (baseUpY + baseDownY) * 0.5;
        let baseRightX = rect.width * 0.159 + rect.left;
        let baseRightY = baseLeftY;
        let baseRollX = rect.width * 0.84 + rect.left;
        let baseRollY = baseRightY;
        //set position
        btnBaseUp.style.left = `${baseUpX}px`;
        btnBaseUp.style.top = `${baseUpY}px`;
        btnBaseDown.style.left = `${baseDownX}px`;
        btnBaseDown.style.top = `${baseDownY}px`;
        btnBaseLeft.style.left = `${baseLeftX}px`;
        btnBaseLeft.style.top = `${baseLeftY}px`;
        btnBaseRight.style.left = `${baseRightX}px`;
        btnBaseRight.style.top = `${baseRightY}px`;
        btnBaseRoll.style.left = `${baseRollX}px`;
        btnBaseRoll.style.top = `${baseRollY}px`;
        //display btn
        btnBaseUp.style.display = "block";
        btnBaseDown.style.display = "block";
        btnBaseLeft.style.display = "block";
        btnBaseRight.style.display = "block";
        btnBaseRoll.style.display = "block";


    }
    displayBtns();
    this.window.addEventListener("resize", displayBtns);
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 50;
            this.bg = new Bg(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.speed = 0;
            this.maxSpeed = 4;
            this.enemies = [];
            this.particles = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.score = 0;
            this.fontColor = "black";
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
            this.maxParticles = 80;
            this.collisions = [];
            this.time = 60000;
            this.gameOver = false;
            this.hearts = 5;
            this.floatingMsgs = [];
            this.sound = new Audio();
            this.sound.src = "./gameover.mp3";


        }
        update(dTime) {
            this.time -= dTime;
            if (this.time <= 0) {
                this.gameOver = true;
                this.sound.play();

            }
            this.bg.update();
            this.player.update(dTime, this.input.keys);

            //handle enemies
            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += dTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update(dTime);

            });
            this.enemies = this.enemies.filter(e => !e.markDelete);
            //handle messages
            this.floatingMsgs.forEach(msg => {
                msg.update();

            });
            this.floatingMsgs = this.floatingMsgs.filter(msg => !msg.markDelete);
            //handle particles
            this.particles.forEach((p, index) => {
                p.update();

            });
            if (this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles;
            }
            this.particles = this.particles.filter(p => !p.markDelete);
            //handle collision
            this.collisions.forEach((c, index) => {
                c.update(dTime);
            });
            this.collisions = this.collisions.filter(c => !c.markDelete);


        }
        draw(context) {
            this.bg.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.particles.forEach(p => {
                p.draw(context);
            });
            this.collisions.forEach(c => {
                c.draw(context);
            });
            this.floatingMsgs.forEach(msg => {
                msg.draw(context);

            });
            this.ui.draw(context);
        }
        addEnemy() {
            if (this.speed > 0 && Math.random() < 0.5) {
                this.enemies.push(new GroundEnemy(this));
            } else if (this.speed > 0) {
                this.enemies.push(new ClimbingEnemy(this));
            }
            this.enemies.push(new FlyingEnemy(this));
        }
    }

    class Layer {
        constructor(game, width, height, speedModifier, image) {
            this.game = game;
            this.width = width;
            this.height = height;
            this.speedModifier = speedModifier;
            this.image = image;
            this.x = 0;
            this.y = 0;
        }
        update() {
            if (this.x < -this.width) this.x = 0;
            else this.x -= this.game.speed * this.speedModifier;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        }
        restart() {
            this.x = 0;
            this.y = 0;
        }
    }

    class Bg {
        constructor(game) {
            this.game = game;
            this.width = 1667;
            this.height = 500;
            this.layer1Img = document.getElementById("layer1Img");
            this.layer2Img = document.getElementById("layer2Img");
            this.layer3Img = document.getElementById("layer3Img");
            this.layer4Img = document.getElementById("layer4Img");
            this.layer5Img = document.getElementById("layer5Img");

            this.layer1 = new Layer(this.game, this.width, this.height, 0, this.layer1Img);
            this.layer2 = new Layer(this.game, this.width, this.height, 0.2, this.layer2Img);
            this.layer3 = new Layer(this.game, this.width, this.height, 0.4, this.layer3Img);
            this.layer4 = new Layer(this.game, this.width, this.height, 0.8, this.layer4Img);
            this.layer5 = new Layer(this.game, this.width, this.height, 1, this.layer5Img);
            this.bgLayers = [this.layer1, this.layer2, this.layer3, this.layer4, this.layer5];
        }
        update() {
            this.bgLayers.forEach(layer => {
                layer.update();
            });
        }
        draw(context) {
            this.bgLayers.forEach(layer => {
                layer.draw(context);
            });
        }
        restart() {
            this.bgLayers.forEach(layer => {
                layer.restart();
            });
        }
    }

    class CollisionAnimation {
        constructor(game, x, y) {
            this.game = game;
            this.spriteWidth = 100;
            this.spriteHeight = 90;
            this.sizeModifier = Math.random() + 0.5;
            this.width = this.spriteWidth * this.sizeModifier;
            this.height = this.spriteHeight * this.sizeModifier;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
            this.frameX = 0;
            this.maxFrame = 4;
            this.markDelete = false;
            this.image = document.getElementById("boomImg");
            this.frameTimer = 0;
            this.fps = 15;
            this.frameInterval = 1000 / this.fps;
            this.sound = new Audio();
            this.sound.src = "./hit.mp3";

        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
                this.x, this.y, this.width, this.height);
        }
        update(dTime) {
            if (this.frameX === 0) this.sound.play();
            this.x -= this.game.speed;
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX > this.maxFrame) {
                    this.markDelete = true;
                } else {
                    this.frameX++;
                }
                this.frameTimer = 0;
            } else {
                this.frameTimer += dTime;
            }
        }

    }

    class Enemy {
        constructor() {
            this.frameX = 0;
            this.frameY = 0;
            this.fps = 20;
            this.frameInterval = 1000 / this.fps;
            this.frameTimer = 0;
            this.markDelete = false;
        }
        update(dTime) {
            //movement
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            //frame
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += dTime;
            }
            //check if off screen
            if (this.x + this.width < 0) this.markDelete = true;
        }
        draw(context) {
            context.drawImage(this.image, this.width * this.frameX, 0, this.width,
                this.height, this.x, this.y, this.width, this.height);
        }
    }

    class FlyingEnemy extends Enemy {
        constructor(game) {
            super();
            this.game = game;
            this.width = 60;
            this.height = 44;
            this.x = this.game.width + Math.random() * this.game.width * 0.5;
            this.y = Math.random() * this.game.height * 0.5;
            this.speedX = Math.random() + 1;
            this.speedY = 0;
            this.maxFrame = 5;
            this.image = document.getElementById("flyImg");
            this.angle = 0;
            this.speedAngle = Math.random() * 0.1 + 0.1;
        }
        update(dTime) {
            super.update(dTime);
            this.angle += this.speedAngle;
            this.y += Math.sin(this.angle);
        }
    }

    class GroundEnemy extends Enemy {
        constructor(game) {
            super();
            this.game = game;
            this.width = 60;
            this.height = 87;
            this.x = this.game.width;
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.image = document.getElementById("plantImg");
            this.speedX = 0;
            this.speedY = 0;
            this.maxFrame = 1;
        }
    }

    class ClimbingEnemy extends Enemy {
        constructor(game) {
            super();
            this.game = game;
            this.width = 120;
            this.height = 144;
            this.x = this.game.width;
            this.y = Math.random() * this.game.height * 0.5;
            this.image = document.getElementById("spider_bigImg");
            this.speedX = 0;
            this.speedY = Math.random() > 0.5 ? 1 : -1;
            this.maxFrame = 5;


        }
        update(dTime) {
            super.update(dTime);
            if (this.y > this.game.height - this.height - this.game.groundMargin) {
                this.speedY *= -1;
            }
            if (this.y < -this.height) this.markDelete = true;
        }
        draw(context) {
            super.draw(context);
            context.beginPath();
            context.moveTo(this.x + this.width * 0.5, 0);
            context.lineTo(this.x + this.width * 0.5, this.y + this.height * 0.3);
            context.stroke();
        }
    }
    class FloatingMsg {
        constructor(msg, x, y, targetX, targetY) {
            this.msg = msg;
            this.x = x;
            this.y = y;
            this.targetX = targetX;
            this.targetY = targetY;
            this.markDelete = false;
            this.timer = 0;


        }
        update() {
            this.x += (this.targetX - this.x) * 0.03;
            this.y += (this.targetY - this.y) * 0.03;
            this.timer++;
            if (this.timer > 100) this.markDelete = true;
        }
        draw(context) {
            context.font = "20px Creepster";
            context.fillStyle = "white";
            context.fillText(this.msg, this.x, this.y);
        }
    }

    class InputHandler {
        constructor(game) {
            this.game = game;
            this.keys = [];
            this.touchThreshold = 40;
            this.touchY = '';
            btnBaseUp.addEventListener("touchstart", e => {
                this.keys.push("ArrowUp");


            });
            btnBaseDown.addEventListener("touchstart", e => {
                this.keys.push("ArrowDown");
            });
            btnBaseLeft.addEventListener("touchstart", e => {
                this.keys.push("ArrowLeft");
            });
            btnBaseRight.addEventListener("touchstart", e => {
                this.keys.push("ArrowRight");
            });
            btnBaseRoll.addEventListener("touchstart", e => {
                if (this.keys.indexOf("Enter") === -1) this.keys.push("Enter");
            
            });
            btnBaseUp.addEventListener("touchend", e => {
                this.keys.splice(this.keys.indexOf("ArrowUp"), 1);


            });
            btnBaseDown.addEventListener("touchend", e => {
                this.keys.splice(this.keys.indexOf("ArrowDown"), 1);

            });
            btnBaseLeft.addEventListener("touchend", e => {
                this.keys.splice(this.keys.indexOf("ArrowLeft"), 1);
            });
            btnBaseRight.addEventListener("touchend", e => {
                this.keys.splice(this.keys.indexOf("ArrowRight"), 1);
            });
            btnBaseRoll.addEventListener("touchend", e => {
                this.keys.splice(this.keys.indexOf("Enter"), 1);
            });
            window.addEventListener("touchstart", e => {
                if (this.game.gameOver) {
                    this.touchY = e.changedTouches[0].pageY;
                }

            });
            window.addEventListener("touchmove", e => {
                if (this.game.gameOver) {
                    const swipeDistance = e.changedTouches[0].pageY - this.touchY;
                    if (swipeDistance > this.touchThreshold) {
                        restartGame();
                    };
                }

            });


        }
    }
    class Particle {
        constructor(game) {
            this.game = game;
            this.markDelete = false;
        }
        update() {
            this.x -= this.speedX + this.game.speed;
            this.y -= this.speedY;
            this.size *= 0.95;
            if (this.size < 0.5) this.markDelete = true;
        }
    }
    class Dust extends Particle {
        constructor(game, x, y) {
            super(game);
            this.size = Math.random() * 10 + 10;
            this.x = x;
            this.y = y;
            this.speedX = Math.random();
            this.speedY = Math.random();
            this.color = "rgba(0,0,0,0.2)";

        }
        draw(context) {
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();
        }
    }

    class Fire extends Particle {
        constructor(game, x, y) {
            super(game);
            this.image = document.getElementById("fireImg");
            this.size = Math.random() * 70 + 50;
            this.x = x;
            this.y = y;
            this.speedX = 1;
            this.speedY = 1;
            this.angle = 0;
            this.speedAngle = Math.random() * 0.2 - 0.1;


        }
        update() {
            super.update();
            this.angle += this.speedAngle;
            this.x += Math.sin(this.angle * 10);
        }
        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, -this.size * 0.5, -this.size * 0.5, this.size, this.size);
            context.restore();
        }
    }

    class Splash extends Particle {
        constructor(game, x, y) {
            super(game);
            this.size = Math.random() * 80 + 100;
            this.x = x - this.size * 0.4;
            this.y = y - this.size * 0.5;
            this.speedX = Math.random() * 6 - 4;
            this.speedY = Math.random() * 2 + 1;
            this.gravity = 0;
            this.image = document.getElementById("fireImg");

        }
        update() {
            super.update();
            this.gravity += 0.1;
            this.y += this.gravity;


        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
    }
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 100;
            this.height = 91.3;
            this.x = 250;
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.image = document.getElementById("playerImg");
            this.frameX = 0;
            this.frameY = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 10;
            this.maxFrame = 6;
            this.frameTimer = 0;
            this.fps = 20;
            this.frameInterval = 1000 / this.fps;
            this.weight = 1;
            this.states = [new Sitting(this.game), new Running(this.game),
            new Jumping(this.game), new Falling(this.game),
            new Rolling(this.game), new Diving(this.game),
            new Hit(this.game)];
            this.currentState = null;


        }
        update(dTime, input) {
            this.checkCollision();
            this.currentState.handleInput(input);
            //horizontal movement
            this.x += this.speedX;
            if (input.includes("ArrowRight") && this.currentState !== this.states[6]) this.speedX = this.maxSpeed;
            else if (input.includes("ArrowLeft") && this.currentState !== this.states[6]) this.speedX = -this.maxSpeed;
            else this.speedX = 0;
            if (this.x < 0) this.x = 0;
            if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
            //vertical movement
            this.y += this.speedY;
            if (!this.onGround()) this.speedY += this.weight;
            else this.speedY = 0;
            if (this.y > this.game.height - this.height - this.game.groundMargin) {
                this.y = this.game.height - this.height - this.game.groundMargin;
            }

            //frame
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += dTime;
            }
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height);
        }
        onGround() {
            return this.y >= this.game.height - this.height - this.game.groundMargin;
        }
        setState(state, speed) {

            this.currentState = this.states[state];
            this.game.speed = speed * this.game.maxSpeed;
            this.currentState.enter();
        }
        checkCollision() {
            this.game.enemies.forEach(e => {
                if (e.x < this.x + this.width &&
                    e.x + e.width > this.x &&
                    e.y < this.y + this.height &&
                    e.y + e.height > this.y) {
                    //collision detected
                    e.markDelete = true;
                    this.game.collisions.push(new CollisionAnimation(this.game, e.x + e.width * 0.5,
                        e.y + e.height * 0.5));
                    if (this.currentState === this.states[4] ||
                        this.currentState === this.states[5]) {
                        this.game.score++;
                        this.game.floatingMsgs.push(new FloatingMsg("+1", e.x, e.y, 150, 50));
                    } else {
                        this.setState(6, 0);
                        this.game.hearts--;
                        if (this.game.hearts <= 0) this.game.gameOver = true;
                    }

                }
            });
        }
        restart() {
            this.x = 250;
            this.y = this.game.height - this.height - this.game.groundMargin;
            this.frameX = 0;
            this.frameY = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.maxSpeed = 10;
            this.maxFrame = 6;
            this.frameTimer = 0;
            this.currentState = this.states[0];

        };
    }


    class State {
        constructor(state, game) {
            this.state = state;
            this.game = game;
        }
    }

    class Sitting extends State {
        constructor(game) {
            super("SITTING", game);
        }
        enter() {
            this.game.player.frameX = 0;
            this.game.player.maxFrame = 4;
            this.game.player.frameY = 5;

        }
        handleInput(input) {
            if (input.includes("ArrowLeft") || input.includes("ArrowRight")) {
                this.game.player.setState(states.RUNNING, 1);
            } else if (input.includes("Enter")) {
                this.game.player.setState(states.ROLLING, 2);
            }
        }
    }
    class Running extends State {
        constructor(game) {
            super("RUNNING", game);

        }
        enter() {
            this.game.player.frameX = 0;
            this.game.player.maxFrame = 8;
            this.game.player.frameY = 3;

        }
        handleInput(input) {
            this.game.particles.unshift(new Dust(this.game, this.game.player.x + this.game.player.width * 0.5,
                this.game.player.y + this.game.player.height));
            if (input.includes("ArrowDown" && !input.includes("Enter"))) {
                this.game.player.setState(states.SITTING, 0);
            } else if (input.includes("ArrowUp")) {
                this.game.player.setState(states.JUMPING, 1);
            } else if (input.includes("Enter")) {
                this.game.player.setState(states.ROLLING, 2);
            }
        }
    }
    class Jumping extends State {
        constructor(game) {
            super("JUMPING", game);

        }
        enter() {
            this.game.player.frameX = 0;
            this.game.player.maxFrame = 6;
            this.game.player.frameY = 1;

            if (this.game.player.onGround()) this.game.player.speedY = -25;

        }
        handleInput(input) {
            if (this.game.player.speedY > this.game.player.weight) {
                this.game.player.setState(states.FALLING, 1);
            } else if (input.includes("Enter")) {
                this.game.player.setState(states.ROLLING, 2);
            } else if (input.includes("ArrowDown")) {
                this.game.player.setState(states.DIVING, 0);
            }

        }
    }
    class Falling extends State {
        constructor(game) {
            super("FALLING", game);

        }
        enter() {
            this.game.player.frameX = 0;
            this.game.player.maxFrame = 6;
            this.game.player.frameY = 2;



        }
        handleInput(input) {
            if (this.game.player.onGround()) {
                this.game.player.setState(states.RUNNING, 1);
            } else if (input.includes("ArrowDown")) {
                this.game.player.setState(states.DIVING, 0);
            }

        }
    }
    class Rolling extends State {
        constructor(game) {
            super("ROLLING", game);

        }
        enter() {
            this.game.player.frameX = 0;
            this.game.player.maxFrame = 6;
            this.game.player.frameY = 6;



        }
        handleInput(input) {
            this.game.particles.unshift(new Fire(this.game, this.game.player.x + this.game.player.width * 0.5,
                this.game.player.y + this.game.player.height * 0.5));
            if (!input.includes("Enter") && this.game.player.onGround()) {
                this.game.player.setState(states.RUNNING, 1);
            } else if (!input.includes("Enter") && !this.game.player.onGround()) {
                this.game.player.setState(states.FALLING, 1);
            } else if (input.includes("Enter") && input.includes("ArrowUp")
                && this.game.player.onGround()) {
                this.game.player.speedY = -25;
            } else if (input.includes("ArrowDown")) {
                this.game.player.setState(states.DIVING, 0);
            }


        }
    }

    class Diving extends State {
        constructor(game) {
            super("DIVING", game);

        }
        enter() {
            this.game.player.frameX = 0;
            this.game.player.maxFrame = 6;
            this.game.player.frameY = 6;
            this.game.player.speedY = 15;



        }
        handleInput(input) {
            this.game.particles.unshift(new Fire(this.game, this.game.player.x + this.game.player.width * 0.5,
                this.game.player.y + this.game.player.height * 0.5));
            if (this.game.player.onGround() && !input.includes("Enter")) {
                for (let i = 0; i < 30; i++) {
                    this.game.particles.unshift(new Splash(this.game, this.game.player.x + this.game.player.width * 0.5,
                        this.game.player.y + this.game.player.height));
                }
                this.game.player.setState(states.RUNNING, 1);
            } else if (input.includes("Enter") && this.game.player.onGround()) {
                this.game.player.setState(states.ROLLING, 2);
            }


        }
    }

    class Hit extends State {
        constructor(game) {
            super("HIT", game);

        }
        enter() {
            this.game.player.frameX = 0;
            this.game.player.maxFrame = 10;
            this.game.player.frameY = 4;




        }
        handleInput(input) {

            if (this.game.player.frameX >= 10 && this.game.player.onGround()) {
                this.game.player.setState(states.RUNNING, 1);
            } else if (this.game.player.frameX >= 10 && !this.game.player.onGround()) {
                this.game.player.setState(states.FALLING, 1);
            }


        }
    }

    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 30;
            this.fontFamily = "Helvetica";
            this.heartImg = document.getElementById("heartImg");
        }
        draw(context) {
            context.font = `${this.fontSize}px ${this.fontFamily}`;
            context.textAlign = "left";
            context.fillStyle = this.game.fontColor;
            //score
            context.fillText("Score: " + this.game.score, 20, 50);
            //timer
            context.font = `${this.fontSize * 0.8}px ${this.fontFamily}`;
            let time = (this.game.time * 0.001).toFixed(1)
            if (time <= 0) time = 0.0;
            context.fillText("Time: " + time, 20, 80);
            //hearts
            for (let i = 0; i < this.game.hearts; i++) {
                context.drawImage(this.heartImg, 25 * i + 20, 95, 25, 25);
            }

            //game over
            if (this.game.gameOver) {
                context.textAlign = "center";
                context.font = `${this.fontSize * 2}px ${this.fontFamily}`;
                context.fillText("Game Over", this.game.width * 0.5, this.game.height * 0.5);
                context.font = `${this.fontSize * 1}px ${this.fontFamily}`;
                context.fillText("swipe down to play", this.game.width * 0.5, this.game.height * 0.56);

            }
        }
    }
    let game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function restartGame() {
        game.player.restart();
        game.bg.restart();
        game.enemies = [];
        game.particles = [];
        game.collisions = [];
        game.floatingMsgs = [];
        game.score = 0;
        game.gameOver = false;
        game.hearts = 5;
        game.speed = 0;
        game.time = 60000;
        animate(0);
    }

    function animate(timeStamp) {
        let deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        if (!game.gameOver) requestAnimationFrame(animate);
    }
    animate(0);




});
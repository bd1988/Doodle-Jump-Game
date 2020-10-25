document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector(".grid");
    const doodler = document.createElement('div');
    const gameOverMsg = document.createElement('div');
    const showScore = document.getElementById('score');
    const startButton = document.createElement('div');
    const speedInfo = document.getElementById('speed');
    let doodlerLeftSpace = 50;
    let startPoint = 150;
    let doodlerBottomSpace = startPoint;
    let isGameOver = false;
    let started = false;
    let platformCount = 5;
    let platforms = [];
    let upTimerId
    let downTimerId
    let isJumping = true;
    let isGoingLeft = false;
    let isGoingRight = false;
    let leftTimerId
    let rightTimerId
    let score = 0;
    let jumpSound;
    let gameOverSound;
    let speed = 1;
    
    function sound(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function(){
            this.sound.play();
        }
        this.stop = function(){
            this.sound.pause();
        }    
    }

    function createDoodler() {
        grid.appendChild(doodler);
        doodler.classList.add('doodler');
        doodlerLeftSpace = platforms[0].left
        doodler.style.left = doodlerLeftSpace + 'px';
        doodler.style.bottom = doodlerBottomSpace + 'px';
    }

    class Platform {
        constructor(newPlatformBottom) {
            this.bottom = newPlatformBottom;
            this.left = Math.random() * 315;
            this.visual = document.createElement('div');
            const visual = this.visual;
            visual.classList.add('platform');
            visual.style.left = this.left + 'px';
            visual.style.bottom = this.bottom + 'px';
            grid.appendChild(visual);

        }
    }

    function createPlatforms(){
        for (let i = 0; i < platformCount; i++) {
            let platGap = 600 / platformCount;
            let newPlatformBottom = 100 + i * platGap;
            let newPlatform = new Platform(newPlatformBottom);
            platforms.push(newPlatform);
            console.log(platforms);
            
        }
    }    

    function movePlatforms() {
        if (doodlerBottomSpace > 200) {
            platforms.forEach(platform => {
                platform.bottom -= 4;
                let visual = platform.visual;
                visual.style.bottom = platform.bottom + 'px';

                if (platform.bottom < 10) {
                    let firstPlatform = platforms[0].visual;
                    firstPlatform.classList.remove('platform');
                    platforms.shift();
                    score++;
                    showScore.innerText = score;
                    let newPlatform = new Platform(600);
                    platforms.push(newPlatform);
                }
            })
        }
    }

    function jump() {
        clearInterval(downTimerId);
        isJumping = true;
        jumpSound.play();
        upTimerId = setInterval(function() {
            doodlerBottomSpace += 20;
            doodler.style.bottom = doodlerBottomSpace +'px';
            if (doodlerBottomSpace > startPoint + 200) {
                fall();
            }
        }, 30/speed)
    }
    
    function fall() {
        clearInterval(upTimerId);
        isJumping = false;
        downTimerId = setInterval(function () {
            doodlerBottomSpace -= 5;
            doodler.style.bottom = doodlerBottomSpace + 'px';
            if (doodlerBottomSpace <= 0) {
                gameOver();
            }
            platforms.forEach(platform => {
                if (
                    (doodlerBottomSpace >= platform.bottom) && 
                    (doodlerBottomSpace <= platform.bottom + 15) &&
                    ((doodlerLeftSpace + 60) >= platform.left) &&
                    (doodlerLeftSpace <= (platform.left + 85)) &&
                    !isJumping
                ) {
                    console.log('landend');
                    startPoint = doodlerBottomSpace;
                    jump();
                }
            })
        }, 30/speed)
    }

    function gameOver() {
        console.log('game over');
        isGameOver = true;
        gameOverMsg.innerText = 'GAME OVER!!!';
        gameOverMsg.classList.add('game-over')     
        grid.appendChild(gameOverMsg);
        document.removeEventListener('keyup', control)
        clearInterval(upTimerId);
        clearInterval(downTimerId);
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
        gameOverSound.play();
        fallDown();
    }

    function fallDown() {
        let rotation = 7.2;
        const moveUpAndTurnDown = setInterval(function() {
            rotation += 7.2;
            doodlerBottomSpace += 4;
            doodler.style.bottom = doodlerBottomSpace + 'px';
            doodler.style.transform = "rotate(" + rotation + "deg)";
        }, 20);
        const stopGoingUp = setTimeout(function(){
            clearInterval(moveUpAndTurnDown);
            const moveDwon = setInterval(function() {
                rotation += 7.2;
                doodlerBottomSpace -= 4;
                doodler.style.bottom = doodlerBottomSpace + 'px';
                doodler.style.transform = "rotate(" + rotation + "deg)";
            }, 20)
            if (doodlerBottomSpace == -1000) {
                clearInterval(moveDwon);
                grid.removeChild(doodler);
            }
        }, 500)
       
    }

    function control(e) {
        if (e.key === 'ArrowLeft') {
            moveLeft();
        } else if (e.key === 'ArrowRight') {
            moveRight();
        } else if (e.key === 'ArrowUp') {
            moveStraight();
        }
    }

    function moveLeft() {
        clearInterval(leftTimerId); //czyścimy powatarzające się interwały
        if (isGoingRight) {
            clearInterval(rightTimerId);
            isGoingRight = false;
        }
        isGoingLeft = true;
        leftTimerId = setInterval(function() {
            if (doodlerLeftSpace >= 0) {
            doodlerLeftSpace -= 5;
            doodler.style.left = doodlerLeftSpace + 'px';
            } else moveRight();
        }, 30/speed)
    }

    function moveRight() {
        clearInterval(rightTimerId); //czyścimy powtarzające się interwały
        if (isGoingLeft) {
            clearInterval(leftTimerId);
            isGoingLeft - false;
        }
        isGoingRight = true;
        rightTimerId = setInterval(function() {
            if (doodlerLeftSpace <= 340) {
                doodlerLeftSpace += 5;
                doodler.style.left = doodlerLeftSpace + 'px';
            } else moveLeft();
        }, 30/speed)
    }

    function moveStraight() {
        isGoingLeft = false;
        isGoingRight = false;
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
    }   

    function start() {
        if (!isGameOver) {
            createPlatforms();
            createDoodler();
            setInterval(movePlatforms, 30/speed);
            jumpSound = new sound("./sounds/jump.wav");
            gameOverSound = new sound("./sounds/game-over.wav");
            jump();
            document.addEventListener('keyup', control);
            started = true;            
        }
    }

    function startBtn(e) {
        if (e.key === " ") {
            document.removeEventListener('keyup', startBtn);           
            grid.removeChild(startButton);
            start();
        }
    }

    function speedChange(e) {
        if ((e.key === 's') && (speed == 1) && !started) {
            speed = 2;
            speedInfo.innerText = "2x";
        } else if ((e.key === 's') && (speed == 2) && !started) {
            speed = 1;
            speedInfo.innerText = "1x";
        }
    }

    startButton.classList.add('startBtn');
    startButton.innerText = "PRESS SPACE BUTTON TO START!";
    document.addEventListener('keyup', startBtn);
    document.addEventListener('keyup', speedChange);    
    grid.appendChild(startButton);
    
})
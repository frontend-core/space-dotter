const canvas = document.querySelector("canvas");
const handleResize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
handleResize();
window.addEventListener("resize", handleResize);

const ctx = canvas.getContext("2d");
ctx.lineCap = "round"; //hinh dang canvas

const DoublePI = Math.PI * 2;
const SPEED = 8;
let spawnTime = 200; //thời gian rơi xuat hien sao bang
let isGameOver = false;
let asteroids = [];
//vi tri ban dau cua mouse
const mouse = {
    x: innerWidth / 2,
    y: innerWidth / 2
};
window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener("touchmove", (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

const randomBetween = (change, min, times = 1) => (Math.random() * change + min) * times;
const transformSpeed = (SPEED, maxSpeed) => {
    if (SPEED >= 0) {
        if (SPEED > maxSpeed) return maxSpeed;
        return SPEED;
    } else {
        if (SPEED < -maxSpeed) return -maxSpeed;
        return SPEED;
    }
};

class SnakeClass {
    constructor(x, y, color, radius, tail, score) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
        this.tail = tail;
        this.score = score;
    }
    draw() {
        //make line move
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.radius * 2;
        ctx.beginPath();

        //make circle dot on move path
        ctx.arc(this.x, this.y, this.radius, 0, DoublePI); //make arc 0->2pi degree
        ctx.fill();
        ctx.closePath();

        //make snake tail
        this.tail.forEach((i) => {
            ctx.beginPath();
            ctx.arc(i.x, i.y, this.radius, 0, DoublePI);
            ctx.fill();
            ctx.closePath();
        });
    }
    move() {
        this.tail.push({ x: this.x, y: this.y });
        this.tail = this.tail.slice(-this.score);

        //distance of elements on snake body
        const xDistance = mouse.x - this.x;
        const yDistance = mouse.y - this.y;
        const angle = Math.atan2(yDistance, xDistance);
        const xChange = Math.abs(xDistance) * Math.cos(angle);
        const yChange = Math.abs(yDistance) * Math.sin(angle);
        this.x += transformSpeed(xChange, SPEED);
        this.y += transformSpeed(yChange, SPEED);
        this.draw();
    }
}
const snake = new SnakeClass(innerWidth / 2, innerHeight / 2, "#FF7D19", 5, [], 0);

class Asteroid {
    constructor(x, y, vx, vy, color, radius) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();

        ctx.arc(this.x, this.y, this.radius, 0, DoublePI);
        ctx.fill();
    }
    move() {
        this.x += this.vx;
        this.y += this.vy + spawnTime * 0.005;
        this.draw();

        //determine collision coordinate 
        if (Math.abs(this.x - snake.x) - this.radius - snake.radius < 0 && Math.abs(this.y - snake.y) - this.radius - snake.radius < 0) {
            cancelAnimationFrame(animate); //cancel previous action
            handleGameOver();
        }
    }
}
const addAsteroids = () => {
    if (isGameOver) return;
    asteroids.push(new Asteroid(Math.random() * innerWidth, 0, randomBetween(1, -0.5, 1.5), 4, "#00D4F0", 3)); //drop at top-> different between y

    //when end of this spawtime -> create new asteroid
    setTimeout(addAsteroids, spawnTime);
};
addAsteroids();

//increase speed
setInterval(() => {
    if (spawnTime > 50) spawnTime -= 5;
}, 300);

const lengthenTail = () => {
    if (isGameOver) return;

    //increase scrore when playing
    snake.score++;
    document.querySelector("#score").innerText = snake.score;
    document.querySelector("#score-result").innerText = snake.score;

    //plus 1 score after 1s
    setTimeout(lengthenTail, 1000);
}
lengthenTail();

const animate = () => {
    if (isGameOver) return;

    //fill black background color
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    snake.move();

    //condition to formed snake
    asteroids = asteroids.filter((i) => i.x < innerWidth && i.x > 0 && i.y < innerHeight);

    asteroids.forEach((i) => {
        i.move();
    });

    //equested the callback
    requestAnimationFrame(animate);
}
animate();

const handleGameOver = () => {
    isGameOver = true;

    //save high score to local
    const storageScore = localStorage.getItem("space-snake-high-score");
    if (Number.isNaN(Number(storageScore))) {
        document.querySelector("#max-score").innerText = snake.score;
    } else {
        //if score higher high score -> save as high score to local
        if (snake.score > Number(storageScore)) {
            localStorage.setItem("space-snake-high-score", snake.score);
            document.querySelector("#max-score").innerHTML = snake.score;
        } else {
            //if score smaller high score -> not change
            document.querySelector("#max-score").innerHTML = Number(storageScore);
        }
    }
    document.querySelector("#launch-modal-button").click();
};
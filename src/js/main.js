const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let Walls = [];
let Balls = [];
let Lines = [];
let projectiles = []
let hostiles = []


//2D Vector class
class Vec2 {
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;
    }

    add(vector) {
        return new Vec2(this.x + vector.x, this.y + vector.y);
    }

    sub(v) {
		return new Vec2(this.x - v.x, this.y - v.y);
	}

    magnitude() {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mul(scalar) {
		return new Vec2(this.x * scalar, this.y * scalar);
	}

    pow(exponent) {
        return new Vec2(this.x ** exponent, this.y ** exponent)
    }

    normalise() {
        if (this.magnitude() === 0) { 
            return new Vec2(0, 0);
        } else {
            return new Vec2(this.x/this.magnitude(), this.y/this.magnitude());
        }
    }
                
    //displayes the vector from a costom origo for trubbleshooting purposes
    displayVector(pos_x, pos_y, scalar, thickness, color) {
        line(
            pos_x, 
            pos_y, 
            pos_x + this.x * scalar, 
            pos_y + this.y * scalar, 
            thickness, 
            color
        );
    }

    //returns the dot product of two vectors
    dot(v) {
		return this.x * v.x + this.y * v.y;
	}

    cross(v) {
        return this.x * v.y + this.y * v.x;
    }

    //adds to vectors but takes deltaTime into account
    deltaTimeAdd(v) {
		return new Vec2(this.x + v.x * deltaTime, this.y + v.y * deltaTime);
	}
}

class matrices {
    constructor(rows, collums) {
        this.rows = rows;
        this.collums = collums;
        this.data = [];

        for (let i = 0; i < this.rows; i++) {
            this.data[i] = [];
            for (let j = 0; j < this.collums; j++) {
                this.data[i][j] = 0;
            }
        }
    }

    mulVec(v) {
        let result = new Vec2(0,0);
        result.x = this.data[0][0] * v.x + this.data[0][1] * v.y;
        result.y = this.data[1][0] * v.x + this.data[1][1] * v.y;
        return result;
    }
        
}


class Ball {
    constructor(x, y, radius, mass, lightRadius) {
        this.position = new Vec2(x, y);

        this.radius = radius;
        this.lightRadius = lightRadius;

        this.velocity = new Vec2(0, 0);
        this.acceleration = new Vec2(0, 0);
        this.accelerationConstant = 0.1;
        this.frictionConstant = -4

        this.angle = 0
        this.rotVelocity = 0

        this.mass = mass;
        if (this.mass === 0) {
            this.inverseMass = 0;
        } else {
            this.inverseMass = 1/this.mass;
        }
        this.inertia = ((1/2 * this.mass * this.radius)**2)
        if (this.mass === 0) {
            this.inverseInertia = 0;
        } else {
            this.inverseInertia = 1 / this.inertia
        }

        this.isPlayer = false
        this.health = 5
        this.iframes = 0

        Balls.push(this)
    }
    // Will Need updating to Canvas2D
    draw(color) {
        circle(ctx ,this.position, this.radius, color);
    }
    

    //update actual position acording to velocity
    updatePosition() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.rotVelocity *= 0.98;
    }

    //system for applying a force on the ball
    movement() {
        //checks what way to be accelerating acording to the keyboard
        this.acceleration = new Vec2(0, 0);
        if (keyboard.w) this.acceleration.y = -1;
        if (keyboard.s) this.acceleration.y =  1;
        if (keyboard.d) this.acceleration.x =  1;
        if (keyboard.a) this.acceleration.x = -1;

        if (keyboard.w && keyboard.s) this.acceleration.y = 0;
        if (keyboard.d && keyboard.a) this.acceleration.x = 0;

        //fixes the issue of the magnitude going over maxspeed in non cardinal directions by normalising the vectors
        this.acceleration = this.acceleration.normalise();
        this.acceleration = this.acceleration.mul(this.accelerationConstant); //multiplying the acceleration direction with the amount to accelerate
        this.velocity = this.velocity.add(this.acceleration);
    }

    accelerateTo(v) {
        this.velocity = this.velocity.add(v.sub(this.position).normalise().mul(this.accelerationConstant))
    }
}

//basically a wall that can move, inspierd by unity
class Line {
    constructor(pos1, pos2, thickness, mass) {
        this.pos1 = pos1;
        this.pos2 = pos2;
        this.thickness = thickness;
        this.length = this.pos2.sub(this.pos1).magnitude();
        this.normal = this.pos2.sub(this.pos1).normalise();
        this.angle = 0
        this.oriNormal = this.pos2.sub(this.pos1).normalise();
        this.absoPos = this.pos1.add(this.pos2).mul(0.5);
        this.velocity = new Vec2(0, 0);
        this.rotVelocity = 0

        this.mass = mass;
        if (this.mass === 0) {
            this.inverseMass = 0;
        } else {
            this.inverseMass = 1/this.mass;
        }

        this.inertia = this.mass * (this.thickness**2 + (this.length + 2 * this.thickness)**2) /4
        if (this.mass === 0) {
            this.inverseInertia = 0;
        } else {
            this.inverseInertia = 1 / this.inertia
        }

        Lines.push(this)
    }

    draw() {
        line(ctx, this.pos1, this.pos2, this.thickness * 2, "blue")
        circle(ctx ,this.pos1, this.thickness, "blue");
        circle(ctx ,this.pos2, this.thickness, "blue");
    }

    update() {
        this.angle += this.rotVelocity;
        this.rotVelocity *= 0.95;
        let rotationMatrix = rotateMatrix(this.angle);
        let newDirection = rotationMatrix.mulVec(this.oriNormal);
        this.absoPos = this.absoPos.add(this.velocity)
        this.pos1 = this.absoPos.add(newDirection.mul(-this.length/2));
        this.pos2 = this.absoPos.add(newDirection.mul(this.length/2));
    }
}

class Wall {
    constructor(pos1, pos2, mass, thickness) {
        this.pos1 = pos1
        this.pos2 = pos2
        this.thickness = thickness
        this.mass = mass;
        if (this.mass = 0) {
            this.inverseMass = 0;
        } else {this.inverseMass = 1/this.mass;}
        this.length = this.pos2.sub(this.pos1).magnitude()
        this.oriPos1 = this.pos1;
        this.oriPos2 = this.pos2;
        this.oriNormal = this.pos2.sub(this.pos1).normalise();
        this.center = this.pos1.add(this.pos2).mul(0.5);
        this.angle = 0;
        this.rotVelocity = 0
        Walls.push(this)

    }

    update() {
        this.angle += this.rotVelocity;
        this.rotVelocity *= 0.5;
        let rotationMatrix = rotateMatrix(this.angle);
        let newDirection = rotationMatrix.mulVec(this.oriNormal);
        this.pos1 = this.center.add(newDirection.mul(-this.length/2));
        this.pos2 = this.center.add(newDirection.mul(this.length/2));
    }

    draw() {
        line(ctx, this.pos1, this.pos2, this.thickness, "blue")
    }
}


document.addEventListener("mousedown", (event) => {

    if (event.button === 0 & !onCooldown) {
        let direction = new Vec2(event.clientX, event.clientY)
        let directionUnit = direction.sub(player.position).normalise()
        projectiles.push({
            direction: new Vec2(directionUnit.mul(20).x, directionUnit.mul(20).y),
            position: player.position.add(new Vec2(directionUnit.mul(-1).y, directionUnit.mul(-1).x * -1).mul(player.radius -10)).add(directionUnit.mul(30))
        })
        onCooldown = true
        shotAudio.pause()
        shotAudio.currentTime = 0
        shotAudio.play()
    }
})
document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
})
document.addEventListener("keydown", (event) => {
    lastFrameTime = performance.now();
    if (event.key === "Escape") {
        togglePause();
        togglePauseMenu();
    }
})


const player = new Ball(500, 300, 30, 10, 800)
player.isPlayer = true



let pollygons = [
    [new Vec2(200,200), new Vec2(400,200), new Vec2(400,400), new Vec2(200,400)], // quad 1
    [new Vec2(700,300), new Vec2(900,400), new Vec2(900,200), new Vec2(700,100)], // quad 2
    [new Vec2(400,700), new Vec2(400,900), new Vec2(700,900), new Vec2(700,800)], // quad 3
    [new Vec2(900,700), new Vec2(1100,700), new Vec2(1100,900), new Vec2(900,900)], // quad 4
];

pollygons.forEach(pollygon => {
    let length = pollygon.length - 1
    new Wall(pollygon[0], pollygon[length], 0, 1)
    for (let i = length; i > 0; i--) {
        new Wall(pollygon[i], pollygon[i - 1], 0, 1)
    }
});



let shotAudio = new Audio('./src/sounds/gunfire.mp3')

let dmgAudio = new Audio('./src/sounds/damage.mp3')
dmgAudio.volume = 0.2

let hostileDeath = new Audio('./src/sounds/hostile-death.mp3')
hostileDeath.volume = 0.2;

let death = new Audio('./src/sounds/game-over.mp3')

// our lines can be orginized in a 2d array where the y-cord is a list of all points in a closed loop


window.keyboard = new RoboroKeyboard()


let currentTime = performance.now(),
    deltaTime;

let fps        = 0,
    show_fps   = true;

let frameCount = 0,
    timeCount  = 0,
    tick = 0,
    onCooldown,
    isRunning = true;

let mouseX = 600,
    mouseY = 300;

let HP = 100;

const targetFps = 60;
const frameInterval = 1000 / targetFps;
let lastFrameTime = 0;

document.getElementById("pauseMenu").style.display = "none";

let line1 = new Line(new Vec2(400, 400), new Vec2(600, 400), 10, 1)

for(i = 0; i <= 10; i++) {hostiles.push(new Ball(-30, (Math.random() * canvas.height), 30, 10, 800))}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function update(){
    

    currentTime = performance.now();
    deltaTime = (currentTime - lastFrameTime)/1000;

    if (onCooldown) tick++;
    if (tick === 50) {
        onCooldown = false;
        tick = 0;
    };

    if (!document.hasFocus() && isRunning) {
       togglePause();
       togglePauseMenu();
    };


    frameCount++;
    timeCount += deltaTime;
    
    if (timeCount >= 0.1){
        fps = frameCount / timeCount;
        timeCount = 0;
        frameCount = 0;
    };
    
    ctx.fillStyle = "hsla(0, 0%, 7%, 1)";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    
    
    for(i = 0; i < hostiles.length; i++) {
        hostiles[i].frictionConstant = -6

        Collision(player, hostiles[i])
        hostiles[i].updatePosition()
        hostiles[i].accelerateTo(player.position)
        friction(hostiles[i])
        hostiles[i].draw("hsla(1, 100%, 25%, 1)")

        Walls.forEach(wall => {
            Collision(hostiles[i], wall)
        })

        hostiles.forEach(hostile => {
            Collision(hostiles[i], hostile)
        })

        for(j = 0; j < projectiles.length; j++) {
            if(projectiles[j]) {
                if (hostiles[i].position.sub(projectiles[j].position).magnitude() < hostiles[i].radius) {
                    hostiles.splice(i, 1, new Ball(-30, (Math.random() * canvas.height), 30, 10, 800))
                    hostileDeath.pause()
                    hostileDeath.currentTime = 0
                    hostileDeath.play()
                }
            }
        }
    }
    
    player.movement();
    player.updatePosition();
    friction(player);
    if(player.iframes > 0){player.iframes--}

    Walls.forEach(wall => {
        Collision(player, wall)
    });
    
    
    renderScene(pollygons, Balls);

    player.draw("hsla(1, 100%, 25%, 1)");

    // draws the gun
    let gun = new Path2D();
    let temp = new Vec2(mouseX, mouseY).sub(player.position).normalise().mul(-1);
    gun.moveTo(
        player.position.add(new Vec2(temp.y, temp.x * -1).mul(player.radius - 15)).x, 
        player.position.add(new Vec2(temp.y, temp.x * -1).mul(player.radius - 15)).y
    );
    gun.lineTo(
        player.position.add(new Vec2(temp.y, temp.x * -1).mul(player.radius - 5)).x,
        player.position.add(new Vec2(temp.y, temp.x * -1).mul(player.radius - 5)).y
    );
    gun.lineTo(
        player.position.add(new Vec2(temp.y, temp.x * -1).mul(player.radius - 5)).add(temp.mul(-40)).x,
        player.position.add(new Vec2(temp.y, temp.x * -1).mul(player.radius - 5)).add(temp.mul(-40)).y
    );
    gun.lineTo(
        player.position.add(new Vec2(temp.y, temp.x * -1).mul(player.radius - 15)).add(temp.mul(-40)).x,
        player.position.add(new Vec2(temp.y, temp.x * -1).mul(player.radius - 15)).add(temp.mul(-40)).y
    );
    gun.closePath();
    ctx.fillStyle ="gray";
    ctx.fill(gun);

    let healthbarbackground = new Path2D();
    healthbarbackground.moveTo(40, 50);
    healthbarbackground.lineTo(40, 80);
    healthbarbackground.lineTo(40 + 100*2, 80);
    healthbarbackground.lineTo(40 + 100*2, 50);
    healthbarbackground.closePath();
    ctx.fillStyle = "red";
    ctx.fill(healthbarbackground);

    let healthbar = new Path2D();
    healthbar.moveTo(40, 50);
    healthbar.lineTo(40, 80);
    healthbar.lineTo(40 + player.health*40, 80);
    healthbar.lineTo(40 + player.health*40, 50);
    healthbar.closePath();
    ctx.fillStyle = "green";
    ctx.fill(healthbar);

    if (show_fps) showFPS();

    // line1.draw()
    // line1.update()
    // friction(line1)

    // Collision(player, line1)

    if(player.health == 0 && isRunning) {
        death.play()
        togglePause()
        setTimeout(() => {
            window.location.assign("./index.html")
        }, 3000)
    }

    lastFrameTime = currentTime;
};

function animate() {
    setTimeout(() => {
        if (isRunning) requestAnimationFrame(animate);
        update();
    }, frameInterval);
}

animate();
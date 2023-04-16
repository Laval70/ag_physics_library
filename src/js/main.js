const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


//a class representing vectors and adds functions for vector operations
// Will Need updating to Canvas2D
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
            for (let j = j; j < this.collums; j++) {
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

// Will Need updating to Canvas2D
class Ball {
    constructor(x, y, radius, mass, lightRadius) {
        this.position = new Vec2(x, y);

        this.radius = radius;
        this.lightRadius = lightRadius;

        this.velocity = new Vec2(0, 0);
        this.acceleration = new Vec2(0, 0);
        this.accelerationConstant = 0.1;

        this.mass = mass;
        if (this.mass === 0) {
            this.inverseMass = 0;
        } else {
            this.inverseMass = 1/this.mass;
        }
    }
    // Will Need updating to Canvas2D
    draw(color) {
        circle(ctx ,this.position, this.radius, color);
    }
    

    //update actual position acording to velocity
    updatePosition() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
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
}
// Will Need updating to Canvas2D
class pollygon {
    constructor(points, angle) {
        this.points = points
        this.lines = []
        this.angle = angle

        let length = this.points.length - 1
        this.lines.push(new Wall(this.points[0], this.points[length], 0, 1))
        for (let i = length; i > 0; i--) {
        lines.push(new Wall(this.points[i], this.points[i - 1], 0, 1))
        }
    }

    collision(ball) {
        this.lines.forEach(line => {
            elasticCollision(ball, line)
        });
    }

}
// Will Need updating to Canvas2D
class Wall {
    constructor(pos1, pos2, mass, thickness) {
        this.pos1 = pos1
        this.pos2 = pos2
        this.thickness = thickness
        this.mass = mass;
        if (this.mass = 0) {
            this.inverseMass = 0;
        } else {this.inverseMass = 1/this.mass;}
        this.oriPos1 = this.pos1
        this.oriPos2 = this.pos2
        this.center = this.pos1.add(this.pos2).mul(0.5);

    }

    draw() {
        line(ctx, this.pos1, this.pos2, this.thickness, "blue")
    }
}


document.addEventListener("mousedown", (event) => {
    if (event.button === 0 & !onCooldown) {
        let direction = new Vec2(event.clientX, event.clientY)
        directionUnit = direction.sub(player.position).normalise()
        projectiles.push({
            direction: new Vec2(directionUnit.mul(20).x, directionUnit.mul(20).y),
            position: player.position.add(new Vec2(directionUnit.mul(-1).y, directionUnit.mul(-1).x * -1).mul(player.radius -10)).add(directionUnit.mul(30))
        })
        onCooldown = true
    }
})
document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
})
document.addEventListener("keydown", (event) => {
    timeLastFrame = performance.now();
    if (event.key === "Escape") {
        togglePause();
        togglePauseMenu();
    }
})


const player = new Ball(500, 300, 30, 10, 800)


let pollygons = [
    [new Vec2(200,200), new Vec2(400,200), new Vec2(400,400), new Vec2(200,400)], // quad 1
    [new Vec2(700,300), new Vec2(900,400), new Vec2(900,200), new Vec2(700,100)], // quad 2
    [new Vec2(400,700), new Vec2(400,900), new Vec2(700,900), new Vec2(700,800)], // quad 3
    [new Vec2(900,700), new Vec2(1100,700), new Vec2(1100,900), new Vec2(900,900)], // quad 4
];

let lines = [];

pollygons.forEach(pollygon => {
    let length = pollygon.length - 1
    lines.push(new Wall(pollygon[0], pollygon[length], 0, 1))
    for (let i = length; i > 0; i--) {
        lines.push(new Wall(pollygon[i], pollygon[i - 1], 0, 1))
    }
});



let projectiles = []


// our lines can be orginized in a 2d array where the y-cord is a list of all points in a closed loop


window.keyboard = new RoboroKeyboard()

let timeLastFrame = performance.now();
let deltaTime;

let fps          = 0,
    show_fps     = true;

let frameCount = 0,
    timeCount  = 0,
    tick = 0,
    onCooldown,
    isRunning = true;

let mouseX = 600;
    mouseY = 300;

let HP = 100;

document.getElementById("pauseMenu").style.display = "none";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function update(){
    if (isRunning) requestAnimationFrame(update);

    deltaTime = (performance.now() - timeLastFrame)/1000;
    timeLastFrame = performance.now();

    if (onCooldown) tick++;
    if (tick === 50) {
        onCooldown = false;
        tick = 0;
    };

    if (!document.hasFocus() && isRunning) {
        togglePause()
        togglePauseMenu()
    }


    frameCount++;
    timeCount += deltaTime;
    
    if (timeCount >= 0.1){
        fps = frameCount / timeCount;
        timeCount = 0;
        frameCount = 0;
    };
    
    ctx.fillStyle = "hsla(0, 0%, 7%, 1)";
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    player.movement();
    player.updatePosition();
    friction(player);

    lines.forEach(line => {
        elasticCollision(player, line)
    });
    
    
    renderScene(pollygons, false);

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
    healthbar.lineTo(40 + HP*2, 80);
    healthbar.lineTo(40 + HP*2, 50);
    healthbar.closePath();
    ctx.fillStyle = "green";
    ctx.fill(healthbar);

    if (show_fps) showFPS();
};
update();
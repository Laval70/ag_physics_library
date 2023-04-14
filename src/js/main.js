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
        circle(ctx ,this.position.x, this.position.y, this.radius, color);
    }
    

    //update actual position acording to velocity
    updatePosition() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
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
class Square {
    constructor(x, y, hight, width, angle) {
        this.position = new Vec2(x, y);
        this.angle = angle;
        this.radians = this.angle * Math.PI / 180;
        this.velocity = new Vec2(0, 0)
        this.width = width;
		this.hight = hight;
        this.acceleration = new Vec2(0, 0);
		this.accelerationConstant = 20;

        //uses trig rotation och the hight and width to calculate the 4 corners 
        this.tempP1 = new Vec2(-width/2, hight/2)
        this.tempP2 = new Vec2(width/2, hight/2)
        this.tempP3 = new Vec2(-width/2, -hight/2)
        this.tempP4 = new Vec2(width/2, -hight/2)

        this.p1 = this.position.add(new Vec2(this.tempP1.x * Math.cos(this.radians) - this.tempP1.y * Math.sin(this.radians), this.tempP1.x * Math.sin(this.radians) + this.tempP1.y * Math.cos(this.radians)))
        this.p2 = this.position.add(new Vec2(this.tempP2.x * Math.cos(this.radians) - this.tempP2.y * Math.sin(this.radians), this.tempP2.x * Math.sin(this.radians) + this.tempP2.y * Math.cos(this.radians)))
        this.p3 = this.position.add(new Vec2(this.tempP3.x * Math.cos(this.radians) - this.tempP3.y * Math.sin(this.radians), this.tempP3.x * Math.sin(this.radians) + this.tempP3.y * Math.cos(this.radians)))
        this.p4 = this.position.add(new Vec2(this.tempP4.x * Math.cos(this.radians) - this.tempP4.y * Math.sin(this.radians), this.tempP4.x * Math.sin(this.radians) + this.tempP4.y * Math.cos(this.radians)))
    }

    draw() {
        line(this.p1.x, this.p1.y, this.p2.x, this.p2.y, 1, "black")
        line(this.p2.x, this.p2.y, this.p4.x, this.p4.y, 1, "black")
        line(this.p4.x, this.p4.y, this.p3.x, this.p3.y, 1, "black")
        line(this.p3.x, this.p3.y, this.p1.x, this.p1.y, 1, "black")
    }

    rotation() {
        //ensures angle stays within 360 degrees
        if (this.angle < 0) {
            this.angle += 360
        } else if (this.angle > 360){
            this.angle -= 360 
        }

        this.radians = this.angle * Math.PI / 180;

        //updates rotation
        this.p1 = this.position.add(new Vec2(this.tempP1.x * Math.cos(this.radians) - this.tempP1.y * Math.sin(this.radians), this.tempP1.x * Math.sin(this.radians) + this.tempP1.y * Math.cos(this.radians)))
        this.p2 = this.position.add(new Vec2(this.tempP2.x * Math.cos(this.radians) - this.tempP2.y * Math.sin(this.radians), this.tempP2.x * Math.sin(this.radians) + this.tempP2.y * Math.cos(this.radians)))
        this.p3 = this.position.add(new Vec2(this.tempP3.x * Math.cos(this.radians) - this.tempP3.y * Math.sin(this.radians), this.tempP3.x * Math.sin(this.radians) + this.tempP3.y * Math.cos(this.radians)))
        this.p4 = this.position.add(new Vec2(this.tempP4.x * Math.cos(this.radians) - this.tempP4.y * Math.sin(this.radians), this.tempP4.x * Math.sin(this.radians) + this.tempP4.y * Math.cos(this.radians)))
        
    }
}
// Will Need updating to Canvas2D
class Wall {
    constructor(x1, y1, x2, y2, mass, thickness) {
        this.pos1 = new Vec2(x1, y1)
        this.pos2 = new Vec2(x2, y2)
        this.thickness = thickness
        this.mass = mass;
        if (this.mass = 0) {
            this.inverseMass = 0;
        } else {this.inverseMass = 1/this.mass;}
    }

    draw() {
        line(this.pos1.x, this.pos1.y, this.pos2.x, this.pos2.y, this.thickness, "black")
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

const player = new Ball(500, 300, 30, 10, 800)


let pollygons = [
    [new Vec2(200,200), new Vec2(400,200), new Vec2(400,400), new Vec2(200,400)], // quad 1
    [new Vec2(700,300), new Vec2(900,400), new Vec2(900,200), new Vec2(700,100)], // quad 2
    [new Vec2(400,700), new Vec2(400,900), new Vec2(700,900), new Vec2(700,800)], // quad 3
    [new Vec2(900,700), new Vec2(1100,700), new Vec2(1100,900), new Vec2(900,900)], // quad 4
];

let projectiles = []


// our lines can be orginized in a 2d array where the y-cord is a list of all points in a closed loop


window.keyboard = new RoboroKeyboard()

let timeLastFrame = performance.now();
let deltaTime;

let fps          = 0,
    show_fps     = true;
    
function showFPS(){
    ctx.fillStyle = "White";
    ctx.font      = "normal 16pt Arial";

    ctx.fillText(Math.round(fps) + " fps", 10, 26);
}
let frameCount = 0,
    timeCount  = 0,
    tick = 0,
    onCooldown;

let mouseX = 600;
    mouseY = 300;

let HP = 100;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function update(){
    requestAnimationFrame(update);

    deltaTime = (performance.now() - timeLastFrame)/1000;
    timeLastFrame = performance.now();

    if (onCooldown) tick++;
    if (tick === 50) {
        onCooldown = false;
        tick = 0;
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
    
    player.movement();
    player.updatePosition();
    friction(player);
    
    
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







//a class representing vectors and adds functions for vector operations
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

    //gets the dot product
    dot(v) {
		return this.x * v.x + this.y * v.y;
	}

    //adds to vectors but takes deltaTime into a count
    deltaTimeAdd(v) {
		return new Vec2(this.x + v.x * deltaTime, this.y + v.y * deltaTime);
	}
}
class Ball {
    constructor(x, y, radius, mass) {
        this.position = new Vec2(x, y);
        this.radius = radius;
        this.velocity = new Vec2(0, 0);
        this.acceleration = new Vec2(0, 0);
        this.accelerationConstant = 0.3;
        this.maxspeed = 8;
        this.mass = mass;
        if (this.mass === 0) {
            this.inverseMass = 0;
        } else {
            this.inverseMass = 1/this.mass;
        }
    }

    draw(color) {
        circle(this.position.x, this.position.y, this.radius, color);
    }

    showAccelerationVector(multiplyer, thickness, color){
        line(this.position.x, this.position.y, this.position.x + this.acceleration.x* multiplyer, this.position.y + this.acceleration.y* multiplyer, thickness, color);
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
        if (keyboard.w && this.velocity.y > -this.maxspeed) {this.acceleration.y = -1}
        if (keyboard.s && this.velocity.y <  this.maxspeed) {this.acceleration.y =  1}
        if (keyboard.d && this.velocity.x <  this.maxspeed) {this.acceleration.x =  1}
        if (keyboard.a && this.velocity.x > -this.maxspeed) {this.acceleration.x = -1}

        if (keyboard.w && keyboard.s) {this.acceleration.y = 0}
        if (keyboard.d && keyboard.a) {this.acceleration.x = 0}

        //fixes the issue of the magnitude going over maxspeed in non cardinal directions by normalising the vectors
        this.acceleration = this.acceleration.normalise();
        this.acceleration = this.acceleration.mul(this.accelerationConstant); //multiplying the acceleration direction with the amount to accelerate
        this.velocity = this.velocity.add(this.acceleration);

        //stops velocity from going over max speed
        if (this.velocity.magnitude() > this.maxspeed) {
            this.velocity = this.velocity.normalise().mul(this.maxspeed);
        }
    }
}
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


let timeLastFrame = Date.now();
let deltaTime;


//ball one
let ball1 = new Ball(300, 400, 40, 10);

//ball two
let ball2 = new Ball(600, 400, 40, 7);

let wall1 = new Wall(200, 300, 200, 500, 0, 3)

let box1 = new Square(300, 600, 100, 100, 0)


function update() {
    clearScreen();
    deltaTime = (Date.now() - timeLastFrame)/1000;
    timeLastFrame = Date.now();

    ball1.draw("red");
    ball1.velocity.displayVector(ball1.position.x, ball1.position.y, 20, 2, "blue");
    ball1.showAccelerationVector(500, 2, "green");
            
    ball2.draw("blue");
    wall1.draw()

    friction(ball1);
    ball1.movement();
    ball1.updatePosition();

    friction(ball2);
    ball2.updatePosition();

    elasticCollision(ball1, ball2);
    elasticCollision(ball1, wall1)

    
    box1.angle += 1;
    friction(box1);
    box1.rotation();
    box1.draw();
    
}

        
//let player1 = new Square(400, 400, 80, 40);
//
//let lineList = [
//	[new Vec2(500, 400), new Vec2(700, 400)],
//	[new Vec2(100, 100), new Vec2(300, 200)],
//	[new Vec2(700, 400), new Vec2(900, 600)]
//];
//

//
//function update() {
//	clearScreen();
//	fill("black")
//
//	// Calculationg delta time
//	deltaTime = (Date.now() - timeLastFrame) / 1000;
//	timeLastFrame = Date.now();
//
//	for (let i = 0; i < lineList.length; i++){
//		line(lineList[i][0].x, lineList[i][0].y, lineList[i][1].x, lineList[i][1].y, 2, "gray")
//	}
//
//
//
//
//
//
//
//	let camera = player1.position
//	let maxSteps = 100;
//	let stepSize = 0.01;
//
//	for (let i = 0; i < 180; i++){
//		let rayDirection = new Vec2(Math.cos(i*Math.PI/90), Math.sin(i*Math.PI/90))
//		let result = rayMarch(camera, rayDirection, maxSteps, stepSize);
//		if (result){
//			let playerToResultLength =  Math.sqrt((result.x - player1.position.x) ** 2 + (result.y - player1.position.y) ** 2)
//			if (playerToResultLength >= 500){
//				line(
//                    player1.position.x, 
//                    player1.position.y, 
//                    player1.position.x + (result.x - player1.position.x)/playerToResultLength * 500, 
//                    player1.position.y + (result.y - player1.position.y)/playerToResultLength * 500, 
//                    1, 
//                    "white")
//			} else {
//				line(
//                    player1.position.x, 
//                    player1.position.y, 
//                    result.x, 
//                    result.y, 
//                    1, "white"
//                )
//			}
//		}
//		if (result === null){
//			line(player1.position.x, player1.position.y,player1.position.x + rayDirection.x * 500, player1.position.y + rayDirection.y * 500)
//		}
//	}
//
//
//
//
//
//
//	// player movement
//	if (keyboard.d) {player1.acceleration = new Vec2( 1, 0);}
//	if (keyboard.a) {player1.acceleration = new Vec2(-1, 0);}
//	if (keyboard.w) {player1.acceleration = new Vec2( 0,-1);}
//	if (keyboard.s) {player1.acceleration = new Vec2( 0, 1);}
//    if (keyboard.a && keyboard.w) {player1.acceleration = new Vec2(-1/Math.sqrt(2), -1/Math.sqrt(2))}
//    if (keyboard.d && keyboard.w) {player1.acceleration = new Vec2( 1/Math.sqrt(2), -1/Math.sqrt(2))}
//    if (keyboard.d && keyboard.s) {player1.acceleration = new Vec2( 1/Math.sqrt(2),  1/Math.sqrt(2))}
//    if (keyboard.a && keyboard.s) {player1.acceleration = new Vec2(-1/Math.sqrt(2),  1/Math.sqrt(2))}
//	if (keyboard.d && keyboard.a) {player1.acceleration.x = 0;}
//	if (keyboard.w && keyboard.s) {player1.acceleration.y = 0;}
//
//	// stops all acceleration if all movement keys are not pressed
//	if (!keyboard.s && !keyboard.w && !keyboard.a && !keyboard.d) {
//		player1.acceleration = new Vec2(0, 0);
//	}
//
//
//	player1.acceleration = player1.acceleration.mul(4);
//	player1.velocity = player1.velocity.deltaTimeAdd(player1.acceleration);
//
//	
//	
//	
//	
//	friction(player1);
//	
//	
//	// calculating new position
//	player1.position = player1.position.add(player1.velocity);
//	player1.position = player1.position.add(player1.velocity);
//	
//	
//	rectangle(
//		player1.position.x,
//		player1.position.y,
//		player1.width,
//		player1.hight,
//		"red"
//		);
//	}
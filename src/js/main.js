let timeLastFrame = Date.now();
let deltatime = 0;


//proportionally reduces velocity to simulate friction
function friction(object) {
    object.velocity = object.velocity.deltaTimeAdd(object.velocity.multiply(-2));
}

//gets the number of pixels two objects have moved into each other between frames
function getPentrationDepth(object1, object2) {
    let Distance = distance(object1.position.x, object1.position.y, object2.position.x, object2.position.y);
    if (Distance <= object1.radius + object2.radius) {
        return object1.radius + object2.radius - Distance;
    } else {return 0}
}

//moves the two objects away from each other along the collision normal so they no longer overlap
function overlapOffset(object1, object2) {
    let distanceVector = object1.position.substraction(object2.position);
    let penetrationRes = distanceVector.normalise().multiply(getPentrationDepth(object1, object2)/(object1.inverseMass + object2.inverseMass));
    object1.position = object1.position.add(penetrationRes.multiply(object1.inverseMass));
    object2.position = object2.position.add(penetrationRes.multiply(-object2.inverseMass));
}

//function skapad av markus
function distanceToLineSegment(p1, p2, q, returnPoint) {
	let u = p2.substraction(p1);
	let v = q.substraction(p1);

	let dotProduct = Vector.dot(u, v);
	let uLengthSquared = Vector.dot(u, u);
	let t = dotProduct / uLengthSquared;

    if(returnPoint == false) {
        if (t < 0) {
            return q.substraction(p1).magnitude();
        } else if (t > 1) {
            return q.substraction(p2).magnitude();
        } else {
            let projection = p1.add(u.multiply(t));
            return q.substraction(projection).magnitude();
        }
    } else if (returnPoint == true) {
        if (t < 0) {
            return p1
        } else if (t > 1) {
            return p2;
        } else {
            return p1.add(u.multiply(t));
        }
    }
	
}

//simulates elastic collision
function elasticCollision(object1, object2) {

    //checks if the collision is between two balls
    if (object1 instanceof Ball && object2 instanceof Ball) {
        let distanceVector = object1.position.substraction(object2.position);
        if (distanceVector.magnitude() <= object1.radius + object2.radius) {

            //avoids dividing 0 in the overlap function and calls it
            if (getPentrationDepth(object1, object2) != 0) {
                overlapOffset(object1, object2);
            }

            //gets the dot product of the balls velocity along the normal of the collision and swaps them between the balls 
            let relativeVelocity = object1.velocity.substraction(object2.velocity);
            let seperatingVelocity = Vector.dot(relativeVelocity, distanceVector.normalise());
            let new_seperatingVelocity = -seperatingVelocity;

            //taking mass into the ecvation
            let seperatingVelocityDiffrence = new_seperatingVelocity - seperatingVelocity;
            let impulse = seperatingVelocityDiffrence/(object1.inverseMass + object2.inverseMass);
            let impulseVector = distanceVector.normalise().multiply(impulse);

            object1.velocity = object1.velocity.add(impulseVector.multiply(object1.inverseMass));
            object2.velocity = object2.velocity.add(impulseVector.multiply(-object2.inverseMass));
        }
    } else if (object1 instanceof Ball && object2 instanceof Wall) {
        let penetrationDepth = distanceToLineSegment(object2.pos1, object2.pos2, object1.position, false)
        if (penetrationDepth < object1.radius + object2.thickness) {
            let distanceVector = object1.position.substraction(distanceToLineSegment(object2.pos1, object2.pos2, object1.position, true))
            let penetrationRes = distanceVector.normalise().multiply(object1.radius + object2.thickness - penetrationDepth)
            object1.position = object1.position.add(penetrationRes);
        }


    }
}

//a class representing vectors and adds functions for vector operations
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    substraction(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    magnitude() {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    multiply(multiplyer) {
        return new Vector(this.x * multiplyer, this.y * multiplyer);
    }

    pow(exponent) {
        return new Vector(this.x ** exponent, this.y ** exponent)
    }

    normalise() {
        if (this.magnitude() === 0) { 
            return new Vector(0, 0);
        } else {
            return new Vector(this.x/this.magnitude(), this.y/this.magnitude());
        }
    }
                
    //displayes the vector from a costom origo for trubbleshooting purposes
    displayVector(pos_x, pos_y, multiplyer, thickness, color) {
        line(pos_x, pos_y, pos_x + this.x* multiplyer, pos_y + this.y* multiplyer, thickness, color);
    }

    //gets the dot product
    static dot(vector1, vector2){
        return vector1.x*vector2.x + vector1.y*vector2.y;
    }

    //adds to vectors but takes deltaTime into a count
    deltaTimeAdd(vector) {
        return new Vector(this.x + vector.x * deltatime, this.y + vector.y * deltatime);
    }

}

class Ball {
    constructor(x, y, radius, mass) {
        this.position = new Vector(x, y);
        this.radius = radius;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
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
        this.acceleration = new Vector(0, 0);
        if (keyboard.w && this.velocity.y > -this.maxspeed) {this.acceleration.y = -1}
        if (keyboard.s && this.velocity.y <  this.maxspeed) {this.acceleration.y =  1}
        if (keyboard.d && this.velocity.x <  this.maxspeed) {this.acceleration.x =  1}
        if (keyboard.a && this.velocity.x > -this.maxspeed) {this.acceleration.x = -1}

        if (keyboard.w && keyboard.s) {this.acceleration.y = 0}
        if (keyboard.d && keyboard.a) {this.acceleration.x = 0}

        //fixes the issue of the magnitude going over maxspeed in non cardinal directions by normalising the vectors
        this.acceleration = this.acceleration.normalise();
        this.acceleration = this.acceleration.multiply(this.accelerationConstant); //multiplying the acceleration direction with the amount to accelerate
        this.velocity = this.velocity.add(this.acceleration);

        //stops velocity from going over max speed
        if (this.velocity.magnitude() > this.maxspeed) {
            this.velocity = this.velocity.normalise().multiply(this.maxspeed);
        }
    }
}


class Square {
    constructor(x, y, hight, width, angle) {
        this.position = new Vector(x, y);
        this.angle = angle;
        this.radians = this.angle * Math.PI / 180;
        this.velocity = new Vector(0, 0)

        //uses trig rotation och the hight and width to calculate the 4 corners 
        this.tempP1 = new Vector(-width/2, hight/2)
        this.tempP2 = new Vector(width/2, hight/2)
        this.tempP3 = new Vector(-width/2, -hight/2)
        this.tempP4 = new Vector(width/2, -hight/2)

        this.p1 = this.position.add(new Vector(this.tempP1.x * Math.cos(this.radians) - this.tempP1.y * Math.sin(this.radians), this.tempP1.x * Math.sin(this.radians) + this.tempP1.y * Math.cos(this.radians)))
        this.p2 = this.position.add(new Vector(this.tempP2.x * Math.cos(this.radians) - this.tempP2.y * Math.sin(this.radians), this.tempP2.x * Math.sin(this.radians) + this.tempP2.y * Math.cos(this.radians)))
        this.p3 = this.position.add(new Vector(this.tempP3.x * Math.cos(this.radians) - this.tempP3.y * Math.sin(this.radians), this.tempP3.x * Math.sin(this.radians) + this.tempP3.y * Math.cos(this.radians)))
        this.p4 = this.position.add(new Vector(this.tempP4.x * Math.cos(this.radians) - this.tempP4.y * Math.sin(this.radians), this.tempP4.x * Math.sin(this.radians) + this.tempP4.y * Math.cos(this.radians)))
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
        this.p1 = this.position.add(new Vector(this.tempP1.x * Math.cos(this.radians) - this.tempP1.y * Math.sin(this.radians), this.tempP1.x * Math.sin(this.radians) + this.tempP1.y * Math.cos(this.radians)))
        this.p2 = this.position.add(new Vector(this.tempP2.x * Math.cos(this.radians) - this.tempP2.y * Math.sin(this.radians), this.tempP2.x * Math.sin(this.radians) + this.tempP2.y * Math.cos(this.radians)))
        this.p3 = this.position.add(new Vector(this.tempP3.x * Math.cos(this.radians) - this.tempP3.y * Math.sin(this.radians), this.tempP3.x * Math.sin(this.radians) + this.tempP3.y * Math.cos(this.radians)))
        this.p4 = this.position.add(new Vector(this.tempP4.x * Math.cos(this.radians) - this.tempP4.y * Math.sin(this.radians), this.tempP4.x * Math.sin(this.radians) + this.tempP4.y * Math.cos(this.radians)))
        
    }

    updatePosition() {
        //updates the position acording to velocity
        this.position = this.position.add(this.velocity)
    }

    //automaticaly calls all physics related functions for easier integration
    simulate() {
        this.rotation()

        this.updatePosition()

        friction(this)
    }

}

class Wall {
    constructor(x1, y1, x2, y2, mass, thickness) {
        this.pos1 = new Vector(x1, y1)
        this.pos2 = new Vector(x2, y2)
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

//ball one
let ball1 = new Ball(300, 400, 40, 10);

//ball two
let ball2 = new Ball(600, 400, 40, 7);

let wall1 = new Wall(200, 300, 200, 500, 0, 3 )

let box1 = new Square(300, 600, 100, 100, 0)


function update() {
    clearScreen();
    deltatime = (Date.now() - timeLastFrame)/1000;
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

    box1.draw();

    box1.angle += 1;
    box1.simulate();
}
        
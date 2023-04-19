//proportionally reduces velocity to simulate friction
function friction(object) {
    object.velocity = object.velocity.deltaTimeAdd(object.velocity.mul(-4));
}

//gets the number of pixels two objects have moved into each other between frames
function getPentrationDepth(object1, object2, distance) {
    if (distance <= object1.radius + object2.radius) {
        return object1.radius + object2.radius - distance;
    } else {return 0}
}

//moves the two objects away from each other along the collision normal so they no longer overlap
function overlapOffset(object1, object2) {
    let distanceVector = object1.position.sub(object2.position);
    let penetrationRes = distanceVector.normalise().mul(getPentrationDepth(object1, object2, distanceVector.magnitude())/(object1.inverseMass + object2.inverseMass));
    object1.position = object1.position.add(penetrationRes.mul(object1.inverseMass));
    object2.position = object2.position.add(penetrationRes.mul(-object2.inverseMass));
}

//function skapad av Marcus
function distanceToLineSegment(p1, p2, q, returnPoint) {
	let u = p2.sub(p1);
	let v = q.sub(p1);

	let dotProduct = u.dot(v);
	let uLengthSquared = u.dot(u);
	let t = dotProduct / uLengthSquared;

    if(returnPoint == false) {
        if (t < 0) {
            return q.sub(p1).magnitude();
        } else if (t > 1) {
            return q.sub(p2).magnitude();
        } else {
            let projection = p1.add(u.mul(t));
            return q.sub(projection).magnitude();
        }
    } else if (returnPoint == true) {
        if (t < 0) {
            return p1
        } else if (t > 1) {
            return p2;
        } else {
            return p1.add(u.mul(t));
        }
    }
}

function closestPointsOnLineSegments(l1, l2) {
    let shortestDistance = distanceToLineSegment(l2.pos1, l2.pos2, l1.pos1, true).sub(l1.pos1).magnitude();
    let closestPoints = [l1.pos1, distanceToLineSegment(l2.pos1, l2.pos2,l1.pos1, true)];
    if (distanceToLineSegment(l2.pos1, l2.pos2, l1.pos2, true).sub(l1.pos2).magnitude() < shortestDistance) {
        shortestDistance = distanceToLineSegment(l2.pos1, l2.pos2, l1.pos2, true).sub(l1.pos2).magnitude()
        closestPoints = [l1.pos2, distanceToLineSegment(l2.pos1, l2.pos2, l1.pos2, true)]
    }
    if (distanceToLineSegment(l1.pos1, l1.pos2, l2.pos1, true).sub(l2.pos1).magnitude() < shortestDistance) {
        shortestDistance = distanceToLineSegment(l1.pos1, l1.pos2, l2.pos1, true).sub(l2.pos1).magnitude()
        closestPoints = [distanceToLineSegment(l1.pos1, l1.pos2, l2.pos1, true), l2.pos1]
    }
    if (distanceToLineSegment(l1.pos1, l1.pos2, l2.pos2, true).sub(l2.pos2).magnitude() < shortestDistance) {
        shortestDistance = distanceToLineSegment(l1.pos1, l1.pos2, l2.pos2, true).sub(l2.pos2).magnitude()
        closestPoints = [distanceToLineSegment(l1.pos1, l1.pos2, l2.pos2, true), l2.pos2]
    }
    line(ctx, closestPoints[0], closestPoints[1], 1, "red")
    return closestPoints;
}

// Will need updating to new way of organising vertices and lines
function findClosestLine(lineList, q) {
	let closestDistance = Infinity;
	for (let i = 0; i < lineList.length; i++) {
		let p1 = lineList[i][0];
		let p2 = lineList[i][1];
		let distance = distanceToLineSegment(p1, p2, q, false);
		closestDistance = Math.min(closestDistance, distance);
	}
	return closestDistance;
}

function rayMarch(camera, rayDirection, maxSteps, stepSize) {
	let position = camera;
	for (let i = 0; i < maxSteps; i++) {
		let distanceToScene = findClosestLine(lineList, position);
		if (distanceToScene < stepSize) {
			return position;
		}
		position = position.add(rayDirection.mul(distanceToScene));
	}
	return null;
}

function tringle(A, B, C, color){
    let tringle = new Path2D();
    tringle.moveTo(A.x, A.y);
    tringle.lineTo(B.x, B.y);
    tringle.lineTo(C.x, C.y);
    tringle.closePath();

    ctx.fillStyle = color;
    ctx.fill(tringle)
}
function circle(ctx, vec, radius, color) {
    let circle = new Path2D();
    circle.arc(vec.x, vec.y, radius, 0, Math.PI*2, true);
    circle.closePath();

    ctx.fillStyle = color;
    ctx.fill(circle);
}
function line(ctx, vec1, vec2, thickness, color) {
    ctx.beginPath();
    ctx.moveTo(vec1.x, vec1.y);
    ctx.lineTo(vec2.x, vec2.y);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function shadow(A, B, Q){
    let C = A.sub(Q).normalise().mul(60000).add(Q);
    let D = B.sub(Q).normalise().mul(60000).add(Q);
    tringle(A, B, C, "hsla(1, 0%, 4%, 1)");
    tringle(B, C, D, "hsla(1, 0%, 4%, 1)");
};

//simulates elastic collision
function Collision(object1, object2){
    //checks if the collision is between two balls
    if (object1 instanceof Ball && object2 instanceof Ball) {
        let distanceVector = object1.position.sub(object2.position);
        if (distanceVector.magnitude() <= object1.radius + object2.radius) {

            //avoids dividing 0 in the overlap function and calls it
            if (getPentrationDepth(object1, object2, distanceVector.magnitude()) != 0) {
                overlapOffset(object1, object2);
            }

            //gets the dot product of the balls velocity along the normal of the collision and swaps them between the balls 
            let relativeVelocity = object1.velocity.sub(object2.velocity);
            let seperatingVelocity = relativeVelocity.dot(distanceVector.normalise());
            let new_seperatingVelocity = -seperatingVelocity;

            //taking mass into the ecvation
            let seperatingVelocityDiffrence = new_seperatingVelocity - seperatingVelocity;
            let impulse = seperatingVelocityDiffrence/(object1.inverseMass + object2.inverseMass);
            let impulseVector = distanceVector.normalise().mul(impulse);

            object1.velocity = object1.velocity.add(impulseVector.mul(object1.inverseMass));
            object2.velocity = object2.velocity.add(impulseVector.mul(-object2.inverseMass));
        }
    } else if (object1 instanceof Ball && object2 instanceof Wall) {
        let distanceVector = object1.position.sub(distanceToLineSegment(object2.pos1, object2.pos2, object1.position, true))
        let penetrationDepth = distanceToLineSegment(object2.pos1, object2.pos2, object1.position, false)
        if (penetrationDepth < object1.radius + (object2.thickness/2)) {
            //provents clipping by moving the ball out of the wall
            let penetrationRes = distanceVector.normalise().mul(object1.radius + (object2.thickness/2) - penetrationDepth)
            object1.position = object1.position.add(penetrationRes);

            //reverses velocity of the ball along the collision normal
            let seperatingVelocity = object1.velocity.dot(distanceVector.normalise());
            let new_seperatingVelocity = -seperatingVelocity;
            let seperatingVelocityDiffrence = seperatingVelocity - new_seperatingVelocity;
            object1.velocity =  object1.velocity.add(distanceVector.normalise().mul(-seperatingVelocityDiffrence));
        }
    } else if (object1 instanceof Line && object2 instanceof Line) {
        let closestPoints = closestPointsOnLineSegments(object1, object2);
        let distanceVector = closestPoints[0].sub(closestPoints[1]);
        if (object1.thickness + object2.thickness >= distanceVector.magnitude()) {
            //provents clipping by moving the lines out of eachother
            let penetrationDepth = object1.thickness + object2.thickness - distanceVector.magnitude();
            let penetrationRes = distanceVector.normalise().mul(penetrationDepth / (object1.inverseMass + object2.inverseMass))
            object1.absoPos = object1.absoPos.add(penetrationRes.mul(object1.inverseMass))
            object2.absoPos = object2.absoPos.add(penetrationRes.mul(-object2.inverseMass))

            //calculating closing velocity
            let collisionArm1 = closestPoints[0].sub(object1.absoPos).add(distanceVector.normalise().mul(object1.thickness));
            let rotationalVelocity1 = new Vec2(-object1.rotVelocity * collisionArm1.y, object1.rotVelocity * collisionArm1.x);
            let closingVelocity1 = object1.velocity.add(rotationalVelocity1);
            let collisionArm2 = closestPoints[1].sub(object2.absoPos).add(distanceVector.normalise().mul(-object2.thickness));
            let rotationalVelocity2 = new Vec2(-object2.rotVelocity * collisionArm2.y, object2.rotVelocity * collisionArm2.x);
            let closingVelocity2 = object2.velocity.add(rotationalVelocity2);

            //relative velocity of closing velocitys
            let impulseAugmentation1 = collisionArm1.cross(distanceVector.normalise())
            impulseAugmentation1 = impulseAugmentation1 * object1.inverseInertia * impulseAugmentation1
            let impulseAugmentation2 = collisionArm2.cross(distanceVector.normalise())
            impulseAugmentation2 = impulseAugmentation2 * object2.inverseInertia * impulseAugmentation2

            //gets the dot product of the lines velocity along the normal of the collision and swaps them between the balls 
            let relativeVelocity = object1.velocity.sub(object2.velocity);
            let seperatingVelocity = relativeVelocity.dot(distanceVector.normalise());
            let new_seperatingVelocity = -seperatingVelocity;

            //taking mass into the ecvation
            let seperatingVelocityDiffrence = new_seperatingVelocity - seperatingVelocity;
            let impulse = seperatingVelocityDiffrence/(object1.inverseMass + object2.inverseMass + impulseAugmentation1 + impulseAugmentation2);
            let impulseVector = distanceVector.normalise().mul(impulse);

            //calculating linier and rotational velocitys
            object1.velocity = object1.velocity.add(impulseVector.mul(object1.inverseMass));
            object2.velocity = object2.velocity.add(impulseVector.mul(-object2.inverseMass));

            object1.rotVelocity += object1.inverseInertia * collisionArm1.cross(impulseVector);
            object2.rotVelocity -= object2.inverseInertia * collisionArm2.cross(impulseVector);
        }
    } else if (object1 instanceof Ball && object2 instanceof Line) {
        let closestPoints = [object1.position, distanceToLineSegment(object2.pos1, object2.pos2, object1.position, true)];
        let distanceVector = closestPoints[0].sub(closestPoints[1]);
        if (object1.radius + object2.thickness >= distanceVector.magnitude()) {
            //provents clipping by moving the lines out of eachother
            let penetrationDepth = object1.radius + object2.thickness - distanceVector.magnitude();
            let penetrationRes = distanceVector.normalise().mul(penetrationDepth / (object1.inverseMass + object2.inverseMass))
            object1.position = object1.position.add(penetrationRes.mul(object1.inverseMass))
            object2.absoPos = object2.absoPos.add(penetrationRes.mul(-object2.inverseMass))

            //calculating closing velocity
            let collisionArm1 = closestPoints[0].sub(object1.position).add(distanceVector.normalise().mul(object1.radius));
            let rotationalVelocity1 = new Vec2(-object1.rotVelocity * collisionArm1.y, object1.rotVelocity * collisionArm1.x);
            let closingVelocity1 = object1.velocity.add(rotationalVelocity1);
            let collisionArm2 = closestPoints[1].sub(object2.absoPos).add(distanceVector.normalise().mul(-object2.thickness));
            let rotationalVelocity2 = new Vec2(-object2.rotVelocity * collisionArm2.y, object2.rotVelocity * collisionArm2.x);
            let closingVelocity2 = object2.velocity.add(rotationalVelocity2);

            //relative velocity of closing velocitys
            let impulseAugmentation1 = collisionArm1.cross(distanceVector.normalise())
            impulseAugmentation1 = impulseAugmentation1 * object1.inverseInertia * impulseAugmentation1
            let impulseAugmentation2 = collisionArm2.cross(distanceVector.normalise())
            impulseAugmentation2 = impulseAugmentation2 * object2.inverseInertia * impulseAugmentation2

            //gets the dot product of the lines velocity along the normal of the collision and swaps them between the balls 
            let relativeVelocity = object1.velocity.sub(object2.velocity);
            let seperatingVelocity = relativeVelocity.dot(distanceVector.normalise());
            let new_seperatingVelocity = -seperatingVelocity;

            //taking mass into the ecvation
            let seperatingVelocityDiffrence = new_seperatingVelocity - seperatingVelocity;
            let impulse = seperatingVelocityDiffrence/(object1.inverseMass + object2.inverseMass + impulseAugmentation1 + impulseAugmentation2);
            let impulseVector = distanceVector.normalise().mul(impulse);

            
            //calculating linier and rotational velocitys
            object1.velocity = object1.velocity.add(impulseVector.mul(object1.inverseMass));
            object2.velocity = object2.velocity.add(impulseVector.mul(-object2.inverseMass));

            //object1.rotVelocity += object1.inverseInertia * collisionArm1.cross(impulseVector);
            object2.rotVelocity -= object2.inverseInertia * collisionArm2.cross(impulseVector);
            console.log(impulseVector);
        }
    }
}

//creates a rotational matrix to ratate points in a euclidian space, aka trig rotation
function rotateMatrix(radians) {
    let matrix = new matrices(2, 2)
    matrix.data[0][0] = Math.cos(radians)
    matrix.data[0][1] = -Math.sin(radians)
    matrix.data[1][0] = Math.sin(radians)
    matrix.data[1][1] = Math.cos(radians)
    return matrix
}

// imported from advanced.js
function RoboroKeyboard()
{
  var env = this;

  this.verbose = false;

  this.keysDown = 0;
  
  this.names =
  {
    38: "up",
    40: "down",
    37: "left",
    39: "right",
    32: "space",
    16: "shift",
    18: "alt",
    17: "ctrl",
    13: "enter",
    48: "zero",
    49: "one",
    50: "two",
    51: "three",
    52: "four",
    53: "five",
    54: "six",
    55: "seven",
    56: "eight",
    57: "nine",
    65: "a",
    66: "b",
    67: "c",
    68: "d",
    69: "e",
    70: "f",
    71: "g",
    72: "h",
    73: "i",
    74: "j",
    75: "k",
    76: "l",
    77: "m",
    78: "n",
    79: "o",
    80: "p",
    81: "q",
    82: "r",
    83: "s",
    84: "t",
    85: "u",
    86: "v",
    87: "w",
    88: "x",
    89: "y",
    90: "z"
  };
  
  for (var code in this.names)
    this[this.names[code]] = false;
  
  document.onkeydown = function(event)
  {
    if (! env[event.keyCode])
      env.keysDown++;

    if (env.names[event.keyCode] !== undefined)
      env[env.names[event.keyCode]] = true;
    env[event.keyCode] = true;

    if (env.verbose)
      alert(event.keyCode);
  };
  
  document.onkeyup = function(event)
  {
    if (env.names[event.keyCode] !== undefined)
      env[env.names[event.keyCode]] = false;
    env[event.keyCode] = false;

    env.keysDown--;
  };
}

function renderScene(pollygons, pov){

    let directionsUnit = new Vec2(mouseX,mouseY);
    directionsUnit = directionsUnit.sub(player.position).normalise().mul(player.radius)



    let front = player.position.add(directionsUnit),
    left = player.position.add(new Vec2(directionsUnit.y, directionsUnit.x * -1)),
    right = player.position.add(new Vec2(directionsUnit.y, directionsUnit.x)),
    back = player.position.add(directionsUnit.mul(-1)),
    fr = front.add(right).normalise().mul(player.radius).add(player.position),
    fl = front.add(left).normalise().mul(player.radius).add(player.position),
    br = back.add(right).normalise().mul(player.radius).add(player.position),
    bl = back.add(left).normalise().mul(player.radius).add(player.position);


    if (pov === true){
        let frontGradient = ctx.createRadialGradient(front.x, front.y, player.radius, front.x, front.y, player.lightRadius);
        frontGradient.addColorStop(0, "hsla(1, 100%, 100%, 0.1)");
        frontGradient.addColorStop(1, "hsla(0, 100%, 0%, 0)");
        let leftGradient = ctx.createRadialGradient(left.x,left.y,player.radius,left.x,left.y,player.lightRadius);
        leftGradient.addColorStop(0, "hsla(1, 100%, 100%, 0.1)");
        leftGradient.addColorStop(1, "hsla(0, 100%, 0%, 0)");
        let rightGradient = ctx.createRadialGradient(right.x,right.y,player.radius,right.x,right.y,player.lightRadius);
        rightGradient.addColorStop(0, "hsla(1, 100%, 100%, 0.1)");
        rightGradient.addColorStop(1, "hsla(0, 100%, 0%, 0)");
        let backGradient = ctx.createRadialGradient(back.x,back.y,player.radius,back.x,back.y,player.lightRadius);
        backGradient.addColorStop(0, "hsla(1, 100%, 100%, 0.1)");
        backGradient.addColorStop(1, "hsla(0, 100%, 0%, 0)");
        

        ctx.fillStyle = frontGradient;
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = leftGradient;
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = rightGradient;
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = backGradient;
        ctx.fillRect(0,0, canvas.width, canvas.height);

        for (projectile in projectiles){
            let lazerGradient = ctx.createRadialGradient(projectiles[projectile].position.x, 
                projectiles[projectile].position.y, 0, 
                projectiles[projectile].position.x, 
                projectiles[projectile].position.y, 400);
                lazerGradient.addColorStop(0, "hsla(1, 100%, 100%, 0.2)");
                lazerGradient.addColorStop(1, "hsla(0, 100%, 0%, 0)");
    
                ctx.fillStyle = lazerGradient;
                ctx.fillRect(0,0, canvas.width, canvas.height);
            }

        for (shape in pollygons){

            shadow(pollygons[shape][0], pollygons[shape][pollygons[shape].length -1], front);
            shadow(pollygons[shape][0], pollygons[shape][pollygons[shape].length -1], left);
            shadow(pollygons[shape][0], pollygons[shape][pollygons[shape].length -1], right);
            shadow(pollygons[shape][0], pollygons[shape][pollygons[shape].length -1], back);
            shadow(pollygons[shape][0], pollygons[shape][pollygons[shape].length -1], fr);
            shadow(pollygons[shape][0], pollygons[shape][pollygons[shape].length -1], fl);
            shadow(pollygons[shape][0], pollygons[shape][pollygons[shape].length -1], br);
            shadow(pollygons[shape][0], pollygons[shape][pollygons[shape].length -1], bl);

            let shapeOutline = new Path2D();
            shapeOutline.moveTo(pollygons[shape][0].x,pollygons[shape][0].y);

            for (let i = 0; i < pollygons[shape].length-1; i++){

                shapeOutline.lineTo(
                    pollygons[shape][i+1].x,
                    pollygons[shape][i+1].y
                );

                shadow(pollygons[shape][i], pollygons[shape][i+1], front);
                shadow(pollygons[shape][i], pollygons[shape][i+1], left);
                shadow(pollygons[shape][i], pollygons[shape][i+1], right)
                shadow(pollygons[shape][i], pollygons[shape][i+1], back);
                shadow(pollygons[shape][i], pollygons[shape][i+1], fr);
                shadow(pollygons[shape][i], pollygons[shape][i+1], fl);
                shadow(pollygons[shape][i], pollygons[shape][i+1], br)
                shadow(pollygons[shape][i], pollygons[shape][i+1], bl);
            };

            shapeOutline.closePath();

            ctx.fillStyle = "hsla(0, 0%, 7%, 1)";
            ctx.fill(shapeOutline);

        };
    } else {
        let frontGradient = ctx.createRadialGradient(player.position.x, player.position.y, player.radius, player.position.x, player.position.y, player.lightRadius + 200);
        frontGradient.addColorStop(0, "hsla(1, 100%, 100%, 0.3)");
        frontGradient.addColorStop(1, "hsla(0, 100%, 0%, 0)");

        ctx.fillStyle = frontGradient;
        let fovTriangel = new Path2D();
        fovTriangel.moveTo(player.position.x, player.position.y)
        fovTriangel.lineTo(
            directionsUnit.mul(40).add(player.position).add(new Vec2(directionsUnit.y, directionsUnit.x * -1).mul(40)).x, 
            directionsUnit.mul(40).add(player.position).add(new Vec2(directionsUnit.y, directionsUnit.x * -1).mul(60)).y
        )
        fovTriangel.lineTo(
            directionsUnit.mul(40).add(player.position).add(new Vec2(directionsUnit.y * -1, directionsUnit.x).mul(40)).x, 
            directionsUnit.mul(40).add(player.position).add(new Vec2(directionsUnit.y * -1, directionsUnit.x).mul(60)).y
        )
        fovTriangel.closePath()
        ctx.fill(fovTriangel)

        for (projectile in projectiles){
            let lazerGradient = ctx.createRadialGradient(projectiles[projectile].position.x, 
            projectiles[projectile].position.y, 0, 
            projectiles[projectile].position.x, 
            projectiles[projectile].position.y, 400);
            lazerGradient.addColorStop(0, "hsla(1, 100%, 100%, 0.2)");
            lazerGradient.addColorStop(1, "hsla(0, 100%, 0%, 0)");

            ctx.fillStyle = lazerGradient;
            ctx.fillRect(0,0, canvas.width, canvas.height);
        }

        for (projectile in projectiles){
            projectiles[projectile].position = projectiles[projectile].position.add(projectiles[projectile].direction)
            ctx.beginPath();
            ctx.moveTo(
                projectiles[projectile].position.add(projectiles[projectile].direction.mul(-1)).x,
                projectiles[projectile].position.add(projectiles[projectile].direction.mul(-1)).y
            );
            ctx.lineTo(
                projectiles[projectile].position.add(projectiles[projectile].direction.mul(1)).x,
                projectiles[projectile].position.add(projectiles[projectile].direction.mul(1)).y
            );
            ctx.lineWidth = 3;
            ctx.strokeStyle = "red";
            ctx.stroke();
        };

        for (shape in pollygons){
            let shapeOutline = new Path2D();
            shapeOutline.moveTo(pollygons[shape][0].x,pollygons[shape][0].y);

            for (let i = 0; i < pollygons[shape].length-1; i++){
                shapeOutline.lineTo(
                    pollygons[shape][i+1].x,
                    pollygons[shape][i+1].y
                );
            }
            
            shapeOutline.closePath();

            ctx.fillStyle = "hsla(0, 0%, 10%, 1)";
            ctx.fill(shapeOutline);
        };
        

        for (shape in pollygons){
            shadow(pollygons[shape][0], pollygons[shape][pollygons[shape].length -1], player.position);
            for (let i = 0; i < pollygons[shape].length-1; i++){
                shadow(pollygons[shape][i], pollygons[shape][i+1], player.position);
            };
        };
    };
    // draw all seprate objects with all the light sources
};

function togglePause(){
    isRunning = !isRunning;

    if (isRunning) update()
}
function togglePauseMenu(){
    let menu = document.getElementById("pauseMenu")
    if (menu.style.display == "none")menu.style.display = "flex"
    else if (menu.style.display == "flex")menu.style.display = "none"

}
function showFPS(){
    ctx.fillStyle = "White";
    ctx.font      = "normal 16pt Arial";

    ctx.fillText(Math.round(fps) + " fps", 10, 26);
}

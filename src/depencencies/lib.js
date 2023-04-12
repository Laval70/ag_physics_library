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
function circle(ctx, x, y, radius, color) {
    let circle = new Path2D();
    circle.arc(x, y, radius, 0, Math.PI*2, true);
    circle.closePath();

    ctx.fillStyle = color;
    ctx.fill(circle);
}

function shadow(A, B, Q){
    let C = A.sub(Q).normalise().mul(60000).add(Q);
    let D = B.sub(Q).normalise().mul(60000).add(Q);
    tringle(A, B, C, "hsla(1, 0%, 4%, 0.65)");
    tringle(B, C, D, "hsla(1, 0%, 4%, 0.65)");
};

//simulates elastic collision
function elasticCollision(object1, object2){
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
        let penetrationDepth = distanceToLineSegment(object2.pos1, object2.pos2, object1.position, false)
        if (penetrationDepth < object1.radius + object2.thickness) {
            let distanceVector = object1.position.sub(distanceToLineSegment(object2.pos1, object2.pos2, object1.position, true))
            let penetrationRes = distanceVector.normalise().mul(object1.radius + object2.thickness - penetrationDepth)
            object1.position = object1.position.add(penetrationRes);
        }
    }
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
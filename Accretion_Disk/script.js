const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
context.translate(canvas.width / 2, canvas.height / 2);
context.scale(1, -1);
var left = -canvas.width / 2;
var right = canvas.width / 2;
var top = canvas.height / 2;
var bottom = -canvas.height / 2;

const type1 = document.getElementById("type1");
type1.addEventListener("click", function() {
	clearInterval(time);
	typeOne();
})

const type2 = document.getElementById("type2");
type2.addEventListener("click", function() {
	clearInterval(time);
	typeTwo();
})

const pauseButton = document.getElementById("pause");
pauseButton.addEventListener("click", function() {
	if (rate == 0) {
  	rate = 20;
    pauseButton.innerHTML = "Pause";
  } else {
  	rate = 0;
    pauseButton.innerHTML = "Play";
  }
})

function randint(min, max) {
  return Math.floor(Math.random() * ((max) - (min) + 1)) + (min);
}

function negOrPos() {
  return [-1, 1][randint(0, 1)];
}

function mag(vector) {
  return Math.pow((Math.pow(vector[0], 2) + Math.pow(vector[1], 2)), 0.5);
}

function gravitate(object, subject) {
  var rel_pos = [object.pos[0] - subject.pos[0], object.pos[1] - subject.pos[1]];
  var sep = Math.pow((Math.pow(rel_pos[0], 2) + Math.pow(rel_pos[1], 2)), 0.5);
  var aMag = ((G * subject.mass) / Math.pow(sep, 2));
  var aX = -1 * aMag * (rel_pos[0] / sep);
  var aY = -1 * aMag * (rel_pos[1] / sep);
  return [aX, aY];
}

function update_vecs(object, a) {
  object.velocity[0] += a[0];
  object.velocity[1] += a[1];
  object.pos[0] += object.velocity[0];
  object.pos[1] += object.velocity[1];
}

function putInOrbit(object, orbiting) {
	let r = mag(relPos(object, orbiting));
  let theta = Math.atan2(relPos(object, orbiting)[1], relPos(object, orbiting)[0]);
	let vMag = Math.pow(((G * orbiting.mass) / r), 0.5);
  object.velocity = [vMag * Math.cos(theta + (Math.PI / 2)), vMag * Math.sin(theta + (Math.PI / 2))];
}

function relPos(object, subject) {
  return [object.pos[0] - subject.pos[0], object.pos[1] - subject.pos[1]];
}

function getIndex(element, array) {
	for (z=0; z<array.length; z++) {
  	if (array[z] == element) {
    	return z;
    }
  }
}

function strike(element, array) {
	array.splice(getIndex(element, array), 1);
}

function radians(degs) {
  return degs * (Math.PI / 180);
}

function degrees(rads) {
  return rads * (180 / Math.PI);
}

function hitBox(target, threat) {
  if ((((Math.pow((target.pos[0] - threat.pos[0]), 2)) +
        (Math.pow((target.pos[1] - threat.pos[1]), 2))) <=
      Math.pow(target.size + threat.size, 2))) {
    return true;
  } else {
    return false;
  }
}

var G = 0.3
var rate = 0;
var time;
var moonNumber = moonNumberElement.value;

function typeOne() {

    let asteroids = [];
		G = 0.3;
    rate = 0;
    pauseButton.innerHTML = "Play";
    moonNumberElement.display = "block";
    moonNumber = moonNumberElement.value;
    class asteroid {
      constructor(r, theta) {
        this.pos= [r * Math.cos(radians(theta)), r * Math.sin(radians(theta))];
        this.velocity= [0, 0];
        this.mass = 0;
        this.size= 2;
        this.color= "brown";
        this.type = "rock";
        this.r = r;
        this.theta = radians(theta);
        asteroids.push(this);
        return this;
      }
      updates() {
        let rock = this;
        function orbit() {
          let aNet = [0, 0];
          let aPlanet = gravitate(rock, planet);
          aNet[0] += aPlanet[0];
          aNet[1] += aPlanet[1];
          for (let y=0; y<moons.length; y++) {
            let moon = moons[y];
            if (moon != rock) {
            	let aMoon = gravitate(rock, moon)
              aNet[0] += aMoon[0];
              aNet[1] += aMoon[1];
            }
          }
          update_vecs(rock, aNet);
        }
        orbit();
      }
    }

    let planet = {
      color: "blue",
      size: 50,
      mass: 100,
      pos: [0, 0],
      velocity: [0, 0],
    }
    let ringrange = [125,175];
    for (i=0; i<2000; i++) {
      let rock = new asteroid(randint(ringrange[0], ringrange[1]), randint(0, 359));
      putInOrbit(rock, planet);
    }
    let moons = [];
    for (i=0; i<moonNumber; i++) {
      let moon = asteroids[randint(0, asteroids.length)];
      moon.type = "moon";
      moon.mass = 1;
      moon.size = 2;
      moon.color = "white";
      moons.push(moon);
    }

     function collision(rock) {
      if (hitBox(rock, planet)) {
        strike(rock, asteroids);
        if (rock.type == "moon") {
        	strike(rock, moons);
        }
      }
      for (let y=0; y<moons.length; y++) {
        let moon = moons[y];
        let maxSize = planet.size/3;
        if (hitBox(rock, moon) && rock.type != "moon") {
          strike(rock, asteroids);
          if (moon.size < maxSize) {
            moon.size+=0.025;
          }
          moon.mass += 0.01;
        }
        else if (hitBox(rock, moon) && rock.type == "moon" && rock != moon) {
					let larger = moon;
          let smaller = rock;
          if (rock.size > moon.size) {
          	larger = rock;
            smaller = moon;
          }
          strike(moon, asteroids);
          strike(moon, moons);
          strike(rock, asteroids);
          strike(rock, moons);
          var newMoon = new asteroid((ringrange[0]+ringrange[1])/2, 0);
          newMoon.type = "moon";
      		newMoon.color = "white";
          newMoon.mass = rock.mass+moon.mass;
          newMoon.size = (rock.size + moon.size)/1.5;
      		moons.push(newMoon);
          newMoon.pos = [((moon.mass*moon.pos[0])+(rock.mass*rock.pos[0]))/newMoon.mass,
          ((moon.mass*moon.pos[1])+(rock.mass*rock.pos[1]))/newMoon.mass];
          newMoon.velocity = [((moon.mass*moon.velocity[0])+(rock.mass*rock.velocity[0]))/newMoon.mass,
          ((moon.mass*moon.velocity[1])+(rock.mass*rock.velocity[1]))/newMoon.mass];
        }
      }
    }

    time = setInterval(function() {
      context.clearRect(-canvas.width / 2, canvas.height / 2, canvas.width, -canvas.height);
      context.fillStyle = planet.color;
      context.beginPath();
      context.arc(planet.pos[0], planet.pos[1], planet.size, 0, 2 * Math.PI);
      context.fill();
      for (i=0; i<asteroids.length; i++) {
        let rock = asteroids[i];
        if (rate > 0) {
        	rock.updates();
        }
        collision(rock);
        context.fillStyle = rock.color;
        context.beginPath();
        context.arc(rock.pos[0], rock.pos[1], rock.size, 0, 2 * Math.PI);
        context.fill();
      }
    },rate)
  }

function typeTwo() {
  let asteroids = [];
	G = 0.1;
  rate = 0;
  pauseButton.innerHTML = "Play";
  moonNumberElement.display = "none";
  class asteroid {
    constructor(r, theta) {
      this.pos= [r * Math.cos(radians(theta)), r * Math.sin(radians(theta))];
      this.velocity= [0, 0];
      this.mass = 0.01;
      this.size= 2;
      this.color= "brown";
      this.r = r;
      this.theta = radians(theta);
      asteroids.push(this);
      return this;
    }
    updates() {
      let rock = this;
      function orbit() {
        let aNet = [0, 0];
        let aPlanet = gravitate(rock, planet);
        aNet[0] += aPlanet[0];
        aNet[1] += aPlanet[1];
        for (let x = 0; x < asteroids.length; x++) {
          let otherRock = asteroids[x];
          if (otherRock != rock) {
            let aRock = gravitate(rock, otherRock);
            aNet[0] += aRock[0];
            aNet[1] += aRock[1];
          }
        }
        update_vecs(rock, aNet);
      }
      orbit();
    }
  }

  let planet = {
    color: "blue",
    size: 50,
    mass: 100,
    pos: [0, 0],
    velocity: [0, 0],
  }
  let ringrange = [100,150];
  for (i=0; i<200; i++) {
    let rock = new asteroid(randint(ringrange[0], ringrange[1]), randint(0, 359));
    putInOrbit(rock, planet);
  }

   function collision(rock) {
    if (hitBox(rock, planet)) {
      strike(rock, asteroids);
    }
    for (let x = 0; x < asteroids.length; x++) {
      let otherRock = asteroids[x];
      if (otherRock != rock && hitBox(rock, otherRock)) {
        let r;
        let theta;
        if (rock.mass == otherRock.mass) {
          r = (mag(rock.pos)+mag(otherRock.pos))/2;
          theta = degrees((Math.atan2(rock.pos[1], rock.pos[0])+Math.atan2(otherRock.pos[1], otherRock.pos[0]))/2);
        } else {
          let larger;
          let smaller;
        if (rock.mass > otherRock.mass) {
          larger = rock;
          smaller = otherRock;
        } else {
          larger = otherRock;
          smaller = rock;
        }
        r = mag(larger.pos);
        theta = degrees(Math.atan2(larger.pos[1], larger.pos[0]));
      }
      let newRock = new asteroid(r, theta);
      newRock.mass = rock.mass + otherRock.mass;
      let larger;
      let smaller;
      if (rock.size > otherRock.size) {
        larger = rock;
        smaller = otherRock;
      } else {
        larger = otherRock;
        smaller = rock;
      }
      newRock.size = larger.size + 0.25;
      putInOrbit(newRock, planet); //try cons of momentum
      strike(rock, asteroids);
      strike(otherRock, asteroids);
      }
    }
  }

  time = setInterval(function() {
    context.clearRect(-canvas.width / 2, canvas.height / 2, canvas.width, -canvas.height);
    context.fillStyle = planet.color;
    context.beginPath();
    context.arc(planet.pos[0], planet.pos[1], planet.size, 0, 2 * Math.PI);
    context.fill();
    for (i=0; i<asteroids.length; i++) {
      let rock = asteroids[i];
      if (rate > 0) {
      	rock.updates();
      }
      collision(rock);
      context.fillStyle = rock.color;
      context.beginPath();
      context.arc(rock.pos[0], rock.pos[1], rock.size, 0, 2 * Math.PI);
      context.fill();
    }
  },rate)
}

typeOne()

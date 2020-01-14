const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
context.translate(canvas.width / 2, canvas.height / 2);
context.scale(1, -1);

const trajButton = document.getElementById('begin');
trajButton.addEventListener("click", trajEvent, true);

function trajEvent() {
  function firstPoint(click) {
    let x = click.clientX - canvas.offsetLeft - canvas.width / 2;
    let y = -(click.clientY - canvas.offsetTop - canvas.height / 2);
    endpoints[0] = [x, y];
    canvas.addEventListener("mousemove", secondPoint, true);
    canvas.removeEventListener("click", firstPoint, true);
  }

  function secondPoint(mousemove) {
    function finalizeTraj(click) {
      endpoints = [];
      draw();
      canvas.removeEventListener("mousemove", secondPoint, true);
      canvas.removeEventListener("click", finalizeTraj, true);
    }

    function calcVelocity() {
      let factor = 1 / 350;
      let dX = -(endpoints[0][0] - endpoints[1][0]) * factor;
      let dY = -(endpoints[0][1] - endpoints[1][1]) * factor;
      return [dX, dY];
    }
    canvas.addEventListener("click", finalizeTraj, true);
    let x = mousemove.clientX - canvas.offsetLeft - canvas.width / 2;
    let y = -(mousemove.clientY - canvas.offsetTop - canvas.height / 2);
    endpoints[1] = [x, y];
    path.pos = [endpoints[0][0], endpoints[0][1]];
    path.velocity = calcVelocity();
    path.hist = [];
    traj();
    draw();
  }
  canvas.addEventListener("click", firstPoint, true);
}

function radians(degrees) {
  return degrees * (Math.PI / 180);
}

function init_Planet(r, theta, name) {
  var planetNum = name[6];
  theta = radians(theta);
  window[name] = {
    size: 5,
    mass: 100,
    pos: [r * Math.cos(theta), r * Math.sin(theta)],
    rad: r,
    type: "world"
  };
}

function accelerate(object, subM, subPos) {
  var rel_pos = [object.pos[0] - subPos[0], object.pos[1] - subPos[1]];
  var sep = Math.pow((Math.pow(rel_pos[0], 2) + Math.pow(rel_pos[1], 2)), 0.5);
  var aMag = ((G * subM) / Math.pow(sep, 2));
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

function closest(object) {
  var res = [];
  var seps = [];
  for (i = 0; i < planetNum; i++) {
    var rel_pos = [object.pos[0] - eval("planet" + i).pos[0], object.pos[1] - eval("planet" + i).pos[1]];
    var sep = Math.pow((Math.pow(rel_pos[0], 2) + Math.pow(rel_pos[1], 2)), 0.5);
    if (object != eval("planet" + i))
      seps.push(sep);
    res.push([sep, "planet" + i]);
  }
  var near = Math.min.apply(null, seps);
  for (i = 0; i < planetNum; i++) {
    if (res[i][0] == near) {
      return res[i][1];
    }
  }
}

function draw() {
  context.clearRect(-canvas.width / 2, canvas.height / 2, canvas.width, -canvas.height);
  for (i = 0; i < planetNum; i++) {
    var planet = eval("planet" + i);
    switch (planet.type) {
      case "world":
        context.fillStyle = "blue";
        context.strokeStyle = "blue";
        context.beginPath();
        context.arc(planet.pos[0], planet.pos[1], planet.size, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.arc(0, 0, planet.rad, 0, 2 * Math.PI);
        context.stroke();
        break
      case "star":
        context.fillStyle = "yellow";
        context.beginPath();
        context.arc(planet.pos[0], planet.pos[1], planet.size, 0, 2 * Math.PI);
        context.fill();
        break
    }
  }
  context.strokeStyle = "white";
  for (i = 0; i < path.hist.length - 1; i++) {
    var now = path.hist[i];
    var next = path.hist[i + 1];
    context.beginPath();
    context.moveTo(now[0], now[1]);
    context.lineTo(next[0], next[1]);
    context.stroke();
  }
  if (endpoints.length == 2) {
    context.strokeStyle = "red";
    context.beginPath();
    context.moveTo(endpoints[0][0], endpoints[0][1]);
    context.lineTo(endpoints[1][0], endpoints[1][1]);
    context.stroke();
  }
}

function traj() {
  var left = -canvas.width / 2;
  var right = canvas.width / 2;
  var top = canvas.height / 2;
  var bottom = -canvas.height / 2;
  while (left <= path.pos[0] &&
    path.pos[0] <= right &&
    bottom <= path.pos[1] &&
    path.pos[1] <= top) {
    var aNet = [0, 0];
    for (i = 0; i < planetNum; i++) {
      var planet = eval("planet" + i);
      var a = accelerate(path, planet.mass, planet.pos);
      aNet[0] += a[0];
      aNet[1] += a[1];
    }
    update_vecs(path, aNet);
    path.hist.push([path.pos[0], path.pos[1]]);
    if (path.hist.length > 5000) {
      context.fillStyle = "red";
      context.fillRect(path.pos[0], path.pos[1], 5, 5);
      path.pos[0] = (-canvas.width / 2) - 1;
    }
    var closestObj = eval(closest(path));
    if ((((Math.pow((path.pos[0] - closestObj.pos[0]), 2)) +
          (Math.pow((path.pos[1] - closestObj.pos[1]), 2))) <=
        Math.pow(closestObj.size, 2))) {
      path.pos[0] = (-canvas.width / 2) - 1;
    }
  }
}

const G = 0.1;

var planet0 = {
  size: 20,
  mass: 1000,
  pos: [0, 0],
  rad: 0,
  type: "star"
}

var path = {
  pos: [],
  velocity: [],
  hist: []
};

var planetNum = 7; // Remember: the sun is planet 0
var endpoints = [];

for (i = 1; i < planetNum; i++) {
  var r = ((canvas.width / 2) / planetNum) * i;
  if (r < planet0.size) {
    r = 0;
  }
  var theta = Math.floor(Math.random() * 359);
  init_Planet(r, theta, "planet" + i);
}

draw();

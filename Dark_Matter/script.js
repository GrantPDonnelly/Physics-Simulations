var screen = document.getElementById('screen');
var context = screen.getContext('2d');
context.translate(screen.width/2,screen.height/2);
context.scale(1,-1);

var rotCurve = document.getElementById("rotationCurve");
var rotContext = rotCurve.getContext('2d');
rotContext.translate(0,rotCurve.height);
rotContext.scale(1,-1);

// Use G to adjust orbital speeds without changing radius or mass.
var G = 0.3;

function radians(degrees) {
  return degrees*(Math.PI/180);
};

function reqMass(radius) {
  return
};

function init_Planet(r, theta, name) {
  var planetNum = name[6];
  theta = radians(theta);
  switch(mode) {
    case "solarSystem":
      var vMag = Math.pow(((G*sun.mass)/r),0.5);
      break
    case "darkMatter":
      var vMag;
      if (r>darkMatter.radius) {
        vMag = Math.pow(((G*darkMatter.radius)/r),0.5);
      } else {
        vMag = Math.pow(((G*rads[planetNum])/r),0.5);
      };
      break
  };
  window[name] = {
    position: [r*Math.cos(theta),r*Math.sin(theta)],
    velocity: [vMag*Math.cos(theta+(Math.PI/2)), vMag*Math.sin(theta+(Math.PI/2))],
    radius: r
  };
};

function accelerate(object, subM, subPos) {
  var rel_pos = [object.position[0]-subPos[0],object.position[1]-subPos[1]];
  var sep = Math.pow((Math.pow(rel_pos[0],2)+Math.pow(rel_pos[1],2)),0.5);
  var aMag = ((G*subM)/Math.pow(sep,2));
  var aX = -1*aMag*(rel_pos[0]/sep);
  var aY = -1*aMag*(rel_pos[1]/sep);
  return [aX, aY];
};

function update_vecs(object, a) {
  object.velocity[0] += a[0];
  object.velocity[1] += a[1];
  object.position[0] += object.velocity[0];
  object.position[1] += object.velocity[1];
};

function orbit() {
  switch(mode) {
    case "solarSystem":
      context.clearRect(-screen.width/2,screen.height/2,screen.width,-screen.height);
      context.fillStyle = "yellow";
      context.beginPath();
      context.arc(0,0,sun.radius,0,2*Math.PI);
      context.fill();
      for (i=0; i<rads.length; i++) {
        var planet = eval("planet"+i)
        update_vecs(planet, accelerate(planet, sun.mass, [0,0]));
        context.fillStyle = "blue";
        context.beginPath();
        context.arc(planet.position[0],planet.position[1],3,0,2*Math.PI)
        context.fill();
      };
      break
    case "darkMatter":
      context.clearRect(-screen.width/2,screen.height/2,screen.width,-screen.height);
      context.strokeStyle = "purple";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(0,0,darkMatter.radius,0,2*Math.PI);
      context.stroke();
      for (i=0; i<rads.length; i++) {
        var planet = eval("planet"+i);
        if (planet.radius > darkMatter.radius) {
          update_vecs(planet, accelerate(planet, darkMatter.radius, [0,0]));
        } else {
          update_vecs(planet, accelerate(planet, planet.radius, [0,0]));
        };
        context.fillStyle = "blue";
        context.beginPath();
        context.arc(planet.position[0],planet.position[1],3,0,2*Math.PI)
        context.fill();
      };
  };

  rotContext.clearRect(0,0,rotCurve.width,rotCurve.height);
  rotContext.fillStyle = "blue";
  var xs = [];
  var ys = [];
  for (i=0; i<rads.length; i++) {
    var planet = eval("planet"+i);
    var V = Math.pow((Math.pow(planet.velocity[0],2)+Math.pow(planet.velocity[1],2)),0.5);
    xs.push(planet.radius);
    ys.push(V);
  };
  var xScale = ((rotCurve.width-50)/Math.max.apply(null,xs));
  var yScale = ((rotCurve.height-50)/Math.max.apply(null,ys));
  for (i=0; i<xs.length; i++) {
    rotContext.fillRect(xs[i]*xScale,
    (ys[i]*yScale), 10, 10)
  };

  if (conLines.checked == true) {
    for (i=0; i<xs.length-1; i++) {
      rotContext.strokeStyle = "blue";
      rotContext.lineWidth = 2;
      rotContext.beginPath();
      rotContext.moveTo(xs[i]*xScale+5,ys[i]*yScale+5);
      rotContext.lineTo(xs[i+1]*xScale+5,ys[i+1]*yScale+5);
      rotContext.stroke()
    };
  };

};

function reset() {
  clearInterval(time);
  for (i=0; i<rads.length; i++) {
    init_Planet(rads[i], 90, "planet"+i);
  };
  time = setInterval(orbit, rate);
};

function changeMode() {
  switch(mode) {
    case "solarSystem":
      mode = "darkMatter";
      changeMode_button.innerHTML = "Star System";
      sunMassIndex.style.display = "none";
      sliderIndex.style.display = "block";
      break
    case "darkMatter":
      mode = "solarSystem";
      changeMode_button.innerHTML = "Dark Matter"
      sunMassIndex.style.display = "block";
      sliderIndex.style.display = "none";
      break
  };
  reset();
};

//Initialize
var mode = "solarSystem";
var rads = [50, 100, 125, 150, 200, 250];

var sun = {
  mass: 1000,
  radius: 15
};

var darkMatter = {
  radius: 175,
};

for (i=0; i<rads.length; i++) {
  init_Planet(rads[i], 90, "planet"+i);
};
var rate = 20;
var time = setInterval(orbit, rate);

const reset_button = document.getElementById("resetButton");
reset_button.addEventListener("click", reset);

const sunMassIndex = document.getElementById("sunMassIndex");
const reset_check = document.getElementById("reset?");
const mass_slider = document.getElementById("massSlider");
mass_slider.oninput = function() {
  if (reset_check.checked == true) {
    reset();
    sun.mass = mass_slider.value;
  } else {
    sun.mass = mass_slider.value;
  };
};

const DM_slider = document.getElementById("DMSlider");
sliderIndex.style.display = "none";
DM_slider.oninput = function() {
  reset();
  darkMatter.radius = DM_slider.value;
};

const changeMode_button = document.getElementById("changeMode");
changeMode_button.addEventListener("click", changeMode);

const conLines = document.getElementById("lines");

/* Alternative Dark Matter Model:

function init_DarkMatter() {
  darkMatter.points = [];
  for (i=-darkMatter.radius; i<=darkMatter.radius; i+=1) {
    for (j=-darkMatter.radius; j<=darkMatter.radius; j+=1) {
      if ((Math.pow(i,2)+Math.pow(j,2))<=Math.pow(darkMatter.radius,2)) {
        var radius = Math.pow(Math.pow(i,2)+Math.pow(j,2),0.5);
        var mass = NFWProfile(radius);
        darkMatter.totalMass += mass;
        darkMatter.points.push([i,j,mass]);
      };
    };
  };
};

// For use in the orbit loop:
        //var aNet = [0,0];
        //for (j=0; j<darkMatter.points.length; j++) {
          //var a = accelerate(planet, darkMatter.points[j][2], [darkMatter.points[j][0],darkMatter.points[j][1]]);
          //aNet[0] += a[0];
          //aNet[1] += a[1];
        //};

function NFWProfile(radius) {
  var rho = 1000;
  var rs = 1;
  density = rho/(Math.pow((radius/rs)*(1+(radius/rs))),2);
  return density;
};

*/

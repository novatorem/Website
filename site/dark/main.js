/*
  Thanks to the following for help:
  https://codepen.io/noeldelgado/pen/ByxQjL
*/

var mask = document.querySelector('#svg-mask');
var circles = [];

var svgPoint = mask.createSVGPoint();

var lastCoords = [];

//fill circle array
for (var i=7; i>0; i--){
  var circle = mask.querySelector('#mask-circle'+i);
  circles.push(circle);
  circle.setAttribute('cx', window.innerWidth/2 + i * 15);
  circle.setAttribute('cy', window.innerHeight/4 + i * 5);
  lastCoords.push({
    x:circle.getAttribute('cx'),
    y:circle.getAttribute('cy')
  });
}

function cursorPoint(e) {
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    return svgPoint.matrixTransform(mask.getScreenCTM().inverse());
}

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}

function updateMask(e){
  var coords = cursorPoint(e);
  var t = 0.14;
  
  for (var i=0; i<circles.length; i++){
    var circle = circles[i];
    if (i===0){
      circle.setAttribute('cx',  coords.x);
      circle.setAttribute('cy', coords.y);
    }else{
      lastCoords[i] = {
        x:lerp(lastCoords[i].x, circle.getAttribute('cx'), 0.05),
        y:lerp(lastCoords[i].y, circle.getAttribute('cy'), 0.05)
      }

      circle.setAttribute('cx', lerp(coords.x, lastCoords[i].x, t));
      circle.setAttribute('cy', lerp(coords.y, lastCoords[i].y, t));
      t+=0.14;
    }
  }
}

function updatePerspective(e){
    var cx = Math.ceil(window.innerWidth);
    var cy = Math.ceil(window.innerHeight);
    var dx = e.pageX - cx;
    var dy = e.pageY - cy;

    var tiltx = (dy / cy) /1.5;
    var tilty = -(dx / cx) /1.2;
  
    var radius = Math.sqrt(Math.pow(tiltx, 2) + Math.pow(tilty, 2));
    degree = (radius * 20);
    transform = 'rotate3d(' + -tiltx + ', ' + -tilty + ', 0, ' + degree + 'deg)';

    document.body.style.transform = transform;
}

window.addEventListener('mousemove', function(e) {
  updateMask(e);
  updatePerspective(e);
}, false);

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var touch = e.targetTouches[0];
    if (touch) {
        updateMask(touch);
    }
}, false);



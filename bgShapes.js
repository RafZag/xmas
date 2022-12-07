import { Point2D } from './point2D.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.137.0/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'https://cdn.skypack.dev/three@0.132.0/examples/jsm/libs/stats.module.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });

/////////////// Listeners

window.addEventListener('resize', onWindowResize);

/////////////// Params

let rot = 0;
let starPoints = [];
let targetPoints = [];

const params = {
  steps: 25,
};

/////////////// GUI

const stats = new Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();
gui.add(params, 'steps', 0, 50, 1);

/////////////// Init

buildStar();
buildTargetShape();
onWindowResize();
draw();

function draw() {
  // ctx.fillStyle = '#f1f1f1';
  ctx.fillStyle = '#d20b12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  blendShapes(starPoints, targetPoints, params.steps);
  rot += 0.1;
  window.requestAnimationFrame(draw);
  stats.update();
}

function blendShapes(arr, targetArr, steps) {
  drawShape(canvas.width / 2, canvas.height / 2, rot, arr, 0);
  drawShape(canvas.width / 2, canvas.height / 2, rot, targetArr, 1);

  for (let i = 1; i < steps; i++) {
    let tmpArr = [];
    for (let j = 0; j < arr.length; j++) {
      let p = new Point2D();
      p = Point2D.interpolate(arr[j], targetArr[j], (1 / steps) * i);
      tmpArr.push(p);
    }
    drawShape(canvas.width / 2, canvas.height / 2, rot, tmpArr, i / steps);
  }
}

function drawShape(x, y, r, shapeArray, smooth) {
  ctx.lineCap = 'round';
  ctx.lineWidth = 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-90 * Math.PI) / 180);

  ctx.beginPath();

  let midP1 = Point2D.midPoint(shapeArray[shapeArray.length - 1], shapeArray[0], smooth);
  ctx.moveTo(midP1.x, midP1.y);

  for (let i = 0; i < shapeArray.length - 1; i++) {
    let midP2 = Point2D.midPoint(shapeArray[i], shapeArray[i + 1], smooth);
    ctx.quadraticCurveTo(shapeArray[i].x, shapeArray[i].y, midP2.x, midP2.y);
  }

  let midP3 = Point2D.midPoint(shapeArray[shapeArray.length - 1], shapeArray[0], smooth);
  ctx.quadraticCurveTo(shapeArray[shapeArray.length - 1].x, shapeArray[shapeArray.length - 1].y, midP3.x, midP3.y);

  ctx.stroke();
  ctx.restore();
}

function buildStar() {
  const arms = 5;
  const size = 75;
  const step = (2 * Math.PI) / (2 * arms);

  for (let i = 0; i < arms * 2; i++) {
    let tmpPoint = new Point2D();

    let s = size;
    if (i % 2 === 0) s *= 2;
    const x = s * Math.cos(step * i);
    const y = s * Math.sin(step * i);

    tmpPoint.x = x;
    tmpPoint.y = y;

    starPoints.push(tmpPoint);
  }
  console.log(starPoints);
}

function buildTargetShape() {
  const arms = 5;
  const size = 600;
  const step = (2 * Math.PI) / (2 * arms);

  for (let i = 0; i < arms * 2; i++) {
    let tmpPoint = new Point2D();

    const x = size * Math.cos(step * i);
    const y = size * Math.sin(step * i);

    tmpPoint.x = x;
    tmpPoint.y = y;

    targetPoints.push(tmpPoint);
  }

  randomize(targetPoints);
}

function randomize(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i].x += (Math.random() - 0.5) * 800;
    arr[i].y += (Math.random() - 0.5) * 800;
  }
}

/////////////// Event handlers

function onWindowResize() {
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  var rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  //   ctx.scale(dpr, dpr);
}

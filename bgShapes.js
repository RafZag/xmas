import { Point2D } from './point2D.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.137.0/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'https://cdn.skypack.dev/three@0.132.0/examples/jsm/libs/stats.module.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });

/////////////// Listeners

window.addEventListener('resize', onWindowResize);
document.addEventListener('mousemove', onDocumentMouseMove, false);

/////////////// Params

let time = 0;
let starPoints = [];
let targetPoints = [];

let mouseX = 0;
let mouseY = 0;

const params = {
  steps: 40,
  noiseAmpl: 1000,
  noiseSpeed: 10,
  mouseWobble: 50,
  lineAlpha: 0.8,
};

/////////////// GUI

const stats = new Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();
gui.add(params, 'steps', 0, 50, 1);
gui.add(params, 'noiseAmpl', 0, 1500, 1);
gui.add(params, 'noiseSpeed', 0, 100, 1);
gui.add(params, 'mouseWobble', 0, 200, 1);
gui.add(params, 'lineAlpha', 0, 1, 0.01);
gui.close();

/////////////// Init

buildStar();
buildTargetShape();
onWindowResize();
draw();

function draw() {
  ctx.fillStyle = '#f1f1f1';
  // ctx.fillStyle = '#d20b12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  time = (Date.now() * params.noiseSpeed) / 100000;
  let tmpArr = [];
  tmpArr = applyNoise(targetPoints, time, params.noiseAmpl);
  blendShapes(starPoints, tmpArr, params.steps);
  window.requestAnimationFrame(draw);
  stats.update();
}

function blendShapes(arr, targetArr, steps) {
  drawShape(canvas.width / 2 + mouseX * params.mouseWobble, canvas.height / 2 + mouseY * params.mouseWobble, arr, 0);
  drawShape(canvas.width / 2, canvas.height / 2, targetArr, 1);

  for (let i = 1; i < steps; i++) {
    let tmpArr = [];
    for (let j = 0; j < arr.length; j++) {
      let p = new Point2D();
      let tmpArrPoint = new Point2D();
      tmpArrPoint.x = arr[j].x + mouseX * params.mouseWobble;
      tmpArrPoint.y = arr[j].y + mouseY * params.mouseWobble;
      p = Point2D.interpolate(tmpArrPoint, targetArr[j], (1 / steps) * i);
      tmpArr.push(p);
    }
    drawShape(canvas.width / 2, canvas.height / 2, tmpArr, i / steps);
  }
}

function drawShape(x, y, shapeArray, smooth) {
  ctx.lineCap = 'round';
  ctx.lineWidth = 1;
  ctx.save();
  ctx.translate(x, y);
  // ctx.rotate((-90 * Math.PI) / 180);

  ctx.beginPath();

  ctx.strokeStyle = `rgba(0,0,0,${params.lineAlpha})`;

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
  const size = 50;
  const step = (2 * Math.PI) / (2 * arms);

  for (let i = 0; i < arms * 2; i++) {
    let tmpPoint = new Point2D();

    let s = size;
    if (i % 2 === 0) s *= 2;
    const x = s * Math.cos(step * i - Math.PI / 2);
    const y = s * Math.sin(step * i - Math.PI / 2);

    tmpPoint.x = x;
    tmpPoint.y = y;

    starPoints.push(tmpPoint);
  }
  // console.log(starPoints);
}

function buildTargetShape() {
  const arms = 5;
  const size = 400;
  const step = (2 * Math.PI) / (2 * arms);

  for (let i = 0; i < arms * 2; i++) {
    let tmpPoint = new Point2D();

    const x = size * Math.cos(step * i - Math.PI / 2);
    const y = size * Math.sin(step * i - Math.PI / 2);

    tmpPoint.x = x;
    tmpPoint.y = y;

    targetPoints.push(tmpPoint);
  }

  // randomize(targetPoints);
}

function randomize(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i].x += (Math.random() - 0.5) * 800;
    arr[i].y += (Math.random() - 0.5) * 800;
  }
}

function applyNoise(arr, t, ampl) {
  let tmpArr = [];

  for (let i = 0; i < arr.length; i++) {
    let p = new Point2D();
    p.x = arr[i].x + perlin.get(i - 1.8, t) * ampl;
    p.y = arr[i].y + perlin.get(i + 0.5, t) * ampl;
    tmpArr.push(p);
  }
  return tmpArr;
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

function onDocumentMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = (event.clientY / window.innerHeight) * 2 - 1;
}

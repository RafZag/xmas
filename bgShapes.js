import { Point2D } from './point2D.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.137.0/examples/jsm/libs/lil-gui.module.min.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });

/////////////// Listeners

window.addEventListener('resize', onWindowResize);
document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('keydown', onDocumentKeyDown);

/////////////// Params

let time = 0;
let starPoints = [];
let treePoints = [];
let starTargetPoints = [];
let treeTargetPoints = [];

let mouseX = 0;
let mouseY = 0;

let showTree = false;
let showGUI = false;

let bgColor = '#d20b12';
let safeBG = false;

let displayScale = 1;

const params = {
  starSteps: 35,
  starNoiseAmpl: 770,
  starNoiseSpeed: 30,
  starScale: 1.2,
  starTargetSize: 600,

  treeSteps: 35,
  treeNoiseAmpl: 770,
  treeNoiseSpeed: 30,
  treeScale: 1,
  treeTargetSize: 650,

  mouseWobble: 100,
  lineAlpha: 0.8,
  lineWidth: 1.2,

  switchShape: function () {
    showTree = !showTree;
    switchShape();
  },

  switchBG: function () {
    safeBG = !safeBG;
    if (safeBG) bgColor = '#ffffff';
    else bgColor = '#d20b12';
  },
};

function switchShape() {
  if (showTree) {
    starFolder.close();
    treeFolder.open();
  } else {
    starFolder.open();
    treeFolder.close();
  }
}

/////////////// GUI

const gui = new GUI();

gui.add(params, 'switchShape');

const starFolder = gui.addFolder('Star');
starFolder.add(params, 'starSteps', 0, 50, 1);
starFolder.add(params, 'starNoiseAmpl', 0, 1500, 1);
starFolder.add(params, 'starNoiseSpeed', 0, 100, 1);
starFolder.add(params, 'starScale', 0.1, 2, 0.01);
starFolder.add(params, 'starTargetSize', 100, 2000, 10).onChange(() => {
  starTargetPoints = [];
  buildStarTarget(params.starTargetSize);
});

const treeFolder = gui.addFolder('Tree');
treeFolder.add(params, 'treeSteps', 0, 50, 1);
treeFolder.add(params, 'treeNoiseAmpl', 0, 1500, 1);
treeFolder.add(params, 'treeNoiseSpeed', 0, 100, 1);
treeFolder.add(params, 'treeScale', 0.1, 2, 0.01);
treeFolder.add(params, 'treeTargetSize', 100, 2000, 10).onChange(() => {
  treeTargetPoints = [];
  buildTreeTarget(params.treeTargetSize);
});
treeFolder.close();

gui.add(params, 'mouseWobble', 0, 200, 1);
gui.add(params, 'lineAlpha', 0, 1, 0.01);
gui.add(params, 'lineWidth', 0, 5, 0.1);
gui.add(params, 'switchBG');

gui.show(showGUI);

/////////////// Init

buildStar();
buildTree();
buildStarTarget(params.starTargetSize);
buildTreeTarget(params.treeTargetSize);
onWindowResize();
draw();

function draw() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let shortSide;
  if (canvas.width <= canvas.height) shortSide = canvas.width;
  else shortSide = canvas.height;

  displayScale = shortSide / 900;

  let tmpArr = [];

  if (showTree) {
    time = (Date.now() * params.treeNoiseSpeed) / 100000;
    tmpArr = applyNoise(treeTargetPoints, time, params.treeNoiseAmpl);
    blendShapes(treePoints, tmpArr, params.treeSteps, params.treeScale * displayScale);
  } else {
    time = (Date.now() * params.starNoiseSpeed) / 100000;
    tmpArr = applyNoise(starTargetPoints, time, params.treeNoiseAmpl);
    blendShapes(starPoints, tmpArr, params.starSteps, params.starScale * displayScale);
  }

  window.requestAnimationFrame(draw);
}

function blendShapes(arr, targetArr, steps, scale) {
  drawShape(canvas.width / 2 + mouseX * params.mouseWobble, canvas.height / 2 + mouseY * params.mouseWobble, scale, arr, 0);
  // drawShape(canvas.width / 2, canvas.height / 2, scale, targetArr, 1);

  for (let i = 1; i < steps; i++) {
    let tmpArr = [];
    for (let j = 0; j < arr.length; j++) {
      let p = new Point2D();
      let tmpArrPoint = new Point2D();
      tmpArrPoint.x = arr[j].x * scale + mouseX * params.mouseWobble;
      tmpArrPoint.y = arr[j].y * scale + mouseY * params.mouseWobble;

      let tp = new Point2D();
      tp.x = targetArr[j].x * scale;
      tp.y = targetArr[j].y * scale;

      p = Point2D.interpolate(tmpArrPoint, tp, (1 / steps) * i);
      tmpArr.push(p);
    }
    drawShape(canvas.width / 2, canvas.height / 2, 1, tmpArr, i / steps);
  }
}

function drawShape(x, y, s, shapeArray, smooth) {
  ctx.lineCap = 'round';
  ctx.lineWidth = params.lineWidth;
  ctx.save();
  ctx.translate(x, y);
  // ctx.rotate((-90 * Math.PI) / 180);

  ctx.beginPath();

  ctx.strokeStyle = `rgba(0,0,0,${params.lineAlpha})`;

  let midP1 = Point2D.midPoint(shapeArray[shapeArray.length - 1], shapeArray[0], smooth);
  ctx.moveTo(midP1.x * s, midP1.y * s);

  for (let i = 0; i < shapeArray.length - 1; i++) {
    let midP2 = Point2D.midPoint(shapeArray[i], shapeArray[i + 1], smooth);
    ctx.quadraticCurveTo(shapeArray[i].x * s, shapeArray[i].y * s, midP2.x * s, midP2.y * s);
  }

  let midP3 = Point2D.midPoint(shapeArray[shapeArray.length - 1], shapeArray[0], smooth);
  ctx.quadraticCurveTo(shapeArray[shapeArray.length - 1].x * s, shapeArray[shapeArray.length - 1].y * s, midP3.x * s, midP3.y * s);

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
}

function buildStarTarget(s) {
  const arms = 5;
  const size = s;
  const step = (2 * Math.PI) / (2 * arms);

  for (let i = 0; i < arms * 2; i++) {
    let tmpPoint = new Point2D();

    const x = size * Math.cos(step * i - Math.PI / 2);
    const y = size * Math.sin(step * i - Math.PI / 2);

    tmpPoint.x = x;
    tmpPoint.y = y;

    starTargetPoints.push(tmpPoint);
  }
}

function buildTree() {
  let sc = 0.8;

  treePoints.push(new Point2D(0, -320));
  treePoints.push(new Point2D(94, -121));
  treePoints.push(new Point2D(34, -121));
  treePoints.push(new Point2D(134, 91));
  treePoints.push(new Point2D(65, 91));
  treePoints.push(new Point2D(174, 320));

  treePoints.push(new Point2D(-174, 320));
  treePoints.push(new Point2D(-65, 91));
  treePoints.push(new Point2D(-134, 91));
  treePoints.push(new Point2D(-34, -121));
  treePoints.push(new Point2D(-94, -121));

  for (let i = 0; i < treePoints.length; i++) {
    treePoints[i].x = treePoints[i].x * sc;
    treePoints[i].y = treePoints[i].y * sc;
  }
}

function buildTreeTarget(s) {
  const arms = 11;
  const size = s;
  const step = (2 * Math.PI) / arms;

  let ratio = 1.2;

  for (let i = 0; i < arms; i++) {
    let tmpPoint = new Point2D();

    const x = size * Math.cos(step * i - Math.PI / 2);
    const y = size * Math.sin(step * i - Math.PI / 2);

    tmpPoint.x = x;
    tmpPoint.y = y;

    treeTargetPoints.push(tmpPoint);
  }

  for (let i = 0; i < treeTargetPoints.length; i++) {
    treeTargetPoints[i].x = treeTargetPoints[i].x * ratio;
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

function onDocumentKeyDown(e) {
  switch (e.key) {
    case ' ':
      showGUI = !showGUI;
      gui.show(showGUI);
      break;
    case 's':
      showTree = !showTree;
      break;
  }
}

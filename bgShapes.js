import { Point2D } from './point2D.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingQuality = 'high';

window.addEventListener('resize', onWindowResize);

let rot = 0;
let starPoints = [];

buildStar();
onWindowResize();
draw();

function draw() {
  ctx.fillStyle = '#f1f1f1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShape(canvas.width / 2, canvas.height / 2, rot);
  //   rot += 0.1;
  window.requestAnimationFrame(draw);
}

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

function drawShape(x, y, r) {
  ctx.lineCap = 'round';
  ctx.lineWidth = 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-90 * Math.PI) / 180);

  ctx.beginPath();
  let xc = (starPoints[starPoints.length - 1].x + starPoints[0].x) / 2;
  let yc = (starPoints[starPoints.length - 1].y + starPoints[0].y) / 2;
  ctx.moveTo(xc, yc);

  for (let i = 0; i < starPoints.length - 1; i++) {
    let xc1 = (starPoints[i].x + starPoints[i + 1].x) / 2;
    let yc1 = (starPoints[i].y + starPoints[i + 1].y) / 2;
    ctx.quadraticCurveTo(starPoints[i].x, starPoints[i].y, xc1, yc1);
  }
  xc = (starPoints[starPoints.length - 1].x + starPoints[0].x) / 2;
  yc = (starPoints[starPoints.length - 1].y + starPoints[0].y) / 2;
  ctx.quadraticCurveTo(starPoints[starPoints.length - 1].x, starPoints[starPoints.length - 1].y, xc, yc);

  ctx.stroke();

  for (let i = 0; i < starPoints.length; i++) {
    starPoints[i].drawPoint(ctx);
  }
  ctx.restore();
}

function buildStar() {
  const arms = 7;
  const size = 100;
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

  randomize();
}

function randomize() {
  for (let i = 0; i < starPoints.length; i++) {
    starPoints[i].x += Math.random() * 50;
    starPoints[i].y += Math.random() * 50;
  }
}

function midPoint(p1, p2) {
  let midPoint = new Point2D();
  midPoint.x = (p1.x + p2.x) / 2;
  midPoint.y = (p1.y + p2.y) / 2;
  return midPoint;
}

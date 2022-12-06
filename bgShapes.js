const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingQuality = 'high';

window.addEventListener('resize', onWindowResize);
let rot = 0;

onWindowResize();

draw();

function draw() {
  ctx.fillStyle = '#f1f1f1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStar(canvas.width / 2, canvas.height / 2, rot);
  rot += 0.1;
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

function drawStar(x, y, r) {
  ctx.fillStyle = `red`;
  ctx.lineCap = 'round';
  ctx.lineWidth = 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((r * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, -200);
  ctx.lineTo(65, -68);
  ctx.lineTo(210, -47);
  ctx.lineTo(105, 54.7);
  ctx.lineTo(130, 200);
  ctx.lineTo(0, 131);
  ctx.lineTo(-130, 200);
  ctx.lineTo(-105, 54.7);
  ctx.lineTo(-210, -47);
  ctx.lineTo(-65, -68);
  ctx.closePath();
  ctx.stroke();
  //   ctx.fill();
  ctx.restore();
}

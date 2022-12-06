class Point2D {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  drawPoint(ctx) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
    ctx.fill();
  }
}
export { Point2D };

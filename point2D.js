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

  static midPoint(p1, p2, i) {
    let midPoint = new Point2D();
    midPoint.x = (p1.x + p2.x) / 2;
    midPoint.y = (p1.y + p2.y) / 2;

    return this.interpolate(p1, midPoint, i);
  }

  static interpolate(a, b, frac) {
    // points A and B, frac between 0 and 1
    var nx = a.x + (b.x - a.x) * frac;
    var ny = a.y + (b.y - a.y) * frac;
    return { x: nx, y: ny };
  }
}
export { Point2D };

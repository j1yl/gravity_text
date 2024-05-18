class GameObject {
  constructor(ctx, x, y, vx, vy, mass) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.mass = mass;

    this.isColliding = false;
  }
}

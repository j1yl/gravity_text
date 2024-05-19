class Character extends GameObject {
  constructor(ctx, x, y, vx, vy, mass, char, debug) {
    super(ctx, x, y, vx, vy, mass);

    this.char = char;
    this.angle = 0;

    window.innerWidth > 768 ? (this.size = 128) : (this.size = 80);
    this.height = this.size * 0.7;
    this.debug = debug;
    this.color = this.getPastelColor();
    this.calculateSize();
  }

  calculateSize() {
    this.ctx.font = `${this.size}px Roboto, monospace`;
    this.width = this.ctx.measureText(this.char).width;
  }

  draw() {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.angle);
    this.ctx.font = `${this.size}px Roboto, monospace`;
    this.ctx.fillStyle = this.isColliding ? this.color : "#000000";
    this.ctx.fillText(this.char, -this.width / 2, this.height / 2);

    // Draw hitbox
    if (this.debug) {
      this.ctx.strokeStyle = "#000000";
      this.ctx.strokeRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );

      // Draw velocity vector
      this.ctx.strokeStyle = "#000000";
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(this.vx, this.vy);
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  update(secondsPassed) {
    const g = 9.81;
    const maxVelocity = 100;

    if (Math.abs(this.vx) > maxVelocity) {
      this.vx = maxVelocity * Math.sign(this.vx);
    }

    if (Math.abs(this.vy) > maxVelocity) {
      this.vy = maxVelocity * Math.sign(this.vy);
    }

    this.vy += g * secondsPassed;
    this.x += this.vx * secondsPassed;
    this.y += this.vy * secondsPassed;

    this.angle += this.vx * secondsPassed * 0.01;
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  getPastelColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 50%)`;
  }
}

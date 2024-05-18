class Character extends GameObject {
  constructor(ctx, x, y, vx, vy, mass, char) {
    super(ctx, x, y, vx, vy, mass);

    this.char = char;
    this.angle = 0;
    this.size = 128;
    this.height = this.size * 0.64;
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
    this.ctx.fillText(this.char, -this.width / 2, this.height / 2);

    this.ctx.strokeStyle = "#000000";
    this.ctx.strokeRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(this.x + this.vx, this.y + this.vy);
    this.ctx.strokeStyle = "#ff0000";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  update(secondsPassed) {
    const g = 9.81;

    this.vy += g * secondsPassed;
    this.x += this.vx * secondsPassed;
    this.y += this.vy * secondsPassed;

    // Rotate the character (for example, based on velocity)
    this.angle += this.vx * secondsPassed * 0.01; // Adjust rotation speed as needed
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}

const restitution = 0.5;
const friction = 0.99;

class GameWorld {
  constructor(canvasId) {
    this.canvas = null;
    this.context = null;
    this.secondsPassed = 0;
    this.oldTimeStamp = 0;
    this.gameObjects = [];
    this.resetCounter = 0;

    this.init(canvasId);
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.createWorld();

    window.requestAnimationFrame((timeStamp) => {
      this.gameLoop(timeStamp);
    });
  }

  createWorld() {
    const numObjects = 16;
    const rows = 4; // Define the number of rows
    const cols = 4; // Define the number of columns
    const cellWidth = this.canvas.width / cols;
    const cellHeight = this.canvas.height / rows;

    for (let i = 0; i < numObjects; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;

      this.gameObjects.push(
        new Character(
          this.context,
          x,
          y,
          Math.floor(Math.random() * 100) - 50,
          Math.floor(Math.random() * 100) - 50,
          Math.floor(Math.random() * 50),
          "J"
        )
      );
    }
  }

  gameLoop(timeStamp) {
    this.secondsPassed = (timeStamp - this.oldTimeStamp) / (1000 / 10);
    this.oldTimeStamp = timeStamp;

    for (let i = 0; i < this.gameObjects.length; i++) {
      this.gameObjects[i].update(this.secondsPassed);
    }

    this.detectCollisions();
    this.detectEdgeCollisions();
    this.clearCanvas();

    for (let i = 0; i < this.gameObjects.length; i++) {
      this.gameObjects[i].draw();
    }

    window.requestAnimationFrame((timeStamp) => this.gameLoop(timeStamp));
  }

  detectCollisions() {
    let obj1, obj2;

    for (let i = 0; i < this.gameObjects.length; i++) {
      this.gameObjects[i].isColliding = false;
    }

    for (let i = 0; i < this.gameObjects.length; i++) {
      obj1 = this.gameObjects[i];
      for (let j = i + 1; j < this.gameObjects.length; j++) {
        obj2 = this.gameObjects[j];

        const hitbox1 = obj1.getHitbox();
        const hitbox2 = obj2.getHitbox();

        const minDist =
          Math.hypot(hitbox1.width, hitbox1.height) / 2 +
          Math.hypot(hitbox2.width, hitbox2.height) / 2;
        if (Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y) > minDist) continue;

        if (this.rectIntersect(hitbox1, hitbox2, obj1.angle, obj2.angle)) {
          obj1.isColliding = true;
          obj2.isColliding = true;

          let vCollision = { x: obj2.x - obj1.x, y: obj2.y - obj1.y };
          let distance = Math.hypot(vCollision.x, vCollision.y);
          let vCollisionNorm = {
            x: vCollision.x / distance,
            y: vCollision.y / distance,
          };
          let vRelativeVelocity = {
            x: obj1.vx - obj2.vx,
            y: obj1.vy - obj2.vy,
          };
          let speed =
            vRelativeVelocity.x * vCollisionNorm.x +
            vRelativeVelocity.y * vCollisionNorm.y;

          if (speed < 0) continue;

          speed *= restitution;

          let impulse = (2 * speed) / (obj1.mass + obj2.mass);
          obj1.vx -= impulse * obj2.mass * vCollisionNorm.x;
          obj1.vy -= impulse * obj2.mass * vCollisionNorm.y;
          obj2.vx += impulse * obj1.mass * vCollisionNorm.x;
          obj2.vy += impulse * obj1.mass * vCollisionNorm.y;

          const overlap = 0.25 * (minDist - distance);
          if (overlap > 0) {
            const correction = overlap / 2;
            obj1.x -= correction * vCollisionNorm.x;
            obj1.y -= correction * vCollisionNorm.y;
            obj2.x += correction * vCollisionNorm.x;
            obj2.y += correction * vCollisionNorm.y;
          }
        }
      }
    }
  }

  rectIntersect(hitbox1, hitbox2, angle1, angle2) {
    let corners1 = this.getRotatedCorners(hitbox1, angle1);
    let corners2 = this.getRotatedCorners(hitbox2, angle2);

    let axes = this.getAxes(corners1).concat(this.getAxes(corners2));

    for (let axis of axes) {
      let projection1 = this.projectCorners(corners1, axis);
      let projection2 = this.projectCorners(corners2, axis);

      if (
        projection1.min > projection2.max ||
        projection2.min > projection1.max
      ) {
        return false;
      }
    }

    return true;
  }

  getRotatedCorners(hitbox, angle) {
    let corners = [
      { x: hitbox.x, y: hitbox.y },
      { x: hitbox.x + hitbox.width, y: hitbox.y },
      { x: hitbox.x + hitbox.width, y: hitbox.y + hitbox.height },
      { x: hitbox.x, y: hitbox.y + hitbox.height },
    ];

    let centerX = hitbox.x + hitbox.width / 2;
    let centerY = hitbox.y + hitbox.height / 2;

    for (let corner of corners) {
      let x = corner.x - centerX;
      let y = corner.y - centerY;

      corner.x = x * Math.cos(angle) - y * Math.sin(angle) + centerX;
      corner.y = x * Math.sin(angle) + y * Math.cos(angle) + centerY;
    }

    return corners;
  }

  getAxes(corners) {
    let axes = [];

    for (let i = 0; i < corners.length; i++) {
      let p1 = corners[i];
      let p2 = corners[(i + 1) % corners.length];

      let edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      let normal = { x: -edge.y, y: edge.x };

      let length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      normal.x /= length;
      normal.y /= length;

      axes.push(normal);
    }

    return axes;
  }

  projectCorners(corners, axis) {
    let min = axis.x * corners[0].x + axis.y * corners[0].y;
    let max = min;

    for (let i = 1; i < corners.length; i++) {
      let projection = axis.x * corners[i].x + axis.y * corners[i].y;

      if (projection < min) {
        min = projection;
      }

      if (projection > max) {
        max = projection;
      }
    }

    return { min, max };
  }

  detectEdgeCollisions() {
    let obj;
    let canvasWidth = this.canvas.width;
    let canvasHeight = this.canvas.height;

    for (let i = 0; i < this.gameObjects.length; i++) {
      obj = this.gameObjects[i];

      const hitbox = obj.getHitbox();

      if (hitbox.x < 0) {
        obj.vx = Math.abs(obj.vx) * restitution;
        obj.x = hitbox.width / 2;
      } else if (hitbox.x + hitbox.width > canvasWidth) {
        obj.vx = -Math.abs(obj.vx) * restitution;
        obj.x = canvasWidth - hitbox.width / 2;
      }

      if (hitbox.y < 0) {
        obj.vy = Math.abs(obj.vy) * restitution;
        obj.y = hitbox.height / 2;
      } else if (hitbox.y + hitbox.height > canvasHeight) {
        obj.vy = -Math.abs(obj.vy) * restitution;
        obj.y = canvasHeight - hitbox.height / 2;
        obj.vx *= friction; // Apply friction when the character hits the ground
      }
    }
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

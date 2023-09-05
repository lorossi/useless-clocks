import { XOR128 } from "./xor128.js";

class Clock {
  constructor(width = 1000, height = 1000) {
    if (this.constructor === Clock)
      throw new TypeError("Abstract class 'Clock' cannot be instantiated.");

    this.width = width;
    this.height = height;

    this.date = null;
    this.old_date = null;
    this.scl = 0.9;
    this.white = this._loadCSSVar("text-color");
    this.black = this._loadCSSVar("background-color");
    this._renamePage();

    this.preload();
  }

  _loadCSSVar(name) {
    const var_name = `--${name}`;
    const body = document.querySelector("body");
    return getComputedStyle(body).getPropertyValue(var_name);
  }

  update(date) {
    this.date = date;
  }

  drawClock(ctx) {
    if (this.constructor === Clock)
      throw new TypeError("Method 'drawClock' must be implemented.");
  }

  preload() {
    // optional
  }

  _renamePage() {
    const title = document.querySelector("title");
    title.textContent = this.title;
  }

  show(ctx) {
    ctx.save();
    this.drawClock(ctx);
    ctx.restore();
  }

  unpackDate(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    const f_seconds = seconds + milliseconds / 1000;
    const f_minutes = minutes + f_seconds / 60;
    const f_hours = hours + f_minutes / 60;
    return {
      milliseconds: milliseconds,
      seconds: f_seconds,
      hours: f_hours,
      minutes: f_minutes,
    };
  }

  normalizeDate(date) {
    const time = this.unpackDate(date);
    return [
      time.milliseconds / 1000,
      time.seconds / 60,
      time.minutes / 60,
      time.hours / 24,
    ];
  }

  easeInOutPoly(x, n = 5) {
    if (x < 0.5) return Math.pow(2 * x, n) / 2;
    return 1 - Math.pow(2 * (1 - x), n) / 2;
  }

  get title() {
    return this.constructor.name;
  }
}

class SineClock extends Clock {
  _createSubCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height / 4;
    return canvas;
  }
  _drawSine(canvas, frequency) {
    const amplitude = (canvas.height / 2) * this.scl;

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.fillStyle = this.black;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = this.white;
    ctx.lineWidth = 2;
    ctx.translate(0, canvas.height / 2);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x < canvas.width; x++) {
      const theta = (x / canvas.width) * frequency * Math.PI * 2;
      const y = Math.sin(theta) * amplitude;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  preload() {
    const frequencies = [1, 60, 60, 24];
    this._sub_canvases = Array(frequencies.length)
      .fill()
      .map((_, i) => {
        const c = this._createSubCanvas();
        this._drawSine(c, frequencies[i]);
        return c;
      });
  }

  _pasteImage(ctx, canvas, y, w) {
    ctx.save();
    ctx.translate(0, y);
    ctx.drawImage(canvas, 0, 0, w, canvas.height, 0, 0, w, canvas.height);
    ctx.restore();
  }

  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    this._sub_canvases.forEach((c, i) => {
      const w = Math.floor(this.width * time_array[i]);
      const y = (this.height / 4) * i;
      this._pasteImage(ctx, c, y, w);
    });
  }

  get title() {
    return "Sine Clock";
  }
}

class TriangleClock extends Clock {
  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    for (let i = 0; i < 4; i++) {
      const w = Math.floor(this.width / 4);
      const h = Math.floor(this.height * time_array[i]);

      ctx.save();
      ctx.lineWidth = 4;
      ctx.translate(i * w, this.height / 2);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w - ctx.lineWidth, 0);
      ctx.lineTo(0, -h / 2);
      ctx.closePath();
      ctx.fillStyle = this.white;
      ctx.strokeStyle = this.white;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}

class BarClock extends Clock {
  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    for (let i = 0; i < 4; i++) {
      const w = Math.floor(this.width / 4);
      const h = Math.floor(this.height * time_array[i]);

      ctx.save();
      ctx.translate(i * w, 0);

      ctx.translate(w / 2, this.height / 2);
      ctx.scale(this.scl, this.scl);
      if (i % 2 === 0) ctx.rotate(Math.PI);
      ctx.translate(-w / 2, -this.height / 2);

      ctx.lineWidth = 4;
      ctx.strokeStyle = this.white;
      ctx.strokeRect(0, 0, w, this.height);
      ctx.fillStyle = this.white;
      ctx.fillRect(0, this.height - h, w, h);
      ctx.restore();
    }
  }

  get title() {
    return "Bar Clock";
  }
}

class CircleClock extends Clock {
  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    for (let i = 0; i < 4; i++) {
      const x = i % 2;
      const y = Math.floor(i / 2);

      const r = (time_array[i] * this.width) / 4;

      ctx.save();
      ctx.translate(
        ((x + 0.5) * this.width) / 2,
        ((y + 0.5) * this.height) / 2
      );

      ctx.scale(this.scl, this.scl);

      ctx.fillStyle = this.white;
      ctx.strokeStyle = this.white;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  get title() {
    return "Circle Clock";
  }
}

class BinaryClock extends Clock {
  drawClock(ctx) {
    const time_str = this.date.getTime().toString(2).padStart(64, "0");

    ctx.save();

    for (let i = 0; i < 64; i++) {
      const b = time_str[i] === "1";
      const x = i % 8;
      const y = Math.floor(i / 8);

      ctx.save();
      ctx.translate((x * this.width) / 8, (y * this.height) / 8);
      ctx.fillStyle = b ? this.white : this.black;
      ctx.strokeStyle = this.white;
      ctx.lineWidth = 4;
      ctx.fillRect(0, 0, this.width / 8, this.height / 8);
      ctx.strokeRect(0, 0, this.width / 8, this.height / 8);
      ctx.restore();
    }

    ctx.restore();
  }

  get title() {
    return "Binary Clock";
  }
}

class RandomClock extends Clock {
  drawClock(ctx) {
    const time_str = this.date.toISOString().replace(/[TZ]/g, "");
    const random = new XOR128(this.date.getTime());
    const scrambled = random.shuffle_string(time_str);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `80px HackBold`;
    ctx.fillStyle = this.white;
    ctx.translate(this.width / 2, this.height / 2);
    ctx.fillText(scrambled, 0, 0);
    ctx.restore();
  }

  get title() {
    return "Random Clock";
  }
}

class GearClock extends Clock {
  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    for (let i = 0; i < 4; i++) {
      const x = (i / 4) * this.width;
      const r = this.width / 8;
      const theta = time_array[i] * Math.PI * 2;

      ctx.save();
      ctx.translate(x + r, this.height / 2);
      ctx.rotate(theta);
      ctx.scale(this.scl, this.scl);

      ctx.fillStyle = this.white;
      ctx.strokeStyle = this.black;
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }
  }

  get title() {
    return "Gear Clock";
  }
}

class LinesClock extends Clock {
  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    for (let i = 0; i < 4; i++) {
      const theta = time_array[i] * Math.PI * 2;
      const r = this.width / 2;

      ctx.save();
      ctx.translate(this.width / 2, this.height / 2);
      ctx.rotate(theta);
      ctx.scale(this.scl, this.scl);

      ctx.strokeStyle = this.white;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }
  }

  get title() {
    return "Lines Clock";
  }
}

class SquaresClock extends Clock {
  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    for (let i = 0; i < 4; i++) {
      const x = ((i % 2) * this.width) / 2;
      const y = (Math.floor(i / 2) * this.height) / 2;

      const w = this.width / 2;
      const h = this.height / 2;

      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.scale(this.scl, this.scl);

      ctx.fillStyle = this.white;
      ctx.strokeStyle = this.white;
      ctx.lineWidth = 4;

      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.globalAlpha = this.easeInOutPoly(time_array[i]);
      ctx.fillRect(-w / 2, -h / 2, w, h);

      ctx.restore();
    }
  }

  get title() {
    return "Squares Clock";
  }
}

class SmallSquaresClock extends Clock {
  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);
    const cols = 10;
    const size = this.height / cols;
    const inner_size = size * Math.SQRT1_2;

    for (let i = 0; i < 4; i++) {
      ctx.save();

      // space out the lines horizontally in the canvas
      ctx.translate(0, (i * this.height) / 4 + size / 2);

      for (let j = 0; j < cols; j++) {
        const x = j * size;

        ctx.save();
        ctx.translate(x + inner_size / 2, inner_size / 2);
        ctx.scale(this.scl, this.scl);
        ctx.rotate((time_array[i] * Math.PI) / 2);

        ctx.fillStyle = this.white;
        ctx.lineWidth = 4;

        ctx.fillRect(-inner_size / 2, -inner_size / 2, inner_size, inner_size);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  get title() {
    return "Small Squares Clock";
  }
}

class SmallLinesClock extends Clock {
  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);
    const cols = 21;
    const size = this.height / cols;

    for (let i = 0; i < cols; i++) {
      ctx.save();
      ctx.translate(0, i * size + size / 2);

      for (let j = 0; j < cols; j++) {
        const x = j * size;

        ctx.save();
        ctx.translate(x + size / 2, size / 2);
        ctx.scale(this.scl, this.scl);
        ctx.rotate(time_array[(i * cols + j) % 4] * Math.PI * 2);
        ctx.strokeStyle = this.white;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(size / 2, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  get title() {
    return "Small Lines Clock";
  }
}

class OnlyOneRightClock extends Clock {
  preload() {
    this._cols = 7;
    this._rng = new XOR128();

    const right_x = this._rng.random_int(this._cols);
    const right_y = this._rng.random_int(this._cols);

    this._offsets = Array(this._cols * this._cols)
      .fill()
      .map((_, i) => {
        const x = i % this._cols;
        const y = Math.floor(i / this._cols);
        if (x === right_x && y === right_y) return Array(4).fill(0);
        return Array(4)
          .fill()
          .map(() => this._rng.random(-1, 1));
      });
  }

  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);
    const size = this.height / this._cols;

    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        const i = x + y * this._cols;

        ctx.save();
        ctx.translate(x * size + size / 2, y * size + size / 2);
        ctx.scale(this.scl, this.scl);
        ctx.strokeStyle = this.white;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();

        for (let j = 0; j < 4; j++) {
          const len = (((size / 2) * (4 - j + 1)) / 5) * this.scl;
          const angle = (time_array[j] + this._offsets[i][j]) * Math.PI * 2;

          ctx.save();
          ctx.strokeStyle = this.white;
          ctx.lineWidth = 2;
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(len, 0);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }
    }
  }

  get title() {
    return "Only One is Right";
  }
}

class PolygonClock extends Clock {
  drawClock(ctx) {
    const time = this.unpackDate(this.date);
    const sides = [
      Math.floor(time.milliseconds / 10),
      Math.floor(time.seconds),
      Math.floor(time.minutes),
      Math.floor(time.hours),
    ];

    const size = this.width / 2;
    for (let i = 0; i < 4; i++) {
      const x = i % 2;
      const y = Math.floor(i / 2);

      ctx.save();
      ctx.translate((x + 0.5) * size, (y + 0.5) * size);
      ctx.scale(this.scl, this.scl);

      ctx.fillStyle = this.white;
      ctx.strokeStyle = this.white;
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(0, size / 2);
      for (let j = 0; j < sides[i]; j++) {
        const theta = (j / sides[i]) * Math.PI * 2;
        ctx.lineTo((Math.sin(theta) * size) / 2, (Math.cos(theta) * size) / 2);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    }
  }

  get title() {
    return "Polygon Clock";
  }
}

export {
  BarClock,
  BinaryClock,
  CircleClock,
  GearClock,
  LinesClock,
  OnlyOneRightClock,
  PolygonClock,
  RandomClock,
  SineClock,
  SmallLinesClock,
  SmallSquaresClock,
  SquaresClock,
  TriangleClock,
};

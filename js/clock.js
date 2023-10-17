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
    this.white = this._loadCSSVar("white");
    this.black = this._loadCSSVar("black");

    const seed = new Date().getTime();
    this.rng = new XOR128(seed);
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

  get description() {
    return null;
  }
}

class SineClock extends Clock {
  createSubCanvases() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height / 4;
    return canvas;
  }

  drawSine(ctx, width, frequency, amplitude) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x < width; x++) {
      const theta = (x / width) * frequency * Math.PI * 2;
      const y = Math.sin(theta) * amplitude;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drawSineCanvas(canvas, frequency) {
    const amplitude = (canvas.height / 2) * this.scl;

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.fillStyle = this.black;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = this.white;
    ctx.lineWidth = 2;
    ctx.translate(0, canvas.height / 2);
    this.drawSine(ctx, canvas.width, frequency, amplitude);
    ctx.restore();
  }

  preload() {
    const frequencies = [1, 60, 60, 24];
    this._sub_canvases = new Array(frequencies.length).fill().map((_, i) => {
      const c = this.createSubCanvases();
      this.drawSineCanvas(c, frequencies[i]);
      return c;
    });
  }

  pasteImage(ctx, canvas, y, w) {
    ctx.save();
    ctx.translate(canvas.width / 2, y + canvas.height / 2);
    ctx.scale(this.scl, this.scl);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(canvas, 0, 0, w, canvas.height, 0, 0, w, canvas.height);
    ctx.restore();
  }

  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    this._sub_canvases.forEach((c, i) => {
      const w = Math.floor(this.width * time_array[i]);
      const y = (this.height / 4) * i;
      this.pasteImage(ctx, c, y, w);
    });
  }

  get title() {
    return "Sine Clock";
  }

  get description() {
    return "This clock makes use of the sinusoidal trigonometric function to represent the time. Each line represents a different unit of time, from milliseconds to hours. The length of each line is proportional to the current time. The frequency of the sine wave is also proportional to the unit of time, so the milliseconds line has a frequency of 1, the seconds line has a frequency of 60, the minutes line has a frequency of 60, and the hours line has a frequency of 24.";
  }
}

class ModulatedSineClock extends SineClock {
  drawSine(ctx, width, frequency, amplitude) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x < width; x++) {
      const theta = (x / width) * frequency * Math.PI * 2;
      const y = Math.sin(theta) * amplitude * Math.sin((x / width) * Math.PI);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drawClock(ctx) {
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.scale(1, -1);
    ctx.translate(-this.width / 2, -this.height / 2);
    super.drawClock(ctx);
    ctx.restore();
  }

  get title() {
    return "Modulated Sines Clock";
  }

  get description() {
    return "This clock is similar to the Sine Clock, but the sine waves are modulated by another sine wave. Each line still represents a different unit of time, but the created shape is more interesting; however, not more readable. Try it, I guarantee.";
  }
}

class FrequencySineClock extends ModulatedSineClock {
  preload() {
    const frequencies = new Array(100).fill().map((_, i) => i + 1);
    this._sub_canvases = new Array(frequencies.length).fill().map((_, i) => {
      const c = this.createSubCanvases();
      this.drawSineCanvas(c, frequencies[i]);
      return c;
    });
  }

  drawClock(ctx) {
    const time = this.unpackDate(this.date);
    const time_array = [
      Math.floor(time.milliseconds / 10),
      Math.floor(time.seconds),
      Math.floor(time.minutes),
      Math.floor(time.hours),
    ];

    ctx.save();
    time_array.forEach((t, i) => {
      const y = (this.height / 4) * i;
      const c = this._sub_canvases[t];
      this.pasteImage(ctx, c, y, this.width);
    });
    ctx.restore();
  }

  get title() {
    return "Frequency Sine Clock";
  }

  get description() {
    return "This clock is similar to the other one using sines to tell the time, but the actual time is represented by the frequency of each sine wave and not by its length. It is very similar to the other sinusoidal clocks, but it is also very different. It is one of my favourites.";
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
      ctx.fillStyle = this.white;
      ctx.strokeStyle = this.white;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  get title() {
    return "Triangle Clock";
  }

  get description() {
    return "This clock is similar to the Bar Clock, but instead of using bars, it uses triangles. Each triangle represents a different unit of time, from milliseconds (left) to hours (right). The triangles get filled over time, giving almost the idea of being able to read what it is actually shown. Almost.";
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

  get description() {
    return "This is probably one of the most readable clocks (this statement really tells a story). Each bar fills up proportionally to the current time, from milliseconds (left) to hours (right). The bars get move almost slowly over time, giving almost the idea of being able to read what it is actually shown. Yeah, almost.";
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
      ctx.fill();

      ctx.restore();
    }
  }

  get title() {
    return "Circle Clock";
  }

  get description() {
    return "This clock is a masterpiece of uselessness: each circle represents a different unit of time, from milliseconds to hours. The radius of each circle is proportional to the current time. The thing that I like the most is the fact that is nearly impossible to tell how big a circle by comparing it to the others, or even trying to get the value it is trying to represent. Awesome!";
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

  get description() {
    return "I have seen plenty of clocks similar to this, from watches to wall clocks, and they never fail to fascinate me: because they are outrageous unreadability. This clock tells the time in binary; however, the actual time is not represented, but rather the number of milliseconds since the Unix Epoch (January 1st, 1970). Even if you know are able to read the binary value and convert it to decimal, it is still impossible to tell the time without doing quite a lot of calculations. And a clock.";
  }
}

class ShuffledClock extends Clock {
  drawClock(ctx) {
    const time_str = this.date.toISOString().replace(/[TZ]/g, "");
    const scrambled = this.rng.shuffle_string(time_str);
    const size = 160;

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${size}px HackBold`;
    ctx.fillStyle = this.white;
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.scl, this.scl);

    for (let i = 0; i < 2; i++) {
      const string_sub = scrambled.slice(
        (i * scrambled.length) / 2,
        ((i + 1) * scrambled.length) / 2
      );

      ctx.save();
      if (i == 0) ctx.textBaseline = "bottom";
      else ctx.textBaseline = "top";

      ctx.fillText(string_sub, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  get title() {
    return "Shuffled Clock";
  }

  get description() {
    return "This is not only completely useless, but also unreadable. The current time is used to seed a random number generator, which is then used to shuffle the string representation of the current time. The result is a unique string that changes each millisecond: however, to actually know the time, it would be necessary to get the date, study the implemented shuffling algorithm, and then apply it backwards to the string. Isn't that great?";
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
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();

      ctx.restore();
    }
  }

  get title() {
    return "Gear Clock";
  }

  get description() {
    return "In this clock, each rotating circle (ideally, a gear) represents a different unit of time, from milliseconds to hours: the position of the black line represents the corresponding value of the current time. The gears rotate over time, replicating the movement of a real clock. Between all the clocks in this collection, this is probably one of the few that makes sense. On a side note, I would love to build a real clock out of this (without the milliseconds) and hang it on my wall. Wouldn't that look nice? It would also sound very noisy. But everything comes with a price, I guess.";
  }
}

class LinesClock extends Clock {
  preload() {
    this._directions = new Array(4)
      .fill()
      .map(() => this.rng.random_int(-1, 1));
    this._offsets = new Array(4)
      .fill()
      .map(() => this.rng.random(0, Math.PI * 2));
  }

  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.scl, this.scl);
    ctx.strokeStyle = this.white;
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) {
      const theta =
        time_array[i] * Math.PI * 2 * this._directions[i] + this._offsets[i];
      const r = this.width / 2;

      ctx.save();
      ctx.rotate(theta);
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  get title() {
    return "Lines Clock";
  }

  get description() {
    return "At first glance, it almost looks like you could tell the time on this clock: there are 4 lines, each representing a different unit of time, rotating around a central point. However, the lines rotate in random directions and have a random offset, making it impossible to tell the time; furthermore, since each hand is as wide as the whole clock, there's just no way of telling the current value it is pointing. Is it 3 or 9? This clock is a perfect example of how to make something that looks like it could be useful, but it is not.";
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

  get description() {
    return "This is one of the clocks that despite looking (hopefully) quite clean and tidy, are actually absolutely unreadable. The unit of time in each square is represented by the level of transparency of the square itself, from milliseconds (top left) to hours (bottom right). Once again, this shows that tidiness and order don't necessarily mean readability.";
  }
}

class SmallSquaresClock extends Clock {
  preload() {
    this._offsets = new Array(4)
      .fill(0)
      .map(() => this.rng.random(0, Math.PI * 2));
  }
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
        const a = this.easeInOutPoly(time_array[i]) * Math.PI * 2;

        ctx.save();
        ctx.translate(x + inner_size / 2, inner_size / 2);
        ctx.scale(this.scl, this.scl);
        ctx.rotate(a + this._offsets[i]);

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

  get description() {
    return "This clock shows the time by rotating squares. From the top (milliseconds) to the bottom (hours), the rotation of each clock represents the relative time unit. But how do I measure the rotation? But wait, why don't the squares rotate at a constant speed? How do I even try to read the time? I don't know, but it looks cool.";
  }
}

class SmallLinesClock extends Clock {
  preload() {
    this._cols = 10;
    this._roles = new Array(this._cols * this._cols)
      .fill()
      .map((_, i) => ({ role: i % 4, order: this.rng.random() }))
      .sort((a, b) => a.order - b.order)
      .map((r) => r.role);
    this._direction = new Array(this._cols * this._cols)
      .fill()
      .map(() => this.rng.random_int(-1, 1));
  }

  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);
    const size = this.height / this._cols;

    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._cols; y++) {
        const i = x + y * this._cols;
        const role = this._roles[i];
        const a = time_array[role] * Math.PI * 2 * this._direction[i];

        ctx.save();
        ctx.translate(x * size + size / 2, y * size + size / 2);
        ctx.scale(this.scl, this.scl);
        ctx.rotate(a);
        ctx.strokeStyle = this.white;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(size / 2, 0);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  get title() {
    return "Small Lines Clock";
  }

  get description() {
    return "This clock is similar to the Lines Clock, but each line is smaller and there are more of them. The lines are also randomly rotated, making it even more impossible to tell the time. This makes the composition pretty static and without many moving objects, but don't let it fool you: what time is it?";
  }
}

class OnlyOneRightClock extends Clock {
  preload() {
    this._cols = 7;

    const right_x = this.rng.random_int(this._cols);
    const right_y = this.rng.random_int(this._cols);

    this._offsets = new Array(this._cols * this._cols).fill().map((_, i) => {
      const x = i % this._cols;
      const y = Math.floor(i / this._cols);
      if (x === right_x && y === right_y) return Array(4).fill(0);
      return Array(4)
        .fill()
        .map(() => this.rng.random(-1, 1));
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

  get description() {
    return "This clock is an unicum in the whole collection: it actually shows the correct time! But only one of the clock faces is actually correct, while all the other show are not. Which is the working one? You tell me.";
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
      if (sides[i] < 3) continue;
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

  get description() {
    return "The time in this clock is represented by the number of sides of each polygon. The polygons are drawn from milliseconds (top left) to hours (bottom right). It's really really hard to tell the time on this clock, because shapes with more than 15-20 sides are basically indistinguishable from one another. Or from a circle, for that matter.";
  }
}

class SmallCirclesClock extends Clock {
  preload() {
    this._max_amount = [100, 60, 60, 24];
    this._order = new Array(4).fill().map((_, i) =>
      this.rng.shuffle_array(
        Array(this._max_amount[i])
          .fill()
          .map((_, j) => j)
      )
    );
  }

  drawClock(ctx) {
    const time = this.unpackDate(this.date);
    const balls = [
      (Math.floor(time.milliseconds) * this._max_amount[0]) / 1000,
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
      ctx.translate(-size / 2, -size / 2);

      ctx.strokeStyle = this.white;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, size, size);

      ctx.fillStyle = this.white;
      for (let j = 0; j < balls[i]; j++) {
        const ball_size = size / 10;
        const ball_x = this._order[i][j] % 10;
        const ball_y = Math.floor(this._order[i][j] / 10);

        ctx.save();
        ctx.translate((ball_x + 0.5) * ball_size, (ball_y + 0.5) * ball_size);
        ctx.scale(0.75, 0.75);
        ctx.beginPath();
        ctx.arc(0, 0, ball_size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  get title() {
    return "Small Circles Clock";
  }

  get description() {
    return "The time is this clock is shown by filling up a grid of small circles: each circle represents a unit of time. I like this clock because, unlike others, it is not that chaotic (thanks to the grid-shaped layout), but it is still impossible to tell the time at first (or second, or third) glance (if ever).";
  }
}

class LinesBinaryClock extends Clock {
  drawClock(ctx) {
    const date = this.unpackDate(this.date);
    date.milliseconds /= 10;

    const date_array = [
      date.milliseconds,
      date.seconds,
      date.minutes,
      date.hours,
    ];

    const time_str = date_array.map((t) => {
      return Math.floor(t).toString(2).padStart(7, "0");
    });

    const h = this.height / 4;
    const w = this.width / 7;
    const inner_w = w * 0.5;

    time_str.forEach((str, i) => {
      const y = i * h;

      ctx.save();
      ctx.translate(0, y);

      str.split("").forEach((c, j) => {
        if (c === "1") {
          ctx.save();
          ctx.fillStyle = this.white;
          ctx.strokeStyle = this.white;
          ctx.lineWidth = 2;
          ctx.translate((j + 0.5) * w, 0);
          ctx.fillRect(-inner_w / 2, 0, inner_w, h);
          ctx.strokeRect(-inner_w / 2, 0, inner_w, h);
          ctx.restore();
        }
      });

      ctx.restore();
    });
  }

  get title() {
    return "Lines Binary Clock";
  }

  get description() {
    return "This clock is similar to the Binary Clock already shown in the collection, but instead of using squares, it uses lines. The seconds since the Unix Epoch are converted to binary, and each line represents a bit. The lines are drawn from top to bottom, so the first line represents the most significant bit, and the last line represents the least significant bit. This clock is also unreadable, even more than the other one: it's a thousand times messier.";
  }
}

class MultipleCirclesClock extends Clock {
  drawClock(ctx) {
    const time_array = this.normalizeDate(this.date);

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.scl, this.scl);
    ctx.strokeStyle = this.white;
    ctx.lineWidth = 4;

    time_array.forEach((t) => {
      const r = (t * this.width) / 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.restore();
  }

  get title() {
    return "Multiple Circles Clock";
  }

  get description() {
    return "This clock is really anti-intuitive and particularly hard to read: each circle represents a unit of time, from milliseconds to hours, where the radius represents the amount. The catch is that it's actually impossible to tell which circle represents which value and to measuring the radius is an equally difficult task. This is almost an Herculean task.";
  }
}

class XOR128Clock extends Clock {
  preload() {
    this._cols = 20;
    this._rows = 20;
    this._scl = Math.min(this.width / this._cols, this.height / this._rows);
  }

  drawClock(ctx) {
    const rng = new XOR128(this.date.getTime());

    for (let x = 0; x < this._cols; x++) {
      for (let y = 0; y < this._rows; y++) {
        const a = rng.random_bool() ? Math.PI / 4 : -Math.PI / 4;
        ctx.save();
        ctx.translate((x + 0.5) * this._scl, (y + 0.5) * this._scl);
        ctx.scale(this.scl, this.scl);
        ctx.rotate(a);
        ctx.strokeStyle = this.white;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this._scl / 2, 0);
        ctx.lineTo(this._scl / 2, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    this._last_update = this.date.getTime();
  }

  get title() {
    return "XOR128 Clock";
  }

  get description() {
    return "This clock is based on the XOR128 random number generator. Every millisecond it gets seeded with the current time; each of the line is then rotated in a random direction by 45 degrees. It's actually impossible to read the time on this one, but since the algorithm is fully repeatable, there could be a way of finding out the time by starting from a screenshot. Completely useless, I know. And I am so proud of it.";
  }
}

export {
  BarClock,
  BinaryClock,
  CircleClock,
  FrequencySineClock,
  GearClock,
  LinesBinaryClock,
  LinesClock,
  ModulatedSineClock,
  MultipleCirclesClock,
  OnlyOneRightClock,
  PolygonClock,
  ShuffledClock,
  SineClock,
  SmallCirclesClock,
  SmallLinesClock,
  SmallSquaresClock,
  SquaresClock,
  TriangleClock,
  XOR128Clock,
};

import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { ClockFactory } from "./clock_factory.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.85;
  }

  setup() {
    this._clockFactory = new ClockFactory();
    this._clock = this._clockFactory.createNext();
  }

  draw() {
    const date = new Date();
    this._clock.update(date);

    // draw background
    this.background("rgb(15, 15, 15)");
    this.ctx.save();
    // translate and scale
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._clock.show(this.ctx);
    this.ctx.restore();
  }

  click(x, y) {
    if (x < this.width / 2) this._clock = this._clockFactory.createNext();
    else this._clock = this._clockFactory.createPrevious();
  }

  keyPress(key, _) {
    switch (key) {
      case "e":
        this._clock = this._clockFactory.createNext();
        break;
      case "q":
        this._clock = this._clockFactory.createPrevious();
        break;
      default:
        break;
    }
  }
}

export { Sketch };

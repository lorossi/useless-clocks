import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { ClockFactory } from "./clock_factory.js";
import { Description } from "./description.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.85;
    this._background_color = Color.fromMonochrome(15);
    // callback for description
    document
      .querySelector("#description")
      .addEventListener("click", () => this._showDescription());
    this._description = new Description();
  }

  setup() {
    this._clockFactory = new ClockFactory();
    console.log(this._clockFactory.getDescriptions());
    this._clock = this._clockFactory.createNext();
  }

  draw() {
    const date = new Date();
    this._clock.update(date);

    // draw background
    this.background(this._background_color.rgb);
    this.ctx.save();

    // translate and scale to accomodate for description
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    // draw clock
    this.ctx.translate(-this.width / 2, -this.height / 2);
    this._clock.show(this.ctx);

    this.ctx.restore();
  }

  click(x, y) {
    if (this._description.visible) return;

    if (x > this.width / 5) this._clock = this._clockFactory.createNext();
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

  _showDescription() {
    this._description.setDescription(this._clock.description);
    this._description.show();
  }
}

export { Sketch };

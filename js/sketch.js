import { Engine, SimplexNoise, Point, Color } from "./engine.js";
import { XOR128 } from "./xor128.js";
import { ClockFactory } from "./clock_factory.js";
import { Description } from "./description.js";

class Sketch extends Engine {
  preload() {
    this._scl = 0.85;
    this._background_color = Color.fromMonochrome(15);
    this._random_time = false;
    this._auto_recording = false;

    // recording options
    this._recording = false;
    this._recording_duration = 600;
    this._recorded = 0;

    // callback for description
    document
      .querySelector("#description")
      .addEventListener("click", () => this._showDescription());
    this._description = new Description();
  }

  setup() {
    const seed = new Date().getTime();
    this._xor128 = new XOR128(seed);
    this._clockFactory = new ClockFactory(
      this._xor128,
      true,
      this._random_time
    );
    this._clock = this._clockFactory.createNext();

    if (this._random_time)
      console.log(
        "%crandom time is on!",
        "color: #f00;font-weight: bold;font-size: 4em;"
      );

    if (this._auto_recording) this._startRecording();
  }

  draw() {
    const date = new Date();
    this._drawClock(date);

    if (
      this._recording &&
      this.frameCount - this._recording_started >= this._recording_duration
    ) {
      this._stopRecording();

      this._recorded++;
      if (this._auto_recording) {
        if (this._recorded < ClockFactory.types.length) {
          this._clock = this._clockFactory.createNext();
          this._drawClock(date);
          this._startRecording();
        } else {
          console.log("auto-recording finished");
        }
      }
    }
  }

  _drawClock(date) {
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

  keyPress(_, code) {
    if (this._recording) return;

    switch (code) {
      case 101:
      case 69: // e
        this._clock = this._clockFactory.createNext();
        break;
      case 113:
      case 81: // q
        this._clock = this._clockFactory.createPrevious();
        break;
      case 32: // space
        this._startRecording();
        break;
      default:
        break;
    }
  }

  _startRecording() {
    this._recording = true;
    this.startRecording();
    this._recording_started = this.frameCount;
    console.log("recording started");
  }

  _stopRecording() {
    this._recording = false;

    const filename =
      this._clock.title.replace(/\s/g, "_").toLowerCase() + ".zip";

    this.stopRecording();
    this.saveRecording(filename);
    console.log("recording stopped");
  }

  _showDescription() {
    this._description.setTitle(this._clock.title);
    this._description.setDescription(this._clock.description);
    this._description.show();
  }
}

export { Sketch };

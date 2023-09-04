/**
 * HTML canvas simple engine.
 * GitHub repo and documentation: https://github.com/lorossi/empty-html5-canvas-project
 * @author Lorenzo Rossi <mail@lorenzoros.si>
 * @license MIT - 2022
 */

import { XOR128 } from "./xor128.js";
import {
  createNoise2D,
  createNoise3D,
  createNoise4D,
} from "./simplex-noise.js";

/** Class containing the main engine running a canvas */
class Engine {
  /**
   * Create the engine controlling a canvas
   * @param {Object} canvas DOM element containing the canvas
   * @param {Object} ctx Drawing context of the canvas
   * @param {number} [fps=60] Frames per second
   */
  constructor(canvas, ctx, fps = 60) {
    this._canvas = canvas;
    this._ctx = ctx;
    this._fps = fps;

    // init variables
    this._frameCount = 0;
    this._actualFrameRate = 0;
    this._noLoop = false;
    this._then = null;
    this._is_recording = false;
    this._first_frame_recorded = 0;
    this._frames_recorded = 0;
    this._zip = null;

    // mouse coordinates
    this._mouseCoords = new Point(0, 0);
    this._prevMouseCoords = new Point(0, 0);

    // start sketch
    this._setFps(this._fps);
    this._run();
  }

  /**
   * Sets the fps for the current sketch
   * @private
   */
  _setFps(fps) {
    // keep track of time to handle fps
    this._then = performance.now();
    // save fps value
    this._fps = fps;
    // time between frames
    this._fps_interval = 1 / this._fps;
  }

  /**
   * Starts the sketch
   * @private
   */
  _run() {
    this.preload();
    this.setup();
    // anti alias
    this._ctx.imageSmoothingQuality = "high";
    this._timeDraw();
  }

  /**
   * Handles time update
   * @private
   */

  _timeDraw() {
    window.requestAnimationFrame(this._timeDraw.bind(this));

    if (!this._then) this._then = performance.now();

    // time calculations
    const now = performance.now();
    const diff = (now - this._then) / 1000;
    // is it time to draw the next frame?
    if (diff < this._fps_interval || this._noLoop) return;

    // now draw
    this._ctx.save();
    this.draw();
    this._ctx.restore();
    // save current frame if recording
    if (this._is_recording) {
      // compute frame name
      const frame_count = this._frameCount - this._first_frame_recorded;
      const filename = frame_count.toString().padStart(7, 0) + ".png";
      // extract data from canvas
      const data = this._canvas.toDataURL("image/png").split(";base64,")[1];
      // add frame to zip
      this._zip.file(filename, data, { base64: true });
      // update the count of recorded frames
      this._frames_recorded++;
    }

    // update frame count
    this._frameCount++;
    // updated last frame rendered time
    this._then = now - (diff % this._fps_interval);
    // update framerate getter
    this._actualFrameRate = 1 / diff;
  }

  /**
   * Starts looping the script
   */
  loop() {
    this._noLoop = false;
  }

  /**
   * Stops looping the script
   */
  noLoop() {
    this._noLoop = true;
  }

  /**
   * Start recording frames
   */
  startRecording() {
    this._is_recording = true;
    this._first_frame_recorded = this._frameCount;
    this._frames_recorded = 0;
    this._zip = new JSZip();
  }

  /**
   * Stop recording frames
   */
  stopRecording() {
    this._is_recording = false;
  }

  /**
   * Save the recording as a series of frames in a zip file
   *
   * @param {str} filename of the file to download
   */
  saveRecording(filename = "frames.zip") {
    // if the recording is not active, do nothing
    // also skipped if no frame has been recorded
    if (this._is_recording || this._zip == null || this._frames_recorded == 0)
      return;

    // download zip file
    this._zip.generateAsync({ type: "blob" }).then((blob) => {
      // convert blob to url
      const data = URL.createObjectURL(blob);
      //
      this._downloadFile(filename, data);
    });
  }

  /**
   * Save current frame
   * @param {string} [title] The image filename (optional).
   */
  saveFrame(title = null) {
    if (title == null)
      title = "frame-" + this._frameCount.toString().padStart(6, 0);

    this._downloadFile(title, this._canvas.toDataURL("image/png"));
  }

  /**
   * Returns the coordinates corresponding to a mouse/touch event
   * @param {Object} e event
   * @returns {Point} x,y coordinates
   * @private
   */
  _calculatePressCoords(e) {
    // calculate size ratio
    const boundingBox = this._canvas.getBoundingClientRect();
    const ratio =
      Math.min(boundingBox.width, boundingBox.height) /
      this._canvas.getAttribute("width");
    // calculate real mouse/touch position
    if ("touches" in e) {
      // we're dealing with a touchscreen
      if (e.touches.length > 0) {
        // touch has been pressed
        const tx = (e.touches[0].pageX - boundingBox.left) / ratio;
        const ty = (e.touches[0].pageY - boundingBox.top) / ratio;
        return new Point(tx, ty);
      }
      // touch has been released
      return new Point(-1, -1);
    } else {
      // we're dealing with a mouse
      const mx = (e.pageX - boundingBox.left) / ratio;
      const my = (e.pageY - boundingBox.top) / ratio;
      return new Point(mx, my);
    }
  }

  /**
   * Create and download a file
   * @param {str} filename
   * @param {str} data
   * @private
   */
  _downloadFile(filename, data) {
    // create file
    const container = document.createElement("a");

    container.href = data;
    container.setAttribute("download", filename);
    document.body.appendChild(container);
    // download file
    container.click();
    document.body.removeChild(container);
  }

  /**
   * Private callback for mouse click/touchscreen tap
   * @param {Object} e event
   * @private
   */
  _clickCallback(e) {
    const p = this._calculatePressCoords(e);
    this.click(p.x, p.y);
  }

  /**
   * Callback for mouse down
   * @param {Object} event
   * @private
   */
  _mouseDownCallback(e) {
    this._mouse_pressed = true;
    const p = this._calculatePressCoords(e);
    this.mouseDown(p.x, p.y);
  }

  /**
   * Callback for mouse up
   * @param {Object} event
   * @private
   */
  _mouseUpCallback(e) {
    this._mouse_pressed = false;
    const p = this._calculatePressCoords(e);
    this.mouseUp(p.x, p.y);
  }

  /**
   * Callback for moved mouse
   * @param {Object} e event
   * @private
   */
  _mouseMoveCallback(e) {
    const p = this._calculatePressCoords(e);

    // update mouse position
    this._prevMouseCoords = this._mouseCoords.copy();
    this._mouseCoords = p.copy();

    if (!this._mouse_pressed) {
      this.mouseMoved(p.x, p.y);
    } else {
      this.mouseDragged(p.x, p.y);
    }
  }

  /**
   * Callback for key pressed event
   * @param {Object} e event
   * @private
   */
  _keyDownCallback(e) {
    this.keyDown(e.key, e.keyCode);
  }

  _keyUpCallback(e) {
    this.keyUp(e.key, e.keyCode);
  }

  _keyPressCallback(e) {
    this.keyPress(e.key, e.keyCode);
  }

  /**
   * Public callback for mouse click and touchscreen tap
   * @param {number} x coordinate of the click/tap location
   * @param {number} y coordinate of the click/tap location
   */
  click(x, y) {}

  /**
   * Public callback for mouse and touchscreen pressed
   * @param {number} x coordinate of the click/tap location
   * @param {number} y coordinate of the click/tap location
   */
  mouseDown(x, y) {}

  /**
   * Public callback for mouse and touchscreen drag
   * @param {number} x coordinate of the click/tap location
   * @param {number} y coordinate of the click/tap location
   */
  mouseDragged(x, y) {}

  /**
   * Public callback for mouse and touchscreen up
   * @param {number} x coordinate of the click/tap location
   * @param {number} y coordinate of the click/tap location
   */
  mouseUp(x, y) {}

  /**
   * Public callback for mouse and touchscreen moved
   * @param {number} x coordinate of the click/tap location
   * @param {number} y coordinate of the click/tap location
   */
  mouseMoved(x, y) {}

  /**
   * Public callback for key press
   * @param {string} key
   * @param {number} code
   */
  keyPress(key, code) {}

  /**
   * Public callback for key down
   * @param {string} key
   * @param {number} code
   */
  keyDown(key, code) {}

  /**
   * Public callback for key up
   * @param {string} key
   * @param {number} code
   */
  keyUp(key, code) {}

  /**
   * Set the background color for the canvas
   * @param {String | Number} color
   */
  background(color) {
    // reset background
    this._ctx.save();
    // reset canvas
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    // set background
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    this._ctx.restore();
  }

  /**
   * Function ran once, before the sketch is actually loaded
   */
  preload() {}

  /**
   * Function ran once
   */
  setup() {}

  /**
   * Main sketch function, will be run continuously
   */
  draw() {}

  /**
   * Get the current drawing context
   * @returns {Object} The current drawing context
   */
  get ctx() {
    return this._ctx;
  }

  /**
   * Get the the current recording state
   * @returns {Boolean} The current recording state
   */
  get recording() {
    return this._is_recording;
  }

  /**
   * Get the current drawing canvas
   * @returns {Object} The current drawing canvas
   */
  get canvas() {
    return this._canvas;
  }

  /**
   * Get the count of frames since the start
   * @returns {number} The number of total frames
   */
  get frameCount() {
    return this._frameCount;
  }

  /**
   * Get the current framerate as frames per second (fps)
   * @returns {number} The current fps
   */
  get frameRate() {
    return this._actualFrameRate;
  }

  /**
   * Set a framerate
   * @param {number} f The desired framerate - optional
   */
  set frameRate(f) {
    this._setFps(f);
  }

  /**
   * Get the drawing area width
   * @returns {number} The drawing area width
   */
  get width() {
    return this._canvas.width;
  }

  /**
   * Get the drawing area height
   * @returns {number} The drawing area height
   */
  get height() {
    return this._canvas.height;
  }

  /**
   * Get the current recording state
   * @returns {Boolean} The current recording state
   */
  get is_recording() {
    return this._is_recording;
  }

  /**
   * Get the current mouse position
   * @returns {Point} The current mouse position
   * @readonly
   */
  get mousePosition() {
    return this._mouseCoords.copy();
  }

  /**
   * Get the previous mouse position
   *
   * @returns {Point} The previous mouse position
   * @readonly
   */
  get prevMousePosition() {
    return this._prevMouseCoords.copy();
  }
}

/** Class containing colors, either RGB or HSL */
class Color {
  /**
   * Create a color by setting the value of its channels.
   * Can be either RGB or HSL
   * @param {number} [a=0] The value of the first channel (red for RGB, hue for HSL)
   * @param {number} [b=0] The value of the second channel (green for RGB, saturation for HSL)
   * @param {number} [c=0] The value of the third channel (blue for RGB, lighting for HSL)
   * @param {number} [d=1] The value of the alpha channel
   * @param {Boolean} [rgb=true] If true, color will be interpreted as RGB. Otherwise, it will be interpreted as HSL
   */
  constructor(a = 0, b = 0, c = 0, d = 1, rgb = true) {
    if (rgb) {
      this._r = a;
      this._g = b;
      this._b = c;
      this._a = d;

      this._h = undefined;
      this._s = undefined;
      this._l = undefined;
      this._toHsl();
    } else {
      this._h = a;
      this._s = b;
      this._l = c;
      this._a = d;

      this._r = undefined;
      this._g = undefined;
      this._b = undefined;
      this._toRgb();
    }
  }

  equals(other, compare_alpha = true) {
    const epsilon = 0.0001;
    const float_eq = (a, b) => Math.abs(a - b) < epsilon;
    return (
      float_eq(this._r, other._r) &&
      float_eq(this._g, other._g) &&
      float_eq(this._b, other._b) &&
      (float_eq(this._a, other._a) || !compare_alpha)
    );
  }

  /**
   * Sets a color hue, saturation and lighting values
   * @param {number} h Color hue
   * @param {number} s Color saturation
   * @param {number} l Color lighting
   * @static
   */
  static fromHSL(h, s, l) {
    return new Color(h, s, l, 1, false);
  }

  /**
   * Sets a color red, green and blue channels values
   * @param {number} r Red value
   * @param {number} g Green value
   * @param {number} b Blue value
   * @static
   */
  fromRGB(r, g, b) {
    return new Color(r, g, b, 1, true);
  }

  /**
   * Converts a color from RGB to HSL
   * @private
   */
  _toHsl() {
    const r = this._r / 255;
    const g = this._g / 255;
    const b = this._b / 255;

    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    this._h = Math.floor(h * 360);
    this._s = Math.floor(s * 100);
    this._l = Math.floor(l * 100);
  }

  /**
   * Converts a color from HSL to RGB
   * @private
   */
  _toRgb() {
    if (this._s == 0) {
      this._r = this._l;
      this._g = this._l;
      this._b = this._l;
    } else {
      const hueToRgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const l = this._l / 100;
      const h = this._h / 360;
      const s = this._s / 100;

      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;

      this._r = Math.floor(hueToRgb(p, q, h + 1 / 3) * 255);
      this._g = Math.floor(hueToRgb(p, q, h) * 255);
      this._b = Math.floor(hueToRgb(p, q, h - 1 / 3) * 255);
    }
  }

  /**
   * Get the hexadecimal representation of a decimal number
   * @param {number} dec The decimal number
   * @private
   */
  _toHex(dec) {
    dec = Math.floor(dec);
    return dec.toString(16).padStart(2, 0).toUpperCase();
  }

  /**
   * Get the decimal representation of a hexadecimal number
   * @param {number} hex The hexadecimal number
   * @private
   */
  _toDec(hex) {
    return parseInt(hex, 16);
  }

  /**
   * Clamps a value between an interval
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   * @private
   */
  _clamp(value, min, max) {
    return Math.min(Math.max(min, value), max);
  }

  /**
   * Wraps a value into an interval
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   * @private
   */
  _wrap(value, min, max) {
    while (value > max) value -= max - min;
    while (value < min) value += max - min;
    return value;
  }

  set hex(h) {
    this._r = this._toDec(h.slice(1, 3));
    this._g = this._toDec(h.slice(3, 5));
    this._b = this._toDec(h.slice(5, 7));

    const a = parseInt(h.slice(7, 9), 16);
    if (isNaN(a)) this._a = 1;
    else this._a = a;

    this._toHsl();
  }

  get hex() {
    return `#${this._toHex(this._r)}${this._toHex(this._g)}${this._toHex(
      this._a
    )}`;
  }

  get rgb() {
    return `rgb(${this._r}, ${this._g}, ${this._b})`;
  }

  get rgba() {
    return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
  }

  get hsl() {
    return `hsl(${this._h}, ${this._s}%, ${this._l}%)`;
  }

  get hsla() {
    return `hsla(${this._h}, ${this._s}%, ${this._l}%, ${this._a})`;
  }

  get r() {
    return this._r;
  }

  set r(x) {
    this._r = Math.floor(this._clamp(x, 0, 255));
    this._toHsl();
  }

  get g() {
    return this._g;
  }

  set g(x) {
    this._g = Math.floor(this._clamp(x, 0, 255));
    this._toHsl();
  }

  get b() {
    return this._b;
  }

  set b(x) {
    this._b = Math.floor(this._clamp(x, 0, 255));
    this._toHsl();
  }

  get a() {
    return this._a;
  }

  set a(x) {
    this._a = this._clamp(x, 0, 1);
  }

  get h() {
    return this._h;
  }

  set h(x) {
    this._h = Math.floor(this._wrap(x, 0, 360));
    this._toRgb();
  }

  get s() {
    return this._s;
  }

  set s(x) {
    this._s = Math.floor(this._clamp(x, 0, 100));
    this._toRgb();
  }

  get l() {
    return this._l;
  }

  set l(x) {
    this._l = Math.floor(this._clamp(x, 0, 255));
    this._toRgb();
  }

  get monochrome() {
    if (this._r == this._g && this._g == this._b) return this._r;
    else return false;
  }

  set monochrome(s) {
    this._r = s;
    this._g = s;
    this._b = s;
    this._toHsl();
  }
}

/** Class containing a simple 2D point */
class Point {
  /**
   * Create a point by its coordinates
   * @param {number} x x-coordinate
   * @param {number} y y-coordinate
   */
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  /**
   * Return a copy of the point
   * @returns {Point}
   */
  copy() {
    return new Point(this._x, this._y);
  }

  /**
   * Return the distance between two points
   * @param {Point} p1
   * @returns {number}
   */
  distance(p) {
    return Math.sqrt((p.x - this._x) ** 2 + (p.y - this._y) ** 2);
  }

  /**
   * Returns true if the point is equal to another point
   * @param {Point} p
   * @returns {number}
   */
  equals(p) {
    const epsilon = 0.0001;
    const float_eq = (a, b) => Math.abs(a - b) < epsilon;
    return float_eq(this._x, p.x) && float_eq(this._y, p.y);
  }

  /**
   * Returns the point as a string
   * @returns {string}
   */
  toString() {
    return `(${this._x}, ${this._y})`;
  }

  /**
   * Returns the point x coordinate
   * @returns {number}
   */
  get x() {
    return this._x;
  }

  /**
   * Sets the point x coordinate
   * @param {number} nx
   */
  set x(nx) {
    this._x = nx;
  }

  /**
   * Returns the point y coordinate
   * @returns {number}
   */
  get y() {
    return this._y;
  }

  /**
   * Sets the point y coordinate
   * @param {number} ny
   */
  set y(ny) {
    this._y = ny;
  }
}

/** Class handling simplex noise.
 * This class interfaces with the SimplexNoise library by Jonas Wagner.
 * The number generation is taken care of by my xor128 library.
 */
class SimplexNoise {
  /**
   * Create a noise object
   * @param {Number|String|Array} seed The seed for the noise (optional)
   */
  constructor(seed = null) {
    // initialize the random function with the seed
    // it needs to be passed to the noise function
    // If no seed is passed, a random seed is generated

    let rand_f;

    if (seed) {
      let x, y, z, w;

      // initialize the four seed values
      if (typeof seed === "number") {
        // if the seed is a number, use it as the seed
        // i'm not sure that this is the best way to do this
        if (seed >= 2 ** 32) seed %= 2 ** 32; // make sure the seed is a 32-bit number
        x = seed;
        y = seed + 1;
        z = seed + 2;
        w = seed + 3;
      } else if (typeof seed === "string") {
        // if the seed is a string, use its hash as the seed
        const h = this._hash(seed);
        // i'm not sure that this is the best way to do this
        x = h;
        y = h + 1;
        z = h + 2;
        w = h + 3;
      } else if (Array.isArray(seed)) {
        // pass the seeds to the random function
        x = seed[0];
        y = seed[1];
        z = seed[2];
        w = seed[3];
      }
      rand_f = new XOR128(x, y, z, w);
    } else {
      // no seed is passed, generate a random seed
      rand_f = new XOR128();
    }

    // initialize the noise function with the random function
    this._noise = {
      2: createNoise2D(rand_f),
      3: createNoise3D(rand_f),
      4: createNoise4D(rand_f),
    };

    // set the octaves and falloff
    this._octaves = 1;
    this._falloff = 0.5;
  }

  /**
   * Simple hash function
   *
   * @param {string} string to be hashed
   * @returns {number} hash
   * @private
   */
  _hash(string) {
    let hash = 0;
    if (string.length == 0) return hash;

    for (let i = 0; i < string.length; i++) {
      const char = string.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Get the noise value at a given point
   * @param {number} x x-coordinate
   * @param {number} [y] y-coordinate
   * @param {number} [z] z-coordinate
   * @param {number} [w] w-coordinate
   * @returns {number} Noise value at the given point in range [-1, 1]
   */
  noise(x, y = null, z = null, w = null) {
    let n = 0;
    let amp = 1;
    let freq = 1;

    // calculate the number of parameters and the noise function to use
    const dim = Math.min(Math.max(arguments.length, 1), 4);
    // iterate over the octaves to five a more detailed noise value
    for (let i = 0; i < this._octaves; i++) {
      n += this._noise[dim](x * freq, y * freq, z * freq, w * freq) * amp;
      amp *= this._falloff;
      freq *= 1 / this._falloff;
    }

    return n;
  }

  /**
   *
   * @param {number} octaves Number of octaves to use
   * @param {number} falloff Falloff of the noise
   */
  setDetail(octaves = 1, falloff = 0.5) {
    this._octaves = octaves;
    this._falloff = falloff;
  }

  /**
   * Set the number of octaves to use
   */
  set octaves(o) {
    this._octaves = o;
  }

  /**
   * Get the number of octaves to use
   * @returns {number} Number of octaves
   */
  get octaves() {
    return this._octaves;
  }

  /**
   * Set the falloff of the noise
   */
  set falloff(f) {
    this._falloff = f;
  }

  /**
   * Get the falloff of the noise
   * @returns {number} Falloff
   */
  get falloff() {
    return this._falloff;
  }
}

export { Point, Color, Engine, SimplexNoise };

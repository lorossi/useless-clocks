/**
 * @file inject.js
 * @description This file is the entry point of the project. It is responsible for creating the canvas and the sketch object.
 */
import { Sketch } from "./sketch.js";

document.addEventListener("DOMContentLoaded", () => {
  // page loaded
  let canvas, ctx, s;
  canvas = document.querySelector("#sketch");
  // inject canvas in page
  if (canvas.getContext) {
    ctx = canvas.getContext("2d", { alpha: false });
    s = new Sketch(canvas, ctx);
  }

  // mouse event listeners
  canvas.addEventListener("click", (e) => s._clickCallback(e));
  canvas.addEventListener("mousedown", (e) => s._mouseDownCallback(e));
  canvas.addEventListener("mouseup", (e) => s._mouseUpCallback(e));
  canvas.addEventListener("mousemove", (e) => s._mouseMoveCallback(e));
  // touchscreen event listeners
  canvas.addEventListener("touchstart", (e) => s._mouseDownCallback(e), {
    passive: true,
  });
  canvas.addEventListener("touchend", (e) => s._mouseUpCallback(e), {
    passive: true,
  });
  canvas.addEventListener("touchmove", (e) => s._mouseMoveCallback(e), {
    passive: true,
  });
  // keyboard event listeners
  document.addEventListener("keypress", (e) => s._keyPressCallback(e));
  document.addEventListener("keydown", (e) => s._keyDownCallback(e));
  document.addEventListener("keyup", (e) => s._keyUpCallback(e));
});

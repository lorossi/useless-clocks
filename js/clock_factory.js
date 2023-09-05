import {
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
} from "./clock.js";

const CLOCKS_MAP = {
  polygon: PolygonClock,
  only_one_right: OnlyOneRightClock,
  small_lines: SmallLinesClock,
  small_squares: SmallSquaresClock,
  squares: SquaresClock,
  lines: LinesClock,
  bar: BarClock,
  binary: BinaryClock,
  circle: CircleClock,
  gear: GearClock,
  random: RandomClock,
  triangle: TriangleClock,
  sine: SineClock,
};

class ClockFactory {
  constructor() {
    this._index = 0;
  }

  createNext() {
    const type = ClockFactory.types[this._index];
    this._index = (this._index + 1) % ClockFactory.types.length;
    return ClockFactory.create(type);
  }

  static create(type) {
    if (type in CLOCKS_MAP) return new CLOCKS_MAP[type]();

    throw new TypeError(`Invalid clock type: ${type}`);
  }

  static get types() {
    return Object.keys(CLOCKS_MAP);
  }
}

export { ClockFactory };

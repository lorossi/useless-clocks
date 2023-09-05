import {
  BarClock,
  BinaryClock,
  CircleClock,
  FrequencySineClock,
  GearClock,
  LinesBinaryClock,
  LinesClock,
  ModulatesSineClock,
  OnlyOneRightClock,
  PolygonClock,
  ShuffledClock,
  SineClock,
  SmallCirclesClock,
  SmallLinesClock,
  SmallSquaresClock,
  SquaresClock,
  TriangleClock,
} from "./clock.js";

const CLOCKS_MAP = {
  small_lines: SmallLinesClock,
  lines_binary: LinesBinaryClock,
  small_circles: SmallCirclesClock,
  frequency_sine: FrequencySineClock,
  shuffled: ShuffledClock,
  modulates_sines: ModulatesSineClock,
  polygon: PolygonClock,
  only_one_right: OnlyOneRightClock,
  small_squares: SmallSquaresClock,
  squares: SquaresClock,
  lines: LinesClock,
  bar: BarClock,
  binary: BinaryClock,
  circle: CircleClock,
  gear: GearClock,
  triangle: TriangleClock,
  sine: SineClock,
};

class ClockFactory {
  constructor() {
    this._index = 0;
  }

  createNext(width = 1000, height = 1000) {
    const type = ClockFactory.types[this._index];
    this._index = (this._index + 1) % ClockFactory.types.length;
    return ClockFactory.create(type, width, height);
  }

  createPrevious(width = 1000, height = 1000) {
    const type = ClockFactory.types[this._index];
    this._index -= 1;
    if (this._index < 0) this._index = ClockFactory.types.length - 1;
    return ClockFactory.create(type, width, height);
  }

  static create(type, width = 1000, height = 1000) {
    if (type in CLOCKS_MAP) return new CLOCKS_MAP[type](width, height);

    throw new TypeError(`Invalid clock type: ${type}`);
  }

  static get types() {
    return Object.keys(CLOCKS_MAP);
  }
}

export { ClockFactory };

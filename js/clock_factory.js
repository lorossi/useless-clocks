import {
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
} from "./clock.js";

const CLOCKS_MAP = {
  bar: BarClock,
  binary: BinaryClock,
  circle: CircleClock,
  frequency_sine: FrequencySineClock,
  gear: GearClock,
  lines_binary: LinesBinaryClock,
  lines: LinesClock,
  modulated_sines_sines: ModulatedSineClock,
  multiple_circles: MultipleCirclesClock,
  only_one_right: OnlyOneRightClock,
  polygon: PolygonClock,
  shuffled: ShuffledClock,
  sine: SineClock,
  small_circles: SmallCirclesClock,
  small_lines: SmallLinesClock,
  small_squares: SmallSquaresClock,
  squares: SquaresClock,
  triangle: TriangleClock,
  xor128: XOR128Clock,
};

class ClockFactory {
  constructor() {
    this._index = 0;
  }

  getDescriptions() {
    return ClockFactory.types.map((type) => {
      const clock = ClockFactory.create(type);
      return {
        name: clock.title,
        description: clock.description,
      };
    });
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

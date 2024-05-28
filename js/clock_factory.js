import {
  AngleClock,
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
  StarClock,
  SquaresClock,
  TriangleClock,
  XOR128Clock,
} from "./clock.js";

const CLOCKS_LIST = [
  AngleClock,
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
  StarClock,
  SquaresClock,
  TriangleClock,
  XOR128Clock,
];

class ClockFactory {
  constructor(xor128, shuffle = true, random_time = false) {
    this._xor128 = xor128;
    this._shuffle = shuffle;
    this._random_time = random_time;

    this._clocks = [...CLOCKS_LIST];
    if (this._shuffle) this._clocks = this._xor128.shuffle(this._clocks);

    this._index = 0;
  }

  createNext(width = 1000, height = 1000) {
    const type = this._clocks[this._index];
    this._index = (this._index + 1) % this._clocks.length;
    return ClockFactory._create(type, width, height, this._random_time);
  }

  createPrevious(width = 1000, height = 1000) {
    const type = this._clocks[this._index];
    this._index = this._index == 0 ? this._clocks.length - 1 : this._index - 1;
    return ClockFactory._create(type, width, height, this._random_time);
  }

  static createClock(type, width = 1000, height = 1000, random_time = false) {
    if (!ClockFactory.types.includes(type))
      throw new Error(`Unknown type ${type}`);

    const index = ClockFactory.types.findIndex((t) => t == type);
    const cls = CLOCKS_LIST[index];

    return ClockFactory._create(cls, width, height, random_time);
  }

  static _create(cls, width = 1000, height = 1000, random_time = false) {
    if (CLOCKS_LIST.includes(cls)) return new cls(width, height, random_time);

    throw new Error(`Unknown type ${cls}`);
  }

  static get types() {
    return [...CLOCKS_LIST.map((c) => c.toString().split(" ")[1])];
  }
}

export { ClockFactory };

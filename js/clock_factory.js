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
  constructor(xor128, shuffle = true) {
    this._xor128 = xor128;
    this._shuffle = shuffle;

    this._clocks = [...CLOCKS_LIST];
    if (this._shuffle) this._clocks = this._xor128.shuffle(this._clocks);

    this._index = 0;
  }

  createNext(width = 1000, height = 1000) {
    const type = this._clocks[this._index];
    this._index = (this._index + 1) % this._clocks.length;
    return ClockFactory._create(type, width, height);
  }

  createPrevious(width = 1000, height = 1000) {
    const type = this._clocks[this._index];
    this._index = this._index == 0 ? this._clocks.length - 1 : this._index--;
    return ClockFactory._create(type, width, height);
  }

  static createClock(type, width = 1000, height = 1000) {
    if (!ClockFactory.types.includes(type))
      throw new Error(`Unknown type ${type}`);

    const index = ClockFactory.types.findIndex((t) => t == type);
    const cls = CLOCKS_LIST[index];

    return ClockFactory._create(cls, width, height);
  }

  static _create(cls, width = 1000, height = 1000) {
    if (CLOCKS_LIST.includes(cls)) return new cls(width, height);

    throw new Error(`Unknown type ${cls}`);
  }

  static get types() {
    return [...CLOCKS_LIST.map((c) => c.toString().split(" ")[1])];
  }
}

export { ClockFactory };

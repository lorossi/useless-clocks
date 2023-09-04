/**
 * XOR128 js implementation
 * @version 1.1.0
 * @author Lorenzo Rossi - https://www.lorenzoros.si - https://github.com/lorossi/
 * @license MIT
 */

class XOR128 {
  /**
   * XOR128 pseudo-random number generator.
   * Based on the implementation by WizCorp https://github.com/Wizcorp/xor128/
   * All parameters are optional, if nothing is passed a random value from
   *  js functions Math.random() will be used
   *
   * @param {number|Array} [x] first seed or array of seeds. \
   *  If an array is passed, the first 4 elements will be used as seeds
   * @param {number} [y] second seed
   * @param {number} [z] third seed
   * @param {number} [w] fourth seed
   * @returns {XOR128}
   */
  constructor(x = null, y = null, z = null, w = null) {
    if (x instanceof Array) {
      if (x.length > 4) throw new Error("XOR128: too many seeds");

      for (let i = x.length; i < 4; i++) x.push(x[i - 1] + 1);

      return new XOR128(x[0], x[1], x[2], x[3]);
    }

    if (x == null) x = Math.floor(Math.random() * 4294967296);

    if (y == null) {
      if (x != null) {
        y = x + 1;
      } else {
        y = Math.floor(Math.random() * 4294967296);
      }
    }

    if (z == null) {
      if (y != null) {
        z = y + 1;
      } else {
        z = Math.floor(Math.random() * 4294967296);
      }
    }

    if (w == null) {
      if (z != null) {
        w = z + 1;
      } else {
        w = Math.floor(Math.random() * 4294967296);
      }
    }

    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof z !== "number" ||
      typeof w !== "number"
    )
      throw new Error("XOR128: seed values must be numbers");

    if (x < 1 || y < 1 || z < 1 || w < 1)
      throw new Error("XOR128: seed values must be greater than 0");

    if (arguments.length > 4) throw new Error("XOR128: too many arguments");

    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
  }

  /**
   * Returns a random number in range [a, b) (i.e. a included, b excluded)
   * If only one parameter is passed, the random number will be generated in range [0, a)
   * If no parameters are passed, the random number will be generated in range [0, 1)
   *
   * @param {number} [a] if two parameters are passed, minimum range value; maximum range value otherwise
   * @param {number} [b] maximum range value
   * @returns {number} random number
   */
  random(a = null, b = null) {
    if (a == null && b == null) {
      a = 0;
      b = 1;
    } else if (b == null) {
      b = a;
      a = 0;
    }

    if (a > b)
      throw new Error("XOR128: first parameter must be smaller than second");

    if (!(typeof a === "number" && typeof b === "number"))
      throw new Error("XOR128: parameters must be numbers");

    const t = this._x ^ ((this._x << 11) >>> 0);

    this._x = this._y;
    this._y = this._z;
    this._z = this._w;
    this._w = (this._w ^ (this._w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;

    return (this._w / 4294967296) * (b - a) + a;
  }

  /**
   * Returns a random integer in range [a, b) (i.e. a included, b excluded)
   * If only one parameter is passed, the random number will be generated in range [0, a)
   * If no parameters are passed, the random number will be generated in range [0, 1]
   *
   * @param {number} [a] if two parameters are passed, minimum range value; maximum range value otherwise
   * @param {number} [b] maximum range value
   * @returns {number} random number
   */
  random_int(a = null, b = null) {
    if (a == null && b == null) {
      a = 0;
      b = 2;
    } else if (b == null) {
      b = a;
      a = 0;
    }

    return Math.floor(this.random(a, b));
  }

  /**
   * Returns a random boolean
   *
   * @returns {Boolean} random boolean
   */
  random_bool() {
    return this.random() > 0.5;
  }

  /**
   * Returns a random string
   *
   * @param {number} [length=10] length of the string
   * @param {string} [chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"] characters to use
   */
  random_string(
    length = 10,
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  ) {
    let str = "";

    for (let i = 0; i < length; i++)
      str += chars[this.random_int(0, chars.length)];

    return str;
  }

  /**
   * Returns a random integer in range (average - interval, average + interval)
   * If only one parameter is passed, the random number will be generated in range (average - 0.5, average + 0.5)
   * If no parameters are passed, the random number will be generated in range [0, 1]
   *
   * @param {number} [a=0.5] average value of the random numbers
   * @param {number} [b=0.5] semi interval of the random numbers
   * @returns {number} random number
   */
  random_interval(average = 0.5, interval = 0.5) {
    return this.random(average - interval, average + interval);
  }

  /**
   * Returns a random item from the provided array
   *
   * @param {Array} arr an array
   * @returns {any} item from input array
   */
  random_from_array(arr) {
    if (!(arr instanceof Array))
      throw new Error("XOR128: parameter must be an array");

    return arr[this.random_int(0, arr.length)];
  }

  /**
   * Returns a random char from the provided string
   *
   * @param {string} str a string
   * @returns {string} char from input string
   */
  random_from_string(str) {
    if (typeof str !== "string")
      throw new Error("XOR128: parameter must be a string");

    return str.charAt(this.random_int(0, str.length));
  }

  /**
   * Returns a random item from the provided array or a random char from the provided string
   *
   * @returns {any} item from input array or char from input string
   */
  pick(x) {
    if (x instanceof Array) return this.random_from_array(x);
    else if (typeof x === "string") return this.random_from_string(x);
    else throw new Error("XOR128: parameter must be an array or a string");
  }

  /**
   * Shuffles the provided array (the original array does not get shuffled)
   *
   * @param {Array} arr an array
   */
  shuffle_array(arr) {
    return [...arr]
      .map((s) => ({ sort: this.random(), value: s }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  }

  /**
   * Shuffles and returns a string
   *
   * @param {String} string the string to be shuffled
   * @returns {String}
   */
  shuffle_string(string) {
    return string
      .split("")
      .map((s) => ({ sort: this.random(), value: s }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value)
      .join("");
  }

  /**
   * Shuffles and returns an array or a string.
   *
   * @param {Array|String} x an array or a string
   * @returns {any} shuffled array or string
   */
  shuffle(x) {
    if (x instanceof Array) return this.shuffle_array(x);
    if (typeof x === "string") return this.shuffle_string(x);

    throw new Error("XOR128: parameter must be an array or a string");
  }
}

export { XOR128 };

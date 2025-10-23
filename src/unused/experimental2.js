const codeArray = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  62,
  null,
  62,
  null,
  63,
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  null,
  null,
  null,
  null,
  63,
  null,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51
]

function handleState(state) {
  const data = parseState(state);
  window.TEMP = data;
  debugger;
}

// The page loads with the user data encoded, which is saved temporarily in window.__PRELOADED_STATE__
Object.defineProperties(window, {
  ___PRELOADED_STATE__: {
    value: '',
    writable: true
  },
  __PRELOADED_STATE__: {
    get: function() {
      return this.___PRELOADED_STATE__;
    },
    set: function(val) {
      this.___PRELOADED_STATE__ = val;
      handleState(this.___PRELOADED_STATE__);
    },
    configurable: true
  }
});
// Decode the user data
function parseState(state) {
  function specialCharacterIndices(array) {
    let length = array.length;
    if (length % 4 > 0)
      throw new Error("Invalid charIndices. Length must be a multiple of 4");
    let equalsIndex = array.indexOf("=");
    return -1 === equalsIndex && (equalsIndex = length),
      [equalsIndex, equalsIndex === length ? 0 : 4 - equalsIndex % 4]
  }

  const parseByteArray = function(uint8Array) {
    let t;
    let n;
    let charIndices = specialCharacterIndices(uint8Array)
    let beginCharIndex = charIndices[0]
    let endCharIndex = charIndices[1]
    let u = new Uint8Array(function(e, t, n) {
      return 3 * (t + n) / 4 - n
    }(0, beginCharIndex, endCharIndex)), c = 0, d = endCharIndex > 0 ? beginCharIndex - 4 : beginCharIndex;
    for (n = 0; n < d; n += 4)
      t = codeArray[uint8Array.charCodeAt(n)] << 18 | codeArray[uint8Array.charCodeAt(n + 1)] << 12 | codeArray[uint8Array.charCodeAt(n + 2)] << 6 | codeArray[uint8Array.charCodeAt(n + 3)],
        u[c++] = t >> 16 & 255,
        u[c++] = t >> 8 & 255,
        u[c++] = 255 & t;
    return 2 === endCharIndex && (t = codeArray[uint8Array.charCodeAt(n)] << 2 | codeArray[uint8Array.charCodeAt(n + 1)] >> 4,
      u[c++] = 255 & t),
    1 === endCharIndex && (t = codeArray[uint8Array.charCodeAt(n)] << 10 | codeArray[uint8Array.charCodeAt(n + 1)] << 4 | codeArray[uint8Array.charCodeAt(n + 2)] >> 2,
      u[c++] = t >> 8 & 255,
      u[c++] = 255 & t),
      u
  }
  function toByteArray(e) {
    let q = /[^+/0-9A-Za-z-_]/g
    return parseByteArray(function(e) {
      if ((e = (e.split("=")[0]).trim().replace(q, "")).length < 2)
        return "";
      for (; e.length % 4 !== 0; )
        e += "=";
      return e
    }(e))
  }
  function toString(e) {
    return arrayToString(e, 0, e.length)
  }
  let T = 4096
  function arrayToString(e, t, n) {
    n = Math.min(e.length, n);
    const r = [];
    let a = t;
    for (; a < n; ) {
      const t = e[a];
      let o = null
        , i = t > 239 ? 4 : t > 223 ? 3 : t > 191 ? 2 : 1;
      if (a + i <= n) {
        let n, r, l, endCharIndex;
        switch (i) {
          case 1:
            t < 128 && (o = t);
            break;
          case 2:
            n = e[a + 1],
            128 == (192 & n) && (s = (31 & t) << 6 | 63 & n,
            s > 127 && (o = s));
            break;
          case 3:
            n = e[a + 1],
              r = e[a + 2],
            128 == (192 & n) && 128 == (192 & r) && (s = (15 & t) << 12 | (63 & n) << 6 | 63 & r,
            s > 2047 && (s < 55296 || s > 57343) && (o = s));
            break;
          case 4:
            n = e[a + 1],
              r = e[a + 2],
              l = e[a + 3],
            128 == (192 & n) && 128 == (192 & r) && 128 == (192 & l) && (s = (15 & t) << 18 | (63 & n) << 12 | (63 & r) << 6 | 63 & l,
            s > 65535 && s < 1114112 && (o = s))
        }
      }
      null === o ? (o = 65533,
        i = 1) : o > 65535 && (o -= 65536,
        r.push(o >>> 10 & 1023 | 55296),
        o = 56320 | 1023 & o),
        r.push(o),
        a += i
    }
    return function(e) {
      const t = e.length;
      if (t <= T)
        return String.fromCharCode.apply(String, e);
      let n = ""
        , r = 0;
      for (; r < t; )
        n += String.fromCharCode.apply(String, e.slice(r, r += T));
      return n
    }(r)
  }
  return JSON.parse(toString(toByteArray(state)))
}

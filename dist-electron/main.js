import Ut, { app as Et, BrowserWindow as $l, ipcMain as un, shell as Rl } from "electron";
import At from "fs";
import sd from "constants";
import Wn from "stream";
import $o from "util";
import Ol from "assert";
import te from "path";
import zr from "child_process";
import Il from "events";
import Yn from "crypto";
import Pl from "tty";
import Xr from "os";
import Tt from "url";
import ad from "string_decoder";
import Nl from "zlib";
import ld from "http";
import { fileURLToPath as cd } from "node:url";
import rt from "node:path";
import co from "node:fs";
var be = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Ce = {}, Mt = {}, Re = {};
Re.fromCallback = function(e) {
  return Object.defineProperty(function(...t) {
    if (typeof t[t.length - 1] == "function") e.apply(this, t);
    else
      return new Promise((n, r) => {
        t.push((i, o) => i != null ? r(i) : n(o)), e.apply(this, t);
      });
  }, "name", { value: e.name });
};
Re.fromPromise = function(e) {
  return Object.defineProperty(function(...t) {
    const n = t[t.length - 1];
    if (typeof n != "function") return e.apply(this, t);
    t.pop(), e.apply(this, t).then((r) => n(null, r), n);
  }, "name", { value: e.name });
};
var ut = sd, ud = process.cwd, Nr = null, fd = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return Nr || (Nr = ud.call(process)), Nr;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var Os = process.chdir;
  process.chdir = function(e) {
    Nr = null, Os.call(process, e);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, Os);
}
var dd = hd;
function hd(e) {
  ut.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && t(e), e.lutimes || n(e), e.chown = o(e.chown), e.fchown = o(e.fchown), e.lchown = o(e.lchown), e.chmod = r(e.chmod), e.fchmod = r(e.fchmod), e.lchmod = r(e.lchmod), e.chownSync = s(e.chownSync), e.fchownSync = s(e.fchownSync), e.lchownSync = s(e.lchownSync), e.chmodSync = i(e.chmodSync), e.fchmodSync = i(e.fchmodSync), e.lchmodSync = i(e.lchmodSync), e.stat = a(e.stat), e.fstat = a(e.fstat), e.lstat = a(e.lstat), e.statSync = c(e.statSync), e.fstatSync = c(e.fstatSync), e.lstatSync = c(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(l, f, h) {
    h && process.nextTick(h);
  }, e.lchmodSync = function() {
  }), e.chown && !e.lchown && (e.lchown = function(l, f, h, g) {
    g && process.nextTick(g);
  }, e.lchownSync = function() {
  }), fd === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(l) {
    function f(h, g, w) {
      var y = Date.now(), A = 0;
      l(h, g, function T(R) {
        if (R && (R.code === "EACCES" || R.code === "EPERM" || R.code === "EBUSY") && Date.now() - y < 6e4) {
          setTimeout(function() {
            e.stat(g, function(N, x) {
              N && N.code === "ENOENT" ? l(h, g, T) : w(R);
            });
          }, A), A < 100 && (A += 10);
          return;
        }
        w && w(R);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(f, l), f;
  }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(l) {
    function f(h, g, w, y, A, T) {
      var R;
      if (T && typeof T == "function") {
        var N = 0;
        R = function(x, ee, se) {
          if (x && x.code === "EAGAIN" && N < 10)
            return N++, l.call(e, h, g, w, y, A, R);
          T.apply(this, arguments);
        };
      }
      return l.call(e, h, g, w, y, A, R);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(f, l), f;
  }(e.read), e.readSync = typeof e.readSync != "function" ? e.readSync : /* @__PURE__ */ function(l) {
    return function(f, h, g, w, y) {
      for (var A = 0; ; )
        try {
          return l.call(e, f, h, g, w, y);
        } catch (T) {
          if (T.code === "EAGAIN" && A < 10) {
            A++;
            continue;
          }
          throw T;
        }
    };
  }(e.readSync);
  function t(l) {
    l.lchmod = function(f, h, g) {
      l.open(
        f,
        ut.O_WRONLY | ut.O_SYMLINK,
        h,
        function(w, y) {
          if (w) {
            g && g(w);
            return;
          }
          l.fchmod(y, h, function(A) {
            l.close(y, function(T) {
              g && g(A || T);
            });
          });
        }
      );
    }, l.lchmodSync = function(f, h) {
      var g = l.openSync(f, ut.O_WRONLY | ut.O_SYMLINK, h), w = !0, y;
      try {
        y = l.fchmodSync(g, h), w = !1;
      } finally {
        if (w)
          try {
            l.closeSync(g);
          } catch {
          }
        else
          l.closeSync(g);
      }
      return y;
    };
  }
  function n(l) {
    ut.hasOwnProperty("O_SYMLINK") && l.futimes ? (l.lutimes = function(f, h, g, w) {
      l.open(f, ut.O_SYMLINK, function(y, A) {
        if (y) {
          w && w(y);
          return;
        }
        l.futimes(A, h, g, function(T) {
          l.close(A, function(R) {
            w && w(T || R);
          });
        });
      });
    }, l.lutimesSync = function(f, h, g) {
      var w = l.openSync(f, ut.O_SYMLINK), y, A = !0;
      try {
        y = l.futimesSync(w, h, g), A = !1;
      } finally {
        if (A)
          try {
            l.closeSync(w);
          } catch {
          }
        else
          l.closeSync(w);
      }
      return y;
    }) : l.futimes && (l.lutimes = function(f, h, g, w) {
      w && process.nextTick(w);
    }, l.lutimesSync = function() {
    });
  }
  function r(l) {
    return l && function(f, h, g) {
      return l.call(e, f, h, function(w) {
        m(w) && (w = null), g && g.apply(this, arguments);
      });
    };
  }
  function i(l) {
    return l && function(f, h) {
      try {
        return l.call(e, f, h);
      } catch (g) {
        if (!m(g)) throw g;
      }
    };
  }
  function o(l) {
    return l && function(f, h, g, w) {
      return l.call(e, f, h, g, function(y) {
        m(y) && (y = null), w && w.apply(this, arguments);
      });
    };
  }
  function s(l) {
    return l && function(f, h, g) {
      try {
        return l.call(e, f, h, g);
      } catch (w) {
        if (!m(w)) throw w;
      }
    };
  }
  function a(l) {
    return l && function(f, h, g) {
      typeof h == "function" && (g = h, h = null);
      function w(y, A) {
        A && (A.uid < 0 && (A.uid += 4294967296), A.gid < 0 && (A.gid += 4294967296)), g && g.apply(this, arguments);
      }
      return h ? l.call(e, f, h, w) : l.call(e, f, w);
    };
  }
  function c(l) {
    return l && function(f, h) {
      var g = h ? l.call(e, f, h) : l.call(e, f);
      return g && (g.uid < 0 && (g.uid += 4294967296), g.gid < 0 && (g.gid += 4294967296)), g;
    };
  }
  function m(l) {
    if (!l || l.code === "ENOSYS")
      return !0;
    var f = !process.getuid || process.getuid() !== 0;
    return !!(f && (l.code === "EINVAL" || l.code === "EPERM"));
  }
}
var Is = Wn.Stream, pd = md;
function md(e) {
  return {
    ReadStream: t,
    WriteStream: n
  };
  function t(r, i) {
    if (!(this instanceof t)) return new t(r, i);
    Is.call(this);
    var o = this;
    this.path = r, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
    for (var s = Object.keys(i), a = 0, c = s.length; a < c; a++) {
      var m = s[a];
      this[m] = i[m];
    }
    if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.end === void 0)
        this.end = 1 / 0;
      else if (typeof this.end != "number")
        throw TypeError("end must be a Number");
      if (this.start > this.end)
        throw new Error("start must be <= end");
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        o._read();
      });
      return;
    }
    e.open(this.path, this.flags, this.mode, function(l, f) {
      if (l) {
        o.emit("error", l), o.readable = !1;
        return;
      }
      o.fd = f, o.emit("open", f), o._read();
    });
  }
  function n(r, i) {
    if (!(this instanceof n)) return new n(r, i);
    Is.call(this), this.path = r, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
    for (var o = Object.keys(i), s = 0, a = o.length; s < a; s++) {
      var c = o[s];
      this[c] = i[c];
    }
    if (this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.start < 0)
        throw new Error("start must be >= zero");
      this.pos = this.start;
    }
    this.busy = !1, this._queue = [], this.fd === null && (this._open = e.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
  }
}
var gd = yd, Ed = Object.getPrototypeOf || function(e) {
  return e.__proto__;
};
function yd(e) {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Object)
    var t = { __proto__: Ed(e) };
  else
    var t = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(e).forEach(function(n) {
    Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(e, n));
  }), t;
}
var re = At, wd = dd, _d = pd, vd = gd, mr = $o, ye, Ur;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (ye = Symbol.for("graceful-fs.queue"), Ur = Symbol.for("graceful-fs.previous")) : (ye = "___graceful-fs.queue", Ur = "___graceful-fs.previous");
function Ad() {
}
function Dl(e, t) {
  Object.defineProperty(e, ye, {
    get: function() {
      return t;
    }
  });
}
var Lt = Ad;
mr.debuglog ? Lt = mr.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (Lt = function() {
  var e = mr.format.apply(mr, arguments);
  e = "GFS4: " + e.split(/\n/).join(`
GFS4: `), console.error(e);
});
if (!re[ye]) {
  var Td = be[ye] || [];
  Dl(re, Td), re.close = function(e) {
    function t(n, r) {
      return e.call(re, n, function(i) {
        i || Ps(), typeof r == "function" && r.apply(this, arguments);
      });
    }
    return Object.defineProperty(t, Ur, {
      value: e
    }), t;
  }(re.close), re.closeSync = function(e) {
    function t(n) {
      e.apply(re, arguments), Ps();
    }
    return Object.defineProperty(t, Ur, {
      value: e
    }), t;
  }(re.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    Lt(re[ye]), Ol.equal(re[ye].length, 0);
  });
}
be[ye] || Dl(be, re[ye]);
var Oe = Ro(vd(re));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !re.__patched && (Oe = Ro(re), re.__patched = !0);
function Ro(e) {
  wd(e), e.gracefulify = Ro, e.createReadStream = ee, e.createWriteStream = se;
  var t = e.readFile;
  e.readFile = n;
  function n(E, G, B) {
    return typeof G == "function" && (B = G, G = null), M(E, G, B);
    function M(X, O, C, P) {
      return t(X, O, function(b) {
        b && (b.code === "EMFILE" || b.code === "ENFILE") ? Vt([M, [X, O, C], b, P || Date.now(), Date.now()]) : typeof C == "function" && C.apply(this, arguments);
      });
    }
  }
  var r = e.writeFile;
  e.writeFile = i;
  function i(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), X(E, G, B, M);
    function X(O, C, P, b, D) {
      return r(O, C, P, function(I) {
        I && (I.code === "EMFILE" || I.code === "ENFILE") ? Vt([X, [O, C, P, b], I, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var o = e.appendFile;
  o && (e.appendFile = s);
  function s(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), X(E, G, B, M);
    function X(O, C, P, b, D) {
      return o(O, C, P, function(I) {
        I && (I.code === "EMFILE" || I.code === "ENFILE") ? Vt([X, [O, C, P, b], I, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var a = e.copyFile;
  a && (e.copyFile = c);
  function c(E, G, B, M) {
    return typeof B == "function" && (M = B, B = 0), X(E, G, B, M);
    function X(O, C, P, b, D) {
      return a(O, C, P, function(I) {
        I && (I.code === "EMFILE" || I.code === "ENFILE") ? Vt([X, [O, C, P, b], I, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var m = e.readdir;
  e.readdir = f;
  var l = /^v[0-5]\./;
  function f(E, G, B) {
    typeof G == "function" && (B = G, G = null);
    var M = l.test(process.version) ? function(C, P, b, D) {
      return m(C, X(
        C,
        P,
        b,
        D
      ));
    } : function(C, P, b, D) {
      return m(C, P, X(
        C,
        P,
        b,
        D
      ));
    };
    return M(E, G, B);
    function X(O, C, P, b) {
      return function(D, I) {
        D && (D.code === "EMFILE" || D.code === "ENFILE") ? Vt([
          M,
          [O, C, P],
          D,
          b || Date.now(),
          Date.now()
        ]) : (I && I.sort && I.sort(), typeof P == "function" && P.call(this, D, I));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var h = _d(e);
    T = h.ReadStream, N = h.WriteStream;
  }
  var g = e.ReadStream;
  g && (T.prototype = Object.create(g.prototype), T.prototype.open = R);
  var w = e.WriteStream;
  w && (N.prototype = Object.create(w.prototype), N.prototype.open = x), Object.defineProperty(e, "ReadStream", {
    get: function() {
      return T;
    },
    set: function(E) {
      T = E;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "WriteStream", {
    get: function() {
      return N;
    },
    set: function(E) {
      N = E;
    },
    enumerable: !0,
    configurable: !0
  });
  var y = T;
  Object.defineProperty(e, "FileReadStream", {
    get: function() {
      return y;
    },
    set: function(E) {
      y = E;
    },
    enumerable: !0,
    configurable: !0
  });
  var A = N;
  Object.defineProperty(e, "FileWriteStream", {
    get: function() {
      return A;
    },
    set: function(E) {
      A = E;
    },
    enumerable: !0,
    configurable: !0
  });
  function T(E, G) {
    return this instanceof T ? (g.apply(this, arguments), this) : T.apply(Object.create(T.prototype), arguments);
  }
  function R() {
    var E = this;
    Fe(E.path, E.flags, E.mode, function(G, B) {
      G ? (E.autoClose && E.destroy(), E.emit("error", G)) : (E.fd = B, E.emit("open", B), E.read());
    });
  }
  function N(E, G) {
    return this instanceof N ? (w.apply(this, arguments), this) : N.apply(Object.create(N.prototype), arguments);
  }
  function x() {
    var E = this;
    Fe(E.path, E.flags, E.mode, function(G, B) {
      G ? (E.destroy(), E.emit("error", G)) : (E.fd = B, E.emit("open", B));
    });
  }
  function ee(E, G) {
    return new e.ReadStream(E, G);
  }
  function se(E, G) {
    return new e.WriteStream(E, G);
  }
  var W = e.open;
  e.open = Fe;
  function Fe(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), X(E, G, B, M);
    function X(O, C, P, b, D) {
      return W(O, C, P, function(I, k) {
        I && (I.code === "EMFILE" || I.code === "ENFILE") ? Vt([X, [O, C, P, b], I, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  return e;
}
function Vt(e) {
  Lt("ENQUEUE", e[0].name, e[1]), re[ye].push(e), Oo();
}
var gr;
function Ps() {
  for (var e = Date.now(), t = 0; t < re[ye].length; ++t)
    re[ye][t].length > 2 && (re[ye][t][3] = e, re[ye][t][4] = e);
  Oo();
}
function Oo() {
  if (clearTimeout(gr), gr = void 0, re[ye].length !== 0) {
    var e = re[ye].shift(), t = e[0], n = e[1], r = e[2], i = e[3], o = e[4];
    if (i === void 0)
      Lt("RETRY", t.name, n), t.apply(null, n);
    else if (Date.now() - i >= 6e4) {
      Lt("TIMEOUT", t.name, n);
      var s = n.pop();
      typeof s == "function" && s.call(null, r);
    } else {
      var a = Date.now() - o, c = Math.max(o - i, 1), m = Math.min(c * 1.2, 100);
      a >= m ? (Lt("RETRY", t.name, n), t.apply(null, n.concat([i]))) : re[ye].push(e);
    }
    gr === void 0 && (gr = setTimeout(Oo, 0));
  }
}
(function(e) {
  const t = Re.fromCallback, n = Oe, r = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((i) => typeof n[i] == "function");
  Object.assign(e, n), r.forEach((i) => {
    e[i] = t(n[i]);
  }), e.exists = function(i, o) {
    return typeof o == "function" ? n.exists(i, o) : new Promise((s) => n.exists(i, s));
  }, e.read = function(i, o, s, a, c, m) {
    return typeof m == "function" ? n.read(i, o, s, a, c, m) : new Promise((l, f) => {
      n.read(i, o, s, a, c, (h, g, w) => {
        if (h) return f(h);
        l({ bytesRead: g, buffer: w });
      });
    });
  }, e.write = function(i, o, ...s) {
    return typeof s[s.length - 1] == "function" ? n.write(i, o, ...s) : new Promise((a, c) => {
      n.write(i, o, ...s, (m, l, f) => {
        if (m) return c(m);
        a({ bytesWritten: l, buffer: f });
      });
    });
  }, typeof n.writev == "function" && (e.writev = function(i, o, ...s) {
    return typeof s[s.length - 1] == "function" ? n.writev(i, o, ...s) : new Promise((a, c) => {
      n.writev(i, o, ...s, (m, l, f) => {
        if (m) return c(m);
        a({ bytesWritten: l, buffers: f });
      });
    });
  }), typeof n.realpath.native == "function" ? e.realpath.native = t(n.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(Mt);
var Io = {}, Fl = {};
const Sd = te;
Fl.checkPath = function(t) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(t.replace(Sd.parse(t).root, ""))) {
    const r = new Error(`Path contains invalid characters: ${t}`);
    throw r.code = "EINVAL", r;
  }
};
const xl = Mt, { checkPath: Ll } = Fl, Ul = (e) => {
  const t = { mode: 511 };
  return typeof e == "number" ? e : { ...t, ...e }.mode;
};
Io.makeDir = async (e, t) => (Ll(e), xl.mkdir(e, {
  mode: Ul(t),
  recursive: !0
}));
Io.makeDirSync = (e, t) => (Ll(e), xl.mkdirSync(e, {
  mode: Ul(t),
  recursive: !0
}));
const bd = Re.fromPromise, { makeDir: Cd, makeDirSync: $i } = Io, Ri = bd(Cd);
var Ze = {
  mkdirs: Ri,
  mkdirsSync: $i,
  // alias
  mkdirp: Ri,
  mkdirpSync: $i,
  ensureDir: Ri,
  ensureDirSync: $i
};
const $d = Re.fromPromise, kl = Mt;
function Rd(e) {
  return kl.access(e).then(() => !0).catch(() => !1);
}
var Bt = {
  pathExists: $d(Rd),
  pathExistsSync: kl.existsSync
};
const rn = Oe;
function Od(e, t, n, r) {
  rn.open(e, "r+", (i, o) => {
    if (i) return r(i);
    rn.futimes(o, t, n, (s) => {
      rn.close(o, (a) => {
        r && r(s || a);
      });
    });
  });
}
function Id(e, t, n) {
  const r = rn.openSync(e, "r+");
  return rn.futimesSync(r, t, n), rn.closeSync(r);
}
var Ml = {
  utimesMillis: Od,
  utimesMillisSync: Id
};
const sn = Mt, pe = te, Pd = $o;
function Nd(e, t, n) {
  const r = n.dereference ? (i) => sn.stat(i, { bigint: !0 }) : (i) => sn.lstat(i, { bigint: !0 });
  return Promise.all([
    r(e),
    r(t).catch((i) => {
      if (i.code === "ENOENT") return null;
      throw i;
    })
  ]).then(([i, o]) => ({ srcStat: i, destStat: o }));
}
function Dd(e, t, n) {
  let r;
  const i = n.dereference ? (s) => sn.statSync(s, { bigint: !0 }) : (s) => sn.lstatSync(s, { bigint: !0 }), o = i(e);
  try {
    r = i(t);
  } catch (s) {
    if (s.code === "ENOENT") return { srcStat: o, destStat: null };
    throw s;
  }
  return { srcStat: o, destStat: r };
}
function Fd(e, t, n, r, i) {
  Pd.callbackify(Nd)(e, t, r, (o, s) => {
    if (o) return i(o);
    const { srcStat: a, destStat: c } = s;
    if (c) {
      if (zn(a, c)) {
        const m = pe.basename(e), l = pe.basename(t);
        return n === "move" && m !== l && m.toLowerCase() === l.toLowerCase() ? i(null, { srcStat: a, destStat: c, isChangingCase: !0 }) : i(new Error("Source and destination must not be the same."));
      }
      if (a.isDirectory() && !c.isDirectory())
        return i(new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`));
      if (!a.isDirectory() && c.isDirectory())
        return i(new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`));
    }
    return a.isDirectory() && Po(e, t) ? i(new Error(Kr(e, t, n))) : i(null, { srcStat: a, destStat: c });
  });
}
function xd(e, t, n, r) {
  const { srcStat: i, destStat: o } = Dd(e, t, r);
  if (o) {
    if (zn(i, o)) {
      const s = pe.basename(e), a = pe.basename(t);
      if (n === "move" && s !== a && s.toLowerCase() === a.toLowerCase())
        return { srcStat: i, destStat: o, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (i.isDirectory() && !o.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
    if (!i.isDirectory() && o.isDirectory())
      throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
  }
  if (i.isDirectory() && Po(e, t))
    throw new Error(Kr(e, t, n));
  return { srcStat: i, destStat: o };
}
function Bl(e, t, n, r, i) {
  const o = pe.resolve(pe.dirname(e)), s = pe.resolve(pe.dirname(n));
  if (s === o || s === pe.parse(s).root) return i();
  sn.stat(s, { bigint: !0 }, (a, c) => a ? a.code === "ENOENT" ? i() : i(a) : zn(t, c) ? i(new Error(Kr(e, n, r))) : Bl(e, t, s, r, i));
}
function jl(e, t, n, r) {
  const i = pe.resolve(pe.dirname(e)), o = pe.resolve(pe.dirname(n));
  if (o === i || o === pe.parse(o).root) return;
  let s;
  try {
    s = sn.statSync(o, { bigint: !0 });
  } catch (a) {
    if (a.code === "ENOENT") return;
    throw a;
  }
  if (zn(t, s))
    throw new Error(Kr(e, n, r));
  return jl(e, t, o, r);
}
function zn(e, t) {
  return t.ino && t.dev && t.ino === e.ino && t.dev === e.dev;
}
function Po(e, t) {
  const n = pe.resolve(e).split(pe.sep).filter((i) => i), r = pe.resolve(t).split(pe.sep).filter((i) => i);
  return n.reduce((i, o, s) => i && r[s] === o, !0);
}
function Kr(e, t, n) {
  return `Cannot ${n} '${e}' to a subdirectory of itself, '${t}'.`;
}
var fn = {
  checkPaths: Fd,
  checkPathsSync: xd,
  checkParentPaths: Bl,
  checkParentPathsSync: jl,
  isSrcSubdir: Po,
  areIdentical: zn
};
const Ne = Oe, Pn = te, Ld = Ze.mkdirs, Ud = Bt.pathExists, kd = Ml.utimesMillis, Nn = fn;
function Md(e, t, n, r) {
  typeof n == "function" && !r ? (r = n, n = {}) : typeof n == "function" && (n = { filter: n }), r = r || function() {
  }, n = n || {}, n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  ), Nn.checkPaths(e, t, "copy", n, (i, o) => {
    if (i) return r(i);
    const { srcStat: s, destStat: a } = o;
    Nn.checkParentPaths(e, s, t, "copy", (c) => c ? r(c) : n.filter ? Hl(Ns, a, e, t, n, r) : Ns(a, e, t, n, r));
  });
}
function Ns(e, t, n, r, i) {
  const o = Pn.dirname(n);
  Ud(o, (s, a) => {
    if (s) return i(s);
    if (a) return kr(e, t, n, r, i);
    Ld(o, (c) => c ? i(c) : kr(e, t, n, r, i));
  });
}
function Hl(e, t, n, r, i, o) {
  Promise.resolve(i.filter(n, r)).then((s) => s ? e(t, n, r, i, o) : o(), (s) => o(s));
}
function Bd(e, t, n, r, i) {
  return r.filter ? Hl(kr, e, t, n, r, i) : kr(e, t, n, r, i);
}
function kr(e, t, n, r, i) {
  (r.dereference ? Ne.stat : Ne.lstat)(t, (s, a) => s ? i(s) : a.isDirectory() ? Yd(a, e, t, n, r, i) : a.isFile() || a.isCharacterDevice() || a.isBlockDevice() ? jd(a, e, t, n, r, i) : a.isSymbolicLink() ? Kd(e, t, n, r, i) : a.isSocket() ? i(new Error(`Cannot copy a socket file: ${t}`)) : a.isFIFO() ? i(new Error(`Cannot copy a FIFO pipe: ${t}`)) : i(new Error(`Unknown file: ${t}`)));
}
function jd(e, t, n, r, i, o) {
  return t ? Hd(e, n, r, i, o) : Gl(e, n, r, i, o);
}
function Hd(e, t, n, r, i) {
  if (r.overwrite)
    Ne.unlink(n, (o) => o ? i(o) : Gl(e, t, n, r, i));
  else return r.errorOnExist ? i(new Error(`'${n}' already exists`)) : i();
}
function Gl(e, t, n, r, i) {
  Ne.copyFile(t, n, (o) => o ? i(o) : r.preserveTimestamps ? Gd(e.mode, t, n, i) : Jr(n, e.mode, i));
}
function Gd(e, t, n, r) {
  return qd(e) ? Vd(n, e, (i) => i ? r(i) : Ds(e, t, n, r)) : Ds(e, t, n, r);
}
function qd(e) {
  return (e & 128) === 0;
}
function Vd(e, t, n) {
  return Jr(e, t | 128, n);
}
function Ds(e, t, n, r) {
  Wd(t, n, (i) => i ? r(i) : Jr(n, e, r));
}
function Jr(e, t, n) {
  return Ne.chmod(e, t, n);
}
function Wd(e, t, n) {
  Ne.stat(e, (r, i) => r ? n(r) : kd(t, i.atime, i.mtime, n));
}
function Yd(e, t, n, r, i, o) {
  return t ? ql(n, r, i, o) : zd(e.mode, n, r, i, o);
}
function zd(e, t, n, r, i) {
  Ne.mkdir(n, (o) => {
    if (o) return i(o);
    ql(t, n, r, (s) => s ? i(s) : Jr(n, e, i));
  });
}
function ql(e, t, n, r) {
  Ne.readdir(e, (i, o) => i ? r(i) : Vl(o, e, t, n, r));
}
function Vl(e, t, n, r, i) {
  const o = e.pop();
  return o ? Xd(e, o, t, n, r, i) : i();
}
function Xd(e, t, n, r, i, o) {
  const s = Pn.join(n, t), a = Pn.join(r, t);
  Nn.checkPaths(s, a, "copy", i, (c, m) => {
    if (c) return o(c);
    const { destStat: l } = m;
    Bd(l, s, a, i, (f) => f ? o(f) : Vl(e, n, r, i, o));
  });
}
function Kd(e, t, n, r, i) {
  Ne.readlink(t, (o, s) => {
    if (o) return i(o);
    if (r.dereference && (s = Pn.resolve(process.cwd(), s)), e)
      Ne.readlink(n, (a, c) => a ? a.code === "EINVAL" || a.code === "UNKNOWN" ? Ne.symlink(s, n, i) : i(a) : (r.dereference && (c = Pn.resolve(process.cwd(), c)), Nn.isSrcSubdir(s, c) ? i(new Error(`Cannot copy '${s}' to a subdirectory of itself, '${c}'.`)) : e.isDirectory() && Nn.isSrcSubdir(c, s) ? i(new Error(`Cannot overwrite '${c}' with '${s}'.`)) : Jd(s, n, i)));
    else
      return Ne.symlink(s, n, i);
  });
}
function Jd(e, t, n) {
  Ne.unlink(t, (r) => r ? n(r) : Ne.symlink(e, t, n));
}
var Qd = Md;
const Ae = Oe, Dn = te, Zd = Ze.mkdirsSync, eh = Ml.utimesMillisSync, Fn = fn;
function th(e, t, n) {
  typeof n == "function" && (n = { filter: n }), n = n || {}, n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: r, destStat: i } = Fn.checkPathsSync(e, t, "copy", n);
  return Fn.checkParentPathsSync(e, r, t, "copy"), nh(i, e, t, n);
}
function nh(e, t, n, r) {
  if (r.filter && !r.filter(t, n)) return;
  const i = Dn.dirname(n);
  return Ae.existsSync(i) || Zd(i), Wl(e, t, n, r);
}
function rh(e, t, n, r) {
  if (!(r.filter && !r.filter(t, n)))
    return Wl(e, t, n, r);
}
function Wl(e, t, n, r) {
  const o = (r.dereference ? Ae.statSync : Ae.lstatSync)(t);
  if (o.isDirectory()) return uh(o, e, t, n, r);
  if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice()) return ih(o, e, t, n, r);
  if (o.isSymbolicLink()) return hh(e, t, n, r);
  throw o.isSocket() ? new Error(`Cannot copy a socket file: ${t}`) : o.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${t}`) : new Error(`Unknown file: ${t}`);
}
function ih(e, t, n, r, i) {
  return t ? oh(e, n, r, i) : Yl(e, n, r, i);
}
function oh(e, t, n, r) {
  if (r.overwrite)
    return Ae.unlinkSync(n), Yl(e, t, n, r);
  if (r.errorOnExist)
    throw new Error(`'${n}' already exists`);
}
function Yl(e, t, n, r) {
  return Ae.copyFileSync(t, n), r.preserveTimestamps && sh(e.mode, t, n), No(n, e.mode);
}
function sh(e, t, n) {
  return ah(e) && lh(n, e), ch(t, n);
}
function ah(e) {
  return (e & 128) === 0;
}
function lh(e, t) {
  return No(e, t | 128);
}
function No(e, t) {
  return Ae.chmodSync(e, t);
}
function ch(e, t) {
  const n = Ae.statSync(e);
  return eh(t, n.atime, n.mtime);
}
function uh(e, t, n, r, i) {
  return t ? zl(n, r, i) : fh(e.mode, n, r, i);
}
function fh(e, t, n, r) {
  return Ae.mkdirSync(n), zl(t, n, r), No(n, e);
}
function zl(e, t, n) {
  Ae.readdirSync(e).forEach((r) => dh(r, e, t, n));
}
function dh(e, t, n, r) {
  const i = Dn.join(t, e), o = Dn.join(n, e), { destStat: s } = Fn.checkPathsSync(i, o, "copy", r);
  return rh(s, i, o, r);
}
function hh(e, t, n, r) {
  let i = Ae.readlinkSync(t);
  if (r.dereference && (i = Dn.resolve(process.cwd(), i)), e) {
    let o;
    try {
      o = Ae.readlinkSync(n);
    } catch (s) {
      if (s.code === "EINVAL" || s.code === "UNKNOWN") return Ae.symlinkSync(i, n);
      throw s;
    }
    if (r.dereference && (o = Dn.resolve(process.cwd(), o)), Fn.isSrcSubdir(i, o))
      throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${o}'.`);
    if (Ae.statSync(n).isDirectory() && Fn.isSrcSubdir(o, i))
      throw new Error(`Cannot overwrite '${o}' with '${i}'.`);
    return ph(i, n);
  } else
    return Ae.symlinkSync(i, n);
}
function ph(e, t) {
  return Ae.unlinkSync(t), Ae.symlinkSync(e, t);
}
var mh = th;
const gh = Re.fromCallback;
var Do = {
  copy: gh(Qd),
  copySync: mh
};
const Fs = Oe, Xl = te, J = Ol, xn = process.platform === "win32";
function Kl(e) {
  [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ].forEach((n) => {
    e[n] = e[n] || Fs[n], n = n + "Sync", e[n] = e[n] || Fs[n];
  }), e.maxBusyTries = e.maxBusyTries || 3;
}
function Fo(e, t, n) {
  let r = 0;
  typeof t == "function" && (n = t, t = {}), J(e, "rimraf: missing path"), J.strictEqual(typeof e, "string", "rimraf: path should be a string"), J.strictEqual(typeof n, "function", "rimraf: callback function required"), J(t, "rimraf: invalid options argument provided"), J.strictEqual(typeof t, "object", "rimraf: options should be object"), Kl(t), xs(e, t, function i(o) {
    if (o) {
      if ((o.code === "EBUSY" || o.code === "ENOTEMPTY" || o.code === "EPERM") && r < t.maxBusyTries) {
        r++;
        const s = r * 100;
        return setTimeout(() => xs(e, t, i), s);
      }
      o.code === "ENOENT" && (o = null);
    }
    n(o);
  });
}
function xs(e, t, n) {
  J(e), J(t), J(typeof n == "function"), t.lstat(e, (r, i) => {
    if (r && r.code === "ENOENT")
      return n(null);
    if (r && r.code === "EPERM" && xn)
      return Ls(e, t, r, n);
    if (i && i.isDirectory())
      return Dr(e, t, r, n);
    t.unlink(e, (o) => {
      if (o) {
        if (o.code === "ENOENT")
          return n(null);
        if (o.code === "EPERM")
          return xn ? Ls(e, t, o, n) : Dr(e, t, o, n);
        if (o.code === "EISDIR")
          return Dr(e, t, o, n);
      }
      return n(o);
    });
  });
}
function Ls(e, t, n, r) {
  J(e), J(t), J(typeof r == "function"), t.chmod(e, 438, (i) => {
    i ? r(i.code === "ENOENT" ? null : n) : t.stat(e, (o, s) => {
      o ? r(o.code === "ENOENT" ? null : n) : s.isDirectory() ? Dr(e, t, n, r) : t.unlink(e, r);
    });
  });
}
function Us(e, t, n) {
  let r;
  J(e), J(t);
  try {
    t.chmodSync(e, 438);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw n;
  }
  try {
    r = t.statSync(e);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw n;
  }
  r.isDirectory() ? Fr(e, t, n) : t.unlinkSync(e);
}
function Dr(e, t, n, r) {
  J(e), J(t), J(typeof r == "function"), t.rmdir(e, (i) => {
    i && (i.code === "ENOTEMPTY" || i.code === "EEXIST" || i.code === "EPERM") ? Eh(e, t, r) : i && i.code === "ENOTDIR" ? r(n) : r(i);
  });
}
function Eh(e, t, n) {
  J(e), J(t), J(typeof n == "function"), t.readdir(e, (r, i) => {
    if (r) return n(r);
    let o = i.length, s;
    if (o === 0) return t.rmdir(e, n);
    i.forEach((a) => {
      Fo(Xl.join(e, a), t, (c) => {
        if (!s) {
          if (c) return n(s = c);
          --o === 0 && t.rmdir(e, n);
        }
      });
    });
  });
}
function Jl(e, t) {
  let n;
  t = t || {}, Kl(t), J(e, "rimraf: missing path"), J.strictEqual(typeof e, "string", "rimraf: path should be a string"), J(t, "rimraf: missing options"), J.strictEqual(typeof t, "object", "rimraf: options should be object");
  try {
    n = t.lstatSync(e);
  } catch (r) {
    if (r.code === "ENOENT")
      return;
    r.code === "EPERM" && xn && Us(e, t, r);
  }
  try {
    n && n.isDirectory() ? Fr(e, t, null) : t.unlinkSync(e);
  } catch (r) {
    if (r.code === "ENOENT")
      return;
    if (r.code === "EPERM")
      return xn ? Us(e, t, r) : Fr(e, t, r);
    if (r.code !== "EISDIR")
      throw r;
    Fr(e, t, r);
  }
}
function Fr(e, t, n) {
  J(e), J(t);
  try {
    t.rmdirSync(e);
  } catch (r) {
    if (r.code === "ENOTDIR")
      throw n;
    if (r.code === "ENOTEMPTY" || r.code === "EEXIST" || r.code === "EPERM")
      yh(e, t);
    else if (r.code !== "ENOENT")
      throw r;
  }
}
function yh(e, t) {
  if (J(e), J(t), t.readdirSync(e).forEach((n) => Jl(Xl.join(e, n), t)), xn) {
    const n = Date.now();
    do
      try {
        return t.rmdirSync(e, t);
      } catch {
      }
    while (Date.now() - n < 500);
  } else
    return t.rmdirSync(e, t);
}
var wh = Fo;
Fo.sync = Jl;
const Mr = Oe, _h = Re.fromCallback, Ql = wh;
function vh(e, t) {
  if (Mr.rm) return Mr.rm(e, { recursive: !0, force: !0 }, t);
  Ql(e, t);
}
function Ah(e) {
  if (Mr.rmSync) return Mr.rmSync(e, { recursive: !0, force: !0 });
  Ql.sync(e);
}
var Qr = {
  remove: _h(vh),
  removeSync: Ah
};
const Th = Re.fromPromise, Zl = Mt, ec = te, tc = Ze, nc = Qr, ks = Th(async function(t) {
  let n;
  try {
    n = await Zl.readdir(t);
  } catch {
    return tc.mkdirs(t);
  }
  return Promise.all(n.map((r) => nc.remove(ec.join(t, r))));
});
function Ms(e) {
  let t;
  try {
    t = Zl.readdirSync(e);
  } catch {
    return tc.mkdirsSync(e);
  }
  t.forEach((n) => {
    n = ec.join(e, n), nc.removeSync(n);
  });
}
var Sh = {
  emptyDirSync: Ms,
  emptydirSync: Ms,
  emptyDir: ks,
  emptydir: ks
};
const bh = Re.fromCallback, rc = te, pt = Oe, ic = Ze;
function Ch(e, t) {
  function n() {
    pt.writeFile(e, "", (r) => {
      if (r) return t(r);
      t();
    });
  }
  pt.stat(e, (r, i) => {
    if (!r && i.isFile()) return t();
    const o = rc.dirname(e);
    pt.stat(o, (s, a) => {
      if (s)
        return s.code === "ENOENT" ? ic.mkdirs(o, (c) => {
          if (c) return t(c);
          n();
        }) : t(s);
      a.isDirectory() ? n() : pt.readdir(o, (c) => {
        if (c) return t(c);
      });
    });
  });
}
function $h(e) {
  let t;
  try {
    t = pt.statSync(e);
  } catch {
  }
  if (t && t.isFile()) return;
  const n = rc.dirname(e);
  try {
    pt.statSync(n).isDirectory() || pt.readdirSync(n);
  } catch (r) {
    if (r && r.code === "ENOENT") ic.mkdirsSync(n);
    else throw r;
  }
  pt.writeFileSync(e, "");
}
var Rh = {
  createFile: bh(Ch),
  createFileSync: $h
};
const Oh = Re.fromCallback, oc = te, ht = Oe, sc = Ze, Ih = Bt.pathExists, { areIdentical: ac } = fn;
function Ph(e, t, n) {
  function r(i, o) {
    ht.link(i, o, (s) => {
      if (s) return n(s);
      n(null);
    });
  }
  ht.lstat(t, (i, o) => {
    ht.lstat(e, (s, a) => {
      if (s)
        return s.message = s.message.replace("lstat", "ensureLink"), n(s);
      if (o && ac(a, o)) return n(null);
      const c = oc.dirname(t);
      Ih(c, (m, l) => {
        if (m) return n(m);
        if (l) return r(e, t);
        sc.mkdirs(c, (f) => {
          if (f) return n(f);
          r(e, t);
        });
      });
    });
  });
}
function Nh(e, t) {
  let n;
  try {
    n = ht.lstatSync(t);
  } catch {
  }
  try {
    const o = ht.lstatSync(e);
    if (n && ac(o, n)) return;
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureLink"), o;
  }
  const r = oc.dirname(t);
  return ht.existsSync(r) || sc.mkdirsSync(r), ht.linkSync(e, t);
}
var Dh = {
  createLink: Oh(Ph),
  createLinkSync: Nh
};
const mt = te, $n = Oe, Fh = Bt.pathExists;
function xh(e, t, n) {
  if (mt.isAbsolute(e))
    return $n.lstat(e, (r) => r ? (r.message = r.message.replace("lstat", "ensureSymlink"), n(r)) : n(null, {
      toCwd: e,
      toDst: e
    }));
  {
    const r = mt.dirname(t), i = mt.join(r, e);
    return Fh(i, (o, s) => o ? n(o) : s ? n(null, {
      toCwd: i,
      toDst: e
    }) : $n.lstat(e, (a) => a ? (a.message = a.message.replace("lstat", "ensureSymlink"), n(a)) : n(null, {
      toCwd: e,
      toDst: mt.relative(r, e)
    })));
  }
}
function Lh(e, t) {
  let n;
  if (mt.isAbsolute(e)) {
    if (n = $n.existsSync(e), !n) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: e,
      toDst: e
    };
  } else {
    const r = mt.dirname(t), i = mt.join(r, e);
    if (n = $n.existsSync(i), n)
      return {
        toCwd: i,
        toDst: e
      };
    if (n = $n.existsSync(e), !n) throw new Error("relative srcpath does not exist");
    return {
      toCwd: e,
      toDst: mt.relative(r, e)
    };
  }
}
var Uh = {
  symlinkPaths: xh,
  symlinkPathsSync: Lh
};
const lc = Oe;
function kh(e, t, n) {
  if (n = typeof t == "function" ? t : n, t = typeof t == "function" ? !1 : t, t) return n(null, t);
  lc.lstat(e, (r, i) => {
    if (r) return n(null, "file");
    t = i && i.isDirectory() ? "dir" : "file", n(null, t);
  });
}
function Mh(e, t) {
  let n;
  if (t) return t;
  try {
    n = lc.lstatSync(e);
  } catch {
    return "file";
  }
  return n && n.isDirectory() ? "dir" : "file";
}
var Bh = {
  symlinkType: kh,
  symlinkTypeSync: Mh
};
const jh = Re.fromCallback, cc = te, He = Mt, uc = Ze, Hh = uc.mkdirs, Gh = uc.mkdirsSync, fc = Uh, qh = fc.symlinkPaths, Vh = fc.symlinkPathsSync, dc = Bh, Wh = dc.symlinkType, Yh = dc.symlinkTypeSync, zh = Bt.pathExists, { areIdentical: hc } = fn;
function Xh(e, t, n, r) {
  r = typeof n == "function" ? n : r, n = typeof n == "function" ? !1 : n, He.lstat(t, (i, o) => {
    !i && o.isSymbolicLink() ? Promise.all([
      He.stat(e),
      He.stat(t)
    ]).then(([s, a]) => {
      if (hc(s, a)) return r(null);
      Bs(e, t, n, r);
    }) : Bs(e, t, n, r);
  });
}
function Bs(e, t, n, r) {
  qh(e, t, (i, o) => {
    if (i) return r(i);
    e = o.toDst, Wh(o.toCwd, n, (s, a) => {
      if (s) return r(s);
      const c = cc.dirname(t);
      zh(c, (m, l) => {
        if (m) return r(m);
        if (l) return He.symlink(e, t, a, r);
        Hh(c, (f) => {
          if (f) return r(f);
          He.symlink(e, t, a, r);
        });
      });
    });
  });
}
function Kh(e, t, n) {
  let r;
  try {
    r = He.lstatSync(t);
  } catch {
  }
  if (r && r.isSymbolicLink()) {
    const a = He.statSync(e), c = He.statSync(t);
    if (hc(a, c)) return;
  }
  const i = Vh(e, t);
  e = i.toDst, n = Yh(i.toCwd, n);
  const o = cc.dirname(t);
  return He.existsSync(o) || Gh(o), He.symlinkSync(e, t, n);
}
var Jh = {
  createSymlink: jh(Xh),
  createSymlinkSync: Kh
};
const { createFile: js, createFileSync: Hs } = Rh, { createLink: Gs, createLinkSync: qs } = Dh, { createSymlink: Vs, createSymlinkSync: Ws } = Jh;
var Qh = {
  // file
  createFile: js,
  createFileSync: Hs,
  ensureFile: js,
  ensureFileSync: Hs,
  // link
  createLink: Gs,
  createLinkSync: qs,
  ensureLink: Gs,
  ensureLinkSync: qs,
  // symlink
  createSymlink: Vs,
  createSymlinkSync: Ws,
  ensureSymlink: Vs,
  ensureSymlinkSync: Ws
};
function Zh(e, { EOL: t = `
`, finalEOL: n = !0, replacer: r = null, spaces: i } = {}) {
  const o = n ? t : "", s = JSON.stringify(e, r, i);
  if (s === void 0)
    throw new TypeError(`Converting ${typeof e} value to JSON is not supported`);
  return s.replace(/\n/g, t) + o;
}
function ep(e) {
  return Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, "");
}
var xo = { stringify: Zh, stripBom: ep };
let an;
try {
  an = Oe;
} catch {
  an = At;
}
const Zr = Re, { stringify: pc, stripBom: mc } = xo;
async function tp(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const n = t.fs || an, r = "throws" in t ? t.throws : !0;
  let i = await Zr.fromCallback(n.readFile)(e, t);
  i = mc(i);
  let o;
  try {
    o = JSON.parse(i, t ? t.reviver : null);
  } catch (s) {
    if (r)
      throw s.message = `${e}: ${s.message}`, s;
    return null;
  }
  return o;
}
const np = Zr.fromPromise(tp);
function rp(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const n = t.fs || an, r = "throws" in t ? t.throws : !0;
  try {
    let i = n.readFileSync(e, t);
    return i = mc(i), JSON.parse(i, t.reviver);
  } catch (i) {
    if (r)
      throw i.message = `${e}: ${i.message}`, i;
    return null;
  }
}
async function ip(e, t, n = {}) {
  const r = n.fs || an, i = pc(t, n);
  await Zr.fromCallback(r.writeFile)(e, i, n);
}
const op = Zr.fromPromise(ip);
function sp(e, t, n = {}) {
  const r = n.fs || an, i = pc(t, n);
  return r.writeFileSync(e, i, n);
}
var ap = {
  readFile: np,
  readFileSync: rp,
  writeFile: op,
  writeFileSync: sp
};
const Er = ap;
var lp = {
  // jsonfile exports
  readJson: Er.readFile,
  readJsonSync: Er.readFileSync,
  writeJson: Er.writeFile,
  writeJsonSync: Er.writeFileSync
};
const cp = Re.fromCallback, Rn = Oe, gc = te, Ec = Ze, up = Bt.pathExists;
function fp(e, t, n, r) {
  typeof n == "function" && (r = n, n = "utf8");
  const i = gc.dirname(e);
  up(i, (o, s) => {
    if (o) return r(o);
    if (s) return Rn.writeFile(e, t, n, r);
    Ec.mkdirs(i, (a) => {
      if (a) return r(a);
      Rn.writeFile(e, t, n, r);
    });
  });
}
function dp(e, ...t) {
  const n = gc.dirname(e);
  if (Rn.existsSync(n))
    return Rn.writeFileSync(e, ...t);
  Ec.mkdirsSync(n), Rn.writeFileSync(e, ...t);
}
var Lo = {
  outputFile: cp(fp),
  outputFileSync: dp
};
const { stringify: hp } = xo, { outputFile: pp } = Lo;
async function mp(e, t, n = {}) {
  const r = hp(t, n);
  await pp(e, r, n);
}
var gp = mp;
const { stringify: Ep } = xo, { outputFileSync: yp } = Lo;
function wp(e, t, n) {
  const r = Ep(t, n);
  yp(e, r, n);
}
var _p = wp;
const vp = Re.fromPromise, $e = lp;
$e.outputJson = vp(gp);
$e.outputJsonSync = _p;
$e.outputJSON = $e.outputJson;
$e.outputJSONSync = $e.outputJsonSync;
$e.writeJSON = $e.writeJson;
$e.writeJSONSync = $e.writeJsonSync;
$e.readJSON = $e.readJson;
$e.readJSONSync = $e.readJsonSync;
var Ap = $e;
const Tp = Oe, uo = te, Sp = Do.copy, yc = Qr.remove, bp = Ze.mkdirp, Cp = Bt.pathExists, Ys = fn;
function $p(e, t, n, r) {
  typeof n == "function" && (r = n, n = {}), n = n || {};
  const i = n.overwrite || n.clobber || !1;
  Ys.checkPaths(e, t, "move", n, (o, s) => {
    if (o) return r(o);
    const { srcStat: a, isChangingCase: c = !1 } = s;
    Ys.checkParentPaths(e, a, t, "move", (m) => {
      if (m) return r(m);
      if (Rp(t)) return zs(e, t, i, c, r);
      bp(uo.dirname(t), (l) => l ? r(l) : zs(e, t, i, c, r));
    });
  });
}
function Rp(e) {
  const t = uo.dirname(e);
  return uo.parse(t).root === t;
}
function zs(e, t, n, r, i) {
  if (r) return Oi(e, t, n, i);
  if (n)
    return yc(t, (o) => o ? i(o) : Oi(e, t, n, i));
  Cp(t, (o, s) => o ? i(o) : s ? i(new Error("dest already exists.")) : Oi(e, t, n, i));
}
function Oi(e, t, n, r) {
  Tp.rename(e, t, (i) => i ? i.code !== "EXDEV" ? r(i) : Op(e, t, n, r) : r());
}
function Op(e, t, n, r) {
  Sp(e, t, {
    overwrite: n,
    errorOnExist: !0
  }, (o) => o ? r(o) : yc(e, r));
}
var Ip = $p;
const wc = Oe, fo = te, Pp = Do.copySync, _c = Qr.removeSync, Np = Ze.mkdirpSync, Xs = fn;
function Dp(e, t, n) {
  n = n || {};
  const r = n.overwrite || n.clobber || !1, { srcStat: i, isChangingCase: o = !1 } = Xs.checkPathsSync(e, t, "move", n);
  return Xs.checkParentPathsSync(e, i, t, "move"), Fp(t) || Np(fo.dirname(t)), xp(e, t, r, o);
}
function Fp(e) {
  const t = fo.dirname(e);
  return fo.parse(t).root === t;
}
function xp(e, t, n, r) {
  if (r) return Ii(e, t, n);
  if (n)
    return _c(t), Ii(e, t, n);
  if (wc.existsSync(t)) throw new Error("dest already exists.");
  return Ii(e, t, n);
}
function Ii(e, t, n) {
  try {
    wc.renameSync(e, t);
  } catch (r) {
    if (r.code !== "EXDEV") throw r;
    return Lp(e, t, n);
  }
}
function Lp(e, t, n) {
  return Pp(e, t, {
    overwrite: n,
    errorOnExist: !0
  }), _c(e);
}
var Up = Dp;
const kp = Re.fromCallback;
var Mp = {
  move: kp(Ip),
  moveSync: Up
}, St = {
  // Export promiseified graceful-fs:
  ...Mt,
  // Export extra methods:
  ...Do,
  ...Sh,
  ...Qh,
  ...Ap,
  ...Ze,
  ...Mp,
  ...Lo,
  ...Bt,
  ...Qr
}, jt = {}, yt = {}, fe = {}, wt = {};
Object.defineProperty(wt, "__esModule", { value: !0 });
wt.CancellationError = wt.CancellationToken = void 0;
const Bp = Il;
class jp extends Bp.EventEmitter {
  get cancelled() {
    return this._cancelled || this._parent != null && this._parent.cancelled;
  }
  set parent(t) {
    this.removeParentCancelHandler(), this._parent = t, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
  }
  // babel cannot compile ... correctly for super calls
  constructor(t) {
    super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, t != null && (this.parent = t);
  }
  cancel() {
    this._cancelled = !0, this.emit("cancel");
  }
  onCancel(t) {
    this.cancelled ? t() : this.once("cancel", t);
  }
  createPromise(t) {
    if (this.cancelled)
      return Promise.reject(new ho());
    const n = () => {
      if (r != null)
        try {
          this.removeListener("cancel", r), r = null;
        } catch {
        }
    };
    let r = null;
    return new Promise((i, o) => {
      let s = null;
      if (r = () => {
        try {
          s != null && (s(), s = null);
        } finally {
          o(new ho());
        }
      }, this.cancelled) {
        r();
        return;
      }
      this.onCancel(r), t(i, o, (a) => {
        s = a;
      });
    }).then((i) => (n(), i)).catch((i) => {
      throw n(), i;
    });
  }
  removeParentCancelHandler() {
    const t = this._parent;
    t != null && this.parentCancelHandler != null && (t.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
  }
  dispose() {
    try {
      this.removeParentCancelHandler();
    } finally {
      this.removeAllListeners(), this._parent = null;
    }
  }
}
wt.CancellationToken = jp;
class ho extends Error {
  constructor() {
    super("cancelled");
  }
}
wt.CancellationError = ho;
var dn = {};
Object.defineProperty(dn, "__esModule", { value: !0 });
dn.newError = Hp;
function Hp(e, t) {
  const n = new Error(e);
  return n.code = t, n;
}
var ue = {}, po = { exports: {} }, yr = { exports: {} }, Pi, Ks;
function Gp() {
  if (Ks) return Pi;
  Ks = 1;
  var e = 1e3, t = e * 60, n = t * 60, r = n * 24, i = r * 7, o = r * 365.25;
  Pi = function(l, f) {
    f = f || {};
    var h = typeof l;
    if (h === "string" && l.length > 0)
      return s(l);
    if (h === "number" && isFinite(l))
      return f.long ? c(l) : a(l);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(l)
    );
  };
  function s(l) {
    if (l = String(l), !(l.length > 100)) {
      var f = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        l
      );
      if (f) {
        var h = parseFloat(f[1]), g = (f[2] || "ms").toLowerCase();
        switch (g) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return h * o;
          case "weeks":
          case "week":
          case "w":
            return h * i;
          case "days":
          case "day":
          case "d":
            return h * r;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return h * n;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return h * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return h * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return h;
          default:
            return;
        }
      }
    }
  }
  function a(l) {
    var f = Math.abs(l);
    return f >= r ? Math.round(l / r) + "d" : f >= n ? Math.round(l / n) + "h" : f >= t ? Math.round(l / t) + "m" : f >= e ? Math.round(l / e) + "s" : l + "ms";
  }
  function c(l) {
    var f = Math.abs(l);
    return f >= r ? m(l, f, r, "day") : f >= n ? m(l, f, n, "hour") : f >= t ? m(l, f, t, "minute") : f >= e ? m(l, f, e, "second") : l + " ms";
  }
  function m(l, f, h, g) {
    var w = f >= h * 1.5;
    return Math.round(l / h) + " " + g + (w ? "s" : "");
  }
  return Pi;
}
var Ni, Js;
function vc() {
  if (Js) return Ni;
  Js = 1;
  function e(t) {
    r.debug = r, r.default = r, r.coerce = m, r.disable = a, r.enable = o, r.enabled = c, r.humanize = Gp(), r.destroy = l, Object.keys(t).forEach((f) => {
      r[f] = t[f];
    }), r.names = [], r.skips = [], r.formatters = {};
    function n(f) {
      let h = 0;
      for (let g = 0; g < f.length; g++)
        h = (h << 5) - h + f.charCodeAt(g), h |= 0;
      return r.colors[Math.abs(h) % r.colors.length];
    }
    r.selectColor = n;
    function r(f) {
      let h, g = null, w, y;
      function A(...T) {
        if (!A.enabled)
          return;
        const R = A, N = Number(/* @__PURE__ */ new Date()), x = N - (h || N);
        R.diff = x, R.prev = h, R.curr = N, h = N, T[0] = r.coerce(T[0]), typeof T[0] != "string" && T.unshift("%O");
        let ee = 0;
        T[0] = T[0].replace(/%([a-zA-Z%])/g, (W, Fe) => {
          if (W === "%%")
            return "%";
          ee++;
          const E = r.formatters[Fe];
          if (typeof E == "function") {
            const G = T[ee];
            W = E.call(R, G), T.splice(ee, 1), ee--;
          }
          return W;
        }), r.formatArgs.call(R, T), (R.log || r.log).apply(R, T);
      }
      return A.namespace = f, A.useColors = r.useColors(), A.color = r.selectColor(f), A.extend = i, A.destroy = r.destroy, Object.defineProperty(A, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => g !== null ? g : (w !== r.namespaces && (w = r.namespaces, y = r.enabled(f)), y),
        set: (T) => {
          g = T;
        }
      }), typeof r.init == "function" && r.init(A), A;
    }
    function i(f, h) {
      const g = r(this.namespace + (typeof h > "u" ? ":" : h) + f);
      return g.log = this.log, g;
    }
    function o(f) {
      r.save(f), r.namespaces = f, r.names = [], r.skips = [];
      const h = (typeof f == "string" ? f : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const g of h)
        g[0] === "-" ? r.skips.push(g.slice(1)) : r.names.push(g);
    }
    function s(f, h) {
      let g = 0, w = 0, y = -1, A = 0;
      for (; g < f.length; )
        if (w < h.length && (h[w] === f[g] || h[w] === "*"))
          h[w] === "*" ? (y = w, A = g, w++) : (g++, w++);
        else if (y !== -1)
          w = y + 1, A++, g = A;
        else
          return !1;
      for (; w < h.length && h[w] === "*"; )
        w++;
      return w === h.length;
    }
    function a() {
      const f = [
        ...r.names,
        ...r.skips.map((h) => "-" + h)
      ].join(",");
      return r.enable(""), f;
    }
    function c(f) {
      for (const h of r.skips)
        if (s(f, h))
          return !1;
      for (const h of r.names)
        if (s(f, h))
          return !0;
      return !1;
    }
    function m(f) {
      return f instanceof Error ? f.stack || f.message : f;
    }
    function l() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return r.enable(r.load()), r;
  }
  return Ni = e, Ni;
}
var Qs;
function qp() {
  return Qs || (Qs = 1, function(e, t) {
    t.formatArgs = r, t.save = i, t.load = o, t.useColors = n, t.storage = s(), t.destroy = /* @__PURE__ */ (() => {
      let c = !1;
      return () => {
        c || (c = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function n() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let c;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (c = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(c[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function r(c) {
      if (c[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + c[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const m = "color: " + this.color;
      c.splice(1, 0, m, "color: inherit");
      let l = 0, f = 0;
      c[0].replace(/%[a-zA-Z%]/g, (h) => {
        h !== "%%" && (l++, h === "%c" && (f = l));
      }), c.splice(f, 0, m);
    }
    t.log = console.debug || console.log || (() => {
    });
    function i(c) {
      try {
        c ? t.storage.setItem("debug", c) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function o() {
      let c;
      try {
        c = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !c && typeof process < "u" && "env" in process && (c = process.env.DEBUG), c;
    }
    function s() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = vc()(t);
    const { formatters: a } = e.exports;
    a.j = function(c) {
      try {
        return JSON.stringify(c);
      } catch (m) {
        return "[UnexpectedJSONParseError]: " + m.message;
      }
    };
  }(yr, yr.exports)), yr.exports;
}
var wr = { exports: {} }, Di, Zs;
function Vp() {
  return Zs || (Zs = 1, Di = (e, t = process.argv) => {
    const n = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", r = t.indexOf(n + e), i = t.indexOf("--");
    return r !== -1 && (i === -1 || r < i);
  }), Di;
}
var Fi, ea;
function Wp() {
  if (ea) return Fi;
  ea = 1;
  const e = Xr, t = Pl, n = Vp(), { env: r } = process;
  let i;
  n("no-color") || n("no-colors") || n("color=false") || n("color=never") ? i = 0 : (n("color") || n("colors") || n("color=true") || n("color=always")) && (i = 1), "FORCE_COLOR" in r && (r.FORCE_COLOR === "true" ? i = 1 : r.FORCE_COLOR === "false" ? i = 0 : i = r.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(r.FORCE_COLOR, 10), 3));
  function o(c) {
    return c === 0 ? !1 : {
      level: c,
      hasBasic: !0,
      has256: c >= 2,
      has16m: c >= 3
    };
  }
  function s(c, m) {
    if (i === 0)
      return 0;
    if (n("color=16m") || n("color=full") || n("color=truecolor"))
      return 3;
    if (n("color=256"))
      return 2;
    if (c && !m && i === void 0)
      return 0;
    const l = i || 0;
    if (r.TERM === "dumb")
      return l;
    if (process.platform === "win32") {
      const f = e.release().split(".");
      return Number(f[0]) >= 10 && Number(f[2]) >= 10586 ? Number(f[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in r)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((f) => f in r) || r.CI_NAME === "codeship" ? 1 : l;
    if ("TEAMCITY_VERSION" in r)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(r.TEAMCITY_VERSION) ? 1 : 0;
    if (r.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in r) {
      const f = parseInt((r.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (r.TERM_PROGRAM) {
        case "iTerm.app":
          return f >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(r.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(r.TERM) || "COLORTERM" in r ? 1 : l;
  }
  function a(c) {
    const m = s(c, c && c.isTTY);
    return o(m);
  }
  return Fi = {
    supportsColor: a,
    stdout: o(s(!0, t.isatty(1))),
    stderr: o(s(!0, t.isatty(2)))
  }, Fi;
}
var ta;
function Yp() {
  return ta || (ta = 1, function(e, t) {
    const n = Pl, r = $o;
    t.init = l, t.log = a, t.formatArgs = o, t.save = c, t.load = m, t.useColors = i, t.destroy = r.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const h = Wp();
      h && (h.stderr || h).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((h) => /^debug_/i.test(h)).reduce((h, g) => {
      const w = g.substring(6).toLowerCase().replace(/_([a-z])/g, (A, T) => T.toUpperCase());
      let y = process.env[g];
      return /^(yes|on|true|enabled)$/i.test(y) ? y = !0 : /^(no|off|false|disabled)$/i.test(y) ? y = !1 : y === "null" ? y = null : y = Number(y), h[w] = y, h;
    }, {});
    function i() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : n.isatty(process.stderr.fd);
    }
    function o(h) {
      const { namespace: g, useColors: w } = this;
      if (w) {
        const y = this.color, A = "\x1B[3" + (y < 8 ? y : "8;5;" + y), T = `  ${A};1m${g} \x1B[0m`;
        h[0] = T + h[0].split(`
`).join(`
` + T), h.push(A + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        h[0] = s() + g + " " + h[0];
    }
    function s() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function a(...h) {
      return process.stderr.write(r.formatWithOptions(t.inspectOpts, ...h) + `
`);
    }
    function c(h) {
      h ? process.env.DEBUG = h : delete process.env.DEBUG;
    }
    function m() {
      return process.env.DEBUG;
    }
    function l(h) {
      h.inspectOpts = {};
      const g = Object.keys(t.inspectOpts);
      for (let w = 0; w < g.length; w++)
        h.inspectOpts[g[w]] = t.inspectOpts[g[w]];
    }
    e.exports = vc()(t);
    const { formatters: f } = e.exports;
    f.o = function(h) {
      return this.inspectOpts.colors = this.useColors, r.inspect(h, this.inspectOpts).split(`
`).map((g) => g.trim()).join(" ");
    }, f.O = function(h) {
      return this.inspectOpts.colors = this.useColors, r.inspect(h, this.inspectOpts);
    };
  }(wr, wr.exports)), wr.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? po.exports = qp() : po.exports = Yp();
var zp = po.exports, Xn = {};
Object.defineProperty(Xn, "__esModule", { value: !0 });
Xn.ProgressCallbackTransform = void 0;
const Xp = Wn;
class Kp extends Xp.Transform {
  constructor(t, n, r) {
    super(), this.total = t, this.cancellationToken = n, this.onProgress = r, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, n, r) {
    if (this.cancellationToken.cancelled) {
      r(new Error("cancelled"), null);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.total * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), r(null, t);
  }
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.total,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, t(null);
  }
}
Xn.ProgressCallbackTransform = Kp;
Object.defineProperty(ue, "__esModule", { value: !0 });
ue.DigestTransform = ue.HttpExecutor = ue.HttpError = void 0;
ue.addSensitiveRedirectHeader = rm;
ue.addSensitiveFieldPattern = im;
ue.createHttpError = go;
ue.parseJson = sm;
ue.configureRequestOptionsFromUrl = Cc;
ue.configureRequestUrl = Mo;
ue.safeGetHeader = on;
ue.configureRequestOptions = Br;
ue.isSensitiveFieldName = $c;
ue.hashSensitiveValue = Rc;
ue.safeStringifyJson = Qt;
const Ac = Yn, Jp = zp, Qp = At, Zp = Wn, mo = Tt, em = wt, na = dn, tm = Xn, ft = (0, Jp.default)("electron-builder"), Uo = (e) => e.toLowerCase().replace(/[-_]/g, ""), Tc = /* @__PURE__ */ new Set(["authorization", "proxyauthorization", "privatetoken", "xapikey", "xauthtoken", "xaccesstoken", "xgitlabtoken", "cookie", "xcsrftoken"]), Sc = ["token", "password", "secret", "authorization", "credential", "apikey", "passphrase", "auth"], nm = ["key"];
function rm(e) {
  Tc.add(Uo(e));
}
function im(e) {
  Sc.push(e.toLowerCase().replace(/[-_]/g, ""));
}
function go(e, t = null) {
  return new ko(e.statusCode || -1, `${e.statusCode} ${e.statusMessage}` + (t == null ? "" : `
` + JSON.stringify(t, null, "  ")) + `
Headers: ` + Qt(e.headers), t);
}
const om = /* @__PURE__ */ new Map([
  [429, "Too many requests"],
  [400, "Bad request"],
  [403, "Forbidden"],
  [404, "Not found"],
  [405, "Method not allowed"],
  [406, "Not acceptable"],
  [408, "Request timeout"],
  [413, "Request entity too large"],
  [500, "Internal server error"],
  [502, "Bad gateway"],
  [503, "Service unavailable"],
  [504, "Gateway timeout"],
  [505, "HTTP version not supported"]
]);
class ko extends Error {
  constructor(t, n = `HTTP error: ${om.get(t) || t}`, r = null) {
    super(n), this.statusCode = t, this.description = r, this.name = "HttpError", this.code = `HTTP_ERROR_${t}`;
  }
  isServerError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
}
ue.HttpError = ko;
function sm(e) {
  return e.then((t) => t == null || t.length === 0 ? null : JSON.parse(t));
}
class Jt {
  constructor() {
    this.maxRedirects = 10;
  }
  request(t, n = new em.CancellationToken(), r) {
    Br(t);
    const i = r == null ? void 0 : JSON.stringify(r), o = i ? Buffer.from(i) : void 0;
    if (o != null) {
      ft.enabled && ft(Qt(r));
      const { headers: s, ...a } = t;
      t = {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": o.length,
          ...s
        },
        ...a
      };
    }
    return this.doApiRequest(t, n, (s) => s.end(o));
  }
  doApiRequest(t, n, r, i = 0) {
    if (ft.enabled) {
      const { headers: o, auth: s, ...a } = t;
      ft(`Request: ${Qt(a)}`);
    }
    return n.createPromise((o, s, a) => {
      const c = this.createRequest(t, (m) => {
        try {
          this.handleResponse(m, t, n, o, s, i, r);
        } catch (l) {
          s(l);
        }
      });
      this.addErrorAndTimeoutHandlers(c, s, t.timeout), this.addRedirectHandlers(c, t, s, i, (m) => {
        this.doApiRequest(m, n, r, i).then(o).catch(s);
      }), r(c, s), a(() => c.abort());
    });
  }
  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line
  addRedirectHandlers(t, n, r, i, o) {
  }
  addErrorAndTimeoutHandlers(t, n, r = 60 * 1e3) {
    this.addTimeOutHandler(t, n, r), t.on("error", n), t.on("aborted", () => {
      n(new Error("Request has been aborted by the server"));
    });
  }
  handleResponse(t, n, r, i, o, s, a) {
    var c;
    if (ft.enabled) {
      const { headers: g, auth: w, ...y } = n;
      ft(`Response: ${t.statusCode} ${t.statusMessage}, request options: ${Qt(y)}`);
    }
    if (t.statusCode === 404) {
      o(go(t, `method: ${n.method || "GET"} url: ${n.protocol || "https:"}//${n.hostname}${n.port ? `:${n.port}` : ""}${n.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
      return;
    } else if (t.statusCode === 204) {
      i();
      return;
    }
    const m = (c = t.statusCode) !== null && c !== void 0 ? c : 0, l = m >= 300 && m < 400, f = on(t, "location");
    if (l && f != null) {
      if (s > this.maxRedirects) {
        o(this.createMaxRedirectError());
        return;
      }
      this.doApiRequest(Jt.prepareRedirectUrlOptions(f, n), r, a, s).then(i).catch(o);
      return;
    }
    t.setEncoding("utf8");
    let h = "";
    t.on("error", o), t.on("data", (g) => h += g), t.on("end", () => {
      try {
        if (t.statusCode != null && t.statusCode >= 400) {
          const g = on(t, "content-type"), w = g != null && (Array.isArray(g) ? g.find((y) => y.includes("json")) != null : g.includes("json"));
          o(go(t, `method: ${n.method || "GET"} url: ${n.protocol || "https:"}//${n.hostname}${n.port ? `:${n.port}` : ""}${n.path}

          Data:
          ${w ? Qt(JSON.parse(h)) : h}
          `));
        } else
          i(h.length === 0 ? null : h);
      } catch (g) {
        o(g);
      }
    });
  }
  async downloadToBuffer(t, n) {
    return await n.cancellationToken.createPromise((r, i, o) => {
      const s = [], a = {
        headers: n.headers || void 0,
        // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
        redirect: "manual"
      };
      Mo(t, a), Br(a), this.doDownload(a, {
        destination: null,
        options: n,
        onCancel: o,
        callback: (c) => {
          c == null ? r(Buffer.concat(s)) : i(c);
        },
        responseHandler: (c, m) => {
          let l = 0;
          c.on("data", (f) => {
            if (l += f.length, l > 524288e3) {
              m(new Error("Maximum allowed size is 500 MB"));
              return;
            }
            s.push(f);
          }), c.on("end", () => {
            m(null);
          });
        }
      }, 0);
    });
  }
  doDownload(t, n, r) {
    const i = this.createRequest(t, (o) => {
      if (o.statusCode >= 400) {
        n.callback(new Error(`Cannot download "${t.protocol || "https:"}//${t.hostname}${t.path}", status ${o.statusCode}: ${o.statusMessage}`));
        return;
      }
      o.on("error", n.callback);
      const s = on(o, "location");
      if (s != null) {
        r < this.maxRedirects ? this.doDownload(Jt.prepareRedirectUrlOptions(s, t), n, r++) : n.callback(this.createMaxRedirectError());
        return;
      }
      n.responseHandler == null ? lm(n, o) : n.responseHandler(o, n.callback);
    });
    this.addErrorAndTimeoutHandlers(i, n.callback, t.timeout), this.addRedirectHandlers(i, t, n.callback, r, (o) => {
      this.doDownload(o, n, r++);
    }), i.end();
  }
  createMaxRedirectError() {
    return new Error(`Too many redirects (> ${this.maxRedirects})`);
  }
  addTimeOutHandler(t, n, r) {
    t.on("socket", (i) => {
      i.setTimeout(r, () => {
        t.abort(), n(new Error("Request timed out"));
      });
    });
  }
  static prepareRedirectUrlOptions(t, n) {
    const r = Cc(t, { ...n }), i = r.headers;
    if (i == null)
      return r;
    const o = Jt.reconstructOriginalUrl(n), s = bc(t, n);
    if (Jt.isCrossOriginRedirect(o, s)) {
      ft.enabled && ft(`Cross-origin redirect (${o.host} → ${s.host}): stripping sensitive headers`);
      for (const a of Object.keys(i))
        Tc.has(Uo(a)) && delete i[a];
    }
    return r;
  }
  static reconstructOriginalUrl(t) {
    const n = t.protocol || "https:";
    if (!t.hostname)
      throw new Error("Missing hostname in request options");
    const r = t.hostname, i = t.port ? `:${t.port}` : "", o = t.path || "/";
    return new mo.URL(`${n}//${r}${i}${o}`);
  }
  static isCrossOriginRedirect(t, n) {
    if (t.hostname.toLowerCase() !== n.hostname.toLowerCase())
      return !0;
    if (t.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
    ["80", ""].includes(t.port) && n.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
    ["443", ""].includes(n.port))
      return !1;
    if (t.protocol !== n.protocol)
      return !0;
    const r = t.port, i = n.port;
    return r !== i;
  }
  static async retryOnServerError(t, n = 3) {
    for (let r = 0; ; r++)
      try {
        return await t();
      } catch (i) {
        if (r < n && (i instanceof ko && i.isServerError() || i.code === "EPIPE")) {
          await new Promise((o) => setTimeout(o, 1e3 * (r + 1)));
          continue;
        }
        throw i;
      }
  }
}
ue.HttpExecutor = Jt;
function bc(e, t) {
  try {
    return new mo.URL(e);
  } catch {
    const n = t.hostname, r = t.protocol || "https:", i = t.port ? `:${t.port}` : "", o = `${r}//${n}${i}`;
    return new mo.URL(e, o);
  }
}
function Cc(e, t) {
  const n = Br(t), r = bc(e, t);
  return Mo(r, n), n;
}
function Mo(e, t) {
  t.protocol = e.protocol, t.hostname = e.hostname, e.port ? t.port = e.port : t.port && delete t.port, t.path = e.pathname + e.search;
}
class Eo extends Zp.Transform {
  // noinspection JSUnusedGlobalSymbols
  get actual() {
    return this._actual;
  }
  constructor(t, n = "sha512", r = "base64") {
    super(), this.expected = t, this.algorithm = n, this.encoding = r, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, Ac.createHash)(n);
  }
  // noinspection JSUnusedGlobalSymbols
  _transform(t, n, r) {
    this.digester.update(t), r(null, t);
  }
  // noinspection JSUnusedGlobalSymbols
  _flush(t) {
    if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
      try {
        this.validate();
      } catch (n) {
        t(n);
        return;
      }
    t(null);
  }
  validate() {
    if (this._actual == null)
      throw (0, na.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
    if (this._actual !== this.expected)
      throw (0, na.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
    return null;
  }
}
ue.DigestTransform = Eo;
function am(e, t, n) {
  return e != null && t != null && e !== t ? (n(new Error(`checksum mismatch: expected ${t} but got ${e} (X-Checksum-Sha2 header)`)), !1) : !0;
}
function on(e, t) {
  const n = e.headers[t];
  return n == null ? null : Array.isArray(n) ? n.length === 0 ? null : n[n.length - 1] : n;
}
function lm(e, t) {
  if (!am(on(t, "X-Checksum-Sha2"), e.options.sha2, e.callback))
    return;
  const n = [];
  if (e.options.onProgress != null) {
    const s = on(t, "content-length");
    s != null && n.push(new tm.ProgressCallbackTransform(parseInt(s, 10), e.options.cancellationToken, e.options.onProgress));
  }
  const r = e.options.sha512;
  r != null ? n.push(new Eo(r, "sha512", r.length === 128 && !r.includes("+") && !r.includes("Z") && !r.includes("=") ? "hex" : "base64")) : e.options.sha2 != null && n.push(new Eo(e.options.sha2, "sha256", "hex"));
  const i = (0, Qp.createWriteStream)(e.destination);
  n.push(i);
  let o = t;
  for (const s of n)
    s.on("error", (a) => {
      i.close(), e.options.cancellationToken.cancelled || e.callback(a);
    }), o = o.pipe(s);
  i.on("finish", () => {
    i.close(e.callback);
  });
}
function Br(e, t, n) {
  n != null && (e.method = n), e.headers = { ...e.headers };
  const r = e.headers;
  return t != null && (r.authorization = t.startsWith("Basic") || t.startsWith("Bearer") ? t : `token ${t}`), r["User-Agent"] == null && (r["User-Agent"] = "electron-builder"), (n == null || n === "GET" || r["Cache-Control"] == null) && (r["Cache-Control"] = "no-cache"), e.protocol == null && process.versions.electron != null && (e.protocol = "https:"), e;
}
function $c(e) {
  const t = Uo(e);
  return Sc.some((n) => t.includes(n)) || nm.some((n) => t.endsWith(n));
}
function Rc(e) {
  return `${(0, Ac.createHash)("sha256").update(e).digest("hex")} (sha256 hash)`;
}
function Qt(e, t) {
  return JSON.stringify(e, (n, r) => $c(n) || t != null && t.has(n) ? typeof r == "string" ? Rc(r) : "<stripped sensitive data>" : r, 2);
}
var ei = {};
Object.defineProperty(ei, "__esModule", { value: !0 });
ei.MemoLazy = void 0;
class cm {
  constructor(t, n) {
    this.selector = t, this.creator = n, this.selected = void 0, this._value = void 0;
  }
  get hasValue() {
    return this._value !== void 0;
  }
  get value() {
    const t = this.selector();
    if (this._value !== void 0 && Oc(this.selected, t))
      return this._value;
    this.selected = t;
    const n = this.creator(t);
    return this.value = n, n;
  }
  set value(t) {
    this._value = t;
  }
}
ei.MemoLazy = cm;
function Oc(e, t) {
  if (typeof e == "object" && e !== null && (typeof t == "object" && t !== null)) {
    const i = Object.keys(e), o = Object.keys(t);
    return i.length === o.length && i.every((s) => Oc(e[s], t[s]));
  }
  return e === t;
}
var Kn = {};
Object.defineProperty(Kn, "__esModule", { value: !0 });
Kn.githubUrl = um;
Kn.githubTagPrefix = fm;
Kn.getS3LikeProviderBaseUrl = dm;
function um(e, t = "github.com") {
  return `${e.protocol || "https"}://${e.host || t}`;
}
function fm(e) {
  var t;
  return e.tagNamePrefix ? e.tagNamePrefix : !((t = e.vPrefixedTagName) !== null && t !== void 0) || t ? "v" : "";
}
function dm(e) {
  const t = e.provider;
  if (t === "s3")
    return hm(e);
  if (t === "spaces")
    return pm(e);
  throw new Error(`Not supported provider: ${t}`);
}
function hm(e) {
  let t;
  if (e.accelerate == !0)
    t = `https://${e.bucket}.s3-accelerate.amazonaws.com`;
  else if (e.endpoint != null)
    t = `${e.endpoint}/${e.bucket}`;
  else if (e.bucket.includes(".")) {
    if (e.region == null)
      throw new Error(`Bucket name "${e.bucket}" includes a dot, but S3 region is missing`);
    e.region === "us-east-1" ? t = `https://s3.amazonaws.com/${e.bucket}` : t = `https://s3-${e.region}.amazonaws.com/${e.bucket}`;
  } else e.region === "cn-north-1" ? t = `https://${e.bucket}.s3.${e.region}.amazonaws.com.cn` : t = `https://${e.bucket}.s3.amazonaws.com`;
  return Ic(t, e.path);
}
function Ic(e, t) {
  return t != null && t.length > 0 && (t.startsWith("/") || (e += "/"), e += t), e;
}
function pm(e) {
  if (e.name == null)
    throw new Error("name is missing");
  if (e.region == null)
    throw new Error("region is missing");
  return Ic(`https://${e.name}.${e.region}.digitaloceanspaces.com`, e.path);
}
var Bo = {};
Object.defineProperty(Bo, "__esModule", { value: !0 });
Bo.retry = Pc;
const mm = wt;
async function Pc(e, t) {
  var n;
  const { retries: r, interval: i, backoff: o = 0, attempt: s = 0, shouldRetry: a, cancellationToken: c = new mm.CancellationToken() } = t;
  try {
    return await e();
  } catch (m) {
    if (await Promise.resolve((n = a == null ? void 0 : a(m)) !== null && n !== void 0 ? n : !0) && r > 0 && !c.cancelled)
      return await new Promise((l) => setTimeout(l, i + o * s)), await Pc(e, { ...t, retries: r - 1, attempt: s + 1 });
    throw m;
  }
}
var jo = {};
Object.defineProperty(jo, "__esModule", { value: !0 });
jo.parseDn = gm;
function gm(e) {
  let t = !1, n = null, r = "", i = 0;
  e = e.trim();
  const o = /* @__PURE__ */ new Map();
  for (let s = 0; s <= e.length; s++) {
    if (s === e.length) {
      n !== null && o.set(n, r);
      break;
    }
    const a = e[s];
    if (t) {
      if (a === '"') {
        t = !1;
        continue;
      }
    } else {
      if (a === '"') {
        t = !0;
        continue;
      }
      if (a === "\\") {
        s++;
        const c = parseInt(e.slice(s, s + 2), 16);
        Number.isNaN(c) ? r += e[s] : (s++, r += String.fromCharCode(c));
        continue;
      }
      if (n === null && a === "=") {
        n = r, r = "";
        continue;
      }
      if (a === "," || a === ";" || a === "+") {
        n !== null && o.set(n, r), n = null, r = "";
        continue;
      }
    }
    if (a === " " && !t) {
      if (r.length === 0)
        continue;
      if (s > i) {
        let c = s;
        for (; e[c] === " "; )
          c++;
        i = c;
      }
      if (i >= e.length || e[i] === "," || e[i] === ";" || n === null && e[i] === "=" || n !== null && e[i] === "+") {
        s = i - 1;
        continue;
      }
    }
    r += a;
  }
  return o;
}
var ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
ln.nil = ln.UUID = void 0;
const Nc = Yn, Dc = dn, Em = "options.name must be either a string or a Buffer", ra = (0, Nc.randomBytes)(16);
ra[0] = ra[0] | 1;
const xr = {}, V = [];
for (let e = 0; e < 256; e++) {
  const t = (e + 256).toString(16).substr(1);
  xr[t] = e, V[e] = t;
}
class kt {
  constructor(t) {
    this.ascii = null, this.binary = null;
    const n = kt.check(t);
    if (!n)
      throw new Error("not a UUID");
    this.version = n.version, n.format === "ascii" ? this.ascii = t : this.binary = t;
  }
  static v5(t, n) {
    return ym(t, "sha1", 80, n);
  }
  toString() {
    return this.ascii == null && (this.ascii = wm(this.binary)), this.ascii;
  }
  inspect() {
    return `UUID v${this.version} ${this.toString()}`;
  }
  static check(t, n = 0) {
    if (typeof t == "string")
      return t = t.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(t) ? t === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
        version: (xr[t[14] + t[15]] & 240) >> 4,
        variant: ia((xr[t[19] + t[20]] & 224) >> 5),
        format: "ascii"
      } : !1;
    if (Buffer.isBuffer(t)) {
      if (t.length < n + 16)
        return !1;
      let r = 0;
      for (; r < 16 && t[n + r] === 0; r++)
        ;
      return r === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
        version: (t[n + 6] & 240) >> 4,
        variant: ia((t[n + 8] & 224) >> 5),
        format: "binary"
      };
    }
    throw (0, Dc.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
  }
  // read stringified uuid into a Buffer
  static parse(t) {
    const n = Buffer.allocUnsafe(16);
    let r = 0;
    for (let i = 0; i < 16; i++)
      n[i] = xr[t[r++] + t[r++]], (i === 3 || i === 5 || i === 7 || i === 9) && (r += 1);
    return n;
  }
}
ln.UUID = kt;
kt.OID = kt.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
function ia(e) {
  switch (e) {
    case 0:
    case 1:
    case 3:
      return "ncs";
    case 4:
    case 5:
      return "rfc4122";
    case 6:
      return "microsoft";
    default:
      return "future";
  }
}
var On;
(function(e) {
  e[e.ASCII = 0] = "ASCII", e[e.BINARY = 1] = "BINARY", e[e.OBJECT = 2] = "OBJECT";
})(On || (On = {}));
function ym(e, t, n, r, i = On.ASCII) {
  const o = (0, Nc.createHash)(t);
  if (typeof e != "string" && !Buffer.isBuffer(e))
    throw (0, Dc.newError)(Em, "ERR_INVALID_UUID_NAME");
  o.update(r), o.update(e);
  const a = o.digest();
  let c;
  switch (i) {
    case On.BINARY:
      a[6] = a[6] & 15 | n, a[8] = a[8] & 63 | 128, c = a;
      break;
    case On.OBJECT:
      a[6] = a[6] & 15 | n, a[8] = a[8] & 63 | 128, c = new kt(a);
      break;
    default:
      c = V[a[0]] + V[a[1]] + V[a[2]] + V[a[3]] + "-" + V[a[4]] + V[a[5]] + "-" + V[a[6] & 15 | n] + V[a[7]] + "-" + V[a[8] & 63 | 128] + V[a[9]] + "-" + V[a[10]] + V[a[11]] + V[a[12]] + V[a[13]] + V[a[14]] + V[a[15]];
      break;
  }
  return c;
}
function wm(e) {
  return V[e[0]] + V[e[1]] + V[e[2]] + V[e[3]] + "-" + V[e[4]] + V[e[5]] + "-" + V[e[6]] + V[e[7]] + "-" + V[e[8]] + V[e[9]] + "-" + V[e[10]] + V[e[11]] + V[e[12]] + V[e[13]] + V[e[14]] + V[e[15]];
}
ln.nil = new kt("00000000-0000-0000-0000-000000000000");
var Jn = {}, Fc = {};
(function(e) {
  (function(t) {
    t.parser = function(d, u) {
      return new r(d, u);
    }, t.SAXParser = r, t.SAXStream = l, t.createStream = m, t.MAX_BUFFER_LENGTH = 64 * 1024;
    var n = [
      "comment",
      "sgmlDecl",
      "textNode",
      "tagName",
      "doctype",
      "procInstName",
      "procInstBody",
      "entity",
      "attribName",
      "attribValue",
      "cdata",
      "script"
    ];
    t.EVENTS = [
      "text",
      "processinginstruction",
      "sgmldeclaration",
      "doctype",
      "comment",
      "opentagstart",
      "attribute",
      "opentag",
      "closetag",
      "opencdata",
      "cdata",
      "closecdata",
      "error",
      "end",
      "ready",
      "script",
      "opennamespace",
      "closenamespace"
    ];
    function r(d, u) {
      if (!(this instanceof r))
        return new r(d, u);
      var S = this;
      o(S), S.q = S.c = "", S.bufferCheckPosition = t.MAX_BUFFER_LENGTH, S.opt = u || {}, S.opt.lowercase = S.opt.lowercase || S.opt.lowercasetags, S.looseCase = S.opt.lowercase ? "toLowerCase" : "toUpperCase", S.tags = [], S.closed = S.closedRoot = S.sawRoot = !1, S.tag = S.error = null, S.strict = !!d, S.noscript = !!(d || S.opt.noscript), S.state = E.BEGIN, S.strictEntities = S.opt.strictEntities, S.ENTITIES = S.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), S.attribList = [], S.opt.xmlns && (S.ns = Object.create(y)), S.opt.unquotedAttributeValues === void 0 && (S.opt.unquotedAttributeValues = !d), S.trackPosition = S.opt.position !== !1, S.trackPosition && (S.position = S.line = S.column = 0), B(S, "onready");
    }
    Object.create || (Object.create = function(d) {
      function u() {
      }
      u.prototype = d;
      var S = new u();
      return S;
    }), Object.keys || (Object.keys = function(d) {
      var u = [];
      for (var S in d) d.hasOwnProperty(S) && u.push(S);
      return u;
    });
    function i(d) {
      for (var u = Math.max(t.MAX_BUFFER_LENGTH, 10), S = 0, v = 0, Y = n.length; v < Y; v++) {
        var Q = d[n[v]].length;
        if (Q > u)
          switch (n[v]) {
            case "textNode":
              X(d);
              break;
            case "cdata":
              M(d, "oncdata", d.cdata), d.cdata = "";
              break;
            case "script":
              M(d, "onscript", d.script), d.script = "";
              break;
            default:
              C(d, "Max buffer length exceeded: " + n[v]);
          }
        S = Math.max(S, Q);
      }
      var ie = t.MAX_BUFFER_LENGTH - S;
      d.bufferCheckPosition = ie + d.position;
    }
    function o(d) {
      for (var u = 0, S = n.length; u < S; u++)
        d[n[u]] = "";
    }
    function s(d) {
      X(d), d.cdata !== "" && (M(d, "oncdata", d.cdata), d.cdata = ""), d.script !== "" && (M(d, "onscript", d.script), d.script = "");
    }
    r.prototype = {
      end: function() {
        P(this);
      },
      write: ze,
      resume: function() {
        return this.error = null, this;
      },
      close: function() {
        return this.write(null);
      },
      flush: function() {
        s(this);
      }
    };
    var a;
    try {
      a = require("stream").Stream;
    } catch {
      a = function() {
      };
    }
    a || (a = function() {
    });
    var c = t.EVENTS.filter(function(d) {
      return d !== "error" && d !== "end";
    });
    function m(d, u) {
      return new l(d, u);
    }
    function l(d, u) {
      if (!(this instanceof l))
        return new l(d, u);
      a.apply(this), this._parser = new r(d, u), this.writable = !0, this.readable = !0;
      var S = this;
      this._parser.onend = function() {
        S.emit("end");
      }, this._parser.onerror = function(v) {
        S.emit("error", v), S._parser.error = null;
      }, this._decoder = null, c.forEach(function(v) {
        Object.defineProperty(S, "on" + v, {
          get: function() {
            return S._parser["on" + v];
          },
          set: function(Y) {
            if (!Y)
              return S.removeAllListeners(v), S._parser["on" + v] = Y, Y;
            S.on(v, Y);
          },
          enumerable: !0,
          configurable: !1
        });
      });
    }
    l.prototype = Object.create(a.prototype, {
      constructor: {
        value: l
      }
    }), l.prototype.write = function(d) {
      if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(d)) {
        if (!this._decoder) {
          var u = ad.StringDecoder;
          this._decoder = new u("utf8");
        }
        d = this._decoder.write(d);
      }
      return this._parser.write(d.toString()), this.emit("data", d), !0;
    }, l.prototype.end = function(d) {
      return d && d.length && this.write(d), this._parser.end(), !0;
    }, l.prototype.on = function(d, u) {
      var S = this;
      return !S._parser["on" + d] && c.indexOf(d) !== -1 && (S._parser["on" + d] = function() {
        var v = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        v.splice(0, 0, d), S.emit.apply(S, v);
      }), a.prototype.on.call(S, d, u);
    };
    var f = "[CDATA[", h = "DOCTYPE", g = "http://www.w3.org/XML/1998/namespace", w = "http://www.w3.org/2000/xmlns/", y = { xml: g, xmlns: w }, A = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, T = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, R = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, N = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function x(d) {
      return d === " " || d === `
` || d === "\r" || d === "	";
    }
    function ee(d) {
      return d === '"' || d === "'";
    }
    function se(d) {
      return d === ">" || x(d);
    }
    function W(d, u) {
      return d.test(u);
    }
    function Fe(d, u) {
      return !W(d, u);
    }
    var E = 0;
    t.STATE = {
      BEGIN: E++,
      // leading byte order mark or whitespace
      BEGIN_WHITESPACE: E++,
      // leading whitespace
      TEXT: E++,
      // general stuff
      TEXT_ENTITY: E++,
      // &amp and such.
      OPEN_WAKA: E++,
      // <
      SGML_DECL: E++,
      // <!BLARG
      SGML_DECL_QUOTED: E++,
      // <!BLARG foo "bar
      DOCTYPE: E++,
      // <!DOCTYPE
      DOCTYPE_QUOTED: E++,
      // <!DOCTYPE "//blah
      DOCTYPE_DTD: E++,
      // <!DOCTYPE "//blah" [ ...
      DOCTYPE_DTD_QUOTED: E++,
      // <!DOCTYPE "//blah" [ "foo
      COMMENT_STARTING: E++,
      // <!-
      COMMENT: E++,
      // <!--
      COMMENT_ENDING: E++,
      // <!-- blah -
      COMMENT_ENDED: E++,
      // <!-- blah --
      CDATA: E++,
      // <![CDATA[ something
      CDATA_ENDING: E++,
      // ]
      CDATA_ENDING_2: E++,
      // ]]
      PROC_INST: E++,
      // <?hi
      PROC_INST_BODY: E++,
      // <?hi there
      PROC_INST_ENDING: E++,
      // <?hi "there" ?
      OPEN_TAG: E++,
      // <strong
      OPEN_TAG_SLASH: E++,
      // <strong /
      ATTRIB: E++,
      // <a
      ATTRIB_NAME: E++,
      // <a foo
      ATTRIB_NAME_SAW_WHITE: E++,
      // <a foo _
      ATTRIB_VALUE: E++,
      // <a foo=
      ATTRIB_VALUE_QUOTED: E++,
      // <a foo="bar
      ATTRIB_VALUE_CLOSED: E++,
      // <a foo="bar"
      ATTRIB_VALUE_UNQUOTED: E++,
      // <a foo=bar
      ATTRIB_VALUE_ENTITY_Q: E++,
      // <foo bar="&quot;"
      ATTRIB_VALUE_ENTITY_U: E++,
      // <foo bar=&quot
      CLOSE_TAG: E++,
      // </a
      CLOSE_TAG_SAW_WHITE: E++,
      // </a   >
      SCRIPT: E++,
      // <script> ...
      SCRIPT_ENDING: E++
      // <script> ... <
    }, t.XML_ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'"
    }, t.ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
      AElig: 198,
      Aacute: 193,
      Acirc: 194,
      Agrave: 192,
      Aring: 197,
      Atilde: 195,
      Auml: 196,
      Ccedil: 199,
      ETH: 208,
      Eacute: 201,
      Ecirc: 202,
      Egrave: 200,
      Euml: 203,
      Iacute: 205,
      Icirc: 206,
      Igrave: 204,
      Iuml: 207,
      Ntilde: 209,
      Oacute: 211,
      Ocirc: 212,
      Ograve: 210,
      Oslash: 216,
      Otilde: 213,
      Ouml: 214,
      THORN: 222,
      Uacute: 218,
      Ucirc: 219,
      Ugrave: 217,
      Uuml: 220,
      Yacute: 221,
      aacute: 225,
      acirc: 226,
      aelig: 230,
      agrave: 224,
      aring: 229,
      atilde: 227,
      auml: 228,
      ccedil: 231,
      eacute: 233,
      ecirc: 234,
      egrave: 232,
      eth: 240,
      euml: 235,
      iacute: 237,
      icirc: 238,
      igrave: 236,
      iuml: 239,
      ntilde: 241,
      oacute: 243,
      ocirc: 244,
      ograve: 242,
      oslash: 248,
      otilde: 245,
      ouml: 246,
      szlig: 223,
      thorn: 254,
      uacute: 250,
      ucirc: 251,
      ugrave: 249,
      uuml: 252,
      yacute: 253,
      yuml: 255,
      copy: 169,
      reg: 174,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup1: 185,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      times: 215,
      divide: 247,
      OElig: 338,
      oelig: 339,
      Scaron: 352,
      scaron: 353,
      Yuml: 376,
      fnof: 402,
      circ: 710,
      tilde: 732,
      Alpha: 913,
      Beta: 914,
      Gamma: 915,
      Delta: 916,
      Epsilon: 917,
      Zeta: 918,
      Eta: 919,
      Theta: 920,
      Iota: 921,
      Kappa: 922,
      Lambda: 923,
      Mu: 924,
      Nu: 925,
      Xi: 926,
      Omicron: 927,
      Pi: 928,
      Rho: 929,
      Sigma: 931,
      Tau: 932,
      Upsilon: 933,
      Phi: 934,
      Chi: 935,
      Psi: 936,
      Omega: 937,
      alpha: 945,
      beta: 946,
      gamma: 947,
      delta: 948,
      epsilon: 949,
      zeta: 950,
      eta: 951,
      theta: 952,
      iota: 953,
      kappa: 954,
      lambda: 955,
      mu: 956,
      nu: 957,
      xi: 958,
      omicron: 959,
      pi: 960,
      rho: 961,
      sigmaf: 962,
      sigma: 963,
      tau: 964,
      upsilon: 965,
      phi: 966,
      chi: 967,
      psi: 968,
      omega: 969,
      thetasym: 977,
      upsih: 978,
      piv: 982,
      ensp: 8194,
      emsp: 8195,
      thinsp: 8201,
      zwnj: 8204,
      zwj: 8205,
      lrm: 8206,
      rlm: 8207,
      ndash: 8211,
      mdash: 8212,
      lsquo: 8216,
      rsquo: 8217,
      sbquo: 8218,
      ldquo: 8220,
      rdquo: 8221,
      bdquo: 8222,
      dagger: 8224,
      Dagger: 8225,
      bull: 8226,
      hellip: 8230,
      permil: 8240,
      prime: 8242,
      Prime: 8243,
      lsaquo: 8249,
      rsaquo: 8250,
      oline: 8254,
      frasl: 8260,
      euro: 8364,
      image: 8465,
      weierp: 8472,
      real: 8476,
      trade: 8482,
      alefsym: 8501,
      larr: 8592,
      uarr: 8593,
      rarr: 8594,
      darr: 8595,
      harr: 8596,
      crarr: 8629,
      lArr: 8656,
      uArr: 8657,
      rArr: 8658,
      dArr: 8659,
      hArr: 8660,
      forall: 8704,
      part: 8706,
      exist: 8707,
      empty: 8709,
      nabla: 8711,
      isin: 8712,
      notin: 8713,
      ni: 8715,
      prod: 8719,
      sum: 8721,
      minus: 8722,
      lowast: 8727,
      radic: 8730,
      prop: 8733,
      infin: 8734,
      ang: 8736,
      and: 8743,
      or: 8744,
      cap: 8745,
      cup: 8746,
      int: 8747,
      there4: 8756,
      sim: 8764,
      cong: 8773,
      asymp: 8776,
      ne: 8800,
      equiv: 8801,
      le: 8804,
      ge: 8805,
      sub: 8834,
      sup: 8835,
      nsub: 8836,
      sube: 8838,
      supe: 8839,
      oplus: 8853,
      otimes: 8855,
      perp: 8869,
      sdot: 8901,
      lceil: 8968,
      rceil: 8969,
      lfloor: 8970,
      rfloor: 8971,
      lang: 9001,
      rang: 9002,
      loz: 9674,
      spades: 9824,
      clubs: 9827,
      hearts: 9829,
      diams: 9830
    }, Object.keys(t.ENTITIES).forEach(function(d) {
      var u = t.ENTITIES[d], S = typeof u == "number" ? String.fromCharCode(u) : u;
      t.ENTITIES[d] = S;
    });
    for (var G in t.STATE)
      t.STATE[t.STATE[G]] = G;
    E = t.STATE;
    function B(d, u, S) {
      d[u] && d[u](S);
    }
    function M(d, u, S) {
      d.textNode && X(d), B(d, u, S);
    }
    function X(d) {
      d.textNode = O(d.opt, d.textNode), d.textNode && B(d, "ontext", d.textNode), d.textNode = "";
    }
    function O(d, u) {
      return d.trim && (u = u.trim()), d.normalize && (u = u.replace(/\s+/g, " ")), u;
    }
    function C(d, u) {
      return X(d), d.trackPosition && (u += `
Line: ` + d.line + `
Column: ` + d.column + `
Char: ` + d.c), u = new Error(u), d.error = u, B(d, "onerror", u), d;
    }
    function P(d) {
      return d.sawRoot && !d.closedRoot && b(d, "Unclosed root tag"), d.state !== E.BEGIN && d.state !== E.BEGIN_WHITESPACE && d.state !== E.TEXT && C(d, "Unexpected end"), X(d), d.c = "", d.closed = !0, B(d, "onend"), r.call(d, d.strict, d.opt), d;
    }
    function b(d, u) {
      if (typeof d != "object" || !(d instanceof r))
        throw new Error("bad call to strictFail");
      d.strict && C(d, u);
    }
    function D(d) {
      d.strict || (d.tagName = d.tagName[d.looseCase]());
      var u = d.tags[d.tags.length - 1] || d, S = d.tag = { name: d.tagName, attributes: {} };
      d.opt.xmlns && (S.ns = u.ns), d.attribList.length = 0, M(d, "onopentagstart", S);
    }
    function I(d, u) {
      var S = d.indexOf(":"), v = S < 0 ? ["", d] : d.split(":"), Y = v[0], Q = v[1];
      return u && d === "xmlns" && (Y = "xmlns", Q = ""), { prefix: Y, local: Q };
    }
    function k(d) {
      if (d.strict || (d.attribName = d.attribName[d.looseCase]()), d.attribList.indexOf(d.attribName) !== -1 || d.tag.attributes.hasOwnProperty(d.attribName)) {
        d.attribName = d.attribValue = "";
        return;
      }
      if (d.opt.xmlns) {
        var u = I(d.attribName, !0), S = u.prefix, v = u.local;
        if (S === "xmlns")
          if (v === "xml" && d.attribValue !== g)
            b(
              d,
              "xml: prefix must be bound to " + g + `
Actual: ` + d.attribValue
            );
          else if (v === "xmlns" && d.attribValue !== w)
            b(
              d,
              "xmlns: prefix must be bound to " + w + `
Actual: ` + d.attribValue
            );
          else {
            var Y = d.tag, Q = d.tags[d.tags.length - 1] || d;
            Y.ns === Q.ns && (Y.ns = Object.create(Q.ns)), Y.ns[v] = d.attribValue;
          }
        d.attribList.push([d.attribName, d.attribValue]);
      } else
        d.tag.attributes[d.attribName] = d.attribValue, M(d, "onattribute", {
          name: d.attribName,
          value: d.attribValue
        });
      d.attribName = d.attribValue = "";
    }
    function q(d, u) {
      if (d.opt.xmlns) {
        var S = d.tag, v = I(d.tagName);
        S.prefix = v.prefix, S.local = v.local, S.uri = S.ns[v.prefix] || "", S.prefix && !S.uri && (b(
          d,
          "Unbound namespace prefix: " + JSON.stringify(d.tagName)
        ), S.uri = v.prefix);
        var Y = d.tags[d.tags.length - 1] || d;
        S.ns && Y.ns !== S.ns && Object.keys(S.ns).forEach(function(sr) {
          M(d, "onopennamespace", {
            prefix: sr,
            uri: S.ns[sr]
          });
        });
        for (var Q = 0, ie = d.attribList.length; Q < ie; Q++) {
          var me = d.attribList[Q], _e = me[0], st = me[1], ce = I(_e, !0), Me = ce.prefix, wi = ce.local, or = Me === "" ? "" : S.ns[Me] || "", gn = {
            name: _e,
            value: st,
            prefix: Me,
            local: wi,
            uri: or
          };
          Me && Me !== "xmlns" && !or && (b(
            d,
            "Unbound namespace prefix: " + JSON.stringify(Me)
          ), gn.uri = Me), d.tag.attributes[_e] = gn, M(d, "onattribute", gn);
        }
        d.attribList.length = 0;
      }
      d.tag.isSelfClosing = !!u, d.sawRoot = !0, d.tags.push(d.tag), M(d, "onopentag", d.tag), u || (!d.noscript && d.tagName.toLowerCase() === "script" ? d.state = E.SCRIPT : d.state = E.TEXT, d.tag = null, d.tagName = ""), d.attribName = d.attribValue = "", d.attribList.length = 0;
    }
    function j(d) {
      if (!d.tagName) {
        b(d, "Weird empty close tag."), d.textNode += "</>", d.state = E.TEXT;
        return;
      }
      if (d.script) {
        if (d.tagName !== "script") {
          d.script += "</" + d.tagName + ">", d.tagName = "", d.state = E.SCRIPT;
          return;
        }
        M(d, "onscript", d.script), d.script = "";
      }
      var u = d.tags.length, S = d.tagName;
      d.strict || (S = S[d.looseCase]());
      for (var v = S; u--; ) {
        var Y = d.tags[u];
        if (Y.name !== v)
          b(d, "Unexpected close tag");
        else
          break;
      }
      if (u < 0) {
        b(d, "Unmatched closing tag: " + d.tagName), d.textNode += "</" + d.tagName + ">", d.state = E.TEXT;
        return;
      }
      d.tagName = S;
      for (var Q = d.tags.length; Q-- > u; ) {
        var ie = d.tag = d.tags.pop();
        d.tagName = d.tag.name, M(d, "onclosetag", d.tagName);
        var me = {};
        for (var _e in ie.ns)
          me[_e] = ie.ns[_e];
        var st = d.tags[d.tags.length - 1] || d;
        d.opt.xmlns && ie.ns !== st.ns && Object.keys(ie.ns).forEach(function(ce) {
          var Me = ie.ns[ce];
          M(d, "onclosenamespace", { prefix: ce, uri: Me });
        });
      }
      u === 0 && (d.closedRoot = !0), d.tagName = d.attribValue = d.attribName = "", d.attribList.length = 0, d.state = E.TEXT;
    }
    function K(d) {
      var u = d.entity, S = u.toLowerCase(), v, Y = "";
      return d.ENTITIES[u] ? d.ENTITIES[u] : d.ENTITIES[S] ? d.ENTITIES[S] : (u = S, u.charAt(0) === "#" && (u.charAt(1) === "x" ? (u = u.slice(2), v = parseInt(u, 16), Y = v.toString(16)) : (u = u.slice(1), v = parseInt(u, 10), Y = v.toString(10))), u = u.replace(/^0+/, ""), isNaN(v) || Y.toLowerCase() !== u || v < 0 || v > 1114111 ? (b(d, "Invalid character entity"), "&" + d.entity + ";") : String.fromCodePoint(v));
    }
    function de(d, u) {
      u === "<" ? (d.state = E.OPEN_WAKA, d.startTagPosition = d.position) : x(u) || (b(d, "Non-whitespace before first tag."), d.textNode = u, d.state = E.TEXT);
    }
    function U(d, u) {
      var S = "";
      return u < d.length && (S = d.charAt(u)), S;
    }
    function ze(d) {
      var u = this;
      if (this.error)
        throw this.error;
      if (u.closed)
        return C(
          u,
          "Cannot write after close. Assign an onready handler."
        );
      if (d === null)
        return P(u);
      typeof d == "object" && (d = d.toString());
      for (var S = 0, v = ""; v = U(d, S++), u.c = v, !!v; )
        switch (u.trackPosition && (u.position++, v === `
` ? (u.line++, u.column = 0) : u.column++), u.state) {
          case E.BEGIN:
            if (u.state = E.BEGIN_WHITESPACE, v === "\uFEFF")
              continue;
            de(u, v);
            continue;
          case E.BEGIN_WHITESPACE:
            de(u, v);
            continue;
          case E.TEXT:
            if (u.sawRoot && !u.closedRoot) {
              for (var Q = S - 1; v && v !== "<" && v !== "&"; )
                v = U(d, S++), v && u.trackPosition && (u.position++, v === `
` ? (u.line++, u.column = 0) : u.column++);
              u.textNode += d.substring(Q, S - 1);
            }
            v === "<" && !(u.sawRoot && u.closedRoot && !u.strict) ? (u.state = E.OPEN_WAKA, u.startTagPosition = u.position) : (!x(v) && (!u.sawRoot || u.closedRoot) && b(u, "Text data outside of root node."), v === "&" ? u.state = E.TEXT_ENTITY : u.textNode += v);
            continue;
          case E.SCRIPT:
            v === "<" ? u.state = E.SCRIPT_ENDING : u.script += v;
            continue;
          case E.SCRIPT_ENDING:
            v === "/" ? u.state = E.CLOSE_TAG : (u.script += "<" + v, u.state = E.SCRIPT);
            continue;
          case E.OPEN_WAKA:
            if (v === "!")
              u.state = E.SGML_DECL, u.sgmlDecl = "";
            else if (!x(v)) if (W(A, v))
              u.state = E.OPEN_TAG, u.tagName = v;
            else if (v === "/")
              u.state = E.CLOSE_TAG, u.tagName = "";
            else if (v === "?")
              u.state = E.PROC_INST, u.procInstName = u.procInstBody = "";
            else {
              if (b(u, "Unencoded <"), u.startTagPosition + 1 < u.position) {
                var Y = u.position - u.startTagPosition;
                v = new Array(Y).join(" ") + v;
              }
              u.textNode += "<" + v, u.state = E.TEXT;
            }
            continue;
          case E.SGML_DECL:
            if (u.sgmlDecl + v === "--") {
              u.state = E.COMMENT, u.comment = "", u.sgmlDecl = "";
              continue;
            }
            u.doctype && u.doctype !== !0 && u.sgmlDecl ? (u.state = E.DOCTYPE_DTD, u.doctype += "<!" + u.sgmlDecl + v, u.sgmlDecl = "") : (u.sgmlDecl + v).toUpperCase() === f ? (M(u, "onopencdata"), u.state = E.CDATA, u.sgmlDecl = "", u.cdata = "") : (u.sgmlDecl + v).toUpperCase() === h ? (u.state = E.DOCTYPE, (u.doctype || u.sawRoot) && b(
              u,
              "Inappropriately located doctype declaration"
            ), u.doctype = "", u.sgmlDecl = "") : v === ">" ? (M(u, "onsgmldeclaration", u.sgmlDecl), u.sgmlDecl = "", u.state = E.TEXT) : (ee(v) && (u.state = E.SGML_DECL_QUOTED), u.sgmlDecl += v);
            continue;
          case E.SGML_DECL_QUOTED:
            v === u.q && (u.state = E.SGML_DECL, u.q = ""), u.sgmlDecl += v;
            continue;
          case E.DOCTYPE:
            v === ">" ? (u.state = E.TEXT, M(u, "ondoctype", u.doctype), u.doctype = !0) : (u.doctype += v, v === "[" ? u.state = E.DOCTYPE_DTD : ee(v) && (u.state = E.DOCTYPE_QUOTED, u.q = v));
            continue;
          case E.DOCTYPE_QUOTED:
            u.doctype += v, v === u.q && (u.q = "", u.state = E.DOCTYPE);
            continue;
          case E.DOCTYPE_DTD:
            v === "]" ? (u.doctype += v, u.state = E.DOCTYPE) : v === "<" ? (u.state = E.OPEN_WAKA, u.startTagPosition = u.position) : ee(v) ? (u.doctype += v, u.state = E.DOCTYPE_DTD_QUOTED, u.q = v) : u.doctype += v;
            continue;
          case E.DOCTYPE_DTD_QUOTED:
            u.doctype += v, v === u.q && (u.state = E.DOCTYPE_DTD, u.q = "");
            continue;
          case E.COMMENT:
            v === "-" ? u.state = E.COMMENT_ENDING : u.comment += v;
            continue;
          case E.COMMENT_ENDING:
            v === "-" ? (u.state = E.COMMENT_ENDED, u.comment = O(u.opt, u.comment), u.comment && M(u, "oncomment", u.comment), u.comment = "") : (u.comment += "-" + v, u.state = E.COMMENT);
            continue;
          case E.COMMENT_ENDED:
            v !== ">" ? (b(u, "Malformed comment"), u.comment += "--" + v, u.state = E.COMMENT) : u.doctype && u.doctype !== !0 ? u.state = E.DOCTYPE_DTD : u.state = E.TEXT;
            continue;
          case E.CDATA:
            for (var Q = S - 1; v && v !== "]"; )
              v = U(d, S++), v && u.trackPosition && (u.position++, v === `
` ? (u.line++, u.column = 0) : u.column++);
            u.cdata += d.substring(Q, S - 1), v === "]" && (u.state = E.CDATA_ENDING);
            continue;
          case E.CDATA_ENDING:
            v === "]" ? u.state = E.CDATA_ENDING_2 : (u.cdata += "]" + v, u.state = E.CDATA);
            continue;
          case E.CDATA_ENDING_2:
            v === ">" ? (u.cdata && M(u, "oncdata", u.cdata), M(u, "onclosecdata"), u.cdata = "", u.state = E.TEXT) : v === "]" ? u.cdata += "]" : (u.cdata += "]]" + v, u.state = E.CDATA);
            continue;
          case E.PROC_INST:
            v === "?" ? u.state = E.PROC_INST_ENDING : x(v) ? u.state = E.PROC_INST_BODY : u.procInstName += v;
            continue;
          case E.PROC_INST_BODY:
            if (!u.procInstBody && x(v))
              continue;
            v === "?" ? u.state = E.PROC_INST_ENDING : u.procInstBody += v;
            continue;
          case E.PROC_INST_ENDING:
            v === ">" ? (M(u, "onprocessinginstruction", {
              name: u.procInstName,
              body: u.procInstBody
            }), u.procInstName = u.procInstBody = "", u.state = E.TEXT) : (u.procInstBody += "?" + v, u.state = E.PROC_INST_BODY);
            continue;
          case E.OPEN_TAG:
            W(T, v) ? u.tagName += v : (D(u), v === ">" ? q(u) : v === "/" ? u.state = E.OPEN_TAG_SLASH : (x(v) || b(u, "Invalid character in tag name"), u.state = E.ATTRIB));
            continue;
          case E.OPEN_TAG_SLASH:
            v === ">" ? (q(u, !0), j(u)) : (b(
              u,
              "Forward-slash in opening tag not followed by >"
            ), u.state = E.ATTRIB);
            continue;
          case E.ATTRIB:
            if (x(v))
              continue;
            v === ">" ? q(u) : v === "/" ? u.state = E.OPEN_TAG_SLASH : W(A, v) ? (u.attribName = v, u.attribValue = "", u.state = E.ATTRIB_NAME) : b(u, "Invalid attribute name");
            continue;
          case E.ATTRIB_NAME:
            v === "=" ? u.state = E.ATTRIB_VALUE : v === ">" ? (b(u, "Attribute without value"), u.attribValue = u.attribName, k(u), q(u)) : x(v) ? u.state = E.ATTRIB_NAME_SAW_WHITE : W(T, v) ? u.attribName += v : b(u, "Invalid attribute name");
            continue;
          case E.ATTRIB_NAME_SAW_WHITE:
            if (v === "=")
              u.state = E.ATTRIB_VALUE;
            else {
              if (x(v))
                continue;
              b(u, "Attribute without value"), u.tag.attributes[u.attribName] = "", u.attribValue = "", M(u, "onattribute", {
                name: u.attribName,
                value: ""
              }), u.attribName = "", v === ">" ? q(u) : W(A, v) ? (u.attribName = v, u.state = E.ATTRIB_NAME) : (b(u, "Invalid attribute name"), u.state = E.ATTRIB);
            }
            continue;
          case E.ATTRIB_VALUE:
            if (x(v))
              continue;
            ee(v) ? (u.q = v, u.state = E.ATTRIB_VALUE_QUOTED) : (u.opt.unquotedAttributeValues || C(u, "Unquoted attribute value"), u.state = E.ATTRIB_VALUE_UNQUOTED, u.attribValue = v);
            continue;
          case E.ATTRIB_VALUE_QUOTED:
            if (v !== u.q) {
              v === "&" ? u.state = E.ATTRIB_VALUE_ENTITY_Q : u.attribValue += v;
              continue;
            }
            k(u), u.q = "", u.state = E.ATTRIB_VALUE_CLOSED;
            continue;
          case E.ATTRIB_VALUE_CLOSED:
            x(v) ? u.state = E.ATTRIB : v === ">" ? q(u) : v === "/" ? u.state = E.OPEN_TAG_SLASH : W(A, v) ? (b(u, "No whitespace between attributes"), u.attribName = v, u.attribValue = "", u.state = E.ATTRIB_NAME) : b(u, "Invalid attribute name");
            continue;
          case E.ATTRIB_VALUE_UNQUOTED:
            if (!se(v)) {
              v === "&" ? u.state = E.ATTRIB_VALUE_ENTITY_U : u.attribValue += v;
              continue;
            }
            k(u), v === ">" ? q(u) : u.state = E.ATTRIB;
            continue;
          case E.CLOSE_TAG:
            if (u.tagName)
              v === ">" ? j(u) : W(T, v) ? u.tagName += v : u.script ? (u.script += "</" + u.tagName, u.tagName = "", u.state = E.SCRIPT) : (x(v) || b(u, "Invalid tagname in closing tag"), u.state = E.CLOSE_TAG_SAW_WHITE);
            else {
              if (x(v))
                continue;
              Fe(A, v) ? u.script ? (u.script += "</" + v, u.state = E.SCRIPT) : b(u, "Invalid tagname in closing tag.") : u.tagName = v;
            }
            continue;
          case E.CLOSE_TAG_SAW_WHITE:
            if (x(v))
              continue;
            v === ">" ? j(u) : b(u, "Invalid characters in closing tag");
            continue;
          case E.TEXT_ENTITY:
          case E.ATTRIB_VALUE_ENTITY_Q:
          case E.ATTRIB_VALUE_ENTITY_U:
            var ie, me;
            switch (u.state) {
              case E.TEXT_ENTITY:
                ie = E.TEXT, me = "textNode";
                break;
              case E.ATTRIB_VALUE_ENTITY_Q:
                ie = E.ATTRIB_VALUE_QUOTED, me = "attribValue";
                break;
              case E.ATTRIB_VALUE_ENTITY_U:
                ie = E.ATTRIB_VALUE_UNQUOTED, me = "attribValue";
                break;
            }
            if (v === ";") {
              var _e = K(u);
              u.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(_e) ? (u.entity = "", u.state = ie, u.write(_e)) : (u[me] += _e, u.entity = "", u.state = ie);
            } else W(u.entity.length ? N : R, v) ? u.entity += v : (b(u, "Invalid character in entity name"), u[me] += "&" + u.entity + v, u.entity = "", u.state = ie);
            continue;
          default:
            throw new Error(u, "Unknown state: " + u.state);
        }
      return u.position >= u.bufferCheckPosition && i(u), u;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    String.fromCodePoint || function() {
      var d = String.fromCharCode, u = Math.floor, S = function() {
        var v = 16384, Y = [], Q, ie, me = -1, _e = arguments.length;
        if (!_e)
          return "";
        for (var st = ""; ++me < _e; ) {
          var ce = Number(arguments[me]);
          if (!isFinite(ce) || // `NaN`, `+Infinity`, or `-Infinity`
          ce < 0 || // not a valid Unicode code point
          ce > 1114111 || // not a valid Unicode code point
          u(ce) !== ce)
            throw RangeError("Invalid code point: " + ce);
          ce <= 65535 ? Y.push(ce) : (ce -= 65536, Q = (ce >> 10) + 55296, ie = ce % 1024 + 56320, Y.push(Q, ie)), (me + 1 === _e || Y.length > v) && (st += d.apply(null, Y), Y.length = 0);
        }
        return st;
      };
      Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
        value: S,
        configurable: !0,
        writable: !0
      }) : String.fromCodePoint = S;
    }();
  })(e);
})(Fc);
Object.defineProperty(Jn, "__esModule", { value: !0 });
Jn.XElement = void 0;
Jn.parseXml = Tm;
const _m = Fc, _r = dn;
class xc {
  constructor(t) {
    if (this.name = t, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !t)
      throw (0, _r.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
    if (!Am(t))
      throw (0, _r.newError)(`Invalid element name: ${t}`, "ERR_XML_ELEMENT_INVALID_NAME");
  }
  attribute(t) {
    const n = this.attributes === null ? null : this.attributes[t];
    if (n == null)
      throw (0, _r.newError)(`No attribute "${t}"`, "ERR_XML_MISSED_ATTRIBUTE");
    return n;
  }
  removeAttribute(t) {
    this.attributes !== null && delete this.attributes[t];
  }
  element(t, n = !1, r = null) {
    const i = this.elementOrNull(t, n);
    if (i === null)
      throw (0, _r.newError)(r || `No element "${t}"`, "ERR_XML_MISSED_ELEMENT");
    return i;
  }
  elementOrNull(t, n = !1) {
    if (this.elements === null)
      return null;
    for (const r of this.elements)
      if (oa(r, t, n))
        return r;
    return null;
  }
  getElements(t, n = !1) {
    return this.elements === null ? [] : this.elements.filter((r) => oa(r, t, n));
  }
  elementValueOrEmpty(t, n = !1) {
    const r = this.elementOrNull(t, n);
    return r === null ? "" : r.value;
  }
}
Jn.XElement = xc;
const vm = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
function Am(e) {
  return vm.test(e);
}
function oa(e, t, n) {
  const r = e.name;
  return r === t || n === !0 && r.length === t.length && r.toLowerCase() === t.toLowerCase();
}
function Tm(e) {
  let t = null;
  const n = _m.parser(!0, {}), r = [];
  return n.onopentag = (i) => {
    const o = new xc(i.name);
    if (o.attributes = i.attributes, t === null)
      t = o;
    else {
      const s = r[r.length - 1];
      s.elements == null && (s.elements = []), s.elements.push(o);
    }
    r.push(o);
  }, n.onclosetag = () => {
    r.pop();
  }, n.ontext = (i) => {
    r.length > 0 && (r[r.length - 1].value = i);
  }, n.oncdata = (i) => {
    const o = r[r.length - 1];
    o.value = i, o.isCData = !0;
  }, n.onerror = (i) => {
    throw i;
  }, n.write(e), t;
}
var Ht = {};
Object.defineProperty(Ht, "__esModule", { value: !0 });
Ht.mapToObject = Lc;
Ht.isValidKey = ti;
Ht.asArray = Sm;
Ht.deepAssign = Cm;
Ht.objectToArgs = Om;
function Lc(e) {
  const t = {};
  for (const [n, r] of e)
    ti(n) && (r instanceof Map ? t[n] = Lc(r) : t[n] = r);
  return t;
}
function ti(e) {
  return ["__proto__", "prototype", "constructor"].includes(e) ? !1 : ["string", "number", "symbol", "boolean"].includes(typeof e) || e === null;
}
function Sm(e) {
  return e == null ? [] : Array.isArray(e) ? e : [e];
}
function sa(e) {
  if (Array.isArray(e))
    return !1;
  const t = typeof e;
  return t === "object" || t === "function";
}
function bm(e, t, n) {
  const r = t[n];
  if (r === void 0)
    return;
  const i = e[n];
  i == null || r == null || !sa(i) || !sa(r) ? Array.isArray(i) && Array.isArray(r) ? e[n] = Array.from(new Set(i.concat(r))) : e[n] = r : e[n] = Uc(i, r);
}
function Uc(e, t) {
  if (e !== t)
    for (const n of Object.getOwnPropertyNames(t))
      ti(n) && bm(e, t, n);
  return e;
}
function Cm(e, ...t) {
  for (const n of t)
    n != null && Uc(e, n);
  return e;
}
const $m = /^[a-zA-Z][a-zA-Z0-9-]*$/, Rm = /[\0\r\n]/;
function Om(e) {
  const t = Object.entries(e).reduce((n, [r, i]) => {
    if (!ti(r) || i == null)
      return n;
    if (!$m.test(r))
      throw new Error(`objectToArgs: unsafe flag name rejected: ${JSON.stringify(r)}`);
    if (Rm.test(i))
      throw new Error(`objectToArgs: value for --${r} contains a null byte or newline`);
    return n.concat([`--${r}`, i]);
  }, []);
  return Object.freeze(t);
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.objectToArgs = e.deepAssign = e.asArray = e.mapToObject = e.isValidKey = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.isSensitiveFieldName = e.HttpExecutor = e.hashSensitiveValue = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0;
  var t = wt;
  Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
    return t.CancellationError;
  } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } });
  var n = dn;
  Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
    return n.newError;
  } });
  var r = ue;
  Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
    return r.configureRequestOptions;
  } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
    return r.configureRequestOptionsFromUrl;
  } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
    return r.configureRequestUrl;
  } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
    return r.createHttpError;
  } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
    return r.DigestTransform;
  } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
    return r.HttpError;
  } }), Object.defineProperty(e, "hashSensitiveValue", { enumerable: !0, get: function() {
    return r.hashSensitiveValue;
  } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
    return r.HttpExecutor;
  } }), Object.defineProperty(e, "isSensitiveFieldName", { enumerable: !0, get: function() {
    return r.isSensitiveFieldName;
  } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
    return r.parseJson;
  } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
    return r.safeGetHeader;
  } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
    return r.safeStringifyJson;
  } });
  var i = ei;
  Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
    return i.MemoLazy;
  } });
  var o = Xn;
  Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
    return o.ProgressCallbackTransform;
  } });
  var s = Kn;
  Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
    return s.getS3LikeProviderBaseUrl;
  } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
    return s.githubUrl;
  } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
    return s.githubTagPrefix;
  } });
  var a = Bo;
  Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
    return a.retry;
  } });
  var c = jo;
  Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
    return c.parseDn;
  } });
  var m = ln;
  Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
    return m.UUID;
  } });
  var l = Jn;
  Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
    return l.parseXml;
  } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
    return l.XElement;
  } });
  var f = Ht;
  Object.defineProperty(e, "isValidKey", { enumerable: !0, get: function() {
    return f.isValidKey;
  } }), Object.defineProperty(e, "mapToObject", { enumerable: !0, get: function() {
    return f.mapToObject;
  } }), Object.defineProperty(e, "asArray", { enumerable: !0, get: function() {
    return f.asArray;
  } }), Object.defineProperty(e, "deepAssign", { enumerable: !0, get: function() {
    return f.deepAssign;
  } }), Object.defineProperty(e, "objectToArgs", { enumerable: !0, get: function() {
    return f.objectToArgs;
  } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
})(fe);
var we = {}, Ho = {}, qe = {};
function kc(e) {
  return typeof e > "u" || e === null;
}
function Im(e) {
  return typeof e == "object" && e !== null;
}
function Pm(e) {
  return Array.isArray(e) ? e : kc(e) ? [] : [e];
}
function Nm(e, t) {
  if (t) {
    const n = Object.keys(t);
    for (let r = 0, i = n.length; r < i; r += 1) {
      const o = n[r];
      e[o] = t[o];
    }
  }
  return e;
}
function Dm(e, t) {
  let n = "";
  for (let r = 0; r < t; r += 1)
    n += e;
  return n;
}
function Fm(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
qe.isNothing = kc;
qe.isObject = Im;
qe.toArray = Pm;
qe.repeat = Dm;
qe.isNegativeZero = Fm;
qe.extend = Nm;
function Mc(e, t) {
  let n = "";
  const r = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += `

` + e.mark.snippet), r + " " + n) : r;
}
function Ln(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Mc(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
Ln.prototype = Object.create(Error.prototype);
Ln.prototype.constructor = Ln;
Ln.prototype.toString = function(t) {
  return this.name + ": " + Mc(this, t);
};
var Qn = Ln;
const Sn = qe;
function xi(e, t, n, r, i) {
  let o = "", s = "";
  const a = Math.floor(i / 2) - 1;
  return r - t > a && (o = " ... ", t = r - a + o.length), n - r > a && (s = " ...", n = r + a - s.length), {
    str: o + e.slice(t, n).replace(/\t/g, "→") + s,
    pos: r - t + o.length
    // relative position
  };
}
function Li(e, t) {
  return Sn.repeat(" ", t - e.length) + e;
}
function xm(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  const n = /\r?\n|\r|\0/g, r = [0], i = [];
  let o, s = -1;
  for (; o = n.exec(e.buffer); )
    i.push(o.index), r.push(o.index + o[0].length), e.position <= o.index && s < 0 && (s = r.length - 2);
  s < 0 && (s = r.length - 1);
  let a = "";
  const c = Math.min(e.line + t.linesAfter, i.length).toString().length, m = t.maxLength - (t.indent + c + 3);
  for (let f = 1; f <= t.linesBefore && !(s - f < 0); f++) {
    const h = xi(
      e.buffer,
      r[s - f],
      i[s - f],
      e.position - (r[s] - r[s - f]),
      m
    );
    a = Sn.repeat(" ", t.indent) + Li((e.line - f + 1).toString(), c) + " | " + h.str + `
` + a;
  }
  const l = xi(e.buffer, r[s], i[s], e.position, m);
  a += Sn.repeat(" ", t.indent) + Li((e.line + 1).toString(), c) + " | " + l.str + `
`, a += Sn.repeat("-", t.indent + c + 3 + l.pos) + `^
`;
  for (let f = 1; f <= t.linesAfter && !(s + f >= i.length); f++) {
    const h = xi(
      e.buffer,
      r[s + f],
      i[s + f],
      e.position - (r[s] - r[s + f]),
      m
    );
    a += Sn.repeat(" ", t.indent) + Li((e.line + f + 1).toString(), c) + " | " + h.str + `
`;
  }
  return a.replace(/\n$/, "");
}
var Lm = xm;
const aa = Qn, Um = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
], km = [
  "scalar",
  "sequence",
  "mapping"
];
function Mm(e) {
  const t = {};
  return e !== null && Object.keys(e).forEach(function(n) {
    e[n].forEach(function(r) {
      t[String(r)] = n;
    });
  }), t;
}
function Bm(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(n) {
    if (Um.indexOf(n) === -1)
      throw new aa('Unknown option "' + n + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(n) {
    return n;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = Mm(t.styleAliases || null), km.indexOf(this.kind) === -1)
    throw new aa('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var Ie = Bm;
const vn = Qn, Ui = Ie;
function la(e, t) {
  const n = [];
  return e[t].forEach(function(r) {
    let i = n.length;
    n.forEach(function(o, s) {
      o.tag === r.tag && o.kind === r.kind && o.multi === r.multi && (i = s);
    }), n[i] = r;
  }), n;
}
function jm() {
  const e = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  };
  function t(n) {
    n.multi ? (e.multi[n.kind].push(n), e.multi.fallback.push(n)) : e[n.kind][n.tag] = e.fallback[n.tag] = n;
  }
  for (let n = 0, r = arguments.length; n < r; n += 1)
    arguments[n].forEach(t);
  return e;
}
function yo(e) {
  return this.extend(e);
}
yo.prototype.extend = function(t) {
  let n = [], r = [];
  if (t instanceof Ui)
    r.push(t);
  else if (Array.isArray(t))
    r = r.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (n = n.concat(t.implicit)), t.explicit && (r = r.concat(t.explicit));
  else
    throw new vn("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  n.forEach(function(o) {
    if (!(o instanceof Ui))
      throw new vn("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new vn("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new vn("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), r.forEach(function(o) {
    if (!(o instanceof Ui))
      throw new vn("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  const i = Object.create(yo.prototype);
  return i.implicit = (this.implicit || []).concat(n), i.explicit = (this.explicit || []).concat(r), i.compiledImplicit = la(i, "implicit"), i.compiledExplicit = la(i, "explicit"), i.compiledTypeMap = jm(i.compiledImplicit, i.compiledExplicit), i;
};
var Bc = yo;
const Hm = Ie;
var jc = new Hm("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
});
const Gm = Ie;
var Hc = new Gm("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
});
const qm = Ie;
var Gc = new qm("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
});
const Vm = Bc;
var qc = new Vm({
  explicit: [
    jc,
    Hc,
    Gc
  ]
});
const Wm = Ie;
function Ym(e) {
  if (e === null) return !0;
  const t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function zm() {
  return null;
}
function Xm(e) {
  return e === null;
}
var Vc = new Wm("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: Ym,
  construct: zm,
  predicate: Xm,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
const Km = Ie;
function Jm(e) {
  if (e === null) return !1;
  const t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function Qm(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function Zm(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var Wc = new Km("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: Jm,
  construct: Qm,
  predicate: Zm,
  represent: {
    lowercase: function(e) {
      return e ? "true" : "false";
    },
    uppercase: function(e) {
      return e ? "TRUE" : "FALSE";
    },
    camelcase: function(e) {
      return e ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
const eg = qe, tg = Ie;
function ng(e) {
  return e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102;
}
function rg(e) {
  return e >= 48 && e <= 55;
}
function ig(e) {
  return e >= 48 && e <= 57;
}
function og(e) {
  if (e === null) return !1;
  const t = e.length;
  let n = 0, r = !1;
  if (!t) return !1;
  let i = e[n];
  if ((i === "-" || i === "+") && (i = e[++n]), i === "0") {
    if (n + 1 === t) return !0;
    if (i = e[++n], i === "b") {
      for (n++; n < t; n++) {
        if (i = e[n], i !== "0" && i !== "1") return !1;
        r = !0;
      }
      return r && isFinite(bn(e));
    }
    if (i === "x") {
      for (n++; n < t; n++) {
        if (!ng(e.charCodeAt(n))) return !1;
        r = !0;
      }
      return r && isFinite(bn(e));
    }
    if (i === "o") {
      for (n++; n < t; n++) {
        if (!rg(e.charCodeAt(n))) return !1;
        r = !0;
      }
      return r && isFinite(bn(e));
    }
  }
  for (; n < t; n++) {
    if (!ig(e.charCodeAt(n)))
      return !1;
    r = !0;
  }
  return r ? isFinite(bn(e)) : !1;
}
function bn(e) {
  let t = e, n = 1, r = t[0];
  if ((r === "-" || r === "+") && (r === "-" && (n = -1), t = t.slice(1), r = t[0]), t === "0") return 0;
  if (r === "0") {
    if (t[1] === "b") return n * parseInt(t.slice(2), 2);
    if (t[1] === "x") return n * parseInt(t.slice(2), 16);
    if (t[1] === "o") return n * parseInt(t.slice(2), 8);
  }
  return n * parseInt(t, 10);
}
function sg(e) {
  return bn(e);
}
function ag(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !eg.isNegativeZero(e);
}
var Yc = new tg("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: og,
  construct: sg,
  predicate: ag,
  represent: {
    binary: function(e) {
      return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
    },
    octal: function(e) {
      return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
    },
    decimal: function(e) {
      return e.toString(10);
    },
    hexadecimal: function(e) {
      return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
const zc = qe, lg = Ie, cg = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
), ug = new RegExp(
  "^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function fg(e) {
  return e === null || !cg.test(e) ? !1 : isFinite(parseFloat(e, 10)) ? !0 : ug.test(e);
}
function dg(e) {
  let t = e.toLowerCase();
  const n = t[0] === "-" ? -1 : 1;
  return "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
const hg = /^[-+]?[0-9]+e/;
function pg(e, t) {
  if (isNaN(e))
    switch (t) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  else if (Number.POSITIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  else if (Number.NEGATIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  else if (zc.isNegativeZero(e))
    return "-0.0";
  const n = e.toString(10);
  return hg.test(n) ? n.replace("e", ".e") : n;
}
function mg(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || zc.isNegativeZero(e));
}
var Xc = new lg("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: fg,
  construct: dg,
  predicate: mg,
  represent: pg,
  defaultStyle: "lowercase"
}), Kc = qc.extend({
  implicit: [
    Vc,
    Wc,
    Yc,
    Xc
  ]
}), Jc = Kc;
const gg = Ie, Qc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Zc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function Eg(e) {
  return e === null ? !1 : Qc.exec(e) !== null || Zc.exec(e) !== null;
}
function yg(e) {
  let t = 0, n = null, r = Qc.exec(e);
  if (r === null && (r = Zc.exec(e)), r === null) throw new Error("Date resolve error");
  const i = +r[1], o = +r[2] - 1, s = +r[3];
  if (!r[4])
    return new Date(Date.UTC(i, o, s));
  const a = +r[4], c = +r[5], m = +r[6];
  if (r[7]) {
    for (t = r[7].slice(0, 3); t.length < 3; )
      t += "0";
    t = +t;
  }
  if (r[9]) {
    const f = +r[10], h = +(r[11] || 0);
    n = (f * 60 + h) * 6e4, r[9] === "-" && (n = -n);
  }
  const l = new Date(Date.UTC(i, o, s, a, c, m, t));
  return n && l.setTime(l.getTime() - n), l;
}
function wg(e) {
  return e.toISOString();
}
var eu = new gg("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: Eg,
  construct: yg,
  instanceOf: Date,
  represent: wg
});
const _g = Ie;
function vg(e) {
  return e === "<<" || e === null;
}
var tu = new _g("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: vg
});
const Ag = Ie, Go = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function Tg(e) {
  if (e === null) return !1;
  let t = 0;
  const n = e.length, r = Go;
  for (let i = 0; i < n; i++) {
    const o = r.indexOf(e.charAt(i));
    if (!(o > 64)) {
      if (o < 0) return !1;
      t += 6;
    }
  }
  return t % 8 === 0;
}
function Sg(e) {
  const t = e.replace(/[\r\n=]/g, ""), n = t.length, r = Go;
  let i = 0;
  const o = [];
  for (let a = 0; a < n; a++)
    a % 4 === 0 && a && (o.push(i >> 16 & 255), o.push(i >> 8 & 255), o.push(i & 255)), i = i << 6 | r.indexOf(t.charAt(a));
  const s = n % 4 * 6;
  return s === 0 ? (o.push(i >> 16 & 255), o.push(i >> 8 & 255), o.push(i & 255)) : s === 18 ? (o.push(i >> 10 & 255), o.push(i >> 2 & 255)) : s === 12 && o.push(i >> 4 & 255), new Uint8Array(o);
}
function bg(e) {
  let t = "", n = 0;
  const r = e.length, i = Go;
  for (let s = 0; s < r; s++)
    s % 3 === 0 && s && (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]), n = (n << 8) + e[s];
  const o = r % 3;
  return o === 0 ? (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]) : o === 2 ? (t += i[n >> 10 & 63], t += i[n >> 4 & 63], t += i[n << 2 & 63], t += i[64]) : o === 1 && (t += i[n >> 2 & 63], t += i[n << 4 & 63], t += i[64], t += i[64]), t;
}
function Cg(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var nu = new Ag("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: Tg,
  construct: Sg,
  predicate: Cg,
  represent: bg
});
const $g = Ie, ca = Object.prototype.hasOwnProperty, Rg = Object.prototype.toString;
function Og(e) {
  if (e === null) return !0;
  const t = {}, n = e;
  for (let r = 0, i = n.length; r < i; r += 1) {
    const o = n[r];
    let s = !1;
    if (Rg.call(o) !== "[object Object]") return !1;
    let a;
    for (a in o)
      if (ca.call(o, a))
        if (!s) s = !0;
        else return !1;
    if (!s || ca.call(t, a)) return !1;
    Object.defineProperty(t, a, { value: !0 });
  }
  return !0;
}
function Ig(e) {
  return e !== null ? e : [];
}
var ru = new $g("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: Og,
  construct: Ig
});
const Pg = Ie, Ng = Object.prototype.toString;
function Dg(e) {
  if (e === null) return !0;
  const t = e, n = new Array(t.length);
  for (let r = 0, i = t.length; r < i; r += 1) {
    const o = t[r];
    if (Ng.call(o) !== "[object Object]") return !1;
    const s = Object.keys(o);
    if (s.length !== 1) return !1;
    n[r] = [s[0], o[s[0]]];
  }
  return !0;
}
function Fg(e) {
  if (e === null) return [];
  const t = e, n = new Array(t.length);
  for (let r = 0, i = t.length; r < i; r += 1) {
    const o = t[r], s = Object.keys(o);
    n[r] = [s[0], o[s[0]]];
  }
  return n;
}
var iu = new Pg("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: Dg,
  construct: Fg
});
const xg = Ie, Lg = Object.prototype.hasOwnProperty;
function Ug(e) {
  if (e === null) return !0;
  const t = e;
  for (const n in t)
    if (Lg.call(t, n) && t[n] !== null)
      return !1;
  return !0;
}
function kg(e) {
  return e !== null ? e : {};
}
var ou = new xg("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: Ug,
  construct: kg
}), qo = Jc.extend({
  implicit: [
    eu,
    tu
  ],
  explicit: [
    nu,
    ru,
    iu,
    ou
  ]
});
const Dt = qe, su = Qn, Mg = Lm, Bg = qo, Ge = Object.prototype.hasOwnProperty, jr = 1, au = 2, lu = 3, Hr = 4, ki = 1, jg = 2, ua = 3, Hg = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Gg = /[\x85\u2028\u2029]/, qg = /[,\[\]{}]/, cu = /^(?:!|!!|![0-9A-Za-z-]+!)$/, uu = /^(?:!|[^,\[\]{}])(?:%[0-9a-f]{2}|[0-9a-z\-#;/?:@&=+$,_.!~*'()\[\]])*$/i;
function fa(e) {
  return Object.prototype.toString.call(e);
}
function Qe(e) {
  return e === 10 || e === 13;
}
function it(e) {
  return e === 9 || e === 32;
}
function De(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function Zt(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Vg(e) {
  if (e >= 48 && e <= 57)
    return e - 48;
  const t = e | 32;
  return t >= 97 && t <= 102 ? t - 97 + 10 : -1;
}
function Wg(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function Yg(e) {
  return e >= 48 && e <= 57 ? e - 48 : -1;
}
function da(e) {
  switch (e) {
    case 48:
      return "\0";
    case 97:
      return "\x07";
    case 98:
      return "\b";
    case 116:
      return "	";
    case 9:
      return "	";
    case 110:
      return `
`;
    case 118:
      return "\v";
    case 102:
      return "\f";
    case 114:
      return "\r";
    case 101:
      return "\x1B";
    case 32:
      return " ";
    case 34:
      return '"';
    case 47:
      return "/";
    case 92:
      return "\\";
    case 78:
      return "";
    case 95:
      return " ";
    case 76:
      return "\u2028";
    case 80:
      return "\u2029";
    default:
      return "";
  }
}
function zg(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function fu(e, t, n) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
}
const du = new Array(256), hu = new Array(256);
for (let e = 0; e < 256; e++)
  du[e] = da(e) ? 1 : 0, hu[e] = da(e);
function Xg(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || Bg, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.maxDepth = typeof t.maxDepth == "number" ? t.maxDepth : 100, this.maxTotalMergeKeys = typeof t.maxTotalMergeKeys == "number" ? t.maxTotalMergeKeys : 1e4, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.depth = 0, this.totalMergeKeys = 0, this.firstTabInLine = -1, this.documents = [], this.anchorMapTransactions = [];
}
function pu(e, t) {
  const n = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return n.snippet = Mg(n), new su(t, n);
}
function L(e, t) {
  throw pu(e, t);
}
function Gr(e, t) {
  e.onWarning && e.onWarning.call(null, pu(e, t));
}
function Ft(e, t, n) {
  const r = e.anchorMapTransactions;
  if (r.length !== 0) {
    const i = r[r.length - 1];
    Ge.call(i, t) || (i[t] = {
      existed: Ge.call(e.anchorMap, t),
      value: e.anchorMap[t]
    });
  }
  e.anchorMap[t] = n;
}
function Kg(e) {
  e.anchorMapTransactions.push(/* @__PURE__ */ Object.create(null));
}
function Jg(e) {
  const t = e.anchorMapTransactions.pop(), n = e.anchorMapTransactions;
  if (n.length === 0) return;
  const r = n[n.length - 1], i = Object.keys(t);
  for (let o = 0, s = i.length; o < s; o += 1) {
    const a = i[o];
    Ge.call(r, a) || (r[a] = t[a]);
  }
}
function Qg(e) {
  const t = e.anchorMapTransactions.pop(), n = Object.keys(t);
  for (let r = n.length - 1; r >= 0; r -= 1) {
    const i = t[n[r]];
    i.existed ? e.anchorMap[n[r]] = i.value : delete e.anchorMap[n[r]];
  }
}
function mu(e) {
  return {
    position: e.position,
    line: e.line,
    lineStart: e.lineStart,
    lineIndent: e.lineIndent,
    firstTabInLine: e.firstTabInLine,
    tag: e.tag,
    anchor: e.anchor,
    kind: e.kind,
    result: e.result
  };
}
function ha(e, t) {
  e.position = t.position, e.line = t.line, e.lineStart = t.lineStart, e.lineIndent = t.lineIndent, e.firstTabInLine = t.firstTabInLine, e.tag = t.tag, e.anchor = t.anchor, e.kind = t.kind, e.result = t.result;
}
const pa = {
  YAML: function(t, n, r) {
    t.version !== null && L(t, "duplication of %YAML directive"), r.length !== 1 && L(t, "YAML directive accepts exactly one argument");
    const i = /^([0-9]+)\.([0-9]+)$/.exec(r[0]);
    i === null && L(t, "ill-formed argument of the YAML directive");
    const o = parseInt(i[1], 10), s = parseInt(i[2], 10);
    o !== 1 && L(t, "unacceptable YAML version of the document"), t.version = r[0], t.checkLineBreaks = s < 2, s !== 1 && s !== 2 && Gr(t, "unsupported YAML version of the document");
  },
  TAG: function(t, n, r) {
    let i;
    r.length !== 2 && L(t, "TAG directive accepts exactly two arguments");
    const o = r[0];
    i = r[1], cu.test(o) || L(t, "ill-formed tag handle (first argument) of the TAG directive"), Ge.call(t.tagMap, o) && L(t, 'there is a previously declared suffix for "' + o + '" tag handle'), uu.test(i) || L(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      i = decodeURIComponent(i);
    } catch {
      L(t, "tag prefix is malformed: " + i);
    }
    t.tagMap[o] = i;
  }
};
function gt(e, t, n, r) {
  if (t < n) {
    const i = e.input.slice(t, n);
    if (r)
      for (let o = 0, s = i.length; o < s; o += 1) {
        const a = i.charCodeAt(o);
        a === 9 || a >= 32 && a <= 1114111 || L(e, "expected valid JSON character");
      }
    else Hg.test(i) && L(e, "the stream contains non-printable characters");
    e.result += i;
  }
}
function ma(e) {
  e.totalMergeKeys++, e.maxTotalMergeKeys !== -1 && e.totalMergeKeys > e.maxTotalMergeKeys && L(e, "merge keys exceeded maxTotalMergeKeys (" + e.maxTotalMergeKeys + ")");
}
function ga(e, t, n, r) {
  Dt.isObject(n) || L(e, "cannot merge mappings; the provided source object is unacceptable"), ma(e);
  const i = Object.keys(n);
  for (let o = 0, s = i.length; o < s; o += 1) {
    const a = i[o];
    ma(e), Ge.call(t, a) || (fu(t, a, n[a]), r[a] = !0);
  }
}
function en(e, t, n, r, i, o, s, a, c) {
  if (Array.isArray(i)) {
    i = Array.prototype.slice.call(i);
    for (let m = 0, l = i.length; m < l; m += 1)
      Array.isArray(i[m]) && L(e, "nested arrays are not supported inside keys"), typeof i == "object" && fa(i[m]) === "[object Object]" && (i[m] = "[object Object]");
  }
  if (typeof i == "object" && fa(i) === "[object Object]" && (i = "[object Object]"), i = String(i), t === null && (t = {}), r === "tag:yaml.org,2002:merge")
    if (Array.isArray(o)) {
      o.length > 100 && L(e, "abnormal merge sequence size");
      for (let m = 0, l = o.length; m < l; m += 1)
        ga(e, t, o[m], n);
    } else
      ga(e, t, o, n);
  else
    !e.json && !Ge.call(n, i) && Ge.call(t, i) && (e.line = s || e.line, e.lineStart = a || e.lineStart, e.position = c || e.position, L(e, "duplicated mapping key")), fu(t, i, o), delete n[i];
  return t;
}
function Vo(e) {
  const t = e.input.charCodeAt(e.position);
  t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : L(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function ae(e, t, n) {
  let r = 0, i = e.input.charCodeAt(e.position);
  for (; i !== 0; ) {
    for (; it(i); )
      i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position);
    if (t && i === 35)
      do
        i = e.input.charCodeAt(++e.position);
      while (i !== 10 && i !== 13 && i !== 0);
    if (Qe(i))
      for (Vo(e), i = e.input.charCodeAt(e.position), r++, e.lineIndent = 0; i === 32; )
        e.lineIndent++, i = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return n !== -1 && r !== 0 && e.lineIndent < n && Gr(e, "deficient indentation"), r;
}
function ni(e) {
  let t = e.position, n = e.input.charCodeAt(t);
  return !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || De(n)));
}
function Wo(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += Dt.repeat(`
`, t - 1));
}
function Zg(e, t, n) {
  let r, i, o, s, a, c;
  const m = e.kind, l = e.result;
  let f = e.input.charCodeAt(e.position);
  if (De(f) || Zt(f) || f === 35 || f === 38 || f === 42 || f === 33 || f === 124 || f === 62 || f === 39 || f === 34 || f === 37 || f === 64 || f === 96)
    return !1;
  if (f === 63 || f === 45) {
    const h = e.input.charCodeAt(e.position + 1);
    if (De(h) || n && Zt(h))
      return !1;
  }
  for (e.kind = "scalar", e.result = "", r = i = e.position, o = !1; f !== 0; ) {
    if (f === 58) {
      const h = e.input.charCodeAt(e.position + 1);
      if (De(h) || n && Zt(h))
        break;
    } else if (f === 35) {
      const h = e.input.charCodeAt(e.position - 1);
      if (De(h))
        break;
    } else {
      if (e.position === e.lineStart && ni(e) || n && Zt(f))
        break;
      if (Qe(f))
        if (s = e.line, a = e.lineStart, c = e.lineIndent, ae(e, !1, -1), e.lineIndent >= t) {
          o = !0, f = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = i, e.line = s, e.lineStart = a, e.lineIndent = c;
          break;
        }
    }
    o && (gt(e, r, i, !1), Wo(e, e.line - s), r = i = e.position, o = !1), it(f) || (i = e.position + 1), f = e.input.charCodeAt(++e.position);
  }
  return gt(e, r, i, !1), e.result ? !0 : (e.kind = m, e.result = l, !1);
}
function e0(e, t) {
  let n, r, i = e.input.charCodeAt(e.position);
  if (i !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = r = e.position; (i = e.input.charCodeAt(e.position)) !== 0; )
    if (i === 39)
      if (gt(e, n, e.position, !0), i = e.input.charCodeAt(++e.position), i === 39)
        n = e.position, e.position++, r = e.position;
      else
        return !0;
    else Qe(i) ? (gt(e, n, r, !0), Wo(e, ae(e, !1, t)), n = r = e.position) : e.position === e.lineStart && ni(e) ? L(e, "unexpected end of the document within a single quoted scalar") : (e.position++, it(i) || (r = e.position));
  L(e, "unexpected end of the stream within a single quoted scalar");
}
function t0(e, t) {
  let n, r, i, o = e.input.charCodeAt(e.position);
  if (o !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = r = e.position; (o = e.input.charCodeAt(e.position)) !== 0; ) {
    if (o === 34)
      return gt(e, n, e.position, !0), e.position++, !0;
    if (o === 92) {
      if (gt(e, n, e.position, !0), o = e.input.charCodeAt(++e.position), Qe(o))
        ae(e, !1, t);
      else if (o < 256 && du[o])
        e.result += hu[o], e.position++;
      else if ((i = Wg(o)) > 0) {
        let s = i, a = 0;
        for (; s > 0; s--)
          o = e.input.charCodeAt(++e.position), (i = Vg(o)) >= 0 ? a = (a << 4) + i : L(e, "expected hexadecimal character");
        e.result += zg(a), e.position++;
      } else
        L(e, "unknown escape sequence");
      n = r = e.position;
    } else Qe(o) ? (gt(e, n, r, !0), Wo(e, ae(e, !1, t)), n = r = e.position) : e.position === e.lineStart && ni(e) ? L(e, "unexpected end of the document within a double quoted scalar") : (e.position++, it(o) || (r = e.position));
  }
  L(e, "unexpected end of the stream within a double quoted scalar");
}
function n0(e, t) {
  let n = !0, r, i, o;
  const s = e.tag;
  let a;
  const c = e.anchor;
  let m, l, f, h;
  const g = /* @__PURE__ */ Object.create(null);
  let w, y, A, T = e.input.charCodeAt(e.position);
  if (T === 91)
    m = 93, h = !1, a = [];
  else if (T === 123)
    m = 125, h = !0, a = {};
  else
    return !1;
  for (e.anchor !== null && Ft(e, e.anchor, a), T = e.input.charCodeAt(++e.position); T !== 0; ) {
    if (ae(e, !0, t), T = e.input.charCodeAt(e.position), T === m)
      return e.position++, e.tag = s, e.anchor = c, e.kind = h ? "mapping" : "sequence", e.result = a, !0;
    if (n ? T === 44 && L(e, "expected the node content, but found ','") : L(e, "missed comma between flow collection entries"), y = w = A = null, l = f = !1, T === 63) {
      const R = e.input.charCodeAt(e.position + 1);
      De(R) && (l = f = !0, e.position++, ae(e, !0, t));
    }
    r = e.line, i = e.lineStart, o = e.position, cn(e, t, jr, !1, !0), y = e.tag, w = e.result, ae(e, !0, t), T = e.input.charCodeAt(e.position), (f || e.line === r) && T === 58 && (l = !0, T = e.input.charCodeAt(++e.position), ae(e, !0, t), cn(e, t, jr, !1, !0), A = e.result), h ? en(e, a, g, y, w, A, r, i, o) : l ? a.push(en(e, null, g, y, w, A, r, i, o)) : a.push(w), ae(e, !0, t), T = e.input.charCodeAt(e.position), T === 44 ? (n = !0, T = e.input.charCodeAt(++e.position)) : n = !1;
  }
  L(e, "unexpected end of the stream within a flow collection");
}
function r0(e, t) {
  let n, r = ki, i = !1, o = !1, s = t, a = 0, c = !1, m, l = e.input.charCodeAt(e.position);
  if (l === 124)
    n = !1;
  else if (l === 62)
    n = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; l !== 0; )
    if (l = e.input.charCodeAt(++e.position), l === 43 || l === 45)
      ki === r ? r = l === 43 ? ua : jg : L(e, "repeat of a chomping mode identifier");
    else if ((m = Yg(l)) >= 0)
      m === 0 ? L(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : o ? L(e, "repeat of an indentation width identifier") : (s = t + m - 1, o = !0);
    else
      break;
  if (it(l)) {
    do
      l = e.input.charCodeAt(++e.position);
    while (it(l));
    if (l === 35)
      do
        l = e.input.charCodeAt(++e.position);
      while (!Qe(l) && l !== 0);
  }
  for (; l !== 0; ) {
    for (Vo(e), e.lineIndent = 0, l = e.input.charCodeAt(e.position); (!o || e.lineIndent < s) && l === 32; )
      e.lineIndent++, l = e.input.charCodeAt(++e.position);
    if (!o && e.lineIndent > s && (s = e.lineIndent), Qe(l)) {
      a++;
      continue;
    }
    if (!o && s === 0 && L(e, "missing indentation for block scalar"), e.lineIndent < s) {
      r === ua ? e.result += Dt.repeat(`
`, i ? 1 + a : a) : r === ki && i && (e.result += `
`);
      break;
    }
    n ? it(l) ? (c = !0, e.result += Dt.repeat(`
`, i ? 1 + a : a)) : c ? (c = !1, e.result += Dt.repeat(`
`, a + 1)) : a === 0 ? i && (e.result += " ") : e.result += Dt.repeat(`
`, a) : e.result += Dt.repeat(`
`, i ? 1 + a : a), i = !0, o = !0, a = 0;
    const f = e.position;
    for (; !Qe(l) && l !== 0; )
      l = e.input.charCodeAt(++e.position);
    gt(e, f, e.position, !1);
  }
  return !0;
}
function Ea(e, t) {
  const n = e.tag, r = e.anchor, i = [];
  let o = !1;
  if (e.firstTabInLine !== -1) return !1;
  e.anchor !== null && Ft(e, e.anchor, i);
  let s = e.input.charCodeAt(e.position);
  for (; s !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, L(e, "tab characters must not be used in indentation")), s === 45); ) {
    const a = e.input.charCodeAt(e.position + 1);
    if (!De(a))
      break;
    if (o = !0, e.position++, ae(e, !0, -1) && e.lineIndent <= t) {
      i.push(null), s = e.input.charCodeAt(e.position);
      continue;
    }
    const c = e.line;
    if (cn(e, t, lu, !1, !0), i.push(e.result), ae(e, !0, -1), s = e.input.charCodeAt(e.position), (e.line === c || e.lineIndent > t) && s !== 0)
      L(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return o ? (e.tag = n, e.anchor = r, e.kind = "sequence", e.result = i, !0) : !1;
}
function gu(e, t, n) {
  let r, i, o, s;
  const a = e.tag, c = e.anchor, m = {}, l = /* @__PURE__ */ Object.create(null);
  let f = null, h = null, g = null, w = !1, y = !1;
  if (e.firstTabInLine !== -1) return !1;
  e.anchor !== null && Ft(e, e.anchor, m);
  let A = e.input.charCodeAt(e.position);
  for (; A !== 0; ) {
    !w && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, L(e, "tab characters must not be used in indentation"));
    const T = e.input.charCodeAt(e.position + 1), R = e.line;
    if ((A === 63 || A === 58) && De(T))
      A === 63 ? (w && (en(e, m, l, f, h, null, i, o, s), f = h = g = null), y = !0, w = !0, r = !0) : w ? (w = !1, r = !0) : L(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, A = T;
    else {
      if (i = e.line, o = e.lineStart, s = e.position, !cn(e, n, au, !1, !0))
        break;
      if (e.line === R) {
        for (A = e.input.charCodeAt(e.position); it(A); )
          A = e.input.charCodeAt(++e.position);
        if (A === 58)
          A = e.input.charCodeAt(++e.position), De(A) || L(e, "a whitespace character is expected after the key-value separator within a block mapping"), w && (en(e, m, l, f, h, null, i, o, s), f = h = g = null), y = !0, w = !1, r = !1, f = e.tag, h = e.result;
        else if (y)
          L(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = a, e.anchor = c, !0;
      } else if (y)
        L(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = a, e.anchor = c, !0;
    }
    if ((e.line === R || e.lineIndent > t) && (w && (i = e.line, o = e.lineStart, s = e.position), cn(e, t, Hr, !0, r) && (w ? h = e.result : g = e.result), w || (en(e, m, l, f, h, g, i, o, s), f = h = g = null), ae(e, !0, -1), A = e.input.charCodeAt(e.position)), (e.line === R || e.lineIndent > t) && A !== 0)
      L(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return w && en(e, m, l, f, h, null, i, o, s), y && (e.tag = a, e.anchor = c, e.kind = "mapping", e.result = m), y;
}
function i0(e) {
  let t = !1, n = !1, r, i, o = e.input.charCodeAt(e.position);
  if (o !== 33) return !1;
  e.tag !== null && L(e, "duplication of a tag property"), o = e.input.charCodeAt(++e.position), o === 60 ? (t = !0, o = e.input.charCodeAt(++e.position)) : o === 33 ? (n = !0, r = "!!", o = e.input.charCodeAt(++e.position)) : r = "!";
  let s = e.position;
  if (t) {
    do
      o = e.input.charCodeAt(++e.position);
    while (o !== 0 && o !== 62);
    e.position < e.length ? (i = e.input.slice(s, e.position), o = e.input.charCodeAt(++e.position)) : L(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; o !== 0 && !De(o); )
      o === 33 && (n ? L(e, "tag suffix cannot contain exclamation marks") : (r = e.input.slice(s - 1, e.position + 1), cu.test(r) || L(e, "named tag handle cannot contain such characters"), n = !0, s = e.position + 1)), o = e.input.charCodeAt(++e.position);
    i = e.input.slice(s, e.position), qg.test(i) && L(e, "tag suffix cannot contain flow indicator characters");
  }
  i && !uu.test(i) && L(e, "tag name cannot contain such characters: " + i);
  try {
    i = decodeURIComponent(i);
  } catch {
    L(e, "tag name is malformed: " + i);
  }
  return t ? e.tag = i : Ge.call(e.tagMap, r) ? e.tag = e.tagMap[r] + i : r === "!" ? e.tag = "!" + i : r === "!!" ? e.tag = "tag:yaml.org,2002:" + i : L(e, 'undeclared tag handle "' + r + '"'), !0;
}
function o0(e) {
  let t = e.input.charCodeAt(e.position);
  if (t !== 38) return !1;
  e.anchor !== null && L(e, "duplication of an anchor property"), t = e.input.charCodeAt(++e.position);
  const n = e.position;
  for (; t !== 0 && !De(t) && !Zt(t); )
    t = e.input.charCodeAt(++e.position);
  return e.position === n && L(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(n, e.position), !0;
}
function s0(e) {
  let t = e.input.charCodeAt(e.position);
  if (t !== 42) return !1;
  t = e.input.charCodeAt(++e.position);
  const n = e.position;
  for (; t !== 0 && !De(t) && !Zt(t); )
    t = e.input.charCodeAt(++e.position);
  e.position === n && L(e, "name of an alias node must contain at least one character");
  const r = e.input.slice(n, e.position);
  return Ge.call(e.anchorMap, r) || L(e, 'unidentified alias "' + r + '"'), e.result = e.anchorMap[r], ae(e, !0, -1), !0;
}
function a0(e, t, n, r) {
  const i = mu(e);
  return Kg(e), ha(e, t), e.tag = null, e.anchor = null, e.kind = null, e.result = null, gu(e, n, r) && e.kind === "mapping" ? (Jg(e), !0) : (Qg(e), ha(e, i), !1);
}
function cn(e, t, n, r, i) {
  let o, s, a = 1, c = !1, m = !1, l = null, f, h, g;
  e.depth >= e.maxDepth && L(e, "nesting exceeded maxDepth (" + e.maxDepth + ")"), e.depth += 1, e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null;
  const w = o = s = Hr === n || lu === n;
  if (r && ae(e, !0, -1) && (c = !0, e.lineIndent > t ? a = 1 : e.lineIndent === t ? a = 0 : e.lineIndent < t && (a = -1)), a === 1)
    for (; ; ) {
      const y = e.input.charCodeAt(e.position), A = mu(e);
      if (c && (y === 33 && e.tag !== null || y === 38 && e.anchor !== null) || !i0(e) && !o0(e))
        break;
      l === null && (l = A), ae(e, !0, -1) ? (c = !0, s = w, e.lineIndent > t ? a = 1 : e.lineIndent === t ? a = 0 : e.lineIndent < t && (a = -1)) : s = !1;
    }
  if (s && (s = c || i), a === 1 || Hr === n)
    if (jr === n || au === n ? h = t : h = t + 1, g = e.position - e.lineStart, a === 1)
      if (s && (Ea(e, g) || gu(e, g, h)) || n0(e, h))
        m = !0;
      else {
        const y = e.input.charCodeAt(e.position);
        l !== null && w && !s && y !== 124 && y !== 62 && a0(
          e,
          l,
          l.position - l.lineStart,
          h
        ) || o && r0(e, h) || e0(e, h) || t0(e, h) ? m = !0 : s0(e) ? (m = !0, (e.tag !== null || e.anchor !== null) && L(e, "alias node should not have any properties")) : Zg(e, h, jr === n) && (m = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && Ft(e, e.anchor, e.result);
      }
    else a === 0 && (m = s && Ea(e, g));
  if (e.tag === null)
    e.anchor !== null && Ft(e, e.anchor, e.result);
  else if (e.tag === "?") {
    e.result !== null && e.kind !== "scalar" && L(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"');
    for (let y = 0, A = e.implicitTypes.length; y < A; y += 1)
      if (f = e.implicitTypes[y], f.resolve(e.result)) {
        e.result = f.construct(e.result), e.tag = f.tag, e.anchor !== null && Ft(e, e.anchor, e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (Ge.call(e.typeMap[e.kind || "fallback"], e.tag))
      f = e.typeMap[e.kind || "fallback"][e.tag];
    else {
      f = null;
      const y = e.typeMap.multi[e.kind || "fallback"];
      for (let A = 0, T = y.length; A < T; A += 1)
        if (e.tag.slice(0, y[A].tag.length) === y[A].tag) {
          f = y[A];
          break;
        }
    }
    f || L(e, "unknown tag !<" + e.tag + ">"), e.result !== null && f.kind !== e.kind && L(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + f.kind + '", not "' + e.kind + '"'), f.resolve(e.result, e.tag) ? (e.result = f.construct(e.result, e.tag), e.anchor !== null && Ft(e, e.anchor, e.result)) : L(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.depth -= 1, e.tag !== null || e.anchor !== null || m;
}
function l0(e) {
  const t = e.position;
  let n = !1, r;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (r = e.input.charCodeAt(e.position)) !== 0 && (ae(e, !0, -1), r = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || r !== 37)); ) {
    n = !0, r = e.input.charCodeAt(++e.position);
    let i = e.position;
    for (; r !== 0 && !De(r); )
      r = e.input.charCodeAt(++e.position);
    const o = e.input.slice(i, e.position), s = [];
    for (o.length < 1 && L(e, "directive name must not be less than one character in length"); r !== 0; ) {
      for (; it(r); )
        r = e.input.charCodeAt(++e.position);
      if (r === 35) {
        do
          r = e.input.charCodeAt(++e.position);
        while (r !== 0 && !Qe(r));
        break;
      }
      if (Qe(r)) break;
      for (i = e.position; r !== 0 && !De(r); )
        r = e.input.charCodeAt(++e.position);
      s.push(e.input.slice(i, e.position));
    }
    r !== 0 && Vo(e), Ge.call(pa, o) ? pa[o](e, o, s) : Gr(e, 'unknown document directive "' + o + '"');
  }
  if (ae(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, ae(e, !0, -1)) : n && L(e, "directives end mark is expected"), cn(e, e.lineIndent - 1, Hr, !1, !0), ae(e, !0, -1), e.checkLineBreaks && Gg.test(e.input.slice(t, e.position)) && Gr(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && ni(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, ae(e, !0, -1));
    return;
  }
  e.position < e.length - 1 && L(e, "end of the stream or a document separator is expected");
}
function Eu(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  const n = new Xg(e, t), r = e.indexOf("\0");
  for (r !== -1 && (n.position = r, L(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32; )
    n.lineIndent += 1, n.position += 1;
  for (; n.position < n.length - 1; )
    l0(n);
  return n.documents;
}
function c0(e, t, n) {
  t !== null && typeof t == "object" && typeof n > "u" && (n = t, t = null);
  const r = Eu(e, n);
  if (typeof t != "function")
    return r;
  for (let i = 0, o = r.length; i < o; i += 1)
    t(r[i]);
}
function u0(e, t) {
  const n = Eu(e, t);
  if (n.length !== 0) {
    if (n.length === 1)
      return n[0];
    throw new su("expected a single document in the stream, but found more");
  }
}
Ho.loadAll = c0;
Ho.load = u0;
var yu = {};
const ri = qe, Zn = Qn, f0 = qo, wu = Object.prototype.toString, _u = Object.prototype.hasOwnProperty, Yo = 65279, d0 = 9, Un = 10, h0 = 13, p0 = 32, m0 = 33, g0 = 34, wo = 35, E0 = 37, y0 = 38, w0 = 39, _0 = 42, vu = 44, v0 = 45, qr = 58, A0 = 61, T0 = 62, S0 = 63, b0 = 64, Au = 91, Tu = 93, C0 = 96, Su = 123, $0 = 124, bu = 125, Te = {};
Te[0] = "\\0";
Te[7] = "\\a";
Te[8] = "\\b";
Te[9] = "\\t";
Te[10] = "\\n";
Te[11] = "\\v";
Te[12] = "\\f";
Te[13] = "\\r";
Te[27] = "\\e";
Te[34] = '\\"';
Te[92] = "\\\\";
Te[133] = "\\N";
Te[160] = "\\_";
Te[8232] = "\\L";
Te[8233] = "\\P";
const R0 = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
], O0 = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function I0(e, t) {
  if (t === null) return {};
  const n = {}, r = Object.keys(t);
  for (let i = 0, o = r.length; i < o; i += 1) {
    let s = r[i], a = String(t[s]);
    s.slice(0, 2) === "!!" && (s = "tag:yaml.org,2002:" + s.slice(2));
    const c = e.compiledTypeMap.fallback[s];
    c && _u.call(c.styleAliases, a) && (a = c.styleAliases[a]), n[s] = a;
  }
  return n;
}
function P0(e) {
  let t, n;
  const r = e.toString(16).toUpperCase();
  if (e <= 255)
    t = "x", n = 2;
  else if (e <= 65535)
    t = "u", n = 4;
  else if (e <= 4294967295)
    t = "U", n = 8;
  else
    throw new Zn("code point within a string may not be greater than 0xFFFFFFFF");
  return "\\" + t + ri.repeat("0", n - r.length) + r;
}
const N0 = 1, kn = 2;
function D0(e) {
  this.schema = e.schema || f0, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = ri.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = I0(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? kn : N0, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
function ya(e, t) {
  const n = ri.repeat(" ", t);
  let r = 0, i = "";
  const o = e.length;
  for (; r < o; ) {
    let s;
    const a = e.indexOf(`
`, r);
    a === -1 ? (s = e.slice(r), r = o) : (s = e.slice(r, a + 1), r = a + 1), s.length && s !== `
` && (i += n), i += s;
  }
  return i;
}
function _o(e, t) {
  return `
` + ri.repeat(" ", e.indent * t);
}
function F0(e, t) {
  for (let n = 0, r = e.implicitTypes.length; n < r; n += 1)
    if (e.implicitTypes[n].resolve(t))
      return !0;
  return !1;
}
function Vr(e) {
  return e === p0 || e === d0;
}
function Mn(e) {
  return e >= 32 && e <= 126 || e >= 161 && e <= 55295 && e !== 8232 && e !== 8233 || e >= 57344 && e <= 65533 && e !== Yo || e >= 65536 && e <= 1114111;
}
function wa(e) {
  return Mn(e) && e !== Yo && // - b-char
  e !== h0 && e !== Un;
}
function _a(e, t, n) {
  const r = wa(e), i = r && !Vr(e);
  return (
    // ns-plain-safe
    (n ? r : r && // - c-flow-indicator
    e !== vu && e !== Au && e !== Tu && e !== Su && e !== bu) && // ns-plain-char
    e !== wo && // false on '#'
    !(t === qr && !i) || // false on ': '
    wa(t) && !Vr(t) && e === wo || // change to true on '[^ ]#'
    t === qr && i
  );
}
function x0(e) {
  return Mn(e) && e !== Yo && !Vr(e) && // - s-white
  // - (c-indicator ::=
  // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
  e !== v0 && e !== S0 && e !== qr && e !== vu && e !== Au && e !== Tu && e !== Su && e !== bu && // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
  e !== wo && e !== y0 && e !== _0 && e !== m0 && e !== $0 && e !== A0 && e !== T0 && e !== w0 && e !== g0 && // | “%” | “@” | “`”)
  e !== E0 && e !== b0 && e !== C0;
}
function L0(e) {
  return !Vr(e) && e !== qr;
}
function Cn(e, t) {
  const n = e.charCodeAt(t);
  let r;
  return n >= 55296 && n <= 56319 && t + 1 < e.length && (r = e.charCodeAt(t + 1), r >= 56320 && r <= 57343) ? (n - 55296) * 1024 + r - 56320 + 65536 : n;
}
function Cu(e) {
  return /^\n* /.test(e);
}
const $u = 1, vo = 2, Ru = 3, Ou = 4, Kt = 5;
function U0(e, t, n, r, i, o, s, a) {
  let c, m = 0, l = null, f = !1, h = !1;
  const g = r !== -1;
  let w = -1, y = x0(Cn(e, 0)) && L0(Cn(e, e.length - 1));
  if (t || s)
    for (c = 0; c < e.length; m >= 65536 ? c += 2 : c++) {
      if (m = Cn(e, c), !Mn(m))
        return Kt;
      y = y && _a(m, l, a), l = m;
    }
  else {
    for (c = 0; c < e.length; m >= 65536 ? c += 2 : c++) {
      if (m = Cn(e, c), m === Un)
        f = !0, g && (h = h || // Foldable line = too long, and not more-indented.
        c - w - 1 > r && e[w + 1] !== " ", w = c);
      else if (!Mn(m))
        return Kt;
      y = y && _a(m, l, a), l = m;
    }
    h = h || g && c - w - 1 > r && e[w + 1] !== " ";
  }
  return !f && !h ? y && !s && !i(e) ? $u : o === kn ? Kt : vo : n > 9 && Cu(e) ? Kt : s ? o === kn ? Kt : vo : h ? Ou : Ru;
}
function k0(e, t, n, r, i) {
  e.dump = function() {
    if (t.length === 0)
      return e.quotingType === kn ? '""' : "''";
    if (!e.noCompatMode && (R0.indexOf(t) !== -1 || O0.test(t)))
      return e.quotingType === kn ? '"' + t + '"' : "'" + t + "'";
    const o = e.indent * Math.max(1, n), s = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - o), a = r || // No block styles in flow mode.
    e.flowLevel > -1 && n >= e.flowLevel;
    function c(m) {
      return F0(e, m);
    }
    switch (U0(
      t,
      a,
      e.indent,
      s,
      c,
      e.quotingType,
      e.forceQuotes && !r,
      i
    )) {
      case $u:
        return t;
      case vo:
        return "'" + t.replace(/'/g, "''") + "'";
      case Ru:
        return "|" + va(t, e.indent) + Aa(ya(t, o));
      case Ou:
        return ">" + va(t, e.indent) + Aa(ya(M0(t, s), o));
      case Kt:
        return '"' + B0(t) + '"';
      default:
        throw new Zn("impossible error: invalid scalar style");
    }
  }();
}
function va(e, t) {
  const n = Cu(e) ? String(t) : "", r = e[e.length - 1] === `
`, o = r && (e[e.length - 2] === `
` || e === `
`) ? "+" : r ? "" : "-";
  return n + o + `
`;
}
function Aa(e) {
  return e[e.length - 1] === `
` ? e.slice(0, -1) : e;
}
function M0(e, t) {
  const n = /(\n+)([^\n]*)/g;
  let r = function() {
    let a = e.indexOf(`
`);
    return a = a !== -1 ? a : e.length, n.lastIndex = a, Ta(e.slice(0, a), t);
  }(), i = e[0] === `
` || e[0] === " ", o, s;
  for (; s = n.exec(e); ) {
    const a = s[1], c = s[2];
    o = c[0] === " ", r += a + (!i && !o && c !== "" ? `
` : "") + Ta(c, t), i = o;
  }
  return r;
}
function Ta(e, t) {
  if (e === "" || e[0] === " ") return e;
  const n = / [^ ]/g;
  let r, i = 0, o, s = 0, a = 0, c = "";
  for (; r = n.exec(e); )
    a = r.index, a - i > t && (o = s > i ? s : a, c += `
` + e.slice(i, o), i = o + 1), s = a;
  return c += `
`, e.length - i > t && s > i ? c += e.slice(i, s) + `
` + e.slice(s + 1) : c += e.slice(i), c.slice(1);
}
function B0(e) {
  let t = "", n = 0;
  for (let r = 0; r < e.length; n >= 65536 ? r += 2 : r++) {
    n = Cn(e, r);
    const i = Te[n];
    !i && Mn(n) ? (t += e[r], n >= 65536 && (t += e[r + 1])) : t += i || P0(n);
  }
  return t;
}
function j0(e, t, n) {
  let r = "";
  const i = e.tag;
  for (let o = 0, s = n.length; o < s; o += 1) {
    let a = n[o];
    e.replacer && (a = e.replacer.call(n, String(o), a)), (ot(e, t, a, !1, !1) || typeof a > "u" && ot(e, t, null, !1, !1)) && (r !== "" && (r += "," + (e.condenseFlow ? "" : " ")), r += e.dump);
  }
  e.tag = i, e.dump = "[" + r + "]";
}
function Sa(e, t, n, r) {
  let i = "";
  const o = e.tag;
  for (let s = 0, a = n.length; s < a; s += 1) {
    let c = n[s];
    e.replacer && (c = e.replacer.call(n, String(s), c)), (ot(e, t + 1, c, !0, !0, !1, !0) || typeof c > "u" && ot(e, t + 1, null, !0, !0, !1, !0)) && ((!r || i !== "") && (i += _o(e, t)), e.dump && Un === e.dump.charCodeAt(0) ? i += "-" : i += "- ", i += e.dump);
  }
  e.tag = o, e.dump = i || "[]";
}
function H0(e, t, n) {
  let r = "";
  const i = e.tag, o = Object.keys(n);
  for (let s = 0, a = o.length; s < a; s += 1) {
    let c = "";
    r !== "" && (c += ", "), e.condenseFlow && (c += '"');
    const m = o[s];
    let l = n[m];
    e.replacer && (l = e.replacer.call(n, m, l)), ot(e, t, m, !1, !1) && (e.dump.length > 1024 && (c += "? "), c += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), ot(e, t, l, !1, !1) && (c += e.dump, r += c));
  }
  e.tag = i, e.dump = "{" + r + "}";
}
function G0(e, t, n, r) {
  let i = "";
  const o = e.tag, s = Object.keys(n);
  if (e.sortKeys === !0)
    s.sort();
  else if (typeof e.sortKeys == "function")
    s.sort(e.sortKeys);
  else if (e.sortKeys)
    throw new Zn("sortKeys must be a boolean or a function");
  for (let a = 0, c = s.length; a < c; a += 1) {
    let m = "";
    (!r || i !== "") && (m += _o(e, t));
    const l = s[a];
    let f = n[l];
    if (e.replacer && (f = e.replacer.call(n, l, f)), !ot(e, t + 1, l, !0, !0, !0))
      continue;
    const h = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024;
    h && (e.dump && Un === e.dump.charCodeAt(0) ? m += "?" : m += "? "), m += e.dump, h && (m += _o(e, t)), ot(e, t + 1, f, !0, h) && (e.dump && Un === e.dump.charCodeAt(0) ? m += ":" : m += ": ", m += e.dump, i += m);
  }
  e.tag = o, e.dump = i || "{}";
}
function ba(e, t, n) {
  const r = n ? e.explicitTypes : e.implicitTypes;
  for (let i = 0, o = r.length; i < o; i += 1) {
    const s = r[i];
    if ((s.instanceOf || s.predicate) && (!s.instanceOf || typeof t == "object" && t instanceof s.instanceOf) && (!s.predicate || s.predicate(t))) {
      if (n ? s.multi && s.representName ? e.tag = s.representName(t) : e.tag = s.tag : e.tag = "?", s.represent) {
        const a = e.styleMap[s.tag] || s.defaultStyle;
        let c;
        if (wu.call(s.represent) === "[object Function]")
          c = s.represent(t, a);
        else if (_u.call(s.represent, a))
          c = s.represent[a](t, a);
        else
          throw new Zn("!<" + s.tag + '> tag resolver accepts not "' + a + '" style');
        e.dump = c;
      }
      return !0;
    }
  }
  return !1;
}
function ot(e, t, n, r, i, o, s) {
  e.tag = null, e.dump = n, ba(e, n, !1) || ba(e, n, !0);
  const a = wu.call(e.dump), c = r;
  r && (r = e.flowLevel < 0 || e.flowLevel > t);
  const m = a === "[object Object]" || a === "[object Array]";
  let l, f;
  if (m && (l = e.duplicates.indexOf(n), f = l !== -1), (e.tag !== null && e.tag !== "?" || f || e.indent !== 2 && t > 0) && (i = !1), f && e.usedDuplicates[l])
    e.dump = "*ref_" + l;
  else {
    if (m && f && !e.usedDuplicates[l] && (e.usedDuplicates[l] = !0), a === "[object Object]")
      r && Object.keys(e.dump).length !== 0 ? (G0(e, t, e.dump, i), f && (e.dump = "&ref_" + l + e.dump)) : (H0(e, t, e.dump), f && (e.dump = "&ref_" + l + " " + e.dump));
    else if (a === "[object Array]")
      r && e.dump.length !== 0 ? (e.noArrayIndent && !s && t > 0 ? Sa(e, t - 1, e.dump, i) : Sa(e, t, e.dump, i), f && (e.dump = "&ref_" + l + e.dump)) : (j0(e, t, e.dump), f && (e.dump = "&ref_" + l + " " + e.dump));
    else if (a === "[object String]")
      e.tag !== "?" && k0(e, e.dump, t, o, c);
    else {
      if (a === "[object Undefined]")
        return !1;
      if (e.skipInvalid) return !1;
      throw new Zn("unacceptable kind of an object to dump " + a);
    }
    if (e.tag !== null && e.tag !== "?") {
      let h = encodeURI(
        e.tag[0] === "!" ? e.tag.slice(1) : e.tag
      ).replace(/!/g, "%21");
      e.tag[0] === "!" ? h = "!" + h : h.slice(0, 18) === "tag:yaml.org,2002:" ? h = "!!" + h.slice(18) : h = "!<" + h + ">", e.dump = h + " " + e.dump;
    }
  }
  return !0;
}
function q0(e, t) {
  const n = [], r = [];
  Ao(e, n, r);
  const i = r.length;
  for (let o = 0; o < i; o += 1)
    t.duplicates.push(n[r[o]]);
  t.usedDuplicates = new Array(i);
}
function Ao(e, t, n) {
  if (e !== null && typeof e == "object") {
    const r = t.indexOf(e);
    if (r !== -1)
      n.indexOf(r) === -1 && n.push(r);
    else if (t.push(e), Array.isArray(e))
      for (let i = 0, o = e.length; i < o; i += 1)
        Ao(e[i], t, n);
    else {
      const i = Object.keys(e);
      for (let o = 0, s = i.length; o < s; o += 1)
        Ao(e[i[o]], t, n);
    }
  }
}
function V0(e, t) {
  t = t || {};
  const n = new D0(t);
  n.noRefs || q0(e, n);
  let r = e;
  return n.replacer && (r = n.replacer.call({ "": r }, "", r)), ot(n, 0, r, !0, !0) ? n.dump + `
` : "";
}
yu.dump = V0;
const Iu = Ho, W0 = yu;
function zo(e, t) {
  return function() {
    throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
  };
}
we.Type = Ie;
we.Schema = Bc;
we.FAILSAFE_SCHEMA = qc;
we.JSON_SCHEMA = Kc;
we.CORE_SCHEMA = Jc;
we.DEFAULT_SCHEMA = qo;
we.load = Iu.load;
we.loadAll = Iu.loadAll;
we.dump = W0.dump;
we.YAMLException = Qn;
we.types = {
  binary: nu,
  float: Xc,
  map: Gc,
  null: Vc,
  pairs: iu,
  set: ou,
  timestamp: eu,
  bool: Wc,
  int: Yc,
  merge: tu,
  omap: ru,
  seq: Hc,
  str: jc
};
we.safeLoad = zo("safeLoad", "load");
we.safeLoadAll = zo("safeLoadAll", "loadAll");
we.safeDump = zo("safeDump", "dump");
var ii = {};
Object.defineProperty(ii, "__esModule", { value: !0 });
ii.Lazy = void 0;
class Y0 {
  constructor(t) {
    this._value = null, this.creator = t;
  }
  get hasValue() {
    return this.creator == null;
  }
  get value() {
    if (this.creator == null)
      return this._value;
    const t = this.creator();
    return this.value = t, t;
  }
  set value(t) {
    this._value = t, this.creator = null;
  }
}
ii.Lazy = Y0;
var To = { exports: {} };
const z0 = "2.0.0", Pu = 256, X0 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, K0 = 16, J0 = Pu - 6, Q0 = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var oi = {
  MAX_LENGTH: Pu,
  MAX_SAFE_COMPONENT_LENGTH: K0,
  MAX_SAFE_BUILD_LENGTH: J0,
  MAX_SAFE_INTEGER: X0,
  RELEASE_TYPES: Q0,
  SEMVER_SPEC_VERSION: z0,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Z0 = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var si = Z0;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: r,
    MAX_LENGTH: i
  } = oi, o = si;
  t = e.exports = {};
  const s = t.re = [], a = t.safeRe = [], c = t.src = [], m = t.safeSrc = [], l = t.t = {};
  let f = 0;
  const h = "[a-zA-Z0-9-]", g = [
    ["\\s", 1],
    ["\\d", i],
    [h, r]
  ], w = (A) => {
    for (const [T, R] of g)
      A = A.split(`${T}*`).join(`${T}{0,${R}}`).split(`${T}+`).join(`${T}{1,${R}}`);
    return A;
  }, y = (A, T, R) => {
    const N = w(T), x = f++;
    o(A, x, T), l[A] = x, c[x] = T, m[x] = N, s[x] = new RegExp(T, R ? "g" : void 0), a[x] = new RegExp(N, R ? "g" : void 0);
  };
  y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${h}*`), y("MAINVERSION", `(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASE", `(?:-(${c[l.PRERELEASEIDENTIFIER]}(?:\\.${c[l.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${c[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[l.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${h}+`), y("BUILD", `(?:\\+(${c[l.BUILDIDENTIFIER]}(?:\\.${c[l.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${c[l.MAINVERSION]}${c[l.PRERELEASE]}?${c[l.BUILD]}?`), y("FULL", `^${c[l.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${c[l.MAINVERSIONLOOSE]}${c[l.PRERELEASELOOSE]}?${c[l.BUILD]}?`), y("LOOSE", `^${c[l.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${c[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${c[l.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:${c[l.PRERELEASE]})?${c[l.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:${c[l.PRERELEASELOOSE]})?${c[l.BUILD]}?)?)?`), y("XRANGE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${n}})(?:\\.(\\d{1,${n}}))?(?:\\.(\\d{1,${n}}))?`), y("COERCE", `${c[l.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", c[l.COERCEPLAIN] + `(?:${c[l.PRERELEASE]})?(?:${c[l.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", c[l.COERCE], !0), y("COERCERTLFULL", c[l.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${c[l.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${c[l.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${c[l.LONECARET]}${c[l.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${c[l.LONECARET]}${c[l.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${c[l.GTLT]}\\s*(${c[l.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]}|${c[l.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${c[l.XRANGEPLAIN]})\\s+-\\s+(${c[l.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${c[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[l.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(To, To.exports);
var er = To.exports;
const eE = Object.freeze({ loose: !0 }), tE = Object.freeze({}), nE = (e) => e ? typeof e != "object" ? eE : e : tE;
var Xo = nE;
const Ca = /^[0-9]+$/, Nu = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const n = Ca.test(e), r = Ca.test(t);
  return n && r && (e = +e, t = +t), e === t ? 0 : n && !r ? -1 : r && !n ? 1 : e < t ? -1 : 1;
}, rE = (e, t) => Nu(t, e);
var Du = {
  compareIdentifiers: Nu,
  rcompareIdentifiers: rE
};
const vr = si, { MAX_LENGTH: $a, MAX_SAFE_INTEGER: Ar } = oi, { safeRe: Tr, t: Sr } = er, iE = Xo, { compareIdentifiers: Mi } = Du;
let oE = class Ke {
  constructor(t, n) {
    if (n = iE(n), t instanceof Ke) {
      if (t.loose === !!n.loose && t.includePrerelease === !!n.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > $a)
      throw new TypeError(
        `version is longer than ${$a} characters`
      );
    vr("SemVer", t, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
    const r = t.trim().match(n.loose ? Tr[Sr.LOOSE] : Tr[Sr.FULL]);
    if (!r)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +r[1], this.minor = +r[2], this.patch = +r[3], this.major > Ar || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Ar || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Ar || this.patch < 0)
      throw new TypeError("Invalid patch version");
    r[4] ? this.prerelease = r[4].split(".").map((i) => {
      if (/^[0-9]+$/.test(i)) {
        const o = +i;
        if (o >= 0 && o < Ar)
          return o;
      }
      return i;
    }) : this.prerelease = [], this.build = r[5] ? r[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (vr("SemVer.compare", this.version, this.options, t), !(t instanceof Ke)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new Ke(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof Ke || (t = new Ke(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof Ke || (t = new Ke(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let n = 0;
    do {
      const r = this.prerelease[n], i = t.prerelease[n];
      if (vr("prerelease compare", n, r, i), r === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (r === void 0)
        return -1;
      if (r === i)
        continue;
      return Mi(r, i);
    } while (++n);
  }
  compareBuild(t) {
    t instanceof Ke || (t = new Ke(t, this.options));
    let n = 0;
    do {
      const r = this.build[n], i = t.build[n];
      if (vr("build compare", n, r, i), r === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (r === void 0)
        return -1;
      if (r === i)
        continue;
      return Mi(r, i);
    } while (++n);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, n, r) {
    if (t.startsWith("pre")) {
      if (!n && r === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (n) {
        const i = `-${n}`.match(this.options.loose ? Tr[Sr.PRERELEASELOOSE] : Tr[Sr.PRERELEASE]);
        if (!i || i[1] !== n)
          throw new Error(`invalid identifier: ${n}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, r);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, r);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", n, r), this.inc("pre", n, r);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", n, r), this.inc("pre", n, r);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const i = Number(r) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [i];
        else {
          let o = this.prerelease.length;
          for (; --o >= 0; )
            typeof this.prerelease[o] == "number" && (this.prerelease[o]++, o = -2);
          if (o === -1) {
            if (n === this.prerelease.join(".") && r === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(i);
          }
        }
        if (n) {
          let o = [n, i];
          r === !1 && (o = [n]), Mi(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = o) : this.prerelease = o;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Pe = oE;
const Ra = Pe, sE = (e, t, n = !1) => {
  if (e instanceof Ra)
    return e;
  try {
    return new Ra(e, t);
  } catch (r) {
    if (!n)
      return null;
    throw r;
  }
};
var hn = sE;
const aE = hn, lE = (e, t) => {
  const n = aE(e, t);
  return n ? n.version : null;
};
var cE = lE;
const uE = hn, fE = (e, t) => {
  const n = uE(e.trim().replace(/^[=v]+/, ""), t);
  return n ? n.version : null;
};
var dE = fE;
const Oa = Pe, hE = (e, t, n, r, i) => {
  typeof n == "string" && (i = r, r = n, n = void 0);
  try {
    return new Oa(
      e instanceof Oa ? e.version : e,
      n
    ).inc(t, r, i).version;
  } catch {
    return null;
  }
};
var pE = hE;
const Ia = hn, mE = (e, t) => {
  const n = Ia(e, null, !0), r = Ia(t, null, !0), i = n.compare(r);
  if (i === 0)
    return null;
  const o = i > 0, s = o ? n : r, a = o ? r : n, c = !!s.prerelease.length;
  if (!!a.prerelease.length && !c) {
    if (!a.patch && !a.minor)
      return "major";
    if (a.compareMain(s) === 0)
      return a.minor && !a.patch ? "minor" : "patch";
  }
  const l = c ? "pre" : "";
  return n.major !== r.major ? l + "major" : n.minor !== r.minor ? l + "minor" : n.patch !== r.patch ? l + "patch" : "prerelease";
};
var gE = mE;
const EE = Pe, yE = (e, t) => new EE(e, t).major;
var wE = yE;
const _E = Pe, vE = (e, t) => new _E(e, t).minor;
var AE = vE;
const TE = Pe, SE = (e, t) => new TE(e, t).patch;
var bE = SE;
const CE = hn, $E = (e, t) => {
  const n = CE(e, t);
  return n && n.prerelease.length ? n.prerelease : null;
};
var RE = $E;
const Pa = Pe, OE = (e, t, n) => new Pa(e, n).compare(new Pa(t, n));
var Ve = OE;
const IE = Ve, PE = (e, t, n) => IE(t, e, n);
var NE = PE;
const DE = Ve, FE = (e, t) => DE(e, t, !0);
var xE = FE;
const Na = Pe, LE = (e, t, n) => {
  const r = new Na(e, n), i = new Na(t, n);
  return r.compare(i) || r.compareBuild(i);
};
var Ko = LE;
const UE = Ko, kE = (e, t) => e.sort((n, r) => UE(n, r, t));
var ME = kE;
const BE = Ko, jE = (e, t) => e.sort((n, r) => BE(r, n, t));
var HE = jE;
const GE = Ve, qE = (e, t, n) => GE(e, t, n) > 0;
var ai = qE;
const VE = Ve, WE = (e, t, n) => VE(e, t, n) < 0;
var Jo = WE;
const YE = Ve, zE = (e, t, n) => YE(e, t, n) === 0;
var Fu = zE;
const XE = Ve, KE = (e, t, n) => XE(e, t, n) !== 0;
var xu = KE;
const JE = Ve, QE = (e, t, n) => JE(e, t, n) >= 0;
var Qo = QE;
const ZE = Ve, ey = (e, t, n) => ZE(e, t, n) <= 0;
var Zo = ey;
const ty = Fu, ny = xu, ry = ai, iy = Qo, oy = Jo, sy = Zo, ay = (e, t, n, r) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e === n;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e !== n;
    case "":
    case "=":
    case "==":
      return ty(e, n, r);
    case "!=":
      return ny(e, n, r);
    case ">":
      return ry(e, n, r);
    case ">=":
      return iy(e, n, r);
    case "<":
      return oy(e, n, r);
    case "<=":
      return sy(e, n, r);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Lu = ay;
const ly = Pe, cy = hn, { safeRe: br, t: Cr } = er, uy = (e, t) => {
  if (e instanceof ly)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let n = null;
  if (!t.rtl)
    n = e.match(t.includePrerelease ? br[Cr.COERCEFULL] : br[Cr.COERCE]);
  else {
    const c = t.includePrerelease ? br[Cr.COERCERTLFULL] : br[Cr.COERCERTL];
    let m;
    for (; (m = c.exec(e)) && (!n || n.index + n[0].length !== e.length); )
      (!n || m.index + m[0].length !== n.index + n[0].length) && (n = m), c.lastIndex = m.index + m[1].length + m[2].length;
    c.lastIndex = -1;
  }
  if (n === null)
    return null;
  const r = n[2], i = n[3] || "0", o = n[4] || "0", s = t.includePrerelease && n[5] ? `-${n[5]}` : "", a = t.includePrerelease && n[6] ? `+${n[6]}` : "";
  return cy(`${r}.${i}.${o}${s}${a}`, t);
};
var fy = uy;
class dy {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const n = this.map.get(t);
    if (n !== void 0)
      return this.map.delete(t), this.map.set(t, n), n;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, n) {
    if (!this.delete(t) && n !== void 0) {
      if (this.map.size >= this.max) {
        const i = this.map.keys().next().value;
        this.delete(i);
      }
      this.map.set(t, n);
    }
    return this;
  }
}
var hy = dy, Bi, Da;
function We() {
  if (Da) return Bi;
  Da = 1;
  const e = /\s+/g;
  class t {
    constructor(C, P) {
      if (P = i(P), C instanceof t)
        return C.loose === !!P.loose && C.includePrerelease === !!P.includePrerelease ? C : new t(C.raw, P);
      if (C instanceof o)
        return this.raw = C.value, this.set = [[C]], this.formatted = void 0, this;
      if (this.options = P, this.loose = !!P.loose, this.includePrerelease = !!P.includePrerelease, this.raw = C.trim().replace(e, " "), this.set = this.raw.split("||").map((b) => this.parseRange(b.trim())).filter((b) => b.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const b = this.set[0];
        if (this.set = this.set.filter((D) => !y(D[0])), this.set.length === 0)
          this.set = [b];
        else if (this.set.length > 1) {
          for (const D of this.set)
            if (D.length === 1 && A(D[0])) {
              this.set = [D];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let C = 0; C < this.set.length; C++) {
          C > 0 && (this.formatted += "||");
          const P = this.set[C];
          for (let b = 0; b < P.length; b++)
            b > 0 && (this.formatted += " "), this.formatted += P[b].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(C) {
      const b = ((this.options.includePrerelease && g) | (this.options.loose && w)) + ":" + C, D = r.get(b);
      if (D)
        return D;
      const I = this.options.loose, k = I ? c[m.HYPHENRANGELOOSE] : c[m.HYPHENRANGE];
      C = C.replace(k, M(this.options.includePrerelease)), s("hyphen replace", C), C = C.replace(c[m.COMPARATORTRIM], l), s("comparator trim", C), C = C.replace(c[m.TILDETRIM], f), s("tilde trim", C), C = C.replace(c[m.CARETTRIM], h), s("caret trim", C);
      let q = C.split(" ").map((U) => R(U, this.options)).join(" ").split(/\s+/).map((U) => B(U, this.options));
      I && (q = q.filter((U) => (s("loose invalid filter", U, this.options), !!U.match(c[m.COMPARATORLOOSE])))), s("range list", q);
      const j = /* @__PURE__ */ new Map(), K = q.map((U) => new o(U, this.options));
      for (const U of K) {
        if (y(U))
          return [U];
        j.set(U.value, U);
      }
      j.size > 1 && j.has("") && j.delete("");
      const de = [...j.values()];
      return r.set(b, de), de;
    }
    intersects(C, P) {
      if (!(C instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((b) => T(b, P) && C.set.some((D) => T(D, P) && b.every((I) => D.every((k) => I.intersects(k, P)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(C) {
      if (!C)
        return !1;
      if (typeof C == "string")
        try {
          C = new a(C, this.options);
        } catch {
          return !1;
        }
      for (let P = 0; P < this.set.length; P++)
        if (X(this.set[P], C, this.options))
          return !0;
      return !1;
    }
  }
  Bi = t;
  const n = hy, r = new n(), i = Xo, o = li(), s = si, a = Pe, {
    safeRe: c,
    t: m,
    comparatorTrimReplace: l,
    tildeTrimReplace: f,
    caretTrimReplace: h
  } = er, { FLAG_INCLUDE_PRERELEASE: g, FLAG_LOOSE: w } = oi, y = (O) => O.value === "<0.0.0-0", A = (O) => O.value === "", T = (O, C) => {
    let P = !0;
    const b = O.slice();
    let D = b.pop();
    for (; P && b.length; )
      P = b.every((I) => D.intersects(I, C)), D = b.pop();
    return P;
  }, R = (O, C) => (O = O.replace(c[m.BUILD], ""), s("comp", O, C), O = se(O, C), s("caret", O), O = x(O, C), s("tildes", O), O = Fe(O, C), s("xrange", O), O = G(O, C), s("stars", O), O), N = (O) => !O || O.toLowerCase() === "x" || O === "*", x = (O, C) => O.trim().split(/\s+/).map((P) => ee(P, C)).join(" "), ee = (O, C) => {
    const P = C.loose ? c[m.TILDELOOSE] : c[m.TILDE];
    return O.replace(P, (b, D, I, k, q) => {
      s("tilde", O, b, D, I, k, q);
      let j;
      return N(D) ? j = "" : N(I) ? j = `>=${D}.0.0 <${+D + 1}.0.0-0` : N(k) ? j = `>=${D}.${I}.0 <${D}.${+I + 1}.0-0` : q ? (s("replaceTilde pr", q), j = `>=${D}.${I}.${k}-${q} <${D}.${+I + 1}.0-0`) : j = `>=${D}.${I}.${k} <${D}.${+I + 1}.0-0`, s("tilde return", j), j;
    });
  }, se = (O, C) => O.trim().split(/\s+/).map((P) => W(P, C)).join(" "), W = (O, C) => {
    s("caret", O, C);
    const P = C.loose ? c[m.CARETLOOSE] : c[m.CARET], b = C.includePrerelease ? "-0" : "";
    return O.replace(P, (D, I, k, q, j) => {
      s("caret", O, D, I, k, q, j);
      let K;
      return N(I) ? K = "" : N(k) ? K = `>=${I}.0.0${b} <${+I + 1}.0.0-0` : N(q) ? I === "0" ? K = `>=${I}.${k}.0${b} <${I}.${+k + 1}.0-0` : K = `>=${I}.${k}.0${b} <${+I + 1}.0.0-0` : j ? (s("replaceCaret pr", j), I === "0" ? k === "0" ? K = `>=${I}.${k}.${q}-${j} <${I}.${k}.${+q + 1}-0` : K = `>=${I}.${k}.${q}-${j} <${I}.${+k + 1}.0-0` : K = `>=${I}.${k}.${q}-${j} <${+I + 1}.0.0-0`) : (s("no pr"), I === "0" ? k === "0" ? K = `>=${I}.${k}.${q}${b} <${I}.${k}.${+q + 1}-0` : K = `>=${I}.${k}.${q}${b} <${I}.${+k + 1}.0-0` : K = `>=${I}.${k}.${q} <${+I + 1}.0.0-0`), s("caret return", K), K;
    });
  }, Fe = (O, C) => (s("replaceXRanges", O, C), O.split(/\s+/).map((P) => E(P, C)).join(" ")), E = (O, C) => {
    O = O.trim();
    const P = C.loose ? c[m.XRANGELOOSE] : c[m.XRANGE];
    return O.replace(P, (b, D, I, k, q, j) => {
      s("xRange", O, b, D, I, k, q, j);
      const K = N(I), de = K || N(k), U = de || N(q), ze = U;
      return D === "=" && ze && (D = ""), j = C.includePrerelease ? "-0" : "", K ? D === ">" || D === "<" ? b = "<0.0.0-0" : b = "*" : D && ze ? (de && (k = 0), q = 0, D === ">" ? (D = ">=", de ? (I = +I + 1, k = 0, q = 0) : (k = +k + 1, q = 0)) : D === "<=" && (D = "<", de ? I = +I + 1 : k = +k + 1), D === "<" && (j = "-0"), b = `${D + I}.${k}.${q}${j}`) : de ? b = `>=${I}.0.0${j} <${+I + 1}.0.0-0` : U && (b = `>=${I}.${k}.0${j} <${I}.${+k + 1}.0-0`), s("xRange return", b), b;
    });
  }, G = (O, C) => (s("replaceStars", O, C), O.trim().replace(c[m.STAR], "")), B = (O, C) => (s("replaceGTE0", O, C), O.trim().replace(c[C.includePrerelease ? m.GTE0PRE : m.GTE0], "")), M = (O) => (C, P, b, D, I, k, q, j, K, de, U, ze) => (N(b) ? P = "" : N(D) ? P = `>=${b}.0.0${O ? "-0" : ""}` : N(I) ? P = `>=${b}.${D}.0${O ? "-0" : ""}` : k ? P = `>=${P}` : P = `>=${P}${O ? "-0" : ""}`, N(K) ? j = "" : N(de) ? j = `<${+K + 1}.0.0-0` : N(U) ? j = `<${K}.${+de + 1}.0-0` : ze ? j = `<=${K}.${de}.${U}-${ze}` : O ? j = `<${K}.${de}.${+U + 1}-0` : j = `<=${j}`, `${P} ${j}`.trim()), X = (O, C, P) => {
    for (let b = 0; b < O.length; b++)
      if (!O[b].test(C))
        return !1;
    if (C.prerelease.length && !P.includePrerelease) {
      for (let b = 0; b < O.length; b++)
        if (s(O[b].semver), O[b].semver !== o.ANY && O[b].semver.prerelease.length > 0) {
          const D = O[b].semver;
          if (D.major === C.major && D.minor === C.minor && D.patch === C.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Bi;
}
var ji, Fa;
function li() {
  if (Fa) return ji;
  Fa = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(l, f) {
      if (f = n(f), l instanceof t) {
        if (l.loose === !!f.loose)
          return l;
        l = l.value;
      }
      l = l.trim().split(/\s+/).join(" "), s("comparator", l, f), this.options = f, this.loose = !!f.loose, this.parse(l), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, s("comp", this);
    }
    parse(l) {
      const f = this.options.loose ? r[i.COMPARATORLOOSE] : r[i.COMPARATOR], h = l.match(f);
      if (!h)
        throw new TypeError(`Invalid comparator: ${l}`);
      this.operator = h[1] !== void 0 ? h[1] : "", this.operator === "=" && (this.operator = ""), h[2] ? this.semver = new a(h[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(l) {
      if (s("Comparator.test", l, this.options.loose), this.semver === e || l === e)
        return !0;
      if (typeof l == "string")
        try {
          l = new a(l, this.options);
        } catch {
          return !1;
        }
      return o(l, this.operator, this.semver, this.options);
    }
    intersects(l, f) {
      if (!(l instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new c(l.value, f).test(this.value) : l.operator === "" ? l.value === "" ? !0 : new c(this.value, f).test(l.semver) : (f = n(f), f.includePrerelease && (this.value === "<0.0.0-0" || l.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || l.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && l.operator.startsWith(">") || this.operator.startsWith("<") && l.operator.startsWith("<") || this.semver.version === l.semver.version && this.operator.includes("=") && l.operator.includes("=") || o(this.semver, "<", l.semver, f) && this.operator.startsWith(">") && l.operator.startsWith("<") || o(this.semver, ">", l.semver, f) && this.operator.startsWith("<") && l.operator.startsWith(">")));
    }
  }
  ji = t;
  const n = Xo, { safeRe: r, t: i } = er, o = Lu, s = si, a = Pe, c = We();
  return ji;
}
const py = We(), my = (e, t, n) => {
  try {
    t = new py(t, n);
  } catch {
    return !1;
  }
  return t.test(e);
};
var ci = my;
const gy = We(), Ey = (e, t) => new gy(e, t).set.map((n) => n.map((r) => r.value).join(" ").trim().split(" "));
var yy = Ey;
const wy = Pe, _y = We(), vy = (e, t, n) => {
  let r = null, i = null, o = null;
  try {
    o = new _y(t, n);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    o.test(s) && (!r || i.compare(s) === -1) && (r = s, i = new wy(r, n));
  }), r;
};
var Ay = vy;
const Ty = Pe, Sy = We(), by = (e, t, n) => {
  let r = null, i = null, o = null;
  try {
    o = new Sy(t, n);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    o.test(s) && (!r || i.compare(s) === 1) && (r = s, i = new Ty(r, n));
  }), r;
};
var Cy = by;
const Hi = Pe, $y = We(), xa = ai, Ry = (e, t) => {
  e = new $y(e, t);
  let n = new Hi("0.0.0");
  if (e.test(n) || (n = new Hi("0.0.0-0"), e.test(n)))
    return n;
  n = null;
  for (let r = 0; r < e.set.length; ++r) {
    const i = e.set[r];
    let o = null;
    i.forEach((s) => {
      const a = new Hi(s.semver.version);
      switch (s.operator) {
        case ">":
          a.prerelease.length === 0 ? a.patch++ : a.prerelease.push(0), a.raw = a.format();
        case "":
        case ">=":
          (!o || xa(a, o)) && (o = a);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${s.operator}`);
      }
    }), o && (!n || xa(n, o)) && (n = o);
  }
  return n && e.test(n) ? n : null;
};
var Oy = Ry;
const Iy = We(), Py = (e, t) => {
  try {
    return new Iy(e, t).range || "*";
  } catch {
    return null;
  }
};
var Ny = Py;
const Dy = Pe, Uu = li(), { ANY: Fy } = Uu, xy = We(), Ly = ci, La = ai, Ua = Jo, Uy = Zo, ky = Qo, My = (e, t, n, r) => {
  e = new Dy(e, r), t = new xy(t, r);
  let i, o, s, a, c;
  switch (n) {
    case ">":
      i = La, o = Uy, s = Ua, a = ">", c = ">=";
      break;
    case "<":
      i = Ua, o = ky, s = La, a = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (Ly(e, t, r))
    return !1;
  for (let m = 0; m < t.set.length; ++m) {
    const l = t.set[m];
    let f = null, h = null;
    if (l.forEach((g) => {
      g.semver === Fy && (g = new Uu(">=0.0.0")), f = f || g, h = h || g, i(g.semver, f.semver, r) ? f = g : s(g.semver, h.semver, r) && (h = g);
    }), f.operator === a || f.operator === c || (!h.operator || h.operator === a) && o(e, h.semver))
      return !1;
    if (h.operator === c && s(e, h.semver))
      return !1;
  }
  return !0;
};
var es = My;
const By = es, jy = (e, t, n) => By(e, t, ">", n);
var Hy = jy;
const Gy = es, qy = (e, t, n) => Gy(e, t, "<", n);
var Vy = qy;
const ka = We(), Wy = (e, t, n) => (e = new ka(e, n), t = new ka(t, n), e.intersects(t, n));
var Yy = Wy;
const zy = ci, Xy = Ve;
var Ky = (e, t, n) => {
  const r = [];
  let i = null, o = null;
  const s = e.sort((l, f) => Xy(l, f, n));
  for (const l of s)
    zy(l, t, n) ? (o = l, i || (i = l)) : (o && r.push([i, o]), o = null, i = null);
  i && r.push([i, null]);
  const a = [];
  for (const [l, f] of r)
    l === f ? a.push(l) : !f && l === s[0] ? a.push("*") : f ? l === s[0] ? a.push(`<=${f}`) : a.push(`${l} - ${f}`) : a.push(`>=${l}`);
  const c = a.join(" || "), m = typeof t.raw == "string" ? t.raw : String(t);
  return c.length < m.length ? c : t;
};
const Ma = We(), ts = li(), { ANY: Gi } = ts, An = ci, ns = Ve, Jy = (e, t, n = {}) => {
  if (e === t)
    return !0;
  e = new Ma(e, n), t = new Ma(t, n);
  let r = !1;
  e: for (const i of e.set) {
    for (const o of t.set) {
      const s = Zy(i, o, n);
      if (r = r || s !== null, s)
        continue e;
    }
    if (r)
      return !1;
  }
  return !0;
}, Qy = [new ts(">=0.0.0-0")], Ba = [new ts(">=0.0.0")], Zy = (e, t, n) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Gi) {
    if (t.length === 1 && t[0].semver === Gi)
      return !0;
    n.includePrerelease ? e = Qy : e = Ba;
  }
  if (t.length === 1 && t[0].semver === Gi) {
    if (n.includePrerelease)
      return !0;
    t = Ba;
  }
  const r = /* @__PURE__ */ new Set();
  let i, o;
  for (const g of e)
    g.operator === ">" || g.operator === ">=" ? i = ja(i, g, n) : g.operator === "<" || g.operator === "<=" ? o = Ha(o, g, n) : r.add(g.semver);
  if (r.size > 1)
    return null;
  let s;
  if (i && o) {
    if (s = ns(i.semver, o.semver, n), s > 0)
      return null;
    if (s === 0 && (i.operator !== ">=" || o.operator !== "<="))
      return null;
  }
  for (const g of r) {
    if (i && !An(g, String(i), n) || o && !An(g, String(o), n))
      return null;
    for (const w of t)
      if (!An(g, String(w), n))
        return !1;
    return !0;
  }
  let a, c, m, l, f = o && !n.includePrerelease && o.semver.prerelease.length ? o.semver : !1, h = i && !n.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
  f && f.prerelease.length === 1 && o.operator === "<" && f.prerelease[0] === 0 && (f = !1);
  for (const g of t) {
    if (l = l || g.operator === ">" || g.operator === ">=", m = m || g.operator === "<" || g.operator === "<=", i) {
      if (h && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === h.major && g.semver.minor === h.minor && g.semver.patch === h.patch && (h = !1), g.operator === ">" || g.operator === ">=") {
        if (a = ja(i, g, n), a === g && a !== i)
          return !1;
      } else if (i.operator === ">=" && !An(i.semver, String(g), n))
        return !1;
    }
    if (o) {
      if (f && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === f.major && g.semver.minor === f.minor && g.semver.patch === f.patch && (f = !1), g.operator === "<" || g.operator === "<=") {
        if (c = Ha(o, g, n), c === g && c !== o)
          return !1;
      } else if (o.operator === "<=" && !An(o.semver, String(g), n))
        return !1;
    }
    if (!g.operator && (o || i) && s !== 0)
      return !1;
  }
  return !(i && m && !o && s !== 0 || o && l && !i && s !== 0 || h || f);
}, ja = (e, t, n) => {
  if (!e)
    return t;
  const r = ns(e.semver, t.semver, n);
  return r > 0 ? e : r < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Ha = (e, t, n) => {
  if (!e)
    return t;
  const r = ns(e.semver, t.semver, n);
  return r < 0 ? e : r > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var ew = Jy;
const qi = er, Ga = oi, tw = Pe, qa = Du, nw = hn, rw = cE, iw = dE, ow = pE, sw = gE, aw = wE, lw = AE, cw = bE, uw = RE, fw = Ve, dw = NE, hw = xE, pw = Ko, mw = ME, gw = HE, Ew = ai, yw = Jo, ww = Fu, _w = xu, vw = Qo, Aw = Zo, Tw = Lu, Sw = fy, bw = li(), Cw = We(), $w = ci, Rw = yy, Ow = Ay, Iw = Cy, Pw = Oy, Nw = Ny, Dw = es, Fw = Hy, xw = Vy, Lw = Yy, Uw = Ky, kw = ew;
var ku = {
  parse: nw,
  valid: rw,
  clean: iw,
  inc: ow,
  diff: sw,
  major: aw,
  minor: lw,
  patch: cw,
  prerelease: uw,
  compare: fw,
  rcompare: dw,
  compareLoose: hw,
  compareBuild: pw,
  sort: mw,
  rsort: gw,
  gt: Ew,
  lt: yw,
  eq: ww,
  neq: _w,
  gte: vw,
  lte: Aw,
  cmp: Tw,
  coerce: Sw,
  Comparator: bw,
  Range: Cw,
  satisfies: $w,
  toComparators: Rw,
  maxSatisfying: Ow,
  minSatisfying: Iw,
  minVersion: Pw,
  validRange: Nw,
  outside: Dw,
  gtr: Fw,
  ltr: xw,
  intersects: Lw,
  simplifyRange: Uw,
  subset: kw,
  SemVer: tw,
  re: qi.re,
  src: qi.src,
  tokens: qi.t,
  SEMVER_SPEC_VERSION: Ga.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Ga.RELEASE_TYPES,
  compareIdentifiers: qa.compareIdentifiers,
  rcompareIdentifiers: qa.rcompareIdentifiers
}, tr = {}, Wr = { exports: {} };
Wr.exports;
(function(e, t) {
  var n = 200, r = "__lodash_hash_undefined__", i = 1, o = 2, s = 9007199254740991, a = "[object Arguments]", c = "[object Array]", m = "[object AsyncFunction]", l = "[object Boolean]", f = "[object Date]", h = "[object Error]", g = "[object Function]", w = "[object GeneratorFunction]", y = "[object Map]", A = "[object Number]", T = "[object Null]", R = "[object Object]", N = "[object Promise]", x = "[object Proxy]", ee = "[object RegExp]", se = "[object Set]", W = "[object String]", Fe = "[object Symbol]", E = "[object Undefined]", G = "[object WeakMap]", B = "[object ArrayBuffer]", M = "[object DataView]", X = "[object Float32Array]", O = "[object Float64Array]", C = "[object Int8Array]", P = "[object Int16Array]", b = "[object Int32Array]", D = "[object Uint8Array]", I = "[object Uint8ClampedArray]", k = "[object Uint16Array]", q = "[object Uint32Array]", j = /[\\^$.*+?()[\]{}|]/g, K = /^\[object .+?Constructor\]$/, de = /^(?:0|[1-9]\d*)$/, U = {};
  U[X] = U[O] = U[C] = U[P] = U[b] = U[D] = U[I] = U[k] = U[q] = !0, U[a] = U[c] = U[B] = U[l] = U[M] = U[f] = U[h] = U[g] = U[y] = U[A] = U[R] = U[ee] = U[se] = U[W] = U[G] = !1;
  var ze = typeof be == "object" && be && be.Object === Object && be, d = typeof self == "object" && self && self.Object === Object && self, u = ze || d || Function("return this")(), S = t && !t.nodeType && t, v = S && !0 && e && !e.nodeType && e, Y = v && v.exports === S, Q = Y && ze.process, ie = function() {
    try {
      return Q && Q.binding && Q.binding("util");
    } catch {
    }
  }(), me = ie && ie.isTypedArray;
  function _e(p, _) {
    for (var $ = -1, F = p == null ? 0 : p.length, Z = 0, H = []; ++$ < F; ) {
      var oe = p[$];
      _(oe, $, p) && (H[Z++] = oe);
    }
    return H;
  }
  function st(p, _) {
    for (var $ = -1, F = _.length, Z = p.length; ++$ < F; )
      p[Z + $] = _[$];
    return p;
  }
  function ce(p, _) {
    for (var $ = -1, F = p == null ? 0 : p.length; ++$ < F; )
      if (_(p[$], $, p))
        return !0;
    return !1;
  }
  function Me(p, _) {
    for (var $ = -1, F = Array(p); ++$ < p; )
      F[$] = _($);
    return F;
  }
  function wi(p) {
    return function(_) {
      return p(_);
    };
  }
  function or(p, _) {
    return p.has(_);
  }
  function gn(p, _) {
    return p == null ? void 0 : p[_];
  }
  function sr(p) {
    var _ = -1, $ = Array(p.size);
    return p.forEach(function(F, Z) {
      $[++_] = [Z, F];
    }), $;
  }
  function rf(p, _) {
    return function($) {
      return p(_($));
    };
  }
  function of(p) {
    var _ = -1, $ = Array(p.size);
    return p.forEach(function(F) {
      $[++_] = F;
    }), $;
  }
  var sf = Array.prototype, af = Function.prototype, ar = Object.prototype, _i = u["__core-js_shared__"], fs = af.toString, Xe = ar.hasOwnProperty, ds = function() {
    var p = /[^.]+$/.exec(_i && _i.keys && _i.keys.IE_PROTO || "");
    return p ? "Symbol(src)_1." + p : "";
  }(), hs = ar.toString, lf = RegExp(
    "^" + fs.call(Xe).replace(j, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), ps = Y ? u.Buffer : void 0, lr = u.Symbol, ms = u.Uint8Array, gs = ar.propertyIsEnumerable, cf = sf.splice, Ct = lr ? lr.toStringTag : void 0, Es = Object.getOwnPropertySymbols, uf = ps ? ps.isBuffer : void 0, ff = rf(Object.keys, Object), vi = qt(u, "DataView"), En = qt(u, "Map"), Ai = qt(u, "Promise"), Ti = qt(u, "Set"), Si = qt(u, "WeakMap"), yn = qt(Object, "create"), df = Ot(vi), hf = Ot(En), pf = Ot(Ai), mf = Ot(Ti), gf = Ot(Si), ys = lr ? lr.prototype : void 0, bi = ys ? ys.valueOf : void 0;
  function $t(p) {
    var _ = -1, $ = p == null ? 0 : p.length;
    for (this.clear(); ++_ < $; ) {
      var F = p[_];
      this.set(F[0], F[1]);
    }
  }
  function Ef() {
    this.__data__ = yn ? yn(null) : {}, this.size = 0;
  }
  function yf(p) {
    var _ = this.has(p) && delete this.__data__[p];
    return this.size -= _ ? 1 : 0, _;
  }
  function wf(p) {
    var _ = this.__data__;
    if (yn) {
      var $ = _[p];
      return $ === r ? void 0 : $;
    }
    return Xe.call(_, p) ? _[p] : void 0;
  }
  function _f(p) {
    var _ = this.__data__;
    return yn ? _[p] !== void 0 : Xe.call(_, p);
  }
  function vf(p, _) {
    var $ = this.__data__;
    return this.size += this.has(p) ? 0 : 1, $[p] = yn && _ === void 0 ? r : _, this;
  }
  $t.prototype.clear = Ef, $t.prototype.delete = yf, $t.prototype.get = wf, $t.prototype.has = _f, $t.prototype.set = vf;
  function et(p) {
    var _ = -1, $ = p == null ? 0 : p.length;
    for (this.clear(); ++_ < $; ) {
      var F = p[_];
      this.set(F[0], F[1]);
    }
  }
  function Af() {
    this.__data__ = [], this.size = 0;
  }
  function Tf(p) {
    var _ = this.__data__, $ = ur(_, p);
    if ($ < 0)
      return !1;
    var F = _.length - 1;
    return $ == F ? _.pop() : cf.call(_, $, 1), --this.size, !0;
  }
  function Sf(p) {
    var _ = this.__data__, $ = ur(_, p);
    return $ < 0 ? void 0 : _[$][1];
  }
  function bf(p) {
    return ur(this.__data__, p) > -1;
  }
  function Cf(p, _) {
    var $ = this.__data__, F = ur($, p);
    return F < 0 ? (++this.size, $.push([p, _])) : $[F][1] = _, this;
  }
  et.prototype.clear = Af, et.prototype.delete = Tf, et.prototype.get = Sf, et.prototype.has = bf, et.prototype.set = Cf;
  function Rt(p) {
    var _ = -1, $ = p == null ? 0 : p.length;
    for (this.clear(); ++_ < $; ) {
      var F = p[_];
      this.set(F[0], F[1]);
    }
  }
  function $f() {
    this.size = 0, this.__data__ = {
      hash: new $t(),
      map: new (En || et)(),
      string: new $t()
    };
  }
  function Rf(p) {
    var _ = fr(this, p).delete(p);
    return this.size -= _ ? 1 : 0, _;
  }
  function Of(p) {
    return fr(this, p).get(p);
  }
  function If(p) {
    return fr(this, p).has(p);
  }
  function Pf(p, _) {
    var $ = fr(this, p), F = $.size;
    return $.set(p, _), this.size += $.size == F ? 0 : 1, this;
  }
  Rt.prototype.clear = $f, Rt.prototype.delete = Rf, Rt.prototype.get = Of, Rt.prototype.has = If, Rt.prototype.set = Pf;
  function cr(p) {
    var _ = -1, $ = p == null ? 0 : p.length;
    for (this.__data__ = new Rt(); ++_ < $; )
      this.add(p[_]);
  }
  function Nf(p) {
    return this.__data__.set(p, r), this;
  }
  function Df(p) {
    return this.__data__.has(p);
  }
  cr.prototype.add = cr.prototype.push = Nf, cr.prototype.has = Df;
  function at(p) {
    var _ = this.__data__ = new et(p);
    this.size = _.size;
  }
  function Ff() {
    this.__data__ = new et(), this.size = 0;
  }
  function xf(p) {
    var _ = this.__data__, $ = _.delete(p);
    return this.size = _.size, $;
  }
  function Lf(p) {
    return this.__data__.get(p);
  }
  function Uf(p) {
    return this.__data__.has(p);
  }
  function kf(p, _) {
    var $ = this.__data__;
    if ($ instanceof et) {
      var F = $.__data__;
      if (!En || F.length < n - 1)
        return F.push([p, _]), this.size = ++$.size, this;
      $ = this.__data__ = new Rt(F);
    }
    return $.set(p, _), this.size = $.size, this;
  }
  at.prototype.clear = Ff, at.prototype.delete = xf, at.prototype.get = Lf, at.prototype.has = Uf, at.prototype.set = kf;
  function Mf(p, _) {
    var $ = dr(p), F = !$ && ed(p), Z = !$ && !F && Ci(p), H = !$ && !F && !Z && $s(p), oe = $ || F || Z || H, he = oe ? Me(p.length, String) : [], ge = he.length;
    for (var ne in p)
      Xe.call(p, ne) && !(oe && // Safari 9 has enumerable `arguments.length` in strict mode.
      (ne == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      Z && (ne == "offset" || ne == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      H && (ne == "buffer" || ne == "byteLength" || ne == "byteOffset") || // Skip index properties.
      Xf(ne, ge))) && he.push(ne);
    return he;
  }
  function ur(p, _) {
    for (var $ = p.length; $--; )
      if (Ts(p[$][0], _))
        return $;
    return -1;
  }
  function Bf(p, _, $) {
    var F = _(p);
    return dr(p) ? F : st(F, $(p));
  }
  function wn(p) {
    return p == null ? p === void 0 ? E : T : Ct && Ct in Object(p) ? Yf(p) : Zf(p);
  }
  function ws(p) {
    return _n(p) && wn(p) == a;
  }
  function _s(p, _, $, F, Z) {
    return p === _ ? !0 : p == null || _ == null || !_n(p) && !_n(_) ? p !== p && _ !== _ : jf(p, _, $, F, _s, Z);
  }
  function jf(p, _, $, F, Z, H) {
    var oe = dr(p), he = dr(_), ge = oe ? c : lt(p), ne = he ? c : lt(_);
    ge = ge == a ? R : ge, ne = ne == a ? R : ne;
    var xe = ge == R, Be = ne == R, ve = ge == ne;
    if (ve && Ci(p)) {
      if (!Ci(_))
        return !1;
      oe = !0, xe = !1;
    }
    if (ve && !xe)
      return H || (H = new at()), oe || $s(p) ? vs(p, _, $, F, Z, H) : Vf(p, _, ge, $, F, Z, H);
    if (!($ & i)) {
      var Le = xe && Xe.call(p, "__wrapped__"), Ue = Be && Xe.call(_, "__wrapped__");
      if (Le || Ue) {
        var ct = Le ? p.value() : p, tt = Ue ? _.value() : _;
        return H || (H = new at()), Z(ct, tt, $, F, H);
      }
    }
    return ve ? (H || (H = new at()), Wf(p, _, $, F, Z, H)) : !1;
  }
  function Hf(p) {
    if (!Cs(p) || Jf(p))
      return !1;
    var _ = Ss(p) ? lf : K;
    return _.test(Ot(p));
  }
  function Gf(p) {
    return _n(p) && bs(p.length) && !!U[wn(p)];
  }
  function qf(p) {
    if (!Qf(p))
      return ff(p);
    var _ = [];
    for (var $ in Object(p))
      Xe.call(p, $) && $ != "constructor" && _.push($);
    return _;
  }
  function vs(p, _, $, F, Z, H) {
    var oe = $ & i, he = p.length, ge = _.length;
    if (he != ge && !(oe && ge > he))
      return !1;
    var ne = H.get(p);
    if (ne && H.get(_))
      return ne == _;
    var xe = -1, Be = !0, ve = $ & o ? new cr() : void 0;
    for (H.set(p, _), H.set(_, p); ++xe < he; ) {
      var Le = p[xe], Ue = _[xe];
      if (F)
        var ct = oe ? F(Ue, Le, xe, _, p, H) : F(Le, Ue, xe, p, _, H);
      if (ct !== void 0) {
        if (ct)
          continue;
        Be = !1;
        break;
      }
      if (ve) {
        if (!ce(_, function(tt, It) {
          if (!or(ve, It) && (Le === tt || Z(Le, tt, $, F, H)))
            return ve.push(It);
        })) {
          Be = !1;
          break;
        }
      } else if (!(Le === Ue || Z(Le, Ue, $, F, H))) {
        Be = !1;
        break;
      }
    }
    return H.delete(p), H.delete(_), Be;
  }
  function Vf(p, _, $, F, Z, H, oe) {
    switch ($) {
      case M:
        if (p.byteLength != _.byteLength || p.byteOffset != _.byteOffset)
          return !1;
        p = p.buffer, _ = _.buffer;
      case B:
        return !(p.byteLength != _.byteLength || !H(new ms(p), new ms(_)));
      case l:
      case f:
      case A:
        return Ts(+p, +_);
      case h:
        return p.name == _.name && p.message == _.message;
      case ee:
      case W:
        return p == _ + "";
      case y:
        var he = sr;
      case se:
        var ge = F & i;
        if (he || (he = of), p.size != _.size && !ge)
          return !1;
        var ne = oe.get(p);
        if (ne)
          return ne == _;
        F |= o, oe.set(p, _);
        var xe = vs(he(p), he(_), F, Z, H, oe);
        return oe.delete(p), xe;
      case Fe:
        if (bi)
          return bi.call(p) == bi.call(_);
    }
    return !1;
  }
  function Wf(p, _, $, F, Z, H) {
    var oe = $ & i, he = As(p), ge = he.length, ne = As(_), xe = ne.length;
    if (ge != xe && !oe)
      return !1;
    for (var Be = ge; Be--; ) {
      var ve = he[Be];
      if (!(oe ? ve in _ : Xe.call(_, ve)))
        return !1;
    }
    var Le = H.get(p);
    if (Le && H.get(_))
      return Le == _;
    var Ue = !0;
    H.set(p, _), H.set(_, p);
    for (var ct = oe; ++Be < ge; ) {
      ve = he[Be];
      var tt = p[ve], It = _[ve];
      if (F)
        var Rs = oe ? F(It, tt, ve, _, p, H) : F(tt, It, ve, p, _, H);
      if (!(Rs === void 0 ? tt === It || Z(tt, It, $, F, H) : Rs)) {
        Ue = !1;
        break;
      }
      ct || (ct = ve == "constructor");
    }
    if (Ue && !ct) {
      var hr = p.constructor, pr = _.constructor;
      hr != pr && "constructor" in p && "constructor" in _ && !(typeof hr == "function" && hr instanceof hr && typeof pr == "function" && pr instanceof pr) && (Ue = !1);
    }
    return H.delete(p), H.delete(_), Ue;
  }
  function As(p) {
    return Bf(p, rd, zf);
  }
  function fr(p, _) {
    var $ = p.__data__;
    return Kf(_) ? $[typeof _ == "string" ? "string" : "hash"] : $.map;
  }
  function qt(p, _) {
    var $ = gn(p, _);
    return Hf($) ? $ : void 0;
  }
  function Yf(p) {
    var _ = Xe.call(p, Ct), $ = p[Ct];
    try {
      p[Ct] = void 0;
      var F = !0;
    } catch {
    }
    var Z = hs.call(p);
    return F && (_ ? p[Ct] = $ : delete p[Ct]), Z;
  }
  var zf = Es ? function(p) {
    return p == null ? [] : (p = Object(p), _e(Es(p), function(_) {
      return gs.call(p, _);
    }));
  } : id, lt = wn;
  (vi && lt(new vi(new ArrayBuffer(1))) != M || En && lt(new En()) != y || Ai && lt(Ai.resolve()) != N || Ti && lt(new Ti()) != se || Si && lt(new Si()) != G) && (lt = function(p) {
    var _ = wn(p), $ = _ == R ? p.constructor : void 0, F = $ ? Ot($) : "";
    if (F)
      switch (F) {
        case df:
          return M;
        case hf:
          return y;
        case pf:
          return N;
        case mf:
          return se;
        case gf:
          return G;
      }
    return _;
  });
  function Xf(p, _) {
    return _ = _ ?? s, !!_ && (typeof p == "number" || de.test(p)) && p > -1 && p % 1 == 0 && p < _;
  }
  function Kf(p) {
    var _ = typeof p;
    return _ == "string" || _ == "number" || _ == "symbol" || _ == "boolean" ? p !== "__proto__" : p === null;
  }
  function Jf(p) {
    return !!ds && ds in p;
  }
  function Qf(p) {
    var _ = p && p.constructor, $ = typeof _ == "function" && _.prototype || ar;
    return p === $;
  }
  function Zf(p) {
    return hs.call(p);
  }
  function Ot(p) {
    if (p != null) {
      try {
        return fs.call(p);
      } catch {
      }
      try {
        return p + "";
      } catch {
      }
    }
    return "";
  }
  function Ts(p, _) {
    return p === _ || p !== p && _ !== _;
  }
  var ed = ws(/* @__PURE__ */ function() {
    return arguments;
  }()) ? ws : function(p) {
    return _n(p) && Xe.call(p, "callee") && !gs.call(p, "callee");
  }, dr = Array.isArray;
  function td(p) {
    return p != null && bs(p.length) && !Ss(p);
  }
  var Ci = uf || od;
  function nd(p, _) {
    return _s(p, _);
  }
  function Ss(p) {
    if (!Cs(p))
      return !1;
    var _ = wn(p);
    return _ == g || _ == w || _ == m || _ == x;
  }
  function bs(p) {
    return typeof p == "number" && p > -1 && p % 1 == 0 && p <= s;
  }
  function Cs(p) {
    var _ = typeof p;
    return p != null && (_ == "object" || _ == "function");
  }
  function _n(p) {
    return p != null && typeof p == "object";
  }
  var $s = me ? wi(me) : Gf;
  function rd(p) {
    return td(p) ? Mf(p) : qf(p);
  }
  function id() {
    return [];
  }
  function od() {
    return !1;
  }
  e.exports = nd;
})(Wr, Wr.exports);
var Mw = Wr.exports;
Object.defineProperty(tr, "__esModule", { value: !0 });
tr.DownloadedUpdateHelper = void 0;
tr.createTempUpdateFile = qw;
const Bw = Yn, jw = At, Va = Mw, Pt = St, In = te;
class Hw {
  constructor(t) {
    this.cacheDir = t, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
  }
  get downloadedFileInfo() {
    return this._downloadedFileInfo;
  }
  get file() {
    return this._file;
  }
  get packageFile() {
    return this._packageFile;
  }
  get cacheDirForPendingUpdate() {
    return In.join(this.cacheDir, "pending");
  }
  async validateDownloadedPath(t, n, r, i) {
    if (this.versionInfo != null && this.file === t && this.fileInfo != null)
      return Va(this.versionInfo, n) && Va(this.fileInfo.info, r.info) && await (0, Pt.pathExists)(t) ? t : null;
    const o = await this.getValidCachedUpdateFile(r, i);
    return o === null ? null : (i.info(`Update has already been downloaded to ${t}).`), this._file = o, o);
  }
  async setDownloadedFile(t, n, r, i, o, s) {
    this._file = t, this._packageFile = n, this.versionInfo = r, this.fileInfo = i, this._downloadedFileInfo = {
      fileName: o,
      sha512: i.info.sha512,
      isAdminRightsRequired: i.info.isAdminRightsRequired === !0
    }, s && await (0, Pt.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
  }
  async clear() {
    this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
  }
  async cleanCacheDirForPendingUpdate() {
    try {
      await (0, Pt.emptyDir)(this.cacheDirForPendingUpdate);
    } catch {
    }
  }
  /**
   * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
   * @param fileInfo
   * @param logger
   */
  async getValidCachedUpdateFile(t, n) {
    const r = this.getUpdateInfoFile();
    if (!await (0, Pt.pathExists)(r))
      return null;
    let o;
    try {
      o = await (0, Pt.readJson)(r);
    } catch (m) {
      let l = "No cached update info available";
      return m.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), l += ` (error on read: ${m.message})`), n.info(l), null;
    }
    if (!((o == null ? void 0 : o.fileName) !== null))
      return n.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
    if (t.info.sha512 !== o.sha512)
      return n.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${o.sha512}, expected: ${t.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
    const a = In.join(this.cacheDirForPendingUpdate, o.fileName);
    if (!await (0, Pt.pathExists)(a))
      return n.info("Cached update file doesn't exist"), null;
    const c = await Gw(a);
    return t.info.sha512 !== c ? (n.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${c}, expected: ${t.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = o, a);
  }
  getUpdateInfoFile() {
    return In.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
tr.DownloadedUpdateHelper = Hw;
function Gw(e, t = "sha512", n = "base64", r) {
  return new Promise((i, o) => {
    const s = (0, Bw.createHash)(t);
    s.on("error", o).setEncoding(n), (0, jw.createReadStream)(e, {
      ...r,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", o).on("end", () => {
      s.end(), i(s.read());
    }).pipe(s, { end: !1 });
  });
}
async function qw(e, t, n) {
  let r = 0, i = In.join(t, e);
  for (let o = 0; o < 3; o++)
    try {
      return await (0, Pt.unlink)(i), i;
    } catch (s) {
      if (s.code === "ENOENT")
        return i;
      n.warn(`Error on remove temp update file: ${s}`), i = In.join(t, `${r++}-${e}`);
    }
  return i;
}
var ui = {}, rs = {};
Object.defineProperty(rs, "__esModule", { value: !0 });
rs.getAppCacheDir = Ww;
const Vi = te, Vw = Xr;
function Ww() {
  const e = (0, Vw.homedir)();
  let t;
  return process.platform === "win32" ? t = process.env.LOCALAPPDATA || Vi.join(e, "AppData", "Local") : process.platform === "darwin" ? t = Vi.join(e, "Library", "Caches") : t = process.env.XDG_CACHE_HOME || Vi.join(e, ".cache"), t;
}
Object.defineProperty(ui, "__esModule", { value: !0 });
ui.ElectronAppAdapter = void 0;
const Wa = te, Yw = rs;
class zw {
  constructor(t = Ut.app) {
    this.app = t;
  }
  whenReady() {
    return this.app.whenReady();
  }
  get version() {
    return this.app.getVersion();
  }
  get name() {
    return this.app.getName();
  }
  get isPackaged() {
    return this.app.isPackaged === !0;
  }
  get appUpdateConfigPath() {
    return this.isPackaged ? Wa.join(process.resourcesPath, "app-update.yml") : Wa.join(this.app.getAppPath(), "dev-app-update.yml");
  }
  get userDataPath() {
    return this.app.getPath("userData");
  }
  get baseCachePath() {
    return (0, Yw.getAppCacheDir)();
  }
  quit() {
    this.app.quit();
  }
  relaunch() {
    this.app.relaunch();
  }
  onQuit(t) {
    this.app.once("quit", (n, r) => t(r));
  }
}
ui.ElectronAppAdapter = zw;
var Mu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = n;
  const t = fe;
  e.NET_SESSION_NAME = "electron-updater";
  function n() {
    return Ut.session.fromPartition(e.NET_SESSION_NAME, {
      cache: !1
    });
  }
  class r extends t.HttpExecutor {
    constructor(o) {
      super(), this.proxyLoginCallback = o, this.cachedSession = null;
    }
    async download(o, s, a) {
      return await a.cancellationToken.createPromise((c, m, l) => {
        const f = {
          headers: a.headers || void 0,
          redirect: "manual"
        };
        (0, t.configureRequestUrl)(o, f), (0, t.configureRequestOptions)(f), this.doDownload(f, {
          destination: s,
          options: a,
          onCancel: l,
          callback: (h) => {
            h == null ? c(s) : m(h);
          },
          responseHandler: null
        }, 0);
      });
    }
    createRequest(o, s) {
      o.headers && o.headers.Host && (o.host = o.headers.Host, delete o.headers.Host), this.cachedSession == null && (this.cachedSession = n());
      const a = Ut.net.request({
        ...o,
        session: this.cachedSession
      });
      return a.on("response", s), this.proxyLoginCallback != null && a.on("login", this.proxyLoginCallback), a;
    }
    addRedirectHandlers(o, s, a, c, m) {
      o.on("redirect", (l, f, h) => {
        o.abort(), c > this.maxRedirects ? a(this.createMaxRedirectError()) : m(t.HttpExecutor.prepareRedirectUrlOptions(h, s));
      });
    }
  }
  e.ElectronHttpExecutor = r;
})(Mu);
var nr = {}, Ye = {};
Object.defineProperty(Ye, "__esModule", { value: !0 });
Ye.newBaseUrl = Xw;
Ye.newUrlFromBase = Kw;
Ye.getChannelFilename = Jw;
const Bu = Tt;
function Xw(e) {
  const t = new Bu.URL(e);
  return t.pathname.endsWith("/") || (t.pathname += "/"), t;
}
function Kw(e, t, n = !1) {
  const r = new Bu.URL(e, t), i = t.search;
  return i != null && i.length !== 0 ? r.search = i : n && (r.search = `noCache=${Date.now().toString(32)}`), r;
}
function Jw(e) {
  return `${e}.yml`;
}
var le = {}, Qw = "[object Symbol]", ju = /[\\^$.*+?()[\]{}|]/g, Zw = RegExp(ju.source), e_ = typeof be == "object" && be && be.Object === Object && be, t_ = typeof self == "object" && self && self.Object === Object && self, n_ = e_ || t_ || Function("return this")(), r_ = Object.prototype, i_ = r_.toString, Ya = n_.Symbol, za = Ya ? Ya.prototype : void 0, Xa = za ? za.toString : void 0;
function o_(e) {
  if (typeof e == "string")
    return e;
  if (a_(e))
    return Xa ? Xa.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function s_(e) {
  return !!e && typeof e == "object";
}
function a_(e) {
  return typeof e == "symbol" || s_(e) && i_.call(e) == Qw;
}
function l_(e) {
  return e == null ? "" : o_(e);
}
function c_(e) {
  return e = l_(e), e && Zw.test(e) ? e.replace(ju, "\\$&") : e;
}
var Hu = c_;
Object.defineProperty(le, "__esModule", { value: !0 });
le.Provider = void 0;
le.findFile = p_;
le.parseUpdateInfo = m_;
le.getFileList = Gu;
le.resolveFiles = g_;
const _t = fe, u_ = we, f_ = Tt, Yr = Ye, d_ = Hu;
class h_ {
  constructor(t) {
    this.runtimeOptions = t, this.requestHeaders = null, this.executor = t.executor;
  }
  // By default, the blockmap file is in the same directory as the main file
  // But some providers may have a different blockmap file, so we need to override this method
  getBlockMapFiles(t, n, r, i = null) {
    const o = (0, Yr.newUrlFromBase)(`${t.pathname}.blockmap`, t);
    return [(0, Yr.newUrlFromBase)(`${t.pathname.replace(new RegExp(d_(r), "g"), n)}.blockmap`, i ? new f_.URL(i) : t), o];
  }
  get isUseMultipleRangeRequest() {
    return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
  }
  getChannelFilePrefix() {
    if (this.runtimeOptions.platform === "linux") {
      const t = process.env.TEST_UPDATER_ARCH || process.arch;
      return "-linux" + (t === "x64" ? "" : `-${t}`);
    } else
      return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
  }
  // due to historical reasons for windows we use channel name without platform specifier
  getDefaultChannelName() {
    return this.getCustomChannelName("latest");
  }
  getCustomChannelName(t) {
    return `${t}${this.getChannelFilePrefix()}`;
  }
  get fileExtraDownloadHeaders() {
    return null;
  }
  setRequestHeaders(t) {
    this.requestHeaders = t;
  }
  /**
   * Method to perform API request only to resolve update info, but not to download update.
   */
  httpRequest(t, n, r) {
    return this.executor.request(this.createRequestOptions(t, n), r);
  }
  createRequestOptions(t, n) {
    const r = {};
    return this.requestHeaders == null ? n != null && (r.headers = n) : r.headers = n == null ? this.requestHeaders : { ...this.requestHeaders, ...n }, (0, _t.configureRequestUrl)(t, r), r;
  }
}
le.Provider = h_;
function p_(e, t, n) {
  var r;
  if (e.length === 0)
    throw (0, _t.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
  const i = e.filter((s) => s.url.pathname.toLowerCase().endsWith(`.${t.toLowerCase()}`)), o = (r = i.find((s) => [s.url.pathname, s.info.url].some((a) => a.includes(process.arch)))) !== null && r !== void 0 ? r : i.shift();
  return o || (n == null ? e[0] : e.find((s) => !n.some((a) => s.url.pathname.toLowerCase().endsWith(`.${a.toLowerCase()}`))));
}
function m_(e, t, n) {
  if (e == null)
    throw (0, _t.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${n}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  let r;
  try {
    r = (0, u_.load)(e);
  } catch (i) {
    throw (0, _t.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${n}): ${i.stack || i.message}, rawData: ${e}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  }
  return r;
}
function Gu(e) {
  const t = e.files;
  if (t != null && t.length > 0)
    return t;
  if (e.path != null)
    return [
      {
        url: e.path,
        sha2: e.sha2,
        sha512: e.sha512
      }
    ];
  throw (0, _t.newError)(`No files provided: ${(0, _t.safeStringifyJson)(e)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
}
function g_(e, t, n = (r) => r) {
  const i = Gu(e).map((a) => {
    if (a.sha2 == null && a.sha512 == null)
      throw (0, _t.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, _t.safeStringifyJson)(a)}`, "ERR_UPDATER_NO_CHECKSUM");
    return {
      url: (0, Yr.newUrlFromBase)(n(a.url), t),
      info: a
    };
  }), o = e.packages, s = o == null ? null : o[process.arch] || o.ia32;
  return s != null && (i[0].packageInfo = {
    ...s,
    path: (0, Yr.newUrlFromBase)(n(s.path), t).href
  }), i;
}
Object.defineProperty(nr, "__esModule", { value: !0 });
nr.GenericProvider = void 0;
const Ka = fe, Wi = Ye, Yi = le;
class E_ extends Yi.Provider {
  constructor(t, n, r) {
    super(r), this.configuration = t, this.updater = n, this.baseUrl = (0, Wi.newBaseUrl)(this.configuration.url);
  }
  get channel() {
    const t = this.updater.channel || this.configuration.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = (0, Wi.getChannelFilename)(this.channel), n = (0, Wi.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
    for (let r = 0; ; r++)
      try {
        return (0, Yi.parseUpdateInfo)(await this.httpRequest(n), t, n);
      } catch (i) {
        if (i instanceof Ka.HttpError && i.statusCode === 404)
          throw (0, Ka.newError)(`Cannot find channel "${t}" update info: ${i.stack || i.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        if (i.code === "ECONNREFUSED" && r < 3) {
          await new Promise((o, s) => {
            try {
              setTimeout(o, 1e3 * r);
            } catch (a) {
              s(a);
            }
          });
          continue;
        }
        throw i;
      }
  }
  resolveFiles(t) {
    return (0, Yi.resolveFiles)(t, this.baseUrl);
  }
}
nr.GenericProvider = E_;
var fi = {}, di = {};
Object.defineProperty(di, "__esModule", { value: !0 });
di.BitbucketProvider = void 0;
const Ja = fe, zi = Ye, Xi = le;
class y_ extends Xi.Provider {
  constructor(t, n, r) {
    super({
      ...r,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = n;
    const { owner: i, slug: o } = t;
    this.baseUrl = (0, zi.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${i}/${o}/downloads`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "latest";
  }
  async getLatestVersion() {
    const t = new Ja.CancellationToken(), n = (0, zi.getChannelFilename)(this.getCustomChannelName(this.channel)), r = (0, zi.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(r, void 0, t);
      return (0, Xi.parseUpdateInfo)(i, n, r);
    } catch (i) {
      throw (0, Ja.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, Xi.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { owner: t, slug: n } = this.configuration;
    return `Bitbucket (owner: ${t}, slug: ${n}, channel: ${this.channel})`;
  }
}
di.BitbucketProvider = y_;
var vt = {};
Object.defineProperty(vt, "__esModule", { value: !0 });
vt.GitHubProvider = vt.BaseGitHubProvider = void 0;
vt.computeReleaseNotes = Vu;
const nt = fe, Je = ku, w_ = Tt, tn = Ye, So = le, Ki = /\/tag\/(v?[^/]+)$/;
class qu extends So.Provider {
  constructor(t, n, r) {
    super({
      ...r,
      /* because GitHib uses S3 */
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.baseUrl = (0, tn.newBaseUrl)((0, nt.githubUrl)(t, n));
    const i = n === "github.com" ? "api.github.com" : n;
    this.baseApiUrl = (0, tn.newBaseUrl)((0, nt.githubUrl)(t, i));
  }
  computeGithubBasePath(t) {
    const n = this.options.host;
    return n && !["github.com", "api.github.com"].includes(n) ? `/api/v3${t}` : t;
  }
}
vt.BaseGitHubProvider = qu;
class __ extends qu {
  constructor(t, n, r) {
    super(t, "github.com", r), this.options = t, this.updater = n;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    var t, n, r, i, o;
    const s = new nt.CancellationToken(), a = await this.httpRequest((0, tn.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
      accept: "application/xml, application/atom+xml, text/xml, */*"
    }, s), c = (0, nt.parseXml)(a);
    let m = c.element("entry", !1, "No published versions on GitHub"), l = null;
    try {
      if (this.updater.allowPrerelease) {
        const A = ((t = this.updater) === null || t === void 0 ? void 0 : t.channel) || ((n = Je.prerelease(this.updater.currentVersion)) === null || n === void 0 ? void 0 : n[0]) || null;
        if (A === null)
          l = Ki.exec(m.element("link").attribute("href"))[1];
        else
          for (const T of c.getElements("entry")) {
            const R = Ki.exec(T.element("link").attribute("href"));
            if (R === null)
              continue;
            const N = R[1];
            if (!Je.valid(N))
              continue;
            const x = ((r = Je.prerelease(N)) === null || r === void 0 ? void 0 : r[0]) || null, ee = !A || ["alpha", "beta"].includes(A), se = x !== null && !["alpha", "beta"].includes(String(x));
            if (ee && !se && !(A === "beta" && x === "alpha")) {
              l = N, m = T;
              break;
            }
            if (x && x === A) {
              l = N, m = T;
              break;
            }
          }
      } else {
        l = await this.getLatestTagName(s);
        for (const A of c.getElements("entry")) {
          const T = Ki.exec(A.element("link").attribute("href"));
          if (T != null && T[1] === l) {
            m = A;
            break;
          }
        }
      }
    } catch (A) {
      throw (0, nt.newError)(`Cannot parse releases feed: ${A.stack || A.message},
XML:
${a}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
    }
    if (l == null)
      throw (0, nt.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let f, h = "", g = "";
    const w = async (A) => {
      h = (0, tn.getChannelFilename)(A), g = (0, tn.newUrlFromBase)(this.getBaseDownloadPath(String(l), h), this.baseUrl);
      const T = this.createRequestOptions(g);
      try {
        return await this.executor.request(T, s);
      } catch (R) {
        throw R instanceof nt.HttpError && R.statusCode === 404 ? (0, nt.newError)(`Cannot find ${h} in the latest release artifacts (${g}): ${R.stack || R.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : R;
      }
    };
    try {
      let A = this.channel;
      this.updater.allowPrerelease && (!((i = Je.prerelease(l)) === null || i === void 0) && i[0]) && (A = this.getCustomChannelName(String((o = Je.prerelease(l)) === null || o === void 0 ? void 0 : o[0]))), f = await w(A);
    } catch (A) {
      if (this.updater.allowPrerelease)
        f = await w(this.getDefaultChannelName());
      else
        throw A;
    }
    const y = (0, So.parseUpdateInfo)(f, h, g);
    return y.releaseName == null && (y.releaseName = m.elementValueOrEmpty("title")), y.releaseNotes == null && (y.releaseNotes = Vu(this.updater.currentVersion, this.updater.fullChangelog, c, m)), {
      tag: l,
      ...y
    };
  }
  async getLatestTagName(t) {
    const n = this.options, r = n.host == null || n.host === "github.com" ? (0, tn.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new w_.URL(`${this.computeGithubBasePath(`/repos/${n.owner}/${n.repo}/releases`)}/latest`, this.baseApiUrl);
    try {
      const i = await this.httpRequest(r, { Accept: "application/json" }, t);
      return i == null ? null : JSON.parse(i).tag_name;
    } catch (i) {
      throw (0, nt.newError)(`Unable to find latest version on GitHub (${r}), please ensure a production release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return `/${this.options.owner}/${this.options.repo}/releases`;
  }
  resolveFiles(t) {
    return (0, So.resolveFiles)(t, this.baseUrl, (n) => this.getBaseDownloadPath(t.tag, n.replace(/ /g, "-")));
  }
  getBaseDownloadPath(t, n) {
    return `${this.basePath}/download/${t}/${n}`;
  }
}
vt.GitHubProvider = __;
function Qa(e) {
  const t = e.elementValueOrEmpty("content");
  return t === "No content." ? "" : t;
}
function Vu(e, t, n, r) {
  if (!t)
    return Qa(r);
  const i = /\/tag\/v?([^/]+)$/;
  let o;
  try {
    o = i.exec(r.element("link").attribute("href"))[1], o = Je.valid(o) ? o : void 0;
  } catch {
  }
  if (o == null)
    return null;
  const s = [];
  for (const a of n.getElements("entry")) {
    let c;
    try {
      const f = i.exec(a.element("link").attribute("href"));
      if (!f)
        continue;
      c = f[1];
    } catch {
      continue;
    }
    if (!Je.valid(c))
      continue;
    const m = Je.gt(c, e.raw), l = Je.lte(c, o);
    m && l && s.push({
      version: c,
      note: Qa(a)
    });
  }
  return s.sort((a, c) => Je.rcompare(a.version, c.version));
}
var hi = {};
Object.defineProperty(hi, "__esModule", { value: !0 });
hi.GitLabProvider = void 0;
const Ee = fe, Ji = Tt, v_ = Hu, $r = Ye, Qi = le;
class A_ extends Qi.Provider {
  /**
   * Normalizes filenames by replacing spaces and underscores with dashes.
   *
   * This is a workaround to handle filename formatting differences between tools:
   * - electron-builder formats filenames like "test file.txt" as "test-file.txt"
   * - GitLab may provide asset URLs using underscores, such as "test_file.txt"
   *
   * Because of this mismatch, we can't reliably extract the correct filename from
   * the asset path without normalization. This function ensures consistent matching
   * across different filename formats by converting all spaces and underscores to dashes.
   *
   * @param filename The filename to normalize
   * @returns The normalized filename with spaces and underscores replaced by dashes
   */
  normalizeFilename(t) {
    return t.replace(/ |_/g, "-");
  }
  constructor(t, n, r) {
    super({
      ...r,
      // GitLab might not support multiple range requests efficiently
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.updater = n, this.cachedLatestVersion = null;
    const o = t.host || "gitlab.com";
    this.baseApiUrl = (0, $r.newBaseUrl)(`https://${o}/api/v4`);
  }
  createRequestOptions(t, n) {
    const r = super.createRequestOptions(t, n);
    return r.redirect = "manual", r;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = new Ee.CancellationToken(), n = (0, $r.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl), r = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) };
    let i;
    try {
      i = await this.httpRequest(n, r, t);
    } catch (g) {
      throw (0, Ee.newError)(`Unable to find latest release on GitLab (${n}): ${g.stack || g.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    if (!i)
      throw (0, Ee.newError)("No published releases on GitLab", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let o;
    try {
      o = JSON.parse(i);
    } catch (g) {
      throw (0, Ee.newError)(`Unable to parse latest release response from GitLab (${n}): response was not valid JSON: ${g.stack || g.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    if (o.upcoming_release)
      throw (0, Ee.newError)("Latest GitLab release is scheduled but not yet published", "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    const s = o.tag_name;
    let a = null, c = "", m = null;
    const l = async (g) => {
      c = (0, $r.getChannelFilename)(g);
      const w = o.assets.links.find((T) => T.name === c);
      if (!w)
        throw (0, Ee.newError)(`Cannot find ${c} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      m = new Ji.URL(w.direct_asset_url);
      const y = this.setAuthHeaderForToken(this.options.token || null), A = Object.keys(y).length ? y : void 0;
      try {
        const T = await this.httpRequest(m, A, t);
        if (!T)
          throw (0, Ee.newError)(`Empty response from ${m}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        return T;
      } catch (T) {
        throw T instanceof Ee.HttpError && T.statusCode === 404 ? (0, Ee.newError)(`Cannot find ${c} in the latest release artifacts (${m}): ${T.stack || T.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : T;
      }
    };
    try {
      a = await l(this.channel);
    } catch (g) {
      if (this.channel !== this.getDefaultChannelName())
        a = await l(this.getDefaultChannelName());
      else
        throw g;
    }
    if (!a)
      throw (0, Ee.newError)(`Unable to parse channel data from ${c}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    const f = (0, Qi.parseUpdateInfo)(a, c, m);
    f.releaseName == null && (f.releaseName = o.name), f.releaseNotes == null && (f.releaseNotes = o.description || null);
    const h = {
      tag: s,
      assets: this.convertAssetsToMap(o.assets),
      ...f
    };
    return this.cachedLatestVersion = h, h;
  }
  /**
   * Utility function to convert GitlabReleaseAsset to Map<string, string>
   * Maps asset names to their download URLs
   */
  convertAssetsToMap(t) {
    const n = /* @__PURE__ */ new Map();
    for (const r of t.links)
      n.set(this.normalizeFilename(r.name), r.direct_asset_url);
    return n;
  }
  /**
   * Find blockmap file URL in assets map for a specific filename
   */
  findBlockMapInAssets(t, n) {
    const r = [`${n}.blockmap`, `${this.normalizeFilename(n)}.blockmap`];
    for (const i of r) {
      const o = t.get(i);
      if (o)
        return new Ji.URL(o);
    }
    return null;
  }
  async fetchReleaseInfoByVersion(t) {
    const n = new Ee.CancellationToken(), r = [`v${t}`, t];
    for (const i of r) {
      const o = (0, $r.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(i)}`, this.baseApiUrl);
      try {
        const s = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, a = await this.httpRequest(o, s, n);
        if (a)
          return JSON.parse(a);
      } catch (s) {
        if (s instanceof Ee.HttpError && s.statusCode === 404)
          continue;
        throw (0, Ee.newError)(`Unable to find release ${i} on GitLab (${o}): ${s.stack || s.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
      }
    }
    throw (0, Ee.newError)(`Unable to find release with version ${t} (tried: ${r.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
  }
  setAuthHeaderForToken(t) {
    const n = {};
    return t != null && (t.startsWith("Bearer") ? n.authorization = t : n["PRIVATE-TOKEN"] = t), n;
  }
  /**
   * Get version info for blockmap files, using cache when possible
   */
  async getVersionInfoForBlockMap(t) {
    if (this.cachedLatestVersion && this.cachedLatestVersion.version === t)
      return this.cachedLatestVersion.assets;
    const n = await this.fetchReleaseInfoByVersion(t);
    return n && n.assets ? this.convertAssetsToMap(n.assets) : null;
  }
  /**
   * Find blockmap URLs from version assets
   */
  async findBlockMapUrlsFromAssets(t, n, r) {
    let i = null, o = null;
    const s = await this.getVersionInfoForBlockMap(n);
    s && (i = this.findBlockMapInAssets(s, r));
    const a = await this.getVersionInfoForBlockMap(t);
    if (a) {
      const c = r.replace(new RegExp(v_(n), "g"), t);
      o = this.findBlockMapInAssets(a, c);
    }
    return [o, i];
  }
  async getBlockMapFiles(t, n, r, i = null) {
    if (this.options.uploadTarget === "project_upload") {
      const o = t.pathname.split("/").pop() || "", [s, a] = await this.findBlockMapUrlsFromAssets(n, r, o);
      if (!a)
        throw (0, Ee.newError)(`Cannot find blockmap file for ${r} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      if (!s)
        throw (0, Ee.newError)(`Cannot find blockmap file for ${n} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      return [s, a];
    } else
      return super.getBlockMapFiles(t, n, r, i);
  }
  resolveFiles(t) {
    return (0, Qi.getFileList)(t).map((n) => {
      const i = [
        n.url,
        // Original filename
        this.normalizeFilename(n.url)
        // Normalized filename (spaces/underscores → dashes)
      ].find((s) => t.assets.has(s)), o = i ? t.assets.get(i) : void 0;
      if (!o)
        throw (0, Ee.newError)(`Cannot find asset "${n.url}" in GitLab release assets. Available assets: ${Array.from(t.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new Ji.URL(o),
        info: n
      };
    });
  }
  toString() {
    return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
  }
}
hi.GitLabProvider = A_;
var pi = {};
Object.defineProperty(pi, "__esModule", { value: !0 });
pi.KeygenProvider = void 0;
const Za = fe, Zi = Ye, eo = le;
class T_ extends eo.Provider {
  constructor(t, n, r) {
    super({
      ...r,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = n, this.defaultHostname = "api.keygen.sh";
    const i = this.configuration.host || this.defaultHostname;
    this.baseUrl = (0, Zi.newBaseUrl)(`https://${i}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "stable";
  }
  async getLatestVersion() {
    const t = new Za.CancellationToken(), n = (0, Zi.getChannelFilename)(this.getCustomChannelName(this.channel)), r = (0, Zi.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(r, {
        Accept: "application/vnd.api+json",
        "Keygen-Version": "1.1"
      }, t);
      return (0, eo.parseUpdateInfo)(i, n, r);
    } catch (i) {
      throw (0, Za.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, eo.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { account: t, product: n, platform: r } = this.configuration;
    return `Keygen (account: ${t}, product: ${n}, platform: ${r}, channel: ${this.channel})`;
  }
}
pi.KeygenProvider = T_;
var mi = {};
Object.defineProperty(mi, "__esModule", { value: !0 });
mi.PrivateGitHubProvider = void 0;
const Wt = fe, S_ = we, b_ = te, el = Tt, tl = Ye, C_ = vt, $_ = le;
class R_ extends C_.BaseGitHubProvider {
  constructor(t, n, r, i) {
    super(t, "api.github.com", i), this.updater = n, this.token = r;
  }
  createRequestOptions(t, n) {
    const r = super.createRequestOptions(t, n);
    return r.redirect = "manual", r;
  }
  async getLatestVersion() {
    const t = new Wt.CancellationToken(), n = (0, tl.getChannelFilename)(this.getDefaultChannelName()), r = await this.getLatestVersionInfo(t), i = r.assets.find((a) => a.name === n);
    if (i == null)
      throw (0, Wt.newError)(`Cannot find ${n} in the release ${r.html_url || r.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
    const o = new el.URL(i.url);
    let s;
    try {
      s = (0, S_.load)(await this.httpRequest(o, this.configureHeaders("application/octet-stream"), t));
    } catch (a) {
      throw a instanceof Wt.HttpError && a.statusCode === 404 ? (0, Wt.newError)(`Cannot find ${n} in the latest release artifacts (${o}): ${a.stack || a.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : a;
    }
    return s.assets = r.assets, s;
  }
  get fileExtraDownloadHeaders() {
    return this.configureHeaders("application/octet-stream");
  }
  configureHeaders(t) {
    return {
      accept: t,
      authorization: `token ${this.token}`
    };
  }
  async getLatestVersionInfo(t) {
    const n = this.updater.allowPrerelease;
    let r = this.basePath;
    n || (r = `${r}/latest`);
    const i = (0, tl.newUrlFromBase)(r, this.baseUrl);
    try {
      const o = JSON.parse(await this.httpRequest(i, this.configureHeaders("application/vnd.github.v3+json"), t));
      if (n) {
        const s = o.filter((a) => !a.draft);
        return s.find((a) => a.prerelease) || s[0];
      } else
        return o;
    } catch (o) {
      throw (0, Wt.newError)(`Unable to find latest version on GitHub (${i}), please ensure a production release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
  }
  resolveFiles(t) {
    return (0, $_.getFileList)(t).map((n) => {
      const r = b_.posix.basename(n.url).replace(/ /g, "-"), i = t.assets.find((o) => o != null && o.name === r);
      if (i == null)
        throw (0, Wt.newError)(`Cannot find asset "${r}" in: ${JSON.stringify(t.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new el.URL(i.url),
        info: n
      };
    });
  }
}
mi.PrivateGitHubProvider = R_;
Object.defineProperty(fi, "__esModule", { value: !0 });
fi.isUrlProbablySupportMultiRangeRequests = Wu;
fi.createClient = F_;
const Rr = fe, O_ = di, nl = nr, I_ = vt, P_ = hi, N_ = pi, D_ = mi;
function Wu(e) {
  return !e.includes("s3.amazonaws.com");
}
function F_(e, t, n) {
  if (typeof e == "string")
    throw (0, Rr.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
  const r = e.provider;
  switch (r) {
    case "github": {
      const i = e, o = (i.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || i.token;
      return o == null ? new I_.GitHubProvider(i, t, n) : new D_.PrivateGitHubProvider(i, t, o, n);
    }
    case "bitbucket":
      return new O_.BitbucketProvider(e, t, n);
    case "gitlab":
      return new P_.GitLabProvider(e, t, n);
    case "keygen":
      return new N_.KeygenProvider(e, t, n);
    case "s3":
    case "spaces":
      return new nl.GenericProvider({
        provider: "generic",
        url: (0, Rr.getS3LikeProviderBaseUrl)(e),
        channel: e.channel || null
      }, t, {
        ...n,
        // https://github.com/minio/minio/issues/5285#issuecomment-350428955
        isUseMultipleRangeRequest: !1
      });
    case "generic": {
      const i = e;
      return new nl.GenericProvider(i, t, {
        ...n,
        isUseMultipleRangeRequest: i.useMultipleRangeRequest !== !1 && Wu(i.url)
      });
    }
    case "custom": {
      const i = e, o = i.updateProvider;
      if (!o)
        throw (0, Rr.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
      return new o(i, t, n);
    }
    default:
      throw (0, Rr.newError)(`Unsupported provider: ${r}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
  }
}
var gi = {}, rr = {}, pn = {}, Gt = {};
Object.defineProperty(Gt, "__esModule", { value: !0 });
Gt.OperationKind = void 0;
Gt.computeOperations = x_;
var xt;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(xt || (Gt.OperationKind = xt = {}));
function x_(e, t, n) {
  const r = il(e.files), i = il(t.files);
  let o = null;
  const s = t.files[0], a = [], c = s.name, m = r.get(c);
  if (m == null)
    throw new Error(`no file ${c} in old blockmap`);
  const l = i.get(c);
  let f = 0;
  const { checksumToOffset: h, checksumToOldSize: g } = U_(r.get(c), m.offset, n);
  let w = s.offset;
  for (let y = 0; y < l.checksums.length; w += l.sizes[y], y++) {
    const A = l.sizes[y], T = l.checksums[y];
    let R = h.get(T);
    R != null && g.get(T) !== A && (n.warn(`Checksum ("${T}") matches, but size differs (old: ${g.get(T)}, new: ${A})`), R = void 0), R === void 0 ? (f++, o != null && o.kind === xt.DOWNLOAD && o.end === w ? o.end += A : (o = {
      kind: xt.DOWNLOAD,
      start: w,
      end: w + A
      // oldBlocks: null,
    }, rl(o, a, T, y))) : o != null && o.kind === xt.COPY && o.end === R ? o.end += A : (o = {
      kind: xt.COPY,
      start: R,
      end: R + A
      // oldBlocks: [checksum]
    }, rl(o, a, T, y));
  }
  return f > 0 && n.info(`File${s.name === "file" ? "" : " " + s.name} has ${f} changed blocks`), a;
}
const L_ = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
function rl(e, t, n, r) {
  if (L_ && t.length !== 0) {
    const i = t[t.length - 1];
    if (i.kind === e.kind && e.start < i.end && e.start > i.start) {
      const o = [i.start, i.end, e.start, e.end].reduce((s, a) => s < a ? s : a);
      throw new Error(`operation (block index: ${r}, checksum: ${n}, kind: ${xt[e.kind]}) overlaps previous operation (checksum: ${n}):
abs: ${i.start} until ${i.end} and ${e.start} until ${e.end}
rel: ${i.start - o} until ${i.end - o} and ${e.start - o} until ${e.end - o}`);
    }
  }
  t.push(e);
}
function U_(e, t, n) {
  const r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  let o = t;
  for (let s = 0; s < e.checksums.length; s++) {
    const a = e.checksums[s], c = e.sizes[s], m = i.get(a);
    if (m === void 0)
      r.set(a, o), i.set(a, c);
    else if (n.debug != null) {
      const l = m === c ? "(same size)" : `(size: ${m}, this size: ${c})`;
      n.debug(`${a} duplicated in blockmap ${l}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
    }
    o += c;
  }
  return { checksumToOffset: r, checksumToOldSize: i };
}
function il(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e)
    t.set(n.name, n);
  return t;
}
Object.defineProperty(pn, "__esModule", { value: !0 });
pn.DataSplitter = void 0;
pn.copyData = Yu;
const Or = fe, k_ = At, M_ = Wn, B_ = Gt, ol = Buffer.from(`\r
\r
`);
var dt;
(function(e) {
  e[e.INIT = 0] = "INIT", e[e.HEADER = 1] = "HEADER", e[e.BODY = 2] = "BODY";
})(dt || (dt = {}));
function Yu(e, t, n, r, i) {
  const o = (0, k_.createReadStream)("", {
    fd: n,
    autoClose: !1,
    start: e.start,
    // end is inclusive
    end: e.end - 1
  });
  o.on("error", r), o.once("end", i), o.pipe(t, {
    end: !1
  });
}
class j_ extends M_.Writable {
  constructor(t, n, r, i, o, s, a, c) {
    super(), this.out = t, this.options = n, this.partIndexToTaskIndex = r, this.partIndexToLength = o, this.finishHandler = s, this.grandTotalBytes = a, this.onProgress = c, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = dt.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = i.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
  }
  get isFinished() {
    return this.partIndex === this.partIndexToLength.length;
  }
  // noinspection JSUnusedGlobalSymbols
  _write(t, n, r) {
    if (this.isFinished) {
      console.error(`Trailing ignored data: ${t.length} bytes`);
      return;
    }
    this.handleData(t).then(() => {
      if (this.onProgress) {
        const i = Date.now();
        (i >= this.nextUpdate || this.transferred === this.grandTotalBytes) && this.grandTotalBytes && (i - this.start) / 1e3 && (this.nextUpdate = i + 1e3, this.onProgress({
          total: this.grandTotalBytes,
          delta: this.delta,
          transferred: this.transferred,
          percent: this.transferred / this.grandTotalBytes * 100,
          bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
        }), this.delta = 0);
      }
      r();
    }).catch(r);
  }
  async handleData(t) {
    let n = 0;
    if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
      throw (0, Or.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
    if (this.ignoreByteCount > 0) {
      const r = Math.min(this.ignoreByteCount, t.length);
      this.ignoreByteCount -= r, n = r;
    } else if (this.remainingPartDataCount > 0) {
      const r = Math.min(this.remainingPartDataCount, t.length);
      this.remainingPartDataCount -= r, await this.processPartData(t, 0, r), n = r;
    }
    if (n !== t.length) {
      if (this.readState === dt.HEADER) {
        const r = this.searchHeaderListEnd(t, n);
        if (r === -1)
          return;
        n = r, this.readState = dt.BODY, this.headerListBuffer = null;
      }
      for (; ; ) {
        if (this.readState === dt.BODY)
          this.readState = dt.INIT;
        else {
          this.partIndex++;
          let s = this.partIndexToTaskIndex.get(this.partIndex);
          if (s == null)
            if (this.isFinished)
              s = this.options.end;
            else
              throw (0, Or.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
          const a = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
          if (a < s)
            await this.copyExistingData(a, s);
          else if (a > s)
            throw (0, Or.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
          if (this.isFinished) {
            this.onPartEnd(), this.finishHandler();
            return;
          }
          if (n = this.searchHeaderListEnd(t, n), n === -1) {
            this.readState = dt.HEADER;
            return;
          }
        }
        const r = this.partIndexToLength[this.partIndex], i = n + r, o = Math.min(i, t.length);
        if (await this.processPartStarted(t, n, o), this.remainingPartDataCount = r - (o - n), this.remainingPartDataCount > 0)
          return;
        if (n = i + this.boundaryLength, n >= t.length) {
          this.ignoreByteCount = this.boundaryLength - (t.length - i);
          return;
        }
      }
    }
  }
  copyExistingData(t, n) {
    return new Promise((r, i) => {
      const o = () => {
        if (t === n) {
          r();
          return;
        }
        const s = this.options.tasks[t];
        if (s.kind !== B_.OperationKind.COPY) {
          i(new Error("Task kind must be COPY"));
          return;
        }
        Yu(s, this.out, this.options.oldFileFd, i, () => {
          t++, o();
        });
      };
      o();
    });
  }
  searchHeaderListEnd(t, n) {
    const r = t.indexOf(ol, n);
    if (r !== -1)
      return r + ol.length;
    const i = n === 0 ? t : t.slice(n);
    return this.headerListBuffer == null ? this.headerListBuffer = i : this.headerListBuffer = Buffer.concat([this.headerListBuffer, i]), -1;
  }
  onPartEnd() {
    const t = this.partIndexToLength[this.partIndex - 1];
    if (this.actualPartLength !== t)
      throw (0, Or.newError)(`Expected length: ${t} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
    this.actualPartLength = 0;
  }
  processPartStarted(t, n, r) {
    return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(t, n, r);
  }
  processPartData(t, n, r) {
    this.actualPartLength += r - n, this.transferred += r - n, this.delta += r - n;
    const i = this.out;
    return i.write(n === 0 && t.length === r ? t : t.slice(n, r)) ? Promise.resolve() : new Promise((o, s) => {
      i.on("error", s), i.once("drain", () => {
        i.removeListener("error", s), o();
      });
    });
  }
}
pn.DataSplitter = j_;
var Ei = {};
Object.defineProperty(Ei, "__esModule", { value: !0 });
Ei.executeTasksUsingMultipleRangeRequests = H_;
Ei.checkIsRangesSupported = Co;
const bo = fe, sl = pn, al = Gt;
function H_(e, t, n, r, i) {
  const o = (s) => {
    if (s >= t.length) {
      e.fileMetadataBuffer != null && n.write(e.fileMetadataBuffer), n.end();
      return;
    }
    const a = s + 1e3;
    G_(e, {
      tasks: t,
      start: s,
      end: Math.min(t.length, a),
      oldFileFd: r
    }, n, () => o(a), i);
  };
  return o;
}
function G_(e, t, n, r, i) {
  let o = "bytes=", s = 0, a = 0;
  const c = /* @__PURE__ */ new Map(), m = [];
  for (let h = t.start; h < t.end; h++) {
    const g = t.tasks[h];
    g.kind === al.OperationKind.DOWNLOAD && (o += `${g.start}-${g.end - 1}, `, c.set(s, h), s++, m.push(g.end - g.start), a += g.end - g.start);
  }
  if (s <= 1) {
    const h = (g) => {
      if (g >= t.end) {
        r();
        return;
      }
      const w = t.tasks[g++];
      if (w.kind === al.OperationKind.COPY)
        (0, sl.copyData)(w, n, t.oldFileFd, i, () => h(g));
      else {
        const y = e.createRequestOptions();
        y.headers.Range = `bytes=${w.start}-${w.end - 1}`;
        const A = e.httpExecutor.createRequest(y, (T) => {
          T.on("error", i), Co(T, i) && (T.pipe(n, {
            end: !1
          }), T.once("end", () => h(g)));
        });
        e.httpExecutor.addErrorAndTimeoutHandlers(A, i), A.end();
      }
    };
    h(t.start);
    return;
  }
  const l = e.createRequestOptions();
  l.headers.Range = o.substring(0, o.length - 2);
  const f = e.httpExecutor.createRequest(l, (h) => {
    if (!Co(h, i))
      return;
    const g = (0, bo.safeGetHeader)(h, "content-type"), w = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(g);
    if (w == null) {
      i(new Error(`Content-Type "multipart/byteranges" is expected, but got "${g}"`));
      return;
    }
    const y = new sl.DataSplitter(n, t, c, w[1] || w[2], m, r, a, e.options.onProgress);
    y.on("error", i), h.pipe(y), h.on("end", () => {
      setTimeout(() => {
        f.abort(), i(new Error("Response ends without calling any handlers"));
      }, 1e4);
    });
  });
  e.httpExecutor.addErrorAndTimeoutHandlers(f, i), f.end();
}
function Co(e, t) {
  if (e.statusCode >= 400)
    return t((0, bo.createHttpError)(e)), !1;
  if (e.statusCode !== 206) {
    const n = (0, bo.safeGetHeader)(e, "accept-ranges");
    if (n == null || n === "none")
      return t(new Error(`Server doesn't support Accept-Ranges (response code ${e.statusCode})`)), !1;
  }
  return !0;
}
var yi = {};
Object.defineProperty(yi, "__esModule", { value: !0 });
yi.ProgressDifferentialDownloadCallbackTransform = void 0;
const q_ = Wn;
var nn;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(nn || (nn = {}));
class V_ extends q_.Transform {
  constructor(t, n, r) {
    super(), this.progressDifferentialDownloadInfo = t, this.cancellationToken = n, this.onProgress = r, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = nn.COPY, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, n, r) {
    if (this.cancellationToken.cancelled) {
      r(new Error("cancelled"), null);
      return;
    }
    if (this.operationType == nn.COPY) {
      r(null, t);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), r(null, t);
  }
  beginFileCopy() {
    this.operationType = nn.COPY;
  }
  beginRangeDownload() {
    this.operationType = nn.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
  }
  endRangeDownload() {
    this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    });
  }
  // Called when we are 100% done with the connection/download
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, this.transferred = 0, t(null);
  }
}
yi.ProgressDifferentialDownloadCallbackTransform = V_;
Object.defineProperty(rr, "__esModule", { value: !0 });
rr.DifferentialDownloader = void 0;
const Tn = fe, to = St, W_ = At, Y_ = pn, z_ = Tt, Ir = Gt, ll = Ei, X_ = yi;
class K_ {
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(t, n, r) {
    this.blockAwareFileInfo = t, this.httpExecutor = n, this.options = r, this.fileMetadataBuffer = null, this.logger = r.logger;
  }
  createRequestOptions() {
    const t = {
      headers: {
        ...this.options.requestHeaders,
        accept: "*/*"
      }
    };
    return (0, Tn.configureRequestUrl)(this.options.newUrl, t), (0, Tn.configureRequestOptions)(t), t;
  }
  doDownload(t, n) {
    if (t.version !== n.version)
      throw new Error(`version is different (${t.version} - ${n.version}), full download is required`);
    const r = this.logger, i = (0, Ir.computeOperations)(t, n, r);
    r.debug != null && r.debug(JSON.stringify(i, null, 2));
    let o = 0, s = 0;
    for (const c of i) {
      const m = c.end - c.start;
      c.kind === Ir.OperationKind.DOWNLOAD ? o += m : s += m;
    }
    const a = this.blockAwareFileInfo.size;
    if (o + s + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== a)
      throw new Error(`Internal error, size mismatch: downloadSize: ${o}, copySize: ${s}, newSize: ${a}`);
    return r.info(`Full: ${cl(a)}, To download: ${cl(o)} (${Math.round(o / (a / 100))}%)`), this.downloadFile(i);
  }
  downloadFile(t) {
    const n = [], r = () => Promise.all(n.map((i) => (0, to.close)(i.descriptor).catch((o) => {
      this.logger.error(`cannot close file "${i.path}": ${o}`);
    })));
    return this.doDownloadFile(t, n).then(r).catch((i) => r().catch((o) => {
      try {
        this.logger.error(`cannot close files: ${o}`);
      } catch (s) {
        try {
          console.error(s);
        } catch {
        }
      }
      throw i;
    }).then(() => {
      throw i;
    }));
  }
  async doDownloadFile(t, n) {
    const r = await (0, to.open)(this.options.oldFile, "r");
    n.push({ descriptor: r, path: this.options.oldFile });
    const i = await (0, to.open)(this.options.newFile, "w");
    n.push({ descriptor: i, path: this.options.newFile });
    const o = (0, W_.createWriteStream)(this.options.newFile, { fd: i });
    await new Promise((s, a) => {
      const c = [];
      let m;
      if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
        const T = [];
        let R = 0;
        for (const x of t)
          x.kind === Ir.OperationKind.DOWNLOAD && (T.push(x.end - x.start), R += x.end - x.start);
        const N = {
          expectedByteCounts: T,
          grandTotal: R
        };
        m = new X_.ProgressDifferentialDownloadCallbackTransform(N, this.options.cancellationToken, this.options.onProgress), c.push(m);
      }
      const l = new Tn.DigestTransform(this.blockAwareFileInfo.sha512);
      l.isValidateOnEnd = !1, c.push(l), o.on("finish", () => {
        o.close(() => {
          n.splice(1, 1);
          try {
            l.validate();
          } catch (T) {
            a(T);
            return;
          }
          s(void 0);
        });
      }), c.push(o);
      let f = null;
      for (const T of c)
        T.on("error", a), f == null ? f = T : f = f.pipe(T);
      const h = c[0];
      let g;
      if (this.options.isUseMultipleRangeRequest) {
        g = (0, ll.executeTasksUsingMultipleRangeRequests)(this, t, h, r, a), g(0);
        return;
      }
      let w = 0, y = null;
      this.logger.info(`Differential download: ${this.options.newUrl}`);
      const A = this.createRequestOptions();
      A.redirect = "manual", g = (T) => {
        var R, N;
        if (T >= t.length) {
          this.fileMetadataBuffer != null && h.write(this.fileMetadataBuffer), h.end();
          return;
        }
        const x = t[T++];
        if (x.kind === Ir.OperationKind.COPY) {
          m && m.beginFileCopy(), (0, Y_.copyData)(x, h, r, a, () => g(T));
          return;
        }
        const ee = `bytes=${x.start}-${x.end - 1}`;
        A.headers.range = ee, (N = (R = this.logger) === null || R === void 0 ? void 0 : R.debug) === null || N === void 0 || N.call(R, `download range: ${ee}`), m && m.beginRangeDownload();
        const se = this.httpExecutor.createRequest(A, (W) => {
          W.on("error", a), W.on("aborted", () => {
            a(new Error("response has been aborted by the server"));
          }), W.statusCode >= 400 && a((0, Tn.createHttpError)(W)), W.pipe(h, {
            end: !1
          }), W.once("end", () => {
            m && m.endRangeDownload(), ++w === 100 ? (w = 0, setTimeout(() => g(T), 1e3)) : g(T);
          });
        });
        se.on("redirect", (W, Fe, E) => {
          this.logger.info(`Redirect to ${J_(E)}`), y = E, (0, Tn.configureRequestUrl)(new z_.URL(y), A), se.followRedirect();
        }), this.httpExecutor.addErrorAndTimeoutHandlers(se, a), se.end();
      }, g(0);
    });
  }
  async readRemoteBytes(t, n) {
    const r = Buffer.allocUnsafe(n + 1 - t), i = this.createRequestOptions();
    i.headers.range = `bytes=${t}-${n}`;
    let o = 0;
    if (await this.request(i, (s) => {
      s.copy(r, o), o += s.length;
    }), o !== r.length)
      throw new Error(`Received data length ${o} is not equal to expected ${r.length}`);
    return r;
  }
  request(t, n) {
    return new Promise((r, i) => {
      const o = this.httpExecutor.createRequest(t, (s) => {
        (0, ll.checkIsRangesSupported)(s, i) && (s.on("error", i), s.on("aborted", () => {
          i(new Error("response has been aborted by the server"));
        }), s.on("data", n), s.on("end", () => r()));
      });
      this.httpExecutor.addErrorAndTimeoutHandlers(o, i), o.end();
    });
  }
}
rr.DifferentialDownloader = K_;
function cl(e, t = " KB") {
  return new Intl.NumberFormat("en").format((e / 1024).toFixed(2)) + t;
}
function J_(e) {
  const t = e.indexOf("?");
  return t < 0 ? e : e.substring(0, t);
}
Object.defineProperty(gi, "__esModule", { value: !0 });
gi.GenericDifferentialDownloader = void 0;
const Q_ = rr;
class Z_ extends Q_.DifferentialDownloader {
  download(t, n) {
    return this.doDownload(t, n);
  }
}
gi.GenericDifferentialDownloader = Z_;
var bt = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = r;
  const t = fe;
  Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
  class n {
    constructor(o) {
      this.emitter = o;
    }
    /**
     * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
     */
    login(o) {
      r(this.emitter, "login", o);
    }
    progress(o) {
      r(this.emitter, e.DOWNLOAD_PROGRESS, o);
    }
    updateDownloaded(o) {
      r(this.emitter, e.UPDATE_DOWNLOADED, o);
    }
    updateCancelled(o) {
      r(this.emitter, "update-cancelled", o);
    }
  }
  e.UpdaterSignal = n;
  function r(i, o, s) {
    i.on(o, s);
  }
})(bt);
Object.defineProperty(yt, "__esModule", { value: !0 });
yt.NoOpLogger = yt.AppUpdater = void 0;
const Se = fe, ev = Yn, tv = Xr, nv = Il, je = St, rv = we, no = ii, ke = te, Nt = ku, ul = tr, iv = ui, fl = Mu, ov = nr, ro = fi, io = Nl, sv = gi, Yt = bt;
class is extends nv.EventEmitter {
  /**
   * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
   */
  get channel() {
    return this._channel;
  }
  /**
   * Set the update channel. Overrides `channel` in the update configuration.
   *
   * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
   */
  set channel(t) {
    if (this._channel != null) {
      if (typeof t != "string")
        throw (0, Se.newError)(`Channel must be a string, but got: ${t}`, "ERR_UPDATER_INVALID_CHANNEL");
      if (t.length === 0)
        throw (0, Se.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
    }
    this._channel = t, this.allowDowngrade = !0;
  }
  /**
   *  Shortcut for explicitly adding auth tokens to request headers
   */
  addAuthHeader(t) {
    this.requestHeaders = Object.assign({}, this.requestHeaders, {
      authorization: t
    });
  }
  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  get netSession() {
    return (0, fl.getNetSession)();
  }
  /**
   * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
   * Set it to `null` if you would like to disable a logging feature.
   */
  get logger() {
    return this._logger;
  }
  set logger(t) {
    this._logger = t ?? new zu();
  }
  // noinspection JSUnusedGlobalSymbols
  /**
   * test only
   * @private
   */
  set updateConfigPath(t) {
    this.clientPromise = null, this._appUpdateConfigPath = t, this.configOnDisk = new no.Lazy(() => this.loadUpdateConfig());
  }
  /**
   * Allows developer to override default logic for determining if an update is supported.
   * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
   */
  get isUpdateSupported() {
    return this._isUpdateSupported;
  }
  set isUpdateSupported(t) {
    t && (this._isUpdateSupported = t);
  }
  /**
   * Allows developer to override default logic for determining if the user is below the rollout threshold.
   * The default logic compares the staging percentage with numerical representation of user ID.
   * An override can define custom logic, or bypass it if needed.
   */
  get isUserWithinRollout() {
    return this._isUserWithinRollout;
  }
  set isUserWithinRollout(t) {
    t && (this._isUserWithinRollout = t);
  }
  constructor(t, n) {
    super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new Yt.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (o) => this.checkIfUpdateSupported(o), this._isUserWithinRollout = (o) => this.isStagingMatch(o), this.clientPromise = null, this.stagingUserIdPromise = new no.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new no.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (o) => {
      this._logger.error(`Error: ${o.stack || o.message}`);
    }), n == null ? (this.app = new iv.ElectronAppAdapter(), this.httpExecutor = new fl.ElectronHttpExecutor((o, s) => this.emit("login", o, s))) : (this.app = n, this.httpExecutor = null);
    const r = this.app.version, i = (0, Nt.parse)(r);
    if (i == null)
      throw (0, Se.newError)(`App version is not a valid semver version: "${r}"`, "ERR_UPDATER_INVALID_VERSION");
    this.currentVersion = i, this.allowPrerelease = av(i), t != null && (this.setFeedURL(t), typeof t != "string" && t.requestHeaders && (this.requestHeaders = t.requestHeaders));
  }
  //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  getFeedURL() {
    return "Deprecated. Do not use it.";
  }
  /**
   * Configure update provider. If value is `string`, [GenericServerOptions](https://www.electron.build/publish#genericserveroptions) will be set with value as `url`.
   * @param options If you want to override configuration in the `app-update.yml`.
   */
  setFeedURL(t) {
    const n = this.createProviderRuntimeOptions();
    let r;
    typeof t == "string" ? r = new ov.GenericProvider({ provider: "generic", url: t }, this, {
      ...n,
      isUseMultipleRangeRequest: (0, ro.isUrlProbablySupportMultiRangeRequests)(t)
    }) : r = (0, ro.createClient)(t, this, n), this.clientPromise = Promise.resolve(r);
  }
  /**
   * Asks the server whether there is an update.
   * @returns null if the updater is disabled, otherwise info about the latest version
   */
  checkForUpdates() {
    if (!this.isUpdaterActive())
      return Promise.resolve(null);
    let t = this.checkForUpdatesPromise;
    if (t != null)
      return this._logger.info("Checking for update (already in progress)"), t;
    const n = () => this.checkForUpdatesPromise = null;
    return this._logger.info("Checking for update"), t = this.doCheckForUpdates().then((r) => (n(), r)).catch((r) => {
      throw n(), this.emit("error", r, `Cannot check for updates: ${(r.stack || r).toString()}`), r;
    }), this.checkForUpdatesPromise = t, t;
  }
  isUpdaterActive() {
    return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
  }
  // noinspection JSUnusedGlobalSymbols
  checkForUpdatesAndNotify(t) {
    return this.checkForUpdates().then((n) => n != null && n.downloadPromise ? (n.downloadPromise.then(() => {
      const r = is.formatDownloadNotification(n.updateInfo.version, this.app.name, t);
      new Ut.Notification(r).show();
    }), n) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), n));
  }
  static formatDownloadNotification(t, n, r) {
    return r == null && (r = {
      title: "A new update is ready to install",
      body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
    }), r = {
      title: r.title.replace("{appName}", n).replace("{version}", t),
      body: r.body.replace("{appName}", n).replace("{version}", t)
    }, r;
  }
  async isStagingMatch(t) {
    const n = t.stagingPercentage;
    let r = n;
    if (r == null)
      return !0;
    if (r = parseInt(r, 10), isNaN(r))
      return this._logger.warn(`Staging percentage is NaN: ${n}`), !0;
    r = r / 100;
    const i = await this.stagingUserIdPromise.value, s = Se.UUID.parse(i).readUInt32BE(12) / 4294967295;
    return this._logger.info(`Staging percentage: ${r}, percentage: ${s}, user id: ${i}`), s < r;
  }
  computeFinalHeaders(t) {
    return this.requestHeaders != null && Object.assign(t, this.requestHeaders), t;
  }
  async isUpdateAvailable(t) {
    const n = (0, Nt.parse)(t.version);
    if (n == null)
      throw (0, Se.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${t.version}"`, "ERR_UPDATER_INVALID_VERSION");
    const r = this.currentVersion;
    if ((0, Nt.eq)(n, r) || !await Promise.resolve(this.isUpdateSupported(t)) || !await Promise.resolve(this.isUserWithinRollout(t)))
      return !1;
    const o = (0, Nt.gt)(n, r), s = (0, Nt.lt)(n, r);
    return o ? !0 : this.allowDowngrade && s;
  }
  checkIfUpdateSupported(t) {
    const n = t == null ? void 0 : t.minimumSystemVersion, r = (0, tv.release)();
    if (n)
      try {
        if ((0, Nt.lt)(r, n))
          return this._logger.info(`Current OS version ${r} is less than the minimum OS version required ${n} for version ${r}`), !1;
      } catch (i) {
        this._logger.warn(`Failed to compare current OS version(${r}) with minimum OS version(${n}): ${(i.message || i).toString()}`);
      }
    return !0;
  }
  async getUpdateInfoAndProvider() {
    await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((r) => (0, ro.createClient)(r, this, this.createProviderRuntimeOptions())));
    const t = await this.clientPromise, n = await this.stagingUserIdPromise.value;
    return t.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": n })), {
      info: await t.getLatestVersion(),
      provider: t
    };
  }
  createProviderRuntimeOptions() {
    return {
      isUseMultipleRangeRequest: !0,
      platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
      executor: this.httpExecutor
    };
  }
  async doCheckForUpdates() {
    this.emit("checking-for-update");
    const t = await this.getUpdateInfoAndProvider(), n = t.info;
    if (!await this.isUpdateAvailable(n))
      return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${n.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", n), {
        isUpdateAvailable: !1,
        versionInfo: n,
        updateInfo: n
      };
    this.updateInfoAndProvider = t, this.onUpdateAvailable(n);
    const r = new Se.CancellationToken();
    return {
      isUpdateAvailable: !0,
      versionInfo: n,
      updateInfo: n,
      cancellationToken: r,
      downloadPromise: this.autoDownload ? this.downloadUpdate(r) : null
    };
  }
  onUpdateAvailable(t) {
    this._logger.info(`Found version ${t.version} (url: ${(0, Se.asArray)(t.files).map((n) => n.url).join(", ")})`), this.emit("update-available", t);
  }
  /**
   * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
   * @returns {Promise<Array<string>>} Paths to downloaded files.
   */
  downloadUpdate(t = new Se.CancellationToken()) {
    const n = this.updateInfoAndProvider;
    if (n == null) {
      const i = new Error("Please check update first");
      return this.dispatchError(i), Promise.reject(i);
    }
    if (this.downloadPromise != null)
      return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
    this._logger.info(`Downloading update from ${(0, Se.asArray)(n.info.files).map((i) => i.url).join(", ")}`);
    const r = (i) => {
      if (!(i instanceof Se.CancellationError))
        try {
          this.dispatchError(i);
        } catch (o) {
          this._logger.warn(`Cannot dispatch error event: ${o.stack || o}`);
        }
      return i;
    };
    return this.downloadPromise = this.doDownloadUpdate({
      updateInfoAndProvider: n,
      requestHeaders: this.computeRequestHeaders(n.provider),
      cancellationToken: t,
      disableWebInstaller: this.disableWebInstaller,
      disableDifferentialDownload: this.disableDifferentialDownload
    }).catch((i) => {
      throw r(i);
    }).finally(() => {
      this.downloadPromise = null;
    }), this.downloadPromise;
  }
  dispatchError(t) {
    this.emit("error", t, (t.stack || t).toString());
  }
  dispatchUpdateDownloaded(t) {
    this.emit(Yt.UPDATE_DOWNLOADED, t);
  }
  async loadUpdateConfig() {
    return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, rv.load)(await (0, je.readFile)(this._appUpdateConfigPath, "utf-8"));
  }
  computeRequestHeaders(t) {
    const n = t.fileExtraDownloadHeaders;
    if (n != null) {
      const r = this.requestHeaders;
      return r == null ? n : {
        ...n,
        ...r
      };
    }
    return this.computeFinalHeaders({ accept: "*/*" });
  }
  async getOrCreateStagingUserId() {
    const t = ke.join(this.app.userDataPath, ".updaterId");
    try {
      const r = await (0, je.readFile)(t, "utf-8");
      if (Se.UUID.check(r))
        return r;
      this._logger.warn(`Staging user id file exists, but content was invalid: ${r}`);
    } catch (r) {
      r.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${r}`);
    }
    const n = Se.UUID.v5((0, ev.randomBytes)(4096), Se.UUID.OID);
    this._logger.info(`Generated new staging user ID: ${n}`);
    try {
      await (0, je.outputFile)(t, n);
    } catch (r) {
      this._logger.warn(`Couldn't write out staging user ID: ${r}`);
    }
    return n;
  }
  /** @internal */
  get isAddNoCacheQuery() {
    const t = this.requestHeaders;
    if (t == null)
      return !0;
    for (const n of Object.keys(t)) {
      const r = n.toLowerCase();
      if (r === "authorization" || r === "private-token")
        return !1;
    }
    return !0;
  }
  async getOrCreateDownloadHelper() {
    let t = this.downloadedUpdateHelper;
    if (t == null) {
      const n = (await this.configOnDisk.value).updaterCacheDirName, r = this._logger;
      n == null && r.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
      const i = ke.join(this.app.baseCachePath, n || this.app.name);
      r.debug != null && r.debug(`updater cache dir: ${i}`), t = new ul.DownloadedUpdateHelper(i), this.downloadedUpdateHelper = t;
    }
    return t;
  }
  async executeDownload(t) {
    const n = t.fileInfo, r = {
      headers: t.downloadUpdateOptions.requestHeaders,
      cancellationToken: t.downloadUpdateOptions.cancellationToken,
      sha2: n.info.sha2,
      sha512: n.info.sha512
    };
    this.listenerCount(Yt.DOWNLOAD_PROGRESS) > 0 && (r.onProgress = (R) => this.emit(Yt.DOWNLOAD_PROGRESS, R));
    const i = t.downloadUpdateOptions.updateInfoAndProvider.info, o = i.version, s = n.packageInfo;
    function a() {
      const R = decodeURIComponent(t.fileInfo.url.pathname);
      return R.toLowerCase().endsWith(`.${t.fileExtension.toLowerCase()}`) ? ke.basename(R) : ke.basename(t.fileInfo.info.url);
    }
    const c = await this.getOrCreateDownloadHelper(), m = c.cacheDirForPendingUpdate;
    await (0, je.mkdir)(m, { recursive: !0 });
    const l = a();
    let f = ke.join(m, l);
    const h = s == null ? null : ke.join(m, `package-${o}${ke.extname(s.path) || ".7z"}`), g = async (R) => {
      await c.setDownloadedFile(f, h, i, n, l, R), await t.done({
        ...i,
        downloadedFile: f
      });
      const N = ke.join(m, "current.blockmap");
      return await (0, je.pathExists)(N) && await (0, je.copyFile)(N, ke.join(c.cacheDir, "current.blockmap")), h == null ? [f] : [f, h];
    }, w = this._logger, y = await c.validateDownloadedPath(f, i, n, w);
    if (y != null)
      return f = y, await g(!1);
    const A = async () => (await c.clear().catch(() => {
    }), await (0, je.unlink)(f).catch(() => {
    })), T = await (0, ul.createTempUpdateFile)(`temp-${l}`, m, w);
    try {
      await t.task(T, r, h, A), await (0, Se.retry)(() => (0, je.rename)(T, f), {
        retries: 60,
        interval: 500,
        shouldRetry: (R) => R instanceof Error && /^EBUSY:/.test(R.message) ? !0 : (w.warn(`Cannot rename temp file to final file: ${R.message || R.stack}`), !1)
      });
    } catch (R) {
      throw await A(), R instanceof Se.CancellationError && (w.info("cancelled"), this.emit("update-cancelled", i)), R;
    }
    return w.info(`New version ${o} has been downloaded to ${f}`), await g(!0);
  }
  async differentialDownloadInstaller(t, n, r, i, o) {
    try {
      if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
        return !0;
      const s = n.updateInfoAndProvider.provider, a = await s.getBlockMapFiles(t.url, this.app.version, n.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
      this._logger.info(`Download block maps (old: "${a[0]}", new: ${a[1]})`);
      const c = async (w) => {
        const y = await this.httpExecutor.downloadToBuffer(w, {
          headers: n.requestHeaders,
          cancellationToken: n.cancellationToken
        });
        if (y == null || y.length === 0)
          throw new Error(`Blockmap "${w.href}" is empty`);
        try {
          return JSON.parse((0, io.gunzipSync)(y).toString());
        } catch (A) {
          throw new Error(`Cannot parse blockmap "${w.href}", error: ${A}`);
        }
      }, m = {
        newUrl: t.url,
        oldFile: ke.join(this.downloadedUpdateHelper.cacheDir, o),
        logger: this._logger,
        newFile: r,
        isUseMultipleRangeRequest: s.isUseMultipleRangeRequest,
        requestHeaders: n.requestHeaders,
        cancellationToken: n.cancellationToken
      };
      this.listenerCount(Yt.DOWNLOAD_PROGRESS) > 0 && (m.onProgress = (w) => this.emit(Yt.DOWNLOAD_PROGRESS, w));
      const l = async (w, y) => {
        const A = ke.join(y, "current.blockmap");
        await (0, je.outputFile)(A, (0, io.gzipSync)(JSON.stringify(w)));
      }, f = async (w) => {
        const y = ke.join(w, "current.blockmap");
        try {
          if (await (0, je.pathExists)(y))
            return JSON.parse((0, io.gunzipSync)(await (0, je.readFile)(y)).toString());
        } catch (A) {
          this._logger.warn(`Cannot parse blockmap "${y}", error: ${A}`);
        }
        return null;
      }, h = await c(a[1]);
      await l(h, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
      let g = await f(this.downloadedUpdateHelper.cacheDir);
      return g == null && (g = await c(a[0])), await new sv.GenericDifferentialDownloader(t.info, this.httpExecutor, m).download(g, h), !1;
    } catch (s) {
      if (this._logger.error(`Cannot download differentially, fallback to full download: ${s.stack || s}`), this._testOnlyOptions != null)
        throw s;
      return !0;
    }
  }
}
yt.AppUpdater = is;
function av(e) {
  const t = (0, Nt.prerelease)(e);
  return t != null && t.length > 0;
}
class zu {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  info(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(t) {
  }
}
yt.NoOpLogger = zu;
Object.defineProperty(jt, "__esModule", { value: !0 });
jt.BaseUpdater = void 0;
const dl = zr, oo = te, lv = yt;
class cv extends lv.AppUpdater {
  constructor(t, n) {
    super(t, n), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
  }
  quitAndInstall(t = !1, n = !1) {
    this._logger.info("Install on explicit quitAndInstall"), this.install(t, t ? n : this.autoRunAppAfterInstall) ? setImmediate(() => {
      Ut.autoUpdater.emit("before-quit-for-update"), this.app.quit();
    }) : this.quitAndInstallCalled = !1;
  }
  executeDownload(t) {
    return super.executeDownload({
      ...t,
      done: (n) => (this.dispatchUpdateDownloaded(n), this.addQuitHandler(), Promise.resolve())
    });
  }
  get installerPath() {
    return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
  }
  // must be sync (because quit even handler is not async)
  install(t = !1, n = !1) {
    if (this.quitAndInstallCalled)
      return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
    const r = this.downloadedUpdateHelper, i = this.installerPath, o = r == null ? null : r.downloadedFileInfo;
    if (i == null || o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    this.quitAndInstallCalled = !0;
    try {
      return this._logger.info(`Install: isSilent: ${t}, isForceRunAfter: ${n}`), this.doInstall({
        isSilent: t,
        isForceRunAfter: n,
        isAdminRightsRequired: o.isAdminRightsRequired
      });
    } catch (s) {
      return this.dispatchError(s), !1;
    }
  }
  addQuitHandler() {
    this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((t) => {
      if (this.quitAndInstallCalled) {
        this._logger.info("Update installer has already been triggered. Quitting application.");
        return;
      }
      if (!this.autoInstallOnAppQuit) {
        this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
        return;
      }
      if (t !== 0) {
        this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${t}`);
        return;
      }
      this._logger.info("Auto install update on quit"), this.install(!0, !1);
    }));
  }
  /**
   * Strips relative-path entries from a PATH string.
   * Prevents PATH-poisoning where a writable directory earlier in PATH shadows
   * a trusted package manager binary.
   */
  sanitizeEnvPath(t) {
    return t.split(oo.delimiter).filter((n) => oo.isAbsolute(n)).join(oo.delimiter);
  }
  spawnSyncLog(t, n = [], r = {}) {
    var i;
    this._logger.info(`Executing: ${t} with args: ${n}`);
    const o = { ...process.env, ...r }, s = (0, dl.spawnSync)(t, n, {
      env: { ...o, PATH: this.sanitizeEnvPath((i = o.PATH) !== null && i !== void 0 ? i : "") },
      encoding: "utf-8",
      shell: !0
    }), { error: a, status: c, stdout: m, stderr: l } = s;
    if (a != null)
      throw this._logger.error(l), a;
    if (c != null && c !== 0)
      throw this._logger.error(l), new Error(`Command ${t} exited with code ${c}`);
    return m.trim();
  }
  /**
   * This handles both node 8 and node 10 way of emitting error when spawning a process
   *   - node 8: Throws the error
   *   - node 10: Emit the error(Need to listen with on)
   */
  // https://github.com/electron-userland/electron-builder/issues/1129
  // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
  async spawnLog(t, n = [], r = void 0, i = "ignore") {
    return this._logger.info(`Executing: ${t} with args: ${n}`), new Promise((o, s) => {
      try {
        const a = { stdio: i, env: r, detached: !0 }, c = (0, dl.spawn)(t, n, a);
        c.on("error", (m) => {
          s(m);
        }), c.unref(), c.pid !== void 0 && o(!0);
      } catch (a) {
        s(a);
      }
    });
  }
}
jt.BaseUpdater = cv;
var Bn = {}, ir = {};
Object.defineProperty(ir, "__esModule", { value: !0 });
ir.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
const zt = St, uv = rr, fv = Nl;
class dv extends uv.DifferentialDownloader {
  async download() {
    const t = this.blockAwareFileInfo, n = t.size, r = n - (t.blockMapSize + 4);
    this.fileMetadataBuffer = await this.readRemoteBytes(r, n - 1);
    const i = Xu(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
    await this.doDownload(await hv(this.options.oldFile), i);
  }
}
ir.FileWithEmbeddedBlockMapDifferentialDownloader = dv;
function Xu(e) {
  return JSON.parse((0, fv.inflateRawSync)(e).toString());
}
async function hv(e) {
  const t = await (0, zt.open)(e, "r");
  try {
    const n = (await (0, zt.fstat)(t)).size, r = Buffer.allocUnsafe(4);
    await (0, zt.read)(t, r, 0, r.length, n - r.length);
    const i = Buffer.allocUnsafe(r.readUInt32BE(0));
    return await (0, zt.read)(t, i, 0, i.length, n - r.length - i.length), await (0, zt.close)(t), Xu(i);
  } catch (n) {
    throw await (0, zt.close)(t), n;
  }
}
Object.defineProperty(Bn, "__esModule", { value: !0 });
Bn.AppImageUpdater = void 0;
const so = fe, hl = zr, pv = St, mv = At, Xt = te, gv = jt, Ev = ir, yv = le, pl = bt;
class wv extends gv.BaseUpdater {
  constructor(t, n) {
    super(t, n);
  }
  isUpdaterActive() {
    return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
  }
  /*** @private */
  doDownloadUpdate(t) {
    const n = t.updateInfoAndProvider.provider, r = (0, yv.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "AppImage",
      fileInfo: r,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        const s = process.env.APPIMAGE;
        if (s == null)
          throw (0, so.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
        (t.disableDifferentialDownload || await this.downloadDifferential(r, s, i, n, t)) && await this.httpExecutor.download(r.url, i, o), await (0, pv.chmod)(i, 493);
      }
    });
  }
  async downloadDifferential(t, n, r, i, o) {
    try {
      const s = {
        newUrl: t.url,
        oldFile: n,
        logger: this._logger,
        newFile: r,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        requestHeaders: o.requestHeaders,
        cancellationToken: o.cancellationToken
      };
      return this.listenerCount(pl.DOWNLOAD_PROGRESS) > 0 && (s.onProgress = (a) => this.emit(pl.DOWNLOAD_PROGRESS, a)), await new Ev.FileWithEmbeddedBlockMapDifferentialDownloader(t.info, this.httpExecutor, s).download(), !1;
    } catch (s) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${s.stack || s}`), process.platform === "linux";
    }
  }
  doInstall(t) {
    const n = process.env.APPIMAGE;
    if (n == null)
      throw (0, so.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    if (!Xt.isAbsolute(n) || n.includes("\0"))
      throw (0, so.newError)(`APPIMAGE env is not a valid absolute path: "${n}"`, "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    (0, mv.unlinkSync)(n);
    let r;
    const i = Xt.basename(n), o = this.installerPath;
    if (o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    Xt.basename(o) === i || !/\d+\.\d+\.\d+/.test(i) ? r = n : r = Xt.join(Xt.dirname(n), Xt.basename(o)), (0, hl.execFileSync)("mv", ["-f", o, r]), r !== n && this.emit("appimage-filename-updated", r);
    const s = {
      ...process.env,
      APPIMAGE_SILENT_INSTALL: "true"
    };
    return t.isForceRunAfter ? this.spawnLog(r, [], s) : (s.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, hl.execFileSync)(r, [], { env: s })), !0;
  }
}
Bn.AppImageUpdater = wv;
var jn = {}, mn = {};
Object.defineProperty(mn, "__esModule", { value: !0 });
mn.LinuxUpdater = void 0;
const _v = jt, vv = /^[a-zA-Z0-9_-]+$/;
class Av extends _v.BaseUpdater {
  constructor(t, n) {
    super(t, n);
  }
  /**
   * Returns true if the current process is running as root.
   */
  isRunningAsRoot() {
    var t;
    return ((t = process.getuid) === null || t === void 0 ? void 0 : t.call(process)) === 0;
  }
  /**
   * Sanitizes the installer path for use with shell:true spawn calls.
   * Backslash-escapes metacharacters that have special meaning in POSIX shell.
   * Note: paths containing single-quotes (') are not supported.
   */
  get installerPath() {
    const t = super.installerPath;
    return t == null ? null : t.replace(/\\/g, "\\\\").replace(/([`$!" ;|&()<>])/g, "\\$1").replace(/[\n\r]/g, "");
  }
  runCommandWithSudoIfNeeded(t) {
    if (this.isRunningAsRoot())
      return this._logger.info("Running as root, no need to use sudo"), this.spawnSyncLog(t[0], t.slice(1));
    const { name: n } = this.app, i = `"${n.replace(/["`$\\!\n\r;|&<>(){}*?[\]#~]/g, "")} would like to update"`, o = this.sudoWithArgs(i);
    this._logger.info(`Running as non-root user, using sudo to install: ${o}`);
    let s = '"';
    return (/pkexec/i.test(o[0]) || o[0] === "sudo") && (s = ""), this.spawnSyncLog(o[0], [...o.length > 1 ? o.slice(1) : [], `${s}/bin/bash`, "-c", `'${t.join(" ")}'${s}`]);
  }
  sudoWithArgs(t) {
    const n = this.determineSudoCommand(), r = [n];
    return /kdesudo/i.test(n) ? (r.push("--comment", t), r.push("-c")) : /gksudo/i.test(n) ? r.push("--message", t) : /pkexec/i.test(n) && r.push("--disable-internal-agent"), r;
  }
  hasCommand(t) {
    try {
      return this.spawnSyncLog("command", ["-v", t]), !0;
    } catch {
      return !1;
    }
  }
  determineSudoCommand() {
    const t = ["gksudo", "kdesudo", "pkexec", "beesu"];
    for (const n of t)
      if (this.hasCommand(n))
        return n;
    return "sudo";
  }
  /**
   * Detects the package manager to use based on the available commands.
   * Allows overriding the default behavior by setting the ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER environment variable.
   * If the environment variable is set, it will be used directly. (This is useful for testing each package manager logic path.)
   * Otherwise, it checks for the presence of the specified package manager commands in the order provided.
   * @param pms - An array of package manager commands to check for, in priority order.
   * @returns The detected package manager command or "unknown" if none are found.
   */
  detectPackageManager(t) {
    var n;
    let r = t;
    const i = (n = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || n === void 0 ? void 0 : n.trim();
    i && (vv.test(i) ? r = [i] : this._logger.warn(`ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER "${i}" contains unsafe characters. Ignoring override.`));
    for (const a of r)
      if (this.hasCommand(a))
        return a;
    const o = i ? `ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER override "${i}", ` : "", s = t[0];
    return this._logger.warn(`No package manager found in the list: ${o}${t.join(", ")}. Utilizing default: ${s}`), s;
  }
}
mn.LinuxUpdater = Av;
Object.defineProperty(jn, "__esModule", { value: !0 });
jn.DebUpdater = void 0;
const Tv = le, ml = bt, Sv = mn;
class os extends Sv.LinuxUpdater {
  constructor(t, n) {
    super(t, n);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const n = t.updateInfoAndProvider.provider, r = (0, Tv.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
    return this.executeDownload({
      fileExtension: "deb",
      fileInfo: r,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(ml.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(ml.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(r.url, i, o);
      }
    });
  }
  doInstall(t) {
    const n = this.installerPath;
    if (n == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
      return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
    const r = ["dpkg", "apt"], i = this.detectPackageManager(r);
    try {
      os.installWithCommandRunner(i, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, n, r, i) {
    var o;
    if (t === "dpkg")
      try {
        r(["dpkg", "-i", n]);
      } catch (s) {
        i.warn((o = s.message) !== null && o !== void 0 ? o : s), i.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), r(["apt-get", "install", "-f", "-y"]);
      }
    else if (t === "apt")
      i.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), r([
        "apt",
        "install",
        "-y",
        "--allow-unauthenticated",
        // needed for unsigned .debs
        "--allow-downgrades",
        // allow lower version installs
        "--allow-change-held-packages",
        n
      ]);
    else
      throw new Error(`Package manager ${t} not supported`);
  }
}
jn.DebUpdater = os;
var Hn = {};
Object.defineProperty(Hn, "__esModule", { value: !0 });
Hn.PacmanUpdater = void 0;
const gl = bt, bv = le, Cv = mn;
class ss extends Cv.LinuxUpdater {
  constructor(t, n) {
    super(t, n);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const n = t.updateInfoAndProvider.provider, r = (0, bv.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
    return this.executeDownload({
      fileExtension: "pacman",
      fileInfo: r,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(gl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(gl.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(r.url, i, o);
      }
    });
  }
  doInstall(t) {
    const n = this.installerPath;
    if (n == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    try {
      ss.installWithCommandRunner(n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (r) {
      return this.dispatchError(r), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, n, r) {
    var i;
    try {
      n(["pacman", "-U", "--noconfirm", t]);
    } catch (o) {
      r.warn((i = o.message) !== null && i !== void 0 ? i : o), r.warn("pacman installation failed, attempting to update package database and retry");
      try {
        n(["pacman", "-Sy", "--noconfirm"]), n(["pacman", "-U", "--noconfirm", t]);
      } catch (s) {
        throw r.error("Retry after pacman -Sy failed"), s;
      }
    }
  }
}
Hn.PacmanUpdater = ss;
var Gn = {};
Object.defineProperty(Gn, "__esModule", { value: !0 });
Gn.RpmUpdater = void 0;
const El = bt, $v = le, Rv = mn;
class as extends Rv.LinuxUpdater {
  constructor(t, n) {
    super(t, n);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const n = t.updateInfoAndProvider.provider, r = (0, $v.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "rpm",
      fileInfo: r,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(El.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(El.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(r.url, i, o);
      }
    });
  }
  doInstall(t) {
    const n = this.installerPath;
    if (n == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const r = ["zypper", "dnf", "yum", "rpm"], i = this.detectPackageManager(r);
    try {
      as.installWithCommandRunner(i, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, n, r, i) {
    if (t === "zypper")
      return r(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", n]);
    if (t === "dnf")
      return r(["dnf", "install", "--nogpgcheck", "-y", n]);
    if (t === "yum")
      return r(["yum", "install", "--nogpgcheck", "-y", n]);
    if (t === "rpm")
      return i.warn("Installing with rpm only (no dependency resolution)."), r(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", n]);
    throw new Error(`Package manager ${t} not supported`);
  }
}
Gn.RpmUpdater = as;
var qn = {};
Object.defineProperty(qn, "__esModule", { value: !0 });
qn.MacUpdater = void 0;
const yl = fe, ao = St, Ov = At, wl = te, Iv = ld, Pv = yt, Nv = le, _l = zr, vl = Yn;
class ls extends Pv.AppUpdater {
  constructor(t, n) {
    super(t, n), this.nativeUpdater = Ut.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (r) => {
      this._logger.warn(r), this.emit("error", r);
    }), this.nativeUpdater.on("update-downloaded", () => {
      this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
    });
  }
  /** Filters update files to the appropriate architecture.
   * On arm64 Macs (including Rosetta), arm64 files are preferred when available.
   * On x64 Macs, arm64 files are excluded. */
  static filterFilesForArch(t, n) {
    const r = (i) => {
      var o;
      return i.url.pathname.includes("arm64") || ((o = i.info.url) === null || o === void 0 ? void 0 : o.includes("arm64"));
    };
    return n && t.some(r) ? t.filter((i) => n === r(i)) : t.filter((i) => !r(i));
  }
  debug(t) {
    this._logger.debug != null && this._logger.debug(t);
  }
  closeServerIfExists() {
    this.server && (this.debug("Closing proxy server"), this.server.close((t) => {
      t && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
    }));
  }
  async doDownloadUpdate(t) {
    let n = t.updateInfoAndProvider.provider.resolveFiles(t.updateInfoAndProvider.info);
    const r = this._logger, i = "sysctl.proc_translated";
    let o = !1;
    try {
      this.debug("Checking for macOS Rosetta environment"), o = (0, _l.execFileSync)("sysctl", [i], { encoding: "utf8" }).includes(`${i}: 1`), r.info(`Checked for macOS Rosetta environment (isRosetta=${o})`);
    } catch (l) {
      r.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${l}`);
    }
    let s = !1;
    try {
      this.debug("Checking for arm64 in uname");
      const f = (0, _l.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
      r.info(`Checked 'uname -a': arm64=${f}`), s = s || f;
    } catch (l) {
      r.warn(`uname shell command to check for arm64 failed: ${l}`);
    }
    s = s || process.arch === "arm64" || o, n = ls.filterFilesForArch(n, s);
    const a = (0, Nv.findFile)(n, "zip", ["pkg", "dmg"]);
    if (a == null)
      throw (0, yl.newError)(`ZIP file not provided: ${(0, yl.safeStringifyJson)(n)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
    const c = t.updateInfoAndProvider.provider, m = "update.zip";
    return this.executeDownload({
      fileExtension: "zip",
      fileInfo: a,
      downloadUpdateOptions: t,
      task: async (l, f) => {
        const h = wl.join(this.downloadedUpdateHelper.cacheDir, m), g = () => (0, ao.pathExistsSync)(h) ? !t.disableDifferentialDownload : (r.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
        let w = !0;
        g() && (w = await this.differentialDownloadInstaller(a, t, l, c, m)), w && await this.httpExecutor.download(a.url, l, f);
      },
      done: async (l) => {
        if (!t.disableDifferentialDownload)
          try {
            const f = wl.join(this.downloadedUpdateHelper.cacheDir, m);
            await (0, ao.copyFile)(l.downloadedFile, f);
          } catch (f) {
            this._logger.warn(`Unable to copy file for caching for future differential downloads: ${f.message}`);
          }
        return this.updateDownloaded(a, l);
      }
    });
  }
  async updateDownloaded(t, n) {
    var r;
    const i = n.downloadedFile, o = (r = t.info.size) !== null && r !== void 0 ? r : (await (0, ao.stat)(i)).size, s = this._logger, a = `fileToProxy=${t.url.href}`;
    this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${a})`), this.server = (0, Iv.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${a})`), this.server.on("close", () => {
      s.info(`Proxy server for native Squirrel.Mac is closed (${a})`);
    });
    const c = (m) => {
      const l = m.address();
      return typeof l == "string" ? l : `http://127.0.0.1:${l == null ? void 0 : l.port}`;
    };
    return await new Promise((m, l) => {
      const f = (0, vl.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), h = Buffer.from(`autoupdater:${f}`, "ascii"), g = `/${(0, vl.randomBytes)(64).toString("hex")}.zip`;
      this.server.on("request", (w, y) => {
        const A = w.url;
        if (s.info(`${A} requested`), A === "/") {
          if (!w.headers.authorization || w.headers.authorization.indexOf("Basic ") === -1) {
            y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), s.warn("No authenthication info");
            return;
          }
          const N = w.headers.authorization.split(" ")[1], x = Buffer.from(N, "base64").toString("ascii"), [ee, se] = x.split(":");
          if (ee !== "autoupdater" || se !== f) {
            y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), s.warn("Invalid authenthication credentials");
            return;
          }
          const W = Buffer.from(`{ "url": "${c(this.server)}${g}" }`);
          y.writeHead(200, { "Content-Type": "application/json", "Content-Length": W.length }), y.end(W);
          return;
        }
        if (!A.startsWith(g)) {
          s.warn(`${A} requested, but not supported`), y.writeHead(404), y.end();
          return;
        }
        s.info(`${g} requested by Squirrel.Mac, pipe ${i}`);
        let T = !1;
        y.on("finish", () => {
          T || (this.nativeUpdater.removeListener("error", l), m([]));
        });
        const R = (0, Ov.createReadStream)(i);
        R.on("error", (N) => {
          try {
            y.end();
          } catch (x) {
            s.warn(`cannot end response: ${x}`);
          }
          T = !0, this.nativeUpdater.removeListener("error", l), l(new Error(`Cannot pipe "${i}": ${N}`));
        }), y.writeHead(200, {
          "Content-Type": "application/zip",
          "Content-Length": o
        }), R.pipe(y);
      }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${a})`), this.server.listen(0, "127.0.0.1", () => {
        this.debug(`Proxy server for native Squirrel.Mac is listening (address=${c(this.server)}, ${a})`), this.nativeUpdater.setFeedURL({
          url: c(this.server),
          headers: {
            "Cache-Control": "no-cache",
            Authorization: `Basic ${h.toString("base64")}`
          }
        }), this.dispatchUpdateDownloaded(n), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", l), this.nativeUpdater.checkForUpdates()) : m([]);
      });
    });
  }
  handleUpdateDownloaded() {
    this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
  }
  quitAndInstall() {
    this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
  }
}
qn.MacUpdater = ls;
var Vn = {}, cs = {};
Object.defineProperty(cs, "__esModule", { value: !0 });
cs.verifySignature = Fv;
const Al = fe, Ku = zr, Dv = Xr, Tl = te;
function Ju(e, t) {
  return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", e], {
    shell: !0,
    timeout: t
  }];
}
function Fv(e, t, n) {
  return new Promise((r, i) => {
    const o = t.replace(/'/g, "''");
    n.info(`Verifying signature ${o}`), (0, Ku.execFile)(...Ju(`"Get-AuthenticodeSignature -LiteralPath '${o}' | ConvertTo-Json -Compress"`, 20 * 1e3), (s, a, c) => {
      var m;
      try {
        if (s != null || c) {
          lo(n, s, c, i), r(null);
          return;
        }
        const l = xv(a);
        if (l.Status === 0) {
          try {
            const w = Tl.normalize(l.Path), y = Tl.normalize(t);
            if (n.info(`LiteralPath: ${w}. Update Path: ${y}`), w !== y) {
              lo(n, new Error(`LiteralPath of ${w} is different than ${y}`), c, i), r(null);
              return;
            }
          } catch (w) {
            n.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(m = w.message) !== null && m !== void 0 ? m : w.stack}`);
          }
          const h = (0, Al.parseDn)(l.SignerCertificate.Subject);
          let g = !1;
          for (const w of e) {
            const y = (0, Al.parseDn)(w);
            if (y.size ? g = Array.from(y.keys()).every((T) => y.get(T) === h.get(T)) : w === h.get("CN") && (n.warn(`Signature validated using only CN ${w}. Please add your full Distinguished Name (DN) to publisherNames configuration`), g = !0), g) {
              r(null);
              return;
            }
          }
        }
        const f = `publisherNames: ${e.join(" | ")}, raw info: ` + JSON.stringify(l, (h, g) => h === "RawData" ? void 0 : g, 2);
        n.warn(`Sign verification failed, installer signed with incorrect certificate: ${f}`), r(f);
      } catch (l) {
        lo(n, l, null, i), r(null);
        return;
      }
    });
  });
}
function xv(e) {
  const t = JSON.parse(e);
  delete t.PrivateKey, delete t.IsOSBinary, delete t.SignatureType;
  const n = t.SignerCertificate;
  return n != null && (delete n.Archived, delete n.Extensions, delete n.Handle, delete n.HasPrivateKey, delete n.SubjectName), t;
}
function lo(e, t, n, r) {
  if (Lv()) {
    e.warn(`Cannot execute Get-AuthenticodeSignature: ${t || n}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  try {
    (0, Ku.execFileSync)(...Ju("ConvertTo-Json test", 10 * 1e3));
  } catch (i) {
    e.warn(`Cannot execute ConvertTo-Json: ${i.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  t != null && r(t), n && r(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${n}. Failing signature validation due to unknown stderr.`));
}
function Lv() {
  const e = Dv.release();
  return e.startsWith("6.") && !e.startsWith("6.3");
}
Object.defineProperty(Vn, "__esModule", { value: !0 });
Vn.NsisUpdater = void 0;
const Pr = fe, Sl = te, Uv = jt, kv = ir, bl = bt, Mv = le, Bv = St, jv = cs, Cl = Tt;
class Hv extends Uv.BaseUpdater {
  constructor(t, n) {
    super(t, n), this._verifyUpdateCodeSignature = (r, i) => (0, jv.verifySignature)(r, i, this._logger);
  }
  /**
   * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
   * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
   */
  get verifyUpdateCodeSignature() {
    return this._verifyUpdateCodeSignature;
  }
  set verifyUpdateCodeSignature(t) {
    t && (this._verifyUpdateCodeSignature = t);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const n = t.updateInfoAndProvider.provider, r = (0, Mv.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "exe");
    return this.executeDownload({
      fileExtension: "exe",
      downloadUpdateOptions: t,
      fileInfo: r,
      task: async (i, o, s, a) => {
        const c = r.packageInfo, m = c != null && s != null;
        if (m && t.disableWebInstaller)
          throw (0, Pr.newError)(`Unable to download new version ${t.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
        !m && !t.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (m || t.disableDifferentialDownload || await this.differentialDownloadInstaller(r, t, i, n, Pr.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(r.url, i, o);
        const l = await this.verifySignature(i);
        if (l != null)
          throw await a(), (0, Pr.newError)(`New version ${t.updateInfoAndProvider.info.version} is not signed by the application owner: ${l}`, "ERR_UPDATER_INVALID_SIGNATURE");
        if (m && await this.differentialDownloadWebPackage(t, c, s, n))
          try {
            await this.httpExecutor.download(new Cl.URL(c.path), s, {
              headers: t.requestHeaders,
              cancellationToken: t.cancellationToken,
              sha512: c.sha512
            });
          } catch (f) {
            try {
              await (0, Bv.unlink)(s);
            } catch {
            }
            throw f;
          }
      }
    });
  }
  // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
  // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
  // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
  async verifySignature(t) {
    let n;
    try {
      if (n = (await this.configOnDisk.value).publisherName, n == null)
        return null;
    } catch (r) {
      if (r.code === "ENOENT")
        return null;
      throw r;
    }
    return await this._verifyUpdateCodeSignature(Array.isArray(n) ? n : [n], t);
  }
  doInstall(t) {
    const n = this.installerPath;
    if (n == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const r = ["--updated"];
    t.isSilent && r.push("/S"), t.isForceRunAfter && r.push("--force-run"), this.installDirectory && r.push(`/D=${this.installDirectory}`);
    const i = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
    i != null && r.push(`--package-file=${i}`);
    const o = () => {
      this.spawnLog(Sl.join(process.resourcesPath, "elevate.exe"), [n].concat(r)).catch((s) => this.dispatchError(s));
    };
    return t.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), o(), !0) : (this.spawnLog(n, r).catch((s) => {
      const a = s.code;
      this._logger.info(`Cannot run installer: error code: ${a}, error message: "${s.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), a === "UNKNOWN" || a === "EACCES" ? o() : a === "ENOENT" ? Ut.shell.openPath(n).catch((c) => this.dispatchError(c)) : this.dispatchError(s);
    }), !0);
  }
  async differentialDownloadWebPackage(t, n, r, i) {
    if (n.blockMapSize == null)
      return !0;
    try {
      const o = {
        newUrl: new Cl.URL(n.path),
        oldFile: Sl.join(this.downloadedUpdateHelper.cacheDir, Pr.CURRENT_APP_PACKAGE_FILE_NAME),
        logger: this._logger,
        newFile: r,
        requestHeaders: this.requestHeaders,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        cancellationToken: t.cancellationToken
      };
      this.listenerCount(bl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(bl.DOWNLOAD_PROGRESS, s)), await new kv.FileWithEmbeddedBlockMapDifferentialDownloader(n, this.httpExecutor, o).download();
    } catch (o) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${o.stack || o}`), process.platform === "win32";
    }
    return !1;
  }
}
Vn.NsisUpdater = Hv;
(function(e) {
  var t = be && be.__createBinding || (Object.create ? function(A, T, R, N) {
    N === void 0 && (N = R);
    var x = Object.getOwnPropertyDescriptor(T, R);
    (!x || ("get" in x ? !T.__esModule : x.writable || x.configurable)) && (x = { enumerable: !0, get: function() {
      return T[R];
    } }), Object.defineProperty(A, N, x);
  } : function(A, T, R, N) {
    N === void 0 && (N = R), A[N] = T[R];
  }), n = be && be.__exportStar || function(A, T) {
    for (var R in A) R !== "default" && !Object.prototype.hasOwnProperty.call(T, R) && t(T, A, R);
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
  const r = St, i = te;
  var o = jt;
  Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
    return o.BaseUpdater;
  } });
  var s = yt;
  Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
    return s.AppUpdater;
  } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
    return s.NoOpLogger;
  } });
  var a = le;
  Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
    return a.Provider;
  } });
  var c = Bn;
  Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
    return c.AppImageUpdater;
  } });
  var m = jn;
  Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
    return m.DebUpdater;
  } });
  var l = Hn;
  Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
    return l.PacmanUpdater;
  } });
  var f = Gn;
  Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
    return f.RpmUpdater;
  } });
  var h = qn;
  Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
    return h.MacUpdater;
  } });
  var g = Vn;
  Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
    return g.NsisUpdater;
  } }), n(bt, e);
  let w;
  function y() {
    if (process.platform === "win32")
      w = new Vn.NsisUpdater();
    else if (process.platform === "darwin")
      w = new qn.MacUpdater();
    else {
      w = new Bn.AppImageUpdater();
      try {
        const A = i.join(process.resourcesPath, "package-type");
        if (!(0, r.existsSync)(A))
          return w;
        switch ((0, r.readFileSync)(A).toString().trim()) {
          case "deb":
            w = new jn.DebUpdater();
            break;
          case "rpm":
            w = new Gn.RpmUpdater();
            break;
          case "pacman":
            w = new Hn.PacmanUpdater();
            break;
          default:
            break;
        }
      } catch (A) {
        console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", A.message);
      }
    }
    return w;
  }
  Object.defineProperty(e, "autoUpdater", {
    enumerable: !0,
    get: () => w || y()
  });
})(Ce);
const Qu = rt.dirname(cd(import.meta.url));
process.env.APP_ROOT = rt.join(Qu, "..");
const Lr = process.env.VITE_DEV_SERVER_URL, cA = rt.join(process.env.APP_ROOT, "dist-electron"), Zu = rt.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Lr ? rt.join(process.env.APP_ROOT, "public") : Zu;
let z;
Ce.autoUpdater.autoDownload = !0;
Ce.autoUpdater.autoInstallOnAppQuit = !0;
Ce.autoUpdater.logger = console;
function ef() {
  return rt.join(Et.getPath("userData"), "updater-config.json");
}
function tf() {
  try {
    const e = ef();
    if (co.existsSync(e)) {
      const t = JSON.parse(co.readFileSync(e, "utf-8"));
      return (t == null ? void 0 : t.token) || null;
    }
  } catch (e) {
    console.warn("[AutoUpdater] Failed reading updater config:", e);
  }
  return null;
}
function Gv(e) {
  try {
    const t = ef();
    co.writeFileSync(t, JSON.stringify({ token: e.trim() }), "utf-8");
  } catch (t) {
    console.error("[AutoUpdater] Failed writing updater config:", t);
  }
}
function us(e) {
  const t = e ?? process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? tf();
  t && t.trim() ? (console.log("[AutoUpdater] Configuring updater with GitHub PAT token (Private Repo support)"), Ce.autoUpdater.setFeedURL({
    provider: "github",
    owner: "lumisolutionz-code",
    repo: "Hotline-POS-",
    private: !0,
    token: t.trim()
  })) : (console.log("[AutoUpdater] Configuring updater in public repository mode"), Ce.autoUpdater.setFeedURL({
    provider: "github",
    owner: "lumisolutionz-code",
    repo: "Hotline-POS-"
  }));
}
function nf() {
  z = new $l({
    icon: rt.join(process.env.VITE_PUBLIC, "icon.ico"),
    backgroundColor: "#f0f4f9",
    webPreferences: {
      preload: rt.join(Qu, "preload.mjs")
    }
  }), z.maximize(), z.webContents.setWindowOpenHandler(({ url: e }) => e.startsWith("http:") || e.startsWith("https:") ? (Rl.openExternal(e), { action: "deny" }) : { action: "allow" }), z.webContents.on("did-finish-load", () => {
    z == null || z.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString()), Lr || setTimeout(() => {
      Ce.autoUpdater.checkForUpdatesAndNotify().catch((e) => {
        console.error("[AutoUpdater] Initial check error:", (e == null ? void 0 : e.message) || e);
      });
    }, 3500);
  }), z.webContents.on("did-fail-load", (e, t, n, r) => {
    console.error(`[Electron] Failed to load ${r}: ${n} (${t})`);
  }), Lr ? z.loadURL(Lr) : z.loadFile(rt.join(Zu, "index.html"));
}
Et.on("window-all-closed", () => {
  process.platform !== "darwin" && (Et.quit(), z = null);
});
Et.on("activate", () => {
  $l.getAllWindows().length === 0 && nf();
});
Et.whenReady().then(() => {
  us(), nf();
});
Ce.autoUpdater.on("checking-for-update", () => {
  console.log("[AutoUpdater] Checking for update..."), z == null || z.webContents.send("update-checking");
});
Ce.autoUpdater.on("update-available", (e) => {
  console.log("[AutoUpdater] Update available:", e == null ? void 0 : e.version), z == null || z.webContents.send("update-available", e);
});
Ce.autoUpdater.on("update-not-available", (e) => {
  console.log("[AutoUpdater] Update not available. Already on latest version:", e == null ? void 0 : e.version), z == null || z.webContents.send("update-not-available", e);
});
Ce.autoUpdater.on("error", (e) => {
  const t = (e == null ? void 0 : e.message) || String(e);
  console.error("[AutoUpdater Error]:", t);
  const n = t.includes("404");
  z == null || z.webContents.send("update-error", {
    message: t,
    is404: n,
    hint: n ? "GitHub returned 404 Not Found. If the repository is Private, make it Public on GitHub or provide a token in Settings so autoUpdater can download the release." : t
  });
});
Ce.autoUpdater.on("download-progress", (e) => {
  z == null || z.webContents.send("update-progress", e);
});
Ce.autoUpdater.on("update-downloaded", (e) => {
  console.log("[AutoUpdater] Update downloaded successfully:", e == null ? void 0 : e.version), z == null || z.webContents.send("update-downloaded", e);
});
un.handle("check_for_updates", async () => {
  var e, t;
  try {
    us();
    const n = await Ce.autoUpdater.checkForUpdates();
    return {
      success: !0,
      currentVersion: Et.getVersion(),
      updateVersion: (e = n == null ? void 0 : n.updateInfo) == null ? void 0 : e.version,
      hasUpdate: !!((t = n == null ? void 0 : n.updateInfo) != null && t.version && n.updateInfo.version !== Et.getVersion())
    };
  } catch (n) {
    const r = (n == null ? void 0 : n.message) || String(n);
    return console.error("[AutoUpdater] Manual check error:", r), {
      success: !1,
      error: r,
      is404: r.includes("404")
    };
  }
});
un.handle("get_update_token", () => tf() || "");
un.handle("save_update_token", (e, t) => (Gv(t || ""), us(t || null), { success: !0 }));
un.handle("get_app_version", () => Et.getVersion());
un.on("restart_app", () => {
  Ce.autoUpdater.quitAndInstall();
});
un.handle("open_external", async (e, t) => t && (t.startsWith("http://") || t.startsWith("https://")) ? (await Rl.openExternal(t), !0) : !1);
export {
  cA as MAIN_DIST,
  Zu as RENDERER_DIST,
  Lr as VITE_DEV_SERVER_URL,
  us as configureAutoUpdater
};

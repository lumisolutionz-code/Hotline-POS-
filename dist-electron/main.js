import Mt, { app as nt, BrowserWindow as cn, ipcMain as Te, shell as Io, dialog as Nl } from "electron";
import Tt from "fs";
import fd from "constants";
import Xn from "stream";
import No from "util";
import Dl from "assert";
import te from "path";
import Qr from "child_process";
import Fl from "events";
import Kn from "crypto";
import xl from "tty";
import Zr from "os";
import bt from "url";
import dd from "string_decoder";
import Ll from "zlib";
import hd from "http";
import { fileURLToPath as pd } from "node:url";
import Fe from "node:path";
import le from "node:fs";
var $e = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Re = {}, jt = {}, Pe = {};
Pe.fromCallback = function(e) {
  return Object.defineProperty(function(...t) {
    if (typeof t[t.length - 1] == "function") e.apply(this, t);
    else
      return new Promise((n, r) => {
        t.push((i, o) => i != null ? r(i) : n(o)), e.apply(this, t);
      });
  }, "name", { value: e.name });
};
Pe.fromPromise = function(e) {
  return Object.defineProperty(function(...t) {
    const n = t[t.length - 1];
    if (typeof n != "function") return e.apply(this, t);
    t.pop(), e.apply(this, t).then((r) => n(null, r), n);
  }, "name", { value: e.name });
};
var ht = fd, md = process.cwd, Lr = null, gd = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return Lr || (Lr = md.call(process)), Lr;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var Fs = process.chdir;
  process.chdir = function(e) {
    Lr = null, Fs.call(process, e);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, Fs);
}
var Ed = yd;
function yd(e) {
  ht.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && t(e), e.lutimes || n(e), e.chown = o(e.chown), e.fchown = o(e.fchown), e.lchown = o(e.lchown), e.chmod = r(e.chmod), e.fchmod = r(e.fchmod), e.lchmod = r(e.lchmod), e.chownSync = s(e.chownSync), e.fchownSync = s(e.fchownSync), e.lchownSync = s(e.lchownSync), e.chmodSync = i(e.chmodSync), e.fchmodSync = i(e.fchmodSync), e.lchmodSync = i(e.lchmodSync), e.stat = a(e.stat), e.fstat = a(e.fstat), e.lstat = a(e.lstat), e.statSync = c(e.statSync), e.fstatSync = c(e.fstatSync), e.lstatSync = c(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(l, f, h) {
    h && process.nextTick(h);
  }, e.lchmodSync = function() {
  }), e.chown && !e.lchown && (e.lchown = function(l, f, h, g) {
    g && process.nextTick(g);
  }, e.lchownSync = function() {
  }), gd === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(l) {
    function f(h, g, w) {
      var y = Date.now(), A = 0;
      l(h, g, function S(R) {
        if (R && (R.code === "EACCES" || R.code === "EPERM" || R.code === "EBUSY") && Date.now() - y < 6e4) {
          setTimeout(function() {
            e.stat(g, function(N, x) {
              N && N.code === "ENOENT" ? l(h, g, S) : w(R);
            });
          }, A), A < 100 && (A += 10);
          return;
        }
        w && w(R);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(f, l), f;
  }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(l) {
    function f(h, g, w, y, A, S) {
      var R;
      if (S && typeof S == "function") {
        var N = 0;
        R = function(x, ee, se) {
          if (x && x.code === "EAGAIN" && N < 10)
            return N++, l.call(e, h, g, w, y, A, R);
          S.apply(this, arguments);
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
        } catch (S) {
          if (S.code === "EAGAIN" && A < 10) {
            A++;
            continue;
          }
          throw S;
        }
    };
  }(e.readSync);
  function t(l) {
    l.lchmod = function(f, h, g) {
      l.open(
        f,
        ht.O_WRONLY | ht.O_SYMLINK,
        h,
        function(w, y) {
          if (w) {
            g && g(w);
            return;
          }
          l.fchmod(y, h, function(A) {
            l.close(y, function(S) {
              g && g(A || S);
            });
          });
        }
      );
    }, l.lchmodSync = function(f, h) {
      var g = l.openSync(f, ht.O_WRONLY | ht.O_SYMLINK, h), w = !0, y;
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
    ht.hasOwnProperty("O_SYMLINK") && l.futimes ? (l.lutimes = function(f, h, g, w) {
      l.open(f, ht.O_SYMLINK, function(y, A) {
        if (y) {
          w && w(y);
          return;
        }
        l.futimes(A, h, g, function(S) {
          l.close(A, function(R) {
            w && w(S || R);
          });
        });
      });
    }, l.lutimesSync = function(f, h, g) {
      var w = l.openSync(f, ht.O_SYMLINK), y, A = !0;
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
var xs = Xn.Stream, wd = _d;
function _d(e) {
  return {
    ReadStream: t,
    WriteStream: n
  };
  function t(r, i) {
    if (!(this instanceof t)) return new t(r, i);
    xs.call(this);
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
    xs.call(this), this.path = r, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
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
var vd = Sd, Ad = Object.getPrototypeOf || function(e) {
  return e.__proto__;
};
function Sd(e) {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Object)
    var t = { __proto__: Ad(e) };
  else
    var t = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(e).forEach(function(n) {
    Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(e, n));
  }), t;
}
var re = Tt, Td = Ed, bd = wd, Cd = vd, wr = No, we, jr;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (we = Symbol.for("graceful-fs.queue"), jr = Symbol.for("graceful-fs.previous")) : (we = "___graceful-fs.queue", jr = "___graceful-fs.previous");
function $d() {
}
function Ul(e, t) {
  Object.defineProperty(e, we, {
    get: function() {
      return t;
    }
  });
}
var kt = $d;
wr.debuglog ? kt = wr.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (kt = function() {
  var e = wr.format.apply(wr, arguments);
  e = "GFS4: " + e.split(/\n/).join(`
GFS4: `), console.error(e);
});
if (!re[we]) {
  var Rd = $e[we] || [];
  Ul(re, Rd), re.close = function(e) {
    function t(n, r) {
      return e.call(re, n, function(i) {
        i || Ls(), typeof r == "function" && r.apply(this, arguments);
      });
    }
    return Object.defineProperty(t, jr, {
      value: e
    }), t;
  }(re.close), re.closeSync = function(e) {
    function t(n) {
      e.apply(re, arguments), Ls();
    }
    return Object.defineProperty(t, jr, {
      value: e
    }), t;
  }(re.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    kt(re[we]), Dl.equal(re[we].length, 0);
  });
}
$e[we] || Ul($e, re[we]);
var Ie = Do(Cd(re));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !re.__patched && (Ie = Do(re), re.__patched = !0);
function Do(e) {
  Td(e), e.gracefulify = Do, e.createReadStream = ee, e.createWriteStream = se;
  var t = e.readFile;
  e.readFile = n;
  function n(E, G, B) {
    return typeof G == "function" && (B = G, G = null), M(E, G, B);
    function M(X, O, C, I) {
      return t(X, O, function(b) {
        b && (b.code === "EMFILE" || b.code === "ENFILE") ? Yt([M, [X, O, C], b, I || Date.now(), Date.now()]) : typeof C == "function" && C.apply(this, arguments);
      });
    }
  }
  var r = e.writeFile;
  e.writeFile = i;
  function i(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), X(E, G, B, M);
    function X(O, C, I, b, D) {
      return r(O, C, I, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Yt([X, [O, C, I, b], P, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var o = e.appendFile;
  o && (e.appendFile = s);
  function s(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), X(E, G, B, M);
    function X(O, C, I, b, D) {
      return o(O, C, I, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Yt([X, [O, C, I, b], P, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var a = e.copyFile;
  a && (e.copyFile = c);
  function c(E, G, B, M) {
    return typeof B == "function" && (M = B, B = 0), X(E, G, B, M);
    function X(O, C, I, b, D) {
      return a(O, C, I, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Yt([X, [O, C, I, b], P, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var m = e.readdir;
  e.readdir = f;
  var l = /^v[0-5]\./;
  function f(E, G, B) {
    typeof G == "function" && (B = G, G = null);
    var M = l.test(process.version) ? function(C, I, b, D) {
      return m(C, X(
        C,
        I,
        b,
        D
      ));
    } : function(C, I, b, D) {
      return m(C, I, X(
        C,
        I,
        b,
        D
      ));
    };
    return M(E, G, B);
    function X(O, C, I, b) {
      return function(D, P) {
        D && (D.code === "EMFILE" || D.code === "ENFILE") ? Yt([
          M,
          [O, C, I],
          D,
          b || Date.now(),
          Date.now()
        ]) : (P && P.sort && P.sort(), typeof I == "function" && I.call(this, D, P));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var h = bd(e);
    S = h.ReadStream, N = h.WriteStream;
  }
  var g = e.ReadStream;
  g && (S.prototype = Object.create(g.prototype), S.prototype.open = R);
  var w = e.WriteStream;
  w && (N.prototype = Object.create(w.prototype), N.prototype.open = x), Object.defineProperty(e, "ReadStream", {
    get: function() {
      return S;
    },
    set: function(E) {
      S = E;
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
  var y = S;
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
  function S(E, G) {
    return this instanceof S ? (g.apply(this, arguments), this) : S.apply(Object.create(S.prototype), arguments);
  }
  function R() {
    var E = this;
    Ue(E.path, E.flags, E.mode, function(G, B) {
      G ? (E.autoClose && E.destroy(), E.emit("error", G)) : (E.fd = B, E.emit("open", B), E.read());
    });
  }
  function N(E, G) {
    return this instanceof N ? (w.apply(this, arguments), this) : N.apply(Object.create(N.prototype), arguments);
  }
  function x() {
    var E = this;
    Ue(E.path, E.flags, E.mode, function(G, B) {
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
  e.open = Ue;
  function Ue(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), X(E, G, B, M);
    function X(O, C, I, b, D) {
      return W(O, C, I, function(P, k) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Yt([X, [O, C, I, b], P, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  return e;
}
function Yt(e) {
  kt("ENQUEUE", e[0].name, e[1]), re[we].push(e), Fo();
}
var _r;
function Ls() {
  for (var e = Date.now(), t = 0; t < re[we].length; ++t)
    re[we][t].length > 2 && (re[we][t][3] = e, re[we][t][4] = e);
  Fo();
}
function Fo() {
  if (clearTimeout(_r), _r = void 0, re[we].length !== 0) {
    var e = re[we].shift(), t = e[0], n = e[1], r = e[2], i = e[3], o = e[4];
    if (i === void 0)
      kt("RETRY", t.name, n), t.apply(null, n);
    else if (Date.now() - i >= 6e4) {
      kt("TIMEOUT", t.name, n);
      var s = n.pop();
      typeof s == "function" && s.call(null, r);
    } else {
      var a = Date.now() - o, c = Math.max(o - i, 1), m = Math.min(c * 1.2, 100);
      a >= m ? (kt("RETRY", t.name, n), t.apply(null, n.concat([i]))) : re[we].push(e);
    }
    _r === void 0 && (_r = setTimeout(Fo, 0));
  }
}
(function(e) {
  const t = Pe.fromCallback, n = Ie, r = [
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
})(jt);
var xo = {}, kl = {};
const Od = te;
kl.checkPath = function(t) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(t.replace(Od.parse(t).root, ""))) {
    const r = new Error(`Path contains invalid characters: ${t}`);
    throw r.code = "EINVAL", r;
  }
};
const Ml = jt, { checkPath: Bl } = kl, jl = (e) => {
  const t = { mode: 511 };
  return typeof e == "number" ? e : { ...t, ...e }.mode;
};
xo.makeDir = async (e, t) => (Bl(e), Ml.mkdir(e, {
  mode: jl(t),
  recursive: !0
}));
xo.makeDirSync = (e, t) => (Bl(e), Ml.mkdirSync(e, {
  mode: jl(t),
  recursive: !0
}));
const Pd = Pe.fromPromise, { makeDir: Id, makeDirSync: Ii } = xo, Ni = Pd(Id);
var rt = {
  mkdirs: Ni,
  mkdirsSync: Ii,
  // alias
  mkdirp: Ni,
  mkdirpSync: Ii,
  ensureDir: Ni,
  ensureDirSync: Ii
};
const Nd = Pe.fromPromise, Hl = jt;
function Dd(e) {
  return Hl.access(e).then(() => !0).catch(() => !1);
}
var Ht = {
  pathExists: Nd(Dd),
  pathExistsSync: Hl.existsSync
};
const sn = Ie;
function Fd(e, t, n, r) {
  sn.open(e, "r+", (i, o) => {
    if (i) return r(i);
    sn.futimes(o, t, n, (s) => {
      sn.close(o, (a) => {
        r && r(s || a);
      });
    });
  });
}
function xd(e, t, n) {
  const r = sn.openSync(e, "r+");
  return sn.futimesSync(r, t, n), sn.closeSync(r);
}
var Gl = {
  utimesMillis: Fd,
  utimesMillisSync: xd
};
const un = jt, me = te, Ld = No;
function Ud(e, t, n) {
  const r = n.dereference ? (i) => un.stat(i, { bigint: !0 }) : (i) => un.lstat(i, { bigint: !0 });
  return Promise.all([
    r(e),
    r(t).catch((i) => {
      if (i.code === "ENOENT") return null;
      throw i;
    })
  ]).then(([i, o]) => ({ srcStat: i, destStat: o }));
}
function kd(e, t, n) {
  let r;
  const i = n.dereference ? (s) => un.statSync(s, { bigint: !0 }) : (s) => un.lstatSync(s, { bigint: !0 }), o = i(e);
  try {
    r = i(t);
  } catch (s) {
    if (s.code === "ENOENT") return { srcStat: o, destStat: null };
    throw s;
  }
  return { srcStat: o, destStat: r };
}
function Md(e, t, n, r, i) {
  Ld.callbackify(Ud)(e, t, r, (o, s) => {
    if (o) return i(o);
    const { srcStat: a, destStat: c } = s;
    if (c) {
      if (Jn(a, c)) {
        const m = me.basename(e), l = me.basename(t);
        return n === "move" && m !== l && m.toLowerCase() === l.toLowerCase() ? i(null, { srcStat: a, destStat: c, isChangingCase: !0 }) : i(new Error("Source and destination must not be the same."));
      }
      if (a.isDirectory() && !c.isDirectory())
        return i(new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`));
      if (!a.isDirectory() && c.isDirectory())
        return i(new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`));
    }
    return a.isDirectory() && Lo(e, t) ? i(new Error(ei(e, t, n))) : i(null, { srcStat: a, destStat: c });
  });
}
function Bd(e, t, n, r) {
  const { srcStat: i, destStat: o } = kd(e, t, r);
  if (o) {
    if (Jn(i, o)) {
      const s = me.basename(e), a = me.basename(t);
      if (n === "move" && s !== a && s.toLowerCase() === a.toLowerCase())
        return { srcStat: i, destStat: o, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (i.isDirectory() && !o.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
    if (!i.isDirectory() && o.isDirectory())
      throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
  }
  if (i.isDirectory() && Lo(e, t))
    throw new Error(ei(e, t, n));
  return { srcStat: i, destStat: o };
}
function ql(e, t, n, r, i) {
  const o = me.resolve(me.dirname(e)), s = me.resolve(me.dirname(n));
  if (s === o || s === me.parse(s).root) return i();
  un.stat(s, { bigint: !0 }, (a, c) => a ? a.code === "ENOENT" ? i() : i(a) : Jn(t, c) ? i(new Error(ei(e, n, r))) : ql(e, t, s, r, i));
}
function Vl(e, t, n, r) {
  const i = me.resolve(me.dirname(e)), o = me.resolve(me.dirname(n));
  if (o === i || o === me.parse(o).root) return;
  let s;
  try {
    s = un.statSync(o, { bigint: !0 });
  } catch (a) {
    if (a.code === "ENOENT") return;
    throw a;
  }
  if (Jn(t, s))
    throw new Error(ei(e, n, r));
  return Vl(e, t, o, r);
}
function Jn(e, t) {
  return t.ino && t.dev && t.ino === e.ino && t.dev === e.dev;
}
function Lo(e, t) {
  const n = me.resolve(e).split(me.sep).filter((i) => i), r = me.resolve(t).split(me.sep).filter((i) => i);
  return n.reduce((i, o, s) => i && r[s] === o, !0);
}
function ei(e, t, n) {
  return `Cannot ${n} '${e}' to a subdirectory of itself, '${t}'.`;
}
var pn = {
  checkPaths: Md,
  checkPathsSync: Bd,
  checkParentPaths: ql,
  checkParentPathsSync: Vl,
  isSrcSubdir: Lo,
  areIdentical: Jn
};
const xe = Ie, Fn = te, jd = rt.mkdirs, Hd = Ht.pathExists, Gd = Gl.utimesMillis, xn = pn;
function qd(e, t, n, r) {
  typeof n == "function" && !r ? (r = n, n = {}) : typeof n == "function" && (n = { filter: n }), r = r || function() {
  }, n = n || {}, n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  ), xn.checkPaths(e, t, "copy", n, (i, o) => {
    if (i) return r(i);
    const { srcStat: s, destStat: a } = o;
    xn.checkParentPaths(e, s, t, "copy", (c) => c ? r(c) : n.filter ? Wl(Us, a, e, t, n, r) : Us(a, e, t, n, r));
  });
}
function Us(e, t, n, r, i) {
  const o = Fn.dirname(n);
  Hd(o, (s, a) => {
    if (s) return i(s);
    if (a) return Hr(e, t, n, r, i);
    jd(o, (c) => c ? i(c) : Hr(e, t, n, r, i));
  });
}
function Wl(e, t, n, r, i, o) {
  Promise.resolve(i.filter(n, r)).then((s) => s ? e(t, n, r, i, o) : o(), (s) => o(s));
}
function Vd(e, t, n, r, i) {
  return r.filter ? Wl(Hr, e, t, n, r, i) : Hr(e, t, n, r, i);
}
function Hr(e, t, n, r, i) {
  (r.dereference ? xe.stat : xe.lstat)(t, (s, a) => s ? i(s) : a.isDirectory() ? Qd(a, e, t, n, r, i) : a.isFile() || a.isCharacterDevice() || a.isBlockDevice() ? Wd(a, e, t, n, r, i) : a.isSymbolicLink() ? th(e, t, n, r, i) : a.isSocket() ? i(new Error(`Cannot copy a socket file: ${t}`)) : a.isFIFO() ? i(new Error(`Cannot copy a FIFO pipe: ${t}`)) : i(new Error(`Unknown file: ${t}`)));
}
function Wd(e, t, n, r, i, o) {
  return t ? Yd(e, n, r, i, o) : Yl(e, n, r, i, o);
}
function Yd(e, t, n, r, i) {
  if (r.overwrite)
    xe.unlink(n, (o) => o ? i(o) : Yl(e, t, n, r, i));
  else return r.errorOnExist ? i(new Error(`'${n}' already exists`)) : i();
}
function Yl(e, t, n, r, i) {
  xe.copyFile(t, n, (o) => o ? i(o) : r.preserveTimestamps ? zd(e.mode, t, n, i) : ti(n, e.mode, i));
}
function zd(e, t, n, r) {
  return Xd(e) ? Kd(n, e, (i) => i ? r(i) : ks(e, t, n, r)) : ks(e, t, n, r);
}
function Xd(e) {
  return (e & 128) === 0;
}
function Kd(e, t, n) {
  return ti(e, t | 128, n);
}
function ks(e, t, n, r) {
  Jd(t, n, (i) => i ? r(i) : ti(n, e, r));
}
function ti(e, t, n) {
  return xe.chmod(e, t, n);
}
function Jd(e, t, n) {
  xe.stat(e, (r, i) => r ? n(r) : Gd(t, i.atime, i.mtime, n));
}
function Qd(e, t, n, r, i, o) {
  return t ? zl(n, r, i, o) : Zd(e.mode, n, r, i, o);
}
function Zd(e, t, n, r, i) {
  xe.mkdir(n, (o) => {
    if (o) return i(o);
    zl(t, n, r, (s) => s ? i(s) : ti(n, e, i));
  });
}
function zl(e, t, n, r) {
  xe.readdir(e, (i, o) => i ? r(i) : Xl(o, e, t, n, r));
}
function Xl(e, t, n, r, i) {
  const o = e.pop();
  return o ? eh(e, o, t, n, r, i) : i();
}
function eh(e, t, n, r, i, o) {
  const s = Fn.join(n, t), a = Fn.join(r, t);
  xn.checkPaths(s, a, "copy", i, (c, m) => {
    if (c) return o(c);
    const { destStat: l } = m;
    Vd(l, s, a, i, (f) => f ? o(f) : Xl(e, n, r, i, o));
  });
}
function th(e, t, n, r, i) {
  xe.readlink(t, (o, s) => {
    if (o) return i(o);
    if (r.dereference && (s = Fn.resolve(process.cwd(), s)), e)
      xe.readlink(n, (a, c) => a ? a.code === "EINVAL" || a.code === "UNKNOWN" ? xe.symlink(s, n, i) : i(a) : (r.dereference && (c = Fn.resolve(process.cwd(), c)), xn.isSrcSubdir(s, c) ? i(new Error(`Cannot copy '${s}' to a subdirectory of itself, '${c}'.`)) : e.isDirectory() && xn.isSrcSubdir(c, s) ? i(new Error(`Cannot overwrite '${c}' with '${s}'.`)) : nh(s, n, i)));
    else
      return xe.symlink(s, n, i);
  });
}
function nh(e, t, n) {
  xe.unlink(t, (r) => r ? n(r) : xe.symlink(e, t, n));
}
var rh = qd;
const Se = Ie, Ln = te, ih = rt.mkdirsSync, oh = Gl.utimesMillisSync, Un = pn;
function sh(e, t, n) {
  typeof n == "function" && (n = { filter: n }), n = n || {}, n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: r, destStat: i } = Un.checkPathsSync(e, t, "copy", n);
  return Un.checkParentPathsSync(e, r, t, "copy"), ah(i, e, t, n);
}
function ah(e, t, n, r) {
  if (r.filter && !r.filter(t, n)) return;
  const i = Ln.dirname(n);
  return Se.existsSync(i) || ih(i), Kl(e, t, n, r);
}
function lh(e, t, n, r) {
  if (!(r.filter && !r.filter(t, n)))
    return Kl(e, t, n, r);
}
function Kl(e, t, n, r) {
  const o = (r.dereference ? Se.statSync : Se.lstatSync)(t);
  if (o.isDirectory()) return mh(o, e, t, n, r);
  if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice()) return ch(o, e, t, n, r);
  if (o.isSymbolicLink()) return yh(e, t, n, r);
  throw o.isSocket() ? new Error(`Cannot copy a socket file: ${t}`) : o.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${t}`) : new Error(`Unknown file: ${t}`);
}
function ch(e, t, n, r, i) {
  return t ? uh(e, n, r, i) : Jl(e, n, r, i);
}
function uh(e, t, n, r) {
  if (r.overwrite)
    return Se.unlinkSync(n), Jl(e, t, n, r);
  if (r.errorOnExist)
    throw new Error(`'${n}' already exists`);
}
function Jl(e, t, n, r) {
  return Se.copyFileSync(t, n), r.preserveTimestamps && fh(e.mode, t, n), Uo(n, e.mode);
}
function fh(e, t, n) {
  return dh(e) && hh(n, e), ph(t, n);
}
function dh(e) {
  return (e & 128) === 0;
}
function hh(e, t) {
  return Uo(e, t | 128);
}
function Uo(e, t) {
  return Se.chmodSync(e, t);
}
function ph(e, t) {
  const n = Se.statSync(e);
  return oh(t, n.atime, n.mtime);
}
function mh(e, t, n, r, i) {
  return t ? Ql(n, r, i) : gh(e.mode, n, r, i);
}
function gh(e, t, n, r) {
  return Se.mkdirSync(n), Ql(t, n, r), Uo(n, e);
}
function Ql(e, t, n) {
  Se.readdirSync(e).forEach((r) => Eh(r, e, t, n));
}
function Eh(e, t, n, r) {
  const i = Ln.join(t, e), o = Ln.join(n, e), { destStat: s } = Un.checkPathsSync(i, o, "copy", r);
  return lh(s, i, o, r);
}
function yh(e, t, n, r) {
  let i = Se.readlinkSync(t);
  if (r.dereference && (i = Ln.resolve(process.cwd(), i)), e) {
    let o;
    try {
      o = Se.readlinkSync(n);
    } catch (s) {
      if (s.code === "EINVAL" || s.code === "UNKNOWN") return Se.symlinkSync(i, n);
      throw s;
    }
    if (r.dereference && (o = Ln.resolve(process.cwd(), o)), Un.isSrcSubdir(i, o))
      throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${o}'.`);
    if (Se.statSync(n).isDirectory() && Un.isSrcSubdir(o, i))
      throw new Error(`Cannot overwrite '${o}' with '${i}'.`);
    return wh(i, n);
  } else
    return Se.symlinkSync(i, n);
}
function wh(e, t) {
  return Se.unlinkSync(t), Se.symlinkSync(e, t);
}
var _h = sh;
const vh = Pe.fromCallback;
var ko = {
  copy: vh(rh),
  copySync: _h
};
const Ms = Ie, Zl = te, J = Dl, kn = process.platform === "win32";
function ec(e) {
  [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ].forEach((n) => {
    e[n] = e[n] || Ms[n], n = n + "Sync", e[n] = e[n] || Ms[n];
  }), e.maxBusyTries = e.maxBusyTries || 3;
}
function Mo(e, t, n) {
  let r = 0;
  typeof t == "function" && (n = t, t = {}), J(e, "rimraf: missing path"), J.strictEqual(typeof e, "string", "rimraf: path should be a string"), J.strictEqual(typeof n, "function", "rimraf: callback function required"), J(t, "rimraf: invalid options argument provided"), J.strictEqual(typeof t, "object", "rimraf: options should be object"), ec(t), Bs(e, t, function i(o) {
    if (o) {
      if ((o.code === "EBUSY" || o.code === "ENOTEMPTY" || o.code === "EPERM") && r < t.maxBusyTries) {
        r++;
        const s = r * 100;
        return setTimeout(() => Bs(e, t, i), s);
      }
      o.code === "ENOENT" && (o = null);
    }
    n(o);
  });
}
function Bs(e, t, n) {
  J(e), J(t), J(typeof n == "function"), t.lstat(e, (r, i) => {
    if (r && r.code === "ENOENT")
      return n(null);
    if (r && r.code === "EPERM" && kn)
      return js(e, t, r, n);
    if (i && i.isDirectory())
      return Ur(e, t, r, n);
    t.unlink(e, (o) => {
      if (o) {
        if (o.code === "ENOENT")
          return n(null);
        if (o.code === "EPERM")
          return kn ? js(e, t, o, n) : Ur(e, t, o, n);
        if (o.code === "EISDIR")
          return Ur(e, t, o, n);
      }
      return n(o);
    });
  });
}
function js(e, t, n, r) {
  J(e), J(t), J(typeof r == "function"), t.chmod(e, 438, (i) => {
    i ? r(i.code === "ENOENT" ? null : n) : t.stat(e, (o, s) => {
      o ? r(o.code === "ENOENT" ? null : n) : s.isDirectory() ? Ur(e, t, n, r) : t.unlink(e, r);
    });
  });
}
function Hs(e, t, n) {
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
  r.isDirectory() ? kr(e, t, n) : t.unlinkSync(e);
}
function Ur(e, t, n, r) {
  J(e), J(t), J(typeof r == "function"), t.rmdir(e, (i) => {
    i && (i.code === "ENOTEMPTY" || i.code === "EEXIST" || i.code === "EPERM") ? Ah(e, t, r) : i && i.code === "ENOTDIR" ? r(n) : r(i);
  });
}
function Ah(e, t, n) {
  J(e), J(t), J(typeof n == "function"), t.readdir(e, (r, i) => {
    if (r) return n(r);
    let o = i.length, s;
    if (o === 0) return t.rmdir(e, n);
    i.forEach((a) => {
      Mo(Zl.join(e, a), t, (c) => {
        if (!s) {
          if (c) return n(s = c);
          --o === 0 && t.rmdir(e, n);
        }
      });
    });
  });
}
function tc(e, t) {
  let n;
  t = t || {}, ec(t), J(e, "rimraf: missing path"), J.strictEqual(typeof e, "string", "rimraf: path should be a string"), J(t, "rimraf: missing options"), J.strictEqual(typeof t, "object", "rimraf: options should be object");
  try {
    n = t.lstatSync(e);
  } catch (r) {
    if (r.code === "ENOENT")
      return;
    r.code === "EPERM" && kn && Hs(e, t, r);
  }
  try {
    n && n.isDirectory() ? kr(e, t, null) : t.unlinkSync(e);
  } catch (r) {
    if (r.code === "ENOENT")
      return;
    if (r.code === "EPERM")
      return kn ? Hs(e, t, r) : kr(e, t, r);
    if (r.code !== "EISDIR")
      throw r;
    kr(e, t, r);
  }
}
function kr(e, t, n) {
  J(e), J(t);
  try {
    t.rmdirSync(e);
  } catch (r) {
    if (r.code === "ENOTDIR")
      throw n;
    if (r.code === "ENOTEMPTY" || r.code === "EEXIST" || r.code === "EPERM")
      Sh(e, t);
    else if (r.code !== "ENOENT")
      throw r;
  }
}
function Sh(e, t) {
  if (J(e), J(t), t.readdirSync(e).forEach((n) => tc(Zl.join(e, n), t)), kn) {
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
var Th = Mo;
Mo.sync = tc;
const Gr = Ie, bh = Pe.fromCallback, nc = Th;
function Ch(e, t) {
  if (Gr.rm) return Gr.rm(e, { recursive: !0, force: !0 }, t);
  nc(e, t);
}
function $h(e) {
  if (Gr.rmSync) return Gr.rmSync(e, { recursive: !0, force: !0 });
  nc.sync(e);
}
var ni = {
  remove: bh(Ch),
  removeSync: $h
};
const Rh = Pe.fromPromise, rc = jt, ic = te, oc = rt, sc = ni, Gs = Rh(async function(t) {
  let n;
  try {
    n = await rc.readdir(t);
  } catch {
    return oc.mkdirs(t);
  }
  return Promise.all(n.map((r) => sc.remove(ic.join(t, r))));
});
function qs(e) {
  let t;
  try {
    t = rc.readdirSync(e);
  } catch {
    return oc.mkdirsSync(e);
  }
  t.forEach((n) => {
    n = ic.join(e, n), sc.removeSync(n);
  });
}
var Oh = {
  emptyDirSync: qs,
  emptydirSync: qs,
  emptyDir: Gs,
  emptydir: Gs
};
const Ph = Pe.fromCallback, ac = te, Et = Ie, lc = rt;
function Ih(e, t) {
  function n() {
    Et.writeFile(e, "", (r) => {
      if (r) return t(r);
      t();
    });
  }
  Et.stat(e, (r, i) => {
    if (!r && i.isFile()) return t();
    const o = ac.dirname(e);
    Et.stat(o, (s, a) => {
      if (s)
        return s.code === "ENOENT" ? lc.mkdirs(o, (c) => {
          if (c) return t(c);
          n();
        }) : t(s);
      a.isDirectory() ? n() : Et.readdir(o, (c) => {
        if (c) return t(c);
      });
    });
  });
}
function Nh(e) {
  let t;
  try {
    t = Et.statSync(e);
  } catch {
  }
  if (t && t.isFile()) return;
  const n = ac.dirname(e);
  try {
    Et.statSync(n).isDirectory() || Et.readdirSync(n);
  } catch (r) {
    if (r && r.code === "ENOENT") lc.mkdirsSync(n);
    else throw r;
  }
  Et.writeFileSync(e, "");
}
var Dh = {
  createFile: Ph(Ih),
  createFileSync: Nh
};
const Fh = Pe.fromCallback, cc = te, gt = Ie, uc = rt, xh = Ht.pathExists, { areIdentical: fc } = pn;
function Lh(e, t, n) {
  function r(i, o) {
    gt.link(i, o, (s) => {
      if (s) return n(s);
      n(null);
    });
  }
  gt.lstat(t, (i, o) => {
    gt.lstat(e, (s, a) => {
      if (s)
        return s.message = s.message.replace("lstat", "ensureLink"), n(s);
      if (o && fc(a, o)) return n(null);
      const c = cc.dirname(t);
      xh(c, (m, l) => {
        if (m) return n(m);
        if (l) return r(e, t);
        uc.mkdirs(c, (f) => {
          if (f) return n(f);
          r(e, t);
        });
      });
    });
  });
}
function Uh(e, t) {
  let n;
  try {
    n = gt.lstatSync(t);
  } catch {
  }
  try {
    const o = gt.lstatSync(e);
    if (n && fc(o, n)) return;
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureLink"), o;
  }
  const r = cc.dirname(t);
  return gt.existsSync(r) || uc.mkdirsSync(r), gt.linkSync(e, t);
}
var kh = {
  createLink: Fh(Lh),
  createLinkSync: Uh
};
const yt = te, Pn = Ie, Mh = Ht.pathExists;
function Bh(e, t, n) {
  if (yt.isAbsolute(e))
    return Pn.lstat(e, (r) => r ? (r.message = r.message.replace("lstat", "ensureSymlink"), n(r)) : n(null, {
      toCwd: e,
      toDst: e
    }));
  {
    const r = yt.dirname(t), i = yt.join(r, e);
    return Mh(i, (o, s) => o ? n(o) : s ? n(null, {
      toCwd: i,
      toDst: e
    }) : Pn.lstat(e, (a) => a ? (a.message = a.message.replace("lstat", "ensureSymlink"), n(a)) : n(null, {
      toCwd: e,
      toDst: yt.relative(r, e)
    })));
  }
}
function jh(e, t) {
  let n;
  if (yt.isAbsolute(e)) {
    if (n = Pn.existsSync(e), !n) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: e,
      toDst: e
    };
  } else {
    const r = yt.dirname(t), i = yt.join(r, e);
    if (n = Pn.existsSync(i), n)
      return {
        toCwd: i,
        toDst: e
      };
    if (n = Pn.existsSync(e), !n) throw new Error("relative srcpath does not exist");
    return {
      toCwd: e,
      toDst: yt.relative(r, e)
    };
  }
}
var Hh = {
  symlinkPaths: Bh,
  symlinkPathsSync: jh
};
const dc = Ie;
function Gh(e, t, n) {
  if (n = typeof t == "function" ? t : n, t = typeof t == "function" ? !1 : t, t) return n(null, t);
  dc.lstat(e, (r, i) => {
    if (r) return n(null, "file");
    t = i && i.isDirectory() ? "dir" : "file", n(null, t);
  });
}
function qh(e, t) {
  let n;
  if (t) return t;
  try {
    n = dc.lstatSync(e);
  } catch {
    return "file";
  }
  return n && n.isDirectory() ? "dir" : "file";
}
var Vh = {
  symlinkType: Gh,
  symlinkTypeSync: qh
};
const Wh = Pe.fromCallback, hc = te, Ve = jt, pc = rt, Yh = pc.mkdirs, zh = pc.mkdirsSync, mc = Hh, Xh = mc.symlinkPaths, Kh = mc.symlinkPathsSync, gc = Vh, Jh = gc.symlinkType, Qh = gc.symlinkTypeSync, Zh = Ht.pathExists, { areIdentical: Ec } = pn;
function ep(e, t, n, r) {
  r = typeof n == "function" ? n : r, n = typeof n == "function" ? !1 : n, Ve.lstat(t, (i, o) => {
    !i && o.isSymbolicLink() ? Promise.all([
      Ve.stat(e),
      Ve.stat(t)
    ]).then(([s, a]) => {
      if (Ec(s, a)) return r(null);
      Vs(e, t, n, r);
    }) : Vs(e, t, n, r);
  });
}
function Vs(e, t, n, r) {
  Xh(e, t, (i, o) => {
    if (i) return r(i);
    e = o.toDst, Jh(o.toCwd, n, (s, a) => {
      if (s) return r(s);
      const c = hc.dirname(t);
      Zh(c, (m, l) => {
        if (m) return r(m);
        if (l) return Ve.symlink(e, t, a, r);
        Yh(c, (f) => {
          if (f) return r(f);
          Ve.symlink(e, t, a, r);
        });
      });
    });
  });
}
function tp(e, t, n) {
  let r;
  try {
    r = Ve.lstatSync(t);
  } catch {
  }
  if (r && r.isSymbolicLink()) {
    const a = Ve.statSync(e), c = Ve.statSync(t);
    if (Ec(a, c)) return;
  }
  const i = Kh(e, t);
  e = i.toDst, n = Qh(i.toCwd, n);
  const o = hc.dirname(t);
  return Ve.existsSync(o) || zh(o), Ve.symlinkSync(e, t, n);
}
var np = {
  createSymlink: Wh(ep),
  createSymlinkSync: tp
};
const { createFile: Ws, createFileSync: Ys } = Dh, { createLink: zs, createLinkSync: Xs } = kh, { createSymlink: Ks, createSymlinkSync: Js } = np;
var rp = {
  // file
  createFile: Ws,
  createFileSync: Ys,
  ensureFile: Ws,
  ensureFileSync: Ys,
  // link
  createLink: zs,
  createLinkSync: Xs,
  ensureLink: zs,
  ensureLinkSync: Xs,
  // symlink
  createSymlink: Ks,
  createSymlinkSync: Js,
  ensureSymlink: Ks,
  ensureSymlinkSync: Js
};
function ip(e, { EOL: t = `
`, finalEOL: n = !0, replacer: r = null, spaces: i } = {}) {
  const o = n ? t : "", s = JSON.stringify(e, r, i);
  if (s === void 0)
    throw new TypeError(`Converting ${typeof e} value to JSON is not supported`);
  return s.replace(/\n/g, t) + o;
}
function op(e) {
  return Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, "");
}
var Bo = { stringify: ip, stripBom: op };
let fn;
try {
  fn = Ie;
} catch {
  fn = Tt;
}
const ri = Pe, { stringify: yc, stripBom: wc } = Bo;
async function sp(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const n = t.fs || fn, r = "throws" in t ? t.throws : !0;
  let i = await ri.fromCallback(n.readFile)(e, t);
  i = wc(i);
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
const ap = ri.fromPromise(sp);
function lp(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const n = t.fs || fn, r = "throws" in t ? t.throws : !0;
  try {
    let i = n.readFileSync(e, t);
    return i = wc(i), JSON.parse(i, t.reviver);
  } catch (i) {
    if (r)
      throw i.message = `${e}: ${i.message}`, i;
    return null;
  }
}
async function cp(e, t, n = {}) {
  const r = n.fs || fn, i = yc(t, n);
  await ri.fromCallback(r.writeFile)(e, i, n);
}
const up = ri.fromPromise(cp);
function fp(e, t, n = {}) {
  const r = n.fs || fn, i = yc(t, n);
  return r.writeFileSync(e, i, n);
}
var dp = {
  readFile: ap,
  readFileSync: lp,
  writeFile: up,
  writeFileSync: fp
};
const vr = dp;
var hp = {
  // jsonfile exports
  readJson: vr.readFile,
  readJsonSync: vr.readFileSync,
  writeJson: vr.writeFile,
  writeJsonSync: vr.writeFileSync
};
const pp = Pe.fromCallback, In = Ie, _c = te, vc = rt, mp = Ht.pathExists;
function gp(e, t, n, r) {
  typeof n == "function" && (r = n, n = "utf8");
  const i = _c.dirname(e);
  mp(i, (o, s) => {
    if (o) return r(o);
    if (s) return In.writeFile(e, t, n, r);
    vc.mkdirs(i, (a) => {
      if (a) return r(a);
      In.writeFile(e, t, n, r);
    });
  });
}
function Ep(e, ...t) {
  const n = _c.dirname(e);
  if (In.existsSync(n))
    return In.writeFileSync(e, ...t);
  vc.mkdirsSync(n), In.writeFileSync(e, ...t);
}
var jo = {
  outputFile: pp(gp),
  outputFileSync: Ep
};
const { stringify: yp } = Bo, { outputFile: wp } = jo;
async function _p(e, t, n = {}) {
  const r = yp(t, n);
  await wp(e, r, n);
}
var vp = _p;
const { stringify: Ap } = Bo, { outputFileSync: Sp } = jo;
function Tp(e, t, n) {
  const r = Ap(t, n);
  Sp(e, r, n);
}
var bp = Tp;
const Cp = Pe.fromPromise, Oe = hp;
Oe.outputJson = Cp(vp);
Oe.outputJsonSync = bp;
Oe.outputJSON = Oe.outputJson;
Oe.outputJSONSync = Oe.outputJsonSync;
Oe.writeJSON = Oe.writeJson;
Oe.writeJSONSync = Oe.writeJsonSync;
Oe.readJSON = Oe.readJson;
Oe.readJSONSync = Oe.readJsonSync;
var $p = Oe;
const Rp = Ie, po = te, Op = ko.copy, Ac = ni.remove, Pp = rt.mkdirp, Ip = Ht.pathExists, Qs = pn;
function Np(e, t, n, r) {
  typeof n == "function" && (r = n, n = {}), n = n || {};
  const i = n.overwrite || n.clobber || !1;
  Qs.checkPaths(e, t, "move", n, (o, s) => {
    if (o) return r(o);
    const { srcStat: a, isChangingCase: c = !1 } = s;
    Qs.checkParentPaths(e, a, t, "move", (m) => {
      if (m) return r(m);
      if (Dp(t)) return Zs(e, t, i, c, r);
      Pp(po.dirname(t), (l) => l ? r(l) : Zs(e, t, i, c, r));
    });
  });
}
function Dp(e) {
  const t = po.dirname(e);
  return po.parse(t).root === t;
}
function Zs(e, t, n, r, i) {
  if (r) return Di(e, t, n, i);
  if (n)
    return Ac(t, (o) => o ? i(o) : Di(e, t, n, i));
  Ip(t, (o, s) => o ? i(o) : s ? i(new Error("dest already exists.")) : Di(e, t, n, i));
}
function Di(e, t, n, r) {
  Rp.rename(e, t, (i) => i ? i.code !== "EXDEV" ? r(i) : Fp(e, t, n, r) : r());
}
function Fp(e, t, n, r) {
  Op(e, t, {
    overwrite: n,
    errorOnExist: !0
  }, (o) => o ? r(o) : Ac(e, r));
}
var xp = Np;
const Sc = Ie, mo = te, Lp = ko.copySync, Tc = ni.removeSync, Up = rt.mkdirpSync, ea = pn;
function kp(e, t, n) {
  n = n || {};
  const r = n.overwrite || n.clobber || !1, { srcStat: i, isChangingCase: o = !1 } = ea.checkPathsSync(e, t, "move", n);
  return ea.checkParentPathsSync(e, i, t, "move"), Mp(t) || Up(mo.dirname(t)), Bp(e, t, r, o);
}
function Mp(e) {
  const t = mo.dirname(e);
  return mo.parse(t).root === t;
}
function Bp(e, t, n, r) {
  if (r) return Fi(e, t, n);
  if (n)
    return Tc(t), Fi(e, t, n);
  if (Sc.existsSync(t)) throw new Error("dest already exists.");
  return Fi(e, t, n);
}
function Fi(e, t, n) {
  try {
    Sc.renameSync(e, t);
  } catch (r) {
    if (r.code !== "EXDEV") throw r;
    return jp(e, t, n);
  }
}
function jp(e, t, n) {
  return Lp(e, t, {
    overwrite: n,
    errorOnExist: !0
  }), Tc(e);
}
var Hp = kp;
const Gp = Pe.fromCallback;
var qp = {
  move: Gp(xp),
  moveSync: Hp
}, Ct = {
  // Export promiseified graceful-fs:
  ...jt,
  // Export extra methods:
  ...ko,
  ...Oh,
  ...rp,
  ...$p,
  ...rt,
  ...qp,
  ...jo,
  ...Ht,
  ...ni
}, Gt = {}, _t = {}, de = {}, vt = {};
Object.defineProperty(vt, "__esModule", { value: !0 });
vt.CancellationError = vt.CancellationToken = void 0;
const Vp = Fl;
class Wp extends Vp.EventEmitter {
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
      return Promise.reject(new go());
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
          o(new go());
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
vt.CancellationToken = Wp;
class go extends Error {
  constructor() {
    super("cancelled");
  }
}
vt.CancellationError = go;
var mn = {};
Object.defineProperty(mn, "__esModule", { value: !0 });
mn.newError = Yp;
function Yp(e, t) {
  const n = new Error(e);
  return n.code = t, n;
}
var fe = {}, Eo = { exports: {} }, Ar = { exports: {} }, xi, ta;
function zp() {
  if (ta) return xi;
  ta = 1;
  var e = 1e3, t = e * 60, n = t * 60, r = n * 24, i = r * 7, o = r * 365.25;
  xi = function(l, f) {
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
  return xi;
}
var Li, na;
function bc() {
  if (na) return Li;
  na = 1;
  function e(t) {
    r.debug = r, r.default = r, r.coerce = m, r.disable = a, r.enable = o, r.enabled = c, r.humanize = zp(), r.destroy = l, Object.keys(t).forEach((f) => {
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
      function A(...S) {
        if (!A.enabled)
          return;
        const R = A, N = Number(/* @__PURE__ */ new Date()), x = N - (h || N);
        R.diff = x, R.prev = h, R.curr = N, h = N, S[0] = r.coerce(S[0]), typeof S[0] != "string" && S.unshift("%O");
        let ee = 0;
        S[0] = S[0].replace(/%([a-zA-Z%])/g, (W, Ue) => {
          if (W === "%%")
            return "%";
          ee++;
          const E = r.formatters[Ue];
          if (typeof E == "function") {
            const G = S[ee];
            W = E.call(R, G), S.splice(ee, 1), ee--;
          }
          return W;
        }), r.formatArgs.call(R, S), (R.log || r.log).apply(R, S);
      }
      return A.namespace = f, A.useColors = r.useColors(), A.color = r.selectColor(f), A.extend = i, A.destroy = r.destroy, Object.defineProperty(A, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => g !== null ? g : (w !== r.namespaces && (w = r.namespaces, y = r.enabled(f)), y),
        set: (S) => {
          g = S;
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
  return Li = e, Li;
}
var ra;
function Xp() {
  return ra || (ra = 1, function(e, t) {
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
    e.exports = bc()(t);
    const { formatters: a } = e.exports;
    a.j = function(c) {
      try {
        return JSON.stringify(c);
      } catch (m) {
        return "[UnexpectedJSONParseError]: " + m.message;
      }
    };
  }(Ar, Ar.exports)), Ar.exports;
}
var Sr = { exports: {} }, Ui, ia;
function Kp() {
  return ia || (ia = 1, Ui = (e, t = process.argv) => {
    const n = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", r = t.indexOf(n + e), i = t.indexOf("--");
    return r !== -1 && (i === -1 || r < i);
  }), Ui;
}
var ki, oa;
function Jp() {
  if (oa) return ki;
  oa = 1;
  const e = Zr, t = xl, n = Kp(), { env: r } = process;
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
  return ki = {
    supportsColor: a,
    stdout: o(s(!0, t.isatty(1))),
    stderr: o(s(!0, t.isatty(2)))
  }, ki;
}
var sa;
function Qp() {
  return sa || (sa = 1, function(e, t) {
    const n = xl, r = No;
    t.init = l, t.log = a, t.formatArgs = o, t.save = c, t.load = m, t.useColors = i, t.destroy = r.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const h = Jp();
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
      const w = g.substring(6).toLowerCase().replace(/_([a-z])/g, (A, S) => S.toUpperCase());
      let y = process.env[g];
      return /^(yes|on|true|enabled)$/i.test(y) ? y = !0 : /^(no|off|false|disabled)$/i.test(y) ? y = !1 : y === "null" ? y = null : y = Number(y), h[w] = y, h;
    }, {});
    function i() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : n.isatty(process.stderr.fd);
    }
    function o(h) {
      const { namespace: g, useColors: w } = this;
      if (w) {
        const y = this.color, A = "\x1B[3" + (y < 8 ? y : "8;5;" + y), S = `  ${A};1m${g} \x1B[0m`;
        h[0] = S + h[0].split(`
`).join(`
` + S), h.push(A + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
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
    e.exports = bc()(t);
    const { formatters: f } = e.exports;
    f.o = function(h) {
      return this.inspectOpts.colors = this.useColors, r.inspect(h, this.inspectOpts).split(`
`).map((g) => g.trim()).join(" ");
    }, f.O = function(h) {
      return this.inspectOpts.colors = this.useColors, r.inspect(h, this.inspectOpts);
    };
  }(Sr, Sr.exports)), Sr.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Eo.exports = Xp() : Eo.exports = Qp();
var Zp = Eo.exports, Qn = {};
Object.defineProperty(Qn, "__esModule", { value: !0 });
Qn.ProgressCallbackTransform = void 0;
const em = Xn;
class tm extends em.Transform {
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
Qn.ProgressCallbackTransform = tm;
Object.defineProperty(fe, "__esModule", { value: !0 });
fe.DigestTransform = fe.HttpExecutor = fe.HttpError = void 0;
fe.addSensitiveRedirectHeader = lm;
fe.addSensitiveFieldPattern = cm;
fe.createHttpError = wo;
fe.parseJson = fm;
fe.configureRequestOptionsFromUrl = Pc;
fe.configureRequestUrl = qo;
fe.safeGetHeader = an;
fe.configureRequestOptions = qr;
fe.isSensitiveFieldName = Ic;
fe.hashSensitiveValue = Nc;
fe.safeStringifyJson = en;
const Cc = Kn, nm = Zp, rm = Tt, im = Xn, yo = bt, om = vt, aa = mn, sm = Qn, pt = (0, nm.default)("electron-builder"), Ho = (e) => e.toLowerCase().replace(/[-_]/g, ""), $c = /* @__PURE__ */ new Set(["authorization", "proxyauthorization", "privatetoken", "xapikey", "xauthtoken", "xaccesstoken", "xgitlabtoken", "cookie", "xcsrftoken"]), Rc = ["token", "password", "secret", "authorization", "credential", "apikey", "passphrase", "auth"], am = ["key"];
function lm(e) {
  $c.add(Ho(e));
}
function cm(e) {
  Rc.push(e.toLowerCase().replace(/[-_]/g, ""));
}
function wo(e, t = null) {
  return new Go(e.statusCode || -1, `${e.statusCode} ${e.statusMessage}` + (t == null ? "" : `
` + JSON.stringify(t, null, "  ")) + `
Headers: ` + en(e.headers), t);
}
const um = /* @__PURE__ */ new Map([
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
class Go extends Error {
  constructor(t, n = `HTTP error: ${um.get(t) || t}`, r = null) {
    super(n), this.statusCode = t, this.description = r, this.name = "HttpError", this.code = `HTTP_ERROR_${t}`;
  }
  isServerError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
}
fe.HttpError = Go;
function fm(e) {
  return e.then((t) => t == null || t.length === 0 ? null : JSON.parse(t));
}
class Zt {
  constructor() {
    this.maxRedirects = 10;
  }
  request(t, n = new om.CancellationToken(), r) {
    qr(t);
    const i = r == null ? void 0 : JSON.stringify(r), o = i ? Buffer.from(i) : void 0;
    if (o != null) {
      pt.enabled && pt(en(r));
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
    if (pt.enabled) {
      const { headers: o, auth: s, ...a } = t;
      pt(`Request: ${en(a)}`);
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
    if (pt.enabled) {
      const { headers: g, auth: w, ...y } = n;
      pt(`Response: ${t.statusCode} ${t.statusMessage}, request options: ${en(y)}`);
    }
    if (t.statusCode === 404) {
      o(wo(t, `method: ${n.method || "GET"} url: ${n.protocol || "https:"}//${n.hostname}${n.port ? `:${n.port}` : ""}${n.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
      return;
    } else if (t.statusCode === 204) {
      i();
      return;
    }
    const m = (c = t.statusCode) !== null && c !== void 0 ? c : 0, l = m >= 300 && m < 400, f = an(t, "location");
    if (l && f != null) {
      if (s > this.maxRedirects) {
        o(this.createMaxRedirectError());
        return;
      }
      this.doApiRequest(Zt.prepareRedirectUrlOptions(f, n), r, a, s).then(i).catch(o);
      return;
    }
    t.setEncoding("utf8");
    let h = "";
    t.on("error", o), t.on("data", (g) => h += g), t.on("end", () => {
      try {
        if (t.statusCode != null && t.statusCode >= 400) {
          const g = an(t, "content-type"), w = g != null && (Array.isArray(g) ? g.find((y) => y.includes("json")) != null : g.includes("json"));
          o(wo(t, `method: ${n.method || "GET"} url: ${n.protocol || "https:"}//${n.hostname}${n.port ? `:${n.port}` : ""}${n.path}

          Data:
          ${w ? en(JSON.parse(h)) : h}
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
      qo(t, a), qr(a), this.doDownload(a, {
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
      const s = an(o, "location");
      if (s != null) {
        r < this.maxRedirects ? this.doDownload(Zt.prepareRedirectUrlOptions(s, t), n, r++) : n.callback(this.createMaxRedirectError());
        return;
      }
      n.responseHandler == null ? hm(n, o) : n.responseHandler(o, n.callback);
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
    const r = Pc(t, { ...n }), i = r.headers;
    if (i == null)
      return r;
    const o = Zt.reconstructOriginalUrl(n), s = Oc(t, n);
    if (Zt.isCrossOriginRedirect(o, s)) {
      pt.enabled && pt(`Cross-origin redirect (${o.host} → ${s.host}): stripping sensitive headers`);
      for (const a of Object.keys(i))
        $c.has(Ho(a)) && delete i[a];
    }
    return r;
  }
  static reconstructOriginalUrl(t) {
    const n = t.protocol || "https:";
    if (!t.hostname)
      throw new Error("Missing hostname in request options");
    const r = t.hostname, i = t.port ? `:${t.port}` : "", o = t.path || "/";
    return new yo.URL(`${n}//${r}${i}${o}`);
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
        if (r < n && (i instanceof Go && i.isServerError() || i.code === "EPIPE")) {
          await new Promise((o) => setTimeout(o, 1e3 * (r + 1)));
          continue;
        }
        throw i;
      }
  }
}
fe.HttpExecutor = Zt;
function Oc(e, t) {
  try {
    return new yo.URL(e);
  } catch {
    const n = t.hostname, r = t.protocol || "https:", i = t.port ? `:${t.port}` : "", o = `${r}//${n}${i}`;
    return new yo.URL(e, o);
  }
}
function Pc(e, t) {
  const n = qr(t), r = Oc(e, t);
  return qo(r, n), n;
}
function qo(e, t) {
  t.protocol = e.protocol, t.hostname = e.hostname, e.port ? t.port = e.port : t.port && delete t.port, t.path = e.pathname + e.search;
}
class _o extends im.Transform {
  // noinspection JSUnusedGlobalSymbols
  get actual() {
    return this._actual;
  }
  constructor(t, n = "sha512", r = "base64") {
    super(), this.expected = t, this.algorithm = n, this.encoding = r, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, Cc.createHash)(n);
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
      throw (0, aa.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
    if (this._actual !== this.expected)
      throw (0, aa.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
    return null;
  }
}
fe.DigestTransform = _o;
function dm(e, t, n) {
  return e != null && t != null && e !== t ? (n(new Error(`checksum mismatch: expected ${t} but got ${e} (X-Checksum-Sha2 header)`)), !1) : !0;
}
function an(e, t) {
  const n = e.headers[t];
  return n == null ? null : Array.isArray(n) ? n.length === 0 ? null : n[n.length - 1] : n;
}
function hm(e, t) {
  if (!dm(an(t, "X-Checksum-Sha2"), e.options.sha2, e.callback))
    return;
  const n = [];
  if (e.options.onProgress != null) {
    const s = an(t, "content-length");
    s != null && n.push(new sm.ProgressCallbackTransform(parseInt(s, 10), e.options.cancellationToken, e.options.onProgress));
  }
  const r = e.options.sha512;
  r != null ? n.push(new _o(r, "sha512", r.length === 128 && !r.includes("+") && !r.includes("Z") && !r.includes("=") ? "hex" : "base64")) : e.options.sha2 != null && n.push(new _o(e.options.sha2, "sha256", "hex"));
  const i = (0, rm.createWriteStream)(e.destination);
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
function qr(e, t, n) {
  n != null && (e.method = n), e.headers = { ...e.headers };
  const r = e.headers;
  return t != null && (r.authorization = t.startsWith("Basic") || t.startsWith("Bearer") ? t : `token ${t}`), r["User-Agent"] == null && (r["User-Agent"] = "electron-builder"), (n == null || n === "GET" || r["Cache-Control"] == null) && (r["Cache-Control"] = "no-cache"), e.protocol == null && process.versions.electron != null && (e.protocol = "https:"), e;
}
function Ic(e) {
  const t = Ho(e);
  return Rc.some((n) => t.includes(n)) || am.some((n) => t.endsWith(n));
}
function Nc(e) {
  return `${(0, Cc.createHash)("sha256").update(e).digest("hex")} (sha256 hash)`;
}
function en(e, t) {
  return JSON.stringify(e, (n, r) => Ic(n) || t != null && t.has(n) ? typeof r == "string" ? Nc(r) : "<stripped sensitive data>" : r, 2);
}
var ii = {};
Object.defineProperty(ii, "__esModule", { value: !0 });
ii.MemoLazy = void 0;
class pm {
  constructor(t, n) {
    this.selector = t, this.creator = n, this.selected = void 0, this._value = void 0;
  }
  get hasValue() {
    return this._value !== void 0;
  }
  get value() {
    const t = this.selector();
    if (this._value !== void 0 && Dc(this.selected, t))
      return this._value;
    this.selected = t;
    const n = this.creator(t);
    return this.value = n, n;
  }
  set value(t) {
    this._value = t;
  }
}
ii.MemoLazy = pm;
function Dc(e, t) {
  if (typeof e == "object" && e !== null && (typeof t == "object" && t !== null)) {
    const i = Object.keys(e), o = Object.keys(t);
    return i.length === o.length && i.every((s) => Dc(e[s], t[s]));
  }
  return e === t;
}
var Zn = {};
Object.defineProperty(Zn, "__esModule", { value: !0 });
Zn.githubUrl = mm;
Zn.githubTagPrefix = gm;
Zn.getS3LikeProviderBaseUrl = Em;
function mm(e, t = "github.com") {
  return `${e.protocol || "https"}://${e.host || t}`;
}
function gm(e) {
  var t;
  return e.tagNamePrefix ? e.tagNamePrefix : !((t = e.vPrefixedTagName) !== null && t !== void 0) || t ? "v" : "";
}
function Em(e) {
  const t = e.provider;
  if (t === "s3")
    return ym(e);
  if (t === "spaces")
    return wm(e);
  throw new Error(`Not supported provider: ${t}`);
}
function ym(e) {
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
  return Fc(t, e.path);
}
function Fc(e, t) {
  return t != null && t.length > 0 && (t.startsWith("/") || (e += "/"), e += t), e;
}
function wm(e) {
  if (e.name == null)
    throw new Error("name is missing");
  if (e.region == null)
    throw new Error("region is missing");
  return Fc(`https://${e.name}.${e.region}.digitaloceanspaces.com`, e.path);
}
var Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
Vo.retry = xc;
const _m = vt;
async function xc(e, t) {
  var n;
  const { retries: r, interval: i, backoff: o = 0, attempt: s = 0, shouldRetry: a, cancellationToken: c = new _m.CancellationToken() } = t;
  try {
    return await e();
  } catch (m) {
    if (await Promise.resolve((n = a == null ? void 0 : a(m)) !== null && n !== void 0 ? n : !0) && r > 0 && !c.cancelled)
      return await new Promise((l) => setTimeout(l, i + o * s)), await xc(e, { ...t, retries: r - 1, attempt: s + 1 });
    throw m;
  }
}
var Wo = {};
Object.defineProperty(Wo, "__esModule", { value: !0 });
Wo.parseDn = vm;
function vm(e) {
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
var dn = {};
Object.defineProperty(dn, "__esModule", { value: !0 });
dn.nil = dn.UUID = void 0;
const Lc = Kn, Uc = mn, Am = "options.name must be either a string or a Buffer", la = (0, Lc.randomBytes)(16);
la[0] = la[0] | 1;
const Mr = {}, V = [];
for (let e = 0; e < 256; e++) {
  const t = (e + 256).toString(16).substr(1);
  Mr[t] = e, V[e] = t;
}
class Bt {
  constructor(t) {
    this.ascii = null, this.binary = null;
    const n = Bt.check(t);
    if (!n)
      throw new Error("not a UUID");
    this.version = n.version, n.format === "ascii" ? this.ascii = t : this.binary = t;
  }
  static v5(t, n) {
    return Sm(t, "sha1", 80, n);
  }
  toString() {
    return this.ascii == null && (this.ascii = Tm(this.binary)), this.ascii;
  }
  inspect() {
    return `UUID v${this.version} ${this.toString()}`;
  }
  static check(t, n = 0) {
    if (typeof t == "string")
      return t = t.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(t) ? t === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
        version: (Mr[t[14] + t[15]] & 240) >> 4,
        variant: ca((Mr[t[19] + t[20]] & 224) >> 5),
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
        variant: ca((t[n + 8] & 224) >> 5),
        format: "binary"
      };
    }
    throw (0, Uc.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
  }
  // read stringified uuid into a Buffer
  static parse(t) {
    const n = Buffer.allocUnsafe(16);
    let r = 0;
    for (let i = 0; i < 16; i++)
      n[i] = Mr[t[r++] + t[r++]], (i === 3 || i === 5 || i === 7 || i === 9) && (r += 1);
    return n;
  }
}
dn.UUID = Bt;
Bt.OID = Bt.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
function ca(e) {
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
var Nn;
(function(e) {
  e[e.ASCII = 0] = "ASCII", e[e.BINARY = 1] = "BINARY", e[e.OBJECT = 2] = "OBJECT";
})(Nn || (Nn = {}));
function Sm(e, t, n, r, i = Nn.ASCII) {
  const o = (0, Lc.createHash)(t);
  if (typeof e != "string" && !Buffer.isBuffer(e))
    throw (0, Uc.newError)(Am, "ERR_INVALID_UUID_NAME");
  o.update(r), o.update(e);
  const a = o.digest();
  let c;
  switch (i) {
    case Nn.BINARY:
      a[6] = a[6] & 15 | n, a[8] = a[8] & 63 | 128, c = a;
      break;
    case Nn.OBJECT:
      a[6] = a[6] & 15 | n, a[8] = a[8] & 63 | 128, c = new Bt(a);
      break;
    default:
      c = V[a[0]] + V[a[1]] + V[a[2]] + V[a[3]] + "-" + V[a[4]] + V[a[5]] + "-" + V[a[6] & 15 | n] + V[a[7]] + "-" + V[a[8] & 63 | 128] + V[a[9]] + "-" + V[a[10]] + V[a[11]] + V[a[12]] + V[a[13]] + V[a[14]] + V[a[15]];
      break;
  }
  return c;
}
function Tm(e) {
  return V[e[0]] + V[e[1]] + V[e[2]] + V[e[3]] + "-" + V[e[4]] + V[e[5]] + "-" + V[e[6]] + V[e[7]] + "-" + V[e[8]] + V[e[9]] + "-" + V[e[10]] + V[e[11]] + V[e[12]] + V[e[13]] + V[e[14]] + V[e[15]];
}
dn.nil = new Bt("00000000-0000-0000-0000-000000000000");
var er = {}, kc = {};
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
      var T = this;
      o(T), T.q = T.c = "", T.bufferCheckPosition = t.MAX_BUFFER_LENGTH, T.opt = u || {}, T.opt.lowercase = T.opt.lowercase || T.opt.lowercasetags, T.looseCase = T.opt.lowercase ? "toLowerCase" : "toUpperCase", T.tags = [], T.closed = T.closedRoot = T.sawRoot = !1, T.tag = T.error = null, T.strict = !!d, T.noscript = !!(d || T.opt.noscript), T.state = E.BEGIN, T.strictEntities = T.opt.strictEntities, T.ENTITIES = T.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), T.attribList = [], T.opt.xmlns && (T.ns = Object.create(y)), T.opt.unquotedAttributeValues === void 0 && (T.opt.unquotedAttributeValues = !d), T.trackPosition = T.opt.position !== !1, T.trackPosition && (T.position = T.line = T.column = 0), B(T, "onready");
    }
    Object.create || (Object.create = function(d) {
      function u() {
      }
      u.prototype = d;
      var T = new u();
      return T;
    }), Object.keys || (Object.keys = function(d) {
      var u = [];
      for (var T in d) d.hasOwnProperty(T) && u.push(T);
      return u;
    });
    function i(d) {
      for (var u = Math.max(t.MAX_BUFFER_LENGTH, 10), T = 0, v = 0, Y = n.length; v < Y; v++) {
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
        T = Math.max(T, Q);
      }
      var ie = t.MAX_BUFFER_LENGTH - T;
      d.bufferCheckPosition = ie + d.position;
    }
    function o(d) {
      for (var u = 0, T = n.length; u < T; u++)
        d[n[u]] = "";
    }
    function s(d) {
      X(d), d.cdata !== "" && (M(d, "oncdata", d.cdata), d.cdata = ""), d.script !== "" && (M(d, "onscript", d.script), d.script = "");
    }
    r.prototype = {
      end: function() {
        I(this);
      },
      write: Je,
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
      var T = this;
      this._parser.onend = function() {
        T.emit("end");
      }, this._parser.onerror = function(v) {
        T.emit("error", v), T._parser.error = null;
      }, this._decoder = null, c.forEach(function(v) {
        Object.defineProperty(T, "on" + v, {
          get: function() {
            return T._parser["on" + v];
          },
          set: function(Y) {
            if (!Y)
              return T.removeAllListeners(v), T._parser["on" + v] = Y, Y;
            T.on(v, Y);
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
          var u = dd.StringDecoder;
          this._decoder = new u("utf8");
        }
        d = this._decoder.write(d);
      }
      return this._parser.write(d.toString()), this.emit("data", d), !0;
    }, l.prototype.end = function(d) {
      return d && d.length && this.write(d), this._parser.end(), !0;
    }, l.prototype.on = function(d, u) {
      var T = this;
      return !T._parser["on" + d] && c.indexOf(d) !== -1 && (T._parser["on" + d] = function() {
        var v = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        v.splice(0, 0, d), T.emit.apply(T, v);
      }), a.prototype.on.call(T, d, u);
    };
    var f = "[CDATA[", h = "DOCTYPE", g = "http://www.w3.org/XML/1998/namespace", w = "http://www.w3.org/2000/xmlns/", y = { xml: g, xmlns: w }, A = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, S = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, R = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, N = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
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
    function Ue(d, u) {
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
      var u = t.ENTITIES[d], T = typeof u == "number" ? String.fromCharCode(u) : u;
      t.ENTITIES[d] = T;
    });
    for (var G in t.STATE)
      t.STATE[t.STATE[G]] = G;
    E = t.STATE;
    function B(d, u, T) {
      d[u] && d[u](T);
    }
    function M(d, u, T) {
      d.textNode && X(d), B(d, u, T);
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
    function I(d) {
      return d.sawRoot && !d.closedRoot && b(d, "Unclosed root tag"), d.state !== E.BEGIN && d.state !== E.BEGIN_WHITESPACE && d.state !== E.TEXT && C(d, "Unexpected end"), X(d), d.c = "", d.closed = !0, B(d, "onend"), r.call(d, d.strict, d.opt), d;
    }
    function b(d, u) {
      if (typeof d != "object" || !(d instanceof r))
        throw new Error("bad call to strictFail");
      d.strict && C(d, u);
    }
    function D(d) {
      d.strict || (d.tagName = d.tagName[d.looseCase]());
      var u = d.tags[d.tags.length - 1] || d, T = d.tag = { name: d.tagName, attributes: {} };
      d.opt.xmlns && (T.ns = u.ns), d.attribList.length = 0, M(d, "onopentagstart", T);
    }
    function P(d, u) {
      var T = d.indexOf(":"), v = T < 0 ? ["", d] : d.split(":"), Y = v[0], Q = v[1];
      return u && d === "xmlns" && (Y = "xmlns", Q = ""), { prefix: Y, local: Q };
    }
    function k(d) {
      if (d.strict || (d.attribName = d.attribName[d.looseCase]()), d.attribList.indexOf(d.attribName) !== -1 || d.tag.attributes.hasOwnProperty(d.attribName)) {
        d.attribName = d.attribValue = "";
        return;
      }
      if (d.opt.xmlns) {
        var u = P(d.attribName, !0), T = u.prefix, v = u.local;
        if (T === "xmlns")
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
        var T = d.tag, v = P(d.tagName);
        T.prefix = v.prefix, T.local = v.local, T.uri = T.ns[v.prefix] || "", T.prefix && !T.uri && (b(
          d,
          "Unbound namespace prefix: " + JSON.stringify(d.tagName)
        ), T.uri = v.prefix);
        var Y = d.tags[d.tags.length - 1] || d;
        T.ns && Y.ns !== T.ns && Object.keys(T.ns).forEach(function(ur) {
          M(d, "onopennamespace", {
            prefix: ur,
            uri: T.ns[ur]
          });
        });
        for (var Q = 0, ie = d.attribList.length; Q < ie; Q++) {
          var ge = d.attribList[Q], ve = ge[0], ct = ge[1], ue = P(ve, !0), He = ue.prefix, Si = ue.local, cr = He === "" ? "" : T.ns[He] || "", wn = {
            name: ve,
            value: ct,
            prefix: He,
            local: Si,
            uri: cr
          };
          He && He !== "xmlns" && !cr && (b(
            d,
            "Unbound namespace prefix: " + JSON.stringify(He)
          ), wn.uri = He), d.tag.attributes[ve] = wn, M(d, "onattribute", wn);
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
      var u = d.tags.length, T = d.tagName;
      d.strict || (T = T[d.looseCase]());
      for (var v = T; u--; ) {
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
      d.tagName = T;
      for (var Q = d.tags.length; Q-- > u; ) {
        var ie = d.tag = d.tags.pop();
        d.tagName = d.tag.name, M(d, "onclosetag", d.tagName);
        var ge = {};
        for (var ve in ie.ns)
          ge[ve] = ie.ns[ve];
        var ct = d.tags[d.tags.length - 1] || d;
        d.opt.xmlns && ie.ns !== ct.ns && Object.keys(ie.ns).forEach(function(ue) {
          var He = ie.ns[ue];
          M(d, "onclosenamespace", { prefix: ue, uri: He });
        });
      }
      u === 0 && (d.closedRoot = !0), d.tagName = d.attribValue = d.attribName = "", d.attribList.length = 0, d.state = E.TEXT;
    }
    function K(d) {
      var u = d.entity, T = u.toLowerCase(), v, Y = "";
      return d.ENTITIES[u] ? d.ENTITIES[u] : d.ENTITIES[T] ? d.ENTITIES[T] : (u = T, u.charAt(0) === "#" && (u.charAt(1) === "x" ? (u = u.slice(2), v = parseInt(u, 16), Y = v.toString(16)) : (u = u.slice(1), v = parseInt(u, 10), Y = v.toString(10))), u = u.replace(/^0+/, ""), isNaN(v) || Y.toLowerCase() !== u || v < 0 || v > 1114111 ? (b(d, "Invalid character entity"), "&" + d.entity + ";") : String.fromCodePoint(v));
    }
    function he(d, u) {
      u === "<" ? (d.state = E.OPEN_WAKA, d.startTagPosition = d.position) : x(u) || (b(d, "Non-whitespace before first tag."), d.textNode = u, d.state = E.TEXT);
    }
    function U(d, u) {
      var T = "";
      return u < d.length && (T = d.charAt(u)), T;
    }
    function Je(d) {
      var u = this;
      if (this.error)
        throw this.error;
      if (u.closed)
        return C(
          u,
          "Cannot write after close. Assign an onready handler."
        );
      if (d === null)
        return I(u);
      typeof d == "object" && (d = d.toString());
      for (var T = 0, v = ""; v = U(d, T++), u.c = v, !!v; )
        switch (u.trackPosition && (u.position++, v === `
` ? (u.line++, u.column = 0) : u.column++), u.state) {
          case E.BEGIN:
            if (u.state = E.BEGIN_WHITESPACE, v === "\uFEFF")
              continue;
            he(u, v);
            continue;
          case E.BEGIN_WHITESPACE:
            he(u, v);
            continue;
          case E.TEXT:
            if (u.sawRoot && !u.closedRoot) {
              for (var Q = T - 1; v && v !== "<" && v !== "&"; )
                v = U(d, T++), v && u.trackPosition && (u.position++, v === `
` ? (u.line++, u.column = 0) : u.column++);
              u.textNode += d.substring(Q, T - 1);
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
            for (var Q = T - 1; v && v !== "]"; )
              v = U(d, T++), v && u.trackPosition && (u.position++, v === `
` ? (u.line++, u.column = 0) : u.column++);
            u.cdata += d.substring(Q, T - 1), v === "]" && (u.state = E.CDATA_ENDING);
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
            W(S, v) ? u.tagName += v : (D(u), v === ">" ? q(u) : v === "/" ? u.state = E.OPEN_TAG_SLASH : (x(v) || b(u, "Invalid character in tag name"), u.state = E.ATTRIB));
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
            v === "=" ? u.state = E.ATTRIB_VALUE : v === ">" ? (b(u, "Attribute without value"), u.attribValue = u.attribName, k(u), q(u)) : x(v) ? u.state = E.ATTRIB_NAME_SAW_WHITE : W(S, v) ? u.attribName += v : b(u, "Invalid attribute name");
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
              v === ">" ? j(u) : W(S, v) ? u.tagName += v : u.script ? (u.script += "</" + u.tagName, u.tagName = "", u.state = E.SCRIPT) : (x(v) || b(u, "Invalid tagname in closing tag"), u.state = E.CLOSE_TAG_SAW_WHITE);
            else {
              if (x(v))
                continue;
              Ue(A, v) ? u.script ? (u.script += "</" + v, u.state = E.SCRIPT) : b(u, "Invalid tagname in closing tag.") : u.tagName = v;
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
            var ie, ge;
            switch (u.state) {
              case E.TEXT_ENTITY:
                ie = E.TEXT, ge = "textNode";
                break;
              case E.ATTRIB_VALUE_ENTITY_Q:
                ie = E.ATTRIB_VALUE_QUOTED, ge = "attribValue";
                break;
              case E.ATTRIB_VALUE_ENTITY_U:
                ie = E.ATTRIB_VALUE_UNQUOTED, ge = "attribValue";
                break;
            }
            if (v === ";") {
              var ve = K(u);
              u.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(ve) ? (u.entity = "", u.state = ie, u.write(ve)) : (u[ge] += ve, u.entity = "", u.state = ie);
            } else W(u.entity.length ? N : R, v) ? u.entity += v : (b(u, "Invalid character in entity name"), u[ge] += "&" + u.entity + v, u.entity = "", u.state = ie);
            continue;
          default:
            throw new Error(u, "Unknown state: " + u.state);
        }
      return u.position >= u.bufferCheckPosition && i(u), u;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    String.fromCodePoint || function() {
      var d = String.fromCharCode, u = Math.floor, T = function() {
        var v = 16384, Y = [], Q, ie, ge = -1, ve = arguments.length;
        if (!ve)
          return "";
        for (var ct = ""; ++ge < ve; ) {
          var ue = Number(arguments[ge]);
          if (!isFinite(ue) || // `NaN`, `+Infinity`, or `-Infinity`
          ue < 0 || // not a valid Unicode code point
          ue > 1114111 || // not a valid Unicode code point
          u(ue) !== ue)
            throw RangeError("Invalid code point: " + ue);
          ue <= 65535 ? Y.push(ue) : (ue -= 65536, Q = (ue >> 10) + 55296, ie = ue % 1024 + 56320, Y.push(Q, ie)), (ge + 1 === ve || Y.length > v) && (ct += d.apply(null, Y), Y.length = 0);
        }
        return ct;
      };
      Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
        value: T,
        configurable: !0,
        writable: !0
      }) : String.fromCodePoint = T;
    }();
  })(e);
})(kc);
Object.defineProperty(er, "__esModule", { value: !0 });
er.XElement = void 0;
er.parseXml = Rm;
const bm = kc, Tr = mn;
class Mc {
  constructor(t) {
    if (this.name = t, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !t)
      throw (0, Tr.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
    if (!$m(t))
      throw (0, Tr.newError)(`Invalid element name: ${t}`, "ERR_XML_ELEMENT_INVALID_NAME");
  }
  attribute(t) {
    const n = this.attributes === null ? null : this.attributes[t];
    if (n == null)
      throw (0, Tr.newError)(`No attribute "${t}"`, "ERR_XML_MISSED_ATTRIBUTE");
    return n;
  }
  removeAttribute(t) {
    this.attributes !== null && delete this.attributes[t];
  }
  element(t, n = !1, r = null) {
    const i = this.elementOrNull(t, n);
    if (i === null)
      throw (0, Tr.newError)(r || `No element "${t}"`, "ERR_XML_MISSED_ELEMENT");
    return i;
  }
  elementOrNull(t, n = !1) {
    if (this.elements === null)
      return null;
    for (const r of this.elements)
      if (ua(r, t, n))
        return r;
    return null;
  }
  getElements(t, n = !1) {
    return this.elements === null ? [] : this.elements.filter((r) => ua(r, t, n));
  }
  elementValueOrEmpty(t, n = !1) {
    const r = this.elementOrNull(t, n);
    return r === null ? "" : r.value;
  }
}
er.XElement = Mc;
const Cm = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
function $m(e) {
  return Cm.test(e);
}
function ua(e, t, n) {
  const r = e.name;
  return r === t || n === !0 && r.length === t.length && r.toLowerCase() === t.toLowerCase();
}
function Rm(e) {
  let t = null;
  const n = bm.parser(!0, {}), r = [];
  return n.onopentag = (i) => {
    const o = new Mc(i.name);
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
var qt = {};
Object.defineProperty(qt, "__esModule", { value: !0 });
qt.mapToObject = Bc;
qt.isValidKey = oi;
qt.asArray = Om;
qt.deepAssign = Im;
qt.objectToArgs = Fm;
function Bc(e) {
  const t = {};
  for (const [n, r] of e)
    oi(n) && (r instanceof Map ? t[n] = Bc(r) : t[n] = r);
  return t;
}
function oi(e) {
  return ["__proto__", "prototype", "constructor"].includes(e) ? !1 : ["string", "number", "symbol", "boolean"].includes(typeof e) || e === null;
}
function Om(e) {
  return e == null ? [] : Array.isArray(e) ? e : [e];
}
function fa(e) {
  if (Array.isArray(e))
    return !1;
  const t = typeof e;
  return t === "object" || t === "function";
}
function Pm(e, t, n) {
  const r = t[n];
  if (r === void 0)
    return;
  const i = e[n];
  i == null || r == null || !fa(i) || !fa(r) ? Array.isArray(i) && Array.isArray(r) ? e[n] = Array.from(new Set(i.concat(r))) : e[n] = r : e[n] = jc(i, r);
}
function jc(e, t) {
  if (e !== t)
    for (const n of Object.getOwnPropertyNames(t))
      oi(n) && Pm(e, t, n);
  return e;
}
function Im(e, ...t) {
  for (const n of t)
    n != null && jc(e, n);
  return e;
}
const Nm = /^[a-zA-Z][a-zA-Z0-9-]*$/, Dm = /[\0\r\n]/;
function Fm(e) {
  const t = Object.entries(e).reduce((n, [r, i]) => {
    if (!oi(r) || i == null)
      return n;
    if (!Nm.test(r))
      throw new Error(`objectToArgs: unsafe flag name rejected: ${JSON.stringify(r)}`);
    if (Dm.test(i))
      throw new Error(`objectToArgs: value for --${r} contains a null byte or newline`);
    return n.concat([`--${r}`, i]);
  }, []);
  return Object.freeze(t);
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.objectToArgs = e.deepAssign = e.asArray = e.mapToObject = e.isValidKey = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.isSensitiveFieldName = e.HttpExecutor = e.hashSensitiveValue = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0;
  var t = vt;
  Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
    return t.CancellationError;
  } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } });
  var n = mn;
  Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
    return n.newError;
  } });
  var r = fe;
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
  var i = ii;
  Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
    return i.MemoLazy;
  } });
  var o = Qn;
  Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
    return o.ProgressCallbackTransform;
  } });
  var s = Zn;
  Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
    return s.getS3LikeProviderBaseUrl;
  } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
    return s.githubUrl;
  } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
    return s.githubTagPrefix;
  } });
  var a = Vo;
  Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
    return a.retry;
  } });
  var c = Wo;
  Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
    return c.parseDn;
  } });
  var m = dn;
  Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
    return m.UUID;
  } });
  var l = er;
  Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
    return l.parseXml;
  } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
    return l.XElement;
  } });
  var f = qt;
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
})(de);
var _e = {}, Yo = {}, Ye = {};
function Hc(e) {
  return typeof e > "u" || e === null;
}
function xm(e) {
  return typeof e == "object" && e !== null;
}
function Lm(e) {
  return Array.isArray(e) ? e : Hc(e) ? [] : [e];
}
function Um(e, t) {
  if (t) {
    const n = Object.keys(t);
    for (let r = 0, i = n.length; r < i; r += 1) {
      const o = n[r];
      e[o] = t[o];
    }
  }
  return e;
}
function km(e, t) {
  let n = "";
  for (let r = 0; r < t; r += 1)
    n += e;
  return n;
}
function Mm(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
Ye.isNothing = Hc;
Ye.isObject = xm;
Ye.toArray = Lm;
Ye.repeat = km;
Ye.isNegativeZero = Mm;
Ye.extend = Um;
function Gc(e, t) {
  let n = "";
  const r = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (n += 'in "' + e.mark.name + '" '), n += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (n += `

` + e.mark.snippet), r + " " + n) : r;
}
function Mn(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Gc(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
Mn.prototype = Object.create(Error.prototype);
Mn.prototype.constructor = Mn;
Mn.prototype.toString = function(t) {
  return this.name + ": " + Gc(this, t);
};
var tr = Mn;
const $n = Ye;
function Mi(e, t, n, r, i) {
  let o = "", s = "";
  const a = Math.floor(i / 2) - 1;
  return r - t > a && (o = " ... ", t = r - a + o.length), n - r > a && (s = " ...", n = r + a - s.length), {
    str: o + e.slice(t, n).replace(/\t/g, "→") + s,
    pos: r - t + o.length
    // relative position
  };
}
function Bi(e, t) {
  return $n.repeat(" ", t - e.length) + e;
}
function Bm(e, t) {
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
    const h = Mi(
      e.buffer,
      r[s - f],
      i[s - f],
      e.position - (r[s] - r[s - f]),
      m
    );
    a = $n.repeat(" ", t.indent) + Bi((e.line - f + 1).toString(), c) + " | " + h.str + `
` + a;
  }
  const l = Mi(e.buffer, r[s], i[s], e.position, m);
  a += $n.repeat(" ", t.indent) + Bi((e.line + 1).toString(), c) + " | " + l.str + `
`, a += $n.repeat("-", t.indent + c + 3 + l.pos) + `^
`;
  for (let f = 1; f <= t.linesAfter && !(s + f >= i.length); f++) {
    const h = Mi(
      e.buffer,
      r[s + f],
      i[s + f],
      e.position - (r[s] - r[s + f]),
      m
    );
    a += $n.repeat(" ", t.indent) + Bi((e.line + f + 1).toString(), c) + " | " + h.str + `
`;
  }
  return a.replace(/\n$/, "");
}
var jm = Bm;
const da = tr, Hm = [
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
], Gm = [
  "scalar",
  "sequence",
  "mapping"
];
function qm(e) {
  const t = {};
  return e !== null && Object.keys(e).forEach(function(n) {
    e[n].forEach(function(r) {
      t[String(r)] = n;
    });
  }), t;
}
function Vm(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(n) {
    if (Hm.indexOf(n) === -1)
      throw new da('Unknown option "' + n + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(n) {
    return n;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = qm(t.styleAliases || null), Gm.indexOf(this.kind) === -1)
    throw new da('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var Ne = Vm;
const Tn = tr, ji = Ne;
function ha(e, t) {
  const n = [];
  return e[t].forEach(function(r) {
    let i = n.length;
    n.forEach(function(o, s) {
      o.tag === r.tag && o.kind === r.kind && o.multi === r.multi && (i = s);
    }), n[i] = r;
  }), n;
}
function Wm() {
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
function vo(e) {
  return this.extend(e);
}
vo.prototype.extend = function(t) {
  let n = [], r = [];
  if (t instanceof ji)
    r.push(t);
  else if (Array.isArray(t))
    r = r.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (n = n.concat(t.implicit)), t.explicit && (r = r.concat(t.explicit));
  else
    throw new Tn("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  n.forEach(function(o) {
    if (!(o instanceof ji))
      throw new Tn("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new Tn("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new Tn("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), r.forEach(function(o) {
    if (!(o instanceof ji))
      throw new Tn("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  const i = Object.create(vo.prototype);
  return i.implicit = (this.implicit || []).concat(n), i.explicit = (this.explicit || []).concat(r), i.compiledImplicit = ha(i, "implicit"), i.compiledExplicit = ha(i, "explicit"), i.compiledTypeMap = Wm(i.compiledImplicit, i.compiledExplicit), i;
};
var qc = vo;
const Ym = Ne;
var Vc = new Ym("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
});
const zm = Ne;
var Wc = new zm("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
});
const Xm = Ne;
var Yc = new Xm("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
});
const Km = qc;
var zc = new Km({
  explicit: [
    Vc,
    Wc,
    Yc
  ]
});
const Jm = Ne;
function Qm(e) {
  if (e === null) return !0;
  const t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function Zm() {
  return null;
}
function eg(e) {
  return e === null;
}
var Xc = new Jm("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: Qm,
  construct: Zm,
  predicate: eg,
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
const tg = Ne;
function ng(e) {
  if (e === null) return !1;
  const t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function rg(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function ig(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var Kc = new tg("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: ng,
  construct: rg,
  predicate: ig,
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
const og = Ye, sg = Ne;
function ag(e) {
  return e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102;
}
function lg(e) {
  return e >= 48 && e <= 55;
}
function cg(e) {
  return e >= 48 && e <= 57;
}
function ug(e) {
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
      return r && isFinite(Rn(e));
    }
    if (i === "x") {
      for (n++; n < t; n++) {
        if (!ag(e.charCodeAt(n))) return !1;
        r = !0;
      }
      return r && isFinite(Rn(e));
    }
    if (i === "o") {
      for (n++; n < t; n++) {
        if (!lg(e.charCodeAt(n))) return !1;
        r = !0;
      }
      return r && isFinite(Rn(e));
    }
  }
  for (; n < t; n++) {
    if (!cg(e.charCodeAt(n)))
      return !1;
    r = !0;
  }
  return r ? isFinite(Rn(e)) : !1;
}
function Rn(e) {
  let t = e, n = 1, r = t[0];
  if ((r === "-" || r === "+") && (r === "-" && (n = -1), t = t.slice(1), r = t[0]), t === "0") return 0;
  if (r === "0") {
    if (t[1] === "b") return n * parseInt(t.slice(2), 2);
    if (t[1] === "x") return n * parseInt(t.slice(2), 16);
    if (t[1] === "o") return n * parseInt(t.slice(2), 8);
  }
  return n * parseInt(t, 10);
}
function fg(e) {
  return Rn(e);
}
function dg(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !og.isNegativeZero(e);
}
var Jc = new sg("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: ug,
  construct: fg,
  predicate: dg,
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
const Qc = Ye, hg = Ne, pg = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
), mg = new RegExp(
  "^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function gg(e) {
  return e === null || !pg.test(e) ? !1 : isFinite(parseFloat(e, 10)) ? !0 : mg.test(e);
}
function Eg(e) {
  let t = e.toLowerCase();
  const n = t[0] === "-" ? -1 : 1;
  return "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? n === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : n * parseFloat(t, 10);
}
const yg = /^[-+]?[0-9]+e/;
function wg(e, t) {
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
  else if (Qc.isNegativeZero(e))
    return "-0.0";
  const n = e.toString(10);
  return yg.test(n) ? n.replace("e", ".e") : n;
}
function _g(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || Qc.isNegativeZero(e));
}
var Zc = new hg("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: gg,
  construct: Eg,
  predicate: _g,
  represent: wg,
  defaultStyle: "lowercase"
}), eu = zc.extend({
  implicit: [
    Xc,
    Kc,
    Jc,
    Zc
  ]
}), tu = eu;
const vg = Ne, nu = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), ru = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function Ag(e) {
  return e === null ? !1 : nu.exec(e) !== null || ru.exec(e) !== null;
}
function Sg(e) {
  let t = 0, n = null, r = nu.exec(e);
  if (r === null && (r = ru.exec(e)), r === null) throw new Error("Date resolve error");
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
function Tg(e) {
  return e.toISOString();
}
var iu = new vg("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: Ag,
  construct: Sg,
  instanceOf: Date,
  represent: Tg
});
const bg = Ne;
function Cg(e) {
  return e === "<<" || e === null;
}
var ou = new bg("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: Cg
});
const $g = Ne, zo = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function Rg(e) {
  if (e === null) return !1;
  let t = 0;
  const n = e.length, r = zo;
  for (let i = 0; i < n; i++) {
    const o = r.indexOf(e.charAt(i));
    if (!(o > 64)) {
      if (o < 0) return !1;
      t += 6;
    }
  }
  return t % 8 === 0;
}
function Og(e) {
  const t = e.replace(/[\r\n=]/g, ""), n = t.length, r = zo;
  let i = 0;
  const o = [];
  for (let a = 0; a < n; a++)
    a % 4 === 0 && a && (o.push(i >> 16 & 255), o.push(i >> 8 & 255), o.push(i & 255)), i = i << 6 | r.indexOf(t.charAt(a));
  const s = n % 4 * 6;
  return s === 0 ? (o.push(i >> 16 & 255), o.push(i >> 8 & 255), o.push(i & 255)) : s === 18 ? (o.push(i >> 10 & 255), o.push(i >> 2 & 255)) : s === 12 && o.push(i >> 4 & 255), new Uint8Array(o);
}
function Pg(e) {
  let t = "", n = 0;
  const r = e.length, i = zo;
  for (let s = 0; s < r; s++)
    s % 3 === 0 && s && (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]), n = (n << 8) + e[s];
  const o = r % 3;
  return o === 0 ? (t += i[n >> 18 & 63], t += i[n >> 12 & 63], t += i[n >> 6 & 63], t += i[n & 63]) : o === 2 ? (t += i[n >> 10 & 63], t += i[n >> 4 & 63], t += i[n << 2 & 63], t += i[64]) : o === 1 && (t += i[n >> 2 & 63], t += i[n << 4 & 63], t += i[64], t += i[64]), t;
}
function Ig(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var su = new $g("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: Rg,
  construct: Og,
  predicate: Ig,
  represent: Pg
});
const Ng = Ne, pa = Object.prototype.hasOwnProperty, Dg = Object.prototype.toString;
function Fg(e) {
  if (e === null) return !0;
  const t = {}, n = e;
  for (let r = 0, i = n.length; r < i; r += 1) {
    const o = n[r];
    let s = !1;
    if (Dg.call(o) !== "[object Object]") return !1;
    let a;
    for (a in o)
      if (pa.call(o, a))
        if (!s) s = !0;
        else return !1;
    if (!s || pa.call(t, a)) return !1;
    Object.defineProperty(t, a, { value: !0 });
  }
  return !0;
}
function xg(e) {
  return e !== null ? e : [];
}
var au = new Ng("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: Fg,
  construct: xg
});
const Lg = Ne, Ug = Object.prototype.toString;
function kg(e) {
  if (e === null) return !0;
  const t = e, n = new Array(t.length);
  for (let r = 0, i = t.length; r < i; r += 1) {
    const o = t[r];
    if (Ug.call(o) !== "[object Object]") return !1;
    const s = Object.keys(o);
    if (s.length !== 1) return !1;
    n[r] = [s[0], o[s[0]]];
  }
  return !0;
}
function Mg(e) {
  if (e === null) return [];
  const t = e, n = new Array(t.length);
  for (let r = 0, i = t.length; r < i; r += 1) {
    const o = t[r], s = Object.keys(o);
    n[r] = [s[0], o[s[0]]];
  }
  return n;
}
var lu = new Lg("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: kg,
  construct: Mg
});
const Bg = Ne, jg = Object.prototype.hasOwnProperty;
function Hg(e) {
  if (e === null) return !0;
  const t = e;
  for (const n in t)
    if (jg.call(t, n) && t[n] !== null)
      return !1;
  return !0;
}
function Gg(e) {
  return e !== null ? e : {};
}
var cu = new Bg("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: Hg,
  construct: Gg
}), Xo = tu.extend({
  implicit: [
    iu,
    ou
  ],
  explicit: [
    su,
    au,
    lu,
    cu
  ]
});
const xt = Ye, uu = tr, qg = jm, Vg = Xo, We = Object.prototype.hasOwnProperty, Vr = 1, fu = 2, du = 3, Wr = 4, Hi = 1, Wg = 2, ma = 3, Yg = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, zg = /[\x85\u2028\u2029]/, Xg = /[,\[\]{}]/, hu = /^(?:!|!!|![0-9A-Za-z-]+!)$/, pu = /^(?:!|[^,\[\]{}])(?:%[0-9a-f]{2}|[0-9a-z\-#;/?:@&=+$,_.!~*'()\[\]])*$/i;
function ga(e) {
  return Object.prototype.toString.call(e);
}
function tt(e) {
  return e === 10 || e === 13;
}
function at(e) {
  return e === 9 || e === 32;
}
function Le(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function tn(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Kg(e) {
  if (e >= 48 && e <= 57)
    return e - 48;
  const t = e | 32;
  return t >= 97 && t <= 102 ? t - 97 + 10 : -1;
}
function Jg(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function Qg(e) {
  return e >= 48 && e <= 57 ? e - 48 : -1;
}
function Ea(e) {
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
function Zg(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function mu(e, t, n) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: n
  }) : e[t] = n;
}
const gu = new Array(256), Eu = new Array(256);
for (let e = 0; e < 256; e++)
  gu[e] = Ea(e) ? 1 : 0, Eu[e] = Ea(e);
function e0(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || Vg, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.maxDepth = typeof t.maxDepth == "number" ? t.maxDepth : 100, this.maxTotalMergeKeys = typeof t.maxTotalMergeKeys == "number" ? t.maxTotalMergeKeys : 1e4, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.depth = 0, this.totalMergeKeys = 0, this.firstTabInLine = -1, this.documents = [], this.anchorMapTransactions = [];
}
function yu(e, t) {
  const n = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return n.snippet = qg(n), new uu(t, n);
}
function L(e, t) {
  throw yu(e, t);
}
function Yr(e, t) {
  e.onWarning && e.onWarning.call(null, yu(e, t));
}
function Lt(e, t, n) {
  const r = e.anchorMapTransactions;
  if (r.length !== 0) {
    const i = r[r.length - 1];
    We.call(i, t) || (i[t] = {
      existed: We.call(e.anchorMap, t),
      value: e.anchorMap[t]
    });
  }
  e.anchorMap[t] = n;
}
function t0(e) {
  e.anchorMapTransactions.push(/* @__PURE__ */ Object.create(null));
}
function n0(e) {
  const t = e.anchorMapTransactions.pop(), n = e.anchorMapTransactions;
  if (n.length === 0) return;
  const r = n[n.length - 1], i = Object.keys(t);
  for (let o = 0, s = i.length; o < s; o += 1) {
    const a = i[o];
    We.call(r, a) || (r[a] = t[a]);
  }
}
function r0(e) {
  const t = e.anchorMapTransactions.pop(), n = Object.keys(t);
  for (let r = n.length - 1; r >= 0; r -= 1) {
    const i = t[n[r]];
    i.existed ? e.anchorMap[n[r]] = i.value : delete e.anchorMap[n[r]];
  }
}
function wu(e) {
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
function ya(e, t) {
  e.position = t.position, e.line = t.line, e.lineStart = t.lineStart, e.lineIndent = t.lineIndent, e.firstTabInLine = t.firstTabInLine, e.tag = t.tag, e.anchor = t.anchor, e.kind = t.kind, e.result = t.result;
}
const wa = {
  YAML: function(t, n, r) {
    t.version !== null && L(t, "duplication of %YAML directive"), r.length !== 1 && L(t, "YAML directive accepts exactly one argument");
    const i = /^([0-9]+)\.([0-9]+)$/.exec(r[0]);
    i === null && L(t, "ill-formed argument of the YAML directive");
    const o = parseInt(i[1], 10), s = parseInt(i[2], 10);
    o !== 1 && L(t, "unacceptable YAML version of the document"), t.version = r[0], t.checkLineBreaks = s < 2, s !== 1 && s !== 2 && Yr(t, "unsupported YAML version of the document");
  },
  TAG: function(t, n, r) {
    let i;
    r.length !== 2 && L(t, "TAG directive accepts exactly two arguments");
    const o = r[0];
    i = r[1], hu.test(o) || L(t, "ill-formed tag handle (first argument) of the TAG directive"), We.call(t.tagMap, o) && L(t, 'there is a previously declared suffix for "' + o + '" tag handle'), pu.test(i) || L(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      i = decodeURIComponent(i);
    } catch {
      L(t, "tag prefix is malformed: " + i);
    }
    t.tagMap[o] = i;
  }
};
function wt(e, t, n, r) {
  if (t < n) {
    const i = e.input.slice(t, n);
    if (r)
      for (let o = 0, s = i.length; o < s; o += 1) {
        const a = i.charCodeAt(o);
        a === 9 || a >= 32 && a <= 1114111 || L(e, "expected valid JSON character");
      }
    else Yg.test(i) && L(e, "the stream contains non-printable characters");
    e.result += i;
  }
}
function _a(e) {
  e.totalMergeKeys++, e.maxTotalMergeKeys !== -1 && e.totalMergeKeys > e.maxTotalMergeKeys && L(e, "merge keys exceeded maxTotalMergeKeys (" + e.maxTotalMergeKeys + ")");
}
function va(e, t, n, r) {
  xt.isObject(n) || L(e, "cannot merge mappings; the provided source object is unacceptable"), _a(e);
  const i = Object.keys(n);
  for (let o = 0, s = i.length; o < s; o += 1) {
    const a = i[o];
    _a(e), We.call(t, a) || (mu(t, a, n[a]), r[a] = !0);
  }
}
function nn(e, t, n, r, i, o, s, a, c) {
  if (Array.isArray(i)) {
    i = Array.prototype.slice.call(i);
    for (let m = 0, l = i.length; m < l; m += 1)
      Array.isArray(i[m]) && L(e, "nested arrays are not supported inside keys"), typeof i == "object" && ga(i[m]) === "[object Object]" && (i[m] = "[object Object]");
  }
  if (typeof i == "object" && ga(i) === "[object Object]" && (i = "[object Object]"), i = String(i), t === null && (t = {}), r === "tag:yaml.org,2002:merge")
    if (Array.isArray(o)) {
      o.length > 100 && L(e, "abnormal merge sequence size");
      for (let m = 0, l = o.length; m < l; m += 1)
        va(e, t, o[m], n);
    } else
      va(e, t, o, n);
  else
    !e.json && !We.call(n, i) && We.call(t, i) && (e.line = s || e.line, e.lineStart = a || e.lineStart, e.position = c || e.position, L(e, "duplicated mapping key")), mu(t, i, o), delete n[i];
  return t;
}
function Ko(e) {
  const t = e.input.charCodeAt(e.position);
  t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : L(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function ae(e, t, n) {
  let r = 0, i = e.input.charCodeAt(e.position);
  for (; i !== 0; ) {
    for (; at(i); )
      i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position);
    if (t && i === 35)
      do
        i = e.input.charCodeAt(++e.position);
      while (i !== 10 && i !== 13 && i !== 0);
    if (tt(i))
      for (Ko(e), i = e.input.charCodeAt(e.position), r++, e.lineIndent = 0; i === 32; )
        e.lineIndent++, i = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return n !== -1 && r !== 0 && e.lineIndent < n && Yr(e, "deficient indentation"), r;
}
function si(e) {
  let t = e.position, n = e.input.charCodeAt(t);
  return !!((n === 45 || n === 46) && n === e.input.charCodeAt(t + 1) && n === e.input.charCodeAt(t + 2) && (t += 3, n = e.input.charCodeAt(t), n === 0 || Le(n)));
}
function Jo(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += xt.repeat(`
`, t - 1));
}
function i0(e, t, n) {
  let r, i, o, s, a, c;
  const m = e.kind, l = e.result;
  let f = e.input.charCodeAt(e.position);
  if (Le(f) || tn(f) || f === 35 || f === 38 || f === 42 || f === 33 || f === 124 || f === 62 || f === 39 || f === 34 || f === 37 || f === 64 || f === 96)
    return !1;
  if (f === 63 || f === 45) {
    const h = e.input.charCodeAt(e.position + 1);
    if (Le(h) || n && tn(h))
      return !1;
  }
  for (e.kind = "scalar", e.result = "", r = i = e.position, o = !1; f !== 0; ) {
    if (f === 58) {
      const h = e.input.charCodeAt(e.position + 1);
      if (Le(h) || n && tn(h))
        break;
    } else if (f === 35) {
      const h = e.input.charCodeAt(e.position - 1);
      if (Le(h))
        break;
    } else {
      if (e.position === e.lineStart && si(e) || n && tn(f))
        break;
      if (tt(f))
        if (s = e.line, a = e.lineStart, c = e.lineIndent, ae(e, !1, -1), e.lineIndent >= t) {
          o = !0, f = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = i, e.line = s, e.lineStart = a, e.lineIndent = c;
          break;
        }
    }
    o && (wt(e, r, i, !1), Jo(e, e.line - s), r = i = e.position, o = !1), at(f) || (i = e.position + 1), f = e.input.charCodeAt(++e.position);
  }
  return wt(e, r, i, !1), e.result ? !0 : (e.kind = m, e.result = l, !1);
}
function o0(e, t) {
  let n, r, i = e.input.charCodeAt(e.position);
  if (i !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = r = e.position; (i = e.input.charCodeAt(e.position)) !== 0; )
    if (i === 39)
      if (wt(e, n, e.position, !0), i = e.input.charCodeAt(++e.position), i === 39)
        n = e.position, e.position++, r = e.position;
      else
        return !0;
    else tt(i) ? (wt(e, n, r, !0), Jo(e, ae(e, !1, t)), n = r = e.position) : e.position === e.lineStart && si(e) ? L(e, "unexpected end of the document within a single quoted scalar") : (e.position++, at(i) || (r = e.position));
  L(e, "unexpected end of the stream within a single quoted scalar");
}
function s0(e, t) {
  let n, r, i, o = e.input.charCodeAt(e.position);
  if (o !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = r = e.position; (o = e.input.charCodeAt(e.position)) !== 0; ) {
    if (o === 34)
      return wt(e, n, e.position, !0), e.position++, !0;
    if (o === 92) {
      if (wt(e, n, e.position, !0), o = e.input.charCodeAt(++e.position), tt(o))
        ae(e, !1, t);
      else if (o < 256 && gu[o])
        e.result += Eu[o], e.position++;
      else if ((i = Jg(o)) > 0) {
        let s = i, a = 0;
        for (; s > 0; s--)
          o = e.input.charCodeAt(++e.position), (i = Kg(o)) >= 0 ? a = (a << 4) + i : L(e, "expected hexadecimal character");
        e.result += Zg(a), e.position++;
      } else
        L(e, "unknown escape sequence");
      n = r = e.position;
    } else tt(o) ? (wt(e, n, r, !0), Jo(e, ae(e, !1, t)), n = r = e.position) : e.position === e.lineStart && si(e) ? L(e, "unexpected end of the document within a double quoted scalar") : (e.position++, at(o) || (r = e.position));
  }
  L(e, "unexpected end of the stream within a double quoted scalar");
}
function a0(e, t) {
  let n = !0, r, i, o;
  const s = e.tag;
  let a;
  const c = e.anchor;
  let m, l, f, h;
  const g = /* @__PURE__ */ Object.create(null);
  let w, y, A, S = e.input.charCodeAt(e.position);
  if (S === 91)
    m = 93, h = !1, a = [];
  else if (S === 123)
    m = 125, h = !0, a = {};
  else
    return !1;
  for (e.anchor !== null && Lt(e, e.anchor, a), S = e.input.charCodeAt(++e.position); S !== 0; ) {
    if (ae(e, !0, t), S = e.input.charCodeAt(e.position), S === m)
      return e.position++, e.tag = s, e.anchor = c, e.kind = h ? "mapping" : "sequence", e.result = a, !0;
    if (n ? S === 44 && L(e, "expected the node content, but found ','") : L(e, "missed comma between flow collection entries"), y = w = A = null, l = f = !1, S === 63) {
      const R = e.input.charCodeAt(e.position + 1);
      Le(R) && (l = f = !0, e.position++, ae(e, !0, t));
    }
    r = e.line, i = e.lineStart, o = e.position, hn(e, t, Vr, !1, !0), y = e.tag, w = e.result, ae(e, !0, t), S = e.input.charCodeAt(e.position), (f || e.line === r) && S === 58 && (l = !0, S = e.input.charCodeAt(++e.position), ae(e, !0, t), hn(e, t, Vr, !1, !0), A = e.result), h ? nn(e, a, g, y, w, A, r, i, o) : l ? a.push(nn(e, null, g, y, w, A, r, i, o)) : a.push(w), ae(e, !0, t), S = e.input.charCodeAt(e.position), S === 44 ? (n = !0, S = e.input.charCodeAt(++e.position)) : n = !1;
  }
  L(e, "unexpected end of the stream within a flow collection");
}
function l0(e, t) {
  let n, r = Hi, i = !1, o = !1, s = t, a = 0, c = !1, m, l = e.input.charCodeAt(e.position);
  if (l === 124)
    n = !1;
  else if (l === 62)
    n = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; l !== 0; )
    if (l = e.input.charCodeAt(++e.position), l === 43 || l === 45)
      Hi === r ? r = l === 43 ? ma : Wg : L(e, "repeat of a chomping mode identifier");
    else if ((m = Qg(l)) >= 0)
      m === 0 ? L(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : o ? L(e, "repeat of an indentation width identifier") : (s = t + m - 1, o = !0);
    else
      break;
  if (at(l)) {
    do
      l = e.input.charCodeAt(++e.position);
    while (at(l));
    if (l === 35)
      do
        l = e.input.charCodeAt(++e.position);
      while (!tt(l) && l !== 0);
  }
  for (; l !== 0; ) {
    for (Ko(e), e.lineIndent = 0, l = e.input.charCodeAt(e.position); (!o || e.lineIndent < s) && l === 32; )
      e.lineIndent++, l = e.input.charCodeAt(++e.position);
    if (!o && e.lineIndent > s && (s = e.lineIndent), tt(l)) {
      a++;
      continue;
    }
    if (!o && s === 0 && L(e, "missing indentation for block scalar"), e.lineIndent < s) {
      r === ma ? e.result += xt.repeat(`
`, i ? 1 + a : a) : r === Hi && i && (e.result += `
`);
      break;
    }
    n ? at(l) ? (c = !0, e.result += xt.repeat(`
`, i ? 1 + a : a)) : c ? (c = !1, e.result += xt.repeat(`
`, a + 1)) : a === 0 ? i && (e.result += " ") : e.result += xt.repeat(`
`, a) : e.result += xt.repeat(`
`, i ? 1 + a : a), i = !0, o = !0, a = 0;
    const f = e.position;
    for (; !tt(l) && l !== 0; )
      l = e.input.charCodeAt(++e.position);
    wt(e, f, e.position, !1);
  }
  return !0;
}
function Aa(e, t) {
  const n = e.tag, r = e.anchor, i = [];
  let o = !1;
  if (e.firstTabInLine !== -1) return !1;
  e.anchor !== null && Lt(e, e.anchor, i);
  let s = e.input.charCodeAt(e.position);
  for (; s !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, L(e, "tab characters must not be used in indentation")), s === 45); ) {
    const a = e.input.charCodeAt(e.position + 1);
    if (!Le(a))
      break;
    if (o = !0, e.position++, ae(e, !0, -1) && e.lineIndent <= t) {
      i.push(null), s = e.input.charCodeAt(e.position);
      continue;
    }
    const c = e.line;
    if (hn(e, t, du, !1, !0), i.push(e.result), ae(e, !0, -1), s = e.input.charCodeAt(e.position), (e.line === c || e.lineIndent > t) && s !== 0)
      L(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return o ? (e.tag = n, e.anchor = r, e.kind = "sequence", e.result = i, !0) : !1;
}
function _u(e, t, n) {
  let r, i, o, s;
  const a = e.tag, c = e.anchor, m = {}, l = /* @__PURE__ */ Object.create(null);
  let f = null, h = null, g = null, w = !1, y = !1;
  if (e.firstTabInLine !== -1) return !1;
  e.anchor !== null && Lt(e, e.anchor, m);
  let A = e.input.charCodeAt(e.position);
  for (; A !== 0; ) {
    !w && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, L(e, "tab characters must not be used in indentation"));
    const S = e.input.charCodeAt(e.position + 1), R = e.line;
    if ((A === 63 || A === 58) && Le(S))
      A === 63 ? (w && (nn(e, m, l, f, h, null, i, o, s), f = h = g = null), y = !0, w = !0, r = !0) : w ? (w = !1, r = !0) : L(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, A = S;
    else {
      if (i = e.line, o = e.lineStart, s = e.position, !hn(e, n, fu, !1, !0))
        break;
      if (e.line === R) {
        for (A = e.input.charCodeAt(e.position); at(A); )
          A = e.input.charCodeAt(++e.position);
        if (A === 58)
          A = e.input.charCodeAt(++e.position), Le(A) || L(e, "a whitespace character is expected after the key-value separator within a block mapping"), w && (nn(e, m, l, f, h, null, i, o, s), f = h = g = null), y = !0, w = !1, r = !1, f = e.tag, h = e.result;
        else if (y)
          L(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = a, e.anchor = c, !0;
      } else if (y)
        L(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = a, e.anchor = c, !0;
    }
    if ((e.line === R || e.lineIndent > t) && (w && (i = e.line, o = e.lineStart, s = e.position), hn(e, t, Wr, !0, r) && (w ? h = e.result : g = e.result), w || (nn(e, m, l, f, h, g, i, o, s), f = h = g = null), ae(e, !0, -1), A = e.input.charCodeAt(e.position)), (e.line === R || e.lineIndent > t) && A !== 0)
      L(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return w && nn(e, m, l, f, h, null, i, o, s), y && (e.tag = a, e.anchor = c, e.kind = "mapping", e.result = m), y;
}
function c0(e) {
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
    for (; o !== 0 && !Le(o); )
      o === 33 && (n ? L(e, "tag suffix cannot contain exclamation marks") : (r = e.input.slice(s - 1, e.position + 1), hu.test(r) || L(e, "named tag handle cannot contain such characters"), n = !0, s = e.position + 1)), o = e.input.charCodeAt(++e.position);
    i = e.input.slice(s, e.position), Xg.test(i) && L(e, "tag suffix cannot contain flow indicator characters");
  }
  i && !pu.test(i) && L(e, "tag name cannot contain such characters: " + i);
  try {
    i = decodeURIComponent(i);
  } catch {
    L(e, "tag name is malformed: " + i);
  }
  return t ? e.tag = i : We.call(e.tagMap, r) ? e.tag = e.tagMap[r] + i : r === "!" ? e.tag = "!" + i : r === "!!" ? e.tag = "tag:yaml.org,2002:" + i : L(e, 'undeclared tag handle "' + r + '"'), !0;
}
function u0(e) {
  let t = e.input.charCodeAt(e.position);
  if (t !== 38) return !1;
  e.anchor !== null && L(e, "duplication of an anchor property"), t = e.input.charCodeAt(++e.position);
  const n = e.position;
  for (; t !== 0 && !Le(t) && !tn(t); )
    t = e.input.charCodeAt(++e.position);
  return e.position === n && L(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(n, e.position), !0;
}
function f0(e) {
  let t = e.input.charCodeAt(e.position);
  if (t !== 42) return !1;
  t = e.input.charCodeAt(++e.position);
  const n = e.position;
  for (; t !== 0 && !Le(t) && !tn(t); )
    t = e.input.charCodeAt(++e.position);
  e.position === n && L(e, "name of an alias node must contain at least one character");
  const r = e.input.slice(n, e.position);
  return We.call(e.anchorMap, r) || L(e, 'unidentified alias "' + r + '"'), e.result = e.anchorMap[r], ae(e, !0, -1), !0;
}
function d0(e, t, n, r) {
  const i = wu(e);
  return t0(e), ya(e, t), e.tag = null, e.anchor = null, e.kind = null, e.result = null, _u(e, n, r) && e.kind === "mapping" ? (n0(e), !0) : (r0(e), ya(e, i), !1);
}
function hn(e, t, n, r, i) {
  let o, s, a = 1, c = !1, m = !1, l = null, f, h, g;
  e.depth >= e.maxDepth && L(e, "nesting exceeded maxDepth (" + e.maxDepth + ")"), e.depth += 1, e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null;
  const w = o = s = Wr === n || du === n;
  if (r && ae(e, !0, -1) && (c = !0, e.lineIndent > t ? a = 1 : e.lineIndent === t ? a = 0 : e.lineIndent < t && (a = -1)), a === 1)
    for (; ; ) {
      const y = e.input.charCodeAt(e.position), A = wu(e);
      if (c && (y === 33 && e.tag !== null || y === 38 && e.anchor !== null) || !c0(e) && !u0(e))
        break;
      l === null && (l = A), ae(e, !0, -1) ? (c = !0, s = w, e.lineIndent > t ? a = 1 : e.lineIndent === t ? a = 0 : e.lineIndent < t && (a = -1)) : s = !1;
    }
  if (s && (s = c || i), a === 1 || Wr === n)
    if (Vr === n || fu === n ? h = t : h = t + 1, g = e.position - e.lineStart, a === 1)
      if (s && (Aa(e, g) || _u(e, g, h)) || a0(e, h))
        m = !0;
      else {
        const y = e.input.charCodeAt(e.position);
        l !== null && w && !s && y !== 124 && y !== 62 && d0(
          e,
          l,
          l.position - l.lineStart,
          h
        ) || o && l0(e, h) || o0(e, h) || s0(e, h) ? m = !0 : f0(e) ? (m = !0, (e.tag !== null || e.anchor !== null) && L(e, "alias node should not have any properties")) : i0(e, h, Vr === n) && (m = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && Lt(e, e.anchor, e.result);
      }
    else a === 0 && (m = s && Aa(e, g));
  if (e.tag === null)
    e.anchor !== null && Lt(e, e.anchor, e.result);
  else if (e.tag === "?") {
    e.result !== null && e.kind !== "scalar" && L(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"');
    for (let y = 0, A = e.implicitTypes.length; y < A; y += 1)
      if (f = e.implicitTypes[y], f.resolve(e.result)) {
        e.result = f.construct(e.result), e.tag = f.tag, e.anchor !== null && Lt(e, e.anchor, e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (We.call(e.typeMap[e.kind || "fallback"], e.tag))
      f = e.typeMap[e.kind || "fallback"][e.tag];
    else {
      f = null;
      const y = e.typeMap.multi[e.kind || "fallback"];
      for (let A = 0, S = y.length; A < S; A += 1)
        if (e.tag.slice(0, y[A].tag.length) === y[A].tag) {
          f = y[A];
          break;
        }
    }
    f || L(e, "unknown tag !<" + e.tag + ">"), e.result !== null && f.kind !== e.kind && L(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + f.kind + '", not "' + e.kind + '"'), f.resolve(e.result, e.tag) ? (e.result = f.construct(e.result, e.tag), e.anchor !== null && Lt(e, e.anchor, e.result)) : L(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.depth -= 1, e.tag !== null || e.anchor !== null || m;
}
function h0(e) {
  const t = e.position;
  let n = !1, r;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (r = e.input.charCodeAt(e.position)) !== 0 && (ae(e, !0, -1), r = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || r !== 37)); ) {
    n = !0, r = e.input.charCodeAt(++e.position);
    let i = e.position;
    for (; r !== 0 && !Le(r); )
      r = e.input.charCodeAt(++e.position);
    const o = e.input.slice(i, e.position), s = [];
    for (o.length < 1 && L(e, "directive name must not be less than one character in length"); r !== 0; ) {
      for (; at(r); )
        r = e.input.charCodeAt(++e.position);
      if (r === 35) {
        do
          r = e.input.charCodeAt(++e.position);
        while (r !== 0 && !tt(r));
        break;
      }
      if (tt(r)) break;
      for (i = e.position; r !== 0 && !Le(r); )
        r = e.input.charCodeAt(++e.position);
      s.push(e.input.slice(i, e.position));
    }
    r !== 0 && Ko(e), We.call(wa, o) ? wa[o](e, o, s) : Yr(e, 'unknown document directive "' + o + '"');
  }
  if (ae(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, ae(e, !0, -1)) : n && L(e, "directives end mark is expected"), hn(e, e.lineIndent - 1, Wr, !1, !0), ae(e, !0, -1), e.checkLineBreaks && zg.test(e.input.slice(t, e.position)) && Yr(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && si(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, ae(e, !0, -1));
    return;
  }
  e.position < e.length - 1 && L(e, "end of the stream or a document separator is expected");
}
function vu(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  const n = new e0(e, t), r = e.indexOf("\0");
  for (r !== -1 && (n.position = r, L(n, "null byte is not allowed in input")), n.input += "\0"; n.input.charCodeAt(n.position) === 32; )
    n.lineIndent += 1, n.position += 1;
  for (; n.position < n.length - 1; )
    h0(n);
  return n.documents;
}
function p0(e, t, n) {
  t !== null && typeof t == "object" && typeof n > "u" && (n = t, t = null);
  const r = vu(e, n);
  if (typeof t != "function")
    return r;
  for (let i = 0, o = r.length; i < o; i += 1)
    t(r[i]);
}
function m0(e, t) {
  const n = vu(e, t);
  if (n.length !== 0) {
    if (n.length === 1)
      return n[0];
    throw new uu("expected a single document in the stream, but found more");
  }
}
Yo.loadAll = p0;
Yo.load = m0;
var Au = {};
const ai = Ye, nr = tr, g0 = Xo, Su = Object.prototype.toString, Tu = Object.prototype.hasOwnProperty, Qo = 65279, E0 = 9, Bn = 10, y0 = 13, w0 = 32, _0 = 33, v0 = 34, Ao = 35, A0 = 37, S0 = 38, T0 = 39, b0 = 42, bu = 44, C0 = 45, zr = 58, $0 = 61, R0 = 62, O0 = 63, P0 = 64, Cu = 91, $u = 93, I0 = 96, Ru = 123, N0 = 124, Ou = 125, be = {};
be[0] = "\\0";
be[7] = "\\a";
be[8] = "\\b";
be[9] = "\\t";
be[10] = "\\n";
be[11] = "\\v";
be[12] = "\\f";
be[13] = "\\r";
be[27] = "\\e";
be[34] = '\\"';
be[92] = "\\\\";
be[133] = "\\N";
be[160] = "\\_";
be[8232] = "\\L";
be[8233] = "\\P";
const D0 = [
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
], F0 = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function x0(e, t) {
  if (t === null) return {};
  const n = {}, r = Object.keys(t);
  for (let i = 0, o = r.length; i < o; i += 1) {
    let s = r[i], a = String(t[s]);
    s.slice(0, 2) === "!!" && (s = "tag:yaml.org,2002:" + s.slice(2));
    const c = e.compiledTypeMap.fallback[s];
    c && Tu.call(c.styleAliases, a) && (a = c.styleAliases[a]), n[s] = a;
  }
  return n;
}
function L0(e) {
  let t, n;
  const r = e.toString(16).toUpperCase();
  if (e <= 255)
    t = "x", n = 2;
  else if (e <= 65535)
    t = "u", n = 4;
  else if (e <= 4294967295)
    t = "U", n = 8;
  else
    throw new nr("code point within a string may not be greater than 0xFFFFFFFF");
  return "\\" + t + ai.repeat("0", n - r.length) + r;
}
const U0 = 1, jn = 2;
function k0(e) {
  this.schema = e.schema || g0, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = ai.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = x0(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? jn : U0, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
function Sa(e, t) {
  const n = ai.repeat(" ", t);
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
function So(e, t) {
  return `
` + ai.repeat(" ", e.indent * t);
}
function M0(e, t) {
  for (let n = 0, r = e.implicitTypes.length; n < r; n += 1)
    if (e.implicitTypes[n].resolve(t))
      return !0;
  return !1;
}
function Xr(e) {
  return e === w0 || e === E0;
}
function Hn(e) {
  return e >= 32 && e <= 126 || e >= 161 && e <= 55295 && e !== 8232 && e !== 8233 || e >= 57344 && e <= 65533 && e !== Qo || e >= 65536 && e <= 1114111;
}
function Ta(e) {
  return Hn(e) && e !== Qo && // - b-char
  e !== y0 && e !== Bn;
}
function ba(e, t, n) {
  const r = Ta(e), i = r && !Xr(e);
  return (
    // ns-plain-safe
    (n ? r : r && // - c-flow-indicator
    e !== bu && e !== Cu && e !== $u && e !== Ru && e !== Ou) && // ns-plain-char
    e !== Ao && // false on '#'
    !(t === zr && !i) || // false on ': '
    Ta(t) && !Xr(t) && e === Ao || // change to true on '[^ ]#'
    t === zr && i
  );
}
function B0(e) {
  return Hn(e) && e !== Qo && !Xr(e) && // - s-white
  // - (c-indicator ::=
  // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
  e !== C0 && e !== O0 && e !== zr && e !== bu && e !== Cu && e !== $u && e !== Ru && e !== Ou && // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
  e !== Ao && e !== S0 && e !== b0 && e !== _0 && e !== N0 && e !== $0 && e !== R0 && e !== T0 && e !== v0 && // | “%” | “@” | “`”)
  e !== A0 && e !== P0 && e !== I0;
}
function j0(e) {
  return !Xr(e) && e !== zr;
}
function On(e, t) {
  const n = e.charCodeAt(t);
  let r;
  return n >= 55296 && n <= 56319 && t + 1 < e.length && (r = e.charCodeAt(t + 1), r >= 56320 && r <= 57343) ? (n - 55296) * 1024 + r - 56320 + 65536 : n;
}
function Pu(e) {
  return /^\n* /.test(e);
}
const Iu = 1, To = 2, Nu = 3, Du = 4, Qt = 5;
function H0(e, t, n, r, i, o, s, a) {
  let c, m = 0, l = null, f = !1, h = !1;
  const g = r !== -1;
  let w = -1, y = B0(On(e, 0)) && j0(On(e, e.length - 1));
  if (t || s)
    for (c = 0; c < e.length; m >= 65536 ? c += 2 : c++) {
      if (m = On(e, c), !Hn(m))
        return Qt;
      y = y && ba(m, l, a), l = m;
    }
  else {
    for (c = 0; c < e.length; m >= 65536 ? c += 2 : c++) {
      if (m = On(e, c), m === Bn)
        f = !0, g && (h = h || // Foldable line = too long, and not more-indented.
        c - w - 1 > r && e[w + 1] !== " ", w = c);
      else if (!Hn(m))
        return Qt;
      y = y && ba(m, l, a), l = m;
    }
    h = h || g && c - w - 1 > r && e[w + 1] !== " ";
  }
  return !f && !h ? y && !s && !i(e) ? Iu : o === jn ? Qt : To : n > 9 && Pu(e) ? Qt : s ? o === jn ? Qt : To : h ? Du : Nu;
}
function G0(e, t, n, r, i) {
  e.dump = function() {
    if (t.length === 0)
      return e.quotingType === jn ? '""' : "''";
    if (!e.noCompatMode && (D0.indexOf(t) !== -1 || F0.test(t)))
      return e.quotingType === jn ? '"' + t + '"' : "'" + t + "'";
    const o = e.indent * Math.max(1, n), s = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - o), a = r || // No block styles in flow mode.
    e.flowLevel > -1 && n >= e.flowLevel;
    function c(m) {
      return M0(e, m);
    }
    switch (H0(
      t,
      a,
      e.indent,
      s,
      c,
      e.quotingType,
      e.forceQuotes && !r,
      i
    )) {
      case Iu:
        return t;
      case To:
        return "'" + t.replace(/'/g, "''") + "'";
      case Nu:
        return "|" + Ca(t, e.indent) + $a(Sa(t, o));
      case Du:
        return ">" + Ca(t, e.indent) + $a(Sa(q0(t, s), o));
      case Qt:
        return '"' + V0(t) + '"';
      default:
        throw new nr("impossible error: invalid scalar style");
    }
  }();
}
function Ca(e, t) {
  const n = Pu(e) ? String(t) : "", r = e[e.length - 1] === `
`, o = r && (e[e.length - 2] === `
` || e === `
`) ? "+" : r ? "" : "-";
  return n + o + `
`;
}
function $a(e) {
  return e[e.length - 1] === `
` ? e.slice(0, -1) : e;
}
function q0(e, t) {
  const n = /(\n+)([^\n]*)/g;
  let r = function() {
    let a = e.indexOf(`
`);
    return a = a !== -1 ? a : e.length, n.lastIndex = a, Ra(e.slice(0, a), t);
  }(), i = e[0] === `
` || e[0] === " ", o, s;
  for (; s = n.exec(e); ) {
    const a = s[1], c = s[2];
    o = c[0] === " ", r += a + (!i && !o && c !== "" ? `
` : "") + Ra(c, t), i = o;
  }
  return r;
}
function Ra(e, t) {
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
function V0(e) {
  let t = "", n = 0;
  for (let r = 0; r < e.length; n >= 65536 ? r += 2 : r++) {
    n = On(e, r);
    const i = be[n];
    !i && Hn(n) ? (t += e[r], n >= 65536 && (t += e[r + 1])) : t += i || L0(n);
  }
  return t;
}
function W0(e, t, n) {
  let r = "";
  const i = e.tag;
  for (let o = 0, s = n.length; o < s; o += 1) {
    let a = n[o];
    e.replacer && (a = e.replacer.call(n, String(o), a)), (lt(e, t, a, !1, !1) || typeof a > "u" && lt(e, t, null, !1, !1)) && (r !== "" && (r += "," + (e.condenseFlow ? "" : " ")), r += e.dump);
  }
  e.tag = i, e.dump = "[" + r + "]";
}
function Oa(e, t, n, r) {
  let i = "";
  const o = e.tag;
  for (let s = 0, a = n.length; s < a; s += 1) {
    let c = n[s];
    e.replacer && (c = e.replacer.call(n, String(s), c)), (lt(e, t + 1, c, !0, !0, !1, !0) || typeof c > "u" && lt(e, t + 1, null, !0, !0, !1, !0)) && ((!r || i !== "") && (i += So(e, t)), e.dump && Bn === e.dump.charCodeAt(0) ? i += "-" : i += "- ", i += e.dump);
  }
  e.tag = o, e.dump = i || "[]";
}
function Y0(e, t, n) {
  let r = "";
  const i = e.tag, o = Object.keys(n);
  for (let s = 0, a = o.length; s < a; s += 1) {
    let c = "";
    r !== "" && (c += ", "), e.condenseFlow && (c += '"');
    const m = o[s];
    let l = n[m];
    e.replacer && (l = e.replacer.call(n, m, l)), lt(e, t, m, !1, !1) && (e.dump.length > 1024 && (c += "? "), c += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), lt(e, t, l, !1, !1) && (c += e.dump, r += c));
  }
  e.tag = i, e.dump = "{" + r + "}";
}
function z0(e, t, n, r) {
  let i = "";
  const o = e.tag, s = Object.keys(n);
  if (e.sortKeys === !0)
    s.sort();
  else if (typeof e.sortKeys == "function")
    s.sort(e.sortKeys);
  else if (e.sortKeys)
    throw new nr("sortKeys must be a boolean or a function");
  for (let a = 0, c = s.length; a < c; a += 1) {
    let m = "";
    (!r || i !== "") && (m += So(e, t));
    const l = s[a];
    let f = n[l];
    if (e.replacer && (f = e.replacer.call(n, l, f)), !lt(e, t + 1, l, !0, !0, !0))
      continue;
    const h = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024;
    h && (e.dump && Bn === e.dump.charCodeAt(0) ? m += "?" : m += "? "), m += e.dump, h && (m += So(e, t)), lt(e, t + 1, f, !0, h) && (e.dump && Bn === e.dump.charCodeAt(0) ? m += ":" : m += ": ", m += e.dump, i += m);
  }
  e.tag = o, e.dump = i || "{}";
}
function Pa(e, t, n) {
  const r = n ? e.explicitTypes : e.implicitTypes;
  for (let i = 0, o = r.length; i < o; i += 1) {
    const s = r[i];
    if ((s.instanceOf || s.predicate) && (!s.instanceOf || typeof t == "object" && t instanceof s.instanceOf) && (!s.predicate || s.predicate(t))) {
      if (n ? s.multi && s.representName ? e.tag = s.representName(t) : e.tag = s.tag : e.tag = "?", s.represent) {
        const a = e.styleMap[s.tag] || s.defaultStyle;
        let c;
        if (Su.call(s.represent) === "[object Function]")
          c = s.represent(t, a);
        else if (Tu.call(s.represent, a))
          c = s.represent[a](t, a);
        else
          throw new nr("!<" + s.tag + '> tag resolver accepts not "' + a + '" style');
        e.dump = c;
      }
      return !0;
    }
  }
  return !1;
}
function lt(e, t, n, r, i, o, s) {
  e.tag = null, e.dump = n, Pa(e, n, !1) || Pa(e, n, !0);
  const a = Su.call(e.dump), c = r;
  r && (r = e.flowLevel < 0 || e.flowLevel > t);
  const m = a === "[object Object]" || a === "[object Array]";
  let l, f;
  if (m && (l = e.duplicates.indexOf(n), f = l !== -1), (e.tag !== null && e.tag !== "?" || f || e.indent !== 2 && t > 0) && (i = !1), f && e.usedDuplicates[l])
    e.dump = "*ref_" + l;
  else {
    if (m && f && !e.usedDuplicates[l] && (e.usedDuplicates[l] = !0), a === "[object Object]")
      r && Object.keys(e.dump).length !== 0 ? (z0(e, t, e.dump, i), f && (e.dump = "&ref_" + l + e.dump)) : (Y0(e, t, e.dump), f && (e.dump = "&ref_" + l + " " + e.dump));
    else if (a === "[object Array]")
      r && e.dump.length !== 0 ? (e.noArrayIndent && !s && t > 0 ? Oa(e, t - 1, e.dump, i) : Oa(e, t, e.dump, i), f && (e.dump = "&ref_" + l + e.dump)) : (W0(e, t, e.dump), f && (e.dump = "&ref_" + l + " " + e.dump));
    else if (a === "[object String]")
      e.tag !== "?" && G0(e, e.dump, t, o, c);
    else {
      if (a === "[object Undefined]")
        return !1;
      if (e.skipInvalid) return !1;
      throw new nr("unacceptable kind of an object to dump " + a);
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
function X0(e, t) {
  const n = [], r = [];
  bo(e, n, r);
  const i = r.length;
  for (let o = 0; o < i; o += 1)
    t.duplicates.push(n[r[o]]);
  t.usedDuplicates = new Array(i);
}
function bo(e, t, n) {
  if (e !== null && typeof e == "object") {
    const r = t.indexOf(e);
    if (r !== -1)
      n.indexOf(r) === -1 && n.push(r);
    else if (t.push(e), Array.isArray(e))
      for (let i = 0, o = e.length; i < o; i += 1)
        bo(e[i], t, n);
    else {
      const i = Object.keys(e);
      for (let o = 0, s = i.length; o < s; o += 1)
        bo(e[i[o]], t, n);
    }
  }
}
function K0(e, t) {
  t = t || {};
  const n = new k0(t);
  n.noRefs || X0(e, n);
  let r = e;
  return n.replacer && (r = n.replacer.call({ "": r }, "", r)), lt(n, 0, r, !0, !0) ? n.dump + `
` : "";
}
Au.dump = K0;
const Fu = Yo, J0 = Au;
function Zo(e, t) {
  return function() {
    throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
  };
}
_e.Type = Ne;
_e.Schema = qc;
_e.FAILSAFE_SCHEMA = zc;
_e.JSON_SCHEMA = eu;
_e.CORE_SCHEMA = tu;
_e.DEFAULT_SCHEMA = Xo;
_e.load = Fu.load;
_e.loadAll = Fu.loadAll;
_e.dump = J0.dump;
_e.YAMLException = tr;
_e.types = {
  binary: su,
  float: Zc,
  map: Yc,
  null: Xc,
  pairs: lu,
  set: cu,
  timestamp: iu,
  bool: Kc,
  int: Jc,
  merge: ou,
  omap: au,
  seq: Wc,
  str: Vc
};
_e.safeLoad = Zo("safeLoad", "load");
_e.safeLoadAll = Zo("safeLoadAll", "loadAll");
_e.safeDump = Zo("safeDump", "dump");
var li = {};
Object.defineProperty(li, "__esModule", { value: !0 });
li.Lazy = void 0;
class Q0 {
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
li.Lazy = Q0;
var Co = { exports: {} };
const Z0 = "2.0.0", xu = 256, eE = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, tE = 16, nE = xu - 6, rE = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ci = {
  MAX_LENGTH: xu,
  MAX_SAFE_COMPONENT_LENGTH: tE,
  MAX_SAFE_BUILD_LENGTH: nE,
  MAX_SAFE_INTEGER: eE,
  RELEASE_TYPES: rE,
  SEMVER_SPEC_VERSION: Z0,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const iE = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var ui = iE;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: r,
    MAX_LENGTH: i
  } = ci, o = ui;
  t = e.exports = {};
  const s = t.re = [], a = t.safeRe = [], c = t.src = [], m = t.safeSrc = [], l = t.t = {};
  let f = 0;
  const h = "[a-zA-Z0-9-]", g = [
    ["\\s", 1],
    ["\\d", i],
    [h, r]
  ], w = (A) => {
    for (const [S, R] of g)
      A = A.split(`${S}*`).join(`${S}{0,${R}}`).split(`${S}+`).join(`${S}{1,${R}}`);
    return A;
  }, y = (A, S, R) => {
    const N = w(S), x = f++;
    o(A, x, S), l[A] = x, c[x] = S, m[x] = N, s[x] = new RegExp(S, R ? "g" : void 0), a[x] = new RegExp(N, R ? "g" : void 0);
  };
  y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${h}*`), y("MAINVERSION", `(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASE", `(?:-(${c[l.PRERELEASEIDENTIFIER]}(?:\\.${c[l.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${c[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[l.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${h}+`), y("BUILD", `(?:\\+(${c[l.BUILDIDENTIFIER]}(?:\\.${c[l.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${c[l.MAINVERSION]}${c[l.PRERELEASE]}?${c[l.BUILD]}?`), y("FULL", `^${c[l.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${c[l.MAINVERSIONLOOSE]}${c[l.PRERELEASELOOSE]}?${c[l.BUILD]}?`), y("LOOSE", `^${c[l.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${c[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${c[l.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:${c[l.PRERELEASE]})?${c[l.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:${c[l.PRERELEASELOOSE]})?${c[l.BUILD]}?)?)?`), y("XRANGE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${n}})(?:\\.(\\d{1,${n}}))?(?:\\.(\\d{1,${n}}))?`), y("COERCE", `${c[l.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", c[l.COERCEPLAIN] + `(?:${c[l.PRERELEASE]})?(?:${c[l.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", c[l.COERCE], !0), y("COERCERTLFULL", c[l.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${c[l.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${c[l.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${c[l.LONECARET]}${c[l.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${c[l.LONECARET]}${c[l.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${c[l.GTLT]}\\s*(${c[l.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]}|${c[l.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${c[l.XRANGEPLAIN]})\\s+-\\s+(${c[l.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${c[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[l.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Co, Co.exports);
var rr = Co.exports;
const oE = Object.freeze({ loose: !0 }), sE = Object.freeze({}), aE = (e) => e ? typeof e != "object" ? oE : e : sE;
var es = aE;
const Ia = /^[0-9]+$/, Lu = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const n = Ia.test(e), r = Ia.test(t);
  return n && r && (e = +e, t = +t), e === t ? 0 : n && !r ? -1 : r && !n ? 1 : e < t ? -1 : 1;
}, lE = (e, t) => Lu(t, e);
var Uu = {
  compareIdentifiers: Lu,
  rcompareIdentifiers: lE
};
const br = ui, { MAX_LENGTH: Na, MAX_SAFE_INTEGER: Cr } = ci, { safeRe: $r, t: Rr } = rr, cE = es, { compareIdentifiers: Gi } = Uu;
let uE = class Ze {
  constructor(t, n) {
    if (n = cE(n), t instanceof Ze) {
      if (t.loose === !!n.loose && t.includePrerelease === !!n.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > Na)
      throw new TypeError(
        `version is longer than ${Na} characters`
      );
    br("SemVer", t, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
    const r = t.trim().match(n.loose ? $r[Rr.LOOSE] : $r[Rr.FULL]);
    if (!r)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +r[1], this.minor = +r[2], this.patch = +r[3], this.major > Cr || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Cr || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Cr || this.patch < 0)
      throw new TypeError("Invalid patch version");
    r[4] ? this.prerelease = r[4].split(".").map((i) => {
      if (/^[0-9]+$/.test(i)) {
        const o = +i;
        if (o >= 0 && o < Cr)
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
    if (br("SemVer.compare", this.version, this.options, t), !(t instanceof Ze)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new Ze(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof Ze || (t = new Ze(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof Ze || (t = new Ze(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let n = 0;
    do {
      const r = this.prerelease[n], i = t.prerelease[n];
      if (br("prerelease compare", n, r, i), r === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (r === void 0)
        return -1;
      if (r === i)
        continue;
      return Gi(r, i);
    } while (++n);
  }
  compareBuild(t) {
    t instanceof Ze || (t = new Ze(t, this.options));
    let n = 0;
    do {
      const r = this.build[n], i = t.build[n];
      if (br("build compare", n, r, i), r === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (r === void 0)
        return -1;
      if (r === i)
        continue;
      return Gi(r, i);
    } while (++n);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, n, r) {
    if (t.startsWith("pre")) {
      if (!n && r === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (n) {
        const i = `-${n}`.match(this.options.loose ? $r[Rr.PRERELEASELOOSE] : $r[Rr.PRERELEASE]);
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
          r === !1 && (o = [n]), Gi(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = o) : this.prerelease = o;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var De = uE;
const Da = De, fE = (e, t, n = !1) => {
  if (e instanceof Da)
    return e;
  try {
    return new Da(e, t);
  } catch (r) {
    if (!n)
      return null;
    throw r;
  }
};
var gn = fE;
const dE = gn, hE = (e, t) => {
  const n = dE(e, t);
  return n ? n.version : null;
};
var pE = hE;
const mE = gn, gE = (e, t) => {
  const n = mE(e.trim().replace(/^[=v]+/, ""), t);
  return n ? n.version : null;
};
var EE = gE;
const Fa = De, yE = (e, t, n, r, i) => {
  typeof n == "string" && (i = r, r = n, n = void 0);
  try {
    return new Fa(
      e instanceof Fa ? e.version : e,
      n
    ).inc(t, r, i).version;
  } catch {
    return null;
  }
};
var wE = yE;
const xa = gn, _E = (e, t) => {
  const n = xa(e, null, !0), r = xa(t, null, !0), i = n.compare(r);
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
var vE = _E;
const AE = De, SE = (e, t) => new AE(e, t).major;
var TE = SE;
const bE = De, CE = (e, t) => new bE(e, t).minor;
var $E = CE;
const RE = De, OE = (e, t) => new RE(e, t).patch;
var PE = OE;
const IE = gn, NE = (e, t) => {
  const n = IE(e, t);
  return n && n.prerelease.length ? n.prerelease : null;
};
var DE = NE;
const La = De, FE = (e, t, n) => new La(e, n).compare(new La(t, n));
var ze = FE;
const xE = ze, LE = (e, t, n) => xE(t, e, n);
var UE = LE;
const kE = ze, ME = (e, t) => kE(e, t, !0);
var BE = ME;
const Ua = De, jE = (e, t, n) => {
  const r = new Ua(e, n), i = new Ua(t, n);
  return r.compare(i) || r.compareBuild(i);
};
var ts = jE;
const HE = ts, GE = (e, t) => e.sort((n, r) => HE(n, r, t));
var qE = GE;
const VE = ts, WE = (e, t) => e.sort((n, r) => VE(r, n, t));
var YE = WE;
const zE = ze, XE = (e, t, n) => zE(e, t, n) > 0;
var fi = XE;
const KE = ze, JE = (e, t, n) => KE(e, t, n) < 0;
var ns = JE;
const QE = ze, ZE = (e, t, n) => QE(e, t, n) === 0;
var ku = ZE;
const ey = ze, ty = (e, t, n) => ey(e, t, n) !== 0;
var Mu = ty;
const ny = ze, ry = (e, t, n) => ny(e, t, n) >= 0;
var rs = ry;
const iy = ze, oy = (e, t, n) => iy(e, t, n) <= 0;
var is = oy;
const sy = ku, ay = Mu, ly = fi, cy = rs, uy = ns, fy = is, dy = (e, t, n, r) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e === n;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e !== n;
    case "":
    case "=":
    case "==":
      return sy(e, n, r);
    case "!=":
      return ay(e, n, r);
    case ">":
      return ly(e, n, r);
    case ">=":
      return cy(e, n, r);
    case "<":
      return uy(e, n, r);
    case "<=":
      return fy(e, n, r);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Bu = dy;
const hy = De, py = gn, { safeRe: Or, t: Pr } = rr, my = (e, t) => {
  if (e instanceof hy)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let n = null;
  if (!t.rtl)
    n = e.match(t.includePrerelease ? Or[Pr.COERCEFULL] : Or[Pr.COERCE]);
  else {
    const c = t.includePrerelease ? Or[Pr.COERCERTLFULL] : Or[Pr.COERCERTL];
    let m;
    for (; (m = c.exec(e)) && (!n || n.index + n[0].length !== e.length); )
      (!n || m.index + m[0].length !== n.index + n[0].length) && (n = m), c.lastIndex = m.index + m[1].length + m[2].length;
    c.lastIndex = -1;
  }
  if (n === null)
    return null;
  const r = n[2], i = n[3] || "0", o = n[4] || "0", s = t.includePrerelease && n[5] ? `-${n[5]}` : "", a = t.includePrerelease && n[6] ? `+${n[6]}` : "";
  return py(`${r}.${i}.${o}${s}${a}`, t);
};
var gy = my;
class Ey {
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
var yy = Ey, qi, ka;
function Xe() {
  if (ka) return qi;
  ka = 1;
  const e = /\s+/g;
  class t {
    constructor(C, I) {
      if (I = i(I), C instanceof t)
        return C.loose === !!I.loose && C.includePrerelease === !!I.includePrerelease ? C : new t(C.raw, I);
      if (C instanceof o)
        return this.raw = C.value, this.set = [[C]], this.formatted = void 0, this;
      if (this.options = I, this.loose = !!I.loose, this.includePrerelease = !!I.includePrerelease, this.raw = C.trim().replace(e, " "), this.set = this.raw.split("||").map((b) => this.parseRange(b.trim())).filter((b) => b.length), !this.set.length)
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
          const I = this.set[C];
          for (let b = 0; b < I.length; b++)
            b > 0 && (this.formatted += " "), this.formatted += I[b].toString().trim();
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
      const P = this.options.loose, k = P ? c[m.HYPHENRANGELOOSE] : c[m.HYPHENRANGE];
      C = C.replace(k, M(this.options.includePrerelease)), s("hyphen replace", C), C = C.replace(c[m.COMPARATORTRIM], l), s("comparator trim", C), C = C.replace(c[m.TILDETRIM], f), s("tilde trim", C), C = C.replace(c[m.CARETTRIM], h), s("caret trim", C);
      let q = C.split(" ").map((U) => R(U, this.options)).join(" ").split(/\s+/).map((U) => B(U, this.options));
      P && (q = q.filter((U) => (s("loose invalid filter", U, this.options), !!U.match(c[m.COMPARATORLOOSE])))), s("range list", q);
      const j = /* @__PURE__ */ new Map(), K = q.map((U) => new o(U, this.options));
      for (const U of K) {
        if (y(U))
          return [U];
        j.set(U.value, U);
      }
      j.size > 1 && j.has("") && j.delete("");
      const he = [...j.values()];
      return r.set(b, he), he;
    }
    intersects(C, I) {
      if (!(C instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((b) => S(b, I) && C.set.some((D) => S(D, I) && b.every((P) => D.every((k) => P.intersects(k, I)))));
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
      for (let I = 0; I < this.set.length; I++)
        if (X(this.set[I], C, this.options))
          return !0;
      return !1;
    }
  }
  qi = t;
  const n = yy, r = new n(), i = es, o = di(), s = ui, a = De, {
    safeRe: c,
    t: m,
    comparatorTrimReplace: l,
    tildeTrimReplace: f,
    caretTrimReplace: h
  } = rr, { FLAG_INCLUDE_PRERELEASE: g, FLAG_LOOSE: w } = ci, y = (O) => O.value === "<0.0.0-0", A = (O) => O.value === "", S = (O, C) => {
    let I = !0;
    const b = O.slice();
    let D = b.pop();
    for (; I && b.length; )
      I = b.every((P) => D.intersects(P, C)), D = b.pop();
    return I;
  }, R = (O, C) => (O = O.replace(c[m.BUILD], ""), s("comp", O, C), O = se(O, C), s("caret", O), O = x(O, C), s("tildes", O), O = Ue(O, C), s("xrange", O), O = G(O, C), s("stars", O), O), N = (O) => !O || O.toLowerCase() === "x" || O === "*", x = (O, C) => O.trim().split(/\s+/).map((I) => ee(I, C)).join(" "), ee = (O, C) => {
    const I = C.loose ? c[m.TILDELOOSE] : c[m.TILDE];
    return O.replace(I, (b, D, P, k, q) => {
      s("tilde", O, b, D, P, k, q);
      let j;
      return N(D) ? j = "" : N(P) ? j = `>=${D}.0.0 <${+D + 1}.0.0-0` : N(k) ? j = `>=${D}.${P}.0 <${D}.${+P + 1}.0-0` : q ? (s("replaceTilde pr", q), j = `>=${D}.${P}.${k}-${q} <${D}.${+P + 1}.0-0`) : j = `>=${D}.${P}.${k} <${D}.${+P + 1}.0-0`, s("tilde return", j), j;
    });
  }, se = (O, C) => O.trim().split(/\s+/).map((I) => W(I, C)).join(" "), W = (O, C) => {
    s("caret", O, C);
    const I = C.loose ? c[m.CARETLOOSE] : c[m.CARET], b = C.includePrerelease ? "-0" : "";
    return O.replace(I, (D, P, k, q, j) => {
      s("caret", O, D, P, k, q, j);
      let K;
      return N(P) ? K = "" : N(k) ? K = `>=${P}.0.0${b} <${+P + 1}.0.0-0` : N(q) ? P === "0" ? K = `>=${P}.${k}.0${b} <${P}.${+k + 1}.0-0` : K = `>=${P}.${k}.0${b} <${+P + 1}.0.0-0` : j ? (s("replaceCaret pr", j), P === "0" ? k === "0" ? K = `>=${P}.${k}.${q}-${j} <${P}.${k}.${+q + 1}-0` : K = `>=${P}.${k}.${q}-${j} <${P}.${+k + 1}.0-0` : K = `>=${P}.${k}.${q}-${j} <${+P + 1}.0.0-0`) : (s("no pr"), P === "0" ? k === "0" ? K = `>=${P}.${k}.${q}${b} <${P}.${k}.${+q + 1}-0` : K = `>=${P}.${k}.${q}${b} <${P}.${+k + 1}.0-0` : K = `>=${P}.${k}.${q} <${+P + 1}.0.0-0`), s("caret return", K), K;
    });
  }, Ue = (O, C) => (s("replaceXRanges", O, C), O.split(/\s+/).map((I) => E(I, C)).join(" ")), E = (O, C) => {
    O = O.trim();
    const I = C.loose ? c[m.XRANGELOOSE] : c[m.XRANGE];
    return O.replace(I, (b, D, P, k, q, j) => {
      s("xRange", O, b, D, P, k, q, j);
      const K = N(P), he = K || N(k), U = he || N(q), Je = U;
      return D === "=" && Je && (D = ""), j = C.includePrerelease ? "-0" : "", K ? D === ">" || D === "<" ? b = "<0.0.0-0" : b = "*" : D && Je ? (he && (k = 0), q = 0, D === ">" ? (D = ">=", he ? (P = +P + 1, k = 0, q = 0) : (k = +k + 1, q = 0)) : D === "<=" && (D = "<", he ? P = +P + 1 : k = +k + 1), D === "<" && (j = "-0"), b = `${D + P}.${k}.${q}${j}`) : he ? b = `>=${P}.0.0${j} <${+P + 1}.0.0-0` : U && (b = `>=${P}.${k}.0${j} <${P}.${+k + 1}.0-0`), s("xRange return", b), b;
    });
  }, G = (O, C) => (s("replaceStars", O, C), O.trim().replace(c[m.STAR], "")), B = (O, C) => (s("replaceGTE0", O, C), O.trim().replace(c[C.includePrerelease ? m.GTE0PRE : m.GTE0], "")), M = (O) => (C, I, b, D, P, k, q, j, K, he, U, Je) => (N(b) ? I = "" : N(D) ? I = `>=${b}.0.0${O ? "-0" : ""}` : N(P) ? I = `>=${b}.${D}.0${O ? "-0" : ""}` : k ? I = `>=${I}` : I = `>=${I}${O ? "-0" : ""}`, N(K) ? j = "" : N(he) ? j = `<${+K + 1}.0.0-0` : N(U) ? j = `<${K}.${+he + 1}.0-0` : Je ? j = `<=${K}.${he}.${U}-${Je}` : O ? j = `<${K}.${he}.${+U + 1}-0` : j = `<=${j}`, `${I} ${j}`.trim()), X = (O, C, I) => {
    for (let b = 0; b < O.length; b++)
      if (!O[b].test(C))
        return !1;
    if (C.prerelease.length && !I.includePrerelease) {
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
  return qi;
}
var Vi, Ma;
function di() {
  if (Ma) return Vi;
  Ma = 1;
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
  Vi = t;
  const n = es, { safeRe: r, t: i } = rr, o = Bu, s = ui, a = De, c = Xe();
  return Vi;
}
const wy = Xe(), _y = (e, t, n) => {
  try {
    t = new wy(t, n);
  } catch {
    return !1;
  }
  return t.test(e);
};
var hi = _y;
const vy = Xe(), Ay = (e, t) => new vy(e, t).set.map((n) => n.map((r) => r.value).join(" ").trim().split(" "));
var Sy = Ay;
const Ty = De, by = Xe(), Cy = (e, t, n) => {
  let r = null, i = null, o = null;
  try {
    o = new by(t, n);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    o.test(s) && (!r || i.compare(s) === -1) && (r = s, i = new Ty(r, n));
  }), r;
};
var $y = Cy;
const Ry = De, Oy = Xe(), Py = (e, t, n) => {
  let r = null, i = null, o = null;
  try {
    o = new Oy(t, n);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    o.test(s) && (!r || i.compare(s) === 1) && (r = s, i = new Ry(r, n));
  }), r;
};
var Iy = Py;
const Wi = De, Ny = Xe(), Ba = fi, Dy = (e, t) => {
  e = new Ny(e, t);
  let n = new Wi("0.0.0");
  if (e.test(n) || (n = new Wi("0.0.0-0"), e.test(n)))
    return n;
  n = null;
  for (let r = 0; r < e.set.length; ++r) {
    const i = e.set[r];
    let o = null;
    i.forEach((s) => {
      const a = new Wi(s.semver.version);
      switch (s.operator) {
        case ">":
          a.prerelease.length === 0 ? a.patch++ : a.prerelease.push(0), a.raw = a.format();
        case "":
        case ">=":
          (!o || Ba(a, o)) && (o = a);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${s.operator}`);
      }
    }), o && (!n || Ba(n, o)) && (n = o);
  }
  return n && e.test(n) ? n : null;
};
var Fy = Dy;
const xy = Xe(), Ly = (e, t) => {
  try {
    return new xy(e, t).range || "*";
  } catch {
    return null;
  }
};
var Uy = Ly;
const ky = De, ju = di(), { ANY: My } = ju, By = Xe(), jy = hi, ja = fi, Ha = ns, Hy = is, Gy = rs, qy = (e, t, n, r) => {
  e = new ky(e, r), t = new By(t, r);
  let i, o, s, a, c;
  switch (n) {
    case ">":
      i = ja, o = Hy, s = Ha, a = ">", c = ">=";
      break;
    case "<":
      i = Ha, o = Gy, s = ja, a = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (jy(e, t, r))
    return !1;
  for (let m = 0; m < t.set.length; ++m) {
    const l = t.set[m];
    let f = null, h = null;
    if (l.forEach((g) => {
      g.semver === My && (g = new ju(">=0.0.0")), f = f || g, h = h || g, i(g.semver, f.semver, r) ? f = g : s(g.semver, h.semver, r) && (h = g);
    }), f.operator === a || f.operator === c || (!h.operator || h.operator === a) && o(e, h.semver))
      return !1;
    if (h.operator === c && s(e, h.semver))
      return !1;
  }
  return !0;
};
var os = qy;
const Vy = os, Wy = (e, t, n) => Vy(e, t, ">", n);
var Yy = Wy;
const zy = os, Xy = (e, t, n) => zy(e, t, "<", n);
var Ky = Xy;
const Ga = Xe(), Jy = (e, t, n) => (e = new Ga(e, n), t = new Ga(t, n), e.intersects(t, n));
var Qy = Jy;
const Zy = hi, ew = ze;
var tw = (e, t, n) => {
  const r = [];
  let i = null, o = null;
  const s = e.sort((l, f) => ew(l, f, n));
  for (const l of s)
    Zy(l, t, n) ? (o = l, i || (i = l)) : (o && r.push([i, o]), o = null, i = null);
  i && r.push([i, null]);
  const a = [];
  for (const [l, f] of r)
    l === f ? a.push(l) : !f && l === s[0] ? a.push("*") : f ? l === s[0] ? a.push(`<=${f}`) : a.push(`${l} - ${f}`) : a.push(`>=${l}`);
  const c = a.join(" || "), m = typeof t.raw == "string" ? t.raw : String(t);
  return c.length < m.length ? c : t;
};
const qa = Xe(), ss = di(), { ANY: Yi } = ss, bn = hi, as = ze, nw = (e, t, n = {}) => {
  if (e === t)
    return !0;
  e = new qa(e, n), t = new qa(t, n);
  let r = !1;
  e: for (const i of e.set) {
    for (const o of t.set) {
      const s = iw(i, o, n);
      if (r = r || s !== null, s)
        continue e;
    }
    if (r)
      return !1;
  }
  return !0;
}, rw = [new ss(">=0.0.0-0")], Va = [new ss(">=0.0.0")], iw = (e, t, n) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Yi) {
    if (t.length === 1 && t[0].semver === Yi)
      return !0;
    n.includePrerelease ? e = rw : e = Va;
  }
  if (t.length === 1 && t[0].semver === Yi) {
    if (n.includePrerelease)
      return !0;
    t = Va;
  }
  const r = /* @__PURE__ */ new Set();
  let i, o;
  for (const g of e)
    g.operator === ">" || g.operator === ">=" ? i = Wa(i, g, n) : g.operator === "<" || g.operator === "<=" ? o = Ya(o, g, n) : r.add(g.semver);
  if (r.size > 1)
    return null;
  let s;
  if (i && o) {
    if (s = as(i.semver, o.semver, n), s > 0)
      return null;
    if (s === 0 && (i.operator !== ">=" || o.operator !== "<="))
      return null;
  }
  for (const g of r) {
    if (i && !bn(g, String(i), n) || o && !bn(g, String(o), n))
      return null;
    for (const w of t)
      if (!bn(g, String(w), n))
        return !1;
    return !0;
  }
  let a, c, m, l, f = o && !n.includePrerelease && o.semver.prerelease.length ? o.semver : !1, h = i && !n.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
  f && f.prerelease.length === 1 && o.operator === "<" && f.prerelease[0] === 0 && (f = !1);
  for (const g of t) {
    if (l = l || g.operator === ">" || g.operator === ">=", m = m || g.operator === "<" || g.operator === "<=", i) {
      if (h && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === h.major && g.semver.minor === h.minor && g.semver.patch === h.patch && (h = !1), g.operator === ">" || g.operator === ">=") {
        if (a = Wa(i, g, n), a === g && a !== i)
          return !1;
      } else if (i.operator === ">=" && !bn(i.semver, String(g), n))
        return !1;
    }
    if (o) {
      if (f && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === f.major && g.semver.minor === f.minor && g.semver.patch === f.patch && (f = !1), g.operator === "<" || g.operator === "<=") {
        if (c = Ya(o, g, n), c === g && c !== o)
          return !1;
      } else if (o.operator === "<=" && !bn(o.semver, String(g), n))
        return !1;
    }
    if (!g.operator && (o || i) && s !== 0)
      return !1;
  }
  return !(i && m && !o && s !== 0 || o && l && !i && s !== 0 || h || f);
}, Wa = (e, t, n) => {
  if (!e)
    return t;
  const r = as(e.semver, t.semver, n);
  return r > 0 ? e : r < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Ya = (e, t, n) => {
  if (!e)
    return t;
  const r = as(e.semver, t.semver, n);
  return r < 0 ? e : r > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var ow = nw;
const zi = rr, za = ci, sw = De, Xa = Uu, aw = gn, lw = pE, cw = EE, uw = wE, fw = vE, dw = TE, hw = $E, pw = PE, mw = DE, gw = ze, Ew = UE, yw = BE, ww = ts, _w = qE, vw = YE, Aw = fi, Sw = ns, Tw = ku, bw = Mu, Cw = rs, $w = is, Rw = Bu, Ow = gy, Pw = di(), Iw = Xe(), Nw = hi, Dw = Sy, Fw = $y, xw = Iy, Lw = Fy, Uw = Uy, kw = os, Mw = Yy, Bw = Ky, jw = Qy, Hw = tw, Gw = ow;
var Hu = {
  parse: aw,
  valid: lw,
  clean: cw,
  inc: uw,
  diff: fw,
  major: dw,
  minor: hw,
  patch: pw,
  prerelease: mw,
  compare: gw,
  rcompare: Ew,
  compareLoose: yw,
  compareBuild: ww,
  sort: _w,
  rsort: vw,
  gt: Aw,
  lt: Sw,
  eq: Tw,
  neq: bw,
  gte: Cw,
  lte: $w,
  cmp: Rw,
  coerce: Ow,
  Comparator: Pw,
  Range: Iw,
  satisfies: Nw,
  toComparators: Dw,
  maxSatisfying: Fw,
  minSatisfying: xw,
  minVersion: Lw,
  validRange: Uw,
  outside: kw,
  gtr: Mw,
  ltr: Bw,
  intersects: jw,
  simplifyRange: Hw,
  subset: Gw,
  SemVer: sw,
  re: zi.re,
  src: zi.src,
  tokens: zi.t,
  SEMVER_SPEC_VERSION: za.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: za.RELEASE_TYPES,
  compareIdentifiers: Xa.compareIdentifiers,
  rcompareIdentifiers: Xa.rcompareIdentifiers
}, ir = {}, Kr = { exports: {} };
Kr.exports;
(function(e, t) {
  var n = 200, r = "__lodash_hash_undefined__", i = 1, o = 2, s = 9007199254740991, a = "[object Arguments]", c = "[object Array]", m = "[object AsyncFunction]", l = "[object Boolean]", f = "[object Date]", h = "[object Error]", g = "[object Function]", w = "[object GeneratorFunction]", y = "[object Map]", A = "[object Number]", S = "[object Null]", R = "[object Object]", N = "[object Promise]", x = "[object Proxy]", ee = "[object RegExp]", se = "[object Set]", W = "[object String]", Ue = "[object Symbol]", E = "[object Undefined]", G = "[object WeakMap]", B = "[object ArrayBuffer]", M = "[object DataView]", X = "[object Float32Array]", O = "[object Float64Array]", C = "[object Int8Array]", I = "[object Int16Array]", b = "[object Int32Array]", D = "[object Uint8Array]", P = "[object Uint8ClampedArray]", k = "[object Uint16Array]", q = "[object Uint32Array]", j = /[\\^$.*+?()[\]{}|]/g, K = /^\[object .+?Constructor\]$/, he = /^(?:0|[1-9]\d*)$/, U = {};
  U[X] = U[O] = U[C] = U[I] = U[b] = U[D] = U[P] = U[k] = U[q] = !0, U[a] = U[c] = U[B] = U[l] = U[M] = U[f] = U[h] = U[g] = U[y] = U[A] = U[R] = U[ee] = U[se] = U[W] = U[G] = !1;
  var Je = typeof $e == "object" && $e && $e.Object === Object && $e, d = typeof self == "object" && self && self.Object === Object && self, u = Je || d || Function("return this")(), T = t && !t.nodeType && t, v = T && !0 && e && !e.nodeType && e, Y = v && v.exports === T, Q = Y && Je.process, ie = function() {
    try {
      return Q && Q.binding && Q.binding("util");
    } catch {
    }
  }(), ge = ie && ie.isTypedArray;
  function ve(p, _) {
    for (var $ = -1, F = p == null ? 0 : p.length, Z = 0, H = []; ++$ < F; ) {
      var oe = p[$];
      _(oe, $, p) && (H[Z++] = oe);
    }
    return H;
  }
  function ct(p, _) {
    for (var $ = -1, F = _.length, Z = p.length; ++$ < F; )
      p[Z + $] = _[$];
    return p;
  }
  function ue(p, _) {
    for (var $ = -1, F = p == null ? 0 : p.length; ++$ < F; )
      if (_(p[$], $, p))
        return !0;
    return !1;
  }
  function He(p, _) {
    for (var $ = -1, F = Array(p); ++$ < p; )
      F[$] = _($);
    return F;
  }
  function Si(p) {
    return function(_) {
      return p(_);
    };
  }
  function cr(p, _) {
    return p.has(_);
  }
  function wn(p, _) {
    return p == null ? void 0 : p[_];
  }
  function ur(p) {
    var _ = -1, $ = Array(p.size);
    return p.forEach(function(F, Z) {
      $[++_] = [Z, F];
    }), $;
  }
  function cf(p, _) {
    return function($) {
      return p(_($));
    };
  }
  function uf(p) {
    var _ = -1, $ = Array(p.size);
    return p.forEach(function(F) {
      $[++_] = F;
    }), $;
  }
  var ff = Array.prototype, df = Function.prototype, fr = Object.prototype, Ti = u["__core-js_shared__"], gs = df.toString, Qe = fr.hasOwnProperty, Es = function() {
    var p = /[^.]+$/.exec(Ti && Ti.keys && Ti.keys.IE_PROTO || "");
    return p ? "Symbol(src)_1." + p : "";
  }(), ys = fr.toString, hf = RegExp(
    "^" + gs.call(Qe).replace(j, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), ws = Y ? u.Buffer : void 0, dr = u.Symbol, _s = u.Uint8Array, vs = fr.propertyIsEnumerable, pf = ff.splice, Rt = dr ? dr.toStringTag : void 0, As = Object.getOwnPropertySymbols, mf = ws ? ws.isBuffer : void 0, gf = cf(Object.keys, Object), bi = Wt(u, "DataView"), _n = Wt(u, "Map"), Ci = Wt(u, "Promise"), $i = Wt(u, "Set"), Ri = Wt(u, "WeakMap"), vn = Wt(Object, "create"), Ef = It(bi), yf = It(_n), wf = It(Ci), _f = It($i), vf = It(Ri), Ss = dr ? dr.prototype : void 0, Oi = Ss ? Ss.valueOf : void 0;
  function Ot(p) {
    var _ = -1, $ = p == null ? 0 : p.length;
    for (this.clear(); ++_ < $; ) {
      var F = p[_];
      this.set(F[0], F[1]);
    }
  }
  function Af() {
    this.__data__ = vn ? vn(null) : {}, this.size = 0;
  }
  function Sf(p) {
    var _ = this.has(p) && delete this.__data__[p];
    return this.size -= _ ? 1 : 0, _;
  }
  function Tf(p) {
    var _ = this.__data__;
    if (vn) {
      var $ = _[p];
      return $ === r ? void 0 : $;
    }
    return Qe.call(_, p) ? _[p] : void 0;
  }
  function bf(p) {
    var _ = this.__data__;
    return vn ? _[p] !== void 0 : Qe.call(_, p);
  }
  function Cf(p, _) {
    var $ = this.__data__;
    return this.size += this.has(p) ? 0 : 1, $[p] = vn && _ === void 0 ? r : _, this;
  }
  Ot.prototype.clear = Af, Ot.prototype.delete = Sf, Ot.prototype.get = Tf, Ot.prototype.has = bf, Ot.prototype.set = Cf;
  function it(p) {
    var _ = -1, $ = p == null ? 0 : p.length;
    for (this.clear(); ++_ < $; ) {
      var F = p[_];
      this.set(F[0], F[1]);
    }
  }
  function $f() {
    this.__data__ = [], this.size = 0;
  }
  function Rf(p) {
    var _ = this.__data__, $ = pr(_, p);
    if ($ < 0)
      return !1;
    var F = _.length - 1;
    return $ == F ? _.pop() : pf.call(_, $, 1), --this.size, !0;
  }
  function Of(p) {
    var _ = this.__data__, $ = pr(_, p);
    return $ < 0 ? void 0 : _[$][1];
  }
  function Pf(p) {
    return pr(this.__data__, p) > -1;
  }
  function If(p, _) {
    var $ = this.__data__, F = pr($, p);
    return F < 0 ? (++this.size, $.push([p, _])) : $[F][1] = _, this;
  }
  it.prototype.clear = $f, it.prototype.delete = Rf, it.prototype.get = Of, it.prototype.has = Pf, it.prototype.set = If;
  function Pt(p) {
    var _ = -1, $ = p == null ? 0 : p.length;
    for (this.clear(); ++_ < $; ) {
      var F = p[_];
      this.set(F[0], F[1]);
    }
  }
  function Nf() {
    this.size = 0, this.__data__ = {
      hash: new Ot(),
      map: new (_n || it)(),
      string: new Ot()
    };
  }
  function Df(p) {
    var _ = mr(this, p).delete(p);
    return this.size -= _ ? 1 : 0, _;
  }
  function Ff(p) {
    return mr(this, p).get(p);
  }
  function xf(p) {
    return mr(this, p).has(p);
  }
  function Lf(p, _) {
    var $ = mr(this, p), F = $.size;
    return $.set(p, _), this.size += $.size == F ? 0 : 1, this;
  }
  Pt.prototype.clear = Nf, Pt.prototype.delete = Df, Pt.prototype.get = Ff, Pt.prototype.has = xf, Pt.prototype.set = Lf;
  function hr(p) {
    var _ = -1, $ = p == null ? 0 : p.length;
    for (this.__data__ = new Pt(); ++_ < $; )
      this.add(p[_]);
  }
  function Uf(p) {
    return this.__data__.set(p, r), this;
  }
  function kf(p) {
    return this.__data__.has(p);
  }
  hr.prototype.add = hr.prototype.push = Uf, hr.prototype.has = kf;
  function ut(p) {
    var _ = this.__data__ = new it(p);
    this.size = _.size;
  }
  function Mf() {
    this.__data__ = new it(), this.size = 0;
  }
  function Bf(p) {
    var _ = this.__data__, $ = _.delete(p);
    return this.size = _.size, $;
  }
  function jf(p) {
    return this.__data__.get(p);
  }
  function Hf(p) {
    return this.__data__.has(p);
  }
  function Gf(p, _) {
    var $ = this.__data__;
    if ($ instanceof it) {
      var F = $.__data__;
      if (!_n || F.length < n - 1)
        return F.push([p, _]), this.size = ++$.size, this;
      $ = this.__data__ = new Pt(F);
    }
    return $.set(p, _), this.size = $.size, this;
  }
  ut.prototype.clear = Mf, ut.prototype.delete = Bf, ut.prototype.get = jf, ut.prototype.has = Hf, ut.prototype.set = Gf;
  function qf(p, _) {
    var $ = gr(p), F = !$ && od(p), Z = !$ && !F && Pi(p), H = !$ && !F && !Z && Ns(p), oe = $ || F || Z || H, pe = oe ? He(p.length, String) : [], Ee = pe.length;
    for (var ne in p)
      Qe.call(p, ne) && !(oe && // Safari 9 has enumerable `arguments.length` in strict mode.
      (ne == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      Z && (ne == "offset" || ne == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      H && (ne == "buffer" || ne == "byteLength" || ne == "byteOffset") || // Skip index properties.
      ed(ne, Ee))) && pe.push(ne);
    return pe;
  }
  function pr(p, _) {
    for (var $ = p.length; $--; )
      if (Rs(p[$][0], _))
        return $;
    return -1;
  }
  function Vf(p, _, $) {
    var F = _(p);
    return gr(p) ? F : ct(F, $(p));
  }
  function An(p) {
    return p == null ? p === void 0 ? E : S : Rt && Rt in Object(p) ? Qf(p) : id(p);
  }
  function Ts(p) {
    return Sn(p) && An(p) == a;
  }
  function bs(p, _, $, F, Z) {
    return p === _ ? !0 : p == null || _ == null || !Sn(p) && !Sn(_) ? p !== p && _ !== _ : Wf(p, _, $, F, bs, Z);
  }
  function Wf(p, _, $, F, Z, H) {
    var oe = gr(p), pe = gr(_), Ee = oe ? c : ft(p), ne = pe ? c : ft(_);
    Ee = Ee == a ? R : Ee, ne = ne == a ? R : ne;
    var ke = Ee == R, Ge = ne == R, Ae = Ee == ne;
    if (Ae && Pi(p)) {
      if (!Pi(_))
        return !1;
      oe = !0, ke = !1;
    }
    if (Ae && !ke)
      return H || (H = new ut()), oe || Ns(p) ? Cs(p, _, $, F, Z, H) : Kf(p, _, Ee, $, F, Z, H);
    if (!($ & i)) {
      var Me = ke && Qe.call(p, "__wrapped__"), Be = Ge && Qe.call(_, "__wrapped__");
      if (Me || Be) {
        var dt = Me ? p.value() : p, ot = Be ? _.value() : _;
        return H || (H = new ut()), Z(dt, ot, $, F, H);
      }
    }
    return Ae ? (H || (H = new ut()), Jf(p, _, $, F, Z, H)) : !1;
  }
  function Yf(p) {
    if (!Is(p) || nd(p))
      return !1;
    var _ = Os(p) ? hf : K;
    return _.test(It(p));
  }
  function zf(p) {
    return Sn(p) && Ps(p.length) && !!U[An(p)];
  }
  function Xf(p) {
    if (!rd(p))
      return gf(p);
    var _ = [];
    for (var $ in Object(p))
      Qe.call(p, $) && $ != "constructor" && _.push($);
    return _;
  }
  function Cs(p, _, $, F, Z, H) {
    var oe = $ & i, pe = p.length, Ee = _.length;
    if (pe != Ee && !(oe && Ee > pe))
      return !1;
    var ne = H.get(p);
    if (ne && H.get(_))
      return ne == _;
    var ke = -1, Ge = !0, Ae = $ & o ? new hr() : void 0;
    for (H.set(p, _), H.set(_, p); ++ke < pe; ) {
      var Me = p[ke], Be = _[ke];
      if (F)
        var dt = oe ? F(Be, Me, ke, _, p, H) : F(Me, Be, ke, p, _, H);
      if (dt !== void 0) {
        if (dt)
          continue;
        Ge = !1;
        break;
      }
      if (Ae) {
        if (!ue(_, function(ot, Nt) {
          if (!cr(Ae, Nt) && (Me === ot || Z(Me, ot, $, F, H)))
            return Ae.push(Nt);
        })) {
          Ge = !1;
          break;
        }
      } else if (!(Me === Be || Z(Me, Be, $, F, H))) {
        Ge = !1;
        break;
      }
    }
    return H.delete(p), H.delete(_), Ge;
  }
  function Kf(p, _, $, F, Z, H, oe) {
    switch ($) {
      case M:
        if (p.byteLength != _.byteLength || p.byteOffset != _.byteOffset)
          return !1;
        p = p.buffer, _ = _.buffer;
      case B:
        return !(p.byteLength != _.byteLength || !H(new _s(p), new _s(_)));
      case l:
      case f:
      case A:
        return Rs(+p, +_);
      case h:
        return p.name == _.name && p.message == _.message;
      case ee:
      case W:
        return p == _ + "";
      case y:
        var pe = ur;
      case se:
        var Ee = F & i;
        if (pe || (pe = uf), p.size != _.size && !Ee)
          return !1;
        var ne = oe.get(p);
        if (ne)
          return ne == _;
        F |= o, oe.set(p, _);
        var ke = Cs(pe(p), pe(_), F, Z, H, oe);
        return oe.delete(p), ke;
      case Ue:
        if (Oi)
          return Oi.call(p) == Oi.call(_);
    }
    return !1;
  }
  function Jf(p, _, $, F, Z, H) {
    var oe = $ & i, pe = $s(p), Ee = pe.length, ne = $s(_), ke = ne.length;
    if (Ee != ke && !oe)
      return !1;
    for (var Ge = Ee; Ge--; ) {
      var Ae = pe[Ge];
      if (!(oe ? Ae in _ : Qe.call(_, Ae)))
        return !1;
    }
    var Me = H.get(p);
    if (Me && H.get(_))
      return Me == _;
    var Be = !0;
    H.set(p, _), H.set(_, p);
    for (var dt = oe; ++Ge < Ee; ) {
      Ae = pe[Ge];
      var ot = p[Ae], Nt = _[Ae];
      if (F)
        var Ds = oe ? F(Nt, ot, Ae, _, p, H) : F(ot, Nt, Ae, p, _, H);
      if (!(Ds === void 0 ? ot === Nt || Z(ot, Nt, $, F, H) : Ds)) {
        Be = !1;
        break;
      }
      dt || (dt = Ae == "constructor");
    }
    if (Be && !dt) {
      var Er = p.constructor, yr = _.constructor;
      Er != yr && "constructor" in p && "constructor" in _ && !(typeof Er == "function" && Er instanceof Er && typeof yr == "function" && yr instanceof yr) && (Be = !1);
    }
    return H.delete(p), H.delete(_), Be;
  }
  function $s(p) {
    return Vf(p, ld, Zf);
  }
  function mr(p, _) {
    var $ = p.__data__;
    return td(_) ? $[typeof _ == "string" ? "string" : "hash"] : $.map;
  }
  function Wt(p, _) {
    var $ = wn(p, _);
    return Yf($) ? $ : void 0;
  }
  function Qf(p) {
    var _ = Qe.call(p, Rt), $ = p[Rt];
    try {
      p[Rt] = void 0;
      var F = !0;
    } catch {
    }
    var Z = ys.call(p);
    return F && (_ ? p[Rt] = $ : delete p[Rt]), Z;
  }
  var Zf = As ? function(p) {
    return p == null ? [] : (p = Object(p), ve(As(p), function(_) {
      return vs.call(p, _);
    }));
  } : cd, ft = An;
  (bi && ft(new bi(new ArrayBuffer(1))) != M || _n && ft(new _n()) != y || Ci && ft(Ci.resolve()) != N || $i && ft(new $i()) != se || Ri && ft(new Ri()) != G) && (ft = function(p) {
    var _ = An(p), $ = _ == R ? p.constructor : void 0, F = $ ? It($) : "";
    if (F)
      switch (F) {
        case Ef:
          return M;
        case yf:
          return y;
        case wf:
          return N;
        case _f:
          return se;
        case vf:
          return G;
      }
    return _;
  });
  function ed(p, _) {
    return _ = _ ?? s, !!_ && (typeof p == "number" || he.test(p)) && p > -1 && p % 1 == 0 && p < _;
  }
  function td(p) {
    var _ = typeof p;
    return _ == "string" || _ == "number" || _ == "symbol" || _ == "boolean" ? p !== "__proto__" : p === null;
  }
  function nd(p) {
    return !!Es && Es in p;
  }
  function rd(p) {
    var _ = p && p.constructor, $ = typeof _ == "function" && _.prototype || fr;
    return p === $;
  }
  function id(p) {
    return ys.call(p);
  }
  function It(p) {
    if (p != null) {
      try {
        return gs.call(p);
      } catch {
      }
      try {
        return p + "";
      } catch {
      }
    }
    return "";
  }
  function Rs(p, _) {
    return p === _ || p !== p && _ !== _;
  }
  var od = Ts(/* @__PURE__ */ function() {
    return arguments;
  }()) ? Ts : function(p) {
    return Sn(p) && Qe.call(p, "callee") && !vs.call(p, "callee");
  }, gr = Array.isArray;
  function sd(p) {
    return p != null && Ps(p.length) && !Os(p);
  }
  var Pi = mf || ud;
  function ad(p, _) {
    return bs(p, _);
  }
  function Os(p) {
    if (!Is(p))
      return !1;
    var _ = An(p);
    return _ == g || _ == w || _ == m || _ == x;
  }
  function Ps(p) {
    return typeof p == "number" && p > -1 && p % 1 == 0 && p <= s;
  }
  function Is(p) {
    var _ = typeof p;
    return p != null && (_ == "object" || _ == "function");
  }
  function Sn(p) {
    return p != null && typeof p == "object";
  }
  var Ns = ge ? Si(ge) : zf;
  function ld(p) {
    return sd(p) ? qf(p) : Xf(p);
  }
  function cd() {
    return [];
  }
  function ud() {
    return !1;
  }
  e.exports = ad;
})(Kr, Kr.exports);
var qw = Kr.exports;
Object.defineProperty(ir, "__esModule", { value: !0 });
ir.DownloadedUpdateHelper = void 0;
ir.createTempUpdateFile = Xw;
const Vw = Kn, Ww = Tt, Ka = qw, Dt = Ct, Dn = te;
class Yw {
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
    return Dn.join(this.cacheDir, "pending");
  }
  async validateDownloadedPath(t, n, r, i) {
    if (this.versionInfo != null && this.file === t && this.fileInfo != null)
      return Ka(this.versionInfo, n) && Ka(this.fileInfo.info, r.info) && await (0, Dt.pathExists)(t) ? t : null;
    const o = await this.getValidCachedUpdateFile(r, i);
    return o === null ? null : (i.info(`Update has already been downloaded to ${t}).`), this._file = o, o);
  }
  async setDownloadedFile(t, n, r, i, o, s) {
    this._file = t, this._packageFile = n, this.versionInfo = r, this.fileInfo = i, this._downloadedFileInfo = {
      fileName: o,
      sha512: i.info.sha512,
      isAdminRightsRequired: i.info.isAdminRightsRequired === !0
    }, s && await (0, Dt.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
  }
  async clear() {
    this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
  }
  async cleanCacheDirForPendingUpdate() {
    try {
      await (0, Dt.emptyDir)(this.cacheDirForPendingUpdate);
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
    if (!await (0, Dt.pathExists)(r))
      return null;
    let o;
    try {
      o = await (0, Dt.readJson)(r);
    } catch (m) {
      let l = "No cached update info available";
      return m.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), l += ` (error on read: ${m.message})`), n.info(l), null;
    }
    if (!((o == null ? void 0 : o.fileName) !== null))
      return n.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
    if (t.info.sha512 !== o.sha512)
      return n.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${o.sha512}, expected: ${t.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
    const a = Dn.join(this.cacheDirForPendingUpdate, o.fileName);
    if (!await (0, Dt.pathExists)(a))
      return n.info("Cached update file doesn't exist"), null;
    const c = await zw(a);
    return t.info.sha512 !== c ? (n.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${c}, expected: ${t.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = o, a);
  }
  getUpdateInfoFile() {
    return Dn.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
ir.DownloadedUpdateHelper = Yw;
function zw(e, t = "sha512", n = "base64", r) {
  return new Promise((i, o) => {
    const s = (0, Vw.createHash)(t);
    s.on("error", o).setEncoding(n), (0, Ww.createReadStream)(e, {
      ...r,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", o).on("end", () => {
      s.end(), i(s.read());
    }).pipe(s, { end: !1 });
  });
}
async function Xw(e, t, n) {
  let r = 0, i = Dn.join(t, e);
  for (let o = 0; o < 3; o++)
    try {
      return await (0, Dt.unlink)(i), i;
    } catch (s) {
      if (s.code === "ENOENT")
        return i;
      n.warn(`Error on remove temp update file: ${s}`), i = Dn.join(t, `${r++}-${e}`);
    }
  return i;
}
var pi = {}, ls = {};
Object.defineProperty(ls, "__esModule", { value: !0 });
ls.getAppCacheDir = Jw;
const Xi = te, Kw = Zr;
function Jw() {
  const e = (0, Kw.homedir)();
  let t;
  return process.platform === "win32" ? t = process.env.LOCALAPPDATA || Xi.join(e, "AppData", "Local") : process.platform === "darwin" ? t = Xi.join(e, "Library", "Caches") : t = process.env.XDG_CACHE_HOME || Xi.join(e, ".cache"), t;
}
Object.defineProperty(pi, "__esModule", { value: !0 });
pi.ElectronAppAdapter = void 0;
const Ja = te, Qw = ls;
class Zw {
  constructor(t = Mt.app) {
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
    return this.isPackaged ? Ja.join(process.resourcesPath, "app-update.yml") : Ja.join(this.app.getAppPath(), "dev-app-update.yml");
  }
  get userDataPath() {
    return this.app.getPath("userData");
  }
  get baseCachePath() {
    return (0, Qw.getAppCacheDir)();
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
pi.ElectronAppAdapter = Zw;
var Gu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = n;
  const t = de;
  e.NET_SESSION_NAME = "electron-updater";
  function n() {
    return Mt.session.fromPartition(e.NET_SESSION_NAME, {
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
      const a = Mt.net.request({
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
})(Gu);
var or = {}, Ke = {};
Object.defineProperty(Ke, "__esModule", { value: !0 });
Ke.newBaseUrl = e_;
Ke.newUrlFromBase = t_;
Ke.getChannelFilename = n_;
const qu = bt;
function e_(e) {
  const t = new qu.URL(e);
  return t.pathname.endsWith("/") || (t.pathname += "/"), t;
}
function t_(e, t, n = !1) {
  const r = new qu.URL(e, t), i = t.search;
  return i != null && i.length !== 0 ? r.search = i : n && (r.search = `noCache=${Date.now().toString(32)}`), r;
}
function n_(e) {
  return `${e}.yml`;
}
var ce = {}, r_ = "[object Symbol]", Vu = /[\\^$.*+?()[\]{}|]/g, i_ = RegExp(Vu.source), o_ = typeof $e == "object" && $e && $e.Object === Object && $e, s_ = typeof self == "object" && self && self.Object === Object && self, a_ = o_ || s_ || Function("return this")(), l_ = Object.prototype, c_ = l_.toString, Qa = a_.Symbol, Za = Qa ? Qa.prototype : void 0, el = Za ? Za.toString : void 0;
function u_(e) {
  if (typeof e == "string")
    return e;
  if (d_(e))
    return el ? el.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function f_(e) {
  return !!e && typeof e == "object";
}
function d_(e) {
  return typeof e == "symbol" || f_(e) && c_.call(e) == r_;
}
function h_(e) {
  return e == null ? "" : u_(e);
}
function p_(e) {
  return e = h_(e), e && i_.test(e) ? e.replace(Vu, "\\$&") : e;
}
var Wu = p_;
Object.defineProperty(ce, "__esModule", { value: !0 });
ce.Provider = void 0;
ce.findFile = w_;
ce.parseUpdateInfo = __;
ce.getFileList = Yu;
ce.resolveFiles = v_;
const At = de, m_ = _e, g_ = bt, Jr = Ke, E_ = Wu;
class y_ {
  constructor(t) {
    this.runtimeOptions = t, this.requestHeaders = null, this.executor = t.executor;
  }
  // By default, the blockmap file is in the same directory as the main file
  // But some providers may have a different blockmap file, so we need to override this method
  getBlockMapFiles(t, n, r, i = null) {
    const o = (0, Jr.newUrlFromBase)(`${t.pathname}.blockmap`, t);
    return [(0, Jr.newUrlFromBase)(`${t.pathname.replace(new RegExp(E_(r), "g"), n)}.blockmap`, i ? new g_.URL(i) : t), o];
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
    return this.requestHeaders == null ? n != null && (r.headers = n) : r.headers = n == null ? this.requestHeaders : { ...this.requestHeaders, ...n }, (0, At.configureRequestUrl)(t, r), r;
  }
}
ce.Provider = y_;
function w_(e, t, n) {
  var r;
  if (e.length === 0)
    throw (0, At.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
  const i = e.filter((s) => s.url.pathname.toLowerCase().endsWith(`.${t.toLowerCase()}`)), o = (r = i.find((s) => [s.url.pathname, s.info.url].some((a) => a.includes(process.arch)))) !== null && r !== void 0 ? r : i.shift();
  return o || (n == null ? e[0] : e.find((s) => !n.some((a) => s.url.pathname.toLowerCase().endsWith(`.${a.toLowerCase()}`))));
}
function __(e, t, n) {
  if (e == null)
    throw (0, At.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${n}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  let r;
  try {
    r = (0, m_.load)(e);
  } catch (i) {
    throw (0, At.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${n}): ${i.stack || i.message}, rawData: ${e}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  }
  return r;
}
function Yu(e) {
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
  throw (0, At.newError)(`No files provided: ${(0, At.safeStringifyJson)(e)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
}
function v_(e, t, n = (r) => r) {
  const i = Yu(e).map((a) => {
    if (a.sha2 == null && a.sha512 == null)
      throw (0, At.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, At.safeStringifyJson)(a)}`, "ERR_UPDATER_NO_CHECKSUM");
    return {
      url: (0, Jr.newUrlFromBase)(n(a.url), t),
      info: a
    };
  }), o = e.packages, s = o == null ? null : o[process.arch] || o.ia32;
  return s != null && (i[0].packageInfo = {
    ...s,
    path: (0, Jr.newUrlFromBase)(n(s.path), t).href
  }), i;
}
Object.defineProperty(or, "__esModule", { value: !0 });
or.GenericProvider = void 0;
const tl = de, Ki = Ke, Ji = ce;
class A_ extends Ji.Provider {
  constructor(t, n, r) {
    super(r), this.configuration = t, this.updater = n, this.baseUrl = (0, Ki.newBaseUrl)(this.configuration.url);
  }
  get channel() {
    const t = this.updater.channel || this.configuration.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = (0, Ki.getChannelFilename)(this.channel), n = (0, Ki.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
    for (let r = 0; ; r++)
      try {
        return (0, Ji.parseUpdateInfo)(await this.httpRequest(n), t, n);
      } catch (i) {
        if (i instanceof tl.HttpError && i.statusCode === 404)
          throw (0, tl.newError)(`Cannot find channel "${t}" update info: ${i.stack || i.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
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
    return (0, Ji.resolveFiles)(t, this.baseUrl);
  }
}
or.GenericProvider = A_;
var mi = {}, gi = {};
Object.defineProperty(gi, "__esModule", { value: !0 });
gi.BitbucketProvider = void 0;
const nl = de, Qi = Ke, Zi = ce;
class S_ extends Zi.Provider {
  constructor(t, n, r) {
    super({
      ...r,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = n;
    const { owner: i, slug: o } = t;
    this.baseUrl = (0, Qi.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${i}/${o}/downloads`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "latest";
  }
  async getLatestVersion() {
    const t = new nl.CancellationToken(), n = (0, Qi.getChannelFilename)(this.getCustomChannelName(this.channel)), r = (0, Qi.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(r, void 0, t);
      return (0, Zi.parseUpdateInfo)(i, n, r);
    } catch (i) {
      throw (0, nl.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, Zi.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { owner: t, slug: n } = this.configuration;
    return `Bitbucket (owner: ${t}, slug: ${n}, channel: ${this.channel})`;
  }
}
gi.BitbucketProvider = S_;
var St = {};
Object.defineProperty(St, "__esModule", { value: !0 });
St.GitHubProvider = St.BaseGitHubProvider = void 0;
St.computeReleaseNotes = Xu;
const st = de, et = Hu, T_ = bt, rn = Ke, $o = ce, eo = /\/tag\/(v?[^/]+)$/;
class zu extends $o.Provider {
  constructor(t, n, r) {
    super({
      ...r,
      /* because GitHib uses S3 */
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.baseUrl = (0, rn.newBaseUrl)((0, st.githubUrl)(t, n));
    const i = n === "github.com" ? "api.github.com" : n;
    this.baseApiUrl = (0, rn.newBaseUrl)((0, st.githubUrl)(t, i));
  }
  computeGithubBasePath(t) {
    const n = this.options.host;
    return n && !["github.com", "api.github.com"].includes(n) ? `/api/v3${t}` : t;
  }
}
St.BaseGitHubProvider = zu;
class b_ extends zu {
  constructor(t, n, r) {
    super(t, "github.com", r), this.options = t, this.updater = n;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    var t, n, r, i, o;
    const s = new st.CancellationToken(), a = await this.httpRequest((0, rn.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
      accept: "application/xml, application/atom+xml, text/xml, */*"
    }, s), c = (0, st.parseXml)(a);
    let m = c.element("entry", !1, "No published versions on GitHub"), l = null;
    try {
      if (this.updater.allowPrerelease) {
        const A = ((t = this.updater) === null || t === void 0 ? void 0 : t.channel) || ((n = et.prerelease(this.updater.currentVersion)) === null || n === void 0 ? void 0 : n[0]) || null;
        if (A === null)
          l = eo.exec(m.element("link").attribute("href"))[1];
        else
          for (const S of c.getElements("entry")) {
            const R = eo.exec(S.element("link").attribute("href"));
            if (R === null)
              continue;
            const N = R[1];
            if (!et.valid(N))
              continue;
            const x = ((r = et.prerelease(N)) === null || r === void 0 ? void 0 : r[0]) || null, ee = !A || ["alpha", "beta"].includes(A), se = x !== null && !["alpha", "beta"].includes(String(x));
            if (ee && !se && !(A === "beta" && x === "alpha")) {
              l = N, m = S;
              break;
            }
            if (x && x === A) {
              l = N, m = S;
              break;
            }
          }
      } else {
        l = await this.getLatestTagName(s);
        for (const A of c.getElements("entry")) {
          const S = eo.exec(A.element("link").attribute("href"));
          if (S != null && S[1] === l) {
            m = A;
            break;
          }
        }
      }
    } catch (A) {
      throw (0, st.newError)(`Cannot parse releases feed: ${A.stack || A.message},
XML:
${a}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
    }
    if (l == null)
      throw (0, st.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let f, h = "", g = "";
    const w = async (A) => {
      h = (0, rn.getChannelFilename)(A), g = (0, rn.newUrlFromBase)(this.getBaseDownloadPath(String(l), h), this.baseUrl);
      const S = this.createRequestOptions(g);
      try {
        return await this.executor.request(S, s);
      } catch (R) {
        throw R instanceof st.HttpError && R.statusCode === 404 ? (0, st.newError)(`Cannot find ${h} in the latest release artifacts (${g}): ${R.stack || R.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : R;
      }
    };
    try {
      let A = this.channel;
      this.updater.allowPrerelease && (!((i = et.prerelease(l)) === null || i === void 0) && i[0]) && (A = this.getCustomChannelName(String((o = et.prerelease(l)) === null || o === void 0 ? void 0 : o[0]))), f = await w(A);
    } catch (A) {
      if (this.updater.allowPrerelease)
        f = await w(this.getDefaultChannelName());
      else
        throw A;
    }
    const y = (0, $o.parseUpdateInfo)(f, h, g);
    return y.releaseName == null && (y.releaseName = m.elementValueOrEmpty("title")), y.releaseNotes == null && (y.releaseNotes = Xu(this.updater.currentVersion, this.updater.fullChangelog, c, m)), {
      tag: l,
      ...y
    };
  }
  async getLatestTagName(t) {
    const n = this.options, r = n.host == null || n.host === "github.com" ? (0, rn.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new T_.URL(`${this.computeGithubBasePath(`/repos/${n.owner}/${n.repo}/releases`)}/latest`, this.baseApiUrl);
    try {
      const i = await this.httpRequest(r, { Accept: "application/json" }, t);
      return i == null ? null : JSON.parse(i).tag_name;
    } catch (i) {
      throw (0, st.newError)(`Unable to find latest version on GitHub (${r}), please ensure a production release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return `/${this.options.owner}/${this.options.repo}/releases`;
  }
  resolveFiles(t) {
    return (0, $o.resolveFiles)(t, this.baseUrl, (n) => this.getBaseDownloadPath(t.tag, n.replace(/ /g, "-")));
  }
  getBaseDownloadPath(t, n) {
    return `${this.basePath}/download/${t}/${n}`;
  }
}
St.GitHubProvider = b_;
function rl(e) {
  const t = e.elementValueOrEmpty("content");
  return t === "No content." ? "" : t;
}
function Xu(e, t, n, r) {
  if (!t)
    return rl(r);
  const i = /\/tag\/v?([^/]+)$/;
  let o;
  try {
    o = i.exec(r.element("link").attribute("href"))[1], o = et.valid(o) ? o : void 0;
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
    if (!et.valid(c))
      continue;
    const m = et.gt(c, e.raw), l = et.lte(c, o);
    m && l && s.push({
      version: c,
      note: rl(a)
    });
  }
  return s.sort((a, c) => et.rcompare(a.version, c.version));
}
var Ei = {};
Object.defineProperty(Ei, "__esModule", { value: !0 });
Ei.GitLabProvider = void 0;
const ye = de, to = bt, C_ = Wu, Ir = Ke, no = ce;
class $_ extends no.Provider {
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
    this.baseApiUrl = (0, Ir.newBaseUrl)(`https://${o}/api/v4`);
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
    const t = new ye.CancellationToken(), n = (0, Ir.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl), r = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) };
    let i;
    try {
      i = await this.httpRequest(n, r, t);
    } catch (g) {
      throw (0, ye.newError)(`Unable to find latest release on GitLab (${n}): ${g.stack || g.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    if (!i)
      throw (0, ye.newError)("No published releases on GitLab", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let o;
    try {
      o = JSON.parse(i);
    } catch (g) {
      throw (0, ye.newError)(`Unable to parse latest release response from GitLab (${n}): response was not valid JSON: ${g.stack || g.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    if (o.upcoming_release)
      throw (0, ye.newError)("Latest GitLab release is scheduled but not yet published", "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    const s = o.tag_name;
    let a = null, c = "", m = null;
    const l = async (g) => {
      c = (0, Ir.getChannelFilename)(g);
      const w = o.assets.links.find((S) => S.name === c);
      if (!w)
        throw (0, ye.newError)(`Cannot find ${c} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      m = new to.URL(w.direct_asset_url);
      const y = this.setAuthHeaderForToken(this.options.token || null), A = Object.keys(y).length ? y : void 0;
      try {
        const S = await this.httpRequest(m, A, t);
        if (!S)
          throw (0, ye.newError)(`Empty response from ${m}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        return S;
      } catch (S) {
        throw S instanceof ye.HttpError && S.statusCode === 404 ? (0, ye.newError)(`Cannot find ${c} in the latest release artifacts (${m}): ${S.stack || S.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : S;
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
      throw (0, ye.newError)(`Unable to parse channel data from ${c}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    const f = (0, no.parseUpdateInfo)(a, c, m);
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
        return new to.URL(o);
    }
    return null;
  }
  async fetchReleaseInfoByVersion(t) {
    const n = new ye.CancellationToken(), r = [`v${t}`, t];
    for (const i of r) {
      const o = (0, Ir.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(i)}`, this.baseApiUrl);
      try {
        const s = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, a = await this.httpRequest(o, s, n);
        if (a)
          return JSON.parse(a);
      } catch (s) {
        if (s instanceof ye.HttpError && s.statusCode === 404)
          continue;
        throw (0, ye.newError)(`Unable to find release ${i} on GitLab (${o}): ${s.stack || s.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
      }
    }
    throw (0, ye.newError)(`Unable to find release with version ${t} (tried: ${r.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
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
      const c = r.replace(new RegExp(C_(n), "g"), t);
      o = this.findBlockMapInAssets(a, c);
    }
    return [o, i];
  }
  async getBlockMapFiles(t, n, r, i = null) {
    if (this.options.uploadTarget === "project_upload") {
      const o = t.pathname.split("/").pop() || "", [s, a] = await this.findBlockMapUrlsFromAssets(n, r, o);
      if (!a)
        throw (0, ye.newError)(`Cannot find blockmap file for ${r} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      if (!s)
        throw (0, ye.newError)(`Cannot find blockmap file for ${n} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      return [s, a];
    } else
      return super.getBlockMapFiles(t, n, r, i);
  }
  resolveFiles(t) {
    return (0, no.getFileList)(t).map((n) => {
      const i = [
        n.url,
        // Original filename
        this.normalizeFilename(n.url)
        // Normalized filename (spaces/underscores → dashes)
      ].find((s) => t.assets.has(s)), o = i ? t.assets.get(i) : void 0;
      if (!o)
        throw (0, ye.newError)(`Cannot find asset "${n.url}" in GitLab release assets. Available assets: ${Array.from(t.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new to.URL(o),
        info: n
      };
    });
  }
  toString() {
    return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
  }
}
Ei.GitLabProvider = $_;
var yi = {};
Object.defineProperty(yi, "__esModule", { value: !0 });
yi.KeygenProvider = void 0;
const il = de, ro = Ke, io = ce;
class R_ extends io.Provider {
  constructor(t, n, r) {
    super({
      ...r,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = n, this.defaultHostname = "api.keygen.sh";
    const i = this.configuration.host || this.defaultHostname;
    this.baseUrl = (0, ro.newBaseUrl)(`https://${i}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "stable";
  }
  async getLatestVersion() {
    const t = new il.CancellationToken(), n = (0, ro.getChannelFilename)(this.getCustomChannelName(this.channel)), r = (0, ro.newUrlFromBase)(n, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(r, {
        Accept: "application/vnd.api+json",
        "Keygen-Version": "1.1"
      }, t);
      return (0, io.parseUpdateInfo)(i, n, r);
    } catch (i) {
      throw (0, il.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, io.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { account: t, product: n, platform: r } = this.configuration;
    return `Keygen (account: ${t}, product: ${n}, platform: ${r}, channel: ${this.channel})`;
  }
}
yi.KeygenProvider = R_;
var wi = {};
Object.defineProperty(wi, "__esModule", { value: !0 });
wi.PrivateGitHubProvider = void 0;
const zt = de, O_ = _e, P_ = te, ol = bt, sl = Ke, I_ = St, N_ = ce;
class D_ extends I_.BaseGitHubProvider {
  constructor(t, n, r, i) {
    super(t, "api.github.com", i), this.updater = n, this.token = r;
  }
  createRequestOptions(t, n) {
    const r = super.createRequestOptions(t, n);
    return r.redirect = "manual", r;
  }
  async getLatestVersion() {
    const t = new zt.CancellationToken(), n = (0, sl.getChannelFilename)(this.getDefaultChannelName()), r = await this.getLatestVersionInfo(t), i = r.assets.find((a) => a.name === n);
    if (i == null)
      throw (0, zt.newError)(`Cannot find ${n} in the release ${r.html_url || r.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
    const o = new ol.URL(i.url);
    let s;
    try {
      s = (0, O_.load)(await this.httpRequest(o, this.configureHeaders("application/octet-stream"), t));
    } catch (a) {
      throw a instanceof zt.HttpError && a.statusCode === 404 ? (0, zt.newError)(`Cannot find ${n} in the latest release artifacts (${o}): ${a.stack || a.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : a;
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
    const i = (0, sl.newUrlFromBase)(r, this.baseUrl);
    try {
      const o = JSON.parse(await this.httpRequest(i, this.configureHeaders("application/vnd.github.v3+json"), t));
      if (n) {
        const s = o.filter((a) => !a.draft);
        return s.find((a) => a.prerelease) || s[0];
      } else
        return o;
    } catch (o) {
      throw (0, zt.newError)(`Unable to find latest version on GitHub (${i}), please ensure a production release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
  }
  resolveFiles(t) {
    return (0, N_.getFileList)(t).map((n) => {
      const r = P_.posix.basename(n.url).replace(/ /g, "-"), i = t.assets.find((o) => o != null && o.name === r);
      if (i == null)
        throw (0, zt.newError)(`Cannot find asset "${r}" in: ${JSON.stringify(t.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new ol.URL(i.url),
        info: n
      };
    });
  }
}
wi.PrivateGitHubProvider = D_;
Object.defineProperty(mi, "__esModule", { value: !0 });
mi.isUrlProbablySupportMultiRangeRequests = Ku;
mi.createClient = M_;
const Nr = de, F_ = gi, al = or, x_ = St, L_ = Ei, U_ = yi, k_ = wi;
function Ku(e) {
  return !e.includes("s3.amazonaws.com");
}
function M_(e, t, n) {
  if (typeof e == "string")
    throw (0, Nr.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
  const r = e.provider;
  switch (r) {
    case "github": {
      const i = e, o = (i.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || i.token;
      return o == null ? new x_.GitHubProvider(i, t, n) : new k_.PrivateGitHubProvider(i, t, o, n);
    }
    case "bitbucket":
      return new F_.BitbucketProvider(e, t, n);
    case "gitlab":
      return new L_.GitLabProvider(e, t, n);
    case "keygen":
      return new U_.KeygenProvider(e, t, n);
    case "s3":
    case "spaces":
      return new al.GenericProvider({
        provider: "generic",
        url: (0, Nr.getS3LikeProviderBaseUrl)(e),
        channel: e.channel || null
      }, t, {
        ...n,
        // https://github.com/minio/minio/issues/5285#issuecomment-350428955
        isUseMultipleRangeRequest: !1
      });
    case "generic": {
      const i = e;
      return new al.GenericProvider(i, t, {
        ...n,
        isUseMultipleRangeRequest: i.useMultipleRangeRequest !== !1 && Ku(i.url)
      });
    }
    case "custom": {
      const i = e, o = i.updateProvider;
      if (!o)
        throw (0, Nr.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
      return new o(i, t, n);
    }
    default:
      throw (0, Nr.newError)(`Unsupported provider: ${r}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
  }
}
var _i = {}, sr = {}, En = {}, Vt = {};
Object.defineProperty(Vt, "__esModule", { value: !0 });
Vt.OperationKind = void 0;
Vt.computeOperations = B_;
var Ut;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(Ut || (Vt.OperationKind = Ut = {}));
function B_(e, t, n) {
  const r = cl(e.files), i = cl(t.files);
  let o = null;
  const s = t.files[0], a = [], c = s.name, m = r.get(c);
  if (m == null)
    throw new Error(`no file ${c} in old blockmap`);
  const l = i.get(c);
  let f = 0;
  const { checksumToOffset: h, checksumToOldSize: g } = H_(r.get(c), m.offset, n);
  let w = s.offset;
  for (let y = 0; y < l.checksums.length; w += l.sizes[y], y++) {
    const A = l.sizes[y], S = l.checksums[y];
    let R = h.get(S);
    R != null && g.get(S) !== A && (n.warn(`Checksum ("${S}") matches, but size differs (old: ${g.get(S)}, new: ${A})`), R = void 0), R === void 0 ? (f++, o != null && o.kind === Ut.DOWNLOAD && o.end === w ? o.end += A : (o = {
      kind: Ut.DOWNLOAD,
      start: w,
      end: w + A
      // oldBlocks: null,
    }, ll(o, a, S, y))) : o != null && o.kind === Ut.COPY && o.end === R ? o.end += A : (o = {
      kind: Ut.COPY,
      start: R,
      end: R + A
      // oldBlocks: [checksum]
    }, ll(o, a, S, y));
  }
  return f > 0 && n.info(`File${s.name === "file" ? "" : " " + s.name} has ${f} changed blocks`), a;
}
const j_ = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
function ll(e, t, n, r) {
  if (j_ && t.length !== 0) {
    const i = t[t.length - 1];
    if (i.kind === e.kind && e.start < i.end && e.start > i.start) {
      const o = [i.start, i.end, e.start, e.end].reduce((s, a) => s < a ? s : a);
      throw new Error(`operation (block index: ${r}, checksum: ${n}, kind: ${Ut[e.kind]}) overlaps previous operation (checksum: ${n}):
abs: ${i.start} until ${i.end} and ${e.start} until ${e.end}
rel: ${i.start - o} until ${i.end - o} and ${e.start - o} until ${e.end - o}`);
    }
  }
  t.push(e);
}
function H_(e, t, n) {
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
function cl(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e)
    t.set(n.name, n);
  return t;
}
Object.defineProperty(En, "__esModule", { value: !0 });
En.DataSplitter = void 0;
En.copyData = Ju;
const Dr = de, G_ = Tt, q_ = Xn, V_ = Vt, ul = Buffer.from(`\r
\r
`);
var mt;
(function(e) {
  e[e.INIT = 0] = "INIT", e[e.HEADER = 1] = "HEADER", e[e.BODY = 2] = "BODY";
})(mt || (mt = {}));
function Ju(e, t, n, r, i) {
  const o = (0, G_.createReadStream)("", {
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
class W_ extends q_.Writable {
  constructor(t, n, r, i, o, s, a, c) {
    super(), this.out = t, this.options = n, this.partIndexToTaskIndex = r, this.partIndexToLength = o, this.finishHandler = s, this.grandTotalBytes = a, this.onProgress = c, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = mt.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = i.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
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
      throw (0, Dr.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
    if (this.ignoreByteCount > 0) {
      const r = Math.min(this.ignoreByteCount, t.length);
      this.ignoreByteCount -= r, n = r;
    } else if (this.remainingPartDataCount > 0) {
      const r = Math.min(this.remainingPartDataCount, t.length);
      this.remainingPartDataCount -= r, await this.processPartData(t, 0, r), n = r;
    }
    if (n !== t.length) {
      if (this.readState === mt.HEADER) {
        const r = this.searchHeaderListEnd(t, n);
        if (r === -1)
          return;
        n = r, this.readState = mt.BODY, this.headerListBuffer = null;
      }
      for (; ; ) {
        if (this.readState === mt.BODY)
          this.readState = mt.INIT;
        else {
          this.partIndex++;
          let s = this.partIndexToTaskIndex.get(this.partIndex);
          if (s == null)
            if (this.isFinished)
              s = this.options.end;
            else
              throw (0, Dr.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
          const a = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
          if (a < s)
            await this.copyExistingData(a, s);
          else if (a > s)
            throw (0, Dr.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
          if (this.isFinished) {
            this.onPartEnd(), this.finishHandler();
            return;
          }
          if (n = this.searchHeaderListEnd(t, n), n === -1) {
            this.readState = mt.HEADER;
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
        if (s.kind !== V_.OperationKind.COPY) {
          i(new Error("Task kind must be COPY"));
          return;
        }
        Ju(s, this.out, this.options.oldFileFd, i, () => {
          t++, o();
        });
      };
      o();
    });
  }
  searchHeaderListEnd(t, n) {
    const r = t.indexOf(ul, n);
    if (r !== -1)
      return r + ul.length;
    const i = n === 0 ? t : t.slice(n);
    return this.headerListBuffer == null ? this.headerListBuffer = i : this.headerListBuffer = Buffer.concat([this.headerListBuffer, i]), -1;
  }
  onPartEnd() {
    const t = this.partIndexToLength[this.partIndex - 1];
    if (this.actualPartLength !== t)
      throw (0, Dr.newError)(`Expected length: ${t} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
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
En.DataSplitter = W_;
var vi = {};
Object.defineProperty(vi, "__esModule", { value: !0 });
vi.executeTasksUsingMultipleRangeRequests = Y_;
vi.checkIsRangesSupported = Oo;
const Ro = de, fl = En, dl = Vt;
function Y_(e, t, n, r, i) {
  const o = (s) => {
    if (s >= t.length) {
      e.fileMetadataBuffer != null && n.write(e.fileMetadataBuffer), n.end();
      return;
    }
    const a = s + 1e3;
    z_(e, {
      tasks: t,
      start: s,
      end: Math.min(t.length, a),
      oldFileFd: r
    }, n, () => o(a), i);
  };
  return o;
}
function z_(e, t, n, r, i) {
  let o = "bytes=", s = 0, a = 0;
  const c = /* @__PURE__ */ new Map(), m = [];
  for (let h = t.start; h < t.end; h++) {
    const g = t.tasks[h];
    g.kind === dl.OperationKind.DOWNLOAD && (o += `${g.start}-${g.end - 1}, `, c.set(s, h), s++, m.push(g.end - g.start), a += g.end - g.start);
  }
  if (s <= 1) {
    const h = (g) => {
      if (g >= t.end) {
        r();
        return;
      }
      const w = t.tasks[g++];
      if (w.kind === dl.OperationKind.COPY)
        (0, fl.copyData)(w, n, t.oldFileFd, i, () => h(g));
      else {
        const y = e.createRequestOptions();
        y.headers.Range = `bytes=${w.start}-${w.end - 1}`;
        const A = e.httpExecutor.createRequest(y, (S) => {
          S.on("error", i), Oo(S, i) && (S.pipe(n, {
            end: !1
          }), S.once("end", () => h(g)));
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
    if (!Oo(h, i))
      return;
    const g = (0, Ro.safeGetHeader)(h, "content-type"), w = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(g);
    if (w == null) {
      i(new Error(`Content-Type "multipart/byteranges" is expected, but got "${g}"`));
      return;
    }
    const y = new fl.DataSplitter(n, t, c, w[1] || w[2], m, r, a, e.options.onProgress);
    y.on("error", i), h.pipe(y), h.on("end", () => {
      setTimeout(() => {
        f.abort(), i(new Error("Response ends without calling any handlers"));
      }, 1e4);
    });
  });
  e.httpExecutor.addErrorAndTimeoutHandlers(f, i), f.end();
}
function Oo(e, t) {
  if (e.statusCode >= 400)
    return t((0, Ro.createHttpError)(e)), !1;
  if (e.statusCode !== 206) {
    const n = (0, Ro.safeGetHeader)(e, "accept-ranges");
    if (n == null || n === "none")
      return t(new Error(`Server doesn't support Accept-Ranges (response code ${e.statusCode})`)), !1;
  }
  return !0;
}
var Ai = {};
Object.defineProperty(Ai, "__esModule", { value: !0 });
Ai.ProgressDifferentialDownloadCallbackTransform = void 0;
const X_ = Xn;
var on;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(on || (on = {}));
class K_ extends X_.Transform {
  constructor(t, n, r) {
    super(), this.progressDifferentialDownloadInfo = t, this.cancellationToken = n, this.onProgress = r, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = on.COPY, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, n, r) {
    if (this.cancellationToken.cancelled) {
      r(new Error("cancelled"), null);
      return;
    }
    if (this.operationType == on.COPY) {
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
    this.operationType = on.COPY;
  }
  beginRangeDownload() {
    this.operationType = on.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
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
Ai.ProgressDifferentialDownloadCallbackTransform = K_;
Object.defineProperty(sr, "__esModule", { value: !0 });
sr.DifferentialDownloader = void 0;
const Cn = de, oo = Ct, J_ = Tt, Q_ = En, Z_ = bt, Fr = Vt, hl = vi, ev = Ai;
class tv {
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
    return (0, Cn.configureRequestUrl)(this.options.newUrl, t), (0, Cn.configureRequestOptions)(t), t;
  }
  doDownload(t, n) {
    if (t.version !== n.version)
      throw new Error(`version is different (${t.version} - ${n.version}), full download is required`);
    const r = this.logger, i = (0, Fr.computeOperations)(t, n, r);
    r.debug != null && r.debug(JSON.stringify(i, null, 2));
    let o = 0, s = 0;
    for (const c of i) {
      const m = c.end - c.start;
      c.kind === Fr.OperationKind.DOWNLOAD ? o += m : s += m;
    }
    const a = this.blockAwareFileInfo.size;
    if (o + s + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== a)
      throw new Error(`Internal error, size mismatch: downloadSize: ${o}, copySize: ${s}, newSize: ${a}`);
    return r.info(`Full: ${pl(a)}, To download: ${pl(o)} (${Math.round(o / (a / 100))}%)`), this.downloadFile(i);
  }
  downloadFile(t) {
    const n = [], r = () => Promise.all(n.map((i) => (0, oo.close)(i.descriptor).catch((o) => {
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
    const r = await (0, oo.open)(this.options.oldFile, "r");
    n.push({ descriptor: r, path: this.options.oldFile });
    const i = await (0, oo.open)(this.options.newFile, "w");
    n.push({ descriptor: i, path: this.options.newFile });
    const o = (0, J_.createWriteStream)(this.options.newFile, { fd: i });
    await new Promise((s, a) => {
      const c = [];
      let m;
      if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
        const S = [];
        let R = 0;
        for (const x of t)
          x.kind === Fr.OperationKind.DOWNLOAD && (S.push(x.end - x.start), R += x.end - x.start);
        const N = {
          expectedByteCounts: S,
          grandTotal: R
        };
        m = new ev.ProgressDifferentialDownloadCallbackTransform(N, this.options.cancellationToken, this.options.onProgress), c.push(m);
      }
      const l = new Cn.DigestTransform(this.blockAwareFileInfo.sha512);
      l.isValidateOnEnd = !1, c.push(l), o.on("finish", () => {
        o.close(() => {
          n.splice(1, 1);
          try {
            l.validate();
          } catch (S) {
            a(S);
            return;
          }
          s(void 0);
        });
      }), c.push(o);
      let f = null;
      for (const S of c)
        S.on("error", a), f == null ? f = S : f = f.pipe(S);
      const h = c[0];
      let g;
      if (this.options.isUseMultipleRangeRequest) {
        g = (0, hl.executeTasksUsingMultipleRangeRequests)(this, t, h, r, a), g(0);
        return;
      }
      let w = 0, y = null;
      this.logger.info(`Differential download: ${this.options.newUrl}`);
      const A = this.createRequestOptions();
      A.redirect = "manual", g = (S) => {
        var R, N;
        if (S >= t.length) {
          this.fileMetadataBuffer != null && h.write(this.fileMetadataBuffer), h.end();
          return;
        }
        const x = t[S++];
        if (x.kind === Fr.OperationKind.COPY) {
          m && m.beginFileCopy(), (0, Q_.copyData)(x, h, r, a, () => g(S));
          return;
        }
        const ee = `bytes=${x.start}-${x.end - 1}`;
        A.headers.range = ee, (N = (R = this.logger) === null || R === void 0 ? void 0 : R.debug) === null || N === void 0 || N.call(R, `download range: ${ee}`), m && m.beginRangeDownload();
        const se = this.httpExecutor.createRequest(A, (W) => {
          W.on("error", a), W.on("aborted", () => {
            a(new Error("response has been aborted by the server"));
          }), W.statusCode >= 400 && a((0, Cn.createHttpError)(W)), W.pipe(h, {
            end: !1
          }), W.once("end", () => {
            m && m.endRangeDownload(), ++w === 100 ? (w = 0, setTimeout(() => g(S), 1e3)) : g(S);
          });
        });
        se.on("redirect", (W, Ue, E) => {
          this.logger.info(`Redirect to ${nv(E)}`), y = E, (0, Cn.configureRequestUrl)(new Z_.URL(y), A), se.followRedirect();
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
        (0, hl.checkIsRangesSupported)(s, i) && (s.on("error", i), s.on("aborted", () => {
          i(new Error("response has been aborted by the server"));
        }), s.on("data", n), s.on("end", () => r()));
      });
      this.httpExecutor.addErrorAndTimeoutHandlers(o, i), o.end();
    });
  }
}
sr.DifferentialDownloader = tv;
function pl(e, t = " KB") {
  return new Intl.NumberFormat("en").format((e / 1024).toFixed(2)) + t;
}
function nv(e) {
  const t = e.indexOf("?");
  return t < 0 ? e : e.substring(0, t);
}
Object.defineProperty(_i, "__esModule", { value: !0 });
_i.GenericDifferentialDownloader = void 0;
const rv = sr;
class iv extends rv.DifferentialDownloader {
  download(t, n) {
    return this.doDownload(t, n);
  }
}
_i.GenericDifferentialDownloader = iv;
var $t = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = r;
  const t = de;
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
})($t);
Object.defineProperty(_t, "__esModule", { value: !0 });
_t.NoOpLogger = _t.AppUpdater = void 0;
const Ce = de, ov = Kn, sv = Zr, av = Fl, qe = Ct, lv = _e, so = li, je = te, Ft = Hu, ml = ir, cv = pi, gl = Gu, uv = or, ao = mi, lo = Ll, fv = _i, Xt = $t;
class cs extends av.EventEmitter {
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
        throw (0, Ce.newError)(`Channel must be a string, but got: ${t}`, "ERR_UPDATER_INVALID_CHANNEL");
      if (t.length === 0)
        throw (0, Ce.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
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
    return (0, gl.getNetSession)();
  }
  /**
   * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
   * Set it to `null` if you would like to disable a logging feature.
   */
  get logger() {
    return this._logger;
  }
  set logger(t) {
    this._logger = t ?? new Qu();
  }
  // noinspection JSUnusedGlobalSymbols
  /**
   * test only
   * @private
   */
  set updateConfigPath(t) {
    this.clientPromise = null, this._appUpdateConfigPath = t, this.configOnDisk = new so.Lazy(() => this.loadUpdateConfig());
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
    super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new Xt.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (o) => this.checkIfUpdateSupported(o), this._isUserWithinRollout = (o) => this.isStagingMatch(o), this.clientPromise = null, this.stagingUserIdPromise = new so.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new so.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (o) => {
      this._logger.error(`Error: ${o.stack || o.message}`);
    }), n == null ? (this.app = new cv.ElectronAppAdapter(), this.httpExecutor = new gl.ElectronHttpExecutor((o, s) => this.emit("login", o, s))) : (this.app = n, this.httpExecutor = null);
    const r = this.app.version, i = (0, Ft.parse)(r);
    if (i == null)
      throw (0, Ce.newError)(`App version is not a valid semver version: "${r}"`, "ERR_UPDATER_INVALID_VERSION");
    this.currentVersion = i, this.allowPrerelease = dv(i), t != null && (this.setFeedURL(t), typeof t != "string" && t.requestHeaders && (this.requestHeaders = t.requestHeaders));
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
    typeof t == "string" ? r = new uv.GenericProvider({ provider: "generic", url: t }, this, {
      ...n,
      isUseMultipleRangeRequest: (0, ao.isUrlProbablySupportMultiRangeRequests)(t)
    }) : r = (0, ao.createClient)(t, this, n), this.clientPromise = Promise.resolve(r);
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
      const r = cs.formatDownloadNotification(n.updateInfo.version, this.app.name, t);
      new Mt.Notification(r).show();
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
    const i = await this.stagingUserIdPromise.value, s = Ce.UUID.parse(i).readUInt32BE(12) / 4294967295;
    return this._logger.info(`Staging percentage: ${r}, percentage: ${s}, user id: ${i}`), s < r;
  }
  computeFinalHeaders(t) {
    return this.requestHeaders != null && Object.assign(t, this.requestHeaders), t;
  }
  async isUpdateAvailable(t) {
    const n = (0, Ft.parse)(t.version);
    if (n == null)
      throw (0, Ce.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${t.version}"`, "ERR_UPDATER_INVALID_VERSION");
    const r = this.currentVersion;
    if ((0, Ft.eq)(n, r) || !await Promise.resolve(this.isUpdateSupported(t)) || !await Promise.resolve(this.isUserWithinRollout(t)))
      return !1;
    const o = (0, Ft.gt)(n, r), s = (0, Ft.lt)(n, r);
    return o ? !0 : this.allowDowngrade && s;
  }
  checkIfUpdateSupported(t) {
    const n = t == null ? void 0 : t.minimumSystemVersion, r = (0, sv.release)();
    if (n)
      try {
        if ((0, Ft.lt)(r, n))
          return this._logger.info(`Current OS version ${r} is less than the minimum OS version required ${n} for version ${r}`), !1;
      } catch (i) {
        this._logger.warn(`Failed to compare current OS version(${r}) with minimum OS version(${n}): ${(i.message || i).toString()}`);
      }
    return !0;
  }
  async getUpdateInfoAndProvider() {
    await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((r) => (0, ao.createClient)(r, this, this.createProviderRuntimeOptions())));
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
    const r = new Ce.CancellationToken();
    return {
      isUpdateAvailable: !0,
      versionInfo: n,
      updateInfo: n,
      cancellationToken: r,
      downloadPromise: this.autoDownload ? this.downloadUpdate(r) : null
    };
  }
  onUpdateAvailable(t) {
    this._logger.info(`Found version ${t.version} (url: ${(0, Ce.asArray)(t.files).map((n) => n.url).join(", ")})`), this.emit("update-available", t);
  }
  /**
   * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
   * @returns {Promise<Array<string>>} Paths to downloaded files.
   */
  downloadUpdate(t = new Ce.CancellationToken()) {
    const n = this.updateInfoAndProvider;
    if (n == null) {
      const i = new Error("Please check update first");
      return this.dispatchError(i), Promise.reject(i);
    }
    if (this.downloadPromise != null)
      return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
    this._logger.info(`Downloading update from ${(0, Ce.asArray)(n.info.files).map((i) => i.url).join(", ")}`);
    const r = (i) => {
      if (!(i instanceof Ce.CancellationError))
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
    this.emit(Xt.UPDATE_DOWNLOADED, t);
  }
  async loadUpdateConfig() {
    return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, lv.load)(await (0, qe.readFile)(this._appUpdateConfigPath, "utf-8"));
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
    const t = je.join(this.app.userDataPath, ".updaterId");
    try {
      const r = await (0, qe.readFile)(t, "utf-8");
      if (Ce.UUID.check(r))
        return r;
      this._logger.warn(`Staging user id file exists, but content was invalid: ${r}`);
    } catch (r) {
      r.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${r}`);
    }
    const n = Ce.UUID.v5((0, ov.randomBytes)(4096), Ce.UUID.OID);
    this._logger.info(`Generated new staging user ID: ${n}`);
    try {
      await (0, qe.outputFile)(t, n);
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
      const i = je.join(this.app.baseCachePath, n || this.app.name);
      r.debug != null && r.debug(`updater cache dir: ${i}`), t = new ml.DownloadedUpdateHelper(i), this.downloadedUpdateHelper = t;
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
    this.listenerCount(Xt.DOWNLOAD_PROGRESS) > 0 && (r.onProgress = (R) => this.emit(Xt.DOWNLOAD_PROGRESS, R));
    const i = t.downloadUpdateOptions.updateInfoAndProvider.info, o = i.version, s = n.packageInfo;
    function a() {
      const R = decodeURIComponent(t.fileInfo.url.pathname);
      return R.toLowerCase().endsWith(`.${t.fileExtension.toLowerCase()}`) ? je.basename(R) : je.basename(t.fileInfo.info.url);
    }
    const c = await this.getOrCreateDownloadHelper(), m = c.cacheDirForPendingUpdate;
    await (0, qe.mkdir)(m, { recursive: !0 });
    const l = a();
    let f = je.join(m, l);
    const h = s == null ? null : je.join(m, `package-${o}${je.extname(s.path) || ".7z"}`), g = async (R) => {
      await c.setDownloadedFile(f, h, i, n, l, R), await t.done({
        ...i,
        downloadedFile: f
      });
      const N = je.join(m, "current.blockmap");
      return await (0, qe.pathExists)(N) && await (0, qe.copyFile)(N, je.join(c.cacheDir, "current.blockmap")), h == null ? [f] : [f, h];
    }, w = this._logger, y = await c.validateDownloadedPath(f, i, n, w);
    if (y != null)
      return f = y, await g(!1);
    const A = async () => (await c.clear().catch(() => {
    }), await (0, qe.unlink)(f).catch(() => {
    })), S = await (0, ml.createTempUpdateFile)(`temp-${l}`, m, w);
    try {
      await t.task(S, r, h, A), await (0, Ce.retry)(() => (0, qe.rename)(S, f), {
        retries: 60,
        interval: 500,
        shouldRetry: (R) => R instanceof Error && /^EBUSY:/.test(R.message) ? !0 : (w.warn(`Cannot rename temp file to final file: ${R.message || R.stack}`), !1)
      });
    } catch (R) {
      throw await A(), R instanceof Ce.CancellationError && (w.info("cancelled"), this.emit("update-cancelled", i)), R;
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
          return JSON.parse((0, lo.gunzipSync)(y).toString());
        } catch (A) {
          throw new Error(`Cannot parse blockmap "${w.href}", error: ${A}`);
        }
      }, m = {
        newUrl: t.url,
        oldFile: je.join(this.downloadedUpdateHelper.cacheDir, o),
        logger: this._logger,
        newFile: r,
        isUseMultipleRangeRequest: s.isUseMultipleRangeRequest,
        requestHeaders: n.requestHeaders,
        cancellationToken: n.cancellationToken
      };
      this.listenerCount(Xt.DOWNLOAD_PROGRESS) > 0 && (m.onProgress = (w) => this.emit(Xt.DOWNLOAD_PROGRESS, w));
      const l = async (w, y) => {
        const A = je.join(y, "current.blockmap");
        await (0, qe.outputFile)(A, (0, lo.gzipSync)(JSON.stringify(w)));
      }, f = async (w) => {
        const y = je.join(w, "current.blockmap");
        try {
          if (await (0, qe.pathExists)(y))
            return JSON.parse((0, lo.gunzipSync)(await (0, qe.readFile)(y)).toString());
        } catch (A) {
          this._logger.warn(`Cannot parse blockmap "${y}", error: ${A}`);
        }
        return null;
      }, h = await c(a[1]);
      await l(h, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
      let g = await f(this.downloadedUpdateHelper.cacheDir);
      return g == null && (g = await c(a[0])), await new fv.GenericDifferentialDownloader(t.info, this.httpExecutor, m).download(g, h), !1;
    } catch (s) {
      if (this._logger.error(`Cannot download differentially, fallback to full download: ${s.stack || s}`), this._testOnlyOptions != null)
        throw s;
      return !0;
    }
  }
}
_t.AppUpdater = cs;
function dv(e) {
  const t = (0, Ft.prerelease)(e);
  return t != null && t.length > 0;
}
class Qu {
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
_t.NoOpLogger = Qu;
Object.defineProperty(Gt, "__esModule", { value: !0 });
Gt.BaseUpdater = void 0;
const El = Qr, co = te, hv = _t;
class pv extends hv.AppUpdater {
  constructor(t, n) {
    super(t, n), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
  }
  quitAndInstall(t = !1, n = !1) {
    this._logger.info("Install on explicit quitAndInstall"), this.install(t, t ? n : this.autoRunAppAfterInstall) ? setImmediate(() => {
      Mt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
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
    return t.split(co.delimiter).filter((n) => co.isAbsolute(n)).join(co.delimiter);
  }
  spawnSyncLog(t, n = [], r = {}) {
    var i;
    this._logger.info(`Executing: ${t} with args: ${n}`);
    const o = { ...process.env, ...r }, s = (0, El.spawnSync)(t, n, {
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
        const a = { stdio: i, env: r, detached: !0 }, c = (0, El.spawn)(t, n, a);
        c.on("error", (m) => {
          s(m);
        }), c.unref(), c.pid !== void 0 && o(!0);
      } catch (a) {
        s(a);
      }
    });
  }
}
Gt.BaseUpdater = pv;
var Gn = {}, ar = {};
Object.defineProperty(ar, "__esModule", { value: !0 });
ar.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
const Kt = Ct, mv = sr, gv = Ll;
class Ev extends mv.DifferentialDownloader {
  async download() {
    const t = this.blockAwareFileInfo, n = t.size, r = n - (t.blockMapSize + 4);
    this.fileMetadataBuffer = await this.readRemoteBytes(r, n - 1);
    const i = Zu(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
    await this.doDownload(await yv(this.options.oldFile), i);
  }
}
ar.FileWithEmbeddedBlockMapDifferentialDownloader = Ev;
function Zu(e) {
  return JSON.parse((0, gv.inflateRawSync)(e).toString());
}
async function yv(e) {
  const t = await (0, Kt.open)(e, "r");
  try {
    const n = (await (0, Kt.fstat)(t)).size, r = Buffer.allocUnsafe(4);
    await (0, Kt.read)(t, r, 0, r.length, n - r.length);
    const i = Buffer.allocUnsafe(r.readUInt32BE(0));
    return await (0, Kt.read)(t, i, 0, i.length, n - r.length - i.length), await (0, Kt.close)(t), Zu(i);
  } catch (n) {
    throw await (0, Kt.close)(t), n;
  }
}
Object.defineProperty(Gn, "__esModule", { value: !0 });
Gn.AppImageUpdater = void 0;
const uo = de, yl = Qr, wv = Ct, _v = Tt, Jt = te, vv = Gt, Av = ar, Sv = ce, wl = $t;
class Tv extends vv.BaseUpdater {
  constructor(t, n) {
    super(t, n);
  }
  isUpdaterActive() {
    return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
  }
  /*** @private */
  doDownloadUpdate(t) {
    const n = t.updateInfoAndProvider.provider, r = (0, Sv.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "AppImage",
      fileInfo: r,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        const s = process.env.APPIMAGE;
        if (s == null)
          throw (0, uo.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
        (t.disableDifferentialDownload || await this.downloadDifferential(r, s, i, n, t)) && await this.httpExecutor.download(r.url, i, o), await (0, wv.chmod)(i, 493);
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
      return this.listenerCount(wl.DOWNLOAD_PROGRESS) > 0 && (s.onProgress = (a) => this.emit(wl.DOWNLOAD_PROGRESS, a)), await new Av.FileWithEmbeddedBlockMapDifferentialDownloader(t.info, this.httpExecutor, s).download(), !1;
    } catch (s) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${s.stack || s}`), process.platform === "linux";
    }
  }
  doInstall(t) {
    const n = process.env.APPIMAGE;
    if (n == null)
      throw (0, uo.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    if (!Jt.isAbsolute(n) || n.includes("\0"))
      throw (0, uo.newError)(`APPIMAGE env is not a valid absolute path: "${n}"`, "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    (0, _v.unlinkSync)(n);
    let r;
    const i = Jt.basename(n), o = this.installerPath;
    if (o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    Jt.basename(o) === i || !/\d+\.\d+\.\d+/.test(i) ? r = n : r = Jt.join(Jt.dirname(n), Jt.basename(o)), (0, yl.execFileSync)("mv", ["-f", o, r]), r !== n && this.emit("appimage-filename-updated", r);
    const s = {
      ...process.env,
      APPIMAGE_SILENT_INSTALL: "true"
    };
    return t.isForceRunAfter ? this.spawnLog(r, [], s) : (s.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, yl.execFileSync)(r, [], { env: s })), !0;
  }
}
Gn.AppImageUpdater = Tv;
var qn = {}, yn = {};
Object.defineProperty(yn, "__esModule", { value: !0 });
yn.LinuxUpdater = void 0;
const bv = Gt, Cv = /^[a-zA-Z0-9_-]+$/;
class $v extends bv.BaseUpdater {
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
    i && (Cv.test(i) ? r = [i] : this._logger.warn(`ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER "${i}" contains unsafe characters. Ignoring override.`));
    for (const a of r)
      if (this.hasCommand(a))
        return a;
    const o = i ? `ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER override "${i}", ` : "", s = t[0];
    return this._logger.warn(`No package manager found in the list: ${o}${t.join(", ")}. Utilizing default: ${s}`), s;
  }
}
yn.LinuxUpdater = $v;
Object.defineProperty(qn, "__esModule", { value: !0 });
qn.DebUpdater = void 0;
const Rv = ce, _l = $t, Ov = yn;
class us extends Ov.LinuxUpdater {
  constructor(t, n) {
    super(t, n);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const n = t.updateInfoAndProvider.provider, r = (0, Rv.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
    return this.executeDownload({
      fileExtension: "deb",
      fileInfo: r,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(_l.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(_l.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(r.url, i, o);
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
      us.installWithCommandRunner(i, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
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
qn.DebUpdater = us;
var Vn = {};
Object.defineProperty(Vn, "__esModule", { value: !0 });
Vn.PacmanUpdater = void 0;
const vl = $t, Pv = ce, Iv = yn;
class fs extends Iv.LinuxUpdater {
  constructor(t, n) {
    super(t, n);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const n = t.updateInfoAndProvider.provider, r = (0, Pv.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
    return this.executeDownload({
      fileExtension: "pacman",
      fileInfo: r,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(vl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(vl.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(r.url, i, o);
      }
    });
  }
  doInstall(t) {
    const n = this.installerPath;
    if (n == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    try {
      fs.installWithCommandRunner(n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
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
Vn.PacmanUpdater = fs;
var Wn = {};
Object.defineProperty(Wn, "__esModule", { value: !0 });
Wn.RpmUpdater = void 0;
const Al = $t, Nv = ce, Dv = yn;
class ds extends Dv.LinuxUpdater {
  constructor(t, n) {
    super(t, n);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const n = t.updateInfoAndProvider.provider, r = (0, Nv.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "rpm",
      fileInfo: r,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(Al.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(Al.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(r.url, i, o);
      }
    });
  }
  doInstall(t) {
    const n = this.installerPath;
    if (n == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const r = ["zypper", "dnf", "yum", "rpm"], i = this.detectPackageManager(r);
    try {
      ds.installWithCommandRunner(i, n, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
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
Wn.RpmUpdater = ds;
var Yn = {};
Object.defineProperty(Yn, "__esModule", { value: !0 });
Yn.MacUpdater = void 0;
const Sl = de, fo = Ct, Fv = Tt, Tl = te, xv = hd, Lv = _t, Uv = ce, bl = Qr, Cl = Kn;
class hs extends Lv.AppUpdater {
  constructor(t, n) {
    super(t, n), this.nativeUpdater = Mt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (r) => {
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
      this.debug("Checking for macOS Rosetta environment"), o = (0, bl.execFileSync)("sysctl", [i], { encoding: "utf8" }).includes(`${i}: 1`), r.info(`Checked for macOS Rosetta environment (isRosetta=${o})`);
    } catch (l) {
      r.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${l}`);
    }
    let s = !1;
    try {
      this.debug("Checking for arm64 in uname");
      const f = (0, bl.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
      r.info(`Checked 'uname -a': arm64=${f}`), s = s || f;
    } catch (l) {
      r.warn(`uname shell command to check for arm64 failed: ${l}`);
    }
    s = s || process.arch === "arm64" || o, n = hs.filterFilesForArch(n, s);
    const a = (0, Uv.findFile)(n, "zip", ["pkg", "dmg"]);
    if (a == null)
      throw (0, Sl.newError)(`ZIP file not provided: ${(0, Sl.safeStringifyJson)(n)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
    const c = t.updateInfoAndProvider.provider, m = "update.zip";
    return this.executeDownload({
      fileExtension: "zip",
      fileInfo: a,
      downloadUpdateOptions: t,
      task: async (l, f) => {
        const h = Tl.join(this.downloadedUpdateHelper.cacheDir, m), g = () => (0, fo.pathExistsSync)(h) ? !t.disableDifferentialDownload : (r.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
        let w = !0;
        g() && (w = await this.differentialDownloadInstaller(a, t, l, c, m)), w && await this.httpExecutor.download(a.url, l, f);
      },
      done: async (l) => {
        if (!t.disableDifferentialDownload)
          try {
            const f = Tl.join(this.downloadedUpdateHelper.cacheDir, m);
            await (0, fo.copyFile)(l.downloadedFile, f);
          } catch (f) {
            this._logger.warn(`Unable to copy file for caching for future differential downloads: ${f.message}`);
          }
        return this.updateDownloaded(a, l);
      }
    });
  }
  async updateDownloaded(t, n) {
    var r;
    const i = n.downloadedFile, o = (r = t.info.size) !== null && r !== void 0 ? r : (await (0, fo.stat)(i)).size, s = this._logger, a = `fileToProxy=${t.url.href}`;
    this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${a})`), this.server = (0, xv.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${a})`), this.server.on("close", () => {
      s.info(`Proxy server for native Squirrel.Mac is closed (${a})`);
    });
    const c = (m) => {
      const l = m.address();
      return typeof l == "string" ? l : `http://127.0.0.1:${l == null ? void 0 : l.port}`;
    };
    return await new Promise((m, l) => {
      const f = (0, Cl.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), h = Buffer.from(`autoupdater:${f}`, "ascii"), g = `/${(0, Cl.randomBytes)(64).toString("hex")}.zip`;
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
        let S = !1;
        y.on("finish", () => {
          S || (this.nativeUpdater.removeListener("error", l), m([]));
        });
        const R = (0, Fv.createReadStream)(i);
        R.on("error", (N) => {
          try {
            y.end();
          } catch (x) {
            s.warn(`cannot end response: ${x}`);
          }
          S = !0, this.nativeUpdater.removeListener("error", l), l(new Error(`Cannot pipe "${i}": ${N}`));
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
Yn.MacUpdater = hs;
var zn = {}, ps = {};
Object.defineProperty(ps, "__esModule", { value: !0 });
ps.verifySignature = Mv;
const $l = de, ef = Qr, kv = Zr, Rl = te;
function tf(e, t) {
  return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", e], {
    shell: !0,
    timeout: t
  }];
}
function Mv(e, t, n) {
  return new Promise((r, i) => {
    const o = t.replace(/'/g, "''");
    n.info(`Verifying signature ${o}`), (0, ef.execFile)(...tf(`"Get-AuthenticodeSignature -LiteralPath '${o}' | ConvertTo-Json -Compress"`, 20 * 1e3), (s, a, c) => {
      var m;
      try {
        if (s != null || c) {
          ho(n, s, c, i), r(null);
          return;
        }
        const l = Bv(a);
        if (l.Status === 0) {
          try {
            const w = Rl.normalize(l.Path), y = Rl.normalize(t);
            if (n.info(`LiteralPath: ${w}. Update Path: ${y}`), w !== y) {
              ho(n, new Error(`LiteralPath of ${w} is different than ${y}`), c, i), r(null);
              return;
            }
          } catch (w) {
            n.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(m = w.message) !== null && m !== void 0 ? m : w.stack}`);
          }
          const h = (0, $l.parseDn)(l.SignerCertificate.Subject);
          let g = !1;
          for (const w of e) {
            const y = (0, $l.parseDn)(w);
            if (y.size ? g = Array.from(y.keys()).every((S) => y.get(S) === h.get(S)) : w === h.get("CN") && (n.warn(`Signature validated using only CN ${w}. Please add your full Distinguished Name (DN) to publisherNames configuration`), g = !0), g) {
              r(null);
              return;
            }
          }
        }
        const f = `publisherNames: ${e.join(" | ")}, raw info: ` + JSON.stringify(l, (h, g) => h === "RawData" ? void 0 : g, 2);
        n.warn(`Sign verification failed, installer signed with incorrect certificate: ${f}`), r(f);
      } catch (l) {
        ho(n, l, null, i), r(null);
        return;
      }
    });
  });
}
function Bv(e) {
  const t = JSON.parse(e);
  delete t.PrivateKey, delete t.IsOSBinary, delete t.SignatureType;
  const n = t.SignerCertificate;
  return n != null && (delete n.Archived, delete n.Extensions, delete n.Handle, delete n.HasPrivateKey, delete n.SubjectName), t;
}
function ho(e, t, n, r) {
  if (jv()) {
    e.warn(`Cannot execute Get-AuthenticodeSignature: ${t || n}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  try {
    (0, ef.execFileSync)(...tf("ConvertTo-Json test", 10 * 1e3));
  } catch (i) {
    e.warn(`Cannot execute ConvertTo-Json: ${i.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  t != null && r(t), n && r(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${n}. Failing signature validation due to unknown stderr.`));
}
function jv() {
  const e = kv.release();
  return e.startsWith("6.") && !e.startsWith("6.3");
}
Object.defineProperty(zn, "__esModule", { value: !0 });
zn.NsisUpdater = void 0;
const xr = de, Ol = te, Hv = Gt, Gv = ar, Pl = $t, qv = ce, Vv = Ct, Wv = ps, Il = bt;
class Yv extends Hv.BaseUpdater {
  constructor(t, n) {
    super(t, n), this._verifyUpdateCodeSignature = (r, i) => (0, Wv.verifySignature)(r, i, this._logger);
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
    const n = t.updateInfoAndProvider.provider, r = (0, qv.findFile)(n.resolveFiles(t.updateInfoAndProvider.info), "exe");
    return this.executeDownload({
      fileExtension: "exe",
      downloadUpdateOptions: t,
      fileInfo: r,
      task: async (i, o, s, a) => {
        const c = r.packageInfo, m = c != null && s != null;
        if (m && t.disableWebInstaller)
          throw (0, xr.newError)(`Unable to download new version ${t.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
        !m && !t.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (m || t.disableDifferentialDownload || await this.differentialDownloadInstaller(r, t, i, n, xr.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(r.url, i, o);
        const l = await this.verifySignature(i);
        if (l != null)
          throw await a(), (0, xr.newError)(`New version ${t.updateInfoAndProvider.info.version} is not signed by the application owner: ${l}`, "ERR_UPDATER_INVALID_SIGNATURE");
        if (m && await this.differentialDownloadWebPackage(t, c, s, n))
          try {
            await this.httpExecutor.download(new Il.URL(c.path), s, {
              headers: t.requestHeaders,
              cancellationToken: t.cancellationToken,
              sha512: c.sha512
            });
          } catch (f) {
            try {
              await (0, Vv.unlink)(s);
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
      this.spawnLog(Ol.join(process.resourcesPath, "elevate.exe"), [n].concat(r)).catch((s) => this.dispatchError(s));
    };
    return t.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), o(), !0) : (this.spawnLog(n, r).catch((s) => {
      const a = s.code;
      this._logger.info(`Cannot run installer: error code: ${a}, error message: "${s.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), a === "UNKNOWN" || a === "EACCES" ? o() : a === "ENOENT" ? Mt.shell.openPath(n).catch((c) => this.dispatchError(c)) : this.dispatchError(s);
    }), !0);
  }
  async differentialDownloadWebPackage(t, n, r, i) {
    if (n.blockMapSize == null)
      return !0;
    try {
      const o = {
        newUrl: new Il.URL(n.path),
        oldFile: Ol.join(this.downloadedUpdateHelper.cacheDir, xr.CURRENT_APP_PACKAGE_FILE_NAME),
        logger: this._logger,
        newFile: r,
        requestHeaders: this.requestHeaders,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        cancellationToken: t.cancellationToken
      };
      this.listenerCount(Pl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(Pl.DOWNLOAD_PROGRESS, s)), await new Gv.FileWithEmbeddedBlockMapDifferentialDownloader(n, this.httpExecutor, o).download();
    } catch (o) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${o.stack || o}`), process.platform === "win32";
    }
    return !1;
  }
}
zn.NsisUpdater = Yv;
(function(e) {
  var t = $e && $e.__createBinding || (Object.create ? function(A, S, R, N) {
    N === void 0 && (N = R);
    var x = Object.getOwnPropertyDescriptor(S, R);
    (!x || ("get" in x ? !S.__esModule : x.writable || x.configurable)) && (x = { enumerable: !0, get: function() {
      return S[R];
    } }), Object.defineProperty(A, N, x);
  } : function(A, S, R, N) {
    N === void 0 && (N = R), A[N] = S[R];
  }), n = $e && $e.__exportStar || function(A, S) {
    for (var R in A) R !== "default" && !Object.prototype.hasOwnProperty.call(S, R) && t(S, A, R);
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
  const r = Ct, i = te;
  var o = Gt;
  Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
    return o.BaseUpdater;
  } });
  var s = _t;
  Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
    return s.AppUpdater;
  } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
    return s.NoOpLogger;
  } });
  var a = ce;
  Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
    return a.Provider;
  } });
  var c = Gn;
  Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
    return c.AppImageUpdater;
  } });
  var m = qn;
  Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
    return m.DebUpdater;
  } });
  var l = Vn;
  Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
    return l.PacmanUpdater;
  } });
  var f = Wn;
  Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
    return f.RpmUpdater;
  } });
  var h = Yn;
  Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
    return h.MacUpdater;
  } });
  var g = zn;
  Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
    return g.NsisUpdater;
  } }), n($t, e);
  let w;
  function y() {
    if (process.platform === "win32")
      w = new zn.NsisUpdater();
    else if (process.platform === "darwin")
      w = new Yn.MacUpdater();
    else {
      w = new Gn.AppImageUpdater();
      try {
        const A = i.join(process.resourcesPath, "package-type");
        if (!(0, r.existsSync)(A))
          return w;
        switch ((0, r.readFileSync)(A).toString().trim()) {
          case "deb":
            w = new qn.DebUpdater();
            break;
          case "rpm":
            w = new Wn.RpmUpdater();
            break;
          case "pacman":
            w = new Vn.PacmanUpdater();
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
})(Re);
const Po = Fe.dirname(pd(import.meta.url));
process.env.APP_ROOT = Fe.join(Po, "..");
const Br = process.env.VITE_DEV_SERVER_URL, mA = Fe.join(process.env.APP_ROOT, "dist-electron"), nf = Fe.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Br ? Fe.join(process.env.APP_ROOT, "public") : nf;
let z = null, ln = null;
Re.autoUpdater.autoDownload = !0;
Re.autoUpdater.autoInstallOnAppQuit = !0;
Re.autoUpdater.logger = console;
function rf() {
  return Fe.join(nt.getPath("userData"), "updater-config.json");
}
function of() {
  try {
    const e = rf();
    if (le.existsSync(e)) {
      const t = JSON.parse(le.readFileSync(e, "utf-8"));
      return (t == null ? void 0 : t.token) || null;
    }
  } catch (e) {
    console.warn("[AutoUpdater] Failed reading updater config:", e);
  }
  return null;
}
function zv(e) {
  try {
    const t = rf();
    le.writeFileSync(t, JSON.stringify({ token: e.trim() }), "utf-8");
  } catch (t) {
    console.error("[AutoUpdater] Failed writing updater config:", t);
  }
}
function ms(e) {
  const t = e ?? process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? of();
  t && t.trim() ? (console.log("[AutoUpdater] Configuring updater with GitHub PAT token (Private Repo support)"), Re.autoUpdater.setFeedURL({
    provider: "github",
    owner: "lumisolutionz-code",
    repo: "Hotline-POS-",
    private: !0,
    token: t.trim()
  })) : (console.log("[AutoUpdater] Configuring updater in public repository mode"), Re.autoUpdater.setFeedURL({
    provider: "github",
    owner: "lumisolutionz-code",
    repo: "Hotline-POS-"
  }));
}
function sf() {
  z = new cn({
    icon: Fe.join(process.env.VITE_PUBLIC, "icon.ico"),
    backgroundColor: "#f0f4f9",
    webPreferences: {
      preload: Fe.join(Po, "preload.mjs")
    }
  }), z.maximize(), z.webContents.setWindowOpenHandler(({ url: e }) => e.startsWith("http:") || e.startsWith("https:") ? (Io.openExternal(e), { action: "deny" }) : {
    action: "allow",
    overrideBrowserWindowOptions: {
      webPreferences: {
        preload: Fe.join(Po, "preload.mjs"),
        contextIsolation: !0,
        nodeIntegration: !1
      }
    }
  }), z.webContents.on("did-create-window", (e) => {
    ln = e, e.on("closed", () => {
      ln === e && (ln = null);
    });
  }), z.webContents.on("did-finish-load", () => {
    z == null || z.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString()), Br || setTimeout(() => {
      Re.autoUpdater.checkForUpdatesAndNotify().catch((e) => {
        console.error("[AutoUpdater] Initial check error:", (e == null ? void 0 : e.message) || e);
      });
    }, 3500);
  }), z.webContents.on("did-fail-load", (e, t, n, r) => {
    console.error(`[Electron] Failed to load ${r}: ${n} (${t})`);
  }), Br ? z.loadURL(Br) : z.loadFile(Fe.join(nf, "index.html"));
}
nt.on("window-all-closed", () => {
  process.platform !== "darwin" && (nt.quit(), z = null);
});
nt.on("activate", () => {
  cn.getAllWindows().length === 0 && sf();
});
nt.whenReady().then(() => {
  ms(), sf();
});
Re.autoUpdater.on("checking-for-update", () => {
  console.log("[AutoUpdater] Checking for update..."), z == null || z.webContents.send("update-checking");
});
Re.autoUpdater.on("update-available", (e) => {
  console.log("[AutoUpdater] Update available:", e == null ? void 0 : e.version), z == null || z.webContents.send("update-available", e);
});
Re.autoUpdater.on("update-not-available", (e) => {
  console.log("[AutoUpdater] Update not available. Already on latest version:", e == null ? void 0 : e.version), z == null || z.webContents.send("update-not-available", e);
});
Re.autoUpdater.on("error", (e) => {
  const t = (e == null ? void 0 : e.message) || String(e);
  console.error("[AutoUpdater Error]:", t);
  const n = t.includes("404");
  z == null || z.webContents.send("update-error", {
    message: t,
    is404: n,
    hint: n ? "GitHub returned 404 Not Found. If the repository is Private, make it Public on GitHub or provide a token in Settings so autoUpdater can download the release." : t
  });
});
Re.autoUpdater.on("download-progress", (e) => {
  z == null || z.webContents.send("update-progress", e);
});
Re.autoUpdater.on("update-downloaded", (e) => {
  console.log("[AutoUpdater] Update downloaded successfully:", e == null ? void 0 : e.version), z == null || z.webContents.send("update-downloaded", e);
});
Te.handle("check_for_updates", async () => {
  var e, t;
  try {
    ms();
    const n = await Re.autoUpdater.checkForUpdates();
    return {
      success: !0,
      currentVersion: nt.getVersion(),
      updateVersion: (e = n == null ? void 0 : n.updateInfo) == null ? void 0 : e.version,
      hasUpdate: !!((t = n == null ? void 0 : n.updateInfo) != null && t.version && n.updateInfo.version !== nt.getVersion())
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
Te.handle("get_update_token", () => of() || "");
Te.handle("save_update_token", (e, t) => (zv(t || ""), ms(t || null), { success: !0 }));
Te.handle("get_app_version", () => nt.getVersion());
Te.on("restart_app", () => {
  Re.autoUpdater.quitAndInstall();
});
Te.handle("open_external", async (e, t) => t && (t.startsWith("http://") || t.startsWith("https://")) ? (await Io.openExternal(t), !0) : !1);
const af = async (e, t) => {
  let n = ln && !ln.isDestroyed() ? ln : cn.fromWebContents(e.sender);
  return (!n || n.isDestroyed()) && (n = cn.getFocusedWindow() || z), !n || n.isDestroyed() ? !1 : (n.focus(), new Promise((r) => {
    n.webContents.print(
      {
        silent: (t == null ? void 0 : t.silent) ?? !1,
        printBackground: !0
      },
      (i, o) => {
        i || console.warn("[Electron Print Error]:", o), r(i);
      }
    );
  }));
};
Te.handle("print_document", af);
Te.handle("print_active_report", af);
Te.handle("print_html_direct", async (e, { html: t, title: n }) => {
  const r = new cn({
    show: !1,
    webPreferences: {
      nodeIntegration: !1
    }
  });
  return n && r.setTitle(n), await r.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(t)}`), new Promise((i) => {
    r.webContents.print(
      {
        silent: !1,
        printBackground: !0
      },
      (o, s) => {
        r.close(), o || console.warn("[Direct Print Error]:", s), i(o);
      }
    );
  });
});
Te.handle("download_pdf", async (e, { html: t, defaultName: n }) => {
  try {
    const r = new cn({
      show: !1,
      webPreferences: {
        nodeIntegration: !1
      }
    });
    await r.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(t)}`);
    const i = await r.webContents.printToPDF({
      pageSize: "A4",
      printBackground: !0,
      margins: {
        top: 0.35,
        bottom: 0.35,
        left: 0.4,
        right: 0.4
      }
    });
    r.close();
    const { filePath: o, canceled: s } = await Nl.showSaveDialog({
      title: "Download Business Report as PDF",
      defaultPath: n || `Business-Report-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf`,
      filters: [{ name: "PDF Document (*.pdf)", extensions: ["pdf"] }]
    });
    return !s && o ? (le.writeFileSync(o, i), { success: !0, filePath: o }) : { success: !1, canceled: !0 };
  } catch (r) {
    return console.error("[Download PDF Error]:", r), { success: !1, error: (r == null ? void 0 : r.message) || String(r) };
  }
});
function lf() {
  return Fe.join(nt.getPath("userData"), "backup-config.json");
}
function Xv() {
  const e = Fe.join(nt.getPath("documents"), "Hotline_POS_Backups");
  try {
    le.existsSync(e) || le.mkdirSync(e, { recursive: !0 });
  } catch (t) {
    console.error("[Backup] Failed to ensure default backup directory:", t);
  }
  return e;
}
function lr() {
  try {
    const e = lf();
    if (le.existsSync(e)) {
      const t = JSON.parse(le.readFileSync(e, "utf-8"));
      if (t != null && t.destinationPath && le.existsSync(t.destinationPath))
        return t.destinationPath;
    }
  } catch (e) {
    console.warn("[Backup] Failed reading backup config:", e);
  }
  return Xv();
}
Te.handle("get_backup_config", async () => ({ destinationPath: lr() }));
Te.handle("save_backup_config", async (e, { destinationPath: t }) => {
  try {
    const n = lf();
    return le.existsSync(t) || le.mkdirSync(t, { recursive: !0 }), le.writeFileSync(n, JSON.stringify({ destinationPath: t.trim() }), "utf-8"), { success: !0, destinationPath: t.trim() };
  } catch (n) {
    return console.error("[Backup] Failed saving backup config:", n), { success: !1, error: (n == null ? void 0 : n.message) || String(n) };
  }
});
Te.handle("select_backup_directory", async () => {
  const e = lr(), { filePaths: t, canceled: n } = await Nl.showOpenDialog({
    title: "Select Database Backup Storage Directory",
    defaultPath: e,
    properties: ["openDirectory", "createDirectory"]
  });
  return !n && t && t.length > 0 ? t[0] : null;
});
Te.handle("save_backup_archive", async (e, { buffer: t, filename: n, targetPath: r }) => {
  try {
    const i = r || lr();
    le.existsSync(i) || le.mkdirSync(i, { recursive: !0 });
    const o = n || `hotline_backup_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.zip`, s = Fe.join(i, o);
    let a;
    Buffer.isBuffer(t) ? a = t : typeof t == "string" ? a = Buffer.from(t, "base64") : a = Buffer.from(t), le.writeFileSync(s, a);
    const c = le.statSync(s);
    return {
      success: !0,
      filePath: s,
      size: c.size,
      filename: o,
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (i) {
    return console.error("[Backup] Error saving backup archive to disk:", i), { success: !1, error: (i == null ? void 0 : i.message) || String(i) };
  }
});
Te.handle("list_backup_files", async (e, t) => {
  try {
    const n = t || lr();
    return le.existsSync(n) ? { success: !0, files: le.readdirSync(n).filter((o) => o.toLowerCase().endsWith(".zip")).map((o) => {
      try {
        const s = Fe.join(n, o), a = le.statSync(s);
        return {
          filename: o,
          fullPath: s,
          size: a.size,
          modifiedAt: a.mtime.toISOString()
        };
      } catch {
        return null;
      }
    }).filter(Boolean).sort((o, s) => new Date(s.modifiedAt).getTime() - new Date(o.modifiedAt).getTime()), directory: n } : { success: !0, files: [], directory: n };
  } catch (n) {
    return console.error("[Backup] Error listing backup files:", n), { success: !1, error: (n == null ? void 0 : n.message) || String(n), files: [] };
  }
});
Te.handle("open_backup_directory", async (e, t) => {
  const n = t || lr();
  return le.existsSync(n) ? (Io.openPath(n), { success: !0 }) : { success: !1, error: "Directory does not exist" };
});
export {
  mA as MAIN_DIST,
  nf as RENDERER_DIST,
  Br as VITE_DEV_SERVER_URL,
  ms as configureAutoUpdater
};

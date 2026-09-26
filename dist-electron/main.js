import Ft, { app as $n, BrowserWindow as wl, ipcMain as zf } from "electron";
import vt from "fs";
import Xf from "constants";
import jr from "stream";
import So from "util";
import _l from "assert";
import ee from "path";
import Wn from "child_process";
import Al from "events";
import Hr from "crypto";
import Tl from "tty";
import Yn from "os";
import wt from "url";
import Kf from "string_decoder";
import Sl from "zlib";
import Jf from "http";
import { fileURLToPath as Qf } from "node:url";
import dt from "node:path";
var Se = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, Gr = {}, xt = {}, be = {};
be.fromCallback = function(e) {
  return Object.defineProperty(function(...t) {
    if (typeof t[t.length - 1] == "function") e.apply(this, t);
    else
      return new Promise((r, n) => {
        t.push((i, o) => i != null ? n(i) : r(o)), e.apply(this, t);
      });
  }, "name", { value: e.name });
};
be.fromPromise = function(e) {
  return Object.defineProperty(function(...t) {
    const r = t[t.length - 1];
    if (typeof r != "function") return e.apply(this, t);
    t.pop(), e.apply(this, t).then((n) => r(null, n), r);
  }, "name", { value: e.name });
};
var at = Xf, Zf = process.cwd, In = null, ed = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return In || (In = Zf.call(process)), In;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var Ca = process.chdir;
  process.chdir = function(e) {
    In = null, Ca.call(process, e);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, Ca);
}
var td = rd;
function rd(e) {
  at.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && t(e), e.lutimes || r(e), e.chown = o(e.chown), e.fchown = o(e.fchown), e.lchown = o(e.lchown), e.chmod = n(e.chmod), e.fchmod = n(e.fchmod), e.lchmod = n(e.lchmod), e.chownSync = a(e.chownSync), e.fchownSync = a(e.fchownSync), e.lchownSync = a(e.lchownSync), e.chmodSync = i(e.chmodSync), e.fchmodSync = i(e.fchmodSync), e.lchmodSync = i(e.lchmodSync), e.stat = s(e.stat), e.fstat = s(e.fstat), e.lstat = s(e.lstat), e.statSync = l(e.statSync), e.fstatSync = l(e.fstatSync), e.lstatSync = l(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(c, f, g) {
    g && process.nextTick(g);
  }, e.lchmodSync = function() {
  }), e.chown && !e.lchown && (e.lchown = function(c, f, g, m) {
    m && process.nextTick(m);
  }, e.lchownSync = function() {
  }), ed === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(c) {
    function f(g, m, v) {
      var y = Date.now(), A = 0;
      c(g, m, function T(S) {
        if (S && (S.code === "EACCES" || S.code === "EPERM" || S.code === "EBUSY") && Date.now() - y < 6e4) {
          setTimeout(function() {
            e.stat(m, function(D, L) {
              D && D.code === "ENOENT" ? c(g, m, T) : v(S);
            });
          }, A), A < 100 && (A += 10);
          return;
        }
        v && v(S);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(f, c), f;
  }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(c) {
    function f(g, m, v, y, A, T) {
      var S;
      if (T && typeof T == "function") {
        var D = 0;
        S = function(L, Z, oe) {
          if (L && L.code === "EAGAIN" && D < 10)
            return D++, c.call(e, g, m, v, y, A, S);
          T.apply(this, arguments);
        };
      }
      return c.call(e, g, m, v, y, A, S);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(f, c), f;
  }(e.read), e.readSync = typeof e.readSync != "function" ? e.readSync : /* @__PURE__ */ function(c) {
    return function(f, g, m, v, y) {
      for (var A = 0; ; )
        try {
          return c.call(e, f, g, m, v, y);
        } catch (T) {
          if (T.code === "EAGAIN" && A < 10) {
            A++;
            continue;
          }
          throw T;
        }
    };
  }(e.readSync);
  function t(c) {
    c.lchmod = function(f, g, m) {
      c.open(
        f,
        at.O_WRONLY | at.O_SYMLINK,
        g,
        function(v, y) {
          if (v) {
            m && m(v);
            return;
          }
          c.fchmod(y, g, function(A) {
            c.close(y, function(T) {
              m && m(A || T);
            });
          });
        }
      );
    }, c.lchmodSync = function(f, g) {
      var m = c.openSync(f, at.O_WRONLY | at.O_SYMLINK, g), v = !0, y;
      try {
        y = c.fchmodSync(m, g), v = !1;
      } finally {
        if (v)
          try {
            c.closeSync(m);
          } catch {
          }
        else
          c.closeSync(m);
      }
      return y;
    };
  }
  function r(c) {
    at.hasOwnProperty("O_SYMLINK") && c.futimes ? (c.lutimes = function(f, g, m, v) {
      c.open(f, at.O_SYMLINK, function(y, A) {
        if (y) {
          v && v(y);
          return;
        }
        c.futimes(A, g, m, function(T) {
          c.close(A, function(S) {
            v && v(T || S);
          });
        });
      });
    }, c.lutimesSync = function(f, g, m) {
      var v = c.openSync(f, at.O_SYMLINK), y, A = !0;
      try {
        y = c.futimesSync(v, g, m), A = !1;
      } finally {
        if (A)
          try {
            c.closeSync(v);
          } catch {
          }
        else
          c.closeSync(v);
      }
      return y;
    }) : c.futimes && (c.lutimes = function(f, g, m, v) {
      v && process.nextTick(v);
    }, c.lutimesSync = function() {
    });
  }
  function n(c) {
    return c && function(f, g, m) {
      return c.call(e, f, g, function(v) {
        h(v) && (v = null), m && m.apply(this, arguments);
      });
    };
  }
  function i(c) {
    return c && function(f, g) {
      try {
        return c.call(e, f, g);
      } catch (m) {
        if (!h(m)) throw m;
      }
    };
  }
  function o(c) {
    return c && function(f, g, m, v) {
      return c.call(e, f, g, m, function(y) {
        h(y) && (y = null), v && v.apply(this, arguments);
      });
    };
  }
  function a(c) {
    return c && function(f, g, m) {
      try {
        return c.call(e, f, g, m);
      } catch (v) {
        if (!h(v)) throw v;
      }
    };
  }
  function s(c) {
    return c && function(f, g, m) {
      typeof g == "function" && (m = g, g = null);
      function v(y, A) {
        A && (A.uid < 0 && (A.uid += 4294967296), A.gid < 0 && (A.gid += 4294967296)), m && m.apply(this, arguments);
      }
      return g ? c.call(e, f, g, v) : c.call(e, f, v);
    };
  }
  function l(c) {
    return c && function(f, g) {
      var m = g ? c.call(e, f, g) : c.call(e, f);
      return m && (m.uid < 0 && (m.uid += 4294967296), m.gid < 0 && (m.gid += 4294967296)), m;
    };
  }
  function h(c) {
    if (!c || c.code === "ENOSYS")
      return !0;
    var f = !process.getuid || process.getuid() !== 0;
    return !!(f && (c.code === "EINVAL" || c.code === "EPERM"));
  }
}
var ba = jr.Stream, nd = id;
function id(e) {
  return {
    ReadStream: t,
    WriteStream: r
  };
  function t(n, i) {
    if (!(this instanceof t)) return new t(n, i);
    ba.call(this);
    var o = this;
    this.path = n, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
    for (var a = Object.keys(i), s = 0, l = a.length; s < l; s++) {
      var h = a[s];
      this[h] = i[h];
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
    e.open(this.path, this.flags, this.mode, function(c, f) {
      if (c) {
        o.emit("error", c), o.readable = !1;
        return;
      }
      o.fd = f, o.emit("open", f), o._read();
    });
  }
  function r(n, i) {
    if (!(this instanceof r)) return new r(n, i);
    ba.call(this), this.path = n, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
    for (var o = Object.keys(i), a = 0, s = o.length; a < s; a++) {
      var l = o[a];
      this[l] = i[l];
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
var od = sd, ad = Object.getPrototypeOf || function(e) {
  return e.__proto__;
};
function sd(e) {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Object)
    var t = { __proto__: ad(e) };
  else
    var t = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(e).forEach(function(r) {
    Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(e, r));
  }), t;
}
var re = vt, ld = td, cd = nd, ud = od, dn = So, Ee, Fn;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (Ee = Symbol.for("graceful-fs.queue"), Fn = Symbol.for("graceful-fs.previous")) : (Ee = "___graceful-fs.queue", Fn = "___graceful-fs.previous");
function fd() {
}
function Cl(e, t) {
  Object.defineProperty(e, Ee, {
    get: function() {
      return t;
    }
  });
}
var Dt = fd;
dn.debuglog ? Dt = dn.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (Dt = function() {
  var e = dn.format.apply(dn, arguments);
  e = "GFS4: " + e.split(/\n/).join(`
GFS4: `), console.error(e);
});
if (!re[Ee]) {
  var dd = Se[Ee] || [];
  Cl(re, dd), re.close = function(e) {
    function t(r, n) {
      return e.call(re, r, function(i) {
        i || Ra(), typeof n == "function" && n.apply(this, arguments);
      });
    }
    return Object.defineProperty(t, Fn, {
      value: e
    }), t;
  }(re.close), re.closeSync = function(e) {
    function t(r) {
      e.apply(re, arguments), Ra();
    }
    return Object.defineProperty(t, Fn, {
      value: e
    }), t;
  }(re.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    Dt(re[Ee]), _l.equal(re[Ee].length, 0);
  });
}
Se[Ee] || Cl(Se, re[Ee]);
var Re = Co(ud(re));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !re.__patched && (Re = Co(re), re.__patched = !0);
function Co(e) {
  ld(e), e.gracefulify = Co, e.createReadStream = Z, e.createWriteStream = oe;
  var t = e.readFile;
  e.readFile = r;
  function r(E, G, B) {
    return typeof G == "function" && (B = G, G = null), M(E, G, B);
    function M(z, I, R, N) {
      return t(z, I, function(b) {
        b && (b.code === "EMFILE" || b.code === "ENFILE") ? Ht([M, [z, I, R], b, N || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
      });
    }
  }
  var n = e.writeFile;
  e.writeFile = i;
  function i(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), z(E, G, B, M);
    function z(I, R, N, b, $) {
      return n(I, R, N, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Ht([z, [I, R, N, b], P, $ || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var o = e.appendFile;
  o && (e.appendFile = a);
  function a(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), z(E, G, B, M);
    function z(I, R, N, b, $) {
      return o(I, R, N, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Ht([z, [I, R, N, b], P, $ || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var s = e.copyFile;
  s && (e.copyFile = l);
  function l(E, G, B, M) {
    return typeof B == "function" && (M = B, B = 0), z(E, G, B, M);
    function z(I, R, N, b, $) {
      return s(I, R, N, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Ht([z, [I, R, N, b], P, $ || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var h = e.readdir;
  e.readdir = f;
  var c = /^v[0-5]\./;
  function f(E, G, B) {
    typeof G == "function" && (B = G, G = null);
    var M = c.test(process.version) ? function(R, N, b, $) {
      return h(R, z(
        R,
        N,
        b,
        $
      ));
    } : function(R, N, b, $) {
      return h(R, N, z(
        R,
        N,
        b,
        $
      ));
    };
    return M(E, G, B);
    function z(I, R, N, b) {
      return function($, P) {
        $ && ($.code === "EMFILE" || $.code === "ENFILE") ? Ht([
          M,
          [I, R, N],
          $,
          b || Date.now(),
          Date.now()
        ]) : (P && P.sort && P.sort(), typeof N == "function" && N.call(this, $, P));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var g = cd(e);
    T = g.ReadStream, D = g.WriteStream;
  }
  var m = e.ReadStream;
  m && (T.prototype = Object.create(m.prototype), T.prototype.open = S);
  var v = e.WriteStream;
  v && (D.prototype = Object.create(v.prototype), D.prototype.open = L), Object.defineProperty(e, "ReadStream", {
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
      return D;
    },
    set: function(E) {
      D = E;
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
  var A = D;
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
    return this instanceof T ? (m.apply(this, arguments), this) : T.apply(Object.create(T.prototype), arguments);
  }
  function S() {
    var E = this;
    $e(E.path, E.flags, E.mode, function(G, B) {
      G ? (E.autoClose && E.destroy(), E.emit("error", G)) : (E.fd = B, E.emit("open", B), E.read());
    });
  }
  function D(E, G) {
    return this instanceof D ? (v.apply(this, arguments), this) : D.apply(Object.create(D.prototype), arguments);
  }
  function L() {
    var E = this;
    $e(E.path, E.flags, E.mode, function(G, B) {
      G ? (E.destroy(), E.emit("error", G)) : (E.fd = B, E.emit("open", B));
    });
  }
  function Z(E, G) {
    return new e.ReadStream(E, G);
  }
  function oe(E, G) {
    return new e.WriteStream(E, G);
  }
  var W = e.open;
  e.open = $e;
  function $e(E, G, B, M) {
    return typeof B == "function" && (M = B, B = null), z(E, G, B, M);
    function z(I, R, N, b, $) {
      return W(I, R, N, function(P, k) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Ht([z, [I, R, N, b], P, $ || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  return e;
}
function Ht(e) {
  Dt("ENQUEUE", e[0].name, e[1]), re[Ee].push(e), bo();
}
var hn;
function Ra() {
  for (var e = Date.now(), t = 0; t < re[Ee].length; ++t)
    re[Ee][t].length > 2 && (re[Ee][t][3] = e, re[Ee][t][4] = e);
  bo();
}
function bo() {
  if (clearTimeout(hn), hn = void 0, re[Ee].length !== 0) {
    var e = re[Ee].shift(), t = e[0], r = e[1], n = e[2], i = e[3], o = e[4];
    if (i === void 0)
      Dt("RETRY", t.name, r), t.apply(null, r);
    else if (Date.now() - i >= 6e4) {
      Dt("TIMEOUT", t.name, r);
      var a = r.pop();
      typeof a == "function" && a.call(null, n);
    } else {
      var s = Date.now() - o, l = Math.max(o - i, 1), h = Math.min(l * 1.2, 100);
      s >= h ? (Dt("RETRY", t.name, r), t.apply(null, r.concat([i]))) : re[Ee].push(e);
    }
    hn === void 0 && (hn = setTimeout(bo, 0));
  }
}
(function(e) {
  const t = be.fromCallback, r = Re, n = [
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
  ].filter((i) => typeof r[i] == "function");
  Object.assign(e, r), n.forEach((i) => {
    e[i] = t(r[i]);
  }), e.exists = function(i, o) {
    return typeof o == "function" ? r.exists(i, o) : new Promise((a) => r.exists(i, a));
  }, e.read = function(i, o, a, s, l, h) {
    return typeof h == "function" ? r.read(i, o, a, s, l, h) : new Promise((c, f) => {
      r.read(i, o, a, s, l, (g, m, v) => {
        if (g) return f(g);
        c({ bytesRead: m, buffer: v });
      });
    });
  }, e.write = function(i, o, ...a) {
    return typeof a[a.length - 1] == "function" ? r.write(i, o, ...a) : new Promise((s, l) => {
      r.write(i, o, ...a, (h, c, f) => {
        if (h) return l(h);
        s({ bytesWritten: c, buffer: f });
      });
    });
  }, typeof r.writev == "function" && (e.writev = function(i, o, ...a) {
    return typeof a[a.length - 1] == "function" ? r.writev(i, o, ...a) : new Promise((s, l) => {
      r.writev(i, o, ...a, (h, c, f) => {
        if (h) return l(h);
        s({ bytesWritten: c, buffers: f });
      });
    });
  }), typeof r.realpath.native == "function" ? e.realpath.native = t(r.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(xt);
var Ro = {}, bl = {};
const hd = ee;
bl.checkPath = function(t) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(t.replace(hd.parse(t).root, ""))) {
    const n = new Error(`Path contains invalid characters: ${t}`);
    throw n.code = "EINVAL", n;
  }
};
const Rl = xt, { checkPath: Ol } = bl, Il = (e) => {
  const t = { mode: 511 };
  return typeof e == "number" ? e : { ...t, ...e }.mode;
};
Ro.makeDir = async (e, t) => (Ol(e), Rl.mkdir(e, {
  mode: Il(t),
  recursive: !0
}));
Ro.makeDirSync = (e, t) => (Ol(e), Rl.mkdirSync(e, {
  mode: Il(t),
  recursive: !0
}));
const pd = be.fromPromise, { makeDir: md, makeDirSync: Ci } = Ro, bi = pd(md);
var Je = {
  mkdirs: bi,
  mkdirsSync: Ci,
  // alias
  mkdirp: bi,
  mkdirpSync: Ci,
  ensureDir: bi,
  ensureDirSync: Ci
};
const gd = be.fromPromise, Pl = xt;
function Ed(e) {
  return Pl.access(e).then(() => !0).catch(() => !1);
}
var Ut = {
  pathExists: gd(Ed),
  pathExistsSync: Pl.existsSync
};
const tr = Re;
function yd(e, t, r, n) {
  tr.open(e, "r+", (i, o) => {
    if (i) return n(i);
    tr.futimes(o, t, r, (a) => {
      tr.close(o, (s) => {
        n && n(a || s);
      });
    });
  });
}
function vd(e, t, r) {
  const n = tr.openSync(e, "r+");
  return tr.futimesSync(n, t, r), tr.closeSync(n);
}
var Nl = {
  utimesMillis: yd,
  utimesMillisSync: vd
};
const nr = xt, he = ee, wd = So;
function _d(e, t, r) {
  const n = r.dereference ? (i) => nr.stat(i, { bigint: !0 }) : (i) => nr.lstat(i, { bigint: !0 });
  return Promise.all([
    n(e),
    n(t).catch((i) => {
      if (i.code === "ENOENT") return null;
      throw i;
    })
  ]).then(([i, o]) => ({ srcStat: i, destStat: o }));
}
function Ad(e, t, r) {
  let n;
  const i = r.dereference ? (a) => nr.statSync(a, { bigint: !0 }) : (a) => nr.lstatSync(a, { bigint: !0 }), o = i(e);
  try {
    n = i(t);
  } catch (a) {
    if (a.code === "ENOENT") return { srcStat: o, destStat: null };
    throw a;
  }
  return { srcStat: o, destStat: n };
}
function Td(e, t, r, n, i) {
  wd.callbackify(_d)(e, t, n, (o, a) => {
    if (o) return i(o);
    const { srcStat: s, destStat: l } = a;
    if (l) {
      if (qr(s, l)) {
        const h = he.basename(e), c = he.basename(t);
        return r === "move" && h !== c && h.toLowerCase() === c.toLowerCase() ? i(null, { srcStat: s, destStat: l, isChangingCase: !0 }) : i(new Error("Source and destination must not be the same."));
      }
      if (s.isDirectory() && !l.isDirectory())
        return i(new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`));
      if (!s.isDirectory() && l.isDirectory())
        return i(new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`));
    }
    return s.isDirectory() && Oo(e, t) ? i(new Error(zn(e, t, r))) : i(null, { srcStat: s, destStat: l });
  });
}
function Sd(e, t, r, n) {
  const { srcStat: i, destStat: o } = Ad(e, t, n);
  if (o) {
    if (qr(i, o)) {
      const a = he.basename(e), s = he.basename(t);
      if (r === "move" && a !== s && a.toLowerCase() === s.toLowerCase())
        return { srcStat: i, destStat: o, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (i.isDirectory() && !o.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
    if (!i.isDirectory() && o.isDirectory())
      throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
  }
  if (i.isDirectory() && Oo(e, t))
    throw new Error(zn(e, t, r));
  return { srcStat: i, destStat: o };
}
function Dl(e, t, r, n, i) {
  const o = he.resolve(he.dirname(e)), a = he.resolve(he.dirname(r));
  if (a === o || a === he.parse(a).root) return i();
  nr.stat(a, { bigint: !0 }, (s, l) => s ? s.code === "ENOENT" ? i() : i(s) : qr(t, l) ? i(new Error(zn(e, r, n))) : Dl(e, t, a, n, i));
}
function $l(e, t, r, n) {
  const i = he.resolve(he.dirname(e)), o = he.resolve(he.dirname(r));
  if (o === i || o === he.parse(o).root) return;
  let a;
  try {
    a = nr.statSync(o, { bigint: !0 });
  } catch (s) {
    if (s.code === "ENOENT") return;
    throw s;
  }
  if (qr(t, a))
    throw new Error(zn(e, r, n));
  return $l(e, t, o, n);
}
function qr(e, t) {
  return t.ino && t.dev && t.ino === e.ino && t.dev === e.dev;
}
function Oo(e, t) {
  const r = he.resolve(e).split(he.sep).filter((i) => i), n = he.resolve(t).split(he.sep).filter((i) => i);
  return r.reduce((i, o, a) => i && n[a] === o, !0);
}
function zn(e, t, r) {
  return `Cannot ${r} '${e}' to a subdirectory of itself, '${t}'.`;
}
var sr = {
  checkPaths: Td,
  checkPathsSync: Sd,
  checkParentPaths: Dl,
  checkParentPathsSync: $l,
  isSrcSubdir: Oo,
  areIdentical: qr
};
const Ne = Re, br = ee, Cd = Je.mkdirs, bd = Ut.pathExists, Rd = Nl.utimesMillis, Rr = sr;
function Od(e, t, r, n) {
  typeof r == "function" && !n ? (n = r, r = {}) : typeof r == "function" && (r = { filter: r }), n = n || function() {
  }, r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  ), Rr.checkPaths(e, t, "copy", r, (i, o) => {
    if (i) return n(i);
    const { srcStat: a, destStat: s } = o;
    Rr.checkParentPaths(e, a, t, "copy", (l) => l ? n(l) : r.filter ? Fl(Oa, s, e, t, r, n) : Oa(s, e, t, r, n));
  });
}
function Oa(e, t, r, n, i) {
  const o = br.dirname(r);
  bd(o, (a, s) => {
    if (a) return i(a);
    if (s) return Ln(e, t, r, n, i);
    Cd(o, (l) => l ? i(l) : Ln(e, t, r, n, i));
  });
}
function Fl(e, t, r, n, i, o) {
  Promise.resolve(i.filter(r, n)).then((a) => a ? e(t, r, n, i, o) : o(), (a) => o(a));
}
function Id(e, t, r, n, i) {
  return n.filter ? Fl(Ln, e, t, r, n, i) : Ln(e, t, r, n, i);
}
function Ln(e, t, r, n, i) {
  (n.dereference ? Ne.stat : Ne.lstat)(t, (a, s) => a ? i(a) : s.isDirectory() ? xd(s, e, t, r, n, i) : s.isFile() || s.isCharacterDevice() || s.isBlockDevice() ? Pd(s, e, t, r, n, i) : s.isSymbolicLink() ? Md(e, t, r, n, i) : s.isSocket() ? i(new Error(`Cannot copy a socket file: ${t}`)) : s.isFIFO() ? i(new Error(`Cannot copy a FIFO pipe: ${t}`)) : i(new Error(`Unknown file: ${t}`)));
}
function Pd(e, t, r, n, i, o) {
  return t ? Nd(e, r, n, i, o) : Ll(e, r, n, i, o);
}
function Nd(e, t, r, n, i) {
  if (n.overwrite)
    Ne.unlink(r, (o) => o ? i(o) : Ll(e, t, r, n, i));
  else return n.errorOnExist ? i(new Error(`'${r}' already exists`)) : i();
}
function Ll(e, t, r, n, i) {
  Ne.copyFile(t, r, (o) => o ? i(o) : n.preserveTimestamps ? Dd(e.mode, t, r, i) : Xn(r, e.mode, i));
}
function Dd(e, t, r, n) {
  return $d(e) ? Fd(r, e, (i) => i ? n(i) : Ia(e, t, r, n)) : Ia(e, t, r, n);
}
function $d(e) {
  return (e & 128) === 0;
}
function Fd(e, t, r) {
  return Xn(e, t | 128, r);
}
function Ia(e, t, r, n) {
  Ld(t, r, (i) => i ? n(i) : Xn(r, e, n));
}
function Xn(e, t, r) {
  return Ne.chmod(e, t, r);
}
function Ld(e, t, r) {
  Ne.stat(e, (n, i) => n ? r(n) : Rd(t, i.atime, i.mtime, r));
}
function xd(e, t, r, n, i, o) {
  return t ? xl(r, n, i, o) : Ud(e.mode, r, n, i, o);
}
function Ud(e, t, r, n, i) {
  Ne.mkdir(r, (o) => {
    if (o) return i(o);
    xl(t, r, n, (a) => a ? i(a) : Xn(r, e, i));
  });
}
function xl(e, t, r, n) {
  Ne.readdir(e, (i, o) => i ? n(i) : Ul(o, e, t, r, n));
}
function Ul(e, t, r, n, i) {
  const o = e.pop();
  return o ? kd(e, o, t, r, n, i) : i();
}
function kd(e, t, r, n, i, o) {
  const a = br.join(r, t), s = br.join(n, t);
  Rr.checkPaths(a, s, "copy", i, (l, h) => {
    if (l) return o(l);
    const { destStat: c } = h;
    Id(c, a, s, i, (f) => f ? o(f) : Ul(e, r, n, i, o));
  });
}
function Md(e, t, r, n, i) {
  Ne.readlink(t, (o, a) => {
    if (o) return i(o);
    if (n.dereference && (a = br.resolve(process.cwd(), a)), e)
      Ne.readlink(r, (s, l) => s ? s.code === "EINVAL" || s.code === "UNKNOWN" ? Ne.symlink(a, r, i) : i(s) : (n.dereference && (l = br.resolve(process.cwd(), l)), Rr.isSrcSubdir(a, l) ? i(new Error(`Cannot copy '${a}' to a subdirectory of itself, '${l}'.`)) : e.isDirectory() && Rr.isSrcSubdir(l, a) ? i(new Error(`Cannot overwrite '${l}' with '${a}'.`)) : Bd(a, r, i)));
    else
      return Ne.symlink(a, r, i);
  });
}
function Bd(e, t, r) {
  Ne.unlink(t, (n) => n ? r(n) : Ne.symlink(e, t, r));
}
var jd = Od;
const _e = Re, Or = ee, Hd = Je.mkdirsSync, Gd = Nl.utimesMillisSync, Ir = sr;
function qd(e, t, r) {
  typeof r == "function" && (r = { filter: r }), r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: n, destStat: i } = Ir.checkPathsSync(e, t, "copy", r);
  return Ir.checkParentPathsSync(e, n, t, "copy"), Vd(i, e, t, r);
}
function Vd(e, t, r, n) {
  if (n.filter && !n.filter(t, r)) return;
  const i = Or.dirname(r);
  return _e.existsSync(i) || Hd(i), kl(e, t, r, n);
}
function Wd(e, t, r, n) {
  if (!(n.filter && !n.filter(t, r)))
    return kl(e, t, r, n);
}
function kl(e, t, r, n) {
  const o = (n.dereference ? _e.statSync : _e.lstatSync)(t);
  if (o.isDirectory()) return Zd(o, e, t, r, n);
  if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice()) return Yd(o, e, t, r, n);
  if (o.isSymbolicLink()) return rh(e, t, r, n);
  throw o.isSocket() ? new Error(`Cannot copy a socket file: ${t}`) : o.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${t}`) : new Error(`Unknown file: ${t}`);
}
function Yd(e, t, r, n, i) {
  return t ? zd(e, r, n, i) : Ml(e, r, n, i);
}
function zd(e, t, r, n) {
  if (n.overwrite)
    return _e.unlinkSync(r), Ml(e, t, r, n);
  if (n.errorOnExist)
    throw new Error(`'${r}' already exists`);
}
function Ml(e, t, r, n) {
  return _e.copyFileSync(t, r), n.preserveTimestamps && Xd(e.mode, t, r), Io(r, e.mode);
}
function Xd(e, t, r) {
  return Kd(e) && Jd(r, e), Qd(t, r);
}
function Kd(e) {
  return (e & 128) === 0;
}
function Jd(e, t) {
  return Io(e, t | 128);
}
function Io(e, t) {
  return _e.chmodSync(e, t);
}
function Qd(e, t) {
  const r = _e.statSync(e);
  return Gd(t, r.atime, r.mtime);
}
function Zd(e, t, r, n, i) {
  return t ? Bl(r, n, i) : eh(e.mode, r, n, i);
}
function eh(e, t, r, n) {
  return _e.mkdirSync(r), Bl(t, r, n), Io(r, e);
}
function Bl(e, t, r) {
  _e.readdirSync(e).forEach((n) => th(n, e, t, r));
}
function th(e, t, r, n) {
  const i = Or.join(t, e), o = Or.join(r, e), { destStat: a } = Ir.checkPathsSync(i, o, "copy", n);
  return Wd(a, i, o, n);
}
function rh(e, t, r, n) {
  let i = _e.readlinkSync(t);
  if (n.dereference && (i = Or.resolve(process.cwd(), i)), e) {
    let o;
    try {
      o = _e.readlinkSync(r);
    } catch (a) {
      if (a.code === "EINVAL" || a.code === "UNKNOWN") return _e.symlinkSync(i, r);
      throw a;
    }
    if (n.dereference && (o = Or.resolve(process.cwd(), o)), Ir.isSrcSubdir(i, o))
      throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${o}'.`);
    if (_e.statSync(r).isDirectory() && Ir.isSrcSubdir(o, i))
      throw new Error(`Cannot overwrite '${o}' with '${i}'.`);
    return nh(i, r);
  } else
    return _e.symlinkSync(i, r);
}
function nh(e, t) {
  return _e.unlinkSync(t), _e.symlinkSync(e, t);
}
var ih = qd;
const oh = be.fromCallback;
var Po = {
  copy: oh(jd),
  copySync: ih
};
const Pa = Re, jl = ee, K = _l, Pr = process.platform === "win32";
function Hl(e) {
  [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ].forEach((r) => {
    e[r] = e[r] || Pa[r], r = r + "Sync", e[r] = e[r] || Pa[r];
  }), e.maxBusyTries = e.maxBusyTries || 3;
}
function No(e, t, r) {
  let n = 0;
  typeof t == "function" && (r = t, t = {}), K(e, "rimraf: missing path"), K.strictEqual(typeof e, "string", "rimraf: path should be a string"), K.strictEqual(typeof r, "function", "rimraf: callback function required"), K(t, "rimraf: invalid options argument provided"), K.strictEqual(typeof t, "object", "rimraf: options should be object"), Hl(t), Na(e, t, function i(o) {
    if (o) {
      if ((o.code === "EBUSY" || o.code === "ENOTEMPTY" || o.code === "EPERM") && n < t.maxBusyTries) {
        n++;
        const a = n * 100;
        return setTimeout(() => Na(e, t, i), a);
      }
      o.code === "ENOENT" && (o = null);
    }
    r(o);
  });
}
function Na(e, t, r) {
  K(e), K(t), K(typeof r == "function"), t.lstat(e, (n, i) => {
    if (n && n.code === "ENOENT")
      return r(null);
    if (n && n.code === "EPERM" && Pr)
      return Da(e, t, n, r);
    if (i && i.isDirectory())
      return Pn(e, t, n, r);
    t.unlink(e, (o) => {
      if (o) {
        if (o.code === "ENOENT")
          return r(null);
        if (o.code === "EPERM")
          return Pr ? Da(e, t, o, r) : Pn(e, t, o, r);
        if (o.code === "EISDIR")
          return Pn(e, t, o, r);
      }
      return r(o);
    });
  });
}
function Da(e, t, r, n) {
  K(e), K(t), K(typeof n == "function"), t.chmod(e, 438, (i) => {
    i ? n(i.code === "ENOENT" ? null : r) : t.stat(e, (o, a) => {
      o ? n(o.code === "ENOENT" ? null : r) : a.isDirectory() ? Pn(e, t, r, n) : t.unlink(e, n);
    });
  });
}
function $a(e, t, r) {
  let n;
  K(e), K(t);
  try {
    t.chmodSync(e, 438);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  try {
    n = t.statSync(e);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  n.isDirectory() ? Nn(e, t, r) : t.unlinkSync(e);
}
function Pn(e, t, r, n) {
  K(e), K(t), K(typeof n == "function"), t.rmdir(e, (i) => {
    i && (i.code === "ENOTEMPTY" || i.code === "EEXIST" || i.code === "EPERM") ? ah(e, t, n) : i && i.code === "ENOTDIR" ? n(r) : n(i);
  });
}
function ah(e, t, r) {
  K(e), K(t), K(typeof r == "function"), t.readdir(e, (n, i) => {
    if (n) return r(n);
    let o = i.length, a;
    if (o === 0) return t.rmdir(e, r);
    i.forEach((s) => {
      No(jl.join(e, s), t, (l) => {
        if (!a) {
          if (l) return r(a = l);
          --o === 0 && t.rmdir(e, r);
        }
      });
    });
  });
}
function Gl(e, t) {
  let r;
  t = t || {}, Hl(t), K(e, "rimraf: missing path"), K.strictEqual(typeof e, "string", "rimraf: path should be a string"), K(t, "rimraf: missing options"), K.strictEqual(typeof t, "object", "rimraf: options should be object");
  try {
    r = t.lstatSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    n.code === "EPERM" && Pr && $a(e, t, n);
  }
  try {
    r && r.isDirectory() ? Nn(e, t, null) : t.unlinkSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    if (n.code === "EPERM")
      return Pr ? $a(e, t, n) : Nn(e, t, n);
    if (n.code !== "EISDIR")
      throw n;
    Nn(e, t, n);
  }
}
function Nn(e, t, r) {
  K(e), K(t);
  try {
    t.rmdirSync(e);
  } catch (n) {
    if (n.code === "ENOTDIR")
      throw r;
    if (n.code === "ENOTEMPTY" || n.code === "EEXIST" || n.code === "EPERM")
      sh(e, t);
    else if (n.code !== "ENOENT")
      throw n;
  }
}
function sh(e, t) {
  if (K(e), K(t), t.readdirSync(e).forEach((r) => Gl(jl.join(e, r), t)), Pr) {
    const r = Date.now();
    do
      try {
        return t.rmdirSync(e, t);
      } catch {
      }
    while (Date.now() - r < 500);
  } else
    return t.rmdirSync(e, t);
}
var lh = No;
No.sync = Gl;
const xn = Re, ch = be.fromCallback, ql = lh;
function uh(e, t) {
  if (xn.rm) return xn.rm(e, { recursive: !0, force: !0 }, t);
  ql(e, t);
}
function fh(e) {
  if (xn.rmSync) return xn.rmSync(e, { recursive: !0, force: !0 });
  ql.sync(e);
}
var Kn = {
  remove: ch(uh),
  removeSync: fh
};
const dh = be.fromPromise, Vl = xt, Wl = ee, Yl = Je, zl = Kn, Fa = dh(async function(t) {
  let r;
  try {
    r = await Vl.readdir(t);
  } catch {
    return Yl.mkdirs(t);
  }
  return Promise.all(r.map((n) => zl.remove(Wl.join(t, n))));
});
function La(e) {
  let t;
  try {
    t = Vl.readdirSync(e);
  } catch {
    return Yl.mkdirsSync(e);
  }
  t.forEach((r) => {
    r = Wl.join(e, r), zl.removeSync(r);
  });
}
var hh = {
  emptyDirSync: La,
  emptydirSync: La,
  emptyDir: Fa,
  emptydir: Fa
};
const ph = be.fromCallback, Xl = ee, ut = Re, Kl = Je;
function mh(e, t) {
  function r() {
    ut.writeFile(e, "", (n) => {
      if (n) return t(n);
      t();
    });
  }
  ut.stat(e, (n, i) => {
    if (!n && i.isFile()) return t();
    const o = Xl.dirname(e);
    ut.stat(o, (a, s) => {
      if (a)
        return a.code === "ENOENT" ? Kl.mkdirs(o, (l) => {
          if (l) return t(l);
          r();
        }) : t(a);
      s.isDirectory() ? r() : ut.readdir(o, (l) => {
        if (l) return t(l);
      });
    });
  });
}
function gh(e) {
  let t;
  try {
    t = ut.statSync(e);
  } catch {
  }
  if (t && t.isFile()) return;
  const r = Xl.dirname(e);
  try {
    ut.statSync(r).isDirectory() || ut.readdirSync(r);
  } catch (n) {
    if (n && n.code === "ENOENT") Kl.mkdirsSync(r);
    else throw n;
  }
  ut.writeFileSync(e, "");
}
var Eh = {
  createFile: ph(mh),
  createFileSync: gh
};
const yh = be.fromCallback, Jl = ee, ct = Re, Ql = Je, vh = Ut.pathExists, { areIdentical: Zl } = sr;
function wh(e, t, r) {
  function n(i, o) {
    ct.link(i, o, (a) => {
      if (a) return r(a);
      r(null);
    });
  }
  ct.lstat(t, (i, o) => {
    ct.lstat(e, (a, s) => {
      if (a)
        return a.message = a.message.replace("lstat", "ensureLink"), r(a);
      if (o && Zl(s, o)) return r(null);
      const l = Jl.dirname(t);
      vh(l, (h, c) => {
        if (h) return r(h);
        if (c) return n(e, t);
        Ql.mkdirs(l, (f) => {
          if (f) return r(f);
          n(e, t);
        });
      });
    });
  });
}
function _h(e, t) {
  let r;
  try {
    r = ct.lstatSync(t);
  } catch {
  }
  try {
    const o = ct.lstatSync(e);
    if (r && Zl(o, r)) return;
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureLink"), o;
  }
  const n = Jl.dirname(t);
  return ct.existsSync(n) || Ql.mkdirsSync(n), ct.linkSync(e, t);
}
var Ah = {
  createLink: yh(wh),
  createLinkSync: _h
};
const ft = ee, Ar = Re, Th = Ut.pathExists;
function Sh(e, t, r) {
  if (ft.isAbsolute(e))
    return Ar.lstat(e, (n) => n ? (n.message = n.message.replace("lstat", "ensureSymlink"), r(n)) : r(null, {
      toCwd: e,
      toDst: e
    }));
  {
    const n = ft.dirname(t), i = ft.join(n, e);
    return Th(i, (o, a) => o ? r(o) : a ? r(null, {
      toCwd: i,
      toDst: e
    }) : Ar.lstat(e, (s) => s ? (s.message = s.message.replace("lstat", "ensureSymlink"), r(s)) : r(null, {
      toCwd: e,
      toDst: ft.relative(n, e)
    })));
  }
}
function Ch(e, t) {
  let r;
  if (ft.isAbsolute(e)) {
    if (r = Ar.existsSync(e), !r) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: e,
      toDst: e
    };
  } else {
    const n = ft.dirname(t), i = ft.join(n, e);
    if (r = Ar.existsSync(i), r)
      return {
        toCwd: i,
        toDst: e
      };
    if (r = Ar.existsSync(e), !r) throw new Error("relative srcpath does not exist");
    return {
      toCwd: e,
      toDst: ft.relative(n, e)
    };
  }
}
var bh = {
  symlinkPaths: Sh,
  symlinkPathsSync: Ch
};
const ec = Re;
function Rh(e, t, r) {
  if (r = typeof t == "function" ? t : r, t = typeof t == "function" ? !1 : t, t) return r(null, t);
  ec.lstat(e, (n, i) => {
    if (n) return r(null, "file");
    t = i && i.isDirectory() ? "dir" : "file", r(null, t);
  });
}
function Oh(e, t) {
  let r;
  if (t) return t;
  try {
    r = ec.lstatSync(e);
  } catch {
    return "file";
  }
  return r && r.isDirectory() ? "dir" : "file";
}
var Ih = {
  symlinkType: Rh,
  symlinkTypeSync: Oh
};
const Ph = be.fromCallback, tc = ee, je = xt, rc = Je, Nh = rc.mkdirs, Dh = rc.mkdirsSync, nc = bh, $h = nc.symlinkPaths, Fh = nc.symlinkPathsSync, ic = Ih, Lh = ic.symlinkType, xh = ic.symlinkTypeSync, Uh = Ut.pathExists, { areIdentical: oc } = sr;
function kh(e, t, r, n) {
  n = typeof r == "function" ? r : n, r = typeof r == "function" ? !1 : r, je.lstat(t, (i, o) => {
    !i && o.isSymbolicLink() ? Promise.all([
      je.stat(e),
      je.stat(t)
    ]).then(([a, s]) => {
      if (oc(a, s)) return n(null);
      xa(e, t, r, n);
    }) : xa(e, t, r, n);
  });
}
function xa(e, t, r, n) {
  $h(e, t, (i, o) => {
    if (i) return n(i);
    e = o.toDst, Lh(o.toCwd, r, (a, s) => {
      if (a) return n(a);
      const l = tc.dirname(t);
      Uh(l, (h, c) => {
        if (h) return n(h);
        if (c) return je.symlink(e, t, s, n);
        Nh(l, (f) => {
          if (f) return n(f);
          je.symlink(e, t, s, n);
        });
      });
    });
  });
}
function Mh(e, t, r) {
  let n;
  try {
    n = je.lstatSync(t);
  } catch {
  }
  if (n && n.isSymbolicLink()) {
    const s = je.statSync(e), l = je.statSync(t);
    if (oc(s, l)) return;
  }
  const i = Fh(e, t);
  e = i.toDst, r = xh(i.toCwd, r);
  const o = tc.dirname(t);
  return je.existsSync(o) || Dh(o), je.symlinkSync(e, t, r);
}
var Bh = {
  createSymlink: Ph(kh),
  createSymlinkSync: Mh
};
const { createFile: Ua, createFileSync: ka } = Eh, { createLink: Ma, createLinkSync: Ba } = Ah, { createSymlink: ja, createSymlinkSync: Ha } = Bh;
var jh = {
  // file
  createFile: Ua,
  createFileSync: ka,
  ensureFile: Ua,
  ensureFileSync: ka,
  // link
  createLink: Ma,
  createLinkSync: Ba,
  ensureLink: Ma,
  ensureLinkSync: Ba,
  // symlink
  createSymlink: ja,
  createSymlinkSync: Ha,
  ensureSymlink: ja,
  ensureSymlinkSync: Ha
};
function Hh(e, { EOL: t = `
`, finalEOL: r = !0, replacer: n = null, spaces: i } = {}) {
  const o = r ? t : "", a = JSON.stringify(e, n, i);
  if (a === void 0)
    throw new TypeError(`Converting ${typeof e} value to JSON is not supported`);
  return a.replace(/\n/g, t) + o;
}
function Gh(e) {
  return Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, "");
}
var Do = { stringify: Hh, stripBom: Gh };
let ir;
try {
  ir = Re;
} catch {
  ir = vt;
}
const Jn = be, { stringify: ac, stripBom: sc } = Do;
async function qh(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || ir, n = "throws" in t ? t.throws : !0;
  let i = await Jn.fromCallback(r.readFile)(e, t);
  i = sc(i);
  let o;
  try {
    o = JSON.parse(i, t ? t.reviver : null);
  } catch (a) {
    if (n)
      throw a.message = `${e}: ${a.message}`, a;
    return null;
  }
  return o;
}
const Vh = Jn.fromPromise(qh);
function Wh(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || ir, n = "throws" in t ? t.throws : !0;
  try {
    let i = r.readFileSync(e, t);
    return i = sc(i), JSON.parse(i, t.reviver);
  } catch (i) {
    if (n)
      throw i.message = `${e}: ${i.message}`, i;
    return null;
  }
}
async function Yh(e, t, r = {}) {
  const n = r.fs || ir, i = ac(t, r);
  await Jn.fromCallback(n.writeFile)(e, i, r);
}
const zh = Jn.fromPromise(Yh);
function Xh(e, t, r = {}) {
  const n = r.fs || ir, i = ac(t, r);
  return n.writeFileSync(e, i, r);
}
var Kh = {
  readFile: Vh,
  readFileSync: Wh,
  writeFile: zh,
  writeFileSync: Xh
};
const pn = Kh;
var Jh = {
  // jsonfile exports
  readJson: pn.readFile,
  readJsonSync: pn.readFileSync,
  writeJson: pn.writeFile,
  writeJsonSync: pn.writeFileSync
};
const Qh = be.fromCallback, Tr = Re, lc = ee, cc = Je, Zh = Ut.pathExists;
function ep(e, t, r, n) {
  typeof r == "function" && (n = r, r = "utf8");
  const i = lc.dirname(e);
  Zh(i, (o, a) => {
    if (o) return n(o);
    if (a) return Tr.writeFile(e, t, r, n);
    cc.mkdirs(i, (s) => {
      if (s) return n(s);
      Tr.writeFile(e, t, r, n);
    });
  });
}
function tp(e, ...t) {
  const r = lc.dirname(e);
  if (Tr.existsSync(r))
    return Tr.writeFileSync(e, ...t);
  cc.mkdirsSync(r), Tr.writeFileSync(e, ...t);
}
var $o = {
  outputFile: Qh(ep),
  outputFileSync: tp
};
const { stringify: rp } = Do, { outputFile: np } = $o;
async function ip(e, t, r = {}) {
  const n = rp(t, r);
  await np(e, n, r);
}
var op = ip;
const { stringify: ap } = Do, { outputFileSync: sp } = $o;
function lp(e, t, r) {
  const n = ap(t, r);
  sp(e, n, r);
}
var cp = lp;
const up = be.fromPromise, Ce = Jh;
Ce.outputJson = up(op);
Ce.outputJsonSync = cp;
Ce.outputJSON = Ce.outputJson;
Ce.outputJSONSync = Ce.outputJsonSync;
Ce.writeJSON = Ce.writeJson;
Ce.writeJSONSync = Ce.writeJsonSync;
Ce.readJSON = Ce.readJson;
Ce.readJSONSync = Ce.readJsonSync;
var fp = Ce;
const dp = Re, so = ee, hp = Po.copy, uc = Kn.remove, pp = Je.mkdirp, mp = Ut.pathExists, Ga = sr;
function gp(e, t, r, n) {
  typeof r == "function" && (n = r, r = {}), r = r || {};
  const i = r.overwrite || r.clobber || !1;
  Ga.checkPaths(e, t, "move", r, (o, a) => {
    if (o) return n(o);
    const { srcStat: s, isChangingCase: l = !1 } = a;
    Ga.checkParentPaths(e, s, t, "move", (h) => {
      if (h) return n(h);
      if (Ep(t)) return qa(e, t, i, l, n);
      pp(so.dirname(t), (c) => c ? n(c) : qa(e, t, i, l, n));
    });
  });
}
function Ep(e) {
  const t = so.dirname(e);
  return so.parse(t).root === t;
}
function qa(e, t, r, n, i) {
  if (n) return Ri(e, t, r, i);
  if (r)
    return uc(t, (o) => o ? i(o) : Ri(e, t, r, i));
  mp(t, (o, a) => o ? i(o) : a ? i(new Error("dest already exists.")) : Ri(e, t, r, i));
}
function Ri(e, t, r, n) {
  dp.rename(e, t, (i) => i ? i.code !== "EXDEV" ? n(i) : yp(e, t, r, n) : n());
}
function yp(e, t, r, n) {
  hp(e, t, {
    overwrite: r,
    errorOnExist: !0
  }, (o) => o ? n(o) : uc(e, n));
}
var vp = gp;
const fc = Re, lo = ee, wp = Po.copySync, dc = Kn.removeSync, _p = Je.mkdirpSync, Va = sr;
function Ap(e, t, r) {
  r = r || {};
  const n = r.overwrite || r.clobber || !1, { srcStat: i, isChangingCase: o = !1 } = Va.checkPathsSync(e, t, "move", r);
  return Va.checkParentPathsSync(e, i, t, "move"), Tp(t) || _p(lo.dirname(t)), Sp(e, t, n, o);
}
function Tp(e) {
  const t = lo.dirname(e);
  return lo.parse(t).root === t;
}
function Sp(e, t, r, n) {
  if (n) return Oi(e, t, r);
  if (r)
    return dc(t), Oi(e, t, r);
  if (fc.existsSync(t)) throw new Error("dest already exists.");
  return Oi(e, t, r);
}
function Oi(e, t, r) {
  try {
    fc.renameSync(e, t);
  } catch (n) {
    if (n.code !== "EXDEV") throw n;
    return Cp(e, t, r);
  }
}
function Cp(e, t, r) {
  return wp(e, t, {
    overwrite: r,
    errorOnExist: !0
  }), dc(e);
}
var bp = Ap;
const Rp = be.fromCallback;
var Op = {
  move: Rp(vp),
  moveSync: bp
}, _t = {
  // Export promiseified graceful-fs:
  ...xt,
  // Export extra methods:
  ...Po,
  ...hh,
  ...jh,
  ...fp,
  ...Je,
  ...Op,
  ...$o,
  ...Ut,
  ...Kn
}, kt = {}, pt = {}, ue = {}, mt = {};
Object.defineProperty(mt, "__esModule", { value: !0 });
mt.CancellationError = mt.CancellationToken = void 0;
const Ip = Al;
class Pp extends Ip.EventEmitter {
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
      return Promise.reject(new co());
    const r = () => {
      if (n != null)
        try {
          this.removeListener("cancel", n), n = null;
        } catch {
        }
    };
    let n = null;
    return new Promise((i, o) => {
      let a = null;
      if (n = () => {
        try {
          a != null && (a(), a = null);
        } finally {
          o(new co());
        }
      }, this.cancelled) {
        n();
        return;
      }
      this.onCancel(n), t(i, o, (s) => {
        a = s;
      });
    }).then((i) => (r(), i)).catch((i) => {
      throw r(), i;
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
mt.CancellationToken = Pp;
class co extends Error {
  constructor() {
    super("cancelled");
  }
}
mt.CancellationError = co;
var lr = {};
Object.defineProperty(lr, "__esModule", { value: !0 });
lr.newError = Np;
function Np(e, t) {
  const r = new Error(e);
  return r.code = t, r;
}
var ce = {}, uo = { exports: {} }, mn = { exports: {} }, Ii, Wa;
function Dp() {
  if (Wa) return Ii;
  Wa = 1;
  var e = 1e3, t = e * 60, r = t * 60, n = r * 24, i = n * 7, o = n * 365.25;
  Ii = function(c, f) {
    f = f || {};
    var g = typeof c;
    if (g === "string" && c.length > 0)
      return a(c);
    if (g === "number" && isFinite(c))
      return f.long ? l(c) : s(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function a(c) {
    if (c = String(c), !(c.length > 100)) {
      var f = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (f) {
        var g = parseFloat(f[1]), m = (f[2] || "ms").toLowerCase();
        switch (m) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return g * o;
          case "weeks":
          case "week":
          case "w":
            return g * i;
          case "days":
          case "day":
          case "d":
            return g * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return g * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return g * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return g * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return g;
          default:
            return;
        }
      }
    }
  }
  function s(c) {
    var f = Math.abs(c);
    return f >= n ? Math.round(c / n) + "d" : f >= r ? Math.round(c / r) + "h" : f >= t ? Math.round(c / t) + "m" : f >= e ? Math.round(c / e) + "s" : c + "ms";
  }
  function l(c) {
    var f = Math.abs(c);
    return f >= n ? h(c, f, n, "day") : f >= r ? h(c, f, r, "hour") : f >= t ? h(c, f, t, "minute") : f >= e ? h(c, f, e, "second") : c + " ms";
  }
  function h(c, f, g, m) {
    var v = f >= g * 1.5;
    return Math.round(c / g) + " " + m + (v ? "s" : "");
  }
  return Ii;
}
var Pi, Ya;
function hc() {
  if (Ya) return Pi;
  Ya = 1;
  function e(t) {
    n.debug = n, n.default = n, n.coerce = h, n.disable = s, n.enable = o, n.enabled = l, n.humanize = Dp(), n.destroy = c, Object.keys(t).forEach((f) => {
      n[f] = t[f];
    }), n.names = [], n.skips = [], n.formatters = {};
    function r(f) {
      let g = 0;
      for (let m = 0; m < f.length; m++)
        g = (g << 5) - g + f.charCodeAt(m), g |= 0;
      return n.colors[Math.abs(g) % n.colors.length];
    }
    n.selectColor = r;
    function n(f) {
      let g, m = null, v, y;
      function A(...T) {
        if (!A.enabled)
          return;
        const S = A, D = Number(/* @__PURE__ */ new Date()), L = D - (g || D);
        S.diff = L, S.prev = g, S.curr = D, g = D, T[0] = n.coerce(T[0]), typeof T[0] != "string" && T.unshift("%O");
        let Z = 0;
        T[0] = T[0].replace(/%([a-zA-Z%])/g, (W, $e) => {
          if (W === "%%")
            return "%";
          Z++;
          const E = n.formatters[$e];
          if (typeof E == "function") {
            const G = T[Z];
            W = E.call(S, G), T.splice(Z, 1), Z--;
          }
          return W;
        }), n.formatArgs.call(S, T), (S.log || n.log).apply(S, T);
      }
      return A.namespace = f, A.useColors = n.useColors(), A.color = n.selectColor(f), A.extend = i, A.destroy = n.destroy, Object.defineProperty(A, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => m !== null ? m : (v !== n.namespaces && (v = n.namespaces, y = n.enabled(f)), y),
        set: (T) => {
          m = T;
        }
      }), typeof n.init == "function" && n.init(A), A;
    }
    function i(f, g) {
      const m = n(this.namespace + (typeof g > "u" ? ":" : g) + f);
      return m.log = this.log, m;
    }
    function o(f) {
      n.save(f), n.namespaces = f, n.names = [], n.skips = [];
      const g = (typeof f == "string" ? f : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const m of g)
        m[0] === "-" ? n.skips.push(m.slice(1)) : n.names.push(m);
    }
    function a(f, g) {
      let m = 0, v = 0, y = -1, A = 0;
      for (; m < f.length; )
        if (v < g.length && (g[v] === f[m] || g[v] === "*"))
          g[v] === "*" ? (y = v, A = m, v++) : (m++, v++);
        else if (y !== -1)
          v = y + 1, A++, m = A;
        else
          return !1;
      for (; v < g.length && g[v] === "*"; )
        v++;
      return v === g.length;
    }
    function s() {
      const f = [
        ...n.names,
        ...n.skips.map((g) => "-" + g)
      ].join(",");
      return n.enable(""), f;
    }
    function l(f) {
      for (const g of n.skips)
        if (a(f, g))
          return !1;
      for (const g of n.names)
        if (a(f, g))
          return !0;
      return !1;
    }
    function h(f) {
      return f instanceof Error ? f.stack || f.message : f;
    }
    function c() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return n.enable(n.load()), n;
  }
  return Pi = e, Pi;
}
var za;
function $p() {
  return za || (za = 1, function(e, t) {
    t.formatArgs = n, t.save = i, t.load = o, t.useColors = r, t.storage = a(), t.destroy = /* @__PURE__ */ (() => {
      let l = !1;
      return () => {
        l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
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
    function r() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let l;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function n(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const h = "color: " + this.color;
      l.splice(1, 0, h, "color: inherit");
      let c = 0, f = 0;
      l[0].replace(/%[a-zA-Z%]/g, (g) => {
        g !== "%%" && (c++, g === "%c" && (f = c));
      }), l.splice(f, 0, h);
    }
    t.log = console.debug || console.log || (() => {
    });
    function i(l) {
      try {
        l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function o() {
      let l;
      try {
        l = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function a() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = hc()(t);
    const { formatters: s } = e.exports;
    s.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (h) {
        return "[UnexpectedJSONParseError]: " + h.message;
      }
    };
  }(mn, mn.exports)), mn.exports;
}
var gn = { exports: {} }, Ni, Xa;
function Fp() {
  return Xa || (Xa = 1, Ni = (e, t = process.argv) => {
    const r = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = t.indexOf(r + e), i = t.indexOf("--");
    return n !== -1 && (i === -1 || n < i);
  }), Ni;
}
var Di, Ka;
function Lp() {
  if (Ka) return Di;
  Ka = 1;
  const e = Yn, t = Tl, r = Fp(), { env: n } = process;
  let i;
  r("no-color") || r("no-colors") || r("color=false") || r("color=never") ? i = 0 : (r("color") || r("colors") || r("color=true") || r("color=always")) && (i = 1), "FORCE_COLOR" in n && (n.FORCE_COLOR === "true" ? i = 1 : n.FORCE_COLOR === "false" ? i = 0 : i = n.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(n.FORCE_COLOR, 10), 3));
  function o(l) {
    return l === 0 ? !1 : {
      level: l,
      hasBasic: !0,
      has256: l >= 2,
      has16m: l >= 3
    };
  }
  function a(l, h) {
    if (i === 0)
      return 0;
    if (r("color=16m") || r("color=full") || r("color=truecolor"))
      return 3;
    if (r("color=256"))
      return 2;
    if (l && !h && i === void 0)
      return 0;
    const c = i || 0;
    if (n.TERM === "dumb")
      return c;
    if (process.platform === "win32") {
      const f = e.release().split(".");
      return Number(f[0]) >= 10 && Number(f[2]) >= 10586 ? Number(f[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in n)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((f) => f in n) || n.CI_NAME === "codeship" ? 1 : c;
    if ("TEAMCITY_VERSION" in n)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(n.TEAMCITY_VERSION) ? 1 : 0;
    if (n.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in n) {
      const f = parseInt((n.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (n.TERM_PROGRAM) {
        case "iTerm.app":
          return f >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(n.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(n.TERM) || "COLORTERM" in n ? 1 : c;
  }
  function s(l) {
    const h = a(l, l && l.isTTY);
    return o(h);
  }
  return Di = {
    supportsColor: s,
    stdout: o(a(!0, t.isatty(1))),
    stderr: o(a(!0, t.isatty(2)))
  }, Di;
}
var Ja;
function xp() {
  return Ja || (Ja = 1, function(e, t) {
    const r = Tl, n = So;
    t.init = c, t.log = s, t.formatArgs = o, t.save = l, t.load = h, t.useColors = i, t.destroy = n.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const g = Lp();
      g && (g.stderr || g).level >= 2 && (t.colors = [
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
    t.inspectOpts = Object.keys(process.env).filter((g) => /^debug_/i.test(g)).reduce((g, m) => {
      const v = m.substring(6).toLowerCase().replace(/_([a-z])/g, (A, T) => T.toUpperCase());
      let y = process.env[m];
      return /^(yes|on|true|enabled)$/i.test(y) ? y = !0 : /^(no|off|false|disabled)$/i.test(y) ? y = !1 : y === "null" ? y = null : y = Number(y), g[v] = y, g;
    }, {});
    function i() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : r.isatty(process.stderr.fd);
    }
    function o(g) {
      const { namespace: m, useColors: v } = this;
      if (v) {
        const y = this.color, A = "\x1B[3" + (y < 8 ? y : "8;5;" + y), T = `  ${A};1m${m} \x1B[0m`;
        g[0] = T + g[0].split(`
`).join(`
` + T), g.push(A + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        g[0] = a() + m + " " + g[0];
    }
    function a() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function s(...g) {
      return process.stderr.write(n.formatWithOptions(t.inspectOpts, ...g) + `
`);
    }
    function l(g) {
      g ? process.env.DEBUG = g : delete process.env.DEBUG;
    }
    function h() {
      return process.env.DEBUG;
    }
    function c(g) {
      g.inspectOpts = {};
      const m = Object.keys(t.inspectOpts);
      for (let v = 0; v < m.length; v++)
        g.inspectOpts[m[v]] = t.inspectOpts[m[v]];
    }
    e.exports = hc()(t);
    const { formatters: f } = e.exports;
    f.o = function(g) {
      return this.inspectOpts.colors = this.useColors, n.inspect(g, this.inspectOpts).split(`
`).map((m) => m.trim()).join(" ");
    }, f.O = function(g) {
      return this.inspectOpts.colors = this.useColors, n.inspect(g, this.inspectOpts);
    };
  }(gn, gn.exports)), gn.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? uo.exports = $p() : uo.exports = xp();
var Up = uo.exports, Vr = {};
Object.defineProperty(Vr, "__esModule", { value: !0 });
Vr.ProgressCallbackTransform = void 0;
const kp = jr;
class Mp extends kp.Transform {
  constructor(t, r, n) {
    super(), this.total = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
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
    }), this.delta = 0), n(null, t);
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
Vr.ProgressCallbackTransform = Mp;
Object.defineProperty(ce, "__esModule", { value: !0 });
ce.DigestTransform = ce.HttpExecutor = ce.HttpError = void 0;
ce.addSensitiveRedirectHeader = Wp;
ce.addSensitiveFieldPattern = Yp;
ce.createHttpError = ho;
ce.parseJson = Xp;
ce.configureRequestOptionsFromUrl = yc;
ce.configureRequestUrl = xo;
ce.safeGetHeader = rr;
ce.configureRequestOptions = Un;
ce.isSensitiveFieldName = vc;
ce.hashSensitiveValue = wc;
ce.safeStringifyJson = Kt;
const pc = Hr, Bp = Up, jp = vt, Hp = jr, fo = wt, Gp = mt, Qa = lr, qp = Vr, st = (0, Bp.default)("electron-builder"), Fo = (e) => e.toLowerCase().replace(/[-_]/g, ""), mc = /* @__PURE__ */ new Set(["authorization", "proxyauthorization", "privatetoken", "xapikey", "xauthtoken", "xaccesstoken", "xgitlabtoken", "cookie", "xcsrftoken"]), gc = ["token", "password", "secret", "authorization", "credential", "apikey", "passphrase", "auth"], Vp = ["key"];
function Wp(e) {
  mc.add(Fo(e));
}
function Yp(e) {
  gc.push(e.toLowerCase().replace(/[-_]/g, ""));
}
function ho(e, t = null) {
  return new Lo(e.statusCode || -1, `${e.statusCode} ${e.statusMessage}` + (t == null ? "" : `
` + JSON.stringify(t, null, "  ")) + `
Headers: ` + Kt(e.headers), t);
}
const zp = /* @__PURE__ */ new Map([
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
class Lo extends Error {
  constructor(t, r = `HTTP error: ${zp.get(t) || t}`, n = null) {
    super(r), this.statusCode = t, this.description = n, this.name = "HttpError", this.code = `HTTP_ERROR_${t}`;
  }
  isServerError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
}
ce.HttpError = Lo;
function Xp(e) {
  return e.then((t) => t == null || t.length === 0 ? null : JSON.parse(t));
}
class Xt {
  constructor() {
    this.maxRedirects = 10;
  }
  request(t, r = new Gp.CancellationToken(), n) {
    Un(t);
    const i = n == null ? void 0 : JSON.stringify(n), o = i ? Buffer.from(i) : void 0;
    if (o != null) {
      st.enabled && st(Kt(n));
      const { headers: a, ...s } = t;
      t = {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": o.length,
          ...a
        },
        ...s
      };
    }
    return this.doApiRequest(t, r, (a) => a.end(o));
  }
  doApiRequest(t, r, n, i = 0) {
    if (st.enabled) {
      const { headers: o, auth: a, ...s } = t;
      st(`Request: ${Kt(s)}`);
    }
    return r.createPromise((o, a, s) => {
      const l = this.createRequest(t, (h) => {
        try {
          this.handleResponse(h, t, r, o, a, i, n);
        } catch (c) {
          a(c);
        }
      });
      this.addErrorAndTimeoutHandlers(l, a, t.timeout), this.addRedirectHandlers(l, t, a, i, (h) => {
        this.doApiRequest(h, r, n, i).then(o).catch(a);
      }), n(l, a), s(() => l.abort());
    });
  }
  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line
  addRedirectHandlers(t, r, n, i, o) {
  }
  addErrorAndTimeoutHandlers(t, r, n = 60 * 1e3) {
    this.addTimeOutHandler(t, r, n), t.on("error", r), t.on("aborted", () => {
      r(new Error("Request has been aborted by the server"));
    });
  }
  handleResponse(t, r, n, i, o, a, s) {
    var l;
    if (st.enabled) {
      const { headers: m, auth: v, ...y } = r;
      st(`Response: ${t.statusCode} ${t.statusMessage}, request options: ${Kt(y)}`);
    }
    if (t.statusCode === 404) {
      o(ho(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
      return;
    } else if (t.statusCode === 204) {
      i();
      return;
    }
    const h = (l = t.statusCode) !== null && l !== void 0 ? l : 0, c = h >= 300 && h < 400, f = rr(t, "location");
    if (c && f != null) {
      if (a > this.maxRedirects) {
        o(this.createMaxRedirectError());
        return;
      }
      this.doApiRequest(Xt.prepareRedirectUrlOptions(f, r), n, s, a).then(i).catch(o);
      return;
    }
    t.setEncoding("utf8");
    let g = "";
    t.on("error", o), t.on("data", (m) => g += m), t.on("end", () => {
      try {
        if (t.statusCode != null && t.statusCode >= 400) {
          const m = rr(t, "content-type"), v = m != null && (Array.isArray(m) ? m.find((y) => y.includes("json")) != null : m.includes("json"));
          o(ho(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

          Data:
          ${v ? Kt(JSON.parse(g)) : g}
          `));
        } else
          i(g.length === 0 ? null : g);
      } catch (m) {
        o(m);
      }
    });
  }
  async downloadToBuffer(t, r) {
    return await r.cancellationToken.createPromise((n, i, o) => {
      const a = [], s = {
        headers: r.headers || void 0,
        // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
        redirect: "manual"
      };
      xo(t, s), Un(s), this.doDownload(s, {
        destination: null,
        options: r,
        onCancel: o,
        callback: (l) => {
          l == null ? n(Buffer.concat(a)) : i(l);
        },
        responseHandler: (l, h) => {
          let c = 0;
          l.on("data", (f) => {
            if (c += f.length, c > 524288e3) {
              h(new Error("Maximum allowed size is 500 MB"));
              return;
            }
            a.push(f);
          }), l.on("end", () => {
            h(null);
          });
        }
      }, 0);
    });
  }
  doDownload(t, r, n) {
    const i = this.createRequest(t, (o) => {
      if (o.statusCode >= 400) {
        r.callback(new Error(`Cannot download "${t.protocol || "https:"}//${t.hostname}${t.path}", status ${o.statusCode}: ${o.statusMessage}`));
        return;
      }
      o.on("error", r.callback);
      const a = rr(o, "location");
      if (a != null) {
        n < this.maxRedirects ? this.doDownload(Xt.prepareRedirectUrlOptions(a, t), r, n++) : r.callback(this.createMaxRedirectError());
        return;
      }
      r.responseHandler == null ? Jp(r, o) : r.responseHandler(o, r.callback);
    });
    this.addErrorAndTimeoutHandlers(i, r.callback, t.timeout), this.addRedirectHandlers(i, t, r.callback, n, (o) => {
      this.doDownload(o, r, n++);
    }), i.end();
  }
  createMaxRedirectError() {
    return new Error(`Too many redirects (> ${this.maxRedirects})`);
  }
  addTimeOutHandler(t, r, n) {
    t.on("socket", (i) => {
      i.setTimeout(n, () => {
        t.abort(), r(new Error("Request timed out"));
      });
    });
  }
  static prepareRedirectUrlOptions(t, r) {
    const n = yc(t, { ...r }), i = n.headers;
    if (i == null)
      return n;
    const o = Xt.reconstructOriginalUrl(r), a = Ec(t, r);
    if (Xt.isCrossOriginRedirect(o, a)) {
      st.enabled && st(`Cross-origin redirect (${o.host} → ${a.host}): stripping sensitive headers`);
      for (const s of Object.keys(i))
        mc.has(Fo(s)) && delete i[s];
    }
    return n;
  }
  static reconstructOriginalUrl(t) {
    const r = t.protocol || "https:";
    if (!t.hostname)
      throw new Error("Missing hostname in request options");
    const n = t.hostname, i = t.port ? `:${t.port}` : "", o = t.path || "/";
    return new fo.URL(`${r}//${n}${i}${o}`);
  }
  static isCrossOriginRedirect(t, r) {
    if (t.hostname.toLowerCase() !== r.hostname.toLowerCase())
      return !0;
    if (t.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
    ["80", ""].includes(t.port) && r.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
    ["443", ""].includes(r.port))
      return !1;
    if (t.protocol !== r.protocol)
      return !0;
    const n = t.port, i = r.port;
    return n !== i;
  }
  static async retryOnServerError(t, r = 3) {
    for (let n = 0; ; n++)
      try {
        return await t();
      } catch (i) {
        if (n < r && (i instanceof Lo && i.isServerError() || i.code === "EPIPE")) {
          await new Promise((o) => setTimeout(o, 1e3 * (n + 1)));
          continue;
        }
        throw i;
      }
  }
}
ce.HttpExecutor = Xt;
function Ec(e, t) {
  try {
    return new fo.URL(e);
  } catch {
    const r = t.hostname, n = t.protocol || "https:", i = t.port ? `:${t.port}` : "", o = `${n}//${r}${i}`;
    return new fo.URL(e, o);
  }
}
function yc(e, t) {
  const r = Un(t), n = Ec(e, t);
  return xo(n, r), r;
}
function xo(e, t) {
  t.protocol = e.protocol, t.hostname = e.hostname, e.port ? t.port = e.port : t.port && delete t.port, t.path = e.pathname + e.search;
}
class po extends Hp.Transform {
  // noinspection JSUnusedGlobalSymbols
  get actual() {
    return this._actual;
  }
  constructor(t, r = "sha512", n = "base64") {
    super(), this.expected = t, this.algorithm = r, this.encoding = n, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, pc.createHash)(r);
  }
  // noinspection JSUnusedGlobalSymbols
  _transform(t, r, n) {
    this.digester.update(t), n(null, t);
  }
  // noinspection JSUnusedGlobalSymbols
  _flush(t) {
    if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
      try {
        this.validate();
      } catch (r) {
        t(r);
        return;
      }
    t(null);
  }
  validate() {
    if (this._actual == null)
      throw (0, Qa.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
    if (this._actual !== this.expected)
      throw (0, Qa.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
    return null;
  }
}
ce.DigestTransform = po;
function Kp(e, t, r) {
  return e != null && t != null && e !== t ? (r(new Error(`checksum mismatch: expected ${t} but got ${e} (X-Checksum-Sha2 header)`)), !1) : !0;
}
function rr(e, t) {
  const r = e.headers[t];
  return r == null ? null : Array.isArray(r) ? r.length === 0 ? null : r[r.length - 1] : r;
}
function Jp(e, t) {
  if (!Kp(rr(t, "X-Checksum-Sha2"), e.options.sha2, e.callback))
    return;
  const r = [];
  if (e.options.onProgress != null) {
    const a = rr(t, "content-length");
    a != null && r.push(new qp.ProgressCallbackTransform(parseInt(a, 10), e.options.cancellationToken, e.options.onProgress));
  }
  const n = e.options.sha512;
  n != null ? r.push(new po(n, "sha512", n.length === 128 && !n.includes("+") && !n.includes("Z") && !n.includes("=") ? "hex" : "base64")) : e.options.sha2 != null && r.push(new po(e.options.sha2, "sha256", "hex"));
  const i = (0, jp.createWriteStream)(e.destination);
  r.push(i);
  let o = t;
  for (const a of r)
    a.on("error", (s) => {
      i.close(), e.options.cancellationToken.cancelled || e.callback(s);
    }), o = o.pipe(a);
  i.on("finish", () => {
    i.close(e.callback);
  });
}
function Un(e, t, r) {
  r != null && (e.method = r), e.headers = { ...e.headers };
  const n = e.headers;
  return t != null && (n.authorization = t.startsWith("Basic") || t.startsWith("Bearer") ? t : `token ${t}`), n["User-Agent"] == null && (n["User-Agent"] = "electron-builder"), (r == null || r === "GET" || n["Cache-Control"] == null) && (n["Cache-Control"] = "no-cache"), e.protocol == null && process.versions.electron != null && (e.protocol = "https:"), e;
}
function vc(e) {
  const t = Fo(e);
  return gc.some((r) => t.includes(r)) || Vp.some((r) => t.endsWith(r));
}
function wc(e) {
  return `${(0, pc.createHash)("sha256").update(e).digest("hex")} (sha256 hash)`;
}
function Kt(e, t) {
  return JSON.stringify(e, (r, n) => vc(r) || t != null && t.has(r) ? typeof n == "string" ? wc(n) : "<stripped sensitive data>" : n, 2);
}
var Qn = {};
Object.defineProperty(Qn, "__esModule", { value: !0 });
Qn.MemoLazy = void 0;
class Qp {
  constructor(t, r) {
    this.selector = t, this.creator = r, this.selected = void 0, this._value = void 0;
  }
  get hasValue() {
    return this._value !== void 0;
  }
  get value() {
    const t = this.selector();
    if (this._value !== void 0 && _c(this.selected, t))
      return this._value;
    this.selected = t;
    const r = this.creator(t);
    return this.value = r, r;
  }
  set value(t) {
    this._value = t;
  }
}
Qn.MemoLazy = Qp;
function _c(e, t) {
  if (typeof e == "object" && e !== null && (typeof t == "object" && t !== null)) {
    const i = Object.keys(e), o = Object.keys(t);
    return i.length === o.length && i.every((a) => _c(e[a], t[a]));
  }
  return e === t;
}
var Wr = {};
Object.defineProperty(Wr, "__esModule", { value: !0 });
Wr.githubUrl = Zp;
Wr.githubTagPrefix = em;
Wr.getS3LikeProviderBaseUrl = tm;
function Zp(e, t = "github.com") {
  return `${e.protocol || "https"}://${e.host || t}`;
}
function em(e) {
  var t;
  return e.tagNamePrefix ? e.tagNamePrefix : !((t = e.vPrefixedTagName) !== null && t !== void 0) || t ? "v" : "";
}
function tm(e) {
  const t = e.provider;
  if (t === "s3")
    return rm(e);
  if (t === "spaces")
    return nm(e);
  throw new Error(`Not supported provider: ${t}`);
}
function rm(e) {
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
  return Ac(t, e.path);
}
function Ac(e, t) {
  return t != null && t.length > 0 && (t.startsWith("/") || (e += "/"), e += t), e;
}
function nm(e) {
  if (e.name == null)
    throw new Error("name is missing");
  if (e.region == null)
    throw new Error("region is missing");
  return Ac(`https://${e.name}.${e.region}.digitaloceanspaces.com`, e.path);
}
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
Uo.retry = Tc;
const im = mt;
async function Tc(e, t) {
  var r;
  const { retries: n, interval: i, backoff: o = 0, attempt: a = 0, shouldRetry: s, cancellationToken: l = new im.CancellationToken() } = t;
  try {
    return await e();
  } catch (h) {
    if (await Promise.resolve((r = s == null ? void 0 : s(h)) !== null && r !== void 0 ? r : !0) && n > 0 && !l.cancelled)
      return await new Promise((c) => setTimeout(c, i + o * a)), await Tc(e, { ...t, retries: n - 1, attempt: a + 1 });
    throw h;
  }
}
var ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
ko.parseDn = om;
function om(e) {
  let t = !1, r = null, n = "", i = 0;
  e = e.trim();
  const o = /* @__PURE__ */ new Map();
  for (let a = 0; a <= e.length; a++) {
    if (a === e.length) {
      r !== null && o.set(r, n);
      break;
    }
    const s = e[a];
    if (t) {
      if (s === '"') {
        t = !1;
        continue;
      }
    } else {
      if (s === '"') {
        t = !0;
        continue;
      }
      if (s === "\\") {
        a++;
        const l = parseInt(e.slice(a, a + 2), 16);
        Number.isNaN(l) ? n += e[a] : (a++, n += String.fromCharCode(l));
        continue;
      }
      if (r === null && s === "=") {
        r = n, n = "";
        continue;
      }
      if (s === "," || s === ";" || s === "+") {
        r !== null && o.set(r, n), r = null, n = "";
        continue;
      }
    }
    if (s === " " && !t) {
      if (n.length === 0)
        continue;
      if (a > i) {
        let l = a;
        for (; e[l] === " "; )
          l++;
        i = l;
      }
      if (i >= e.length || e[i] === "," || e[i] === ";" || r === null && e[i] === "=" || r !== null && e[i] === "+") {
        a = i - 1;
        continue;
      }
    }
    n += s;
  }
  return o;
}
var or = {};
Object.defineProperty(or, "__esModule", { value: !0 });
or.nil = or.UUID = void 0;
const Sc = Hr, Cc = lr, am = "options.name must be either a string or a Buffer", Za = (0, Sc.randomBytes)(16);
Za[0] = Za[0] | 1;
const Dn = {}, V = [];
for (let e = 0; e < 256; e++) {
  const t = (e + 256).toString(16).substr(1);
  Dn[t] = e, V[e] = t;
}
class Lt {
  constructor(t) {
    this.ascii = null, this.binary = null;
    const r = Lt.check(t);
    if (!r)
      throw new Error("not a UUID");
    this.version = r.version, r.format === "ascii" ? this.ascii = t : this.binary = t;
  }
  static v5(t, r) {
    return sm(t, "sha1", 80, r);
  }
  toString() {
    return this.ascii == null && (this.ascii = lm(this.binary)), this.ascii;
  }
  inspect() {
    return `UUID v${this.version} ${this.toString()}`;
  }
  static check(t, r = 0) {
    if (typeof t == "string")
      return t = t.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(t) ? t === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
        version: (Dn[t[14] + t[15]] & 240) >> 4,
        variant: es((Dn[t[19] + t[20]] & 224) >> 5),
        format: "ascii"
      } : !1;
    if (Buffer.isBuffer(t)) {
      if (t.length < r + 16)
        return !1;
      let n = 0;
      for (; n < 16 && t[r + n] === 0; n++)
        ;
      return n === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
        version: (t[r + 6] & 240) >> 4,
        variant: es((t[r + 8] & 224) >> 5),
        format: "binary"
      };
    }
    throw (0, Cc.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
  }
  // read stringified uuid into a Buffer
  static parse(t) {
    const r = Buffer.allocUnsafe(16);
    let n = 0;
    for (let i = 0; i < 16; i++)
      r[i] = Dn[t[n++] + t[n++]], (i === 3 || i === 5 || i === 7 || i === 9) && (n += 1);
    return r;
  }
}
or.UUID = Lt;
Lt.OID = Lt.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
function es(e) {
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
var Sr;
(function(e) {
  e[e.ASCII = 0] = "ASCII", e[e.BINARY = 1] = "BINARY", e[e.OBJECT = 2] = "OBJECT";
})(Sr || (Sr = {}));
function sm(e, t, r, n, i = Sr.ASCII) {
  const o = (0, Sc.createHash)(t);
  if (typeof e != "string" && !Buffer.isBuffer(e))
    throw (0, Cc.newError)(am, "ERR_INVALID_UUID_NAME");
  o.update(n), o.update(e);
  const s = o.digest();
  let l;
  switch (i) {
    case Sr.BINARY:
      s[6] = s[6] & 15 | r, s[8] = s[8] & 63 | 128, l = s;
      break;
    case Sr.OBJECT:
      s[6] = s[6] & 15 | r, s[8] = s[8] & 63 | 128, l = new Lt(s);
      break;
    default:
      l = V[s[0]] + V[s[1]] + V[s[2]] + V[s[3]] + "-" + V[s[4]] + V[s[5]] + "-" + V[s[6] & 15 | r] + V[s[7]] + "-" + V[s[8] & 63 | 128] + V[s[9]] + "-" + V[s[10]] + V[s[11]] + V[s[12]] + V[s[13]] + V[s[14]] + V[s[15]];
      break;
  }
  return l;
}
function lm(e) {
  return V[e[0]] + V[e[1]] + V[e[2]] + V[e[3]] + "-" + V[e[4]] + V[e[5]] + "-" + V[e[6]] + V[e[7]] + "-" + V[e[8]] + V[e[9]] + "-" + V[e[10]] + V[e[11]] + V[e[12]] + V[e[13]] + V[e[14]] + V[e[15]];
}
or.nil = new Lt("00000000-0000-0000-0000-000000000000");
var Yr = {}, bc = {};
(function(e) {
  (function(t) {
    t.parser = function(d, u) {
      return new n(d, u);
    }, t.SAXParser = n, t.SAXStream = c, t.createStream = h, t.MAX_BUFFER_LENGTH = 64 * 1024;
    var r = [
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
    function n(d, u) {
      if (!(this instanceof n))
        return new n(d, u);
      var C = this;
      o(C), C.q = C.c = "", C.bufferCheckPosition = t.MAX_BUFFER_LENGTH, C.opt = u || {}, C.opt.lowercase = C.opt.lowercase || C.opt.lowercasetags, C.looseCase = C.opt.lowercase ? "toLowerCase" : "toUpperCase", C.tags = [], C.closed = C.closedRoot = C.sawRoot = !1, C.tag = C.error = null, C.strict = !!d, C.noscript = !!(d || C.opt.noscript), C.state = E.BEGIN, C.strictEntities = C.opt.strictEntities, C.ENTITIES = C.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), C.attribList = [], C.opt.xmlns && (C.ns = Object.create(y)), C.opt.unquotedAttributeValues === void 0 && (C.opt.unquotedAttributeValues = !d), C.trackPosition = C.opt.position !== !1, C.trackPosition && (C.position = C.line = C.column = 0), B(C, "onready");
    }
    Object.create || (Object.create = function(d) {
      function u() {
      }
      u.prototype = d;
      var C = new u();
      return C;
    }), Object.keys || (Object.keys = function(d) {
      var u = [];
      for (var C in d) d.hasOwnProperty(C) && u.push(C);
      return u;
    });
    function i(d) {
      for (var u = Math.max(t.MAX_BUFFER_LENGTH, 10), C = 0, _ = 0, Y = r.length; _ < Y; _++) {
        var J = d[r[_]].length;
        if (J > u)
          switch (r[_]) {
            case "textNode":
              z(d);
              break;
            case "cdata":
              M(d, "oncdata", d.cdata), d.cdata = "";
              break;
            case "script":
              M(d, "onscript", d.script), d.script = "";
              break;
            default:
              R(d, "Max buffer length exceeded: " + r[_]);
          }
        C = Math.max(C, J);
      }
      var ne = t.MAX_BUFFER_LENGTH - C;
      d.bufferCheckPosition = ne + d.position;
    }
    function o(d) {
      for (var u = 0, C = r.length; u < C; u++)
        d[r[u]] = "";
    }
    function a(d) {
      z(d), d.cdata !== "" && (M(d, "oncdata", d.cdata), d.cdata = ""), d.script !== "" && (M(d, "onscript", d.script), d.script = "");
    }
    n.prototype = {
      end: function() {
        N(this);
      },
      write: We,
      resume: function() {
        return this.error = null, this;
      },
      close: function() {
        return this.write(null);
      },
      flush: function() {
        a(this);
      }
    };
    var s;
    try {
      s = require("stream").Stream;
    } catch {
      s = function() {
      };
    }
    s || (s = function() {
    });
    var l = t.EVENTS.filter(function(d) {
      return d !== "error" && d !== "end";
    });
    function h(d, u) {
      return new c(d, u);
    }
    function c(d, u) {
      if (!(this instanceof c))
        return new c(d, u);
      s.apply(this), this._parser = new n(d, u), this.writable = !0, this.readable = !0;
      var C = this;
      this._parser.onend = function() {
        C.emit("end");
      }, this._parser.onerror = function(_) {
        C.emit("error", _), C._parser.error = null;
      }, this._decoder = null, l.forEach(function(_) {
        Object.defineProperty(C, "on" + _, {
          get: function() {
            return C._parser["on" + _];
          },
          set: function(Y) {
            if (!Y)
              return C.removeAllListeners(_), C._parser["on" + _] = Y, Y;
            C.on(_, Y);
          },
          enumerable: !0,
          configurable: !1
        });
      });
    }
    c.prototype = Object.create(s.prototype, {
      constructor: {
        value: c
      }
    }), c.prototype.write = function(d) {
      if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(d)) {
        if (!this._decoder) {
          var u = Kf.StringDecoder;
          this._decoder = new u("utf8");
        }
        d = this._decoder.write(d);
      }
      return this._parser.write(d.toString()), this.emit("data", d), !0;
    }, c.prototype.end = function(d) {
      return d && d.length && this.write(d), this._parser.end(), !0;
    }, c.prototype.on = function(d, u) {
      var C = this;
      return !C._parser["on" + d] && l.indexOf(d) !== -1 && (C._parser["on" + d] = function() {
        var _ = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        _.splice(0, 0, d), C.emit.apply(C, _);
      }), s.prototype.on.call(C, d, u);
    };
    var f = "[CDATA[", g = "DOCTYPE", m = "http://www.w3.org/XML/1998/namespace", v = "http://www.w3.org/2000/xmlns/", y = { xml: m, xmlns: v }, A = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, T = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, S = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, D = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function L(d) {
      return d === " " || d === `
` || d === "\r" || d === "	";
    }
    function Z(d) {
      return d === '"' || d === "'";
    }
    function oe(d) {
      return d === ">" || L(d);
    }
    function W(d, u) {
      return d.test(u);
    }
    function $e(d, u) {
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
      var u = t.ENTITIES[d], C = typeof u == "number" ? String.fromCharCode(u) : u;
      t.ENTITIES[d] = C;
    });
    for (var G in t.STATE)
      t.STATE[t.STATE[G]] = G;
    E = t.STATE;
    function B(d, u, C) {
      d[u] && d[u](C);
    }
    function M(d, u, C) {
      d.textNode && z(d), B(d, u, C);
    }
    function z(d) {
      d.textNode = I(d.opt, d.textNode), d.textNode && B(d, "ontext", d.textNode), d.textNode = "";
    }
    function I(d, u) {
      return d.trim && (u = u.trim()), d.normalize && (u = u.replace(/\s+/g, " ")), u;
    }
    function R(d, u) {
      return z(d), d.trackPosition && (u += `
Line: ` + d.line + `
Column: ` + d.column + `
Char: ` + d.c), u = new Error(u), d.error = u, B(d, "onerror", u), d;
    }
    function N(d) {
      return d.sawRoot && !d.closedRoot && b(d, "Unclosed root tag"), d.state !== E.BEGIN && d.state !== E.BEGIN_WHITESPACE && d.state !== E.TEXT && R(d, "Unexpected end"), z(d), d.c = "", d.closed = !0, B(d, "onend"), n.call(d, d.strict, d.opt), d;
    }
    function b(d, u) {
      if (typeof d != "object" || !(d instanceof n))
        throw new Error("bad call to strictFail");
      d.strict && R(d, u);
    }
    function $(d) {
      d.strict || (d.tagName = d.tagName[d.looseCase]());
      var u = d.tags[d.tags.length - 1] || d, C = d.tag = { name: d.tagName, attributes: {} };
      d.opt.xmlns && (C.ns = u.ns), d.attribList.length = 0, M(d, "onopentagstart", C);
    }
    function P(d, u) {
      var C = d.indexOf(":"), _ = C < 0 ? ["", d] : d.split(":"), Y = _[0], J = _[1];
      return u && d === "xmlns" && (Y = "xmlns", J = ""), { prefix: Y, local: J };
    }
    function k(d) {
      if (d.strict || (d.attribName = d.attribName[d.looseCase]()), d.attribList.indexOf(d.attribName) !== -1 || d.tag.attributes.hasOwnProperty(d.attribName)) {
        d.attribName = d.attribValue = "";
        return;
      }
      if (d.opt.xmlns) {
        var u = P(d.attribName, !0), C = u.prefix, _ = u.local;
        if (C === "xmlns")
          if (_ === "xml" && d.attribValue !== m)
            b(
              d,
              "xml: prefix must be bound to " + m + `
Actual: ` + d.attribValue
            );
          else if (_ === "xmlns" && d.attribValue !== v)
            b(
              d,
              "xmlns: prefix must be bound to " + v + `
Actual: ` + d.attribValue
            );
          else {
            var Y = d.tag, J = d.tags[d.tags.length - 1] || d;
            Y.ns === J.ns && (Y.ns = Object.create(J.ns)), Y.ns[_] = d.attribValue;
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
        var C = d.tag, _ = P(d.tagName);
        C.prefix = _.prefix, C.local = _.local, C.uri = C.ns[_.prefix] || "", C.prefix && !C.uri && (b(
          d,
          "Unbound namespace prefix: " + JSON.stringify(d.tagName)
        ), C.uri = _.prefix);
        var Y = d.tags[d.tags.length - 1] || d;
        C.ns && Y.ns !== C.ns && Object.keys(C.ns).forEach(function(rn) {
          M(d, "onopennamespace", {
            prefix: rn,
            uri: C.ns[rn]
          });
        });
        for (var J = 0, ne = d.attribList.length; J < ne; J++) {
          var pe = d.attribList[J], ve = pe[0], rt = pe[1], le = P(ve, !0), ke = le.prefix, Ei = le.local, tn = ke === "" ? "" : C.ns[ke] || "", dr = {
            name: ve,
            value: rt,
            prefix: ke,
            local: Ei,
            uri: tn
          };
          ke && ke !== "xmlns" && !tn && (b(
            d,
            "Unbound namespace prefix: " + JSON.stringify(ke)
          ), dr.uri = ke), d.tag.attributes[ve] = dr, M(d, "onattribute", dr);
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
      var u = d.tags.length, C = d.tagName;
      d.strict || (C = C[d.looseCase]());
      for (var _ = C; u--; ) {
        var Y = d.tags[u];
        if (Y.name !== _)
          b(d, "Unexpected close tag");
        else
          break;
      }
      if (u < 0) {
        b(d, "Unmatched closing tag: " + d.tagName), d.textNode += "</" + d.tagName + ">", d.state = E.TEXT;
        return;
      }
      d.tagName = C;
      for (var J = d.tags.length; J-- > u; ) {
        var ne = d.tag = d.tags.pop();
        d.tagName = d.tag.name, M(d, "onclosetag", d.tagName);
        var pe = {};
        for (var ve in ne.ns)
          pe[ve] = ne.ns[ve];
        var rt = d.tags[d.tags.length - 1] || d;
        d.opt.xmlns && ne.ns !== rt.ns && Object.keys(ne.ns).forEach(function(le) {
          var ke = ne.ns[le];
          M(d, "onclosenamespace", { prefix: le, uri: ke });
        });
      }
      u === 0 && (d.closedRoot = !0), d.tagName = d.attribValue = d.attribName = "", d.attribList.length = 0, d.state = E.TEXT;
    }
    function X(d) {
      var u = d.entity, C = u.toLowerCase(), _, Y = "";
      return d.ENTITIES[u] ? d.ENTITIES[u] : d.ENTITIES[C] ? d.ENTITIES[C] : (u = C, u.charAt(0) === "#" && (u.charAt(1) === "x" ? (u = u.slice(2), _ = parseInt(u, 16), Y = _.toString(16)) : (u = u.slice(1), _ = parseInt(u, 10), Y = _.toString(10))), u = u.replace(/^0+/, ""), isNaN(_) || Y.toLowerCase() !== u || _ < 0 || _ > 1114111 ? (b(d, "Invalid character entity"), "&" + d.entity + ";") : String.fromCodePoint(_));
    }
    function fe(d, u) {
      u === "<" ? (d.state = E.OPEN_WAKA, d.startTagPosition = d.position) : L(u) || (b(d, "Non-whitespace before first tag."), d.textNode = u, d.state = E.TEXT);
    }
    function U(d, u) {
      var C = "";
      return u < d.length && (C = d.charAt(u)), C;
    }
    function We(d) {
      var u = this;
      if (this.error)
        throw this.error;
      if (u.closed)
        return R(
          u,
          "Cannot write after close. Assign an onready handler."
        );
      if (d === null)
        return N(u);
      typeof d == "object" && (d = d.toString());
      for (var C = 0, _ = ""; _ = U(d, C++), u.c = _, !!_; )
        switch (u.trackPosition && (u.position++, _ === `
` ? (u.line++, u.column = 0) : u.column++), u.state) {
          case E.BEGIN:
            if (u.state = E.BEGIN_WHITESPACE, _ === "\uFEFF")
              continue;
            fe(u, _);
            continue;
          case E.BEGIN_WHITESPACE:
            fe(u, _);
            continue;
          case E.TEXT:
            if (u.sawRoot && !u.closedRoot) {
              for (var J = C - 1; _ && _ !== "<" && _ !== "&"; )
                _ = U(d, C++), _ && u.trackPosition && (u.position++, _ === `
` ? (u.line++, u.column = 0) : u.column++);
              u.textNode += d.substring(J, C - 1);
            }
            _ === "<" && !(u.sawRoot && u.closedRoot && !u.strict) ? (u.state = E.OPEN_WAKA, u.startTagPosition = u.position) : (!L(_) && (!u.sawRoot || u.closedRoot) && b(u, "Text data outside of root node."), _ === "&" ? u.state = E.TEXT_ENTITY : u.textNode += _);
            continue;
          case E.SCRIPT:
            _ === "<" ? u.state = E.SCRIPT_ENDING : u.script += _;
            continue;
          case E.SCRIPT_ENDING:
            _ === "/" ? u.state = E.CLOSE_TAG : (u.script += "<" + _, u.state = E.SCRIPT);
            continue;
          case E.OPEN_WAKA:
            if (_ === "!")
              u.state = E.SGML_DECL, u.sgmlDecl = "";
            else if (!L(_)) if (W(A, _))
              u.state = E.OPEN_TAG, u.tagName = _;
            else if (_ === "/")
              u.state = E.CLOSE_TAG, u.tagName = "";
            else if (_ === "?")
              u.state = E.PROC_INST, u.procInstName = u.procInstBody = "";
            else {
              if (b(u, "Unencoded <"), u.startTagPosition + 1 < u.position) {
                var Y = u.position - u.startTagPosition;
                _ = new Array(Y).join(" ") + _;
              }
              u.textNode += "<" + _, u.state = E.TEXT;
            }
            continue;
          case E.SGML_DECL:
            if (u.sgmlDecl + _ === "--") {
              u.state = E.COMMENT, u.comment = "", u.sgmlDecl = "";
              continue;
            }
            u.doctype && u.doctype !== !0 && u.sgmlDecl ? (u.state = E.DOCTYPE_DTD, u.doctype += "<!" + u.sgmlDecl + _, u.sgmlDecl = "") : (u.sgmlDecl + _).toUpperCase() === f ? (M(u, "onopencdata"), u.state = E.CDATA, u.sgmlDecl = "", u.cdata = "") : (u.sgmlDecl + _).toUpperCase() === g ? (u.state = E.DOCTYPE, (u.doctype || u.sawRoot) && b(
              u,
              "Inappropriately located doctype declaration"
            ), u.doctype = "", u.sgmlDecl = "") : _ === ">" ? (M(u, "onsgmldeclaration", u.sgmlDecl), u.sgmlDecl = "", u.state = E.TEXT) : (Z(_) && (u.state = E.SGML_DECL_QUOTED), u.sgmlDecl += _);
            continue;
          case E.SGML_DECL_QUOTED:
            _ === u.q && (u.state = E.SGML_DECL, u.q = ""), u.sgmlDecl += _;
            continue;
          case E.DOCTYPE:
            _ === ">" ? (u.state = E.TEXT, M(u, "ondoctype", u.doctype), u.doctype = !0) : (u.doctype += _, _ === "[" ? u.state = E.DOCTYPE_DTD : Z(_) && (u.state = E.DOCTYPE_QUOTED, u.q = _));
            continue;
          case E.DOCTYPE_QUOTED:
            u.doctype += _, _ === u.q && (u.q = "", u.state = E.DOCTYPE);
            continue;
          case E.DOCTYPE_DTD:
            _ === "]" ? (u.doctype += _, u.state = E.DOCTYPE) : _ === "<" ? (u.state = E.OPEN_WAKA, u.startTagPosition = u.position) : Z(_) ? (u.doctype += _, u.state = E.DOCTYPE_DTD_QUOTED, u.q = _) : u.doctype += _;
            continue;
          case E.DOCTYPE_DTD_QUOTED:
            u.doctype += _, _ === u.q && (u.state = E.DOCTYPE_DTD, u.q = "");
            continue;
          case E.COMMENT:
            _ === "-" ? u.state = E.COMMENT_ENDING : u.comment += _;
            continue;
          case E.COMMENT_ENDING:
            _ === "-" ? (u.state = E.COMMENT_ENDED, u.comment = I(u.opt, u.comment), u.comment && M(u, "oncomment", u.comment), u.comment = "") : (u.comment += "-" + _, u.state = E.COMMENT);
            continue;
          case E.COMMENT_ENDED:
            _ !== ">" ? (b(u, "Malformed comment"), u.comment += "--" + _, u.state = E.COMMENT) : u.doctype && u.doctype !== !0 ? u.state = E.DOCTYPE_DTD : u.state = E.TEXT;
            continue;
          case E.CDATA:
            for (var J = C - 1; _ && _ !== "]"; )
              _ = U(d, C++), _ && u.trackPosition && (u.position++, _ === `
` ? (u.line++, u.column = 0) : u.column++);
            u.cdata += d.substring(J, C - 1), _ === "]" && (u.state = E.CDATA_ENDING);
            continue;
          case E.CDATA_ENDING:
            _ === "]" ? u.state = E.CDATA_ENDING_2 : (u.cdata += "]" + _, u.state = E.CDATA);
            continue;
          case E.CDATA_ENDING_2:
            _ === ">" ? (u.cdata && M(u, "oncdata", u.cdata), M(u, "onclosecdata"), u.cdata = "", u.state = E.TEXT) : _ === "]" ? u.cdata += "]" : (u.cdata += "]]" + _, u.state = E.CDATA);
            continue;
          case E.PROC_INST:
            _ === "?" ? u.state = E.PROC_INST_ENDING : L(_) ? u.state = E.PROC_INST_BODY : u.procInstName += _;
            continue;
          case E.PROC_INST_BODY:
            if (!u.procInstBody && L(_))
              continue;
            _ === "?" ? u.state = E.PROC_INST_ENDING : u.procInstBody += _;
            continue;
          case E.PROC_INST_ENDING:
            _ === ">" ? (M(u, "onprocessinginstruction", {
              name: u.procInstName,
              body: u.procInstBody
            }), u.procInstName = u.procInstBody = "", u.state = E.TEXT) : (u.procInstBody += "?" + _, u.state = E.PROC_INST_BODY);
            continue;
          case E.OPEN_TAG:
            W(T, _) ? u.tagName += _ : ($(u), _ === ">" ? q(u) : _ === "/" ? u.state = E.OPEN_TAG_SLASH : (L(_) || b(u, "Invalid character in tag name"), u.state = E.ATTRIB));
            continue;
          case E.OPEN_TAG_SLASH:
            _ === ">" ? (q(u, !0), j(u)) : (b(
              u,
              "Forward-slash in opening tag not followed by >"
            ), u.state = E.ATTRIB);
            continue;
          case E.ATTRIB:
            if (L(_))
              continue;
            _ === ">" ? q(u) : _ === "/" ? u.state = E.OPEN_TAG_SLASH : W(A, _) ? (u.attribName = _, u.attribValue = "", u.state = E.ATTRIB_NAME) : b(u, "Invalid attribute name");
            continue;
          case E.ATTRIB_NAME:
            _ === "=" ? u.state = E.ATTRIB_VALUE : _ === ">" ? (b(u, "Attribute without value"), u.attribValue = u.attribName, k(u), q(u)) : L(_) ? u.state = E.ATTRIB_NAME_SAW_WHITE : W(T, _) ? u.attribName += _ : b(u, "Invalid attribute name");
            continue;
          case E.ATTRIB_NAME_SAW_WHITE:
            if (_ === "=")
              u.state = E.ATTRIB_VALUE;
            else {
              if (L(_))
                continue;
              b(u, "Attribute without value"), u.tag.attributes[u.attribName] = "", u.attribValue = "", M(u, "onattribute", {
                name: u.attribName,
                value: ""
              }), u.attribName = "", _ === ">" ? q(u) : W(A, _) ? (u.attribName = _, u.state = E.ATTRIB_NAME) : (b(u, "Invalid attribute name"), u.state = E.ATTRIB);
            }
            continue;
          case E.ATTRIB_VALUE:
            if (L(_))
              continue;
            Z(_) ? (u.q = _, u.state = E.ATTRIB_VALUE_QUOTED) : (u.opt.unquotedAttributeValues || R(u, "Unquoted attribute value"), u.state = E.ATTRIB_VALUE_UNQUOTED, u.attribValue = _);
            continue;
          case E.ATTRIB_VALUE_QUOTED:
            if (_ !== u.q) {
              _ === "&" ? u.state = E.ATTRIB_VALUE_ENTITY_Q : u.attribValue += _;
              continue;
            }
            k(u), u.q = "", u.state = E.ATTRIB_VALUE_CLOSED;
            continue;
          case E.ATTRIB_VALUE_CLOSED:
            L(_) ? u.state = E.ATTRIB : _ === ">" ? q(u) : _ === "/" ? u.state = E.OPEN_TAG_SLASH : W(A, _) ? (b(u, "No whitespace between attributes"), u.attribName = _, u.attribValue = "", u.state = E.ATTRIB_NAME) : b(u, "Invalid attribute name");
            continue;
          case E.ATTRIB_VALUE_UNQUOTED:
            if (!oe(_)) {
              _ === "&" ? u.state = E.ATTRIB_VALUE_ENTITY_U : u.attribValue += _;
              continue;
            }
            k(u), _ === ">" ? q(u) : u.state = E.ATTRIB;
            continue;
          case E.CLOSE_TAG:
            if (u.tagName)
              _ === ">" ? j(u) : W(T, _) ? u.tagName += _ : u.script ? (u.script += "</" + u.tagName, u.tagName = "", u.state = E.SCRIPT) : (L(_) || b(u, "Invalid tagname in closing tag"), u.state = E.CLOSE_TAG_SAW_WHITE);
            else {
              if (L(_))
                continue;
              $e(A, _) ? u.script ? (u.script += "</" + _, u.state = E.SCRIPT) : b(u, "Invalid tagname in closing tag.") : u.tagName = _;
            }
            continue;
          case E.CLOSE_TAG_SAW_WHITE:
            if (L(_))
              continue;
            _ === ">" ? j(u) : b(u, "Invalid characters in closing tag");
            continue;
          case E.TEXT_ENTITY:
          case E.ATTRIB_VALUE_ENTITY_Q:
          case E.ATTRIB_VALUE_ENTITY_U:
            var ne, pe;
            switch (u.state) {
              case E.TEXT_ENTITY:
                ne = E.TEXT, pe = "textNode";
                break;
              case E.ATTRIB_VALUE_ENTITY_Q:
                ne = E.ATTRIB_VALUE_QUOTED, pe = "attribValue";
                break;
              case E.ATTRIB_VALUE_ENTITY_U:
                ne = E.ATTRIB_VALUE_UNQUOTED, pe = "attribValue";
                break;
            }
            if (_ === ";") {
              var ve = X(u);
              u.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(ve) ? (u.entity = "", u.state = ne, u.write(ve)) : (u[pe] += ve, u.entity = "", u.state = ne);
            } else W(u.entity.length ? D : S, _) ? u.entity += _ : (b(u, "Invalid character in entity name"), u[pe] += "&" + u.entity + _, u.entity = "", u.state = ne);
            continue;
          default:
            throw new Error(u, "Unknown state: " + u.state);
        }
      return u.position >= u.bufferCheckPosition && i(u), u;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    String.fromCodePoint || function() {
      var d = String.fromCharCode, u = Math.floor, C = function() {
        var _ = 16384, Y = [], J, ne, pe = -1, ve = arguments.length;
        if (!ve)
          return "";
        for (var rt = ""; ++pe < ve; ) {
          var le = Number(arguments[pe]);
          if (!isFinite(le) || // `NaN`, `+Infinity`, or `-Infinity`
          le < 0 || // not a valid Unicode code point
          le > 1114111 || // not a valid Unicode code point
          u(le) !== le)
            throw RangeError("Invalid code point: " + le);
          le <= 65535 ? Y.push(le) : (le -= 65536, J = (le >> 10) + 55296, ne = le % 1024 + 56320, Y.push(J, ne)), (pe + 1 === ve || Y.length > _) && (rt += d.apply(null, Y), Y.length = 0);
        }
        return rt;
      };
      Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
        value: C,
        configurable: !0,
        writable: !0
      }) : String.fromCodePoint = C;
    }();
  })(e);
})(bc);
Object.defineProperty(Yr, "__esModule", { value: !0 });
Yr.XElement = void 0;
Yr.parseXml = dm;
const cm = bc, En = lr;
class Rc {
  constructor(t) {
    if (this.name = t, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !t)
      throw (0, En.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
    if (!fm(t))
      throw (0, En.newError)(`Invalid element name: ${t}`, "ERR_XML_ELEMENT_INVALID_NAME");
  }
  attribute(t) {
    const r = this.attributes === null ? null : this.attributes[t];
    if (r == null)
      throw (0, En.newError)(`No attribute "${t}"`, "ERR_XML_MISSED_ATTRIBUTE");
    return r;
  }
  removeAttribute(t) {
    this.attributes !== null && delete this.attributes[t];
  }
  element(t, r = !1, n = null) {
    const i = this.elementOrNull(t, r);
    if (i === null)
      throw (0, En.newError)(n || `No element "${t}"`, "ERR_XML_MISSED_ELEMENT");
    return i;
  }
  elementOrNull(t, r = !1) {
    if (this.elements === null)
      return null;
    for (const n of this.elements)
      if (ts(n, t, r))
        return n;
    return null;
  }
  getElements(t, r = !1) {
    return this.elements === null ? [] : this.elements.filter((n) => ts(n, t, r));
  }
  elementValueOrEmpty(t, r = !1) {
    const n = this.elementOrNull(t, r);
    return n === null ? "" : n.value;
  }
}
Yr.XElement = Rc;
const um = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
function fm(e) {
  return um.test(e);
}
function ts(e, t, r) {
  const n = e.name;
  return n === t || r === !0 && n.length === t.length && n.toLowerCase() === t.toLowerCase();
}
function dm(e) {
  let t = null;
  const r = cm.parser(!0, {}), n = [];
  return r.onopentag = (i) => {
    const o = new Rc(i.name);
    if (o.attributes = i.attributes, t === null)
      t = o;
    else {
      const a = n[n.length - 1];
      a.elements == null && (a.elements = []), a.elements.push(o);
    }
    n.push(o);
  }, r.onclosetag = () => {
    n.pop();
  }, r.ontext = (i) => {
    n.length > 0 && (n[n.length - 1].value = i);
  }, r.oncdata = (i) => {
    const o = n[n.length - 1];
    o.value = i, o.isCData = !0;
  }, r.onerror = (i) => {
    throw i;
  }, r.write(e), t;
}
var Mt = {};
Object.defineProperty(Mt, "__esModule", { value: !0 });
Mt.mapToObject = Oc;
Mt.isValidKey = Zn;
Mt.asArray = hm;
Mt.deepAssign = mm;
Mt.objectToArgs = ym;
function Oc(e) {
  const t = {};
  for (const [r, n] of e)
    Zn(r) && (n instanceof Map ? t[r] = Oc(n) : t[r] = n);
  return t;
}
function Zn(e) {
  return ["__proto__", "prototype", "constructor"].includes(e) ? !1 : ["string", "number", "symbol", "boolean"].includes(typeof e) || e === null;
}
function hm(e) {
  return e == null ? [] : Array.isArray(e) ? e : [e];
}
function rs(e) {
  if (Array.isArray(e))
    return !1;
  const t = typeof e;
  return t === "object" || t === "function";
}
function pm(e, t, r) {
  const n = t[r];
  if (n === void 0)
    return;
  const i = e[r];
  i == null || n == null || !rs(i) || !rs(n) ? Array.isArray(i) && Array.isArray(n) ? e[r] = Array.from(new Set(i.concat(n))) : e[r] = n : e[r] = Ic(i, n);
}
function Ic(e, t) {
  if (e !== t)
    for (const r of Object.getOwnPropertyNames(t))
      Zn(r) && pm(e, t, r);
  return e;
}
function mm(e, ...t) {
  for (const r of t)
    r != null && Ic(e, r);
  return e;
}
const gm = /^[a-zA-Z][a-zA-Z0-9-]*$/, Em = /[\0\r\n]/;
function ym(e) {
  const t = Object.entries(e).reduce((r, [n, i]) => {
    if (!Zn(n) || i == null)
      return r;
    if (!gm.test(n))
      throw new Error(`objectToArgs: unsafe flag name rejected: ${JSON.stringify(n)}`);
    if (Em.test(i))
      throw new Error(`objectToArgs: value for --${n} contains a null byte or newline`);
    return r.concat([`--${n}`, i]);
  }, []);
  return Object.freeze(t);
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.objectToArgs = e.deepAssign = e.asArray = e.mapToObject = e.isValidKey = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.isSensitiveFieldName = e.HttpExecutor = e.hashSensitiveValue = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0;
  var t = mt;
  Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
    return t.CancellationError;
  } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } });
  var r = lr;
  Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
    return r.newError;
  } });
  var n = ce;
  Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
    return n.configureRequestOptions;
  } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
    return n.configureRequestOptionsFromUrl;
  } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
    return n.configureRequestUrl;
  } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
    return n.createHttpError;
  } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
    return n.DigestTransform;
  } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
    return n.HttpError;
  } }), Object.defineProperty(e, "hashSensitiveValue", { enumerable: !0, get: function() {
    return n.hashSensitiveValue;
  } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
    return n.HttpExecutor;
  } }), Object.defineProperty(e, "isSensitiveFieldName", { enumerable: !0, get: function() {
    return n.isSensitiveFieldName;
  } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
    return n.parseJson;
  } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
    return n.safeGetHeader;
  } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
    return n.safeStringifyJson;
  } });
  var i = Qn;
  Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
    return i.MemoLazy;
  } });
  var o = Vr;
  Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
    return o.ProgressCallbackTransform;
  } });
  var a = Wr;
  Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
    return a.getS3LikeProviderBaseUrl;
  } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
    return a.githubUrl;
  } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
    return a.githubTagPrefix;
  } });
  var s = Uo;
  Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
    return s.retry;
  } });
  var l = ko;
  Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
    return l.parseDn;
  } });
  var h = or;
  Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
    return h.UUID;
  } });
  var c = Yr;
  Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
    return c.parseXml;
  } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
    return c.XElement;
  } });
  var f = Mt;
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
})(ue);
var ye = {}, Mo = {}, He = {};
function Pc(e) {
  return typeof e > "u" || e === null;
}
function vm(e) {
  return typeof e == "object" && e !== null;
}
function wm(e) {
  return Array.isArray(e) ? e : Pc(e) ? [] : [e];
}
function _m(e, t) {
  var r, n, i, o;
  if (t)
    for (o = Object.keys(t), r = 0, n = o.length; r < n; r += 1)
      i = o[r], e[i] = t[i];
  return e;
}
function Am(e, t) {
  var r = "", n;
  for (n = 0; n < t; n += 1)
    r += e;
  return r;
}
function Tm(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
He.isNothing = Pc;
He.isObject = vm;
He.toArray = wm;
He.repeat = Am;
He.isNegativeZero = Tm;
He.extend = _m;
function Nc(e, t) {
  var r = "", n = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (r += 'in "' + e.mark.name + '" '), r += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (r += `

` + e.mark.snippet), n + " " + r) : n;
}
function Nr(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Nc(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
Nr.prototype = Object.create(Error.prototype);
Nr.prototype.constructor = Nr;
Nr.prototype.toString = function(t) {
  return this.name + ": " + Nc(this, t);
};
var zr = Nr, wr = He;
function $i(e, t, r, n, i) {
  var o = "", a = "", s = Math.floor(i / 2) - 1;
  return n - t > s && (o = " ... ", t = n - s + o.length), r - n > s && (a = " ...", r = n + s - a.length), {
    str: o + e.slice(t, r).replace(/\t/g, "→") + a,
    pos: n - t + o.length
    // relative position
  };
}
function Fi(e, t) {
  return wr.repeat(" ", t - e.length) + e;
}
function Sm(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var r = /\r?\n|\r|\0/g, n = [0], i = [], o, a = -1; o = r.exec(e.buffer); )
    i.push(o.index), n.push(o.index + o[0].length), e.position <= o.index && a < 0 && (a = n.length - 2);
  a < 0 && (a = n.length - 1);
  var s = "", l, h, c = Math.min(e.line + t.linesAfter, i.length).toString().length, f = t.maxLength - (t.indent + c + 3);
  for (l = 1; l <= t.linesBefore && !(a - l < 0); l++)
    h = $i(
      e.buffer,
      n[a - l],
      i[a - l],
      e.position - (n[a] - n[a - l]),
      f
    ), s = wr.repeat(" ", t.indent) + Fi((e.line - l + 1).toString(), c) + " | " + h.str + `
` + s;
  for (h = $i(e.buffer, n[a], i[a], e.position, f), s += wr.repeat(" ", t.indent) + Fi((e.line + 1).toString(), c) + " | " + h.str + `
`, s += wr.repeat("-", t.indent + c + 3 + h.pos) + `^
`, l = 1; l <= t.linesAfter && !(a + l >= i.length); l++)
    h = $i(
      e.buffer,
      n[a + l],
      i[a + l],
      e.position - (n[a] - n[a + l]),
      f
    ), s += wr.repeat(" ", t.indent) + Fi((e.line + l + 1).toString(), c) + " | " + h.str + `
`;
  return s.replace(/\n$/, "");
}
var Cm = Sm, ns = zr, bm = [
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
], Rm = [
  "scalar",
  "sequence",
  "mapping"
];
function Om(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(r) {
    e[r].forEach(function(n) {
      t[String(n)] = r;
    });
  }), t;
}
function Im(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(r) {
    if (bm.indexOf(r) === -1)
      throw new ns('Unknown option "' + r + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(r) {
    return r;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = Om(t.styleAliases || null), Rm.indexOf(this.kind) === -1)
    throw new ns('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var Oe = Im, Er = zr, Li = Oe;
function is(e, t) {
  var r = [];
  return e[t].forEach(function(n) {
    var i = r.length;
    r.forEach(function(o, a) {
      o.tag === n.tag && o.kind === n.kind && o.multi === n.multi && (i = a);
    }), r[i] = n;
  }), r;
}
function Pm() {
  var e = {
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
  }, t, r;
  function n(i) {
    i.multi ? (e.multi[i.kind].push(i), e.multi.fallback.push(i)) : e[i.kind][i.tag] = e.fallback[i.tag] = i;
  }
  for (t = 0, r = arguments.length; t < r; t += 1)
    arguments[t].forEach(n);
  return e;
}
function mo(e) {
  return this.extend(e);
}
mo.prototype.extend = function(t) {
  var r = [], n = [];
  if (t instanceof Li)
    n.push(t);
  else if (Array.isArray(t))
    n = n.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (r = r.concat(t.implicit)), t.explicit && (n = n.concat(t.explicit));
  else
    throw new Er("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  r.forEach(function(o) {
    if (!(o instanceof Li))
      throw new Er("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new Er("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new Er("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), n.forEach(function(o) {
    if (!(o instanceof Li))
      throw new Er("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var i = Object.create(mo.prototype);
  return i.implicit = (this.implicit || []).concat(r), i.explicit = (this.explicit || []).concat(n), i.compiledImplicit = is(i, "implicit"), i.compiledExplicit = is(i, "explicit"), i.compiledTypeMap = Pm(i.compiledImplicit, i.compiledExplicit), i;
};
var Dc = mo, Nm = Oe, $c = new Nm("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), Dm = Oe, Fc = new Dm("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), $m = Oe, Lc = new $m("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), Fm = Dc, xc = new Fm({
  explicit: [
    $c,
    Fc,
    Lc
  ]
}), Lm = Oe;
function xm(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function Um() {
  return null;
}
function km(e) {
  return e === null;
}
var Uc = new Lm("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: xm,
  construct: Um,
  predicate: km,
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
}), Mm = Oe;
function Bm(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function jm(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function Hm(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var kc = new Mm("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: Bm,
  construct: jm,
  predicate: Hm,
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
}), Gm = He, qm = Oe;
function Vm(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Wm(e) {
  return 48 <= e && e <= 55;
}
function Ym(e) {
  return 48 <= e && e <= 57;
}
function zm(e) {
  if (e === null) return !1;
  var t = e.length, r = 0, n = !1, i;
  if (!t) return !1;
  if (i = e[r], (i === "-" || i === "+") && (i = e[++r]), i === "0") {
    if (r + 1 === t) return !0;
    if (i = e[++r], i === "b") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (i !== "0" && i !== "1") return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "x") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!Vm(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "o") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!Wm(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
  }
  if (i === "_") return !1;
  for (; r < t; r++)
    if (i = e[r], i !== "_") {
      if (!Ym(e.charCodeAt(r)))
        return !1;
      n = !0;
    }
  return !(!n || i === "_");
}
function Xm(e) {
  var t = e, r = 1, n;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), n = t[0], (n === "-" || n === "+") && (n === "-" && (r = -1), t = t.slice(1), n = t[0]), t === "0") return 0;
  if (n === "0") {
    if (t[1] === "b") return r * parseInt(t.slice(2), 2);
    if (t[1] === "x") return r * parseInt(t.slice(2), 16);
    if (t[1] === "o") return r * parseInt(t.slice(2), 8);
  }
  return r * parseInt(t, 10);
}
function Km(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !Gm.isNegativeZero(e);
}
var Mc = new qm("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: zm,
  construct: Xm,
  predicate: Km,
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
    /* eslint-disable max-len */
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
}), Bc = He, Jm = Oe, Qm = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function Zm(e) {
  return !(e === null || !Qm.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function eg(e) {
  var t, r;
  return t = e.replace(/_/g, "").toLowerCase(), r = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? r === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : r * parseFloat(t, 10);
}
var tg = /^[-+]?[0-9]+e/;
function rg(e, t) {
  var r;
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
  else if (Bc.isNegativeZero(e))
    return "-0.0";
  return r = e.toString(10), tg.test(r) ? r.replace("e", ".e") : r;
}
function ng(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || Bc.isNegativeZero(e));
}
var jc = new Jm("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: Zm,
  construct: eg,
  predicate: ng,
  represent: rg,
  defaultStyle: "lowercase"
}), Hc = xc.extend({
  implicit: [
    Uc,
    kc,
    Mc,
    jc
  ]
}), Gc = Hc, ig = Oe, qc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Vc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function og(e) {
  return e === null ? !1 : qc.exec(e) !== null || Vc.exec(e) !== null;
}
function ag(e) {
  var t, r, n, i, o, a, s, l = 0, h = null, c, f, g;
  if (t = qc.exec(e), t === null && (t = Vc.exec(e)), t === null) throw new Error("Date resolve error");
  if (r = +t[1], n = +t[2] - 1, i = +t[3], !t[4])
    return new Date(Date.UTC(r, n, i));
  if (o = +t[4], a = +t[5], s = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (c = +t[10], f = +(t[11] || 0), h = (c * 60 + f) * 6e4, t[9] === "-" && (h = -h)), g = new Date(Date.UTC(r, n, i, o, a, s, l)), h && g.setTime(g.getTime() - h), g;
}
function sg(e) {
  return e.toISOString();
}
var Wc = new ig("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: og,
  construct: ag,
  instanceOf: Date,
  represent: sg
}), lg = Oe;
function cg(e) {
  return e === "<<" || e === null;
}
var Yc = new lg("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: cg
}), ug = Oe, Bo = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function fg(e) {
  if (e === null) return !1;
  var t, r, n = 0, i = e.length, o = Bo;
  for (r = 0; r < i; r++)
    if (t = o.indexOf(e.charAt(r)), !(t > 64)) {
      if (t < 0) return !1;
      n += 6;
    }
  return n % 8 === 0;
}
function dg(e) {
  var t, r, n = e.replace(/[\r\n=]/g, ""), i = n.length, o = Bo, a = 0, s = [];
  for (t = 0; t < i; t++)
    t % 4 === 0 && t && (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)), a = a << 6 | o.indexOf(n.charAt(t));
  return r = i % 4 * 6, r === 0 ? (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)) : r === 18 ? (s.push(a >> 10 & 255), s.push(a >> 2 & 255)) : r === 12 && s.push(a >> 4 & 255), new Uint8Array(s);
}
function hg(e) {
  var t = "", r = 0, n, i, o = e.length, a = Bo;
  for (n = 0; n < o; n++)
    n % 3 === 0 && n && (t += a[r >> 18 & 63], t += a[r >> 12 & 63], t += a[r >> 6 & 63], t += a[r & 63]), r = (r << 8) + e[n];
  return i = o % 3, i === 0 ? (t += a[r >> 18 & 63], t += a[r >> 12 & 63], t += a[r >> 6 & 63], t += a[r & 63]) : i === 2 ? (t += a[r >> 10 & 63], t += a[r >> 4 & 63], t += a[r << 2 & 63], t += a[64]) : i === 1 && (t += a[r >> 2 & 63], t += a[r << 4 & 63], t += a[64], t += a[64]), t;
}
function pg(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var zc = new ug("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: fg,
  construct: dg,
  predicate: pg,
  represent: hg
}), mg = Oe, gg = Object.prototype.hasOwnProperty, Eg = Object.prototype.toString;
function yg(e) {
  if (e === null) return !0;
  var t = [], r, n, i, o, a, s = e;
  for (r = 0, n = s.length; r < n; r += 1) {
    if (i = s[r], a = !1, Eg.call(i) !== "[object Object]") return !1;
    for (o in i)
      if (gg.call(i, o))
        if (!a) a = !0;
        else return !1;
    if (!a) return !1;
    if (t.indexOf(o) === -1) t.push(o);
    else return !1;
  }
  return !0;
}
function vg(e) {
  return e !== null ? e : [];
}
var Xc = new mg("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: yg,
  construct: vg
}), wg = Oe, _g = Object.prototype.toString;
function Ag(e) {
  if (e === null) return !0;
  var t, r, n, i, o, a = e;
  for (o = new Array(a.length), t = 0, r = a.length; t < r; t += 1) {
    if (n = a[t], _g.call(n) !== "[object Object]" || (i = Object.keys(n), i.length !== 1)) return !1;
    o[t] = [i[0], n[i[0]]];
  }
  return !0;
}
function Tg(e) {
  if (e === null) return [];
  var t, r, n, i, o, a = e;
  for (o = new Array(a.length), t = 0, r = a.length; t < r; t += 1)
    n = a[t], i = Object.keys(n), o[t] = [i[0], n[i[0]]];
  return o;
}
var Kc = new wg("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: Ag,
  construct: Tg
}), Sg = Oe, Cg = Object.prototype.hasOwnProperty;
function bg(e) {
  if (e === null) return !0;
  var t, r = e;
  for (t in r)
    if (Cg.call(r, t) && r[t] !== null)
      return !1;
  return !0;
}
function Rg(e) {
  return e !== null ? e : {};
}
var Jc = new Sg("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: bg,
  construct: Rg
}), jo = Gc.extend({
  implicit: [
    Wc,
    Yc
  ],
  explicit: [
    zc,
    Xc,
    Kc,
    Jc
  ]
}), Pt = He, Qc = zr, Og = Cm, Ig = jo, gt = Object.prototype.hasOwnProperty, kn = 1, Zc = 2, eu = 3, Mn = 4, xi = 1, Pg = 2, os = 3, Ng = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Dg = /[\x85\u2028\u2029]/, $g = /[,\[\]\{\}]/, tu = /^(?:!|!!|![a-z\-]+!)$/i, ru = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function as(e) {
  return Object.prototype.toString.call(e);
}
function Ke(e) {
  return e === 10 || e === 13;
}
function $t(e) {
  return e === 9 || e === 32;
}
function De(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function Jt(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function Fg(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function Lg(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function xg(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function ss(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function Ug(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function nu(e, t, r) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: r
  }) : e[t] = r;
}
var iu = new Array(256), ou = new Array(256);
for (var Gt = 0; Gt < 256; Gt++)
  iu[Gt] = ss(Gt) ? 1 : 0, ou[Gt] = ss(Gt);
function kg(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || Ig, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function au(e, t) {
  var r = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return r.snippet = Og(r), new Qc(t, r);
}
function x(e, t) {
  throw au(e, t);
}
function Bn(e, t) {
  e.onWarning && e.onWarning.call(null, au(e, t));
}
var ls = {
  YAML: function(t, r, n) {
    var i, o, a;
    t.version !== null && x(t, "duplication of %YAML directive"), n.length !== 1 && x(t, "YAML directive accepts exactly one argument"), i = /^([0-9]+)\.([0-9]+)$/.exec(n[0]), i === null && x(t, "ill-formed argument of the YAML directive"), o = parseInt(i[1], 10), a = parseInt(i[2], 10), o !== 1 && x(t, "unacceptable YAML version of the document"), t.version = n[0], t.checkLineBreaks = a < 2, a !== 1 && a !== 2 && Bn(t, "unsupported YAML version of the document");
  },
  TAG: function(t, r, n) {
    var i, o;
    n.length !== 2 && x(t, "TAG directive accepts exactly two arguments"), i = n[0], o = n[1], tu.test(i) || x(t, "ill-formed tag handle (first argument) of the TAG directive"), gt.call(t.tagMap, i) && x(t, 'there is a previously declared suffix for "' + i + '" tag handle'), ru.test(o) || x(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      o = decodeURIComponent(o);
    } catch {
      x(t, "tag prefix is malformed: " + o);
    }
    t.tagMap[i] = o;
  }
};
function ht(e, t, r, n) {
  var i, o, a, s;
  if (t < r) {
    if (s = e.input.slice(t, r), n)
      for (i = 0, o = s.length; i < o; i += 1)
        a = s.charCodeAt(i), a === 9 || 32 <= a && a <= 1114111 || x(e, "expected valid JSON character");
    else Ng.test(s) && x(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function cs(e, t, r, n) {
  var i, o, a, s;
  for (Pt.isObject(r) || x(e, "cannot merge mappings; the provided source object is unacceptable"), i = Object.keys(r), a = 0, s = i.length; a < s; a += 1)
    o = i[a], gt.call(t, o) || (nu(t, o, r[o]), n[o] = !0);
}
function Qt(e, t, r, n, i, o, a, s, l) {
  var h, c;
  if (Array.isArray(i))
    for (i = Array.prototype.slice.call(i), h = 0, c = i.length; h < c; h += 1)
      Array.isArray(i[h]) && x(e, "nested arrays are not supported inside keys"), typeof i == "object" && as(i[h]) === "[object Object]" && (i[h] = "[object Object]");
  if (typeof i == "object" && as(i) === "[object Object]" && (i = "[object Object]"), i = String(i), t === null && (t = {}), n === "tag:yaml.org,2002:merge")
    if (Array.isArray(o))
      for (h = 0, c = o.length; h < c; h += 1)
        cs(e, t, o[h], r);
    else
      cs(e, t, o, r);
  else
    !e.json && !gt.call(r, i) && gt.call(t, i) && (e.line = a || e.line, e.lineStart = s || e.lineStart, e.position = l || e.position, x(e, "duplicated mapping key")), nu(t, i, o), delete r[i];
  return t;
}
function Ho(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : x(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function ae(e, t, r) {
  for (var n = 0, i = e.input.charCodeAt(e.position); i !== 0; ) {
    for (; $t(i); )
      i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position);
    if (t && i === 35)
      do
        i = e.input.charCodeAt(++e.position);
      while (i !== 10 && i !== 13 && i !== 0);
    if (Ke(i))
      for (Ho(e), i = e.input.charCodeAt(e.position), n++, e.lineIndent = 0; i === 32; )
        e.lineIndent++, i = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return r !== -1 && n !== 0 && e.lineIndent < r && Bn(e, "deficient indentation"), n;
}
function ei(e) {
  var t = e.position, r;
  return r = e.input.charCodeAt(t), !!((r === 45 || r === 46) && r === e.input.charCodeAt(t + 1) && r === e.input.charCodeAt(t + 2) && (t += 3, r = e.input.charCodeAt(t), r === 0 || De(r)));
}
function Go(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += Pt.repeat(`
`, t - 1));
}
function Mg(e, t, r) {
  var n, i, o, a, s, l, h, c, f = e.kind, g = e.result, m;
  if (m = e.input.charCodeAt(e.position), De(m) || Jt(m) || m === 35 || m === 38 || m === 42 || m === 33 || m === 124 || m === 62 || m === 39 || m === 34 || m === 37 || m === 64 || m === 96 || (m === 63 || m === 45) && (i = e.input.charCodeAt(e.position + 1), De(i) || r && Jt(i)))
    return !1;
  for (e.kind = "scalar", e.result = "", o = a = e.position, s = !1; m !== 0; ) {
    if (m === 58) {
      if (i = e.input.charCodeAt(e.position + 1), De(i) || r && Jt(i))
        break;
    } else if (m === 35) {
      if (n = e.input.charCodeAt(e.position - 1), De(n))
        break;
    } else {
      if (e.position === e.lineStart && ei(e) || r && Jt(m))
        break;
      if (Ke(m))
        if (l = e.line, h = e.lineStart, c = e.lineIndent, ae(e, !1, -1), e.lineIndent >= t) {
          s = !0, m = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = a, e.line = l, e.lineStart = h, e.lineIndent = c;
          break;
        }
    }
    s && (ht(e, o, a, !1), Go(e, e.line - l), o = a = e.position, s = !1), $t(m) || (a = e.position + 1), m = e.input.charCodeAt(++e.position);
  }
  return ht(e, o, a, !1), e.result ? !0 : (e.kind = f, e.result = g, !1);
}
function Bg(e, t) {
  var r, n, i;
  if (r = e.input.charCodeAt(e.position), r !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (r = e.input.charCodeAt(e.position)) !== 0; )
    if (r === 39)
      if (ht(e, n, e.position, !0), r = e.input.charCodeAt(++e.position), r === 39)
        n = e.position, e.position++, i = e.position;
      else
        return !0;
    else Ke(r) ? (ht(e, n, i, !0), Go(e, ae(e, !1, t)), n = i = e.position) : e.position === e.lineStart && ei(e) ? x(e, "unexpected end of the document within a single quoted scalar") : (e.position++, i = e.position);
  x(e, "unexpected end of the stream within a single quoted scalar");
}
function jg(e, t) {
  var r, n, i, o, a, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, r = n = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return ht(e, r, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (ht(e, r, e.position, !0), s = e.input.charCodeAt(++e.position), Ke(s))
        ae(e, !1, t);
      else if (s < 256 && iu[s])
        e.result += ou[s], e.position++;
      else if ((a = Lg(s)) > 0) {
        for (i = a, o = 0; i > 0; i--)
          s = e.input.charCodeAt(++e.position), (a = Fg(s)) >= 0 ? o = (o << 4) + a : x(e, "expected hexadecimal character");
        e.result += Ug(o), e.position++;
      } else
        x(e, "unknown escape sequence");
      r = n = e.position;
    } else Ke(s) ? (ht(e, r, n, !0), Go(e, ae(e, !1, t)), r = n = e.position) : e.position === e.lineStart && ei(e) ? x(e, "unexpected end of the document within a double quoted scalar") : (e.position++, n = e.position);
  }
  x(e, "unexpected end of the stream within a double quoted scalar");
}
function Hg(e, t) {
  var r = !0, n, i, o, a = e.tag, s, l = e.anchor, h, c, f, g, m, v = /* @__PURE__ */ Object.create(null), y, A, T, S;
  if (S = e.input.charCodeAt(e.position), S === 91)
    c = 93, m = !1, s = [];
  else if (S === 123)
    c = 125, m = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), S = e.input.charCodeAt(++e.position); S !== 0; ) {
    if (ae(e, !0, t), S = e.input.charCodeAt(e.position), S === c)
      return e.position++, e.tag = a, e.anchor = l, e.kind = m ? "mapping" : "sequence", e.result = s, !0;
    r ? S === 44 && x(e, "expected the node content, but found ','") : x(e, "missed comma between flow collection entries"), A = y = T = null, f = g = !1, S === 63 && (h = e.input.charCodeAt(e.position + 1), De(h) && (f = g = !0, e.position++, ae(e, !0, t))), n = e.line, i = e.lineStart, o = e.position, ar(e, t, kn, !1, !0), A = e.tag, y = e.result, ae(e, !0, t), S = e.input.charCodeAt(e.position), (g || e.line === n) && S === 58 && (f = !0, S = e.input.charCodeAt(++e.position), ae(e, !0, t), ar(e, t, kn, !1, !0), T = e.result), m ? Qt(e, s, v, A, y, T, n, i, o) : f ? s.push(Qt(e, null, v, A, y, T, n, i, o)) : s.push(y), ae(e, !0, t), S = e.input.charCodeAt(e.position), S === 44 ? (r = !0, S = e.input.charCodeAt(++e.position)) : r = !1;
  }
  x(e, "unexpected end of the stream within a flow collection");
}
function Gg(e, t) {
  var r, n, i = xi, o = !1, a = !1, s = t, l = 0, h = !1, c, f;
  if (f = e.input.charCodeAt(e.position), f === 124)
    n = !1;
  else if (f === 62)
    n = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; f !== 0; )
    if (f = e.input.charCodeAt(++e.position), f === 43 || f === 45)
      xi === i ? i = f === 43 ? os : Pg : x(e, "repeat of a chomping mode identifier");
    else if ((c = xg(f)) >= 0)
      c === 0 ? x(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : a ? x(e, "repeat of an indentation width identifier") : (s = t + c - 1, a = !0);
    else
      break;
  if ($t(f)) {
    do
      f = e.input.charCodeAt(++e.position);
    while ($t(f));
    if (f === 35)
      do
        f = e.input.charCodeAt(++e.position);
      while (!Ke(f) && f !== 0);
  }
  for (; f !== 0; ) {
    for (Ho(e), e.lineIndent = 0, f = e.input.charCodeAt(e.position); (!a || e.lineIndent < s) && f === 32; )
      e.lineIndent++, f = e.input.charCodeAt(++e.position);
    if (!a && e.lineIndent > s && (s = e.lineIndent), Ke(f)) {
      l++;
      continue;
    }
    if (e.lineIndent < s) {
      i === os ? e.result += Pt.repeat(`
`, o ? 1 + l : l) : i === xi && o && (e.result += `
`);
      break;
    }
    for (n ? $t(f) ? (h = !0, e.result += Pt.repeat(`
`, o ? 1 + l : l)) : h ? (h = !1, e.result += Pt.repeat(`
`, l + 1)) : l === 0 ? o && (e.result += " ") : e.result += Pt.repeat(`
`, l) : e.result += Pt.repeat(`
`, o ? 1 + l : l), o = !0, a = !0, l = 0, r = e.position; !Ke(f) && f !== 0; )
      f = e.input.charCodeAt(++e.position);
    ht(e, r, e.position, !1);
  }
  return !0;
}
function us(e, t) {
  var r, n = e.tag, i = e.anchor, o = [], a, s = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, x(e, "tab characters must not be used in indentation")), !(l !== 45 || (a = e.input.charCodeAt(e.position + 1), !De(a)))); ) {
    if (s = !0, e.position++, ae(e, !0, -1) && e.lineIndent <= t) {
      o.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (r = e.line, ar(e, t, eu, !1, !0), o.push(e.result), ae(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === r || e.lineIndent > t) && l !== 0)
      x(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = n, e.anchor = i, e.kind = "sequence", e.result = o, !0) : !1;
}
function qg(e, t, r) {
  var n, i, o, a, s, l, h = e.tag, c = e.anchor, f = {}, g = /* @__PURE__ */ Object.create(null), m = null, v = null, y = null, A = !1, T = !1, S;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = f), S = e.input.charCodeAt(e.position); S !== 0; ) {
    if (!A && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, x(e, "tab characters must not be used in indentation")), n = e.input.charCodeAt(e.position + 1), o = e.line, (S === 63 || S === 58) && De(n))
      S === 63 ? (A && (Qt(e, f, g, m, v, null, a, s, l), m = v = y = null), T = !0, A = !0, i = !0) : A ? (A = !1, i = !0) : x(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, S = n;
    else {
      if (a = e.line, s = e.lineStart, l = e.position, !ar(e, r, Zc, !1, !0))
        break;
      if (e.line === o) {
        for (S = e.input.charCodeAt(e.position); $t(S); )
          S = e.input.charCodeAt(++e.position);
        if (S === 58)
          S = e.input.charCodeAt(++e.position), De(S) || x(e, "a whitespace character is expected after the key-value separator within a block mapping"), A && (Qt(e, f, g, m, v, null, a, s, l), m = v = y = null), T = !0, A = !1, i = !1, m = e.tag, v = e.result;
        else if (T)
          x(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = h, e.anchor = c, !0;
      } else if (T)
        x(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = h, e.anchor = c, !0;
    }
    if ((e.line === o || e.lineIndent > t) && (A && (a = e.line, s = e.lineStart, l = e.position), ar(e, t, Mn, !0, i) && (A ? v = e.result : y = e.result), A || (Qt(e, f, g, m, v, y, a, s, l), m = v = y = null), ae(e, !0, -1), S = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && S !== 0)
      x(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return A && Qt(e, f, g, m, v, null, a, s, l), T && (e.tag = h, e.anchor = c, e.kind = "mapping", e.result = f), T;
}
function Vg(e) {
  var t, r = !1, n = !1, i, o, a;
  if (a = e.input.charCodeAt(e.position), a !== 33) return !1;
  if (e.tag !== null && x(e, "duplication of a tag property"), a = e.input.charCodeAt(++e.position), a === 60 ? (r = !0, a = e.input.charCodeAt(++e.position)) : a === 33 ? (n = !0, i = "!!", a = e.input.charCodeAt(++e.position)) : i = "!", t = e.position, r) {
    do
      a = e.input.charCodeAt(++e.position);
    while (a !== 0 && a !== 62);
    e.position < e.length ? (o = e.input.slice(t, e.position), a = e.input.charCodeAt(++e.position)) : x(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; a !== 0 && !De(a); )
      a === 33 && (n ? x(e, "tag suffix cannot contain exclamation marks") : (i = e.input.slice(t - 1, e.position + 1), tu.test(i) || x(e, "named tag handle cannot contain such characters"), n = !0, t = e.position + 1)), a = e.input.charCodeAt(++e.position);
    o = e.input.slice(t, e.position), $g.test(o) && x(e, "tag suffix cannot contain flow indicator characters");
  }
  o && !ru.test(o) && x(e, "tag name cannot contain such characters: " + o);
  try {
    o = decodeURIComponent(o);
  } catch {
    x(e, "tag name is malformed: " + o);
  }
  return r ? e.tag = o : gt.call(e.tagMap, i) ? e.tag = e.tagMap[i] + o : i === "!" ? e.tag = "!" + o : i === "!!" ? e.tag = "tag:yaml.org,2002:" + o : x(e, 'undeclared tag handle "' + i + '"'), !0;
}
function Wg(e) {
  var t, r;
  if (r = e.input.charCodeAt(e.position), r !== 38) return !1;
  for (e.anchor !== null && x(e, "duplication of an anchor property"), r = e.input.charCodeAt(++e.position), t = e.position; r !== 0 && !De(r) && !Jt(r); )
    r = e.input.charCodeAt(++e.position);
  return e.position === t && x(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function Yg(e) {
  var t, r, n;
  if (n = e.input.charCodeAt(e.position), n !== 42) return !1;
  for (n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !De(n) && !Jt(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && x(e, "name of an alias node must contain at least one character"), r = e.input.slice(t, e.position), gt.call(e.anchorMap, r) || x(e, 'unidentified alias "' + r + '"'), e.result = e.anchorMap[r], ae(e, !0, -1), !0;
}
function ar(e, t, r, n, i) {
  var o, a, s, l = 1, h = !1, c = !1, f, g, m, v, y, A;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = a = s = Mn === r || eu === r, n && ae(e, !0, -1) && (h = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; Vg(e) || Wg(e); )
      ae(e, !0, -1) ? (h = !0, s = o, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : s = !1;
  if (s && (s = h || i), (l === 1 || Mn === r) && (kn === r || Zc === r ? y = t : y = t + 1, A = e.position - e.lineStart, l === 1 ? s && (us(e, A) || qg(e, A, y)) || Hg(e, y) ? c = !0 : (a && Gg(e, y) || Bg(e, y) || jg(e, y) ? c = !0 : Yg(e) ? (c = !0, (e.tag !== null || e.anchor !== null) && x(e, "alias node should not have any properties")) : Mg(e, y, kn === r) && (c = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (c = s && us(e, A))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && x(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), f = 0, g = e.implicitTypes.length; f < g; f += 1)
      if (v = e.implicitTypes[f], v.resolve(e.result)) {
        e.result = v.construct(e.result), e.tag = v.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (gt.call(e.typeMap[e.kind || "fallback"], e.tag))
      v = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (v = null, m = e.typeMap.multi[e.kind || "fallback"], f = 0, g = m.length; f < g; f += 1)
        if (e.tag.slice(0, m[f].tag.length) === m[f].tag) {
          v = m[f];
          break;
        }
    v || x(e, "unknown tag !<" + e.tag + ">"), e.result !== null && v.kind !== e.kind && x(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + v.kind + '", not "' + e.kind + '"'), v.resolve(e.result, e.tag) ? (e.result = v.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : x(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || c;
}
function zg(e) {
  var t = e.position, r, n, i, o = !1, a;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (a = e.input.charCodeAt(e.position)) !== 0 && (ae(e, !0, -1), a = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || a !== 37)); ) {
    for (o = !0, a = e.input.charCodeAt(++e.position), r = e.position; a !== 0 && !De(a); )
      a = e.input.charCodeAt(++e.position);
    for (n = e.input.slice(r, e.position), i = [], n.length < 1 && x(e, "directive name must not be less than one character in length"); a !== 0; ) {
      for (; $t(a); )
        a = e.input.charCodeAt(++e.position);
      if (a === 35) {
        do
          a = e.input.charCodeAt(++e.position);
        while (a !== 0 && !Ke(a));
        break;
      }
      if (Ke(a)) break;
      for (r = e.position; a !== 0 && !De(a); )
        a = e.input.charCodeAt(++e.position);
      i.push(e.input.slice(r, e.position));
    }
    a !== 0 && Ho(e), gt.call(ls, n) ? ls[n](e, n, i) : Bn(e, 'unknown document directive "' + n + '"');
  }
  if (ae(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, ae(e, !0, -1)) : o && x(e, "directives end mark is expected"), ar(e, e.lineIndent - 1, Mn, !1, !0), ae(e, !0, -1), e.checkLineBreaks && Dg.test(e.input.slice(t, e.position)) && Bn(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && ei(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, ae(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    x(e, "end of the stream or a document separator is expected");
  else
    return;
}
function su(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var r = new kg(e, t), n = e.indexOf("\0");
  for (n !== -1 && (r.position = n, x(r, "null byte is not allowed in input")), r.input += "\0"; r.input.charCodeAt(r.position) === 32; )
    r.lineIndent += 1, r.position += 1;
  for (; r.position < r.length - 1; )
    zg(r);
  return r.documents;
}
function Xg(e, t, r) {
  t !== null && typeof t == "object" && typeof r > "u" && (r = t, t = null);
  var n = su(e, r);
  if (typeof t != "function")
    return n;
  for (var i = 0, o = n.length; i < o; i += 1)
    t(n[i]);
}
function Kg(e, t) {
  var r = su(e, t);
  if (r.length !== 0) {
    if (r.length === 1)
      return r[0];
    throw new Qc("expected a single document in the stream, but found more");
  }
}
Mo.loadAll = Xg;
Mo.load = Kg;
var lu = {}, ti = He, Xr = zr, Jg = jo, cu = Object.prototype.toString, uu = Object.prototype.hasOwnProperty, qo = 65279, Qg = 9, Dr = 10, Zg = 13, e0 = 32, t0 = 33, r0 = 34, go = 35, n0 = 37, i0 = 38, o0 = 39, a0 = 42, fu = 44, s0 = 45, jn = 58, l0 = 61, c0 = 62, u0 = 63, f0 = 64, du = 91, hu = 93, d0 = 96, pu = 123, h0 = 124, mu = 125, Ae = {};
Ae[0] = "\\0";
Ae[7] = "\\a";
Ae[8] = "\\b";
Ae[9] = "\\t";
Ae[10] = "\\n";
Ae[11] = "\\v";
Ae[12] = "\\f";
Ae[13] = "\\r";
Ae[27] = "\\e";
Ae[34] = '\\"';
Ae[92] = "\\\\";
Ae[133] = "\\N";
Ae[160] = "\\_";
Ae[8232] = "\\L";
Ae[8233] = "\\P";
var p0 = [
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
], m0 = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function g0(e, t) {
  var r, n, i, o, a, s, l;
  if (t === null) return {};
  for (r = {}, n = Object.keys(t), i = 0, o = n.length; i < o; i += 1)
    a = n[i], s = String(t[a]), a.slice(0, 2) === "!!" && (a = "tag:yaml.org,2002:" + a.slice(2)), l = e.compiledTypeMap.fallback[a], l && uu.call(l.styleAliases, s) && (s = l.styleAliases[s]), r[a] = s;
  return r;
}
function E0(e) {
  var t, r, n;
  if (t = e.toString(16).toUpperCase(), e <= 255)
    r = "x", n = 2;
  else if (e <= 65535)
    r = "u", n = 4;
  else if (e <= 4294967295)
    r = "U", n = 8;
  else
    throw new Xr("code point within a string may not be greater than 0xFFFFFFFF");
  return "\\" + r + ti.repeat("0", n - t.length) + t;
}
var y0 = 1, $r = 2;
function v0(e) {
  this.schema = e.schema || Jg, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = ti.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = g0(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? $r : y0, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
function fs(e, t) {
  for (var r = ti.repeat(" ", t), n = 0, i = -1, o = "", a, s = e.length; n < s; )
    i = e.indexOf(`
`, n), i === -1 ? (a = e.slice(n), n = s) : (a = e.slice(n, i + 1), n = i + 1), a.length && a !== `
` && (o += r), o += a;
  return o;
}
function Eo(e, t) {
  return `
` + ti.repeat(" ", e.indent * t);
}
function w0(e, t) {
  var r, n, i;
  for (r = 0, n = e.implicitTypes.length; r < n; r += 1)
    if (i = e.implicitTypes[r], i.resolve(t))
      return !0;
  return !1;
}
function Hn(e) {
  return e === e0 || e === Qg;
}
function Fr(e) {
  return 32 <= e && e <= 126 || 161 <= e && e <= 55295 && e !== 8232 && e !== 8233 || 57344 <= e && e <= 65533 && e !== qo || 65536 <= e && e <= 1114111;
}
function ds(e) {
  return Fr(e) && e !== qo && e !== Zg && e !== Dr;
}
function hs(e, t, r) {
  var n = ds(e), i = n && !Hn(e);
  return (
    // ns-plain-safe
    (r ? (
      // c = flow-in
      n
    ) : n && e !== fu && e !== du && e !== hu && e !== pu && e !== mu) && e !== go && !(t === jn && !i) || ds(t) && !Hn(t) && e === go || t === jn && i
  );
}
function _0(e) {
  return Fr(e) && e !== qo && !Hn(e) && e !== s0 && e !== u0 && e !== jn && e !== fu && e !== du && e !== hu && e !== pu && e !== mu && e !== go && e !== i0 && e !== a0 && e !== t0 && e !== h0 && e !== l0 && e !== c0 && e !== o0 && e !== r0 && e !== n0 && e !== f0 && e !== d0;
}
function A0(e) {
  return !Hn(e) && e !== jn;
}
function _r(e, t) {
  var r = e.charCodeAt(t), n;
  return r >= 55296 && r <= 56319 && t + 1 < e.length && (n = e.charCodeAt(t + 1), n >= 56320 && n <= 57343) ? (r - 55296) * 1024 + n - 56320 + 65536 : r;
}
function gu(e) {
  var t = /^\n* /;
  return t.test(e);
}
var Eu = 1, yo = 2, yu = 3, vu = 4, zt = 5;
function T0(e, t, r, n, i, o, a, s) {
  var l, h = 0, c = null, f = !1, g = !1, m = n !== -1, v = -1, y = _0(_r(e, 0)) && A0(_r(e, e.length - 1));
  if (t || a)
    for (l = 0; l < e.length; h >= 65536 ? l += 2 : l++) {
      if (h = _r(e, l), !Fr(h))
        return zt;
      y = y && hs(h, c, s), c = h;
    }
  else {
    for (l = 0; l < e.length; h >= 65536 ? l += 2 : l++) {
      if (h = _r(e, l), h === Dr)
        f = !0, m && (g = g || // Foldable line = too long, and not more-indented.
        l - v - 1 > n && e[v + 1] !== " ", v = l);
      else if (!Fr(h))
        return zt;
      y = y && hs(h, c, s), c = h;
    }
    g = g || m && l - v - 1 > n && e[v + 1] !== " ";
  }
  return !f && !g ? y && !a && !i(e) ? Eu : o === $r ? zt : yo : r > 9 && gu(e) ? zt : a ? o === $r ? zt : yo : g ? vu : yu;
}
function S0(e, t, r, n, i) {
  e.dump = function() {
    if (t.length === 0)
      return e.quotingType === $r ? '""' : "''";
    if (!e.noCompatMode && (p0.indexOf(t) !== -1 || m0.test(t)))
      return e.quotingType === $r ? '"' + t + '"' : "'" + t + "'";
    var o = e.indent * Math.max(1, r), a = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - o), s = n || e.flowLevel > -1 && r >= e.flowLevel;
    function l(h) {
      return w0(e, h);
    }
    switch (T0(
      t,
      s,
      e.indent,
      a,
      l,
      e.quotingType,
      e.forceQuotes && !n,
      i
    )) {
      case Eu:
        return t;
      case yo:
        return "'" + t.replace(/'/g, "''") + "'";
      case yu:
        return "|" + ps(t, e.indent) + ms(fs(t, o));
      case vu:
        return ">" + ps(t, e.indent) + ms(fs(C0(t, a), o));
      case zt:
        return '"' + b0(t) + '"';
      default:
        throw new Xr("impossible error: invalid scalar style");
    }
  }();
}
function ps(e, t) {
  var r = gu(e) ? String(t) : "", n = e[e.length - 1] === `
`, i = n && (e[e.length - 2] === `
` || e === `
`), o = i ? "+" : n ? "" : "-";
  return r + o + `
`;
}
function ms(e) {
  return e[e.length - 1] === `
` ? e.slice(0, -1) : e;
}
function C0(e, t) {
  for (var r = /(\n+)([^\n]*)/g, n = function() {
    var h = e.indexOf(`
`);
    return h = h !== -1 ? h : e.length, r.lastIndex = h, gs(e.slice(0, h), t);
  }(), i = e[0] === `
` || e[0] === " ", o, a; a = r.exec(e); ) {
    var s = a[1], l = a[2];
    o = l[0] === " ", n += s + (!i && !o && l !== "" ? `
` : "") + gs(l, t), i = o;
  }
  return n;
}
function gs(e, t) {
  if (e === "" || e[0] === " ") return e;
  for (var r = / [^ ]/g, n, i = 0, o, a = 0, s = 0, l = ""; n = r.exec(e); )
    s = n.index, s - i > t && (o = a > i ? a : s, l += `
` + e.slice(i, o), i = o + 1), a = s;
  return l += `
`, e.length - i > t && a > i ? l += e.slice(i, a) + `
` + e.slice(a + 1) : l += e.slice(i), l.slice(1);
}
function b0(e) {
  for (var t = "", r = 0, n, i = 0; i < e.length; r >= 65536 ? i += 2 : i++)
    r = _r(e, i), n = Ae[r], !n && Fr(r) ? (t += e[i], r >= 65536 && (t += e[i + 1])) : t += n || E0(r);
  return t;
}
function R0(e, t, r) {
  var n = "", i = e.tag, o, a, s;
  for (o = 0, a = r.length; o < a; o += 1)
    s = r[o], e.replacer && (s = e.replacer.call(r, String(o), s)), (tt(e, t, s, !1, !1) || typeof s > "u" && tt(e, t, null, !1, !1)) && (n !== "" && (n += "," + (e.condenseFlow ? "" : " ")), n += e.dump);
  e.tag = i, e.dump = "[" + n + "]";
}
function Es(e, t, r, n) {
  var i = "", o = e.tag, a, s, l;
  for (a = 0, s = r.length; a < s; a += 1)
    l = r[a], e.replacer && (l = e.replacer.call(r, String(a), l)), (tt(e, t + 1, l, !0, !0, !1, !0) || typeof l > "u" && tt(e, t + 1, null, !0, !0, !1, !0)) && ((!n || i !== "") && (i += Eo(e, t)), e.dump && Dr === e.dump.charCodeAt(0) ? i += "-" : i += "- ", i += e.dump);
  e.tag = o, e.dump = i || "[]";
}
function O0(e, t, r) {
  var n = "", i = e.tag, o = Object.keys(r), a, s, l, h, c;
  for (a = 0, s = o.length; a < s; a += 1)
    c = "", n !== "" && (c += ", "), e.condenseFlow && (c += '"'), l = o[a], h = r[l], e.replacer && (h = e.replacer.call(r, l, h)), tt(e, t, l, !1, !1) && (e.dump.length > 1024 && (c += "? "), c += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), tt(e, t, h, !1, !1) && (c += e.dump, n += c));
  e.tag = i, e.dump = "{" + n + "}";
}
function I0(e, t, r, n) {
  var i = "", o = e.tag, a = Object.keys(r), s, l, h, c, f, g;
  if (e.sortKeys === !0)
    a.sort();
  else if (typeof e.sortKeys == "function")
    a.sort(e.sortKeys);
  else if (e.sortKeys)
    throw new Xr("sortKeys must be a boolean or a function");
  for (s = 0, l = a.length; s < l; s += 1)
    g = "", (!n || i !== "") && (g += Eo(e, t)), h = a[s], c = r[h], e.replacer && (c = e.replacer.call(r, h, c)), tt(e, t + 1, h, !0, !0, !0) && (f = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024, f && (e.dump && Dr === e.dump.charCodeAt(0) ? g += "?" : g += "? "), g += e.dump, f && (g += Eo(e, t)), tt(e, t + 1, c, !0, f) && (e.dump && Dr === e.dump.charCodeAt(0) ? g += ":" : g += ": ", g += e.dump, i += g));
  e.tag = o, e.dump = i || "{}";
}
function ys(e, t, r) {
  var n, i, o, a, s, l;
  for (i = r ? e.explicitTypes : e.implicitTypes, o = 0, a = i.length; o < a; o += 1)
    if (s = i[o], (s.instanceOf || s.predicate) && (!s.instanceOf || typeof t == "object" && t instanceof s.instanceOf) && (!s.predicate || s.predicate(t))) {
      if (r ? s.multi && s.representName ? e.tag = s.representName(t) : e.tag = s.tag : e.tag = "?", s.represent) {
        if (l = e.styleMap[s.tag] || s.defaultStyle, cu.call(s.represent) === "[object Function]")
          n = s.represent(t, l);
        else if (uu.call(s.represent, l))
          n = s.represent[l](t, l);
        else
          throw new Xr("!<" + s.tag + '> tag resolver accepts not "' + l + '" style');
        e.dump = n;
      }
      return !0;
    }
  return !1;
}
function tt(e, t, r, n, i, o, a) {
  e.tag = null, e.dump = r, ys(e, r, !1) || ys(e, r, !0);
  var s = cu.call(e.dump), l = n, h;
  n && (n = e.flowLevel < 0 || e.flowLevel > t);
  var c = s === "[object Object]" || s === "[object Array]", f, g;
  if (c && (f = e.duplicates.indexOf(r), g = f !== -1), (e.tag !== null && e.tag !== "?" || g || e.indent !== 2 && t > 0) && (i = !1), g && e.usedDuplicates[f])
    e.dump = "*ref_" + f;
  else {
    if (c && g && !e.usedDuplicates[f] && (e.usedDuplicates[f] = !0), s === "[object Object]")
      n && Object.keys(e.dump).length !== 0 ? (I0(e, t, e.dump, i), g && (e.dump = "&ref_" + f + e.dump)) : (O0(e, t, e.dump), g && (e.dump = "&ref_" + f + " " + e.dump));
    else if (s === "[object Array]")
      n && e.dump.length !== 0 ? (e.noArrayIndent && !a && t > 0 ? Es(e, t - 1, e.dump, i) : Es(e, t, e.dump, i), g && (e.dump = "&ref_" + f + e.dump)) : (R0(e, t, e.dump), g && (e.dump = "&ref_" + f + " " + e.dump));
    else if (s === "[object String]")
      e.tag !== "?" && S0(e, e.dump, t, o, l);
    else {
      if (s === "[object Undefined]")
        return !1;
      if (e.skipInvalid) return !1;
      throw new Xr("unacceptable kind of an object to dump " + s);
    }
    e.tag !== null && e.tag !== "?" && (h = encodeURI(
      e.tag[0] === "!" ? e.tag.slice(1) : e.tag
    ).replace(/!/g, "%21"), e.tag[0] === "!" ? h = "!" + h : h.slice(0, 18) === "tag:yaml.org,2002:" ? h = "!!" + h.slice(18) : h = "!<" + h + ">", e.dump = h + " " + e.dump);
  }
  return !0;
}
function P0(e, t) {
  var r = [], n = [], i, o;
  for (vo(e, r, n), i = 0, o = n.length; i < o; i += 1)
    t.duplicates.push(r[n[i]]);
  t.usedDuplicates = new Array(o);
}
function vo(e, t, r) {
  var n, i, o;
  if (e !== null && typeof e == "object")
    if (i = t.indexOf(e), i !== -1)
      r.indexOf(i) === -1 && r.push(i);
    else if (t.push(e), Array.isArray(e))
      for (i = 0, o = e.length; i < o; i += 1)
        vo(e[i], t, r);
    else
      for (n = Object.keys(e), i = 0, o = n.length; i < o; i += 1)
        vo(e[n[i]], t, r);
}
function N0(e, t) {
  t = t || {};
  var r = new v0(t);
  r.noRefs || P0(e, r);
  var n = e;
  return r.replacer && (n = r.replacer.call({ "": n }, "", n)), tt(r, 0, n, !0, !0) ? r.dump + `
` : "";
}
lu.dump = N0;
var wu = Mo, D0 = lu;
function Vo(e, t) {
  return function() {
    throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
  };
}
ye.Type = Oe;
ye.Schema = Dc;
ye.FAILSAFE_SCHEMA = xc;
ye.JSON_SCHEMA = Hc;
ye.CORE_SCHEMA = Gc;
ye.DEFAULT_SCHEMA = jo;
ye.load = wu.load;
ye.loadAll = wu.loadAll;
ye.dump = D0.dump;
ye.YAMLException = zr;
ye.types = {
  binary: zc,
  float: jc,
  map: Lc,
  null: Uc,
  pairs: Kc,
  set: Jc,
  timestamp: Wc,
  bool: kc,
  int: Mc,
  merge: Yc,
  omap: Xc,
  seq: Fc,
  str: $c
};
ye.safeLoad = Vo("safeLoad", "load");
ye.safeLoadAll = Vo("safeLoadAll", "loadAll");
ye.safeDump = Vo("safeDump", "dump");
var ri = {};
Object.defineProperty(ri, "__esModule", { value: !0 });
ri.Lazy = void 0;
class $0 {
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
ri.Lazy = $0;
var wo = { exports: {} };
const F0 = "2.0.0", _u = 256, L0 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, x0 = 16, U0 = _u - 6, k0 = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ni = {
  MAX_LENGTH: _u,
  MAX_SAFE_COMPONENT_LENGTH: x0,
  MAX_SAFE_BUILD_LENGTH: U0,
  MAX_SAFE_INTEGER: L0,
  RELEASE_TYPES: k0,
  SEMVER_SPEC_VERSION: F0,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const M0 = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var ii = M0;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: i
  } = ni, o = ii;
  t = e.exports = {};
  const a = t.re = [], s = t.safeRe = [], l = t.src = [], h = t.safeSrc = [], c = t.t = {};
  let f = 0;
  const g = "[a-zA-Z0-9-]", m = [
    ["\\s", 1],
    ["\\d", i],
    [g, n]
  ], v = (A) => {
    for (const [T, S] of m)
      A = A.split(`${T}*`).join(`${T}{0,${S}}`).split(`${T}+`).join(`${T}{1,${S}}`);
    return A;
  }, y = (A, T, S) => {
    const D = v(T), L = f++;
    o(A, L, T), c[A] = L, l[L] = T, h[L] = D, a[L] = new RegExp(T, S ? "g" : void 0), s[L] = new RegExp(D, S ? "g" : void 0);
  };
  y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${g}*`), y("MAINVERSION", `(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASE", `(?:-(${l[c.PRERELEASEIDENTIFIER]}(?:\\.${l[c.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${l[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[c.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${g}+`), y("BUILD", `(?:\\+(${l[c.BUILDIDENTIFIER]}(?:\\.${l[c.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${l[c.MAINVERSION]}${l[c.PRERELEASE]}?${l[c.BUILD]}?`), y("FULL", `^${l[c.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${l[c.MAINVERSIONLOOSE]}${l[c.PRERELEASELOOSE]}?${l[c.BUILD]}?`), y("LOOSE", `^${l[c.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${l[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${l[c.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:${l[c.PRERELEASE]})?${l[c.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:${l[c.PRERELEASELOOSE]})?${l[c.BUILD]}?)?)?`), y("XRANGE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${l[c.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", l[c.COERCEPLAIN] + `(?:${l[c.PRERELEASE]})?(?:${l[c.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", l[c.COERCE], !0), y("COERCERTLFULL", l[c.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${l[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${l[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${l[c.LONECARET]}${l[c.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${l[c.LONECARET]}${l[c.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${l[c.GTLT]}\\s*(${l[c.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]}|${l[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${l[c.XRANGEPLAIN]})\\s+-\\s+(${l[c.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${l[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[c.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(wo, wo.exports);
var Kr = wo.exports;
const B0 = Object.freeze({ loose: !0 }), j0 = Object.freeze({}), H0 = (e) => e ? typeof e != "object" ? B0 : e : j0;
var Wo = H0;
const vs = /^[0-9]+$/, Au = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const r = vs.test(e), n = vs.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, G0 = (e, t) => Au(t, e);
var Tu = {
  compareIdentifiers: Au,
  rcompareIdentifiers: G0
};
const yn = ii, { MAX_LENGTH: ws, MAX_SAFE_INTEGER: vn } = ni, { safeRe: wn, t: _n } = Kr, q0 = Wo, { compareIdentifiers: Ui } = Tu;
let V0 = class ze {
  constructor(t, r) {
    if (r = q0(r), t instanceof ze) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > ws)
      throw new TypeError(
        `version is longer than ${ws} characters`
      );
    yn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? wn[_n.LOOSE] : wn[_n.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > vn || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > vn || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > vn || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((i) => {
      if (/^[0-9]+$/.test(i)) {
        const o = +i;
        if (o >= 0 && o < vn)
          return o;
      }
      return i;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (yn("SemVer.compare", this.version, this.options, t), !(t instanceof ze)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new ze(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof ze || (t = new ze(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof ze || (t = new ze(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], i = t.prerelease[r];
      if (yn("prerelease compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Ui(n, i);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof ze || (t = new ze(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], i = t.build[r];
      if (yn("build compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Ui(n, i);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const i = `-${r}`.match(this.options.loose ? wn[_n.PRERELEASELOOSE] : wn[_n.PRERELEASE]);
        if (!i || i[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
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
        const i = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [i];
        else {
          let o = this.prerelease.length;
          for (; --o >= 0; )
            typeof this.prerelease[o] == "number" && (this.prerelease[o]++, o = -2);
          if (o === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(i);
          }
        }
        if (r) {
          let o = [r, i];
          n === !1 && (o = [r]), Ui(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = o) : this.prerelease = o;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ie = V0;
const _s = Ie, W0 = (e, t, r = !1) => {
  if (e instanceof _s)
    return e;
  try {
    return new _s(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var cr = W0;
const Y0 = cr, z0 = (e, t) => {
  const r = Y0(e, t);
  return r ? r.version : null;
};
var X0 = z0;
const K0 = cr, J0 = (e, t) => {
  const r = K0(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var Q0 = J0;
const As = Ie, Z0 = (e, t, r, n, i) => {
  typeof r == "string" && (i = n, n = r, r = void 0);
  try {
    return new As(
      e instanceof As ? e.version : e,
      r
    ).inc(t, n, i).version;
  } catch {
    return null;
  }
};
var eE = Z0;
const Ts = cr, tE = (e, t) => {
  const r = Ts(e, null, !0), n = Ts(t, null, !0), i = r.compare(n);
  if (i === 0)
    return null;
  const o = i > 0, a = o ? r : n, s = o ? n : r, l = !!a.prerelease.length;
  if (!!s.prerelease.length && !l) {
    if (!s.patch && !s.minor)
      return "major";
    if (s.compareMain(a) === 0)
      return s.minor && !s.patch ? "minor" : "patch";
  }
  const c = l ? "pre" : "";
  return r.major !== n.major ? c + "major" : r.minor !== n.minor ? c + "minor" : r.patch !== n.patch ? c + "patch" : "prerelease";
};
var rE = tE;
const nE = Ie, iE = (e, t) => new nE(e, t).major;
var oE = iE;
const aE = Ie, sE = (e, t) => new aE(e, t).minor;
var lE = sE;
const cE = Ie, uE = (e, t) => new cE(e, t).patch;
var fE = uE;
const dE = cr, hE = (e, t) => {
  const r = dE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var pE = hE;
const Ss = Ie, mE = (e, t, r) => new Ss(e, r).compare(new Ss(t, r));
var Ge = mE;
const gE = Ge, EE = (e, t, r) => gE(t, e, r);
var yE = EE;
const vE = Ge, wE = (e, t) => vE(e, t, !0);
var _E = wE;
const Cs = Ie, AE = (e, t, r) => {
  const n = new Cs(e, r), i = new Cs(t, r);
  return n.compare(i) || n.compareBuild(i);
};
var Yo = AE;
const TE = Yo, SE = (e, t) => e.sort((r, n) => TE(r, n, t));
var CE = SE;
const bE = Yo, RE = (e, t) => e.sort((r, n) => bE(n, r, t));
var OE = RE;
const IE = Ge, PE = (e, t, r) => IE(e, t, r) > 0;
var oi = PE;
const NE = Ge, DE = (e, t, r) => NE(e, t, r) < 0;
var zo = DE;
const $E = Ge, FE = (e, t, r) => $E(e, t, r) === 0;
var Su = FE;
const LE = Ge, xE = (e, t, r) => LE(e, t, r) !== 0;
var Cu = xE;
const UE = Ge, kE = (e, t, r) => UE(e, t, r) >= 0;
var Xo = kE;
const ME = Ge, BE = (e, t, r) => ME(e, t, r) <= 0;
var Ko = BE;
const jE = Su, HE = Cu, GE = oi, qE = Xo, VE = zo, WE = Ko, YE = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return jE(e, r, n);
    case "!=":
      return HE(e, r, n);
    case ">":
      return GE(e, r, n);
    case ">=":
      return qE(e, r, n);
    case "<":
      return VE(e, r, n);
    case "<=":
      return WE(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var bu = YE;
const zE = Ie, XE = cr, { safeRe: An, t: Tn } = Kr, KE = (e, t) => {
  if (e instanceof zE)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? An[Tn.COERCEFULL] : An[Tn.COERCE]);
  else {
    const l = t.includePrerelease ? An[Tn.COERCERTLFULL] : An[Tn.COERCERTL];
    let h;
    for (; (h = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || h.index + h[0].length !== r.index + r[0].length) && (r = h), l.lastIndex = h.index + h[1].length + h[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], i = r[3] || "0", o = r[4] || "0", a = t.includePrerelease && r[5] ? `-${r[5]}` : "", s = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return XE(`${n}.${i}.${o}${a}${s}`, t);
};
var JE = KE;
class QE {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const i = this.map.keys().next().value;
        this.delete(i);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var ZE = QE, ki, bs;
function qe() {
  if (bs) return ki;
  bs = 1;
  const e = /\s+/g;
  class t {
    constructor(R, N) {
      if (N = i(N), R instanceof t)
        return R.loose === !!N.loose && R.includePrerelease === !!N.includePrerelease ? R : new t(R.raw, N);
      if (R instanceof o)
        return this.raw = R.value, this.set = [[R]], this.formatted = void 0, this;
      if (this.options = N, this.loose = !!N.loose, this.includePrerelease = !!N.includePrerelease, this.raw = R.trim().replace(e, " "), this.set = this.raw.split("||").map((b) => this.parseRange(b.trim())).filter((b) => b.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const b = this.set[0];
        if (this.set = this.set.filter(($) => !y($[0])), this.set.length === 0)
          this.set = [b];
        else if (this.set.length > 1) {
          for (const $ of this.set)
            if ($.length === 1 && A($[0])) {
              this.set = [$];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let R = 0; R < this.set.length; R++) {
          R > 0 && (this.formatted += "||");
          const N = this.set[R];
          for (let b = 0; b < N.length; b++)
            b > 0 && (this.formatted += " "), this.formatted += N[b].toString().trim();
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
    parseRange(R) {
      const b = ((this.options.includePrerelease && m) | (this.options.loose && v)) + ":" + R, $ = n.get(b);
      if ($)
        return $;
      const P = this.options.loose, k = P ? l[h.HYPHENRANGELOOSE] : l[h.HYPHENRANGE];
      R = R.replace(k, M(this.options.includePrerelease)), a("hyphen replace", R), R = R.replace(l[h.COMPARATORTRIM], c), a("comparator trim", R), R = R.replace(l[h.TILDETRIM], f), a("tilde trim", R), R = R.replace(l[h.CARETTRIM], g), a("caret trim", R);
      let q = R.split(" ").map((U) => S(U, this.options)).join(" ").split(/\s+/).map((U) => B(U, this.options));
      P && (q = q.filter((U) => (a("loose invalid filter", U, this.options), !!U.match(l[h.COMPARATORLOOSE])))), a("range list", q);
      const j = /* @__PURE__ */ new Map(), X = q.map((U) => new o(U, this.options));
      for (const U of X) {
        if (y(U))
          return [U];
        j.set(U.value, U);
      }
      j.size > 1 && j.has("") && j.delete("");
      const fe = [...j.values()];
      return n.set(b, fe), fe;
    }
    intersects(R, N) {
      if (!(R instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((b) => T(b, N) && R.set.some(($) => T($, N) && b.every((P) => $.every((k) => P.intersects(k, N)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(R) {
      if (!R)
        return !1;
      if (typeof R == "string")
        try {
          R = new s(R, this.options);
        } catch {
          return !1;
        }
      for (let N = 0; N < this.set.length; N++)
        if (z(this.set[N], R, this.options))
          return !0;
      return !1;
    }
  }
  ki = t;
  const r = ZE, n = new r(), i = Wo, o = ai(), a = ii, s = Ie, {
    safeRe: l,
    t: h,
    comparatorTrimReplace: c,
    tildeTrimReplace: f,
    caretTrimReplace: g
  } = Kr, { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: v } = ni, y = (I) => I.value === "<0.0.0-0", A = (I) => I.value === "", T = (I, R) => {
    let N = !0;
    const b = I.slice();
    let $ = b.pop();
    for (; N && b.length; )
      N = b.every((P) => $.intersects(P, R)), $ = b.pop();
    return N;
  }, S = (I, R) => (I = I.replace(l[h.BUILD], ""), a("comp", I, R), I = oe(I, R), a("caret", I), I = L(I, R), a("tildes", I), I = $e(I, R), a("xrange", I), I = G(I, R), a("stars", I), I), D = (I) => !I || I.toLowerCase() === "x" || I === "*", L = (I, R) => I.trim().split(/\s+/).map((N) => Z(N, R)).join(" "), Z = (I, R) => {
    const N = R.loose ? l[h.TILDELOOSE] : l[h.TILDE];
    return I.replace(N, (b, $, P, k, q) => {
      a("tilde", I, b, $, P, k, q);
      let j;
      return D($) ? j = "" : D(P) ? j = `>=${$}.0.0 <${+$ + 1}.0.0-0` : D(k) ? j = `>=${$}.${P}.0 <${$}.${+P + 1}.0-0` : q ? (a("replaceTilde pr", q), j = `>=${$}.${P}.${k}-${q} <${$}.${+P + 1}.0-0`) : j = `>=${$}.${P}.${k} <${$}.${+P + 1}.0-0`, a("tilde return", j), j;
    });
  }, oe = (I, R) => I.trim().split(/\s+/).map((N) => W(N, R)).join(" "), W = (I, R) => {
    a("caret", I, R);
    const N = R.loose ? l[h.CARETLOOSE] : l[h.CARET], b = R.includePrerelease ? "-0" : "";
    return I.replace(N, ($, P, k, q, j) => {
      a("caret", I, $, P, k, q, j);
      let X;
      return D(P) ? X = "" : D(k) ? X = `>=${P}.0.0${b} <${+P + 1}.0.0-0` : D(q) ? P === "0" ? X = `>=${P}.${k}.0${b} <${P}.${+k + 1}.0-0` : X = `>=${P}.${k}.0${b} <${+P + 1}.0.0-0` : j ? (a("replaceCaret pr", j), P === "0" ? k === "0" ? X = `>=${P}.${k}.${q}-${j} <${P}.${k}.${+q + 1}-0` : X = `>=${P}.${k}.${q}-${j} <${P}.${+k + 1}.0-0` : X = `>=${P}.${k}.${q}-${j} <${+P + 1}.0.0-0`) : (a("no pr"), P === "0" ? k === "0" ? X = `>=${P}.${k}.${q}${b} <${P}.${k}.${+q + 1}-0` : X = `>=${P}.${k}.${q}${b} <${P}.${+k + 1}.0-0` : X = `>=${P}.${k}.${q} <${+P + 1}.0.0-0`), a("caret return", X), X;
    });
  }, $e = (I, R) => (a("replaceXRanges", I, R), I.split(/\s+/).map((N) => E(N, R)).join(" ")), E = (I, R) => {
    I = I.trim();
    const N = R.loose ? l[h.XRANGELOOSE] : l[h.XRANGE];
    return I.replace(N, (b, $, P, k, q, j) => {
      a("xRange", I, b, $, P, k, q, j);
      const X = D(P), fe = X || D(k), U = fe || D(q), We = U;
      return $ === "=" && We && ($ = ""), j = R.includePrerelease ? "-0" : "", X ? $ === ">" || $ === "<" ? b = "<0.0.0-0" : b = "*" : $ && We ? (fe && (k = 0), q = 0, $ === ">" ? ($ = ">=", fe ? (P = +P + 1, k = 0, q = 0) : (k = +k + 1, q = 0)) : $ === "<=" && ($ = "<", fe ? P = +P + 1 : k = +k + 1), $ === "<" && (j = "-0"), b = `${$ + P}.${k}.${q}${j}`) : fe ? b = `>=${P}.0.0${j} <${+P + 1}.0.0-0` : U && (b = `>=${P}.${k}.0${j} <${P}.${+k + 1}.0-0`), a("xRange return", b), b;
    });
  }, G = (I, R) => (a("replaceStars", I, R), I.trim().replace(l[h.STAR], "")), B = (I, R) => (a("replaceGTE0", I, R), I.trim().replace(l[R.includePrerelease ? h.GTE0PRE : h.GTE0], "")), M = (I) => (R, N, b, $, P, k, q, j, X, fe, U, We) => (D(b) ? N = "" : D($) ? N = `>=${b}.0.0${I ? "-0" : ""}` : D(P) ? N = `>=${b}.${$}.0${I ? "-0" : ""}` : k ? N = `>=${N}` : N = `>=${N}${I ? "-0" : ""}`, D(X) ? j = "" : D(fe) ? j = `<${+X + 1}.0.0-0` : D(U) ? j = `<${X}.${+fe + 1}.0-0` : We ? j = `<=${X}.${fe}.${U}-${We}` : I ? j = `<${X}.${fe}.${+U + 1}-0` : j = `<=${j}`, `${N} ${j}`.trim()), z = (I, R, N) => {
    for (let b = 0; b < I.length; b++)
      if (!I[b].test(R))
        return !1;
    if (R.prerelease.length && !N.includePrerelease) {
      for (let b = 0; b < I.length; b++)
        if (a(I[b].semver), I[b].semver !== o.ANY && I[b].semver.prerelease.length > 0) {
          const $ = I[b].semver;
          if ($.major === R.major && $.minor === R.minor && $.patch === R.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return ki;
}
var Mi, Rs;
function ai() {
  if (Rs) return Mi;
  Rs = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, f) {
      if (f = r(f), c instanceof t) {
        if (c.loose === !!f.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), a("comparator", c, f), this.options = f, this.loose = !!f.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, a("comp", this);
    }
    parse(c) {
      const f = this.options.loose ? n[i.COMPARATORLOOSE] : n[i.COMPARATOR], g = c.match(f);
      if (!g)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = g[1] !== void 0 ? g[1] : "", this.operator === "=" && (this.operator = ""), g[2] ? this.semver = new s(g[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (a("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new s(c, this.options);
        } catch {
          return !1;
        }
      return o(c, this.operator, this.semver, this.options);
    }
    intersects(c, f) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(c.value, f).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new l(this.value, f).test(c.semver) : (f = r(f), f.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || o(this.semver, "<", c.semver, f) && this.operator.startsWith(">") && c.operator.startsWith("<") || o(this.semver, ">", c.semver, f) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  Mi = t;
  const r = Wo, { safeRe: n, t: i } = Kr, o = bu, a = ii, s = Ie, l = qe();
  return Mi;
}
const ey = qe(), ty = (e, t, r) => {
  try {
    t = new ey(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var si = ty;
const ry = qe(), ny = (e, t) => new ry(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var iy = ny;
const oy = Ie, ay = qe(), sy = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new ay(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || i.compare(a) === -1) && (n = a, i = new oy(n, r));
  }), n;
};
var ly = sy;
const cy = Ie, uy = qe(), fy = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new uy(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || i.compare(a) === 1) && (n = a, i = new cy(n, r));
  }), n;
};
var dy = fy;
const Bi = Ie, hy = qe(), Os = oi, py = (e, t) => {
  e = new hy(e, t);
  let r = new Bi("0.0.0");
  if (e.test(r) || (r = new Bi("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const i = e.set[n];
    let o = null;
    i.forEach((a) => {
      const s = new Bi(a.semver.version);
      switch (a.operator) {
        case ">":
          s.prerelease.length === 0 ? s.patch++ : s.prerelease.push(0), s.raw = s.format();
        case "":
        case ">=":
          (!o || Os(s, o)) && (o = s);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${a.operator}`);
      }
    }), o && (!r || Os(r, o)) && (r = o);
  }
  return r && e.test(r) ? r : null;
};
var my = py;
const gy = qe(), Ey = (e, t) => {
  try {
    return new gy(e, t).range || "*";
  } catch {
    return null;
  }
};
var yy = Ey;
const vy = Ie, Ru = ai(), { ANY: wy } = Ru, _y = qe(), Ay = si, Is = oi, Ps = zo, Ty = Ko, Sy = Xo, Cy = (e, t, r, n) => {
  e = new vy(e, n), t = new _y(t, n);
  let i, o, a, s, l;
  switch (r) {
    case ">":
      i = Is, o = Ty, a = Ps, s = ">", l = ">=";
      break;
    case "<":
      i = Ps, o = Sy, a = Is, s = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (Ay(e, t, n))
    return !1;
  for (let h = 0; h < t.set.length; ++h) {
    const c = t.set[h];
    let f = null, g = null;
    if (c.forEach((m) => {
      m.semver === wy && (m = new Ru(">=0.0.0")), f = f || m, g = g || m, i(m.semver, f.semver, n) ? f = m : a(m.semver, g.semver, n) && (g = m);
    }), f.operator === s || f.operator === l || (!g.operator || g.operator === s) && o(e, g.semver))
      return !1;
    if (g.operator === l && a(e, g.semver))
      return !1;
  }
  return !0;
};
var Jo = Cy;
const by = Jo, Ry = (e, t, r) => by(e, t, ">", r);
var Oy = Ry;
const Iy = Jo, Py = (e, t, r) => Iy(e, t, "<", r);
var Ny = Py;
const Ns = qe(), Dy = (e, t, r) => (e = new Ns(e, r), t = new Ns(t, r), e.intersects(t, r));
var $y = Dy;
const Fy = si, Ly = Ge;
var xy = (e, t, r) => {
  const n = [];
  let i = null, o = null;
  const a = e.sort((c, f) => Ly(c, f, r));
  for (const c of a)
    Fy(c, t, r) ? (o = c, i || (i = c)) : (o && n.push([i, o]), o = null, i = null);
  i && n.push([i, null]);
  const s = [];
  for (const [c, f] of n)
    c === f ? s.push(c) : !f && c === a[0] ? s.push("*") : f ? c === a[0] ? s.push(`<=${f}`) : s.push(`${c} - ${f}`) : s.push(`>=${c}`);
  const l = s.join(" || "), h = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < h.length ? l : t;
};
const Ds = qe(), Qo = ai(), { ANY: ji } = Qo, yr = si, Zo = Ge, Uy = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new Ds(e, r), t = new Ds(t, r);
  let n = !1;
  e: for (const i of e.set) {
    for (const o of t.set) {
      const a = My(i, o, r);
      if (n = n || a !== null, a)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, ky = [new Qo(">=0.0.0-0")], $s = [new Qo(">=0.0.0")], My = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === ji) {
    if (t.length === 1 && t[0].semver === ji)
      return !0;
    r.includePrerelease ? e = ky : e = $s;
  }
  if (t.length === 1 && t[0].semver === ji) {
    if (r.includePrerelease)
      return !0;
    t = $s;
  }
  const n = /* @__PURE__ */ new Set();
  let i, o;
  for (const m of e)
    m.operator === ">" || m.operator === ">=" ? i = Fs(i, m, r) : m.operator === "<" || m.operator === "<=" ? o = Ls(o, m, r) : n.add(m.semver);
  if (n.size > 1)
    return null;
  let a;
  if (i && o) {
    if (a = Zo(i.semver, o.semver, r), a > 0)
      return null;
    if (a === 0 && (i.operator !== ">=" || o.operator !== "<="))
      return null;
  }
  for (const m of n) {
    if (i && !yr(m, String(i), r) || o && !yr(m, String(o), r))
      return null;
    for (const v of t)
      if (!yr(m, String(v), r))
        return !1;
    return !0;
  }
  let s, l, h, c, f = o && !r.includePrerelease && o.semver.prerelease.length ? o.semver : !1, g = i && !r.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
  f && f.prerelease.length === 1 && o.operator === "<" && f.prerelease[0] === 0 && (f = !1);
  for (const m of t) {
    if (c = c || m.operator === ">" || m.operator === ">=", h = h || m.operator === "<" || m.operator === "<=", i) {
      if (g && m.semver.prerelease && m.semver.prerelease.length && m.semver.major === g.major && m.semver.minor === g.minor && m.semver.patch === g.patch && (g = !1), m.operator === ">" || m.operator === ">=") {
        if (s = Fs(i, m, r), s === m && s !== i)
          return !1;
      } else if (i.operator === ">=" && !yr(i.semver, String(m), r))
        return !1;
    }
    if (o) {
      if (f && m.semver.prerelease && m.semver.prerelease.length && m.semver.major === f.major && m.semver.minor === f.minor && m.semver.patch === f.patch && (f = !1), m.operator === "<" || m.operator === "<=") {
        if (l = Ls(o, m, r), l === m && l !== o)
          return !1;
      } else if (o.operator === "<=" && !yr(o.semver, String(m), r))
        return !1;
    }
    if (!m.operator && (o || i) && a !== 0)
      return !1;
  }
  return !(i && h && !o && a !== 0 || o && c && !i && a !== 0 || g || f);
}, Fs = (e, t, r) => {
  if (!e)
    return t;
  const n = Zo(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Ls = (e, t, r) => {
  if (!e)
    return t;
  const n = Zo(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var By = Uy;
const Hi = Kr, xs = ni, jy = Ie, Us = Tu, Hy = cr, Gy = X0, qy = Q0, Vy = eE, Wy = rE, Yy = oE, zy = lE, Xy = fE, Ky = pE, Jy = Ge, Qy = yE, Zy = _E, ev = Yo, tv = CE, rv = OE, nv = oi, iv = zo, ov = Su, av = Cu, sv = Xo, lv = Ko, cv = bu, uv = JE, fv = ai(), dv = qe(), hv = si, pv = iy, mv = ly, gv = dy, Ev = my, yv = yy, vv = Jo, wv = Oy, _v = Ny, Av = $y, Tv = xy, Sv = By;
var Ou = {
  parse: Hy,
  valid: Gy,
  clean: qy,
  inc: Vy,
  diff: Wy,
  major: Yy,
  minor: zy,
  patch: Xy,
  prerelease: Ky,
  compare: Jy,
  rcompare: Qy,
  compareLoose: Zy,
  compareBuild: ev,
  sort: tv,
  rsort: rv,
  gt: nv,
  lt: iv,
  eq: ov,
  neq: av,
  gte: sv,
  lte: lv,
  cmp: cv,
  coerce: uv,
  Comparator: fv,
  Range: dv,
  satisfies: hv,
  toComparators: pv,
  maxSatisfying: mv,
  minSatisfying: gv,
  minVersion: Ev,
  validRange: yv,
  outside: vv,
  gtr: wv,
  ltr: _v,
  intersects: Av,
  simplifyRange: Tv,
  subset: Sv,
  SemVer: jy,
  re: Hi.re,
  src: Hi.src,
  tokens: Hi.t,
  SEMVER_SPEC_VERSION: xs.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: xs.RELEASE_TYPES,
  compareIdentifiers: Us.compareIdentifiers,
  rcompareIdentifiers: Us.rcompareIdentifiers
}, Jr = {}, Gn = { exports: {} };
Gn.exports;
(function(e, t) {
  var r = 200, n = "__lodash_hash_undefined__", i = 1, o = 2, a = 9007199254740991, s = "[object Arguments]", l = "[object Array]", h = "[object AsyncFunction]", c = "[object Boolean]", f = "[object Date]", g = "[object Error]", m = "[object Function]", v = "[object GeneratorFunction]", y = "[object Map]", A = "[object Number]", T = "[object Null]", S = "[object Object]", D = "[object Promise]", L = "[object Proxy]", Z = "[object RegExp]", oe = "[object Set]", W = "[object String]", $e = "[object Symbol]", E = "[object Undefined]", G = "[object WeakMap]", B = "[object ArrayBuffer]", M = "[object DataView]", z = "[object Float32Array]", I = "[object Float64Array]", R = "[object Int8Array]", N = "[object Int16Array]", b = "[object Int32Array]", $ = "[object Uint8Array]", P = "[object Uint8ClampedArray]", k = "[object Uint16Array]", q = "[object Uint32Array]", j = /[\\^$.*+?()[\]{}|]/g, X = /^\[object .+?Constructor\]$/, fe = /^(?:0|[1-9]\d*)$/, U = {};
  U[z] = U[I] = U[R] = U[N] = U[b] = U[$] = U[P] = U[k] = U[q] = !0, U[s] = U[l] = U[B] = U[c] = U[M] = U[f] = U[g] = U[m] = U[y] = U[A] = U[S] = U[Z] = U[oe] = U[W] = U[G] = !1;
  var We = typeof Se == "object" && Se && Se.Object === Object && Se, d = typeof self == "object" && self && self.Object === Object && self, u = We || d || Function("return this")(), C = t && !t.nodeType && t, _ = C && !0 && e && !e.nodeType && e, Y = _ && _.exports === C, J = Y && We.process, ne = function() {
    try {
      return J && J.binding && J.binding("util");
    } catch {
    }
  }(), pe = ne && ne.isTypedArray;
  function ve(p, w) {
    for (var O = -1, F = p == null ? 0 : p.length, Q = 0, H = []; ++O < F; ) {
      var ie = p[O];
      w(ie, O, p) && (H[Q++] = ie);
    }
    return H;
  }
  function rt(p, w) {
    for (var O = -1, F = w.length, Q = p.length; ++O < F; )
      p[Q + O] = w[O];
    return p;
  }
  function le(p, w) {
    for (var O = -1, F = p == null ? 0 : p.length; ++O < F; )
      if (w(p[O], O, p))
        return !0;
    return !1;
  }
  function ke(p, w) {
    for (var O = -1, F = Array(p); ++O < p; )
      F[O] = w(O);
    return F;
  }
  function Ei(p) {
    return function(w) {
      return p(w);
    };
  }
  function tn(p, w) {
    return p.has(w);
  }
  function dr(p, w) {
    return p == null ? void 0 : p[w];
  }
  function rn(p) {
    var w = -1, O = Array(p.size);
    return p.forEach(function(F, Q) {
      O[++w] = [Q, F];
    }), O;
  }
  function Vu(p, w) {
    return function(O) {
      return p(w(O));
    };
  }
  function Wu(p) {
    var w = -1, O = Array(p.size);
    return p.forEach(function(F) {
      O[++w] = F;
    }), O;
  }
  var Yu = Array.prototype, zu = Function.prototype, nn = Object.prototype, yi = u["__core-js_shared__"], sa = zu.toString, Ye = nn.hasOwnProperty, la = function() {
    var p = /[^.]+$/.exec(yi && yi.keys && yi.keys.IE_PROTO || "");
    return p ? "Symbol(src)_1." + p : "";
  }(), ca = nn.toString, Xu = RegExp(
    "^" + sa.call(Ye).replace(j, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), ua = Y ? u.Buffer : void 0, on = u.Symbol, fa = u.Uint8Array, da = nn.propertyIsEnumerable, Ku = Yu.splice, Tt = on ? on.toStringTag : void 0, ha = Object.getOwnPropertySymbols, Ju = ua ? ua.isBuffer : void 0, Qu = Vu(Object.keys, Object), vi = jt(u, "DataView"), hr = jt(u, "Map"), wi = jt(u, "Promise"), _i = jt(u, "Set"), Ai = jt(u, "WeakMap"), pr = jt(Object, "create"), Zu = bt(vi), ef = bt(hr), tf = bt(wi), rf = bt(_i), nf = bt(Ai), pa = on ? on.prototype : void 0, Ti = pa ? pa.valueOf : void 0;
  function St(p) {
    var w = -1, O = p == null ? 0 : p.length;
    for (this.clear(); ++w < O; ) {
      var F = p[w];
      this.set(F[0], F[1]);
    }
  }
  function of() {
    this.__data__ = pr ? pr(null) : {}, this.size = 0;
  }
  function af(p) {
    var w = this.has(p) && delete this.__data__[p];
    return this.size -= w ? 1 : 0, w;
  }
  function sf(p) {
    var w = this.__data__;
    if (pr) {
      var O = w[p];
      return O === n ? void 0 : O;
    }
    return Ye.call(w, p) ? w[p] : void 0;
  }
  function lf(p) {
    var w = this.__data__;
    return pr ? w[p] !== void 0 : Ye.call(w, p);
  }
  function cf(p, w) {
    var O = this.__data__;
    return this.size += this.has(p) ? 0 : 1, O[p] = pr && w === void 0 ? n : w, this;
  }
  St.prototype.clear = of, St.prototype.delete = af, St.prototype.get = sf, St.prototype.has = lf, St.prototype.set = cf;
  function Qe(p) {
    var w = -1, O = p == null ? 0 : p.length;
    for (this.clear(); ++w < O; ) {
      var F = p[w];
      this.set(F[0], F[1]);
    }
  }
  function uf() {
    this.__data__ = [], this.size = 0;
  }
  function ff(p) {
    var w = this.__data__, O = sn(w, p);
    if (O < 0)
      return !1;
    var F = w.length - 1;
    return O == F ? w.pop() : Ku.call(w, O, 1), --this.size, !0;
  }
  function df(p) {
    var w = this.__data__, O = sn(w, p);
    return O < 0 ? void 0 : w[O][1];
  }
  function hf(p) {
    return sn(this.__data__, p) > -1;
  }
  function pf(p, w) {
    var O = this.__data__, F = sn(O, p);
    return F < 0 ? (++this.size, O.push([p, w])) : O[F][1] = w, this;
  }
  Qe.prototype.clear = uf, Qe.prototype.delete = ff, Qe.prototype.get = df, Qe.prototype.has = hf, Qe.prototype.set = pf;
  function Ct(p) {
    var w = -1, O = p == null ? 0 : p.length;
    for (this.clear(); ++w < O; ) {
      var F = p[w];
      this.set(F[0], F[1]);
    }
  }
  function mf() {
    this.size = 0, this.__data__ = {
      hash: new St(),
      map: new (hr || Qe)(),
      string: new St()
    };
  }
  function gf(p) {
    var w = ln(this, p).delete(p);
    return this.size -= w ? 1 : 0, w;
  }
  function Ef(p) {
    return ln(this, p).get(p);
  }
  function yf(p) {
    return ln(this, p).has(p);
  }
  function vf(p, w) {
    var O = ln(this, p), F = O.size;
    return O.set(p, w), this.size += O.size == F ? 0 : 1, this;
  }
  Ct.prototype.clear = mf, Ct.prototype.delete = gf, Ct.prototype.get = Ef, Ct.prototype.has = yf, Ct.prototype.set = vf;
  function an(p) {
    var w = -1, O = p == null ? 0 : p.length;
    for (this.__data__ = new Ct(); ++w < O; )
      this.add(p[w]);
  }
  function wf(p) {
    return this.__data__.set(p, n), this;
  }
  function _f(p) {
    return this.__data__.has(p);
  }
  an.prototype.add = an.prototype.push = wf, an.prototype.has = _f;
  function nt(p) {
    var w = this.__data__ = new Qe(p);
    this.size = w.size;
  }
  function Af() {
    this.__data__ = new Qe(), this.size = 0;
  }
  function Tf(p) {
    var w = this.__data__, O = w.delete(p);
    return this.size = w.size, O;
  }
  function Sf(p) {
    return this.__data__.get(p);
  }
  function Cf(p) {
    return this.__data__.has(p);
  }
  function bf(p, w) {
    var O = this.__data__;
    if (O instanceof Qe) {
      var F = O.__data__;
      if (!hr || F.length < r - 1)
        return F.push([p, w]), this.size = ++O.size, this;
      O = this.__data__ = new Ct(F);
    }
    return O.set(p, w), this.size = O.size, this;
  }
  nt.prototype.clear = Af, nt.prototype.delete = Tf, nt.prototype.get = Sf, nt.prototype.has = Cf, nt.prototype.set = bf;
  function Rf(p, w) {
    var O = cn(p), F = !O && Hf(p), Q = !O && !F && Si(p), H = !O && !F && !Q && Ta(p), ie = O || F || Q || H, de = ie ? ke(p.length, String) : [], me = de.length;
    for (var te in p)
      Ye.call(p, te) && !(ie && // Safari 9 has enumerable `arguments.length` in strict mode.
      (te == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      Q && (te == "offset" || te == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      H && (te == "buffer" || te == "byteLength" || te == "byteOffset") || // Skip index properties.
      Uf(te, me))) && de.push(te);
    return de;
  }
  function sn(p, w) {
    for (var O = p.length; O--; )
      if (va(p[O][0], w))
        return O;
    return -1;
  }
  function Of(p, w, O) {
    var F = w(p);
    return cn(p) ? F : rt(F, O(p));
  }
  function mr(p) {
    return p == null ? p === void 0 ? E : T : Tt && Tt in Object(p) ? Lf(p) : jf(p);
  }
  function ma(p) {
    return gr(p) && mr(p) == s;
  }
  function ga(p, w, O, F, Q) {
    return p === w ? !0 : p == null || w == null || !gr(p) && !gr(w) ? p !== p && w !== w : If(p, w, O, F, ga, Q);
  }
  function If(p, w, O, F, Q, H) {
    var ie = cn(p), de = cn(w), me = ie ? l : it(p), te = de ? l : it(w);
    me = me == s ? S : me, te = te == s ? S : te;
    var Fe = me == S, Me = te == S, we = me == te;
    if (we && Si(p)) {
      if (!Si(w))
        return !1;
      ie = !0, Fe = !1;
    }
    if (we && !Fe)
      return H || (H = new nt()), ie || Ta(p) ? Ea(p, w, O, F, Q, H) : $f(p, w, me, O, F, Q, H);
    if (!(O & i)) {
      var Le = Fe && Ye.call(p, "__wrapped__"), xe = Me && Ye.call(w, "__wrapped__");
      if (Le || xe) {
        var ot = Le ? p.value() : p, Ze = xe ? w.value() : w;
        return H || (H = new nt()), Q(ot, Ze, O, F, H);
      }
    }
    return we ? (H || (H = new nt()), Ff(p, w, O, F, Q, H)) : !1;
  }
  function Pf(p) {
    if (!Aa(p) || Mf(p))
      return !1;
    var w = wa(p) ? Xu : X;
    return w.test(bt(p));
  }
  function Nf(p) {
    return gr(p) && _a(p.length) && !!U[mr(p)];
  }
  function Df(p) {
    if (!Bf(p))
      return Qu(p);
    var w = [];
    for (var O in Object(p))
      Ye.call(p, O) && O != "constructor" && w.push(O);
    return w;
  }
  function Ea(p, w, O, F, Q, H) {
    var ie = O & i, de = p.length, me = w.length;
    if (de != me && !(ie && me > de))
      return !1;
    var te = H.get(p);
    if (te && H.get(w))
      return te == w;
    var Fe = -1, Me = !0, we = O & o ? new an() : void 0;
    for (H.set(p, w), H.set(w, p); ++Fe < de; ) {
      var Le = p[Fe], xe = w[Fe];
      if (F)
        var ot = ie ? F(xe, Le, Fe, w, p, H) : F(Le, xe, Fe, p, w, H);
      if (ot !== void 0) {
        if (ot)
          continue;
        Me = !1;
        break;
      }
      if (we) {
        if (!le(w, function(Ze, Rt) {
          if (!tn(we, Rt) && (Le === Ze || Q(Le, Ze, O, F, H)))
            return we.push(Rt);
        })) {
          Me = !1;
          break;
        }
      } else if (!(Le === xe || Q(Le, xe, O, F, H))) {
        Me = !1;
        break;
      }
    }
    return H.delete(p), H.delete(w), Me;
  }
  function $f(p, w, O, F, Q, H, ie) {
    switch (O) {
      case M:
        if (p.byteLength != w.byteLength || p.byteOffset != w.byteOffset)
          return !1;
        p = p.buffer, w = w.buffer;
      case B:
        return !(p.byteLength != w.byteLength || !H(new fa(p), new fa(w)));
      case c:
      case f:
      case A:
        return va(+p, +w);
      case g:
        return p.name == w.name && p.message == w.message;
      case Z:
      case W:
        return p == w + "";
      case y:
        var de = rn;
      case oe:
        var me = F & i;
        if (de || (de = Wu), p.size != w.size && !me)
          return !1;
        var te = ie.get(p);
        if (te)
          return te == w;
        F |= o, ie.set(p, w);
        var Fe = Ea(de(p), de(w), F, Q, H, ie);
        return ie.delete(p), Fe;
      case $e:
        if (Ti)
          return Ti.call(p) == Ti.call(w);
    }
    return !1;
  }
  function Ff(p, w, O, F, Q, H) {
    var ie = O & i, de = ya(p), me = de.length, te = ya(w), Fe = te.length;
    if (me != Fe && !ie)
      return !1;
    for (var Me = me; Me--; ) {
      var we = de[Me];
      if (!(ie ? we in w : Ye.call(w, we)))
        return !1;
    }
    var Le = H.get(p);
    if (Le && H.get(w))
      return Le == w;
    var xe = !0;
    H.set(p, w), H.set(w, p);
    for (var ot = ie; ++Me < me; ) {
      we = de[Me];
      var Ze = p[we], Rt = w[we];
      if (F)
        var Sa = ie ? F(Rt, Ze, we, w, p, H) : F(Ze, Rt, we, p, w, H);
      if (!(Sa === void 0 ? Ze === Rt || Q(Ze, Rt, O, F, H) : Sa)) {
        xe = !1;
        break;
      }
      ot || (ot = we == "constructor");
    }
    if (xe && !ot) {
      var un = p.constructor, fn = w.constructor;
      un != fn && "constructor" in p && "constructor" in w && !(typeof un == "function" && un instanceof un && typeof fn == "function" && fn instanceof fn) && (xe = !1);
    }
    return H.delete(p), H.delete(w), xe;
  }
  function ya(p) {
    return Of(p, Vf, xf);
  }
  function ln(p, w) {
    var O = p.__data__;
    return kf(w) ? O[typeof w == "string" ? "string" : "hash"] : O.map;
  }
  function jt(p, w) {
    var O = dr(p, w);
    return Pf(O) ? O : void 0;
  }
  function Lf(p) {
    var w = Ye.call(p, Tt), O = p[Tt];
    try {
      p[Tt] = void 0;
      var F = !0;
    } catch {
    }
    var Q = ca.call(p);
    return F && (w ? p[Tt] = O : delete p[Tt]), Q;
  }
  var xf = ha ? function(p) {
    return p == null ? [] : (p = Object(p), ve(ha(p), function(w) {
      return da.call(p, w);
    }));
  } : Wf, it = mr;
  (vi && it(new vi(new ArrayBuffer(1))) != M || hr && it(new hr()) != y || wi && it(wi.resolve()) != D || _i && it(new _i()) != oe || Ai && it(new Ai()) != G) && (it = function(p) {
    var w = mr(p), O = w == S ? p.constructor : void 0, F = O ? bt(O) : "";
    if (F)
      switch (F) {
        case Zu:
          return M;
        case ef:
          return y;
        case tf:
          return D;
        case rf:
          return oe;
        case nf:
          return G;
      }
    return w;
  });
  function Uf(p, w) {
    return w = w ?? a, !!w && (typeof p == "number" || fe.test(p)) && p > -1 && p % 1 == 0 && p < w;
  }
  function kf(p) {
    var w = typeof p;
    return w == "string" || w == "number" || w == "symbol" || w == "boolean" ? p !== "__proto__" : p === null;
  }
  function Mf(p) {
    return !!la && la in p;
  }
  function Bf(p) {
    var w = p && p.constructor, O = typeof w == "function" && w.prototype || nn;
    return p === O;
  }
  function jf(p) {
    return ca.call(p);
  }
  function bt(p) {
    if (p != null) {
      try {
        return sa.call(p);
      } catch {
      }
      try {
        return p + "";
      } catch {
      }
    }
    return "";
  }
  function va(p, w) {
    return p === w || p !== p && w !== w;
  }
  var Hf = ma(/* @__PURE__ */ function() {
    return arguments;
  }()) ? ma : function(p) {
    return gr(p) && Ye.call(p, "callee") && !da.call(p, "callee");
  }, cn = Array.isArray;
  function Gf(p) {
    return p != null && _a(p.length) && !wa(p);
  }
  var Si = Ju || Yf;
  function qf(p, w) {
    return ga(p, w);
  }
  function wa(p) {
    if (!Aa(p))
      return !1;
    var w = mr(p);
    return w == m || w == v || w == h || w == L;
  }
  function _a(p) {
    return typeof p == "number" && p > -1 && p % 1 == 0 && p <= a;
  }
  function Aa(p) {
    var w = typeof p;
    return p != null && (w == "object" || w == "function");
  }
  function gr(p) {
    return p != null && typeof p == "object";
  }
  var Ta = pe ? Ei(pe) : Nf;
  function Vf(p) {
    return Gf(p) ? Rf(p) : Df(p);
  }
  function Wf() {
    return [];
  }
  function Yf() {
    return !1;
  }
  e.exports = qf;
})(Gn, Gn.exports);
var Cv = Gn.exports;
Object.defineProperty(Jr, "__esModule", { value: !0 });
Jr.DownloadedUpdateHelper = void 0;
Jr.createTempUpdateFile = Pv;
const bv = Hr, Rv = vt, ks = Cv, Ot = _t, Cr = ee;
class Ov {
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
    return Cr.join(this.cacheDir, "pending");
  }
  async validateDownloadedPath(t, r, n, i) {
    if (this.versionInfo != null && this.file === t && this.fileInfo != null)
      return ks(this.versionInfo, r) && ks(this.fileInfo.info, n.info) && await (0, Ot.pathExists)(t) ? t : null;
    const o = await this.getValidCachedUpdateFile(n, i);
    return o === null ? null : (i.info(`Update has already been downloaded to ${t}).`), this._file = o, o);
  }
  async setDownloadedFile(t, r, n, i, o, a) {
    this._file = t, this._packageFile = r, this.versionInfo = n, this.fileInfo = i, this._downloadedFileInfo = {
      fileName: o,
      sha512: i.info.sha512,
      isAdminRightsRequired: i.info.isAdminRightsRequired === !0
    }, a && await (0, Ot.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
  }
  async clear() {
    this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
  }
  async cleanCacheDirForPendingUpdate() {
    try {
      await (0, Ot.emptyDir)(this.cacheDirForPendingUpdate);
    } catch {
    }
  }
  /**
   * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
   * @param fileInfo
   * @param logger
   */
  async getValidCachedUpdateFile(t, r) {
    const n = this.getUpdateInfoFile();
    if (!await (0, Ot.pathExists)(n))
      return null;
    let o;
    try {
      o = await (0, Ot.readJson)(n);
    } catch (h) {
      let c = "No cached update info available";
      return h.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), c += ` (error on read: ${h.message})`), r.info(c), null;
    }
    if (!((o == null ? void 0 : o.fileName) !== null))
      return r.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
    if (t.info.sha512 !== o.sha512)
      return r.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${o.sha512}, expected: ${t.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
    const s = Cr.join(this.cacheDirForPendingUpdate, o.fileName);
    if (!await (0, Ot.pathExists)(s))
      return r.info("Cached update file doesn't exist"), null;
    const l = await Iv(s);
    return t.info.sha512 !== l ? (r.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${l}, expected: ${t.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = o, s);
  }
  getUpdateInfoFile() {
    return Cr.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
Jr.DownloadedUpdateHelper = Ov;
function Iv(e, t = "sha512", r = "base64", n) {
  return new Promise((i, o) => {
    const a = (0, bv.createHash)(t);
    a.on("error", o).setEncoding(r), (0, Rv.createReadStream)(e, {
      ...n,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", o).on("end", () => {
      a.end(), i(a.read());
    }).pipe(a, { end: !1 });
  });
}
async function Pv(e, t, r) {
  let n = 0, i = Cr.join(t, e);
  for (let o = 0; o < 3; o++)
    try {
      return await (0, Ot.unlink)(i), i;
    } catch (a) {
      if (a.code === "ENOENT")
        return i;
      r.warn(`Error on remove temp update file: ${a}`), i = Cr.join(t, `${n++}-${e}`);
    }
  return i;
}
var li = {}, ea = {};
Object.defineProperty(ea, "__esModule", { value: !0 });
ea.getAppCacheDir = Dv;
const Gi = ee, Nv = Yn;
function Dv() {
  const e = (0, Nv.homedir)();
  let t;
  return process.platform === "win32" ? t = process.env.LOCALAPPDATA || Gi.join(e, "AppData", "Local") : process.platform === "darwin" ? t = Gi.join(e, "Library", "Caches") : t = process.env.XDG_CACHE_HOME || Gi.join(e, ".cache"), t;
}
Object.defineProperty(li, "__esModule", { value: !0 });
li.ElectronAppAdapter = void 0;
const Ms = ee, $v = ea;
class Fv {
  constructor(t = Ft.app) {
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
    return this.isPackaged ? Ms.join(process.resourcesPath, "app-update.yml") : Ms.join(this.app.getAppPath(), "dev-app-update.yml");
  }
  get userDataPath() {
    return this.app.getPath("userData");
  }
  get baseCachePath() {
    return (0, $v.getAppCacheDir)();
  }
  quit() {
    this.app.quit();
  }
  relaunch() {
    this.app.relaunch();
  }
  onQuit(t) {
    this.app.once("quit", (r, n) => t(n));
  }
}
li.ElectronAppAdapter = Fv;
var Iu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = r;
  const t = ue;
  e.NET_SESSION_NAME = "electron-updater";
  function r() {
    return Ft.session.fromPartition(e.NET_SESSION_NAME, {
      cache: !1
    });
  }
  class n extends t.HttpExecutor {
    constructor(o) {
      super(), this.proxyLoginCallback = o, this.cachedSession = null;
    }
    async download(o, a, s) {
      return await s.cancellationToken.createPromise((l, h, c) => {
        const f = {
          headers: s.headers || void 0,
          redirect: "manual"
        };
        (0, t.configureRequestUrl)(o, f), (0, t.configureRequestOptions)(f), this.doDownload(f, {
          destination: a,
          options: s,
          onCancel: c,
          callback: (g) => {
            g == null ? l(a) : h(g);
          },
          responseHandler: null
        }, 0);
      });
    }
    createRequest(o, a) {
      o.headers && o.headers.Host && (o.host = o.headers.Host, delete o.headers.Host), this.cachedSession == null && (this.cachedSession = r());
      const s = Ft.net.request({
        ...o,
        session: this.cachedSession
      });
      return s.on("response", a), this.proxyLoginCallback != null && s.on("login", this.proxyLoginCallback), s;
    }
    addRedirectHandlers(o, a, s, l, h) {
      o.on("redirect", (c, f, g) => {
        o.abort(), l > this.maxRedirects ? s(this.createMaxRedirectError()) : h(t.HttpExecutor.prepareRedirectUrlOptions(g, a));
      });
    }
  }
  e.ElectronHttpExecutor = n;
})(Iu);
var Qr = {}, Ve = {};
Object.defineProperty(Ve, "__esModule", { value: !0 });
Ve.newBaseUrl = Lv;
Ve.newUrlFromBase = xv;
Ve.getChannelFilename = Uv;
const Pu = wt;
function Lv(e) {
  const t = new Pu.URL(e);
  return t.pathname.endsWith("/") || (t.pathname += "/"), t;
}
function xv(e, t, r = !1) {
  const n = new Pu.URL(e, t), i = t.search;
  return i != null && i.length !== 0 ? n.search = i : r && (n.search = `noCache=${Date.now().toString(32)}`), n;
}
function Uv(e) {
  return `${e}.yml`;
}
var se = {}, kv = "[object Symbol]", Nu = /[\\^$.*+?()[\]{}|]/g, Mv = RegExp(Nu.source), Bv = typeof Se == "object" && Se && Se.Object === Object && Se, jv = typeof self == "object" && self && self.Object === Object && self, Hv = Bv || jv || Function("return this")(), Gv = Object.prototype, qv = Gv.toString, Bs = Hv.Symbol, js = Bs ? Bs.prototype : void 0, Hs = js ? js.toString : void 0;
function Vv(e) {
  if (typeof e == "string")
    return e;
  if (Yv(e))
    return Hs ? Hs.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function Wv(e) {
  return !!e && typeof e == "object";
}
function Yv(e) {
  return typeof e == "symbol" || Wv(e) && qv.call(e) == kv;
}
function zv(e) {
  return e == null ? "" : Vv(e);
}
function Xv(e) {
  return e = zv(e), e && Mv.test(e) ? e.replace(Nu, "\\$&") : e;
}
var Du = Xv;
Object.defineProperty(se, "__esModule", { value: !0 });
se.Provider = void 0;
se.findFile = ew;
se.parseUpdateInfo = tw;
se.getFileList = $u;
se.resolveFiles = rw;
const Et = ue, Kv = ye, Jv = wt, qn = Ve, Qv = Du;
class Zv {
  constructor(t) {
    this.runtimeOptions = t, this.requestHeaders = null, this.executor = t.executor;
  }
  // By default, the blockmap file is in the same directory as the main file
  // But some providers may have a different blockmap file, so we need to override this method
  getBlockMapFiles(t, r, n, i = null) {
    const o = (0, qn.newUrlFromBase)(`${t.pathname}.blockmap`, t);
    return [(0, qn.newUrlFromBase)(`${t.pathname.replace(new RegExp(Qv(n), "g"), r)}.blockmap`, i ? new Jv.URL(i) : t), o];
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
  httpRequest(t, r, n) {
    return this.executor.request(this.createRequestOptions(t, r), n);
  }
  createRequestOptions(t, r) {
    const n = {};
    return this.requestHeaders == null ? r != null && (n.headers = r) : n.headers = r == null ? this.requestHeaders : { ...this.requestHeaders, ...r }, (0, Et.configureRequestUrl)(t, n), n;
  }
}
se.Provider = Zv;
function ew(e, t, r) {
  var n;
  if (e.length === 0)
    throw (0, Et.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
  const i = e.filter((a) => a.url.pathname.toLowerCase().endsWith(`.${t.toLowerCase()}`)), o = (n = i.find((a) => [a.url.pathname, a.info.url].some((s) => s.includes(process.arch)))) !== null && n !== void 0 ? n : i.shift();
  return o || (r == null ? e[0] : e.find((a) => !r.some((s) => a.url.pathname.toLowerCase().endsWith(`.${s.toLowerCase()}`))));
}
function tw(e, t, r) {
  if (e == null)
    throw (0, Et.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  let n;
  try {
    n = (0, Kv.load)(e);
  } catch (i) {
    throw (0, Et.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): ${i.stack || i.message}, rawData: ${e}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  }
  return n;
}
function $u(e) {
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
  throw (0, Et.newError)(`No files provided: ${(0, Et.safeStringifyJson)(e)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
}
function rw(e, t, r = (n) => n) {
  const i = $u(e).map((s) => {
    if (s.sha2 == null && s.sha512 == null)
      throw (0, Et.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, Et.safeStringifyJson)(s)}`, "ERR_UPDATER_NO_CHECKSUM");
    return {
      url: (0, qn.newUrlFromBase)(r(s.url), t),
      info: s
    };
  }), o = e.packages, a = o == null ? null : o[process.arch] || o.ia32;
  return a != null && (i[0].packageInfo = {
    ...a,
    path: (0, qn.newUrlFromBase)(r(a.path), t).href
  }), i;
}
Object.defineProperty(Qr, "__esModule", { value: !0 });
Qr.GenericProvider = void 0;
const Gs = ue, qi = Ve, Vi = se;
class nw extends Vi.Provider {
  constructor(t, r, n) {
    super(n), this.configuration = t, this.updater = r, this.baseUrl = (0, qi.newBaseUrl)(this.configuration.url);
  }
  get channel() {
    const t = this.updater.channel || this.configuration.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = (0, qi.getChannelFilename)(this.channel), r = (0, qi.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
    for (let n = 0; ; n++)
      try {
        return (0, Vi.parseUpdateInfo)(await this.httpRequest(r), t, r);
      } catch (i) {
        if (i instanceof Gs.HttpError && i.statusCode === 404)
          throw (0, Gs.newError)(`Cannot find channel "${t}" update info: ${i.stack || i.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        if (i.code === "ECONNREFUSED" && n < 3) {
          await new Promise((o, a) => {
            try {
              setTimeout(o, 1e3 * n);
            } catch (s) {
              a(s);
            }
          });
          continue;
        }
        throw i;
      }
  }
  resolveFiles(t) {
    return (0, Vi.resolveFiles)(t, this.baseUrl);
  }
}
Qr.GenericProvider = nw;
var ci = {}, ui = {};
Object.defineProperty(ui, "__esModule", { value: !0 });
ui.BitbucketProvider = void 0;
const qs = ue, Wi = Ve, Yi = se;
class iw extends Yi.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r;
    const { owner: i, slug: o } = t;
    this.baseUrl = (0, Wi.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${i}/${o}/downloads`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "latest";
  }
  async getLatestVersion() {
    const t = new qs.CancellationToken(), r = (0, Wi.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, Wi.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, void 0, t);
      return (0, Yi.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, qs.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, Yi.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { owner: t, slug: r } = this.configuration;
    return `Bitbucket (owner: ${t}, slug: ${r}, channel: ${this.channel})`;
  }
}
ui.BitbucketProvider = iw;
var yt = {};
Object.defineProperty(yt, "__esModule", { value: !0 });
yt.GitHubProvider = yt.BaseGitHubProvider = void 0;
yt.computeReleaseNotes = Lu;
const et = ue, Xe = Ou, ow = wt, Zt = Ve, _o = se, zi = /\/tag\/(v?[^/]+)$/;
class Fu extends _o.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      /* because GitHib uses S3 */
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.baseUrl = (0, Zt.newBaseUrl)((0, et.githubUrl)(t, r));
    const i = r === "github.com" ? "api.github.com" : r;
    this.baseApiUrl = (0, Zt.newBaseUrl)((0, et.githubUrl)(t, i));
  }
  computeGithubBasePath(t) {
    const r = this.options.host;
    return r && !["github.com", "api.github.com"].includes(r) ? `/api/v3${t}` : t;
  }
}
yt.BaseGitHubProvider = Fu;
class aw extends Fu {
  constructor(t, r, n) {
    super(t, "github.com", n), this.options = t, this.updater = r;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    var t, r, n, i, o;
    const a = new et.CancellationToken(), s = await this.httpRequest((0, Zt.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
      accept: "application/xml, application/atom+xml, text/xml, */*"
    }, a), l = (0, et.parseXml)(s);
    let h = l.element("entry", !1, "No published versions on GitHub"), c = null;
    try {
      if (this.updater.allowPrerelease) {
        const A = ((t = this.updater) === null || t === void 0 ? void 0 : t.channel) || ((r = Xe.prerelease(this.updater.currentVersion)) === null || r === void 0 ? void 0 : r[0]) || null;
        if (A === null)
          c = zi.exec(h.element("link").attribute("href"))[1];
        else
          for (const T of l.getElements("entry")) {
            const S = zi.exec(T.element("link").attribute("href"));
            if (S === null)
              continue;
            const D = S[1];
            if (!Xe.valid(D))
              continue;
            const L = ((n = Xe.prerelease(D)) === null || n === void 0 ? void 0 : n[0]) || null, Z = !A || ["alpha", "beta"].includes(A), oe = L !== null && !["alpha", "beta"].includes(String(L));
            if (Z && !oe && !(A === "beta" && L === "alpha")) {
              c = D, h = T;
              break;
            }
            if (L && L === A) {
              c = D, h = T;
              break;
            }
          }
      } else {
        c = await this.getLatestTagName(a);
        for (const A of l.getElements("entry")) {
          const T = zi.exec(A.element("link").attribute("href"));
          if (T != null && T[1] === c) {
            h = A;
            break;
          }
        }
      }
    } catch (A) {
      throw (0, et.newError)(`Cannot parse releases feed: ${A.stack || A.message},
XML:
${s}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
    }
    if (c == null)
      throw (0, et.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let f, g = "", m = "";
    const v = async (A) => {
      g = (0, Zt.getChannelFilename)(A), m = (0, Zt.newUrlFromBase)(this.getBaseDownloadPath(String(c), g), this.baseUrl);
      const T = this.createRequestOptions(m);
      try {
        return await this.executor.request(T, a);
      } catch (S) {
        throw S instanceof et.HttpError && S.statusCode === 404 ? (0, et.newError)(`Cannot find ${g} in the latest release artifacts (${m}): ${S.stack || S.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : S;
      }
    };
    try {
      let A = this.channel;
      this.updater.allowPrerelease && (!((i = Xe.prerelease(c)) === null || i === void 0) && i[0]) && (A = this.getCustomChannelName(String((o = Xe.prerelease(c)) === null || o === void 0 ? void 0 : o[0]))), f = await v(A);
    } catch (A) {
      if (this.updater.allowPrerelease)
        f = await v(this.getDefaultChannelName());
      else
        throw A;
    }
    const y = (0, _o.parseUpdateInfo)(f, g, m);
    return y.releaseName == null && (y.releaseName = h.elementValueOrEmpty("title")), y.releaseNotes == null && (y.releaseNotes = Lu(this.updater.currentVersion, this.updater.fullChangelog, l, h)), {
      tag: c,
      ...y
    };
  }
  async getLatestTagName(t) {
    const r = this.options, n = r.host == null || r.host === "github.com" ? (0, Zt.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new ow.URL(`${this.computeGithubBasePath(`/repos/${r.owner}/${r.repo}/releases`)}/latest`, this.baseApiUrl);
    try {
      const i = await this.httpRequest(n, { Accept: "application/json" }, t);
      return i == null ? null : JSON.parse(i).tag_name;
    } catch (i) {
      throw (0, et.newError)(`Unable to find latest version on GitHub (${n}), please ensure a production release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return `/${this.options.owner}/${this.options.repo}/releases`;
  }
  resolveFiles(t) {
    return (0, _o.resolveFiles)(t, this.baseUrl, (r) => this.getBaseDownloadPath(t.tag, r.replace(/ /g, "-")));
  }
  getBaseDownloadPath(t, r) {
    return `${this.basePath}/download/${t}/${r}`;
  }
}
yt.GitHubProvider = aw;
function Vs(e) {
  const t = e.elementValueOrEmpty("content");
  return t === "No content." ? "" : t;
}
function Lu(e, t, r, n) {
  if (!t)
    return Vs(n);
  const i = /\/tag\/v?([^/]+)$/;
  let o;
  try {
    o = i.exec(n.element("link").attribute("href"))[1], o = Xe.valid(o) ? o : void 0;
  } catch {
  }
  if (o == null)
    return null;
  const a = [];
  for (const s of r.getElements("entry")) {
    let l;
    try {
      const f = i.exec(s.element("link").attribute("href"));
      if (!f)
        continue;
      l = f[1];
    } catch {
      continue;
    }
    if (!Xe.valid(l))
      continue;
    const h = Xe.gt(l, e.raw), c = Xe.lte(l, o);
    h && c && a.push({
      version: l,
      note: Vs(s)
    });
  }
  return a.sort((s, l) => Xe.rcompare(s.version, l.version));
}
var fi = {};
Object.defineProperty(fi, "__esModule", { value: !0 });
fi.GitLabProvider = void 0;
const ge = ue, Xi = wt, sw = Du, Sn = Ve, Ki = se;
class lw extends Ki.Provider {
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
  constructor(t, r, n) {
    super({
      ...n,
      // GitLab might not support multiple range requests efficiently
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.updater = r, this.cachedLatestVersion = null;
    const o = t.host || "gitlab.com";
    this.baseApiUrl = (0, Sn.newBaseUrl)(`https://${o}/api/v4`);
  }
  createRequestOptions(t, r) {
    const n = super.createRequestOptions(t, r);
    return n.redirect = "manual", n;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = new ge.CancellationToken(), r = (0, Sn.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl), n = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) };
    let i;
    try {
      i = await this.httpRequest(r, n, t);
    } catch (m) {
      throw (0, ge.newError)(`Unable to find latest release on GitLab (${r}): ${m.stack || m.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    if (!i)
      throw (0, ge.newError)("No published releases on GitLab", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let o;
    try {
      o = JSON.parse(i);
    } catch (m) {
      throw (0, ge.newError)(`Unable to parse latest release response from GitLab (${r}): response was not valid JSON: ${m.stack || m.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    if (o.upcoming_release)
      throw (0, ge.newError)("Latest GitLab release is scheduled but not yet published", "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    const a = o.tag_name;
    let s = null, l = "", h = null;
    const c = async (m) => {
      l = (0, Sn.getChannelFilename)(m);
      const v = o.assets.links.find((T) => T.name === l);
      if (!v)
        throw (0, ge.newError)(`Cannot find ${l} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      h = new Xi.URL(v.direct_asset_url);
      const y = this.setAuthHeaderForToken(this.options.token || null), A = Object.keys(y).length ? y : void 0;
      try {
        const T = await this.httpRequest(h, A, t);
        if (!T)
          throw (0, ge.newError)(`Empty response from ${h}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        return T;
      } catch (T) {
        throw T instanceof ge.HttpError && T.statusCode === 404 ? (0, ge.newError)(`Cannot find ${l} in the latest release artifacts (${h}): ${T.stack || T.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : T;
      }
    };
    try {
      s = await c(this.channel);
    } catch (m) {
      if (this.channel !== this.getDefaultChannelName())
        s = await c(this.getDefaultChannelName());
      else
        throw m;
    }
    if (!s)
      throw (0, ge.newError)(`Unable to parse channel data from ${l}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    const f = (0, Ki.parseUpdateInfo)(s, l, h);
    f.releaseName == null && (f.releaseName = o.name), f.releaseNotes == null && (f.releaseNotes = o.description || null);
    const g = {
      tag: a,
      assets: this.convertAssetsToMap(o.assets),
      ...f
    };
    return this.cachedLatestVersion = g, g;
  }
  /**
   * Utility function to convert GitlabReleaseAsset to Map<string, string>
   * Maps asset names to their download URLs
   */
  convertAssetsToMap(t) {
    const r = /* @__PURE__ */ new Map();
    for (const n of t.links)
      r.set(this.normalizeFilename(n.name), n.direct_asset_url);
    return r;
  }
  /**
   * Find blockmap file URL in assets map for a specific filename
   */
  findBlockMapInAssets(t, r) {
    const n = [`${r}.blockmap`, `${this.normalizeFilename(r)}.blockmap`];
    for (const i of n) {
      const o = t.get(i);
      if (o)
        return new Xi.URL(o);
    }
    return null;
  }
  async fetchReleaseInfoByVersion(t) {
    const r = new ge.CancellationToken(), n = [`v${t}`, t];
    for (const i of n) {
      const o = (0, Sn.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(i)}`, this.baseApiUrl);
      try {
        const a = { Accept: "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, s = await this.httpRequest(o, a, r);
        if (s)
          return JSON.parse(s);
      } catch (a) {
        if (a instanceof ge.HttpError && a.statusCode === 404)
          continue;
        throw (0, ge.newError)(`Unable to find release ${i} on GitLab (${o}): ${a.stack || a.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
      }
    }
    throw (0, ge.newError)(`Unable to find release with version ${t} (tried: ${n.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
  }
  setAuthHeaderForToken(t) {
    const r = {};
    return t != null && (t.startsWith("Bearer") ? r.authorization = t : r["PRIVATE-TOKEN"] = t), r;
  }
  /**
   * Get version info for blockmap files, using cache when possible
   */
  async getVersionInfoForBlockMap(t) {
    if (this.cachedLatestVersion && this.cachedLatestVersion.version === t)
      return this.cachedLatestVersion.assets;
    const r = await this.fetchReleaseInfoByVersion(t);
    return r && r.assets ? this.convertAssetsToMap(r.assets) : null;
  }
  /**
   * Find blockmap URLs from version assets
   */
  async findBlockMapUrlsFromAssets(t, r, n) {
    let i = null, o = null;
    const a = await this.getVersionInfoForBlockMap(r);
    a && (i = this.findBlockMapInAssets(a, n));
    const s = await this.getVersionInfoForBlockMap(t);
    if (s) {
      const l = n.replace(new RegExp(sw(r), "g"), t);
      o = this.findBlockMapInAssets(s, l);
    }
    return [o, i];
  }
  async getBlockMapFiles(t, r, n, i = null) {
    if (this.options.uploadTarget === "project_upload") {
      const o = t.pathname.split("/").pop() || "", [a, s] = await this.findBlockMapUrlsFromAssets(r, n, o);
      if (!s)
        throw (0, ge.newError)(`Cannot find blockmap file for ${n} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      if (!a)
        throw (0, ge.newError)(`Cannot find blockmap file for ${r} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      return [a, s];
    } else
      return super.getBlockMapFiles(t, r, n, i);
  }
  resolveFiles(t) {
    return (0, Ki.getFileList)(t).map((r) => {
      const i = [
        r.url,
        // Original filename
        this.normalizeFilename(r.url)
        // Normalized filename (spaces/underscores → dashes)
      ].find((a) => t.assets.has(a)), o = i ? t.assets.get(i) : void 0;
      if (!o)
        throw (0, ge.newError)(`Cannot find asset "${r.url}" in GitLab release assets. Available assets: ${Array.from(t.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new Xi.URL(o),
        info: r
      };
    });
  }
  toString() {
    return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
  }
}
fi.GitLabProvider = lw;
var di = {};
Object.defineProperty(di, "__esModule", { value: !0 });
di.KeygenProvider = void 0;
const Ws = ue, Ji = Ve, Qi = se;
class cw extends Qi.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r, this.defaultHostname = "api.keygen.sh";
    const i = this.configuration.host || this.defaultHostname;
    this.baseUrl = (0, Ji.newBaseUrl)(`https://${i}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "stable";
  }
  async getLatestVersion() {
    const t = new Ws.CancellationToken(), r = (0, Ji.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, Ji.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, {
        Accept: "application/vnd.api+json",
        "Keygen-Version": "1.1"
      }, t);
      return (0, Qi.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, Ws.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, Qi.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { account: t, product: r, platform: n } = this.configuration;
    return `Keygen (account: ${t}, product: ${r}, platform: ${n}, channel: ${this.channel})`;
  }
}
di.KeygenProvider = cw;
var hi = {};
Object.defineProperty(hi, "__esModule", { value: !0 });
hi.PrivateGitHubProvider = void 0;
const qt = ue, uw = ye, fw = ee, Ys = wt, zs = Ve, dw = yt, hw = se;
class pw extends dw.BaseGitHubProvider {
  constructor(t, r, n, i) {
    super(t, "api.github.com", i), this.updater = r, this.token = n;
  }
  createRequestOptions(t, r) {
    const n = super.createRequestOptions(t, r);
    return n.redirect = "manual", n;
  }
  async getLatestVersion() {
    const t = new qt.CancellationToken(), r = (0, zs.getChannelFilename)(this.getDefaultChannelName()), n = await this.getLatestVersionInfo(t), i = n.assets.find((s) => s.name === r);
    if (i == null)
      throw (0, qt.newError)(`Cannot find ${r} in the release ${n.html_url || n.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
    const o = new Ys.URL(i.url);
    let a;
    try {
      a = (0, uw.load)(await this.httpRequest(o, this.configureHeaders("application/octet-stream"), t));
    } catch (s) {
      throw s instanceof qt.HttpError && s.statusCode === 404 ? (0, qt.newError)(`Cannot find ${r} in the latest release artifacts (${o}): ${s.stack || s.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : s;
    }
    return a.assets = n.assets, a;
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
    const r = this.updater.allowPrerelease;
    let n = this.basePath;
    r || (n = `${n}/latest`);
    const i = (0, zs.newUrlFromBase)(n, this.baseUrl);
    try {
      const o = JSON.parse(await this.httpRequest(i, this.configureHeaders("application/vnd.github.v3+json"), t));
      if (r) {
        const a = o.filter((s) => !s.draft);
        return a.find((s) => s.prerelease) || a[0];
      } else
        return o;
    } catch (o) {
      throw (0, qt.newError)(`Unable to find latest version on GitHub (${i}), please ensure a production release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
  }
  resolveFiles(t) {
    return (0, hw.getFileList)(t).map((r) => {
      const n = fw.posix.basename(r.url).replace(/ /g, "-"), i = t.assets.find((o) => o != null && o.name === n);
      if (i == null)
        throw (0, qt.newError)(`Cannot find asset "${n}" in: ${JSON.stringify(t.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new Ys.URL(i.url),
        info: r
      };
    });
  }
}
hi.PrivateGitHubProvider = pw;
Object.defineProperty(ci, "__esModule", { value: !0 });
ci.isUrlProbablySupportMultiRangeRequests = xu;
ci.createClient = ww;
const Cn = ue, mw = ui, Xs = Qr, gw = yt, Ew = fi, yw = di, vw = hi;
function xu(e) {
  return !e.includes("s3.amazonaws.com");
}
function ww(e, t, r) {
  if (typeof e == "string")
    throw (0, Cn.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
  const n = e.provider;
  switch (n) {
    case "github": {
      const i = e, o = (i.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || i.token;
      return o == null ? new gw.GitHubProvider(i, t, r) : new vw.PrivateGitHubProvider(i, t, o, r);
    }
    case "bitbucket":
      return new mw.BitbucketProvider(e, t, r);
    case "gitlab":
      return new Ew.GitLabProvider(e, t, r);
    case "keygen":
      return new yw.KeygenProvider(e, t, r);
    case "s3":
    case "spaces":
      return new Xs.GenericProvider({
        provider: "generic",
        url: (0, Cn.getS3LikeProviderBaseUrl)(e),
        channel: e.channel || null
      }, t, {
        ...r,
        // https://github.com/minio/minio/issues/5285#issuecomment-350428955
        isUseMultipleRangeRequest: !1
      });
    case "generic": {
      const i = e;
      return new Xs.GenericProvider(i, t, {
        ...r,
        isUseMultipleRangeRequest: i.useMultipleRangeRequest !== !1 && xu(i.url)
      });
    }
    case "custom": {
      const i = e, o = i.updateProvider;
      if (!o)
        throw (0, Cn.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
      return new o(i, t, r);
    }
    default:
      throw (0, Cn.newError)(`Unsupported provider: ${n}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
  }
}
var pi = {}, Zr = {}, ur = {}, Bt = {};
Object.defineProperty(Bt, "__esModule", { value: !0 });
Bt.OperationKind = void 0;
Bt.computeOperations = _w;
var Nt;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(Nt || (Bt.OperationKind = Nt = {}));
function _w(e, t, r) {
  const n = Js(e.files), i = Js(t.files);
  let o = null;
  const a = t.files[0], s = [], l = a.name, h = n.get(l);
  if (h == null)
    throw new Error(`no file ${l} in old blockmap`);
  const c = i.get(l);
  let f = 0;
  const { checksumToOffset: g, checksumToOldSize: m } = Tw(n.get(l), h.offset, r);
  let v = a.offset;
  for (let y = 0; y < c.checksums.length; v += c.sizes[y], y++) {
    const A = c.sizes[y], T = c.checksums[y];
    let S = g.get(T);
    S != null && m.get(T) !== A && (r.warn(`Checksum ("${T}") matches, but size differs (old: ${m.get(T)}, new: ${A})`), S = void 0), S === void 0 ? (f++, o != null && o.kind === Nt.DOWNLOAD && o.end === v ? o.end += A : (o = {
      kind: Nt.DOWNLOAD,
      start: v,
      end: v + A
      // oldBlocks: null,
    }, Ks(o, s, T, y))) : o != null && o.kind === Nt.COPY && o.end === S ? o.end += A : (o = {
      kind: Nt.COPY,
      start: S,
      end: S + A
      // oldBlocks: [checksum]
    }, Ks(o, s, T, y));
  }
  return f > 0 && r.info(`File${a.name === "file" ? "" : " " + a.name} has ${f} changed blocks`), s;
}
const Aw = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
function Ks(e, t, r, n) {
  if (Aw && t.length !== 0) {
    const i = t[t.length - 1];
    if (i.kind === e.kind && e.start < i.end && e.start > i.start) {
      const o = [i.start, i.end, e.start, e.end].reduce((a, s) => a < s ? a : s);
      throw new Error(`operation (block index: ${n}, checksum: ${r}, kind: ${Nt[e.kind]}) overlaps previous operation (checksum: ${r}):
abs: ${i.start} until ${i.end} and ${e.start} until ${e.end}
rel: ${i.start - o} until ${i.end - o} and ${e.start - o} until ${e.end - o}`);
    }
  }
  t.push(e);
}
function Tw(e, t, r) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  let o = t;
  for (let a = 0; a < e.checksums.length; a++) {
    const s = e.checksums[a], l = e.sizes[a], h = i.get(s);
    if (h === void 0)
      n.set(s, o), i.set(s, l);
    else if (r.debug != null) {
      const c = h === l ? "(same size)" : `(size: ${h}, this size: ${l})`;
      r.debug(`${s} duplicated in blockmap ${c}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
    }
    o += l;
  }
  return { checksumToOffset: n, checksumToOldSize: i };
}
function Js(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e)
    t.set(r.name, r);
  return t;
}
Object.defineProperty(ur, "__esModule", { value: !0 });
ur.DataSplitter = void 0;
ur.copyData = Uu;
const bn = ue, Sw = vt, Cw = jr, bw = Bt, Qs = Buffer.from(`\r
\r
`);
var lt;
(function(e) {
  e[e.INIT = 0] = "INIT", e[e.HEADER = 1] = "HEADER", e[e.BODY = 2] = "BODY";
})(lt || (lt = {}));
function Uu(e, t, r, n, i) {
  const o = (0, Sw.createReadStream)("", {
    fd: r,
    autoClose: !1,
    start: e.start,
    // end is inclusive
    end: e.end - 1
  });
  o.on("error", n), o.once("end", i), o.pipe(t, {
    end: !1
  });
}
class Rw extends Cw.Writable {
  constructor(t, r, n, i, o, a, s, l) {
    super(), this.out = t, this.options = r, this.partIndexToTaskIndex = n, this.partIndexToLength = o, this.finishHandler = a, this.grandTotalBytes = s, this.onProgress = l, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = lt.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = i.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
  }
  get isFinished() {
    return this.partIndex === this.partIndexToLength.length;
  }
  // noinspection JSUnusedGlobalSymbols
  _write(t, r, n) {
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
      n();
    }).catch(n);
  }
  async handleData(t) {
    let r = 0;
    if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
      throw (0, bn.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
    if (this.ignoreByteCount > 0) {
      const n = Math.min(this.ignoreByteCount, t.length);
      this.ignoreByteCount -= n, r = n;
    } else if (this.remainingPartDataCount > 0) {
      const n = Math.min(this.remainingPartDataCount, t.length);
      this.remainingPartDataCount -= n, await this.processPartData(t, 0, n), r = n;
    }
    if (r !== t.length) {
      if (this.readState === lt.HEADER) {
        const n = this.searchHeaderListEnd(t, r);
        if (n === -1)
          return;
        r = n, this.readState = lt.BODY, this.headerListBuffer = null;
      }
      for (; ; ) {
        if (this.readState === lt.BODY)
          this.readState = lt.INIT;
        else {
          this.partIndex++;
          let a = this.partIndexToTaskIndex.get(this.partIndex);
          if (a == null)
            if (this.isFinished)
              a = this.options.end;
            else
              throw (0, bn.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
          const s = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
          if (s < a)
            await this.copyExistingData(s, a);
          else if (s > a)
            throw (0, bn.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
          if (this.isFinished) {
            this.onPartEnd(), this.finishHandler();
            return;
          }
          if (r = this.searchHeaderListEnd(t, r), r === -1) {
            this.readState = lt.HEADER;
            return;
          }
        }
        const n = this.partIndexToLength[this.partIndex], i = r + n, o = Math.min(i, t.length);
        if (await this.processPartStarted(t, r, o), this.remainingPartDataCount = n - (o - r), this.remainingPartDataCount > 0)
          return;
        if (r = i + this.boundaryLength, r >= t.length) {
          this.ignoreByteCount = this.boundaryLength - (t.length - i);
          return;
        }
      }
    }
  }
  copyExistingData(t, r) {
    return new Promise((n, i) => {
      const o = () => {
        if (t === r) {
          n();
          return;
        }
        const a = this.options.tasks[t];
        if (a.kind !== bw.OperationKind.COPY) {
          i(new Error("Task kind must be COPY"));
          return;
        }
        Uu(a, this.out, this.options.oldFileFd, i, () => {
          t++, o();
        });
      };
      o();
    });
  }
  searchHeaderListEnd(t, r) {
    const n = t.indexOf(Qs, r);
    if (n !== -1)
      return n + Qs.length;
    const i = r === 0 ? t : t.slice(r);
    return this.headerListBuffer == null ? this.headerListBuffer = i : this.headerListBuffer = Buffer.concat([this.headerListBuffer, i]), -1;
  }
  onPartEnd() {
    const t = this.partIndexToLength[this.partIndex - 1];
    if (this.actualPartLength !== t)
      throw (0, bn.newError)(`Expected length: ${t} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
    this.actualPartLength = 0;
  }
  processPartStarted(t, r, n) {
    return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(t, r, n);
  }
  processPartData(t, r, n) {
    this.actualPartLength += n - r, this.transferred += n - r, this.delta += n - r;
    const i = this.out;
    return i.write(r === 0 && t.length === n ? t : t.slice(r, n)) ? Promise.resolve() : new Promise((o, a) => {
      i.on("error", a), i.once("drain", () => {
        i.removeListener("error", a), o();
      });
    });
  }
}
ur.DataSplitter = Rw;
var mi = {};
Object.defineProperty(mi, "__esModule", { value: !0 });
mi.executeTasksUsingMultipleRangeRequests = Ow;
mi.checkIsRangesSupported = To;
const Ao = ue, Zs = ur, el = Bt;
function Ow(e, t, r, n, i) {
  const o = (a) => {
    if (a >= t.length) {
      e.fileMetadataBuffer != null && r.write(e.fileMetadataBuffer), r.end();
      return;
    }
    const s = a + 1e3;
    Iw(e, {
      tasks: t,
      start: a,
      end: Math.min(t.length, s),
      oldFileFd: n
    }, r, () => o(s), i);
  };
  return o;
}
function Iw(e, t, r, n, i) {
  let o = "bytes=", a = 0, s = 0;
  const l = /* @__PURE__ */ new Map(), h = [];
  for (let g = t.start; g < t.end; g++) {
    const m = t.tasks[g];
    m.kind === el.OperationKind.DOWNLOAD && (o += `${m.start}-${m.end - 1}, `, l.set(a, g), a++, h.push(m.end - m.start), s += m.end - m.start);
  }
  if (a <= 1) {
    const g = (m) => {
      if (m >= t.end) {
        n();
        return;
      }
      const v = t.tasks[m++];
      if (v.kind === el.OperationKind.COPY)
        (0, Zs.copyData)(v, r, t.oldFileFd, i, () => g(m));
      else {
        const y = e.createRequestOptions();
        y.headers.Range = `bytes=${v.start}-${v.end - 1}`;
        const A = e.httpExecutor.createRequest(y, (T) => {
          T.on("error", i), To(T, i) && (T.pipe(r, {
            end: !1
          }), T.once("end", () => g(m)));
        });
        e.httpExecutor.addErrorAndTimeoutHandlers(A, i), A.end();
      }
    };
    g(t.start);
    return;
  }
  const c = e.createRequestOptions();
  c.headers.Range = o.substring(0, o.length - 2);
  const f = e.httpExecutor.createRequest(c, (g) => {
    if (!To(g, i))
      return;
    const m = (0, Ao.safeGetHeader)(g, "content-type"), v = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(m);
    if (v == null) {
      i(new Error(`Content-Type "multipart/byteranges" is expected, but got "${m}"`));
      return;
    }
    const y = new Zs.DataSplitter(r, t, l, v[1] || v[2], h, n, s, e.options.onProgress);
    y.on("error", i), g.pipe(y), g.on("end", () => {
      setTimeout(() => {
        f.abort(), i(new Error("Response ends without calling any handlers"));
      }, 1e4);
    });
  });
  e.httpExecutor.addErrorAndTimeoutHandlers(f, i), f.end();
}
function To(e, t) {
  if (e.statusCode >= 400)
    return t((0, Ao.createHttpError)(e)), !1;
  if (e.statusCode !== 206) {
    const r = (0, Ao.safeGetHeader)(e, "accept-ranges");
    if (r == null || r === "none")
      return t(new Error(`Server doesn't support Accept-Ranges (response code ${e.statusCode})`)), !1;
  }
  return !0;
}
var gi = {};
Object.defineProperty(gi, "__esModule", { value: !0 });
gi.ProgressDifferentialDownloadCallbackTransform = void 0;
const Pw = jr;
var er;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(er || (er = {}));
class Nw extends Pw.Transform {
  constructor(t, r, n) {
    super(), this.progressDifferentialDownloadInfo = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = er.COPY, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
      return;
    }
    if (this.operationType == er.COPY) {
      n(null, t);
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
    }), this.delta = 0), n(null, t);
  }
  beginFileCopy() {
    this.operationType = er.COPY;
  }
  beginRangeDownload() {
    this.operationType = er.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
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
gi.ProgressDifferentialDownloadCallbackTransform = Nw;
Object.defineProperty(Zr, "__esModule", { value: !0 });
Zr.DifferentialDownloader = void 0;
const vr = ue, Zi = _t, Dw = vt, $w = ur, Fw = wt, Rn = Bt, tl = mi, Lw = gi;
class xw {
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(t, r, n) {
    this.blockAwareFileInfo = t, this.httpExecutor = r, this.options = n, this.fileMetadataBuffer = null, this.logger = n.logger;
  }
  createRequestOptions() {
    const t = {
      headers: {
        ...this.options.requestHeaders,
        accept: "*/*"
      }
    };
    return (0, vr.configureRequestUrl)(this.options.newUrl, t), (0, vr.configureRequestOptions)(t), t;
  }
  doDownload(t, r) {
    if (t.version !== r.version)
      throw new Error(`version is different (${t.version} - ${r.version}), full download is required`);
    const n = this.logger, i = (0, Rn.computeOperations)(t, r, n);
    n.debug != null && n.debug(JSON.stringify(i, null, 2));
    let o = 0, a = 0;
    for (const l of i) {
      const h = l.end - l.start;
      l.kind === Rn.OperationKind.DOWNLOAD ? o += h : a += h;
    }
    const s = this.blockAwareFileInfo.size;
    if (o + a + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== s)
      throw new Error(`Internal error, size mismatch: downloadSize: ${o}, copySize: ${a}, newSize: ${s}`);
    return n.info(`Full: ${rl(s)}, To download: ${rl(o)} (${Math.round(o / (s / 100))}%)`), this.downloadFile(i);
  }
  downloadFile(t) {
    const r = [], n = () => Promise.all(r.map((i) => (0, Zi.close)(i.descriptor).catch((o) => {
      this.logger.error(`cannot close file "${i.path}": ${o}`);
    })));
    return this.doDownloadFile(t, r).then(n).catch((i) => n().catch((o) => {
      try {
        this.logger.error(`cannot close files: ${o}`);
      } catch (a) {
        try {
          console.error(a);
        } catch {
        }
      }
      throw i;
    }).then(() => {
      throw i;
    }));
  }
  async doDownloadFile(t, r) {
    const n = await (0, Zi.open)(this.options.oldFile, "r");
    r.push({ descriptor: n, path: this.options.oldFile });
    const i = await (0, Zi.open)(this.options.newFile, "w");
    r.push({ descriptor: i, path: this.options.newFile });
    const o = (0, Dw.createWriteStream)(this.options.newFile, { fd: i });
    await new Promise((a, s) => {
      const l = [];
      let h;
      if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
        const T = [];
        let S = 0;
        for (const L of t)
          L.kind === Rn.OperationKind.DOWNLOAD && (T.push(L.end - L.start), S += L.end - L.start);
        const D = {
          expectedByteCounts: T,
          grandTotal: S
        };
        h = new Lw.ProgressDifferentialDownloadCallbackTransform(D, this.options.cancellationToken, this.options.onProgress), l.push(h);
      }
      const c = new vr.DigestTransform(this.blockAwareFileInfo.sha512);
      c.isValidateOnEnd = !1, l.push(c), o.on("finish", () => {
        o.close(() => {
          r.splice(1, 1);
          try {
            c.validate();
          } catch (T) {
            s(T);
            return;
          }
          a(void 0);
        });
      }), l.push(o);
      let f = null;
      for (const T of l)
        T.on("error", s), f == null ? f = T : f = f.pipe(T);
      const g = l[0];
      let m;
      if (this.options.isUseMultipleRangeRequest) {
        m = (0, tl.executeTasksUsingMultipleRangeRequests)(this, t, g, n, s), m(0);
        return;
      }
      let v = 0, y = null;
      this.logger.info(`Differential download: ${this.options.newUrl}`);
      const A = this.createRequestOptions();
      A.redirect = "manual", m = (T) => {
        var S, D;
        if (T >= t.length) {
          this.fileMetadataBuffer != null && g.write(this.fileMetadataBuffer), g.end();
          return;
        }
        const L = t[T++];
        if (L.kind === Rn.OperationKind.COPY) {
          h && h.beginFileCopy(), (0, $w.copyData)(L, g, n, s, () => m(T));
          return;
        }
        const Z = `bytes=${L.start}-${L.end - 1}`;
        A.headers.range = Z, (D = (S = this.logger) === null || S === void 0 ? void 0 : S.debug) === null || D === void 0 || D.call(S, `download range: ${Z}`), h && h.beginRangeDownload();
        const oe = this.httpExecutor.createRequest(A, (W) => {
          W.on("error", s), W.on("aborted", () => {
            s(new Error("response has been aborted by the server"));
          }), W.statusCode >= 400 && s((0, vr.createHttpError)(W)), W.pipe(g, {
            end: !1
          }), W.once("end", () => {
            h && h.endRangeDownload(), ++v === 100 ? (v = 0, setTimeout(() => m(T), 1e3)) : m(T);
          });
        });
        oe.on("redirect", (W, $e, E) => {
          this.logger.info(`Redirect to ${Uw(E)}`), y = E, (0, vr.configureRequestUrl)(new Fw.URL(y), A), oe.followRedirect();
        }), this.httpExecutor.addErrorAndTimeoutHandlers(oe, s), oe.end();
      }, m(0);
    });
  }
  async readRemoteBytes(t, r) {
    const n = Buffer.allocUnsafe(r + 1 - t), i = this.createRequestOptions();
    i.headers.range = `bytes=${t}-${r}`;
    let o = 0;
    if (await this.request(i, (a) => {
      a.copy(n, o), o += a.length;
    }), o !== n.length)
      throw new Error(`Received data length ${o} is not equal to expected ${n.length}`);
    return n;
  }
  request(t, r) {
    return new Promise((n, i) => {
      const o = this.httpExecutor.createRequest(t, (a) => {
        (0, tl.checkIsRangesSupported)(a, i) && (a.on("error", i), a.on("aborted", () => {
          i(new Error("response has been aborted by the server"));
        }), a.on("data", r), a.on("end", () => n()));
      });
      this.httpExecutor.addErrorAndTimeoutHandlers(o, i), o.end();
    });
  }
}
Zr.DifferentialDownloader = xw;
function rl(e, t = " KB") {
  return new Intl.NumberFormat("en").format((e / 1024).toFixed(2)) + t;
}
function Uw(e) {
  const t = e.indexOf("?");
  return t < 0 ? e : e.substring(0, t);
}
Object.defineProperty(pi, "__esModule", { value: !0 });
pi.GenericDifferentialDownloader = void 0;
const kw = Zr;
class Mw extends kw.DifferentialDownloader {
  download(t, r) {
    return this.doDownload(t, r);
  }
}
pi.GenericDifferentialDownloader = Mw;
var At = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = n;
  const t = ue;
  Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
  class r {
    constructor(o) {
      this.emitter = o;
    }
    /**
     * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
     */
    login(o) {
      n(this.emitter, "login", o);
    }
    progress(o) {
      n(this.emitter, e.DOWNLOAD_PROGRESS, o);
    }
    updateDownloaded(o) {
      n(this.emitter, e.UPDATE_DOWNLOADED, o);
    }
    updateCancelled(o) {
      n(this.emitter, "update-cancelled", o);
    }
  }
  e.UpdaterSignal = r;
  function n(i, o, a) {
    i.on(o, a);
  }
})(At);
Object.defineProperty(pt, "__esModule", { value: !0 });
pt.NoOpLogger = pt.AppUpdater = void 0;
const Te = ue, Bw = Hr, jw = Yn, Hw = Al, Be = _t, Gw = ye, eo = ri, Ue = ee, It = Ou, nl = Jr, qw = li, il = Iu, Vw = Qr, to = ci, ro = Sl, Ww = pi, Vt = At;
class ta extends Hw.EventEmitter {
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
        throw (0, Te.newError)(`Channel must be a string, but got: ${t}`, "ERR_UPDATER_INVALID_CHANNEL");
      if (t.length === 0)
        throw (0, Te.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
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
    return (0, il.getNetSession)();
  }
  /**
   * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
   * Set it to `null` if you would like to disable a logging feature.
   */
  get logger() {
    return this._logger;
  }
  set logger(t) {
    this._logger = t ?? new ku();
  }
  // noinspection JSUnusedGlobalSymbols
  /**
   * test only
   * @private
   */
  set updateConfigPath(t) {
    this.clientPromise = null, this._appUpdateConfigPath = t, this.configOnDisk = new eo.Lazy(() => this.loadUpdateConfig());
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
  constructor(t, r) {
    super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new Vt.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (o) => this.checkIfUpdateSupported(o), this._isUserWithinRollout = (o) => this.isStagingMatch(o), this.clientPromise = null, this.stagingUserIdPromise = new eo.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new eo.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (o) => {
      this._logger.error(`Error: ${o.stack || o.message}`);
    }), r == null ? (this.app = new qw.ElectronAppAdapter(), this.httpExecutor = new il.ElectronHttpExecutor((o, a) => this.emit("login", o, a))) : (this.app = r, this.httpExecutor = null);
    const n = this.app.version, i = (0, It.parse)(n);
    if (i == null)
      throw (0, Te.newError)(`App version is not a valid semver version: "${n}"`, "ERR_UPDATER_INVALID_VERSION");
    this.currentVersion = i, this.allowPrerelease = Yw(i), t != null && (this.setFeedURL(t), typeof t != "string" && t.requestHeaders && (this.requestHeaders = t.requestHeaders));
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
    const r = this.createProviderRuntimeOptions();
    let n;
    typeof t == "string" ? n = new Vw.GenericProvider({ provider: "generic", url: t }, this, {
      ...r,
      isUseMultipleRangeRequest: (0, to.isUrlProbablySupportMultiRangeRequests)(t)
    }) : n = (0, to.createClient)(t, this, r), this.clientPromise = Promise.resolve(n);
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
    const r = () => this.checkForUpdatesPromise = null;
    return this._logger.info("Checking for update"), t = this.doCheckForUpdates().then((n) => (r(), n)).catch((n) => {
      throw r(), this.emit("error", n, `Cannot check for updates: ${(n.stack || n).toString()}`), n;
    }), this.checkForUpdatesPromise = t, t;
  }
  isUpdaterActive() {
    return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
  }
  // noinspection JSUnusedGlobalSymbols
  checkForUpdatesAndNotify(t) {
    return this.checkForUpdates().then((r) => r != null && r.downloadPromise ? (r.downloadPromise.then(() => {
      const n = ta.formatDownloadNotification(r.updateInfo.version, this.app.name, t);
      new Ft.Notification(n).show();
    }), r) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), r));
  }
  static formatDownloadNotification(t, r, n) {
    return n == null && (n = {
      title: "A new update is ready to install",
      body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
    }), n = {
      title: n.title.replace("{appName}", r).replace("{version}", t),
      body: n.body.replace("{appName}", r).replace("{version}", t)
    }, n;
  }
  async isStagingMatch(t) {
    const r = t.stagingPercentage;
    let n = r;
    if (n == null)
      return !0;
    if (n = parseInt(n, 10), isNaN(n))
      return this._logger.warn(`Staging percentage is NaN: ${r}`), !0;
    n = n / 100;
    const i = await this.stagingUserIdPromise.value, a = Te.UUID.parse(i).readUInt32BE(12) / 4294967295;
    return this._logger.info(`Staging percentage: ${n}, percentage: ${a}, user id: ${i}`), a < n;
  }
  computeFinalHeaders(t) {
    return this.requestHeaders != null && Object.assign(t, this.requestHeaders), t;
  }
  async isUpdateAvailable(t) {
    const r = (0, It.parse)(t.version);
    if (r == null)
      throw (0, Te.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${t.version}"`, "ERR_UPDATER_INVALID_VERSION");
    const n = this.currentVersion;
    if ((0, It.eq)(r, n) || !await Promise.resolve(this.isUpdateSupported(t)) || !await Promise.resolve(this.isUserWithinRollout(t)))
      return !1;
    const o = (0, It.gt)(r, n), a = (0, It.lt)(r, n);
    return o ? !0 : this.allowDowngrade && a;
  }
  checkIfUpdateSupported(t) {
    const r = t == null ? void 0 : t.minimumSystemVersion, n = (0, jw.release)();
    if (r)
      try {
        if ((0, It.lt)(n, r))
          return this._logger.info(`Current OS version ${n} is less than the minimum OS version required ${r} for version ${n}`), !1;
      } catch (i) {
        this._logger.warn(`Failed to compare current OS version(${n}) with minimum OS version(${r}): ${(i.message || i).toString()}`);
      }
    return !0;
  }
  async getUpdateInfoAndProvider() {
    await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((n) => (0, to.createClient)(n, this, this.createProviderRuntimeOptions())));
    const t = await this.clientPromise, r = await this.stagingUserIdPromise.value;
    return t.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": r })), {
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
    const t = await this.getUpdateInfoAndProvider(), r = t.info;
    if (!await this.isUpdateAvailable(r))
      return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${r.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", r), {
        isUpdateAvailable: !1,
        versionInfo: r,
        updateInfo: r
      };
    this.updateInfoAndProvider = t, this.onUpdateAvailable(r);
    const n = new Te.CancellationToken();
    return {
      isUpdateAvailable: !0,
      versionInfo: r,
      updateInfo: r,
      cancellationToken: n,
      downloadPromise: this.autoDownload ? this.downloadUpdate(n) : null
    };
  }
  onUpdateAvailable(t) {
    this._logger.info(`Found version ${t.version} (url: ${(0, Te.asArray)(t.files).map((r) => r.url).join(", ")})`), this.emit("update-available", t);
  }
  /**
   * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
   * @returns {Promise<Array<string>>} Paths to downloaded files.
   */
  downloadUpdate(t = new Te.CancellationToken()) {
    const r = this.updateInfoAndProvider;
    if (r == null) {
      const i = new Error("Please check update first");
      return this.dispatchError(i), Promise.reject(i);
    }
    if (this.downloadPromise != null)
      return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
    this._logger.info(`Downloading update from ${(0, Te.asArray)(r.info.files).map((i) => i.url).join(", ")}`);
    const n = (i) => {
      if (!(i instanceof Te.CancellationError))
        try {
          this.dispatchError(i);
        } catch (o) {
          this._logger.warn(`Cannot dispatch error event: ${o.stack || o}`);
        }
      return i;
    };
    return this.downloadPromise = this.doDownloadUpdate({
      updateInfoAndProvider: r,
      requestHeaders: this.computeRequestHeaders(r.provider),
      cancellationToken: t,
      disableWebInstaller: this.disableWebInstaller,
      disableDifferentialDownload: this.disableDifferentialDownload
    }).catch((i) => {
      throw n(i);
    }).finally(() => {
      this.downloadPromise = null;
    }), this.downloadPromise;
  }
  dispatchError(t) {
    this.emit("error", t, (t.stack || t).toString());
  }
  dispatchUpdateDownloaded(t) {
    this.emit(Vt.UPDATE_DOWNLOADED, t);
  }
  async loadUpdateConfig() {
    return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, Gw.load)(await (0, Be.readFile)(this._appUpdateConfigPath, "utf-8"));
  }
  computeRequestHeaders(t) {
    const r = t.fileExtraDownloadHeaders;
    if (r != null) {
      const n = this.requestHeaders;
      return n == null ? r : {
        ...r,
        ...n
      };
    }
    return this.computeFinalHeaders({ accept: "*/*" });
  }
  async getOrCreateStagingUserId() {
    const t = Ue.join(this.app.userDataPath, ".updaterId");
    try {
      const n = await (0, Be.readFile)(t, "utf-8");
      if (Te.UUID.check(n))
        return n;
      this._logger.warn(`Staging user id file exists, but content was invalid: ${n}`);
    } catch (n) {
      n.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${n}`);
    }
    const r = Te.UUID.v5((0, Bw.randomBytes)(4096), Te.UUID.OID);
    this._logger.info(`Generated new staging user ID: ${r}`);
    try {
      await (0, Be.outputFile)(t, r);
    } catch (n) {
      this._logger.warn(`Couldn't write out staging user ID: ${n}`);
    }
    return r;
  }
  /** @internal */
  get isAddNoCacheQuery() {
    const t = this.requestHeaders;
    if (t == null)
      return !0;
    for (const r of Object.keys(t)) {
      const n = r.toLowerCase();
      if (n === "authorization" || n === "private-token")
        return !1;
    }
    return !0;
  }
  async getOrCreateDownloadHelper() {
    let t = this.downloadedUpdateHelper;
    if (t == null) {
      const r = (await this.configOnDisk.value).updaterCacheDirName, n = this._logger;
      r == null && n.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
      const i = Ue.join(this.app.baseCachePath, r || this.app.name);
      n.debug != null && n.debug(`updater cache dir: ${i}`), t = new nl.DownloadedUpdateHelper(i), this.downloadedUpdateHelper = t;
    }
    return t;
  }
  async executeDownload(t) {
    const r = t.fileInfo, n = {
      headers: t.downloadUpdateOptions.requestHeaders,
      cancellationToken: t.downloadUpdateOptions.cancellationToken,
      sha2: r.info.sha2,
      sha512: r.info.sha512
    };
    this.listenerCount(Vt.DOWNLOAD_PROGRESS) > 0 && (n.onProgress = (S) => this.emit(Vt.DOWNLOAD_PROGRESS, S));
    const i = t.downloadUpdateOptions.updateInfoAndProvider.info, o = i.version, a = r.packageInfo;
    function s() {
      const S = decodeURIComponent(t.fileInfo.url.pathname);
      return S.toLowerCase().endsWith(`.${t.fileExtension.toLowerCase()}`) ? Ue.basename(S) : Ue.basename(t.fileInfo.info.url);
    }
    const l = await this.getOrCreateDownloadHelper(), h = l.cacheDirForPendingUpdate;
    await (0, Be.mkdir)(h, { recursive: !0 });
    const c = s();
    let f = Ue.join(h, c);
    const g = a == null ? null : Ue.join(h, `package-${o}${Ue.extname(a.path) || ".7z"}`), m = async (S) => {
      await l.setDownloadedFile(f, g, i, r, c, S), await t.done({
        ...i,
        downloadedFile: f
      });
      const D = Ue.join(h, "current.blockmap");
      return await (0, Be.pathExists)(D) && await (0, Be.copyFile)(D, Ue.join(l.cacheDir, "current.blockmap")), g == null ? [f] : [f, g];
    }, v = this._logger, y = await l.validateDownloadedPath(f, i, r, v);
    if (y != null)
      return f = y, await m(!1);
    const A = async () => (await l.clear().catch(() => {
    }), await (0, Be.unlink)(f).catch(() => {
    })), T = await (0, nl.createTempUpdateFile)(`temp-${c}`, h, v);
    try {
      await t.task(T, n, g, A), await (0, Te.retry)(() => (0, Be.rename)(T, f), {
        retries: 60,
        interval: 500,
        shouldRetry: (S) => S instanceof Error && /^EBUSY:/.test(S.message) ? !0 : (v.warn(`Cannot rename temp file to final file: ${S.message || S.stack}`), !1)
      });
    } catch (S) {
      throw await A(), S instanceof Te.CancellationError && (v.info("cancelled"), this.emit("update-cancelled", i)), S;
    }
    return v.info(`New version ${o} has been downloaded to ${f}`), await m(!0);
  }
  async differentialDownloadInstaller(t, r, n, i, o) {
    try {
      if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
        return !0;
      const a = r.updateInfoAndProvider.provider, s = await a.getBlockMapFiles(t.url, this.app.version, r.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
      this._logger.info(`Download block maps (old: "${s[0]}", new: ${s[1]})`);
      const l = async (v) => {
        const y = await this.httpExecutor.downloadToBuffer(v, {
          headers: r.requestHeaders,
          cancellationToken: r.cancellationToken
        });
        if (y == null || y.length === 0)
          throw new Error(`Blockmap "${v.href}" is empty`);
        try {
          return JSON.parse((0, ro.gunzipSync)(y).toString());
        } catch (A) {
          throw new Error(`Cannot parse blockmap "${v.href}", error: ${A}`);
        }
      }, h = {
        newUrl: t.url,
        oldFile: Ue.join(this.downloadedUpdateHelper.cacheDir, o),
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: a.isUseMultipleRangeRequest,
        requestHeaders: r.requestHeaders,
        cancellationToken: r.cancellationToken
      };
      this.listenerCount(Vt.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (v) => this.emit(Vt.DOWNLOAD_PROGRESS, v));
      const c = async (v, y) => {
        const A = Ue.join(y, "current.blockmap");
        await (0, Be.outputFile)(A, (0, ro.gzipSync)(JSON.stringify(v)));
      }, f = async (v) => {
        const y = Ue.join(v, "current.blockmap");
        try {
          if (await (0, Be.pathExists)(y))
            return JSON.parse((0, ro.gunzipSync)(await (0, Be.readFile)(y)).toString());
        } catch (A) {
          this._logger.warn(`Cannot parse blockmap "${y}", error: ${A}`);
        }
        return null;
      }, g = await l(s[1]);
      await c(g, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
      let m = await f(this.downloadedUpdateHelper.cacheDir);
      return m == null && (m = await l(s[0])), await new Ww.GenericDifferentialDownloader(t.info, this.httpExecutor, h).download(m, g), !1;
    } catch (a) {
      if (this._logger.error(`Cannot download differentially, fallback to full download: ${a.stack || a}`), this._testOnlyOptions != null)
        throw a;
      return !0;
    }
  }
}
pt.AppUpdater = ta;
function Yw(e) {
  const t = (0, It.prerelease)(e);
  return t != null && t.length > 0;
}
class ku {
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
pt.NoOpLogger = ku;
Object.defineProperty(kt, "__esModule", { value: !0 });
kt.BaseUpdater = void 0;
const ol = Wn, no = ee, zw = pt;
class Xw extends zw.AppUpdater {
  constructor(t, r) {
    super(t, r), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
  }
  quitAndInstall(t = !1, r = !1) {
    this._logger.info("Install on explicit quitAndInstall"), this.install(t, t ? r : this.autoRunAppAfterInstall) ? setImmediate(() => {
      Ft.autoUpdater.emit("before-quit-for-update"), this.app.quit();
    }) : this.quitAndInstallCalled = !1;
  }
  executeDownload(t) {
    return super.executeDownload({
      ...t,
      done: (r) => (this.dispatchUpdateDownloaded(r), this.addQuitHandler(), Promise.resolve())
    });
  }
  get installerPath() {
    return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
  }
  // must be sync (because quit even handler is not async)
  install(t = !1, r = !1) {
    if (this.quitAndInstallCalled)
      return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
    const n = this.downloadedUpdateHelper, i = this.installerPath, o = n == null ? null : n.downloadedFileInfo;
    if (i == null || o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    this.quitAndInstallCalled = !0;
    try {
      return this._logger.info(`Install: isSilent: ${t}, isForceRunAfter: ${r}`), this.doInstall({
        isSilent: t,
        isForceRunAfter: r,
        isAdminRightsRequired: o.isAdminRightsRequired
      });
    } catch (a) {
      return this.dispatchError(a), !1;
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
    return t.split(no.delimiter).filter((r) => no.isAbsolute(r)).join(no.delimiter);
  }
  spawnSyncLog(t, r = [], n = {}) {
    var i;
    this._logger.info(`Executing: ${t} with args: ${r}`);
    const o = { ...process.env, ...n }, a = (0, ol.spawnSync)(t, r, {
      env: { ...o, PATH: this.sanitizeEnvPath((i = o.PATH) !== null && i !== void 0 ? i : "") },
      encoding: "utf-8",
      shell: !0
    }), { error: s, status: l, stdout: h, stderr: c } = a;
    if (s != null)
      throw this._logger.error(c), s;
    if (l != null && l !== 0)
      throw this._logger.error(c), new Error(`Command ${t} exited with code ${l}`);
    return h.trim();
  }
  /**
   * This handles both node 8 and node 10 way of emitting error when spawning a process
   *   - node 8: Throws the error
   *   - node 10: Emit the error(Need to listen with on)
   */
  // https://github.com/electron-userland/electron-builder/issues/1129
  // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
  async spawnLog(t, r = [], n = void 0, i = "ignore") {
    return this._logger.info(`Executing: ${t} with args: ${r}`), new Promise((o, a) => {
      try {
        const s = { stdio: i, env: n, detached: !0 }, l = (0, ol.spawn)(t, r, s);
        l.on("error", (h) => {
          a(h);
        }), l.unref(), l.pid !== void 0 && o(!0);
      } catch (s) {
        a(s);
      }
    });
  }
}
kt.BaseUpdater = Xw;
var Lr = {}, en = {};
Object.defineProperty(en, "__esModule", { value: !0 });
en.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
const Wt = _t, Kw = Zr, Jw = Sl;
class Qw extends Kw.DifferentialDownloader {
  async download() {
    const t = this.blockAwareFileInfo, r = t.size, n = r - (t.blockMapSize + 4);
    this.fileMetadataBuffer = await this.readRemoteBytes(n, r - 1);
    const i = Mu(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
    await this.doDownload(await Zw(this.options.oldFile), i);
  }
}
en.FileWithEmbeddedBlockMapDifferentialDownloader = Qw;
function Mu(e) {
  return JSON.parse((0, Jw.inflateRawSync)(e).toString());
}
async function Zw(e) {
  const t = await (0, Wt.open)(e, "r");
  try {
    const r = (await (0, Wt.fstat)(t)).size, n = Buffer.allocUnsafe(4);
    await (0, Wt.read)(t, n, 0, n.length, r - n.length);
    const i = Buffer.allocUnsafe(n.readUInt32BE(0));
    return await (0, Wt.read)(t, i, 0, i.length, r - n.length - i.length), await (0, Wt.close)(t), Mu(i);
  } catch (r) {
    throw await (0, Wt.close)(t), r;
  }
}
Object.defineProperty(Lr, "__esModule", { value: !0 });
Lr.AppImageUpdater = void 0;
const io = ue, al = Wn, e_ = _t, t_ = vt, Yt = ee, r_ = kt, n_ = en, i_ = se, sl = At;
class o_ extends r_.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  isUpdaterActive() {
    return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, i_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "AppImage",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        const a = process.env.APPIMAGE;
        if (a == null)
          throw (0, io.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
        (t.disableDifferentialDownload || await this.downloadDifferential(n, a, i, r, t)) && await this.httpExecutor.download(n.url, i, o), await (0, e_.chmod)(i, 493);
      }
    });
  }
  async downloadDifferential(t, r, n, i, o) {
    try {
      const a = {
        newUrl: t.url,
        oldFile: r,
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        requestHeaders: o.requestHeaders,
        cancellationToken: o.cancellationToken
      };
      return this.listenerCount(sl.DOWNLOAD_PROGRESS) > 0 && (a.onProgress = (s) => this.emit(sl.DOWNLOAD_PROGRESS, s)), await new n_.FileWithEmbeddedBlockMapDifferentialDownloader(t.info, this.httpExecutor, a).download(), !1;
    } catch (a) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${a.stack || a}`), process.platform === "linux";
    }
  }
  doInstall(t) {
    const r = process.env.APPIMAGE;
    if (r == null)
      throw (0, io.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    if (!Yt.isAbsolute(r) || r.includes("\0"))
      throw (0, io.newError)(`APPIMAGE env is not a valid absolute path: "${r}"`, "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    (0, t_.unlinkSync)(r);
    let n;
    const i = Yt.basename(r), o = this.installerPath;
    if (o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    Yt.basename(o) === i || !/\d+\.\d+\.\d+/.test(i) ? n = r : n = Yt.join(Yt.dirname(r), Yt.basename(o)), (0, al.execFileSync)("mv", ["-f", o, n]), n !== r && this.emit("appimage-filename-updated", n);
    const a = {
      ...process.env,
      APPIMAGE_SILENT_INSTALL: "true"
    };
    return t.isForceRunAfter ? this.spawnLog(n, [], a) : (a.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, al.execFileSync)(n, [], { env: a })), !0;
  }
}
Lr.AppImageUpdater = o_;
var xr = {}, fr = {};
Object.defineProperty(fr, "__esModule", { value: !0 });
fr.LinuxUpdater = void 0;
const a_ = kt, s_ = /^[a-zA-Z0-9_-]+$/;
class l_ extends a_.BaseUpdater {
  constructor(t, r) {
    super(t, r);
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
    const { name: r } = this.app, i = `"${r.replace(/["`$\\!\n\r;|&<>(){}*?[\]#~]/g, "")} would like to update"`, o = this.sudoWithArgs(i);
    this._logger.info(`Running as non-root user, using sudo to install: ${o}`);
    let a = '"';
    return (/pkexec/i.test(o[0]) || o[0] === "sudo") && (a = ""), this.spawnSyncLog(o[0], [...o.length > 1 ? o.slice(1) : [], `${a}/bin/bash`, "-c", `'${t.join(" ")}'${a}`]);
  }
  sudoWithArgs(t) {
    const r = this.determineSudoCommand(), n = [r];
    return /kdesudo/i.test(r) ? (n.push("--comment", t), n.push("-c")) : /gksudo/i.test(r) ? n.push("--message", t) : /pkexec/i.test(r) && n.push("--disable-internal-agent"), n;
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
    for (const r of t)
      if (this.hasCommand(r))
        return r;
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
    var r;
    let n = t;
    const i = (r = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || r === void 0 ? void 0 : r.trim();
    i && (s_.test(i) ? n = [i] : this._logger.warn(`ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER "${i}" contains unsafe characters. Ignoring override.`));
    for (const s of n)
      if (this.hasCommand(s))
        return s;
    const o = i ? `ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER override "${i}", ` : "", a = t[0];
    return this._logger.warn(`No package manager found in the list: ${o}${t.join(", ")}. Utilizing default: ${a}`), a;
  }
}
fr.LinuxUpdater = l_;
Object.defineProperty(xr, "__esModule", { value: !0 });
xr.DebUpdater = void 0;
const c_ = se, ll = At, u_ = fr;
class ra extends u_.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, c_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
    return this.executeDownload({
      fileExtension: "deb",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(ll.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(ll.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
      return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
    const n = ["dpkg", "apt"], i = this.detectPackageManager(n);
    try {
      ra.installWithCommandRunner(i, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n, i) {
    var o;
    if (t === "dpkg")
      try {
        n(["dpkg", "-i", r]);
      } catch (a) {
        i.warn((o = a.message) !== null && o !== void 0 ? o : a), i.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), n(["apt-get", "install", "-f", "-y"]);
      }
    else if (t === "apt")
      i.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), n([
        "apt",
        "install",
        "-y",
        "--allow-unauthenticated",
        // needed for unsigned .debs
        "--allow-downgrades",
        // allow lower version installs
        "--allow-change-held-packages",
        r
      ]);
    else
      throw new Error(`Package manager ${t} not supported`);
  }
}
xr.DebUpdater = ra;
var Ur = {};
Object.defineProperty(Ur, "__esModule", { value: !0 });
Ur.PacmanUpdater = void 0;
const cl = At, f_ = se, d_ = fr;
class na extends d_.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, f_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
    return this.executeDownload({
      fileExtension: "pacman",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(cl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(cl.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    try {
      na.installWithCommandRunner(r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (n) {
      return this.dispatchError(n), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n) {
    var i;
    try {
      r(["pacman", "-U", "--noconfirm", t]);
    } catch (o) {
      n.warn((i = o.message) !== null && i !== void 0 ? i : o), n.warn("pacman installation failed, attempting to update package database and retry");
      try {
        r(["pacman", "-Sy", "--noconfirm"]), r(["pacman", "-U", "--noconfirm", t]);
      } catch (a) {
        throw n.error("Retry after pacman -Sy failed"), a;
      }
    }
  }
}
Ur.PacmanUpdater = na;
var kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.RpmUpdater = void 0;
const ul = At, h_ = se, p_ = fr;
class ia extends p_.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, h_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "rpm",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(ul.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(ul.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const n = ["zypper", "dnf", "yum", "rpm"], i = this.detectPackageManager(n);
    try {
      ia.installWithCommandRunner(i, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n, i) {
    if (t === "zypper")
      return n(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", r]);
    if (t === "dnf")
      return n(["dnf", "install", "--nogpgcheck", "-y", r]);
    if (t === "yum")
      return n(["yum", "install", "--nogpgcheck", "-y", r]);
    if (t === "rpm")
      return i.warn("Installing with rpm only (no dependency resolution)."), n(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", r]);
    throw new Error(`Package manager ${t} not supported`);
  }
}
kr.RpmUpdater = ia;
var Mr = {};
Object.defineProperty(Mr, "__esModule", { value: !0 });
Mr.MacUpdater = void 0;
const fl = ue, oo = _t, m_ = vt, dl = ee, g_ = Jf, E_ = pt, y_ = se, hl = Wn, pl = Hr;
class oa extends E_.AppUpdater {
  constructor(t, r) {
    super(t, r), this.nativeUpdater = Ft.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (n) => {
      this._logger.warn(n), this.emit("error", n);
    }), this.nativeUpdater.on("update-downloaded", () => {
      this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
    });
  }
  /** Filters update files to the appropriate architecture.
   * On arm64 Macs (including Rosetta), arm64 files are preferred when available.
   * On x64 Macs, arm64 files are excluded. */
  static filterFilesForArch(t, r) {
    const n = (i) => {
      var o;
      return i.url.pathname.includes("arm64") || ((o = i.info.url) === null || o === void 0 ? void 0 : o.includes("arm64"));
    };
    return r && t.some(n) ? t.filter((i) => r === n(i)) : t.filter((i) => !n(i));
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
    let r = t.updateInfoAndProvider.provider.resolveFiles(t.updateInfoAndProvider.info);
    const n = this._logger, i = "sysctl.proc_translated";
    let o = !1;
    try {
      this.debug("Checking for macOS Rosetta environment"), o = (0, hl.execFileSync)("sysctl", [i], { encoding: "utf8" }).includes(`${i}: 1`), n.info(`Checked for macOS Rosetta environment (isRosetta=${o})`);
    } catch (c) {
      n.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${c}`);
    }
    let a = !1;
    try {
      this.debug("Checking for arm64 in uname");
      const f = (0, hl.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
      n.info(`Checked 'uname -a': arm64=${f}`), a = a || f;
    } catch (c) {
      n.warn(`uname shell command to check for arm64 failed: ${c}`);
    }
    a = a || process.arch === "arm64" || o, r = oa.filterFilesForArch(r, a);
    const s = (0, y_.findFile)(r, "zip", ["pkg", "dmg"]);
    if (s == null)
      throw (0, fl.newError)(`ZIP file not provided: ${(0, fl.safeStringifyJson)(r)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
    const l = t.updateInfoAndProvider.provider, h = "update.zip";
    return this.executeDownload({
      fileExtension: "zip",
      fileInfo: s,
      downloadUpdateOptions: t,
      task: async (c, f) => {
        const g = dl.join(this.downloadedUpdateHelper.cacheDir, h), m = () => (0, oo.pathExistsSync)(g) ? !t.disableDifferentialDownload : (n.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
        let v = !0;
        m() && (v = await this.differentialDownloadInstaller(s, t, c, l, h)), v && await this.httpExecutor.download(s.url, c, f);
      },
      done: async (c) => {
        if (!t.disableDifferentialDownload)
          try {
            const f = dl.join(this.downloadedUpdateHelper.cacheDir, h);
            await (0, oo.copyFile)(c.downloadedFile, f);
          } catch (f) {
            this._logger.warn(`Unable to copy file for caching for future differential downloads: ${f.message}`);
          }
        return this.updateDownloaded(s, c);
      }
    });
  }
  async updateDownloaded(t, r) {
    var n;
    const i = r.downloadedFile, o = (n = t.info.size) !== null && n !== void 0 ? n : (await (0, oo.stat)(i)).size, a = this._logger, s = `fileToProxy=${t.url.href}`;
    this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${s})`), this.server = (0, g_.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${s})`), this.server.on("close", () => {
      a.info(`Proxy server for native Squirrel.Mac is closed (${s})`);
    });
    const l = (h) => {
      const c = h.address();
      return typeof c == "string" ? c : `http://127.0.0.1:${c == null ? void 0 : c.port}`;
    };
    return await new Promise((h, c) => {
      const f = (0, pl.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), g = Buffer.from(`autoupdater:${f}`, "ascii"), m = `/${(0, pl.randomBytes)(64).toString("hex")}.zip`;
      this.server.on("request", (v, y) => {
        const A = v.url;
        if (a.info(`${A} requested`), A === "/") {
          if (!v.headers.authorization || v.headers.authorization.indexOf("Basic ") === -1) {
            y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), a.warn("No authenthication info");
            return;
          }
          const D = v.headers.authorization.split(" ")[1], L = Buffer.from(D, "base64").toString("ascii"), [Z, oe] = L.split(":");
          if (Z !== "autoupdater" || oe !== f) {
            y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), a.warn("Invalid authenthication credentials");
            return;
          }
          const W = Buffer.from(`{ "url": "${l(this.server)}${m}" }`);
          y.writeHead(200, { "Content-Type": "application/json", "Content-Length": W.length }), y.end(W);
          return;
        }
        if (!A.startsWith(m)) {
          a.warn(`${A} requested, but not supported`), y.writeHead(404), y.end();
          return;
        }
        a.info(`${m} requested by Squirrel.Mac, pipe ${i}`);
        let T = !1;
        y.on("finish", () => {
          T || (this.nativeUpdater.removeListener("error", c), h([]));
        });
        const S = (0, m_.createReadStream)(i);
        S.on("error", (D) => {
          try {
            y.end();
          } catch (L) {
            a.warn(`cannot end response: ${L}`);
          }
          T = !0, this.nativeUpdater.removeListener("error", c), c(new Error(`Cannot pipe "${i}": ${D}`));
        }), y.writeHead(200, {
          "Content-Type": "application/zip",
          "Content-Length": o
        }), S.pipe(y);
      }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${s})`), this.server.listen(0, "127.0.0.1", () => {
        this.debug(`Proxy server for native Squirrel.Mac is listening (address=${l(this.server)}, ${s})`), this.nativeUpdater.setFeedURL({
          url: l(this.server),
          headers: {
            "Cache-Control": "no-cache",
            Authorization: `Basic ${g.toString("base64")}`
          }
        }), this.dispatchUpdateDownloaded(r), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", c), this.nativeUpdater.checkForUpdates()) : h([]);
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
Mr.MacUpdater = oa;
var Br = {}, aa = {};
Object.defineProperty(aa, "__esModule", { value: !0 });
aa.verifySignature = w_;
const ml = ue, Bu = Wn, v_ = Yn, gl = ee;
function ju(e, t) {
  return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", e], {
    shell: !0,
    timeout: t
  }];
}
function w_(e, t, r) {
  return new Promise((n, i) => {
    const o = t.replace(/'/g, "''");
    r.info(`Verifying signature ${o}`), (0, Bu.execFile)(...ju(`"Get-AuthenticodeSignature -LiteralPath '${o}' | ConvertTo-Json -Compress"`, 20 * 1e3), (a, s, l) => {
      var h;
      try {
        if (a != null || l) {
          ao(r, a, l, i), n(null);
          return;
        }
        const c = __(s);
        if (c.Status === 0) {
          try {
            const v = gl.normalize(c.Path), y = gl.normalize(t);
            if (r.info(`LiteralPath: ${v}. Update Path: ${y}`), v !== y) {
              ao(r, new Error(`LiteralPath of ${v} is different than ${y}`), l, i), n(null);
              return;
            }
          } catch (v) {
            r.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(h = v.message) !== null && h !== void 0 ? h : v.stack}`);
          }
          const g = (0, ml.parseDn)(c.SignerCertificate.Subject);
          let m = !1;
          for (const v of e) {
            const y = (0, ml.parseDn)(v);
            if (y.size ? m = Array.from(y.keys()).every((T) => y.get(T) === g.get(T)) : v === g.get("CN") && (r.warn(`Signature validated using only CN ${v}. Please add your full Distinguished Name (DN) to publisherNames configuration`), m = !0), m) {
              n(null);
              return;
            }
          }
        }
        const f = `publisherNames: ${e.join(" | ")}, raw info: ` + JSON.stringify(c, (g, m) => g === "RawData" ? void 0 : m, 2);
        r.warn(`Sign verification failed, installer signed with incorrect certificate: ${f}`), n(f);
      } catch (c) {
        ao(r, c, null, i), n(null);
        return;
      }
    });
  });
}
function __(e) {
  const t = JSON.parse(e);
  delete t.PrivateKey, delete t.IsOSBinary, delete t.SignatureType;
  const r = t.SignerCertificate;
  return r != null && (delete r.Archived, delete r.Extensions, delete r.Handle, delete r.HasPrivateKey, delete r.SubjectName), t;
}
function ao(e, t, r, n) {
  if (A_()) {
    e.warn(`Cannot execute Get-AuthenticodeSignature: ${t || r}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  try {
    (0, Bu.execFileSync)(...ju("ConvertTo-Json test", 10 * 1e3));
  } catch (i) {
    e.warn(`Cannot execute ConvertTo-Json: ${i.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  t != null && n(t), r && n(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${r}. Failing signature validation due to unknown stderr.`));
}
function A_() {
  const e = v_.release();
  return e.startsWith("6.") && !e.startsWith("6.3");
}
Object.defineProperty(Br, "__esModule", { value: !0 });
Br.NsisUpdater = void 0;
const On = ue, El = ee, T_ = kt, S_ = en, yl = At, C_ = se, b_ = _t, R_ = aa, vl = wt;
class O_ extends T_.BaseUpdater {
  constructor(t, r) {
    super(t, r), this._verifyUpdateCodeSignature = (n, i) => (0, R_.verifySignature)(n, i, this._logger);
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
    const r = t.updateInfoAndProvider.provider, n = (0, C_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "exe");
    return this.executeDownload({
      fileExtension: "exe",
      downloadUpdateOptions: t,
      fileInfo: n,
      task: async (i, o, a, s) => {
        const l = n.packageInfo, h = l != null && a != null;
        if (h && t.disableWebInstaller)
          throw (0, On.newError)(`Unable to download new version ${t.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
        !h && !t.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (h || t.disableDifferentialDownload || await this.differentialDownloadInstaller(n, t, i, r, On.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(n.url, i, o);
        const c = await this.verifySignature(i);
        if (c != null)
          throw await s(), (0, On.newError)(`New version ${t.updateInfoAndProvider.info.version} is not signed by the application owner: ${c}`, "ERR_UPDATER_INVALID_SIGNATURE");
        if (h && await this.differentialDownloadWebPackage(t, l, a, r))
          try {
            await this.httpExecutor.download(new vl.URL(l.path), a, {
              headers: t.requestHeaders,
              cancellationToken: t.cancellationToken,
              sha512: l.sha512
            });
          } catch (f) {
            try {
              await (0, b_.unlink)(a);
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
    let r;
    try {
      if (r = (await this.configOnDisk.value).publisherName, r == null)
        return null;
    } catch (n) {
      if (n.code === "ENOENT")
        return null;
      throw n;
    }
    return await this._verifyUpdateCodeSignature(Array.isArray(r) ? r : [r], t);
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const n = ["--updated"];
    t.isSilent && n.push("/S"), t.isForceRunAfter && n.push("--force-run"), this.installDirectory && n.push(`/D=${this.installDirectory}`);
    const i = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
    i != null && n.push(`--package-file=${i}`);
    const o = () => {
      this.spawnLog(El.join(process.resourcesPath, "elevate.exe"), [r].concat(n)).catch((a) => this.dispatchError(a));
    };
    return t.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), o(), !0) : (this.spawnLog(r, n).catch((a) => {
      const s = a.code;
      this._logger.info(`Cannot run installer: error code: ${s}, error message: "${a.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), s === "UNKNOWN" || s === "EACCES" ? o() : s === "ENOENT" ? Ft.shell.openPath(r).catch((l) => this.dispatchError(l)) : this.dispatchError(a);
    }), !0);
  }
  async differentialDownloadWebPackage(t, r, n, i) {
    if (r.blockMapSize == null)
      return !0;
    try {
      const o = {
        newUrl: new vl.URL(r.path),
        oldFile: El.join(this.downloadedUpdateHelper.cacheDir, On.CURRENT_APP_PACKAGE_FILE_NAME),
        logger: this._logger,
        newFile: n,
        requestHeaders: this.requestHeaders,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        cancellationToken: t.cancellationToken
      };
      this.listenerCount(yl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(yl.DOWNLOAD_PROGRESS, a)), await new S_.FileWithEmbeddedBlockMapDifferentialDownloader(r, this.httpExecutor, o).download();
    } catch (o) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${o.stack || o}`), process.platform === "win32";
    }
    return !1;
  }
}
Br.NsisUpdater = O_;
(function(e) {
  var t = Se && Se.__createBinding || (Object.create ? function(A, T, S, D) {
    D === void 0 && (D = S);
    var L = Object.getOwnPropertyDescriptor(T, S);
    (!L || ("get" in L ? !T.__esModule : L.writable || L.configurable)) && (L = { enumerable: !0, get: function() {
      return T[S];
    } }), Object.defineProperty(A, D, L);
  } : function(A, T, S, D) {
    D === void 0 && (D = S), A[D] = T[S];
  }), r = Se && Se.__exportStar || function(A, T) {
    for (var S in A) S !== "default" && !Object.prototype.hasOwnProperty.call(T, S) && t(T, A, S);
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
  const n = _t, i = ee;
  var o = kt;
  Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
    return o.BaseUpdater;
  } });
  var a = pt;
  Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
    return a.AppUpdater;
  } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
    return a.NoOpLogger;
  } });
  var s = se;
  Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
    return s.Provider;
  } });
  var l = Lr;
  Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
    return l.AppImageUpdater;
  } });
  var h = xr;
  Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
    return h.DebUpdater;
  } });
  var c = Ur;
  Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
    return c.PacmanUpdater;
  } });
  var f = kr;
  Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
    return f.RpmUpdater;
  } });
  var g = Mr;
  Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
    return g.MacUpdater;
  } });
  var m = Br;
  Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
    return m.NsisUpdater;
  } }), r(At, e);
  let v;
  function y() {
    if (process.platform === "win32")
      v = new Br.NsisUpdater();
    else if (process.platform === "darwin")
      v = new Mr.MacUpdater();
    else {
      v = new Lr.AppImageUpdater();
      try {
        const A = i.join(process.resourcesPath, "package-type");
        if (!(0, n.existsSync)(A))
          return v;
        switch ((0, n.readFileSync)(A).toString().trim()) {
          case "deb":
            v = new xr.DebUpdater();
            break;
          case "rpm":
            v = new kr.RpmUpdater();
            break;
          case "pacman":
            v = new Ur.PacmanUpdater();
            break;
          default:
            break;
        }
      } catch (A) {
        console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", A.message);
      }
    }
    return v;
  }
  Object.defineProperty(e, "autoUpdater", {
    enumerable: !0,
    get: () => v || y()
  });
})(Gr);
const Hu = dt.dirname(Qf(import.meta.url));
process.env.APP_ROOT = dt.join(Hu, "..");
const Vn = process.env.VITE_DEV_SERVER_URL, Y_ = dt.join(process.env.APP_ROOT, "dist-electron"), Gu = dt.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Vn ? dt.join(process.env.APP_ROOT, "public") : Gu;
let Pe;
function qu() {
  Pe = new wl({
    icon: dt.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: dt.join(Hu, "preload.mjs")
    }
  }), Pe.webContents.on("did-finish-load", () => {
    Pe == null || Pe.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), Vn ? Pe.loadURL(Vn) : Pe.loadFile(dt.join(Gu, "index.html"));
}
$n.on("window-all-closed", () => {
  process.platform !== "darwin" && ($n.quit(), Pe = null);
});
$n.on("activate", () => {
  wl.getAllWindows().length === 0 && qu();
});
$n.whenReady().then(() => {
  qu(), Vn || Gr.autoUpdater.checkForUpdatesAndNotify();
});
Gr.autoUpdater.on("update-available", () => {
  Pe == null || Pe.webContents.send("update-available");
});
Gr.autoUpdater.on("update-downloaded", () => {
  Pe == null || Pe.webContents.send("update-downloaded");
});
zf.on("restart_app", () => {
  Gr.autoUpdater.quitAndInstall();
});
export {
  Y_ as MAIN_DIST,
  Gu as RENDERER_DIST,
  Vn as VITE_DEV_SERVER_URL
};

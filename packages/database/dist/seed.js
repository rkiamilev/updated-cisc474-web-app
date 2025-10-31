"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/dotenv/package.json
var require_package = __commonJS({
  "../../node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.6.1",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// ../../node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "../../node_modules/dotenv/lib/main.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var crypto2 = require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i2 = 0; i2 < length; i2++) {
        try {
          const key = keys[i2].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i2 + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e2) {
          if (debug) {
            _debug(`Failed to load ${path2} ${e2.message}`);
          }
          lastError = e2;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (debug || !quiet) {
        const keysCount = Object.keys(parsedAll).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e2) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e2.message}`);
            }
            lastError = e2;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto2.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// ../../node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "../../node_modules/dotenv/lib/env-options.js"(exports2, module2) {
    "use strict";
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_QUIET != null) {
      options.quiet = process.env.DOTENV_CONFIG_QUIET;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
    }
    module2.exports = options;
  }
});

// ../../node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "../../node_modules/dotenv/lib/cli-options.js"(exports2, module2) {
    "use strict";
    var re3 = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
    module2.exports = function optionMatcher(args) {
      const options = args.reduce(function(acc, cur) {
        const matches = cur.match(re3);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
      if (!("quiet" in options)) {
        options.quiet = "true";
      }
      return options;
    };
  }
});

// generated/client/runtime/library.js
var require_library = __commonJS({
  "generated/client/runtime/library.js"(exports2, module2) {
    "use strict";
    var yu = Object.create;
    var jt = Object.defineProperty;
    var bu = Object.getOwnPropertyDescriptor;
    var Eu = Object.getOwnPropertyNames;
    var wu = Object.getPrototypeOf;
    var xu = Object.prototype.hasOwnProperty;
    var Do = (e2, r2) => () => (e2 && (r2 = e2(e2 = 0)), r2);
    var ue3 = (e2, r2) => () => (r2 || e2((r2 = { exports: {} }).exports, r2), r2.exports);
    var tr3 = (e2, r2) => {
      for (var t2 in r2) jt(e2, t2, { get: r2[t2], enumerable: true });
    };
    var Oo = (e2, r2, t2, n2) => {
      if (r2 && typeof r2 == "object" || typeof r2 == "function") for (let i2 of Eu(r2)) !xu.call(e2, i2) && i2 !== t2 && jt(e2, i2, { get: () => r2[i2], enumerable: !(n2 = bu(r2, i2)) || n2.enumerable });
      return e2;
    };
    var O3 = (e2, r2, t2) => (t2 = e2 != null ? yu(wu(e2)) : {}, Oo(r2 || !e2 || !e2.__esModule ? jt(t2, "default", { value: e2, enumerable: true }) : t2, e2));
    var vu = (e2) => Oo(jt({}, "__esModule", { value: true }), e2);
    var hi = ue3((_g, is) => {
      "use strict";
      is.exports = (e2, r2 = process.argv) => {
        let t2 = e2.startsWith("-") ? "" : e2.length === 1 ? "-" : "--", n2 = r2.indexOf(t2 + e2), i2 = r2.indexOf("--");
        return n2 !== -1 && (i2 === -1 || n2 < i2);
      };
    });
    var as = ue3((Ng, ss) => {
      "use strict";
      var Fc = require("os"), os = require("tty"), de3 = hi(), { env: G3 } = process, Qe3;
      de3("no-color") || de3("no-colors") || de3("color=false") || de3("color=never") ? Qe3 = 0 : (de3("color") || de3("colors") || de3("color=true") || de3("color=always")) && (Qe3 = 1);
      "FORCE_COLOR" in G3 && (G3.FORCE_COLOR === "true" ? Qe3 = 1 : G3.FORCE_COLOR === "false" ? Qe3 = 0 : Qe3 = G3.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(G3.FORCE_COLOR, 10), 3));
      function yi(e2) {
        return e2 === 0 ? false : { level: e2, hasBasic: true, has256: e2 >= 2, has16m: e2 >= 3 };
      }
      function bi(e2, r2) {
        if (Qe3 === 0) return 0;
        if (de3("color=16m") || de3("color=full") || de3("color=truecolor")) return 3;
        if (de3("color=256")) return 2;
        if (e2 && !r2 && Qe3 === void 0) return 0;
        let t2 = Qe3 || 0;
        if (G3.TERM === "dumb") return t2;
        if (process.platform === "win32") {
          let n2 = Fc.release().split(".");
          return Number(n2[0]) >= 10 && Number(n2[2]) >= 10586 ? Number(n2[2]) >= 14931 ? 3 : 2 : 1;
        }
        if ("CI" in G3) return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((n2) => n2 in G3) || G3.CI_NAME === "codeship" ? 1 : t2;
        if ("TEAMCITY_VERSION" in G3) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(G3.TEAMCITY_VERSION) ? 1 : 0;
        if (G3.COLORTERM === "truecolor") return 3;
        if ("TERM_PROGRAM" in G3) {
          let n2 = parseInt((G3.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
          switch (G3.TERM_PROGRAM) {
            case "iTerm.app":
              return n2 >= 3 ? 3 : 2;
            case "Apple_Terminal":
              return 2;
          }
        }
        return /-256(color)?$/i.test(G3.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(G3.TERM) || "COLORTERM" in G3 ? 1 : t2;
      }
      function Mc(e2) {
        let r2 = bi(e2, e2 && e2.isTTY);
        return yi(r2);
      }
      ss.exports = { supportsColor: Mc, stdout: yi(bi(true, os.isatty(1))), stderr: yi(bi(true, os.isatty(2))) };
    });
    var cs = ue3((Lg, us) => {
      "use strict";
      var $c = as(), br3 = hi();
      function ls(e2) {
        if (/^\d{3,4}$/.test(e2)) {
          let t2 = /(\d{1,2})(\d{2})/.exec(e2) || [];
          return { major: 0, minor: parseInt(t2[1], 10), patch: parseInt(t2[2], 10) };
        }
        let r2 = (e2 || "").split(".").map((t2) => parseInt(t2, 10));
        return { major: r2[0], minor: r2[1], patch: r2[2] };
      }
      function Ei(e2) {
        let { CI: r2, FORCE_HYPERLINK: t2, NETLIFY: n2, TEAMCITY_VERSION: i2, TERM_PROGRAM: o2, TERM_PROGRAM_VERSION: s2, VTE_VERSION: a2, TERM: l2 } = process.env;
        if (t2) return !(t2.length > 0 && parseInt(t2, 10) === 0);
        if (br3("no-hyperlink") || br3("no-hyperlinks") || br3("hyperlink=false") || br3("hyperlink=never")) return false;
        if (br3("hyperlink=true") || br3("hyperlink=always") || n2) return true;
        if (!$c.supportsColor(e2) || e2 && !e2.isTTY) return false;
        if ("WT_SESSION" in process.env) return true;
        if (process.platform === "win32" || r2 || i2) return false;
        if (o2) {
          let u2 = ls(s2 || "");
          switch (o2) {
            case "iTerm.app":
              return u2.major === 3 ? u2.minor >= 1 : u2.major > 3;
            case "WezTerm":
              return u2.major >= 20200620;
            case "vscode":
              return u2.major > 1 || u2.major === 1 && u2.minor >= 72;
            case "ghostty":
              return true;
          }
        }
        if (a2) {
          if (a2 === "0.50.0") return false;
          let u2 = ls(a2);
          return u2.major > 0 || u2.minor >= 50;
        }
        switch (l2) {
          case "alacritty":
            return true;
        }
        return false;
      }
      us.exports = { supportsHyperlink: Ei, stdout: Ei(process.stdout), stderr: Ei(process.stderr) };
    });
    var ps = ue3((Kg, qc) => {
      qc.exports = { name: "@prisma/internals", version: "6.18.0", description: "This package is intended for Prisma's internal use", main: "dist/index.js", types: "dist/index.d.ts", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/internals" }, homepage: "https://www.prisma.io", author: "Tim Suchanek <suchanek@prisma.io>", bugs: "https://github.com/prisma/prisma/issues", license: "Apache-2.0", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", test: "dotenv -e ../../.db.env -- jest --silent", prepublishOnly: "pnpm run build" }, files: ["README.md", "dist", "!**/libquery_engine*", "!dist/get-generators/engines/*", "scripts"], devDependencies: { "@babel/helper-validator-identifier": "7.25.9", "@opentelemetry/api": "1.9.0", "@swc/core": "1.11.5", "@swc/jest": "0.2.37", "@types/babel__helper-validator-identifier": "7.15.2", "@types/jest": "29.5.14", "@types/node": "18.19.76", "@types/resolve": "1.20.6", archiver: "6.0.2", "checkpoint-client": "1.1.33", "cli-truncate": "4.0.0", dotenv: "16.5.0", empathic: "2.0.0", "escape-string-regexp": "5.0.0", execa: "8.0.1", "fast-glob": "3.3.3", "find-up": "7.0.0", "fp-ts": "2.16.9", "fs-extra": "11.3.0", "global-directory": "4.0.0", globby: "11.1.0", "identifier-regex": "1.0.0", "indent-string": "4.0.0", "is-windows": "1.0.2", "is-wsl": "3.1.0", jest: "29.7.0", "jest-junit": "16.0.0", kleur: "4.1.5", "mock-stdin": "1.0.0", "new-github-issue-url": "0.2.1", "node-fetch": "3.3.2", "npm-packlist": "5.1.3", open: "7.4.2", "p-map": "4.0.0", resolve: "1.22.10", "string-width": "7.2.0", "strip-indent": "4.0.0", "temp-dir": "2.0.0", tempy: "1.0.1", "terminal-link": "4.0.0", tmp: "0.2.3", "ts-pattern": "5.6.2", "ts-toolbelt": "9.6.0", typescript: "5.4.5", yarn: "1.22.22" }, dependencies: { "@prisma/config": "workspace:*", "@prisma/debug": "workspace:*", "@prisma/dmmf": "workspace:*", "@prisma/driver-adapter-utils": "workspace:*", "@prisma/engines": "workspace:*", "@prisma/fetch-engine": "workspace:*", "@prisma/generator": "workspace:*", "@prisma/generator-helper": "workspace:*", "@prisma/get-platform": "workspace:*", "@prisma/prisma-schema-wasm": "6.18.0-8.34b5a692b7bd79939a9a2c3ef97d816e749cda2f", "@prisma/schema-engine-wasm": "6.18.0-8.34b5a692b7bd79939a9a2c3ef97d816e749cda2f", "@prisma/schema-files-loader": "workspace:*", arg: "5.0.2", prompts: "2.4.2" }, peerDependencies: { typescript: ">=5.1.0" }, peerDependenciesMeta: { typescript: { optional: true } }, sideEffects: false };
    });
    var Ti = ue3((gh, Qc) => {
      Qc.exports = { name: "@prisma/engines-version", version: "6.18.0-8.34b5a692b7bd79939a9a2c3ef97d816e749cda2f", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "34b5a692b7bd79939a9a2c3ef97d816e749cda2f" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } };
    });
    var on = ue3((nn) => {
      "use strict";
      Object.defineProperty(nn, "__esModule", { value: true });
      nn.enginesVersion = void 0;
      nn.enginesVersion = Ti().prisma.enginesVersion;
    });
    var hs = ue3((Ih, gs) => {
      "use strict";
      gs.exports = (e2) => {
        let r2 = e2.match(/^[ \t]*(?=\S)/gm);
        return r2 ? r2.reduce((t2, n2) => Math.min(t2, n2.length), 1 / 0) : 0;
      };
    });
    var Di = ue3((kh, Es) => {
      "use strict";
      Es.exports = (e2, r2 = 1, t2) => {
        if (t2 = { indent: " ", includeEmptyLines: false, ...t2 }, typeof e2 != "string") throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof e2}\``);
        if (typeof r2 != "number") throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof r2}\``);
        if (typeof t2.indent != "string") throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof t2.indent}\``);
        if (r2 === 0) return e2;
        let n2 = t2.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
        return e2.replace(n2, t2.indent.repeat(r2));
      };
    });
    var vs = ue3((jh, tp) => {
      tp.exports = { name: "dotenv", version: "16.5.0", description: "Loads environment variables from .env file", main: "lib/main.js", types: "lib/main.d.ts", exports: { ".": { types: "./lib/main.d.ts", require: "./lib/main.js", default: "./lib/main.js" }, "./config": "./config.js", "./config.js": "./config.js", "./lib/env-options": "./lib/env-options.js", "./lib/env-options.js": "./lib/env-options.js", "./lib/cli-options": "./lib/cli-options.js", "./lib/cli-options.js": "./lib/cli-options.js", "./package.json": "./package.json" }, scripts: { "dts-check": "tsc --project tests/types/tsconfig.json", lint: "standard", pretest: "npm run lint && npm run dts-check", test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000", "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov", prerelease: "npm test", release: "standard-version" }, repository: { type: "git", url: "git://github.com/motdotla/dotenv.git" }, homepage: "https://github.com/motdotla/dotenv#readme", funding: "https://dotenvx.com", keywords: ["dotenv", "env", ".env", "environment", "variables", "config", "settings"], readmeFilename: "README.md", license: "BSD-2-Clause", devDependencies: { "@types/node": "^18.11.3", decache: "^4.6.2", sinon: "^14.0.1", standard: "^17.0.0", "standard-version": "^9.5.0", tap: "^19.2.0", typescript: "^4.8.4" }, engines: { node: ">=12" }, browser: { fs: false } };
    });
    var As = ue3((Bh, _e3) => {
      "use strict";
      var Fi = require("fs"), Mi = require("path"), np = require("os"), ip = require("crypto"), op = vs(), Ts = op.version, sp = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
      function ap(e2) {
        let r2 = {}, t2 = e2.toString();
        t2 = t2.replace(/\r\n?/mg, `
`);
        let n2;
        for (; (n2 = sp.exec(t2)) != null; ) {
          let i2 = n2[1], o2 = n2[2] || "";
          o2 = o2.trim();
          let s2 = o2[0];
          o2 = o2.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), s2 === '"' && (o2 = o2.replace(/\\n/g, `
`), o2 = o2.replace(/\\r/g, "\r")), r2[i2] = o2;
        }
        return r2;
      }
      function lp(e2) {
        let r2 = Rs(e2), t2 = B3.configDotenv({ path: r2 });
        if (!t2.parsed) {
          let s2 = new Error(`MISSING_DATA: Cannot parse ${r2} for an unknown reason`);
          throw s2.code = "MISSING_DATA", s2;
        }
        let n2 = Ss(e2).split(","), i2 = n2.length, o2;
        for (let s2 = 0; s2 < i2; s2++) try {
          let a2 = n2[s2].trim(), l2 = cp(t2, a2);
          o2 = B3.decrypt(l2.ciphertext, l2.key);
          break;
        } catch (a2) {
          if (s2 + 1 >= i2) throw a2;
        }
        return B3.parse(o2);
      }
      function up(e2) {
        console.log(`[dotenv@${Ts}][WARN] ${e2}`);
      }
      function ot2(e2) {
        console.log(`[dotenv@${Ts}][DEBUG] ${e2}`);
      }
      function Ss(e2) {
        return e2 && e2.DOTENV_KEY && e2.DOTENV_KEY.length > 0 ? e2.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
      }
      function cp(e2, r2) {
        let t2;
        try {
          t2 = new URL(r2);
        } catch (a2) {
          if (a2.code === "ERR_INVALID_URL") {
            let l2 = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
            throw l2.code = "INVALID_DOTENV_KEY", l2;
          }
          throw a2;
        }
        let n2 = t2.password;
        if (!n2) {
          let a2 = new Error("INVALID_DOTENV_KEY: Missing key part");
          throw a2.code = "INVALID_DOTENV_KEY", a2;
        }
        let i2 = t2.searchParams.get("environment");
        if (!i2) {
          let a2 = new Error("INVALID_DOTENV_KEY: Missing environment part");
          throw a2.code = "INVALID_DOTENV_KEY", a2;
        }
        let o2 = `DOTENV_VAULT_${i2.toUpperCase()}`, s2 = e2.parsed[o2];
        if (!s2) {
          let a2 = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o2} in your .env.vault file.`);
          throw a2.code = "NOT_FOUND_DOTENV_ENVIRONMENT", a2;
        }
        return { ciphertext: s2, key: n2 };
      }
      function Rs(e2) {
        let r2 = null;
        if (e2 && e2.path && e2.path.length > 0) if (Array.isArray(e2.path)) for (let t2 of e2.path) Fi.existsSync(t2) && (r2 = t2.endsWith(".vault") ? t2 : `${t2}.vault`);
        else r2 = e2.path.endsWith(".vault") ? e2.path : `${e2.path}.vault`;
        else r2 = Mi.resolve(process.cwd(), ".env.vault");
        return Fi.existsSync(r2) ? r2 : null;
      }
      function Ps(e2) {
        return e2[0] === "~" ? Mi.join(np.homedir(), e2.slice(1)) : e2;
      }
      function pp(e2) {
        !!(e2 && e2.debug) && ot2("Loading env from encrypted .env.vault");
        let t2 = B3._parseVault(e2), n2 = process.env;
        return e2 && e2.processEnv != null && (n2 = e2.processEnv), B3.populate(n2, t2, e2), { parsed: t2 };
      }
      function dp(e2) {
        let r2 = Mi.resolve(process.cwd(), ".env"), t2 = "utf8", n2 = !!(e2 && e2.debug);
        e2 && e2.encoding ? t2 = e2.encoding : n2 && ot2("No encoding is specified. UTF-8 is used by default");
        let i2 = [r2];
        if (e2 && e2.path) if (!Array.isArray(e2.path)) i2 = [Ps(e2.path)];
        else {
          i2 = [];
          for (let l2 of e2.path) i2.push(Ps(l2));
        }
        let o2, s2 = {};
        for (let l2 of i2) try {
          let u2 = B3.parse(Fi.readFileSync(l2, { encoding: t2 }));
          B3.populate(s2, u2, e2);
        } catch (u2) {
          n2 && ot2(`Failed to load ${l2} ${u2.message}`), o2 = u2;
        }
        let a2 = process.env;
        return e2 && e2.processEnv != null && (a2 = e2.processEnv), B3.populate(a2, s2, e2), o2 ? { parsed: s2, error: o2 } : { parsed: s2 };
      }
      function mp(e2) {
        if (Ss(e2).length === 0) return B3.configDotenv(e2);
        let r2 = Rs(e2);
        return r2 ? B3._configVault(e2) : (up(`You set DOTENV_KEY but you are missing a .env.vault file at ${r2}. Did you forget to build it?`), B3.configDotenv(e2));
      }
      function fp(e2, r2) {
        let t2 = Buffer.from(r2.slice(-64), "hex"), n2 = Buffer.from(e2, "base64"), i2 = n2.subarray(0, 12), o2 = n2.subarray(-16);
        n2 = n2.subarray(12, -16);
        try {
          let s2 = ip.createDecipheriv("aes-256-gcm", t2, i2);
          return s2.setAuthTag(o2), `${s2.update(n2)}${s2.final()}`;
        } catch (s2) {
          let a2 = s2 instanceof RangeError, l2 = s2.message === "Invalid key length", u2 = s2.message === "Unsupported state or unable to authenticate data";
          if (a2 || l2) {
            let c2 = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
            throw c2.code = "INVALID_DOTENV_KEY", c2;
          } else if (u2) {
            let c2 = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
            throw c2.code = "DECRYPTION_FAILED", c2;
          } else throw s2;
        }
      }
      function gp(e2, r2, t2 = {}) {
        let n2 = !!(t2 && t2.debug), i2 = !!(t2 && t2.override);
        if (typeof r2 != "object") {
          let o2 = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
          throw o2.code = "OBJECT_REQUIRED", o2;
        }
        for (let o2 of Object.keys(r2)) Object.prototype.hasOwnProperty.call(e2, o2) ? (i2 === true && (e2[o2] = r2[o2]), n2 && ot2(i2 === true ? `"${o2}" is already defined and WAS overwritten` : `"${o2}" is already defined and was NOT overwritten`)) : e2[o2] = r2[o2];
      }
      var B3 = { configDotenv: dp, _configVault: pp, _parseVault: lp, config: mp, decrypt: fp, parse: ap, populate: gp };
      _e3.exports.configDotenv = B3.configDotenv;
      _e3.exports._configVault = B3._configVault;
      _e3.exports._parseVault = B3._parseVault;
      _e3.exports.config = B3.config;
      _e3.exports.decrypt = B3.decrypt;
      _e3.exports.parse = B3.parse;
      _e3.exports.populate = B3.populate;
      _e3.exports = B3;
    });
    var Os = ue3((Kh, cn) => {
      "use strict";
      cn.exports = (e2 = {}) => {
        let r2;
        if (e2.repoUrl) r2 = e2.repoUrl;
        else if (e2.user && e2.repo) r2 = `https://github.com/${e2.user}/${e2.repo}`;
        else throw new Error("You need to specify either the `repoUrl` option or both the `user` and `repo` options");
        let t2 = new URL(`${r2}/issues/new`), n2 = ["body", "title", "labels", "template", "milestone", "assignee", "projects"];
        for (let i2 of n2) {
          let o2 = e2[i2];
          if (o2 !== void 0) {
            if (i2 === "labels" || i2 === "projects") {
              if (!Array.isArray(o2)) throw new TypeError(`The \`${i2}\` option should be an array`);
              o2 = o2.join(",");
            }
            t2.searchParams.set(i2, o2);
          }
        }
        return t2.toString();
      };
      cn.exports.default = cn.exports;
    });
    var Ki = ue3((vb, ea2) => {
      "use strict";
      ea2.exports = /* @__PURE__ */ (function() {
        function e2(r2, t2, n2, i2, o2) {
          return r2 < t2 || n2 < t2 ? r2 > n2 ? n2 + 1 : r2 + 1 : i2 === o2 ? t2 : t2 + 1;
        }
        return function(r2, t2) {
          if (r2 === t2) return 0;
          if (r2.length > t2.length) {
            var n2 = r2;
            r2 = t2, t2 = n2;
          }
          for (var i2 = r2.length, o2 = t2.length; i2 > 0 && r2.charCodeAt(i2 - 1) === t2.charCodeAt(o2 - 1); ) i2--, o2--;
          for (var s2 = 0; s2 < i2 && r2.charCodeAt(s2) === t2.charCodeAt(s2); ) s2++;
          if (i2 -= s2, o2 -= s2, i2 === 0 || o2 < 3) return o2;
          var a2 = 0, l2, u2, c2, p3, d2, f3, h2, g2, I3, T3, S3, b2, D3 = [];
          for (l2 = 0; l2 < i2; l2++) D3.push(l2 + 1), D3.push(r2.charCodeAt(s2 + l2));
          for (var me3 = D3.length - 1; a2 < o2 - 3; ) for (I3 = t2.charCodeAt(s2 + (u2 = a2)), T3 = t2.charCodeAt(s2 + (c2 = a2 + 1)), S3 = t2.charCodeAt(s2 + (p3 = a2 + 2)), b2 = t2.charCodeAt(s2 + (d2 = a2 + 3)), f3 = a2 += 4, l2 = 0; l2 < me3; l2 += 2) h2 = D3[l2], g2 = D3[l2 + 1], u2 = e2(h2, u2, c2, I3, g2), c2 = e2(u2, c2, p3, T3, g2), p3 = e2(c2, p3, d2, S3, g2), f3 = e2(p3, d2, f3, b2, g2), D3[l2] = f3, d2 = p3, p3 = c2, c2 = u2, u2 = h2;
          for (; a2 < o2; ) for (I3 = t2.charCodeAt(s2 + (u2 = a2)), f3 = ++a2, l2 = 0; l2 < me3; l2 += 2) h2 = D3[l2], D3[l2] = f3 = e2(h2, u2, f3, I3, D3[l2 + 1]), u2 = h2;
          return f3;
        };
      })();
    });
    var oa2 = Do(() => {
      "use strict";
    });
    var sa2 = Do(() => {
      "use strict";
    });
    var jf = {};
    tr3(jf, { DMMF: () => ct, Debug: () => N3, Decimal: () => Fe3, Extensions: () => ni, MetricsClient: () => Lr2, PrismaClientInitializationError: () => P3, PrismaClientKnownRequestError: () => z3, PrismaClientRustPanicError: () => ae3, PrismaClientUnknownRequestError: () => V3, PrismaClientValidationError: () => Z3, Public: () => ii, Sql: () => ie3, createParam: () => va2, defineDmmfProperty: () => Ca2, deserializeJsonResponse: () => Vr2, deserializeRawResult: () => Xn, dmmfToRuntimeDataModel: () => Ns, empty: () => Oa2, getPrismaClient: () => fu, getRuntime: () => Kn, join: () => Da2, makeStrictEnum: () => gu, makeTypedQueryFactory: () => Ia2, objectEnumValues: () => On, raw: () => no, serializeJsonQuery: () => $n, skip: () => Mn, sqltag: () => io, warnEnvConflicts: () => hu, warnOnce: () => at2 });
    module2.exports = vu(jf);
    var ni = {};
    tr3(ni, { defineExtension: () => ko, getExtensionContext: () => _o });
    function ko(e2) {
      return typeof e2 == "function" ? e2 : (r2) => r2.$extends(e2);
    }
    function _o(e2) {
      return e2;
    }
    var ii = {};
    tr3(ii, { validator: () => No });
    function No(...e2) {
      return (r2) => r2;
    }
    var Bt = {};
    tr3(Bt, { $: () => qo, bgBlack: () => ku, bgBlue: () => Fu, bgCyan: () => $u, bgGreen: () => Nu, bgMagenta: () => Mu, bgRed: () => _u, bgWhite: () => qu, bgYellow: () => Lu, black: () => Cu, blue: () => nr3, bold: () => W3, cyan: () => De3, dim: () => Ce3, gray: () => Hr2, green: () => qe3, grey: () => Ou, hidden: () => Ru, inverse: () => Su, italic: () => Tu, magenta: () => Iu, red: () => ce3, reset: () => Pu, strikethrough: () => Au, underline: () => Y3, white: () => Du, yellow: () => Ie3 });
    var oi;
    var Lo;
    var Fo;
    var Mo;
    var $o = true;
    typeof process < "u" && ({ FORCE_COLOR: oi, NODE_DISABLE_COLORS: Lo, NO_COLOR: Fo, TERM: Mo } = process.env || {}, $o = process.stdout && process.stdout.isTTY);
    var qo = { enabled: !Lo && Fo == null && Mo !== "dumb" && (oi != null && oi !== "0" || $o) };
    function F3(e2, r2) {
      let t2 = new RegExp(`\\x1b\\[${r2}m`, "g"), n2 = `\x1B[${e2}m`, i2 = `\x1B[${r2}m`;
      return function(o2) {
        return !qo.enabled || o2 == null ? o2 : n2 + (~("" + o2).indexOf(i2) ? o2.replace(t2, i2 + n2) : o2) + i2;
      };
    }
    var Pu = F3(0, 0);
    var W3 = F3(1, 22);
    var Ce3 = F3(2, 22);
    var Tu = F3(3, 23);
    var Y3 = F3(4, 24);
    var Su = F3(7, 27);
    var Ru = F3(8, 28);
    var Au = F3(9, 29);
    var Cu = F3(30, 39);
    var ce3 = F3(31, 39);
    var qe3 = F3(32, 39);
    var Ie3 = F3(33, 39);
    var nr3 = F3(34, 39);
    var Iu = F3(35, 39);
    var De3 = F3(36, 39);
    var Du = F3(37, 39);
    var Hr2 = F3(90, 39);
    var Ou = F3(90, 39);
    var ku = F3(40, 49);
    var _u = F3(41, 49);
    var Nu = F3(42, 49);
    var Lu = F3(43, 49);
    var Fu = F3(44, 49);
    var Mu = F3(45, 49);
    var $u = F3(46, 49);
    var qu = F3(47, 49);
    var Vu = 100;
    var Vo = ["green", "yellow", "blue", "magenta", "cyan", "red"];
    var Yr2 = [];
    var jo = Date.now();
    var ju = 0;
    var si = typeof process < "u" ? process.env : {};
    globalThis.DEBUG ??= si.DEBUG ?? "";
    globalThis.DEBUG_COLORS ??= si.DEBUG_COLORS ? si.DEBUG_COLORS === "true" : true;
    var zr2 = { enable(e2) {
      typeof e2 == "string" && (globalThis.DEBUG = e2);
    }, disable() {
      let e2 = globalThis.DEBUG;
      return globalThis.DEBUG = "", e2;
    }, enabled(e2) {
      let r2 = globalThis.DEBUG.split(",").map((i2) => i2.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), t2 = r2.some((i2) => i2 === "" || i2[0] === "-" ? false : e2.match(RegExp(i2.split("*").join(".*") + "$"))), n2 = r2.some((i2) => i2 === "" || i2[0] !== "-" ? false : e2.match(RegExp(i2.slice(1).split("*").join(".*") + "$")));
      return t2 && !n2;
    }, log: (...e2) => {
      let [r2, t2, ...n2] = e2;
      (console.warn ?? console.log)(`${r2} ${t2}`, ...n2);
    }, formatters: {} };
    function Bu(e2) {
      let r2 = { color: Vo[ju++ % Vo.length], enabled: zr2.enabled(e2), namespace: e2, log: zr2.log, extend: () => {
      } }, t2 = (...n2) => {
        let { enabled: i2, namespace: o2, color: s2, log: a2 } = r2;
        if (n2.length !== 0 && Yr2.push([o2, ...n2]), Yr2.length > Vu && Yr2.shift(), zr2.enabled(o2) || i2) {
          let l2 = n2.map((c2) => typeof c2 == "string" ? c2 : Uu(c2)), u2 = `+${Date.now() - jo}ms`;
          jo = Date.now(), globalThis.DEBUG_COLORS ? a2(Bt[s2](W3(o2)), ...l2, Bt[s2](u2)) : a2(o2, ...l2, u2);
        }
      };
      return new Proxy(t2, { get: (n2, i2) => r2[i2], set: (n2, i2, o2) => r2[i2] = o2 });
    }
    var N3 = new Proxy(Bu, { get: (e2, r2) => zr2[r2], set: (e2, r2, t2) => zr2[r2] = t2 });
    function Uu(e2, r2 = 2) {
      let t2 = /* @__PURE__ */ new Set();
      return JSON.stringify(e2, (n2, i2) => {
        if (typeof i2 == "object" && i2 !== null) {
          if (t2.has(i2)) return "[Circular *]";
          t2.add(i2);
        } else if (typeof i2 == "bigint") return i2.toString();
        return i2;
      }, r2);
    }
    function Bo(e2 = 7500) {
      let r2 = Yr2.map(([t2, ...n2]) => `${t2} ${n2.map((i2) => typeof i2 == "string" ? i2 : JSON.stringify(i2)).join(" ")}`).join(`
`);
      return r2.length < e2 ? r2 : r2.slice(-e2);
    }
    function Uo() {
      Yr2.length = 0;
    }
    var gr3 = N3;
    var Go = O3(require("fs"));
    function ai() {
      let e2 = process.env.PRISMA_QUERY_ENGINE_LIBRARY;
      if (!(e2 && Go.default.existsSync(e2)) && process.arch === "ia32") throw new Error('The default query engine type (Node-API, "library") is currently not supported for 32bit Node. Please set `engineType = "binary"` in the "generator" block of your "schema.prisma" file (or use the environment variables "PRISMA_CLIENT_ENGINE_TYPE=binary" and/or "PRISMA_CLI_QUERY_ENGINE_TYPE=binary".)');
    }
    var li = ["darwin", "darwin-arm64", "debian-openssl-1.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-arm64-openssl-1.0.x", "linux-arm64-openssl-3.0.x", "linux-arm-openssl-1.1.x", "linux-arm-openssl-1.0.x", "linux-arm-openssl-3.0.x", "linux-musl", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "linux-nixos", "linux-static-x64", "linux-static-arm64", "windows", "freebsd11", "freebsd12", "freebsd13", "freebsd14", "freebsd15", "openbsd", "netbsd", "arm"];
    var Ut = "libquery_engine";
    function Gt(e2, r2) {
      let t2 = r2 === "url";
      return e2.includes("windows") ? t2 ? "query_engine.dll.node" : `query_engine-${e2}.dll.node` : e2.includes("darwin") ? t2 ? `${Ut}.dylib.node` : `${Ut}-${e2}.dylib.node` : t2 ? `${Ut}.so.node` : `${Ut}-${e2}.so.node`;
    }
    var Ko = O3(require("child_process"));
    var mi = O3(require("fs/promises"));
    var Ht = O3(require("os"));
    var Oe3 = Symbol.for("@ts-pattern/matcher");
    var Gu = Symbol.for("@ts-pattern/isVariadic");
    var Wt = "@ts-pattern/anonymous-select-key";
    var ui = (e2) => !!(e2 && typeof e2 == "object");
    var Qt = (e2) => e2 && !!e2[Oe3];
    var Ee3 = (e2, r2, t2) => {
      if (Qt(e2)) {
        let n2 = e2[Oe3](), { matched: i2, selections: o2 } = n2.match(r2);
        return i2 && o2 && Object.keys(o2).forEach((s2) => t2(s2, o2[s2])), i2;
      }
      if (ui(e2)) {
        if (!ui(r2)) return false;
        if (Array.isArray(e2)) {
          if (!Array.isArray(r2)) return false;
          let n2 = [], i2 = [], o2 = [];
          for (let s2 of e2.keys()) {
            let a2 = e2[s2];
            Qt(a2) && a2[Gu] ? o2.push(a2) : o2.length ? i2.push(a2) : n2.push(a2);
          }
          if (o2.length) {
            if (o2.length > 1) throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
            if (r2.length < n2.length + i2.length) return false;
            let s2 = r2.slice(0, n2.length), a2 = i2.length === 0 ? [] : r2.slice(-i2.length), l2 = r2.slice(n2.length, i2.length === 0 ? 1 / 0 : -i2.length);
            return n2.every((u2, c2) => Ee3(u2, s2[c2], t2)) && i2.every((u2, c2) => Ee3(u2, a2[c2], t2)) && (o2.length === 0 || Ee3(o2[0], l2, t2));
          }
          return e2.length === r2.length && e2.every((s2, a2) => Ee3(s2, r2[a2], t2));
        }
        return Reflect.ownKeys(e2).every((n2) => {
          let i2 = e2[n2];
          return (n2 in r2 || Qt(o2 = i2) && o2[Oe3]().matcherType === "optional") && Ee3(i2, r2[n2], t2);
          var o2;
        });
      }
      return Object.is(r2, e2);
    };
    var Ge3 = (e2) => {
      var r2, t2, n2;
      return ui(e2) ? Qt(e2) ? (r2 = (t2 = (n2 = e2[Oe3]()).getSelectionKeys) == null ? void 0 : t2.call(n2)) != null ? r2 : [] : Array.isArray(e2) ? Zr2(e2, Ge3) : Zr2(Object.values(e2), Ge3) : [];
    };
    var Zr2 = (e2, r2) => e2.reduce((t2, n2) => t2.concat(r2(n2)), []);
    function pe3(e2) {
      return Object.assign(e2, { optional: () => Qu(e2), and: (r2) => q3(e2, r2), or: (r2) => Wu(e2, r2), select: (r2) => r2 === void 0 ? Qo(e2) : Qo(r2, e2) });
    }
    function Qu(e2) {
      return pe3({ [Oe3]: () => ({ match: (r2) => {
        let t2 = {}, n2 = (i2, o2) => {
          t2[i2] = o2;
        };
        return r2 === void 0 ? (Ge3(e2).forEach((i2) => n2(i2, void 0)), { matched: true, selections: t2 }) : { matched: Ee3(e2, r2, n2), selections: t2 };
      }, getSelectionKeys: () => Ge3(e2), matcherType: "optional" }) });
    }
    function q3(...e2) {
      return pe3({ [Oe3]: () => ({ match: (r2) => {
        let t2 = {}, n2 = (i2, o2) => {
          t2[i2] = o2;
        };
        return { matched: e2.every((i2) => Ee3(i2, r2, n2)), selections: t2 };
      }, getSelectionKeys: () => Zr2(e2, Ge3), matcherType: "and" }) });
    }
    function Wu(...e2) {
      return pe3({ [Oe3]: () => ({ match: (r2) => {
        let t2 = {}, n2 = (i2, o2) => {
          t2[i2] = o2;
        };
        return Zr2(e2, Ge3).forEach((i2) => n2(i2, void 0)), { matched: e2.some((i2) => Ee3(i2, r2, n2)), selections: t2 };
      }, getSelectionKeys: () => Zr2(e2, Ge3), matcherType: "or" }) });
    }
    function A3(e2) {
      return { [Oe3]: () => ({ match: (r2) => ({ matched: !!e2(r2) }) }) };
    }
    function Qo(...e2) {
      let r2 = typeof e2[0] == "string" ? e2[0] : void 0, t2 = e2.length === 2 ? e2[1] : typeof e2[0] == "string" ? void 0 : e2[0];
      return pe3({ [Oe3]: () => ({ match: (n2) => {
        let i2 = { [r2 ?? Wt]: n2 };
        return { matched: t2 === void 0 || Ee3(t2, n2, (o2, s2) => {
          i2[o2] = s2;
        }), selections: i2 };
      }, getSelectionKeys: () => [r2 ?? Wt].concat(t2 === void 0 ? [] : Ge3(t2)) }) });
    }
    function ye3(e2) {
      return typeof e2 == "number";
    }
    function Ve3(e2) {
      return typeof e2 == "string";
    }
    function je3(e2) {
      return typeof e2 == "bigint";
    }
    var eg = pe3(A3(function(e2) {
      return true;
    }));
    var Be3 = (e2) => Object.assign(pe3(e2), { startsWith: (r2) => {
      return Be3(q3(e2, (t2 = r2, A3((n2) => Ve3(n2) && n2.startsWith(t2)))));
      var t2;
    }, endsWith: (r2) => {
      return Be3(q3(e2, (t2 = r2, A3((n2) => Ve3(n2) && n2.endsWith(t2)))));
      var t2;
    }, minLength: (r2) => Be3(q3(e2, ((t2) => A3((n2) => Ve3(n2) && n2.length >= t2))(r2))), length: (r2) => Be3(q3(e2, ((t2) => A3((n2) => Ve3(n2) && n2.length === t2))(r2))), maxLength: (r2) => Be3(q3(e2, ((t2) => A3((n2) => Ve3(n2) && n2.length <= t2))(r2))), includes: (r2) => {
      return Be3(q3(e2, (t2 = r2, A3((n2) => Ve3(n2) && n2.includes(t2)))));
      var t2;
    }, regex: (r2) => {
      return Be3(q3(e2, (t2 = r2, A3((n2) => Ve3(n2) && !!n2.match(t2)))));
      var t2;
    } });
    var rg = Be3(A3(Ve3));
    var be3 = (e2) => Object.assign(pe3(e2), { between: (r2, t2) => be3(q3(e2, ((n2, i2) => A3((o2) => ye3(o2) && n2 <= o2 && i2 >= o2))(r2, t2))), lt: (r2) => be3(q3(e2, ((t2) => A3((n2) => ye3(n2) && n2 < t2))(r2))), gt: (r2) => be3(q3(e2, ((t2) => A3((n2) => ye3(n2) && n2 > t2))(r2))), lte: (r2) => be3(q3(e2, ((t2) => A3((n2) => ye3(n2) && n2 <= t2))(r2))), gte: (r2) => be3(q3(e2, ((t2) => A3((n2) => ye3(n2) && n2 >= t2))(r2))), int: () => be3(q3(e2, A3((r2) => ye3(r2) && Number.isInteger(r2)))), finite: () => be3(q3(e2, A3((r2) => ye3(r2) && Number.isFinite(r2)))), positive: () => be3(q3(e2, A3((r2) => ye3(r2) && r2 > 0))), negative: () => be3(q3(e2, A3((r2) => ye3(r2) && r2 < 0))) });
    var tg = be3(A3(ye3));
    var Ue3 = (e2) => Object.assign(pe3(e2), { between: (r2, t2) => Ue3(q3(e2, ((n2, i2) => A3((o2) => je3(o2) && n2 <= o2 && i2 >= o2))(r2, t2))), lt: (r2) => Ue3(q3(e2, ((t2) => A3((n2) => je3(n2) && n2 < t2))(r2))), gt: (r2) => Ue3(q3(e2, ((t2) => A3((n2) => je3(n2) && n2 > t2))(r2))), lte: (r2) => Ue3(q3(e2, ((t2) => A3((n2) => je3(n2) && n2 <= t2))(r2))), gte: (r2) => Ue3(q3(e2, ((t2) => A3((n2) => je3(n2) && n2 >= t2))(r2))), positive: () => Ue3(q3(e2, A3((r2) => je3(r2) && r2 > 0))), negative: () => Ue3(q3(e2, A3((r2) => je3(r2) && r2 < 0))) });
    var ng = Ue3(A3(je3));
    var ig = pe3(A3(function(e2) {
      return typeof e2 == "boolean";
    }));
    var og = pe3(A3(function(e2) {
      return typeof e2 == "symbol";
    }));
    var sg = pe3(A3(function(e2) {
      return e2 == null;
    }));
    var ag = pe3(A3(function(e2) {
      return e2 != null;
    }));
    var ci = class extends Error {
      constructor(r2) {
        let t2;
        try {
          t2 = JSON.stringify(r2);
        } catch {
          t2 = r2;
        }
        super(`Pattern matching error: no pattern matches value ${t2}`), this.input = void 0, this.input = r2;
      }
    };
    var pi = { matched: false, value: void 0 };
    function hr3(e2) {
      return new di(e2, pi);
    }
    var di = class e2 {
      constructor(r2, t2) {
        this.input = void 0, this.state = void 0, this.input = r2, this.state = t2;
      }
      with(...r2) {
        if (this.state.matched) return this;
        let t2 = r2[r2.length - 1], n2 = [r2[0]], i2;
        r2.length === 3 && typeof r2[1] == "function" ? i2 = r2[1] : r2.length > 2 && n2.push(...r2.slice(1, r2.length - 1));
        let o2 = false, s2 = {}, a2 = (u2, c2) => {
          o2 = true, s2[u2] = c2;
        }, l2 = !n2.some((u2) => Ee3(u2, this.input, a2)) || i2 && !i2(this.input) ? pi : { matched: true, value: t2(o2 ? Wt in s2 ? s2[Wt] : s2 : this.input, this.input) };
        return new e2(this.input, l2);
      }
      when(r2, t2) {
        if (this.state.matched) return this;
        let n2 = !!r2(this.input);
        return new e2(this.input, n2 ? { matched: true, value: t2(this.input, this.input) } : pi);
      }
      otherwise(r2) {
        return this.state.matched ? this.state.value : r2(this.input);
      }
      exhaustive() {
        if (this.state.matched) return this.state.value;
        throw new ci(this.input);
      }
      run() {
        return this.exhaustive();
      }
      returnType() {
        return this;
      }
    };
    var Ho = require("util");
    var Ju = { warn: Ie3("prisma:warn") };
    var Ku = { warn: () => !process.env.PRISMA_DISABLE_WARNINGS };
    function Jt(e2, ...r2) {
      Ku.warn() && console.warn(`${Ju.warn} ${e2}`, ...r2);
    }
    var Hu = (0, Ho.promisify)(Ko.default.exec);
    var ee3 = gr3("prisma:get-platform");
    var Yu = ["1.0.x", "1.1.x", "3.0.x"];
    async function Yo() {
      let e2 = Ht.default.platform(), r2 = process.arch;
      if (e2 === "freebsd") {
        let s2 = await Yt("freebsd-version");
        if (s2 && s2.trim().length > 0) {
          let l2 = /^(\d+)\.?/.exec(s2);
          if (l2) return { platform: "freebsd", targetDistro: `freebsd${l2[1]}`, arch: r2 };
        }
      }
      if (e2 !== "linux") return { platform: e2, arch: r2 };
      let t2 = await Zu(), n2 = await sc(), i2 = ec({ arch: r2, archFromUname: n2, familyDistro: t2.familyDistro }), { libssl: o2 } = await rc(i2);
      return { platform: "linux", libssl: o2, arch: r2, archFromUname: n2, ...t2 };
    }
    function zu(e2) {
      let r2 = /^ID="?([^"\n]*)"?$/im, t2 = /^ID_LIKE="?([^"\n]*)"?$/im, n2 = r2.exec(e2), i2 = n2 && n2[1] && n2[1].toLowerCase() || "", o2 = t2.exec(e2), s2 = o2 && o2[1] && o2[1].toLowerCase() || "", a2 = hr3({ id: i2, idLike: s2 }).with({ id: "alpine" }, ({ id: l2 }) => ({ targetDistro: "musl", familyDistro: l2, originalDistro: l2 })).with({ id: "raspbian" }, ({ id: l2 }) => ({ targetDistro: "arm", familyDistro: "debian", originalDistro: l2 })).with({ id: "nixos" }, ({ id: l2 }) => ({ targetDistro: "nixos", originalDistro: l2, familyDistro: "nixos" })).with({ id: "debian" }, { id: "ubuntu" }, ({ id: l2 }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l2 })).with({ id: "rhel" }, { id: "centos" }, { id: "fedora" }, ({ id: l2 }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l2 })).when(({ idLike: l2 }) => l2.includes("debian") || l2.includes("ubuntu"), ({ id: l2 }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l2 })).when(({ idLike: l2 }) => i2 === "arch" || l2.includes("arch"), ({ id: l2 }) => ({ targetDistro: "debian", familyDistro: "arch", originalDistro: l2 })).when(({ idLike: l2 }) => l2.includes("centos") || l2.includes("fedora") || l2.includes("rhel") || l2.includes("suse"), ({ id: l2 }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l2 })).otherwise(({ id: l2 }) => ({ targetDistro: void 0, familyDistro: void 0, originalDistro: l2 }));
      return ee3(`Found distro info:
${JSON.stringify(a2, null, 2)}`), a2;
    }
    async function Zu() {
      let e2 = "/etc/os-release";
      try {
        let r2 = await mi.default.readFile(e2, { encoding: "utf-8" });
        return zu(r2);
      } catch {
        return { targetDistro: void 0, familyDistro: void 0, originalDistro: void 0 };
      }
    }
    function Xu(e2) {
      let r2 = /^OpenSSL\s(\d+\.\d+)\.\d+/.exec(e2);
      if (r2) {
        let t2 = `${r2[1]}.x`;
        return zo(t2);
      }
    }
    function Wo(e2) {
      let r2 = /libssl\.so\.(\d)(\.\d)?/.exec(e2);
      if (r2) {
        let t2 = `${r2[1]}${r2[2] ?? ".0"}.x`;
        return zo(t2);
      }
    }
    function zo(e2) {
      let r2 = (() => {
        if (Xo(e2)) return e2;
        let t2 = e2.split(".");
        return t2[1] = "0", t2.join(".");
      })();
      if (Yu.includes(r2)) return r2;
    }
    function ec(e2) {
      return hr3(e2).with({ familyDistro: "musl" }, () => (ee3('Trying platform-specific paths for "alpine"'), ["/lib", "/usr/lib"])).with({ familyDistro: "debian" }, ({ archFromUname: r2 }) => (ee3('Trying platform-specific paths for "debian" (and "ubuntu")'), [`/usr/lib/${r2}-linux-gnu`, `/lib/${r2}-linux-gnu`])).with({ familyDistro: "rhel" }, () => (ee3('Trying platform-specific paths for "rhel"'), ["/lib64", "/usr/lib64"])).otherwise(({ familyDistro: r2, arch: t2, archFromUname: n2 }) => (ee3(`Don't know any platform-specific paths for "${r2}" on ${t2} (${n2})`), []));
    }
    async function rc(e2) {
      let r2 = 'grep -v "libssl.so.0"', t2 = await Jo(e2);
      if (t2) {
        ee3(`Found libssl.so file using platform-specific paths: ${t2}`);
        let o2 = Wo(t2);
        if (ee3(`The parsed libssl version is: ${o2}`), o2) return { libssl: o2, strategy: "libssl-specific-path" };
      }
      ee3('Falling back to "ldconfig" and other generic paths');
      let n2 = await Yt(`ldconfig -p | sed "s/.*=>s*//" | sed "s|.*/||" | grep libssl | sort | ${r2}`);
      if (n2 || (n2 = await Jo(["/lib64", "/usr/lib64", "/lib", "/usr/lib"])), n2) {
        ee3(`Found libssl.so file using "ldconfig" or other generic paths: ${n2}`);
        let o2 = Wo(n2);
        if (ee3(`The parsed libssl version is: ${o2}`), o2) return { libssl: o2, strategy: "ldconfig" };
      }
      let i2 = await Yt("openssl version -v");
      if (i2) {
        ee3(`Found openssl binary with version: ${i2}`);
        let o2 = Xu(i2);
        if (ee3(`The parsed openssl version is: ${o2}`), o2) return { libssl: o2, strategy: "openssl-binary" };
      }
      return ee3("Couldn't find any version of libssl or OpenSSL in the system"), {};
    }
    async function Jo(e2) {
      for (let r2 of e2) {
        let t2 = await tc(r2);
        if (t2) return t2;
      }
    }
    async function tc(e2) {
      try {
        return (await mi.default.readdir(e2)).find((t2) => t2.startsWith("libssl.so.") && !t2.startsWith("libssl.so.0"));
      } catch (r2) {
        if (r2.code === "ENOENT") return;
        throw r2;
      }
    }
    async function ir3() {
      let { binaryTarget: e2 } = await Zo();
      return e2;
    }
    function nc(e2) {
      return e2.binaryTarget !== void 0;
    }
    async function fi() {
      let { memoized: e2, ...r2 } = await Zo();
      return r2;
    }
    var Kt = {};
    async function Zo() {
      if (nc(Kt)) return Promise.resolve({ ...Kt, memoized: true });
      let e2 = await Yo(), r2 = ic(e2);
      return Kt = { ...e2, binaryTarget: r2 }, { ...Kt, memoized: false };
    }
    function ic(e2) {
      let { platform: r2, arch: t2, archFromUname: n2, libssl: i2, targetDistro: o2, familyDistro: s2, originalDistro: a2 } = e2;
      r2 === "linux" && !["x64", "arm64"].includes(t2) && Jt(`Prisma only officially supports Linux on amd64 (x86_64) and arm64 (aarch64) system architectures (detected "${t2}" instead). If you are using your own custom Prisma engines, you can ignore this warning, as long as you've compiled the engines for your system architecture "${n2}".`);
      let l2 = "1.1.x";
      if (r2 === "linux" && i2 === void 0) {
        let c2 = hr3({ familyDistro: s2 }).with({ familyDistro: "debian" }, () => "Please manually install OpenSSL via `apt-get update -y && apt-get install -y openssl` and try installing Prisma again. If you're running Prisma on Docker, add this command to your Dockerfile, or switch to an image that already has OpenSSL installed.").otherwise(() => "Please manually install OpenSSL and try installing Prisma again.");
        Jt(`Prisma failed to detect the libssl/openssl version to use, and may not work as expected. Defaulting to "openssl-${l2}".
${c2}`);
      }
      let u2 = "debian";
      if (r2 === "linux" && o2 === void 0 && ee3(`Distro is "${a2}". Falling back to Prisma engines built for "${u2}".`), r2 === "darwin" && t2 === "arm64") return "darwin-arm64";
      if (r2 === "darwin") return "darwin";
      if (r2 === "win32") return "windows";
      if (r2 === "freebsd") return o2;
      if (r2 === "openbsd") return "openbsd";
      if (r2 === "netbsd") return "netbsd";
      if (r2 === "linux" && o2 === "nixos") return "linux-nixos";
      if (r2 === "linux" && t2 === "arm64") return `${o2 === "musl" ? "linux-musl-arm64" : "linux-arm64"}-openssl-${i2 || l2}`;
      if (r2 === "linux" && t2 === "arm") return `linux-arm-openssl-${i2 || l2}`;
      if (r2 === "linux" && o2 === "musl") {
        let c2 = "linux-musl";
        return !i2 || Xo(i2) ? c2 : `${c2}-openssl-${i2}`;
      }
      return r2 === "linux" && o2 && i2 ? `${o2}-openssl-${i2}` : (r2 !== "linux" && Jt(`Prisma detected unknown OS "${r2}" and may not work as expected. Defaulting to "linux".`), i2 ? `${u2}-openssl-${i2}` : o2 ? `${o2}-openssl-${l2}` : `${u2}-openssl-${l2}`);
    }
    async function oc(e2) {
      try {
        return await e2();
      } catch {
        return;
      }
    }
    function Yt(e2) {
      return oc(async () => {
        let r2 = await Hu(e2);
        return ee3(`Command "${e2}" successfully returned "${r2.stdout}"`), r2.stdout;
      });
    }
    async function sc() {
      return typeof Ht.default.machine == "function" ? Ht.default.machine() : (await Yt("uname -m"))?.trim();
    }
    function Xo(e2) {
      return e2.startsWith("1.");
    }
    var Xt = {};
    tr3(Xt, { beep: () => kc, clearScreen: () => Cc, clearTerminal: () => Ic, cursorBackward: () => mc, cursorDown: () => pc, cursorForward: () => dc, cursorGetPosition: () => hc, cursorHide: () => Ec, cursorLeft: () => ts, cursorMove: () => cc, cursorNextLine: () => yc, cursorPrevLine: () => bc, cursorRestorePosition: () => gc, cursorSavePosition: () => fc, cursorShow: () => wc, cursorTo: () => uc, cursorUp: () => rs, enterAlternativeScreen: () => Dc, eraseDown: () => Tc, eraseEndLine: () => vc, eraseLine: () => ns, eraseLines: () => xc, eraseScreen: () => gi, eraseStartLine: () => Pc, eraseUp: () => Sc, exitAlternativeScreen: () => Oc, iTerm: () => Lc, image: () => Nc, link: () => _c, scrollDown: () => Ac, scrollUp: () => Rc });
    var Zt = O3(require("process"), 1);
    var zt = globalThis.window?.document !== void 0;
    var gg = globalThis.process?.versions?.node !== void 0;
    var hg = globalThis.process?.versions?.bun !== void 0;
    var yg = globalThis.Deno?.version?.deno !== void 0;
    var bg = globalThis.process?.versions?.electron !== void 0;
    var Eg = globalThis.navigator?.userAgent?.includes("jsdom") === true;
    var wg = typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
    var xg = typeof DedicatedWorkerGlobalScope < "u" && globalThis instanceof DedicatedWorkerGlobalScope;
    var vg = typeof SharedWorkerGlobalScope < "u" && globalThis instanceof SharedWorkerGlobalScope;
    var Pg = typeof ServiceWorkerGlobalScope < "u" && globalThis instanceof ServiceWorkerGlobalScope;
    var Xr2 = globalThis.navigator?.userAgentData?.platform;
    var Tg = Xr2 === "macOS" || globalThis.navigator?.platform === "MacIntel" || globalThis.navigator?.userAgent?.includes(" Mac ") === true || globalThis.process?.platform === "darwin";
    var Sg = Xr2 === "Windows" || globalThis.navigator?.platform === "Win32" || globalThis.process?.platform === "win32";
    var Rg = Xr2 === "Linux" || globalThis.navigator?.platform?.startsWith("Linux") === true || globalThis.navigator?.userAgent?.includes(" Linux ") === true || globalThis.process?.platform === "linux";
    var Ag = Xr2 === "iOS" || globalThis.navigator?.platform === "MacIntel" && globalThis.navigator?.maxTouchPoints > 1 || /iPad|iPhone|iPod/.test(globalThis.navigator?.platform);
    var Cg = Xr2 === "Android" || globalThis.navigator?.platform === "Android" || globalThis.navigator?.userAgent?.includes(" Android ") === true || globalThis.process?.platform === "android";
    var C2 = "\x1B[";
    var rt2 = "\x1B]";
    var yr2 = "\x07";
    var et2 = ";";
    var es = !zt && Zt.default.env.TERM_PROGRAM === "Apple_Terminal";
    var ac = !zt && Zt.default.platform === "win32";
    var lc = zt ? () => {
      throw new Error("`process.cwd()` only works in Node.js, not the browser.");
    } : Zt.default.cwd;
    var uc = (e2, r2) => {
      if (typeof e2 != "number") throw new TypeError("The `x` argument is required");
      return typeof r2 != "number" ? C2 + (e2 + 1) + "G" : C2 + (r2 + 1) + et2 + (e2 + 1) + "H";
    };
    var cc = (e2, r2) => {
      if (typeof e2 != "number") throw new TypeError("The `x` argument is required");
      let t2 = "";
      return e2 < 0 ? t2 += C2 + -e2 + "D" : e2 > 0 && (t2 += C2 + e2 + "C"), r2 < 0 ? t2 += C2 + -r2 + "A" : r2 > 0 && (t2 += C2 + r2 + "B"), t2;
    };
    var rs = (e2 = 1) => C2 + e2 + "A";
    var pc = (e2 = 1) => C2 + e2 + "B";
    var dc = (e2 = 1) => C2 + e2 + "C";
    var mc = (e2 = 1) => C2 + e2 + "D";
    var ts = C2 + "G";
    var fc = es ? "\x1B7" : C2 + "s";
    var gc = es ? "\x1B8" : C2 + "u";
    var hc = C2 + "6n";
    var yc = C2 + "E";
    var bc = C2 + "F";
    var Ec = C2 + "?25l";
    var wc = C2 + "?25h";
    var xc = (e2) => {
      let r2 = "";
      for (let t2 = 0; t2 < e2; t2++) r2 += ns + (t2 < e2 - 1 ? rs() : "");
      return e2 && (r2 += ts), r2;
    };
    var vc = C2 + "K";
    var Pc = C2 + "1K";
    var ns = C2 + "2K";
    var Tc = C2 + "J";
    var Sc = C2 + "1J";
    var gi = C2 + "2J";
    var Rc = C2 + "S";
    var Ac = C2 + "T";
    var Cc = "\x1Bc";
    var Ic = ac ? `${gi}${C2}0f` : `${gi}${C2}3J${C2}H`;
    var Dc = C2 + "?1049h";
    var Oc = C2 + "?1049l";
    var kc = yr2;
    var _c = (e2, r2) => [rt2, "8", et2, et2, r2, yr2, e2, rt2, "8", et2, et2, yr2].join("");
    var Nc = (e2, r2 = {}) => {
      let t2 = `${rt2}1337;File=inline=1`;
      return r2.width && (t2 += `;width=${r2.width}`), r2.height && (t2 += `;height=${r2.height}`), r2.preserveAspectRatio === false && (t2 += ";preserveAspectRatio=0"), t2 + ":" + Buffer.from(e2).toString("base64") + yr2;
    };
    var Lc = { setCwd: (e2 = lc()) => `${rt2}50;CurrentDir=${e2}${yr2}`, annotation(e2, r2 = {}) {
      let t2 = `${rt2}1337;`, n2 = r2.x !== void 0, i2 = r2.y !== void 0;
      if ((n2 || i2) && !(n2 && i2 && r2.length !== void 0)) throw new Error("`x`, `y` and `length` must be defined when `x` or `y` is defined");
      return e2 = e2.replaceAll("|", ""), t2 += r2.isHidden ? "AddHiddenAnnotation=" : "AddAnnotation=", r2.length > 0 ? t2 += (n2 ? [e2, r2.length, r2.x, r2.y] : [r2.length, e2]).join("|") : t2 += e2, t2 + yr2;
    } };
    var en = O3(cs(), 1);
    function or3(e2, r2, { target: t2 = "stdout", ...n2 } = {}) {
      return en.default[t2] ? Xt.link(e2, r2) : n2.fallback === false ? e2 : typeof n2.fallback == "function" ? n2.fallback(e2, r2) : `${e2} (\u200B${r2}\u200B)`;
    }
    or3.isSupported = en.default.stdout;
    or3.stderr = (e2, r2, t2 = {}) => or3(e2, r2, { target: "stderr", ...t2 });
    or3.stderr.isSupported = en.default.stderr;
    function wi(e2) {
      return or3(e2, e2, { fallback: Y3 });
    }
    var Vc = ps();
    var xi = Vc.version;
    function Er2(e2) {
      let r2 = jc();
      return r2 || (e2?.config.engineType === "library" ? "library" : e2?.config.engineType === "binary" ? "binary" : e2?.config.engineType === "client" ? "client" : Bc());
    }
    function jc() {
      let e2 = process.env.PRISMA_CLIENT_ENGINE_TYPE;
      return e2 === "library" ? "library" : e2 === "binary" ? "binary" : e2 === "client" ? "client" : void 0;
    }
    function Bc() {
      return "library";
    }
    function vi(e2) {
      return e2.name === "DriverAdapterError" && typeof e2.cause == "object";
    }
    function rn(e2) {
      return { ok: true, value: e2, map(r2) {
        return rn(r2(e2));
      }, flatMap(r2) {
        return r2(e2);
      } };
    }
    function sr3(e2) {
      return { ok: false, error: e2, map() {
        return sr3(e2);
      }, flatMap() {
        return sr3(e2);
      } };
    }
    var ds = N3("driver-adapter-utils");
    var Pi = class {
      registeredErrors = [];
      consumeError(r2) {
        return this.registeredErrors[r2];
      }
      registerNewError(r2) {
        let t2 = 0;
        for (; this.registeredErrors[t2] !== void 0; ) t2++;
        return this.registeredErrors[t2] = { error: r2 }, t2;
      }
    };
    var tn = (e2, r2 = new Pi()) => {
      let t2 = { adapterName: e2.adapterName, errorRegistry: r2, queryRaw: ke3(r2, e2.queryRaw.bind(e2)), executeRaw: ke3(r2, e2.executeRaw.bind(e2)), executeScript: ke3(r2, e2.executeScript.bind(e2)), dispose: ke3(r2, e2.dispose.bind(e2)), provider: e2.provider, startTransaction: async (...n2) => (await ke3(r2, e2.startTransaction.bind(e2))(...n2)).map((o2) => Uc(r2, o2)) };
      return e2.getConnectionInfo && (t2.getConnectionInfo = Gc(r2, e2.getConnectionInfo.bind(e2))), t2;
    };
    var Uc = (e2, r2) => ({ adapterName: r2.adapterName, provider: r2.provider, options: r2.options, queryRaw: ke3(e2, r2.queryRaw.bind(r2)), executeRaw: ke3(e2, r2.executeRaw.bind(r2)), commit: ke3(e2, r2.commit.bind(r2)), rollback: ke3(e2, r2.rollback.bind(r2)) });
    function ke3(e2, r2) {
      return async (...t2) => {
        try {
          return rn(await r2(...t2));
        } catch (n2) {
          if (ds("[error@wrapAsync]", n2), vi(n2)) return sr3(n2.cause);
          let i2 = e2.registerNewError(n2);
          return sr3({ kind: "GenericJs", id: i2 });
        }
      };
    }
    function Gc(e2, r2) {
      return (...t2) => {
        try {
          return rn(r2(...t2));
        } catch (n2) {
          if (ds("[error@wrapSync]", n2), vi(n2)) return sr3(n2.cause);
          let i2 = e2.registerNewError(n2);
          return sr3({ kind: "GenericJs", id: i2 });
        }
      };
    }
    var Wc = O3(on());
    var M2 = O3(require("path"));
    var Jc = O3(on());
    var wh = N3("prisma:engines");
    function ms() {
      return M2.default.join(__dirname, "../");
    }
    M2.default.join(__dirname, "../query-engine-darwin");
    M2.default.join(__dirname, "../query-engine-darwin-arm64");
    M2.default.join(__dirname, "../query-engine-debian-openssl-1.0.x");
    M2.default.join(__dirname, "../query-engine-debian-openssl-1.1.x");
    M2.default.join(__dirname, "../query-engine-debian-openssl-3.0.x");
    M2.default.join(__dirname, "../query-engine-linux-static-x64");
    M2.default.join(__dirname, "../query-engine-linux-static-arm64");
    M2.default.join(__dirname, "../query-engine-rhel-openssl-1.0.x");
    M2.default.join(__dirname, "../query-engine-rhel-openssl-1.1.x");
    M2.default.join(__dirname, "../query-engine-rhel-openssl-3.0.x");
    M2.default.join(__dirname, "../libquery_engine-darwin.dylib.node");
    M2.default.join(__dirname, "../libquery_engine-darwin-arm64.dylib.node");
    M2.default.join(__dirname, "../libquery_engine-debian-openssl-1.0.x.so.node");
    M2.default.join(__dirname, "../libquery_engine-debian-openssl-1.1.x.so.node");
    M2.default.join(__dirname, "../libquery_engine-debian-openssl-3.0.x.so.node");
    M2.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.0.x.so.node");
    M2.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.1.x.so.node");
    M2.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-3.0.x.so.node");
    M2.default.join(__dirname, "../libquery_engine-linux-musl.so.node");
    M2.default.join(__dirname, "../libquery_engine-linux-musl-openssl-3.0.x.so.node");
    M2.default.join(__dirname, "../libquery_engine-rhel-openssl-1.0.x.so.node");
    M2.default.join(__dirname, "../libquery_engine-rhel-openssl-1.1.x.so.node");
    M2.default.join(__dirname, "../libquery_engine-rhel-openssl-3.0.x.so.node");
    M2.default.join(__dirname, "../query_engine-windows.dll.node");
    var Si = O3(require("fs"));
    var fs = gr3("chmodPlusX");
    function Ri(e2) {
      if (process.platform === "win32") return;
      let r2 = Si.default.statSync(e2), t2 = r2.mode | 64 | 8 | 1;
      if (r2.mode === t2) {
        fs(`Execution permissions of ${e2} are fine`);
        return;
      }
      let n2 = t2.toString(8).slice(-3);
      fs(`Have to call chmodPlusX on ${e2}`), Si.default.chmodSync(e2, n2);
    }
    function Ai(e2) {
      let r2 = e2.e, t2 = (a2) => `Prisma cannot find the required \`${a2}\` system library in your system`, n2 = r2.message.includes("cannot open shared object file"), i2 = `Please refer to the documentation about Prisma's system requirements: ${wi("https://pris.ly/d/system-requirements")}`, o2 = `Unable to require(\`${Ce3(e2.id)}\`).`, s2 = hr3({ message: r2.message, code: r2.code }).with({ code: "ENOENT" }, () => "File does not exist.").when(({ message: a2 }) => n2 && a2.includes("libz"), () => `${t2("libz")}. Please install it and try again.`).when(({ message: a2 }) => n2 && a2.includes("libgcc_s"), () => `${t2("libgcc_s")}. Please install it and try again.`).when(({ message: a2 }) => n2 && a2.includes("libssl"), () => {
        let a2 = e2.platformInfo.libssl ? `openssl-${e2.platformInfo.libssl}` : "openssl";
        return `${t2("libssl")}. Please install ${a2} and try again.`;
      }).when(({ message: a2 }) => a2.includes("GLIBC"), () => `Prisma has detected an incompatible version of the \`glibc\` C standard library installed in your system. This probably means your system may be too old to run Prisma. ${i2}`).when(({ message: a2 }) => e2.platformInfo.platform === "linux" && a2.includes("symbol not found"), () => `The Prisma engines are not compatible with your system ${e2.platformInfo.originalDistro} on (${e2.platformInfo.archFromUname}) which uses the \`${e2.platformInfo.binaryTarget}\` binaryTarget by default. ${i2}`).otherwise(() => `The Prisma engines do not seem to be compatible with your system. ${i2}`);
      return `${o2}
${s2}

Details: ${r2.message}`;
    }
    var ys2 = O3(hs(), 1);
    function Ci(e2) {
      let r2 = (0, ys2.default)(e2);
      if (r2 === 0) return e2;
      let t2 = new RegExp(`^[ \\t]{${r2}}`, "gm");
      return e2.replace(t2, "");
    }
    var bs = "prisma+postgres";
    var sn = `${bs}:`;
    function an(e2) {
      return e2?.toString().startsWith(`${sn}//`) ?? false;
    }
    function Ii(e2) {
      if (!an(e2)) return false;
      let { host: r2 } = new URL(e2);
      return r2.includes("localhost") || r2.includes("127.0.0.1") || r2.includes("[::1]");
    }
    var ws = O3(Di());
    function ki(e2) {
      return String(new Oi(e2));
    }
    var Oi = class {
      constructor(r2) {
        this.config = r2;
      }
      toString() {
        let { config: r2 } = this, t2 = r2.provider.fromEnvVar ? `env("${r2.provider.fromEnvVar}")` : r2.provider.value, n2 = JSON.parse(JSON.stringify({ provider: t2, binaryTargets: Kc(r2.binaryTargets) }));
        return `generator ${r2.name} {
${(0, ws.default)(Hc(n2), 2)}
}`;
      }
    };
    function Kc(e2) {
      let r2;
      if (e2.length > 0) {
        let t2 = e2.find((n2) => n2.fromEnvVar !== null);
        t2 ? r2 = `env("${t2.fromEnvVar}")` : r2 = e2.map((n2) => n2.native ? "native" : n2.value);
      } else r2 = void 0;
      return r2;
    }
    function Hc(e2) {
      let r2 = Object.keys(e2).reduce((t2, n2) => Math.max(t2, n2.length), 0);
      return Object.entries(e2).map(([t2, n2]) => `${t2.padEnd(r2)} = ${Yc(n2)}`).join(`
`);
    }
    function Yc(e2) {
      return JSON.parse(JSON.stringify(e2, (r2, t2) => Array.isArray(t2) ? `[${t2.map((n2) => JSON.stringify(n2)).join(", ")}]` : JSON.stringify(t2)));
    }
    var nt2 = {};
    tr3(nt2, { error: () => Xc, info: () => Zc, log: () => zc, query: () => ep, should: () => xs, tags: () => tt2, warn: () => _i2 });
    var tt2 = { error: ce3("prisma:error"), warn: Ie3("prisma:warn"), info: De3("prisma:info"), query: nr3("prisma:query") };
    var xs = { warn: () => !process.env.PRISMA_DISABLE_WARNINGS };
    function zc(...e2) {
      console.log(...e2);
    }
    function _i2(e2, ...r2) {
      xs.warn() && console.warn(`${tt2.warn} ${e2}`, ...r2);
    }
    function Zc(e2, ...r2) {
      console.info(`${tt2.info} ${e2}`, ...r2);
    }
    function Xc(e2, ...r2) {
      console.error(`${tt2.error} ${e2}`, ...r2);
    }
    function ep(e2, ...r2) {
      console.log(`${tt2.query} ${e2}`, ...r2);
    }
    function ln(e2, r2) {
      if (!e2) throw new Error(`${r2}. This should never happen. If you see this error, please, open an issue at https://pris.ly/prisma-prisma-bug-report`);
    }
    function ar3(e2, r2) {
      throw new Error(r2);
    }
    function Ni({ onlyFirst: e2 = false } = {}) {
      let t2 = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
      return new RegExp(t2, e2 ? void 0 : "g");
    }
    var rp = Ni();
    function wr2(e2) {
      if (typeof e2 != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof e2}\``);
      return e2.replace(rp, "");
    }
    var it2 = O3(require("path"));
    function Li(e2) {
      return it2.default.sep === it2.default.posix.sep ? e2 : e2.split(it2.default.sep).join(it2.default.posix.sep);
    }
    var qi = O3(As());
    var un = O3(require("fs"));
    var xr2 = O3(require("path"));
    function Cs(e2) {
      let r2 = e2.ignoreProcessEnv ? {} : process.env, t2 = (n2) => n2.match(/(.?\${(?:[a-zA-Z0-9_]+)?})/g)?.reduce(function(o2, s2) {
        let a2 = /(.?)\${([a-zA-Z0-9_]+)?}/g.exec(s2);
        if (!a2) return o2;
        let l2 = a2[1], u2, c2;
        if (l2 === "\\") c2 = a2[0], u2 = c2.replace("\\$", "$");
        else {
          let p3 = a2[2];
          c2 = a2[0].substring(l2.length), u2 = Object.hasOwnProperty.call(r2, p3) ? r2[p3] : e2.parsed[p3] || "", u2 = t2(u2);
        }
        return o2.replace(c2, u2);
      }, n2) ?? n2;
      for (let n2 in e2.parsed) {
        let i2 = Object.hasOwnProperty.call(r2, n2) ? r2[n2] : e2.parsed[n2];
        e2.parsed[n2] = t2(i2);
      }
      for (let n2 in e2.parsed) r2[n2] = e2.parsed[n2];
      return e2;
    }
    var $i = gr3("prisma:tryLoadEnv");
    function st({ rootEnvPath: e2, schemaEnvPath: r2 }, t2 = { conflictCheck: "none" }) {
      let n2 = Is(e2);
      t2.conflictCheck !== "none" && hp(n2, r2, t2.conflictCheck);
      let i2 = null;
      return Ds(n2?.path, r2) || (i2 = Is(r2)), !n2 && !i2 && $i("No Environment variables loaded"), i2?.dotenvResult.error ? console.error(ce3(W3("Schema Env Error: ")) + i2.dotenvResult.error) : { message: [n2?.message, i2?.message].filter(Boolean).join(`
`), parsed: { ...n2?.dotenvResult?.parsed, ...i2?.dotenvResult?.parsed } };
    }
    function hp(e2, r2, t2) {
      let n2 = e2?.dotenvResult.parsed, i2 = !Ds(e2?.path, r2);
      if (n2 && r2 && i2 && un.default.existsSync(r2)) {
        let o2 = qi.default.parse(un.default.readFileSync(r2)), s2 = [];
        for (let a2 in o2) n2[a2] === o2[a2] && s2.push(a2);
        if (s2.length > 0) {
          let a2 = xr2.default.relative(process.cwd(), e2.path), l2 = xr2.default.relative(process.cwd(), r2);
          if (t2 === "error") {
            let u2 = `There is a conflict between env var${s2.length > 1 ? "s" : ""} in ${Y3(a2)} and ${Y3(l2)}
Conflicting env vars:
${s2.map((c2) => `  ${W3(c2)}`).join(`
`)}

We suggest to move the contents of ${Y3(l2)} to ${Y3(a2)} to consolidate your env vars.
`;
            throw new Error(u2);
          } else if (t2 === "warn") {
            let u2 = `Conflict for env var${s2.length > 1 ? "s" : ""} ${s2.map((c2) => W3(c2)).join(", ")} in ${Y3(a2)} and ${Y3(l2)}
Env vars from ${Y3(l2)} overwrite the ones from ${Y3(a2)}
      `;
            console.warn(`${Ie3("warn(prisma)")} ${u2}`);
          }
        }
      }
    }
    function Is(e2) {
      if (yp(e2)) {
        $i(`Environment variables loaded from ${e2}`);
        let r2 = qi.default.config({ path: e2, debug: process.env.DOTENV_CONFIG_DEBUG ? true : void 0 });
        return { dotenvResult: Cs(r2), message: Ce3(`Environment variables loaded from ${xr2.default.relative(process.cwd(), e2)}`), path: e2 };
      } else $i(`Environment variables not found at ${e2}`);
      return null;
    }
    function Ds(e2, r2) {
      return e2 && r2 && xr2.default.resolve(e2) === xr2.default.resolve(r2);
    }
    function yp(e2) {
      return !!(e2 && un.default.existsSync(e2));
    }
    function Vi(e2, r2) {
      return Object.prototype.hasOwnProperty.call(e2, r2);
    }
    function pn(e2, r2) {
      let t2 = {};
      for (let n2 of Object.keys(e2)) t2[n2] = r2(e2[n2], n2);
      return t2;
    }
    function ji(e2, r2) {
      if (e2.length === 0) return;
      let t2 = e2[0];
      for (let n2 = 1; n2 < e2.length; n2++) r2(t2, e2[n2]) < 0 && (t2 = e2[n2]);
      return t2;
    }
    function x3(e2, r2) {
      Object.defineProperty(e2, "name", { value: r2, configurable: true });
    }
    var ks = /* @__PURE__ */ new Set();
    var at2 = (e2, r2, ...t2) => {
      ks.has(e2) || (ks.add(e2), _i2(r2, ...t2));
    };
    var P3 = class e2 extends Error {
      clientVersion;
      errorCode;
      retryable;
      constructor(r2, t2, n2) {
        super(r2), this.name = "PrismaClientInitializationError", this.clientVersion = t2, this.errorCode = n2, Error.captureStackTrace(e2);
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientInitializationError";
      }
    };
    x3(P3, "PrismaClientInitializationError");
    var z3 = class extends Error {
      code;
      meta;
      clientVersion;
      batchRequestIdx;
      constructor(r2, { code: t2, clientVersion: n2, meta: i2, batchRequestIdx: o2 }) {
        super(r2), this.name = "PrismaClientKnownRequestError", this.code = t2, this.clientVersion = n2, this.meta = i2, Object.defineProperty(this, "batchRequestIdx", { value: o2, enumerable: false, writable: true });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientKnownRequestError";
      }
    };
    x3(z3, "PrismaClientKnownRequestError");
    var ae3 = class extends Error {
      clientVersion;
      constructor(r2, t2) {
        super(r2), this.name = "PrismaClientRustPanicError", this.clientVersion = t2;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientRustPanicError";
      }
    };
    x3(ae3, "PrismaClientRustPanicError");
    var V3 = class extends Error {
      clientVersion;
      batchRequestIdx;
      constructor(r2, { clientVersion: t2, batchRequestIdx: n2 }) {
        super(r2), this.name = "PrismaClientUnknownRequestError", this.clientVersion = t2, Object.defineProperty(this, "batchRequestIdx", { value: n2, writable: true, enumerable: false });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientUnknownRequestError";
      }
    };
    x3(V3, "PrismaClientUnknownRequestError");
    var Z3 = class extends Error {
      name = "PrismaClientValidationError";
      clientVersion;
      constructor(r2, { clientVersion: t2 }) {
        super(r2), this.clientVersion = t2;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientValidationError";
      }
    };
    x3(Z3, "PrismaClientValidationError");
    var we3 = class {
      _map = /* @__PURE__ */ new Map();
      get(r2) {
        return this._map.get(r2)?.value;
      }
      set(r2, t2) {
        this._map.set(r2, { value: t2 });
      }
      getOrCreate(r2, t2) {
        let n2 = this._map.get(r2);
        if (n2) return n2.value;
        let i2 = t2();
        return this.set(r2, i2), i2;
      }
    };
    function We3(e2) {
      return e2.substring(0, 1).toLowerCase() + e2.substring(1);
    }
    function _s(e2, r2) {
      let t2 = {};
      for (let n2 of e2) {
        let i2 = n2[r2];
        t2[i2] = n2;
      }
      return t2;
    }
    function lt(e2) {
      let r2;
      return { get() {
        return r2 || (r2 = { value: e2() }), r2.value;
      } };
    }
    function Ns(e2) {
      return { models: Bi(e2.models), enums: Bi(e2.enums), types: Bi(e2.types) };
    }
    function Bi(e2) {
      let r2 = {};
      for (let { name: t2, ...n2 } of e2) r2[t2] = n2;
      return r2;
    }
    function vr2(e2) {
      return e2 instanceof Date || Object.prototype.toString.call(e2) === "[object Date]";
    }
    function mn(e2) {
      return e2.toString() !== "Invalid Date";
    }
    var Pr2 = 9e15;
    var Ye3 = 1e9;
    var Ui = "0123456789abcdef";
    var hn = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
    var yn = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
    var Gi = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -Pr2, maxE: Pr2, crypto: false };
    var $s;
    var Ne3;
    var w3 = true;
    var En = "[DecimalError] ";
    var He3 = En + "Invalid argument: ";
    var qs = En + "Precision limit exceeded";
    var Vs = En + "crypto unavailable";
    var js = "[object Decimal]";
    var X3 = Math.floor;
    var U3 = Math.pow;
    var bp = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
    var Ep = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
    var wp = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
    var Bs = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
    var fe3 = 1e7;
    var E2 = 7;
    var xp = 9007199254740991;
    var vp = hn.length - 1;
    var Qi = yn.length - 1;
    var m3 = { toStringTag: js };
    m3.absoluteValue = m3.abs = function() {
      var e2 = new this.constructor(this);
      return e2.s < 0 && (e2.s = 1), y2(e2);
    };
    m3.ceil = function() {
      return y2(new this.constructor(this), this.e + 1, 2);
    };
    m3.clampedTo = m3.clamp = function(e2, r2) {
      var t2, n2 = this, i2 = n2.constructor;
      if (e2 = new i2(e2), r2 = new i2(r2), !e2.s || !r2.s) return new i2(NaN);
      if (e2.gt(r2)) throw Error(He3 + r2);
      return t2 = n2.cmp(e2), t2 < 0 ? e2 : n2.cmp(r2) > 0 ? r2 : new i2(n2);
    };
    m3.comparedTo = m3.cmp = function(e2) {
      var r2, t2, n2, i2, o2 = this, s2 = o2.d, a2 = (e2 = new o2.constructor(e2)).d, l2 = o2.s, u2 = e2.s;
      if (!s2 || !a2) return !l2 || !u2 ? NaN : l2 !== u2 ? l2 : s2 === a2 ? 0 : !s2 ^ l2 < 0 ? 1 : -1;
      if (!s2[0] || !a2[0]) return s2[0] ? l2 : a2[0] ? -u2 : 0;
      if (l2 !== u2) return l2;
      if (o2.e !== e2.e) return o2.e > e2.e ^ l2 < 0 ? 1 : -1;
      for (n2 = s2.length, i2 = a2.length, r2 = 0, t2 = n2 < i2 ? n2 : i2; r2 < t2; ++r2) if (s2[r2] !== a2[r2]) return s2[r2] > a2[r2] ^ l2 < 0 ? 1 : -1;
      return n2 === i2 ? 0 : n2 > i2 ^ l2 < 0 ? 1 : -1;
    };
    m3.cosine = m3.cos = function() {
      var e2, r2, t2 = this, n2 = t2.constructor;
      return t2.d ? t2.d[0] ? (e2 = n2.precision, r2 = n2.rounding, n2.precision = e2 + Math.max(t2.e, t2.sd()) + E2, n2.rounding = 1, t2 = Pp(n2, Js(n2, t2)), n2.precision = e2, n2.rounding = r2, y2(Ne3 == 2 || Ne3 == 3 ? t2.neg() : t2, e2, r2, true)) : new n2(1) : new n2(NaN);
    };
    m3.cubeRoot = m3.cbrt = function() {
      var e2, r2, t2, n2, i2, o2, s2, a2, l2, u2, c2 = this, p3 = c2.constructor;
      if (!c2.isFinite() || c2.isZero()) return new p3(c2);
      for (w3 = false, o2 = c2.s * U3(c2.s * c2, 1 / 3), !o2 || Math.abs(o2) == 1 / 0 ? (t2 = J3(c2.d), e2 = c2.e, (o2 = (e2 - t2.length + 1) % 3) && (t2 += o2 == 1 || o2 == -2 ? "0" : "00"), o2 = U3(t2, 1 / 3), e2 = X3((e2 + 1) / 3) - (e2 % 3 == (e2 < 0 ? -1 : 2)), o2 == 1 / 0 ? t2 = "5e" + e2 : (t2 = o2.toExponential(), t2 = t2.slice(0, t2.indexOf("e") + 1) + e2), n2 = new p3(t2), n2.s = c2.s) : n2 = new p3(o2.toString()), s2 = (e2 = p3.precision) + 3; ; ) if (a2 = n2, l2 = a2.times(a2).times(a2), u2 = l2.plus(c2), n2 = L3(u2.plus(c2).times(a2), u2.plus(l2), s2 + 2, 1), J3(a2.d).slice(0, s2) === (t2 = J3(n2.d)).slice(0, s2)) if (t2 = t2.slice(s2 - 3, s2 + 1), t2 == "9999" || !i2 && t2 == "4999") {
        if (!i2 && (y2(a2, e2 + 1, 0), a2.times(a2).times(a2).eq(c2))) {
          n2 = a2;
          break;
        }
        s2 += 4, i2 = 1;
      } else {
        (!+t2 || !+t2.slice(1) && t2.charAt(0) == "5") && (y2(n2, e2 + 1, 1), r2 = !n2.times(n2).times(n2).eq(c2));
        break;
      }
      return w3 = true, y2(n2, e2, p3.rounding, r2);
    };
    m3.decimalPlaces = m3.dp = function() {
      var e2, r2 = this.d, t2 = NaN;
      if (r2) {
        if (e2 = r2.length - 1, t2 = (e2 - X3(this.e / E2)) * E2, e2 = r2[e2], e2) for (; e2 % 10 == 0; e2 /= 10) t2--;
        t2 < 0 && (t2 = 0);
      }
      return t2;
    };
    m3.dividedBy = m3.div = function(e2) {
      return L3(this, new this.constructor(e2));
    };
    m3.dividedToIntegerBy = m3.divToInt = function(e2) {
      var r2 = this, t2 = r2.constructor;
      return y2(L3(r2, new t2(e2), 0, 1, 1), t2.precision, t2.rounding);
    };
    m3.equals = m3.eq = function(e2) {
      return this.cmp(e2) === 0;
    };
    m3.floor = function() {
      return y2(new this.constructor(this), this.e + 1, 3);
    };
    m3.greaterThan = m3.gt = function(e2) {
      return this.cmp(e2) > 0;
    };
    m3.greaterThanOrEqualTo = m3.gte = function(e2) {
      var r2 = this.cmp(e2);
      return r2 == 1 || r2 === 0;
    };
    m3.hyperbolicCosine = m3.cosh = function() {
      var e2, r2, t2, n2, i2, o2 = this, s2 = o2.constructor, a2 = new s2(1);
      if (!o2.isFinite()) return new s2(o2.s ? 1 / 0 : NaN);
      if (o2.isZero()) return a2;
      t2 = s2.precision, n2 = s2.rounding, s2.precision = t2 + Math.max(o2.e, o2.sd()) + 4, s2.rounding = 1, i2 = o2.d.length, i2 < 32 ? (e2 = Math.ceil(i2 / 3), r2 = (1 / xn(4, e2)).toString()) : (e2 = 16, r2 = "2.3283064365386962890625e-10"), o2 = Tr2(s2, 1, o2.times(r2), new s2(1), true);
      for (var l2, u2 = e2, c2 = new s2(8); u2--; ) l2 = o2.times(o2), o2 = a2.minus(l2.times(c2.minus(l2.times(c2))));
      return y2(o2, s2.precision = t2, s2.rounding = n2, true);
    };
    m3.hyperbolicSine = m3.sinh = function() {
      var e2, r2, t2, n2, i2 = this, o2 = i2.constructor;
      if (!i2.isFinite() || i2.isZero()) return new o2(i2);
      if (r2 = o2.precision, t2 = o2.rounding, o2.precision = r2 + Math.max(i2.e, i2.sd()) + 4, o2.rounding = 1, n2 = i2.d.length, n2 < 3) i2 = Tr2(o2, 2, i2, i2, true);
      else {
        e2 = 1.4 * Math.sqrt(n2), e2 = e2 > 16 ? 16 : e2 | 0, i2 = i2.times(1 / xn(5, e2)), i2 = Tr2(o2, 2, i2, i2, true);
        for (var s2, a2 = new o2(5), l2 = new o2(16), u2 = new o2(20); e2--; ) s2 = i2.times(i2), i2 = i2.times(a2.plus(s2.times(l2.times(s2).plus(u2))));
      }
      return o2.precision = r2, o2.rounding = t2, y2(i2, r2, t2, true);
    };
    m3.hyperbolicTangent = m3.tanh = function() {
      var e2, r2, t2 = this, n2 = t2.constructor;
      return t2.isFinite() ? t2.isZero() ? new n2(t2) : (e2 = n2.precision, r2 = n2.rounding, n2.precision = e2 + 7, n2.rounding = 1, L3(t2.sinh(), t2.cosh(), n2.precision = e2, n2.rounding = r2)) : new n2(t2.s);
    };
    m3.inverseCosine = m3.acos = function() {
      var e2 = this, r2 = e2.constructor, t2 = e2.abs().cmp(1), n2 = r2.precision, i2 = r2.rounding;
      return t2 !== -1 ? t2 === 0 ? e2.isNeg() ? xe3(r2, n2, i2) : new r2(0) : new r2(NaN) : e2.isZero() ? xe3(r2, n2 + 4, i2).times(0.5) : (r2.precision = n2 + 6, r2.rounding = 1, e2 = new r2(1).minus(e2).div(e2.plus(1)).sqrt().atan(), r2.precision = n2, r2.rounding = i2, e2.times(2));
    };
    m3.inverseHyperbolicCosine = m3.acosh = function() {
      var e2, r2, t2 = this, n2 = t2.constructor;
      return t2.lte(1) ? new n2(t2.eq(1) ? 0 : NaN) : t2.isFinite() ? (e2 = n2.precision, r2 = n2.rounding, n2.precision = e2 + Math.max(Math.abs(t2.e), t2.sd()) + 4, n2.rounding = 1, w3 = false, t2 = t2.times(t2).minus(1).sqrt().plus(t2), w3 = true, n2.precision = e2, n2.rounding = r2, t2.ln()) : new n2(t2);
    };
    m3.inverseHyperbolicSine = m3.asinh = function() {
      var e2, r2, t2 = this, n2 = t2.constructor;
      return !t2.isFinite() || t2.isZero() ? new n2(t2) : (e2 = n2.precision, r2 = n2.rounding, n2.precision = e2 + 2 * Math.max(Math.abs(t2.e), t2.sd()) + 6, n2.rounding = 1, w3 = false, t2 = t2.times(t2).plus(1).sqrt().plus(t2), w3 = true, n2.precision = e2, n2.rounding = r2, t2.ln());
    };
    m3.inverseHyperbolicTangent = m3.atanh = function() {
      var e2, r2, t2, n2, i2 = this, o2 = i2.constructor;
      return i2.isFinite() ? i2.e >= 0 ? new o2(i2.abs().eq(1) ? i2.s / 0 : i2.isZero() ? i2 : NaN) : (e2 = o2.precision, r2 = o2.rounding, n2 = i2.sd(), Math.max(n2, e2) < 2 * -i2.e - 1 ? y2(new o2(i2), e2, r2, true) : (o2.precision = t2 = n2 - i2.e, i2 = L3(i2.plus(1), new o2(1).minus(i2), t2 + e2, 1), o2.precision = e2 + 4, o2.rounding = 1, i2 = i2.ln(), o2.precision = e2, o2.rounding = r2, i2.times(0.5))) : new o2(NaN);
    };
    m3.inverseSine = m3.asin = function() {
      var e2, r2, t2, n2, i2 = this, o2 = i2.constructor;
      return i2.isZero() ? new o2(i2) : (r2 = i2.abs().cmp(1), t2 = o2.precision, n2 = o2.rounding, r2 !== -1 ? r2 === 0 ? (e2 = xe3(o2, t2 + 4, n2).times(0.5), e2.s = i2.s, e2) : new o2(NaN) : (o2.precision = t2 + 6, o2.rounding = 1, i2 = i2.div(new o2(1).minus(i2.times(i2)).sqrt().plus(1)).atan(), o2.precision = t2, o2.rounding = n2, i2.times(2)));
    };
    m3.inverseTangent = m3.atan = function() {
      var e2, r2, t2, n2, i2, o2, s2, a2, l2, u2 = this, c2 = u2.constructor, p3 = c2.precision, d2 = c2.rounding;
      if (u2.isFinite()) {
        if (u2.isZero()) return new c2(u2);
        if (u2.abs().eq(1) && p3 + 4 <= Qi) return s2 = xe3(c2, p3 + 4, d2).times(0.25), s2.s = u2.s, s2;
      } else {
        if (!u2.s) return new c2(NaN);
        if (p3 + 4 <= Qi) return s2 = xe3(c2, p3 + 4, d2).times(0.5), s2.s = u2.s, s2;
      }
      for (c2.precision = a2 = p3 + 10, c2.rounding = 1, t2 = Math.min(28, a2 / E2 + 2 | 0), e2 = t2; e2; --e2) u2 = u2.div(u2.times(u2).plus(1).sqrt().plus(1));
      for (w3 = false, r2 = Math.ceil(a2 / E2), n2 = 1, l2 = u2.times(u2), s2 = new c2(u2), i2 = u2; e2 !== -1; ) if (i2 = i2.times(l2), o2 = s2.minus(i2.div(n2 += 2)), i2 = i2.times(l2), s2 = o2.plus(i2.div(n2 += 2)), s2.d[r2] !== void 0) for (e2 = r2; s2.d[e2] === o2.d[e2] && e2--; ) ;
      return t2 && (s2 = s2.times(2 << t2 - 1)), w3 = true, y2(s2, c2.precision = p3, c2.rounding = d2, true);
    };
    m3.isFinite = function() {
      return !!this.d;
    };
    m3.isInteger = m3.isInt = function() {
      return !!this.d && X3(this.e / E2) > this.d.length - 2;
    };
    m3.isNaN = function() {
      return !this.s;
    };
    m3.isNegative = m3.isNeg = function() {
      return this.s < 0;
    };
    m3.isPositive = m3.isPos = function() {
      return this.s > 0;
    };
    m3.isZero = function() {
      return !!this.d && this.d[0] === 0;
    };
    m3.lessThan = m3.lt = function(e2) {
      return this.cmp(e2) < 0;
    };
    m3.lessThanOrEqualTo = m3.lte = function(e2) {
      return this.cmp(e2) < 1;
    };
    m3.logarithm = m3.log = function(e2) {
      var r2, t2, n2, i2, o2, s2, a2, l2, u2 = this, c2 = u2.constructor, p3 = c2.precision, d2 = c2.rounding, f3 = 5;
      if (e2 == null) e2 = new c2(10), r2 = true;
      else {
        if (e2 = new c2(e2), t2 = e2.d, e2.s < 0 || !t2 || !t2[0] || e2.eq(1)) return new c2(NaN);
        r2 = e2.eq(10);
      }
      if (t2 = u2.d, u2.s < 0 || !t2 || !t2[0] || u2.eq(1)) return new c2(t2 && !t2[0] ? -1 / 0 : u2.s != 1 ? NaN : t2 ? 0 : 1 / 0);
      if (r2) if (t2.length > 1) o2 = true;
      else {
        for (i2 = t2[0]; i2 % 10 === 0; ) i2 /= 10;
        o2 = i2 !== 1;
      }
      if (w3 = false, a2 = p3 + f3, s2 = Ke3(u2, a2), n2 = r2 ? bn(c2, a2 + 10) : Ke3(e2, a2), l2 = L3(s2, n2, a2, 1), ut(l2.d, i2 = p3, d2)) do
        if (a2 += 10, s2 = Ke3(u2, a2), n2 = r2 ? bn(c2, a2 + 10) : Ke3(e2, a2), l2 = L3(s2, n2, a2, 1), !o2) {
          +J3(l2.d).slice(i2 + 1, i2 + 15) + 1 == 1e14 && (l2 = y2(l2, p3 + 1, 0));
          break;
        }
      while (ut(l2.d, i2 += 10, d2));
      return w3 = true, y2(l2, p3, d2);
    };
    m3.minus = m3.sub = function(e2) {
      var r2, t2, n2, i2, o2, s2, a2, l2, u2, c2, p3, d2, f3 = this, h2 = f3.constructor;
      if (e2 = new h2(e2), !f3.d || !e2.d) return !f3.s || !e2.s ? e2 = new h2(NaN) : f3.d ? e2.s = -e2.s : e2 = new h2(e2.d || f3.s !== e2.s ? f3 : NaN), e2;
      if (f3.s != e2.s) return e2.s = -e2.s, f3.plus(e2);
      if (u2 = f3.d, d2 = e2.d, a2 = h2.precision, l2 = h2.rounding, !u2[0] || !d2[0]) {
        if (d2[0]) e2.s = -e2.s;
        else if (u2[0]) e2 = new h2(f3);
        else return new h2(l2 === 3 ? -0 : 0);
        return w3 ? y2(e2, a2, l2) : e2;
      }
      if (t2 = X3(e2.e / E2), c2 = X3(f3.e / E2), u2 = u2.slice(), o2 = c2 - t2, o2) {
        for (p3 = o2 < 0, p3 ? (r2 = u2, o2 = -o2, s2 = d2.length) : (r2 = d2, t2 = c2, s2 = u2.length), n2 = Math.max(Math.ceil(a2 / E2), s2) + 2, o2 > n2 && (o2 = n2, r2.length = 1), r2.reverse(), n2 = o2; n2--; ) r2.push(0);
        r2.reverse();
      } else {
        for (n2 = u2.length, s2 = d2.length, p3 = n2 < s2, p3 && (s2 = n2), n2 = 0; n2 < s2; n2++) if (u2[n2] != d2[n2]) {
          p3 = u2[n2] < d2[n2];
          break;
        }
        o2 = 0;
      }
      for (p3 && (r2 = u2, u2 = d2, d2 = r2, e2.s = -e2.s), s2 = u2.length, n2 = d2.length - s2; n2 > 0; --n2) u2[s2++] = 0;
      for (n2 = d2.length; n2 > o2; ) {
        if (u2[--n2] < d2[n2]) {
          for (i2 = n2; i2 && u2[--i2] === 0; ) u2[i2] = fe3 - 1;
          --u2[i2], u2[n2] += fe3;
        }
        u2[n2] -= d2[n2];
      }
      for (; u2[--s2] === 0; ) u2.pop();
      for (; u2[0] === 0; u2.shift()) --t2;
      return u2[0] ? (e2.d = u2, e2.e = wn(u2, t2), w3 ? y2(e2, a2, l2) : e2) : new h2(l2 === 3 ? -0 : 0);
    };
    m3.modulo = m3.mod = function(e2) {
      var r2, t2 = this, n2 = t2.constructor;
      return e2 = new n2(e2), !t2.d || !e2.s || e2.d && !e2.d[0] ? new n2(NaN) : !e2.d || t2.d && !t2.d[0] ? y2(new n2(t2), n2.precision, n2.rounding) : (w3 = false, n2.modulo == 9 ? (r2 = L3(t2, e2.abs(), 0, 3, 1), r2.s *= e2.s) : r2 = L3(t2, e2, 0, n2.modulo, 1), r2 = r2.times(e2), w3 = true, t2.minus(r2));
    };
    m3.naturalExponential = m3.exp = function() {
      return Wi(this);
    };
    m3.naturalLogarithm = m3.ln = function() {
      return Ke3(this);
    };
    m3.negated = m3.neg = function() {
      var e2 = new this.constructor(this);
      return e2.s = -e2.s, y2(e2);
    };
    m3.plus = m3.add = function(e2) {
      var r2, t2, n2, i2, o2, s2, a2, l2, u2, c2, p3 = this, d2 = p3.constructor;
      if (e2 = new d2(e2), !p3.d || !e2.d) return !p3.s || !e2.s ? e2 = new d2(NaN) : p3.d || (e2 = new d2(e2.d || p3.s === e2.s ? p3 : NaN)), e2;
      if (p3.s != e2.s) return e2.s = -e2.s, p3.minus(e2);
      if (u2 = p3.d, c2 = e2.d, a2 = d2.precision, l2 = d2.rounding, !u2[0] || !c2[0]) return c2[0] || (e2 = new d2(p3)), w3 ? y2(e2, a2, l2) : e2;
      if (o2 = X3(p3.e / E2), n2 = X3(e2.e / E2), u2 = u2.slice(), i2 = o2 - n2, i2) {
        for (i2 < 0 ? (t2 = u2, i2 = -i2, s2 = c2.length) : (t2 = c2, n2 = o2, s2 = u2.length), o2 = Math.ceil(a2 / E2), s2 = o2 > s2 ? o2 + 1 : s2 + 1, i2 > s2 && (i2 = s2, t2.length = 1), t2.reverse(); i2--; ) t2.push(0);
        t2.reverse();
      }
      for (s2 = u2.length, i2 = c2.length, s2 - i2 < 0 && (i2 = s2, t2 = c2, c2 = u2, u2 = t2), r2 = 0; i2; ) r2 = (u2[--i2] = u2[i2] + c2[i2] + r2) / fe3 | 0, u2[i2] %= fe3;
      for (r2 && (u2.unshift(r2), ++n2), s2 = u2.length; u2[--s2] == 0; ) u2.pop();
      return e2.d = u2, e2.e = wn(u2, n2), w3 ? y2(e2, a2, l2) : e2;
    };
    m3.precision = m3.sd = function(e2) {
      var r2, t2 = this;
      if (e2 !== void 0 && e2 !== !!e2 && e2 !== 1 && e2 !== 0) throw Error(He3 + e2);
      return t2.d ? (r2 = Us(t2.d), e2 && t2.e + 1 > r2 && (r2 = t2.e + 1)) : r2 = NaN, r2;
    };
    m3.round = function() {
      var e2 = this, r2 = e2.constructor;
      return y2(new r2(e2), e2.e + 1, r2.rounding);
    };
    m3.sine = m3.sin = function() {
      var e2, r2, t2 = this, n2 = t2.constructor;
      return t2.isFinite() ? t2.isZero() ? new n2(t2) : (e2 = n2.precision, r2 = n2.rounding, n2.precision = e2 + Math.max(t2.e, t2.sd()) + E2, n2.rounding = 1, t2 = Sp(n2, Js(n2, t2)), n2.precision = e2, n2.rounding = r2, y2(Ne3 > 2 ? t2.neg() : t2, e2, r2, true)) : new n2(NaN);
    };
    m3.squareRoot = m3.sqrt = function() {
      var e2, r2, t2, n2, i2, o2, s2 = this, a2 = s2.d, l2 = s2.e, u2 = s2.s, c2 = s2.constructor;
      if (u2 !== 1 || !a2 || !a2[0]) return new c2(!u2 || u2 < 0 && (!a2 || a2[0]) ? NaN : a2 ? s2 : 1 / 0);
      for (w3 = false, u2 = Math.sqrt(+s2), u2 == 0 || u2 == 1 / 0 ? (r2 = J3(a2), (r2.length + l2) % 2 == 0 && (r2 += "0"), u2 = Math.sqrt(r2), l2 = X3((l2 + 1) / 2) - (l2 < 0 || l2 % 2), u2 == 1 / 0 ? r2 = "5e" + l2 : (r2 = u2.toExponential(), r2 = r2.slice(0, r2.indexOf("e") + 1) + l2), n2 = new c2(r2)) : n2 = new c2(u2.toString()), t2 = (l2 = c2.precision) + 3; ; ) if (o2 = n2, n2 = o2.plus(L3(s2, o2, t2 + 2, 1)).times(0.5), J3(o2.d).slice(0, t2) === (r2 = J3(n2.d)).slice(0, t2)) if (r2 = r2.slice(t2 - 3, t2 + 1), r2 == "9999" || !i2 && r2 == "4999") {
        if (!i2 && (y2(o2, l2 + 1, 0), o2.times(o2).eq(s2))) {
          n2 = o2;
          break;
        }
        t2 += 4, i2 = 1;
      } else {
        (!+r2 || !+r2.slice(1) && r2.charAt(0) == "5") && (y2(n2, l2 + 1, 1), e2 = !n2.times(n2).eq(s2));
        break;
      }
      return w3 = true, y2(n2, l2, c2.rounding, e2);
    };
    m3.tangent = m3.tan = function() {
      var e2, r2, t2 = this, n2 = t2.constructor;
      return t2.isFinite() ? t2.isZero() ? new n2(t2) : (e2 = n2.precision, r2 = n2.rounding, n2.precision = e2 + 10, n2.rounding = 1, t2 = t2.sin(), t2.s = 1, t2 = L3(t2, new n2(1).minus(t2.times(t2)).sqrt(), e2 + 10, 0), n2.precision = e2, n2.rounding = r2, y2(Ne3 == 2 || Ne3 == 4 ? t2.neg() : t2, e2, r2, true)) : new n2(NaN);
    };
    m3.times = m3.mul = function(e2) {
      var r2, t2, n2, i2, o2, s2, a2, l2, u2, c2 = this, p3 = c2.constructor, d2 = c2.d, f3 = (e2 = new p3(e2)).d;
      if (e2.s *= c2.s, !d2 || !d2[0] || !f3 || !f3[0]) return new p3(!e2.s || d2 && !d2[0] && !f3 || f3 && !f3[0] && !d2 ? NaN : !d2 || !f3 ? e2.s / 0 : e2.s * 0);
      for (t2 = X3(c2.e / E2) + X3(e2.e / E2), l2 = d2.length, u2 = f3.length, l2 < u2 && (o2 = d2, d2 = f3, f3 = o2, s2 = l2, l2 = u2, u2 = s2), o2 = [], s2 = l2 + u2, n2 = s2; n2--; ) o2.push(0);
      for (n2 = u2; --n2 >= 0; ) {
        for (r2 = 0, i2 = l2 + n2; i2 > n2; ) a2 = o2[i2] + f3[n2] * d2[i2 - n2 - 1] + r2, o2[i2--] = a2 % fe3 | 0, r2 = a2 / fe3 | 0;
        o2[i2] = (o2[i2] + r2) % fe3 | 0;
      }
      for (; !o2[--s2]; ) o2.pop();
      return r2 ? ++t2 : o2.shift(), e2.d = o2, e2.e = wn(o2, t2), w3 ? y2(e2, p3.precision, p3.rounding) : e2;
    };
    m3.toBinary = function(e2, r2) {
      return Ji(this, 2, e2, r2);
    };
    m3.toDecimalPlaces = m3.toDP = function(e2, r2) {
      var t2 = this, n2 = t2.constructor;
      return t2 = new n2(t2), e2 === void 0 ? t2 : (ne3(e2, 0, Ye3), r2 === void 0 ? r2 = n2.rounding : ne3(r2, 0, 8), y2(t2, e2 + t2.e + 1, r2));
    };
    m3.toExponential = function(e2, r2) {
      var t2, n2 = this, i2 = n2.constructor;
      return e2 === void 0 ? t2 = ve3(n2, true) : (ne3(e2, 0, Ye3), r2 === void 0 ? r2 = i2.rounding : ne3(r2, 0, 8), n2 = y2(new i2(n2), e2 + 1, r2), t2 = ve3(n2, true, e2 + 1)), n2.isNeg() && !n2.isZero() ? "-" + t2 : t2;
    };
    m3.toFixed = function(e2, r2) {
      var t2, n2, i2 = this, o2 = i2.constructor;
      return e2 === void 0 ? t2 = ve3(i2) : (ne3(e2, 0, Ye3), r2 === void 0 ? r2 = o2.rounding : ne3(r2, 0, 8), n2 = y2(new o2(i2), e2 + i2.e + 1, r2), t2 = ve3(n2, false, e2 + n2.e + 1)), i2.isNeg() && !i2.isZero() ? "-" + t2 : t2;
    };
    m3.toFraction = function(e2) {
      var r2, t2, n2, i2, o2, s2, a2, l2, u2, c2, p3, d2, f3 = this, h2 = f3.d, g2 = f3.constructor;
      if (!h2) return new g2(f3);
      if (u2 = t2 = new g2(1), n2 = l2 = new g2(0), r2 = new g2(n2), o2 = r2.e = Us(h2) - f3.e - 1, s2 = o2 % E2, r2.d[0] = U3(10, s2 < 0 ? E2 + s2 : s2), e2 == null) e2 = o2 > 0 ? r2 : u2;
      else {
        if (a2 = new g2(e2), !a2.isInt() || a2.lt(u2)) throw Error(He3 + a2);
        e2 = a2.gt(r2) ? o2 > 0 ? r2 : u2 : a2;
      }
      for (w3 = false, a2 = new g2(J3(h2)), c2 = g2.precision, g2.precision = o2 = h2.length * E2 * 2; p3 = L3(a2, r2, 0, 1, 1), i2 = t2.plus(p3.times(n2)), i2.cmp(e2) != 1; ) t2 = n2, n2 = i2, i2 = u2, u2 = l2.plus(p3.times(i2)), l2 = i2, i2 = r2, r2 = a2.minus(p3.times(i2)), a2 = i2;
      return i2 = L3(e2.minus(t2), n2, 0, 1, 1), l2 = l2.plus(i2.times(u2)), t2 = t2.plus(i2.times(n2)), l2.s = u2.s = f3.s, d2 = L3(u2, n2, o2, 1).minus(f3).abs().cmp(L3(l2, t2, o2, 1).minus(f3).abs()) < 1 ? [u2, n2] : [l2, t2], g2.precision = c2, w3 = true, d2;
    };
    m3.toHexadecimal = m3.toHex = function(e2, r2) {
      return Ji(this, 16, e2, r2);
    };
    m3.toNearest = function(e2, r2) {
      var t2 = this, n2 = t2.constructor;
      if (t2 = new n2(t2), e2 == null) {
        if (!t2.d) return t2;
        e2 = new n2(1), r2 = n2.rounding;
      } else {
        if (e2 = new n2(e2), r2 === void 0 ? r2 = n2.rounding : ne3(r2, 0, 8), !t2.d) return e2.s ? t2 : e2;
        if (!e2.d) return e2.s && (e2.s = t2.s), e2;
      }
      return e2.d[0] ? (w3 = false, t2 = L3(t2, e2, 0, r2, 1).times(e2), w3 = true, y2(t2)) : (e2.s = t2.s, t2 = e2), t2;
    };
    m3.toNumber = function() {
      return +this;
    };
    m3.toOctal = function(e2, r2) {
      return Ji(this, 8, e2, r2);
    };
    m3.toPower = m3.pow = function(e2) {
      var r2, t2, n2, i2, o2, s2, a2 = this, l2 = a2.constructor, u2 = +(e2 = new l2(e2));
      if (!a2.d || !e2.d || !a2.d[0] || !e2.d[0]) return new l2(U3(+a2, u2));
      if (a2 = new l2(a2), a2.eq(1)) return a2;
      if (n2 = l2.precision, o2 = l2.rounding, e2.eq(1)) return y2(a2, n2, o2);
      if (r2 = X3(e2.e / E2), r2 >= e2.d.length - 1 && (t2 = u2 < 0 ? -u2 : u2) <= xp) return i2 = Gs(l2, a2, t2, n2), e2.s < 0 ? new l2(1).div(i2) : y2(i2, n2, o2);
      if (s2 = a2.s, s2 < 0) {
        if (r2 < e2.d.length - 1) return new l2(NaN);
        if ((e2.d[r2] & 1) == 0 && (s2 = 1), a2.e == 0 && a2.d[0] == 1 && a2.d.length == 1) return a2.s = s2, a2;
      }
      return t2 = U3(+a2, u2), r2 = t2 == 0 || !isFinite(t2) ? X3(u2 * (Math.log("0." + J3(a2.d)) / Math.LN10 + a2.e + 1)) : new l2(t2 + "").e, r2 > l2.maxE + 1 || r2 < l2.minE - 1 ? new l2(r2 > 0 ? s2 / 0 : 0) : (w3 = false, l2.rounding = a2.s = 1, t2 = Math.min(12, (r2 + "").length), i2 = Wi(e2.times(Ke3(a2, n2 + t2)), n2), i2.d && (i2 = y2(i2, n2 + 5, 1), ut(i2.d, n2, o2) && (r2 = n2 + 10, i2 = y2(Wi(e2.times(Ke3(a2, r2 + t2)), r2), r2 + 5, 1), +J3(i2.d).slice(n2 + 1, n2 + 15) + 1 == 1e14 && (i2 = y2(i2, n2 + 1, 0)))), i2.s = s2, w3 = true, l2.rounding = o2, y2(i2, n2, o2));
    };
    m3.toPrecision = function(e2, r2) {
      var t2, n2 = this, i2 = n2.constructor;
      return e2 === void 0 ? t2 = ve3(n2, n2.e <= i2.toExpNeg || n2.e >= i2.toExpPos) : (ne3(e2, 1, Ye3), r2 === void 0 ? r2 = i2.rounding : ne3(r2, 0, 8), n2 = y2(new i2(n2), e2, r2), t2 = ve3(n2, e2 <= n2.e || n2.e <= i2.toExpNeg, e2)), n2.isNeg() && !n2.isZero() ? "-" + t2 : t2;
    };
    m3.toSignificantDigits = m3.toSD = function(e2, r2) {
      var t2 = this, n2 = t2.constructor;
      return e2 === void 0 ? (e2 = n2.precision, r2 = n2.rounding) : (ne3(e2, 1, Ye3), r2 === void 0 ? r2 = n2.rounding : ne3(r2, 0, 8)), y2(new n2(t2), e2, r2);
    };
    m3.toString = function() {
      var e2 = this, r2 = e2.constructor, t2 = ve3(e2, e2.e <= r2.toExpNeg || e2.e >= r2.toExpPos);
      return e2.isNeg() && !e2.isZero() ? "-" + t2 : t2;
    };
    m3.truncated = m3.trunc = function() {
      return y2(new this.constructor(this), this.e + 1, 1);
    };
    m3.valueOf = m3.toJSON = function() {
      var e2 = this, r2 = e2.constructor, t2 = ve3(e2, e2.e <= r2.toExpNeg || e2.e >= r2.toExpPos);
      return e2.isNeg() ? "-" + t2 : t2;
    };
    function J3(e2) {
      var r2, t2, n2, i2 = e2.length - 1, o2 = "", s2 = e2[0];
      if (i2 > 0) {
        for (o2 += s2, r2 = 1; r2 < i2; r2++) n2 = e2[r2] + "", t2 = E2 - n2.length, t2 && (o2 += Je3(t2)), o2 += n2;
        s2 = e2[r2], n2 = s2 + "", t2 = E2 - n2.length, t2 && (o2 += Je3(t2));
      } else if (s2 === 0) return "0";
      for (; s2 % 10 === 0; ) s2 /= 10;
      return o2 + s2;
    }
    function ne3(e2, r2, t2) {
      if (e2 !== ~~e2 || e2 < r2 || e2 > t2) throw Error(He3 + e2);
    }
    function ut(e2, r2, t2, n2) {
      var i2, o2, s2, a2;
      for (o2 = e2[0]; o2 >= 10; o2 /= 10) --r2;
      return --r2 < 0 ? (r2 += E2, i2 = 0) : (i2 = Math.ceil((r2 + 1) / E2), r2 %= E2), o2 = U3(10, E2 - r2), a2 = e2[i2] % o2 | 0, n2 == null ? r2 < 3 ? (r2 == 0 ? a2 = a2 / 100 | 0 : r2 == 1 && (a2 = a2 / 10 | 0), s2 = t2 < 4 && a2 == 99999 || t2 > 3 && a2 == 49999 || a2 == 5e4 || a2 == 0) : s2 = (t2 < 4 && a2 + 1 == o2 || t2 > 3 && a2 + 1 == o2 / 2) && (e2[i2 + 1] / o2 / 100 | 0) == U3(10, r2 - 2) - 1 || (a2 == o2 / 2 || a2 == 0) && (e2[i2 + 1] / o2 / 100 | 0) == 0 : r2 < 4 ? (r2 == 0 ? a2 = a2 / 1e3 | 0 : r2 == 1 ? a2 = a2 / 100 | 0 : r2 == 2 && (a2 = a2 / 10 | 0), s2 = (n2 || t2 < 4) && a2 == 9999 || !n2 && t2 > 3 && a2 == 4999) : s2 = ((n2 || t2 < 4) && a2 + 1 == o2 || !n2 && t2 > 3 && a2 + 1 == o2 / 2) && (e2[i2 + 1] / o2 / 1e3 | 0) == U3(10, r2 - 3) - 1, s2;
    }
    function fn(e2, r2, t2) {
      for (var n2, i2 = [0], o2, s2 = 0, a2 = e2.length; s2 < a2; ) {
        for (o2 = i2.length; o2--; ) i2[o2] *= r2;
        for (i2[0] += Ui.indexOf(e2.charAt(s2++)), n2 = 0; n2 < i2.length; n2++) i2[n2] > t2 - 1 && (i2[n2 + 1] === void 0 && (i2[n2 + 1] = 0), i2[n2 + 1] += i2[n2] / t2 | 0, i2[n2] %= t2);
      }
      return i2.reverse();
    }
    function Pp(e2, r2) {
      var t2, n2, i2;
      if (r2.isZero()) return r2;
      n2 = r2.d.length, n2 < 32 ? (t2 = Math.ceil(n2 / 3), i2 = (1 / xn(4, t2)).toString()) : (t2 = 16, i2 = "2.3283064365386962890625e-10"), e2.precision += t2, r2 = Tr2(e2, 1, r2.times(i2), new e2(1));
      for (var o2 = t2; o2--; ) {
        var s2 = r2.times(r2);
        r2 = s2.times(s2).minus(s2).times(8).plus(1);
      }
      return e2.precision -= t2, r2;
    }
    var L3 = /* @__PURE__ */ (function() {
      function e2(n2, i2, o2) {
        var s2, a2 = 0, l2 = n2.length;
        for (n2 = n2.slice(); l2--; ) s2 = n2[l2] * i2 + a2, n2[l2] = s2 % o2 | 0, a2 = s2 / o2 | 0;
        return a2 && n2.unshift(a2), n2;
      }
      function r2(n2, i2, o2, s2) {
        var a2, l2;
        if (o2 != s2) l2 = o2 > s2 ? 1 : -1;
        else for (a2 = l2 = 0; a2 < o2; a2++) if (n2[a2] != i2[a2]) {
          l2 = n2[a2] > i2[a2] ? 1 : -1;
          break;
        }
        return l2;
      }
      function t2(n2, i2, o2, s2) {
        for (var a2 = 0; o2--; ) n2[o2] -= a2, a2 = n2[o2] < i2[o2] ? 1 : 0, n2[o2] = a2 * s2 + n2[o2] - i2[o2];
        for (; !n2[0] && n2.length > 1; ) n2.shift();
      }
      return function(n2, i2, o2, s2, a2, l2) {
        var u2, c2, p3, d2, f3, h2, g2, I3, T3, S3, b2, D3, me3, se3, Kr2, j3, te3, Ae3, K3, fr3, Vt = n2.constructor, ti = n2.s == i2.s ? 1 : -1, H3 = n2.d, k2 = i2.d;
        if (!H3 || !H3[0] || !k2 || !k2[0]) return new Vt(!n2.s || !i2.s || (H3 ? k2 && H3[0] == k2[0] : !k2) ? NaN : H3 && H3[0] == 0 || !k2 ? ti * 0 : ti / 0);
        for (l2 ? (f3 = 1, c2 = n2.e - i2.e) : (l2 = fe3, f3 = E2, c2 = X3(n2.e / f3) - X3(i2.e / f3)), K3 = k2.length, te3 = H3.length, T3 = new Vt(ti), S3 = T3.d = [], p3 = 0; k2[p3] == (H3[p3] || 0); p3++) ;
        if (k2[p3] > (H3[p3] || 0) && c2--, o2 == null ? (se3 = o2 = Vt.precision, s2 = Vt.rounding) : a2 ? se3 = o2 + (n2.e - i2.e) + 1 : se3 = o2, se3 < 0) S3.push(1), h2 = true;
        else {
          if (se3 = se3 / f3 + 2 | 0, p3 = 0, K3 == 1) {
            for (d2 = 0, k2 = k2[0], se3++; (p3 < te3 || d2) && se3--; p3++) Kr2 = d2 * l2 + (H3[p3] || 0), S3[p3] = Kr2 / k2 | 0, d2 = Kr2 % k2 | 0;
            h2 = d2 || p3 < te3;
          } else {
            for (d2 = l2 / (k2[0] + 1) | 0, d2 > 1 && (k2 = e2(k2, d2, l2), H3 = e2(H3, d2, l2), K3 = k2.length, te3 = H3.length), j3 = K3, b2 = H3.slice(0, K3), D3 = b2.length; D3 < K3; ) b2[D3++] = 0;
            fr3 = k2.slice(), fr3.unshift(0), Ae3 = k2[0], k2[1] >= l2 / 2 && ++Ae3;
            do
              d2 = 0, u2 = r2(k2, b2, K3, D3), u2 < 0 ? (me3 = b2[0], K3 != D3 && (me3 = me3 * l2 + (b2[1] || 0)), d2 = me3 / Ae3 | 0, d2 > 1 ? (d2 >= l2 && (d2 = l2 - 1), g2 = e2(k2, d2, l2), I3 = g2.length, D3 = b2.length, u2 = r2(g2, b2, I3, D3), u2 == 1 && (d2--, t2(g2, K3 < I3 ? fr3 : k2, I3, l2))) : (d2 == 0 && (u2 = d2 = 1), g2 = k2.slice()), I3 = g2.length, I3 < D3 && g2.unshift(0), t2(b2, g2, D3, l2), u2 == -1 && (D3 = b2.length, u2 = r2(k2, b2, K3, D3), u2 < 1 && (d2++, t2(b2, K3 < D3 ? fr3 : k2, D3, l2))), D3 = b2.length) : u2 === 0 && (d2++, b2 = [0]), S3[p3++] = d2, u2 && b2[0] ? b2[D3++] = H3[j3] || 0 : (b2 = [H3[j3]], D3 = 1);
            while ((j3++ < te3 || b2[0] !== void 0) && se3--);
            h2 = b2[0] !== void 0;
          }
          S3[0] || S3.shift();
        }
        if (f3 == 1) T3.e = c2, $s = h2;
        else {
          for (p3 = 1, d2 = S3[0]; d2 >= 10; d2 /= 10) p3++;
          T3.e = p3 + c2 * f3 - 1, y2(T3, a2 ? o2 + T3.e + 1 : o2, s2, h2);
        }
        return T3;
      };
    })();
    function y2(e2, r2, t2, n2) {
      var i2, o2, s2, a2, l2, u2, c2, p3, d2, f3 = e2.constructor;
      e: if (r2 != null) {
        if (p3 = e2.d, !p3) return e2;
        for (i2 = 1, a2 = p3[0]; a2 >= 10; a2 /= 10) i2++;
        if (o2 = r2 - i2, o2 < 0) o2 += E2, s2 = r2, c2 = p3[d2 = 0], l2 = c2 / U3(10, i2 - s2 - 1) % 10 | 0;
        else if (d2 = Math.ceil((o2 + 1) / E2), a2 = p3.length, d2 >= a2) if (n2) {
          for (; a2++ <= d2; ) p3.push(0);
          c2 = l2 = 0, i2 = 1, o2 %= E2, s2 = o2 - E2 + 1;
        } else break e;
        else {
          for (c2 = a2 = p3[d2], i2 = 1; a2 >= 10; a2 /= 10) i2++;
          o2 %= E2, s2 = o2 - E2 + i2, l2 = s2 < 0 ? 0 : c2 / U3(10, i2 - s2 - 1) % 10 | 0;
        }
        if (n2 = n2 || r2 < 0 || p3[d2 + 1] !== void 0 || (s2 < 0 ? c2 : c2 % U3(10, i2 - s2 - 1)), u2 = t2 < 4 ? (l2 || n2) && (t2 == 0 || t2 == (e2.s < 0 ? 3 : 2)) : l2 > 5 || l2 == 5 && (t2 == 4 || n2 || t2 == 6 && (o2 > 0 ? s2 > 0 ? c2 / U3(10, i2 - s2) : 0 : p3[d2 - 1]) % 10 & 1 || t2 == (e2.s < 0 ? 8 : 7)), r2 < 1 || !p3[0]) return p3.length = 0, u2 ? (r2 -= e2.e + 1, p3[0] = U3(10, (E2 - r2 % E2) % E2), e2.e = -r2 || 0) : p3[0] = e2.e = 0, e2;
        if (o2 == 0 ? (p3.length = d2, a2 = 1, d2--) : (p3.length = d2 + 1, a2 = U3(10, E2 - o2), p3[d2] = s2 > 0 ? (c2 / U3(10, i2 - s2) % U3(10, s2) | 0) * a2 : 0), u2) for (; ; ) if (d2 == 0) {
          for (o2 = 1, s2 = p3[0]; s2 >= 10; s2 /= 10) o2++;
          for (s2 = p3[0] += a2, a2 = 1; s2 >= 10; s2 /= 10) a2++;
          o2 != a2 && (e2.e++, p3[0] == fe3 && (p3[0] = 1));
          break;
        } else {
          if (p3[d2] += a2, p3[d2] != fe3) break;
          p3[d2--] = 0, a2 = 1;
        }
        for (o2 = p3.length; p3[--o2] === 0; ) p3.pop();
      }
      return w3 && (e2.e > f3.maxE ? (e2.d = null, e2.e = NaN) : e2.e < f3.minE && (e2.e = 0, e2.d = [0])), e2;
    }
    function ve3(e2, r2, t2) {
      if (!e2.isFinite()) return Ws(e2);
      var n2, i2 = e2.e, o2 = J3(e2.d), s2 = o2.length;
      return r2 ? (t2 && (n2 = t2 - s2) > 0 ? o2 = o2.charAt(0) + "." + o2.slice(1) + Je3(n2) : s2 > 1 && (o2 = o2.charAt(0) + "." + o2.slice(1)), o2 = o2 + (e2.e < 0 ? "e" : "e+") + e2.e) : i2 < 0 ? (o2 = "0." + Je3(-i2 - 1) + o2, t2 && (n2 = t2 - s2) > 0 && (o2 += Je3(n2))) : i2 >= s2 ? (o2 += Je3(i2 + 1 - s2), t2 && (n2 = t2 - i2 - 1) > 0 && (o2 = o2 + "." + Je3(n2))) : ((n2 = i2 + 1) < s2 && (o2 = o2.slice(0, n2) + "." + o2.slice(n2)), t2 && (n2 = t2 - s2) > 0 && (i2 + 1 === s2 && (o2 += "."), o2 += Je3(n2))), o2;
    }
    function wn(e2, r2) {
      var t2 = e2[0];
      for (r2 *= E2; t2 >= 10; t2 /= 10) r2++;
      return r2;
    }
    function bn(e2, r2, t2) {
      if (r2 > vp) throw w3 = true, t2 && (e2.precision = t2), Error(qs);
      return y2(new e2(hn), r2, 1, true);
    }
    function xe3(e2, r2, t2) {
      if (r2 > Qi) throw Error(qs);
      return y2(new e2(yn), r2, t2, true);
    }
    function Us(e2) {
      var r2 = e2.length - 1, t2 = r2 * E2 + 1;
      if (r2 = e2[r2], r2) {
        for (; r2 % 10 == 0; r2 /= 10) t2--;
        for (r2 = e2[0]; r2 >= 10; r2 /= 10) t2++;
      }
      return t2;
    }
    function Je3(e2) {
      for (var r2 = ""; e2--; ) r2 += "0";
      return r2;
    }
    function Gs(e2, r2, t2, n2) {
      var i2, o2 = new e2(1), s2 = Math.ceil(n2 / E2 + 4);
      for (w3 = false; ; ) {
        if (t2 % 2 && (o2 = o2.times(r2), Fs(o2.d, s2) && (i2 = true)), t2 = X3(t2 / 2), t2 === 0) {
          t2 = o2.d.length - 1, i2 && o2.d[t2] === 0 && ++o2.d[t2];
          break;
        }
        r2 = r2.times(r2), Fs(r2.d, s2);
      }
      return w3 = true, o2;
    }
    function Ls(e2) {
      return e2.d[e2.d.length - 1] & 1;
    }
    function Qs(e2, r2, t2) {
      for (var n2, i2, o2 = new e2(r2[0]), s2 = 0; ++s2 < r2.length; ) {
        if (i2 = new e2(r2[s2]), !i2.s) {
          o2 = i2;
          break;
        }
        n2 = o2.cmp(i2), (n2 === t2 || n2 === 0 && o2.s === t2) && (o2 = i2);
      }
      return o2;
    }
    function Wi(e2, r2) {
      var t2, n2, i2, o2, s2, a2, l2, u2 = 0, c2 = 0, p3 = 0, d2 = e2.constructor, f3 = d2.rounding, h2 = d2.precision;
      if (!e2.d || !e2.d[0] || e2.e > 17) return new d2(e2.d ? e2.d[0] ? e2.s < 0 ? 0 : 1 / 0 : 1 : e2.s ? e2.s < 0 ? 0 : e2 : NaN);
      for (r2 == null ? (w3 = false, l2 = h2) : l2 = r2, a2 = new d2(0.03125); e2.e > -2; ) e2 = e2.times(a2), p3 += 5;
      for (n2 = Math.log(U3(2, p3)) / Math.LN10 * 2 + 5 | 0, l2 += n2, t2 = o2 = s2 = new d2(1), d2.precision = l2; ; ) {
        if (o2 = y2(o2.times(e2), l2, 1), t2 = t2.times(++c2), a2 = s2.plus(L3(o2, t2, l2, 1)), J3(a2.d).slice(0, l2) === J3(s2.d).slice(0, l2)) {
          for (i2 = p3; i2--; ) s2 = y2(s2.times(s2), l2, 1);
          if (r2 == null) if (u2 < 3 && ut(s2.d, l2 - n2, f3, u2)) d2.precision = l2 += 10, t2 = o2 = a2 = new d2(1), c2 = 0, u2++;
          else return y2(s2, d2.precision = h2, f3, w3 = true);
          else return d2.precision = h2, s2;
        }
        s2 = a2;
      }
    }
    function Ke3(e2, r2) {
      var t2, n2, i2, o2, s2, a2, l2, u2, c2, p3, d2, f3 = 1, h2 = 10, g2 = e2, I3 = g2.d, T3 = g2.constructor, S3 = T3.rounding, b2 = T3.precision;
      if (g2.s < 0 || !I3 || !I3[0] || !g2.e && I3[0] == 1 && I3.length == 1) return new T3(I3 && !I3[0] ? -1 / 0 : g2.s != 1 ? NaN : I3 ? 0 : g2);
      if (r2 == null ? (w3 = false, c2 = b2) : c2 = r2, T3.precision = c2 += h2, t2 = J3(I3), n2 = t2.charAt(0), Math.abs(o2 = g2.e) < 15e14) {
        for (; n2 < 7 && n2 != 1 || n2 == 1 && t2.charAt(1) > 3; ) g2 = g2.times(e2), t2 = J3(g2.d), n2 = t2.charAt(0), f3++;
        o2 = g2.e, n2 > 1 ? (g2 = new T3("0." + t2), o2++) : g2 = new T3(n2 + "." + t2.slice(1));
      } else return u2 = bn(T3, c2 + 2, b2).times(o2 + ""), g2 = Ke3(new T3(n2 + "." + t2.slice(1)), c2 - h2).plus(u2), T3.precision = b2, r2 == null ? y2(g2, b2, S3, w3 = true) : g2;
      for (p3 = g2, l2 = s2 = g2 = L3(g2.minus(1), g2.plus(1), c2, 1), d2 = y2(g2.times(g2), c2, 1), i2 = 3; ; ) {
        if (s2 = y2(s2.times(d2), c2, 1), u2 = l2.plus(L3(s2, new T3(i2), c2, 1)), J3(u2.d).slice(0, c2) === J3(l2.d).slice(0, c2)) if (l2 = l2.times(2), o2 !== 0 && (l2 = l2.plus(bn(T3, c2 + 2, b2).times(o2 + ""))), l2 = L3(l2, new T3(f3), c2, 1), r2 == null) if (ut(l2.d, c2 - h2, S3, a2)) T3.precision = c2 += h2, u2 = s2 = g2 = L3(p3.minus(1), p3.plus(1), c2, 1), d2 = y2(g2.times(g2), c2, 1), i2 = a2 = 1;
        else return y2(l2, T3.precision = b2, S3, w3 = true);
        else return T3.precision = b2, l2;
        l2 = u2, i2 += 2;
      }
    }
    function Ws(e2) {
      return String(e2.s * e2.s / 0);
    }
    function gn(e2, r2) {
      var t2, n2, i2;
      for ((t2 = r2.indexOf(".")) > -1 && (r2 = r2.replace(".", "")), (n2 = r2.search(/e/i)) > 0 ? (t2 < 0 && (t2 = n2), t2 += +r2.slice(n2 + 1), r2 = r2.substring(0, n2)) : t2 < 0 && (t2 = r2.length), n2 = 0; r2.charCodeAt(n2) === 48; n2++) ;
      for (i2 = r2.length; r2.charCodeAt(i2 - 1) === 48; --i2) ;
      if (r2 = r2.slice(n2, i2), r2) {
        if (i2 -= n2, e2.e = t2 = t2 - n2 - 1, e2.d = [], n2 = (t2 + 1) % E2, t2 < 0 && (n2 += E2), n2 < i2) {
          for (n2 && e2.d.push(+r2.slice(0, n2)), i2 -= E2; n2 < i2; ) e2.d.push(+r2.slice(n2, n2 += E2));
          r2 = r2.slice(n2), n2 = E2 - r2.length;
        } else n2 -= i2;
        for (; n2--; ) r2 += "0";
        e2.d.push(+r2), w3 && (e2.e > e2.constructor.maxE ? (e2.d = null, e2.e = NaN) : e2.e < e2.constructor.minE && (e2.e = 0, e2.d = [0]));
      } else e2.e = 0, e2.d = [0];
      return e2;
    }
    function Tp(e2, r2) {
      var t2, n2, i2, o2, s2, a2, l2, u2, c2;
      if (r2.indexOf("_") > -1) {
        if (r2 = r2.replace(/(\d)_(?=\d)/g, "$1"), Bs.test(r2)) return gn(e2, r2);
      } else if (r2 === "Infinity" || r2 === "NaN") return +r2 || (e2.s = NaN), e2.e = NaN, e2.d = null, e2;
      if (Ep.test(r2)) t2 = 16, r2 = r2.toLowerCase();
      else if (bp.test(r2)) t2 = 2;
      else if (wp.test(r2)) t2 = 8;
      else throw Error(He3 + r2);
      for (o2 = r2.search(/p/i), o2 > 0 ? (l2 = +r2.slice(o2 + 1), r2 = r2.substring(2, o2)) : r2 = r2.slice(2), o2 = r2.indexOf("."), s2 = o2 >= 0, n2 = e2.constructor, s2 && (r2 = r2.replace(".", ""), a2 = r2.length, o2 = a2 - o2, i2 = Gs(n2, new n2(t2), o2, o2 * 2)), u2 = fn(r2, t2, fe3), c2 = u2.length - 1, o2 = c2; u2[o2] === 0; --o2) u2.pop();
      return o2 < 0 ? new n2(e2.s * 0) : (e2.e = wn(u2, c2), e2.d = u2, w3 = false, s2 && (e2 = L3(e2, i2, a2 * 4)), l2 && (e2 = e2.times(Math.abs(l2) < 54 ? U3(2, l2) : Le3.pow(2, l2))), w3 = true, e2);
    }
    function Sp(e2, r2) {
      var t2, n2 = r2.d.length;
      if (n2 < 3) return r2.isZero() ? r2 : Tr2(e2, 2, r2, r2);
      t2 = 1.4 * Math.sqrt(n2), t2 = t2 > 16 ? 16 : t2 | 0, r2 = r2.times(1 / xn(5, t2)), r2 = Tr2(e2, 2, r2, r2);
      for (var i2, o2 = new e2(5), s2 = new e2(16), a2 = new e2(20); t2--; ) i2 = r2.times(r2), r2 = r2.times(o2.plus(i2.times(s2.times(i2).minus(a2))));
      return r2;
    }
    function Tr2(e2, r2, t2, n2, i2) {
      var o2, s2, a2, l2, u2 = 1, c2 = e2.precision, p3 = Math.ceil(c2 / E2);
      for (w3 = false, l2 = t2.times(t2), a2 = new e2(n2); ; ) {
        if (s2 = L3(a2.times(l2), new e2(r2++ * r2++), c2, 1), a2 = i2 ? n2.plus(s2) : n2.minus(s2), n2 = L3(s2.times(l2), new e2(r2++ * r2++), c2, 1), s2 = a2.plus(n2), s2.d[p3] !== void 0) {
          for (o2 = p3; s2.d[o2] === a2.d[o2] && o2--; ) ;
          if (o2 == -1) break;
        }
        o2 = a2, a2 = n2, n2 = s2, s2 = o2, u2++;
      }
      return w3 = true, s2.d.length = p3 + 1, s2;
    }
    function xn(e2, r2) {
      for (var t2 = e2; --r2; ) t2 *= e2;
      return t2;
    }
    function Js(e2, r2) {
      var t2, n2 = r2.s < 0, i2 = xe3(e2, e2.precision, 1), o2 = i2.times(0.5);
      if (r2 = r2.abs(), r2.lte(o2)) return Ne3 = n2 ? 4 : 1, r2;
      if (t2 = r2.divToInt(i2), t2.isZero()) Ne3 = n2 ? 3 : 2;
      else {
        if (r2 = r2.minus(t2.times(i2)), r2.lte(o2)) return Ne3 = Ls(t2) ? n2 ? 2 : 3 : n2 ? 4 : 1, r2;
        Ne3 = Ls(t2) ? n2 ? 1 : 4 : n2 ? 3 : 2;
      }
      return r2.minus(i2).abs();
    }
    function Ji(e2, r2, t2, n2) {
      var i2, o2, s2, a2, l2, u2, c2, p3, d2, f3 = e2.constructor, h2 = t2 !== void 0;
      if (h2 ? (ne3(t2, 1, Ye3), n2 === void 0 ? n2 = f3.rounding : ne3(n2, 0, 8)) : (t2 = f3.precision, n2 = f3.rounding), !e2.isFinite()) c2 = Ws(e2);
      else {
        for (c2 = ve3(e2), s2 = c2.indexOf("."), h2 ? (i2 = 2, r2 == 16 ? t2 = t2 * 4 - 3 : r2 == 8 && (t2 = t2 * 3 - 2)) : i2 = r2, s2 >= 0 && (c2 = c2.replace(".", ""), d2 = new f3(1), d2.e = c2.length - s2, d2.d = fn(ve3(d2), 10, i2), d2.e = d2.d.length), p3 = fn(c2, 10, i2), o2 = l2 = p3.length; p3[--l2] == 0; ) p3.pop();
        if (!p3[0]) c2 = h2 ? "0p+0" : "0";
        else {
          if (s2 < 0 ? o2-- : (e2 = new f3(e2), e2.d = p3, e2.e = o2, e2 = L3(e2, d2, t2, n2, 0, i2), p3 = e2.d, o2 = e2.e, u2 = $s), s2 = p3[t2], a2 = i2 / 2, u2 = u2 || p3[t2 + 1] !== void 0, u2 = n2 < 4 ? (s2 !== void 0 || u2) && (n2 === 0 || n2 === (e2.s < 0 ? 3 : 2)) : s2 > a2 || s2 === a2 && (n2 === 4 || u2 || n2 === 6 && p3[t2 - 1] & 1 || n2 === (e2.s < 0 ? 8 : 7)), p3.length = t2, u2) for (; ++p3[--t2] > i2 - 1; ) p3[t2] = 0, t2 || (++o2, p3.unshift(1));
          for (l2 = p3.length; !p3[l2 - 1]; --l2) ;
          for (s2 = 0, c2 = ""; s2 < l2; s2++) c2 += Ui.charAt(p3[s2]);
          if (h2) {
            if (l2 > 1) if (r2 == 16 || r2 == 8) {
              for (s2 = r2 == 16 ? 4 : 3, --l2; l2 % s2; l2++) c2 += "0";
              for (p3 = fn(c2, i2, r2), l2 = p3.length; !p3[l2 - 1]; --l2) ;
              for (s2 = 1, c2 = "1."; s2 < l2; s2++) c2 += Ui.charAt(p3[s2]);
            } else c2 = c2.charAt(0) + "." + c2.slice(1);
            c2 = c2 + (o2 < 0 ? "p" : "p+") + o2;
          } else if (o2 < 0) {
            for (; ++o2; ) c2 = "0" + c2;
            c2 = "0." + c2;
          } else if (++o2 > l2) for (o2 -= l2; o2--; ) c2 += "0";
          else o2 < l2 && (c2 = c2.slice(0, o2) + "." + c2.slice(o2));
        }
        c2 = (r2 == 16 ? "0x" : r2 == 2 ? "0b" : r2 == 8 ? "0o" : "") + c2;
      }
      return e2.s < 0 ? "-" + c2 : c2;
    }
    function Fs(e2, r2) {
      if (e2.length > r2) return e2.length = r2, true;
    }
    function Rp(e2) {
      return new this(e2).abs();
    }
    function Ap(e2) {
      return new this(e2).acos();
    }
    function Cp(e2) {
      return new this(e2).acosh();
    }
    function Ip(e2, r2) {
      return new this(e2).plus(r2);
    }
    function Dp(e2) {
      return new this(e2).asin();
    }
    function Op(e2) {
      return new this(e2).asinh();
    }
    function kp(e2) {
      return new this(e2).atan();
    }
    function _p(e2) {
      return new this(e2).atanh();
    }
    function Np(e2, r2) {
      e2 = new this(e2), r2 = new this(r2);
      var t2, n2 = this.precision, i2 = this.rounding, o2 = n2 + 4;
      return !e2.s || !r2.s ? t2 = new this(NaN) : !e2.d && !r2.d ? (t2 = xe3(this, o2, 1).times(r2.s > 0 ? 0.25 : 0.75), t2.s = e2.s) : !r2.d || e2.isZero() ? (t2 = r2.s < 0 ? xe3(this, n2, i2) : new this(0), t2.s = e2.s) : !e2.d || r2.isZero() ? (t2 = xe3(this, o2, 1).times(0.5), t2.s = e2.s) : r2.s < 0 ? (this.precision = o2, this.rounding = 1, t2 = this.atan(L3(e2, r2, o2, 1)), r2 = xe3(this, o2, 1), this.precision = n2, this.rounding = i2, t2 = e2.s < 0 ? t2.minus(r2) : t2.plus(r2)) : t2 = this.atan(L3(e2, r2, o2, 1)), t2;
    }
    function Lp(e2) {
      return new this(e2).cbrt();
    }
    function Fp(e2) {
      return y2(e2 = new this(e2), e2.e + 1, 2);
    }
    function Mp(e2, r2, t2) {
      return new this(e2).clamp(r2, t2);
    }
    function $p(e2) {
      if (!e2 || typeof e2 != "object") throw Error(En + "Object expected");
      var r2, t2, n2, i2 = e2.defaults === true, o2 = ["precision", 1, Ye3, "rounding", 0, 8, "toExpNeg", -Pr2, 0, "toExpPos", 0, Pr2, "maxE", 0, Pr2, "minE", -Pr2, 0, "modulo", 0, 9];
      for (r2 = 0; r2 < o2.length; r2 += 3) if (t2 = o2[r2], i2 && (this[t2] = Gi[t2]), (n2 = e2[t2]) !== void 0) if (X3(n2) === n2 && n2 >= o2[r2 + 1] && n2 <= o2[r2 + 2]) this[t2] = n2;
      else throw Error(He3 + t2 + ": " + n2);
      if (t2 = "crypto", i2 && (this[t2] = Gi[t2]), (n2 = e2[t2]) !== void 0) if (n2 === true || n2 === false || n2 === 0 || n2 === 1) if (n2) if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes)) this[t2] = true;
      else throw Error(Vs);
      else this[t2] = false;
      else throw Error(He3 + t2 + ": " + n2);
      return this;
    }
    function qp(e2) {
      return new this(e2).cos();
    }
    function Vp(e2) {
      return new this(e2).cosh();
    }
    function Ks(e2) {
      var r2, t2, n2;
      function i2(o2) {
        var s2, a2, l2, u2 = this;
        if (!(u2 instanceof i2)) return new i2(o2);
        if (u2.constructor = i2, Ms(o2)) {
          u2.s = o2.s, w3 ? !o2.d || o2.e > i2.maxE ? (u2.e = NaN, u2.d = null) : o2.e < i2.minE ? (u2.e = 0, u2.d = [0]) : (u2.e = o2.e, u2.d = o2.d.slice()) : (u2.e = o2.e, u2.d = o2.d ? o2.d.slice() : o2.d);
          return;
        }
        if (l2 = typeof o2, l2 === "number") {
          if (o2 === 0) {
            u2.s = 1 / o2 < 0 ? -1 : 1, u2.e = 0, u2.d = [0];
            return;
          }
          if (o2 < 0 ? (o2 = -o2, u2.s = -1) : u2.s = 1, o2 === ~~o2 && o2 < 1e7) {
            for (s2 = 0, a2 = o2; a2 >= 10; a2 /= 10) s2++;
            w3 ? s2 > i2.maxE ? (u2.e = NaN, u2.d = null) : s2 < i2.minE ? (u2.e = 0, u2.d = [0]) : (u2.e = s2, u2.d = [o2]) : (u2.e = s2, u2.d = [o2]);
            return;
          }
          if (o2 * 0 !== 0) {
            o2 || (u2.s = NaN), u2.e = NaN, u2.d = null;
            return;
          }
          return gn(u2, o2.toString());
        }
        if (l2 === "string") return (a2 = o2.charCodeAt(0)) === 45 ? (o2 = o2.slice(1), u2.s = -1) : (a2 === 43 && (o2 = o2.slice(1)), u2.s = 1), Bs.test(o2) ? gn(u2, o2) : Tp(u2, o2);
        if (l2 === "bigint") return o2 < 0 ? (o2 = -o2, u2.s = -1) : u2.s = 1, gn(u2, o2.toString());
        throw Error(He3 + o2);
      }
      if (i2.prototype = m3, i2.ROUND_UP = 0, i2.ROUND_DOWN = 1, i2.ROUND_CEIL = 2, i2.ROUND_FLOOR = 3, i2.ROUND_HALF_UP = 4, i2.ROUND_HALF_DOWN = 5, i2.ROUND_HALF_EVEN = 6, i2.ROUND_HALF_CEIL = 7, i2.ROUND_HALF_FLOOR = 8, i2.EUCLID = 9, i2.config = i2.set = $p, i2.clone = Ks, i2.isDecimal = Ms, i2.abs = Rp, i2.acos = Ap, i2.acosh = Cp, i2.add = Ip, i2.asin = Dp, i2.asinh = Op, i2.atan = kp, i2.atanh = _p, i2.atan2 = Np, i2.cbrt = Lp, i2.ceil = Fp, i2.clamp = Mp, i2.cos = qp, i2.cosh = Vp, i2.div = jp, i2.exp = Bp, i2.floor = Up, i2.hypot = Gp, i2.ln = Qp, i2.log = Wp, i2.log10 = Kp, i2.log2 = Jp, i2.max = Hp, i2.min = Yp, i2.mod = zp, i2.mul = Zp, i2.pow = Xp, i2.random = ed, i2.round = rd, i2.sign = td, i2.sin = nd, i2.sinh = id, i2.sqrt = od, i2.sub = sd, i2.sum = ad, i2.tan = ld, i2.tanh = ud, i2.trunc = cd, e2 === void 0 && (e2 = {}), e2 && e2.defaults !== true) for (n2 = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], r2 = 0; r2 < n2.length; ) e2.hasOwnProperty(t2 = n2[r2++]) || (e2[t2] = this[t2]);
      return i2.config(e2), i2;
    }
    function jp(e2, r2) {
      return new this(e2).div(r2);
    }
    function Bp(e2) {
      return new this(e2).exp();
    }
    function Up(e2) {
      return y2(e2 = new this(e2), e2.e + 1, 3);
    }
    function Gp() {
      var e2, r2, t2 = new this(0);
      for (w3 = false, e2 = 0; e2 < arguments.length; ) if (r2 = new this(arguments[e2++]), r2.d) t2.d && (t2 = t2.plus(r2.times(r2)));
      else {
        if (r2.s) return w3 = true, new this(1 / 0);
        t2 = r2;
      }
      return w3 = true, t2.sqrt();
    }
    function Ms(e2) {
      return e2 instanceof Le3 || e2 && e2.toStringTag === js || false;
    }
    function Qp(e2) {
      return new this(e2).ln();
    }
    function Wp(e2, r2) {
      return new this(e2).log(r2);
    }
    function Jp(e2) {
      return new this(e2).log(2);
    }
    function Kp(e2) {
      return new this(e2).log(10);
    }
    function Hp() {
      return Qs(this, arguments, -1);
    }
    function Yp() {
      return Qs(this, arguments, 1);
    }
    function zp(e2, r2) {
      return new this(e2).mod(r2);
    }
    function Zp(e2, r2) {
      return new this(e2).mul(r2);
    }
    function Xp(e2, r2) {
      return new this(e2).pow(r2);
    }
    function ed(e2) {
      var r2, t2, n2, i2, o2 = 0, s2 = new this(1), a2 = [];
      if (e2 === void 0 ? e2 = this.precision : ne3(e2, 1, Ye3), n2 = Math.ceil(e2 / E2), this.crypto) if (crypto.getRandomValues) for (r2 = crypto.getRandomValues(new Uint32Array(n2)); o2 < n2; ) i2 = r2[o2], i2 >= 429e7 ? r2[o2] = crypto.getRandomValues(new Uint32Array(1))[0] : a2[o2++] = i2 % 1e7;
      else if (crypto.randomBytes) {
        for (r2 = crypto.randomBytes(n2 *= 4); o2 < n2; ) i2 = r2[o2] + (r2[o2 + 1] << 8) + (r2[o2 + 2] << 16) + ((r2[o2 + 3] & 127) << 24), i2 >= 214e7 ? crypto.randomBytes(4).copy(r2, o2) : (a2.push(i2 % 1e7), o2 += 4);
        o2 = n2 / 4;
      } else throw Error(Vs);
      else for (; o2 < n2; ) a2[o2++] = Math.random() * 1e7 | 0;
      for (n2 = a2[--o2], e2 %= E2, n2 && e2 && (i2 = U3(10, E2 - e2), a2[o2] = (n2 / i2 | 0) * i2); a2[o2] === 0; o2--) a2.pop();
      if (o2 < 0) t2 = 0, a2 = [0];
      else {
        for (t2 = -1; a2[0] === 0; t2 -= E2) a2.shift();
        for (n2 = 1, i2 = a2[0]; i2 >= 10; i2 /= 10) n2++;
        n2 < E2 && (t2 -= E2 - n2);
      }
      return s2.e = t2, s2.d = a2, s2;
    }
    function rd(e2) {
      return y2(e2 = new this(e2), e2.e + 1, this.rounding);
    }
    function td(e2) {
      return e2 = new this(e2), e2.d ? e2.d[0] ? e2.s : 0 * e2.s : e2.s || NaN;
    }
    function nd(e2) {
      return new this(e2).sin();
    }
    function id(e2) {
      return new this(e2).sinh();
    }
    function od(e2) {
      return new this(e2).sqrt();
    }
    function sd(e2, r2) {
      return new this(e2).sub(r2);
    }
    function ad() {
      var e2 = 0, r2 = arguments, t2 = new this(r2[e2]);
      for (w3 = false; t2.s && ++e2 < r2.length; ) t2 = t2.plus(r2[e2]);
      return w3 = true, y2(t2, this.precision, this.rounding);
    }
    function ld(e2) {
      return new this(e2).tan();
    }
    function ud(e2) {
      return new this(e2).tanh();
    }
    function cd(e2) {
      return y2(e2 = new this(e2), e2.e + 1, 1);
    }
    m3[Symbol.for("nodejs.util.inspect.custom")] = m3.toString;
    m3[Symbol.toStringTag] = "Decimal";
    var Le3 = m3.constructor = Ks(Gi);
    hn = new Le3(hn);
    yn = new Le3(yn);
    var Fe3 = Le3;
    function Sr3(e2) {
      return Le3.isDecimal(e2) ? true : e2 !== null && typeof e2 == "object" && typeof e2.s == "number" && typeof e2.e == "number" && typeof e2.toFixed == "function" && Array.isArray(e2.d);
    }
    var ct = {};
    tr3(ct, { ModelAction: () => Rr2, datamodelEnumToSchemaEnum: () => pd });
    function pd(e2) {
      return { name: e2.name, values: e2.values.map((r2) => r2.name) };
    }
    var Rr2 = ((b2) => (b2.findUnique = "findUnique", b2.findUniqueOrThrow = "findUniqueOrThrow", b2.findFirst = "findFirst", b2.findFirstOrThrow = "findFirstOrThrow", b2.findMany = "findMany", b2.create = "create", b2.createMany = "createMany", b2.createManyAndReturn = "createManyAndReturn", b2.update = "update", b2.updateMany = "updateMany", b2.updateManyAndReturn = "updateManyAndReturn", b2.upsert = "upsert", b2.delete = "delete", b2.deleteMany = "deleteMany", b2.groupBy = "groupBy", b2.count = "count", b2.aggregate = "aggregate", b2.findRaw = "findRaw", b2.aggregateRaw = "aggregateRaw", b2))(Rr2 || {});
    var Xs = O3(Di());
    var Zs = O3(require("fs"));
    var Hs = { keyword: De3, entity: De3, value: (e2) => W3(nr3(e2)), punctuation: nr3, directive: De3, function: De3, variable: (e2) => W3(nr3(e2)), string: (e2) => W3(qe3(e2)), boolean: Ie3, number: De3, comment: Hr2 };
    var dd = (e2) => e2;
    var vn = {};
    var md = 0;
    var v3 = { manual: vn.Prism && vn.Prism.manual, disableWorkerMessageHandler: vn.Prism && vn.Prism.disableWorkerMessageHandler, util: { encode: function(e2) {
      if (e2 instanceof ge3) {
        let r2 = e2;
        return new ge3(r2.type, v3.util.encode(r2.content), r2.alias);
      } else return Array.isArray(e2) ? e2.map(v3.util.encode) : e2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
    }, type: function(e2) {
      return Object.prototype.toString.call(e2).slice(8, -1);
    }, objId: function(e2) {
      return e2.__id || Object.defineProperty(e2, "__id", { value: ++md }), e2.__id;
    }, clone: function e2(r2, t2) {
      let n2, i2, o2 = v3.util.type(r2);
      switch (t2 = t2 || {}, o2) {
        case "Object":
          if (i2 = v3.util.objId(r2), t2[i2]) return t2[i2];
          n2 = {}, t2[i2] = n2;
          for (let s2 in r2) r2.hasOwnProperty(s2) && (n2[s2] = e2(r2[s2], t2));
          return n2;
        case "Array":
          return i2 = v3.util.objId(r2), t2[i2] ? t2[i2] : (n2 = [], t2[i2] = n2, r2.forEach(function(s2, a2) {
            n2[a2] = e2(s2, t2);
          }), n2);
        default:
          return r2;
      }
    } }, languages: { extend: function(e2, r2) {
      let t2 = v3.util.clone(v3.languages[e2]);
      for (let n2 in r2) t2[n2] = r2[n2];
      return t2;
    }, insertBefore: function(e2, r2, t2, n2) {
      n2 = n2 || v3.languages;
      let i2 = n2[e2], o2 = {};
      for (let a2 in i2) if (i2.hasOwnProperty(a2)) {
        if (a2 == r2) for (let l2 in t2) t2.hasOwnProperty(l2) && (o2[l2] = t2[l2]);
        t2.hasOwnProperty(a2) || (o2[a2] = i2[a2]);
      }
      let s2 = n2[e2];
      return n2[e2] = o2, v3.languages.DFS(v3.languages, function(a2, l2) {
        l2 === s2 && a2 != e2 && (this[a2] = o2);
      }), o2;
    }, DFS: function e2(r2, t2, n2, i2) {
      i2 = i2 || {};
      let o2 = v3.util.objId;
      for (let s2 in r2) if (r2.hasOwnProperty(s2)) {
        t2.call(r2, s2, r2[s2], n2 || s2);
        let a2 = r2[s2], l2 = v3.util.type(a2);
        l2 === "Object" && !i2[o2(a2)] ? (i2[o2(a2)] = true, e2(a2, t2, null, i2)) : l2 === "Array" && !i2[o2(a2)] && (i2[o2(a2)] = true, e2(a2, t2, s2, i2));
      }
    } }, plugins: {}, highlight: function(e2, r2, t2) {
      let n2 = { code: e2, grammar: r2, language: t2 };
      return v3.hooks.run("before-tokenize", n2), n2.tokens = v3.tokenize(n2.code, n2.grammar), v3.hooks.run("after-tokenize", n2), ge3.stringify(v3.util.encode(n2.tokens), n2.language);
    }, matchGrammar: function(e2, r2, t2, n2, i2, o2, s2) {
      for (let g2 in t2) {
        if (!t2.hasOwnProperty(g2) || !t2[g2]) continue;
        if (g2 == s2) return;
        let I3 = t2[g2];
        I3 = v3.util.type(I3) === "Array" ? I3 : [I3];
        for (let T3 = 0; T3 < I3.length; ++T3) {
          let S3 = I3[T3], b2 = S3.inside, D3 = !!S3.lookbehind, me3 = !!S3.greedy, se3 = 0, Kr2 = S3.alias;
          if (me3 && !S3.pattern.global) {
            let j3 = S3.pattern.toString().match(/[imuy]*$/)[0];
            S3.pattern = RegExp(S3.pattern.source, j3 + "g");
          }
          S3 = S3.pattern || S3;
          for (let j3 = n2, te3 = i2; j3 < r2.length; te3 += r2[j3].length, ++j3) {
            let Ae3 = r2[j3];
            if (r2.length > e2.length) return;
            if (Ae3 instanceof ge3) continue;
            if (me3 && j3 != r2.length - 1) {
              S3.lastIndex = te3;
              var p3 = S3.exec(e2);
              if (!p3) break;
              var c2 = p3.index + (D3 ? p3[1].length : 0), d2 = p3.index + p3[0].length, a2 = j3, l2 = te3;
              for (let k2 = r2.length; a2 < k2 && (l2 < d2 || !r2[a2].type && !r2[a2 - 1].greedy); ++a2) l2 += r2[a2].length, c2 >= l2 && (++j3, te3 = l2);
              if (r2[j3] instanceof ge3) continue;
              u2 = a2 - j3, Ae3 = e2.slice(te3, l2), p3.index -= te3;
            } else {
              S3.lastIndex = 0;
              var p3 = S3.exec(Ae3), u2 = 1;
            }
            if (!p3) {
              if (o2) break;
              continue;
            }
            D3 && (se3 = p3[1] ? p3[1].length : 0);
            var c2 = p3.index + se3, p3 = p3[0].slice(se3), d2 = c2 + p3.length, f3 = Ae3.slice(0, c2), h2 = Ae3.slice(d2);
            let K3 = [j3, u2];
            f3 && (++j3, te3 += f3.length, K3.push(f3));
            let fr3 = new ge3(g2, b2 ? v3.tokenize(p3, b2) : p3, Kr2, p3, me3);
            if (K3.push(fr3), h2 && K3.push(h2), Array.prototype.splice.apply(r2, K3), u2 != 1 && v3.matchGrammar(e2, r2, t2, j3, te3, true, g2), o2) break;
          }
        }
      }
    }, tokenize: function(e2, r2) {
      let t2 = [e2], n2 = r2.rest;
      if (n2) {
        for (let i2 in n2) r2[i2] = n2[i2];
        delete r2.rest;
      }
      return v3.matchGrammar(e2, t2, r2, 0, 0, false), t2;
    }, hooks: { all: {}, add: function(e2, r2) {
      let t2 = v3.hooks.all;
      t2[e2] = t2[e2] || [], t2[e2].push(r2);
    }, run: function(e2, r2) {
      let t2 = v3.hooks.all[e2];
      if (!(!t2 || !t2.length)) for (var n2 = 0, i2; i2 = t2[n2++]; ) i2(r2);
    } }, Token: ge3 };
    v3.languages.clike = { comment: [{ pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: true }, { pattern: /(^|[^\\:])\/\/.*/, lookbehind: true, greedy: true }], string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: true }, "class-name": { pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i, lookbehind: true, inside: { punctuation: /[.\\]/ } }, keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/, boolean: /\b(?:true|false)\b/, function: /\w+(?=\()/, number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i, operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/, punctuation: /[{}[\];(),.:]/ };
    v3.languages.javascript = v3.languages.extend("clike", { "class-name": [v3.languages.clike["class-name"], { pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/, lookbehind: true }], keyword: [{ pattern: /((?:^|})\s*)(?:catch|finally)\b/, lookbehind: true }, { pattern: /(^|[^.])\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/, lookbehind: true }], number: /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/, function: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/, operator: /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/ });
    v3.languages.javascript["class-name"][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;
    v3.languages.insertBefore("javascript", "keyword", { regex: { pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=\s*($|[\r\n,.;})\]]))/, lookbehind: true, greedy: true }, "function-variable": { pattern: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/, alias: "function" }, parameter: [{ pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/, lookbehind: true, inside: v3.languages.javascript }, { pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i, inside: v3.languages.javascript }, { pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/, lookbehind: true, inside: v3.languages.javascript }, { pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/, lookbehind: true, inside: v3.languages.javascript }], constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/ });
    v3.languages.markup && v3.languages.markup.tag.addInlined("script", "javascript");
    v3.languages.js = v3.languages.javascript;
    v3.languages.typescript = v3.languages.extend("javascript", { keyword: /\b(?:abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|module|namespace|new|null|of|package|private|protected|public|readonly|return|require|set|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\b/, builtin: /\b(?:string|Function|any|number|boolean|Array|symbol|console|Promise|unknown|never)\b/ });
    v3.languages.ts = v3.languages.typescript;
    function ge3(e2, r2, t2, n2, i2) {
      this.type = e2, this.content = r2, this.alias = t2, this.length = (n2 || "").length | 0, this.greedy = !!i2;
    }
    ge3.stringify = function(e2, r2) {
      return typeof e2 == "string" ? e2 : Array.isArray(e2) ? e2.map(function(t2) {
        return ge3.stringify(t2, r2);
      }).join("") : fd(e2.type)(e2.content);
    };
    function fd(e2) {
      return Hs[e2] || dd;
    }
    function Ys(e2) {
      return gd(e2, v3.languages.javascript);
    }
    function gd(e2, r2) {
      return v3.tokenize(e2, r2).map((n2) => ge3.stringify(n2)).join("");
    }
    function zs(e2) {
      return Ci(e2);
    }
    var Pn = class e2 {
      firstLineNumber;
      lines;
      static read(r2) {
        let t2;
        try {
          t2 = Zs.default.readFileSync(r2, "utf-8");
        } catch {
          return null;
        }
        return e2.fromContent(t2);
      }
      static fromContent(r2) {
        let t2 = r2.split(/\r?\n/);
        return new e2(1, t2);
      }
      constructor(r2, t2) {
        this.firstLineNumber = r2, this.lines = t2;
      }
      get lastLineNumber() {
        return this.firstLineNumber + this.lines.length - 1;
      }
      mapLineAt(r2, t2) {
        if (r2 < this.firstLineNumber || r2 > this.lines.length + this.firstLineNumber) return this;
        let n2 = r2 - this.firstLineNumber, i2 = [...this.lines];
        return i2[n2] = t2(i2[n2]), new e2(this.firstLineNumber, i2);
      }
      mapLines(r2) {
        return new e2(this.firstLineNumber, this.lines.map((t2, n2) => r2(t2, this.firstLineNumber + n2)));
      }
      lineAt(r2) {
        return this.lines[r2 - this.firstLineNumber];
      }
      prependSymbolAt(r2, t2) {
        return this.mapLines((n2, i2) => i2 === r2 ? `${t2} ${n2}` : `  ${n2}`);
      }
      slice(r2, t2) {
        let n2 = this.lines.slice(r2 - 1, t2).join(`
`);
        return new e2(r2, zs(n2).split(`
`));
      }
      highlight() {
        let r2 = Ys(this.toString());
        return new e2(this.firstLineNumber, r2.split(`
`));
      }
      toString() {
        return this.lines.join(`
`);
      }
    };
    var hd = { red: ce3, gray: Hr2, dim: Ce3, bold: W3, underline: Y3, highlightSource: (e2) => e2.highlight() };
    var yd = { red: (e2) => e2, gray: (e2) => e2, dim: (e2) => e2, bold: (e2) => e2, underline: (e2) => e2, highlightSource: (e2) => e2 };
    function bd({ message: e2, originalMethod: r2, isPanic: t2, callArguments: n2 }) {
      return { functionName: `prisma.${r2}()`, message: e2, isPanic: t2 ?? false, callArguments: n2 };
    }
    function Ed({ callsite: e2, message: r2, originalMethod: t2, isPanic: n2, callArguments: i2 }, o2) {
      let s2 = bd({ message: r2, originalMethod: t2, isPanic: n2, callArguments: i2 });
      if (!e2 || typeof window < "u" || process.env.NODE_ENV === "production") return s2;
      let a2 = e2.getLocation();
      if (!a2 || !a2.lineNumber || !a2.columnNumber) return s2;
      let l2 = Math.max(1, a2.lineNumber - 3), u2 = Pn.read(a2.fileName)?.slice(l2, a2.lineNumber), c2 = u2?.lineAt(a2.lineNumber);
      if (u2 && c2) {
        let p3 = xd(c2), d2 = wd(c2);
        if (!d2) return s2;
        s2.functionName = `${d2.code})`, s2.location = a2, n2 || (u2 = u2.mapLineAt(a2.lineNumber, (h2) => h2.slice(0, d2.openingBraceIndex))), u2 = o2.highlightSource(u2);
        let f3 = String(u2.lastLineNumber).length;
        if (s2.contextLines = u2.mapLines((h2, g2) => o2.gray(String(g2).padStart(f3)) + " " + h2).mapLines((h2) => o2.dim(h2)).prependSymbolAt(a2.lineNumber, o2.bold(o2.red("\u2192"))), i2) {
          let h2 = p3 + f3 + 1;
          h2 += 2, s2.callArguments = (0, Xs.default)(i2, h2).slice(h2);
        }
      }
      return s2;
    }
    function wd(e2) {
      let r2 = Object.keys(Rr2).join("|"), n2 = new RegExp(String.raw`\.(${r2})\(`).exec(e2);
      if (n2) {
        let i2 = n2.index + n2[0].length, o2 = e2.lastIndexOf(" ", n2.index) + 1;
        return { code: e2.slice(o2, i2), openingBraceIndex: i2 };
      }
      return null;
    }
    function xd(e2) {
      let r2 = 0;
      for (let t2 = 0; t2 < e2.length; t2++) {
        if (e2.charAt(t2) !== " ") return r2;
        r2++;
      }
      return r2;
    }
    function vd({ functionName: e2, location: r2, message: t2, isPanic: n2, contextLines: i2, callArguments: o2 }, s2) {
      let a2 = [""], l2 = r2 ? " in" : ":";
      if (n2 ? (a2.push(s2.red(`Oops, an unknown error occurred! This is ${s2.bold("on us")}, you did nothing wrong.`)), a2.push(s2.red(`It occurred in the ${s2.bold(`\`${e2}\``)} invocation${l2}`))) : a2.push(s2.red(`Invalid ${s2.bold(`\`${e2}\``)} invocation${l2}`)), r2 && a2.push(s2.underline(Pd(r2))), i2) {
        a2.push("");
        let u2 = [i2.toString()];
        o2 && (u2.push(o2), u2.push(s2.dim(")"))), a2.push(u2.join("")), o2 && a2.push("");
      } else a2.push(""), o2 && a2.push(o2), a2.push("");
      return a2.push(t2), a2.join(`
`);
    }
    function Pd(e2) {
      let r2 = [e2.fileName];
      return e2.lineNumber && r2.push(String(e2.lineNumber)), e2.columnNumber && r2.push(String(e2.columnNumber)), r2.join(":");
    }
    function Tn(e2) {
      let r2 = e2.showColors ? hd : yd, t2;
      return t2 = Ed(e2, r2), vd(t2, r2);
    }
    var la2 = O3(Ki());
    function na2(e2, r2, t2) {
      let n2 = ia2(e2), i2 = Td(n2), o2 = Rd(i2);
      o2 ? Sn(o2, r2, t2) : r2.addErrorMessage(() => "Unknown error");
    }
    function ia2(e2) {
      return e2.errors.flatMap((r2) => r2.kind === "Union" ? ia2(r2) : [r2]);
    }
    function Td(e2) {
      let r2 = /* @__PURE__ */ new Map(), t2 = [];
      for (let n2 of e2) {
        if (n2.kind !== "InvalidArgumentType") {
          t2.push(n2);
          continue;
        }
        let i2 = `${n2.selectionPath.join(".")}:${n2.argumentPath.join(".")}`, o2 = r2.get(i2);
        o2 ? r2.set(i2, { ...n2, argument: { ...n2.argument, typeNames: Sd(o2.argument.typeNames, n2.argument.typeNames) } }) : r2.set(i2, n2);
      }
      return t2.push(...r2.values()), t2;
    }
    function Sd(e2, r2) {
      return [...new Set(e2.concat(r2))];
    }
    function Rd(e2) {
      return ji(e2, (r2, t2) => {
        let n2 = ra2(r2), i2 = ra2(t2);
        return n2 !== i2 ? n2 - i2 : ta2(r2) - ta2(t2);
      });
    }
    function ra2(e2) {
      let r2 = 0;
      return Array.isArray(e2.selectionPath) && (r2 += e2.selectionPath.length), Array.isArray(e2.argumentPath) && (r2 += e2.argumentPath.length), r2;
    }
    function ta2(e2) {
      switch (e2.kind) {
        case "InvalidArgumentValue":
        case "ValueTooLarge":
          return 20;
        case "InvalidArgumentType":
          return 10;
        case "RequiredArgumentMissing":
          return -10;
        default:
          return 0;
      }
    }
    var le3 = class {
      constructor(r2, t2) {
        this.name = r2;
        this.value = t2;
      }
      isRequired = false;
      makeRequired() {
        return this.isRequired = true, this;
      }
      write(r2) {
        let { colors: { green: t2 } } = r2.context;
        r2.addMarginSymbol(t2(this.isRequired ? "+" : "?")), r2.write(t2(this.name)), this.isRequired || r2.write(t2("?")), r2.write(t2(": ")), typeof this.value == "string" ? r2.write(t2(this.value)) : r2.write(this.value);
      }
    };
    sa2();
    var Ar2 = class {
      constructor(r2 = 0, t2) {
        this.context = t2;
        this.currentIndent = r2;
      }
      lines = [];
      currentLine = "";
      currentIndent = 0;
      marginSymbol;
      afterNextNewLineCallback;
      write(r2) {
        return typeof r2 == "string" ? this.currentLine += r2 : r2.write(this), this;
      }
      writeJoined(r2, t2, n2 = (i2, o2) => o2.write(i2)) {
        let i2 = t2.length - 1;
        for (let o2 = 0; o2 < t2.length; o2++) n2(t2[o2], this), o2 !== i2 && this.write(r2);
        return this;
      }
      writeLine(r2) {
        return this.write(r2).newLine();
      }
      newLine() {
        this.lines.push(this.indentedCurrentLine()), this.currentLine = "", this.marginSymbol = void 0;
        let r2 = this.afterNextNewLineCallback;
        return this.afterNextNewLineCallback = void 0, r2?.(), this;
      }
      withIndent(r2) {
        return this.indent(), r2(this), this.unindent(), this;
      }
      afterNextNewline(r2) {
        return this.afterNextNewLineCallback = r2, this;
      }
      indent() {
        return this.currentIndent++, this;
      }
      unindent() {
        return this.currentIndent > 0 && this.currentIndent--, this;
      }
      addMarginSymbol(r2) {
        return this.marginSymbol = r2, this;
      }
      toString() {
        return this.lines.concat(this.indentedCurrentLine()).join(`
`);
      }
      getCurrentLineLength() {
        return this.currentLine.length;
      }
      indentedCurrentLine() {
        let r2 = this.currentLine.padStart(this.currentLine.length + 2 * this.currentIndent);
        return this.marginSymbol ? this.marginSymbol + r2.slice(1) : r2;
      }
    };
    oa2();
    var Rn = class {
      constructor(r2) {
        this.value = r2;
      }
      write(r2) {
        r2.write(this.value);
      }
      markAsError() {
        this.value.markAsError();
      }
    };
    var An = (e2) => e2;
    var Cn = { bold: An, red: An, green: An, dim: An, enabled: false };
    var aa2 = { bold: W3, red: ce3, green: qe3, dim: Ce3, enabled: true };
    var Cr3 = { write(e2) {
      e2.writeLine(",");
    } };
    var Pe3 = class {
      constructor(r2) {
        this.contents = r2;
      }
      isUnderlined = false;
      color = (r2) => r2;
      underline() {
        return this.isUnderlined = true, this;
      }
      setColor(r2) {
        return this.color = r2, this;
      }
      write(r2) {
        let t2 = r2.getCurrentLineLength();
        r2.write(this.color(this.contents)), this.isUnderlined && r2.afterNextNewline(() => {
          r2.write(" ".repeat(t2)).writeLine(this.color("~".repeat(this.contents.length)));
        });
      }
    };
    var ze3 = class {
      hasError = false;
      markAsError() {
        return this.hasError = true, this;
      }
    };
    var Ir2 = class extends ze3 {
      items = [];
      addItem(r2) {
        return this.items.push(new Rn(r2)), this;
      }
      getField(r2) {
        return this.items[r2];
      }
      getPrintWidth() {
        return this.items.length === 0 ? 2 : Math.max(...this.items.map((t2) => t2.value.getPrintWidth())) + 2;
      }
      write(r2) {
        if (this.items.length === 0) {
          this.writeEmpty(r2);
          return;
        }
        this.writeWithItems(r2);
      }
      writeEmpty(r2) {
        let t2 = new Pe3("[]");
        this.hasError && t2.setColor(r2.context.colors.red).underline(), r2.write(t2);
      }
      writeWithItems(r2) {
        let { colors: t2 } = r2.context;
        r2.writeLine("[").withIndent(() => r2.writeJoined(Cr3, this.items).newLine()).write("]"), this.hasError && r2.afterNextNewline(() => {
          r2.writeLine(t2.red("~".repeat(this.getPrintWidth())));
        });
      }
      asObject() {
      }
    };
    var Dr2 = class e2 extends ze3 {
      fields = {};
      suggestions = [];
      addField(r2) {
        this.fields[r2.name] = r2;
      }
      addSuggestion(r2) {
        this.suggestions.push(r2);
      }
      getField(r2) {
        return this.fields[r2];
      }
      getDeepField(r2) {
        let [t2, ...n2] = r2, i2 = this.getField(t2);
        if (!i2) return;
        let o2 = i2;
        for (let s2 of n2) {
          let a2;
          if (o2.value instanceof e2 ? a2 = o2.value.getField(s2) : o2.value instanceof Ir2 && (a2 = o2.value.getField(Number(s2))), !a2) return;
          o2 = a2;
        }
        return o2;
      }
      getDeepFieldValue(r2) {
        return r2.length === 0 ? this : this.getDeepField(r2)?.value;
      }
      hasField(r2) {
        return !!this.getField(r2);
      }
      removeAllFields() {
        this.fields = {};
      }
      removeField(r2) {
        delete this.fields[r2];
      }
      getFields() {
        return this.fields;
      }
      isEmpty() {
        return Object.keys(this.fields).length === 0;
      }
      getFieldValue(r2) {
        return this.getField(r2)?.value;
      }
      getDeepSubSelectionValue(r2) {
        let t2 = this;
        for (let n2 of r2) {
          if (!(t2 instanceof e2)) return;
          let i2 = t2.getSubSelectionValue(n2);
          if (!i2) return;
          t2 = i2;
        }
        return t2;
      }
      getDeepSelectionParent(r2) {
        let t2 = this.getSelectionParent();
        if (!t2) return;
        let n2 = t2;
        for (let i2 of r2) {
          let o2 = n2.value.getFieldValue(i2);
          if (!o2 || !(o2 instanceof e2)) return;
          let s2 = o2.getSelectionParent();
          if (!s2) return;
          n2 = s2;
        }
        return n2;
      }
      getSelectionParent() {
        let r2 = this.getField("select")?.value.asObject();
        if (r2) return { kind: "select", value: r2 };
        let t2 = this.getField("include")?.value.asObject();
        if (t2) return { kind: "include", value: t2 };
      }
      getSubSelectionValue(r2) {
        return this.getSelectionParent()?.value.fields[r2].value;
      }
      getPrintWidth() {
        let r2 = Object.values(this.fields);
        return r2.length == 0 ? 2 : Math.max(...r2.map((n2) => n2.getPrintWidth())) + 2;
      }
      write(r2) {
        let t2 = Object.values(this.fields);
        if (t2.length === 0 && this.suggestions.length === 0) {
          this.writeEmpty(r2);
          return;
        }
        this.writeWithContents(r2, t2);
      }
      asObject() {
        return this;
      }
      writeEmpty(r2) {
        let t2 = new Pe3("{}");
        this.hasError && t2.setColor(r2.context.colors.red).underline(), r2.write(t2);
      }
      writeWithContents(r2, t2) {
        r2.writeLine("{").withIndent(() => {
          r2.writeJoined(Cr3, [...t2, ...this.suggestions]).newLine();
        }), r2.write("}"), this.hasError && r2.afterNextNewline(() => {
          r2.writeLine(r2.context.colors.red("~".repeat(this.getPrintWidth())));
        });
      }
    };
    var Q3 = class extends ze3 {
      constructor(t2) {
        super();
        this.text = t2;
      }
      getPrintWidth() {
        return this.text.length;
      }
      write(t2) {
        let n2 = new Pe3(this.text);
        this.hasError && n2.underline().setColor(t2.context.colors.red), t2.write(n2);
      }
      asObject() {
      }
    };
    var pt = class {
      fields = [];
      addField(r2, t2) {
        return this.fields.push({ write(n2) {
          let { green: i2, dim: o2 } = n2.context.colors;
          n2.write(i2(o2(`${r2}: ${t2}`))).addMarginSymbol(i2(o2("+")));
        } }), this;
      }
      write(r2) {
        let { colors: { green: t2 } } = r2.context;
        r2.writeLine(t2("{")).withIndent(() => {
          r2.writeJoined(Cr3, this.fields).newLine();
        }).write(t2("}")).addMarginSymbol(t2("+"));
      }
    };
    function Sn(e2, r2, t2) {
      switch (e2.kind) {
        case "MutuallyExclusiveFields":
          Ad(e2, r2);
          break;
        case "IncludeOnScalar":
          Cd(e2, r2);
          break;
        case "EmptySelection":
          Id(e2, r2, t2);
          break;
        case "UnknownSelectionField":
          _d(e2, r2);
          break;
        case "InvalidSelectionValue":
          Nd(e2, r2);
          break;
        case "UnknownArgument":
          Ld(e2, r2);
          break;
        case "UnknownInputField":
          Fd(e2, r2);
          break;
        case "RequiredArgumentMissing":
          Md(e2, r2);
          break;
        case "InvalidArgumentType":
          $d(e2, r2);
          break;
        case "InvalidArgumentValue":
          qd(e2, r2);
          break;
        case "ValueTooLarge":
          Vd(e2, r2);
          break;
        case "SomeFieldsMissing":
          jd(e2, r2);
          break;
        case "TooManyFieldsGiven":
          Bd(e2, r2);
          break;
        case "Union":
          na2(e2, r2, t2);
          break;
        default:
          throw new Error("not implemented: " + e2.kind);
      }
    }
    function Ad(e2, r2) {
      let t2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject();
      t2 && (t2.getField(e2.firstField)?.markAsError(), t2.getField(e2.secondField)?.markAsError()), r2.addErrorMessage((n2) => `Please ${n2.bold("either")} use ${n2.green(`\`${e2.firstField}\``)} or ${n2.green(`\`${e2.secondField}\``)}, but ${n2.red("not both")} at the same time.`);
    }
    function Cd(e2, r2) {
      let [t2, n2] = Or2(e2.selectionPath), i2 = e2.outputType, o2 = r2.arguments.getDeepSelectionParent(t2)?.value;
      if (o2 && (o2.getField(n2)?.markAsError(), i2)) for (let s2 of i2.fields) s2.isRelation && o2.addSuggestion(new le3(s2.name, "true"));
      r2.addErrorMessage((s2) => {
        let a2 = `Invalid scalar field ${s2.red(`\`${n2}\``)} for ${s2.bold("include")} statement`;
        return i2 ? a2 += ` on model ${s2.bold(i2.name)}. ${dt(s2)}` : a2 += ".", a2 += `
Note that ${s2.bold("include")} statements only accept relation fields.`, a2;
      });
    }
    function Id(e2, r2, t2) {
      let n2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject();
      if (n2) {
        let i2 = n2.getField("omit")?.value.asObject();
        if (i2) {
          Dd(e2, r2, i2);
          return;
        }
        if (n2.hasField("select")) {
          Od(e2, r2);
          return;
        }
      }
      if (t2?.[We3(e2.outputType.name)]) {
        kd(e2, r2);
        return;
      }
      r2.addErrorMessage(() => `Unknown field at "${e2.selectionPath.join(".")} selection"`);
    }
    function Dd(e2, r2, t2) {
      t2.removeAllFields();
      for (let n2 of e2.outputType.fields) t2.addSuggestion(new le3(n2.name, "false"));
      r2.addErrorMessage((n2) => `The ${n2.red("omit")} statement includes every field of the model ${n2.bold(e2.outputType.name)}. At least one field must be included in the result`);
    }
    function Od(e2, r2) {
      let t2 = e2.outputType, n2 = r2.arguments.getDeepSelectionParent(e2.selectionPath)?.value, i2 = n2?.isEmpty() ?? false;
      n2 && (n2.removeAllFields(), pa2(n2, t2)), r2.addErrorMessage((o2) => i2 ? `The ${o2.red("`select`")} statement for type ${o2.bold(t2.name)} must not be empty. ${dt(o2)}` : `The ${o2.red("`select`")} statement for type ${o2.bold(t2.name)} needs ${o2.bold("at least one truthy value")}.`);
    }
    function kd(e2, r2) {
      let t2 = new pt();
      for (let i2 of e2.outputType.fields) i2.isRelation || t2.addField(i2.name, "false");
      let n2 = new le3("omit", t2).makeRequired();
      if (e2.selectionPath.length === 0) r2.arguments.addSuggestion(n2);
      else {
        let [i2, o2] = Or2(e2.selectionPath), a2 = r2.arguments.getDeepSelectionParent(i2)?.value.asObject()?.getField(o2);
        if (a2) {
          let l2 = a2?.value.asObject() ?? new Dr2();
          l2.addSuggestion(n2), a2.value = l2;
        }
      }
      r2.addErrorMessage((i2) => `The global ${i2.red("omit")} configuration excludes every field of the model ${i2.bold(e2.outputType.name)}. At least one field must be included in the result`);
    }
    function _d(e2, r2) {
      let t2 = da3(e2.selectionPath, r2);
      if (t2.parentKind !== "unknown") {
        t2.field.markAsError();
        let n2 = t2.parent;
        switch (t2.parentKind) {
          case "select":
            pa2(n2, e2.outputType);
            break;
          case "include":
            Ud(n2, e2.outputType);
            break;
          case "omit":
            Gd(n2, e2.outputType);
            break;
        }
      }
      r2.addErrorMessage((n2) => {
        let i2 = [`Unknown field ${n2.red(`\`${t2.fieldName}\``)}`];
        return t2.parentKind !== "unknown" && i2.push(`for ${n2.bold(t2.parentKind)} statement`), i2.push(`on model ${n2.bold(`\`${e2.outputType.name}\``)}.`), i2.push(dt(n2)), i2.join(" ");
      });
    }
    function Nd(e2, r2) {
      let t2 = da3(e2.selectionPath, r2);
      t2.parentKind !== "unknown" && t2.field.value.markAsError(), r2.addErrorMessage((n2) => `Invalid value for selection field \`${n2.red(t2.fieldName)}\`: ${e2.underlyingError}`);
    }
    function Ld(e2, r2) {
      let t2 = e2.argumentPath[0], n2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject();
      n2 && (n2.getField(t2)?.markAsError(), Qd(n2, e2.arguments)), r2.addErrorMessage((i2) => ua2(i2, t2, e2.arguments.map((o2) => o2.name)));
    }
    function Fd(e2, r2) {
      let [t2, n2] = Or2(e2.argumentPath), i2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject();
      if (i2) {
        i2.getDeepField(e2.argumentPath)?.markAsError();
        let o2 = i2.getDeepFieldValue(t2)?.asObject();
        o2 && ma2(o2, e2.inputType);
      }
      r2.addErrorMessage((o2) => ua2(o2, n2, e2.inputType.fields.map((s2) => s2.name)));
    }
    function ua2(e2, r2, t2) {
      let n2 = [`Unknown argument \`${e2.red(r2)}\`.`], i2 = Jd(r2, t2);
      return i2 && n2.push(`Did you mean \`${e2.green(i2)}\`?`), t2.length > 0 && n2.push(dt(e2)), n2.join(" ");
    }
    function Md(e2, r2) {
      let t2;
      r2.addErrorMessage((l2) => t2?.value instanceof Q3 && t2.value.text === "null" ? `Argument \`${l2.green(o2)}\` must not be ${l2.red("null")}.` : `Argument \`${l2.green(o2)}\` is missing.`);
      let n2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject();
      if (!n2) return;
      let [i2, o2] = Or2(e2.argumentPath), s2 = new pt(), a2 = n2.getDeepFieldValue(i2)?.asObject();
      if (a2) {
        if (t2 = a2.getField(o2), t2 && a2.removeField(o2), e2.inputTypes.length === 1 && e2.inputTypes[0].kind === "object") {
          for (let l2 of e2.inputTypes[0].fields) s2.addField(l2.name, l2.typeNames.join(" | "));
          a2.addSuggestion(new le3(o2, s2).makeRequired());
        } else {
          let l2 = e2.inputTypes.map(ca2).join(" | ");
          a2.addSuggestion(new le3(o2, l2).makeRequired());
        }
        if (e2.dependentArgumentPath) {
          n2.getDeepField(e2.dependentArgumentPath)?.markAsError();
          let [, l2] = Or2(e2.dependentArgumentPath);
          r2.addErrorMessage((u2) => `Argument \`${u2.green(o2)}\` is required because argument \`${u2.green(l2)}\` was provided.`);
        }
      }
    }
    function ca2(e2) {
      return e2.kind === "list" ? `${ca2(e2.elementType)}[]` : e2.name;
    }
    function $d(e2, r2) {
      let t2 = e2.argument.name, n2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject();
      n2 && n2.getDeepFieldValue(e2.argumentPath)?.markAsError(), r2.addErrorMessage((i2) => {
        let o2 = In("or", e2.argument.typeNames.map((s2) => i2.green(s2)));
        return `Argument \`${i2.bold(t2)}\`: Invalid value provided. Expected ${o2}, provided ${i2.red(e2.inferredType)}.`;
      });
    }
    function qd(e2, r2) {
      let t2 = e2.argument.name, n2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject();
      n2 && n2.getDeepFieldValue(e2.argumentPath)?.markAsError(), r2.addErrorMessage((i2) => {
        let o2 = [`Invalid value for argument \`${i2.bold(t2)}\``];
        if (e2.underlyingError && o2.push(`: ${e2.underlyingError}`), o2.push("."), e2.argument.typeNames.length > 0) {
          let s2 = In("or", e2.argument.typeNames.map((a2) => i2.green(a2)));
          o2.push(` Expected ${s2}.`);
        }
        return o2.join("");
      });
    }
    function Vd(e2, r2) {
      let t2 = e2.argument.name, n2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject(), i2;
      if (n2) {
        let s2 = n2.getDeepField(e2.argumentPath)?.value;
        s2?.markAsError(), s2 instanceof Q3 && (i2 = s2.text);
      }
      r2.addErrorMessage((o2) => {
        let s2 = ["Unable to fit value"];
        return i2 && s2.push(o2.red(i2)), s2.push(`into a 64-bit signed integer for field \`${o2.bold(t2)}\``), s2.join(" ");
      });
    }
    function jd(e2, r2) {
      let t2 = e2.argumentPath[e2.argumentPath.length - 1], n2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject();
      if (n2) {
        let i2 = n2.getDeepFieldValue(e2.argumentPath)?.asObject();
        i2 && ma2(i2, e2.inputType);
      }
      r2.addErrorMessage((i2) => {
        let o2 = [`Argument \`${i2.bold(t2)}\` of type ${i2.bold(e2.inputType.name)} needs`];
        return e2.constraints.minFieldCount === 1 ? e2.constraints.requiredFields ? o2.push(`${i2.green("at least one of")} ${In("or", e2.constraints.requiredFields.map((s2) => `\`${i2.bold(s2)}\``))} arguments.`) : o2.push(`${i2.green("at least one")} argument.`) : o2.push(`${i2.green(`at least ${e2.constraints.minFieldCount}`)} arguments.`), o2.push(dt(i2)), o2.join(" ");
      });
    }
    function Bd(e2, r2) {
      let t2 = e2.argumentPath[e2.argumentPath.length - 1], n2 = r2.arguments.getDeepSubSelectionValue(e2.selectionPath)?.asObject(), i2 = [];
      if (n2) {
        let o2 = n2.getDeepFieldValue(e2.argumentPath)?.asObject();
        o2 && (o2.markAsError(), i2 = Object.keys(o2.getFields()));
      }
      r2.addErrorMessage((o2) => {
        let s2 = [`Argument \`${o2.bold(t2)}\` of type ${o2.bold(e2.inputType.name)} needs`];
        return e2.constraints.minFieldCount === 1 && e2.constraints.maxFieldCount == 1 ? s2.push(`${o2.green("exactly one")} argument,`) : e2.constraints.maxFieldCount == 1 ? s2.push(`${o2.green("at most one")} argument,`) : s2.push(`${o2.green(`at most ${e2.constraints.maxFieldCount}`)} arguments,`), s2.push(`but you provided ${In("and", i2.map((a2) => o2.red(a2)))}. Please choose`), e2.constraints.maxFieldCount === 1 ? s2.push("one.") : s2.push(`${e2.constraints.maxFieldCount}.`), s2.join(" ");
      });
    }
    function pa2(e2, r2) {
      for (let t2 of r2.fields) e2.hasField(t2.name) || e2.addSuggestion(new le3(t2.name, "true"));
    }
    function Ud(e2, r2) {
      for (let t2 of r2.fields) t2.isRelation && !e2.hasField(t2.name) && e2.addSuggestion(new le3(t2.name, "true"));
    }
    function Gd(e2, r2) {
      for (let t2 of r2.fields) !e2.hasField(t2.name) && !t2.isRelation && e2.addSuggestion(new le3(t2.name, "true"));
    }
    function Qd(e2, r2) {
      for (let t2 of r2) e2.hasField(t2.name) || e2.addSuggestion(new le3(t2.name, t2.typeNames.join(" | ")));
    }
    function da3(e2, r2) {
      let [t2, n2] = Or2(e2), i2 = r2.arguments.getDeepSubSelectionValue(t2)?.asObject();
      if (!i2) return { parentKind: "unknown", fieldName: n2 };
      let o2 = i2.getFieldValue("select")?.asObject(), s2 = i2.getFieldValue("include")?.asObject(), a2 = i2.getFieldValue("omit")?.asObject(), l2 = o2?.getField(n2);
      return o2 && l2 ? { parentKind: "select", parent: o2, field: l2, fieldName: n2 } : (l2 = s2?.getField(n2), s2 && l2 ? { parentKind: "include", field: l2, parent: s2, fieldName: n2 } : (l2 = a2?.getField(n2), a2 && l2 ? { parentKind: "omit", field: l2, parent: a2, fieldName: n2 } : { parentKind: "unknown", fieldName: n2 }));
    }
    function ma2(e2, r2) {
      if (r2.kind === "object") for (let t2 of r2.fields) e2.hasField(t2.name) || e2.addSuggestion(new le3(t2.name, t2.typeNames.join(" | ")));
    }
    function Or2(e2) {
      let r2 = [...e2], t2 = r2.pop();
      if (!t2) throw new Error("unexpected empty path");
      return [r2, t2];
    }
    function dt({ green: e2, enabled: r2 }) {
      return "Available options are " + (r2 ? `listed in ${e2("green")}` : "marked with ?") + ".";
    }
    function In(e2, r2) {
      if (r2.length === 1) return r2[0];
      let t2 = [...r2], n2 = t2.pop();
      return `${t2.join(", ")} ${e2} ${n2}`;
    }
    var Wd = 3;
    function Jd(e2, r2) {
      let t2 = 1 / 0, n2;
      for (let i2 of r2) {
        let o2 = (0, la2.default)(e2, i2);
        o2 > Wd || o2 < t2 && (t2 = o2, n2 = i2);
      }
      return n2;
    }
    var mt = class {
      modelName;
      name;
      typeName;
      isList;
      isEnum;
      constructor(r2, t2, n2, i2, o2) {
        this.modelName = r2, this.name = t2, this.typeName = n2, this.isList = i2, this.isEnum = o2;
      }
      _toGraphQLInputType() {
        let r2 = this.isList ? "List" : "", t2 = this.isEnum ? "Enum" : "";
        return `${r2}${t2}${this.typeName}FieldRefInput<${this.modelName}>`;
      }
    };
    function kr3(e2) {
      return e2 instanceof mt;
    }
    var Dn = Symbol();
    var Yi = /* @__PURE__ */ new WeakMap();
    var Me3 = class {
      constructor(r2) {
        r2 === Dn ? Yi.set(this, `Prisma.${this._getName()}`) : Yi.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`);
      }
      _getName() {
        return this.constructor.name;
      }
      toString() {
        return Yi.get(this);
      }
    };
    var ft = class extends Me3 {
      _getNamespace() {
        return "NullTypes";
      }
    };
    var gt = class extends ft {
      #e;
    };
    zi(gt, "DbNull");
    var ht = class extends ft {
      #e;
    };
    zi(ht, "JsonNull");
    var yt = class extends ft {
      #e;
    };
    zi(yt, "AnyNull");
    var On = { classes: { DbNull: gt, JsonNull: ht, AnyNull: yt }, instances: { DbNull: new gt(Dn), JsonNull: new ht(Dn), AnyNull: new yt(Dn) } };
    function zi(e2, r2) {
      Object.defineProperty(e2, "name", { value: r2, configurable: true });
    }
    var fa2 = ": ";
    var kn = class {
      constructor(r2, t2) {
        this.name = r2;
        this.value = t2;
      }
      hasError = false;
      markAsError() {
        this.hasError = true;
      }
      getPrintWidth() {
        return this.name.length + this.value.getPrintWidth() + fa2.length;
      }
      write(r2) {
        let t2 = new Pe3(this.name);
        this.hasError && t2.underline().setColor(r2.context.colors.red), r2.write(t2).write(fa2).write(this.value);
      }
    };
    var Zi = class {
      arguments;
      errorMessages = [];
      constructor(r2) {
        this.arguments = r2;
      }
      write(r2) {
        r2.write(this.arguments);
      }
      addErrorMessage(r2) {
        this.errorMessages.push(r2);
      }
      renderAllMessages(r2) {
        return this.errorMessages.map((t2) => t2(r2)).join(`
`);
      }
    };
    function _r2(e2) {
      return new Zi(ga2(e2));
    }
    function ga2(e2) {
      let r2 = new Dr2();
      for (let [t2, n2] of Object.entries(e2)) {
        let i2 = new kn(t2, ha2(n2));
        r2.addField(i2);
      }
      return r2;
    }
    function ha2(e2) {
      if (typeof e2 == "string") return new Q3(JSON.stringify(e2));
      if (typeof e2 == "number" || typeof e2 == "boolean") return new Q3(String(e2));
      if (typeof e2 == "bigint") return new Q3(`${e2}n`);
      if (e2 === null) return new Q3("null");
      if (e2 === void 0) return new Q3("undefined");
      if (Sr3(e2)) return new Q3(`new Prisma.Decimal("${e2.toFixed()}")`);
      if (e2 instanceof Uint8Array) return Buffer.isBuffer(e2) ? new Q3(`Buffer.alloc(${e2.byteLength})`) : new Q3(`new Uint8Array(${e2.byteLength})`);
      if (e2 instanceof Date) {
        let r2 = mn(e2) ? e2.toISOString() : "Invalid Date";
        return new Q3(`new Date("${r2}")`);
      }
      return e2 instanceof Me3 ? new Q3(`Prisma.${e2._getName()}`) : kr3(e2) ? new Q3(`prisma.${We3(e2.modelName)}.$fields.${e2.name}`) : Array.isArray(e2) ? Kd(e2) : typeof e2 == "object" ? ga2(e2) : new Q3(Object.prototype.toString.call(e2));
    }
    function Kd(e2) {
      let r2 = new Ir2();
      for (let t2 of e2) r2.addItem(ha2(t2));
      return r2;
    }
    function _n(e2, r2) {
      let t2 = r2 === "pretty" ? aa2 : Cn, n2 = e2.renderAllMessages(t2), i2 = new Ar2(0, { colors: t2 }).write(e2).toString();
      return { message: n2, args: i2 };
    }
    function Nn({ args: e2, errors: r2, errorFormat: t2, callsite: n2, originalMethod: i2, clientVersion: o2, globalOmit: s2 }) {
      let a2 = _r2(e2);
      for (let p3 of r2) Sn(p3, a2, s2);
      let { message: l2, args: u2 } = _n(a2, t2), c2 = Tn({ message: l2, callsite: n2, originalMethod: i2, showColors: t2 === "pretty", callArguments: u2 });
      throw new Z3(c2, { clientVersion: o2 });
    }
    function Te2(e2) {
      return e2.replace(/^./, (r2) => r2.toLowerCase());
    }
    function ba2(e2, r2, t2) {
      let n2 = Te2(t2);
      return !r2.result || !(r2.result.$allModels || r2.result[n2]) ? e2 : Hd({ ...e2, ...ya2(r2.name, e2, r2.result.$allModels), ...ya2(r2.name, e2, r2.result[n2]) });
    }
    function Hd(e2) {
      let r2 = new we3(), t2 = (n2, i2) => r2.getOrCreate(n2, () => i2.has(n2) ? [n2] : (i2.add(n2), e2[n2] ? e2[n2].needs.flatMap((o2) => t2(o2, i2)) : [n2]));
      return pn(e2, (n2) => ({ ...n2, needs: t2(n2.name, /* @__PURE__ */ new Set()) }));
    }
    function ya2(e2, r2, t2) {
      return t2 ? pn(t2, ({ needs: n2, compute: i2 }, o2) => ({ name: o2, needs: n2 ? Object.keys(n2).filter((s2) => n2[s2]) : [], compute: Yd(r2, o2, i2) })) : {};
    }
    function Yd(e2, r2, t2) {
      let n2 = e2?.[r2]?.compute;
      return n2 ? (i2) => t2({ ...i2, [r2]: n2(i2) }) : t2;
    }
    function Ea2(e2, r2) {
      if (!r2) return e2;
      let t2 = { ...e2 };
      for (let n2 of Object.values(r2)) if (e2[n2.name]) for (let i2 of n2.needs) t2[i2] = true;
      return t2;
    }
    function wa2(e2, r2) {
      if (!r2) return e2;
      let t2 = { ...e2 };
      for (let n2 of Object.values(r2)) if (!e2[n2.name]) for (let i2 of n2.needs) delete t2[i2];
      return t2;
    }
    var Ln = class {
      constructor(r2, t2) {
        this.extension = r2;
        this.previous = t2;
      }
      computedFieldsCache = new we3();
      modelExtensionsCache = new we3();
      queryCallbacksCache = new we3();
      clientExtensions = lt(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions());
      batchCallbacks = lt(() => {
        let r2 = this.previous?.getAllBatchQueryCallbacks() ?? [], t2 = this.extension.query?.$__internalBatch;
        return t2 ? r2.concat(t2) : r2;
      });
      getAllComputedFields(r2) {
        return this.computedFieldsCache.getOrCreate(r2, () => ba2(this.previous?.getAllComputedFields(r2), this.extension, r2));
      }
      getAllClientExtensions() {
        return this.clientExtensions.get();
      }
      getAllModelExtensions(r2) {
        return this.modelExtensionsCache.getOrCreate(r2, () => {
          let t2 = Te2(r2);
          return !this.extension.model || !(this.extension.model[t2] || this.extension.model.$allModels) ? this.previous?.getAllModelExtensions(r2) : { ...this.previous?.getAllModelExtensions(r2), ...this.extension.model.$allModels, ...this.extension.model[t2] };
        });
      }
      getAllQueryCallbacks(r2, t2) {
        return this.queryCallbacksCache.getOrCreate(`${r2}:${t2}`, () => {
          let n2 = this.previous?.getAllQueryCallbacks(r2, t2) ?? [], i2 = [], o2 = this.extension.query;
          return !o2 || !(o2[r2] || o2.$allModels || o2[t2] || o2.$allOperations) ? n2 : (o2[r2] !== void 0 && (o2[r2][t2] !== void 0 && i2.push(o2[r2][t2]), o2[r2].$allOperations !== void 0 && i2.push(o2[r2].$allOperations)), r2 !== "$none" && o2.$allModels !== void 0 && (o2.$allModels[t2] !== void 0 && i2.push(o2.$allModels[t2]), o2.$allModels.$allOperations !== void 0 && i2.push(o2.$allModels.$allOperations)), o2[t2] !== void 0 && i2.push(o2[t2]), o2.$allOperations !== void 0 && i2.push(o2.$allOperations), n2.concat(i2));
        });
      }
      getAllBatchQueryCallbacks() {
        return this.batchCallbacks.get();
      }
    };
    var Nr2 = class e2 {
      constructor(r2) {
        this.head = r2;
      }
      static empty() {
        return new e2();
      }
      static single(r2) {
        return new e2(new Ln(r2));
      }
      isEmpty() {
        return this.head === void 0;
      }
      append(r2) {
        return new e2(new Ln(r2, this.head));
      }
      getAllComputedFields(r2) {
        return this.head?.getAllComputedFields(r2);
      }
      getAllClientExtensions() {
        return this.head?.getAllClientExtensions();
      }
      getAllModelExtensions(r2) {
        return this.head?.getAllModelExtensions(r2);
      }
      getAllQueryCallbacks(r2, t2) {
        return this.head?.getAllQueryCallbacks(r2, t2) ?? [];
      }
      getAllBatchQueryCallbacks() {
        return this.head?.getAllBatchQueryCallbacks() ?? [];
      }
    };
    var Fn = class {
      constructor(r2) {
        this.name = r2;
      }
    };
    function xa2(e2) {
      return e2 instanceof Fn;
    }
    function va2(e2) {
      return new Fn(e2);
    }
    var Pa2 = Symbol();
    var bt = class {
      constructor(r2) {
        if (r2 !== Pa2) throw new Error("Skip instance can not be constructed directly");
      }
      ifUndefined(r2) {
        return r2 === void 0 ? Mn : r2;
      }
    };
    var Mn = new bt(Pa2);
    function Se3(e2) {
      return e2 instanceof bt;
    }
    var zd = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" };
    var Ta2 = "explicitly `undefined` values are not allowed";
    function $n({ modelName: e2, action: r2, args: t2, runtimeDataModel: n2, extensions: i2 = Nr2.empty(), callsite: o2, clientMethod: s2, errorFormat: a2, clientVersion: l2, previewFeatures: u2, globalOmit: c2 }) {
      let p3 = new Xi({ runtimeDataModel: n2, modelName: e2, action: r2, rootArgs: t2, callsite: o2, extensions: i2, selectionPath: [], argumentPath: [], originalMethod: s2, errorFormat: a2, clientVersion: l2, previewFeatures: u2, globalOmit: c2 });
      return { modelName: e2, action: zd[r2], query: Et(t2, p3) };
    }
    function Et({ select: e2, include: r2, ...t2 } = {}, n2) {
      let i2 = t2.omit;
      return delete t2.omit, { arguments: Ra2(t2, n2), selection: Zd(e2, r2, i2, n2) };
    }
    function Zd(e2, r2, t2, n2) {
      return e2 ? (r2 ? n2.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n2.getSelectionPath() }) : t2 && n2.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n2.getSelectionPath() }), tm(e2, n2)) : Xd(n2, r2, t2);
    }
    function Xd(e2, r2, t2) {
      let n2 = {};
      return e2.modelOrType && !e2.isRawAction() && (n2.$composites = true, n2.$scalars = true), r2 && em(n2, r2, e2), rm(n2, t2, e2), n2;
    }
    function em(e2, r2, t2) {
      for (let [n2, i2] of Object.entries(r2)) {
        if (Se3(i2)) continue;
        let o2 = t2.nestSelection(n2);
        if (eo(i2, o2), i2 === false || i2 === void 0) {
          e2[n2] = false;
          continue;
        }
        let s2 = t2.findField(n2);
        if (s2 && s2.kind !== "object" && t2.throwValidationError({ kind: "IncludeOnScalar", selectionPath: t2.getSelectionPath().concat(n2), outputType: t2.getOutputTypeDescription() }), s2) {
          e2[n2] = Et(i2 === true ? {} : i2, o2);
          continue;
        }
        if (i2 === true) {
          e2[n2] = true;
          continue;
        }
        e2[n2] = Et(i2, o2);
      }
    }
    function rm(e2, r2, t2) {
      let n2 = t2.getComputedFields(), i2 = { ...t2.getGlobalOmit(), ...r2 }, o2 = wa2(i2, n2);
      for (let [s2, a2] of Object.entries(o2)) {
        if (Se3(a2)) continue;
        eo(a2, t2.nestSelection(s2));
        let l2 = t2.findField(s2);
        n2?.[s2] && !l2 || (e2[s2] = !a2);
      }
    }
    function tm(e2, r2) {
      let t2 = {}, n2 = r2.getComputedFields(), i2 = Ea2(e2, n2);
      for (let [o2, s2] of Object.entries(i2)) {
        if (Se3(s2)) continue;
        let a2 = r2.nestSelection(o2);
        eo(s2, a2);
        let l2 = r2.findField(o2);
        if (!(n2?.[o2] && !l2)) {
          if (s2 === false || s2 === void 0 || Se3(s2)) {
            t2[o2] = false;
            continue;
          }
          if (s2 === true) {
            l2?.kind === "object" ? t2[o2] = Et({}, a2) : t2[o2] = true;
            continue;
          }
          t2[o2] = Et(s2, a2);
        }
      }
      return t2;
    }
    function Sa2(e2, r2) {
      if (e2 === null) return null;
      if (typeof e2 == "string" || typeof e2 == "number" || typeof e2 == "boolean") return e2;
      if (typeof e2 == "bigint") return { $type: "BigInt", value: String(e2) };
      if (vr2(e2)) {
        if (mn(e2)) return { $type: "DateTime", value: e2.toISOString() };
        r2.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: r2.getSelectionPath(), argumentPath: r2.getArgumentPath(), argument: { name: r2.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
      }
      if (xa2(e2)) return { $type: "Param", value: e2.name };
      if (kr3(e2)) return { $type: "FieldRef", value: { _ref: e2.name, _container: e2.modelName } };
      if (Array.isArray(e2)) return nm(e2, r2);
      if (ArrayBuffer.isView(e2)) {
        let { buffer: t2, byteOffset: n2, byteLength: i2 } = e2;
        return { $type: "Bytes", value: Buffer.from(t2, n2, i2).toString("base64") };
      }
      if (im(e2)) return e2.values;
      if (Sr3(e2)) return { $type: "Decimal", value: e2.toFixed() };
      if (e2 instanceof Me3) {
        if (e2 !== On.instances[e2._getName()]) throw new Error("Invalid ObjectEnumValue");
        return { $type: "Enum", value: e2._getName() };
      }
      if (om(e2)) return e2.toJSON();
      if (typeof e2 == "object") return Ra2(e2, r2);
      r2.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: r2.getSelectionPath(), argumentPath: r2.getArgumentPath(), argument: { name: r2.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(e2)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` });
    }
    function Ra2(e2, r2) {
      if (e2.$type) return { $type: "Raw", value: e2 };
      let t2 = {};
      for (let n2 in e2) {
        let i2 = e2[n2], o2 = r2.nestArgument(n2);
        Se3(i2) || (i2 !== void 0 ? t2[n2] = Sa2(i2, o2) : r2.isPreviewFeatureOn("strictUndefinedChecks") && r2.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o2.getArgumentPath(), selectionPath: r2.getSelectionPath(), argument: { name: r2.getArgumentName(), typeNames: [] }, underlyingError: Ta2 }));
      }
      return t2;
    }
    function nm(e2, r2) {
      let t2 = [];
      for (let n2 = 0; n2 < e2.length; n2++) {
        let i2 = r2.nestArgument(String(n2)), o2 = e2[n2];
        if (o2 === void 0 || Se3(o2)) {
          let s2 = o2 === void 0 ? "undefined" : "Prisma.skip";
          r2.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i2.getSelectionPath(), argumentPath: i2.getArgumentPath(), argument: { name: `${r2.getArgumentName()}[${n2}]`, typeNames: [] }, underlyingError: `Can not use \`${s2}\` value within array. Use \`null\` or filter out \`${s2}\` values` });
        }
        t2.push(Sa2(o2, i2));
      }
      return t2;
    }
    function im(e2) {
      return typeof e2 == "object" && e2 !== null && e2.__prismaRawParameters__ === true;
    }
    function om(e2) {
      return typeof e2 == "object" && e2 !== null && typeof e2.toJSON == "function";
    }
    function eo(e2, r2) {
      e2 === void 0 && r2.isPreviewFeatureOn("strictUndefinedChecks") && r2.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: r2.getSelectionPath(), underlyingError: Ta2 });
    }
    var Xi = class e2 {
      constructor(r2) {
        this.params = r2;
        this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]);
      }
      modelOrType;
      throwValidationError(r2) {
        Nn({ errors: [r2], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit });
      }
      getSelectionPath() {
        return this.params.selectionPath;
      }
      getArgumentPath() {
        return this.params.argumentPath;
      }
      getArgumentName() {
        return this.params.argumentPath[this.params.argumentPath.length - 1];
      }
      getOutputTypeDescription() {
        if (!(!this.params.modelName || !this.modelOrType)) return { name: this.params.modelName, fields: this.modelOrType.fields.map((r2) => ({ name: r2.name, typeName: "boolean", isRelation: r2.kind === "object" })) };
      }
      isRawAction() {
        return ["executeRaw", "queryRaw", "runCommandRaw", "findRaw", "aggregateRaw"].includes(this.params.action);
      }
      isPreviewFeatureOn(r2) {
        return this.params.previewFeatures.includes(r2);
      }
      getComputedFields() {
        if (this.params.modelName) return this.params.extensions.getAllComputedFields(this.params.modelName);
      }
      findField(r2) {
        return this.modelOrType?.fields.find((t2) => t2.name === r2);
      }
      nestSelection(r2) {
        let t2 = this.findField(r2), n2 = t2?.kind === "object" ? t2.type : void 0;
        return new e2({ ...this.params, modelName: n2, selectionPath: this.params.selectionPath.concat(r2) });
      }
      getGlobalOmit() {
        return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[We3(this.params.modelName)] ?? {} : {};
      }
      shouldApplyGlobalOmit() {
        switch (this.params.action) {
          case "findFirst":
          case "findFirstOrThrow":
          case "findUniqueOrThrow":
          case "findMany":
          case "upsert":
          case "findUnique":
          case "createManyAndReturn":
          case "create":
          case "update":
          case "updateManyAndReturn":
          case "delete":
            return true;
          case "executeRaw":
          case "aggregateRaw":
          case "runCommandRaw":
          case "findRaw":
          case "createMany":
          case "deleteMany":
          case "groupBy":
          case "updateMany":
          case "count":
          case "aggregate":
          case "queryRaw":
            return false;
          default:
            ar3(this.params.action, "Unknown action");
        }
      }
      nestArgument(r2) {
        return new e2({ ...this.params, argumentPath: this.params.argumentPath.concat(r2) });
      }
    };
    function Aa2(e2) {
      if (!e2._hasPreviewFlag("metrics")) throw new Z3("`metrics` preview feature must be enabled in order to access metrics API", { clientVersion: e2._clientVersion });
    }
    var Lr2 = class {
      _client;
      constructor(r2) {
        this._client = r2;
      }
      prometheus(r2) {
        return Aa2(this._client), this._client._engine.metrics({ format: "prometheus", ...r2 });
      }
      json(r2) {
        return Aa2(this._client), this._client._engine.metrics({ format: "json", ...r2 });
      }
    };
    function Ca2(e2, r2) {
      let t2 = lt(() => sm(r2));
      Object.defineProperty(e2, "dmmf", { get: () => t2.get() });
    }
    function sm(e2) {
      return { datamodel: { models: ro(e2.models), enums: ro(e2.enums), types: ro(e2.types) } };
    }
    function ro(e2) {
      return Object.entries(e2).map(([r2, t2]) => ({ name: r2, ...t2 }));
    }
    var to = /* @__PURE__ */ new WeakMap();
    var qn = "$$PrismaTypedSql";
    var wt = class {
      constructor(r2, t2) {
        to.set(this, { sql: r2, values: t2 }), Object.defineProperty(this, qn, { value: qn });
      }
      get sql() {
        return to.get(this).sql;
      }
      get values() {
        return to.get(this).values;
      }
    };
    function Ia2(e2) {
      return (...r2) => new wt(e2, r2);
    }
    function Vn(e2) {
      return e2 != null && e2[qn] === qn;
    }
    var cu = O3(Ti());
    var pu = require("async_hooks");
    var du = require("events");
    var mu = O3(require("fs"));
    var ri = O3(require("path"));
    var ie3 = class e2 {
      constructor(r2, t2) {
        if (r2.length - 1 !== t2.length) throw r2.length === 0 ? new TypeError("Expected at least 1 string") : new TypeError(`Expected ${r2.length} strings to have ${r2.length - 1} values`);
        let n2 = t2.reduce((s2, a2) => s2 + (a2 instanceof e2 ? a2.values.length : 1), 0);
        this.values = new Array(n2), this.strings = new Array(n2 + 1), this.strings[0] = r2[0];
        let i2 = 0, o2 = 0;
        for (; i2 < t2.length; ) {
          let s2 = t2[i2++], a2 = r2[i2];
          if (s2 instanceof e2) {
            this.strings[o2] += s2.strings[0];
            let l2 = 0;
            for (; l2 < s2.values.length; ) this.values[o2++] = s2.values[l2++], this.strings[o2] = s2.strings[l2];
            this.strings[o2] += a2;
          } else this.values[o2++] = s2, this.strings[o2] = a2;
        }
      }
      get sql() {
        let r2 = this.strings.length, t2 = 1, n2 = this.strings[0];
        for (; t2 < r2; ) n2 += `?${this.strings[t2++]}`;
        return n2;
      }
      get statement() {
        let r2 = this.strings.length, t2 = 1, n2 = this.strings[0];
        for (; t2 < r2; ) n2 += `:${t2}${this.strings[t2++]}`;
        return n2;
      }
      get text() {
        let r2 = this.strings.length, t2 = 1, n2 = this.strings[0];
        for (; t2 < r2; ) n2 += `$${t2}${this.strings[t2++]}`;
        return n2;
      }
      inspect() {
        return { sql: this.sql, statement: this.statement, text: this.text, values: this.values };
      }
    };
    function Da2(e2, r2 = ",", t2 = "", n2 = "") {
      if (e2.length === 0) throw new TypeError("Expected `join([])` to be called with an array of multiple elements, but got an empty array");
      return new ie3([t2, ...Array(e2.length - 1).fill(r2), n2], e2);
    }
    function no(e2) {
      return new ie3([e2], []);
    }
    var Oa2 = no("");
    function io(e2, ...r2) {
      return new ie3(e2, r2);
    }
    function xt(e2) {
      return { getKeys() {
        return Object.keys(e2);
      }, getPropertyValue(r2) {
        return e2[r2];
      } };
    }
    function re3(e2, r2) {
      return { getKeys() {
        return [e2];
      }, getPropertyValue() {
        return r2();
      } };
    }
    function lr3(e2) {
      let r2 = new we3();
      return { getKeys() {
        return e2.getKeys();
      }, getPropertyValue(t2) {
        return r2.getOrCreate(t2, () => e2.getPropertyValue(t2));
      }, getPropertyDescriptor(t2) {
        return e2.getPropertyDescriptor?.(t2);
      } };
    }
    var jn = { enumerable: true, configurable: true, writable: true };
    function Bn(e2) {
      let r2 = new Set(e2);
      return { getPrototypeOf: () => Object.prototype, getOwnPropertyDescriptor: () => jn, has: (t2, n2) => r2.has(n2), set: (t2, n2, i2) => r2.add(n2) && Reflect.set(t2, n2, i2), ownKeys: () => [...r2] };
    }
    var ka2 = Symbol.for("nodejs.util.inspect.custom");
    function he3(e2, r2) {
      let t2 = am(r2), n2 = /* @__PURE__ */ new Set(), i2 = new Proxy(e2, { get(o2, s2) {
        if (n2.has(s2)) return o2[s2];
        let a2 = t2.get(s2);
        return a2 ? a2.getPropertyValue(s2) : o2[s2];
      }, has(o2, s2) {
        if (n2.has(s2)) return true;
        let a2 = t2.get(s2);
        return a2 ? a2.has?.(s2) ?? true : Reflect.has(o2, s2);
      }, ownKeys(o2) {
        let s2 = _a2(Reflect.ownKeys(o2), t2), a2 = _a2(Array.from(t2.keys()), t2);
        return [.../* @__PURE__ */ new Set([...s2, ...a2, ...n2])];
      }, set(o2, s2, a2) {
        return t2.get(s2)?.getPropertyDescriptor?.(s2)?.writable === false ? false : (n2.add(s2), Reflect.set(o2, s2, a2));
      }, getOwnPropertyDescriptor(o2, s2) {
        let a2 = Reflect.getOwnPropertyDescriptor(o2, s2);
        if (a2 && !a2.configurable) return a2;
        let l2 = t2.get(s2);
        return l2 ? l2.getPropertyDescriptor ? { ...jn, ...l2?.getPropertyDescriptor(s2) } : jn : a2;
      }, defineProperty(o2, s2, a2) {
        return n2.add(s2), Reflect.defineProperty(o2, s2, a2);
      }, getPrototypeOf: () => Object.prototype });
      return i2[ka2] = function() {
        let o2 = { ...this };
        return delete o2[ka2], o2;
      }, i2;
    }
    function am(e2) {
      let r2 = /* @__PURE__ */ new Map();
      for (let t2 of e2) {
        let n2 = t2.getKeys();
        for (let i2 of n2) r2.set(i2, t2);
      }
      return r2;
    }
    function _a2(e2, r2) {
      return e2.filter((t2) => r2.get(t2)?.has?.(t2) ?? true);
    }
    function Fr2(e2) {
      return { getKeys() {
        return e2;
      }, has() {
        return false;
      }, getPropertyValue() {
      } };
    }
    function Mr2(e2, r2) {
      return { batch: e2, transaction: r2?.kind === "batch" ? { isolationLevel: r2.options.isolationLevel } : void 0 };
    }
    function Na2(e2) {
      if (e2 === void 0) return "";
      let r2 = _r2(e2);
      return new Ar2(0, { colors: Cn }).write(r2).toString();
    }
    var lm = "P2037";
    function $r2({ error: e2, user_facing_error: r2 }, t2, n2) {
      return r2.error_code ? new z3(um(r2, n2), { code: r2.error_code, clientVersion: t2, meta: r2.meta, batchRequestIdx: r2.batch_request_idx }) : new V3(e2, { clientVersion: t2, batchRequestIdx: r2.batch_request_idx });
    }
    function um(e2, r2) {
      let t2 = e2.message;
      return (r2 === "postgresql" || r2 === "postgres" || r2 === "mysql") && e2.error_code === lm && (t2 += `
Prisma Accelerate has built-in connection pooling to prevent such errors: https://pris.ly/client/error-accelerate`), t2;
    }
    var vt = "<unknown>";
    function La2(e2) {
      var r2 = e2.split(`
`);
      return r2.reduce(function(t2, n2) {
        var i2 = dm(n2) || fm(n2) || ym(n2) || xm(n2) || Em(n2);
        return i2 && t2.push(i2), t2;
      }, []);
    }
    var cm = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|rsc|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    var pm = /\((\S*)(?::(\d+))(?::(\d+))\)/;
    function dm(e2) {
      var r2 = cm.exec(e2);
      if (!r2) return null;
      var t2 = r2[2] && r2[2].indexOf("native") === 0, n2 = r2[2] && r2[2].indexOf("eval") === 0, i2 = pm.exec(r2[2]);
      return n2 && i2 != null && (r2[2] = i2[1], r2[3] = i2[2], r2[4] = i2[3]), { file: t2 ? null : r2[2], methodName: r2[1] || vt, arguments: t2 ? [r2[2]] : [], lineNumber: r2[3] ? +r2[3] : null, column: r2[4] ? +r2[4] : null };
    }
    var mm = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|rsc|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    function fm(e2) {
      var r2 = mm.exec(e2);
      return r2 ? { file: r2[2], methodName: r2[1] || vt, arguments: [], lineNumber: +r2[3], column: r2[4] ? +r2[4] : null } : null;
    }
    var gm = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|rsc|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
    var hm = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
    function ym(e2) {
      var r2 = gm.exec(e2);
      if (!r2) return null;
      var t2 = r2[3] && r2[3].indexOf(" > eval") > -1, n2 = hm.exec(r2[3]);
      return t2 && n2 != null && (r2[3] = n2[1], r2[4] = n2[2], r2[5] = null), { file: r2[3], methodName: r2[1] || vt, arguments: r2[2] ? r2[2].split(",") : [], lineNumber: r2[4] ? +r2[4] : null, column: r2[5] ? +r2[5] : null };
    }
    var bm = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
    function Em(e2) {
      var r2 = bm.exec(e2);
      return r2 ? { file: r2[3], methodName: r2[1] || vt, arguments: [], lineNumber: +r2[4], column: r2[5] ? +r2[5] : null } : null;
    }
    var wm = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    function xm(e2) {
      var r2 = wm.exec(e2);
      return r2 ? { file: r2[2], methodName: r2[1] || vt, arguments: [], lineNumber: +r2[3], column: r2[4] ? +r2[4] : null } : null;
    }
    var oo = class {
      getLocation() {
        return null;
      }
    };
    var so = class {
      _error;
      constructor() {
        this._error = new Error();
      }
      getLocation() {
        let r2 = this._error.stack;
        if (!r2) return null;
        let n2 = La2(r2).find((i2) => {
          if (!i2.file) return false;
          let o2 = Li(i2.file);
          return o2 !== "<anonymous>" && !o2.includes("@prisma") && !o2.includes("/packages/client/src/runtime/") && !o2.endsWith("/runtime/binary.js") && !o2.endsWith("/runtime/library.js") && !o2.endsWith("/runtime/edge.js") && !o2.endsWith("/runtime/edge-esm.js") && !o2.startsWith("internal/") && !i2.methodName.includes("new ") && !i2.methodName.includes("getCallSite") && !i2.methodName.includes("Proxy.") && i2.methodName.split(".").length < 4;
        });
        return !n2 || !n2.file ? null : { fileName: n2.file, lineNumber: n2.lineNumber, columnNumber: n2.column };
      }
    };
    function Ze3(e2) {
      return e2 === "minimal" ? typeof $EnabledCallSite == "function" && e2 !== "minimal" ? new $EnabledCallSite() : new oo() : new so();
    }
    var Fa2 = { _avg: true, _count: true, _sum: true, _min: true, _max: true };
    function qr2(e2 = {}) {
      let r2 = Pm(e2);
      return Object.entries(r2).reduce((n2, [i2, o2]) => (Fa2[i2] !== void 0 ? n2.select[i2] = { select: o2 } : n2[i2] = o2, n2), { select: {} });
    }
    function Pm(e2 = {}) {
      return typeof e2._count == "boolean" ? { ...e2, _count: { _all: e2._count } } : e2;
    }
    function Un(e2 = {}) {
      return (r2) => (typeof e2._count == "boolean" && (r2._count = r2._count._all), r2);
    }
    function Ma2(e2, r2) {
      let t2 = Un(e2);
      return r2({ action: "aggregate", unpacker: t2, argsMapper: qr2 })(e2);
    }
    function Tm(e2 = {}) {
      let { select: r2, ...t2 } = e2;
      return typeof r2 == "object" ? qr2({ ...t2, _count: r2 }) : qr2({ ...t2, _count: { _all: true } });
    }
    function Sm(e2 = {}) {
      return typeof e2.select == "object" ? (r2) => Un(e2)(r2)._count : (r2) => Un(e2)(r2)._count._all;
    }
    function $a2(e2, r2) {
      return r2({ action: "count", unpacker: Sm(e2), argsMapper: Tm })(e2);
    }
    function Rm(e2 = {}) {
      let r2 = qr2(e2);
      if (Array.isArray(r2.by)) for (let t2 of r2.by) typeof t2 == "string" && (r2.select[t2] = true);
      else typeof r2.by == "string" && (r2.select[r2.by] = true);
      return r2;
    }
    function Am(e2 = {}) {
      return (r2) => (typeof e2?._count == "boolean" && r2.forEach((t2) => {
        t2._count = t2._count._all;
      }), r2);
    }
    function qa2(e2, r2) {
      return r2({ action: "groupBy", unpacker: Am(e2), argsMapper: Rm })(e2);
    }
    function Va2(e2, r2, t2) {
      if (r2 === "aggregate") return (n2) => Ma2(n2, t2);
      if (r2 === "count") return (n2) => $a2(n2, t2);
      if (r2 === "groupBy") return (n2) => qa2(n2, t2);
    }
    function ja2(e2, r2) {
      let t2 = r2.fields.filter((i2) => !i2.relationName), n2 = _s(t2, "name");
      return new Proxy({}, { get(i2, o2) {
        if (o2 in i2 || typeof o2 == "symbol") return i2[o2];
        let s2 = n2[o2];
        if (s2) return new mt(e2, o2, s2.type, s2.isList, s2.kind === "enum");
      }, ...Bn(Object.keys(n2)) });
    }
    var Ba2 = (e2) => Array.isArray(e2) ? e2 : e2.split(".");
    var ao = (e2, r2) => Ba2(r2).reduce((t2, n2) => t2 && t2[n2], e2);
    var Ua2 = (e2, r2, t2) => Ba2(r2).reduceRight((n2, i2, o2, s2) => Object.assign({}, ao(e2, s2.slice(0, o2)), { [i2]: n2 }), t2);
    function Cm(e2, r2) {
      return e2 === void 0 || r2 === void 0 ? [] : [...r2, "select", e2];
    }
    function Im(e2, r2, t2) {
      return r2 === void 0 ? e2 ?? {} : Ua2(r2, t2, e2 || true);
    }
    function lo(e2, r2, t2, n2, i2, o2) {
      let a2 = e2._runtimeDataModel.models[r2].fields.reduce((l2, u2) => ({ ...l2, [u2.name]: u2 }), {});
      return (l2) => {
        let u2 = Ze3(e2._errorFormat), c2 = Cm(n2, i2), p3 = Im(l2, o2, c2), d2 = t2({ dataPath: c2, callsite: u2 })(p3), f3 = Dm(e2, r2);
        return new Proxy(d2, { get(h2, g2) {
          if (!f3.includes(g2)) return h2[g2];
          let T3 = [a2[g2].type, t2, g2], S3 = [c2, p3];
          return lo(e2, ...T3, ...S3);
        }, ...Bn([...f3, ...Object.getOwnPropertyNames(d2)]) });
      };
    }
    function Dm(e2, r2) {
      return e2._runtimeDataModel.models[r2].fields.filter((t2) => t2.kind === "object").map((t2) => t2.name);
    }
    var Om = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"];
    var km = ["aggregate", "count", "groupBy"];
    function uo(e2, r2) {
      let t2 = e2._extensions.getAllModelExtensions(r2) ?? {}, n2 = [_m(e2, r2), Lm(e2, r2), xt(t2), re3("name", () => r2), re3("$name", () => r2), re3("$parent", () => e2._appliedParent)];
      return he3({}, n2);
    }
    function _m(e2, r2) {
      let t2 = Te2(r2), n2 = Object.keys(Rr2).concat("count");
      return { getKeys() {
        return n2;
      }, getPropertyValue(i2) {
        let o2 = i2, s2 = (a2) => (l2) => {
          let u2 = Ze3(e2._errorFormat);
          return e2._createPrismaPromise((c2) => {
            let p3 = { args: l2, dataPath: [], action: o2, model: r2, clientMethod: `${t2}.${i2}`, jsModelName: t2, transaction: c2, callsite: u2 };
            return e2._request({ ...p3, ...a2 });
          }, { action: o2, args: l2, model: r2 });
        };
        return Om.includes(o2) ? lo(e2, r2, s2) : Nm(i2) ? Va2(e2, i2, s2) : s2({});
      } };
    }
    function Nm(e2) {
      return km.includes(e2);
    }
    function Lm(e2, r2) {
      return lr3(re3("fields", () => {
        let t2 = e2._runtimeDataModel.models[r2];
        return ja2(r2, t2);
      }));
    }
    function Ga2(e2) {
      return e2.replace(/^./, (r2) => r2.toUpperCase());
    }
    var co = Symbol();
    function Pt(e2) {
      let r2 = [Fm(e2), Mm(e2), re3(co, () => e2), re3("$parent", () => e2._appliedParent)], t2 = e2._extensions.getAllClientExtensions();
      return t2 && r2.push(xt(t2)), he3(e2, r2);
    }
    function Fm(e2) {
      let r2 = Object.getPrototypeOf(e2._originalClient), t2 = [...new Set(Object.getOwnPropertyNames(r2))];
      return { getKeys() {
        return t2;
      }, getPropertyValue(n2) {
        return e2[n2];
      } };
    }
    function Mm(e2) {
      let r2 = Object.keys(e2._runtimeDataModel.models), t2 = r2.map(Te2), n2 = [...new Set(r2.concat(t2))];
      return lr3({ getKeys() {
        return n2;
      }, getPropertyValue(i2) {
        let o2 = Ga2(i2);
        if (e2._runtimeDataModel.models[o2] !== void 0) return uo(e2, o2);
        if (e2._runtimeDataModel.models[i2] !== void 0) return uo(e2, i2);
      }, getPropertyDescriptor(i2) {
        if (!t2.includes(i2)) return { enumerable: false };
      } });
    }
    function Qa2(e2) {
      return e2[co] ? e2[co] : e2;
    }
    function Wa2(e2) {
      if (typeof e2 == "function") return e2(this);
      if (e2.client?.__AccelerateEngine) {
        let t2 = e2.client.__AccelerateEngine;
        this._originalClient._engine = new t2(this._originalClient._accelerateEngineConfig);
      }
      let r2 = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(e2) }, _appliedParent: { value: this, configurable: true }, $on: { value: void 0 } });
      return Pt(r2);
    }
    function Ja2({ result: e2, modelName: r2, select: t2, omit: n2, extensions: i2 }) {
      let o2 = i2.getAllComputedFields(r2);
      if (!o2) return e2;
      let s2 = [], a2 = [];
      for (let l2 of Object.values(o2)) {
        if (n2) {
          if (n2[l2.name]) continue;
          let u2 = l2.needs.filter((c2) => n2[c2]);
          u2.length > 0 && a2.push(Fr2(u2));
        } else if (t2) {
          if (!t2[l2.name]) continue;
          let u2 = l2.needs.filter((c2) => !t2[c2]);
          u2.length > 0 && a2.push(Fr2(u2));
        }
        $m(e2, l2.needs) && s2.push(qm(l2, he3(e2, s2)));
      }
      return s2.length > 0 || a2.length > 0 ? he3(e2, [...s2, ...a2]) : e2;
    }
    function $m(e2, r2) {
      return r2.every((t2) => Vi(e2, t2));
    }
    function qm(e2, r2) {
      return lr3(re3(e2.name, () => e2.compute(r2)));
    }
    function Gn({ visitor: e2, result: r2, args: t2, runtimeDataModel: n2, modelName: i2 }) {
      if (Array.isArray(r2)) {
        for (let s2 = 0; s2 < r2.length; s2++) r2[s2] = Gn({ result: r2[s2], args: t2, modelName: i2, runtimeDataModel: n2, visitor: e2 });
        return r2;
      }
      let o2 = e2(r2, i2, t2) ?? r2;
      return t2.include && Ka2({ includeOrSelect: t2.include, result: o2, parentModelName: i2, runtimeDataModel: n2, visitor: e2 }), t2.select && Ka2({ includeOrSelect: t2.select, result: o2, parentModelName: i2, runtimeDataModel: n2, visitor: e2 }), o2;
    }
    function Ka2({ includeOrSelect: e2, result: r2, parentModelName: t2, runtimeDataModel: n2, visitor: i2 }) {
      for (let [o2, s2] of Object.entries(e2)) {
        if (!s2 || r2[o2] == null || Se3(s2)) continue;
        let l2 = n2.models[t2].fields.find((c2) => c2.name === o2);
        if (!l2 || l2.kind !== "object" || !l2.relationName) continue;
        let u2 = typeof s2 == "object" ? s2 : {};
        r2[o2] = Gn({ visitor: i2, result: r2[o2], args: u2, modelName: l2.type, runtimeDataModel: n2 });
      }
    }
    function Ha2({ result: e2, modelName: r2, args: t2, extensions: n2, runtimeDataModel: i2, globalOmit: o2 }) {
      return n2.isEmpty() || e2 == null || typeof e2 != "object" || !i2.models[r2] ? e2 : Gn({ result: e2, args: t2 ?? {}, modelName: r2, runtimeDataModel: i2, visitor: (a2, l2, u2) => {
        let c2 = Te2(l2);
        return Ja2({ result: a2, modelName: c2, select: u2.select, omit: u2.select ? void 0 : { ...o2?.[c2], ...u2.omit }, extensions: n2 });
      } });
    }
    var Vm = ["$connect", "$disconnect", "$on", "$transaction", "$extends"];
    var Ya2 = Vm;
    function za2(e2) {
      if (e2 instanceof ie3) return jm(e2);
      if (Vn(e2)) return Bm(e2);
      if (Array.isArray(e2)) {
        let t2 = [e2[0]];
        for (let n2 = 1; n2 < e2.length; n2++) t2[n2] = Tt(e2[n2]);
        return t2;
      }
      let r2 = {};
      for (let t2 in e2) r2[t2] = Tt(e2[t2]);
      return r2;
    }
    function jm(e2) {
      return new ie3(e2.strings, e2.values);
    }
    function Bm(e2) {
      return new wt(e2.sql, e2.values);
    }
    function Tt(e2) {
      if (typeof e2 != "object" || e2 == null || e2 instanceof Me3 || kr3(e2)) return e2;
      if (Sr3(e2)) return new Fe3(e2.toFixed());
      if (vr2(e2)) return /* @__PURE__ */ new Date(+e2);
      if (ArrayBuffer.isView(e2)) return e2.slice(0);
      if (Array.isArray(e2)) {
        let r2 = e2.length, t2;
        for (t2 = Array(r2); r2--; ) t2[r2] = Tt(e2[r2]);
        return t2;
      }
      if (typeof e2 == "object") {
        let r2 = {};
        for (let t2 in e2) t2 === "__proto__" ? Object.defineProperty(r2, t2, { value: Tt(e2[t2]), configurable: true, enumerable: true, writable: true }) : r2[t2] = Tt(e2[t2]);
        return r2;
      }
      ar3(e2, "Unknown value");
    }
    function Xa2(e2, r2, t2, n2 = 0) {
      return e2._createPrismaPromise((i2) => {
        let o2 = r2.customDataProxyFetch;
        return "transaction" in r2 && i2 !== void 0 && (r2.transaction?.kind === "batch" && r2.transaction.lock.then(), r2.transaction = i2), n2 === t2.length ? e2._executeRequest(r2) : t2[n2]({ model: r2.model, operation: r2.model ? r2.action : r2.clientMethod, args: za2(r2.args ?? {}), __internalParams: r2, query: (s2, a2 = r2) => {
          let l2 = a2.customDataProxyFetch;
          return a2.customDataProxyFetch = nl(o2, l2), a2.args = s2, Xa2(e2, a2, t2, n2 + 1);
        } });
      });
    }
    function el(e2, r2) {
      let { jsModelName: t2, action: n2, clientMethod: i2 } = r2, o2 = t2 ? n2 : i2;
      if (e2._extensions.isEmpty()) return e2._executeRequest(r2);
      let s2 = e2._extensions.getAllQueryCallbacks(t2 ?? "$none", o2);
      return Xa2(e2, r2, s2);
    }
    function rl(e2) {
      return (r2) => {
        let t2 = { requests: r2 }, n2 = r2[0].extensions.getAllBatchQueryCallbacks();
        return n2.length ? tl(t2, n2, 0, e2) : e2(t2);
      };
    }
    function tl(e2, r2, t2, n2) {
      if (t2 === r2.length) return n2(e2);
      let i2 = e2.customDataProxyFetch, o2 = e2.requests[0].transaction;
      return r2[t2]({ args: { queries: e2.requests.map((s2) => ({ model: s2.modelName, operation: s2.action, args: s2.args })), transaction: o2 ? { isolationLevel: o2.kind === "batch" ? o2.isolationLevel : void 0 } : void 0 }, __internalParams: e2, query(s2, a2 = e2) {
        let l2 = a2.customDataProxyFetch;
        return a2.customDataProxyFetch = nl(i2, l2), tl(a2, r2, t2 + 1, n2);
      } });
    }
    var Za2 = (e2) => e2;
    function nl(e2 = Za2, r2 = Za2) {
      return (t2) => e2(r2(t2));
    }
    var il = N3("prisma:client");
    var ol = { Vercel: "vercel", "Netlify CI": "netlify" };
    function sl({ postinstall: e2, ciName: r2, clientVersion: t2, generator: n2 }) {
      if (il("checkPlatformCaching:postinstall", e2), il("checkPlatformCaching:ciName", r2), e2 === true && !(n2?.output && typeof (n2.output.fromEnvVar ?? n2.output.value) == "string") && r2 && r2 in ol) {
        let i2 = `Prisma has detected that this project was built on ${r2}, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the \`prisma generate\` command during the build process.

Learn how: https://pris.ly/d/${ol[r2]}-build`;
        throw console.error(i2), new P3(i2, t2);
      }
    }
    function al(e2, r2) {
      return e2 ? e2.datasources ? e2.datasources : e2.datasourceUrl ? { [r2[0]]: { url: e2.datasourceUrl } } : {} : {};
    }
    var dl = O3(require("fs"));
    var St = O3(require("path"));
    function Qn(e2) {
      let { runtimeBinaryTarget: r2 } = e2;
      return `Add "${r2}" to \`binaryTargets\` in the "schema.prisma" file and run \`prisma generate\` after saving it:

${Um(e2)}`;
    }
    function Um(e2) {
      let { generator: r2, generatorBinaryTargets: t2, runtimeBinaryTarget: n2 } = e2, i2 = { fromEnvVar: null, value: n2 }, o2 = [...t2, i2];
      return ki({ ...r2, binaryTargets: o2 });
    }
    function Xe3(e2) {
      let { runtimeBinaryTarget: r2 } = e2;
      return `Prisma Client could not locate the Query Engine for runtime "${r2}".`;
    }
    function er3(e2) {
      let { searchedLocations: r2 } = e2;
      return `The following locations have been searched:
${[...new Set(r2)].map((i2) => `  ${i2}`).join(`
`)}`;
    }
    function ll(e2) {
      let { runtimeBinaryTarget: r2 } = e2;
      return `${Xe3(e2)}

This happened because \`binaryTargets\` have been pinned, but the actual deployment also required "${r2}".
${Qn(e2)}

${er3(e2)}`;
    }
    function Wn(e2) {
      return `We would appreciate if you could take the time to share some information with us.
Please help us by answering a few questions: https://pris.ly/${e2}`;
    }
    function Jn(e2) {
      let { errorStack: r2 } = e2;
      return r2?.match(/\/\.next|\/next@|\/next\//) ? `

We detected that you are using Next.js, learn how to fix this: https://pris.ly/d/engine-not-found-nextjs.` : "";
    }
    function ul(e2) {
      let { queryEngineName: r2 } = e2;
      return `${Xe3(e2)}${Jn(e2)}

This is likely caused by a bundler that has not copied "${r2}" next to the resulting bundle.
Ensure that "${r2}" has been copied next to the bundle or in "${e2.expectedLocation}".

${Wn("engine-not-found-bundler-investigation")}

${er3(e2)}`;
    }
    function cl(e2) {
      let { runtimeBinaryTarget: r2, generatorBinaryTargets: t2 } = e2, n2 = t2.find((i2) => i2.native);
      return `${Xe3(e2)}

This happened because Prisma Client was generated for "${n2?.value ?? "unknown"}", but the actual deployment required "${r2}".
${Qn(e2)}

${er3(e2)}`;
    }
    function pl(e2) {
      let { queryEngineName: r2 } = e2;
      return `${Xe3(e2)}${Jn(e2)}

This is likely caused by tooling that has not copied "${r2}" to the deployment folder.
Ensure that you ran \`prisma generate\` and that "${r2}" has been copied to "${e2.expectedLocation}".

${Wn("engine-not-found-tooling-investigation")}

${er3(e2)}`;
    }
    var Gm = N3("prisma:client:engines:resolveEnginePath");
    var Qm = () => new RegExp("runtime[\\\\/]library\\.m?js$");
    async function ml(e2, r2) {
      let t2 = { binary: process.env.PRISMA_QUERY_ENGINE_BINARY, library: process.env.PRISMA_QUERY_ENGINE_LIBRARY }[e2] ?? r2.prismaPath;
      if (t2 !== void 0) return t2;
      let { enginePath: n2, searchedLocations: i2 } = await Wm(e2, r2);
      if (Gm("enginePath", n2), n2 !== void 0 && e2 === "binary" && Ri(n2), n2 !== void 0) return r2.prismaPath = n2;
      let o2 = await ir3(), s2 = r2.generator?.binaryTargets ?? [], a2 = s2.some((d2) => d2.native), l2 = !s2.some((d2) => d2.value === o2), u2 = __filename.match(Qm()) === null, c2 = { searchedLocations: i2, generatorBinaryTargets: s2, generator: r2.generator, runtimeBinaryTarget: o2, queryEngineName: fl(e2, o2), expectedLocation: St.default.relative(process.cwd(), r2.dirname), errorStack: new Error().stack }, p3;
      throw a2 && l2 ? p3 = cl(c2) : l2 ? p3 = ll(c2) : u2 ? p3 = ul(c2) : p3 = pl(c2), new P3(p3, r2.clientVersion);
    }
    async function Wm(e2, r2) {
      let t2 = await ir3(), n2 = [], i2 = [r2.dirname, St.default.resolve(__dirname, ".."), r2.generator?.output?.value ?? __dirname, St.default.resolve(__dirname, "../../../.prisma/client"), "/tmp/prisma-engines", r2.cwd];
      __filename.includes("resolveEnginePath") && i2.push(ms());
      for (let o2 of i2) {
        let s2 = fl(e2, t2), a2 = St.default.join(o2, s2);
        if (n2.push(o2), dl.default.existsSync(a2)) return { enginePath: a2, searchedLocations: n2 };
      }
      return { enginePath: void 0, searchedLocations: n2 };
    }
    function fl(e2, r2) {
      return e2 === "library" ? Gt(r2, "fs") : `query-engine-${r2}${r2 === "windows" ? ".exe" : ""}`;
    }
    function gl(e2) {
      return e2 ? e2.replace(/".*"/g, '"X"').replace(/[\s:\[]([+-]?([0-9]*[.])?[0-9]+)/g, (r2) => `${r2[0]}5`) : "";
    }
    function hl(e2) {
      return e2.split(`
`).map((r2) => r2.replace(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\s*/, "").replace(/\+\d+\s*ms$/, "")).join(`
`);
    }
    var yl = O3(Os());
    function bl({ title: e2, user: r2 = "prisma", repo: t2 = "prisma", template: n2 = "bug_report.yml", body: i2 }) {
      return (0, yl.default)({ user: r2, repo: t2, template: n2, title: e2, body: i2 });
    }
    function El({ version: e2, binaryTarget: r2, title: t2, description: n2, engineVersion: i2, database: o2, query: s2 }) {
      let a2 = Bo(6e3 - (s2?.length ?? 0)), l2 = hl(wr2(a2)), u2 = n2 ? `# Description
\`\`\`
${n2}
\`\`\`` : "", c2 = wr2(`Hi Prisma Team! My Prisma Client just crashed. This is the report:
## Versions

| Name            | Version            |
|-----------------|--------------------|
| Node            | ${process.version?.padEnd(19)}| 
| OS              | ${r2?.padEnd(19)}|
| Prisma Client   | ${e2?.padEnd(19)}|
| Query Engine    | ${i2?.padEnd(19)}|
| Database        | ${o2?.padEnd(19)}|

${u2}

## Logs
\`\`\`
${l2}
\`\`\`

## Client Snippet
\`\`\`ts
// PLEASE FILL YOUR CODE SNIPPET HERE
\`\`\`

## Schema
\`\`\`prisma
// PLEASE ADD YOUR SCHEMA HERE IF POSSIBLE
\`\`\`

## Prisma Engine Query
\`\`\`
${s2 ? gl(s2) : ""}
\`\`\`
`), p3 = bl({ title: t2, body: c2 });
      return `${t2}

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

${Y3(p3)}

If you want the Prisma team to look into it, please open the link above \u{1F64F}
To increase the chance of success, please post your schema and a snippet of
how you used Prisma Client in the issue. 
`;
    }
    function wl(e2, r2) {
      throw new Error(r2);
    }
    function Jm(e2) {
      return e2 !== null && typeof e2 == "object" && typeof e2.$type == "string";
    }
    function Km(e2, r2) {
      let t2 = {};
      for (let n2 of Object.keys(e2)) t2[n2] = r2(e2[n2], n2);
      return t2;
    }
    function Vr2(e2) {
      return e2 === null ? e2 : Array.isArray(e2) ? e2.map(Vr2) : typeof e2 == "object" ? Jm(e2) ? Hm(e2) : e2.constructor !== null && e2.constructor.name !== "Object" ? e2 : Km(e2, Vr2) : e2;
    }
    function Hm({ $type: e2, value: r2 }) {
      switch (e2) {
        case "BigInt":
          return BigInt(r2);
        case "Bytes": {
          let { buffer: t2, byteOffset: n2, byteLength: i2 } = Buffer.from(r2, "base64");
          return new Uint8Array(t2, n2, i2);
        }
        case "DateTime":
          return new Date(r2);
        case "Decimal":
          return new Le3(r2);
        case "Json":
          return JSON.parse(r2);
        default:
          wl(r2, "Unknown tagged value");
      }
    }
    var xl = "6.18.0";
    var zm = () => globalThis.process?.release?.name === "node";
    var Zm = () => !!globalThis.Bun || !!globalThis.process?.versions?.bun;
    var Xm = () => !!globalThis.Deno;
    var ef = () => typeof globalThis.Netlify == "object";
    var rf = () => typeof globalThis.EdgeRuntime == "object";
    var tf = () => globalThis.navigator?.userAgent === "Cloudflare-Workers";
    function nf() {
      return [[ef, "netlify"], [rf, "edge-light"], [tf, "workerd"], [Xm, "deno"], [Zm, "bun"], [zm, "node"]].flatMap((t2) => t2[0]() ? [t2[1]] : []).at(0) ?? "";
    }
    var of = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
    function Kn() {
      let e2 = nf();
      return { id: e2, prettyName: of[e2] || e2, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(e2) };
    }
    function jr2({ inlineDatasources: e2, overrideDatasources: r2, env: t2, clientVersion: n2 }) {
      let i2, o2 = Object.keys(e2)[0], s2 = e2[o2]?.url, a2 = r2[o2]?.url;
      if (o2 === void 0 ? i2 = void 0 : a2 ? i2 = a2 : s2?.value ? i2 = s2.value : s2?.fromEnvVar && (i2 = t2[s2.fromEnvVar]), s2?.fromEnvVar !== void 0 && i2 === void 0) throw new P3(`error: Environment variable not found: ${s2.fromEnvVar}.`, n2);
      if (i2 === void 0) throw new P3("error: Missing URL environment variable, value, or override.", n2);
      return i2;
    }
    var Hn = class extends Error {
      clientVersion;
      cause;
      constructor(r2, t2) {
        super(r2), this.clientVersion = t2.clientVersion, this.cause = t2.cause;
      }
      get [Symbol.toStringTag]() {
        return this.name;
      }
    };
    var oe3 = class extends Hn {
      isRetryable;
      constructor(r2, t2) {
        super(r2, t2), this.isRetryable = t2.isRetryable ?? true;
      }
    };
    function R3(e2, r2) {
      return { ...e2, isRetryable: r2 };
    }
    var ur3 = class extends oe3 {
      name = "InvalidDatasourceError";
      code = "P6001";
      constructor(r2, t2) {
        super(r2, R3(t2, false));
      }
    };
    x3(ur3, "InvalidDatasourceError");
    function vl(e2) {
      let r2 = { clientVersion: e2.clientVersion }, t2 = Object.keys(e2.inlineDatasources)[0], n2 = jr2({ inlineDatasources: e2.inlineDatasources, overrideDatasources: e2.overrideDatasources, clientVersion: e2.clientVersion, env: { ...e2.env, ...typeof process < "u" ? process.env : {} } }), i2;
      try {
        i2 = new URL(n2);
      } catch {
        throw new ur3(`Error validating datasource \`${t2}\`: the URL must start with the protocol \`prisma://\``, r2);
      }
      let { protocol: o2, searchParams: s2 } = i2;
      if (o2 !== "prisma:" && o2 !== sn) throw new ur3(`Error validating datasource \`${t2}\`: the URL must start with the protocol \`prisma://\` or \`prisma+postgres://\``, r2);
      let a2 = s2.get("api_key");
      if (a2 === null || a2.length < 1) throw new ur3(`Error validating datasource \`${t2}\`: the URL must contain a valid API key`, r2);
      let l2 = Ii(i2) ? "http:" : "https:";
      process.env.TEST_CLIENT_ENGINE_REMOTE_EXECUTOR && i2.searchParams.has("use_http") && (l2 = "http:");
      let u2 = new URL(i2.href.replace(o2, l2));
      return { apiKey: a2, url: u2 };
    }
    var Pl = O3(on());
    var Yn = class {
      apiKey;
      tracingHelper;
      logLevel;
      logQueries;
      engineHash;
      constructor({ apiKey: r2, tracingHelper: t2, logLevel: n2, logQueries: i2, engineHash: o2 }) {
        this.apiKey = r2, this.tracingHelper = t2, this.logLevel = n2, this.logQueries = i2, this.engineHash = o2;
      }
      build({ traceparent: r2, transactionId: t2 } = {}) {
        let n2 = { Accept: "application/json", Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", "Prisma-Engine-Hash": this.engineHash, "Prisma-Engine-Version": Pl.enginesVersion };
        this.tracingHelper.isEnabled() && (n2.traceparent = r2 ?? this.tracingHelper.getTraceParent()), t2 && (n2["X-Transaction-Id"] = t2);
        let i2 = this.#e();
        return i2.length > 0 && (n2["X-Capture-Telemetry"] = i2.join(", ")), n2;
      }
      #e() {
        let r2 = [];
        return this.tracingHelper.isEnabled() && r2.push("tracing"), this.logLevel && r2.push(this.logLevel), this.logQueries && r2.push("query"), r2;
      }
    };
    function sf(e2) {
      return e2[0] * 1e3 + e2[1] / 1e6;
    }
    function po(e2) {
      return new Date(sf(e2));
    }
    var Br2 = class extends oe3 {
      name = "ForcedRetryError";
      code = "P5001";
      constructor(r2) {
        super("This request must be retried", R3(r2, true));
      }
    };
    x3(Br2, "ForcedRetryError");
    var cr3 = class extends oe3 {
      name = "NotImplementedYetError";
      code = "P5004";
      constructor(r2, t2) {
        super(r2, R3(t2, false));
      }
    };
    x3(cr3, "NotImplementedYetError");
    var $2 = class extends oe3 {
      response;
      constructor(r2, t2) {
        super(r2, t2), this.response = t2.response;
        let n2 = this.response.headers.get("prisma-request-id");
        if (n2) {
          let i2 = `(The request id was: ${n2})`;
          this.message = this.message + " " + i2;
        }
      }
    };
    var pr3 = class extends $2 {
      name = "SchemaMissingError";
      code = "P5005";
      constructor(r2) {
        super("Schema needs to be uploaded", R3(r2, true));
      }
    };
    x3(pr3, "SchemaMissingError");
    var mo = "This request could not be understood by the server";
    var Rt = class extends $2 {
      name = "BadRequestError";
      code = "P5000";
      constructor(r2, t2, n2) {
        super(t2 || mo, R3(r2, false)), n2 && (this.code = n2);
      }
    };
    x3(Rt, "BadRequestError");
    var At = class extends $2 {
      name = "HealthcheckTimeoutError";
      code = "P5013";
      logs;
      constructor(r2, t2) {
        super("Engine not started: healthcheck timeout", R3(r2, true)), this.logs = t2;
      }
    };
    x3(At, "HealthcheckTimeoutError");
    var Ct = class extends $2 {
      name = "EngineStartupError";
      code = "P5014";
      logs;
      constructor(r2, t2, n2) {
        super(t2, R3(r2, true)), this.logs = n2;
      }
    };
    x3(Ct, "EngineStartupError");
    var It = class extends $2 {
      name = "EngineVersionNotSupportedError";
      code = "P5012";
      constructor(r2) {
        super("Engine version is not supported", R3(r2, false));
      }
    };
    x3(It, "EngineVersionNotSupportedError");
    var fo = "Request timed out";
    var Dt = class extends $2 {
      name = "GatewayTimeoutError";
      code = "P5009";
      constructor(r2, t2 = fo) {
        super(t2, R3(r2, false));
      }
    };
    x3(Dt, "GatewayTimeoutError");
    var af = "Interactive transaction error";
    var Ot = class extends $2 {
      name = "InteractiveTransactionError";
      code = "P5015";
      constructor(r2, t2 = af) {
        super(t2, R3(r2, false));
      }
    };
    x3(Ot, "InteractiveTransactionError");
    var lf = "Request parameters are invalid";
    var kt = class extends $2 {
      name = "InvalidRequestError";
      code = "P5011";
      constructor(r2, t2 = lf) {
        super(t2, R3(r2, false));
      }
    };
    x3(kt, "InvalidRequestError");
    var go = "Requested resource does not exist";
    var _t = class extends $2 {
      name = "NotFoundError";
      code = "P5003";
      constructor(r2, t2 = go) {
        super(t2, R3(r2, false));
      }
    };
    x3(_t, "NotFoundError");
    var ho = "Unknown server error";
    var Ur2 = class extends $2 {
      name = "ServerError";
      code = "P5006";
      logs;
      constructor(r2, t2, n2) {
        super(t2 || ho, R3(r2, true)), this.logs = n2;
      }
    };
    x3(Ur2, "ServerError");
    var yo = "Unauthorized, check your connection string";
    var Nt = class extends $2 {
      name = "UnauthorizedError";
      code = "P5007";
      constructor(r2, t2 = yo) {
        super(t2, R3(r2, false));
      }
    };
    x3(Nt, "UnauthorizedError");
    var bo = "Usage exceeded, retry again later";
    var Lt = class extends $2 {
      name = "UsageExceededError";
      code = "P5008";
      constructor(r2, t2 = bo) {
        super(t2, R3(r2, true));
      }
    };
    x3(Lt, "UsageExceededError");
    async function uf(e2) {
      let r2;
      try {
        r2 = await e2.text();
      } catch {
        return { type: "EmptyError" };
      }
      try {
        let t2 = JSON.parse(r2);
        if (typeof t2 == "string") switch (t2) {
          case "InternalDataProxyError":
            return { type: "DataProxyError", body: t2 };
          default:
            return { type: "UnknownTextError", body: t2 };
        }
        if (typeof t2 == "object" && t2 !== null) {
          if ("is_panic" in t2 && "message" in t2 && "error_code" in t2) return { type: "QueryEngineError", body: t2 };
          if ("EngineNotStarted" in t2 || "InteractiveTransactionMisrouted" in t2 || "InvalidRequestError" in t2) {
            let n2 = Object.values(t2)[0].reason;
            return typeof n2 == "string" && !["SchemaMissing", "EngineVersionNotSupported"].includes(n2) ? { type: "UnknownJsonError", body: t2 } : { type: "DataProxyError", body: t2 };
          }
        }
        return { type: "UnknownJsonError", body: t2 };
      } catch {
        return r2 === "" ? { type: "EmptyError" } : { type: "UnknownTextError", body: r2 };
      }
    }
    async function Ft(e2, r2) {
      if (e2.ok) return;
      let t2 = { clientVersion: r2, response: e2 }, n2 = await uf(e2);
      if (n2.type === "QueryEngineError") throw new z3(n2.body.message, { code: n2.body.error_code, clientVersion: r2 });
      if (n2.type === "DataProxyError") {
        if (n2.body === "InternalDataProxyError") throw new Ur2(t2, "Internal Data Proxy error");
        if ("EngineNotStarted" in n2.body) {
          if (n2.body.EngineNotStarted.reason === "SchemaMissing") return new pr3(t2);
          if (n2.body.EngineNotStarted.reason === "EngineVersionNotSupported") throw new It(t2);
          if ("EngineStartupError" in n2.body.EngineNotStarted.reason) {
            let { msg: i2, logs: o2 } = n2.body.EngineNotStarted.reason.EngineStartupError;
            throw new Ct(t2, i2, o2);
          }
          if ("KnownEngineStartupError" in n2.body.EngineNotStarted.reason) {
            let { msg: i2, error_code: o2 } = n2.body.EngineNotStarted.reason.KnownEngineStartupError;
            throw new P3(i2, r2, o2);
          }
          if ("HealthcheckTimeout" in n2.body.EngineNotStarted.reason) {
            let { logs: i2 } = n2.body.EngineNotStarted.reason.HealthcheckTimeout;
            throw new At(t2, i2);
          }
        }
        if ("InteractiveTransactionMisrouted" in n2.body) {
          let i2 = { IDParseError: "Could not parse interactive transaction ID", NoQueryEngineFoundError: "Could not find Query Engine for the specified host and transaction ID", TransactionStartError: "Could not start interactive transaction" };
          throw new Ot(t2, i2[n2.body.InteractiveTransactionMisrouted.reason]);
        }
        if ("InvalidRequestError" in n2.body) throw new kt(t2, n2.body.InvalidRequestError.reason);
      }
      if (e2.status === 401 || e2.status === 403) throw new Nt(t2, Gr2(yo, n2));
      if (e2.status === 404) return new _t(t2, Gr2(go, n2));
      if (e2.status === 429) throw new Lt(t2, Gr2(bo, n2));
      if (e2.status === 504) throw new Dt(t2, Gr2(fo, n2));
      if (e2.status >= 500) throw new Ur2(t2, Gr2(ho, n2));
      if (e2.status >= 400) throw new Rt(t2, Gr2(mo, n2));
    }
    function Gr2(e2, r2) {
      return r2.type === "EmptyError" ? e2 : `${e2}: ${JSON.stringify(r2)}`;
    }
    function Tl(e2) {
      let r2 = Math.pow(2, e2) * 50, t2 = Math.ceil(Math.random() * r2) - Math.ceil(r2 / 2), n2 = r2 + t2;
      return new Promise((i2) => setTimeout(() => i2(n2), n2));
    }
    var $e3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function Sl(e2) {
      let r2 = new TextEncoder().encode(e2), t2 = "", n2 = r2.byteLength, i2 = n2 % 3, o2 = n2 - i2, s2, a2, l2, u2, c2;
      for (let p3 = 0; p3 < o2; p3 = p3 + 3) c2 = r2[p3] << 16 | r2[p3 + 1] << 8 | r2[p3 + 2], s2 = (c2 & 16515072) >> 18, a2 = (c2 & 258048) >> 12, l2 = (c2 & 4032) >> 6, u2 = c2 & 63, t2 += $e3[s2] + $e3[a2] + $e3[l2] + $e3[u2];
      return i2 == 1 ? (c2 = r2[o2], s2 = (c2 & 252) >> 2, a2 = (c2 & 3) << 4, t2 += $e3[s2] + $e3[a2] + "==") : i2 == 2 && (c2 = r2[o2] << 8 | r2[o2 + 1], s2 = (c2 & 64512) >> 10, a2 = (c2 & 1008) >> 4, l2 = (c2 & 15) << 2, t2 += $e3[s2] + $e3[a2] + $e3[l2] + "="), t2;
    }
    function Rl(e2) {
      if (!!e2.generator?.previewFeatures.some((t2) => t2.toLowerCase().includes("metrics"))) throw new P3("The `metrics` preview feature is not yet available with Accelerate.\nPlease remove `metrics` from the `previewFeatures` in your schema.\n\nMore information about Accelerate: https://pris.ly/d/accelerate", e2.clientVersion);
    }
    var Al = { "@prisma/debug": "workspace:*", "@prisma/engines-version": "6.18.0-8.34b5a692b7bd79939a9a2c3ef97d816e749cda2f", "@prisma/fetch-engine": "workspace:*", "@prisma/get-platform": "workspace:*" };
    var Mt = class extends oe3 {
      name = "RequestError";
      code = "P5010";
      constructor(r2, t2) {
        super(`Cannot fetch data from service:
${r2}`, R3(t2, true));
      }
    };
    x3(Mt, "RequestError");
    async function dr3(e2, r2, t2 = (n2) => n2) {
      let { clientVersion: n2, ...i2 } = r2, o2 = t2(fetch);
      try {
        return await o2(e2, i2);
      } catch (s2) {
        let a2 = s2.message ?? "Unknown error";
        throw new Mt(a2, { clientVersion: n2, cause: s2 });
      }
    }
    var pf = /^[1-9][0-9]*\.[0-9]+\.[0-9]+$/;
    var Cl = N3("prisma:client:dataproxyEngine");
    async function df(e2, r2) {
      let t2 = Al["@prisma/engines-version"], n2 = r2.clientVersion ?? "unknown";
      if (process.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION) return process.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION;
      if (e2.includes("accelerate") && n2 !== "0.0.0" && n2 !== "in-memory") return n2;
      let [i2, o2] = n2?.split("-") ?? [];
      if (o2 === void 0 && pf.test(i2)) return i2;
      if (o2 !== void 0 || n2 === "0.0.0" || n2 === "in-memory") {
        let [s2] = t2.split("-") ?? [], [a2, l2, u2] = s2.split("."), c2 = mf(`<=${a2}.${l2}.${u2}`), p3 = await dr3(c2, { clientVersion: n2 });
        if (!p3.ok) throw new Error(`Failed to fetch stable Prisma version, unpkg.com status ${p3.status} ${p3.statusText}, response body: ${await p3.text() || "<empty body>"}`);
        let d2 = await p3.text();
        Cl("length of body fetched from unpkg.com", d2.length);
        let f3;
        try {
          f3 = JSON.parse(d2);
        } catch (h2) {
          throw console.error("JSON.parse error: body fetched from unpkg.com: ", d2), h2;
        }
        return f3.version;
      }
      throw new cr3("Only `major.minor.patch` versions are supported by Accelerate.", { clientVersion: n2 });
    }
    async function Il(e2, r2) {
      let t2 = await df(e2, r2);
      return Cl("version", t2), t2;
    }
    function mf(e2) {
      return encodeURI(`https://unpkg.com/prisma@${e2}/package.json`);
    }
    var Dl = 3;
    var $t = N3("prisma:client:dataproxyEngine");
    var qt = class {
      name = "DataProxyEngine";
      inlineSchema;
      inlineSchemaHash;
      inlineDatasources;
      config;
      logEmitter;
      env;
      clientVersion;
      engineHash;
      tracingHelper;
      remoteClientVersion;
      host;
      headerBuilder;
      startPromise;
      protocol;
      constructor(r2) {
        Rl(r2), this.config = r2, this.env = r2.env, this.inlineSchema = Sl(r2.inlineSchema), this.inlineDatasources = r2.inlineDatasources, this.inlineSchemaHash = r2.inlineSchemaHash, this.clientVersion = r2.clientVersion, this.engineHash = r2.engineVersion, this.logEmitter = r2.logEmitter, this.tracingHelper = r2.tracingHelper;
      }
      apiKey() {
        return this.headerBuilder.apiKey;
      }
      version() {
        return this.engineHash;
      }
      async start() {
        this.startPromise !== void 0 && await this.startPromise, this.startPromise = (async () => {
          let { apiKey: r2, url: t2 } = this.getURLAndAPIKey();
          this.host = t2.host, this.protocol = t2.protocol, this.headerBuilder = new Yn({ apiKey: r2, tracingHelper: this.tracingHelper, logLevel: this.config.logLevel ?? "error", logQueries: this.config.logQueries, engineHash: this.engineHash }), this.remoteClientVersion = await Il(this.host, this.config), $t("host", this.host), $t("protocol", this.protocol);
        })(), await this.startPromise;
      }
      async stop() {
      }
      propagateResponseExtensions(r2) {
        r2?.logs?.length && r2.logs.forEach((t2) => {
          switch (t2.level) {
            case "debug":
            case "trace":
              $t(t2);
              break;
            case "error":
            case "warn":
            case "info": {
              this.logEmitter.emit(t2.level, { timestamp: po(t2.timestamp), message: t2.attributes.message ?? "", target: t2.target ?? "BinaryEngine" });
              break;
            }
            case "query": {
              this.logEmitter.emit("query", { query: t2.attributes.query ?? "", timestamp: po(t2.timestamp), duration: t2.attributes.duration_ms ?? 0, params: t2.attributes.params ?? "", target: t2.target ?? "BinaryEngine" });
              break;
            }
            default:
              t2.level;
          }
        }), r2?.traces?.length && this.tracingHelper.dispatchEngineSpans(r2.traces);
      }
      onBeforeExit() {
        throw new Error('"beforeExit" hook is not applicable to the remote query engine');
      }
      async url(r2) {
        return await this.start(), `${this.protocol}//${this.host}/${this.remoteClientVersion}/${this.inlineSchemaHash}/${r2}`;
      }
      async uploadSchema() {
        let r2 = { name: "schemaUpload", internal: true };
        return this.tracingHelper.runInChildSpan(r2, async () => {
          let t2 = await dr3(await this.url("schema"), { method: "PUT", headers: this.headerBuilder.build(), body: this.inlineSchema, clientVersion: this.clientVersion });
          t2.ok || $t("schema response status", t2.status);
          let n2 = await Ft(t2, this.clientVersion);
          if (n2) throw this.logEmitter.emit("warn", { message: `Error while uploading schema: ${n2.message}`, timestamp: /* @__PURE__ */ new Date(), target: "" }), n2;
          this.logEmitter.emit("info", { message: `Schema (re)uploaded (hash: ${this.inlineSchemaHash})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
        });
      }
      request(r2, { traceparent: t2, interactiveTransaction: n2, customDataProxyFetch: i2 }) {
        return this.requestInternal({ body: r2, traceparent: t2, interactiveTransaction: n2, customDataProxyFetch: i2 });
      }
      async requestBatch(r2, { traceparent: t2, transaction: n2, customDataProxyFetch: i2 }) {
        let o2 = n2?.kind === "itx" ? n2.options : void 0, s2 = Mr2(r2, n2);
        return (await this.requestInternal({ body: s2, customDataProxyFetch: i2, interactiveTransaction: o2, traceparent: t2 })).map((l2) => (l2.extensions && this.propagateResponseExtensions(l2.extensions), "errors" in l2 ? this.convertProtocolErrorsToClientError(l2.errors) : l2));
      }
      requestInternal({ body: r2, traceparent: t2, customDataProxyFetch: n2, interactiveTransaction: i2 }) {
        return this.withRetry({ actionGerund: "querying", callback: async ({ logHttpCall: o2 }) => {
          let s2 = i2 ? `${i2.payload.endpoint}/graphql` : await this.url("graphql");
          o2(s2);
          let a2 = await dr3(s2, { method: "POST", headers: this.headerBuilder.build({ traceparent: t2, transactionId: i2?.id }), body: JSON.stringify(r2), clientVersion: this.clientVersion }, n2);
          a2.ok || $t("graphql response status", a2.status), await this.handleError(await Ft(a2, this.clientVersion));
          let l2 = await a2.json();
          if (l2.extensions && this.propagateResponseExtensions(l2.extensions), "errors" in l2) throw this.convertProtocolErrorsToClientError(l2.errors);
          return "batchResult" in l2 ? l2.batchResult : l2;
        } });
      }
      async transaction(r2, t2, n2) {
        let i2 = { start: "starting", commit: "committing", rollback: "rolling back" };
        return this.withRetry({ actionGerund: `${i2[r2]} transaction`, callback: async ({ logHttpCall: o2 }) => {
          if (r2 === "start") {
            let s2 = JSON.stringify({ max_wait: n2.maxWait, timeout: n2.timeout, isolation_level: n2.isolationLevel }), a2 = await this.url("transaction/start");
            o2(a2);
            let l2 = await dr3(a2, { method: "POST", headers: this.headerBuilder.build({ traceparent: t2.traceparent }), body: s2, clientVersion: this.clientVersion });
            await this.handleError(await Ft(l2, this.clientVersion));
            let u2 = await l2.json(), { extensions: c2 } = u2;
            c2 && this.propagateResponseExtensions(c2);
            let p3 = u2.id, d2 = u2["data-proxy"].endpoint;
            return { id: p3, payload: { endpoint: d2 } };
          } else {
            let s2 = `${n2.payload.endpoint}/${r2}`;
            o2(s2);
            let a2 = await dr3(s2, { method: "POST", headers: this.headerBuilder.build({ traceparent: t2.traceparent }), clientVersion: this.clientVersion });
            await this.handleError(await Ft(a2, this.clientVersion));
            let l2 = await a2.json(), { extensions: u2 } = l2;
            u2 && this.propagateResponseExtensions(u2);
            return;
          }
        } });
      }
      getURLAndAPIKey() {
        return vl({ clientVersion: this.clientVersion, env: this.env, inlineDatasources: this.inlineDatasources, overrideDatasources: this.config.overrideDatasources });
      }
      metrics() {
        throw new cr3("Metrics are not yet supported for Accelerate", { clientVersion: this.clientVersion });
      }
      async withRetry(r2) {
        for (let t2 = 0; ; t2++) {
          let n2 = (i2) => {
            this.logEmitter.emit("info", { message: `Calling ${i2} (n=${t2})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
          };
          try {
            return await r2.callback({ logHttpCall: n2 });
          } catch (i2) {
            if (!(i2 instanceof oe3) || !i2.isRetryable) throw i2;
            if (t2 >= Dl) throw i2 instanceof Br2 ? i2.cause : i2;
            this.logEmitter.emit("warn", { message: `Attempt ${t2 + 1}/${Dl} failed for ${r2.actionGerund}: ${i2.message ?? "(unknown)"}`, timestamp: /* @__PURE__ */ new Date(), target: "" });
            let o2 = await Tl(t2);
            this.logEmitter.emit("warn", { message: `Retrying after ${o2}ms`, timestamp: /* @__PURE__ */ new Date(), target: "" });
          }
        }
      }
      async handleError(r2) {
        if (r2 instanceof pr3) throw await this.uploadSchema(), new Br2({ clientVersion: this.clientVersion, cause: r2 });
        if (r2) throw r2;
      }
      convertProtocolErrorsToClientError(r2) {
        return r2.length === 1 ? $r2(r2[0], this.config.clientVersion, this.config.activeProvider) : new V3(JSON.stringify(r2), { clientVersion: this.config.clientVersion });
      }
      applyPendingMigrations() {
        throw new Error("Method not implemented.");
      }
    };
    function Ol(e2) {
      if (e2?.kind === "itx") return e2.options.id;
    }
    var wo = O3(require("os"));
    var kl = O3(require("path"));
    var Eo = Symbol("PrismaLibraryEngineCache");
    function ff() {
      let e2 = globalThis;
      return e2[Eo] === void 0 && (e2[Eo] = {}), e2[Eo];
    }
    function gf(e2) {
      let r2 = ff();
      if (r2[e2] !== void 0) return r2[e2];
      let t2 = kl.default.toNamespacedPath(e2), n2 = { exports: {} }, i2 = 0;
      return process.platform !== "win32" && (i2 = wo.default.constants.dlopen.RTLD_LAZY | wo.default.constants.dlopen.RTLD_DEEPBIND), process.dlopen(n2, t2, i2), r2[e2] = n2.exports, n2.exports;
    }
    var _l = { async loadLibrary(e2) {
      let r2 = await fi(), t2 = await ml("library", e2);
      try {
        return e2.tracingHelper.runInChildSpan({ name: "loadLibrary", internal: true }, () => gf(t2));
      } catch (n2) {
        let i2 = Ai({ e: n2, platformInfo: r2, id: t2 });
        throw new P3(i2, e2.clientVersion);
      }
    } };
    var xo;
    var Nl = { async loadLibrary(e2) {
      let { clientVersion: r2, adapter: t2, engineWasm: n2 } = e2;
      if (t2 === void 0) throw new P3(`The \`adapter\` option for \`PrismaClient\` is required in this context (${Kn().prettyName})`, r2);
      if (n2 === void 0) throw new P3("WASM engine was unexpectedly `undefined`", r2);
      xo === void 0 && (xo = (async () => {
        let o2 = await n2.getRuntime(), s2 = await n2.getQueryEngineWasmModule();
        if (s2 == null) throw new P3("The loaded wasm module was unexpectedly `undefined` or `null` once loaded", r2);
        let a2 = { "./query_engine_bg.js": o2 }, l2 = new WebAssembly.Instance(s2, a2), u2 = l2.exports.__wbindgen_start;
        return o2.__wbg_set_wasm(l2.exports), u2(), o2.QueryEngine;
      })());
      let i2 = await xo;
      return { debugPanic() {
        return Promise.reject("{}");
      }, dmmf() {
        return Promise.resolve("{}");
      }, version() {
        return { commit: "unknown", version: "unknown" };
      }, QueryEngine: i2 };
    } };
    var hf = "P2036";
    var Re3 = N3("prisma:client:libraryEngine");
    function yf(e2) {
      return e2.item_type === "query" && "query" in e2;
    }
    function bf(e2) {
      return "level" in e2 ? e2.level === "error" && e2.message === "PANIC" : false;
    }
    var Ll = [...li, "native"];
    var Ef = 0xffffffffffffffffn;
    var vo = 1n;
    function wf() {
      let e2 = vo++;
      return vo > Ef && (vo = 1n), e2;
    }
    var Qr2 = class {
      name = "LibraryEngine";
      engine;
      libraryInstantiationPromise;
      libraryStartingPromise;
      libraryStoppingPromise;
      libraryStarted;
      executingQueryPromise;
      config;
      QueryEngineConstructor;
      libraryLoader;
      library;
      logEmitter;
      libQueryEnginePath;
      binaryTarget;
      datasourceOverrides;
      datamodel;
      logQueries;
      logLevel;
      lastQuery;
      loggerRustPanic;
      tracingHelper;
      adapterPromise;
      versionInfo;
      constructor(r2, t2) {
        this.libraryLoader = t2 ?? _l, r2.engineWasm !== void 0 && (this.libraryLoader = t2 ?? Nl), this.config = r2, this.libraryStarted = false, this.logQueries = r2.logQueries ?? false, this.logLevel = r2.logLevel ?? "error", this.logEmitter = r2.logEmitter, this.datamodel = r2.inlineSchema, this.tracingHelper = r2.tracingHelper, r2.enableDebugLogs && (this.logLevel = "debug");
        let n2 = Object.keys(r2.overrideDatasources)[0], i2 = r2.overrideDatasources[n2]?.url;
        n2 !== void 0 && i2 !== void 0 && (this.datasourceOverrides = { [n2]: i2 }), this.libraryInstantiationPromise = this.instantiateLibrary();
      }
      wrapEngine(r2) {
        return { applyPendingMigrations: r2.applyPendingMigrations?.bind(r2), commitTransaction: this.withRequestId(r2.commitTransaction.bind(r2)), connect: this.withRequestId(r2.connect.bind(r2)), disconnect: this.withRequestId(r2.disconnect.bind(r2)), metrics: r2.metrics?.bind(r2), query: this.withRequestId(r2.query.bind(r2)), rollbackTransaction: this.withRequestId(r2.rollbackTransaction.bind(r2)), sdlSchema: r2.sdlSchema?.bind(r2), startTransaction: this.withRequestId(r2.startTransaction.bind(r2)), trace: r2.trace.bind(r2), free: r2.free?.bind(r2) };
      }
      withRequestId(r2) {
        return async (...t2) => {
          let n2 = wf().toString();
          try {
            return await r2(...t2, n2);
          } finally {
            if (this.tracingHelper.isEnabled()) {
              let i2 = await this.engine?.trace(n2);
              if (i2) {
                let o2 = JSON.parse(i2);
                this.tracingHelper.dispatchEngineSpans(o2.spans);
              }
            }
          }
        };
      }
      async applyPendingMigrations() {
        throw new Error("Cannot call this method from this type of engine instance");
      }
      async transaction(r2, t2, n2) {
        await this.start();
        let i2 = await this.adapterPromise, o2 = JSON.stringify(t2), s2;
        if (r2 === "start") {
          let l2 = JSON.stringify({ max_wait: n2.maxWait, timeout: n2.timeout, isolation_level: n2.isolationLevel });
          s2 = await this.engine?.startTransaction(l2, o2);
        } else r2 === "commit" ? s2 = await this.engine?.commitTransaction(n2.id, o2) : r2 === "rollback" && (s2 = await this.engine?.rollbackTransaction(n2.id, o2));
        let a2 = this.parseEngineResponse(s2);
        if (xf(a2)) {
          let l2 = this.getExternalAdapterError(a2, i2?.errorRegistry);
          throw l2 ? l2.error : new z3(a2.message, { code: a2.error_code, clientVersion: this.config.clientVersion, meta: a2.meta });
        } else if (typeof a2.message == "string") throw new V3(a2.message, { clientVersion: this.config.clientVersion });
        return a2;
      }
      async instantiateLibrary() {
        if (Re3("internalSetup"), this.libraryInstantiationPromise) return this.libraryInstantiationPromise;
        ai(), this.binaryTarget = await this.getCurrentBinaryTarget(), await this.tracingHelper.runInChildSpan("load_engine", () => this.loadEngine()), this.version();
      }
      async getCurrentBinaryTarget() {
        {
          if (this.binaryTarget) return this.binaryTarget;
          let r2 = await this.tracingHelper.runInChildSpan("detect_platform", () => ir3());
          if (!Ll.includes(r2)) throw new P3(`Unknown ${ce3("PRISMA_QUERY_ENGINE_LIBRARY")} ${ce3(W3(r2))}. Possible binaryTargets: ${qe3(Ll.join(", "))} or a path to the query engine library.
You may have to run ${qe3("prisma generate")} for your changes to take effect.`, this.config.clientVersion);
          return r2;
        }
      }
      parseEngineResponse(r2) {
        if (!r2) throw new V3("Response from the Engine was empty", { clientVersion: this.config.clientVersion });
        try {
          return JSON.parse(r2);
        } catch {
          throw new V3("Unable to JSON.parse response from engine", { clientVersion: this.config.clientVersion });
        }
      }
      async loadEngine() {
        if (!this.engine) {
          this.QueryEngineConstructor || (this.library = await this.libraryLoader.loadLibrary(this.config), this.QueryEngineConstructor = this.library.QueryEngine);
          try {
            let r2 = new WeakRef(this);
            this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(tn));
            let t2 = await this.adapterPromise;
            t2 && Re3("Using driver adapter: %O", t2), this.engine = this.wrapEngine(new this.QueryEngineConstructor({ datamodel: this.datamodel, env: process.env, logQueries: this.config.logQueries ?? false, ignoreEnvVarErrors: true, datasourceOverrides: this.datasourceOverrides ?? {}, logLevel: this.logLevel, configDir: this.config.cwd, engineProtocol: "json", enableTracing: this.tracingHelper.isEnabled() }, (n2) => {
              r2.deref()?.logger(n2);
            }, t2));
          } catch (r2) {
            let t2 = r2, n2 = this.parseInitError(t2.message);
            throw typeof n2 == "string" ? t2 : new P3(n2.message, this.config.clientVersion, n2.error_code);
          }
        }
      }
      logger(r2) {
        let t2 = this.parseEngineResponse(r2);
        t2 && (t2.level = t2?.level.toLowerCase() ?? "unknown", yf(t2) ? this.logEmitter.emit("query", { timestamp: /* @__PURE__ */ new Date(), query: t2.query, params: t2.params, duration: Number(t2.duration_ms), target: t2.module_path }) : bf(t2) ? this.loggerRustPanic = new ae3(Po(this, `${t2.message}: ${t2.reason} in ${t2.file}:${t2.line}:${t2.column}`), this.config.clientVersion) : this.logEmitter.emit(t2.level, { timestamp: /* @__PURE__ */ new Date(), message: t2.message, target: t2.module_path }));
      }
      parseInitError(r2) {
        try {
          return JSON.parse(r2);
        } catch {
        }
        return r2;
      }
      parseRequestError(r2) {
        try {
          return JSON.parse(r2);
        } catch {
        }
        return r2;
      }
      onBeforeExit() {
        throw new Error('"beforeExit" hook is not applicable to the library engine since Prisma 5.0.0, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.');
      }
      async start() {
        if (this.libraryInstantiationPromise || (this.libraryInstantiationPromise = this.instantiateLibrary()), await this.libraryInstantiationPromise, await this.libraryStoppingPromise, this.libraryStartingPromise) return Re3(`library already starting, this.libraryStarted: ${this.libraryStarted}`), this.libraryStartingPromise;
        if (this.libraryStarted) return;
        let r2 = async () => {
          Re3("library starting");
          try {
            let t2 = { traceparent: this.tracingHelper.getTraceParent() };
            await this.engine?.connect(JSON.stringify(t2)), this.libraryStarted = true, this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(tn)), await this.adapterPromise, Re3("library started");
          } catch (t2) {
            let n2 = this.parseInitError(t2.message);
            throw typeof n2 == "string" ? t2 : new P3(n2.message, this.config.clientVersion, n2.error_code);
          } finally {
            this.libraryStartingPromise = void 0;
          }
        };
        return this.libraryStartingPromise = this.tracingHelper.runInChildSpan("connect", r2), this.libraryStartingPromise;
      }
      async stop() {
        if (await this.libraryInstantiationPromise, await this.libraryStartingPromise, await this.executingQueryPromise, this.libraryStoppingPromise) return Re3("library is already stopping"), this.libraryStoppingPromise;
        if (!this.libraryStarted) {
          await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0;
          return;
        }
        let r2 = async () => {
          await new Promise((n2) => setImmediate(n2)), Re3("library stopping");
          let t2 = { traceparent: this.tracingHelper.getTraceParent() };
          await this.engine?.disconnect(JSON.stringify(t2)), this.engine?.free && this.engine.free(), this.engine = void 0, this.libraryStarted = false, this.libraryStoppingPromise = void 0, this.libraryInstantiationPromise = void 0, await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0, Re3("library stopped");
        };
        return this.libraryStoppingPromise = this.tracingHelper.runInChildSpan("disconnect", r2), this.libraryStoppingPromise;
      }
      version() {
        return this.versionInfo = this.library?.version(), this.versionInfo?.version ?? "unknown";
      }
      debugPanic(r2) {
        return this.library?.debugPanic(r2);
      }
      async request(r2, { traceparent: t2, interactiveTransaction: n2 }) {
        Re3(`sending request, this.libraryStarted: ${this.libraryStarted}`);
        let i2 = JSON.stringify({ traceparent: t2 }), o2 = JSON.stringify(r2);
        try {
          await this.start();
          let s2 = await this.adapterPromise;
          this.executingQueryPromise = this.engine?.query(o2, i2, n2?.id), this.lastQuery = o2;
          let a2 = this.parseEngineResponse(await this.executingQueryPromise);
          if (a2.errors) throw a2.errors.length === 1 ? this.buildQueryError(a2.errors[0], s2?.errorRegistry) : new V3(JSON.stringify(a2.errors), { clientVersion: this.config.clientVersion });
          if (this.loggerRustPanic) throw this.loggerRustPanic;
          return { data: a2 };
        } catch (s2) {
          if (s2 instanceof P3) throw s2;
          if (s2.code === "GenericFailure" && s2.message?.startsWith("PANIC:")) throw new ae3(Po(this, s2.message), this.config.clientVersion);
          let a2 = this.parseRequestError(s2.message);
          throw typeof a2 == "string" ? s2 : new V3(`${a2.message}
${a2.backtrace}`, { clientVersion: this.config.clientVersion });
        }
      }
      async requestBatch(r2, { transaction: t2, traceparent: n2 }) {
        Re3("requestBatch");
        let i2 = Mr2(r2, t2);
        await this.start();
        let o2 = await this.adapterPromise;
        this.lastQuery = JSON.stringify(i2), this.executingQueryPromise = this.engine?.query(this.lastQuery, JSON.stringify({ traceparent: n2 }), Ol(t2));
        let s2 = await this.executingQueryPromise, a2 = this.parseEngineResponse(s2);
        if (a2.errors) throw a2.errors.length === 1 ? this.buildQueryError(a2.errors[0], o2?.errorRegistry) : new V3(JSON.stringify(a2.errors), { clientVersion: this.config.clientVersion });
        let { batchResult: l2, errors: u2 } = a2;
        if (Array.isArray(l2)) return l2.map((c2) => c2.errors && c2.errors.length > 0 ? this.loggerRustPanic ?? this.buildQueryError(c2.errors[0], o2?.errorRegistry) : { data: c2 });
        throw u2 && u2.length === 1 ? new Error(u2[0].error) : new Error(JSON.stringify(a2));
      }
      buildQueryError(r2, t2) {
        if (r2.user_facing_error.is_panic) return new ae3(Po(this, r2.user_facing_error.message), this.config.clientVersion);
        let n2 = this.getExternalAdapterError(r2.user_facing_error, t2);
        return n2 ? n2.error : $r2(r2, this.config.clientVersion, this.config.activeProvider);
      }
      getExternalAdapterError(r2, t2) {
        if (r2.error_code === hf && t2) {
          let n2 = r2.meta?.id;
          ln(typeof n2 == "number", "Malformed external JS error received from the engine");
          let i2 = t2.consumeError(n2);
          return ln(i2, "External error with reported id was not registered"), i2;
        }
      }
      async metrics(r2) {
        await this.start();
        let t2 = await this.engine.metrics(JSON.stringify(r2));
        return r2.format === "prometheus" ? t2 : this.parseEngineResponse(t2);
      }
    };
    function xf(e2) {
      return typeof e2 == "object" && e2 !== null && e2.error_code !== void 0;
    }
    function Po(e2, r2) {
      return El({ binaryTarget: e2.binaryTarget, title: r2, version: e2.config.clientVersion, engineVersion: e2.versionInfo?.commit, database: e2.config.activeProvider, query: e2.lastQuery });
    }
    function Fl({ url: e2, adapter: r2, copyEngine: t2, targetBuildType: n2 }) {
      let i2 = [], o2 = [], s2 = (g2) => {
        i2.push({ _tag: "warning", value: g2 });
      }, a2 = (g2) => {
        let I3 = g2.join(`
`);
        o2.push({ _tag: "error", value: I3 });
      }, l2 = !!e2?.startsWith("prisma://"), u2 = an(e2), c2 = !!r2, p3 = l2 || u2;
      !c2 && t2 && p3 && n2 !== "client" && n2 !== "wasm-compiler-edge" && s2(["recommend--no-engine", "In production, we recommend using `prisma generate --no-engine` (See: `prisma generate --help`)"]);
      let d2 = p3 || !t2;
      c2 && (d2 || n2 === "edge") && (n2 === "edge" ? a2(["Prisma Client was configured to use the `adapter` option but it was imported via its `/edge` endpoint.", "Please either remove the `/edge` endpoint or remove the `adapter` from the Prisma Client constructor."]) : p3 ? a2(["You've provided both a driver adapter and an Accelerate database URL. Driver adapters currently cannot connect to Accelerate.", "Please provide either a driver adapter with a direct database URL or an Accelerate URL and no driver adapter."]) : t2 || a2(["Prisma Client was configured to use the `adapter` option but `prisma generate` was run with `--no-engine`.", "Please run `prisma generate` without `--no-engine` to be able to use Prisma Client with the adapter."]));
      let f3 = { accelerate: d2, ppg: u2, driverAdapters: c2 };
      function h2(g2) {
        return g2.length > 0;
      }
      return h2(o2) ? { ok: false, diagnostics: { warnings: i2, errors: o2 }, isUsing: f3 } : { ok: true, diagnostics: { warnings: i2 }, isUsing: f3 };
    }
    function Ml({ copyEngine: e2 = true }, r2) {
      let t2;
      try {
        t2 = jr2({ inlineDatasources: r2.inlineDatasources, overrideDatasources: r2.overrideDatasources, env: { ...r2.env, ...process.env }, clientVersion: r2.clientVersion });
      } catch {
      }
      let { ok: n2, isUsing: i2, diagnostics: o2 } = Fl({ url: t2, adapter: r2.adapter, copyEngine: e2, targetBuildType: "library" });
      for (let p3 of o2.warnings) at2(...p3.value);
      if (!n2) {
        let p3 = o2.errors[0];
        throw new Z3(p3.value, { clientVersion: r2.clientVersion });
      }
      let s2 = Er2(r2.generator), a2 = s2 === "library", l2 = s2 === "binary", u2 = s2 === "client", c2 = (i2.accelerate || i2.ppg) && !i2.driverAdapters;
      return i2.accelerate ? new qt(r2) : (i2.driverAdapters, a2 ? new Qr2(r2) : (i2.accelerate, new Qr2(r2)));
    }
    function $l({ generator: e2 }) {
      return e2?.previewFeatures ?? [];
    }
    var ql = (e2) => ({ command: e2 });
    var Vl = (e2) => e2.strings.reduce((r2, t2, n2) => `${r2}@P${n2}${t2}`);
    function Wr2(e2) {
      try {
        return jl(e2, "fast");
      } catch {
        return jl(e2, "slow");
      }
    }
    function jl(e2, r2) {
      return JSON.stringify(e2.map((t2) => Ul(t2, r2)));
    }
    function Ul(e2, r2) {
      if (Array.isArray(e2)) return e2.map((t2) => Ul(t2, r2));
      if (typeof e2 == "bigint") return { prisma__type: "bigint", prisma__value: e2.toString() };
      if (vr2(e2)) return { prisma__type: "date", prisma__value: e2.toJSON() };
      if (Fe3.isDecimal(e2)) return { prisma__type: "decimal", prisma__value: e2.toJSON() };
      if (Buffer.isBuffer(e2)) return { prisma__type: "bytes", prisma__value: e2.toString("base64") };
      if (vf(e2)) return { prisma__type: "bytes", prisma__value: Buffer.from(e2).toString("base64") };
      if (ArrayBuffer.isView(e2)) {
        let { buffer: t2, byteOffset: n2, byteLength: i2 } = e2;
        return { prisma__type: "bytes", prisma__value: Buffer.from(t2, n2, i2).toString("base64") };
      }
      return typeof e2 == "object" && r2 === "slow" ? Gl(e2) : e2;
    }
    function vf(e2) {
      return e2 instanceof ArrayBuffer || e2 instanceof SharedArrayBuffer ? true : typeof e2 == "object" && e2 !== null ? e2[Symbol.toStringTag] === "ArrayBuffer" || e2[Symbol.toStringTag] === "SharedArrayBuffer" : false;
    }
    function Gl(e2) {
      if (typeof e2 != "object" || e2 === null) return e2;
      if (typeof e2.toJSON == "function") return e2.toJSON();
      if (Array.isArray(e2)) return e2.map(Bl);
      let r2 = {};
      for (let t2 of Object.keys(e2)) r2[t2] = Bl(e2[t2]);
      return r2;
    }
    function Bl(e2) {
      return typeof e2 == "bigint" ? e2.toString() : Gl(e2);
    }
    var Pf = /^(\s*alter\s)/i;
    var Ql = N3("prisma:client");
    function To(e2, r2, t2, n2) {
      if (!(e2 !== "postgresql" && e2 !== "cockroachdb") && t2.length > 0 && Pf.exec(r2)) throw new Error(`Running ALTER using ${n2} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
    }
    var So = ({ clientMethod: e2, activeProvider: r2 }) => (t2) => {
      let n2 = "", i2;
      if (Vn(t2)) n2 = t2.sql, i2 = { values: Wr2(t2.values), __prismaRawParameters__: true };
      else if (Array.isArray(t2)) {
        let [o2, ...s2] = t2;
        n2 = o2, i2 = { values: Wr2(s2 || []), __prismaRawParameters__: true };
      } else switch (r2) {
        case "sqlite":
        case "mysql": {
          n2 = t2.sql, i2 = { values: Wr2(t2.values), __prismaRawParameters__: true };
          break;
        }
        case "cockroachdb":
        case "postgresql":
        case "postgres": {
          n2 = t2.text, i2 = { values: Wr2(t2.values), __prismaRawParameters__: true };
          break;
        }
        case "sqlserver": {
          n2 = Vl(t2), i2 = { values: Wr2(t2.values), __prismaRawParameters__: true };
          break;
        }
        default:
          throw new Error(`The ${r2} provider does not support ${e2}`);
      }
      return i2?.values ? Ql(`prisma.${e2}(${n2}, ${i2.values})`) : Ql(`prisma.${e2}(${n2})`), { query: n2, parameters: i2 };
    };
    var Wl = { requestArgsToMiddlewareArgs(e2) {
      return [e2.strings, ...e2.values];
    }, middlewareArgsToRequestArgs(e2) {
      let [r2, ...t2] = e2;
      return new ie3(r2, t2);
    } };
    var Jl = { requestArgsToMiddlewareArgs(e2) {
      return [e2];
    }, middlewareArgsToRequestArgs(e2) {
      return e2[0];
    } };
    function Ro(e2) {
      return function(t2, n2) {
        let i2, o2 = (s2 = e2) => {
          try {
            return s2 === void 0 || s2?.kind === "itx" ? i2 ??= Kl(t2(s2)) : Kl(t2(s2));
          } catch (a2) {
            return Promise.reject(a2);
          }
        };
        return { get spec() {
          return n2;
        }, then(s2, a2) {
          return o2().then(s2, a2);
        }, catch(s2) {
          return o2().catch(s2);
        }, finally(s2) {
          return o2().finally(s2);
        }, requestTransaction(s2) {
          let a2 = o2(s2);
          return a2.requestTransaction ? a2.requestTransaction(s2) : a2;
        }, [Symbol.toStringTag]: "PrismaPromise" };
      };
    }
    function Kl(e2) {
      return typeof e2.then == "function" ? e2 : Promise.resolve(e2);
    }
    var Tf = xi.split(".")[0];
    var Sf = { isEnabled() {
      return false;
    }, getTraceParent() {
      return "00-10-10-00";
    }, dispatchEngineSpans() {
    }, getActiveContext() {
    }, runInChildSpan(e2, r2) {
      return r2();
    } };
    var Ao = class {
      isEnabled() {
        return this.getGlobalTracingHelper().isEnabled();
      }
      getTraceParent(r2) {
        return this.getGlobalTracingHelper().getTraceParent(r2);
      }
      dispatchEngineSpans(r2) {
        return this.getGlobalTracingHelper().dispatchEngineSpans(r2);
      }
      getActiveContext() {
        return this.getGlobalTracingHelper().getActiveContext();
      }
      runInChildSpan(r2, t2) {
        return this.getGlobalTracingHelper().runInChildSpan(r2, t2);
      }
      getGlobalTracingHelper() {
        let r2 = globalThis[`V${Tf}_PRISMA_INSTRUMENTATION`], t2 = globalThis.PRISMA_INSTRUMENTATION;
        return r2?.helper ?? t2?.helper ?? Sf;
      }
    };
    function Hl() {
      return new Ao();
    }
    function Yl(e2, r2 = () => {
    }) {
      let t2, n2 = new Promise((i2) => t2 = i2);
      return { then(i2) {
        return --e2 === 0 && t2(r2()), i2?.(n2);
      } };
    }
    function zl(e2) {
      return typeof e2 == "string" ? e2 : e2.reduce((r2, t2) => {
        let n2 = typeof t2 == "string" ? t2 : t2.level;
        return n2 === "query" ? r2 : r2 && (t2 === "info" || r2 === "info") ? "info" : n2;
      }, void 0);
    }
    function zn(e2) {
      return typeof e2.batchRequestIdx == "number";
    }
    function Zl(e2) {
      if (e2.action !== "findUnique" && e2.action !== "findUniqueOrThrow") return;
      let r2 = [];
      return e2.modelName && r2.push(e2.modelName), e2.query.arguments && r2.push(Co(e2.query.arguments)), r2.push(Co(e2.query.selection)), r2.join("");
    }
    function Co(e2) {
      return `(${Object.keys(e2).sort().map((t2) => {
        let n2 = e2[t2];
        return typeof n2 == "object" && n2 !== null ? `(${t2} ${Co(n2)})` : t2;
      }).join(" ")})`;
    }
    var Rf = { aggregate: false, aggregateRaw: false, createMany: true, createManyAndReturn: true, createOne: true, deleteMany: true, deleteOne: true, executeRaw: true, findFirst: false, findFirstOrThrow: false, findMany: false, findRaw: false, findUnique: false, findUniqueOrThrow: false, groupBy: false, queryRaw: false, runCommandRaw: true, updateMany: true, updateManyAndReturn: true, updateOne: true, upsertOne: true };
    function Io(e2) {
      return Rf[e2];
    }
    var Zn = class {
      constructor(r2) {
        this.options = r2;
        this.batches = {};
      }
      batches;
      tickActive = false;
      request(r2) {
        let t2 = this.options.batchBy(r2);
        return t2 ? (this.batches[t2] || (this.batches[t2] = [], this.tickActive || (this.tickActive = true, process.nextTick(() => {
          this.dispatchBatches(), this.tickActive = false;
        }))), new Promise((n2, i2) => {
          this.batches[t2].push({ request: r2, resolve: n2, reject: i2 });
        })) : this.options.singleLoader(r2);
      }
      dispatchBatches() {
        for (let r2 in this.batches) {
          let t2 = this.batches[r2];
          delete this.batches[r2], t2.length === 1 ? this.options.singleLoader(t2[0].request).then((n2) => {
            n2 instanceof Error ? t2[0].reject(n2) : t2[0].resolve(n2);
          }).catch((n2) => {
            t2[0].reject(n2);
          }) : (t2.sort((n2, i2) => this.options.batchOrder(n2.request, i2.request)), this.options.batchLoader(t2.map((n2) => n2.request)).then((n2) => {
            if (n2 instanceof Error) for (let i2 = 0; i2 < t2.length; i2++) t2[i2].reject(n2);
            else for (let i2 = 0; i2 < t2.length; i2++) {
              let o2 = n2[i2];
              o2 instanceof Error ? t2[i2].reject(o2) : t2[i2].resolve(o2);
            }
          }).catch((n2) => {
            for (let i2 = 0; i2 < t2.length; i2++) t2[i2].reject(n2);
          }));
        }
      }
      get [Symbol.toStringTag]() {
        return "DataLoader";
      }
    };
    function mr3(e2, r2) {
      if (r2 === null) return r2;
      switch (e2) {
        case "bigint":
          return BigInt(r2);
        case "bytes": {
          let { buffer: t2, byteOffset: n2, byteLength: i2 } = Buffer.from(r2, "base64");
          return new Uint8Array(t2, n2, i2);
        }
        case "decimal":
          return new Fe3(r2);
        case "datetime":
        case "date":
          return new Date(r2);
        case "time":
          return /* @__PURE__ */ new Date(`1970-01-01T${r2}Z`);
        case "bigint-array":
          return r2.map((t2) => mr3("bigint", t2));
        case "bytes-array":
          return r2.map((t2) => mr3("bytes", t2));
        case "decimal-array":
          return r2.map((t2) => mr3("decimal", t2));
        case "datetime-array":
          return r2.map((t2) => mr3("datetime", t2));
        case "date-array":
          return r2.map((t2) => mr3("date", t2));
        case "time-array":
          return r2.map((t2) => mr3("time", t2));
        default:
          return r2;
      }
    }
    function Xn(e2) {
      let r2 = [], t2 = Af(e2);
      for (let n2 = 0; n2 < e2.rows.length; n2++) {
        let i2 = e2.rows[n2], o2 = { ...t2 };
        for (let s2 = 0; s2 < i2.length; s2++) o2[e2.columns[s2]] = mr3(e2.types[s2], i2[s2]);
        r2.push(o2);
      }
      return r2;
    }
    function Af(e2) {
      let r2 = {};
      for (let t2 = 0; t2 < e2.columns.length; t2++) r2[e2.columns[t2]] = null;
      return r2;
    }
    var Cf = N3("prisma:client:request_handler");
    var ei = class {
      client;
      dataloader;
      logEmitter;
      constructor(r2, t2) {
        this.logEmitter = t2, this.client = r2, this.dataloader = new Zn({ batchLoader: rl(async ({ requests: n2, customDataProxyFetch: i2 }) => {
          let { transaction: o2, otelParentCtx: s2 } = n2[0], a2 = n2.map((p3) => p3.protocolQuery), l2 = this.client._tracingHelper.getTraceParent(s2), u2 = n2.some((p3) => Io(p3.protocolQuery.action));
          return (await this.client._engine.requestBatch(a2, { traceparent: l2, transaction: If(o2), containsWrite: u2, customDataProxyFetch: i2 })).map((p3, d2) => {
            if (p3 instanceof Error) return p3;
            try {
              return this.mapQueryEngineResult(n2[d2], p3);
            } catch (f3) {
              return f3;
            }
          });
        }), singleLoader: async (n2) => {
          let i2 = n2.transaction?.kind === "itx" ? Xl(n2.transaction) : void 0, o2 = await this.client._engine.request(n2.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i2, isWrite: Io(n2.protocolQuery.action), customDataProxyFetch: n2.customDataProxyFetch });
          return this.mapQueryEngineResult(n2, o2);
        }, batchBy: (n2) => n2.transaction?.id ? `transaction-${n2.transaction.id}` : Zl(n2.protocolQuery), batchOrder(n2, i2) {
          return n2.transaction?.kind === "batch" && i2.transaction?.kind === "batch" ? n2.transaction.index - i2.transaction.index : 0;
        } });
      }
      async request(r2) {
        try {
          return await this.dataloader.request(r2);
        } catch (t2) {
          let { clientMethod: n2, callsite: i2, transaction: o2, args: s2, modelName: a2 } = r2;
          this.handleAndLogRequestError({ error: t2, clientMethod: n2, callsite: i2, transaction: o2, args: s2, modelName: a2, globalOmit: r2.globalOmit });
        }
      }
      mapQueryEngineResult({ dataPath: r2, unpacker: t2 }, n2) {
        let i2 = n2?.data, o2 = this.unpack(i2, r2, t2);
        return process.env.PRISMA_CLIENT_GET_TIME ? { data: o2 } : o2;
      }
      handleAndLogRequestError(r2) {
        try {
          this.handleRequestError(r2);
        } catch (t2) {
          throw this.logEmitter && this.logEmitter.emit("error", { message: t2.message, target: r2.clientMethod, timestamp: /* @__PURE__ */ new Date() }), t2;
        }
      }
      handleRequestError({ error: r2, clientMethod: t2, callsite: n2, transaction: i2, args: o2, modelName: s2, globalOmit: a2 }) {
        if (Cf(r2), Df(r2, i2)) throw r2;
        if (r2 instanceof z3 && Of(r2)) {
          let u2 = eu(r2.meta);
          Nn({ args: o2, errors: [u2], callsite: n2, errorFormat: this.client._errorFormat, originalMethod: t2, clientVersion: this.client._clientVersion, globalOmit: a2 });
        }
        let l2 = r2.message;
        if (n2 && (l2 = Tn({ callsite: n2, originalMethod: t2, isPanic: r2.isPanic, showColors: this.client._errorFormat === "pretty", message: l2 })), l2 = this.sanitizeMessage(l2), r2.code) {
          let u2 = s2 ? { modelName: s2, ...r2.meta } : r2.meta;
          throw new z3(l2, { code: r2.code, clientVersion: this.client._clientVersion, meta: u2, batchRequestIdx: r2.batchRequestIdx });
        } else {
          if (r2.isPanic) throw new ae3(l2, this.client._clientVersion);
          if (r2 instanceof V3) throw new V3(l2, { clientVersion: this.client._clientVersion, batchRequestIdx: r2.batchRequestIdx });
          if (r2 instanceof P3) throw new P3(l2, this.client._clientVersion);
          if (r2 instanceof ae3) throw new ae3(l2, this.client._clientVersion);
        }
        throw r2.clientVersion = this.client._clientVersion, r2;
      }
      sanitizeMessage(r2) {
        return this.client._errorFormat && this.client._errorFormat !== "pretty" ? wr2(r2) : r2;
      }
      unpack(r2, t2, n2) {
        if (!r2 || (r2.data && (r2 = r2.data), !r2)) return r2;
        let i2 = Object.keys(r2)[0], o2 = Object.values(r2)[0], s2 = t2.filter((u2) => u2 !== "select" && u2 !== "include"), a2 = ao(o2, s2), l2 = i2 === "queryRaw" ? Xn(a2) : Vr2(a2);
        return n2 ? n2(l2) : l2;
      }
      get [Symbol.toStringTag]() {
        return "RequestHandler";
      }
    };
    function If(e2) {
      if (e2) {
        if (e2.kind === "batch") return { kind: "batch", options: { isolationLevel: e2.isolationLevel } };
        if (e2.kind === "itx") return { kind: "itx", options: Xl(e2) };
        ar3(e2, "Unknown transaction kind");
      }
    }
    function Xl(e2) {
      return { id: e2.id, payload: e2.payload };
    }
    function Df(e2, r2) {
      return zn(e2) && r2?.kind === "batch" && e2.batchRequestIdx !== r2.index;
    }
    function Of(e2) {
      return e2.code === "P2009" || e2.code === "P2012";
    }
    function eu(e2) {
      if (e2.kind === "Union") return { kind: "Union", errors: e2.errors.map(eu) };
      if (Array.isArray(e2.selectionPath)) {
        let [, ...r2] = e2.selectionPath;
        return { ...e2, selectionPath: r2 };
      }
      return e2;
    }
    var ru = xl;
    var su = O3(Ki());
    var _3 = class extends Error {
      constructor(r2) {
        super(r2 + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientConstructorValidationError";
      }
    };
    x3(_3, "PrismaClientConstructorValidationError");
    var tu = ["datasources", "datasourceUrl", "errorFormat", "adapter", "log", "transactionOptions", "omit", "__internal"];
    var nu = ["pretty", "colorless", "minimal"];
    var iu = ["info", "query", "warn", "error"];
    var kf = { datasources: (e2, { datasourceNames: r2 }) => {
      if (e2) {
        if (typeof e2 != "object" || Array.isArray(e2)) throw new _3(`Invalid value ${JSON.stringify(e2)} for "datasources" provided to PrismaClient constructor`);
        for (let [t2, n2] of Object.entries(e2)) {
          if (!r2.includes(t2)) {
            let i2 = Jr2(t2, r2) || ` Available datasources: ${r2.join(", ")}`;
            throw new _3(`Unknown datasource ${t2} provided to PrismaClient constructor.${i2}`);
          }
          if (typeof n2 != "object" || Array.isArray(n2)) throw new _3(`Invalid value ${JSON.stringify(e2)} for datasource "${t2}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
          if (n2 && typeof n2 == "object") for (let [i2, o2] of Object.entries(n2)) {
            if (i2 !== "url") throw new _3(`Invalid value ${JSON.stringify(e2)} for datasource "${t2}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
            if (typeof o2 != "string") throw new _3(`Invalid value ${JSON.stringify(o2)} for datasource "${t2}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
          }
        }
      }
    }, adapter: (e2, r2) => {
      if (!e2 && Er2(r2.generator) === "client") throw new _3('Using engine type "client" requires a driver adapter to be provided to PrismaClient constructor.');
      if (e2 !== null) {
        if (e2 === void 0) throw new _3('"adapter" property must not be undefined, use null to conditionally disable driver adapters.');
        if (Er2(r2.generator) === "binary") throw new _3('Cannot use a driver adapter with the "binary" Query Engine. Please use the "library" Query Engine.');
      }
    }, datasourceUrl: (e2) => {
      if (typeof e2 < "u" && typeof e2 != "string") throw new _3(`Invalid value ${JSON.stringify(e2)} for "datasourceUrl" provided to PrismaClient constructor.
Expected string or undefined.`);
    }, errorFormat: (e2) => {
      if (e2) {
        if (typeof e2 != "string") throw new _3(`Invalid value ${JSON.stringify(e2)} for "errorFormat" provided to PrismaClient constructor.`);
        if (!nu.includes(e2)) {
          let r2 = Jr2(e2, nu);
          throw new _3(`Invalid errorFormat ${e2} provided to PrismaClient constructor.${r2}`);
        }
      }
    }, log: (e2) => {
      if (!e2) return;
      if (!Array.isArray(e2)) throw new _3(`Invalid value ${JSON.stringify(e2)} for "log" provided to PrismaClient constructor.`);
      function r2(t2) {
        if (typeof t2 == "string" && !iu.includes(t2)) {
          let n2 = Jr2(t2, iu);
          throw new _3(`Invalid log level "${t2}" provided to PrismaClient constructor.${n2}`);
        }
      }
      for (let t2 of e2) {
        r2(t2);
        let n2 = { level: r2, emit: (i2) => {
          let o2 = ["stdout", "event"];
          if (!o2.includes(i2)) {
            let s2 = Jr2(i2, o2);
            throw new _3(`Invalid value ${JSON.stringify(i2)} for "emit" in logLevel provided to PrismaClient constructor.${s2}`);
          }
        } };
        if (t2 && typeof t2 == "object") for (let [i2, o2] of Object.entries(t2)) if (n2[i2]) n2[i2](o2);
        else throw new _3(`Invalid property ${i2} for "log" provided to PrismaClient constructor`);
      }
    }, transactionOptions: (e2) => {
      if (!e2) return;
      let r2 = e2.maxWait;
      if (r2 != null && r2 <= 0) throw new _3(`Invalid value ${r2} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`);
      let t2 = e2.timeout;
      if (t2 != null && t2 <= 0) throw new _3(`Invalid value ${t2} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`);
    }, omit: (e2, r2) => {
      if (typeof e2 != "object") throw new _3('"omit" option is expected to be an object.');
      if (e2 === null) throw new _3('"omit" option can not be `null`');
      let t2 = [];
      for (let [n2, i2] of Object.entries(e2)) {
        let o2 = Nf(n2, r2.runtimeDataModel);
        if (!o2) {
          t2.push({ kind: "UnknownModel", modelKey: n2 });
          continue;
        }
        for (let [s2, a2] of Object.entries(i2)) {
          let l2 = o2.fields.find((u2) => u2.name === s2);
          if (!l2) {
            t2.push({ kind: "UnknownField", modelKey: n2, fieldName: s2 });
            continue;
          }
          if (l2.relationName) {
            t2.push({ kind: "RelationInOmit", modelKey: n2, fieldName: s2 });
            continue;
          }
          typeof a2 != "boolean" && t2.push({ kind: "InvalidFieldValue", modelKey: n2, fieldName: s2 });
        }
      }
      if (t2.length > 0) throw new _3(Lf(e2, t2));
    }, __internal: (e2) => {
      if (!e2) return;
      let r2 = ["debug", "engine", "configOverride"];
      if (typeof e2 != "object") throw new _3(`Invalid value ${JSON.stringify(e2)} for "__internal" to PrismaClient constructor`);
      for (let [t2] of Object.entries(e2)) if (!r2.includes(t2)) {
        let n2 = Jr2(t2, r2);
        throw new _3(`Invalid property ${JSON.stringify(t2)} for "__internal" provided to PrismaClient constructor.${n2}`);
      }
    } };
    function au(e2, r2) {
      for (let [t2, n2] of Object.entries(e2)) {
        if (!tu.includes(t2)) {
          let i2 = Jr2(t2, tu);
          throw new _3(`Unknown property ${t2} provided to PrismaClient constructor.${i2}`);
        }
        kf[t2](n2, r2);
      }
      if (e2.datasourceUrl && e2.datasources) throw new _3('Can not use "datasourceUrl" and "datasources" options at the same time. Pick one of them');
    }
    function Jr2(e2, r2) {
      if (r2.length === 0 || typeof e2 != "string") return "";
      let t2 = _f(e2, r2);
      return t2 ? ` Did you mean "${t2}"?` : "";
    }
    function _f(e2, r2) {
      if (r2.length === 0) return null;
      let t2 = r2.map((i2) => ({ value: i2, distance: (0, su.default)(e2, i2) }));
      t2.sort((i2, o2) => i2.distance < o2.distance ? -1 : 1);
      let n2 = t2[0];
      return n2.distance < 3 ? n2.value : null;
    }
    function Nf(e2, r2) {
      return ou(r2.models, e2) ?? ou(r2.types, e2);
    }
    function ou(e2, r2) {
      let t2 = Object.keys(e2).find((n2) => We3(n2) === r2);
      if (t2) return e2[t2];
    }
    function Lf(e2, r2) {
      let t2 = _r2(e2);
      for (let o2 of r2) switch (o2.kind) {
        case "UnknownModel":
          t2.arguments.getField(o2.modelKey)?.markAsError(), t2.addErrorMessage(() => `Unknown model name: ${o2.modelKey}.`);
          break;
        case "UnknownField":
          t2.arguments.getDeepField([o2.modelKey, o2.fieldName])?.markAsError(), t2.addErrorMessage(() => `Model "${o2.modelKey}" does not have a field named "${o2.fieldName}".`);
          break;
        case "RelationInOmit":
          t2.arguments.getDeepField([o2.modelKey, o2.fieldName])?.markAsError(), t2.addErrorMessage(() => 'Relations are already excluded by default and can not be specified in "omit".');
          break;
        case "InvalidFieldValue":
          t2.arguments.getDeepFieldValue([o2.modelKey, o2.fieldName])?.markAsError(), t2.addErrorMessage(() => "Omit field option value must be a boolean.");
          break;
      }
      let { message: n2, args: i2 } = _n(t2, "colorless");
      return `Error validating "omit" option:

${i2}

${n2}`;
    }
    function lu(e2) {
      return e2.length === 0 ? Promise.resolve([]) : new Promise((r2, t2) => {
        let n2 = new Array(e2.length), i2 = null, o2 = false, s2 = 0, a2 = () => {
          o2 || (s2++, s2 === e2.length && (o2 = true, i2 ? t2(i2) : r2(n2)));
        }, l2 = (u2) => {
          o2 || (o2 = true, t2(u2));
        };
        for (let u2 = 0; u2 < e2.length; u2++) e2[u2].then((c2) => {
          n2[u2] = c2, a2();
        }, (c2) => {
          if (!zn(c2)) {
            l2(c2);
            return;
          }
          c2.batchRequestIdx === u2 ? l2(c2) : (i2 || (i2 = c2), a2());
        });
      });
    }
    var rr3 = N3("prisma:client");
    typeof globalThis == "object" && (globalThis.NODE_CLIENT = true);
    var Ff = { requestArgsToMiddlewareArgs: (e2) => e2, middlewareArgsToRequestArgs: (e2) => e2 };
    var Mf = Symbol.for("prisma.client.transaction.id");
    var $f = { id: 0, nextId() {
      return ++this.id;
    } };
    function fu(e2) {
      class r2 {
        _originalClient = this;
        _runtimeDataModel;
        _requestHandler;
        _connectionPromise;
        _disconnectionPromise;
        _engineConfig;
        _accelerateEngineConfig;
        _clientVersion;
        _errorFormat;
        _tracingHelper;
        _previewFeatures;
        _activeProvider;
        _globalOmit;
        _extensions;
        _engine;
        _appliedParent;
        _createPrismaPromise = Ro();
        constructor(n2) {
          e2 = n2?.__internal?.configOverride?.(e2) ?? e2, sl(e2), n2 && au(n2, e2);
          let i2 = new du.EventEmitter().on("error", () => {
          });
          this._extensions = Nr2.empty(), this._previewFeatures = $l(e2), this._clientVersion = e2.clientVersion ?? ru, this._activeProvider = e2.activeProvider, this._globalOmit = n2?.omit, this._tracingHelper = Hl();
          let o2 = e2.relativeEnvPaths && { rootEnvPath: e2.relativeEnvPaths.rootEnvPath && ri.default.resolve(e2.dirname, e2.relativeEnvPaths.rootEnvPath), schemaEnvPath: e2.relativeEnvPaths.schemaEnvPath && ri.default.resolve(e2.dirname, e2.relativeEnvPaths.schemaEnvPath) }, s2;
          if (n2?.adapter) {
            s2 = n2.adapter;
            let l2 = e2.activeProvider === "postgresql" || e2.activeProvider === "cockroachdb" ? "postgres" : e2.activeProvider;
            if (s2.provider !== l2) throw new P3(`The Driver Adapter \`${s2.adapterName}\`, based on \`${s2.provider}\`, is not compatible with the provider \`${l2}\` specified in the Prisma schema.`, this._clientVersion);
            if (n2.datasources || n2.datasourceUrl !== void 0) throw new P3("Custom datasource configuration is not compatible with Prisma Driver Adapters. Please define the database connection string directly in the Driver Adapter configuration.", this._clientVersion);
          }
          let a2 = !s2 && o2 && st(o2, { conflictCheck: "none" }) || e2.injectableEdgeEnv?.();
          try {
            let l2 = n2 ?? {}, u2 = l2.__internal ?? {}, c2 = u2.debug === true;
            c2 && N3.enable("prisma:client");
            let p3 = ri.default.resolve(e2.dirname, e2.relativePath);
            mu.default.existsSync(p3) || (p3 = e2.dirname), rr3("dirname", e2.dirname), rr3("relativePath", e2.relativePath), rr3("cwd", p3);
            let d2 = u2.engine || {};
            if (l2.errorFormat ? this._errorFormat = l2.errorFormat : process.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : process.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = e2.runtimeDataModel, this._engineConfig = { cwd: p3, dirname: e2.dirname, enableDebugLogs: c2, allowTriggerPanic: d2.allowTriggerPanic, prismaPath: d2.binaryPath ?? void 0, engineEndpoint: d2.endpoint, generator: e2.generator, showColors: this._errorFormat === "pretty", logLevel: l2.log && zl(l2.log), logQueries: l2.log && !!(typeof l2.log == "string" ? l2.log === "query" : l2.log.find((f3) => typeof f3 == "string" ? f3 === "query" : f3.level === "query")), env: a2?.parsed ?? {}, flags: [], engineWasm: e2.engineWasm, compilerWasm: e2.compilerWasm, clientVersion: e2.clientVersion, engineVersion: e2.engineVersion, previewFeatures: this._previewFeatures, activeProvider: e2.activeProvider, inlineSchema: e2.inlineSchema, overrideDatasources: al(l2, e2.datasourceNames), inlineDatasources: e2.inlineDatasources, inlineSchemaHash: e2.inlineSchemaHash, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: l2.transactionOptions?.maxWait ?? 2e3, timeout: l2.transactionOptions?.timeout ?? 5e3, isolationLevel: l2.transactionOptions?.isolationLevel }, logEmitter: i2, isBundled: e2.isBundled, adapter: s2 }, this._accelerateEngineConfig = { ...this._engineConfig, accelerateUtils: { resolveDatasourceUrl: jr2, getBatchRequestPayload: Mr2, prismaGraphQLToJSError: $r2, PrismaClientUnknownRequestError: V3, PrismaClientInitializationError: P3, PrismaClientKnownRequestError: z3, debug: N3("prisma:client:accelerateEngine"), engineVersion: cu.version, clientVersion: e2.clientVersion } }, rr3("clientVersion", e2.clientVersion), this._engine = Ml(e2, this._engineConfig), this._requestHandler = new ei(this, i2), l2.log) for (let f3 of l2.log) {
              let h2 = typeof f3 == "string" ? f3 : f3.emit === "stdout" ? f3.level : null;
              h2 && this.$on(h2, (g2) => {
                nt2.log(`${nt2.tags[h2] ?? ""}`, g2.message || g2.query);
              });
            }
          } catch (l2) {
            throw l2.clientVersion = this._clientVersion, l2;
          }
          return this._appliedParent = Pt(this);
        }
        get [Symbol.toStringTag]() {
          return "PrismaClient";
        }
        $on(n2, i2) {
          return n2 === "beforeExit" ? this._engine.onBeforeExit(i2) : n2 && this._engineConfig.logEmitter.on(n2, i2), this;
        }
        $connect() {
          try {
            return this._engine.start();
          } catch (n2) {
            throw n2.clientVersion = this._clientVersion, n2;
          }
        }
        async $disconnect() {
          try {
            await this._engine.stop();
          } catch (n2) {
            throw n2.clientVersion = this._clientVersion, n2;
          } finally {
            Uo();
          }
        }
        $executeRawInternal(n2, i2, o2, s2) {
          let a2 = this._activeProvider;
          return this._request({ action: "executeRaw", args: o2, transaction: n2, clientMethod: i2, argsMapper: So({ clientMethod: i2, activeProvider: a2 }), callsite: Ze3(this._errorFormat), dataPath: [], middlewareArgsMapper: s2 });
        }
        $executeRaw(n2, ...i2) {
          return this._createPrismaPromise((o2) => {
            if (n2.raw !== void 0 || n2.sql !== void 0) {
              let [s2, a2] = uu(n2, i2);
              return To(this._activeProvider, s2.text, s2.values, Array.isArray(n2) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o2, "$executeRaw", s2, a2);
            }
            throw new Z3("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion });
          });
        }
        $executeRawUnsafe(n2, ...i2) {
          return this._createPrismaPromise((o2) => (To(this._activeProvider, n2, i2, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o2, "$executeRawUnsafe", [n2, ...i2])));
        }
        $runCommandRaw(n2) {
          if (e2.activeProvider !== "mongodb") throw new Z3(`The ${e2.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion });
          return this._createPrismaPromise((i2) => this._request({ args: n2, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: ql, callsite: Ze3(this._errorFormat), transaction: i2 }));
        }
        async $queryRawInternal(n2, i2, o2, s2) {
          let a2 = this._activeProvider;
          return this._request({ action: "queryRaw", args: o2, transaction: n2, clientMethod: i2, argsMapper: So({ clientMethod: i2, activeProvider: a2 }), callsite: Ze3(this._errorFormat), dataPath: [], middlewareArgsMapper: s2 });
        }
        $queryRaw(n2, ...i2) {
          return this._createPrismaPromise((o2) => {
            if (n2.raw !== void 0 || n2.sql !== void 0) return this.$queryRawInternal(o2, "$queryRaw", ...uu(n2, i2));
            throw new Z3("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion });
          });
        }
        $queryRawTyped(n2) {
          return this._createPrismaPromise((i2) => {
            if (!this._hasPreviewFlag("typedSql")) throw new Z3("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion });
            return this.$queryRawInternal(i2, "$queryRawTyped", n2);
          });
        }
        $queryRawUnsafe(n2, ...i2) {
          return this._createPrismaPromise((o2) => this.$queryRawInternal(o2, "$queryRawUnsafe", [n2, ...i2]));
        }
        _transactionWithArray({ promises: n2, options: i2 }) {
          let o2 = $f.nextId(), s2 = Yl(n2.length), a2 = n2.map((l2, u2) => {
            if (l2?.[Symbol.toStringTag] !== "PrismaPromise") throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.");
            let c2 = i2?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, p3 = { kind: "batch", id: o2, index: u2, isolationLevel: c2, lock: s2 };
            return l2.requestTransaction?.(p3) ?? l2;
          });
          return lu(a2);
        }
        async _transactionWithCallback({ callback: n2, options: i2 }) {
          let o2 = { traceparent: this._tracingHelper.getTraceParent() }, s2 = { maxWait: i2?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i2?.timeout ?? this._engineConfig.transactionOptions.timeout, isolationLevel: i2?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel }, a2 = await this._engine.transaction("start", o2, s2), l2;
          try {
            let u2 = { kind: "itx", ...a2 };
            l2 = await n2(this._createItxClient(u2)), await this._engine.transaction("commit", o2, a2);
          } catch (u2) {
            throw await this._engine.transaction("rollback", o2, a2).catch(() => {
            }), u2;
          }
          return l2;
        }
        _createItxClient(n2) {
          return he3(Pt(he3(Qa2(this), [re3("_appliedParent", () => this._appliedParent._createItxClient(n2)), re3("_createPrismaPromise", () => Ro(n2)), re3(Mf, () => n2.id)])), [Fr2(Ya2)]);
        }
        $transaction(n2, i2) {
          let o2;
          typeof n2 == "function" ? this._engineConfig.adapter?.adapterName === "@prisma/adapter-d1" ? o2 = () => {
            throw new Error("Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable.");
          } : o2 = () => this._transactionWithCallback({ callback: n2, options: i2 }) : o2 = () => this._transactionWithArray({ promises: n2, options: i2 });
          let s2 = { name: "transaction", attributes: { method: "$transaction" } };
          return this._tracingHelper.runInChildSpan(s2, o2);
        }
        _request(n2) {
          n2.otelParentCtx = this._tracingHelper.getActiveContext();
          let i2 = n2.middlewareArgsMapper ?? Ff, o2 = { args: i2.requestArgsToMiddlewareArgs(n2.args), dataPath: n2.dataPath, runInTransaction: !!n2.transaction, action: n2.action, model: n2.model }, s2 = { operation: { name: "operation", attributes: { method: o2.action, model: o2.model, name: o2.model ? `${o2.model}.${o2.action}` : o2.action } } }, a2 = async (l2) => {
            let { runInTransaction: u2, args: c2, ...p3 } = l2, d2 = { ...n2, ...p3 };
            c2 && (d2.args = i2.middlewareArgsToRequestArgs(c2)), n2.transaction !== void 0 && u2 === false && delete d2.transaction;
            let f3 = await el(this, d2);
            return d2.model ? Ha2({ result: f3, modelName: d2.model, args: d2.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit }) : f3;
          };
          return this._tracingHelper.runInChildSpan(s2.operation, () => new pu.AsyncResource("prisma-client-request").runInAsyncScope(() => a2(o2)));
        }
        async _executeRequest({ args: n2, clientMethod: i2, dataPath: o2, callsite: s2, action: a2, model: l2, argsMapper: u2, transaction: c2, unpacker: p3, otelParentCtx: d2, customDataProxyFetch: f3 }) {
          try {
            n2 = u2 ? u2(n2) : n2;
            let h2 = { name: "serialize" }, g2 = this._tracingHelper.runInChildSpan(h2, () => $n({ modelName: l2, runtimeDataModel: this._runtimeDataModel, action: a2, args: n2, clientMethod: i2, callsite: s2, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
            return N3.enabled("prisma:client") && (rr3("Prisma Client call:"), rr3(`prisma.${i2}(${Na2(n2)})`), rr3("Generated request:"), rr3(JSON.stringify(g2, null, 2) + `
`)), c2?.kind === "batch" && await c2.lock, this._requestHandler.request({ protocolQuery: g2, modelName: l2, action: a2, clientMethod: i2, dataPath: o2, callsite: s2, args: n2, extensions: this._extensions, transaction: c2, unpacker: p3, otelParentCtx: d2, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: f3 });
          } catch (h2) {
            throw h2.clientVersion = this._clientVersion, h2;
          }
        }
        $metrics = new Lr2(this);
        _hasPreviewFlag(n2) {
          return !!this._engineConfig.previewFeatures?.includes(n2);
        }
        $applyPendingMigrations() {
          return this._engine.applyPendingMigrations();
        }
        $extends = Wa2;
      }
      return r2;
    }
    function uu(e2, r2) {
      return qf(e2) ? [new ie3(e2, r2), Wl] : [e2, Jl];
    }
    function qf(e2) {
      return Array.isArray(e2) && Array.isArray(e2.raw);
    }
    var Vf = /* @__PURE__ */ new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
    function gu(e2) {
      return new Proxy(e2, { get(r2, t2) {
        if (t2 in r2) return r2[t2];
        if (!Vf.has(t2)) throw new TypeError(`Invalid enum value: ${String(t2)}`);
      } });
    }
    function hu(e2) {
      st(e2, { conflictCheck: "warn" });
    }
  }
});

// generated/client/index.js
var require_client = __commonJS({
  "generated/client/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var {
      PrismaClientKnownRequestError: PrismaClientKnownRequestError2,
      PrismaClientUnknownRequestError: PrismaClientUnknownRequestError2,
      PrismaClientRustPanicError: PrismaClientRustPanicError2,
      PrismaClientInitializationError: PrismaClientInitializationError2,
      PrismaClientValidationError: PrismaClientValidationError2,
      getPrismaClient: getPrismaClient2,
      sqltag: sqltag2,
      empty: empty2,
      join: join2,
      raw: raw2,
      skip: skip2,
      Decimal: Decimal2,
      Debug: Debug2,
      objectEnumValues: objectEnumValues2,
      makeStrictEnum: makeStrictEnum2,
      Extensions: Extensions2,
      warnOnce: warnOnce2,
      defineDmmfProperty: defineDmmfProperty2,
      Public: Public2,
      getRuntime: getRuntime2,
      createParam: createParam2
    } = require_library();
    var Prisma = {};
    exports2.Prisma = Prisma;
    exports2.$Enums = {};
    Prisma.prismaVersion = {
      client: "6.18.0",
      engine: "34b5a692b7bd79939a9a2c3ef97d816e749cda2f"
    };
    Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError2;
    Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError2;
    Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError2;
    Prisma.PrismaClientInitializationError = PrismaClientInitializationError2;
    Prisma.PrismaClientValidationError = PrismaClientValidationError2;
    Prisma.Decimal = Decimal2;
    Prisma.sql = sqltag2;
    Prisma.empty = empty2;
    Prisma.join = join2;
    Prisma.raw = raw2;
    Prisma.validator = Public2.validator;
    Prisma.getExtensionContext = Extensions2.getExtensionContext;
    Prisma.defineExtension = Extensions2.defineExtension;
    Prisma.DbNull = objectEnumValues2.instances.DbNull;
    Prisma.JsonNull = objectEnumValues2.instances.JsonNull;
    Prisma.AnyNull = objectEnumValues2.instances.AnyNull;
    Prisma.NullTypes = {
      DbNull: objectEnumValues2.classes.DbNull,
      JsonNull: objectEnumValues2.classes.JsonNull,
      AnyNull: objectEnumValues2.classes.AnyNull
    };
    var path = require("path");
    exports2.Prisma.TransactionIsolationLevel = makeStrictEnum2({
      ReadUncommitted: "ReadUncommitted",
      ReadCommitted: "ReadCommitted",
      RepeatableRead: "RepeatableRead",
      Serializable: "Serializable"
    });
    exports2.Prisma.UserScalarFieldEnum = {
      id: "id",
      firstName: "firstName",
      lastName: "lastName",
      email: "email",
      role: "role"
    };
    exports2.Prisma.ArticleScalarFieldEnum = {
      id: "id",
      title: "title",
      content: "content",
      difficulty: "difficulty",
      author: "author",
      publishedAt: "publishedAt",
      createdAt: "createdAt"
    };
    exports2.Prisma.WordsScalarFieldEnum = {
      id: "id",
      word: "word",
      translation: "translation",
      definition: "definition",
      partOfSpeech: "partOfSpeech",
      frequency: "frequency",
      examples: "examples",
      pronunciation: "pronunciation"
    };
    exports2.Prisma.SortOrder = {
      asc: "asc",
      desc: "desc"
    };
    exports2.Prisma.QueryMode = {
      default: "default",
      insensitive: "insensitive"
    };
    exports2.Prisma.NullsOrder = {
      first: "first",
      last: "last"
    };
    exports2.Prisma.ModelName = {
      User: "User",
      Article: "Article",
      Words: "Words"
    };
    var config = {
      "generator": {
        "name": "client",
        "provider": {
          "fromEnvVar": null,
          "value": "prisma-client-js"
        },
        "output": {
          "value": "/Users/rickykiamilev/src/updated-cisc474-web-app/packages/database/generated/client",
          "fromEnvVar": null
        },
        "config": {
          "engineType": "library"
        },
        "binaryTargets": [
          {
            "fromEnvVar": null,
            "value": "darwin-arm64",
            "native": true
          }
        ],
        "previewFeatures": [],
        "sourceFilePath": "/Users/rickykiamilev/src/updated-cisc474-web-app/packages/database/prisma/schema.prisma",
        "isCustomOutput": true
      },
      "relativeEnvPaths": {
        "rootEnvPath": null
      },
      "relativePath": "../../prisma",
      "clientVersion": "6.18.0",
      "engineVersion": "34b5a692b7bd79939a9a2c3ef97d816e749cda2f",
      "datasourceNames": [
        "db"
      ],
      "activeProvider": "postgresql",
      "postinstall": false,
      "inlineDatasources": {
        "db": {
          "url": {
            "fromEnvVar": "DATABASE_URL",
            "value": null
          }
        }
      },
      "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ndatasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n  output   = "../generated/client"\n}\n\nmodel User {\n  id        Int    @id @default(autoincrement())\n  firstName String\n  lastName  String\n  email     String @unique\n  role      String @default("student")\n}\n\nmodel Article {\n  id          Int       @id @default(autoincrement())\n  title       String\n  content     String\n  difficulty  String\n  author      String?\n  publishedAt DateTime  @default(now())\n  createdAt   DateTime?\n}\n\nmodel Words {\n  id            Int      @id @default(autoincrement())\n  word          String   @unique\n  translation   String\n  definition    String\n  partOfSpeech  String\n  frequency     Int\n  examples      String[]\n  pronunciation String\n}\n',
      "inlineSchemaHash": "a930495fe4b33f1396cf88c8a9fb0304f76d75c38aed2024efd4e1d3b3f58828",
      "copyEngine": true
    };
    var fs = require("fs");
    config.dirname = __dirname;
    if (!fs.existsSync(path.join(__dirname, "schema.prisma"))) {
      const alternativePaths = [
        "generated/client",
        "client"
      ];
      const alternativePath = alternativePaths.find((altPath) => {
        return fs.existsSync(path.join(process.cwd(), altPath, "schema.prisma"));
      }) ?? alternativePaths[0];
      config.dirname = path.join(process.cwd(), alternativePath);
      config.isBundled = true;
    }
    config.runtimeDataModel = JSON.parse('{"models":{"User":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"firstName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"lastName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"role","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":"student","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Article":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"content","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"difficulty","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"author","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"publishedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Words":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":{"name":"autoincrement","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"word","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"translation","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"definition","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"partOfSpeech","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"frequency","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"examples","kind":"scalar","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"pronunciation","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false}},"enums":{},"types":{}}');
    defineDmmfProperty2(exports2.Prisma, config.runtimeDataModel);
    config.engineWasm = void 0;
    config.compilerWasm = void 0;
    var { warnEnvConflicts: warnEnvConflicts2 } = require_library();
    warnEnvConflicts2({
      rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
      schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
    });
    var PrismaClient2 = getPrismaClient2(config);
    exports2.PrismaClient = PrismaClient2;
    Object.assign(exports2, Prisma);
    path.join(__dirname, "libquery_engine-darwin-arm64.dylib.node");
    path.join(process.cwd(), "generated/client/libquery_engine-darwin-arm64.dylib.node");
    path.join(__dirname, "schema.prisma");
    path.join(process.cwd(), "generated/client/schema.prisma");
  }
});

// ../../node_modules/@faker-js/faker/dist/chunk-XVH7LZOC.js
var e = [{ name: "Aegean Airlines", iataCode: "A3" }, { name: "Aeroflot", iataCode: "SU" }, { name: "Aerolineas Argentinas", iataCode: "AR" }, { name: "Aeromexico", iataCode: "AM" }, { name: "Air Algerie", iataCode: "AH" }, { name: "Air Arabia", iataCode: "G9" }, { name: "Air Canada", iataCode: "AC" }, { name: "Air China", iataCode: "CA" }, { name: "Air Europa", iataCode: "UX" }, { name: "Air France", iataCode: "AF" }, { name: "Air India", iataCode: "AI" }, { name: "Air Mauritius", iataCode: "MK" }, { name: "Air New Zealand", iataCode: "NZ" }, { name: "Air Niugini", iataCode: "PX" }, { name: "Air Tahiti", iataCode: "VT" }, { name: "Air Tahiti Nui", iataCode: "TN" }, { name: "Air Transat", iataCode: "TS" }, { name: "AirAsia X", iataCode: "D7" }, { name: "AirAsia", iataCode: "AK" }, { name: "Aircalin", iataCode: "SB" }, { name: "Alaska Airlines", iataCode: "AS" }, { name: "Alitalia", iataCode: "AZ" }, { name: "All Nippon Airways", iataCode: "NH" }, { name: "Allegiant Air", iataCode: "G4" }, { name: "American Airlines", iataCode: "AA" }, { name: "Asiana Airlines", iataCode: "OZ" }, { name: "Avianca", iataCode: "AV" }, { name: "Azul Linhas Aereas Brasileiras", iataCode: "AD" }, { name: "Azur Air", iataCode: "ZF" }, { name: "Beijing Capital Airlines", iataCode: "JD" }, { name: "Boliviana de Aviacion", iataCode: "OB" }, { name: "British Airways", iataCode: "BA" }, { name: "Cathay Pacific", iataCode: "CX" }, { name: "Cebu Pacific Air", iataCode: "5J" }, { name: "China Airlines", iataCode: "CI" }, { name: "China Eastern Airlines", iataCode: "MU" }, { name: "China Southern Airlines", iataCode: "CZ" }, { name: "Condor", iataCode: "DE" }, { name: "Copa Airlines", iataCode: "CM" }, { name: "Delta Air Lines", iataCode: "DL" }, { name: "Easyfly", iataCode: "VE" }, { name: "EasyJet", iataCode: "U2" }, { name: "EcoJet", iataCode: "8J" }, { name: "Egyptair", iataCode: "MS" }, { name: "El Al", iataCode: "LY" }, { name: "Emirates Airlines", iataCode: "EK" }, { name: "Ethiopian Airlines", iataCode: "ET" }, { name: "Etihad Airways", iataCode: "EY" }, { name: "EVA Air", iataCode: "BR" }, { name: "Fiji Airways", iataCode: "FJ" }, { name: "Finnair", iataCode: "AY" }, { name: "Flybondi", iataCode: "FO" }, { name: "Flydubai", iataCode: "FZ" }, { name: "FlySafair", iataCode: "FA" }, { name: "Frontier Airlines", iataCode: "F9" }, { name: "Garuda Indonesia", iataCode: "GA" }, { name: "Go First", iataCode: "G8" }, { name: "Gol Linhas Aereas Inteligentes", iataCode: "G3" }, { name: "Hainan Airlines", iataCode: "HU" }, { name: "Hawaiian Airlines", iataCode: "HA" }, { name: "IndiGo Airlines", iataCode: "6E" }, { name: "Japan Airlines", iataCode: "JL" }, { name: "Jeju Air", iataCode: "7C" }, { name: "Jet2", iataCode: "LS" }, { name: "JetBlue Airways", iataCode: "B6" }, { name: "JetSMART", iataCode: "JA" }, { name: "Juneyao Airlines", iataCode: "HO" }, { name: "Kenya Airways", iataCode: "KQ" }, { name: "KLM Royal Dutch Airlines", iataCode: "KL" }, { name: "Korean Air", iataCode: "KE" }, { name: "Kulula.com", iataCode: "MN" }, { name: "LATAM Airlines", iataCode: "LA" }, { name: "Lion Air", iataCode: "JT" }, { name: "LOT Polish Airlines", iataCode: "LO" }, { name: "Lufthansa", iataCode: "LH" }, { name: "Libyan Airlines", iataCode: "LN" }, { name: "Linea Aerea Amaszonas", iataCode: "Z8" }, { name: "Malaysia Airlines", iataCode: "MH" }, { name: "Nordwind Airlines", iataCode: "N4" }, { name: "Norwegian Air Shuttle", iataCode: "DY" }, { name: "Oman Air", iataCode: "WY" }, { name: "Pakistan International Airlines", iataCode: "PK" }, { name: "Pegasus Airlines", iataCode: "PC" }, { name: "Philippine Airlines", iataCode: "PR" }, { name: "Qantas Group", iataCode: "QF" }, { name: "Qatar Airways", iataCode: "QR" }, { name: "Republic Airways", iataCode: "YX" }, { name: "Royal Air Maroc", iataCode: "AT" }, { name: "Ryanair", iataCode: "FR" }, { name: "S7 Airlines", iataCode: "S7" }, { name: "SAS", iataCode: "SK" }, { name: "Satena", iataCode: "9R" }, { name: "Saudia", iataCode: "SV" }, { name: "Shandong Airlines", iataCode: "SC" }, { name: "Sichuan Airlines", iataCode: "3U" }, { name: "Singapore Airlines", iataCode: "SQ" }, { name: "Sky Airline", iataCode: "H2" }, { name: "SkyWest Airlines", iataCode: "OO" }, { name: "South African Airways", iataCode: "SA" }, { name: "Southwest Airlines", iataCode: "WN" }, { name: "SpiceJet", iataCode: "SG" }, { name: "Spirit Airlines", iataCode: "NK" }, { name: "Spring Airlines", iataCode: "9C" }, { name: "SriLankan Airlines", iataCode: "UL" }, { name: "Star Peru", iataCode: "2I" }, { name: "Sun Country Airlines", iataCode: "SY" }, { name: "SunExpress", iataCode: "XQ" }, { name: "TAP Air Portugal", iataCode: "TP" }, { name: "Thai AirAsia", iataCode: "FD" }, { name: "Thai Airways", iataCode: "TG" }, { name: "TUI Airways", iataCode: "BY" }, { name: "Tunisair", iataCode: "TU" }, { name: "Turkish Airlines", iataCode: "TK" }, { name: "Ukraine International", iataCode: "PS" }, { name: "United Airlines", iataCode: "UA" }, { name: "Ural Airlines", iataCode: "U6" }, { name: "VietJet Air", iataCode: "VJ" }, { name: "Vietnam Airlines", iataCode: "VN" }, { name: "Virgin Atlantic Airways", iataCode: "VS" }, { name: "Virgin Australia", iataCode: "VA" }, { name: "VivaAerobus", iataCode: "VB" }, { name: "VOEPASS Linhas Aereas", iataCode: "2Z" }, { name: "Volaris", iataCode: "Y4" }, { name: "WestJet", iataCode: "WS" }, { name: "Wingo", iataCode: "P5" }, { name: "Wizz Air", iataCode: "W6" }];
var a = [{ name: "Aerospatiale/BAC Concorde", iataTypeCode: "SSC" }, { name: "Airbus A300", iataTypeCode: "AB3" }, { name: "Airbus A310", iataTypeCode: "310" }, { name: "Airbus A310-200", iataTypeCode: "312" }, { name: "Airbus A310-300", iataTypeCode: "313" }, { name: "Airbus A318", iataTypeCode: "318" }, { name: "Airbus A319", iataTypeCode: "319" }, { name: "Airbus A319neo", iataTypeCode: "31N" }, { name: "Airbus A320", iataTypeCode: "320" }, { name: "Airbus A320neo", iataTypeCode: "32N" }, { name: "Airbus A321", iataTypeCode: "321" }, { name: "Airbus A321neo", iataTypeCode: "32Q" }, { name: "Airbus A330", iataTypeCode: "330" }, { name: "Airbus A330-200", iataTypeCode: "332" }, { name: "Airbus A330-300", iataTypeCode: "333" }, { name: "Airbus A330-800neo", iataTypeCode: "338" }, { name: "Airbus A330-900neo", iataTypeCode: "339" }, { name: "Airbus A340", iataTypeCode: "340" }, { name: "Airbus A340-200", iataTypeCode: "342" }, { name: "Airbus A340-300", iataTypeCode: "343" }, { name: "Airbus A340-500", iataTypeCode: "345" }, { name: "Airbus A340-600", iataTypeCode: "346" }, { name: "Airbus A350", iataTypeCode: "350" }, { name: "Airbus A350-900", iataTypeCode: "359" }, { name: "Airbus A350-1000", iataTypeCode: "351" }, { name: "Airbus A380", iataTypeCode: "380" }, { name: "Airbus A380-800", iataTypeCode: "388" }, { name: "Antonov An-12", iataTypeCode: "ANF" }, { name: "Antonov An-24", iataTypeCode: "AN4" }, { name: "Antonov An-26", iataTypeCode: "A26" }, { name: "Antonov An-28", iataTypeCode: "A28" }, { name: "Antonov An-30", iataTypeCode: "A30" }, { name: "Antonov An-32", iataTypeCode: "A32" }, { name: "Antonov An-72", iataTypeCode: "AN7" }, { name: "Antonov An-124 Ruslan", iataTypeCode: "A4F" }, { name: "Antonov An-140", iataTypeCode: "A40" }, { name: "Antonov An-148", iataTypeCode: "A81" }, { name: "Antonov An-158", iataTypeCode: "A58" }, { name: "Antonov An-225 Mriya", iataTypeCode: "A5F" }, { name: "Boeing 707", iataTypeCode: "703" }, { name: "Boeing 717", iataTypeCode: "717" }, { name: "Boeing 720B", iataTypeCode: "B72" }, { name: "Boeing 727", iataTypeCode: "727" }, { name: "Boeing 727-100", iataTypeCode: "721" }, { name: "Boeing 727-200", iataTypeCode: "722" }, { name: "Boeing 737 MAX 7", iataTypeCode: "7M7" }, { name: "Boeing 737 MAX 8", iataTypeCode: "7M8" }, { name: "Boeing 737 MAX 9", iataTypeCode: "7M9" }, { name: "Boeing 737 MAX 10", iataTypeCode: "7MJ" }, { name: "Boeing 737", iataTypeCode: "737" }, { name: "Boeing 737-100", iataTypeCode: "731" }, { name: "Boeing 737-200", iataTypeCode: "732" }, { name: "Boeing 737-300", iataTypeCode: "733" }, { name: "Boeing 737-400", iataTypeCode: "734" }, { name: "Boeing 737-500", iataTypeCode: "735" }, { name: "Boeing 737-600", iataTypeCode: "736" }, { name: "Boeing 737-700", iataTypeCode: "73G" }, { name: "Boeing 737-800", iataTypeCode: "738" }, { name: "Boeing 737-900", iataTypeCode: "739" }, { name: "Boeing 747", iataTypeCode: "747" }, { name: "Boeing 747-100", iataTypeCode: "741" }, { name: "Boeing 747-200", iataTypeCode: "742" }, { name: "Boeing 747-300", iataTypeCode: "743" }, { name: "Boeing 747-400", iataTypeCode: "744" }, { name: "Boeing 747-400D", iataTypeCode: "74J" }, { name: "Boeing 747-8", iataTypeCode: "748" }, { name: "Boeing 747SP", iataTypeCode: "74L" }, { name: "Boeing 747SR", iataTypeCode: "74R" }, { name: "Boeing 757", iataTypeCode: "757" }, { name: "Boeing 757-200", iataTypeCode: "752" }, { name: "Boeing 757-300", iataTypeCode: "753" }, { name: "Boeing 767", iataTypeCode: "767" }, { name: "Boeing 767-200", iataTypeCode: "762" }, { name: "Boeing 767-300", iataTypeCode: "763" }, { name: "Boeing 767-400", iataTypeCode: "764" }, { name: "Boeing 777", iataTypeCode: "777" }, { name: "Boeing 777-200", iataTypeCode: "772" }, { name: "Boeing 777-200LR", iataTypeCode: "77L" }, { name: "Boeing 777-300", iataTypeCode: "773" }, { name: "Boeing 777-300ER", iataTypeCode: "77W" }, { name: "Boeing 787", iataTypeCode: "787" }, { name: "Boeing 787-8", iataTypeCode: "788" }, { name: "Boeing 787-9", iataTypeCode: "789" }, { name: "Boeing 787-10", iataTypeCode: "781" }, { name: "Canadair Challenger", iataTypeCode: "CCJ" }, { name: "Canadair CL-44", iataTypeCode: "CL4" }, { name: "Canadair Regional Jet 100", iataTypeCode: "CR1" }, { name: "Canadair Regional Jet 200", iataTypeCode: "CR2" }, { name: "Canadair Regional Jet 700", iataTypeCode: "CR7" }, { name: "Canadair Regional Jet 705", iataTypeCode: "CRA" }, { name: "Canadair Regional Jet 900", iataTypeCode: "CR9" }, { name: "Canadair Regional Jet 1000", iataTypeCode: "CRK" }, { name: "De Havilland Canada DHC-2 Beaver", iataTypeCode: "DHP" }, { name: "De Havilland Canada DHC-2 Turbo-Beaver", iataTypeCode: "DHR" }, { name: "De Havilland Canada DHC-3 Otter", iataTypeCode: "DHL" }, { name: "De Havilland Canada DHC-4 Caribou", iataTypeCode: "DHC" }, { name: "De Havilland Canada DHC-6 Twin Otter", iataTypeCode: "DHT" }, { name: "De Havilland Canada DHC-7 Dash 7", iataTypeCode: "DH7" }, { name: "De Havilland Canada DHC-8-100 Dash 8 / 8Q", iataTypeCode: "DH1" }, { name: "De Havilland Canada DHC-8-200 Dash 8 / 8Q", iataTypeCode: "DH2" }, { name: "De Havilland Canada DHC-8-300 Dash 8 / 8Q", iataTypeCode: "DH3" }, { name: "De Havilland Canada DHC-8-400 Dash 8Q", iataTypeCode: "DH4" }, { name: "De Havilland DH.104 Dove", iataTypeCode: "DHD" }, { name: "De Havilland DH.114 Heron", iataTypeCode: "DHH" }, { name: "Douglas DC-3", iataTypeCode: "D3F" }, { name: "Douglas DC-6", iataTypeCode: "D6F" }, { name: "Douglas DC-8-50", iataTypeCode: "D8T" }, { name: "Douglas DC-8-62", iataTypeCode: "D8L" }, { name: "Douglas DC-8-72", iataTypeCode: "D8Q" }, { name: "Douglas DC-9-10", iataTypeCode: "D91" }, { name: "Douglas DC-9-20", iataTypeCode: "D92" }, { name: "Douglas DC-9-30", iataTypeCode: "D93" }, { name: "Douglas DC-9-40", iataTypeCode: "D94" }, { name: "Douglas DC-9-50", iataTypeCode: "D95" }, { name: "Douglas DC-10", iataTypeCode: "D10" }, { name: "Douglas DC-10-10", iataTypeCode: "D1X" }, { name: "Douglas DC-10-30", iataTypeCode: "D1Y" }, { name: "Embraer 170", iataTypeCode: "E70" }, { name: "Embraer 175", iataTypeCode: "E75" }, { name: "Embraer 190", iataTypeCode: "E90" }, { name: "Embraer 195", iataTypeCode: "E95" }, { name: "Embraer E190-E2", iataTypeCode: "290" }, { name: "Embraer E195-E2", iataTypeCode: "295" }, { name: "Embraer EMB.110 Bandeirante", iataTypeCode: "EMB" }, { name: "Embraer EMB.120 Brasilia", iataTypeCode: "EM2" }, { name: "Embraer Legacy 600", iataTypeCode: "ER3" }, { name: "Embraer Phenom 100", iataTypeCode: "EP1" }, { name: "Embraer Phenom 300", iataTypeCode: "EP3" }, { name: "Embraer RJ135", iataTypeCode: "ER3" }, { name: "Embraer RJ140", iataTypeCode: "ERD" }, { name: "Embraer RJ145 Amazon", iataTypeCode: "ER4" }, { name: "Ilyushin IL18", iataTypeCode: "IL8" }, { name: "Ilyushin IL62", iataTypeCode: "IL6" }, { name: "Ilyushin IL76", iataTypeCode: "IL7" }, { name: "Ilyushin IL86", iataTypeCode: "ILW" }, { name: "Ilyushin IL96-300", iataTypeCode: "I93" }, { name: "Ilyushin IL114", iataTypeCode: "I14" }, { name: "Lockheed L-182 / 282 / 382 (L-100) Hercules", iataTypeCode: "LOH" }, { name: "Lockheed L-188 Electra", iataTypeCode: "LOE" }, { name: "Lockheed L-1011 Tristar", iataTypeCode: "L10" }, { name: "Lockheed L-1049 Super Constellation", iataTypeCode: "L49" }, { name: "McDonnell Douglas MD11", iataTypeCode: "M11" }, { name: "McDonnell Douglas MD80", iataTypeCode: "M80" }, { name: "McDonnell Douglas MD81", iataTypeCode: "M81" }, { name: "McDonnell Douglas MD82", iataTypeCode: "M82" }, { name: "McDonnell Douglas MD83", iataTypeCode: "M83" }, { name: "McDonnell Douglas MD87", iataTypeCode: "M87" }, { name: "McDonnell Douglas MD88", iataTypeCode: "M88" }, { name: "McDonnell Douglas MD90", iataTypeCode: "M90" }, { name: "Sukhoi Superjet 100-95", iataTypeCode: "SU9" }, { name: "Tupolev Tu-134", iataTypeCode: "TU3" }, { name: "Tupolev Tu-154", iataTypeCode: "TU5" }, { name: "Tupolev Tu-204", iataTypeCode: "T20" }, { name: "Yakovlev Yak-40", iataTypeCode: "YK4" }, { name: "Yakovlev Yak-42", iataTypeCode: "YK2" }];
var r = [{ name: "Adelaide International Airport", iataCode: "ADL" }, { name: "Adolfo Suarez Madrid-Barajas Airport", iataCode: "MAD" }, { name: "Aeroparque Jorge Newbery Airport", iataCode: "AEP" }, { name: "Afonso Pena International Airport", iataCode: "CWB" }, { name: "Alfonso Bonilla Aragon International Airport", iataCode: "CLO" }, { name: "Amsterdam Airport Schiphol", iataCode: "AMS" }, { name: "Arturo Merino Benitez International Airport", iataCode: "SCL" }, { name: "Auckland International Airport", iataCode: "AKL" }, { name: "Beijing Capital International Airport", iataCode: "PEK" }, { name: "Belem Val de Cans International Airport", iataCode: "BEL" }, { name: "Belo Horizonte Tancredo Neves International Airport", iataCode: "CNF" }, { name: "Berlin-Tegel Airport", iataCode: "TXL" }, { name: "Bole International Airport", iataCode: "ADD" }, { name: "Brasilia-Presidente Juscelino Kubitschek International Airport", iataCode: "BSB" }, { name: "Brisbane International Airport", iataCode: "BNE" }, { name: "Brussels Airport", iataCode: "BRU" }, { name: "Cairns Airport", iataCode: "CNS" }, { name: "Cairo International Airport", iataCode: "CAI" }, { name: "Canberra Airport", iataCode: "CBR" }, { name: "Capetown International Airport", iataCode: "CPT" }, { name: "Charles de Gaulle International Airport", iataCode: "CDG" }, { name: "Charlotte Douglas International Airport", iataCode: "CLT" }, { name: "Chengdu Shuangliu International Airport", iataCode: "CTU" }, { name: "Chhatrapati Shivaji International Airport", iataCode: "BOM" }, { name: "Chicago O'Hare International Airport", iataCode: "ORD" }, { name: "Chongqing Jiangbei International Airport", iataCode: "CKG" }, { name: "Christchurch International Airport", iataCode: "CHC" }, { name: "Copenhagen Kastrup Airport", iataCode: "CPH" }, { name: "Dallas Fort Worth International Airport", iataCode: "DFW" }, { name: "Daniel K. Inouye International Airport", iataCode: "HNL" }, { name: "Denver International Airport", iataCode: "DEN" }, { name: "Don Mueang International Airport", iataCode: "DMK" }, { name: "Dubai International Airport", iataCode: "DXB" }, { name: "Dublin Airport", iataCode: "DUB" }, { name: "Dusseldorf Airport", iataCode: "DUS" }, { name: "El Dorado International Airport", iataCode: "BOG" }, { name: "Eleftherios Venizelos International Airport", iataCode: "ATH" }, { name: "Faa'a International Airport", iataCode: "PPT" }, { name: "Fort Lauderdale Hollywood International Airport", iataCode: "FLL" }, { name: "Fortaleza Pinto Martins International Airport", iataCode: "FOR" }, { name: "Frankfurt am Main Airport", iataCode: "FRA" }, { name: "George Bush Intercontinental Houston Airport", iataCode: "IAH" }, { name: "Gold Coast Airport", iataCode: "OOL" }, { name: "Guarulhos - Governador Andre Franco Montoro International Airport", iataCode: "GRU" }, { name: "Hartsfield-Jackson Atlanta International Airport", iataCode: "ATL" }, { name: "Helsinki Vantaa Airport", iataCode: "HEL" }, { name: "Hobart International Airport", iataCode: "HBA" }, { name: "Hong Kong International Airport", iataCode: "HKG" }, { name: "Houari Boumediene Airport", iataCode: "ALG" }, { name: "Hurgada International Airport", iataCode: "HRG" }, { name: "Incheon International Airport", iataCode: "ICN" }, { name: "Indira Gandhi International Airport", iataCode: "DEL" }, { name: "Istanbul Airport", iataCode: "IST" }, { name: "Jacksons International Airport", iataCode: "POM" }, { name: "Jeju International Airport", iataCode: "CJU" }, { name: "John F Kennedy International Airport", iataCode: "JFK" }, { name: "Jorge Chavez International Airport", iataCode: "LIM" }, { name: "Jose Maria Cordova International Airport", iataCode: "MDE" }, { name: "Josep Tarradellas Barcelona-El Prat Airport", iataCode: "BCN" }, { name: "Kahului Airport", iataCode: "OGG" }, { name: "King Abdulaziz International Airport", iataCode: "JED" }, { name: "Kuala Lumpur International Airport", iataCode: "KUL" }, { name: "Kunming Changshui International Airport", iataCode: "KMG" }, { name: "La Tontouta International Airport", iataCode: "NOU" }, { name: "Leonardo da Vinci-Fiumicino Airport", iataCode: "FCO" }, { name: "London Heathrow Airport", iataCode: "LHR" }, { name: "Los Angeles International Airport", iataCode: "LAX" }, { name: "McCarran International Airport", iataCode: "LAS" }, { name: "Melbourne International Airport", iataCode: "MEL" }, { name: "Mexico City International Airport", iataCode: "MEX" }, { name: "Miami International Airport", iataCode: "MIA" }, { name: "Ministro Pistarini International Airport", iataCode: "EZE" }, { name: "Minneapolis-St Paul International/Wold-Chamberlain Airport", iataCode: "MSP" }, { name: "Mohammed V International Airport", iataCode: "CMN" }, { name: "Moscow Domodedovo Airport", iataCode: "DME" }, { name: "Munich Airport", iataCode: "MUC" }, { name: "Murtala Muhammed International Airport", iataCode: "LOS" }, { name: "Nadi International Airport", iataCode: "NAN" }, { name: "Nairobi Jomo Kenyatta International Airport", iataCode: "NBO" }, { name: "Narita International Airport", iataCode: "NRT" }, { name: "Newark Liberty International Airport", iataCode: "EWR" }, { name: "Ninoy Aquino International Airport", iataCode: "MNL" }, { name: "Noumea Magenta Airport", iataCode: "GEA" }, { name: "O. R. Tambo International Airport", iataCode: "JNB" }, { name: "Orlando International Airport", iataCode: "MCO" }, { name: "Oslo Lufthavn", iataCode: "OSL" }, { name: "Perth Airport", iataCode: "PER" }, { name: "Phoenix Sky Harbor International Airport", iataCode: "PHX" }, { name: "Recife Guararapes-Gilberto Freyre International Airport", iataCode: "REC" }, { name: "Rio de Janeiro Galeao International Airport", iataCode: "GIG" }, { name: "Salgado Filho International Airport", iataCode: "POA" }, { name: "Salvador Deputado Luis Eduardo Magalhaes International Airport", iataCode: "SSA" }, { name: "San Francisco International Airport", iataCode: "SFO" }, { name: "Santos Dumont Airport", iataCode: "SDU" }, { name: "Sao Paulo-Congonhas Airport", iataCode: "CGH" }, { name: "Seattle Tacoma International Airport", iataCode: "SEA" }, { name: "Shanghai Hongqiao International Airport", iataCode: "SHA" }, { name: "Shanghai Pudong International Airport", iataCode: "PVG" }, { name: "Shenzhen Bao'an International Airport", iataCode: "SZX" }, { name: "Sheremetyevo International Airport", iataCode: "SVO" }, { name: "Singapore Changi Airport", iataCode: "SIN" }, { name: "Soekarno-Hatta International Airport", iataCode: "CGK" }, { name: 'Stockholm-Arlanda Airport"', iataCode: "ARN" }, { name: "Suvarnabhumi Airport", iataCode: "BKK" }, { name: "Sydney Kingsford Smith International Airport", iataCode: "SYD" }, { name: "Taiwan Taoyuan International Airport", iataCode: "TPE" }, { name: "Tan Son Nhat International Airport", iataCode: "SGN" }, { name: "Tokyo Haneda International Airport", iataCode: "HND" }, { name: "Toronto Pearson International Airport", iataCode: "YYZ" }, { name: "Tunis Carthage International Airport", iataCode: "TUN" }, { name: "Vancouver International Airport", iataCode: "YVR" }, { name: "Vienna International Airport", iataCode: "VIE" }, { name: "Viracopos International Airport", iataCode: "VCP" }, { name: "Vnukovo International Airport", iataCode: "VKO" }, { name: "Wellington International Airport", iataCode: "WLG" }, { name: "Xi'an Xianyang International Airport", iataCode: "XIY" }, { name: "Zhukovsky International Airport", iataCode: "ZIA" }, { name: "Zurich Airport", iataCode: "ZRH" }];
var Za = { airline: e, airplane: a, airport: r };
var o = Za;
var n = ["American black bear", "Asian black bear", "Brown bear", "Giant panda", "Polar bear", "Sloth bear", "Spectacled bear", "Sun bear"];
var i = ["Abert's Towhee", "Acadian Flycatcher", "Acorn Woodpecker", "Alder Flycatcher", "Aleutian Tern", "Allen's Hummingbird", "Altamira Oriole", "American Avocet", "American Bittern", "American Black Duck", "American Coot", "American Crow", "American Dipper", "American Golden-Plover", "American Goldfinch", "American Kestrel", "American Oystercatcher", "American Pipit", "American Redstart", "American Robin", "American Tree Sparrow", "American White Pelican", "American Wigeon", "American Woodcock", "Ancient Murrelet", "Anhinga", "Anna's Hummingbird", "Antillean Nighthawk", "Antillean Palm Swift", "Aplomado Falcon", "Arctic Loon", "Arctic Tern", "Arctic Warbler", "Ash-throated Flycatcher", "Ashy Storm-Petrel", "Asian Brown Flycatcher", "Atlantic Puffin", "Audubon's Oriole", "Audubon's Shearwater", "Aztec Thrush", "Azure Gallinule", "Bachman's Sparrow", "Bachman's Warbler", "Bahama Mockingbird", "Bahama Swallow", "Bahama Woodstar", "Baikal Teal", "Baird's Sandpiper", "Baird's Sparrow", "Bald Eagle", "Baltimore Oriole", "Bananaquit", "Band-rumped Storm-Petrel", "Band-tailed Gull", "Band-tailed Pigeon", "Bank Swallow", "Bar-tailed Godwit", "Barn Owl", "Barn Swallow", "Barnacle Goose", "Barred Owl", "Barrow's Goldeneye", "Bay-breasted Warbler", "Bean Goose", "Bell's Vireo", "Belted Kingfisher", "Bendire's Thrasher", "Berylline Hummingbird", "Bewick's Wren", "Bicknell's Thrush", "Black Catbird", "Black Guillemot", "Black Noddy", "Black Oystercatcher", "Black Phoebe", "Black Rail", "Black Rosy-Finch", "Black Scoter", "Black Skimmer", "Black Storm-Petrel", "Black Swift", "Black Tern", "Black Turnstone", "Black Vulture", "Black-and-white Warbler", "Black-backed Wagtail", "Black-backed Woodpecker", "Black-bellied Plover", "Black-bellied Whistling-Duck", "Black-billed Cuckoo", "Black-billed Magpie", "Black-browed Albatross", "Black-capped Chickadee", "Black-capped Gnatcatcher", "Black-capped Petrel", "Black-capped Vireo", "Black-chinned Hummingbird", "Black-chinned Sparrow", "Black-crowned Night-Heron", "Black-faced Grassquit", "Black-footed Albatross", "Black-headed Grosbeak", "Black-headed Gull", "Black-legged Kittiwake", "Black-necked Stilt", "Black-tailed Gnatcatcher", "Black-tailed Godwit", "Black-tailed Gull", "Black-throated Blue Warbler", "Black-throated Gray Warbler", "Black-throated Green Warbler", "Black-throated Sparrow", "Black-vented Oriole", "Black-vented Shearwater", "Black-whiskered Vireo", "Black-winged Stilt", "Blackburnian Warbler", "Blackpoll Warbler", "Blue Bunting", "Blue Grosbeak", "Blue Grouse", "Blue Jay", "Blue Mockingbird", "Blue-footed Booby", "Blue-gray Gnatcatcher", "Blue-headed Vireo", "Blue-throated Hummingbird", "Blue-winged Teal", "Blue-winged Warbler", "Bluethroat", "Boat-tailed Grackle", "Bobolink", "Bohemian Waxwing", "Bonaparte's Gull", "Boreal Chickadee", "Boreal Owl", "Botteri's Sparrow", "Brambling", "Brandt's Cormorant", "Brant", "Brewer's Blackbird", "Brewer's Sparrow", "Bridled Tern", "Bridled Titmouse", "Bristle-thighed Curlew", "Broad-billed Hummingbird", "Broad-billed Sandpiper", "Broad-tailed Hummingbird", "Broad-winged Hawk", "Bronzed Cowbird", "Brown Booby", "Brown Creeper", "Brown Jay", "Brown Noddy", "Brown Pelican", "Brown Shrike", "Brown Thrasher", "Brown-capped Rosy-Finch", "Brown-chested Martin", "Brown-crested Flycatcher", "Brown-headed Cowbird", "Brown-headed Nuthatch", "Budgerigar", "Buff-bellied Hummingbird", "Buff-breasted Flycatcher", "Buff-breasted Sandpiper", "Buff-collared Nightjar", "Bufflehead", "Buller's Shearwater", "Bullock's Oriole", "Bumblebee Hummingbird", "Burrowing Owl", "Bushtit", "Cactus Wren", "California Condor", "California Gnatcatcher", "California Gull", "California Quail", "California Thrasher", "California Towhee", "Calliope Hummingbird", "Canada Goose", "Canada Warbler", "Canvasback", "Canyon Towhee", "Canyon Wren", "Cape May Warbler", "Caribbean Elaenia", "Carolina Chickadee", "Carolina Parakeet", "Carolina Wren", "Caspian Tern", "Cassin's Auklet", "Cassin's Finch", "Cassin's Kingbird", "Cassin's Sparrow", "Cassin's Vireo", "Cattle Egret", "Cave Swallow", "Cedar Waxwing", "Cerulean Warbler", "Chestnut-backed Chickadee", "Chestnut-collared Longspur", "Chestnut-sided Warbler", "Chihuahuan Raven", "Chimney Swift", "Chinese Egret", "Chipping Sparrow", "Chuck-will's-widow", "Chukar", "Cinnamon Hummingbird", "Cinnamon Teal", "Citrine Wagtail", "Clapper Rail", "Clark's Grebe", "Clark's Nutcracker", "Clay-colored Robin", "Clay-colored Sparrow", "Cliff Swallow", "Colima Warbler", "Collared Forest-Falcon", "Collared Plover", "Common Black-Hawk", "Common Chaffinch", "Common Crane", "Common Cuckoo", "Common Eider", "Common Goldeneye", "Common Grackle", "Common Greenshank", "Common Ground-Dove", "Common House-Martin", "Common Loon", "Common Merganser", "Common Moorhen", "Common Murre", "Common Nighthawk", "Common Pauraque", "Common Pochard", "Common Poorwill", "Common Raven", "Common Redpoll", "Common Ringed Plover", "Common Rosefinch", "Common Sandpiper", "Common Snipe", "Common Swift", "Common Tern", "Common Yellowthroat", "Connecticut Warbler", "Cook's Petrel", "Cooper's Hawk", "Cordilleran Flycatcher", "Corn Crake", "Cory's Shearwater", "Costa's Hummingbird", "Couch's Kingbird", "Crane Hawk", "Craveri's Murrelet", "Crescent-chested Warbler", "Crested Auklet", "Crested Caracara", "Crested Myna", "Crimson-collared Grosbeak", "Crissal Thrasher", "Cuban Martin", "Curlew Sandpiper", "Curve-billed Thrasher", "Dark-eyed Junco", "Dickcissel", "Double-crested Cormorant", "Double-striped Thick-knee", "Dovekie", "Downy Woodpecker", "Dunlin", "Dusky Flycatcher", "Dusky Thrush", "Dusky Warbler", "Dusky-capped Flycatcher", "Eared Grebe", "Eared Trogon", "Eastern Bluebird", "Eastern Kingbird", "Eastern Meadowlark", "Eastern Phoebe", "Eastern Screech-Owl", "Eastern Towhee", "Eastern Wood-Pewee", "Elegant Tern", "Elegant Trogon", "Elf Owl", "Emperor Goose", "Eskimo Curlew", "Eurasian Blackbird", "Eurasian Bullfinch", "Eurasian Collared-Dove", "Eurasian Coot", "Eurasian Curlew", "Eurasian Dotterel", "Eurasian Hobby", "Eurasian Jackdaw", "Eurasian Kestrel", "Eurasian Oystercatcher", "Eurasian Siskin", "Eurasian Tree Sparrow", "Eurasian Wigeon", "Eurasian Woodcock", "Eurasian Wryneck", "European Golden-Plover", "European Starling", "European Storm-Petrel", "European Turtle-Dove", "Evening Grosbeak", "Eyebrowed Thrush", "Falcated Duck", "Fan-tailed Warbler", "Far Eastern Curlew", "Ferruginous Hawk", "Ferruginous Pygmy-Owl", "Field Sparrow", "Fieldfare", "Fish Crow", "Five-striped Sparrow", "Flame-colored Tanager", "Flammulated Owl", "Flesh-footed Shearwater", "Florida Scrub-Jay", "Fork-tailed Flycatcher", "Fork-tailed Storm-Petrel", "Fork-tailed Swift", "Forster's Tern", "Fox Sparrow", "Franklin's Gull", "Fulvous Whistling-Duck", "Gadwall", "Gambel's Quail", "Garganey", "Gila Woodpecker", "Gilded Flicker", "Glaucous Gull", "Glaucous-winged Gull", "Glossy Ibis", "Golden Eagle", "Golden-cheeked Warbler", "Golden-crowned Kinglet", "Golden-crowned Sparrow", "Golden-crowned Warbler", "Golden-fronted Woodpecker", "Golden-winged Warbler", "Grace's Warbler", "Grasshopper Sparrow", "Gray Bunting", "Gray Catbird", "Gray Flycatcher", "Gray Hawk", "Gray Jay", "Gray Kingbird", "Gray Partridge", "Gray Silky-flycatcher", "Gray Vireo", "Gray Wagtail", "Gray-breasted Martin", "Gray-cheeked Thrush", "Gray-crowned Rosy-Finch", "Gray-crowned Yellowthroat", "Gray-headed Chickadee", "Gray-spotted Flycatcher", "Gray-tailed Tattler", "Great Auk", "Great Black-backed Gull", "Great Blue Heron", "Great Cormorant", "Great Crested Flycatcher", "Great Egret", "Great Frigatebird", "Great Gray Owl", "Great Horned Owl", "Great Kiskadee", "Great Knot", "Great Skua", "Great Spotted Woodpecker", "Great-tailed Grackle", "Greater Flamingo", "Greater Pewee", "Greater Prairie-chicken", "Greater Roadrunner", "Greater Scaup", "Greater Shearwater", "Greater White-fronted Goose", "Greater Yellowlegs", "Green Heron", "Green Jay", "Green Kingfisher", "Green Sandpiper", "Green Violet-ear", "Green-breasted Mango", "Green-tailed Towhee", "Green-winged Teal", "Greenish Elaenia", "Groove-billed Ani", "Gull-billed Tern", "Gyrfalcon", "Hairy Woodpecker", "Hammond's Flycatcher", "Harlequin Duck", "Harris's Hawk", "Harris's Sparrow", "Hawfinch", "Heermann's Gull", "Henslow's Sparrow", "Hepatic Tanager", "Herald Petrel", "Hermit Thrush", "Hermit Warbler", "Herring Gull", "Himalayan Snowcock", "Hoary Redpoll", "Hooded Merganser", "Hooded Oriole", "Hooded Warbler", "Hook-billed Kite", "Hoopoe", "Horned Grebe", "Horned Lark", "Horned Puffin", "House Finch", "House Sparrow", "House Wren", "Hudsonian Godwit", "Hutton's Vireo", "Iceland Gull", "Inca Dove", "Indigo Bunting", "Island Scrub-Jay", "Ivory Gull", "Ivory-billed Woodpecker", "Jabiru", "Jack Snipe", "Jungle Nightjar", "Juniper Titmouse", "Kentucky Warbler", "Key West Quail-Dove", "Killdeer", "King Eider", "King Rail", "Kirtland's Warbler", "Kittlitz's Murrelet", "La Sagra's Flycatcher", "Labrador Duck", "Ladder-backed Woodpecker", "Lanceolated Warbler", "Lapland Longspur", "Large-billed Tern", "Lark Bunting", "Lark Sparrow", "Laughing Gull", "Lawrence's Goldfinch", "Laysan Albatross", "Lazuli Bunting", "Le Conte's Sparrow", "Le Conte's Thrasher", "Leach's Storm-Petrel", "Least Auklet", "Least Bittern", "Least Flycatcher", "Least Grebe", "Least Sandpiper", "Least Storm-Petrel", "Least Tern", "Lesser Black-backed Gull", "Lesser Frigatebird", "Lesser Goldfinch", "Lesser Nighthawk", "Lesser Prairie-chicken", "Lesser Scaup", "Lesser White-fronted Goose", "Lesser Yellowlegs", "Lewis's Woodpecker", "Limpkin", "Lincoln's Sparrow", "Little Blue Heron", "Little Bunting", "Little Curlew", "Little Egret", "Little Gull", "Little Ringed Plover", "Little Shearwater", "Little Stint", "Loggerhead Kingbird", "Loggerhead Shrike", "Long-billed Curlew", "Long-billed Dowitcher", "Long-billed Murrelet", "Long-billed Thrasher", "Long-eared Owl", "Long-tailed Jaeger", "Long-toed Stint", "Louisiana Waterthrush", "Lucifer Hummingbird", "Lucy's Warbler", "MacGillivray's Warbler", "Magnificent Frigatebird", "Magnificent Hummingbird", "Magnolia Warbler", "Mallard", "Mangrove Cuckoo", "Manx Shearwater", "Marbled Godwit", "Marbled Murrelet", "Marsh Sandpiper", "Marsh Wren", "Masked Booby", "Masked Duck", "Masked Tityra", "McCown's Longspur", "McKay's Bunting", "Merlin", "Mew Gull", "Mexican Chickadee", "Mexican Jay", "Middendorff's Grasshopper-Warbler", "Mississippi Kite", "Mongolian Plover", "Monk Parakeet", "Montezuma Quail", "Mottled Duck", "Mottled Owl", "Mottled Petrel", "Mountain Bluebird", "Mountain Chickadee", "Mountain Plover", "Mountain Quail", "Mourning Dove", "Mourning Warbler", "Mugimaki Flycatcher", "Murphy's Petrel", "Muscovy Duck", "Mute Swan", "Narcissus Flycatcher", "Nashville Warbler", "Nelson's Sharp-tailed Sparrow", "Neotropic Cormorant", "Northern Beardless-Tyrannulet", "Northern Bobwhite", "Northern Cardinal", "Northern Flicker", "Northern Fulmar", "Northern Gannet", "Northern Goshawk", "Northern Harrier", "Northern Hawk Owl", "Northern Jacana", "Northern Lapwing", "Northern Mockingbird", "Northern Parula", "Northern Pintail", "Northern Pygmy-Owl", "Northern Rough-winged Swallow", "Northern Saw-whet Owl", "Northern Shoveler", "Northern Shrike", "Northern Waterthrush", "Northern Wheatear", "Northwestern Crow", "Nuttall's Woodpecker", "Nutting's Flycatcher", "Oak Titmouse", "Oldsquaw", "Olive Sparrow", "Olive Warbler", "Olive-backed Pipit", "Olive-sided Flycatcher", "Orange-crowned Warbler", "Orchard Oriole", "Oriental Cuckoo", "Oriental Greenfinch", "Oriental Pratincole", "Oriental Scops-Owl", "Oriental Turtle-Dove", "Osprey", "Ovenbird", "Pacific Golden-Plover", "Pacific Loon", "Pacific-slope Flycatcher", "Paint-billed Crake", "Painted Bunting", "Painted Redstart", "Pallas's Bunting", "Palm Warbler", "Parakeet Auklet", "Parasitic Jaeger", "Passenger Pigeon", "Pechora Pipit", "Pectoral Sandpiper", "Pelagic Cormorant", "Peregrine Falcon", "Phainopepla", "Philadelphia Vireo", "Pied-billed Grebe", "Pigeon Guillemot", "Pileated Woodpecker", "Pin-tailed Snipe", "Pine Bunting", "Pine Grosbeak", "Pine Siskin", "Pine Warbler", "Pink-footed Goose", "Pink-footed Shearwater", "Pinyon Jay", "Piping Plover", "Plain Chachalaca", "Plain-capped Starthroat", "Plumbeous Vireo", "Pomarine Jaeger", "Prairie Falcon", "Prairie Warbler", "Prothonotary Warbler", "Purple Finch", "Purple Gallinule", "Purple Martin", "Purple Sandpiper", "Pygmy Nuthatch", "Pyrrhuloxia", "Razorbill", "Red Crossbill", "Red Knot", "Red Phalarope", "Red-bellied Woodpecker", "Red-billed Pigeon", "Red-billed Tropicbird", "Red-breasted Flycatcher", "Red-breasted Merganser", "Red-breasted Nuthatch", "Red-breasted Sapsucker", "Red-cockaded Woodpecker", "Red-crowned Parrot", "Red-eyed Vireo", "Red-faced Cormorant", "Red-faced Warbler", "Red-flanked Bluetail", "Red-footed Booby", "Red-headed Woodpecker", "Red-legged Kittiwake", "Red-naped Sapsucker", "Red-necked Grebe", "Red-necked Phalarope", "Red-necked Stint", "Red-shouldered Hawk", "Red-tailed Hawk", "Red-tailed Tropicbird", "Red-throated Loon", "Red-throated Pipit", "Red-whiskered Bulbul", "Red-winged Blackbird", "Reddish Egret", "Redhead", "Redwing", "Reed Bunting", "Rhinoceros Auklet", "Ring-billed Gull", "Ring-necked Duck", "Ring-necked Pheasant", "Ringed Kingfisher", "Roadside Hawk", "Rock Dove", "Rock Ptarmigan", "Rock Sandpiper", "Rock Wren", "Rose-breasted Grosbeak", "Rose-throated Becard", "Roseate Spoonbill", "Roseate Tern", "Ross's Goose", "Ross's Gull", "Rough-legged Hawk", "Royal Tern", "Ruby-crowned Kinglet", "Ruby-throated Hummingbird", "Ruddy Duck", "Ruddy Ground-Dove", "Ruddy Quail-Dove", "Ruddy Turnstone", "Ruff", "Ruffed Grouse", "Rufous Hummingbird", "Rufous-backed Robin", "Rufous-capped Warbler", "Rufous-crowned Sparrow", "Rufous-winged Sparrow", "Rustic Bunting", "Rusty Blackbird", "Sabine's Gull", "Sage Grouse", "Sage Sparrow", "Sage Thrasher", "Saltmarsh Sharp-tailed Sparrow", "Sanderling", "Sandhill Crane", "Sandwich Tern", "Savannah Sparrow", "Say's Phoebe", "Scaled Quail", "Scaly-naped Pigeon", "Scarlet Ibis", "Scarlet Tanager", "Scissor-tailed Flycatcher", "Scott's Oriole", "Seaside Sparrow", "Sedge Wren", "Semipalmated Plover", "Semipalmated Sandpiper", "Sharp-shinned Hawk", "Sharp-tailed Grouse", "Sharp-tailed Sandpiper", "Shiny Cowbird", "Short-billed Dowitcher", "Short-eared Owl", "Short-tailed Albatross", "Short-tailed Hawk", "Short-tailed Shearwater", "Shy Albatross", "Siberian Accentor", "Siberian Blue Robin", "Siberian Flycatcher", "Siberian Rubythroat", "Sky Lark", "Slate-throated Redstart", "Slaty-backed Gull", "Slender-billed Curlew", "Smew", "Smith's Longspur", "Smooth-billed Ani", "Snail Kite", "Snow Bunting", "Snow Goose", "Snowy Egret", "Snowy Owl", "Snowy Plover", "Solitary Sandpiper", "Song Sparrow", "Sooty Shearwater", "Sooty Tern", "Sora", "South Polar Skua", "Southern Martin", "Spectacled Eider", "Spoonbill Sandpiper", "Spot-billed Duck", "Spot-breasted Oriole", "Spotted Dove", "Spotted Owl", "Spotted Rail", "Spotted Redshank", "Spotted Sandpiper", "Spotted Towhee", "Sprague's Pipit", "Spruce Grouse", "Stejneger's Petrel", "Steller's Eider", "Steller's Jay", "Steller's Sea-Eagle", "Stilt Sandpiper", "Stonechat", "Streak-backed Oriole", "Streaked Shearwater", "Strickland's Woodpecker", "Stripe-headed Tanager", "Sulphur-bellied Flycatcher", "Summer Tanager", "Surf Scoter", "Surfbird", "Swainson's Hawk", "Swainson's Thrush", "Swainson's Warbler", "Swallow-tailed Kite", "Swamp Sparrow", "Tamaulipas Crow", "Tawny-shouldered Blackbird", "Temminck's Stint", "Tennessee Warbler", "Terek Sandpiper", "Thayer's Gull", "Thick-billed Kingbird", "Thick-billed Murre", "Thick-billed Parrot", "Thick-billed Vireo", "Three-toed Woodpecker", "Townsend's Solitaire", "Townsend's Warbler", "Tree Pipit", "Tree Swallow", "Tricolored Blackbird", "Tricolored Heron", "Tropical Kingbird", "Tropical Parula", "Trumpeter Swan", "Tufted Duck", "Tufted Flycatcher", "Tufted Puffin", "Tufted Titmouse", "Tundra Swan", "Turkey Vulture", "Upland Sandpiper", "Varied Bunting", "Varied Thrush", "Variegated Flycatcher", "Vaux's Swift", "Veery", "Verdin", "Vermilion Flycatcher", "Vesper Sparrow", "Violet-crowned Hummingbird", "Violet-green Swallow", "Virginia Rail", "Virginia's Warbler", "Wandering Albatross", "Wandering Tattler", "Warbling Vireo", "Wedge-rumped Storm-Petrel", "Wedge-tailed Shearwater", "Western Bluebird", "Western Grebe", "Western Gull", "Western Kingbird", "Western Meadowlark", "Western Reef-Heron", "Western Sandpiper", "Western Screech-Owl", "Western Scrub-Jay", "Western Tanager", "Western Wood-Pewee", "Whimbrel", "Whip-poor-will", "Whiskered Auklet", "Whiskered Screech-Owl", "Whiskered Tern", "White Ibis", "White Wagtail", "White-breasted Nuthatch", "White-cheeked Pintail", "White-chinned Petrel", "White-collared Seedeater", "White-collared Swift", "White-crowned Pigeon", "White-crowned Sparrow", "White-eared Hummingbird", "White-eyed Vireo", "White-faced Ibis", "White-faced Storm-Petrel", "White-headed Woodpecker", "White-rumped Sandpiper", "White-tailed Eagle", "White-tailed Hawk", "White-tailed Kite", "White-tailed Ptarmigan", "White-tailed Tropicbird", "White-throated Needletail", "White-throated Robin", "White-throated Sparrow", "White-throated Swift", "White-tipped Dove", "White-winged Crossbill", "White-winged Dove", "White-winged Parakeet", "White-winged Scoter", "White-winged Tern", "Whooper Swan", "Whooping Crane", "Wild Turkey", "Willet", "Williamson's Sapsucker", "Willow Flycatcher", "Willow Ptarmigan", "Wilson's Phalarope", "Wilson's Plover", "Wilson's Storm-Petrel", "Wilson's Warbler", "Winter Wren", "Wood Duck", "Wood Sandpiper", "Wood Stork", "Wood Thrush", "Wood Warbler", "Worm-eating Warbler", "Worthen's Sparrow", "Wrentit", "Xantus's Hummingbird", "Xantus's Murrelet", "Yellow Bittern", "Yellow Grosbeak", "Yellow Rail", "Yellow Wagtail", "Yellow Warbler", "Yellow-bellied Flycatcher", "Yellow-bellied Sapsucker", "Yellow-billed Cuckoo", "Yellow-billed Loon", "Yellow-billed Magpie", "Yellow-breasted Bunting", "Yellow-breasted Chat", "Yellow-crowned Night-Heron", "Yellow-eyed Junco", "Yellow-faced Grassquit", "Yellow-footed Gull", "Yellow-green Vireo", "Yellow-headed Blackbird", "Yellow-legged Gull", "Yellow-nosed Albatross", "Yellow-rumped Warbler", "Yellow-throated Vireo", "Yellow-throated Warbler", "Yucatan Vireo", "Zenaida Dove", "Zone-tailed Hawk"];
var t = ["Abyssinian", "American Bobtail", "American Curl", "American Shorthair", "American Wirehair", "Balinese", "Bengal", "Birman", "Bombay", "British Shorthair", "Burmese", "Chartreux", "Chausie", "Cornish Rex", "Devon Rex", "Donskoy", "Egyptian Mau", "Exotic Shorthair", "Havana", "Highlander", "Himalayan", "Japanese Bobtail", "Korat", "Kurilian Bobtail", "LaPerm", "Maine Coon", "Manx", "Minskin", "Munchkin", "Nebelung", "Norwegian Forest Cat", "Ocicat", "Ojos Azules", "Oriental", "Persian", "Peterbald", "Pixiebob", "Ragdoll", "Russian Blue", "Savannah", "Scottish Fold", "Selkirk Rex", "Serengeti", "Siamese", "Siberian", "Singapura", "Snowshoe", "Sokoke", "Somali", "Sphynx", "Thai", "Tonkinese", "Toyger", "Turkish Angora", "Turkish Van"];
var l = ["Amazon River Dolphin", "Arnoux's Beaked Whale", "Atlantic Humpbacked Dolphin", "Atlantic Spotted Dolphin", "Atlantic White-Sided Dolphin", "Australian Snubfin Dolphin", "Australian humpback Dolphin", "Blue Whale", "Bottlenose Dolphin", "Bryde\u2019s whale", "Burrunan Dolphin", "Chilean Dolphin", "Chinese River Dolphin", "Chinese White Dolphin", "Clymene Dolphin", "Commerson\u2019s Dolphin", "Costero", "Dusky Dolphin", "False Killer Whale", "Fin Whale", "Fraser\u2019s Dolphin", "Ganges River Dolphin", "Guiana Dolphin", "Heaviside\u2019s Dolphin", "Hector\u2019s Dolphin", "Hourglass Dolphin", "Humpback whale", "Indo-Pacific Bottlenose Dolphin", "Indo-Pacific Hump-backed Dolphin", "Irrawaddy Dolphin", "Killer Whale (Orca)", "La Plata Dolphin", "Long-Beaked Common Dolphin", "Long-finned Pilot Whale", "Longman's Beaked Whale", "Melon-headed Whale", "Northern Rightwhale Dolphin", "Omura\u2019s whale", "Pacific White-Sided Dolphin", "Pantropical Spotted Dolphin", "Peale\u2019s Dolphin", "Pygmy Killer Whale", "Risso\u2019s Dolphin", "Rough-Toothed Dolphin", "Sei Whale", "Short-Beaked Common Dolphin", "Short-finned Pilot Whale", "Southern Bottlenose Whale", "Southern Rightwhale Dolphin", "Sperm Whale", "Spinner Dolphin", "Striped Dolphin", "Tucuxi", "White-Beaked Dolphin"];
var s = ["Aberdeen Angus", "Abergele", "Abigar", "Abondance", "Abyssinian Shorthorned Zebu", "Aceh", "Achham", "Adamawa", "Adaptaur", "Afar", "Africangus", "Afrikaner", "Agerolese", "Alambadi", "Alatau", "Albanian", "Albera", "Alderney", "Alentejana", "Aleutian wild cattle", "Aliad Dinka", "Alistana-Sanabresa", "Allmogekor", "Alur", "American", "American Angus", "American Beef Friesian", "American Brown Swiss", "American Milking Devon", "American White Park", "Amerifax", "Amrit Mahal", "Amsterdam Island cattle", "Anatolian Black", "Andalusian Black", "Andalusian Blond", "Andalusian Grey", "Angeln", "Angoni", "Ankina", "Ankole", "Ankole-Watusi", "Aracena", "Arado", "Argentine Criollo", "Argentine Friesian", "Armorican", "Arouquesa", "Arsi", "Asturian Mountain", "Asturian Valley", "Aubrac", "Aulie-Ata", "Aure et Saint-Girons", "Australian Braford", "Australian Brangus", "Australian Charbray", "Australian Friesian Sahiwal", "Australian Lowline", "Australian Milking Zebu", "Australian Shorthorn", "Austrian Simmental", "Austrian Yellow", "Avile\xF1a-Negra Ib\xE9rica", "Av\xE9tonou", "Aweil Dinka", "Ayrshire", "Azaouak", "Azebuado", "Azerbaijan Zebu", "Azores", "Bachaur cattle", "Baherie cattle", "Bakosi cattle", "Balancer", "Baoule", "Bargur cattle", "Barros\xE3", "Barzona", "Bazadaise", "Beef Freisian", "Beefalo", "Beefmaker", "Beefmaster", "Begayt", "Belgian Blue", "Belgian Red", "Belgian Red Pied", "Belgian White-and-Red", "Belmont Red", "Belted Galloway", "Bernese", "Berrenda cattle", "Betizu", "Bianca Modenese", "Blaarkop", "Black Angus", "Black Baldy", "Black Hereford", "Blanca Cacere\xF1a", "Blanco Orejinegro BON", "Blonde d'Aquitaine", "Blue Albion", "Blue Grey", "Bohuskulla", "Bonsmara", "Boran", "Bo\u0161karin", "Braford", "Brahman", "Brahmousin", "Brangus", "Braunvieh", "Brava", "Breed", "British Friesian", "British White", "Brown Carpathian", "Brown Caucasian", "Brown Swiss", "Bue Lingo", "Burlina", "Bushuyev", "Butana cattle", "Bu\u0161a cattle", "Cachena", "Caldelana", "Camargue", "Campbell Island cattle", "Canadian Speckle Park", "Canadienne", "Canaria", "Canchim", "Caracu", "Carinthian Blondvieh", "Carora", "Charbray", "Charolais", "Chateaubriand", "Chiangus", "Chianina", "Chillingham cattle", "Chinese Black Pied", "Cholistani", "Coloursided White Back", "Commercial", "Corriente", "Corsican cattle", "Coste\xF1o con Cuernos", "Crioulo Lageano", "C\xE1rdena Andaluza", "Dajal", "Dangi cattle", "Danish Black-Pied", "Danish Jersey", "Danish Red", "Deep Red cattle", "Deoni", "Devon", "Dexter cattle", "Dhanni", "Doayo cattle", "Doela", "Drakensberger", "Droughtmaster", "Dulong'", "Dutch Belted", "Dutch Friesian", "Dwarf Lulu", "D\xF8lafe", "East Anatolian Red", "Eastern Finncattle", "Eastern Red Polled", "Enderby Island cattle", "English Longhorn", "Ennstaler Bergscheck", "Estonian Holstein", "Estonian Native", "Estonian Red cattle", "Finncattle", "Finnish Ayrshire", "Finnish Holstein-Friesian", "Fj\xE4ll", "Fleckvieh", "Florida Cracker cattle", "Fogera", "French Simmental", "Fribourgeoise", "Friesian Red and White", "Fulani Sudanese", "F\u0113ng Cattle", "Galician Blond", "Galloway cattle", "Gangatiri", "Gaolao", "Garvonesa", "Gascon cattle", "Gelbvieh", "Georgian Mountain cattle", "German Angus", "German Black Pied Dairy", "German Black Pied cattle", "German Red Pied", "Gir", "Glan cattle", "Gloucester", "Gobra", "Greek Shorthorn", "Greek Steppe", "Greyman cattle", "Gudali", "Guernsey cattle", "Guzer\xE1", "Hallikar4", "Hanwoo", "Hariana cattle", "Hart\xF3n del Valle", "Harzer Rotvieh", "Hays Converter", "Heck cattle", "Hereford", "Herens", "Highland cattle", "Hinterwald", "Holando-Argentino", "Holstein Friesian cattle", "Horro", "Hungarian Grey", "Hu\xE1ng Cattle", "Hybridmaster", "Iberian cattle", "Icelandic", "Illawarra cattle", "Improved Red and White", "Indo-Brazilian", "Irish Moiled", "Israeli Holstein", "Israeli Red", "Istoben cattle", "Istrian cattle", "Jamaica Black", "Jamaica Hope", "Jamaica Red", "Japanese Brown", "Jarmelista", "Javari cattle", "Jersey cattle", "Jutland cattle", "Kabin Buri cattle", "Kalmyk cattle", "Kamphaeng Saen cattle", "Kangayam", "Kankrej", "Karan Swiss", "Kasaragod Dwarf cattle", "Kathiawadi", "Kazakh Whiteheaded", "Kenana cattle", "Kenkatha cattle", "Kerry cattle", "Kherigarh", "Khillari cattle", "Kholomogory", "Korat Wagyu", "Kostroma cattle", "Krishna Valley cattle", "Kurgan cattle", "Kuri", "La Reina cattle", "Lakenvelder cattle", "Lampurger", "Latvian Blue", "Latvian Brown", "Latvian Danish Red", "Lebedyn", "Levantina", "Limia cattle", "Limousin", "Limpurger", "Lincoln Red", "Lineback", "Lithuanian Black-and-White", "Lithuanian Light Grey", "Lithuanian Red", "Lithuanian White-Backed", "Lohani cattle", "Lourdais", "Lucerna cattle", "Luing", "Madagascar Zebu", "Madura", "Maine-Anjou", "Malnad Gidda", "Malvi", "Mandalong Special", "Mantequera Leonesa", "Maramure\u015F Brown", "Marchigiana", "Maremmana", "Marinhoa", "Maronesa", "Masai", "Mashona", "Menorquina", "Mertolenga", "Meuse-Rhine-Issel", "Mewati", "Milking Shorthorn", "Minhota", "Mirandesa", "Mirkadim", "Moc\u0103ni\u0163\u0103", "Mollie", "Monchina", "Mongolian", "Montb\xE9liarde", "Morucha", "Murboden", "Murnau-Werdenfels", "Murray Grey", "Muturu", "N'Dama", "Nagori", "Negra Andaluza", "Nelore", "Nguni", "Nimari", "Normande", "North Bengal Grey", "Northern Finncattle", "Northern Shorthorn", "Norwegian Red", "Ongole", "Original Simmental", "Pajuna", "Palmera", "Pantaneiro", "Parda Alpina", "Parthenaise", "Pasiega", "Pembroke", "Philippine Native", "Pie Rouge des Plaines", "Piedmontese cattle", "Pineywoods", "Pinzgauer", "Pirenaica", "Podolac", "Podolica", "Polish Black-and-White", "Polish Red", "Poll Shorthorn", "Polled Hereford", "Polled Shorthorn", "Ponwar", "Preta", "Pulikulam", "Punganur", "Pustertaler Sprinzen", "Qinchaun", "Queensland Miniature Boran", "RX3", "Ramo Grande", "Randall", "Raramuri Criollo", "Rathi", "Raya", "Red Angus", "Red Brangus", "Red Chittagong", "Red Fulani", "Red Gorbatov", "Red Holstein", "Red Kandhari", "Red Mingrelian", "Red Poll", "Red Polled \xD8stland", "Red Sindhi", "Retinta", "Riggit Galloway", "Ringam\xE5la", "Rohjan", "Romagnola", "Romanian B\u0103l\u0163ata", "Romanian Steppe Gray", "Romosinuano", "Russian Black Pied", "R\xE4tisches Grauvieh", "Sahiwal", "Salers", "Salorn", "Sanga", "Sanhe", "Santa Cruz", "Santa Gertrudis", "Sayaguesa", "Schwyz", "Selembu", "Senepol", "Serbian Pied", "Serbian Steppe", "Sheko", "Shetland", "Shorthorn", "Siboney de Cuba", "Simbrah", "Simford", "Simmental", "Siri", "South Devon", "Spanish Fighting Bull", "Speckle Park", "Square Meater", "Sussex", "Swedish Friesian", "Swedish Polled", "Swedish Red Pied", "Swedish Red Polled", "Swedish Red-and-White", "Tabapu\xE3", "Tarentaise", "Tasmanian Grey", "Tauros", "Telemark", "Texas Longhorn", "Texon", "Thai Black", "Thai Fighting Bull", "Thai Friesian", "Thai Milking Zebu", "Tharparkar", "Tswana", "Tudanca", "Tuli", "Tulim", "Turkish Grey Steppe", "Tux-Zillertal", "Tyrol Grey", "Ukrainian Grey", "Umblachery", "Valdostana Castana", "Valdostana Pezzata Nera", "Valdostana Pezzata Rossa", "Vaynol", "Vechur8", "Vestland Fjord", "Vestland Red Polled", "Vianesa", "Volinian Beef", "Vorderwald", "Vosgienne", "V\xE4neko", "Waguli", "Wagyu", "Wangus", "Welsh Black", "Western Finncattle", "White C\xE1ceres", "White Fulani", "White Lamphun", "White Park", "Whitebred Shorthorn", "Xingjiang Brown", "Yakutian", "Yanbian", "Yanhuang", "Yurino", "Zebu", "\xC9vol\xE8ne cattle", "\u017Bubro\u0144"];
var d = ["African Slender-snouted Crocodile", "Alligator mississippiensis", "American Crocodile", "Australian Freshwater Crocodile", "Black Caiman", "Broad-snouted Caiman", "Chinese Alligator", "Cuban Crocodile", "Cuvier\u2019s Dwarf Caiman", "Dwarf Crocodile", "Gharial", "Morelet\u2019s Crocodile", "Mugger Crocodile", "New Guinea Freshwater Crocodile", "Nile Crocodile", "Orinoco Crocodile", "Philippine Crocodile", "Saltwater Crocodile", "Schneider\u2019s Smooth-fronted Caiman", "Siamese Crocodile", "Spectacled Caiman", "Tomistoma", "West African Crocodile", "Yacare Caiman"];
var u = ["Affenpinscher", "Afghan Hound", "Aidi", "Airedale Terrier", "Akbash", "Akita", "Alano Espa\xF1ol", "Alapaha Blue Blood Bulldog", "Alaskan Husky", "Alaskan Klee Kai", "Alaskan Malamute", "Alopekis", "Alpine Dachsbracke", "American Bulldog", "American Bully", "American Cocker Spaniel", "American English Coonhound", "American Foxhound", "American Hairless Terrier", "American Pit Bull Terrier", "American Staffordshire Terrier", "American Water Spaniel", "Andalusian Hound", "Anglo-Fran\xE7ais de Petite V\xE9nerie", "Appenzeller Sennenhund", "Ariegeois", "Armant", "Armenian Gampr dog", "Artois Hound", "Australian Cattle Dog", "Australian Kelpie", "Australian Shepherd", "Australian Stumpy Tail Cattle Dog", "Australian Terrier", "Austrian Black and Tan Hound", "Austrian Pinscher", "Azawakh", "Bakharwal dog", "Banjara Hound", "Barbado da Terceira", "Barbet", "Basenji", "Basque Shepherd Dog", "Basset Art\xE9sien Normand", "Basset Bleu de Gascogne", "Basset Fauve de Bretagne", "Basset Hound", "Bavarian Mountain Hound", "Beagle", "Beagle-Harrier", "Bearded Collie", "Beauceron", "Bedlington Terrier", "Belgian Shepherd", "Bergamasco Shepherd", "Berger Picard", "Bernese Mountain Dog", "Bhotia", "Bichon Fris\xE9", "Billy", "Black Mouth Cur", "Black Norwegian Elkhound", "Black Russian Terrier", "Black and Tan Coonhound", "Bloodhound", "Blue Lacy", "Blue Picardy Spaniel", "Bluetick Coonhound", "Boerboel", "Bohemian Shepherd", "Bolognese", "Border Collie", "Border Terrier", "Borzoi", "Bosnian Coarse-haired Hound", "Boston Terrier", "Bouvier des Ardennes", "Bouvier des Flandres", "Boxer", "Boykin Spaniel", "Bracco Italiano", "Braque Francais", "Braque Saint-Germain", "Braque d'Auvergne", "Braque de l'Ari\xE8ge", "Braque du Bourbonnais", "Briard", "Briquet Griffon Vend\xE9en", "Brittany", "Broholmer", "Bruno Jura Hound", "Brussels Griffon", "Bucovina Shepherd Dog", "Bull Arab", "Bull Terrier", "Bulldog", "Bullmastiff", "Bully Kutta", "Burgos Pointer", "Cairn Terrier", "Campeiro Bulldog", "Can de Chira", "Canaan Dog", "Canadian Eskimo Dog", "Cane Corso", "Cane Paratore", "Cane di Oropa", "Cantabrian Water Dog", "Cardigan Welsh Corgi", "Carea Castellano Manchego", "Carolina Dog", "Carpathian Shepherd Dog", "Catahoula Leopard Dog", "Catalan Sheepdog", "Caucasian Shepherd Dog", "Cavalier King Charles Spaniel", "Central Asian Shepherd Dog", "Cesky Fousek", "Cesky Terrier", "Chesapeake Bay Retriever", "Chien Fran\xE7ais Blanc et Noir", "Chien Fran\xE7ais Blanc et Orange", "Chien Fran\xE7ais Tricolore", "Chihuahua", "Chilean Terrier", "Chinese Chongqing Dog", "Chinese Crested Dog", "Chinook", "Chippiparai", "Chongqing dog", "Chortai", "Chow Chow", "Cimarr\xF3n Uruguayo", "Cirneco dell'Etna", "Clumber Spaniel", "Colombian fino hound", "Coton de Tulear", "Cretan Hound", "Croatian Sheepdog", "Curly-Coated Retriever", "Cursinu", "Czechoslovakian Wolfdog", "C\xE3o Fila de S\xE3o Miguel", "C\xE3o da Serra de Aires", "C\xE3o de Castro Laboreiro", "C\xE3o de Gado Transmontano", "Dachshund", "Dalmatian", "Dandie Dinmont Terrier", "Danish-Swedish Farmdog", "Denmark Feist", "Dingo", "Doberman Pinscher", "Dogo Argentino", "Dogo Guatemalteco", "Dogo Sardesco", "Dogue Brasileiro", "Dogue de Bordeaux", "Drentse Patrijshond", "Drever", "Dunker", "Dutch Shepherd", "Dutch Smoushond", "East European Shepherd", "East Siberian Laika", "English Cocker Spaniel", "English Foxhound", "English Mastiff", "English Setter", "English Shepherd", "English Springer Spaniel", "English Toy Terrier", "Entlebucher Mountain Dog", "Estonian Hound", "Estrela Mountain Dog", "Eurasier", "Field Spaniel", "Fila Brasileiro", "Finnish Hound", "Finnish Lapphund", "Finnish Spitz", "Flat-Coated Retriever", "French Bulldog", "French Spaniel", "Galgo Espa\xF1ol", "Galician Shepherd Dog", "Garafian Shepherd", "Gascon Saintongeois", "Georgian Shepherd", "German Hound", "German Longhaired Pointer", "German Pinscher", "German Roughhaired Pointer", "German Shepherd Dog", "German Shorthaired Pointer", "German Spaniel", "German Spitz", "German Wirehaired Pointer", "Giant Schnauzer", "Glen of Imaal Terrier", "Golden Retriever", "Gordon Setter", "Go\u0144czy Polski", "Grand Anglo-Fran\xE7ais Blanc et Noir", "Grand Anglo-Fran\xE7ais Blanc et Orange", "Grand Anglo-Fran\xE7ais Tricolore", "Grand Basset Griffon Vend\xE9en", "Grand Bleu de Gascogne", "Grand Griffon Vend\xE9en", "Great Dane", "Greater Swiss Mountain Dog", "Greek Harehound", "Greek Shepherd", "Greenland Dog", "Greyhound", "Griffon Bleu de Gascogne", "Griffon Fauve de Bretagne", "Griffon Nivernais", "Gull Dong", "Gull Terrier", "Hamiltonst\xF6vare", "Hanover Hound", "Harrier", "Havanese", "Hierran Wolfdog", "Hokkaido", "Hovawart", "Huntaway", "Hygen Hound", "H\xE4llefors Elkhound", "Ibizan Hound", "Icelandic Sheepdog", "Indian Spitz", "Indian pariah dog", "Irish Red and White Setter", "Irish Setter", "Irish Terrier", "Irish Water Spaniel", "Irish Wolfhound", "Istrian Coarse-haired Hound", "Istrian Shorthaired Hound", "Italian Greyhound", "Jack Russell Terrier", "Jagdterrier", "Japanese Chin", "Japanese Spitz", "Japanese Terrier", "Jindo", "Jonangi", "Kai Ken", "Kaikadi", "Kangal Shepherd Dog", "Kanni", "Karakachan dog", "Karelian Bear Dog", "Kars", "Karst Shepherd", "Keeshond", "Kerry Beagle", "Kerry Blue Terrier", "King Charles Spaniel", "King Shepherd", "Kintamani", "Kishu", "Kokoni", "Kombai", "Komondor", "Kooikerhondje", "Koolie", "Koyun dog", "Kromfohrl\xE4nder", "Kuchi", "Kuvasz", "Labrador Retriever", "Lagotto Romagnolo", "Lakeland Terrier", "Lancashire Heeler", "Landseer", "Lapponian Herder", "Large M\xFCnsterl\xE4nder", "Leonberger", "Levriero Sardo", "Lhasa Apso", "Lithuanian Hound", "Lupo Italiano", "L\xF6wchen", "Mackenzie River Husky", "Magyar ag\xE1r", "Mahratta Greyhound", "Maltese", "Manchester Terrier", "Maremmano-Abruzzese Sheepdog", "McNab dog", "Miniature American Shepherd", "Miniature Bull Terrier", "Miniature Fox Terrier", "Miniature Pinscher", "Miniature Schnauzer", "Molossus of Epirus", "Montenegrin Mountain Hound", "Mountain Cur", "Mountain Feist", "Mucuchies", "Mudhol Hound", "Mudi", "Neapolitan Mastiff", "New Guinea Singing Dog", "New Zealand Heading Dog", "Newfoundland", "Norfolk Terrier", "Norrbottenspets", "Northern Inuit Dog", "Norwegian Buhund", "Norwegian Elkhound", "Norwegian Lundehund", "Norwich Terrier", "Nova Scotia Duck Tolling Retriever", "Old Croatian Sighthound", "Old Danish Pointer", "Old English Sheepdog", "Old English Terrier", "Olde English Bulldogge", "Otterhound", "Pachon Navarro", "Paisley Terrier", "Pampas Deerhound", "Papillon", "Parson Russell Terrier", "Pastore della Lessinia e del Lagorai", "Patagonian Sheepdog", "Patterdale Terrier", "Pekingese", "Pembroke Welsh Corgi", "Perro Majorero", "Perro de Pastor Mallorquin", "Perro de Presa Canario", "Perro de Presa Mallorquin", "Peruvian Inca Orchid", "Petit Basset Griffon Vend\xE9en", "Petit Bleu de Gascogne", "Phal\xE8ne", "Pharaoh Hound", "Phu Quoc Ridgeback", "Picardy Spaniel", "Plott Hound", "Plummer Terrier", "Podenco Canario", "Podenco Valenciano", "Pointer", "Poitevin", "Polish Greyhound", "Polish Hound", "Polish Lowland Sheepdog", "Polish Tatra Sheepdog", "Pomeranian", "Pont-Audemer Spaniel", "Poodle", "Porcelaine", "Portuguese Podengo", "Portuguese Pointer", "Portuguese Water Dog", "Posavac Hound", "Pra\u017Esk\xFD Krysa\u0159\xEDk", "Pshdar Dog", "Pudelpointer", "Pug", "Puli", "Pumi", "Pungsan Dog", "Pyrenean Mastiff", "Pyrenean Mountain Dog", "Pyrenean Sheepdog", "Rafeiro do Alentejo", "Rajapalayam", "Rampur Greyhound", "Rat Terrier", "Ratonero Bodeguero Andaluz", "Ratonero Mallorquin", "Ratonero Murciano de Huerta", "Ratonero Valenciano", "Redbone Coonhound", "Rhodesian Ridgeback", "Romanian Mioritic Shepherd Dog", "Romanian Raven Shepherd Dog", "Rottweiler", "Rough Collie", "Russian Spaniel", "Russian Toy", "Russo-European Laika", "Saarloos Wolfdog", "Sabueso Espa\xF1ol", "Saint Bernard", "Saint Hubert Jura Hound", "Saint-Usuge Spaniel", "Saluki", "Samoyed", "Sapsali", "Sarabi dog", "Sardinian Shepherd Dog", "Schapendoes", "Schillerst\xF6vare", "Schipperke", "Schweizer Laufhund", "Schweizerischer Niederlaufhund", "Scottish Deerhound", "Scottish Terrier", "Sealyham Terrier", "Segugio Italiano", "Segugio Maremmano", "Segugio dell'Appennino", "Seppala Siberian Sleddog", "Serbian Hound", "Serbian Tricolour Hound", "Serrano Bulldog", "Shar Pei", "Shetland Sheepdog", "Shiba Inu", "Shih Tzu", "Shikoku", "Shiloh Shepherd", "Siberian Husky", "Silken Windhound", "Silky Terrier", "Sinhala Hound", "Skye Terrier", "Sloughi", "Slovakian Wirehaired Pointer", "Slovensk\xFD Cuvac", "Slovensk\xFD Kopov", "Smalandst\xF6vare", "Small Greek domestic dog", "Small M\xFCnsterl\xE4nder", "Smooth Collie", "Smooth Fox Terrier", "Soft-Coated Wheaten Terrier", "South Russian Ovcharka", "Spanish Mastiff", "Spanish Water Dog", "Spinone Italiano", "Sporting Lucas Terrier", "Stabyhoun", "Staffordshire Bull Terrier", "Standard Schnauzer", "Stephens Stock", "Styrian Coarse-haired Hound", "Sussex Spaniel", "Swedish Elkhound", "Swedish Lapphund", "Swedish Vallhund", "Swedish White Elkhound", "Taigan", "Taiwan Dog", "Tamaskan Dog", "Teddy Roosevelt Terrier", "Telomian", "Tenterfield Terrier", "Terrier Brasileiro", "Thai Bangkaew Dog", "Thai Ridgeback", "Tibetan Mastiff", "Tibetan Spaniel", "Tibetan Terrier", "Tornjak", "Tosa", "Toy Fox Terrier", "Toy Manchester Terrier", "Transylvanian Hound", "Treeing Cur", "Treeing Feist", "Treeing Tennessee Brindle", "Treeing Walker Coonhound", "Trigg Hound", "Tyrolean Hound", "Vikhan", "Villano de Las Encartaciones", "Villanuco de Las Encartaciones", "Vizsla", "Volpino Italiano", "Weimaraner", "Welsh Sheepdog", "Welsh Springer Spaniel", "Welsh Terrier", "West Highland White Terrier", "West Siberian Laika", "Westphalian Dachsbracke", "Wetterhoun", "Whippet", "White Shepherd", "White Swiss Shepherd Dog", "Wire Fox Terrier", "Wirehaired Pointing Griffon", "Wirehaired Vizsla", "Xiasi Dog", "Xoloitzcuintli", "Yakutian Laika", "Yorkshire Terrier", "\u0160arplaninac"];
var c = ["Alaska pollock", "Albacore", "Amur catfish", "Araucanian herring", "Argentine hake", "Asari", "Asian swamp eel", "Atlantic cod", "Atlantic herring", "Atlantic horse mackerel", "Atlantic mackerel", "Atlantic menhaden", "Atlantic salmon", "Bigeye scad", "Bigeye tuna", "Bighead carp", "Black carp", "Blood cockle", "Blue swimming crab", "Blue whiting", "Bombay-duck", "Bonga shad", "California pilchard", "Cape horse mackerel", "Capelin", "Catla", "Channel catfish", "Chilean jack mackerel", "Chinese perch", "Chinese softshell turtle", "Chub mackerel", "Chum salmon", "Common carp", "Crucian carp", "Daggertooth pike conger", "European anchovy", "European pilchard", "European sprat", "Filipino Venus", "Gazami crab", "Goldstripe sardinella", "Grass carp", "Gulf menhaden", "Haddock", "Hilsa shad", "Indian mackerel", "Indian oil sardine", "Iridescent shark", "Japanese anchovy", "Japanese cockle", "Japanese common catfish", "Japanese flying squid", "Japanese jack mackerel", "Japanese littleneck", "Japanese pilchard", "Jumbo flying squid", "Kawakawa", "Korean bullhead", "Largehead hairtail", "Longtail tuna", "Madeiran sardinella", "Mandarin fish", "Milkfish", "Mrigal carp", "Narrow-barred Spanish mackerel", "Nile perch", "Nile tilapia", "North Pacific hake", "Northern snakehead", "Pacific anchoveta", "Pacific cod", "Pacific herring", "Pacific sand lance", "Pacific sandlance", "Pacific saury", "Pacific thread herring", "Peruvian anchoveta", "Pink salmon", "Pollock", "Pond loach", "Rainbow trout", "Rohu", "Round sardinella", "Short mackerel", "Silver carp", "Silver cyprinid", "Skipjack tuna", "Southern African anchovy", "Southern rough shrimp", "Whiteleg shrimp", "Wuchang bream", "Yellow croaker", "Yellowfin tuna", "Yellowhead catfish", "Yellowstripe scad"];
var m = ["Abaco Barb", "Abtenauer", "Abyssinian", "Aegidienberger", "Akhal-Teke", "Albanian Horse", "Altai Horse", "Alt\xE8r Real", "American Albino", "American Cream Draft", "American Indian Horse", "American Paint Horse", "American Quarter Horse", "American Saddlebred", "American Warmblood", "Andalusian Horse", "Andravida Horse", "Anglo-Arabian", "Anglo-Arabo-Sardo", "Anglo-Kabarda", "Appaloosa", "AraAppaloosa", "Arabian Horse", "Ardennes Horse", "Arenberg-Nordkirchen", "Argentine Criollo", "Asian wild Horse", "Assateague Horse", "Asturc\xF3n", "Augeron", "Australian Brumby", "Australian Draught Horse", "Australian Stock Horse", "Austrian Warmblood", "Auvergne Horse", "Auxois", "Azerbaijan Horse", "Azteca Horse", "Baise Horse", "Bale", "Balearic Horse", "Balikun Horse", "Baluchi Horse", "Banker Horse", "Barb Horse", "Bardigiano", "Bashkir Curly", "Basque Mountain Horse", "Bavarian Warmblood", "Belgian Half-blood", "Belgian Horse", "Belgian Warmblood", "Bhutia Horse", "Black Forest Horse", "Blazer Horse", "Boerperd", "Borana", "Boulonnais Horse", "Brabant", "Brandenburger", "Brazilian Sport Horse", "Breton Horse", "Brumby", "Budyonny Horse", "Burguete Horse", "Burmese Horse", "Byelorussian Harness Horse", "Calabrese Horse", "Camargue Horse", "Camarillo White Horse", "Campeiro", "Campolina", "Canadian Horse", "Canadian Pacer", "Carolina Marsh Tacky", "Carthusian Horse", "Caspian Horse", "Castilian Horse", "Castillonnais", "Catria Horse", "Cavallo Romano della Maremma Laziale", "Cerbat Mustang", "Chickasaw Horse", "Chilean Corralero", "Choctaw Horse", "Cleveland Bay", "Clydesdale Horse", "Cob", "Coldblood Trotter", "Colonial Spanish Horse", "Colorado Ranger", "Comtois Horse", "Corsican Horse", "Costa Rican Saddle Horse", "Cretan Horse", "Criollo Horse", "Croatian Coldblood", "Cuban Criollo", "Cumberland Island Horse", "Curly Horse", "Czech Warmblood", "Daliboz", "Danish Warmblood", "Danube Delta Horse", "Dole Gudbrandsdal", "Don", "Dongola Horse", "Draft Trotter", "Dutch Harness Horse", "Dutch Heavy Draft", "Dutch Warmblood", "Dzungarian Horse", "East Bulgarian", "East Friesian Horse", "Estonian Draft", "Estonian Horse", "Falabella", "Faroese", "Finnhorse", "Fjord Horse", "Fleuve", "Florida Cracker Horse", "Foutank\xE9", "Frederiksborg Horse", "Freiberger", "French Trotter", "Friesian Cross", "Friesian Horse", "Friesian Sporthorse", "Furioso-North Star", "Galice\xF1o", "Galician Pony", "Gelderland Horse", "Georgian Grande Horse", "German Warmblood", "Giara Horse", "Gidran", "Groningen Horse", "Gypsy Horse", "Hackney Horse", "Haflinger", "Hanoverian Horse", "Heck Horse", "Heihe Horse", "Henson Horse", "Hequ Horse", "Hirzai", "Hispano-Bret\xF3n", "Holsteiner Horse", "Horro", "Hungarian Warmblood", "Icelandic Horse", "Iomud", "Irish Draught", "Irish Sport Horse sometimes called Irish Hunter", "Italian Heavy Draft", "Italian Trotter", "Jaca Navarra", "Jeju Horse", "Jutland Horse", "Kabarda Horse", "Kafa", "Kaimanawa Horses", "Kalmyk Horse", "Karabair", "Karabakh Horse", "Karachai Horse", "Karossier", "Kathiawari", "Kazakh Horse", "Kentucky Mountain Saddle Horse", "Kiger Mustang", "Kinsky Horse", "Kisber Felver", "Kiso Horse", "Kladruber", "Knabstrupper", "Konik", "Kundudo", "Kustanair", "Kyrgyz Horse", "Latvian Horse", "Lipizzan", "Lithuanian Heavy Draught", "Lokai", "Losino Horse", "Lusitano", "Lyngshest", "M'Bayar", "M'Par", "Mallorqu\xEDn", "Malopolski", "Mangalarga", "Mangalarga Marchador", "Maremmano", "Marisme\xF1o Horse", "Marsh Tacky", "Marwari Horse", "Mecklenburger", "Menorqu\xEDn", "Messara Horse", "Metis Trotter", "Mez\u0151hegyesi Sport Horse", "Me\u0111imurje Horse", "Miniature Horse", "Misaki Horse", "Missouri Fox Trotter", "Monchina", "Mongolian Horse", "Mongolian Wild Horse", "Monterufolino", "Morab", "Morgan Horse", "Mountain Pleasure Horse", "Moyle Horse", "Murakoz Horse", "Murgese", "Mustang Horse", "M\xE9rens Horse", "Namib Desert Horse", "Nangchen Horse", "National Show Horse", "Nez Perce Horse", "Nivernais Horse", "Nokota Horse", "Noma", "Nonius Horse", "Nooitgedachter", "Nordlandshest", "Noriker Horse", "Norman Cob", "North American Single-Footer Horse", "North Swedish Horse", "Norwegian Coldblood Trotter", "Norwegian Fjord", "Novokirghiz", "Oberlander Horse", "Ogaden", "Oldenburg Horse", "Orlov trotter", "Ostfriesen", "Paint", "Pampa Horse", "Paso Fino", "Pentro Horse", "Percheron", "Persano Horse", "Peruvian Paso", "Pintabian", "Pleven Horse", "Poitevin Horse", "Posavac Horse", "Pottok", "Pryor Mountain Mustang", "Przewalski's Horse", "Pura Raza Espa\xF1ola", "Purosangue Orientale", "Qatgani", "Quarab", "Quarter Horse", "Racking Horse", "Retuerta Horse", "Rhenish German Coldblood", "Rhinelander Horse", "Riwoche Horse", "Rocky Mountain Horse", "Romanian Sporthorse", "Rottaler", "Russian Don", "Russian Heavy Draft", "Russian Trotter", "Saddlebred", "Salerno Horse", "Samolaco Horse", "San Fratello Horse", "Sarcidano Horse", "Sardinian Anglo-Arab", "Schleswig Coldblood", "Schwarzw\xE4lder Kaltblut", "Selale", "Sella Italiano", "Selle Fran\xE7ais", "Shagya Arabian", "Shan Horse", "Shire Horse", "Siciliano Indigeno", "Silesian Horse", "Sokolsky Horse", "Sorraia", "South German Coldblood", "Soviet Heavy Draft", "Spanish Anglo-Arab", "Spanish Barb", "Spanish Jennet Horse", "Spanish Mustang", "Spanish Tarpan", "Spanish-Norman Horse", "Spiti Horse", "Spotted Saddle Horse", "Standardbred Horse", "Suffolk Punch", "Swedish Ardennes", "Swedish Warmblood", "Swedish coldblood trotter", "Swiss Warmblood", "Taish\u016B Horse", "Takhi", "Tawleed", "Tchernomor", "Tennessee Walking Horse", "Tersk Horse", "Thoroughbred", "Tiger Horse", "Tinker Horse", "Tolfetano", "Tori Horse", "Trait Du Nord", "Trakehner", "Tsushima", "Tuigpaard", "Ukrainian Riding Horse", "Unmol Horse", "Uzunyayla", "Ventasso Horse", "Virginia Highlander", "Vlaamperd", "Vladimir Heavy Draft", "Vyatka", "Waler", "Waler Horse", "Walkaloosa", "Warlander", "Warmblood", "Welsh Cob", "Westphalian Horse", "Wielkopolski", "W\xFCrttemberger", "Xilingol Horse", "Yakutian Horse", "Yili Horse", "Yonaguni Horse", "Zaniskari", "Zhemaichu", "Zweibr\xFCcker", "\u017Demaitukas"];
var h = ["Acacia-ants", "Acorn-plum gall", "Aerial yellowjacket", "Africanized honey bee", "Allegheny mound ant", "Almond stone wasp", "Ant", "Arboreal ant", "Argentine ant", "Asian paper wasp", "Baldfaced hornet", "Bee", "Bigheaded ant", "Black and yellow mud dauber", "Black carpenter ant", "Black imported fire ant", "Blue horntail woodwasp", "Blue orchard bee", "Braconid wasp", "Bumble bee", "Carpenter ant", "Carpenter wasp", "Chalcid wasp", "Cicada killer", "Citrus blackfly parasitoid", "Common paper wasp", "Crazy ant", "Cuckoo wasp", "Cynipid gall wasp", "Eastern Carpenter bee", "Eastern yellowjacket", "Elm sawfly", "Encyrtid wasp", "Erythrina gall wasp", "Eulophid wasp", "European hornet", "European imported fire ant", "False honey ant", "Fire ant", "Forest bachac", "Forest yellowjacket", "German yellowjacket", "Ghost ant", "Giant ichneumon wasp", "Giant resin bee", "Giant wood wasp", "Golden northern bumble bee", "Golden paper wasp", "Gouty oak gall", "Grass Carrying Wasp", "Great black wasp", "Great golden digger wasp", "Hackberry nipple gall parasitoid", "Honey bee", "Horned oak gall", "Horse guard wasp", "Hunting wasp", "Ichneumonid wasp", "Keyhole wasp", "Knopper gall", "Large garden bumble bee", "Large oak-apple gall", "Leafcutting bee", "Little fire ant", "Little yellow ant", "Long-horned bees", "Long-legged ant", "Macao paper wasp", "Mallow bee", "Marble gall", "Mossyrose gall wasp", "Mud-daubers", "Multiflora rose seed chalcid", "Oak apple gall wasp", "Oak rough bulletgall wasp", "Oak saucer gall", "Oak shoot sawfly", "Odorous house ant", "Orange-tailed bumble bee", "Orangetailed potter wasp", "Oriental chestnut gall wasp", "Paper wasp", "Pavement ant", "Pigeon tremex", "Pip gall wasp", "Prairie yellowjacket", "Pteromalid wasp", "Pyramid ant", "Raspberry Horntail", "Red ant", "Red carpenter ant", "Red harvester ant", "Red imported fire ant", "Red wasp", "Red wood ant", "Red-tailed wasp", "Reddish carpenter ant", "Rough harvester ant", "Sawfly parasitic wasp", "Scale parasitoid", "Silky ant", "Sirex woodwasp", "Siricid woodwasp", "Smaller yellow ant", "Southeastern blueberry bee", "Southern fire ant", "Southern yellowjacket", "Sphecid wasp", "Stony gall", "Sweat bee", "Texas leafcutting ant", "Tiphiid wasp", "Torymid wasp", "Tramp ant", "Valentine ant", "Velvet ant", "Vespid wasp", "Weevil parasitoid", "Western harvester ant", "Western paper wasp", "Western thatching ant", "Western yellowjacket", "White-horned horntail", "Willow shoot sawfly", "Woodwasp", "Wool sower gall maker", "Yellow Crazy Ant", "Yellow and black potter wasp", "Yellow-horned horntail"];
var y = ["Asiatic Lion", "Barbary Lion", "Cape lion", "Masai Lion", "Northeast Congo Lion", "Transvaal lion", "West African Lion"];
var p = ["Ace", "Archie", "Bailey", "Bandit", "Bella", "Bentley", "Bruno", "Buddy", "Charlie", "Coco", "Cookie", "Cooper", "Daisy", "Dixie", "Finn", "Ginger", "Gracie", "Gus", "Hank", "Jack", "Jax", "Joey", "Kobe", "Leo", "Lola", "Louie", "Lucy", "Maggie", "Max", "Mia", "Milo", "Molly", "Murphey", "Nala", "Nova", "Ollie", "Oreo", "Rosie", "Scout", "Stella", "Teddy", "Tuffy"];
var g = ["American", "American Chinchilla", "American Fuzzy Lop", "American Sable", "Argente Brun", "Belgian Hare", "Beveren", "Blanc de Hotot", "Britannia Petite", "Californian", "Champagne D\u2019Argent", "Checkered Giant", "Cinnamon", "Cr\xE8me D\u2019Argent", "Dutch", "Dwarf Hotot", "English Angora", "English Lop", "English Spot", "Flemish Giant", "Florida White", "French Angora", "French Lop", "Giant Angora", "Giant Chinchilla", "Harlequin", "Havana", "Himalayan", "Holland Lop", "Jersey Wooly", "Lilac", "Lionhead", "Mini Lop", "Mini Rex", "Mini Satin", "Netherland Dwarf", "New Zealand", "Palomino", "Polish", "Rex", "Rhinelander", "Satin", "Satin Angora", "Silver", "Silver Fox", "Silver Marten", "Standard Chinchilla", "Tan", "Thrianta"];
var b = ["Abrocoma", "Abrocoma schistacea", "Aconaemys", "Aconaemys porteri", "African brush-tailed porcupine", "Andean mountain cavy", "Argentine tuco-tuco", "Ashy chinchilla rat", "Asiatic brush-tailed porcupine", "Atherurus", "Azara's agouti", "Azara's tuco-tuco", "Bahia porcupine", "Bathyergus", "Bathyergus janetta", "Bathyergus suillus", "Bennett's chinchilla rat", "Bicolored-spined porcupine", "Black agouti", "Black dwarf porcupine", "Black-rumped agouti", "Black-tailed hairy dwarf porcupine", "Bolivian chinchilla rat", "Bolivian tuco-tuco", "Bonetto's tuco-tuco", "Brandt's yellow-toothed cavy", "Brazilian guinea pig", "Brazilian porcupine", "Brazilian tuco-tuco", "Bridge's degu", "Brown hairy dwarf porcupine", "Budin's chinchilla rat, A. budini", "Cape porcupine", "Catamarca tuco-tuco", "Cavia", "Central American agouti", "Chacoan tuco-tuco", "Chilean rock rat", "Chinchilla", "Coendou", "Coiban agouti", "Colburn's tuco-tuco", "Collared tuco-tuco", "Common degu", "Common yellow-toothed cavy", "Conover's tuco-tuco", "Coruro", "Crested agouti", "Crested porcupine", "Cryptomys", "Cryptomys bocagei", "Cryptomys damarensis", "Cryptomys foxi", "Cryptomys hottentotus", "Cryptomys mechowi", "Cryptomys ochraceocinereus", "Cryptomys zechi", "Ctenomys", "Cuniculus", "Cuscomys", "Cuscomys ashanika", "Dactylomys", "Dactylomys boliviensis", "Dactylomys dactylinus", "Dactylomys peruanus", "Dasyprocta", "Domestic guinea pig", "Emily's tuco-tuco", "Erethizon", "Famatina chinchilla rat", "Frosted hairy dwarf porcupine", "Fukomys", "Fukomys amatus", "Fukomys anselli", "Fukomys bocagei", "Fukomys damarensis", "Fukomys darlingi", "Fukomys foxi", "Fukomys ilariae", "Fukomys kafuensis", "Fukomys mechowii", "Fukomys micklemi", "Fukomys occlusus", "Fukomys ochraceocinereus", "Fukomys whytei", "Fukomys zechi", "Furtive tuco-tuco", "Galea", "Georychus", "Georychus capensis", "Golden viscacha-rat", "Goya tuco-tuco", "Greater guinea pig", "Green acouchi", "Haig's tuco-tuco", "Heliophobius", "Heliophobius argenteocinereus", "Heterocephalus", "Heterocephalus glaber", "Highland tuco-tuco", "Hystrix", "Indian porcupine", "Isla Mocha degu", "Kalinowski agouti", "Kannabateomys", "Kannabateomys amblyonyx", "Lagidium", "Lagostomus", "Lewis' tuco-tuco", "Long-tailed chinchilla", "Long-tailed porcupine", "Los Chalchaleros' viscacha-rat", "Lowland paca", "Magellanic tuco-tuco", "Malayan porcupine", "Maule tuco-tuco", "Mendoza tuco-tuco", "Mexican agouti", "Mexican hairy dwarf porcupine", "Microcavia", "Montane guinea pig", "Moon-toothed degu", "Mottled tuco-tuco", "Mountain degu", "Mountain paca", "Mountain viscacha-rat", "Myoprocta", "Natterer's tuco-tuco", "North American porcupine", "Northern viscacha", "Octodon", "Octodontomys", "Octomys", "Olallamys", "Olallamys albicauda", "Olallamys edax", "Orinoco agouti", "Paraguaian hairy dwarf porcupine", "Pearson's tuco-tuco", "Peruvian tuco-tuco", "Philippine porcupine", "Pipanacoctomys", "Plains viscacha", "Plains viscacha-rat", "Porteous' tuco-tuco", "Punta de Vacas chinchilla rat", "Red acouchi", "Red-rumped agouti", "Reddish tuco-tuco", "Rio Negro tuco-tuco", "Robust tuco-tuco", "Roosmalen's dwarf porcupine", "Rothschild's porcupine", "Ruatan Island agouti", "Sage's rock rat", "Salinoctomys", "Salta tuco-tuco", "San Luis tuco-tuco", "Santa Catarina's guinea pig", "Shiny guinea pig", "Shipton's mountain cavy", "Short-tailed chinchilla", "Silky tuco-tuco", "Social tuco-tuco", "Southern mountain cavy", "Southern tuco-tuco", "Southern viscacha", "Spalacopus", "Spix's yellow-toothed cavy", "Steinbach's tuco-tuco", "Streaked dwarf porcupine", "Strong tuco-tuco", "Stump-tailed porcupine", "Sumatran porcupine", "Sunda porcupine", "Talas tuco-tuco", "Tawny tuco-tuco", "Thick-spined porcupine", "Tiny tuco-tuco", "Trichys", "Tucuman tuco-tuco", "Tympanoctomys", "Uspallata chinchilla rat", "White-toothed tuco-tuco", "Wolffsohn's viscacha"];
var C = ["Abaco Island boa", "Aesculapian snake", "African beaked snake", "African puff adder", "African rock python", "African twig snake", "African wolf snake", "Amazon tree boa", "Amazonian palm viper", "American Vine Snake", "American copperhead", "Amethystine python", "Anaconda", "Andaman cat snake", "Andaman cobra", "Angolan python", "Annulated sea snake", "Arabian cobra", "Arafura file snake", "Arizona black rattlesnake", "Arizona coral snake", "Aruba rattlesnake", "Asian Vine Snake, Whip Snake", "Asian cobra", "Asian keelback", "Asian pipe snake", "Asp", "Asp viper", "Assam keelback", "Australian copperhead", "Australian scrub python", "Baird's rat snake", "Baja California lyresnake", "Ball Python", "Ball python", "Bamboo pitviper", "Bamboo viper", "Banded Flying Snake", "Banded cat-eyed snake", "Banded krait", "Banded pitviper", "Banded water cobra", "Barbour's pit viper", "Barred wolf snake", "Beaked sea snake", "Beauty rat snake", "Beddome's cat snake", "Beddome's coral snake", "Bimini racer", "Bird snake", "Bismarck ringed python", "Black headed python", "Black krait", "Black mamba", "Black rat snake", "Black snake", "Black tree cobra", "Black-banded trinket snake", "Black-headed snake", "Black-necked cobra", "Black-necked spitting cobra", "Black-speckled palm-pitviper", "Black-striped keelback", "Black-tailed horned pit viper", "Blanding's tree snake", "Blind snake", "Blonde hognose snake", "Blood python", "Blue krait", "Blunt-headed tree snake", "Bluntnose viper", "Boa", "Boa constrictor", "Bocourt's water snake", "Boelen python", "Boiga", "Bolivian anaconda", "Boomslang", "Bornean pitviper", "Borneo short-tailed python", "Brahminy blind snake", "Brazilian coral snake", "Brazilian mud Viper", "Brazilian smooth snake", "Bredl's python", "Brongersma's pitviper", "Brown snake", "Brown spotted pitviper[4]", "Brown tree snake", "Brown water python", "Brown white-lipped python", "Buff striped keelback", "Bull snake", "Burmese keelback", "Burmese krait", "Burmese python", "Burrowing cobra", "Burrowing viper", "Bush viper", "Bushmaster", "Buttermilk racer", "Calabar python", "California kingsnake", "Canebrake", "Cantil", "Cantor's pitviper", "Cape cobra", "Cape coral snake", "Cape gopher snake", "Carpet viper", "Cascabel", "Caspian cobra", "Cat snake", "Cat-eyed night snake", "Cat-eyed snake", "Central American lyre snake", "Central ranges taipan", "Centralian carpet python", "Ceylon krait", "Chappell Island tiger snake", "Checkered garter snake", "Checkered keelback", "Chicken snake", "Chihuahuan ridge-nosed rattlesnake", "Children's python", "Chinese tree viper", "Coachwhip snake", "Coastal carpet python", "Coastal taipan", "Cobra", "Collett's snake", "Colorado desert sidewinder", "Common adder", "Common cobra", "Common garter snake", "Common ground snake", "Common keelback", "Common lancehead", "Common tiger snake", "Common worm snake", "Congo snake", "Congo water cobra", "Copperhead", "Coral snake", "Corn snake", "Coronado Island rattlesnake", "Cottonmouth", "Crossed viper", "Crowned snake", "Cuban boa", "Cuban wood snake", "Cyclades blunt-nosed viper", "Dauan Island water python", "De Schauensee's anaconda", "Death Adder", "Desert death adder", "Desert kingsnake", "Desert woma python", "Diamond python", "Dog-toothed cat snake", "Down's tiger snake", "Dubois's sea snake", "Dumeril's boa", "Durango rock rattlesnake", "Dusky pigmy rattlesnake", "Dusty hognose snake", "Dwarf beaked snake", "Dwarf boa", "Dwarf pipe snake", "Dwarf sand adder", "Eastern brown snake", "Eastern coral snake", "Eastern diamondback rattlesnake", "Eastern green mamba", "Eastern hognose snake", "Eastern lyre snake", "Eastern mud snake", "Eastern racer", "Eastern tiger snake", "Eastern water cobra", "Eastern yellowbelly sad racer", "Egg-eater", "Egyptian asp", "Egyptian cobra", "Elegant pitviper", "Emerald tree boa", "Equatorial spitting cobra", "European asp", "European smooth snake", "Eyelash palm-pitviper", "Eyelash pit viper", "Eyelash viper", "False cobra", "False horned viper", "False water cobra", "Fan-Si-Pan horned pitviper", "Fea's viper", "Fer-de-lance", "Fierce snake", "Fifty pacer", "Fishing snake", "Flat-nosed pitviper", "Flinders python", "Flying snake", "Forest cobra", "Forest flame snake", "Forsten's cat snake", "Fox snake, three species of Pantherophis", "Gaboon viper", "Garter snake", "Giant Malagasy hognose snake", "Godman's pit viper", "Gold tree cobra", "Gold-ringed cat snake", "Golden tree snake", "Grand Canyon rattlesnake", "Grass snake", "Gray cat snake", "Great Basin rattlesnake", "Great Lakes bush viper", "Great Plains rat snake", "Green anaconda", "Green cat-eyed snake", "Green mamba", "Green palm viper", "Green rat snake", "Green snake", "Green tree pit viper", "Green tree python", "Grey Lora", "Grey-banded kingsnake", "Ground snake", "Guatemalan palm viper", "Guatemalan tree viper", "Habu", "Habu pit viper", "Hagen's pitviper", "Hairy bush viper", "Halmahera python", "Hardwicke's sea snake", "Harlequin coral snake", "High Woods coral snake", "Hill keelback", "Himalayan keelback", "Hogg Island boa", "Hognose snake", "Hognosed viper", "Honduran palm viper", "Hook Nosed Sea Snake", "Hopi rattlesnake", "Horned adder", "Horned desert viper", "Horned viper", "Horseshoe pitviper", "Hundred pacer", "Hutton's tree viper", "Ikaheka snake", "Indian cobra", "Indian flying snake", "Indian krait", "Indian python", "Indian tree viper", "Indigo snake", "Indochinese spitting cobra", "Indonesian water python", "Inland carpet python", "Inland taipan", "Jamaican Tree Snake", "Jamaican boa", "Jan's hognose snake", "Japanese forest rat snake", "Japanese rat snake", "Japanese striped snake", "Javan spitting cobra", "Jerdon's pitviper", "Jumping viper", "Jungle carpet python", "Kanburian pit viper", "Kaulback's lance-headed pitviper", "Kayaudi dwarf reticulated python", "Kaznakov's viper", "Keelback", "Kham Plateau pitviper", "Khasi Hills keelback", "King Island tiger snake", "King brown", "King cobra", "King rat snake", "King snake", "Krait", "Krefft's tiger snake", "Lance-headed rattlesnake", "Lancehead", "Large shield snake", "Large-eyed pitviper", "Large-scaled tree viper", "Leaf viper", "Leaf-nosed viper", "Lesser black krait", "Levant viper", "Long-nosed adder", "Long-nosed tree snake", "Long-nosed viper", "Long-nosed whip snake", "Long-tailed rattlesnake", "Longnosed worm snake", "Lora", "Lyre snake", "Machete savane", "Macklot's python", "Madagascar ground boa", "Madagascar tree boa", "Malabar rock pitviper", "Malayan krait", "Malayan long-glanded coral snake", "Malayan pit viper", "Malcolm's tree viper", "Mamba", "Mamushi", "Manchurian Black Water Snake", "Mandalay cobra", "Mandarin rat snake", "Mangrove pit viper", "Mangrove snake", "Mangshan pitviper", "Many-banded krait", "Many-banded tree snake", "Many-horned adder", "Many-spotted cat snake", "Massasauga rattlesnake", "McMahon's viper", "Mexican black kingsnake", "Mexican green rattlesnake", "Mexican hognose snake", "Mexican palm-pitviper", "Mexican parrot snake", "Mexican racer", "Mexican vine snake", "Mexican west coast rattlesnake", "Midget faded rattlesnake", "Milk snake", "Moccasin snake", "Modest keelback", "Mojave desert sidewinder", "Mojave rattlesnake", "Mole viper", "Mollucan python", "Moluccan flying snake", "Montpellier snake", "Motuo bamboo pitviper", "Mountain adder", "Mozambique spitting cobra", "Mud adder", "Mud snake", "Mussurana", "Namaqua dwarf adder", "Namib dwarf sand adder", "Narrowhead Garter Snake", "New Guinea carpet python", "Nichell snake", "Nicobar Island keelback", "Nicobar bamboo pitviper", "Night snake", "Nightingale adder", "Nilgiri keelback", "Nitsche's bush viper", "Nitsche's tree viper", "North Philippine cobra", "North eastern king snake", "Northeastern hill krait", "Northern black-tailed rattlesnake", "Northern tree snake", "Northern water snake", "Northern white-lipped python", "Northwestern carpet python", "Nose-horned viper", "Nubian spitting cobra", "Oaxacan small-headed rattlesnake", "Oenpelli python", "Olive python", "Olive sea snake", "Orange-collared keelback", "Ornate flying snake", "Palestine viper", "Pallas' viper", "Palm viper", "Papuan python", "Paradise flying snake", "Parrot snake", "Patchnose snake", "Paupan taipan", "Pelagic sea snake", "Peninsula tiger snake", "Peringuey's adder", "Perrotet's shieldtail snake", "Persian rat snake", "Philippine cobra", "Philippine pitviper", "Pine snake", "Pipe snake", "Pit viper", "Pointed-scaled pit viper[5]", "Pope's tree viper", "Portuguese viper", "Prairie kingsnake", "Puerto Rican boa", "Puff adder", "Pygmy python", "Python", "Queen snake", "Racer", "Raddysnake", "Rainbow boa", "Rat snake", "Rattler", "Rattlesnake", "Red blood python", "Red diamond rattlesnake", "Red spitting cobra", "Red-backed rat snake", "Red-bellied black snake", "Red-headed krait", "Red-necked keelback", "Red-tailed bamboo pitviper", "Red-tailed boa", "Red-tailed pipe snake", "Reticulated python", "Rhinoceros viper", "Rhombic night adder", "Ribbon snake", "Rinkhals", "Rinkhals cobra", "River jack", "Rosy boa", "Rough green snake", "Rough-scaled bush viper", "Rough-scaled python", "Rough-scaled tree viper", "Royal python", "Rubber boa", "Rufous beaked snake", "Rungwe tree viper", "San Francisco garter snake", "Sand adder", "Sand boa", "Savu python", "Saw-scaled viper", "Scarlet kingsnake", "Schlegel's viper", "Schultze's pitviper", "Sea snake", "Sedge viper", "Selayer reticulated python", "Sharp-nosed viper", "Shield-nosed cobra", "Shield-tailed snake", "Siamese palm viper", "Side-striped palm-pitviper", "Sidewinder", "Sikkim keelback", "Sinai desert cobra", "Sind krait", "Small-eyed snake", "Smooth green snake", "Smooth snake", "Snorkel viper", "Snouted cobra", "Sonoran sidewinder", "South American hognose snake", "South eastern corn snake", "Southern Indonesian spitting cobra", "Southern Pacific rattlesnake", "Southern Philippine cobra", "Southern black racer", "Southern white-lipped python", "Southwestern black spitting cobra", "Southwestern blackhead snake", "Southwestern carpet python", "Southwestern speckled rattlesnake", "Speckle-bellied keelback", "Speckled kingsnake", "Spectacled cobra", "Spiny bush viper", "Spitting cobra", "Spotted python", "Sri Lankan pit viper", "Stejneger's bamboo pitviper", "Stiletto snake", "Stimson's python", "Stoke's sea snake", "Storm water cobra", "Striped snake", "Sumatran short-tailed python", "Sumatran tree viper", "Sunbeam snake", "Taipan", "Taiwan cobra", "Tan racer", "Tancitaran dusky rattlesnake", "Tanimbar python", "Tasmanian tiger snake", "Tawny cat snake", "Temple pit viper", "Temple viper", "Tentacled snake", "Texas Coral Snake", "Texas blind snake", "Texas garter snake", "Texas lyre snake", "Texas night snake", "Thai cobra", "Three-lined ground snake", "Tibetan bamboo pitviper", "Tic polonga", "Tiger pit viper", "Tiger rattlesnake", "Tiger snake", "Tigre snake", "Timber rattlesnake", "Timor python", "Titanboa", "Tree boa", "Tree snake", "Tree viper", "Trinket snake", "Tropical rattlesnake", "Twig snake", "Twin Headed King Snake", "Twin-Barred tree snake", "Twin-spotted rat snake", "Twin-spotted rattlesnake", "Undulated pit viper", "Uracoan rattlesnake", "Ursini's viper", "Urutu", "Vine snake", "Viper", "Viper Adder", "Vipera ammodytes", "Wagler's pit viper", "Wart snake", "Water adder", "Water moccasin", "Water snake", "West Indian racer", "Western blind snake", "Western carpet python", "Western coral snake", "Western diamondback rattlesnake", "Western green mamba", "Western ground snake", "Western hog-nosed viper", "Western mud snake", "Western tiger snake", "Western woma python", "Wetar Island python", "Whip snake", "White-lipped keelback", "White-lipped python", "White-lipped tree viper", "Wirot's pit viper", "Wolf snake", "Woma python", "Worm snake", "Wutu", "Wynaad keelback", "Yarara", "Yellow anaconda", "Yellow-banded sea snake", "Yellow-bellied sea snake", "Yellow-lined palm viper", "Yellow-lipped sea snake", "Yellow-striped rat snake", "Yunnan keelback", "Zebra snake", "Zebra spitting cobra"];
var S = ["bat", "bear", "bee", "bird", "butterfly", "cat", "cow", "crocodile", "deer", "dog", "dolphin", "eagle", "elephant", "fish", "flamingo", "fox", "frog", "gecko", "giraffe", "gorilla", "hamster", "hippopotamus", "horse", "kangaroo", "koala", "lion", "monkey", "ostrich", "panda", "parrot", "peacock", "penguin", "polar bear", "rabbit", "rhinoceros", "sea lion", "shark", "snake", "squirrel", "tiger", "turtle", "whale", "wolf", "zebra"];
var _a = { bear: n, bird: i, cat: t, cetacean: l, cow: s, crocodilia: d, dog: u, fish: c, horse: m, insect: h, lion: y, pet_name: p, rabbit: g, rodent: b, snake: C, type: S };
var k = _a;
var f = ["{{person.name}}", "{{company.name}}"];
var v = ["Redhold", "Treeflex", "Trippledex", "Kanlam", "Bigtax", "Daltfresh", "Toughjoyfax", "Mat Lam Tam", "Otcom", "Tres-Zap", "Y-Solowarm", "Tresom", "Voltsillam", "Biodex", "Greenlam", "Viva", "Matsoft", "Temp", "Zoolab", "Subin", "Rank", "Job", "Stringtough", "Tin", "It", "Home Ing", "Zamit", "Sonsing", "Konklab", "Alpha", "Latlux", "Voyatouch", "Alphazap", "Holdlamis", "Zaam-Dox", "Sub-Ex", "Quo Lux", "Bamity", "Ventosanzap", "Lotstring", "Hatity", "Tempsoft", "Overhold", "Fixflex", "Konklux", "Zontrax", "Tampflex", "Span", "Namfix", "Transcof", "Stim", "Fix San", "Sonair", "Stronghold", "Fintone", "Y-find", "Opela", "Lotlux", "Ronstring", "Zathin", "Duobam", "Keylex"];
var A = ["0.#.#", "0.##", "#.##", "#.#", "#.#.#"];
var Qa = { author: f, name: v, version: A };
var B = Qa;
var T = ["A.A. Milne", "Agatha Christie", "Alan Moore and Dave Gibbons", "Albert Camus", "Aldous Huxley", "Alexander Pope", "Alexandre Dumas", "Alice Walker", "Andrew Lang", "Anne Frank", "Anthony Burgess", "Anthony Trollope", "Antoine de Saint-Exup\xE9ry", "Anton Chekhov", "Anton Pavlovich Chekhov", "Arthur Conan Doyle", "Arthur Schopenhauer", "Aylmer Maude", "Ayn Rand", "Beatrix Potter", "Benjamin Disraeli", "Benjamin Jowett", "Bernard Shaw", "Bertrand Russell", "Bhagavanlal Indrajit", "Boris Pasternak", "Bram Stoker", "Brian Evenson", "C.E. Brock", "C.S. Lewis", "Carson McCallers", "Charles Dickens", "Charles E. Derbyshire", "Charlotte Bront\xEB", "Charlotte Perkins Gilman", "Chinua Achebe", "Clifford R. Adams", "Constance Garnett", "Cormac McCarthy", "D.H. Lawrence", "Dan Brown", "Daniel Defoe", "Dante Alighieri", "Dashiell Hammett", "David Widger", "David Wyllie", "Dean Koontz", "Don DeLillo", "E.M. Forster", "Edgar Allan Poe", "Edgar Rice Burroughs", "Elizabeth Cleghorn Gaskell", "Elizabeth Von Arnim", "Emily Bront\xEB", "Erich Remarque", "Ernest Hemingway", "Evelyn Waugh", "F. Scott Fitzgerald", "Ford Madox Ford", "Frances Hodgson Burnett", "Frank Herbert", "Frank T. Merrill", "Franz Kafka", "Friedrich Wilhelm Nietzsche", "Fyodor Dostoyevsky", "G.K. Chesterton", "Gabriel Garcia Marquez", "Geoffrey Chaucer", "George Eliot", "George Grossmith", "George Orwell", "George R. R. Martin", "George Saunders", "Grady Ward", "Graham Greene", "Gustave Dor\xE9", "Gustave Flaubert", "Guy de Maupassant", "G\xFCnter Grass", "H.G. Wells", "H.P. Lovecraft", "Harper Lee", "Harriet Beecher Stowe", "Haruki Murakami", "Henrik Ibsen", "Henry David Thoreau", "Henry Fielding", "Henry James", "Henry Miller", "Henry Morley", "Herman Melville", "Hermann Broch", "Homer", "Honor\xE9 de Balzac", "Ian McEwan", "Isabel Florence Hapgood", "Italo Calvino", "J.D. Salinger", "J.K. Rowling", "J.M. Barrie", "J.R.R. Tolkien", "Jack Kerouac", "Jack London", "Jacob Grimm", "Jacqueline Crooks", "James Baldwin", "James Dickey", "James Ellroy", "James Joyce", "James Patterson", "Jane Austen", "Johann Wolfgang von Goethe", "John Bunyan", "John Camden Hotten", "John Dos Passos", "John Green", "John Grisham", "John Kennedy Toole", "John Milton", "John Ormsby", "John Steinbeck", "John Updike", "Jonathan Franzen", "Jonathan Swift", "Joseph Conrad", "Joseph Heller", "Jos\xE9 Rizal", "Judy Blume", "Jules Verne", "Junot Diaz", "Karl Marx", "Kazuo Ishiguro", "Ken Follett", "Ken Kesey", "Kenneth Grahame", "Khaled Hosseini", "Kingsley Amis", "Kurt Vonnegut", "L. Frank Baum", "L.M. Montgomery", "Laurence Sterne", "Leo Tolstoy", "Lewis Carroll", "Louisa May Alcott", "Louise Maude", "Malcolm Lowry", "Marcel Proust", "Margaret Atwood", "Margaret Mitchell", "Marilynne Robinson", "Mark Twain", "Martin Amis", "Mary Shelley", "Michael Chabon", "Miguel de Cervantes", "Mikhail Bulgakov", "Muriel Spark", "Nancy Mitford", "Nathanael West", "Nathaniel Hawthorne", "Neil Gaiman", "Niccolo Machiavelli", "Norman Mailer", "Oscar Levy", "Oscar Wilde", "P.G. Wodehouse", "Paulo Coelho", "Peter Carey", "Philip Pullman", "Philip Roth", "Plato", "R.L. Stine", "Rachel Kushner", "Ralph Ellison", "Ray Bradbury", "Raymond Chandler", "Richard Wagner", "Richard Wright", "Richard Yates", "Roald Dahl", "Robert Graves", "Robert Louis Stevenson", "Robert Penn Warren", "Rudyard Kipling", "Salman Rushdie", "Samuel Beckett", "Samuel Butler", "Samuel Richardson", "Saul Bellow", "Shivaram Parashuram Bhide", "Sir Arthur Conan Doyle", "Sir Richard Francis Burton", "Stendhal", "Stephen Hawking", "Stephen King", "Sun Tzu", "Suzanne Collins", "T. Smollett", "T.S. Eliot", "Theodore Alois Buckley", "Theodore Dreiser", "Thomas Hardy", "Thomas Love Peacock", "Thomas Mann", "Toni Morrison", "Truman Capote", "V.S. Naipaul", "Vance Packard", "Vatsyayana", "Victor Hugo", "Virgil", "Virginia Woolf", "Vladimir Nabokov", "Voltaire", "W.G. Sebald", "W.K. Marriott", "Walker Percy", "Walt Whitman", "Walter Scott", "Wilhelm Grimm", "Wilkie Collins", "William Faulkner", "William Gibson", "William Golding", "William Makepeace Thackeray", "William Shakespeare", "Zadie Smith"];
var M = ["Audiobook", "Ebook", "Hardcover", "Paperback"];
var w = ["Adventure", "Biography", "Business", "Children's Literature", "Classic", "Comedy", "Comic", "Detective", "Drama", "Fantasy", "Graphic Novel", "Historical Fiction", "Horror", "Memoir", "Mystery", "Mythology", "Philosophy", "Poetry", "Psychology", "Religion", "Romance", "Science Fiction", "Thriller", "Western", "Young Adult"];
var L = ["Academic Press", "Ace Books", "Addison-Wesley", "Adis International", "Airiti Press", "Allen Ltd", "Andrews McMeel Publishing", "Anova Books", "Anvil Press Poetry", "Applewood Books", "Apress", "Athabasca University Press", "Atheneum Books", "Atheneum Publishers", "Atlantic Books", "Atlas Press", "BBC Books", "Ballantine Books", "Banner of Truth Trust", "Bantam Books", "Bantam Spectra", "Barrie & Jenkins", "Basic Books", "Belknap Press", "Bella Books", "Bellevue Literary Press", "Berg Publishers", "Berkley Books", "Bison Books", "Black Dog Publishing", "Black Library", "Black Sparrow Books", "Blackie and Son Limited", "Blackstaff Press", "Blackwell Publishing", "Bloodaxe Books", "Bloomsbury Publishing Plc", "Blue Ribbon Books", "Book League of America", "Book Works", "Booktrope", "Borgo Press", "Bowes & Bowes", "Boydell & Brewer", "Breslov Research Institute", "Brill", "Brimstone Press", "Broadview Press", "Burns & Oates", "Butterworth-Heinemann", "Caister Academic Press", "Cambridge University Press", "Candlewick Press", "Canongate Books", "Carcanet Press", "Carlton Books", "Carlton Publishing Group", "Carnegie Mellon University Press", "Casemate Publishers", "Cengage Learning", "Central European University Press", "Chambers Harrap", "Charles Scribner's Sons", "Chatto and Windus", "Chick Publications", "Chronicle Books", "Churchill Livingstone", "Cisco Press", "City Lights Publishers", "Cloverdale Corporation", "D. Appleton & Company", "D. Reidel", "DAW Books", "Da Capo Press", "Daedalus Publishing", "Dalkey Archive Press", "Darakwon Press", "David & Charles", "Dedalus Books", "Del Rey Books", "E. P. Dutton", "ECW Press", "Earthscan", "Edupedia Publications", "Eel Pie Publishing", "Eerdmans Publishing", "Ellora's Cave", "Elsevier", "Emerald Group Publishing", "Etruscan Press", "FabJob", "Faber and Faber", "Fairview Press", "Farrar, Straus & Giroux", "Fearless Books", "Felony & Mayhem Press", "Firebrand Books", "Flame Tree Publishing", "Focal Press", "G-Unit Books", "G. P. Putnam's Sons", "Gaspereau Press", "Gay Men's Press", "Gefen Publishing House", "George H. Doran Company", "George Newnes", "George Routledge & Sons", "Godwit Press", "Golden Cockerel Press", "HMSO", "Hachette Book Group USA", "Hackett Publishing Company", "Hamish Hamilton", "Happy House", "Harcourt Assessment", "Harcourt Trade Publishers", "Harlequin Enterprises Ltd", "Harper & Brothers", "Harper & Row", "HarperCollins", "HarperPrism", "HarperTrophy", "Harry N. Abrams, Inc.", "Harvard University Press", "Harvest House", "Harvill Press at Random House", "Hawthorne Books", "Hay House", "Haynes Manuals", "Heyday Books", "Hodder & Stoughton", "Hodder Headline", "Hogarth Press", "Holland Park Press", "Holt McDougal", "Horizon Scientific Press", "Ian Allan Publishing", "Ignatius Press", "Imperial War Museum", "Indiana University Press", "J. M. Dent", "Jaico Publishing House", "Jarrolds Publishing", "John Blake Publishing", "Karadi Tales", "Kensington Books", "Kessinger Publishing", "Kodansha", "Kogan Page", "Koren Publishers Jerusalem", "Ladybird Books", "Leaf Books", "Leafwood Publishers", "Left Book Club", "Legend Books", "Lethe Press", "Libertas Academica", "Liberty Fund", "Library of America", "Lion Hudson", "Macmillan Publishers", "Mainstream Publishing", "Manchester University Press", "Mandrake Press", "Mandrake of Oxford", "Manning Publications", "Manor House Publishing", "Mapin Publishing", "Marion Boyars Publishers", "Mark Batty Publisher", "Marshall Cavendish", "Marshall Pickering", "Martinus Nijhoff Publishers", "Mascot Books", "Matthias Media", "McClelland and Stewart", "McFarland & Company", "McGraw Hill Financial", "McGraw-Hill Education", "Medknow Publications", "Naiad Press", "Nauka", "NavPress", "New Directions Publishing", "New English Library", "New Holland Publishers", "New Village Press", "Newnes", "No Starch Press", "Nonesuch Press", "O'Reilly Media", "Oberon Books", "Open Court Publishing Company", "Open University Press", "Orchard Books", "Orion Books", "Packt Publishing", "Palgrave Macmillan", "Pan Books", "Pantheon Books at Random House", "Papadakis Publisher", "Parachute Publishing", "Parragon", "Pathfinder Press", "Paulist Press", "Pavilion Books", "Peace Hill Press", "Pecan Grove Press", "Pen and Sword Books", "Penguin Books", "Random House", "Reed Elsevier", "Reed Publishing", "SAGE Publications", "Salt Publishing", "Sams Publishing", "Schocken Books", "Scholastic Press", "Seagull Books", "Secker & Warburg", "Shambhala Publications", "Shire Books", "Shoemaker & Hoard Publishers", "Shuter & Shooter Publishers", "Sidgwick & Jackson", "Signet Books", "Simon & Schuster", "St. Martin's Press", "T & T Clark", "Tachyon Publications", "Tammi", "Target Books", "Tarpaulin Sky Press", "Tartarus Press", "Tate Publishing & Enterprises", "Taunton Press", "Taylor & Francis", "Ten Speed Press", "UCL Press", "Unfinished Monument Press", "United States Government Publishing Office", "University of Akron Press", "University of Alaska Press", "University of California Press", "University of Chicago Press", "University of Michigan Press", "University of Minnesota Press", "University of Nebraska Press", "Velazquez Press", "Verso Books", "Victor Gollancz Ltd", "Viking Press", "Vintage Books", "Vintage Books at Random House", "Virago Press", "Virgin Publishing", "Voyager Books", "Zed Books", "Ziff Davis Media", "Zondervan"];
var D = ["A Song of Ice and Fire", "Anna Karenina", "Colonel Race", "Discworld", "Dune", "Harry Potter", "Hercule Poirot", "His Dark Materials", "Jane Austen Murder Mysteries", "Little Women", "Outlander", "Percy Jackson", "Sherlock Holmes", "The Arc of a Scythe", "The Bartimaeus Trilogy", "The Border Trilogy", "The Chronicles of Narnia", "The Dark Tower", "The Dresden Files", "The Eighth Life", "The Foundation Series", "The Hitchhiker's Guide to the Galaxy", "The Hunger Games", "The Infinity Cycle", "The Inheritance Cycle", "The Lord of the Rings", "The Maze Runner", "The Prison Healer", "The Red Rising Saga", "The Southern Reach", "The Wheel of Time", "Thursday Next Series", "Twilight", "War and Peace"];
var R = ["1984", "20,000 Leagues Under the Sea", "A Bend in the River", "A Brief History of Time", "A Clockwork Orange", "A Confederacy of Dunces", "A Doll's House", "A Handful of Dust", "A Modest Proposal", "A Passage to India", "A Portrait of the Artist as a Young Man", "A Room with a View", "A Study in Scarlet", "A Tale of Two Cities", "A Wrinkle in Time", "Absalom, Absalom!", "Adventures of Huckleberry Finn", "Alice's Adventures in Wonderland", "All Quiet on the Western Front", "All the King's Men", "American Pastoral", "An American Tragedy", "And Then There Were None", "Animal Farm", "Anna Karenina", "Anne of Green Gables", "Are You There God? It's Me, Margaret", "As I Lay Dying", "Atlas Shrugged", "Atonement", "Austerlitz", "Beloved", "Beyond Good and Evil", "Bible", "Bleak House", "Blood Meridian", "Brave New World", "Brideshead Revisited", "Candide", "Carmilla", "Catch-22", "Charlie and the Chocolate Factory", "Charlotte's Web", "Clarissa", "Cranford", "Crime and Punishment", "Dao De Jing: A Minimalist Translation", "David Copperfield", "Deliverance", "Don Quixote", "Dora", "Dr. Zhivago", "Dracula", "Dubliners", "Dune", "East of Eden", "Emma", "Fahrenheit 451", "Faust", "For Whom the Bell Tolls", "Frankenstein", "Freakonomics", "Go Tell It on the Mountain", "Gone with the Wind", "Great Expectations", "Grimms' Fairy Tales", "Gulliver's Travels", "Hamlet", "Harry Potter and the Sorcerer's Stone", "Heart of Darkness", "Herzog", "His Dark Materials", "Hitting the line", "Housekeeping", "I, Claudius", "If on a Winter's Night a Traveler", "In Cold Blood", "In Search of Lost Time", "Invisible Man", "It", "Jane Eyre", "Josefine Mutzenbacher", "Jude the Obscure", "L.A. Confidential", "Leaves of Grass", "Les Miserables", "Life of Pi", "Little Women", "Lolita", "Long Walk to Freedom", "Lord Jim", "Lord of the Flies", "Lucky Jim", "Madame Bovary", "Malone Dies", "Meditations", "Men Without Women", "Metamorphosis", "Middlemarch", "Midnight's Children", "Moby Dick", "Money", "Mrs. Dalloway", "My Bondage and My Freedom", "My Life", "Native Son", "Neuromancer", "Never Let Me Go", "Nightmare Abbey", "Nineteen Eighty Four", "Nostromo", "Notes from the Underground", "Of Mice and Men", "Oliver Twist", "On the Duty of Civil Disobedience", "On the Road", "One Flew Over the Cuckoo's Nest", "One Hundred Years of Solitude", "One Thousand and One Nights", "Oscar and Lucinda", "Pale Fire", "Paradise Lost", "Peter Pan", "Portnoy's Complaint", "Pride and Prejudice", "Rabbit, Run", "Republic", "Revolutionary Road", "Robinson Crusoe", "Romeo and Juliet", "Ruth Fielding in Alaska", "Scoop", "Second Treatise of Government", "Slaughterhouse Five", "Stories of Anton Chekhov", "Sybil", "Tess of the d'Urbervilles", "The Adventures of Augie March", "The Adventures of Huckleberry Finn", "The Adventures of Sherlock Holmes", "The Adventures of Tom Sawyer", "The Aeneid", "The Alchemist", "The Ambassadors", "The Art of War", "The Big Sleep", "The Black Sheep", "The Blue Castle", "The Brief Wondrous Life of Oscar Wao", "The Brothers Karamazov", "The Call of the Wild", "The Canterbury Tales", "The Catcher in the Rye", "The Color Purple", "The Complete Works of Edgar Allen Poe", "The Corrections", "The Count of Monte Cristo", "The Day of the Locust", "The Diary of a Nobody", "The Diary of a Young Girl", "The Divine Comedy", "The Enchanted April", "The Fountainhead", "The Golden Bowl", "The Golden Notebook", "The Good Soldier", "The Grapes of Wrath", "The Great Gatsby", "The Handmaid's Tale", "The Heart is a Lonely Hunter", "The Heart of the Matter", "The Hobbit", "The Hound of the Baskervilles", "The Idiot", "The Iliad", "The King in Yellow", "The Kite Runner", "The Lion, the Witch, and the Wardrobe", "The Little Prince", "The Lord of the Rings", "The Magic Mountain", "The Maltese Falcon", "The Master and Margarita", "The Moviegoer", "The Naked and the Dead", "The Odyssey", "The Old Man and the Sea", "The Pickwick Papers", "The Picture of Dorian Gray", "The Pilgrim's Progress", "The Pillars of the Earth", "The Plague", "The Portrait of a Lady", "The Prime of Miss Jean Brodie", "The Prince", "The Problems of Philosophy", "The Prophet", "The Pursuit of Love", "The Rainbow", "The Red and the Black", "The Remains of the Day", "The Republic", "The Scarlet Letter", "The Sleepwalkers", "The Sound and the Fury", "The Stand", "The Strange Case of Dr. Jekyll and Mr. Hyde", "The Stranger", "The Sun Also Rises", "The Thirty-Nine Steps", "The Three Musketeers", "The Time Machine", "The Tin Drum", "The Trial", "The War of the Worlds", "The Waste Land", "The Way We Live Now", "The Wind in the Willows", "The Woman in White", "The Wonderful Wizard of Oz", "The Works of Edgar Allan Poe", "The Yellow Wallpaper", "Things Fall Apart", "Tinker, Tailor, Soldier, Spy", "To Kill a Mockingbird", "To the Lighthouse", "Tom Jones", "Treasure Island", "Tristram Shandy", "Tropic of Cancer", "U.S.A. Trilogy", "Ulysses", "Uncle Tom's Cabin", "Under the Volcano", "Underworld", "Vanity Fair", "Walden", "War and Peace", "Watchmen", "Winnie-the-Pooh", "Wuthering Heights"];
var Xa = { author: T, format: M, genre: w, publisher: L, series: D, title: R };
var P = Xa;
var H = ["###-###-####", "(###) ###-####", "1-###-###-####", "###.###.####"];
var $a = { formats: H };
var W = $a;
var G = ["azure", "black", "blue", "cyan", "fuchsia", "gold", "green", "grey", "indigo", "ivory", "lavender", "lime", "magenta", "maroon", "mint green", "olive", "orange", "orchid", "pink", "plum", "purple", "red", "salmon", "silver", "sky blue", "tan", "teal", "turquoise", "violet", "white", "yellow"];
var er = { human: G };
var F = er;
var N = ["Automotive", "Baby", "Beauty", "Books", "Clothing", "Computers", "Electronics", "Games", "Garden", "Grocery", "Health", "Home", "Industrial", "Jewelry", "Kids", "Movies", "Music", "Outdoors", "Shoes", "Sports", "Tools", "Toys"];
var E = ["Discover the {{animal.type}}-like agility of our {{commerce.product}}, perfect for {{word.adjective}} users", "Discover the {{word.adjective}} new {{commerce.product}} with an exciting mix of {{commerce.productMaterial}} ingredients", "Ergonomic {{commerce.product}} made with {{commerce.productMaterial}} for all-day {{word.adjective}} support", "Experience the {{color.human}} brilliance of our {{commerce.product}}, perfect for {{word.adjective}} environments", "Featuring {{science.chemical_element.name}}-enhanced technology, our {{commerce.product}} offers unparalleled {{word.adjective}} performance", "Innovative {{commerce.product}} featuring {{word.adjective}} technology and {{commerce.productMaterial}} construction", "Introducing the {{location.country}}-inspired {{commerce.product}}, blending {{word.adjective}} style with local craftsmanship", "New {{color.human}} {{commerce.product}} with ergonomic design for {{word.adjective}} comfort", 'New {{commerce.product}} model with {{number.int({"min": 1, "max": 100})}} GB RAM, {{number.int({"min": 1, "max": 1000})}} GB storage, and {{word.adjective}} features', "Our {{animal.type}}-friendly {{commerce.product}} ensures {{word.adjective}} comfort for your pets", "Our {{food.adjective}}-inspired {{commerce.product}} brings a taste of luxury to your {{word.adjective}} lifestyle", "Professional-grade {{commerce.product}} perfect for {{word.adjective}} training and recreational use", "Savor the {{food.adjective}} essence in our {{commerce.product}}, designed for {{word.adjective}} culinary adventures", "Stylish {{commerce.product}} designed to make you stand out with {{word.adjective}} looks", "The sleek and {{word.adjective}} {{commerce.product}} comes with {{color.human}} LED lighting for smart functionality", "The {{color.human}} {{commerce.product}} combines {{location.country}} aesthetics with {{science.chemical_element.name}}-based durability", "The {{company.catchPhrase}} {{commerce.product}} offers reliable performance and {{word.adjective}} design", "The {{person.firstName}} {{commerce.product}} is the latest in a series of {{word.adjective}} products from {{company.name}}", "{{commerce.productAdjective}} {{commerce.product}} designed with {{commerce.productMaterial}} for {{word.adjective}} performance", "{{company.name}}'s most advanced {{commerce.product}} technology increases {{word.adjective}} capabilities"];
var J = { adjective: ["Awesome", "Bespoke", "Electronic", "Elegant", "Ergonomic", "Fantastic", "Fresh", "Frozen", "Generic", "Gorgeous", "Handcrafted", "Handmade", "Incredible", "Intelligent", "Licensed", "Luxurious", "Modern", "Oriental", "Practical", "Recycled", "Refined", "Rustic", "Sleek", "Small", "Soft", "Tasty", "Unbranded"], material: ["Aluminum", "Bamboo", "Bronze", "Ceramic", "Concrete", "Cotton", "Gold", "Granite", "Marble", "Metal", "Plastic", "Rubber", "Silk", "Steel", "Wooden"], product: ["Bacon", "Ball", "Bike", "Car", "Chair", "Cheese", "Chicken", "Chips", "Computer", "Fish", "Gloves", "Hat", "Keyboard", "Mouse", "Pants", "Pizza", "Salad", "Sausages", "Shirt", "Shoes", "Soap", "Table", "Towels", "Tuna"] };
var ar = { department: N, product_description: E, product_name: J };
var I = ar;
var K = ["AI-driven", "Adaptive", "Advanced", "Automated", "Balanced", "Business-focused", "Centralized", "Compatible", "Configurable", "Cross-platform", "Customer-focused", "Customizable", "Decentralized", "Devolved", "Digitized", "Distributed", "Diverse", "Enhanced", "Ergonomic", "Exclusive", "Expanded", "Extended", "Face to face", "Focused", "Front-line", "Fully-configurable", "Fundamental", "Future-proofed", "Grass-roots", "Horizontal", "Immersive", "Implemented", "Innovative", "Integrated", "Intuitive", "Managed", "Monitored", "Multi-tiered", "Networked", "Open-architected", "Open-source", "Operative", "Optimized", "Optional", "Organic", "Organized", "Persevering", "Persistent", "Phased", "Polarised", "Proactive", "Profit-focused", "Profound", "Programmable", "Progressive", "Public-key", "Quality-focused", "Reactive", "Realigned", "Reduced", "Reverse-engineered", "Robust", "Seamless", "Secured", "Self-enabling", "Sharable", "Smart", "Stand-alone", "Streamlined", "Sustainable", "Synchronised", "Team-oriented", "Total", "Triple-buffered", "Universal", "Upgradable", "User-centric", "User-friendly", "Versatile", "Virtual", "Visionary"];
var O = ["24/7", "AI-driven", "B2B", "B2C", "back-end", "best-of-breed", "bleeding-edge", "collaborative", "compelling", "cross-media", "cross-platform", "customized", "cutting-edge", "decentralized", "distributed", "dynamic", "efficient", "end-to-end", "enterprise", "extensible", "frictionless", "front-end", "generative", "global", "granular", "holistic", "immersive", "impactful", "innovative", "integrated", "interactive", "intuitive", "killer", "leading-edge", "magnetic", "mission-critical", "next-generation", "one-to-one", "open-source", "out-of-the-box", "plug-and-play", "proactive", "quantum", "real-time", "revolutionary", "rich", "robust", "scalable", "seamless", "smart", "sticky", "strategic", "sustainable", "synergistic", "transparent", "turn-key", "ubiquitous", "user-centric", "value-added", "vertical", "viral", "virtual", "visionary", "world-class"];
var x = ["AI", "ROI", "applications", "architectures", "blockchains", "channels", "communities", "content", "convergence", "deliverables", "e-commerce", "experiences", "functionalities", "infrastructures", "initiatives", "interfaces", "large language models", "lifetime value", "markets", "methodologies", "metrics", "mindshare", "models", "networks", "niches", "paradigms", "partnerships", "platforms", "relationships", "schemas", "smart contracts", "solutions", "supply-chains", "synergies", "systems", "technologies", "users", "web services"];
var z = ["aggregate", "architect", "benchmark", "brand", "collaborate", "cultivate", "deliver", "deploy", "disintermediate", "drive", "embrace", "empower", "enable", "engage", "engineer", "enhance", "evolve", "expedite", "exploit", "extend", "facilitate", "gamify", "generate", "grow", "harness", "implement", "incentivize", "incubate", "innovate", "integrate", "iterate", "leverage", "maximize", "mesh", "monetize", "optimize", "orchestrate", "productize", "redefine", "reinvent", "repurpose", "revolutionize", "scale", "seize", "simplify", "strategize", "streamline", "syndicate", "synthesize", "target", "transform", "transition", "unleash", "utilize", "visualize", "whiteboard"];
var V = ["24 hour", "24/7", "AI-powered", "actuating", "analyzing", "asymmetric", "asynchronous", "attitude-oriented", "bifurcated", "bottom-line", "clear-thinking", "client-driven", "client-server", "cloud-native", "coherent", "cohesive", "composite", "content-based", "context-sensitive", "contextually-based", "data-driven", "dedicated", "demand-driven", "directional", "discrete", "disintermediate", "dynamic", "eco-centric", "empowering", "encompassing", "executive", "explicit", "exuding", "fault-tolerant", "fresh-thinking", "full-range", "global", "heuristic", "high-level", "holistic", "homogeneous", "human-resource", "hybrid", "immersive", "impactful", "incremental", "intangible", "interactive", "intermediate", "leading edge", "local", "logistical", "maximized", "methodical", "mission-critical", "mobile", "modular", "motivating", "national", "needs-based", "neutral", "next generation", "optimal", "optimizing", "radical", "real-time", "reciprocal", "regional", "resilient", "responsive", "scalable", "secondary", "stable", "static", "sustainable", "system-worthy", "systematic", "systemic", "tangible", "tertiary", "transitional", "uniform", "user-facing", "value-added", "well-modulated", "zero administration", "zero defect", "zero tolerance", "zero trust"];
var Y = ["Group", "Inc", "LLC", "and Sons"];
var j = ["{{person.last_name.generic}} - {{person.last_name.generic}}", "{{person.last_name.generic}} {{company.legal_entity_type}}", "{{person.last_name.generic}}, {{person.last_name.generic}} and {{person.last_name.generic}}"];
var q = ["ability", "access", "adapter", "algorithm", "alliance", "analyzer", "application", "approach", "architecture", "archive", "array", "artificial intelligence", "attitude", "benchmark", "budgetary management", "capability", "capacity", "challenge", "circuit", "collaboration", "complexity", "concept", "conglomeration", "contingency", "core", "customer loyalty", "data-warehouse", "database", "definition", "emulation", "encoding", "encryption", "firmware", "flexibility", "focus group", "forecast", "frame", "framework", "function", "functionalities", "generative AI", "hardware", "help-desk", "hierarchy", "hub", "implementation", "infrastructure", "initiative", "installation", "instruction set", "interface", "internet solution", "intranet", "knowledge base", "knowledge user", "leverage", "local area network", "matrices", "matrix", "methodology", "microservice", "middleware", "migration", "model", "moderator", "monitoring", "moratorium", "neural-net", "open architecture", "orchestration", "paradigm", "parallelism", "policy", "portal", "pricing structure", "process improvement", "product", "productivity", "project", "projection", "protocol", "service-desk", "software", "solution", "standardization", "strategy", "structure", "success", "support", "synergy", "system engine", "task-force", "throughput", "time-frame", "toolset", "utilisation", "website", "workforce"];
var rr = { adjective: K, buzz_adjective: O, buzz_noun: x, buzz_verb: z, descriptor: V, legal_entity_type: Y, name_pattern: j, noun: q };
var U = rr;
var Z = ["avatar", "category", "comment", "createdAt", "email", "group", "id", "name", "password", "phone", "status", "title", "token", "updatedAt"];
var or = { column: Z };
var _ = or;
var Q = { wide: ["April", "August", "December", "February", "January", "July", "June", "March", "May", "November", "October", "September"], abbr: ["Apr", "Aug", "Dec", "Feb", "Jan", "Jul", "Jun", "Mar", "May", "Nov", "Oct", "Sep"] };
var X = { wide: ["Friday", "Monday", "Saturday", "Sunday", "Thursday", "Tuesday", "Wednesday"], abbr: ["Fri", "Mon", "Sat", "Sun", "Thu", "Tue", "Wed"] };
var nr = { month: Q, weekday: X };
var $ = nr;
var ee = ["Auto Loan", "Checking", "Credit Card", "Home Loan", "Investment", "Money Market", "Personal Loan", "Savings"];
var ae = ["34##-######-####L", "37##-######-####L"];
var re = ["30[0-5]#-######-###L", "36##-######-###L"];
var oe = ["6011-####-####-###L", "65##-####-####-###L"];
var ne = ["3528-####-####-###L", "3529-####-####-###L", "35[3-8]#-####-####-###L"];
var ie = ["2[221-720]-####-####-###L", "5[1-5]##-####-####-###L"];
var te = ["4###########L", "4###-####-####-###L"];
var ir = { american_express: ae, diners_club: re, discover: oe, jcb: ne, mastercard: ie, visa: te };
var le = ir;
var se = [{ name: "UAE Dirham", code: "AED", symbol: "", numericCode: "784" }, { name: "Afghani", code: "AFN", symbol: "\u060B", numericCode: "971" }, { name: "Lek", code: "ALL", symbol: "Lek", numericCode: "008" }, { name: "Armenian Dram", code: "AMD", symbol: "", numericCode: "051" }, { name: "Netherlands Antillian Guilder", code: "ANG", symbol: "\u0192", numericCode: "532" }, { name: "Kwanza", code: "AOA", symbol: "", numericCode: "973" }, { name: "Argentine Peso", code: "ARS", symbol: "$", numericCode: "032" }, { name: "Australian Dollar", code: "AUD", symbol: "$", numericCode: "036" }, { name: "Aruban Guilder", code: "AWG", symbol: "\u0192", numericCode: "533" }, { name: "Azerbaijanian Manat", code: "AZN", symbol: "\u043C\u0430\u043D", numericCode: "944" }, { name: "Convertible Marks", code: "BAM", symbol: "KM", numericCode: "977" }, { name: "Barbados Dollar", code: "BBD", symbol: "$", numericCode: "052" }, { name: "Taka", code: "BDT", symbol: "", numericCode: "050" }, { name: "Bulgarian Lev", code: "BGN", symbol: "\u043B\u0432", numericCode: "975" }, { name: "Bahraini Dinar", code: "BHD", symbol: "", numericCode: "048" }, { name: "Burundi Franc", code: "BIF", symbol: "", numericCode: "108" }, { name: "Bermudian Dollar (customarily known as Bermuda Dollar)", code: "BMD", symbol: "$", numericCode: "060" }, { name: "Brunei Dollar", code: "BND", symbol: "$", numericCode: "096" }, { name: "Boliviano boliviano", code: "BOB", symbol: "Bs", numericCode: "068" }, { name: "Brazilian Real", code: "BRL", symbol: "R$", numericCode: "986" }, { name: "Bahamian Dollar", code: "BSD", symbol: "$", numericCode: "044" }, { name: "Pula", code: "BWP", symbol: "P", numericCode: "072" }, { name: "Belarusian Ruble", code: "BYN", symbol: "Rbl", numericCode: "933" }, { name: "Belize Dollar", code: "BZD", symbol: "BZ$", numericCode: "084" }, { name: "Canadian Dollar", code: "CAD", symbol: "$", numericCode: "124" }, { name: "Congolese Franc", code: "CDF", symbol: "", numericCode: "976" }, { name: "Swiss Franc", code: "CHF", symbol: "CHF", numericCode: "756" }, { name: "Chilean Peso", code: "CLP", symbol: "$", numericCode: "152" }, { name: "Yuan Renminbi", code: "CNY", symbol: "\xA5", numericCode: "156" }, { name: "Colombian Peso", code: "COP", symbol: "$", numericCode: "170" }, { name: "Costa Rican Colon", code: "CRC", symbol: "\u20A1", numericCode: "188" }, { name: "Cuban Peso", code: "CUP", symbol: "\u20B1", numericCode: "192" }, { name: "Cape Verde Escudo", code: "CVE", symbol: "", numericCode: "132" }, { name: "Czech Koruna", code: "CZK", symbol: "K\u010D", numericCode: "203" }, { name: "Djibouti Franc", code: "DJF", symbol: "", numericCode: "262" }, { name: "Danish Krone", code: "DKK", symbol: "kr", numericCode: "208" }, { name: "Dominican Peso", code: "DOP", symbol: "RD$", numericCode: "214" }, { name: "Algerian Dinar", code: "DZD", symbol: "", numericCode: "012" }, { name: "Egyptian Pound", code: "EGP", symbol: "\xA3", numericCode: "818" }, { name: "Nakfa", code: "ERN", symbol: "", numericCode: "232" }, { name: "Ethiopian Birr", code: "ETB", symbol: "", numericCode: "230" }, { name: "Euro", code: "EUR", symbol: "\u20AC", numericCode: "978" }, { name: "Fiji Dollar", code: "FJD", symbol: "$", numericCode: "242" }, { name: "Falkland Islands Pound", code: "FKP", symbol: "\xA3", numericCode: "238" }, { name: "Pound Sterling", code: "GBP", symbol: "\xA3", numericCode: "826" }, { name: "Lari", code: "GEL", symbol: "", numericCode: "981" }, { name: "Cedi", code: "GHS", symbol: "", numericCode: "936" }, { name: "Gibraltar Pound", code: "GIP", symbol: "\xA3", numericCode: "292" }, { name: "Dalasi", code: "GMD", symbol: "", numericCode: "270" }, { name: "Guinea Franc", code: "GNF", symbol: "", numericCode: "324" }, { name: "Quetzal", code: "GTQ", symbol: "Q", numericCode: "320" }, { name: "Guyana Dollar", code: "GYD", symbol: "$", numericCode: "328" }, { name: "Hong Kong Dollar", code: "HKD", symbol: "$", numericCode: "344" }, { name: "Lempira", code: "HNL", symbol: "L", numericCode: "340" }, { name: "Gourde", code: "HTG", symbol: "", numericCode: "332" }, { name: "Forint", code: "HUF", symbol: "Ft", numericCode: "348" }, { name: "Rupiah", code: "IDR", symbol: "Rp", numericCode: "360" }, { name: "New Israeli Sheqel", code: "ILS", symbol: "\u20AA", numericCode: "376" }, { name: "Bhutanese Ngultrum", code: "BTN", symbol: "Nu", numericCode: "064" }, { name: "Indian Rupee", code: "INR", symbol: "\u20B9", numericCode: "356" }, { name: "Iraqi Dinar", code: "IQD", symbol: "", numericCode: "368" }, { name: "Iranian Rial", code: "IRR", symbol: "\uFDFC", numericCode: "364" }, { name: "Iceland Krona", code: "ISK", symbol: "kr", numericCode: "352" }, { name: "Jamaican Dollar", code: "JMD", symbol: "J$", numericCode: "388" }, { name: "Jordanian Dinar", code: "JOD", symbol: "", numericCode: "400" }, { name: "Yen", code: "JPY", symbol: "\xA5", numericCode: "392" }, { name: "Kenyan Shilling", code: "KES", symbol: "", numericCode: "404" }, { name: "Som", code: "KGS", symbol: "\u043B\u0432", numericCode: "417" }, { name: "Riel", code: "KHR", symbol: "\u17DB", numericCode: "116" }, { name: "Comoro Franc", code: "KMF", symbol: "", numericCode: "174" }, { name: "North Korean Won", code: "KPW", symbol: "\u20A9", numericCode: "408" }, { name: "Won", code: "KRW", symbol: "\u20A9", numericCode: "410" }, { name: "Kuwaiti Dinar", code: "KWD", symbol: "", numericCode: "414" }, { name: "Cayman Islands Dollar", code: "KYD", symbol: "$", numericCode: "136" }, { name: "Tenge", code: "KZT", symbol: "\u043B\u0432", numericCode: "398" }, { name: "Kip", code: "LAK", symbol: "\u20AD", numericCode: "418" }, { name: "Lebanese Pound", code: "LBP", symbol: "\xA3", numericCode: "422" }, { name: "Sri Lanka Rupee", code: "LKR", symbol: "\u20A8", numericCode: "144" }, { name: "Liberian Dollar", code: "LRD", symbol: "$", numericCode: "430" }, { name: "Libyan Dinar", code: "LYD", symbol: "", numericCode: "434" }, { name: "Moroccan Dirham", code: "MAD", symbol: "", numericCode: "504" }, { name: "Moldovan Leu", code: "MDL", symbol: "", numericCode: "498" }, { name: "Malagasy Ariary", code: "MGA", symbol: "", numericCode: "969" }, { name: "Denar", code: "MKD", symbol: "\u0434\u0435\u043D", numericCode: "807" }, { name: "Kyat", code: "MMK", symbol: "", numericCode: "104" }, { name: "Tugrik", code: "MNT", symbol: "\u20AE", numericCode: "496" }, { name: "Pataca", code: "MOP", symbol: "", numericCode: "446" }, { name: "Ouguiya", code: "MRU", symbol: "", numericCode: "929" }, { name: "Mauritius Rupee", code: "MUR", symbol: "\u20A8", numericCode: "480" }, { name: "Rufiyaa", code: "MVR", symbol: "", numericCode: "462" }, { name: "Kwacha", code: "MWK", symbol: "", numericCode: "454" }, { name: "Mexican Peso", code: "MXN", symbol: "$", numericCode: "484" }, { name: "Malaysian Ringgit", code: "MYR", symbol: "RM", numericCode: "458" }, { name: "Metical", code: "MZN", symbol: "MT", numericCode: "943" }, { name: "Naira", code: "NGN", symbol: "\u20A6", numericCode: "566" }, { name: "Cordoba Oro", code: "NIO", symbol: "C$", numericCode: "558" }, { name: "Norwegian Krone", code: "NOK", symbol: "kr", numericCode: "578" }, { name: "Nepalese Rupee", code: "NPR", symbol: "\u20A8", numericCode: "524" }, { name: "New Zealand Dollar", code: "NZD", symbol: "$", numericCode: "554" }, { name: "Rial Omani", code: "OMR", symbol: "\uFDFC", numericCode: "512" }, { name: "Balboa", code: "PAB", symbol: "B/.", numericCode: "590" }, { name: "Nuevo Sol", code: "PEN", symbol: "S/.", numericCode: "604" }, { name: "Kina", code: "PGK", symbol: "", numericCode: "598" }, { name: "Philippine Peso", code: "PHP", symbol: "Php", numericCode: "608" }, { name: "Pakistan Rupee", code: "PKR", symbol: "\u20A8", numericCode: "586" }, { name: "Zloty", code: "PLN", symbol: "z\u0142", numericCode: "985" }, { name: "Guarani", code: "PYG", symbol: "Gs", numericCode: "600" }, { name: "Qatari Rial", code: "QAR", symbol: "\uFDFC", numericCode: "634" }, { name: "New Leu", code: "RON", symbol: "lei", numericCode: "946" }, { name: "Serbian Dinar", code: "RSD", symbol: "\u0414\u0438\u043D.", numericCode: "941" }, { name: "Russian Ruble", code: "RUB", symbol: "\u0440\u0443\u0431", numericCode: "643" }, { name: "Rwanda Franc", code: "RWF", symbol: "", numericCode: "646" }, { name: "Saudi Riyal", code: "SAR", symbol: "\uFDFC", numericCode: "682" }, { name: "Solomon Islands Dollar", code: "SBD", symbol: "$", numericCode: "090" }, { name: "Seychelles Rupee", code: "SCR", symbol: "\u20A8", numericCode: "690" }, { name: "Sudanese Pound", code: "SDG", symbol: "", numericCode: "938" }, { name: "Swedish Krona", code: "SEK", symbol: "kr", numericCode: "752" }, { name: "Singapore Dollar", code: "SGD", symbol: "$", numericCode: "702" }, { name: "Saint Helena Pound", code: "SHP", symbol: "\xA3", numericCode: "654" }, { name: "Leone", code: "SLE", symbol: "", numericCode: "925" }, { name: "Somali Shilling", code: "SOS", symbol: "S", numericCode: "706" }, { name: "Surinam Dollar", code: "SRD", symbol: "$", numericCode: "968" }, { name: "South Sudanese pound", code: "SSP", symbol: "", numericCode: "728" }, { name: "Dobra", code: "STN", symbol: "Db", numericCode: "930" }, { name: "Syrian Pound", code: "SYP", symbol: "\xA3", numericCode: "760" }, { name: "Lilangeni", code: "SZL", symbol: "", numericCode: "748" }, { name: "Baht", code: "THB", symbol: "\u0E3F", numericCode: "764" }, { name: "Somoni", code: "TJS", symbol: "", numericCode: "972" }, { name: "Manat", code: "TMT", symbol: "", numericCode: "934" }, { name: "Tunisian Dinar", code: "TND", symbol: "", numericCode: "788" }, { name: "Pa'anga", code: "TOP", symbol: "", numericCode: "776" }, { name: "Turkish Lira", code: "TRY", symbol: "\u20BA", numericCode: "949" }, { name: "Trinidad and Tobago Dollar", code: "TTD", symbol: "TT$", numericCode: "780" }, { name: "New Taiwan Dollar", code: "TWD", symbol: "NT$", numericCode: "901" }, { name: "Tanzanian Shilling", code: "TZS", symbol: "", numericCode: "834" }, { name: "Hryvnia", code: "UAH", symbol: "\u20B4", numericCode: "980" }, { name: "Uganda Shilling", code: "UGX", symbol: "", numericCode: "800" }, { name: "US Dollar", code: "USD", symbol: "$", numericCode: "840" }, { name: "Peso Uruguayo", code: "UYU", symbol: "$U", numericCode: "858" }, { name: "Uzbekistan Sum", code: "UZS", symbol: "\u043B\u0432", numericCode: "860" }, { name: "Venezuelan bol\xEDvar", code: "VES", symbol: "Bs", numericCode: "928" }, { name: "Dong", code: "VND", symbol: "\u20AB", numericCode: "704" }, { name: "Vatu", code: "VUV", symbol: "", numericCode: "548" }, { name: "Tala", code: "WST", symbol: "", numericCode: "882" }, { name: "CFA Franc BEAC", code: "XAF", symbol: "", numericCode: "950" }, { name: "East Caribbean Dollar", code: "XCD", symbol: "$", numericCode: "951" }, { name: "CFA Franc BCEAO", code: "XOF", symbol: "", numericCode: "952" }, { name: "CFP Franc", code: "XPF", symbol: "", numericCode: "953" }, { name: "Yemeni Rial", code: "YER", symbol: "\uFDFC", numericCode: "886" }, { name: "Rand", code: "ZAR", symbol: "R", numericCode: "710" }, { name: "Lesotho Loti", code: "LSL", symbol: "", numericCode: "426" }, { name: "Namibia Dollar", code: "NAD", symbol: "N$", numericCode: "516" }, { name: "Zambian Kwacha", code: "ZMW", symbol: "K", numericCode: "967" }, { name: "Zimbabwe Dollar", code: "ZWL", symbol: "", numericCode: "932" }];
var de = ["A {{finance.transactionType}} for {{finance.currencyCode}} {{finance.amount}} was made at {{company.name}} via card ending ****{{string.numeric(4)}} on account ***{{string.numeric(4)}}.", "A {{finance.transactionType}} of {{finance.currencyCode}} {{finance.amount}} occurred at {{company.name}} using a card ending in ****{{string.numeric(4)}} for account ***{{string.numeric(4)}}.", "Payment of {{finance.currencyCode}} {{finance.amount}} for {{finance.transactionType}} at {{company.name}}, processed with card ending ****{{string.numeric(4)}} linked to account ***{{string.numeric(4)}}.", "Transaction alert: {{finance.transactionType}} at {{company.name}} using card ending ****{{string.numeric(4)}} for an amount of {{finance.currencyCode}} {{finance.amount}} on account ***{{string.numeric(4)}}.", "You made a {{finance.transactionType}} of {{finance.currencyCode}} {{finance.amount}} at {{company.name}} using card ending in ****{{string.numeric(4)}} from account ***{{string.numeric(4)}}.", "Your {{finance.transactionType}} of {{finance.currencyCode}} {{finance.amount}} at {{company.name}} was successful. Charged via card ****{{string.numeric(4)}} to account ***{{string.numeric(4)}}.", "{{finance.transactionType}} at {{company.name}} with a card ending in ****{{string.numeric(4)}} for {{finance.currencyCode}} {{finance.amount}} from account ***{{string.numeric(4)}}.", "{{finance.transactionType}} confirmed at {{company.name}} for {{finance.currencyCode}} {{finance.amount}}, card ending in ****{{string.numeric(4)}} associated with account ***{{string.numeric(4)}}.", "{{finance.transactionType}} of {{finance.currencyCode}} {{finance.amount}} at {{company.name}} charged to account ending in {{string.numeric(4)}} using card ending in ****{{string.numeric(4)}}.", "{{finance.transactionType}} processed at {{company.name}} for {{finance.currencyCode}} {{finance.amount}}, using card ending ****{{string.numeric(4)}}. Account: ***{{string.numeric(4)}}.", "{{finance.transactionType}} transaction at {{company.name}} using card ending with ****{{string.numeric(4)}} for {{finance.currencyCode}} {{finance.amount}} in account ***{{string.numeric(4)}}."];
var ue = ["deposit", "invoice", "payment", "withdrawal"];
var tr = { account_type: ee, credit_card: le, currency: se, transaction_description_pattern: de, transaction_type: ue };
var ce = tr;
var me = ["bitter", "creamy", "crispy", "crunchy", "delicious", "fluffy", "fresh", "golden", "juicy", "moist", "rich", "salty", "savory", "smoky", "sour", "spicy", "sweet", "tangy", "tender", "zesty"];
var he = ["A classic pie filled with delicious {{food.meat}} and {{food.adjective}} {{food.ingredient}}, baked in a {{food.adjective}} pastry crust and topped with a golden-brown lattice.", "A delightful tart combining {{food.adjective}} {{food.vegetable}} and sweet {{food.fruit}}, set in a buttery pastry shell and finished with a hint of {{food.spice}}.", "A heartwarming {{food.ethnic_category}} soup, featuring fresh {{food.ingredient}} and an aromatic blend of traditional spices.", "A robust {{food.adjective}} stew featuring {{food.ethnic_category}} flavors, loaded with {{food.adjective}} meat, {{food.adjective}} vegetables, and a {{food.adjective}}, {{food.adjective}} broth.", "A simple {{food.fruit}} pie. No fancy stuff. Just pie.", "A slow-roasted {{animal.bird}} with a {{food.adjective}}, {{food.adjective}} exterior. Stuffed with {{food.fruit}} and covered in {{food.fruit}} sauce. Sides with {{food.vegetable}} puree and wild {{food.vegetable}}.", "A special {{color.human}} {{food.ingredient}} from {{location.country}}. To support the strong flavor it is sided with a tablespoon of {{food.spice}}.", "A succulent {{food.meat}} steak, encased in a {{food.adjective}} {{food.spice}} crust, served with a side of {{food.spice}} mashed {{food.vegetable}}.", "An exquisite {{food.meat}} roast, infused with the essence of {{food.fruit}}, slow-roasted to bring out its natural flavors and served with a side of creamy {{food.vegetable}}", "Baked {{food.ingredient}}-stuffed {{food.meat}}, seasoned with {{food.spice}} and {{food.adjective}} herbs, accompanied by roasted {{food.vegetable}} medley.", "Crispy fried {{food.meat}} bites, seasoned with {{food.spice}} and served with a tangy {{food.fruit}} dipping sauce.", "Fresh mixed greens tossed with {{food.spice}}-rubbed {{food.meat}}, {{food.vegetable}}, and a light dressing.", "Fresh {{food.ingredient}} with a pinch of {{food.spice}}, topped by a caramelized {{food.fruit}} with whipped cream", "Grilled {{food.meat}} kebabs, marinated in {{food.ethnic_category}} spices and served with a fresh {{food.vegetable}} and {{food.fruit}} salad.", "Hearty {{food.ingredient}} and {{food.meat}} stew, slow-cooked with {{food.spice}} and {{food.vegetable}} for a comforting, flavorful meal.", "Juicy {{food.meat}}, grilled to your liking and drizzled with a bold {{food.spice}} sauce, served alongside roasted {{food.vegetable}}.", "Our {{food.adjective}} {{food.meat}}, slow-cooked to perfection, accompanied by steamed {{food.vegetable}} and a rich, savory gravy.", "Tender {{food.meat}} skewers, glazed with a sweet and tangy {{food.fruit}} sauce, served over a bed of fragrant jasmine rice.", "Tenderly braised {{food.meat}} in a rich {{food.spice}} and {{food.vegetable}} sauce, served with a side of creamy {{food.vegetable}}.", "Three {{food.ingredient}} with {{food.vegetable}}, {{food.vegetable}}, {{food.vegetable}}, {{food.vegetable}} and {{food.ingredient}}. With a side of baked {{food.fruit}}, and your choice of {{food.ingredient}} or {{food.ingredient}}.", '{{number.int({"min":1, "max":99})}}-day aged {{food.meat}} steak, with choice of {{number.int({"min":2, "max":4})}} sides.'];
var ye = ["California maki", "Peking duck", "Philadelphia maki", "arepas", "barbecue ribs", "bruschette with tomato", "bunny chow", "caesar salad", "caprese salad", "cauliflower penne", "cheeseburger", "chicken fajitas", "chicken milanese", "chicken parm", "chicken wings", "chilli con carne", "ebiten maki", "fettuccine alfredo", "fish and chips", "french fries with sausages", "french toast", "hummus", "katsu curry", "kebab", "lasagne", "linguine with clams", "massaman curry", "meatballs with sauce", "mushroom risotto", "pappardelle alla bolognese", "pasta and beans", "pasta carbonara", "pasta with tomato and basil", "pho", "pierogi", "pizza", "poke", "pork belly buns", "pork sausage roll", "poutine", "ricotta stuffed ravioli", "risotto with seafood", "salmon nigiri", "scotch eggs", "seafood paella", "som tam", "souvlaki", "stinky tofu", "sushi", "tacos", "teriyaki chicken donburi", "tiramis\xF9", "tuna sashimi", "vegetable soup"];
var pe = ["{{food.adjective}} {{food.ethnic_category}} stew", "{{food.adjective}} {{food.meat}} with {{food.vegetable}}", "{{food.ethnic_category}} {{food.ingredient}} soup", "{{food.fruit}} and {{food.fruit}} tart", "{{food.fruit}} pie", "{{food.fruit}}-glazed {{food.meat}} skewers", "{{food.fruit}}-infused {{food.meat}} roast", "{{food.ingredient}} and {{food.meat}} pie", "{{food.ingredient}}-infused {{food.meat}}", "{{food.meat}} steak", "{{food.meat}} with {{food.fruit}} sauce", "{{food.spice}}-crusted {{food.meat}}", "{{food.spice}}-rubbed {{food.meat}} salad", "{{food.vegetable}} salad", "{{person.first_name.generic}}'s special {{food.ingredient}}"];
var ge = ["Ainu", "Albanian", "American", "Andhra", "Anglo-Indian", "Arab", "Argentine", "Armenian", "Assyrian", "Awadhi", "Azerbaijani", "Balochi", "Bangladeshi", "Bashkir", "Belarusian", "Bengali", "Berber", "Brazilian", "British", "Buddhist", "Bulgarian", "Cajun", "Cantonese", "Caribbean", "Chechen", "Chinese", "Chinese Islamic", "Circassian", "Crimean Tatar", "Cypriot", "Czech", "Danish", "Egyptian", "English", "Eritrean", "Estonian", "Ethiopian", "Filipino", "French", "Georgian", "German", "Goan", "Goan Catholic", "Greek", "Gujarati", "Hyderabad", "Indian", "Indian Chinese", "Indian Singaporean", "Indonesian", "Inuit", "Irish", "Italian", "Italian-American", "Jamaican", "Japanese", "Jewish - Israeli", "Karnataka", "Kazakh", "Keralite", "Korean", "Kurdish", "Laotian", "Latvian", "Lebanese", "Lithuanian", "Louisiana Creole", "Maharashtrian", "Malay", "Malaysian Chinese", "Malaysian Indian", "Mangalorean", "Mediterranean", "Mennonite", "Mexican", "Mordovian", "Mughal", "Native American", "Nepalese", "New Mexican", "Odia", "Pakistani", "Parsi", "Pashtun", "Pennsylvania Dutch", "Peranakan", "Persian", "Peruvian", "Polish", "Portuguese", "Punjabi", "Qu\xE9b\xE9cois", "Rajasthani", "Romani", "Romanian", "Russian", "Sami", "Serbian", "Sindhi", "Slovak", "Slovenian", "Somali", "South Indian", "Soviet", "Spanish", "Sri Lankan", "Taiwanese", "Tamil", "Tatar", "Texan", "Thai", "Turkish", "Udupi", "Ukrainian", "Vietnamese", "Yamal", "Zambian", "Zanzibari"];
var be = ["apple", "apricot", "aubergine", "avocado", "banana", "berry", "blackberry", "blood orange", "blueberry", "bush tomato", "butternut pumpkin", "cantaloupe", "cavalo", "cherry", "corella pear", "cranberry", "cumquat", "currant", "custard apple", "custard apples daikon", "date", "dragonfruit", "dried apricot", "elderberry", "feijoa", "fig", "fingerlime", "goji berry", "grape", "grapefruit", "guava", "honeydew melon", "incaberry", "jarrahdale pumpkin", "juniper berry", "kiwi fruit", "kiwiberry", "lemon", "lime", "longan", "loquat", "lychee", "mandarin", "mango", "mangosteen", "melon", "mulberry", "nashi pear", "nectarine", "olive", "orange", "papaw", "papaya", "passionfruit", "peach", "pear", "pineapple", "plum", "pomegranate", "prune", "rockmelon", "snowpea", "sprout", "starfruit", "strawberry", "sultana", "tangelo", "tomato", "watermelon"];
var Ce = ["achacha", "adzuki beans", "agar", "agave syrup", "ajowan seed", "albacore tuna", "alfalfa", "allspice", "almond oil", "almonds", "amaranth", "amchur", "anchovies", "aniseed", "annatto seed", "apple cider vinegar", "apple juice", "apple juice concentrate", "apples", "apricots", "arborio rice", "arrowroot", "artichoke", "arugula", "asafoetida", "asian greens", "asian noodles", "asparagus", "aubergine", "avocado", "avocado oil", "avocado spread", "bacon", "baking powder", "baking soda", "balsamic vinegar", "bamboo shoots", "banana", "barberry", "barley", "barramundi", "basil basmati rice", "bay leaves", "bean shoots", "bean sprouts", "beans", "beef", "beef stock", "beetroot", "berries", "besan", "black eyed beans", "blackberries", "blood oranges", "blue cheese", "blue eye trevalla", "blue swimmer crab", "blueberries", "bocconcini", "bok choy", "bonito flakes", "bonza", "borlotti beans", "bran", "brazil nut", "bread", "brie", "broccoli", "broccolini", "brown flour", "brown mushrooms", "brown rice", "brown rice vinegar", "brussels sprouts", "buckwheat", "buckwheat flour", "buckwheat noodles", "bulghur", "bush tomato", "butter", "butter beans", "buttermilk", "butternut lettuce", "butternut pumpkin", "cabbage", "cacao", "cake", "calamari", "camellia tea oil", "camembert", "camomile", "candle nut", "cannellini beans", "canola oil", "cantaloupe", "capers", "capsicum", "caraway seed", "cardamom", "carob carrot", "carrot", "cashews", "cassia bark", "cauliflower", "cavalo", "cayenne", "celery", "celery seed", "cheddar", "cherries", "chestnut", "chia seeds", "chicken", "chicken stock", "chickory", "chickpea", "chilli pepper", "chinese cabbage", "chinese five spice", "chives", "choy sum", "cinnamon", "clams", "cloves", "cocoa powder", "coconut", "coconut oil", "coconut water", "coffee", "common cultivated mushrooms", "corella pear", "coriander leaves", "coriander seed", "corn oil", "corn syrup", "corn tortilla", "cornichons", "cornmeal", "cos lettuce", "cottage cheese", "cous cous", "crabs", "cranberry", "cream", "cream cheese", "cucumber", "cumin", "cumquat", "currants", "curry leaves", "curry powder", "custard apples", "dandelion", "dark chocolate", "dashi", "dates", "dill", "dragonfruit", "dried apricots", "dried chinese broccoli", "duck", "edam", "edamame", "eggplant", "eggs", "elderberry", "endive", "english spinach", "enoki mushrooms", "extra virgin olive oil", "farmed prawns", "feijoa", "fennel", "fennel seeds", "fenugreek", "feta", "figs", "file powder", "fingerlime", "fish sauce", "fish stock", "flat mushrooms", "flathead", "flaxseed", "flaxseed oil", "flounder", "flour", "freekeh", "french eschallots", "fresh chillies", "fromage blanc", "fruit", "galangal", "garam masala", "garlic", "goat cheese", "goat milk", "goji berry", "grape seed oil", "grapefruit", "grapes", "green beans", "green pepper", "green tea", "green tea noodles", "greenwheat freekeh", "gruyere", "guava", "gula melaka", "haloumi", "ham", "haricot beans", "harissa", "hazelnut", "hijiki", "hiramasa kingfish", "hokkien noodles", "honey", "honeydew melon", "horseradish", "hot smoked salmon", "hummus", "iceberg lettuce", "incaberries", "jarrahdale pumpkin", "jasmine rice", "jelly", "jerusalem artichoke", "jewfish", "jicama", "juniper berries", "kale", "kangaroo", "kecap manis", "kenchur", "kidney beans", "kidneys", "kiwi berries", "kiwi fruit", "kohlrabi", "kokam", "kombu", "koshihikari rice", "kudzu", "kumera", "lamb", "lavender flowers", "leeks", "lemon", "lemongrass", "lentils", "lettuce", "licorice", "lime leaves", "limes", "liver", "lobster", "longan", "loquats", "lotus root", "lychees", "macadamia nut", "macadamia oil", "mace", "mackerel", "mahi mahi", "mahlab", "malt vinegar", "mandarins", "mango", "mangosteens", "maple syrup", "margarine", "marigold", "marjoram", "mastic", "melon", "milk", "milk chocolate", "mint", "miso", "molasses", "monkfish", "morwong", "mountain bread", "mozzarella", "muesli", "mulberries", "mullet", "mung beans", "mussels", "mustard", "mustard seed", "nashi pear", "nasturtium", "nectarines", "nori", "nutmeg", "nutritional yeast", "nuts", "oat flour", "oatmeal", "oats", "octopus", "okra", "olive oil", "olives", "omega spread", "onion", "oranges", "oregano", "oyster mushrooms", "oyster sauce", "oysters", "pandanus leaves", "papaw", "papaya", "paprik", "parmesan cheese", "parrotfish", "parsley", "parsnip", "passionfruit", "pasta", "peaches", "peanuts", "pear", "pear juice", "pears", "peas", "pecan nut", "pecorino", "pepitas", "peppercorns", "peppermint", "peppers", "persimmon", "pine nut", "pineapple", "pinto beans", "pistachio nut", "plums", "polenta", "pomegranate", "poppy seed", "porcini mushrooms", "pork", "potato flour", "potatoes", "provolone", "prunes", "pumpkin", "pumpkin seed", "purple carrot", "purple rice", "quark", "quince", "quinoa", "radicchio", "radish", "raisin", "raspberry", "red cabbage", "red lentils", "red pepper", "red wine", "red wine vinegar", "redfish", "rhubarb", "rice flour", "rice noodles", "rice paper", "rice syrup", "ricemilk", "ricotta", "rockmelon", "rose water", "rosemary", "rye", "rye bread", "safflower oil", "saffron", "sage", "sake", "salmon", "sardines", "sausages", "scallops", "sea salt", "semolina", "sesame oil", "sesame seeds", "shark", "shiitake mushrooms", "silverbeet", "slivered almonds", "smoked trout", "snapper", "snowpea sprouts", "snowpeas", "soba", "sour dough bread", "soy", "soy beans", "soy flour", "soy milk", "soy sauce", "soymilk", "spearmint", "spelt", "spelt bread", "spinach", "spring onions", "sprouts", "squash", "squid", "star anise", "star fruit", "starfruit", "stevia", "strawberries", "sugar", "sultanas", "sun-dried tomatoes", "sunflower oil", "sunflower seeds", "sweet chilli sauce", "sweet potato", "swiss chard", "swordfish", "szechuan pepperberry", "tabasco", "tahini", "taleggio cheese", "tamari", "tamarillo", "tangelo", "tapioca", "tapioca flour", "tarragon", "tea", "tea oil", "tempeh", "thyme", "tinned", "tofu", "tom yum", "tomatoes", "trout", "tuna", "turkey", "turmeric", "turnips", "unbleached flour", "vanilla beans", "vegetable oil", "vegetable spaghetti", "vegetable stock", "vermicelli noodles", "vinegar", "wakame", "walnut", "warehou", "wasabi", "water", "watercress", "watermelon", "wattleseed", "wheat", "wheatgrass juice", "white bread", "white flour", "white rice", "white wine", "white wine vinegar", "whiting wild rice", "wholegrain bread", "wholemeal", "wholewheat flour", "william pear", "yeast", "yellow papaw", "yellowtail kingfish", "yoghurt", "yogurt", "zucchini"];
var Se = ["beef", "chicken", "crocodile", "duck", "emu", "goose", "kangaroo", "lamb", "ostrich", "pigeon", "pork", "quail", "rabbit", "salmon", "turkey", "venison"];
var ke = ["achiote seed", "ajwain seed", "ajwan seed", "allspice", "amchoor", "anise", "anise star", "aniseed", "annatto seed", "arrowroot", "asafoetida", "baharat", "balti masala", "balti stir fry mix", "basil", "bay leaves", "bbq", "caraway seed", "cardamom", "cassia", "cayenne pepper", "celery", "chamomile", "chervil", "chilli", "chilli pepper", "chillies", "china star", "chives", "cinnamon", "cloves", "colombo", "coriander", "cumin", "curly leaf parsley", "curry", "dhansak", "dill", "fennel seed", "fenugreek", "fines herbes", "five spice", "french lavender", "galangal", "garam masala", "garlic", "german chamomile", "ginger", "green cardamom", "herbes de provence", "jalfrezi", "jerk", "kaffir leaves", "korma", "lavender", "lemon grass", "lemon pepper", "lime leaves", "liquorice root", "mace", "mango", "marjoram", "methi", "mint", "mustard", "nutmeg", "onion seed", "orange zest", "oregano", "paprika", "parsley", "pepper", "peppercorns", "pimento", "piri piri", "poppy seed", "pot marjoram", "poudre de colombo", "ras-el-hanout", "rice paper", "rogan josh", "rose baie", "rosemary", "saffron", "sage", "sesame seed", "spearmint", "sumac", "sweet basil", "sweet laurel", "tagine", "tandoori masala", "tarragon", "thyme", "tikka masala", "turmeric", "vanilla", "zahtar"];
var fe = ["artichoke", "arugula", "asian greens", "asparagus", "bean shoots", "bean sprouts", "beans", "beetroot", "bok choy", "broccoli", "broccolini", "brussels sprouts", "butternut lettuce", "cabbage", "capers", "carob carrot", "carrot", "cauliflower", "celery", "chilli pepper", "chinese cabbage", "chives", "cornichons", "cos lettuce", "cucumber", "dried chinese broccoli", "eggplant", "endive", "english spinach", "french eschallots", "fresh chillies", "garlic", "green beans", "green pepper", "hijiki", "iceberg lettuce", "jerusalem artichoke", "jicama", "kale", "kohlrabi", "leeks", "lettuce", "okra", "onion", "parsnip", "peas", "peppers", "potatoes", "pumpkin", "purple carrot", "radicchio", "radish", "raspberry", "red cabbage", "red pepper", "rhubarb", "snowpea sprouts", "spinach", "squash", "sun dried tomatoes", "sweet potato", "swiss chard", "turnips", "zucchini"];
var lr = { adjective: me, description_pattern: he, dish: ye, dish_pattern: pe, ethnic_category: ge, fruit: be, ingredient: Ce, meat: Se, spice: ke, vegetable: fe };
var ve = lr;
var Ae = ["1080p", "auxiliary", "back-end", "bluetooth", "cross-platform", "digital", "haptic", "mobile", "multi-byte", "neural", "online", "open-source", "optical", "primary", "redundant", "solid state", "virtual", "wireless"];
var Be = ["backing up", "bypassing", "calculating", "compressing", "connecting", "copying", "generating", "hacking", "indexing", "navigating", "overriding", "parsing", "programming", "quantifying", "synthesizing", "transmitting"];
var Te = ["alarm", "application", "array", "bandwidth", "bus", "capacitor", "card", "circuit", "driver", "feed", "firewall", "hard drive", "interface", "matrix", "microchip", "monitor", "panel", "pixel", "port", "program", "protocol", "sensor", "system", "transmitter"];
var Me = ["I'll {{verb}} the {{adjective}} {{abbreviation}} {{noun}}, that should {{noun}} the {{abbreviation}} {{noun}}!", "If we {{verb}} the {{noun}}, we can get to the {{abbreviation}} {{noun}} through the {{adjective}} {{abbreviation}} {{noun}}!", "The {{abbreviation}} {{noun}} is down, {{verb}} the {{adjective}} {{noun}} so we can {{verb}} the {{abbreviation}} {{noun}}!", "Try to {{verb}} the {{abbreviation}} {{noun}}, maybe it will {{verb}} the {{adjective}} {{noun}}!", "Use the {{adjective}} {{abbreviation}} {{noun}}, then you can {{verb}} the {{adjective}} {{noun}}!", "We need to {{verb}} the {{adjective}} {{abbreviation}} {{noun}}!", "You can't {{verb}} the {{noun}} without {{ingverb}} the {{adjective}} {{abbreviation}} {{noun}}!", "{{ingverb}} the {{noun}} won't do anything, we need to {{verb}} the {{adjective}} {{abbreviation}} {{noun}}!"];
var we = ["back up", "bypass", "calculate", "compress", "connect", "copy", "generate", "hack", "index", "input", "navigate", "override", "parse", "program", "quantify", "reboot", "synthesize", "transmit"];
var sr = { adjective: Ae, ingverb: Be, noun: Te, phrase: Me, verb: we };
var Le = sr;
var De = ["biz", "com", "info", "name", "net", "org"];
var Re = ["example.com", "example.net", "example.org"];
var Pe = ["gmail.com", "hotmail.com", "yahoo.com"];
var dr = { domain_suffix: De, example_email: Re, free_email: Pe };
var He = dr;
var We = ["#####", "####", "###"];
var Ge = ["Abilene", "Akron", "Alafaya", "Alameda", "Albany", "Albuquerque", "Alexandria", "Alhambra", "Aliso Viejo", "Allen", "Allentown", "Aloha", "Alpharetta", "Altadena", "Altamonte Springs", "Altoona", "Amarillo", "Ames", "Anaheim", "Anchorage", "Anderson", "Ankeny", "Ann Arbor", "Annandale", "Antelope", "Antioch", "Apex", "Apopka", "Apple Valley", "Appleton", "Arcadia", "Arden-Arcade", "Arecibo", "Arlington", "Arlington Heights", "Arvada", "Ashburn", "Asheville", "Aspen Hill", "Atascocita", "Athens-Clarke County", "Atlanta", "Attleboro", "Auburn", "Augusta-Richmond County", "Aurora", "Austin", "Avondale", "Azusa", "Bakersfield", "Baldwin Park", "Baltimore", "Barnstable Town", "Bartlett", "Baton Rouge", "Battle Creek", "Bayamon", "Bayonne", "Baytown", "Beaumont", "Beavercreek", "Beaverton", "Bedford", "Bel Air South", "Bell Gardens", "Belleville", "Bellevue", "Bellflower", "Bellingham", "Bend", "Bentonville", "Berkeley", "Berwyn", "Bethesda", "Bethlehem", "Billings", "Biloxi", "Binghamton", "Birmingham", "Bismarck", "Blacksburg", "Blaine", "Bloomington", "Blue Springs", "Boca Raton", "Boise City", "Bolingbrook", "Bonita Springs", "Bossier City", "Boston", "Bothell", "Boulder", "Bountiful", "Bowie", "Bowling Green", "Boynton Beach", "Bozeman", "Bradenton", "Brandon", "Brentwood", "Bridgeport", "Bristol", "Brockton", "Broken Arrow", "Brookhaven", "Brookline", "Brooklyn Park", "Broomfield", "Brownsville", "Bryan", "Buckeye", "Buena Park", "Buffalo", "Buffalo Grove", "Burbank", "Burien", "Burke", "Burleson", "Burlington", "Burnsville", "Caguas", "Caldwell", "Camarillo", "Cambridge", "Camden", "Canton", "Cape Coral", "Carlsbad", "Carmel", "Carmichael", "Carolina", "Carrollton", "Carson", "Carson City", "Cary", "Casa Grande", "Casas Adobes", "Casper", "Castle Rock", "Castro Valley", "Catalina Foothills", "Cathedral City", "Catonsville", "Cedar Hill", "Cedar Park", "Cedar Rapids", "Centennial", "Centreville", "Ceres", "Cerritos", "Champaign", "Chandler", "Chapel Hill", "Charleston", "Charlotte", "Charlottesville", "Chattanooga", "Cheektowaga", "Chesapeake", "Chesterfield", "Cheyenne", "Chicago", "Chico", "Chicopee", "Chino", "Chino Hills", "Chula Vista", "Cicero", "Cincinnati", "Citrus Heights", "Clarksville", "Clearwater", "Cleveland", "Cleveland Heights", "Clifton", "Clovis", "Coachella", "Coconut Creek", "Coeur d'Alene", "College Station", "Collierville", "Colorado Springs", "Colton", "Columbia", "Columbus", "Commerce City", "Compton", "Concord", "Conroe", "Conway", "Coon Rapids", "Coral Gables", "Coral Springs", "Corona", "Corpus Christi", "Corvallis", "Costa Mesa", "Council Bluffs", "Country Club", "Covina", "Cranston", "Cupertino", "Cutler Bay", "Cuyahoga Falls", "Cypress", "Dale City", "Dallas", "Daly City", "Danbury", "Danville", "Davenport", "Davie", "Davis", "Dayton", "Daytona Beach", "DeKalb", "DeSoto", "Dearborn", "Dearborn Heights", "Decatur", "Deerfield Beach", "Delano", "Delray Beach", "Deltona", "Denton", "Denver", "Des Moines", "Des Plaines", "Detroit", "Diamond Bar", "Doral", "Dothan", "Downers Grove", "Downey", "Draper", "Dublin", "Dubuque", "Duluth", "Dundalk", "Dunwoody", "Durham", "Eagan", "East Hartford", "East Honolulu", "East Lansing", "East Los Angeles", "East Orange", "East Providence", "Eastvale", "Eau Claire", "Eden Prairie", "Edina", "Edinburg", "Edmond", "El Cajon", "El Centro", "El Dorado Hills", "El Monte", "El Paso", "Elgin", "Elizabeth", "Elk Grove", "Elkhart", "Ellicott City", "Elmhurst", "Elyria", "Encinitas", "Enid", "Enterprise", "Erie", "Escondido", "Euclid", "Eugene", "Euless", "Evanston", "Evansville", "Everett", "Fairfield", "Fall River", "Fargo", "Farmington", "Farmington Hills", "Fayetteville", "Federal Way", "Findlay", "Fishers", "Flagstaff", "Flint", "Florence-Graham", "Florin", "Florissant", "Flower Mound", "Folsom", "Fond du Lac", "Fontana", "Fort Collins", "Fort Lauderdale", "Fort Myers", "Fort Pierce", "Fort Smith", "Fort Wayne", "Fort Worth", "Fountain Valley", "Fountainebleau", "Framingham", "Franklin", "Frederick", "Freeport", "Fremont", "Fresno", "Frisco", "Fullerton", "Gainesville", "Gaithersburg", "Galveston", "Garden Grove", "Gardena", "Garland", "Gary", "Gastonia", "Georgetown", "Germantown", "Gilbert", "Gilroy", "Glen Burnie", "Glendale", "Glendora", "Glenview", "Goodyear", "Grand Forks", "Grand Island", "Grand Junction", "Grand Prairie", "Grand Rapids", "Grapevine", "Great Falls", "Greeley", "Green Bay", "Greensboro", "Greenville", "Greenwood", "Gresham", "Guaynabo", "Gulfport", "Hacienda Heights", "Hackensack", "Haltom City", "Hamilton", "Hammond", "Hampton", "Hanford", "Harlingen", "Harrisburg", "Harrisonburg", "Hartford", "Hattiesburg", "Haverhill", "Hawthorne", "Hayward", "Hemet", "Hempstead", "Henderson", "Hendersonville", "Hesperia", "Hialeah", "Hicksville", "High Point", "Highland", "Highlands Ranch", "Hillsboro", "Hilo", "Hoboken", "Hoffman Estates", "Hollywood", "Homestead", "Honolulu", "Hoover", "Houston", "Huntersville", "Huntington", "Huntington Beach", "Huntington Park", "Huntsville", "Hutchinson", "Idaho Falls", "Independence", "Indianapolis", "Indio", "Inglewood", "Iowa City", "Irondequoit", "Irvine", "Irving", "Jackson", "Jacksonville", "Janesville", "Jefferson City", "Jeffersonville", "Jersey City", "Johns Creek", "Johnson City", "Joliet", "Jonesboro", "Joplin", "Jupiter", "Jurupa Valley", "Kalamazoo", "Kannapolis", "Kansas City", "Kearny", "Keller", "Kendale Lakes", "Kendall", "Kenner", "Kennewick", "Kenosha", "Kent", "Kentwood", "Kettering", "Killeen", "Kingsport", "Kirkland", "Kissimmee", "Knoxville", "Kokomo", "La Crosse", "La Habra", "La Mesa", "La Mirada", "Lacey", "Lafayette", "Laguna Niguel", "Lake Charles", "Lake Elsinore", "Lake Forest", "Lake Havasu City", "Lake Ridge", "Lakeland", "Lakeville", "Lakewood", "Lancaster", "Lansing", "Laredo", "Largo", "Las Cruces", "Las Vegas", "Lauderhill", "Lawrence", "Lawton", "Layton", "League City", "Lee's Summit", "Leesburg", "Lehi", "Lehigh Acres", "Lenexa", "Levittown", "Lewisville", "Lexington-Fayette", "Lincoln", "Linden", "Little Rock", "Littleton", "Livermore", "Livonia", "Lodi", "Logan", "Lombard", "Lompoc", "Long Beach", "Longmont", "Longview", "Lorain", "Los Angeles", "Louisville/Jefferson County", "Loveland", "Lowell", "Lubbock", "Lynchburg", "Lynn", "Lynwood", "Macon-Bibb County", "Madera", "Madison", "Malden", "Manchester", "Manhattan", "Mansfield", "Manteca", "Maple Grove", "Margate", "Maricopa", "Marietta", "Marysville", "Mayaguez", "McAllen", "McKinney", "McLean", "Medford", "Melbourne", "Memphis", "Menifee", "Mentor", "Merced", "Meriden", "Meridian", "Mesa", "Mesquite", "Metairie", "Methuen Town", "Miami", "Miami Beach", "Miami Gardens", "Middletown", "Midland", "Midwest City", "Milford", "Millcreek", "Milpitas", "Milwaukee", "Minneapolis", "Minnetonka", "Minot", "Miramar", "Mishawaka", "Mission", "Mission Viejo", "Missoula", "Missouri City", "Mobile", "Modesto", "Moline", "Monroe", "Montebello", "Monterey Park", "Montgomery", "Moore", "Moreno Valley", "Morgan Hill", "Mount Pleasant", "Mount Prospect", "Mount Vernon", "Mountain View", "Muncie", "Murfreesboro", "Murray", "Murrieta", "Nampa", "Napa", "Naperville", "Nashua", "Nashville-Davidson", "National City", "New Bedford", "New Braunfels", "New Britain", "New Brunswick", "New Haven", "New Orleans", "New Rochelle", "New York", "Newark", "Newport Beach", "Newport News", "Newton", "Niagara Falls", "Noblesville", "Norfolk", "Normal", "Norman", "North Bethesda", "North Charleston", "North Highlands", "North Las Vegas", "North Lauderdale", "North Little Rock", "North Miami", "North Miami Beach", "North Port", "North Richland Hills", "Norwalk", "Novato", "Novi", "O'Fallon", "Oak Lawn", "Oak Park", "Oakland", "Oakland Park", "Ocala", "Oceanside", "Odessa", "Ogden", "Oklahoma City", "Olathe", "Olympia", "Omaha", "Ontario", "Orange", "Orem", "Orland Park", "Orlando", "Oro Valley", "Oshkosh", "Overland Park", "Owensboro", "Oxnard", "Palatine", "Palm Bay", "Palm Beach Gardens", "Palm Coast", "Palm Desert", "Palm Harbor", "Palm Springs", "Palmdale", "Palo Alto", "Paradise", "Paramount", "Parker", "Parma", "Pasadena", "Pasco", "Passaic", "Paterson", "Pawtucket", "Peabody", "Pearl City", "Pearland", "Pembroke Pines", "Pensacola", "Peoria", "Perris", "Perth Amboy", "Petaluma", "Pflugerville", "Pharr", "Philadelphia", "Phoenix", "Pico Rivera", "Pine Bluff", "Pine Hills", "Pinellas Park", "Pittsburg", "Pittsburgh", "Pittsfield", "Placentia", "Plainfield", "Plano", "Plantation", "Pleasanton", "Plymouth", "Pocatello", "Poinciana", "Pomona", "Pompano Beach", "Ponce", "Pontiac", "Port Arthur", "Port Charlotte", "Port Orange", "Port St. Lucie", "Portage", "Porterville", "Portland", "Portsmouth", "Potomac", "Poway", "Providence", "Provo", "Pueblo", "Quincy", "Racine", "Raleigh", "Rancho Cordova", "Rancho Cucamonga", "Rancho Palos Verdes", "Rancho Santa Margarita", "Rapid City", "Reading", "Redding", "Redlands", "Redmond", "Redondo Beach", "Redwood City", "Reno", "Renton", "Reston", "Revere", "Rialto", "Richardson", "Richland", "Richmond", "Rio Rancho", "Riverside", "Riverton", "Riverview", "Roanoke", "Rochester", "Rochester Hills", "Rock Hill", "Rockford", "Rocklin", "Rockville", "Rockwall", "Rocky Mount", "Rogers", "Rohnert Park", "Rosemead", "Roseville", "Roswell", "Round Rock", "Rowland Heights", "Rowlett", "Royal Oak", "Sacramento", "Saginaw", "Salem", "Salina", "Salinas", "Salt Lake City", "Sammamish", "San Angelo", "San Antonio", "San Bernardino", "San Bruno", "San Buenaventura (Ventura)", "San Clemente", "San Diego", "San Francisco", "San Jacinto", "San Jose", "San Juan", "San Leandro", "San Luis Obispo", "San Marcos", "San Mateo", "San Rafael", "San Ramon", "San Tan Valley", "Sandy", "Sandy Springs", "Sanford", "Santa Ana", "Santa Barbara", "Santa Clara", "Santa Clarita", "Santa Cruz", "Santa Fe", "Santa Maria", "Santa Monica", "Santa Rosa", "Santee", "Sarasota", "Savannah", "Sayreville", "Schaumburg", "Schenectady", "Scottsdale", "Scranton", "Seattle", "Severn", "Shawnee", "Sheboygan", "Shoreline", "Shreveport", "Sierra Vista", "Silver Spring", "Simi Valley", "Sioux City", "Sioux Falls", "Skokie", "Smyrna", "Somerville", "South Bend", "South Gate", "South Hill", "South Jordan", "South San Francisco", "South Valley", "South Whittier", "Southaven", "Southfield", "Sparks", "Spokane", "Spokane Valley", "Spring", "Spring Hill", "Spring Valley", "Springdale", "Springfield", "St. Charles", "St. Clair Shores", "St. Cloud", "St. George", "St. Joseph", "St. Louis", "St. Louis Park", "St. Paul", "St. Peters", "St. Petersburg", "Stamford", "State College", "Sterling Heights", "Stillwater", "Stockton", "Stratford", "Strongsville", "Suffolk", "Sugar Land", "Summerville", "Sunnyvale", "Sunrise", "Sunrise Manor", "Surprise", "Syracuse", "Tacoma", "Tallahassee", "Tamarac", "Tamiami", "Tampa", "Taunton", "Taylor", "Taylorsville", "Temecula", "Tempe", "Temple", "Terre Haute", "Texas City", "The Hammocks", "The Villages", "The Woodlands", "Thornton", "Thousand Oaks", "Tigard", "Tinley Park", "Titusville", "Toledo", "Toms River", "Tonawanda", "Topeka", "Torrance", "Town 'n' Country", "Towson", "Tracy", "Trenton", "Troy", "Trujillo Alto", "Tuckahoe", "Tucson", "Tulare", "Tulsa", "Turlock", "Tuscaloosa", "Tustin", "Twin Falls", "Tyler", "Union City", "University", "Upland", "Urbana", "Urbandale", "Utica", "Vacaville", "Valdosta", "Vallejo", "Vancouver", "Victoria", "Victorville", "Vineland", "Virginia Beach", "Visalia", "Vista", "Waco", "Waipahu", "Waldorf", "Walnut Creek", "Waltham", "Warner Robins", "Warren", "Warwick", "Washington", "Waterbury", "Waterloo", "Watsonville", "Waukegan", "Waukesha", "Wauwatosa", "Wellington", "Wesley Chapel", "West Allis", "West Babylon", "West Covina", "West Des Moines", "West Hartford", "West Haven", "West Jordan", "West Lafayette", "West New York", "West Palm Beach", "West Sacramento", "West Seneca", "West Valley City", "Westfield", "Westland", "Westminster", "Weston", "Weymouth Town", "Wheaton", "White Plains", "Whittier", "Wichita", "Wichita Falls", "Wilmington", "Wilson", "Winston-Salem", "Woodbury", "Woodland", "Worcester", "Wylie", "Wyoming", "Yakima", "Yonkers", "Yorba Linda", "York", "Youngstown", "Yuba City", "Yucaipa", "Yuma"];
var Fe = ["{{location.city_prefix}} {{person.first_name.generic}}{{location.city_suffix}}", "{{location.city_prefix}} {{person.first_name.generic}}", "{{person.first_name.generic}}{{location.city_suffix}}", "{{person.last_name.generic}}{{location.city_suffix}}", "{{location.city_name}}"];
var Ne = ["North", "East", "West", "South", "New", "Lake", "Port", "Fort"];
var Ee = ["town", "ton", "land", "ville", "berg", "burgh", "boro", "borough", "bury", "view", "port", "mouth", "stad", "stead", "furt", "chester", "cester", "fort", "field", "haven", "side", "shire", "worth"];
var Je = ["Africa", "Antarctica", "Asia", "Australia", "Europe", "North America", "South America"];
var Ie = ["Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory (Chagos Archipelago)", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Curacao", "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Faroe Islands", "Falkland Islands (Malvinas)", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Democratic People's Republic of Korea", "Republic of Korea", "Kuwait", "Kyrgyz Republic", "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Macedonia", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn Islands", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Barthelemy", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard & Jan Mayen Islands", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands, British", "Virgin Islands, U.S.", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"];
var Ke = ["Adams County", "Calhoun County", "Carroll County", "Clark County", "Clay County", "Crawford County", "Douglas County", "Fayette County", "Franklin County", "Grant County", "Greene County", "Hamilton County", "Hancock County", "Henry County", "Jackson County", "Jefferson County", "Johnson County", "Lake County", "Lawrence County", "Lee County", "Lincoln County", "Logan County", "Madison County", "Marion County", "Marshall County", "Monroe County", "Montgomery County", "Morgan County", "Perry County", "Pike County", "Polk County", "Scott County", "Union County", "Warren County", "Washington County", "Wayne County", "Avon", "Bedfordshire", "Berkshire", "Borders", "Buckinghamshire", "Cambridgeshire", "Central", "Cheshire", "Cleveland", "Clwyd", "Cornwall", "County Antrim", "County Armagh", "County Down", "County Fermanagh", "County Londonderry", "County Tyrone", "Cumbria", "Derbyshire", "Devon", "Dorset", "Dumfries and Galloway", "Durham", "Dyfed", "East Sussex", "Essex", "Fife", "Gloucestershire", "Grampian", "Greater Manchester", "Gwent", "Gwynedd County", "Hampshire", "Herefordshire", "Hertfordshire", "Highlands and Islands", "Humberside", "Isle of Wight", "Kent", "Lancashire", "Leicestershire", "Lincolnshire", "Lothian", "Merseyside", "Mid Glamorgan", "Norfolk", "North Yorkshire", "Northamptonshire", "Northumberland", "Nottinghamshire", "Oxfordshire", "Powys", "Rutland", "Shropshire", "Somerset", "South Glamorgan", "South Yorkshire", "Staffordshire", "Strathclyde", "Suffolk", "Surrey", "Tayside", "Tyne and Wear", "Warwickshire", "West Glamorgan", "West Midlands", "West Sussex", "West Yorkshire", "Wiltshire", "Worcestershire"];
var Oe = { cardinal: ["North", "East", "South", "West"], cardinal_abbr: ["N", "E", "S", "W"], ordinal: ["Northeast", "Northwest", "Southeast", "Southwest"], ordinal_abbr: ["NE", "NW", "SE", "SW"] };
var xe = [{ name: "Afrikaans", alpha2: "af", alpha3: "afr" }, { name: "Azerbaijani", alpha2: "az", alpha3: "aze" }, { name: "Maldivian", alpha2: "dv", alpha3: "div" }, { name: "Farsi/Persian", alpha2: "fa", alpha3: "fas" }, { name: "Latvian", alpha2: "lv", alpha3: "lav" }, { name: "Indonesian", alpha2: "id", alpha3: "ind" }, { name: "Nepali", alpha2: "ne", alpha3: "nep" }, { name: "Thai", alpha2: "th", alpha3: "tha" }, { name: "Uzbek", alpha2: "uz", alpha3: "uzb" }, { name: "Yoruba", alpha2: "yo", alpha3: "yor" }, { name: "Pashto", alpha2: "ps", alpha3: "pus" }, { name: "English", alpha2: "en", alpha3: "eng" }, { name: "Urdu", alpha2: "ur", alpha3: "urd" }, { name: "German", alpha2: "de", alpha3: "deu" }, { name: "French", alpha2: "fr", alpha3: "fra" }, { name: "Spanish", alpha2: "es", alpha3: "spa" }, { name: "Italian", alpha2: "it", alpha3: "ita" }, { name: "Dutch", alpha2: "nl", alpha3: "nld" }, { name: "Russian", alpha2: "ru", alpha3: "rus" }, { name: "Portuguese", alpha2: "pt", alpha3: "por" }, { name: "Polish", alpha2: "pl", alpha3: "pol" }, { name: "Arabic", alpha2: "ar", alpha3: "ara" }, { name: "Japanese", alpha2: "ja", alpha3: "jpn" }, { name: "Chinese", alpha2: "zh", alpha3: "zho" }, { name: "Hindi", alpha2: "hi", alpha3: "hin" }, { name: "Bengali", alpha2: "bn", alpha3: "ben" }, { name: "Gujarati", alpha2: "gu", alpha3: "guj" }, { name: "Tamil", alpha2: "ta", alpha3: "tam" }, { name: "Telugu", alpha2: "te", alpha3: "tel" }, { name: "Punjabi", alpha2: "pa", alpha3: "pan" }, { name: "Vietnamese", alpha2: "vi", alpha3: "vie" }, { name: "Korean", alpha2: "ko", alpha3: "kor" }, { name: "Turkish", alpha2: "tr", alpha3: "tur" }, { name: "Swedish", alpha2: "sv", alpha3: "swe" }, { name: "Greek", alpha2: "el", alpha3: "ell" }, { name: "Czech", alpha2: "cs", alpha3: "ces" }, { name: "Hungarian", alpha2: "hu", alpha3: "hun" }, { name: "Romanian", alpha2: "ro", alpha3: "ron" }, { name: "Ukrainian", alpha2: "uk", alpha3: "ukr" }, { name: "Norwegian", alpha2: "no", alpha3: "nor" }, { name: "Serbian", alpha2: "sr", alpha3: "srp" }, { name: "Croatian", alpha2: "hr", alpha3: "hrv" }, { name: "Slovak", alpha2: "sk", alpha3: "slk" }, { name: "Slovenian", alpha2: "sl", alpha3: "slv" }, { name: "Icelandic", alpha2: "is", alpha3: "isl" }, { name: "Finnish", alpha2: "fi", alpha3: "fin" }, { name: "Danish", alpha2: "da", alpha3: "dan" }, { name: "Swahili", alpha2: "sw", alpha3: "swa" }, { name: "Bashkir", alpha2: "ba", alpha3: "bak" }, { name: "Basque", alpha2: "eu", alpha3: "eus" }, { name: "Catalan", alpha2: "ca", alpha3: "cat" }, { name: "Galician", alpha2: "gl", alpha3: "glg" }, { name: "Esperanto", alpha2: "eo", alpha3: "epo" }, { name: "Fijian", alpha2: "fj", alpha3: "fij" }, { name: "Malagasy", alpha2: "mg", alpha3: "mlg" }, { name: "Maltese", alpha2: "mt", alpha3: "mlt" }, { name: "Albanian", alpha2: "sq", alpha3: "sqi" }, { name: "Armenian", alpha2: "hy", alpha3: "hye" }, { name: "Georgian", alpha2: "ka", alpha3: "kat" }, { name: "Macedonian", alpha2: "mk", alpha3: "mkd" }, { name: "Kazakh", alpha2: "kk", alpha3: "kaz" }, { name: "Haitian Creole", alpha2: "ht", alpha3: "hat" }, { name: "Mongolian", alpha2: "mn", alpha3: "mon" }, { name: "Kyrgyz", alpha2: "ky", alpha3: "kir" }, { name: "Finnish", alpha2: "fi", alpha3: "fin" }, { name: "Tagalog", alpha2: "tl", alpha3: "tgl" }, { name: "Malay", alpha2: "ms", alpha3: "msa" }, { name: "Tajik", alpha2: "tg", alpha3: "tgk" }, { name: "Swati", alpha2: "ss", alpha3: "ssw" }, { name: "Tatar", alpha2: "tt", alpha3: "tat" }, { name: "Zulu", alpha2: "zu", alpha3: "zul" }];
var ze = ["#####", "#####-####"];
var Ve = ["Apt. ###", "Suite ###"];
var Ye = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
var je = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
var qe = { normal: "{{location.buildingNumber}} {{location.street}}", full: "{{location.buildingNumber}} {{location.street}} {{location.secondaryAddress}}" };
var Ue = ["10th Street", "11th Street", "12th Street", "13th Street", "14th Street", "15th Street", "16th Street", "1st Avenue", "1st Street", "2nd Avenue", "2nd Street", "3rd Avenue", "3rd Street", "4th Avenue", "4th Street", "5th Avenue", "5th Street", "6th Avenue", "6th Street", "7th Avenue", "7th Street", "8th Avenue", "8th Street", "9th Street", "A Street", "Abbey Road", "Adams Avenue", "Adams Street", "Airport Road", "Albany Road", "Albert Road", "Albion Street", "Alexandra Road", "Alfred Street", "Alma Street", "Ash Close", "Ash Grove", "Ash Road", "Ash Street", "Aspen Close", "Atlantic Avenue", "Avenue Road", "Back Lane", "Baker Street", "Balmoral Road", "Barn Close", "Barton Road", "Bath Road", "Bath Street", "Bay Street", "Beach Road", "Bedford Road", "Beech Close", "Beech Drive", "Beech Grove", "Beech Road", "Beechwood Avenue", "Bell Lane", "Belmont Road", "Birch Avenue", "Birch Close", "Birch Grove", "Birch Road", "Blind Lane", "Bluebell Close", "Boundary Road", "Bramble Close", "Bramley Close", "Bridge Road", "Bridge Street", "Broad Lane", "Broad Street", "Broadway", "Broadway Avenue", "Broadway Street", "Brook Lane", "Brook Road", "Brook Street", "Brookside", "Buckingham Road", "Cambridge Street", "Canal Street", "Castle Close", "Castle Lane", "Castle Road", "Castle Street", "Cavendish Road", "Cedar Avenue", "Cedar Close", "Cedar Grove", "Cedar Road", "Cedar Street", "Cemetery Road", "Center Avenue", "Center Road", "Center Street", "Central Avenue", "Central Street", "Chapel Close", "Chapel Hill", "Chapel Road", "Chapel Street", "Charles Street", "Cherry Close", "Cherry Street", "Cherry Tree Close", "Chester Road", "Chestnut Close", "Chestnut Drive", "Chestnut Grove", "Chestnut Street", "Church Avenue", "Church Close", "Church Hill", "Church Lane", "Church Path", "Church Road", "Church Street", "Church View", "Church Walk", "Claremont Road", "Clarence Road", "Clarence Street", "Clarendon Road", "Clark Street", "Clay Lane", "Cleveland Street", "Cliff Road", "Clifton Road", "Clinton Street", "College Avenue", "College Street", "Columbia Avenue", "Commerce Street", "Commercial Road", "Commercial Street", "Common Lane", "Coronation Avenue", "Coronation Road", "County Line Road", "County Road", "Court Street", "Cow Lane", "Crescent Road", "Cromwell Road", "Cross Lane", "Cross Street", "Crown Street", "Cumberland Street", "Dale Street", "Dark Lane", "Davis Street", "Depot Street", "Derby Road", "Derwent Close", "Devonshire Road", "Division Street", "Douglas Road", "Duke Street", "E 10th Street", "E 11th Street", "E 12th Street", "E 14th Street", "E 1st Street", "E 2nd Street", "E 3rd Street", "E 4th Avenue", "E 4th Street", "E 5th Street", "E 6th Avenue", "E 6th Street", "E 7th Street", "E 8th Street", "E 9th Street", "E Bridge Street", "E Broad Street", "E Broadway", "E Broadway Street", "E Cedar Street", "E Center Street", "E Central Avenue", "E Church Street", "E Elm Street", "E Franklin Street", "E Front Street", "E Grand Avenue", "E High Street", "E Jackson Street", "E Jefferson Street", "E Main", "E Main Street", "E Maple Street", "E Market Street", "E North Street", "E Oak Street", "E Park Avenue", "E Pine Street", "E River Road", "E South Street", "E State Street", "E Union Street", "E Walnut Street", "E Washington Avenue", "E Washington Street", "E Water Street", "East Avenue", "East Road", "East Street", "Edward Street", "Elm Close", "Elm Grove", "Elm Road", "Elm Street", "Euclid Avenue", "Fairfield Road", "Farm Close", "Ferry Road", "Field Close", "Field Lane", "First Avenue", "First Street", "Fore Street", "Forest Avenue", "Forest Road", "Fourth Avenue", "Franklin Avenue", "Franklin Road", "Franklin Street", "Front Street", "Frontage Road", "Garden Close", "Garden Street", "George Street", "Gladstone Road", "Glebe Close", "Gloucester Road", "Gordon Road", "Gordon Street", "Grand Avenue", "Grange Avenue", "Grange Close", "Grange Road", "Grant Street", "Green Close", "Green Lane", "Green Street", "Greenville Road", "Greenway", "Greenwood Road", "Grove Lane", "Grove Road", "Grove Street", "Hall Lane", "Hall Street", "Harrison Avenue", "Harrison Street", "Hawthorn Avenue", "Hawthorn Close", "Hazel Close", "Hazel Grove", "Heath Road", "Heather Close", "Henry Street", "Heron Close", "Hickory Street", "High Road", "High Street", "Highfield Avenue", "Highfield Close", "Highfield Road", "Highland Avenue", "Hill Road", "Hill Street", "Hillside", "Hillside Avenue", "Hillside Close", "Hillside Road", "Holly Close", "Honeysuckle Close", "Howard Road", "Howard Street", "Jackson Avenue", "Jackson Street", "James Street", "Jefferson Avenue", "Jefferson Street", "Johnson Street", "Jubilee Close", "Juniper Close", "Kent Road", "Kestrel Close", "King Street", "King's Road", "Kingfisher Close", "Kings Highway", "Kingsway", "Laburnum Grove", "Lafayette Street", "Lake Avenue", "Lake Drive", "Lake Road", "Lake Street", "Lancaster Road", "Lansdowne Road", "Larch Close", "Laurel Close", "Lawrence Street", "Lee Street", "Liberty Street", "Lime Grove", "Lincoln Avenue", "Lincoln Highway", "Lincoln Road", "Lincoln Street", "Locust Street", "Lodge Close", "Lodge Lane", "London Road", "Long Lane", "Low Road", "Madison Avenue", "Madison Street", "Main", "Main Avenue", "Main Road", "Main Street", "Main Street E", "Main Street N", "Main Street S", "Main Street W", "Manchester Road", "Manor Close", "Manor Drive", "Manor Gardens", "Manor Road", "Manor Way", "Maple Avenue", "Maple Close", "Maple Drive", "Maple Road", "Maple Street", "Market Place", "Market Square", "Market Street", "Marlborough Road", "Marsh Lane", "Martin Luther King Boulevard", "Martin Luther King Drive", "Martin Luther King Jr Boulevard", "Mary Street", "Mayfield Road", "Meadow Close", "Meadow Drive", "Meadow Lane", "Meadow View", "Meadow Way", "Memorial Drive", "Middle Street", "Mill Close", "Mill Lane", "Mill Road", "Mill Street", "Milton Road", "Milton Street", "Monroe Street", "Moor Lane", "Moss Lane", "Mount Pleasant", "Mount Street", "Mulberry Street", "N 1st Street", "N 2nd Street", "N 3rd Street", "N 4th Street", "N 5th Street", "N 6th Street", "N 7th Street", "N 8th Street", "N 9th Street", "N Bridge Street", "N Broad Street", "N Broadway", "N Broadway Street", "N Cedar Street", "N Center Street", "N Central Avenue", "N Chestnut Street", "N Church Street", "N College Street", "N Court Street", "N Division Street", "N East Street", "N Elm Street", "N Franklin Street", "N Front Street", "N Harrison Street", "N High Street", "N Jackson Street", "N Jefferson Street", "N Lincoln Street", "N Locust Street", "N Main", "N Main Avenue", "N Main Street", "N Maple Street", "N Market Street", "N Monroe Street", "N Oak Street", "N Park Street", "N Pearl Street", "N Pine Street", "N Poplar Street", "N Railroad Street", "N State Street", "N Union Street", "N Walnut Street", "N Washington Avenue", "N Washington Street", "N Water Street", "Nelson Road", "Nelson Street", "New Lane", "New Road", "New Street", "Newton Road", "Nightingale Close", "Norfolk Road", "North Avenue", "North Lane", "North Road", "North Street", "Northfield Road", "Oak Avenue", "Oak Drive", "Oak Lane", "Oak Road", "Oak Street", "Oakfield Road", "Oaklands", "Old Lane", "Old Military Road", "Old Road", "Old State Road", "Orchard Drive", "Orchard Lane", "Orchard Road", "Orchard Street", "Oxford Road", "Oxford Street", "Park Avenue", "Park Crescent", "Park Drive", "Park Lane", "Park Place", "Park Road", "Park Street", "Park View", "Parkside", "Pearl Street", "Pennsylvania Avenue", "Pine Close", "Pine Grove", "Pine Street", "Pinfold Lane", "Pleasant Street", "Poplar Avenue", "Poplar Close", "Poplar Road", "Poplar Street", "Post Road", "Pound Lane", "Princes Street", "Princess Street", "Priory Close", "Priory Road", "Prospect Avenue", "Prospect Place", "Prospect Road", "Prospect Street", "Quarry Lane", "Quarry Road", "Queen's Road", "Railroad Avenue", "Railroad Street", "Railway Street", "Rectory Close", "Rectory Lane", "Richmond Close", "Richmond Road", "Ridge Road", "River Road", "River Street", "Riverside", "Riverside Avenue", "Riverside Drive", "Roman Road", "Roman Way", "Rowan Close", "Russell Street", "S 10th Street", "S 14th Street", "S 1st Avenue", "S 1st Street", "S 2nd Street", "S 3rd Street", "S 4th Street", "S 5th Street", "S 6th Street", "S 7th Street", "S 8th Street", "S 9th Street", "S Bridge Street", "S Broad Street", "S Broadway", "S Broadway Street", "S Center Street", "S Central Avenue", "S Chestnut Street", "S Church Street", "S College Street", "S Division Street", "S East Street", "S Elm Street", "S Franklin Street", "S Front Street", "S Grand Avenue", "S High Street", "S Jackson Street", "S Jefferson Street", "S Lincoln Street", "S Main", "S Main Avenue", "S Main Street", "S Maple Street", "S Market Street", "S Mill Street", "S Monroe Street", "S Oak Street", "S Park Street", "S Pine Street", "S Railroad Street", "S State Street", "S Union Street", "S Walnut Street", "S Washington Avenue", "S Washington Street", "S Water Street", "S West Street", "Salisbury Road", "Sandringham Road", "Sandy Lane", "School Close", "School Lane", "School Road", "School Street", "Second Avenue", "Silver Street", "Skyline Drive", "Smith Street", "Somerset Road", "South Avenue", "South Drive", "South Road", "South Street", "South View", "Spring Gardens", "Spring Street", "Springfield Close", "Springfield Road", "Spruce Street", "St Andrew's Road", "St Andrews Close", "St George's Road", "St John's Road", "St Mary's Close", "St Mary's Road", "Stanley Road", "Stanley Street", "State Avenue", "State Line Road", "State Road", "State Street", "Station Road", "Station Street", "Stoney Lane", "Sycamore Avenue", "Sycamore Close", "Sycamore Drive", "Sycamore Street", "Talbot Road", "Tennyson Road", "The Avenue", "The Beeches", "The Causeway", "The Chase", "The Coppice", "The Copse", "The Crescent", "The Croft", "The Dell", "The Drive", "The Fairway", "The Glebe", "The Grange", "The Green", "The Grove", "The Hawthorns", "The Lane", "The Laurels", "The Limes", "The Maltings", "The Meadows", "The Mews", "The Mount", "The Oaks", "The Orchard", "The Oval", "The Paddock", "The Paddocks", "The Poplars", "The Ridgeway", "The Ridings", "The Rise", "The Sidings", "The Spinney", "The Square", "The Willows", "The Woodlands", "Third Avenue", "Third Street", "Tower Road", "Trinity Road", "Tudor Close", "Union Avenue", "Union Street", "University Avenue", "University Drive", "Valley Road", "Veterans Memorial Drive", "Veterans Memorial Highway", "Vicarage Close", "Vicarage Lane", "Vicarage Road", "Victoria Place", "Victoria Road", "Victoria Street", "Vine Street", "W 10th Street", "W 11th Street", "W 12th Street", "W 14th Street", "W 1st Street", "W 2nd Street", "W 3rd Street", "W 4th Avenue", "W 4th Street", "W 5th Street", "W 6th Avenue", "W 6th Street", "W 7th Street", "W 8th Street", "W 9th Street", "W Bridge Street", "W Broad Street", "W Broadway", "W Broadway Avenue", "W Broadway Street", "W Center Street", "W Central Avenue", "W Chestnut Street", "W Church Street", "W Division Street", "W Elm Street", "W Franklin Street", "W Front Street", "W Grand Avenue", "W High Street", "W Jackson Street", "W Jefferson Street", "W Lake Street", "W Main", "W Main Street", "W Maple Street", "W Market Street", "W Monroe Street", "W North Street", "W Oak Street", "W Park Street", "W Pine Street", "W River Road", "W South Street", "W State Street", "W Union Street", "W Walnut Street", "W Washington Avenue", "W Washington Street", "Walnut Close", "Walnut Street", "Warren Close", "Warren Road", "Washington Avenue", "Washington Boulevard", "Washington Road", "Washington Street", "Water Lane", "Water Street", "Waterloo Road", "Waterside", "Watery Lane", "Waverley Road", "Well Lane", "Wellington Road", "Wellington Street", "West Avenue", "West End", "West Lane", "West Road", "West Street", "West View", "Western Avenue", "Western Road", "Westfield Road", "Westgate", "William Street", "Willow Close", "Willow Drive", "Willow Grove", "Willow Road", "Willow Street", "Windermere Road", "Windmill Close", "Windmill Lane", "Windsor Avenue", "Windsor Close", "Windsor Drive", "Wood Lane", "Wood Street", "Woodland Close", "Woodland Road", "Woodlands", "Woodlands Avenue", "Woodlands Close", "Woodlands Road", "Woodside", "Woodside Road", "Wren Close", "Yew Tree Close", "York Road", "York Street"];
var Ze = ["{{person.first_name.generic}} {{location.street_suffix}}", "{{person.last_name.generic}} {{location.street_suffix}}", "{{location.street_name}}"];
var _e = ["Alley", "Avenue", "Branch", "Bridge", "Brook", "Brooks", "Burg", "Burgs", "Bypass", "Camp", "Canyon", "Cape", "Causeway", "Center", "Centers", "Circle", "Circles", "Cliff", "Cliffs", "Club", "Common", "Corner", "Corners", "Course", "Court", "Courts", "Cove", "Coves", "Creek", "Crescent", "Crest", "Crossing", "Crossroad", "Curve", "Dale", "Dam", "Divide", "Drive", "Drives", "Estate", "Estates", "Expressway", "Extension", "Extensions", "Fall", "Falls", "Ferry", "Field", "Fields", "Flat", "Flats", "Ford", "Fords", "Forest", "Forge", "Forges", "Fork", "Forks", "Fort", "Freeway", "Garden", "Gardens", "Gateway", "Glen", "Glens", "Green", "Greens", "Grove", "Groves", "Harbor", "Harbors", "Haven", "Heights", "Highway", "Hill", "Hills", "Hollow", "Inlet", "Island", "Islands", "Isle", "Junction", "Junctions", "Key", "Keys", "Knoll", "Knolls", "Lake", "Lakes", "Land", "Landing", "Lane", "Light", "Lights", "Loaf", "Lock", "Locks", "Lodge", "Loop", "Mall", "Manor", "Manors", "Meadow", "Meadows", "Mews", "Mill", "Mills", "Mission", "Motorway", "Mount", "Mountain", "Mountains", "Neck", "Orchard", "Oval", "Overpass", "Park", "Parks", "Parkway", "Parkways", "Pass", "Passage", "Path", "Pike", "Pine", "Pines", "Place", "Plain", "Plains", "Plaza", "Point", "Points", "Port", "Ports", "Prairie", "Radial", "Ramp", "Ranch", "Rapid", "Rapids", "Rest", "Ridge", "Ridges", "River", "Road", "Roads", "Route", "Row", "Rue", "Run", "Shoal", "Shoals", "Shore", "Shores", "Skyway", "Spring", "Springs", "Spur", "Spurs", "Square", "Squares", "Station", "Stravenue", "Stream", "Street", "Streets", "Summit", "Terrace", "Throughway", "Trace", "Track", "Trafficway", "Trail", "Tunnel", "Turnpike", "Underpass", "Union", "Unions", "Valley", "Valleys", "Via", "Viaduct", "View", "Views", "Village", "Villages", "Ville", "Vista", "Walk", "Walks", "Wall", "Way", "Ways", "Well", "Wells"];
var ur = { building_number: We, city_name: Ge, city_pattern: Fe, city_prefix: Ne, city_suffix: Ee, continent: Je, country: Ie, county: Ke, direction: Oe, language: xe, postcode: ze, secondary_address: Ve, state: Ye, state_abbr: je, street_address: qe, street_name: Ue, street_pattern: Ze, street_suffix: _e };
var Qe = ur;
var Xe = ["a", "ab", "abbas", "abduco", "abeo", "abscido", "absconditus", "absens", "absorbeo", "absque", "abstergo", "absum", "abundans", "abutor", "accedo", "accendo", "acceptus", "accommodo", "accusamus", "accusantium", "accusator", "acer", "acerbitas", "acervus", "acidus", "acies", "acquiro", "acsi", "ad", "adamo", "adaugeo", "addo", "adduco", "ademptio", "adeo", "adeptio", "adfectus", "adfero", "adficio", "adflicto", "adhaero", "adhuc", "adicio", "adimpleo", "adinventitias", "adipisci", "adipiscor", "adiuvo", "administratio", "admiratio", "admitto", "admoneo", "admoveo", "adnuo", "adopto", "adsidue", "adstringo", "adsuesco", "adsum", "adulatio", "adulescens", "aduro", "advenio", "adversus", "advoco", "aedificium", "aeger", "aegre", "aegrotatio", "aegrus", "aeneus", "aequitas", "aequus", "aer", "aestas", "aestivus", "aestus", "aetas", "aeternus", "ager", "aggero", "aggredior", "agnitio", "agnosco", "ago", "ait", "aiunt", "alias", "alienus", "alii", "alioqui", "aliqua", "aliquam", "aliquid", "alius", "allatus", "alo", "alter", "altus", "alveus", "amaritudo", "ambitus", "ambulo", "amet", "amicitia", "amiculum", "amissio", "amita", "amitto", "amo", "amor", "amoveo", "amplexus", "amplitudo", "amplus", "ancilla", "angelus", "angulus", "angustus", "animadverto", "animi", "animus", "annus", "anser", "ante", "antea", "antepono", "antiquus", "aperiam", "aperio", "aperte", "apostolus", "apparatus", "appello", "appono", "appositus", "approbo", "apto", "aptus", "apud", "aqua", "ara", "aranea", "arbitro", "arbor", "arbustum", "arca", "arceo", "arcesso", "architecto", "arcus", "argentum", "argumentum", "arguo", "arma", "armarium", "aro", "ars", "articulus", "artificiose", "arto", "arx", "ascisco", "ascit", "asper", "asperiores", "aspernatur", "aspicio", "asporto", "assentator", "assumenda", "astrum", "at", "atavus", "ater", "atque", "atqui", "atrocitas", "atrox", "attero", "attollo", "attonbitus", "auctor", "auctus", "audacia", "audax", "audentia", "audeo", "audio", "auditor", "aufero", "aureus", "aurum", "aut", "autem", "autus", "auxilium", "avaritia", "avarus", "aveho", "averto", "baiulus", "balbus", "barba", "bardus", "basium", "beatae", "beatus", "bellicus", "bellum", "bene", "beneficium", "benevolentia", "benigne", "bestia", "bibo", "bis", "blandior", "blanditiis", "bonus", "bos", "brevis", "cado", "caecus", "caelestis", "caelum", "calamitas", "calcar", "calco", "calculus", "callide", "campana", "candidus", "canis", "canonicus", "canto", "capillus", "capio", "capitulus", "capto", "caput", "carbo", "carcer", "careo", "caries", "cariosus", "caritas", "carmen", "carpo", "carus", "casso", "caste", "casus", "catena", "caterva", "cattus", "cauda", "causa", "caute", "caveo", "cavus", "cedo", "celebrer", "celer", "celo", "cena", "cenaculum", "ceno", "censura", "centum", "cerno", "cernuus", "certe", "certus", "cervus", "cetera", "charisma", "chirographum", "cibo", "cibus", "cicuta", "cilicium", "cimentarius", "ciminatio", "cinis", "circumvenio", "cito", "civis", "civitas", "clam", "clamo", "claro", "clarus", "claudeo", "claustrum", "clementia", "clibanus", "coadunatio", "coaegresco", "coepi", "coerceo", "cogito", "cognatus", "cognomen", "cogo", "cohaero", "cohibeo", "cohors", "colligo", "collum", "colo", "color", "coma", "combibo", "comburo", "comedo", "comes", "cometes", "comis", "comitatus", "commemoro", "comminor", "commodi", "commodo", "communis", "comparo", "compello", "complectus", "compono", "comprehendo", "comptus", "conatus", "concedo", "concido", "conculco", "condico", "conduco", "confero", "confido", "conforto", "confugo", "congregatio", "conicio", "coniecto", "conitor", "coniuratio", "conor", "conqueror", "conscendo", "consectetur", "consequatur", "consequuntur", "conservo", "considero", "conspergo", "constans", "consuasor", "contabesco", "contego", "contigo", "contra", "conturbo", "conventus", "convoco", "copia", "copiose", "cornu", "corona", "corporis", "corpus", "correptius", "corrigo", "corroboro", "corrumpo", "corrupti", "coruscus", "cotidie", "crapula", "cras", "crastinus", "creator", "creber", "crebro", "credo", "creo", "creptio", "crepusculum", "cresco", "creta", "cribro", "crinis", "cruciamentum", "crudelis", "cruentus", "crur", "crustulum", "crux", "cubicularis", "cubitum", "cubo", "cui", "cuius", "culpa", "culpo", "cultellus", "cultura", "cum", "cumque", "cunabula", "cunae", "cunctatio", "cupiditas", "cupiditate", "cupio", "cuppedia", "cupressus", "cur", "cura", "curatio", "curia", "curiositas", "curis", "curo", "curriculum", "currus", "cursim", "curso", "cursus", "curto", "curtus", "curvo", "custodia", "damnatio", "damno", "dapifer", "debeo", "debilito", "debitis", "decens", "decerno", "decet", "decimus", "decipio", "decor", "decretum", "decumbo", "dedecor", "dedico", "deduco", "defaeco", "defendo", "defero", "defessus", "defetiscor", "deficio", "defleo", "defluo", "defungo", "degenero", "degero", "degusto", "deinde", "delectatio", "delectus", "delego", "deleniti", "deleo", "delibero", "delicate", "delinquo", "deludo", "demens", "demergo", "demitto", "demo", "demonstro", "demoror", "demulceo", "demum", "denego", "denique", "dens", "denuncio", "denuo", "deorsum", "depereo", "depono", "depopulo", "deporto", "depraedor", "deprecator", "deprimo", "depromo", "depulso", "deputo", "derelinquo", "derideo", "deripio", "deserunt", "desidero", "desino", "desipio", "desolo", "desparatus", "despecto", "dicta", "dignissimos", "distinctio", "dolor", "dolore", "dolorem", "doloremque", "dolores", "doloribus", "dolorum", "ducimus", "ea", "eaque", "earum", "eius", "eligendi", "enim", "eos", "error", "esse", "est", "et", "eum", "eveniet", "ex", "excepturi", "exercitationem", "expedita", "explicabo", "facere", "facilis", "fuga", "fugiat", "fugit", "harum", "hic", "id", "illo", "illum", "impedit", "in", "incidunt", "infit", "inflammatio", "inventore", "ipsa", "ipsam", "ipsum", "iste", "itaque", "iure", "iusto", "labore", "laboriosam", "laborum", "laudantium", "libero", "magnam", "magni", "maiores", "maxime", "minima", "minus", "modi", "molestiae", "molestias", "mollitia", "nam", "natus", "necessitatibus", "nemo", "neque", "nesciunt", "nihil", "nisi", "nobis", "non", "nostrum", "nulla", "numquam", "occaecati", "ocer", "odio", "odit", "officia", "officiis", "omnis", "optio", "paens", "pariatur", "patior", "patria", "patrocinor", "patruus", "pauci", "paulatim", "pauper", "pax", "peccatus", "pecco", "pecto", "pectus", "pecus", "peior", "pel", "perferendis", "perspiciatis", "placeat", "porro", "possimus", "praesentium", "provident", "quae", "quaerat", "quam", "quas", "quasi", "qui", "quia", "quibusdam", "quidem", "quis", "quisquam", "quo", "quod", "quos", "ratione", "recusandae", "reiciendis", "rem", "repellat", "repellendus", "reprehenderit", "repudiandae", "rerum", "saepe", "sapiente", "sed", "sequi", "similique", "sint", "sit", "socius", "sodalitas", "sol", "soleo", "solio", "solitudo", "solium", "sollers", "sollicito", "solum", "solus", "soluta", "solutio", "solvo", "somniculosus", "somnus", "sonitus", "sono", "sophismata", "sopor", "sordeo", "sortitus", "spargo", "speciosus", "spectaculum", "speculum", "sperno", "spero", "spes", "spiculum", "spiritus", "spoliatio", "sponte", "stabilis", "statim", "statua", "stella", "stillicidium", "stipes", "stips", "sto", "strenuus", "strues", "studio", "stultus", "suadeo", "suasoria", "sub", "subito", "subiungo", "sublime", "subnecto", "subseco", "substantia", "subvenio", "succedo", "succurro", "sufficio", "suffoco", "suffragium", "suggero", "sui", "sulum", "sum", "summa", "summisse", "summopere", "sumo", "sumptus", "sunt", "supellex", "super", "suppellex", "supplanto", "suppono", "supra", "surculus", "surgo", "sursum", "suscipio", "suscipit", "suspendo", "sustineo", "suus", "synagoga", "tabella", "tabernus", "tabesco", "tabgo", "tabula", "taceo", "tactus", "taedium", "talio", "talis", "talus", "tam", "tamdiu", "tamen", "tametsi", "tamisium", "tamquam", "tandem", "tantillus", "tantum", "tardus", "tego", "temeritas", "temperantia", "templum", "tempora", "tempore", "temporibus", "temptatio", "tempus", "tenax", "tendo", "teneo", "tener", "tenetur", "tenuis", "tenus", "tepesco", "tepidus", "ter", "terebro", "teres", "terga", "tergeo", "tergiversatio", "tergo", "tergum", "termes", "terminatio", "tero", "terra", "terreo", "territo", "terror", "tersus", "tertius", "testimonium", "texo", "textilis", "textor", "textus", "thalassinus", "theatrum", "theca", "thema", "theologus", "thermae", "thesaurus", "thesis", "thorax", "thymbra", "thymum", "tibi", "timidus", "timor", "titulus", "tolero", "tollo", "tondeo", "tonsor", "torqueo", "torrens", "tot", "totam", "totidem", "toties", "totus", "tracto", "trado", "traho", "trans", "tredecim", "tremo", "trepide", "tres", "tribuo", "tricesimus", "triduana", "tripudio", "tristis", "triumphus", "trucido", "truculenter", "tubineus", "tui", "tum", "tumultus", "tunc", "turba", "turbo", "turpis", "tutamen", "tutis", "tyrannus", "uberrime", "ubi", "ulciscor", "ullam", "ullus", "ulterius", "ultio", "ultra", "umbra", "umerus", "umquam", "una", "unde", "undique", "universe", "unus", "urbanus", "urbs", "uredo", "usitas", "usque", "ustilo", "ustulo", "usus", "ut", "uter", "uterque", "utilis", "utique", "utor", "utpote", "utrimque", "utroque", "utrum", "uxor", "vaco", "vacuus", "vado", "vae", "valde", "valens", "valeo", "valetudo", "validus", "vallum", "vapulus", "varietas", "varius", "vehemens", "vel", "velit", "velociter", "velum", "velut", "venia", "veniam", "venio", "ventito", "ventosus", "ventus", "venustas", "ver", "verbera", "verbum", "vere", "verecundia", "vereor", "vergo", "veritas", "veritatis", "vero", "versus", "verto", "verumtamen", "verus", "vesco", "vesica", "vesper", "vespillo", "vester", "vestigium", "vestrum", "vetus", "via", "vicinus", "vicissitudo", "victoria", "victus", "videlicet", "video", "viduo", "vigilo", "vigor", "vilicus", "vilis", "vilitas", "villa", "vinco", "vinculum", "vindico", "vinitor", "vinum", "vir", "virga", "virgo", "viridis", "viriliter", "virtus", "vis", "viscus", "vita", "vitae", "vitiosus", "vitium", "vito", "vivo", "vix", "vobis", "vociferor", "voco", "volaticus", "volo", "volubilis", "voluntarius", "volup", "voluptas", "voluptate", "voluptatem", "voluptates", "voluptatibus", "voluptatum", "volutabrum", "volva", "vomer", "vomica", "vomito", "vorago", "vorax", "voro", "vos", "votum", "voveo", "vox", "vulariter", "vulgaris", "vulgivagus", "vulgo", "vulgus", "vulnero", "vulnus", "vulpes", "vulticulus", "xiphias"];
var cr = { word: Xe };
var $e = cr;
var mr = { title: "English", code: "en", language: "en", endonym: "English", dir: "ltr", script: "Latn" };
var ea = mr;
var aa = ['"Awaken, My Love!"', "(What's The Story) Morning Glory?", "- Tragedy +", "13 Reasons Why (Season 3)", "21st Century Breakdown", "30 De Febrero", "432 Hz Deep Healing", "5-Star", "528 Hz Meditation Music", "54+1", "8 Mile", "808s & Heartbreak", "9 To 5 And Odd Jobs", "A Beautiful Lie", "A Day At The Races", "A Day Without Rain", "A Fever You Can't Sweat Out", "A Gangsta's Pain", "A Gift & A Curse", "A Hard Day's Night", "A Head Full Of Dreams", "A Kind Of Magic", "A Million Ways To Murder", "A Moment Apart", "A Song For Every Moon", "A Thousand Suns", "A Winter Romance", "ABBA", "AI YoungBoy", "AJ Tracey", "Act One", "After Hours", "Agent Provocateur", "All About You", "All I Know So Far: Setlist", "All Or Nothing", "All Out", "All Over The Place", "All Stand Together", "All The Lost Souls", "All The Things I Never Said", "All Things Must Pass", "Alleen", "Alright, Still", "Alta Suciedad", "America", "American Heartbreak", "American Teen", "And Justice For None", "Animal Songs", "Another Friday Night", "Anything Goes", "Ao Vivo Em S\xE3o Paulo", "Ao Vivo No Ibirapuera", "Apricot Princess", "Aqui E Agora (Ao Vivo)", "Arcane League Of Legends", "Ardipithecus", "Aretha Now", "Around The Fur", "Arrival", "Artist 2.0", "As She Pleases", "Ascend", "Ashlyn", "Astro Lounge", "At Night, Alone.", "At. Long. Last. ASAP", "Atlas", "Audioslave", "Aura", "Austin", "Awake", "Away From The Sun", "Ayayay!", "Baby On Baby", "Back For Everything", "Back From The Edge", "Back In Black", "Back To Black", "Back To The Game", "Bad", "Bah\xEDa Ducati", "Baila", "Barbie The Album", "Battleground", "Bayou Country", "Bcos U Will Never B Free", "Be", "Be Here Now", "Beautiful Mind", "Beautiful Thugger Girls", "Beautiful Trauma", "Beauty And The Beast", "Beggars Banquet", "Being Funny In A Foreign Language", "Berlin Lebt", "Berry Is On Top", "Best White Noise For Baby Sleep - Loopable With No Fade", "Big Baby DRAM", "Bigger, Better, Faster, More!", "Billy Talent II", "Black Star Elephant", "Blackout", "Blank Face LP", "Bleach", "Blizzard Of Ozz", "Blonde", "Blood Sugar Sex Magik", "Bloom", "Blowin' Your Mind!", "Blu Celeste", "Blue", "Blue Banisters", "Blue Hawaii", "Blue Neighbourhood", "Bluebird Days", "Bobby Tarantino", "Bobby Tarantino II", "Bon Iver", "Born Pink", "Born To Run", "Brand New Eyes", "Break The Cycle", "Breakfast In America", "Breakthrough", "Brett Young", "Bridge Over Troubled Water", "Bright: The Album", "Brol", "Buds", "Buena Vista Social Club", "Built On Glass", "Bury Me At Makeout Creek", "Busyhead", "By The Way", "CB6", "CNCO", "California Sunrise", "Californication", "Call Me Irresponsible", "Calm", "Camino Palmero", "Camp", "Caracal", "Carbon Fiber Hits", "Carnival", "Carry On", "Cartel De Santa", "Certified Lover Boy", "Chaaama", "Chama Meu Nome", "Chapter 1: Snake Oil", "Chapter 2: Swamp Savant", "Chapter One", "Charlie's Angels", "Cherry Bomb", "Chief", "Chocolate Factory", "Chosen", "Chris Brown", "Christina Aguilera", "Chromatica", "Church", "City Of Evil", "Clandestino", "Clouds", "Coco", "Collision Course", "Colour Vision", "Combat Rock", "Come Around Sundown", "Come Away With Me", "Come Home The Kids Miss You", "Come What(ever) May", "Commando", "Common Sense", "Communion", "Conditions", "Confident", "Confrontation", "Control The Streets, Volume 2", "Corinne Bailey Rae", "Costello Music", "Cottonwood", "Covers, Vol. 2", "Cozy Tapes Vol. 2: Too Cozy", "Crash Talk", "Crazy Love", "Crazysexycool", "Crowded House", "Cruisin' With Junior H", "Culture", "Current Mood", "DS2", "Dale", "Danger Days: The True Lives Of The Fabulous Killjoys", "Dangerous Woman", "Dangerous: The Double Album", "Dark Horse", "Day69", "Daydream", "De Fiesta", "De Viaje", "DeAnn", "Death Race For Love", "Delirium", "Delta", "Demidevil", "Depression Cherry", "Descendants", "Desgenerados Mixtape", "Destin", "Destiny Fulfilled", "Desvelado", "Detroit 2", "Dex Meets Dexter", "Dharma", "Die A Legend", "Different World", "Dig Your Roots", "Digital Druglord", "Dirt", "Disclaimer I / II", "Discovery", "Disraeli Gears", "Disumano", "Dizzy Up The Girl", "Don't Play That Song", "Donda", "Donde Quiero Estar", "Doo-Wops & Hooligans", "Down The Way", "Dr. Feelgood", "Dream Your Life Away", "Dreaming Out Loud", "Drip Harder", "Drive", "Drones", "Dropped Outta College", "Drowning", "Dua Warna Cinta", "Dulce Beat", "Dusty In Memphis", "Dutty Rock", "Dying To Live", "ENR", "East Atlanta Love Letter", "Editorial", "Edna", "El Abayarde", "El Amor En Los Tiempos Del Perreo", "El Camino", "El Comienzo", "El Dorado", "El Karma", "El Mal Querer", "El Malo", "El Trabajo Es La Suerte", "El Viaje De Copperpot", "Electric Ladyland", "Emotion", "En Tus Planes", "Endless Summer Vacation", "Enter The Wu-Tang (36 Chambers)", "Equals (=)", "Estrella", "Euphoria", "Europop", "Evermore", "Every Kingdom", "Everyday Life", "Evolve", "Expectations", "Face Yourself", "Facelift", "Fallin'", "Fancy You", "Fantas\xEDa", "Favourite Worst Nightmare", "Fear Of The Dark", "Fearless", "Feel Something", "Feels Like Home", "Femme Fatale", "Ferxxocalipsis", "Fifty Shades Darker", "Fifty Shades Freed", "Fifty Shades Of Grey", "Final (Vol.1)", "Finding Beauty In Negative Spaces", "Fine Line", "First Impressions Of Earth", "First Steps", "Five Seconds Flat", "Folklore", "For Emma, Forever Ago", "Forajido EP 1", "Forever", "Forever Young", "Formula Of Love: O+T=<3", "Free 6lack", "Freudian", "Frozen II", "Full Moon Fever", "Funhouse", "Funk Wav Bounces Vol.1", "Future History", "FutureSex/LoveSounds", "Fuzzybrain", "Gallery", "Gangsta's Paradise", "Gemini", "Gemini Rights", "Generationwhy", "Get A Grip", "Get Up", "Gettin' Old", "Girl", "Gladiator", "Glisten", "Globalization", "Gloria", "Glory Days", "God's Project", "Gold Skies", "Golden", "Good Evening", "Good Thing", "Goodbye Yellow Brick Road", "Gossip Columns", "Got Your Six", "Graceland", "Graduation", "Grand Champ", "Grandson, Vol. 1", "Green River", "Guerra", "Ha*Ash Primera Fila - Hecho Realidad", "Haiz", "Hamilton", "Happy Endings", "Harry Styles", "Hasta La Ra\xEDz", "Hatful Of Hollow", "Head In The Clouds", "Heard It In A Past Life", "Heart Shaped World", "Heartbeat City", "Heartbreak On A Full Moon / Cuffing Season - 12 Days Of Christmas", "Heaven Or Hell", "Heaven knows", "Hellbilly Deluxe", "Hellboy", "Help!", "Her Loss", "Here Comes The Cowboy", "Hey World", "High School Musical", "High Tide In The Snake's Nest", "Historias De Un Capricornio", "Hndrxx", "Hombres G (Devu\xE9lveme A Mi Chica)", "Homerun", "Homework", "Hot Fuss", "Hot Pink", "Hot Sauce / Hello Future", "Hot Space", "Hotel Diablo", "Houses Of The Holy", "How Big, How Blue, How Beautiful", "How I'm Feeling", "How To Be Human", "How To Save A Life", "How To: Friend, Love, Freefall", "Hozier", "Human", "Huncho Jack, Jack Huncho", "Hunter Hayes", "Hysteria", "I Am...Sasha Fierce", "I Can't Handle Change", "I Met You When I Was 18. (The Playlist)", "I Never Liked You", "I Never Loved A Man The Way I Love You", "I See You", "I Think You Think Too Much Of Me", "I Used To Know Her", "I Used To Think I Could Fly", "I'm Comin' Over", "Ich & Keine Maske", "If You Can Believe Your Eyes & Ears", "Il Ballo Della Vita", "Ill Communication", "Imagination & The Misfit Kid", "Imagine", "Immortalized", "In A Perfect World...", "In Colour", "In My Own Words", "In Rainbows", "In Return", "In The Lonely Hour", "Infest", "Innuendo", "Inter Shibuya - La Mafia", "Interstellar", "Is This It", "It Was Written", "It's Not Me, It's You", "It's Only Me", "Ivory", "JackBoys", "Jamie", "Jazz", "Jibrail & Iblis", "Jordi", "Jordin Sparks", "Jose", "Just As I Am", "Just Cause Y'all Waited 2", "Just Like You", "Justified", "K-12 / After School", "K.I.D.S.", "K.O.", "K.O.B. Live", "KG0516", "KOD", "Kane Brown", "Kid A", "Kid Krow", "Kids See Ghosts", "Kids in Love", "Kinks (You Really Got Me)", "Know-It-All", "Konvicted", "Kring", "LANY", "LM5", "La Criatura", "La Flaca", "La Melodia De La Calle", "La Revolucion", "Lady Lady", "Lady Wood", "Langit Mong Bughaw", "Las Que No Iban A Salir", "Last Day Of Summer", "Last Year Was Complicated", "Layers", "Layover", "Lazarus", "Led Zeppelin", "Left Of The Middle", "Leftoverture", "Legends Never Die", "Let's Skip To The Wedding", "Let's Talk About Love", "Licensed To Ill", "Life In Cartoon Motion", "Life Thru A Lens", "Lifelines", "Like..?", "Lil Big Pac", "Lil Boat", "Lil Boat 2", "Lil Boat 3.5", "Lil Kiwi", "Lil Pump", "Limon Y Sal", "Listen Without Prejudice", "Little Voice", "Live On Red Barn Radio I & II", "Lo Que And\xE1bamos Buscando", "Lofi Fruits Music 2021", "London Calling", "Los Campeones Del Pueblo", "Los Extraterrestres", "Los Favoritos 2", "Lost", "Lost In Love", "Loud", "Love Sick", "Love Story", "Love Stuff", "Love Yourself: Tear", "Lover", "Luca Brasi 2: Gangsta Grillz", "Lust For Life", "Luv Is Rage", "M!ssundaztood", "Ma Fleur", "Made In Lagos", "Mafia Bidness", "Magazines Or Novels", "Mainstream Sellout", "Majestic", "Make It Big", "Make Yourself", "Making Mirrors", "Mamma Mia! Here We Go Again", "Man Of The Woods", "Manic", "Me And My Gang", "Meduza", "Meet The Orphans", "Meet The Woo", "Melim", "Mellon Collie And The Infinite Sadness", "Melly vs. Melvin", "Memories...Do Not Open", "Menagerie", "Midnights", "Minecraft - Volume Alpha", "Minutes To Midnight", "Mix Pa Llorar En Tu Cuarto", "Modo Avi\xF3n", "Monkey Business", "Mono.", "Montana", "Montevallo", "Moosetape", "Morning View", "Motivan2", "Moving Pictures", "Mr. Davis", "Mr. Misunderstood", "Mulan", "Mura Masa", "Music From The Edge Of Heaven", "Music Of The Sun", "My House", "My Kinda Party", "My Krazy Life", "My Liver Will Handle What My Heart Can't", "My Moment", "My Own Lane", "My Turn", "My Worlds", "Na Praia (Ao Vivo)", "Nakamura", "Nation Of Two", "Navegando", "Need You Now", "Neon Future III", "Neotheater", "Never Trust A Happy Song", "New English", "News Of The World", "Nicole", "Night & Day", "Nimmerland", "Nimrod", "Nine Track Mind", "No Angel", "No Me Pidas Perd\xF3n", "No More Drama", "No Protection", "No Strings Attached", "No Time To Die", "Nobody Is Listening", "Non Stop Erotic Cabaret", "Non-Fiction", "Northsbest", "Nostalgia", "Nostalgia, Ultra", "Notes On A Conditional Form", "Now Or Never", "O Embaixador (Ao Vivo)", "O My Heart", "OK Computer", "Ocean", "Ocean Avenue", "Ocean Eyes", "Odisea", "Oh My My", "Oh, What A Life", "On The 6", "One In A Million", "One More Light", "One Of These Nights", "Open Up And Say...Ahh!", "Ordinary Man", "Origins", "Out Of The Blue", "Over It", "OzuTochi", "PTSD", "Pa Las Baby's Y Belikeada", "Pa Que Hablen", "Pa' Luego Es Tarde", "Pa' Otro La 'O", "Pablo Honey", "Pain Is Love", "Pain Is Temporary", "Painting Pictures", "Palmen Aus Plastik 2", "Para Mi Ex", "Para Siempre", "Partners In Crime", "Pawn Shop", "Pegasus / Neon Shark VS Pegasus", "Pet Sounds", "Piece By Piece", "Pier Pressure", "Pineapple Sunrise", "Piseiro 2020 Ao Vivo", "Planet Pit", "Plans", "Play Deep", "Playa Saturno", "Por Primera Vez", "Por Vida", "Positions", "Post Human: Survival Horror", "Poster Girl", "Prazer, Eu Sou Ferrugem (Ao Vivo)", "Pretty Girls Like Trap Music", "Pretty. Odd.", "Prince Royce", "Prisma", "Prometo", "Providence", "Puberty 2", "Punisher", "Purgatory", "Purple Rain", "Que Bendici\xF3n", "Queen Of The Clouds", "Quiero Volver", "R&G (Rhythm & Gangsta): The Masterpiece", "Raise!", "Ransom 2", "Rapunzel", "Rare", "Re Mida", "Ready To Die", "Realer", "Rebelde", "Reclassified", "Recovery", "Recuerden Mi Estilo", "Reggatta De Blanc", "Regulate\u2026 G Funk Era", "Reik", "Reise, Reise", "Relapse", "Relaxing Piano Lullabies And Natural Sleep Aid For Baby Sleep Music", "Religiously. The Album.", "Replay", "Results May Vary", "Revenge", "Revolve", "Revolver", "Ricky Martin", "Rien 100 Rien", "Ripcord", "Rise And Fall, Rage And Grace", "Rise Of An Empire", "Robin Hood: Prince Of Thieves", "Rock N Roll Jesus", "Romance", "Romances", "Ronan", "Royal Blood", "Rumours", "Sad Boyz 4 Life II", "San Lucas", "Santana World", "Saturation III", "Sauce Boyz", "Savage Mode", "Saxobeats", "Scarlet", "Schwarzes Herz", "Seal The Deal & Let's Boogie", "Section.80", "Segundo Romance", "Sehnsucht", "Shake The Snow Globe", "Shang-Chi And The Legend Of The Ten Rings: The Album", "Sheer Heart Attack", "Shiesty Season", "Shock Value", "Shoot For The Stars, Aim For The Moon", "Signed Sealed And Delivered", "Signos", "Silent Alarm", "Simplemente Gracias", "Sin Bandera", "Sing Me A Lullaby, My Sweet Temptation", "Sinner", "Sirio", "Sit Still, Look Pretty", "Skin", "Slowhand", "Smash", "Smithereens", "Snow Cougar", "Social Cues", "Some Girls", "Song Hits From Holiday Inn", "Songs For Dads", "Songs For The Deaf", "Songs For You, Truths For Me", "Songs In The Key Of Life", "Souled Out", "Sounds Of Silence", "Soy Como Quiero Ser", "Speak Now", "Speak Your Mind", "Speakerboxxx/The Love Below", "Spider-Man: Into The Spider-Verse", "Split Decision", "Square Up", "SremmLife", "Starboy", "Stay +", "Stay Dangerous", "Staying At Tamara's", "Steppenwolf", "Stick Season", "Still Bill", "Straight Outta Compton", "Strange Trails", "Stronger", "Suavemente", "Sublime", "Suck It and See", "Sucker", "Sue\xF1os", "Sugar", "Summer Forever", "Summer,", "Sunset Season", "Sunshine On Leith", "Surfer Rosa", "Sweet Talker", "SweetSexySavage", "System Of A Down", "TA13OO", "Talk That Talk", "Talking Heads: 77", "Tangled Up", "Tango In The Night", "Taxi Driver", "Taylor Swift", "Tell Me It's Real", "Ten", "Ten Summoner's Tales", "Terra Sem Cep (Ao Vivo)", "Terral", "Testing", "Tha Carter III", "Thank Me Later", "That's Christmas To Me", "The Academy", "The Adventures Of Bobby Ray", "The Album", "The Andy Williams Christmas Album", "The Aviary", "The Balcony", "The Battle Of Los Angeles", "The Beatles (White Album)", "The Beginning", "The Better Life", "The Big Day", "The Book", "The Breakfast Club", "The Cars", "The Colour And The Shape", "The Death Of Peace Of Mind", "The Diary Of Alicia Keys", "The Documentary", "The Emancipation Of Mimi", "The Eminem Show", "The End Of Everything", "The Final Countdown", "The Forever Story", "The Foundation", "The Goat", "The Golden Child", "The Good Parts", "The Greatest Showman: Reimagined", "The Green Trip", "The Hardest Love", "The Head And The Heart", "The Human Condition", "The Infamous", "The Lady Killer", "The Last Don II", "The Lion King", "The Lockdown Sessions", "The London Sessions", "The Lord Of The Rings: The Fellowship Of The Ring", "The Lost Boy", "The Magic Of Christmas / The Christmas Song", "The Marshall Mathers LP", "The Martin Garrix Collection", "The Melodic Blue", "The Mockingbird & The Crow", "The Pains Of Growing", "The Papercut Chronicles", "The Perfect Luv Tape", "The Pinkprint", "The Predator", "The Queen Is Dead", "The ReVe Festival: Finale", "The Rise And Fall Of Ziggy Stardust And The Spiders From Mars", "The Rising Tied", "The River", "The Stone Roses", "The Story Of Us", "The Stranger", "The Sufferer & The Witness", "The Sun's Tirade", "The Temptations Sing Smokey", "The Time Of Our Lives", "The Way It Is", "The Wonderful World Of Sam Cooke", "The Writing's On The Wall", "The Young And The Hopeless", "Therapy", "Therapy Session", "There Is More (Live)", "There Is Nothing Left To Lose", "These Things Happen", "Third Eye Blind", "This Is Me...Then", "This Unruly Mess I've Made", "Threat to Survival", "Thrill Of The Chase", "Time", "Timelezz", "To Let A Good Thing Die", "To Pimp A Butterfly", "Toast To Our Differences", "Todos Os Cantos, Vol. 1 (Ao Vivo)", "Too Hard", "Torches X", "Total Xanarchy", "Toto IV", "Toulouse Street", "Tourist History", "Toxicity", "Tragic Kingdom", "Tranquility Base Hotel & Casino", "Traumazine", "Traveler", "Tres Hombres", "Trip At Knight", "Tron: Legacy", "True Blue", "True Colors", "Trustfall", "Tu Veneno Mortal", "Tudo Em Paz", "Ubuntu", "Ugly Is Beautiful", "Ultra 2021", "Una Mattina", "Unbroken", "Uncovered", "Under Pressure", "Unsponsored Content", "Unstoppable", "Unwritten", "Urban Flora", "Urban Hymns", "Use Your Illusion I", "Veneer", "Versions Of Me", "Vibes", "Vice Versa", "Vices & Virtues", "Victory", "Vida", "Viejo Marihuano", "Visual\xEDzate", "Walk Away", "Walk Me Home...", "Watch The Throne", "Wave", "We Broke The Rules", "We Love You Tecca", "We Love You Tecca 2", "Weezer (Green Album)", "Welcome To The Madhouse", "Westlife", "What A Time To Be Alive", "What Do You Think About The Car?", "What Is Love?", "What Makes You Country", "What Separates Me From You", "What You See Is What You Get / What You See Ain't Always What You Get", "When It's Dark Out", "When We All Fall Asleep, Where Do We Go?", "Where The Light Is", "While The World Was Burning", "White Pony", "Whitney", "Who Really Cares", "Who You Are", "Who's Next", "Wide Open", "Wilder Mind", "Wildfire", "Willy And The Poor Boys", "Wings / You Never Walk Alone", "Wish", "Wish You Were Here", "Without Warning", "Wonder", "X&Y", "XOXO", "Y Que Quede Claro", "YBN: The Mixtape", "Yo Creo", "You Will Regret", "Youngblood", "Younger Now", "Youth"];
var ra = ["$NOT", "$uicideboy$", "(G)I-DLE", "*NSYNC", "2 Chainz", "21 Savage", "6LACK", "? & The Mysterians", "A Boogie Wit da Hoodie", "A Taste of Honey", "A Tribe Called Quest", "A-Ha", "ABBA", "AC/DC", "AJ Tracey", "ATEEZ", "Ace of Base", "Adele", "Ado", "Aerosmith", "Agust D", "Aitana", "Al Dexter & his Troopers", "Al Green", "Al Jolson", "Al Martino", "Alan Jackson", "Alannah Myles", "Alec Benjamin", "Alejandro Sanz", "Alesso", "Alfredo Olivas", "Ali Gatie", "Alice In Chains", "Alina Baraz", "All Time Low", "All-4-One", "All-American Rejects", "Alok", "America", "American Quartet", "Amii Stewart", "Amitabh Bhattacharya", "Ana Castela", "Anderson .Paak", "Andy Grammer", "Angus & Julia Stone", "Anirudh Ravichander", "Anita Ward", "Anitta", "Anton Karas", "Anuel AA", "Arcade Fire", "Archie Bell & The Drells", "Archies", "Aretha Franklin", "Arizona Zervas", "Armin van Buuren", "Arthur Conley", "Artie Shaw", "Asake", "Asees Kaur", "Association", "Atif Aslam", "Audioslave", "Aventura", "Avril Lavigne", "Aya Nakamura", "B J Thomas", "B.o.B", "BLACKPINK", "BONES", "BROCKHAMPTON", "BTS", "Baby Keem", "Bachman-Turner Overdrive", "Backstreet Boys", "Bad Bunny", "Badshah", "Bailey Zimmerman", "Banda El Recodo", "Barbra Streisand", "Barry White", "Bazzi", "Bebe Rexha", "Becky G", "Becky Hill", "Bee Gees", "Ben Bernie", "Ben Howard", "Ben Selvin", "Berlin", "Bessie Smith", "Bethel Music", "Bette Midler", "Beyonce", "Bibi Blocksberg", "Bibi und Tina", "BigXthaPlug", "Bill Doggett", "Bill Haley & his Comets", "Bill Withers", "Billy Davis Jr", "Billy Joel", "Billy Paul", "Billy Preston", "Billy Swan", "Birdy", "Bizarrap", "Blake Shelton", "Blur", "Bob Marley & The Wailers", "Bob Seger", "Bobby Darin", "Bobby Lewis", "Bobby McFerrin", "Bobby Vinton", "Boney M.", "Bonez MC", "Bonnie Tyler", "Booba", "Boston", "BoyWithUke", "Boyce Avenue", "Bradley Cooper", "Bread", "Brent Faiyaz", "Brett Young", "Bring Me The Horizon", "Britney Spears", "Brooks & Dunn", "Bruce Channel", "Bruno & Marrone", "Bryan Adams", "Bryce Vine", "Buddy Holly", "Burna Boy", "C. Tangana", "CKay", "CRO", "Camilo", "Capital Bra", "Captain & Tennille", "Cardi B", "Carin Leon", "Carlos Vives", "Carly Simon", "Carpenters", "Cavetown", "Celine Dion", "Central Cee", "Chaka Khan", "Champs", "Charlie Rich", "Chayanne", "Cheat Codes", "Cher", "Chic", "Chicago", "Chris Brown", "Chris Isaak", "Chris Young", "Christina Aguilera", "Christina Perri", "Christopher Cross", "Chuck Berry", "Ciara", "Cigarettes After Sex", "Cliff Edwards (Ukelele Ike)", "Cody Johnson", "Colbie Caillat", "Colby O'Donis", "Cole Swindell", "Coleman Hawkins", "Contours", "Coolio", "Count Basie", "Cris Mj", "Culture Club", "Cyndi Lauper", "D-Block Europe", "DAY6", "DJ Khaled", "DJ Luian", "DJ Nelson", "DMX", "DNCE", "DaVido", "Dadju", "Daft Punk", "Dan + Shay", "Daniel Powter", "Danny Ocean", "Darius Rucker", "Dave", "David Bowie", "David Guetta", "Daya", "Dean Martin", "Deee-Lite", "Deep Purple", "Deftones", "Demi Lovato", "Dennis Lloyd", "Denzel Curry", "Dermot Kennedy", "Desiigner", "Devo", "Dewa 19", "Dexys Midnight Runners", "Diddy", "Dido", "Die drei !!!", "Diego & Victor Hugo", "Diljit Dosanjh", "Dimitri Vegas & Like Mike", "Dinah Shore", "Dionne Warwick", "Dire Straits", "Disclosure", "Dixie Cups", "Doja Cat", "Dolly Parton", "Don Diablo", "Don Henley", "Don McLean", "Don Omar", "Donna Summer", "Donovan", "Dr. Dre", "Drake", "Dreamville", "Dua Lipa", "EMF", "ENHYPEN", "Earth, Wind & Fire", "Ed Sheeran", "Eddie Cantor", "Eddie Cochran", "Eddy Howard", "Edgar Winter Group", "Edwin Hawkins Singers", "Edwin Starr", "El Alfa", "Eladio Carrion", "Electric Light Orchestra", "Elevation Worship", "Ella Henderson", "Ellie Goulding", "Elton John", "Elvis Presley", "Empire of the Sun", "En Vogue", "Enrique Iglesias", "Eslabon Armado", "Ethel Waters", "Etta James", "Evanescence", "Exile", "Extreme", "Faith Hill", "Fall Out Boy", "Fanny Brice", "Farruko", "Fats Domino", "Fats Waller", "Feid", "Felix Jaehn", "Fergie", "Fetty Wap", "Fiersa Besari", "Fifth Harmony", "Fine Young Cannibals", "Five Finger Death Punch", "Fleetwood Mac", "Flo-Rida", "Florence + The Machine", "Flume", "Foo Fighters", "Foreigner", "Foster The People", "Four Aces", "Frank Ocean", "Frank Sinatra", "Frankie Avalon", "Frankie Valli", "Fred Astaire", "Freda Payne", "Freddie Dredd", "Freddy Fender", "French Montana", "Fuerza Regida", "Fujii Kaze", "Future", "G-Eazy", "Garfunkel and Oates", "Gary Lewis & The Playboys", "Gary Numan", "Gene Autry", "Gene Chandler", "Gene Vincent", "George Michael", "George Strait", "Gera MX", "Ghost", "Ghostemane", "Gigi D'Agostino", "Gladys Knight & The Pips", "Glass Animals", "Glee Cast", "Gloria Gaynor", "Godsmack", "Gorillaz", "Gotye", "Grand Funk Railroad", "Green Day", "Grouplove", "Grupo Firme", "Grupo Marca Registrada", "Gryffin", "Gucci Mane", "Guess Who", "Gunna", "Gusttavo Lima", "Guy Mitchell", "Gwen Stefani", "Gzuz", "H.E.R.", "HARDY", "Hailee Steinfeld", "Halsey", "Hans Zimmer", "Harris Jayaraj", "Harry Chapin", "Harry James", "Harry Nilsson", "Harry Styles", "Hayley Williams", "Herb Alpert", "Herman's Hermits", "Hillsong UNITED", "Hillsong Worship", "Hollywood Undead", "Honey Cone", "Hoobastank", "Hues Corporation", "I Prevail", "ITZY", "IVE", "Ice Cube", "Ice Spice", "Iggy Azalea", "Imagine Dragons", "Incubus", "Internet Money", "Isaac Hayes", "J Geils Band", "J. Cole", "JAY-Z", "JJ Lin", "JP Saxe", "JVKE", "Jack Harlow", "Jack Johnson", "Jackie Wilson", "Jacquees", "James Arthur", "James Brown", "James TW", "James Taylor", "Jamie Foxx", "Janet Jackson", "Janis Joplin", "Jason Aldean", "Jason Mraz", "Jay Chou", "Jay Sean", "Jay Wheeler", "Jaymes Young", "Jean Knight", "Jeezy", "Jennifer Lopez", "Jennifer Warnes", "Jeremih", "Jeremy Zucker", "Jerry Lee Lewis", "Jerry Murad's Harmonicats", "Jess Glynne", "Jessie J", "Jewel", "Jimi Hendrix", "Jimin", "Jimmie Rodgers", "Jimmy Dean", "Jo Stafford", "Joan Jett & The Blackhearts", "Joao Gilberto", "Joel Corry", "John Fred & The Playboy Band", "John Legend", "John Mayer", "John Williams", "Johnnie Ray", "Johnnie Taylor", "Johnny Cash", "Johnny Horton", "Johnny Mathis", "Johnny Mercer", "Johnny Nash", "Joji", "Jon Bellion", "Jonas Blue", "Jonas Brothers", "Joni James", "Jorja Smith", "Juan Gabriel", "Juan Luis Guerra 4.40", "Juanes", "Juice Newton", "Julia Michaels", "Justin Bieber", "Justin Quiles", "KALEO", "KAROL G", "KAYTRANADA", "KK", "KSI", "KYLE", "Kacey Musgraves", "Kane Brown", "Kanye West", "Karan Aujla", "Kate Smith", "Katy Perry", "Kay Kyser", "Ke$ha", "Kehlani", "Kelly Clarkson", "Kenny Chesney", "Kenny Loggins", "Kenny Rogers", "Kenshi Yonezu", "Kenya Grace", "Kevin Gates", "Key Glock", "Khalid", "Kim Carnes", "Kim Petras", "Kimbra", "Kina", "King Gnu", "Kings of Leon", "Kingsmen", "Kitty Kallen", "Kodak Black", "Kodaline", "Kollegah", "Kool & The Gang", "Kungs", "Kygo", "Kylie Minogue", "LE SSERAFIM", "LISA", "LMFAO", "LUDMILLA", "La Adictiva Banda San Jos\xE9 de Mesillas", "La Oreja de Van Gogh", "Labrinth", "Lady Antebellum", "Lady GaGa", "Lainey Wilson", "Lana Del Rey", "Latto", "Lauryn Hill", "Lauv", "League of Legends", "Lee Brice", "Leon Bridges", "Leona Lewis", "Lesley Gore", "Leslie Odom Jr.", "Liam Payne", "Lifehouse", "Lil Baby", "Lil Dicky", "Lil Durk", "Lil Mosey", "Lil Nas X", "Lil Pump", "Lil Skies", "Lil Tjay", "Lil Uzi Vert", "Lil Yachty", "Lil' Kim", "Lil' Wayne", "Lin-Manuel Miranda", "Linkin Park", "Lionel Richie", "Lipps Inc", "Lisa Loeb", "Little Peggy March", "Little Richard", "Lofi Fruits Music", "Lord Huron", "Los Del Rio", "Los Dos Carnales", "Los Lobos", "Los Temerarios", "Los Tigres Del Norte", "Los Tucanes De Tijuana", "Lou Reed", "Loud Luxury", "Louis Jordan", "Louis Tomlinson", "Love Unlimited", "Lovin' Spoonful", "Luan Santana", "Luciano", "Luis Miguel", "Luis R Conriquez", "Lulu", "Lunay", "Lupe Fiasco", "M", "MAX", "MC Hammer", "MC Ryan SP", "MKTO", "Mabel", "Machine Gun Kelly", "Madison Beer", "Madonna", "Mahalini", "Major Lazer", "Mambo Kingz", "Maneskin", "Marco Antonio Sol\xEDs", "Margaret Whiting", "Maria Becerra", "Mario", "Mario Lanza", "Mark Ronson", "Maroon 5", "Marshmello", "Martin Garrix", "Mary Ford", "Mary J Blige", "Mary J. Blige", "Mary Wells", "Matoma", "Mau y Ricky", "Meek Mill", "Megadeth", "Melanie", "Melanie Martinez", "Melendi", "Men At Work", "Metro Boomin", "Michael Bubl\xE9", "Michael Jackson", "Michael McDonald", "Michael Sembello", "Miguel", "Mike Posner", "Miley Cyrus", "Milky Chance", "Minnie Riperton", "Miracle Tones", "Miranda Lambert", "Mohit Chauhan", "Mon Laferte", "Moneybagg Yo", "Monsta X", "Mora", "Morad", "Morat", "Mother Mother", "Motley Crue", "Ms. Lauryn Hill", "Mumford & Sons", "Muse", "Mya", "Myke Towers", "NCT 127", "NCT DREAM", "NEFFEX", "Nadin Amizah", "Nancy Sinatra", "Nat King Cole", "Nate Smith", "Natti Natasha", "Nayer", "Neil Diamond", "Neil Sedaka", "Nekfeu", "Nelly", "New Vaudeville Band", "Next", "Nickelback", "Nicki Minaj", "Nicki Nicole", "Nicky Jam", "Nina Simone", "Ninho", "Nipsey Hussle", "Nirvana", "Niska", "No Doubt", "Norah Jones", "Normani", "OMI", "ONE OK ROCK", "Oasis", "Official HIGE DANdism", "Offset", "Old Dominion", "Oliver Heldens", "Olivia Rodrigo", "Omah Lay", "One Direction", "Otis Redding", "OutKast", "Owl City", "P Diddy", "P!nk", "PLK", "PNL", "Pamungkas", "Passenger", "Pat Boone", "Patsy Cline", "Patti LaBelle", "Patti Page", "Paul & Paula", "Paul Revere & the Raiders", "Paul Robeson", "Paul Russell", "Paul Whiteman", "Paula Abdul", "Peaches & Herb", "Pearl Jam", "Pee Wee Hunt", "Pee Wee King", "Pentatonix", "Percy Faith", "Percy Sledge", "Peso Pluma", "Peter Cetera", "Peter Gabriel", "Peter, Paul & Mary", "Pharrell Williams", "Pierce The Veil", "Pineapple StormTv", "Pink Floyd", "Pink Sweat$", "Piso 21", "Pitbull", "Plan B", "Player", "Polo G", "Pop Smoke", "Portugal. The Man", "Pouya", "Prince", "Prince Royce", "Pusha T", "Quality Control", "Queen", "Quinn XCII", "R. Kelly", "RAF Camora", "RAYE", "REM", "REO Speedwagon", "Radiohead", "Rag'n'Bone Man", "Rage Against The Machine", "Rahat Fateh Ali Khan", "Rainbow Kitten Surprise", "Rammstein", "Rauw Alejandro", "Ray Charles", "Ray Parker Jr", "Ray Stevens", "Red Foley", "Red Hot Chili Peppers", "Red Velvet", "Regard", "Regina Belle", "Reik", "Rels B", "Rema", "Ricardo Arjona", "Rich The Kid", "Rick Astley", "Rick Dees & his Cast of Idiots", "Rick Ross", "Rick Springfield", "Ricky Martin", "Ricky Nelson", "Rihanna", "Rita Ora", "Ritchie Valens", "Rizky Febian", "Rob Thomas", "Roberta Flack", "Robin Schulz", "Robin Thicke", "Rod Stewart", "Rod Wave", "Roddy Ricch", "Roger Miller", "Romeo Santos", "Rosemary Clooney", "Roxette", "Roy Acuff", "Roy Orbison", "Rudimental", "Ruel", "Ruth B.", "Ryan Lewis", "SCH", "SEVENTEEN", "SWV", "Sabaton", "Sabrina Carpenter", "Sachet Tandon", "Sachin-Jigar", "Sade", "Sam Cooke", "Sam Feldt", "Sam Hunt", "Sam Smith", "Sam The Sham & The Pharaohs", "Sammy Davis Jr", "Sammy Kaye", "Santana", "Sasha Alex Sloan", "Savage Garden", "Saweetie", "Scorpions", "Sean Kingston", "Sean Paul", "Sebastian Yatra", "Sech", "Seeb", "Sezen Aksu", "Sfera Ebbasta", "Shaggy", "Shania Twain", "Shawn Mendes", "Sheena Easton", "Shinedown", "Shubh", "Sia", "Sid Sriram", "Sidhu Moose Wala", "Silk", "Silver Convention", "Simon & Garfunkel", "Sinead O'Connor", "Sir Mix-a-Lot", "Sister Sledge", "Ski Mask The Slump God", "Skillet", "Skrillex", "Sleeping At Last", "Smokey Robinson", "Snoop Dogg", "Snow Patrol", "Soda Stereo", "Sonu Nigam", "Sophie Ellis-Bextor", "Spencer Davis Group", "Spice Girls", "Stan Getz", "Starland Vocal Band", "Stephen Sanchez", "Steve Aoki", "Steve Lacy", "Steve Winwood", "Stevie B", "Sting", "Stormzy", "Strawberry Alarm Clock", "Stray Kids", "Stromae", "Sublime", "Sum 41", "Summer Walker", "Supertramp", "Survivor", "Swedish House Mafia", "System Of A Down", "T-Pain", "T.I.", "TAEYEON", "TKKG", "TLC", "TOMORROW X TOGETHER", "TOTO", "TWICE", "Tag Team", "Tainy", "Tammi Terrell", "Tanishk Bagchi", "Tate McRae", "Taylor Swift", "Tears For Fears", "Tems", "Tennessee Ernie Ford", "Terence Trent D'Arby", "Teresa Brewer", "Terry Jacks", "The Ames Brothers", "The Animals", "The B52s", "The Bangles", "The Beatles", "The Black Eyed Peas", "The Black Keys", "The Box Tops", "The Chainsmokers", "The Chiffons", "The Chordettes", "The Clash", "The Coasters", "The Commodores", "The Cowsills", "The Cranberries", "The Crew-Cuts", "The Cure", "The Detroit Spinners", "The Diamonds", "The Doobie Brothers", "The Doors", "The Drifters", "The Emotions", "The Eurythmics", "The Fireballs", "The Flamingos", "The Foundations", "The Four Seasons", "The Fray", "The Game", "The Go Gos", "The Goo Goo Dolls", "The Head And The Heart", "The Hollies", "The Ink Spots", "The Isley Brothers", "The Jackson 5", "The Kid LAROI", "The Killers", "The Kingston Trio", "The Kooks", "The Lemon Pipers", "The Living Tombstone", "The Lumineers", "The Mamas & The Papas", "The Marvelettes", "The McCoys", "The Mills Brothers", "The Miracles", "The Monkees", "The Moody Blues", "The National", "The Neighbourhood", "The Notorious B.I.G.", "The O'Jays", "The Offspring", "The Osmonds", "The Partridge Family", "The Penguins", "The Pet Shop Boys", "The Platters", "The Righteous Brothers", "The Rolling Stones", "The Ronettes", "The Score", "The Script", "The Seekers", "The Shangri-Las", "The Smashing Pumpkins", "The Staple Singers", "The Strokes", "The Supremes", "The Temptations", "The Turtles", "The Vamps", "The Verve", "The Village People", "The Weavers", "The White Stripes", "The Young Rascals", "The Zombies", "Thelma Houston", "Thomas Rhett", "Three Days Grace", "Three Dog Night", "Three Man Down", "Timbaland", "Timmy Trumpet", "Toby Keith", "Tom Jones", "Tom Petty and the Heartbreakers", "Tommy Dorsey", "Tommy Edwards", "Tommy James & the Shondells", "Tone Loc", "Toni Braxton", "Topic", "Tory Lanez", "Tove Lo", "Trevor Daniel", "Trey Songz", "Trippie Redd", "Trueno", "Tulsi Kumar", "Tulus", "Twenty One Pilots", "Two Feet", "Ty Dolla $ign", "Tyga", "Tyler Hubbard", "U2", "UB40", "UZI", "Ufo361", "Upchurch", "V", "Vampire Weekend", "Van McCoy", "Van Morrison", "Vance Joy", "Vanessa Carlton", "Vanessa Williams", "Vera Lynn", "Vernon Dalhart", "Vicente Fernandez", "Vishal-Shekhar", "Volbeat", "WILLOW", "Wale", "Wallows", "Weezer", "Wham!", "Whitney Houston", "Why Don't We", "Wilbert Harrison", "Wilson Phillips", "Wiz Khalifa", "Woody Guthrie", "Wyclef Jean", "XXXTENTACION", "Xavi", "YG", "YNW Melly", "YOASOBI", "Yandel", "Years & Years", "Yeat", "Yo Gotti", "Young Dolph", "Young Miko", "Young Thug", "YoungBoy Never Broke Again", "Yung Gravy", "Yuuri", "Yuvan Shankar Raja", "ZAYN", "ZZ Top", "Zac Brown Band", "Zach Bryan", "Zara Larsson", "aespa", "benny blanco", "blink-182", "d4vd", "deadmau5", "girl in red", "gnash", "iann dior", "will.i.am"];
var oa = ["Acid House", "Acid Jazz", "Acid Rock", "Acoustic", "Acoustic Blues", "Afro-Pop", "Afrobeat", "Alt-Rock", "Alternative", "Ambient", "American Trad Rock", "Americana", "Anime", "Arena Rock", "Art-Rock", "Avant-Garde", "Avant-Punk", "Baladas y Boleros", "Barbershop", "Baroque", "Bebop", "Big Band", "Black Metal", "Blue Note", "Bluegrass", "Blues", "Boogaloo", "Bop", "Bossa Nova", "Bounce", "Brazilian Funk", "Breakbeat", "Britpop", "CCM", "Cajun", "Cantopop", "Celtic", "Celtic Folk", "Chamber Music", "Chant", "Chanukah", "Chicago Blues", "Chicago House", "Chicano", "Children\u2019s Music", "Chill", "Choral", "Christian", "Christmas", "Classical", "Club", "College Rock", "Conjunto", "Cool Jazz", "Country", "Crunk", "Dance", "Dancehall", "Death Metal", "Deep House", "Delta Blues", "Detroit Techno", "Dirty South", "Disco", "Disney", "Dixieland", "Doo-wop", "Downtempo", "Dream Pop", "Drill", "Drinking Songs", "Drone", "Drum'n'bass", "Dub", "Dubstep", "EDM", "Early Music", "East Coast Rap", "Easter", "Easy Listening", "Eclectic", "Electric Blues", "Electro", "Electronic", "Electronica", "Emo", "Enka", "Environmental", "Ethio-jazz", "Experimental", "Experimental Rock", "Flamenco", "Folk", "Folk-Rock", "Forro", "French Pop", "Funk", "Fusion", "Gangsta Rap", "Garage", "German Folk", "German Pop", "Glam Rock", "Gospel", "Goth", "Grime", "Grindcore", "Groove", "Grunge", "Hair Metal", "Halloween", "Happy", "Hard Bop", "Hard Dance", "Hard Rock", "Hardcore", "Hardcore Punk", "Hardcore Rap", "Hardstyle", "Healing", "Heavy Metal", "High Classical", "Hip Hop", "Holiday", "Honky Tonk", "House", "IDM", "Impressionist", "Indie", "Industrial", "Instrumental", "J-Dance", "J-Idol", "J-Pop", "J-Punk", "J-Rock", "J-Ska", "J-Synth", "Jackin House", "Jam Bands", "Japanese Pop", "Jazz", "Jungle", "K-Pop", "Karaoke", "Kayokyoku", "Kids", "Kitsch", "Klezmer", "Krautrock", "Latin", "Latin Jazz", "Latin Rap", "Local", "Lounge", "Lullabies", "MPB", "Mainstream Jazz", "Malay", "Mandopop", "March", "Mariachi", "Mawwal", "Medieval", "Meditation", "Metal", "Metalcore", "Minimal Techno", "Minimalism", "Modern", "Motown", "Mugham", "Musicals", "Musique Concr\xE8te", "Nature", "Neo-Soul", "Nerdcore", "New Acoustic", "New Age", "New Mex", "New Wave", "No Wave", "Noise", "Nordic", "Novelty", "OPM", "Oi!", "Old School Rap", "Opera", "Orchestral", "Original Score", "Outlaw Country", "Pagode", "Party", "Piano", "Polka", "Pop", "Pop Film", "Pop Latino", "Post Dubstep", "Power Pop", "Praise & Worship", "Progressive House", "Progressive Rock", "Proto-punk", "Psych Rock", "Psychedelic", "Punk", "Punk Rock", "Qawwali", "Quiet Storm", "R&B", "Ragtime", "Rainy Day", "Rap", "Reggae", "Reggaeton", "Regional Mexicano", "Relaxation", "Renaissance", "Retro", "Rock", "Rockabilly", "Rocksteady", "Romance", "Romantic", "Roots Reggae", "Roots Rock", "SKA", "Sad", "Salsa", "Samba", "Second Line", "Sertanejo", "Shaabi", "Shoegaze", "Sleep", "Smooth Jazz", "Soft Rock", "Soul", "Soundtrack", "Southern Gospel", "Southern Rock", "Space Rock", "Stage And Screen", "Steampunk", "Summer", "Surf", "Swamp Pop", "Swing", "Synth Pop", "Tango", "Techno", "Teen Pop", "Tejano", "Tex-Mex", "Thanksgiving", "Traditional", "Trance", "Trip Hop", "Tropical", "Underground Rap", "Urban", "Urban Cowboy", "West Coast Rap", "Western Swing", "World", "Worldbeat", "Zydeco"];
var na = ["(Everything I Do) I Do it For You", "(Ghost) Riders in the Sky", "(I Can't Get No) Satisfaction", "(I've Got a Gal In) Kalamazoo", "(I've Had) the Time of My Life", "(It's No) Sin", "(Just Like) Starting Over", "(Let Me Be Your) Teddy Bear", "(Put Another Nickel In) Music! Music! Music!", "(Sexual) Healing", "(Sittin' On) the Dock of the Bay", "(They Long to Be) Close to You", "(You Keep Me) Hangin' On", "(You're My) Soul & Inspiration", "(Your Love Keeps Lifting Me) Higher & Higher", "12th Street Rag", "1999", "19th Nervous Breakdown", "50 Ways to Leave Your Lover", "9 to 5", "96 Tears", "A Boy Named Sue", "A Hard Day's Night", "A String of Pearls", "A Thousand Miles", "A Tree in the Meadow", "A Whiter Shade of Pale", "A Whole New World (Aladdin's Theme)", "A Woman in Love", "A-Tisket A-Tasket", "ABC", "Abracadabra", "Ac-cent-tchu-ate the Positive", "Addicted to Love", "After You've Gone", "Afternoon Delight", "Again", "Against All Odds (Take a Look At Me Now)", "Ain't Misbehavin'", "Ain't No Mountain High Enough", "Ain't No Sunshine", "Ain't That a Shame", "Airplanes", "All Along the Watchtower", "All I Have to Do is Dream", "All I Wanna Do", "All My Lovin' (You're Never Gonna Get It)", "All Night Long (All Night)", "All Out of Love", "All Shook Up", "All You Need is Love", "Alone", "Alone Again (Naturally)", "Always On My Mind", "American Pie", "American Woman", "Angie", "Another Brick in the Wall (part 2)", "Another Day in Paradise", "Another Night", "Another One Bites the Dust", "Apologize", "April Showers", "Aquarius/Let The Sunshine In", "Are You Lonesome Tonight?", "Arthur's Theme (Best That You Can Do)", "As Time Goes By", "At Last", "At the Hop", "Auf Wiederseh'n Sweetheart", "Baby Baby", "Baby Come Back", "Baby Got Back", "Baby Love", "Baby One More Time", "Bad Day", "Bad Girls", "Bad Moon Rising", "Bad Romance", "Bad, Bad Leroy Brown", "Baker Street", "Ball of Confusion (That's What the World is Today)", "Ballad of the Green Berets", "Ballerina", "Band On the Run", "Band of Gold", "Battle of New Orleans", "Be Bop a Lula", "Be My Baby", "Be My Love", "Beat It", "Beautiful Day", "Beauty & the Beast", "Because I Love You (The Postman Song)", "Because You Loved Me", "Because of You", "Before The Next Teardrop Falls", "Begin the Beguine", "Behind Closed Doors", "Being With You", "Believe", "Ben", "Bennie & the Jets", "Besame Mucho", "Best of My Love", "Bette Davis Eyes", "Big Bad John", "Big Girls Don't Cry", "Billie Jean", "Bitter Sweet Symphony", "Black Or White", "Black Velvet", "Blaze of Glory", "Bleeding Love", "Blue Suede Shoes", "Blue Tango", "Blueberry Hill", "Blurred Lines", "Body & Soul", "Bohemian Rhapsody", "Boogie Oogie Oogie", "Boogie Woogie Bugle Boy", "Boom Boom Pow", "Born in the USA", "Born to Be Wild", "Born to Run", "Boulevard of Broken Dreams", "Brand New Key", "Brandy (You're A Fine Girl)", "Breaking Up is Hard to Do", "Breathe", "Bridge Over Troubled Water", "Brother Louie", "Brother, Can You Spare a Dime?", "Brown Eyed Girl", "Brown Sugar", "Build Me Up Buttercup", "Burn", "Buttons & Bows", "Bye Bye Love", "Bye Bye, Blackbird", "Bye, Bye, Bye", "Caldonia Boogie (What Makes Your Big Head So Hard)", "California Dreamin'", "California Girls", "Call Me", "Call Me Maybe", "Can You Feel the Love Tonight", "Can't Buy Me Love", "Can't Get Enough of Your Love, Babe", "Can't Help Falling in Love", "Candle in the Wind '97", "Candy Man", "Car Wash", "Careless Whisper", "Cars", "Cat's in the Cradle", "Cathy's Clown", "Celebration", "Centerfold", "Chain of Fools", "Chances Are", "Change the World", "Chapel of Love", "Chattanooga Choo Choo", "Chattanoogie Shoe-Shine Boy", "Check On It", "Cheek to Cheek", "Cherish", "Cherry Pink & Apple Blossom White", "Cold, Cold Heart", "Colors of the Wind", "Come On Eileen", "Come On-a My House", "Come Together", "Coming Up", "Cracklin' Rosie", "Crazy", "Crazy For You", "Crazy Little Thing Called Love", "Crazy in Love", "Creep", "Crimson & Clover", "Crocodile Rock", "Cry", "Cry Like a Baby", "Crying", "Da Doo Ron Ron (When He Walked Me Home)", "Dance to the Music", "Dancing Queen", "Dancing in the Dark", "Dancing in the Street", "Dardanella", "Daydream Believer", "December 1963 (Oh What a Night)", "Delicado", "Dilemma", "Disco Duck", "Disco Lady", "Disturbia", "Dizzy", "Do That to Me One More Time", "Do Wah Diddy Diddy", "Do Ya Think I'm Sexy?", "Do You Love Me?", "Don't Be Cruel", "Don't Fence Me In", "Don't Go Breaking My Heart", "Don't Leave Me This Way", "Don't Let the Stars Get in Your Eyes", "Don't Let the Sun Go Down On Me", "Don't Speak", "Don't Stop 'Til You Get Enough", "Don't Worry Be Happy", "Don't You (Forget About Me)", "Don't You Want Me", "Doo Wop (That Thing)", "Down", "Down Hearted Blues", "Down Under", "Downtown", "Dreamlover", "Dreams", "Drop it Like It's Hot", "Drops of Jupiter (Tell Me)", "Duke of Earl", "E.T.", "Earth Angel", "Ebony & Ivory", "Eight Days a Week", "Empire State Of Mind", "End of the Road", "Endless Love", "Escape (The Pina Colada Song)", "Eve of Destruction", "Every Breath You Take", "Every Little Thing She Does is Magic", "Everybody Loves Somebody", "Everybody Wants to Rule the World", "Everyday People", "Eye of the Tiger", "Faith", "Fallin'", "Fame", "Family Affair", "Fantasy", "Fast Car", "Feel Good Inc", "Feel Like Making Love", "Fire & Rain", "Firework", "Flashdance. What a Feeling", "Fly Robin Fly", "Foolish Games", "Footloose", "For What It's Worth (Stop, Hey What's That Sound)", "Fortunate Son", "Frankenstein", "Freak Me", "Freebird", "Frenesi", "Funkytown", "Gangsta's Paradise", "Georgia On My Mind", "Georgy Girl", "Get Back", "Get Down Tonight", "Get Off of My Cloud", "Ghostbusters", "Gimme Some Lovin'", "Girls Just Wanna Have Fun", "Give Me Everything", "Gives You Hell", "Glamorous", "Glory of Love", "Go Your Own Way", "God Bless America", "God Bless the Child", "Gold Digger", "Gonna Make You Sweat (Everybody Dance Now)", "Good Lovin'", "Good Times", "Good Vibrations", "Goodbye Yellow Brick Road", "Goodnight, Irene", "Got to Give it Up", "Grease", "Great Balls of Fire", "Greatest Love of All", "Green Onions", "Green River", "Green Tambourine", "Grenade", "Groove is in the Heart", "Groovin'", "Gypsies, Tramps & Thieves", "Hair", "Hang On Sloopy", "Hanging by a Moment", "Hanky Panky", "Happy Days Are Here Again", "Happy Together", "Harbour Lights", "Hard to Say I'm Sorry", "Harper Valley PTA", "Have You Ever Really Loved a Woman?", "He'll Have to Go", "He's So Fine", "He's a Rebel", "Heart of Glass", "Heart of Gold", "Heartbreak Hotel", "Hello Dolly", "Hello, I Love You, Won't You Tell Me Your Name?", "Help Me, Rhonda", "Help!", "Here Without You", "Here in My Heart", "Hero", "Hey Baby", "Hey Jude", "Hey Paula", "Hey There", "Hey There Delilah", "Hey Ya!", "Higher Love", "Hips don't lie", "Hit the Road, Jack", "Hold On", "Hollaback Girl", "Honey", "Honky Tonk", "Honky Tonk Woman", "Horse With No Name", "Hot Child In The City", "Hot Stuff", "Hotel California", "Hound Dog", "House of the Rising Sun", "How Deep is Your Love?", "How Do I Live?", "How Do You Mend a Broken Heart", "How High the Moon", "How Much is That Doggy in the Window?", "How Will I Know", "How You Remind Me", "How to Save a Life", "Hungry Heart", "Hurt So Good", "I Believe I Can Fly", "I Can Dream, Can't I?", "I Can Help", "I Can See Clearly Now", "I Can't Get Next to You", "I Can't Get Started", "I Can't Go For That (No Can Do)", "I Can't Help Myself (Sugar Pie, Honey Bunch)", "I Can't Stop Loving You", "I Don't Want to Miss a Thing", "I Fall to Pieces", "I Feel Fine", "I Feel For You", "I Feel Love", "I Get Around", "I Got You (I Feel Good)", "I Got You Babe", "I Gotta Feeling", "I Heard it Through the Grapevine", "I Honestly Love You", "I Just Called to Say I Love You", "I Just Wanna Be Your Everything", "I Kissed A Girl", "I Love Rock 'n' Roll", "I Need You Now", "I Only Have Eyes For You", "I Shot the Sheriff", "I Still Haven't Found What I'm Looking For", "I Swear", "I Think I Love You", "I Walk the Line", "I Wanna Dance With Somebody (Who Loves Me)", "I Wanna Love You", "I Want You Back", "I Want to Hold Your Hand", "I Want to Know What Love Is", "I Went to Your Wedding", "I Will Always Love You", "I Will Follow Him", "I Will Survive", "I Write the Songs", "I'll Be Missing You", "I'll Be There", "I'll Make Love to You", "I'll Never Smile Again", "I'll Take You There", "I'll Walk Alone", "I'll be seeing you", "I'm Looking Over a Four Leaf Clover", "I'm So Lonesome I Could Cry", "I'm Sorry", "I'm Walking Behind You", "I'm Your Boogie Man", "I'm Yours", "I'm a Believer", "I've Heard That Song Before", "If (They Made Me a King)", "If I Didn't Care", "If You Don't Know Me By Now", "If You Leave Me Now", "Imagine", "In Da Club", "In the End", "In the Ghetto", "In the Mood", "In the Summertime", "In the Year 2525 (Exordium & Terminus)", "Incense & Peppermints", "Indian Reservation (The Lament Of The Cherokee Reservation Indian)", "Instant Karma", "Iris", "Ironic", "Irreplaceable", "It Had to Be You", "It's All in the Game", "It's My Party", "It's Now Or Never", "It's Still Rock 'n' Roll to Me", "It's Too Late", "Jack & Diane", "Jailhouse Rock", "Jessie's Girl", "Jive Talkin'", "Johnny B Goode", "Joy to the World", "Judy in Disguise (With Glasses)", "Jump", "Jumpin' Jack Flash", "Just Dance", "Just My Imagination (Running Away With Me)", "Just the Way You Are", "Kansas City", "Karma Chameleon", "Keep On Loving You", "Killing Me Softly With His Song", "King of the Road", "Kiss", "Kiss & Say Goodbye", "Kiss From a Rose", "Kiss Me", "Kiss On My List", "Kiss You All Over", "Knock On Wood", "Knock Three Times", "Kokomo", "Kryptonite", "Kung Fu Fighting", "La Bamba", "Lady", "Lady Marmalade (Voulez-Vous Coucher Aver Moi Ce Soir?)", "Last Train to Clarksville", "Layla", "Le Freak", "Leader of the Pack", "Lean On Me", "Leaving, on a Jet Plane", "Let Me Call You Sweetheart", "Let Me Love You", "Let it Be", "Let it Snow! Let it Snow! Let it Snow!", "Let's Dance", "Let's Get it On", "Let's Groove", "Let's Hear it For the Boy", "Let's Stay Together", "Light My Fire", "Lights", "Like a Prayer", "Like a Rolling Stone", "Like a Virgin", "Little Darlin'", "Little Things Mean a Lot", "Live & Let Die", "Livin' La Vida Loca", "Livin' On a Prayer", "Living For the City", "Locked Out Of Heaven", "Lola", "Lonely Boy", "Long Cool Woman in a Black Dress", "Long Tall Sally", "Look Away", "Lookin' Out My Back Door", "Lose Yourself", "Losing My Religion", "Louie Louie", "Love Child", "Love Hangover", "Love In This Club", "Love Is Blue (L'Amour Est Bleu)", "Love Letters in the Sand", "Love Me Do", "Love Me Tender", "Love Shack", "Love Theme From 'A Star is Born' (Evergreen)", "Love Train", "Love Will Keep Us Together", "Love is a Many Splendoured Thing", "Love to Love You Baby", "Love's Theme", "Loving You", "Low", "Macarena", "Mack the Knife", "Maggie May", "Magic", "Magic Carpet Ride", "Make Love to Me", "Make it With You", "Makin' Whoopee", "Mama Told Me Not to Come", "Man in the Mirror", "Manana (Is Soon Enough For Me)", "Maneater", "Maniac", "Maybellene", "Me & Bobby McGee", "Me & Mrs Jones", "Memories Are Made of This", "Mercy Mercy Me (The Ecology)", "Mickey", "Midnight Train to Georgia", "Minnie the Moocher", "Miss You", "Miss You Much", "Mister Sandman", "Mmmbop", "Mona Lisa", "Monday Monday", "Money For Nothing", "Mony Mony", "Mood Indigo", "Moonlight Cocktail", "Moonlight Serenade", "More Than Words", "More Than a Feeling", "Morning Train (Nine to Five)", "Mr Big Stuff", "Mr Brightside", "Mr Tambourine Man", "Mrs Brown You've Got a Lovely Daughter", "Mrs Robinson", "Mule Train", "Music", "My Blue Heaven", "My Boyfriend's Back", "My Eyes Adored You", "My Girl", "My Guy", "My Heart Will Go On", "My Life", "My Love", "My Man", "My Prayer", "My Sharona", "My Sweet Lord", "Na Na Hey Hey (Kiss Him Goodbye)", "Nature Boy", "Near You", "Need You Now", "Need You Tonight", "Never Gonna Give You Up", "Night & Day", "Night Fever", "Nights in White Satin", "No One", "No Scrubs", "Nobody Does it Better", "Nothin' on You", "Nothing Compares 2 U", "Nothing's Gonna Stop Us Now", "Ode To Billie Joe", "Oh Happy Day", "Oh My Papa (O Mein Papa)", "Oh, Pretty Woman", "Ol' Man River", "Ole Buttermilk Sky", "On Bended Knee", "On My Own", "On the Atchison, Topeka & the Santa Fe", "One", "One Bad Apple", "One More Try", "One O'Clock Jump", "One Sweet Day", "One of These Nights", "One of Us", "Only The Lonely (Know The Way I Feel)", "Only You (And You Alone)", "Open Arms", "Over There", "Over the Rainbow", "Paint it Black", "Papa Don't Preach", "Papa Was a Rolling Stone", "Papa's Got a Brand New Bag", "Paper Doll", "Paper Planes", "Paperback Writer", "Party Rock Anthem", "Peg o' My Heart", "Peggy Sue", "Pennies From Heaven", "Penny Lane", "People", "People Got to Be Free", "Personality", "Philadelphia Freedom", "Physical", "Piano Man", "Pick Up the Pieces", "Pistol Packin' Mama", "Play That Funky Music", "Please Mr Postman", "Poker Face", "Pon De Replay", "Pony Time", "Pop Muzik", "Prisoner of Love", "Private Eyes", "Promiscuous", "Proud Mary", "Purple Haze", "Purple Rain", "Puttin' on the Ritz", "Que sera sera (Whatever will be will be)", "Queen of Hearts", "Rag Doll", "Rag Mop", "Rags to Riches", "Raindrops Keep Falling On My Head", "Rapture", "Ray of Light", "Reach Out (I'll Be There)", "Red Red Wine", "Rehab", "Respect", "Return to Sender", "Reunited", "Revolution", "Rhapsody in Blue", "Rhinestone Cowboy", "Rich Girl", "Riders On the Storm", "Right Back Where We Started From", "Ring My Bell", "Ring of Fire", "Rock Around the Clock", "Rock With You", "Rock Your Baby", "Rock the Boat", "Rock the Casbah", "Roll Over Beethoven", "Roll With It", "Rolling In The Deep", "Rosanna", "Roses Are Red", "Royals", "Ruby Tuesday", "Rudolph, the Red-Nosed Reindeer", "Rum & Coca-Cola", "Runaround Sue", "Runaway", "Running Scared", "Rush Rush", "Sailing", "Save the Best For Last", "Save the Last Dance For Me", "Say It Right", "Say My Name", "Say Say Say", "Say You, Say Me", "School's Out", "Seasons in the Sun", "Secret Love", "Sentimental Journey", "Sexyback", "Sh-Boom (Life Could Be a Dream)", "Shadow Dancing", "Shake Down", "Shake You Down", "She Drives Me Crazy", "She Loves You", "She's a Lady", "Shining Star", "Shop Around", "Shout", "Silly Love Songs", "Since U Been Gone", "Sing, Sing, Sing (With A Swing)", "Singing The Blues", "Single Ladies (Put A Ring On It)", "Sir Duke", "Sixteen Tons", "Sledgehammer", "Sleep Walk", "Sleepy Lagoon", "Slow Poke", "Smells Like Teen Spirit", "Smoke Gets in Your Eyes", "Smoke On the Water", "Smoke! Smoke! Smoke! (That Cigarette)", "Smooth", "So Much in Love", "Soldier Boy", "Some Enchanted Evening", "Some of These Days", "Somebody That I Used to Know", "Somebody to Love", "Someday", "Somethin' Stupid", "Something", "Soul Man", "Spanish Harlem", "Spill the Wine", "Spinning Wheel", "Spirit in the Sky", "St George & the Dragonette", "St Louis Blues", "Stagger Lee", "Stairway to Heaven", "Stand By Me", "Stardust", "Stars & Stripes Forever", "Stay (I Missed You)", "Stayin' Alive", "Stop! in the Name of Love", "Stormy Weather (Keeps Rainin' All the Time)", "Straight Up", "Strange Fruit", "Stranger On the Shore", "Strangers in the Night", "Strawberry Fields Forever", "Streets of Philadelphia", "Stronger", "Stuck On You", "Sugar Shack", "Sugar Sugar", "Summer in the City", "Summertime Blues", "Sunday, Monday or Always", "Sunshine Superman", "Sunshine of Your Love", "Superstar", "Superstition", "Surfin' USA", "Suspicious Minds", "Swanee", "Sweet Caroline (Good Times Never Seemed So Good)", "Sweet Child O' Mine", "Sweet Dreams (Are Made of This)", "Sweet Georgia Brown", "Sweet Home Alabama", "Sweet Soul Music", "Swinging On a Star", "T For Texas (Blue Yodel No 1)", "TSOP (The Sound of Philadelphia)", "Take Me Home, Country Roads", "Take My Breath Away", "Take On Me", "Take The 'A' Train", "Take a Bow", "Tammy", "Tangerine", "Tears in Heaven", "Tears of a Clown", "Temperature", "Tennessee Waltz", "Tequila", "Tha Crossroads", "Thank You (Falettinme be Mice Elf Again)", "That Lucky Old Sun (Just Rolls Around Heaven All Day)", "That Old Black Magic", "That'll Be the Day", "That's Amore", "That's What Friends Are For", "That's the Way (I Like It)", "That's the Way Love Goes", "The Boy is Mine", "The Boys of Summer", "The Christmas Song (Chestnuts Roasting On An Open Fire)", "The End of the World", "The First Time Ever I Saw Your Face", "The Girl From Ipanema", "The Glow-Worm", "The Great Pretender", "The Gypsy", "The Hustle", "The Joker", "The Last Dance", "The Letter", "The Loco-Motion", "The Long & Winding Road", "The Love You Save", "The Morning After", "The Power of Love", "The Prisoner's Song", "The Reason", "The Rose", "The Sign", "The Song From Moulin Rouge (Where Is Your Heart)", "The Sounds of Silence", "The Streak", "The Sweet Escape", "The Thing", "The Tide is High", "The Tracks of My Tears", "The Twist", "The Wanderer", "The Way We Were", "The Way You Look Tonight", "The Way You Move", "Theme From 'A Summer Place'", "Theme From 'Greatest American Hero' (Believe It Or Not)", "Theme From 'Shaft'", "There goes my baby", "These Boots Are Made For Walking", "Third Man Theme", "This Diamond Ring", "This Guy's in Love With You", "This Land is Your Land", "This Love", "This Ole House", "This Used to Be My Playground", "Three Coins in the Fountain", "Three Times a Lady", "Thrift Shop", "Thriller", "Ticket to Ride", "Tie a Yellow Ribbon 'round the Old Oak Tree", "Tiger Rag", "Tighten Up", "Tik-Toc", "Till I Waltz Again With You", "Till The End of Time", "Time After Time", "Time of the Season", "To Sir, with Love", "Tom Dooley", "Tonight's the Night (Gonna Be Alright)", "Too Close", "Too Young", "Tossing & Turning", "Total Eclipse of the Heart", "Touch Me", "Toxic", "Travellin' Band", "Travellin' Man", "Truly Madly Deeply", "Turn! Turn! Turn! (To Everything There is a Season)", "Tutti Frutti", "Twist & Shout", "Two Hearts", "U Can't Touch This", "U Got it Bad", "Umbrella", "Un-Break My Heart", "Unbelievable", "Unchained Melody", "Uncle Albert (Admiral Halsey)", "Under the Boardwalk", "Under the Bridge", "Unforgettable", "Up Around the Bend", "Up Up & Away", "Up Where We Belong", "Upside Down", "Use Somebody", "Vaya Con Dios (may God Be With You)", "Venus", "Vision of Love", "Viva La Vida", "Vogue", "Volare", "Wabash Cannonball", "Waiting For a Girl Like You", "Wake Me Up Before You Go Go", "Wake Up Little Susie", "Walk Don't Run", "Walk Like a Man", "Walk Like an Egyptian", "Walk On By", "Walk On the Wild Side", "Walk This Way", "Wannabe", "Want Ads", "Wanted", "War", "Waterfalls", "Wayward Wind", "We Are Family", "We Are Young", "We Are the Champions", "We Are the World", "We Belong Together", "We Built This City", "We Can Work it Out", "We Didn't Start the Fire", "We Found Love", "We Got The Beat", "We Will Rock You", "We've Only Just Begun", "Weak", "Wedding Bell Blues", "West End Blues", "West End Girls", "What Goes Around Comes Around", "What a Fool Believes", "What'd I Say", "What's Going On?", "What's Love Got to Do With It?", "Whatcha Say", "Wheel of Fortune", "When Doves Cry", "When You Wish Upon a Star", "When a Man Loves a Woman", "Where Did Our Love Go", "Where is the Love?", "Whip It", "Whispering", "White Christmas", "White Rabbit", "Whole Lotta Love", "Whole Lotta Shakin' Goin' On", "Whoomp! (There it Is)", "Why Do Fools Fall in Love?", "Why Don't You Believe Me?", "Wichita Lineman", "Wicked Game", "Wild Thing", "Wild Wild West", "Will It Go Round In Circles", "Will You Love Me Tomorrow", "Winchester Cathedral", "Wind Beneath My Wings", "Wipe Out", "Wishing Well", "With Or Without You", "Without Me", "Without You", "Woman", "Won't Get Fooled Again", "Wooly Bully", "Working My Way Back to You", "YMCA", "Yakety Yak", "Yeah!", "Yellow Rose of Texas", "Yesterday", "You Ain't Seen Nothin' Yet", "You Always Hurt the One You Love", "You Are the Sunshine of My Life", "You Belong With Me", "You Belong to Me", "You Can't Hurry Love", "You Don't Bring Me Flowers", "You Don't Have to Be a Star (To Be in My Show)", "You Light Up My Life", "You Make Me Feel Brand New", "You Make Me Feel Like Dancing", "You Really Got Me", "You Send Me", "You Sexy Thing", "You Were Meant for Me", "You make Me Wanna", "You'll Never Know", "You're Beautiful", "You're So Vain", "You're Still the One", "You're the One That I Want", "You've Got a Friend", "You've Lost That Lovin' Feelin'", "Your Cheatin' Heart", "Your Song"];
var hr = { album: aa, artist: ra, genre: oa, song_name: na };
var ia = hr;
var ta = ["activist", "artist", "author", "blogger", "business owner", "coach", "creator", "designer", "developer", "dreamer", "educator", "engineer", "entrepreneur", "environmentalist", "film lover", "filmmaker", "foodie", "founder", "friend", "gamer", "geek", "grad", "inventor", "leader", "model", "musician", "nerd", "parent", "patriot", "person", "philosopher", "photographer", "public speaker", "scientist", "singer", "streamer", "student", "teacher", "traveler", "veteran", "writer"];
var la = ["{{person.bio_part}}", "{{person.bio_part}}, {{person.bio_part}}", "{{person.bio_part}}, {{person.bio_part}}, {{person.bio_part}}", "{{person.bio_part}}, {{person.bio_part}}, {{person.bio_part}} {{internet.emoji}}", "{{word.noun}} {{person.bio_supporter}}", "{{word.noun}} {{person.bio_supporter}}  {{internet.emoji}}", "{{word.noun}} {{person.bio_supporter}}, {{person.bio_part}}", "{{word.noun}} {{person.bio_supporter}}, {{person.bio_part}} {{internet.emoji}}"];
var sa = ["advocate", "devotee", "enthusiast", "fan", "junkie", "lover", "supporter"];
var da = { generic: ["Aaliyah", "Aaron", "Abagail", "Abbey", "Abbie", "Abbigail", "Abby", "Abdiel", "Abdul", "Abdullah", "Abe", "Abel", "Abelardo", "Abigail", "Abigale", "Abigayle", "Abner", "Abraham", "Ada", "Adah", "Adalberto", "Adaline", "Adam", "Adan", "Addie", "Addison", "Adela", "Adelbert", "Adele", "Adelia", "Adeline", "Adell", "Adella", "Adelle", "Aditya", "Adolf", "Adolfo", "Adolph", "Adolphus", "Adonis", "Adrain", "Adrian", "Adriana", "Adrianna", "Adriel", "Adrien", "Adrienne", "Afton", "Aglae", "Agnes", "Agustin", "Agustina", "Ahmad", "Ahmed", "Aida", "Aidan", "Aiden", "Aileen", "Aimee", "Aisha", "Aiyana", "Akeem", "Al", "Alaina", "Alan", "Alana", "Alanis", "Alanna", "Alayna", "Alba", "Albert", "Alberta", "Albertha", "Alberto", "Albin", "Albina", "Alda", "Alden", "Alec", "Aleen", "Alejandra", "Alejandrin", "Alek", "Alena", "Alene", "Alessandra", "Alessandro", "Alessia", "Aletha", "Alex", "Alexa", "Alexander", "Alexandra", "Alexandre", "Alexandrea", "Alexandria", "Alexandrine", "Alexandro", "Alexane", "Alexanne", "Alexie", "Alexis", "Alexys", "Alexzander", "Alf", "Alfonso", "Alfonzo", "Alford", "Alfred", "Alfreda", "Alfredo", "Ali", "Alia", "Alice", "Alicia", "Alisa", "Alisha", "Alison", "Alivia", "Aliya", "Aliyah", "Aliza", "Alize", "Allan", "Allen", "Allene", "Allie", "Allison", "Ally", "Alphonso", "Alta", "Althea", "Alva", "Alvah", "Alvena", "Alvera", "Alverta", "Alvina", "Alvis", "Alyce", "Alycia", "Alysa", "Alysha", "Alyson", "Alysson", "Amalia", "Amanda", "Amani", "Amara", "Amari", "Amaya", "Amber", "Ambrose", "Amelia", "Amelie", "Amely", "America", "Americo", "Amie", "Amina", "Amir", "Amira", "Amiya", "Amos", "Amparo", "Amy", "Amya", "Ana", "Anabel", "Anabelle", "Anahi", "Anais", "Anastacio", "Anastasia", "Anderson", "Andre", "Andreane", "Andreanne", "Andres", "Andrew", "Andy", "Angel", "Angela", "Angelica", "Angelina", "Angeline", "Angelita", "Angelo", "Angie", "Angus", "Anibal", "Anika", "Anissa", "Anita", "Aniya", "Aniyah", "Anjali", "Anna", "Annabel", "Annabell", "Annabelle", "Annalise", "Annamae", "Annamarie", "Anne", "Annetta", "Annette", "Annie", "Ansel", "Ansley", "Anthony", "Antoinette", "Antone", "Antonetta", "Antonette", "Antonia", "Antonietta", "Antonina", "Antonio", "Antwan", "Antwon", "Anya", "April", "Ara", "Araceli", "Aracely", "Arch", "Archibald", "Ardella", "Arden", "Ardith", "Arely", "Ari", "Ariane", "Arianna", "Aric", "Ariel", "Arielle", "Arjun", "Arlene", "Arlie", "Arlo", "Armand", "Armando", "Armani", "Arnaldo", "Arne", "Arno", "Arnold", "Arnoldo", "Arnulfo", "Aron", "Art", "Arthur", "Arturo", "Arvel", "Arvid", "Arvilla", "Aryanna", "Asa", "Asha", "Ashlee", "Ashleigh", "Ashley", "Ashly", "Ashlynn", "Ashton", "Ashtyn", "Asia", "Assunta", "Astrid", "Athena", "Aubree", "Aubrey", "Audie", "Audra", "Audreanne", "Audrey", "August", "Augusta", "Augustine", "Augustus", "Aurelia", "Aurelie", "Aurelio", "Aurore", "Austen", "Austin", "Austyn", "Autumn", "Ava", "Avery", "Avis", "Axel", "Ayana", "Ayden", "Ayla", "Aylin", "Baby", "Bailee", "Bailey", "Barbara", "Barney", "Baron", "Barrett", "Barry", "Bart", "Bartholome", "Barton", "Baylee", "Beatrice", "Beau", "Beaulah", "Bell", "Bella", "Belle", "Ben", "Benedict", "Benjamin", "Bennett", "Bennie", "Benny", "Benton", "Berenice", "Bernadette", "Bernadine", "Bernard", "Bernardo", "Berneice", "Bernhard", "Bernice", "Bernie", "Berniece", "Bernita", "Berry", "Bert", "Berta", "Bertha", "Bertram", "Bertrand", "Beryl", "Bessie", "Beth", "Bethany", "Bethel", "Betsy", "Bette", "Bettie", "Betty", "Bettye", "Beulah", "Beverly", "Bianka", "Bill", "Billie", "Billy", "Birdie", "Blair", "Blaise", "Blake", "Blanca", "Blanche", "Blaze", "Bo", "Bobbie", "Bobby", "Bonita", "Bonnie", "Boris", "Boyd", "Brad", "Braden", "Bradford", "Bradley", "Bradly", "Brady", "Braeden", "Brain", "Brandi", "Brando", "Brandon", "Brandt", "Brandy", "Brandyn", "Brannon", "Branson", "Brant", "Braulio", "Braxton", "Brayan", "Breana", "Breanna", "Breanne", "Brenda", "Brendan", "Brenden", "Brendon", "Brenna", "Brennan", "Brennon", "Brent", "Bret", "Brett", "Bria", "Brian", "Briana", "Brianne", "Brice", "Bridget", "Bridgette", "Bridie", "Brielle", "Brigitte", "Brionna", "Brisa", "Britney", "Brittany", "Brock", "Broderick", "Brody", "Brook", "Brooke", "Brooklyn", "Brooks", "Brown", "Bruce", "Bryana", "Bryce", "Brycen", "Bryon", "Buck", "Bud", "Buddy", "Buford", "Bulah", "Burdette", "Burley", "Burnice", "Buster", "Cade", "Caden", "Caesar", "Caitlyn", "Cale", "Caleb", "Caleigh", "Cali", "Calista", "Callie", "Camden", "Cameron", "Camila", "Camilla", "Camille", "Camren", "Camron", "Camryn", "Camylle", "Candace", "Candelario", "Candice", "Candida", "Candido", "Cara", "Carey", "Carissa", "Carlee", "Carleton", "Carley", "Carli", "Carlie", "Carlo", "Carlos", "Carlotta", "Carmel", "Carmela", "Carmella", "Carmelo", "Carmen", "Carmine", "Carol", "Carolanne", "Carole", "Carolina", "Caroline", "Carolyn", "Carolyne", "Carrie", "Carroll", "Carson", "Carter", "Cary", "Casandra", "Casey", "Casimer", "Casimir", "Casper", "Cassandra", "Cassandre", "Cassidy", "Cassie", "Catalina", "Caterina", "Catharine", "Catherine", "Cathrine", "Cathryn", "Cathy", "Cayla", "Ceasar", "Cecelia", "Cecil", "Cecile", "Cecilia", "Cedrick", "Celestine", "Celestino", "Celia", "Celine", "Cesar", "Chad", "Chadd", "Chadrick", "Chaim", "Chance", "Chandler", "Chanel", "Chanelle", "Charity", "Charlene", "Charles", "Charley", "Charlie", "Charlotte", "Chase", "Chasity", "Chauncey", "Chaya", "Chaz", "Chelsea", "Chelsey", "Chelsie", "Chesley", "Chester", "Chet", "Cheyanne", "Cheyenne", "Chloe", "Chris", "Christ", "Christa", "Christelle", "Christian", "Christiana", "Christina", "Christine", "Christop", "Christophe", "Christopher", "Christy", "Chyna", "Ciara", "Cicero", "Cielo", "Cierra", "Cindy", "Citlalli", "Clair", "Claire", "Clara", "Clarabelle", "Clare", "Clarissa", "Clark", "Claud", "Claude", "Claudia", "Claudie", "Claudine", "Clay", "Clemens", "Clement", "Clementina", "Clementine", "Clemmie", "Cleo", "Cleora", "Cleta", "Cletus", "Cleve", "Cleveland", "Clifford", "Clifton", "Clint", "Clinton", "Clotilde", "Clovis", "Cloyd", "Clyde", "Coby", "Cody", "Colby", "Cole", "Coleman", "Colin", "Colleen", "Collin", "Colt", "Colten", "Colton", "Columbus", "Concepcion", "Conner", "Connie", "Connor", "Conor", "Conrad", "Constance", "Constantin", "Consuelo", "Cooper", "Cora", "Coralie", "Corbin", "Cordelia", "Cordell", "Cordia", "Cordie", "Corene", "Corine", "Cornelius", "Cornell", "Corrine", "Cortez", "Cortney", "Cory", "Coty", "Courtney", "Coy", "Craig", "Crawford", "Creola", "Cristal", "Cristian", "Cristina", "Cristobal", "Cristopher", "Cruz", "Crystal", "Crystel", "Cullen", "Curt", "Curtis", "Cydney", "Cynthia", "Cyril", "Cyrus", "D'angelo", "Dagmar", "Dahlia", "Daija", "Daisha", "Daisy", "Dakota", "Dale", "Dallas", "Dallin", "Dalton", "Damaris", "Dameon", "Damian", "Damien", "Damion", "Damon", "Dan", "Dana", "Dandre", "Dane", "Dangelo", "Danial", "Daniela", "Daniella", "Danielle", "Danika", "Dannie", "Danny", "Dante", "Danyka", "Daphne", "Daphnee", "Daphney", "Darby", "Daren", "Darian", "Dariana", "Darien", "Dario", "Darion", "Darius", "Darlene", "Daron", "Darrel", "Darrell", "Darren", "Darrick", "Darrin", "Darrion", "Darron", "Darryl", "Darwin", "Daryl", "Dashawn", "Dasia", "Dave", "David", "Davin", "Davion", "Davon", "Davonte", "Dawn", "Dawson", "Dax", "Dayana", "Dayna", "Dayne", "Dayton", "Dean", "Deangelo", "Deanna", "Deborah", "Declan", "Dedric", "Dedrick", "Dee", "Deion", "Deja", "Dejah", "Dejon", "Dejuan", "Delaney", "Delbert", "Delfina", "Delia", "Delilah", "Dell", "Della", "Delmer", "Delores", "Delpha", "Delphia", "Delphine", "Delta", "Demarco", "Demarcus", "Demario", "Demetris", "Demetrius", "Demond", "Dena", "Denis", "Dennis", "Deon", "Deondre", "Deontae", "Deonte", "Dereck", "Derek", "Derick", "Deron", "Derrick", "Deshaun", "Deshawn", "Desiree", "Desmond", "Dessie", "Destany", "Destin", "Destinee", "Destiney", "Destini", "Destiny", "Devan", "Devante", "Deven", "Devin", "Devon", "Devonte", "Devyn", "Dewayne", "Dewitt", "Dexter", "Diamond", "Diana", "Dianna", "Diego", "Dillan", "Dillon", "Dimitri", "Dina", "Dino", "Dion", "Dixie", "Dock", "Dolly", "Dolores", "Domenic", "Domenica", "Domenick", "Domenico", "Domingo", "Dominic", "Dominique", "Don", "Donald", "Donato", "Donavon", "Donna", "Donnell", "Donnie", "Donny", "Dora", "Dorcas", "Dorian", "Doris", "Dorothea", "Dorothy", "Dorris", "Dortha", "Dorthy", "Doug", "Douglas", "Dovie", "Doyle", "Drake", "Drew", "Duane", "Dudley", "Dulce", "Duncan", "Durward", "Dustin", "Dusty", "Dwight", "Dylan", "Earl", "Earlene", "Earline", "Earnest", "Earnestine", "Easter", "Easton", "Ebba", "Ebony", "Ed", "Eda", "Edd", "Eddie", "Eden", "Edgar", "Edgardo", "Edison", "Edmond", "Edmund", "Edna", "Eduardo", "Edward", "Edwardo", "Edwin", "Edwina", "Edyth", "Edythe", "Effie", "Efrain", "Efren", "Eileen", "Einar", "Eino", "Eladio", "Elaina", "Elbert", "Elda", "Eldon", "Eldora", "Eldred", "Eldridge", "Eleanora", "Eleanore", "Eleazar", "Electa", "Elena", "Elenor", "Elenora", "Eleonore", "Elfrieda", "Eli", "Elian", "Eliane", "Elias", "Eliezer", "Elijah", "Elinor", "Elinore", "Elisa", "Elisabeth", "Elise", "Eliseo", "Elisha", "Elissa", "Eliza", "Elizabeth", "Ella", "Ellen", "Ellie", "Elliot", "Elliott", "Ellis", "Ellsworth", "Elmer", "Elmira", "Elmo", "Elmore", "Elna", "Elnora", "Elody", "Eloisa", "Eloise", "Elouise", "Eloy", "Elroy", "Elsa", "Else", "Elsie", "Elta", "Elton", "Elva", "Elvera", "Elvie", "Elvis", "Elwin", "Elwyn", "Elyse", "Elyssa", "Elza", "Emanuel", "Emelia", "Emelie", "Emely", "Emerald", "Emerson", "Emery", "Emie", "Emil", "Emile", "Emilia", "Emiliano", "Emilie", "Emilio", "Emily", "Emma", "Emmalee", "Emmanuel", "Emmanuelle", "Emmet", "Emmett", "Emmie", "Emmitt", "Emmy", "Emory", "Ena", "Enid", "Enoch", "Enola", "Enos", "Enrico", "Enrique", "Ephraim", "Era", "Eriberto", "Eric", "Erica", "Erich", "Erick", "Ericka", "Erik", "Erika", "Erin", "Erling", "Erna", "Ernest", "Ernestina", "Ernestine", "Ernesto", "Ernie", "Ervin", "Erwin", "Eryn", "Esmeralda", "Esperanza", "Esta", "Esteban", "Estefania", "Estel", "Estell", "Estella", "Estelle", "Estevan", "Esther", "Estrella", "Etha", "Ethan", "Ethel", "Ethelyn", "Ethyl", "Ettie", "Eudora", "Eugene", "Eugenia", "Eula", "Eulah", "Eulalia", "Euna", "Eunice", "Eusebio", "Eva", "Evalyn", "Evan", "Evangeline", "Evans", "Eve", "Eveline", "Evelyn", "Everardo", "Everett", "Everette", "Evert", "Evie", "Ewald", "Ewell", "Ezekiel", "Ezequiel", "Ezra", "Fabian", "Fabiola", "Fae", "Fannie", "Fanny", "Fatima", "Faustino", "Fausto", "Favian", "Fay", "Faye", "Federico", "Felicia", "Felicita", "Felicity", "Felipa", "Felipe", "Felix", "Felton", "Fermin", "Fern", "Fernando", "Ferne", "Fidel", "Filiberto", "Filomena", "Finn", "Fiona", "Flavie", "Flavio", "Fleta", "Fletcher", "Flo", "Florence", "Florencio", "Florian", "Florida", "Florine", "Flossie", "Floy", "Floyd", "Ford", "Forest", "Forrest", "Foster", "Frances", "Francesca", "Francesco", "Francis", "Francisca", "Francisco", "Franco", "Frank", "Frankie", "Franz", "Fred", "Freda", "Freddie", "Freddy", "Frederic", "Frederick", "Frederik", "Frederique", "Fredrick", "Fredy", "Freeda", "Freeman", "Freida", "Frida", "Frieda", "Friedrich", "Fritz", "Furman", "Gabe", "Gabriel", "Gabriella", "Gabrielle", "Gaetano", "Gage", "Gail", "Gardner", "Garett", "Garfield", "Garland", "Garnet", "Garnett", "Garret", "Garrett", "Garrick", "Garrison", "Garry", "Garth", "Gaston", "Gavin", "Gayle", "Gene", "General", "Genesis", "Genevieve", "Gennaro", "Genoveva", "Geo", "Geoffrey", "George", "Georgette", "Georgiana", "Georgianna", "Geovanni", "Geovanny", "Geovany", "Gerald", "Geraldine", "Gerard", "Gerardo", "Gerda", "Gerhard", "Germaine", "German", "Gerry", "Gerson", "Gertrude", "Gia", "Gianni", "Gideon", "Gilbert", "Gilberto", "Gilda", "Giles", "Gillian", "Gina", "Gino", "Giovani", "Giovanna", "Giovanni", "Giovanny", "Gisselle", "Giuseppe", "Gladyce", "Gladys", "Glen", "Glenda", "Glenna", "Glennie", "Gloria", "Godfrey", "Golda", "Golden", "Gonzalo", "Gordon", "Grace", "Gracie", "Graciela", "Grady", "Graham", "Grant", "Granville", "Grayce", "Grayson", "Green", "Greg", "Gregg", "Gregoria", "Gregorio", "Gregory", "Greta", "Gretchen", "Greyson", "Griffin", "Grover", "Guadalupe", "Gudrun", "Guido", "Guillermo", "Guiseppe", "Gunnar", "Gunner", "Gus", "Gussie", "Gust", "Gustave", "Guy", "Gwen", "Gwendolyn", "Hadley", "Hailee", "Hailey", "Hailie", "Hal", "Haleigh", "Haley", "Halie", "Halle", "Hallie", "Hank", "Hanna", "Hannah", "Hans", "Hardy", "Harley", "Harmon", "Harmony", "Harold", "Harrison", "Harry", "Harvey", "Haskell", "Hassan", "Hassie", "Hattie", "Haven", "Hayden", "Haylee", "Hayley", "Haylie", "Hazel", "Hazle", "Heath", "Heather", "Heaven", "Heber", "Hector", "Heidi", "Helen", "Helena", "Helene", "Helga", "Hellen", "Helmer", "Heloise", "Henderson", "Henri", "Henriette", "Henry", "Herbert", "Herman", "Hermann", "Hermina", "Herminia", "Herminio", "Hershel", "Herta", "Hertha", "Hester", "Hettie", "Hilario", "Hilbert", "Hilda", "Hildegard", "Hillard", "Hillary", "Hilma", "Hilton", "Hipolito", "Hiram", "Hobart", "Holden", "Hollie", "Hollis", "Holly", "Hope", "Horace", "Horacio", "Hortense", "Hosea", "Houston", "Howard", "Howell", "Hoyt", "Hubert", "Hudson", "Hugh", "Hulda", "Humberto", "Hunter", "Hyman", "Ian", "Ibrahim", "Icie", "Ida", "Idell", "Idella", "Ignacio", "Ignatius", "Ike", "Ila", "Ilene", "Iliana", "Ima", "Imani", "Imelda", "Immanuel", "Imogene", "Ines", "Irma", "Irving", "Irwin", "Isaac", "Isabel", "Isabell", "Isabella", "Isabelle", "Isac", "Isadore", "Isai", "Isaiah", "Isaias", "Isidro", "Ismael", "Isobel", "Isom", "Israel", "Issac", "Itzel", "Iva", "Ivah", "Ivory", "Ivy", "Izabella", "Izaiah", "Jabari", "Jace", "Jacey", "Jacinthe", "Jacinto", "Jack", "Jackeline", "Jackie", "Jacklyn", "Jackson", "Jacky", "Jaclyn", "Jacquelyn", "Jacques", "Jacynthe", "Jada", "Jade", "Jaden", "Jadon", "Jadyn", "Jaeden", "Jaida", "Jaiden", "Jailyn", "Jaime", "Jairo", "Jakayla", "Jake", "Jakob", "Jaleel", "Jalen", "Jalon", "Jalyn", "Jamaal", "Jamal", "Jamar", "Jamarcus", "Jamel", "Jameson", "Jamey", "Jamie", "Jamil", "Jamir", "Jamison", "Jammie", "Jan", "Jana", "Janae", "Jane", "Janelle", "Janessa", "Janet", "Janice", "Janick", "Janie", "Janis", "Janiya", "Jannie", "Jany", "Jaquan", "Jaquelin", "Jaqueline", "Jared", "Jaren", "Jarod", "Jaron", "Jarred", "Jarrell", "Jarret", "Jarrett", "Jarrod", "Jarvis", "Jasen", "Jasmin", "Jason", "Jasper", "Jaunita", "Javier", "Javon", "Javonte", "Jay", "Jayce", "Jaycee", "Jayda", "Jayde", "Jayden", "Jaydon", "Jaylan", "Jaylen", "Jaylin", "Jaylon", "Jayme", "Jayne", "Jayson", "Jazlyn", "Jazmin", "Jazmyn", "Jazmyne", "Jean", "Jeanette", "Jeanie", "Jeanne", "Jed", "Jedediah", "Jedidiah", "Jeff", "Jefferey", "Jeffery", "Jeffrey", "Jeffry", "Jena", "Jenifer", "Jennie", "Jennifer", "Jennings", "Jennyfer", "Jensen", "Jerad", "Jerald", "Jeramie", "Jeramy", "Jerel", "Jeremie", "Jeremy", "Jermain", "Jermaine", "Jermey", "Jerod", "Jerome", "Jeromy", "Jerrell", "Jerrod", "Jerrold", "Jerry", "Jess", "Jesse", "Jessica", "Jessie", "Jessika", "Jessy", "Jessyca", "Jesus", "Jett", "Jettie", "Jevon", "Jewel", "Jewell", "Jillian", "Jimmie", "Jimmy", "Jo", "Joan", "Joana", "Joanie", "Joanne", "Joannie", "Joanny", "Joany", "Joaquin", "Jocelyn", "Jodie", "Jody", "Joe", "Joel", "Joelle", "Joesph", "Joey", "Johan", "Johann", "Johanna", "Johathan", "John", "Johnathan", "Johnathon", "Johnnie", "Johnny", "Johnpaul", "Johnson", "Jolie", "Jon", "Jonas", "Jonatan", "Jonathan", "Jonathon", "Jordan", "Jordane", "Jordi", "Jordon", "Jordy", "Jordyn", "Jorge", "Jose", "Josefa", "Josefina", "Joseph", "Josephine", "Josh", "Joshua", "Joshuah", "Josiah", "Josiane", "Josianne", "Josie", "Josue", "Jovan", "Jovani", "Jovanny", "Jovany", "Joy", "Joyce", "Juana", "Juanita", "Judah", "Judd", "Jude", "Judge", "Judson", "Judy", "Jules", "Julia", "Julian", "Juliana", "Julianne", "Julie", "Julien", "Juliet", "Julio", "Julius", "June", "Junior", "Junius", "Justen", "Justice", "Justina", "Justine", "Juston", "Justus", "Justyn", "Juvenal", "Juwan", "Kacey", "Kaci", "Kacie", "Kade", "Kaden", "Kadin", "Kaela", "Kaelyn", "Kaia", "Kailee", "Kailey", "Kailyn", "Kaitlin", "Kaitlyn", "Kale", "Kaleb", "Kaleigh", "Kaley", "Kali", "Kallie", "Kameron", "Kamille", "Kamren", "Kamron", "Kamryn", "Kane", "Kara", "Kareem", "Karelle", "Karen", "Kari", "Kariane", "Karianne", "Karina", "Karine", "Karl", "Karlee", "Karley", "Karli", "Karlie", "Karolann", "Karson", "Kasandra", "Kasey", "Kassandra", "Katarina", "Katelin", "Katelyn", "Katelynn", "Katharina", "Katherine", "Katheryn", "Kathleen", "Kathlyn", "Kathryn", "Kathryne", "Katlyn", "Katlynn", "Katrina", "Katrine", "Kattie", "Kavon", "Kay", "Kaya", "Kaycee", "Kayden", "Kayla", "Kaylah", "Kaylee", "Kayleigh", "Kayley", "Kayli", "Kaylie", "Kaylin", "Keagan", "Keanu", "Keara", "Keaton", "Keegan", "Keeley", "Keely", "Keenan", "Keira", "Keith", "Kellen", "Kelley", "Kelli", "Kellie", "Kelly", "Kelsi", "Kelsie", "Kelton", "Kelvin", "Ken", "Kendall", "Kendra", "Kendrick", "Kenna", "Kennedi", "Kennedy", "Kenneth", "Kennith", "Kenny", "Kenton", "Kenya", "Kenyatta", "Kenyon", "Keon", "Keshaun", "Keshawn", "Keven", "Kevin", "Kevon", "Keyon", "Keyshawn", "Khalid", "Khalil", "Kian", "Kiana", "Kianna", "Kiara", "Kiarra", "Kiel", "Kiera", "Kieran", "Kiley", "Kim", "Kimberly", "King", "Kip", "Kira", "Kirk", "Kirsten", "Kirstin", "Kitty", "Kobe", "Koby", "Kody", "Kolby", "Kole", "Korbin", "Korey", "Kory", "Kraig", "Kris", "Krista", "Kristian", "Kristin", "Kristina", "Kristofer", "Kristoffer", "Kristopher", "Kristy", "Krystal", "Krystel", "Krystina", "Kurt", "Kurtis", "Kyla", "Kyle", "Kylee", "Kyleigh", "Kyler", "Kylie", "Kyra", "Lacey", "Lacy", "Ladarius", "Lafayette", "Laila", "Laisha", "Lamar", "Lambert", "Lamont", "Lance", "Landen", "Lane", "Laney", "Larissa", "Laron", "Larry", "Larue", "Laura", "Laurel", "Lauren", "Laurence", "Lauretta", "Lauriane", "Laurianne", "Laurie", "Laurine", "Laury", "Lauryn", "Lavada", "Lavern", "Laverna", "Laverne", "Lavina", "Lavinia", "Lavon", "Lavonne", "Lawrence", "Lawson", "Layla", "Layne", "Lazaro", "Lea", "Leann", "Leanna", "Leanne", "Leatha", "Leda", "Lee", "Leif", "Leila", "Leilani", "Lela", "Lelah", "Leland", "Lelia", "Lempi", "Lemuel", "Lenna", "Lennie", "Lenny", "Lenora", "Lenore", "Leo", "Leola", "Leon", "Leonard", "Leonardo", "Leone", "Leonel", "Leonie", "Leonor", "Leonora", "Leopold", "Leopoldo", "Leora", "Lera", "Lesley", "Leslie", "Lesly", "Lessie", "Lester", "Leta", "Letha", "Letitia", "Levi", "Lew", "Lewis", "Lexi", "Lexie", "Lexus", "Lia", "Liam", "Liana", "Libbie", "Libby", "Lila", "Lilian", "Liliana", "Liliane", "Lilla", "Lillian", "Lilliana", "Lillie", "Lilly", "Lily", "Lilyan", "Lina", "Lincoln", "Linda", "Lindsay", "Lindsey", "Linnea", "Linnie", "Linwood", "Lionel", "Lisa", "Lisandro", "Lisette", "Litzy", "Liza", "Lizeth", "Lizzie", "Llewellyn", "Lloyd", "Logan", "Lois", "Lola", "Lolita", "Loma", "Lon", "London", "Lonie", "Lonnie", "Lonny", "Lonzo", "Lora", "Loraine", "Loren", "Lorena", "Lorenz", "Lorenza", "Lorenzo", "Lori", "Lorine", "Lorna", "Lottie", "Lou", "Louie", "Louisa", "Lourdes", "Louvenia", "Lowell", "Loy", "Loyal", "Loyce", "Lucas", "Luciano", "Lucie", "Lucienne", "Lucile", "Lucinda", "Lucio", "Lucious", "Lucius", "Lucy", "Ludie", "Ludwig", "Lue", "Luella", "Luigi", "Luis", "Luisa", "Lukas", "Lula", "Lulu", "Luna", "Lupe", "Lura", "Lurline", "Luther", "Luz", "Lyda", "Lydia", "Lyla", "Lynn", "Lyric", "Lysanne", "Mabel", "Mabelle", "Mable", "Mac", "Macey", "Maci", "Macie", "Mack", "Mackenzie", "Macy", "Madaline", "Madalyn", "Maddison", "Madeline", "Madelyn", "Madelynn", "Madge", "Madie", "Madilyn", "Madisen", "Madison", "Madisyn", "Madonna", "Madyson", "Mae", "Maegan", "Maeve", "Mafalda", "Magali", "Magdalen", "Magdalena", "Maggie", "Magnolia", "Magnus", "Maia", "Maida", "Maiya", "Major", "Makayla", "Makenna", "Makenzie", "Malachi", "Malcolm", "Malika", "Malinda", "Mallie", "Mallory", "Malvina", "Mandy", "Manley", "Manuel", "Manuela", "Mara", "Marc", "Marcel", "Marcelina", "Marcelino", "Marcella", "Marcelle", "Marcellus", "Marcelo", "Marcia", "Marco", "Marcos", "Marcus", "Margaret", "Margarete", "Margarett", "Margaretta", "Margarette", "Margarita", "Marge", "Margie", "Margot", "Margret", "Marguerite", "Maria", "Mariah", "Mariam", "Marian", "Mariana", "Mariane", "Marianna", "Marianne", "Mariano", "Maribel", "Marie", "Mariela", "Marielle", "Marietta", "Marilie", "Marilou", "Marilyne", "Marina", "Mario", "Marion", "Marisa", "Marisol", "Maritza", "Marjolaine", "Marjorie", "Marjory", "Mark", "Markus", "Marlee", "Marlen", "Marlene", "Marley", "Marlin", "Marlon", "Marques", "Marquis", "Marquise", "Marshall", "Marta", "Martin", "Martina", "Martine", "Marty", "Marvin", "Mary", "Maryam", "Maryjane", "Maryse", "Mason", "Mateo", "Mathew", "Mathias", "Mathilde", "Matilda", "Matilde", "Matt", "Matteo", "Mattie", "Maud", "Maude", "Maudie", "Maureen", "Maurice", "Mauricio", "Maurine", "Maverick", "Mavis", "Max", "Maxie", "Maxime", "Maximilian", "Maximillia", "Maximillian", "Maximo", "Maximus", "Maxine", "Maxwell", "May", "Maya", "Maybell", "Maybelle", "Maye", "Maymie", "Maynard", "Mayra", "Mazie", "Mckayla", "Mckenna", "Mckenzie", "Meagan", "Meaghan", "Meda", "Megane", "Meggie", "Meghan", "Mekhi", "Melany", "Melba", "Melisa", "Melissa", "Mellie", "Melody", "Melvin", "Melvina", "Melyna", "Melyssa", "Mercedes", "Meredith", "Merl", "Merle", "Merlin", "Merritt", "Mertie", "Mervin", "Meta", "Mia", "Micaela", "Micah", "Michael", "Michaela", "Michale", "Micheal", "Michel", "Michele", "Michelle", "Miguel", "Mikayla", "Mike", "Mikel", "Milan", "Miles", "Milford", "Miller", "Millie", "Milo", "Milton", "Mina", "Minerva", "Minnie", "Miracle", "Mireille", "Mireya", "Misael", "Missouri", "Misty", "Mitchel", "Mitchell", "Mittie", "Modesta", "Modesto", "Mohamed", "Mohammad", "Mohammed", "Moises", "Mollie", "Molly", "Mona", "Monica", "Monique", "Monroe", "Monserrat", "Monserrate", "Montana", "Monte", "Monty", "Morgan", "Moriah", "Morris", "Mortimer", "Morton", "Mose", "Moses", "Moshe", "Mossie", "Mozell", "Mozelle", "Muhammad", "Muriel", "Murl", "Murphy", "Murray", "Mustafa", "Mya", "Myah", "Mylene", "Myles", "Myra", "Myriam", "Myrl", "Myrna", "Myron", "Myrtice", "Myrtie", "Myrtis", "Myrtle", "Nadia", "Nakia", "Name", "Nannie", "Naomi", "Naomie", "Napoleon", "Narciso", "Nash", "Nasir", "Nat", "Natalia", "Natalie", "Natasha", "Nathan", "Nathanael", "Nathanial", "Nathaniel", "Nathen", "Nayeli", "Neal", "Ned", "Nedra", "Neha", "Neil", "Nelda", "Nella", "Nelle", "Nellie", "Nels", "Nelson", "Neoma", "Nestor", "Nettie", "Neva", "Newell", "Newton", "Nia", "Nicholas", "Nicholaus", "Nichole", "Nick", "Nicklaus", "Nickolas", "Nico", "Nicola", "Nicolas", "Nicole", "Nicolette", "Nigel", "Nikita", "Nikki", "Nikko", "Niko", "Nikolas", "Nils", "Nina", "Noah", "Noble", "Noe", "Noel", "Noelia", "Noemi", "Noemie", "Noemy", "Nola", "Nolan", "Nona", "Nora", "Norbert", "Norberto", "Norene", "Norma", "Norris", "Norval", "Norwood", "Nova", "Novella", "Nya", "Nyah", "Nyasia", "Obie", "Oceane", "Ocie", "Octavia", "Oda", "Odell", "Odessa", "Odie", "Ofelia", "Okey", "Ola", "Olaf", "Ole", "Olen", "Oleta", "Olga", "Olin", "Oliver", "Ollie", "Oma", "Omari", "Omer", "Ona", "Onie", "Opal", "Ophelia", "Ora", "Oral", "Oran", "Oren", "Orie", "Orin", "Orion", "Orland", "Orlando", "Orlo", "Orpha", "Orrin", "Orval", "Orville", "Osbaldo", "Osborne", "Oscar", "Osvaldo", "Oswald", "Oswaldo", "Otha", "Otho", "Otilia", "Otis", "Ottilie", "Ottis", "Otto", "Ova", "Owen", "Ozella", "Pablo", "Paige", "Palma", "Pamela", "Pansy", "Paolo", "Paris", "Parker", "Pascale", "Pasquale", "Pat", "Patience", "Patricia", "Patrick", "Patsy", "Pattie", "Paul", "Paula", "Pauline", "Paxton", "Payton", "Pearl", "Pearlie", "Pearline", "Pedro", "Peggie", "Penelope", "Percival", "Percy", "Perry", "Pete", "Peter", "Petra", "Peyton", "Philip", "Phoebe", "Phyllis", "Pierce", "Pierre", "Pietro", "Pink", "Pinkie", "Piper", "Polly", "Porter", "Precious", "Presley", "Preston", "Price", "Prince", "Princess", "Priscilla", "Providenci", "Prudence", "Queen", "Queenie", "Quentin", "Quincy", "Quinn", "Quinten", "Quinton", "Rachael", "Rachel", "Rachelle", "Rae", "Raegan", "Rafael", "Rafaela", "Raheem", "Rahsaan", "Rahul", "Raina", "Raleigh", "Ralph", "Ramiro", "Ramon", "Ramona", "Randal", "Randall", "Randi", "Randy", "Ransom", "Raoul", "Raphael", "Raphaelle", "Raquel", "Rashad", "Rashawn", "Rasheed", "Raul", "Raven", "Ray", "Raymond", "Raymundo", "Reagan", "Reanna", "Reba", "Rebeca", "Rebecca", "Rebeka", "Rebekah", "Reece", "Reed", "Reese", "Regan", "Reggie", "Reginald", "Reid", "Reilly", "Reina", "Reinhold", "Remington", "Rene", "Renee", "Ressie", "Reta", "Retha", "Retta", "Reuben", "Reva", "Rex", "Rey", "Reyes", "Reymundo", "Reyna", "Reynold", "Rhea", "Rhett", "Rhianna", "Rhiannon", "Rhoda", "Ricardo", "Richard", "Richie", "Richmond", "Rick", "Rickey", "Rickie", "Ricky", "Rico", "Rigoberto", "Riley", "Rita", "River", "Robb", "Robbie", "Robert", "Roberta", "Roberto", "Robin", "Robyn", "Rocio", "Rocky", "Rod", "Roderick", "Rodger", "Rodolfo", "Rodrick", "Rodrigo", "Roel", "Rogelio", "Roger", "Rogers", "Rolando", "Rollin", "Roma", "Romaine", "Roman", "Ron", "Ronaldo", "Ronny", "Roosevelt", "Rory", "Rosa", "Rosalee", "Rosalia", "Rosalind", "Rosalinda", "Rosalyn", "Rosamond", "Rosanna", "Rosario", "Roscoe", "Rose", "Rosella", "Roselyn", "Rosemarie", "Rosemary", "Rosendo", "Rosetta", "Rosie", "Rosina", "Roslyn", "Ross", "Rossie", "Rowan", "Rowena", "Rowland", "Roxane", "Roxanne", "Roy", "Royal", "Royce", "Rozella", "Ruben", "Rubie", "Ruby", "Rubye", "Rudolph", "Rudy", "Rupert", "Russ", "Russel", "Russell", "Rusty", "Ruth", "Ruthe", "Ruthie", "Ryan", "Ryann", "Ryder", "Rylan", "Rylee", "Ryleigh", "Ryley", "Sabina", "Sabrina", "Sabryna", "Sadie", "Sadye", "Sage", "Saige", "Sallie", "Sally", "Salma", "Salvador", "Salvatore", "Sam", "Samanta", "Samantha", "Samara", "Samir", "Sammie", "Sammy", "Samson", "Sandra", "Sandrine", "Sandy", "Sanford", "Santa", "Santiago", "Santina", "Santino", "Santos", "Sarah", "Sarai", "Sarina", "Sasha", "Saul", "Savanah", "Savanna", "Savannah", "Savion", "Scarlett", "Schuyler", "Scot", "Scottie", "Scotty", "Seamus", "Sean", "Sebastian", "Sedrick", "Selena", "Selina", "Selmer", "Serena", "Serenity", "Seth", "Shad", "Shaina", "Shakira", "Shana", "Shane", "Shanel", "Shanelle", "Shania", "Shanie", "Shaniya", "Shanna", "Shannon", "Shanny", "Shanon", "Shany", "Sharon", "Shaun", "Shawn", "Shawna", "Shaylee", "Shayna", "Shayne", "Shea", "Sheila", "Sheldon", "Shemar", "Sheridan", "Sherman", "Sherwood", "Shirley", "Shyann", "Shyanne", "Sibyl", "Sid", "Sidney", "Sienna", "Sierra", "Sigmund", "Sigrid", "Sigurd", "Silas", "Sim", "Simeon", "Simone", "Sincere", "Sister", "Skye", "Skyla", "Skylar", "Sofia", "Soledad", "Solon", "Sonia", "Sonny", "Sonya", "Sophia", "Sophie", "Spencer", "Stacey", "Stacy", "Stan", "Stanford", "Stanley", "Stanton", "Stefan", "Stefanie", "Stella", "Stephan", "Stephania", "Stephanie", "Stephany", "Stephen", "Stephon", "Sterling", "Steve", "Stevie", "Stewart", "Stone", "Stuart", "Summer", "Sunny", "Susan", "Susana", "Susanna", "Susie", "Suzanne", "Sven", "Syble", "Sydnee", "Sydney", "Sydni", "Sydnie", "Sylvan", "Sylvester", "Sylvia", "Tabitha", "Tad", "Talia", "Talon", "Tamara", "Tamia", "Tania", "Tanner", "Tanya", "Tara", "Taryn", "Tate", "Tatum", "Tatyana", "Taurean", "Tavares", "Taya", "Taylor", "Teagan", "Ted", "Telly", "Terence", "Teresa", "Terrance", "Terrell", "Terrence", "Terrill", "Terry", "Tess", "Tessie", "Tevin", "Thad", "Thaddeus", "Thalia", "Thea", "Thelma", "Theo", "Theodora", "Theodore", "Theresa", "Therese", "Theresia", "Theron", "Thomas", "Thora", "Thurman", "Tia", "Tiana", "Tianna", "Tiara", "Tierra", "Tiffany", "Tillman", "Timmothy", "Timmy", "Timothy", "Tina", "Tito", "Titus", "Tobin", "Toby", "Tod", "Tom", "Tomas", "Tomasa", "Tommie", "Toney", "Toni", "Tony", "Torey", "Torrance", "Torrey", "Toy", "Trace", "Tracey", "Tracy", "Travis", "Travon", "Tre", "Tremaine", "Tremayne", "Trent", "Trenton", "Tressa", "Tressie", "Treva", "Trever", "Trevion", "Trevor", "Trey", "Trinity", "Trisha", "Tristian", "Tristin", "Triston", "Troy", "Trudie", "Trycia", "Trystan", "Turner", "Twila", "Tyler", "Tyra", "Tyree", "Tyreek", "Tyrel", "Tyrell", "Tyrese", "Tyrique", "Tyshawn", "Tyson", "Ubaldo", "Ulices", "Ulises", "Una", "Unique", "Urban", "Uriah", "Uriel", "Ursula", "Vada", "Valentin", "Valentina", "Valentine", "Valerie", "Vallie", "Van", "Vance", "Vanessa", "Vaughn", "Veda", "Velda", "Vella", "Velma", "Velva", "Vena", "Verda", "Verdie", "Vergie", "Verla", "Verlie", "Vern", "Verna", "Verner", "Vernice", "Vernie", "Vernon", "Verona", "Veronica", "Vesta", "Vicenta", "Vicente", "Vickie", "Vicky", "Victor", "Victoria", "Vida", "Vidal", "Vilma", "Vince", "Vincent", "Vincenza", "Vincenzo", "Vinnie", "Viola", "Violet", "Violette", "Virgie", "Virgil", "Virginia", "Virginie", "Vita", "Vito", "Viva", "Vivian", "Viviane", "Vivianne", "Vivien", "Vivienne", "Vladimir", "Wade", "Waino", "Waldo", "Walker", "Wallace", "Walter", "Walton", "Wanda", "Ward", "Warren", "Watson", "Wava", "Waylon", "Wayne", "Webster", "Weldon", "Wellington", "Wendell", "Wendy", "Werner", "Westley", "Weston", "Whitney", "Wilber", "Wilbert", "Wilburn", "Wiley", "Wilford", "Wilfred", "Wilfredo", "Wilfrid", "Wilhelm", "Wilhelmine", "Will", "Willa", "Willard", "William", "Willie", "Willis", "Willow", "Willy", "Wilma", "Wilmer", "Wilson", "Wilton", "Winfield", "Winifred", "Winnifred", "Winona", "Winston", "Woodrow", "Wyatt", "Wyman", "Xander", "Xavier", "Xzavier", "Yadira", "Yasmeen", "Yasmin", "Yasmine", "Yazmin", "Yesenia", "Yessenia", "Yolanda", "Yoshiko", "Yvette", "Yvonne", "Zachariah", "Zachary", "Zachery", "Zack", "Zackary", "Zackery", "Zakary", "Zander", "Zane", "Zaria", "Zechariah", "Zelda", "Zella", "Zelma", "Zena", "Zetta", "Zion", "Zita", "Zoe", "Zoey", "Zoie", "Zoila", "Zola", "Zora", "Zula"], female: ["Ada", "Adrienne", "Agnes", "Alberta", "Alexandra", "Alexis", "Alice", "Alicia", "Alison", "Allison", "Alma", "Alyssa", "Amanda", "Amber", "Amelia", "Amy", "Ana", "Andrea", "Angel", "Angela", "Angelica", "Angelina", "Angie", "Anita", "Ann", "Anna", "Anne", "Annette", "Annie", "Antoinette", "Antonia", "April", "Arlene", "Ashley", "Audrey", "Barbara", "Beatrice", "Becky", "Belinda", "Bernadette", "Bernice", "Bertha", "Bessie", "Beth", "Bethany", "Betsy", "Betty", "Beulah", "Beverly", "Billie", "Blanca", "Blanche", "Bobbie", "Bonnie", "Brandi", "Brandy", "Brenda", "Bridget", "Brittany", "Brooke", "Camille", "Candace", "Candice", "Carla", "Carmen", "Carol", "Carole", "Caroline", "Carolyn", "Carrie", "Casey", "Cassandra", "Catherine", "Cathy", "Cecelia", "Cecilia", "Celia", "Charlene", "Charlotte", "Chelsea", "Cheryl", "Christie", "Christina", "Christine", "Christy", "Cindy", "Claire", "Clara", "Claudia", "Colleen", "Connie", "Constance", "Cora", "Courtney", "Cristina", "Crystal", "Cynthia", "Daisy", "Dana", "Danielle", "Darla", "Darlene", "Dawn", "Deanna", "Debbie", "Deborah", "Debra", "Delia", "Della", "Delores", "Denise", "Desiree", "Diana", "Diane", "Dianna", "Dianne", "Dixie", "Dolores", "Donna", "Dora", "Doreen", "Doris", "Dorothy", "Ebony", "Edith", "Edna", "Eileen", "Elaine", "Eleanor", "Elena", "Elisa", "Elizabeth", "Ella", "Ellen", "Eloise", "Elsa", "Elsie", "Elvira", "Emily", "Emma", "Erica", "Erika", "Erin", "Erma", "Ernestine", "Essie", "Estelle", "Esther", "Ethel", "Eula", "Eunice", "Eva", "Evelyn", "Faith", "Fannie", "Faye", "Felicia", "Flora", "Florence", "Frances", "Francis", "Freda", "Gail", "Gayle", "Geneva", "Genevieve", "Georgia", "Geraldine", "Gertrude", "Gina", "Ginger", "Gladys", "Glenda", "Gloria", "Grace", "Gretchen", "Guadalupe", "Gwen", "Gwendolyn", "Hannah", "Harriet", "Hattie", "Hazel", "Heather", "Heidi", "Helen", "Henrietta", "Hilda", "Holly", "Hope", "Ida", "Inez", "Irene", "Iris", "Irma", "Isabel", "Jackie", "Jacqueline", "Jacquelyn", "Jaime", "Jamie", "Jan", "Jana", "Jane", "Janet", "Janice", "Janie", "Janis", "Jasmine", "Jean", "Jeanette", "Jeanne", "Jeannette", "Jeannie", "Jenna", "Jennie", "Jennifer", "Jenny", "Jessica", "Jessie", "Jill", "Jo", "Joan", "Joann", "Joanna", "Joanne", "Jodi", "Jody", "Johanna", "Johnnie", "Josefina", "Josephine", "Joy", "Joyce", "Juana", "Juanita", "Judith", "Judy", "Julia", "Julie", "June", "Kara", "Karen", "Kari", "Karla", "Kate", "Katherine", "Kathleen", "Kathryn", "Kathy", "Katie", "Katrina", "Kay", "Kayla", "Kelley", "Kelli", "Kellie", "Kelly", "Kendra", "Kerry", "Kim", "Kimberly", "Krista", "Kristen", "Kristi", "Kristie", "Kristin", "Kristina", "Kristine", "Kristy", "Krystal", "Lana", "Latoya", "Laura", "Lauren", "Laurie", "Laverne", "Leah", "Lee", "Leigh", "Lela", "Lena", "Leona", "Leslie", "Leticia", "Lila", "Lillian", "Lillie", "Linda", "Lindsay", "Lindsey", "Lisa", "Lois", "Lola", "Lora", "Lorena", "Lorene", "Loretta", "Lori", "Lorraine", "Louise", "Lucia", "Lucille", "Lucy", "Lula", "Luz", "Lydia", "Lynda", "Lynette", "Lynn", "Lynne", "Mabel", "Mable", "Madeline", "Mae", "Maggie", "Mamie", "Mandy", "Marcella", "Marcia", "Margaret", "Margarita", "Margie", "Marguerite", "Maria", "Marian", "Marianne", "Marie", "Marilyn", "Marion", "Marjorie", "Marlene", "Marsha", "Marta", "Martha", "Mary", "Maryann", "Mattie", "Maureen", "Maxine", "May", "Megan", "Meghan", "Melanie", "Melba", "Melinda", "Melissa", "Melody", "Mercedes", "Meredith", "Michele", "Michelle", "Mildred", "Mindy", "Minnie", "Miranda", "Miriam", "Misty", "Molly", "Mona", "Monica", "Monique", "Muriel", "Myra", "Myrtle", "Nadine", "Nancy", "Naomi", "Natalie", "Natasha", "Nellie", "Nettie", "Nichole", "Nicole", "Nina", "Nora", "Norma", "Olga", "Olive", "Olivia", "Ollie", "Opal", "Ora", "Pam", "Pamela", "Pat", "Patricia", "Patsy", "Patti", "Patty", "Paula", "Paulette", "Pauline", "Pearl", "Peggy", "Penny", "Phyllis", "Priscilla", "Rachael", "Rachel", "Ramona", "Raquel", "Rebecca", "Regina", "Renee", "Rhonda", "Rita", "Roberta", "Robin", "Robyn", "Rochelle", "Rosa", "Rosalie", "Rose", "Rosemarie", "Rosemary", "Rosie", "Roxanne", "Ruby", "Ruth", "Sabrina", "Sadie", "Sally", "Samantha", "Sandra", "Sandy", "Sara", "Sarah", "Shannon", "Shari", "Sharon", "Shawna", "Sheila", "Shelia", "Shelley", "Shelly", "Sheri", "Sherri", "Sherry", "Sheryl", "Shirley", "Silvia", "Sonia", "Sonja", "Sonya", "Sophia", "Sophie", "Stacey", "Stacy", "Stella", "Stephanie", "Sue", "Susan", "Susie", "Suzanne", "Sylvia", "Tabitha", "Tamara", "Tami", "Tammy", "Tanya", "Tara", "Tasha", "Teresa", "Teri", "Terri", "Terry", "Thelma", "Theresa", "Tiffany", "Tina", "Toni", "Tonya", "Tracey", "Traci", "Tracy", "Tricia", "Valerie", "Vanessa", "Velma", "Vera", "Verna", "Veronica", "Vicki", "Vickie", "Vicky", "Victoria", "Viola", "Violet", "Virginia", "Vivian", "Wanda", "Wendy", "Whitney", "Willie", "Wilma", "Winifred", "Yolanda", "Yvette", "Yvonne"], male: ["Aaron", "Abel", "Abraham", "Adam", "Adrian", "Al", "Alan", "Albert", "Alberto", "Alejandro", "Alex", "Alexander", "Alfonso", "Alfred", "Alfredo", "Allan", "Allen", "Alonzo", "Alton", "Alvin", "Amos", "Andre", "Andres", "Andrew", "Andy", "Angel", "Angelo", "Anthony", "Antonio", "Archie", "Armando", "Arnold", "Arthur", "Arturo", "Aubrey", "Austin", "Barry", "Ben", "Benjamin", "Bennie", "Benny", "Bernard", "Bert", "Bill", "Billy", "Blake", "Bob", "Bobby", "Boyd", "Brad", "Bradford", "Bradley", "Brandon", "Brendan", "Brent", "Brett", "Brian", "Bruce", "Bryan", "Bryant", "Byron", "Caleb", "Calvin", "Cameron", "Carl", "Carlos", "Carlton", "Carroll", "Cary", "Casey", "Cecil", "Cedric", "Cesar", "Chad", "Charles", "Charlie", "Chester", "Chris", "Christian", "Christopher", "Clarence", "Clark", "Claude", "Clay", "Clayton", "Clifford", "Clifton", "Clint", "Clinton", "Clyde", "Cody", "Colin", "Conrad", "Corey", "Cornelius", "Cory", "Courtney", "Craig", "Curtis", "Dale", "Dallas", "Damon", "Dan", "Dana", "Daniel", "Danny", "Darin", "Darnell", "Darrel", "Darrell", "Darren", "Darrin", "Darryl", "Daryl", "Dave", "David", "Dean", "Delbert", "Dennis", "Derek", "Derrick", "Devin", "Dewey", "Dexter", "Domingo", "Dominic", "Dominick", "Don", "Donald", "Donnie", "Doug", "Douglas", "Doyle", "Drew", "Duane", "Dustin", "Dwayne", "Dwight", "Earl", "Earnest", "Ed", "Eddie", "Edgar", "Edmond", "Edmund", "Eduardo", "Edward", "Edwin", "Elbert", "Elias", "Elijah", "Ellis", "Elmer", "Emanuel", "Emilio", "Emmett", "Enrique", "Eric", "Erick", "Erik", "Ernest", "Ernesto", "Ervin", "Eugene", "Evan", "Everett", "Felipe", "Felix", "Fernando", "Floyd", "Forrest", "Francis", "Francisco", "Frank", "Frankie", "Franklin", "Fred", "Freddie", "Frederick", "Fredrick", "Gabriel", "Garrett", "Garry", "Gary", "Gene", "Geoffrey", "George", "Gerald", "Gerard", "Gerardo", "Gilbert", "Gilberto", "Glen", "Glenn", "Gordon", "Grady", "Grant", "Greg", "Gregg", "Gregory", "Guadalupe", "Guillermo", "Gustavo", "Guy", "Harold", "Harry", "Harvey", "Hector", "Henry", "Herbert", "Herman", "Homer", "Horace", "Howard", "Hubert", "Hugh", "Hugo", "Ian", "Ignacio", "Ira", "Irvin", "Irving", "Isaac", "Ismael", "Israel", "Ivan", "Jack", "Jackie", "Jacob", "Jaime", "Jake", "James", "Jamie", "Jan", "Jared", "Jason", "Javier", "Jay", "Jean", "Jeff", "Jeffery", "Jeffrey", "Jerald", "Jeremiah", "Jeremy", "Jermaine", "Jerome", "Jerry", "Jesse", "Jessie", "Jesus", "Jim", "Jimmie", "Jimmy", "Jody", "Joe", "Joel", "Joey", "John", "Johnathan", "Johnnie", "Johnny", "Jon", "Jonathan", "Jonathon", "Jordan", "Jorge", "Jose", "Joseph", "Josh", "Joshua", "Juan", "Julian", "Julio", "Julius", "Justin", "Karl", "Keith", "Kelly", "Kelvin", "Ken", "Kenneth", "Kenny", "Kent", "Kerry", "Kevin", "Kim", "Kirk", "Kristopher", "Kurt", "Kyle", "Lamar", "Lance", "Larry", "Laurence", "Lawrence", "Lee", "Leland", "Leo", "Leon", "Leonard", "Leroy", "Leslie", "Lester", "Levi", "Lewis", "Lionel", "Lloyd", "Lonnie", "Loren", "Lorenzo", "Louis", "Lowell", "Lucas", "Luis", "Luke", "Luther", "Lyle", "Lynn", "Mack", "Malcolm", "Manuel", "Marc", "Marco", "Marcos", "Marcus", "Mario", "Marion", "Mark", "Marlon", "Marshall", "Martin", "Marty", "Marvin", "Mathew", "Matt", "Matthew", "Maurice", "Max", "Melvin", "Merle", "Michael", "Micheal", "Miguel", "Mike", "Milton", "Mitchell", "Morris", "Moses", "Myron", "Nathan", "Nathaniel", "Neal", "Neil", "Nelson", "Nicholas", "Nick", "Nicolas", "Noah", "Noel", "Norman", "Oliver", "Omar", "Orlando", "Orville", "Oscar", "Otis", "Owen", "Pablo", "Pat", "Patrick", "Paul", "Pedro", "Percy", "Perry", "Pete", "Peter", "Phil", "Philip", "Phillip", "Preston", "Rafael", "Ralph", "Ramiro", "Ramon", "Randal", "Randall", "Randolph", "Randy", "Raul", "Ray", "Raymond", "Reginald", "Rene", "Rex", "Ricardo", "Richard", "Rick", "Rickey", "Ricky", "Robert", "Roberto", "Robin", "Roderick", "Rodney", "Rodolfo", "Rogelio", "Roger", "Roland", "Rolando", "Roman", "Ron", "Ronald", "Ronnie", "Roosevelt", "Ross", "Roy", "Ruben", "Rudolph", "Rudy", "Rufus", "Russell", "Ryan", "Salvador", "Salvatore", "Sam", "Sammy", "Samuel", "Santiago", "Santos", "Saul", "Scott", "Sean", "Sergio", "Seth", "Shane", "Shannon", "Shaun", "Shawn", "Sheldon", "Sherman", "Sidney", "Simon", "Spencer", "Stanley", "Stephen", "Steve", "Steven", "Stewart", "Stuart", "Sylvester", "Taylor", "Ted", "Terence", "Terrance", "Terrell", "Terrence", "Terry", "Theodore", "Thomas", "Tim", "Timmy", "Timothy", "Toby", "Todd", "Tom", "Tomas", "Tommie", "Tommy", "Tony", "Tracy", "Travis", "Trevor", "Troy", "Tyler", "Tyrone", "Van", "Vernon", "Victor", "Vincent", "Virgil", "Wade", "Wallace", "Walter", "Warren", "Wayne", "Wendell", "Wesley", "Wilbert", "Wilbur", "Wilfred", "Willard", "William", "Willie", "Willis", "Wilson", "Winston", "Wm", "Woodrow", "Zachary"] };
var ua = ["Agender", "Androgyne", "Androgynous", "Bigender", "Cis female", "Cis male", "Cis man", "Cis woman", "Cis", "Cisgender female", "Cisgender male", "Cisgender man", "Cisgender woman", "Cisgender", "Demi-boy", "Demi-girl", "Demi-man", "Demi-woman", "Demiflux", "Demigender", "F2M", "FTM", "Female to male trans man", "Female to male transgender man", "Female to male transsexual man", "Female to male", "Gender fluid", "Gender neutral", "Gender nonconforming", "Gender questioning", "Gender variant", "Genderflux", "Genderqueer", "Hermaphrodite", "Intersex man", "Intersex person", "Intersex woman", "Intersex", "M2F", "MTF", "Male to female trans woman", "Male to female transgender woman", "Male to female transsexual woman", "Male to female", "Man", "Multigender", "Neither", "Neutrois", "Non-binary", "Omnigender", "Other", "Pangender", "Polygender", "T* man", "T* woman", "Trans female", "Trans male", "Trans man", "Trans person", "Trans woman", "Trans", "Transsexual female", "Transsexual male", "Transsexual man", "Transsexual person", "Transsexual woman", "Transsexual", "Transgender female", "Transgender person", "Transmasculine", "Trigender", "Two* person", "Two-spirit person", "Two-spirit", "Woman", "Xenogender"];
var ca = ["Solutions", "Program", "Brand", "Security", "Research", "Marketing", "Directives", "Implementation", "Integration", "Functionality", "Response", "Paradigm", "Tactics", "Identity", "Markets", "Group", "Division", "Applications", "Optimization", "Operations", "Infrastructure", "Intranet", "Communications", "Web", "Branding", "Quality", "Assurance", "Mobility", "Accounts", "Data", "Creative", "Configuration", "Accountability", "Interactions", "Factors", "Usability", "Metrics"];
var ma = ["Lead", "Senior", "Direct", "Corporate", "Dynamic", "Future", "Product", "National", "Regional", "District", "Central", "Global", "Customer", "Investor", "International", "Legacy", "Forward", "Internal", "Human", "Chief", "Principal"];
var ha = ["{{person.jobDescriptor}} {{person.jobArea}} {{person.jobType}}"];
var ya = ["Supervisor", "Associate", "Executive", "Liaison", "Officer", "Manager", "Engineer", "Specialist", "Director", "Coordinator", "Administrator", "Architect", "Analyst", "Designer", "Planner", "Orchestrator", "Technician", "Developer", "Producer", "Consultant", "Assistant", "Facilitator", "Agent", "Representative", "Strategist"];
var pa = { generic: ["Abbott", "Abernathy", "Abshire", "Adams", "Altenwerth", "Anderson", "Ankunding", "Armstrong", "Auer", "Aufderhar", "Bahringer", "Bailey", "Balistreri", "Barrows", "Bartell", "Bartoletti", "Barton", "Bashirian", "Batz", "Bauch", "Baumbach", "Bayer", "Beahan", "Beatty", "Bechtelar", "Becker", "Bednar", "Beer", "Beier", "Berge", "Bergnaum", "Bergstrom", "Bernhard", "Bernier", "Bins", "Blanda", "Blick", "Block", "Bode", "Boehm", "Bogan", "Bogisich", "Borer", "Bosco", "Botsford", "Boyer", "Boyle", "Bradtke", "Brakus", "Braun", "Breitenberg", "Brekke", "Brown", "Bruen", "Buckridge", "Carroll", "Carter", "Cartwright", "Casper", "Cassin", "Champlin", "Christiansen", "Cole", "Collier", "Collins", "Conn", "Connelly", "Conroy", "Considine", "Corkery", "Cormier", "Corwin", "Cremin", "Crist", "Crona", "Cronin", "Crooks", "Cruickshank", "Cummerata", "Cummings", "D'Amore", "Dach", "Daniel", "Dare", "Daugherty", "Davis", "Deckow", "Denesik", "Dibbert", "Dickens", "Dicki", "Dickinson", "Dietrich", "Donnelly", "Dooley", "Douglas", "Doyle", "DuBuque", "Durgan", "Ebert", "Effertz", "Emard", "Emmerich", "Erdman", "Ernser", "Fadel", "Fahey", "Farrell", "Fay", "Feeney", "Feest", "Feil", "Ferry", "Fisher", "Flatley", "Frami", "Franecki", "Franey", "Friesen", "Fritsch", "Funk", "Gerhold", "Gerlach", "Gibson", "Gislason", "Gleason", "Gleichner", "Glover", "Goldner", "Goodwin", "Gorczany", "Gottlieb", "Goyette", "Grady", "Graham", "Grant", "Green", "Greenfelder", "Greenholt", "Grimes", "Gulgowski", "Gusikowski", "Gutkowski", "Gutmann", "Haag", "Hackett", "Hagenes", "Hahn", "Haley", "Halvorson", "Hamill", "Hammes", "Hand", "Hane", "Hansen", "Harber", "Harris", "Hartmann", "Harvey", "Hauck", "Hayes", "Heaney", "Heathcote", "Hegmann", "Heidenreich", "Heller", "Herman", "Hermann", "Hermiston", "Herzog", "Hessel", "Hettinger", "Hickle", "Hilll", "Hills", "Hilpert", "Hintz", "Hirthe", "Hodkiewicz", "Hoeger", "Homenick", "Hoppe", "Howe", "Howell", "Hudson", "Huel", "Huels", "Hyatt", "Jacobi", "Jacobs", "Jacobson", "Jakubowski", "Jaskolski", "Jast", "Jenkins", "Jerde", "Johns", "Johnson", "Johnston", "Jones", "Kassulke", "Kautzer", "Keebler", "Keeling", "Kemmer", "Kerluke", "Kertzmann", "Kessler", "Kiehn", "Kihn", "Kilback", "King", "Kirlin", "Klein", "Kling", "Klocko", "Koch", "Koelpin", "Koepp", "Kohler", "Konopelski", "Koss", "Kovacek", "Kozey", "Krajcik", "Kreiger", "Kris", "Kshlerin", "Kub", "Kuhic", "Kuhlman", "Kuhn", "Kulas", "Kunde", "Kunze", "Kuphal", "Kutch", "Kuvalis", "Labadie", "Lakin", "Lang", "Langosh", "Langworth", "Larkin", "Larson", "Leannon", "Lebsack", "Ledner", "Leffler", "Legros", "Lehner", "Lemke", "Lesch", "Leuschke", "Lind", "Lindgren", "Littel", "Little", "Lockman", "Lowe", "Lubowitz", "Lueilwitz", "Luettgen", "Lynch", "MacGyver", "Macejkovic", "Maggio", "Mann", "Mante", "Marks", "Marquardt", "Marvin", "Mayer", "Mayert", "McClure", "McCullough", "McDermott", "McGlynn", "McKenzie", "McLaughlin", "Medhurst", "Mertz", "Metz", "Miller", "Mills", "Mitchell", "Moen", "Mohr", "Monahan", "Moore", "Morar", "Morissette", "Mosciski", "Mraz", "Mueller", "Muller", "Murazik", "Murphy", "Murray", "Nader", "Nicolas", "Nienow", "Nikolaus", "Nitzsche", "Nolan", "O'Connell", "O'Conner", "O'Hara", "O'Keefe", "O'Kon", "O'Reilly", "Oberbrunner", "Okuneva", "Olson", "Ondricka", "Orn", "Ortiz", "Osinski", "Pacocha", "Padberg", "Pagac", "Parisian", "Parker", "Paucek", "Pfannerstill", "Pfeffer", "Pollich", "Pouros", "Powlowski", "Predovic", "Price", "Prohaska", "Prosacco", "Purdy", "Quigley", "Quitzon", "Rath", "Ratke", "Rau", "Raynor", "Reichel", "Reichert", "Reilly", "Reinger", "Rempel", "Renner", "Reynolds", "Rice", "Rippin", "Ritchie", "Robel", "Roberts", "Rodriguez", "Rogahn", "Rohan", "Rolfson", "Romaguera", "Roob", "Rosenbaum", "Rowe", "Ruecker", "Runolfsdottir", "Runolfsson", "Runte", "Russel", "Rutherford", "Ryan", "Sanford", "Satterfield", "Sauer", "Sawayn", "Schaden", "Schaefer", "Schamberger", "Schiller", "Schimmel", "Schinner", "Schmeler", "Schmidt", "Schmitt", "Schneider", "Schoen", "Schowalter", "Schroeder", "Schulist", "Schultz", "Schumm", "Schuppe", "Schuster", "Senger", "Shanahan", "Shields", "Simonis", "Sipes", "Skiles", "Smith", "Smitham", "Spencer", "Spinka", "Sporer", "Stamm", "Stanton", "Stark", "Stehr", "Steuber", "Stiedemann", "Stokes", "Stoltenberg", "Stracke", "Streich", "Stroman", "Strosin", "Swaniawski", "Swift", "Terry", "Thiel", "Thompson", "Tillman", "Torp", "Torphy", "Towne", "Toy", "Trantow", "Tremblay", "Treutel", "Tromp", "Turcotte", "Turner", "Ullrich", "Upton", "Vandervort", "Veum", "Volkman", "Von", "VonRueden", "Waelchi", "Walker", "Walsh", "Walter", "Ward", "Waters", "Watsica", "Weber", "Wehner", "Weimann", "Weissnat", "Welch", "West", "White", "Wiegand", "Wilderman", "Wilkinson", "Will", "Williamson", "Willms", "Windler", "Wintheiser", "Wisoky", "Wisozk", "Witting", "Wiza", "Wolf", "Wolff", "Wuckert", "Wunsch", "Wyman", "Yost", "Yundt", "Zboncak", "Zemlak", "Ziemann", "Zieme", "Zulauf"] };
var ga = { generic: [{ value: "{{person.last_name.generic}}", weight: 95 }, { value: "{{person.last_name.generic}}-{{person.last_name.generic}}", weight: 5 }] };
var ba = { generic: ["Addison", "Alex", "Anderson", "Angel", "Arden", "August", "Austin", "Avery", "Bailey", "Billie", "Blake", "Bowie", "Brooklyn", "Cameron", "Charlie", "Corey", "Dakota", "Drew", "Elliott", "Ellis", "Emerson", "Finley", "Gray", "Greer", "Harper", "Hayden", "Jaden", "James", "Jamie", "Jordan", "Jules", "Kai", "Kendall", "Kennedy", "Kyle", "Leslie", "Logan", "London", "Marlowe", "Micah", "Nico", "Noah", "North", "Parker", "Phoenix", "Quinn", "Reagan", "Reese", "Reign", "Riley", "River", "Robin", "Rory", "Rowan", "Ryan", "Sage", "Sasha", "Sawyer", "Shawn", "Shiloh", "Skyler", "Taylor"], female: ["Abigail", "Adele", "Alex", "Alice", "Alisha", "Amber", "Amelia", "Amora", "Ana\xEFs", "Angelou", "Anika", "Anise", "Annabel", "Anne", "Aphrodite", "Aretha", "Arya", "Ashton", "Aster", "Audrey", "Avery", "Bailee", "Bay", "Belle", "Beth", "Billie", "Blair", "Blaise", "Blake", "Blanche", "Blue", "Bree", "Brielle", "Brienne", "Brooke", "Caleen", "Candice", "Caprice", "Carelyn", "Caylen", "Celine", "Cerise", "Cia", "Claire", "Claudia", "Clementine", "Coral", "Coraline", "Dahlia", "Dakota", "Dawn", "Della", "Demi", "Denise", "Denver", "Devine", "Devon", "Diana", "Dylan", "Ebony", "Eden", "Eleanor", "Elein", "Elizabeth", "Ellen", "Elodie", "Eloise", "Ember", "Emma", "Erin", "Eyre", "Faith", "Farrah", "Fawn", "Fayre", "Fern", "France", "Francis", "Frida", "Genisis", "Georgia", "Grace", "Gwen", "Harley", "Harper", "Hazel", "Helen", "Hippolyta", "Holly", "Hope", "Imani", "Iowa", "Ireland", "Irene", "Iris", "Isa", "Isla", "Ivy", "Jade", "Jane", "Jazz", "Jean", "Jess", "Jett", "Jo", "Joan", "Jolie", "Jordan", "Josie", "Journey", "Joy", "Jules", "Julien", "Juliet", "Juniper", "Justice", "Kali", "Karma", "Kat", "Kate", "Kennedy", "Keva", "Kylie", "Lake", "Lane", "Lark", "Layla", "Lee", "Leigh", "Leona", "Lexi", "London", "Lou", "Louise", "Love", "Luna", "Lux", "Lynn", "Lyric", "Maddie", "Mae", "Marie", "Matilda", "Maude", "Maybel", "Meadow", "Medusa", "Mercy", "Michelle", "Mirabel", "Monroe", "Morgan", "Nalia", "Naomi", "Nova", "Olive", "Paige", "Parker", "Pax", "Pearl", "Penelope", "Phoenix", "Quinn", "Rae", "Rain", "Raven", "Ray", "Raye", "Rebel", "Reese", "Reeve", "Regan", "Riley", "River", "Robin", "Rory", "Rose", "Royal", "Ruth", "Rylie", "Sage", "Sam", "Saturn", "Scout", "Serena", "Sky", "Skylar", "Sofia", "Sophia", "Storm", "Sue", "Suzanne", "Sydney", "Taylen", "Taylor", "Teagan", "Tempest", "Tenley", "Thea", "Trinity", "Valerie", "Venus", "Vera", "Violet", "Willow", "Winter", "Xena", "Zaylee", "Zion", "Zoe"], male: ["Ace", "Aiden", "Alexander", "Ander", "Anthony", "Asher", "August", "Aziel", "Bear", "Beckham", "Benjamin", "Buddy", "Calvin", "Carter", "Charles", "Christopher", "Clyde", "Cooper", "Daniel", "David", "Dior", "Dylan", "Elijah", "Ellis", "Emerson", "Ethan", "Ezra", "Fletcher", "Flynn", "Gabriel", "Grayson", "Gus", "Hank", "Harrison", "Hendrix", "Henry", "Houston", "Hudson", "Hugh", "Isaac", "Jack", "Jackson", "Jacob", "Jakobe", "James", "Jaxon", "Jaxtyn", "Jayden", "John", "Joseph", "Josiah", "Jude", "Julian", "Karsyn", "Kenji", "Kobe", "Kylo", "Lennon", "Leo", "Levi", "Liam", "Lincoln", "Logan", "Louis", "Lucas", "Lucky", "Luke", "Mason", "Mateo", "Matthew", "Maverick", "Michael", "Monroe", "Nixon", "Ocean", "Oliver", "Otis", "Otto", "Owen", "Ozzy", "Parker", "Rocky", "Samuel", "Sebastian", "Sonny", "Teddy", "Theo", "Theodore", "Thomas", "Truett", "Walter", "Warren", "Watson", "William", "Wison", "Wyatt", "Ziggy", "Zyair"] };
var Ca = [{ value: "{{person.firstName}} {{person.lastName}}", weight: 49 }, { value: "{{person.prefix}} {{person.firstName}} {{person.lastName}}", weight: 7 }, { value: "{{person.firstName}} {{person.lastName}} {{person.suffix}}", weight: 7 }, { value: "{{person.prefix}} {{person.firstName}} {{person.lastName}} {{person.suffix}}", weight: 1 }];
var Sa = { generic: ["Dr.", "Miss", "Mr.", "Mrs.", "Ms."], female: ["Dr.", "Miss", "Mrs.", "Ms."], male: ["Dr.", "Mr."] };
var ka = ["female", "male"];
var fa = ["Jr.", "Sr.", "I", "II", "III", "IV", "V", "MD", "DDS", "PhD", "DVM"];
var va = ["Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn"];
var yr = { bio_part: ta, bio_pattern: la, bio_supporter: sa, first_name: da, gender: ua, job_area: ca, job_descriptor: ma, job_title_pattern: ha, job_type: ya, last_name: pa, last_name_pattern: ga, middle_name: ba, name: Ca, prefix: Sa, sex: ka, suffix: fa, western_zodiac_sign: va };
var Aa = yr;
var Ba = ["!##-!##-####", "(!##) !##-####", "1-!##-!##-####", "!##.!##.####", "!##-!##-#### x###", "(!##) !##-#### x###", "1-!##-!##-#### x###", "!##.!##.#### x###", "!##-!##-#### x####", "(!##) !##-#### x####", "1-!##-!##-#### x####", "!##.!##.#### x####", "!##-!##-#### x#####", "(!##) !##-#### x#####", "1-!##-!##-#### x#####", "!##.!##.#### x#####"];
var Ta = ["+1!##!######"];
var Ma = ["(!##) !##-####"];
var pr = { human: Ba, international: Ta, national: Ma };
var wa = pr;
var gr = { format: wa };
var La = gr;
var Da = [{ symbol: "H", name: "Hydrogen", atomicNumber: 1 }, { symbol: "He", name: "Helium", atomicNumber: 2 }, { symbol: "Li", name: "Lithium", atomicNumber: 3 }, { symbol: "Be", name: "Beryllium", atomicNumber: 4 }, { symbol: "B", name: "Boron", atomicNumber: 5 }, { symbol: "C", name: "Carbon", atomicNumber: 6 }, { symbol: "N", name: "Nitrogen", atomicNumber: 7 }, { symbol: "O", name: "Oxygen", atomicNumber: 8 }, { symbol: "F", name: "Fluorine", atomicNumber: 9 }, { symbol: "Ne", name: "Neon", atomicNumber: 10 }, { symbol: "Na", name: "Sodium", atomicNumber: 11 }, { symbol: "Mg", name: "Magnesium", atomicNumber: 12 }, { symbol: "Al", name: "Aluminium", atomicNumber: 13 }, { symbol: "Si", name: "Silicon", atomicNumber: 14 }, { symbol: "P", name: "Phosphorus", atomicNumber: 15 }, { symbol: "S", name: "Sulfur", atomicNumber: 16 }, { symbol: "Cl", name: "Chlorine", atomicNumber: 17 }, { symbol: "Ar", name: "Argon", atomicNumber: 18 }, { symbol: "K", name: "Potassium", atomicNumber: 19 }, { symbol: "Ca", name: "Calcium", atomicNumber: 20 }, { symbol: "Sc", name: "Scandium", atomicNumber: 21 }, { symbol: "Ti", name: "Titanium", atomicNumber: 22 }, { symbol: "V", name: "Vanadium", atomicNumber: 23 }, { symbol: "Cr", name: "Chromium", atomicNumber: 24 }, { symbol: "Mn", name: "Manganese", atomicNumber: 25 }, { symbol: "Fe", name: "Iron", atomicNumber: 26 }, { symbol: "Co", name: "Cobalt", atomicNumber: 27 }, { symbol: "Ni", name: "Nickel", atomicNumber: 28 }, { symbol: "Cu", name: "Copper", atomicNumber: 29 }, { symbol: "Zn", name: "Zinc", atomicNumber: 30 }, { symbol: "Ga", name: "Gallium", atomicNumber: 31 }, { symbol: "Ge", name: "Germanium", atomicNumber: 32 }, { symbol: "As", name: "Arsenic", atomicNumber: 33 }, { symbol: "Se", name: "Selenium", atomicNumber: 34 }, { symbol: "Br", name: "Bromine", atomicNumber: 35 }, { symbol: "Kr", name: "Krypton", atomicNumber: 36 }, { symbol: "Rb", name: "Rubidium", atomicNumber: 37 }, { symbol: "Sr", name: "Strontium", atomicNumber: 38 }, { symbol: "Y", name: "Yttrium", atomicNumber: 39 }, { symbol: "Zr", name: "Zirconium", atomicNumber: 40 }, { symbol: "Nb", name: "Niobium", atomicNumber: 41 }, { symbol: "Mo", name: "Molybdenum", atomicNumber: 42 }, { symbol: "Tc", name: "Technetium", atomicNumber: 43 }, { symbol: "Ru", name: "Ruthenium", atomicNumber: 44 }, { symbol: "Rh", name: "Rhodium", atomicNumber: 45 }, { symbol: "Pd", name: "Palladium", atomicNumber: 46 }, { symbol: "Ag", name: "Silver", atomicNumber: 47 }, { symbol: "Cd", name: "Cadmium", atomicNumber: 48 }, { symbol: "In", name: "Indium", atomicNumber: 49 }, { symbol: "Sn", name: "Tin", atomicNumber: 50 }, { symbol: "Sb", name: "Antimony", atomicNumber: 51 }, { symbol: "Te", name: "Tellurium", atomicNumber: 52 }, { symbol: "I", name: "Iodine", atomicNumber: 53 }, { symbol: "Xe", name: "Xenon", atomicNumber: 54 }, { symbol: "Cs", name: "Caesium", atomicNumber: 55 }, { symbol: "Ba", name: "Barium", atomicNumber: 56 }, { symbol: "La", name: "Lanthanum", atomicNumber: 57 }, { symbol: "Ce", name: "Cerium", atomicNumber: 58 }, { symbol: "Pr", name: "Praseodymium", atomicNumber: 59 }, { symbol: "Nd", name: "Neodymium", atomicNumber: 60 }, { symbol: "Pm", name: "Promethium", atomicNumber: 61 }, { symbol: "Sm", name: "Samarium", atomicNumber: 62 }, { symbol: "Eu", name: "Europium", atomicNumber: 63 }, { symbol: "Gd", name: "Gadolinium", atomicNumber: 64 }, { symbol: "Tb", name: "Terbium", atomicNumber: 65 }, { symbol: "Dy", name: "Dysprosium", atomicNumber: 66 }, { symbol: "Ho", name: "Holmium", atomicNumber: 67 }, { symbol: "Er", name: "Erbium", atomicNumber: 68 }, { symbol: "Tm", name: "Thulium", atomicNumber: 69 }, { symbol: "Yb", name: "Ytterbium", atomicNumber: 70 }, { symbol: "Lu", name: "Lutetium", atomicNumber: 71 }, { symbol: "Hf", name: "Hafnium", atomicNumber: 72 }, { symbol: "Ta", name: "Tantalum", atomicNumber: 73 }, { symbol: "W", name: "Tungsten", atomicNumber: 74 }, { symbol: "Re", name: "Rhenium", atomicNumber: 75 }, { symbol: "Os", name: "Osmium", atomicNumber: 76 }, { symbol: "Ir", name: "Iridium", atomicNumber: 77 }, { symbol: "Pt", name: "Platinum", atomicNumber: 78 }, { symbol: "Au", name: "Gold", atomicNumber: 79 }, { symbol: "Hg", name: "Mercury", atomicNumber: 80 }, { symbol: "Tl", name: "Thallium", atomicNumber: 81 }, { symbol: "Pb", name: "Lead", atomicNumber: 82 }, { symbol: "Bi", name: "Bismuth", atomicNumber: 83 }, { symbol: "Po", name: "Polonium", atomicNumber: 84 }, { symbol: "At", name: "Astatine", atomicNumber: 85 }, { symbol: "Rn", name: "Radon", atomicNumber: 86 }, { symbol: "Fr", name: "Francium", atomicNumber: 87 }, { symbol: "Ra", name: "Radium", atomicNumber: 88 }, { symbol: "Ac", name: "Actinium", atomicNumber: 89 }, { symbol: "Th", name: "Thorium", atomicNumber: 90 }, { symbol: "Pa", name: "Protactinium", atomicNumber: 91 }, { symbol: "U", name: "Uranium", atomicNumber: 92 }, { symbol: "Np", name: "Neptunium", atomicNumber: 93 }, { symbol: "Pu", name: "Plutonium", atomicNumber: 94 }, { symbol: "Am", name: "Americium", atomicNumber: 95 }, { symbol: "Cm", name: "Curium", atomicNumber: 96 }, { symbol: "Bk", name: "Berkelium", atomicNumber: 97 }, { symbol: "Cf", name: "Californium", atomicNumber: 98 }, { symbol: "Es", name: "Einsteinium", atomicNumber: 99 }, { symbol: "Fm", name: "Fermium", atomicNumber: 100 }, { symbol: "Md", name: "Mendelevium", atomicNumber: 101 }, { symbol: "No", name: "Nobelium", atomicNumber: 102 }, { symbol: "Lr", name: "Lawrencium", atomicNumber: 103 }, { symbol: "Rf", name: "Rutherfordium", atomicNumber: 104 }, { symbol: "Db", name: "Dubnium", atomicNumber: 105 }, { symbol: "Sg", name: "Seaborgium", atomicNumber: 106 }, { symbol: "Bh", name: "Bohrium", atomicNumber: 107 }, { symbol: "Hs", name: "Hassium", atomicNumber: 108 }, { symbol: "Mt", name: "Meitnerium", atomicNumber: 109 }, { symbol: "Ds", name: "Darmstadtium", atomicNumber: 110 }, { symbol: "Rg", name: "Roentgenium", atomicNumber: 111 }, { symbol: "Cn", name: "Copernicium", atomicNumber: 112 }, { symbol: "Nh", name: "Nihonium", atomicNumber: 113 }, { symbol: "Fl", name: "Flerovium", atomicNumber: 114 }, { symbol: "Mc", name: "Moscovium", atomicNumber: 115 }, { symbol: "Lv", name: "Livermorium", atomicNumber: 116 }, { symbol: "Ts", name: "Tennessine", atomicNumber: 117 }, { symbol: "Og", name: "Oganesson", atomicNumber: 118 }];
var Ra = [{ name: "meter", symbol: "m" }, { name: "second", symbol: "s" }, { name: "mole", symbol: "mol" }, { name: "ampere", symbol: "A" }, { name: "kelvin", symbol: "K" }, { name: "candela", symbol: "cd" }, { name: "kilogram", symbol: "kg" }, { name: "radian", symbol: "rad" }, { name: "hertz", symbol: "Hz" }, { name: "newton", symbol: "N" }, { name: "pascal", symbol: "Pa" }, { name: "joule", symbol: "J" }, { name: "watt", symbol: "W" }, { name: "coulomb", symbol: "C" }, { name: "volt", symbol: "V" }, { name: "ohm", symbol: "\u03A9" }, { name: "tesla", symbol: "T" }, { name: "degree Celsius", symbol: "\xB0C" }, { name: "lumen", symbol: "lm" }, { name: "becquerel", symbol: "Bq" }, { name: "gray", symbol: "Gy" }, { name: "sievert", symbol: "Sv" }, { name: "steradian", symbol: "sr" }, { name: "farad", symbol: "F" }, { name: "siemens", symbol: "S" }, { name: "weber", symbol: "Wb" }, { name: "henry", symbol: "H" }, { name: "lux", symbol: "lx" }, { name: "katal", symbol: "kat" }];
var br = { chemical_element: Da, unit: Ra };
var Pa = br;
var Ha = ["ants", "bats", "bears", "bees", "birds", "buffalo", "cats", "chickens", "cattle", "dogs", "dolphins", "ducks", "elephants", "fishes", "foxes", "frogs", "geese", "goats", "horses", "kangaroos", "lions", "monkeys", "owls", "oxen", "penguins", "people", "pigs", "rabbits", "sheep", "tigers", "whales", "wolves", "zebras", "banshees", "crows", "black cats", "chimeras", "ghosts", "conspirators", "dragons", "dwarves", "elves", "enchanters", "exorcists", "sons", "foes", "giants", "gnomes", "goblins", "gooses", "griffins", "lycanthropes", "nemesis", "ogres", "oracles", "prophets", "sorcerors", "spiders", "spirits", "vampires", "warlocks", "vixens", "werewolves", "witches", "worshipers", "zombies", "druids"];
var Wa = ["{{location.state}} {{team.creature}}"];
var Cr = { creature: Ha, name: Wa };
var Ga = Cr;
var Fa = ["Adventure Road Bicycle", "BMX Bicycle", "City Bicycle", "Cruiser Bicycle", "Cyclocross Bicycle", "Dual-Sport Bicycle", "Fitness Bicycle", "Flat-Foot Comfort Bicycle", "Folding Bicycle", "Hybrid Bicycle", "Mountain Bicycle", "Recumbent Bicycle", "Road Bicycle", "Tandem Bicycle", "Touring Bicycle", "Track/Fixed-Gear Bicycle", "Triathlon/Time Trial Bicycle", "Tricycle"];
var Na = ["Diesel", "Electric", "Gasoline", "Hybrid"];
var Ea = ["Aston Martin", "Audi", "BMW", "BYD", "Bentley", "Bugatti", "Cadillac", "Chevrolet", "Chrysler", "Citro\xEBn", "Dodge", "Ferrari", "Fiat", "Ford", "Honda", "Hyundai", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover", "MG", "Mahindra & Mahindra", "Maruti", "Maserati", "Mazda", "Mercedes Benz", "Mini", "Mitsubishi", "NIO", "Nissan", "Peugeot", "Polestar", "Porsche", "Renault", "Rivian", "Rolls Royce", "Skoda", "Smart", "Subaru", "Suzuki", "Tata", "Tesla", "Toyota", "Vauxhall", "Volkswagen", "Volvo"];
var Ja = ["1", "2", "911", "A4", "A8", "ATS", "Accord", "Alpine", "Altima", "Aventador", "Beetle", "CTS", "CX-9", "Camaro", "Camry", "Challenger", "Charger", "Civic", "Colorado", "Corvette", "Countach", "Cruze", "Durango", "El Camino", "Element", "Escalade", "Expedition", "Explorer", "F-150", "Fiesta", "Focus", "Fortwo", "Golf", "Grand Caravan", "Grand Cherokee", "Impala", "Jetta", "Land Cruiser", "LeBaron", "Malibu", "Mercielago", "Model 3", "Model S", "Model T", "Model X", "Model Y", "Mustang", "PT Cruiser", "Prius", "Ranchero", "Roadster", "Sentra", "Silverado", "Spyder", "Taurus", "V90", "Volt", "Wrangler", "XC90", "XTS"];
var Ia = ["Cargo Van", "Convertible", "Coupe", "Crew Cab Pickup", "Extended Cab Pickup", "Hatchback", "Minivan", "Passenger Van", "SUV", "Sedan", "Wagon"];
var Sr = { bicycle_type: Fa, fuel: Na, manufacturer: Ea, model: Ja, type: Ia };
var Ka = Sr;
var Oa = ["abandoned", "able", "acceptable", "acclaimed", "accomplished", "accurate", "aching", "acidic", "actual", "admired", "adolescent", "advanced", "affectionate", "afraid", "aged", "aggravating", "aggressive", "agile", "agitated", "agreeable", "ajar", "alarmed", "alert", "alienated", "alive", "all", "altruistic", "amazing", "ambitious", "ample", "amused", "angelic", "anguished", "animated", "annual", "another", "antique", "any", "apprehensive", "appropriate", "apt", "arid", "artistic", "ashamed", "assured", "astonishing", "athletic", "austere", "authentic", "authorized", "avaricious", "average", "aware", "awesome", "awful", "babyish", "back", "bad", "baggy", "bare", "basic", "beloved", "beneficial", "best", "better", "big", "biodegradable", "bitter", "black", "black-and-white", "blank", "blaring", "bleak", "blind", "blond", "blue", "blushing", "bogus", "boiling", "bony", "boring", "bossy", "both", "bouncy", "bowed", "brave", "breakable", "bright", "brilliant", "brisk", "broken", "brown", "bruised", "bulky", "burdensome", "burly", "bustling", "busy", "buttery", "buzzing", "calculating", "candid", "carefree", "careless", "caring", "cautious", "cavernous", "celebrated", "charming", "cheap", "cheerful", "chilly", "chubby", "circular", "classic", "clean", "clear", "clear-cut", "close", "closed", "cloudy", "clueless", "clumsy", "cluttered", "coarse", "colorful", "colorless", "colossal", "comfortable", "common", "compassionate", "competent", "complete", "complicated", "concerned", "concrete", "confused", "considerate", "content", "cool", "cooperative", "coordinated", "corny", "corrupt", "courageous", "courteous", "crafty", "crazy", "creamy", "creative", "criminal", "critical", "crooked", "crowded", "cruel", "crushing", "cuddly", "cultivated", "cumbersome", "curly", "cute", "damaged", "damp", "dapper", "dark", "darling", "dazzling", "dead", "deadly", "deafening", "dearest", "decent", "decisive", "deep", "defenseless", "defensive", "deficient", "definite", "definitive", "delectable", "delicious", "delirious", "dense", "dental", "dependable", "dependent", "descriptive", "deserted", "determined", "devoted", "different", "difficult", "digital", "diligent", "dim", "direct", "dirty", "discrete", "disloyal", "dismal", "distant", "distinct", "distorted", "doting", "downright", "drab", "dramatic", "dreary", "dual", "dull", "dutiful", "each", "early", "earnest", "easy", "ecstatic", "edible", "educated", "elastic", "elderly", "electric", "elegant", "elementary", "elliptical", "eminent", "emotional", "empty", "enchanted", "enchanting", "energetic", "enlightened", "enraged", "entire", "equatorial", "essential", "esteemed", "ethical", "everlasting", "every", "evil", "exalted", "excellent", "excitable", "excited", "exhausted", "exotic", "expensive", "experienced", "expert", "extra-large", "extroverted", "failing", "faint", "fair", "fake", "familiar", "fantastic", "far", "far-flung", "far-off", "faraway", "fat", "fatal", "fatherly", "favorable", "favorite", "fearless", "feline", "filthy", "fine", "finished", "firm", "first", "firsthand", "fixed", "flashy", "flawed", "flawless", "flickering", "flimsy", "flowery", "fluffy", "flustered", "focused", "fond", "foolhardy", "foolish", "forceful", "formal", "forsaken", "fortunate", "fragrant", "frail", "frank", "free", "french", "frequent", "friendly", "frightened", "frilly", "frivolous", "frizzy", "front", "frozen", "frugal", "fruitful", "functional", "funny", "fussy", "fuzzy", "gaseous", "general", "gentle", "genuine", "gifted", "gigantic", "giving", "glaring", "glass", "gleaming", "glittering", "gloomy", "glorious", "glossy", "glum", "golden", "good", "good-natured", "gorgeous", "graceful", "gracious", "grandiose", "granular", "grave", "gray", "great", "greedy", "grim", "grimy", "gripping", "grizzled", "grouchy", "grounded", "growing", "grown", "grubby", "gruesome", "grumpy", "guilty", "gullible", "gummy", "hairy", "handsome", "handy", "happy", "happy-go-lucky", "hard-to-find", "harmful", "hasty", "hateful", "haunting", "heartfelt", "heavenly", "heavy", "hefty", "helpful", "helpless", "hidden", "hoarse", "hollow", "homely", "honorable", "honored", "hopeful", "hospitable", "hot", "huge", "humble", "humiliating", "hungry", "hurtful", "husky", "icy", "ideal", "idealistic", "idolized", "ignorant", "ill", "ill-fated", "illiterate", "illustrious", "imaginary", "imaginative", "immaculate", "immediate", "immense", "impartial", "impassioned", "impeccable", "impish", "impolite", "important", "impossible", "impractical", "impressionable", "impressive", "improbable", "impure", "inborn", "incomparable", "incomplete", "inconsequential", "indelible", "indolent", "inexperienced", "infamous", "infatuated", "inferior", "infinite", "informal", "innocent", "insecure", "insidious", "insignificant", "insistent", "instructive", "intelligent", "intent", "interesting", "internal", "international", "intrepid", "ironclad", "irresponsible", "jagged", "jam-packed", "jaunty", "jealous", "jittery", "joyful", "joyous", "jubilant", "judicious", "juicy", "jumbo", "junior", "juvenile", "kaleidoscopic", "key", "knotty", "knowledgeable", "known", "kooky", "kosher", "lanky", "last", "lasting", "late", "lavish", "lawful", "lazy", "leading", "lean", "left", "legal", "light", "lighthearted", "likable", "likely", "limited", "limp", "limping", "linear", "lined", "liquid", "little", "live", "lively", "livid", "lone", "lonely", "long", "long-term", "lost", "lovable", "lovely", "low", "lucky", "lumbering", "lumpy", "lustrous", "mad", "made-up", "magnificent", "majestic", "major", "male", "mammoth", "married", "marvelous", "massive", "mature", "meager", "mealy", "mean", "measly", "meaty", "mediocre", "medium", "memorable", "menacing", "merry", "messy", "metallic", "mild", "milky", "mindless", "minor", "minty", "miserable", "miserly", "misguided", "mixed", "moist", "monstrous", "monthly", "monumental", "moral", "motionless", "muddy", "muffled", "multicolored", "mundane", "murky", "mushy", "musty", "muted", "mysterious", "narrow", "natural", "naughty", "nautical", "near", "neat", "necessary", "needy", "negative", "neglected", "negligible", "neighboring", "nervous", "new", "next", "nice", "nifty", "nimble", "nippy", "nocturnal", "normal", "noted", "noteworthy", "noxious", "numb", "nutritious", "obedient", "oblong", "obvious", "odd", "oddball", "official", "oily", "old", "old-fashioned", "only", "optimal", "optimistic", "orange", "orderly", "ordinary", "ornate", "ornery", "other", "our", "outgoing", "outlandish", "outlying", "outrageous", "outstanding", "oval", "overcooked", "overdue", "palatable", "pale", "paltry", "parallel", "parched", "partial", "passionate", "pastel", "peaceful", "peppery", "perfumed", "perky", "personal", "pertinent", "pessimistic", "petty", "phony", "physical", "pink", "pitiful", "plain", "pleasant", "pleased", "pleasing", "plump", "pointed", "pointless", "polished", "polite", "political", "poor", "portly", "posh", "possible", "potable", "powerful", "powerless", "practical", "precious", "present", "prestigious", "pretty", "pricey", "prickly", "primary", "prime", "private", "probable", "productive", "profitable", "profuse", "proper", "proud", "prudent", "punctual", "puny", "pure", "purple", "pushy", "putrid", "puzzled", "qualified", "quarrelsome", "quarterly", "queasy", "querulous", "questionable", "quick", "quick-witted", "quiet", "quintessential", "quixotic", "radiant", "ragged", "rapid", "rare", "raw", "realistic", "reasonable", "recent", "reckless", "rectangular", "red", "reflecting", "regal", "regular", "remarkable", "remorseful", "repentant", "respectful", "responsible", "rewarding", "rich", "right", "rigid", "ripe", "roasted", "robust", "rosy", "rotating", "rotten", "rough", "round", "rowdy", "royal", "rubbery", "ruddy", "rundown", "runny", "rural", "rusty", "sad", "salty", "same", "sandy", "sarcastic", "sardonic", "scaly", "scared", "scary", "scented", "scientific", "scornful", "scratchy", "second", "second-hand", "secondary", "secret", "self-assured", "self-reliant", "selfish", "sentimental", "separate", "serene", "serpentine", "severe", "shabby", "shadowy", "shady", "shallow", "shameful", "shameless", "shimmering", "shiny", "shocked", "shoddy", "short", "short-term", "showy", "shrill", "shy", "sick", "silent", "silky", "silver", "similar", "simple", "simplistic", "sinful", "sizzling", "skeletal", "sleepy", "slight", "slimy", "slow", "slushy", "small", "smart", "smoggy", "smooth", "smug", "snappy", "snarling", "sneaky", "sniveling", "snoopy", "sociable", "soft", "soggy", "somber", "some", "sophisticated", "sore", "sorrowful", "soulful", "soupy", "sour", "spanish", "sparkling", "sparse", "specific", "speedy", "spherical", "spiffy", "spirited", "spiteful", "splendid", "spotless", "square", "squeaky", "squiggly", "stable", "staid", "stained", "stale", "standard", "stark", "steel", "steep", "sticky", "stiff", "stingy", "stormy", "straight", "strange", "strict", "strident", "striking", "strong", "stunning", "stupendous", "sturdy", "stylish", "subdued", "submissive", "substantial", "subtle", "suburban", "sudden", "sugary", "sunny", "super", "superb", "superficial", "superior", "supportive", "sure-footed", "surprised", "svelte", "sweet", "swift", "talkative", "tall", "tame", "tangible", "tasty", "tattered", "taut", "tedious", "teeming", "tempting", "tender", "tense", "tepid", "terrible", "that", "these", "thick", "thin", "thorny", "thorough", "those", "thrifty", "tidy", "tight", "timely", "tinted", "tiny", "tired", "torn", "total", "tough", "tragic", "trained", "triangular", "tricky", "trim", "trivial", "troubled", "true", "trusting", "trustworthy", "trusty", "turbulent", "twin", "ugly", "ultimate", "unaware", "uncomfortable", "uncommon", "unconscious", "understated", "uneven", "unfinished", "unfit", "unfortunate", "unhappy", "unhealthy", "uniform", "unimportant", "unique", "unkempt", "unknown", "unlawful", "unlined", "unlucky", "unpleasant", "unrealistic", "unripe", "unruly", "unselfish", "unsightly", "unsteady", "unsung", "untidy", "untimely", "untried", "untrue", "unused", "unusual", "unwelcome", "unwieldy", "unwilling", "unwritten", "upbeat", "upright", "upset", "urban", "usable", "useless", "utilized", "utter", "vague", "vain", "valuable", "variable", "vast", "velvety", "vengeful", "vibrant", "victorious", "violent", "vivacious", "vivid", "voluminous", "warlike", "warm", "warmhearted", "warped", "wasteful", "waterlogged", "watery", "wavy", "wealthy", "weary", "webbed", "wee", "weekly", "weighty", "weird", "well-documented", "well-groomed", "well-lit", "well-made", "well-off", "well-to-do", "well-worn", "which", "whimsical", "whirlwind", "whispered", "white", "whole", "whopping", "wicked", "wide", "wide-eyed", "wiggly", "willing", "wilted", "winding", "windy", "winged", "wise", "witty", "wobbly", "woeful", "wonderful", "wordy", "worldly", "worse", "worst", "worthless", "worthwhile", "worthy", "wrathful", "wretched", "writhing", "wrong", "wry", "yearly", "yellow", "yellowish", "young", "youthful", "yummy", "zany", "zealous", "zesty"];
var xa = ["abnormally", "absentmindedly", "accidentally", "acidly", "actually", "adventurously", "afterwards", "almost", "always", "angrily", "annually", "anxiously", "arrogantly", "awkwardly", "badly", "bashfully", "beautifully", "bitterly", "bleakly", "blindly", "blissfully", "boastfully", "boldly", "bravely", "briefly", "brightly", "briskly", "broadly", "busily", "calmly", "carefully", "carelessly", "cautiously", "certainly", "cheerfully", "clearly", "cleverly", "closely", "coaxingly", "colorfully", "commonly", "continually", "coolly", "correctly", "courageously", "crossly", "cruelly", "curiously", "daily", "daintily", "dearly", "deceivingly", "deeply", "defiantly", "deliberately", "delightfully", "diligently", "dimly", "doubtfully", "dreamily", "easily", "elegantly", "energetically", "enormously", "enthusiastically", "equally", "especially", "even", "evenly", "eventually", "exactly", "excitedly", "extremely", "fairly", "faithfully", "famously", "far", "fast", "fatally", "ferociously", "fervently", "fiercely", "fondly", "foolishly", "fortunately", "frankly", "frantically", "freely", "frenetically", "frightfully", "fully", "furiously", "generally", "generously", "gently", "gladly", "gleefully", "gracefully", "gratefully", "greatly", "greedily", "happily", "hastily", "healthily", "heavily", "helpfully", "helplessly", "highly", "honestly", "hopelessly", "hourly", "hungrily", "immediately", "innocently", "inquisitively", "instantly", "intensely", "intently", "interestingly", "inwardly", "irritably", "jaggedly", "jealously", "joshingly", "jovially", "joyfully", "joyously", "jubilantly", "judgementally", "justly", "keenly", "kiddingly", "kindheartedly", "kindly", "kissingly", "knavishly", "knottily", "knowingly", "knowledgeably", "kookily", "lazily", "less", "lightly", "likely", "limply", "lively", "loftily", "longingly", "loosely", "loudly", "lovingly", "loyally", "madly", "majestically", "meaningfully", "mechanically", "merrily", "miserably", "mockingly", "monthly", "more", "mortally", "mostly", "mysteriously", "naturally", "nearly", "neatly", "needily", "nervously", "never", "nicely", "noisily", "not", "obediently", "obnoxiously", "oddly", "offensively", "officially", "often", "only", "openly", "optimistically", "overconfidently", "owlishly", "painfully", "partially", "patiently", "perfectly", "physically", "playfully", "politely", "poorly", "positively", "potentially", "powerfully", "promptly", "properly", "punctually", "quaintly", "quarrelsomely", "queasily", "questionably", "questioningly", "quicker", "quickly", "quietly", "quirkily", "quizzically", "rapidly", "rarely", "readily", "really", "reassuringly", "recklessly", "regularly", "reluctantly", "repeatedly", "reproachfully", "restfully", "righteously", "rightfully", "rigidly", "roughly", "rudely", "sadly", "safely", "scarcely", "scarily", "searchingly", "sedately", "seemingly", "seldom", "selfishly", "separately", "seriously", "shakily", "sharply", "sheepishly", "shrilly", "shyly", "silently", "sleepily", "slowly", "smoothly", "softly", "solemnly", "solidly", "sometimes", "soon", "speedily", "stealthily", "sternly", "strictly", "successfully", "suddenly", "surprisingly", "suspiciously", "sweetly", "swiftly", "sympathetically", "tenderly", "tensely", "terribly", "thankfully", "thoroughly", "thoughtfully", "tightly", "tomorrow", "too", "tremendously", "triumphantly", "truly", "truthfully", "ultimately", "unabashedly", "unaccountably", "unbearably", "unethically", "unexpectedly", "unfortunately", "unimpressively", "unnaturally", "unnecessarily", "upbeat", "upliftingly", "upright", "upside-down", "upward", "upwardly", "urgently", "usefully", "uselessly", "usually", "utterly", "vacantly", "vaguely", "vainly", "valiantly", "vastly", "verbally", "very", "viciously", "victoriously", "violently", "vivaciously", "voluntarily", "warmly", "weakly", "wearily", "well", "wetly", "wholly", "wildly", "willfully", "wisely", "woefully", "wonderfully", "worriedly", "wrongly", "yawningly", "yearly", "yearningly", "yesterday", "yieldingly", "youthfully"];
var za = ["after", "although", "and", "as", "because", "before", "but", "consequently", "even", "finally", "for", "furthermore", "hence", "how", "however", "if", "inasmuch", "incidentally", "indeed", "instead", "lest", "likewise", "meanwhile", "nor", "now", "once", "or", "provided", "since", "so", "supposing", "than", "that", "though", "till", "unless", "until", "what", "when", "whenever", "where", "whereas", "wherever", "whether", "which", "while", "who", "whoever", "whose", "why", "yet"];
var Va = ["yuck", "oh", "phooey", "blah", "boo", "whoa", "yowza", "huzzah", "boohoo", "fooey", "geez", "pfft", "ew", "ah", "yum", "brr", "hm", "yahoo", "aha", "woot", "drat", "gah", "meh", "psst", "aw", "ugh", "yippee", "eek", "gee", "bah", "gadzooks", "duh", "ha", "mmm", "ouch", "phew", "ack", "uh-huh", "gosh", "hmph", "pish", "zowie", "er", "ick", "oof", "um"];
var Ya = ["CD", "SUV", "abacus", "academics", "accelerator", "accompanist", "account", "accountability", "acquaintance", "ad", "adaptation", "address", "adrenalin", "adult", "advancement", "advertisement", "adviser", "affect", "affiliate", "aftermath", "agreement", "airbus", "aircraft", "airline", "airmail", "airman", "airport", "alb", "alert", "allegation", "alliance", "alligator", "allocation", "almighty", "amendment", "amnesty", "analogy", "angle", "annual", "antelope", "anticodon", "apparatus", "appliance", "approach", "apricot", "arcade", "archaeology", "armchair", "armoire", "asset", "assist", "atrium", "attraction", "availability", "avalanche", "awareness", "babushka", "backbone", "backburn", "bakeware", "bandwidth", "bar", "barge", "baritone", "barracks", "baseboard", "basket", "bathhouse", "bathrobe", "battle", "begonia", "behest", "bell", "bench", "bend", "beret", "best-seller", "bid", "bidet", "bin", "birdbath", "birdcage", "birth", "blight", "blossom", "blowgun", "bob", "bog", "bonfire", "bonnet", "bookcase", "bookend", "boulevard", "bourgeoisie", "bowler", "bowling", "boyfriend", "brace", "bracelet", "bran", "breastplate", "brief", "brochure", "brook", "brush", "bug", "bump", "bungalow", "cafe", "cake", "calculus", "cannon", "cantaloupe", "cap", "cappelletti", "captain", "caption", "carboxyl", "cardboard", "carnival", "case", "casement", "cash", "casket", "cassava", "castanet", "catalyst", "cauliflower", "cellar", "celsius", "cemetery", "ceramic", "ceramics", "certification", "chainstay", "chairperson", "challenge", "championship", "chap", "chapel", "character", "characterization", "charlatan", "charm", "chasuble", "cheese", "cheetah", "chiffonier", "chops", "chow", "cinder", "cinema", "circumference", "citizen", "clamp", "clavicle", "cleaner", "climb", "co-producer", "coal", "coast", "cod", "coil", "coin", "coliseum", "collaboration", "collectivization", "colon", "colonialism", "comestible", "commercial", "commodity", "community", "comparison", "completion", "complication", "compromise", "concentration", "configuration", "confusion", "conservation", "conservative", "consistency", "contractor", "contrail", "convection", "conversation", "cook", "coordination", "cop-out", "cope", "cork", "cornet", "corporation", "corral", "cosset", "costume", "couch", "council", "councilman", "countess", "courtroom", "cow", "creator", "creature", "crest", "cricket", "crocodile", "cross-contamination", "cruelty", "cuckoo", "curl", "custody", "custom", "cutlet", "cutover", "cycle", "daddy", "dandelion", "dash", "daughter", "dead", "decision", "deck", "declaration", "decongestant", "decryption", "deduction", "deed", "deer", "defendant", "density", "department", "dependency", "deployment", "depot", "derby", "descendant", "descent", "design", "designation", "desk", "detective", "devastation", "developing", "developmental", "devil", "diagram", "digestive", "digit", "dime", "director", "disadvantage", "disappointment", "disclosure", "disconnection", "discourse", "dish", "disk", "disposer", "distinction", "diver", "diversity", "dividend", "divine", "doing", "doorpost", "doubter", "draft", "draw", "dream", "dredger", "dress", "drive", "drug", "duffel", "dulcimer", "dusk", "duster", "dwell", "e-mail", "earth", "ecliptic", "ectoderm", "edge", "editor", "effector", "eggplant", "electronics", "elevation", "elevator", "elver", "embarrassment", "embossing", "emergent", "encouragement", "entry", "epic", "equal", "essence", "eternity", "ethyl", "euphonium", "event", "exasperation", "excess", "executor", "exhaust", "expansion", "expense", "experience", "exploration", "extension", "extent", "exterior", "eyebrow", "eyeliner", "farm", "farmer", "fat", "fax", "feather", "fedora", "fellow", "fen", "fencing", "ferret", "festival", "fibre", "filter", "final", "finding", "finer", "finger", "fireplace", "fisherman", "fishery", "fit", "flame", "flat", "fledgling", "flight", "flint", "flood", "flu", "fog", "fold", "folklore", "follower", "following", "foodstuffs", "footrest", "forage", "forager", "forgery", "fork", "formamide", "formation", "formula", "fort", "fowl", "fraudster", "freckle", "freezing", "freight", "fuel", "fun", "fund", "fundraising", "futon", "gallery", "galoshes", "gastropod", "gazebo", "gerbil", "ghost", "giant", "gift", "giggle", "glider", "gloom", "goat", "godfather", "godparent", "going", "goodwill", "governance", "government", "gown", "gradient", "graffiti", "grandpa", "grandson", "granny", "grass", "gray", "gripper", "grouper", "guacamole", "guard", "guidance", "guide", "gym", "gymnast", "habit", "haircut", "halt", "hamburger", "hammock", "handful", "handle", "handover", "harp", "haversack", "hawk", "heartache", "heartbeat", "heating", "hello", "help", "hepatitis", "heroine", "hexagon", "hierarchy", "hippodrome", "honesty", "hoof", "hope", "horde", "hornet", "horst", "hose", "hospitalization", "hovel", "hovercraft", "hubris", "humidity", "humor", "hundred", "hunger", "hunt", "husband", "hutch", "hydrant", "hydrocarbon", "hydrolyse", "hydrolyze", "hyena", "hygienic", "hyphenation", "ice-cream", "icebreaker", "igloo", "ignorance", "illusion", "impact", "import", "importance", "impostor", "in-joke", "incandescence", "independence", "individual", "information", "injunction", "innovation", "insolence", "inspection", "instance", "institute", "instruction", "instructor", "integer", "intellect", "intent", "interchange", "interior", "intervention", "interviewer", "invite", "iridescence", "issue", "jacket", "jazz", "jellyfish", "jet", "jogging", "joy", "juggernaut", "jump", "jungle", "junior", "jury", "kettledrum", "kick", "kielbasa", "kinase", "king", "kiss", "kit", "knickers", "knight", "knitting", "knuckle", "label", "labourer", "lace", "lady", "lamp", "language", "larva", "lashes", "laughter", "lava", "lawmaker", "lay", "leading", "league", "legend", "legging", "legislature", "lender", "license", "lid", "lieu", "lifestyle", "lift", "linseed", "litter", "loaf", "lobster", "longboat", "lotion", "lounge", "louse", "lox", "loyalty", "luck", "lyre", "maestro", "mainstream", "maintainer", "majority", "makeover", "making", "mallard", "management", "manner", "mantua", "marathon", "march", "marimba", "marketplace", "marksman", "markup", "marten", "massage", "masterpiece", "mathematics", "meadow", "meal", "meander", "meatloaf", "mechanic", "median", "membership", "mentor", "merit", "metabolite", "metal", "middle", "midwife", "milestone", "millet", "minion", "minister", "minor", "minority", "mixture", "mobility", "molasses", "mom", "moment", "monasticism", "monocle", "monster", "morbidity", "morning", "mortise", "mountain", "mouser", "mousse", "mozzarella", "muscat", "mythology", "napkin", "necklace", "nectarine", "negotiation", "nephew", "nerve", "netsuke", "newsletter", "newsprint", "newsstand", "nightlife", "noon", "nougat", "nucleotidase", "nudge", "numeracy", "numeric", "nun", "obedience", "obesity", "object", "obligation", "ocelot", "octave", "offset", "oil", "omelet", "onset", "opera", "operating", "optimal", "orchid", "order", "ostrich", "other", "outlaw", "outrun", "outset", "overcoat", "overheard", "overload", "ownership", "pacemaker", "packaging", "paintwork", "palate", "pants", "pantyhose", "papa", "parade", "parsnip", "partridge", "passport", "pasta", "patroller", "pear", "pearl", "pecan", "pendant", "peninsula", "pension", "peony", "pepper", "perfection", "permafrost", "perp", "petal", "petticoat", "pharmacopoeia", "phrase", "pick", "piglet", "pigpen", "pigsty", "pile", "pillbox", "pillow", "pilot", "pine", "pinstripe", "place", "plain", "planula", "plastic", "platter", "platypus", "pleasure", "pliers", "plugin", "plumber", "pneumonia", "pocket-watch", "poetry", "polarisation", "polyester", "pomelo", "pop", "poppy", "popularity", "populist", "porter", "possession", "postbox", "precedent", "premeditation", "premier", "premise", "premium", "pressure", "presume", "priesthood", "printer", "privilege", "procurement", "produce", "programme", "prohibition", "promise", "pronoun", "providence", "provider", "provision", "publication", "publicity", "pulse", "punctuation", "pupil", "puppet", "puritan", "quart", "quinoa", "quit", "railway", "range", "rationale", "ravioli", "rawhide", "reach", "reasoning", "reboot", "receptor", "recommendation", "reconsideration", "recovery", "redesign", "relative", "release", "remark", "reorganisation", "repeat", "replacement", "reporter", "representation", "republican", "request", "requirement", "reservation", "resolve", "resource", "responsibility", "restaurant", "retention", "retrospectivity", "reward", "ribbon", "rim", "riser", "roadway", "role", "rosemary", "roundabout", "rubric", "ruin", "rule", "runway", "rust", "safe", "sailor", "saloon", "sand", "sandbar", "sanity", "sarong", "sauerkraut", "saw", "scaffold", "scale", "scarification", "scenario", "schedule", "schnitzel", "scholarship", "scorn", "scorpion", "scout", "scrap", "scratch", "seafood", "seagull", "seal", "season", "secrecy", "secret", "section", "sediment", "self-confidence", "sermon", "sesame", "settler", "shadowbox", "shark", "shipper", "shore", "shoulder", "sideboard", "siege", "sightseeing", "signature", "silk", "simple", "singing", "skean", "skeleton", "skyline", "skyscraper", "slide", "slime", "slipper", "smog", "smoke", "sock", "soliloquy", "solution", "solvency", "someplace", "sonar", "sonata", "sonnet", "soup", "soybean", "space", "spear", "spirit", "spork", "sport", "spring", "sprinkles", "squid", "stall", "starboard", "statue", "status", "stay", "steak", "steeple", "step", "step-mother", "sticker", "stir-fry", "stitcher", "stock", "stool", "story", "strait", "stranger", "strategy", "straw", "stump", "subexpression", "submitter", "subsidy", "substitution", "suitcase", "summary", "summer", "sunbeam", "sundae", "supplier", "surface", "sushi", "suspension", "sustenance", "swanling", "swath", "sweatshop", "swim", "swine", "swing", "switch", "switchboard", "swordfish", "synergy", "t-shirt", "tabletop", "tackle", "tail", "tapioca", "taro", "tarragon", "taxicab", "teammate", "technician", "technologist", "tectonics", "tenant", "tenement", "tennis", "tentacle", "teriyaki", "term", "testimonial", "testing", "thigh", "thongs", "thorn", "thread", "thunderbolt", "thyme", "tinderbox", "toaster", "tomatillo", "tomb", "tomography", "tool", "tooth", "toothbrush", "toothpick", "topsail", "traditionalism", "traffic", "translation", "transom", "transparency", "trash", "travel", "tray", "trench", "tribe", "tributary", "trick", "trolley", "tuba", "tuber", "tune-up", "turret", "tusk", "tuxedo", "typeface", "typewriter", "unblinking", "underneath", "underpants", "understanding", "unibody", "unique", "unit", "utilization", "valentine", "validity", "valley", "valuable", "vanadyl", "vein", "velocity", "venom", "version", "verve", "vestment", "veto", "viability", "vibraphone", "vibration", "vicinity", "video", "violin", "vision", "vista", "vol", "volleyball", "wafer", "waist", "wallaby", "warming", "wasabi", "waterspout", "wear", "wedding", "whack", "whale", "wheel", "widow", "wilderness", "willow", "window", "wombat", "word", "worth", "wriggler", "yak", "yarmulke", "yeast", "yin", "yogurt", "zebra", "zen"];
var ja = ["a", "abaft", "aboard", "about", "above", "absent", "across", "afore", "after", "against", "along", "alongside", "amid", "amidst", "among", "amongst", "an", "anenst", "anti", "apropos", "apud", "around", "as", "aside", "astride", "at", "athwart", "atop", "barring", "before", "behind", "below", "beneath", "beside", "besides", "between", "beyond", "but", "by", "circa", "concerning", "considering", "despite", "down", "during", "except", "excepting", "excluding", "failing", "following", "for", "forenenst", "from", "given", "in", "including", "inside", "into", "lest", "like", "mid", "midst", "minus", "modulo", "near", "next", "notwithstanding", "of", "off", "on", "onto", "opposite", "out", "outside", "over", "pace", "past", "per", "plus", "pro", "qua", "regarding", "round", "sans", "save", "since", "than", "the", "through", "throughout", "till", "times", "to", "toward", "towards", "under", "underneath", "unlike", "until", "unto", "up", "upon", "versus", "via", "vice", "with", "within", "without", "worth"];
var qa = ["abnegate", "abscond", "abseil", "absolve", "accentuate", "accept", "access", "accessorise", "accompany", "account", "accredit", "achieve", "acknowledge", "acquire", "adjourn", "adjudge", "admonish", "adumbrate", "advocate", "afford", "airbrush", "ameliorate", "amend", "amount", "anaesthetise", "analyse", "anesthetize", "anneal", "annex", "antagonize", "ape", "apologise", "apostrophize", "appertain", "appreciate", "appropriate", "approximate", "arbitrate", "archive", "arraign", "arrange", "ascertain", "ascribe", "assail", "atomize", "attend", "attest", "attribute", "augment", "avow", "axe", "baa", "banish", "bank", "baptise", "battle", "beard", "beep", "behold", "belabor", "bemuse", "besmirch", "bestride", "better", "bewail", "bicycle", "bide", "bind", "biodegrade", "blacken", "blaspheme", "bleach", "blend", "blink", "bliss", "bloom", "bludgeon", "bobble", "boggle", "bolster", "book", "boom", "bootleg", "border", "bore", "boss", "braid", "brand", "brandish", "break", "breed", "broadcast", "broadside", "brood", "browse", "buck", "burgeon", "bus", "butter", "buzzing", "camouflage", "cannibalise", "canter", "cap", "capitalise", "capitalize", "capsize", "card", "carouse", "carp", "carpool", "catalog", "catalyze", "catch", "categorise", "cease", "celebrate", "censor", "certify", "char", "charter", "chase", "chatter", "chime", "chip", "christen", "chromakey", "chunder", "chunter", "cinch", "circle", "circulate", "circumnavigate", "clamor", "clamour", "claw", "cleave", "clinch", "clinking", "clone", "clonk", "coagulate", "coexist", "coincide", "collaborate", "colligate", "colorize", "colour", "comb", "come", "commandeer", "commemorate", "communicate", "compete", "conceal", "conceptualize", "conclude", "concrete", "condense", "cone", "confide", "confirm", "confiscate", "confound", "confute", "congregate", "conjecture", "connect", "consign", "construe", "contradict", "contrast", "contravene", "controvert", "convalesce", "converse", "convince", "convoke", "coop", "cop", "corner", "covenant", "cow", "crackle", "cram", "crank", "creak", "creaking", "cripple", "croon", "cross", "crumble", "crystallize", "culminate", "culture", "curry", "curse", "customise", "cycle", "dally", "dampen", "darn", "debit", "debut", "decide", "decode", "decouple", "decriminalize", "deduce", "deduct", "deflate", "deflect", "deform", "defrag", "degenerate", "degrease", "delete", "delight", "deliquesce", "demob", "demobilise", "democratize", "demonstrate", "denitrify", "deny", "depart", "depend", "deplore", "deploy", "deprave", "depute", "dereference", "describe", "desecrate", "deselect", "destock", "detain", "develop", "devise", "dial", "dicker", "digitize", "dilate", "disapprove", "disarm", "disbar", "discontinue", "disgorge", "dishearten", "dishonor", "disinherit", "dislocate", "dispense", "display", "dispose", "disrespect", "dissemble", "ditch", "divert", "dock", "doodle", "downchange", "downshift", "dowse", "draft", "drag", "drain", "dramatize", "drowse", "drum", "dwell", "economise", "edge", "efface", "egg", "eke", "electrify", "embalm", "embed", "embody", "emboss", "emerge", "emphasise", "emphasize", "emulsify", "encode", "endow", "enfold", "engage", "engender", "enhance", "enlist", "enrage", "enrich", "enroll", "entice", "entomb", "entrench", "entwine", "equate", "essay", "etch", "eulogise", "even", "evince", "exacerbate", "exaggerate", "exalt", "exempt", "exonerate", "expatiate", "explode", "expostulate", "extract", "extricate", "eyeglasses", "fabricate", "facilitate", "factorise", "factorize", "fail", "fall", "familiarize", "fashion", "father", "fathom", "fax", "federate", "feminize", "fence", "fess", "fictionalize", "fiddle", "fidget", "fill", "flash", "fleck", "flight", "floodlight", "floss", "fluctuate", "fluff", "fly", "focalise", "foot", "forearm", "forecast", "foretell", "forgather", "forgo", "fork", "form", "forswear", "founder", "fraternise", "fray", "frizz", "fumigate", "function", "furlough", "fuss", "gad", "gallivant", "galvanize", "gape", "garage", "garrote", "gasp", "gestate", "give", "glimmer", "glisten", "gloat", "gloss", "glow", "gnash", "gnaw", "goose", "govern", "grade", "graduate", "graft", "grok", "guest", "guilt", "gulp", "gum", "gurn", "gust", "gut", "guzzle", "ham", "harangue", "harvest", "hassle", "haul", "haze", "headline", "hearten", "heighten", "highlight", "hoick", "hold", "hole", "hollow", "holster", "home", "homeschool", "hoot", "horn", "horse", "hotfoot", "house", "hover", "howl", "huddle", "huff", "hunger", "hunt", "husk", "hype", "hypothesise", "hypothesize", "idle", "ignite", "imagineer", "impact", "impanel", "implode", "incinerate", "incline", "inculcate", "industrialize", "ingratiate", "inhibit", "inject", "innovate", "inscribe", "insert", "insist", "inspect", "institute", "institutionalize", "intend", "intermarry", "intermesh", "intermix", "internalise", "internalize", "internationalize", "intrigue", "inure", "inveigle", "inventory", "investigate", "irk", "iterate", "jaywalk", "jell", "jeopardise", "jiggle", "jive", "joint", "jot", "jut", "keel", "knife", "knit", "know", "kowtow", "lack", "lampoon", "large", "leap", "lecture", "legitimize", "lend", "libel", "liberalize", "license", "ligate", "list", "lobotomise", "lock", "log", "loose", "low", "lowball", "machine", "magnetize", "major", "make", "malfunction", "manage", "manipulate", "maroon", "masculinize", "mash", "mask", "masquerade", "massage", "masticate", "materialise", "matter", "maul", "memorise", "merge", "mesh", "metabolise", "microblog", "microchip", "micromanage", "militate", "mill", "minister", "minor", "misappropriate", "miscalculate", "misfire", "misjudge", "miskey", "mismatch", "mispronounce", "misread", "misreport", "misspend", "mob", "mobilise", "mobilize", "moisten", "mooch", "moor", "moralise", "mortar", "mosh", "mothball", "motivate", "motor", "mould", "mount", "muddy", "mummify", "mutate", "mystify", "nab", "narrate", "narrowcast", "nasalise", "nauseate", "navigate", "neaten", "neck", "neglect", "norm", "notarize", "object", "obscure", "observe", "obsess", "obstruct", "obtrude", "offend", "offset", "option", "orchestrate", "orient", "orientate", "outbid", "outdo", "outfit", "outflank", "outfox", "outnumber", "outrank", "outrun", "outsource", "overburden", "overcharge", "overcook", "overdub", "overfeed", "overload", "overplay", "overproduce", "overreact", "override", "overspend", "overstay", "overtrain", "overvalue", "overwork", "own", "oxidise", "oxidize", "oxygenate", "pace", "pack", "pale", "pant", "paralyse", "parody", "part", "pause", "pave", "penalise", "persecute", "personalise", "perspire", "pertain", "peter", "pike", "pillory", "pinion", "pip", "pity", "pivot", "pixellate", "plagiarise", "plait", "plan", "please", "pluck", "ponder", "popularize", "portray", "prance", "preclude", "preheat", "prejudge", "preregister", "presell", "preside", "pretend", "print", "prioritize", "probate", "probe", "proceed", "procrastinate", "profane", "progress", "proliferate", "proofread", "propound", "proselytise", "provision", "pry", "publicize", "puff", "pull", "pulp", "pulverize", "purse", "put", "putrefy", "quadruple", "quaff", "quantify", "quarrel", "quash", "quaver", "question", "quiet", "quintuple", "quip", "quit", "rag", "rally", "ramp", "randomize", "rationalise", "rationalize", "ravage", "ravel", "react", "readies", "readjust", "readmit", "ready", "reapply", "rear", "reassemble", "rebel", "reboot", "reborn", "rebound", "rebuff", "rebuild", "rebuke", "recede", "reckon", "reclassify", "recompense", "reconstitute", "record", "recount", "redact", "redevelop", "redound", "redraw", "redress", "reel", "refer", "reference", "refine", "reflate", "refute", "regulate", "reiterate", "rejigger", "rejoin", "rekindle", "relaunch", "relieve", "remand", "remark", "reopen", "reorient", "replicate", "repossess", "represent", "reprimand", "reproach", "reprove", "repurpose", "requite", "reschedule", "resort", "respray", "restructure", "retool", "retract", "revere", "revitalise", "revoke", "reword", "rewrite", "ride", "ridge", "rim", "ring", "rise", "rival", "roger", "rosin", "rot", "rout", "row", "rue", "rule", "safeguard", "sashay", "sate", "satirise", "satirize", "satisfy", "saturate", "savour", "scale", "scamper", "scar", "scare", "scarper", "scent", "schematise", "scheme", "schlep", "scoff", "scoop", "scope", "scotch", "scowl", "scrabble", "scram", "scramble", "scrape", "screw", "scruple", "scrutinise", "scuffle", "scuttle", "search", "secularize", "see", "segregate", "sell", "sense", "sensitize", "sequester", "serenade", "serialize", "serve", "service", "settle", "sew", "shaft", "sham", "shampoo", "shanghai", "shear", "sheathe", "shell", "shinny", "shirk", "shoot", "shoulder", "shout", "shovel", "showboat", "shred", "shrill", "shudder", "shush", "sidetrack", "sign", "silt", "sin", "singe", "sit", "sizzle", "skateboard", "ski", "slake", "slap", "slather", "sleet", "slink", "slip", "slope", "slump", "smarten", "smuggle", "snack", "sneak", "sniff", "snoop", "snow", "snowplow", "snuggle", "soap", "solace", "solder", "solicit", "source", "spark", "spattering", "spectacles", "spectate", "spellcheck", "spew", "spice", "spirit", "splash", "splay", "split", "splosh", "splurge", "spook", "square", "squirm", "stabilise", "stable", "stack", "stage", "stake", "starch", "state", "statement", "stiffen", "stigmatize", "sting", "stint", "stoop", "store", "storyboard", "stratify", "structure", "stuff", "stunt", "substantiate", "subtract", "suckle", "suffice", "suffocate", "summarise", "sun", "sunbathe", "sunder", "sup", "surge", "surprise", "swat", "swathe", "sway", "swear", "swelter", "swerve", "swill", "swing", "symbolise", "synthesise", "syringe", "table", "tabulate", "tag", "tame", "tank", "tankful", "tarry", "task", "taxicab", "team", "telescope", "tenant", "terraform", "terrorise", "testify", "think", "throbbing", "thump", "tighten", "toady", "toe", "tough", "tousle", "traduce", "train", "transcend", "transplant", "trash", "treasure", "treble", "trek", "trial", "tromp", "trouser", "trust", "tune", "tut", "twine", "twist", "typify", "unbalance", "uncork", "uncover", "underachieve", "undergo", "underplay", "unearth", "unfreeze", "unfurl", "unlearn", "unscramble", "unzip", "uproot", "upsell", "usher", "vacation", "vamoose", "vanish", "vary", "veg", "venture", "verify", "vet", "veto", "volunteer", "vulgarise", "waft", "wallop", "waltz", "warp", "wash", "waver", "weary", "weatherize", "wedge", "weep", "weight", "welcome", "westernise", "westernize", "while", "whine", "whisper", "whistle", "whitewash", "whup", "wilt", "wing", "wire", "wisecrack", "wolf", "wound", "wring", "writ", "yak", "yawn", "yearn", "yuppify"];
var kr = { adjective: Oa, adverb: xa, conjunction: za, interjection: Va, noun: Ya, preposition: ja, verb: qa };
var Ua = kr;
var fr = { airline: o, animal: k, app: B, book: P, cell_phone: W, color: F, commerce: I, company: U, database: _, date: $, finance: ce, food: ve, hacker: Le, internet: He, location: Qe, lorem: $e, metadata: ea, music: ia, person: Aa, phone_number: La, science: Pa, team: Ga, vehicle: Ka, word: Ua };
var ys = fr;

// ../../node_modules/@faker-js/faker/dist/chunk-HC7G5RVA.js
var m2 = class extends Error {
};
function Me2(i2) {
  let e2 = Object.getPrototypeOf(i2);
  do {
    for (let r2 of Object.getOwnPropertyNames(e2)) typeof i2[r2] == "function" && r2 !== "constructor" && (i2[r2] = i2[r2].bind(i2));
    e2 = Object.getPrototypeOf(e2);
  } while (e2 !== Object.prototype);
}
var x2 = class {
  constructor(e2) {
    this.faker = e2;
    Me2(this);
  }
};
var p2 = class extends x2 {
  constructor(r2) {
    super(r2);
    this.faker = r2;
  }
};
var Ce2 = ((t2) => (t2.Narrowbody = "narrowbody", t2.Regional = "regional", t2.Widebody = "widebody", t2))(Ce2 || {});
var kr2 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
var xr = ["0", "O", "1", "I", "L"];
var Ar = { regional: 20, narrowbody: 35, widebody: 60 };
var Er = { regional: ["A", "B", "C", "D"], narrowbody: ["A", "B", "C", "D", "E", "F"], widebody: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"] };
var F2 = class extends p2 {
  airport() {
    return this.faker.helpers.arrayElement(this.faker.definitions.airline.airport);
  }
  airline() {
    return this.faker.helpers.arrayElement(this.faker.definitions.airline.airline);
  }
  airplane() {
    return this.faker.helpers.arrayElement(this.faker.definitions.airline.airplane);
  }
  recordLocator(e2 = {}) {
    let { allowNumerics: r2 = false, allowVisuallySimilarCharacters: t2 = false } = e2, a2 = [];
    return r2 || a2.push(...kr2), t2 || a2.push(...xr), this.faker.string.alphanumeric({ length: 6, casing: "upper", exclude: a2 });
  }
  seat(e2 = {}) {
    let { aircraftType: r2 = "narrowbody" } = e2, t2 = Ar[r2], a2 = Er[r2], n2 = this.faker.number.int({ min: 1, max: t2 }), o2 = this.faker.helpers.arrayElement(a2);
    return `${n2}${o2}`;
  }
  aircraftType() {
    return this.faker.helpers.enumValue(Ce2);
  }
  flightNumber(e2 = {}) {
    let { length: r2 = { min: 1, max: 4 }, addLeadingZeros: t2 = false } = e2, a2 = this.faker.string.numeric({ length: r2, allowLeadingZeros: false });
    return t2 ? a2.padStart(4, "0") : a2;
  }
};
var Ne2 = ((n2) => (n2.SRGB = "sRGB", n2.DisplayP3 = "display-p3", n2.REC2020 = "rec2020", n2.A98RGB = "a98-rgb", n2.ProphotoRGB = "prophoto-rgb", n2))(Ne2 || {});
var De2 = ((c2) => (c2.RGB = "rgb", c2.RGBA = "rgba", c2.HSL = "hsl", c2.HSLA = "hsla", c2.HWB = "hwb", c2.CMYK = "cmyk", c2.LAB = "lab", c2.LCH = "lch", c2.COLOR = "color", c2))(De2 || {});
function wr(i2, e2) {
  let { prefix: r2, casing: t2 } = e2;
  switch (t2) {
    case "upper": {
      i2 = i2.toUpperCase();
      break;
    }
    case "lower": {
      i2 = i2.toLowerCase();
      break;
    }
    case "mixed":
  }
  return r2 && (i2 = r2 + i2), i2;
}
function Re2(i2) {
  return i2.map((r2) => {
    if (r2 % 1 !== 0) {
      let a2 = new ArrayBuffer(4);
      new DataView(a2).setFloat32(0, r2);
      let n2 = new Uint8Array(a2);
      return Re2([...n2]).replaceAll(" ", "");
    }
    return (r2 >>> 0).toString(2).padStart(8, "0");
  }).join(" ");
}
function A2(i2) {
  return Math.round(i2 * 100);
}
function Sr2(i2, e2 = "rgb", r2 = "sRGB") {
  switch (e2) {
    case "rgba":
      return `rgba(${i2[0]}, ${i2[1]}, ${i2[2]}, ${i2[3]})`;
    case "color":
      return `color(${r2} ${i2[0]} ${i2[1]} ${i2[2]})`;
    case "cmyk":
      return `cmyk(${A2(i2[0])}%, ${A2(i2[1])}%, ${A2(i2[2])}%, ${A2(i2[3])}%)`;
    case "hsl":
      return `hsl(${i2[0]}deg ${A2(i2[1])}% ${A2(i2[2])}%)`;
    case "hsla":
      return `hsl(${i2[0]}deg ${A2(i2[1])}% ${A2(i2[2])}% / ${A2(i2[3])})`;
    case "hwb":
      return `hwb(${i2[0]} ${A2(i2[1])}% ${A2(i2[2])}%)`;
    case "lab":
      return `lab(${A2(i2[0])}% ${i2[1]} ${i2[2]})`;
    case "lch":
      return `lch(${A2(i2[0])}% ${i2[1]} ${i2[2]})`;
    case "rgb":
      return `rgb(${i2[0]}, ${i2[1]}, ${i2[2]})`;
  }
}
function N2(i2, e2, r2 = "rgb", t2 = "sRGB") {
  switch (e2) {
    case "css":
      return Sr2(i2, r2, t2);
    case "binary":
      return Re2(i2);
    case "decimal":
      return i2;
  }
}
var G2 = class extends p2 {
  human() {
    return this.faker.helpers.arrayElement(this.faker.definitions.color.human);
  }
  space() {
    return this.faker.helpers.arrayElement(this.faker.definitions.color.space);
  }
  cssSupportedFunction() {
    return this.faker.helpers.enumValue(De2);
  }
  cssSupportedSpace() {
    return this.faker.helpers.enumValue(Ne2);
  }
  rgb(e2 = {}) {
    let { format: r2 = "hex", includeAlpha: t2 = false, prefix: a2 = "#", casing: n2 = "lower" } = e2, o2, s2 = "rgb";
    return r2 === "hex" ? (o2 = this.faker.string.hexadecimal({ length: t2 ? 8 : 6, prefix: "" }), o2 = wr(o2, { prefix: a2, casing: n2 }), o2) : (o2 = Array.from({ length: 3 }, () => this.faker.number.int(255)), t2 && (o2.push(this.faker.number.float({ multipleOf: 0.01 })), s2 = "rgba"), N2(o2, r2, s2));
  }
  cmyk(e2 = {}) {
    let { format: r2 = "decimal" } = e2, t2 = Array.from({ length: 4 }, () => this.faker.number.float({ multipleOf: 0.01 }));
    return N2(t2, r2, "cmyk");
  }
  hsl(e2 = {}) {
    let { format: r2 = "decimal", includeAlpha: t2 = false } = e2, a2 = [this.faker.number.int(360)];
    for (let n2 = 0; n2 < (e2?.includeAlpha ? 3 : 2); n2++) a2.push(this.faker.number.float({ multipleOf: 0.01 }));
    return N2(a2, r2, t2 ? "hsla" : "hsl");
  }
  hwb(e2 = {}) {
    let { format: r2 = "decimal" } = e2, t2 = [this.faker.number.int(360)];
    for (let a2 = 0; a2 < 2; a2++) t2.push(this.faker.number.float({ multipleOf: 0.01 }));
    return N2(t2, r2, "hwb");
  }
  lab(e2 = {}) {
    let { format: r2 = "decimal" } = e2, t2 = [this.faker.number.float({ multipleOf: 1e-6 })];
    for (let a2 = 0; a2 < 2; a2++) t2.push(this.faker.number.float({ min: -100, max: 100, multipleOf: 1e-4 }));
    return N2(t2, r2, "lab");
  }
  lch(e2 = {}) {
    let { format: r2 = "decimal" } = e2, t2 = [this.faker.number.float({ multipleOf: 1e-6 })];
    for (let a2 = 0; a2 < 2; a2++) t2.push(this.faker.number.float({ max: 230, multipleOf: 0.1 }));
    return N2(t2, r2, "lch");
  }
  colorByCSSColorSpace(e2 = {}) {
    let { format: r2 = "decimal", space: t2 = "sRGB" } = e2, a2 = Array.from({ length: 3 }, () => this.faker.number.float({ multipleOf: 1e-4 }));
    return N2(a2, r2, "color", t2);
  }
};
var be2 = ((a2) => (a2.Legacy = "legacy", a2.Segwit = "segwit", a2.Bech32 = "bech32", a2.Taproot = "taproot", a2))(be2 || {});
var Le2 = ((r2) => (r2.Mainnet = "mainnet", r2.Testnet = "testnet", r2))(Le2 || {});
var Pe2 = { legacy: { prefix: { mainnet: "1", testnet: "m" }, length: { min: 26, max: 34 }, casing: "mixed", exclude: "0OIl" }, segwit: { prefix: { mainnet: "3", testnet: "2" }, length: { min: 26, max: 34 }, casing: "mixed", exclude: "0OIl" }, bech32: { prefix: { mainnet: "bc1", testnet: "tb1" }, length: { min: 42, max: 42 }, casing: "lower", exclude: "1bBiIoO" }, taproot: { prefix: { mainnet: "bc1p", testnet: "tb1p" }, length: { min: 62, max: 62 }, casing: "lower", exclude: "1bBiIoO" } };
var de2 = typeof Buffer > "u" || !Be2("base64") ? (i2) => {
  let e2 = new TextEncoder().encode(i2), r2 = Array.from(e2, (t2) => String.fromCodePoint(t2)).join("");
  return btoa(r2);
} : (i2) => Buffer.from(i2).toString("base64");
var ge2 = typeof Buffer > "u" || !Be2("base64url") ? (i2) => de2(i2).replaceAll("+", "-").replaceAll("/", "_").replaceAll(/=+$/g, "") : (i2) => Buffer.from(i2).toString("base64url");
function Be2(i2) {
  try {
    return typeof Buffer.from("test").toString(i2) == "string";
  } catch {
    return false;
  }
}
var Tr = Object.fromEntries([["\u0410", "A"], ["\u0430", "a"], ["\u0411", "B"], ["\u0431", "b"], ["\u0412", "V"], ["\u0432", "v"], ["\u0413", "G"], ["\u0433", "g"], ["\u0414", "D"], ["\u0434", "d"], ["\u044A\u0435", "ye"], ["\u042A\u0435", "Ye"], ["\u044A\u0415", "yE"], ["\u042A\u0415", "YE"], ["\u0415", "E"], ["\u0435", "e"], ["\u0401", "Yo"], ["\u0451", "yo"], ["\u0416", "Zh"], ["\u0436", "zh"], ["\u0417", "Z"], ["\u0437", "z"], ["\u0418", "I"], ["\u0438", "i"], ["\u044B\u0439", "iy"], ["\u042B\u0439", "Iy"], ["\u042B\u0419", "IY"], ["\u044B\u0419", "iY"], ["\u0419", "Y"], ["\u0439", "y"], ["\u041A", "K"], ["\u043A", "k"], ["\u041B", "L"], ["\u043B", "l"], ["\u041C", "M"], ["\u043C", "m"], ["\u041D", "N"], ["\u043D", "n"], ["\u041E", "O"], ["\u043E", "o"], ["\u041F", "P"], ["\u043F", "p"], ["\u0420", "R"], ["\u0440", "r"], ["\u0421", "S"], ["\u0441", "s"], ["\u0422", "T"], ["\u0442", "t"], ["\u0423", "U"], ["\u0443", "u"], ["\u0424", "F"], ["\u0444", "f"], ["\u0425", "Kh"], ["\u0445", "kh"], ["\u0426", "Ts"], ["\u0446", "ts"], ["\u0427", "Ch"], ["\u0447", "ch"], ["\u0428", "Sh"], ["\u0448", "sh"], ["\u0429", "Sch"], ["\u0449", "sch"], ["\u042A", ""], ["\u044A", ""], ["\u042B", "Y"], ["\u044B", "y"], ["\u042C", ""], ["\u044C", ""], ["\u042D", "E"], ["\u044D", "e"], ["\u042E", "Yu"], ["\u044E", "yu"], ["\u042F", "Ya"], ["\u044F", "ya"]]);
var Mr = Object.fromEntries([["\u03B1", "a"], ["\u03B2", "v"], ["\u03B3", "g"], ["\u03B4", "d"], ["\u03B5", "e"], ["\u03B6", "z"], ["\u03B7", "i"], ["\u03B8", "th"], ["\u03B9", "i"], ["\u03BA", "k"], ["\u03BB", "l"], ["\u03BC", "m"], ["\u03BD", "n"], ["\u03BE", "ks"], ["\u03BF", "o"], ["\u03C0", "p"], ["\u03C1", "r"], ["\u03C3", "s"], ["\u03C4", "t"], ["\u03C5", "y"], ["\u03C6", "f"], ["\u03C7", "x"], ["\u03C8", "ps"], ["\u03C9", "o"], ["\u03AC", "a"], ["\u03AD", "e"], ["\u03AF", "i"], ["\u03CC", "o"], ["\u03CD", "y"], ["\u03AE", "i"], ["\u03CE", "o"], ["\u03C2", "s"], ["\u03CA", "i"], ["\u03B0", "y"], ["\u03CB", "y"], ["\u0390", "i"], ["\u0391", "A"], ["\u0392", "B"], ["\u0393", "G"], ["\u0394", "D"], ["\u0395", "E"], ["\u0396", "Z"], ["\u0397", "I"], ["\u0398", "TH"], ["\u0399", "I"], ["\u039A", "K"], ["\u039B", "L"], ["\u039C", "M"], ["\u039D", "N"], ["\u039E", "KS"], ["\u039F", "O"], ["\u03A0", "P"], ["\u03A1", "R"], ["\u03A3", "S"], ["\u03A4", "T"], ["\u03A5", "Y"], ["\u03A6", "F"], ["\u03A7", "X"], ["\u03A8", "PS"], ["\u03A9", "O"], ["\u0386", "A"], ["\u0388", "E"], ["\u038A", "I"], ["\u038C", "O"], ["\u038E", "Y"], ["\u0389", "I"], ["\u038F", "O"], ["\u03AA", "I"], ["\u03AB", "Y"]]);
var Cr2 = Object.fromEntries([["\u0621", "e"], ["\u0622", "a"], ["\u0623", "a"], ["\u0624", "w"], ["\u0625", "i"], ["\u0626", "y"], ["\u0627", "a"], ["\u0628", "b"], ["\u0629", "t"], ["\u062A", "t"], ["\u062B", "th"], ["\u062C", "j"], ["\u062D", "h"], ["\u062E", "kh"], ["\u062F", "d"], ["\u0630", "dh"], ["\u0631", "r"], ["\u0632", "z"], ["\u0633", "s"], ["\u0634", "sh"], ["\u0635", "s"], ["\u0636", "d"], ["\u0637", "t"], ["\u0638", "z"], ["\u0639", "e"], ["\u063A", "gh"], ["\u0640", "_"], ["\u0641", "f"], ["\u0642", "q"], ["\u0643", "k"], ["\u0644", "l"], ["\u0645", "m"], ["\u0646", "n"], ["\u0647", "h"], ["\u0648", "w"], ["\u0649", "a"], ["\u064A", "y"], ["\u064E\u200E", "a"], ["\u064F", "u"], ["\u0650\u200E", "i"]]);
var Nr = Object.fromEntries([["\u0561", "a"], ["\u0531", "A"], ["\u0562", "b"], ["\u0532", "B"], ["\u0563", "g"], ["\u0533", "G"], ["\u0564", "d"], ["\u0534", "D"], ["\u0565", "ye"], ["\u0535", "Ye"], ["\u0566", "z"], ["\u0536", "Z"], ["\u0567", "e"], ["\u0537", "E"], ["\u0568", "y"], ["\u0538", "Y"], ["\u0569", "t"], ["\u0539", "T"], ["\u056A", "zh"], ["\u053A", "Zh"], ["\u056B", "i"], ["\u053B", "I"], ["\u056C", "l"], ["\u053C", "L"], ["\u056D", "kh"], ["\u053D", "Kh"], ["\u056E", "ts"], ["\u053E", "Ts"], ["\u056F", "k"], ["\u053F", "K"], ["\u0570", "h"], ["\u0540", "H"], ["\u0571", "dz"], ["\u0541", "Dz"], ["\u0572", "gh"], ["\u0542", "Gh"], ["\u0573", "tch"], ["\u0543", "Tch"], ["\u0574", "m"], ["\u0544", "M"], ["\u0575", "y"], ["\u0545", "Y"], ["\u0576", "n"], ["\u0546", "N"], ["\u0577", "sh"], ["\u0547", "Sh"], ["\u0578", "vo"], ["\u0548", "Vo"], ["\u0579", "ch"], ["\u0549", "Ch"], ["\u057A", "p"], ["\u054A", "P"], ["\u057B", "j"], ["\u054B", "J"], ["\u057C", "r"], ["\u054C", "R"], ["\u057D", "s"], ["\u054D", "S"], ["\u057E", "v"], ["\u054E", "V"], ["\u057F", "t"], ["\u054F", "T"], ["\u0580", "r"], ["\u0550", "R"], ["\u0581", "c"], ["\u0551", "C"], ["\u0578\u0582", "u"], ["\u0548\u0552", "U"], ["\u0548\u0582", "U"], ["\u0583", "p"], ["\u0553", "P"], ["\u0584", "q"], ["\u0554", "Q"], ["\u0585", "o"], ["\u0555", "O"], ["\u0586", "f"], ["\u0556", "F"], ["\u0587", "yev"]]);
var Dr = Object.fromEntries([["\u0686", "ch"], ["\u06A9", "k"], ["\u06AF", "g"], ["\u067E", "p"], ["\u0698", "zh"], ["\u06CC", "y"]]);
var Rr = Object.fromEntries([["\u05D0", "a"], ["\u05D1", "b"], ["\u05D2", "g"], ["\u05D3", "d"], ["\u05D4", "h"], ["\u05D5", "v"], ["\u05D6", "z"], ["\u05D7", "ch"], ["\u05D8", "t"], ["\u05D9", "y"], ["\u05DB", "k"], ["\u05DA", "kh"], ["\u05DC", "l"], ["\u05DD", "m"], ["\u05DE", "m"], ["\u05DF", "n"], ["\u05E0", "n"], ["\u05E1", "s"], ["\u05E2", "a"], ["\u05E4", "f"], ["\u05E3", "ph"], ["\u05E6", "ts"], ["\u05E5", "ts"], ["\u05E7", "k"], ["\u05E8", "r"], ["\u05E9", "sh"], ["\u05EA", "t"], ["\u05D5", "v"]]);
var ye2 = { ...Tr, ...Mr, ...Cr2, ...Dr, ...Nr, ...Rr };
var Lr = ((u2) => (u2.Any = "any", u2.Loopback = "loopback", u2.PrivateA = "private-a", u2.PrivateB = "private-b", u2.PrivateC = "private-c", u2.TestNet1 = "test-net-1", u2.TestNet2 = "test-net-2", u2.TestNet3 = "test-net-3", u2.LinkLocal = "link-local", u2.Multicast = "multicast", u2))(Lr || {});
var Pr = { any: "0.0.0.0/0", loopback: "127.0.0.0/8", "private-a": "10.0.0.0/8", "private-b": "172.16.0.0/12", "private-c": "192.168.0.0/16", "test-net-1": "192.0.2.0/24", "test-net-2": "198.51.100.0/24", "test-net-3": "203.0.113.0/24", "link-local": "169.254.0.0/16", multicast: "224.0.0.0/4" };
function ve2(i2) {
  return /^[a-z][a-z-]*[a-z]$/i.exec(i2) !== null;
}
function Ie2(i2, e2) {
  let r2 = i2.helpers.slugify(e2);
  if (ve2(r2)) return r2;
  let t2 = i2.helpers.slugify(i2.lorem.word());
  return ve2(t2) ? t2 : i2.string.alpha({ casing: "lower", length: i2.number.int({ min: 4, max: 8 }) });
}
var O2 = class extends p2 {
  email(e2 = {}) {
    let { firstName: r2, lastName: t2, provider: a2 = this.faker.helpers.arrayElement(this.faker.definitions.internet.free_email), allowSpecialCharacters: n2 = false } = e2, o2 = this.username({ firstName: r2, lastName: t2 });
    if (o2 = o2.replaceAll(/[^A-Za-z0-9._+-]+/g, ""), o2 = o2.substring(0, 50), n2) {
      let s2 = [..."._-"], l2 = [...".!#$%&'*+-/=?^_`{|}~"];
      o2 = o2.replace(this.faker.helpers.arrayElement(s2), this.faker.helpers.arrayElement(l2));
    }
    return o2 = o2.replaceAll(/\.{2,}/g, "."), o2 = o2.replace(/^\./, ""), o2 = o2.replace(/\.$/, ""), `${o2}@${a2}`;
  }
  exampleEmail(e2 = {}) {
    let { firstName: r2, lastName: t2, allowSpecialCharacters: a2 = false } = e2, n2 = this.faker.helpers.arrayElement(this.faker.definitions.internet.example_email);
    return this.email({ firstName: r2, lastName: t2, provider: n2, allowSpecialCharacters: a2 });
  }
  username(e2 = {}) {
    let { firstName: r2 = this.faker.person.firstName(), lastName: t2 = this.faker.person.lastName(), lastName: a2 } = e2, n2 = this.faker.helpers.arrayElement([".", "_"]), o2 = this.faker.number.int(99), s2 = [() => `${r2}${n2}${t2}${o2}`, () => `${r2}${n2}${t2}`];
    a2 || s2.push(() => `${r2}${o2}`);
    let l2 = this.faker.helpers.arrayElement(s2)();
    return l2 = l2.normalize("NFKD").replaceAll(/[\u0300-\u036F]/g, ""), l2 = [...l2].map((c2) => {
      if (ye2[c2]) return ye2[c2];
      let u2 = c2.codePointAt(0) ?? Number.NaN;
      return u2 < 128 ? c2 : u2.toString(36);
    }).join(""), l2 = l2.replaceAll("'", ""), l2 = l2.replaceAll(" ", ""), l2;
  }
  displayName(e2 = {}) {
    let { firstName: r2 = this.faker.person.firstName(), lastName: t2 = this.faker.person.lastName() } = e2, a2 = this.faker.helpers.arrayElement([".", "_"]), n2 = this.faker.number.int(99), o2 = [() => `${r2}${n2}`, () => `${r2}${a2}${t2}`, () => `${r2}${a2}${t2}${n2}`], s2 = this.faker.helpers.arrayElement(o2)();
    return s2 = s2.replaceAll("'", ""), s2 = s2.replaceAll(" ", ""), s2;
  }
  protocol() {
    let e2 = ["http", "https"];
    return this.faker.helpers.arrayElement(e2);
  }
  httpMethod() {
    let e2 = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    return this.faker.helpers.arrayElement(e2);
  }
  httpStatusCode(e2 = {}) {
    let { types: r2 = Object.keys(this.faker.definitions.internet.http_status_code) } = e2, t2 = this.faker.helpers.arrayElement(r2);
    return this.faker.helpers.arrayElement(this.faker.definitions.internet.http_status_code[t2]);
  }
  url(e2 = {}) {
    let { appendSlash: r2 = this.faker.datatype.boolean(), protocol: t2 = "https" } = e2;
    return `${t2}://${this.domainName()}${r2 ? "/" : ""}`;
  }
  domainName() {
    return `${this.domainWord()}.${this.domainSuffix()}`;
  }
  domainSuffix() {
    return this.faker.helpers.arrayElement(this.faker.definitions.internet.domain_suffix);
  }
  domainWord() {
    let e2 = Ie2(this.faker, this.faker.word.adjective()), r2 = Ie2(this.faker, this.faker.word.noun());
    return `${e2}-${r2}`.toLowerCase();
  }
  ip() {
    return this.faker.datatype.boolean() ? this.ipv4() : this.ipv6();
  }
  ipv4(e2 = {}) {
    let { network: r2 = "any", cidrBlock: t2 = Pr[r2] } = e2;
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/.test(t2)) throw new m2(`Invalid CIDR block provided: ${t2}. Must be in the format x.x.x.x/y.`);
    let [a2, n2] = t2.split("/"), o2 = 4294967295 >>> Number.parseInt(n2), [s2, l2, c2, u2] = a2.split(".").map(Number), f3 = (s2 << 24 | l2 << 16 | c2 << 8 | u2) & ~o2, k2 = this.faker.number.int(o2), b2 = f3 | k2;
    return [b2 >>> 24 & 255, b2 >>> 16 & 255, b2 >>> 8 & 255, b2 & 255].join(".");
  }
  ipv6() {
    return Array.from({ length: 8 }, () => this.faker.string.hexadecimal({ length: 4, casing: "lower", prefix: "" })).join(":");
  }
  port() {
    return this.faker.number.int(65535);
  }
  userAgent() {
    return this.faker.helpers.fake(this.faker.definitions.internet.user_agent_pattern);
  }
  mac(e2 = {}) {
    typeof e2 == "string" && (e2 = { separator: e2 });
    let { separator: r2 = ":" } = e2, t2, a2 = "";
    for ([":", "-", ""].includes(r2) || (r2 = ":"), t2 = 0; t2 < 12; t2++) a2 += this.faker.number.hex(15), t2 % 2 === 1 && t2 !== 11 && (a2 += r2);
    return a2;
  }
  password(e2 = {}) {
    let r2 = /[aeiouAEIOU]$/, t2 = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]$/, a2 = (c2, u2, h2, f3) => {
      if (f3.length >= c2) return f3;
      u2 && (h2 = t2.test(f3) ? r2 : t2);
      let k2 = this.faker.number.int(94) + 33, b2 = String.fromCodePoint(k2);
      return u2 && (b2 = b2.toLowerCase()), h2.test(b2) ? a2(c2, u2, h2, f3 + b2) : a2(c2, u2, h2, f3);
    }, { length: n2 = 15, memorable: o2 = false, pattern: s2 = /\w/, prefix: l2 = "" } = e2;
    return a2(n2, o2, s2, l2);
  }
  emoji(e2 = {}) {
    let { types: r2 = Object.keys(this.faker.definitions.internet.emoji) } = e2, t2 = this.faker.helpers.arrayElement(r2);
    return this.faker.helpers.arrayElement(this.faker.definitions.internet.emoji[t2]);
  }
  jwtAlgorithm() {
    return this.faker.helpers.arrayElement(this.faker.definitions.internet.jwt_algorithm);
  }
  jwt(e2 = {}) {
    let { refDate: r2 = this.faker.defaultRefDate() } = e2, t2 = this.faker.date.recent({ refDate: r2 }), { header: a2 = { alg: this.jwtAlgorithm(), typ: "JWT" }, payload: n2 = { iat: Math.round(t2.valueOf() / 1e3), exp: Math.round(this.faker.date.soon({ refDate: t2 }).valueOf() / 1e3), nbf: Math.round(this.faker.date.anytime({ refDate: r2 }).valueOf() / 1e3), iss: this.faker.company.name(), sub: this.faker.string.uuid(), aud: this.faker.string.uuid(), jti: this.faker.string.uuid() } } = e2, o2 = ge2(JSON.stringify(a2)), s2 = ge2(JSON.stringify(n2)), l2 = this.faker.string.alphanumeric(64);
    return `${o2}.${s2}.${l2}`;
  }
};
var _e2 = ((r2) => (r2.Female = "female", r2.Male = "male", r2))(_e2 || {});
function D2(i2, e2, r2) {
  let { generic: t2, female: a2, male: n2 } = r2;
  switch (e2) {
    case "female":
      return a2 ?? t2;
    case "male":
      return n2 ?? t2;
    default:
      return t2 ?? i2.helpers.arrayElement([a2, n2]) ?? [];
  }
}
var U2 = class extends p2 {
  firstName(e2) {
    return this.faker.helpers.arrayElement(D2(this.faker, e2, this.faker.definitions.person.first_name));
  }
  lastName(e2) {
    if (this.faker.rawDefinitions.person?.last_name_pattern != null) {
      let r2 = this.faker.helpers.weightedArrayElement(D2(this.faker, e2, this.faker.rawDefinitions.person.last_name_pattern));
      return this.faker.helpers.fake(r2);
    }
    return this.faker.helpers.arrayElement(D2(this.faker, e2, this.faker.definitions.person.last_name));
  }
  middleName(e2) {
    return this.faker.helpers.arrayElement(D2(this.faker, e2, this.faker.definitions.person.middle_name));
  }
  fullName(e2 = {}) {
    let { sex: r2 = this.faker.helpers.arrayElement(["female", "male"]), firstName: t2 = this.firstName(r2), lastName: a2 = this.lastName(r2) } = e2, n2 = this.faker.helpers.weightedArrayElement(this.faker.definitions.person.name);
    return this.faker.helpers.mustache(n2, { "person.prefix": () => this.prefix(r2), "person.firstName": () => t2, "person.middleName": () => this.middleName(r2), "person.lastName": () => a2, "person.suffix": () => this.suffix() });
  }
  gender() {
    return this.faker.helpers.arrayElement(this.faker.definitions.person.gender);
  }
  sex() {
    return this.faker.helpers.arrayElement(this.faker.definitions.person.sex);
  }
  sexType() {
    return this.faker.helpers.enumValue(_e2);
  }
  bio() {
    let { bio_pattern: e2 } = this.faker.definitions.person;
    return this.faker.helpers.fake(e2);
  }
  prefix(e2) {
    return this.faker.helpers.arrayElement(D2(this.faker, e2, this.faker.definitions.person.prefix));
  }
  suffix() {
    return this.faker.helpers.arrayElement(this.faker.definitions.person.suffix);
  }
  jobTitle() {
    return this.faker.helpers.fake(this.faker.definitions.person.job_title_pattern);
  }
  jobDescriptor() {
    return this.faker.helpers.arrayElement(this.faker.definitions.person.job_descriptor);
  }
  jobArea() {
    return this.faker.helpers.arrayElement(this.faker.definitions.person.job_area);
  }
  jobType() {
    return this.faker.helpers.arrayElement(this.faker.definitions.person.job_type);
  }
  zodiacSign() {
    return this.faker.helpers.arrayElement(this.faker.definitions.person.western_zodiac_sign);
  }
};
var Br = 23283064365386963e-26;
var vr = 1 / 9007199254740992;
var { imul: xe2, trunc: Ae2 } = Math;
function $e2(i2) {
  return typeof i2 == "number" ? Fe2(i2) : Ir(i2);
}
function Fe2(i2) {
  let e2 = Array.from({ length: 624 });
  e2[0] = i2;
  for (let r2 = 1; r2 !== 624; ++r2) {
    let t2 = e2[r2 - 1] ^ e2[r2 - 1] >>> 30;
    e2[r2] = Ae2(xe2(1812433253, t2) + r2);
  }
  return e2;
}
function Ir(i2) {
  let e2 = Fe2(19650218), r2 = 1, t2 = 0;
  for (let a2 = Math.max(624, i2.length); a2 !== 0; --a2) {
    let n2 = e2[r2 - 1] ^ e2[r2 - 1] >>> 30;
    e2[r2] = Ae2((e2[r2] ^ xe2(n2, 1664525)) + i2[t2] + t2), r2++, t2++, r2 >= 624 && (e2[0] = e2[623], r2 = 1), t2 >= i2.length && (t2 = 0);
  }
  for (let a2 = 623; a2 !== 0; a2--) e2[r2] = Ae2((e2[r2] ^ xe2(e2[r2 - 1] ^ e2[r2 - 1] >>> 30, 1566083941)) - r2), r2++, r2 >= 624 && (e2[0] = e2[623], r2 = 1);
  return e2[0] = 2147483648, e2;
}
function ke2(i2) {
  for (let r2 = 0; r2 !== 227; ++r2) {
    let t2 = (i2[r2] & 2147483648) + (i2[r2 + 1] & 2147483647);
    i2[r2] = i2[r2 + 397] ^ t2 >>> 1 ^ -(t2 & 1) & 2567483615;
  }
  for (let r2 = 227; r2 !== 623; ++r2) {
    let t2 = (i2[r2] & 2147483648) + (i2[r2 + 1] & 2147483647);
    i2[r2] = i2[r2 + 397 - 624] ^ t2 >>> 1 ^ -(t2 & 1) & 2567483615;
  }
  let e2 = (i2[623] & 2147483648) + (i2[0] & 2147483647);
  return i2[623] = i2[396] ^ e2 >>> 1 ^ -(e2 & 1) & 2567483615, i2;
}
var R2 = class {
  constructor(e2 = Math.random() * Number.MAX_SAFE_INTEGER, r2 = ke2($e2(e2)), t2 = 0) {
    this.states = r2;
    this.index = t2;
  }
  nextU32() {
    let e2 = this.states[this.index];
    return e2 ^= this.states[this.index] >>> 11, e2 ^= e2 << 7 & 2636928640, e2 ^= e2 << 15 & 4022730752, e2 ^= e2 >>> 18, ++this.index >= 624 && (this.states = ke2(this.states), this.index = 0), e2 >>> 0;
  }
  nextF32() {
    return this.nextU32() * Br;
  }
  nextU53() {
    let e2 = this.nextU32() >>> 5, r2 = this.nextU32() >>> 6;
    return e2 * 67108864 + r2;
  }
  nextF53() {
    return this.nextU53() * vr;
  }
  seed(e2) {
    this.states = ke2($e2(e2)), this.index = 0;
  }
};
function L2() {
  return Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER);
}
function Ge2(i2 = L2()) {
  let e2 = new R2(i2);
  return { next() {
    return e2.nextF53();
  }, seed(r2) {
    e2.seed(r2);
  } };
}
var K2 = class extends x2 {
  boolean(e2 = {}) {
    typeof e2 == "number" && (e2 = { probability: e2 });
    let { probability: r2 = 0.5 } = e2;
    return r2 <= 0 ? false : r2 >= 1 ? true : this.faker.number.float() < r2;
  }
};
function w2(i2, e2 = "refDate") {
  let r2 = new Date(i2);
  if (Number.isNaN(r2.valueOf())) throw new m2(`Invalid ${e2} date: ${i2.toString()}`);
  return r2;
}
var j2 = () => {
  throw new m2("You cannot edit the locale data on the faker instance");
};
function Oe2(i2) {
  let e2 = {};
  return new Proxy(i2, { has() {
    return true;
  }, get(r2, t2) {
    return typeof t2 == "symbol" || t2 === "nodeType" ? r2[t2] : t2 in e2 ? e2[t2] : e2[t2] = _r(t2, r2[t2]);
  }, set: j2, deleteProperty: j2 });
}
function H2(i2, ...e2) {
  if (i2 === null) throw new m2(`The locale data for '${e2.join(".")}' aren't applicable to this locale.
  If you think this is a bug, please report it at: https://github.com/faker-js/faker`);
  if (i2 === void 0) throw new m2(`The locale data for '${e2.join(".")}' are missing in this locale.
  If this is a custom Faker instance, please make sure all required locales are used e.g. '[de_AT, de, en, base]'.
  Please contribute the missing data to the project or use a locale/Faker instance that has these data.
  For more information see https://fakerjs.dev/guide/localization.html`);
}
function _r(i2, e2 = {}) {
  return new Proxy(e2, { has(r2, t2) {
    return r2[t2] != null;
  }, get(r2, t2) {
    let a2 = r2[t2];
    return typeof t2 == "symbol" || t2 === "nodeType" || H2(a2, i2, t2.toString()), a2;
  }, set: j2, deleteProperty: j2 });
}
var P2 = class extends x2 {
  anytime(e2 = {}) {
    let { refDate: r2 = this.faker.defaultRefDate() } = e2, t2 = w2(r2).getTime();
    return this.between({ from: t2 - 1e3 * 60 * 60 * 24 * 365, to: t2 + 1e3 * 60 * 60 * 24 * 365 });
  }
  past(e2 = {}) {
    let { years: r2 = 1, refDate: t2 = this.faker.defaultRefDate() } = e2;
    if (r2 <= 0) throw new m2("Years must be greater than 0.");
    let a2 = w2(t2).getTime();
    return this.between({ from: a2 - r2 * 365 * 24 * 3600 * 1e3, to: a2 - 1e3 });
  }
  future(e2 = {}) {
    let { years: r2 = 1, refDate: t2 = this.faker.defaultRefDate() } = e2;
    if (r2 <= 0) throw new m2("Years must be greater than 0.");
    let a2 = w2(t2).getTime();
    return this.between({ from: a2 + 1e3, to: a2 + r2 * 365 * 24 * 3600 * 1e3 });
  }
  between(e2) {
    let { from: r2, to: t2 } = e2, a2 = w2(r2, "from").getTime(), n2 = w2(t2, "to").getTime();
    if (a2 > n2) throw new m2("`from` date must be before `to` date.");
    return new Date(this.faker.number.int({ min: a2, max: n2 }));
  }
  betweens(e2) {
    let { from: r2, to: t2, count: a2 = 3 } = e2;
    return this.faker.helpers.multiple(() => this.between({ from: r2, to: t2 }), { count: a2 }).sort((n2, o2) => n2.getTime() - o2.getTime());
  }
  recent(e2 = {}) {
    let { days: r2 = 1, refDate: t2 = this.faker.defaultRefDate() } = e2;
    if (r2 <= 0) throw new m2("Days must be greater than 0.");
    let a2 = w2(t2).getTime();
    return this.between({ from: a2 - r2 * 24 * 3600 * 1e3, to: a2 - 1e3 });
  }
  soon(e2 = {}) {
    let { days: r2 = 1, refDate: t2 = this.faker.defaultRefDate() } = e2;
    if (r2 <= 0) throw new m2("Days must be greater than 0.");
    let a2 = w2(t2).getTime();
    return this.between({ from: a2 + 1e3, to: a2 + r2 * 24 * 3600 * 1e3 });
  }
  birthdate(e2 = {}) {
    let { mode: r2 = "age", min: t2 = 18, max: a2 = 80, refDate: n2 = this.faker.defaultRefDate() } = e2, o2 = w2(n2), s2 = o2.getUTCFullYear();
    switch (r2) {
      case "age": {
        let c2 = new Date(o2).setUTCFullYear(s2 - a2 - 1) + 864e5, u2 = new Date(o2).setUTCFullYear(s2 - t2);
        if (c2 > u2) throw new m2(`Max age ${a2} should be greater than or equal to min age ${t2}.`);
        return this.between({ from: c2, to: u2 });
      }
      case "year": {
        let l2 = new Date(Date.UTC(0, 0, 2)).setUTCFullYear(t2), c2 = new Date(Date.UTC(0, 11, 30)).setUTCFullYear(a2);
        if (l2 > c2) throw new m2(`Max year ${a2} should be greater than or equal to min year ${t2}.`);
        return this.between({ from: l2, to: c2 });
      }
    }
  }
};
var V2 = class extends P2 {
  constructor(r2) {
    super(r2);
    this.faker = r2;
  }
  month(r2 = {}) {
    let { abbreviated: t2 = false, context: a2 = false } = r2, n2 = this.faker.definitions.date.month, o2;
    t2 ? o2 = a2 && n2.abbr_context != null ? "abbr_context" : "abbr" : o2 = a2 && n2.wide_context != null ? "wide_context" : "wide";
    let s2 = n2[o2];
    return H2(s2, "date.month", o2), this.faker.helpers.arrayElement(s2);
  }
  weekday(r2 = {}) {
    let { abbreviated: t2 = false, context: a2 = false } = r2, n2 = this.faker.definitions.date.weekday, o2;
    t2 ? o2 = a2 && n2.abbr_context != null ? "abbr_context" : "abbr" : o2 = a2 && n2.wide_context != null ? "wide_context" : "wide";
    let s2 = n2[o2];
    return H2(s2, "date.weekday", o2), this.faker.helpers.arrayElement(s2);
  }
  timeZone() {
    return this.faker.helpers.arrayElement(this.faker.definitions.date.time_zone);
  }
};
var $r = /\.|\(/;
function Ue2(i2, e2, r2 = [e2, e2.rawDefinitions]) {
  if (i2.length === 0) throw new m2("Eval expression cannot be empty.");
  if (r2.length === 0) throw new m2("Eval entrypoints cannot be empty.");
  let t2 = r2, a2 = i2;
  do {
    let o2;
    a2.startsWith("(") ? [o2, t2] = Fr(a2, t2) : [o2, t2] = Or(a2, t2), a2 = a2.substring(o2), t2 = t2.filter((s2) => s2 != null).map((s2) => Array.isArray(s2) ? e2.helpers.arrayElement(s2) : s2);
  } while (a2.length > 0 && t2.length > 0);
  if (t2.length === 0) throw new m2(`Cannot resolve expression '${i2}'`);
  let n2 = t2[0];
  return typeof n2 == "function" ? n2() : n2;
}
function Fr(i2, e2) {
  let [r2, t2] = Gr(i2), a2 = i2[r2 + 1];
  switch (a2) {
    case ".":
    case "(":
    case void 0:
      break;
    default:
      throw new m2(`Expected dot ('.'), open parenthesis ('('), or nothing after function call but got '${a2}'`);
  }
  return [r2 + (a2 === "." ? 2 : 1), e2.map((n2) => typeof n2 == "function" ? n2(...t2) : void 0)];
}
function Gr(i2) {
  let e2 = i2.indexOf(")", 1);
  if (e2 === -1) throw new m2(`Missing closing parenthesis in '${i2}'`);
  for (; e2 !== -1; ) {
    let t2 = i2.substring(1, e2);
    try {
      return [e2, JSON.parse(`[${t2}]`)];
    } catch {
      if (!t2.includes("'") && !t2.includes('"')) try {
        return [e2, JSON.parse(`["${t2}"]`)];
      } catch {
      }
    }
    e2 = i2.indexOf(")", e2 + 1);
  }
  e2 = i2.lastIndexOf(")");
  let r2 = i2.substring(1, e2);
  return [e2, [r2]];
}
function Or(i2, e2) {
  let r2 = $r.exec(i2), t2 = (r2?.[0] ?? "") === ".", a2 = r2?.index ?? i2.length, n2 = i2.substring(0, a2);
  if (n2.length === 0) throw new m2(`Expression parts cannot be empty in '${i2}'`);
  let o2 = i2[a2 + 1];
  if (t2 && (o2 == null || o2 === "." || o2 === "(")) throw new m2(`Found dot without property name in '${i2}'`);
  return [a2 + (t2 ? 1 : 0), e2.map((s2) => Ur(s2, n2))];
}
function Ur(i2, e2) {
  switch (typeof i2) {
    case "function": {
      try {
        i2 = i2();
      } catch {
        return;
      }
      return i2?.[e2];
    }
    case "object":
      return i2?.[e2];
    default:
      return;
  }
}
function Ke2(i2) {
  let e2 = Kr(i2.replace(/L?$/, "0"));
  return e2 === 0 ? 0 : 10 - e2;
}
function Kr(i2) {
  i2 = i2.replaceAll(/[\s-]/g, "");
  let e2 = 0, r2 = false;
  for (let t2 = i2.length - 1; t2 >= 0; t2--) {
    let a2 = Number.parseInt(i2[t2]);
    r2 && (a2 *= 2, a2 > 9 && (a2 = a2 % 10 + 1)), e2 += a2, r2 = !r2;
  }
  return e2 % 10;
}
function je2(i2, e2, r2, t2) {
  let a2 = 1;
  if (e2) switch (e2) {
    case "?": {
      a2 = i2.datatype.boolean() ? 0 : 1;
      break;
    }
    case "*": {
      let n2 = 1;
      for (; i2.datatype.boolean(); ) n2 *= 2;
      a2 = i2.number.int({ min: 0, max: n2 });
      break;
    }
    case "+": {
      let n2 = 1;
      for (; i2.datatype.boolean(); ) n2 *= 2;
      a2 = i2.number.int({ min: 1, max: n2 });
      break;
    }
    default:
      throw new m2("Unknown quantifier symbol provided.");
  }
  else r2 != null && t2 != null ? a2 = i2.number.int({ min: Number.parseInt(r2), max: Number.parseInt(t2) }) : r2 != null && t2 == null && (a2 = Number.parseInt(r2));
  return a2;
}
function jr(i2, e2 = "") {
  let r2 = /(.)\{(\d+),(\d+)\}/, t2 = /(.)\{(\d+)\}/, a2 = /\[(\d+)-(\d+)\]/, n2, o2, s2, l2, c2 = r2.exec(e2);
  for (; c2 != null; ) n2 = Number.parseInt(c2[2]), o2 = Number.parseInt(c2[3]), n2 > o2 && (s2 = o2, o2 = n2, n2 = s2), l2 = i2.number.int({ min: n2, max: o2 }), e2 = e2.slice(0, c2.index) + c2[1].repeat(l2) + e2.slice(c2.index + c2[0].length), c2 = r2.exec(e2);
  for (c2 = t2.exec(e2); c2 != null; ) l2 = Number.parseInt(c2[2]), e2 = e2.slice(0, c2.index) + c2[1].repeat(l2) + e2.slice(c2.index + c2[0].length), c2 = t2.exec(e2);
  for (c2 = a2.exec(e2); c2 != null; ) n2 = Number.parseInt(c2[1]), o2 = Number.parseInt(c2[2]), n2 > o2 && (s2 = o2, o2 = n2, n2 = s2), e2 = e2.slice(0, c2.index) + i2.number.int({ min: n2, max: o2 }).toString() + e2.slice(c2.index + c2[0].length), c2 = a2.exec(e2);
  return e2;
}
function Ee2(i2, e2 = "", r2 = "#") {
  let t2 = "";
  for (let a2 = 0; a2 < e2.length; a2++) e2.charAt(a2) === r2 ? t2 += i2.number.int(9) : e2.charAt(a2) === "!" ? t2 += i2.number.int({ min: 2, max: 9 }) : t2 += e2.charAt(a2);
  return t2;
}
var B2 = class extends x2 {
  slugify(e2 = "") {
    return e2.normalize("NFKD").replaceAll(/[\u0300-\u036F]/g, "").replaceAll(" ", "-").replaceAll(/[^\w.-]+/g, "");
  }
  replaceSymbols(e2 = "") {
    let r2 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"], t2 = "";
    for (let a2 = 0; a2 < e2.length; a2++) e2.charAt(a2) === "#" ? t2 += this.faker.number.int(9) : e2.charAt(a2) === "?" ? t2 += this.arrayElement(r2) : e2.charAt(a2) === "*" ? t2 += this.faker.datatype.boolean() ? this.arrayElement(r2) : this.faker.number.int(9) : t2 += e2.charAt(a2);
    return t2;
  }
  replaceCreditCardSymbols(e2 = "6453-####-####-####-###L", r2 = "#") {
    e2 = jr(this.faker, e2), e2 = Ee2(this.faker, e2, r2);
    let t2 = Ke2(e2);
    return e2.replace("L", String(t2));
  }
  fromRegExp(e2) {
    let r2 = false;
    e2 instanceof RegExp && (r2 = e2.flags.includes("i"), e2 = e2.toString(), e2 = /\/(.+?)\//.exec(e2)?.[1] ?? "");
    let t2, a2, n2, o2 = /([.A-Za-z0-9])(?:\{(\d+)(?:,(\d+)|)\}|(\?|\*|\+))(?![^[]*]|[^{]*})/, s2 = o2.exec(e2);
    for (; s2 != null; ) {
      let f3 = s2[2], k2 = s2[3], b2 = s2[4];
      n2 = je2(this.faker, b2, f3, k2);
      let g2;
      s2[1] === "." ? g2 = this.faker.string.alphanumeric(n2) : r2 ? g2 = this.faker.string.fromCharacters([s2[1].toLowerCase(), s2[1].toUpperCase()], n2) : g2 = s2[1].repeat(n2), e2 = e2.slice(0, s2.index) + g2 + e2.slice(s2.index + s2[0].length), s2 = o2.exec(e2);
    }
    let l2 = /(\d-\d|\w-\w|\d|\w|[-!@#$&()`.+,/"])/, c2 = /\[(\^|)(-|)(.+?)\](?:\{(\d+)(?:,(\d+)|)\}|(\?|\*|\+)|)/;
    for (s2 = c2.exec(e2); s2 != null; ) {
      let f3 = s2[1] === "^", k2 = s2[2] === "-", b2 = s2[4], g2 = s2[5], C2 = s2[6], y2 = [], $2 = s2[3], M2 = l2.exec($2);
      for (k2 && y2.push(45); M2 != null; ) {
        if (M2[0].includes("-")) {
          let E2 = M2[0].split("-").map((d2) => d2.codePointAt(0) ?? Number.NaN);
          if (t2 = E2[0], a2 = E2[1], t2 > a2) throw new m2("Character range provided is out of order.");
          for (let d2 = t2; d2 <= a2; d2++) if (r2 && Number.isNaN(Number(String.fromCodePoint(d2)))) {
            let Te2 = String.fromCodePoint(d2);
            y2.push(Te2.toUpperCase().codePointAt(0) ?? Number.NaN, Te2.toLowerCase().codePointAt(0) ?? Number.NaN);
          } else y2.push(d2);
        } else r2 && Number.isNaN(Number(M2[0])) ? y2.push(M2[0].toUpperCase().codePointAt(0) ?? Number.NaN, M2[0].toLowerCase().codePointAt(0) ?? Number.NaN) : y2.push(M2[0].codePointAt(0) ?? Number.NaN);
        $2 = $2.substring(M2[0].length), M2 = l2.exec($2);
      }
      if (n2 = je2(this.faker, C2, b2, g2), f3) {
        let E2 = -1;
        for (let d2 = 48; d2 <= 57; d2++) {
          if (E2 = y2.indexOf(d2), E2 > -1) {
            y2.splice(E2, 1);
            continue;
          }
          y2.push(d2);
        }
        for (let d2 = 65; d2 <= 90; d2++) {
          if (E2 = y2.indexOf(d2), E2 > -1) {
            y2.splice(E2, 1);
            continue;
          }
          y2.push(d2);
        }
        for (let d2 = 97; d2 <= 122; d2++) {
          if (E2 = y2.indexOf(d2), E2 > -1) {
            y2.splice(E2, 1);
            continue;
          }
          y2.push(d2);
        }
      }
      let yr2 = this.multiple(() => String.fromCodePoint(this.arrayElement(y2)), { count: n2 }).join("");
      e2 = e2.slice(0, s2.index) + yr2 + e2.slice(s2.index + s2[0].length), s2 = c2.exec(e2);
    }
    let u2 = /(.)\{(\d+),(\d+)\}/;
    for (s2 = u2.exec(e2); s2 != null; ) {
      if (t2 = Number.parseInt(s2[2]), a2 = Number.parseInt(s2[3]), t2 > a2) throw new m2("Numbers out of order in {} quantifier.");
      n2 = this.faker.number.int({ min: t2, max: a2 }), e2 = e2.slice(0, s2.index) + s2[1].repeat(n2) + e2.slice(s2.index + s2[0].length), s2 = u2.exec(e2);
    }
    let h2 = /(.)\{(\d+)\}/;
    for (s2 = h2.exec(e2); s2 != null; ) n2 = Number.parseInt(s2[2]), e2 = e2.slice(0, s2.index) + s2[1].repeat(n2) + e2.slice(s2.index + s2[0].length), s2 = h2.exec(e2);
    return e2;
  }
  shuffle(e2, r2 = {}) {
    let { inplace: t2 = false } = r2;
    t2 || (e2 = [...e2]);
    for (let a2 = e2.length - 1; a2 > 0; --a2) {
      let n2 = this.faker.number.int(a2);
      [e2[a2], e2[n2]] = [e2[n2], e2[a2]];
    }
    return e2;
  }
  uniqueArray(e2, r2) {
    if (Array.isArray(e2)) {
      let n2 = [...new Set(e2)];
      return this.shuffle(n2).splice(0, r2);
    }
    let t2 = /* @__PURE__ */ new Set();
    try {
      if (typeof e2 == "function") {
        let a2 = 1e3 * r2, n2 = 0;
        for (; t2.size < r2 && n2 < a2; ) t2.add(e2()), n2++;
      }
    } catch {
    }
    return [...t2];
  }
  mustache(e2, r2) {
    if (e2 == null) return "";
    for (let t2 in r2) {
      let a2 = new RegExp(`{{${t2}}}`, "g"), n2 = r2[t2];
      typeof n2 == "string" && (n2 = n2.replaceAll("$", "$$$$")), e2 = e2.replace(a2, n2);
    }
    return e2;
  }
  maybe(e2, r2 = {}) {
    if (this.faker.datatype.boolean(r2)) return e2();
  }
  objectKey(e2) {
    let r2 = Object.keys(e2);
    return this.arrayElement(r2);
  }
  objectValue(e2) {
    let r2 = this.faker.helpers.objectKey(e2);
    return e2[r2];
  }
  objectEntry(e2) {
    let r2 = this.faker.helpers.objectKey(e2);
    return [r2, e2[r2]];
  }
  arrayElement(e2) {
    if (e2.length === 0) throw new m2("Cannot get value from empty dataset.");
    let r2 = e2.length > 1 ? this.faker.number.int({ max: e2.length - 1 }) : 0;
    return e2[r2];
  }
  weightedArrayElement(e2) {
    if (e2.length === 0) throw new m2("weightedArrayElement expects an array with at least one element");
    if (!e2.every((n2) => n2.weight > 0)) throw new m2("weightedArrayElement expects an array of { weight, value } objects where weight is a positive number");
    let r2 = e2.reduce((n2, { weight: o2 }) => n2 + o2, 0), t2 = this.faker.number.float({ min: 0, max: r2 }), a2 = 0;
    for (let { weight: n2, value: o2 } of e2) if (a2 += n2, t2 < a2) return o2;
    return e2.at(-1).value;
  }
  arrayElements(e2, r2) {
    if (e2.length === 0) return [];
    let t2 = this.rangeToNumber(r2 ?? { min: 1, max: e2.length });
    if (t2 >= e2.length) return this.shuffle(e2);
    if (t2 <= 0) return [];
    let a2 = [...e2], n2 = e2.length, o2 = n2 - t2, s2, l2;
    for (; n2-- > o2; ) l2 = this.faker.number.int(n2), s2 = a2[l2], a2[l2] = a2[n2], a2[n2] = s2;
    return a2.slice(o2);
  }
  enumValue(e2) {
    let r2 = Object.keys(e2).filter((a2) => Number.isNaN(Number(a2))), t2 = this.arrayElement(r2);
    return e2[t2];
  }
  rangeToNumber(e2) {
    return typeof e2 == "number" ? e2 : this.faker.number.int(e2);
  }
  multiple(e2, r2 = {}) {
    let t2 = this.rangeToNumber(r2.count ?? 3);
    return t2 <= 0 ? [] : Array.from({ length: t2 }, e2);
  }
};
var z2 = class extends B2 {
  constructor(r2) {
    super(r2);
    this.faker = r2;
  }
  fake(r2) {
    r2 = typeof r2 == "string" ? r2 : this.arrayElement(r2);
    let t2 = r2.search(/{{[a-z]/), a2 = r2.indexOf("}}", t2);
    if (t2 === -1 || a2 === -1) return r2;
    let o2 = r2.substring(t2 + 2, a2 + 2).replace("}}", "").replace("{{", ""), s2 = Ue2(o2, this.faker), l2 = String(s2), c2 = r2.substring(0, t2) + l2 + r2.substring(a2 + 2);
    return this.fake(c2);
  }
};
var v2 = class extends x2 {
  latitude(e2 = {}) {
    let { max: r2 = 90, min: t2 = -90, precision: a2 = 4 } = e2;
    return this.faker.number.float({ min: t2, max: r2, fractionDigits: a2 });
  }
  longitude(e2 = {}) {
    let { max: r2 = 180, min: t2 = -180, precision: a2 = 4 } = e2;
    return this.faker.number.float({ max: r2, min: t2, fractionDigits: a2 });
  }
  nearbyGPSCoordinate(e2 = {}) {
    let { origin: r2, radius: t2 = 10, isMetric: a2 = false } = e2;
    if (r2 == null) return [this.latitude(), this.longitude()];
    let n2 = this.faker.number.float({ max: 2 * Math.PI, fractionDigits: 5 }), o2 = a2 ? t2 : t2 * 1.60934, l2 = this.faker.number.float({ max: o2, fractionDigits: 3 }) * 0.995, c2 = 4e4 / 360, u2 = l2 / c2, h2 = [r2[0] + Math.sin(n2) * u2, r2[1] + Math.cos(n2) * u2];
    return h2[0] = h2[0] % 180, (h2[0] < -90 || h2[0] > 90) && (h2[0] = Math.sign(h2[0]) * 180 - h2[0], h2[1] += 180), h2[1] = (h2[1] % 360 + 540) % 360 - 180, [h2[0], h2[1]];
  }
};
var Y2 = class extends v2 {
  constructor(r2) {
    super(r2);
    this.faker = r2;
  }
  zipCode(r2 = {}) {
    typeof r2 == "string" && (r2 = { format: r2 });
    let { state: t2 } = r2;
    if (t2 != null) {
      let n2 = this.faker.definitions.location.postcode_by_state[t2];
      if (n2 == null) throw new m2(`No zip code definition found for state "${t2}"`);
      return this.faker.helpers.fake(n2);
    }
    let { format: a2 = this.faker.definitions.location.postcode } = r2;
    return typeof a2 == "string" && (a2 = [a2]), a2 = this.faker.helpers.arrayElement(a2), this.faker.helpers.replaceSymbols(a2);
  }
  city() {
    return this.faker.helpers.fake(this.faker.definitions.location.city_pattern);
  }
  buildingNumber() {
    return this.faker.helpers.arrayElement(this.faker.definitions.location.building_number).replaceAll(/#+/g, (r2) => this.faker.string.numeric({ length: r2.length, allowLeadingZeros: false }));
  }
  street() {
    return this.faker.helpers.fake(this.faker.definitions.location.street_pattern);
  }
  streetAddress(r2 = {}) {
    typeof r2 == "boolean" && (r2 = { useFullAddress: r2 });
    let { useFullAddress: t2 } = r2, n2 = this.faker.definitions.location.street_address[t2 ? "full" : "normal"];
    return this.faker.helpers.fake(n2);
  }
  secondaryAddress() {
    return this.faker.helpers.fake(this.faker.definitions.location.secondary_address).replaceAll(/#+/g, (r2) => this.faker.string.numeric({ length: r2.length, allowLeadingZeros: false }));
  }
  county() {
    return this.faker.helpers.arrayElement(this.faker.definitions.location.county);
  }
  country() {
    return this.faker.helpers.arrayElement(this.faker.definitions.location.country);
  }
  continent() {
    return this.faker.helpers.arrayElement(this.faker.definitions.location.continent);
  }
  countryCode(r2 = {}) {
    typeof r2 == "string" && (r2 = { variant: r2 });
    let { variant: t2 = "alpha-2" } = r2, a2 = (() => {
      switch (t2) {
        case "numeric":
          return "numeric";
        case "alpha-3":
          return "alpha3";
        case "alpha-2":
          return "alpha2";
      }
    })();
    return this.faker.helpers.arrayElement(this.faker.definitions.location.country_code)[a2];
  }
  state(r2 = {}) {
    let { abbreviated: t2 = false } = r2, a2 = t2 ? this.faker.definitions.location.state_abbr : this.faker.definitions.location.state;
    return this.faker.helpers.arrayElement(a2);
  }
  direction(r2 = {}) {
    let { abbreviated: t2 = false } = r2;
    return t2 ? this.faker.helpers.arrayElement([...this.faker.definitions.location.direction.cardinal_abbr, ...this.faker.definitions.location.direction.ordinal_abbr]) : this.faker.helpers.arrayElement([...this.faker.definitions.location.direction.cardinal, ...this.faker.definitions.location.direction.ordinal]);
  }
  cardinalDirection(r2 = {}) {
    let { abbreviated: t2 = false } = r2;
    return t2 ? this.faker.helpers.arrayElement(this.faker.definitions.location.direction.cardinal_abbr) : this.faker.helpers.arrayElement(this.faker.definitions.location.direction.cardinal);
  }
  ordinalDirection(r2 = {}) {
    let { abbreviated: t2 = false } = r2;
    return t2 ? this.faker.helpers.arrayElement(this.faker.definitions.location.direction.ordinal_abbr) : this.faker.helpers.arrayElement(this.faker.definitions.location.direction.ordinal);
  }
  timeZone() {
    return this.faker.helpers.arrayElement(this.faker.definitions.location.time_zone);
  }
  language() {
    return this.faker.helpers.arrayElement(this.faker.definitions.location.language);
  }
};
var W2 = class extends x2 {
  int(e2 = {}) {
    typeof e2 == "number" && (e2 = { max: e2 });
    let { min: r2 = 0, max: t2 = Number.MAX_SAFE_INTEGER, multipleOf: a2 = 1 } = e2;
    if (!Number.isInteger(a2)) throw new m2("multipleOf should be an integer.");
    if (a2 <= 0) throw new m2("multipleOf should be greater than 0.");
    let n2 = Math.ceil(r2 / a2), o2 = Math.floor(t2 / a2);
    if (n2 === o2) return n2 * a2;
    if (o2 < n2) throw t2 >= r2 ? new m2(`No suitable integer value between ${r2} and ${t2} found.`) : new m2(`Max ${t2} should be greater than min ${r2}.`);
    let l2 = this.faker._randomizer.next(), c2 = o2 - n2 + 1;
    return Math.floor(l2 * c2 + n2) * a2;
  }
  float(e2 = {}) {
    typeof e2 == "number" && (e2 = { max: e2 });
    let { min: r2 = 0, max: t2 = 1, fractionDigits: a2, multipleOf: n2, multipleOf: o2 = a2 == null ? void 0 : 10 ** -a2 } = e2;
    if (t2 < r2) throw new m2(`Max ${t2} should be greater than min ${r2}.`);
    if (a2 != null) {
      if (n2 != null) throw new m2("multipleOf and fractionDigits cannot be set at the same time.");
      if (!Number.isInteger(a2)) throw new m2("fractionDigits should be an integer.");
      if (a2 < 0) throw new m2("fractionDigits should be greater than or equal to 0.");
    }
    if (o2 != null) {
      if (o2 <= 0) throw new m2("multipleOf should be greater than 0.");
      let c2 = Math.log10(o2), u2 = o2 < 1 && Number.isInteger(c2) ? 10 ** -c2 : 1 / o2;
      return this.int({ min: r2 * u2, max: t2 * u2 }) / u2;
    }
    return this.faker._randomizer.next() * (t2 - r2) + r2;
  }
  binary(e2 = {}) {
    typeof e2 == "number" && (e2 = { max: e2 });
    let { min: r2 = 0, max: t2 = 1 } = e2;
    return this.int({ max: t2, min: r2 }).toString(2);
  }
  octal(e2 = {}) {
    typeof e2 == "number" && (e2 = { max: e2 });
    let { min: r2 = 0, max: t2 = 7 } = e2;
    return this.int({ max: t2, min: r2 }).toString(8);
  }
  hex(e2 = {}) {
    typeof e2 == "number" && (e2 = { max: e2 });
    let { min: r2 = 0, max: t2 = 15 } = e2;
    return this.int({ max: t2, min: r2 }).toString(16);
  }
  bigInt(e2 = {}) {
    (typeof e2 == "bigint" || typeof e2 == "number" || typeof e2 == "string" || typeof e2 == "boolean") && (e2 = { max: e2 });
    let r2 = BigInt(e2.min ?? 0), t2 = BigInt(e2.max ?? r2 + BigInt(999999999999999)), a2 = BigInt(e2.multipleOf ?? 1);
    if (t2 < r2) throw new m2(`Max ${t2} should be larger than min ${r2}.`);
    if (a2 <= BigInt(0)) throw new m2("multipleOf should be greater than 0.");
    let n2 = r2 / a2 + (r2 % a2 > 0n ? 1n : 0n), o2 = t2 / a2 - (t2 % a2 < 0n ? 1n : 0n);
    if (n2 === o2) return n2 * a2;
    if (o2 < n2) throw new m2(`No suitable bigint value between ${r2} and ${t2} found.`);
    let s2 = o2 - n2 + 1n, l2 = BigInt(this.faker.string.numeric({ length: s2.toString(10).length, allowLeadingZeros: true })) % s2;
    return (n2 + l2) * a2;
  }
  romanNumeral(e2 = {}) {
    typeof e2 == "number" && (e2 = { max: e2 });
    let { min: a2 = 1, max: n2 = 3999 } = e2;
    if (a2 < 1) throw new m2(`Min value ${a2} should be 1 or greater.`);
    if (n2 > 3999) throw new m2(`Max value ${n2} should be 3999 or less.`);
    let o2 = this.int({ min: a2, max: n2 }), s2 = [["M", 1e3], ["CM", 900], ["D", 500], ["CD", 400], ["C", 100], ["XC", 90], ["L", 50], ["XL", 40], ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1]], l2 = "";
    for (let [c2, u2] of s2) l2 += c2.repeat(Math.floor(o2 / u2)), o2 %= u2;
    return l2;
  }
};
var we2 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function He2(i2) {
  let e2 = i2.valueOf(), r2 = "";
  for (let t2 = 10; t2 > 0; t2--) {
    let a2 = e2 % 32;
    r2 = we2[a2] + r2, e2 = (e2 - a2) / 32;
  }
  return r2;
}
var Z2 = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
var J2 = [..."abcdefghijklmnopqrstuvwxyz"];
var Ve2 = [..."0123456789"];
var X2 = class extends x2 {
  fromCharacters(e2, r2 = 1) {
    if (r2 = this.faker.helpers.rangeToNumber(r2), r2 <= 0) return "";
    if (typeof e2 == "string" && (e2 = [...e2]), e2.length === 0) throw new m2("Unable to generate string: No characters to select from.");
    return this.faker.helpers.multiple(() => this.faker.helpers.arrayElement(e2), { count: r2 }).join("");
  }
  alpha(e2 = {}) {
    typeof e2 == "number" && (e2 = { length: e2 });
    let r2 = this.faker.helpers.rangeToNumber(e2.length ?? 1);
    if (r2 <= 0) return "";
    let { casing: t2 = "mixed" } = e2, { exclude: a2 = [] } = e2;
    typeof a2 == "string" && (a2 = [...a2]);
    let n2;
    switch (t2) {
      case "upper": {
        n2 = [...Z2];
        break;
      }
      case "lower": {
        n2 = [...J2];
        break;
      }
      case "mixed": {
        n2 = [...J2, ...Z2];
        break;
      }
    }
    return n2 = n2.filter((o2) => !a2.includes(o2)), this.fromCharacters(n2, r2);
  }
  alphanumeric(e2 = {}) {
    typeof e2 == "number" && (e2 = { length: e2 });
    let r2 = this.faker.helpers.rangeToNumber(e2.length ?? 1);
    if (r2 <= 0) return "";
    let { casing: t2 = "mixed" } = e2, { exclude: a2 = [] } = e2;
    typeof a2 == "string" && (a2 = [...a2]);
    let n2 = [...Ve2];
    switch (t2) {
      case "upper": {
        n2.push(...Z2);
        break;
      }
      case "lower": {
        n2.push(...J2);
        break;
      }
      case "mixed": {
        n2.push(...J2, ...Z2);
        break;
      }
    }
    return n2 = n2.filter((o2) => !a2.includes(o2)), this.fromCharacters(n2, r2);
  }
  binary(e2 = {}) {
    let { prefix: r2 = "0b" } = e2, t2 = r2;
    return t2 += this.fromCharacters(["0", "1"], e2.length ?? 1), t2;
  }
  octal(e2 = {}) {
    let { prefix: r2 = "0o" } = e2, t2 = r2;
    return t2 += this.fromCharacters(["0", "1", "2", "3", "4", "5", "6", "7"], e2.length ?? 1), t2;
  }
  hexadecimal(e2 = {}) {
    let { casing: r2 = "mixed", prefix: t2 = "0x" } = e2, a2 = this.faker.helpers.rangeToNumber(e2.length ?? 1);
    if (a2 <= 0) return t2;
    let n2 = this.fromCharacters(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "A", "B", "C", "D", "E", "F"], a2);
    return r2 === "upper" ? n2 = n2.toUpperCase() : r2 === "lower" && (n2 = n2.toLowerCase()), `${t2}${n2}`;
  }
  numeric(e2 = {}) {
    typeof e2 == "number" && (e2 = { length: e2 });
    let r2 = this.faker.helpers.rangeToNumber(e2.length ?? 1);
    if (r2 <= 0) return "";
    let { allowLeadingZeros: t2 = true } = e2, { exclude: a2 = [] } = e2;
    typeof a2 == "string" && (a2 = [...a2]);
    let n2 = Ve2.filter((s2) => !a2.includes(s2));
    if (n2.length === 0 || n2.length === 1 && !t2 && n2[0] === "0") throw new m2("Unable to generate numeric string, because all possible digits are excluded.");
    let o2 = "";
    return !t2 && !a2.includes("0") && (o2 += this.faker.helpers.arrayElement(n2.filter((s2) => s2 !== "0"))), o2 += this.fromCharacters(n2, r2 - o2.length), o2;
  }
  sample(e2 = 10) {
    e2 = this.faker.helpers.rangeToNumber(e2);
    let r2 = { min: 33, max: 125 }, t2 = "";
    for (; t2.length < e2; ) t2 += String.fromCodePoint(this.faker.number.int(r2));
    return t2;
  }
  uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll("x", () => this.faker.number.hex({ min: 0, max: 15 })).replaceAll("y", () => this.faker.number.hex({ min: 8, max: 11 }));
  }
  ulid(e2 = {}) {
    let { refDate: r2 = this.faker.defaultRefDate() } = e2, t2 = w2(r2);
    return He2(t2) + this.fromCharacters(we2, 16);
  }
  nanoid(e2 = 21) {
    if (e2 = this.faker.helpers.rangeToNumber(e2), e2 <= 0) return "";
    let r2 = [{ value: () => this.alphanumeric(1), weight: 62 }, { value: () => this.faker.helpers.arrayElement(["_", "-"]), weight: 2 }], t2 = "";
    for (; t2.length < e2; ) {
      let a2 = this.faker.helpers.weightedArrayElement(r2);
      t2 += a2();
    }
    return t2;
  }
  symbol(e2 = 1) {
    return this.fromCharacters(["!", '"', "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~"], e2);
  }
};
var I2 = class {
  _defaultRefDate = () => /* @__PURE__ */ new Date();
  get defaultRefDate() {
    return this._defaultRefDate;
  }
  setDefaultRefDate(e2 = () => /* @__PURE__ */ new Date()) {
    typeof e2 == "function" ? this._defaultRefDate = e2 : this._defaultRefDate = () => new Date(e2);
  }
  _randomizer;
  datatype = new K2(this);
  date = new P2(this);
  helpers = new B2(this);
  location = new v2(this);
  number = new W2(this);
  string = new X2(this);
  constructor(e2 = {}) {
    let { randomizer: r2, seed: t2 } = e2;
    r2 != null && t2 != null && r2.seed(t2), this._randomizer = r2 ?? Ge2(t2);
  }
  seed(e2 = L2()) {
    return this._randomizer.seed(e2), e2;
  }
};
var da2 = new I2();
function ze2(i2) {
  let e2 = {};
  for (let r2 of i2) for (let t2 in r2) {
    let a2 = r2[t2];
    e2[t2] === void 0 ? e2[t2] = { ...a2 } : e2[t2] = { ...a2, ...e2[t2] };
  }
  return e2;
}
var Q2 = class extends p2 {
  dog() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.dog);
  }
  cat() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.cat);
  }
  snake() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.snake);
  }
  bear() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.bear);
  }
  lion() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.lion);
  }
  cetacean() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.cetacean);
  }
  horse() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.horse);
  }
  bird() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.bird);
  }
  cow() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.cow);
  }
  fish() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.fish);
  }
  crocodilia() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.crocodilia);
  }
  insect() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.insect);
  }
  rabbit() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.rabbit);
  }
  rodent() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.rodent);
  }
  type() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.type);
  }
  petName() {
    return this.faker.helpers.arrayElement(this.faker.definitions.animal.pet_name);
  }
};
var q2 = class extends p2 {
  author() {
    return this.faker.helpers.arrayElement(this.faker.definitions.book.author);
  }
  format() {
    return this.faker.helpers.arrayElement(this.faker.definitions.book.format);
  }
  genre() {
    return this.faker.helpers.arrayElement(this.faker.definitions.book.genre);
  }
  publisher() {
    return this.faker.helpers.arrayElement(this.faker.definitions.book.publisher);
  }
  series() {
    return this.faker.helpers.arrayElement(this.faker.definitions.book.series);
  }
  title() {
    return this.faker.helpers.arrayElement(this.faker.definitions.book.title);
  }
};
var Hr = { 0: [[1999999, 2], [2279999, 3], [2289999, 4], [3689999, 3], [3699999, 4], [6389999, 3], [6397999, 4], [6399999, 7], [6449999, 3], [6459999, 7], [6479999, 3], [6489999, 7], [6549999, 3], [6559999, 4], [6999999, 3], [8499999, 4], [8999999, 5], [9499999, 6], [9999999, 7]], 1: [[99999, 3], [299999, 2], [349999, 3], [399999, 4], [499999, 3], [699999, 2], [999999, 4], [3979999, 3], [5499999, 4], [6499999, 5], [6799999, 4], [6859999, 5], [7139999, 4], [7169999, 3], [7319999, 4], [7399999, 7], [7749999, 5], [7753999, 7], [7763999, 5], [7764999, 7], [7769999, 5], [7782999, 7], [7899999, 5], [7999999, 4], [8004999, 5], [8049999, 5], [8379999, 5], [8384999, 7], [8671999, 5], [8675999, 4], [8697999, 5], [9159999, 6], [9165059, 7], [9168699, 6], [9169079, 7], [9195999, 6], [9196549, 7], [9729999, 6], [9877999, 4], [9911499, 6], [9911999, 7], [9989899, 6], [9999999, 7]] };
var ee2 = class extends p2 {
  department() {
    return this.faker.helpers.arrayElement(this.faker.definitions.commerce.department);
  }
  productName() {
    return `${this.productAdjective()} ${this.productMaterial()} ${this.product()}`;
  }
  price(e2 = {}) {
    let { dec: r2 = 2, max: t2 = 1e3, min: a2 = 1, symbol: n2 = "" } = e2;
    if (a2 < 0 || t2 < 0) return `${n2}0`;
    if (a2 === t2) return `${n2}${a2.toFixed(r2)}`;
    let o2 = this.faker.number.float({ min: a2, max: t2, fractionDigits: r2 });
    if (r2 === 0) return `${n2}${o2.toFixed(r2)}`;
    let s2 = o2 * 10 ** r2 % 10, l2 = this.faker.helpers.weightedArrayElement([{ weight: 5, value: 9 }, { weight: 3, value: 5 }, { weight: 1, value: 0 }, { weight: 1, value: this.faker.number.int({ min: 0, max: 9 }) }]), c2 = (1 / 10) ** r2, u2 = s2 * c2, h2 = l2 * c2, f3 = o2 - u2 + h2;
    return a2 <= f3 && f3 <= t2 ? `${n2}${f3.toFixed(r2)}` : `${n2}${o2.toFixed(r2)}`;
  }
  productAdjective() {
    return this.faker.helpers.arrayElement(this.faker.definitions.commerce.product_name.adjective);
  }
  productMaterial() {
    return this.faker.helpers.arrayElement(this.faker.definitions.commerce.product_name.material);
  }
  product() {
    return this.faker.helpers.arrayElement(this.faker.definitions.commerce.product_name.product);
  }
  productDescription() {
    return this.faker.helpers.fake(this.faker.definitions.commerce.product_description);
  }
  isbn(e2 = {}) {
    typeof e2 == "number" && (e2 = { variant: e2 });
    let { variant: r2 = 13, separator: t2 = "-" } = e2, a2 = "978", [n2, o2] = this.faker.helpers.objectEntry(Hr), s2 = this.faker.string.numeric(8), l2 = Number.parseInt(s2.slice(0, -1)), c2 = o2.find(([g2]) => l2 <= g2)?.[1];
    if (!c2) throw new m2(`Unable to find a registrant length for the group ${n2}`);
    let u2 = s2.slice(0, c2), h2 = s2.slice(c2), f3 = [a2, n2, u2, h2];
    r2 === 10 && f3.shift();
    let k2 = f3.join(""), b2 = 0;
    for (let g2 = 0; g2 < r2 - 1; g2++) {
      let C2 = r2 === 10 ? g2 + 1 : g2 % 2 ? 3 : 1;
      b2 += C2 * Number.parseInt(k2[g2]);
    }
    return b2 = r2 === 10 ? b2 % 11 : (10 - b2 % 10) % 10, f3.push(b2 === 10 ? "X" : b2.toString()), f3.join(t2);
  }
};
var re2 = class extends p2 {
  name() {
    return this.faker.helpers.fake(this.faker.definitions.company.name_pattern);
  }
  catchPhrase() {
    return [this.catchPhraseAdjective(), this.catchPhraseDescriptor(), this.catchPhraseNoun()].join(" ");
  }
  buzzPhrase() {
    return [this.buzzVerb(), this.buzzAdjective(), this.buzzNoun()].join(" ");
  }
  catchPhraseAdjective() {
    return this.faker.helpers.arrayElement(this.faker.definitions.company.adjective);
  }
  catchPhraseDescriptor() {
    return this.faker.helpers.arrayElement(this.faker.definitions.company.descriptor);
  }
  catchPhraseNoun() {
    return this.faker.helpers.arrayElement(this.faker.definitions.company.noun);
  }
  buzzAdjective() {
    return this.faker.helpers.arrayElement(this.faker.definitions.company.buzz_adjective);
  }
  buzzVerb() {
    return this.faker.helpers.arrayElement(this.faker.definitions.company.buzz_verb);
  }
  buzzNoun() {
    return this.faker.helpers.arrayElement(this.faker.definitions.company.buzz_noun);
  }
};
var te2 = class extends p2 {
  column() {
    return this.faker.helpers.arrayElement(this.faker.definitions.database.column);
  }
  type() {
    return this.faker.helpers.arrayElement(this.faker.definitions.database.type);
  }
  collation() {
    return this.faker.helpers.arrayElement(this.faker.definitions.database.collation);
  }
  engine() {
    return this.faker.helpers.arrayElement(this.faker.definitions.database.engine);
  }
  mongodbObjectId() {
    return this.faker.string.hexadecimal({ length: 24, casing: "lower", prefix: "" });
  }
};
var Vr = { alpha: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"], formats: [{ country: "AL", total: 28, bban: [{ type: "n", count: 8 }, { type: "c", count: 16 }], format: "ALkk bbbs sssx cccc cccc cccc cccc" }, { country: "AD", total: 24, bban: [{ type: "n", count: 8 }, { type: "c", count: 12 }], format: "ADkk bbbb ssss cccc cccc cccc" }, { country: "AT", total: 20, bban: [{ type: "n", count: 5 }, { type: "n", count: 11 }], format: "ATkk bbbb bccc cccc cccc" }, { country: "AZ", total: 28, bban: [{ type: "a", count: 4 }, { type: "n", count: 20 }], format: "AZkk bbbb cccc cccc cccc cccc cccc" }, { country: "BH", total: 22, bban: [{ type: "a", count: 4 }, { type: "c", count: 14 }], format: "BHkk bbbb cccc cccc cccc cc" }, { country: "BE", total: 16, bban: [{ type: "n", count: 3 }, { type: "n", count: 9 }], format: "BEkk bbbc cccc ccxx" }, { country: "BA", total: 20, bban: [{ type: "n", count: 6 }, { type: "n", count: 10 }], format: "BAkk bbbs sscc cccc ccxx" }, { country: "BR", total: 29, bban: [{ type: "n", count: 13 }, { type: "n", count: 10 }, { type: "a", count: 1 }, { type: "c", count: 1 }], format: "BRkk bbbb bbbb ssss sccc cccc ccct n" }, { country: "BG", total: 22, bban: [{ type: "a", count: 4 }, { type: "n", count: 6 }, { type: "c", count: 8 }], format: "BGkk bbbb ssss ddcc cccc cc" }, { country: "CR", total: 22, bban: [{ type: "n", count: 1 }, { type: "n", count: 3 }, { type: "n", count: 14 }], format: "CRkk xbbb cccc cccc cccc cc" }, { country: "HR", total: 21, bban: [{ type: "n", count: 7 }, { type: "n", count: 10 }], format: "HRkk bbbb bbbc cccc cccc c" }, { country: "CY", total: 28, bban: [{ type: "n", count: 8 }, { type: "c", count: 16 }], format: "CYkk bbbs ssss cccc cccc cccc cccc" }, { country: "CZ", total: 24, bban: [{ type: "n", count: 10 }, { type: "n", count: 10 }], format: "CZkk bbbb ssss sscc cccc cccc" }, { country: "DK", total: 18, bban: [{ type: "n", count: 4 }, { type: "n", count: 10 }], format: "DKkk bbbb cccc cccc cc" }, { country: "DO", total: 28, bban: [{ type: "a", count: 4 }, { type: "n", count: 20 }], format: "DOkk bbbb cccc cccc cccc cccc cccc" }, { country: "TL", total: 23, bban: [{ type: "n", count: 3 }, { type: "n", count: 16 }], format: "TLkk bbbc cccc cccc cccc cxx" }, { country: "EE", total: 20, bban: [{ type: "n", count: 4 }, { type: "n", count: 12 }], format: "EEkk bbss cccc cccc cccx" }, { country: "FO", total: 18, bban: [{ type: "n", count: 4 }, { type: "n", count: 10 }], format: "FOkk bbbb cccc cccc cx" }, { country: "FI", total: 18, bban: [{ type: "n", count: 6 }, { type: "n", count: 8 }], format: "FIkk bbbb bbcc cccc cx" }, { country: "FR", total: 27, bban: [{ type: "n", count: 10 }, { type: "c", count: 11 }, { type: "n", count: 2 }], format: "FRkk bbbb bggg ggcc cccc cccc cxx" }, { country: "GE", total: 22, bban: [{ type: "a", count: 2 }, { type: "n", count: 16 }], format: "GEkk bbcc cccc cccc cccc cc" }, { country: "DE", total: 22, bban: [{ type: "n", count: 8 }, { type: "n", count: 10 }], format: "DEkk bbbb bbbb cccc cccc cc" }, { country: "GI", total: 23, bban: [{ type: "a", count: 4 }, { type: "c", count: 15 }], format: "GIkk bbbb cccc cccc cccc ccc" }, { country: "GR", total: 27, bban: [{ type: "n", count: 7 }, { type: "c", count: 16 }], format: "GRkk bbbs sssc cccc cccc cccc ccc" }, { country: "GL", total: 18, bban: [{ type: "n", count: 4 }, { type: "n", count: 10 }], format: "GLkk bbbb cccc cccc cc" }, { country: "GT", total: 28, bban: [{ type: "c", count: 4 }, { type: "c", count: 4 }, { type: "c", count: 16 }], format: "GTkk bbbb mmtt cccc cccc cccc cccc" }, { country: "HU", total: 28, bban: [{ type: "n", count: 8 }, { type: "n", count: 16 }], format: "HUkk bbbs sssk cccc cccc cccc cccx" }, { country: "IS", total: 26, bban: [{ type: "n", count: 6 }, { type: "n", count: 16 }], format: "ISkk bbbb sscc cccc iiii iiii ii" }, { country: "IE", total: 22, bban: [{ type: "a", count: 4 }, { type: "n", count: 6 }, { type: "n", count: 8 }], format: "IEkk aaaa bbbb bbcc cccc cc" }, { country: "IL", total: 23, bban: [{ type: "n", count: 6 }, { type: "n", count: 13 }], format: "ILkk bbbn nncc cccc cccc ccc" }, { country: "IT", total: 27, bban: [{ type: "a", count: 1 }, { type: "n", count: 10 }, { type: "c", count: 12 }], format: "ITkk xaaa aabb bbbc cccc cccc ccc" }, { country: "JO", total: 30, bban: [{ type: "a", count: 4 }, { type: "n", count: 4 }, { type: "n", count: 18 }], format: "JOkk bbbb nnnn cccc cccc cccc cccc cc" }, { country: "KZ", total: 20, bban: [{ type: "n", count: 3 }, { type: "c", count: 13 }], format: "KZkk bbbc cccc cccc cccc" }, { country: "XK", total: 20, bban: [{ type: "n", count: 4 }, { type: "n", count: 12 }], format: "XKkk bbbb cccc cccc cccc" }, { country: "KW", total: 30, bban: [{ type: "a", count: 4 }, { type: "c", count: 22 }], format: "KWkk bbbb cccc cccc cccc cccc cccc cc" }, { country: "LV", total: 21, bban: [{ type: "a", count: 4 }, { type: "c", count: 13 }], format: "LVkk bbbb cccc cccc cccc c" }, { country: "LB", total: 28, bban: [{ type: "n", count: 4 }, { type: "c", count: 20 }], format: "LBkk bbbb cccc cccc cccc cccc cccc" }, { country: "LI", total: 21, bban: [{ type: "n", count: 5 }, { type: "c", count: 12 }], format: "LIkk bbbb bccc cccc cccc c" }, { country: "LT", total: 20, bban: [{ type: "n", count: 5 }, { type: "n", count: 11 }], format: "LTkk bbbb bccc cccc cccc" }, { country: "LU", total: 20, bban: [{ type: "n", count: 3 }, { type: "c", count: 13 }], format: "LUkk bbbc cccc cccc cccc" }, { country: "MK", total: 19, bban: [{ type: "n", count: 3 }, { type: "c", count: 10 }, { type: "n", count: 2 }], format: "MKkk bbbc cccc cccc cxx" }, { country: "MT", total: 31, bban: [{ type: "a", count: 4 }, { type: "n", count: 5 }, { type: "c", count: 18 }], format: "MTkk bbbb ssss sccc cccc cccc cccc ccc" }, { country: "MR", total: 27, bban: [{ type: "n", count: 10 }, { type: "n", count: 13 }], format: "MRkk bbbb bsss sscc cccc cccc cxx" }, { country: "MU", total: 30, bban: [{ type: "a", count: 4 }, { type: "n", count: 4 }, { type: "n", count: 15 }, { type: "a", count: 3 }], format: "MUkk bbbb bbss cccc cccc cccc 000d dd" }, { country: "MC", total: 27, bban: [{ type: "n", count: 10 }, { type: "c", count: 11 }, { type: "n", count: 2 }], format: "MCkk bbbb bsss sscc cccc cccc cxx" }, { country: "MD", total: 24, bban: [{ type: "c", count: 2 }, { type: "c", count: 18 }], format: "MDkk bbcc cccc cccc cccc cccc" }, { country: "ME", total: 22, bban: [{ type: "n", count: 3 }, { type: "n", count: 15 }], format: "MEkk bbbc cccc cccc cccc xx" }, { country: "NL", total: 18, bban: [{ type: "a", count: 4 }, { type: "n", count: 10 }], format: "NLkk bbbb cccc cccc cc" }, { country: "NO", total: 15, bban: [{ type: "n", count: 4 }, { type: "n", count: 7 }], format: "NOkk bbbb cccc ccx" }, { country: "PK", total: 24, bban: [{ type: "a", count: 4 }, { type: "n", count: 16 }], format: "PKkk bbbb cccc cccc cccc cccc" }, { country: "PS", total: 29, bban: [{ type: "a", count: 4 }, { type: "n", count: 9 }, { type: "n", count: 12 }], format: "PSkk bbbb xxxx xxxx xccc cccc cccc c" }, { country: "PL", total: 28, bban: [{ type: "n", count: 8 }, { type: "n", count: 16 }], format: "PLkk bbbs sssx cccc cccc cccc cccc" }, { country: "PT", total: 25, bban: [{ type: "n", count: 8 }, { type: "n", count: 13 }], format: "PTkk bbbb ssss cccc cccc cccx x" }, { country: "QA", total: 29, bban: [{ type: "a", count: 4 }, { type: "c", count: 21 }], format: "QAkk bbbb cccc cccc cccc cccc cccc c" }, { country: "RO", total: 24, bban: [{ type: "a", count: 4 }, { type: "c", count: 16 }], format: "ROkk bbbb cccc cccc cccc cccc" }, { country: "SM", total: 27, bban: [{ type: "a", count: 1 }, { type: "n", count: 10 }, { type: "c", count: 12 }], format: "SMkk xaaa aabb bbbc cccc cccc ccc" }, { country: "SA", total: 24, bban: [{ type: "n", count: 2 }, { type: "c", count: 18 }], format: "SAkk bbcc cccc cccc cccc cccc" }, { country: "RS", total: 22, bban: [{ type: "n", count: 3 }, { type: "n", count: 15 }], format: "RSkk bbbc cccc cccc cccc xx" }, { country: "SK", total: 24, bban: [{ type: "n", count: 10 }, { type: "n", count: 10 }], format: "SKkk bbbb ssss sscc cccc cccc" }, { country: "SI", total: 19, bban: [{ type: "n", count: 5 }, { type: "n", count: 10 }], format: "SIkk bbss sccc cccc cxx" }, { country: "ES", total: 24, bban: [{ type: "n", count: 10 }, { type: "n", count: 10 }], format: "ESkk bbbb gggg xxcc cccc cccc" }, { country: "SE", total: 24, bban: [{ type: "n", count: 3 }, { type: "n", count: 17 }], format: "SEkk bbbc cccc cccc cccc cccc" }, { country: "CH", total: 21, bban: [{ type: "n", count: 5 }, { type: "c", count: 12 }], format: "CHkk bbbb bccc cccc cccc c" }, { country: "TN", total: 24, bban: [{ type: "n", count: 5 }, { type: "n", count: 15 }], format: "TNkk bbss sccc cccc cccc cccc" }, { country: "TR", total: 26, bban: [{ type: "n", count: 5 }, { type: "n", count: 1 }, { type: "n", count: 16 }], format: "TRkk bbbb bxcc cccc cccc cccc cc" }, { country: "AE", total: 23, bban: [{ type: "n", count: 3 }, { type: "n", count: 16 }], format: "AEkk bbbc cccc cccc cccc ccc" }, { country: "GB", total: 22, bban: [{ type: "a", count: 4 }, { type: "n", count: 6 }, { type: "n", count: 8 }], format: "GBkk bbbb ssss sscc cccc cc" }, { country: "VG", total: 24, bban: [{ type: "a", count: 4 }, { type: "n", count: 16 }], format: "VGkk bbbb cccc cccc cccc cccc" }], iso3166: ["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW"], mod97: (i2) => {
  let e2 = 0;
  for (let r2 of i2) e2 = (e2 * 10 + +r2) % 97;
  return e2;
}, pattern10: ["01", "02", "03", "04", "05", "06", "07", "08", "09"], pattern100: ["001", "002", "003", "004", "005", "006", "007", "008", "009"], toDigitString: (i2) => i2.replaceAll(/[A-Z]/gi, (e2) => String((e2.toUpperCase().codePointAt(0) ?? Number.NaN) - 55)) };
var S2 = Vr;
function zr(i2) {
  let e2 = "";
  for (let r2 = 0; r2 < i2.length; r2 += 4) e2 += `${i2.substring(r2, r2 + 4)} `;
  return e2.trimEnd();
}
var ae2 = class extends p2 {
  accountNumber(e2 = {}) {
    typeof e2 == "number" && (e2 = { length: e2 });
    let { length: r2 = 8 } = e2;
    return this.faker.string.numeric({ length: r2, allowLeadingZeros: true });
  }
  accountName() {
    return [this.faker.helpers.arrayElement(this.faker.definitions.finance.account_type), "Account"].join(" ");
  }
  routingNumber() {
    let e2 = this.faker.string.numeric({ length: 8, allowLeadingZeros: true }), r2 = 0;
    for (let t2 = 0; t2 < e2.length; t2 += 3) r2 += Number(e2[t2]) * 3, r2 += Number(e2[t2 + 1]) * 7, r2 += Number(e2[t2 + 2]) || 0;
    return `${e2}${Math.ceil(r2 / 10) * 10 - r2}`;
  }
  amount(e2 = {}) {
    let { autoFormat: r2 = false, dec: t2 = 2, max: a2 = 1e3, min: n2 = 0, symbol: o2 = "" } = e2, s2 = this.faker.number.float({ max: a2, min: n2, fractionDigits: t2 }), l2 = r2 ? s2.toLocaleString(void 0, { minimumFractionDigits: t2 }) : s2.toFixed(t2);
    return o2 + l2;
  }
  transactionType() {
    return this.faker.helpers.arrayElement(this.faker.definitions.finance.transaction_type);
  }
  currency() {
    return this.faker.helpers.arrayElement(this.faker.definitions.finance.currency);
  }
  currencyCode() {
    return this.currency().code;
  }
  currencyName() {
    return this.currency().name;
  }
  currencySymbol() {
    let e2;
    do
      e2 = this.currency().symbol;
    while (e2.length === 0);
    return e2;
  }
  currencyNumericCode() {
    return this.currency().numericCode;
  }
  bitcoinAddress(e2 = {}) {
    let { type: r2 = this.faker.helpers.enumValue(be2), network: t2 = "mainnet" } = e2, a2 = Pe2[r2], n2 = a2.prefix[t2], o2 = this.faker.number.int(a2.length), s2 = this.faker.string.alphanumeric({ length: o2 - n2.length, casing: a2.casing, exclude: a2.exclude });
    return n2 + s2;
  }
  litecoinAddress() {
    let e2 = this.faker.number.int({ min: 26, max: 33 });
    return this.faker.string.fromCharacters("LM3") + this.faker.string.fromCharacters("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", e2 - 1);
  }
  creditCardNumber(e2 = {}) {
    typeof e2 == "string" && (e2 = { issuer: e2 });
    let { issuer: r2 = "" } = e2, t2, a2 = this.faker.definitions.finance.credit_card, n2 = r2.toLowerCase();
    if (n2 in a2) t2 = this.faker.helpers.arrayElement(a2[n2]);
    else if (r2.includes("#")) t2 = r2;
    else {
      let o2 = this.faker.helpers.objectValue(a2);
      t2 = this.faker.helpers.arrayElement(o2);
    }
    return t2 = t2.replaceAll("/", ""), this.faker.helpers.replaceCreditCardSymbols(t2);
  }
  creditCardCVV() {
    return this.faker.string.numeric({ length: 3, allowLeadingZeros: true });
  }
  creditCardIssuer() {
    return this.faker.helpers.objectKey(this.faker.definitions.finance.credit_card);
  }
  pin(e2 = {}) {
    typeof e2 == "number" && (e2 = { length: e2 });
    let { length: r2 = 4 } = e2;
    if (r2 < 1) throw new m2("minimum length is 1");
    return this.faker.string.numeric({ length: r2, allowLeadingZeros: true });
  }
  ethereumAddress() {
    return this.faker.string.hexadecimal({ length: 40, casing: "lower" });
  }
  iban(e2 = {}) {
    let { countryCode: r2, formatted: t2 = false } = e2, a2 = r2 ? S2.formats.find((c2) => c2.country === r2) : this.faker.helpers.arrayElement(S2.formats);
    if (!a2) throw new m2(`Country code ${r2} not supported.`);
    let n2 = "", o2 = 0;
    for (let c2 of a2.bban) {
      let u2 = c2.count;
      for (o2 += c2.count; u2 > 0; ) c2.type === "a" ? n2 += this.faker.helpers.arrayElement(S2.alpha) : c2.type === "c" ? this.faker.datatype.boolean(0.8) ? n2 += this.faker.number.int(9) : n2 += this.faker.helpers.arrayElement(S2.alpha) : u2 >= 3 && this.faker.datatype.boolean(0.3) ? this.faker.datatype.boolean() ? (n2 += this.faker.helpers.arrayElement(S2.pattern100), u2 -= 2) : (n2 += this.faker.helpers.arrayElement(S2.pattern10), u2--) : n2 += this.faker.number.int(9), u2--;
      n2 = n2.substring(0, o2);
    }
    let s2 = 98 - S2.mod97(S2.toDigitString(`${n2}${a2.country}00`));
    s2 < 10 && (s2 = `0${s2}`);
    let l2 = `${a2.country}${s2}${n2}`;
    return t2 ? zr(l2) : l2;
  }
  bic(e2 = {}) {
    let { includeBranchCode: r2 = this.faker.datatype.boolean() } = e2, t2 = this.faker.string.alpha({ length: 4, casing: "upper" }), a2 = this.faker.helpers.arrayElement(S2.iso3166), n2 = this.faker.string.alphanumeric({ length: 2, casing: "upper" }), o2 = r2 ? this.faker.datatype.boolean() ? this.faker.string.alphanumeric({ length: 3, casing: "upper" }) : "XXX" : "";
    return `${t2}${a2}${n2}${o2}`;
  }
  transactionDescription() {
    return this.faker.helpers.fake(this.faker.definitions.finance.transaction_description_pattern);
  }
};
function Ye2(i2) {
  return i2.split(" ").map((e2) => e2.charAt(0).toUpperCase() + e2.slice(1)).join(" ");
}
var ne2 = class extends p2 {
  adjective() {
    return this.faker.helpers.arrayElement(this.faker.definitions.food.adjective);
  }
  description() {
    return this.faker.helpers.fake(this.faker.definitions.food.description_pattern);
  }
  dish() {
    return this.faker.datatype.boolean() ? Ye2(this.faker.helpers.fake(this.faker.definitions.food.dish_pattern)) : Ye2(this.faker.helpers.arrayElement(this.faker.definitions.food.dish));
  }
  ethnicCategory() {
    return this.faker.helpers.arrayElement(this.faker.definitions.food.ethnic_category);
  }
  fruit() {
    return this.faker.helpers.arrayElement(this.faker.definitions.food.fruit);
  }
  ingredient() {
    return this.faker.helpers.arrayElement(this.faker.definitions.food.ingredient);
  }
  meat() {
    return this.faker.helpers.arrayElement(this.faker.definitions.food.meat);
  }
  spice() {
    return this.faker.helpers.arrayElement(this.faker.definitions.food.spice);
  }
  vegetable() {
    return this.faker.helpers.arrayElement(this.faker.definitions.food.vegetable);
  }
};
var Yr = "\xA0";
var ie2 = class extends p2 {
  branch() {
    let e2 = this.faker.hacker.noun().replace(" ", "-"), r2 = this.faker.hacker.verb().replace(" ", "-");
    return `${e2}-${r2}`;
  }
  commitEntry(e2 = {}) {
    let { merge: r2 = this.faker.datatype.boolean({ probability: 0.2 }), eol: t2 = "CRLF", refDate: a2 } = e2, n2 = [`commit ${this.faker.git.commitSha()}`];
    r2 && n2.push(`Merge: ${this.commitSha({ length: 7 })} ${this.commitSha({ length: 7 })}`);
    let o2 = this.faker.person.firstName(), s2 = this.faker.person.lastName(), l2 = this.faker.person.fullName({ firstName: o2, lastName: s2 }), c2 = this.faker.internet.username({ firstName: o2, lastName: s2 }), u2 = this.faker.helpers.arrayElement([l2, c2]), h2 = this.faker.internet.email({ firstName: o2, lastName: s2 });
    u2 = u2.replaceAll(/^[.,:;"\\']|[<>\n]|[.,:;"\\']$/g, ""), n2.push(`Author: ${u2} <${h2}>`, `Date: ${this.commitDate({ refDate: a2 })}`, "", `${Yr.repeat(4)}${this.commitMessage()}`, "");
    let f3 = t2 === "CRLF" ? `\r
` : `
`;
    return n2.join(f3);
  }
  commitMessage() {
    return `${this.faker.hacker.verb()} ${this.faker.hacker.adjective()} ${this.faker.hacker.noun()}`;
  }
  commitDate(e2 = {}) {
    let { refDate: r2 = this.faker.defaultRefDate() } = e2, t2 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], a2 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], n2 = this.faker.date.recent({ days: 1, refDate: r2 }), o2 = t2[n2.getUTCDay()], s2 = a2[n2.getUTCMonth()], l2 = n2.getUTCDate(), c2 = n2.getUTCHours().toString().padStart(2, "0"), u2 = n2.getUTCMinutes().toString().padStart(2, "0"), h2 = n2.getUTCSeconds().toString().padStart(2, "0"), f3 = n2.getUTCFullYear(), k2 = this.faker.number.int({ min: -11, max: 12 }), b2 = Math.abs(k2).toString().padStart(2, "0"), g2 = "00", C2 = k2 >= 0 ? "+" : "-";
    return `${o2} ${s2} ${l2} ${c2}:${u2}:${h2} ${f3} ${C2}${b2}${g2}`;
  }
  commitSha(e2 = {}) {
    let { length: r2 = 40 } = e2;
    return this.faker.string.hexadecimal({ length: r2, casing: "lower", prefix: "" });
  }
};
var oe2 = class extends p2 {
  abbreviation() {
    return this.faker.helpers.arrayElement(this.faker.definitions.hacker.abbreviation);
  }
  adjective() {
    return this.faker.helpers.arrayElement(this.faker.definitions.hacker.adjective);
  }
  noun() {
    return this.faker.helpers.arrayElement(this.faker.definitions.hacker.noun);
  }
  verb() {
    return this.faker.helpers.arrayElement(this.faker.definitions.hacker.verb);
  }
  ingverb() {
    return this.faker.helpers.arrayElement(this.faker.definitions.hacker.ingverb);
  }
  phrase() {
    let e2 = { abbreviation: this.abbreviation, adjective: this.adjective, ingverb: this.ingverb, noun: this.noun, verb: this.verb }, r2 = this.faker.helpers.arrayElement(this.faker.definitions.hacker.phrase);
    return this.faker.helpers.mustache(r2, e2);
  }
};
function We2(i2) {
  let { deprecated: e2, since: r2, until: t2, proposed: a2 } = i2, n2 = `[@faker-js/faker]: ${e2} is deprecated`;
  r2 && (n2 += ` since v${r2}`), t2 && (n2 += ` and will be removed in v${t2}`), a2 && (n2 += `. Please use ${a2} instead`), console.warn(`${n2}.`);
}
var se2 = class extends p2 {
  avatar() {
    return this.faker.helpers.arrayElement([this.personPortrait, this.avatarGitHub])();
  }
  avatarGitHub() {
    return `https://avatars.githubusercontent.com/u/${this.faker.number.int(1e8)}`;
  }
  personPortrait(e2 = {}) {
    let { sex: r2 = this.faker.person.sexType(), size: t2 = 512 } = e2;
    return `https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/${r2}/${t2}/${this.faker.number.int({ min: 0, max: 99 })}.jpg`;
  }
  url(e2 = {}) {
    let { width: r2 = this.faker.number.int({ min: 1, max: 3999 }), height: t2 = this.faker.number.int({ min: 1, max: 3999 }) } = e2;
    return this.faker.helpers.arrayElement([({ width: n2, height: o2 }) => this.urlPicsumPhotos({ width: n2, height: o2, grayscale: false, blur: 0 })])({ width: r2, height: t2 });
  }
  urlLoremFlickr(e2 = {}) {
    We2({ deprecated: "faker.image.urlLoremFlickr()", proposed: "faker.image.url()", since: "10.1.0", until: "11.0.0" });
    let { width: r2 = this.faker.number.int({ min: 1, max: 3999 }), height: t2 = this.faker.number.int({ min: 1, max: 3999 }), category: a2 } = e2;
    return `https://loremflickr.com/${r2}/${t2}${a2 == null ? "" : `/${a2}`}?lock=${this.faker.number.int()}`;
  }
  urlPicsumPhotos(e2 = {}) {
    let { width: r2 = this.faker.number.int({ min: 1, max: 3999 }), height: t2 = this.faker.number.int({ min: 1, max: 3999 }), grayscale: a2 = this.faker.datatype.boolean(), blur: n2 = this.faker.number.int({ max: 10 }) } = e2, o2 = `https://picsum.photos/seed/${this.faker.string.alphanumeric({ length: { min: 5, max: 10 } })}/${r2}/${t2}`, s2 = typeof n2 == "number" && n2 >= 1 && n2 <= 10;
    return (a2 || s2) && (o2 += "?", a2 && (o2 += "grayscale"), a2 && s2 && (o2 += "&"), s2 && (o2 += `blur=${n2}`)), o2;
  }
  dataUri(e2 = {}) {
    let { width: r2 = this.faker.number.int({ min: 1, max: 3999 }), height: t2 = this.faker.number.int({ min: 1, max: 3999 }), color: a2 = this.faker.color.rgb(), type: n2 = this.faker.helpers.arrayElement(["svg-uri", "svg-base64"]) } = e2, o2 = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" baseProfile="full" width="${r2}" height="${t2}"><rect width="100%" height="100%" fill="${a2}"/><text x="${r2 / 2}" y="${t2 / 2}" font-size="20" alignment-baseline="middle" text-anchor="middle" fill="white">${r2}x${t2}</text></svg>`;
    return n2 === "svg-uri" ? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(o2)}` : `data:image/svg+xml;base64,${de2(o2)}`;
  }
};
function Ze2(i2, e2, r2 = (t2) => t2) {
  let t2 = {};
  for (let a2 of i2) {
    let n2 = e2(a2);
    t2[n2] === void 0 && (t2[n2] = []), t2[n2].push(r2(a2));
  }
  return t2;
}
var Se2 = { fail: () => {
  throw new m2("No words found that match the given length.");
}, closest: (i2, e2) => {
  let r2 = Ze2(i2, (s2) => s2.length), t2 = Object.keys(r2).map(Number), a2 = Math.min(...t2), n2 = Math.max(...t2), o2 = Math.min(e2.min - a2, n2 - e2.max);
  return i2.filter((s2) => s2.length === e2.min - o2 || s2.length === e2.max + o2);
}, shortest: (i2) => {
  let e2 = Math.min(...i2.map((r2) => r2.length));
  return i2.filter((r2) => r2.length === e2);
}, longest: (i2) => {
  let e2 = Math.max(...i2.map((r2) => r2.length));
  return i2.filter((r2) => r2.length === e2);
}, "any-length": (i2) => [...i2] };
function T2(i2) {
  let { wordList: e2, length: r2, strategy: t2 = "fail" } = i2;
  if (r2 != null) {
    let a2 = typeof r2 == "number" ? (o2) => o2.length === r2 : (o2) => o2.length >= r2.min && o2.length <= r2.max, n2 = e2.filter(a2);
    return n2.length > 0 ? n2 : typeof r2 == "number" ? Se2[t2](e2, { min: r2, max: r2 }) : Se2[t2](e2, r2);
  } else if (t2 === "shortest" || t2 === "longest") return Se2[t2](e2);
  return [...e2];
}
var ce2 = class extends p2 {
  word(e2 = {}) {
    return typeof e2 == "number" && (e2 = { length: e2 }), this.faker.helpers.arrayElement(T2({ ...e2, wordList: this.faker.definitions.lorem.word }));
  }
  words(e2 = 3) {
    return this.faker.helpers.multiple(() => this.word(), { count: e2 }).join(" ");
  }
  sentence(e2 = { min: 3, max: 10 }) {
    let r2 = this.words(e2);
    return `${r2.charAt(0).toUpperCase() + r2.substring(1)}.`;
  }
  slug(e2 = 3) {
    let r2 = this.words(e2);
    return this.faker.helpers.slugify(r2);
  }
  sentences(e2 = { min: 2, max: 6 }, r2 = " ") {
    return this.faker.helpers.multiple(() => this.sentence(), { count: e2 }).join(r2);
  }
  paragraph(e2 = 3) {
    return this.sentences(e2);
  }
  paragraphs(e2 = 3, r2 = `
`) {
    return this.faker.helpers.multiple(() => this.paragraph(), { count: e2 }).join(r2);
  }
  text() {
    let e2 = ["sentence", "sentences", "paragraph", "paragraphs", "lines"], r2 = this.faker.helpers.arrayElement(e2);
    return this[r2]();
  }
  lines(e2 = { min: 1, max: 5 }) {
    return this.sentences(e2, `
`);
  }
};
var le2 = class extends p2 {
  album() {
    return this.faker.helpers.arrayElement(this.faker.definitions.music.album);
  }
  artist() {
    return this.faker.helpers.arrayElement(this.faker.definitions.music.artist);
  }
  genre() {
    return this.faker.helpers.arrayElement(this.faker.definitions.music.genre);
  }
  songName() {
    return this.faker.helpers.arrayElement(this.faker.definitions.music.song_name);
  }
};
var me2 = class extends p2 {
  number(e2 = {}) {
    let { style: r2 = "human" } = e2, a2 = this.faker.definitions.phone_number.format[r2];
    if (!a2) throw new Error(`No definitions for ${r2} in this locale`);
    let n2 = this.faker.helpers.arrayElement(a2);
    return Ee2(this.faker, n2);
  }
  imei() {
    return this.faker.helpers.replaceCreditCardSymbols("##-######-######-L", "#");
  }
};
var ue2 = class extends p2 {
  chemicalElement() {
    return this.faker.helpers.arrayElement(this.faker.definitions.science.chemical_element);
  }
  unit() {
    return this.faker.helpers.arrayElement(this.faker.definitions.science.unit);
  }
};
var Wr = ["video", "audio", "image", "text", "application"];
var Zr = ["application/pdf", "audio/mpeg", "audio/wav", "image/png", "image/jpeg", "image/gif", "video/mp4", "video/mpeg", "text/html"];
var Jr = ["en", "wl", "ww"];
var Je2 = { index: "o", slot: "s", mac: "x", pci: "p" };
var Xr = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
var pe2 = class extends p2 {
  fileName(e2 = {}) {
    let { extensionCount: r2 = 1 } = e2, t2 = this.faker.word.words().toLowerCase().replaceAll(/\W/g, "_"), a2 = this.faker.helpers.multiple(() => this.fileExt(), { count: r2 }).join(".");
    return a2.length === 0 ? t2 : `${t2}.${a2}`;
  }
  commonFileName(e2) {
    return `${this.fileName({ extensionCount: 0 })}.${e2 || this.commonFileExt()}`;
  }
  mimeType() {
    let e2 = Object.keys(this.faker.definitions.system.mime_type);
    return this.faker.helpers.arrayElement(e2);
  }
  commonFileType() {
    return this.faker.helpers.arrayElement(Wr);
  }
  commonFileExt() {
    return this.fileExt(this.faker.helpers.arrayElement(Zr));
  }
  fileType() {
    let e2 = this.faker.definitions.system.mime_type, r2 = new Set(Object.keys(e2).map((t2) => t2.split("/")[0]));
    return this.faker.helpers.arrayElement([...r2]);
  }
  fileExt(e2) {
    let r2 = this.faker.definitions.system.mime_type;
    if (typeof e2 == "string") return this.faker.helpers.arrayElement(r2[e2].extensions);
    let t2 = new Set(Object.values(r2).flatMap(({ extensions: a2 }) => a2));
    return this.faker.helpers.arrayElement([...t2]);
  }
  directoryPath() {
    let e2 = this.faker.definitions.system.directory_path;
    return this.faker.helpers.arrayElement(e2);
  }
  filePath() {
    return `${this.directoryPath()}/${this.fileName()}`;
  }
  semver() {
    return [this.faker.number.int(9), this.faker.number.int(20), this.faker.number.int(20)].join(".");
  }
  networkInterface(e2 = {}) {
    let { interfaceType: r2 = this.faker.helpers.arrayElement(Jr), interfaceSchema: t2 = this.faker.helpers.objectKey(Je2) } = e2, a2, n2 = "";
    switch (t2) {
      case "index": {
        a2 = this.faker.string.numeric();
        break;
      }
      case "slot": {
        a2 = `${this.faker.string.numeric()}${this.faker.helpers.maybe(() => `f${this.faker.string.numeric()}`) ?? ""}${this.faker.helpers.maybe(() => `d${this.faker.string.numeric()}`) ?? ""}`;
        break;
      }
      case "mac": {
        a2 = this.faker.internet.mac("");
        break;
      }
      case "pci": {
        n2 = this.faker.helpers.maybe(() => `P${this.faker.string.numeric()}`) ?? "", a2 = `${this.faker.string.numeric()}s${this.faker.string.numeric()}${this.faker.helpers.maybe(() => `f${this.faker.string.numeric()}`) ?? ""}${this.faker.helpers.maybe(() => `d${this.faker.string.numeric()}`) ?? ""}`;
        break;
      }
    }
    return `${n2}${r2}${Je2[t2]}${a2}`;
  }
  cron(e2 = {}) {
    let { includeYear: r2 = false, includeNonStandard: t2 = false } = e2, a2 = [this.faker.number.int(59), "*"], n2 = [this.faker.number.int(23), "*"], o2 = [this.faker.number.int({ min: 1, max: 31 }), "*", "?"], s2 = [this.faker.number.int({ min: 1, max: 12 }), "*"], l2 = [this.faker.number.int(6), this.faker.helpers.arrayElement(Xr), "*", "?"], c2 = [this.faker.number.int({ min: 1970, max: 2099 }), "*"], u2 = this.faker.helpers.arrayElement(a2), h2 = this.faker.helpers.arrayElement(n2), f3 = this.faker.helpers.arrayElement(o2), k2 = this.faker.helpers.arrayElement(s2), b2 = this.faker.helpers.arrayElement(l2), g2 = this.faker.helpers.arrayElement(c2), C2 = `${u2} ${h2} ${f3} ${k2} ${b2}`;
    r2 && (C2 += ` ${g2}`);
    let y2 = ["@annually", "@daily", "@hourly", "@monthly", "@reboot", "@weekly", "@yearly"];
    return !t2 || this.faker.datatype.boolean() ? C2 : this.faker.helpers.arrayElement(y2);
  }
};
var he2 = class extends p2 {
  vehicle() {
    return `${this.manufacturer()} ${this.model()}`;
  }
  manufacturer() {
    return this.faker.helpers.arrayElement(this.faker.definitions.vehicle.manufacturer);
  }
  model() {
    return this.faker.helpers.arrayElement(this.faker.definitions.vehicle.model);
  }
  type() {
    return this.faker.helpers.arrayElement(this.faker.definitions.vehicle.type);
  }
  fuel() {
    return this.faker.helpers.arrayElement(this.faker.definitions.vehicle.fuel);
  }
  vin() {
    let e2 = ["o", "i", "q", "O", "I", "Q"];
    return `${this.faker.string.alphanumeric({ length: 10, casing: "upper", exclude: e2 })}${this.faker.string.alpha({ length: 1, casing: "upper", exclude: e2 })}${this.faker.string.alphanumeric({ length: 1, casing: "upper", exclude: e2 })}${this.faker.string.numeric({ length: 5, allowLeadingZeros: true })}`;
  }
  color() {
    return this.faker.color.human();
  }
  vrm() {
    return `${this.faker.string.alpha({ length: 2, casing: "upper" })}${this.faker.string.numeric({ length: 2, allowLeadingZeros: true })}${this.faker.string.alpha({ length: 3, casing: "upper" })}`;
  }
  bicycle() {
    return this.faker.helpers.arrayElement(this.faker.definitions.vehicle.bicycle_type);
  }
};
var fe2 = class extends p2 {
  adjective(e2 = {}) {
    return typeof e2 == "number" && (e2 = { length: e2 }), this.faker.helpers.arrayElement(T2({ ...e2, wordList: this.faker.definitions.word.adjective }));
  }
  adverb(e2 = {}) {
    return typeof e2 == "number" && (e2 = { length: e2 }), this.faker.helpers.arrayElement(T2({ ...e2, wordList: this.faker.definitions.word.adverb }));
  }
  conjunction(e2 = {}) {
    return typeof e2 == "number" && (e2 = { length: e2 }), this.faker.helpers.arrayElement(T2({ ...e2, wordList: this.faker.definitions.word.conjunction }));
  }
  interjection(e2 = {}) {
    return typeof e2 == "number" && (e2 = { length: e2 }), this.faker.helpers.arrayElement(T2({ ...e2, wordList: this.faker.definitions.word.interjection }));
  }
  noun(e2 = {}) {
    return typeof e2 == "number" && (e2 = { length: e2 }), this.faker.helpers.arrayElement(T2({ ...e2, wordList: this.faker.definitions.word.noun }));
  }
  preposition(e2 = {}) {
    return typeof e2 == "number" && (e2 = { length: e2 }), this.faker.helpers.arrayElement(T2({ ...e2, wordList: this.faker.definitions.word.preposition }));
  }
  verb(e2 = {}) {
    return typeof e2 == "number" && (e2 = { length: e2 }), this.faker.helpers.arrayElement(T2({ ...e2, wordList: this.faker.definitions.word.verb }));
  }
  sample(e2 = {}) {
    let r2 = this.faker.helpers.shuffle([this.adjective, this.adverb, this.conjunction, this.interjection, this.noun, this.preposition, this.verb]);
    for (let t2 of r2) try {
      return t2(e2);
    } catch {
      continue;
    }
    throw new m2("No matching word data available for the current locale");
  }
  words(e2 = {}) {
    typeof e2 == "number" && (e2 = { count: e2 });
    let { count: r2 = { min: 1, max: 3 } } = e2;
    return this.faker.helpers.multiple(() => this.sample(), { count: r2 }).join(" ");
  }
};
var Xe2 = class extends I2 {
  rawDefinitions;
  definitions;
  airline = new F2(this);
  animal = new Q2(this);
  book = new q2(this);
  color = new G2(this);
  commerce = new ee2(this);
  company = new re2(this);
  database = new te2(this);
  date = new V2(this);
  finance = new ae2(this);
  food = new ne2(this);
  git = new ie2(this);
  hacker = new oe2(this);
  helpers = new z2(this);
  image = new se2(this);
  internet = new O2(this);
  location = new Y2(this);
  lorem = new ce2(this);
  music = new le2(this);
  person = new U2(this);
  phone = new me2(this);
  science = new ue2(this);
  system = new pe2(this);
  vehicle = new he2(this);
  word = new fe2(this);
  constructor(e2) {
    super({ randomizer: e2.randomizer, seed: e2.seed });
    let { locale: r2 } = e2;
    if (Array.isArray(r2)) {
      if (r2.length === 0) throw new m2("The locale option must contain at least one locale definition.");
      r2 = ze2(r2);
    }
    this.rawDefinitions = r2, this.definitions = Oe2(this.rawDefinitions);
  }
  getMetadata() {
    return this.rawDefinitions.metadata ?? {};
  }
};
var Qe2 = ["Academy Color Encoding System (ACES)", "Adobe RGB", "Adobe Wide Gamut RGB", "British Standard Colour (BS)", "CIE 1931 XYZ", "CIELAB", "CIELUV", "CIEUVW", "CMY", "CMYK", "DCI-P3", "Display-P3", "Federal Standard 595C", "HKS", "HSL", "HSLA", "HSLuv", "HSV", "HWB", "LCh", "LMS", "Munsell Color System", "Natural Color System (NSC)", "Pantone Matching System (PMS)", "ProPhoto RGB Color Space", "RAL", "RG", "RGBA", "RGK", "Rec. 2020", "Rec. 2100", "Rec. 601", "Rec. 709", "Uniform Color Spaces (UCSs)", "YDbDr", "YIQ", "YPbPr", "sRGB", "sYCC", "scRGB", "xvYCC"];
var Qr = { space: Qe2 };
var qe2 = Qr;
var er2 = ["ascii_bin", "ascii_general_ci", "cp1250_bin", "cp1250_general_ci", "utf8_bin", "utf8_general_ci", "utf8_unicode_ci"];
var rr2 = ["ARCHIVE", "BLACKHOLE", "CSV", "InnoDB", "MEMORY", "MyISAM"];
var tr2 = ["bigint", "binary", "bit", "blob", "boolean", "date", "datetime", "decimal", "double", "enum", "float", "geometry", "int", "mediumint", "point", "real", "serial", "set", "smallint", "text", "time", "timestamp", "tinyint", "varchar"];
var qr = { collation: er2, engine: rr2, type: tr2 };
var ar2 = qr;
var _2 = ["Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry", "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala", "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka", "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane", "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo", "Africa/Sao_Tome", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek", "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua", "America/Araguaina", "America/Argentina/Buenos_Aires", "America/Argentina/Catamarca", "America/Argentina/Cordoba", "America/Argentina/Jujuy", "America/Argentina/La_Rioja", "America/Argentina/Mendoza", "America/Argentina/Rio_Gallegos", "America/Argentina/Salta", "America/Argentina/San_Juan", "America/Argentina/San_Luis", "America/Argentina/Tucuman", "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Atikokan", "America/Bahia", "America/Bahia_Banderas", "America/Barbados", "America/Belem", "America/Belize", "America/Blanc-Sablon", "America/Boa_Vista", "America/Bogota", "America/Boise", "America/Cambridge_Bay", "America/Campo_Grande", "America/Cancun", "America/Caracas", "America/Cayenne", "America/Cayman", "America/Chicago", "America/Chihuahua", "America/Ciudad_Juarez", "America/Costa_Rica", "America/Creston", "America/Cuiaba", "America/Curacao", "America/Danmarkshavn", "America/Dawson", "America/Dawson_Creek", "America/Denver", "America/Detroit", "America/Dominica", "America/Edmonton", "America/Eirunepe", "America/El_Salvador", "America/Fort_Nelson", "America/Fortaleza", "America/Glace_Bay", "America/Goose_Bay", "America/Grand_Turk", "America/Grenada", "America/Guadeloupe", "America/Guatemala", "America/Guayaquil", "America/Guyana", "America/Halifax", "America/Havana", "America/Hermosillo", "America/Indiana/Indianapolis", "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Tell_City", "America/Indiana/Vevay", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Inuvik", "America/Iqaluit", "America/Jamaica", "America/Juneau", "America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/Kralendijk", "America/La_Paz", "America/Lima", "America/Los_Angeles", "America/Lower_Princes", "America/Maceio", "America/Managua", "America/Manaus", "America/Marigot", "America/Martinique", "America/Matamoros", "America/Mazatlan", "America/Menominee", "America/Merida", "America/Metlakatla", "America/Mexico_City", "America/Miquelon", "America/Moncton", "America/Monterrey", "America/Montevideo", "America/Montserrat", "America/Nassau", "America/New_York", "America/Nome", "America/Noronha", "America/North_Dakota/Beulah", "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/Nuuk", "America/Ojinaga", "America/Panama", "America/Paramaribo", "America/Phoenix", "America/Port-au-Prince", "America/Port_of_Spain", "America/Porto_Velho", "America/Puerto_Rico", "America/Punta_Arenas", "America/Rankin_Inlet", "America/Recife", "America/Regina", "America/Resolute", "America/Rio_Branco", "America/Santarem", "America/Santiago", "America/Santo_Domingo", "America/Sao_Paulo", "America/Scoresbysund", "America/Sitka", "America/St_Barthelemy", "America/St_Johns", "America/St_Kitts", "America/St_Lucia", "America/St_Thomas", "America/St_Vincent", "America/Swift_Current", "America/Tegucigalpa", "America/Thule", "America/Tijuana", "America/Toronto", "America/Tortola", "America/Vancouver", "America/Whitehorse", "America/Winnipeg", "America/Yakutat", "America/Yellowknife", "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie", "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Palmer", "Antarctica/Rothera", "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok", "Arctic/Longyearbyen", "Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe", "Asia/Ashgabat", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku", "Asia/Bangkok", "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei", "Asia/Chita", "Asia/Choibalsan", "Asia/Colombo", "Asia/Damascus", "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe", "Asia/Famagusta", "Asia/Gaza", "Asia/Hebron", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Hovd", "Asia/Irkutsk", "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka", "Asia/Karachi", "Asia/Kathmandu", "Asia/Khandyga", "Asia/Kolkata", "Asia/Krasnoyarsk", "Asia/Kuala_Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macau", "Asia/Magadan", "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral", "Asia/Phnom_Penh", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar", "Asia/Qostanay", "Asia/Qyzylorda", "Asia/Riyadh", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Srednekolymsk", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Thimphu", "Asia/Tokyo", "Asia/Tomsk", "Asia/Ulaanbaatar", "Asia/Urumqi", "Asia/Ust-Nera", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yangon", "Asia/Yekaterinburg", "Asia/Yerevan", "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape_Verde", "Atlantic/Faroe", "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South_Georgia", "Atlantic/St_Helena", "Atlantic/Stanley", "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill", "Australia/Darwin", "Australia/Eucla", "Australia/Hobart", "Australia/Lindeman", "Australia/Lord_Howe", "Australia/Melbourne", "Australia/Perth", "Australia/Sydney", "Europe/Amsterdam", "Europe/Andorra", "Europe/Astrakhan", "Europe/Athens", "Europe/Belgrade", "Europe/Berlin", "Europe/Bratislava", "Europe/Brussels", "Europe/Bucharest", "Europe/Budapest", "Europe/Busingen", "Europe/Chisinau", "Europe/Copenhagen", "Europe/Dublin", "Europe/Gibraltar", "Europe/Guernsey", "Europe/Helsinki", "Europe/Isle_of_Man", "Europe/Istanbul", "Europe/Jersey", "Europe/Kaliningrad", "Europe/Kirov", "Europe/Kyiv", "Europe/Lisbon", "Europe/Ljubljana", "Europe/London", "Europe/Luxembourg", "Europe/Madrid", "Europe/Malta", "Europe/Mariehamn", "Europe/Minsk", "Europe/Monaco", "Europe/Moscow", "Europe/Oslo", "Europe/Paris", "Europe/Podgorica", "Europe/Prague", "Europe/Riga", "Europe/Rome", "Europe/Samara", "Europe/San_Marino", "Europe/Sarajevo", "Europe/Saratov", "Europe/Simferopol", "Europe/Skopje", "Europe/Sofia", "Europe/Stockholm", "Europe/Tallinn", "Europe/Tirane", "Europe/Ulyanovsk", "Europe/Vaduz", "Europe/Vatican", "Europe/Vienna", "Europe/Vilnius", "Europe/Volgograd", "Europe/Warsaw", "Europe/Zagreb", "Europe/Zurich", "Indian/Antananarivo", "Indian/Chagos", "Indian/Christmas", "Indian/Cocos", "Indian/Comoro", "Indian/Kerguelen", "Indian/Mahe", "Indian/Maldives", "Indian/Mauritius", "Indian/Mayotte", "Indian/Reunion", "Pacific/Apia", "Pacific/Auckland", "Pacific/Bougainville", "Pacific/Chatham", "Pacific/Chuuk", "Pacific/Easter", "Pacific/Efate", "Pacific/Fakaofo", "Pacific/Fiji", "Pacific/Funafuti", "Pacific/Galapagos", "Pacific/Gambier", "Pacific/Guadalcanal", "Pacific/Guam", "Pacific/Honolulu", "Pacific/Kanton", "Pacific/Kiritimati", "Pacific/Kosrae", "Pacific/Kwajalein", "Pacific/Majuro", "Pacific/Marquesas", "Pacific/Midway", "Pacific/Nauru", "Pacific/Niue", "Pacific/Norfolk", "Pacific/Noumea", "Pacific/Pago_Pago", "Pacific/Palau", "Pacific/Pitcairn", "Pacific/Pohnpei", "Pacific/Port_Moresby", "Pacific/Rarotonga", "Pacific/Saipan", "Pacific/Tahiti", "Pacific/Tarawa", "Pacific/Tongatapu", "Pacific/Wake", "Pacific/Wallis"];
var et = { time_zone: _2 };
var nr2 = et;
var ir2 = ["ADP", "AGP", "AI", "API", "ASCII", "CLI", "COM", "CSS", "DNS", "DRAM", "EXE", "FTP", "GB", "HDD", "HEX", "HTTP", "IB", "IP", "JBOD", "JSON", "OCR", "PCI", "PNG", "RAM", "RSS", "SAS", "SCSI", "SDD", "SMS", "SMTP", "SQL", "SSD", "SSL", "TCP", "THX", "TLS", "UDP", "USB", "UTF8", "VGA", "XML", "XSS"];
var rt = { abbreviation: ir2 };
var or2 = rt;
var sr2 = { smiley: ["\u2620\uFE0F", "\u2639\uFE0F", "\u263A\uFE0F", "\u2763\uFE0F", "\u2764\uFE0F", "\u2764\uFE0F\u200D\u{1F525}", "\u2764\uFE0F\u200D\u{1FA79}", "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F", "\u{1F479}", "\u{1F47A}", "\u{1F47B}", "\u{1F47D}", "\u{1F47E}", "\u{1F47F}", "\u{1F480}", "\u{1F48B}", "\u{1F48C}", "\u{1F493}", "\u{1F494}", "\u{1F495}", "\u{1F496}", "\u{1F497}", "\u{1F498}", "\u{1F499}", "\u{1F49A}", "\u{1F49B}", "\u{1F49C}", "\u{1F49D}", "\u{1F49E}", "\u{1F49F}", "\u{1F4A2}", "\u{1F4A3}", "\u{1F4A4}", "\u{1F4A5}", "\u{1F4A6}", "\u{1F4A8}", "\u{1F4A9}", "\u{1F4AB}", "\u{1F4AC}", "\u{1F4AD}", "\u{1F4AF}", "\u{1F573}\uFE0F", "\u{1F5A4}", "\u{1F5E8}\uFE0F", "\u{1F5EF}\uFE0F", "\u{1F600}", "\u{1F601}", "\u{1F602}", "\u{1F603}", "\u{1F604}", "\u{1F605}", "\u{1F606}", "\u{1F607}", "\u{1F608}", "\u{1F609}", "\u{1F60A}", "\u{1F60B}", "\u{1F60C}", "\u{1F60D}", "\u{1F60E}", "\u{1F60F}", "\u{1F610}", "\u{1F611}", "\u{1F612}", "\u{1F613}", "\u{1F614}", "\u{1F615}", "\u{1F616}", "\u{1F617}", "\u{1F618}", "\u{1F619}", "\u{1F61A}", "\u{1F61B}", "\u{1F61C}", "\u{1F61D}", "\u{1F61E}", "\u{1F61F}", "\u{1F620}", "\u{1F621}", "\u{1F622}", "\u{1F623}", "\u{1F624}", "\u{1F625}", "\u{1F626}", "\u{1F627}", "\u{1F628}", "\u{1F629}", "\u{1F62A}", "\u{1F62B}", "\u{1F62C}", "\u{1F62D}", "\u{1F62E}", "\u{1F62E}\u200D\u{1F4A8}", "\u{1F62F}", "\u{1F630}", "\u{1F631}", "\u{1F632}", "\u{1F633}", "\u{1F634}", "\u{1F635}", "\u{1F635}\u200D\u{1F4AB}", "\u{1F636}", "\u{1F636}\u200D\u{1F32B}\uFE0F", "\u{1F637}", "\u{1F638}", "\u{1F639}", "\u{1F63A}", "\u{1F63B}", "\u{1F63C}", "\u{1F63D}", "\u{1F63E}", "\u{1F63F}", "\u{1F640}", "\u{1F641}", "\u{1F642}", "\u{1F643}", "\u{1F644}", "\u{1F648}", "\u{1F649}", "\u{1F64A}", "\u{1F90D}", "\u{1F90E}", "\u{1F910}", "\u{1F911}", "\u{1F912}", "\u{1F913}", "\u{1F914}", "\u{1F915}", "\u{1F916}", "\u{1F917}", "\u{1F920}", "\u{1F921}", "\u{1F922}", "\u{1F923}", "\u{1F924}", "\u{1F925}", "\u{1F927}", "\u{1F928}", "\u{1F929}", "\u{1F92A}", "\u{1F92B}", "\u{1F92C}", "\u{1F92D}", "\u{1F92E}", "\u{1F92F}", "\u{1F970}", "\u{1F971}", "\u{1F972}", "\u{1F973}", "\u{1F974}", "\u{1F975}", "\u{1F976}", "\u{1F978}", "\u{1F97A}", "\u{1F9D0}", "\u{1F9E1}"], body: ["\u261D\u{1F3FB}", "\u261D\u{1F3FC}", "\u261D\u{1F3FD}", "\u261D\u{1F3FE}", "\u261D\u{1F3FF}", "\u261D\uFE0F", "\u270A", "\u270A\u{1F3FB}", "\u270A\u{1F3FC}", "\u270A\u{1F3FD}", "\u270A\u{1F3FE}", "\u270A\u{1F3FF}", "\u270B", "\u270B\u{1F3FB}", "\u270B\u{1F3FC}", "\u270B\u{1F3FD}", "\u270B\u{1F3FE}", "\u270B\u{1F3FF}", "\u270C\u{1F3FB}", "\u270C\u{1F3FC}", "\u270C\u{1F3FD}", "\u270C\u{1F3FE}", "\u270C\u{1F3FF}", "\u270C\uFE0F", "\u270D\u{1F3FB}", "\u270D\u{1F3FC}", "\u270D\u{1F3FD}", "\u270D\u{1F3FE}", "\u270D\u{1F3FF}", "\u270D\uFE0F", "\u{1F440}", "\u{1F441}\uFE0F", "\u{1F442}", "\u{1F442}\u{1F3FB}", "\u{1F442}\u{1F3FC}", "\u{1F442}\u{1F3FD}", "\u{1F442}\u{1F3FE}", "\u{1F442}\u{1F3FF}", "\u{1F443}", "\u{1F443}\u{1F3FB}", "\u{1F443}\u{1F3FC}", "\u{1F443}\u{1F3FD}", "\u{1F443}\u{1F3FE}", "\u{1F443}\u{1F3FF}", "\u{1F444}", "\u{1F445}", "\u{1F446}", "\u{1F446}\u{1F3FB}", "\u{1F446}\u{1F3FC}", "\u{1F446}\u{1F3FD}", "\u{1F446}\u{1F3FE}", "\u{1F446}\u{1F3FF}", "\u{1F447}", "\u{1F447}\u{1F3FB}", "\u{1F447}\u{1F3FC}", "\u{1F447}\u{1F3FD}", "\u{1F447}\u{1F3FE}", "\u{1F447}\u{1F3FF}", "\u{1F448}", "\u{1F448}\u{1F3FB}", "\u{1F448}\u{1F3FC}", "\u{1F448}\u{1F3FD}", "\u{1F448}\u{1F3FE}", "\u{1F448}\u{1F3FF}", "\u{1F449}", "\u{1F449}\u{1F3FB}", "\u{1F449}\u{1F3FC}", "\u{1F449}\u{1F3FD}", "\u{1F449}\u{1F3FE}", "\u{1F449}\u{1F3FF}", "\u{1F44A}", "\u{1F44A}\u{1F3FB}", "\u{1F44A}\u{1F3FC}", "\u{1F44A}\u{1F3FD}", "\u{1F44A}\u{1F3FE}", "\u{1F44A}\u{1F3FF}", "\u{1F44B}", "\u{1F44B}\u{1F3FB}", "\u{1F44B}\u{1F3FC}", "\u{1F44B}\u{1F3FD}", "\u{1F44B}\u{1F3FE}", "\u{1F44B}\u{1F3FF}", "\u{1F44C}", "\u{1F44C}\u{1F3FB}", "\u{1F44C}\u{1F3FC}", "\u{1F44C}\u{1F3FD}", "\u{1F44C}\u{1F3FE}", "\u{1F44C}\u{1F3FF}", "\u{1F44D}", "\u{1F44D}\u{1F3FB}", "\u{1F44D}\u{1F3FC}", "\u{1F44D}\u{1F3FD}", "\u{1F44D}\u{1F3FE}", "\u{1F44D}\u{1F3FF}", "\u{1F44E}", "\u{1F44E}\u{1F3FB}", "\u{1F44E}\u{1F3FC}", "\u{1F44E}\u{1F3FD}", "\u{1F44E}\u{1F3FE}", "\u{1F44E}\u{1F3FF}", "\u{1F44F}", "\u{1F44F}\u{1F3FB}", "\u{1F44F}\u{1F3FC}", "\u{1F44F}\u{1F3FD}", "\u{1F44F}\u{1F3FE}", "\u{1F44F}\u{1F3FF}", "\u{1F450}", "\u{1F450}\u{1F3FB}", "\u{1F450}\u{1F3FC}", "\u{1F450}\u{1F3FD}", "\u{1F450}\u{1F3FE}", "\u{1F450}\u{1F3FF}", "\u{1F485}", "\u{1F485}\u{1F3FB}", "\u{1F485}\u{1F3FC}", "\u{1F485}\u{1F3FD}", "\u{1F485}\u{1F3FE}", "\u{1F485}\u{1F3FF}", "\u{1F4AA}", "\u{1F4AA}\u{1F3FB}", "\u{1F4AA}\u{1F3FC}", "\u{1F4AA}\u{1F3FD}", "\u{1F4AA}\u{1F3FE}", "\u{1F4AA}\u{1F3FF}", "\u{1F590}\u{1F3FB}", "\u{1F590}\u{1F3FC}", "\u{1F590}\u{1F3FD}", "\u{1F590}\u{1F3FE}", "\u{1F590}\u{1F3FF}", "\u{1F590}\uFE0F", "\u{1F595}", "\u{1F595}\u{1F3FB}", "\u{1F595}\u{1F3FC}", "\u{1F595}\u{1F3FD}", "\u{1F595}\u{1F3FE}", "\u{1F595}\u{1F3FF}", "\u{1F596}", "\u{1F596}\u{1F3FB}", "\u{1F596}\u{1F3FC}", "\u{1F596}\u{1F3FD}", "\u{1F596}\u{1F3FE}", "\u{1F596}\u{1F3FF}", "\u{1F64C}", "\u{1F64C}\u{1F3FB}", "\u{1F64C}\u{1F3FC}", "\u{1F64C}\u{1F3FD}", "\u{1F64C}\u{1F3FE}", "\u{1F64C}\u{1F3FF}", "\u{1F64F}", "\u{1F64F}\u{1F3FB}", "\u{1F64F}\u{1F3FC}", "\u{1F64F}\u{1F3FD}", "\u{1F64F}\u{1F3FE}", "\u{1F64F}\u{1F3FF}", "\u{1F90C}", "\u{1F90C}\u{1F3FB}", "\u{1F90C}\u{1F3FC}", "\u{1F90C}\u{1F3FD}", "\u{1F90C}\u{1F3FE}", "\u{1F90C}\u{1F3FF}", "\u{1F90F}", "\u{1F90F}\u{1F3FB}", "\u{1F90F}\u{1F3FC}", "\u{1F90F}\u{1F3FD}", "\u{1F90F}\u{1F3FE}", "\u{1F90F}\u{1F3FF}", "\u{1F918}", "\u{1F918}\u{1F3FB}", "\u{1F918}\u{1F3FC}", "\u{1F918}\u{1F3FD}", "\u{1F918}\u{1F3FE}", "\u{1F918}\u{1F3FF}", "\u{1F919}", "\u{1F919}\u{1F3FB}", "\u{1F919}\u{1F3FC}", "\u{1F919}\u{1F3FD}", "\u{1F919}\u{1F3FE}", "\u{1F919}\u{1F3FF}", "\u{1F91A}", "\u{1F91A}\u{1F3FB}", "\u{1F91A}\u{1F3FC}", "\u{1F91A}\u{1F3FD}", "\u{1F91A}\u{1F3FE}", "\u{1F91A}\u{1F3FF}", "\u{1F91B}", "\u{1F91B}\u{1F3FB}", "\u{1F91B}\u{1F3FC}", "\u{1F91B}\u{1F3FD}", "\u{1F91B}\u{1F3FE}", "\u{1F91B}\u{1F3FF}", "\u{1F91C}", "\u{1F91C}\u{1F3FB}", "\u{1F91C}\u{1F3FC}", "\u{1F91C}\u{1F3FD}", "\u{1F91C}\u{1F3FE}", "\u{1F91C}\u{1F3FF}", "\u{1F91D}", "\u{1F91E}", "\u{1F91E}\u{1F3FB}", "\u{1F91E}\u{1F3FC}", "\u{1F91E}\u{1F3FD}", "\u{1F91E}\u{1F3FE}", "\u{1F91E}\u{1F3FF}", "\u{1F91F}", "\u{1F91F}\u{1F3FB}", "\u{1F91F}\u{1F3FC}", "\u{1F91F}\u{1F3FD}", "\u{1F91F}\u{1F3FE}", "\u{1F91F}\u{1F3FF}", "\u{1F932}", "\u{1F932}\u{1F3FB}", "\u{1F932}\u{1F3FC}", "\u{1F932}\u{1F3FD}", "\u{1F932}\u{1F3FE}", "\u{1F932}\u{1F3FF}", "\u{1F933}", "\u{1F933}\u{1F3FB}", "\u{1F933}\u{1F3FC}", "\u{1F933}\u{1F3FD}", "\u{1F933}\u{1F3FE}", "\u{1F933}\u{1F3FF}", "\u{1F9B4}", "\u{1F9B5}", "\u{1F9B5}\u{1F3FB}", "\u{1F9B5}\u{1F3FC}", "\u{1F9B5}\u{1F3FD}", "\u{1F9B5}\u{1F3FE}", "\u{1F9B5}\u{1F3FF}", "\u{1F9B6}", "\u{1F9B6}\u{1F3FB}", "\u{1F9B6}\u{1F3FC}", "\u{1F9B6}\u{1F3FD}", "\u{1F9B6}\u{1F3FE}", "\u{1F9B6}\u{1F3FF}", "\u{1F9B7}", "\u{1F9BB}", "\u{1F9BB}\u{1F3FB}", "\u{1F9BB}\u{1F3FC}", "\u{1F9BB}\u{1F3FD}", "\u{1F9BB}\u{1F3FE}", "\u{1F9BB}\u{1F3FF}", "\u{1F9BE}", "\u{1F9BF}", "\u{1F9E0}", "\u{1FAC0}", "\u{1FAC1}"], person: ["\u{1F385}", "\u{1F385}\u{1F3FB}", "\u{1F385}\u{1F3FC}", "\u{1F385}\u{1F3FD}", "\u{1F385}\u{1F3FE}", "\u{1F385}\u{1F3FF}", "\u{1F466}", "\u{1F466}\u{1F3FB}", "\u{1F466}\u{1F3FC}", "\u{1F466}\u{1F3FD}", "\u{1F466}\u{1F3FE}", "\u{1F466}\u{1F3FF}", "\u{1F467}", "\u{1F467}\u{1F3FB}", "\u{1F467}\u{1F3FC}", "\u{1F467}\u{1F3FD}", "\u{1F467}\u{1F3FE}", "\u{1F467}\u{1F3FF}", "\u{1F468}", "\u{1F468}\u200D\u2695\uFE0F", "\u{1F468}\u200D\u2696\uFE0F", "\u{1F468}\u200D\u2708\uFE0F", "\u{1F468}\u200D\u{1F33E}", "\u{1F468}\u200D\u{1F373}", "\u{1F468}\u200D\u{1F37C}", "\u{1F468}\u200D\u{1F393}", "\u{1F468}\u200D\u{1F3A4}", "\u{1F468}\u200D\u{1F3A8}", "\u{1F468}\u200D\u{1F3EB}", "\u{1F468}\u200D\u{1F3ED}", "\u{1F468}\u200D\u{1F4BB}", "\u{1F468}\u200D\u{1F4BC}", "\u{1F468}\u200D\u{1F527}", "\u{1F468}\u200D\u{1F52C}", "\u{1F468}\u200D\u{1F680}", "\u{1F468}\u200D\u{1F692}", "\u{1F468}\u200D\u{1F9B0}", "\u{1F468}\u200D\u{1F9B1}", "\u{1F468}\u200D\u{1F9B2}", "\u{1F468}\u200D\u{1F9B3}", "\u{1F468}\u{1F3FB}", "\u{1F468}\u{1F3FB}\u200D\u2695\uFE0F", "\u{1F468}\u{1F3FB}\u200D\u2696\uFE0F", "\u{1F468}\u{1F3FB}\u200D\u2708\uFE0F", "\u{1F468}\u{1F3FB}\u200D\u{1F33E}", "\u{1F468}\u{1F3FB}\u200D\u{1F373}", "\u{1F468}\u{1F3FB}\u200D\u{1F37C}", "\u{1F468}\u{1F3FB}\u200D\u{1F393}", "\u{1F468}\u{1F3FB}\u200D\u{1F3A4}", "\u{1F468}\u{1F3FB}\u200D\u{1F3A8}", "\u{1F468}\u{1F3FB}\u200D\u{1F3EB}", "\u{1F468}\u{1F3FB}\u200D\u{1F3ED}", "\u{1F468}\u{1F3FB}\u200D\u{1F4BB}", "\u{1F468}\u{1F3FB}\u200D\u{1F4BC}", "\u{1F468}\u{1F3FB}\u200D\u{1F527}", "\u{1F468}\u{1F3FB}\u200D\u{1F52C}", "\u{1F468}\u{1F3FB}\u200D\u{1F680}", "\u{1F468}\u{1F3FB}\u200D\u{1F692}", "\u{1F468}\u{1F3FB}\u200D\u{1F9B0}", "\u{1F468}\u{1F3FB}\u200D\u{1F9B1}", "\u{1F468}\u{1F3FB}\u200D\u{1F9B2}", "\u{1F468}\u{1F3FB}\u200D\u{1F9B3}", "\u{1F468}\u{1F3FC}", "\u{1F468}\u{1F3FC}\u200D\u2695\uFE0F", "\u{1F468}\u{1F3FC}\u200D\u2696\uFE0F", "\u{1F468}\u{1F3FC}\u200D\u2708\uFE0F", "\u{1F468}\u{1F3FC}\u200D\u{1F33E}", "\u{1F468}\u{1F3FC}\u200D\u{1F373}", "\u{1F468}\u{1F3FC}\u200D\u{1F37C}", "\u{1F468}\u{1F3FC}\u200D\u{1F393}", "\u{1F468}\u{1F3FC}\u200D\u{1F3A4}", "\u{1F468}\u{1F3FC}\u200D\u{1F3A8}", "\u{1F468}\u{1F3FC}\u200D\u{1F3EB}", "\u{1F468}\u{1F3FC}\u200D\u{1F3ED}", "\u{1F468}\u{1F3FC}\u200D\u{1F4BB}", "\u{1F468}\u{1F3FC}\u200D\u{1F4BC}", "\u{1F468}\u{1F3FC}\u200D\u{1F527}", "\u{1F468}\u{1F3FC}\u200D\u{1F52C}", "\u{1F468}\u{1F3FC}\u200D\u{1F680}", "\u{1F468}\u{1F3FC}\u200D\u{1F692}", "\u{1F468}\u{1F3FC}\u200D\u{1F9B0}", "\u{1F468}\u{1F3FC}\u200D\u{1F9B1}", "\u{1F468}\u{1F3FC}\u200D\u{1F9B2}", "\u{1F468}\u{1F3FC}\u200D\u{1F9B3}", "\u{1F468}\u{1F3FD}", "\u{1F468}\u{1F3FD}\u200D\u2695\uFE0F", "\u{1F468}\u{1F3FD}\u200D\u2696\uFE0F", "\u{1F468}\u{1F3FD}\u200D\u2708\uFE0F", "\u{1F468}\u{1F3FD}\u200D\u{1F33E}", "\u{1F468}\u{1F3FD}\u200D\u{1F373}", "\u{1F468}\u{1F3FD}\u200D\u{1F37C}", "\u{1F468}\u{1F3FD}\u200D\u{1F393}", "\u{1F468}\u{1F3FD}\u200D\u{1F3A4}", "\u{1F468}\u{1F3FD}\u200D\u{1F3A8}", "\u{1F468}\u{1F3FD}\u200D\u{1F3EB}", "\u{1F468}\u{1F3FD}\u200D\u{1F3ED}", "\u{1F468}\u{1F3FD}\u200D\u{1F4BB}", "\u{1F468}\u{1F3FD}\u200D\u{1F4BC}", "\u{1F468}\u{1F3FD}\u200D\u{1F527}", "\u{1F468}\u{1F3FD}\u200D\u{1F52C}", "\u{1F468}\u{1F3FD}\u200D\u{1F680}", "\u{1F468}\u{1F3FD}\u200D\u{1F692}", "\u{1F468}\u{1F3FD}\u200D\u{1F9B0}", "\u{1F468}\u{1F3FD}\u200D\u{1F9B1}", "\u{1F468}\u{1F3FD}\u200D\u{1F9B2}", "\u{1F468}\u{1F3FD}\u200D\u{1F9B3}", "\u{1F468}\u{1F3FE}", "\u{1F468}\u{1F3FE}\u200D\u2695\uFE0F", "\u{1F468}\u{1F3FE}\u200D\u2696\uFE0F", "\u{1F468}\u{1F3FE}\u200D\u2708\uFE0F", "\u{1F468}\u{1F3FE}\u200D\u{1F33E}", "\u{1F468}\u{1F3FE}\u200D\u{1F373}", "\u{1F468}\u{1F3FE}\u200D\u{1F37C}", "\u{1F468}\u{1F3FE}\u200D\u{1F393}", "\u{1F468}\u{1F3FE}\u200D\u{1F3A4}", "\u{1F468}\u{1F3FE}\u200D\u{1F3A8}", "\u{1F468}\u{1F3FE}\u200D\u{1F3EB}", "\u{1F468}\u{1F3FE}\u200D\u{1F3ED}", "\u{1F468}\u{1F3FE}\u200D\u{1F4BB}", "\u{1F468}\u{1F3FE}\u200D\u{1F4BC}", "\u{1F468}\u{1F3FE}\u200D\u{1F527}", "\u{1F468}\u{1F3FE}\u200D\u{1F52C}", "\u{1F468}\u{1F3FE}\u200D\u{1F680}", "\u{1F468}\u{1F3FE}\u200D\u{1F692}", "\u{1F468}\u{1F3FE}\u200D\u{1F9B0}", "\u{1F468}\u{1F3FE}\u200D\u{1F9B1}", "\u{1F468}\u{1F3FE}\u200D\u{1F9B2}", "\u{1F468}\u{1F3FE}\u200D\u{1F9B3}", "\u{1F468}\u{1F3FF}", "\u{1F468}\u{1F3FF}\u200D\u2695\uFE0F", "\u{1F468}\u{1F3FF}\u200D\u2696\uFE0F", "\u{1F468}\u{1F3FF}\u200D\u2708\uFE0F", "\u{1F468}\u{1F3FF}\u200D\u{1F33E}", "\u{1F468}\u{1F3FF}\u200D\u{1F373}", "\u{1F468}\u{1F3FF}\u200D\u{1F37C}", "\u{1F468}\u{1F3FF}\u200D\u{1F393}", "\u{1F468}\u{1F3FF}\u200D\u{1F3A4}", "\u{1F468}\u{1F3FF}\u200D\u{1F3A8}", "\u{1F468}\u{1F3FF}\u200D\u{1F3EB}", "\u{1F468}\u{1F3FF}\u200D\u{1F3ED}", "\u{1F468}\u{1F3FF}\u200D\u{1F4BB}", "\u{1F468}\u{1F3FF}\u200D\u{1F4BC}", "\u{1F468}\u{1F3FF}\u200D\u{1F527}", "\u{1F468}\u{1F3FF}\u200D\u{1F52C}", "\u{1F468}\u{1F3FF}\u200D\u{1F680}", "\u{1F468}\u{1F3FF}\u200D\u{1F692}", "\u{1F468}\u{1F3FF}\u200D\u{1F9B0}", "\u{1F468}\u{1F3FF}\u200D\u{1F9B1}", "\u{1F468}\u{1F3FF}\u200D\u{1F9B2}", "\u{1F468}\u{1F3FF}\u200D\u{1F9B3}", "\u{1F469}", "\u{1F469}\u200D\u2695\uFE0F", "\u{1F469}\u200D\u2696\uFE0F", "\u{1F469}\u200D\u2708\uFE0F", "\u{1F469}\u200D\u{1F33E}", "\u{1F469}\u200D\u{1F373}", "\u{1F469}\u200D\u{1F37C}", "\u{1F469}\u200D\u{1F393}", "\u{1F469}\u200D\u{1F3A4}", "\u{1F469}\u200D\u{1F3A8}", "\u{1F469}\u200D\u{1F3EB}", "\u{1F469}\u200D\u{1F3ED}", "\u{1F469}\u200D\u{1F4BB}", "\u{1F469}\u200D\u{1F4BC}", "\u{1F469}\u200D\u{1F527}", "\u{1F469}\u200D\u{1F52C}", "\u{1F469}\u200D\u{1F680}", "\u{1F469}\u200D\u{1F692}", "\u{1F469}\u200D\u{1F9B0}", "\u{1F469}\u200D\u{1F9B1}", "\u{1F469}\u200D\u{1F9B2}", "\u{1F469}\u200D\u{1F9B3}", "\u{1F469}\u{1F3FB}", "\u{1F469}\u{1F3FB}\u200D\u2695\uFE0F", "\u{1F469}\u{1F3FB}\u200D\u2696\uFE0F", "\u{1F469}\u{1F3FB}\u200D\u2708\uFE0F", "\u{1F469}\u{1F3FB}\u200D\u{1F33E}", "\u{1F469}\u{1F3FB}\u200D\u{1F373}", "\u{1F469}\u{1F3FB}\u200D\u{1F37C}", "\u{1F469}\u{1F3FB}\u200D\u{1F393}", "\u{1F469}\u{1F3FB}\u200D\u{1F3A4}", "\u{1F469}\u{1F3FB}\u200D\u{1F3A8}", "\u{1F469}\u{1F3FB}\u200D\u{1F3EB}", "\u{1F469}\u{1F3FB}\u200D\u{1F3ED}", "\u{1F469}\u{1F3FB}\u200D\u{1F4BB}", "\u{1F469}\u{1F3FB}\u200D\u{1F4BC}", "\u{1F469}\u{1F3FB}\u200D\u{1F527}", "\u{1F469}\u{1F3FB}\u200D\u{1F52C}", "\u{1F469}\u{1F3FB}\u200D\u{1F680}", "\u{1F469}\u{1F3FB}\u200D\u{1F692}", "\u{1F469}\u{1F3FB}\u200D\u{1F9B0}", "\u{1F469}\u{1F3FB}\u200D\u{1F9B1}", "\u{1F469}\u{1F3FB}\u200D\u{1F9B2}", "\u{1F469}\u{1F3FB}\u200D\u{1F9B3}", "\u{1F469}\u{1F3FC}", "\u{1F469}\u{1F3FC}\u200D\u2695\uFE0F", "\u{1F469}\u{1F3FC}\u200D\u2696\uFE0F", "\u{1F469}\u{1F3FC}\u200D\u2708\uFE0F", "\u{1F469}\u{1F3FC}\u200D\u{1F33E}", "\u{1F469}\u{1F3FC}\u200D\u{1F373}", "\u{1F469}\u{1F3FC}\u200D\u{1F37C}", "\u{1F469}\u{1F3FC}\u200D\u{1F393}", "\u{1F469}\u{1F3FC}\u200D\u{1F3A4}", "\u{1F469}\u{1F3FC}\u200D\u{1F3A8}", "\u{1F469}\u{1F3FC}\u200D\u{1F3EB}", "\u{1F469}\u{1F3FC}\u200D\u{1F3ED}", "\u{1F469}\u{1F3FC}\u200D\u{1F4BB}", "\u{1F469}\u{1F3FC}\u200D\u{1F4BC}", "\u{1F469}\u{1F3FC}\u200D\u{1F527}", "\u{1F469}\u{1F3FC}\u200D\u{1F52C}", "\u{1F469}\u{1F3FC}\u200D\u{1F680}", "\u{1F469}\u{1F3FC}\u200D\u{1F692}", "\u{1F469}\u{1F3FC}\u200D\u{1F9B0}", "\u{1F469}\u{1F3FC}\u200D\u{1F9B1}", "\u{1F469}\u{1F3FC}\u200D\u{1F9B2}", "\u{1F469}\u{1F3FC}\u200D\u{1F9B3}", "\u{1F469}\u{1F3FD}", "\u{1F469}\u{1F3FD}\u200D\u2695\uFE0F", "\u{1F469}\u{1F3FD}\u200D\u2696\uFE0F", "\u{1F469}\u{1F3FD}\u200D\u2708\uFE0F", "\u{1F469}\u{1F3FD}\u200D\u{1F33E}", "\u{1F469}\u{1F3FD}\u200D\u{1F373}", "\u{1F469}\u{1F3FD}\u200D\u{1F37C}", "\u{1F469}\u{1F3FD}\u200D\u{1F393}", "\u{1F469}\u{1F3FD}\u200D\u{1F3A4}", "\u{1F469}\u{1F3FD}\u200D\u{1F3A8}", "\u{1F469}\u{1F3FD}\u200D\u{1F3EB}", "\u{1F469}\u{1F3FD}\u200D\u{1F3ED}", "\u{1F469}\u{1F3FD}\u200D\u{1F4BB}", "\u{1F469}\u{1F3FD}\u200D\u{1F4BC}", "\u{1F469}\u{1F3FD}\u200D\u{1F527}", "\u{1F469}\u{1F3FD}\u200D\u{1F52C}", "\u{1F469}\u{1F3FD}\u200D\u{1F680}", "\u{1F469}\u{1F3FD}\u200D\u{1F692}", "\u{1F469}\u{1F3FD}\u200D\u{1F9B0}", "\u{1F469}\u{1F3FD}\u200D\u{1F9B1}", "\u{1F469}\u{1F3FD}\u200D\u{1F9B2}", "\u{1F469}\u{1F3FD}\u200D\u{1F9B3}", "\u{1F469}\u{1F3FE}", "\u{1F469}\u{1F3FE}\u200D\u2695\uFE0F", "\u{1F469}\u{1F3FE}\u200D\u2696\uFE0F", "\u{1F469}\u{1F3FE}\u200D\u2708\uFE0F", "\u{1F469}\u{1F3FE}\u200D\u{1F33E}", "\u{1F469}\u{1F3FE}\u200D\u{1F373}", "\u{1F469}\u{1F3FE}\u200D\u{1F37C}", "\u{1F469}\u{1F3FE}\u200D\u{1F393}", "\u{1F469}\u{1F3FE}\u200D\u{1F3A4}", "\u{1F469}\u{1F3FE}\u200D\u{1F3A8}", "\u{1F469}\u{1F3FE}\u200D\u{1F3EB}", "\u{1F469}\u{1F3FE}\u200D\u{1F3ED}", "\u{1F469}\u{1F3FE}\u200D\u{1F4BB}", "\u{1F469}\u{1F3FE}\u200D\u{1F4BC}", "\u{1F469}\u{1F3FE}\u200D\u{1F527}", "\u{1F469}\u{1F3FE}\u200D\u{1F52C}", "\u{1F469}\u{1F3FE}\u200D\u{1F680}", "\u{1F469}\u{1F3FE}\u200D\u{1F692}", "\u{1F469}\u{1F3FE}\u200D\u{1F9B0}", "\u{1F469}\u{1F3FE}\u200D\u{1F9B1}", "\u{1F469}\u{1F3FE}\u200D\u{1F9B2}", "\u{1F469}\u{1F3FE}\u200D\u{1F9B3}", "\u{1F469}\u{1F3FF}", "\u{1F469}\u{1F3FF}\u200D\u2695\uFE0F", "\u{1F469}\u{1F3FF}\u200D\u2696\uFE0F", "\u{1F469}\u{1F3FF}\u200D\u2708\uFE0F", "\u{1F469}\u{1F3FF}\u200D\u{1F33E}", "\u{1F469}\u{1F3FF}\u200D\u{1F373}", "\u{1F469}\u{1F3FF}\u200D\u{1F37C}", "\u{1F469}\u{1F3FF}\u200D\u{1F393}", "\u{1F469}\u{1F3FF}\u200D\u{1F3A4}", "\u{1F469}\u{1F3FF}\u200D\u{1F3A8}", "\u{1F469}\u{1F3FF}\u200D\u{1F3EB}", "\u{1F469}\u{1F3FF}\u200D\u{1F3ED}", "\u{1F469}\u{1F3FF}\u200D\u{1F4BB}", "\u{1F469}\u{1F3FF}\u200D\u{1F4BC}", "\u{1F469}\u{1F3FF}\u200D\u{1F527}", "\u{1F469}\u{1F3FF}\u200D\u{1F52C}", "\u{1F469}\u{1F3FF}\u200D\u{1F680}", "\u{1F469}\u{1F3FF}\u200D\u{1F692}", "\u{1F469}\u{1F3FF}\u200D\u{1F9B0}", "\u{1F469}\u{1F3FF}\u200D\u{1F9B1}", "\u{1F469}\u{1F3FF}\u200D\u{1F9B2}", "\u{1F469}\u{1F3FF}\u200D\u{1F9B3}", "\u{1F46E}", "\u{1F46E}\u200D\u2640\uFE0F", "\u{1F46E}\u200D\u2642\uFE0F", "\u{1F46E}\u{1F3FB}", "\u{1F46E}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F46E}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F46E}\u{1F3FC}", "\u{1F46E}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F46E}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F46E}\u{1F3FD}", "\u{1F46E}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F46E}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F46E}\u{1F3FE}", "\u{1F46E}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F46E}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F46E}\u{1F3FF}", "\u{1F46E}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F46E}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F470}", "\u{1F470}\u200D\u2640\uFE0F", "\u{1F470}\u200D\u2642\uFE0F", "\u{1F470}\u{1F3FB}", "\u{1F470}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F470}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F470}\u{1F3FC}", "\u{1F470}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F470}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F470}\u{1F3FD}", "\u{1F470}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F470}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F470}\u{1F3FE}", "\u{1F470}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F470}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F470}\u{1F3FF}", "\u{1F470}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F470}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F471}", "\u{1F471}\u200D\u2640\uFE0F", "\u{1F471}\u200D\u2642\uFE0F", "\u{1F471}\u{1F3FB}", "\u{1F471}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F471}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F471}\u{1F3FC}", "\u{1F471}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F471}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F471}\u{1F3FD}", "\u{1F471}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F471}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F471}\u{1F3FE}", "\u{1F471}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F471}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F471}\u{1F3FF}", "\u{1F471}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F471}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F472}", "\u{1F472}\u{1F3FB}", "\u{1F472}\u{1F3FC}", "\u{1F472}\u{1F3FD}", "\u{1F472}\u{1F3FE}", "\u{1F472}\u{1F3FF}", "\u{1F473}", "\u{1F473}\u200D\u2640\uFE0F", "\u{1F473}\u200D\u2642\uFE0F", "\u{1F473}\u{1F3FB}", "\u{1F473}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F473}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F473}\u{1F3FC}", "\u{1F473}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F473}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F473}\u{1F3FD}", "\u{1F473}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F473}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F473}\u{1F3FE}", "\u{1F473}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F473}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F473}\u{1F3FF}", "\u{1F473}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F473}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F474}", "\u{1F474}\u{1F3FB}", "\u{1F474}\u{1F3FC}", "\u{1F474}\u{1F3FD}", "\u{1F474}\u{1F3FE}", "\u{1F474}\u{1F3FF}", "\u{1F475}", "\u{1F475}\u{1F3FB}", "\u{1F475}\u{1F3FC}", "\u{1F475}\u{1F3FD}", "\u{1F475}\u{1F3FE}", "\u{1F475}\u{1F3FF}", "\u{1F476}", "\u{1F476}\u{1F3FB}", "\u{1F476}\u{1F3FC}", "\u{1F476}\u{1F3FD}", "\u{1F476}\u{1F3FE}", "\u{1F476}\u{1F3FF}", "\u{1F477}", "\u{1F477}\u200D\u2640\uFE0F", "\u{1F477}\u200D\u2642\uFE0F", "\u{1F477}\u{1F3FB}", "\u{1F477}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F477}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F477}\u{1F3FC}", "\u{1F477}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F477}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F477}\u{1F3FD}", "\u{1F477}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F477}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F477}\u{1F3FE}", "\u{1F477}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F477}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F477}\u{1F3FF}", "\u{1F477}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F477}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F478}", "\u{1F478}\u{1F3FB}", "\u{1F478}\u{1F3FC}", "\u{1F478}\u{1F3FD}", "\u{1F478}\u{1F3FE}", "\u{1F478}\u{1F3FF}", "\u{1F47C}", "\u{1F47C}\u{1F3FB}", "\u{1F47C}\u{1F3FC}", "\u{1F47C}\u{1F3FD}", "\u{1F47C}\u{1F3FE}", "\u{1F47C}\u{1F3FF}", "\u{1F481}", "\u{1F481}\u200D\u2640\uFE0F", "\u{1F481}\u200D\u2642\uFE0F", "\u{1F481}\u{1F3FB}", "\u{1F481}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F481}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F481}\u{1F3FC}", "\u{1F481}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F481}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F481}\u{1F3FD}", "\u{1F481}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F481}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F481}\u{1F3FE}", "\u{1F481}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F481}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F481}\u{1F3FF}", "\u{1F481}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F481}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F482}", "\u{1F482}\u200D\u2640\uFE0F", "\u{1F482}\u200D\u2642\uFE0F", "\u{1F482}\u{1F3FB}", "\u{1F482}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F482}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F482}\u{1F3FC}", "\u{1F482}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F482}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F482}\u{1F3FD}", "\u{1F482}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F482}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F482}\u{1F3FE}", "\u{1F482}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F482}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F482}\u{1F3FF}", "\u{1F482}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F482}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F486}", "\u{1F486}\u200D\u2640\uFE0F", "\u{1F486}\u200D\u2642\uFE0F", "\u{1F486}\u{1F3FB}", "\u{1F486}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F486}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F486}\u{1F3FC}", "\u{1F486}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F486}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F486}\u{1F3FD}", "\u{1F486}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F486}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F486}\u{1F3FE}", "\u{1F486}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F486}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F486}\u{1F3FF}", "\u{1F486}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F486}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F487}", "\u{1F487}\u{1F3FB}", "\u{1F487}\u{1F3FC}", "\u{1F487}\u{1F3FD}", "\u{1F575}\u{1F3FB}", "\u{1F575}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F575}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F575}\u{1F3FC}", "\u{1F575}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F575}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F575}\u{1F3FD}", "\u{1F575}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F575}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F575}\u{1F3FE}", "\u{1F575}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F575}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F575}\u{1F3FF}", "\u{1F575}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F575}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F575}\uFE0F", "\u{1F575}\uFE0F\u200D\u2640\uFE0F", "\u{1F575}\uFE0F\u200D\u2642\uFE0F", "\u{1F645}", "\u{1F645}\u200D\u2640\uFE0F", "\u{1F645}\u200D\u2642\uFE0F", "\u{1F645}\u{1F3FB}", "\u{1F645}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F645}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F645}\u{1F3FC}", "\u{1F645}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F645}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F645}\u{1F3FD}", "\u{1F645}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F645}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F645}\u{1F3FE}", "\u{1F645}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F645}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F645}\u{1F3FF}", "\u{1F645}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F645}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F646}", "\u{1F646}\u200D\u2640\uFE0F", "\u{1F646}\u200D\u2642\uFE0F", "\u{1F646}\u{1F3FB}", "\u{1F646}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F646}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F646}\u{1F3FC}", "\u{1F646}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F646}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F646}\u{1F3FD}", "\u{1F646}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F646}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F646}\u{1F3FE}", "\u{1F646}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F646}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F646}\u{1F3FF}", "\u{1F646}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F646}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F647}", "\u{1F647}\u200D\u2640\uFE0F", "\u{1F647}\u200D\u2642\uFE0F", "\u{1F647}\u{1F3FB}", "\u{1F647}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F647}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F647}\u{1F3FC}", "\u{1F647}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F647}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F647}\u{1F3FD}", "\u{1F647}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F647}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F647}\u{1F3FE}", "\u{1F647}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F647}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F647}\u{1F3FF}", "\u{1F647}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F647}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F64B}", "\u{1F64B}\u200D\u2640\uFE0F", "\u{1F64B}\u200D\u2642\uFE0F", "\u{1F64B}\u{1F3FB}", "\u{1F64B}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F64B}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F64B}\u{1F3FC}", "\u{1F64B}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F64B}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F64B}\u{1F3FD}", "\u{1F64B}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F64B}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F64B}\u{1F3FE}", "\u{1F64B}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F64B}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F64B}\u{1F3FF}", "\u{1F64B}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F64B}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F64D}", "\u{1F64D}\u200D\u2640\uFE0F", "\u{1F64D}\u200D\u2642\uFE0F", "\u{1F64D}\u{1F3FB}", "\u{1F64D}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F64D}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F64D}\u{1F3FC}", "\u{1F64D}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F64D}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F64D}\u{1F3FD}", "\u{1F64D}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F64D}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F64D}\u{1F3FE}", "\u{1F64D}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F64D}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F64D}\u{1F3FF}", "\u{1F64D}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F64D}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F64E}", "\u{1F64E}\u200D\u2640\uFE0F", "\u{1F64E}\u200D\u2642\uFE0F", "\u{1F64E}\u{1F3FB}", "\u{1F64E}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F64E}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F64E}\u{1F3FC}", "\u{1F64E}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F64E}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F64E}\u{1F3FD}", "\u{1F64E}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F64E}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F64E}\u{1F3FE}", "\u{1F64E}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F64E}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F64E}\u{1F3FF}", "\u{1F64E}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F64E}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F926}", "\u{1F926}\u200D\u2640\uFE0F", "\u{1F926}\u200D\u2642\uFE0F", "\u{1F926}\u{1F3FB}", "\u{1F926}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F926}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F926}\u{1F3FC}", "\u{1F926}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F926}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F926}\u{1F3FD}", "\u{1F926}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F926}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F926}\u{1F3FE}", "\u{1F926}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F926}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F926}\u{1F3FF}", "\u{1F926}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F926}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F930}", "\u{1F930}\u{1F3FB}", "\u{1F930}\u{1F3FC}", "\u{1F930}\u{1F3FD}", "\u{1F930}\u{1F3FE}", "\u{1F930}\u{1F3FF}", "\u{1F931}", "\u{1F931}\u{1F3FB}", "\u{1F931}\u{1F3FC}", "\u{1F931}\u{1F3FD}", "\u{1F931}\u{1F3FE}", "\u{1F931}\u{1F3FF}", "\u{1F934}", "\u{1F934}\u{1F3FB}", "\u{1F934}\u{1F3FC}", "\u{1F934}\u{1F3FD}", "\u{1F934}\u{1F3FE}", "\u{1F934}\u{1F3FF}", "\u{1F935}", "\u{1F935}\u200D\u2640\uFE0F", "\u{1F935}\u200D\u2642\uFE0F", "\u{1F935}\u{1F3FB}", "\u{1F935}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F935}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F935}\u{1F3FC}", "\u{1F935}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F935}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F935}\u{1F3FD}", "\u{1F935}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F935}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F935}\u{1F3FE}", "\u{1F935}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F935}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F935}\u{1F3FF}", "\u{1F935}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F935}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F936}", "\u{1F936}\u{1F3FB}", "\u{1F936}\u{1F3FC}", "\u{1F936}\u{1F3FD}", "\u{1F936}\u{1F3FE}", "\u{1F936}\u{1F3FF}", "\u{1F937}", "\u{1F937}\u200D\u2640\uFE0F", "\u{1F937}\u200D\u2642\uFE0F", "\u{1F937}\u{1F3FB}", "\u{1F937}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F937}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F937}\u{1F3FC}", "\u{1F937}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F937}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F937}\u{1F3FD}", "\u{1F937}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F937}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F937}\u{1F3FE}", "\u{1F937}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F937}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F937}\u{1F3FF}", "\u{1F937}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F937}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F977}", "\u{1F977}\u{1F3FB}", "\u{1F977}\u{1F3FC}", "\u{1F977}\u{1F3FD}", "\u{1F977}\u{1F3FE}", "\u{1F977}\u{1F3FF}", "\u{1F9B8}", "\u{1F9B8}\u200D\u2640\uFE0F", "\u{1F9B8}\u200D\u2642\uFE0F", "\u{1F9B8}\u{1F3FB}", "\u{1F9B8}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F9B8}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F9B8}\u{1F3FC}", "\u{1F9B8}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F9B8}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F9B8}\u{1F3FD}", "\u{1F9B8}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F9B8}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F9B8}\u{1F3FE}", "\u{1F9B8}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F9B8}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F9B8}\u{1F3FF}", "\u{1F9B8}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F9B8}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F9B9}", "\u{1F9B9}\u200D\u2640\uFE0F", "\u{1F9B9}\u200D\u2642\uFE0F", "\u{1F9B9}\u{1F3FB}", "\u{1F9B9}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F9B9}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F9B9}\u{1F3FC}", "\u{1F9B9}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F9B9}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F9B9}\u{1F3FD}", "\u{1F9B9}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F9B9}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F9B9}\u{1F3FE}", "\u{1F9B9}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F9B9}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F9B9}\u{1F3FF}", "\u{1F9B9}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F9B9}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F9CF}", "\u{1F9CF}\u200D\u2640\uFE0F", "\u{1F9CF}\u200D\u2642\uFE0F", "\u{1F9CF}\u{1F3FB}", "\u{1F9CF}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F9CF}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F9CF}\u{1F3FC}", "\u{1F9CF}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F9CF}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F9CF}\u{1F3FD}", "\u{1F9CF}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F9CF}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F9CF}\u{1F3FE}", "\u{1F9CF}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F9CF}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F9CF}\u{1F3FF}", "\u{1F9CF}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F9CF}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F9D1}", "\u{1F9D1}\u200D\u2695\uFE0F", "\u{1F9D1}\u200D\u2696\uFE0F", "\u{1F9D1}\u200D\u2708\uFE0F", "\u{1F9D1}\u200D\u{1F33E}", "\u{1F9D1}\u200D\u{1F373}", "\u{1F9D1}\u200D\u{1F37C}", "\u{1F9D1}\u200D\u{1F384}", "\u{1F9D1}\u200D\u{1F393}", "\u{1F9D1}\u200D\u{1F3A4}", "\u{1F9D1}\u200D\u{1F3A8}", "\u{1F9D1}\u200D\u{1F3EB}", "\u{1F9D1}\u200D\u{1F3ED}", "\u{1F9D1}\u200D\u{1F4BB}", "\u{1F9D1}\u200D\u{1F4BC}", "\u{1F9D1}\u200D\u{1F527}", "\u{1F9D1}\u200D\u{1F52C}", "\u{1F9D1}\u200D\u{1F680}", "\u{1F9D1}\u200D\u{1F692}", "\u{1F9D1}\u200D\u{1F9B0}", "\u{1F9D1}\u200D\u{1F9B1}", "\u{1F9D1}\u200D\u{1F9B2}", "\u{1F9D1}\u200D\u{1F9B3}", "\u{1F9D1}\u{1F3FB}", "\u{1F9D1}\u{1F3FB}\u200D\u2695\uFE0F", "\u{1F9D1}\u{1F3FB}\u200D\u2696\uFE0F", "\u{1F9D1}\u{1F3FB}\u200D\u2708\uFE0F", "\u{1F9D1}\u{1F3FB}\u200D\u{1F33E}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F373}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F37C}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F384}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F393}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F3A4}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F3A8}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F3EB}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F3ED}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F4BB}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F4BC}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F527}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F52C}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F680}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F692}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F9B0}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F9B1}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F9B2}", "\u{1F9D1}\u{1F3FB}\u200D\u{1F9B3}", "\u{1F9D1}\u{1F3FC}", "\u{1F9D1}\u{1F3FC}\u200D\u2695\uFE0F", "\u{1F9D1}\u{1F3FC}\u200D\u2696\uFE0F", "\u{1F9D1}\u{1F3FC}\u200D\u2708\uFE0F", "\u{1F9D1}\u{1F3FC}\u200D\u{1F33E}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F373}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F37C}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F384}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F393}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F3A4}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F3A8}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F3EB}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F3ED}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F4BB}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F4BC}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F527}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F52C}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F680}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F692}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F9B0}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F9B1}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F9B2}", "\u{1F9D1}\u{1F3FC}\u200D\u{1F9B3}", "\u{1F9D1}\u{1F3FD}", "\u{1F9D1}\u{1F3FD}\u200D\u2695\uFE0F", "\u{1F9D1}\u{1F3FD}\u200D\u2696\uFE0F", "\u{1F9D1}\u{1F3FD}\u200D\u2708\uFE0F", "\u{1F9D1}\u{1F3FD}\u200D\u{1F33E}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F373}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F37C}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F384}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F393}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F3A4}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F3A8}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F3EB}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F3ED}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F4BB}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F4BC}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F527}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F52C}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F680}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F692}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F9B0}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F9B1}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F9B2}", "\u{1F9D1}\u{1F3FD}\u200D\u{1F9B3}", "\u{1F9D1}\u{1F3FE}", "\u{1F9D1}\u{1F3FE}\u200D\u2695\uFE0F", "\u{1F9D1}\u{1F3FE}\u200D\u2696\uFE0F", "\u{1F9D1}\u{1F3FE}\u200D\u2708\uFE0F", "\u{1F9D1}\u{1F3FE}\u200D\u{1F33E}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F373}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F37C}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F384}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F393}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F3A4}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F3A8}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F3EB}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F3ED}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F4BB}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F4BC}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F527}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F52C}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F680}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F692}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F9B0}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F9B1}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F9B2}", "\u{1F9D1}\u{1F3FE}\u200D\u{1F9B3}", "\u{1F9D1}\u{1F3FF}", "\u{1F9D1}\u{1F3FF}\u200D\u2695\uFE0F", "\u{1F9D1}\u{1F3FF}\u200D\u2696\uFE0F", "\u{1F9D1}\u{1F3FF}\u200D\u2708\uFE0F", "\u{1F9D1}\u{1F3FF}\u200D\u{1F33E}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F373}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F37C}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F384}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F393}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F3A4}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F3A8}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F3EB}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F3ED}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F4BB}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F4BC}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F527}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F52C}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F680}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F692}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F9B0}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F9B1}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F9B2}", "\u{1F9D1}\u{1F3FF}\u200D\u{1F9B3}", "\u{1F9D2}", "\u{1F9D2}\u{1F3FB}", "\u{1F9D2}\u{1F3FC}", "\u{1F9D2}\u{1F3FD}", "\u{1F9D2}\u{1F3FE}", "\u{1F9D2}\u{1F3FF}", "\u{1F9D3}", "\u{1F9D3}\u{1F3FB}", "\u{1F9D3}\u{1F3FC}", "\u{1F9D3}\u{1F3FD}", "\u{1F9D3}\u{1F3FE}", "\u{1F9D3}\u{1F3FF}", "\u{1F9D4}", "\u{1F9D4}\u200D\u2640\uFE0F", "\u{1F9D4}\u200D\u2642\uFE0F", "\u{1F9D4}\u{1F3FB}", "\u{1F9D4}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F9D4}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F9D4}\u{1F3FC}", "\u{1F9D4}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F9D4}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F9D4}\u{1F3FD}", "\u{1F9D4}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F9D4}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F9D4}\u{1F3FE}", "\u{1F9D4}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F9D4}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F9D4}\u{1F3FF}", "\u{1F9D4}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F9D4}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F9D5}", "\u{1F9D5}\u{1F3FB}", "\u{1F9D5}\u{1F3FC}", "\u{1F9D5}\u{1F3FD}", "\u{1F9D5}\u{1F3FE}", "\u{1F9D5}\u{1F3FF}", "\u{1F9D9}", "\u{1F9D9}\u200D\u2640\uFE0F", "\u{1F9D9}\u200D\u2642\uFE0F", "\u{1F9D9}\u{1F3FB}", "\u{1F9D9}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F9D9}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F9D9}\u{1F3FC}", "\u{1F9D9}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F9D9}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F9D9}\u{1F3FD}", "\u{1F9D9}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F9D9}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F9D9}\u{1F3FE}", "\u{1F9D9}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F9D9}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F9D9}\u{1F3FF}", "\u{1F9D9}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F9D9}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F9DA}", "\u{1F9DA}\u200D\u2640\uFE0F", "\u{1F9DA}\u200D\u2642\uFE0F", "\u{1F9DA}\u{1F3FB}", "\u{1F9DA}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F9DA}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F9DA}\u{1F3FC}", "\u{1F9DA}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F9DA}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F9DA}\u{1F3FD}", "\u{1F9DA}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F9DA}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F9DA}\u{1F3FE}", "\u{1F9DA}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F9DA}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F9DA}\u{1F3FF}", "\u{1F9DA}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F9DA}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F9DB}", "\u{1F9DB}\u200D\u2640\uFE0F", "\u{1F9DB}\u200D\u2642\uFE0F", "\u{1F9DB}\u{1F3FB}", "\u{1F9DB}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F9DB}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F9DB}\u{1F3FC}", "\u{1F9DB}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F9DB}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F9DB}\u{1F3FD}", "\u{1F9DB}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F9DB}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F9DB}\u{1F3FE}", "\u{1F9DB}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F9DB}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F9DB}\u{1F3FF}", "\u{1F9DB}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F9DB}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F9DC}", "\u{1F9DC}\u200D\u2640\uFE0F", "\u{1F9DC}\u200D\u2642\uFE0F", "\u{1F9DC}\u{1F3FB}", "\u{1F9DC}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F9DC}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F9DC}\u{1F3FC}", "\u{1F9DC}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F9DC}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F9DC}\u{1F3FD}", "\u{1F9DC}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F9DC}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F9DC}\u{1F3FE}", "\u{1F9DC}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F9DC}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F9DC}\u{1F3FF}", "\u{1F9DC}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F9DC}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F9DD}", "\u{1F9DD}\u200D\u2640\uFE0F", "\u{1F9DD}\u200D\u2642\uFE0F", "\u{1F9DD}\u{1F3FB}", "\u{1F9DD}\u{1F3FB}\u200D\u2640\uFE0F", "\u{1F9DD}\u{1F3FB}\u200D\u2642\uFE0F", "\u{1F9DD}\u{1F3FC}", "\u{1F9DD}\u{1F3FC}\u200D\u2640\uFE0F", "\u{1F9DD}\u{1F3FC}\u200D\u2642\uFE0F", "\u{1F9DD}\u{1F3FD}", "\u{1F9DD}\u{1F3FD}\u200D\u2640\uFE0F", "\u{1F9DD}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1F9DD}\u{1F3FE}", "\u{1F9DD}\u{1F3FE}\u200D\u2640\uFE0F", "\u{1F9DD}\u{1F3FE}\u200D\u2642\uFE0F", "\u{1F9DD}\u{1F3FF}", "\u{1F9DD}\u{1F3FF}\u200D\u2640\uFE0F", "\u{1F9DD}\u{1F3FF}\u200D\u2642\uFE0F", "\u{1F9DE}", "\u{1F9DE}\u200D\u2640\uFE0F", "\u{1F9DE}\u200D\u2642\uFE0F", "\u{1F9DF}", "\u{1F9DF}\u200D\u2640\uFE0F", "\u{1F9DF}\u200D\u2642\uFE0F"], nature: ["\u2618\uFE0F", "\u{1F331}", "\u{1F332}", "\u{1F333}", "\u{1F334}", "\u{1F335}", "\u{1F337}", "\u{1F338}", "\u{1F339}", "\u{1F33A}", "\u{1F33B}", "\u{1F33C}", "\u{1F33E}", "\u{1F33F}", "\u{1F340}", "\u{1F341}", "\u{1F342}", "\u{1F343}", "\u{1F3F5}\uFE0F", "\u{1F400}", "\u{1F401}", "\u{1F402}", "\u{1F403}", "\u{1F404}", "\u{1F405}", "\u{1F406}", "\u{1F407}", "\u{1F408}", "\u{1F408}\u200D\u2B1B", "\u{1F409}", "\u{1F40A}", "\u{1F40B}", "\u{1F40C}", "\u{1F40D}", "\u{1F40E}", "\u{1F40F}", "\u{1F410}", "\u{1F411}", "\u{1F412}", "\u{1F413}", "\u{1F414}", "\u{1F415}", "\u{1F415}\u200D\u{1F9BA}", "\u{1F416}", "\u{1F417}", "\u{1F418}", "\u{1F419}", "\u{1F41A}", "\u{1F41B}", "\u{1F41C}", "\u{1F41D}", "\u{1F41E}", "\u{1F41F}", "\u{1F420}", "\u{1F421}", "\u{1F422}", "\u{1F423}", "\u{1F424}", "\u{1F425}", "\u{1F426}", "\u{1F427}", "\u{1F428}", "\u{1F429}", "\u{1F42A}", "\u{1F42B}", "\u{1F42C}", "\u{1F42D}", "\u{1F42E}", "\u{1F42F}", "\u{1F430}", "\u{1F431}", "\u{1F432}", "\u{1F433}", "\u{1F434}", "\u{1F435}", "\u{1F436}", "\u{1F437}", "\u{1F438}", "\u{1F439}", "\u{1F43A}", "\u{1F43B}", "\u{1F43B}\u200D\u2744\uFE0F", "\u{1F43C}", "\u{1F43D}", "\u{1F43E}", "\u{1F43F}\uFE0F", "\u{1F490}", "\u{1F4AE}", "\u{1F54A}\uFE0F", "\u{1F577}\uFE0F", "\u{1F578}\uFE0F", "\u{1F940}", "\u{1F981}", "\u{1F982}", "\u{1F983}", "\u{1F984}", "\u{1F985}", "\u{1F986}", "\u{1F987}", "\u{1F988}", "\u{1F989}", "\u{1F98A}", "\u{1F98B}", "\u{1F98C}", "\u{1F98D}", "\u{1F98E}", "\u{1F98F}", "\u{1F992}", "\u{1F993}", "\u{1F994}", "\u{1F995}", "\u{1F996}", "\u{1F997}", "\u{1F998}", "\u{1F999}", "\u{1F99A}", "\u{1F99B}", "\u{1F99C}", "\u{1F99D}", "\u{1F99F}", "\u{1F9A0}", "\u{1F9A1}", "\u{1F9A2}", "\u{1F9A3}", "\u{1F9A4}", "\u{1F9A5}", "\u{1F9A6}", "\u{1F9A7}", "\u{1F9A8}", "\u{1F9A9}", "\u{1F9AB}", "\u{1F9AC}", "\u{1F9AD}", "\u{1F9AE}", "\u{1FAB0}", "\u{1FAB1}", "\u{1FAB2}", "\u{1FAB3}", "\u{1FAB4}", "\u{1FAB6}"], food: ["\u2615", "\u{1F32D}", "\u{1F32E}", "\u{1F32F}", "\u{1F330}", "\u{1F336}\uFE0F", "\u{1F33D}", "\u{1F344}", "\u{1F345}", "\u{1F346}", "\u{1F347}", "\u{1F348}", "\u{1F349}", "\u{1F34A}", "\u{1F34B}", "\u{1F34C}", "\u{1F34D}", "\u{1F34E}", "\u{1F34F}", "\u{1F350}", "\u{1F351}", "\u{1F352}", "\u{1F353}", "\u{1F354}", "\u{1F355}", "\u{1F356}", "\u{1F357}", "\u{1F358}", "\u{1F359}", "\u{1F35A}", "\u{1F35B}", "\u{1F35C}", "\u{1F35D}", "\u{1F35E}", "\u{1F35F}", "\u{1F360}", "\u{1F361}", "\u{1F362}", "\u{1F363}", "\u{1F364}", "\u{1F365}", "\u{1F366}", "\u{1F367}", "\u{1F368}", "\u{1F369}", "\u{1F36A}", "\u{1F36B}", "\u{1F36C}", "\u{1F36D}", "\u{1F36E}", "\u{1F36F}", "\u{1F370}", "\u{1F371}", "\u{1F372}", "\u{1F373}", "\u{1F374}", "\u{1F375}", "\u{1F376}", "\u{1F377}", "\u{1F378}", "\u{1F379}", "\u{1F37A}", "\u{1F37B}", "\u{1F37C}", "\u{1F37D}\uFE0F", "\u{1F37E}", "\u{1F37F}", "\u{1F382}", "\u{1F3FA}", "\u{1F52A}", "\u{1F942}", "\u{1F943}", "\u{1F944}", "\u{1F950}", "\u{1F951}", "\u{1F952}", "\u{1F953}", "\u{1F954}", "\u{1F955}", "\u{1F956}", "\u{1F957}", "\u{1F958}", "\u{1F959}", "\u{1F95A}", "\u{1F95B}", "\u{1F95C}", "\u{1F95D}", "\u{1F95E}", "\u{1F95F}", "\u{1F960}", "\u{1F961}", "\u{1F962}", "\u{1F963}", "\u{1F964}", "\u{1F965}", "\u{1F966}", "\u{1F967}", "\u{1F968}", "\u{1F969}", "\u{1F96A}", "\u{1F96B}", "\u{1F96C}", "\u{1F96D}", "\u{1F96E}", "\u{1F96F}", "\u{1F980}", "\u{1F990}", "\u{1F991}", "\u{1F99E}", "\u{1F9AA}", "\u{1F9C0}", "\u{1F9C1}", "\u{1F9C2}", "\u{1F9C3}", "\u{1F9C4}", "\u{1F9C5}", "\u{1F9C6}", "\u{1F9C7}", "\u{1F9C8}", "\u{1F9C9}", "\u{1F9CA}", "\u{1F9CB}", "\u{1FAD0}", "\u{1FAD1}", "\u{1FAD2}", "\u{1FAD3}", "\u{1FAD4}", "\u{1FAD5}", "\u{1FAD6}"], travel: ["\u231A", "\u231B", "\u23F0", "\u23F1\uFE0F", "\u23F2\uFE0F", "\u23F3", "\u2600\uFE0F", "\u2601\uFE0F", "\u2602\uFE0F", "\u2603\uFE0F", "\u2604\uFE0F", "\u2614", "\u2668\uFE0F", "\u2693", "\u26A1", "\u26C4", "\u26C5", "\u26C8\uFE0F", "\u26E9\uFE0F", "\u26EA", "\u26F0\uFE0F", "\u26F1\uFE0F", "\u26F2", "\u26F4\uFE0F", "\u26F5", "\u26FA", "\u26FD", "\u2708\uFE0F", "\u2744\uFE0F", "\u2B50", "\u{1F300}", "\u{1F301}", "\u{1F302}", "\u{1F303}", "\u{1F304}", "\u{1F305}", "\u{1F306}", "\u{1F307}", "\u{1F308}", "\u{1F309}", "\u{1F30A}", "\u{1F30B}", "\u{1F30C}", "\u{1F30D}", "\u{1F30E}", "\u{1F30F}", "\u{1F310}", "\u{1F311}", "\u{1F312}", "\u{1F313}", "\u{1F314}", "\u{1F315}", "\u{1F316}", "\u{1F317}", "\u{1F318}", "\u{1F319}", "\u{1F31A}", "\u{1F31B}", "\u{1F31C}", "\u{1F31D}", "\u{1F31E}", "\u{1F31F}", "\u{1F320}", "\u{1F321}\uFE0F", "\u{1F324}\uFE0F", "\u{1F325}\uFE0F", "\u{1F326}\uFE0F", "\u{1F327}\uFE0F", "\u{1F328}\uFE0F", "\u{1F329}\uFE0F", "\u{1F32A}\uFE0F", "\u{1F32B}\uFE0F", "\u{1F32C}\uFE0F", "\u{1F3A0}", "\u{1F3A1}", "\u{1F3A2}", "\u{1F3AA}", "\u{1F3CD}\uFE0F", "\u{1F3CE}\uFE0F", "\u{1F3D4}\uFE0F", "\u{1F3D5}\uFE0F", "\u{1F3D6}\uFE0F", "\u{1F3D7}\uFE0F", "\u{1F3D8}\uFE0F", "\u{1F3D9}\uFE0F", "\u{1F3DA}\uFE0F", "\u{1F3DB}\uFE0F", "\u{1F3DC}\uFE0F", "\u{1F3DD}\uFE0F", "\u{1F3DE}\uFE0F", "\u{1F3DF}\uFE0F", "\u{1F3E0}", "\u{1F3E1}", "\u{1F3E2}", "\u{1F3E3}", "\u{1F3E4}", "\u{1F3E5}", "\u{1F3E6}", "\u{1F3E8}", "\u{1F3E9}", "\u{1F3EA}", "\u{1F3EB}", "\u{1F3EC}", "\u{1F3ED}", "\u{1F3EF}", "\u{1F3F0}", "\u{1F488}", "\u{1F492}", "\u{1F4A7}", "\u{1F4BA}", "\u{1F525}", "\u{1F54B}", "\u{1F54C}", "\u{1F54D}", "\u{1F550}", "\u{1F551}", "\u{1F552}", "\u{1F553}", "\u{1F554}", "\u{1F555}", "\u{1F556}", "\u{1F557}", "\u{1F558}", "\u{1F559}", "\u{1F55A}", "\u{1F55B}", "\u{1F55C}", "\u{1F55D}", "\u{1F55E}", "\u{1F55F}", "\u{1F560}", "\u{1F561}", "\u{1F562}", "\u{1F563}", "\u{1F564}", "\u{1F565}", "\u{1F566}", "\u{1F567}", "\u{1F570}\uFE0F", "\u{1F5FA}\uFE0F", "\u{1F5FB}", "\u{1F5FC}", "\u{1F5FD}", "\u{1F5FE}", "\u{1F680}", "\u{1F681}", "\u{1F682}", "\u{1F683}", "\u{1F684}", "\u{1F685}", "\u{1F686}", "\u{1F687}", "\u{1F688}", "\u{1F689}", "\u{1F68A}", "\u{1F68B}", "\u{1F68C}", "\u{1F68D}", "\u{1F68E}", "\u{1F68F}", "\u{1F690}", "\u{1F691}", "\u{1F692}", "\u{1F693}", "\u{1F694}", "\u{1F695}", "\u{1F696}", "\u{1F697}", "\u{1F698}", "\u{1F699}", "\u{1F69A}", "\u{1F69B}", "\u{1F69C}", "\u{1F69D}", "\u{1F69E}", "\u{1F69F}", "\u{1F6A0}", "\u{1F6A1}", "\u{1F6A2}", "\u{1F6A4}", "\u{1F6A5}", "\u{1F6A6}", "\u{1F6A7}", "\u{1F6A8}", "\u{1F6B2}", "\u{1F6CE}\uFE0F", "\u{1F6D1}", "\u{1F6D5}", "\u{1F6D6}", "\u{1F6E2}\uFE0F", "\u{1F6E3}\uFE0F", "\u{1F6E4}\uFE0F", "\u{1F6E5}\uFE0F", "\u{1F6E9}\uFE0F", "\u{1F6EB}", "\u{1F6EC}", "\u{1F6F0}\uFE0F", "\u{1F6F3}\uFE0F", "\u{1F6F4}", "\u{1F6F5}", "\u{1F6F6}", "\u{1F6F8}", "\u{1F6F9}", "\u{1F6FA}", "\u{1F6FB}", "\u{1F6FC}", "\u{1F9BC}", "\u{1F9BD}", "\u{1F9ED}", "\u{1F9F1}", "\u{1F9F3}", "\u{1FA82}", "\u{1FA90}", "\u{1FAA8}", "\u{1FAB5}"], activity: ["\u265F\uFE0F", "\u2660\uFE0F", "\u2663\uFE0F", "\u2665\uFE0F", "\u2666\uFE0F", "\u26BD", "\u26BE", "\u26F3", "\u26F8\uFE0F", "\u2728", "\u{1F004}", "\u{1F0CF}", "\u{1F380}", "\u{1F381}", "\u{1F383}", "\u{1F384}", "\u{1F386}", "\u{1F387}", "\u{1F388}", "\u{1F389}", "\u{1F38A}", "\u{1F38B}", "\u{1F38D}", "\u{1F38E}", "\u{1F38F}", "\u{1F390}", "\u{1F391}", "\u{1F396}\uFE0F", "\u{1F397}\uFE0F", "\u{1F39F}\uFE0F", "\u{1F3A3}", "\u{1F3A8}", "\u{1F3AB}", "\u{1F3AD}", "\u{1F3AE}", "\u{1F3AF}", "\u{1F3B0}", "\u{1F3B1}", "\u{1F3B2}", "\u{1F3B3}", "\u{1F3B4}", "\u{1F3BD}", "\u{1F3BE}", "\u{1F3BF}", "\u{1F3C0}", "\u{1F3C5}", "\u{1F3C6}", "\u{1F3C8}", "\u{1F3C9}", "\u{1F3CF}", "\u{1F3D0}", "\u{1F3D1}", "\u{1F3D2}", "\u{1F3D3}", "\u{1F3F8}", "\u{1F52E}", "\u{1F579}\uFE0F", "\u{1F5BC}\uFE0F", "\u{1F6F7}", "\u{1F93F}", "\u{1F945}", "\u{1F947}", "\u{1F948}", "\u{1F949}", "\u{1F94A}", "\u{1F94B}", "\u{1F94C}", "\u{1F94D}", "\u{1F94E}", "\u{1F94F}", "\u{1F9E7}", "\u{1F9E8}", "\u{1F9E9}", "\u{1F9F5}", "\u{1F9F6}", "\u{1F9F8}", "\u{1F9FF}", "\u{1FA80}", "\u{1FA81}", "\u{1FA84}", "\u{1FA85}", "\u{1FA86}", "\u{1FAA1}", "\u{1FAA2}"], object: ["\u2328\uFE0F", "\u260E\uFE0F", "\u2692\uFE0F", "\u2694\uFE0F", "\u2696\uFE0F", "\u2697\uFE0F", "\u2699\uFE0F", "\u26B0\uFE0F", "\u26B1\uFE0F", "\u26CF\uFE0F", "\u26D1\uFE0F", "\u26D3\uFE0F", "\u2702\uFE0F", "\u2709\uFE0F", "\u270F\uFE0F", "\u2712\uFE0F", "\u{1F392}", "\u{1F393}", "\u{1F399}\uFE0F", "\u{1F39A}\uFE0F", "\u{1F39B}\uFE0F", "\u{1F39E}\uFE0F", "\u{1F3A4}", "\u{1F3A5}", "\u{1F3A7}", "\u{1F3A9}", "\u{1F3AC}", "\u{1F3B5}", "\u{1F3B6}", "\u{1F3B7}", "\u{1F3B8}", "\u{1F3B9}", "\u{1F3BA}", "\u{1F3BB}", "\u{1F3BC}", "\u{1F3EE}", "\u{1F3F7}\uFE0F", "\u{1F3F9}", "\u{1F451}", "\u{1F452}", "\u{1F453}", "\u{1F454}", "\u{1F455}", "\u{1F456}", "\u{1F457}", "\u{1F458}", "\u{1F459}", "\u{1F45A}", "\u{1F45B}", "\u{1F45C}", "\u{1F45D}", "\u{1F45E}", "\u{1F45F}", "\u{1F460}", "\u{1F461}", "\u{1F462}", "\u{1F484}", "\u{1F489}", "\u{1F48A}", "\u{1F48D}", "\u{1F48E}", "\u{1F4A1}", "\u{1F4B0}", "\u{1F4B3}", "\u{1F4B4}", "\u{1F4B5}", "\u{1F4B6}", "\u{1F4B7}", "\u{1F4B8}", "\u{1F4B9}", "\u{1F4BB}", "\u{1F4BC}", "\u{1F4BD}", "\u{1F4BE}", "\u{1F4BF}", "\u{1F4C0}", "\u{1F4C1}", "\u{1F4C2}", "\u{1F4C3}", "\u{1F4C4}", "\u{1F4C5}", "\u{1F4C6}", "\u{1F4C7}", "\u{1F4C8}", "\u{1F4C9}", "\u{1F4CA}", "\u{1F4CB}", "\u{1F4CC}", "\u{1F4CD}", "\u{1F4CE}", "\u{1F4CF}", "\u{1F4D0}", "\u{1F4D1}", "\u{1F4D2}", "\u{1F4D3}", "\u{1F4D4}", "\u{1F4D5}", "\u{1F4D6}", "\u{1F4D7}", "\u{1F4D8}", "\u{1F4D9}", "\u{1F4DA}", "\u{1F4DC}", "\u{1F4DD}", "\u{1F4DE}", "\u{1F4DF}", "\u{1F4E0}", "\u{1F4E1}", "\u{1F4E2}", "\u{1F4E3}", "\u{1F4E4}", "\u{1F4E5}", "\u{1F4E6}", "\u{1F4E7}", "\u{1F4E8}", "\u{1F4E9}", "\u{1F4EA}", "\u{1F4EB}", "\u{1F4EC}", "\u{1F4ED}", "\u{1F4EE}", "\u{1F4EF}", "\u{1F4F0}", "\u{1F4F1}", "\u{1F4F2}", "\u{1F4F7}", "\u{1F4F8}", "\u{1F4F9}", "\u{1F4FA}", "\u{1F4FB}", "\u{1F4FC}", "\u{1F4FD}\uFE0F", "\u{1F4FF}", "\u{1F507}", "\u{1F508}", "\u{1F509}", "\u{1F50A}", "\u{1F50B}", "\u{1F50C}", "\u{1F50D}", "\u{1F50E}", "\u{1F50F}", "\u{1F510}", "\u{1F511}", "\u{1F512}", "\u{1F513}", "\u{1F514}", "\u{1F515}", "\u{1F516}", "\u{1F517}", "\u{1F526}", "\u{1F527}", "\u{1F528}", "\u{1F529}", "\u{1F52B}", "\u{1F52C}", "\u{1F52D}", "\u{1F56F}\uFE0F", "\u{1F576}\uFE0F", "\u{1F587}\uFE0F", "\u{1F58A}\uFE0F", "\u{1F58B}\uFE0F", "\u{1F58C}\uFE0F", "\u{1F58D}\uFE0F", "\u{1F5A5}\uFE0F", "\u{1F5A8}\uFE0F", "\u{1F5B1}\uFE0F", "\u{1F5B2}\uFE0F", "\u{1F5C2}\uFE0F", "\u{1F5C3}\uFE0F", "\u{1F5C4}\uFE0F", "\u{1F5D1}\uFE0F", "\u{1F5D2}\uFE0F", "\u{1F5D3}\uFE0F", "\u{1F5DC}\uFE0F", "\u{1F5DD}\uFE0F", "\u{1F5DE}\uFE0F", "\u{1F5E1}\uFE0F", "\u{1F5F3}\uFE0F", "\u{1F5FF}", "\u{1F6AA}", "\u{1F6AC}", "\u{1F6BD}", "\u{1F6BF}", "\u{1F6C1}", "\u{1F6CB}\uFE0F", "\u{1F6CD}\uFE0F", "\u{1F6CF}\uFE0F", "\u{1F6D2}", "\u{1F6D7}", "\u{1F6E0}\uFE0F", "\u{1F6E1}\uFE0F", "\u{1F941}", "\u{1F97B}", "\u{1F97C}", "\u{1F97D}", "\u{1F97E}", "\u{1F97F}", "\u{1F9AF}", "\u{1F9BA}", "\u{1F9E2}", "\u{1F9E3}", "\u{1F9E4}", "\u{1F9E5}", "\u{1F9E6}", "\u{1F9EA}", "\u{1F9EB}", "\u{1F9EC}", "\u{1F9EE}", "\u{1F9EF}", "\u{1F9F0}", "\u{1F9F2}", "\u{1F9F4}", "\u{1F9F7}", "\u{1F9F9}", "\u{1F9FA}", "\u{1F9FB}", "\u{1F9FC}", "\u{1F9FD}", "\u{1F9FE}", "\u{1FA70}", "\u{1FA71}", "\u{1FA72}", "\u{1FA73}", "\u{1FA74}", "\u{1FA78}", "\u{1FA79}", "\u{1FA7A}", "\u{1FA83}", "\u{1FA91}", "\u{1FA92}", "\u{1FA93}", "\u{1FA94}", "\u{1FA95}", "\u{1FA96}", "\u{1FA97}", "\u{1FA98}", "\u{1FA99}", "\u{1FA9A}", "\u{1FA9B}", "\u{1FA9C}", "\u{1FA9D}", "\u{1FA9E}", "\u{1FA9F}", "\u{1FAA0}", "\u{1FAA3}", "\u{1FAA4}", "\u{1FAA5}", "\u{1FAA6}", "\u{1FAA7}"], symbol: ["#\uFE0F\u20E3", "*\uFE0F\u20E3", "0\uFE0F\u20E3", "1\uFE0F\u20E3", "2\uFE0F\u20E3", "3\uFE0F\u20E3", "4\uFE0F\u20E3", "5\uFE0F\u20E3", "6\uFE0F\u20E3", "7\uFE0F\u20E3", "8\uFE0F\u20E3", "9\uFE0F\u20E3", "\xA9\uFE0F", "\xAE\uFE0F", "\u203C\uFE0F", "\u2049\uFE0F", "\u2122\uFE0F", "\u2139\uFE0F", "\u2194\uFE0F", "\u2195\uFE0F", "\u2196\uFE0F", "\u2197\uFE0F", "\u2198\uFE0F", "\u2199\uFE0F", "\u21A9\uFE0F", "\u21AA\uFE0F", "\u23CF\uFE0F", "\u23E9", "\u23EA", "\u23EB", "\u23EC", "\u23ED\uFE0F", "\u23EE\uFE0F", "\u23EF\uFE0F", "\u23F8\uFE0F", "\u23F9\uFE0F", "\u23FA\uFE0F", "\u24C2\uFE0F", "\u25AA\uFE0F", "\u25AB\uFE0F", "\u25B6\uFE0F", "\u25C0\uFE0F", "\u25FB\uFE0F", "\u25FC\uFE0F", "\u25FD", "\u25FE", "\u2611\uFE0F", "\u2622\uFE0F", "\u2623\uFE0F", "\u2626\uFE0F", "\u262A\uFE0F", "\u262E\uFE0F", "\u262F\uFE0F", "\u2638\uFE0F", "\u2640\uFE0F", "\u2642\uFE0F", "\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D", "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653", "\u267B\uFE0F", "\u267E\uFE0F", "\u267F", "\u2695\uFE0F", "\u269B\uFE0F", "\u269C\uFE0F", "\u26A0\uFE0F", "\u26A7\uFE0F", "\u26AA", "\u26AB", "\u26CE", "\u26D4", "\u2705", "\u2714\uFE0F", "\u2716\uFE0F", "\u271D\uFE0F", "\u2721\uFE0F", "\u2733\uFE0F", "\u2734\uFE0F", "\u2747\uFE0F", "\u274C", "\u274E", "\u2753", "\u2754", "\u2755", "\u2757", "\u2795", "\u2796", "\u2797", "\u27A1\uFE0F", "\u27B0", "\u27BF", "\u2934\uFE0F", "\u2935\uFE0F", "\u2B05\uFE0F", "\u2B06\uFE0F", "\u2B07\uFE0F", "\u2B1B", "\u2B1C", "\u2B55", "\u3030\uFE0F", "\u303D\uFE0F", "\u3297\uFE0F", "\u3299\uFE0F", "\u{1F170}\uFE0F", "\u{1F171}\uFE0F", "\u{1F17E}\uFE0F", "\u{1F17F}\uFE0F", "\u{1F18E}", "\u{1F191}", "\u{1F192}", "\u{1F193}", "\u{1F194}", "\u{1F195}", "\u{1F196}", "\u{1F197}", "\u{1F198}", "\u{1F199}", "\u{1F19A}", "\u{1F201}", "\u{1F202}\uFE0F", "\u{1F21A}", "\u{1F22F}", "\u{1F232}", "\u{1F233}", "\u{1F234}", "\u{1F235}", "\u{1F236}", "\u{1F237}\uFE0F", "\u{1F238}", "\u{1F239}", "\u{1F23A}", "\u{1F250}", "\u{1F251}", "\u{1F3A6}", "\u{1F3E7}", "\u{1F4A0}", "\u{1F4B1}", "\u{1F4B2}", "\u{1F4DB}", "\u{1F4F3}", "\u{1F4F4}", "\u{1F4F5}", "\u{1F4F6}", "\u{1F500}", "\u{1F501}", "\u{1F502}", "\u{1F503}", "\u{1F504}", "\u{1F505}", "\u{1F506}", "\u{1F518}", "\u{1F519}", "\u{1F51A}", "\u{1F51B}", "\u{1F51C}", "\u{1F51D}", "\u{1F51E}", "\u{1F51F}", "\u{1F520}", "\u{1F521}", "\u{1F522}", "\u{1F523}", "\u{1F524}", "\u{1F52F}", "\u{1F530}", "\u{1F531}", "\u{1F532}", "\u{1F533}", "\u{1F534}", "\u{1F535}", "\u{1F536}", "\u{1F537}", "\u{1F538}", "\u{1F539}", "\u{1F53A}", "\u{1F53B}", "\u{1F53C}", "\u{1F53D}", "\u{1F549}\uFE0F", "\u{1F54E}", "\u{1F6AB}", "\u{1F6AD}", "\u{1F6AE}", "\u{1F6AF}", "\u{1F6B0}", "\u{1F6B1}", "\u{1F6B3}", "\u{1F6B7}", "\u{1F6B8}", "\u{1F6B9}", "\u{1F6BA}", "\u{1F6BB}", "\u{1F6BC}", "\u{1F6BE}", "\u{1F6C2}", "\u{1F6C3}", "\u{1F6C4}", "\u{1F6C5}", "\u{1F6D0}", "\u{1F7E0}", "\u{1F7E1}", "\u{1F7E2}", "\u{1F7E3}", "\u{1F7E4}", "\u{1F7E5}", "\u{1F7E6}", "\u{1F7E7}", "\u{1F7E8}", "\u{1F7E9}", "\u{1F7EA}", "\u{1F7EB}"], flag: ["\u{1F1E6}\u{1F1E8}", "\u{1F1E6}\u{1F1E9}", "\u{1F1E6}\u{1F1EA}", "\u{1F1E6}\u{1F1EB}", "\u{1F1E6}\u{1F1EC}", "\u{1F1E6}\u{1F1EE}", "\u{1F1E6}\u{1F1F1}", "\u{1F1E6}\u{1F1F2}", "\u{1F1E6}\u{1F1F4}", "\u{1F1E6}\u{1F1F6}", "\u{1F1E6}\u{1F1F7}", "\u{1F1E6}\u{1F1F8}", "\u{1F1E6}\u{1F1F9}", "\u{1F1E6}\u{1F1FA}", "\u{1F1E6}\u{1F1FC}", "\u{1F1E6}\u{1F1FD}", "\u{1F1E6}\u{1F1FF}", "\u{1F1E7}\u{1F1E6}", "\u{1F1E7}\u{1F1E7}", "\u{1F1E7}\u{1F1E9}", "\u{1F1E7}\u{1F1EA}", "\u{1F1E7}\u{1F1EB}", "\u{1F1E7}\u{1F1EC}", "\u{1F1E7}\u{1F1ED}", "\u{1F1E7}\u{1F1EE}", "\u{1F1E7}\u{1F1EF}", "\u{1F1E7}\u{1F1F1}", "\u{1F1E7}\u{1F1F2}", "\u{1F1E7}\u{1F1F3}", "\u{1F1E7}\u{1F1F4}", "\u{1F1E7}\u{1F1F6}", "\u{1F1E7}\u{1F1F7}", "\u{1F1E7}\u{1F1F8}", "\u{1F1E7}\u{1F1F9}", "\u{1F1E7}\u{1F1FB}", "\u{1F1E7}\u{1F1FC}", "\u{1F1E7}\u{1F1FE}", "\u{1F1E7}\u{1F1FF}", "\u{1F1E8}\u{1F1E6}", "\u{1F1E8}\u{1F1E8}", "\u{1F1E8}\u{1F1E9}", "\u{1F1E8}\u{1F1EB}", "\u{1F1E8}\u{1F1EC}", "\u{1F1E8}\u{1F1ED}", "\u{1F1E8}\u{1F1EE}", "\u{1F1E8}\u{1F1F0}", "\u{1F1E8}\u{1F1F1}", "\u{1F1E8}\u{1F1F2}", "\u{1F1E8}\u{1F1F3}", "\u{1F1E8}\u{1F1F4}", "\u{1F1E8}\u{1F1F5}", "\u{1F1E8}\u{1F1F7}", "\u{1F1E8}\u{1F1FA}", "\u{1F1E8}\u{1F1FB}", "\u{1F1E8}\u{1F1FC}", "\u{1F1E8}\u{1F1FD}", "\u{1F1E8}\u{1F1FE}", "\u{1F1E8}\u{1F1FF}", "\u{1F1E9}\u{1F1EA}", "\u{1F1E9}\u{1F1EC}", "\u{1F1E9}\u{1F1EF}", "\u{1F1E9}\u{1F1F0}", "\u{1F1E9}\u{1F1F2}", "\u{1F1E9}\u{1F1F4}", "\u{1F1E9}\u{1F1FF}", "\u{1F1EA}\u{1F1E6}", "\u{1F1EA}\u{1F1E8}", "\u{1F1EA}\u{1F1EA}", "\u{1F1EA}\u{1F1EC}", "\u{1F1EA}\u{1F1ED}", "\u{1F1EA}\u{1F1F7}", "\u{1F1EA}\u{1F1F8}", "\u{1F1EA}\u{1F1F9}", "\u{1F1EA}\u{1F1FA}", "\u{1F1EB}\u{1F1EE}", "\u{1F1EB}\u{1F1EF}", "\u{1F1EB}\u{1F1F0}", "\u{1F1EB}\u{1F1F2}", "\u{1F1EB}\u{1F1F4}", "\u{1F1EB}\u{1F1F7}", "\u{1F1EC}\u{1F1E6}", "\u{1F1EC}\u{1F1E7}", "\u{1F1EC}\u{1F1E9}", "\u{1F1EC}\u{1F1EA}", "\u{1F1EC}\u{1F1EB}", "\u{1F1EC}\u{1F1EC}", "\u{1F1EC}\u{1F1ED}", "\u{1F1EC}\u{1F1EE}", "\u{1F1EC}\u{1F1F1}", "\u{1F1EC}\u{1F1F2}", "\u{1F1EC}\u{1F1F3}", "\u{1F1EC}\u{1F1F5}", "\u{1F1EC}\u{1F1F6}", "\u{1F1EC}\u{1F1F7}", "\u{1F1EC}\u{1F1F8}", "\u{1F1EC}\u{1F1F9}", "\u{1F1EC}\u{1F1FA}", "\u{1F1EC}\u{1F1FC}", "\u{1F1EC}\u{1F1FE}", "\u{1F1ED}\u{1F1F0}", "\u{1F1ED}\u{1F1F2}", "\u{1F1ED}\u{1F1F3}", "\u{1F1ED}\u{1F1F7}", "\u{1F1ED}\u{1F1F9}", "\u{1F1ED}\u{1F1FA}", "\u{1F1EE}\u{1F1E8}", "\u{1F1EE}\u{1F1E9}", "\u{1F1EE}\u{1F1EA}", "\u{1F1EE}\u{1F1F1}", "\u{1F1EE}\u{1F1F2}", "\u{1F1EE}\u{1F1F3}", "\u{1F1EE}\u{1F1F4}", "\u{1F1EE}\u{1F1F6}", "\u{1F1EE}\u{1F1F7}", "\u{1F1EE}\u{1F1F8}", "\u{1F1EE}\u{1F1F9}", "\u{1F1EF}\u{1F1EA}", "\u{1F1EF}\u{1F1F2}", "\u{1F1EF}\u{1F1F4}", "\u{1F1EF}\u{1F1F5}", "\u{1F1F0}\u{1F1EA}", "\u{1F1F0}\u{1F1EC}", "\u{1F1F0}\u{1F1ED}", "\u{1F1F0}\u{1F1EE}", "\u{1F1F0}\u{1F1F2}", "\u{1F1F0}\u{1F1F3}", "\u{1F1F0}\u{1F1F5}", "\u{1F1F0}\u{1F1F7}", "\u{1F1F0}\u{1F1FC}", "\u{1F1F0}\u{1F1FE}", "\u{1F1F0}\u{1F1FF}", "\u{1F1F1}\u{1F1E6}", "\u{1F1F1}\u{1F1E7}", "\u{1F1F1}\u{1F1E8}", "\u{1F1F1}\u{1F1EE}", "\u{1F1F1}\u{1F1F0}", "\u{1F1F1}\u{1F1F7}", "\u{1F1F1}\u{1F1F8}", "\u{1F1F1}\u{1F1F9}", "\u{1F1F1}\u{1F1FA}", "\u{1F1F1}\u{1F1FB}", "\u{1F1F1}\u{1F1FE}", "\u{1F1F2}\u{1F1E6}", "\u{1F1F2}\u{1F1E8}", "\u{1F1F2}\u{1F1E9}", "\u{1F1F2}\u{1F1EA}", "\u{1F1F2}\u{1F1EB}", "\u{1F1F2}\u{1F1EC}", "\u{1F1F2}\u{1F1ED}", "\u{1F1F2}\u{1F1F0}", "\u{1F1F2}\u{1F1F1}", "\u{1F1F2}\u{1F1F2}", "\u{1F1F2}\u{1F1F3}", "\u{1F1F2}\u{1F1F4}", "\u{1F1F2}\u{1F1F5}", "\u{1F1F2}\u{1F1F6}", "\u{1F1F2}\u{1F1F7}", "\u{1F1F2}\u{1F1F8}", "\u{1F1F2}\u{1F1F9}", "\u{1F1F2}\u{1F1FA}", "\u{1F1F2}\u{1F1FB}", "\u{1F1F2}\u{1F1FC}", "\u{1F1F2}\u{1F1FD}", "\u{1F1F2}\u{1F1FE}", "\u{1F1F2}\u{1F1FF}", "\u{1F1F3}\u{1F1E6}", "\u{1F1F3}\u{1F1E8}", "\u{1F1F3}\u{1F1EA}", "\u{1F1F3}\u{1F1EB}", "\u{1F1F3}\u{1F1EC}", "\u{1F1F3}\u{1F1EE}", "\u{1F1F3}\u{1F1F1}", "\u{1F1F3}\u{1F1F4}", "\u{1F1F3}\u{1F1F5}", "\u{1F1F3}\u{1F1F7}", "\u{1F1F3}\u{1F1FA}", "\u{1F1F3}\u{1F1FF}", "\u{1F1F4}\u{1F1F2}", "\u{1F1F5}\u{1F1E6}", "\u{1F1F5}\u{1F1EA}", "\u{1F1F5}\u{1F1EB}", "\u{1F1F5}\u{1F1EC}", "\u{1F1F5}\u{1F1ED}", "\u{1F1F5}\u{1F1F0}", "\u{1F1F5}\u{1F1F1}", "\u{1F1F5}\u{1F1F2}", "\u{1F1F5}\u{1F1F3}", "\u{1F1F5}\u{1F1F7}", "\u{1F1F5}\u{1F1F8}", "\u{1F1F5}\u{1F1F9}", "\u{1F1F5}\u{1F1FC}", "\u{1F1F5}\u{1F1FE}", "\u{1F1F6}\u{1F1E6}", "\u{1F1F7}\u{1F1EA}", "\u{1F1F7}\u{1F1F4}", "\u{1F1F7}\u{1F1F8}", "\u{1F1F7}\u{1F1FA}", "\u{1F1F7}\u{1F1FC}", "\u{1F1F8}\u{1F1E6}", "\u{1F1F8}\u{1F1E7}", "\u{1F1F8}\u{1F1E8}", "\u{1F1F8}\u{1F1E9}", "\u{1F1F8}\u{1F1EA}", "\u{1F1F8}\u{1F1EC}", "\u{1F1F8}\u{1F1ED}", "\u{1F1F8}\u{1F1EE}", "\u{1F1F8}\u{1F1EF}", "\u{1F1F8}\u{1F1F0}", "\u{1F1F8}\u{1F1F1}", "\u{1F1F8}\u{1F1F2}", "\u{1F1F8}\u{1F1F3}", "\u{1F1F8}\u{1F1F4}", "\u{1F1F8}\u{1F1F7}", "\u{1F1F8}\u{1F1F8}", "\u{1F1F8}\u{1F1F9}", "\u{1F1F8}\u{1F1FB}", "\u{1F1F8}\u{1F1FD}", "\u{1F1F8}\u{1F1FE}", "\u{1F1F8}\u{1F1FF}", "\u{1F1F9}\u{1F1E6}", "\u{1F1F9}\u{1F1E8}", "\u{1F1F9}\u{1F1E9}", "\u{1F1F9}\u{1F1EB}", "\u{1F1F9}\u{1F1EC}", "\u{1F1F9}\u{1F1ED}", "\u{1F1F9}\u{1F1EF}", "\u{1F1F9}\u{1F1F0}", "\u{1F1F9}\u{1F1F1}", "\u{1F1F9}\u{1F1F2}", "\u{1F1F9}\u{1F1F3}", "\u{1F1F9}\u{1F1F4}", "\u{1F1F9}\u{1F1F7}", "\u{1F1F9}\u{1F1F9}", "\u{1F1F9}\u{1F1FB}", "\u{1F1F9}\u{1F1FC}", "\u{1F1F9}\u{1F1FF}", "\u{1F1FA}\u{1F1E6}", "\u{1F1FA}\u{1F1EC}", "\u{1F1FA}\u{1F1F2}", "\u{1F1FA}\u{1F1F3}", "\u{1F1FA}\u{1F1F8}", "\u{1F1FA}\u{1F1FE}", "\u{1F1FA}\u{1F1FF}", "\u{1F1FB}\u{1F1E6}", "\u{1F1FB}\u{1F1E8}", "\u{1F1FB}\u{1F1EA}", "\u{1F1FB}\u{1F1EC}", "\u{1F1FB}\u{1F1EE}", "\u{1F1FB}\u{1F1F3}", "\u{1F1FB}\u{1F1FA}", "\u{1F1FC}\u{1F1EB}", "\u{1F1FC}\u{1F1F8}", "\u{1F1FD}\u{1F1F0}", "\u{1F1FE}\u{1F1EA}", "\u{1F1FE}\u{1F1F9}", "\u{1F1FF}\u{1F1E6}", "\u{1F1FF}\u{1F1F2}", "\u{1F1FF}\u{1F1FC}", "\u{1F38C}", "\u{1F3C1}", "\u{1F3F3}\uFE0F", "\u{1F3F3}\uFE0F\u200D\u26A7\uFE0F", "\u{1F3F3}\uFE0F\u200D\u{1F308}", "\u{1F3F4}", "\u{1F3F4}\u200D\u2620\uFE0F", "\u{1F6A9}"] };
var cr2 = { informational: [100, 101, 102, 103], success: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226], redirection: [300, 301, 302, 303, 304, 305, 306, 307, 308], clientError: [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451], serverError: [500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511] };
var lr2 = ["ES256", "ES384", "ES512", "HS256", "HS384", "HS512", "PS256", "PS384", "PS512", "RS256", "RS384", "RS512", "none"];
var mr2 = ["FakerBot/{{system.semver}}", "Googlebot/2.1 (+http://www.google.com/bot.html)", 'Mozilla/5.0 (Linux; Android {{number.int({"min":5,"max":13})}}; {{helpers.arrayElement(["SM-G998U","SM-G998B","SM-G998N","SM-G998P","SM-T800"])}}) AppleWebKit/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}} (KHTML, like Gecko) Chrome/{{number.int({"min":55,"max":131})}}.{{system.semver}} Mobile Safari/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}}', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:{{number.int({"min":75, "max":133})}}.0) Gecko/20100101 Firefox/{{number.int({"min":75, "max":133})}}.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}}.{{number.int({"min":0,"max":99})}} (KHTML, like Gecko) Version/16.1 Safari/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}}.{{number.int({"min":0,"max":99})}}', 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_15_7) AppleWebKit/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}}.{{number.int({"min":0,"max":99})}} (KHTML, like Gecko) Chrome/{{number.int({"min":55,"max":131})}}.{{system.semver}} Safari/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}}.{{number.int({"min":0,"max":99})}}', 'Mozilla/5.0 (Windows NT {{helpers.arrayElement(["5.1","5.2","6.0","6.1","6.2","6.3","10.0"])}}; Win64; x64) AppleWebKit/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}} (KHTML, like Gecko) Chrome/{{number.int({"min":55,"max":131})}}.{{system.semver}} Safari/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}} Edg/{{number.int({"min":110,"max":131})}}.{{system.semver}}', 'Mozilla/5.0 (X11; Linux x86_64; rv:{{number.int({"min":75,"max":133})}}.0) Gecko/20100101 Firefox/{{number.int({"min":75,"max":133})}}.0', 'Mozilla/5.0 (compatible; MSIE {{number.int({"min":6,"max":10})}}.0; Windows NT {{helpers.arrayElement(["5.1","5.2","6.0","6.1","6.2","6.3","10.0"])}}; Trident/{{number.int({"min":4,"max":7})}}.0)', 'Mozilla/5.0 (iPhone; CPU iPhone OS {{number.int({"min":10,"max":18})}}_{{number.int({"min":0,"max":4})}} like Mac OS X) AppleWebKit/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}}.{{number.int({"min":0,"max":99})}} (KHTML, like Gecko) Version/{{number.int({"min":10,"max":18})}}_{{number.int({"min":0,"max":4})}} Mobile/15E148 Safari/{{number.int({"min":536,"max":605})}}.{{number.int({"min":0,"max":99})}}'];
var tt = { emoji: sr2, http_status_code: cr2, jwt_algorithm: lr2, user_agent_pattern: mr2 };
var ur2 = tt;
var pr2 = [{ alpha2: "AD", alpha3: "AND", numeric: "020" }, { alpha2: "AE", alpha3: "ARE", numeric: "784" }, { alpha2: "AF", alpha3: "AFG", numeric: "004" }, { alpha2: "AG", alpha3: "ATG", numeric: "028" }, { alpha2: "AI", alpha3: "AIA", numeric: "660" }, { alpha2: "AL", alpha3: "ALB", numeric: "008" }, { alpha2: "AM", alpha3: "ARM", numeric: "051" }, { alpha2: "AO", alpha3: "AGO", numeric: "024" }, { alpha2: "AQ", alpha3: "ATA", numeric: "010" }, { alpha2: "AR", alpha3: "ARG", numeric: "032" }, { alpha2: "AS", alpha3: "ASM", numeric: "016" }, { alpha2: "AT", alpha3: "AUT", numeric: "040" }, { alpha2: "AU", alpha3: "AUS", numeric: "036" }, { alpha2: "AW", alpha3: "ABW", numeric: "533" }, { alpha2: "AX", alpha3: "ALA", numeric: "248" }, { alpha2: "AZ", alpha3: "AZE", numeric: "031" }, { alpha2: "BA", alpha3: "BIH", numeric: "070" }, { alpha2: "BB", alpha3: "BRB", numeric: "052" }, { alpha2: "BD", alpha3: "BGD", numeric: "050" }, { alpha2: "BE", alpha3: "BEL", numeric: "056" }, { alpha2: "BF", alpha3: "BFA", numeric: "854" }, { alpha2: "BG", alpha3: "BGR", numeric: "100" }, { alpha2: "BH", alpha3: "BHR", numeric: "048" }, { alpha2: "BI", alpha3: "BDI", numeric: "108" }, { alpha2: "BJ", alpha3: "BEN", numeric: "204" }, { alpha2: "BL", alpha3: "BLM", numeric: "652" }, { alpha2: "BM", alpha3: "BMU", numeric: "060" }, { alpha2: "BN", alpha3: "BRN", numeric: "096" }, { alpha2: "BO", alpha3: "BOL", numeric: "068" }, { alpha2: "BQ", alpha3: "BES", numeric: "535" }, { alpha2: "BR", alpha3: "BRA", numeric: "076" }, { alpha2: "BS", alpha3: "BHS", numeric: "044" }, { alpha2: "BT", alpha3: "BTN", numeric: "064" }, { alpha2: "BV", alpha3: "BVT", numeric: "074" }, { alpha2: "BW", alpha3: "BWA", numeric: "072" }, { alpha2: "BY", alpha3: "BLR", numeric: "112" }, { alpha2: "BZ", alpha3: "BLZ", numeric: "084" }, { alpha2: "CA", alpha3: "CAN", numeric: "124" }, { alpha2: "CC", alpha3: "CCK", numeric: "166" }, { alpha2: "CD", alpha3: "COD", numeric: "180" }, { alpha2: "CF", alpha3: "CAF", numeric: "140" }, { alpha2: "CG", alpha3: "COG", numeric: "178" }, { alpha2: "CH", alpha3: "CHE", numeric: "756" }, { alpha2: "CI", alpha3: "CIV", numeric: "384" }, { alpha2: "CK", alpha3: "COK", numeric: "184" }, { alpha2: "CL", alpha3: "CHL", numeric: "152" }, { alpha2: "CM", alpha3: "CMR", numeric: "120" }, { alpha2: "CN", alpha3: "CHN", numeric: "156" }, { alpha2: "CO", alpha3: "COL", numeric: "170" }, { alpha2: "CR", alpha3: "CRI", numeric: "188" }, { alpha2: "CU", alpha3: "CUB", numeric: "192" }, { alpha2: "CV", alpha3: "CPV", numeric: "132" }, { alpha2: "CW", alpha3: "CUW", numeric: "531" }, { alpha2: "CX", alpha3: "CXR", numeric: "162" }, { alpha2: "CY", alpha3: "CYP", numeric: "196" }, { alpha2: "CZ", alpha3: "CZE", numeric: "203" }, { alpha2: "DE", alpha3: "DEU", numeric: "276" }, { alpha2: "DJ", alpha3: "DJI", numeric: "262" }, { alpha2: "DK", alpha3: "DNK", numeric: "208" }, { alpha2: "DM", alpha3: "DMA", numeric: "212" }, { alpha2: "DO", alpha3: "DOM", numeric: "214" }, { alpha2: "DZ", alpha3: "DZA", numeric: "012" }, { alpha2: "EC", alpha3: "ECU", numeric: "218" }, { alpha2: "EE", alpha3: "EST", numeric: "233" }, { alpha2: "EG", alpha3: "EGY", numeric: "818" }, { alpha2: "EH", alpha3: "ESH", numeric: "732" }, { alpha2: "ER", alpha3: "ERI", numeric: "232" }, { alpha2: "ES", alpha3: "ESP", numeric: "724" }, { alpha2: "ET", alpha3: "ETH", numeric: "231" }, { alpha2: "FI", alpha3: "FIN", numeric: "246" }, { alpha2: "FJ", alpha3: "FJI", numeric: "242" }, { alpha2: "FK", alpha3: "FLK", numeric: "238" }, { alpha2: "FM", alpha3: "FSM", numeric: "583" }, { alpha2: "FO", alpha3: "FRO", numeric: "234" }, { alpha2: "FR", alpha3: "FRA", numeric: "250" }, { alpha2: "GA", alpha3: "GAB", numeric: "266" }, { alpha2: "GB", alpha3: "GBR", numeric: "826" }, { alpha2: "GD", alpha3: "GRD", numeric: "308" }, { alpha2: "GE", alpha3: "GEO", numeric: "268" }, { alpha2: "GF", alpha3: "GUF", numeric: "254" }, { alpha2: "GG", alpha3: "GGY", numeric: "831" }, { alpha2: "GH", alpha3: "GHA", numeric: "288" }, { alpha2: "GI", alpha3: "GIB", numeric: "292" }, { alpha2: "GL", alpha3: "GRL", numeric: "304" }, { alpha2: "GM", alpha3: "GMB", numeric: "270" }, { alpha2: "GN", alpha3: "GIN", numeric: "324" }, { alpha2: "GP", alpha3: "GLP", numeric: "312" }, { alpha2: "GQ", alpha3: "GNQ", numeric: "226" }, { alpha2: "GR", alpha3: "GRC", numeric: "300" }, { alpha2: "GS", alpha3: "SGS", numeric: "239" }, { alpha2: "GT", alpha3: "GTM", numeric: "320" }, { alpha2: "GU", alpha3: "GUM", numeric: "316" }, { alpha2: "GW", alpha3: "GNB", numeric: "624" }, { alpha2: "GY", alpha3: "GUY", numeric: "328" }, { alpha2: "HK", alpha3: "HKG", numeric: "344" }, { alpha2: "HM", alpha3: "HMD", numeric: "334" }, { alpha2: "HN", alpha3: "HND", numeric: "340" }, { alpha2: "HR", alpha3: "HRV", numeric: "191" }, { alpha2: "HT", alpha3: "HTI", numeric: "332" }, { alpha2: "HU", alpha3: "HUN", numeric: "348" }, { alpha2: "ID", alpha3: "IDN", numeric: "360" }, { alpha2: "IE", alpha3: "IRL", numeric: "372" }, { alpha2: "IL", alpha3: "ISR", numeric: "376" }, { alpha2: "IM", alpha3: "IMN", numeric: "833" }, { alpha2: "IN", alpha3: "IND", numeric: "356" }, { alpha2: "IO", alpha3: "IOT", numeric: "086" }, { alpha2: "IQ", alpha3: "IRQ", numeric: "368" }, { alpha2: "IR", alpha3: "IRN", numeric: "364" }, { alpha2: "IS", alpha3: "ISL", numeric: "352" }, { alpha2: "IT", alpha3: "ITA", numeric: "380" }, { alpha2: "JE", alpha3: "JEY", numeric: "832" }, { alpha2: "JM", alpha3: "JAM", numeric: "388" }, { alpha2: "JO", alpha3: "JOR", numeric: "400" }, { alpha2: "JP", alpha3: "JPN", numeric: "392" }, { alpha2: "KE", alpha3: "KEN", numeric: "404" }, { alpha2: "KG", alpha3: "KGZ", numeric: "417" }, { alpha2: "KH", alpha3: "KHM", numeric: "116" }, { alpha2: "KI", alpha3: "KIR", numeric: "296" }, { alpha2: "KM", alpha3: "COM", numeric: "174" }, { alpha2: "KN", alpha3: "KNA", numeric: "659" }, { alpha2: "KP", alpha3: "PRK", numeric: "408" }, { alpha2: "KR", alpha3: "KOR", numeric: "410" }, { alpha2: "KW", alpha3: "KWT", numeric: "414" }, { alpha2: "KY", alpha3: "CYM", numeric: "136" }, { alpha2: "KZ", alpha3: "KAZ", numeric: "398" }, { alpha2: "LA", alpha3: "LAO", numeric: "418" }, { alpha2: "LB", alpha3: "LBN", numeric: "422" }, { alpha2: "LC", alpha3: "LCA", numeric: "662" }, { alpha2: "LI", alpha3: "LIE", numeric: "438" }, { alpha2: "LK", alpha3: "LKA", numeric: "144" }, { alpha2: "LR", alpha3: "LBR", numeric: "430" }, { alpha2: "LS", alpha3: "LSO", numeric: "426" }, { alpha2: "LT", alpha3: "LTU", numeric: "440" }, { alpha2: "LU", alpha3: "LUX", numeric: "442" }, { alpha2: "LV", alpha3: "LVA", numeric: "428" }, { alpha2: "LY", alpha3: "LBY", numeric: "434" }, { alpha2: "MA", alpha3: "MAR", numeric: "504" }, { alpha2: "MC", alpha3: "MCO", numeric: "492" }, { alpha2: "MD", alpha3: "MDA", numeric: "498" }, { alpha2: "ME", alpha3: "MNE", numeric: "499" }, { alpha2: "MF", alpha3: "MAF", numeric: "663" }, { alpha2: "MG", alpha3: "MDG", numeric: "450" }, { alpha2: "MH", alpha3: "MHL", numeric: "584" }, { alpha2: "MK", alpha3: "MKD", numeric: "807" }, { alpha2: "ML", alpha3: "MLI", numeric: "466" }, { alpha2: "MM", alpha3: "MMR", numeric: "104" }, { alpha2: "MN", alpha3: "MNG", numeric: "496" }, { alpha2: "MO", alpha3: "MAC", numeric: "446" }, { alpha2: "MP", alpha3: "MNP", numeric: "580" }, { alpha2: "MQ", alpha3: "MTQ", numeric: "474" }, { alpha2: "MR", alpha3: "MRT", numeric: "478" }, { alpha2: "MS", alpha3: "MSR", numeric: "500" }, { alpha2: "MT", alpha3: "MLT", numeric: "470" }, { alpha2: "MU", alpha3: "MUS", numeric: "480" }, { alpha2: "MV", alpha3: "MDV", numeric: "462" }, { alpha2: "MW", alpha3: "MWI", numeric: "454" }, { alpha2: "MX", alpha3: "MEX", numeric: "484" }, { alpha2: "MY", alpha3: "MYS", numeric: "458" }, { alpha2: "MZ", alpha3: "MOZ", numeric: "508" }, { alpha2: "NA", alpha3: "NAM", numeric: "516" }, { alpha2: "NC", alpha3: "NCL", numeric: "540" }, { alpha2: "NE", alpha3: "NER", numeric: "562" }, { alpha2: "NF", alpha3: "NFK", numeric: "574" }, { alpha2: "NG", alpha3: "NGA", numeric: "566" }, { alpha2: "NI", alpha3: "NIC", numeric: "558" }, { alpha2: "NL", alpha3: "NLD", numeric: "528" }, { alpha2: "NO", alpha3: "NOR", numeric: "578" }, { alpha2: "NP", alpha3: "NPL", numeric: "524" }, { alpha2: "NR", alpha3: "NRU", numeric: "520" }, { alpha2: "NU", alpha3: "NIU", numeric: "570" }, { alpha2: "NZ", alpha3: "NZL", numeric: "554" }, { alpha2: "OM", alpha3: "OMN", numeric: "512" }, { alpha2: "PA", alpha3: "PAN", numeric: "591" }, { alpha2: "PE", alpha3: "PER", numeric: "604" }, { alpha2: "PF", alpha3: "PYF", numeric: "258" }, { alpha2: "PG", alpha3: "PNG", numeric: "598" }, { alpha2: "PH", alpha3: "PHL", numeric: "608" }, { alpha2: "PK", alpha3: "PAK", numeric: "586" }, { alpha2: "PL", alpha3: "POL", numeric: "616" }, { alpha2: "PM", alpha3: "SPM", numeric: "666" }, { alpha2: "PN", alpha3: "PCN", numeric: "612" }, { alpha2: "PR", alpha3: "PRI", numeric: "630" }, { alpha2: "PS", alpha3: "PSE", numeric: "275" }, { alpha2: "PT", alpha3: "PRT", numeric: "620" }, { alpha2: "PW", alpha3: "PLW", numeric: "585" }, { alpha2: "PY", alpha3: "PRY", numeric: "600" }, { alpha2: "QA", alpha3: "QAT", numeric: "634" }, { alpha2: "RE", alpha3: "REU", numeric: "638" }, { alpha2: "RO", alpha3: "ROU", numeric: "642" }, { alpha2: "RS", alpha3: "SRB", numeric: "688" }, { alpha2: "RU", alpha3: "RUS", numeric: "643" }, { alpha2: "RW", alpha3: "RWA", numeric: "646" }, { alpha2: "SA", alpha3: "SAU", numeric: "682" }, { alpha2: "SB", alpha3: "SLB", numeric: "090" }, { alpha2: "SC", alpha3: "SYC", numeric: "690" }, { alpha2: "SD", alpha3: "SDN", numeric: "729" }, { alpha2: "SE", alpha3: "SWE", numeric: "752" }, { alpha2: "SG", alpha3: "SGP", numeric: "702" }, { alpha2: "SH", alpha3: "SHN", numeric: "654" }, { alpha2: "SI", alpha3: "SVN", numeric: "705" }, { alpha2: "SJ", alpha3: "SJM", numeric: "744" }, { alpha2: "SK", alpha3: "SVK", numeric: "703" }, { alpha2: "SL", alpha3: "SLE", numeric: "694" }, { alpha2: "SM", alpha3: "SMR", numeric: "674" }, { alpha2: "SN", alpha3: "SEN", numeric: "686" }, { alpha2: "SO", alpha3: "SOM", numeric: "706" }, { alpha2: "SR", alpha3: "SUR", numeric: "740" }, { alpha2: "SS", alpha3: "SSD", numeric: "728" }, { alpha2: "ST", alpha3: "STP", numeric: "678" }, { alpha2: "SV", alpha3: "SLV", numeric: "222" }, { alpha2: "SX", alpha3: "SXM", numeric: "534" }, { alpha2: "SY", alpha3: "SYR", numeric: "760" }, { alpha2: "SZ", alpha3: "SWZ", numeric: "748" }, { alpha2: "TC", alpha3: "TCA", numeric: "796" }, { alpha2: "TD", alpha3: "TCD", numeric: "148" }, { alpha2: "TF", alpha3: "ATF", numeric: "260" }, { alpha2: "TG", alpha3: "TGO", numeric: "768" }, { alpha2: "TH", alpha3: "THA", numeric: "764" }, { alpha2: "TJ", alpha3: "TJK", numeric: "762" }, { alpha2: "TK", alpha3: "TKL", numeric: "772" }, { alpha2: "TL", alpha3: "TLS", numeric: "626" }, { alpha2: "TM", alpha3: "TKM", numeric: "795" }, { alpha2: "TN", alpha3: "TUN", numeric: "788" }, { alpha2: "TO", alpha3: "TON", numeric: "776" }, { alpha2: "TR", alpha3: "TUR", numeric: "792" }, { alpha2: "TT", alpha3: "TTO", numeric: "780" }, { alpha2: "TV", alpha3: "TUV", numeric: "798" }, { alpha2: "TW", alpha3: "TWN", numeric: "158" }, { alpha2: "TZ", alpha3: "TZA", numeric: "834" }, { alpha2: "UA", alpha3: "UKR", numeric: "804" }, { alpha2: "UG", alpha3: "UGA", numeric: "800" }, { alpha2: "UM", alpha3: "UMI", numeric: "581" }, { alpha2: "US", alpha3: "USA", numeric: "840" }, { alpha2: "UY", alpha3: "URY", numeric: "858" }, { alpha2: "UZ", alpha3: "UZB", numeric: "860" }, { alpha2: "VA", alpha3: "VAT", numeric: "336" }, { alpha2: "VC", alpha3: "VCT", numeric: "670" }, { alpha2: "VE", alpha3: "VEN", numeric: "862" }, { alpha2: "VG", alpha3: "VGB", numeric: "092" }, { alpha2: "VI", alpha3: "VIR", numeric: "850" }, { alpha2: "VN", alpha3: "VNM", numeric: "704" }, { alpha2: "VU", alpha3: "VUT", numeric: "548" }, { alpha2: "WF", alpha3: "WLF", numeric: "876" }, { alpha2: "WS", alpha3: "WSM", numeric: "882" }, { alpha2: "YE", alpha3: "YEM", numeric: "887" }, { alpha2: "YT", alpha3: "MYT", numeric: "175" }, { alpha2: "ZA", alpha3: "ZAF", numeric: "710" }, { alpha2: "ZM", alpha3: "ZMB", numeric: "894" }, { alpha2: "ZW", alpha3: "ZWE", numeric: "716" }];
var at = { country_code: pr2, time_zone: _2 };
var hr2 = at;
var nt = { title: "Base", code: "base" };
var fr2 = nt;
var br2 = ["/Applications", "/bin", "/boot", "/boot/defaults", "/dev", "/etc", "/etc/defaults", "/etc/mail", "/etc/namedb", "/etc/periodic", "/etc/ppp", "/home", "/home/user", "/home/user/dir", "/lib", "/Library", "/lost+found", "/media", "/mnt", "/net", "/Network", "/opt", "/opt/bin", "/opt/include", "/opt/lib", "/opt/sbin", "/opt/share", "/private", "/private/tmp", "/private/var", "/proc", "/rescue", "/root", "/sbin", "/selinux", "/srv", "/sys", "/System", "/tmp", "/Users", "/usr", "/usr/X11R6", "/usr/bin", "/usr/include", "/usr/lib", "/usr/libdata", "/usr/libexec", "/usr/local/bin", "/usr/local/src", "/usr/obj", "/usr/ports", "/usr/sbin", "/usr/share", "/usr/src", "/var", "/var/log", "/var/mail", "/var/spool", "/var/tmp", "/var/yp"];
var dr2 = { "application/epub+zip": { extensions: ["epub"] }, "application/gzip": { extensions: ["gz"] }, "application/java-archive": { extensions: ["jar", "war", "ear"] }, "application/json": { extensions: ["json", "map"] }, "application/ld+json": { extensions: ["jsonld"] }, "application/msword": { extensions: ["doc", "dot"] }, "application/octet-stream": { extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"] }, "application/ogg": { extensions: ["ogx"] }, "application/pdf": { extensions: ["pdf"] }, "application/rtf": { extensions: ["rtf"] }, "application/vnd.amazon.ebook": { extensions: ["azw"] }, "application/vnd.apple.installer+xml": { extensions: ["mpkg"] }, "application/vnd.mozilla.xul+xml": { extensions: ["xul"] }, "application/vnd.ms-excel": { extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"] }, "application/vnd.ms-fontobject": { extensions: ["eot"] }, "application/vnd.ms-powerpoint": { extensions: ["ppt", "pps", "pot"] }, "application/vnd.oasis.opendocument.presentation": { extensions: ["odp"] }, "application/vnd.oasis.opendocument.spreadsheet": { extensions: ["ods"] }, "application/vnd.oasis.opendocument.text": { extensions: ["odt"] }, "application/vnd.openxmlformats-officedocument.presentationml.presentation": { extensions: ["pptx"] }, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { extensions: ["xlsx"] }, "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { extensions: ["docx"] }, "application/vnd.rar": { extensions: ["rar"] }, "application/vnd.visio": { extensions: ["vsd", "vst", "vss", "vsw"] }, "application/x-7z-compressed": { extensions: ["7z"] }, "application/x-abiword": { extensions: ["abw"] }, "application/x-bzip": { extensions: ["bz"] }, "application/x-bzip2": { extensions: ["bz2", "boz"] }, "application/x-csh": { extensions: ["csh"] }, "application/x-freearc": { extensions: ["arc"] }, "application/x-httpd-php": { extensions: ["php"] }, "application/x-sh": { extensions: ["sh"] }, "application/x-tar": { extensions: ["tar"] }, "application/xhtml+xml": { extensions: ["xhtml", "xht"] }, "application/xml": { extensions: ["xml", "xsl", "xsd", "rng"] }, "application/zip": { extensions: ["zip"] }, "audio/3gpp": { extensions: ["3gpp"] }, "audio/3gpp2": { extensions: ["3g2"] }, "audio/aac": { extensions: ["aac"] }, "audio/midi": { extensions: ["mid", "midi", "kar", "rmi"] }, "audio/mpeg": { extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"] }, "audio/ogg": { extensions: ["oga", "ogg", "spx", "opus"] }, "audio/opus": { extensions: ["opus"] }, "audio/wav": { extensions: ["wav"] }, "audio/webm": { extensions: ["weba"] }, "font/otf": { extensions: ["otf"] }, "font/ttf": { extensions: ["ttf"] }, "font/woff": { extensions: ["woff"] }, "font/woff2": { extensions: ["woff2"] }, "image/avif": { extensions: ["avif"] }, "image/bmp": { extensions: ["bmp"] }, "image/gif": { extensions: ["gif"] }, "image/jpeg": { extensions: ["jpeg", "jpg", "jpe"] }, "image/png": { extensions: ["png"] }, "image/svg+xml": { extensions: ["svg", "svgz"] }, "image/tiff": { extensions: ["tif", "tiff"] }, "image/vnd.microsoft.icon": { extensions: ["ico"] }, "image/webp": { extensions: ["webp"] }, "text/calendar": { extensions: ["ics", "ifb"] }, "text/css": { extensions: ["css"] }, "text/csv": { extensions: ["csv"] }, "text/html": { extensions: ["html", "htm", "shtml"] }, "text/javascript": { extensions: ["js", "mjs"] }, "text/plain": { extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"] }, "video/3gpp": { extensions: ["3gp", "3gpp"] }, "video/3gpp2": { extensions: ["3g2"] }, "video/mp2t": { extensions: ["ts"] }, "video/mp4": { extensions: ["mp4", "mp4v", "mpg4"] }, "video/mpeg": { extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"] }, "video/ogg": { extensions: ["ogv"] }, "video/webm": { extensions: ["webm"] }, "video/x-msvideo": { extensions: ["avi"] } };
var it = { directory_path: br2, mime_type: dr2 };
var gr2 = it;
var ot = { color: qe2, database: ar2, date: nr2, hacker: or2, internet: ur2, location: hr2, metadata: fr2, system: gr2 };
var _i = ot;

// ../../node_modules/@faker-js/faker/dist/chunk-3WUZ46N3.js
var f2 = new Xe2({ locale: [ys, _i] });

// ../../node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// src/client.ts
var client_exports = {};
__export(client_exports, {
  prisma: () => prisma
});
var import_client = __toESM(require_client());
__reExport(client_exports, __toESM(require_client()));
var globalForPrisma = global;
var prisma = globalForPrisma.prisma || new import_client.PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// src/seed.ts
async function main() {
  console.log("\u{1F331} Seeding database...");
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();
  await prisma.words.deleteMany();
  const users = await Promise.all(
    Array.from({ length: 5 }).map(
      () => prisma.user.create({
        data: {
          firstName: f2.person.firstName(),
          lastName: f2.person.lastName(),
          email: f2.internet.email(),
          role: "student"
        }
      })
    )
  );
  console.log(`\u2705 Created ${users.length} users`);
  const words = await Promise.all(
    Array.from({ length: 10 }).map(
      () => prisma.words.create({
        data: {
          word: f2.word.sample(),
          translation: f2.word.sample(),
          definition: f2.lorem.sentence(),
          partOfSpeech: f2.helpers.arrayElement(["noun", "verb", "adjective"]),
          pronunciation: f2.word.sample(),
          frequency: f2.number.int({ min: 100, max: 1e3 })
        }
      })
    )
  );
  console.log(`\u2705 Created ${words.length} words`);
  const articles = await Promise.all(
    Array.from({ length: 5 }).map(
      () => prisma.article.create({
        data: {
          title: f2.lorem.sentence(),
          content: f2.lorem.paragraphs({ min: 2, max: 5 }),
          difficulty: f2.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
          author: f2.person.fullName(),
          publishedAt: f2.date.recent({ days: 30 }),
          createdAt: f2.date.past({ years: 1 })
        }
      })
    )
  );
  console.log(`\u2705 Created ${articles.length} articles`);
  console.log("\u{1F33E} Seed complete \u2014 database disconnected.");
}
main().catch((e2) => {
  console.error("\u274C Seed failed:", e2);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
/*! Bundled license information:

decimal.js/decimal.mjs:
  (*!
   *  decimal.js v10.5.0
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   *)
*/

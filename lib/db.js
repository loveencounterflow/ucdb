// Generated by CoffeeScript 2.5.1
(function() {
  'use strict';
  var CND, ICQL, PATH, _drop_extension, assign, badge, boolean_as_int, cast, cwd_abspath, cwd_relpath, debug, declare, echo, help, here_abspath, info, inspect, isa, join_path, jr, last_of, project_abspath, rpr, size_of, type_of, types, urge, validate, warn, whisper, xrpr, xrpr2;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB/DB';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  PATH = require('path');

  // FS                        = require 'fs'
  ({assign, jr} = CND);

  ({cwd_abspath, cwd_relpath, here_abspath, _drop_extension, project_abspath} = require('./helpers'));

  //...........................................................................................................
  join_path = function(...P) {
    return PATH.resolve(PATH.join(...P));
  };

  boolean_as_int = function(x) {
    if (x) {
      return 1;
    } else {
      return 0;
    }
  };

  ({inspect} = require('util'));

  xrpr = function(x) {
    return inspect(x, {
      colors: true,
      breakLength: 2e308,
      maxArrayLength: 2e308,
      depth: 2e308
    });
  };

  xrpr2 = function(x) {
    return inspect(x, {
      colors: true,
      breakLength: 80,
      maxArrayLength: 2e308,
      depth: 2e308
    });
  };

  //...........................................................................................................
  ICQL = require('icql');

  project_abspath = function(...P) {
    return here_abspath(__dirname, '..', ...P);
  };

  //...........................................................................................................
  types = require('./types');

  ({isa, validate, cast, declare, size_of, last_of, type_of} = types);

  //-----------------------------------------------------------------------------------------------------------
  this._get_icql_settings = function(settings) {
    var R, defaults;
    /* TAINT path within node_modules might differ */
    /* TAINT extensions should conceivably be configured in `*.icql` file or similar */
    // R.db_path   = join_path __dirname, '../../db/data.db'
    defaults = {
      db_path: project_abspath('./db/mkts.db'),
      icql_path: project_abspath('./db/mkts.icql'),
      clear: false
    };
    R = assign({}, defaults, settings);
    R.db_path = cwd_abspath(R.db_path);
    R.icql_path = cwd_abspath(R.icql_path);
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.new_db = function(settings) {
    var clear_count, db, error, message;
    settings = this._get_icql_settings(settings);
    try {
      db = ICQL.bind(settings);
    } catch (error1) {
      error = error1;
      message = `^ucdb#3987^ When trying to open database at
${settings.db_path}
with ICQL file at
${settings.icql_path}
an error occurred:
${error.message}`.replace(/\n/g, ' ');
      throw new Error(message);
    }
    this.load_extensions(db);
    this.set_pragmas(db);
    //.........................................................................................................
    /* TAINT consider to move clearing DB to ICQL */
    if (settings.clear) {
      clear_count = db.$.clear();
    }
    // info "µ33211 deleted #{clear_count} objects"
    //.........................................................................................................
    this.create_udfs(db);
    this.create_api(db);
    //.........................................................................................................
    return db;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.set_pragmas = function(db) {
    db.$.pragma('foreign_keys = on');
    db.$.pragma('synchronous = off');
    /* see https://sqlite.org/pragma.html#pragma_synchronous */    db.$.pragma('journal_mode = WAL');
//.........................................................................................................
/* see https://github.com/JoshuaWise/better-sqlite3/issues/125 */    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.load_extensions = function(db) {
    return null;
  };

  // extensions_path = project_abspath './sqlite-for-mingkwai-ime/extensions'
  // debug 'µ39982', "extensions_path", extensions_path
  // db.$.load join_path extensions_path, 'spellfix.so'
  // db.$.load join_path extensions_path, 'csv.so'
  // db.$.load join_path extensions_path, 'regexp.so'
  // db.$.load join_path extensions_path, 'series.so'
  // db.$.load join_path extensions_path, 'nextchar.so'
  // # db.$.load join_path extensions_path, 'stmt.so'
  // #.........................................................................................................
  // return null

  //-----------------------------------------------------------------------------------------------------------
  this.create_udfs = function(db) {
    //---------------------------------------------------------------------------------------------------------
    db.$.function('echo', {
      deterministic: false,
      varargs: true
    }, function(...P) {
      /* Output text to command line. */
      /* TAINT consider to use logging method to output to app console. */
      urge(CND.grey('DB'), ...P);
      return null;
    });
    //---------------------------------------------------------------------------------------------------------
    db.$.function('e', {
      deterministic: false,
      varargs: false
    }, function(x) {
      /* Output text to command line, but returns single input value so can be used within an expression. */
      urge(CND.grey('DB'), rpr(x));
      return x;
    });
    //---------------------------------------------------------------------------------------------------------
    db.$.function('e', {
      deterministic: false,
      varargs: false
    }, function(mark, x) {
      /* Output text to command line, but returns single input value so can be used within an expression. */
      urge(CND.grey(`DB ${mark}`), rpr(x));
      return x;
    });
    //---------------------------------------------------------------------------------------------------------
    db.$.function('json_as_hollerith', {
      deterministic: false,
      varargs: false
    }, function(x) {
      return db.$.as_hollerith(JSON.parse(x));
    });
    //---------------------------------------------------------------------------------------------------------
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.create_api = function(db) {
    db.cast_row = function(row) {
      var R;
      validate.mirage_main_row(row);
      R = assign({}, row);
      R.vnr_blob = db.$.as_hollerith(R.vnr);
      R.vnr = jr(R.vnr);
      R.stamped = cast.boolean('number', R.stamped);
      return R;
    };
    //.........................................................................................................
    db.insert = function(row) {
      return db._insert(db.cast_row(row));
    };
    db.update = function(row) {
      return db._update(db.cast_row(row));
    };
    return null;
  };

}).call(this);

//# sourceMappingURL=db.js.map

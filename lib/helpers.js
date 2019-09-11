(function() {
  'use strict';
  var CND, FS, PATH, alert, badge, debug, echo, help, info, log, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB/HELPERS';

  log = CND.get_logger('plain', badge);

  debug = CND.get_logger('debug', badge);

  info = CND.get_logger('info', badge);

  warn = CND.get_logger('warn', badge);

  alert = CND.get_logger('alert', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  this.cwd_abspath = CND.cwd_abspath.bind(CND);

  this.cwd_relpath = CND.cwd_relpath.bind(CND);

  this.here_abspath = CND.here_abspath.bind(CND);

  this._drop_extension = function(path) {
    return path.slice(0, path.length - (PATH.extname(path)).length);
  };

  this.project_abspath = (function(...P) {
    return this.here_abspath(__dirname, '..', ...P);
  }).bind(this);

  PATH = require('path');

  FS = require('fs');

  //-----------------------------------------------------------------------------------------------------------
  this.load_configuration = function() {
    var x;
    return Object.assign(...((function() {
      var i, len, ref, results;
      ref = this._load_configurations_from_standard_locations();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        x = ref[i];
        results.push(x.settings);
      }
      return results;
    }).call(this)));
  };

  //-----------------------------------------------------------------------------------------------------------
  this._load_configurations_from_standard_locations = function() {
    var R, error, home, path, start_home;
    home = start_home = this.project_abspath();
    R = [];
    while (true) {
      if (home === '/') {
        break;
      }
      path = PATH.resolve(PATH.join(home, 'ucdb.json'));
      try {
        R.push({
          path,
          settings: require(path)
        });
      } catch (error1) {
        error = error1;
        if (error.code !== 'MODULE_NOT_FOUND') {
          throw error;
        }
      }
      home = PATH.dirname(home);
    }
    if (R.length === 0) {
      throw new Error(`^ucdb#2201 unable to locate file ucdb.json in any parent directory of ${start_home}`);
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._get_user_home = function() {
    return PATH.abspath((require('os')).homedir());
  };

  // debug @load_configuration()
// debug ( k for k of require.main)
// debug require.main.filename
// debug ( require 'app-root-path' ).path
// debug ( require 'os' ).homedir()

// PATH                      = require 'path'
// #...........................................................................................................
// @assign                   = Object.assign

// info @here_abspath  '/foo/bar', '/baz/coo'
// info @cwd_abspath   '/foo/bar', '/baz/coo'
// info @here_abspath  '/baz/coo'
// info @cwd_abspath   '/baz/coo'
// info @here_abspath  '/foo/bar', 'baz/coo'
// info @cwd_abspath   '/foo/bar', 'baz/coo'
// info @here_abspath  'baz/coo'
// info @cwd_abspath   'baz/coo'
// info @here_abspath  __dirname, 'baz/coo', 'x.js'

}).call(this);

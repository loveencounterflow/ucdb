(function() {
  'use strict';
  var $, $async, $echo, $show, $time_request, $watch, CND, FS, FSP, HTTP, Koa, O, PATH, PD, TEMPLATES, TIMER, _drop_extension, _glob, alert, assign, badge, cast, cid_from_cid_txt, cwd_abspath, cwd_relpath, debug, declare, echo, glob, help, here_abspath, info, isa, jr, last_of, log, project_abspath, root_router, rpr, serve, size_of, svg_from_cid, type_of, urge, validate, walk_cids_in_cid_range, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  FS = require('fs');

  FSP = FS.promises;

  PATH = require('path');

  ({assign, jr} = CND);

  ({walk_cids_in_cid_range, cwd_abspath, cwd_relpath, here_abspath, _drop_extension, project_abspath} = require('../helpers'));

  this.types = require('../types');

  //...........................................................................................................
  ({isa, validate, declare, cast, size_of, last_of, type_of} = this.types);

  //...........................................................................................................
  _glob = require('glob');

  glob = (require('util')).promisify(_glob);

  require('../exception-handler');

  PD = require('pipedreams');

  ({$, $async, $watch, $show} = PD.export());

  //...........................................................................................................
  TIMER = require('../timer');

  TEMPLATES = require('./templates');

  //...........................................................................................................
  Koa = require('koa');

  HTTP = require('http');

  root_router = (new require('koa-router'))();

  serve = require('koa-static');

  //...........................................................................................................
  O = {};

  (() => {
    var db_path;
    O.port = 8080;
    O.db_path = db_path = project_abspath('../benchmarks/assets/ucdb/ucdb.db');
    return O.ucdb = (require('../..')).new_ucdb({db_path});
  })();

  //-----------------------------------------------------------------------------------------------------------
  this.serve = function() {
    var app, server;
    app = new Koa();
    server = HTTP.createServer(app.callback());
    server.listen(O.port);
    info(`Server listening to http://localhost:${O.port}`);
    root_router.get('root', '/', this.$root());
    root_router.get('dump', '/dump', this.$dump());
    // root_router.get 'svg_bare',     '/svg',               @$svg_bare()
    // root_router.get 'svg_glyph',    '/svg/glyph/:glyph',  @$svg_glyph()
    root_router.get('svg_cid', '/svg/cid/:cid', this.$svg_cid());
    app.use($time_request()).use($echo()).use(root_router.routes()).use(serve(project_abspath('./public'))).use(root_router.allowedMethods());
    return app;
  };

  //===========================================================================================================
  // MIDDLEWARE
  //-----------------------------------------------------------------------------------------------------------
  $time_request = function() {
    return async(ctx, next) => {
      var dt_ms;
      dt_ms = (await TIMER.stopwatch_async(async function() {
        return (await next());
      }));
      ctx.set('X-Response-Time', `${dt_ms}ms`);
      ctx.set('X-Cats', "LoL");
      // ctx.body = '(((' + ctx.body + ')))'
      // ctx.body = ctx.body + "\nResponse time #{dt_ms}ms"
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  $echo = function() {
    return async(ctx, next) => {
      info(CND.grey(ctx.request.URL.href));
      await next();
      return null;
    };
  };

  //===========================================================================================================
  // ENDPOINTS
  //-----------------------------------------------------------------------------------------------------------
  this.$root = () => {
    return (ctx) => {
      ctx.type = 'html';
      /* TAINT should cache */
      ctx.body = TEMPLATES.minimal();
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$dump = () => {
    return (ctx) => {
      var row, rows;
      // ctx.type = 'html'
      rows = [...O.ucdb.db.read_lines()];
      rows = ((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = rows.length; i < len; i++) {
          row = rows[i];
          if (row.cid > 0x20) {
            results.push(row.glyph);
          }
        }
        return results;
      })()).join('');
      // debug '^4443^', row
      ctx.body = rows;
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$svg_cid = () => {
    return (ctx) => {
      /* TAINT use API to emit HTTP error */
      var cid, error, href;
      try {
        cid = cid_from_cid_txt(ctx.params.cid);
      } catch (error1) {
        error = error1;
        href = ctx.request.URL.href;
        ctx.type = '.txt';
        ctx.body = `not a valid request: ${href}`;
        warn('^ucdb/server@449879^', `when trying to respond to ${href}, an error occurred: ${error.message}`);
        return null;
      }
      // ctx.body = ctx.request.URL.href + ' ' + ( cid ? 'UNKNOWN' )
      ctx.txpe = '.svg';
      ctx.body = svg_from_cid(cid);
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  cid_from_cid_txt = function(cid_txt) {
    var R;
    validate.nonempty_text(cid_txt);
    if (cid_txt.startsWith('0x')) {
      R = parseInt(cid_txt.slice(2), 16);
    } else {
      R = parseInt(cid_txt, 10);
    }
    if (isa.number(R)) {
      return R;
    }
    /* TAINT use Failure */
    throw new Error(`^ucdb/server@88827 not a valid CID text: ${cid_txt}`);
  };

  //-----------------------------------------------------------------------------------------------------------
  svg_from_cid = function(cid) {
    var pathdata;
    validate.ucdb_cid(cid);
    pathdata = O.ucdb.db.$.single_value(O.ucdb.db.default_pathdata_from_cid({cid}));
    debug('^778^', pathdata);
    return pathdata;
  };

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      return this.serve();
    })();
  }

}).call(this);

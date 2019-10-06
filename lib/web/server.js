(function() {
  'use strict';
  var $, $async, $echo, $show, $time_request, $watch, CND, COMMON, FS, FSP, HTTP, Koa, O, PATH, PD, TEMPLATES, TIMER, _drop_extension, _glob, alert, assign, badge, cast, cwd_abspath, cwd_relpath, debug, declare, echo, glob, help, here_abspath, info, isa, jr, last_of, log, pathdata_from_glyph, project_abspath, root_router, rpr, sample_glyphs, serve, size_of, svg_from_pathdata, type_of, urge, validate, walk_cids_in_cid_range, warn, whisper;

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

  COMMON = require('./common');

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
    // root_router.get 'svg_bare',                   '/svg',               @$svg_bare()
    // root_router.get 'svg_glyph',                  '/svg/glyph/:glyph',  @$svg_glyph()
    // root_router.get 'svg_cid',                    '/svg/cid/:cid',      @$svg_cid()
    // root_router.get 'svg_glyph',                  '/svg/glyph/:glyph',                    @$svg_glyph()
    // root_router.get 'svg_glyph',                  '/svg/fontnick/:fontnick/glyph/:glyph', @$svg_glyph()
    root_router.get('v2_glyphimg', '/v2/glyphimg', this.$v2_glyphimg());
    root_router.get('v2_fontnicks', '/v2/fontnicks', this.$v2_fontnicks());
    root_router.get('v2_glyphsamples', '/v2/glyphsamples/:fontnick', this.$v2_glyphsamples());
    app.use($time_request()).use($echo()).use(serve(project_abspath('./public'))).use(root_router.allowedMethods()).use(root_router.routes());
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
  this.$v2_fontnicks = () => {
    return (ctx) => {
      var row;
      debug('^2337^', ctx.query);
      ctx.body = (function() {
        var ref, results;
        ref = O.ucdb.db.fontnicks();
        results = [];
        for (row of ref) {
          results.push(row.fontnick);
        }
        return results;
      })();
      /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
      ctx.body = ['sunexta', 'nanumgothic', 'nanummyeongjo'];
      /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  sample_glyphs = Array.from("一二三四鼎深國令狐但卻".replace(/\s+/g, ''));

  //-----------------------------------------------------------------------------------------------------------
  this.$v2_glyphsamples = () => {
    return (ctx) => {
      var fontnick, glyph, i, len, pathdata, ref, row, svg;
      /* TAINT code duplication */
      /* TAINT use wrappers or similar to abstract away error handling */
      debug('^66777^', H.SQL_generate_values_tuple(sample_glyphs));
      process.exit(100);
      ctx.body = (function() {
        var ref, results;
        ref = O.ucdb.db.fontnicks();
        results = [];
        for (row of ref) {
          results.push(row.fontnick);
        }
        return results;
      })();
      TEMPLATES.render_glyph_img(fontnick, glyph);
      for (i = 0, len = sample_glyphs.length; i < len; i++) {
        glyph = sample_glyphs[i];
        fontnick = (ref = ctx.params.fontnick) != null ? ref : 'sunexta';
        pathdata = pathdata_from_glyph(fontnick, glyph);
        svg = svg_from_pathdata(pathdata);
      }
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$v2_glyphimg = () => {
    return (ctx) => {
      /* TAINT use API to emit HTTP error */
      var error, fontnick, glyph, href, pathdata, ref, ref1;
      /* TAINT code duplication */
      /* TAINT use wrappers or similar to abstract away error handling */
      debug('^676734^ query:', jr(ctx.query));
      debug('^676734^ parameters:', jr(ctx.params));
      try {
        //.........................................................................................................
        glyph = (ref = ctx.query.glyph) != null ? ref : '流';
        fontnick = (ref1 = ctx.query.fontnick) != null ? ref1 : 'sunexta';
        pathdata = pathdata_from_glyph(fontnick, glyph);
        if (pathdata == null) {
          throw new Error(`unable to find pathdata for ${jr(ctx.params)}`);
        }
      } catch (error1) {
        //.........................................................................................................
        error = error1;
        href = ctx.request.URL.href;
        ctx.type = '.txt';
        ctx.body = `not a valid request: ${href}`;
        warn('^ucdb/server@449879^', `when trying to respond to ${href}, an error occurred: ${error.message}`);
        return null;
      }
      //.........................................................................................................
      ctx.body = svg_from_pathdata(pathdata);
      ctx.set('content-type', 'image/svg+xml');
      // debug '^37845^', ctx.body
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  svg_from_pathdata = function(pathdata) {
    return `<?xml version="1.0" standalone="no"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -800 4096 4896">\n<path transform='scale( 1 -1 ) translate( 0 -3296 )' d="${pathdata}"/>\n</svg>`;
  };

  //-----------------------------------------------------------------------------------------------------------
  pathdata_from_glyph = function(fontnick, glyph) {
    /* TAINT missing outlines casue error, should return null instead or HTTP error */
    var pathdata;
    validate.ucdb_glyph(glyph);
    pathdata = [...(O.ucdb.db.pathdata_from_glyph({fontnick, glyph}))];
    if (pathdata.length !== 1) {
      return null;
    }
    return pathdata[0].pathdata;
  };

  // ### TAINT trat conversion CID/glyph as cast in types module
  // #-----------------------------------------------------------------------------------------------------------
  // cid_from_cid_txt = ( cid_txt ) ->
  //   validate.nonempty_text cid_txt
  //   if cid_txt.startsWith '0x' then R = parseInt cid_txt[ 2 .. ], 16
  //   else                            R = parseInt cid_txt, 10
  //   return R if isa.number R
  //   ### TAINT use Failure ###
  //   throw new Error "^ucdb/server@88827 not a valid CID text: #{cid_txt}"

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      return this.serve();
    })();
  }

}).call(this);

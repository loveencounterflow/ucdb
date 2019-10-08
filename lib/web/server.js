(function() {
  'use strict';
  var $, $async, $echo, $show, $time_request, $watch, CND, COMMON, FS, FSP, HELPERS, HTTP, Koa, O, PATH, PD, SVG, TEMPLATES, TIMER, _drop_extension, _glob, alert, assign, badge, cast, cwd_abspath, cwd_relpath, debug, declare, echo, glob, help, here_abspath, info, isa, jr, last_of, log, pathdata_from_glyph, pathdatamap_from_glyphs, project_abspath, root_router, rpr, sample_glyphs, serve, size_of, type_of, urge, validate, walk_cids_in_cid_range, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB/WEB/SERVER';

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
  Koa = require('koa');

  HTTP = require('http');

  root_router = (new require('koa-router'))();

  serve = require('koa-static');

  //...........................................................................................................
  O = this.O = {};

  (() => {
    var db_path;
    O.port = 8080;
    O.db_path = db_path = project_abspath('../benchmarks/assets/ucdb/ucdb.db');
    O.ucdb = (require('../..')).new_ucdb({db_path});
    O.max_age = 604800;
    return O.cache_control = `max-age=${O.max_age}`;
  })();

  //...........................................................................................................
  TIMER = require('../timer');

  TEMPLATES = require('./templates');

  COMMON = require('./common');

  HELPERS = require('../helpers');

  //-----------------------------------------------------------------------------------------------------------
  this.serve = function() {
    var app, server;
    app = new Koa();
    server = HTTP.createServer(app.callback());
    server.listen(O.port);
    info(`Server listening to http://localhost:${O.port}`);
    //.........................................................................................................
    root_router.get('root', '/', this.$new_page('inventory'));
    root_router.get('long_samples_overview', '/long-samples-overview', this.$new_page('long_samples_overview'));
    root_router.get('slugs', '/slugs', this.$new_page('slugs'));
    root_router.get('dump', '/dump', this.$dump());
    root_router.get('v2_glyphimg', '/v2/glyphimg', this.$v2_glyphimg());
    root_router.get('v2_slug', '/v2/slug', this.$v2_slug());
    root_router.get('v2_fontnicks', '/v2/fontnicks', this.$v2_fontnicks());
    root_router.get('v2_glyphsamples', '/v2/glyphsamples/:fontnick', this.$v2_glyphsamples());
    // .use $time_request()
    app.use($echo()).use(serve(project_abspath('./public'), {
      maxage: O.max_age
    })).use(root_router.allowedMethods()).use(root_router.routes());
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
      var href;
      href = ctx.request.URL.href;
      if (href.length > 108) {
        info(CND.grey(href.slice(0, 106) + '...'));
      } else {
        info(CND.grey(href));
      }
      await next();
      return null;
    };
  };

  //===========================================================================================================
  // ENDPOINTS
  //-----------------------------------------------------------------------------------------------------------
  this.$new_page = (template_name) => {
    return (ctx) => {
      ctx.type = 'html';
      ctx.body = TEMPLATES[template_name](ctx);
      return null;
    };
  };

  // #-----------------------------------------------------------------------------------------------------------
  // @$root = => ( ctx ) =>
  //   ctx.type = 'html'
  //   ### TAINT should cache ###
  //   ctx.body = TEMPLATES.inventory()
  //   return null

  // #-----------------------------------------------------------------------------------------------------------
  // @$long_samples_overview = => ( ctx ) =>
  //   ctx.type = 'html'
  //   ### TAINT should cache ###
  //   ctx.body = TEMPLATES.long_samples_overview()
  //   return null

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
      debug('^ucdb/web/server@2458337^', 'ctx.query:', ctx.query);
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
      // debug '^66777^', H.SQL_generate_values_tuple sample_glyphs
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
        svg = SVG.glyph_from_pathdata(pathdata);
      }
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$v2_glyphimg = () => {
    return async(ctx) => {
      var fontnick, glyph, pathdata, ref, ref1;
      /* TAINT code duplication */
      /* TAINT use wrappers or similar to abstract away error handling */
      // debug '^676734^ query:', jr ctx.query
      // debug '^676734^ parameters:', jr ctx.params
      //.........................................................................................................
      glyph = (ref = ctx.query.glyph) != null ? ref : '流';
      fontnick = (ref1 = ctx.query.fontnick) != null ? ref1 : 'sunexta';
      pathdata = (await pathdata_from_glyph(fontnick, glyph));
      ctx.set('Cache-Control', O.cache_control);
//.........................................................................................................
/* TAINT use middleware to set cache control? */      if (pathdata == null) {
        ctx.status = 302;
        ctx.type = '.txt';
        // ctx.set 'location', '/fallback-glyph.svg'
        ctx.set('location', '/fallback-glyph.png');
        return null;
      }
      //.........................................................................................................
      ctx.set('content-type', 'image/svg+xml');
      ctx.body = SVG.glyph_from_pathdata(pathdata);
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$v2_slug = () => {
    return (ctx) => {
      var fontnick, glyphs, pathdatamap, ref, ref1, svg, text;
      /* TAINT code duplication */
      /* TAINT use wrappers or similar to abstract away error handling */
      // debug '^676734^ query:', jr ctx.query
      // debug '^676734^ parameters:', jr ctx.params
      //.........................................................................................................
      text = (ref = ctx.query.text) != null ? ref : '無此列文';
      glyphs = Array.from(new Set(text));
      fontnick = (ref1 = ctx.query.fontnick) != null ? ref1 : 'sunexta';
      pathdatamap = pathdatamap_from_glyphs(fontnick, glyphs);
      svg = SVG.slug_from_pathdatamap(glyphs, pathdatamap);
      //#######################################################
      // ctx.set 'Cache-Control', O.cache_control ### TAINT use middleware to set cache control? ###
      ctx.set('content-type', 'image/svg+xml');
      ctx.body = svg;
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  pathdata_from_glyph = function(fontnick, glyph) {
    var pathdata;
    validate.ucdb_glyph(glyph);
    pathdata = [...(O.ucdb.db.pathdata_from_glyph({fontnick, glyph}))];
    if (pathdata.length !== 1) {
      return null;
    }
    return pathdata[0].pathdata;
  };

  //-----------------------------------------------------------------------------------------------------------
  pathdatamap_from_glyphs = function(fontnick, glyphs) {
    /* TAINT should do this in DB (?) */
    /* TAINT make this transformation a method */
    /* TAINT query procedure to be updated as soon as ICQL knows hoe to serialize value tuples */
    var R, glyphs_tuple, n, ref, row, sql, sql_template;
    n = glyphs.length;
    glyphs_tuple = HELPERS.SQL_generate_values_tuple(glyphs);
    sql_template = O.ucdb.db.pathdata_from_glyphs({fontnick, glyphs, n});
    sql = sql_template.replace(/\?glyphs\?/g, glyphs_tuple);
    R = {};
    ref = O.ucdb.db.$.query(sql);
    for (row of ref) {
      R[row.glyph] = row.pathdata;
    }
    return R;
  };

  //###########################################################################################################
  // ### TAINT SVG generation temporarily placed here; might move to templates with future version
  // of coffeenode-teacup
  //-----------------------------------------------------------------------------------------------------------
  SVG = {};

  //-----------------------------------------------------------------------------------------------------------
  SVG.glyph_from_pathdata = function(pathdata) {
    return `<?xml version='1.0' standalone='no'?>\n<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 -800 4096 4896'>\n<path transform='scale( 1 -1 ) translate( 0 -3296 )' d='${pathdata}'/>\n</svg>`;
  };

  //-----------------------------------------------------------------------------------------------------------
  SVG.slug_from_pathdatamap = function(glyphs, pathdatamap) {
    var R, advance_x, glyph, glyph_count, i, len, pathdata, width, x, x0;
    // urge '^SVG.slug_from_pathdatamap@3367^', rpr pathdatalist[ .. 200 ]
    x0 = 0;
    x = 0;
    advance_x = 4096/* TAINT magic number, should be derived */
    glyph_count = glyphs.length;
    width = x0 + advance_x * glyph_count;
    R = '';
    R += "<?xml version='1.0' standalone='no'?>";
    R += `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${x0} -800 ${width} 4896'>`;
/* insert blank pathdata for missing glyphs */
// blank                           = 'M 0 0 L 4000 4000 L 4096 4000 96 0 Z'
// blank                           = ''
// blank                           = 'M 50 50 L 4046 50 4046 4046 50 4046 Z'
// return ( ( pathdata_by_glyph[ glyph ] ? blank ) for glyph in glyphs )
//.........................................................................................................
    for (i = 0, len = glyphs.length; i < len; i++) {
      glyph = glyphs[i];
      if ((pathdata = pathdatamap[glyph]) != null) {
        R += `<path transform='scale( 1 -1 ) translate( ${x} -3296 )' d='${pathdata}'/>`;
      } else {
        R += `<path transform='scale( 1 -1 ) translate( ${x} -3296 )' d='M 50 -550 L 4046 -550 4046 3546 50 3546 Z' fill='rgba(255,0,0,0.8)'/>`;
      }
      x += advance_x;
    }
    //.........................................................................................................
    R += "</svg>";
    return R;
  };

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      return this.serve();
    })();
  }

}).call(this);

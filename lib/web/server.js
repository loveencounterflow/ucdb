(function() {
  'use strict';
  var $, $async, $echo, $show, $time_request, $watch, CND, COMMON, DB, FS, FSP, HELPERS, HTTP, Koa, LRRR, O, PATH, PD, SVG, TEMPLATES, TIMER, _drop_extension, _glob, _pathdata_from_outline_row, alert, assign, badge, cast, cwd_abspath, cwd_relpath, debug, declare, echo, glob, help, here_abspath, info, isa, jr, last_of, log, pathdata_from_glyph, pathdatamap_from_glyphs, project_abspath, root_router, rpr, sample_glyphs, serve, size_of, type_of, urge, validate, walk_cids_in_cid_range, warn, whisper;

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

  //...........................................................................................................
  this.types = require('../types');

  ({isa, validate, declare, cast, size_of, last_of, type_of} = this.types);

  //...........................................................................................................
  _glob = require('glob');

  glob = (require('util')).promisify(_glob);

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

  LRRR = require('omicron-persei-8');

  DB = require('../../intershop/intershop_modules/db');

  //-----------------------------------------------------------------------------------------------------------
  this._show_available_addresses = function() {
    var device, i, ifc, ifcs, len, network_interfaces;
    network_interfaces = (require('os')).networkInterfaces();
    help("serving on addresses:");
    for (device in network_interfaces) {
      ifcs = network_interfaces[device];
      for (i = 0, len = ifcs.length; i < len; i++) {
        ifc = ifcs[i];
        if (ifc.family === 'IPv6') {
          info(CND.blue(`* http://[${ifc.address}]:${O.port}/`));
        } else {
          info(CND.yellow(`* http://${ifc.address}:${O.port}`));
        }
      }
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.serve = function() {
    var app, server;
    app = new Koa();
    server = HTTP.createServer(app.callback());
    server.listen(O.port);
    this._show_available_addresses();
    //.........................................................................................................
    root_router.get('root', '/', this.$new_page('inventory'));
    root_router.get('long_samples_overview', '/long-samples-overview', this.$new_page('long_samples_overview'));
    root_router.get('slugs', '/slugs', this.$new_page('slugs'));
    root_router.get('grid', '/grid', this.$new_page('grid'));
    root_router.get('dump', '/dump', this.$dump());
    root_router.get('harfbuzz', '/harfbuzz', this.$new_page('harfbuzz'));
    root_router.get('v2/font', '/v2/font', this.$v2_font());
    root_router.get('v2_glyphimg', '/v2/glyphimg', this.$v2_glyphimg());
    root_router.get('v2_slug', '/v2/slug', this.$v2_slug());
    root_router.get('v2_fontnicks', '/v2/fontnicks', this.$v2_fontnicks());
    root_router.get('v2_glyphsamples', '/v2/glyphsamples/:fontnick', this.$v2_glyphsamples());
    // .use $time_request()
    app.use($echo()).use(serve(project_abspath('./public'))).use(root_router.allowedMethods()).use(root_router.routes()); //, { maxage: O.max_age, }
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
      rows = [...O.ucdb.db.read_codepoint_records()];
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
  sample_glyphs = Array.from(`一二三四鼎深國令狐但卻`.replace(/\s+/g, ''));

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
      // ctx.set 'Cache-Control', O.cache_control ### TAINT use middleware to set cache control? ###
      //.........................................................................................................
      if (pathdata == null) {
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
  this.$v2_font = () => {
    return async(ctx) => {
      var fid, query, readstream, ref;
      // ctx.set 'Cache-Control', O.cache_control ### TAINT use middleware to set cache control? ###
      fid = (ref = ctx.query) != null ? ref.fid : void 0;
      //.........................................................................................................
      if (!isa.ucdb_font_id(fid)) {
        ctx.status = 400;
        ctx.type = '.txt';
        // ctx.set 'content-type', 'text/plain'
        ctx.body = `not a valid font ID: ${rpr(fid)}`;
        return null;
      }
      //.........................................................................................................
      query = ["select line from HARFBUZZ_X.get_svg_font_lines( $1 ) as x ( line );", fid];
      ctx.set('content-type', 'image/svg+xml');
      readstream = (await DB.query_as_readstream(query));
      ctx.body = readstream.pipe(LRRR.remit(function(d, send) {
        return send(d.line + '\n');
      }));
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$v2_slug = () => {
    return async(ctx) => {
      /* TAINT add error handling */
      var fid, glyphs, query, readstream, ref, text;
      text = (ref = ctx.query.text) != null ? ref : '無此列文';
      glyphs = Array.from(new Set(text));
      fid = 'f123';
      // fontnick      = ctx.query.fontnick  ? 'sunexta'
      // pathdatamap   = pathdatamap_from_glyphs fontnick, glyphs
      // svg           = SVG.slug_from_pathdatamap fontnick, glyphs, pathdatamap
      //#######################################################
      // ctx.set 'Cache-Control', O.cache_control ### TAINT use middleware to set cache control? ###
      //.........................................................................................................
      query = ["select line from HARFBUZZ_X.linotype_preview( $1, $2 ) as x ( line );", fid, text];
      ctx.set('content-type', 'image/svg+xml');
      readstream = (await DB.query_as_readstream(query));
      ctx.body = readstream.pipe(LRRR.remit(function(d, send) {
        return send(d.line + '\n');
      }));
      return null;
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  pathdata_from_glyph = function(fontnick, glyph) {
    var rows;
    validate.ucdb_glyph(glyph);
    rows = [...(O.ucdb.db.outline_json_from_glyph({fontnick, glyph}))];
    if (rows.length !== 1) {
      return null;
    }
    return _pathdata_from_outline_row(rows[0]);
  };

  //-----------------------------------------------------------------------------------------------------------
  _pathdata_from_outline_row = function(row) {
    return (JSON.parse(row.outline_json)).pathdata;
  };

  //-----------------------------------------------------------------------------------------------------------
  pathdatamap_from_glyphs = function(fontnick, glyphs) {
    /* TAINT should do this in DB (?) */
    /* TAINT make this transformation a method */
    /* TAINT query procedure to be updated as soon as ICQL knows hoe to serialize value tuples */
    /* NOTE using a function with constant return value to keep JS from expanding `$`s in replacement string;
     see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace */
    var R, cid, cid_hex, glyphs_tuple, iclabel, n, outline_nr, pathdata, ref, row, shared_outline_count, sql, sql_template;
    n = glyphs.length;
    glyphs_tuple = HELPERS.SQL_generate_values_tuple(glyphs);
    sql_template = O.ucdb.db.outline_json_from_glyphs({fontnick, glyphs, n});
    sql = sql_template.replace(/\?glyphs\?/g, function() {
      return glyphs_tuple;
    });
    R = {};
    ref = O.ucdb.db.$.query(sql);
    for (row of ref) {
      ({iclabel, cid, outline_nr, shared_outline_count} = row);
      pathdata = _pathdata_from_outline_row(row);
      cid_hex = cid.toString(16);
      R[row.glyph] = {iclabel, cid, cid_hex, pathdata, outline_nr, shared_outline_count};
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
    return `<?xml version='1.0' standalone='no'?>
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 -800 4096 4896'>
<path transform='scale( 1 -1 ) translate( 0 -3296 )' d='${pathdata}'/>
</svg>`;
  };

  //-----------------------------------------------------------------------------------------------------------
  SVG.slug_from_pathdatamap = function(fontnick, glyphs, pathdatamap) {
    var R, advance_x, cid, cid_hex, entry, glyph, glyph_count, i, iclabel, len, outline_nr, pathdata, push, shared_outline_count, width, x, x0;
    x0 = 0;
    x = 0;
    advance_x = 4096/* TAINT magic number, should be derived */
    glyph_count = glyphs.length;
    width = x0 + advance_x * glyph_count;
    R = '';
    R += "<?xml version='1.0' standalone='no'?>";
    // R          += "<svg xmlns='http://www.w3.org/2000/svg' viewBox='#{x0} -800 #{width} 4896'>"
    R += `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${x0} -800 ${width} 4996'>`;
    R += "<style>";
    R += ".olnr {";
    R += " fill: #800;";
    R += " font-family: helvetica;";
    R += " font-size: 1500px; }";
    R += ".cidx {";
    R += " fill: #30f;";
    R += " font-family: monospace;";
    R += " font-size: 800px; }";
    R += "</style>";
/* insert blank pathdata for missing glyphs */
// blank                           = 'M 0 0 L 4000 4000 L 4096 4000 96 0 Z'
// blank                           = ''
// blank                           = 'M 50 50 L 4046 50 4046 4046 50 4046 Z'
// return ( ( pathdata_by_glyph[ glyph ] ? blank ) for glyph in glyphs )
//.........................................................................................................
    for (i = 0, len = glyphs.length; i < len; i++) {
      glyph = glyphs[i];
      entry = pathdatamap[glyph];
      //.......................................................................................................
      if (entry != null) {
        ({iclabel, cid, cid_hex, pathdata, outline_nr, shared_outline_count} = entry);
        R += `<path transform='scale( 1 -1 ) translate( ${x} -3296 )' d='${pathdata}'/>`;
        if (shared_outline_count > 1) {
          // urge '^ucdb/server@8931^', fontnick, glyph, shared_outline_count
          push = Math.floor(x + advance_x * 0.9 + 0.5);
          R += `<text class='olnr' x='${push}' y='4296'>${outline_nr}</text>`;
        }
        push = Math.floor(x + 500);
        R += `<text class='cidx' x='${push}' y='4296'>${cid_hex}</text>`;
      } else {
        /* add fallback glyph */
        //.......................................................................................................
        R += `<path transform='scale( 1 -1 ) translate( ${x} -3296 )' d='M 600 -550 L 3446 -550 3446 3546 600 3546 Z' fill='rgba(100,100,0,0.2)'/>`;
        cid_hex = (glyph.codePointAt(0)).toString(16);
        push = Math.floor(x + 500);
        R += `<text class='cidx' x='${push}' y='4296'>${cid_hex}</text>`;
      }
      //.......................................................................................................
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

  // DB            = require '../../intershop/intershop_modules/db'
// for row in await DB.query "select * from CATALOG.catalog;"
//   debug '^3337^', row

}).call(this);

//# sourceMappingURL=server.js.map
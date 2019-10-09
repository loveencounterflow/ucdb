(function() {
  // cannot 'use strict'

  //###########################################################################################################
  var CND, COMMON, SERVER, TEACUP, alert, badge, debug, help, info, isa, log, njs_fs, njs_path, row, rpr, sample, type_of, urge, validate, warn, whisper;

  njs_path = require('path');

  njs_fs = require('fs');

  //...........................................................................................................
  CND = require('cnd');

  rpr = CND.rpr.bind(CND);

  badge = '明快打字机/TEMPLATES';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  //...........................................................................................................
  // MKTS                      = require './main'
  TEACUP = require('coffeenode-teacup');

  COMMON = require('./common');

  // CHR                       = require 'coffeenode-chr'
  //...........................................................................................................
  // _STYLUS                   = require 'stylus'
  // as_css                    = STYLUS.render.bind STYLUS
  // style_route               = njs_path.join __dirname, '../src/mingkwai-typesetter.styl'
  // css                       = as_css njs_fs.readFileSync style_route, encoding: 'utf-8'
  //...........................................................................................................
  SERVER = require('./server');

  //...........................................................................................................
  ({isa, validate, type_of} = SERVER.types);

  //===========================================================================================================
  // TEACUP NAMESPACE ACQUISITION
  //-----------------------------------------------------------------------------------------------------------
  Object.assign(this, TEACUP);

  //-----------------------------------------------------------------------------------------------------------
  // @FULLHEIGHTFULLWIDTH  = @new_tag ( P... ) -> @TAG 'fullheightfullwidth', P...
  // @OUTERGRID            = @new_tag ( P... ) -> @TAG 'outergrid',           P...
  // @LEFTBAR              = @new_tag ( P... ) -> @TAG 'leftbar',             P...
  // @CONTENT              = @new_tag ( P... ) -> @TAG 'content',             P...
  // @RIGHTBAR             = @new_tag ( P... ) -> @TAG 'rightbar',            P...
  // @SHADE                = @new_tag ( P... ) -> @TAG 'shade',               P...
  // @SCROLLER             = @new_tag ( P... ) -> @TAG 'scroller',            P...
  // @BOTTOMBAR            = @new_tag ( P... ) -> @TAG 'bottombar',           P...
  // @FOCUSFRAME           = @new_tag ( P... ) -> @TAG 'focusframe',          P...
  this.SVG = this.new_tag(function(...P) {
    return this.TAG('svg', ...P);
  });

  //...........................................................................................................
  this.JS = this.new_tag(function(route) {
    return this.SCRIPT({
      type: 'text/javascript',
      src: route
    });
  });

  this.CSS = this.new_tag(function(route) {
    return this.LINK({
      rel: 'stylesheet',
      href: route
    });
  });

  // @STYLUS               = ( source ) -> @STYLE {}, _STYLUS.render source

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT use proper tags */
  this.get_symbol = function(id, clasz = 'symbol') {
    return this.RAW(`<svg class=${clasz}><use href='/fonts/ucdb.svg#${id}'/></svg>`);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.get_glyph = function(fontnick, glyph, clasz = 'glyph') {
    return this.RAW(`<svg class=${clasz}><use href='/fonts/ucdb.svg#${fontnick}-${glyph}'/></svg>`);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.GLYPHIMG = function(fontnick, glyph, clasz = 'glyph') {
    /* TAINT use API to construct route */
    var url;
    url = COMMON.get_url('/v2/glyphimg', {fontnick, glyph});
    return this.IMG({
      class: 'glyph',
      alt: glyph,
      src: url
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.SLUG = function(fontnick, text, settings) {
    /* TAINT use API to construct route */
    var defaults, height, style, url, width/* TAINT magic number, should be in styles */;
    defaults = {
      missing: 'drop'
    };
    settings = {...defaults, ...settings};
    validate.ucdb_web_layout_SLUG_settings(settings);
    url = COMMON.get_url('/v2/slug', {fontnick, text});
    width = (Array.from(text)).length * (685 / 86);
    width = `${width}mm`;
    height = '10mm'/* TAINT magic number, should be in styles */
    style = `width:${width};height:${height};`;
    return this.IMG({
      class: 'slug',
      alt: text,
      src: url,
      style
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.render_glyph_img = function(fontnick, glyph, clasz = 'glyph') {
    return this.render(() => {
      return this.GLYPHIMG(fontnick, glyph, clasz);
    });
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  sample = {
    // glyphs:     Array.from '一丁丂七丄丅丆万丈三上下丌不与丏丐丑丒专且丕世丗丘丙业丛东丝丞丟丠両丢丣两严並丧丨丩个丫丬中丮丯丰丱串丳临丵丶丷丸丹为主丼丽举丿乀乁乂乃乄久乆乇么义乊之乌乍乎乏乐國果山白過'
    // glyphs:     Array.from '一丁丂七丄丅丆万丈三上下丌不与丏丐丑丒专且丕世丗丘丙业丛东丝丞丟丠両丢丣两严並丧丨丩个丫丬中丮丯丰丱串丳临丵丶丷丸丹为主丼丽举丿乀乁乂乃乄久乆乇么义乊之乌乍乎乏乐國果山白過'
    // glyphs:     Array.from '一丁丂七丄丅丆万丈三上下丌不与丏丐丑丒专且丕世丗丘丙业丛东丝丞'
    // glyphs:     Array.from '一'
    // glyphs:     Array.from '一七丄万𬺲'
    // glyphs:     Array.from '無此列文'
    glyphs: Array.from('𗐑一丁丂七丄丅丆万㐀㐁㐂𠀀𠀁𠀂𪜀𪜁𪜂𫝀𫝁𫝂𫠠𫠡𫠢𬺰𬺱𬺲'),
    fontnicks: (function() {
      var ref, results;
      ref = SERVER.O.ucdb.db.fontnicks_with_outlines();
      results = [];
      for (row of ref) {
        results.push(row.fontnick);
      }
      return results;
    })()
  };

  // fontnicks:  ( row.fontnick for row from SERVER.O.ucdb.db.fontnicks() )[ 0 .. 10 ]
  // fontnicks:  ( row.fontnick for row from SERVER.O.ucdb.db.fontnicks() )
  // fontnicks:  [ 'thkhaaitptwo', ]
  // fontnicks:  [
  //   'thkhaaitpzero'
  //   'thtshynpzero'
  //   'sunexta'
  //   'babelstonehan'
  //   'biaukai'
  //   'cwtexqfangsongmedium'
  //   'cwtexqheibold'
  //   'cwtexqkaimedium'
  //   'cwtexqmingmedium'
  //   'cwtexqyuanmedium'
  //   'epgyobld'
  //   'epgyosho'
  //   'epkaisho'
  //   'epkgobld'
  //   'epkyouka'
  //   'epmarugo'
  //   'epmgobld'
  //   'epminbld'
  //   'fandolfangregular'
  //   'fandolheibold'
  //   'fandolheiregular'
  //   'fandolkairegular'
  //   'fandolsongbold'
  //   'uming'
  //   'dejavusans'
  //   'dejavusansbold' ]

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.layout = this.new_tag(() => {
    this.DOCTYPE(5);
    this.META({
      charset: 'utf-8'
    });
    this.LINK({
      rel: 'shortcut icon',
      href: '/favicon.ico?x=276187623'
    });
    // @META 'http-equiv': "Content-Security-Policy", content: "default-src 'self'"
    // @META 'http-equiv': "Content-Security-Policy", content: "script-src 'unsafe-inline'"
    this.JS('/jquery-3.3.1.js');
    this.JS('/common.js');
    this.CSS('/reset.css');
    return this.CSS('/styles-01.css');
  });

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.inventory = function() {
    var key_as_title;
    //.........................................................................................................
    key_as_title = function(key) {
      return key.replace(/_/g, '-');
    };
    //.........................................................................................................
    return this.render(() => {
      this.layout();
      return this.HTML({
        lang: 'en'
      }, () => {
        this.TITLE('UCDB');
        // titles = ( ( key_as_title key ) for key of @ when not key.startswith '_' )
        this.H1(() => {
          return "UCDB Landing Page";
        });
        return this.UL(() => {
          this.LI(() => {
            return this.A({
              href: '/long-samples-overview'
            }, "long samples overview");
          });
          return this.LI(() => {
            return this.A({
              href: '/slugs'
            }, "slugs");
          });
        });
      });
    });
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.long_samples_overview = function() {
    //.........................................................................................................
    return this.render(() => {
      this.layout();
      this.TITLE('UCDB');
      this.DIV(() => {
        return "UCDB";
      });
      this.H3(() => {
        return "Embedding Text As SVG Images";
      });
      //.......................................................................................................
      // @DIV { style: 'overflow:scroll;' }, =>
      this.TABLE({
        style: 'overflow:scroll;'
      }, () => {
        var fontnick, i, len, ref, results;
        debug('^43685^', sample.fontnicks);
        ref = sample.fontnicks;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          fontnick = ref[i];
          results.push(this.TR(() => {
            var glyph, j, len1, ref1, results1;
            this.TD(() => {
              return this.TEXT(fontnick);
            });
            ref1 = sample.glyphs;
            results1 = [];
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              glyph = ref1[j];
              results1.push(this.TD(() => {
                return this.GLYPHIMG(fontnick, glyph);
              }));
            }
            return results1;
          }));
        }
        return results;
      });
      //.......................................................................................................
      this.JS('/ops.js');
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.slugs = function() {
    var slug;
    slug = sample.glyphs.join('');
    //.........................................................................................................
    return this.render(() => {
      this.layout();
      this.TITLE('UCDB');
      this.DIV(() => {
        return "UCDB";
      });
      this.H3(() => {
        return "Slugs (Multiple Glyphs in single SVG)";
      });
      //.......................................................................................................
      this.TABLE(() => {
        var fontnick, i, len, ref, results;
        ref = sample.fontnicks;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          fontnick = ref[i];
          results.push(this.TR(() => {
            this.TD(() => {
              return this.TEXT(fontnick);
            });
            return this.TD(() => {
              return this.SLUG(fontnick, slug, {
                missing: 'drop'
              });
            });
          }));
        }
        return results;
      });
      //.......................................................................................................
      this.DIV('.tags', () => {
        this.SPAN('.tag', () => {
          return '+edo';
        });
        this.SPAN('.tag', () => {
          return '+geometric';
        });
        this.SPAN('.tag', () => {
          return '+ming';
        });
        this.SPAN('.tag', () => {
          return '+skewed';
        });
        this.SPAN('.tag', () => {
          return '+kai';
        });
        this.SPAN('.tag', () => {
          return '+oblique';
        });
        this.SPAN('.tag', () => {
          return '+running';
        });
        this.SPAN('.tag', () => {
          return '+linear';
        });
        this.SPAN('.tag', () => {
          return '+square';
        });
        this.SPAN('.tag', () => {
          return '+round';
        });
        this.SPAN('.tag', () => {
          return '+regular';
        });
        this.SPAN('.tag', () => {
          return '+grass';
        });
        this.SPAN('.tag', () => {
          return '+clerical';
        });
        this.SPAN('.tag', () => {
          return '+seal';
        });
        this.SPAN('.tag', () => {
          return '+art';
        });
        this.SPAN('.tag', () => {
          return '+other';
        });
        this.SPAN('.tag', () => {
          return '+extralight';
        });
        this.SPAN('.tag', () => {
          return '+light';
        });
        this.SPAN('.tag', () => {
          return '+medium';
        });
        this.SPAN('.tag', () => {
          return '+bold';
        });
        return this.SPAN('.tag', () => {
          return '+extrabold';
        });
      });
      //.......................................................................................................
      this.JS('/ops.js');
      // @DIV '.news', =>
      //   @RAW """Any Turing-Complete lan&shy;guage can, in prin&shy;ci&shy;ple, com&shy;pute any&shy;thing any other Turing-Complete lan&shy;guage
      //   can. I use NodeJS and my parsing library CaffeineEight to not only explain what it means for a
      //   lan&shy;guage to be Turing-Complete but also build the parser and interpreter in less than 60 minutes and
      //   80 lines of code. This is powerful stuff! Writing a toy programming lan&shy;guage doesn't have to be
      //   difficult. With the right tools it can be easy and a useful exercise. At a minimum, it can be very
      //   educational. Languages define the boundaries of our thinking. Writing your own lan&shy;guage, even if it's
      //   just for play, helps you think way outside the box. And who knows, your new-found lan&shy;guage-writing
      //   skills can also come in handy the next time you need a custom DSL or have to parse something more
      //   complicated than regular expressions can handle."""
      // @DIV '#page-ready'
      // @DIV '.ruler', => "RULER"
      return null;
    });
  };

  // #-----------------------------------------------------------------------------------------------------------
// @layout = @FLOAT_layout

}).call(this);

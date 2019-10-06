(function() {
  // cannot 'use strict'

  //###########################################################################################################
  var CND, COMMON, TEACUP, alert, badge, debug, help, info, log, njs_fs, njs_path, rpr, sample, urge, warn, whisper;

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

  //===========================================================================================================
  // TEACUP NAMESPACE ACQUISITION
  //-----------------------------------------------------------------------------------------------------------
  Object.assign(this, TEACUP);

  //-----------------------------------------------------------------------------------------------------------
  this.FULLHEIGHTFULLWIDTH = this.new_tag(function(...P) {
    return this.TAG('fullheightfullwidth', ...P);
  });

  this.OUTERGRID = this.new_tag(function(...P) {
    return this.TAG('outergrid', ...P);
  });

  this.LEFTBAR = this.new_tag(function(...P) {
    return this.TAG('leftbar', ...P);
  });

  this.CONTENT = this.new_tag(function(...P) {
    return this.TAG('content', ...P);
  });

  this.RIGHTBAR = this.new_tag(function(...P) {
    return this.TAG('rightbar', ...P);
  });

  this.SHADE = this.new_tag(function(...P) {
    return this.TAG('shade', ...P);
  });

  this.SCROLLER = this.new_tag(function(...P) {
    return this.TAG('scroller', ...P);
  });

  this.BOTTOMBAR = this.new_tag(function(...P) {
    return this.TAG('bottombar', ...P);
  });

  this.FOCUSFRAME = this.new_tag(function(...P) {
    return this.TAG('focusframe', ...P);
  });

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
  this.render_glyph_img = function(fontnick, glyph, clasz = 'glyph') {
    return this.render(() => {
      return this.GLYPHIMG(fontnick, glyph, clasz);
    });
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  sample = {
    glyphs: Array.from('一丁丂七丄丅丆万丈三上下丌不与丏丐丑丒专且丕世丗丘丙业丛东丝丞丟丠両丢丣两严並丧丨丩个丫丬中丮丯丰丱串丳临丵丶丷丸丹为主丼丽举丿乀乁乂乃乄久乆乇么义乊之乌乍乎乏乐國果山白過'),
    fontnicks: [
      'thkhaaitpzero',
      'thtshynpzero',
      // 'sunexta'
      // 'babelstonehan'
      // 'biaukai'
      // 'cwtexqfangsongmedium'
      // 'cwtexqheibold'
      // 'cwtexqkaimedium'
      // 'cwtexqmingmedium'
      // 'cwtexqyuanmedium'
      // 'epgyobld'
      // 'epgyosho'
      // 'epkaisho'
      // 'epkgobld'
      // 'epkyouka'
      // 'epmarugo'
      // 'epmgobld'
      // 'epminbld'
      // 'fandolfangregular'
      // 'fandolheibold'
      // 'fandolheiregular'
      // 'fandolkairegular'
      // 'fandolsongbold'
      // 'uming'
      // 'dejavusans'
      'dejavusansbold'
    ]
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.minimal = function() {
    //.........................................................................................................
    return this.render(() => {
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
      this.CSS('/styles-01.css');
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

  // #-----------------------------------------------------------------------------------------------------------
// @layout = @FLOAT_layout

}).call(this);

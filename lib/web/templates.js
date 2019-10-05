(function() {
  // cannot 'use strict'

  //###########################################################################################################
  var CND, TEACUP, alert, badge, debug, help, info, log, njs_fs, njs_path, rpr, urge, warn, whisper;

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
  this.get_glyph = function(fontnick, glyph) {
    return this.RAW(`<svg class=glyph><use xlink:href='/fonts/ucdb.svg#g${glyph}'/></svg>`);
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.get_flexgrid_html = function(cdtsel_nr, term) {
    var selector;
    selector = cdtsel_nr === 1 ? '.cdtsel' : '';
    /* TAINT use API to derive cdtsel_id */
    return this.render(() => {
      return this.DIV(`#candidate-${cdtsel_nr}.glyph${selector}`, term);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.main_2 = function() {
    //.........................................................................................................
    return this.render(() => {
      this.DOCTYPE(5);
      this.META({
        charset: 'utf-8'
      });
      // @META 'http-equiv': "Content-Security-Policy", content: "default-src 'self'"
      // @META 'http-equiv': "Content-Security-Policy", content: "script-src 'unsafe-inline'"
      this.TITLE('明快打字机');
      // @LINK rel: 'shortcut icon', href: './favicon.icon'
      /* ------------------------------------------------------------------------------------------------ */
      /* The Tomkel-Harders device to make sure jQuery and other libraries are correctly                  */
      /* loaded and made available even in Electron; see                                                  */
      /*   https://github.com/electron/electron/issues/254#issuecomment-183483641                         */
      /*   https://stackoverflow.com/a/37480521/7568091                                                   */
      /* -------------------------- THIS LINE MUST COME BEFORE ANY IMPORTS ------------------------------ */
      this.SCRIPT("if (typeof module === 'object') {window.module = module; module = undefined;}");
      /* ------------------------------------------------------------------------------------------------ */
      this.JS('./jquery-3.3.1.js');
      this.CSS('./reset.css');
      this.CSS('./styles-01.css');
      /* ------------------------------------------------------------------------------------------------ */
      /* CodeMirror                                                                                       */
      this.CSS('./codemirror/lib/codemirror.css');
      this.CSS('./codemirror/addon/fold/foldgutter.css');
      this.CSS('./codemirror/addon/dialog/dialog.css');
      //.......................................................................................................
      // @CSS    './codemirror/theme/3024-day.css'
      // @CSS    './codemirror/theme/3024-night.css'
      // @CSS    './codemirror/theme/abcdef.css'
      // @CSS    './codemirror/theme/ambiance-mobile.css'
      // @CSS    './codemirror/theme/ambiance.css'
      // @CSS    './codemirror/theme/base16-dark.css'
      // @CSS    './codemirror/theme/base16-light.css'
      // @CSS    './codemirror/theme/bespin.css'
      // @CSS    './codemirror/theme/blackboard.css'
      // @CSS    './codemirror/theme/cobalt.css'
      // @CSS    './codemirror/theme/colorforth.css'
      // @CSS    './codemirror/theme/darcula.css'
      // @CSS    './codemirror/theme/dracula.css'
      // @CSS    './codemirror/theme/duotone-dark.css'
      // @CSS    './codemirror/theme/duotone-light.css'
      // @CSS    './codemirror/theme/eclipse.css'
      // @CSS    './codemirror/theme/elegant.css'
      // @CSS    './codemirror/theme/erlang-dark.css'
      // @CSS    './codemirror/theme/gruvbox-dark.css'
      // @CSS    './codemirror/theme/hopscotch.css'
      // @CSS    './codemirror/theme/icecoder.css'
      // @CSS    './codemirror/theme/idea.css'
      // @CSS    './codemirror/theme/isotope.css'
      // @CSS    './codemirror/theme/lesser-dark.css'
      // @CSS    './codemirror/theme/liquibyte.css'
      // @CSS    './codemirror/theme/lucario.css'
      // @CSS    './codemirror/theme/material.css'
      // @CSS    './codemirror/theme/mbo.css'
      // @CSS    './codemirror/theme/mdn-like.css'
      // @CSS    './codemirror/theme/midnight.css'
      this.CSS('./codemirror/theme/monokai.css');
      // @CSS    './codemirror/theme/neat.css'
      // @CSS    './codemirror/theme/neo.css'
      // @CSS    './codemirror/theme/night.css'
      // @CSS    './codemirror/theme/nord.css'
      // @CSS    './codemirror/theme/oceanic-next.css'
      // @CSS    './codemirror/theme/panda-syntax.css'
      // @CSS    './codemirror/theme/paraiso-dark.css'
      // @CSS    './codemirror/theme/paraiso-light.css'
      // @CSS    './codemirror/theme/pastel-on-dark.css'
      // @CSS    './codemirror/theme/railscasts.css'
      // @CSS    './codemirror/theme/rubyblue.css'
      // @CSS    './codemirror/theme/seti.css'
      // @CSS    './codemirror/theme/shadowfox.css'
      // @CSS    './codemirror/theme/solarized.css'
      // @CSS    './codemirror/theme/ssms.css'
      // @CSS    './codemirror/theme/the-matrix.css'
      // @CSS    './codemirror/theme/tomorrow-night-bright.css'
      // @CSS    './codemirror/theme/tomorrow-night-eighties.css'
      // @CSS    './codemirror/theme/ttcn.css'
      // @CSS    './codemirror/theme/twilight.css'
      // @CSS    './codemirror/theme/vibrant-ink.css'
      // @CSS    './codemirror/theme/xq-dark.css'
      // @CSS    './codemirror/theme/xq-light.css'
      // @CSS    './codemirror/theme/yeti.css'
      // @CSS    './codemirror/theme/yonce.css'
      // @CSS    './codemirror/theme/zenburn.css'
      //.......................................................................................................
      this.JS('./codemirror/lib/codemirror.js');
      this.JS('./codemirror/mode/javascript/javascript.js');
      this.JS('./codemirror/mode/coffeescript/coffeescript.js');
      this.JS('./codemirror/mode/markdown/markdown.js');
      this.JS('./codemirror/addon/search/searchcursor.js');
      this.JS('./codemirror/addon/search/matchesonscrollbar.js');
      this.CSS('./codemirror/addon/search/matchesonscrollbar.css');
      this.JS('./codemirror/addon/search/search.js');
      this.JS('./codemirror/addon/dialog/dialog.js');
      this.JS('./codemirror/addon/edit/matchbrackets.js');
      this.JS('./codemirror/addon/edit/closebrackets.js');
      this.JS('./codemirror/addon/comment/comment.js');
      this.JS('./codemirror/addon/wrap/hardwrap.js');
      this.JS('./codemirror/addon/fold/foldcode.js');
      this.JS('./codemirror/addon/fold/brace-fold.js');
      this.JS('./codemirror/keymap/sublime.js');
      /* -------------------------- THIS LINE MUST COME AFTER ANY IMPORTS ------------------------------- */
      this.CSS('./styles-99.css');
      this.SCRIPT("if (window.module) module = window.module;");
      /* ------------------------------------------------------------------------------------------------ */
      //=======================================================================================================
      this.FULLHEIGHTFULLWIDTH(() => {
        this.OUTERGRID(() => {
          this.LEFTBAR(() => {
            /* TAINT multiple wrapping needed? */
            return this.CONTENT(() => {
              return this.TEXTAREA('#codemirror');
            });
          });
          this.RIGHTBAR(() => {
            return this.DIV('#candidates-flexgrid', () => {});
          });
          // @DIV '.glyph', '明'
          // @DIV '.glyph', '快'
          // @DIV '.glyph', '打'
          // @DIV '.glyph', '字'
          // @DIV '.glyph', '机'
          // @DIV '.glyph', '明'
          // @DIV '.glyph', '快'
          // @DIV '.glyph', '打'
          // @DIV '.glyph', '字'
          // @DIV '.glyph', '机'
          // @DIV '.glyph', '明'
          // @DIV '.glyph', '快'
          // @DIV '.glyph', '打'
          // @DIV '.glyph', '字'
          // @DIV '.glyph', '机'
          // @DIV '.glyph', '明'
          // @DIV '.glyph', '快'
          // @DIV '.glyph', '打'
          // @DIV '.glyph', '字'
          // @DIV '.glyph', '机'
          // @DIV '.glyph', '明'
          // @DIV '.glyph', '快'
          // @DIV '.glyph', '打'
          // @DIV '.glyph', '字'
          // @DIV '.glyph', '机'
          // @RIGHTBAR =>
          //   @SHADE '.background'
          //   @SCROLLER =>
          //     @TABLE '#candidates', =>
          //       @TBODY =>
          //         @TR =>
          //           @TD '.value', "MingKwai"
          //           @TD '.glyph', "明快打字机"
          //           @TD '.value', "TypeWriter"
          //   @SHADE '.foreground'
          return this.BOTTOMBAR(() => {
            return this.DIV('#logger', {
              contenteditable: 'true'
            });
          });
        });
        return this.FOCUSFRAME();
      });
      //=======================================================================================================
      this.JS('./ops.js');
      return null;
    });
  };

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
      this.CSS('/reset.css');
      this.CSS('/styles-01.css');
      this.TITLE('UCDB');
      this.DIV(() => {
        return "UCDB";
      });
      this.DIV('.ucdb', () => {
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      });
      this.DIV('.ucdb', () => {
        return "abcdefghijklmnopqrstuvwxyz";
      });
      // @IMG src: '/fonts/ucdb.svg', style: "width:10mm;height:10mm;"
      // <use transform='translate( 0 10 ) scale( 0.1 0.1 )' fill='#c00' xlink:href='/fonts/ucdb.svg#g國'/>
      // @RAW """<svg style='transform: scale( 0.1, 0.1);' width=800 height=800><use x='0' y='-100' transform='translate( 0 724 ) scale( 1 -1 )' xlink:href='/fonts/ucdb.svg#g國'/></svg>"""
      // @RAW """<svg style='transform: scale( 0.1, 0.1);' width=800 height=800><use x='0' y='-100' transform='translate( 0 724 ) scale( 1 -1 )' xlink:href='/fonts/ucdb.svg#亥'/></svg>"""
      this.get_glyph('any', 'A');
      this.get_glyph('any', 'B');
      this.get_glyph('any', 'C');
      this.get_glyph('any', 'D');
      this.get_glyph('any', '亥');
      this.get_glyph('any', '國');
      // @RAW """<svg id=triangle><use xlink:href='/fonts/ucdb.svg#triangle'/></svg>"""
      // @RAW """<svg class=glyph><use xlink:href='/fonts/ucdb.svg#g亥'/></svg>"""
      // @RAW """<svg width=4096 height=4096><use xlink:href='/fonts/ucdb.svg#g亥'/></svg>"""
      // @IMG src: '/fonts/ucdb.svg', width: 1024, height: 1024
      // @RAW """
      //   <svg width=1024 height=1024>
      //     <use  x='50' y='-300' transform='translate( 0 100 ) scale( 0.1 -0.1 )' xlink:href='/fonts/ucdb.svg#g國'/>
      //     <use x='850' y='-300' transform='translate( 0 100 ) scale( 0.1 -0.1 )' xlink:href='/fonts/ucdb.svg#g亥'/>
      //     <use x='850' y='-300' transform='translate( 0 100 ) scale( 0.1 -0.1 )' xlink:href='/fonts/ucdb.svg#gA'/>
      //     <path transform='scale( 1 2 )' d='M 50 50 L0 0 100 100 0 100 Z'/>
      //     </svg>"""
      // @RAW "<some>TAG</some>"
      this.JS('/ops.js');
      return null;
    });
  };

  // #-----------------------------------------------------------------------------------------------------------
// @layout = @FLOAT_layout

}).call(this);

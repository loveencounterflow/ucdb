(function() {
  // cannot 'use strict'

  //###########################################################################################################
  var CND, COMMON, TEACUP, alert, badge, debug, help, info, log, njs_fs, njs_path, rpr, urge, warn, whisper;

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
      this.H4(() => {
        return "Pre-Fabs";
      });
      this.DIV(() => {
        this.IMG({
          class: 'glyph',
          alt: '國',
          src: '/fonts/sample-glyph-fontnick-國.svg'
        });
        this.IMG({
          class: 'glyph',
          alt: '國',
          src: '/fonts/sample-glyph-fontnick-國.svg'
        });
        this.IMG({
          class: 'glyph',
          alt: '國',
          src: '/fonts/sample-glyph-fontnick-國.svg'
        });
        this.IMG({
          class: 'glyph',
          alt: '亥',
          src: '/fonts/sample-glyph-fontnick-亥.svg'
        });
        this.IMG({
          class: 'glyph',
          alt: '亥',
          src: '/fonts/sample-glyph-fontnick-亥.svg'
        });
        return this.IMG({
          class: 'glyph',
          alt: '亥',
          src: '/fonts/sample-glyph-fontnick-亥.svg'
        });
      });
      this.H4(() => {
        return "Dynamically produced SVG";
      });
      this.DIV(() => {
        this.GLYPHIMG('sunexta', '國');
        this.GLYPHIMG('sunexta', '國');
        this.GLYPHIMG('sunexta', '國');
        this.GLYPHIMG('sunexta', '亥');
        this.GLYPHIMG('sunexta', '亥');
        return this.GLYPHIMG('sunexta', '亥');
      });
      this.DIV(() => {
        return "Copying text should (somehow) work.";
      });
      this.HR();
      // @SVG id: 'internalsvg', =>
      //   @RAW """<symbol id='triangle' viewBox='0 0 100 100'>
      //     <path fill='purple' stroke='black' stroke-width='5' d='M 0 100 L 80 80 50 50 50 20 Z'/>
      //     </symbol>"""
      // @IMG id: 'ucdbsvg', alt: "X", src: '/fonts/ucdb.svg', style: "width:10mm;height:10mm;"
      // @IMG id: 'ucdbsvg', alt: "Y", src: '/fonts/ucdb.svg', style: "width:10mm;height:10mm;"
      // @IMG id: 'ucdbsvg', alt: "Z", src: '/fonts/ucdb.svg', style: "width:10mm;height:10mm;"
      //     # <use transform='translate( 0 10 ) scale( 0.1 0.1 )' fill='#c00' xlink:href='/fonts/ucdb.svg#g國'/>
      // # @RAW """<svg style='transform: scale( 0.1, 0.1);' width=800 height=800><use x='0' y='-100' transform='translate( 0 724 ) scale( 1 -1 )' xlink:href='/fonts/ucdb.svg#g國'/></svg>"""
      // # @RAW """<svg style='transform: scale( 0.1, 0.1);' width=800 height=800><use x='0' y='-100' transform='translate( 0 724 ) scale( 1 -1 )' xlink:href='/fonts/ucdb.svg#亥'/></svg>"""
      // @get_symbol 'paperclip'
      // @get_symbol 'house'
      // @get_symbol 'soupbowl'
      // @get_symbol 'lightbulb'
      // @DIV =>
      //   @get_glyph 'g', '國'
      //   @get_glyph 'g', '國'
      //   @get_glyph 'g', '國'
      // @DIV =>
      //   @get_glyph 'g', '亥'
      //   @get_glyph 'g', '亥'
      //   @get_glyph 'g', '亥'
      //   @RAW """<svg class=glyph><use href='#triangle'/></svg>"""
      //   @RAW """<svg class=glyph><use href='#triangle2'/></svg>"""
      // @DIV '.ucdb', => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      // @RAW "<svg class=glyph><use href='/fonts/ucdb.svg#g-國'/><use href='/fonts/ucdb.svg#g-亥'/></svg>"
      // @DIV '.ucdb', => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

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

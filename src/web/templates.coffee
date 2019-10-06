
# cannot 'use strict'


############################################################################################################
njs_path                  = require 'path'
njs_fs                    = require 'fs'
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr.bind CND
badge                     = '明快打字机/TEMPLATES'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
#...........................................................................................................
# MKTS                      = require './main'
TEACUP                    = require 'coffeenode-teacup'
COMMON                    = require './common'
# CHR                       = require 'coffeenode-chr'
#...........................................................................................................
# _STYLUS                   = require 'stylus'
# as_css                    = STYLUS.render.bind STYLUS
# style_route               = njs_path.join __dirname, '../src/mingkwai-typesetter.styl'
# css                       = as_css njs_fs.readFileSync style_route, encoding: 'utf-8'
#...........................................................................................................

#===========================================================================================================
# TEACUP NAMESPACE ACQUISITION
#-----------------------------------------------------------------------------------------------------------
Object.assign @, TEACUP

#-----------------------------------------------------------------------------------------------------------
@FULLHEIGHTFULLWIDTH  = @new_tag ( P... ) -> @TAG 'fullheightfullwidth', P...
@OUTERGRID            = @new_tag ( P... ) -> @TAG 'outergrid',           P...
@LEFTBAR              = @new_tag ( P... ) -> @TAG 'leftbar',             P...
@CONTENT              = @new_tag ( P... ) -> @TAG 'content',             P...
@RIGHTBAR             = @new_tag ( P... ) -> @TAG 'rightbar',            P...
@SHADE                = @new_tag ( P... ) -> @TAG 'shade',               P...
@SCROLLER             = @new_tag ( P... ) -> @TAG 'scroller',            P...
@BOTTOMBAR            = @new_tag ( P... ) -> @TAG 'bottombar',           P...
@FOCUSFRAME           = @new_tag ( P... ) -> @TAG 'focusframe',          P...
@SVG                  = @new_tag ( P... ) -> @TAG 'svg',                 P...
#...........................................................................................................
@JS                   = @new_tag ( route ) -> @SCRIPT type: 'text/javascript',  src: route
@CSS                  = @new_tag ( route ) -> @LINK   rel:  'stylesheet',      href: route
# @STYLUS               = ( source ) -> @STYLE {}, _STYLUS.render source

#-----------------------------------------------------------------------------------------------------------
### TAINT use proper tags ###
@get_symbol = ( id, clasz = 'symbol' ) ->
  return @RAW "<svg class=#{clasz}><use href='/fonts/ucdb.svg##{id}'/></svg>"

#-----------------------------------------------------------------------------------------------------------
@get_glyph = ( fontnick, glyph, clasz = 'glyph' ) ->
  return @RAW "<svg class=#{clasz}><use href='/fonts/ucdb.svg##{fontnick}-#{glyph}'/></svg>"

#-----------------------------------------------------------------------------------------------------------
@GLYPHIMG = ( fontnick, glyph, clasz = 'glyph' ) ->
  ### TAINT use API to construct route ###
  url = COMMON.get_url '/v2/glyphimg', { fontnick, glyph, }
  return @IMG { class: 'glyph', alt: glyph, src: url, }

#-----------------------------------------------------------------------------------------------------------
@render_glyph_img = ( fontnick, glyph, clasz = 'glyph' ) ->
  return @render => @GLYPHIMG fontnick, glyph, clasz

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@minimal = ->
  #.........................................................................................................
  return @render =>
    @DOCTYPE 5
    @META charset: 'utf-8'
    @LINK rel: 'shortcut icon', href: '/favicon.ico?x=276187623'
    # @META 'http-equiv': "Content-Security-Policy", content: "default-src 'self'"
    # @META 'http-equiv': "Content-Security-Policy", content: "script-src 'unsafe-inline'"
    @JS     '/jquery-3.3.1.js'
    @JS     '/common.js'
    @CSS    '/reset.css'
    @CSS    '/styles-01.css'
    @TITLE 'UCDB'
    @DIV => "UCDB"
    @H3 => "Embedding Text As SVG Images"
    @H4 => "Pre-Fabs"
    @DIV =>
      @IMG class: 'glyph', alt: '國', src: '/fonts/sample-glyph-fontnick-國.svg'
      @IMG class: 'glyph', alt: '國', src: '/fonts/sample-glyph-fontnick-國.svg'
      @IMG class: 'glyph', alt: '國', src: '/fonts/sample-glyph-fontnick-國.svg'
      @IMG class: 'glyph', alt: '亥', src: '/fonts/sample-glyph-fontnick-亥.svg'
      @IMG class: 'glyph', alt: '亥', src: '/fonts/sample-glyph-fontnick-亥.svg'
      @IMG class: 'glyph', alt: '亥', src: '/fonts/sample-glyph-fontnick-亥.svg'
    @H4 => "Dynamically produced SVG"
    @DIV =>
      @GLYPHIMG 'sunexta', '國'
      @GLYPHIMG 'sunexta', '國'
      @GLYPHIMG 'sunexta', '國'
      @GLYPHIMG 'sunexta', '亥'
      @GLYPHIMG 'sunexta', '亥'
      @GLYPHIMG 'sunexta', '亥'
    @DIV => "Copying text should (somehow) work."
    @HR()
    # @SVG id: 'internalsvg', =>
    #   @RAW """<symbol id='triangle' viewBox='0 0 100 100'>
    #     <path fill='purple' stroke='black' stroke-width='5' d='M 0 100 L 80 80 50 50 50 20 Z'/>
    #     </symbol>"""
    # @IMG id: 'ucdbsvg', alt: "X", src: '/fonts/ucdb.svg', style: "width:10mm;height:10mm;"
    # @IMG id: 'ucdbsvg', alt: "Y", src: '/fonts/ucdb.svg', style: "width:10mm;height:10mm;"
    # @IMG id: 'ucdbsvg', alt: "Z", src: '/fonts/ucdb.svg', style: "width:10mm;height:10mm;"
    #     # <use transform='translate( 0 10 ) scale( 0.1 0.1 )' fill='#c00' xlink:href='/fonts/ucdb.svg#g國'/>
    # # @RAW """<svg style='transform: scale( 0.1, 0.1);' width=800 height=800><use x='0' y='-100' transform='translate( 0 724 ) scale( 1 -1 )' xlink:href='/fonts/ucdb.svg#g國'/></svg>"""
    # # @RAW """<svg style='transform: scale( 0.1, 0.1);' width=800 height=800><use x='0' y='-100' transform='translate( 0 724 ) scale( 1 -1 )' xlink:href='/fonts/ucdb.svg#亥'/></svg>"""
    # @get_symbol 'paperclip'
    # @get_symbol 'house'
    # @get_symbol 'soupbowl'
    # @get_symbol 'lightbulb'
    # @DIV =>
    #   @get_glyph 'g', '國'
    #   @get_glyph 'g', '國'
    #   @get_glyph 'g', '國'
    # @DIV =>
    #   @get_glyph 'g', '亥'
    #   @get_glyph 'g', '亥'
    #   @get_glyph 'g', '亥'
    #   @RAW """<svg class=glyph><use href='#triangle'/></svg>"""
    #   @RAW """<svg class=glyph><use href='#triangle2'/></svg>"""
    # @DIV '.ucdb', => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    # @RAW "<svg class=glyph><use href='/fonts/ucdb.svg#g-國'/><use href='/fonts/ucdb.svg#g-亥'/></svg>"
    # @DIV '.ucdb', => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    # @RAW """<svg class=glyph><use xlink:href='/fonts/ucdb.svg#g亥'/></svg>"""
    # @RAW """<svg width=4096 height=4096><use xlink:href='/fonts/ucdb.svg#g亥'/></svg>"""
    # @IMG src: '/fonts/ucdb.svg', width: 1024, height: 1024
    # @RAW """
    #   <svg width=1024 height=1024>
    #     <use  x='50' y='-300' transform='translate( 0 100 ) scale( 0.1 -0.1 )' xlink:href='/fonts/ucdb.svg#g國'/>
    #     <use x='850' y='-300' transform='translate( 0 100 ) scale( 0.1 -0.1 )' xlink:href='/fonts/ucdb.svg#g亥'/>
    #     <use x='850' y='-300' transform='translate( 0 100 ) scale( 0.1 -0.1 )' xlink:href='/fonts/ucdb.svg#gA'/>
    #     <path transform='scale( 1 2 )' d='M 50 50 L0 0 100 100 0 100 Z'/>
    #     </svg>"""
    # @RAW "<some>TAG</some>"
    @JS     '/ops.js'
    return null


# #-----------------------------------------------------------------------------------------------------------
# @layout = @FLOAT_layout




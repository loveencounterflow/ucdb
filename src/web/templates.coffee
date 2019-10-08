
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
SERVER                    = require './server'
#...........................................................................................................
{ isa
  validate
  type_of }               = SERVER.types


#===========================================================================================================
# TEACUP NAMESPACE ACQUISITION
#-----------------------------------------------------------------------------------------------------------
Object.assign @, TEACUP

#-----------------------------------------------------------------------------------------------------------
# @FULLHEIGHTFULLWIDTH  = @new_tag ( P... ) -> @TAG 'fullheightfullwidth', P...
# @OUTERGRID            = @new_tag ( P... ) -> @TAG 'outergrid',           P...
# @LEFTBAR              = @new_tag ( P... ) -> @TAG 'leftbar',             P...
# @CONTENT              = @new_tag ( P... ) -> @TAG 'content',             P...
# @RIGHTBAR             = @new_tag ( P... ) -> @TAG 'rightbar',            P...
# @SHADE                = @new_tag ( P... ) -> @TAG 'shade',               P...
# @SCROLLER             = @new_tag ( P... ) -> @TAG 'scroller',            P...
# @BOTTOMBAR            = @new_tag ( P... ) -> @TAG 'bottombar',           P...
# @FOCUSFRAME           = @new_tag ( P... ) -> @TAG 'focusframe',          P...
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
@SLUG = ( fontnick, text, settings ) ->
  ### TAINT use API to construct route ###
  defaults  = { missing: 'drop', }
  settings  = { defaults..., settings..., }
  validate.ucdb_web_layout_SLUG_settings settings
  url       = COMMON.get_url '/v2/slug', { fontnick, text, }
  width     = ( Array.from text ).length * 10 ### TAINT magic number, should be in styles ###
  width     = "#{width}mm"
  height    = '10mm' ### TAINT magic number, should be in styles ###
  style     = "width:#{width};height:#{height};"
  return @IMG { class: 'slug', alt: text, src: url, style, }

#-----------------------------------------------------------------------------------------------------------
@render_glyph_img = ( fontnick, glyph, clasz = 'glyph' ) ->
  return @render => @GLYPHIMG fontnick, glyph, clasz

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
sample =
  # glyphs:     Array.from '一丁丂七丄丅丆万丈三上下丌不与丏丐丑丒专且丕世丗丘丙业丛东丝丞丟丠両丢丣两严並丧丨丩个丫丬中丮丯丰丱串丳临丵丶丷丸丹为主丼丽举丿乀乁乂乃乄久乆乇么义乊之乌乍乎乏乐國果山白過'
  glyphs:     Array.from '一丁丂七丄丅丆万丈三上下丌不与丏丐丑丒专且丕世丗丘丙业丛东丝丞丟丠両丢丣两严並丧丨丩个丫丬中丮丯丰丱串丳临丵丶丷丸丹为主丼丽举丿乀乁乂乃乄久乆乇么义乊之乌乍乎乏乐國果山白過'
  # glyphs:     Array.from '一丁丂七丄丅丆万丈三上下丌不与丏丐丑丒专且丕世丗丘丙业丛东丝丞'
  # glyphs:     Array.from '一'
  # glyphs:     Array.from '一七丄万𬺲'
  # glyphs:     Array.from '無此列文'
  # glyphs:     Array.from '一丁丂七丄丅丆万㐀㐁㐂𠀀𠀁𠀂𪜀𪜁𪜂𫝀𫝁𫝂𫠠𫠡𫠢𬺰𬺱𬺲'
  # fontnicks:  ( row.fontnick for row from SERVER.O.ucdb.db.fontnicks() )[ 0 .. 10 ]
  # fontnicks:  ( row.fontnick for row from SERVER.O.ucdb.db.fontnicks() )
  # fontnicks:  [ 'babelstonehan', 'biaukai', 'thkhaaitpzero', 'cwtexqyuanmedium', ]
  fontnicks:  [
    'thkhaaitpzero'
    'thtshynpzero'
    'sunexta'
    'babelstonehan'
    'biaukai'
    'cwtexqfangsongmedium'
    'cwtexqheibold'
    'cwtexqkaimedium'
    'cwtexqmingmedium'
    'cwtexqyuanmedium'
    'epgyobld'
    'epgyosho'
    'epkaisho'
    'epkgobld'
    'epkyouka'
    'epmarugo'
    'epmgobld'
    'epminbld'
    'fandolfangregular'
    'fandolheibold'
    'fandolheiregular'
    'fandolkairegular'
    'fandolsongbold'
    'uming'
    'dejavusans'
    'dejavusansbold' ]

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@layout = @new_tag =>
  @DOCTYPE 5
  @META charset: 'utf-8'
  @LINK rel: 'shortcut icon', href: '/favicon.ico?x=276187623'
  # @META 'http-equiv': "Content-Security-Policy", content: "default-src 'self'"
  # @META 'http-equiv': "Content-Security-Policy", content: "script-src 'unsafe-inline'"
  @JS     '/jquery-3.3.1.js'
  @JS     '/common.js'
  @CSS    '/reset.css'
  @CSS    '/styles-01.css'


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@inventory = ->
  #.........................................................................................................
  key_as_title = ( key ) ->
    return key.replace /_/g, '-'
  #.........................................................................................................
  return @render =>
    @layout()
    @TITLE 'UCDB'
    # titles = ( ( key_as_title key ) for key of @ when not key.startswith '_' )
    @H1 => "UCDB Landing Page"
    @UL =>
      @LI => @A { href: '/long-samples-overview', },  "long samples overview"
      @LI => @A { href: '/slugs', },                  "slugs"

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@long_samples_overview = ->
  #.........................................................................................................
  return @render =>
    @layout()
    @TITLE 'UCDB'
    @DIV => "UCDB"
    @H3 => "Embedding Text As SVG Images"
    #.......................................................................................................
    # @DIV { style: 'overflow:scroll;' }, =>
    @TABLE { style: 'overflow:scroll;' }, =>
      for fontnick in sample.fontnicks
        @TR =>
          @TD =>
            @TEXT fontnick
          for glyph in sample.glyphs
            @TD =>
              @GLYPHIMG fontnick, glyph
    #.......................................................................................................
    @JS     '/ops.js'
    return null

#-----------------------------------------------------------------------------------------------------------
@slugs = ->
  slug = sample.glyphs.join ''
  #.........................................................................................................
  return @render =>
    @layout()
    @TITLE 'UCDB'
    @DIV => "UCDB"
    @H3 => "Slugs (Multiple Glyphs in single SVG)"
    #.......................................................................................................
    @TABLE =>
      for fontnick in sample.fontnicks
        @TR =>
          @TD =>
            @TEXT fontnick
          @TD =>
            @SLUG fontnick, slug, { missing: 'drop', }
    #.......................................................................................................
    @JS     '/ops.js'
    return null


# #-----------------------------------------------------------------------------------------------------------
# @layout = @FLOAT_layout




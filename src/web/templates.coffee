
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
  cast
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
  width     = ( Array.from text ).length * ( 685 / 86 ) ### TAINT magic number, should be in styles ###
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
  # glyphs:     Array.from '一丁丂七丄丅丆万丈三上下丌不与丏丐丑丒专且丕世丗丘丙业丛东丝丞丟丠両丢丣两严並丧丨丩个丫丬中丮丯丰丱串丳临丵丶丷丸丹为主丼丽举丿乀乁乂乃乄久乆乇么义乊之乌乍乎乏乐國果山白過'
  # glyphs:     Array.from '一丁丂七丄丅丆万丈三上下丌不与丏丐丑丒专且丕世丗丘丙业丛东丝丞'
  # glyphs:     Array.from '一'
  # glyphs:     Array.from '一七丄万𬺲'
  # glyphs:     Array.from '無此列文'
  glyphs:     Array.from '𗐑𥳑字好松一丁丂七丄丅丆万㐀㐁㐂龰龱龲龳龴龵龶龷龸龹龺龻⺶龼龽龾龿鿀鿁鿂鿃鿄鿅鿆鿇鿈鿉鿊鿋鿌鿍鿎鿏鿐鿑鿒鿓鿔鿕鿖鿗鿘鿙鿚鿛鿜鿝鿞鿟鿠鿡鿢鿣鿤鿥鿦鿧鿨鿩鿪鿫鿬鿭鿮鿯𠀀𠀁𠀂𪜀𪜁𪜂𫝀𫝁𫝂𫠠𫠡𫠢𬺰𬺱𬺲〡〢〣〤〥〦〧〨〩〸〹〺〻〼〽🉠🉡🉢🉣🉤🉥'
  # glyphs:     Array.from '𗐑𥳑字好松一丁丂七丄丅丆万㐀㐁㐂龹龺龻龼鿋鿛鿮鿯𠀀𠀁𠀂𪜀𪜁𪜂𫝀𫝁𫝂𫠠𫠡𫠢𬺰𬺱𬺲〡〢〣〤〥〦〧〨〩〸〹〺〻〼〽🉠🉡🉢🉣🉤🉥'
  fontnicks:  ( row.fontnick for row from SERVER.O.ucdb.db.fontnicks_with_outlines() )
  # fontnicks:  ( row.fontnick for row from SERVER.O.ucdb.db.fontnicks() )[ 0 .. 10 ]
  # fontnicks:  ( row.fontnick for row from SERVER.O.ucdb.db.fontnicks() )
  # fontnicks:  [ 'thkhaaitptwo', ]
  # fontnicks:  [
  #   'thkhaaitpzero'
  #   'thtshynpzero'
  #   'sunexta'
  #   'babelstonehan'
  #   'biaukai'
  #   'cwtexqfangsongmedium'
  #   'cwtexqheibold'
  #   'cwtexqkaimedium'
  #   'cwtexqmingmedium'
  #   'cwtexqyuanmedium'
  #   'epgyobld'
  #   'epgyosho'
  #   'epkaisho'
  #   'epkgobld'
  #   'epkyouka'
  #   'epmarugo'
  #   'epmgobld'
  #   'epminbld'
  #   'fandolfangregular'
  #   'fandolheibold'
  #   'fandolheiregular'
  #   'fandolkairegular'
  #   'fandolsongbold'
  #   'uming'
  #   'dejavusans'
  #   'dejavusansbold' ]

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
    @HTML { lang: 'en', }, =>
      @TITLE 'UCDB'
      # titles = ( ( key_as_title key ) for key of @ when not key.startswith '_' )
      @H1 => "UCDB Landing Page"
      @UL =>
        @LI => @A { href: '/long-samples-overview', },  "long samples overview"
        @LI => @A { href: '/slugs', },                  "slugs"
        @LI => @A { href: '/grid',  },                  "grid"

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
      debug '^43685^', sample.fontnicks
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
    @DIV '.tags', =>
      @SPAN '.tag', => '+edo'
      @SPAN '.tag', => '+geometric'
      @SPAN '.tag', => '+ming'
      @SPAN '.tag', => '+skewed'
      @SPAN '.tag', => '+kai'
      @SPAN '.tag', => '+oblique'
      @SPAN '.tag', => '+running'
      @SPAN '.tag', => '+linear'
      @SPAN '.tag', => '+square'
      @SPAN '.tag', => '+round'
      @SPAN '.tag', => '+regular'
      @SPAN '.tag', => '+grass'
      @SPAN '.tag', => '+clerical'
      @SPAN '.tag', => '+seal'
      @SPAN '.tag', => '+art'
      @SPAN '.tag', => '+other'
      @SPAN '.tag', => '+extralight'
      @SPAN '.tag', => '+light'
      @SPAN '.tag', => '+medium'
      @SPAN '.tag', => '+bold'
      @SPAN '.tag', => '+extrabold'
    #.......................................................................................................
    @JS     '/ops.js'
    # @DIV '.news', =>
    #   @RAW """Any Turing-Complete lan&shy;guage can, in prin&shy;ci&shy;ple, com&shy;pute any&shy;thing any other Turing-Complete lan&shy;guage
    #   can. I use NodeJS and my parsing library CaffeineEight to not only explain what it means for a
    #   lan&shy;guage to be Turing-Complete but also build the parser and interpreter in less than 60 minutes and
    #   80 lines of code. This is powerful stuff! Writing a toy programming lan&shy;guage doesn't have to be
    #   difficult. With the right tools it can be easy and a useful exercise. At a minimum, it can be very
    #   educational. Languages define the boundaries of our thinking. Writing your own lan&shy;guage, even if it's
    #   just for play, helps you think way outside the box. And who knows, your new-found lan&shy;guage-writing
    #   skills can also come in handy the next time you need a custom DSL or have to parse something more
    #   complicated than regular expressions can handle."""
    # @DIV '#page-ready'
    # @DIV '.ruler', => "RULER"
    return null

#-----------------------------------------------------------------------------------------------------------
@grid = ( ctx ) ->
  ### TAINT also implement listing from RSGs ###
  debug '^33442^', ctx.query
  fontnick      = ctx.query.fontnick  ? 'sunexta'
  firstpage     = ctx.query.firstpage ? '4e'
  lastpage      = ctx.query.lastpage  ? '4f'
  # lastpage      = ctx.query.lastpage  ? '9f'
  firstpage_cid = cast.ucdb_cid_codepage_number firstpage
  lastpage_cid  = cast.ucdb_cid_codepage_number lastpage
  [ firstpage_cid, lastpage_cid, ] = [ lastpage_cid, firstpage_cid, ] if firstpage_cid > lastpage_cid
  firstpage     = ( ( firstpage_cid >> 8 ).toString 16 ).replace /00$/, ''
  lastpage      = ( ( lastpage_cid  >> 8 ).toString 16 ).replace /00$/, ''
  #.........................................................................................................
  return @render =>
    @layout()
    @TITLE 'UCDB'
    @DIV => "UCDB"
    @H3 => "Grid for CIDs 0x#{firstpage}00 ..0x#{lastpage}00"
    #.......................................................................................................
    debug '^2772^', firstpage_cid, firstpage
    debug '^2772^', lastpage_cid, lastpage
    for cid0_table in [ firstpage_cid .. lastpage_cid ] by 0x100
      cid1_table      = cid0_table + 0xff
      cid0_table_hex  = cast.hex cid0_table
      cid1_table_hex  = cast.hex cid1_table
      @DIV '.xxxheading', "#{cid0_table_hex}..#{cid1_table_hex} (#{fontnick})"
      @TABLE =>
        # @TR '.xxxrow', =>
        #   @TH '.xxxheader'
        #   for delta in [ 0x0 .. 0xf ]
        #     delta_hex = cast.hex delta
        #     @TH '.xxxheader', => delta_hex
        for cid0_row in [ cid0_table .. cid1_table ] by 0x10
          cid0_row_hex = cast.hex cid0_row
          @TR '.xxxrow', =>
            @TH '.xxxheader', => cid0_row_hex
            slug = ( ( String.fromCodePoint cid0_row + delta ) for delta in [ 0x0 .. 0xf ] ).join ''
            @TD '.xxxdata', =>
              @SLUG fontnick, slug, { missing: 'drop', }
            null
          null
        null
    null
    #.......................................................................................................


# #-----------------------------------------------------------------------------------------------------------
# @layout = @FLOAT_layout




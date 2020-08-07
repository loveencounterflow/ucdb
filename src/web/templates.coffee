
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
{ jr, }                   = CND
UCDB                      = require '../..'
# { walk_cids_in_cid_range
#   cwd_abspath
#   cwd_relpath
#   here_abspath
#   _drop_extension
#   project_abspath }       = require '../helpers'


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
        @LI => @A { href: '/slugs',       },  "slugs"
        @LI => @A { href: '/grid',        },  "grid"
        @LI => @A { href: '/dump',        },  "dump"
        @LI => @A { href: '/harfbuzz',    },  "harfbuzz"


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@long_samples_overview = ->
  #.........................................................................................................
  return @render =>
    fontnicks = ( row.fontnick for row from SERVER.O.ucdb.db.fontnicks_with_outlines() )
    glyphs    = UCDB._XXX_get_all_glyphs_as_list_from_cfg_glyphsets SERVER.O.ucdb
    @layout()
    @TITLE 'UCDB'
    @DIV => "UCDB"
    @H3 => "Embedding Text As SVG Images"
    #.......................................................................................................
    # @DIV { style: 'overflow:scroll;' }, =>
    @TABLE { style: 'overflow:scroll;' }, =>
      for fontnick in fontnicks
        @TR =>
          @TD =>
            @TEXT fontnick
          for glyph in glyphs
            @TD =>
              @GLYPHIMG fontnick, glyph
    #.......................................................................................................
    @JS     '/ops.js'
    return null

#-----------------------------------------------------------------------------------------------------------
@slugs = ->
  #.........................................................................................................
  return @render =>
    fontnicks = ( row.fontnick for row from SERVER.O.ucdb.db.fontnicks_with_outlines() )
    ### TAINT consider to reqrite this so we call method on `SERVER`, not on `UCDB` ###
    glyphs    = UCDB._XXX_get_all_glyphs_as_list_from_cfg_glyphsets SERVER.O.ucdb
    slug      = glyphs.join ''
    @layout()
    @TITLE 'UCDB'
    @DIV => "UCDB"
    @H3 => "Slugs (Multiple Glyphs in single SVG)"
    #.......................................................................................................
    @TABLE =>
      for fontnick in fontnicks
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

#-----------------------------------------------------------------------------------------------------------
@harfbuzz = ( ctx ) ->
  # debug '^33442^', ctx.query
  # url       = COMMON.get_url '/v2/slug', { fontnick, text, }
  # url       = '/v2/harfbuzz-sample.svg'
  # width     = ( Array.from text ).length * ( 685 / 86 ) ### TAINT magic number, should be in styles ###
  text      = "sample text"
  width     = 100
  width     = "#{width}mm"
  height    = '10mm' ### TAINT magic number, should be in styles ###
  style     = "width:#{width};height:#{height};"
  #.........................................................................................................
  return @render =>
    @layout()
    @TITLE "SVG Typesetting with Harfbuzz and OpentypeJS"
    @STYLE "body { background-color: #cf68; padding: 10mm; }"
    @H1 => "SVG Typesetting with Harfbuzz and OpentypeJS"
    @P =>
      @TEXT """SVG with glyph outlines provided by opentype.js, typesetting metrics by harfbuzz. Outlines
        are implemented as SVG symbols accessible via external resources, which is why we must"""
      @UL =>
        @LI =>
          @TEXT "use HTML "; @CODE => "<object>"; @TEXT " tags instead of "
          @CODE "<img>"
          @TEXT " tags (images are not allowed to reference external resources);"
        @LI =>
          @TEXT """use a web server and not open the current file directly in the browser, as it would then
            not resolve the references in the loaded SVG."""
    @HR()
    @DIV =>
      @CODE "./sample-glyph.svg"; @BR()
      @OBJECT { type: 'image/svg+xml', data: '/v2/harfbuzz-opentypejs-slug?text=AEIÖU',  style: 'outline:1px dotted red;width:250mm', }, =>
        @DIV { style: 'outline:1px dotted blue;width:250mm', }, "(Fallback for SVG here)"
      # @OBJECT { type: 'image/svg+xml', data: 'opentypejs-harfbuzz-svg/sample-glyph.svg', style: 'outline:1px dotted red;width:250mm', }, =>
      #   @TEXT "(Fallback for SVG here)"
    @DIV { style: "width:10mm;height:10mm;background-color:red;", }
    # @IMG { class: 'slug', alt: text, src: 'opentypejs-harfbuzz-svg/sample-svg.html', style, }


# #-----------------------------------------------------------------------------------------------------------
# @layout = @FLOAT_layout




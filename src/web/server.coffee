
'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'UCDB/WEB/SERVER'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
FS                        = require 'fs'
FSP                       = FS.promises
PATH                      = require 'path'
{ assign
  jr }                    = CND
{ walk_cids_in_cid_range
  cwd_abspath
  cwd_relpath
  here_abspath
  _drop_extension
  project_abspath }       = require '../helpers'
@types                    = require '../types'
#...........................................................................................................
{ isa
  validate
  declare
  cast
  size_of
  last_of
  type_of }               = @types
#...........................................................................................................
_glob                     = require 'glob'
glob                      = ( require 'util' ).promisify _glob
PD                        = require 'pipedreams'
{ $
  $async
  $watch
  $show  }                = PD.export()
#...........................................................................................................
Koa                       = require 'koa'
HTTP                      = require 'http'
root_router               = ( new require 'koa-router' )()
serve                     = require 'koa-static'
#...........................................................................................................
O                         = @O = {}
do =>
  O.port          = 8080
  O.db_path       = db_path = project_abspath '../benchmarks/assets/ucdb/ucdb.db'
  O.ucdb          = ( require '../..' ).new_ucdb { db_path, }
  O.max_age       = 604800
  O.cache_control = "max-age=#{O.max_age}"
#...........................................................................................................
TIMER                     = require '../timer'
TEMPLATES                 = require './templates'
COMMON                    = require './common'
HELPERS                   = require '../helpers'

#-----------------------------------------------------------------------------------------------------------
@_show_available_addresses = ->
  network_interfaces = ( require 'os' ).networkInterfaces()
  help "serving on addresses:"
  for device, ifcs of network_interfaces
    for ifc in ifcs
      if ifc.family is 'IPv6'
        info CND.blue   "* http://[#{ifc.address}]:#{O.port}/"
      else
        info CND.yellow "* http://#{ifc.address}:#{O.port}"
  return null

#-----------------------------------------------------------------------------------------------------------
@serve = ->
  app     = new Koa()
  server  = HTTP.createServer app.callback()
  server.listen O.port
  @_show_available_addresses()
  #.........................................................................................................
  root_router.get 'root',                   '/',                            @$new_page 'inventory'
  root_router.get 'long_samples_overview',  '/long-samples-overview',       @$new_page 'long_samples_overview'
  root_router.get 'slugs',                  '/slugs',                       @$new_page 'slugs'
  root_router.get 'grid',                   '/grid',                        @$new_page 'grid'
  root_router.get 'dump',                   '/dump',                        @$dump()
  root_router.get 'v2_glyphimg',            '/v2/glyphimg',                 @$v2_glyphimg()
  root_router.get 'v2_slug',                '/v2/slug',                     @$v2_slug()
  root_router.get 'v2_fontnicks',           '/v2/fontnicks',                @$v2_fontnicks()
  root_router.get 'v2_glyphsamples',        '/v2/glyphsamples/:fontnick',   @$v2_glyphsamples()
  app
    # .use $time_request()
    .use $echo()
    .use serve ( project_abspath './public' ) #, { maxage: O.max_age, }
    .use root_router.allowedMethods()
    .use root_router.routes()
  return app


#===========================================================================================================
# MIDDLEWARE
#-----------------------------------------------------------------------------------------------------------
$time_request = -> ( ctx, next ) =>
  dt_ms = await TIMER.stopwatch_async -> await next()
  ctx.set 'X-Response-Time', "#{dt_ms}ms"
  ctx.set 'X-Cats', "LoL"
  # ctx.body = '(((' + ctx.body + ')))'
  # ctx.body = ctx.body + "\nResponse time #{dt_ms}ms"
  return null

#-----------------------------------------------------------------------------------------------------------
$echo = -> ( ctx, next ) =>
  href = ctx.request.URL.href
  if href.length > 108  then  info CND.grey href[ .. 105 ] + '...'
  else                        info CND.grey href
  await next()
  return null


#===========================================================================================================
# ENDPOINTS
#-----------------------------------------------------------------------------------------------------------
@$new_page = ( template_name ) => ( ctx ) =>
  ctx.type = 'html'
  ctx.body = TEMPLATES[ template_name ] ctx
  return null

# #-----------------------------------------------------------------------------------------------------------
# @$root = => ( ctx ) =>
#   ctx.type = 'html'
#   ### TAINT should cache ###
#   ctx.body = TEMPLATES.inventory()
#   return null

# #-----------------------------------------------------------------------------------------------------------
# @$long_samples_overview = => ( ctx ) =>
#   ctx.type = 'html'
#   ### TAINT should cache ###
#   ctx.body = TEMPLATES.long_samples_overview()
#   return null

#-----------------------------------------------------------------------------------------------------------
@$dump = => ( ctx ) =>
  # ctx.type = 'html'
  rows = [ O.ucdb.db.read_codepoint_records()..., ]
  rows = ( row.glyph for row in rows when row.cid > 0x20 ).join ''
    # debug '^4443^', row
  ctx.body = rows
  return null

#-----------------------------------------------------------------------------------------------------------
@$v2_fontnicks = => ( ctx ) =>
  debug '^ucdb/web/server@2458337^', 'ctx.query:', ctx.query
  ctx.body = ( row.fontnick for row from O.ucdb.db.fontnicks() )
  ### !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ###
  ctx.body = [
    'sunexta'
    'nanumgothic'
    'nanummyeongjo'
  ]
  ### !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ###
  return null

#-----------------------------------------------------------------------------------------------------------
sample_glyphs = Array.from ( """
  一二三四鼎深國令狐但卻
  """.replace /\s+/g, '' )

#-----------------------------------------------------------------------------------------------------------
@$v2_glyphsamples = => ( ctx ) =>
  ### TAINT code duplication ###
  ### TAINT use wrappers or similar to abstract away error handling ###
  # debug '^66777^', H.SQL_generate_values_tuple sample_glyphs
  process.exit 100
  ctx.body = ( row.fontnick for row from O.ucdb.db.fontnicks() )
  TEMPLATES.render_glyph_img fontnick, glyph

  for glyph in sample_glyphs
    fontnick  = ctx.params.fontnick ? 'sunexta'
    pathdata  = pathdata_from_glyph fontnick, glyph
    svg       = SVG.glyph_from_pathdata pathdata
  return null

#-----------------------------------------------------------------------------------------------------------
@$v2_glyphimg = => ( ctx ) =>
  ### TAINT code duplication ###
  ### TAINT use wrappers or similar to abstract away error handling ###
  # debug '^676734^ query:', jr ctx.query
  # debug '^676734^ parameters:', jr ctx.params
  #.........................................................................................................
  glyph     = ctx.query.glyph     ? '流'
  fontnick  = ctx.query.fontnick  ? 'sunexta'
  pathdata  = await pathdata_from_glyph fontnick, glyph
  # ctx.set 'Cache-Control', O.cache_control ### TAINT use middleware to set cache control? ###
  #.........................................................................................................
  unless pathdata?
    ctx.status  = 302
    ctx.type    = '.txt'
    # ctx.set 'location', '/fallback-glyph.svg'
    ctx.set 'location', '/fallback-glyph.png'
    return null
  #.........................................................................................................
  ctx.set 'content-type', 'image/svg+xml'
  ctx.body  = SVG.glyph_from_pathdata pathdata
  return null

#-----------------------------------------------------------------------------------------------------------
@$v2_slug = => ( ctx ) =>
  ### TAINT code duplication ###
  ### TAINT use wrappers or similar to abstract away error handling ###
  # debug '^676734^ query:', jr ctx.query
  # debug '^676734^ parameters:', jr ctx.params
  #.........................................................................................................
  text          = ctx.query.text      ? '無此列文'
  glyphs        = Array.from new Set text
  fontnick      = ctx.query.fontnick  ? 'sunexta'
  pathdatamap   = pathdatamap_from_glyphs fontnick, glyphs
  svg           = SVG.slug_from_pathdatamap fontnick, glyphs, pathdatamap
  ########################################################
  # ctx.set 'Cache-Control', O.cache_control ### TAINT use middleware to set cache control? ###
  ctx.set 'content-type', 'image/svg+xml'
  ctx.body = svg
  return null

#-----------------------------------------------------------------------------------------------------------
pathdata_from_glyph = ( fontnick, glyph ) ->
  validate.ucdb_glyph glyph
  rows = [ ( O.ucdb.db.outline_json_from_glyph { fontnick, glyph, } )..., ]
  return null unless rows.length is 1
  return _pathdata_from_outline_row rows[ 0 ]

#-----------------------------------------------------------------------------------------------------------
_pathdata_from_outline_row = ( row ) -> ( JSON.parse row.outline_json ).pathdata

#-----------------------------------------------------------------------------------------------------------
pathdatamap_from_glyphs = ( fontnick, glyphs ) ->
  ### TAINT query procedure to be updated as soon as ICQL knows hoe to serialize value tuples ###
  n               = glyphs.length
  glyphs_tuple    = HELPERS.SQL_generate_values_tuple glyphs
  sql_template    = O.ucdb.db.outline_json_from_glyphs { fontnick, glyphs, n, }
  ### NOTE using a function with constant return value to keep JS from expanding `$`s in replacement string;
  see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace ###
  sql             = sql_template.replace /\?glyphs\?/g, -> glyphs_tuple
  ### TAINT should do this in DB (?) ###
  ### TAINT make this transformation a method ###
  R               = {}
  for row from O.ucdb.db.$.query sql
    { iclabel
      cid
      outline_nr
      shared_outline_count  } = row
    pathdata                  = _pathdata_from_outline_row row
    cid_hex                   = cid.toString 16
    R[ row.glyph ]            = { iclabel, cid, cid_hex, pathdata, outline_nr, shared_outline_count, }
  return R


############################################################################################################
# ### TAINT SVG generation temporarily placed here; might move to templates with future version
# of coffeenode-teacup
#-----------------------------------------------------------------------------------------------------------
SVG = {}

#-----------------------------------------------------------------------------------------------------------
SVG.glyph_from_pathdata = ( pathdata ) ->
  return """<?xml version='1.0' standalone='no'?>
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 -800 4096 4896'>
    <path transform='scale( 1 -1 ) translate( 0 -3296 )' d='#{pathdata}'/>
    </svg>"""

#-----------------------------------------------------------------------------------------------------------
SVG.slug_from_pathdatamap = ( fontnick, glyphs, pathdatamap ) ->
  x0          = 0
  x           = 0
  advance_x   = 4096 ### TAINT magic number, should be derived ###
  glyph_count = glyphs.length
  width       = x0 + advance_x * glyph_count
  R           = ''
  R          += "<?xml version='1.0' standalone='no'?>"
  # R          += "<svg xmlns='http://www.w3.org/2000/svg' viewBox='#{x0} -800 #{width} 4896'>"
  R          += "<svg xmlns='http://www.w3.org/2000/svg' viewBox='#{x0} -800 #{width} 4996'>"
  R          += "<style>"
  R          += ".olnr {"
  R          += " fill: #800;"
  R          += " font-family: helvetica;"
  R          += " font-size: 1500px; }"
  R          += ".cidx {"
  R          += " fill: #30f;"
  R          += " font-family: monospace;"
  R          += " font-size: 800px; }"
  R          += "</style>"
  ### insert blank pathdata for missing glyphs ###
  # blank                           = 'M 0 0 L 4000 4000 L 4096 4000 96 0 Z'
  # blank                           = ''
  # blank                           = 'M 50 50 L 4046 50 4046 4046 50 4046 Z'
  # return ( ( pathdata_by_glyph[ glyph ] ? blank ) for glyph in glyphs )
  #.........................................................................................................
  for glyph in glyphs
    entry = pathdatamap[ glyph ]
    #.......................................................................................................
    if entry?
      { iclabel
        cid
        cid_hex
        pathdata
        outline_nr
        shared_outline_count } = entry
      R += "<path transform='scale( 1 -1 ) translate( #{x} -3296 )' d='#{pathdata}'/>"
      if shared_outline_count > 1
        # urge '^ucdb/server@8931^', fontnick, glyph, shared_outline_count
        push  = Math.floor x + advance_x * 0.9 + 0.5
        R    += "<text class='olnr' x='#{push}' y='4296'>#{outline_nr}</text>"
      push  = Math.floor x + 500
      R    += "<text class='cidx' x='#{push}' y='4296'>#{cid_hex}</text>"
    #.......................................................................................................
    else
      ### add fallback glyph ###
      R += "<path transform='scale( 1 -1 ) translate( #{x} -3296 )' d='M 600 -550 L 3446 -550 3446 3546 600 3546 Z' fill='rgba(100,100,0,0.2)'/>"
      cid_hex = ( glyph.codePointAt 0 ).toString 16
      push    = Math.floor x + 500
      R      += "<text class='cidx' x='#{push}' y='4296'>#{cid_hex}</text>"
    #.......................................................................................................
    x += advance_x
  #.........................................................................................................
  R          += "</svg>"
  return R


############################################################################################################
if module is require.main then do =>
  @serve()








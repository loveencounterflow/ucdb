
'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'UCDB'
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
require                   '../exception-handler'
PD                        = require 'pipedreams'
{ $
  $async
  $watch
  $show  }                = PD.export()
#...........................................................................................................
TIMER                     = require '../timer'
TEMPLATES                 = require './templates'
#...........................................................................................................
Koa                       = require 'koa'
HTTP                      = require 'http'
root_router               = ( new require 'koa-router' )()
serve                     = require 'koa-static'
#...........................................................................................................
O                         = {}
do =>
  O.port        = 8080
  O.db_path     = db_path = project_abspath '../benchmarks/assets/ucdb/ucdb.db'
  O.ucdb        = ( require '../..' ).new_ucdb { db_path, }


#-----------------------------------------------------------------------------------------------------------
@serve = ->
  app     = new Koa()
  server  = HTTP.createServer app.callback()
  server.listen O.port
  info "Server listening to http://localhost:#{O.port}"

  root_router.get 'root',         '/',                  @$root()
  root_router.get 'dump',         '/dump',              @$dump()
  # root_router.get 'svg_bare',     '/svg',               @$svg_bare()
  # root_router.get 'svg_glyph',    '/svg/glyph/:glyph',  @$svg_glyph()
  root_router.get 'svg_cid',      '/svg/cid/:cid',      @$svg_cid()
  app
    .use $time_request()
    .use $echo()
    .use root_router.routes()
    .use serve project_abspath './public'
    .use root_router.allowedMethods()
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
  info CND.grey ctx.request.URL.href
  await next()
  return null


#===========================================================================================================
# ENDPOINTS
#-----------------------------------------------------------------------------------------------------------
@$root = => ( ctx ) =>
  ctx.type = 'html'
  ### TAINT should cache ###
  ctx.body = TEMPLATES.minimal()
  return null

#-----------------------------------------------------------------------------------------------------------
@$dump = => ( ctx ) =>
  # ctx.type = 'html'
  rows = [ O.ucdb.db.read_lines()..., ]
  rows = ( row.glyph for row in rows when row.cid > 0x20 ).join ''
    # debug '^4443^', row
  ctx.body = rows
  return null

#-----------------------------------------------------------------------------------------------------------
@$svg_cid = => ( ctx ) =>
  try
    cid = cid_from_cid_txt ctx.params.cid
  catch error
    ### TAINT use API to emit HTTP error ###
    href      = ctx.request.URL.href
    ctx.type  = '.txt'
    ctx.body  = "not a valid request: #{href}"
    warn '^ucdb/server@449879^', "when trying to respond to #{href}, an error occurred: #{error.message}"
    return null
  # ctx.body = ctx.request.URL.href + ' ' + ( cid ? 'UNKNOWN' )
  ctx.txpe = '.svg'
  ctx.body = svg_from_cid cid
  return null

#-----------------------------------------------------------------------------------------------------------
cid_from_cid_txt = ( cid_txt ) ->
  validate.nonempty_text cid_txt
  if cid_txt.startsWith '0x' then R = parseInt cid_txt[ 2 .. ], 16
  else                            R = parseInt cid_txt, 10
  return R if isa.number R
  ### TAINT use Failure ###
  throw new Error "^ucdb/server@88827 not a valid CID text: #{cid_txt}"

#-----------------------------------------------------------------------------------------------------------
svg_from_cid = ( cid ) ->
  validate.ucdb_cid cid
  pathdata = O.ucdb.db.$.single_value O.ucdb.db.default_pathdata_from_cid { cid, }
  debug '^778^', pathdata
  return pathdata


############################################################################################################
if module is require.main then do =>
  @serve()





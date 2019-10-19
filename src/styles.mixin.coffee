
'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'UCDB/MIXIN/STYLES'
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
  project_abspath }       = require './helpers'
types                     = require './types'
#...........................................................................................................
{ isa
  validate
  declare
  cast
  size_of
  last_of
  type_of }               = types
#...........................................................................................................
require                   './exception-handler'
@_styles_ivtree           = null
@_styles_cache            = {}


#-----------------------------------------------------------------------------------------------------------
sort_cid_ranges_by_nr = ( cid_ranges ) -> cid_ranges.sort ( a, b ) -> a.nr - b.nr

#-----------------------------------------------------------------------------------------------------------
@_provide_style_cache = ( me ) ->
  return null if @_styles_ivtree?
  IntervalTree      = ( require '@flatten-js/interval-tree' ).default
  @_styles_ivtree   = new IntervalTree()
  count             = 0
  #.........................................................................................................
  for d from me.db.read_configuration_rsgs_and_blocks()
    count++
    d.type  = 'block'
    d.nr    = count
    @_styles_ivtree.insert [ d.first_cid, d.last_cid, ], d
  #.........................................................................................................
  for d from me.db.read_configuration_styles_codepoints_and_fontnicks()
    count++
    d.type  = 'glyphstyle'
    d.nr    = count
    @_styles_ivtree.insert [ d.first_cid, d.last_cid, ], d
  #.........................................................................................................
  return count

#-----------------------------------------------------------------------------------------------------------
@style_from_glyph = ( me, glyph ) ->
  validate.chr glyph
  return @style_from_cid me, glyph.codePointAt 0

#-----------------------------------------------------------------------------------------------------------
@style_from_cid = ( me, cid ) ->
  validate.ucdb_cid cid
  debug '^35345^', "built style cache",   @_provide_style_cache me unless @_styles_ivtree?
  return R if ( R = @_styles_cache[ cid ] )?
  entries = @_styles_ivtree.search [ cid, cid, ]
  debug '^3237^', jr entries
  sort_cid_ranges_by_nr entries ### TAINT necessary? ###
  R       = Object.assign [], entries...
  delete R.nr
  delete R.linenr
  delete R.kanji
  delete R.range_txt
  delete R.type
  @_styles_cache[ cid ] = R
  return R


# ############################################################################################################
# if require.main is module then do =>
#   null







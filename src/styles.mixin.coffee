
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
@_styles_ivtree           = null
@_styles_cache            = {}
CS                        = require 'coffeescript'
VM                        = require 'vm'

# #-----------------------------------------------------------------------------------------------------------
# sort_cid_ranges_by_nr = ( cid_ranges ) -> cid_ranges.sort ( a, b ) -> a.nr - b.nr

#-----------------------------------------------------------------------------------------------------------
@_provide_style_cache = ( me ) ->
  throw new Error "^ucdb/styles@857^ not implemented ATM"
  # return null if @_styles_ivtree?
  # IntervalTree      = ( require '@flatten-js/interval-tree' ).default
  # @_styles_ivtree   = new IntervalTree()
  # count             = 0
  # #.........................................................................................................
  # for d from me.db.read_cfg_rsgs_and_blocks()
  #   count++
  #   d.type  = 'block'
  #   d.nr    = count
  #   @_styles_ivtree.insert [ d.first_cid, d.last_cid, ], d
  # #.........................................................................................................
  # for d from me.db.read_cfg_styles_codepoints_and_fontnicks()
  #   count++
  #   d.type        = 'glyphstyle'
  #   d.nr          = count
  #   d.glyphstyle  = @compile_style_txt me, d.glyphstyle
  #   @_styles_ivtree.insert [ d.first_cid, d.last_cid, ], d
  # #.........................................................................................................
  # return count

#-----------------------------------------------------------------------------------------------------------
@compile_style_txt = ( me, style_txt ) ->
  return null unless style_txt?
  ### TAINT should probably be done when reading configuration files ###
  return null if ( style_txt.match /^\s*#/ )?
  style_txt = "{#{style_txt}}" unless style_txt.startsWith '{'
  try
    R = VM.runInNewContext CS.compile style_txt, { bare: true, }
  catch error
    throw new Error "^ucdb/styles@8686 when trying to parse #{rpr style_txt}, an error occurred: #{error.message}"
  return R

# #-----------------------------------------------------------------------------------------------------------
# @_included_style_properties = Object.freeze [ 'fontnick', 'glyphstyle', 'icgroup', 'rsg', ]
# # @_included_style_properties = Object.freeze [ 'styletag', 'fontnick', 'glyphstyle', 'icgroup', 'rsg', ]

# #-----------------------------------------------------------------------------------------------------------
# @_delete_extraneous_style_properties = ( style ) ->
#   R         = {}
#   for key, value of style
#     continue unless key in @_included_style_properties
#     R[ key ] = value
#   return R

#-----------------------------------------------------------------------------------------------------------
@style_from_glyph = ( me, glyph ) ->
  throw new Error "^ucdb/styles@857^ not implemented ATM"
  # validate.chr glyph
  # return @style_from_cid me, glyph.codePointAt 0

#-----------------------------------------------------------------------------------------------------------
@style_from_cid = ( me, cid ) ->
  throw new Error "^ucdb/styles@857^ not implemented ATM"
  # validate.ucdb_cid cid
  # @_provide_style_cache me unless @_styles_ivtree?
  # return R if ( R = @_styles_cache[ cid ] )?
  # entries = @_styles_ivtree.search [ cid, cid, ]
  # sort_cid_ranges_by_nr entries ### TAINT necessary? ###
  # default_style   = {}
  # R               = {}
  # for entry in entries
  #   if ( stylename = entry.styletag ? '*' ) is '*'
  #     default_style = assign default_style, entry
  #   else
  #     ( R[ stylename ] ?= [] ).push entry
  # default_style   = @_delete_extraneous_style_properties default_style
  # for stylename, entries of R
  #   R[ stylename ] = @_delete_extraneous_style_properties assign default_style, R[ stylename ]...
  # @_styles_cache[ cid ] = R
  # return R


# ############################################################################################################
# if require.main is module then do =>
#   null







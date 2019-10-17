
'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'UCDB-DEV'
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
{ cwd_abspath
  cwd_relpath
  here_abspath
  _drop_extension
  project_abspath }       = require './helpers'
types                     = require './types'
#...........................................................................................................
{ isa
  validate
  type_of }               = types
#...........................................................................................................
glob                      = require 'glob'
require                   './exception-handler'
MIRAGE                    = require 'sqlite-file-mirror'

#-----------------------------------------------------------------------------------------------------------
@_add_sources = ( me ) ->
  ### TAINT derive table name from filename ###
  ### TAINT avoid repetition, implement method to overwrite (SQL drop, create if (not) exists) ###
  #.........................................................................................................
  MIRAGE.drop_source  me.mirage,  'configuration_fontnick_and_false_fallbacks'
  MIRAGE.add_source   me.mirage,
    name:                         'configuration_fontnick_and_false_fallbacks'
    path:       project_abspath   'configuration/fontnick-and-false-fallbacks.txt'
    fields: [
      { name: 'linenr',   type: 'integer', null:  false,  }
      { name: 'fontnick', type: 'text',    null:  false,  }
      { name: 'probe',    type: 'text',    null:  false,  }
      ]
    format:     'wsv'
  #.........................................................................................................
  MIRAGE.drop_source  me.mirage,  'configuration_rsgs_and_blocks'
  MIRAGE.add_source   me.mirage,
    name:                         'configuration_rsgs_and_blocks'
    path:       project_abspath   'configuration/rsgs-and-blocks.txt'
    fields: [
      { name: 'linenr',     type: 'integer',  null: false,  }
      { name: 'icgroup',    type: 'text',     null: false,  }
      { name: 'rsg',        type: 'text',     null: true,   }
      { name: 'kanji',      type: 'boolean',  null: false,  }
      { name: 'range',      type: 'text',     null: false,  }
      { name: 'blockname',  type: 'text',     null: false,  }
      ]
    format:     'wsv'
  #.........................................................................................................
  MIRAGE.drop_source  me.mirage,  'configuration_fontnicks_filenames_and_otf_features'
  MIRAGE.add_source   me.mirage,
    name:                         'configuration_fontnicks_filenames_and_otf_features'
    path:       project_abspath   'configuration/fontnicks-filenames-and-otf-features.txt'
    fields: [
      { name: 'linenr',   type: 'integer', null:  false,                }
      { name: 'fontnick', type: 'text',    null:  false,                }
      { name: 'filename', type: 'text',    null:  false,                }
      { name: 'otf',      type: 'text',    null:  true,  default: null, }
      ]
    format:     'wsv'
  #.........................................................................................................
  MIRAGE.drop_source  me.mirage,  'configuration_styles_codepoints_and_fontnicks'
  MIRAGE.add_source   me.mirage,
    name:                         'configuration_styles_codepoints_and_fontnicks'
    path:       project_abspath   'configuration/styles-codepoints-and-fontnicks.txt'
    fields: [
      { name: 'linenr',     type: 'integer', null:  false,                }
      { name: 'styletag',   type: 'text',    null:  false,                }
      { name: 'ranges',     type: 'text',    null:  false,                }
      { name: 'fontnick',   type: 'text',    null:  false,                }
      { name: 'glyphstyle', type: 'text',    null:  true, default: null,  }
      ]
    format:     'wsv'
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@read_configuration = ( me ) ->
  me.mirage = MIRAGE.new_mirror me.db.$.db
  @_add_sources me
  await MIRAGE.refresh me.mirage
  return null

#-----------------------------------------------------------------------------------------------------------
@_cidrange_from_rsg = ( rsg ) -> return { first_cid: 111, last_cid: 111, }

#-----------------------------------------------------------------------------------------------------------
@_cidrange_from_text_with_rsgs = ( range_txt ) ->
  return @_cidrange_from_rsg range_txt.replace /^rsg:/, '' if range_txt.startsWith 'rsg:'
  return @_cidrange_from_text_without_rsgs range_txt

#-----------------------------------------------------------------------------------------------------------
@_cidrange_from_text_without_rsgs = ( range_txt ) ->
  unless ( R = @_optional_cidrange_from_text_without_rsgs range_txt )?
    throw new Error "^ucdb/cfg@3388 unknown format for field 'ranges': #{rpr range_txt}"
  validate.ucdb_cid R.first_cid
  validate.ucdb_cid R.last_cid
  return R

#-----------------------------------------------------------------------------------------------------------
@_optional_cidrange_from_text_without_rsgs = ( range_txt ) ->
  ### TAINT consider doing this in types/`cast` ###
  ### Given a text, try to interpret it as a CID range, considering the following alternatives:
    * an `*` (asterisk), indicating all codepoints;
    * a character literal like `'字'` or `'x'`, indicated by single quotes;
    * a hexadecimal CID, indicated by a leading `0x`, or
    * a hexadecimal CID range of the form `0x000..0x999` (with two dots).
    A `null` is returned in case none of the above is applicable.
  ###
  first_cid = null
  last_cid  = null
  #.........................................................................................................
  if range_txt is "*"
    ### any codepoint: ###
    first_cid = 0x000020
    last_cid  = 0x10ffff
  #.........................................................................................................
  else if range_txt.startsWith "'"
    ### character literal: ###
    glyph = range_txt.replace /// ^ ' ( . ) ' ///us, '$1'
    validate.chr glyph
    first_cid = glyph.codePointAt 0
  #.........................................................................................................
  else if range_txt.startsWith '0x'
    if ( cids_hex = range_txt.split '..' ).length is 2
      ### hexadecimal CID range of the form `0x000..0x999` (with two dots) ###
      first_cid = parseInt cids_hex[ 0 ][ 2 .. ], 16
      last_cid  = parseInt cids_hex[ 1 ][ 2 .. ], 16
    else
      ### hexadecimal CID, indicated by a leading `0x` ###
      first_cid = parseInt range_txt[ 2 .. ], 16
  #.........................................................................................................
  else
    return null
  #.........................................................................................................
  last_cid ?= first_cid
  return { first_cid, last_cid, }

#-----------------------------------------------------------------------------------------------------------
@compile_configurations = ( me ) ->
  me.db.prepare_configuration_tables()
  #.........................................................................................................
  for row from me.dbr.read_configuration_rsgs_and_blocks()
    { linenr, }               = row
    { first_cid, last_cid, }  = @_cidrange_from_text_without_rsgs row.range_txt
    me.dbw.update_configuration_rsgs_and_blocks { linenr, first_cid, last_cid, }
  #.........................................................................................................
  for row from me.db.read_configuration_styles_codepoints_and_fontnicks()
    { linenr, }               = row
    { first_cid, last_cid, }  = @_cidrange_from_text_with_rsgs row.range_txt
    me.dbw.update_configuration_styles_codepoints_and_fontnicks { linenr, first_cid, last_cid, }
  #.........................................................................................................
  me.db.finalize_configuration_tables()






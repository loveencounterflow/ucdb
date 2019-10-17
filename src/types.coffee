


'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'MKTS-MIRAGE/TYPES'
debug                     = CND.get_logger 'debug',     badge
intertype                 = new ( require 'intertype' ).Intertype module.exports

#-----------------------------------------------------------------------------------------------------------
@declare 'ucdb_clean_filename',
  ###
  acc. to https://github.com/parshap/node-sanitize-filename:
    Control characters (0x00–0x1f and 0x80–0x9f)
    Reserved characters (/, ?, <, >, \, :, *, |, and ")
    Unix reserved filenames (. and ..)
    Trailing periods and spaces (for Windows)
  ###
  tests:
    "x is a nonempty_text":                   ( x ) -> @isa.nonempty_text x
    "x does not contain control chrs":        ( x ) -> not ( x.match /[\x00-\x1f]/      )?
    "x does not contain meta chrs":           ( x ) -> not ( x.match /[\/?<>\:*|"]/     )?
    "x is not `.` or `..`":                   ( x ) -> not ( x.match /^\.{1,2}$/        )?
    "x has no whitespace":                    ( x ) -> not ( x.match /\s/               )?

#-----------------------------------------------------------------------------------------------------------
@declare 'ucdb_settings',
  tests:
    "x is a object":                          ( x ) -> @isa.object              x
    "x.db_path is a nonempty_text":           ( x ) -> @isa.nonempty_text       x.db_path
    "x.icql_path is a nonempty_text":         ( x ) -> @isa.nonempty_text       x.icql_path

#-----------------------------------------------------------------------------------------------------------
@declare 'ucdb_web_layout_SLUG_settings',
  tests:
    "x is a object":                          ( x ) -> @isa.object              x
    "x.missing is 'drop'":                    ( x ) -> x.missing is 'drop'

#-----------------------------------------------------------------------------------------------------------
@declare 'ucdb_cid',
  tests:
    "x is an integer":                        ( x ) -> @isa.integer x
    "x is between 0x20 and 0x10ffff":         ( x ) -> 0x0 <= x <= 0x10ffff

#-----------------------------------------------------------------------------------------------------------
@declare 'ucdb_cid_codepage_text',
  tests:
    "x is a text":                            ( x ) -> @isa.text x
    "x matches one to four hex digits":       ( x ) -> ( x.match /// ^ [0-9a-f]{1,4} $ ///u )?

#-----------------------------------------------------------------------------------------------------------
@declare 'ucdb_glyph',
  tests:
    "x is a text":                            ( x ) -> @isa.text x
    "x contains single codepoint":            ( x ) -> ( x.match ///^.$///u )?

#-----------------------------------------------------------------------------------------------------------
@declare 'nonnegative_integer',             ( x ) => ( Number.isInteger x ) and x >= 0

#-----------------------------------------------------------------------------------------------------------
### TAINT experimental ###
L = @
@cast =

  #---------------------------------------------------------------------------------------------------------
  iterator: ( x ) ->
    switch ( type = L.type_of x )
      when 'generator'          then return x
      when 'generatorfunction'  then return x()
      when 'list'               then return ( -> y for y in x )()
    throw new Error "^ucdb/types@3422 unable to cast a #{type} as iterator"

  #---------------------------------------------------------------------------------------------------------
  hex: ( x ) ->
    L.validate.nonnegative_integer x
    return '0x' + x.toString 16

  #---------------------------------------------------------------------------------------------------------
  ucdb_cid_codepage_number: ( x ) ->
    L.validate.ucdb_cid_codepage_text x
    return parseInt x + '00', 16


#     "x.file_path is a ?nonempty text":        ( x ) -> ( not x.file_path?   ) or @isa.nonempty_text x.file_path
#     "x.text is a ?text":                      ( x ) -> ( not x.text?        ) or @isa.text          x.text
#     "x.file_path? xor x.text?":               ( x ) ->
#       ( ( x.text? ) or ( x.file_path? ) ) and not ( ( x.text? ) and ( x.file_path? ) )
#     "x.db_path is a ?nonempty text":          ( x ) -> ( not x.db_path?     ) or @isa.nonempty_text x.db_path
#     "x.icql_path is a ?nonempty text":        ( x ) -> ( not x.icql_path?   ) or @isa.nonempty_text x.icql_path
#     "x.default_key is a ?nonempty text":      ( x ) -> ( not x.default_key? ) or @isa.nonempty_text x.default_key

# #-----------------------------------------------------------------------------------------------------------
# @declare 'mirage_main_row',
#   tests:
#     "x has key 'key'":                        ( x ) -> @has_key             x, 'key'
#     "x has key 'vnr'":                        ( x ) -> @has_key             x, 'vnr'
#     "x has key 'text'":                       ( x ) -> @has_key             x, 'text'
#     "x.key is a nonempty text":               ( x ) -> @isa.nonempty_text   x.key
#     "x.vnr is a list":                        ( x ) -> @isa.list            x.vnr
#     # "x.vnr starts, ends with '[]'":           ( x ) -> ( x.vnr.match /^\[.*\]$/ )?
#     # "x.vnr is a JSON array of integers":      ( x ) ->
#     #   lst = JSON.parse x.vnr
#     #   return false unless @isa.list lst
#     #   return lst.every ( xx ) => @isa.integer xx

# #-----------------------------------------------------------------------------------------------------------
# @declare 'true', ( x ) -> x is true


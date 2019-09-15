

'use strict'



############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'UCDB/HELPERS'
log                       = CND.get_logger 'plain',     badge
debug                     = CND.get_logger 'debug',     badge
info                      = CND.get_logger 'info',      badge
warn                      = CND.get_logger 'warn',      badge
alert                     = CND.get_logger 'alert',     badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
#...........................................................................................................
@cwd_abspath              = CND.cwd_abspath.bind  CND
@cwd_relpath              = CND.cwd_relpath.bind  CND
@here_abspath             = CND.here_abspath.bind CND
@_drop_extension          = ( path ) -> path[ ... path.length - ( PATH.extname path ).length ]
@project_abspath          = ( ( P... ) -> @here_abspath __dirname, '..', P... ).bind @
PATH                      = require 'path'
FS                        = require 'fs'

#-----------------------------------------------------------------------------------------------------------
@load_configuration = ->
  return Object.assign ( x.settings for x in @_load_configurations_from_standard_locations() )...

#-----------------------------------------------------------------------------------------------------------
@_load_configurations_from_standard_locations = ->
  home  = start_home = @project_abspath()
  R     = []
  loop
    break if home is '/'
    path = PATH.resolve PATH.join home, 'ucdb.json'
    try
      R.push { path, settings: ( require path ), }
    catch error
      throw error unless error.code is 'MODULE_NOT_FOUND'
    home = PATH.dirname home
  if R.length is 0
    throw new Error "^ucdb#2201 unable to locate file ucdb.json in any parent directory of #{start_home}"
  return R

#-----------------------------------------------------------------------------------------------------------
@_get_user_home = -> PATH.abspath ( require 'os' ).homedir()

# debug @load_configuration()
# debug ( k for k of require.main)
# debug require.main.filename
# debug ( require 'app-root-path' ).path
# debug ( require 'os' ).homedir()

# PATH                      = require 'path'
# #...........................................................................................................
# @assign                   = Object.assign


# info @here_abspath  '/foo/bar', '/baz/coo'
# info @cwd_abspath   '/foo/bar', '/baz/coo'
# info @here_abspath  '/baz/coo'
# info @cwd_abspath   '/baz/coo'
# info @here_abspath  '/foo/bar', 'baz/coo'
# info @cwd_abspath   '/foo/bar', 'baz/coo'
# info @here_abspath  'baz/coo'
# info @cwd_abspath   'baz/coo'
# info @here_abspath  __dirname, 'baz/coo', 'x.js'


#-----------------------------------------------------------------------------------------------------------
@walk_cids_in_cid_range = ( range ) =>
  ### TAINT this method should conceivably be in a type casting module ###
  return ( -> yield chr.codePointAt 0 for chr in [ range... ]                 )() if isa.text range
  ### TAINT do some type checking (must be list of two CIDs) ###
  return ( -> yield cid               for cid in [ range[ 0 ] .. range[ 1 ] ] )()


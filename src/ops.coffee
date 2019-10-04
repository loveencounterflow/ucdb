
'use strict'



############################################################################################################
debug                     = console.log
alert                     = console.log
whisper                   = console.log
warn                      = console.log
help                      = console.log
urge                      = console.log
info                      = console.log
log                       = console.log

# CND                       = require 'cnd'
# rpr                       = CND.rpr
# badge                     = '明快打字机/OPS'
# debug                     = CND.get_logger 'debug',     badge
# # alert                     = CND.get_logger 'alert',     badge
# # whisper                   = CND.get_logger 'whisper',   badge
# # warn                      = CND.get_logger 'warn',      badge
# help                      = CND.get_logger 'help',      badge
# # urge                      = CND.get_logger 'urge',      badge
# # info                      = CND.get_logger 'info',      badge
# # inspect                   = ( require 'util' ).inspect
# # # TRAP                      = require 'mousetrap'
# # KEYS                      = require '../lib/keys'
# # T                         = require '../lib/templates'
# PATH                      = require 'path'
# FS                        = require 'fs'
# #...........................................................................................................
# require                   '../lib/exception-handler'
# # global.S                  = require '../lib/settings' ### global configuration and editor state object ###
# global.OPS                = {}


# ############################################################################################################
# # Assemble On-Page Script from its modules:
# path  = PATH.resolve PATH.join __dirname, '../lib/'
# for module_name in FS.readdirSync path
#   continue unless module_name.endsWith    '.js'
#   continue unless module_name.startsWith  'ops-'
#   help "µ44744 loading #{module_name}"
#   for key, value of require PATH.join '../lib', module_name
#     throw new Error "name collision in module #{module_name}: #{rpr key}" if OPS[ key ]?
#     OPS[ key ] = value
# # debug 'µ37333', ( k for k of OPS )
# jQuery OPS.init.bind OPS

( jQuery 'document' ).ready ->
  log "^ucdb/ops@6672^ helo from UCDB"
  # log '^ucdb/ops@6672^ ok', rsp.ok
  # log '^ucdb/ops@6672^ status', rsp.status
  # log '^ucdb/ops@6672^ body', ( k for k of rsp.body )
  # log '^ucdb/ops@6672^ read()', await rsp.body.getReader().read()
  # rsp       = await fetch '/svg/cid/NNNNNNNN'
  rsp       = await fetch '/svg/cid/0x4e00'
  unless rsp.ok
    log '^ucdb/ops@6672^ error', rsp.status
    return null
  pathdata  = await rsp.text()
  log '^ucdb/ops@6672^ pathdata', pathdata


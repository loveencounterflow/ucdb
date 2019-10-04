

'use strict'



############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'UCDB/TIMER'
log                       = CND.get_logger 'plain',     badge
debug                     = CND.get_logger 'debug',     badge
info                      = CND.get_logger 'info',      badge
warn                      = CND.get_logger 'warn',      badge
alert                     = CND.get_logger 'alert',     badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND



#-----------------------------------------------------------------------------------------------------------
@time_now = =>
  t = process.hrtime()
  return BigInt "#{t[ 0 ]}" + "#{t[ 1 ]}".padStart 9, '0'

#-----------------------------------------------------------------------------------------------------------
@stopwatch_sync = ( f ) =>
  ### return time needed to call `f()` synchronously, in milliseconds ###
  t0ns = @time_now()
  f()
  t1ns = @time_now()
  return ( parseInt t1ns - t0ns, 10 ) / 1e6

#-----------------------------------------------------------------------------------------------------------
@stopwatch_async = ( f ) =>
  ### return time needed to call `f()` asynchronously, in milliseconds ###
  t0ns = @time_now()
  await f()
  t1ns = @time_now()
  return ( parseInt t1ns - t0ns, 10 ) / 1e6



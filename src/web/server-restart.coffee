



############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'UCDB/WEB/SERVER-RESTART'
debug                     = CND.get_logger 'debug',     badge
alert                     = CND.get_logger 'alert',     badge
whisper                   = CND.get_logger 'whisper',   badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
info                      = CND.get_logger 'info',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
INotifyWait               = require 'inotifywait'
NOTIFIER                  = require 'node-notifier'
respawn                   = require 'respawn'
{ project_abspath, }      = require '../helpers'
sleep                     = ( dts ) -> new Promise ( done ) => setTimeout done, dts * 1000


#-----------------------------------------------------------------------------------------------------------
settings =
  command:            [ 'lib/web/server.js', ],
  name:               'ucdb'              # set monitor name
  env:                { name: 'value', }  # set env vars
  cwd:                '.'                 # set cwd
  maxRestarts:        -1                  # how many restarts are allowed within 60s or -1 for infinite restarts
  sleep:              100                 # time to sleep between restarts,
  kill:               30000               # wait 30s before force killing after stopping
  # stdio:              [...]               # forward stdio options
  fork:               true                # fork instead of spawn


############################################################################################################
monitor = respawn settings


monitor.on 'crash',  ( data ) -> urge 'crash',  "The monitor has crashed (too many restarts or spawn error)."
monitor.on 'exit',   ( code, signal) ->
  urge 'exit',   "( code: #{rpr code}, signal: #{rpr signal} ) child process has exited"
  # process.exit 1
  if code > 100
    debug '34474', 'aborting'
    monitor.stop()
    process.exit code
  return null
monitor.on 'sleep',  ( data ) -> whisper 'sleep',  "monitor is sleeping"
monitor.on 'spawn',  ( data ) -> whisper 'spawn',  "New child process has been spawned"
monitor.on 'start',  ( data ) -> whisper 'start',  "The monitor has started"
monitor.on 'stderr', ( data ) -> whisper 'stderr', "child process stderr has emitted data"; whisper data
monitor.on 'stdout', ( data ) -> whisper 'stdout', "child process stdout has emitted data"; whisper data
monitor.on 'stop',   ( data ) -> whisper 'stop',   "The monitor has fully stopped and the process is killed"
monitor.on 'warn',   ( data ) -> whisper 'warn',   "child process has emitted an error"; warn error

#.........................................................................................................
on_change = ( path ) =>
  return null unless path.endsWith '.js'
  info '^272^', "changed: #{path}"
  monitor.stop()
  await sleep 0.5
  monitor.start()

#-----------------------------------------------------------------------------------------------------------
monitor_source_changes = ->
  src_path  = project_abspath 'lib'
  settings  = recursive: true
  w         = new INotifyWait src_path, settings
  #.........................................................................................................
  w.on 'change',  ( path ) => on_change path
  w.on 'add',     ( path ) => on_change path
  w.on 'unlink',  ( path ) => on_change path
  return null


############################################################################################################
if module is require.main then do =>
  monitor.start()
  monitor_source_changes()




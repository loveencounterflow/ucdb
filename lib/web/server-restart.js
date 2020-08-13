(function() {
  //###########################################################################################################
  var ALL, CND, IN_ACCESS, IN_CLOSE, IN_CLOSE_NOWRITE, IN_CLOSE_WRITE, IN_CREATE, IN_DELETE, IN_DELETE_SELF, IN_MODIFY, IN_MOVE, IN_MOVED_FROM, IN_MOVED_TO, IN_MOVE_SELF, IN_OPEN, IN_UNMOUNT, INotifyWait, NOTIFIER, PATH, alert, badge, debug, defer, echo, exit_handler, file_watcher, help, info, on_change, process_supervisor, project_abspath, respawn, rpr, settings, sleep, urge, warn, watch_source_changes, whisper;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB/WEB/SERVER-RESTART';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  PATH = require('path');

  INotifyWait = require('inotifywait-spawn');

  NOTIFIER = require('node-notifier');

  respawn = require('respawn');

  ({project_abspath} = require('../helpers'));

  sleep = function(dts) {
    return new Promise((done) => {
      return setTimeout(done, dts * 1000);
    });
  };

  process_supervisor = null;

  file_watcher = null;

  defer = setImmediate;

  //-----------------------------------------------------------------------------------------------------------
  INotifyWait = require('inotifywait-spawn');

  ({IN_ACCESS, IN_MODIFY, IN_CLOSE_WRITE, IN_CLOSE_NOWRITE, IN_OPEN, IN_MOVED_FROM, IN_MOVED_TO, IN_CREATE, IN_DELETE, IN_DELETE_SELF, IN_MOVE_SELF, IN_UNMOUNT, IN_CLOSE, IN_MOVE} = INotifyWait); // on file access // on changes // on end writing // on end reading // on file opened // on files moved from // on files move to // on files creation (folder) // on deletion (folder) // on deletion of the watched path // when watched path is moved // on patsh unmounted // on either IN_CLOSE_WRITE or IN_CLOSE_NOWRITE // on either IN_MOVED_FROM or IN_MOVED_TO

  ALL = IN_ACCESS | IN_MODIFY | IN_CLOSE_WRITE | IN_CLOSE_NOWRITE | IN_OPEN | IN_MOVED_FROM | IN_MOVED_TO | IN_CREATE | IN_DELETE | IN_DELETE_SELF | IN_MOVE_SELF | IN_UNMOUNT | IN_CLOSE | IN_MOVE;

  //-----------------------------------------------------------------------------------------------------------
  settings = {
    respawn: {
      command: ['lib/web/server.js'],
      name: 'ucdb', // set monitor name
      env: {
        name: 'value' // set env vars
      },
      cwd: '.', // set cwd
      maxRestarts: -1, // how many restarts are allowed within 60s or -1 for infinite restarts
      sleep: 100, // time to sleep between restarts,
      kill: 30000, // wait 30s before force killing after stopping
      // stdio:              [...]               # forward stdio options
      fork: true // fork instead of spawn
    },
    inotifywait: {
      recursive: true,
      events: IN_MODIFY || IN_CREATE || IN_DELETE
    }
  };

  // events:     ALL

  //###########################################################################################################
  process_supervisor = respawn(settings.respawn);

  process_supervisor.on('crash', function(data) {
    return urge("^process_supervisor@crash^ The process_supervisor has crashed (too many restarts or spawn error).");
  });

  process_supervisor.on('exit', function(code, signal) {
    urge(`^process_supervisor@exit^ ( code: ${rpr(code)}, signal: ${rpr(signal)} ) child process has exited`);
    // process.exit 1
    if (code > 100) {
      debug('34474', 'aborting');
      process_supervisor.stop();
      process.exit(code);
    }
    return null;
  });

  process_supervisor.on('sleep', function(data) {
    return whisper("^process_supervisor@sleep^   process_supervisor is sleeping");
  });

  process_supervisor.on('spawn', function(data) {
    return whisper("^process_supervisor@spawn^   New child process has been spawned");
  });

  process_supervisor.on('start', function(data) {
    return whisper("^process_supervisor@start^   The process_supervisor has started");
  });

  process_supervisor.on('stderr', function(data) {
    whisper("^process_supervisor@stderr^  child process stderr has emitted data");
    return whisper(data);
  });

  process_supervisor.on('stdout', function(data) {
    whisper("^process_supervisor@stdout^  child process stdout has emitted data");
    return whisper(data);
  });

  process_supervisor.on('stop', function(data) {
    return whisper("^process_supervisor@stop^    The process_supervisor has fully stopped and the process is killed");
  });

  process_supervisor.on('warn', function(data) {
    whisper("^process_supervisor@warn^    child process has emitted an error");
    return warn(error);
  });

  //.........................................................................................................
  exit_handler = () => {
    return new Promise((resolve) => {
      var resolved;
      urge('^233376^', "process about to exit");
      resolved = false;
      file_watcher.stop();
      return process_supervisor.stop(function() {
        return resolve();
      });
    });
  };

  process.on('beforeExit', exit_handler);

  process.on('unhandledException', exit_handler);

  process.on('uncaughtException', exit_handler);

  //.........................................................................................................
  on_change = (cause, d) => {
    var path;
    path = PATH.join(d.path, d.entry);
    whisper('^3332^', cause, path);
    if (!path.endsWith('.js')) {
      return null;
    }
    info('^272^', `changed: ${path}`);
    process_supervisor.stop(async function() {
      await sleep(0.5);
      process_supervisor.start();
      return null;
    });
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  watch_source_changes = function() {
    var src_path;
    // src_path  = [ ( project_abspath 'lib' ), ( project_abspath 'src' ), ]
    src_path = project_abspath('lib');
    file_watcher = new INotifyWait(src_path, settings.inotifywait);
    help(`monitoring changes in ${src_path}`);
    file_watcher.on('error', (error) => {
      warn(CND.reverse(error));
      if (process_supervisor != null) {
        return process_supervisor.stop(function() {
          return process.exit(65);
        });
      } else {
        defer(function() {
          return process.exit(67);
        });
      }
      return null;
    });
    return null;
    file_watcher.on(IN_MODIFY, (d) => {
      return on_change('IN_MODIFY', d);
    });
    file_watcher.on(IN_CREATE, (d) => {
      return on_change('IN_CREATE', d);
    });
    file_watcher.on(IN_DELETE, (d) => {
      return on_change('IN_DELETE', d);
    });
    //.........................................................................................................
    return null;
  };

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      process_supervisor.start();
      return watch_source_changes();
    })();
  }

}).call(this);

//# sourceMappingURL=server-restart.js.map
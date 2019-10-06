(function() {
  //###########################################################################################################
  var CND, INotifyWait, NOTIFIER, alert, badge, debug, echo, help, info, monitor, monitor_source_changes, on_change, project_abspath, respawn, rpr, settings, sleep, urge, warn, whisper;

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
  INotifyWait = require('inotifywait');

  NOTIFIER = require('node-notifier');

  respawn = require('respawn');

  ({project_abspath} = require('../helpers'));

  sleep = function(dts) {
    return new Promise((done) => {
      return setTimeout(done, dts * 1000);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  settings = {
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
  };

  
  //###########################################################################################################
  monitor = respawn(settings);

  monitor.on('crash', function(data) {
    return urge('crash', "The monitor has crashed (too many restarts or spawn error).");
  });

  monitor.on('exit', function(code, signal) {
    urge('exit', `( code: ${rpr(code)}, signal: ${rpr(signal)} ) child process has exited`);
    // process.exit 1
    if (code > 100) {
      debug('34474', 'aborting');
      monitor.stop();
      process.exit(code);
    }
    return null;
  });

  monitor.on('sleep', function(data) {
    return whisper('sleep', "monitor is sleeping");
  });

  monitor.on('spawn', function(data) {
    return whisper('spawn', "New child process has been spawned");
  });

  monitor.on('start', function(data) {
    return whisper('start', "The monitor has started");
  });

  monitor.on('stderr', function(data) {
    whisper('stderr', "child process stderr has emitted data");
    return whisper(data);
  });

  monitor.on('stdout', function(data) {
    whisper('stdout', "child process stdout has emitted data");
    return whisper(data);
  });

  monitor.on('stop', function(data) {
    return whisper('stop', "The monitor has fully stopped and the process is killed");
  });

  monitor.on('warn', function(data) {
    whisper('warn', "child process has emitted an error");
    return warn(error);
  });

  //.........................................................................................................
  on_change = async(path) => {
    if (!path.endsWith('.js')) {
      return null;
    }
    info('^272^', `changed: ${path}`);
    monitor.stop();
    await sleep(0.5);
    return monitor.start();
  };

  //-----------------------------------------------------------------------------------------------------------
  monitor_source_changes = function() {
    var src_path, w;
    src_path = project_abspath('lib');
    settings = {
      recursive: true
    };
    w = new INotifyWait(src_path, settings);
    //.........................................................................................................
    w.on('change', (path) => {
      return on_change(path);
    });
    w.on('add', (path) => {
      return on_change(path);
    });
    w.on('unlink', (path) => {
      return on_change(path);
    });
    return null;
  };

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      monitor.start();
      return monitor_source_changes();
    })();
  }

}).call(this);

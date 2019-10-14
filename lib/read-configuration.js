(function() {
  'use strict';
  var CND, FS, FSP, MIRAGE, PATH, _drop_extension, alert, assign, badge, cwd_abspath, cwd_relpath, debug, echo, glob, help, here_abspath, info, isa, jr, log, project_abspath, rpr, type_of, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB-DEV';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  FS = require('fs');

  FSP = FS.promises;

  PATH = require('path');

  ({assign, jr} = CND);

  ({cwd_abspath, cwd_relpath, here_abspath, _drop_extension, project_abspath} = require('./helpers'));

  types = require('./types');

  //...........................................................................................................
  ({isa, validate, type_of} = types);

  //...........................................................................................................
  glob = require('glob');

  require('./exception-handler');

  MIRAGE = require('sqlite-file-mirror');

  //-----------------------------------------------------------------------------------------------------------
  this._add_sources = function(me) {
    //.........................................................................................................
    MIRAGE.drop_source(me.mirage, 'configuration_fontnick_and_false_fallbacks');
    MIRAGE.add_source(me.mirage, {
      name: 'configuration_fontnick_and_false_fallbacks',
      path: project_abspath('configuration/fontnick-and-false-fallbacks.txt'),
      fields: [
        {
          name: 'linenr',
          type: 'integer',
          null: false
        },
        {
          name: 'fontnick',
          type: 'text',
          null: false
        },
        {
          name: 'probe',
          type: 'text',
          null: false
        }
      ],
      format: 'wsv'
    });
    //.........................................................................................................
    MIRAGE.drop_source(me.mirage, 'configuration_fontnicks_filenames_and_otf_features');
    MIRAGE.add_source(me.mirage, {
      name: 'configuration_fontnicks_filenames_and_otf_features',
      path: project_abspath('configuration/fontnicks-filenames-and-otf-features.txt'),
      fields: [
        {
          name: 'linenr',
          type: 'integer',
          null: false
        },
        {
          name: 'fontnick',
          type: 'text',
          null: false
        },
        {
          name: 'filename',
          type: 'text',
          null: false
        },
        {
          name: 'otf',
          type: 'text',
          null: true,
          default: null
        }
      ],
      format: 'wsv'
    });
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.read_configuration = async function(me) {
    me.mirage = MIRAGE.new_mirror(me.db.$.db);
    this._add_sources(me);
    await MIRAGE.refresh(me.mirage);
    // db_path               = project_abspath 'assets/ucdb/ucdb.db'
    // ucdb                  = UCDB.new_ucdb { db_path, }
    // configuration_pattern = project_abspath 'configuration/**/*.txt'
    // configuration_paths   = glob.sync configuration_pattern
    // sql   = "select * from configuration_fontnick_and_false_fallbacks"
    // rows  = [ ( MIRAGE.DB.query me.mirage, sql         )...]
    // help '^33487-1^', CND.truth rows.some ( r ) -> CND.equals r, {"linenr":15,"fontnick":"thtshynpone","probe":"万"}
    // sql   = "select * from configuration_fontnicks_filenames_and_otf_features"
    // rows  = [ ( MIRAGE.DB.query me.mirage, sql )...]
    // help '^33487-2^', CND.truth rows.some ( r ) -> CND.equals r, {"linenr":180,"fontnick":"sourcesansprobolditalic","filename":"SourceSansPro-BoldItalic.ttf","otf":null}
    return null;
  };

}).call(this);

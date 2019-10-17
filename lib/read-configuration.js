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
    /* TAINT derive table name from filename */
    /* TAINT avoid repetition, implement method to overwrite (SQL drop, create if (not) exists) */
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
    MIRAGE.drop_source(me.mirage, 'configuration_rsgs_and_blocks');
    MIRAGE.add_source(me.mirage, {
      name: 'configuration_rsgs_and_blocks',
      path: project_abspath('configuration/rsgs-and-blocks.txt'),
      fields: [
        {
          name: 'linenr',
          type: 'integer',
          null: false
        },
        {
          name: 'icgroup',
          type: 'text',
          null: false
        },
        {
          name: 'rsg',
          type: 'text',
          null: true
        },
        {
          name: 'kanji',
          type: 'boolean',
          null: false
        },
        {
          name: 'range',
          type: 'text',
          null: false
        },
        {
          name: 'blockname',
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
    MIRAGE.drop_source(me.mirage, 'configuration_styles_codepoints_and_fontnicks');
    MIRAGE.add_source(me.mirage, {
      name: 'configuration_styles_codepoints_and_fontnicks',
      path: project_abspath('configuration/styles-codepoints-and-fontnicks.txt'),
      fields: [
        {
          name: 'linenr',
          type: 'integer',
          null: false
        },
        {
          name: 'styletag',
          type: 'text',
          null: false
        },
        {
          name: 'ranges',
          type: 'text',
          null: false
        },
        {
          name: 'fontnick',
          type: 'text',
          null: false
        },
        {
          name: 'glyphstyle',
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
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.compile_configurations = function(me) {
    var cids_hex, first_cid, glyph, last_cid, ref, row;
    me.db.prepare_configuration_tables();
    ref = me.db.read_prepare_configuration_styles_codepoints_and_fontnicks();
    for (row of ref) {
      first_cid = null;
      last_cid = null;
      //.......................................................................................................
      if (row.range_txt === "*") {
        first_cid = 0x000020;
        last_cid = 0x10ffff;
      //.......................................................................................................
      } else if (row.range_txt.startsWith("rsg:")) {
        whisper('^2333^', jr(row));
        debug('^77363^', "RSG");
      //.......................................................................................................
      } else if (row.range_txt.startsWith("'")) {
        glyph = row.range_txt.replace(/^'(.)'/us, '$1');
        validate.chr(glyph);
        first_cid = glyph.codePointAt(0);
      //.......................................................................................................
      } else if (row.range_txt.startsWith('0x')) {
        if ((cids_hex = row.range_txt.split('..')).length === 2) {
          whisper('^2333^', jr(row));
          debug('^77363^', "hex CID range");
        } else {
          whisper('^2333^', jr(row));
          debug('^77363^', "hex single CID");
        }
      } else {
        //.......................................................................................................
        throw new Error(`^ucdb/cfg@3387 unknown format for field 'ranges': ${rpr(row.range_txt)}`);
      }
      //.......................................................................................................
      if (last_cid == null) {
        last_cid = first_cid;
      }
    }
    //.........................................................................................................
    return me.db.finalize_configuration_tables();
  };

}).call(this);

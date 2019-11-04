(function() {
  'use strict';
  var CND, FS, FSP, MIRAGE, PATH, _drop_extension, alert, assign, badge, cwd_abspath, cwd_relpath, debug, echo, glob, help, here_abspath, info, isa, jr, log, project_abspath, rpr, type_of, types, urge, validate, warn, whisper,
    splice = [].splice;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB/CONFIGURATION';

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
    MIRAGE.drop_source(me.mirage, 'cfg_fontnick_and_false_fallbacks');
    MIRAGE.add_source(me.mirage, {
      name: 'cfg_fontnick_and_false_fallbacks',
      path: project_abspath('cfg/fontnick-and-false-fallbacks.txt'),
      fields: [
        {
          name: 'linenr',
          type: 'integer',
          null: false
        },
        {
          name: 'fontnick',
          type: 'text',
          null: false,
          unique: true
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
    MIRAGE.drop_source(me.mirage, 'cfg_rsgs_and_blocks');
    MIRAGE.add_source(me.mirage, {
      name: 'cfg_rsgs_and_blocks',
      path: project_abspath('cfg/rsgs-and-blocks.txt'),
      fields: [
        {
          name: 'linenr',
          type: 'integer',
          null: false
        },
        {
          name: 'icgroup',
          type: 'text',
          null: false,
          unique: true
        },
        {
          name: 'rsg',
          type: 'text',
          null: false,
          unique: true
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
    MIRAGE.drop_source(me.mirage, 'cfg_fontnicks_and_files');
    MIRAGE.add_source(me.mirage, {
      name: 'cfg_fontnicks_and_files',
      path: project_abspath('cfg/fontnicks-and-files.txt'),
      fields: [
        {
          name: 'linenr',
          type: 'integer',
          null: false
        },
        {
          name: 'fontnick',
          type: 'text',
          null: false,
          unique: true
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
    MIRAGE.drop_source(me.mirage, 'cfg_styles_codepoints_and_fontnicks');
    MIRAGE.add_source(me.mirage, {
      name: 'cfg_styles_codepoints_and_fontnicks',
      path: project_abspath('cfg/styles-codepoints-and-fontnicks.txt'),
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
    MIRAGE.drop_source(me.mirage, 'cfg_glyphsets');
    MIRAGE.add_source(me.mirage, {
      name: 'cfg_glyphsets',
      path: project_abspath('cfg/glyphsets.txt'),
      fields: [
        {
          name: 'linenr',
          type: 'integer',
          null: false
        },
        {
          name: 'setname',
          type: 'text',
          null: false
        },
        {
          name: 'glyphs',
          type: 'text',
          null: false
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
  this._cidrange_from_rsg = function(me, rsg) {
    var rows;
    if ((rows = [...(me.db.cidrange_from_rsg({rsg}))]).length !== 1) {
      throw new Error(`^ucdb/cfg@2282 unknown RSG ${rpr(rsg)}`);
    }
    return rows[0];
  };

  //-----------------------------------------------------------------------------------------------------------
  this._cidrange_from_text_with_rsgs = function(me, range_txt) {
    if (range_txt.startsWith('rsg:')) {
      return this._cidrange_from_rsg(me, range_txt.replace(/^rsg:/, ''));
    }
    return this._cidrange_from_text_without_rsgs(me, range_txt);
  };

  //-----------------------------------------------------------------------------------------------------------
  this._cidrange_from_text_without_rsgs = function(me, range_txt) {
    var R;
    if ((R = this._optional_cidrange_from_text_without_rsgs(range_txt)) == null) {
      throw new Error(`^ucdb/cfg@3388 unknown format for field 'ranges': ${rpr(range_txt)}`);
    }
    validate.ucdb_cid(R.first_cid);
    validate.ucdb_cid(R.last_cid);
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._optional_cidrange_from_text_without_rsgs = function(range_txt) {
    /* TAINT consider doing this in types/`cast` */
    /* Given a text, try to interpret it as a CID range, considering the following alternatives:
      * an `*` (asterisk), indicating all codepoints;
      * a character literal like `'字'` or `'x'`, indicated by single quotes;
      * a hexadecimal CID, indicated by a leading `0x`, or
      * a hexadecimal CID range of the form `0x000..0x999` (with two dots).
      A `null` is returned in case none of the above is applicable.
     */
    /* character literal: */
    var cids_hex, first_cid, glyph, last_cid;
    first_cid = null;
    last_cid = null;
    //.........................................................................................................
    if (range_txt === "*") {
      /* any codepoint: */
      first_cid = 0x000020;
      last_cid = 0x10ffff;
    //.........................................................................................................
    } else if (range_txt.startsWith("'")) {
      glyph = range_txt.replace(/^'(.)'/us, '$1');
      validate.chr(glyph);
      first_cid = glyph.codePointAt(0);
    //.........................................................................................................
    } else if (range_txt.startsWith('0x')) {
      if ((cids_hex = range_txt.split('..')).length === 2) {
        /* hexadecimal CID range of the form `0x000..0x999` (with two dots) */
        first_cid = parseInt(cids_hex[0].slice(2), 16);
        last_cid = parseInt(cids_hex[1].slice(2), 16);
      } else {
        /* hexadecimal CID, indicated by a leading `0x` */
        first_cid = parseInt(range_txt.slice(2), 16);
      }
    } else {
      //.........................................................................................................
      return null;
    }
    //.........................................................................................................
    if (last_cid == null) {
      last_cid = first_cid;
    }
    return {first_cid, last_cid};
  };

  //-----------------------------------------------------------------------------------------------------------
  this.compile_glyphsets_configuration = function(me) {
    var cid_pattern, cid_range_pattern, error, glyphs, glyphs_prv, linenr, ref, row, setname;
    info('^ucdb/cfg@8873^', "compiling glyphsets configuration table");
    try {
      //.......................................................................................................
      //.........................................................................................................
      cid_pattern = /\[0x(?<cid>[0-9a-f]+)\]/gu;
      cid_range_pattern = /\[0x(?<first_cid>[0-9a-f]+)\.\.0x(?<last_cid>[0-9a-f]+)\]/gu;
      ref = me.db.read_cfg_glyphsets();
      for (row of ref) {
        ({linenr, setname, glyphs} = row);
        glyphs_prv = glyphs;
        glyphs = glyphs.replace(/\x20/g, '');
        //.....................................................................................................
        glyphs = glyphs.replace(cid_pattern, function(..._) {
          var cid, groups, ref1;
          ref1 = _, [..._] = ref1, [groups] = splice.call(_, -1);
          cid = parseInt(groups.cid, 16);
          return String.fromCodePoint(cid);
        });
        //.....................................................................................................
        glyphs = glyphs.replace(cid_range_pattern, function(..._) {
          var cid, first_cid, groups, last_cid, ref1;
          ref1 = _, [..._] = ref1, [groups] = splice.call(_, -1);
          first_cid = parseInt(groups.first_cid, 16);
          last_cid = parseInt(groups.last_cid, 16);
          return ((function() {
            var i, ref2, ref3, results;
            results = [];
            for (cid = i = ref2 = first_cid, ref3 = last_cid; (ref2 <= ref3 ? i <= ref3 : i >= ref3); cid = ref2 <= ref3 ? ++i : --i) {
              results.push(String.fromCodePoint(cid));
            }
            return results;
          })()).join('');
        });
        //.....................................................................................................
        if (glyphs_prv !== glyphs) {
          me.dbw.update_cfg_glyphsets({linenr, setname, glyphs});
        }
      }
    } catch (error1) {
      //.........................................................................................................
      error = error1;
      throw new Error(`^ucdb/cfg@7631^ when trying to compile row\n${jr(row)}\nfrom configuration, an error occurred: ${error.message}`);
    }
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.compile_configurations = function(me) {
    var error, first_cid, glyphstyle, glyphstyle_glyph, glyphstyle_push, glyphstyle_raise, glyphstyle_scale, last_cid, linenr, ref, ref1, ref2, ref3, ref4, ref5, row;
    info('^ucdb/cfg@8873^', "compiling configuration tables");
    me.db.prepare_cfg_tables();
    try {
      ref = me.dbr.read_cfg_rsgs_and_blocks();
      //.......................................................................................................
      //.........................................................................................................
      for (row of ref) {
        ({linenr} = row);
        ({first_cid, last_cid} = this._cidrange_from_text_without_rsgs(me, row.range_txt));
        me.dbw.update_cfg_rsgs_and_blocks({linenr, first_cid, last_cid});
      }
      ref1 = me.db.read_cfg_styles_codepoints_and_fontnicks();
      //.......................................................................................................
      for (row of ref1) {
        ({linenr} = row);
        ({first_cid, last_cid} = this._cidrange_from_text_with_rsgs(me, row.range_txt));
        /* first check for there being a glyphstyle at all, second check b/c might in fact just be a comment: */
        if ((row.glyphstyle != null) && ((glyphstyle = this.compile_style_txt(me, row.glyphstyle)) != null)) {
          glyphstyle_glyph = (ref2 = glyphstyle.glyph) != null ? ref2 : null;
          glyphstyle_push = (ref3 = glyphstyle.push) != null ? ref3 : null;
          glyphstyle_raise = (ref4 = glyphstyle.raise) != null ? ref4 : null;
          glyphstyle_scale = (ref5 = glyphstyle.scale) != null ? ref5 : null;
          me.dbw.update_cfg_styles_codepoints_and_fontnicks({linenr, first_cid, last_cid, glyphstyle_glyph, glyphstyle_push, glyphstyle_raise, glyphstyle_scale});
        } else {
          me.dbw.update_cfg_styles_codepoints_and_fontnicks({linenr, first_cid, last_cid});
        }
      }
    } catch (error1) {
      //.........................................................................................................
      error = error1;
      throw new Error(`^ucdb/cfg@7632^ when trying to compile row\n${jr(row)}\nfrom configuration, an error occurred: ${error.message}`);
    }
    //.........................................................................................................
    return me.db.finalize_cfg_tables();
  };

}).call(this);

(function() {
  'use strict';
  var CND, FS, FSP, PATH, _drop_extension, alert, assign, badge, cast, cwd_abspath, cwd_relpath, debug, declare, echo, help, here_abspath, info, isa, jr, last_of, log, project_abspath, rpr, size_of, sort_cid_ranges_by_nr, type_of, types, urge, validate, walk_cids_in_cid_range, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB/MIXIN/STYLES';

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

  ({walk_cids_in_cid_range, cwd_abspath, cwd_relpath, here_abspath, _drop_extension, project_abspath} = require('./helpers'));

  types = require('./types');

  //...........................................................................................................
  ({isa, validate, declare, cast, size_of, last_of, type_of} = types);

  //...........................................................................................................
  require('./exception-handler');

  this._styles_ivtree = null;

  this._styles_cache = {};

  //-----------------------------------------------------------------------------------------------------------
  sort_cid_ranges_by_nr = function(cid_ranges) {
    return cid_ranges.sort(function(a, b) {
      return a.nr - b.nr;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this._provide_style_cache = function(me) {
    var IntervalTree, count, d, ref, ref1;
    if (this._styles_ivtree != null) {
      return null;
    }
    IntervalTree = (require('@flatten-js/interval-tree')).default;
    this._styles_ivtree = new IntervalTree();
    count = 0;
    ref = me.db.read_configuration_rsgs_and_blocks();
    //.........................................................................................................
    for (d of ref) {
      count++;
      d.type = 'block';
      d.nr = count;
      this._styles_ivtree.insert([d.first_cid, d.last_cid], d);
    }
    ref1 = me.db.read_configuration_styles_codepoints_and_fontnicks();
    //.........................................................................................................
    for (d of ref1) {
      count++;
      d.type = 'glyphstyle';
      d.nr = count;
      this._styles_ivtree.insert([d.first_cid, d.last_cid], d);
    }
    //.........................................................................................................
    return count;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.style_from_glyph = function(me, glyph) {
    validate.chr(glyph);
    return this.style_from_cid(me, glyph.codePointAt(0));
  };

  //-----------------------------------------------------------------------------------------------------------
  this.style_from_cid = function(me, cid) {
    var R/* TAINT necessary? */, entries;
    validate.ucdb_cid(cid);
    if (this._styles_ivtree == null) {
      debug('^35345^', "built style cache", this._provide_style_cache(me));
    }
    if ((R = this._styles_cache[cid]) != null) {
      return R;
    }
    entries = this._styles_ivtree.search([cid, cid]);
    debug('^3237^', jr(entries));
    sort_cid_ranges_by_nr(entries);
    R = Object.assign([], ...entries);
    delete R.nr;
    delete R.linenr;
    delete R.kanji;
    delete R.range_txt;
    delete R.type;
    this._styles_cache[cid] = R;
    return R;
  };

  // ############################################################################################################
// if require.main is module then do =>
//   null

}).call(this);

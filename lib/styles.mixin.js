(function() {
  'use strict';
  var CND, CS, FS, FSP, PATH, VM, _drop_extension, alert, assign, badge, cast, cwd_abspath, cwd_relpath, debug, declare, echo, help, here_abspath, info, isa, jr, last_of, log, project_abspath, rpr, size_of, sort_cid_ranges_by_nr, type_of, types, urge, validate, walk_cids_in_cid_range, warn, whisper,
    indexOf = [].indexOf;

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

  CS = require('coffeescript');

  VM = require('vm');

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
    ref = me.db.read_cfg_rsgs_and_blocks();
    //.........................................................................................................
    for (d of ref) {
      count++;
      d.type = 'block';
      d.nr = count;
      this._styles_ivtree.insert([d.first_cid, d.last_cid], d);
    }
    ref1 = me.db.read_cfg_styles_codepoints_and_fontnicks();
    //.........................................................................................................
    for (d of ref1) {
      count++;
      d.type = 'glyphstyle';
      d.nr = count;
      d.glyphstyle = this._compile_style_txt(d.glyphstyle);
      this._styles_ivtree.insert([d.first_cid, d.last_cid], d);
    }
    //.........................................................................................................
    return count;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._compile_style_txt = function(style_txt) {
    var R, error;
    if (style_txt == null) {
      return null;
    }
    if ((style_txt.match(/^\s*#/)) != null) {
      /* TAINT should probably be done when reading configuration files */
      return null;
    }
    if (!style_txt.startsWith('{')) {
      style_txt = `{${style_txt}}`;
    }
    try {
      R = VM.runInNewContext(CS.compile(style_txt, {
        bare: true
      }));
    } catch (error1) {
      error = error1;
      throw new Error(`^ucdb/styles@8686 when trying to parse ${rpr(style_txt)}, an error occurred: ${error.message}`);
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._included_style_properties = Object.freeze(['fontnick', 'glyphstyle', 'icgroup', 'rsg']);

  // @_included_style_properties = Object.freeze [ 'styletag', 'fontnick', 'glyphstyle', 'icgroup', 'rsg', ]

  //-----------------------------------------------------------------------------------------------------------
  this._delete_extraneous_style_properties = function(style) {
    var R, key, value;
    R = {};
    for (key in style) {
      value = style[key];
      if (indexOf.call(this._included_style_properties, key) < 0) {
        continue;
      }
      R[key] = value;
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.style_from_glyph = function(me, glyph) {
    validate.chr(glyph);
    return this.style_from_cid(me, glyph.codePointAt(0));
  };

  //-----------------------------------------------------------------------------------------------------------
  this.style_from_cid = function(me, cid) {
    var R, default_style/* TAINT necessary? */, entries, entry, i, len, ref, stylename;
    validate.ucdb_cid(cid);
    if (this._styles_ivtree == null) {
      this._provide_style_cache(me);
    }
    if ((R = this._styles_cache[cid]) != null) {
      return R;
    }
    entries = this._styles_ivtree.search([cid, cid]);
    sort_cid_ranges_by_nr(entries);
    default_style = {};
    R = {};
    for (i = 0, len = entries.length; i < len; i++) {
      entry = entries[i];
      if ((stylename = (ref = entry.styletag) != null ? ref : '*') === '*') {
        default_style = assign(default_style, entry);
      } else {
        (R[stylename] != null ? R[stylename] : R[stylename] = []).push(entry);
      }
    }
    default_style = this._delete_extraneous_style_properties(default_style);
    for (stylename in R) {
      entries = R[stylename];
      R[stylename] = this._delete_extraneous_style_properties(assign(default_style, ...R[stylename]));
    }
    this._styles_cache[cid] = R;
    return R;
  };

  // ############################################################################################################
// if require.main is module then do =>
//   null

}).call(this);

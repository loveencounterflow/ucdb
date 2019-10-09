(function() {
  'use strict';
  var $, $async, $show, $watch, CND, FS, FSP, MKNCR, PATH, PD, SVGTTF, _drop_extension, _glob, alert, assign, badge, cast, cid_ranges, cid_ranges_by_runmode, cwd_abspath, cwd_relpath, debug, declare, echo, glob, help, here_abspath, info, isa, jr, last_of, log, mkts_fontfiles, mkts_glyph_styles, mkts_options, project_abspath, rpr, runmode, size_of, type_of, urge, validate, walk_cids_in_cid_range, warn, whisper,
    indexOf = [].indexOf;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB';

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

  this.types = require('./types');

  //...........................................................................................................
  ({isa, validate, declare, cast, size_of, last_of, type_of} = this.types);

  //...........................................................................................................
  _glob = require('glob');

  glob = (require('util')).promisify(_glob);

  require('./exception-handler');

  PD = require('pipedreams');

  ({$, $async, $watch, $show} = PD.export());

  //...........................................................................................................
  mkts_options = require('./_TEMPORARY_options');

  mkts_glyph_styles = mkts_options.tex['glyph-styles'];

  mkts_fontfiles = mkts_options.fonts.files;

  MKNCR = require('mingkwai-ncr');

  SVGTTF = require('svgttf');

  //...........................................................................................................
  runmode = 'production';

  runmode = 'debug';

  runmode = 'debug_small';

  runmode = 'debug_cross_cjk';

  //-----------------------------------------------------------------------------------------------------------
  cid_ranges_by_runmode = {
    debug: [
      [0x00001,
      0x000ff],
      [0x03002,
      0x03002],
      [0x021bb,
      0x021bb],
      [0x03010,
      0x03010],
      [0x04df0,
      0x09fff],
      // [ 0x09fba, 0x09fba, ] # babelstonehan
      [0x0e100,
      0x0e10d],
      [0x0e10f,
      0x0e111],
      [0x20000,
      0x20006]
    ],
    debug_cross_cjk: ['𗐑一丁丂七丄丅丆万㐀㐁㐂𠀀𠀁𠀂𪜀𪜁𪜂𫝀𫝁𫝂𫠠𫠡𫠢𬺰𬺱𬺲'],
    debug_small: [
      // [ 0x00001, 0x000ff, ]
      // [ 0x04dff, 0x04eff, ]
      [0x04e00,
      0x06fff],
      // '扌亻釒钅冫牜飠'
      'ab'
    ],
    production: [
      [0x00001,
      0x000ff],
      [0x00100,
      0x0ffff],
      [
        0x1d400,
        0x1d7ff // Mathematical Alphanumeric Symbols
      ],
      [
        0x20000,
        0x2ebef // CJK Ext. B thru F
      ]
    ]
  };

  if ((cid_ranges = cid_ranges_by_runmode[runmode]) == null) {
    throw new Error(`^ucdb@1000^ unknown runmode ${rpr(runmode)}`);
  }

  //-----------------------------------------------------------------------------------------------------------
  this.read_rsgs = function(me) {
    return new Promise(function(resolve) {
      var $as_datom, $collect, path, pipeline, rsgs;
      //.........................................................................................................
      $as_datom = function() {
        var lnr;
        lnr = 0;
        return $(function(line, send) {
          var match;
          lnr++;
          if (isa.blank_text(line)) {
            return null;
          }
          if ((line.match(/^\s*#/)) != null) {
            return null;
          }
          if ((match = line.match(/^(?<new_rsg>\S+)\s+(?<old_rsg>\S+)\s+(?<block_name>.+)$/)) == null) {
            throw new Error(`^ucdb@1001^ unexpected line format in line ${lnr}`);
          }
          return send(PD.new_datom('^entry', {...match.groups, lnr}));
        });
      };
      //.........................................................................................................
      $collect = function(collector) {
        var last;
        last = Symbol('last');
        return $({last}, function(d, send) {
          if (d === last) {
            collector.new_by_old['u'] = 'u-----';
            collector.old_by_new['u-----'] = 'u';
            collector.new_by_old['jzr'] = 'jzr---';
            collector.old_by_new['jzr---'] = 'jzr';
            return send(collector);
          }
          collector.new_by_old[d.old_rsg] = d.new_rsg;
          return collector.old_by_new[d.new_rsg] = d.old_rsg;
        });
      };
      //.........................................................................................................
      // debug FS.readFileSync path
      // debug path
      path = project_abspath('../../io/mingkwai-rack/jzrds/ucdx/rsgs.txt');
      pipeline = [];
      rsgs = {
        new_by_old: {},
        old_by_new: {}
      };
      pipeline.push(PD.read_from_file(path));
      pipeline.push(PD.$split());
      pipeline.push($as_datom());
      pipeline.push($collect(rsgs));
      // pipeline.push PD.$show()
      pipeline.push(PD.$drain(function() {
        me.rsgs = rsgs;
        return resolve(null);
      }));
      return PD.pull(...pipeline);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this._get_iclabel = function(me, cid, glyph, csg, old_rsg) {
    var cid_hex, new_rsg, realm, swatch;
    if ((new_rsg = me.rsgs.new_by_old[old_rsg]) == null) {
      throw new Error(`^ucdb@1002^ unknown RSG ${rpr(old_rsg)}`);
    }
    // A:uc0---:005750:坐
    switch (csg) {
      case 'u':
        realm = 'A';
        swatch = glyph;
        break;
      case 'jzr':
        realm = 'I';
        swatch = glyph;
        break;
      case 'test':
        realm = 'X';
        swatch = glyph;
        break;
      default:
        realm = 'L';
        swatch = '�';
    }
    cid_hex = (cid.toString(16)).padStart(6, '0');
    return `${realm}:${new_rsg}:${cid_hex}:${swatch}`;
  };

  //===========================================================================================================
  // FONTNICKS
  //-----------------------------------------------------------------------------------------------------------
  this.read_fontnicks = function(me) {
    var R, entry, filename, fontnick, i, len, otf, otf_txt, ref;
    R = {};
    for (i = 0, len = mkts_fontfiles.length; i < len; i++) {
      entry = mkts_fontfiles[i];
      fontnick = this._fontnick_from_texname(entry.texname);
      filename = entry.filename;
      otf = (ref = entry.otf) != null ? ref : null;
      otf_txt = otf != null ? ` # ${otf}` : '';
      /* TAINT should collect OTF feature strings as well */
      // debug "#{fontnick}\t\t\t\t#{filename}#{otf_txt}"
      R[fontnick] = {filename};
      if (otf != null) {
        R[fontnick].otf = otf;
      }
    }
    return R;
  };

  // #-----------------------------------------------------------------------------------------------------------
  // @_filesize_from_path = ( me, filepath ) -> ( await FSP.stat filepath ).size

  //-----------------------------------------------------------------------------------------------------------
  this._build_fontcache = function(me) {
    return new Promise((resolve, reject) => {
      var R, fonts_home, globber, pattern, settings;
      /* TAINT cache data to avoid walking the tree many times, see https://github.com/isaacs/node-glob#readme */
      // validate.ucdb_clean_filename filename
      //.........................................................................................................
      fonts_home = project_abspath('.', 'font-sources');
      pattern = fonts_home + '/**/*';
      settings = {
        matchBase: true,
        follow: true,
        stat: true
      };
      R = {};
      info("^ucdb@1003^ building font cache...");
      return globber = new _glob.Glob(pattern, settings, (error, filepaths) => {
        var filename, filepath, filesize, i, len, stat;
        if (error != null) {
          return reject(error);
        }
        info(`^ucdb@1004^ found ${filepaths.length} files`);
        for (i = 0, len = filepaths.length; i < len; i++) {
          filepath = filepaths[i];
          if ((stat = globber.statCache[filepath]) == null) {
            /* TAINT stat missing file instead of throwing error */
            return reject(new Error(`^77464^ not found in statCache: ${rpr(filepath)}`));
          }
          filename = PATH.basename(filepath);
          if (R[filename] != null) {
            continue;
          }
          filesize = stat.size;
          R[filename] = {filepath, filesize};
        }
        return resolve(R);
      });
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this._describe_filename = async function(me, filename) {
    var filepath, filesize;
    filepath = (await this._locate_fontfile(me, filename));
    filesize = (await this._filesize_from_path(me, filepath));
    return {filepath, filesize};
  };

  //-----------------------------------------------------------------------------------------------------------
  this.populate_table_fontnicks = function(me) {
    return new Promise(async(resolve, reject) => {
      var cache_entry, data, filename, filepath, filesize, font_cache, fontnick, last_idx, line_count, otf, preamble, ref, row, sql;
      me.fontnicks = this.read_fontnicks(me);
      font_cache = (await this._build_fontcache(me));
      preamble = [];
      data = [];
      line_count = 0;
      preamble.push(me.db.create_table_fontnicks_first());
      ref = me.fontnicks;
      //.........................................................................................................
      for (fontnick in ref) {
        ({filename, otf} = ref[fontnick]);
        line_count++;
        if ((cache_entry = font_cache[filename]) == null) {
          warn('^4432^', `unable to find fontnick ${fontnick}, filename ${filename}`);
          continue;
        }
        ({filepath, filesize} = cache_entry);
        if (otf == null) {
          otf = null;
        }
        row = {fontnick, filename, filepath, filesize, otf};
        data.push((me.db.create_table_fontnicks_middle(row)) + ',');
      }
      if ((last_idx = data.length - 1) > -1) {
        data[last_idx] = data[last_idx].replace(/,\s*$/g, '');
      }
      //.........................................................................................................
      sql = [...preamble, ...data, ';'].join('\n');
      me.db.$.execute(sql);
      me.line_count += line_count;
      return resolve(null);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this._fontnick_from_texname = function(texname) {
    return (texname.replace('mktsFontfile', '')).toLowerCase();
  };

  //-----------------------------------------------------------------------------------------------------------
  this._fontnick_from_tex_block = function(me, tex_block) {
    var fontnick, match, ref, texstyle;
    if (tex_block == null) {
      return null;
    }
    // unless tex_block?
    //   throw new Error "^ucdb@1005^ tex_block must not be null"
    if ((match = tex_block.match(/^\\(?<texstyle>[a-zA-Z]+)\{\}$/)) == null) {
      throw new Error(`^ucdb@1006^ unexpected tex_block format ${rpr(tex_block)}`);
    }
    texstyle = (ref = typeof style !== "undefined" && style !== null ? style.cmd : void 0) != null ? ref : match.groups.texstyle;
    // texstyle  = @_fontnick_from_texname texstyle
    if ((fontnick = this.fontnick_by_texstyles[texstyle]) == null) {
      throw new Error(`^ucdb@1007^ unknown texstyle ${rpr(texstyle)}`);
    }
    return fontnick;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._fontnick_from_style = function(me, style = null) {
    var command, fontnick;
    if (style == null) {
      return null;
    }
    if ((command = style.cmd) == null) {
      return null;
    }
    validate.nonempty_text(command);
    if ((fontnick = this.fontnick_by_texstyles[command]) == null) {
      throw new Error(`^ucdb@1008^ unknown texstyle ${rpr(texstyle)}`);
    }
    return fontnick;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._fontnick_from_style_or_tex_block = function(me, style, tex_block) {
    var fontnick_A, fontnick_B, ref;
    // try
    fontnick_A = this._fontnick_from_style(me, style);
    fontnick_B = this._fontnick_from_tex_block(me, tex_block);
    // catch error
    //   if not me._seen_unknown.has error.message
    //     me._seen_unknown.add error.message
    //     warn '^47474', fncr, glyph, error.message
    return (ref = fontnick_A != null ? fontnick_A : fontnick_B) != null ? ref : null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._cleanup_style = function(me, style) {
    if (style == null) {
      return null;
    }
    if (style.cmd != null) {
      /* Remove redundant `cmd` property, drop empty styles: */
      delete style.cmd;
    }
    if ((Object.keys(style)).length === 0) {
      return null;
    } else {
      return style;
    }
  };

  //===========================================================================================================
  // MAIN TABLE
  //-----------------------------------------------------------------------------------------------------------
  this.populate_table_main = function(me) {
    return new Promise(async(resolve, reject) => {
      var cid, cid_range, cids, csg, data, description, fncr, fontnick, glyph, i, iclabel, is_u9cjkidg, last_idx, len, line_count, ncr, preamble, ref, ref1, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, row, rsg, sfncr, sql, style, tags, tex_block, xncr;
      preamble = [];
      data = [];
      line_count = 0;
      me._seen_unknown = new Set();
      preamble.push(me.db.create_table_main_first());
      await this.read_rsgs(me);
//.........................................................................................................
      for (i = 0, len = cid_ranges.length; i < len; i++) {
        cid_range = cid_ranges[i];
        //.......................................................................................................
        /* TAINT use casting or call subroutine to derive range iterator */
        if (isa.text(cid_range)) {
          cids = function*() {
            var _glyph, j, len1, ref, results;
            ref = [...cid_range];
            results = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
              _glyph = ref[j];
              results.push((yield _glyph.codePointAt(0)));
            }
            return results;
          };
        } else {
          //.......................................................................................................
          cids = function*() {
            var cid, j, ref, ref1, results;
            results = [];
            for (cid = j = ref = cid_range[0], ref1 = cid_range[1]; (ref <= ref1 ? j <= ref1 : j >= ref1); cid = ref <= ref1 ? ++j : --j) {
              results.push((yield cid));
            }
            return results;
          };
        }
        ref = cids();
        //.......................................................................................................
        for (cid of ref) {
          if ((++line_count % 10000) === 0) {
            whisper('^ucdb@1009^', CND.format_number(line_count));
          }
          description = MKNCR.describe(cid);
          glyph = String.fromCodePoint(cid);
          style = (ref1 = mkts_glyph_styles[glyph]) != null ? ref1 : null;
          tags = ((ref2 = description != null ? description.tag : void 0) != null ? ref2 : []).sort();
          is_u9cjkidg = (indexOf.call(tags, 'assigned') >= 0) && (indexOf.call(tags, 'cjk') >= 0) && (indexOf.call(tags, 'ideograph') >= 0);
          tags = ';' + (tags.join(';')) + ';';
          csg = (ref3 = description != null ? description.csg : void 0) != null ? ref3 : null;
          rsg = (ref4 = description != null ? description.rsg : void 0) != null ? ref4 : null;
          fncr = (ref5 = description != null ? description.fncr : void 0) != null ? ref5 : null;
          sfncr = (ref6 = description != null ? description.sfncr : void 0) != null ? ref6 : null;
          ncr = (ref7 = description != null ? description.ncr : void 0) != null ? ref7 : null;
          xncr = (ref8 = description != null ? description.xncr : void 0) != null ? ref8 : null;
          iclabel = this._get_iclabel(me, cid, glyph, csg, rsg);
          // tex_glyph   = description?.tex?.codepoint ? null
          //.....................................................................................................
          tex_block = (ref9 = description != null ? (ref10 = description.tex) != null ? ref10.block : void 0 : void 0) != null ? ref9 : null;
          fontnick = this._fontnick_from_style_or_tex_block(me, style, tex_block);
          if (fontnick == null) {
            warn(`^ucdb@1010^ missing fontnick for ${fncr} ${glyph}`);
            continue;
          }
          style = jr(this._cleanup_style(me, style));
          //.....................................................................................................
          row = {iclabel, glyph, cid, is_u9cjkidg, tags, csg, rsg, fncr, sfncr, ncr, xncr, fontnick, style};
          // fontnick, style, tex_block, tex_glyph, }
          data.push((me.db.create_table_main_middle(row)) + ',');
        }
      }
      //.........................................................................................................
      if ((last_idx = data.length - 1) > -1) {
        data[last_idx] = data[last_idx].replace(/,\s*$/g, '');
      }
      //.........................................................................................................
      sql = [...preamble, ...data, ';'].join('\n');
      me.db.$.execute(sql);
      me.line_count += line_count;
      me.db.create_main_indexes();
      //.........................................................................................................
      /* Fallback glyph: */
      if ((style = mkts_options.tex.fallback_glyph) != null) {
        line_count++;
        fontnick = this._fontnick_from_style_or_tex_block(me, style, null);
        style = jr(this._cleanup_style(me, style));
        me.db.insert_fallback({fontnick, style});
      }
      //.........................................................................................................
      resolve({line_count});
      return null;
    });
  };

  //===========================================================================================================
  // OUTLINES
  //-----------------------------------------------------------------------------------------------------------
  this.create_table_outlines = function(me) {
    me.db.create_table_outlines();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.filepath_from_fontnick = function(me, fontnick) {
    return me.db.$.single_value(me.db.filepath_from_fontnick({fontnick}));
  };

  //-----------------------------------------------------------------------------------------------------------
  this.populate_table_outlines = function(me) {
    var XXX_sql, fontnick, fontnicks, glyphrows, i, len, row;
    this.create_table_outlines(me);
    // XXX_includes      = 'jizurafourbmp'.split /\s+/
    // XXX_includes      = 'sunexta kai babelstonehan'.split /\s+/
    /* TAINT do not retrieve all glyphrows, iterate instead; call @_insert_into_table_outlines with
    single glyphrow */
    XXX_sql = "select\n    *\n  from _main\n  -- where true\n    -- and ( cid between 0x0020 and 0x00ff ) or ( cid between 0x4e00 and 0xffff )\n  order by iclabel;";
    glyphrows = (function() {
      var ref, results;
      ref = me.db.$.query(XXX_sql);
      results = [];
      for (row of ref) {
        results.push(row);
      }
      return results;
    })();
    fontnicks = (function() {
      var ref, results;
      ref = me.db.walk_fontnick_table();
      results = [];
      for (row of ref) {
        results.push(row.fontnick);
      }
      return results;
    })();
    me._outline_count = 0;
    for (i = 0, len = fontnicks.length; i < len; i++) {
      fontnick = fontnicks[i];
      // continue unless fontnick in XXX_includes
      info(`^ucdb@1011^ adding outlines for ${fontnick}`);
      this._insert_into_table_outlines(me, fontnick, glyphrows);
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._XXX_false_fallback_pathdata_from_SVGTTF_font = function(me, SVGTTF_font) {
    /* TAINT ad-hoc procedure to obtain pathdata of false fallbacks; this will in the future be done
    with MKTS Mirage (i.e. SQLite File Mirror) */
    /* TAINT we re-read each time since file is small */
    var cid, d, fontnick, match, path, pattern, source;
    fontnick = SVGTTF_font.nick;
    path = project_abspath('configuration/fontnick-and-false-fallbacks.txt');
    source = FS.readFileSync(path, 'utf-8');
    pattern = RegExp(`^${fontnick}\\s+(?<sample>\\S+)$`, "mu");
    if ((match = source.match(pattern)) == null) {
      return null;
    }
    cid = match.groups.sample.codePointAt(0);
    d = SVGTTF.glyph_and_pathdata_from_cid(SVGTTF_font.metrics, SVGTTF_font.otjsfont, cid);
    if (d == null) {
      return null;
    }
    return d.pathdata;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._insert_into_table_outlines = function(me, fontnick, glyphrows) {
    /* TAINT code repetition */
    /* NOTE to be called once for each font with all or some cid_ranges */
    var SVGTTF_font, XXX_advance_scale_factor, advance, batch_size, cid, cid_hex, d, data, error, false_fallback_pathdata, glyph, iclabel, line_count, pathdata, preamble, ref, ref1, tag, x;
    preamble = [];
    data = [];
    line_count = 0;
    batch_size = 5000;
    // fragment insert_into_outlines_first(): insert into outlines ( iclabel, fontnick, pathdata ) values
    //.........................................................................................................
    /* TAINT refactor */
    SVGTTF_font = {};
    SVGTTF_font.nick = fontnick;
    SVGTTF_font.path = this.filepath_from_fontnick(me, fontnick);
    SVGTTF_font.metrics = SVGTTF.new_metrics();
    try {
      SVGTTF_font.otjsfont = SVGTTF.otjsfont_from_path(SVGTTF_font.path);
    } catch (error1) {
      error = error1;
      warn(`^ucdb@1012^ when trying to open font ${rpr(fontnick)}, an error occurred: ${error.message}`);
      return null;
    }
    // return null
    SVGTTF_font.advance_factor = SVGTTF_font.metrics.em_size / SVGTTF_font.otjsfont.unitsPerEm;
    XXX_advance_scale_factor = SVGTTF_font.advance_factor * ((ref = SVGTTF_font.metrics.global_glyph_scale) != null ? ref : 1);
    // tag                         = 'use-dumb-svg-parser'
    // tag                         = 'use-svgpath'
    tag = 'use-quickscale';
    //.........................................................................................................
    false_fallback_pathdata = this._XXX_false_fallback_pathdata_from_SVGTTF_font(me, SVGTTF_font);
    if (false_fallback_pathdata) {
      warn('^ucdb@6374445^', "filtering codepoints with outlines that look like fallback (placeholder glyph)");
    }
    ref1 = cast.iterator(glyphrows);
    //.........................................................................................................
    for (x of ref1) {
      ({iclabel, cid, glyph} = x);
      d = SVGTTF.glyph_and_pathdata_from_cid(SVGTTF_font.metrics, SVGTTF_font.otjsfont, cid, tag);
      if ((d == null) || (d.pathdata === false_fallback_pathdata)) {
        continue;
      }
      ({glyph, pathdata} = d);
      if ((me._outline_count++ % 1000) === 0) {
        whisper('^ucdb@1013^', me._outline_count - 1);
      }
      advance = glyph.advanceWidth * XXX_advance_scale_factor;
      /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
      if ((isa.nan(advance)) || (advance === 0)) {
        cid_hex = '0x' + (cid.toString(16)).padStart(4, '0');
        warn(`^ucdb@3332^ illegal advance for ${SVGTTF_font.nick} ${cid_hex}: ${rpr(advance)}; setting to 1`);
        advance = 1;
      }
      /* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
      data.push((me.db.insert_into_outlines_middle({iclabel, fontnick, advance, pathdata})) + ',');
      if (data.length >= batch_size) {
        line_count += this._flush_outlines(me, data);
      }
    }
    //.........................................................................................................
    line_count += this._flush_outlines(me, data);
    //.........................................................................................................
    return line_count;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._flush_outlines = function(me, data) {
    /* TAINT code duplication, use ICQL method (TBW) */
    var last_idx, line_count, sql;
    if (data.length === 0) {
      return 0;
    }
    line_count = data.length;
    last_idx = line_count - 1;
    data[last_idx] = data[last_idx].replace(/,\s*$/g, '');
    sql = me.db.insert_into_outlines_first() + '\n' + (data.join('\n')) + ';';
    me.db.$.execute(sql);
    me.line_count += line_count;
    data.length = 0;
    return line_count;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.create_outlines_indexes = function(me) {
    /* NOTE to be called once when all outlines for all fonts have been inserted */
    me.db.create_outlines_indexes();
    return null;
  };

  //===========================================================================================================
  // DB CREATION
  //-----------------------------------------------------------------------------------------------------------
  this.new_ucdb = function(settings = null) {
    var R, defaults;
    defaults = {
      db_path: project_abspath('./db/ucdb.db'),
      icql_path: project_abspath('./db/ucdb.icql')
    };
    //.........................................................................................................
    settings = {...defaults, ...settings};
    validate.ucdb_settings(settings);
    //.........................................................................................................
    R = {};
    R.db = (require('./db')).new_db(settings);
    R.dbr = R.db;
    R.dbw = (require('./db')).new_db(settings);
    R.line_count = 0;
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.create = function(settings = null) {
    return new Promise(async(resolve, reject) => {
      var me;
      me = this.new_ucdb(settings);
      urge('ucdb/create@1/4');
      await this.populate_table_fontnicks(me);
      urge('ucdb/create@2/4');
      await this.populate_table_main(me);
      urge('ucdb/create@3/4');
      await this.populate_table_outlines(me);
      urge('ucdb/create@4/4');
      // me.db.create_view_main_with_deltas_etc()
      return resolve(me);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.write_ucdb = async function(settings = null) {
    var dt, dts, error, f, t0, t1, ucdb;
    t0 = Date.now();
    try {
      ucdb = (await this.create(settings));
    } catch (error1) {
      error = error1;
      warn(error.message);
      process.exit(1);
    }
    t1 = Date.now();
    dt = t1 - t0;
    dts = (dt / 1000).toFixed(3);
    f = (ucdb.line_count / dt * 1000).toFixed(3);
    help(`^ucdb@1014^ wrote ${ucdb.line_count} records in ${dts} s (${f} Hz)`);
    return null;
  };

  // count = 0
  // for row from ucdb.db.read_lines()
  //   count++
  //   break if count > 5
  //   info 'µ33211', jr row
  // help 'ok'

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT must go to configuration file */
  this.fontnick_by_texstyles = {
    latin: 'lmromantenregular',
    cnjzr: 'jizurathreeb',
    cnxa: 'sunexta',
    cnxb: 'sunflowerucjkxb',
    cnxc: 'hanaminb',
    cnxd: 'babelstonehan',
    cn: 'sunexta',
    hg: 'nanummyeongjo',
    hi: 'ipamp',
    ka: 'ipamp',
    mktsRsgFb: 'sunexta',
    cncone: 'babelstonehan', // CJK Compatibility 1
    cnUcjkcmp: 'ipaexm', // CJK Compatibility 1
    cnUcjkcmpf: 'hanamina', // CJK Compatibility 1
    cnUcjkcmpione: 'hanamina', // CJK Compatibility 1
    cnUcjkcmpitwo: 'hanamina', // CJK Compatibility 2
    cnrone: 'sunexta', // CJK Radicals 1
    cnrtwo: 'sunexta', // CJK Radicals 2
    cnsym: 'hanamina',
    cnstrk: 'sunexta',
    cnencsupp: 'sarasaregular',
    cnxBabel: 'babelstonehan',
    cnxHanaA: 'hanamina',
    cnxHanaB: 'hanaminb',
    cnxSunXA: 'sunexta',
    cnxUming: 'uming',
    //.........................................................................................................
    cnxJzr: 'jizurathreeb',
    mktsFontfileAsanamath: 'asanamath',
    mktsFontfileCwtexqheibold: 'cwtexqheibold',
    mktsFontfileDejavuserif: 'dejavuserif',
    mktsFontfileEbgaramondtwelveregular: 'ebgaramondtwelveregular',
    mktsFontfileNanummyeongjo: 'nanummyeongjo',
    mktsFontfileSunexta: 'sunexta',
    mktsStyleBoxDrawing: 'iosevkatermslabmedium'
  };

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT must go to configuration file */
  this.fontnick_by_rsgs = {
    'u-cjk-cmpi1': 'babelstonehan',
    'u-cjk-xd': 'babelstonehan',
    'u-cjk-sym': 'hanamina',
    'u-cjk-xc': 'hanaminb',
    'u-cjk-hira': 'ipamp',
    'u-cjk-kata': 'ipamp',
    'jzr': 'jizurathreeb',
    'u-cdm': 'lmromantenregular',
    'u-cyrl': 'lmromantenregular',
    'u-cyrl-s': 'lmromantenregular',
    'u-grek': 'lmromantenregular',
    'u-latn': 'lmromantenregular',
    'u-latn-a': 'lmromantenregular',
    'u-latn-b': 'lmromantenregular',
    'u-punct': 'lmromantenregular',
    'u-latn-1': 'lmromantenregular',
    'u-hang-syl': 'nanummyeongjo',
    'u-arrow': 'sunexta',
    'u-arrow-b': 'sunexta',
    'u-boxdr': 'sunexta',
    'u-cjk-cmpf': 'sunexta',
    'u-llsym': 'sunexta',
    'u': 'sunexta',
    'u-cjk-strk': 'sunexta',
    'u-cjk-xa': 'sunexta',
    'u-geoms': 'sunexta',
    'u-cjk': 'sunexta',
    'u-cjk-rad2': 'sunexta',
    'u-cjk-xb': 'sunflowerucjkxb'
  };

  // keys = [ 'cn', 'cncone', 'cnjzr', 'cnrone', 'cnrtwo', 'cnstrk', 'cnsym', 'cnxa', 'cnxb', 'cnxBabel', 'cnxc',
  //   'cnxd', 'cnxHanaA', 'cnxHanaB', 'cnxJzr', 'cnxSunXA', 'cnxUming', 'hg', 'hi', 'ka', 'latin',
  //   'mktsFontfileAsanamath', 'mktsFontfileCwtexqheibold', 'mktsFontfileDejavuserif',
  //   'mktsFontfileEbgaramondtwelveregular', 'mktsFontfileNanummyeongjo', 'mktsFontfileSunexta', 'mktsRsgFb',
  //   'mktsStyleBoxDrawing', ]

  // for key in keys
  //   info key unless @fontnick_by_texstyles[ key ]?

  // #-----------------------------------------------------------------------------------------------------------
  // @_find_fontnick_ranges = ( me = null ) ->
  //   me ?= @new_ucdb()
  //   me.db.create_view_main_with_deltas_etc()
  //   # for row from me.db.main_with_deltas()
  //   #   info '^77763^', row.iclabel, row.fontnick, row.rear_delta_cid, row.fore_delta_cid
  //   for row from me.db.fontnick_boundaries()
  //     # help '^77456^', row
  //     help '^77763^', \
  //       ( CND.yellow row.fontnick.padEnd 30 ),            \
  //       ( CND.blue row.first_iclabel        ),            \
  //       ( CND.blue row.last_iclabel         ),            \
  //       ( CND.grey row.first_cid            ),            \
  //       ( CND.grey row.last_cid             )
  //       # ( CND.yellow row.cid.toString 16 ), \
  //       # ( CND.orange if row.last_cid? then row.next_cid.toString 16 else '' )

  //###########################################################################################################
  if (require.main === module) {
    (async() => {
      // info await @_build_fontcache null
      return (await this.write_ucdb());
    })();
  }

  // # await @read_rsgs null
// @_find_fontnick_ranges()
// help await @_describe_filename null, 'DejaVuSansMono-Bold.ttf'
// help await @_describe_filename null, 'TH-Khaai-TP2.ttf'
// help await @_locate_fontfile 'TH-Khaai-*.ttf'

// all_tags = """ascii-whitespace assigned bopomofo cjk geta hangeul hexagram hiragana ideograph idl jamo
//   japanese kana kanbun katakana korean kxr punctuation stroke syllable symbol trigram unassigned vertical
//   yijing"""

}).call(this);

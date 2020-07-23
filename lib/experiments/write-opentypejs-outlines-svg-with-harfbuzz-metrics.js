(function() {
  'use strict';
  var CND, OT, PATH, alert, badge, cast, debug, declare, echo, help, info, isa, last_of, log, rpr, size_of, type_of, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB/EXPERIMENTS/WRITE-OPENTYPEJS-OUTLINES-SVG-WITH-HARFBUZZ-METRICS';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  OT = require('opentype.js');

  PATH = require('path');

  types = require('../types');

  //...........................................................................................................
  ({isa, validate, declare, cast, size_of, last_of, type_of} = types);

  //-----------------------------------------------------------------------------------------------------------
  this.load_font = function(path) {
    return new Promise((resolve, reject) => {
      OT.load(path, (error, font) => {
        if (error != null) {
          return reject(error);
        }
        return resolve(font);
      });
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.load_font_sync = function(path) {
    var error;
    try {
      return OT.loadSync(path);
    } catch (error1) {
      error = error1;
      warn(`^fontmirror@1012^ when trying to open font ${rpr(path)}, an error occurred: ${error.message}`);
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.resolve_path = function(path) {
    return PATH.resolve(PATH.join(__dirname, '../..', path));
  };

  //-----------------------------------------------------------------------------------------------------------
  this.show_font_details = function(font) {
    var i, key, keys, len, text;
    keys = [
      'supported',
      // 'glyphs'
      // 'encoding'
      // 'position'
      // 'substitution'
      // 'tables'
      // '_push'
      // '_hmtxTableData'
      'outlinesFormat',
      'unitsPerEm',
      'ascender',
      'descender',
      'numberOfHMetrics',
      'numGlyphs',
      // 'glyphNames'
      // 'names'
      // 'gsubrs'
      // 'gsubrsBias'
      // 'defaultWidthX'
      // 'nominalWidthX'
      // 'subrs'
      // 'subrsBias'
      'nGlyphs',
      // 'cffEncoding'
      // 'kerningPairs'
      // 'hasChar'
      // 'charToGlyphIndex'
      // 'charToGlyph'
      // 'updateFeatures'
      // 'stringToGlyphs'
      // 'nameToGlyphIndex'
      // 'nameToGlyph'
      // 'glyphIndexToName'
      // 'getKerningValue'
      'defaultRenderOptions',
      // 'forEachGlyph'
      // 'getPath'
      // 'getPaths'
      // 'getAdvanceWidth'
      // 'draw'
      // 'drawPoints'
      // 'drawMetrics'
      // 'getEnglishName'
      // 'validate'
      // 'toTables'
      // 'toBuffer'
      // 'toArrayBuffer'
      // 'download'
      'fsSelectionValues',
      'usWidthClasses',
      'usWeightClasses'
    ];
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      // debug '^765^', key
      if (isa.function(font[key])) {
        text = rpr(font[key]());
      } else {
        text = rpr(font[key]);
      }
      echo(CND.blue(key.padEnd(20)), CND.yellow(text.slice(0, 101)));
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.demo = function() {
    return new Promise(async(resolve, reject) => {
      var decimal_places, error, font, font_path, glyph, glyph_idx, k, path_svg;
      font_path = this.resolve_path('font-sources/010-jizura-fonts/lmroman10-italic.otf');
      help(`using font ${font_path}`);
      try {
        //.........................................................................................................
        font = (await this.load_font(font_path));
      } catch (error1) {
        error = error1;
        warn(error);
        return resolve();
      }
      //.........................................................................................................
      glyph_idx = 51;
      decimal_places = 3;
      glyph = font.glyphs.glyphs[glyph_idx];
      path_svg = glyph.path.toSVG(decimal_places);
      debug('^draw-glyphs-as-svg@2^', (function() {
        var results;
        results = [];
        for (k in font) {
          results.push(k);
        }
        return results;
      })());
      this.show_font_details(font);
      // debug '^draw-glyphs-as-svg@3^', font.glyphs
      // debug '^draw-glyphs-as-svg@4^', font.glyphs.glyphs[ glyph_idx ]
      // debug '^draw-glyphs-as-svg@5^', font.glyphs.glyphs[ glyph_idx ].path.toSVG
      return debug('^draw-glyphs-as-svg@6^', font.glyphs.glyphs[glyph_idx].path.toSVG(decimal_places));
    });
  };

  [
    {
      upem: 1000,
      gid: 28,
      cluster: 0,
      x_advance: 0.511
    },
    {
      upem: 1000,
      gid: 123,
      cluster: 1,
      x_advance: 0.882
    },
    {
      upem: 1000,
      gid: 72,
      cluster: 4,
      x_advance: 0.256
    },
    {
      upem: 1000,
      gid: 66,
      cluster: 5,
      x_advance: 0.307
    },
    {
      upem: 1000,
      gid: 28,
      cluster: 6,
      x_advance: 0.511
    },
    {
      upem: 1000,
      gid: 105,
      cluster: 7,
      x_advance: 0.332
    },
    {
      upem: 1000,
      gid: 66,
      cluster: 8,
      x_advance: 0.307
    },
    {
      upem: 1000,
      gid: 81,
      cluster: 9,
      x_advance: 0.511
    },
    {
      upem: 1000,
      gid: 77,
      cluster: 10,
      x_advance: 0.562
    }
  ];

  //###########################################################################################################
  if (module === require.main) {
    (async() => {
      return (await this.demo());
    })();
  }

}).call(this);

//# sourceMappingURL=write-opentypejs-outlines-svg-with-harfbuzz-metrics.js.map
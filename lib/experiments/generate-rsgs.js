(function() {
  'use strict';
  var CND, FS, FSP, PATH, _drop_extension, alert, assign, badge, cast, cjk, cjk_icgroups, cwd_abspath, cwd_relpath, d, debug, echo, first_cid_hex, help, here_abspath, i, info, isa, j, jr, k, kanji, last_cid_hex, len, len1, len2, log, other, project_abspath, rpr, rsg, rsgs, sorter, type_of, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'UCDB/EXPERIMENTS/RSGS';

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

  ({cwd_abspath, cwd_relpath, here_abspath, _drop_extension, project_abspath} = require('../helpers'));

  types = require('../types');

  //...........................................................................................................
  ({isa, validate, cast, type_of} = types);

  rsgs = [
    {
      cids: [0,
    127],
      icgroup: 'u-----',
      rsg: 'u-latn',
      blockname: 'Basic Latin'
    },
    {
      cids: [128,
    255],
      icgroup: 'u-----',
      rsg: 'u-latn-1',
      blockname: 'Latin-1 Supplement'
    },
    {
      cids: [256,
    383],
      icgroup: 'u-----',
      rsg: 'u-latn-a',
      blockname: 'Latin Extended-A'
    },
    {
      cids: [384,
    591],
      icgroup: 'u-----',
      rsg: 'u-latn-b',
      blockname: 'Latin Extended-B'
    },
    {
      cids: [592,
    687],
      icgroup: 'u-----',
      rsg: 'u-ipa-x',
      blockname: 'IPA Extensions'
    },
    {
      cids: [688,
    767],
      icgroup: 'u-----',
      rsg: 'u-sml',
      blockname: 'Spacing Modifier Letters'
    },
    {
      cids: [768,
    879],
      icgroup: 'ucdm--',
      rsg: 'u-cdm',
      blockname: 'Combining Diacritical Marks'
    },
    {
      cids: [880,
    1023],
      icgroup: 'u-----',
      rsg: 'u-grek',
      blockname: 'Greek and Coptic'
    },
    {
      cids: [1024,
    1279],
      icgroup: 'u-----',
      rsg: 'u-cyrl',
      blockname: 'Cyrillic'
    },
    {
      cids: [1280,
    1327],
      icgroup: 'u-----',
      rsg: 'u-cyrl-s',
      blockname: 'Cyrillic Supplement'
    },
    {
      cids: [1328,
    1423],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Armenian'
    },
    {
      cids: [1424,
    1535],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Hebrew'
    },
    {
      cids: [1536,
    1791],
      icgroup: 'u-----',
      rsg: 'u-arab',
      blockname: 'Arabic'
    },
    {
      cids: [1792,
    1871],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Syriac'
    },
    {
      cids: [1872,
    1919],
      icgroup: 'u-----',
      rsg: 'u-arab-s',
      blockname: 'Arabic Supplement'
    },
    {
      cids: [1920,
    1983],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Thaana'
    },
    {
      cids: [1984,
    2047],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'NKo'
    },
    {
      cids: [2048,
    2111],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Samaritan'
    },
    {
      cids: [2112,
    2143],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Mandaic'
    },
    {
      cids: [2144,
    2159],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Syriac Supplement'
    },
    {
      cids: [2208,
    2303],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Arabic Extended-A'
    },
    {
      cids: [2304,
    2431],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Devanagari'
    },
    {
      cids: [2432,
    2559],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Bengali'
    },
    {
      cids: [2560,
    2687],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Gurmukhi'
    },
    {
      cids: [2688,
    2815],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Gujarati'
    },
    {
      cids: [2816,
    2943],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Oriya'
    },
    {
      cids: [2944,
    3071],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tamil'
    },
    {
      cids: [3072,
    3199],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Telugu'
    },
    {
      cids: [3200,
    3327],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Kannada'
    },
    {
      cids: [3328,
    3455],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Malayalam'
    },
    {
      cids: [3456,
    3583],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Sinhala'
    },
    {
      cids: [3584,
    3711],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Thai'
    },
    {
      cids: [3712,
    3839],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Lao'
    },
    {
      cids: [3840,
    4095],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tibetan'
    },
    {
      cids: [4096,
    4255],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Myanmar'
    },
    {
      cids: [4256,
    4351],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Georgian'
    },
    {
      cids: [4352,
    4607],
      icgroup: 'uchgjm',
      rsg: 'u-hang-jm',
      blockname: 'Hangul Jamo'
    },
    {
      cids: [4608,
    4991],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ethiopic'
    },
    {
      cids: [4992,
    5023],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ethiopic Supplement'
    },
    {
      cids: [5024,
    5119],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Cherokee'
    },
    {
      cids: [5120,
    5759],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Unified Canadian Aboriginal Syllabics'
    },
    {
      cids: [5760,
    5791],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ogham'
    },
    {
      cids: [5792,
    5887],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Runic'
    },
    {
      cids: [5888,
    5919],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tagalog'
    },
    {
      cids: [5920,
    5951],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Hanunoo'
    },
    {
      cids: [5952,
    5983],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Buhid'
    },
    {
      cids: [5984,
    6015],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tagbanwa'
    },
    {
      cids: [6016,
    6143],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Khmer'
    },
    {
      cids: [6144,
    6319],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Mongolian'
    },
    {
      cids: [6320,
    6399],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Unified Canadian Aboriginal Syllabics Extended'
    },
    {
      cids: [6400,
    6479],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Limbu'
    },
    {
      cids: [6480,
    6527],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tai Le'
    },
    {
      cids: [6528,
    6623],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'New Tai Lue'
    },
    {
      cids: [6624,
    6655],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Khmer Symbols'
    },
    {
      cids: [6656,
    6687],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Buginese'
    },
    {
      cids: [6688,
    6831],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tai Tham'
    },
    {
      cids: [6832,
    6911],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Combining Diacritical Marks Extended'
    },
    {
      cids: [6912,
    7039],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Balinese'
    },
    {
      cids: [7040,
    7103],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Sundanese'
    },
    {
      cids: [7104,
    7167],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Batak'
    },
    {
      cids: [7168,
    7247],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Lepcha'
    },
    {
      cids: [7248,
    7295],
      icgroup: 'u-----',
      rsg: 'u-olck',
      blockname: 'Ol Chiki'
    },
    {
      cids: [7296,
    7311],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Cyrillic Extended-C'
    },
    {
      cids: [7360,
    7375],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Sundanese Supplement'
    },
    {
      cids: [7376,
    7423],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Vedic Extensions'
    },
    {
      cids: [7424,
    7551],
      icgroup: 'u-----',
      rsg: 'u-phon-x',
      blockname: 'Phonetic Extensions'
    },
    {
      cids: [7552,
    7615],
      icgroup: 'u-----',
      rsg: 'u-phon-xs',
      blockname: 'Phonetic Extensions Supplement'
    },
    {
      cids: [7616,
    7679],
      icgroup: 'ucdms-',
      rsg: 'u-cdm-s',
      blockname: 'Combining Diacritical Marks Supplement'
    },
    {
      cids: [7680,
    7935],
      icgroup: 'u-----',
      rsg: 'u-latn-xa',
      blockname: 'Latin Extended Additional'
    },
    {
      cids: [7936,
    8191],
      icgroup: 'u-----',
      rsg: 'u-grek-x',
      blockname: 'Greek Extended'
    },
    {
      cids: [8192,
    8303],
      icgroup: 'u-----',
      rsg: 'u-punct',
      blockname: 'General Punctuation'
    },
    {
      cids: [8304,
    8351],
      icgroup: 'u-----',
      rsg: 'u-supsub',
      blockname: 'Superscripts and Subscripts'
    },
    {
      cids: [8352,
    8399],
      icgroup: 'u-----',
      rsg: 'u-currn',
      blockname: 'Currency Symbols'
    },
    {
      cids: [8400,
    8447],
      icgroup: 'ucdmsy',
      rsg: 'u-cdm-sy',
      blockname: 'Combining Diacritical Marks for Symbols'
    },
    {
      cids: [8448,
    8527],
      icgroup: 'u-----',
      rsg: 'u-llsym',
      blockname: 'Letterlike Symbols'
    },
    {
      cids: [8528,
    8591],
      icgroup: 'u-----',
      rsg: 'u-num',
      blockname: 'Number Forms'
    },
    {
      cids: [8592,
    8703],
      icgroup: 'u-----',
      rsg: 'u-arrow',
      blockname: 'Arrows'
    },
    {
      cids: [8704,
    8959],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Mathematical Operators'
    },
    {
      cids: [8960,
    9215],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Miscellaneous Technical'
    },
    {
      cids: [9216,
    9279],
      icgroup: 'u-----',
      rsg: 'u-ctrlp',
      blockname: 'Control Pictures'
    },
    {
      cids: [9280,
    9311],
      icgroup: 'u-----',
      rsg: 'u-ocr',
      blockname: 'Optical Character Recognition'
    },
    {
      cids: [9312,
    9471],
      icgroup: 'u-----',
      rsg: 'u-enalp',
      blockname: 'Enclosed Alphanumerics'
    },
    {
      cids: [9472,
    9599],
      icgroup: 'u-----',
      rsg: 'u-boxdr',
      blockname: 'Box Drawing'
    },
    {
      cids: [9600,
    9631],
      icgroup: 'u-----',
      rsg: 'u-block',
      blockname: 'Block Elements'
    },
    {
      cids: [9632,
    9727],
      icgroup: 'u-----',
      rsg: 'u-geoms',
      blockname: 'Geometric Shapes'
    },
    {
      cids: [9728,
    9983],
      icgroup: 'u-----',
      rsg: 'u-sym',
      blockname: 'Miscellaneous Symbols'
    },
    {
      cids: [9984,
    10175],
      icgroup: 'u-----',
      rsg: 'u-dingb',
      blockname: 'Dingbats'
    },
    {
      cids: [10176,
    10223],
      icgroup: 'u-----',
      rsg: 'u-maths-a',
      blockname: 'Miscellaneous Mathematical Symbols-A'
    },
    {
      cids: [10224,
    10239],
      icgroup: 'u-----',
      rsg: 'u-arrow-a',
      blockname: 'Supplemental Arrows-A'
    },
    {
      cids: [10240,
    10495],
      icgroup: 'u-----',
      rsg: 'u-brail',
      blockname: 'Braille Patterns'
    },
    {
      cids: [10496,
    10623],
      icgroup: 'u-----',
      rsg: 'u-arrow-b',
      blockname: 'Supplemental Arrows-B'
    },
    {
      cids: [10624,
    10751],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Miscellaneous Mathematical Symbols-B'
    },
    {
      cids: [10752,
    11007],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Supplemental Mathematical Operators'
    },
    {
      cids: [11008,
    11263],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Miscellaneous Symbols and Arrows'
    },
    {
      cids: [11264,
    11359],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Glagolitic'
    },
    {
      cids: [11360,
    11391],
      icgroup: 'u-----',
      rsg: 'u-latn-c',
      blockname: 'Latin Extended-C'
    },
    {
      cids: [11392,
    11519],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Coptic'
    },
    {
      cids: [11520,
    11567],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Georgian Supplement'
    },
    {
      cids: [11568,
    11647],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tifinagh'
    },
    {
      cids: [11648,
    11743],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ethiopic Extended'
    },
    {
      cids: [11744,
    11775],
      icgroup: 'u-----',
      rsg: 'u-cyrl-a',
      blockname: 'Cyrillic Extended-A'
    },
    {
      cids: [11776,
    11903],
      icgroup: 'u-----',
      rsg: 'u-punct-s',
      blockname: 'Supplemental Punctuation'
    },
    {
      cids: [11904,
    12031],
      icgroup: 'ucrad2',
      rsg: 'u-cjk-rad2',
      blockname: 'CJK Radicals Supplement'
    },
    {
      cids: [12032,
    12255],
      icgroup: 'ucrad1',
      rsg: 'u-cjk-rad1',
      blockname: 'Kangxi Radicals'
    },
    {
      cids: [12272,
    12287],
      icgroup: 'ucidc-',
      rsg: 'u-cjk-idc',
      blockname: 'Ideographic Description Characters'
    },
    {
      cids: [12288,
    12351],
      icgroup: 'ucsym-',
      rsg: 'u-cjk-sym',
      blockname: 'CJK Symbols and Punctuation'
    },
    {
      cids: [12352,
    12447],
      icgroup: 'uchira',
      rsg: 'u-cjk-hira',
      blockname: 'Hiragana'
    },
    {
      cids: [12448,
    12543],
      icgroup: 'uckata',
      rsg: 'u-cjk-kata',
      blockname: 'Katakana'
    },
    {
      cids: [12544,
    12591],
      icgroup: 'ucbpmf',
      rsg: 'u-bopo',
      blockname: 'Bopomofo'
    },
    {
      cids: [12592,
    12687],
      icgroup: 'uchgcj',
      rsg: 'u-hang-comp-jm',
      blockname: 'Hangul Compatibility Jamo'
    },
    {
      cids: [12688,
    12703],
      icgroup: 'uckanb',
      rsg: 'u-cjk-kanbun',
      blockname: 'Kanbun'
    },
    {
      cids: [12704,
    12735],
      icgroup: 'ucbpmx',
      rsg: 'u-bopo-x',
      blockname: 'Bopomofo Extended'
    },
    {
      cids: [12736,
    12783],
      icgroup: 'ucstrk',
      rsg: 'u-cjk-strk',
      blockname: 'CJK Strokes'
    },
    {
      cids: [12784,
    12799],
      icgroup: 'uckatx',
      rsg: 'u-cjk-kata-x',
      blockname: 'Katakana Phonetic Extensions'
    },
    {
      cids: [12800,
    13055],
      icgroup: 'ucelet',
      rsg: 'u-cjk-enclett',
      blockname: 'Enclosed CJK Letters and Months'
    },
    {
      cids: [13056,
    13311],
      icgroup: 'uccmp-',
      rsg: 'u-cjk-cmp',
      blockname: 'CJK Compatibility'
    },
    {
      cids: [13312,
    19903],
      icgroup: 'ucxa--',
      rsg: 'u-cjk-xa',
      blockname: 'CJK Unified Ideographs Extension A'
    },
    {
      cids: [19904,
    19967],
      icgroup: 'ucyijg',
      rsg: 'u-yijng',
      blockname: 'Yijing Hexagram Symbols'
    },
    {
      cids: [19968,
    40959],
      icgroup: 'uc0---',
      rsg: 'u-cjk',
      blockname: 'CJK Unified Ideographs'
    },
    {
      cids: [40960,
    42127],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Yi Syllables'
    },
    {
      cids: [42128,
    42191],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Yi Radicals'
    },
    {
      cids: [42192,
    42239],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Lisu'
    },
    {
      cids: [42240,
    42559],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Vai'
    },
    {
      cids: [42560,
    42655],
      icgroup: 'u-----',
      rsg: 'u-cyrl-b',
      blockname: 'Cyrillic Extended-B'
    },
    {
      cids: [42656,
    42751],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Bamum'
    },
    {
      cids: [42752,
    42783],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Modifier Tone Letters'
    },
    {
      cids: [42784,
    43007],
      icgroup: 'u-----',
      rsg: 'u-latn-d',
      blockname: 'Latin Extended-D'
    },
    {
      cids: [43008,
    43055],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Syloti Nagri'
    },
    {
      cids: [43056,
    43071],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Common Indic Number Forms'
    },
    {
      cids: [43072,
    43135],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Phags-pa'
    },
    {
      cids: [43136,
    43231],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Saurashtra'
    },
    {
      cids: [43232,
    43263],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Devanagari Extended'
    },
    {
      cids: [43264,
    43311],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Kayah Li'
    },
    {
      cids: [43312,
    43359],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Rejang'
    },
    {
      cids: [43360,
    43391],
      icgroup: 'uchgja',
      rsg: 'u-hang-jm-xa',
      blockname: 'Hangul Jamo Extended-A'
    },
    {
      cids: [43392,
    43487],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Javanese'
    },
    {
      cids: [43488,
    43519],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Myanmar Extended-B'
    },
    {
      cids: [43520,
    43615],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Cham'
    },
    {
      cids: [43616,
    43647],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Myanmar Extended-A'
    },
    {
      cids: [43648,
    43743],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tai Viet'
    },
    {
      cids: [43744,
    43775],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Meetei Mayek Extensions'
    },
    {
      cids: [43776,
    43823],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ethiopic Extended-A'
    },
    {
      cids: [43824,
    43887],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Latin Extended-E'
    },
    {
      cids: [43888,
    43967],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Cherokee Supplement'
    },
    {
      cids: [43968,
    44031],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Meetei Mayek'
    },
    {
      cids: [44032,
    55215],
      icgroup: 'uchgsy',
      rsg: 'u-hang-syl',
      blockname: 'Hangul Syllables'
    },
    {
      cids: [55216,
    55295],
      icgroup: 'uchgjb',
      rsg: 'u-hang-jm-xb',
      blockname: 'Hangul Jamo Extended-B'
    },
    {
      cids: [55296,
    56191],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'High Surrogates'
    },
    {
      cids: [56192,
    56319],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'High Private Use Surrogates'
    },
    {
      cids: [56320,
    57343],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Low Surrogates'
    },
    {
      cids: [57344,
    63743],
      icgroup: 'u-----',
      rsg: 'u-pua',
      blockname: 'Private Use Area'
    },
    {
      cids: [63744,
    64255],
      icgroup: 'uccmp1',
      rsg: 'u-cjk-cmpi1',
      blockname: 'CJK Compatibility Ideographs'
    },
    {
      cids: [64256,
    64335],
      icgroup: 'u-----',
      rsg: 'u-abc-pf',
      blockname: 'Alphabetic Presentation Forms'
    },
    {
      cids: [64336,
    65023],
      icgroup: 'u-----',
      rsg: 'u-arab-pf-a',
      blockname: 'Arabic Presentation Forms-A'
    },
    {
      cids: [65024,
    65039],
      icgroup: 'u-----',
      rsg: 'u-varsl',
      blockname: 'Variation Selectors'
    },
    {
      cids: [65040,
    65055],
      icgroup: 'ucvert',
      rsg: 'u-vertf',
      blockname: 'Vertical Forms'
    },
    {
      cids: [65056,
    65071],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Combining Half Marks'
    },
    {
      cids: [65072,
    65103],
      icgroup: 'uccmpf',
      rsg: 'u-cjk-cmpf',
      blockname: 'CJK Compatibility Forms'
    },
    {
      cids: [65104,
    65135],
      icgroup: 'ucsfv-',
      rsg: 'u-small',
      blockname: 'Small Form Variants'
    },
    {
      cids: [65136,
    65279],
      icgroup: 'u-----',
      rsg: 'u-arab-pf-b',
      blockname: 'Arabic Presentation Forms-B'
    },
    {
      cids: [65280,
    65519],
      icgroup: 'uchalf',
      rsg: 'u-halfull',
      blockname: 'Halfwidth and Fullwidth Forms'
    },
    {
      cids: [65520,
    65535],
      icgroup: 'u-----',
      rsg: 'u-special',
      blockname: 'Specials'
    },
    {
      cids: [65536,
    65663],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Linear B Syllabary'
    },
    {
      cids: [65664,
    65791],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Linear B Ideograms'
    },
    {
      cids: [65792,
    65855],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Aegean Numbers'
    },
    {
      cids: [65856,
    65935],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ancient Greek Numbers'
    },
    {
      cids: [65936,
    65999],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ancient Symbols'
    },
    {
      cids: [66000,
    66047],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Phaistos Disc'
    },
    {
      cids: [66176,
    66207],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Lycian'
    },
    {
      cids: [66208,
    66271],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Carian'
    },
    {
      cids: [66272,
    66303],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Coptic Epact Numbers'
    },
    {
      cids: [66304,
    66351],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Old Italic'
    },
    {
      cids: [66352,
    66383],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Gothic'
    },
    {
      cids: [66384,
    66431],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Old Permic'
    },
    {
      cids: [66432,
    66463],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ugaritic'
    },
    {
      cids: [66464,
    66527],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Old Persian'
    },
    {
      cids: [66560,
    66639],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Deseret'
    },
    {
      cids: [66640,
    66687],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Shavian'
    },
    {
      cids: [66688,
    66735],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Osmanya'
    },
    {
      cids: [66736,
    66815],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Osage'
    },
    {
      cids: [66816,
    66863],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Elbasan'
    },
    {
      cids: [66864,
    66927],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Caucasian Albanian'
    },
    {
      cids: [67072,
    67455],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Linear A'
    },
    {
      cids: [67584,
    67647],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Cypriot Syllabary'
    },
    {
      cids: [67648,
    67679],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Imperial Aramaic'
    },
    {
      cids: [67680,
    67711],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Palmyrene'
    },
    {
      cids: [67712,
    67759],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Nabataean'
    },
    {
      cids: [67808,
    67839],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Hatran'
    },
    {
      cids: [67840,
    67871],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Phoenician'
    },
    {
      cids: [67872,
    67903],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Lydian'
    },
    {
      cids: [67968,
    67999],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Meroitic Hieroglyphs'
    },
    {
      cids: [68000,
    68095],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Meroitic Cursive'
    },
    {
      cids: [68096,
    68191],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Kharoshthi'
    },
    {
      cids: [68192,
    68223],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Old South Arabian'
    },
    {
      cids: [68224,
    68255],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Old North Arabian'
    },
    {
      cids: [68288,
    68351],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Manichaean'
    },
    {
      cids: [68352,
    68415],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Avestan'
    },
    {
      cids: [68416,
    68447],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Inscriptional Parthian'
    },
    {
      cids: [68448,
    68479],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Inscriptional Pahlavi'
    },
    {
      cids: [68480,
    68527],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Psalter Pahlavi'
    },
    {
      cids: [68608,
    68687],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Old Turkic'
    },
    {
      cids: [68736,
    68863],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Old Hungarian'
    },
    {
      cids: [69216,
    69247],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Rumi Numeral Symbols'
    },
    {
      cids: [69632,
    69759],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Brahmi'
    },
    {
      cids: [69760,
    69839],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Kaithi'
    },
    {
      cids: [69840,
    69887],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Sora Sompeng'
    },
    {
      cids: [69888,
    69967],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Chakma'
    },
    {
      cids: [69968,
    70015],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Mahajani'
    },
    {
      cids: [70016,
    70111],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Sharada'
    },
    {
      cids: [70112,
    70143],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Sinhala Archaic Numbers'
    },
    {
      cids: [70144,
    70223],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Khojki'
    },
    {
      cids: [70272,
    70319],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Multani'
    },
    {
      cids: [70320,
    70399],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Khudawadi'
    },
    {
      cids: [70400,
    70527],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Grantha'
    },
    {
      cids: [70656,
    70783],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Newa'
    },
    {
      cids: [70784,
    70879],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tirhuta'
    },
    {
      cids: [71040,
    71167],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Siddham'
    },
    {
      cids: [71168,
    71263],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Modi'
    },
    {
      cids: [71264,
    71295],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Mongolian Supplement'
    },
    {
      cids: [71296,
    71375],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Takri'
    },
    {
      cids: [71424,
    71487],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ahom'
    },
    {
      cids: [71840,
    71935],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Warang Citi'
    },
    {
      cids: [72192,
    72271],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Zanabazar Square'
    },
    {
      cids: [72272,
    72367],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Soyombo'
    },
    {
      cids: [72384,
    72447],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Pau Cin Hau'
    },
    {
      cids: [72704,
    72815],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Bhaiksuki'
    },
    {
      cids: [72816,
    72895],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Marchen'
    },
    {
      cids: [72960,
    73055],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Masaram Gondi'
    },
    {
      cids: [73728,
    74751],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Cuneiform'
    },
    {
      cids: [74752,
    74879],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Cuneiform Numbers and Punctuation'
    },
    {
      cids: [74880,
    75087],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Early Dynastic Cuneiform'
    },
    {
      cids: [77824,
    78895],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Egyptian Hieroglyphs'
    },
    {
      cids: [82944,
    83583],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Anatolian Hieroglyphs'
    },
    {
      cids: [92160,
    92735],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Bamum Supplement'
    },
    {
      cids: [92736,
    92783],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Mro'
    },
    {
      cids: [92880,
    92927],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Bassa Vah'
    },
    {
      cids: [92928,
    93071],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Pahawh Hmong'
    },
    {
      cids: [93952,
    94111],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Miao'
    },
    {
      cids: [94176,
    94207],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ideographic Symbols and Punctuation'
    },
    {
      cids: [94208,
    100351],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tangut'
    },
    {
      cids: [100352,
    101119],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tangut Components'
    },
    {
      cids: [110592,
    110847],
      icgroup: 'uckans',
      rsg: 'u-cjk-kanasupp',
      blockname: 'Kana Supplement'
    },
    {
      cids: [110848,
    110895],
      icgroup: 'uckaxa',
      rsg: 'u-cjk-kana-xa',
      blockname: 'Kana Extended-A'
    },
    {
      cids: [110960,
    111359],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Nushu'
    },
    {
      cids: [113664,
    113823],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Duployan'
    },
    {
      cids: [113824,
    113839],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Shorthand Format Controls'
    },
    {
      cids: [118784,
    119039],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Byzantine Musical Symbols'
    },
    {
      cids: [119040,
    119295],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Musical Symbols'
    },
    {
      cids: [119296,
    119375],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ancient Greek Musical Notation'
    },
    {
      cids: [119552,
    119647],
      icgroup: 'uctxj-',
      rsg: 'u-txj-sym',
      blockname: 'Tai Xuan Jing Symbols'
    },
    {
      cids: [119648,
    119679],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Counting Rod Numerals'
    },
    {
      cids: [119808,
    120831],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Mathematical Alphanumeric Symbols'
    },
    {
      cids: [120832,
    121519],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Sutton SignWriting'
    },
    {
      cids: [122880,
    122927],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Glagolitic Supplement'
    },
    {
      cids: [124928,
    125151],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Mende Kikakui'
    },
    {
      cids: [125184,
    125279],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Adlam'
    },
    {
      cids: [126464,
    126719],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Arabic Mathematical Alphabetic Symbols'
    },
    {
      cids: [126976,
    127023],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Mahjong Tiles'
    },
    {
      cids: [127024,
    127135],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Domino Tiles'
    },
    {
      cids: [127136,
    127231],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Playing Cards'
    },
    {
      cids: [127232,
    127487],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Enclosed Alphanumeric Supplement'
    },
    {
      cids: [127488,
    127743],
      icgroup: 'ucesup',
      rsg: 'u-cjk-encsupp',
      blockname: 'Enclosed Ideographic Supplement'
    },
    {
      cids: [127744,
    128511],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Miscellaneous Symbols and Pictographs'
    },
    {
      cids: [128512,
    128591],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Emoticons'
    },
    {
      cids: [128592,
    128639],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Ornamental Dingbats'
    },
    {
      cids: [128640,
    128767],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Transport and Map Symbols'
    },
    {
      cids: [128768,
    128895],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Alchemical Symbols'
    },
    {
      cids: [128896,
    129023],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Geometric Shapes Extended'
    },
    {
      cids: [129024,
    129279],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Supplemental Arrows-C'
    },
    {
      cids: [129280,
    129535],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Supplemental Symbols and Pictographs'
    },
    {
      cids: [131072,
    173791],
      icgroup: 'ucxb--',
      rsg: 'u-cjk-xb',
      blockname: 'CJK Unified Ideographs Extension B'
    },
    {
      cids: [173824,
    177983],
      icgroup: 'ucxc--',
      rsg: 'u-cjk-xc',
      blockname: 'CJK Unified Ideographs Extension C'
    },
    {
      cids: [177984,
    178207],
      icgroup: 'ucxd--',
      rsg: 'u-cjk-xd',
      blockname: 'CJK Unified Ideographs Extension D'
    },
    {
      cids: [178208,
    183983],
      icgroup: 'ucxe--',
      rsg: 'u-cjk-xe',
      blockname: 'CJK Unified Ideographs Extension E'
    },
    {
      cids: [183984,
    191471],
      icgroup: 'ucxf--',
      rsg: 'u-cjk-xf',
      blockname: 'CJK Unified Ideographs Extension F'
    },
    {
      cids: [194560,
    195103],
      icgroup: 'uccmp2',
      rsg: 'u-cjk-cmpi2',
      blockname: 'CJK Compatibility Ideographs Supplement'
    },
    {
      cids: [917504,
    917631],
      icgroup: 'u-----',
      rsg: '∎',
      blockname: 'Tags'
    },
    {
      cids: [917760,
    917999],
      icgroup: 'u-----',
      rsg: 'u-varsl-s',
      blockname: 'Variation Selectors Supplement'
    },
    {
      cids: [983040,
    1048575],
      icgroup: 'u-----',
      rsg: 'u-pua-xa',
      blockname: 'Supplementary Private Use Area-A'
    },
    {
      cids: [1048576,
    1114111],
      icgroup: 'u-----',
      rsg: 'u-pua-xb',
      blockname: 'Supplementary Private Use Area-B'
    }
  ];

  cjk_icgroups = new Set("uc0--- uccmp- uccmpf uccmp1 uccmp2 ucelet ucesup\nuckanb ucrad1 ucrad2 ucstrk ucsym- ucxa-- ucxb-- ucxc-- ucxd-- ucxe--\nucxf-- uchalf ucvert ucsfv-".split(/\s+/));

  cjk = [];

  other = [];

  for (i = 0, len = rsgs.length; i < len; i++) {
    d = rsgs[i];
    first_cid_hex = cast.hex(d.cids[0]);
    last_cid_hex = cast.hex(d.cids[1]);
    rsg = d.rsg;
    if (rsg === '∎') {
      rsg = '';
    }
    rsg = rsg.padEnd(20);
    if (cjk_icgroups.has(d.icgroup)) {
      cjk.push(d);
      kanji = '漢';
    } else {
      kanji = '〇';
      other.push(d);
    }
    d.line = `${d.icgroup} ${rsg} ${kanji} ${first_cid_hex}..${last_cid_hex}  § ${d.blockname}`;
  }

  sorter = function(d, e) {
    // return +1 if d.icgroup > e.icgroup
    // return -1 if d.icgroup < e.icgroup
    // return  0
    if ((d.rsg == null) || (e.rsg == null)) {
      if (d.icgroup > e.icgroup) {
        return +1;
      }
      if (d.icgroup < e.icgroup) {
        return -1;
      }
      if (d.blockname > e.blockname) {
        return +1;
      }
      if (d.blockname < e.blockname) {
        return -1;
      }
      return 0;
    }
    if (d.rsg > e.rsg) {
      return +1;
    }
    if (d.rsg < e.rsg) {
      return -1;
    }
    return 0;
  };

  cjk.sort(sorter);

  other.sort(sorter);

  for (j = 0, len1 = cjk.length; j < len1; j++) {
    d = cjk[j];
    debug(jr(d.line));
  }

  for (k = 0, len2 = other.length; k < len2; k++) {
    d = other[k];
    debug(jr(d.line));
  }

}).call(this);

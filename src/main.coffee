
'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'UCDB'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
FS                        = require 'fs'
FSP                       = FS.promises
PATH                      = require 'path'
{ assign
  jr }                    = CND
{ walk_cids_in_cid_range
  cwd_abspath
  cwd_relpath
  here_abspath
  _drop_extension
  project_abspath }       = require './helpers'
@types                    = require './types'
#...........................................................................................................
{ isa
  validate
  declare
  cast
  size_of
  last_of
  type_of }               = @types
#...........................................................................................................
_glob                     = require 'glob'
glob                      = ( require 'util' ).promisify _glob
require                   './exception-handler'
PD                        = require 'pipedreams'
{ $
  $async
  $watch
  $show  }                = PD.export()
#...........................................................................................................
mkts_options              = require './_TEMPORARY_options'
mkts_glyph_styles         = mkts_options.tex[ 'glyph-styles' ]
mkts_fontfiles            = mkts_options.fonts.files
MKNCR                     = require 'mingkwai-ncr'
SVGTTF                    = require 'svgttf'
#...........................................................................................................
runmode                   = 'production'
runmode                   = 'debug'
runmode                   = 'debug_small'

#-----------------------------------------------------------------------------------------------------------
cid_ranges_by_runmode  =
  debug: [
    [ 0x00001, 0x000ff, ]
    [ 0x03002, 0x03002, ]
    [ 0x021bb, 0x021bb, ]
    [ 0x03010, 0x03010, ]
    [ 0x04df0, 0x09fff, ]
    # [ 0x09fba, 0x09fba, ] # babelstonehan
    [ 0x0e100, 0x0e10d, ]
    [ 0x0e10f, 0x0e111, ]
    [ 0x20000, 0x20006, ]
    ]
  debug_small: [
    [ 0x04e00, 0x06fff, ]
    # '扌亻釒钅冫牜飠'
    ]
  production: [
    [ 0x00001, 0x000ff, ]
    [ 0x00100, 0x0ffff, ]
    [ 0x1d400, 0x1d7ff, ] # Mathematical Alphanumeric Symbols
    [ 0x20000, 0x2ebef, ] # CJK Ext. B thru F
    ]
unless ( cid_ranges = cid_ranges_by_runmode[ runmode ] )?
  throw new Error "^ucdb@1000^ unknown runmode #{rpr runmode}"

#-----------------------------------------------------------------------------------------------------------
@_readable_stream_from_text = ( text ) ->
  ### thx to https://stackoverflow.com/a/22085851/7568091 ###
  R = new ( require 'stream' ).Readable()
  R._read = () => {} # redundant?
  R.push text
  R.push null
  return R

#-----------------------------------------------------------------------------------------------------------
@read_rsgs = ( me ) -> return new Promise ( resolve ) ->
  #.........................................................................................................
  $as_datom = ->
    lnr = 0
    return $ ( line, send ) ->
      lnr++
      return null if ( isa.blank_text line )
      return null if ( line.match /^\s*#/ )?
      unless ( match = line.match /^(?<new_rsg>\S+)\s+(?<old_rsg>\S+)\s+(?<block_name>.+)$/ )?
        throw new Error "^ucdb@1001^ unexpected line format in line #{lnr}"
      send PD.new_datom '^entry', { match.groups..., lnr, }
  #.........................................................................................................
  $collect = ( collector ) ->
    last = Symbol 'last'
    return $ { last, }, ( d, send ) ->
      if d is last
        collector.new_by_old[ 'u'       ] = 'u-----'
        collector.old_by_new[ 'u-----'  ] = 'u'
        collector.new_by_old[ 'jzr'     ] = 'jzr---'
        collector.old_by_new[ 'jzr---'  ] = 'jzr'
        return send collector
      collector.new_by_old[ d.old_rsg ] = d.new_rsg
      collector.old_by_new[ d.new_rsg ] = d.old_rsg
  #.........................................................................................................
  # debug FS.readFileSync path
  # debug path
  path      = project_abspath '../../io/mingkwai-rack/jzrds/ucdx/rsgs.txt'
  pipeline  = []
  rsgs      = { new_by_old: {}, old_by_new: {} }
  pipeline.push PD.read_from_file path
  pipeline.push PD.$split()
  pipeline.push $as_datom()
  pipeline.push $collect rsgs
  # pipeline.push PD.$show()
  pipeline.push PD.$drain -> me.rsgs = rsgs; resolve null
  PD.pull pipeline...


#-----------------------------------------------------------------------------------------------------------
@_get_iclabel = ( me, cid, glyph, csg, old_rsg ) ->
  unless ( new_rsg = me.rsgs.new_by_old[ old_rsg ] )?
    throw new Error "^ucdb@1002^ unknown RSG #{rpr old_rsg}"
  # A:uc0---:005750:坐
  switch csg
    when 'u'    then  realm = 'A'; swatch = glyph
    when 'jzr'  then  realm = 'I'; swatch = glyph
    when 'test' then  realm = 'X'; swatch = glyph
    else              realm = 'L'; swatch = '�'
  cid_hex = ( cid.toString 16 ).padStart 6, '0'
  return "#{realm}:#{new_rsg}:#{cid_hex}:#{swatch}"


#===========================================================================================================
# FONTNICKS
#-----------------------------------------------------------------------------------------------------------
@read_fontnicks = ( me ) ->
  R = {}
  for entry in mkts_fontfiles
    fontnick  = @_fontnick_from_texname entry.texname
    filename  = entry.filename
    otf       = entry.otf ? null
    otf_txt   = if otf? then " # #{otf}" else ''
    ### TAINT should collect OTF feature strings as well ###
    # debug "#{fontnick}\t\t\t\t#{filename}#{otf_txt}"
    R[ fontnick ]     = { filename, }
    R[ fontnick ].otf = otf if otf?
  return R

# #-----------------------------------------------------------------------------------------------------------
# @_filesize_from_path = ( me, filepath ) -> ( await FSP.stat filepath ).size

#-----------------------------------------------------------------------------------------------------------
@_build_fontcache = ( me ) -> new Promise ( resolve, reject ) =>
  ### TAINT cache data to avoid walking the tree many times, see https://github.com/isaacs/node-glob#readme ###
  # validate.ucdb_clean_filename filename
  #.........................................................................................................
  fonts_home  = project_abspath '.', 'font-sources'
  pattern     = fonts_home + '/**/*'
  settings    = { matchBase: true, follow: true, stat:true, }
  R           = {}
  info "^ucdb@1003^ building font cache..."
  globber     = new _glob.Glob pattern, settings, ( error, filepaths ) =>
    return reject error if error?
    info "^ucdb@1004^ found #{filepaths.length} files"
    for filepath in filepaths
      unless ( stat = globber.statCache[ filepath ] )?
        ### TAINT stat missing file instead of throwing error ###
        return reject new Error "^77464^ not found in statCache: #{rpr filepath}"
      filename      = PATH.basename filepath
      continue if R[ filename ]?
      filesize      = stat.size
      R[ filename ] = { filepath, filesize, }
    resolve R

#-----------------------------------------------------------------------------------------------------------
@_describe_filename = ( me, filename ) ->
  filepath  = await @_locate_fontfile     me, filename
  filesize  = await @_filesize_from_path  me, filepath
  return { filepath, filesize, }

#-----------------------------------------------------------------------------------------------------------
@populate_table_fontnicks = ( me ) -> new Promise ( resolve, reject ) =>
  me.fontnicks    = @read_fontnicks me
  font_cache      = await @_build_fontcache me
  preamble        = []
  data            = []
  line_count      = 0
  preamble.push me.db.create_table_fontnicks_first()
  #.........................................................................................................
  for fontnick, { filename, otf, } of me.fontnicks
    line_count++
    unless ( cache_entry = font_cache[ filename ] )?
      warn '^4432^', "unable to find fontnick #{fontnick}, filename #{filename}"
      continue
    { filepath
      filesize }    = cache_entry
    otf            ?= null
    row             = { fontnick, filename, filepath, filesize, otf, }
    data.push ( me.db.create_table_fontnicks_middle row ) + ','
  if ( last_idx = data.length - 1 ) > -1
    data[ last_idx ] = data[ last_idx ].replace /,\s*$/g, ''
  #.........................................................................................................
  sql         = [ preamble..., data..., ';', ].join '\n'
  me.db.$.execute sql
  me.line_count += line_count
  resolve null

#-----------------------------------------------------------------------------------------------------------
@_fontnick_from_texname = ( texname ) -> ( texname.replace 'mktsFontfile', '' ).toLowerCase()

#-----------------------------------------------------------------------------------------------------------
@_fontnick_from_tex_block = ( me, tex_block ) ->
  return null unless tex_block?
  # unless tex_block?
  #   throw new Error "^ucdb@1005^ tex_block must not be null"
  unless ( match = tex_block.match /^\\(?<texstyle>[a-zA-Z]+)\{\}$/ )?
    throw new Error "^ucdb@1006^ unexpected tex_block format #{rpr tex_block}"
  texstyle  = style?.cmd ? match.groups.texstyle
  # texstyle  = @_fontnick_from_texname texstyle
  unless ( fontnick = @fontnick_by_texstyles[ texstyle ] )?
    throw new Error "^ucdb@1007^ unknown texstyle #{rpr texstyle}"
  return fontnick

#-----------------------------------------------------------------------------------------------------------
@_fontnick_from_style = ( me, style = null ) ->
  return null unless ( style                )?
  return null unless ( command = style.cmd  )?
  validate.nonempty_text command
  unless ( fontnick = @fontnick_by_texstyles[ command ] )?
    throw new Error "^ucdb@1008^ unknown texstyle #{rpr texstyle}"
  return fontnick

#-----------------------------------------------------------------------------------------------------------
@_fontnick_from_style_or_tex_block = ( me, style, tex_block ) ->
  # try
  fontnick_A = @_fontnick_from_style      me, style
  fontnick_B = @_fontnick_from_tex_block  me, tex_block
  # catch error
  #   if not me._seen_unknown.has error.message
  #     me._seen_unknown.add error.message
  #     warn '^47474', fncr, glyph, error.message
  return fontnick_A ? fontnick_B ? null

#-----------------------------------------------------------------------------------------------------------
@_cleanup_style = ( me, style ) ->
  return null unless style?
  ### Remove redundant `cmd` property, drop empty styles: ###
  delete style.cmd  if style.cmd?
  return if ( Object.keys style ).length is 0 then null else style


#===========================================================================================================
# MAIN TABLE
#-----------------------------------------------------------------------------------------------------------
@populate_table_main = ( me ) -> new Promise ( resolve, reject ) =>
  preamble          = []
  data              = []
  line_count        = 0
  me._seen_unknown  = new Set()
  preamble.push me.db.create_table_main_first()
  await @read_rsgs me
  #.........................................................................................................
  for cid_range in cid_ranges
    #.......................................................................................................
    ### TAINT use casting or call subroutine to derive range iterator ###
    if isa.text cid_range
      cids = ->
        for _glyph in [ cid_range... ]
          yield _glyph.codePointAt 0
    #.......................................................................................................
    else
      cids = ->
        for cid in [ cid_range[ 0 ] .. cid_range[ 1 ] ]
          yield cid
    #.......................................................................................................
    for cid from cids()
      whisper '^ucdb@1009^', ( CND.format_number line_count ) if ( ++line_count % 10000 ) is 0
      description = MKNCR.describe cid
      glyph       = String.fromCodePoint cid
      style       = mkts_glyph_styles[ glyph ] ? null
      tags        = ( description?.tag ? [] ).sort()
      is_u9cjkidg = ( 'assigned' in tags ) and ( 'cjk' in tags ) and ( 'ideograph' in tags )
      tags        = ';' + ( tags.join ';' ) + ';'
      csg         = description?.csg            ? null
      rsg         = description?.rsg            ? null
      fncr        = description?.fncr           ? null
      sfncr       = description?.sfncr          ? null
      ncr         = description?.ncr            ? null
      xncr        = description?.xncr           ? null
      iclabel     = @_get_iclabel me, cid, glyph, csg, rsg
      # tex_glyph   = description?.tex?.codepoint ? null
      #.....................................................................................................
      tex_block   = description?.tex?.block     ? null
      fontnick    = @_fontnick_from_style_or_tex_block me, style, tex_block
      unless fontnick?
        warn "^ucdb@1010^ missing fontnick for #{fncr} #{glyph}"
        continue
      style       = jr @_cleanup_style me, style
      #.....................................................................................................
      row         = {
        iclabel, glyph, cid, is_u9cjkidg, tags,
        csg, rsg, fncr, sfncr, ncr, xncr,
        fontnick, style, }
        # fontnick, style, tex_block, tex_glyph, }
      data.push ( me.db.create_table_main_middle row ) + ','
  #.........................................................................................................
  if ( last_idx = data.length - 1 ) > -1
    data[ last_idx ] = data[ last_idx ].replace /,\s*$/g, ''
  #.........................................................................................................
  sql             = [ preamble..., data..., ';', ].join '\n'
  me.db.$.execute sql
  me.line_count  += line_count
  me.db.create_main_indexes()
  #.........................................................................................................
  ### Fallback glyph: ###
  if ( style = mkts_options.tex.fallback_glyph )?
    line_count++
    fontnick        = @_fontnick_from_style_or_tex_block me, style, null
    style           = jr @_cleanup_style me, style
    me.db.insert_fallback { fontnick, style, }
  #.........................................................................................................
  resolve { line_count, }
  return null


#===========================================================================================================
# OUTLINES
#-----------------------------------------------------------------------------------------------------------
@create_table_outlines = ( me ) ->
  me.db.create_table_outlines()
  return null

############################################################################################################
############################################################################################################
############################################################################################################
### TAINT these methods or part of them will probably go into SvgTtf ###
@_get_pathdata = ( SVGTTF_font, cid, tag = 'use-quickscale' ) ->
  ### TAINT need at least glyph.advanceWidth as well ###
  R = SVGTTF.glyph_and_pathdata_from_cid SVGTTF_font.metrics, SVGTTF_font.otjsfont, cid, tag
  return if R? then R else null

############################################################################################################
############################################################################################################
############################################################################################################


#-----------------------------------------------------------------------------------------------------------
@filepath_from_fontnick = ( me, fontnick ) -> me.db.$.single_value me.db.filepath_from_fontnick { fontnick, }

#-----------------------------------------------------------------------------------------------------------
@populate_table_outlines = ( me ) ->
  @create_table_outlines me
  XXX_includes      = 'jizurafourbmp'.split /\s+/
  XXX_includes      = 'sunexta kai babelstonehan'.split /\s+/
  XXX_sql           = """select * from main where cid between 0x4e00 and 0xffff order by iclabel;"""
  glyphrows         = ( row           for row from me.db.$.query XXX_sql        )
  fontnicks         = ( row.fontnick  for row from me.db.walk_fontnick_table()  )
  me._outline_count = 0
  for fontnick in fontnicks
    # continue unless fontnick in XXX_includes
    info "^ucdb@1011^ adding outlines for #{fontnick}"
    @_insert_into_table_outlines me, fontnick, glyphrows
  return null

#-----------------------------------------------------------------------------------------------------------
@_insert_into_table_outlines = ( me, fontnick, glyphrows ) ->
  ### NOTE to be called once for each font with all or some cid_ranges ###
  preamble          = []
  data              = []
  line_count        = 0
  batch_size        = 5000
  # fragment insert_into_outlines_first(): insert into outlines ( iclabel, fontnick, pathdata ) values
  #.........................................................................................................
  ### TAINT refactor ###
  SVGTTF_font                 = {}
  SVGTTF_font.nick            = fontnick
  SVGTTF_font.path            = @filepath_from_fontnick me, fontnick
  SVGTTF_font.metrics         = SVGTTF.new_metrics()
  try
    SVGTTF_font.otjsfont        = SVGTTF.otjsfont_from_path SVGTTF_font.path
  catch error
    warn "^ucdb@1012^ when trying to open font #{rpr fontnick}, an error occurred: #{error.message}"
    return null
  # return null
  SVGTTF_font.advance_factor  = SVGTTF_font.metrics.em_size / SVGTTF_font.otjsfont.unitsPerEm
  XXX_advance_scale_factor    = SVGTTF_font.advance_factor * ( SVGTTF_font.metrics.global_glyph_scale ? 1 )
  # tag                         = 'use-dumb-svg-parser'
  # tag                         = 'use-svgpath'
  tag                         = 'use-quickscale'
  #.........................................................................................................
  for { iclabel, cid, glyph, } from cast.iterator glyphrows
    continue unless ( d = @_get_pathdata SVGTTF_font, cid, tag )?
    ### TAINT refactor ###
    { glyph
      pathdata }      = d
    whisper '^ucdb@1013^', me._outline_count - 1 if ( me._outline_count++ % 1000 ) is 0
    ### TAINT refactor ###
    advance           = glyph.advanceWidth * XXX_advance_scale_factor
    advance           = 1 if advance is 0 ### !!!!!!!!!!!!!!!!!!!!!!!!!!!! ###
    data.push ( me.db.insert_into_outlines_middle { iclabel, fontnick, advance, pathdata, } ) + ','
    if data.length >= batch_size
      line_count += @_flush_outlines me, data
  #.........................................................................................................
  line_count += @_flush_outlines me, data
  #.........................................................................................................
  return line_count

#-----------------------------------------------------------------------------------------------------------
@_flush_outlines = ( me, data ) ->
  return 0 if data.length is 0
  ### TAINT code duplication, use ICQL method (TBW) ###
  line_count        = data.length
  last_idx          = line_count - 1
  data[ last_idx ]  = data[ last_idx ].replace /,\s*$/g, ''
  sql               = me.db.insert_into_outlines_first() + '\n' + ( data.join '\n' ) + ';'
  me.db.$.execute sql
  me.line_count    += line_count
  data.length       = 0
  return line_count

#-----------------------------------------------------------------------------------------------------------
@create_outlines_indexes = ( me ) ->
  ### NOTE to be called once when all outlines for all fonts have been inserted ###
  me.db.create_outlines_indexes()
  return null


#===========================================================================================================
# DB CREATION
#-----------------------------------------------------------------------------------------------------------
@new_ucdb = ( settings = null ) ->
  defaults =
    db_path:    project_abspath './db/ucdb.db'
    icql_path:  project_abspath './db/ucdb.icql'
  #.........................................................................................................
  settings                = { defaults..., settings..., }
  validate.ucdb_settings settings
  #.........................................................................................................
  R                       = {}
  R.db                    = ( require './db' ).new_db settings
  R.dbr                   = R.db
  R.dbw                   = ( require './db' ).new_db settings
  R.line_count            = 0
  return R

#-----------------------------------------------------------------------------------------------------------
@create = ( settings = null ) -> new Promise ( resolve, reject ) =>
  me = @new_ucdb settings
  await @populate_table_fontnicks   me
  await @populate_table_main        me
  await @populate_table_outlines    me
  # me.db.create_view_main_with_deltas_etc()
  resolve me

#-----------------------------------------------------------------------------------------------------------
@write_ucdb = ( settings = null ) ->
  t0      = Date.now()
  try
    ucdb  = await @create settings
  catch error
    warn error.message
    process.exit 1
  t1      = Date.now()
  dt      = t1 - t0
  dts     = ( dt / 1000 ).toFixed 3
  f       = ( ucdb.line_count / dt * 1000 ).toFixed 3
  help "^ucdb@1014^ wrote #{ucdb.line_count} records in #{dts} s (#{f} Hz)"
  return null
  # count = 0
  # for row from ucdb.db.read_lines()
  #   count++
  #   break if count > 5
  #   info 'µ33211', jr row
  # help 'ok'

#-----------------------------------------------------------------------------------------------------------
### TAINT must go to configuration file ###
@fontnick_by_texstyles =
  latin:                                'lmromantenregular'
  cnjzr:                                'jizurathreeb'
  cnxa:                                 'sunexta'
  cnxb:                                 'sunflowerucjkxb'
  cnxc:                                 'hanaminb'
  cnxd:                                 'babelstonehan'
  cn:                                   'sunexta'
  hg:                                   'nanummyeongjo'
  hi:                                   'ipamp'
  ka:                                   'ipamp'
  mktsRsgFb:                            'sunexta'
  cncone:                               'babelstonehan' # CJK Compatibility 1
  cnUcjkcmp:                            'ipaexm'        # CJK Compatibility 1
  cnUcjkcmpf:                           'hanamina'      # CJK Compatibility 1
  cnUcjkcmpione:                        'hanamina'      # CJK Compatibility 1
  cnUcjkcmpitwo:                        'hanamina'      # CJK Compatibility 2
  cnrone:                               'sunexta'       # CJK Radicals 1
  cnrtwo:                               'sunexta'       # CJK Radicals 2
  cnsym:                                'hanamina'
  cnstrk:                               'sunexta'
  cnencsupp:                            'sarasaregular'
  cnxBabel:                             'babelstonehan'
  cnxHanaA:                             'hanamina'
  cnxHanaB:                             'hanaminb'
  cnxSunXA:                             'sunexta'
  cnxUming:                             'uming'
  #.........................................................................................................
  cnxJzr:                               'jizurathreeb'
  mktsFontfileAsanamath:                'asanamath'
  mktsFontfileCwtexqheibold:            'cwtexqheibold'
  mktsFontfileDejavuserif:              'dejavuserif'
  mktsFontfileEbgaramondtwelveregular:  'ebgaramondtwelveregular'
  mktsFontfileNanummyeongjo:            'nanummyeongjo'
  mktsFontfileSunexta:                  'sunexta'
  mktsStyleBoxDrawing:                  'iosevkatermslabmedium'

#-----------------------------------------------------------------------------------------------------------
### TAINT must go to configuration file ###
@fontnick_by_rsgs =
  'u-cjk-cmpi1':          'babelstonehan'
  'u-cjk-xd':             'babelstonehan'
  'u-cjk-sym':            'hanamina'
  'u-cjk-xc':             'hanaminb'
  'u-cjk-hira':           'ipamp'
  'u-cjk-kata':           'ipamp'
  'jzr':                  'jizurathreeb'
  'u-cdm':                'lmromantenregular'
  'u-cyrl':               'lmromantenregular'
  'u-cyrl-s':             'lmromantenregular'
  'u-grek':               'lmromantenregular'
  'u-latn':               'lmromantenregular'
  'u-latn-a':             'lmromantenregular'
  'u-latn-b':             'lmromantenregular'
  'u-punct':              'lmromantenregular'
  'u-latn-1':             'lmromantenregular'
  'u-hang-syl':           'nanummyeongjo'
  'u-arrow':              'sunexta'
  'u-arrow-b':            'sunexta'
  'u-boxdr':              'sunexta'
  'u-cjk-cmpf':           'sunexta'
  'u-llsym':              'sunexta'
  'u':                    'sunexta'
  'u-cjk-strk':           'sunexta'
  'u-cjk-xa':             'sunexta'
  'u-geoms':              'sunexta'
  'u-cjk':                'sunexta'
  'u-cjk-rad2':           'sunexta'
  'u-cjk-xb':             'sunflowerucjkxb'

# keys = [ 'cn', 'cncone', 'cnjzr', 'cnrone', 'cnrtwo', 'cnstrk', 'cnsym', 'cnxa', 'cnxb', 'cnxBabel', 'cnxc',
#   'cnxd', 'cnxHanaA', 'cnxHanaB', 'cnxJzr', 'cnxSunXA', 'cnxUming', 'hg', 'hi', 'ka', 'latin',
#   'mktsFontfileAsanamath', 'mktsFontfileCwtexqheibold', 'mktsFontfileDejavuserif',
#   'mktsFontfileEbgaramondtwelveregular', 'mktsFontfileNanummyeongjo', 'mktsFontfileSunexta', 'mktsRsgFb',
#   'mktsStyleBoxDrawing', ]

# for key in keys
#   info key unless @fontnick_by_texstyles[ key ]?


# #-----------------------------------------------------------------------------------------------------------
# @_find_fontnick_ranges = ( me = null ) ->
#   me ?= @new_ucdb()
#   me.db.create_view_main_with_deltas_etc()
#   # for row from me.db.main_with_deltas()
#   #   info '^77763^', row.iclabel, row.fontnick, row.rear_delta_cid, row.fore_delta_cid
#   for row from me.db.fontnick_boundaries()
#     # help '^77456^', row
#     help '^77763^', \
#       ( CND.yellow row.fontnick.padEnd 30 ),            \
#       ( CND.blue row.first_iclabel        ),            \
#       ( CND.blue row.last_iclabel         ),            \
#       ( CND.grey row.first_cid            ),            \
#       ( CND.grey row.last_cid             )
#       # ( CND.yellow row.cid.toString 16 ), \
#       # ( CND.orange if row.last_cid? then row.next_cid.toString 16 else '' )

############################################################################################################
if require.main is module then do =>
  # info await @_build_fontcache null
  await @write_ucdb()
  # # await @read_rsgs null
  # @_find_fontnick_ranges()
  # help await @_describe_filename null, 'DejaVuSansMono-Bold.ttf'
  # help await @_describe_filename null, 'TH-Khaai-TP2.ttf'
  # help await @_locate_fontfile 'TH-Khaai-*.ttf'

# all_tags = """ascii-whitespace assigned bopomofo cjk geta hangeul hexagram hiragana ideograph idl jamo
#   japanese kana kanbun katakana korean kxr punctuation stroke syllable symbol trigram unassigned vertical
#   yijing"""




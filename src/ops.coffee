
'use strict'



############################################################################################################
debug                     = console.log
alert                     = console.log
whisper                   = console.log
warn                      = console.log
help                      = console.log
urge                      = console.log
info                      = console.log
log                       = console.log

#-----------------------------------------------------------------------------------------------------------
makeSVG = ( tag, attributes ) ->
  ### thx to https://stackoverflow.com/a/3642265 ###
  element = document.createElementNS 'http://www.w3.org/2000/svg', tag
  for k, v of attributes
    element.setAttribute k, v
  return element

#-----------------------------------------------------------------------------------------------------------
pathdata_from_glyph = ( fontnick, glyph ) ->
  ### TAINT use proper procedures to build URL, query ###
  rsp = await fetch "/svg/fontnick/#{fontnick}/glyph/#{glyph}"
  unless rsp.ok
    log '^ucdb/ops@6672^ error', rsp.status
    return null
  return await rsp.text()

#-----------------------------------------------------------------------------------------------------------
fetch_fontnicks = ->
  url = COMMON.get_url '/v2/fontnicks'
  # url = COMMON.get_url '/v2/fontnicks', { lat:35.696233, long:139.570431, }
  rsp = await fetch url
  unless rsp.ok
    log '^ucdb/ops@6672^ error', rsp.status
    return null
  return await rsp.json()

#-----------------------------------------------------------------------------------------------------------
fetch_glyphsamples_from_fontnick = ( fontnick ) ->
  ### TAINT use proper procedures to build URL, query ###
  rsp = await fetch "/v2/glyphsamples/#{fontnick}"
  unless rsp.ok
    log '^ucdb/ops@6672^ error', rsp.status
    return null
  return await rsp.json()

#-----------------------------------------------------------------------------------------------------------
S =
  fontnicks: null

############################################################################################################
( jQuery 'document' ).ready ->
  log "^ucdb/ops@6672^ helo from UCDB"
  S.fontnicks = await fetch_fontnicks()
  log '^ucdb/web/ops@245337^', 'fontnicks:', S.fontnicks
  count = 0
  # for fontnick in S.fontnicks
  #   continue unless ( sample = await fetch_glyphsamples_from_fontnick fontnick )?
  #   count++
  #   break if count > 3
  #   log '^887^', fontnick, sample
  # #---------------------------------------------------------------------------------------------------------
  # log '^ucdb/ops@6672^ pathdata', ( await pathdata_from_glyph 'cwtexqheibold',    '國' )[ ... 100 ] + '...'
  # log '^ucdb/ops@6672^ pathdata', ( await pathdata_from_glyph 'cwtexqheibold',    '鼎' )[ ... 100 ] + '...'
  # log '^ucdb/ops@6672^ pathdata', ( await pathdata_from_glyph 'sunexta',          '鼎' )[ ... 100 ] + '...'
  # log '^ucdb/ops@6672^ pathdata', ( await pathdata_from_glyph 'fandolkairegular', '亥' )[ ... 100 ] + '...'

  # #---------------------------------------------------------------------------------------------------------
  # circle = makeSVG 'circle', { cx: 100, cy: 50, r: 40, stroke: 'black', 'stroke-width': 2, fill: 'red', }
  # ( document.getElementById 'internalsvg' ).appendChild circle
  # circle.onmousedown = -> alert 'helo circle'

  # triangle2 = makeSVG 'path', { 'fill': 'red', 'stroke': 'green', 'stroke-width': '5', 'd': 'M 0 100 L 80 80 50 50 50 20 Z', }
  # ( document.getElementById 'internalsvg' ).appendChild triangle2
  # triangle2.onmousedown = -> alert 'helo triangle2'

  # $('#internalsvg').append( "<symbol id='triangle2' viewBox='0 0 100 100'><path fill='red' stroke='green' stroke-width='5' d='M 0 100 L 80 80 50 50 50 20 Z'/></symbol>" )



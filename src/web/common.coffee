
'use strict'

### This module is shared by server and client ###

#-----------------------------------------------------------------------------------------------------------
get_url = ( path, facets... ) ->
  ### TAINT lists are silently converted with `toString()` ###
  p   = Object.assign {}, facets...
  return path if ( Object.keys p ).length is 0
  p   = new URLSearchParams p
  return path + '?' + p


############################################################################################################
exports = { get_url, }
if module?
	module.exports = exports
else
	window.COMMON = exports


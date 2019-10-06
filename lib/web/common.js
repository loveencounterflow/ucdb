(function() {
  'use strict';
  var exports, get_url;

  /* This module is shared by server and client */
  //-----------------------------------------------------------------------------------------------------------
  get_url = function(path, ...facets) {
    /* TAINT lists are silently converted with `toString()` */
    var p;
    p = Object.assign({}, ...facets);
    if ((Object.keys(p)).length === 0) {
      return path;
    }
    p = new URLSearchParams(p);
    return path + '?' + p;
  };

  //###########################################################################################################
  exports = {get_url};

  if (typeof module !== "undefined" && module !== null) {
    module.exports = exports;
  } else {
    window.COMMON = exports;
  }

}).call(this);
(function(global){
  'use strict';

  var bind = function (func, oThis) {
    if (typeof func !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 2),
      fToBind = func,
      fNOP = function () {},
      fBound = function () {
        return fToBind.apply(this instanceof fNOP && oThis
          ? this
          : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments)));
      };

    fNOP.prototype = func.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };

  var nInstaller = {
    init: function(manifestUrl, callback) {
      var xhr = new XMLHttpRequest();

      xhr.onload = bind(this.initSuccess, this, xhr, callback);
      xhr.open('GET', manifestUrl, true);
      xhr.send();
    },

    initSuccess: function(xhr, callback) {
      var manifestText = xhr.responseText;
      var manifest = JSON.parse(manifestText);
      console.log(manifest);
    }
  };

  global.nInstaller = nInstaller;

})(window);

(function(global){
  'use strict';

  /**
   * 関数を指定されてオブジェクトに束縛する.
   * @param {function} func 束縛する関数.
   * @param {Object} oThis 束縛するオブジェクト.
   * @param {...*} [var_args=] 束縛する引数.
   * @returns {Function} 束縛された関数.
   */
  var bind = function (func, oThis, var_args) {
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

  global.nInstaller = {
    /**
     * 指定されたmanifestを読み込んでリソースのインストールを行う.
     * @param {string} manifestUrl manifest.jsonのURL.
     * @param {function} callback リソースのインストールが終わった後に実行されるコールバック関数.
     */
    init: function(manifestUrl, callback) {
      var xhr = new XMLHttpRequest();

      xhr.onload = bind(this._initSuccess, this, xhr, callback);
      xhr.open('GET', manifestUrl, true);
      xhr.send();
    },

    /**
     * manifest読み込み完了時に実行される.
     * @param {XMLHttpRequest} xhr
     * @param {function} callback インストール完了時に実行されるコールバック関数.
     * @private
     * @callback
     */
    _initSuccess: function(xhr, callback) {
      var manifestText = xhr.responseText;
      var manifest = JSON.parse(manifestText);
      console.log(manifest);
    }
  };

})(window);

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

  var arrayToMap = function(array, key) {
    var result = {};
    for (var i = 0; i < array.length; i++) {
      var val = array[i];
      result[val[key]] = val;
    }
    return result;
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
      var newManifest = JSON.parse(manifestText);

      var seq = new this.CallbackSeq();
      seq.addAsync(bind(this._getCurrentManifest, this));
      seq.addSync(bind(this._getNewResource, this), newManifest);
      seq.addAsync(bind(this._fetchResources, this));
      seq.addAsync(bind(this._saveResources, this));
      seq.addAsync(bind(this._completeInit, this));

      seq.start();

    },

    _completeInit: function() {
      console.log('complete!!!');
    },

    _saveResources: function(resources, callback) {
      var db = openDatabase('ninstaller', "0.1", "nInstaller", 5 * 1000 * 1000);
      db.transaction(transaction, error, success);

      function transaction(tr) {
        tr.executeSql('CREATE TABLE IF NOT EXISTS js (path TEXT PRIMARY KEY, md5 TEXT, time TEXT, content TEXT)', []);
        for (var i = 0; i < resources.length; i++) {
          var res = resources[i];
          tr.executeSql('INSERT OR REPLACE INTO js (path, md5, time, content) VALUES (?, ?, ?, ?)', [res.path, res.md5, res.time, res.content]);
        }
      }

      function error(e) {
        console.log(e);
      }

      function success() {
        callback();
      }
    },

    _fetchResources: function(resources, callback) {
      var index = 0;
      var xhr = new XMLHttpRequest();

      //TODO: 並列読み込みにする
      function fetch(){
        if (resources.length === index) {
          callback(resources);
          return;
        }

        var res = resources[index];
        xhr.onload = function(){
          var content = xhr.responseText;
          res.content = content;
          index++;
          fetch();
        };
        xhr.open('GET', res.path, true);
        xhr.send();
      }

      fetch(xhr);
    },

    /**
     * 現在のマニフェストと新しいマニフェストを比較して必要なリソース情報を取得する.
     * @param {Object} newManifest 新しいマニフェスト.
     * @param {Object} currentManifest 現在のマニフェスト.
     * @returns {Object[]} リソース情報の配列.
     * @private
     */
    _getNewResource: function(newManifest, currentManifest) {
      var resources;
      if (!currentManifest) {
        resources = [].concat(newManifest.js.resources);
      } else {
        resources = [];
        var currentResourcesMap = arrayToMap(currentManifest.js.resources, 'path');
        var newResources = newManifest.js.resouces;
        for (var i = 0; i < newResources.length; i++) {
          var newResource = newResources[i];
          var currentResource = currentResourcesMap[newResource.path];
          if (newResource.md5 !== currentResource.md5) {
            resources.push(newResource);
          }
        }
      }

      return resources;
    },

    /**
     * 現在のマニフェストを取得する.
     * @param {function(currentManifest: Object)} callback 現在のマニフェスト取得完了時に実行されるコールバック関数.
     * @private
     */
    _getCurrentManifest: function(callback) {
      var db = openDatabase('ninstaller', "0.1", "nInstaller", 5 * 1000 * 1000);
      db.transaction(transaction, error);

      function transaction(tr) {
        tr.executeSql('CREATE TABLE IF NOT EXISTS manifest (manifest TEXT)');
        tr.executeSql('SELECT * from manifest', null, function(transaction, result){
          if (result.rows.length < 1) {
            callback(null);
          } else {
            var row =  result.rows.item(0);
            callback(JSON.parse(row.manifest));
          }
        });
      }

      function error(e) {
        console.error(e);
      }

    }
  };

})(window);

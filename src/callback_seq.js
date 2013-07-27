(function(global){
  'use strict';

  /**
   * 非同期の関数実行をネストせずに記述するための単純なクラス.
   * @constructor
   * @example
   * var seq = new CallbackSeq();
   * seq.addAsync(function(cb){ setTimeout(function(){ cb(10); }, 10) });
   * seq.addSync(function(val){ return val * 10; });
   * seq.addAsync(function(val, cb){ cb(val / 2, 'hello'); });
   * seq.addSync(function(val1, val2){ console.log(val1, val2); });
   * seq.start();
   */
  var CallbackSeq = function(){
    this._seq = [];
    var _this = this;
    this._nextBoundThis = function(){
      _this._next.apply(_this, arguments);
    };
  };

  var prototype = {
    /**
     * 関数をシーケンスに追加する.
     * @param {boolean} async 非同期関数を登録する場合はtrueを指定.
     * @param {function} func 追加する関数.
     * @param {...*} [var_args=] 関数実行時に渡す引数を事前に決定しておく場合に指定する.
     */
    add: function(async, func, var_args) {
      var args = Array.prototype.slice.call(arguments, 2);
      this._seq.push({
        func: func,
        args: args,
        async: async
      });
    },

    /**
     * 非同期関数をシーケンスに追加する.
     * @param {function} func 追加する関数.
     * @param {...*} [var_args=] 関数実行時に渡す引数を事前に決定しておく場合に指定する.
     */
    addAsync: function(func, var_args) {
      var args = Array.prototype.slice.call(arguments);
      this.add.apply(this, [true].concat(args));
    },

    /**
     * 同期関数をシーケンスに追加する.
     * @param {function} func 追加する関数.
     * @param {...*} [var_args=] 関数実行時に渡す引数を事前に決定しておく場合に指定する.
     */
    addSync: function(func, var_args) {
      var args = Array.prototype.slice.call(arguments);
      this.add.apply(this, [false].concat(args));
    },

    /**
     * シーケンスを開始する.
     */
    start: function(){
      this._nextBoundThis();
    },

    /**
     * シーケンスを1つ進めて関数を実行する.
     * @param {...*} [var_args=] 関数実行時に渡す引数.
     * @private
     */
    _next: function(var_args) {
      if (this._seq.length === 0) {
        return;
      }

      var seq = this._seq.shift();
      var func = seq.func;
      var args = seq.args;
      var async = seq.async;

      args = args.concat(Array.prototype.slice.call(arguments));

      if (async) {
        args.push(this._nextBoundThis);
        func.apply(null, args);
      } else {
        var result = func.apply(null, args);
        var _this = this;
        setTimeout(function(){
          _this._nextBoundThis.call(_this, result);
        }, 0);
      }
    }
  };

  prototype.constructor = CallbackSeq;
  CallbackSeq.prototype = prototype;

  global.nInstaller = global.nInstaller || {};
  global.nInstaller.CallbackSeq = CallbackSeq;
})(window);

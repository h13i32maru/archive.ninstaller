AsyncTestCase('CallbackSeqTest', {
  'test create CallbackSeq instance': function(){
    var seq = new nInstaller.CallbackSeq();

    assertInstanceOf('hoge', nInstaller.CallbackSeq, seq);
  },

  'test callback sequence': function(queue){
    var seq = new nInstaller.CallbackSeq();
    var count = 0;

    queue.call('each callback', function(callbacks){
      var func1 = callbacks.add(function (cb){
        count++;
        setTimeout(function(){
          cb(10);
        }, 10);
      });

      var func2 = callbacks.add(function (val) {
        count++;
        assertSame(10, val);
        return val * 10;
      });

      var func3 = callbacks.add(function (val, cb) {
        count++;
        assertSame(100, val);
        setTimeout(function(){
          cb(val / 2, 'hello');
        }, 10);
      });

      var func4 = callbacks.add(function (val1, val2) {
        count++;
        assertSame(50, val1);
        assertSame('hello', val2);
        assertSame(4, count);
      });

      seq.addAsync(func1);
      seq.addSync(func2);
      seq.addAsync(func3);
      seq.addSync(func4);
      seq.start();
    });
  }
});

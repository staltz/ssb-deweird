const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('tape');
const pull = require('pull-stream');
const ssbKeys = require('ssb-keys');
const SecretStack = require('secret-stack');
const caps = require('ssb-caps');

const CreateSSB = SecretStack({appKey: caps.shs})
  .use(require('../producer'))
  .use(require('../consumer'))
  .use({
    name: 'testy',
    init: function init() {
      return {
        stuff: function () {
          return pull.values([10, 20, 30]);
        },
        multiarg: function (a, b, c) {
          return pull.values([a + 1, b + 1, c + 1]);
        },
      };
    },
  });

const CreateSSBOther = SecretStack({appKey: caps.shs})
  .use(require('../producer'))
  .use(require('../index'))
  .use({
    name: 'testy',
    init: function init() {
      return {
        stuff: function () {
          return pull.values([10, 20, 30]);
        },
      };
    },
  });

const lucyKeys = ssbKeys.generate();

test('deweird can pull a stream', (t) => {
  const ssb = CreateSSB({
    path: fs.mkdtempSync(path.join(os.tmpdir(), 'deweird-test1')),
    temp: true,
    name: 'test1',
    keys: lucyKeys,
  });

  pull(
    ssb.deweird.source(['testy', 'stuff']),
    pull.collect((err, arr) => {
      t.error(err);
      t.deepEqual(arr, [10, 20, 30]);
      ssb.close(t.end);
    }),
  );
});

test('index.js plugin is the consumer', (t) => {
  const ssb = CreateSSBOther({
    path: fs.mkdtempSync(path.join(os.tmpdir(), 'deweird-test1')),
    temp: true,
    name: 'test1',
    keys: lucyKeys,
  });

  pull(
    ssb.deweird.source(['testy', 'stuff']),
    pull.collect((err, arr) => {
      t.error(err);
      t.deepEqual(arr, [10, 20, 30]);
      ssb.close(t.end);
    }),
  );
});

test('deweird can cancel a stream mid way', (t) => {
  const ssb = CreateSSB({
    path: fs.mkdtempSync(path.join(os.tmpdir(), 'deweird-test2')),
    temp: true,
    name: 'test2',
    keys: lucyKeys,
  });

  pull(
    ssb.deweird.source(['testy', 'stuff']),
    pull.take(1),
    pull.collect((err, arr) => {
      t.error(err);
      t.deepEqual(arr, [10]);
      ssb.close(t.end);
    }),
  );
});

test('deweird supports multiple arguments', (t) => {
  const ssb = CreateSSB({
    path: fs.mkdtempSync(path.join(os.tmpdir(), 'deweird-test3')),
    temp: true,
    name: 'test3',
    keys: lucyKeys,
  });

  pull(
    ssb.deweird.source(['testy', 'multiarg'], [100, 200, 300]),
    pull.collect((err, arr) => {
      t.error(err);
      t.deepEqual(arr, [101, 201, 301]);
      ssb.close(t.end);
    }),
  );
});

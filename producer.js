const debug = require('debug')('deweird');

module.exports = {
  name: 'deweirdProducer',
  version: '1.0.0',
  manifest: {
    start: 'async',
    more: 'async',
    close: 'async',
  },
  permissions: {
    master: {
      allow: ['start', 'more', 'close'],
    },
  },

  init: function init(ssb) {
    const streams = new Map();
    let lastId = 0;

    function callNamespace(namespace, args) {
      let result = ssb;
      for (const name of namespace) {
        if (result[name]) {
          result = result[name];
        } else {
          throw new Error(
            'deweird cannot call undefined sbot.' + namespace.join('.'),
          );
        }
      }
      if (Array.isArray(args)) {
        return result(...args);
      } else {
        return result(args);
      }
    }

    return {
      start(namespace, args, cb) {
        const id = ++lastId;
        const stream = callNamespace(namespace, args);
        streams.set(id, stream);
        if (debug.enabled) {
          const method = namespace.join('.');
          const _args = Array.isArray(args)
            ? args.map((a) => JSON.stringify(a)).join(',')
            : JSON.stringify(args);
          debug(`deweird start #${id} sbot.${method}(${_args})`);
        }
        stream(null, (err, data) => {
          if (err) cb(err);
          else cb(null, {id, data});
        });
      },

      more(id, cb) {
        if (!streams.has(id)) {
          throw new Error(`deweird cannot pull unknown stream #${id}`);
        }
        const stream = streams.get(id);
        debug(`deweird more #${id}`);
        stream(null, cb);
      },

      close(id, err, cb) {
        if (!streams.has(id)) {
          throw new Error(`deweird cannot close unknown stream #${id}`);
        }
        const stream = streams.get(id);
        debug(`deweird close #${id}`);
        stream(err, cb);
        streams.delete(id);
      },
    };
  },
};

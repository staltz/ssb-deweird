module.exports = {
  name: 'deweird',
  version: '1.0.0',
  manifest: {
    source: 'source',
  },
  permissions: {
    master: {
      allow: ['source'],
    },
  },

  init: function init(ssb) {
    return {
      source(namespace, opts) {
        let id = null;
        return function readable(end, cb) {
          if (end) {
            if (id) ssb.deweirdProducer.close(id, end, () => {});
            return cb(end);
          }

          if (!id) {
            ssb.deweirdProducer.start(namespace, opts, (err, result) => {
              if (err) return cb(err);
              id = result.id;
              cb(null, result.data);
            });
          } else {
            ssb.deweirdProducer.more(id, (err, data) => {
              if (err) return cb(err);
              cb(null, data);
            });
          }
        };
      },
    };
  },
};

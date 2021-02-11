# ssb-deweird

**Fixes some buggy stuff in muxrpc. Allows a muxrpc `source` to have normal pull-stream backpressure**

This package provides two secret-stack plugins, one for the "frontend" of your SSB app, and another for the "backend". It also works over the network, where you would put one plugin on the producer-side (the side which provides a muxrpc `source`) and another on the consumer-side (the side which is calling the muxrpc `source`).

## Usage

```
npm install --save ssb-deweird
```

Install the **producer** plugin on the backend side (where the ssb-server typically is):

```diff
 var createSsbServer = require('ssb-server')
     .use(require('ssb-unix-socket'))
     .use(require('ssb-no-auth'))
     .use(require('ssb-plugins'))
     .use(require('ssb-master'))
     .use(require('ssb-conn'))
     .use(require('ssb-about'))
+    .use(require('ssb-deweird/producer'))
     .use(require('ssb-replicate'))
     .use(require('ssb-friends'))
     // ...
```

Install the **consumer** plugin on the frontend (e.g. [react-native-ssb-client](https://github.com/staltz/react-native-ssb-client) or [electron-ssb-client](https://github.com/staltz/electron-ssb-client)):

```diff
 import ssbClient from 'react-native-ssb-client'
+const deweird = require('ssb-deweird/consumer')

 // ...

 ssbClient(keys, manifest)
+  .use(require('ssb-deweird/consumer'))
   .call(null, (err, ssb) => {
     pull(
-      ssb.about.socialValueStream({key:'name', dest: ssb.id}),
+      ssb.deweird.source(['about', 'socialValueStream'], {key:'name', dest: ssb.id}),
       pull.drain((msg) => {
         // ...
       })
     )
   })
```

### API

`ssb.deweird.source(namespace, args)`

**1st argument** `namespace`: Notice that the method is converted to an array of strings that specify the namespace of the muxrpc method.

**2nd argument** `args`: This is forwarded to the underlying muxrpc method. It supports either one value, or multiple values **if you put them in an array**. For instance `ssb.deweird.source(namespace, {key:'name',dest})` OR `ssb.deweird.source(namespace, [{key:'name',dest}])`.

## License

MIT

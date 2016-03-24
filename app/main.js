// Filename: main.js  
// Timestamp: 2016.03.24-00:47:08 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

const cyclecore = require('@cycle/core'),
      cyclehttp = require('@cycle/http'),
      cycledom = require('@cycle/dom'),
      todo = require('./todo');

cyclecore.run(sources => ({
  DOM  : todo.DOM(sources),
  HTTP : todo.HTTP(sources)    
}), {
  // drivers
  DOM  : cycledom.makeDOMDriver('#root'),
  HTTP : cyclehttp.makeHTTPDriver()
});


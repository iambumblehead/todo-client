// Filename: todo_listerr.js  
// Timestamp: 2016.03.23-02:29:27 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

import {i,p,div} from '@cycle/dom';

var todo_listerr = module.exports = (o => {

  o.view = (state, { uid, value }) => (
    div('.ui.negative.message', [
      i('.close.icon.closeerr', {
        dataset: { uid : uid }
      }),
      div('.header', 'duplcate value added'),
      p('.whatever', value)
    ])
  );

  return o;
  
})({});

// Filename: todo_listerr.js  
// Timestamp: 2016.03.24-02:03:13 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

import {i,p,div} from '@cycle/dom';

var todo_listerr = module.exports = (o => {

  const todoUID = elem => (
    elem.dataset.uid
  );  
  
  o.view = (state, { uid, value }) => (
    div('.ui.negative.message', [
      i('.close.icon.closeerr', {
        dataset: { uid : uid }
      }),
      div('.header', 'duplcate value added'),
      p('.whatever', value)
    ])
  );

    o.intent = DOM => {
      const closeerr$ = DOM.select('.closeerr')
            .events('click')
            .map(e => (e.preventDefault(), e.target))
            .map(elem => ({
              uid   : todoUID(elem)
            }));

      return {
        closeerr$
      };
    };
  

  return o;
  
})({});

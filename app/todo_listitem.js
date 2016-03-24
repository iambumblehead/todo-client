// Filename: todo_listitem.js  
// Timestamp: 2016.03.24-01:55:31 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

import {label,input,div,span,a} from '@cycle/dom';

var todo_listitem = module.exports = (o => {

  const todoLabelText = elem => (
    elem.dataset.todomode === 'EDIT'
      ? elem.getElementsByClassName('todo_save')[0].value
      : elem.getElementsByClassName('todo_label')[0].innerText    
  );

  const todoUID = elem => (
    elem.dataset.uid
  );  

  o.view = (state, { uid, mode, value }) => (
    div('.ui.column.stackable.grid.todo_listitem', [
      div ('.column', {
        dataset: { uid : uid, todomode : mode }
      }, (
        mode === 'DISPLAY' ? [
          a('.todorm.ui.secondary.button', 'delete'),
          a('.todoedit.ui.button.todoedit', 'edit'),                        
          span('.todo_label.padded.content', value)
        ] : [
          a('.todorm.ui.secondary.button', 'delete'),
          a('.todosave.ui.button', 'save'),
          label('.text-label.ui.input.small', { for: 'todosave' }, [
            input('.todo_save', {
              placeholder   : value,
              type          : 'text',
              name          : 'todosave',
              value         : value,
              autocomplete  : 'off',
              maxlength     : 400              
            })
          ])
        ]
      ))
    ])
  );

  o.intent = DOM => {
    const click$ = DOM.select('.todo_listitem')
            .events('click')
            .map(e => e);
    
    const todoedit$ = click$
            .filter(e => /todoedit/g.test(e.target.className))
            .map(e => (e.preventDefault(), e.target.parentNode))
            .map(parent => ({
              uid   : todoUID(parent)
            }));

    const todorm$ = click$
            .filter(e => /todorm/g.test(e.target.className))
            .map(e => (e.preventDefault(), e.target.parentNode))
            .map(parent => ({
              uid   : todoUID(parent)
            }));

    const todosave$ = click$
            .filter(e => /todosave/g.test(e.target.className))
            .map(e => (e.preventDefault(), e.target.parentNode))
            .map(parent => ({
              uid   : todoUID(parent),
              value : todoLabelText(parent)
            }));

    return {
      click$,
      todoedit$,
      todorm$,
      todosave$
    };
  };

  return o;
  
})({});

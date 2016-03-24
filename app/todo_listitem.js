// Filename: todo_listitem.js  
// Timestamp: 2016.03.23-02:27:09 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

import {label,input,div,span,a} from '@cycle/dom';

var todo_listitem = module.exports = (o => {

  o.view = (state, { uid, mode, value }) => (
    div('.ui.column.stackable.grid', [
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

  return o;
  
})({});

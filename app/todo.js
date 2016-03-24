// Filename: todo.js  
// Timestamp: 2016.03.24-02:04:58 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

import rx from 'rx';
import pathjoin from 'pathjoin';
import cycledom from '@cycle/dom';
import superagent from 'superagent';
import superagentp from 'superagent-promise';
import formurlencoded from 'form-urlencoded';

import styles from './todo.css';
import todo_listerr from './todo_listerr';
import todo_listitem from './todo_listitem';
import todo_operation from './todo_operation';

var todo = module.exports = (o => {

  const path_SAVE = '/save';

  const intent = (sources) => {
    const submit$ = sources.DOM.select('.todoform')
            .events('submit')
            .map(e => (e.preventDefault(), e));

    const click$ = sources.DOM.select('.todolist')
            .events('click')
            .map(e => e);

    const todoadd$ = submit$
            .map(e => e.target.elements.todoadd.value)
            .filter(e => e)
            .map(value => ({
              value : value
            }));

    const listsave$ = sources.DOM.select('.listsave')
            .events('click')
            .map(e => (e.preventDefault(), e));

    const todo_listitem_intent = todo_listitem.intent(sources.DOM);
    const todo_listerr_intent = todo_listerr.intent(sources.DOM);    
    
    return {
      todorm$   : todo_listitem_intent.todorm$,      
      todoedit$ : todo_listitem_intent.todoedit$,
      todosave$ : todo_listitem_intent.todosave$,
      closeerr$ : todo_listerr_intent.closeerr$,
      todoadd$,      
      listsave$
    };
  };

  const model = actions => {
    const todo$ = rx.Observable.merge(
      actions.closeerr$.map(err => todo_operation.state_rmerr(err)),   
      actions.todosave$.map(todo => todo_operation.state_savedisplay(todo)),
      actions.todoedit$.map(todo => todo_operation.state_modeedit(todo)),
      actions.todoadd$.map(todo => todo_operation.state_add(todo)),
      actions.todorm$.map(todo => todo_operation.state_rm(todo))
    );
    
    const state$ = todo$.throttle(200).startWith({
      errlist : [],
      list    : []
    }).scan((acc, operation) => (
      operation(acc)
    )).shareReplay(1);      

    // endpoint is at /save
    const savedata$ = actions.listsave$
            .withLatestFrom(state$)
            .map(([e, state]) => state.list.map(todo => todo.value))  
            .map(valarr => valarr.join(','));

    const savedatares$ = savedata$
            .map(res => path_SAVE + '?' + formurlencoded({data : res || '+' }))
            .flatMap(requestUrl => rx.Observable.fromPromise(
              superagentp(superagent, Promise)
                .put(requestUrl)))
            .map(xhr => xhr.status);
    
    savedatares$.subscribe(
      res => console.log('res is ', res),
      err => console.log('err is ', err)
    );

    return state$;    
  };
  
  const view = (state$) => {
    const {label, input, div, h1, form} = cycledom;

    return state$.map(o => (
      console.log('o is ', o.list),
      div('.ui.text.container.todo', [
        h1('.ui.header', 'Todo'),          
        form('.todoform', {
          action   : '/todo',
          name     : 'todoform',
          method   : 'post'
        },[
          label('.submit-label', { for: 'todosubmit' }, [              
            input('.ui.primary.button', {
              type  : 'submit',
              name  : 'todosubmit',
              value : 'add'
            })
          ]),
          
          label('.text-label.ui.input', { for: 'todoadd' }, [
            input('.todoadd', {
              placeholder   : 'add todo',
              type          : 'text',
              name          : 'todoadd',
              autocomplete  : 'off',
              maxlength     : 400              
            })
          ]),

          o.errlist.map(err => todo_listerr.view(o, err))
        ]),

        div('.ui.container.segment.todolist', (
          o.list.map(todo => todo_listitem.view(o, todo))
        )),

        label('.submit-label', { for: 'listsave' }, [              
          input('.ui.primary.button.listsave', {
            type  : 'submit',
            name  : 'listsave',
            value : 'save list'
          })
        ])
                  
      ])
    ));
  };
  
  o.DOM  = sources => view(model(intent(sources)));
  o.HTTP = sources => rx.Observable.just({
    method : 'POST'
  });

  return o;

})({});

// Filename: todo.js  
// Timestamp: 2016.03.24-00:48:51 (last modified)
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

  const todoLabelText = elem => (
    elem.dataset.todomode === 'EDIT'
      ? elem.getElementsByClassName('todo_save')[0].value
      : elem.getElementsByClassName('todo_label')[0].innerText    
  );

  const todoUID = elem => (
    elem.dataset.uid
  );

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

    const closeerr$ = sources.DOM.select('.closeerr')
            .events('click')
            .map(e => (e.preventDefault(), e.target))
            .map(elem => ({
              uid   : todoUID(elem)
            }));

    const listsave$ = sources.DOM.select('.listsave')
            .events('click')
            .map(e => (e.preventDefault(), e));
    
    return {
      todoadd$,      
      todoedit$,
      todorm$,
      todosave$,
      listsave$,
      closeerr$
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
            .flatMap(() => {
              console.log('fatmap called');
              return state$;
            })
            .subscribe(res => console.log('res is ', res));
            //.map(state => state.list.map(todo => todo.value))
            //.map(valarr => valarr.join(','));

    //const savedatares$ = savedata$
    //        .map(res => path_SAVE + '?' + formurlencoded({data : res || '+' }))
    //        .flatMap(requestUrl => rx.Observable.fromPromise(
    //          superagentp(superagent, Promise)
    //            .put(requestUrl)))
    //        .map(xhr => xhr.status);
    
    //savedatares$.subscribe(
    //  res => console.log('res is ', res),
    //  err => console.log('err is ', err)
    //);

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

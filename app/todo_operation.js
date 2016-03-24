// Filename: todo_operation.js  
// Timestamp: 2016.03.23-02:43:45 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

const todo_operation = (o => {

  o.MODE_DISPLAY = 'DISPLAY';
  o.MODE_EDIT = 'EDIT';  

  o.uid = (x => () => 'todo-' + x++)(0);

  o.get = spec => ({
    mode  : o.MODE_DISPLAY,
    value : spec.value,
    uid   : spec.uid || o.uid()
  });

  o.set = (item, spec) => (
    Object.assign(item, spec)
  );
  
  o.setvalue = (item, spec) => (
    Object.assign(item, {
      value : spec.value
    })
  );

  o.ismodeedit = item => (
    item.mode === o.MODE_EDIT    
  );

  o.isvalue = (item, spec) => (
    item.value === spec.value    
  );

  o.isuid = (item, spec) => (
    item.uid === spec.uid        
  );

  o.modeedit = item => (
    Object.assign(item, {
      mode : o.MODE_EDIT
    })
  );

  o.modedisplay = item => (
    Object.assign(item, {
      mode : o.MODE_DISPLAY
    })
  );


  // function composition 
  // called first time with state altering function
  // second time with spec data (new state data)
  // third time with existing state data
  o.addstate = fn => spec => state => (
    o.set(state, fn(spec, state))
  );

  o.state_save = o.addstate((spec, state) => ({
    list : state.list.map(item => (
      o.isuid(item, spec)
        ? o.setvalue(item, spec)
        : item
    ))
  }));

  o.state_modeedit = o.addstate((spec, state) => ({
    list : state.list.map(item => (
      o.isuid(item, spec)
        ? o.modeedit(item)
        : item
    ))
  }));

  o.state_modedisplay = o.addstate((spec, state) => ({
    list : state.list.map(item => (
      o.isuid(item, spec)
        ? o.modedisplay(spec)
        : item
    ))
  }));

  o.state_savedisplay = o.addstate((spec, state) => ({
    list : state.list.map(item => (
      o.isuid(item, spec)
        ? o.modedisplay(o.setvalue(item, spec))
        : item
    ))    
  }));
  
  o.state_add = o.addstate((spec, state) => {
    if (state.list.some(item => o.isvalue(item, spec))) {
      state.errlist.push({
        type  : 'duplicate',
        value : spec.value,
        uid   : o.uid()
      });
    }
    
    return {
      errlist : state.errlist,
      list : state.list.concat(o.get(spec))
    };
  });

  o.state_rm = o.addstate((spec, state) => ({
    list : state.list.filter(item => !o.isuid(item, spec))
  }));

  o.state_rmerr = o.addstate((spec, state) => ({
    errlist : state.errlist.filter(item => !o.isuid(item, spec))
  }));

  return o;
  
})({});

export default todo_operation;

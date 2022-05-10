This documentation is really not good atm, but better than nothing.  

# Example
```JSON
tableConfig = {  
  id: {  
    label: 'Id'  
  },  
  userName: {  
    label: 'UserName',
    editable: true,
    validation: '/^[a-zA-Z0-9\-\ \_åäöÅÄÖ]{3,44}$/',
    icon: 'fa-user-circle',
    addNew: true
  },
  access: {
    label: 'Access',
    icon: 'fa-handshake-o',
    content: 'multiselect({access},allAccess)',
    api: 'useraccess'
  },
  startPage: {
    label: 'StartPage',
    editable: true,
    icon: 'fa-home',
    addNew: true
  },
  password: {
    label: 'Password',
    validation: '/^[a-zA-Z0-9\-\ \_åäöÅÄÖ]{3,44}$/',
    icon: 'fa-key',
    addNew: true,
    content: 'button(ChangePassword,danger)',
    function: 'changePassword({id})'
  },
  delete: {
    label: 'Delete',
    function: 'del({id})',
    content: 'button(Del,danger)'
  }
}
```

Fetched from .../list
```
[{id: 1, userName: 'John', access: ['read','write'], startPage: '/', }]
```

The key in tableConfig is matched to the key in list.  
- label: column header  
- editable: If the value should be changeable.  
- validation: (Not working ATM). Regex validation that the value must pass for value to be saved.  
- icon: Name of icon to use. For instance when create new. https://icons8.com/line-awesome
- addNew: true/false (not present = false) Should this be included when creating a new (present in popup window)...  
- content: information on how to render the information.
  - button: button(ChangePassword,danger) - The button will have the text 'ChangePassword', and will have the bootstrap type 'danger'. Note that there is no ace.  
    - When a button is pressed, function will be called upon.
  - multiselect: multiselect({access},allAccess).   
    - {access}: is parsed into already selected items.  ['read','write'] in this example.
    - allAccess: is all available options parsed from local storage (usually window.griffinPortal[allAccess] in this example)
- function: changePassword({id}) will run the function changePassword. Will try to replace anything inside {} with according key. In this case changePassword(1)   would be executed.
- api: path to api to send PATCH to on changes selectbox changes.


  
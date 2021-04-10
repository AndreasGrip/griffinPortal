/* eslint-disable no-unused-vars */
// Test if string is correct json
function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

// Function that do nothing, used for callback.
function doNothing() {}

// store data.
function storeDatafunction(storeDataWhere) {
  if (window.adminLTE === undefined) window.adminLTE = {};
  return function (data) {
    window.adminLTE[storeDataWhere] = data;
  };
}

// https://stackoverflow.com/questions/39251318/javascript-function-document-createelementtagname-options-doesnt-work-as-i
function oneLineTag(tag, options) {
  return Object.assign(document.createElement(tag), options);
}

document.body.spinnerLockers = 0;

// count number of processes want to have a spinner, if 0, hide the spinner
function waitSpinnerHide() {
  document.body.spinnerLockers--;
  if (document.body.spinnerLockers <= 0) {
    // remove all existing spinners
    while (document.getElementById('spinner')) {
      const spinner = document.getElementById('spinner');
      console.log('remove spinner');
      spinner.remove();
    }
    // spinner.parentNode.removeChild(spinner);
  }
}

// count number of processes want to have a spinner, if 0, show the spinner
function waitSpinnerShow() {
  if (document.body.spinnerLockers === 0) {
    // document.getElementById('spinner').classList.add('show');
    const divMain = document.createElement('div');
    divMain.id = 'spinner';
    divMain.classList.add('gModal');
    const divSpinner = document.createElement('div');
    divSpinner.classList.add('spinningWheel');
    document.body.appendChild(divMain);
  }
  document.body.spinnerLockers++;
}

// url is where get data using http GET method
// addTo is where values will be stored in window.adminLTE. (window.adminLTE[addTo]).
// runAfter is the function to be called after fetch finished, even if error occured.
function getData(url, runOnSuccess, runAfter) {
  waitSpinnerShow();
  const params = {
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      'Content-Type': 'application/json', // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  };
  fetch(url, params)
    .then((response) => {
      if (response.ok) return response.json();
      return Promise.reject(new Error('Page ' + response.url + ' returned status ' + response.status + ' ' + response.statusText));
    })
    .then((data) => {
      if (typeof runOnSuccess === 'function') runOnSuccess(data);
    })
    .catch((err) => {
      console.log(err.toString());
      alert(err.toString());
    })
    .finally(() => {
      if (typeof runAfter === 'function') runAfter();
      waitSpinnerHide();
    });
}

// url is where to POST data using http POST method
// postData is the data to be sent
// success is the function to be called if post return succes // res.status >= 200 && res.status < 300
// runAfter is the function to be called after fetch finished, even if error occured.
function postData(url, postData, success, runAfter) {
  waitSpinnerShow();
  const params = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json', // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: isJson(postData) ? postData : JSON.stringify(postData), // body data type must match "Content-Type" header
  };
  fetch(url, params)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(new Error('Page ' + response.url + ' returned status ' + response.status + ' ' + response.statusText));
      }
    })
    .then((data) => {
      success();
    })
    .catch((err) => {
      console.log(err.toString());
      alert(err.toString());
    })
    .finally(() => {
      runAfter();
      waitSpinnerHide();
    });
}

// url is where to PATCH data using http PATCH method
// patchData is the data to be sent
// success is the function to be called if post return succes // res.status >= 200 && res.status < 300
// runAfter is the function to be called after fetch finished, even if error occured.
function patchData(url, patchData, success, runAfter) {
  waitSpinnerShow();
  const params = {
    method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json', // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: isJson(patchData) ? patchData : JSON.stringify(patchData), // body data type must match "Content-Type" header
  };
  fetch(url, params)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(new Error('Page ' + response.url + ' returned status ' + response.status + ' ' + response.statusText));
      }
    })
    .then((data) => {
      success();
    })
    .catch((err) => {
      console.log(err.toString());
      alert(err.toString());
    })
    .finally(() => {
      runAfter();
      waitSpinnerHide();
    });
}

function createFaIcon(iconClass) {
  const node = document.createElement('i');
  node.classList.add('fa');
  node.classList.add(iconClass);
  return node;
}

/*  General function that create a popup form for input data.
      usage
      label: will be used both as Label on the popupwindow, as well as part of id for everything in it.
      config: exactly like tableConfig, only objects containing {addNew: true} will be shown
      okButtonConfig: function that will be run if ok button is pressed. label can be passed as an argument to be able to find the objects.
*/

function createPopupInput(label, config, okButtonConfig) {
  // Remove any old forms
  const org = document.getElementById(label + 'Form');
  if (org) org.remove();
  const response = oneLineTag('div', { id: label + 'Form', tabindex: -1, role: 'dialog', 'aria-labelledby': label + 'Label', 'aria-hidden': 'true' });
  response.classList.add('modal', 'show');

  const divModalDialog = oneLineTag('div', { role: 'document' });
  divModalDialog.classList.add('modal-dialog');
  response.appendChild(divModalDialog);

  const divModalContent = document.createElement('div');
  divModalContent.classList.add('modal-content');
  divModalDialog.appendChild(divModalContent);

  const divModalHeader = oneLineTag('div', { 'text-center': '' });
  divModalHeader.classList.add('modal-header');
  divModalContent.appendChild(divModalHeader);

  const divModalTitle = document.createElement('h4');
  divModalTitle.classList.add('modal-title', 'w-100', 'font-weight-bold');
  divModalTitle.appendChild(document.createTextNode(label));
  divModalHeader.appendChild(divModalTitle);

  const divModalBody = oneLineTag('div', { id: label + 'FormContent' });
  divModalBody.classList.add('modal-body', 'mx-3');
  divModalContent.appendChild(divModalBody);

  for (const key of Object.keys(config)) {
    if (config[key].addNew) {
      const div = document.createElement('div');
      div.classList.add('md-form', 'mb-5');
      divModalBody.appendChild(div);
      if (config[key].icon) {
        const faIcon = createFaIcon(config[key].icon);
        faIcon.classList.add('prefix', 'grey-text');
        div.appendChild(faIcon);
      }
      const labelFirst = oneLineTag('label', { 'data-error': 'wrong', 'data-success': 'right', for: label + '-' + key });
      labelFirst.appendChild(document.createTextNode(config[key].label));
      div.appendChild(labelFirst);
      const inputFirst = oneLineTag('input', { type: key, id: label + '-' + key });
      inputFirst.classList.add('form-control', 'validate', key + 'Value');
      div.appendChild(inputFirst);
    }
  }
  const divFooter = document.createElement('div');
  divFooter.classList.add('modal-footer', 'd-flex', 'justify-content-center');
  divModalContent.appendChild(divFooter);
  const buttonOk = document.createElement('button');
  buttonOk.classList.add('btn', 'btn-primary');
  buttonOk.setAttribute('onclick', okButtonConfig.function);
  buttonOk.appendChild(document.createTextNode(okButtonConfig.label));
  divFooter.appendChild(buttonOk);
  const buttonCancel = document.createElement('button');
  buttonCancel.classList.add('btn', 'btn-danger');
  buttonCancel.setAttribute('onclick', "document.getElementById('" + label + "Form').remove();");
  buttonCancel['data-dismiss'] = 'modal';
  buttonCancel.appendChild(document.createTextNode('Cancel'));
  divFooter.appendChild(buttonCancel);
  return response;
}

// optionsVar = array of object containing the options.
// saveCol = value int the object containing the value to be saved;
// showCol = value in the object containing the value to show;
// apiSave = what api to call to save
function uisSel2Create(orgValue, optionsVar, saveCol, showCol, apiSave) {
  const response = oneLineTag('select', { size: 1 });
  response.setAttribute('onchange', 'uisSel2CreateChange(this,' + apiSave + ');');
  const options = window.adminLTE[optionsVar]; // Get the configured options
  options.forEach((opt) => {
    if (opt.saveCol && opt.showCol) {
      const option = new Option(opt.saveCol, opt.showCol);
      if (opt.saveCol === orgValue) option.selected = true;
      response.appendChild(option);
    } else {
      console.log(JSON.stringify(opt) + ' didnt contain saveCol and showCol, discarding');
    }
  });
  return response;
}

// optionsVar = array of object containing the options.
// showCol = value in the object containing the value to show;
// functionOnChange = what function to call with the selected option object as argument.
function uisSel2CreateFunction(orgValue, optionsVar, showCol, functionOnChange) {
  const options = window.adminLTE[optionsVar]; // Get the configured options
  const response = oneLineTag('select', { size: 1 });
  response.setAttribute('onchange', 'uisSel2CreateChange(this,' + functionOnChange + '(this);');
  response.appendChild(document.createElement('option'));
  options.forEach((opt) => {
    if (opt.showCol) {
      const option = new Option(JSON.stringify(opt), opt.showCol);
      if (opt.showCol === orgValue) option.selected = true;
      response.appendChild(option);
    } else {
      console.log(JSON.stringify(opt) + ' didnt contain showCol, discarding');
    }
  });
  return response;
}

// function uiSSelCreate(selected, apiGetObjects, api) {
function uiSSelCreate(selected, allOptionsGlobalVariable, apiSaveSelected) {
  if (!apiSaveSelected) apiSaveSelected = '';

  let returnString = '';
  // Create object with all available objects
  const objectList = {};
  const allOptionsGlobalVariableReal = window.adminLTE[allOptionsGlobalVariable];
  allOptionsGlobalVariableReal.forEach((option) => {
    if (option === undefined) option = {};
    if (!objectList[option.name]) {
      objectList[option.name] = option;
      objectList[option.name].selected = false;
    }
    objectList[option.name].selected = selected === objectList[option.name].id;
  });

  const result = oneLineTag('select', { size: 1 });
  result.setAttribute('onchange', "uiSSelCreateChange(this,' + apiSaveSelected + ');");
  for (const key of Object.keys(objectList)) {
    const option = oneLineTag('option', { value: objectList[key].id, text: key, selected: objectList[key].selected });
    result.appendChild(option);
  }
  return result;
}

function uiCBCreateChange(checkbox, uncheckedValue, checkedValue, api) {
  const rowId = checkbox.parentElement.parentNode.firstElementChild.innerText;
  //  let columnName = Object.keys(tableConfig)[$(checkbox).parent()[0]._DT_CellIndex.column];
  const cellIndex = checkbox.parentNode.cellIndex;
  const columnLabel = checkbox.parentNode.parentNode.parentElement.parentElement.rows[0].cells[cellIndex].innerHTML;
  let columnName;
  for (const key of Object.keys(tableConfig)) {
    if (columnLabel === tableConfig[key].label) {
      columnName = key;
    }
  }
  const url = api ? api + '/' + rowId : rowId;
  const valueToChange = columnName;
  const newValue = checkbox.checked ? checkedValue : uncheckedValue;
  checkbox.value = checkbox.checked ? checkedValue : uncheckedValue;

  function successFunc() {
    checkbox.value = checkbox.checked ? checkedValue : uncheckedValue;
  }
  function runAfterFunc() {
    checkbox.checked = newValue === checkedValue ? 0 : 1;
  }
  dataPatch(url, { valueToChange: valueToChange, newValue: newValue }, successFunc, runAfterFunc);
}

function uiCBCreate(setValue, uncheckedValue, checkedValue, api) {
  if (!api) api = '';
  const response = oneLineTag('input', { type: 'checkbox', value: setValue === checkedValue ? checkedValue : uncheckedValue, checked: setValue === checkedValue });
  response.setAttribute('onClick', "uiCBCreateChange(this,'" + uncheckedValue + "','" + checkedValue + "' ,'" + api + "');");
  return response;
}

function uisSel2CreateChange(selectObj, api) {
  if (api === undefined) {
    return;
  }
  const rowId = selectObj.parentElement.parentNode.firstElementChild.innerText;
  const columnName = Object.keys(tableConfig)[$(selectObj).parent()[0]._DT_CellIndex.column];
  const url = api ? api + '/' + rowId : rowId;
  const valueToChange = columnName;
  const newValue = selectObj.selectedOptions[0].value;
  patchData(url, { valueToChange: valueToChange, newValue: newValue }, doNothing, doNothing);
}

function uiSSelCreateChange(setValue, uncheckedValue, checkedValue, api) {
  const rowId = setValue.parentElement.parentNode.firstElementChild.innerText;
  const columnName = Object.keys(tableConfig)[$(setValue).parent()[0]._DT_CellIndex.column];
  const url = api ? api + '/' + rowId : rowId;
  const valueToChange = columnName;
  const newValue = setValue.selectedOptions[0].value;
  patchData(url, { valueToChange: valueToChange, newValue: newValue }, doNothing, doNothing);
}

/* uiMSel start */
function uiMSelCreate(selected, allObjects, api) {
  const response = document.createElement('div');
  const ul = document.createElement('ul');
  ul.classList.add('mSelOptions');
  response.appendChild(ul);

  selected.forEach((sel) => {
    const li = document.createElement('li');
    li.setAttribute('onclick', "uiMSelCreateDel(this,'" + api + "');");
    const input = oneLineTag('input', { type: 'hidden', name: 'aChoice', value: sel });
    li.appendChild(input);
    li.appendChild(document.createTextNode(sel));
    ul.appendChild(li);
  });
  const select = oneLineTag('select', { size: 1 });
  select.setAttribute('onchange', "uiMSelCreateAdd(this,'" + api + "');");
  select.appendChild(new Option('Select something to add', ''));
  if (allObjects) {
    allObjects.forEach((obj) => {
      let option;
      if (!selected.find((sel) => sel === obj.name)) option = new Option(obj.name, obj.value);
      if (option) select.appendChild(option);
    });
  }
  response.appendChild(select);
  return response;
}

function uiMSelCreateAdd(select, api) {
  const rowId = select.parentElement.parentElement.parentNode.firstElementChild.innerText;
  // alert(e.srcElement[1].innerText);
  // get what option is selected.
  const option = select.options[select.selectedIndex];
  const valueToChange = option.value;
  // console.log(select.selectedIndex);

  const ul = select.parentNode.getElementsByTagName('ul')[0];
  // get the values of all selected objects
  const choices = ul.getElementsByTagName('input');
  // Make sure we dont include something already included.
  for (const choice of choices) {
    if (choice.value === option.value) return;
  }
  // Create the elements that will make upp a selected object.
  const li = document.createElement('li');
  const input = oneLineTag('input', { type: 'hidden', name: 'aChoice', value: option.value });
  li.appendChild(input);
  const text = document.createTextNode(option.firstChild.data);
  li.appendChild(text);
  li.setAttribute('onclick', 'uiMSelCreateDel(this, "' + api + '");');

  ul.appendChild(li);

  //Todo create success and finish function, and add spinner
  select.options.remove(select.selectedIndex);

  patchData(api + '/' + rowId, { valueToChange: valueToChange, newValue: true }, doNothing, doNothing);
}

function uiMSelCreateDel(select, api) {
  const rowId = select.parentElement.parentElement.parentElement.parentNode.firstElementChild.innerText;
  // alert(elem.parentElement.firstElementChild.textContent);
  const value = select.getElementsByTagName('input')[0].value;
  const valueToChange = value;
  const text = select.childNodes[1].data;
  const opt = new Option(opt.text, opt.value);
  // select.parentNode.parentnode.getElementsByTagName('select').options.add(opt);
  select.parentNode.parentNode.childNodes[1].options.add(opt);
  select.remove();
  patchData(api + '/' + rowId, { valueToChange: valueToChange, newValue: false }, doNothing, doNothing);
}

/* uiMSel end */

function uiBtnCreate(label, functionString, type, value) {
  switch (type) {
    case 'default':
    case 'primary':
    case 'success':
    case 'info':
    case 'warning':
    case 'danger':
    case 'link':
      break;
    default:
      type = 'default';
  }
  if (!value) value = '';
  const button = oneLineTag('button', { value: value });
  button.setAttribute('onClick', functionString);
  button.classList.add('btn', 'btn-' + type, 'btn-rounded', 'mb-4');
  button.appendChild(document.createTextNode(label));
  return button;
}

function uiFUCreate(label, dest, format, id) {
  const inputName = 'fileToUpload';
  const inputId = inputName + id;

  const form = oneLineTag('form', { action: dest, method: 'POST', enctype: 'multipart/form-data' });
  const labelobj = oneLineTag('label', { for: inputId });
  labelobj.classList.add('file-upload-button');
  labelobj.appendChild(createFaIcon('fa-upload'));
  labelobj.appendChild(document.createTextNode(label));
  form.appendChild(labelobj);

  const inputFile = oneLineTag('input', { type: 'file', id: inputId, name: inputName });
  inputFile.onchange = 'this.parentElement.submit();' + format ? 'accept="' + format + '"' : '';
  form.appendChild(inputFile);

  const hInputListId = oneLineTag('input', { type: 'hidden', name: 'listId', value: id });
  form.appendChild(hInputListId);

  return form;
}

// This is to view data when there is only one row of data but alot of columns.
function createDataRowView(data, config) {
  const respond = oneLineTag('table', { id: 'customer' });
  respond.classList.add('table', 'table-bordered');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headrow = document.createElement('tr');
  const headcol1 = document.createElement('th');
  const headcol2 = document.createElement('th');
  headcol1.appendChild(document.createTextNode('Label'));
  headcol2.appendChild(document.createTextNode('Value'));
  headrow.appendChild(headcol1);
  headrow.appendChild(headcol2);
  thead.appendChild(headrow);
  for (let i = 0; i < Object.keys(data[0]).length; i++) {
    let confKey = Object.keys(data[0])[i];
    // If there was no configuration for this column create one
    config[confKey] = config[confKey] === undefined ? {} : config[confKey];
    // save the column number
    config[confKey].column = i;
    // If no label is defined, use the column name as label
    config[confKey].label = config[confKey].label === undefined ? key : config[confKey].label;
    const td = document.createElement('td');
    td.appendChild(document.createTextNode(config[confKey].label));
    tbody.appendChild(td);
  }
}

function createTable(data, config) {
  if (!data || !data.length) return document.createTextNode('Cant load List');

  let columns = 0;
  const editable = [];

  const table = document.createElement('table');
  table.classList.add('table');
  table.classList.add('table-bordered');
  table.id = 'list';
  const thead = document.createElement('thead');
  table.appendChild(thead);
  const theadtr = document.createElement('tr');
  thead.appendChild(theadtr);
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  const headerRow = data[0];
  const headerRowKeys = Object.keys(headerRow);

  // If data is returned that don't exist in config, add to config.
  // If no label is set the key as label.
  headerRowKeys.forEach((key) => {
    // If there was no configuration for this column create one
    if (config[key] === undefined) config[key] = {};
    // save the add a column number if none is set
    if (config[key].column === undefined) config[key].column = ++columns;
  });

  // clean up the configs
  const configKeys = Object.keys(config);
  configKeys.forEach((key) => {
    // If no label is defined, use the column name as label
    if (config[key].label === undefined) config[key].label = key;
    // If column was not set by the data recived, add one now and mark the config as extra.
    if (config[key].column === undefined) {
      config[key].column = ++columns;
      config[key].extra = true;
    }
  });

  // For each config add a header column...
  configKeys.forEach((key) => {
    const th = document.createElement('th');
    th.appendChild(document.createTextNode(config[key].label));
    theadtr.appendChild(th);
    if (config[key].editable) {
      editable.push(config[key].column);
    }
  });

  // add the data in the columns
  for (const row of data) {
    const bodytr = document.createElement('tr');
    tbody.appendChild(bodytr);

    // for exampale {test} should be replaced with content of row[test] (ish)
    // eslint-disable-next-line no-inner-declarations
    function addArguments(string, row) {
      let returnString = string;
      // Check if string contains {}
      const replaceables = /\{(\w*)\}/.exec(returnString);
      if (replaceables) {
        returnString = returnString.replace(replaceables[0], row[replaceables[1]]);
      }
      return returnString;
    }

    Object.keys(config).forEach((key) => {
      // if not number or text replace with empty text.
      if (typeof row[key] !== 'number' && typeof row[key] !== 'string') row[key] = '';

      const rowVariables = {};
      if (config[key].function) rowVariables.function = addArguments(config[key].function, row);
      if (config[key].content) rowVariables.content = addArguments(config[key].content, row);
      if (config[key].value) rowVariables.value = addArguments(config[key].value, row);

      let contentArray = [];

      switch (true) {
        case /^button\(.*\)/.test(rowVariables.content):
          contentArray = rowVariables.content.match(/\w+\((.*)\)/)[1].split(',');
          row[key] = uiBtnCreate(contentArray[0], rowVariables.function, contentArray[1], rowVariables.value);
          break;
        case /^multiselect\(.*\)/.test(rowVariables.content):
          // contentArray = rowVariables.content.match(/^multiselect\(\[(.*)\]/)[1].split(',');
          contentArray = rowVariables.content.match(/^multiselect\((\[?([\w\d\s\,]*)\]?),(\w*)\)/)[2].split(',');
          const allOptions = rowVariables.content.match(/^multiselect\((\[?([\w\d\s\,]*)\]?),(\w*)\)/)[3];
          row[key] = uiMSelCreate(contentArray, window.adminLTE[allOptions], config[key].api);
          break;
        case /^singleselect\(.*\)/.test(rowVariables.content):
          contentArray = rowVariables.content.match(/^singleselect\((.*)\)/)[1].split(',');
          // uiSSelCreate(selected, url to get options, url to update)
          row[key] = uiSSelCreate(contentArray[0], contentArray[1], contentArray[2]);
          break;
        case /^singleselect2\(.*\)/.test(rowVariables.content):
          contentArray = rowVariables.content.match(/^singleselect2\((.*)\)/)[1].split(',');
          // optionsVar = array of object containing the options.
          // saveCol = value int the object containing the value to be saved;
          // showCol = value in the object containing the value to show;
          // apiSave = what api to call to save
          // // uisSel2Create(orgValue, optionsVar, saveCol, showCol, apiSave);
          row[key] = uisSel2Create(row[key], ...contentArray);
          break;
        case /^checkbox\(.*\)/.test(rowVariables.content):
          contentArray = rowVariables.content.match(/^checkbox\((.*)\)/)[1].split(',');
          // uiSSelCreate(selected, url to get options, url to update)
          row[key] = uiCBCreate(contentArray[0], contentArray[1], contentArray[2]);
          break;
        case /^upload\(.*\)/.test(rowVariables.content):
          contentArray = rowVariables.content.match(/^upload\((.*)\)/)[1].split(',');
          row[key] = uiFUCreate(contentArray[0], contentArray[1], contentArray[2], contentArray[3]);
          break;
        default:
      }

      const td = document.createElement('td');
      const content = typeof row[key] === 'object' ? row[key] : document.createTextNode(row[key]);
      td.appendChild(content);
      if (config[key].editable) td.classList.add('tdeditable');
      bodytr.appendChild(td);
    });
  }

  // Sweet god I hate jquery..  2021-02-23 //Agr
  // append table to a div, append the div to the body in order to be able to fetch it in jquery and put dataTable on it.
  const respond = document.createElement('div');
  respond.appendChild(table);
  document.body.appendChild(respond);
  $('#list').dataTable({ paging: false });

  respond.parentElement.removeChild(respond);
  respond.id = 'listContainer';
  function value2input(element) {
    let orgValue = element.textContent;
    if (element.querySelector('input')?.value) orgValue = element.querySelector('input').value;
    element.childNodes.forEach((node) => node.remove());
    const input = oneLineTag('input', { type: 'text', value: orgValue });
    element.appendChild(input);
    input.focus();
    input.addEventListener('focusout', () => {
      element.childNodes.forEach((node) => node.remove());
      element.textContent = orgValue;
    });
    input.addEventListener('keypress', (e) => {
      if (e.which === 13) {
        const newContent = element.querySelector('input').value;
        const rowId = element.parentNode.children[0].innerText;
        const cellIndex = element.cellIndex;
        let columnName = element.parentElement.parentElement.parentElement.tHead.rows[0].cells[cellIndex].innerText;
        const configKeys = Object.keys(config);
        const configRow = configKeys.find((key) => config[key] && config[key].label === columnName);
        if (configRow !== undefined) columnName = configRow;
        console.log(configRow);

        let regex = /./;
        if (config[columnName].validation) {
          const flags = config[columnName].validation.replace(/.*\/([gimy]*)$/, '$1');
          const pattern = config[columnName].validation.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
          regex = new RegExp(pattern, flags);
        }

        if (regex.test(newContent) !== true) {
          alert(newContent + ' did not match regex ' + pattern);
        } else {
          patchData(
            rowId,
            { valueToChange: columnName, newValue: newContent },
            function () {
              // while(element.firstChild) element.removeChild(element.lastChild);
              //element.childNodes.forEach((node) => node.remove());
              element.textContent = newContent;
            },
            doNothing
          );
        }
      }
    });
  }
  respond.querySelectorAll('.tdeditable').forEach((element) => {
    element.addEventListener('click', () => {
      value2input(element);
    });
  });

  // Datatabels adds a few layers that need to be included with the table.

  return respond;
}

function listUpdate() {
  // Now add configured columns that don't exist in the resultset.
  for (const key of Object.keys(tableConfig)) {
    tableConfig[key].label = tableConfig[key].label === undefined ? key : tableConfig[key].label;
  }

  function runAfterFunc(data) {
    document.getElementById('tableContainer').textContent = '';
    const respond = createTable(data, tableConfig);
    document.getElementById('tableContainer').appendChild(respond);
  }

  getData('list', runAfterFunc, doNothing);
}

function del(id) {
  const params = {
    method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json', // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  };
  const url = id;
  waitSpinnerShow();
  fetch(url, params)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(new Error('Page ' + response.url + ' returned status ' + response.status + ' ' + response.statusText));
      }
    })
    .then((data) => {
      listUpdate();
    })
    .catch((err) => {
      console.log(err.toString());
      alert(err.toString());
    })
    .finally(() => {
      waitSpinnerHide();
    });
}

function addSave(label) {
  const addData = {};
  // Chech all regexp validations and abort of any of them fail.
  for (const key of Object.keys(tableConfig)) {
    const conf = tableConfig[key];
    if (conf.addNew && conf.validation) {
      const flags = conf.validation.replace(/.*\/([gimy]*)$/, '$1');
      const pattern = conf.validation.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
      const regex = new RegExp(pattern, flags);
      if (!regex.test(document.getElementById(label + '-' + key)?.value)) {
        alert(key + ' ' + 'must patch regex ' + pattern);
        return false;
      }
    }
    if (conf.addNew) {
      addData[key] = document.getElementById(label + '-' + key)?.value;
    }
  }

  postData('', addData, listUpdate, doNothing);
}

// let tableobject = table2jsonObj(document.getElementbyId('mytable')); // [{header1: a1, header2: b1},{header1: a2, header2: b2}]

function table2jsonObj(table) {
  if (!table || !table.rows) {
    return Error('table2json expected table got something else ' + JSON.stringify(table));
  }
  if (table.rows === 0) {
    return Error('table2json recived empty table (not even headers)');
  }

  let headers = []; //Always the first row
  const rows = []; // Each row of data
  const jsonObj = []; // Resulting object to be returned
  // The correct way would be to get the information from thead/tbody but this will handle all sloppy coding I can think of so...
  // (Even I do that sort of code and w3schools taught it as well.)
  // loop all rows in the table (including header row)
  for (let rowI = 0; rowI < table.rows.length; rowI++) {
    let row = []; // will contain the value of each cell
    for (let cellI = 0; cellI < table.rows[rowI].cells.length; cellI++) {
      if (table.rows[rowI].cells[cellI].children.length === 0) {
        row[cellI] = table.rows[rowI].cells[cellI].innerHTML;
      } else {
        switch (table.rows[rowI].cells[cellI].children[0].nodeName) {
          case 'BUTTON':
          case 'SELECT':
          case 'INPUT':
            row[cellI] = table.rows[rowI].cells[cellI].children[0].value;
            break;
          default:
            console.log('Unknown object in table, copy entire innerHTML. Value: ' + table.rows[rowI].cells[cellI].innerHTML);
            row[cellI] = table.rows[rowI].cells[cellI].innerHTML;
        }
      }
    }
    // if the first row, add it to the header, otherwise add it to the rows.
    if (rowI === 0) {
      headers = row;
    } else {
      // as first row is stolen by header we do -1
      rows[rowI - 1] = row;
    }
  }
  // Create the final object from the rows using the headers as name of each entity.
  for (let i = 0; i < rows.length; i++) {
    jsonObj[i] = {};
    for (let i2 = 0; i2 < rows[i].length; i2++) {
      jsonObj[i][headers[i2]] = rows[i][i2];
    }
  }
  return jsonObj;
}

function addButton() {
  const label = 'Add';
  const okButton = {
    label: 'Add',
    function: "addSave('" + label + "')",
  };
  const closeAllButtonObj = createPopupInput(label, tableConfig, okButton);
  document.getElementsByClassName('content-wrapper')[0].appendChild(closeAllButtonObj);
}

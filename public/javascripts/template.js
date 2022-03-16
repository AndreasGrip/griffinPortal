/** Where to store temporary data. */
let localStorage = 'griffinPortal';

// Arrays of available colors in bootstrap.
const bootstrapButtonColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link'];
const bootstrapAlertColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
const bootstrapBGColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'white'];

/** Test if string is correct json
 *  @param {string} str - string that is checked if it is correct json
 *  @return {boolean}
 */
function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

/** Function that do nothing, used for callback. */
function noOp() {}

// https://stackoverflow.com/questions/39251318/javascript-function-document-createelementtagname-options-doesnt-work-as-i
/**
 * Create a html element, like div, span etc.
 * @param {string} tag - Tag, for instance div, span, a etc.
 * @param {object} options - Optional options like id, href, etc.
 * @param {object} classList - Optional classes to add to the object.
 * @return {htmlElement} - html element like div, span etc.
 */
function oneLineTag(tag, options = {}, classList = []) {
  if (!Array.isArray(classList)) classList = [classList];
  const obj = Object.assign(document.createElement(tag), options);
  obj.classList.add(...classList);
  return obj;
}

/**
 * Replace multiple things in a string
 * For instance string = 'Hello {Name}, have a god {day} {test}', replaceArray = {Name: 'John', day: 'evening'}
 * should return 'Hello John, have a god evening {test}'
 * @param {string} string - Original string
 * @param {object} replacerObject - {replace: replaceWith}
 * @returns {string}
 */
function replaceText(string, replacerObject) {
  Object.keys(replacerObject).forEach((key) => {
    string = string.replaceAll('{' + key + '}', replacerObject[key]);
  });
  return string;
}

/**
 * create a object in localStorage to store data in.
 * @param {string} storeDataWhere - name where to store data
 * @returns {object}
 */
function storeDatafunction(storeDataWhere) {
  if (window[localStorage] === undefined) window[localStorage] = {};
  return function (data) {
    window[localStorage][storeDataWhere] = data;
  };
}

//#region spinlocker

/** Each thing that loads on the page add 1 to this variable. Is then used to remove spinner when this is 0 and show spinner when above. */
window.spinnerLockers = 0;

/**
 * Run this command whenever done with a task to hide spinner when no tasks are left
 * Sibling to waitSpinnerShow()
 */
function waitSpinnerHide() {
  window.spinnerLockers--;
  if (window.spinnerLockers <= 0) {
    // remove all existing spinners
    while (document.getElementById('spinner')) {
      const spinner = document.getElementById('spinner');
      spinner.remove();
    }
  }
}

// Run this command whenever starting a task to show spinner.
/**
 * Run this command whenever start with a task to show the spinner until there is no tasks are left
 * Sibling to waitSpinnerHide()
 */
function waitSpinnerShow() {
  if (window.spinnerLockers === 0) {
    const divMain = document.createElement('div');
    divMain.id = 'spinner';
    divMain.classList.add('gModal');
    const divSpinner = document.createElement('div');
    divSpinner.classList.add('spinningWheel');
    divMain.appendChild(divSpinner);
    divMain.style.display = 'none';
    document.body.appendChild(divMain);
    // Wait 50ms before making the spinner visible to avoid flicker if loading is very fast.
    setTimeout(() => {
      divMain.style.display = '';
    }, 50);
  }
  window.spinnerLockers++;
}
//#endregion spinlocker

// https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable
// streamToString(stream).then(function(response){//Do whatever you want with response});
/**
 * takes a stream and returns a promise that resolves with the utf8 text once the
 * @param {stream} stream
 * @returns Promise returning utf8 string
 */
function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

//#region rest command

/**
 * REST get data.
 * @param {string} url - url to fetch
 * @param {function} runOnSuccess - function that will be called when successfully finished with returned attached as argument. runOnSuccess(data)
 * @param {function} runAfter - function to be called after fetch finished, even if error occured. runAfter()
 */
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
      console.log(err.message);
      console.log(err.stack);
      alert(err.toString());
    })
    .finally(() => {
      if (typeof runAfter === 'function') runAfter();
      waitSpinnerHide();
    });
}

/**
 * REST post data.
 * @param {string} url - url to post to
 * @param {object} postData - data to post, can be object or json string
 * @param {function} runOnSuccess - function that will be called when successfully finished. runOnSuccess(), no argument
 * @param {function} runAfter - function to be called after fetch finished, even if error occured. runAfter()
 */
function postData(url, postData, runOnSuccess, runAfter) {
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
        return Promise.reject(new Error('Page ' + response.url + ' returned status ' + response.status + ' ' + response.statusText + ' ' + response.body));
      }
    })
    .then((data) => {
      runOnSuccess();
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

/**
 * REST patch data.
 * @param {string} url - to send patch to
 * @param {object} patchData - data to patch, can be object or json string
 * @param {function} runOnSuccess - function that will be called when successfully finished. runOnSuccess(), no argument
 * @param {function} runAfter - function to be called after fetch finished, even if error occured. runAfter()
 */
function patchData(url, patchData, runOnSuccess, runAfter) {
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
      runOnSuccess();
    })
    .catch((err) => {
      console.log(err.message);
      console.log(err.stack);
      alert(err.message);
    })
    .finally(() => {
      runAfter();
      waitSpinnerHide();
    });
}

/**
 * REST delete.
 * @param {string} url - to send delete to
 * @param {function} runOnSuccess - function that will be called when successfully finished. runOnSuccess(), no argument
 * @param {function} runAfter - function to be called after fetch finished, even if error occured. runAfter()
 */
function delData(url, runOnSuccess, runAfter) {
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
      runOnSuccess();
    })
    .catch((err) => {
      console.log(err.toString());
      console.log(err.message);
      console.log(err.stack);
      alert(err.toString());
    })
    .finally(() => {
      runAfter();
      waitSpinnerHide();
    });
}

//#endregion rest command

// Create and return element suitable to be a icon.
/**
 * Create and return element suitable to be a icon.
 * @param {string} iconClass
 * @returns html element
 */
function createFaIcon(iconClass) {
  const node = document.createElement('i');
  node.classList.add('fa', iconClass);
  return node;
}

// Clean up the config and add rows that are missing but present in data
/**
 * config will be altered to contain settings for all columns in data.
 * @param {object} config - tableConfig from page
 * @param {object} data - fetched data that will be used to render page
 */
function configUpdateFromData(config, data) {
  // this prevent an ugly error message
  if (data.length > 0 && typeof data[0] === 'string') {
    data.length = 0;
  }
  if (data.length === 0) data.push({ id: 0, description: 'Fake row until you created your first!' });

  const firstRow = data[0] ? data[0] : [];
  // the keys of all the data that is returned in data.
  const dataKeys = Object.keys(firstRow);

  let columns = 0;

  // Now add configured columns that don't exist in the result set.
  for (const key of Object.keys(config)) {
    if (config[key].label === undefined) config[key].label = key;
  }

  // If data is returned that don't exist in config, add to config.
  // If no label is set the key as label.
  dataKeys.forEach((key) => {
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
    // If column was not set by the data received, add one now and mark the config as extra.
    if (config[key].column === undefined) {
      config[key].column = ++columns;
      config[key].extra = true;
    }
  });
}

//#region table
/**
 * generate the the table using config
 * will fetch 'list' from from the webpages relative path to get data
 * @param {object} config - tableConfig from page
 */

function createTable(config) {
  const tableName = 'list';
  const table = oneLineTag('table', { id: tableName });

  function runAfterFunc(data) {
    configUpdateFromData(config, data);
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.textContent = '';
    const preTable = oneLineTag('div', {}, 'preTable');
    tableContainer.appendChild(preTable);
    const search = createTableSearch();
    preTable.appendChild(search);
    const header = createTableHeader(config);
    tableContainer.appendChild(table);
    table.appendChild(header);
    const body = createTableBody(table, config, data);
    //table.appendChild(body);
    const postTable = oneLineTag('div', {}, 'postTable');
    const addBtn = oneLineTag('button', {}, ['circle', 'plus', 'tblAdd']);
    addBtn.addEventListener('click', function () {
      // TODO: this suck find a better way
      const pagename = document.URL.split('/')[document.URL.split('/').length - 2];
      config = {
        label: pagename,
      };

      const content = createAddForm(tableConfig);
      config.content = content;

      const okBtn = function () {
        const data = {};
        function success() {
          const that = this;
          return function () {
            that.windowContainer.parentNode.removeChild(that.windowContainer);
            delete this.windowContainer;
            createTable(tableConfig);
          };
        }
        for (let i = 0; i < content.length; i++) {
          data[content[i].id] = content[i].value;
        }
        postData(content.action, data, success.call(this), noOp);
      };
      config.okFunction = okBtn;
      const window = createWindow(config);
      document.body.appendChild(window);
    });
    postTable.appendChild(addBtn);
    tableContainer.appendChild(postTable);
    const optionsArray = Object.keys(config);
    // Need to get rid of the multiselect (and maybe buttons) as new List destroys all eventlisteners
    for (let i = 0; i < optionsArray.length; i++) {
      const key = optionsArray[i];
      if (/^button\(.*\)/.test(config[key].content) || /^multiselect\(.*\)/.test(config[key].content) || /^singleselect\(.*\)/.test(config[key].content) ) {
        optionsArray.splice(i, 1);
        i--;
      }
    }
    const options = { valueNames: optionsArray };
    const containerId = document.getElementById(tableName).parentNode.id;
    userList = new List(containerId, options);
  }

  getData('list', runAfterFunc, noOp);
}

/**
 * used by function createTable
 * @returns http element - used for search of table
 */
function createTableSearch() {
  const searchContainer = document.createElement('div');
  const search = oneLineTag('input', { type: 'search', placeholder: 'Search' });
  search.classList.add('search');
  searchContainer.appendChild(search);
  return searchContainer;
}

/**
 * used by function createTable
 * @param {object} config - tableConfig from page
 * @returns http element thead - first line in the table
 */
function createTableHeader(config) {
  const thead = document.createElement('thead');
  const theadtr = document.createElement('tr');
  thead.appendChild(theadtr);
  const configKeys = Object.keys(config);
  // For each config add a header column...
  configKeys.forEach((key) => {
    const th = document.createElement('th');
    th.classList.add('sort');
    th.setAttribute('data-sort', key);
    th.appendChild(document.createTextNode(config[key].label));
    theadtr.appendChild(th);
  });
  return thead;
}

/**
 *
 * @param {httpElementTable} table - the table that body will be appended to
 * @param {object} config - tableConfig from page
 * @param {object} data - data that will be used to render page
 * @returns {httpElementBody} - returns the body. Already appended to table
 */
function createTableBody(table, config, data) {
  const tbody = document.createElement('tbody');
  tbody.classList.add('list');
  table.appendChild(tbody);
  const configKeys = Object.keys(config);

  for (const row of data) {
    const bodytr = document.createElement('tr');
    tbody.appendChild(bodytr);

    //fix values we can't handle for now
    configKeys.forEach((key) => {
      // if not number or text replace with empty text.
      if (typeof row[key] !== 'number' && typeof row[key] !== 'string') row[key] = '';
      const td = document.createElement('td');
      bodytr.appendChild(td);
      td.conf = tableConfig[key];
      td.classList.add(key);
      /*td.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          simulateTab.call(td);
        }
      });*/
      const rowVariables = {};
      if (key && config[key]) {
        if (config[key].function) rowVariables.function = replaceText(config[key].function, row);
        if (config[key].content) rowVariables.content = replaceText(config[key].content, row);
        if (config[key].value) rowVariables.value = replaceText(config[key].value, row);
      }

      switch (true) {
        case /^button\(.*\)/.test(config[key].content):
          const contentArray = config[key].content.match(/\w+\((.*)\)/)[1].split(',');
          const button = uiBtnCreate(contentArray[0], contentArray[1], rowVariables.function, rowVariables.value);
          td.appendChild(button);
          break;
        case /^multiselect\(.*\)/.test(config[key].content):
          // Extract the selected values from string by first convert the text to proper JSON
          // TODO: This should have been JSON in the first place. Test if json, if json don't do the replace thing.
          if (row[key] === '') row[key] = '[]';
          const mSelectSelected = JSON.parse(row[key].replace(/\[/, '["').replace(/\]/, '"]').replace(/,/g, '","'));
          const mSelectAll = window.griffinPortal[key];
          mSelectAll.forEach((x) => {
            if (x.name && !x.text) {
              x.text = x.name;
              delete x.name;
            }
            if (x.id && !x.value) {
              x.value = x.id;
              delete x.id;
            }
          });
          const mSelectOptions = Array.from(JSON.parse(JSON.stringify(mSelectAll)));
          // TODO: Naming should be fixed to be consistent ffs.
          // options: [{text: 'showed text', value: 'value to save', selected: true}
          /*for (const property in mSelectOptions) {
            const option = mSelectOptions[property];
            if(mSelectSelected.includes(option.name)) option.selected = true;
            option.text = option.name;
            delete option.text;
            option.value = option.id;
            delete option.id;
          }*/

          mSelectOptions.forEach((x) => {
            if (mSelectSelected.includes(x.text)) x.selected = true;
            // if (mSelectSelected.includes(x.value)) x.selected = true;
            // if (mSelectSelected.includes(x.text)) x.selected = true;
            // if (mSelectSelected.includes(x.value)) x.selected = true;
          });

          // console.log(mSelectAll);
          // console.log(mSelectSelected);
          const msel = uiMSelCreate(td, mSelectOptions, config[key].api);
          break;
        case /^singleselect\(.*\)/.test(config[key].content):
          const sSelectSelected = row[key];
          const sSelectAll = window.griffinPortal[key];
          const sSelectOptions = Array.from(JSON.parse(JSON.stringify(sSelectAll)));
          // Test is fist row is correct, otherwise treat as no options is available
          if (!Array.isArray(sSelectOptions) || typeof sSelectOptions[0] === 'string') {
            sSelectOptions.length = 0;
            sSelectOptions.push({ text: 'No OptionsAvailable', value: '' });
          }

          sSelectOptions.forEach((x) => {
            if (sSelectSelected === x.id) x.selected = true;
          });

          const ssel = uiSSelCreate2(td, sSelectOptions, config[key].api);
          break;
        //const contentArray = config[key].content.match(/\w+\((.*)\)/)[1].split(',');
        //const valueArray = isJson(config[key].value) ? JSON.parse(config[key].value) : [];

        default:
          td.innerHTML = row[key];
          if (config[key].editable === true) {
            td.setAttribute('contenteditable', 'true');
            td.setAttribute('onfocus', 'tableCellEditStart(this);');
            td.setAttribute('onfocusout', 'tableCellEditEnd(this);');
          }
      }
    });
    bodytr.rawdata = row;
  }
  return tbody;
}

//#region tableCellEdit
/**
 * This is triggered when editable cells get focus.
 * change the color of a object that is being edited
 * @param {httpElement} that - element that got focus
 */
function tableCellEditStart(that) {
  that.classList.add('editing');
}

// TODO: fix validation
function tableCellEditCellValidation(that, config) {
  const key = that.conf.key;
  const oldData = that.parentNode.rawdata[key];
  const newData = that.textContent;
  const validationString = config[key]?.validation;
}

/**
 * This is triggered when editable cells loses focus.
 * change the color of a object, will get green if save is sucessful, and red if unsuccesful. In both cases the color will fade out.
 * If unsuccesful the value will change back to original value.
 * @param {httpElement} that - element that lost focus
 */
function tableCellEditEnd(that) {
  that.classList.remove('editing');
  const key = that.conf.key;
  const newData = that.textContent;
  const oldData = String(that.parentNode.rawdata[key]);
  const updateData = { valueToChange: key, newValue: newData };
  let success = false;
  if (oldData !== newData) {
    const rowId = that.parentNode.rawdata.id;
    that.setAttribute('contenteditable', 'false');
    that.classList.add('saveProgress');
    patchData(
      rowId,
      updateData,
      () => {
        success = true;
      },
      () => {
        that.setAttribute('contenteditable', 'true');
        that.classList.remove('saveProgress');
        if (success) {
          that.classList.add('saveSuccess');
          that.parentNode.rawdata[key] = newData;
        } else {
          that.classList.add('saveFail');
        }
        setTimeout(() => {
          that.classList.add('saveDone');
        }, 50);

        setTimeout(() => {
          if (that.classList.contains('saveSuccess')) that.classList.remove('saveSuccess');
          if (that.classList.contains('saveFail')) that.classList.remove('saveFail');
          if (that.classList.contains('saveDone')) that.classList.remove('saveDone');
          if (success === false) that.textContent = oldData;
        }, 1000);
      }
    );
  }
}
//#endregion tableCellEdit

//#endregion table
/**
 *
 * @param {string} label - What should be the label of the button
 * @param {string} type - What type of button (bootstrap)
 * @param {string} functionString - the name of the function to run onClick
 * @param {variable} value - variable that will be the value of the button, usually string or number
 * @returns http element button;
 */
function uiBtnCreate(label, type, functionString, value) {
  if (!bootstrapButtonColors.includes(type.toLowerCase())) type = 'default';
  if (!value) value = '';
  const button = oneLineTag('button', { value: value });
  button.setAttribute('onClick', functionString);
  button.classList.add('btn', 'btn-' + type, 'btn-rounded', 'fullWidth');
  button.appendChild(document.createTextNode(label));
  return button;
}

function uiSSelCreate2(attachTo, selectoptions = {}, APIPatchOnChange = '') {
  const htmlOptions = {};
  htmlOptions.options = selectoptions.map(x => {
    return oneLineTag('option', x);
  })

  const select = oneLineTag('select', {});
  selectoptions.forEach(x => {
    const option = document.createElement('option');
    option.text = x.name;
    option.value = x.id;

    select.options.add(option);
  })
  select.options.selectedIndex = selectoptions.findIndex(x => x.selected)
  select.lastSuccessfullIndex = select.options.selectedIndex;
  select.addEventListener('change', event => {
    const key = attachTo.conf.key;
    const newData = event.target.value;
    const oldData = String(attachTo.parentNode.rawdata[key]);
    const updateData = { valueToChange: key, newValue: newData };
  
    const rowId = attachTo.parentNode.rawdata.id;

    attachTo.classList.add('saveProgress');

    patchData(
      rowId,
      updateData,
      () => {
        success = true;
      },
      () => {
        //attachTo.setAttribute('contenteditable', 'true');
        attachTo.classList.remove('saveProgress');
        if (success) {
          attachTo.classList.add('saveSuccess');
          attachTo.parentNode.rawdata[key] = newData;
        } else {
          attachTo.classList.add('saveFail');
          select.options.selectedIndex = selectoptions.findIndex(x => x.value === oldData);
        }
        setTimeout(() => {
          attachTo.classList.add('saveDone');
        }, 50);

        setTimeout(() => {
          if (attachTo.classList.contains('saveSuccess')) attachTo.classList.remove('saveSuccess');
          if (attachTo.classList.contains('saveFail')) attachTo.classList.remove('saveFail');
          if (attachTo.classList.contains('saveDone')) attachTo.classList.remove('saveDone');
          if (success === false) attachTo.textContent = oldData;
          if (success === false) select.options.selectedIndex = selectoptions.findIndex(x => x.value === oldData);
        }, 1000);
      }
    );
  //  console.log(attachTo.parentNode);
  //  attachTo.conf.key;
  })
  attachTo.appendChild(select);
}

/**
 * Create a dropdown where one thing can be selected
 * @param {httpElement} attachTo - http element to attach the selectbox
 * @param {arrayOfObjects} selectOptions - {value: numberToStore, text: shownText}, this is attached directly to http button.
 * @param {string} APIPatchOnChange - what url patch will be sent to, used in toggleMenu
 * @returns http element div - the container containing the dropdown.
 */
function uiSSelCreate(attachTo, selectOptions, APIPatchOnChange) {
  const container = document.createElement('div');
  attachTo.appendChild(container);
  // Set text to value if not set.
  selectOptions.forEach((option) => {
    if (option.name === undefined) option.name = option.id;
  });

  // Create the select button
  const select = oneLineTag('span', {}, 'select');

  // attach the selectOptions to select object
  select.selectOptions = selectOptions;

  // attach the select dropdown.
  container.appendChild(select);
  container.addEventListener(
    'click',
    function () {
      console.log('container clicked');
    },
    false
  );

  // The next line works
  // container.setAttribute('onClick', "console.log('container2 clicked')");

  select.addEventListener('click', function () {
    console.log('select clicked');
    //    toggleMenu();
  });
  updateSelected();

  // if that is defined, switch the selected variable
  // else just update the list
  function updateSelected(that = undefined) {
    if (that) that.optionData.selected = !that.optionData.selected;

    // Remove the old list of unselected objects.
    const oldNotSelected = container.getElementsByClassName('notSelectedContainer');
    if (oldNotSelected.length > 0) {
      for (let item of oldNotSelected) {
        item.remove();
      }
    }

    // create new arrays of selected/unselected
    const selected = selectOptions.filter((option) => option.selected);
    const notSelected = selectOptions.filter((option) => !option.selected);
    if (selected.length > 0) {
      select.textContent = selected[0].name;
    } else {
      if (notSelected.length > 0) {
        select.textContent = 'Nothing selected';
      } else {
        select.textContent = 'Nothing to beselected';
      }
    }
  }

  function toggleMenu() {
    console.log('toggle sSel');
    // if a menu is already present remove it (as this is toggle)
    const menu = container.getElementsByClassName('notSelectedContainer');
    if (menu.length > 0) {
      for (let item of menu) {
        item.remove();
      }
    } else {
      const notSelected = selectOptions.filter((option) => !option.selected);
      const optionList = oneLineTag('span', {}, 'notSelectedContainer');
      notSelected.forEach((optionData) => {
        const option = oneLineTag('div', optionData, ['notSelected']);
        option.optionData = optionData;
        option.innerHTML = optionData.name;
        option.addEventListener('click', function () {
          console.log('click');
          const id = this.parentNode.parentNode.parentNode.parentNode.rawdata.id;
          const key = this.parentNode.parentNode.parentNode.conf.key;
          const value = this.id;

          patchData(
            APIPatchOnChange + '/' + id,
            { valueToChange: value, newValue: true },
            () => updateSelected(option),
            () => toggleMenu()
          );
          // updateSelected(option);
          //toggleMenu();
        });
        optionList.appendChild(option);
        container.appendChild(optionList);
      });
    }
  }
  return container;
}

// options: [{text: 'showed text', value: 'value to save', selected: true},{text: 'showed text2', value: 'value to save2'},{text: 'showed text3', value: 'value to save3', selected: true},{text: 'showed text4', value: 'value to save4'},{text: 'showed text5', value: 'value to save5'},{text: 'showed text6', value: 'value to save6'}]
// Above is ready to use in select.
function uiMSelCreate(attachTo, selectOptions, APIPatchOnChange) {
  const container = document.createElement('div');
  attachTo.appendChild(container);
  // Set text to value if not set.
  selectOptions.forEach((option) => {
    if (option.text === undefined) option.text = option.value;
  });

  // Create the select button
  const select = oneLineTag('span', {}, 'select');

  // attach the selectOptions to select object
  select.selectOptions = selectOptions;

  // attach the select dropdown.
  container.appendChild(select);
  container.addEventListener(
    'click',
    function () {
      console.log('container clicked');
    },
    false
  );

  // The next line works
  // container.setAttribute('onClick', "console.log('container2 clicked')");

  select.addEventListener('click', function () {
    console.log('select clicked');
    toggleMenu();
  });

  updateSelected();

  // if that is defined, switch the selected variable
  // else just update the list
  function updateSelected(that = undefined) {
    if (that) that.optionData.selected = !that.optionData.selected;

    // Remove the old list of selected objects.
    const oldSelected = container.getElementsByClassName('selectOptions');
    if (oldSelected.length > 0) {
      for (let item of oldSelected) {
        item.remove();
      }
    }
    // Remove the old list of unselected objects.
    const oldNotSelected = container.getElementsByClassName('notSelectedContainer');
    if (oldNotSelected.length > 0) {
      for (let item of oldNotSelected) {
        item.remove();
      }
    }

    // create new arrays of selected/unselected
    const selected = selectOptions.filter((option) => option.selected);
    const notSelected = selectOptions.filter((option) => !option.selected);
    if (notSelected.length > 0) {
      select.innerHTML = 'Add (' + notSelected.length + ')';
    } else {
      if (select.innerHTML !== 'All added') select.innerHTML = 'All added';
    }

    // Create the container for selected options
    const selectedOptions = oneLineTag('span', {}, 'selectOptions');
    // attach the selectedOptions container to the container.
    container.appendChild(selectedOptions);
    // Iterate over selected and create buttons for each.
    selected.forEach((optionData) => {
      optionData.type = 'button';
      const option = oneLineTag('button', optionData);
      option.innerHTML = optionData.text;
      selectedOptions.appendChild(option);
      option.optionData = optionData;
      option.addEventListener('click', function () {
        // Todo: make those closer, less parentNode.
        const id = this.parentNode.parentNode.parentNode.parentNode.rawdata.id;
        const key = this.parentNode.parentNode.parentNode.conf.key;
        const value = this.value;
        if (id) {
          patchData(APIPatchOnChange + '/' + id, { valueToChange: value, newValue: false }, () => updateSelected(option), noOp);
        } else {
          alert('Unable to figure out id of the row we want to change.');
        }
      });
    });
  }

  function toggleMenu() {
    console.log('toggle');
    // if a menu is already present remove it (as this is toggle)
    const menu = container.getElementsByClassName('notSelectedContainer');
    if (menu.length > 0) {
      for (let item of menu) {
        item.remove();
      }
    } else {
      const notSelected = selectOptions.filter((option) => !option.selected);
      const optionList = oneLineTag('span', {}, 'notSelectedContainer');
      notSelected.forEach((optionData) => {
        const option = oneLineTag('div', optionData, ['notSelected']);
        option.optionData = optionData;
        option.innerHTML = optionData.text;
        option.addEventListener('click', function () {
          console.log('click');
          const id = this.parentNode.parentNode.parentNode.parentNode.rawdata.id;
          const key = this.parentNode.parentNode.parentNode.conf.key;
          const value = this.value;

          patchData(
            APIPatchOnChange + '/' + id,
            { valueToChange: value, newValue: true },
            () => updateSelected(option),
            () => toggleMenu()
          );
          // updateSelected(option);
          //toggleMenu();
        });
        optionList.appendChild(option);
        container.appendChild(optionList);
      });
    }
  }

  return container;
}

// options should be in format, if no text is defined, value will be used instead
// [{text: 'showed text', value: 'value to save', selected: true},{text: 'showed text2', value: 'value to save2'}]
/*function uiSSelCreate(options, APIPatchOnChange) {
  const uiSelect = document.createElement('select');
  options.forEach((option) => {
    if (option.text === undefined) option.text = option.value;
    const uiOption = oneLineTag('option', option);
    uiSelect.appendChild(uiOption);
  });
  return uiSelect;
}*/

// Ripped from https://github.com/AndreasGrip/enter2tab
// This will try to emulate the behavior of a tab press by giving the
// next object focus
function simulateTab() {
  obj = this;
  let found = false;
  let end = false;
  while (found === false && end === false) {
    if (obj.firstChild) {
      obj = obj.firstChild;
    } else if (obj.nextSibling) {
      obj = obj.nextSibling;
    } else if (obj.parentNode && obj.parentNode.nextSibling) {
      obj = obj.parentNode.nextSibling;
    } else {
      end = true;
    }
    if (obj && obj.contentEditable === 'true') found = true;
    if (obj && (obj.tagName === 'INPUT' || obj.tagName === 'TEXTAREA' || obj.tagName === 'A' || obj.tagName === 'AUDIO' || obj.tagName === 'VIDEO' || obj.tagName === 'SELECT' || obj.tagName === 'BUTTON' || obj.tagName === 'PROGRESS')) found = true;
    if (found) {
      // tab don't stop on hidden objects
      if (obj.style.display === 'none') found = false;
    }
  }
  if (found) {
    obj.focus();
    // if the obj accept text input, move the cursor to the end.
    // This is not standard tab behavior, but should be.
    if (obj.contentEditable === 'true' || obj.tagName === 'INPUT' || obj.tagName === 'TEXTAREA') {
      commandEOL.call(obj);
    }
  }
}

// Ripped from https://github.com/AndreasGrip/enter2tab
// Move the cursor to the end of the line.
function commandEOL() {
  // for div and span
  if (this.childNodes.length > 0) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(this.lastChild, this.lastChild.length);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  }
  if (obj.tagName === 'INPUT' || obj.tagName === 'TEXTAREA') {
    this.selectionStart = this.selectionEnd = this.value.length;
  }
}

/**
 * config = {
 * label: 'Label of window',
 * content: 'Content to view in html',
 * okFunction: function triggered by ok button}, if not defined then no okay button but just a close button will appear.*/
function createWindow(config) {
  const label = config.label ? config.label : '';
  const content = config.content ? config.content : '';
  let okFunction;
  if (typeof config.okFunction === 'function') {
    okFunction = config.okFunction;
  } else {
    okFunction = false;
  }
  const container = oneLineTag('div', {}, 'gModal');
  const windowDiv = oneLineTag('div', {}, ['window']);
  container.appendChild(windowDiv);
  const header = oneLineTag('div', {}, ['header']);
  header.appendChild(document.createTextNode(label));
  const contentDiv = oneLineTag('div', {}, 'content');
  windowDiv.appendChild(header);
  windowDiv.header = header;
  windowDiv.appendChild(contentDiv);
  windowDiv.content = contentDiv;
  if (typeof content === 'string') {
    contentDiv.innerHTML = content;
  } else {
    contentDiv.innerHTML = '';
    contentDiv.appendChild(content);
  }

  const buttonArea = oneLineTag('div', {}, 'buttonArea');
  if (okFunction) {
    const okButton = oneLineTag('button', {}, ['buttonOk', 'btn', 'btn-primary']);
    okButton.innerHTML = 'OK';
    okButton.windowContainer = container;
    buttonArea.appendChild(okButton);
    okButton.addEventListener('click', okFunction);
  }

  const cancelButton = oneLineTag('button', {}, ['buttonCancel', 'btn', 'btn-secondary']);
  cancelButton.innerHTML = okFunction ? 'Cancel' : 'Close';
  cancelButton.addEventListener('click', function () {
    container.remove();
  });

  buttonArea.appendChild(cancelButton);
  windowDiv.appendChild(buttonArea);

  return container;
}

/* takes the tableConfig and create a form with all fields */

// get value from  input and test if it matches validation
function inputValidation(inputObj, validation) {
  const value = inputObj.value;
  const regex = new RegExp(validation);
  return regex.test(value);
}

function createAddForm(tConfig) {
  const formDiv = oneLineTag('form', { id: 'addForm' }, 'windowForm');
  for (const key of Object.keys(tConfig)) {
    const conf = tConfig[key];
    if (conf.addNew) {
      const div = document.createElement('div');
      formDiv.appendChild(div);
      if (conf.icon) {
        const faIcon = createFaIcon(conf.icon);
        /* faIcon.classList.add('prefix', 'grey-text'); */
        div.appendChild(faIcon);
      }
      const labelFirst = oneLineTag('label', { for: key });
      labelFirst.appendChild(document.createTextNode(conf.label));
      div.appendChild(labelFirst);
      const inputFirst = oneLineTag('input', { type: key, id: key, validation: conf.validation });
      div.appendChild(inputFirst);
    }
  }
  return formDiv;
}

function del(url) {
  function success() {
    createTable(tableConfig);
  }
  delData(url, success, noOp);
}

function changePassword(id) {
  const changepasswordConfig = {
    password: {
      label: 'New Password',
      validation: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/',
      icon: 'fa-key',
      addNew: true,
    },
  };
  const content = createAddForm(changepasswordConfig);
  const config = {};
  config.content = content;

  const okBtn = function () {
    const data = {};
    function success() {
      const that = this;
      return function () {
        that.windowContainer.parentNode.removeChild(that.windowContainer);
        delete this.windowContainer;
      };
    }
    if (content && content[0] && content[0].id && content[0].value) {
      patchData(content.action + id, { valueToChange: content[0].id, newValue: content[0].value }, success.call(this), noOp);
    }
  };
  config.okFunction = okBtn;
  const window = createWindow(config);
  document.body.appendChild(window);
}

const settingsBtn = document.getElementById('settingsBtn');
settingsBtn.addEventListener('click', function () {
  const menu = document.getElementById('settingsMenu');
  menu.classList.toggle('hidden');
});
const menu = document.getElementById('settingsMenu');
menu.classList.toggle('hidden');

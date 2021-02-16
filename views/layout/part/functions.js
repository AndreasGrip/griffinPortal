/*  General function that create a popup form for input data.
      usage
      label: will be used both as Label on the popupwindow, as well as part of id for everything in it.
      config: exactly like tableConfig, only objects containing {addNew: true} will be shown
      okButtonConfig: function that will be run if ok button is pressed. label can be passed as an argument to be able to find the objects.
*/

function createPopupInput(label, config, okButtonConfig) {
  // Remove any old forms
  $('#' + label + 'Form').remove();
  let result = '';
  result += '<div class="modal fade" id="' + label + 'Form" tabindex="-1" role="dialog" aria-labelledby="' + label + 'Label" aria-hidden="true">';
  result += '<div class="modal-dialog" role="document">';
  result += '<div class="modal-content">';
  result += '<div class="modal-header text-center">';
  result += '<h4 class="modal-title w-100 font-weight-bold">' + label + '</h4>';
  result += '<button type="button" class="close" data-dismiss="modal" aria-label="Close">';
  result += '<span aria-hidden="true">&times;</span>';
  result += '</button>';
  result += '</div>';
  result += '<div class="modal-body mx-3" id="' + label + 'FormContent">';
  result += '<!-- Content will go here -->';

  for (const key of Object.keys(config)) {
    if (config[key].addNew) {
      result += '<div class="md-form mb-5">';
      if (config[key].icon) {
        result += '<i class="fa ' + config[key].icon + ' prefix grey-text"></i>';
      }
      result += '<label data-error="wrong" data-success="right" for="' + label + '-' + key + '">' + config[key].label + '</label>';
      result += '<input type="' + key + '" id="' + label + '-' + key + '" class="form-control validate ' + key + 'Value">';
      result += '</div>';
    }
  }

  result += '</div>';
  result += '<div class="modal-footer d-flex justify-content-center">';
  result += '<button class="btn btn-primary" onclick="' + okButtonConfig.function + ';">' + okButtonConfig.label + '</button>';
  result += '<button class="btn btn-danger" onclick="$(\'#' + label + "Form').modal('hide');setTimeout(() => { $('#" + label + 'Form\').remove(); }, 1000)" data-dismiss="modal">Cancel</button>';

  result += '</div>';
  result += '</div>';
  result += '</div>';
  result += '</div>';
  return result;
  // $(result).appendTo($('.content-wrapper')[0]);
}

// optionsVar = array of object containing the options.
// saveCol = value int the object containing the value to be saved;
// showCol = value in the object containing the value to show;
// apiSave = what api to call to save
function uisSel2Create(orgValue, optionsVar, saveCol, showCol, apiSave) {
  let returnString = '';
  const options = window.adminLTE[optionsVar]; // Get the configured options
  const realOptions = []; // The options as it will be inserted (bogus syntax removed)
  for (const val in options) {
    // Make sure both values we use are included
    if (options[val] && options[val][saveCol] && options[val][showCol]) {
      const selected = options[val][saveCol] === orgValue;
      realOptions.push({ saveCol: options[val][saveCol], showCol: options[val][showCol], selected: selected });
    } else {
      console.log(JSON.stringify(options[val]) + ' didnt contain saveCol and showCol, discarding');
    }
  }
  returnString += '<select size="1" onchange="uisSel2CreateChange(this,' + apiSave + ');">';
  for (const val in realOptions) {
    if (realOptions[val].selected) {
      returnString += '<option value="' + realOptions[val].saveCol + '" selected>';
    } else {
      returnString += '<option value="' + realOptions[val].saveCol + '">';
    }
    returnString += realOptions[val].showCol;
    returnString += '</option>';
  }
  returnString += '</select>';
  return returnString;
}

// optionsVar = array of object containing the options.
// showCol = value in the object containing the value to show;
// functionOnChange = what function to call with the selected option object as argument.
function uisSel2CreateFunction(orgValue, optionsVar, showCol, functionOnChange) {
  let returnString = '';
  const options = window.adminLTE[optionsVar]; // Get the configured options
  const realOptions = []; // The options as it will be inserted (bogus syntax removed)
  for (const val in options) {
    // Make sure both values we use are included
    if (options[val] && options[val][showCol]) {
      const selected = options[val][showCol] === orgValue;
      options[val].selected = selected;
      realOptions.push(options[val]);
    } else {
      console.log(JSON.stringify(options[val]) + ' was somehow wrong, discarding');
    }
  }
  returnString += '<select size="1" onchange="' + functionOnChange + '(this);">';
  returnString += "<option value='{}'>";
  for (const val in realOptions) {
    if (realOptions[val].selected) {
      returnString += "<option value='" + JSON.stringify(realOptions[val]) + "' selected>";
    } else {
      returnString += "<option value='" + JSON.stringify(realOptions[val]) + "'>";
    }
    returnString += realOptions[val][showCol];
    returnString += '</option>';
  }
  returnString += '</select>';
  return returnString;
}

// function uiSSelCreate(selected, apiGetObjects, api) {
function uiSSelCreate(selected, allOptionsGlobalVariable, apiSaveSelected) {
  apiSaveSelected = apiSaveSelected ? apiSaveSelected : '';
  let returnString = '';
  //Create object with all available objects
  const objectList = {};
  const allOptionsGlobalVariable_real = window.adminLTE[allOptionsGlobalVariable];
  for (const val in allOptionsGlobalVariable_real) {
    //    allOptionsGlobalVariable_real[val] = allOptionsGlobalVariable_real[val] === undefined ? {} : allOptionsGlobalVariable_real[val];
    if (allOptionsGlobalVariable_real[val] === undefined) {
      allOptionsGlobalVariable_real[val] = {};
    }
    if (!objectList[allOptionsGlobalVariable_real[val].name]) {
      objectList[allOptionsGlobalVariable_real[val].name] = allOptionsGlobalVariable_real[val];
      objectList[allOptionsGlobalVariable_real[val].name].selected = false;
    }
    if (objectList[allOptionsGlobalVariable_real[val].name].id == selected) {
      objectList[allOptionsGlobalVariable_real[val].name].selected = true;
    } else {
      objectList[allOptionsGlobalVariable_real[val].name].selected = false;
    }
  }

  //  objectList[selected] = objectList[selected] ? objectList[selected] : {selected: true, id: 0};
  //  objectList[selected].selected = true;

  returnString += '<select size="1" onchange="uiSSelCreateChange(this,' + apiSaveSelected + ');">';
  for (const key of Object.keys(objectList)) {
    if (!objectList[key].selected) {
      returnString += '<option value="' + objectList[key].id + '">';
    } else {
      returnString += '<option value="' + objectList[key].id + '" selected>';
    }
    returnString += key;
    returnString += '</option>';
  }
  returnString += '</select>';
  return returnString;
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
  api = api ? api : '';
  let returnString = '';
  if (setValue == checkedValue) {
    returnString += '<input type="checkbox" value="' + checkedValue + '" onChange="uiCBCreateChange(this,\'' + uncheckedValue + "','" + checkedValue + "' ,'" + api + '\');" checked>';
  } else {
    returnString += '<input type="checkbox" value="' + uncheckedValue + '" onChange="uiCBCreateChange(this,\'' + uncheckedValue + "','" + checkedValue + "' ,'" + api + '\');" >';
  }
  return returnString;
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

function uiMSelCreate(selected, allObjects, api) {
  // constCreate object with all available objects
  const objectList = {};
  for (const val in allObjects) {
    objectList[allObjects[val].name] = false;
  }
  for (const val of selected) {
    objectList[val] = true;
  }
  let returnString = '';
  returnString += '<div>';
  returnString += '<ul class="mSelOptions">';
  for (const key of Object.keys(objectList)) {
    if (objectList[key]) {
      returnString += '<li onClick="uiMSelCreateDel(this,\'' + api + '\');"><input type="hidden" name="aChoice" value="' + key + '">' + key + '</li>';
    }
  }
  returnString += '</ul>';
  returnString += '<select size="1" onchange="uiMSelCreateAdd(this,\'' + api + '\');">';
  returnString += '<option value="">Select something to add</option>';
  for (const key of Object.keys(objectList)) {
    if (!objectList[key]) {
      returnString += '<option value="' + key + '">';
    }
    returnString += key;
    returnString += '</option>';
  }
  returnString += '</select>';
  returnString += '';
  returnString += '</div>';

  return returnString;
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
  const input = document.createElement('input');
  console.log(option);
  const text = document.createTextNode(option.firstChild.data);

  input.type = 'hidden';
  input.name = 'aChoice';
  input.value = option.value;

  li.appendChild(input);
  li.appendChild(text);
  li.setAttribute('onclick', 'uiMSelCreateDel(this);');

  ul.appendChild(li);

  select.options.remove(select.selectedIndex);

  patchData(api + '/' + rowId, { valueToChange: valueToChange, newValue: true }, doNothing, doNothing);
}
function uiMSelCreateDel(select, api) {
  const rowId = select.parentElement.parentElement.parentElement.parentNode.firstElementChild.innerText;
  // alert(elem.parentElement.firstElementChild.textContent);
  const value = select.getElementsByTagName('input')[0].value;
  const valueToChange = value;
  const text = select.childNodes[1].data;
  const opt = document.createElement('option');
  opt.value = value;
  opt.text = text;
  // select.parentNode.parentnode.getElementsByTagName('select').options.add(opt);
  select.parentNode.parentNode.childNodes[1].options.add(opt);
  console.log(select);
  select.parentNode.removeChild(select);
  patchData(api + '/' + rowId, { valueToChange: valueToChange, newValue: false }, doNothing, doNothing);
}

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
  // console.log('value :', value);
  const returnString = '<button class="btn btn-' + type + ' btn-rounded mb-4" onClick="' + functionString + '" value=' + value + '>' + label + '</button>';
  return returnString;
}

function uiFUCreate(label, dest, format, id) {
  let returnString = '';
  returnString += '<form action="' + dest + '" method="post" enctype="multipart/form-data">';
  returnString += '<label for="fileToUpload' + id + '" class="file-upload-button"><i class="fa fa-upload"></i>' + label + '</label>';
  const acceptstring = format ? 'accept="' + format + '"' : '';
  returnString += '<input type="file" id="fileToUpload' + id + '" name="fileToUpload" onchange="this.parentElement.submit();" ' + acceptstring + ' />';
  returnString += '<input type="hidden" name="listId" value="' + id + '" />';
  returnString += '</form>';
  return returnString;
}

function createContactView(data, config) {
  let respond = '';
  respond += '<table class="table table-bordered" id="customer">';
  respond += '<thead><tr><th>Label</th><th>Value</th></tr>';
  for (let i = 0; i < Object.keys(data[0]).length; i++) {
    let confKey = Object.keys(data[0])[i];
    //If there was no configuration for this column create one
    config[confKey] = config[confKey] === undefined ? {} : config[confKey];
    //save the column number
    config[confKey].column = i;
    columns = i;
    //If no label is defined, use the column name as label
    config[confKey].label = config[confKey].label === undefined ? key : config[confKey].label;

    respond += '<td>' + config[confKey].label + '</td>';
  }
}

function createTable(data, config) {
  let columns = 0;
  const editable = [];
  let respond = '';
  if (data.length > 0) {
    respond += '<table class="table table-bordered" id="list">';
    respond += '<thead><tr>';
    // For each resultset...
    for (let i = 0; i < Object.keys(data[0]).length; i++) {
      let confKey = Object.keys(data[0])[i];
      // If there was no configuration for this column create one
      config[confKey] = config[confKey] === undefined ? {} : config[confKey];
      // save the column number
      config[confKey].column = i;
      columns = i;
      // If no label is defined, use the column name as label
      config[confKey].label = config[confKey].label === undefined ? confKey : config[confKey].label;

      respond += '<th>' + config[confKey].label + '</th>';
    }
    // Now add configured columns that don't exist in the resultset.
    for (const key of Object.keys(config)) {
      if (config[key].column === undefined || config[key].extra) {
        if (config[key].column === undefined) {
          config[key].column = ++columns;
          config[key].extra = true;
        }
        // If no label is defined, use the column name as label
        config[key].label = config[key].label === undefined ? key : config[key].label;

        respond += '<th>' + config[key].label + '</th>';
      }
      if (config[key].editable) {
        editable.push(config[key].column);
      }
    }

    respond += '</tr></thead>';

    respond += '<tbody>';
    for (let row of data) {
      respond += '<tr>';
      for (let key of Object.keys(config)) {
        // TODO This must be wrong
        if (config[key].extra || true) {
          // If not a string or number change to empty. (To Origin)
          if (typeof row[key] !== 'number' && typeof row[key] !== 'string') {
            row[key] = '';
          }

          function addArguments(string, row) {
            let replaceables;
            let returnString = string;
            if ((replaceables = returnString.match(/\{(\w*)\}/g))) {
              for (let arg of replaceables) {
                const arg2 = arg.match(/\{(\w*)\}/)[1] ? arg.match(/\{(\w*)\}/)[1] : arg;
                returnString = returnString.replace('{' + arg2 + '}', row[arg2]);
              }
            }
            return returnString;
          }

          const row_variables = {};
          if (config[key].function) {
            row_variables.function = addArguments(config[key].function, row);
          }
          if (config[key].content) {
            row_variables.content = addArguments(config[key].content, row);
          }
          if (config[key].value) {
            row_variables.value = addArguments(config[key].value, row);
          }

          let contentArray = [];
          switch (true) {
            case /^button\(.*\)/.test(row_variables.content):
              contentArray = row_variables.content.match(/\w+\((.*)\)/)[1].split(',');
              row[key] = uiBtnCreate(contentArray[0], row_variables.function, contentArray[1], row_variables.value);
              break;
            case /^multiselect\(.*\)/.test(row_variables.content):
              // contentArray = row_variables.content.match(/^multiselect\(\[(.*)\]/)[1].split(',');
              contentArray = row_variables.content.match(/^multiselect\((\[?([\w\d\s\,]*)\]?),(\w*)\)/)[2].split(',');
              const allOptions = row_variables.content.match(/^multiselect\((\[?([\w\d\s\,]*)\]?),(\w*)\)/)[3];
              row[key] = uiMSelCreate(contentArray, window.adminLTE[allOptions], config[key].api);
              break;
            case /^singleselect\(.*\)/.test(row_variables.content):
              contentArray = row_variables.content.match(/^singleselect\((.*)\)/)[1].split(',');
              // uiSSelCreate(selected, url to get options, url to update)
              row[key] = uiSSelCreate(contentArray[0], contentArray[1], contentArray[2]);
              break;
            case /^singleselect2\(.*\)/.test(row_variables.content):
              contentArray = row_variables.content.match(/^singleselect2\((.*)\)/)[1].split(',');
              // optionsVar = array of object containing the options.
              // saveCol = value int the object containing the value to be saved;
              // showCol = value in the object containing the value to show;
              // apiSave = what api to call to save
              // // uisSel2Create(orgValue, optionsVar, saveCol, showCol, apiSave);
              row[key] = uisSel2Create(row[key], ...contentArray);
              break;
            case /^checkbox\(.*\)/.test(row_variables.content):
              contentArray = row_variables.content.match(/^checkbox\((.*)\)/)[1].split(',');
              // uiSSelCreate(selected, url to get options, url to update)
              row[key] = uiCBCreate(contentArray[0], contentArray[1], contentArray[2]);
              break;
            case /^upload\(.*\)/.test(row_variables.content):
              contentArray = row_variables.content.match(/^upload\((.*)\)/)[1].split(',');
              row[key] = uiFUCreate(contentArray[0], contentArray[1], contentArray[2], contentArray[3]);
              break;
            default:
          }
        }
      }
      for (let key in row) {
        if (config[key].editable) {
          respond += "<td class='tdeditable'>" + row[key] + '</td>';
        } else {
          respond += '<td>' + row[key] + '</td>';
        }
      }
      respond += '</tr>';
    }
    respond += '</tbody>';
    respond += '</table>';

    const d = document.createElement('div');
    d.innerHTML = respond.trim();
    const t = d.firstChild;
    document.body.append(t);

    // make things editable by double click on them
    $('.tdeditable').dblclick(function () {
      var OriginalContent = $(this).text();
      $(this).addClass('cellEditing');
      $(this).html('<input type="text" value="' + OriginalContent + '" />');
      $(this).children().first().focus();
      $(this)
        .children()
        .first()
        .keypress(function (e) {
          if (e.which == 13) {
            var newContent = $(this).val();
            // console.log($(this).parent()[0]);
            const rowId = $(this).parent().parent().find('td:eq(0)')[0].innerHTML;
            // Please don't judge me to hard for this f*cking mess. Future me is already..
            // (My eye hurts //Future Angr)
            // let columnName = Object.keys(config)[$(this).parent()[0]._DT_CellIndex.column];
            const cellIndex = this.parentNode.cellIndex;
            let columnName = this.parentNode.parentNode.parentElement.parentElement.rows[0].cells[cellIndex].innerHTML;
            const configKeys = Object.keys(config);
            // If label is set we need to get the keyname
            for (let i = 0; i < configKeys.length; i++) {
              if (config[configKeys[i]].label && config[configKeys[i]].label === columnName) {
                columnName = configKeys[i];
                break;
              }
            }

            // If no validation is set accept anything
            let regex = /./;
            let pattern;
            if (config[columnName].validation) {
              const flags = config[columnName].validation.replace(/.*\/([gimy]*)$/, '$1');
              pattern = config[columnName].validation.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
              regex = new RegExp(pattern, flags);
            }

            if (regex.test(newContent) !== true) {
              alert(newContent + ' did not match regex ' + pattern);
              $(this).parent().text(OriginalContent);
            } else {
              const content = $(this).parent();
              patchData(
                rowId,
                { valueToChange: columnName, newValue: newContent },
                function () {
                  content.text(newContent);
                },
                function () {
                  $(this).parent().removeClass('cellEditing');
                }
              );
            }
            // console.log($(this).parent()[0].parent()[0].find("td:eq(0)").innerHTML);
          }
        });
      $(this)
        .children()
        .first()
        .blur(function () {
          $(this).parent().text(OriginalContent);
          $(this).parent().removeClass('cellEditing');
        });
    });

    const ta = $('#list').dataTable({ paging: false });

    // Datatabels adds a few layers that need to be included with the table.
    respond = ta.parent().parent().parent();
  } else {
    respond += 'Cant load List';
  }
  return respond;
}

function listUpdate() {
  // Now add configured columns that don't exist in the resultset.
  for (const key of Object.keys(tableConfig)) {
    tableConfig[key].label = tableConfig[key].label === undefined ? key : tableConfig[key].label;
  }

  function runAfterFunc() {
    $('#tableContainer').empty();
    const respond = createTable(window.adminLTE.list, tableConfig);
    $('#tableContainer').append(respond);
  }

  getData('list', 'list', runAfterFunc);
}

function del(id) {
  $('#waitSpinner').modal();
  $.ajax({
    url: id,
    type: 'DELETE',
    dataType: 'json',
    data: {},
  })
    .done((data) => {
      listUpdate();
    })
    .fail((err) => {
      alert('Fail to delete ' + err.message);
    })
    .always(() => {
      $('#waitSpinner').modal('hide');
    });
}

function addSave(label) {
  const addData = {};
  // Chech all regexp validations and abort of any of them fail.
  for (const key of Object.keys(tableConfig)) {
    if (tableConfig[key].addNew && tableConfig[key].validation) {
      var flags = tableConfig[key].validation.replace(/.*\/([gimy]*)$/, '$1');
      var pattern = tableConfig[key].validation.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
      var regex = new RegExp(pattern, flags);
      if (regex.test($('#' + label + '-' + key)[0].value) !== true) {
        alert(key + ' ' + 'must patch regex ' + pattern);
        return false;
      }
    }
    if (tableConfig[key].addNew) {
      addData[key] = $('#' + label + '-' + key)[0].value;
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
  let closeAllButtonObj = createPopupInput(label, tableConfig, okButton);
  $(closeAllButtonObj).appendTo($('.content-wrapper')[0]).modal();
}

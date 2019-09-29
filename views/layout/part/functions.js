function createPopupInput(label, config, okButtonConfig) {
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

  for (let key of Object.keys(config)) {
    if (config[key].addNew) {
      result += '<div class="md-form mb-5">';
      if (config[key].icon) {
        result += '<i class="fa ' + config[key].icon + ' prefix grey-text"></i>';
      }
      result += '<label data-error="wrong" data-success="right" for="' + label + '-' + key + '">' + config[key].label + '</label>';
      result += '<input type="' + key + '" id="' + label + '-' + key + '" class="form-control validate">';
      result += '</div>';
    }
  }

  result += '</div>';
  result += '<div class="modal-footer d-flex justify-content-center">';
  result += '<button class="btn btn-primary" onclick="' + okButtonConfig.function + ';">' + okButtonConfig.label + '</button>';
  result += '<button class="btn btn-danger" data-toggle="modal" data-target="#' + label + 'Form">Cancel</button>';
  result += '</div>';
  result += '</div>';
  result += '</div>';
  result += '</div>';
  return result;
  // $(result).appendTo($('.content-wrapper')[0]);
}

function uiMSelCreate(selected, allObjects, api) {
  //Create object with all available objects
  let objectList = {};
  for (let val in allObjects) {
    objectList[allObjects[val].name] = false;
  }
  for (let val of selected) {
    objectList[val] = true;
  }
  let returnString = '';
  returnString += '<div>';
  returnString += '<ul class="mSelOptions">';
  for (let key of Object.keys(objectList)) {
    if (objectList[key]) {
      returnString += '<li onClick="uiMSelCreateDel(this,\'' + api + '\');"><input type="hidden" name="aChoice" value="' + key + '">' + key + '</li>';
    }
  }
  returnString += '</ul>';
  returnString += '<select size="1" onchange="uiMSelCreateAdd(this,\'' + api + '\');">';
  returnString += '<option value="">Select something to add</option>';
  for (let key of Object.keys(objectList)) {
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
  let rowId = select.parentElement.parentElement.parentNode.firstElementChild.innerText;

  //alert(e.srcElement[1].innerText);
  // get what option is selected.
  let option = select.options[select.selectedIndex];
  console.log(select);
  let valueToChange = option.value;
  //console.log(select.selectedIndex);

  let ul = select.parentNode.getElementsByTagName('ul')[0];
  // get the values of all selected objects
  let choices = ul.getElementsByTagName('input');
  //Make sure we dont include something already included.
  for (let choice of choices) {
    if (choice.value === option.value) return;
  }
  // Create the elements that will make upp a selected object.
  let li = document.createElement('li');
  let input = document.createElement('input');
  console.log(option);
  let text = document.createTextNode(option.firstChild.data);

  input.type = 'hidden';
  input.name = 'aChoice';
  input.value = option.value;

  li.appendChild(input);
  li.appendChild(text);
  li.setAttribute('onclick', 'uiMSelCreateDel(this);');

  ul.appendChild(li);

  select.options.remove(select.selectedIndex);

  $.ajax({
    url: api + '/' + rowId,
    type: 'PATCH',
    data: {
      valueToChange: valueToChange,
      newValue: true
    }
  })
    .done(data => {})
    .fail(err => {
      alert('Fail to set ' + valueToChange + ': ' + 'true');
    })
    .always(() => {});
}
function uiMSelCreateDel(select, api) {
  let rowId = select.parentElement.parentElement.parentElement.parentNode.firstElementChild.innerText;
  //alert(elem.parentElement.firstElementChild.textContent);
  let value = select.getElementsByTagName('input')[0].value;
  let valueToChange = value;
  let text = select.childNodes[1].data;
  let opt = document.createElement('option');
  opt.value = value;
  opt.text = text;
  //select.parentNode.parentnode.getElementsByTagName('select').options.add(opt);
  select.parentNode.parentNode.childNodes[1].options.add(opt);
  console.log(select);
  select.parentNode.removeChild(select);
  $.ajax({
    url: api + '/' + rowId,
    type: 'PATCH',
    data: {
      valueToChange: valueToChange,
      newValue: false
    }
  })
    .done(data => {})
    .fail(err => {
      alert('Fail to set ' + valueToChange + ': ' + 'false');
    })
    .always(() => {});
}

function uiBtnCreate(label, functionString, type) {
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
  let returnString = '<button class="btn btn-' + type + ' btn-rounded mb-4" onClick="' + functionString + '">' + label + '</button>';
  return returnString;
}

function createTable(data, config) {
  let columns = 0,
    editable = [],
    respond = '';
  if (data.length > 0) {
    respond += '<table class="table table-bordered" id="list">';
    respond += '<thead><tr>';
    // For each resultset...
    for (let i = 0; i < Object.keys(data[0]).length; i++) {
      //If there was no configuration for this column create one
      config[Object.keys(data[0])[i]] = config[Object.keys(data[0])[i]] === undefined ? {} : config[Object.keys(data[0])[i]];
      //save the column number
      config[Object.keys(data[0])[i]].column = i;
      columns = i;
      //If no label is defined, use the column name as label
      config[Object.keys(data[0])[i]].label = config[Object.keys(data[0])[i]].label === undefined ? Object.keys(data[0])[i] : config[Object.keys(data[0])[i]].label;

      respond += '<th>' + config[Object.keys(data[0])[i]].label + '</th>';
    }
    // Now add configured columns that don't exist in the resultset.
    for (let key of Object.keys(config)) {
      if (config[key].column === undefined || config[key].extra) {
        if (config[key].column === undefined) {
          config[key].column = ++columns;
          config[key].extra = true;
        }
        //If no label is defined, use the column name as label
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
          //Just make sure the space key get some value.
          row[key] = row[key] ? row[key] : '';

          function addArguments(string, row) {
            let replaceables;
            let returnString = string;
            if ((replaceables = returnString.match(/\{(\w*)\}/))) {
              for (let arg of replaceables) {
                returnString = returnString.replace('{' + arg + '}', row[arg]);
              }
            }
            return returnString;
          }

          let row_variables = {};
          if (config[key].function) {
            row_variables.function = addArguments(config[key].function, row);
          }
          if (config[key].content) {
            row_variables.content = addArguments(config[key].content, row);
          }

          let contentArray = [];
          switch (true) {
            case /^button\(.*\)/.test(row_variables.content):
              contentArray = row_variables.content.match(/\w+\((.*)\)/)[1].split(',');
              row[key] = uiBtnCreate(contentArray[0], row_variables.function, contentArray[1]);
              break;
            case /^multiselect\(.*\)/.test(row_variables.content):
              contentArray = row_variables.content.match(/^multiselect\(\[(.*)\]/)[1].split(',');
              row[key] = uiMSelCreate(contentArray, window.adminLTE.allAccess, config[key].api);
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

    d = document.createElement('div');
    d.innerHTML = respond.trim();
    t = d.firstChild;
    document.body.append(t);

    // make things editable by double click on them
    $('.tdeditable').dblclick(function() {
      var OriginalContent = $(this).text();
      $(this).addClass('cellEditing');
      $(this).html('<input type="text" value="' + OriginalContent + '" />');
      $(this)
        .children()
        .first()
        .focus();
      $(this)
        .children()
        .first()
        .keypress(function(e) {
          if (e.which == 13) {
            var newContent = $(this).val();
            // console.log($(this).parent()[0]);
            let rowId = $(this)
              .parent()
              .parent()
              .find('td:eq(0)')[0].innerHTML;
            let columnName = Object.keys(config)[$(this).parent()[0]._DT_CellIndex.column];

            let flags = config[columnName].validation.replace(/.*\/([gimy]*)$/, '$1');
            let pattern = config[columnName].validation.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
            let regex = new RegExp(pattern, flags);

            if (regex.test(newContent) !== true) {
              alert(newContent + ' did not match regex ' + pattern);
              $(this)
                .parent()
                .text(OriginalContent);
            } else {
              let content = $(this).parent();
              $.ajax({
                url: rowId,
                type: 'PATCH',
                data: {
                  valueToChange: columnName,
                  newValue: newContent
                }
              })
                .done(data => {
                  content.text(newContent);
                })
                .fail(err => {
                  alert('Fail to change ' + columnName + ': ' + OriginalContent + ' into ' + newContent);
                  content.text(OriginalContent);
                })
                .always(() => {
                  $(this)
                    .parent()
                    .removeClass('cellEditing');
                });
            }
            //console.log($(this).parent()[0].parent()[0].find("td:eq(0)").innerHTML);
          }
        });
      $(this)
        .children()
        .first()
        .blur(function() {
          $(this)
            .parent()
            .text(OriginalContent);
          $(this)
            .parent()
            .removeClass('cellEditing');
        });
    });

    ta = $('#list')
      .dataTable
      //  { paging: false }
      ();

    //Datatabels adds a few layers that need to be included with the table.
    respond = ta
      .parent()
      .parent()
      .parent();
  } else {
    respond += 'Cant load List';
  }
  return respond;
}

function listUpdate() {
  $.ajax({
    url: 'list',
    type: 'GET',
    dataType: 'json'
  })
    .done(dataObj => {
      //Clear the container if there is anything there
      $('#tableContainer').empty();

      respond = createTable(dataObj, tableConfig);
      $('#tableContainer').append(respond);
    })
    .fail(err => {
      alert('Fail to delete ' + err.message);
    });
}

function del(id) {
  $('#waitSpinner').modal();
  $.ajax({
    url: id,
    type: 'DELETE',
    dataType: 'json',
    data: {}
  })
    .done(data => {
      listUpdate();
    })
    .fail(err => {
      alert('Fail to delete ' + err.message);
    })
    .always(() => {
      $('#waitSpinner').modal('hide');
    });
}

function addSave(label) {
  let addData = {};
  // Chech all regexp validations and abort of any of them fail.
  for (let key of Object.keys(tableConfig)) {
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

  $('#waitSpinner').modal();
  $.ajax({
    url: '',
    type: 'POST',
    data: addData
  })
    .done(data => {
      listUpdate();
    })
    .fail(err => {
      alert('Fail to add ' + err.message);
    })
    .always(() => {
      $('#waitSpinner').modal('hide');
    });
}

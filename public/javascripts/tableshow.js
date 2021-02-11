class Atable {
  constructor(config) {
    this.config_org = config; // {tableconfig: {}, initurl: string}
    this.config = this.config_org;
    this.htmlTable = document.createElement('table');
    this.htmlThead = document.createElement('thead');
    this.htmlTbody = document.createElement('tbody');
  }
  ajaxDataGet(url) {}

  uiCBCreateChange(checkbox, uncheckedValue, checkedValue, api) {
    let rowId = checkbox.parentElement.parentNode.firstElementChild.innerText;
    //  let columnName = Object.keys(tableConfig)[$(checkbox).parent()[0]._DT_CellIndex.column];
    let cellIndex = this.parentNode.cellIndex;
    let columnName = this.parentNode.parentNode.parentElement.parentElement.rows[0].cells[cellIndex].innerHTML;
    let url = api ? api + '/' + rowId : rowId;
    let valueToChange = columnName;
    let newValue = checkbox.checked ? checkedValue : uncheckedValue;

    $.ajax({
      url: url,
      type: 'PATCH',
      data: {
        valueToChange: valueToChange,
        newValue: newValue,
      },
    })
      .done((data) => {})
      .fail((err) => {
        alert('Fail to set ' + valueToChange + ': ' + 'true');
      })
      .always(() => {});
  }

  uiCBCreate(setValue, uncheckedValue, checkedValue, api) {
    api = api ? api : '';
    let returnString = '';
    if (setValue == checkedValue) {
      returnString += '<input type="checkbox" onChange="uiCBCreateChange(this,\'' + uncheckedValue + "','" + checkedValue + "' ,'" + api + '\');" checked>';
    } else {
      returnString += '<input type="checkbox" onChange="uiCBCreateChange(this,\'' + uncheckedValue + "','" + checkedValue + "' ,'" + api + '\');" >';
    }
    return returnString;
  }

  tableDraw(data) {
    this.data = data;
    let columns = 0,
      editable = [],
      respond = '';
    //If data is empty or undefined
    if (data || !data.length) {
      respond += 'Cant load List';
      return respond;
    }
    // Start table
    respond += '<table class="table table-bordered" id="list">';
    // Create header for table
    respond += '<thead><tr>';
    let dataKeys = Object.keys(data[0]);
    // For each key...
    for (let i = 0; i < dataKeys.length; i++) {
      let confKey = dataKeys[i];
      //If there was no configuration for this column create one
      this.config[confKey] = this.config[confKey] === undefined ? {} : this.config[confKey];
      //save the column number
      this.config[confKey].column = i;
      columns = i;
      //If no label is defined, use the column name as label
      this.config[confKey].label = this.config[confKey].label === undefined ? confKey : this.config[confKey].label;

      respond += '<th>' + this.config[confKey].label + '</th>';
    }
    // Now add configured columns that don't exist in the resultset.
    for (let key of Object.keys(this.config)) {
      if (this.config[key].column === undefined) {
        this.config[key].column = ++columns;
        this.config[key].extra = true;
        //If no label is defined, use the column name as label
        this.config[key].label = this.config[key].label === undefined ? key : this.config[key].label;

        respond += '<th>' + this.config[key].label + '</th>';
      }
    }

    for (let key of Object.keys(this.config)) {
      if (this.config[key].editable) {
        editable.push(this.config[key].column);
      }
    }
    respond += '</tr></thead>';

    respond += '<tbody>';
    for (let row of data) {
      respond += '<tr>';
      for (let key of Object.keys(this.config)) {
        //If not a string or number change to empty. (To Origin)
        if (typeof row[key] !== 'number' && typeof row[key] !== 'string') {
          row[key] = '';
        }

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
        if (this.config[key].function) {
          row_variables.function = addArguments(this.config[key].function, row);
        }
        if (this.config[key].content) {
          row_variables.content = addArguments(this.config[key].content, row);
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
          case /^singleselect\(.*\)/.test(row_variables.content):
            contentArray = row_variables.content.match(/^singleselect\((.*)\)/)[1].split(',');
            //uiSSelCreate(selected, url to get options, url to update)
            row[key] = uiSSelCreate(contentArray[0], contentArray[1], contentArray[2]);
            break;
          case /^singleselect2\(.*\)/.test(row_variables.content):
            contentArray = row_variables.content.match(/^singleselect2\((.*)\)/)[1].split(',');
            // optionsVar = array of object containing the options.
            // saveCol = value int the object containing the value to be saved;
            // showCol = value in the object containing the value to show;
            // apiSave = what api to call to save
            //// uisSel2Create(orgValue, optionsVar, saveCol, showCol, apiSave);
            row[key] = uisSel2Create(row[key], ...contentArray);
            break;
          case /^checkbox\(.*\)/.test(row_variables.content):
            contentArray = row_variables.content.match(/^checkbox\((.*)\)/)[1].split(',');
            //uiSSelCreate(selected, url to get options, url to update)
            row[key] = this.uiCBCreate(contentArray[0], contentArray[1], contentArray[2]);
            break;
          case /^upload\(.*\)/.test(row_variables.content):
            contentArray = row_variables.content.match(/^upload\((.*)\)/)[1].split(',');
            row[key] = uiFUCreate(contentArray[0], contentArray[1], contentArray[2], contentArray[3]);
            break;
          default:
        }
      }
      for (let key in row) {
        if (this.config[key].editable) {
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
            let rowId = $(this).parent().parent().find('td:eq(0)')[0].innerHTML;
            // Please don't judge me to hard for this f*cking mess. Future me is already..
            // (My eye hurts //Future Angr)
            // let columnName = Object.keys(config)[$(this).parent()[0]._DT_CellIndex.column];
            let cellIndex = this.parentNode.cellIndex;
            let columnName = this.parentNode.parentNode.parentElement.parentElement.rows[0].cells[cellIndex].innerHTML;
            let configKeys = Object.keys(config);
            // If label is set we need to get the keyname
            for (let i = 0; i < configKeys.length; i++) {
              if (config[configKeys[i]].label && config[configKeys[i]].label === columnName) {
                columnName = configKeys[i];
                break;
              }
            }
            let flags = config[columnName].validation.replace(/.*\/([gimy]*)$/, '$1');
            let pattern = config[columnName].validation.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
            let regex = new RegExp(pattern, flags);

            if (regex.test(newContent) !== true) {
              alert(newContent + ' did not match regex ' + pattern);
              $(this).parent().text(OriginalContent);
            } else {
              let content = $(this).parent();
              $.ajax({
                url: rowId,
                type: 'PATCH',
                data: {
                  valueToChange: columnName,
                  newValue: newContent,
                },
              })
                .done((data) => {
                  content.text(newContent);
                })
                .fail((err) => {
                  alert('Fail to change ' + columnName + ': ' + OriginalContent + ' into ' + newContent);
                  content.text(OriginalContent);
                })
                .always(() => {
                  $(this).parent().removeClass('cellEditing');
                });
            }
            //console.log($(this).parent()[0].parent()[0].find("td:eq(0)").innerHTML);
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

    ta = $('#list').dataTable({ paging: false });

    //Datatabels adds a few layers that need to be included with the table.
    respond = ta.parent().parent().parent();
    return respond;
  }
}

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function doNothing() {}

function getData(url, addTo, runAfter) {
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
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(new Error('Page ' + response.url + ' returned status ' + response.status + ' ' + response.statusText));
      }
    })
    .then((data) => {
      if (!window.adminLTE) window.adminLTE = {};
      if (addTo !== '' && addTo !== undefined && addTo !== null) {
        if (!window.adminLTE[addTo] && !Array.isArray(window.adminLTE[addTo])) window.adminLTE[addTo] = [];
        window.adminLTE[addTo] = window.adminLTE[addTo].concat(data);
      }
    })
    .catch((err) => {
      console.log(err.toString());
      alert(err.toString());
      window.adminLTE[addTo] = [];
    })
    .finally(() => {
      if (typeof runAfter === 'function') runAfter();
    });
}

function postData(url, postData, success, runAfter) {
  $('#waitSpinner').modal();
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
      $('#waitSpinner').modal('hide');
      runAfter();
    });
}

function patchData(url, patchData, success, runAfter) {
  $('#waitSpinner').modal();
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
      $('#waitSpinner').modal('hide');
      runAfter();
    });
}

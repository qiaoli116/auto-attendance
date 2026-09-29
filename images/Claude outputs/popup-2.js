// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// Chrome has a known quirk (especially on Windows) where a freshly
// opened extension popup only *focuses* the browser window on the
// first click, without actually delivering that click to whatever
// element is under the cursor - so buttons appear to need two clicks:
// one to focus the popup, one to register. Explicitly focusing the
// popup window as soon as it loads works around this, so the very
// first click on a button is the one that fires it.
window.focus();

// Initialize button with users' preferred color
// const changeColor = document.getElementById('changeColor');
let uiEnhancement = document.getElementById('uiEnhancement');
let storeCRNsBtn = document.getElementById('storeCRNs');
let autoFillBtn = document.getElementById('autoFill');
let storeDataBtn = document.getElementById('storeData');
let fillDataBtn = document.getElementById('fillData');
let clearDataBtn = document.getElementById('clearData');
let displayDataBtn = document.getElementById('displayData');

let resulting_storeDataBtn = document.getElementById('resulting-storeData');
let resulting_fillDataBtn = document.getElementById('resulting-fillData');
let resulting_clearDataBtn = document.getElementById('resulting-clearData');
let resulting_displayDataBtn = document.getElementById('resulting-displayData');

let scripting_createStudentFoldersBtn = document.getElementById('scripting-createStudentFolders');
let scripting_csvResulting = document.getElementById('scripting-csv-resulting');
let scripting_csvNetlab = document.getElementById('scripting-csv-netlab');
let scripting_gradeFormula = document.getElementById('scripting-insert-formular');


uiEnhancement.onclick = action;
storeCRNsBtn.onclick = action;
autoFillBtn.onclick = action;
storeDataBtn.onclick = action;
fillDataBtn.onclick = action;
clearDataBtn.onclick = action;
displayDataBtn.onclick = action;

resulting_storeDataBtn.onclick = action;
resulting_fillDataBtn.onclick = action;
resulting_clearDataBtn.onclick = action;
resulting_displayDataBtn.onclick = action;

scripting_createStudentFoldersBtn.onclick = action;
scripting_csvResulting.onclick = action;
scripting_csvNetlab.onclick = action;
scripting_gradeFormula.onclick = action;

// Clicking the version number shows the changelog - like every other
// button, this runs through the normal action()/content-script flow so
// the popup renders in the actual page (the main browser window),
// not in this small extension menu.
let showChangelogBtn = document.getElementById('showChangelog');
if (showChangelogBtn) {
  showChangelogBtn.onclick = action;
} else {
  console.error("showChangelog button not found - is popup.html out of date?");
}


function action(element) {
  // use currentTarget (the .btn div the click handler is bound to),
  // not target - the version button has a nested <i> that has no id
  // of its own, so a click landing on that inner element made
  // element.target.id come back empty and silently sent nothing.
  let clickedId = element.currentTarget.id;
  console.log("new plugin " + clickedId);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Use the Scripting API to execute a script
    chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['jszip.min.js', 'jquery-3.4.1.min.js', 'FileSaver.min.js', 'contentScript.js']
      },
      () => {
        // Send the ID to contentScript.js
        console.log("sendMessage: new plugin " + clickedId);
        chrome.tabs.sendMessage(tabs[0].id, { clickedId: clickedId });
      });


});
  //window.close();
}

// changeColorButton.addEventListener('click', (event) => {
//   const color = event.target.value;

//   // Query the active tab before injecting the content script
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     // Use the Scripting API to execute a script
//     chrome.scripting.executeScript({
//       target: { tabId: tabs[0].id },
//       args: [color],
//       func: setColor
//     });
//   });
// });

// const changeColorButton = document.getElementById('changeColor');

// // Retrieve the color from storage and update the button's style and value
// chrome.storage.sync.get('color', ({ color }) => {
//   changeColorButton.style.backgroundColor = color;
//   changeColorButton.setAttribute('value', color);
// });

// changeColorButton.addEventListener('click', (event) => {
//   const color = event.target.value;

//   // Query the active tab before injecting the content script
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     // Use the Scripting API to execute a script
//     chrome.scripting.executeScript({
//       target: { tabId: tabs[0].id },
//       args: [color],
//       func: setColor
//     });
//   });
// });

// function setColor(color) {
//   // There's a typo in the line below;
//   // ❌ colors should be ✅ color.
//   document.body.style.backgroundColor = color;
// }
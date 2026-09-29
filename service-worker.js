// Copyright 2018 Google LLC
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

// There's a typo in the line below;
// ❌ oninstalled should be ✅ onInstalled.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color: '#3aa757' }, () => {
    console.log('The background color is green.');
  });
});

// Auto-run "Store CRN's" as soon as the Select CRN page finishes
// loading, instead of requiring a manual popup click. Matches the same
// script injection + message send that popup.js does for a button click.
//
// Banner renders this app inside framesets, so submitting the term
// selection navigates an inner frame rather than the top-level tab -
// chrome.tabs.onUpdated (tab-level only) never sees that. webNavigation
// reports every frame's navigation, so we use that instead and inject
// straight into the specific frame that matched.
const CRN_PAGE_URL_PATTERN = /^https:\/\/my\.holmesglen\.edu\.au\/PROD\/bwkkspgr\.showpage\?page=SC_ATTR_SELECTCRN/;

chrome.webNavigation.onCompleted.addListener(
  (details) => {
    console.log('Auto Store CRNs: webNavigation onCompleted', details);
    if (!CRN_PAGE_URL_PATTERN.test(details.url)) {
      console.log('Auto Store CRNs: url did not match pattern', details.url);
      return;
    }

    console.log(`Auto Store CRNs: url matched (frameId ${details.frameId}), injecting scripts`);
    chrome.scripting.executeScript({
      target: { tabId: details.tabId, frameIds: [details.frameId] },
      files: ['jszip.min.js', 'jquery-3.4.1.min.js', 'FileSaver.min.js', 'contentScript.js']
    }, () => {
      if (chrome.runtime.lastError) {
        console.log('Auto Store CRNs: injection failed', chrome.runtime.lastError.message);
        return;
      }
      console.log('Auto Store CRNs: injection succeeded, sending message');
      chrome.tabs.sendMessage(details.tabId, { clickedId: 'storeCRNs' }, { frameId: details.frameId }, () => {
        if (chrome.runtime.lastError) {
          console.log('Auto Store CRNs: sendMessage failed', chrome.runtime.lastError.message);
        } else {
          console.log('Auto Store CRNs: message sent successfully');
        }
      });
    });
  },
  { url: [{ hostEquals: 'my.holmesglen.edu.au' }] }
);

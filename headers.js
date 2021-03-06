/*
This script reads through all requests. For each request it runs a promise chain that first
queries chrome to find the open browser window, then passes this to a formatURL function that
regexes through the request to identify whether it contains bids and form the output that this 
passes to the popup window. 

The output should be:
  timestamp, url, ad sizes and bid prices for all prebid bids

TODO
- find an easy way to avoid running this whole promise chain for requests without bids 
- find a simpler way of doing this in general. I'm brand new to writing async code
*/

var starttime = Date.now().toString();
var tabId = parseInt(window.location.search.substring(1));
var filters = { urls: ["<all_urls>"], tabId: tabId };
var json_data = JSON.parse('{"pageview": []}');

// not workig yet. todo: pass data to this before appending to container. make accessible from popup's html link.
var obj = {a: 123, b: "4 5 6"};
var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));

function addListeners() {
    chrome.webRequest.onBeforeRequest.addListener(handleEvent, filters, ['requestBody']);
}

function removeListeners() {
    chrome.webRequest.onBeforeRequest.removeListener(handleEvent);
}

function myFunction(tablink) {
  return tablink;
}

function getCurrentURL(callback, postData, addressDiv){ //Take a callback
    var theTab;
    var queryInfo = {
        active: true,
        lastFocusedWindow: true
      };
    return new Promise(function(resolve, reject) {
      chrome.tabs.query(queryInfo,function(tab){
          theTab = callback(tab); //call the callback with argument
          resolve([theTab, postData, addressDiv]);
        });
    });
}

function _displayTab(tab){
    if(tab[0].url){
      var my_url = tab[0].url;
      return my_url;
    }
}

function displayOutput(addressDiv, formatted_output, json_text, json_data){ //define your callback function
  $('<div>').addClass("url").text(formatted_output).appendTo(addressDiv);
  // add to a json object
  json_data = json_data['pageview'].push(json_text)
}

function formatURL(postData, my_url, addressDiv) {
    var bids = postData.match(/hb_pb_.*?%3D(\d*\.?\d+)/g);
    if(bids){
      var price_text = bids.map(function(e) { 
        e = e.replace('%3D', ' price: '); 
        e = e.replace('hb_pb_', '');
        e = e.toString();
        return e;
      });

    price_text = price_text.toString();

    var sizes = postData.match(/hb_size_.*?%3D(\d*x?\d+)/g);
    if(sizes){
      var size_text = sizes.map(function(e) { 
        e = e.replace('%3D', ' creative size: '); 
        e = e.replace('hb_size_', '');
        e = e.toString();
        return e;
      });
    size_text = size_text.toString();
    }
    return new Promise(function(resolve, reject){
      if(price_text && size_text){
        text = size_text + "," + price_text;
        text = text.replace(',', ', ');
      }
      else if (price_text){
        text = price_text;
        text = text.replace(',', ', ');
      }
      my_url = my_url.replace(':','');
      json_text = "{_ts:" + Date.now().toString() + "," + "url:" + my_url + "," + text + '}';
      json_text = json_text.replace(/([.\/\-a\.-zA-Z 0-9-]+):([.\/\-?&_=\+a-zA-Z 0-9-a-zA-Z0-9-]+)/g, "\"$1\":\"$2\"");
      json_text = json_text.replace(/( )/g, '');
      json_text = JSON.parse(json_text);
      text = "url: " + my_url + "," + text;
      resolve([text, addressDiv, json_text]);
    })
  }
}

function async_formatURL(postData, addressDiv) {
  // make this promise chain a promise itself, so I can wait until it's complete to write the result
  return new Promise(function(resolve, reject){ 
    var result = getCurrentURL(_displayTab, postData, addressDiv).then(function(result){
      return formatURL(result[1], result[0], result[2]);
    }).then(function(result){
      return result;
    });
    resolve(result);
  });
}

function handleEvent(details) {
    var addressDiv = $('div.address[id="req-' + details.requestId + '"]');
    if (addressDiv.length === 0) {
      // avoid running through all this if no bids in request
      var bids = details.url.match(/hb_pb_.*?%3D(\d*\.?\d+)/g);
      if (bids) {
        addressDiv = $('<div>').addClass("address").attr("id", "req-" + details.requestId);
        $("#container").append(addressDiv);
        if(details.url){        
          async_formatURL(details.url, addressDiv).then(function(result){
            if(result){
              displayOutput(result[1], result[0], result[2], json_data);
            }
          });
        }
      }
    }
}

$(function() {
    addListeners();
    $('button#download').click(downloadData);
});

function downloadData() {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(json_data)));
  var filename = 'bids' + starttime + '_' + Date.now().toString() + '.json';
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}




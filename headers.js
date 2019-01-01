var tabId = parseInt(window.location.search.substring(1));
var filters = { urls: ["<all_urls>"], tabId: tabId };

function addListeners() {
    chrome.webRequest.onBeforeRequest.addListener(handleEvent, filters, ['requestBody']);
}

function removeListeners() {
    chrome.webRequest.onBeforeRequest.removeListener(handleEvent);
}

function myFunction(tablink) {
  // do stuff here
  console.log(tablink);
  return tablink;
}


function formatURL(postData) {
    var bids = postData.match(/hb_pb_.*?%3D(\d*\.?\d+)/g);
    if(bids){
      var price_text = bids.map(function(e) { 
        e = e.replace('%3D', ' price: '); 
        e = e.replace('hb_pb_', '');
        e = e.toString();
        return e;
      });
    price_text = price_text.toString();
    }
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
    /*// get the current page's url (currently either undefined or the popup url, not working as intended)
    var current_url = chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
   function(tabs){
      console.log(tabs[0].url);
      return tabs[0].url;
   }
  );*/
    if(price_text && size_text){
      text = Date.now().toString() + ", " + size_text + "," + price_text;
      text = text.replace(',', ', ');
      return text;
    }
    else if (price_text){
      text = Date.now().toString() + "," + price_text;
      text = text.replace(',', ', ');
      return text;  
    }
    else if (size_text){
      text = Date.now().toString() + ", " + size_text;
      text = text.replace(',', ', ');
      return text;  
    }
}

function handleEvent(details) {
    var addressDiv = $('div.address[id="req-' + details.requestId + '"]');
    if (addressDiv.length === 0) {
        addressDiv = $('<div>').addClass("address").attr("id", "req-" + details.requestId);
        $("#container").append(addressDiv);
        var formatted_url = formatURL(details.url);
        if(formatted_url){
          $('<div>').addClass("url").text(formatted_url).appendTo(addressDiv);
        }
    }
}

$(function() {
    addListeners();
});


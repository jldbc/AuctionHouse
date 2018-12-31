//disclaimer: I don't know javascript and am figuring this out as I go

var tabId = parseInt(window.location.search.substring(1));

window.addEventListener("load", function() {
  chrome.debugger.sendCommand({tabId:tabId}, "Network.enable");
  chrome.debugger.onEvent.addListener(onEvent);
});

window.addEventListener("unload", function() {
  chrome.debugger.detach({tabId:tabId});
});

var requests = {};

//get browser's url to keep log of where the bids are taking place
//function getUrl() {
//      chrome.tabs.query({'active': true, 'currentWindow': true}, function (tabs) {
//      var url = tabs[0].url;
//      console.log(url);
//  });
//}

// todo: can I get the ad size?

function onEvent(debuggeeId, message, params) {
  if (tabId != debuggeeId.tabId)
    return;

  if (message == "Network.requestWillBeSent") {
    var requestDiv = requests[params.requestId];
    if (!requestDiv) {
      var requestDiv = document.createElement("div");
      requestDiv.className = "request";
      requests[params.requestId] = requestDiv;
      var urlLine = document.createElement("div");
      urlLine.textContent = params.request.url;
      var bids = urlLine.textContent.match(/hb_pb_.*?%3D(\d*\.?\d+)/g);
      if(bids){
        var output = bids.map(function(e) { 
          e = e.replace('%3D', ': '); 
          e = e.replace('hb_pb_', '');
          return e;
        });
        requestDiv.append(output);
        document.getElementById("container").appendChild(requestDiv);
      }
    }
    var requestLine = document.createElement("div");
  }
}
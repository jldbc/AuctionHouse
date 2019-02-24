# AuctionHouse
Monitor and download the prices advertisers are paying for the display ads in your browser.

<img src="/images/auctionhouse.png" alt>

# Data This Collects

This extension collects the following data in real time:

* Unix timestamp
* URL of the site the ad is being placed on
* Bidder name (name of the ad exchange placing the bid)
* Bid price (in CPM)
* Creative Size (dimensions of the ad that each bid is being placed for)

The data can be exported in JSON format via the extension's popup window.

# Which Sites Does This Work On?

This extension works by collecting requests being used in [Prebid](https://prebid.org/) header bidding auctions. This works because Prebid is a client-side auction that takes place in your browser, as opposed to other realtime bidding solutions which happen server-side. For this reason, the extension will only collect bid prices on sites using Prebid. An incomplete list of such sites includes: Vox, BuzzFeed, Wall Street Journal, CNN, ESPN, and USA Today.

# Privacy

This extension needs access to the url of the tab you currently have open and to all requests happening in your session in order to collect this information. This information stays 100% on your device. You are the only one able to see and download this data.

# Known Issues

This extension currently does not handle switching tabs gracefully. If you change tabs it doesn't always continue to notice ads being placed on the new tab. Also, if you click into the extension's popup window, the "url" field will show the chrome extension's url rather than your browser window's url. I recommend letting it run in the background while you browse and only clicking into the window once you're done in order to export the data.

# Contributing

I welcome pull requests that will make this better. I'm a javascript novice, so be patient with me.

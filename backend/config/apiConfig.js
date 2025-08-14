// Replace these with your RapidAPI credentials
module.exports = {
  AMAZON: {
    host: "real-time-amazon-data.p.rapidapi.com",
    key: "99a39eec38mshbb7ef497f2324c1p1a0060jsn30b6eda5ec38",
    // key: "6c6f4c0827mshb2e753838a7fba8p160ffcjsn6a48f5a0949b", // Limit over
  },
  FLIPKART: {
    host: "real-time-flipkart-data2.p.rapidapi.com",
    key: "6c6f4c0827mshb2e753838a7fba8p160ffcjsn6a48f5a0949b", // From https://rapidapi.com/letscrape-6bRBa3QguO5/api/flipkart-data-scraper
  },
  EBAY: {
    host: "ebay-search-result.p.rapidapi.com",
    key: "6c6f4c0827mshb2e753838a7fba8p160ffcjsn6a48f5a0949b", // From https://rapidapi.com/ajith/api/ebay-search
  },
  EBAY32: {
    host: "ebay32.p.rapidapi.com",
    key: "6c6f4c0827mshb2e753838a7fba8p160ffcjsn6a48f5a0949b", // From https://rapidapi.com/ajith/api/ebay-search
  },
  WALMART: {
    host: "realtime-walmart-data.p.rapidapi.com",
    key: "6c6f4c0827mshb2e753838a7fba8p160ffcjsn6a48f5a0949b",
  },
};

// curl --request GET
// 	--url https://ebay-search-result.p.rapidapi.com/search/iphone
// 	--header 'x-rapidapi-host: ebay-search-result.p.rapidapi.com'
// 	--header 'x-rapidapi-key: 6c6f4c0827mshb2e753838a7fba8p160ffcjsn6a48f5a0949b'

// Another Ebay

// curl --request GET
// --url 'https://ebay32.p.rapidapi.com/search/iphone?page=1&country=germany&country_code=de'
// --header 'x-rapidapi-host: ebay32.p.rapidapi.com'
// --header 'x-rapidapi-key: 6c6f4c0827mshb2e753838a7fba8p160ffcjsn6a48f5a0949b'

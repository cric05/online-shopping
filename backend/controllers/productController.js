const axios = require("axios");
const {
  AMAZON,
  FLIPKART,
  EBAY,
  WALMART,
  EBAY32,
} = require("../config/apiConfig");

// Fetch from all platforms
exports.comparePrices = async (req, res) => {
  console.log(`Received request for product: ${req.query.product}`); // Log the incoming request
  const query = await req?.query;
  const { product, page = 1 } = await req?.query;

  try {
    const [amazon, walmart, flipkart, ebay] = await Promise.all([
      fetchAmazon({ product, page }),
      fetchWalMartData({ product, page }),
      false ? fetchFlipkart(product) : null,
      fetchEbay({ product, page }),
    ]);

    res.json({ amazon, walmart, flipkart, ebay });
  } catch (error) {
    console.error("Error fetching data:", error?.message); // Log the actual error
    res.status(500).json({ error: error?.message });
  }
};

// API Fetch Functions (Replace with your actual endpoints)
const fetchAmazon = async (queryParams) => {
  try {
    const { product, page = 1 } = queryParams;
    const response = await axios.get(`https://${AMAZON.host}/search`, {
      params: { query: product, page: page, country: "IN" },
      headers: {
        "x-rapidapi-host": AMAZON?.host,
        "x-rapidapi-key": AMAZON.key,
      },
    });
    return await formattedResponse(response?.data, "Amazon");
  } catch (error) {
    console.log("catch fetchAmazon: ", error?.message);
  }
};

const fetchWalMartData = async (queryParams) => {
  try {
    const { product, page = 1 } = queryParams;
    const response = await axios.get(`https://${WALMART.host}/search`, {
      params: { keyword: product, page: page },
      headers: {
        "x-rapidapi-host": WALMART?.host,
        "x-rapidapi-key": AMAZON.key,
      },
    });
    return await formattedResponse(response?.data, "walmart");
  } catch (error) {
    console.log("catch fetchWalMartData: ", error?.message);
  }
};

const fetchFlipkart = async (query) => {
  const response = await axios.get(`https://${FLIPKART.host}/search`, {
    params: { query },
    headers: { "X-RapidAPI-Key": FLIPKART.key },
  });
  return response.data.products.slice(0, 5);
};

const fetchEbay = async (queryParams) => {
  try {
    const { product, page = 1 } = queryParams;
    const response = await axios.get(`https://${EBAY.host}/search/${product}`, {
      headers: { "x-rapidapi-host": EBAY?.host, "x-rapidapi-key": EBAY?.key },
    });

    // const response = await axios.get(`https://${EBAY32.host}/search/${product}`, {
    //   params: { page, country: "IN" },
    //   headers: { "x-rapidapi-host": EBAY32?.host, "x-rapidapi-key": EBAY32?.key },
    // });
    return await formattedResponse(response?.data, "eBay");
  } catch (error) {
    console.log("catch fetchEbay: ", error?.message);
  }
};

// Helper Functions
const extractAsin = (query) => {
  // Extract ASIN from Amazon URL or return query as-is
  return query.match(/[A-Z0-9]{10}/)?.[0] || query;
};

const formattedResponse = async (data, domain = "Amazon") => {
  const res = data?.data ?? data;
  const productArr = res?.products ?? res?.results;
  const product =
    productArr && Array.isArray(productArr) && productArr?.length > 0
      ? productArr
      : [];
  return {
    total_products: res?.total_products ?? res?.totalResults ?? product?.length,
    country: res?.country ?? "IN",
    domain: domain,
    products: await formatProductResponse({ products: product, domain }),
  };
};

const formatProductResponse = async (
  data = { products: [], domain: "Amazon" }
) => {
  const { products, domain } = data;
  return products?.map((p) => {
    return {
      id: p?.asin ?? p?.id,
      name: p?.product_title ?? p?.name ?? p?.title,
      price: p?.product_minimum_offer_price ?? p?.price,
      originalPrice: p?.product_original_price ?? p?.originalPrice ?? p?.price,
      rating: p?.rating,
      no_of_rating: p?.product_num_ratings ?? p?.numberOfReviews,
      image: p?.product_photo ?? p?.image,
      url: p?.product_url ?? p?.canonicalUrl ?? p?.url,
      delivery: p?.delivery || "N/A",
      source: domain,
      reviews: p?.numberOfReviews ?? 0,
      inStock: p?.availability ?? null,
    };
  });
};

const formatAmazonData = (data) => {
  return {
    title: data.product.title,
    price: data.product.price,
    original_price: data.product.original_price,
    image: data.product.image,
    rating: data.product.rating,
    url: data.product.url,
  };
};

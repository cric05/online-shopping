let currentPage = 1;
let isLoading = false;
let selectedStore = "all";

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultsContainer = document.getElementById("resultsContainer");
  const loadingIndicator = document.getElementById("loading");
  const suggestionText = document.getElementById("suggestionText");
  const sortSelect = document.getElementById("sortSelect");
  const storeBtns = document.querySelectorAll(".store-btn");

  const suggestions = [
    'Try: "wireless headphones", "smartphone", or "laptop"',
    'Try: "running shoes", "smartwatch", or "backpack"',
    'Try: "bluetooth speaker", "gaming mouse", or "monitor"',
  ];

  let currentSuggestion = 0;

  // Rotate suggestions every 5 seconds
  const rotateSuggestions = () => {
    suggestionText.textContent = suggestions[currentSuggestion];
    currentSuggestion = (currentSuggestion + 1) % suggestions.length;
  };
  rotateSuggestions();
  setInterval(rotateSuggestions, 5000);

  // Event Listeners
  searchBtn.addEventListener("click", () => performSearch(1));
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch(1);
  });

  sortSelect.addEventListener("change", () => filterAndSortResults());
  storeBtns.forEach((btn) =>
    btn.addEventListener("click", function () {
      storeBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      selectedStore = this.dataset.store;
      filterAndSortResults();
    })
  );

  // Search function
  async function performSearch(page = 1) {
    const query = searchInput.value.trim();
    if (!query) return showWelcomeMessage();

    isLoading = true;
    currentPage = page;

    if (page === 1) resultsContainer.innerHTML = "";
    loadingIndicator.style.display = "flex";

    try {
      const res = await fetch(
        `http://localhost:5000/api/products/compare?product=${encodeURIComponent(
          query
        )}&page=${page}`
      );
      const data = await res.json();

      const { amazon, walmart, flipkart, ebay } = data;
      const product = [
        ...(Array.isArray(amazon?.products) && amazon?.products?.length > 0
          ? amazon?.products
          : []),
        ...(Array.isArray(walmart?.products) && walmart?.products?.length > 0
          ? walmart?.products
          : []),
        ...(Array.isArray(ebay?.products) && ebay?.products?.length > 0
          ? ebay?.products
          : []),
      ];

      const formattedResponse = filterAmazonResponse(product);
      displayResults(formattedResponse);
    } catch (error) {
      console.error("Search error:", error);
      showError();
    } finally {
      loadingIndicator.style.display = "none";
      isLoading = false;
    }
  }

  function convertToINR(priceString, usdToInrRate = 83) {
    if (priceString.startsWith("$")) {
      const amountInUSD = parseFloat(priceString.replace("$", ""));
      const amountInINR = amountInUSD * usdToInrRate;
      return `₹${amountInINR.toFixed(2)}`;
    }
    return priceString; // Already in INR or other currency
  }

  // Parse Amazon API data
  function filterAmazonResponse(data) {
    return (data || []).map((p) => {
      const formattedPrice = p?.price ? convertToINR(p?.price) : 0,
        formattedOriginalPrice = p?.originalPrice
          ? convertToINR(p?.originalPrice)
          : 0;
      const price = formattedPrice
        ? Math.floor(parseFloat(formattedPrice.replace(/[^0-9.]/g, "")))
        : 0;

      const originalPrice = formattedOriginalPrice
        ? Math.floor(parseFloat(formattedOriginalPrice.replace(/[^0-9.]/g, "")))
        : 0;

      return {
        id: p?.id,
        name: p?.name,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice || "0"),
        rating: parseFloat(p?.rating) || 0,
        no_of_rating: p?.no_of_rating,
        image: p?.image,
        url: p?.url,
        delivery: p?.delivery || "N/A",
        source: p?.source,
        reviews: p?.reviews ?? Math.floor(Math.random() * 5000),
        inStock: p?.inStock ?? Math.random() > 0.2,
      };
    });
  }

  // Display results
  function displayResults(products) {
    if (!products?.length) return showNoResults();
    filterAndSortResults(products);
  }

  // Filter and sort results
  function filterAndSortResults(products) {
    if (!products) {
      // Re-sort/filter existing DOM cards
      const cards = Array.from(document.querySelectorAll(".product-card")).map(
        (el) => ({
          element: el,
          price: parseFloat(el.dataset.price),
          rating: parseFloat(el.dataset.rating),
          discount: parseFloat(el.dataset.discount),
          source: el.dataset.source,
        })
      );

      const visible = cards.filter(
        (p) => selectedStore === "all" || p.source === selectedStore
      );

      visible.sort(sortLogic(sortSelect.value));
      visible.forEach((p) => resultsContainer.appendChild(p.element));
      cards.forEach((p) => {
        p.element.style.display =
          selectedStore === "all" || p.source === selectedStore
            ? "block"
            : "none";
      });

      return;
    }

    // New results rendering
    resultsContainer.innerHTML = "";

    const cheapest = Math.min(...products.map((p) => p.price));
    const sortValue = sortSelect.value;

    if (selectedStore !== "all") {
      products = products.filter(
        (p) => p.source.toLowerCase() === selectedStore
      );
    }

    products.sort(sortLogic(sortValue));

    products.forEach((product) => {
      const discount =
        product.price && product.originalPrice
          ? Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            )
          : 0;
      const isCheapest = product.price === cheapest;

      const card = document.createElement("div");
      card.className = "product-card";
      Object.assign(card.dataset, {
        id: product.id,
        price: product.price,
        rating: product.rating,
        discount: discount ?? 0,
        source: product.source.toLowerCase(),
      });

      card.innerHTML = `
        <div class="product-image-container">
          ${isCheapest ? '<div class="cheapest-badge">Best Price</div>' : ""}
          <img src="${product.image}" alt="${
        product.name
      }" class="product-image" 
            onerror="this.src='https://via.placeholder.com/300?text=Product+Image'">
          <div class="product-badge">${discount}% OFF</div>
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="price-container">
            <span class="current-price">₹${product.price.toLocaleString(
              "en-IN"
            )}</span>
            <span class="original-price">₹${product.originalPrice.toLocaleString(
              "en-IN"
            )}</span>
            <span class="discount">${discount}% off</span>
          </div>
          <div class="rating">
            <i class="fas fa-star"></i> ${product.rating}
            <span style="margin-left: 8px; color: var(--gray);">(${product.reviews.toLocaleString(
              "en-IN"
            )} reviews)</span>
          </div>
          <span class="store-tag ${product.source.toLowerCase()}">
            <i class="${
              product.source === "eBay"
                ? "fab fa-ebay"
                : product.source === "Amazon"
                ? "fab fa-amazon"
                : product.source === "walmart"
                ? "fas fa-walmart"
                : "fas fa-shopping-bag"
            }"></i> ${product.source}
          </span>
          <div class="product-meta">
            <span><i class="fas fa-${
              product.inStock ? "check" : "times"
            }"></i> ${product.inStock ? "In Stock" : "Out of Stock"}</span>
            <span><i class="fas fa-truck"></i> ${product.delivery}</span>
          </div>
          <a href="${product.url}" class="view-btn" target="_blank">
            <i class="fas fa-external-link-alt"></i> View on ${product.source}
          </a>
        </div>
      `;

      resultsContainer.appendChild(card);
    });
  }

  // Sorting logic
  function sortLogic(type) {
    return (a, b) => {
      switch (type) {
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "discount":
          return b.discount - a.discount;
        default:
          return 0;
      }
    };
  }

  // UI Helpers
  const showWelcomeMessage = () =>
    (resultsContainer.innerHTML = `
      <div class="empty-state">
        <img src="https://cdn-icons-png.flaticon.com/512/3577/3577428.png" alt="Search">
        <h3>Find the best prices online</h3>
        <p>Search for products to compare prices across top stores</p>
      </div>`);

  const showNoResults = () =>
    (resultsContainer.innerHTML = `
      <div class="empty-state">
        <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No results">
        <h3>No products found</h3>
        <p>Try a different search term or check your spelling</p>
      </div>`);

  const showError = () =>
    (resultsContainer.innerHTML = `
      <div class="empty-state">
        <img src="https://cdn-icons-png.flaticon.com/512/4639/4639165.png" alt="Error">
        <h3>Something went wrong</h3>
        <p>We couldn't complete your search. Please try again later.</p>
      </div>`);

  // Initial welcome
  showWelcomeMessage();
});

// Keep this scroll listener at the bottom
window.addEventListener("scroll", () => {
  const scrollThreshold = 100;
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomOffset = document.body.offsetHeight - scrollThreshold;

  if (scrollPosition >= bottomOffset && !isLoading) {
    console.log("Scroll API Call...");
    currentPage++;
    // performSearch(currentPage);
  }
});

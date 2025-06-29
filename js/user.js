const nav = document.querySelector(".nav");
const itemsBox = document.querySelector(".items-box");
const pagination = document.querySelector(".pagination");
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};

if (!loggedInUser.id) {
    window.location.href = "index.html";
}

let items = JSON.parse(localStorage.getItem("items")) || [];
const users = JSON.parse(localStorage.getItem("users")) || [];

// Ensure user has required properties
if (!loggedInUser.cart) loggedInUser.cart = [];
if (!loggedInUser.wishlist) loggedInUser.wishlist = [];

function getItemsPerPage() {
    if (window.innerWidth <= 480) return 2;
    if (window.innerWidth <= 768) return 4;
    if (window.innerWidth <= 1024) return 6;
    return 8;
}

let ITEMS_PER_PAGE = getItemsPerPage();
let currentPage = 1;
let showingCart = false;
let showingWishlist = false;

// Initialize UI
function initUI() {
    window.addEventListener("resize", () => {
        ITEMS_PER_PAGE = getItemsPerPage();
        currentPage = 1;
        renderItems();
    });

    // Navigation
    const heading = document.createElement("h1");
    heading.innerHTML = `<i class="fas fa-user-circle"></i> Welcome ${loggedInUser.name || 'User'}`;
    nav.appendChild(heading);

    const sideNav = document.createElement("div");
    sideNav.className = "side-nav";

    // Wishlist button with counter
    const wishlistBtnContainer = document.createElement("div");
    wishlistBtnContainer.className = "nav-btn-container";
    
    const wishlistBtn = document.createElement("button");
    wishlistBtn.className = `button ${showingWishlist ? 'active' : ''}`;
    wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> Wishlist';
    wishlistBtn.addEventListener("click", toggleWishlist);
    wishlistBtnContainer.appendChild(wishlistBtn);
    
    const wishlistCounter = document.createElement("span");
    wishlistCounter.className = "nav-counter";
    wishlistCounter.textContent = loggedInUser.wishlist.length;
    wishlistBtnContainer.appendChild(wishlistCounter);
    sideNav.appendChild(wishlistBtnContainer);

    // Cart button with counter
    const cartBtnContainer = document.createElement("div");
    cartBtnContainer.className = "nav-btn-container";
    
    const cartBtn = document.createElement("button");
    cartBtn.className = `button ${showingCart ? 'active' : ''}`;
    cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Cart';
    cartBtn.addEventListener("click", toggleCart);
    cartBtnContainer.appendChild(cartBtn);
    
    const cartCounter = document.createElement("span");
    cartCounter.className = "nav-counter";
    cartCounter.textContent = loggedInUser.cart.reduce((total, item) => total + item.quantity, 0);
    cartBtnContainer.appendChild(cartCounter);
    sideNav.appendChild(cartBtnContainer);

    // Logout button
    const logoutBtn = document.createElement("button");
    logoutBtn.className = "button button-danger";
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.addEventListener("click", () => {
        updateUserData();
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });
    sideNav.appendChild(logoutBtn);
    nav.appendChild(sideNav);

    renderItems();
}

// Toggle wishlist view
function toggleWishlist() {
    showingWishlist = !showingWishlist;
    showingCart = false;
    currentPage = 1;
    renderItems();
    updateNavButtons();
}

// Toggle cart view
function toggleCart() {
    showingCart = !showingCart;
    showingWishlist = false;
    currentPage = 1;
    renderItems();
    updateNavButtons();
}

// Update nav buttons state
function updateNavButtons() {
    const wishlistBtn = document.querySelector('.side-nav .fa-heart').closest('button');
    const cartBtn = document.querySelector('.side-nav .fa-shopping-cart').closest('button');
    
    wishlistBtn.classList.toggle('active', showingWishlist);
    cartBtn.classList.toggle('active', showingCart);
}

// Update counters in nav
function updateNavCounters() {
    document.querySelector('.fa-heart').nextElementSibling.textContent = loggedInUser.wishlist.length;
    document.querySelector('.fa-shopping-cart').nextElementSibling.textContent = 
        loggedInUser.cart.reduce((total, item) => total + item.quantity, 0);
}

// Render items with pagination
function renderItems() {
    const lowerDiv = document.createElement("div");
    lowerDiv.className = "lower-div";
    
    // Clear existing items
    const existingLowerDiv = document.querySelector(".lower-div");
    if(existingLowerDiv) existingLowerDiv.remove();

    let itemsToDisplay = [];
    if (showingCart) {
        itemsToDisplay = items.filter(item => 
            loggedInUser.cart.some(cartItem => cartItem.id === item.id)
        );
    } else if (showingWishlist) {
        itemsToDisplay = items.filter(item => 
            loggedInUser.wishlist.includes(item.id)
        );
    } else {
        itemsToDisplay = [...items];
    }

    let totalPages = Math.ceil(itemsToDisplay.length / ITEMS_PER_PAGE);
    if (totalPages === 0) totalPages = 1; // Always at least 1 page
    
    // Ensure currentPage is within valid range
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = itemsToDisplay.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if(paginatedItems.length === 0) {
        const noItemsMsg = document.createElement("div");
        noItemsMsg.className = "no-items";
        noItemsMsg.textContent = showingCart ? "Your cart is empty" : 
                                showingWishlist ? "Your wishlist is empty" : 
                                "No items available";
        lowerDiv.appendChild(noItemsMsg);
    } else {
        paginatedItems.forEach(item => {
            addToDom(item, lowerDiv);
        });
    }

    itemsBox.appendChild(lowerDiv);
    renderPagination(totalPages);
}

function addToDom(item, container) {
    const div = document.createElement("div");
    div.setAttribute("id", item.id);
    div.classList.add("item");

    const ul = document.createElement("ul");

    const imageLi = document.createElement("li");
    imageLi.classList.add("itemImage");
    const img = document.createElement("img");
    img.src = item.image || "https://via.placeholder.com/150?text=No+Image";
    img.alt = item.name;
    imageLi.appendChild(img);
    ul.appendChild(imageLi);

    const nameLi = document.createElement("li");
    nameLi.classList.add("itemName");
    nameLi.innerHTML = `<strong>Name:</strong> ${item.name || "Unnamed Item"}`;
    ul.appendChild(nameLi);

    const priceLi = document.createElement("li");
    priceLi.classList.add("itemPrice");
    priceLi.innerHTML = `<strong>Price:</strong> $${(item.price || 0).toFixed(2)}`;
    ul.appendChild(priceLi);

    const descLi = document.createElement("li");
    descLi.classList.add("itemDesc");
    descLi.innerHTML = `<strong>Description:</strong> ${item.description || "No description available"}`;
    ul.appendChild(descLi);

    div.appendChild(ul);

    const btnBox = document.createElement("div");
    btnBox.classList.add("button-box");

    // Wishlist heart icon
    const wishlistBtn = document.createElement("button");
    wishlistBtn.className = "wishlist-btn";
    wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
    wishlistBtn.classList.toggle("active", loggedInUser.wishlist.includes(item.id));
    wishlistBtn.addEventListener("click", (e) => {
        const isActive = e.currentTarget.classList.contains("active");
        e.currentTarget.classList.toggle("active", !isActive);
        toggleWishlistItem(item.id);
    });
    btnBox.appendChild(wishlistBtn);

    // Cart button or Remove from cart button
    if (!showingCart) {
        const cartBtn = document.createElement("button");
        cartBtn.className = "button button-success";
        cartBtn.innerHTML = showingWishlist ? '<i class="fas fa-cart-plus"></i> Move to Cart' : '<i class="fas fa-cart-plus"></i> Add to Cart';
        cartBtn.addEventListener("click", () => addToCart(item.id));
        btnBox.appendChild(cartBtn);
    } else {
        const cartItem = loggedInUser.cart.find(ci => ci.id === item.id);
        const quantityDiv = document.createElement("span");
        quantityDiv.className = "item-quantity";
        quantityDiv.textContent = `Qty: ${cartItem?.quantity || 1}`;
        btnBox.appendChild(quantityDiv);

        const removeBtn = document.createElement("button");
        removeBtn.className = "button button-danger";
        removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remove';
        removeBtn.addEventListener("click", () => removeFromCart(item.id));
        btnBox.appendChild(removeBtn);
    }

    div.appendChild(btnBox);
    container.appendChild(div);
}

// Toggle item in wishlist
function toggleWishlistItem(itemId) {
    const index = loggedInUser.wishlist.indexOf(itemId);
    if (index === -1) {
        loggedInUser.wishlist.push(itemId);
    } else {
        loggedInUser.wishlist.splice(index, 1);
    }
    updateUserData();
    updateNavCounters();
    renderItems(); // Force UI refresh
}

// Add item to cart
function addToCart(itemId) {
    const existingItem = loggedInUser.cart.find(item => item.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        loggedInUser.cart.push({ id: itemId, quantity: 1 });
    }
    
    updateUserData();
    updateNavCounters();
    
    if (showingWishlist) {
        const index = loggedInUser.wishlist.indexOf(itemId);
        if (index !== -1) {
            loggedInUser.wishlist.splice(index, 1);
            updateUserData();
            updateNavCounters();
        }
    }
    
    renderItems(); // Force UI refresh
}

// Remove item from cart
function removeFromCart(itemId) {
    loggedInUser.cart = loggedInUser.cart.filter(item => item.id !== itemId);
    updateUserData();
    updateNavCounters();
    renderItems(); // Force UI refresh
}

// Update user data
function updateUserData() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.id === loggedInUser.id);
    if (index !== -1) {
        users[index] = loggedInUser;
        localStorage.setItem("users", JSON.stringify(users));
        sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    }
}

// Render pagination
function renderPagination(totalPages) {
    pagination.innerHTML = '';

    if(totalPages <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.className = "pagination-btn";
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if(currentPage > 1) {
            currentPage--;
            renderItems();
        }
    });
    pagination.appendChild(prevBtn);

    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
        const firstBtn = document.createElement("button");
        firstBtn.className = "pagination-btn";
        firstBtn.textContent = "1";
        firstBtn.addEventListener("click", () => {
            currentPage = 1;
            renderItems();
        });
        pagination.appendChild(firstBtn);

        if (start > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-ellipsis";
            ellipsis.textContent = "...";
            pagination.appendChild(ellipsis);
        }
    }

    for (let i = start; i <= end; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `pagination-btn ${currentPage === i ? "active" : ""}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => {
            currentPage = i;
            renderItems();
        });
        pagination.appendChild(pageBtn);
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-ellipsis";
            ellipsis.textContent = "...";
            pagination.appendChild(ellipsis);
        }

        const lastBtn = document.createElement("button");
        lastBtn.className = "pagination-btn";
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener("click", () => {
            currentPage = totalPages;
            renderItems();
        });
        pagination.appendChild(lastBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.className = "pagination-btn";
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
        if(currentPage < totalPages) {
            currentPage++;
            renderItems();
        }
    });
    pagination.appendChild(nextBtn);
}

// Initialize the page
document.addEventListener("DOMContentLoaded", initUI);
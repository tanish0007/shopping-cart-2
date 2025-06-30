const nav = document.querySelector(".nav");
const itemsBox = document.querySelector(".items-box");
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};

if (!loggedInUser.id) {
    window.location.href = "index.html";
}

let items = JSON.parse(localStorage.getItem("items")) || [];
const users = JSON.parse(localStorage.getItem("users")) || [];

// Ensure user has required properties
if (!loggedInUser.cart) loggedInUser.cart = [];
if (!loggedInUser.wishlist) loggedInUser.wishlist = [];

let showingCart = false;
let showingWishlist = false;

// Initialize UI
function initUI() {
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
    renderItems();
    updateNavButtons();
}

// Toggle cart view
function toggleCart() {
    showingCart = !showingCart;
    showingWishlist = false;
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

// Render items
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

    if(itemsToDisplay.length === 0) {
        const noItemsMsg = document.createElement("div");
        noItemsMsg.className = "no-items";
        noItemsMsg.textContent = showingCart ? "Your cart is empty" : 
                                showingWishlist ? "Your wishlist is empty" : 
                                "No items available";
        lowerDiv.appendChild(noItemsMsg);
    } else {
        itemsToDisplay.forEach(item => {
            addToDom(item, lowerDiv);
        });
    }

    itemsBox.appendChild(lowerDiv);
}

function addToDom(item, container) {
    const div = document.createElement("div");
    div.setAttribute("id", item.id);
    div.classList.add("item");

    const ul = document.createElement("ul");

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

    // Wishlist button
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
    renderItems();
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
    
    renderItems();
}

// Remove item from cart
function removeFromCart(itemId) {
    loggedInUser.cart = loggedInUser.cart.filter(item => item.id !== itemId);
    updateUserData();
    updateNavCounters();
    renderItems();
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

// Initialize the page
document.addEventListener("DOMContentLoaded", initUI);
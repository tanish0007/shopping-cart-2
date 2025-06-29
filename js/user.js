// Initialize with proper error handling
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};
const users = JSON.parse(localStorage.getItem("users")) || [];
let items = JSON.parse(localStorage.getItem("items")) || [];

function getItemsPerPage() {
    if (window.innerWidth <= 480) return 2;    // Mobile
    if (window.innerWidth <= 768) return 4;    // Tablet
    if (window.innerWidth <= 1024) return 6;    // Desktop
    return 8;                                  // Desktop
}

let ITEMS_PER_PAGE = getItemsPerPage();
let currentPage = 1;
let showingCart = false;
let showingWishlist = false;

// DOM Elements
const nav = document.querySelector(".nav");
const itemsBox = document.querySelector(".items-box");
const pagination = document.querySelector(".pagination");

// Validate logged in user
if (!loggedInUser.id) {
    window.location.href = "index.html";
}

// Ensure user has required properties
if (!loggedInUser.cart) loggedInUser.cart = [];
if (!loggedInUser.wishlist) loggedInUser.wishlist = [];

// Initialize UI
function initUI() {
    try {
        window.addEventListener("resize", () => {
            ITEMS_PER_PAGE = getItemsPerPage();
            currentPage = 1;
            renderItems();
        });

        // Navigation
        const heading = document.createElement("h1");
        heading.textContent = `Welcome ${loggedInUser.name || 'User'}`;
        nav.appendChild(heading);

        const sideNav = document.createElement("div");
        sideNav.className = "side-nav";

        // Wishlist button
        const wishlistBtn = document.createElement("button");
        wishlistBtn.className = `button ${showingWishlist ? 'active' : ''}`;
        wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> Wishlist';
        wishlistBtn.addEventListener("click", toggleWishlist);
        sideNav.appendChild(wishlistBtn);

        // Cart button
        const cartBtn = document.createElement("button");
        cartBtn.className = `button ${showingCart ? 'active' : ''}`;
        cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Cart';
        cartBtn.addEventListener("click", toggleCart);
        sideNav.appendChild(cartBtn);

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
    } catch (error) {
        console.error("Error initializing UI:", error);
    }
}

// Toggle wishlist view
function toggleWishlist() {
    try {
        showingWishlist = !showingWishlist;
        showingCart = false;
        currentPage = 1;
        renderItems();
    } catch (error) {
        console.error("Error toggling wishlist:", error);
    }
}

// Toggle cart view
function toggleCart() {
    try {
        showingCart = !showingCart;
        showingWishlist = false;
        currentPage = 1;
        renderItems();
    } catch (error) {
        console.error("Error toggling cart:", error);
    }
}

// Render items with pagination
function renderItems() {
    try {
        itemsBox.innerHTML = '';

        if (!Array.isArray(items)) {
            items = [];
            localStorage.setItem("items", JSON.stringify(items));
        }

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

        const totalPages = Math.ceil(itemsToDisplay.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedItems = itemsToDisplay.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        if (paginatedItems.length === 0) {
            const noItemsMsg = document.createElement("p");
            noItemsMsg.className = "no-items";
            noItemsMsg.textContent = showingCart ? "Your cart is empty" : 
                                    showingWishlist ? "Your wishlist is empty" : 
                                    "No items available";
            itemsBox.appendChild(noItemsMsg);
        } else {
            const itemsContainer = document.createElement("div");
            itemsContainer.className = "items-grid";

            paginatedItems.forEach(item => {
                if (!item || !item.id) return;

                const itemCard = document.createElement("div");
                itemCard.className = "item-card";

                const itemImage = document.createElement("div");
                itemImage.className = "item-image";
                itemImage.textContent = item.name ? item.name.charAt(0).toUpperCase() : "Item";
                itemCard.appendChild(itemImage);

                const itemDetails = document.createElement("div");
                itemDetails.className = "item-details";

                const itemName = document.createElement("h3");
                itemName.textContent = item.name || "Unnamed Item";
                itemDetails.appendChild(itemName);

                const itemPrice = document.createElement("div");
                itemPrice.className = "item-price";
                itemPrice.textContent = `$${(item.price || 0).toFixed(2)}`;
                itemDetails.appendChild(itemPrice);

                const itemDesc = document.createElement("p");
                itemDesc.textContent = item.description || "No description available";
                itemDetails.appendChild(itemDesc);

                itemCard.appendChild(itemDetails);

                const itemActions = document.createElement("div");
                itemActions.className = "item-actions";

                // Wishlist button
                const wishlistBtn = document.createElement("button");
                wishlistBtn.className = "wishlist-btn";
                wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
                if (loggedInUser.wishlist.includes(item.id)) {
                    wishlistBtn.classList.add("active");
                }
                wishlistBtn.addEventListener("click", () => toggleWishlistItem(item.id));
                itemActions.appendChild(wishlistBtn);

                // Cart button
                if (!showingCart) {
                    const cartBtn = document.createElement("button");
                    cartBtn.className = "button add-to-cart";
                    cartBtn.textContent = showingWishlist ? "Move to Cart" : "Add to Cart";
                    cartBtn.addEventListener("click", () => addToCart(item.id));
                    itemActions.appendChild(cartBtn);
                } else {
                    const cartItem = loggedInUser.cart.find(ci => ci.id === item.id);
                    const quantityDiv = document.createElement("div");
                    quantityDiv.className = "item-quantity";
                    quantityDiv.textContent = `Qty: ${cartItem?.quantity || 1}`;
                    itemActions.appendChild(quantityDiv);

                    const removeBtn = document.createElement("button");
                    removeBtn.className = "button button-danger";
                    removeBtn.textContent = "Remove";
                    removeBtn.addEventListener("click", () => removeFromCart(item.id));
                    itemActions.appendChild(removeBtn);
                }

                itemCard.appendChild(itemActions);
                itemsContainer.appendChild(itemCard);
            });

            itemsBox.appendChild(itemsContainer);
        }

        renderPagination(totalPages);
    } catch (error) {
        console.error("Error rendering items:", error);
    }
}

// Toggle item in wishlist
function toggleWishlistItem(itemId) {
    try {
        const index = loggedInUser.wishlist.indexOf(itemId);
        if (index === -1) {
            loggedInUser.wishlist.push(itemId);
        } else {
            loggedInUser.wishlist.splice(index, 1);
        }
        updateUserData();
        renderItems();
    } catch (error) {
        console.error("Error toggling wishlist item:", error);
    }
}

// Add item to cart
function addToCart(itemId) {
    try {
        const existingItem = loggedInUser.cart.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            loggedInUser.cart.push({ id: itemId, quantity: 1 });
        }
        
        updateUserData();
        
        if (showingWishlist) {
            const index = loggedInUser.wishlist.indexOf(itemId);
            if (index !== -1) {
                loggedInUser.wishlist.splice(index, 1);
                updateUserData();
            }
        }
        
        renderItems();
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
}

// Remove item from cart
function removeFromCart(itemId) {
    try {
        loggedInUser.cart = loggedInUser.cart.filter(item => item.id !== itemId);
        updateUserData();
        renderItems();
    } catch (error) {
        console.error("Error removing from cart:", error);
    }
}

// Update user data
function updateUserData() {
    try {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex(u => u.id === loggedInUser.id);
        if (index !== -1) {
            users[index] = loggedInUser;
            localStorage.setItem("users", JSON.stringify(users));
            sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        }
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}

// Render pagination
function renderPagination(totalPages) {
    try {
        pagination.innerHTML = '';
        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement("button");
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderItems();
            }
        });
        pagination.appendChild(prevBtn);

        // Page buttons
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        if (start > 1) {
            const firstBtn = document.createElement("button");
            firstBtn.textContent = "1";
            firstBtn.addEventListener("click", () => {
                currentPage = 1;
                renderItems();
            });
            pagination.appendChild(firstBtn);

            if (start > 2) {
                const ellipsis = document.createElement("span");
                ellipsis.textContent = "...";
                pagination.appendChild(ellipsis);
            }
        }

        for (let i = start; i <= end; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.className = currentPage === i ? "active" : "";
            btn.addEventListener("click", () => {
                currentPage = i;
                renderItems();
            });
            pagination.appendChild(btn);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) {
                const ellipsis = document.createElement("span");
                ellipsis.textContent = "...";
                pagination.appendChild(ellipsis);
            }

            const lastBtn = document.createElement("button");
            lastBtn.textContent = totalPages;
            lastBtn.addEventListener("click", () => {
                currentPage = totalPages;
                renderItems();
            });
            pagination.appendChild(lastBtn);
        }

        // Next button
        const nextBtn = document.createElement("button");
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderItems();
            }
        });
        pagination.appendChild(nextBtn);
    } catch (error) {
        console.error("Error rendering pagination:", error);
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", initUI);
// Initialize with proper error handling
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};
const users = JSON.parse(localStorage.getItem("users")) || [];
let items = JSON.parse(localStorage.getItem("items")) || [];

// Initialize constants
const ITEMS_PER_PAGE = 12;
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
        // Navigation
        const heading = document.createElement("h1");
        heading.textContent = `Welcome ${loggedInUser.name || 'User'}`;
        nav.appendChild(heading);

        const sideNav = document.createElement("div");
        sideNav.className = "user-actions";

        // Wishlist button
        const wishlistBtn = document.createElement("button");
        wishlistBtn.id = "wishlistBtn";
        wishlistBtn.className = "button";
        wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> Wishlist';
        wishlistBtn.addEventListener("click", toggleWishlist);
        sideNav.appendChild(wishlistBtn);

        // Cart button
        const cartBtn = document.createElement("button");
        cartBtn.id = "cartBtn";
        cartBtn.className = "button";
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

        // Validate items data
        if (!Array.isArray(items)) {
            items = [];
            localStorage.setItem("items", JSON.stringify(items));
        }

        let itemsToDisplay = [];
        if (showingCart) {
            itemsToDisplay = items.filter(item => 
                Array.isArray(loggedInUser.cart) && 
                loggedInUser.cart.some(cartItem => cartItem.id === item.id)
            );
        } else if (showingWishlist) {
            itemsToDisplay = items.filter(item => 
                Array.isArray(loggedInUser.wishlist) && 
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
            if (showingCart) {
                noItemsMsg.textContent = "Your cart is empty";
            } else if (showingWishlist) {
                noItemsMsg.textContent = "Your wishlist is empty";
            } else {
                noItemsMsg.textContent = "No items available";
            }
            itemsBox.appendChild(noItemsMsg);
        } else {
            const itemsContainer = document.createElement("div");
            itemsContainer.className = "items-container";

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
                if (Array.isArray(loggedInUser.wishlist) && loggedInUser.wishlist.includes(item.id)) {
                    wishlistBtn.classList.add("active");
                }
                wishlistBtn.addEventListener("click", () => toggleWishlistItem(item.id));
                itemActions.appendChild(wishlistBtn);

                // Add to cart button
                if (!showingCart) {
                    const addToCartBtn = document.createElement("button");
                    addToCartBtn.className = "add-to-cart";
                    addToCartBtn.textContent = showingWishlist ? "Move to Cart" : "Add to Cart";
                    addToCartBtn.addEventListener("click", () => addToCart(item.id));
                    itemActions.appendChild(addToCartBtn);
                } else {
                    // Show quantity and remove option in cart view
                    const cartItem = Array.isArray(loggedInUser.cart) ? 
                        loggedInUser.cart.find(cartItem => cartItem.id === item.id) : 
                        null;
                    const quantityDiv = document.createElement("div");
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
        if (!loggedInUser.wishlist) loggedInUser.wishlist = [];
        
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
        if (!loggedInUser.cart) loggedInUser.cart = [];
        
        const existingItem = loggedInUser.cart.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 0) + 1;
        } else {
            loggedInUser.cart.push({
                id: itemId,
                quantity: 1
            });
        }
        
        updateUserData();
        
        if (showingWishlist) {
            // Remove from wishlist if adding from wishlist view
            if (Array.isArray(loggedInUser.wishlist)) {
                const wishlistIndex = loggedInUser.wishlist.indexOf(itemId);
                if (wishlistIndex !== -1) {
                    loggedInUser.wishlist.splice(wishlistIndex, 1);
                    updateUserData();
                }
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
        if (Array.isArray(loggedInUser.cart)) {
            loggedInUser.cart = loggedInUser.cart.filter(item => item.id !== itemId);
            updateUserData();
            renderItems();
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
    }
}

// Update user data in localStorage
function updateUserData() {
    try {
        if (!loggedInUser || !loggedInUser.id) return;
        
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const userIndex = users.findIndex(user => user.id === loggedInUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = loggedInUser;
            localStorage.setItem("users", JSON.stringify(users));
            sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        }
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}

// Render pagination buttons
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
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement("button");
            pageBtn.textContent = i;
            pageBtn.className = currentPage === i ? "active" : "";
            pageBtn.addEventListener("click", () => {
                currentPage = i;
                renderItems();
            });
            pagination.appendChild(pageBtn);
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

// Initialize the page
document.addEventListener("DOMContentLoaded", initUI);

// const nav = document.querySelector(".nav");
// const itemsBox = document.querySelector(".items-box");
// const pagination = document.querySelector(".pagination");
// const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

// // Redirect if not logged in
// if(!loggedInUser) {
//     window.location.href = "index.html";
// }

// let items = JSON.parse(localStorage.getItem("items")) || [];
// const ITEMS_PER_PAGE = 12;
// let currentPage = 1;
// let showingCart = false;
// let showingWishlist = false;

// // Initialize UI
// function initUI() {
//     // Navigation
//     const heading = document.createElement("h1");
//     heading.textContent = `Welcome ${loggedInUser.name}`;
//     nav.appendChild(heading);

//     const sideNav = document.createElement("div");
//     sideNav.className = "user-actions";

//     // Wishlist button
//     const wishlistBtn = document.createElement("button");
//     wishlistBtn.id = "wishlistBtn";
//     wishlistBtn.className = "button";
//     wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> Wishlist';
//     wishlistBtn.addEventListener("click", toggleWishlist);
//     sideNav.appendChild(wishlistBtn);

//     // Cart button
//     const cartBtn = document.createElement("button");
//     cartBtn.id = "cartBtn";
//     cartBtn.className = "button";
//     cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Cart';
//     cartBtn.addEventListener("click", toggleCart);
//     sideNav.appendChild(cartBtn);

//     // Logout button
//     const logoutBtn = document.createElement("button");
//     logoutBtn.className = "button button-danger";
//     logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
//     logoutBtn.addEventListener("click", () => {
//         // Update user data before logging out
//         updateUserData();
//         sessionStorage.removeItem("loggedInUser");
//         window.location.href = "index.html";
//     });
//     sideNav.appendChild(logoutBtn);
//     nav.appendChild(sideNav);

//     renderItems();
// }

// // Toggle wishlist view
// function toggleWishlist() {
//     showingWishlist = !showingWishlist;
//     showingCart = false;
//     currentPage = 1;
//     renderItems();
// }

// // Toggle cart view
// function toggleCart() {
//     showingCart = !showingCart;
//     showingWishlist = false;
//     currentPage = 1;
//     renderItems();
// }

// // Render items with pagination
// function renderItems() {
//     itemsBox.innerHTML = '';

//     let itemsToDisplay = [];
//     if(showingCart) {
//         itemsToDisplay = items.filter(item => 
//             loggedInUser.cart.some(cartItem => cartItem.id === item.id)
//         );
//     } else if(showingWishlist) {
//         itemsToDisplay = items.filter(item => 
//             loggedInUser.wishlist.includes(item.id)
//         );
//     } else {
//         itemsToDisplay = [...items];
//     }

//     const totalPages = Math.ceil(itemsToDisplay.length / ITEMS_PER_PAGE);
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     const paginatedItems = itemsToDisplay.slice(startIndex, startIndex + ITEMS_PER_PAGE);

//     if(paginatedItems.length === 0) {
//         const noItemsMsg = document.createElement("p");
//         noItemsMsg.className = "no-items";
//         if(showingCart) {
//             noItemsMsg.textContent = "Your cart is empty";
//         } else if(showingWishlist) {
//             noItemsMsg.textContent = "Your wishlist is empty";
//         } else {
//             noItemsMsg.textContent = "No items available";
//         }
//         itemsBox.appendChild(noItemsMsg);
//     } else {
//         const itemsContainer = document.createElement("div");
//         itemsContainer.className = "items-container";

//         paginatedItems.forEach(item => {
//             const itemCard = document.createElement("div");
//             itemCard.className = "item-card";

//             const itemImage = document.createElement("div");
//             itemImage.className = "item-image";
//             itemImage.textContent = "Item Image";
//             itemCard.appendChild(itemImage);

//             const itemDetails = document.createElement("div");
//             itemDetails.className = "item-details";

//             const itemName = document.createElement("h3");
//             itemName.textContent = item.name;
//             itemDetails.appendChild(itemName);

//             const itemPrice = document.createElement("div");
//             itemPrice.className = "item-price";
//             itemPrice.textContent = `$${item.price.toFixed(2)}`;
//             itemDetails.appendChild(itemPrice);

//             const itemDesc = document.createElement("p");
//             itemDesc.textContent = item.description;
//             itemDetails.appendChild(itemDesc);

//             itemCard.appendChild(itemDetails);

//             const itemActions = document.createElement("div");
//             itemActions.className = "item-actions";

//             // Wishlist button
//             const wishlistBtn = document.createElement("button");
//             wishlistBtn.className = "wishlist-btn";
//             wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
//             if(loggedInUser.wishlist.includes(item.id)) {
//                 wishlistBtn.classList.add("active");
//             }
//             wishlistBtn.addEventListener("click", () => toggleWishlistItem(item.id));
//             itemActions.appendChild(wishlistBtn);

//             // Add to cart button
//             if(!showingCart) {
//                 const addToCartBtn = document.createElement("button");
//                 addToCartBtn.className = "add-to-cart";
//                 addToCartBtn.textContent = showingWishlist ? "Move to Cart" : "Add to Cart";
//                 addToCartBtn.addEventListener("click", () => addToCart(item.id));
//                 itemActions.appendChild(addToCartBtn);
//             } else {
//                 // Show quantity and remove option in cart view
//                 const cartItem = loggedInUser.cart.find(cartItem => cartItem.id === item.id);
//                 const quantityDiv = document.createElement("div");
//                 quantityDiv.textContent = `Qty: ${cartItem.quantity}`;
//                 itemActions.appendChild(quantityDiv);

//                 const removeBtn = document.createElement("button");
//                 removeBtn.className = "button button-danger";
//                 removeBtn.textContent = "Remove";
//                 removeBtn.addEventListener("click", () => removeFromCart(item.id));
//                 itemActions.appendChild(removeBtn);
//             }

//             itemCard.appendChild(itemActions);
//             itemsContainer.appendChild(itemCard);
//         });

//         itemsBox.appendChild(itemsContainer);
//     }

//     renderPagination(totalPages);
// }

// // Toggle item in wishlist
// function toggleWishlistItem(itemId) {
//     const index = loggedInUser.wishlist.indexOf(itemId);
//     if(index === -1) {
//         loggedInUser.wishlist.push(itemId);
//     } else {
//         loggedInUser.wishlist.splice(index, 1);
//     }
//     updateUserData();
//     renderItems();
// }

// // Add item to cart
// function addToCart(itemId) {
//     const existingItem = loggedInUser.cart.find(item => item.id === itemId);
    
//     if(existingItem) {
//         existingItem.quantity += 1;
//     } else {
//         loggedInUser.cart.push({
//             id: itemId,
//             quantity: 1
//         });
//     }
    
//     updateUserData();
    
//     if(showingWishlist) {
//         // Remove from wishlist if adding from wishlist view
//         const wishlistIndex = loggedInUser.wishlist.indexOf(itemId);
//         if(wishlistIndex !== -1) {
//             loggedInUser.wishlist.splice(wishlistIndex, 1);
//             updateUserData();
//         }
//     }
    
//     renderItems();
// }

// // Remove item from cart
// function removeFromCart(itemId) {
//     loggedInUser.cart = loggedInUser.cart.filter(item => item.id !== itemId);
//     updateUserData();
//     renderItems();
// }

// // Update user data in localStorage
// function updateUserData() {
//     const users = JSON.parse(localStorage.getItem("users"));
//     const updatedUsers = users.map(user => {
//         if(user.id === loggedInUser.id) {
//             return loggedInUser;
//         }
//         return user;
//     });
//     localStorage.setItem("users", JSON.stringify(updatedUsers));
//     sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
// }

// // Render pagination buttons
// function renderPagination(totalPages) {
//     pagination.innerHTML = '';

//     if(totalPages <= 1) return;

//     // Previous button
//     const prevBtn = document.createElement("button");
//     prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
//     prevBtn.disabled = currentPage === 1;
//     prevBtn.addEventListener("click", () => {
//         if(currentPage > 1) {
//             currentPage--;
//             renderItems();
//         }
//     });
//     pagination.appendChild(prevBtn);

//     // Page buttons
//     for(let i = 1; i <= totalPages; i++) {
//         const pageBtn = document.createElement("button");
//         pageBtn.textContent = i;
//         pageBtn.className = currentPage === i ? "active" : "";
//         pageBtn.addEventListener("click", () => {
//             currentPage = i;
//             renderItems();
//         });
//         pagination.appendChild(pageBtn);
//     }

//     // Next button
//     const nextBtn = document.createElement("button");
//     nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
//     nextBtn.disabled = currentPage === totalPages;
//     nextBtn.addEventListener("click", () => {
//         if(currentPage < totalPages) {
//             currentPage++;
//             renderItems();
//         }
//     });
//     pagination.appendChild(nextBtn);
// }

// // Initialize the page
// initUI();
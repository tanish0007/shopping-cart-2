const nav = document.querySelector(".nav");
const itemsBox = document.querySelector(".items-box");
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || {};

let currentPage = 1;
let itemsPerPage = 8;

if (!loggedInUser.id) {
    window.location.href = "index.html";
}

let items = JSON.parse(localStorage.getItem("items")) || [];
const users = JSON.parse(localStorage.getItem("users")) || [];

if (!loggedInUser.cart) loggedInUser.cart = [];
if (!loggedInUser.wishlist) loggedInUser.wishlist = [];

let showingCart = false;
let showingWishlist = false;

// Add this function to calculate total pages
function calculateTotalPages(itemsToDisplay) {
    if (itemsToDisplay.length % itemsPerPage === 0) {
        return itemsToDisplay.length / itemsPerPage;
    } else {
        return Math.floor(itemsToDisplay.length / itemsPerPage) + 1;
    }
}

// Add this function to get items for current page
function getItemsForCurrentPage(itemsToDisplay) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, itemsToDisplay.length);
    return itemsToDisplay.slice(startIndex, endIndex);
}

// Add this function to render pagination controls
function renderPaginationControls(totalPages) {
    const paginationDiv = document.createElement("div");
    paginationDiv.className = "pagination-controls";

    const prevButton = document.createElement("button");
    prevButton.innerHTML = "&laquo;";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderItems();
        }
    });

    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Page ${currentPage}/${totalPages}`;

    const nextButton = document.createElement("button");
    nextButton.innerHTML = "&raquo;";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderItems();
        }
    });

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);

    return paginationDiv;
}

function initUI() {
    const heading = document.createElement("h1");
    heading.innerHTML = `Welcome ${loggedInUser.name || 'User'}`;
    nav.appendChild(heading);

    const sideNav = document.createElement("div");
    sideNav.className = "side-nav";

    // Wishlist button with counter
    const wishlistBtnContainer = document.createElement("div");
    wishlistBtnContainer.className = "nav-btn-container";
    
    const wishlistBtn = document.createElement("button");
    wishlistBtn.className = `button ${showingWishlist ? 'active' : ''}`;
    wishlistBtn.innerHTML = '<i class="fas fa-heart" style="color: red"></i> Wishlist';
    wishlistBtn.addEventListener("click", toggleWishlist);
    wishlistBtnContainer.appendChild(wishlistBtn);
    
    const wishlistCounter = document.createElement("span");
    wishlistCounter.className = "nav-counter";
    wishlistCounter.id = "wishlistCount";
    wishlistCounter.textContent = loggedInUser.wishlist.length;
    wishlistBtnContainer.appendChild(wishlistCounter);
    sideNav.appendChild(wishlistBtnContainer);

    // Cart button with counter
    const cartBtnContainer = document.createElement("div");
    cartBtnContainer.className = "nav-btn-container";
    
    const cartBtn = document.createElement("button");
    cartBtn.className = `button ${showingCart ? 'active' : ''}`;
    cartBtn.innerHTML = '<i class="fas fa-shopping-cart" style="color: blue"></i> Cart';
    cartBtn.addEventListener("click", toggleCart);
    cartBtnContainer.appendChild(cartBtn);
    
    const cartCounter = document.createElement("span");
    cartCounter.className = "nav-counter";
    cartCounter.id = "cartCount";
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

function toggleWishlist() {
    showingWishlist = !showingWishlist;
    showingCart = false;
    currentPage = 1; // Reset to first page when switching views
    updateNavButtons();
    renderItems();
}

function toggleCart() {
    showingCart = !showingCart;
    showingWishlist = false;
    currentPage = 1; // Reset to first page when switching views
    updateNavButtons();
    renderItems();
}

function updateNavButtons() {
    const wishlistBtn = document.querySelector('.side-nav .fa-heart').closest('button');
    const cartBtn = document.querySelector('.side-nav .fa-shopping-cart').closest('button');
    
    wishlistBtn.classList.toggle('active', showingWishlist);
    cartBtn.classList.toggle('active', showingCart);
}

function updateNavCounters() {
    document.querySelector('#wishlistCount').textContent = loggedInUser.wishlist.length;
    document.querySelector('#cartCount').textContent = loggedInUser.cart.reduce((total, item) => total + item.quantity, 0);
}

function renderItems() {
    const lowerDiv = document.createElement("div");
    lowerDiv.className = "lower-div";
    
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

    const totalPages = calculateTotalPages(itemsToDisplay);
    const paginatedItems = getItemsForCurrentPage(itemsToDisplay);

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

        if (totalPages > 1) {
            const paginationControls = renderPaginationControls(totalPages);
            lowerDiv.appendChild(paginationControls);
        }
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
    priceLi.innerHTML = `<strong>Price:</strong> $${(item.price || 0)}`;
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
        // debugger;
        const isActive = e.currentTarget.classList.contains("active");
        e.currentTarget.classList.toggle("active", !isActive);
        toggleWishlistItem(item.id);

        // const wishlistCount = document.querySelector("#wishlistCount");
        // console.log(wishlistCount.textContent);

        // wishlistCount.textContent = parseInt(wishlistCount.textContent) + 1;
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


/*
    i want to add pagination in it such that 
    no. of pages will be divided such that if 
    items per page = 8;
    if( items.length % 8 === 0) totalNoOfPage = items.length / items per page;
    else totalNoOfPage = ( items.length / items per page ) + 1;

    suppose having 18 items
    loop would be like this..
    first page(1)
        (itemsPerPage*0) to (itemsPerPage*1) -1;
    second page (2)
        (itemsPerPage*1) to (itemsPerPage*2) -1;
    third page (3) is last page ? yes 
        (itemsPerPage*2) to items.length-1;


    and this moving between buttons will happen by two arrow buttons on first page pevPage button will be disabled 
    and on last page nextPage button will be disabled.
    and between these buttons page number should be displayed like this
    < Page 1/totalPages >
*/
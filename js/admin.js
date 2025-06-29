const nav = document.querySelector(".nav");
const itemsBox = document.querySelector(".items-box");
const pagination = document.querySelector(".pagination");
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

if(!loggedInUser || !loggedInUser.isAdmin) {
    window.location.href = "index.html";
}

let items = JSON.parse(localStorage.getItem("items")) || [];

function getItemsPerPage() {
    if (window.innerWidth <= 480) { // Mobile
        return 2;
    } else if (window.innerWidth <= 768) { // Tablet
        return 4;
    } else if (window.innerWidth <= 1024) { // Small desktop
        return 6;
    } else { // Large desktop
        return 8;
    }
}

let ITEMS_PER_PAGE = getItemsPerPage();
let currentPage = 1;

function initUI() {
    window.addEventListener("resize", () => {
        ITEMS_PER_PAGE = getItemsPerPage();
        currentPage = 1;
        renderItems();
    })
    // Navigation
    const heading = document.createElement("h1");
    heading.textContent = `Welcome ${loggedInUser.name}`;
    nav.appendChild(heading);

    const sideNav = document.createElement("div");
    
    const adminBadge = document.createElement("span");
    adminBadge.className = "admin-badge";
    adminBadge.id = "admin-badge";
    adminBadge.setAttribute("title", "Admin User");
    adminBadge.innerHTML = '<i class="fas fa-user-tie"></i> Admin';
    sideNav.appendChild(adminBadge);

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "button button-danger";
    logoutBtn.id = "logoutBtn";
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
    });
    sideNav.appendChild(logoutBtn);
    nav.appendChild(sideNav);

    // Admin controls
    const upperDiv = document.createElement("div");
    upperDiv.classList.add("upper-div");

    const inputsBox = document.createElement("div");
    inputsBox.classList.add("inputs");

    const nameBox = document.createElement("input");
    nameBox.id = "nameBox";
    nameBox.type = "text";
    nameBox.placeholder = "Item name";
    nameBox.required = true;

    const quanBox = document.createElement("input");
    quanBox.id = "quanBox";
    quanBox.type = "number";
    quanBox.placeholder = "Quantity";
    quanBox.min = "1";
    quanBox.required = true;

    const priceBox = document.createElement("input");
    priceBox.id = "priceBox";
    priceBox.type = "number";
    priceBox.placeholder = "Price";
    priceBox.min = "1";
    priceBox.required = true;

    const descBox = document.createElement("input");
    descBox.id = "descBox";
    descBox.type = "text";
    descBox.placeholder = "Description";
    descBox.required = true;

    inputsBox.appendChild(nameBox);
    inputsBox.appendChild(quanBox);
    inputsBox.appendChild(priceBox);
    inputsBox.appendChild(descBox);

    const buttonsBox = document.createElement("div");
    buttonsBox.classList.add("Buttons");

    const addBtn = document.createElement("button");
    addBtn.className = "button button-success";
    addBtn.id = "addBtn";
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Item';

    addBtn.addEventListener("click", addItem);
    // addBtn.addEventListener("click", ()=> {
    //     if(!nameBox.value.trim() || isNaN(quanBox.value) || isNaN(priceBox.value) || !descBox.value.trim() ) {
    //         alert("Please fill all fields with valid values");
    //         return;
    //     }
    //     const existingItem = items.find(item => item.name.toLowerCase() === nameBox.value.trim().toLowerCase());

    //     if (existingItem) {
    //         existingItem.quantity += parseInt(quanBox.value);
    //         localStorage.setItem("items", JSON.stringify(items));
    //         lowerDiv.innerHTML = "";  
    //         items.forEach(i => addToDom(i, lowerDiv));
    //         alert(`Because item already exists so updated quantity of "${nameInput}" by ${quanInput}.`);
    //     } else {
    //         const newItem = {
    //             id: Date.now(),
    //             name: nameBox.value.trim(),
    //             quantity: parseInt(quanBox.value),
    //             price: parseInt(priceBox.value),
    //             description: descBox.value.trim()
    //         };
    //         items.push(newItem);
    //         localStorage.setItem("items", JSON.stringify(items));
    //         lowerDiv.innerHTML = "";
    //         items.forEach(i => addToDom(i, lowerDiv, items));
    //     }

    //     nameBox.value = '';
    //     quanBox.value = '';
    //     priceBox.value = '';
    //     descBox.value = '';
    // })
    buttonsBox.appendChild(addBtn);

    upperDiv.appendChild(inputsBox);
    upperDiv.appendChild(buttonsBox);
    itemsBox.appendChild(upperDiv);

    // items.forEach(item => {
    //     addToDom(item, lowerDiv);
    // })

    renderItems();
}

// Add new item
function addItem() {
    const nameInput = document.querySelector("#nameBox").value.trim();
    const quanInput = parseInt(document.querySelector("#quanBox").value);
    const priceInput = parseFloat(document.querySelector("#priceBox").value);
    const descInput = document.querySelector("#descBox").value.trim();

    if(!nameInput || isNaN(quanInput) || isNaN(priceInput) || !descInput) {
        alert("Please fill all fields with valid values");
        return;
    }

    if(nameInput === "") {
        alert("Item name cannot be empty");
        return;
    }

    const existingItem = items.find(item => item.name.toLowerCase() === nameInput.toLowerCase());

    if(existingItem) {
        existingItem.quantity += quanInput;
        alert(`Item already exists. Quantity increased by ${quanInput}`);
    } else {
        const newItem = {
            id: Date.now(),
            name: nameInput,
            quantity: quanInput,
            price: priceInput,
            description: descInput
        };
        items.push(newItem);
    }

    localStorage.setItem("items", JSON.stringify(items));
    renderItems();
    
    // Clear inputs
    document.querySelector("#nameBox").value = '';
    document.querySelector("#quanBox").value = '';
    document.querySelector("#priceBox").value = '';
    document.querySelector("#descBox").value = '';
}

// Render items with pagination
function renderItems() {
    const lowerDiv = document.createElement("div");
    lowerDiv.className = "lower-div";
    
    // Clear existing items
    const existingLowerDiv = document.querySelector(".lower-div");
    if(existingLowerDiv) existingLowerDiv.remove();

    // Calculate pagination
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if(paginatedItems.length === 0) {
        lowerDiv.textContent = "No items found";
    } else {
        paginatedItems.forEach(item => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "item";
            itemDiv.setAttribute("data-id", item.id);

            const ul = document.createElement("ul");

            const nameLi = document.createElement("li");
            nameLi.innerHTML = `<strong>Name:</strong> ${item.name}`;
            ul.appendChild(nameLi);

            const quanLi = document.createElement("li");
            quanLi.innerHTML = `<strong>Quantity:</strong> ${item.quantity}`;
            ul.appendChild(quanLi);

            const priceLi = document.createElement("li");
            priceLi.innerHTML = `<strong>Price:</strong> $${item.price.toFixed(2)}`;
            ul.appendChild(priceLi);

            const descLi = document.createElement("li");
            descLi.innerHTML = `<strong>Description:</strong> ${item.description}`;
            ul.appendChild(descLi);

            itemDiv.appendChild(ul);

            const btnBox = document.createElement("div");
            btnBox.className = "button-box";

            const delBtn = document.createElement("button");
            delBtn.className = "button button-danger";
            delBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            delBtn.addEventListener("click", () => deleteItem(item.id));
            btnBox.appendChild(delBtn);

            const editBtn = document.createElement("button");
            editBtn.className = "button";
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editBtn.addEventListener("click", () => editItem(item.id));
            btnBox.appendChild(editBtn);

            itemDiv.appendChild(btnBox);
            lowerDiv.appendChild(itemDiv);
        });
    }

    itemsBox.appendChild(lowerDiv);
    renderPagination(totalPages);
}

// Delete item
function deleteItem(id) {
    if(!confirm("Are you sure you want to delete this item?")) return;
    
    items = items.filter(item => item.id !== id);
    localStorage.setItem("items", JSON.stringify(items));
    renderItems();
}

// Edit item
function editItem(id) {
    const item = items.find(item => item.id === id);
    if(!item) return;

    // Fill form with item data
    document.querySelector("#nameBox").value = item.name;
    document.querySelector("#quanBox").value = item.quantity;
    document.querySelector("#priceBox").value = item.price;
    document.querySelector("#descBox").value = item.description;

    // Change add button to update button
    const addBtn = document.querySelector(".Buttons button");
    addBtn.innerHTML = '<i class="fas fa-save"></i> Update Item';
    addBtn.onclick = function() {
        updateItem(id);
    };
}

// Update item
function updateItem(id) {
    const nameInput = document.querySelector("#nameBox").value.trim();
    const quanInput = parseInt(document.querySelector("#quanBox").value);
    const priceInput = parseFloat(document.querySelector("#priceBox").value);
    const descInput = document.querySelector("#descBox").value.trim();

    if(!nameInput || isNaN(quanInput) || isNaN(priceInput) || !descInput) {
        alert("Please fill all fields with valid values");
        return;
    }

    items = items.map(item => {
        if(item.id === id) {
            return {
                ...item,
                name: nameInput,
                quantity: quanInput,
                price: priceInput,
                description: descInput
            };
        }
        return item;
    });

    localStorage.setItem("items", JSON.stringify(items));
    
    // Reset form and button
    document.querySelector("#nameBox").value = '';
    document.querySelector("#quanBox").value = '';
    document.querySelector("#priceBox").value = '';
    document.querySelector("#descBox").value = '';

    const addBtn = document.querySelector(".Buttons button");
    addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Item';
    addBtn.onclick = addItem;

    renderItems();
}

// Render pagination buttons
function renderPagination(totalPages) {
    pagination.innerHTML = '';

    if(totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
        if(currentPage > 1) {
            currentPage--;
            renderItems();
        }
    });
    pagination.appendChild(prevBtn);

    // Page buttons
    for(let i = 1; i <= totalPages; i++) {
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
        if(currentPage < totalPages) {
            currentPage++;
            renderItems();
        }
    });
    pagination.appendChild(nextBtn);
}

// Initialize the page
initUI();
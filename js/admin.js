const nav = document.querySelector(".nav");
const itemsBox = document.querySelector(".items-box");
const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser"));

if(!loggedInUser || !loggedInUser.isAdmin) {
    window.location.href = "index.html";
}

let items = JSON.parse(localStorage.getItem("items")) || [];
if (!localStorage.getItem("items")) {
    localStorage.setItem("items", JSON.stringify([]));
    items = [];
}

// Initialize UI
function initUI() {
    // Navigation
    const heading = document.createElement("h1");
    heading.innerHTML = `Welcome ${loggedInUser.name}`;
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

    renderAdminInterface();
}

function renderAdminInterface() {
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
    addBtn.addEventListener("click", () => {
        const existingUpdNow = document.querySelector("#updNowBtn");
        if (existingUpdNow) existingUpdNow.remove();

        if(!nameBox.value.trim() || isNaN(quanBox.value) || isNaN(priceBox.value) || !descBox.value.trim()) {
            alert("Please fill all fields with valid values");
            return;
        }

        const existingItem = items.find(item => item.name.toLowerCase() === nameBox.value.trim().toLowerCase());

        if (existingItem) {
            existingItem.quantity += parseInt(quanBox.value);
            localStorage.setItem("items", JSON.stringify(items));
            renderItems();
            alert(`Item already exists. Quantity increased by ${quanBox.value}`);
        } else {
            const newItem = {
                id: Date.now(),
                name: nameBox.value.trim(),
                quantity: parseInt(quanBox.value),
                price: parseInt(priceBox.value),
                description: descBox.value.trim()
            };
            items.push(newItem);
            localStorage.setItem("items", JSON.stringify(items));
            renderItems();
        }

        nameBox.value = '';
        quanBox.value = '';
        priceBox.value = '';
        descBox.value = '';
    });
    buttonsBox.appendChild(addBtn);

    upperDiv.appendChild(inputsBox);
    upperDiv.appendChild(buttonsBox);
    itemsBox.appendChild(upperDiv);

    renderItems();
}

function renderItems() {
    const lowerDiv = document.createElement("div");
    lowerDiv.className = "lower-div";
    
    // Clear existing items
    const existingLowerDiv = document.querySelector(".lower-div");
    if(existingLowerDiv) existingLowerDiv.remove();

    if(items.length === 0) {
        lowerDiv.textContent = "No items found";
    } else {
        items.forEach(item => {
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
    nameLi.innerHTML = `<strong>Name:</strong> ${item.name}`;
    ul.appendChild(nameLi);

    const quanLi = document.createElement("li");
    quanLi.classList.add("itemQuantity");
    quanLi.innerHTML = `<strong>Quantity:</strong> ${item.quantity}`;
    ul.appendChild(quanLi);

    const priceLi = document.createElement("li");
    priceLi.classList.add("itemPrice");
    priceLi.innerHTML = `<strong>Price:</strong> &#8377;${item.price.toFixed(2)}`;
    ul.appendChild(priceLi);

    const descLi = document.createElement("li");
    descLi.classList.add("itemDesc");
    descLi.innerHTML = `<strong>Description:</strong> ${item.description}`;
    ul.appendChild(descLi);

    div.appendChild(ul);

    const btnBox = document.createElement("div");
    btnBox.classList.add("button-box");

    const delBtn = document.createElement("button");
    delBtn.className = "button button-danger";
    delBtn.classList.add("deleteBtn");
    delBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    delBtn.addEventListener("click", () => {
        const confirmDelete = confirm(`Are you sure you want to delete "${item.name}"?`);
        if (!confirmDelete) return;

        items = items.filter(i => i.id !== item.id);
        localStorage.setItem("items", JSON.stringify(items));
        div.remove();

        // clear all inputs
        document.querySelector("#nameBox").value = '';
        document.querySelector("#quanBox").value = '';
        document.querySelector("#priceBox").value = '';
        document.querySelector("#descBox").value = '';
    });
    btnBox.appendChild(delBtn);

    const editBtn = document.createElement("button");
    editBtn.className = "button";
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.addEventListener("click", () => {
        const confirmUpdate = confirm(`Are you sure you want to update "${item.name}"?`);
        if (!confirmUpdate) return;

        // Pre-fill the admin input fields
        document.querySelector("#nameBox").value = item.name;
        document.querySelector("#quanBox").value = item.quantity;
        document.querySelector("#priceBox").value = item.price;
        document.querySelector("#descBox").value = item.description;

        // Remove existing Update Now button if any
        const existingUpdNow = document.querySelector("#updNowBtn");
        if (existingUpdNow) existingUpdNow.remove();

        // Disable Add Item button
        const addBtn = document.querySelector("#addBtn");
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.style.cursor = "not-allowed";
        }

        // Disable Logout button
        const logoutBtn = document.querySelector("#logoutBtn") 
        if (logoutBtn) {
            logoutBtn.disabled = true;
            logoutBtn.style.cursor = "not-allowed";
        }

        // disable other Delete buttons too..
        const allDelBtns = document.querySelectorAll(".deleteBtn");
        if(allDelBtns){
            allDelBtns.forEach(button => {
                button.disabled = true;
                button.style.cursor = "not-allowed";
            })
        }

        // Creating Update Now Button
        const updNow = document.createElement("button");
        updNow.id = "updNowBtn";
        updNow.className = "button button-success";
        updNow.innerHTML = '<i class="fas fa-save"></i> Update Now';
        document.querySelector(".Buttons").appendChild(updNow);

        updNow.addEventListener("click", () => {
            let changed = false;
            const nameInput = document.querySelector("#nameBox").value.trim();
            const quanInput = parseInt(document.querySelector("#quanBox").value);
            const priceInput = parseFloat(document.querySelector("#priceBox").value);
            const descInput = document.querySelector("#descBox").value.trim();

            if (nameInput === "") {
                alert("Item name cannot be empty or just spaces. Please enter a valid name.");
                return;
            }

            items = items.map(elem => {
                if (elem.id === item.id) {
                    if (elem.name !== nameInput && nameInput) {
                        elem.name = nameInput;
                        changed = true;
                    }
                    if (elem.quantity !== quanInput && quanInput) {
                        elem.quantity = quanInput;
                        changed = true;
                    }
                    if (elem.price !== priceInput && priceInput) {
                        elem.price = priceInput;
                        changed = true;
                    }
                    if (elem.description !== descInput && descInput) {
                        elem.description = descInput;
                        changed = true;
                    }
                }
                return elem;
            });

            if (changed) {
                localStorage.setItem("items", JSON.stringify(items));
                renderItems();
                updNow.remove();
            } else {
                alert("No changes were made");
            }

            // Re-enable buttons
            if (addBtn) {
                addBtn.disabled = false;
                addBtn.style.cursor = "pointer";
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Item';
            }
            if (logoutBtn) {
                logoutBtn.disabled = false;
                logoutBtn.style.cursor = "pointer";
            }
            if(allDelBtns){
                allDelBtns.forEach(button => {
                    button.disabled = false;
                    button.style.cursor = "pointer";
                })
            }

            updNow.remove();

            document.querySelector("#nameBox").value = '';
            document.querySelector("#quanBox").value = '';
            document.querySelector("#priceBox").value = '';
            document.querySelector("#descBox").value = '';
        });
    });
    btnBox.appendChild(editBtn);

    div.appendChild(btnBox);
    container.appendChild(div);
}

// Initialize the page
initUI();
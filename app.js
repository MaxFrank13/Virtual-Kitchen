var recipes = {
    name: "fried rice",
    ingredients: [
        "rice",
        "carrots",
        "tofu",
        "ginger"
    ],
    name: "lasagna",
    ingredients: [
        "cheese",
        "red sauce",
        "basil",
        "lasagna noodles"
    ], 
    name: "pesto trenette",
    ingredients: [
        "pesto",
        "cheese",
        "noodles"
    ], 
    name: "personal pizzas",
    ingredients: [
        "dough",
        "cheese",
        "red sauce"
    ], 
    name: "burgers",
    ingredients: [
        "buns",
        "burgers",
        "tomato",
        "pickles"
    ], 
    name: "falafel",
    ingredients: [
        "chickpeas",
        "tahini",
        "hummus",
        "pickles"
    ]
}
// App will receive input from a form line (drop-down, checkbox, text) that provides food name, where it belongs, and how long until it expires

// | Variables |

const form = document.querySelector(".grocery-form");
const alert = document.querySelector(".alert");
const grocery = document.getElementById("grocery");
const spot = document.getElementById("location");
const expiration = document.getElementById("expiration");
const submitBtn = document.querySelector(".submit-btn");
const container = document.querySelector(".grocery-container");
const list = document.querySelector(".grocery-list");
const clearBtn = document.querySelector(".clear-btn");

const lctn = spot.value;

let editElement;
let editFlag = false;
let editID = "";

// | Event Listeners |

form.addEventListener("submit", addItem);
clearBtn.addEventListener("click", clearItems);
window.addEventListener("DOMContentLoaded", setupItems);


// | Functions |

function addItem(e) {
    e.preventDefault();
    const value = grocery.value;
    const expire = new Date(expiration.value).getTime();
    const id = new Date().getTime().toString();
    const lctn = spot.value;

    if (!lctn) {
        displayAlert("please indicate where to put item", "danger");
    }
    if (value !== "" && !editFlag) {
        const element = document.createElement("article");
        let attr1 = document.createAttribute("data-id");
        attr1.value = id;
        let attr2 = document.createAttribute("data-expire");
        attr2.value = expire;
        element.setAttributeNode(attr1);
        element.setAttributeNode(attr2);
        element.classList.add("grocery-item");
        element.classList.add(lctn);
        element.innerHTML = `
        <p class="title">${value}</p>
        <div class="btn-container">
          <!-- edit btn -->
          <button type="button" class="edit-btn">
            <i class="fas fa-edit"></i>
          </button>
          <!-- delete btn -->
          <button type="button" class="delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="health-bar" id="${value}"></div>
      `;

      // add event listeners to buttons made in template string
      const deleteBtn = element.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", deleteItem);
      const editBtn = element.querySelector(".edit-btn");
      editBtn.addEventListener("click", editItem);
      
      list.appendChild(element);

      displayAlert("item added to the list", "success");

      container.classList.add("show-container");

      addToLocalStorage(id, value, expire, lctn);
      setBackToDefault();

    } else if (value !== "" && editFlag) {
        editElement.innerHTML = value;
        displayAlert("value changed", "success");
    
        // edit  local storage
        editLocalStorage(editID, value);
        setBackToDefault();
            
      } else {
        displayAlert("please enter value", "danger");
      }
}

function displayAlert(text, action) {
    alert.textContent = text;
    alert.classList.add(`alert-${action}`);

    setTimeout(function () {
        alert.textContent = "";
        alert.classList.remove(`alert-${action}`);
    }, 1000);
}

function clearItems() {
    const items = document.querySelectorAll(".grocery-item");
    if (items.length > 0) {
        items.forEach(function(item) {
            list.removeChild(item);
        });
    }
    container.classList.remove("show-container");
    displayAlert("empty list", "danger");
    setBackToDefault();
    localStorage.removeItem("list");
}

function deleteItem(e) {
    const element = e.currentTarget.parentElement.parentElement;
    console.log(element);
    const id = element.dataset.id;

    list.removeChild(element);

    if (list.children.length === 0) {
        container.classList.remove("show-container");
    }
    displayAlert("item removed", "danger");

    setBackToDefault();

    removeFromLocalStorage(id);
}

function editItem(e) {
    const element = e.currentTarget.parentElement.parentElement;
    editElement = e.currentTarget.parentElement.previousElementSibling;

    grocery.value = editElement.innerHTML;
    editFlag = true;
    editID = element.dataset.id;

    submitBtn.textContent = "edit";
}

function setBackToDefault() {
    grocery.value = "";
    editFlag = false;
    editID = "";
    submitBtn.textContent = "submit";
}


function setHealthBars() {
    let items = getLocalStorage();
    let currentDay = new Date().getTime();
    items = items.map(function(item) {
        const exprTotal = item.expire - item.id;
        const exprRemaining = item.expire - currentDay;
        console.log(item.expire - item.id);
        console.log(item.expire - currentDay);
        const percentRemaining = exprRemaining / exprTotal * 100;
        console.log(percentRemaining);
        console.log(item.value);
        let healthBar = document.getElementById(item.value);
        healthBar.style.width = `${percentRemaining}%`;
        console.log(healthBar);
        if (percentRemaining > 70) {
            healthBar.style.background = "green";
        } else if (percentRemaining > 25) {
            healthBar.style.background = "yellow";
        } else {
            healthBar.style.background = "red";
        }
    })
}

// | Local Storage |

function addToLocalStorage(id, value, expire, lctn) {
    const grocery = { id, value, expire, lctn };
    let items = getLocalStorage();
    items.push(grocery);
    localStorage.setItem("list", JSON.stringify(items));
}

function getLocalStorage() {
    if (localStorage.getItem("list")) {
       return JSON.parse(localStorage.getItem("list"))
    } else {
       return [];
    }
}

function removeFromLocalStorage(id) {
    let items = getLocalStorage();

    items = items.filter(function (item) {
        if (item.id !== id) {
            return item;
        }
    });

    localStorage.setItem("list", JSON.stringify(items));
}

function editLocalStorage(id, value) {
    let items = getLocalStorage();

    items = items.map(function(item) {
        if (item.id === id) {
            item.value = value;
        }
        return item;
    });
    localStorage.setItem("list", JSON.stringify(items));
}

// | Setup Items |

function setupItems() {
    let items = getLocalStorage();

    if (items.length > 0) {
        items.forEach(function(item) {
            createListItem(item.id, item.value, item.expire, item.lctn);
        });
        container.classList.add("show-container");
    }
    setHealthBars();
}

function createListItem(id, value, expire, lctn) {
    const element = document.createElement("article");
    let attr1 = document.createAttribute("data-id");
    attr1.value = id;
    let attr2 = document.createAttribute("data-expire");
    attr2.value = expire;
    element.setAttributeNode(attr1);
    element.setAttributeNode(attr2);
    element.classList.add("grocery-item");
    element.classList.add(lctn)
    element.innerHTML = `<p class="title">${value}</p>
              <div class="btn-container">
                <!-- edit btn -->
                <button type="button" class="edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
                <!-- delete btn -->
                <button type="button" class="delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div class="health-bar" id="${value}"></div>
            `;
    // add event listeners to both buttons;
    const deleteBtn = element.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", deleteItem);
    const editBtn = element.querySelector(".edit-btn");
    editBtn.addEventListener("click", editItem);
  
    // append child
    list.appendChild(element);
}

// App will sort items by where they belong
// Each item will have a health bar indicating how long it has until expiration
// The goal is to provide a pleasant visual representation of the food available in one's kitchen and to also help the user avoid letting anything go to waste
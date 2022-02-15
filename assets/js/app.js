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

let editElement;
let editFlag = false;
let editID = "";

window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    const navbar = document.querySelector(".links-container");
    const topLink = document.querySelector(".top-link");
    const scrollHeight = window.pageYOffset;
    const navHeight = header.getBoundingClientRect().height;
    if (scrollHeight > navHeight) {
        navbar.classList.add("fixed-nav");
    } else {
        navbar.classList.remove("fixed-nav");
    }
    // setup back to top link

    if (scrollHeight > 400) {
        topLink.classList.add("show-link");
    } else {
        topLink.classList.remove("show-link");
    }
});

window.addEventListener("DOMContentLoaded", setHealthBars);

// | Event Listeners |

form.addEventListener("submit", addItem);

clearBtn.addEventListener("click", clearItems);

window.addEventListener("DOMContentLoaded", setupItems);

document.querySelectorAll(".section-img").forEach(item => {
    item.addEventListener("click", expandList)
});

document.querySelectorAll(".close").forEach(item => {
    item.addEventListener("click", minimizeItems)
});

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
    console.log(typeof value);
    console.log(checkLocalStorage(value));
    if (checkLocalStorage(value)) {
        displayAlert("item taken, rewrite name or delete old item from kitchen");
    } else if (value !== "" && !editFlag) {
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
        <div class="health-bar" data-expire="${attr2.value}" id="${value}"></div>
      `;

        // add event listeners to buttons made in template string
        const deleteBtn = element.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", deleteItem);
        const editBtn = element.querySelector(".edit-btn");
        editBtn.addEventListener("click", editItem);

        let lctn_div = document.getElementById(lctn);

        lctn_div.appendChild(element);

        displayAlert("item added to the list", "success");

        container.classList.add("show-container");

        addToLocalStorage(id, value, expire, lctn);
        setBackToDefault();
        setHealthBars();


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

    var elements = document.getElementsByClassName("grocery-item");
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }

    container.classList.remove("show-container");
    displayAlert("empty list", "danger");
    setBackToDefault();
    localStorage.removeItem("list");
}

function deleteItem(e) {
    const element = e.currentTarget.parentElement.parentElement;

    const id = element.dataset.id;
    const lctn = element.classList[1];

    let parent_div = document.getElementById(lctn);

    parent_div.removeChild(element);

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
    items = items.map(function (item) {
        const expire = item.expire - item.id;
        const oneDay = 24 * 60 * 60 * 1000;
        let days = Math.floor(expire / oneDay);
        
        let healthBar = document.getElementById(item.value);
        healthBar.textContent = `${days} days`
        if (days <= 1) {
            healthBar.style.background = "red";
        } else if (days < 10) {
            healthBar.style.background = "yellow";
        } else {
            healthBar.style.background = "green";
        }
        // const exprTotal = item.expire - item.id;
        // const exprRemaining = item.expire - currentDay;
        // const percentRemaining = exprRemaining / exprTotal * 100;
        // if (percentRemaining > 70) {
        //     healthBar.style.background = "green";
        //     healthBar.textContent = `${exprRemaining}`
        // } else if (percentRemaining > 25) {
        //     healthBar.style.background = "yellow";
        // } else {
        //     healthBar.style.background = "red";
        // }
    })
}

function getDaysLeft() {

}

function expandList(e) {
    let target_div = e.currentTarget.nextElementSibling;

    target_div.classList.add("show-section");
    e.currentTarget.classList.add("remove-img");
};

function minimizeItems(e) {
    let target = e.currentTarget.parentElement;

    target.classList.remove("show-section");
    target.previousElementSibling.classList.remove("remove-img");
};

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

    items = items.map(function (item) {
        if (item.id === id) {
            item.value = value;
        }
        return item;
    });
    localStorage.setItem("list", JSON.stringify(items));
}

function checkLocalStorage(grocery) {
    let items = getLocalStorage();
    console.log(items);
    let nameTaken;
    items.forEach(function (item) {
        console.log(item.value);
        if (grocery === item.value) {
            nameTaken = true;
        } else {
            nameTaken = false;
        }
    })
    return nameTaken;
}

// | Setup Items |

function setupItems() {
    let items = getLocalStorage();

    if (items.length > 0) {
        items.forEach(function (item) {
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
    let lctn_div = document.getElementById(lctn);

    lctn_div.appendChild(element);
}

const ids = [715594, 644387, 782601, 794349]
const thisKey = "3083c710a2ee48e6a621d640e9c24d3f";
function getRecipes() {
    // const requestUrl = `https://api.spoonacular.com/recipes/complexSearch?diet=vegan&apiKey=${thisKey}`
    const requestUrl = `https://api.spoonacular.com/recipes/716426/information?apiKey=${thisKey}`
    
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log(data);
        })
}

getRecipes();
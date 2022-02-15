const container = document.querySelector(".container");

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
            container.innerHTML = data.instructions;
            const newLink = document.createElement('a');
            newLink.href = data.sourceUrl;
            newLink.textContent = "Cauliflower Fried Rice";
            container.append(newLink);
        })
}

getRecipes();
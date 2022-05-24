//Elements from html to modify
const pokedex = document.getElementById("pokedex");
const extraInfo = document.getElementById("extra-info");
const evoInfo = document.getElementById("evo-info");
const inputS = document.getElementById("filter");

//Declarations
var allPokemons;
var actualPoke;
var filterP;

//Fetch to get data about all firts 150 pokemons
const fetchPokemonSO = () => {
  const promises = [];
  for (let index = 1; index <= 150; index++) {
    const url = `https://pokeapi.co/api/v2/pokemon/${index}`;
    promises.push(fetch(url).then((res) => res.json()));
  }
  return Promise.all(promises).then((results) => {
    const pokemon = results.map((data) => getData(data));
    return Promise.all(pokemon);
  });
};

//Making an array of the pokemons
function getData(data) {
  return fetch(data.species.url)
    .then((response) => response.json())
    .then((res) => ({
      name: data.name,
      realId: data.id,
      id: getId(data.id),
      image: data.sprites["front_default"],
      extraImage: data.sprites["other"]["official-artwork"]["front_default"],
      type: data.types.map((type) => type.type.name),
      height: (
        Math.round((data.height * 0.328084 + 0.0001) * 100) / 100
      ).toFixed(1),
      weight: (
        Math.round((data.weight * 0.220462 + 0.0001) * 100) / 100
      ).toFixed(1),
      abilities: data.abilities
        .map((ability) => ability.ability.name)
        .join(", "),
      egg_groups: res.egg_groups
        .map((egg_group) => egg_group.name)
        .join(" and "),
      evolutionChain: res["evolution_chain"].url,
    }));
}

//Function to display all pokemons in the sidebar
const displayPokemon = (pokemon) => {
  var num = -1;
  const pokemonHTLM = pokemon
    .map(
      (poki) => `
  <li class="list-p" onclick="showData(this.id)" id="${(num = num + 1)}">
    <img class="img-poki" src=${poki.image} />
    <p class="text-p-n capitalize">${poki.name}<p>
    <p class="text-p-i">${poki.id}</p>
  `
    )
    .join("");
  pokedex.innerHTML = pokemonHTLM;
};

//Function to display general information about the actual pokemon
const displayInfo = (pokemon) => {
  const extrainfoHTML =
    `
  <div class="image-container">
  <img class="img-extra" src=${pokemon.extraImage} />
  <p class="text-e-n capitalize">${pokemon.name}</p>
  <div class="container-e-t">
  ` +
    pokemon.type
      .map((type) => `<p class="text-e-t capitalize">${type}</p>`)
      .join("") +
    `
  </div>
  </div>
  <div class="info-about">
  <h1>Information</h1>
  <span class="text-e-e capitalize"><span class="nen">Weight:</span> ${pokemon.weight} lbs.</span>
  <span class="text-e-e capitalize"><span class="nen">Height:</span> ${pokemon.height} "</span>
  <span class="text-e-e capitalize"><span class="nen">Egg groups: </span>${pokemon.egg_groups}  </span>
  <span class="text-e-e capitalize"><span class="nen">Abilities:</span> ${pokemon.abilities} </span>
  </div>
  `;
  extraInfo.innerHTML = extrainfoHTML;
};

//Function to display when there is no pokemon
const displayNoPokemon = () => {
  const extrainfoHTML = `
  <h1 class="no-p">No Pokemon Found</h1>
  `;
  extraInfo.innerHTML = extrainfoHTML;
  evoInfo.innerHTML = ``;
};

//Function to display the chain evolution
const displayChain = (listEvo) => {
  const extrainfoHTML = listEvo
    .map(
      (evo) =>
        `
  <div class="img-evo">
  <img class="img-extra" src=${evo.img} />
  <p class="text-e-n capitalize">${evo.name}</p>
  </div>
  `
    )
    .join("&#8594");
  evoInfo.innerHTML = extrainfoHTML;
};

//Function to make a decorated id
function getId(number) {
  switch (number.toString().length) {
    case 1:
      return "#00" + number;
    case 2:
      return "#0" + number;
    default:
      return "#" + number;
  }
}

//Mark the li
function showData(id) {
  actualPoke = filterP[id];
  displayInfo(actualPoke);
  evolutionChain(actualPoke.evolutionChain).then((evl) => {
    displayChain(evl);
  });
  $(this).addClass("marked");
}

//Function to display info in the page
function displayAllInfo(pokemons) {
  actualPoke = pokemons[0];
  displayPokemon(pokemons);
  displayInfo(pokemons[0]);
  evolutionChain(actualPoke.evolutionChain).then((evl) => {
    displayChain(evl);
  });
  $(`#pokedex.poke-container li#${0}`).addClass("marked");
}

//Function to get all pokemons in chain evolution
const evolutionChain = async (URLEC) => {
  var chain = [];
  const getURL = await fetch(URLEC);
  const res1 = await getURL.json();
  chain.push(getPoke(res1.chain.species.url)); //Actual Pokemon
  if (
    res1.chain.evolves_to.length !== undefined &&
    res1.chain.evolves_to.length !== 0 //Second evolution
  ) {
    chain.push(getPoke(res1.chain.evolves_to[0].species.url));
    if (
      res1.chain.evolves_to[0].evolves_to[0] !== undefined &&
      res1.chain.evolves_to[0].evolves_to[0] !== 0 //Third evolution
    ) {
      chain.push(getPoke(res1.chain.evolves_to[0].evolves_to[0].species.url));
    }
  }

  return Promise.all(chain).then((results) => {
    return Promise.all(results);
  });
};

//Function to save data pokemon chain evolution
const getPoke = async (url) => {
  const getURL = await fetch(url);
  const res1 = await getURL.json();
  const res2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${res1.id}`);
  const res3 = await res2.json();
  const poke = {
    name: res3.name,
    img: res3.sprites["other"]["official-artwork"]["front_default"],
  };
  return poke;
};

//Document firts charge
$(document).ready(function () {
  $("#filter").on("input", function (e) {
    if (inputS.value == "") {
      displayAllInfo(allPokemons);
    } else {
      filterP = allPokemons.filter((pokemon) =>
        pokemon.name.includes(inputS.value)
      );
      if (filterP.length) {
        displayAllInfo(filterP);
      } else {
        displayPokemon([]);
        displayNoPokemon();
      }
    }
  });
  fetchPokemonSO().then((response) => {
    filterP = response;
    allPokemons = response;
    displayAllInfo(allPokemons);
  });
  $("#pokedex.poke-container li#0").addClass("marked");
});

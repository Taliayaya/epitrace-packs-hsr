// content.js

const browserAPI = typeof browser !== "undefined" ? browser : chrome;

console.log("content.js");

function find_a(el) {
  if (el.tagName == "A") return el;
  return find_a(el.parentElement);
}

// Function to add the current hash to a database
function addHashToDB(hash) {
  browserAPI.storage.local.get({ hashes: [] }).then((result) => {
    let hashes = result.hashes;
    if (!hashes.includes(hash)) {
      hashes.push(hash);
      browserAPI.storage.local.set({ hashes: hashes });
    }
  });
}

// Function to check if the database contains the hash
async function isHashInDB(hash) {
  let result = await browserAPI.storage.local.get({ hashes: [] });
  return result.hashes.includes(hash);
}

// Function to check if the database contains the hash
async function getDB() {
  let result = await browserAPI.storage.local.get({ hashes: [] });
  return result.hashes;
}

let confettiWrapper = document.createElement("div");
confettiWrapper.classList.add("confetti-wrapper");
confettiWrapper.style.zIndex = "9999";
document.body.appendChild(confettiWrapper);

function add_pack_display() {
  if (!document.getElementById("pack-displayer")) {
    let packDisplayer = document.createElement("div");
    packDisplayer.id = "pack-displayer";
    packDisplayer.style.position = "absolute";
    packDisplayer.style.top = "0";
    packDisplayer.style.left = "0";
    packDisplayer.style.width = "100%";
    packDisplayer.style.height = "100%";
    packDisplayer.style.display = "none";
    packDisplayer.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Dark background with opacity
    document.body.appendChild(packDisplayer);
  }
}

function addPackToDisplay(pack) {
  let packDisplayer = document.getElementById("pack-displayer");
  if (packDisplayer) {
    packDisplayer.innerHTML = ""; // Clear previous pack if exists
    packDisplayer.appendChild(pack);
    packDisplayer.style.display = "flex";
    packDisplayer.addEventListener("click", closePackDisplay);
  }
}

function closePackDisplay() {
  let packDisplayer = document.getElementById("pack-displayer");
  if (packDisplayer) {
    packDisplayer.style.display = "none";
    packDisplayer.innerHTML = ""; // Clear the display
    document.location.reload(); // Reload the page to reset the display
  }
}

async function add_open_pack_button(traceSymbol) {
  if (
    traceSymbol.getAttribute("errorstatus") != "" ||
    traceSymbol.getAttribute("status") != "SUCCEEDED"
  )
    return; // Skip error status

  a_tag = find_a(traceSymbol);
  var link = a_tag.href;

  if ((await isHashInDB(link)) == true) return; // Skip if already processed

  let percentage = traceSymbol.getAttribute("successpercent");
  let button = document.createElement("button");
  button.textContent = "1 pull (160 Stellar Jades)";
  button.style.background = "#007BFF";
  button.style.color = "white";
  button.style.border = "none";
  button.style.padding = "5px 10px";
  button.style.cursor = "pointer";
  button.style.margin = "5px";

  traceSymbol.setAttribute("data-processed", "true"); // Prevent duplicate processing
  traceSymbol.style.display = "none";
  traceSymbol.parentNode.insertBefore(button, traceSymbol);

  a_tag.href = "#";
  console.log(a_tag);
  console.log(traceSymbol);

  traceSymbol.setAttribute("link", link);

  a_tag.addEventListener("click", function () {
    openPackAnimation(button, percentage);
  });

  button.addEventListener("click", function () {
    openPackAnimation(button, percentage);
  });
}

async function replaceTraceSymbols() {
  if (document.body.dataset.replaceTraceSymbolsExecuted) {
    return;
  }

  document.body.dataset.replaceTraceSymbolsExecuted = true;

  add_pack_display();
  var alls = document.querySelectorAll("trace-symbol:not([data-processed])");

  for (let i = 0; i < alls.length; i++) {
    await add_open_pack_button(alls[i]);
  }

  if (document.getElementsByClassName("list").length == 0) return;

  var all_in_list = document.getElementsByClassName("list")[0].children;

  var hashes = await getDB();

  for (let i = 0; i < all_in_list.length; i++) {
    var href = all_in_list[i].href;
    console.log(href);
    var is_inside = false;
    for (let j = 0; j < hashes.length; j++) {
      // Ne contient pas, donc je mets la classe en normal + j'enlève l'indicateur
      if (hashes[j].includes(href)) {
        is_inside = true;
      }
    }

    if (!is_inside) {
      all_in_list[i].classList.remove("list__item__secondary");
      var checkMark =
        all_in_list[i].getElementsByClassName("list__item__right")[0];
      if (checkMark) checkMark.innerHTML = "";
    }
  }
}

// Use MutationObserver to track dynamically loaded content
const observer = new MutationObserver(replaceTraceSymbols);
observer.observe(document.body, { childList: true, subtree: true });

replaceTraceSymbols(); // Initial replacement in case elements are already present

function make_confetis() {
  const confettiWrapper = document.querySelector(".confetti-wrapper");
  if (confettiWrapper.children.length > 0) return; // Prevent infinite confetti

  // Generate confetti
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti-piece");
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.setProperty("--fall-duration", `${Math.random() * 3 + 3}s`);
    confetti.style.setProperty("--confetti-color", getRandomColor());
    confettiWrapper.appendChild(confetti);
  }

  setTimeout(() => {
    confettiWrapper.innerHTML = ""; // Remove confetti after animation
  }, 4000);

  function getRandomColor() {
    const colors = ["#ff6347", "#ffa500", "#32cd32", "#1e90ff", "#ff69b4"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

function get_image(percentage) {
  if (percentage == 100) return "icon";
  if (percentage >= 90) return "rare_gold";
  if (percentage >= 80) return "gold";
  if (percentage >= 60) return "silver";
  if (percentage >= 40) return "rare_bronze";
  if (percentage >= 1) return "bronze";
  return "icon"; // im a troller eheheh
}

function get_color(image) {
  if (image == "rare_gold") return "#F6DB7B";
  return "#1e252a";
}

function get_url(percentage) {
  return browserAPI.runtime.getURL("img/" + get_image(percentage) + ".png");
}

function getVideoUrl(percentage) {
  if (percentage == 100) return "video/5star.mp4";
  if (percentage >= 90) return "video/4star.mp4";
  if (true || percentage >= 80) return "video/3star.mp4";
  if (percentage >= 60) return "video/2star.mp4";
  if (percentage >= 40) return "video/1star.mp4";
  return "video/0star.mp4";
}

let href = "";

async function openPackAnimation(button, inputPercentage) {
  function main_pack() {
    return browserAPI.runtime.getURL("img/pack.png");
  }

  let pack = document.createElement("div");
  pack.classList.add("pack");
  pack.style.backgroundImage = `url(${main_pack()})`;
  let pack_text = document.createElement("span");
  pack_text.classList.add("text-pack");
  pack.appendChild(pack_text);

  let video = document.createElement("video");
  video.setAttribute('id', 'hsrpull');
  video.setAttribute('width', '1920');
  video.setAttribute('height', '1080');
  video.setAttribute('preload', 'auto');

  let source = document.createElement('source');
  source.setAttribute('type', 'video/mp4');
  source.setAttribute('src', browser.runtime.getURL(getVideoUrl(inputPercentage)));

  video.appendChild(source);
  pack.appendChild(video);

  addPackToDisplay(pack);
  video.play();
  video.addEventListener('ended', () => {
    //button.parentNode.insertBefore(pack, button);
    pack.classList.add("spinning");

    href = button.parentElement
      .getElementsByTagName("trace-symbol")[0]
      .getAttribute("link");

    /*for (let i = 0; i < 3; i++) {
      let randomPercentage = ; // Random percentage between 0 and 100
      
    }*/
    setTimeout(() => {
      video.remove();
      let currentPercentage = 100;
      let decreaseTime = 1000; // 1 second total decrease time
      let steps = 0; // Number of steps
      let stepTime = decreaseTime / steps;

      let percentages = [
        Math.floor(Math.random() * 100),
        //Math.floor(Math.random() * 100),
        inputPercentage,
      ];

      pack_text.style.color = get_color(get_image(currentPercentage));

      let i = 0;

      let decrement = (100 - percentages[i]) / steps;

      let interval = setInterval(() => {
        if (currentPercentage > percentages[i]) {
          // Generate a random variation
          currentPercentage -= decrement;
          currentPercentage = Math.max(currentPercentage, percentages[i]); // Ensure it doesn't go below target

          pack_text.textContent = Math.floor(currentPercentage);
          pack_text.style.color = get_color(get_image(currentPercentage));
          pack.style.backgroundImage = `url(${get_url(currentPercentage)})`;
        } else {
          pack_text.textContent = percentages[i];

          pack.style.backgroundImage = `url(${get_url(currentPercentage)})`;

          if (i == percentages.length - 1) {
            clearInterval(interval);
            if (percentages[i] == 100) {
              make_confetis();
            } else if (percentages[i] == 0) {
              pack.style.backgroundImage = `url(${browserAPI.runtime.getURL(
                "img/rip_bozo.jpg"
              )})`;

              pack.style.width = "744px";
              pack.style.height = "609px";
              pack_text.style.display = "none";
            }

            pack.style.cursor = "pointer";

            let span = document.createElement("span");
            span.textContent = "Click on the card to see your trace";
            span.style.color = "white";
            span.style.position = "absolute";
            span.style.bottom = "10px";
            span.style.left = "50%";
            span.style.transform = "translateX(-50%)";
            span.style.fontSize = "20px";
            span.style.fontWeight = "bold";
            document.getElementById("pack-displayer").appendChild(span);

            addHashToDB(href);

            pack.addEventListener("click", function () {
              document.location.href = href;
            });
          }

          i++;

          decrement = (100 - percentages[i]) / steps;
          currentPercentage = 100;
        }
      }, stepTime);
    }, 1000);
  });
}

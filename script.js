const navigation = document.querySelector("#site-navigation");
const menuButton = document.querySelector(".menu-toggle");
const navLinks = [...navigation.querySelectorAll("a")];
document.documentElement.classList.add("menu-ready");

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", event => {
  const link = event.target.closest("a");
  if (!link || !navigation.classList.contains("is-open") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const section = document.querySelector(link.hash);
  const heading = section.querySelector("h2");
  event.preventDefault();
  setMenu(false);
  if (location.hash !== link.hash) history.pushState(null, "", link.hash);
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
  section.scrollIntoView();
});

document.addEventListener("click", event => {
  if (!event.target.closest(".header-inner")) setMenu(false);
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape" || !navigation.classList.contains("is-open")) return;
  setMenu(false);
  menuButton.focus();
});

matchMedia("(max-width: 670px)").addEventListener("change", () => setMenu(false));

const pageSections = [...document.querySelectorAll("main section[id]")];
const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.find(entry => entry.isIntersecting);
  if (!visible) return;
  for (const link of navLinks) {
    if (link.hash === "#" + visible.target.id) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}, { rootMargin: "-23% 0px -61% 0px" });
pageSections.forEach(section => sectionObserver.observe(section));

const cards = [...document.querySelectorAll("#project-grid .project-card")];
const filters = document.querySelector(".filters");
const filterButtons = [...filters.querySelectorAll("button")];
const filterStatus = document.querySelector("#filter-status");

filters.hidden = false;
filters.addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  const active = button.dataset.filter;
  let count = 0;
  for (const option of filterButtons) {
    option.setAttribute("aria-pressed", String(option === button));
  }
  for (const card of cards) {
    card.hidden = active !== "all" && card.dataset.category !== active;
    if (!card.hidden) count += 1;
  }
  filterStatus.textContent = count === 1 ? "1 work sample shown." : count + " work samples shown.";
});

const projects = {
  forma: {
    type: "WordPress business site",
    description: "A homepage for an architecture studio, with project photography and an easy-to-find contact link.",
    details: [
      "A compact navigation with clear links to the studio, projects, and contact pages.",
      "A large hero image with a text overlay that stays readable as the layout narrows.",
      "A homepage structure that can accommodate new project entries over time."
    ],
    credit: "Render by Maverick Frame",
    source: "https://unsplash.com/photos/architectural-concrete-structure-surrounded-by-green-fields-and-trees-J2Y59Q042eg"
  },
  clay: {
    type: "WooCommerce storefront",
    description: "A storefront for ceramic tableware that helps shoppers discover the collection.",
    details: [
      "A straightforward shop menu with space for the store story and shopping bag.",
      "Product photography and plain, descriptive category names to help shoppers browse.",
      "A mobile layout that stacks the collection photo above the introduction."
    ],
    credit: "Photo by Magdalena Raczka",
    source: "https://unsplash.com/photos/various-ceramic-bowls-and-kitchen-utensils-arranged-decoratively-BU25z-gf4N4"
  },
  north: {
    type: "Elementor landing page",
    description: "A travel journal homepage that uses landscape photography to introduce stories from the trail.",
    details: [
      "A compact masthead with separate routes to the journal and field notes.",
      "An image-led hero with a consistent type hierarchy and a legible overlay.",
      "A responsive crop that keeps the strongest part of the landscape visible on phones."
    ],
    credit: "Photo by Mohammad Bahadori",
    source: "https://unsplash.com/photos/misty-mountains-with-green-slopes-and-dark-clouds-3TOyzKHkShw"
  }
};

const dialog = document.querySelector("#project-dialog");
const dialogType = document.querySelector("#dialog-type");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogPreview = document.querySelector("#dialog-preview");
const dialogDetails = document.querySelector("#dialog-details");
const photoCredit = document.querySelector("#photo-credit");
const previewButtons = [...dialog.querySelectorAll("[data-preview]")];
let projectTrigger;

function setPreview(size) {
  dialogPreview.classList.toggle("is-mobile", size === "mobile");
  for (const button of previewButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.preview === size));
  }
}

function openProject(card, trigger) {
  const project = projects[card.dataset.project];
  dialogType.textContent = project.type + " concept";
  dialogTitle.textContent = card.querySelector("h3").textContent;
  dialogDescription.textContent = project.description;

  const preview = card.querySelector(".browser-shot").cloneNode(true);
  preview.querySelector("img").loading = "eager";
  dialogPreview.replaceChildren(preview);
  dialogDetails.replaceChildren(...project.details.map(detail => {
    const item = document.createElement("li");
    item.textContent = detail;
    return item;
  }));

  const credit = document.createElement("a");
  credit.href = project.source;
  credit.target = "_blank";
  credit.rel = "noopener";
  credit.textContent = project.credit + " on Unsplash";
  photoCredit.replaceChildren(credit);

  projectTrigger = trigger;
  setPreview("desktop");
  dialog.showModal();
  dialog.scrollTop = 0;
}

if (typeof dialog.showModal === "function") {
  for (const card of document.querySelectorAll(".concept-grid .project-card")) {
    const trigger = card.querySelector(".project-open");
    trigger.hidden = false;
    trigger.addEventListener("click", () => openProject(card, trigger));
  }
  for (const button of previewButtons) {
    button.addEventListener("click", () => setPreview(button.dataset.preview));
  }
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => projectTrigger?.focus());
}

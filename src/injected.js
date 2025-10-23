(function() {
  const dom = function(tagName, options, children) {
    const element = document.createElement(tagName);
    for(const style in options.style) {
      if(Object.prototype.hasOwnProperty.call(options.style, style)) {
        element.style[style] = options.style[style];
      }
    }
    options.id && (element.id = options.id);
    options.href && (element.href = options.href);
    options.class && (element.className = options.class);
    options.text && (element.innerText = options.text);
    if(options.onClick) element.addEventListener("click", _ => options.onClick, false);
    if(children && children.length !== 0) element.append(...children);
    return element;
  }
  dom.string = function(text) {
    const parser = new DOMParser();
    const html = parser.parseFromString(text, "text/html");
    const images = Array.from(html.getElementsByTagName("img"));
    for(let image of images) {
      if(image.closest("a")) {
        const alt = image.alt;
        image.replaceWith(dom("p", {
          class: "replace-image",
          text: alt && alt !== "" ? alt : "Link"
        }))
      } else {
        image.remove();
      }
    }
    return Array.from(html.body.children);
  }

  class DisplayBuilder {
    element;
    children;
    body;
    constructor() {
      this.element = dom("div", {
        id: "MyMSU Minus Display Builder",
        style: {
          "padding-top": "4em",
          "padding-right": "1em",
          "padding-left": "1em"
        }
      });
      this.element.attachShadow({mode: "open"})
      this.body = dom("div", {
        id: "body",
        style: {
          all: "initial"
        }
      })
      this.element.shadowRoot.appendChild(this.body);
      this.children = [];

      if(document.getElementById("root")) {
        this.attach(document.getElementById("root"));
      } else {
        const observer = new MutationObserver(mutations => {
          if (document.getElementById("root")) {
            observer.disconnect();
            this.attach(document.getElementById("root"));
          }
        });
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
    }
    append(child, sortBy) {
      debugger;
      const childPair = {
        sortBy: sortBy,
        child: child
      }
      if(this.children.length === 0) {
        this.children.push(childPair)
        this.body.appendChild(child);
      } else {
        const index = this.children.findIndex(el => {
          return el.sortBy.localeCompare(sortBy) >= 0
        })
        if(index === -1) {
          this.children.push(childPair)
          this.body.appendChild(child);
        } else {
          const afterChild = this.children[index].child;
          this.children.splice(index, 0, childPair)
          this.body.insertBefore(child, afterChild)
        }
      }
    }

    attach(element) {
      element.parentElement.insertBefore(this.element, element);
    }

    addItem(data, card) {
      const title = [
        dom("span", {
          class: "card-title",
          text: card.title
        }),
      ]
      if (card.externalLinkUrl) {
        title.push(
          dom("a", {
            class: "title-link",
            text: card.externalLinkLabel && card.externalLinkLabel !== "" ? card.externalLinkLabel : "Link",
            href: card.externalLinkUrl
          }),
        )
      }
      const item = dom("div", {class: "flattened-card"}, [
        dom("span", {class: "title-container"}, title),
        dom("div", {class: "card-contents"}, dom.string(data))
      ])
      this.append(item, card.title);
    }
  }

  const displayBuilder = new DisplayBuilder();

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [resource, config] = args;

    function overrideJson(contains, callback) {
      /* We cannot throw an error here. If any problem occurs, we need to pretend that everything is fine,
       * and just return the original fetch result */
      try {
        const index = resource.indexOf(contains)
        if (index !== -1) {
          response.json = () =>
            response
              .clone()
              .json()
              .then((data) => callback(data, index));
        }
      } catch (_) {
      }
    }
    function handleCard(card) {
      const resourceURL = "https://experience.elluciancloud.com/api/embedded-html/" + card.id
      fetch(resourceURL)
        .then(response => response.json())
        .then(data => {
          displayBuilder.addItem(data, card)
        });
    }

    const response = await originalFetch.call(this, ...args);
    overrideJson("api/locked-cards", (data) => {
      if (config.method === "GET" || !config.method) data.cards = []; // Remove list of locked cards
      return data;
    });
    overrideJson("api/preferences", (data) => {
      if (config.method === "GET" || !config.method) {
        data.dashboard.cards = data.dashboard.cards.filter((item) => {
          return !item.isLocked;
        }); // Remove locked cards from preferences
      }
      return data;
    });
    overrideJson("api/dashboard-load", (data) => {
      if (config.method === "GET" || !config.method) {
        data.announcements = data.announcements.filter((item) => {
          return item.externalLinkUrl !== "https://www.montana.edu/uit/mymsu";
        });
        for (const card of data.cardsConfiguration) {
          switch (card.type) {
            case "WysiwygCard":
              handleCard(card);
              break;
            default:
              console.log("Unsupported type: " + card.type);
          }
        }
      }
      return data;
    });
    return response;
  };
})()
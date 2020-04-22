/* global $*/
import {
  Product
} from './components/Product.js';
import {
  Cart
} from './components/Cart.js';
import {
  select,
  settings,
  classNames,
  templates
} from './settings.js';
import {
  Booking
} from './components/Booking.js';

const app = {
  initMenu: function () {
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);
    for (let productData in thisApp.data.products) {
      // was before ajax - new Product(productData, thisApp.data.products[productData]);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        //console.log('parsedResponse:', parsedResponse);
        //save parsedreposne as thisapp.data.products
        thisApp.data.products = parsedResponse;
        //execute init menu method
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initPages() {
    const thisApp = this;

    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));
    thisApp.activatePage(thisApp.pages[0].id);
    //thisApp.activatePage(thisApp.pages[0].id); - aktywujemy 1 podstrone z szeregu naszego. change for:
    let pagesMatchingHash = [];

    if (window.location.hash.length > 2) {
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function (page) {
        return page.id == idFromHash;
      });
      thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    }

    for (let link of thisApp.navLinks) { //wywołanie strony po kliknięciu na link w zasadzie.
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        // tO DO get page id from href
        const href = clickedElement.getAttribute('href');

        const id = href.replace('#', '');

        //tO DO activate page
        thisApp.activatePage(id);

        if (id.length == 5) {
          const cart = document.getElementById('cart');
          cart.classList.add('exist');
        }
      });
    }
  },

  activatePage(pageId) {
    const thisApp = this;

    for (let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId); //jeśli link jest taki sam jak id naszej podstrony nadaj mu klasę active.
    }

    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.getAttribute('id') == pageId); //jesli id strony jest równe naszemy pageId czyli argumentowi tej funckji nadajemy jej klase active.
    }

    window.location.hash = '#/' + pageId; //zeby po odswiezeniu nie zmieniala sie podstrona i nie przewijała do elementu o id booking tylko pokazywala z samej gory

    console.log('aktywowano podstronę:', pageId);
  },

  init: function () { //lista tresci skryptu
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initCarousel();
  },

  initBooking() {
    //znajduje kontener widgetu do rezerwacji stron, którego selektor mamy zapisany w select.containerOf.booking,

    const widgetContainer = document.querySelector(select.containerOf.booking);

    //tworzy nową instancję klasy Booking, którą za chwilę stworzymy, przekazując jej konstruktorowi znaleziony kontener widgetu,

    new Booking(widgetContainer);

    //jest wykonywana na końcu metody app.init.
  },

  initCarousel() {
    const thisApp = this;
    $('.carousel').carousel({
      interval: 3000
    });

    const logo = document.querySelector('.logo');

    logo.addEventListener('click', function () {
      thisApp.initPages();
    });
  }

};

app.init();

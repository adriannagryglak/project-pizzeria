import {
  templates,
  select,
  settings,
  classNames
} from '../settings.js';
import {
  utils
} from '../utils.js';
import {
  AmountWidget
} from './AmountWidget.js';
import {
  DatePicker
} from './DatePicker.js';
import {
  HourPicker
} from './HourPicker.js';


export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element) {
    const thisBooking = this;

    //generować kod HTML za pomocą szablonu templates.bookingWidget bez podawanie mu jakiegokolwiek argumentu,

    const generatedHTML = templates.bookingWidget();

    //tworzyć pusty obiekt thisBooking.dom,

    thisBooking.dom = {};

    //zapisywać do tego obiektu właściwość wrapper równą otrzymanemu argumentowi,

    thisBooking.dom.wrapper = element;

    //zawartość wrappera zamieniać na kod HTML wygenerowany z szablonu,

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    //we właściwości thisBooking.dom.peopleAmount zapisywać pojedynczy element znaleziony we wrapperze i pasujący do selektora select.booking.peopleAmount,

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);

    //analogicznie do peopleAmount znaleźć i zapisać element dla hoursAmount.

    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.address = element.querySelector(select.booking.address);
    thisBooking.dom.phone = element.querySelector(select.booking.phone);
    thisBooking.dom.starters = element.querySelectorAll(select.booking.starter);



  }

  initWidgets() {
    const thisBooking = this;

    //we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.wrapper.addEventListener('submit', function () {
      event.preventDefault();
      thisBooking.sendBooking();
      thisBooking.getData();
    });

  }

  getData() {
    const thisBooking = this;

    const startEndDates = {}; //obiekt z zawartymi min (dzis) i max (za 2 tyg) date
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey]; //tu mozna by zapisac to samo co jest wyzej?

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };


    const urls = { //pelne adresy zapytan
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function ([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) { //three arrays with data received from API 
    const thisBooking = this;

    thisBooking.booked = {};
    //console.log('current events : ', eventsCurrent);

    for (let event of eventsCurrent) {

      //console.log('event from events current', event);
      thisBooking.makeBooked(event.date, event.hour, event.table, event.duration);
    }


    for (let event of bookings) {
      //console.log('event from bookings', event);
      thisBooking.makeBooked(event.date, event.hour, event.table, event.duration);
    }


    for (let event of eventsRepeat) {

      const minDate = thisBooking.datePicker.minDate;
      const maxDate = thisBooking.datePicker.maxDate;
      //console.log('event from events repeat', event);

      if (event.repeat == 'daily') {
        for (let dayDate = minDate; dayDate <= maxDate; dayDate = utils.addDays(dayDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(dayDate), event.hour, event.table, event.duration);
        }
      }
    }

    console.log('events BOOKED', thisBooking.booked);
    thisBooking.updateDOM(); //to initiate updatedom even when we reloud the site
  }

  makeBooked(date, hour, table, duration) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      if (thisBooking.booked[date][hourBlock].indexOf(table) == -1) {
        thisBooking.booked[date][hourBlock].push(table);
      }
    }

  }

  updateDOM() {
    const thisBooking = this;

    console.log('updated dom');

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value); //aktualne data i h

    for (let table of thisBooking.dom.tables) {
      let tableNr = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableNr)) {
        tableNr = parseInt(tableNr);
      }

      if (typeof thisBooking.booked[thisBooking.date] !== 'undefined' && typeof thisBooking.booked[thisBooking.date][thisBooking.hour] !== 'undefined' && thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(tableNr) > -1) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.tableChoosed);
      }

      //miejsce w ktorym mam potrzebne rzeczy

      table.addEventListener('click', function () {
        console.log('KLIKNELAM W STOL');
        // table.classList.toggle(classNames.booking.tableChoosed);

        const tableChoosed = table.classList.contains(classNames.booking.tableBooked);
        if (!tableChoosed) {
          table.classList.add(classNames.booking.tableBooked);
          table.classList.add(classNames.booking.tableChoosed);
          thisBooking.tableIsBooked = tableNr;
        }
      });
    }

  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.tableIsBooked,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      address: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value,
    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked == true) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponseBOOKING', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour, payload.table, payload.duration);
      });

    
  }

}

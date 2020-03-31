import {
  templates,
  select,
  settings
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

  }

  initWidgets() {
    const thisBooking = this;

    //we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

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

    console.log('getData params', params);

    const urls = { //pelne adresy zapytan
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

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
    console.log('current events : ', eventsCurrent);

    for (let event of eventsCurrent) {

      console.log('event from events current', event);
      thisBooking.makeBooked(event.date, event.hour, event.table, event.duration);
    }


    for (let event of bookings) {
      console.log('event from bookings', event);
      thisBooking.makeBooked(event.date, event.hour, event.table, event.duration);
    }


    for (let event of eventsRepeat) {

      const minDate = thisBooking.datePicker.minDate;
      const maxDate = thisBooking.datePicker.maxDate;
      console.log('event from events repeat', event);

      if (event.repeat == 'daily') {
        for (let dayDate = minDate; dayDate <= maxDate; dayDate = utils.addDays(dayDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(dayDate), event.hour, event.table, event.duration);
        }
      }
    }

    console.log('events BOOKED', thisBooking.booked);
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


}

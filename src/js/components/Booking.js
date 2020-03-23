import {
  templates,
  select
} from '../settings.js';
import {
  AmountWidget
} from './AmountWidget.js';


export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
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

  }

  initWidgets() {
    const thisBooking = this;

    //we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);


  }
}

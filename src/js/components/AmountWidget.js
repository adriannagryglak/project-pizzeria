import {
  settings,
  select
} from '../settings.js';
import {
  BaseWidget
} from './BaseWidget.js';

export class AmountWidget extends BaseWidget {

  constructor(wrapper) {
    super(wrapper, settings.amountWidget.defaultValue); // constuctor BaseW.
    const thisWidget = this;

    thisWidget.getElements();
    //thisWidget.value = settings.amountWidget.defaultValue; - BaseW.
    //thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    //console.log('amountwidget : ', thisWidget);
  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(newValue) { //was setValue method
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.value--;
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.value++;
    });
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

}

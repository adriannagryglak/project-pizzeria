import {
  BaseWidget
} from './BaseWidget.js';

import {
  utils
} from '../utils.js';
import {
  select,
  settings
} from '../settings.js';


export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value); //date and hour now
    thisWidget.maxDate = new Date(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));

    //TO DO initiate plugin flatpickr

    flatpickr(thisWidget.dom.input, {
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      defaultDate: thisWidget.minDate,
      'disable': [
        function (date) {
          // return true to disable
          return (date.getDay() === 1);
        }
      ],
      'locale': {
        'firstDayOfWeek': 1
      },
      onChange: function (selectedDates, dateStr, instance) {
        thisWidget.value = dateStr;
      },
    });

  }

  parseValue(newValue) {
    return newValue;
  }

  isValid() {
    return true;
  }

  renderValue() {}

}

import moment from 'moment';

export default function purifyWeek(week) {
  // This ensures that week 0 will become week 52 and that week 53 will become
  // week 1. This also accounts for leap years. Because date logic can be so
  // complicated we off load it to moment.js so that we can be sure it's bug
  // free.
  return moment().week(week).week();
}

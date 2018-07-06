import { push } from 'connected-react-router';
import queryString from 'query-string';
import users from '../users';
import { selectUser, selectWeek, selectCurrentWeek } from './selectors';
import purifyWeek from '../lib/purifyWeek';
import withinRange from '../lib/withinRange';
import extractSchedule from '../lib/extractSchedule';
import rejectIfBadStatus from '../lib/rejectIfBadStatus';

function updatePathname(pathname = '') {
  return (dispatch, getState) => {
    const query = getState().router.location.search;
    dispatch(push(`/${pathname}${query}`));
  };
}

function updateQuery(newQuery) {
  return (dispatch, getState) => {
    const { location } = getState().router;
    const query = queryString.stringify({
      ...queryString.parse(location.search),
      ...newQuery,
    });

    dispatch(push(`${location.pathname}?${query}`));
  };
}

export function setUser(newUser) {
  return (dispatch) => {
    dispatch({ type: 'SEARCH/RESET' });
    dispatch(updatePathname(newUser));
  };
}

export function shiftRoom(shift) {
  return (dispatch, getState) => {
    const state = getState();
    const user = selectUser(state);
    const { allRoomIds } = users;

    if (users.byId[user].type !== 'r') throw new Error('User must be a room');

    const currentRoom = user;
    const currentRoomIndex = allRoomIds.indexOf(currentRoom);
    const nextRoomIndex = withinRange(
      currentRoomIndex + shift,
      allRoomIds.length - 1,
    );
    const nextRoom = allRoomIds[nextRoomIndex];

    dispatch(setUser(nextRoom));
  };
}

export function setWeek(newWeek) {
  return (dispatch, getState) => {
    const state = getState();
    const isCurrentWeek = selectCurrentWeek(state) === newWeek;

    dispatch(updateQuery({
      week: isCurrentWeek ? undefined : newWeek,
    }));
  };
}

export function shiftWeek(shift) {
  return (dispatch, getState) => {
    const state = getState();
    const week = selectWeek(state);
    dispatch(setWeek(purifyWeek(week + shift)));
  };
}

export function showRoomFinder() {
  return (dispatch, getState) => {
    const state = getState();
    const user = selectUser(state);

    if (user == null || users.byId[user].type !== 'r') {
      // We are not currently viewing a room, correct the situation.
      dispatch(setUser(users.allRoomIds[0]));
    }

    dispatch({ type: 'ROOM_FINDER/SHOW' });
  };
}

const fetchScheduleStart = (user, week) => ({
  type: 'VIEW/FETCH_SCHEDULE_START', user, week,
});

const fetchScheduleSuccess = (user, week, htmlStr) => ({
  type: 'VIEW/FETCH_SCHEDULE_SUCCESS', user, week, htmlStr,
});

const fetchScheduleError = (user, week, statusCode) => ({
  type: 'VIEW/FETCH_SCHEDULE_ERROR', user, week, statusCode,
});


export function fetchScheduleIfNeeded(user, week) {
  return (dispatch, getState) => {
    const { schedules } = getState();
    const schedule = extractSchedule(schedules, user, week);

    if (schedule.state !== 'NOT_REQUESTED') {
      return;
    }

    dispatch(fetchScheduleStart(user, week));

    fetch(`/get/${user}?week=${week}`)
      .then(rejectIfBadStatus)
      .then(r => r.text())
      .then(
        // success
        (htmlStr) => {
          dispatch(fetchScheduleSuccess(user, week, htmlStr));
        },

        // error
        (statusCode) => {
          // TODO: Handle error status
          dispatch(fetchScheduleError(user, week, statusCode));
        },
      );
  };
}

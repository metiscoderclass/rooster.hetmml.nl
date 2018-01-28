export default function extractSchedule(schedules, user, week) {
  const scheduleExists =
    schedules.hasOwnProperty(user) && schedules[user].hasOwnProperty(week);

  if (!scheduleExists) {
    return { state: 'NOT_REQUESTED' };
  }

  return schedules[user][week];
}

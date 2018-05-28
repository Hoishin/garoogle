'use strict';

const GaroonSoap = require('garoon-soap');

const garoon = new GaroonSoap(
  process.env.GAROON_URL,
  process.env.GAROON_MY_NAME,
  process.env.GAROON_MY_PASSWORD
);
const ignoredPlans = process.env.PLAN_FILTER.split(',').map((s) => s.trim());

async function getEvents() {
  const start = new Date();
  const end = new Date();

  end.setDate(start.getDate() + (Number(process.env.TERM) || 30));

  const res = await garoon.schedule.getEvents(start, end);

  return res.filter((e) => !ignoredPlans.includes(e.plan));
}

async function addEvents(arr) {
  return await garoon.schedule.addEvents(arr);
}

/*
{ id: '4226798',
  eventType: 'normal',
  version: '1527403075',
  publicType: 'private',
  plan: '外出',
  detail: 'Title',
  description: undefined,
  timezone: 'Asia/Tokyo',
  endTimezone: 'Asia/Tokyo',
  allday: false,
  startOnly: false,
  members: { users: [Array], organizations: [], facilities: [] },
  observers: { users: [], organizations: [], roles: [] },
  when: { datetimes: [Array], dates: [] },
  follows: [],
  files: [],
  removeFileIds: [] },
*/
async function modifyEvents(arr) {
  return await garoon.schedule.modifyEvents(arr);
}

async function deleteEvents(arr) {
  return await garoon.schedule.removeEvents(arr);
}

function formatSchema(event) {
  const { when, plan, publicType } = event;

  let startTime, endTime;

  // TODO: wip
  if (event.eventType === 'repeat') {
  }

  if (when === undefined) return null;

  // TODO: なんで配列なのか調べてないので、とりあえず0番目だけ
  if (when.dates.length !== 0) {
    // 一日以上予定
    startTime = when.dates[0].start;
    endTime = when.dates[0].end;
  } else if (when.datetimes.length !== 0) {
    // 時間指定
    startTime = when.datetimes[0].start;
    endTime = when.datetimes[0].end;
  }

  const summary = `${event.plan ? `${event.plan}: ${event.detail}` : event.detail}`.trim();

  return {
    startTime,
    endTime,
    summary,
    members: JSON.stringify(event.members),
    private: publicType === 'private',
    description: event.description
  };
}

module.exports = {
  getEvents,
  addEvents,
  modifyEvents,
  deleteEvents,
  formatSchema
};

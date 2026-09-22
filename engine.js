/* PetMeds engine - pure functions for pet medication supply and dose tracking. */
(function (root) {
  'use strict';
  var DAY = 86400000;
  var nextId = 1;
  function uid() { return 'm' + (nextId++) + '-' + Math.random().toString(36).slice(2, 8); }
  function toMs(date) { return new Date(date + 'T00:00:00Z').getTime(); }
  function plusDays(date, n) { return new Date(toMs(date) + n * DAY).toISOString().slice(0, 10); }

  function addMed(list, pet, name, pillsPerDose, dosesPerDay, pillsOnHand) {
    pet = (pet || '').trim(); name = (name || '').trim();
    pillsPerDose = Number(pillsPerDose); dosesPerDay = Number(dosesPerDay); pillsOnHand = Number(pillsOnHand);
    if (!pet) throw new Error('which pet?');
    if (!name) throw new Error('medication needs a name');
    if (!isFinite(pillsPerDose) || pillsPerDose <= 0 || pillsPerDose > 50) throw new Error('pills per dose must be 0..50');
    if (!isFinite(dosesPerDay) || dosesPerDay < 0.25 || dosesPerDay > 6) throw new Error('doses per day must be 0.25..6');
    if (!isFinite(pillsOnHand) || pillsOnHand < 0 || pillsOnHand > 10000) throw new Error('pills on hand must be 0..10000');
    var m = {
      id: uid(), pet: pet, name: name,
      pillsPerDose: pillsPerDose, dosesPerDay: dosesPerDay,
      pillsOnHand: pillsOnHand, log: []
    };
    list.push(m);
    return m;
  }

  function removeMed(list, id) {
    var n = list.length;
    var kept = list.filter(function (m) { return m.id !== id; });
    list.length = 0;
    kept.forEach(function (m) { list.push(m); });
    return kept.length < n;
  }

  function giveDose(med, date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('date must be YYYY-MM-DD');
    if (med.pillsOnHand < med.pillsPerDose) throw new Error('not enough pills left - refill first');
    med.pillsOnHand -= med.pillsPerDose;
    med.log.push({ date: date, pills: med.pillsPerDose });
    return med;
  }

  function refill(med, pills) {
    pills = Number(pills);
    if (!isFinite(pills) || pills <= 0 || pills > 10000) throw new Error('refill must be 1..10000 pills');
    med.pillsOnHand += pills;
    return med;
  }

  function dailyUse(med) { return med.pillsPerDose * med.dosesPerDay; }

  function daysLeft(med) {
    var use = dailyUse(med);
    if (use <= 0) return Infinity;
    return Math.floor(med.pillsOnHand / use);
  }

  function runoutDate(med, today) {
    var d = daysLeft(med);
    if (d === Infinity) return null;
    return plusDays(today, d);
  }

  function status(med) {
    var d = daysLeft(med);
    if (med.pillsOnHand < med.pillsPerDose) return 'out';
    if (d <= 3) return 'critical';
    if (d <= 7) return 'order soon';
    return 'ok';
  }

  function summary(list, today) {
    var out = { meds: list.length, out: 0, critical: 0, orderSoon: 0, ok: 0 };
    list.forEach(function (m) {
      var s = status(m);
      if (s === 'out') out.out++;
      else if (s === 'critical') out.critical++;
      else if (s === 'order soon') out.orderSoon++;
      else out.ok++;
    });
    return out;
  }

  var api = { addMed: addMed, removeMed: removeMed, giveDose: giveDose, refill: refill, dailyUse: dailyUse, daysLeft: daysLeft, runoutDate: runoutDate, status: status, summary: summary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PetMeds = api;
})(typeof window !== 'undefined' ? window : this);

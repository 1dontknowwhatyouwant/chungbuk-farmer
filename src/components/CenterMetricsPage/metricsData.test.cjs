// Run: node --experimental-strip-types --test src/components/CenterMetricsPage/metricsData.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const { assignmentMetrics, inPeriod, unavailableMetrics, exampleMetrics } = require('./metricsData.ts');
const today = '2026-08-28';
const records = [
  {id:1,status:'SCHEDULED',workDate:'2026-08-01',farmAddress:'충북 청주시 상당구'},
  {id:1,status:'SCHEDULED',workDate:'2026-08-01',farmAddress:'충북 청주시 상당구'},
  {id:2,status:'COMPLETED',workDate:'2025-12-31',farmAddress:'충북 제천시'},
  {id:3,status:'CANCELLED',workDate:'2026-08-20',farmAddress:'충북 청주시'},
  {id:4,status:'PENDING',workDate:'2026-08-21',farmAddress:'충북 청주시'},
  {id:5,status:'IN_PROGRESS',workDate:'2026-07-10',farmAddress:'미입력'},
];

test('counts all matching assignments once, excluding cancellation and pending', () => {
  const result = assignmentMetrics(records, {period:'ALL',region:'전체'}, today);
  assert.equal(result.matches,3);
  assert.equal(result.regionCounts['청주시'],1);
  assert.equal(result.regionCounts['제천시'],1);
  assert.equal(result.unknownRegions,1);
});

test('combines work-date period and city filters', () => {
  assert.equal(assignmentMetrics(records,{period:'MONTH',region:'전체'},today).matches,1);
  assert.equal(assignmentMetrics(records,{period:'YEAR',region:'전체'},today).matches,2);
  assert.equal(assignmentMetrics(records,{period:'LAST_YEAR',region:'제천시'},today).matches,1);
  assert.equal(assignmentMetrics(records,{period:'YEAR',region:'제천시'},today).matches,0);
  assert.equal(inPeriod('2025-08-01','MONTH',today),false);
  assert.equal(inPeriod('','YEAR',today),false);
});

test('missing statistics stay unknown instead of fabricated zero or demo data', () => {
  const result = assignmentMetrics([], {period:'ALL',region:'전체'}, today);
  assert.equal(result.matches,0);
  assert.equal(result.successRate,null);
  assert.equal(result.newFarmers,null);
  assert.ok(result.monthlySupply.every(value=>value===null));
  assert.ok(result.successRange.every(value=>value===null));
  assert.equal(unavailableMetrics().matches,null);
});

test('preview is explicit and changes with selected filters', () => {
  const all = exampleMetrics({period:'ALL',region:'전체'});
  const filtered = exampleMetrics({period:'MONTH',region:'청주시'});
  assert.equal(all.successRate,56.9);
  assert.equal(all.matches,145);
  assert.equal(all.monthlySupply.length,12);
  assert.notEqual(all.matches,filtered.matches);
  assert.notDeepEqual(all.monthlySupply,filtered.monthlySupply);
});

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
  assert.ok(Object.values(result.regionChanges).every(value=>value===null));
});

test('preview is explicit and changes with selected filters', () => {
  const all = exampleMetrics({period:'ALL',region:'전체'});
  const filtered = exampleMetrics({period:'MONTH',region:'청주시'});
  assert.equal(all.successRate,56.9);
  assert.equal(all.matches,145);
  assert.equal(all.regionCounts['충주시'],224);
  assert.equal(all.regionChanges['충주시'],13);
  assert.equal(all.monthlySupply.length,12);
  assert.notEqual(all.matches,filtered.matches);
  assert.notDeepEqual(all.monthlySupply,filtered.monthlySupply);
});

test('month comparison counts eligible unique assignments in both months', () => {
  const rows = [
    ...records,
    {id:6,status:'COMPLETED',workDate:'2026-07-01',farmAddress:'충북 제천시'},
    {id:7,status:'CANCELLED',workDate:'2026-07-02',farmAddress:'충북 청주시'},
  ];
  const result = assignmentMetrics(rows,{period:'MONTH',region:'전체'},today);
  assert.equal(result.regionChanges['청주시'],1);
  assert.equal(result.regionChanges['제천시'],-1);
  assert.equal(result.regionChanges['충주시'],0);
});

test('January comparison uses December of the previous year', () => {
  const rows = [...records, {id:8,status:'SCHEDULED',workDate:'2026-01-10',farmAddress:'충북 충주시'}];
  const result = assignmentMetrics(rows,{period:'MONTH',region:'전체'},'2026-01-28');
  assert.equal(result.regionChanges['충주시'],1);
  assert.equal(result.regionChanges['제천시'],-1);
});

test('yearly totals and missing reference dates never claim a monthly comparison', () => {
  for (const period of ['ALL','YEAR','LAST_YEAR']) {
    assert.ok(Object.values(assignmentMetrics(records,{period,region:'전체'},today).regionChanges).every(value=>value===null));
  }
  assert.ok(Object.values(assignmentMetrics(records,{period:'MONTH',region:'전체'},'').regionChanges).every(value=>value===null));
});

test('relative month filters select a single calendar month across year boundaries', () => {
  for (const [period, expected] of [['LAST_MONTH','2025-12'], ['THREE_MONTHS_AGO','2025-10'], ['SIX_MONTHS_AGO','2025-07']]) {
    assert.equal(inPeriod(`${expected}-01`,period,'2026-01-28'),true);
    assert.equal(inPeriod(`${expected}-31`,period,'2026-01-28'),true);
    assert.equal(inPeriod('2026-01-01',period,'2026-01-28'),false);
    assert.equal(inPeriod(`${expected}-01`,period,''),false);
  }
  assert.equal(inPeriod('2026-05-15','THREE_MONTHS_AGO',today),true);
  assert.equal(inPeriod('2026-06-15','THREE_MONTHS_AGO',today),false);
  assert.equal(assignmentMetrics(records,{period:'LAST_MONTH',region:'전체'},today).matches,1);
  assert.equal(assignmentMetrics(records,{period:'THREE_MONTHS_AGO',region:'전체'},today).matches,0);
});

test('past-month comparison uses the month before the selected month', () => {
  const rows = [
    {id:1,status:'COMPLETED',workDate:'2025-12-10',farmAddress:'충북 충주시'},
    {id:2,status:'COMPLETED',workDate:'2025-11-10',farmAddress:'충북 제천시'},
  ];
  const result = assignmentMetrics(rows,{period:'LAST_MONTH',region:'전체'},'2026-01-28');
  assert.equal(result.regionChanges['충주시'],1);
  assert.equal(result.regionChanges['제천시'],-1);
});

test('new city filters count real assignments including metropolitan address names', () => {
  const rows = ['충남 서산시', '인천광역시 남동구', '인천시 중구', '부산광역시 동구', '부산 해운대구', '충북 제천시'].map((farmAddress,index)=>({
    id:index+10,status:'COMPLETED',workDate:'2026-08-10',farmAddress,
  }));
  for (const [region,count] of [['서산시',1],['인천시',2],['부산시',2],['제천시',1]]) {
    const result = assignmentMetrics(rows,{period:'MONTH',region},today);
    assert.equal(result.matches,count);
    assert.equal(result.regionCounts['제천시'],1);
    assert.equal(result.regionCounts['인천시'],undefined);
  }
  assert.notEqual(exampleMetrics({period:'ALL',region:'서산시'}).matches,exampleMetrics({period:'ALL',region:'전체'}).matches);
  assert.notEqual(exampleMetrics({period:'LAST_MONTH',region:'전체'}).matches,exampleMetrics({period:'SIX_MONTHS_AGO',region:'전체'}).matches);
});

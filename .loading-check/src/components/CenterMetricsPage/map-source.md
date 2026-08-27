# 충북 지도 출처

- 원본: KOSTAT 2018 행정경계, southkorea-maps contributors.
- 데이터: https://github.com/southkorea/southkorea-maps/blob/master/kostat/2018/json/skorea-municipalities-2018-geo.json
- 라이선스 안내: https://github.com/southkorea/southkorea-maps#copyright-and-license (KOSTAT: Free to share or remix.)
- 변경: 충북 경계 추출, 청주 4개 구를 같은 시로 묶음, 화면 좌표 투영, 소수점 축약, 색상 및 라벨 추가.
- 재생성: `node scripts/build-chungbuk-map.cjs <원본 GeoJSON 경로>`

2018년 경계를 사용한 통계 UI용 지도이며 최신 행정경계 안내용이 아닙니다.

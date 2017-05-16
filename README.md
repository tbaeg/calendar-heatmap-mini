# D3 Calendar Heatmap

This code was originally forked from `https://github.com/DKirwan/calendar-heatmap` and modified. This
serves to publish the package to `npm` as `calendar-heatmap-mini` along with a few key differences.

Changes:
* [DONE] Update to the latest `d3@4.8.0`
  * Trim down to specific `d3` packages.
* [DONE] Use SVG `text` for tooltips.
* [TODO] Remove `moment` dependency.
* [TODO] Move into a non-forked version of the repository.
  * Rework project structure into the appropriate name (`calendar-heatmap-mini`).

A [d3.js](https://d3js.org/) heatmap representing time series data. Inspired by Github's contribution chart

![Reusable D3.js Calendar Heatmap chart](https://raw.githubusercontent.com/DKirwan/calendar-heatmap/develop/example/thumbnail.png)

## Configuration

|Property        | Usage           | Default  | Required |
|:------------- |:-------------|:-----:|:-----:|
| data | Chart data | none | yes |
| selector | DOM selector to attach the chart to | body | no |
| max | Maximum count | max found in data | no |
| startDate | Date to start heatmap at | 1 year ago | no |
| colorRange | Minimum and maximum chart gradient colors | ['#D8E6E7', '#218380'] | no |
| tooltipEnabled | Option to render a tooltip | true | no |
| tooltipUnit | Unit to render on the tooltip, can be object for pluralization control | 'contributions' | no |
| legendEnabled | Option to render a legend | true | no |
| onClick | callback function on day click events (see example below) | null | no |
| locale | Object to translate every word used, except for tooltipUnit | see below | no |

### Default locale object

```javascript
{
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    No: 'No',
    on: 'on',
    Less: 'Less',
    More: 'More'
}
```

## Dependencies

* [d3.js](https://d3js.org/)
* [moment.js](http://momentjs.com/)

## Usage

### Without npm
1: Add `d3.js` and `moment.js`

2: Include `calendar-heatmap-mini.js` and `calendar-heatmap-mini.css`.
```
<link rel="stylesheet" type="text/css" href="path/tocalendar-heatmap-mini.css">
<script src="path/to/calendar-heatmap-mini.js"></script>
```

3: Format the data so each array item has a `date` and `count` property.
As long as `new Date()` can parse the date string it's ok. Note - there all data should be rolled up into daily bucket granularity.

4: Configure the chart and render it
```javascript
// chart data example
var chartData = [{
  date: valid Javascript date object,
  count: Number
}];

var chart1 = calendarHeatmap()
              .data(chartData)
              .selector('#chart-one')
              .colorRange(['#D8E6E7', '#218380'])
              .tooltipEnabled(true)
              .onClick(function (data) {
                console.log('onClick callback. Data:', data);
              });

// render the chart
chart1();
```

### With npm
1: Add package dependency.
```
npm install calendar-heatmap-mini --save
```

2. Import however desired.
```
import CalendarHeatMap from 'calendar-heatmap-mini'
```

3. Configure and render the chart.
```javascript
import CalendarHeatMap from 'calendar-heatmap-mini'

// chart data example
const chartData = [{
  date: valid Javascript date object,
  count: Number
}];

const chart1 = new CalendarHeatMap()
              .data(chartData)
              .selector('#chart-one')
              .colorRange(['#D8E6E7', '#218380'])
              .tooltipEnabled(true)
              .onClick(function (data) {
                console.log('onClick callback. Data:', data);
              });

// render the chart
chart1();
```

### Control Unit Pluralization

```javascript
var chart1 = calendarHeatmap()
              .data(chartData)
              .tooltipUnit(
                [
                  {min: 0, unit: 'contribution'},
                  {min: 1, max: 1, unit: 'contribution'},
                  {min: 2, max: 'Infinity', unit: 'contributions'}
                ]
              );
chart1();  // render the chart
```

## Pull Requests and Issues

...are very welcome!

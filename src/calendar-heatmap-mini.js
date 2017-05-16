if (typeof define === 'function' && define.amd) {
  define(['d3'], function () {
    'use strict';

    return calendarHeatmap;
  });
} else if (typeof module === 'object' && module.exports) {
  module.exports = calendarHeatmap;
} else {
  window.CalendarHeatMap = calendarHeatmap;
}

var d3 = typeof require === 'function' ? Object.assign({},
  require('d3-array'),
  require('d3-scale'),
  require('d3-selection'),
  require('d3-time')) : window.d3;
var moment = typeof require === 'function' ? require('moment') : window.moment;

function calendarHeatmap() {
  // defaults
  var width = 825;
  var height = 125;
  var legendWidth = 150;
  var selector = 'body';
  var SQUARE_LENGTH = 12;
  var SQUARE_PADDING = 3;
  var MONTH_LABEL_PADDING = 10;
  var now = moment().endOf('day').toDate();
  var yearAgo = moment().startOf('day').subtract(1, 'year').toDate();
  var startDate = null;
  var data = [];
  var max = null;
  var colorRange = ['#D8E6E7', '#218380'];
  var tooltipEnabled = true;
  var tooltipUnit = 'Event';
  var legendEnabled = true;
  var onClick = null;
  var weekStart = 0; //0 for Sunday, 1 for Monday
  var locale = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    No: 'No',
    on: 'on',
    Less: 'Less',
    More: 'More'
  };

  // setters and getters
  chart.data = function (value) {
    if (!arguments.length) { return data; }
    data = value;
    return chart;
  };

  chart.max = function (value) {
    if (!arguments.length) { return max; }
    max = value;
    return chart;
  };

  chart.selector = function (value) {
    if (!arguments.length) { return selector; }
    selector = value;
    return chart;
  };

  chart.startDate = function (value) {
    if (!arguments.length) { return startDate; }
    yearAgo = value;
    now = moment(value).endOf('day').add(1, 'year').toDate();
    return chart;
  };

  chart.colorRange = function (value) {
    if (!arguments.length) { return colorRange; }
    colorRange = value;
    return chart;
  };

  chart.tooltipEnabled = function (value) {
    if (!arguments.length) { return tooltipEnabled; }
    tooltipEnabled = value;
    return chart;
  };

  chart.tooltipUnit = function (value) {
    if (!arguments.length) { return tooltipUnit; }
    tooltipUnit = value;
    return chart;
  };

  chart.legendEnabled = function (value) {
    if (!arguments.length) { return legendEnabled; }
    legendEnabled = value;
    return chart;
  };

  chart.onClick = function (value) {
    if (!arguments.length) { return onClick(); }
    onClick = value;
    return chart;
  };

  chart.locale = function (value) {
    if (!arguments.length) { return locale; }
    locale = value;
    return chart;
  };

  function chart() {

    d3.select(chart.selector()).selectAll('svg.calendar-heatmap-mini').remove(); // remove the existing chart, if it exists

    var dateRange = d3.timeDays(yearAgo, now); // generates an array of date objects within the specified range
    var monthRange = d3.timeMonths(moment(yearAgo).startOf('month').toDate(), now); // it ignores the first month if the 1st date is after the start of the month
    var firstDate = moment(dateRange[0]);
    // initialize data with 0 counts if there is none
    if (chart.data().length === 0) {
      var chartData = d3.timeDays(yearAgo, now).map((dateElement) => {
        return { date: dateElement, count: 0 };
      });
      chart.data(chartData);
    }

    max = d3.max(chart.data(), function (d) { return d.count; });

    // color range
    var color = d3.scaleLinear()
      .range(chart.colorRange())
      .domain([0, max]);

    var tooltip;
    var dayRects;
    var selectedDay;

    drawChart();

    function drawChart() {
      var svg = d3.select(chart.selector())
        .style('position', 'relative')
        .append('svg')
        .attr('width', width)
        .attr('class', 'calendar-heatmap-mini')
        .attr('height', height);

      dayRects = svg.selectAll('.day-cell')
        .data(dateRange); // array of days for the last yr

      dayRects.enter()
        .append('rect')
        .attr('class', 'day-cell')
        .attr('width', SQUARE_LENGTH)
        .attr('height', SQUARE_LENGTH)
        .attr('fill', function (d) { return color(countForDate(d)); })
        .attr('x', function (d, i) {
          var cellDate = moment(d);
          var result = cellDate.week() - firstDate.week() + (firstDate.weeksInYear() * (cellDate.weekYear() - firstDate.weekYear()));
          return result * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .attr('y', function (d, i) {
          return MONTH_LABEL_PADDING + formatWeekday(d.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .each(function (d, i, g) {
          var dayRect = d3.select(this);

          if (typeof onClick === 'function') {
            dayRect.on('click', function (d) {
              if (selectedDay) {
                selectedDay.style('stroke', null);
              }

              selectedDay = dayRect;
              selectedDay.style('stroke', 'rgb(0,0,0)');

              var count = countForDate(d);
              onClick({ date: d, count: count });
            });
          }

          if (chart.tooltipEnabled()) {
            dayRect
              .on('mouseover', function (d, i) {
                var x = parseInt(this.getAttribute('x')) - 50;
                var y = parseInt(this.getAttribute('y')) - 5;

                tooltip = svg.append('text')
                  .attr('class', 'day-cell-tooltip')
                  .attr('fill', 'black')
                  .attr('width', 10)
                  .attr('height', 5)
                  .attr('x', x)
                  .attr('y', y)
                  .text(tooltipText(d));
              })
              .on('mouseout', function (d, i) {
                tooltip.remove();
              });
          }
        });

      if (chart.legendEnabled()) {
        var colorRange = [color(0)];
        for (var i = 3; i > 0; i--) {
          colorRange.push(color(max / i));
        }

        var legendGroup = svg.append('g');
        legendGroup.selectAll('.calendar-heatmap-mini-legend')
          .data(colorRange)
          .enter()
          .append('rect')
          .attr('class', 'calendar-heatmap-mini-legend')
          .attr('width', SQUARE_LENGTH)
          .attr('height', SQUARE_LENGTH)
          .attr('x', function (d, i) { return (width - legendWidth) + (i + 1) * 13; })
          .attr('y', height + SQUARE_PADDING)
          .attr('fill', function (d) { return d; });

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-mini-legend-text calendar-heatmap-mini-legend-text-less')
          .attr('x', width - legendWidth - 13)
          .attr('y', height + SQUARE_LENGTH)
          .text(locale.Less);

        legendGroup.append('text')
          .attr('class', 'calendar-heatmap-mini-legend-text calendar-heatmap-mini-legend-text-more')
          .attr('x', (width - legendWidth + SQUARE_PADDING) + (colorRange.length + 1) * 13)
          .attr('y', height + SQUARE_LENGTH)
          .text(locale.More);
      }

      dayRects.exit().remove();
      var monthLabels = svg.selectAll('.month')
        .data(monthRange)
        .enter()
        .append('text')
        .attr('class', 'month-name')
        .attr('x', function (d, i) {
          var matchIndex = 0;
          dateRange.find(function (element, index) {
            matchIndex = index;
            return moment(d).isSame(element, 'month') && moment(d).isSame(element, 'year');
          });

          return Math.floor(matchIndex / 7) * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .attr('y', 0)  // fix these to the top
        .text(function (d) {
          return locale.months[d.getMonth()];
        });

      locale.days.forEach(function (day, index) {
        index = formatWeekday(index);
        if (index % 2) {
          svg.append('text')
            .attr('class', 'day-initial')
            .attr('transform', 'translate(-8,' + (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) + ')')
            .style('text-anchor', 'middle')
            .attr('dy', '2')
            .text(day);
        }
      });
    }

    function pluralizedTooltipUnit(count) {
      if ('string' === typeof tooltipUnit) {
        return (tooltipUnit + (count === 1 ? '' : 's'));
      }
      for (var i in tooltipUnit) {
        var _rule = tooltipUnit[i];
        var _min = _rule.min;
        var _max = _rule.max || _rule.min;
        _max = _max === 'Infinity' ? Infinity : _max;
        if (count >= _min && count <= _max) {
          return _rule.unit;
        }
      }
    }

    function tooltipText(d) {
      var dateStr = moment(d).format('MM/DD/YY');
      var count = countForDate(d);
      return (count ? count : locale.No) + ' ' + pluralizedTooltipUnit(count) + ' ' + locale.on + ' ' + dateStr;
    }

    function countForDate(d) {
      var count = 0;
      var match = chart.data().find(function (element, index) {
        return moment(element.date).isSame(d, 'day');
      });
      if (match) {
        count = match.count;
      }
      return count;
    }

    function formatWeekday(weekDay) {
      if (weekStart === 1) {
        if (weekDay === 0) {
          return 6;
        } else {
          return weekDay - 1;
        }
      }
      return weekDay;
    }

    var daysOfChart = chart.data().map(function (day) {
      return day.date.toDateString();
    });

    dayRects.filter(function (d) {
      return daysOfChart.indexOf(d.toDateString()) > -1;
    }).attr('fill', function (d, i) {
      return color(chart.data()[i].count);
    });
  }

  return chart;
}


// polyfill for Array.find() method
/* jshint ignore:start */
if (!Array.prototype.find) {
  Array.prototype.find = function (predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
/* jshint ignore:end */

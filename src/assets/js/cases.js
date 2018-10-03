'use strict';

import * as d3 from 'd3';
import _ from 'lodash';
import Moment from 'moment';

let interval = 1000,
    defaults = {};

let transition = function (marker, path, exit) {
    marker.transition()
        .duration(interval)
        .attrTween('transform', translateAlong(path.node()))
        .on('end', function(){
            if(exit){
                marker.remove();
            }
        })
};

let translateAlong = function(path) {
    let l = path.getTotalLength();
    return function(i) {
        return function(t) {
            let p = path.getPointAtLength(t * l);
            return 'translate(' + p.x + ',' + p.y + ')';//Move marker
        }
    };
};

export default function Cases(svg, svgDefaults) {

    defaults = svgDefaults;

    let day = 0,
        caseGroup = svg.select('#cases'),
        legend = {
            date: svg.select('#legend-date')
        };

    d3.csv('/assets/data/cases.csv').then(function(caseData){

        let cases = _.filter(caseData, {'child_id': '1000000'});

        console.log(cases);

        let dates = _.uniq(_.map(caseData, 'date')),
            totalDays = dates.length,
            startDate = dates[0],
            endDate = dates[dates.length-1];

        function newDay() {

            legend.date.text(dates[day]);

            //get all the case events for this day
            let events = _.filter(cases, {date: dates[day]});

            events.forEach(function(event){

                let childMarker = caseGroup.select('#child-' + event.child_id);

                if(childMarker.empty()){

                    let startNode = svg.select('#nodes #' + event.node + ' circle');

                    childMarker = caseGroup.append('circle')
                        .attr('id', 'child-' + event.child_id)
                        .attr('r', 10)
                        .style('fill', 'white')
                        .style('stroke', 'black')
                        .style('stroke-width', 2)
                        .attr('data-node', event.node)
                        .attr('transform', 'translate(' + startNode.attr('cx') + ',' + startNode.attr('cy') + ')');

                    let nextNodeCases = parseInt(svg.select('#' + event.node + '-counter').text());
                    svg.select('#' + event.node + '-counter').text(nextNodeCases+1);
                }
                else {

                    let selector = '#' + childMarker.attr('data-node') + '-to-' + event.node,
                        exit = true;

                    let currentNodeCases = parseInt(svg.select('#' + childMarker.attr('data-node') + '-counter').text());
                    svg.select('#' + childMarker.attr('data-node') + '-counter').text(currentNodeCases-1);

                    if(!event.node.includes('exit')){
                        selector += ' path';
                        exit = false;

                        let nextNodeCases = parseInt(svg.select('#' + event.node + '-counter').text());
                        svg.select('#' + event.node + '-counter').text(nextNodeCases+1);
                    }

                    let transitionPath = svg.select(selector);

                    childMarker.attr('data-node', event.node);

                    transition(childMarker, transitionPath, exit);
                }

            });

            if (day < totalDays) {
                day++;
                d3.timeout(newDay, interval)
            } else {
                return true;
            }
        }

        newDay();
    });



























}
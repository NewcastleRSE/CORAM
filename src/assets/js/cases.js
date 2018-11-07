'use strict';

import * as d3 from 'd3';
import _ from 'lodash';
import * as $ from 'jquery';
import Moment from 'moment';

let interval = 1000,
    defaults = {},
    StopException = {},
    PauseException = {},
    pathDisplacementScale = 0.2; // Multiplier of transition days to get a displacement.
                                 // FIXME [JG]: pathDisplacementScale should probably be in defaults?


let transition = function (marker, durtion, path, exit) {

    marker.transition()
        .ease(d3.easeLinear)
        .duration(interval * durtion)
        .attrTween('transform', translateAlong(path.node(), durtion))
        .on('end', function(){
            if(exit){
                marker.remove();
            }
        })
};

let translateAlong = function(path, d) {
    let l = path.getTotalLength(),
        dx = pathDisplacementScale * ((Math.random() > 0.5) ? d : -d), 
        dy = pathDisplacementScale * ((Math.random() > 0.5) ? d : -d);

    // Interpolate along a triangle function (0, 0) - (0.5, 1.0) - (1.0, 0)
    let triangle = function(t) {
        return (t < 0.5) ? 2 * t : 2 * (1 - t);
    }
    
    return function(i) {
        return function(t) {
            let p = path.getPointAtLength(t * l),
                displ = triangle(t);
            return `translate(${p.x + dx * displ}, ${p.y + dy * displ})`; //Move marker
        }
    };
};

export default function Cases(svg, svgDefaults) {

    defaults = svgDefaults;

    let day = 0,
        caseGroup = svg.select('#cases'),
        legend = {
            date: svg.select('#legend-date'),
            cases: svg.select('#legend-cases')
        };

    d3.csv('/assets/data/cases.csv').then(function(caseData){

        //Colour scale for 0 to highest number of times an individual is seen by the system
        var colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, _.maxBy(caseData, 'path_N').path_N]);

        let dates = _.uniq(_.map(caseData, 'date')),
            totalDays = dates.length,
            startDate = dates[0],
            stopLoop = false,
            pauseLoop = false;

        $('#case-count').text(0);
        $('#current-date').text(startDate);

        function newDay() {

            //get all the case events for this day
            let events = _.filter(caseData, {date: dates[day]});

            try {
                events.forEach(function(event){

                    if(stopLoop){
                        throw StopException;
                    }

                    if(pauseLoop) {
                        throw PauseException;
                    }

                    let childMarker = caseGroup.select('#child-' + event.child_id + '-path-' + event.path_N);

                    if(childMarker.empty()){

                        let startNode = svg.select('#nodes #' + event.node + ' circle');

                        childMarker = caseGroup.append('circle')
                            .attr('id', 'child-' + event.child_id + '-path-' + event.path_N)
                            .attr('class', 'case')
                            .attr('r', 6)
                            .style('fill', colorScale(event.path_N))
                            .style('stroke', 'black')
                            .style('stroke-width', 1)
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

                        //debug for exits in data that aren't in the original diagram
                        // if(!transitionPath.node()){
                        //     console.log(_.filter(caseData, {'child_id': event.child_id, 'path_N': event.path_N}));
                        //     console.log(selector);
                        // }

                        let nextStop = _.find(caseData, {child_id: event.child_id, path_N: event.path_N, node_N: (parseInt(event.node_N) + 1).toString()});
                        let duration = 1;

                        if(nextStop){
                            duration = Moment(nextStop.date).diff(Moment(event.date), 'days');
                            duration = duration === 0 ? 1 : duration
                        }

                        transition(childMarker, duration, transitionPath, exit);
                    }

                });

                if (day < totalDays) {

                    //legend.date.text(dates[day]);
                    //legend.cases.text(d3.selectAll('.case').size() + ' Cases');

                    $('#case-count').text(d3.selectAll('.case').size());
                    $('#current-date').text(dates[day]);

                    day++;
                    d3.timeout(newDay, interval)
                } else {
                    return true;
                }
            }
            catch(ex) {
                if(ex === StopException) {
                    day = 0;
                    startDate = dates[0];
                    $('#control-play').css('display', 'block');
                    $('#control-pause').css('display', 'none');

                    $('#case-count').text(0);
                    $('#current-date').text(startDate);

                    //Call a new empty transition to kill any currently moving nodes
                    svg.selectAll('#cases .case').transition();
                    svg.selectAll('#cases .case').remove();
                    svg.selectAll('#nodes .node-counter').text('0');

                    stopLoop = false;
                    pauseLoop = false;
                }
                else if(ex === PauseException) {
                    $('#control-play').css('display', 'block');
                    $('#control-pause').css('display', 'none');

                    stopLoop = false;
                    pauseLoop = true;
                }
                else {
                    throw ex;
                }
            }
        }

        $('#speed').on('input change', function() {
            //take from 2100 so that the fastest it will go is 100 milliseconds per day
            interval = 2100 - ($(this).val());
        });

        $('#control-play').click(function(){
            $('#control-play').css('display', 'none');
            $('#control-pause').css('display', 'block');
            pauseLoop = false;
            newDay();
        });

        $('#control-pause').click(function(){
            pauseLoop = true;
        });

        $('#control-stop').click(function(){
            stopLoop = true;

            if(pauseLoop){
                day = 0;
                startDate = dates[0];
                $('#control-play').css('display', 'block');
                $('#control-pause').css('display', 'none');

                $('#case-count').text(0);
                $('#current-date').text(startDate);

                stopLoop = false;
                pauseLoop = false;
            }
        });
    });
}

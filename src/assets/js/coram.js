'use strict';

import * as d3 from 'd3';
import _ from 'lodash';

let svg,
    stage,
    defaults,
    orientation;

export default function Coram() {

    svg = d3.select('#route-map').append('svg');
    stage = d3.select('#route-map').node();
    orientation = stage.getBoundingClientRect().width > stage.getBoundingClientRect().height ? 'landscape' : 'portrait';

    defaults = {
        padding: 25,
        width: stage.getBoundingClientRect().width,
        height: stage.getBoundingClientRect().height,
        scaleFactor: Math.floor(stage.getBoundingClientRect().height / 25)
    };

    if(orientation === 'portrait'){
        defaults.scaleFactor = Math.floor(stage.getBoundingClientRect().width / 25)
    }

    let grid = {
        columnWidth: Math.floor(defaults.width / 13),
        rowHeight: Math.floor(defaults.height / 10),
    };

    svg.attr('width', defaults.width);
    svg.attr('height', defaults.height);

    positionNodes(grid);
}

async function positionNodes(grid) {

    const routeData = await d3.json('/assets/data/routes.json');
    const nodeData = await d3.json('/assets/data/nodes.json');

    /*
    * This section creates the lines of case flow that link all the nodes on the system
     */

    let routeGroup = svg.append('g');
    routeGroup.attr('id', 'routes');

    let routes = routeGroup.selectAll('.route')
        .data(routeData)
        .enter()
        .append('g')
        .attr('class', 'route');

    let route = routes.append('path')
        .attr('d', function (d,i) {

            let start = _.find(nodeData, { 'id': d.start }),
                end = _.find(nodeData, { 'id': d.end });

            let startPoint = {
                    x: (start.col * grid.columnWidth) + (grid.columnWidth / 2) + (defaults.scaleFactor / 2),
                    y: (start.row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor / 2)
                },
                endPoint = {
                    x: (end.col * grid.columnWidth) + (grid.columnWidth / 2) + (defaults.scaleFactor / 2),
                    y: (end.row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor / 2)
                };

            let path = 'M' + startPoint.x + ',' + startPoint.y;



            if(d.junction){

                //calculate full length of line and add mid-point at point d.bend.x
                //invert changes the direction of the line by altering the mid-point y location
                // let midPoint = {
                //     x: startPoint.x + ((endPoint.x - startPoint.x) * (start.col/end.col)),
                //     y: (start.row < end.row && start.col < end.col) ? startPoint.y : endPoint.y
                // };

                let midPoint = {
                    x: startPoint.x + ((endPoint.x - startPoint.x) * d.junction.distance),
                    y: (d.junction.row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor / 2)
                };

                let curveStart,
                    curveEnd;

                //Line heading SE
                if(start.row === d.junction.row){
                    curveStart = {
                        x: midPoint.x - (defaults.scaleFactor / 2),
                        y: midPoint.y
                    };

                    curveEnd = {
                        x: midPoint.x + (defaults.scaleFactor / 2),
                        y: midPoint.y + (defaults.scaleFactor / 2)
                    };
                }
                else {
                    curveStart = {
                        x: midPoint.x - (defaults.scaleFactor / 2),
                        y: (startPoint.y > endPoint.y) ? midPoint.y + (defaults.scaleFactor / 2) : midPoint.y - (defaults.scaleFactor / 2)
                    };

                    curveEnd = {
                        x: midPoint.x + (defaults.scaleFactor / 2),
                        y: midPoint.y
                    };
                }

                let theta = Math.atan2(curveEnd.y - curveStart.y, curveEnd.x - curveStart.x) - Math.PI / 2;

                //Seems to work best when set at 0;
                let offset = 0;

                let controlPoint = {
                    x: midPoint.x + offset * Math.cos(theta),
                    y: midPoint.y + offset * Math.sin(theta)
                };

                //Special Case Adjustments
                /*
                * These adjustments ar ehacks to get overlapping routes to avoid one another, this should be possible to do
                * using extra properties on the data
                 */
                if(d.start === 'strategyDiscussion' && d.end === 'cf'){
                    curveStart = {
                        x: curveStart.x - defaults.scaleFactor * 2,
                        y: curveStart.y + defaults.scaleFactor * 2
                    };

                    curveEnd = {
                        x: curveEnd.x - defaults.scaleFactor * 2,
                        y: curveEnd.y + defaults.scaleFactor * 1.5
                    };

                    controlPoint = {
                        x: controlPoint.x - defaults.scaleFactor * 2,
                        y: controlPoint.y + defaults.scaleFactor * 1.6
                    };
                }

                if(d.start === 'cf' && d.end === 'strategyDiscussion'){
                    curveStart = {
                        x: curveStart.x + defaults.scaleFactor * 3,
                        y: curveStart.y - defaults.scaleFactor * 2
                    };

                    curveEnd = {
                        x: curveEnd.x + defaults.scaleFactor,
                        y: curveEnd.y - defaults.scaleFactor * 1.5
                    };

                    controlPoint = {
                        x: controlPoint.x + defaults.scaleFactor * 2,
                        y: controlPoint.y - defaults.scaleFactor * 1.6
                    };
                }

                if(d.start === 'section47' && d.end === 'cf'){
                    curveStart = {
                        x: curveStart.x + defaults.scaleFactor * 4,
                        y: curveStart.y
                    };

                    curveEnd = {
                        x: curveEnd.x + defaults.scaleFactor * 2.5,
                        y: curveEnd.y - defaults.scaleFactor
                    };

                    controlPoint = {
                        x: controlPoint.x + defaults.scaleFactor * 3.8,
                        y: controlPoint.y - defaults.scaleFactor * 0.4
                    };
                }

                path += 'L' + curveStart.x + ',' + curveStart.y;
                path += 'Q' + controlPoint.x + ',' + controlPoint.y + ',' + curveEnd.x + ',' + curveEnd.y;
            }

            path += 'L' + endPoint.x + ',' + endPoint.y;

            return path;
        })
        .style('stroke', function(d) { return d.color; })
        .style('stroke-dasharray', function(d) { if (d.universal) { return (defaults.scaleFactor/5) + ',' + (defaults.scaleFactor/5); } })
        .style('fill', 'none')
        .style('stroke-width', function() { return defaults.scaleFactor / 5 });

    /*
    * This section creates the nodes, represented by large dots, that a case can stop at
     */


    let nodeGroup = svg.append('g');
    nodeGroup.attr('id', 'nodes');

    let nodes = nodeGroup.selectAll('.node')
        .data(nodeData)
        .enter()
        .append('g')
        .attr('id', function(d){ return d.id; })
        .attr('class', 'node');

    let circle = nodes.append('circle')
        .attr('cx', function(d){ return (d.col * grid.columnWidth) + (grid.columnWidth / 2) + (defaults.scaleFactor / 2) })
        .attr('cy', function(d){ return (d.row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor / 2) })
        .attr('r', defaults.scaleFactor)
        .style('fill', 'white')
        .style('stroke', function(d) { return d.color; })
        .style('stroke-dasharray', function(d) { if (d.universal) { return (defaults.scaleFactor/5) + ',' + (defaults.scaleFactor/5); } })
        .style('stroke-width', function() { return defaults.scaleFactor / 5 });

    let label = nodes.append('text')
        .text(function(d) { return d.name })
        .attr('text-anchor', 'middle')
        .attr('font-size', function() { return defaults.scaleFactor / 2.5 })
        .attr('dx', function(d){ return (d.col * grid.columnWidth) + (grid.columnWidth / 2) + (defaults.scaleFactor / 2) })
        .attr('dy', function(d){ return (d.row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor * 2.5) });
}
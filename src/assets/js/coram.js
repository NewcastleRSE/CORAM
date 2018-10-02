'use strict';

import * as d3 from 'd3';
import _ from 'lodash';
import definitions from './definitions';
import cases from './cases';

let svg,
    stage,
    defaults,
    orientation;

export default function Coram() {

    svg = d3.select('#route-map').append('svg');
    stage = d3.select('#route-map').node();
    orientation = stage.getBoundingClientRect().width > stage.getBoundingClientRect().height ? 'landscape' : 'portrait';

    defaults = {
        width: stage.getBoundingClientRect().width,
        height: stage.getBoundingClientRect().height,
        scaleFactor: Math.floor(stage.getBoundingClientRect().width / 50)
    };

    let grid = {
        columnWidth: Math.floor(defaults.width / 15),
        rowHeight: Math.floor(defaults.width / 15),
    };

    svg.attr('width', defaults.width);
    svg.attr('height', defaults.height);

    //builds reusable definitions for objects like arrow markers
    definitions(svg);

    /*let gridLines = svg.append('g')
        .attr('id', 'gridlines');

    for(let x=0; x<=10; x++){
        gridLines.append('line')
            .attr('x1', 0)
            .attr('y1', x*grid.rowHeight)
            .attr('x2', 15*grid.rowHeight)
            .attr('y2', x*grid.rowHeight)
            .style('stroke', '#cccccc')
            .style('stroke-width', 2);
    }

    for(let y=0; y<=15; y++){
        gridLines.append('line')
            .attr('x1', y*grid.columnWidth)
            .attr('y1', 0)
            .attr('x2', y*grid.columnWidth)
            .attr('y2', 10*grid.rowHeight)
            .style('stroke', '#cccccc')
            .style('stroke-width', 2);
    }*/

    positionNodes(grid).then(function () {
        cases(svg, defaults);
    })
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
        .attr('id', function (d) { return d.start + '-to-' + d.end; })
        .attr('class', 'route');

    let route = routes.append('path')
        .attr('d', function (d,i) {

            let start = _.find(nodeData, { 'id': d.start }),
                end = _.find(nodeData, { 'id': d.end });

            let startPoint = {
                    x: (start.col * grid.columnWidth) + (grid.columnWidth / 2),
                    y: (start.row * grid.rowHeight) + (grid.rowHeight / 2)
                },
                endPoint = {
                    x: (end.col * grid.columnWidth) + (grid.columnWidth / 2),
                    y: (end.row * grid.rowHeight) + (grid.rowHeight / 2)
                };

            let path = 'M ' + startPoint.x + ',' + startPoint.y;



            if(d.junction){

                //calculate full length of line and add mid-point at point d.bend.x
                //invert changes the direction of the line by altering the mid-point y location
                // let midPoint = {
                //     x: startPoint.x + ((endPoint.x - startPoint.x) * (start.col/end.col)),
                //     y: (start.row < end.row && start.col < end.col) ? startPoint.y : endPoint.y
                // };

                let midPoint = {
                    x: startPoint.x + ((endPoint.x - startPoint.x) * d.junction.distance),
                    y: (d.junction.row * grid.rowHeight) + (grid.rowHeight / 2)
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
                        y: controlPoint.y + defaults.scaleFactor * 1.5
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

                path += ' L ' + curveStart.x + ',' + curveStart.y;
                path += ' Q ' + controlPoint.x + ',' + controlPoint.y + ',' + curveEnd.x + ',' + curveEnd.y;
            }

            path += ' L ' + endPoint.x + ',' + endPoint.y;

            return path;
        })
        .style('stroke', function(d) { return d.color; })
        .style('stroke-dasharray', function(d) { if (d.universal) { return (defaults.scaleFactor/5) + ',' + (defaults.scaleFactor/5); } })
        .style('fill', 'none')
        .style('stroke-width', function() { return defaults.scaleFactor / 5 });

    /*
    * This section creates the node exit routes
     */

    let exitGroup = svg.append('g');
    exitGroup.attr('id', 'exits');

    let closeNode = _.find(nodeData, {id: 'closure'});

    let exits = exitGroup.selectAll('.exits')
        .data(nodeData)
        .enter()
        .append('g')
        .attr('id', function(d){ return d.id + '-exits'; })
        .attr('class', 'exits')
        .each(function(node){
            d3.select(this).selectAll('line')
                .data(node.exits)
                .enter().append('line')
                .attr('x1', function(d){ return (node.col * grid.columnWidth) + (grid.columnWidth / 2) })
                .attr('y1', function(d){ return (node.row * grid.rowHeight) + (grid.rowHeight / 2) })
                .attr('x2', function(d, i){
                    if(node.id === 'referral'){
                        return (node.col * grid.columnWidth) + ((((grid.columnWidth / node.exits.length) * 1.5) * i) - (grid.columnWidth / 2));
                    }
                    else if(node.id === 'cf'){
                        return (node.col * grid.columnWidth) + ((((grid.columnWidth / node.exits.length) * 1.5) * i) + (grid.columnWidth / 2));
                    }
                    else {
                        return (node.col * grid.columnWidth) + ((grid.columnWidth / (node.exits.length-1)) * i);
                    }
                })
                .attr('y2', function(d, i) {

                    if (node.id === 'referral') {
                        return ((node.row - 1.8) * grid.rowHeight) + (grid.rowHeight / 2) - ((grid.rowHeight * (i/2.5)) / node.exits.length * 2);
                    }
                    else if (node.id === 'cf') {
                        return ((node.row - 1.8) * grid.rowHeight) + (grid.rowHeight / 2) + ((grid.rowHeight * i) / node.exits.length * 2);
                    }
                    else {
                        return ((node.row + 1.8) * grid.rowHeight) + (grid.rowHeight / 2);
                    }
                })
                .attr('marker-end', function(d){ return 'url(#arrow-' + (d.color).replace('#','') + ')' })
                .style('stroke', function(d) { return d.color; })
                .style('stroke-dasharray', function(d) { return (defaults.scaleFactor/5) + ',' + (defaults.scaleFactor/5); })
                .style('stroke-width', function() { return defaults.scaleFactor / 5 })
                .each(function(exit){
                    if(exit.name === 'NFA'){
                        d3.select('#' + node.id + '-exits').append('path')
                            .attr('d', function(d, i){

                                let path = 'M ',
                                    midpoint,
                                    curveStart,
                                    curveEnd;

                                if(node.id === 'cf'){

                                    midpoint = {
                                        x: ((closeNode.col * grid.columnWidth) + (grid.columnWidth / 2)),
                                        y: ((node.row * grid.rowHeight) + (grid.rowHeight / 2) + ((grid.rowHeight * (i+3)) / node.exits.length * 2))
                                    };

                                    path += ((node.col * grid.columnWidth) + ((((grid.columnWidth / node.exits.length) * 1.5) * (i+3)) + (grid.columnWidth / 2))) +
                                    ',' + (((node.row - 1.8) * grid.rowHeight) + (grid.rowHeight / 2) + ((grid.rowHeight * (i+3)) / node.exits.length * 2));
                                }
                                else {

                                    midpoint = {
                                        x: ((node.col * grid.columnWidth) + (((grid.columnWidth / node.exits.length) * 1.5) * i)),
                                        y: ((closeNode.row * grid.rowHeight) + (grid.rowHeight / 2))
                                    };

                                    path += ((node.col * grid.columnWidth) + (((grid.columnWidth / node.exits.length) * 1.5) * i)) +
                                        ',' + (((node.row + 2.1) * grid.rowHeight) + (grid.rowHeight / 2));
                                }

                                path += ' L ' + midpoint.x + ',' + midpoint.y;

                                path += ' L ' + ((closeNode.col * grid.columnWidth) + (grid.columnWidth / 2)) +
                                    ',' + ((closeNode.row * grid.rowHeight) + (grid.rowHeight / 2));

                                return path;
                            })
                            .style('fill', 'none')
                            .style('stroke', function(d) { return closeNode.color; })
                            .style('stroke-dasharray', function() { return (defaults.scaleFactor/5) + ',' + (defaults.scaleFactor/5); })
                            .style('stroke-width', function() { return defaults.scaleFactor / 5 })
                    }
                });

            d3.select(this).selectAll('text')
                .data(node.exits)
                .enter().append('text')
                .text(function(d) { return d.name })
                .attr('text-anchor', 'middle')
                .attr('font-size', function() { return defaults.scaleFactor / 2.5 })
                .attr('dx', function(d, i){

                    if(node.id === 'referral'){
                        return (node.col * grid.columnWidth) + ((((grid.columnWidth / node.exits.length) * 1.5) * i) - (grid.columnWidth / 2));
                    }
                    else if(node.id === 'cf'){
                        return (node.col * grid.columnWidth) + ((((grid.columnWidth / node.exits.length) * 1.5) * i) + (grid.columnWidth / 2));
                    }
                    else {
                        return (node.col * grid.columnWidth) + ((grid.columnWidth / (node.exits.length-1)) * i);
                    }
                })
                .attr('dy', function(d, i){

                    if (node.id === 'referral') {
                        return ((node.row - 1.9) * grid.rowHeight) + (grid.rowHeight / 2) - ((grid.rowHeight * (i/2.5)) / node.exits.length * 2);
                    }
                    else if (node.id === 'cf') {
                        return ((node.row - 1.9) * grid.rowHeight) + (grid.rowHeight / 2) + ((grid.rowHeight * i) / node.exits.length * 2);
                    }
                    else {
                        return ((node.row + 2) * grid.rowHeight) + (grid.rowHeight / 2);
                    }



                });
        });

    /*
    * This section creates the layer for the individual cases
     */

    let caseGroup = svg.append('g');
    caseGroup.attr('id', 'cases');

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
        .attr('cx', function(d){ return (d.col * grid.columnWidth) + (grid.columnWidth / 2) })
        .attr('cy', function(d){ return (d.row * grid.rowHeight) + (grid.rowHeight / 2) })
        .attr('r', defaults.scaleFactor)
        .style('fill', 'white')
        .style('stroke', function(d) { return d.color; })
        .style('stroke-dasharray', function(d) { if (d.universal) { return (defaults.scaleFactor/5) + ',' + (defaults.scaleFactor/5); } })
        .style('stroke-width', function() { return defaults.scaleFactor / 5 });

    let counter = nodes.append('text')
        .text(function(d) { return d.universal ? '' : '0'; })
        .attr('id', function(d) { return d.id + '-counter'; })
        .attr('text-anchor', 'middle')
        .attr('font-size', function() { return defaults.scaleFactor / 2 })
        .attr('font-weight', 'bold')
        .attr('dx', function(d){ return (d.col * grid.columnWidth) + (grid.columnWidth / 2) })
        .attr('dy', function(d){ return (d.row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor / 5) });

    let label = nodes.append('text')
        .text(function(d) { return d.name })
        .attr('text-anchor', 'middle')
        .attr('font-size', function() { return defaults.scaleFactor / 2 })
        .attr('font-weight', 'bold')
        .attr('dx', function(d){ return (d.col * grid.columnWidth) + (grid.columnWidth / 2) })
        .attr('dy', function(d){ return (d.row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor * 1.75) });
}
'use strict';

import * as d3 from 'd3';
import _ from 'lodash';

let svg,
    stage,
    defaults,
    orientation;

export default function Coram() {

    svg = d3.select('body').append('svg');
    stage = d3.select('body').node();
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
        columnWidth: Math.floor(defaults.width / 7),
        rowHeight: Math.floor(defaults.height / 4),
    };

    svg.attr('width', defaults.width);
    svg.attr('height', defaults.height);

    positionNodes(grid);
}

async function positionNodes(grid) {

    const routeData = await d3.json('/assets/data/routes.json');
    const nodeData = await d3.json('/assets/data/nodes.json');

    let routeGroup = svg.append('g');
    routeGroup.attr('id', 'routes');

    let routes = routeGroup.selectAll('.route')
        .data(routeData)
        .enter()
        .append('g')
        .attr('class', 'route');

    let line = routes.append('line')
        .attr('x1', function(d){ return (_.find(nodeData, { 'id': d.start }).col * grid.columnWidth) + (grid.columnWidth / 2) + (defaults.scaleFactor / 2); })
        .attr('y1', function(d){ return (_.find(nodeData, { 'id': d.start }).row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor / 2); })
        .attr('x2', function(d){ return (_.find(nodeData, { 'id': d.end }).col * grid.columnWidth) + (grid.columnWidth / 2) + (defaults.scaleFactor / 2); })
        .attr('y2', function(d){ return (_.find(nodeData, { 'id': d.end }).row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor / 2); })
        .style('stroke', function(d) { return d.color; })
        .style('stroke-width', function() { return defaults.scaleFactor / 5 });

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
        .style('stroke-width', function() { return defaults.scaleFactor / 5 });

    let label = nodes.append('text')
        .text(function(d) { return d.name })
        .attr('text-anchor', 'middle')
        .attr('font-size', function() { return defaults.scaleFactor / 2.5 })
        .attr('dx', function(d){ return (d.col * grid.columnWidth) + (grid.columnWidth / 2) + (defaults.scaleFactor / 2) })
        .attr('dy', function(d){ return (d.row * grid.rowHeight) + (grid.rowHeight / 2) + (defaults.scaleFactor * 2.5) });
}

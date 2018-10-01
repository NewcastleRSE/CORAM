'use strict';

import * as d3 from 'd3';
import _ from 'lodash';

export default function Definitions(svg) {
    let defs = svg.append('svg:defs');

    defs.append('svg:marker')
        .attr('id', 'arrow-CCA246')
        .attr('viewBox', '0 -15 30 30')
        .attr('refX', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style('fill', '#CCA246');

    defs.append('svg:marker')
        .attr('id', 'arrow-01AF51')
        .attr('viewBox', '0 -15 30 30')
        .attr('refX', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style('fill', '#01AF51');

    defs.append('svg:marker')
        .attr('id', 'arrow-000000')
        .attr('viewBox', '0 -15 30 30')
        .attr('refX', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style('fill', '#000000');

    defs.append('svg:marker')
        .attr('id', 'arrow-FCF452')
        .attr('viewBox', '0 -15 30 30')
        .attr('refX', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style('fill', '#FCF452');

    defs.append('svg:marker')
        .attr('id', 'arrow-EB3323')
        .attr('viewBox', '0 -15 30 30')
        .attr('refX', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style('fill', '#EB3323');

    defs.append('svg:marker')
        .attr('id', 'arrow-F19FCA')
        .attr('viewBox', '0 -15 30 30')
        .attr('refX', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style('fill', '#F19FCA');

    defs.append('svg:marker')
        .attr('id', 'arrow-558ED5')
        .attr('viewBox', '0 -15 30 30')
        .attr('refX', 5)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .style('fill', '#558ED5');
}
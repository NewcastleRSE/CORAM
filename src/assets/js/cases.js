'use strict';

import * as d3 from 'd3';
import _ from 'lodash';

let path,
    startPoint;

export default function Cases(svg, defaults) {
    let time = 0,
        count = 0,
        elapsed = 0,
        format = d3.format('.2'),
        interval = 1000,
        cases = svg.select('#cases');

    path = svg.select('#universalSupport-to-initialContact path');
    startPoint = pathStartPoint(path);

    newDay();

    function newDay(t) {
        elapsed = t ? elapsed + t : elapsed;
        svg.select('#earlyHelp-counter').text(count);

        let caseMarker = cases.append('circle')
            .attr('id', 'case-' + count)
            .attr('cx', 50)
            .attr('cy', 50)
            .attr('r', 10)
            .style('fill', 'white')
            .style('stroke', 'black')
            .style('stroke-width', 2)
            .attr('transform', 'translate(' + startPoint + ')');

        if (count < 50) {
            transition(caseMarker);
            count++;
            d3.timeout(newDay, interval)
        } else {
            return true;
        }
    }

    //Get path start point for placing marker
    function pathStartPoint(path) {
        var d = path.attr('d'),
            dsplitted = d.split(' ');
        return dsplitted[1].split(',');
    }

    function transition(marker) {
        marker.transition()
            .duration(interval*2)
            .attrTween('transform', translateAlong(path.node()))
            .each('end', transition);// infinite loop
    }

    function translateAlong(path) {
        let l = path.getTotalLength();
        return function(i) {
            return function(t) {
                let p = path.getPointAtLength(t * l);
                return 'translate(' + (p.x - Math.floor(defaults.width / 30)) + ',' + (p.y -  Math.floor(defaults.width / 30)) + ')';//Move marker
            }
        }
    }
}
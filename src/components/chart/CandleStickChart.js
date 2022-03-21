import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import _ from "lodash"

import styles from './CandleStickChart.module.css'


const margin = {
  top: 50,
  right: 30,
  bottom: 30,
  left: 30
}

const CandleStickChart = ({ data }) => {
  const svgRef = useRef()
  const volRef = useRef()
  const wrapperRef = useRef()

  useEffect(() => {
    const { width, height } = wrapperRef.current.getBoundingClientRect()

    const candleWidth = 5
    const volumeHeight = 200

    const extent = [[50, 30], [width - 2 * margin.left, height - 2 * margin.top]]

    //set up svg
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    const svgContent = svg.select("#content")
      .attr("width", width - margin.left * 2)
      .attr("height", height - margin.top * 2)

    const volSvg = d3.select(volRef.current)
      .attr("width", width)
      .attr("height", volumeHeight)

    const svgVolume = d3.select("#volume")
      .attr("width", width - margin.left * 2)
      .attr("height", volumeHeight - margin.top)

    //scale

    const xScale = (data) => d3.scaleBand()
      .domain(data.map((data) => data.date))
      .range([margin.left, width - margin.right])


    const yScale = (data) => d3.scaleLinear()
      .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
      .range([height - margin.bottom, margin.top])


    const vScale = (data) => d3.scaleLinear()
      .domain([d3.min(data, d => parseInt(d.vol)), d3.max(data, d => parseInt(d.vol))])
      .range([volumeHeight - margin.bottom, margin.top])

    //Draw for first time
    svgContent.call(drawCandleStick, data)
    svgVolume.call(drawVolume, data)

    //綁定zoom event

    svg.call(
      d3.zoom()
        .scaleExtent([1, 5])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", _.debounce((event) => {

          // k zoom margin x = offset
          let { k: mouseK, x: mouseX } = event.transform

          let z = d3.scaleLinear()
            .domain([mouseX, mouseX + mouseK * width])
            .rangeRound([0, data.length - 1])

          let lp = z(margin.left),
            rp = z(width - margin.right)

          let dataNew = data.slice(lp, rp)

          // Prevent zooming when its not zoom
          if (mouseK === 1 && mouseX === 0) {
            svgContent.call(drawCandleStick, data)
            svgVolume.call(drawVolume, data)
          } else {
            svgContent.call(drawCandleStick, dataNew)
            svgVolume.call(drawVolume, dataNew)
          }

        }))
    )

    // draw function
    function drawCandleStick(g, data) {
      //刷新page
      g.selectAll('g').remove()

      // scale
      let x = xScale(data)
      let y = yScale(data)

      let x1 = d3.scaleLinear()
        .domain([0, x.domain().length - 1])
        .range(x.range())  // for x1.invert


      let xAxis = g => g.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .attr('stroke', '#5E4A3B')
        .call(
          d3.axisBottom(x)
            .tickFormat(data => new Date(data).getDay() === 1 ? data : '')
        )

      let yAxis = g => g.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr('stroke', '#5E4A3B')
        .call(d3.axisLeft(y))

      g.append('g')
        .call(xAxis)
        .call(yAxis)

      let group = g.append('g')

      // Draw
      let candles = group
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', data => `translate(${x(data.date) + x.bandwidth() / 2}, 0)`)
        .attr("stroke", data => (data.open === data.close) ? "black" : (data.open > data.close) ? "green" : "red")
        .style('opacity', 0.8)

      candles.append('line')
        .attr('y1', d => y(d.high))
        .attr('y2', d => y(d.low))

      candles.append('line')
        .attr('y1', d => y(d.open))
        .attr('y2', d => y(d.close))
        .attr('stroke-width', candleWidth)
    }


    // draw the volume
    function drawVolume(g, data) {

      g.selectAll('g').remove()

      let x = xScale(data)
      let v = vScale(data)

      const sFormat = d3.format('~s')

      let [minVol, maxVol] = d3.extent(data.map(d => parseInt(d.vol)))

      let xAxis = g => g.append('g')
        .attr('transform', `translate(0, ${volumeHeight - margin.bottom * 2})`)
        .attr('stroke', '#5E4A3B')
        .call(
          d3.axisBottom(x)
            .tickFormat(data => new Date(data).getDay() === 1 ? data : '')
        )

      let vAxis = g => g.append('g')
        .attr('transform', `translate(${margin.left}, ${-1 * margin.bottom})`)
        .attr('stroke', '#5E4A3B')
        .call(d3.axisLeft(v).tickFormat(sFormat))

      g.append('g')
        .call(xAxis)
        .call(vAxis)

      let group = g.append('g')

      let vol = group
        .selectAll('rect')
        .data(data)
        .join('g')

      vol.append('rect')
        .attr('width', candleWidth * 2)
        .attr('x', d => x(d.date) + x.bandwidth() / 2)
        .attr('y', d => volumeHeight - volumeHeight * (parseInt(d.vol) / maxVol) - margin.bottom * 2)
        .attr('height', d => volumeHeight * (parseInt(d.vol) / maxVol))
        .attr('fill', data => (data.open === data.close) ? "black" : (data.open > data.close) ? "green" : "red")
    }
  }, [data])


  return (
    <div id='stockchart' className={styles.chartContainer} ref={wrapperRef}>
      <svg ref={svgRef}>
        <g id="content"></g>
      </svg>
      <svg ref={volRef}>
        <g id="volume"></g>
      </svg>
    </div>
  )
}

export default CandleStickChart
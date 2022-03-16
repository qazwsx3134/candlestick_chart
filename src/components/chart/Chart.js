import React, { useEffect, useState, useMemo, memo } from 'react'

import ReactECharts from 'echarts-for-react'

import { mappingData } from 'utils/dataUtils'

// chart setting

const tooltip = {
    trigger: 'axis',
    axisPointer: {
        type: 'cross'
    }
}

const axisPointer = {
    link: [
    {
        xAxisIndex: [0, 1] // link xAxis of vol and ohlc 
    }
    ]
}

const dataZoom = [
    { //zoom in zoom out
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 40,
        end: 70,
        top: 30,
        height: 20
    }
]

const grid = [
    {
        left: '10%',
        right: '10%',
        bottom: 200
    },
    {
        left: '10%',
        right: '10%',
        height: 80,
        bottom: 80
    }
]

const ohlcXAxis = { // need to be assign data
    type: 'category',
    boundaryGap: true,
    axisLine: { lineStyle: { color: '#777' } },
    min: 'dataMin',
    max: 'dataMax',
    axisPointer: {
        show: true
    }
}

const ohlcYAxis = {
    scale: true,
    splitNumber: 5,
    axisLine: { lineStyle: { color: '#777' } },
    splitLine: { show: true },
    axisTick: { show: false },
    axisLabel: {
        inside: false,
        formatter: '{value}\n'
    }
}

const volXAxis = {
    type: 'category',
    gridIndex: 1,
    boundaryGap: true,
    splitLine: { show: false },
    axisLabel: { show: false },
    axisTick: { show: false },
    axisLine: { lineStyle: { color: '#777' } },
    min: 'dataMin',
    max: 'dataMax',
    axisPointer: {
        type: 'shadow',
        label: { show: false },
        triggerTooltip: true,
        handle: {
        show: false,
        margin: 30,
        color: '#B80C00'
        }
    }
}

const volYAxis = {
    scale: true,
    gridIndex: 1,
    splitNumber: 3,
    axisLabel: { 
        inside: false,
    },
    axisLine: { show: true },
    axisTick: { show: true },
    splitLine: { show: true }
}


const Chart = ({ data = {}, loading}) => {
    const [option, setOption] = useState({})
    
    const memoizedValue = useMemo(() => mappingData(data), [data]);

    useEffect(() => {
        memoizedValue && setOption({
            title: {
                text: memoizedValue["symbol"]
            },
            tooltip,
            axisPointer,
            dataZoom,
            grid,
            xAxis: [
                {
                    data: memoizedValue["time"],
                    ...ohlcXAxis
                },
                {
                    data: memoizedValue["time"],
                    ...volXAxis
                }
            ],
            yAxis: [
                ohlcYAxis,
                volYAxis
            ],
            series: [
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    itemStyle: {
                        color: '#7fbe9e'
                    },
                    data: memoizedValue["volumn"]
                },
                {
                    type: 'candlestick',
                    name: 'price',
                    data: memoizedValue["ohlc"],
                    itemStyle: {
                        color: '#ef232a', // color when close > open Red
                        color0: '#14b143', // color when close < open Green
                        borderColor: '#ef232a',
                        borderColor0: '#14b143'
                    }
                },
            ]
        })
    }, [data])

    if(data === null || loading) return <h2>loading</h2>

    return (
        <div>
            <ReactECharts
                style={{ height: '800px', width: '100%' }}
                option={option}
                lazyUpdate={true}
                opts={{renderer: 'canvas'}}
            />
        </div>
    )
}



export default memo(Chart)
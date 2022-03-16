import _ from "lodash"

export const mappingData = (api_data={}) => {

    if (_.isEmpty(api_data)) return null 

    // get the timeseries and sorting by the time
    let sorted_data = Object
                .entries(api_data["Time Series (Daily)"])
                .sort(([aTime, aValue],[bTime, bValue]) => aTime.localeCompare(bTime))

    let symbol = api_data["Meta Data"]["2. Symbol"] 
    // extracting the ohlc and time return with array
    let ohlc = sorted_data.map(([time, ohlcv])=> {
        // open close lowest highest
        return [ohlcv["1. open"],ohlcv["4. close"],ohlcv["3. low"],ohlcv["2. high"]]
    })
    // extracting the vol and time return with array
    let volumn = sorted_data.map(([time, ohlcv])=> {
        return ohlcv["5. volume"]
    })

    let time = sorted_data.map(([time, ohlcv])=> time)
    return { ohlc, volumn, time, symbol }
} 
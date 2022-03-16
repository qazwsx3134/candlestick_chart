import React, { useState, useEffect } from 'react'

import Chart from 'components/chart/Chart'
import styles from './index.module.css'

import { stockApi } from 'api/stockApi'

const Dashboard = () => {
    const [stockSymbol, setStockSymbol] = useState('MSFT')

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const stockSymbolChangeHandler = (event) => {
        setStockSymbol(event.target.value);
    }
    
    const submitHandler = (event) => {
        event.preventDefault();
        setLoading(true)
        stockApi(stockSymbol)
            .then((res)=> res.json())
            .then((seriesData) => {
                if (seriesData["Error Message"]) {
                    setError('Please enter the correct symbol of stock')
                } else if (seriesData["Note"]) {
                    setError('Calling frequency is over the standard api, please wait few seconds')
                }else {
                    setData(seriesData)
                    setError(null)
                }
            })
            .catch((err)=>{
                setError(err)
            })
            .finally(()=>{
                setLoading(false)
            })
    };


    useEffect(() => {
        // calling the default symbol of stock
        stockApi(stockSymbol)
            .then((res)=> res.json())
            .then((seriesData) => {
                setData(seriesData)
            })
            .catch((err)=>{
                setError(err)
            })
            .finally(()=>{
                setLoading(false)
            })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    
    return (
        <div>
            <div className={styles.header}>
                <h1>Stock candlestick Dashboard</h1>
            </div>
            <div>
                <form onSubmit={submitHandler} className={styles.inputSection}>
                    <p className={styles.title}>Please Enter the Stock</p>
                    <input 
                        placeholder="Symbol of Stock" 
                        type="text" 
                        className={styles.input} 
                        value={stockSymbol} 
                        onChange={stockSymbolChangeHandler}  
                    />
                    <button type='submit' className={styles.button}>Submit</button>
                </form>
            </div>
            <div className={styles.chartContainer}>
                {error ? <h2 className={styles.error}>{error}</h2> : null }
                {data === null || loading ? <h2>loading</h2> : <Chart data={data} loading={loading} />}
            </div>
        </div>
    )
}

export default Dashboard
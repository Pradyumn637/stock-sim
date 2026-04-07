import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const StockChart = ({ data, color = '#2563eb' }) => {
    const chartContainerRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#64748b',
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            grid: {
                vertLines: { color: '#f1f5f9' },
                horzLines: { color: '#f1f5f9' },
            },
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        candlestickSeries.setData(data);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, color]);

    return <div ref={chartContainerRef} style={{ width: '100%' }} />;
};

export default StockChart;

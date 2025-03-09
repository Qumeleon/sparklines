import './style.css'
import {SparkLineColumnChart, SparkLineGraph, SparkLineWinLoss} from "../packages";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <section>
    <h1>SparkLines</h1>
    <h2>Demos</h2>
    <article>
        <h3>Line graph</h3>
        <div id="sparkLineGraph"></div>
        <h3>Column chart</h3>
        <div id="sparkLineColumnChartEl"></div>
        <h3>Win / loss</h3>
        <div id="sparkLineWinLossEl"></div>
        <h3>Line graph with markers (dots)</h3>
        <div id="sparkLineGraphWithDotsEl"></div>
    </article>
    <article>
        <h2>Documentation</h2>
        <p>Coming soon, for now see README</p>
    </article>
  </section>
`

const sparkLineGraphEl = document.getElementById('sparkLineGraph');
if (sparkLineGraphEl) {
    sparkLineGraphEl.setAttribute('style', 'width: 100px; background: #fff; padding: 5px');
    // your values (data)
    const values = [1, 3, 9, -4, 7, 2, 12, 0, 1]
    // create the sparkline
    const sparkLine = new SparkLineGraph({
        width: 100,
        height: 50,
        color: 'gray' // any valid css color name or hex/rgb(a) code
    }, values)
    // render the sparkline, and attach it to your element
    sparkLineGraphEl.appendChild(sparkLine.render());
}

const sparkLineColumnChartEl = document.getElementById('sparkLineColumnChartEl');
if (sparkLineColumnChartEl) {
    sparkLineColumnChartEl.setAttribute('style', 'width: 100px; background: #fff; padding: 5px');
    // your values (data)
    const values = [8, 23, 9, -4, 7, 21, 4, 12];
    // create the sparkline
    const sparkLine = new SparkLineColumnChart(
        {
            width: 100,
            height: 50,
            color: '#5fadf5' // any valid css color name or hex/rgb(a) code
        },
        values
    );
    // render the sparkline, and attach it to your element
    sparkLineColumnChartEl.appendChild(sparkLine.render());
}

const sparkLineWinLossEl = document.getElementById('sparkLineWinLossEl');
if (sparkLineWinLossEl) {
    sparkLineWinLossEl.setAttribute('style', 'width: 160px; background: #fff; padding: 5px');
    // your values (data)
    const winLossPoints = [18, -3, 9, -4, 7, -21, 4, 12];
    // create the sparkline
    const sparkLine = new SparkLineWinLoss(
        {
            width: 160,
            height: 40,
            colorWin: '#008700', // any valid css color name or hex/rgb(a) code
            colorLoss: '#c00000' // any valid css color name or hex/rgb(a) code
        },
        winLossPoints
    );
    // render the sparkline, and attach it to your element
    sparkLineWinLossEl.appendChild(sparkLine.render());
}

const sparkLineGraphWithDotsEl = document.getElementById('sparkLineGraphWithDotsEl');
if (sparkLineGraphWithDotsEl) {
    sparkLineGraphWithDotsEl.setAttribute('style', 'width: 160px; background: #fff; padding: 5px');
    // your values (data)
    const values = [1, 3, 9, -4, 7, 2, 12, 0, 1]
    // create the sparkline
    const sparkLine = new SparkLineGraph({
        width: 180,
        height: 60,
        color: '#333', // any valid css color name or hex/rgb(a) code
        lineWidth: 1.67, // optional
        markers: {
            color: 'blue', // any valid css color name or hex/rgb(a) code
            size: 5
        }
    }, values)
    // render the sparkline, and attach it to your element
    sparkLineGraphWithDotsEl.appendChild(sparkLine.render());
}
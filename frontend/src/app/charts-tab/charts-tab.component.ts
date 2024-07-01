import { Component } from '@angular/core';
import IndicatorsCore from 'highcharts/indicators/indicators';
import VBP from 'highcharts/indicators/volume-by-price';
import { HighchartsChartModule } from 'highcharts-angular';
import { backendApiService } from '../backendApiService';
import * as Highcharts from 'highcharts/highstock';

IndicatorsCore(Highcharts);
VBP(Highcharts);

@Component({
  selector: 'app-charts-tab',
  templateUrl: './charts-tab.component.html',
  styleUrl: './charts-tab.component.css'
})
export class ChartsTabComponent {
    quote :any;
    ticker: any;
    basicInfo : any;
    peersString : any;
    peers : any;
    volumeDate: any;
    OHLCDate : any;
    chartOptions: any;
    constructorType: string = 'stockChart';
    Highcharts: any = Highcharts;
    isDataAvailable = false;
    constructor(private backendApiService : backendApiService){}
    waitHere(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async ngOnInit(){
        await this.waitHere(1000);
        this.ticker = localStorage.getItem('tickerSearched');
        this.quote = JSON.parse(localStorage.getItem('quote') || '{}');
        this.basicInfo = JSON.parse(localStorage.getItem('companyProfile') || '{}');
        this.volumeDate = JSON.parse(localStorage.getItem('volumeDate') || '{}');
        this.OHLCDate = JSON.parse(localStorage.getItem('OHLCDate') || '{}');
        this.setupChart();
    }

    setupChart(){
        this.chartOptions = {
    
            rangeSelector: {
                selected: 2
            },
    
            title: {
                text: `${this.basicInfo.ticker} Historical`
            },
    
            subtitle: {
                text: 'With SMA and Volume by Price technical indicators'
            },
    
            yAxis: [{
                startOnTick: false,
                endOnTick: false,
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
            }],
    
            tooltip: {
                split: true
            },
    
            plotOptions: {
                series: {
                }
            },
    
            series: [{
                type: 'candlestick',
                name: `${this.basicInfo.ticker}`,
                id: `${this.basicInfo.ticker}`,
                zIndex: 2,
                data: this.OHLCDate
            }, {
                type: 'column',
                name: 'Volume',
                id: 'volume',
                data: this.volumeDate,
                yAxis: 1
            }, {
                type: 'vbp',
                linkedTo: `${this.basicInfo.ticker}`,
                params: {
                    volumeSeriesID: 'volume'
                },
                dataLabels: {
                    enabled: false
                },
                zoneLines: {
                    enabled: false
                }
            }, {
                type: 'sma',
                linkedTo: `${this.basicInfo.ticker}`,
                zIndex: 1,
                marker: {
                    enabled: false
                }
            }]
        }
        this.isDataAvailable = true;
    }
}

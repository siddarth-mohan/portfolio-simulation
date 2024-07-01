import { Component, OnInit } from '@angular/core';
import { backendApiService } from '../backendApiService';
import * as Highcharts from 'highcharts/highstock';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-summaryTab',
    templateUrl: './summaryTab.component.html',
    styleUrls: ['./summaryTab.component.css'],
})

export class summaryTabComponent{
    quote :any;
    ticker: any;
    basicInfo : any;
    peersString : any;
    peers : any;
    chartData: any;
    chartOptions: any;
    constructorType: string = 'stockChart';
    Highcharts: any = Highcharts;
    isDataAvailable = false;
    chartColor = 'black';
    constructor(private backendApiService : backendApiService){

    }

    waitHere(milliseconds: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async ngOnInit(){
        await this.waitHere(1000);
        this.ticker = localStorage.getItem('tickerSearched');
        this.quote = JSON.parse(localStorage.getItem('quote') || '{}');
        this.basicInfo = JSON.parse(localStorage.getItem('companyProfile') || '{}');
        this.chartData = JSON.parse(localStorage.getItem('chartHourlyData') || '{}');
        this.peersString = localStorage.getItem('peers');
        this.peers = this.peersString.split(',');
        this.setupChart(this.chartData, this.ticker);
        
    }

    setupChart(priceDateArray: any, ticker: string) {
      this.isDataAvailable = true;
        const charLineColor = this.quote.d < 0 ? 'red' : 'green';
        this.chartOptions = {
          chart: {
            backgroundColor: '#f8f8f8'
          },
          title: {
              text: "<p style='color: grey;'>" + this.basicInfo.ticker + " Hourly Price Variation</p>",
              useHTML: true,
          },
          navigator: {
            enabled: false,
          },
          rangeSelector: {
            enabled: false,
          },
          scrollbar: {
            enabled: false,
          },
          yAxis: [{
            opposite: true,
            className: 'stock-title',
            tickAmount: 8,
        }],
          series: [{
              type: 'line',
              name: this.basicInfo.ticker,
              data: priceDateArray,
              tooltip: {
                  valueDecimals: 2
              },
              color: charLineColor,
              pointInterval: 2 * 3600 * 1000,
          }]
        };
      }
}
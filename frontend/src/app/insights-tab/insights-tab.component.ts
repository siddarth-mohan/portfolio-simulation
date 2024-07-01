import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Subscription } from 'rxjs';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-insights-tab',
  templateUrl: './insights-tab.component.html',
  styleUrl: './insights-tab.component.css'
})
export class InsightsTabComponent{
  basicInfo : any;
  insiderData : any;
  recommTrends : any;
  earnings : any;
  totalMSPR : any;
  posMSPR : any;
  negMSPR : any;
  totalChng : any;
  posChng : any;
  negChng : any;
  Highcharts: any = Highcharts;
  isDataAvailable = false;
  isRecomReady = false;
  isSurpReady = false;
  chartOptionsRecom: any;
  chartOptionsSurp: any;
  constructorType: string = 'chart';

  constructor(){}

  ngOnInit(){

    this.basicInfo = JSON.parse(localStorage.getItem('companyProfile') || '{}');
    this.insiderData = JSON.parse(localStorage.getItem('insiderSentiment') || '{}');
    this.recommTrends = JSON.parse(localStorage.getItem('recommTrends') || '{}');
    this.earnings = JSON.parse(localStorage.getItem('earnings') || '{}');
    
    var temp = [{ symbol: "AAPL", year: 2022, month: 2, change: -28436, mspr: -49.702858 }];
    temp = temp.slice(1);
    var tot = [1,2];
    var pos = [1,2];
    var neg = [1,2];
    tot = tot.slice(2);
    pos = pos.slice(2);
    neg = neg.slice(2);

    temp = this.insiderData.data;
    temp.forEach(obj => {
      tot.push(obj.mspr);
      if (obj.mspr > 0) {
        pos.push(obj.mspr);
      } else if (obj.mspr < 0) {
        neg.push(obj.mspr);
      }
    });

    var sum = tot.reduce((acc, val) => acc + val, 0);
    this.totalMSPR = sum / tot.length;
    sum = pos.reduce((acc, val) => acc + val, 0);
    this.posMSPR = sum / pos.length;
    sum = neg.reduce((acc, val) => acc + val, 0);
    this.negMSPR = sum / neg.length;

    var totch = [1,2];
    var posch = [1,2];
    var negch = [1,2];
    totch = totch.slice(2);
    posch = posch.slice(2);
    negch = negch.slice(2);

    temp.forEach(obj => {
      totch.push(obj.change);
      if (obj.mspr > 0) {
        posch.push(obj.change);
      } else if (obj.mspr < 0) {
        negch.push(obj.change);
      }
    });

    var sum = totch.reduce((acc, val) => acc + val, 0);
    this.totalChng = sum / tot.length;
    sum = posch.reduce((acc, val) => acc + val, 0);
    this.posChng = sum / pos.length;
    sum = negch.reduce((acc, val) => acc + val, 0);
    this.negChng = sum / neg.length;


    this.setupChartRecom();
    this.setupChartSurp();

  }

  setupChartRecom() {
    this.isRecomReady = true;
    this.chartOptionsRecom=  {
        chart: {
          type: 'column',
          backgroundColor: '#f8f8f8',
      },
        rules: [{
      condition: {
        maxWidth: 500
    }}],
      title: {
          text: 'Recommendation Trends',
          align: 'center'
      },
      xAxis: {
          categories: [this.recommTrends[0].period,this.recommTrends[1].period,this.recommTrends[2].period,this.recommTrends[3].period]
      },
      yAxis: {
          min: 0,
          title: {
              text: '#Analysis'
          },
          stackLabels: {
              enabled: true
          }
      },
      legend: {
          align: 'center',
          floating: false,
          backgroundColor: '#f8f8f8',
          borderColor: '#CCC',
          borderWidth: 1,
          shadow: false
      },
      tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },
      plotOptions: {
          column: {
              stacking: 'normal',
              dataLabels: {
                  enabled: true
              }
          }
      },
      series: [{
          name: 'Strong Buy',
        data: [this.recommTrends[0].strongBuy,this.recommTrends[1].strongBuy,this.recommTrends[2].strongBuy,this.recommTrends[3].strongBuy],
          color : '#1a6334'
      }, {
          name: 'Buy',
          data: [this.recommTrends[0].buy,this.recommTrends[1].buy,this.recommTrends[2].buy,this.recommTrends[3].buy],
          color : '#24af50'
      }, {
          name: 'Hold',
          data: [this.recommTrends[0].hold,this.recommTrends[1].hold,this.recommTrends[2].hold,this.recommTrends[3].hold],
          color : '#b07e28'
      },{
        name: 'Sell',
        data: [this.recommTrends[0].sell,this.recommTrends[1].sell,this.recommTrends[2].sell,this.recommTrends[3].sell],
        color : '#f15053'
      },{
      name: 'Strong Sell',
      data: [this.recommTrends[0].strongSell,this.recommTrends[1].strongSell,this.recommTrends[2].strongSell,this.recommTrends[3].strongSell],
      color : '#752b2c'
      }]
    }

  }

  setupChartSurp() {
    this.isSurpReady = true;
    var xaxis = [];
    for(var i=0;i<4;i++){
      var temp = "";
      temp = this.earnings[i].period.slice(0,10) + '<br>' + this.earnings[i].surprise;
      xaxis.push(temp);
    }
    this.chartOptionsSurp = {
        chart: {
            type: 'spline',
            backgroundColor: '#f8f8f8',
        },
        title: {
            text: 'Historical EPS Surprises'
        },
        
        xAxis: {
            categories: xaxis,
            accessibility: {
                description: 'Months of the year'
            }
        },
        yAxis: {
            title: {
                text: 'Quatarly EPS'
            },
            labels: {
                format: '{value}'
            }
        },
        tooltip: {
            crosshairs: true,
            shared: true
        },
        plotOptions: {
            spline: {
                marker: {
                    radius: 4,
                    lineColor: '#666666',
                    lineWidth: 1
                }
            }
        },
        series: [{
            name: 'Actual',
            marker: {
                symbol: 'circle'
            },
            data: [this.earnings[0].actual,this.earnings[1].actual,this.earnings[2].actual,this.earnings[3].actual]

        }, {
            name: 'Estimate',
            marker: {
                symbol: 'diamond'
            },
            data: [this.earnings[0].estimate,this.earnings[1].estimate,this.earnings[2].estimate,this.earnings[3].estimate]
        }]
      }
    }
}

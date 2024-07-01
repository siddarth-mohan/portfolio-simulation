import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
    providedIn: 'root'
})
  export class backendApiService {
    host = 'https://sid-assignment3-backend.wl.r.appspot.com';
    tickerStored = new BehaviorSubject<string>("");
    constructor(private http: HttpClient) { }
  
    getStockSymbols(ticker : string): Observable<string[]> {
        return this.http.get<any>(this.host + `/autocomplete/${ticker}`);
    }

    async getOnlyStockProfile(ticker : string){
      var url = this.host + `/search/companyProfile/${ticker}`
      var response = await fetch(url);
      var companyProf = await response.json();
      return companyProf;
    }

    async getCompanyProfile(ticker : string){
      var url = this.host + `/search/peers/${ticker}`;
      var response = await fetch(url);
      var peers = await response.json();
      localStorage.setItem('peers', peers);

      url = this.host + `/news/${ticker}`;
      response = await fetch(url);
      var news = await response.json();
      localStorage.setItem('news', JSON.stringify(news));


      url = this.host + `/insights/insiderSenti/${ticker}`;
      response = await fetch(url);
      var insiderSentiment = await response.json();
      localStorage.setItem('insiderSentiment', JSON.stringify(insiderSentiment));

      url = this.host + `/insights/recomm/${ticker}`;
      response = await fetch(url);
      var recommTrends = await response.json();
      localStorage.setItem('recommTrends', JSON.stringify(recommTrends));
      
      url = this.host + `/insights/earnings/${ticker}`;
      response = await fetch(url);
      var earnings = await response.json();
      localStorage.setItem('earnings', JSON.stringify(earnings));
    }

    async getCompanyDataDynamicSearchPage(){
      var ticker = localStorage.getItem('tickerSearched');
      var url = this.host + `/search/companyQuote/${ticker}`
      var response = await fetch(url);
      var quote = await response.json();
      localStorage.setItem('quote', JSON.stringify(quote));
    }

    async getWatchlist(){
      var url = this.host + `/watchlist`;
      var response = await fetch(url);
      var watchlistElements = await response.json();
      return watchlistElements;
    }

    async getWatchlistAsArray(){
      var url = this.host + `/watchlistAsArray`;
      var response = await fetch(url);
      var watchlistElements = await response.json();
      return watchlistElements;
    }
    
    async deleteWatchlistElement(ticker:string){
      var url = this.host + `/watchlist/remove/${ticker}`;
      var response = await fetch(url);
    }

    async watchlistDataUpdater(ticker:string){
      var url = this.host + `/search/companyQuote/${ticker}`
      var response = await fetch(url);
      var quote = await response.json();
      return quote;
    }

    async addWatchlistElement(ticker: string){
      var url = this.host + `/watchlist/add/${ticker}`;
      var response = await fetch(url);
    }

    async getChartsHourlyData(ticker: string, from: string, to: string){
      var url = this.host + `/search/charts/hourly/${ticker}/${from}/${to}`;
      var response = await fetch(url);
      var chartHourlyData = await response.json();
      var priceDate = chartHourlyData.results.map((obj: { t: any; c: any; }) => {
        return [obj.t, obj.c];
      });
      localStorage.setItem("chartHourlyData", JSON.stringify(priceDate));
    }


    async getChartsDailyData(ticker: string, from: string, to: string){
      var url = this.host + `/search/charts/daily/${ticker}/${from}/${to}`;
      var response = await fetch(url);
      var chartDailyData = await response.json();
      

      var volumeDate = chartDailyData.results.map((obj: { t: any; v: any; }) => {
        return [obj.t, obj.v];
      });

      var OHLCDate = chartDailyData.results.map((obj: { t: any; o: any;h: any;l: any;c: any; }) => {
        return [obj.t, obj.o, obj.h, obj.l, obj.c];
      });
      localStorage.setItem("volumeDate", JSON.stringify(volumeDate));
      localStorage.setItem("OHLCDate", JSON.stringify(OHLCDate));
    }

    async getFundsAvailable(){
      var url = this.host + `/fundsAvailable`;
      var response = await fetch(url);
      var fundsAvailable = await response.json();
      return fundsAvailable;
    }

    async getPortfolioDetails(){
      var url = this.host + `/getPortfolio`;
      var response = await fetch(url);
      var portFinal = await response.json();
      return portFinal;
    }

    async getCurrentPrice(ticker : string){
      var url = this.host + `/search/companyQuote/${ticker}`
      var response = await fetch(url);
      var quote = await response.json();
      return quote.c;
    }

    async updateFundsAvailable(newFunds : number){
      var url = this.host + `/fundsAvailable/edit/${newFunds}`
      var response = await fetch(url);
    }

    async updatePortfolioDetails(portElement : any){
      var portEleString = JSON.stringify(portElement);
      var url = this.host + `/updatePortfolio/${portEleString}`
      var response = await fetch(url);
      var resp = await response.json();
    }

    async removePortfolioElement(ticker : string){
      var url = this.host + `/removePortfolioElement/${ticker}`;
      var response = await fetch(url);
      var resp = await response.json();
    }
}
import { Component, OnInit, OnDestroy, inject, OnChanges } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { backendApiService } from '../backendApiService';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';


import { ModalDismissReasons, NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
@Component({
	selector: 'ngbd-modal-content',
	standalone: true,
    templateUrl: './buyOrSellModal.component.html',
    imports: [CommonModule,FormsModule]
})

export class NgbdModalContents {
	activeModal = inject(NgbActiveModal);
    public portfolioElement={"ticker" : "asdas", "name" : "qwe", "qty" : 1, "avgCost" : 2, "totalCost" : 3, "change" : 5, "currentPrice": 6, "marketValue" : 7};
    public isBuy = true;
    public fundsAvailable = 1;
    public quantityInput = 0;

    performTransaction(opr : any){
        this.activeModal.close({ ticker: this.portfolioElement.ticker, quantity: this.quantityInput, priceOfOpr : this.portfolioElement.currentPrice , operation: opr });
    }
}





@Component({
    selector: 'app-stockInfo',
    templateUrl: './stockInfo.component.html',
    styleUrls: ['./stockInfo.component.css'],
})

export class stockInfoComponent implements OnInit{
    ticker : any;
    basicInfo : any;
    quote : any;
    insiderSentiment :any;
    peers = [];
    earnings :any;
    news = [];
    recommTrends = [];
    isWatchlisted = false;
    isLoading : any;
    marketStatus = "";
    isMarketOpen = true;
    todaysDate : any;
    from : any;
    dayFrom : any;
    isInPortfolio : any;
    currentQty = 0;
    portfolioElement : any;
    private updateIntervalId: any;
    private modalService = inject(NgbModal);
    fundsAvailable : any;
    transactionTicker  :any;
    buyTransaction = true;
    transactionSuccess = false;
    isTickerInvalid = false;
    watchlistButtonClicked = false;
    upadtedTicker : any;
    constructor(private backendApiService : backendApiService, private route: ActivatedRoute){}

    waitHere(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    ngOnInit(){
        this.route.params.subscribe(async params => {
            this.ticker = params['ticker'];
            this.ticker = this.ticker.toUpperCase();
            if(localStorage.getItem("tickerSearched") != this.ticker){
                this.isLoading = true;
                var temporary = await this.backendApiService.getOnlyStockProfile(this.ticker);
                if(JSON.stringify(temporary) == '{}'){
                    this.isTickerInvalid = true;
                    this.isLoading = false;
                }else{
                    this.isTickerInvalid = false;
                    localStorage.setItem('isInval', this.isTickerInvalid.toString());
                    localStorage.setItem('tickerSearched', this.ticker);
                    localStorage.setItem('companyProfile', JSON.stringify(temporary));
                    this.isLoading = true;
                    this.fetchWatchlistPortfolioFundsData();
                    this.callBackendAPI();
                }
            }
            else{
                this.ticker = localStorage.getItem('tickerSearched');
                this.fetchWatchlistPortfolioFundsData();
                this.quote = JSON.parse(localStorage.getItem('quote') || '{}');
                this.processDatesAndMarketStatus();
                this.loadAllData();
            }
        });
    }
  
    ngOnDestroy(): void {
        if (this.updateIntervalId) {
            clearInterval(this.updateIntervalId);
        }
    }

    async updateData(){
        await this.backendApiService.getCompanyDataDynamicSearchPage();
        this.quote = JSON.parse(localStorage.getItem('quote') || '{}');
        var timestamp = this.quote.t * 1000;
        this.quote.t = moment(timestamp).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss');

        const currentTime = moment().tz('America/Los_Angeles');
        const quoteTime = moment(this.quote.t, 'YYYY-MM-DD HH:mm:ss').tz('America/Los_Angeles');
        const diffMinutes = currentTime.diff(quoteTime, 'minutes');
        if (diffMinutes >= 5) {
            this.marketStatus = "Market closed on " + this.quote.t;
            this.isMarketOpen = false;
            if (this.updateIntervalId) {
                clearInterval(this.updateIntervalId);
            }

        } else {
            this.marketStatus = "Market is Open";
            this.isMarketOpen = true;
        }
    }

    addOrRemoveFromWatchlist(): void {
        if(this.isWatchlisted){
            this.backendApiService.deleteWatchlistElement(this.ticker);
        }else{
            this.backendApiService.addWatchlistElement(this.ticker);
        }
        this.isWatchlisted = !this.isWatchlisted;
        this.watchlistButtonClicked = true;
        setTimeout(() => this.watchlistButtonClicked = false, 5000);
    }

    open(portfolioElement : any, isBuy : any) {
        if(JSON.stringify(this.portfolioElement) == '{}'){
            this.portfolioElement = {"ticker" : this.ticker, "name" : this.basicInfo.name, "qty" : 0, "avgCost" : 0};
            this.portfolioElement.currentPrice = this.quote.c;
        }else{
            this.portfolioElement.currentPrice = this.quote.c;
        }
        portfolioElement = this.portfolioElement;
		const modalRef = this.modalService.open(NgbdModalContents);
		modalRef.componentInstance.portfolioElement = portfolioElement;
        modalRef.componentInstance.isBuy = isBuy;
        modalRef.componentInstance.fundsAvailable = this.fundsAvailable;
        modalRef.result.then(
            (result) => {
              this.executeOperation(result);
            },
            (reason) => {
            }
          );
    }

    async executeOperation(modalResult : any){
        var opr = modalResult.operation;
        var cp = modalResult.priceOfOpr;
        var qty = modalResult.quantity;
        var tick = modalResult.ticker;
        this.transactionTicker = tick.toUpperCase();
        if(opr == 'buy'){
            this.buyTransaction = true;
            this.fundsAvailable = this.fundsAvailable - (qty*cp);
            this.backendApiService.updateFundsAvailable(this.fundsAvailable);

            var prevQty = this.portfolioElement.qty;
            var prevAvg = this.portfolioElement.avgCost;
            var prevTotal = prevAvg * prevQty;
            var newAvg = (prevTotal + (qty*cp))/(prevQty+qty);
            this.portfolioElement.qty = prevQty+qty;
            this.portfolioElement.avgCost = newAvg;
            
            await this.backendApiService.updatePortfolioDetails({"ticker" : tick, "name" : this.portfolioElement.name, "qty" : this.portfolioElement.qty, "avgCost" : this.portfolioElement.avgCost});
            this.transactionSuccess = true;
            setTimeout(() => this.transactionSuccess = false, 5000);
        }else{
            this.buyTransaction = false;
            this.fundsAvailable = this.fundsAvailable + (qty*cp);
            this.backendApiService.updateFundsAvailable(this.fundsAvailable);
            if(this.portfolioElement.qty == qty){
                this.backendApiService.removePortfolioElement(this.portfolioElement.ticker);
                this.isInPortfolio = false;
                this.currentQty = 0;
            }
            else{
                var prevQty = this.portfolioElement.qty;
                var prevAvg = this.portfolioElement.avgCost;
                var prevTotal = prevAvg * prevQty;

                this.portfolioElement.qty = prevQty - qty;
                
                await this.backendApiService.updatePortfolioDetails({"ticker" : tick, "name" : this.portfolioElement.name, "qty" : this.portfolioElement.qty, "avgCost" : this.portfolioElement.avgCost});
            }
            this.transactionSuccess = true;
            setTimeout(() => this.transactionSuccess = false, 5000);
        }
        this.checkPortfolio();
    }

    async fetchWatchlistPortfolioFundsData(){
        this.fundsAvailable = await this.backendApiService.getFundsAvailable();
        
        
        var tempo = await this.backendApiService.getWatchlistAsArray();
        localStorage.setItem("watchlistArray", tempo);
        this.isWatchlisted = tempo.includes(this.ticker);

        var porto = await this.backendApiService.getPortfolioDetails();
        var ele = {"ticker" : "aapl", "name" : "asd", "qty" : 199, "avgCost" : 1203};
        const foundObject = porto.find((ele: { ticker: string; }) => ele.ticker === this.ticker);
        if (foundObject) {
        this.currentQty = foundObject.qty;
        this.portfolioElement = foundObject;
        this.portfolioElement.currentPrice = this.quote.c;
        }else{
            this.portfolioElement = {};
        }

        if(this.currentQty > 0){
            this.isInPortfolio = true;
        }
    }

    async checkPortfolio(){
        this.fundsAvailable = await this.backendApiService.getFundsAvailable();
        var porto = await this.backendApiService.getPortfolioDetails();
        var ele = {"ticker" : "aapl", "name" : "asd", "qty" : 199, "avgCost" : 1203};
        const foundObject = porto.find((ele: { ticker: string; }) => ele.ticker === this.ticker);
        if (foundObject) {
        this.currentQty = foundObject.qty;
        this.portfolioElement = foundObject;
        this.portfolioElement.currentPrice = this.quote.c;
        }else{
            this.portfolioElement = {};
            this.isInPortfolio = false;
        }

        if(this.currentQty > 0){
            this.isInPortfolio = true;
        }
    }

     async callBackendAPI(){
        
        await this.backendApiService.getCompanyProfile(this.ticker);

        await this.backendApiService.getCompanyDataDynamicSearchPage();
        this.quote = await JSON.parse(localStorage.getItem('quote') || '{}');
        await this.processDatesAndMarketStatus();

        await this.backendApiService.getChartsHourlyData(this.ticker, this.from, this.todaysDate);    
        await this.backendApiService.getChartsDailyData(this.ticker, this.dayFrom, this.todaysDate);
        await this.backendApiService.tickerStored.next(this.ticker);

        await this.loadAllData();

    }

    processDatesAndMarketStatus(){
        var timestamp = this.quote.t * 1000;
        this.quote.t = moment(timestamp).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss');

        const currentTime = moment().tz('America/Los_Angeles');
        const quoteTime = moment(this.quote.t, 'YYYY-MM-DD HH:mm:ss').tz('America/Los_Angeles');
        const diffMinutes = currentTime.diff(quoteTime, 'minutes');

        if (diffMinutes >= 5) {
            this.marketStatus = "Market closed on " + this.quote.t;
            this.isMarketOpen = false;
        } else {
            this.marketStatus = "Market is Open";
            this.isMarketOpen = true;
        }

        this.todaysDate = moment().format('YYYY-MM-DD');

        if(this.isMarketOpen==true){
            this.from = moment(this.todaysDate).subtract(1, 'days').format('YYYY-MM-DD');
        }else{
            var temp = this.quote.t.substring(0,10);
            this.from = moment(temp).subtract(1, 'days').format('YYYY-MM-DD');
        }
        
        this.dayFrom = moment(this.todaysDate).subtract(2, 'years').format('YYYY-MM-DD');
    }

    async loadAllData(){

        if(JSON.stringify(await this.backendApiService.getOnlyStockProfile(this.ticker)) == '{}'){
            this.isTickerInvalid = true;
            this.isLoading = false;
        }
        else{
            this.basicInfo = JSON.parse(localStorage.getItem('companyProfile') || '{}');

            this.ticker = localStorage.getItem('tickerSearched');
            this.isLoading = false;
            this.updateIntervalId = setInterval(() => {
                this.updateData();
            }, 15000);
        }
    }
}
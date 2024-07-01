import { Component, inject } from '@angular/core';
import { backendApiService } from '../backendApiService';
import { ModalDismissReasons, NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'ngbd-modal-content',
	standalone: true,
    templateUrl: './buySellModal.component.html',
    imports: [CommonModule,FormsModule]
})

export class NgbdModalContent {
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
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrls: ['./portfolio.component.css'],

})

export class PortfolioComponent{
    isEmpty = false;
    isLoading = true;
    fundsAvailable : any;
    portfolioDetails : any;
    portFinal = [{"ticker" : "asdas", "name" : "qwe", "qty" : 1, "avgCost" : 2, "totalCost" : 3, "change" : 5, "currentPrice": 6, "marketValue" : 7}];
    trial = [{"ticker" : "asddd", "name" : "qwe", "qty" : 1, "avgCost" : 2, "totalCost" : 3, "change" : 5, "currentPrice": 6, "marketValue" : 7}]
    private modalService = inject(NgbModal);
    transactionSuccess = false;
    buyTransaction = true;
    transactionTicker : any;
    constructor(private backendApiService : backendApiService, private router : Router){

    }

    async ngOnInit(){
        this.isEmpty = false;
        this.isLoading = true;
        this.fundsAvailable = await this.backendApiService.getFundsAvailable();
        this.portfolioDetails = await this.backendApiService.getPortfolioDetails();
        if(this.portfolioDetails.length==0){
            this.isEmpty = true;
            this.isLoading = false;
            this.trial = this.trial.slice(1);
        }
        else{
            for (let i = 0; i < this.portfolioDetails.length; i++) {
                var temp = this.portfolioDetails[i].ticker.toUpperCase();
                var cp = await this.backendApiService.getCurrentPrice(temp);
                var total = this.portfolioDetails[i].qty * this.portfolioDetails[i].avgCost;
                var marketValue = this.portfolioDetails[i].qty * cp;
                var change = cp - this.portfolioDetails[i].avgCost;
                var tempObj = {"ticker" : "asddd", "name" : "qwe", "qty" : 1, "avgCost" : 2, "totalCost" : 3, "change" : 5, "currentPrice": 6, "marketValue" : 7};
                tempObj.ticker = temp;
                tempObj.name = this.portfolioDetails[i].name;
                tempObj.qty = this.portfolioDetails[i].qty;
                tempObj.avgCost = this.portfolioDetails[i].avgCost;
                tempObj.totalCost = total;
                tempObj.change = change;
                tempObj.currentPrice = cp;
                tempObj.marketValue = marketValue;
                this.portFinal.push(tempObj);
            }
            this.trial = this.portFinal;
            this.trial = this.trial.slice(1);
            this.isLoading = false;
        }
        
    }

    open(portfolioElement : any, isBuy : any) {
		const modalRef = this.modalService.open(NgbdModalContent);
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
            const index = this.trial.findIndex(obj => obj.ticker === tick);
            var prevQty = this.trial[index].qty;
            var prevAvg = this.trial[index].avgCost;
            var prevTotal = prevAvg * prevQty;
            var newAvg = (prevTotal + (qty*cp))/(prevQty+qty);
            this.trial[index].qty = prevQty+qty;
            this.trial[index].avgCost = newAvg;
            this.trial[index].totalCost = prevTotal + (qty*cp);
            this.trial[index].change = cp - newAvg;
            this.trial[index].marketValue = cp * (prevQty+qty);
            await this.backendApiService.updatePortfolioDetails({"ticker" : tick, "name" : this.trial[index].name, "qty" : this.trial[index].qty, "avgCost" : this.trial[index].avgCost});
            this.transactionSuccess = true;
            setTimeout(() => this.transactionSuccess = false, 5000);
        }else{
            this.buyTransaction = false;
            this.fundsAvailable = this.fundsAvailable + (qty*cp);
            this.backendApiService.updateFundsAvailable(this.fundsAvailable);
            const index = this.trial.findIndex(obj => obj.ticker === tick);
            if(this.trial[index].qty == qty){
                this.backendApiService.removePortfolioElement(this.trial[index].ticker);
                this.trial.splice(index,1);
            }
            else{
                var prevQty = this.trial[index].qty;
                var prevAvg = this.trial[index].avgCost;
                var prevTotal = prevAvg * prevQty;

                this.trial[index].qty = prevQty - qty;
                this.trial[index].totalCost = prevAvg * this.trial[index].qty;
                this.trial[index].change = cp - prevAvg;
                this.trial[index].marketValue = cp * this.trial[index].qty;
                await this.backendApiService.updatePortfolioDetails({"ticker" : tick, "name" : this.trial[index].name, "qty" : this.trial[index].qty, "avgCost" : this.trial[index].avgCost});
            }
            this.transactionSuccess = true;
            setTimeout(() => this.transactionSuccess = false, 5000);
            this.isPortfolioEmpty();

        }

    }

    isPortfolioEmpty(){
        if(this.trial.length == 0){
            this.isEmpty = true;
        }
    }

    goToTickerSearch(stockInfo : string){
        var goToTicker = stockInfo;
        this.router.navigate([`/search/${goToTicker}`]);
    }
}
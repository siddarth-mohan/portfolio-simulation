import { Component,OnInit } from '@angular/core';
import { backendApiService } from '../backendApiService';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-watchlist',
    templateUrl: './watchlist.component.html',
    styleUrl: './watchlist.component.css'
})

export class WatchlistComponent implements OnInit{
    isLoading = false;
    watchlistElements: { [key: string]: any } = {};
    watchLen : number = -1;
    private updateIntervalId: any;
    isEmpty = false;
    constructor(private backendApiService: backendApiService, private router: Router) {}
    
    ngOnInit(): void {
        this.isLoading = true; 
        this.backendApiService.getWatchlist().then(data => {
            this.watchlistElements = data; 
            this.isLoading = false;
            var respString = JSON.stringify(this.watchlistElements);
            if (respString === '{}'){
                this.isEmpty = true;
            }

        }).catch(error => {
            this.isLoading = false; 
        });
        this.updateIntervalId = setInterval(() => {
          this.getWatchlistData();
        }, 15000);
    }

    ngOnDestroy(): void {
      if (this.updateIntervalId) {
          clearInterval(this.updateIntervalId);
      }
    }

    getWatchlistData(){
      for (let key in this.watchlistElements) {
          if (this.watchlistElements.hasOwnProperty(key)) {
              this.backendApiService.watchlistDataUpdater(key).then(updatedData => {
              this.watchlistElements[key].c = updatedData.c; 
              this.watchlistElements[key].d = updatedData.d;
              this.watchlistElements[key].dp = updatedData.dp;
            }).catch(error => {
            });
          }
        }
    }

    removeFromWatchlist(key: string): void {
      if (this.watchlistElements && this.watchlistElements[key]) {
          delete this.watchlistElements[key];
          this.backendApiService.deleteWatchlistElement(key);
          this.isWatchlistEmpty();
      }
    }

    isWatchlistEmpty(){
      var respString = JSON.stringify(this.watchlistElements);
      if (respString === '{}'){
          this.isEmpty = true;
      }
    }

    goToTickerSearch(stockInfo : string){
        var goToTicker = stockInfo;
        this.router.navigate([`/search/${goToTicker}`]);
    }
}
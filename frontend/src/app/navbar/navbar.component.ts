import { Component } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { backendApiService } from '../backendApiService';


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
})

export class navbarComponent{
    activeLink: string = 'search';
    storedTicker : string = "";
    constructor(private router: Router, private backendApiService : backendApiService) {
        this.backendApiService.tickerStored.subscribe((newValue)=>{
            if(!newValue) this.storedTicker = "home";
            else this.storedTicker = newValue;
        })
        var temp = localStorage.getItem("tickerSearched");
        this.router.events.subscribe((val) => {
            if (this.router.url === '/search/home') {
                this.activeLink = 'search';
            } else if (this.router.url === '/watchlist') {
                this.activeLink = 'watchlist';
            } else if (this.router.url === '/portfolio') {
                this.activeLink = 'portfolio';
            }else{
                this.activeLink = 'search';
            }
        });
    }

    setActiveLink(link: string) {
        this.activeLink = link;
    }

}
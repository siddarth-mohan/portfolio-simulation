import { Component , ViewChild } from '@angular/core';
import { backendApiService } from '../backendApiService'

import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, tap, catchError,finalize } from 'rxjs/operators';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})

export class searchComponent{

    myControl = new FormControl();
    options: Observable<string[]> | null = null;
    selectedValue: string = '';
    selectedOption: string = '';
    isLoading = false;
    @ViewChild(MatAutocompleteTrigger) trigger!: MatAutocompleteTrigger;
    constructor(private backendApiService: backendApiService, private router: Router, private activatedRoute : ActivatedRoute){
      var temp = activatedRoute.snapshot.paramMap.get("ticker")?.toUpperCase();
      this.myControl.setValue(temp);

      var prevTicker = localStorage.getItem("tickerSearched");
      if(temp && temp != prevTicker){
        this.backendApiService.tickerStored.next(temp);
      }

      this.myControl.valueChanges.pipe(
            distinctUntilChanged(),
            tap(value => {
              if(value != ""){
                this.isLoading = true;
              }
              
            }),
            switchMap(value => 
                this.backendApiService.getStockSymbols(value).pipe(
                catchError(() => {
                  return of([]); 
                })
              )
            )
          ).subscribe(data => {
            this.options = of(data);
            this.isLoading = false;
          });

        this.myControl.valueChanges.subscribe(value => {
          debounceTime(0),        
            this.selectedValue = value;
        });
    }

    onEnter() {
      this.isLoading = false;
      this.selectedValue = this.myControl.value;
      this.closeAutocompletePanel(); 
    }

    closeAutocompletePanel() {
      if (this.trigger && this.trigger.panelOpen) {
        this.trigger.closePanel();
      }
    }



    onOptionSelected(option: string) {
        this.closeAutocompletePanel();
        this.selectedOption = option;
        this.onSubmit(this.selectedOption[0]);
    }

    onSubmit(option: string) {
        localStorage.clear();
        this.closeAutocompletePanel();
        var store;
        if(option == ""){
            store = this.selectedValue;
        }
        else{
            store = option;
        }
        this.router.navigate([`/search/`, store]);
    }

    clearInput() {
        this.myControl.reset(); 
        this.selectedOption = '';
        this.isLoading = false;
        localStorage.clear();
        this.router.navigate([`/search/home`]);
        this.backendApiService.tickerStored.next("");
    }
    
}

function waitHere(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { navbarComponent } from './navbar/navbar.component';
import { searchComponent } from './search/search.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { stockInfoComponent } from './stockInfo/stockInfo.component';
import { summaryTabComponent } from './summaryTab/summaryTab.component';
import { newsTabComponent } from './newsTab/newsTab.component';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { backendApiService } from './backendApiService'
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgbNavModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment-timezone';
import {MatTabsModule} from '@angular/material/tabs';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartsTabComponent } from './charts-tab/charts-tab.component';
import { InsightsTabComponent } from './insights-tab/insights-tab.component';

@NgModule({
  declarations: [
    AppComponent,
    searchComponent,
    WatchlistComponent,
    navbarComponent,
    PortfolioComponent,
    stockInfoComponent,
    summaryTabComponent,
    newsTabComponent,
    ChartsTabComponent,
    InsightsTabComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    FormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgbNavModule,
    NgbModule,
    MatTabsModule,
    HighchartsChartModule
  ],
  providers: [
    provideAnimationsAsync('animations'),
    [backendApiService]
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

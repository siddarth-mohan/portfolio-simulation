import { Component, OnInit, inject, TemplateRef } from '@angular/core';
import { backendApiService } from '../backendApiService';
import * as Highcharts from 'highcharts/highstock';
import { HighchartsChartModule } from 'highcharts-angular';
import { ModalDismissReasons, NgbModal,NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';



@Component({
	selector: 'ngbd-modal-content',
	standalone: true,
    templateUrl: './newsTabModal.component.html',
})

export class NgbdModalContent {
	activeModal = inject(NgbActiveModal);
    public newsRecord={ "headline" : "asd", "image": "asd", "summary" : "asd", "dateString" : "asd", "source": "asd", "url": "asd"};
}


@Component({
    selector: 'app-newsTab',
    templateUrl: './newsTab.component.html',
    styleUrls: ['./newsTab.component.css'],

})

export class newsTabComponent{
    news : any;
    finalNews  = [{ "headline" : "asd", "image": "asd", "summary" : "asd", "datetime" : 1234, "dateString" : "asd"}];
    selectedItem : any;
    isdataLoaded = false;
    private modalService = inject(NgbModal);
    closeResult: any;

    constructor(private backendApiService : backendApiService){}
    ngOnInit(){
        this.news = JSON.parse(localStorage.getItem('news') || '{}');
        var ctr=0;
        
        if (JSON.stringify(this.news) != '{}'){
            for(let i=0; i<this.news.length; i++){
                if(ctr==20)  break;
                else{
                    var record = this.news[i]
                    if(record.url != "" && record.image != "" && record.headline != "" && record.datetime != ""){
                    this.finalNews.push(record);
                            ctr++;
                    }
                }
            }
            this.finalNews = this.finalNews.slice(1);
            for(var i=0;i<this.finalNews.length;i++){
                var date = new Date(this.finalNews[i].datetime * 1000);
                var months = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
                this.finalNews[i].dateString = months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
            }
            this.isdataLoaded = true;
        }
        
    }
    
	open(newsRecord : any) {
		const modalRef = this.modalService.open(NgbdModalContent);
		modalRef.componentInstance.newsRecord = newsRecord;
    }
}
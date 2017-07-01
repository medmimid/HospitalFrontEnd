import { Injectable } from '@angular/core';
//----------------Service------------------------------
//-------------Routing---------------------------------
//-------------Model-----------------------------------
//-------------Module----------------------------------
//------------Component--------------------------------

// const url = 'https://apis.google.com/js/client.js?onload=__onGoogleLoaded';

@Injectable()
export class UtilService {
    
    constructor() { }
    
    public dateChange(date) {
        var myDate = new Date();
        myDate.setTime(date);
        return (myDate.getMonth() + 1) + '/' +myDate.getDate() + '/' +  myDate.getFullYear();
    }
    
    public status(item) {
        if(item.open) {
            return "Open"; 
        }else if(item.pending) {
           return "Pending";
        }else {
              return "Closed";
        } 
    }
    
    public getTodayDate() {
        var dateObj = new Date();
        console.log(dateObj);
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        var newdate = year + "-" + month + "-" + day;
        return new Date();
  }
  

}
import { Component , OnInit } from '@angular/core';
import { DocterService } from '../_services/index';
import {DocterTypeService , NoteService , AlertService} from '../_services/index';
import {PatientService, SharedService} from '../_services/index'; 
import { Router, ActivatedRoute } from '@angular/router';
import {Note , Docter , DocterType} from '../_models/index';
import { DialogService } from "ng2-bootstrap-modal";
import { NoteDialogComponent } from './index';

@Component({
    moduleId:module.id,
    selector: 'add_note',  
    templateUrl:'addNote.component.html',
    styleUrls: ['addNote.component.css']
    
})
export class AddNote implements OnInit{

   public page:number = 1;
   public itemsPerPage:number = 10;
   public maxSize:number = 5;
   public numPages:number = 1;
   public length:number = 0;

 

    // show the name and mr_No of the patient current get from the home page -> Ok
    private patientName: any;
    private patientMrNo: any;
    // table configuration  -> ok
    // this is for each row in the table
    public rows:Array<any> = [];
    // this repersent the each colums in the one row
    public columns:Array<any> = [

      {title: 'Date' , name: 'noteDate'}, 
      {title:'Docter' , name:'docterName'},
      {title:'Type' , name:'noteType'},
      {title:'Note' , name:'description'}
    
    ];
    // config the table
    public config:any = {
      paging: true,
      sorting: {columns: this.columns},
      filtering: {filterString: ''},
      className: ['table-striped', , 'table-bordered' ]
    };
    
    //-----------------------------------
    // current docter who is login
    private currentDocter: Docter;
    // current docter type
    private currentSelectDocterType: DocterType;
    //
    // current patient mr_no
    private mrNo : any;
    // getting all patient note
    private patientNote:Array<any>;
    // help full for search aginst the type
    private showCurrentNotes:Array<any>;
    // getting the all docter type
    private allSearchType:Array<DocterType>;
    // this is show on the top
    private allOptionForNewNote:Array<DocterType>;
    //
    private newNote = false;
    private hideDetal = true;
    //
    // div show hide method
    Show(){
      //
      this.newNote = true;
      this.hideDetal = false;

    }
     back(){
      //
      this.newNote = false;
      this.hideDetal = true;
      this.getCurrentSelectPatientNote();
      
    }

    // constructor for used the service
    constructor(private _sharedService: SharedService ,private alertService:AlertService,private dialogService:DialogService,
    private noteService:NoteService, private docterService: DocterService , 
    private docterTypeService:DocterTypeService , private patientService: PatientService , 
    public route: ActivatedRoute,
    private router: Router) {
      //   current docter login
        this.currentDocter = JSON.parse(localStorage.getItem('currentUser'));
        
      
    }

    public ngOnInit():void {
        //  load all docter type
        this.loadAllDocterType();
        // load the current patient click)
        this.getCurrentSelectPatientNote();
        

   }

    loadAllDocterType():any{
       // fetching all docter type
       this.docterTypeService.getAllDoctorType().subscribe(allDoctorType => { 
          // assgin to the list of filter the type
          this.allSearchType = allDoctorType;          
          // remove the first one
           this.allOptionForNewNote = this.allSearchType.filter((item:any) => {
                   return  !"ALL".match(item.type) ;
          });
          console.log(this.allOptionForNewNote)
      });
  
    }

    // record of patient in form on note
    getCurrentSelectPatientNote():any{

          //  get URL parameters
          this.route.params.subscribe(params => {this.mrNo = params['mrNo'];});
          // if the mrno is null which is not possible but for some used here like error handler the page
          if(this.mrNo == null){
              //   here chagne required
          }else{
            // get the whole patient note's related to the "MrNo"
              this.patientService.getAllPatientNote(this.mrNo).subscribe(patientObject =>{
                  // if the legth of the note is zero "mean" that if there is not note's than
                  if(patientObject.length == 0){
                      // only show the "name" and the "mrno" on the screen for current select "Patient"
                      this.patientService.getPatient(this.mrNo).subscribe(patientObject =>{
                          this.patientMrNo = patientObject.mrNo;
                          this.patientName = patientObject.name;
                          this._sharedService.emitChange("Mr # ("+this.patientMrNo+") Patient Name("+this.patientName+")");
                      });
                }else{
                    // if the "Patient" have the object than show the list of "Note's" on the table
                    // used for same as uper condition used for show the "name and mrno""
                    
                    this.patientMrNo = patientObject[0].patientMrNo;
                    this.patientName = patientObject[0].patientName;
                    this._sharedService.emitChange("Mr # ("+this.patientMrNo+") Patient Name("+this.patientName+")");
                    // used for show the "Patient" list of "Note's"
                    this.patientNote = patientObject;  
                    // configure the table
                    this.showCurrentNotes = this.patientNote;
                    this.onChangeTable(this.config); 
                          
                  }
                });
        }
    }

     // this list is helpful to show the current type note need
     private tempPatientNotes:any[] = [];
     // this is current select noteType for search out the all releted to the this "noteType"
     private noteType :any ;
     // method for used the 
     private filterNotes(noteTypeId: any): void {
          // loop help to match the current selected type "id" 
          this.noteType = this.allSearchType.find(n => n.id == noteTypeId);
          // used the filter 
          this.tempPatientNotes = this.patientNote.filter((item:any) => {
                   return item.noteType.match(this.noteType.type) || "ALL".match(this.noteType.type) ;
          });

         // asgin filter array to show on the screen
         this.showCurrentNotes = this.tempPatientNotes;
         // configuer again
         this.onChangeTable(this.config);
         
     }

    public changePage(page:any, data:Array<any> = this.showCurrentNotes):Array<any> {
      let start = (page.page - 1) * page.itemsPerPage;
      let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
      return data.slice(start, end);
    }
    // method's of the table
    public onChangeTable(config:any , page:any = {page: this.page, itemsPerPage: this.itemsPerPage}):any {
      
            if (config.filtering) {
              Object.assign(this.config.filtering, config.filtering);
            }

            if (config.sorting) {
              Object.assign(this.config.sorting, config.sorting);
            }

            let filteredData = this.changeFilter(this.showCurrentNotes, this.config);
            let sortedData = this.changeSort(filteredData, this.config);
            //this.rows = sortedData;
            this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
            this.length = sortedData.length;
          
   }

 // this is the filter that filter the data in the table
   public changeFilter(data:any, config:any):any {
     let filteredData:Array<any> = data;
     this.columns.forEach((column:any) => {
       
       if (column.filtering) {
         filteredData = filteredData.filter((item:any) => {
           return item[column.name].match(column.filtering.filterString);
         });
       }
     });

     if (!config.filtering) {
       return filteredData;
     }

     if (config.filtering.columnName) {
       return filteredData.filter((item:any) =>
         item[config.filtering.columnName].match(this.config.filtering.filterString));
     }

     let tempArray:Array<any> = [];
     filteredData.forEach((item:any) => {
      
       let flag = false;
       this.columns.forEach((column:any) => {
         if (item[column.name].toString().match(this.config.filtering.filterString)) {
           flag = true;
         }
       });
       if (flag) {
         tempArray.push(item);
       }
     });
     filteredData = tempArray;

     return filteredData;
   }

     // this is the sort the change the data table
   public changeSort(data:any, config:any):any {
     if (!config.sorting) {
       return data;
     }

     let columns = this.config.sorting.columns || [];
     let columnName:string = void 0;
     let sort:string = void 0;

     for (let i = 0; i < columns.length; i++) {
       if (columns[i].sort !== '' && columns[i].sort !== false) {
         columnName = columns[i].name;
         sort = columns[i].sort;
       }
     }

     if (!columnName) {
       return data;
     }

    //  simple sorting
     return data.sort((previous:any, current:any) => {
       if (previous[columnName] > current[columnName]) {
         return sort === 'desc' ? -1 : 1;
       } else if (previous[columnName] < current[columnName]) {
         return sort === 'asc' ? -1 : 1;
       }
       return 0;
     });
   }

// form data and process center here
//------------------------------------------------------------------------------------------------
    model: any = {};
    sendType = "Submit";
    // form data 
    onSubmit() { 

       if(this.sendType == "Submit"){
          if(this.model.note == null){
           this.model.note = "NULL";
          }
         console.log("Sumbit is press"); 
        this.noteService.addNewNote(this.patientMrNo , new Note(null , this.model.note, this.getTodayDate(), this.currentDocter,
         this.allOptionForNewNote.find(item => item.id == this.model.noteType))).subscribe(data => {
                this.getCurrentSelectPatientNote();
               this.newNote = false;
               this.hideDetal = true;
               this.model = null;
         });
      
       }else if(this.sendType == "Edit"){
         
        this.noteService.updateNote(this.updateNoteId , 
                 new  Note(null,this.model.note,this.getTodayDate(),null,
                 this.allOptionForNewNote.find(item => item.id == this.model.noteType)))
                 .subscribe(data =>{
                      this.getCurrentSelectPatientNote();
                      this.newNote = false;
                      this.hideDetal = true;
                      this.model = null;
                 });

   
            
            // find the index of the current showing the table and serach and reaplace it

      
       }
        
        
        
     }
  updateNoteId:Number;
  tempDocter:DocterType;

  // this is event on the cell Click
  public onCellClick(data: any): any {
    
    //
    this.dialogService.addDialog(NoteDialogComponent, {
      title:'Patient Notes Operation',
      message:"Pakistan zinda.........."})
      .subscribe((isConfirmed :any)=>{
        //Get dialog result
         
         if (isConfirmed == "edit"){
            this.sendType = "Edit";
            this.newNote = true;
            this.hideDetal = false;
            // set the model for update
            // first filter the note and 
           this.tempDocter = this.allOptionForNewNote.find((item:any) =>{
                 return  data.row.noteType.match(item.type)
             });
           // get the id of the note
           this.updateNoteId = data.row.noteId;
           //
           this.model = {noteType: this.tempDocter.id , note : data.row.description};

        }else if(isConfirmed == "delete"){
 
            this.noteService.deleteNote(data.row.noteId).subscribe(deletedata =>{},error => {});
          
           // configuer again
           let index: number = this.showCurrentNotes.indexOf(data.row);
           
            if (index !== -1) {
                this.showCurrentNotes.splice(index, 1);
            } 

           this.onChangeTable(this.config);
          
        }else if(isConfirmed == "cancel"){
    
        }
        
    });
  }


  //
  getTodayDate(){
    var dateObj = new Date();
    console.log(dateObj);
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var newdate = year + "-" + month + "-" + day;
    return new Date();
  }
  

}
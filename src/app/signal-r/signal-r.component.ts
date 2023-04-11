import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Component({
  selector: 'app-signal-r',
  templateUrl: './signal-r.component.html',
  styleUrls: ['./signal-r.component.css']
})
export class SignalRComponent implements OnInit, OnDestroy, AfterViewInit {
  baseURL = new URL('https://localhost:4433');
  ioDeliverUrl = new URL('https://localhost:4433/io-deliver');
  connection!: HubConnection;

  output:string[] = [];
  title:string = 'Test code';
  language:string = "Java"
  code:Map<string,string> = new Map([
    ["Java" , 
     ` class HelloWorld {
       public static void main(String[] args) {
           System.out.println("Hello, Java's World!"); 
       }
     }`],
    ["Python",
      `print("hello, Python\'s world!");`],
    ["Shell",
       `echo "Hello, Shell's World!"`]
  ]);
  codeeditor:string = this.code.get(this.language)!;

  constructor(
    private http: HttpClient
  ){}
  
  ngOnInit(): void {
    this.createConnection();
    this.setOnDisconnect();
    this.setOnProcessOutput();
    
  }
  ngAfterViewInit(){
  }
  ngOnDestroy(): void {
    this.connection.stop();
  }
  
  private createConnection(){
    this.connection = new HubConnectionBuilder()
    .withUrl(this.ioDeliverUrl.href)
    .build();
  }
  
  private async connectToServer(){
    await this.connection.start().then(() => {
      // TODO : act when connection succeeds
      this.baseURL.searchParams.set("connectionID", this.connection.connectionId!)
    }).catch(err =>{
      // TODO : act when connection fails
    });
  }

  private setOnDisconnect(){
    this.connection.onclose(()=>{
      this.baseURL.searchParams.delete("connectionID")
    })
  }

  private setOnProcessOutput(){
    this.connection.on("processoutput",data=>{
      this.output.push(data)
    });
  }


  async sendCode(){
    this.output = [];
    await this.connectToServer();
    let codeinfo = new FormData();
    codeinfo.append("title",this.title);
    codeinfo.append("language",this.language);
    codeinfo.append("code",this.codeeditor);

    this.baseURL.pathname = "api/Run"

    this.http.post(this.baseURL.href, codeinfo)
      .subscribe(data=>{
        console.log(data);
      });
  }

  changelang(){
    this.codeeditor = this.code.get(this.language)!;
  }

  sendInput(event:Event){
    let f = event.target as any; 
    let data = f.ip.value; f.ip.value = '';
    console.log(data);
    
    this.connection.invoke("userInput", data);
    this.output.push(data)
    this.output.push('\n')
    return false;
  }

}

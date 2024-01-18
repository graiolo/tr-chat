import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { channel } from 'diagnostics_channel';
import { Subscription, take } from 'rxjs';
import { ChatGateway } from 'src/app/core/services/chat.gateway';
import { UserService } from 'src/app/core/services/user.service';
import { Router } from '@angular/router';
import { allowedNodeEnvironmentFlags } from 'process';
import { UserInfo } from 'src/app/models/userInfo.model';


@Component({
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageArea') messageArea!: ElementRef;
  private $subs = new Subscription();
  public messages: any[] = []; // You might want to create a Message interface or class
  public newMessage: string = '';
  public errorMsg: string = '';
  public channels!: string[]; // Populate with actual channels
  public users!: string[]; // Populate with actual user list

  search: string;
  placeholder: string;
  isOpen: boolean;
  title: string;
  msgToShow: string | null = null;
  screenW: any;
  allRead: boolean;

  queryParams: {[key:string]:string} = {}
  chat: any[];

  selectedChannel: any

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.screenW = window.innerWidth;
  }
  constructor(
    readonly userService: UserService,
    private readonly chatGateway: ChatGateway,
    private readonly route: ActivatedRoute, 
    private readonly router: Router,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
  ) {
    this.messages = [];
    this.chat = [];
    this.search = '';
    this.placeholder = 'Search user or channel';
    this.isOpen = false;
    this.title = 'CHAT';
    this.allRead = false;
  }
  
  ngAfterViewChecked(): void {
    // Controlla se isOpen è true
    if (this.isOpen) {
      // Scorri fino in fondo al div
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    try {
      // Usa Renderer2 per eseguire l'operazione in modo sicuro
      this.renderer.setProperty(this.messageArea.nativeElement, 'scrollTop', this.messageArea.nativeElement.scrollHeight);
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit(): void {
    this.messages = [];
    this.screenW = window.innerWidth;
    const params = this.route.snapshot.queryParams;
    this.initializeChat();
  }

  private onUserNotFound(){
    this.msgToShow = "USER NOT FOUND"
    setTimeout(()=> this.msgToShow = null, 2500);
  }

  initializeChat(): void {
    this.$subs.add(
      this.route.queryParams.subscribe((params) => {
        this.queryParams = params;
        const id = params['id'];
        const username = params['username'];
        if (username !== undefined) {
          this.userService.getUserByUsername(username).pipe(take(1)).subscribe({
            next:(user)=>{
              if (!user) {  
                return this.onUserNotFound()
              }

              this.title = username;
              this.isOpen = true;
              this.chatGateway.receivePrivChannelMsg(username, undefined);
            },
            error:(err)=>{
              this.onUserNotFound();
            }
          })
        } else if (id !== undefined) {
          ///single user
          this.chatGateway.receivePrivChannelMsg(undefined, id);
          this.isOpen = true;
        }

        this.$subs.add(
          this.chatGateway.onReceiveMsgForChannel().subscribe({
            next: (messages: any) => {
              this.messages = messages;
            },
            error: (error) => {
              this.errorMsg = `Error receiving message from channel: ${error.message}`;
            },
          }),
        );
      })
    );
    
    this.$subs.add(
      this.chatGateway.onMsgFromChannel().subscribe({
        next: (messages: any) => {
          this.messages = [...this.messages, ...messages.filter((message:any)=>{
            if (!this.selectedChannel){
              return message.members?.every((mem:string)=>mem === this.queryParams['username'] || mem === this.userService.getUser())
            }
            return (this.selectedChannel.id === message.channelId);
          })];
          this.chatGateway.sendLastSeen(this.selectedChannel.id, this.userService.getUser()); ///sussy
        },
        error: (error) => {
          this.errorMsg = `Error receiving message from channel: ${error.message}`;
        },
      })
    );

    this.$subs.add(
      this.chatGateway.onUserChannelList().subscribe({
        next: (data: any) => {
          const myUsername = this.userService.getUser();
          //console.log(data);
          this.channels = data.channels.map((channel:any)=> {
            let isGroup = true;
            let allRead = false;
            if (!channel.name){
              isGroup = false;
              const otherUser = channel.members.find((m: any)=> m.user.username != myUsername);
              channel.name = otherUser.user.username;
            }
            for (let userList of channel.lastSeen) {
              if (userList === myUsername){
                allRead = true;
              }
            }
          return {...channel,
                  isGroup,
                  allRead};
          }); 
          if (this.queryParams['username']){
            this.selectedChannel = this.channels?.find((ch:any)=>{
              return (ch.name === this.queryParams['username'])
            })
            //console.log(this.selectedChannel)
          } else if (this.queryParams['id']){
            this.selectedChannel = this.channels?.find((ch:any)=>ch.id === this.queryParams['id'])
          }
        },
        error: (error) => {
          this.errorMsg = `Error receiving channel list`;
        },
      })
    );

    this.$subs.add(
      this.chatGateway.onCreatedNewPublicChannel().subscribe({
        next: (data: any) => {
          this.channels.push(data);
          if (data.user === this.userService.getUser()){
            this.selectedChannel = data;
          }
          this.isOpen = false;
        }
      })
    )
    this.chatGateway.receiveUserChannels(this.userService.getUser());
    // To DO: $subscribe user joining, leaving, etc.
  }

  sendMessageToChannel(): void {
    if (this.newMessage.trim()) {
      let id = this.queryParams['id'];
      if (this.selectedChannel)
        id = this.selectedChannel.id;
      this.chatGateway.sendChannelMsg(this.newMessage, id);
      this.newMessage = ''; // Reset the input after sending
    }
  }

  sendMessageToUser() {
    if (this.newMessage.trim()) {
      if (this.queryParams['username'])
        this.chatGateway.sendPrivMsg(this.newMessage, this.queryParams['username']);
      else if(this.queryParams['id']) {
        this.sendMessageToChannel();
        this.chatGateway.sendLastSeen(this.queryParams['id'], this.userService.getUser());
      }
      this.newMessage = ''; // Reset the input after sending
    }
  }

  ngOnDestroy(): void {
    this.$subs.unsubscribe();
  }

  // TO DO: handling user joining, leaving, etc.

  openChat(conversation: any) {
    if (this.queryParams['id'] === conversation.id)
      return;
    conversation = conversation;
    this.messages = [];
    this.router.navigate(
      [], 
      {
        relativeTo: this.activatedRoute,
        queryParams: {id:conversation.id},
      }
    );
    this.selectedChannel = conversation;
    //console.log(conversation);
    this.msgToShow = null;
    this.chatGateway.sendLastSeen(conversation.id, this.userService.getUser());
    conversation.allRead = true;
  }


  searchChat() {
    if (this.search !== '' && this.search !== this.userService.getUser()) {
      this.router.navigate(
        [], 
        {
          relativeTo: this.activatedRoute,
          queryParams: {username:this.search}, 
        }
      );
      this.msgToShow = null;
      } else {
        this.placeholder = 'Chat not found';
        setTimeout(() => {
          this.placeholder = 'Search user or channel';
        }, 2000);
      }
      this.search = '';
  }

  backClick() {
    this.isOpen = false;
    this.title = 'chat';
    console.log('TKM');
  }
}
import { Component, OnInit, ViewChild, ElementRef, Inject, forwardRef, OnDestroy } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { NavigationService } from 'src/app/services/navigation.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Checklist } from 'src/app/models/checklist';
import { Session } from 'src/app/models/session';
import { switchMap, catchError, switchMapTo, tap, take } from 'rxjs/operators';
import { SessionService } from 'src/app/services/session.service';
import { TemplateService } from 'src/app/services/template.service';
import { ChecklistService } from 'src/app/services/checklist.service';
import { PeerService } from 'src/app/services/peer.service';
import { Template } from 'src/app/models/template';
import { forkJoin, timer, Subject, throwError, Observable, Subscription, of, from } from 'rxjs';
import { MatTabGroup, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { AppComponent } from 'src/app/app.component';
import { Action } from 'src/app/models/action';
import { ActionEvent } from './models/action-event';
import { ChooseDialogComponent, SelectItem } from '../dialog/choose-dialog/choose-dialog.component';
import { OperatorsService } from 'src/app/services/operators.service';
import { OperatorInfo } from 'src/app/models/info/operator-info';
import { MessageBody } from 'src/app/models/messages/message-body';
import { MessageType } from 'src/app/models/enums/message-type';
import { NextStepInfo } from 'src/app/models/messages/next-step';
import { SignallingStatus } from 'src/app/services/enums/signalling-status';
import { ConnectionStatus } from 'src/app/services/enums/connection-status';
import { RecordService } from 'src/app/services/record.service';
import { ConfirmDialogComponent } from '../dialog/confirm-dialog/confirm-dialog.component';
import { Constants } from 'src/app/utils/constants';

/**
 * The component that handles session phases, checklist rendering and webrtc stream
 */
@Component({
  selector: 'app-session',
  templateUrl: 'session.component.html',
  styleUrls: ['session.component.css'],
})
export class SessionComponent implements OnInit, OnDestroy {

  //#region fields

  private readonly LAST_PEER_ID = 'lastPeerId';

  @ViewChild('remoteVideo', { static: false }) 
  remoteVideo: ElementRef;

  @ViewChild('tabGroup', { static: false })
  tabGroup: MatTabGroup;

  //event (for summary)
  actionEvent: Subject<Action> = new Subject<Action>();

  //performed actions
  actions: Map<string, Action[]> = new Map();

  //data
  session: Session;
  template: Template;
  checklists: Checklist[];

  //helpers
  elapsedTime: number = 0;
  disabledTabs: boolean[];
  loadingCompleted: boolean = false;
  disableVideo: boolean = false;
  remotePeerId: string = '';

  //subscriptions
  private timerSub: Subscription;

  private readonly app: AppComponent;

  //#endregion

  constructor(@Inject(forwardRef(() => AppComponent)) app: AppComponent,
              private route: ActivatedRoute,
              private router: Router,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private sessionService: SessionService,
              private templateService: TemplateService,
              private checklistService: ChecklistService,
              private operatorService: OperatorsService,
              private peerService: PeerService,
              private recordService: RecordService,
              private location: LocationStrategy,
              private navigationService: NavigationService) {

    //hide toolbar
    this.app = app;
    this.app.changeToolbarVisibility(false);

    this.retrieveRemotePeerId();

    // check if back or forward button is pressed.
    this.location.onPopState(() => {
      // set isBackButtonClicked to true.
      this.navigationService.setBackClicked(true);
      return false;
    });
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.sessionService.getSession(params.get('id'))),
      switchMap(session => {
        this.session = session;
        //load template
        return this.templateService.getTemplate(session.template);
      }),
      switchMap(template => {
        this.template = template;
        //load checklists
        return forkJoin(template.phases.map(i => this.checklistService.getChecklist(i.checklist)))
      }),
      tap(checklists => {
        this.checklists = checklists;

        //update ui
        this.importPreviousActions();
        this.enableChecklistWithActions();

        //show ui
        this.loadingCompleted = true;
        this.startTimer();

        //initializes the peer
        this.initializePeer();

        return of(true);
      }),
      catchError(err => {
        this.log(`Unable to initialize session: ${err}`);
        this.showSnackBar("Initialization error");
        return throwError(err);
      })
    ).subscribe(result => {
      if (result) {
        this.log("Initialization succeeded");
      } else {
        this.log("Initialization failed");
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.releaseResources(); 
  }

  //#region session

  /**
   * Closes the session.
   */
  closeSession(completed: boolean) {
    if (completed) {
      this.sessionService.closeSession(this.session.id).subscribe(result => {
        if (result) {
          localStorage.removeItem(this.LAST_PEER_ID);
          this.terminateSession();
        } else {
          this.showSnackBar("Unable to close session");
        }
      });
    } else {
      this.sessionService.abortSession(this.session.id).subscribe(result => {
        if (result) {
          this.terminateSession(true);
        } else {
          this.showSnackBar("Unable to abort session");
        }
      });
    }
  }

  /**
   * Terminates the session.
   * @param force Whether the termination was forced or not.
   */
  private terminateSession(force: boolean = false) {

    if (this.remoteVideo) {
      let elem = this.remoteVideo.nativeElement;
      if (elem && elem.srcObject) {
        elem.srcObject.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        this.remoteVideo.nativeElement.srcObject = null;
      }
    }

    //send last message
    this.sendMessage(force ? MessageType.Aborted : MessageType.Finished);
    //close gracefully
    this.peerService.close();

    this.recordService.stopRecording().pipe(
      switchMapTo(this.openSaveRecordingDialog()),
      switchMap(result => {
        if (result) {
          return this.recordService.saveRecording();
        } else {
          return of(false);
        }
      }),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    ).subscribe(_ => {
      this.stopTimer();
      this.releaseResources();     
      this.navigateAway();
    });
  }

  //#endregion

  //#region actions

    /**
   * Enables the next checklist
   * @param index The index of the current selected checklist.
   */
  enableNextChecklist(index: number) {
    
    if (this.checklists.length > index) {
      let nextIndex = index + 1;
      //unable next tab
      this.disabledTabs[nextIndex] = false;
      //go to the next checklist
      this.tabGroup.selectedIndex = nextIndex;
    }
  }

  /**
   * Saves a user action.
   * @param event The action event
   */
  saveAction(event: ActionEvent) {

    if (this.actions.has(event.checklistId)) {
      let newAction = event.action;
      let oldActions = this.actions.get(event.checklistId);
      //remove duplicates
      oldActions = oldActions.filter(a => !(a.field == newAction.field && a.step == newAction.step));
      oldActions.push(newAction);   
      this.actions.set(event.checklistId, oldActions);
    } else {
      this.actions.set(event.checklistId, [event.action]);
    }

    //update summary component
    this.actionEvent.next(event.action);

    //send action
    this.sessionService.addSessionAction({
      sessionId: this.session.id,
      checklistId: event.checklistId,
      action: event.action
    }).pipe(catchError(err => {
      console.error("Failed to add action to session");
      this.snackBar.open(err.message || 'Unknown error occurred');
      return throwError(err);
    })).subscribe(() => {
      console.log("Successfully added action to session")
    });
    
    //send action to peer
    if (this.peerService.isConnected()) {

      let checklist = this.checklists.find(i => i.id == event.checklistId);
      let stepIndex = checklist.steps.findIndex(i => i.id == event.action.step);

      if (stepIndex >= 0 && checklist.steps.length > stepIndex + 1) {

        //get next step in the current checklist
        let nextStep = checklist.steps[stepIndex + 1];
        this.sendMessage(MessageType.NextStep, new NextStepInfo(nextStep.name, nextStep.description))
      } else {

        //get the first step in the next checklist
        let checklistIndex = this.checklists.findIndex(i => i.id == event.checklistId);
        if (checklistIndex >= 0 && this.checklists.length > checklistIndex + 1) {

          let nextChecklist = this.checklists[checklistIndex + 1];
          if (nextChecklist.steps.length > 0) {

            let nextStep = nextChecklist.steps[0];
            this.sendMessage(MessageType.NextStep, new NextStepInfo(nextStep.name, nextStep.description));
          }
        }
      }
    }
  }

  /**
   * Imports previous actions from the current session object.
   */
  private importPreviousActions() {
    this.session.phases.forEach(i => {
      this.actions.set(i.checklist, i.actions);
    });
  }

  /**
   * Enables all checklists with at least one action.
   */
  private enableChecklistWithActions() {
    this.disabledTabs = this.session.phases.map(p => p.actions.length == 0)

    //the first one must be always enabled
    if (this.disabledTabs.length > 0) {
      this.disabledTabs[0] = false;
    }
  }

  //#endregion

  //#region peer

  /**
   * Requests the local stream.
   * @returns An observable of the local media stream.
   */
  public getLocalStream(): Observable<MediaStream> {

    this.log("Creating local stream...")

    return from(navigator.mediaDevices.getUserMedia(Constants.MediaConstraints))
    .pipe(
        take(1),
        catchError(err =>  {
            this.log("Unable to retrieve user media"); 
            return throwError(err);
        })
    );
  }

  /**
   * Retrieves the remote peer id from the nevigation state or from the local storage.
   * WARN: must be executed inside constructor or current navigation won't be available.
   */
  private retrieveRemotePeerId() {

    let currPeerId = '';

    // retrieve the peer id from the create session component or from local storage
    let navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras) {
      let state =  navigation.extras.state;
      if (state && state.peerId) {
        currPeerId = state.peerId;
      } else {
        currPeerId = localStorage.getItem(this.LAST_PEER_ID);
      }
    }

    this.remotePeerId = currPeerId;
  }

  /**
   * Initializes peer-related variables. 
   */
  private initializePeer(): void {

    //check that the peer id still exists
    this.operatorService.getOperatorsInfo().subscribe(operators => {
      if (operators.length > 0) {
        let remotePeerInfo = operators.find(i => i.id == this.remotePeerId);
        if (this.remotePeerId && remotePeerInfo && remotePeerInfo.id) {
          this.connectRemotePeer(remotePeerInfo.id);
        } else {
          //filter only free operators
          let availableOperators = operators.filter(o => o.currentSession == null);
          this.openChooseOperatorDialog(availableOperators);
        }
      } else {
        this.disableVideo = true;
        this.showSnackBar('No operator available, live feed is disabled');
      }
    });
  }

  /**
   * Connects to the remote peer.
   * @param remotePeerId The remote peer id
   */
  private connectRemotePeer(remotePeerId: string) {

    localStorage.setItem(this.LAST_PEER_ID, remotePeerId);

    this.peerService.initialize().subscribe(status => {

      switch(status) {
        case SignallingStatus.Connected: {

          //gets the local stream
          this.getLocalStream().pipe(
            take(1),
            catchError(err => { 
              this.peerService.close();
              this.showSnackBar("The device doesn't have a camera or microphone, live feed has be deactivated");
              this.disableVideo = true;
              return throwError(err); 
            })
          ).subscribe(localStream => {
            //prepare recorder
            this.recordService.initialize();

            //listen for remote streams
            let remoteStreams = this.peerService.streams().pipe(
              tap(remoteStream => {
                this.log("Received remote stream");
                this.remoteVideo.nativeElement.srcObject = remoteStream;
              })
            );
            this.recordService.attachStreams(remoteStreams);

            //connect to peer
            this.peerService.connect(remotePeerId, localStream).subscribe(i => this.handleConnection(i));
          });

          break;
        }
        case SignallingStatus.Disconnected: {
          this.showSnackBar('Disconnected from signalling server');
          break;
        }
        case SignallingStatus.Closed: {
          this.showSnackBar('Connection with signalling server closed');
          break;
        }
        case SignallingStatus.Error: {
          //do nothing
          break;
        }
      }
    });  
  }

  /**
   * Handles the peer connection events.
   * @param status The connection status
   */
  private handleConnection(status: ConnectionStatus) {
    switch(status) {
      case ConnectionStatus.Opened: {
        //start recording
        this.recordService.startRecording();

        this.sendMessage(MessageType.Started);
        break;
      }
      case ConnectionStatus.Closed: {
        this.showSnackBar('Connection with remote peer closed');
        break;
      }
      case ConnectionStatus.Error: {
        //do nothing
        break;
      }
    }
  }

  /**
   * Sends a message to the remote peer.
   * @param type The message type
   * @param data The data that will be sent, serialized as json string.
   */
  private sendMessage(type: MessageType, data?: any) {
    let message = new MessageBody(type);
    if (data) {
      message.data = JSON.stringify(data);
    }
    this.peerService.sendData(message);
  }

  /**
   * Release all resources linked to the WebRTC peer.
   */
  private releaseResources(): void {
    this.recordService.destroy();
    this.peerService.destroy();
    this.remoteVideo = null;
  }

  //#endregion

  //#region dialogues

  /**
   * Opens the choose dialog to let user select the operator
   * @param operators The list of available operators
   */
  private openChooseOperatorDialog(operators: OperatorInfo[]) {

    let availableOperators = operators.map(i => 
      <SelectItem> { 
        label: `${i.user.firstName} ${i.user.lastName} (${i.description})`, 
        value: i.id 
    });

    let config = new MatDialogConfig();
    config.disableClose = true;
    config.autoFocus = true; 
    config.data = {
      title: 'Choose an operator',
      label: 'Available operators',
      message: 'Please choose an operator in order to proceed',
      items: availableOperators
    };
    
    this.dialog.open(ChooseDialogComponent, config).afterClosed().subscribe(selected => {
      if (selected) {
        this.connectRemotePeer(selected);
      } else {
        this.showSnackBar('No operator selected, live feed is not available');
      }
    });
  }

  /**
   * Opens the dialog to let user choose whether to save the record of this session or not.
   * @returns The observable with the reply of the user.
   */
  private openSaveRecordingDialog(): Observable<boolean> {
    let config = new MatDialogConfig();
    config.disableClose = true;
    config.autoFocus = true; 
    config.data = {
      title: 'Save recording confirmation',
      message: 'Do you want to save the recording of this session?'
    };

    return this.dialog.open(ConfirmDialogComponent, config).afterClosed().pipe();
  }

  //#endregion

  //#region utils

  /**
   * Starts the timer.
   */
  private startTimer() {
    const source = timer(1000, 1000);
    this.timerSub = source.subscribe(val => {
      this.elapsedTime = val;
    });
  }

  /**
   * Stops the timer.
   */
  private stopTimer() {
    if (this.timerSub != null) {
      this.timerSub.unsubscribe();
    }
    this.timerSub = null;
  }

  /**
   * Navigates away from this component.
   */
  private navigateAway() {
    this.router.navigate(['/session', 'create']);
    this.app.changeToolbarVisibility(true);
  }

  /**
   * Shows the snackbar.
   * @param message The message
   */
  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  //#endregion

  //DEBUG only
  private log(message: string) {
    console.log(message);
  }
}
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, mapTo, take } from 'rxjs/operators';
import * as RecordRTC from 'recordrtc';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './common/base.service';

@Injectable({ 
    providedIn: 'root'
})
export class RecordService extends BaseService {

    private recording: boolean = false
    private recorder: RecordRTC.MRecordRTC;

    private streamsEmitterSub: Subscription;

    private readonly BaseRoute = "recording";

    constructor(configService: ConfigService, 
                private http: HttpClient) {
      super(configService, 'record');
    }

    /**
     * Initializes the recorder.
     */
    public initialize(): void {

        if (this.isRecording()) {
            this.log("Unable to initialize the recorder because it's still recording.");
            return;
        }

        if (this.recorder != null) {
            this.log("Destroying the previous recorder...");
            this.destroy();
        }
        
        this.log("Initializing record service...");

        this.recorder = new RecordRTC.MRecordRTC({ disableLogs: true, checkForInactiveTracks: true });
        this.recorder.mediaType = {
            audio: true,
            video: true
        };
    }

    /**
     * Destroys the recorder and free all resources.
     */
    public destroy(): void {
        this.log("Destroying record service...");

        if (this.streamsEmitterSub != null) {
            this.streamsEmitterSub.unsubscribe();
        }

        if (this.recorder != null) {
            this.recorder.destroy();        
        }

        this.recorder = null;
        this.recording = false;

        this.streamsEmitterSub = null;
    }

    /**
     * Determines if the recorder is recording or not.
     * @returns True, if it's recording; otherwise false.
     */
    public isRecording(): boolean {
        return this.recorder != null && this.recording;
    }

    /**
     * Starts the recording.
     */
    public startRecording(): void {
        this.log("Starts recording...");

        if (this.isRecording()) {
            this.log("Unable to start recorder because another one is still in progress.");
            return;
        }

        this.recorder.startRecording();
        this.recording = true;
    }

    /**
     * Adds the stream in the recording.
     * @param stream The stream to add
     */
    public addStream(stream: MediaStream): void {
        this.log("Add stream in recording...");

        if (this.recorder == null) {
            this.log("Unable to add stream because no recording is active.");
            return;
        }

        this.recorder.addStream(stream);
    }

    /**
     * Attach an observable of streams.
     * @param streams The observable of media streams.
     */
    public attachStreams(streams: Observable<MediaStream>): void {
        this.streamsEmitterSub = streams.subscribe(s => this.addStream(s));
    }

    /**
     * Stops the recording.
     * @returns The observable to determine if the operation succeded or not.
     */
    public stopRecording(): Observable<boolean> {
        this.log("Stop recording...");

        if (!this.isRecording()) {
            this.log("Unable to stop recorder because no recording is active.");
            return of(false);
        }

        return new Observable(observer => {
            this.recorder.stopRecording(() => {
                this.log("Stopped record rtc.");
                this.recording = false;
                observer.next(true);
            });
        });
    }

    /**
     * Saves the recording.
     * @returns The observable to determine if the operation succeded or not.
     */
    public saveRecording(): Observable<boolean> {

        if (this.isRecording()) {
            this.log("Unable to save recording because the recorder is still busy.");
            return of(false);
        }

        if (this.recorder != null) {
            this.log("Saves the recording...");
            let blob = this.recorder.getBlob().video;
            return this.http.post<any>(`${this.baseUrl}/${this.BaseRoute}`, blob).pipe(
                take(1),
                mapTo(true),
                catchError(this.handleError), 
                catchError(_ => of(false))
            );
        } else {
            return of(false);
        }
    }

    //DEBUG only
    private log(message: string) {
        console.log(message);
    }
}
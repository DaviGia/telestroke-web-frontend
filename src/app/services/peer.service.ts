import { Injectable, EventEmitter } from '@angular/core';
import Peer, { MediaConnection, DataConnection } from 'peerjs';
import { ConfigService } from './config.service';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { SignallingStatus } from './enums/signalling-status';
import { ConnectionStatus } from './enums/connection-status';

@Injectable({ 
    providedIn: 'root'
})
export class PeerService {

    private connected: boolean = false;
    private connectionOpened: boolean = false;

    private peer?: Peer;
    private mediaConnection?: MediaConnection;
    private dataConnection?: DataConnection;

    private localStream?: MediaStream;

    private peerEmitter?: EventEmitter<SignallingStatus>;
    private connEmitter?: EventEmitter<ConnectionStatus>;
    private streamEmitter?: EventEmitter<MediaStream>;

    constructor(private configService: ConfigService) { }

    /**
     * Initializes the peer and connects to signalling server.
     * @returns An observable of the peer status
     */
    public initialize(): Observable<SignallingStatus> {

        if (this.isConnected()) {
            throw Error("Peer has already been initialized!");
        }

        this.peerEmitter = new EventEmitter();
        this.connEmitter = new EventEmitter();
        this.streamEmitter = new EventEmitter();

        this.peer = new Peer(this.configService.getConfig().peerjs);
        
        //peer connected to signalling server
        this.peer.on('open', id => {
            this.log(`Connected to signalling server with id: ${id}`);
            this.connected = true;
            this.emitSignallingStatus(SignallingStatus.Connected);
        })

        //peer disconnected
        this.peer.on('disconnected', () => {
            this.log(`Disconnected from signalling server`);
            this.connected = false;
            this.emitSignallingStatus(SignallingStatus.Disconnected);
        });

        //peer destroyed
        this.peer.on('close', () => {
            this.log(`Connection closed with the signalling server`);
            this.connected = false;
            this.emitSignallingStatus(SignallingStatus.Closed);
        });

        //peer error
        this.peer.on('error', error => {
            this.log(`Peer error: ${error.type} (${error.message || error})`);
            this.emitSignallingStatus(SignallingStatus.Error); 
        });

        //TODO: for now peer do not support incoming request
        
       return this.peerEmitter.asObservable();
    }

    /**
     * Connects a remote peer.
     * @param peerId The remote peer id.
     * @param localStream The local stream.
     * @returns The observable of the connection status.
     */
    public connect(peerId: string, localStream: MediaStream): Observable<ConnectionStatus> {

        if (!this.isConnected()) {
            throw Error("Connect method must be called after initialize()");
        }

        //save local stream
        this.localStream = localStream;

        //create media connection
        this.mediaConnection = this.peer.call(peerId, localStream);

        //initialize, if all is ok establish data connection (do it in sequence)
        this.initializeMediaConnection().pipe(take(1)).subscribe(mediaResult => {
            if (mediaResult) {
                this.log("Successfully opened media connection");
                
                this.dataConnection = this.peer.connect(peerId, <Peer.PeerConnectOption>{serialization: 'json'});
                this.initializeDataConnection().pipe(take(1)).subscribe(dataResult => {
                    if (dataResult) {
                        this.log("Successfully opened data connection");

                        this.connectionOpened = true;
                        this.emitConnectionStatus(ConnectionStatus.Opened);
                    } else {
                        this.log("Unable to initialize data connection");
                    }
                });
            } else {
                this.log("Unable to initialize media connection");
            }
        });

        return this.connEmitter.asObservable();
    }

    /**
     * Sends data to the connected remote peer.
     * @param data The data to send (will be encoded to string)
     * @returns The observable to determine if the operation succeded or not.
     */
    public sendData(data: any): Observable<boolean> {
        if (!this.isConnected() || !this.dataConnection || !this.dataConnection.open) {
            return of(false);
        }
        this.dataConnection.send(data);
        return of(true);
    }

    /**
     * Closes all connections.
     * @returns The observable to determine if the operation succeded or not.
     */
    public close(): void {
        this.connected = false;
        this.connectionOpened = false;

        if (this.localStream) { this.localStream.getTracks().forEach((t: MediaStreamTrack) => t.stop());}
        if (this.dataConnection && this.dataConnection.open) { this.dataConnection.close(); }
        if (this.mediaConnection && this.mediaConnection.open) { this.mediaConnection.close(); }
        if (this.peer && this.peer.disconnected == false) { this.peer.disconnect(); }
    }

    /**
     * Destroys the current peer.
     */
    public destroy() {
        this.connected = false;
        this.connectionOpened = false;

        if (this.connEmitter) { this.connEmitter.complete(); }
        if (this.peerEmitter) { this.peerEmitter.complete(); }
        if (this.streamEmitter) { this.streamEmitter.complete(); }
        this.connEmitter = null;
        this.peerEmitter = null;
        this.streamEmitter = null;

        close();

        this.mediaConnection = null;
        this.dataConnection = null;

        if (this.peer) { this.peer.destroy(); }
        this.peer = null;
    }

    /**
     * Determines if the peer is connected to the signalling server or not.
     * @returns True, if the peer is connected; otherwise false.
     */
    public isConnected(): boolean { return this.connected; }

    /**
     * Subscribes to new incoming streams.
     * @returns The observable of media streams.
     */
    public streams(): Observable<MediaStream> {
        return this.streamEmitter.asObservable();
    }

    /**
     * Initializes the media connection.
     * @returns The observable to determine if the operation succeded or not.
     */
    private initializeMediaConnection(): Observable<boolean> {
        this.log("[Media] Initializing connection...");

        return new Observable(observer => {
            this.mediaConnection.on('stream', stream => {
                this.log("[Media] Received remote stream");
    
                this.streamEmitter.emit(stream);
                
                observer.next(true);
            });
    
            this.mediaConnection.on('close', () => {
                this.log("[Media] Connection closed");
    
                this.emitConnectionStatus(ConnectionStatus.Closed);
                this.connectionOpened = false;
    
                observer.next(false);
            });
    
            this.mediaConnection.on('error', (err) => {
                this.log(`[Media] Connection error: (${err.message || err})`);
                this.emitConnectionStatus(ConnectionStatus.Error);
    
                observer.next(false);
            });
        });
    }

    /**
     * Initializes the data connection.
     * @returns The observable to determine if the operation succeded or not.
     */
    private initializeDataConnection(): Observable<boolean> {
        this.log("[Data] Initializing connection...");

        return new Observable(observer => {
            this.dataConnection.on('open', () => {
                this.log("[Data] Connection opened");
            
                observer.next(true);
            });
    
            this.dataConnection.on('close', () => {
                this.log("[Data] Connection closed");
                //this.connEmitter.emit(ConnectionStatus.Closed);
    
                observer.next(false);
            });
    
            this.dataConnection.on('error', (err) => {
                this.log(`[Data] Connection error: ${err.message || err}`);
                //this.connEmitter.emit(ConnectionStatus.Error);
    
                observer.next(false);
            });
        });
    }

    /**
     * Emits a signalling status.
     * @param status The signalling status to emit.
     */
    private emitSignallingStatus(status: SignallingStatus) {
        if (this.connected) {
            this.peerEmitter.emit(status);
        }
    }

    /**
     * Emits a connection status.
     * @param status The connection status to emit.
     */
    private emitConnectionStatus(status: ConnectionStatus) {
        if (this.connectionOpened) {
            this.connEmitter.emit(status);
        }
    }

    //DEBUG only
    private log(message: string) {
        console.log(message);
    }
}
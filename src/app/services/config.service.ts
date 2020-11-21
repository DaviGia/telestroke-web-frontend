import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend  } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Configuration } from '../models/config/config';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    private http: HttpClient;
    private config: Configuration;

    constructor(handler: HttpBackend) { 
        this.http = new HttpClient(handler)
    }

    getConfig(): Configuration {
        return this.config;
    } 

    load(): Promise<void> {
        const jsonFile = `assets/config/config${environment.production ? `.prod` : ''}.json`
        return new Promise<void>((resolve, reject) => {
            this.http.get(jsonFile).subscribe(data => {
                try {
                    this.config = data as Configuration
                    resolve()
                } catch (e) {
                    reject(`Could not parse the content of file '${jsonFile}': ${e.message}`)
                }
            }, error => {
                reject(`Could not load file '${jsonFile}': ${error.message}`)
            })
        });
    }
}
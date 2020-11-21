# Telestroke - Specialist Frontend

The **Telestroke** project aims to create a system to assist doctors (specialist) and first aid personnel (operator) in the assessment of a stroke case gravity (using [NIHSS](https://en.wikipedia.org/wiki/National_Institutes_of_Health_Stroke_Scale)). The system enables the specialist to perform remote reporting, to reduce disease treatment time and improve the quality of the medical supply. This project is my master thesis in Computer Science: [Study and development of a remote reporting system](https://amslaurea.unibo.it/20501/).

The project is structured in 3 main components:
- [backend](https://github.com/DaviGia/telestroke-backend): The microservices backend that handles frontend interaction and implements the main application login
- [web-frontend](https://github.com/DaviGia/telestroke-web-frontend): The web application used by the specialist to:
  * implements a WebRTC peer that sends audio to the operator and receives video and audio feed from his/her
  * remotely guide the operator to assess the patient status (by talking to the operator while watching the patient from the operator's feed)
  * guide him/her to perform the medical report and decide the course of action to treat the stroke
- [android-frontend](https://github.com/DaviGia/telestroke-android-frontend): The Android application used by the operator from hands-free wearable device (e.g. Smartglasses):
  * implements a WebRTC peer sends video and audio feed and receives audio from the specialist and receives audio from his/her
  * can display brief information about the current action that the specialist is performing from his/her device

## Description

An Angular web-application with WebRTC capabilities. It's capable of rendering a structured series of checklist based on a specific model served by the backend and stored in the database.

## Configuration

The web-app can be configured with the file: `src/assets/config/config.json`. Here is an example of what can be configured:

``` js
{
    "baseUrl": "http://localhost:8001/api", //gateway entrypoint
    "peerjs": { //peerjs configuration
        "host": "localhost",
        "port": 9000,
        "key": "demo", // change in production env   
        "path": "/telestroke",
        "secure": false, // change in production env 
        "debug": 0
    }
}
```

## Deployment

### Standalone

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Docker

``` bash
npm run-script buildImage
#or
docker build -t it.unibo/frontend .

# run
docker run -p 8080:80 -it it.unibo/frontend
```

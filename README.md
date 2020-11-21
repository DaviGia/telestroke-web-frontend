# Telestroke - Web Frontend

Angular web frontend.

## Configuration

The web-app needs a single configuration file in `src/assets/config/config.json`.
An example of configuration is the following:

``` js
{
    "baseUrl": "http://localhost:8001/api", //gateway entrypoint
    "peerjs": { //peerjs server configuration
        "host": "localhost",
        "port": 9000,
        "key": "demo", // change in production env   
        "path": "/telestroke",
        "secure": false, // change in production env 
        "debug": 0
    }
}
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

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

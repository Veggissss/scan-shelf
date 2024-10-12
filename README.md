# Scan Shelf
A simple EPub book library and reader with OCR scanning capabilities.

## Architecture Overview

### Frontend
- Shows EPub library overview retrieved from backend.
- Displays the requested EPub file in a website reader, images can then be clicked to get a OCR/text-recognition scanning window.
- Settings page for API hostname address, and other reader customizations.

### Backend
- Stores and serves the EPub files located in the `server/public`, like:
   * bookSeriesFolder/vol1.epub
   * bookSeriesFolder/vol2.epub
   * otherSeriesFolder/vol1.epub
- Handles OCR requests by using [Google Vision API](https://cloud.google.com/vision/docs/). | `POST /api/ocr` with `{ image: base64EncodedImage }` as a body.
- Gives folder file structure. | `GET /api/folders`
- Retrieves EPub thumbnails. | `GET /api/thumbnail/:folderName/:fileName`

Simplified overview:

![overview](docs/figures/epub.drawio.svg)

## Google Vision API
You need access to the `Google Vision API`. 
There is 1000 free scans monthly, so for personal use this should be sufficient, but it requires a billing account active:

### Service account setup
1. Create a new google project at https://console.cloud.google.com/.
2. Enable the Cloud Vision API.
3. Create a new service account and assign permission access to the Cloud Vision API.
4. Go to the newly created account and add a json key.
5. Put the json key file as google-service-account.json in the `server` directory, alternatively specify the file location in `server/public.env`. (***Optional if using docker for backend***)
6. Finally, add a billing account to the google project.

## Running front- and backend locally
1. `npm run setup` for installing dependencies for server and the react app.
2. `npm run launch` will build and run the backend and the frontend concurrently.
3. It can now be accessed on `localhost:3000`
4. Add your book folders and `.EPub` files inside the `server/public` folder, like shown in the [backend](#backend) section.
5. You can install the website as a PWA and add it to the home screen on IOS.

When accessing the application from another computer that is not hosting it, you need to set the server API hostname in the settings page. This allows the frontend to be independent from specific backend instances. The project is intended to be hosted locally and can be accessed from outside by port forwarding or preferably by setting up a VPN to achieve the smallest attack surface.

## Running using Docker
There are `arm32`-based docker containers available on [DockerHub](https://hub.docker.com/r/veggissss/scan-shelf).
They are intended to be used with Raspberry Pi's or similar arm based products. Can easily be adopted to other architectures by changing the Dockerfile(s).

### Frontend
Should just be copy paste. You might want to change the port number if you have conflicts like: `-p 3002:3000`.
```cmd
docker pull veggissss/scan-shelf:frontend
```
```cmd
docker run \
  --name=ScanShelfFrontend \
  --restart=unless-stopped \
  -p 3000:3000 \
  -d veggissss/scan-shelf:frontend
```

### Backend
Here you need to:
* Replace PATH_TO_JSON with the file path from *step 5* in [service account setup](#service-account-setup).
* PATH_TO_EPUB_FOLDER with a folder with the same subfolder and file structure as shown in the [backend](#backend) section.
```cmd
docker pull veggissss/scan-shelf:backend
```
```cmd
docker run \
  --name=ScanShelfBackend \
  --restart=unless-stopped \
  -v PATH_TO_JSON.json/google-service-account.json:/usr/src/app/google-service-account.json \
  -v PATH_TO_EPUB_FOLDER:/usr/src/app/public \
  -p 3001:3001 \
  -d veggissss/scan-shelf:backend
```

## Development
- `npm run dev` to run the react development server. (Will not produce PWA)
- `npm run server` to run the backend server.

## License
This project is licensed under the MIT License.

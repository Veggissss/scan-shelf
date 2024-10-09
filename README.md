# Scan Shelf
A simple EPub book library and reader with OCR scanning capabilities.

## Architecture Overview

### Frontend
- Shows EPub library overview retrieved from backend.
- Displays the requested EPub file in a website reader, images can then be clicked to get a OCR/text-recognition scanning window.
- Settings page for API hostname address, and other reader customizations.

### Backend
- Stores and serves the EPub files located in the `server/public`, like:
   * bookSeriesName/vol1.epub
   * bookSeriesName/vol2.epub
   * otherSeriesName/vol1.epub
- Handles OCR requests by using [Google Vision API](https://cloud.google.com/vision/docs/). | `POST /api/ocr` with `{ image: base64EncodedImage }` as a body.
- Gives folder file structure. | `GET /api/folders`
- Retrieves EPub thumbnails. | `GET /api/thumbnail/:folderName/:fileName`

Simplified overview:

![overview](docs/figures/epub.drawio.svg)

## Google Vision API Setup
You need access to the `Google Vision API`. 
There is 1000 free scans monthly, so for personal use this should be sufficient, but it requires a billing account active:

Steps
- Create a new google project at https://console.cloud.google.com/.
- Enable the Cloud Vision API.
- Create a new service account and assign permission access to the Cloud Vision API.
- Go to the newly created account and add a json key.
- Put the json key file as google-service-account.json in the `server` directory, alternatively specify the file location in `server/public.env`.
- Finally, add a billing account to the google project.

## Usage
- `npm run setup` for installing dependencies for server and the react app.
- `npm run launch` will build and run the backend and the frontend concurrently.
- It can now be accessed on `localhost:3000`
- Add your book folders and `.EPub` files inside the `server/public` folder, like shown in the [backend](#backend) section.
- You can install the website as a PWA and add it to the home screen on IOS.

When accessing the application from another computer that is not hosting it, you need to set the server API hostname in the settings page. This allows the frontend to be independent from specific backend instances. The project is intended to be hosted locally and can be accessed from outside by port forwarding or preferably by setting up a VPN to achieve the smallest attack surface.

## Development
- `npm run dev` to run the react development server. (Will not produce PWA)
- `npm run server` to run the backend server.

## License
This project is licensed under the MIT License.

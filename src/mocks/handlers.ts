import { http, HttpResponse } from "msw";
import { defaultSettings } from "../app/default.config";

export const handlers = [
    // Main page folder overview
    http.get(`${defaultSettings.API_HOST}/api/folders`, () => {
        return HttpResponse.json(
            [
                { "folderName": "Alice", "files": ["alice.epub"] },
                { "folderName": "Bob", "files": ["vol1.epub", "vol2.epub"] }
            ]
        )
    }),

    // Main page thumbnail request
    http.get(`${defaultSettings.API_HOST}/api/thumbnail/Alice/alice.epub`, () => {
        return HttpResponse.redirect("/mock_data/img/alice.jpg");
    }),

    // Epub file request
    http.get(`${defaultSettings.API_HOST}/Alice/alice.epub`, () => {
        return HttpResponse.redirect("/mock_data/files/alice.epub");
    }),

    // OCR request
    http.post(`${defaultSettings.API_HOST}/api/ocr`, () => {
        return HttpResponse.json({ text: "Hello world.\nMocked Response!\nDid it work?" });
    }),
];
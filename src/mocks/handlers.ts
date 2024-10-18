import { http, HttpResponse } from "msw";
import { basePath } from "../app/env.config";

export const handlers = [
    // Main page folder overview
    http.get(`*/api/folders`, () => {
        return HttpResponse.json(
            [
                { "folderName": "Alice", "files": ["alice.epub"] },
                { "folderName": "Bob", "files": ["vol1.epub", "vol2.epub"] }
            ]
        )
    }),

    // Main page thumbnail request
    http.get(`*/api/thumbnail/Alice/alice.epub`, () => {
        return HttpResponse.redirect(`${basePath}/mock_data/img/alice.jpg`);
    }),

    // Epub file request
    http.get(`*/Alice/alice.epub`, () => {
        return HttpResponse.redirect(`${basePath}/mock_data/files/alice.epub`);
    }),

    // OCR request
    http.post(`*/api/ocr`, () => {
        return HttpResponse.json({ text: "Hello world.\nMocked Response!\nDid it work?" });
    }),
];
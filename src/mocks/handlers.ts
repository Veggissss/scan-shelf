import { http, HttpResponse } from "msw";
import { basePath } from "../app/env.config";

export const handlers = [
    // Main page folder overview
    http.get(`*/api/folders`, () => {
        return HttpResponse.json(
            [
                { "folderName": "Alice", "files": ["test.epub"] },
                { "folderName": "Bob", "files": ["test.epub", "test.epub", "test.epub"] }
            ]
        )
    }),

    // Main page thumbnail request
    http.get(`*/api/thumbnail/Alice/test.epub`, () => {
        return HttpResponse.redirect(`${basePath}/mock_data/img/test.png`);
    }),
    http.get(`*/api/thumbnail/Bob/test.epub`, () => {
        return HttpResponse.redirect(`${basePath}/mock_data/img/test.png`);
    }),

    // Epub file request
    http.get(`*/Alice/test.epub`, () => {
        return HttpResponse.redirect(`${basePath}/mock_data/files/test.epub`);
    }),

    // OCR request
    http.post(`*/api/ocr`, () => {
        return HttpResponse.json({ text: "Hello world.\nMocked Response!\nDid it work?" });
    }),
];
"use client";

import { Rendition } from 'epubjs';
import Section from 'epubjs/types/section';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { ReactReader } from 'react-reader';
import { useSearchParams } from 'next/navigation';
import './reader.css';

// Define server api path
const OCR_API_PATH = `${process.env.NEXT_PUBLIC_API_HOST}/api/ocr`;

// Define dictionary lookup path
const DICTIONARY_LOOKUP = "https://jisho.org/search/";

// Define snippet size (in pixels)
const SNIPPET_WIDTH = 140;
const SNIPPET_HEIGHT = 200;

interface Snippet {
  dataUrl: string;
  left: number;
  top: number;
}

function ReaderPage() {
  const searchParams = useSearchParams();
  const filePath = searchParams.get("filePath");

  const [location, setLocation] = useLocalStorageState<string | number>(
    "persist-location",
    {
      defaultValue: 0,
    }
  );
  const [rendition, setRendition] = useState<Rendition | undefined>(undefined)
  const [text, setText] = useState<string>("Scanned\nClickable\nCharacters\nAppear\nHere!");
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const snippetRef = useRef<Snippet | null>(null);

  const sendRestRequest = (base64ImageSnippet: string) => {
    fetch(OCR_API_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64ImageSnippet }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setText(data.error);
          console.error("Error:", data.error)
          return;
        }
        setText(data.text);
        console.log("Success:", data);
      }
      )
      .catch((error) => {
        setText(error.message);
        console.error("Error:", error)
      }
      );
  };

  // Effect to attach click event listener after rendering
  useEffect(() => {

    const handleSnippet = (e: MouseEvent, img: HTMLImageElement) => {
      const rect = img.getBoundingClientRect();

      // Get the current device pixel ratio (to account for zoom/scale)
      const scaleX = img.naturalWidth / rect.width; // Scale based on the actual size of the image
      const scaleY = img.naturalHeight / rect.height;

      // Calculate the click position relative to the image, adjusted for zoom/scale
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // Create a canvas to draw the image snippet
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = SNIPPET_WIDTH;
        canvas.height = SNIPPET_HEIGHT;

        // Draw the clicked part of the image onto the canvas
        ctx.drawImage(
          img,
          clickX - SNIPPET_WIDTH / 2, // Adjusted source X based on scale
          clickY - SNIPPET_HEIGHT / 2, // Adjusted source Y based on scale
          SNIPPET_WIDTH, // Source width
          SNIPPET_HEIGHT, // Source height
          0, // Target X
          0, // Target Y
          SNIPPET_WIDTH, // Target width
          SNIPPET_HEIGHT // Target height
        );

        // Convert the canvas content to a data URL (Base64 string)
        const dataUrl = canvas.toDataURL("image/png");

        // Store snippet data with the correct position, adjusted for zoom
        setSnippet({
          dataUrl,
          left: (e.clientX - SNIPPET_WIDTH / 2),
          top: (e.clientY - SNIPPET_HEIGHT / 2),
        });

        snippetRef.current = {
          dataUrl,
          left: (e.clientX - SNIPPET_WIDTH / 2),
          top: (e.clientY - SNIPPET_HEIGHT / 2),
        };
      }
    };

    if (!rendition) return;

    // Add event listener
    rendition.hooks.content.register((content: Section) => {
      const images = content.document.querySelectorAll("img");
      images.forEach((img) => {
        let isDragging = false;

        // Mouse events for dragging
        img.onmousedown = (e) => {
          e.preventDefault();
          isDragging = true;
        };

        img.onmousemove = (e) => {
          if (isDragging) {
            e.preventDefault();
            const mouseEvent = new MouseEvent("click", {
              clientX: e.clientX,
              clientY: e.clientY,
            });
            handleSnippet(mouseEvent, img);
          }
        };

        img.onmouseup = (e) => {
          e.preventDefault();
          isDragging = false;
        };

        // Touch events for mobile
        img.ontouchstart = (e) => {
          e.preventDefault();
        };

        img.ontouchmove = (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent("click", {
            clientX: touch.clientX,
            clientY: touch.clientY,
          });
          handleSnippet(mouseEvent, img);
        };       
      });
      return content;
    });

  }, [rendition, snippet]);

  return (
    <div>
      <div className="ocr-output">
        {text && text.split("\n").map((word, index) => (
          <h1 key={index}>
            <a href={`${DICTIONARY_LOOKUP}${word}`} target="_blank" rel="noopener noreferrer">
              {word + "\n"}
            </a>
          </h1>
        ))}
      </div>
      <div>
        <div style={{ height: "95vh" }}>
          <ReactReader
            getRendition={(_rendition: Rendition) => {
              _rendition.themes.default({
                'img': {
                  'display': 'block',
                  'margin': '0 auto', // Centers the image horizontally
                },
              });
              setRendition(_rendition)
            }}
            url={filePath ? `${process.env.NEXT_PUBLIC_API_HOST}/${filePath}` : "/test.epub"}
            location={location}
            locationChanged={(loc: string) => setLocation(loc)}
            epubInitOptions={{
              openAs: "epub",
            }}
            epubOptions={{
              allowPopups: true, // Adds `allow-popups` to sandbox-attribute
              allowScriptedContent: true, // Adds `allow-scripts` to sandbox-attribute
              manager: "default",
              flow: "paginated",
              height: "100vh",
              width: "auto",
              defaultDirection: "ltr",
              spread: "none",
            }}
            epubViewStyles={{
              view: {
                backgroundColor: "black",
              },
              viewHolder: {
                backgroundColor: "black",
              },
            }}
            showToc={false}
          />
        </div>
        {snippet && (
          <div style={{
            position: "absolute",
            top: `${snippet.top}px`,
            left: `${snippet.left}px`,
            zIndex: 10,
          }}>
            <button style={{
              position: "relative",
              border: "5px solid red",
              boxSizing: "border-box",
              backgroundColor: "black",
              width: `${SNIPPET_WIDTH}px`,
            }} onClick={() => {
              if (snippetRef.current) {
                sendRestRequest(snippetRef.current.dataUrl.split(",")[1]);
              }
            }}>Scan
            </button>
            <img
              src={snippet.dataUrl}
              alt="Snippet"
              onClick={() => setSnippet(null)}
              style={{
                width: `${SNIPPET_WIDTH}px`,
                height: `${SNIPPET_HEIGHT}px`,
                border: "5px solid red",
                boxSizing: "border-box",
                cursor: "crosshair",
              }}
              className="snippet-image"
            />
            
          </div>
        )}
      </div>
      <h1>Hello</h1>
    </div>
  );
};

function Reader() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReaderPage />
    </Suspense>
  );
}

export default Reader;

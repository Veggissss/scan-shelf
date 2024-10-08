"use client";

import { Rendition } from 'epubjs';
import Section from 'epubjs/types/section';
import React, { useState, useEffect, useRef } from 'react';
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
  const [text, setText] = useState<string>("Beans are cool\nI like beans");
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const snippetRef = useRef<Snippet | null>(null);

  // Effect to attach click event listener after rendering
  useEffect(() => {

    // Mock REST request function
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

    // Function to handle clicks inside the iframe content
    const handleIframeClick = (e: MouseEvent, img: HTMLImageElement, sendRequest: boolean = true) => {
      const rect = img.getBoundingClientRect();

      // Calculate the click position relative to the image
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Create a canvas to draw the image snippet
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = SNIPPET_WIDTH;
        canvas.height = SNIPPET_HEIGHT;

        // Draw the clicked part of the image onto the canvas
        ctx.drawImage(
          img,
          clickX - SNIPPET_WIDTH / 2, // Source X
          clickY - SNIPPET_HEIGHT / 2, // Source Y
          SNIPPET_WIDTH, // Source width
          SNIPPET_HEIGHT, // Source height
          0, // Target X
          0, // Target Y
          SNIPPET_WIDTH, // Target width
          SNIPPET_HEIGHT // Target height
        );

        // Convert the canvas content to a data URL (Base64 string)
        const dataUrl = canvas.toDataURL("image/png");

        setSnippet({
          dataUrl,
          left: clickX - SNIPPET_WIDTH / 2,
          top: clickY - SNIPPET_HEIGHT / 2,
        });

        snippetRef.current = {
          dataUrl,
          left: clickX - SNIPPET_WIDTH / 2,
          top: clickY - SNIPPET_HEIGHT / 2,
        };

        // Send the image snippet to the server
        if (sendRequest) {
          sendRestRequest(dataUrl.split(",")[1]);
        }
      }
    };

    if (!rendition) return;

    // Add event listener
    rendition.hooks.content.register((content: Section) => {
      const images = content.document.querySelectorAll("img");
      images.forEach((img) => {
        img.onclick = (e) => {
          e.preventDefault();
          handleIframeClick(e, img);
        };

        img.ontouchstart = (e) => {
          e.preventDefault();
        };

        // Enable dragging box selection
        img.ontouchmove = (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent("click", {
            clientX: touch.clientX,
            clientY: touch.clientY,
          });
          handleIframeClick(mouseEvent, img, false);
        };

        // Send request on touch end
        img.ontouchend = (e) => {
          e.preventDefault();
          if (snippetRef.current) {
            sendRestRequest(snippetRef.current.dataUrl.split(",")[1]);
          }
          else {
            setText("No snippet selected");
          }
        };

        img.style.cursor = "pointer";
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
        <div style={{ width: "100vw", height: "95vh", position: "relative" }}>
          <ReactReader
            getRendition={(_rendition: Rendition) => {
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
            }}
            epubViewStyles={{
              view: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "250%",
                width: "250%",
              },
              viewHolder: {
                height: "100%",
                width: "100%",
              },
            }}
            showToc={false}
          />
        </div>
        {snippet && (
          <img
            src={snippet.dataUrl}
            alt="Snippet"
            onClick={() => setSnippet(null)}
            style={{
              position: "absolute",
              top: `${snippet.top}px`,
              left: `${snippet.left}px`,
              width: `${SNIPPET_WIDTH}px`,
              height: `${SNIPPET_HEIGHT}px`,
              border: "5px solid red",
              boxSizing: "border-box",
              zIndex: 10,
            }}
            className="snippet-image"
          />
        )}
      </div>
    </div>
  );
};

export default ReaderPage;
"use client";

import { Rendition } from 'epubjs';
import Section from 'epubjs/types/section';
import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';

// Define server api path
const OCR_API_PATH = "http://localhost:3001/ocr";

// Define snippet size (in pixels)
const SNIPPET_WIDTH = 150;
const SNIPPET_HEIGHT = 150;

interface Snippet {
  dataUrl: string;
  left: number;
  top: number;
}

export const Page = () => {
  const [location, setLocation] = useState<string | number>(0);
  const [rendition, setRendition] = useState<Rendition | undefined>(undefined)
  const [snippet, setSnippet] = useState<Snippet | null>(null);

  // Effect to attach click event listener after rendering
  useEffect(() => {

    // Mock REST request function
    const sendRestRequest = (base64ImageSnippet: string) => {
      fetch(OCR_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64ImageSnippet }),
      })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch((error) => console.error('Error:', error));
    };

    // Function to handle clicks inside the iframe content
    const handleIframeClick = (e: MouseEvent, img: HTMLImageElement) => {
      console.log('Click inside iframe');
      console.log(img);
      console.log(e);

      const rect = img.getBoundingClientRect();

      // Calculate the click position relative to the image
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Create a canvas to draw the image snippet
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

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
        const dataUrl = canvas.toDataURL('image/png');

        setSnippet({
          dataUrl,
          left: clickX - SNIPPET_WIDTH / 2,
          top: clickY - SNIPPET_HEIGHT / 2,
        });

        // Send the image snippet to the server
        sendRestRequest(dataUrl.split(',')[1]);
      }
    };

    if (!rendition) return;

    // Add event listener
    rendition.hooks.content.register((content: Section) => {
      console.log(content);
      console.log('Content rendered');
      const images = content.document.querySelectorAll('img');
      images.forEach((img) => {
        img.onmousedown = (e) => {
          e.preventDefault();
          handleIframeClick(e, img);
        };
        img.style.cursor = 'pointer';
      });
      return content;
    });

  }, [rendition]);

  return (
    <div>

      <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
          <ReactReader
            getRendition={(_rendition: Rendition) => {
              setRendition(_rendition)
            }}
            url="/test.epub"
            location={location}
            locationChanged={(epubcfi: string) => setLocation(epubcfi)}
            title={'Aboba'}
            epubInitOptions={{
              openAs: 'epub',
            }}
            epubOptions={{
              allowPopups: true, // Adds `allow-popups` to sandbox-attribute
              allowScriptedContent: true, // Adds `allow-scripts` to sandbox-attribute
              manager: 'default',
              flow: 'paginated',
            }}
            epubViewStyles={{
              view: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '250%',
                width: '250%',
              },
              viewHolder: {
                height: '100%',
                width: '100%',
              },
            }}
            showToc={false}
          />
        </div>
        {snippet && (
            <img
              src={snippet.dataUrl}
              alt="Snippet"
              style={{
                position: 'absolute',
                top: `${snippet.top}px`,
                left: `${snippet.left}px`,
                width: `${SNIPPET_WIDTH}px`,
                height: `${SNIPPET_HEIGHT}px`,
                border: '5px solid red',
                boxSizing: 'border-box',
                zIndex: 10,
              }}
              className="snippet-image"
            />
          )}
      </div>
    </div>
  );
};

export default Page;

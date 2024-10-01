"use client";

import { Rendition } from 'epubjs';
import Section from 'epubjs/types/section';
import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';

interface Snippet {
  dataUrl: string;
}

export const Page = () => {
  const [location, setLocation] = useState<string | number>(0);
  const [rendition, setRendition] = useState<Rendition | undefined>(undefined)
  const [snippet, setSnippet] = useState<Snippet>({dataUrl: "not set"});

  // Effect to attach click event listener after rendering
  useEffect(() => {

    // Mock REST request function
    /*const sendMockRestRequest = (imageSnippet: string) => {
      fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageSnippet }),
      })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch((error) => console.error('Error:', error));
    };*/

    // Function to handle clicks inside the iframe content
    const handleIframeClick = (e: MouseEvent, img: HTMLImageElement) => {
      console.log('Click inside iframe');
      console.log(img);
      console.log(e);

      const rect = img.getBoundingClientRect();

      // Define snippet size (in pixels)
      const snippetWidth = 100;
      const snippetHeight = 100;

      // Calculate the click position relative to the image
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Create a canvas to draw the image snippet
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = snippetWidth;
        canvas.height = snippetHeight;

        // Draw the clicked part of the image onto the canvas
        ctx.drawImage(
          img,
          clickX - snippetWidth / 2, // Source X
          clickY - snippetHeight / 2, // Source Y
          snippetWidth, // Source width
          snippetHeight, // Source height
          0, // Target X
          0, // Target Y
          snippetWidth, // Target width
          snippetHeight // Target height
        );

        // Convert the canvas content to a data URL (Base64 string)
        const dataUrl = canvas.toDataURL('image/png');

        console.log(dataUrl);
        setSnippet({ dataUrl });

        // Draw a square around the clicked area
        //setSquare({ x: clientX - size / 2, y: clientY - size / 2, size });

        //sendMockRestRequest(dataUrl);
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
    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <ReactReader
          getRendition={(_rendition: Rendition) => {
            setRendition(_rendition)
          }}
          url="/vol1.epub"
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
        <img src={snippet.dataUrl} alt="Snippet" />
      </div>
    </div>
  );
};

export default Page;

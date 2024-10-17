"use client";
import { Suspense, use } from "react";
import { basePath, isPagesConfig as isPagesConfig } from "../basePath";

// Use correct path and mock when deployed to GitHub Pages
const isMockEnvironment = process.env.NODE_ENV === "development" || isPagesConfig;
const mockingEnabledPromise =
    typeof window !== "undefined" && isMockEnvironment
        ? import("../../mocks/worker").then(async ({ worker }) => {
            await worker.start({
                serviceWorker: {
                    url: `${basePath}/mockServiceWorker.js` 
                }
            });
        })
        : Promise.resolve();

export function MSWProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    // If MSW is enabled, we need to wait for the worker to start,
    // so we wrap the children in a Suspense boundary until it's ready.
    return (
        <Suspense fallback={null}>
            <MSWProviderWrapper>{children}</MSWProviderWrapper>
        </Suspense>
    );
}

function MSWProviderWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
    use(mockingEnabledPromise);
    return children;
}
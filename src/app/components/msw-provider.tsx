"use client";
import { Suspense, use } from "react";

// Use correct path and mock when deployed to GitHub Pages
const isPageConfig = process.env.NEXT_PUBLIC_DEPLOY_ENVIRONMENT === 'pages';
const path = isPageConfig ? '/scan-shelf//mockServiceWorker.js' : '/mockServiceWorker.js';

const isMockEnviorment = process.env.NODE_ENV === "development" || isPageConfig;
const mockingEnabledPromise =
    typeof window !== "undefined" && isMockEnviorment
        ? import("../../mocks/worker").then(async ({ worker }) => {
            await worker.start({
                serviceWorker: {
                    url: path
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
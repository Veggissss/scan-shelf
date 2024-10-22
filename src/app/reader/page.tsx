"use client";

import React, { Suspense } from 'react';
import Reader from './components/Reader';

const ReaderPage: React.FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Reader />
  </Suspense>
);

export default ReaderPage;
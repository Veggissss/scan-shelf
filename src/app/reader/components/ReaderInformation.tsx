import React from 'react';

interface ReaderInformationProps {
    pageDisplay: string;
}

const ReaderInformation: React.FC<ReaderInformationProps> = ({ pageDisplay }) => (
    <div className="reader-information">
        <h1>{pageDisplay}</h1>
    </div>
);

export default ReaderInformation;

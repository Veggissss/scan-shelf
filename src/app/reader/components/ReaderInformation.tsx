import React from 'react';

interface ReaderInformationProps {
    pageDisplay: string;
}

const ReaderInformation: React.FC<ReaderInformationProps> = ({ pageDisplay }) => (
    <div className="reader-information">
        <p>{pageDisplay}</p>
    </div>
);

export default ReaderInformation;

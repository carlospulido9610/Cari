import React from 'react';
import { ContactSection } from '../../components/ContactSection';

interface ContactPageProps {
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onSuccess, onError }) => {
    return (
        <div className="pt-20 md:pt-24 min-h-screen bg-[#fdfdfd]">
            <ContactSection onSuccess={onSuccess} onError={onError} />
        </div>
    );
};

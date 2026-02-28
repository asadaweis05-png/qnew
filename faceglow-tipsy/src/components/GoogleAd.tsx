import React, { useEffect } from 'react';

interface GoogleAdProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export const GoogleAd: React.FC<GoogleAdProps> = ({
    slot,
    format = 'auto',
    responsive = true,
    className = "",
    style = { display: 'block' }
}) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return (
        <div className={`ad-container-react ${className}`} style={{ margin: '20px 0', textAlign: 'center' }}>
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client="ca-pub-8203084339795682"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
};


import React, { useEffect } from 'react';

interface AdSenseProps {
  adClient?: string;
  adSlot?: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
}

const AdSense: React.FC<AdSenseProps> = ({
  adClient = "ca-pub-8055550781914254",
  adSlot = "6361286418",
  adFormat = 'auto',
  style = {},
  className = '',
}) => {
  useEffect(() => {
    try {
      // Request ads when component mounts
      if ((window as any).adsbygoogle) {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          overflow: 'hidden',
          ...style,
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSense;

import { useEffect, useRef, useId } from "react";

interface AdBannerProps {
  position: "header" | "middle" | "footer";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdBanner = ({ position, className = "" }: AdBannerProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const uniqueId = useId();

  const adConfig = {
    header: {
      format: "horizontal" as const,
      height: "min-h-[90px] md:min-h-[100px]",
    },
    middle: {
      format: "auto" as const,
      height: "min-h-[250px] md:min-h-[280px]",
    },
    footer: {
      format: "horizontal" as const,
      height: "min-h-[90px] md:min-h-[100px]",
    },
  };

  const config = adConfig[position];

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (adRef.current && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [uniqueId]);

  return (
    <div className={`w-full overflow-hidden rounded-xl ${config.height} ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: "90px" }}
        data-ad-client="ca-pub-8203084339795682"
        data-ad-slot="3085787126"
        data-ad-format={config.format}
        data-full-width-responsive="true"
        key={uniqueId}
      />
    </div>
  );
};

export default AdBanner;

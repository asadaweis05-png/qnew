import { useState, useCallback } from 'react';
import { Download, RefreshCw, Aperture, Shield, Zap } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { ProcessingIndicator } from '@/components/ProcessingIndicator';
import { Button } from '@/components/ui/button';
import { processImage, downloadImage } from '@/lib/colorGrading';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>('cinematic');
  const [outputFormat, setOutputFormat] = useState<string>('jpg');

  const handleImageSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setOriginalImage(null);
    setProcessedImage(null);

    try {
      const result = await processImage(file);
      setOriginalImage(result.original);
      setProcessedImage(result.processed);
      setOutputFilename(result.filename);
      setOutputFormat(result.format);
      
      toast({
        title: "Color grading complete",
        description: "Your cinematic masterpiece is ready.",
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Please try again with a different image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (processedImage) {
      downloadImage(processedImage, `${outputFilename}-cinematic.${outputFormat}`);
      toast({
        title: "Download started",
        description: "Your image is being saved.",
      });
    }
  }, [processedImage, outputFilename, outputFormat]);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
  }, []);

  return (
    <main className="min-h-screen bg-background film-grain vignette overflow-hidden">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Teal orb */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-teal/10 rounded-full blur-[120px] animate-breathe" />
        {/* Orange orb */}
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-orange/10 rounded-full blur-[120px] animate-breathe" style={{ animationDelay: '2s' }} />
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-radial from-teal/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass mb-8">
            <Aperture className="w-4 h-4 text-teal" />
            <span className="text-sm tracking-wide text-muted-foreground uppercase">Cinematic Color Grading</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-light mb-6 tracking-tight">
            Transform your vision into
            <br />
            <span className="text-gradient-gold italic">cinema</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
            Apply the legendary teal & orange color grade used in Hollywood blockbusters.
            Professional results in seconds.
          </p>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {isProcessing ? (
            <ProcessingIndicator />
          ) : originalImage && processedImage ? (
            <div className="w-full space-y-10 animate-fade-in">
              <BeforeAfterSlider
                originalImage={originalImage}
                processedImage={processedImage}
              />
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="cinematic"
                  size="lg"
                  onClick={handleDownload}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  <Download className="w-5 h-5" />
                  Download
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleReset}
                  className="w-full sm:w-auto min-w-[200px] text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-5 h-5" />
                  Process Another
                </Button>
              </div>
            </div>
          ) : (
            <ImageUploader
              onImageSelect={handleImageSelect}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Features */}
        {!originalImage && !isProcessing && (
          <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            {[
              {
                icon: Shield,
                title: 'Privacy First',
                description: 'Your images never leave your device. All processing happens locally.',
              },
              {
                icon: Aperture,
                title: 'Hollywood Grade',
                description: 'The iconic teal & orange look from blockbuster cinematography.',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Professional color grading in milliseconds, not minutes.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-lg glass hover:bg-card/80 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal/20 to-orange/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-5 h-5 text-foreground/80" />
                </div>
                <h3 className="font-display text-xl mb-2 text-foreground/90">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center">
          <p className="text-xs text-muted-foreground/60 tracking-wide uppercase">
            Client-side processing • No uploads • Your privacy protected
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Index;

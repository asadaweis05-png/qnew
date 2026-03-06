import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Sparkles, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const makeupStyles = [
  { id: "natural", name: "Natural", description: "Subtle everyday look", emoji: "🌸" },
  { id: "glamour", name: "Glamour", description: "Bold evening makeup", emoji: "✨" },
  { id: "bridal", name: "Bridal", description: "Elegant wedding look", emoji: "💒" },
  { id: "editorial", name: "Editorial", description: "High fashion runway", emoji: "🎨" },
  { id: "korean", name: "K-Beauty", description: "Glass skin style", emoji: "🇰🇷" },
  { id: "gothic", name: "Gothic", description: "Dark dramatic look", emoji: "🖤" },
  { id: "smoky", name: "Smoky Eye", description: "Classic sultry eyes", emoji: "🌫️" },
  { id: "nomakeup", name: "No-Makeup", description: "Enhanced natural beauty", emoji: "🍃" },
  { id: "festival", name: "Festival", description: "Glitter & bold colors", emoji: "🎪" },
  { id: "vintage", name: "Vintage", description: "Old Hollywood glam", emoji: "🎬" },
  { id: "sunset", name: "Sunset Eyes", description: "Warm orange & pink", emoji: "🌅" },
  { id: "fairy", name: "Fairy Core", description: "Ethereal & dreamy", emoji: "🧚" },
];

const MakeupTest = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("natural");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      setResultImage(null);
    };
    reader.readAsDataURL(file);
  };

  const applyMakeup = async () => {
    if (!selectedImage) {
      toast.error("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    setResultImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("apply-makeup", {
        body: {
          imageBase64: selectedImage,
          makeupStyle: selectedStyle,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.image) {
        setResultImage(data.image);
        toast.success("Makeup applied successfully!");
      } else {
        throw new Error("No image was generated");
      }
    } catch (error) {
      console.error("Error applying makeup:", error);
      toast.error(error instanceof Error ? error.message : "Failed to apply makeup. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `makeup-${selectedStyle}-${Date.now()}.png`;
    link.click();
    toast.success("Image downloaded!");
  };

  const reset = () => {
    setSelectedImage(null);
    setResultImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Makeup Studio
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Upload Section */}
        <Card className="mb-6 border-pink-200/50 dark:border-border">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold mb-1">Upload Your Photo</h2>
              <p className="text-sm text-muted-foreground">
                See how different makeup styles would look on you
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {!selectedImage ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-pink-300 dark:border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-pink-50/50 dark:hover:bg-muted/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-pink-100 dark:bg-muted flex items-center justify-center">
                  <Upload className="w-7 h-7 text-pink-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Tap to upload photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                </div>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Uploaded"
                  className="w-full max-h-64 object-contain rounded-xl"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={reset}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Style Selection */}
        {selectedImage && (
          <Card className="mb-6 border-purple-200/50 dark:border-border">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-center">Choose Makeup Style</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {makeupStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedStyle === style.id
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-500/10"
                        : "border-border hover:border-pink-300"
                    }`}
                  >
                    <span className="text-xl">{style.emoji}</span>
                    <p className="font-medium text-sm mt-1">{style.name}</p>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Apply Button */}
        {selectedImage && (
          <Button
            onClick={applyMakeup}
            disabled={isProcessing}
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold text-lg mb-6"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Applying Makeup...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Apply {makeupStyles.find(s => s.id === selectedStyle)?.name} Makeup
              </>
            )}
          </Button>
        )}

        {/* Result Section */}
        {resultImage && (
          <Card className="border-green-200/50 dark:border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-center mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Your New Look
              </h3>
              <img
                src={resultImage}
                alt="With makeup"
                className="w-full max-h-96 object-contain rounded-xl mb-4"
              />
              <div className="flex gap-3">
                <Button
                  onClick={downloadImage}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setResultImage(null)}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Another Style
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💡 Tip: Use a clear, front-facing photo with good lighting for best results</p>
        </div>
      </main>
    </div>
  );
};

export default MakeupTest;

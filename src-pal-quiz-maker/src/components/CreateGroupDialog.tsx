import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ICONS = ["⚽", "🏀", "🎮", "📚", "🎵", "🎬", "💻", "🎨", "✈️", "🍳", "💪", "🧘", "📷", "🎯", "🌍", "🚗", "🎸", "🏋️", "🎤", "🎭"];

interface CreateGroupDialogProps {
  onGroupCreated: () => void;
}

const CreateGroupDialog = ({ onGroupCreated }: CreateGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🎯");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Fadlan geli magaca kooxda");
      return;
    }

    if (name.trim().length > 50) {
      toast.error("Magaca kooxda waa inuu ka yaraadaa 50 xaraf");
      return;
    }

    if (description.length > 200) {
      toast.error("Faahfaahinta waa inay ka yaraato 200 xaraf");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("interest_groups").insert({
      name: name.trim(),
      description: description.trim() || null,
      icon: selectedIcon,
    });

    setLoading(false);

    if (error) {
      console.error("Error creating group:", error);
      toast.error("Khalad ayaa dhacay markaad abuurtay kooxda");
      return;
    }

    toast.success("Kooxda waa la abuuray!");
    setName("");
    setDescription("");
    setSelectedIcon("🎯");
    setOpen(false);
    onGroupCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Koox Cusub
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Abuur Koox Cusub</DialogTitle>
            <DialogDescription>
              Abuur koox cusub oo dadka daneeya ay ku biiri karaan
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Magaca Kooxda *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="tusaale: Kubadda Cagta"
                maxLength={50}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Faahfaahin (ikhtiyaari)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sharax kooxda..."
                maxLength={200}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Dooro Astaanta</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all ${
                      selectedIcon === icon
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Ka noqo
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Waa la abuurayaa..." : "Abuur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
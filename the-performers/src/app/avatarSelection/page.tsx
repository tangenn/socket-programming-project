import { AvatarSelectionCard } from "@/components/AvatarSelectionCard";

export default function SelectAvatarPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-10">
      
     
      <div className="absolute inset-0 bg-[url('/backgrounds/background_Noir.jpg')]
                      bg-cover bg-center bg-fixed -z-10" />

    
      <AvatarSelectionCard />
    </div>
  );
}
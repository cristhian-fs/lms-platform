import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestForm } from "@/lib/request";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

type UploadResponse = { url: string };

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const formData = new FormData();
  formData.set("file", file);
  formData.set("bucket", "course-images");
  formData.set("path", `courses/${Date.now()}.${ext}`);

  const res = await requestForm<UploadResponse>("/api/upload", formData);
  return res.data.url;
}

export function useServiceImage(initial: string | null = null) {
  const [imageUrl, setImageUrl] = useState<string | null>(initial);

  const { mutate, isPending } = useMutation({
    mutationFn: uploadImage,
    onSuccess: (url) => {
      setImageUrl(url);
      toast.success("Foto carregada!");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar foto.");
    },
  });

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }
    mutate(file);
  }

  return { imageUrl, setImageUrl, uploading: isPending, handleImageUpload };
}

// src/components/mediaQueue.ts

// Simula endpoints locais que interagem com Graph API via backend

export async function createCampaign(
  name: string,
  objective: string
): Promise<string> {
  const response = await fetch("/api/create-campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, objective })
  });

  if (!response.ok) throw new Error("Erro ao criar campanha");
  const data = await response.json();
  return data.id;
}

export async function createAdSet(
  campaignId: string,
  audienceId: string,
  budget: { type: string; value: number }
): Promise<string> {
  const response = await fetch("/api/create-adset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaignId, audienceId, budget })
  });

  if (!response.ok) throw new Error("Erro ao criar ad set");
  const data = await response.json();
  return data.id;
}

export async function uploadImageToMeta(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body: form
  });

  if (!response.ok) throw new Error("Erro no upload da imagem");
  const data = await response.json();
  return data.hash; // hash da imagem
}

export async function createAd(
  adSetId: string,
  message: string,
  files: File[]
): Promise<string> {
  const hash = await uploadImageToMeta(files[0]);

  const response = await fetch("/api/create-ad", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adSetId, message, hash })
  });

  if (!response.ok) throw new Error("Erro ao criar anúncio");
  const data = await response.json();
  return data.id;
}

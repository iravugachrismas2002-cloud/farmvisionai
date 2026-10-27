"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/alert";

type CreateFarmResponse = {
  error?: string;
  issues?: Array<{ path: string; message: string }>;
};

export function CreateFarmForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setMessage(null);
    setIsError(false);
    setIsSubmitting(true);

    const formData = new FormData(formElement);
    const rawName = formData.get("name");
    const rawLocation = formData.get("locationLabel");
    const payload = {
      name: typeof rawName === "string" ? rawName : "",
      locationLabel:
        typeof rawLocation === "string" && rawLocation.trim()
          ? rawLocation
          : undefined,
    };

    try {
      const response = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as CreateFarmResponse;

      if (!response.ok) {
        setIsError(true);
        setMessage(result.issues?.[0]?.message ?? result.error ?? "The farm could not be saved.");
        return;
      }

      formElement.reset();
      setMessage("Farm registered successfully.");
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("The request could not reach FarmVision. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="create-farm-card">
      <CardHeader
        title={
          <div>
            <p className="eyebrow">ADD A FARM</p>
            <h1>Register Farm</h1>
          </div>
        }
      />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Farm name"
          placeholder="e.g. Main Farm"
          name="name"
          autoComplete="organization"
          maxLength={160}
          required
        />
        <Input
          label="Location label"
          placeholder="e.g. North Field"
          name="locationLabel"
          autoComplete="address-level2"
          maxLength={200}
        />

        {message ? (
          <Alert
            severity={isError ? "error" : "success"}
            title={isError ? "Error" : "Success"}
            description={message}
          />
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
        >
          {isSubmitting ? "Saving…" : "Save farm"}
        </Button>
      </form>
    </Card>
  );
}

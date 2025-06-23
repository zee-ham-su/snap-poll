
"use client"
import { CreatePollForm } from "@/components/create-poll-form"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CreatePollPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  if (!user) {
    return null;
  }
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Create a New Poll</h1>
      <CreatePollForm />
    </div>
  );
}

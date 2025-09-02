"use client";
import { useState } from "react";

// Mock poll data for demo
const mockPoll = {
  id: "1",
  question: "What is your favorite programming language?",
  options: [
    { id: "a", text: "JavaScript" },
    { id: "b", text: "Python" },
    { id: "c", text: "TypeScript" },
    { id: "d", text: "Go" },
  ],
};

export default function PollDetailPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline edit: handle vote submission with loading and error
  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selected) return;
    setLoading(true);
    try {
      // TODO: Replace with real vote API call
      await new Promise((res) => setTimeout(res, 700));
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit vote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Thank you for voting!</h2>
        <p className="text-gray-600">Results coming soon…</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{mockPoll.question}</h1>
      <form onSubmit={handleVote}>
        <div className="space-y-2 mb-4">
          {mockPoll.options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="option"
                value={opt.id}
                checked={selected === opt.id}
                onChange={() => setSelected(opt.id)}
                required
                disabled={loading}
              />
              {opt.text}
            </label>
          ))}
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!selected || loading}
        >
          {loading ? "Submitting..." : "Vote"}
        </button>
      </form>
    </div>
  );
}
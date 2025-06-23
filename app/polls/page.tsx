import Link from "next/link";
import { getPolls } from "@/actions/poll-actions";
import { Button } from "@/components/ui/button";

export default async function PollsPage() {
  const polls = await getPolls();
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Browse Polls</h1>
      {polls.length === 0 ? (
        <div className="text-center text-gray-500">No polls found.</div>
      ) : (
        <ul className="space-y-4 max-w-2xl mx-auto">
          {polls.map((poll) => (
            <li key={poll.id} className="border rounded-lg p-4 flex flex-col gap-2">
              <div className="font-semibold text-lg">{poll.title}</div>
              {poll.description && <div className="text-gray-600">{poll.description}</div>}
              <Button asChild variant="outline" size="sm" className="w-fit mt-2">
                <Link href={`/poll/${poll.id}`}>Vote / View</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-fit mt-2">
                <Link href={`/poll/${poll.id}/results`}>View Results</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

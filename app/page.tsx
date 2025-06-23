import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Vote, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Top right login/signup button */}
        <div className="flex justify-end mb-4">
          <Link href="/auth">
            <Button variant="outline">Login / Sign Up</Button>
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to PollApp
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create polls, gather opinions, and see results in real-time. 
            Make decisions together with our simple and intuitive polling platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <PlusCircle className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Create a Poll</CardTitle>
              <CardDescription>
                Start by creating a new poll with custom questions and options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create">
                <Button className="w-full" size="lg">
                  Create New Poll
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Vote className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <CardTitle>Vote on Polls</CardTitle>
              <CardDescription>
                Participate in polls and make your voice heard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/polls">
                <Button variant="outline" className="w-full" size="lg">
                  Browse Polls
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>View Results</CardTitle>
              <CardDescription>
                See real-time results and analytics for your polls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/polls">
                <Button variant="outline" className="w-full" size="lg">
                  View Results
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Create</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Set up your poll with a question and multiple choice options
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 dark:text-green-400 font-bold">2</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Share</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Share your poll link with friends, colleagues, or your audience
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Analyze</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Watch results come in real-time and analyze the data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

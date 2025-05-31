"use client";

import { useParams } from "next/navigation";
import { guideItems } from "../data";
import ReactMarkdown from "react-markdown";

export default function GuidePage() {
  const { slug } = useParams();
  const guide = guideItems.find(g => g.slug === slug);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">
        {guide?.title || "Guide Not Found"}
      </h1>

      {guide ? (
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown>{guide.content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-muted-foreground">No content available for this guide.</p>
      )}
    </main>
  );
}
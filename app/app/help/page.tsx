// app/help/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  const router = useRouter();

  const helpTopics = [
    { title: 'How to Log In', route: '/help/login' },
    { title: 'How to Sign Up', route: '/help/signup' },
    { title: 'Resetting Your Password', route: '/help/reset-password' },
    { title: 'Creating a Custom Avatar', route: '/help/custom-avatar' },
    { title: 'Generating Videos with Your Avatar', route: '/help/generate-video' },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Help & Support</h1>
      <p className="mb-4 text-muted-foreground">Select a topic for guidance:</p>
      <div className="grid gap-3">
        {helpTopics.map((topic) => (
          <Button
            key={topic.title}
            onClick={() => router.push(topic.route)}
            variant="outline"
            className="w-fit"
          >
            {topic.title}
          </Button>
        ))}
      </div>
    </main>
  );
}
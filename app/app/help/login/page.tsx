// app/help/login/page.tsx
export default function HelpLogin() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-2">How to Log In</h1>
      <p className="mb-4">To log in:</p>
      <ol className="list-decimal ml-6 space-y-2">
        <li>Go to the Login page from the top navigation bar.</li>
        <li>Enter your registered email and password.</li>
        <li>Click the "Log In" button.</li>
        <li>If credentials are correct, you’ll be redirected to the dashboard.</li>
      </ol>
    </main>
  );
}
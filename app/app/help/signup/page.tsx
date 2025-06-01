// app/help/signup/page.tsx
export default function HelpSignup() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-2">How to Sign Up</h1>
      <p className="mb-4">To create an account:</p>
      <ol className="list-decimal ml-6 space-y-2">
        <li>Navigate to the Sign Up page.</li>
        <li>Fill in your name, email, and password.</li>
        <li>Click "Sign Up".</li>
        <li>You may need to verify your email before logging in.</li>
      </ol>
    </main>
  );
}
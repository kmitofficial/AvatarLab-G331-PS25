// app/help/reset-password/page.tsx
export default function HelpResetPassword() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-2">Resetting Your Password</h1>
      <p className="mb-4">Forgot your password?</p>
      <ol className="list-decimal ml-6 space-y-2">
        <li>Click "Forgot Password?" on the login page.</li>
        <li>Enter your registered email.</li>
        <li>Check your inbox for the reset link and follow the instructions.</li>
      </ol>
    </main>
  );
}
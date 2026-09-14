export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
      <form action="/api/auth/callback/credentials" method="post" className="w-full rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
        <img src="/arsh-enterprises-logo.png" alt="ARSH ENTERPRISES" className="mx-auto h-20 w-auto object-contain" />
        <h1 className="mt-4 text-center text-2xl font-bold">Sign in</h1>
        <label className="mt-6 block text-sm font-medium">Email</label>
        <input name="email" type="email" required className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2" />
        <label className="mt-4 block text-sm font-medium">Password</label>
        <input name="password" type="password" required className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2" />
        <button className="mt-6 w-full rounded-md bg-teal-700 px-4 py-2 font-semibold text-white">Sign in</button>
      </form>
    </main>
  );
}

'use client';
import AuthButton from '../components/AuthButton';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Login to Spotify Analytics</h1>
      <AuthButton />
      <p>After logging in, go to your <Link href="/">Homepage</Link></p>
    </main>
  );
}

'use client'; // marking as a client component

import AuthButton from '../components/AuthButton'; //importing our AuthButton component -- separating logic and UI
//import Link from 'next/link';
import './login.css'; // import css for styling 

export default function LoginPage() { // React functional component for login page
  return (
    <main className="login-page"> {/* login page styling */}
      <h1 className="login-title">Welcome to TrackRecord FM</h1> {/* welcome text styling */}
      <AuthButton /> {/* linking to spotify login button */}
    </main>
  );
}

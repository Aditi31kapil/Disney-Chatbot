'use client'
import Image from "next-auth/image";
import { FcGoogle } from "next-auth/react-icons/fc";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { useRouter } from 'next-auth/navigation';
import { useEffect, useState } from 'next-auth/react';
import './login.css'; // Importing CSS file

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');

  

  useEffect(() => {
    if (session) {
      router.replace('/homePage');
    }
  }, [session, router]);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Handle the form submission logic here
  //   console.log('Username:', username);
  //   console.log('Email:', email);
  // };

  return (
    <div className="container">
      <form /*onSubmit={handleSubmit}*/ className="login-form">
      <h1>Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <h2>Login with Google</h2>
        <button type="button" onClick={() => signIn("google")} className="google-button">
          <FcGoogle /> Login
        </button>
      </form>
    </div>
  );
}

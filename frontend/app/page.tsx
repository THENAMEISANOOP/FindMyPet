import { redirect } from 'next/navigation';

export default function Home() {
  // This automatically sends users to /dashboard
  redirect('/dashboard');
}
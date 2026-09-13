'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setTokens } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError('ユーザー名またはパスワードが正しくありません');
        return;
      }

      const data = await res.json();
      setTokens(data.access, data.refresh);
      router.push('/');
    } catch {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '24px',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Serotonic ログイン</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}
      >
        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            background: '#4338ca',
            color: '#fff',
            fontSize: '1rem',
          }}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
      </form>
    </main>
  );
}
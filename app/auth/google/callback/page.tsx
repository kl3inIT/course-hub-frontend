'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Lấy code từ URL params
      const code = searchParams.get('code');
      
      if (!code) {
        console.error('No code received from Google');
        router.push('/login?error=No code received from Google');
        return;
      }

      try {
        // Gửi code về backend để xử lý
        const response = await fetch('http://localhost:8080/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to authenticate with Google');
        }

        // Lưu thông tin user và token
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        // Chuyển hướng đến trang dashboard hoặc trang chủ
        router.push('/dashboard');

      } catch (error: any) {
        console.error('Google callback error:', error);
        router.push(`/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  // Hiển thị loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-center text-muted-foreground">
            Completing Google sign in...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
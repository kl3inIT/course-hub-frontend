'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

// Hàm giải mã JWT
function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const hasHandled = useRef(false); // Ngăn chạy lại

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const code = searchParams.get('code');
    const returnUrl = searchParams.get('state'); // Google OAuth state parameter contains returnUrl
    
    if (!code) {
      router.push('/login?error=No code received from Google');
      return;
    }

    const handleGoogleCallback = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/google/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to authenticate with Google');
        }

        const token = data.data.token;
        const decodedToken = parseJwt(token);

        const user = {
          id: decodedToken.jti,
          email: decodedToken.sub,
          name: decodedToken.name,
          avatar: decodedToken.avatar,
          role: decodedToken.scope.toLowerCase(),
          joinDate: new Date().toISOString(),
        };

        await login(user, token);

        // Điều hướng theo role hoặc returnUrl
        if (decodedToken.scope === "ADMIN") {
          window.location.href = "/admin";
        } else if (decodedToken.scope === "MANAGER") {
          window.location.href = "/manager";
        } else if (returnUrl) {
          // Nếu có returnUrl (từ state parameter), sử dụng nó
          window.location.href = decodeURIComponent(returnUrl);
        } else {
          window.location.href = "/";
        }
      } catch (error: any) {
        console.error('Google callback error:', error);
        window.location.href = `/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`;
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, login]);

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

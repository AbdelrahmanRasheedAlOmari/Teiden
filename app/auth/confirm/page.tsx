'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';

export default function ConfirmEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <MailCheck className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We've sent you a confirmation email. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-muted-foreground">
            <p>
              If you don't see the email, check your spam folder or make sure you entered the correct email address.
            </p>
            <p>
              The confirmation link will expire in 24 hours.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to login</Link>
            </Button>
            <div className="text-center text-sm">
              Need help?{' '}
              <Link href="/contact" className="font-medium text-primary hover:underline">
                Contact support
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 
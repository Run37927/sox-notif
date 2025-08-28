'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export default function TestEmailButton() {
    const [lastResult, setLastResult] = useState(null);
    const [email, setEmail] = useState('');

    const sendTestEmail = useMutation({
        mutationFn: async () => {
            if (!email || !email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }

            const response = await fetch('/api/send-one-time-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send email');
            }

            return response.json();
        },
        onSuccess: (data) => {
            setLastResult({
                success: true,
                message: `✅ Email sent to ${email}! Found ${data.gameCount} game(s) for today`,
                games: data.games || []
            });
            setEmail(''); // Clear email after successful send
        },
        onError: (error) => {
            setLastResult({
                success: false,
                message: `❌ Error: ${error.message}`
            });
        }
    });

    const handleSendEmail = () => {
        setLastResult(null);
        sendTestEmail.mutate();
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your email to get today's Red Sox game times
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                        disabled={sendTestEmail.isPending}
                    />
                </div>

                <button
                    onClick={handleSendEmail}
                    disabled={sendTestEmail.isPending || !email}
                    className={`
              w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200
              ${sendTestEmail.isPending || !email
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                        }
            `}
                >
                    {sendTestEmail.isPending ? (
                        <span className="flex items-center justify-center space-x-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            <span>Sending Email...</span>
                        </span>
                    ) : (
                        'Send Me Today\'s Game Times'
                    )}
                </button>
            </div>
        </div>
    );
}

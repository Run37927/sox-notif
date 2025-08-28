'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export default function TestEmailButton() {
    const [email, setEmail] = useState('');
    const [timezone, setTimezone] = useState('PST');

    const sendTestEmail = useMutation({
        mutationFn: async () => {
            if (!email || !email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }

            const response = await axios.post('/api/send-one-time-email', {
                email,
                timezone
            });
            return response.data;
        },
        onSuccess: (data) => {
            const gameText = data.gameCount === 0
                ? 'No games today'
                : `${data.gameCount} game${data.gameCount > 1 ? 's' : ''} today`;

            toast.success(`Email sent to ${email}!`, {
                description: gameText,
                duration: 4000,
            });

            setEmail(''); // Clear email after successful send
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to send email';
            toast.error('Failed to send email', {
                description: errorMessage,
                duration: 4000,
            });
        }
    });

    const handleSendEmail = () => {
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

                <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                        Choose your timezone
                    </label>
                    <select
                        id="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                        disabled={sendTestEmail.isPending}
                    >
                        <option value="PST">Pacific Time (PST/PDT)</option>
                        <option value="EST">Eastern Time (EST/EDT)</option>
                    </select>
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

'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export default function TestEmailButton() {
    const [lastResult, setLastResult] = useState(null);

    const sendTestEmail = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/test-today-real', {
                method: 'GET',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send test email');
            }

            return response.json();
        },
        onSuccess: (data) => {
            setLastResult({
                success: true,
                message: `✅ Email sent! Found ${data.gameCount} game(s) for today`,
                games: data.games || []
            });
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
            <button
                onClick={handleSendEmail}
                disabled={sendTestEmail.isPending}
                className={`
          w-full px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200
          ${sendTestEmail.isPending
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
                    'Get Today\'s Game Times'
                )}
            </button>

            {lastResult && (
                <div className={`
          p-4 rounded-lg border text-sm
          ${lastResult.success
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }
        `}>
                    <p className="font-medium">{lastResult.message}</p>

                    {lastResult.success && lastResult.games && lastResult.games.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {lastResult.games.map((game, index) => (
                                <div key={index} className="bg-white/50 p-2 rounded border">
                                    <p className="font-medium">
                                        Red Sox {game.location} {game.opponent}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        🕐 {game.time} • 📍 {game.venue}
                                    </p>
                                    {game.status !== 'Scheduled' && (
                                        <p className="text-xs font-medium text-red-600">
                                            Status: {game.status}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

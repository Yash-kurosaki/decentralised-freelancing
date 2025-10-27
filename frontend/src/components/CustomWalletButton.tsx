'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useRef, useEffect } from 'react';
import { Copy, Check, LogOut, RefreshCw } from 'lucide-react';

export function CustomWalletButton() {
    const { publicKey, disconnect, wallet } = useWallet();
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const copyAddress = async () => {
        if (publicKey) {
            try {
                await navigator.clipboard.writeText(publicKey.toBase58());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                console.log('Address copied!');
            } catch (err) {
                console.error('Failed to copy:', err);
                alert('Failed to copy address');
            }
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnect();
            setShowMenu(false);
            console.log('Disconnected!');
        } catch (err) {
            console.error('Failed to disconnect:', err);
        }
    };

    const handleChangeWallet = async () => {
        try {
            setShowMenu(false);
            await disconnect();

            // Wait a bit then trigger wallet selection
            setTimeout(() => {
                const walletButton = document.querySelector<HTMLButtonElement>('.wallet-adapter-button-trigger');
                if (walletButton) {
                    walletButton.click();
                }
            }, 200);
        } catch (err) {
            console.error('Failed to change wallet:', err);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // Don't close if clicking inside menu or the button itself
            if (
                menuRef.current &&
                !menuRef.current.contains(target) &&
                buttonRef.current &&
                !buttonRef.current.contains(target)
            ) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            // Add listener after a small delay to prevent immediate closing
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    if (!publicKey) {
        return <WalletMultiButton />;
    }

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
                className="bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-xl border border-gray-700 hover:border-gray-600 text-white px-4 py-2.5 rounded-lg transition-all flex items-center gap-3"
            >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-mono text-sm">
                    {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
            </button>

            {showMenu && (
                <>
                    {/* Backdrop - but don't close menu on click */}
                    <div className="fixed inset-0 z-[9998]" />

                    {/* Dropdown Menu */}
                    <div
                        ref={menuRef}
                        className="absolute right-0 mt-2 w-80 bg-gray-900 backdrop-blur-2xl border border-gray-700 rounded-xl shadow-2xl z-[9998] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Wallet Address Section */}
                        <div className="p-4 border-b border-gray-800 bg-gray-950">
                            <p className="text-gray-400 text-xs mb-2 font-semibold">Connected Wallet</p>
                            <div className="bg-black p-3 rounded-lg font-mono text-xs text-gray-300 break-all border border-gray-800">
                                {publicKey.toBase58()}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-2 bg-gray-900">

                            {/* Copy Address */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyAddress();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors text-left group"
                            >
                                {copied ? (
                                    <>
                                        <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                                            <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <span className="text-green-400 text-sm font-semibold block">Copied!</span>
                                            <span className="text-green-600 text-xs">Address in clipboard</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                                            <Copy className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
                                        </div>
                                        <div>
                                            <span className="text-gray-200 text-sm font-semibold block">Copy Address</span>
                                            <span className="text-gray-500 text-xs">Copy to clipboard</span>
                                        </div>
                                    </>
                                )}
                            </button>

                            {/* Change Wallet */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangeWallet();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors text-left group"
                            >
                                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                                    <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
                                </div>
                                <div>
                                    <span className="text-gray-200 text-sm font-semibold block">Change Wallet</span>
                                    <span className="text-gray-500 text-xs">Connect different wallet</span>
                                </div>
                            </button>

                            {/* Disconnect */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDisconnect();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900/20 rounded-lg transition-colors text-left group"
                            >
                                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-red-900/30 transition-colors">
                                    <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
                                </div>
                                <div>
                                    <span className="text-red-400 text-sm font-semibold block">Disconnect</span>
                                    <span className="text-red-600 text-xs">Sign out of wallet</span>
                                </div>
                            </button>
                        </div>

                        {/* Current Wallet Info */}
                        {wallet && (
                            <div className="p-4 border-t border-gray-800 bg-gray-950">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
                                        {wallet.adapter.icon && (
                                            <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-4 h-4" />
                                        )}
                                    </div>
                                    <span>Connected via {wallet.adapter.name}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
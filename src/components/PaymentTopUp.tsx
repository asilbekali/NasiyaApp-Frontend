import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query'; // Import useMutation
import { payWallet } from '../service/use-login'; // Import payWallet

const PaymentTopUp = ({ onBack, onPaymentSuccess }: { onBack: () => void; onPaymentSuccess: () => void }) => {
    const [amount, setAmount] = useState('100000');
    const [selectedMethod, setSelectedMethod] = useState('payme');

    const quickAmounts = ['20000', '40000', '60000'];

    // Base64 logos provided by user
    const paymeLogoBase64 = "data:image/png;base64,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";

    const clickLogoBase64 = "data:image/png;base64,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";

    const formatAmount = (value: string) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handleAmountChange = (value: string) => {
        const numericValue = value.replace(/\s/g, '');
        if (/^\d*$/.test(numericValue)) {
            setAmount(numericValue);
        }
    };

    const payMutation = useMutation({
        mutationFn: payWallet,
        onSuccess: () => {
            onPaymentSuccess(); // Notify parent to re-fetch data
            onBack(); // Go back to Home screen
        },
        onError: (error: any) => {
            console.error("Payment failed:", error);
            alert("To'lov amalga oshmadi: " + (error.response?.data?.message || error.message));
        },
    });

    const handleContinue = () => {
        const money = parseInt(amount.replace(/\s/g, ''), 10);
        if (money > 0) {
            payMutation.mutate(money);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800">Shaxsiy hisob</h1>
                    <div className="w-10"></div>
                </div>

                {/* Balance Display */}
                <div className="text-center py-8 px-4">
                    <div className="text-5xl font-light text-gray-800 mb-2">0.00</div>
                    <div className="text-gray-500 text-lg">so'm</div>
                </div>
            </div>

            {/* Content with proper spacing for bottom navigation */}
            <div className="p-4 space-y-6 pb-32"> {/* Increased padding-bottom */}
                {/* Payment Amount Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">To'lov miqdori</h2>

                    {/* Amount Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={formatAmount(amount)}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="w-full text-2xl font-semibold text-gray-800 bg-gray-50 rounded-xl p-4 border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="0"
                        />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        {quickAmounts.map((quickAmount) => (
                            <button
                                key={quickAmount}
                                onClick={() => setAmount(quickAmount)}
                                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors text-center"
                            >
                                <div className="text-sm font-semibold">{formatAmount(quickAmount)}</div>
                                <div className="text-xs text-gray-500">so'm</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payment Method Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Sizga qaysi biri qulay?</h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Payme Option */}
                        <button
                            onClick={() => setSelectedMethod('payme')}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${selectedMethod === 'payme'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-white p-2">
                                    <img
                                        src={paymeLogoBase64 || "/placeholder.svg"}
                                        alt="Payme"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="text-sm font-medium text-gray-700">Payme</div>
                            </div>
                            {selectedMethod === 'payme' && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}
                        </button>

                        {/* Click Option */}
                        <button
                            onClick={() => setSelectedMethod('click')}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${selectedMethod === 'click'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-white p-2">
                                    <img
                                        src={clickLogoBase64 || "/placeholder.svg"}
                                        alt="Click"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="text-sm font-medium text-gray-700">Click</div>
                            </div>
                            {selectedMethod === 'click' && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Continue Button - Inline instead of fixed */}
                <div className="pt-4">
                    <button
                        onClick={handleContinue}
                        disabled={!amount || amount === '0' || payMutation.isPending}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {payMutation.isPending ? 'Yuklanmoqda...' : 'Davom etish'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentTopUp;

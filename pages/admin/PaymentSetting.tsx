import {
  CheckCircle2,
  Copy,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  Key,
  Link2,
  Save,
  Settings,
  Wallet,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  icon: React.ReactNode;
}

interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
}

type PaymentGateway = 'xendit' | 'midtrans';

const PaymentSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Gateway Selection
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('xendit');

  // Xendit Configuration
  const [xenditSecretKey, setXenditSecretKey] = useState('');
  const [xenditWebhookUrl, setXenditWebhookUrl] = useState('');
  const [xenditWebhookSecret, setXenditWebhookSecret] = useState('');
  
  // Midtrans Configuration
  const [midtransMerchantId, setMidtransMerchantId] = useState('');
  const [midtransServerKey, setMidtransServerKey] = useState('');
  const [midtransClientKey, setMidtransClientKey] = useState('');
  const [midtransWebhookUrl, setMidtransWebhookUrl] = useState('');
  
  const [isTestMode, setIsTestMode] = useState(true);

  // Payment Methods - Xendit
  const [xenditPaymentMethods, setXenditPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      type: 'CARD',
      enabled: true,
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'e_wallet',
      name: 'E-Wallet (OVO, Dana, LinkAja, ShopeePay)',
      type: 'EWALLET',
      enabled: true,
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: 'virtual_account',
      name: 'Virtual Account (BCA, BNI, Mandiri, BRI)',
      type: 'VIRTUAL_ACCOUNT',
      enabled: true,
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: 'qris',
      name: 'QRIS',
      type: 'QRIS',
      enabled: false,
      icon: <CreditCard className="w-5 h-5" />,
    },
  ]);

  // Payment Methods - Midtrans
  const [midtransPaymentMethods, setMidtransPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'credit_card',
      name: 'Credit/Debit Card',
      type: 'CARD',
      enabled: true,
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'gopay',
      name: 'GoPay',
      type: 'EWALLET',
      enabled: true,
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: 'shopeepay',
      name: 'ShopeePay',
      type: 'EWALLET',
      enabled: true,
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer (Permata VA, BCA VA, BNI VA)',
      type: 'BANK_TRANSFER',
      enabled: true,
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: 'qris',
      name: 'QRIS',
      type: 'QRIS',
      enabled: false,
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'indomaret',
      name: 'Indomaret',
      type: 'CSTORE',
      enabled: false,
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      id: 'alfamart',
      name: 'Alfamart',
      type: 'CSTORE',
      enabled: false,
      icon: <DollarSign className="w-5 h-5" />,
    },
  ]);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/v1/admin/payment-settings', {
        withCredentials: true,
      });

      if (!response.data?.error && response.data.data) {
        const data = response.data.data;
        
        // 1. Map General Settings
        setSelectedGateway(data.selected_gateway || 'xendit');
        setIsTestMode(data.is_test_mode === 1 || data.is_test_mode === true);
        
        // 2. Map Xendit (Ambil langsung dari root 'data')
        setXenditSecretKey(data.xendit_secret_key || '');
        setXenditWebhookUrl(data.xendit_webhook_url || '');
        setXenditWebhookSecret(data.xendit_webhook_secret || '');
        if (data.xendit_payment_methods) {
          setXenditPaymentMethods(data.xendit_payment_methods);
        }
        
        // 3. Map Midtrans (Ambil langsung dari root 'data')
        setMidtransMerchantId(data.midtrans_merchant_id || ''); 
        setMidtransServerKey(data.midtrans_server_key || '');
        setMidtransClientKey(data.midtrans_client_key || '');
        setMidtransWebhookUrl(data.midtrans_webhook_url || '');
        if (data.midtrans_payment_methods) {
          setMidtransPaymentMethods(data.midtrans_payment_methods);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment settings:', error);
    } finally {
      setIsLoading(false);
    }
};

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const stripIcons = (methods: PaymentMethod[]) => 
        methods.map(({ icon, ...rest }) => rest);

      const payload = {
        selectedGateway,
        isTestMode,
        xendit: {
          secretKey: xenditSecretKey,
          webhookUrl: xenditWebhookUrl,
          webhookSecret: xenditWebhookSecret,
          paymentMethods: stripIcons(xenditPaymentMethods),
        },
        midtrans: {
          // Gunakan camelCase semua di sini agar rapi
          merchantId: midtransMerchantId,
          serverKey: midtransServerKey, 
          clientKey: midtransClientKey,
          webhookUrl: midtransWebhookUrl,
          paymentMethods: stripIcons(midtransPaymentMethods),
        },
      };

      console.log("Payload yang dikirim ke API:", payload);
      await axios.post('/api/v1/admin/payment-settings', payload, { withCredentials: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePaymentMethod = (methodId: string) => {
    if (selectedGateway === 'xendit') {
      setXenditPaymentMethods((prev) =>
        prev.map((method) =>
          method.id === methodId ? { ...method, enabled: !method.enabled } : method
        )
      );
    } else {
      setMidtransPaymentMethods((prev) =>
        prev.map((method) =>
          method.id === methodId ? { ...method, enabled: !method.enabled } : method
        )
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const testWebhook = async () => {
    try {
      const response = await axios.post(
        '/api/v1/admin/payment-settings/test-webhook',
        { gateway: selectedGateway },
        { withCredentials: true }
      );
      alert(response.data.message || 'Webhook test initiated!');
    } catch (error) {
      console.error('Webhook test failed:', error);
      alert('Webhook test failed. Please check your configuration.');
    }
  };

  // Get current gateway config
  const currentApiKey = selectedGateway === 'xendit' ? xenditSecretKey : midtransServerKey;
  const currentWebhookUrl = selectedGateway === 'xendit' ? xenditWebhookUrl : midtransWebhookUrl;
  const currentPaymentMethods = selectedGateway === 'xendit' ? xenditPaymentMethods : midtransPaymentMethods;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-7 h-7 mr-3 text-primary-600" />
            Payment Settings
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Configure payment gateway integration
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-green-600 text-sm font-semibold flex items-center bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Settings saved!
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Payment Gateway Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 text-lg mb-2">Select Payment Gateway</h3>
          <p className="text-sm text-gray-500">
            Choose your preferred payment gateway provider
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Xendit Option */}
          <button
            onClick={() => setSelectedGateway('xendit')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedGateway === 'xendit'
                ? 'border-primary-500 bg-primary-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  selectedGateway === 'xendit' ? 'bg-primary-500' : 'bg-gray-100'
                }`}>
                  <Zap className={`w-6 h-6 ${
                    selectedGateway === 'xendit' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-left">
                  <h4 className={`font-bold text-lg ${
                    selectedGateway === 'xendit' ? 'text-primary-700' : 'text-gray-900'
                  }`}>
                    Xendit
                  </h4>
                  <p className="text-xs text-gray-500">Full-stack payments</p>
                </div>
              </div>
              {selectedGateway === 'xendit' && (
                <CheckCircle2 className="w-6 h-6 text-primary-600" />
              )}
            </div>
            <div className="text-left text-sm text-gray-600">
              <ul className="space-y-1">
                <li>✓ Credit/Debit Cards</li>
                <li>✓ E-Wallets (OVO, Dana, LinkAja, ShopeePay)</li>
                <li>✓ Virtual Account</li>
                <li>✓ QRIS</li>
              </ul>
            </div>
          </button>

          {/* Midtrans Option */}
          <button
            onClick={() => setSelectedGateway('midtrans')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              selectedGateway === 'midtrans'
                ? 'border-primary-500 bg-primary-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  selectedGateway === 'midtrans' ? 'bg-primary-500' : 'bg-gray-100'
                }`}>
                  <CreditCard className={`w-6 h-6 ${
                    selectedGateway === 'midtrans' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-left">
                  <h4 className={`font-bold text-lg ${
                    selectedGateway === 'midtrans' ? 'text-primary-700' : 'text-gray-900'
                  }`}>
                    Midtrans
                  </h4>
                  <p className="text-xs text-gray-500">Leading payment gateway</p>
                </div>
              </div>
              {selectedGateway === 'midtrans' && (
                <CheckCircle2 className="w-6 h-6 text-primary-600" />
              )}
            </div>
            <div className="text-left text-sm text-gray-600">
              <ul className="space-y-1">
                <li>✓ Credit/Debit Cards</li>
                <li>✓ GoPay, ShopeePay</li>
                <li>✓ Bank Transfer (Permata, BCA, BNI)</li>
                <li>✓ QRIS, Indomaret, Alfamart</li>
              </ul>
            </div>
          </button>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>Selected:</strong> {selectedGateway === 'xendit' ? 'Xendit' : 'Midtrans'} - 
            Configure the settings below for your chosen gateway.
          </p>
        </div>
      </div>

      {/* Environment Mode */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Environment Mode</h3>
            <p className="text-sm text-gray-500">
              Switch between test and production environment
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`text-sm font-semibold ${isTestMode ? 'text-gray-400' : 'text-green-600'}`}
            >
              Production
            </span>
            <button
              onClick={() => setIsTestMode(!isTestMode)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isTestMode ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                  isTestMode ? 'translate-x-1' : 'translate-x-7'
                }`}
              />
            </button>
            <span
              className={`text-sm font-semibold ${isTestMode ? 'text-yellow-600' : 'text-gray-400'}`}
            >
              Test Mode
            </span>
          </div>
        </div>
        {isTestMode && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Test Mode Active:</strong> No real transactions will be processed. Use
              Xendit test credentials.
            </p>
          </div>
        )}
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <Key className="w-5 h-5 mr-2 text-primary-600" />
          <h3 className="font-bold text-gray-900 text-lg">
            {selectedGateway === 'xendit' ? 'Xendit' : 'Midtrans'} API Configuration
          </h3>
        </div>

        <div className="space-y-6">
          {selectedGateway === 'xendit' ? (
            // Xendit API Key
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Xendit Secret Key {isTestMode ? '(Test)' : '(Production)'}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={xenditSecretKey}
                  onChange={(e) => setXenditSecretKey(e.target.value)}
                  placeholder={`Enter your Xendit ${isTestMode ? 'test' : 'production'} secret key`}
                  className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {xenditSecretKey && (
                    <button
                      onClick={() => copyToClipboard(xenditSecretKey)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Get your secret key from{' '}
                <a
                  href="https://dashboard.xendit.co/settings/developers#api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Xendit Dashboard
                </a>
              </p>
            </div>
          ) : (
            // Midtrans API Keys
            <>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Midtrans Merchant ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={midtransMerchantId}
                  onChange={(e) => setMidtransMerchantId(e.target.value)}
                  placeholder="Contoh: G123456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your unique Merchant ID from Midtrans Dashboard
              </p>
            </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Midtrans Client Key {isTestMode ? '(Sandbox)' : '(Production)'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={midtransClientKey}
                    onChange={(e) => setMidtransClientKey(e.target.value)}
                    placeholder={`Enter your Midtrans ${isTestMode ? 'sandbox' : 'production'} client key`}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  />
                  {midtransClientKey && (
                    <button
                      onClick={() => copyToClipboard(midtransClientKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Client key is used for frontend integration. Get your keys from{' '}
                  <a
                    href="https://dashboard.midtrans.com/settings/access-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    Midtrans Dashboard
                  </a>
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Midtrans Server Key {isTestMode ? '(Sandbox)' : '(Production)'}
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={midtransServerKey}
                    onChange={(e) => setMidtransServerKey(e.target.value)}
                    placeholder={`Enter your Midtrans ${isTestMode ? 'sandbox' : 'production'} server key`}
                    className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    {midtransServerKey && (
                      <button
                        onClick={() => copyToClipboard(midtransServerKey)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Server key is used for backend API calls
                </p>
              </div>

            </>
          )}
        </div>
      </div>

      {/* Webhook Configuration */}
      {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <Link2 className="w-5 h-5 mr-2 text-primary-600" />
          <h3 className="font-bold text-gray-900 text-lg">Webhook Configuration</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Webhook URL</label>
            <div className="relative">
              <input
                type="text"
                value={selectedGateway === 'xendit' ? xenditWebhookUrl : midtransWebhookUrl}
                onChange={(e) => 
                  selectedGateway === 'xendit' 
                    ? setXenditWebhookUrl(e.target.value)
                    : setMidtransWebhookUrl(e.target.value)
                }
                placeholder={`https://yourdomain.com/api/webhooks/${selectedGateway}`}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {currentWebhookUrl && (
                <button
                  onClick={() => copyToClipboard(currentWebhookUrl)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This URL will receive payment status updates from {selectedGateway === 'xendit' ? 'Xendit' : 'Midtrans'}
            </p>
          </div>

          {selectedGateway === 'xendit' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Webhook Verification Token
              </label>
              <div className="relative">
                <input
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={xenditWebhookSecret}
                  onChange={(e) => setXenditWebhookSecret(e.target.value)}
                  placeholder="Enter webhook verification token"
                  className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showWebhookSecret ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  {xenditWebhookSecret && (
                    <button
                      onClick={() => copyToClipboard(xenditWebhookSecret)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Used to verify webhook requests are from Xendit
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Test Webhook Connection</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Send a test event to verify your webhook is working
                </p>
              </div>
              <button
                onClick={testWebhook}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
          <h3 className="font-bold text-gray-900 text-lg">
            Payment Methods - {selectedGateway === 'xendit' ? 'Xendit' : 'Midtrans'}
          </h3>
        </div>

        <div className="space-y-4">
          {currentPaymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                  {method.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Type: {method.type}</p>
                </div>
              </div>
              <button
                onClick={() => togglePaymentMethod(method.id)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  method.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                    method.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>Note:</strong> Make sure to enable these payment methods in your {selectedGateway === 'xendit' ? 'Xendit' : 'Midtrans'}
            {' '}dashboard as well.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;

interface SnapPayOptions {
  onSuccess?: (result: MidtransResult) => void;
  onPending?: (result: MidtransResult) => void;
  onError?: (result: MidtransResult) => void;
  onClose?: () => void;
}

interface MidtransResult {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  status_code?: string;
  status_message?: string;
}

interface Window {
  snap: {
    pay: (token: string, options: SnapPayOptions) => void;
  };
}
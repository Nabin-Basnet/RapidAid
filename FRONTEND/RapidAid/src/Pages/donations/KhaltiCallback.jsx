import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/Axios';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function KhaltiCallback() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifiedRef = useRef(false);
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const pidx = searchParams.get('pidx');

    if (pidx && !verifiedRef.current) {
      verifiedRef.current = true;

      axiosInstance.post('/donations/verify-khalti/', { pidx })
        .then((res) => {
          if (res.data.success) {
            setStatus('success');
            setTimeout(() => navigate('/donations'), 3000);
          } else {
            setStatus('error');
            setErrorMsg(res.data.detail || 'Verification failed.');
          }
        })
        .catch((err) => {
          setStatus('error');
          setErrorMsg(err.response?.data?.detail || err.message || 'Unknown error occurred.');
        })
        .finally(() => {
          searchParams.delete('pidx');
          searchParams.delete('transaction_id');
          searchParams.delete('tidx');
          searchParams.delete('amount');
          searchParams.delete('total_amount');
          searchParams.delete('mobile');
          searchParams.delete('status');
          searchParams.delete('purchase_order_id');
          searchParams.delete('purchase_order_name');
          setSearchParams(searchParams, { replace: true });
        });
    } else if (!pidx && !verifiedRef.current) {
      setStatus('error');
      setErrorMsg('No payment information (pidx) found in the URL.');
    }
  }, [searchParams, navigate, setSearchParams]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      {status === 'verifying' && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--brand)]" />
          <h2 className="text-xl font-semibold text-[var(--text)]">Verifying Khalti Payment...</h2>
          <p className="text-sm text-gray-500">Please do not close or refresh this page.</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold text-[var(--text)]">Payment Successful!</h2>
          <p className="text-gray-600">Thank you for your generous donation.</p>
          <p className="text-sm text-gray-500">Redirecting you to donations page...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <XCircle className="h-16 w-16 text-red-500" />
          <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
          <p className="max-w-md text-gray-600">{errorMsg}</p>
          <button 
            onClick={() => navigate('/donates')} 
            className="mt-4 rounded-xl bg-[var(--brand)] px-6 py-2 text-white hover:bg-[var(--brand-strong)]"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

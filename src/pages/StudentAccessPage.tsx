import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchForm, studentLoginWithOtpForForm, requestStudentOtp } from '../lib/formEngine';
import { isValidInstitutionalEmail } from '../lib/emailUtils';
import type { Form } from '../types/database';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { toast } from '../utils/toast';

export const StudentAccessPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [searchParams] = useSearchParams();
  const formIdParam = formId || searchParams.get('formId');
  const formIdNum = formIdParam ? Number(formIdParam) : 0;
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (formIdNum && Number.isFinite(formIdNum)) {
      fetchForm(formIdNum).then((f) => {
        setForm(f || null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [formIdNum]);

  const emailValid = isValidInstitutionalEmail(email);
  const canSendOtp = !!email.trim() && emailValid && !otpSent;
  const canVerifyOtp = !!email.trim() && otp.trim().length >= 6;

  const handleSendOtp = async () => {
    if (!email.trim() || !emailValid || !formIdNum || !Number.isFinite(formIdNum)) return;
    setSubmitting(true);
    const res = await requestStudentOtp(email.trim());
    setSubmitting(false);
    if (res.success) {
      setOtpSent(true);
      toast.success('OTP sent! Check your email. Valid for 10 minutes.');
    } else {
      toast.error(res.message || 'Failed to send OTP');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIdNum || !Number.isFinite(formIdNum) || !form) return;
    if (!email.trim() || !otp.trim()) {
      toast.error('Please enter your email and OTP.');
      return;
    }
    if (!emailValid) {
      toast.error('Only @student.slit.edu.au or @slit.edu.au emails can access forms.');
      return;
    }
    setSubmitting(true);
    const result = await studentLoginWithOtpForForm(formIdNum, email.trim(), otp.trim());
    setSubmitting(false);
    if (result.success && result.url) {
      const path = result.url.replace(window.location.origin, '');
      navigate(path);
    } else {
      toast.error(result.error || 'Login failed.');
    }
  };

  if (loading) {
    return <Loader fullPage variant="dots" size="lg" message="Loading..." />;
  }

  if (!formIdNum || !Number.isFinite(formIdNum) || !form) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <p className="text-red-600">Invalid or missing form. Please use the link shared by your admin.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <h1 className="text-xl font-bold text-[var(--text)] mb-2">Student Access</h1>
        <p className="text-sm text-gray-600 mb-2">{form.name}</p>
        <p className="text-xs text-gray-500 mb-6">
          Enter your email and request a one-time code to access your assessment form.
        </p>
        <div>
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (otpSent) setOtpSent(false);
            }}
            placeholder="firstname.lastname@student.slit.edu.au"
            autoComplete="email"
            required
            className={email.trim() && !emailValid ? 'border-amber-500' : ''}
          />
          {email.trim() && !emailValid && (
            <p className="mt-1.5 text-sm text-amber-600">Only @student.slit.edu.au or @slit.edu.au emails can access forms.</p>
          )}
        </div>
        {!otpSent ? (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">
              Request a one-time code sent to your email. Valid for 10 minutes.
            </p>
            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={submitting || !canSendOtp}
              className="w-full"
            >
              {submitting ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              label="6-digit OTP"
              value={otp}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, '');
                setOtp(next);
                if (next.length === 6 && !submitting && email.trim() && emailValid) {
                  // Auto-submit when 6 digits are entered
                  void (async () => {
                    if (!formIdNum || !Number.isFinite(formIdNum) || !form) return;
                    setSubmitting(true);
                    const result = await studentLoginWithOtpForForm(formIdNum, email.trim(), next);
                    setSubmitting(false);
                    if (result.success && result.url) {
                      const path = result.url.replace(window.location.origin, '');
                      navigate(path);
                    } else {
                      toast.error(result.error || 'Login failed.');
                    }
                  })();
                }
              }}
              placeholder="000000"
              autoComplete="one-time-code"
              className="text-center text-lg tracking-widest"
            />
            <Button type="submit" disabled={submitting || !canVerifyOtp} className="w-full">
              {submitting ? 'Verifying...' : 'Access Form'}
            </Button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(''); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Use a different email or resend OTP
            </button>
          </form>
        )}
      </Card>
    </div>
  );
};

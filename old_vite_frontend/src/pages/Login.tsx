import { FormEvent, useRef, useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole, Phone } from "lucide-react";
import { auth } from "../services/firebase";

export function Login() {
  const [phone, setPhone] = useState("+91");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const confirmation = useRef<ConfirmationResult | null>(null);
  const recaptcha = useRef<RecaptchaVerifier | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from || "/app";

  function setupRecaptcha() {
    if (!recaptcha.current) {
      recaptcha.current = new RecaptchaVerifier(auth, "waymate-recaptcha", { size: "invisible" });
    }
    return recaptcha.current;
  }

  async function sendOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      confirmation.current = await signInWithPhoneNumber(auth, phone.trim(), verifier);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to send OTP.");
      recaptcha.current?.clear();
      recaptcha.current = null;
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    if (!confirmation.current) return;
    setError("");
    setLoading(true);
    try {
      await confirmation.current.confirm(code.trim());
      navigate(returnTo, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-page">
    <div className="auth-card">
      <Link to="/" className="back-link"><ArrowLeft size={15}/> WayMate home</Link>
      <div className="auth-logo"><span className="brand-mark">W</span><b>WayMate</b></div>
      {!sent ? <>
        <div className="section-kicker">WELCOME BACK</div>
        <h1>Move together.</h1>
        <p>Sign in or create your WayMate account with your phone number.</p>
        <form onSubmit={sendOtp} className="auth-form">
          <label className="field"><span>Mobile number</span><div className="field-input"><Phone size={17}/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210" required/></div></label>
          <button className="btn primary wide" disabled={loading}>{loading?"Sending OTP...":"Continue with phone"}</button>
        </form>
      </> : <>
        <div className="section-kicker">VERIFY NUMBER</div>
        <h1>Enter your OTP.</h1>
        <p>We sent a verification code to <b>{phone}</b>.</p>
        <form onSubmit={verifyOtp} className="auth-form">
          <label className="field"><span>6-digit OTP</span><div className="field-input"><LockKeyhole size={17}/><input inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} required/></div></label>
          <button className="btn primary wide" disabled={loading}>{loading?"Verifying...":"Verify & continue"}</button>
          <button type="button" className="text-button" onClick={()=>{setSent(false);setCode("");}}>Use a different number</button>
        </form>
      </>}
      {error && <div className="notice error">{error}</div>}
      <div id="waymate-recaptcha"/>
      <small className="auth-note">By continuing, you agree to use WayMate responsibly and follow applicable travel and safety rules.</small>
    </div>
  </div>;
}

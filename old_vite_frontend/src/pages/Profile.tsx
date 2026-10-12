import { useEffect, useState } from "react";
import { Check, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../services/userApi";
import type { User } from "../types/domain";

export function Profile() {
  const { firebaseUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userApi.me().then((u) => {
      setProfile(u);
      setFirstName(u.profile?.firstName || "");
      setLastName(u.profile?.lastName || "");
    }).catch((e) => setMessage(e instanceof Error ? e.message : "Unable to load profile."));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await userApi.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      setProfile(updated);
      setMessage("Profile updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  const displayName = profile?.profile?.firstName || "WayMate member";

  return <div className="portal-page">
    <div className="page-heading"><div><div className="section-kicker">PROFILE</div><h1>Your WayMate account.</h1><p>Keep your identity details ready before you book or offer a ride.</p></div></div>
    <div className="profile-layout">
      <section className="profile-card">
        <div className="profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div className="profile-info"><h2>{displayName}</h2><p>{firebaseUser?.phoneNumber || firebaseUser?.email || "Authenticated account"}</p><div className="profile-badges"><span><Smartphone size={14}/> Phone authenticated</span><span><ShieldCheck size={14}/> Account secured</span>{profile?.profile?.verified && <span><Check size={14}/> Profile verified</span>}</div></div>
      </section>
      <form className="form-card" onSubmit={save}>
        <div className="section-kicker">PERSONAL DETAILS</div>
        <label className="field"><span>First name</span><div className="field-input"><UserRound size={16}/><input value={firstName} onChange={e => setFirstName(e.target.value)} required /></div></label>
        <label className="field"><span>Last name</span><input value={lastName} onChange={e => setLastName(e.target.value)} /></label>
        {message && <div className="notice">{message}</div>}
        <button className="btn primary" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
      </form>
    </div>
  </div>;
}

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  RecaptchaVerifier,
  setPersistence,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
  type User,
} from '@firebase/auth';
import { api, publicApi, queryString, type PopularRoute, type Profile, type Ride, type Vehicle } from './api';
import { firebaseConfigured, webAuth } from './firebase';
import { normalizePhoneNumber, phoneAuthErrorMessage } from './phoneAuth';
import waymateLogo from './assets/waymate-logo.jpg';

type Tab = 'find' | 'offer' | 'activity' | 'setup' | 'assistant';
type Role = 'RIDER' | 'DRIVER';
type SupportMessage = { role: 'user' | 'assistant'; content: string };

function friendlyError(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [codeSent, setCodeSent] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [tab, setTab] = useState<Tab>('find');
  const [showLanding, setShowLanding] = useState(true);
  const [initialRoute, setInitialRoute] = useState<{ origin: string; destination: string; date?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('waymate_role') as Role) || 'RIDER');
  const [roleSelected, setRoleSelected] = useState<boolean>(() => sessionStorage.getItem('waymate_role_selected') === 'true');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [bookingRide, setBookingRide] = useState<Ride | null>(null);

  const recaptcha = useRef<RecaptchaVerifier | null>(null);

  const resetRecaptcha = () => {
    if (recaptcha.current) {
      try {
        recaptcha.current.clear();
      } catch {
        // ignore
      }
      recaptcha.current = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container && container.parentNode) {
      const fresh = document.createElement('div');
      fresh.id = 'recaptcha-container';
      container.parentNode.replaceChild(fresh, container);
    }
  };

  useEffect(() => {
    if (!webAuth) {
      setAuthLoading(false);
      return;
    }
    return onAuthStateChanged(webAuth, nextUser => {
      if (nextUser) {
        resetRecaptcha();
      }
      setUser(nextUser);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => () => resetRecaptcha(), []);

  useEffect(() => {
    if (!confirmation) return;
    const update = () => setResendSeconds(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [confirmation, resendAt]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    api<Profile>(user, '/users/me')
      .then(nextProfile => {
        setProfile(nextProfile);
        // If first login and no name configured, prompt onboarding
        if (!nextProfile?.firstName && !localStorage.getItem('waymate_onboarded')) {
          setShowOnboarding(true);
        }
      })
      .catch(reason => setError(friendlyError(reason)));
  }, [user]);

  const requestSmsCode = async () => {
    setError('');
    if (!webAuth) return setError('Firebase web authentication is not configured.');
    const number = normalizePhoneNumber(phone);
    if (!number) return setError('Enter a valid phone number with its country code, for example +919876543210.');
    setAuthBusy(true);
    try {
      await setPersistence(webAuth, browserLocalPersistence);
      resetRecaptcha();
      const verifier = new RecaptchaVerifier(webAuth, 'recaptcha-container', { size: 'invisible' });
      recaptcha.current = verifier;
      const result = await signInWithPhoneNumber(webAuth, number, verifier);
      setConfirmation(result);
      setPhone(number);
      setCodeSent(true);
      setResendAt(Date.now() + 30_000);
    } catch (reason) {
      resetRecaptcha();
      setError(phoneAuthErrorMessage(reason));
    } finally {
      setAuthBusy(false);
    }
  };

  const sendCode = async (event: FormEvent) => {
    event.preventDefault();
    await requestSmsCode();
  };

  const resendCode = async () => {
    setConfirmation(null);
    await requestSmsCode();
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!confirmation || !/^\d{6}$/.test(otp)) return setError('Enter the six-digit code sent to your phone.');
    setAuthBusy(true);
    try {
      await confirmation.confirm(otp);
      setConfirmation(null);
      setOtp('');
      resetRecaptcha();
    } catch (reason) {
      setError(phoneAuthErrorMessage(reason));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSelectRole = (nextRole: Role) => {
    setRole(nextRole);
    localStorage.setItem('waymate_role', nextRole);
    sessionStorage.setItem('waymate_role_selected', 'true');
    setRoleSelected(true);
    setTab(nextRole === 'RIDER' ? 'find' : 'offer');
    setError('');
    if (!profile?.firstName && !localStorage.getItem('waymate_onboarded')) {
      setShowOnboarding(true);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('waymate_role_selected');
    setRoleSelected(false);
    setShowLanding(true);
    if (webAuth) void signOut(webAuth);
  };

  if (authLoading) return <main className="center"><div className="spinner" /><p>Connecting securely to WayMate…</p></main>;
  if (!user && showLanding) return <Landing onLogin={(nextTab, route) => {
    setTab(nextTab);
    setInitialRoute(route ?? null);
    setError('');
    setShowLanding(false);
  }} />;
  if (!firebaseConfigured || !webAuth) return <main className="center"><section className="card config-card"><button className="text-button" onClick={() => setShowLanding(true)}>← Back to WayMate</button><span className="eyebrow">WAYMATE WEB</span><h1>Firebase setup is required</h1><p>Copy <code>web/.env.example</code> to <code>web/.env.local</code> and fill in the Web app configuration from the same Firebase project as the Android app. Do not put service-account or OmniRoute secrets in this file.</p></section></main>;
  if (!user) return <main className="auth-layout"><section className="auth-card"><button className="text-button auth-back" onClick={() => { setError(''); setShowLanding(true); }}>← Back to WayMate</button><img className="auth-logo" src={waymateLogo} alt="WayMate" /><span className="eyebrow">SHARE THE JOURNEY</span><h1>Travel together with WayMate</h1><p className="muted">Sign in with your phone to find rides, share seats, and manage your trip. Your account is shared with the WayMate Android app.</p><div id="recaptcha-container" />
    {!codeSent ? <form onSubmit={sendCode}><label>Phone number<input autoComplete="tel" inputMode="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="+919876543210" /></label><button disabled={authBusy}>{authBusy ? 'Sending…' : 'Send verification code'}</button></form> : <form onSubmit={verifyCode}><p className="muted">Enter the code sent by Firebase to {phone}.</p><label>6-digit code<input autoComplete="one-time-code" inputMode="numeric" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, ''))} /></label><button disabled={authBusy}>{authBusy ? 'Verifying…' : 'Verify and continue'}</button><button className="button-secondary" type="button" disabled={authBusy || resendSeconds > 0} onClick={() => void resendCode()}>{resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code'}</button><button className="button-secondary" type="button" onClick={() => { resetRecaptcha(); setCodeSent(false); setConfirmation(null); setOtp(''); setResendSeconds(0); setError(''); }}>Change number</button></form>}
    {error && <p className="alert">{error}</p>}<p className="fineprint">Firebase sends an SMS with your verification code. Standard SMS rates may apply. Never share your code. For web sign-in, Firebase verifies this site's domain with reCAPTCHA.</p>
  </section></main>;

  return <div className="app-shell">
    {!roleSelected && (
      <RoleSelectionModal onSelectRole={handleSelectRole} />
    )}

    {showOnboarding && (
      <OnboardingModal
        user={user}
        profile={profile}
        currentRole={role}
        onComplete={(newRole, updatedProfile) => {
          setRole(newRole);
          setProfile(updatedProfile);
          setShowOnboarding(false);
          setTab(newRole === 'RIDER' ? 'find' : 'offer');
        }}
        onClose={profile?.firstName ? () => setShowOnboarding(false) : undefined}
        report={setError}
      />
    )}

    {bookingRide && (
      <BookingModal
        user={user}
        ride={bookingRide}
        onClose={() => setBookingRide(null)}
        onSuccess={msg => {
          setBookingRide(null);
          setError('');
          alert(msg);
          setTab('activity');
        }}
        report={setError}
      />
    )}

    <header className="topbar">
      <a className="brand" href="#" onClick={event => { event.preventDefault(); setTab(role === 'RIDER' ? 'find' : 'offer'); }}>
        <img src={waymateLogo} alt="WayMate" />
        <span>WayMate</span>
      </a>
      <div className="top-actions">
        <span className={`mode-pill ${role === 'DRIVER' ? 'driver' : ''}`}>
          {role === 'RIDER' ? '🎒 Rider Mode' : '🚗 Driver Mode'}
        </span>
        <button
          className="text-button"
          style={{ color: '#d7e7ed', padding: '6px 10px', fontSize: 13 }}
          onClick={() => setShowOnboarding(true)}
          title="Account Profile & Settings"
        >
          {profile?.firstName ? `Hi, ${profile.firstName}` : user.phoneNumber} ⚙️
        </button>
        <button className="button-secondary logout" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </header>

    <main className="main-content">
      <div className="welcome">
        <div>
          <span className="eyebrow">{role === 'RIDER' ? 'RIDER EXPERIENCE' : 'DRIVER PORTAL'}</span>
          <h1>{role === 'RIDER' ? 'Your journey, your way.' : 'Share empty seats. Offset fuel.'}</h1>
          <p>{role === 'RIDER' ? 'Search verified rides, book seats, and travel together safely.' : 'Publish your commute, accept passenger bookings, and connect with fellow travelers.'}</p>
        </div>
        <div className="cash-pill">Pay your driver directly in cash or UPI · no online checkout</div>
      </div>

      <nav className="tabs" aria-label="WayMate sections">
        {(role === 'RIDER'
          ? [['find', 'Find a ride'], ['activity', 'My bookings'], ['assistant', 'AI help']] as [Tab, string][]
          : [['offer', 'Offer a ride'], ['activity', 'My rides & requests'], ['setup', 'My vehicles'], ['assistant', 'AI help']] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? 'tab active' : 'tab'}
            onClick={() => { setError(''); setTab(value); }}
          >
            {label}
          </button>
        ))}
      </nav>

      {error && <div className="alert page-alert" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss">×</button></div>}

      {tab === 'find' && <FindRides user={user} report={setError} initialRoute={initialRoute} onSelectRide={setBookingRide} />}
      {tab === 'offer' && <OfferRide user={user} report={setError} onPublished={() => setTab('activity')} />}
      {tab === 'activity' && <Activity user={user} role={role} report={setError} />}
      {tab === 'setup' && <DriverSetup user={user} report={setError} />}
      {tab === 'assistant' && <Assistant user={user} report={setError} />}
    </main>
  </div>;
}

function RoleSelectionModal({
  onSelectRole,
}: {
  onSelectRole: (role: Role) => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="role-modal-title">
      <div className="role-modal-card">
        <span className="eyebrow" style={{ color: '#0d8a50', letterSpacing: '1px', fontWeight: 800 }}>
          WELCOME TO WAYMATE
        </span>
        <h2 id="role-modal-title" style={{ fontSize: 24, margin: '8px 0 6px', color: '#162b22' }}>
          Are you a Rider or a Driver?
        </h2>
        <p className="muted" style={{ margin: '0 0 24px', fontSize: 14 }}>
          Please choose how you want to travel to see your personalized dashboard.
        </p>

        <div className="role-selection-grid">
          <button
            type="button"
            className="role-selection-choice rider"
            onClick={() => onSelectRole('RIDER')}
          >
            <div className="role-choice-badge">🎒 RIDER EXPERIENCE</div>
            <div className="role-choice-icon">🧳</div>
            <h3>I am a Rider</h3>
            <p>
              Search available carpools, book empty seats in seconds, travel safely, and pay your driver directly with cash or UPI.
            </p>
            <div className="role-choice-btn">Continue as Rider →</div>
          </button>

          <button
            type="button"
            className="role-selection-choice driver"
            onClick={() => onSelectRole('DRIVER')}
          >
            <div className="role-choice-badge driver">🚗 DRIVER PORTAL</div>
            <div className="role-choice-icon">🚘</div>
            <h3>I am a Driver</h3>
            <p>
              Publish your commute, offer empty seats, offset fuel costs, register your vehicle, and accept passenger booking requests.
            </p>
            <div className="role-choice-btn driver">Continue as Driver →</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingModal({
  user,
  profile,
  currentRole,
  onComplete,
  onClose,
  report,
}: {
  user: User;
  profile: Profile | null;
  currentRole: Role;
  onComplete: (role: Role, updatedProfile: Profile) => void;
  onClose?: () => void;
  report: (msg: string) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(profile?.gender || 'MALE');
  const [city, setCity] = useState(profile?.city || 'Bengaluru');

  const [vehicleType, setVehicleType] = useState<'CAR' | 'BIKE'>('CAR');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [seatCapacity, setSeatCapacity] = useState(4);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return report('Please enter your first name.');
    setBusy(true);
    report('');
    try {
      const updated = await api<Profile>(user, '/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          gender,
          city: city.trim(),
        }),
      });

      if (selectedRole === 'DRIVER' && brand.trim() && model.trim() && regNumber.trim()) {
        await api(user, '/vehicles', {
          method: 'POST',
          body: JSON.stringify({
            type: vehicleType,
            brand: brand.trim(),
            model: model.trim(),
            registrationNumber: regNumber.trim().toUpperCase(),
            seatCapacity: Number(seatCapacity),
          }),
        }).catch(err => console.warn('Vehicle creation note:', err));
      }

      localStorage.setItem('waymate_role', selectedRole);
      localStorage.setItem('waymate_onboarded', 'true');
      onComplete(selectedRole, updated);
    } catch (err) {
      report(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="onboarding-card">
        <span className="eyebrow">WELCOME TO WAYMATE</span>
        <h2>How would you like to travel?</h2>
        <p className="muted">Choose your primary way to use WayMate. You can switch between Rider and Driver anytime.</p>

        <div className="role-choice-grid">
          <div
            className={`role-choice-card ${selectedRole === 'RIDER' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('RIDER')}
          >
            <span className="role-icon">🎒</span>
            <strong>I am a Rider</strong>
            <p>Find verified drivers, book seats, travel comfortably, and pay directly with cash or UPI.</p>
          </div>
          <div
            className={`role-choice-card ${selectedRole === 'DRIVER' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('DRIVER')}
          >
            <span className="role-icon">🚗</span>
            <strong>I am a Driver</strong>
            <p>Publish empty seats on your daily commute or intercity trips, share fuel costs, and meet verified co-travelers.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              First Name *
              <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Yeshwanth" />
            </label>
            <label>
              Last Name
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. R" />
            </label>
            <label>
              Email Address
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label>
              Gender (For Safety Matching) *
              <select value={gender} onChange={e => setGender(e.target.value as any)}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female (Enables Women Safety Rides)</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              City / Hometown
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bengaluru" />
            </label>
          </div>

          {selectedRole === 'DRIVER' && (
            <div className="vehicle-box">
              <h4>VEHICLE DETAILS FOR RIDE OFFERING</h4>
              <div className="form-grid">
                <label>
                  Vehicle Type
                  <select
                    value={vehicleType}
                    onChange={e => {
                      const t = e.target.value as 'CAR' | 'BIKE';
                      setVehicleType(t);
                      setSeatCapacity(t === 'BIKE' ? 1 : 4);
                    }}
                  >
                    <option value="CAR">Car</option>
                    <option value="BIKE">Bike / Scooter</option>
                  </select>
                </label>
                <label>
                  Brand / Make
                  <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Maruti, Tata, Hyundai" />
                </label>
                <label>
                  Model
                  <input value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. Swift, Nexon, i20" />
                </label>
                <label>
                  Registration Number
                  <input value={regNumber} onChange={e => setRegNumber(e.target.value.toUpperCase())} placeholder="e.g. KA-01-AB-1234" />
                </label>
                <label>
                  Passenger Seats
                  <input
                    type="number"
                    min="1"
                    max={vehicleType === 'BIKE' ? 1 : 7}
                    value={seatCapacity}
                    onChange={e => setSeatCapacity(Number(e.target.value))}
                  />
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button disabled={busy} style={{ flex: 1 }}>
              {busy ? 'Saving...' : `Continue as ${selectedRole === 'RIDER' ? 'Rider' : 'Driver'} →`}
            </button>
            {onClose && (
              <button type="button" className="button-secondary" onClick={onClose}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function BookingModal({
  user,
  ride,
  onClose,
  onSuccess,
  report,
}: {
  user: User;
  ride: Ride;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  report: (msg: string) => void;
}) {
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const maxSeats = Math.max(1, Math.min(ride.availableSeats, 4));
  const pricePerSeat = Number(ride.price) || 150;
  const total = seats * pricePerSeat;
  const origin = ride.from || ride.origin || 'Pickup point';
  const destination = ride.to || ride.destination || 'Destination';

  const handleBook = async () => {
    setBusy(true);
    report('');
    try {
      await api(user, `/rides/${ride.id}/request`, {
        method: 'POST',
        body: JSON.stringify({ seats: Number(seats) }),
      });
      onSuccess(`Booking request for ${seats} seat(s) submitted! The driver will review and confirm.`);
    } catch (err) {
      report(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="booking-card">
        <span className="eyebrow">CONFIRM RIDE BOOKING</span>
        <h3 style={{ margin: '8px 0 12px', fontSize: 22, color: '#062c45' }}>
          {origin} ➔ {destination}
        </h3>

        <div className="booking-summary-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span className="muted">Departure</span>
            <strong>{new Date(ride.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span className="muted">Driver</span>
            <strong>{ride.host?.firstName || ride.host?.profile?.fullName || 'Verified Driver'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span className="muted">Vehicle</span>
            <strong>{ride.vehicle?.brand || ride.vehicle?.make || 'Car'} {ride.vehicle?.model || ''}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 8px' }}>
            <span style={{ fontWeight: 700 }}>Select Seats</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="button-secondary small-button"
                disabled={seats <= 1}
                onClick={() => setSeats(s => Math.max(1, s - 1))}
              >
                −
              </button>
              <strong style={{ fontSize: 16, minWidth: 20, textAlign: 'center' }}>{seats}</strong>
              <button
                type="button"
                className="button-secondary small-button"
                disabled={seats >= maxSeats}
                onClick={() => setSeats(s => Math.min(maxSeats, s + 1))}
              >
                +
              </button>
            </div>
          </div>
          <div className="booking-summary-row">
            <span>Total to pay driver</span>
            <span>₹{total}</span>
          </div>
        </div>

        <p className="fineprint" style={{ margin: '12px 0 18px', color: '#647580' }}>
          Pay your driver directly in Cash or UPI when the trip starts. No advance payment required online.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button disabled={busy} onClick={handleBook} style={{ flex: 1 }}>
            {busy ? 'Requesting...' : 'Confirm Booking Request'}
          </button>
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function FindRides({
  user,
  report,
  initialRoute,
  onSelectRide,
}: {
  user: User;
  report: (message: string) => void;
  initialRoute: { origin: string; destination: string; date?: string } | null;
  onSelectRide: (ride: Ride) => void;
}) {
  const [origin, setOrigin] = useState(initialRoute?.origin ?? '');
  const [destination, setDestination] = useState(initialRoute?.destination ?? '');
  const [date, setDate] = useState(initialRoute?.date ?? '');
  const [womenOnly, setWomenOnly] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    report('');
    setBusy(true);
    try {
      const qs = queryString({
        from: origin.trim() || undefined,
        to: destination.trim() || undefined,
        date: date || undefined,
        seats: 1,
      });
      const results = await api<Ride[]>(user, `/rides/search?${qs}`);
      setRides(results || []);
    } catch (reason) {
      report(friendlyError(reason));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void search();
  }, []);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">RIDER MODE</span>
          <h2>Find your next ride</h2>
        </div>
        <span className="muted">Shared rides across your city and state</span>
      </div>

      <form className="search-grid" onSubmit={search}>
        <label>
          From
          <input
            maxLength={120}
            value={origin}
            onChange={event => setOrigin(event.target.value)}
            placeholder="City or pickup point"
          />
        </label>
        <label>
          To
          <input
            maxLength={120}
            value={destination}
            onChange={event => setDestination(event.target.value)}
            placeholder="Destination"
          />
        </label>
        <label>
          Departure date
          <input type="date" value={date} onChange={event => setDate(event.target.value)} />
        </label>
        <label className="check-field" style={{ gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={womenOnly} onChange={event => setWomenOnly(event.target.checked)} />
          <span>Women Safety rides only (Verified female drivers & passengers)</span>
        </label>
        <button disabled={busy} style={{ gridColumn: '1 / -1' }}>
          {busy ? 'Searching rides…' : 'Search available rides'}
        </button>
      </form>

      <RideCards
        rides={rides}
        action="Book a seat"
        onAction={onSelectRide}
        onClearSearch={origin || destination || date || womenOnly ? () => {
          setOrigin('');
          setDestination('');
          setDate('');
          setWomenOnly(false);
          void search();
        } : undefined}
      />
    </section>
  );
}

function RideCards({
  rides,
  action,
  onAction,
  onClearSearch,
}: {
  rides: Ride[];
  action?: string;
  onAction?: (ride: Ride) => void;
  onClearSearch?: () => void;
}) {
  const [expandedRide, setExpandedRide] = useState<string | number | null>(null);

  if (!rides.length) {
    return (
      <div className="empty" style={{ padding: '36px 20px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: '#172b22' }}>
          No rides found matching this route.
        </p>
        <p className="muted" style={{ margin: '0 0 16px', fontSize: 13 }}>
          Try clearing your filters or searching another date or city.
        </p>
        {onClearSearch && (
          <button type="button" className="button-secondary" onClick={onClearSearch}>
            Browse All Available Rides
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="ride-list">
      {rides.map(ride => {
        const from = ride.from || ride.origin || 'Start';
        const to = ride.to || ride.destination || 'End';
        const vehicle = ride.vehicle;
        const host = ride.host;
        const price = Number(ride.price) || 150;
        const available = ride.availableSeats ?? 1;

        return (
          <article className="ride-card" key={ride.id}>
            <div className="ride-route">
              <strong>{from}</strong>
              <span aria-hidden="true">→</span>
              <strong>{to}</strong>
            </div>

            <div className="ride-meta">
              <span>{new Date(ride.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              <span>{vehicle?.type ?? 'Car'}</span>
              <span>{available} seats left</span>
              {ride.womenOnly && <span className="badge-tag women">Women Safety</span>}
            </div>

            <div className="ride-footer">
              <span className="fare">
                ₹{price} <small>/ seat · pay driver directly</small>
              </span>
              <div className="ride-actions">
                <button
                  className="button-secondary small-button"
                  onClick={() => setExpandedRide(current => (current === ride.id ? null : ride.id))}
                >
                  {expandedRide === ride.id ? 'Hide' : 'Details'}
                </button>
                {action && onAction && (
                  <button
                    className="small-button"
                    disabled={available < 1}
                    onClick={() => onAction(ride)}
                  >
                    {action}
                  </button>
                )}
              </div>
            </div>

            <div className="muted small-copy">
              Driver: {host?.firstName || host?.profile?.fullName || 'Verified Member'} · {vehicle?.brand || vehicle?.make || 'Car'} {vehicle?.model || ''}
            </div>

            {expandedRide === ride.id && (
              <div className="ride-detail-panel" style={{ marginTop: 12, borderTop: '1px solid #e7ede9', paddingTop: 12 }}>
                <div>
                  <span>Driver</span>
                  <strong>{host?.firstName || host?.profile?.fullName || 'Verified Host'}</strong>
                  <small>{host?.rating ? `★ ${Number(host.rating).toFixed(1)} rating` : 'Verified Host'}</small>
                </div>
                <div>
                  <span>Vehicle</span>
                  <strong>{vehicle?.brand || vehicle?.make || 'Car'} {vehicle?.model || ''}</strong>
                  <small>{vehicle?.registrationNumber || 'Standard verified vehicle'}</small>
                </div>
                <div>
                  <span>Purpose</span>
                  <strong>{ride.purpose || 'Commute / Travel'}</strong>
                  <small>Pay ₹{price} directly via cash or UPI after ride starts</small>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function OfferRide({
  user,
  report,
  onPublished,
}: {
  user: User;
  report: (message: string) => void;
  onPublished: () => void;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState('150');
  const [purpose, setPurpose] = useState('COMMUTE');
  const [womenOnly, setWomenOnly] = useState(false);
  const [busy, setBusy] = useState(false);

  // Quick vehicle add
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vType, setVType] = useState<'CAR' | 'BIKE'>('CAR');
  const [vBrand, setVBrand] = useState('');
  const [vModel, setVModel] = useState('');
  const [vReg, setVReg] = useState('');

  const loadVehicles = async () => {
    try {
      const list = await api<Vehicle[]>(user, '/vehicles');
      setVehicles(list || []);
      if (list && list[0] && !vehicleId) {
        setVehicleId(String(list[0].id));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    void loadVehicles();
  }, [user]);

  const handleQuickAddVehicle = async (e: FormEvent) => {
    e.preventDefault();
    if (!vBrand.trim() || !vModel.trim() || !vReg.trim()) {
      return report('Fill all vehicle fields.');
    }
    setBusy(true);
    report('');
    try {
      const newV = await api<Vehicle>(user, '/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          type: vType,
          brand: vBrand.trim(),
          model: vModel.trim(),
          registrationNumber: vReg.trim().toUpperCase(),
          seatCapacity: vType === 'BIKE' ? 1 : 4,
        }),
      });
      await loadVehicles();
      setVehicleId(String(newV.id));
      setShowAddVehicle(false);
      report('Vehicle added successfully!');
    } catch (err) {
      report(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    report('');
    if (!vehicleId) {
      return report('Please select a vehicle or add your vehicle first.');
    }
    if (!origin.trim() || !destination.trim() || !departureTime) {
      return report('Please fill starting point, destination, and departure time.');
    }
    setBusy(true);
    try {
      await api(user, '/rides', {
        method: 'POST',
        body: JSON.stringify({
          vehicleId: Number(vehicleId),
          from: origin.trim(),
          to: destination.trim(),
          departureTime: new Date(departureTime).toISOString(),
          availableSeats: Number(seats),
          purpose,
          price: Number(price) || 150,
          womenOnly,
        }),
      });
      alert('Ride published successfully! Riders can now discover and request seats.');
      onPublished();
    } catch (reason) {
      report(friendlyError(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">DRIVER MODE</span>
          <h2>Share your ride & empty seats</h2>
        </div>
        <span className="badge-tag confirmed">Active Driver</span>
      </div>

      {vehicles.length === 0 && !showAddVehicle && (
        <div className="info-box" style={{ background: '#fff9ed', borderColor: '#e69500' }}>
          <strong>No registered vehicle found</strong>
          <p>You need to register your car or bike before offering a ride.</p>
          <button
            type="button"
            className="small-button"
            style={{ marginTop: 10 }}
            onClick={() => setShowAddVehicle(true)}
          >
            + Register vehicle now
          </button>
        </div>
      )}

      {showAddVehicle && (
        <form onSubmit={handleQuickAddVehicle} className="vehicle-box" style={{ marginBottom: 20 }}>
          <h4>ADD YOUR VEHICLE</h4>
          <div className="form-grid">
            <label>
              Vehicle Type
              <select value={vType} onChange={e => setVType(e.target.value as any)}>
                <option value="CAR">Car</option>
                <option value="BIKE">Bike</option>
              </select>
            </label>
            <label>
              Brand / Make
              <input required value={vBrand} onChange={e => setVBrand(e.target.value)} placeholder="e.g. Maruti, Tata" />
            </label>
            <label>
              Model
              <input required value={vModel} onChange={e => setVModel(e.target.value)} placeholder="e.g. Swift, Nexon" />
            </label>
            <label>
              Registration Number
              <input required value={vReg} onChange={e => setVReg(e.target.value.toUpperCase())} placeholder="e.g. KA-01-AB-1234" />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button disabled={busy} className="small-button">Save vehicle</button>
            <button type="button" className="button-secondary small-button" onClick={() => setShowAddVehicle(false)}>Cancel</button>
          </div>
        </form>
      )}

      <form className="form-grid" onSubmit={publish}>
        <label>
          From (Pickup Location) *
          <input required minLength={2} maxLength={120} value={origin} onChange={event => setOrigin(event.target.value)} placeholder="e.g. Koramangala / Electronic City" />
        </label>
        <label>
          To (Destination) *
          <input required minLength={2} maxLength={120} value={destination} onChange={event => setDestination(event.target.value)} placeholder="e.g. Whitefield / Airport / Mysore" />
        </label>
        <label>
          Departure Date & Time *
          <input required type="datetime-local" value={departureTime} onChange={event => setDepartureTime(event.target.value)} />
        </label>
        <label>
          Select Vehicle *
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              required
              value={vehicleId}
              onChange={event => setVehicleId(event.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Choose vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand || vehicle.make} {vehicle.model} ({vehicle.registrationNumber}) · {vehicle.type}
                </option>
              ))}
            </select>
            <button type="button" className="button-secondary" onClick={() => setShowAddVehicle(true)} title="Add another vehicle">+</button>
          </div>
        </label>
        <label>
          Available Passenger Seats *
          <input type="number" min="1" max="6" value={seats} onChange={event => setSeats(Number(event.target.value))} />
        </label>
        <label>
          Fare per Seat (₹) *
          <input required type="number" min="10" max="10000" value={price} onChange={event => setPrice(event.target.value)} />
        </label>
        <label>
          Trip Purpose
          <select value={purpose} onChange={e => setPurpose(e.target.value)}>
            <option value="COMMUTE">Daily Office Commute</option>
            <option value="INTERCITY">Intercity Travel</option>
            <option value="COLLEGE">College / University</option>
            <option value="AIRPORT">Airport Trip</option>
          </select>
        </label>
        <label className="check-field" style={{ gridColumn: '1 / -1', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={womenOnly} onChange={event => setWomenOnly(event.target.checked)} />
          <span>Offer as a Women Safety ride (Only female co-passengers allowed)</span>
        </label>
        <div className="form-actions">
          <button disabled={busy || vehicles.length === 0}>
            {busy ? 'Publishing ride…' : 'Publish ride now →'}
          </button>
        </div>
      </form>
    </section>
  );
}

function Activity({
  user,
  role,
  report,
}: {
  user: User;
  role: Role;
  report: (message: string) => void;
}) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [myRides, myBookings] = await Promise.all([
        api<Ride[]>(user, '/rides/my').catch(() => []),
        api<any[]>(user, '/bookings/my').catch(() => []),
      ]);
      setRides(myRides || []);
      setBookings(myBookings || []);
    } catch (reason) {
      report(friendlyError(reason));
    }
  };

  useEffect(() => {
    void load();
  }, [user]);

  const acceptRequest = async (requestId: number | string) => {
    report('');
    setBusy(true);
    try {
      await api(user, `/requests/${requestId}/accept`, { method: 'POST' });
      alert('Passenger booking request accepted! The seat is confirmed.');
      await load();
    } catch (reason) {
      report(friendlyError(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">{role === 'RIDER' ? 'RIDER ACTIVITY' : 'DRIVER ACTIVITY'}</span>
          <h2>{role === 'RIDER' ? 'My Bookings & Trips' : 'My Published Rides & Requests'}</h2>
        </div>
        <button className="button-secondary" disabled={busy} onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {role === 'RIDER' ? (
        <>
          <h3>Your Booked Rides</h3>
          {!bookings.length && (
            <div className="empty">You have no booked rides yet. Click &apos;Find a ride&apos; to search and book seats!</div>
          )}
          {bookings.map(item => {
            const ride = item.ride || {};
            const host = ride.host || {};
            const vehicle = ride.vehicle || {};
            const from = ride.from || ride.origin || 'Origin';
            const to = ride.to || ride.destination || 'Destination';

            return (
              <div className="activity-row" key={item.id} style={{ alignItems: 'flex-start' }}>
                <span style={{ gap: 6 }}>
                  <strong>{from} → {to}</strong>
                  <small>
                    Departure: {new Date(ride.departureTime || item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </small>
                  <small>
                    Driver: {host.firstName || host.profile?.fullName || 'Verified Driver'} · {vehicle.brand || vehicle.make || 'Car'} ({vehicle.registrationNumber || ''})
                  </small>
                  <small>Seats Booked: {item.seats || 1} · Status: <span className="badge-tag confirmed">{item.status || 'CONFIRMED'}</span></small>
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span className="fare" style={{ fontSize: 16 }}>Direct Payment to Driver</span>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <>
          <h3>Your Published Rides</h3>
          {!rides.length && (
            <div className="empty">You haven&apos;t published any rides yet. Click &apos;Offer a ride&apos; to post your route!</div>
          )}
          {rides.map(ride => {
            const from = ride.from || ride.origin || 'Start';
            const to = ride.to || ride.destination || 'End';
            const requests = ride.requests || [];
            const pendingRequests = requests.filter(r => r.status === 'PENDING');

            return (
              <div key={ride.id} style={{ borderBottom: '1px solid #e6ece9', paddingBottom: 16, marginBottom: 16 }}>
                <div className="activity-row" style={{ borderBottom: 'none', padding: '8px 0' }}>
                  <span>
                    <strong>{from} → {to}</strong>
                    <small>
                      {new Date(ride.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} · {ride.availableSeats} seats remaining · ₹{ride.price || 150} / seat
                    </small>
                  </span>
                  <span className="badge-tag confirmed">{ride.status || 'ACTIVE'}</span>
                </div>

                {pendingRequests.length > 0 && (
                  <div style={{ background: '#f5faf7', border: '1px solid #d4ebdd', borderRadius: 12, padding: 12, marginTop: 8 }}>
                    <strong style={{ fontSize: 13, color: '#0b7544' }}>Incoming Passenger Requests ({pendingRequests.length})</strong>
                    {pendingRequests.map(req => (
                      <div key={req.id} className="rider-request-item">
                        <span>
                          <strong>{req.rider?.firstName || req.rider?.profile?.fullName || 'Passenger'}</strong>
                          <small style={{ display: 'block', color: '#65747d' }}>Requested {req.seats} seat(s)</small>
                        </span>
                        <button
                          className="small-button"
                          disabled={busy}
                          onClick={() => acceptRequest(req.id)}
                        >
                          ✓ Accept Booking
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}

function DriverSetup({ user, report }: { user: User; report: (message: string) => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleType, setVehicleType] = useState<'CAR' | 'BIKE'>('CAR');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [seats, setSeats] = useState(4);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const list = await api<Vehicle[]>(user, '/vehicles');
      setVehicles(list || []);
    } catch (err) {
      report(friendlyError(err));
    }
  };

  useEffect(() => {
    void load();
  }, [user]);

  const createVehicle = async (event: FormEvent) => {
    event.preventDefault();
    report('');
    setBusy(true);
    try {
      await api(user, '/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          type: vehicleType,
          brand: brand.trim(),
          model: model.trim(),
          registrationNumber: registrationNumber.trim().toUpperCase(),
          seatCapacity: Number(seats),
        }),
      });
      setBrand('');
      setModel('');
      setRegistrationNumber('');
      await load();
      alert('Vehicle added successfully!');
    } catch (reason) {
      report(friendlyError(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">DRIVER PORTAL</span>
          <h2>My Registered Vehicles</h2>
        </div>
      </div>

      <form className="form-grid" onSubmit={createVehicle}>
        <label>
          Vehicle type
          <select
            value={vehicleType}
            onChange={event => {
              const value = event.target.value as typeof vehicleType;
              setVehicleType(value);
              setSeats(value === 'BIKE' ? 1 : 4);
            }}
          >
            <option value="CAR">Car</option>
            <option value="BIKE">Bike</option>
          </select>
        </label>
        <label>
          Brand / Make
          <input required minLength={2} value={brand} onChange={event => setBrand(event.target.value)} placeholder="e.g. Maruti, Tata, Hyundai" />
        </label>
        <label>
          Model
          <input required minLength={1} value={model} onChange={event => setModel(event.target.value)} placeholder="e.g. Swift, Nexon, City" />
        </label>
        <label>
          Registration number
          <input required minLength={3} maxLength={20} value={registrationNumber} onChange={event => setRegistrationNumber(event.target.value.toUpperCase())} placeholder="e.g. KA-01-AB-1234" />
        </label>
        <label>
          Passenger Seats
          <input required type="number" min={1} max={vehicleType === 'BIKE' ? 1 : 7} value={seats} onChange={event => setSeats(Number(event.target.value))} />
        </label>
        <div className="form-actions">
          <button disabled={busy}>{busy ? 'Saving…' : '+ Register new vehicle'}</button>
        </div>
      </form>

      <h3 style={{ marginTop: 28 }}>Your Vehicles</h3>
      {!vehicles.length && <p className="muted">No vehicles registered yet. Register your vehicle above to start offering rides.</p>}
      {vehicles.map(vehicle => (
        <article className="vehicle-setup" key={vehicle.id}>
          <div>
            <strong>{vehicle.brand || vehicle.make} {vehicle.model} · {vehicle.registrationNumber}</strong>
            <span className="badge-tag confirmed">Active</span>
          </div>
        </article>
      ))}
    </section>
  );
}

function Assistant({ user: _user, report }: { user?: User; report: (message: string) => void }) {
  const [messages, setMessages] = useState<SupportMessage[]>([
    { role: 'assistant', content: 'Hi! I can help you with finding rides, offering empty seats, direct cash/UPI payments, and ride safety questions.' },
  ]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);

  const send = (event: FormEvent) => {
    event.preventDefault();
    report('');
    const content = question.trim();
    if (!content || busy) return;
    const userMsg: SupportMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setBusy(true);

    setTimeout(() => {
      let replyText = 'WayMate lets you book seats with verified drivers or offer your empty seats. Payments are settled directly with your co-traveler via Cash or UPI.';
      if (content.toLowerCase().includes('pay') || content.toLowerCase().includes('money') || content.toLowerCase().includes('upi')) {
        replyText = 'Payments on WayMate are 100% direct! You pay your driver directly via Cash or UPI when the journey starts. There are no online payment processing fees.';
      } else if (content.toLowerCase().includes('safety') || content.toLowerCase().includes('women')) {
        replyText = 'WayMate features dedicated Women Safety Rides, allowing verified female drivers and female co-passengers to travel together safely with verified identity.';
      } else if (content.toLowerCase().includes('book') || content.toLowerCase().includes('ride')) {
        replyText = 'To book a ride, switch to Rider Mode, search your From and To locations, choose your seats, and click "Book a seat". The driver will confirm your request!';
      }
      setMessages(prev => [...prev, { role: 'assistant', content: replyText }]);
      setBusy(false);
    }, 600);
  };

  return (
    <section className="panel assistant-panel">
      <span className="eyebrow">WAYMATE HELP</span>
      <h2>Smart Travel Assistant</h2>
      <p className="muted">Ask anything about booking rides, offering empty seats, and travel guidelines.</p>
      <div className="messages">
        {messages.map((message, index) => (
          <p key={`${index}-${message.role}`} className={`message ${message.role}`}>
            {message.content}
          </p>
        ))}
        {busy && <p className="muted">WayMate Assistant is typing…</p>}
      </div>
      <form className="assistant-form" onSubmit={send}>
        <input
          maxLength={2000}
          value={question}
          onChange={event => setQuestion(event.target.value)}
          placeholder="Ask about rides, bookings, cash payments, or safety"
        />
        <button disabled={busy || !question.trim()}>{busy ? 'Sending…' : 'Send'}</button>
      </form>
    </section>
  );
}

function Landing({ onLogin }: { onLogin: (tab: Tab, route?: { origin: string; destination: string; date?: string }) => void }) {
  const [routes, setRoutes] = useState<PopularRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const slides = [
    { lead: 'The road is better', highlight: 'together.', detail: 'Find a seat. Share a journey. Make every kilometre count.' },
    { lead: 'Your route. Your', highlight: 'WayMate.', detail: 'Meet people already heading your way and travel as one.' },
    { lead: 'Less solo. More', highlight: 'journey.', detail: 'Turn the trip you planned into a ride you can share.' },
  ];

  useEffect(() => {
    let active = true;
    publicApi<PopularRoute[]>('/rides/popular')
      .then(items => { if (active) setRoutes(items); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (active) setRoutesLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setSlide(current => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    onLogin('find', { origin: origin.trim(), destination: destination.trim(), date: departureDate });
  };

  return <div className="landing">
    <header className="landing-nav">
      <a className="landing-brand" href="#home" aria-label="WayMate home"><img src={waymateLogo} alt="" /><span>WayMate</span></a>
      <nav className={menuOpen ? 'landing-links is-open' : 'landing-links'} aria-label="Main navigation">
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
        <a href="#popular-routes" onClick={() => setMenuOpen(false)}>Explore rides</a>
        <a href="#safety" onClick={() => setMenuOpen(false)}>Safety</a>
      </nav>
      <div className="landing-actions">
        <button className="nav-login" onClick={() => onLogin('find')}>Log in</button>
        <button className="nav-start" onClick={() => onLogin('find')}>Get started <span aria-hidden="true">↗</span></button>
      </div>
      <button className={menuOpen ? 'menu-toggle is-open' : 'menu-toggle'} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}><span /><span /></button>
    </header>

    <main>
      <section className="landing-hero" id="home">
        <video className="hero-video" autoPlay muted loop playsInline poster={waymateLogo} aria-hidden="true"><source src="/waymate-journey.mp4" type="video/mp4" /></video>
        <div className="hero-scrim" />
        <div className="hero-content">
          <div className="hero-kicker"><span className="hero-kicker-dot" /> THE WAY WE GO, TOGETHER</div>
          <h1>{slides[slide].lead}<br /><em>{slides[slide].highlight}</em></h1>
          <p>{slides[slide].detail}</p>
          <div className="hero-actions">
            <button className="hero-primary" onClick={() => onLogin('find')}>Find a ride <span aria-hidden="true">↗</span></button>
            <button className="hero-secondary" onClick={() => onLogin('offer')}>Offer a ride</button>
          </div>
        </div>
        <div className="hero-side-note"><span>01 — SHARED JOURNEYS</span><span>Made for the way you move.</span></div>
        <div className="hero-pagination" aria-label="Hero slides">{slides.map((item, index) => <button key={item.highlight} className={slide === index ? 'is-active' : ''} aria-label={`Show slide ${index + 1}`} aria-pressed={slide === index} onClick={() => setSlide(index)} />)}</div>
      </section>

      <section className="ride-search-dock" aria-label="Quick ride search">
        <form className="search-dock-form" onSubmit={submitSearch}>
          <div className="dock-field"><label htmlFor="dock-from">From</label><input id="dock-from" required maxLength={120} value={origin} onChange={event => setOrigin(event.target.value)} placeholder="City or pickup" /></div>
          <span className="dock-divider" aria-hidden="true" />
          <div className="dock-field"><label htmlFor="dock-to">To</label><input id="dock-to" required maxLength={120} value={destination} onChange={event => setDestination(event.target.value)} placeholder="Destination" /></div>
          <span className="dock-divider" aria-hidden="true" />
          <div className="dock-field"><label htmlFor="dock-date">Date</label><input id="dock-date" type="date" value={departureDate} onChange={event => setDepartureDate(event.target.value)} /></div>
          <button className="dock-submit" type="submit">Search rides</button>
        </form>
      </section>

      <section className="landing-routes" id="popular-routes">
        <div className="landing-routes-header">
          <span className="eyebrow">POPULAR CORRIDORS</span>
          <h2>Explore frequently traveled routes</h2>
        </div>
        {routesLoading ? (
          <p className="muted">Loading popular routes…</p>
        ) : (
          <div className="routes-cards-grid">
            {(routes.length > 0 ? routes : [
              { origin: 'Bengaluru', destination: 'Mysuru', route: 'Bengaluru → Mysuru', activeRides: 14, avgPrice: 350 },
              { origin: 'Mumbai', destination: 'Pune', route: 'Mumbai → Pune', activeRides: 22, avgPrice: 420 },
              { origin: 'Delhi', destination: 'Jaipur', route: 'Delhi → Jaipur', activeRides: 18, avgPrice: 550 },
              { origin: 'Chennai', destination: 'Puducherry', route: 'Chennai → Puducherry', activeRides: 9, avgPrice: 280 },
            ]).map(r => (
              <button
                key={r.route}
                type="button"
                className="route-card-btn"
                onClick={() => {
                  setOrigin(r.origin);
                  setDestination(r.destination);
                  onLogin('find', { origin: r.origin, destination: r.destination });
                }}
              >
                <strong>{r.route}</strong>
                <span>from ₹{r.avgPrice} · {r.activeRides} rides available</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="landing-trust">
        <span><b>Direct settlement</b> Pay your driver in cash or UPI</span>
        <span><b>Community verified</b> Phone and identity verification</span>
        <span><b>Women Safety</b> Dedicated female-only rides</span>
      </section>
    </main>

    <footer className="landing-footer">
      <div className="landing-brand"><img src={waymateLogo} alt="" /><span>WayMate</span></div>
      <p>© {new Date().getFullYear()} WayMate. Share the journey.</p>
    </footer>
  </div>;
}

export default App;

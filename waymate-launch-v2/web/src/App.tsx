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
import { api, publicApi, queryString, type FareEstimate, type PopularRoute, type Profile, type Ride, type Vehicle } from './api';
import { firebaseConfigured, webAuth } from './firebase';
import { normalizePhoneNumber, phoneAuthErrorMessage } from './phoneAuth';
import waymateLogo from './assets/waymate-logo.jpg';

type Tab = 'find' | 'offer' | 'activity' | 'setup' | 'assistant';
type SupportMessage = { role: 'user' | 'assistant'; content: string };
type WalletData = { due: number; transactions: { id: string; amount: number; type: string; status: string; reference: string; createdAt: string }[] };
type EarningsData = { thisWeek: { gross: number; commission: number; net: number; trips: number }; payouts: { id: string; amount: number; status: string; externalReference: string; createdAt: string }[] };
type KycData = { kycStatus: string; documents: { id: string; type: string; status: string; rejectionReason?: string | null }[] };
type TripData = { id: string; status: string; locations: { role: string; latitude: number; longitude: number; timestamp: string }[]; ride: { origin: string; destination: string } };

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
    api<Profile>(user, '/users/me').then(setProfile).catch(reason => setError(friendlyError(reason)));
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
    <header className="topbar"><a className="brand" href="#" onClick={event => { event.preventDefault(); setTab('find'); }}><img src={waymateLogo} alt="" /><span>WayMate</span></a><div className="top-actions"><span className="user-label">{profile?.firstName ? `Hi, ${profile.firstName}` : user.phoneNumber}</span><button className="button-secondary logout" onClick={() => { setShowLanding(true); if (webAuth) void signOut(webAuth); }}>Sign out</button></div></header>
    <main className="main-content">
      <div className="welcome"><div><span className="eyebrow">RIDE-SHARING, MADE HUMAN</span><h1>Your journey, your way.</h1><p>Find a seat, publish a ride, or get help from WayMate.</p></div><div className="cash-pill">Pay your driver directly · no online checkout</div></div>
      <nav className="tabs" aria-label="WayMate sections">
        {([['find', 'Find a ride'], ['offer', 'Offer a ride'], ['activity', 'My activity'], ['setup', 'Driver setup'], ['assistant', 'AI help']] as [Tab, string][]).map(([value, label]) => <button key={value} className={tab === value ? 'tab active' : 'tab'} onClick={() => { setError(''); setTab(value); }}>{label}</button>)}
      </nav>
      {error && <div className="alert page-alert" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss">×</button></div>}
      {tab === 'find' && <FindRides user={user} report={setError} initialRoute={initialRoute} />}
      {tab === 'offer' && <OfferRide user={user} report={setError} onPublished={() => setTab('activity')} />}
      {tab === 'activity' && <Activity user={user} report={setError} />}
      {tab === 'setup' && <DriverSetup user={user} report={setError} />}
      {tab === 'assistant' && <Assistant user={user} report={setError} />}
      <Profile user={user} profile={profile} onSaved={setProfile} report={setError} />
    </main>
  </div>;
}

function Landing({ onLogin }: { onLogin: (tab: Tab, route?: { origin: string; destination: string; date?: string }) => void }) {
  const [routes, setRoutes] = useState<PopularRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [routesError, setRoutesError] = useState('');
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
      .catch(reason => { if (active) setRoutesError(friendlyError(reason)); })
      .finally(() => { if (active) setRoutesLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setSlide(current => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [routes, routesLoading]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    onLogin('find', { origin: origin.trim(), destination: destination.trim(), date: departureDate });
  };

  return <div className="landing">
    <header className="landing-nav">
      <a className="landing-brand" href="#home" aria-label="WayMate home"><img src={waymateLogo} alt="" /><span>WayMate</span></a>
      <nav className={menuOpen ? 'landing-links is-open' : 'landing-links'} aria-label="Main navigation">
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#popular-routes" onClick={() => setMenuOpen(false)}>Explore rides</a><a href="#safety" onClick={() => setMenuOpen(false)}>Safety</a>
      </nav>
      <div className="landing-actions"><button className="nav-login" onClick={() => onLogin('find')}>Log in</button><button className="nav-start" onClick={() => onLogin('find')}>Get started <span aria-hidden="true">↗</span></button></div>
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
          <div className="hero-actions"><button className="hero-primary" onClick={() => onLogin('find')}>Find a ride <span aria-hidden="true">↗</span></button><button className="hero-secondary" onClick={() => onLogin('offer')}>Offer a ride</button></div>
        </div>
        <div className="hero-side-note"><span>01 — SHARED JOURNEYS</span><span>Made for the way you move.</span></div>
        <div className="hero-pagination" aria-label="Hero slides">{slides.map((item, index) => <button key={item.highlight} className={slide === index ? 'is-active' : ''} aria-label={`Show slide ${index + 1}`} aria-pressed={slide === index} onClick={() => setSlide(index)} />)}</div>
        <a className="hero-scroll" href="#how-it-works"><span>SCROLL TO EXPLORE</span><b aria-hidden="true">↓</b></a>
      </section>

      <form className="ride-search-dock" onSubmit={submitSearch} aria-label="Search for a ride">
        <div className="search-dock-title"><span className="eyebrow">LET'S GET YOU THERE</span><strong>Where are you headed?</strong></div>
        <label><span>FROM</span><input required maxLength={120} value={origin} onChange={event => setOrigin(event.target.value)} placeholder="Starting point" /></label>
        <span className="search-swap" aria-hidden="true">→</span>
        <label><span>TO</span><input required maxLength={120} value={destination} onChange={event => setDestination(event.target.value)} placeholder="Your destination" /></label>
        <label className="dock-date"><span>WHEN</span><input type="date" value={departureDate} onChange={event => setDepartureDate(event.target.value)} /></label>
        <button className="dock-submit" type="submit">Search rides <span aria-hidden="true">↗</span></button>
      </form>

      <section className="landing-trust" aria-label="WayMate ride-sharing principles">
        <span><b>01</b><strong>One account</strong><small>Website + Android app</small></span>
        <span><b>02</b><strong>Ride together</strong><small>Share the trip, split the fare</small></span>
        <span><b>03</b><strong>Safety first</strong><small>Driver and vehicle checks</small></span>
        <span><b>04</b><strong>Seat by seat</strong><small>Request only what you need</small></span>
      </section>

      <section className="landing-section route-section" id="popular-routes" data-reveal>
        <div className="section-heading"><div><span className="eyebrow">OUT THERE, RIGHT NOW</span><h2>Find your way<br />from here.</h2></div><p>Real routes shared by WayMate drivers. Pick a journey and see the open seats currently available.</p></div>
        {routesLoading ? <div className="route-state"><span className="spinner" /> Loading live WayMate routes…</div>
          : routesError ? <div className="route-state route-error">Live routes are unavailable right now. Sign in to search again once the service is back.</div>
            : routes.length ? <div className="popular-grid">{routes.slice(0, 6).map((route, index) => <button className="popular-route" key={`${route.origin}-${route.destination}`} onClick={() => onLogin('find', { origin: route.origin, destination: route.destination })}><span className="route-count">{String(index + 1).padStart(2, '0')}</span><span className="route-arrow" aria-hidden="true">↗</span><strong>{route.origin}</strong><span className="route-connector"><i /></span><strong>{route.destination}</strong><small><b>{route.activeRides}</b> open {route.activeRides === 1 ? 'ride' : 'rides'}{route.avgPrice ? ` · avg. ₹${Math.round(route.avgPrice)} / seat` : ''}</small></button>)}</div>
              : <div className="route-state">New routes will appear here as drivers publish rides. Create the first shared journey.</div>}
        <p className="fineprint">Routes and estimated fares are shared by drivers and can change. Requests are confirmed by the driver.</p>
        <button className="section-link" onClick={() => onLogin('find')}>Explore all rides <span aria-hidden="true">↗</span></button>
      </section>

      <section className="landing-section journey-section" id="how-it-works" data-reveal>
        <div className="section-heading"><div><span className="eyebrow">SAME ROAD, TWO WAYS TO RIDE</span><h2>There's a seat<br />with your name on it.</h2></div><p>One WayMate account. One shared ride network. Sign in on the website or Android app and pick up right where you left off.</p></div>
        <div className="journey-cards">
          <article className="journey-card rider-card"><div className="journey-card-top"><span>01 / RIDE ALONG</span><span className="journey-glyph">↘</span></div><div className="journey-illustration rider-illustration"><div className="route-line"><i /><i /><i /></div><span className="journey-pin pin-one">A</span><span className="journey-pin pin-two">B</span><div className="ride-ticket"><small>YOUR NEXT RIDE</small><strong>One way, together.</strong><span>Search · Request · Go</span></div></div><div className="journey-card-bottom"><div><h3>Going somewhere?</h3><p>Find a route, request your seat, and get the driver's confirmation before you go.</p></div><button aria-label="Find a ride" onClick={() => onLogin('find')}>↗</button></div></article>
          <article className="journey-card driver-card"><div className="journey-card-top"><span>02 / TAKE THE WHEEL</span><span className="journey-glyph">↗</span></div><div className="journey-illustration driver-illustration"><div className="driver-orbit orbit-a" /><div className="driver-orbit orbit-b" /><div className="driver-car"><span>W</span><i /><i /></div><div className="driver-verified"><b>✓</b> Ride ready</div><div className="driver-seat"><strong>+1</strong><small>seat to share</small></div></div><div className="journey-card-bottom"><div><h3>Already on the road?</h3><p>Complete identity and vehicle checks, then share a ride with people heading your way.</p></div><button aria-label="Offer a ride" onClick={() => onLogin('offer')}>↗</button></div></article>
        </div>
      </section>

      <section className="safety-banner" id="safety" data-reveal>
        <div className="safety-copy"><span className="eyebrow">CHECKED BY PEOPLE. ENFORCED BY THE PLATFORM.</span><h2>A little more trust<br />goes a long way.</h2><p>Identity and vehicle documents go through admin review. Ride eligibility and safety rules are checked by the shared WayMate backend—not just by the website.</p><button className="safety-link" onClick={() => onLogin('setup')}>See driver verification <span aria-hidden="true">↗</span></button></div>
        <div className="safety-stack"><div className="safety-card"><span className="safety-icon">✓</span><div><strong>Identity is reviewed</strong><small>Submitted documents are checked by the WayMate team.</small></div><span className="safety-index">01</span></div><div className="safety-card"><span className="safety-icon">⌑</span><div><strong>Vehicles are checked</strong><small>RC and current insurance must be approved before offering.</small></div><span className="safety-index">02</span></div><div className="safety-card"><span className="safety-icon">◎</span><div><strong>Trips stay connected</strong><small>Trip status and permitted location sharing follow the ride.</small></div><span className="safety-index">03</span></div></div>
      </section>

      <section className="landing-cta" data-reveal>
        <div><span className="eyebrow">YOUR NEXT JOURNEY STARTS HERE</span><h2>Take the scenic route.<br /><em>Take it together.</em></h2></div><button onClick={() => onLogin('find')}>Get started with WayMate <span aria-hidden="true">↗</span></button>
      </section>
    </main>
    <footer className="landing-footer">
      <div className="footer-top">
        <div className="footer-brand-block"><a className="landing-brand" href="#home"><img src={waymateLogo} alt="" /><span>WayMate</span></a><p>One shared ride network, on web and Android.</p></div>
        <button className="footer-cta" onClick={() => onLogin('offer')}>Share your ride <span aria-hidden="true">↗</span></button>
      </div>
      <div className="footer-bottom"><nav aria-label="Footer navigation"><a href="#how-it-works">How it works</a><a href="#popular-routes">Find a ride</a><a href="#safety">Safety</a></nav><span>© {new Date().getFullYear()} WayMate</span></div>
    </footer>
  </div>;
}

function FindRides({ user, report, initialRoute }: { user: User; report: (message: string) => void; initialRoute: { origin: string; destination: string; date?: string } | null }) {
  const [origin, setOrigin] = useState(initialRoute?.origin ?? '');
  const [destination, setDestination] = useState(initialRoute?.destination ?? '');
  const [date, setDate] = useState(initialRoute?.date ?? '');
  const [womenOnly, setWomenOnly] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [busy, setBusy] = useState(false);
  const search = async (event: FormEvent) => {
    event.preventDefault(); report(''); setBusy(true);
    try {
      const qs = queryString({ origin: origin.trim(), destination: destination.trim(), date, womenOnly });
      setRides(await api<Ride[]>(user, `/rides/search?${qs}`));
    } catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  const request = async (ride: Ride) => {
    report('');
    try {
      await api(user, `/rides/${encodeURIComponent(ride.id)}/request`, { method: 'POST', body: JSON.stringify({ seats: 1 }) });
      report('Ride request sent. The driver must accept it before your booking is confirmed.');
    } catch (reason) { report(friendlyError(reason)); }
  };
  return <section className="panel">
    <div className="panel-heading"><div><span className="eyebrow">RIDER</span><h2>Find your next ride</h2></div><span className="muted">Requests need driver approval.</span></div>
    <form className="search-grid" onSubmit={search}><label>From<input required maxLength={120} value={origin} onChange={event => setOrigin(event.target.value)} placeholder="City or pickup point" /></label><label>To<input required maxLength={120} value={destination} onChange={event => setDestination(event.target.value)} placeholder="Destination" /></label><label>Departure date<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label><label className="check-field"><input type="checkbox" checked={womenOnly} onChange={event => setWomenOnly(event.target.checked)} /> Women Safety rides</label><button disabled={busy}>{busy ? 'Searching…' : 'Search rides'}</button></form>
    <RideCards rides={rides} action="Request a seat" onAction={ride => void request(ride)} />
  </section>;
}

function RideCards({ rides, action, onAction }: { rides: Ride[]; action?: string; onAction?: (ride: Ride) => void }) {
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  if (!rides.length) return <div className="empty">Your matching rides will show here.</div>;
  return <div className="ride-list">{rides.map(ride => <article className="ride-card" key={ride.id}>
    <div className="ride-route"><strong>{ride.origin}</strong><span aria-hidden="true">→</span><strong>{ride.destination}</strong></div>
    <div className="ride-meta"><span>{new Date(ride.departureTime).toLocaleString()}</span><span>{ride.vehicle?.type ?? 'Ride'}</span><span>{ride.availableSeats} seats</span></div>
    {ride.womenOnly && <span className="status-good">Women Safety ride</span>}
    <div className="ride-footer"><span className="fare">₹{Number(ride.price).toFixed(0)} <small>/ seat · pay driver directly</small></span><div className="ride-actions"><button className="button-secondary small-button" onClick={() => setExpandedRide(current => current === ride.id ? null : ride.id)}>{expandedRide === ride.id ? 'Hide details' : 'Ride details'}</button>{action && onAction && <button className="small-button" disabled={ride.status !== 'OPEN' || ride.availableSeats < 1} onClick={() => onAction(ride)}>{action}</button>}</div></div>
    <div className="muted small-copy">Driver: {ride.host?.firstName || 'WayMate member'} · {ride.vehicle?.make || ride.vehicle?.type} {ride.vehicle?.model || ''}</div>
    {expandedRide === ride.id && <div className="ride-detail-panel"><div><span>Driver</span><strong>{ride.host?.firstName || 'WayMate member'}{ride.host?.verified ? ' · Verified' : ''}</strong><small>{ride.host?.rating ? `★ ${Number(ride.host.rating).toFixed(1)} · ${ride.host.ratingCount ?? 0} ratings` : 'New to WayMate'}</small></div><div><span>Vehicle</span><strong>{ride.vehicle?.make} {ride.vehicle?.model} · {ride.vehicle?.type}</strong><small>{ride.vehicle?.color || 'Vehicle details provided by driver'} · {ride.vehicle?.verified ? 'Documents verified' : 'Verification status pending'}</small></div><div><span>Journey</span><strong>{ride.distanceKm ? `${ride.distanceKm} km` : 'Route shared by driver'}{ride.estimatedDurationMinutes ? ` · about ${ride.estimatedDurationMinutes} min` : ''}</strong><small>{ride.womenOnly ? 'Women Safety ride' : 'Standard ride'} · request is subject to driver approval</small></div></div>}
  </article>)}</div>;
}

function OfferRide({ user, report, onPublished }: { user: User; report: (message: string) => void; onPublished: () => void }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [canOffer, setCanOffer] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [seats, setSeats] = useState(1);
  const [womenOnly, setWomenOnly] = useState(false);
  const [price, setPrice] = useState('');
  const [estimate, setEstimate] = useState<FareEstimate | null>(null);
  const [advice, setAdvice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([api<Vehicle[]>(user, '/vehicles'), api<{ canOffer: boolean }>(user, '/onboarding/status')])
      .then(([nextVehicles, onboarding]) => { setVehicles(nextVehicles); setCanOffer(onboarding.canOffer); if (nextVehicles[0]) setVehicleId(nextVehicles[0].id); })
      .catch(reason => report(friendlyError(reason)));
  }, [user, report]);
  const selected = vehicles.find(vehicle => vehicle.id === vehicleId);
  const getEstimate = async () => {
    report('');
    if (!selected || !distanceKm || !durationMinutes) return report('Choose a vehicle and enter distance and duration.');
    setBusy(true);
    try {
      const qs = queryString({ vehicleType: selected.type, distanceKm, durationMinutes });
      const result = await api<FareEstimate>(user, `/pricing/estimate?${qs}`);
      setEstimate(result);
      setPrice(String(result.suggested));
    } catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  const getAdvice = async () => {
    report(''); setBusy(true);
    try {
      const result = await api<{ answer: string }>(user, '/assistant/route-advice', {
        method: 'POST',
        body: JSON.stringify({ origin, destination, vehicleType: selected?.type ?? 'CAR', distanceKm: Number(distanceKm) || undefined, durationMinutes: Number(durationMinutes) || undefined, question: 'Give practical route planning tips and explain the fare guidance.' }),
      });
      setAdvice(result.answer);
    } catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  const publish = async (event: FormEvent) => {
    event.preventDefault(); report('');
    if (!canOffer) return report('Complete verified KYC, driving licence, RC, and insurance before publishing a ride.');
    if (!selected || !estimate || !departureTime) return report('Choose a vehicle, set a future departure time, and calculate fare guidance.');
    setBusy(true);
    try {
      await api(user, '/rides', { method: 'POST', body: JSON.stringify({ vehicleId, origin, destination, departureTime: new Date(departureTime).toISOString(), availableSeats: seats, distanceKm: Number(distanceKm), estimatedDurationMinutes: Number(durationMinutes), price: Number(price), womenOnly }) });
      onPublished();
    } catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  return <section className="panel">
    <div className="panel-heading"><div><span className="eyebrow">DRIVER</span><h2>Share your ride</h2></div><span className={canOffer ? 'status-good' : 'status-warn'}>{canOffer ? 'Driver verification complete' : 'Verification required'}</span></div>
    <form className="form-grid" onSubmit={publish}>
      <label>From<input required minLength={2} maxLength={120} value={origin} onChange={event => setOrigin(event.target.value)} placeholder="Starting point" /></label>
      <label>To<input required minLength={2} maxLength={120} value={destination} onChange={event => setDestination(event.target.value)} placeholder="Destination" /></label>
      <label>Departure<input required type="datetime-local" value={departureTime} onChange={event => setDepartureTime(event.target.value)} /></label>
      <label>Verified vehicle<select required value={vehicleId} onChange={event => setVehicleId(event.target.value)}><option value="">Select vehicle</option>{vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} · {vehicle.type} · {vehicle.verified ? 'verified' : 'pending'}</option>)}</select></label>
      <label>Route distance (km)<input required type="number" min="0.1" max="2000" step="0.1" value={distanceKm} onChange={event => { setDistanceKm(event.target.value); setEstimate(null); }} /></label>
      <label>Estimated duration (minutes)<input required type="number" min="1" max="1440" value={durationMinutes} onChange={event => { setDurationMinutes(event.target.value); setEstimate(null); }} /></label>
      <label>Passenger seats<input type="number" min="1" max={Math.max(1, (selected?.seats ?? 2) - 1)} value={seats} onChange={event => setSeats(Number(event.target.value))} /></label>
      <label>Fare per seat (₹)<input required type="number" min="1" max="100000" value={price} onChange={event => setPrice(event.target.value)} /></label>
      <label className="check-field"><input type="checkbox" checked={womenOnly} onChange={event => setWomenOnly(event.target.checked)} /><span>Offer as a Women Safety ride<small className="form-hint">The backend checks host and ride eligibility before publishing.</small></span></label>
      <div className="form-actions">
        <button type="button" className="button-secondary" disabled={busy} onClick={() => void getEstimate()}>Calculate fare guidance</button>
        <button type="button" className="button-secondary" disabled={busy || !origin || !destination} onClick={() => void getAdvice()}>Get AI route tips</button>
        <button disabled={busy || !canOffer}>{busy ? 'Working…' : 'Publish ride'}</button>
      </div>
    </form>
    {estimate && <div className="info-box"><strong>Suggested: ₹{estimate.suggested} per seat</strong><p>Recommended range ₹{estimate.minimum}–₹{estimate.maximum}. This is internal distance/time guidance, not a live navigation or competitor quote.</p></div>}
    {advice && <div className="info-box"><strong>AI route guidance</strong><p>{advice}</p><p className="fineprint">No live traffic or map routing is queried.</p></div>}
    <p className="fineprint">Riders pay you directly in cash or UPI after the trip. WayMate does not process online payments; a 12% platform commission is tracked separately.</p>
  </section>;
}

function Activity({ user, report }: { user: User; report: (message: string) => void }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [requests, setRequests] = useState<{ id: string; status: string; ride: Ride }[]>([]);
  const [bookings, setBookings] = useState<{ id: string; status: string; amount: number; cashPaymentStatus: string; ride: Ride }[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [remittanceAmount, setRemittanceAmount] = useState('');
  const [externalReference, setExternalReference] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      const [myRides, myRequests, myBookings, myWallet, myEarnings] = await Promise.all([
        api<Ride[]>(user, '/rides/my'),
        api<{ id: string; status: string; ride: Ride }[]>(user, '/requests/my'),
        api<{ id: string; status: string; amount: number; cashPaymentStatus: string; ride: Ride }[]>(user, '/bookings/my'),
        api<WalletData>(user, '/wallet'),
        api<EarningsData>(user, '/wallet/earnings'),
      ]);
      setRides(myRides); setRequests(myRequests); setBookings(myBookings); setWallet(myWallet); setEarnings(myEarnings);
    } catch (reason) { report(friendlyError(reason)); }
  };
  useEffect(() => { void load(); }, [user]);
  const decide = async (requestId: string, decision: 'accept' | 'reject') => {
    report(''); setBusy(true);
    try { await api(user, `/requests/${encodeURIComponent(requestId)}/${decision}`, { method: 'POST' }); await load(); }
    catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  const cancel = async (bookingId: string) => {
    report(''); setBusy(true);
    try { await api(user, `/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: 'POST' }); await load(); }
    catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  const pendingRemittances = earnings?.payouts.filter(item => item.status === 'PENDING').reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const availableToSubmit = Math.max(0, Number(wallet?.due ?? 0) - pendingRemittances);
  const submitRemittance = async (event: FormEvent) => {
    event.preventDefault(); report(''); setBusy(true);
    try {
      await api(user, '/wallet/commission-remittances', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(remittanceAmount), externalReference: externalReference.trim() }),
      });
      setRemittanceAmount(''); setExternalReference('');
      await load();
      report('Transfer reference submitted for admin review. WayMate did not move any money.');
    } catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  const confirmCash = async (bookingId: string) => {
    report(''); setBusy(true);
    try {
      await api(user, `/bookings/${encodeURIComponent(bookingId)}/cash-collected`, { method: 'POST' });
      await load();
      report('Direct payment confirmed. The backend recorded the platform commission.');
    } catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  return <section className="panel">
    <div className="panel-heading"><div><span className="eyebrow">YOUR WAYMATE</span><h2>My activity</h2></div><button className="button-secondary" disabled={busy} onClick={() => void load()}>Refresh</button></div>
    <h3>Driver requests</h3>
    {!rides.some(ride => ride.requests?.some(request => request.status === 'PENDING')) && <p className="muted">No pending requests for your rides.</p>}
    {rides.flatMap(ride => (ride.requests ?? []).filter(request => request.status === 'PENDING').map(request => <div className="activity-row" key={request.id}><span><strong>{ride.origin} → {ride.destination}</strong><small>{request.rider?.firstName || 'Rider'} · {request.seats} seat(s)</small></span><div><button className="small-button" disabled={busy} onClick={() => void decide(request.id, 'accept')}>Accept</button><button className="button-secondary small-button" disabled={busy} onClick={() => void decide(request.id, 'reject')}>Decline</button></div></div>))}
    <h3>My bookings</h3>
    {!bookings.length && <p className="muted">Your confirmed bookings will appear here.</p>}
    {bookings.map(booking => <div className="activity-row" key={booking.id}><span><strong>{booking.ride.origin} → {booking.ride.destination}</strong><small>{booking.status} · ₹{Number(booking.amount).toFixed(0)} · direct payment {booking.cashPaymentStatus.toLowerCase()}</small></span>{booking.status === 'CONFIRMED' && <button className="button-secondary small-button" disabled={busy} onClick={() => void cancel(booking.id)}>Cancel</button>}</div>)}
    {bookings.filter(booking => booking.status === 'CONFIRMED' && booking.ride.trip?.id).map(booking => <TripMonitor key={booking.ride.trip!.id} user={user} tripId={booking.ride.trip!.id} isHost={false} />)}
    <h3>My rides</h3><RideCards rides={rides} />
    {rides.filter(ride => ride.trip?.id).map(ride => <div className="host-trip" key={ride.trip!.id}>
      <TripMonitor user={user} tripId={ride.trip!.id} isHost />
      {ride.trip?.status === 'COMPLETED' && ride.bookings?.filter(booking => booking.status === 'CONFIRMED' && booking.cashPaymentStatus === 'DUE').map(booking => <div className="activity-row" key={booking.id}><span><strong>Confirm direct payment · {ride.origin} → {ride.destination}</strong><small>{booking.rider?.firstName || 'Rider'} · ₹{Number(booking.amount).toFixed(2)} · confirm only after payment was received</small></span><button className="small-button" disabled={busy} onClick={() => void confirmCash(booking.id)}>Confirm cash/UPI received</button></div>)}
    </div>)}
    <h3>Driver earnings and commission</h3>
    <div className="earnings-grid"><div><small>Gross fares this week</small><strong>₹{Number(earnings?.thisWeek.gross ?? 0).toFixed(2)}</strong></div><div><small>Driver share this week</small><strong>₹{Number(earnings?.thisWeek.net ?? 0).toFixed(2)}</strong></div><div><small>WayMate commission due</small><strong>₹{Number(wallet?.due ?? 0).toFixed(2)}</strong></div></div>
    <p className="fineprint">Riders pay you directly by cash or UPI. WayMate does not process rider payments or driver payouts; commission remittances are transfers you make separately and submit here for admin review.</p>
    {availableToSubmit > 0 && <form className="remittance-form" onSubmit={submitRemittance}>
      <strong>Record an external commission transfer</strong>
      <div className="form-grid">
        <label>Amount paid (up to ₹{availableToSubmit.toFixed(2)})<input required type="number" min="0.01" max={availableToSubmit} step="0.01" value={remittanceAmount} onChange={event => setRemittanceAmount(event.target.value)} /></label>
        <label>Transfer reference<input required minLength={4} maxLength={120} value={externalReference} onChange={event => setExternalReference(event.target.value)} placeholder="Reference from your payment provider" /></label>
        <div className="form-actions"><button disabled={busy}>{busy ? 'Submitting…' : 'Submit for review'}</button></div>
      </div>
    </form>}
    <h3>Commission and remittance history</h3>
    {!wallet?.transactions.length && !earnings?.payouts.length && <p className="muted">Your earnings and fee history will appear here after completed rides.</p>}
    {wallet?.transactions.filter(transaction => transaction.type === 'PLATFORM_COMMISSION').map(transaction => <div className="activity-row" key={transaction.id}><span><strong>Platform commission · {transaction.reference}</strong><small>{new Date(transaction.createdAt).toLocaleString()} · {transaction.status}</small></span><strong>−₹{Math.abs(transaction.amount).toFixed(2)}</strong></div>)}
    {earnings?.payouts.map(item => <div className="activity-row" key={item.id}><span><strong>Commission transfer · ₹{item.amount.toFixed(2)}</strong><small>{item.externalReference} · {item.status} · {new Date(item.createdAt).toLocaleString()}</small></span><span className={item.status === 'VERIFIED' ? 'status-good' : 'status-warn'}>{item.status}</span></div>)}
    <h3>My ride requests</h3>
    {!requests.length && <p className="muted">You have not requested a seat yet.</p>}
    {requests.map(request => <div className="activity-row" key={request.id}><span><strong>{request.ride.origin} → {request.ride.destination}</strong><small>Request {request.status.toLowerCase()}</small></span></div>)}
  </section>;
}

function TripMonitor({ user, tripId, isHost }: { user: User; tripId: string; isHost: boolean }) {
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const lastPublishedAt = useRef(0);

  const refresh = async () => {
    try {
      setTrip(await api<TripData>(user, `/trips/${encodeURIComponent(tripId)}`));
      setProblem('');
    } catch (reason) {
      setProblem(friendlyError(reason));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await api<TripData>(user, `/trips/${encodeURIComponent(tripId)}`);
        if (active) { setTrip(result); setProblem(''); }
      } catch (reason) {
        if (active) setProblem(friendlyError(reason));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const interval = trip?.status === 'IN_PROGRESS' ? 8_000 : trip?.status === 'SCHEDULED' ? 30_000 : 0;
    const timer = interval ? window.setInterval(() => void load(), interval) : undefined;
    return () => { active = false; if (timer) window.clearInterval(timer); };
  }, [user, tripId, trip?.status]);

  useEffect(() => {
    if (!isHost || trip?.status !== 'IN_PROGRESS') return;
    if (!navigator.geolocation) {
      setProblem('This browser does not support location sharing.');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(position => {
      if (Date.now() - lastPublishedAt.current < 10_000) return;
      lastPublishedAt.current = Date.now();
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const location = {
        latitude,
        longitude,
        ...(accuracy !== null ? { accuracy } : {}),
        ...(heading !== null ? { heading } : {}),
        ...(speed !== null ? { speed } : {}),
        timestamp: new Date(position.timestamp).toISOString(),
      };
      api(user, `/trips/${encodeURIComponent(tripId)}/location`, { method: 'POST', body: JSON.stringify(location) })
        .then(() => setProblem(''))
        .catch(reason => setProblem(`Could not share your location: ${friendlyError(reason)}`));
    }, reason => {
      setProblem(`Location sharing is unavailable: ${reason.message}`);
    }, { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isHost, trip?.status, tripId, user]);

  const updateTrip = async (action: 'start' | 'complete') => {
    setBusy(true); setProblem('');
    try {
      await api(user, `/trips/${encodeURIComponent(tripId)}/${action}`, { method: 'POST' });
      await refresh();
    } catch (reason) {
      setProblem(friendlyError(reason));
    } finally {
      setBusy(false);
    }
  };

  const hostLocation = trip?.locations.find(location => location.role === 'HOST');
  return <article className="trip-monitor">
    <div className="trip-monitor-heading"><div><span className="eyebrow">LIVE TRIP</span><strong>{trip?.ride.origin || 'Trip'} → {trip?.ride.destination || ''}</strong></div><span className={trip?.status === 'IN_PROGRESS' ? 'status-good' : 'status-warn'}>{loading ? 'Loading…' : trip?.status ?? 'Unavailable'}</span></div>
    {trip?.status === 'IN_PROGRESS' && <div className="trip-location">
      {hostLocation ? <><span>Latest driver location · {new Date(hostLocation.timestamp).toLocaleTimeString()}</span><a href={`https://www.google.com/maps?q=${hostLocation.latitude},${hostLocation.longitude}`} target="_blank" rel="noreferrer">Open map ↗</a></> : <span>Waiting for the driver to share a location…</span>}
      <small>Location refreshes automatically. The driver must allow location access in this browser.</small>
    </div>}
    {isHost && <div className="trip-controls">
      {trip?.status === 'SCHEDULED' && <button className="small-button" disabled={busy || loading} onClick={() => void updateTrip('start')}>{busy ? 'Starting…' : 'Start trip and share location'}</button>}
      {trip?.status === 'IN_PROGRESS' && <button className="button-secondary small-button" disabled={busy} onClick={() => void updateTrip('complete')}>{busy ? 'Completing…' : 'Complete trip'}</button>}
      <button className="button-secondary small-button" disabled={loading} onClick={() => void refresh()}>Refresh trip</button>
    </div>}
    {!isHost && <button className="button-secondary small-button" onClick={() => void refresh()}>{trip?.status === 'IN_PROGRESS' ? 'Refresh location' : 'Refresh trip'}</button>}
    {problem && <p className="trip-error" role="alert">{problem}</p>}
    {isHost && trip?.status === 'IN_PROGRESS' && <p className="fineprint">Browser location sharing requires your permission and a secure HTTPS website (localhost is allowed for development).</p>}
  </article>;
}

function Assistant({ user, report }: { user: User; report: (message: string) => void }) {
  const [messages, setMessages] = useState<SupportMessage[]>([{ role: 'assistant', content: 'Hi! I can help with WayMate bookings, KYC, trip safety, and direct-to-driver payment questions.' }]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async (event: FormEvent) => {
    event.preventDefault(); report('');
    const content = question.trim();
    if (!content || busy) return;
    const next = [...messages.slice(-9), { role: 'user' as const, content }];
    setMessages(next); setQuestion(''); setBusy(true);
    try {
      const result = await api<{ answer: string }>(user, '/assistant/support', { method: 'POST', body: JSON.stringify({ messages: next }) });
      const reply: SupportMessage = { role: 'assistant', content: result.answer };
      setMessages(current => [...current, reply].slice(-12));
    } catch (reason) {
      const reply: SupportMessage = { role: 'assistant', content: `The assistant is unavailable: ${friendlyError(reason)}` };
      setMessages(current => [...current, reply].slice(-12));
    } finally { setBusy(false); }
  };
  return <section className="panel assistant-panel">
    <span className="eyebrow">POWERED BY OMNIROUTE</span><h2>WayMate assistant</h2><p className="muted">AI support answers product questions. It cannot view your account, change a booking, or access live maps.</p>
    <div className="messages">{messages.map((message, index) => <p key={`${index}-${message.role}`} className={`message ${message.role}`}>{message.content}</p>)}{busy && <p className="muted">WayMate is replying…</p>}</div>
    <form className="assistant-form" onSubmit={send}><input maxLength={2000} value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ask about rides, bookings, KYC, or payments" /><button disabled={busy || !question.trim()}>{busy ? 'Sending…' : 'Send'}</button></form>
    <p className="fineprint">Never share OTPs, passwords, payment credentials, or document images in chat. For immediate danger, use SOS and contact local emergency services.</p>
  </section>;
}

function DriverSetup({ user, report }: { user: User; report: (message: string) => void }) {
  const [onboarding, setOnboarding] = useState<{ kycStatus: string; profileComplete: boolean; canOffer: boolean; identityVerified: boolean; selfieVerified: boolean } | null>(null);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleType, setVehicleType] = useState<'CAR' | 'BIKE'>('CAR');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [seats, setSeats] = useState(4);
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const [status, list, kycStatus] = await Promise.all([
      api<typeof onboarding>(user, '/onboarding/status'),
      api<Vehicle[]>(user, '/vehicles'),
      api<KycData>(user, '/kyc/me'),
    ]);
    setOnboarding(status);
    setVehicles(list);
    setKyc(kycStatus);
  };
  useEffect(() => { load().catch(reason => report(friendlyError(reason))); }, [user]);
  const upload = async (path: string, type: string) => {
    const file = files[type];
    if (!file) throw new Error(`Choose a file for ${type.replaceAll('_', ' ').toLowerCase()}.`);
    const form = new FormData();
    form.set('type', type);
    form.set('file', file);
    await api(user, path, { method: 'POST', body: form });
  };
  const submitKyc = async () => {
    report(''); setBusy(true);
    try {
      for (const type of ['IDENTITY', 'SELFIE', 'DRIVING_LICENSE']) {
        if (files[type]) await upload('/kyc/documents', type);
      }
      await api(user, '/kyc/submit', { method: 'POST' });
      await load();
      report('KYC documents submitted for admin review.');
    } catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  const createVehicle = async (event: FormEvent) => {
    event.preventDefault(); report(''); setBusy(true);
    try {
      await api(user, '/vehicles', {
        method: 'POST',
        body: JSON.stringify({ type: vehicleType, make, model, registrationNumber, seats, insuranceExpiry: new Date(`${insuranceExpiry}T23:59:59`).toISOString() }),
      });
      setMake(''); setModel(''); setRegistrationNumber(''); setInsuranceExpiry('');
      await load();
      report('Vehicle saved. Upload its RC and insurance below for review.');
    } catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  const uploadVehicleDoc = async (vehicle: Vehicle, type: 'RC' | 'INSURANCE') => {
    report(''); setBusy(true);
    try {
      await upload(`/vehicles/${encodeURIComponent(vehicle.id)}/documents`, type);
      await load();
      report(`${type} document submitted for review.`);
    } catch (reason) { report(friendlyError(reason)); }
    finally { setBusy(false); }
  };
  return <section className="panel">
    <div className="panel-heading"><div><span className="eyebrow">DRIVER ONBOARDING</span><h2>Verification and vehicles</h2></div><span className={onboarding?.canOffer ? 'status-good' : 'status-warn'}>{onboarding?.canOffer ? 'Ready to offer rides' : `KYC: ${onboarding?.kycStatus ?? 'loading'}`}</span></div>
    <p className="muted">Upload identity and selfie documents for KYC, then add a vehicle with its registration certificate and insurance. Admins review each document before ride offers are enabled.</p>
    {!onboarding?.profileComplete && <div className="info-box"><strong>Complete your profile before submitting KYC.</strong><p><a href="#account-profile">Add your name and gender in your profile</a>; KYC cannot be submitted until those details are saved.</p></div>}
    <h3>Personal KYC</h3>
    <div className="form-grid">{[['IDENTITY','Government identity document'],['SELFIE','Selfie verification'],['DRIVING_LICENSE','Driving licence']].map(([type,label]) => <label key={type}>{label}<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={event => setFiles(current => ({ ...current, [type]: event.target.files?.[0] ?? null }))} /></label>)}</div>
    <button disabled={busy} onClick={() => void submitKyc()}>{busy ? 'Submitting…' : 'Upload selected documents and submit KYC'}</button>
    <div className="document-status-list">{['IDENTITY', 'SELFIE', 'DRIVING_LICENSE'].map(type => {
      const document = kyc?.documents.find(item => item.type === type);
      return <div className="document-status" key={type}><span><strong>{type.replaceAll('_', ' ')}</strong>{document?.rejectionReason && <small>{document.rejectionReason}</small>}</span><span className={document?.status === 'VERIFIED' ? 'status-good' : 'status-warn'}>{document?.status ?? 'Not uploaded'}</span></div>;
    })}</div>
    <h3>Add a vehicle</h3>
    <form className="form-grid" onSubmit={createVehicle}>
      <label>Vehicle type<select value={vehicleType} onChange={event => { const value = event.target.value as typeof vehicleType; setVehicleType(value); setSeats(value === 'BIKE' ? 2 : 4); }}><option value="CAR">Car</option><option value="BIKE">Bike</option></select></label>
      <label>Make<input required minLength={2} value={make} onChange={event => setMake(event.target.value)} /></label>
      <label>Model<input required minLength={1} value={model} onChange={event => setModel(event.target.value)} /></label>
      <label>Registration number<input required minLength={3} maxLength={20} value={registrationNumber} onChange={event => setRegistrationNumber(event.target.value.toUpperCase())} /></label>
      <label>Seats including driver<input required type="number" min={2} max={vehicleType === 'BIKE' ? 2 : 7} value={seats} onChange={event => setSeats(Number(event.target.value))} /></label>
      <label>Insurance valid until<input required type="date" value={insuranceExpiry} onChange={event => setInsuranceExpiry(event.target.value)} /></label>
      <div className="form-actions"><button disabled={busy}>{busy ? 'Saving…' : 'Add vehicle'}</button></div>
    </form>
    <h3>Your vehicles</h3>
    {!vehicles.length && <p className="muted">No vehicles yet. Complete KYC review before adding one.</p>}
    {vehicles.map(vehicle => <article className="vehicle-setup" key={vehicle.id}>
      <div><strong>{vehicle.make} {vehicle.model} · {vehicle.registrationNumber}</strong><span className={vehicle.verified ? 'status-good' : 'status-warn'}>{vehicle.verified ? 'Verified' : 'Review pending'}</span></div>
      <div className="document-status-list vehicle-doc-status">{(['RC', 'INSURANCE'] as const).map(type => {
        const document = vehicle.documents?.find(item => item.type === type);
        return <div className="document-status" key={type}><span><strong>{type === 'RC' ? 'Registration certificate' : 'Insurance'}</strong>{document?.rejectionReason && <small>{document.rejectionReason}</small>}</span><span className={document?.status === 'VERIFIED' ? 'status-good' : 'status-warn'}>{document?.status ?? 'Not uploaded'}</span></div>;
      })}</div>
      <div className="form-grid doc-upload"><label>Registration certificate<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={event => setFiles(current => ({ ...current, RC: event.target.files?.[0] ?? null }))} /></label><label>Insurance document<input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={event => setFiles(current => ({ ...current, INSURANCE: event.target.files?.[0] ?? null }))} /></label></div>
      <div className="form-actions"><button className="button-secondary" disabled={busy} onClick={() => void uploadVehicleDoc(vehicle, 'RC')}>Submit RC</button><button className="button-secondary" disabled={busy} onClick={() => void uploadVehicleDoc(vehicle, 'INSURANCE')}>Submit insurance</button></div>
    </article>)}
    <p className="fineprint">Only upload your own documents through this secure form. WayMate review may take time; approval is not automatic.</p>
  </section>;
}

function Profile({ user, profile, onSaved, report }: { user: User; profile: Profile | null; onSaved: (profile: Profile) => void; report: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('OTHER');
  useEffect(() => { setFirstName(profile?.firstName || ''); setLastName(profile?.lastName || ''); if (profile?.gender) setGender(profile.gender); }, [profile]);
  const save = async (event: FormEvent) => {
    event.preventDefault(); report('');
    try {
      const saved = await api<Profile>(user, '/users/me', { method: 'PUT', body: JSON.stringify({ firstName, lastName, gender }) });
      onSaved(saved); setOpen(false);
    } catch (reason) { report(friendlyError(reason)); }
  };
  return <section className="profile-strip" id="account-profile">
    <button className="text-button" onClick={() => setOpen(value => !value)}>{open ? 'Close profile' : 'Complete or edit your profile'}</button>
    {profile?.kycStatus && <span className="muted">KYC: {profile.kycStatus}</span>}
    {open && <form className="profile-form" onSubmit={save}><label>First name<input required minLength={2} maxLength={60} value={firstName} onChange={event => setFirstName(event.target.value)} /></label><label>Last name<input required minLength={1} maxLength={60} value={lastName} onChange={event => setLastName(event.target.value)} /></label><label>Gender<select value={gender} onChange={event => setGender(event.target.value as typeof gender)}><option value="FEMALE">Female</option><option value="MALE">Male</option><option value="OTHER">Other</option></select></label><button>Save profile</button></form>}
  </section>;
}

export default App;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, Search, Car, Leaf, Shield, CheckCircle, 
  Clock, MapPin, Calendar, Star, Users, Navigation, 
  Map, PhoneCall, AlertCircle, Building2, UserCheck, CheckCircle2, ChevronRight 
} from "lucide-react";
import "../styles/landing-new.css";

export function Landing() {
  const navigate = useNavigate();
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/app/find");
  };

  return (
    <div className="wm-page">
      {/* Navbar */}
      <header className="wm-navbar">
        <div className="wm-nav-container">
          <Link to="/" className="wm-brand">
            <div className="wm-logo-icon">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 20 L40 80 L50 60 L60 80 L80 20" stroke="url(#paint0_linear)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="50" cy="50" r="8" fill="white"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#002140" />
                    <stop offset="1" stopColor="#00a86b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="wm-brand-text">
              <b>waymate</b>
              <span>Your route. Better together.</span>
            </div>
          </Link>

          <nav className="wm-nav-links">
            <Link to="/app/find">Find a Ride</Link>
            <Link to="/app/offer">Offer a Ride</Link>
            <a href="#how">How It Works</a>
            <a href="#safety">Safety</a>
            <a href="#companies">For Companies</a>
          </nav>

          <div className="wm-nav-actions">
            <Link to="/login" className="wm-btn-text">Login</Link>
            <Link to="/login" className="wm-btn-primary">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="wm-hero">
        <div className="wm-hero-container">
          <div className="wm-hero-content">
            <div className="wm-badge-green">
              <Leaf size={14} /> Bengaluru's Trusted Carpool Network
            </div>
            <h1 className="wm-hero-title">
              Your route.<br/>
              Someone's <span className="wm-text-green">already<br/>going your way.</span>
            </h1>
            <p className="wm-hero-subtitle">
              Share your daily commute with verified people, save money, reduce traffic and make Bengaluru a greener city.
            </p>
            <div className="wm-hero-buttons">
              <Link to="/app/find" className="wm-btn-primary wm-btn-lg">
                <Search size={18} /> Find a Ride
              </Link>
              <Link to="/app/offer" className="wm-btn-outline wm-btn-lg">
                <Car size={18} /> Offer a Ride
              </Link>
            </div>
            
            <div className="wm-hero-features">
              <span><span className="wm-feat-icon"><IndianRupeeIcon/></span> Lower Commute Cost</span>
              <span><span className="wm-feat-icon"><Navigation size={12}/></span> Less Traffic</span>
              <span><span className="wm-feat-icon"><Leaf size={12}/></span> Cleaner Environment</span>
              <span><span className="wm-feat-icon"><Users size={12}/></span> Stronger Community</span>
            </div>
            
            <div className="wm-handwritten">
              Same Routes<br/>Brighter Journeys
            </div>
          </div>
          
          <div className="wm-hero-visual">
            <div className="wm-map-graphic">
              {/* Abstract map representation */}
              <div className="wm-map-bg"></div>
              
              <div className="wm-live-badge">
                <span className="wm-pulse"></span> Live rides on WayMate
              </div>
              
              {/* Map pins and cards */}
              <div className="wm-map-card" style={{top: '15%', right: '10%'}}>
                <div className="wm-mc-avatar">R</div>
                <div><b>Rahul is heading to Whitefield</b><span>3 seats available • 8:30 AM</span></div>
              </div>
              
              <div className="wm-map-card" style={{top: '60%', right: '5%'}}>
                <div className="wm-mc-avatar green">P</div>
                <div><b>Priya's ride</b><span>HSR → Bellandur<br/>2 seats available • 9:15 AM</span></div>
              </div>

              <div className="wm-map-pin" style={{top: '30%', left: '40%'}}><span>Manyata Tech Park</span></div>
              <div className="wm-map-pin red" style={{top: '25%', right: '25%'}}><span>Whitefield<br/><small>42 rides</small></span></div>
              <div className="wm-map-pin" style={{top: '75%', right: '35%'}}><span>Electronic City<br/><small>31 rides</small></span></div>
              <div className="wm-map-pin red" style={{top: '65%', left: '70%'}}><span>HSR Layout<br/><small>26 rides</small></span></div>
              
              <div className="wm-map-green-badge">
                <Leaf size={16} /> Together for a Greener Bengaluru
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Search Bar */}
      <section className="wm-search-section">
        <div className="wm-search-container">
          <form className="wm-search-bar" onSubmit={handleSearch}>
            <div className="wm-search-field">
              <MapPin size={20} className="wm-icon-green" />
              <div>
                <label>From</label>
                <input type="text" placeholder="HSR Layout, Bengaluru" value={searchFrom} onChange={e=>setSearchFrom(e.target.value)} />
              </div>
            </div>
            
            <div className="wm-search-swap">
              <ArrowRight size={16} />
            </div>
            
            <div className="wm-search-field">
              <MapPin size={20} className="wm-icon-green" />
              <div>
                <label>To</label>
                <input type="text" placeholder="Whitefield, Bengaluru" value={searchTo} onChange={e=>setSearchTo(e.target.value)} />
              </div>
            </div>
            
            <div className="wm-search-divider"></div>
            
            <div className="wm-search-field">
              <Calendar size={20} className="wm-icon-gray" />
              <div>
                <label>Date</label>
                <input type="text" defaultValue="Thu, 18 Sep 2025" />
              </div>
            </div>
            
            <div className="wm-search-divider"></div>
            
            <div className="wm-search-field">
              <Clock size={20} className="wm-icon-gray" />
              <div>
                <label>Time</label>
                <input type="text" defaultValue="8:00 AM - 10:00 AM" />
              </div>
            </div>
            
            <button type="submit" className="wm-btn-primary wm-btn-search">
              Find Rides <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="wm-recent-searches">
            <span>Recent searches:</span>
            <a href="#">HSR → Whitefield</a>
            <a href="#">Koramangala → Electronic City</a>
            <a href="#">Indiranagar → Manyata</a>
            <a href="#">BTM → Hebbal</a>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="wm-section">
        <div className="wm-container">
          <div className="wm-section-header">
            <div>
              <h2>Popular Routes in Bengaluru</h2>
              <p>Most searched routes by our community</p>
            </div>
            <a href="#" className="wm-link-blue">View all routes <ArrowRight size={16} /></a>
          </div>
          
          <div className="wm-routes-grid">
            <div className="wm-route-card">
              <div className="wm-rc-icon"><Car size={24} /></div>
              <div className="wm-rc-content">
                <h3>HSR Layout <ArrowRight size={14}/> Whitefield</h3>
                <div className="wm-rc-stats">
                  <span><Clock size={12}/> 45 - 60 mins</span>
                  <span><Car size={12}/> 28 active rides</span>
                </div>
                <div className="wm-rc-users">
                  <div className="wm-avatars">
                    <span className="av1"></span><span className="av2"></span><span className="av3"></span>
                  </div>
                  <span className="wm-plus-users">+12</span>
                  <ChevronRight size={16} className="wm-ml-auto" />
                </div>
              </div>
            </div>
            
            <div className="wm-route-card">
              <div className="wm-rc-icon orange"><Car size={24} /></div>
              <div className="wm-rc-content">
                <h3>Electronic City <ArrowRight size={14}/> ORR</h3>
                <div className="wm-rc-stats">
                  <span><Clock size={12}/> 40 - 55 mins</span>
                  <span><Car size={12}/> 21 active rides</span>
                </div>
                <div className="wm-rc-users">
                  <div className="wm-avatars">
                    <span className="av4"></span><span className="av5"></span><span className="av6"></span>
                  </div>
                  <span className="wm-plus-users">+9</span>
                  <ChevronRight size={16} className="wm-ml-auto" />
                </div>
              </div>
            </div>
            
            <div className="wm-route-card">
              <div className="wm-rc-icon green"><Car size={24} /></div>
              <div className="wm-rc-content">
                <h3>Koramangala <ArrowRight size={14}/> Manyata</h3>
                <div className="wm-rc-stats">
                  <span><Clock size={12}/> 50 - 70 mins</span>
                  <span><Car size={12}/> 18 active rides</span>
                </div>
                <div className="wm-rc-users">
                  <div className="wm-avatars">
                    <span className="av1"></span><span className="av4"></span><span className="av3"></span>
                  </div>
                  <span className="wm-plus-users">+9</span>
                  <ChevronRight size={16} className="wm-ml-auto" />
                </div>
              </div>
            </div>
            
            <div className="wm-route-card">
              <div className="wm-rc-icon purple"><Car size={24} /></div>
              <div className="wm-rc-content">
                <h3>Indiranagar <ArrowRight size={14}/> Whitefield</h3>
                <div className="wm-rc-stats">
                  <span><Clock size={12}/> 35 - 50 mins</span>
                  <span><Car size={12}/> 16 active rides</span>
                </div>
                <div className="wm-rc-users">
                  <div className="wm-avatars">
                    <span className="av2"></span><span className="av5"></span><span className="av6"></span>
                  </div>
                  <span className="wm-plus-users">+6</span>
                  <ChevronRight size={16} className="wm-ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="wm-section wm-bg-gray">
        <div className="wm-container">
          <div className="wm-hw-header">
            <div>
              <h2>How WayMate Works</h2>
              <p>Get started in minutes. A better commute is just a few steps away.</p>
            </div>
            <div className="wm-handwritten green">
              Different People<br/>Same Direction<br/>A Better Tomorrow
              <Leaf className="wm-hw-leaf" />
            </div>
          </div>
          
          <div className="wm-steps-grid">
            <div className="wm-step">
              <div className="wm-step-num">1</div>
              <div className="wm-step-icon"><Search size={32} /></div>
              <h3>Find a ride</h3>
              <p>Enter your route, date and time.</p>
            </div>
            <div className="wm-step">
              <div className="wm-step-num">2</div>
              <div className="wm-step-icon"><Users size={32} /></div>
              <h3>Choose a verified match</h3>
              <p>View profiles, ratings and route details.</p>
            </div>
            <div className="wm-step">
              <div className="wm-step-num">3</div>
              <div className="wm-step-icon"><CheckCircle2 size={32} /></div>
              <h3>Book your seat</h3>
              <p>Send a request and get confirmed.</p>
            </div>
            <div className="wm-step">
              <div className="wm-step-num">4</div>
              <div className="wm-step-icon"><Car size={32} /></div>
              <h3>Travel together</h3>
              <p>Enjoy a safer, cheaper and greener commute.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="wm-section">
        <div className="wm-container">
          <h2>Your Safety Matters</h2>
          <p className="wm-sub">A secure and trusted community, always.</p>
          
          <div className="wm-safety-layout">
            <div className="wm-safety-grid">
              <div className="wm-safety-item">
                <UserCheck size={32} className="wm-text-green" />
                <h4>Verified Identity</h4>
                <p>Work email / ID verification</p>
              </div>
              <div className="wm-safety-item">
                <Car size={32} className="wm-text-green" />
                <h4>Verified Vehicle</h4>
                <p>RC verification</p>
              </div>
              <div className="wm-safety-item">
                <Star size={32} className="wm-text-green" />
                <h4>Ratings & Reviews</h4>
                <p>Real feedback from commuters</p>
              </div>
              <div className="wm-safety-item">
                <MapPin size={32} className="wm-text-green" />
                <h4>Trip Sharing</h4>
                <p>Share live location with family</p>
              </div>
              <div className="wm-safety-item">
                <AlertCircle size={32} className="wm-text-red" />
                <h4>24/7 Support</h4>
                <p>In-app help & emergency assistance</p>
              </div>
            </div>
            
            <div className="wm-safety-image">
              <div className="wm-si-card">
                <CheckCircle2 size={24} className="wm-text-green" />
                <b>Travel safe.<br/>Travel Smart.</b>
              </div>
              <div className="wm-si-bg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Banners */}
      <section className="wm-section wm-pt-0">
        <div className="wm-container wm-banners-grid">
          <div className="wm-banner-card driver-banner">
            <div className="wm-banner-content">
              <h2>Already driving?<br/>Share your empty seats.</h2>
              <p>Turn your regular commute into savings. Help others and make an impact.</p>
              <Link to="/app/offer" className="wm-btn-primary">Offer a Ride <ArrowRight size={16}/></Link>
            </div>
            <div className="wm-handwritten banner-hw">
              Same route<br/>More good company
            </div>
            <div className="wm-banner-illustration driver-ill"></div>
          </div>
          
          <div className="wm-banner-card company-banner">
            <div className="wm-banner-content">
              <div className="wm-company-header">
                <Building2 size={28} />
                <h2>For Companies</h2>
              </div>
              <p className="wm-company-sub">Smarter commutes for your teams.</p>
              <p>Help your employees commute better with corporate carpooling. Reduce travel costs, improve productivity and meet your sustainability goals.</p>
              <button className="wm-btn-primary">Get in Touch <ArrowRight size={16}/></button>
            </div>
            <div className="wm-company-features">
               <span><CheckCircle2 size={14} className="wm-text-green"/> Lower commuting costs</span>
               <span><CheckCircle2 size={14} className="wm-text-green"/> Happier employees</span>
               <span><CheckCircle2 size={14} className="wm-text-green"/> Reduced carbon footprint</span>
            </div>
            <div className="wm-banner-illustration company-ill"></div>
          </div>
        </div>
      </section>

      {/* Expansion */}
      <section className="wm-section wm-bg-gray">
        <div className="wm-container wm-expansion-layout">
          <div className="wm-exp-text">
            <h2>Bengaluru First.<br/>Across Karnataka Next.</h2>
            <p>Starting with Bengaluru, we're building a stronger, cleaner Karnataka.</p>
            <button className="wm-btn-outline">View All Cities <ArrowRight size={16}/></button>
          </div>
          
          <div className="wm-exp-map">
            {/* Map visual showing Karnataka */}
            <div className="wm-karnataka-map"></div>
            <div className="wm-handwritten green exp-hw">More cities<br/>Coming Soon!</div>
          </div>
          
          <div className="wm-exp-photo">
             <div className="wm-photo-overlay">
               <h2>Fewer cars.<br/>Happier cities.</h2>
               <p><Leaf size={16}/> Let's build a cleaner, greener tomorrow.</p>
             </div>
             <div className="wm-photo-stats">
               <span><Navigation size={14}/> Less Traffic</span>
               <span><Leaf size={14}/> Cleaner Air</span>
               <span><Users size={14}/> Stronger Communities</span>
             </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="wm-section">
        <div className="wm-container">
          <div className="wm-dash-preview">
            <div className="wm-dash-header">
              <div className="wm-logo-icon small">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 20 L40 80 L50 60 L60 80 L80 20" stroke="url(#paint1)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs><linearGradient id="paint1" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stopColor="#002140" /><stop offset="1" stopColor="#00a86b" /></linearGradient></defs>
                </svg>
              </div>
              waymate
            </div>
            
            <div className="wm-dash-content">
              <div className="wm-dash-sidebar">
                <a href="#" className="active"><Search size={16}/> Home</a>
                <a href="#"><Search size={16}/> Find a Ride</a>
                <a href="#"><Car size={16}/> My Rides</a>
                <a href="#"><MessageSquare size={16}/> Messages <span className="wm-badge-red">3</span></a>
                <a href="#"><IndianRupeeIcon size={16}/> Payments</a>
                <a href="#"><UserCheck size={16}/> Profile</a>
              </div>
              
              <div className="wm-dash-main">
                <div className="wm-dm-header">
                  <div>
                    <h2>Your Commute Dashboard</h2>
                    <p>A smarter way to manage your rides.</p>
                  </div>
                </div>
                
                <div className="wm-dm-greeting">
                  <div className="wm-dmg-left">
                    <div className="wm-dmg-av">A</div>
                    <div>
                      <b>Good morning, Aravind 👋</b>
                      <p>Ready for your next ride?</p>
                    </div>
                  </div>
                  <button className="wm-btn-text wm-text-blue"><Search size={14}/> Search for rides</button>
                </div>
                
                <div className="wm-dm-search">
                  <div className="wm-dms-field"><MapPin size={16}/> <div><label>From</label><span>HSR Layout</span></div></div>
                  <ArrowRight size={14} className="wm-text-gray"/>
                  <div className="wm-dms-field"><MapPin size={16}/> <div><label>To</label><span>Whitefield</span></div></div>
                  <div className="wm-dms-field border-left"><Calendar size={16}/> <div><label>Date</label><span>Thu, 18 Sep 2025</span></div></div>
                  <button className="wm-btn-primary">Find Rides</button>
                </div>
                
                <div className="wm-dm-columns">
                  <div className="wm-dm-col">
                    <div className="wm-dm-card">
                      <h3>Upcoming Ride</h3>
                      <div className="wm-dmc-ride">
                        <div className="wm-dmc-date">
                          <small>Sep</small>
                          <b>18</b>
                          <small>Thu</small>
                        </div>
                        <div className="wm-dmc-details">
                          <div className="wm-dmc-route">
                            <span className="dot green"></span> HSR Layout <ArrowRight size={12}/> Whitefield
                            <span className="wm-badge-green-light ml-auto"><CheckCircle2 size={12}/> Confirmed</span>
                          </div>
                          <div className="wm-dmc-time"><Clock size={12}/> 8:30 AM</div>
                          <div className="wm-dmc-driver"><div className="av">K</div> Driver: Karthik S.</div>
                        </div>
                      </div>
                      <button className="wm-btn-outline w-full mt-3">View Details</button>
                    </div>
                  </div>
                  
                  <div className="wm-dm-col">
                    <div className="wm-dm-card">
                      <div className="flex-between">
                        <h3>Messages</h3>
                        <a href="#" className="wm-text-blue text-sm">View all</a>
                      </div>
                      <div className="wm-msg-list">
                        <div className="wm-msg-item">
                          <div className="av green">K</div>
                          <div><b>Karthik S.</b><p>See you at the pickup point!</p></div>
                          <small>10:24 AM</small>
                        </div>
                        <div className="wm-msg-item">
                          <div className="av blue">P</div>
                          <div><b>Priya M.</b><p>Thanks! I'll be there.</p></div>
                          <small>Yesterday</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="wm-dash-right">
                <div className="wm-dr-profile">
                  <div className="wm-dr-avatar">A</div>
                  <b>Aravind K.</b>
                  <span className="wm-badge-green-light"><CheckCircle2 size={12}/> Verified User</span>
                  
                  <div className="wm-dr-stats">
                    <div><b>12</b><span>Rides</span></div>
                    <div><b>4.8</b><span>Rating</span></div>
                    <div><b>6</b><span>Months</span></div>
                  </div>
                </div>
                
                <div className="wm-dr-menu">
                  <a href="#"><UserCheck size={16}/> My Profile <ChevronRight size={14}/></a>
                  <a href="#"><MapPin size={16}/> Saved Locations <ChevronRight size={14}/></a>
                  <a href="#"><IndianRupeeIcon size={16}/> Payments <ChevronRight size={14}/></a>
                  <a href="#"><Star size={16}/> Settings <ChevronRight size={14}/></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="wm-footer">
        <div className="wm-container wm-footer-layout">
          <div className="wm-footer-brand">
            <div className="wm-brand">
              <div className="wm-logo-icon">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 20 L40 80 L50 60 L60 80 L80 20" stroke="url(#paint2)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs><linearGradient id="paint2" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stopColor="#002140" /><stop offset="1" stopColor="#00a86b" /></linearGradient></defs>
                </svg>
              </div>
              <div className="wm-brand-text">
                <b>waymate</b>
                <span>Your route. Better together.</span>
              </div>
            </div>
            <p>Building a cleaner, smarter and more connected tomorrow, one ride at a time.</p>
            <div className="wm-socials">
              <a href="#">In</a><a href="#">Ig</a><a href="#">X</a><a href="#">Yt</a>
            </div>
          </div>
          
          <div className="wm-footer-links">
            <div className="wm-fl-col">
              <b>Product</b>
              <Link to="/app/find">Find a Ride</Link>
              <Link to="/app/offer">Offer a Ride</Link>
              <a href="#how">How It Works</a>
              <a href="#safety">Safety</a>
              <a href="#companies">For Companies</a>
            </div>
            <div className="wm-fl-col">
              <b>Company</b>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Press</a>
              <a href="#">Contact Us</a>
            </div>
            <div className="wm-fl-col">
              <b>Support</b>
              <a href="#">Help Center</a>
              <a href="#">Safety Guidelines</a>
              <a href="#">Community Guidelines</a>
              <a href="#">Report an Issue</a>
              <a href="#">FAQs</a>
            </div>
            <div className="wm-fl-col">
              <b>Legal</b>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
              <a href="#">Grievance</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
        
        <div className="wm-container">
          <div className="wm-footer-bottom">
            <p>© 2026 WayMate. All rights reserved.</p>
            <p className="wm-made-with"><Leaf size={14} className="wm-text-green"/> Made for a cleaner, greener India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function IndianRupeeIcon({size=16, className=""}: {size?:number, className?:string}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 3h12"/>
      <path d="M6 8h12"/>
      <path d="M6 13h8.5l-8.5 8"/>
      <path d="M6 13h3c3.3 0 6-2.7 6-6s-2.7-6-6-6"/>
    </svg>
  );
}
function MessageSquare({size=16}: {size?:number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

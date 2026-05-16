'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import s from './page.module.css';

export default function LandingPage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token && token !== 'guest-token') { router.replace('/dashboard'); }
  }, [router]);

  const handleCta = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token && token !== 'guest-token') router.push('/dashboard');
    else router.push('/signup');
  };

  return (
    <div className={s.landing}>
      {/* Nav */}
      <header className={s.nav}>
        <Link href="/" className={s.navLogo}>Flow<span>LoG</span></Link>
        <nav className={s.navLinks}>
          <a href="#features" className={s.navLink}>Features</a>
          <a href="#pricing" className={s.navLink}>Pricing</a>
          <a href="#teams" className={s.navLink}>Teams</a>
          <Link href="/login" className={s.navSecondary}>Log in</Link>
          <button className={s.navCta} onClick={handleCta}>Get it free</button>
        </nav>
        <button className={s.mobileMenu} onClick={() => setMobileOpen(true)} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#172B4D" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
        </button>
      </header>

      {/* Mobile overlay */}
      <div className={`${s.mobileOverlay} ${mobileOpen ? s.open : ''}`}>
        <button className={s.mobileClose} onClick={() => setMobileOpen(false)}>×</button>
        <a href="#features" className={s.navLink} onClick={() => setMobileOpen(false)}>Features</a>
        <a href="#pricing" className={s.navLink} onClick={() => setMobileOpen(false)}>Pricing</a>
        <a href="#teams" className={s.navLink} onClick={() => setMobileOpen(false)}>Teams</a>
        <Link href="/login" className={s.navSecondary} onClick={() => setMobileOpen(false)}>Log in</Link>
        <button className={s.navCta} onClick={() => { setMobileOpen(false); handleCta(); }}>Get it free</button>
      </div>

      <main>
        {/* Hero */}
        <section className={s.hero} style={{ background: '#E8F0FE', padding: '160px 40px 80px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }} className={s.heroGrid}>
            <div>
              <div className={s.heroBadge}>✨ Free forever for small teams</div>
              <h1 className={s.heroTitle}>Where your teams come together</h1>
              <p className={s.heroSub}>Keep your projects moving with flexible Kanban boards, integrated checklists, and automated workflows designed for modern teams.</p>
              <div className={s.heroCtas}>
                <button className={s.heroCtaPrimary} onClick={handleCta}>Get Started — It&apos;s Free →</button>
                <Link href="/login" className={s.heroCtaSecondary}>Log in</Link>
              </div>
            </div>
            <div className={s.heroPreview}>
              <div className={s.heroPreviewInner}>
                <div className={s.previewCol}>
                  <div className={s.previewColTitle}>To Do</div>
                  <div className={s.previewCard}>Redesign login flow<div className={s.previewChip} style={{ background: 'rgba(244,63,94,.1)', color: '#F43F5E' }}>Urgent</div></div>
                  <div className={s.previewCard}>API Documentation</div>
                </div>
                <div className={s.previewCol}>
                  <div className={s.previewColTitle}>In Progress</div>
                  <div className={s.previewCard}>Database Migration<div className={s.previewChip} style={{ background: 'rgba(255,171,0,.1)', color: '#FFAB00' }}>Optimization</div></div>
                </div>
                <div className={s.previewCol}>
                  <div className={s.previewColTitle}>Done</div>
                  <div className={s.previewCard} style={{ opacity: .6, textDecoration: 'line-through' }}>Theme switcher setup</div>
                  <div className={s.previewCard} style={{ opacity: .6, textDecoration: 'line-through' }}>Landing page copy</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className={s.features} id="features">
          <p className={s.sectionLabel}>Features</p>
          <h2 className={s.sectionTitle}>Everything you need to ship</h2>
          <p className={s.sectionSub}>From the first brainstorm to the final commit, FlowLoG tracks every detail with professional-grade tools.</p>
          <div className={s.featureGrid}>
            {[
              { icon: '📋', title: 'Powerful List View', desc: 'Organize tasks in a high-density list. Perfect for backlogs and long-term planning with bulk editing.' },
              { icon: '⚡', title: 'Automated Workflows', desc: 'Set rules to move tasks automatically. Label a card "Bug" and it moves to Dev backlog instantly.' },
              { icon: '🚀', title: 'Pre-built Templates', desc: 'Start in seconds with battle-tested templates for SCRUM, Marketing, and Client Onboarding.' },
              { icon: '📝', title: 'Rich Card Details', desc: 'Attach files, leave comments, and track progress with nested checklists on every card.' },
              { icon: '🔄', title: 'Real-time Sync', desc: 'When your teammate moves a card, it happens on your screen instantly. No refresh required.' },
              { icon: '💨', title: 'Feels Instant, Always', desc: 'Optimistic UI updates the board locally before the server confirms — even on slow Wi-Fi.' },
            ].map((f) => (
              <div key={f.title} className={s.featureCard}>
                <div className={s.featureIcon}>{f.icon}</div>
                <h3 className={s.featureCardTitle}>{f.title}</h3>
                <p className={s.featureCardDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Section */}
        <section className={s.aiSection} style={{ background: 'linear-gradient(135deg, #1D2125, #0D1B2A)' }}>
          <div className={s.aiContainer}>
            <div className={s.aiMockup} style={{ background: '#141c26', border: '1px solid rgba(255,255,255,.1)' }}>
              <div className={`${s.aiMsg} ${s.aiMsgUser}`}>Analyze my current backlog for bottlenecks.</div>
              <div className={`${s.aiMsg} ${s.aiMsgBot}`} style={{ background: 'rgba(255,255,255,.05)', color: '#e2e8f0' }}>I found 4 cards in &quot;In Review&quot; stagnant for 3 days. Most are assigned to @Alex. Would you like me to notify them or reassign?</div>
              <div className={`${s.aiMsg} ${s.aiMsgUser}`}>Move &quot;Redesign login&quot; to high priority and notify design.</div>
              <div className={`${s.aiMsg} ${s.aiMsgBot}`} style={{ background: 'rgba(255,255,255,.05)', color: '#e2e8f0' }}>Done. Updated priority for &quot;Redesign login flow&quot; ✅</div>
            </div>
            <div className={s.aiContent} style={{ color: '#fff' }}>
              <span className={s.heroBadge} style={{ background: 'rgba(0,82,204,.2)', color: '#b2c5ff' }}>Meet FlowGuide</span>
              <h2 style={{ color: '#fff' }}>AI that actually understands your workflow</h2>
              <p style={{ color: '#9ca3af' }}>Stop managing your project manager. FlowGuide identifies blockers, automates status updates, and plans sprints based on actual velocity.</p>
              <div className={s.aiChips}>
                {['Sprint forecasting', 'Contextual actions', 'Natural language', 'Blocker detection'].map(c => (
                  <span key={c} className={s.aiChip} style={{ background: 'rgba(255,171,0,.15)', color: '#FFAB00' }}>✨ {c}</span>
                ))}
              </div>
              <button className={s.navCta} onClick={handleCta} style={{ marginTop: 24, background: '#FFAB00', color: '#172B4D' }}>Try FlowGuide Free</button>
            </div>
          </div>
        </section>

        {/* Teams */}
        <section className={s.teams} id="teams">
          <h2 className={s.sectionTitle}>Built for every kind of team</h2>
          <p className={s.sectionSub}>From engineering sprints to marketing campaigns — FlowLoG adapts to how your team works.</p>
          <div className={s.teamGrid}>
            {[
              { emoji: '💻', title: 'Engineering', desc: 'Ship better code faster with bug tracking, sprints, and code review columns.' },
              { emoji: '📢', title: 'Marketing', desc: 'Manage campaigns and creative assets from ideation to live launch.' },
              { emoji: '🎨', title: 'Design', desc: 'Track iterations, feedback loops, and asset handoffs seamlessly.' },
              { emoji: '🌍', title: 'Remote Teams', desc: 'Bridge the timezone gap with async status updates and clear ownership.' },
            ].map(t => (
              <div key={t.title} className={s.teamCard}>
                <div className={s.teamEmoji}>{t.emoji}</div>
                <h3 className={s.teamCardTitle}>{t.title}</h3>
                <p className={s.teamCardDesc}>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className={s.pricing} id="pricing" style={{ background: '#E8F0FE' }}>
          <div className={s.pricingContainer}>
            <h2 className={s.sectionTitle}>Simple, transparent pricing</h2>
            <p className={s.sectionSub}>No hidden fees. No surprises.</p>
            <div className={s.pricingGrid}>
              <div className={s.pricingCard}>
                <div className={s.pricingPlan}>Free</div>
                <div className={s.pricingPrice}>$0 <span>for individuals</span></div>
                <ul className={s.pricingFeatures}>
                  {['Unlimited boards', 'Up to 10 members', 'Basic automations', 'Community support'].map(f => (
                    <li key={f}><span className={s.pricingCheck}>✓</span> {f}</li>
                  ))}
                </ul>
                <button className={s.navSecondary} onClick={handleCta} style={{ width: '100%', textAlign: 'center' }}>Get Started</button>
              </div>
              <div className={`${s.pricingCard} ${s.pricingPopular}`}>
                <div className={s.pricingBadge}>POPULAR</div>
                <div className={s.pricingPlan}>Pro</div>
                <div className={s.pricingPrice}>$9 <span>/year per user</span></div>
                <ul className={s.pricingFeatures}>
                  {['Everything in Free', 'Advanced Workflows', 'Custom Backgrounds', 'Priority 24/7 support'].map(f => (
                    <li key={f}><span className={s.pricingCheck}>✓</span> {f}</li>
                  ))}
                </ul>
                <button className={s.navCta} onClick={handleCta} style={{ width: '100%', background: '#FFAB00', color: '#172B4D' }}>Upgrade to Pro</button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className={s.features} style={{ background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} className={s.trustGrid}>
            {[
              { val: '∞', title: 'Unlimited Cards', desc: 'Scale your projects without worrying about item limits.', color: '#0052cc' },
              { val: '100%', title: 'Free to Start', desc: 'No credit card required to try the power of FlowLoG.', color: '#36B37E' },
              { val: '1-Click', title: 'Setup', desc: 'Import from Trello or Jira in less than 60 seconds.', color: '#FFAB00' },
            ].map(t => (
              <div key={t.title} style={{ textAlign: 'center', padding: 32, background: '#f3f4f6', borderRadius: 16, border: '1px solid #c3c6d6' }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: t.color, marginBottom: 8 }}>{t.val}</div>
                <h4 style={{ fontSize: 20, fontWeight: 600, color: '#172B4D', marginBottom: 6 }}>{t.title}</h4>
                <p style={{ fontSize: 14, color: '#42526E' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className={s.bottomCta}>
          <h2>Ready to transform your workflow?</h2>
          <p>Join thousands of teams who rely on FlowLoG to ship projects on time, every time.</p>
          <button className={s.bottomCtaBtn} onClick={handleCta}>Get FlowLoG Free →</button>
        </section>
      </main>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerBrand}>
            <h3>FlowLoG</h3>
            <p>The world&apos;s most flexible Kanban tool for teams of all sizes.</p>
          </div>
          <div className={s.footerCol}>
            <h4>Product</h4>
            <a href="#features" className={s.footerLink}>Features</a>
            <a href="#pricing" className={s.footerLink}>Pricing</a>
          </div>
          <div className={s.footerCol}>
            <h4>Safety</h4>
            <a href="#" className={s.footerLink}>Security</a>
            <a href="#" className={s.footerLink}>Privacy</a>
            <a href="#" className={s.footerLink}>Terms</a>
          </div>
          <div className={s.footerCol}>
            <h4>Resources</h4>
            <a href="#" className={s.footerLink}>Blog</a>
            <a href="#" className={s.footerLink}>Help Center</a>
          </div>
        </div>
        <div className={s.footerBottom}>© 2025 FlowLoG. All rights reserved.</div>
      </footer>
    </div>
  );
}

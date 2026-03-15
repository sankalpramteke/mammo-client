'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import AshokaChakra from '@/components/AshokaChakra';
import GovHeader from '@/components/GovHeader';
import Banner from '@/components/Banner';

const warriors = [
  {
    name: 'Dr. V. Shanta',
    title: 'The Mother of Cancer Care',
    institution: 'Cancer Institute (WIA), Chennai',
    description: 'Dedicated her entire life to making world-class cancer treatment accessible to the poorest patients in India. Led the Cancer Institute (WIA) for over 50 years.',
    contributions: [
      'Made world-class cancer treatment free or subsidised for the poor',
      'Led the Cancer Institute (WIA) for over 50 years',
      'Campaigned for early cancer detection in rural populations',
    ],
    awards: ['Padma Shri – 1986', 'Padma Bhushan – 2006', 'Padma Vibhushan – 2016'],
    photo: '/warriors/dr_v_shanta.png',
    color: '#7b1fa2',
  },
  {
    name: 'Dr. Suresh H. Advani',
    title: 'Pioneer of Medical Oncology',
    institution: 'Tata Memorial Hospital, Mumbai',
    description: 'One of India\'s first medical oncologists who introduced advanced chemotherapy protocols and trained generations of cancer specialists.',
    contributions: [
      'Pioneered advanced chemotherapy treatments in India',
      'Published landmark research in haematological malignancies',
      'Authored over 300 peer-reviewed publications',
    ],
    awards: ['Padma Shri – 2002', 'Padma Bhushan – 2012'],
    photo: '/warriors/dr_suresh_advani.png',
    color: '#1565c0',
  },
  {
    name: 'Dr. Rajendra A. Badwe',
    title: 'Global Breast Cancer Surgery Leader',
    institution: 'Tata Memorial Centre, Mumbai',
    description: 'Known worldwide for clinical trials that redefined breast cancer surgery — reducing unnecessary mastectomies and improving quality of life for millions.',
    contributions: [
      'Changed global breast cancer treatment guidelines',
      'Reduced unnecessary mastectomies through evidence-based research',
      'Led Tata Memorial Centre to international recognition',
    ],
    awards: ['Padma Shri – 2013'],
    photo: '/warriors/dr_rajendra_badwe.png',
    color: '#1a3a6b',
  },
  {
    name: 'Dr. P. Raghu Ram',
    title: 'Champion for Early Detection',
    institution: 'KIMS-Ushalakshmi Centre, Hyderabad',
    description: 'Founder of the Ushalakshmi Breast Cancer Foundation, tirelessly campaigning for breast self-examination and early detection across rural India.',
    contributions: [
      'Launched national campaigns for breast cancer awareness',
      'Trained hundreds of doctors in breast surgery and screening',
      'Promotes self-breast examination in rural communities',
    ],
    awards: ['Padma Shri – 2015'],
    photo: '/warriors/dr_raghu_ram.png',
    color: '#c0392b',
  },
];

const stats = [
  { num: '1,40,000+', label: 'Women diagnosed with breast cancer annually in India', icon: '📊' },
  { num: '90%', label: 'Survival rate when detected early through AI screening', icon: '💡' },
  { num: '50+ yrs', label: 'Combined decades of service by India\'s cancer warriors', icon: '⏳' },
  { num: '4', label: 'Padma-honoured oncologists championing the fight', icon: '🏅' },
];

export default function LandingPage() {
  const [activeWarrior, setActiveWarrior] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fafafa' }}>
      <Banner />

      <GovHeader />

      <main className="flex-1">

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #122a52 30%, #1a3a6b 60%, #2c5f9e 100%)', minHeight: 520 }}>
          {/* Floating decorative elements */}
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,148,29,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(44,95,158,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-50%)', fontSize: 200, opacity: 0.04, pointerEvents: 'none' }}>🎗️</div>

          <div className="max-w-screen-xl mx-auto px-6 py-20 flex flex-col items-center text-center relative z-10">
            {/* Emblem */}
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(247,148,29,0.3)', borderRadius: '50%', padding: 20, marginBottom: 28 }}>
              <AshokaChakra size={72} />
            </div>

            <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
              National Mammogram AI<br />Detection System
            </h1>

            <div style={{ width: 60, height: 3, background: '#f7941d', margin: '0 auto 20px', borderRadius: 2 }} />

            <p style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: 'rgba(255,255,255,0.8)', maxWidth: 640, lineHeight: 1.7, marginBottom: 36 }}>
              Empowering healthcare professionals with privacy-preserving <strong style={{ color: '#f7941d' }}>Federated Learning AI</strong> — delivering rapid, accurate breast cancer screenings while keeping patient data safely within hospital walls.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/login"
                style={{ padding: '14px 36px', background: '#f7941d', color: 'white', fontWeight: 700, fontSize: 15, borderRadius: 6, textDecoration: 'none', boxShadow: '0 4px 20px rgba(247,148,29,0.4)', transition: 'all 0.3s' }}>
                Healthcare Professional Login →
              </Link>
              <a href="#warriors"
                style={{ padding: '14px 36px', background: 'transparent', color: 'white', fontWeight: 600, fontSize: 15, borderRadius: 6, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.3)', transition: 'all 0.3s' }}>
                Meet Our Cancer Warriors
              </a>
            </div>

            {/* Inline stat pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: '🛡️', text: 'Privacy-First AI' },
                { icon: '🔬', text: 'ResNet50 Deep Learning' },
                { icon: '⚡', text: 'Instant Results' },
                { icon: '🌐', text: 'Federated Learning' },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  <span>{p.icon}</span> {p.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ CANCER WARRIORS ═══════════ */}
        <section id="warriors" style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f0f4f8 100%)' }}>
          <div className="max-w-screen-xl mx-auto px-6 py-16">

            {/* Section Header */}
            <div className="text-center mb-14">
              <div style={{ display: 'inline-block', padding: '6px 20px', background: '#c0392b', color: 'white', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
                🎗️ HONOURING INDIA&apos;S HEROES
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#1a3a6b', marginBottom: 12 }}>
                India&apos;s Cancer Warriors
              </h2>
              <p style={{ color: '#666', maxWidth: 560, margin: '0 auto', fontSize: 14, lineHeight: 1.7 }}>
                Visionary oncologists and advocates who have dedicated their lives to fighting breast cancer — saving lives, training doctors, and building a healthier nation.
              </p>
            </div>

            {/* Warrior Cards — 2x2 Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {warriors.map((w, i) => (
                <div
                  key={i}
                  onClick={() => setActiveWarrior(activeWarrior === i ? null : i)}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: activeWarrior === i
                      ? `0 12px 40px rgba(0,0,0,0.12), 0 0 0 2px ${w.color}`
                      : '0 2px 12px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: activeWarrior === i ? 'translateY(-6px)' : 'none',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ padding: '24px 24px 16px', display: 'flex', gap: 18, alignItems: 'center' }}>
                    {/* Photo */}
                    <div style={{
                      width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                      border: `3px solid ${w.color}`,
                      boxShadow: `0 4px 16px ${w.color}30`,
                    }}>
                      <img src={w.photo} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a2e', marginBottom: 2, lineHeight: 1.2 }}>{w.name}</h3>
                      <div style={{ fontSize: 12, fontWeight: 600, color: w.color, marginBottom: 4 }}>{w.title}</div>
                      <div style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10 }}>🏥</span> {w.institution}
                      </div>
                    </div>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: activeWarrior === i ? w.color : '#f0f4f8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: activeWarrior === i ? 'white' : '#999',
                      transition: 'all 0.3s', flexShrink: 0,
                    }}>
                      {activeWarrior === i ? '−' : '+'}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ padding: '0 24px 16px' }}>
                    <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65, margin: 0 }}>{w.description}</p>
                  </div>

                  {/* Expandable Details */}
                  <div style={{
                    maxHeight: activeWarrior === i ? 280 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    <div style={{ padding: '0 24px 20px', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3a6b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>Key Contributions</div>
                      {w.contributions.map((c, ci) => (
                        <div key={ci} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#555', lineHeight: 1.5 }}>
                          <span style={{ color: w.color, flexShrink: 0, marginTop: 2 }}>▸</span>
                          <span>{c}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                        {w.awards.map((a, ai) => (
                          <span key={ai} style={{
                            background: `${w.color}12`, color: w.color, padding: '4px 12px',
                            borderRadius: 6, fontSize: 11, fontWeight: 700, border: `1px solid ${w.color}30`,
                          }}>🏅 {a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ CTA SECTION ═══════════ */}
        <section style={{ background: '#1a3a6b', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 50%, rgba(247,148,29,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
          <div className="max-w-screen-xl mx-auto px-6 py-14 text-center relative z-10">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 10 }}>
              Join the Fight Against Breast Cancer
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Healthcare professionals can start screening patients immediately with our AI-powered mammogram analysis system.
            </p>
            <Link href="/login"
              style={{ display: 'inline-block', padding: '14px 40px', background: '#f7941d', color: 'white', fontWeight: 700, fontSize: 15, borderRadius: 6, textDecoration: 'none', boxShadow: '0 4px 20px rgba(247,148,29,0.4)' }}>
              Login to Start Screening →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0a1628', borderTop: '3px solid #f7941d' }} className="py-5 text-center">
        <p style={{ color: 'rgba(170,196,232,0.8)', fontSize: 13, marginBottom: 4 }}>
          © 2026 Ministry of Health &amp; Family Welfare, Government of India | National Informatics Centre
        </p>
        <p style={{ color: 'rgba(170,196,232,0.5)', fontSize: 11 }}>
          Website Policy | Accessibility | Help | NIC Helpdesk: 1800-111-0888
        </p>
      </footer>
    </div>
  );
}

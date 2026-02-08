'use client';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1d2125' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', gap: '32px' }}>

          {/* Main "Your items" section */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#b6c2cf', marginBottom: '16px' }}>Your items</h1>

            <div style={{
              background: '#22272b', // Faking an empty state/illustration card
              borderRadius: '8px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <img src="https://a.trellocdn.com/prgb/dist/images/home-empty-content-zone-hero.3639556e409b83b63290.svg" alt="" style={{ width: '200px', marginBottom: '24px' }} />
              <p style={{ color: '#b6c2cf' }}>Stay on track and up to date</p>
              <p style={{ color: '#9fadbc', fontSize: '14px' }}>Invite people to boards and cards, leave comments, add due dates, and we'll show the most important activity here.</p>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Recently Viewed */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#9fadbc', marginBottom: '12px' }}>Recently viewed</h3>
              <div style={{
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                borderRadius: '4px',
              }}>
                <div style={{ width: '32px', height: '24px', background: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)', borderRadius: '3px' }}></div>
                <div>
                  <div style={{ color: '#b6c2cf', fontWeight: '500', fontSize: '14px' }}>Project Alpha</div>
                  <div style={{ color: '#9fadbc', fontSize: '12px' }}>FlowLog Workspace</div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#9fadbc', marginBottom: '12px' }}>Links</h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                color: '#b6c2cf',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '16px' }}>➕</span>
                Create a board
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

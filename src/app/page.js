"use client";

import { useState } from 'react';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a .mbox file first");
      return;
    }
    
    setLoading(true);
    setError('');
    setApplications([]);
    
    const formData = new FormData();
    formData.append('mbox', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload/parse');
      
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: applications.length,
    interviews: applications.filter(a => a.state === 'Interview').length,
    offers: applications.filter(a => a.state === 'Offer').length,
    rejected: applications.filter(a => a.state === 'Rejected').length,
  };

  return (
    <div className="container animate-fade-in">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Job Mail Analyzer</h1>
        <p>Upload your Gmail or Apple Mail .mbox export to securely extract job application statuses and deadlines.</p>
      </header>

      <section className="glass glass-card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <input 
          type="file" 
          accept=".mbox" 
          onChange={handleFileChange}
          style={{ marginBottom: '1rem', display: 'block', margin: '0 auto 1rem auto' }}
        />
        <button 
          className="btn" 
          onClick={handleUpload} 
          disabled={loading || !file}
        >
          {loading ? 'Processing... (This may take a minute)' : 'Analyze Mailbox'}
        </button>
        {error && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{error}</p>}
      </section>

      {applications.length > 0 && (
        <>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '2rem', color: 'var(--accent)' }}>{stats.total}</h3>
              <p>Total Tracked</p>
            </div>
            <div className="glass glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '2rem', color: 'var(--warning)' }}>{stats.interviews}</h3>
              <p>Interviews</p>
            </div>
            <div className="glass glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '2rem', color: 'var(--success)' }}>{stats.offers}</h3>
              <p>Offers</p>
            </div>
            <div className="glass glass-card" style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '2rem', color: 'var(--danger)' }}>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </section>

          <section className="glass glass-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>Company</th>
                  <th style={{ padding: '1rem' }}>State</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Subject</th>
                  <th style={{ padding: '1rem' }}>Deadline Found</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{app.company}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        backgroundColor: app.state === 'Offer' ? 'rgba(16, 185, 129, 0.2)' :
                                         app.state === 'Interview' ? 'rgba(245, 158, 11, 0.2)' :
                                         app.state === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: app.state === 'Offer' ? 'var(--success)' :
                               app.state === 'Interview' ? 'var(--warning)' :
                               app.state === 'Rejected' ? 'var(--danger)' : 'var(--accent)'
                      }}>
                        {app.state}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(app.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={app.subject}>
                      {app.subject}
                    </td>
                    <td style={{ padding: '1rem' }}>{app.deadline || <span style={{ opacity: 0.5 }}>None</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

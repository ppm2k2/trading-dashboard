import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [marketData, setMarketData] = useState([]);
  const [provider, setProvider] = useState('mock');
  const [status, setStatus] = useState('CONNECTED');
  const [currentTime, setCurrentTime] = useState('');
  
  // Track previous prices to detect flashes
  const prevPricesRef = useRef({});
  const [flashes, setFlashes] = useState({});

  // Live UTC Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toUTCString().split(' ')[4] + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Market Data from FastAPI backend
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/market/snapshot?provider=${provider}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        let parsedData = [];
        if (Array.isArray(data)) {
          parsedData = data.map(item => ({
            symbol: item.symbol || 'UNKNOWN',
            bid: item.bid ?? (item.last ? item.last - 0.02 : 100.0),
            last: item.last ?? item.price ?? 100.0,
            ask: item.ask ?? (item.last ? item.last + 0.02 : 100.0),
            spread: 0.0400,
            net_change: item.net_change ?? item.change ?? 1.25,
            pct_change: item.pct_change ?? item.percent_change ?? 0.50
          }));
        } else if (data && typeof data === 'object') {
          parsedData = Object.entries(data).map(([key, val]) => {
            const lastVal = typeof val === 'object' ? (val.last ?? 100.0) : val;
            return {
              symbol: key,
              bid: lastVal - 0.02,
              last: lastVal,
              ask: lastVal + 0.02,
              spread: 0.0400,
              net_change: 1.45,
              pct_change: 0.38
            };
          });
        }

        // Compare with previous prices to trigger flash animations
        const newFlashes = {};
        parsedData.forEach(row => {
          const oldPrice = prevPricesRef.current[row.symbol];
          if (oldPrice !== undefined && oldPrice !== row.last) {
            newFlashes[row.symbol] = row.last > oldPrice ? 'up' : 'down';
          }
          prevPricesRef.current[row.symbol] = row.last;
        });

        if (Object.keys(newFlashes).length > 0) {
          setFlashes(newFlashes);
          setTimeout(() => {
            setFlashes({});
          }, 600);
        }

        setMarketData(parsedData);
        setStatus('CONNECTED');
      } catch (error) {
        console.error('Error fetching market snapshot:', error);
        setStatus('DISCONNECTED');
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 2000);
    return () => clearInterval(interval);
  }, [provider]);

  return (
    <div style={{ backgroundColor: '#090d16', color: '#94a3b8', minHeight: '100vh', fontFamily: 'Inter, monospace', padding: '12px', boxSizing: 'border-box' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: '10px 16px', borderRadius: '6px', border: '1px solid #1f2937', marginBottom: '12px', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#64748b' }}>Layout: <strong style={{ color: '#e2e8f0' }}>Multi-Selectable Interactive Intraday Chart + Matrix Below</strong></span>
          <span style={{ background: '#1e293b', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', border: '1px solid #334155' }}>INDU:52496.2 | INTC:52496.05</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => alert('Authentication handshake initiated')}
            style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
          >
            Connect Alpaca
          </button>

          <button 
            onClick={() => setProvider(provider === 'mock' ? 'alpaca' : 'mock')}
            style={{ 
              background: provider === 'mock' ? '#10b981' : '#0ea5e9', 
              color: '#fff', 
              border: 'none', 
              padding: '6px 14px', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          >
            {provider === 'mock' ? 'Mode: Mock Stream (Active)' : 'Mode: Alpaca Live (Active)'}
          </button>

          <span style={{ color: status === 'CONNECTED' ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '0.75rem' }}>
            STATUS: {status} ({provider.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Main App Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', gap: '12px', alignItems: 'start' }}>

        {/* LEFT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #1f2937', padding: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>S&P EQUITY SECTORS</div>
            {[
              { name: 'Energy', chg: '+1.5%', pos: true },
              { name: 'Industrials', chg: '+0.3%', pos: true },
              { name: 'Financials', chg: '+0.1%', pos: true },
              { name: 'Technology', chg: '0.0%', pos: true },
              { name: 'Utilities', chg: '-1.4%', pos: false },
            ].map((sec, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: i < 4 ? '1px solid #1a2234' : 'none' }}>
                <span style={{ color: '#cbd5e1' }}>{sec.name}</span>
                <span style={{ color: sec.pos ? '#10b981' : '#ef4444', fontWeight: '600' }}>{sec.chg}</span>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #1f2937', padding: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>FX CROSSES</div>
            {[
              { pair: 'USD/JPY', val: '158.32' },
              { pair: 'EUR/USD', val: '1.1492' },
              { pair: 'GBP/USD', val: '1.2761' },
            ].map((fx, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: i < 2 ? '1px solid #1a2234' : 'none' }}>
                <span style={{ color: '#cbd5e1' }}>{fx.pair}</span>
                <span style={{ color: '#f8fafc', fontWeight: '600' }}>{fx.val}</span>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #1f2937', padding: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>GLOBAL YIELDS</div>
            {[
              { name: 'US 10Y', val: '4.34%' },
              { name: 'DE 10Y', val: '2.37%' },
            ].map((y, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: i < 1 ? '1px solid #1a2234' : 'none' }}>
                <span style={{ color: '#cbd5e1' }}>{y.name}</span>
                <span style={{ color: '#f8fafc', fontWeight: '600' }}>{y.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER MAIN SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #1f2937', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>INDU Index</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc', marginLeft: '12px' }}>52,496.00</span>
              <span style={{ fontSize: '0.8rem', color: '#10b981', marginLeft: '10px', fontWeight: '600' }}>+621.91 (+1.22%)</span>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              {[
                { sym: 'SPY', val: '767.56', chg: '+152.36 (+23.68%)', pos: true },
                { sym: 'QQQ', val: '740.68', chg: '+245.31 (+49.67%)', pos: true },
                { sym: 'DIA', val: '514.73', chg: '-2.88 (-0.56%)', pos: false },
                { sym: 'IWM', val: '282.40', chg: '-0.46 (-0.16%)', pos: false },
              ].map((card, idx) => (
                <div key={idx} style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{card.sym}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f8fafc' }}>{card.val}</div>
                  <div style={{ fontSize: '0.65rem', color: card.pos ? '#10b981' : '#ef4444' }}>{card.chg}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Koyfin Multi-Asset Relative Performance Chart */}
          <div style={{ backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #1f2937', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.75rem' }}>
                <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>● SPY 0.01%</span>
                <span style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '4px' }}>● QQQ 0.49%</span>
                <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>● DIA 19.66%</span>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>● IWM 0.01%</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                RELATIVE INTRADAY (%)
              </span>
            </div>

            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
              <svg style={{ width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 800 150" preserveAspectRatio="none">
                <line x1="0" y1="37" x2="800" y2="37" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="800" y2="75" stroke="#1f2937" strokeDasharray="3 3" />
                <line x1="0" y1="112" x2="800" y2="112" stroke="#1f2937" strokeDasharray="3 3" />
                
                <path d={`M 0 ${75 + (Math.random() * 10 - 5)} Q 200 75, 400 78 T 800 ${76 + (Math.random() * 10 - 5)}`} fill="none" stroke="#38bdf8" strokeWidth="2" style={{ transition: 'all 0.5s ease' }} />
                <path d={`M 0 ${90 + (Math.random() * 10 - 5)} Q 150 40, 300 95 T 800 ${70 + (Math.random() * 10 - 5)}`} fill="none" stroke="#c084fc" strokeWidth="2" style={{ transition: 'all 0.5s ease' }} />
                <path d={`M 0 ${85 + (Math.random() * 10 - 5)} Q 250 140, 500 75 T 800 ${78 + (Math.random() * 10 - 5)}`} fill="none" stroke="#fbbf24" strokeWidth="2" style={{ transition: 'all 0.5s ease' }} />
                <path d={`M 0 ${78 + (Math.random() * 10 - 5)} Q 200 76, 450 78 T 800 ${75 + (Math.random() * 10 - 5)}`} fill="none" stroke="#10b981" strokeWidth="2" style={{ transition: 'all 0.5s ease' }} />
              </svg>
            </div>
          </div>

          {/* Data Matrix Table with Flashing Rows */}
          <div style={{ backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #1f2937', padding: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1f2937', color: '#64748b', fontSize: '0.75rem' }}>
                  <th style={{ padding: '8px' }}>SYMBOL</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>BID</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>LAST</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>ASK</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>SPREAD</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>NET / % CHG</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((row, index) => {
                  const isPositive = row.net_change >= 0;
                  const flashType = flashes[row.symbol]; 
                  const flashBg = flashType === 'up' 
                    ? 'rgba(16, 185, 129, 0.25)' 
                    : flashType === 'down' 
                    ? 'rgba(239, 68, 68, 0.25)' 
                    : index % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'transparent';

                  return (
                    <tr 
                      key={index} 
                      style={{ 
                        borderBottom: '1px solid #1a2234', 
                        backgroundColor: flashBg,
                        transition: 'background-color 0.4s ease'
                      }}
                    >
                      <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#f8fafc' }}>{row.symbol}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#cbd5e1' }}>{row.bid.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: flashType === 'up' ? '#34d399' : flashType === 'down' ? '#f87171' : '#64b5f6', fontWeight: '600', transition: 'color 0.3s ease' }}>
                        {row.last.toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#cbd5e1' }}>{row.ask.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: '#94a3b8' }}>{row.spread.toFixed(4)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', color: isPositive ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                        {isPositive ? `+${row.net_change.toFixed(2)} (+${row.pct_change.toFixed(2)}%)` : `${row.net_change.toFixed(2)} (${row.pct_change.toFixed(2)}%)`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ backgroundColor: '#111827', borderRadius: '6px', border: '1px solid #1f2937', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.5px' }}>Individual Security Charts</div>
          
          {['DIA', 'QQQ', 'INDU', 'MSFT', 'AAPL', 'SPY', 'IWM'].map((sym, idx) => (
            <div key={idx} style={{ background: '#0f172a', borderRadius: '4px', padding: '8px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
                <span>{sym}</span>
                <span style={{ color: idx % 2 === 0 ? '#10b981' : '#ef4444' }}>{idx % 2 === 0 ? '514.73' : '340.46'}</span>
              </div>
              <div style={{ height: '35px', width: '100%' }}>
                <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d={idx % 2 === 0 ? "M 0 20 Q 25 5, 50 15 T 100 10" : "M 0 10 Q 30 25, 70 5 T 100 25"} fill="none" stroke={idx % 2 === 0 ? "#10b981" : "#ef4444"} strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { ArrowRight, Check, CircleAlert, Clock3, Gem, History, LockKeyhole, RefreshCw, ShieldCheck, Sparkles, WalletCards, X } from 'lucide-react';
import api from './services/api';
import './index.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('demo@veloop.test');
  const [password, setPassword] = useState('DemoPass123!');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const { data } = await api.post('/auth/login', { email, password }); sessionStorage.setItem('veloop_token', data.token); onLogin(data.user); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to sign in.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><div className="auth-panel"><div className="brand-mark">V<span>•</span>LOOP <small>REWARDS</small></div><div className="auth-copy"><p className="eyebrow">MEMBER ACCESS</p><h1>Turn small moments<br /><em>into something more.</em></h1><p>Enter the VELoop Rewards space and earn Gems through quick, secure challenges.</p></div><form onSubmit={submit} className="auth-form"><label>Email<input value={email} onChange={event => setEmail(event.target.value)} type="email" required /></label><label>Password<input value={password} onChange={event => setPassword(event.target.value)} type="password" required /></label>{error && <div className="form-error"><CircleAlert size={16} />{error}</div>}<button className="primary-button" disabled={busy}>{busy ? 'Signing in...' : 'Enter rewards'}<ArrowRight size={18} /></button></form><p className="demo-note">Demo access is prefilled for local evaluation.</p></div><div className="auth-art"><div className="orbital-orb"><Gem size={64} /></div><div className="art-caption"><ShieldCheck size={18} /><span>Secure earning, built around you.</span></div></div></main>;
}

function Header({ user, balance, onLogout, onHistory }) {
  return <header className="topbar"><div className="brand-mark">V<span>•</span>LOOP <small>REWARDS</small></div><nav><button onClick={onHistory}><History size={16} />Activity</button><div className="balance-pill"><Gem size={16} /><strong>{balance.toFixed(1)}</strong><span>Gems</span></div><button className="avatar" title={user?.email}>{user?.displayName?.slice(0, 1) || 'M'}</button><button className="logout" onClick={onLogout}>Sign out</button></nav></header>;
}

function OptionCard({ option, index, selected, disabled, onSelect }) {
  return <button className={`option-card ${selected ? 'selected' : ''}`} disabled={disabled} onClick={() => onSelect(option)}><span className="option-index">0{index + 1}</span><span className="option-text">{option}</span>{selected ? <Check size={18} /> : <ArrowRight size={17} />}</button>;
}

function Challenge({ challenge, onResult }) {
  const [selected, setSelected] = useState('');
  const [phase, setPhase] = useState('ready');
  const [error, setError] = useState('');
  async function selectOption(option) {
    if (phase !== 'ready') return;
    setSelected(option); setPhase('scanning'); setError('');
    await new Promise(resolve => setTimeout(resolve, 520));
    setPhase('checking');
    try { const { data } = await api.post('/captcha/verify', { challengeId: challenge.challengeId, selectedOption: option }); onResult(data); }
    catch (requestError) { setError(requestError.response?.data?.message || 'Verification failed.'); setPhase('ready'); setSelected(''); }
  }
  if (phase === 'checking' || phase === 'scanning') return <section className="challenge-card checking-card"><div className="challenge-meta"><span><span className="step-dot">02</span> VERIFICATION</span><Clock3 size={15} /> SECURE CHECK</div><div className="scanner"><div className="scan-ring ring-one"><div className="scan-lock"><LockKeyhole size={38} /></div></div><div className="scan-line" /></div><h2>{phase === 'scanning' ? 'Verifying...' : 'Checking your answer...'}</h2><p>Please wait while we securely check your response.</p><div className="progress-track"><span /></div></section>;
  return <section className="challenge-card"><div className="challenge-meta"><span><span className="step-dot">01</span> CHALLENGE</span><span className="expiry"><Clock3 size={15} /> 02:00</span></div><div className="challenge-heading"><div><p className="eyebrow">EARN GEMS</p><h2>Find the matching code</h2><p>Select the code that matches the secure challenge.</p></div><div className="gem-reward"><Gem size={20} /><strong>+1</strong><span>Gem</span></div></div><div className="code-display"><span>SECURE CODE</span><strong>{challenge.question}</strong><small>4 choices &middot; one match</small></div><div className="options-grid">{challenge.options.map((option, index) => <OptionCard key={option} option={option} index={index} selected={selected === option} disabled={phase !== 'ready'} onSelect={selectOption} />)}</div>{error && <div className="form-error"><CircleAlert size={16} />{error}</div>}<div className="privacy-note"><ShieldCheck size={18} /><span>This challenge is checked securely on the server. Your answer is never stored in the browser.</span></div></section>;
}

function Result({ result, onClaim, onNew }) {
  const correct = result.result === 'CORRECT';
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [adStage, setAdStage] = useState('preparing');

  async function claim() {
    setClaiming(true);
    setAdStage('preparing');
    await new Promise(resolve => setTimeout(resolve, 900));
    setAdStage('ad');
    await new Promise(resolve => setTimeout(resolve, 700));

    try {
      await api.post('/captcha/claim', { challengeId: result.challengeId });
      setClaimed(true);
      setAdStage('done');
      if (onClaim) onClaim();
    } finally {
      setClaiming(false);
    }
  }

  return <section className={`result-card ${correct ? 'success' : 'wrong'}`}><div className="result-icon">{correct ? <Check size={42} /> : <X size={42} />}</div><p className="eyebrow">{correct ? 'VERIFICATION COMPLETE' : 'VERIFICATION UNSUCCESSFUL'}</p><h2>{correct ? 'You earned a Gem.' : 'That one slipped through.'}</h2><div className="reward-amount"><Gem size={26} />+{result.reward.amount} <span>Gems</span></div><p className="result-copy">{correct ? 'Your reward has been added to your wallet. Claim it to continue.' : 'No worries. Every attempt still moves you forward.'}</p>{claimed || claiming ? <div className="claim-status"><Sparkles size={18} />{claiming ? (adStage === 'preparing' ? 'Preparing reward...' : adStage === 'ad' ? 'Mock Rewarded Ad' : 'Reward completed') : 'Reward completed'}</div> : <div className="result-actions"><button className="primary-button" onClick={claim} disabled={claiming}>Claim reward <ArrowRight size={18} /></button><button className="secondary-button" onClick={onNew}>No thanks</button></div>}{claimed && <button className="secondary-button full-button" onClick={onNew}>Continue earning <RefreshCw size={16} /></button>}</section>;
}

function App() {
  const [user, setUser] = useState(null); const [challenge, setChallenge] = useState(null); const [result, setResult] = useState(null); const [balance, setBalance] = useState(0); const [view, setView] = useState('earn'); const [history, setHistory] = useState([]); const [loading, setLoading] = useState(false);
  async function load() { setLoading(true); try { const [challengeResponse, walletResponse] = await Promise.all([api.get('/captcha/current'), api.get('/wallet/gems')]); setChallenge(challengeResponse.data.challenge); setBalance(walletResponse.data.wallet.amount); } finally { setLoading(false); } }
  useEffect(() => { const token = sessionStorage.getItem('veloop_token'); if (token) api.get('/auth/me').then(response => { setUser(response.data.user); load(); }).catch(() => sessionStorage.removeItem('veloop_token')); }, []);
  function login(nextUser) { setUser(nextUser); load(); }
  function logout() { sessionStorage.removeItem('veloop_token'); setUser(null); setChallenge(null); setResult(null); }
  async function newChallenge() {
    setResult(null);
    setChallenge(null);
    try {
      const { data } = await api.post('/captcha/new');
      setChallenge(data.challenge);
    } catch (error) {
      await load();
    }
  }
  async function showHistory() { const { data } = await api.get('/captcha/history'); setHistory(data.history); setView('history'); }
  if (!user) return <Login onLogin={login} />;
  return <div className="app-shell"><Header user={user} balance={balance} onLogout={logout} onHistory={showHistory} /><main className="dashboard"><div className="page-intro"><div><p className="eyebrow">VELoop / EARN</p><h1>Earn Gems <span>with focus.</span></h1><p>Complete a quick security check and keep your rewards moving.</p></div><div className="secure-badge"><ShieldCheck size={18} /> Secure by design</div></div>{view === 'history' ? <section className="history-card"><div className="section-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2>Reward history</h2></div><button className="secondary-button" onClick={() => setView('earn')}>Back to earn</button></div>{history.length ? <div className="history-list">{history.map(item => <div className="history-row" key={item.challengeId}><div className={`history-dot ${item.result.toLowerCase()}`}>{item.result === 'CORRECT' ? <Check size={15} /> : <X size={15} />}</div><div><strong>{item.result === 'CORRECT' ? 'Correct verification' : 'Incorrect verification'}</strong><small>{new Date(item.completedAt).toLocaleString()}</small></div><span>+{item.reward} Gems</span></div>)}</div> : <div className="empty-state">Your completed challenges will appear here.</div>}</section> : loading ? <section className="loading-card"><div className="spinner" /><h2>Preparing your challenge</h2><p>Securing a fresh opportunity to earn.</p></section> : result ? <Result result={result} onClaim={async () => {}} onNew={newChallenge} /> : challenge ? <Challenge challenge={challenge} onResult={async nextResult => { setResult(nextResult); setBalance(nextResult.balance.amount); }} /> : null}<footer><span>© 2026 VELoop Rewards</span><span><LockKeyhole size={14} /> Your earning activity is protected</span></footer></main></div>;
}

export default App;

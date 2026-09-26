function viewInvite(res) {
  // Build from the current directory, not by guessing the current filename/extension —
  // robust even if this page is served without ".html" (a "pretty URL" host).
  const dir = location.href.slice(0, location.href.lastIndexOf('/') + 1).split('?')[0].split('#')[0];
  const peerLink = res.peerLink || `${dir}johari-peer.html?s=${res.sessionId}`;
  const selfLink = res.selfLink || `${dir}johari.html?s=${res.sessionId}`;
  app.innerHTML = `
    <h1 class="page">Your invite link is ready.</h1>
    <p class="lede">Send this to a few colleagues — a manager, a peer, someone you work with often. We also emailed it to you.</p>
    <div class="linkbox"><code id="peerLink">${esc(peerLink)}</code><button class="btn ghost" type="button" id="copyPeer">Copy</button></div>
    <p class="fine">Your results unlock once at least ${res.minPeers} people respond — so no single answer can be traced back to them.</p>
    <p class="fine">Bookmark this link to check your results later:</p>
    <div class="linkbox"><code>${esc(selfLink)}</code><button class="btn ghost" type="button" id="copySelf">Copy</button></div>
    <div class="actions"><button class="btn" type="button" id="checkNow">Check my results now</button></div>`;
  $('#copyPeer').addEventListener('click', () => { navigator.clipboard.writeText(peerLink); $('#copyPeer').textContent = 'Copied'; });
  $('#copySelf').addEventListener('click', () => { navigator.clipboard.writeText(selfLink); $('#copySelf').textContent = 'Copied'; });
  $('#checkNow').addEventListener('click', () => {
    history.replaceState(null, '', '?s=' + res.sessionId);
    viewAuth(res.sessionId);
  });
}







function viewWaiting(data, email) {
  const pct = Math.min(100, Math.round((data.totalPeers / data.minPeers) * 100));
  const dir = location.href.slice(0, location.href.lastIndexOf('/') + 1).split('?')[0].split('#')[0];
  const peerLink = `${dir}johari-peer.html?s=${data.sessionId}`;
  app.innerHTML = `
    <h1 class="page">Almost there, ${esc(String(data.name).split(' ')[0])}.</h1>
    <p class="lede">Your results unlock once ${data.minPeers} colleagues respond, so no single answer stands out.</p>
    <p style="font-weight:700">${data.totalPeers} of ${data.minPeers} responses received</p>
    <div class="prog"><i style="width:${pct}%"></i></div>
    <p class="fine" style="margin-top:18px">Share this link with more colleagues:</p>
    <div class="linkbox"><code>${esc(peerLink)}</code><button class="btn ghost" type="button" id="copyPeer">Copy</button></div>
    <div class="actions">
      <button class="btn" type="button" id="refresh">Check again</button>
      <button class="btn ghost" type="button" id="back">Back</button>
    </div>`;
  $('#copyPeer').addEventListener('click', () => { navigator.clipboard.writeText(peerLink); $('#copyPeer').textContent = 'Copied'; });
  $('#refresh').addEventListener('click', async () => {
    loading('Checking your results');
    try {
      const fresh = await call('johariGetSession', { sessionId: data.sessionId, email });
      fresh.ready ? viewResults(fresh, email) : viewWaiting(fresh, email);
    } catch (e) { viewWaiting(data, email); }
  });
  $('#back').addEventListener('click', () => { history.replaceState(null, '', location.pathname); viewStart(); });
}




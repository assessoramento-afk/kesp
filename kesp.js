// KESP · Etapa 1A · Acesso
(function () {
  'use strict';
  const C = window.KESP_CONFIG;
  const sb = window.supabase.createClient(C.supabaseUrl, C.supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const app = document.getElementById('app');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const urlRetorno = location.origin + location.pathname;

  const K = '<svg width="38" height="38" viewBox="0 0 100 100" aria-hidden="true"><rect width="35" height="100" fill="#1E1B19"/><rect x="35" width="65" height="100" fill="#F07830"/><path d="M100 0 L100 100 L35 50Z" fill="#1E1B19"/></svg>';
  const topo = () => `<div class="icone"><div class="brilho"></div><div class="placa">${K}</div></div>
    <div class="marca"><h1>KESP</h1><div class="traco"></div><p>KOLPING ESTADUAL<br>DE SÃO PAULO</p></div>`;
  const rodape = `<p class="rodape">Acesso restrito à equipe da Kolping Estadual · <a class="link" href="https://claude.ai/artifact/PuGmRehX8ZPqiTgGkGAry8" target="_blank" rel="noopener">Aviso de privacidade</a></p>`;
  const msg = (t, tipo = 'erro') => `<div class="msg ${tipo}" role="alert">${esc(t)}</div>`;

  function traduzir(e) {
    const m = (e && e.message) || '';
    if (/Invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
    if (/Email not confirmed/i.test(m)) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
    if (/não autorizado|Database error saving new user/i.test(m)) return 'Este e-mail não pode pedir acesso. Use seu e-mail institucional ou peça um convite.';
    if (/already registered/i.test(m)) return 'Este e-mail já tem cadastro. Use "Entrar" ou "Esqueci a senha".';
    if (/Password should be at least/i.test(m)) return 'A senha precisa ter pelo menos 8 caracteres.';
    if (/rate limit|too many/i.test(m)) return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
    return 'Algo não saiu como esperado. Tente de novo em alguns instantes.';
  }
  async function registrarErro(tela, e) {
    try { await sb.from('erros_sistema').insert({ tela, mensagem: (e && e.message) || String(e) }); } catch (_) {}
  }
  function ocupado(form, sim) { form.querySelectorAll('button').forEach(b => (b.disabled = sim)); }

  function tirarSplash() { const sp = document.getElementById('splash'); if (sp && !sp.classList.contains('sai')) { sp.classList.add('sai'); setTimeout(() => sp.remove(), 300); } }
  function mostrarColmeia(sim) { document.getElementById('colmeia').style.display = sim ? 'block' : 'none'; }

  // ---------- Telas ----------
  function telaEntrar(aviso) {
    mostrarColmeia(true); tirarSplash();
    app.innerHTML = `${topo()}<form class="cartao" id="f" novalidate>
      ${aviso || ''}
      <label for="em">E-mail</label><input id="em" type="email" autocomplete="username" placeholder="seu.nome@kolpingsp.org" required>
      <label for="pw">Senha</label><input id="pw" type="password" autocomplete="current-password" placeholder="••••••••" required>
      <button class="botao" type="submit">Entrar</button>
      <div class="links"><a id="esq">Esqueci a senha</a><a id="ped">Pedir acesso</a></div>
    </form>${rodape}`;
    const f = document.getElementById('f');
    document.getElementById('esq').onclick = telaEsqueci;
    document.getElementById('ped').onclick = telaPedir;
    f.onsubmit = async ev => {
      ev.preventDefault(); ocupado(f, true);
      const { error } = await sb.auth.signInWithPassword({ email: f.em.value.trim().toLowerCase(), password: f.pw.value });
      ocupado(f, false);
      if (error) telaEntrar(msg(traduzir(error)));
    };
  }

  function telaPedir() {
    app.innerHTML = `${topo()}<form class="cartao" id="f" novalidate>
      <h2>Pedir acesso</h2>
      <label for="nm">Nome completo</label><input id="nm" autocomplete="name" required>
      <label for="em">E-mail institucional</label><input id="em" type="email" autocomplete="email" placeholder="seu.nome@kolpingsp.org" required>
      <label for="pw">Crie uma senha (mínimo 8 caracteres)</label><input id="pw" type="password" autocomplete="new-password" minlength="8" required>
      <button class="botao" type="submit">Enviar pedido</button>
      <button class="botao sec" type="button" id="vol">Voltar</button>
    </form>${rodape}`;
    const f = document.getElementById('f');
    document.getElementById('vol').onclick = () => telaEntrar();
    f.onsubmit = async ev => {
      ev.preventDefault();
      const nome = f.nm.value.trim(), email = f.em.value.trim().toLowerCase(), senha = f.pw.value;
      const erro = !nome ? 'Informe seu nome.' : !/^\S+@\S+\.\S+$/.test(email) ? 'Informe um e-mail válido.' : senha.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : '';
      if (erro) { f.querySelector('.msg')?.remove(); f.insertAdjacentHTML('afterbegin', msg(erro)); return; }
      ocupado(f, true);
      const { error } = await sb.auth.signUp({ email, password: senha, options: { data: { nome }, emailRedirectTo: urlRetorno } });
      ocupado(f, false);
      if (error) { f.querySelector('.msg')?.remove(); f.insertAdjacentHTML('afterbegin', msg(traduzir(error))); return; }
      telaEntrar(msg('Pedido enviado! Confirme seu e-mail pelo link que enviamos. Depois, o administrador libera o seu acesso.', 'ok'));
    };
  }

  function telaEsqueci() {
    app.innerHTML = `${topo()}<form class="cartao" id="f" novalidate>
      <h2>Esqueci a senha</h2>
      <p class="texto">Informe seu e-mail e enviaremos um link para criar uma nova senha.</p>
      <label for="em">E-mail</label><input id="em" type="email" autocomplete="email" required>
      <button class="botao" type="submit">Enviar link</button>
      <button class="botao sec" type="button" id="vol">Voltar</button>
    </form>${rodape}`;
    const f = document.getElementById('f');
    document.getElementById('vol').onclick = () => telaEntrar();
    f.onsubmit = async ev => {
      ev.preventDefault(); ocupado(f, true);
      await sb.auth.resetPasswordForEmail(f.em.value.trim().toLowerCase(), { redirectTo: urlRetorno });
      ocupado(f, false);
      telaEntrar(msg('Se o e-mail estiver cadastrado, você vai receber o link em instantes. Ele vale por 1 hora.', 'ok'));
    };
  }

  function telaNovaSenha() {
    mostrarColmeia(true); tirarSplash();
    app.innerHTML = `${topo()}<form class="cartao" id="f" novalidate>
      <h2>Criar nova senha</h2>
      <label for="pw">Nova senha (mínimo 8 caracteres)</label><input id="pw" type="password" autocomplete="new-password" minlength="8" required>
      <label for="pw2">Repita a nova senha</label><input id="pw2" type="password" autocomplete="new-password" required>
      <button class="botao" type="submit">Salvar senha</button>
    </form>${rodape}`;
    const f = document.getElementById('f');
    f.onsubmit = async ev => {
      ev.preventDefault();
      f.querySelector('.msg')?.remove();
      if (f.pw.value.length < 8 || f.pw.value !== f.pw2.value) { f.insertAdjacentHTML('afterbegin', msg('As senhas precisam ser iguais e ter pelo menos 8 caracteres.')); return; }
      ocupado(f, true);
      const { error } = await sb.auth.updateUser({ password: f.pw.value });
      ocupado(f, false);
      if (error) { f.insertAdjacentHTML('afterbegin', msg(traduzir(error))); return; }
      await sb.auth.signOut();
      telaEntrar(msg('Senha alterada! Entre com a nova senha.', 'ok'));
    };
  }

  function telaAguardando(perfil) {
    mostrarColmeia(true); tirarSplash();
    const recusado = perfil.situacao === 'recusado' || perfil.situacao === 'desativado';
    const data = new Date(perfil.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    app.innerHTML = `${topo()}<div class="cartao" style="text-align:center">
      <h2>${recusado ? 'Acesso não liberado' : 'Seu pedido está em análise'}</h2>
      <p class="texto">${recusado
        ? 'Seu acesso ao KESP não está ativo. Se acha que houve engano, fale com ' + esc(C.admins) + '.'
        : 'Olá' + (perfil.nome ? ', ' + esc(perfil.nome.split(' ')[0]) : '') + '! Recebemos seu pedido. Assim que o administrador liberar, você recebe um e-mail.'}</p>
      ${recusado ? '' : `<div class="passos">
        <div><span class="feito">✓</span>Pedido enviado · ${esc(data)}</div>
        <div><span class="atual">•</span><b style="color:#FFB070;font-weight:500">Em análise pelo administrador</b></div>
        <div style="color:#6E6A7C"><span class="prox"></span>Acesso liberado</div></div>
        <p class="texto" style="margin-top:12px">Dúvidas? Fale com <span style="color:#FFB070">${esc(C.admins)}</span>.</p>`}
      <button class="botao sec" id="sair">Sair</button>
    </div>${rodape}`;
    document.getElementById('sair').onclick = () => sb.auth.signOut();
  }

  function telaInicio(perfil) {
    mostrarColmeia(false);
    window.KESP_APP.iniciar(sb, perfil).then(tirarSplash, tirarSplash);
  }

  // ---------- Fluxo ----------
  async function decidir(session) {
    if (!session) { document.body.classList.remove('logado'); return telaEntrar(); }
    const { data: perfil, error } = await sb.from('perfis').select('*').eq('id', session.user.id).maybeSingle();
    if (error || !perfil) { await registrarErro('login', error || 'perfil não encontrado'); return telaEntrar(msg('Não encontramos seu cadastro. Fale com ' + C.admins + '.')); }
    if (perfil.situacao !== 'ativo') return telaAguardando(perfil);
    telaInicio(perfil);
  }

  sb.auth.onAuthStateChange((evento, session) => {
    if (evento === 'PASSWORD_RECOVERY') return telaNovaSenha();
    const uid = session && session.user ? session.user.id : null;
    if (evento === 'SIGNED_IN' && uid && uid === window.__kespUid) return; // renovação ao voltar para a janela: não recarrega
    if (evento === 'SIGNED_IN' || evento === 'SIGNED_OUT' || evento === 'INITIAL_SESSION') { window.__kespUid = uid; setTimeout(() => decidir(session), 0); }
  });

  // ---------- Colmeia em movimento ----------
  (function colmeia() {
    const c = document.getElementById('colmeia'), x = c.getContext('2d'), dpr = window.devicePixelRatio || 1, R = 18;
    const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W, H, hs = [], t = 0;
    function montar() {
      W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr; hs = [];
      const w = Math.sqrt(3) * R * dpr, h = 1.5 * R * dpr;
      for (let r = -1; r * h < H + h; r++) for (let k = -1; k * w < W + w; k++) hs.push({ x: k * w + (r % 2 ? w / 2 : 0), y: r * h, g: 0 });
    }
    function hex(cx, cy, r) { x.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); x.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } x.closePath(); }
    function quadro() {
      t++; x.clearRect(0, 0, W, H);
      const r = R * dpr * 0.92, onda = (t * 1.2 * dpr) % (H + 300 * dpr) - 150 * dpr;
      for (const p of hs) {
        if (!parado) { if (p.g > 0) p.g -= 0.012; else if (Math.random() < 0.0009) p.g = 1; }
        const wv = parado ? 0 : Math.max(0, 1 - Math.abs(p.y - onda) / (90 * dpr)) * 0.5, gl = Math.max(p.g, wv);
        hex(p.x, p.y, r);
        if (gl > 0.02) { x.fillStyle = 'rgba(240,120,48,' + gl * 0.28 + ')'; x.fill(); }
        x.strokeStyle = 'rgba(240,120,48,' + (0.12 + gl * 0.5) + ')'; x.lineWidth = dpr; x.stroke();
      }
      if (!parado) requestAnimationFrame(quadro);
    }
    montar(); addEventListener('resize', () => { montar(); if (parado) quadro(); }); quadro();
  })();
})();

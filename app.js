// KESP · Etapa 1A · Início, menu e páginas base
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const K = s => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true"><rect width="35" height="100" fill="#1E1B19"/><rect x="35" width="65" height="100" fill="#F07830"/><path d="M100 0 L100 100 L35 50Z" fill="#1E1B19"/></svg>`;
  const KAI = (s, olhos) => `<svg width="${s}" height="${s * 0.9}" viewBox="20 8 80 72" aria-hidden="true"><line x1="60" y1="14" x2="60" y2="24" stroke="#9A9088" stroke-width="2"/><circle cx="60" cy="12" r="5" fill="#F07830"/><rect x="22" y="38" width="8" height="18" rx="3" fill="#F07830"/><rect x="90" y="38" width="8" height="18" rx="3" fill="#F07830"/><rect x="28" y="24" width="64" height="50" rx="18" fill="#F4F1EC"/><rect x="36" y="34" width="48" height="28" rx="12" fill="#2C3045"/>${olhos || '<path d="M45 50 Q50 44 55 50" stroke="#FFB070" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M65 50 Q70 44 75 50" stroke="#FFB070" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M54 55 Q60 59 66 55" stroke="#FFB070" stroke-width="2" fill="none" stroke-linecap="round"/>'}</svg>`;
  const ICONES = { inicio: 'home', agenda: 'calendar', eventos: 'confetti', oficios: 'file-text', documentos: 'folder', fornecedores: 'building-store', comunidades: 'users-group', distritos: 'map-2', recibos: 'receipt', cobranca: 'mail', recadastramento: 'clipboard-check', questionarios: 'list-check', relatorios_ass: 'chart-bar', pedidos: 'shopping-cart', manutencao: 'tool', consumo: 'flame', patrimonio: 'device-laptop', compras: 'package', contas: 'cash', conciliacao: 'building-bank', prestacao: 'file-certificate', nfp: 'receipt-tax', rh: 'id-badge-2', educacao: 'school', usuarios: 'lock', kolping: 'building', sistema: 'heartbeat', andamento: 'progress', manual: 'book', kai: 'message-chatbot' };
  const ETAPAS = [['1A', 'Base essencial'], ['1B', 'Base complementar'], ['2', 'Assessoramento'], ['3', 'Kolping Estadual'], ['4', 'Controles'], ['5', 'Conciliação bancária'], ['6', 'Financeiro'], ['7', 'RH'], ['8', 'Educação Infantil'], ['9', 'Prestação de contas']];
  const FUNCAO_MODULO = { usuarios: 'usuarios.ver', kolping: 'kolping.ver', sistema: 'sistema.saude', inicio: 'inicio.ver', andamento: 'andamento.ver', manual: 'manual.ver', kai: 'kai.usar' };

  let sb, eu, sair, modulos = [], perms = new Set(), avisosN = 0;
  const pode = f => eu.admin || perms.has(f);
  const visivel = m => m.situacao === 'em_breve' ? true : (FUNCAO_MODULO[m.id] ? pode(FUNCAO_MODULO[m.id]) : eu.admin);
  const primeiro = () => (eu.nome || eu.email).split(' ')[0];
  function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
  function saudacao() { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }

  async function carregar() {
    const [m, p, a] = await Promise.all([
      sb.from('modulos').select('*').order('ordem'),
      sb.from('permissoes').select('funcao_id').eq('perfil_id', eu.id),
      sb.from('avisos').select('id', { count: 'exact', head: true }).is('resolvido_em', null)
    ]);
    modulos = m.data || []; perms = new Set((p.data || []).map(x => x.funcao_id)); avisosN = a.count || 0;
  }

  function moldura() {
    const app = document.getElementById('app');
    document.body.classList.add('logado');
    const secoes = []; modulos.filter(visivel).forEach(m => { let s = secoes.find(x => x.n === m.secao); if (!s) secoes.push(s = { n: m.secao, i: [] }); s.i.push(m); });
    const menu = secoes.map(s => `<div class="sec">${esc(s.n)}</div>` + s.i.map(m => `<a class="it" data-r="${m.id}"><i class="ti ti-${ICONES[m.id] || 'point'}"></i>${esc(m.nome)}${m.situacao === 'em_breve' ? '<span class="eb">Em breve</span>' : m.situacao === 'manutencao' ? '<span class="mn">Manutenção</span>' : ''}</a>`).join('')).join('');
    const ini = (eu.nome || eu.email).split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
    app.innerHTML = `<div class="sh"><nav class="lat" id="lat"><div style="display:flex;align-items:center;gap:10px;padding:4px 10px 8px"><div class="ik">${K(16)}</div><b style="letter-spacing:3px">KESP</b></div>${menu}</nav>
      <div class="cp"><header class="topo"><div class="ik">${K(16)}</div>
        <div style="flex:1;min-width:0"><div style="font-weight:600;letter-spacing:2px">KESP</div><div class="sm" style="font-size:11px">${saudacao()}, ${esc(primeiro())}</div></div>
        <button class="bi" id="qr" aria-label="Ler código"><i class="ti ti-scan"></i></button>
        <button class="bi" id="sino" aria-label="Avisos"><i class="ti ti-bell"></i>${avisosN ? `<span class="ct">${avisosN}</span>` : ''}</button>
        <div class="av" id="perfil" role="button" aria-label="Perfil">${eu.foto_url ? `<img src="${esc(eu.foto_url)}" alt="">` : esc(ini)}</div></header>
        <main class="pg" id="pg"></main></div></div>
      <nav class="nv"><a data-r="inicio"><i class="ti ti-home"></i>Início</a><a data-acao="busca"><i class="ti ti-search"></i>Busca</a><a data-r="kai"><i class="ti ti-message-chatbot"></i>KAI</a><a data-acao="avisos"><i class="ti ti-bell"></i>Avisos${avisosN ? `<span class="ct">${avisosN}</span>` : ''}</a><a data-acao="menu"><i class="ti ti-menu-2"></i>Menu</a></nav>
      <div class="mn-fundo" id="fundo"><div class="mn-pop" id="pop"></div></div>`;
    app.querySelectorAll('[data-r]').forEach(a => a.onclick = () => { location.hash = '#' + a.dataset.r; document.getElementById('lat').classList.remove('ab'); document.getElementById('fundo').classList.remove('ab'); });
    const fundo = document.getElementById('fundo'), lat = document.getElementById('lat');
    app.querySelector('[data-acao="menu"]').onclick = () => { lat.classList.add('ab'); fundo.classList.add('ab'); document.getElementById('pop').style.display = 'none'; };
    fundo.onclick = e => { if (e.target === fundo) { fundo.classList.remove('ab'); lat.classList.remove('ab'); } };
    app.querySelector('[data-acao="busca"]').onclick = () => toast('A busca geral chega na próxima parte da construção.');
    const avisos = () => toast(avisosN ? `Você tem ${avisosN} aviso(s). O sino completo chega na etapa 1B.` : 'Nenhum aviso pendente.');
    app.querySelector('[data-acao="avisos"]').onclick = avisos; document.getElementById('sino').onclick = avisos;
    document.getElementById('qr').onclick = () => toast('O leitor de QR Code chega na etapa 1B.');
    document.getElementById('perfil').onclick = () => {
      const pop = document.getElementById('pop'); pop.style.display = 'block'; lat.classList.remove('ab');
      pop.innerHTML = `<div style="padding:8px 10px"><b>${esc(eu.nome || eu.email)}</b><div class="sm">${esc(eu.cargo || '')}${eu.admin ? ' · Administrador' : ''}</div></div>
        <a class="it" id="pBv"><i class="ti ti-sparkles"></i>Rever boas-vindas</a><a class="it" id="pSair"><i class="ti ti-logout"></i>Sair</a>`;
      fundo.classList.add('ab');
      document.getElementById('pSair').onclick = async () => { fundo.classList.remove('ab'); await sb.auth.signOut(); };
      document.getElementById('pBv').onclick = () => { fundo.classList.remove('ab'); boasVindas(true); };
    };
  }

  // ---------- Páginas ----------
  function pagInicio() {
    const em = modulos.filter(m => m.situacao === 'em_breve');
    const geral = progressoGeral();
    const cards = [];
    if (eu.admin) cards.push(`<div class="cd" style="--c:#F07830"><div class="hd"><span>EQUIPE</span></div><div class="big" id="cAg">…</div><div class="sm">aguardando liberação de acesso</div></div>`);
    cards.push(`<div class="cd" style="--c:#22C984;cursor:pointer" data-ir="andamento"><div class="hd"><span>ANDAMENTO DO KESP</span><span class="pl" style="background:rgba(34,201,132,.15);color:#5FE0A8">Etapa 1A</span></div><div class="big">${geral}%</div><div class="br" style="--c:#22C984"><i style="width:${geral}%"></i></div></div>`);
    cards.push(`<div class="cd" style="--c:#3B82F6"><div class="hd"><span>NOVIDADES</span></div><div id="cNov" class="sm">…</div></div>`);
    const areas = [['ASSESSORAMENTO', 'Etapa 2'], ['UNIDADES E COMPRAS', 'Etapa 4'], ['FINANCEIRO', 'Etapa 6'], ['EDUCAÇÃO INFANTIL', 'Etapa 8']];
    areas.forEach(([n, e]) => cards.push(`<div class="cd ap"><div class="hd"><span>${n}</span><span class="pl" style="background:rgba(255,255,255,.08);color:#A8A3B4">Em breve</span></div><div class="sm">Chega na ${e.toLowerCase()} do KESP</div></div>`));
    document.getElementById('pg').innerHTML = `<h1>Início</h1><p class="sub">${saudacao()}, ${esc(primeiro())}. ${em.length} módulos a caminho.</p><div class="gr">${cards.join('')}</div>`;
    document.querySelectorAll('[data-ir]').forEach(c => c.onclick = () => (location.hash = '#' + c.dataset.ir));
    if (eu.admin) sb.from('perfis').select('id', { count: 'exact', head: true }).eq('situacao', 'aguardando').then(r => { const el = document.getElementById('cAg'); if (el) el.textContent = r.count || 0; });
    sb.from('novidades').select('*').order('publicado_em', { ascending: false }).limit(3).then(r => { const el = document.getElementById('cNov'); if (el) el.innerHTML = (r.data || []).map(n => `<div style="padding:3px 0"><b style="color:#F2EEEA">${esc(n.titulo)}</b><br>${esc(n.texto || '')}</div>`).join('') || 'Nenhuma novidade ainda.'; });
  }

  function progressoEtapa(e) { const ms = modulos.filter(m => m.etapa === e); if (!ms.length) return 0; return Math.round(ms.reduce((t, m) => t + (m.percentual || 0), 0) / ms.length); }
  function progressoGeral() { return Math.round(ETAPAS.reduce((t, [e]) => t + progressoEtapa(e), 0) / ETAPAS.length); }

  function pagAndamento() {
    const linhas = ETAPAS.map(([e, n]) => { const p = progressoEtapa(e); return `<div class="lin"><div style="display:flex;justify-content:space-between"><span>${e} · ${esc(n)}</span><span style="color:${p ? '#FFB070' : '#A8A3B4'}">${p}%</span></div><div class="br"><i style="width:${p}%"></i></div></div>`; }).join('');
    document.getElementById('pg').innerHTML = `<h1>Andamento do KESP</h1><p class="sub">Etapa atual: 1A · Base essencial</p><div class="gr" style="grid-template-columns:1fr"><div class="cd" style="--c:#F07830">${linhas}</div><div class="cd" style="--c:#22C984"><div class="hd"><span>NOVIDADES</span></div><div id="nAll" class="sm">…</div></div></div>`;
    sb.from('novidades').select('*').order('publicado_em', { ascending: false }).then(r => { document.getElementById('nAll').innerHTML = (r.data || []).map(n => `<div class="lin"><b style="color:#F2EEEA">${esc(n.titulo)}</b> <span class="sm">· ${new Date(n.publicado_em + 'T12:00').toLocaleDateString('pt-BR')}</span><br>${esc(n.texto || '')}${n.sugerido_por ? `<br><i>Sugestão de ${esc(n.sugerido_por)}</i>` : ''}</div>`).join('') || 'Nenhuma novidade ainda.'; });
  }

  function pagEmBreve(m) {
    document.getElementById('pg').innerHTML = `<div class="vazio">${KAI(70)}<h1 style="margin-top:8px">${esc(m.nome)} está a caminho!</h1><p class="sub">Chega na <b style="color:#FFB070">etapa ${esc(m.etapa)}</b> do KESP</p>
      <div class="cd" style="--c:#F07830;max-width:420px;margin:0 auto;text-align:left"><div class="hd"><span>O QUE ELE VAI FAZER</span></div><p style="margin:0;color:#D8D3DE">${esc(m.resumo || '')}</p><div class="hd" style="margin-top:12px"><span>ANDAMENTO · ${m.percentual}%</span></div><div class="br"><i style="width:${Math.max(2, m.percentual)}%"></i></div></div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:14px"><button class="btn sec" onclick="location.hash='#andamento'">Ver andamento</button><button class="btn" id="sug">Enviar sugestão</button></div></div>`;
    document.getElementById('sug').onclick = () => toast('O canal de sugestões chega na etapa 1B.');
  }

  function pagManutencao(m) {
    document.getElementById('pg').innerHTML = `<div class="vazio">${KAI(70)}<h1>${esc(m.nome)} está em manutenção</h1><p class="sub">${esc(m.motivo_manutencao || 'Estamos ajustando este módulo.')}${m.previsao_retorno ? ' Volta em ' + new Date(m.previsao_retorno + 'T12:00').toLocaleDateString('pt-BR') + '.' : ''}</p><p class="sm">O restante do KESP continua funcionando normalmente.</p></div>`;
  }

  function pagConstrucao(m) {
    document.getElementById('pg').innerHTML = `<div class="vazio">${KAI(70)}<h1>${esc(m.nome)}</h1><p class="sub">Esta tela é a próxima parte da construção da etapa 1A.</p></div>`;
  }

  function pagSemAcesso() {
    document.getElementById('pg').innerHTML = `<div class="vazio">${KAI(70)}<h1>Área não liberada</h1><p class="sub">Essa área não está liberada para o seu acesso. Se precisar dela, fale com o administrador.</p></div>`;
  }

  function rota() {
    const id = (location.hash || '#inicio').slice(1) || 'inicio';
    document.querySelectorAll('[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === id));
    const m = modulos.find(x => x.id === id) || modulos.find(x => x.id === 'inicio');
    if (!m) return pagInicio();
    if (!visivel(m)) return pagSemAcesso();
    if (m.situacao === 'em_breve') return pagEmBreve(m);
    if (m.situacao === 'manutencao') return pagManutencao(m);
    if (m.id === 'inicio') return pagInicio();
    if (m.id === 'andamento') return pagAndamento();
    pagConstrucao(m);
    window.scrollTo(0, 0);
  }

  // ---------- Boas-vindas ----------
  async function boasVindas(revisao) {
    const { data: feitos } = await sb.from('trilha_concluida').select('passo').eq('perfil_id', eu.id);
    const ok = new Set((feitos || []).map(x => x.passo));
    if (eu.foto_url) ok.add('foto'); if (eu.assinatura_url) ok.add('assinatura');
    const passos = [['foto', 'Colocar sua foto no perfil'], ['assinatura', 'Cadastrar sua assinatura'], ['notificacoes', 'Ativar as notificações no celular'], ['instalar', 'Instalar o KESP na tela inicial']];
    const meus = modulos.filter(m => m.situacao === 'ativo' && visivel(m) && !['inicio', 'manual', 'kai', 'andamento'].includes(m.id)).map(m => `<span class="ch">${esc(m.nome)}</span>`).join('') || '<span class="sm">Os módulos da sua função vão aparecendo aqui conforme forem liberados.</span>';
    const d = document.createElement('div'); d.className = 'bv';
    d.innerHTML = `<div class="cx"><div style="display:flex;gap:12px;align-items:center">${KAI(56)}<div><div style="font-size:11px;color:#FFB070;letter-spacing:.08em">BEM-VINDO(A) AO KESP</div><div style="font-size:19px;font-weight:600">Olá, ${esc(primeiro())}!</div></div></div>
      <p class="sm" style="color:#D8D3DE;line-height:1.55;margin:12px 0 0">Este é o novo sistema de gestão da Kolping Estadual de São Paulo. Aqui estão reunidas, num só lugar, as ferramentas do nosso trabalho do dia a dia, para deixar tudo mais simples, organizado e fácil de encontrar.</p>
      <p class="sm" style="color:#D8D3DE;line-height:1.55;margin:8px 0 0">Eu sou a <b style="color:#FFB070">KAI</b>, a assistente do KESP. Sempre que tiver uma dúvida sobre como usar o sistema, é só tocar no meu botão e perguntar.</p>
      <p class="sm" style="letter-spacing:.06em;margin:14px 0 6px">PARA VOCÊ, O KESP JÁ TEM</p>${meus}
      <p class="sm" style="letter-spacing:.06em;margin:14px 0 6px">ANTES DE COMEÇAR, QUE TAL</p>
      ${passos.map(([k, t]) => `<div class="ps"><span class="bx ${ok.has(k) ? 'on' : ''}" data-p="${k}">${ok.has(k) ? '✓' : ''}</span>${t}</div>`).join('')}
      <p class="sm" style="margin:12px 0 0">O KESP está sendo construído em etapas. Acompanhe na página <a style="color:#FFB070;cursor:pointer" id="bvAnd">Andamento do KESP</a>.</p>
      <div style="display:flex;gap:8px;margin-top:14px"><button class="btn sec" style="flex:1" id="bvTour">Fazer o tour</button><button class="btn" style="flex:1" id="bvOk">Começar</button></div></div>`;
    document.body.appendChild(d);
    d.querySelectorAll('.bx').forEach(b => b.onclick = async () => {
      if (b.classList.contains('on')) return; b.classList.add('on'); b.textContent = '✓';
      await sb.from('trilha_concluida').insert({ perfil_id: eu.id, passo: b.dataset.p });
    });
    const fechar = async () => { d.remove(); if (!revisao && !eu.boas_vindas_vistas) { eu.boas_vindas_vistas = true; await sb.from('perfis').update({ boas_vindas_vistas: true }).eq('id', eu.id); } };
    d.querySelector('#bvOk').onclick = fechar;
    d.querySelector('#bvTour').onclick = () => { toast('O tour guiado chega junto com os primeiros módulos.'); fechar(); };
    d.querySelector('#bvAnd').onclick = () => { fechar(); location.hash = '#andamento'; };
  }

  window.KESP_APP = {
    async iniciar(cliente, perfil, aoSair) {
      sb = cliente; eu = perfil; sair = aoSair;
      try { await carregar(); } catch (e) { try { await sb.from('erros_sistema').insert({ tela: 'inicio', mensagem: String(e && e.message || e) }); } catch (_) {} }
      moldura();
      window.onhashchange = rota; rota();
      if (!eu.boas_vindas_vistas) boasVindas(false);
    }
  };
})();

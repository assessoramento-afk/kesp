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
    const vis = modulos.filter(visivel), prontos = vis.filter(m => m.situacao !== 'em_breve'), futuros = vis.filter(m => m.situacao === 'em_breve');
    const item = (m, sub) => `<a class="it${sub ? ' sub' : ''}" data-r="${m.id}"><i class="ti ti-${ICONES[m.id] || 'point'}"></i><b>${esc(m.nome)}</b>${m.situacao === 'manutencao' ? '<span class="mn">Manutenção</span>' : ''}</a>`;
    const agrupar = lista => { const g = []; lista.forEach(m => { let s = g.find(x => x.n === m.secao); if (!s) g.push(s = { n: m.secao, i: [] }); s.i.push(m); }); return g; };
    const topo = prontos.filter(m => m.id === 'inicio' || m.id === 'kai');
    let menu = topo.map(m => item(m)).join('') + agrupar(prontos.filter(m => m.id !== 'inicio' && m.id !== 'kai')).map(s => `<div class="sec">${esc(s.n)}</div>` + s.i.map(m => item(m)).join('')).join('');
    let caminhoAberto = false; try { caminhoAberto = localStorage.getItem('kesp.menu.caminho') === '1'; } catch (_) {}
    if (futuros.length) menu += `<div class="sec">Próximas etapas</div><a class="it fut" id="caminho"><i class="ti ti-hourglass"></i><b>A caminho</b><span class="eb">${futuros.length}</span><span class="cv">${caminhoAberto ? '⌄' : '›'}</span></a>
      <div class="grp" id="grpCaminho"${caminhoAberto ? '' : ' hidden'}>` + agrupar(futuros).map(s => `<div class="sub-t">${esc(s.n)}</div>` + s.i.map(m => item(m, true)).join('')).join('') + '</div>';
    const ini = (eu.nome || eu.email).split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
    app.innerHTML = `<div class="sh"><nav class="lat" id="lat"><div style="display:flex;align-items:center;gap:10px;padding:4px 10px 8px"><div class="ik">${K(16)}</div><b style="letter-spacing:3px">KESP</b></div>${menu}</nav>
      <div class="cp"><header class="topo"><div class="ik">${K(16)}</div>
        <div style="flex:1;min-width:0;font-size:15px;font-weight:600">${saudacao()}, ${esc(primeiro())}</div>
        <button class="bi" id="qr" aria-label="Ler código"><i class="ti ti-scan"></i></button>
        <button class="bi" id="sino" aria-label="Avisos"><i class="ti ti-bell"></i>${avisosN ? `<span class="ct">${avisosN}</span>` : ''}</button>
        <div class="av" id="perfil" role="button" aria-label="Perfil">${eu.foto_url ? `<img src="${esc(eu.foto_url)}" alt="">` : esc(ini)}</div></header>
        <main class="pg" id="pg"></main></div></div>
      <nav class="nv"><a data-r="inicio"><i class="ti ti-home"></i>Início</a><a data-acao="busca"><i class="ti ti-search"></i>Busca</a><a data-r="kai"><i class="ti ti-message-chatbot"></i>KAI</a><a data-acao="avisos"><i class="ti ti-bell"></i>Avisos${avisosN ? `<span class="ct">${avisosN}</span>` : ''}</a><a data-acao="menu"><i class="ti ti-menu-2"></i>Menu</a></nav>
      <div class="mn-fundo" id="fundo"><div class="mn-pop" id="pop"></div></div>`;
    app.querySelectorAll('[data-r]').forEach(a => a.onclick = () => { location.hash = '#' + a.dataset.r; document.getElementById('lat').classList.remove('ab'); document.getElementById('fundo').classList.remove('ab'); });
    const fundo = document.getElementById('fundo'), lat = document.getElementById('lat');
    const cam = document.getElementById('caminho');
    if (cam) cam.onclick = () => { const g = document.getElementById('grpCaminho'); g.hidden = !g.hidden; cam.querySelector('.cv').textContent = g.hidden ? '›' : '⌄'; try { localStorage.setItem('kesp.menu.caminho', g.hidden ? '0' : '1'); } catch (_) {} };
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
    const em = modulos.filter(m => m.situacao === 'em_breve' && visivel(m));
    const geral = progressoGeral(), p1a = progressoEtapa('1A');
    const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const at = eu.admin
      ? [['usuarios', 'user-check', 'Liberar acessos'], ['usuarios', 'lock', 'Permissões'], ['kolping', 'building', 'Cadastro da Kolping'], ['kai', 'message-chatbot', 'Conversar com a KAI']]
      : [['kai', 'message-chatbot', 'Conversar com a KAI'], ['andamento', 'progress', 'Andamento do KESP'], ['manual', 'book', 'Manual'], ['#bv', 'sparkles', 'Rever boas-vindas']];
    const grupos = []; em.forEach(m => { let g = grupos.find(x => x.n === m.secao); if (!g) grupos.push(g = { n: m.secao, e: m.etapa }); });
    const etapas = ETAPAS.slice(0, 4).map(([e]) => { const p = progressoEtapa(e); return `<div class="et"><b${p ? '' : ' class="sm"'}>${e}</b><div class="br"><i style="width:${p}%"></i></div><span class="sm">${p}%</span></div>`; }).join('');
    const c1 = eu.admin
      ? `<div class="cd" style="--c:#F07830;cursor:pointer" data-ir="usuarios"><div class="hd"><span>ACESSOS</span></div><div class="big" id="cAg">…</div><div class="sm">aguardando liberação</div><div class="sm" style="margin-top:6px" id="cAt"></div></div>`
      : `<div class="cd" style="--c:#F07830"><div class="hd"><span>SEUS PRIMEIROS PASSOS</span></div><div class="big" id="cTr">…</div><div class="sm">de 4 concluídos</div></div>`;
    document.getElementById('pg').innerHTML = `<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px"><h1>Início</h1><span class="sm">${esc(hoje.charAt(0).toUpperCase() + hoje.slice(1))}</span></div><p class="sub">${em.length} módulos a caminho.</p>
      <div class="g4">${c1}
        <div class="cd" style="--c:#22C984;cursor:pointer" data-ir="andamento"><div class="hd"><span>ANDAMENTO</span><span class="pl" style="background:rgba(34,201,132,.15);color:#5FE0A8">Etapa 1A</span></div><div class="big">${geral}%</div><div class="br" style="--c:#22C984"><i style="width:${geral}%"></i></div><div class="sm" style="margin-top:6px">Etapa 1A em ${p1a}%</div></div>
        <div class="cd s2" style="--c:#3B82F6"><div class="hd"><span>ATALHOS</span></div><div class="atl">${at.map(([r, i, t]) => `<a data-${r === '#bv' ? 'bv' : 'ir'}="${r}"><i class="ti ti-${i}"></i>${t}</a>`).join('')}</div></div>
        <div class="cd s2" style="--c:#F07830"><div class="hd"><span>ETAPAS DO KESP</span><a class="lk" data-ir="andamento">ver tudo ›</a></div>${etapas}</div>
        <div class="cd s2" style="--c:#6E6A7C"><div class="hd"><span>A CAMINHO</span><span>${em.length} módulos</span></div><div class="acm">${grupos.map(g => `<div><span>${esc(g.n)}</span><span class="sm">etapa ${esc(g.e)}</span></div>`).join('') || '<span class="sm">Tudo pronto!</span>'}</div></div>
        <div class="cd s4" style="--c:#3B82F6"><div class="hd"><span>NOVIDADES</span></div><div id="cNov" class="sm">…</div></div>
      </div>`;
    document.querySelectorAll('[data-ir]').forEach(c => c.onclick = e => { e.stopPropagation(); location.hash = '#' + c.dataset.ir; });
    document.querySelectorAll('[data-bv]').forEach(c => c.onclick = () => boasVindas(true));
    if (eu.admin) {
      sb.from('perfis').select('id', { count: 'exact', head: true }).eq('situacao', 'aguardando').then(r => { const el = document.getElementById('cAg'); if (el) el.textContent = r.count || 0; });
      sb.from('perfis').select('id', { count: 'exact', head: true }).eq('situacao', 'ativo').then(r => { const el = document.getElementById('cAt'); if (el) el.textContent = (r.count || 0) + (r.count === 1 ? ' pessoa ativa' : ' pessoas ativas'); });
    } else {
      sb.from('trilha_concluida').select('passo').eq('perfil_id', eu.id).then(r => { const el = document.getElementById('cTr'); if (el) el.textContent = Math.min(4, (r.data || []).length); });
    }
    sb.from('novidades').select('*').order('publicado_em', { ascending: false }).limit(3).then(r => { const el = document.getElementById('cNov'); if (el) el.innerHTML = (r.data || []).map(n => `<div style="padding:3px 0"><b style="color:#F2EEEA">${esc(n.titulo)}</b> · ${esc(n.texto || '')}</div>`).join('') || 'Nenhuma novidade ainda.'; });
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
    const atual = document.querySelector('.lat [data-r="' + id + '"]'); if (atual && atual.parentElement.hidden) document.getElementById('caminho').click();
    const m = modulos.find(x => x.id === id) || modulos.find(x => x.id === 'inicio');
    if (!m) return pagInicio();
    if (!visivel(m)) return pagSemAcesso();
    if (m.situacao === 'em_breve') return pagEmBreve(m);
    if (m.situacao === 'manutencao') return pagManutencao(m);
    if (m.id === 'inicio') return pagInicio();
    if (m.id === 'andamento') return pagAndamento();
    if (m.id === 'usuarios' && window.KESP_USUARIOS) return window.KESP_USUARIOS.abrir(sb, eu);
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

// ===================== Usuários e permissões =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CARGOS = ['Assistente de Coordenação', 'Gestor Administrativo', 'Coordenadora Administrativa', 'Analista Administrativa', 'Técnica de Projetos', 'Coordenadora Pedagógica'];
  const COR = { aguardando: '#F07830', ativo: '#22C984', recusado: '#6E6A7C', desativado: '#E5484D' };
  const NOME_SIT = { aguardando: 'Aguardando liberação', ativo: 'Ativo', recusado: 'Recusado', desativado: 'Desativado' };
  let sb, eu, aba = 'pessoas', perfis = [], funcoes = [], modulos = [], perm = new Map(), orig = new Map(), filtro = '', busca = '';

  function confirmar(titulo, texto, ok = 'Confirmar') {
    return new Promise(res => {
      const d = document.createElement('div'); d.className = 'conf';
      d.innerHTML = `<div class="cx"><b>${esc(titulo)}</b><p class="sm" style="margin:6px 0 14px;line-height:1.5">${esc(texto)}</p><div style="display:flex;gap:8px"><button class="btn sec" style="flex:1" data-v="0">Cancelar</button><button class="btn" style="flex:1" data-v="1">${esc(ok)}</button></div></div>`;
      d.onclick = e => { const v = e.target.dataset && e.target.dataset.v; if (v !== undefined) { d.remove(); res(v === '1'); } };
      document.body.appendChild(d);
    });
  }
  function escolherCargo(p) {
    return new Promise(res => {
      const d = document.createElement('div'); d.className = 'conf';
      d.innerHTML = `<div class="cx"><b>Liberar ${esc(p.nome || p.email)}</b><p class="sm" style="margin:6px 0 10px">Escolha o cargo. As permissões do modelo do cargo são aplicadas e podem ser ajustadas depois.</p>
        <select class="in" id="cg" style="width:100%;margin-bottom:14px">${CARGOS.map(c => `<option${p.cargo === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
        <div style="display:flex;gap:8px"><button class="btn sec" style="flex:1" data-v="0">Cancelar</button><button class="btn" style="flex:1" data-v="1">Liberar acesso</button></div></div>`;
      d.onclick = e => { const v = e.target.dataset && e.target.dataset.v; if (v !== undefined) { const c = d.querySelector('#cg').value; d.remove(); res(v === '1' ? c : null); } };
      document.body.appendChild(d);
    });
  }
  const chave = (p, f) => p + '|' + f;

  async function carregar() {
    const [a, b, c, d] = await Promise.all([
      sb.from('perfis').select('*').order('nome'),
      sb.from('funcoes').select('*').order('ordem'),
      sb.from('modulos').select('*').order('ordem'),
      sb.from('permissoes').select('perfil_id,funcao_id')
    ]);
    perfis = a.data || []; funcoes = b.data || []; modulos = c.data || [];
    perm = new Map(); (d.data || []).forEach(x => perm.set(chave(x.perfil_id, x.funcao_id), true)); orig = new Map(perm);
  }

  function render() {
    const pg = document.getElementById('pg');
    const ag = perfis.filter(p => p.situacao === 'aguardando').length;
    pg.innerHTML = `<h1>Usuários e permissões</h1><p class="sub">${perfis.filter(p => p.situacao === 'ativo').length} pessoas ativas${ag ? ` · <b style="color:#FFB070">${ag} aguardando liberação</b>` : ''}</p>
      <div class="abas"><a data-a="pessoas" class="${aba === 'pessoas' ? 'on' : ''}">Pessoas</a><a data-a="permissoes" class="${aba === 'permissoes' ? 'on' : ''}">Permissões</a><a data-a="historico" class="${aba === 'historico' ? 'on' : ''}">Histórico</a></div><div id="cont"></div>`;
    pg.querySelectorAll('[data-a]').forEach(x => x.onclick = () => { aba = x.dataset.a; render(); });
    ({ pessoas: abaPessoas, permissoes: abaPermissoes, historico: abaHistorico })[aba]();
  }

  // ---------- Pessoas ----------
  function abaPessoas() {
    const ordem = { aguardando: 0, ativo: 1, desativado: 2, recusado: 3 };
    const lista = [...perfis].sort((a, b) => ordem[a.situacao] - ordem[b.situacao] || (a.nome || a.email).localeCompare(b.nome || b.email, 'pt-BR'));
    document.getElementById('cont').innerHTML = lista.map(p => {
      const ini = (p.nome || p.email).split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
      let ac = '';
      if (p.id !== eu.id) {
        if (p.situacao === 'aguardando') ac = `<button class="mini" data-f="liberar" data-id="${p.id}">Liberar</button><button class="mini ver" data-f="recusar" data-id="${p.id}">Recusar</button>`;
        else if (p.situacao === 'ativo') ac = `<button class="mini neu" data-f="cargo" data-id="${p.id}">Cargo</button><button class="mini neu" data-f="admin" data-id="${p.id}">${p.admin ? 'Tirar admin' : 'Tornar admin'}</button><button class="mini ver" data-f="desativar" data-id="${p.id}">Desativar</button>`;
        else ac = `<button class="mini" data-f="reativar" data-id="${p.id}">Reativar</button>`;
      }
      return `<div class="pe" style="--c:${COR[p.situacao]}"><div class="av">${esc(ini)}</div><div style="flex:1;min-width:0"><b>${esc(p.nome || '(sem nome)')}</b>${p.admin ? ' <span class="pl" style="background:rgba(240,120,48,.15);color:#FFB070">Admin</span>' : ''}${p.externo ? ' <span class="pl" style="background:rgba(59,130,246,.15);color:#93B8FF">Externo</span>' : ''}
        <div class="sm">${esc(p.email)} · ${esc(p.cargo || 'sem cargo')}</div><div class="sm" style="color:${COR[p.situacao]}">${NOME_SIT[p.situacao]}</div></div><div class="ac">${ac}</div></div>`;
    }).join('') || '<p class="sm">Nenhuma pessoa cadastrada.</p>';
    document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => acao(b.dataset.f, perfis.find(p => p.id === b.dataset.id)));
  }

  async function acao(f, p) {
    let r;
    if (f === 'liberar') {
      const cargo = await escolherCargo(p); if (!cargo) return;
      r = await sb.from('perfis').update({ situacao: 'ativo', cargo }).eq('id', p.id);
      if (!r.error) {
        const { data: mod } = await sb.from('modelos_cargo').select('funcao_id').eq('cargo', cargo);
        if (mod && mod.length) await sb.from('permissoes').insert(mod.map(m => ({ perfil_id: p.id, funcao_id: m.funcao_id, concedido_por: eu.id })));
        await sb.from('avisos').update({ resolvido_em: new Date().toISOString() }).is('destinatario', null).is('resolvido_em', null).eq('texto', p.email);
      }
    } else if (f === 'recusar') {
      if (!await confirmar('Recusar o pedido?', `${p.nome || p.email} não terá acesso ao KESP.`, 'Recusar')) return;
      r = await sb.from('perfis').update({ situacao: 'recusado' }).eq('id', p.id);
      await sb.from('avisos').update({ resolvido_em: new Date().toISOString() }).is('destinatario', null).is('resolvido_em', null).eq('texto', p.email);
    } else if (f === 'desativar') {
      if (!await confirmar('Desativar este usuário?', `${p.nome || p.email} perde o acesso ao KESP na hora. Lembre do checklist de saída: senhas compartilhadas, equipamentos e tarefas.`, 'Desativar')) return;
      r = await sb.from('perfis').update({ situacao: 'desativado' }).eq('id', p.id);
    } else if (f === 'reativar') {
      r = await sb.from('perfis').update({ situacao: 'ativo' }).eq('id', p.id);
    } else if (f === 'admin') {
      if (!await confirmar(p.admin ? 'Tirar de administrador?' : 'Tornar administrador?', p.admin ? 'A pessoa deixa de liberar acessos e mudar permissões.' : 'A pessoa poderá liberar acessos, mudar permissões e configurações do sistema.', 'Confirmar')) return;
      r = await sb.from('perfis').update({ admin: !p.admin }).eq('id', p.id);
    } else if (f === 'cargo') {
      const cargo = await escolherCargo(p); if (!cargo) return;
      r = await sb.from('perfis').update({ cargo }).eq('id', p.id);
    }
    if (r && r.error) { alert('Não foi possível concluir. Tente de novo.'); try { await sb.from('erros_sistema').insert({ tela: 'usuarios', mensagem: r.error.message }); } catch (_) {} }
    await carregar(); render();
  }

  // ---------- Permissões ----------
  function abaPermissoes() {
    const pessoas = perfis.filter(p => p.situacao === 'ativo').sort((a, b) => (a.nome || a.email).localeCompare(b.nome || b.email, 'pt-BR'));
    const secoes = [...new Set(modulos.filter(m => funcoes.some(f => f.modulo_id === m.id)).map(m => m.secao))];
    const cols = `minmax(180px,220px) repeat(${pessoas.length},64px)`;
    const ini = p => (p.nome || p.email).split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
    let html = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><input class="in" id="bus" placeholder="Buscar função" value="${esc(busca)}" style="flex:1;min-width:160px">
      <select class="in" id="fil"><option value="">Todas as seções</option>${secoes.map(s => `<option${filtro === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></div>`;
    modulos.filter(m => (!filtro || m.secao === filtro)).forEach(m => {
      const fs = funcoes.filter(f => f.modulo_id === m.id && (!busca || f.descricao.toLowerCase().includes(busca.toLowerCase())));
      if (!fs.length) return;
      const nTem = pessoas.filter(p => p.admin || fs.some(f => perm.get(chave(p.id, f.id)))).length;
      html += `<div class="bloco"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div><b>${esc(m.nome)}</b><div class="sm">${esc(m.secao)} · ${nTem} de ${pessoas.length} pessoas</div></div></div>
        <div class="tab"><div class="tg" style="grid-template-columns:${cols}"><span class="nm" style="background:transparent"></span>${pessoas.map(p => `<span class="col"><span class="av" style="margin:0 auto 3px;width:30px;height:30px;font-size:11px">${esc(ini(p))}</span>${esc((p.nome || p.email).split(' ')[0])}</span>`).join('')}
        <span class="nm ds">Módulo inteiro</span>${pessoas.map(p => { const todos = fs.every(f => p.admin || perm.get(chave(p.id, f.id))); return `<button class="chv ${todos ? 'on' : 'off'}${p.admin ? ' trava' : ''}" data-mod="${m.id}" data-p="${p.id}" aria-label="Módulo inteiro"><i>${todos ? '✓' : '✕'}</i></button>`; }).join('')}
        ${fs.map(f => `<span class="nm">${esc(f.descricao)}${f.sensivel ? '<span class="sens">Sensível</span>' : ''}</span>${pessoas.map(p => { const on = p.admin || perm.get(chave(p.id, f.id)); const mud = !p.admin && !!perm.get(chave(p.id, f.id)) !== !!orig.get(chave(p.id, f.id)); return `<button class="chv ${on ? 'on' : 'off'}${p.admin ? ' trava' : ''}${mud ? ' mud' : ''}" data-f="${f.id}" data-p="${p.id}" data-s="${f.sensivel ? 1 : ''}" aria-label="${esc(f.descricao)}"><i>${on ? '✓' : '✕'}</i></button>`; }).join('')}`).join('')}
        </div></div></div>`;
    });
    html += `<p class="sm">Administradores têm todas as permissões (botões travados).</p><div class="salvar" id="sv"><span style="flex:1" id="svt"></span><button class="mini neu" id="dsc">Descartar</button><button class="mini" id="slv">Salvar</button></div>`;
    document.getElementById('cont').innerHTML = html;
    const bus = document.getElementById('bus'); bus.oninput = () => { busca = bus.value; abaPermissoes(); const n = document.getElementById('bus'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
    document.getElementById('fil').onchange = e => { filtro = e.target.value; abaPermissoes(); };
    document.querySelectorAll('.chv[data-f]').forEach(b => b.onclick = async () => {
      const p = perfis.find(x => x.id === b.dataset.p); if (p.admin) return;
      const k = chave(b.dataset.p, b.dataset.f), on = !!perm.get(k);
      if (!on && b.dataset.s && !await confirmar('Liberar uma ação sensível?', 'Essa permissão dá acesso a dados ou ações que pedem mais cuidado.', 'Liberar')) return;
      on ? perm.delete(k) : perm.set(k, true); abaPermissoes();
    });
    document.querySelectorAll('.chv[data-mod]').forEach(b => b.onclick = async () => {
      const p = perfis.find(x => x.id === b.dataset.p); if (p.admin) return;
      const fs = funcoes.filter(f => f.modulo_id === b.dataset.mod), todos = fs.every(f => perm.get(chave(p.id, f.id)));
      if (!todos && fs.some(f => f.sensivel) && !await confirmar('Ligar o módulo inteiro?', 'Ele inclui ações sensíveis.', 'Ligar tudo')) return;
      fs.forEach(f => todos ? perm.delete(chave(p.id, f.id)) : perm.set(chave(p.id, f.id), true)); abaPermissoes();
    });
    const mud = [...new Set([...perm.keys(), ...orig.keys()])].filter(k => !!perm.get(k) !== !!orig.get(k));
    const sv = document.getElementById('sv'); sv.style.display = mud.length ? 'flex' : 'none';
    document.getElementById('svt').textContent = mud.length + (mud.length === 1 ? ' alteração' : ' alterações');
    document.getElementById('dsc').onclick = () => { perm = new Map(orig); abaPermissoes(); };
    document.getElementById('slv').onclick = async () => {
      const add = mud.filter(k => perm.get(k)).map(k => { const [perfil_id, funcao_id] = k.split('|'); return { perfil_id, funcao_id, concedido_por: eu.id }; });
      const del = mud.filter(k => !perm.get(k));
      let erro = null;
      if (add.length) { const r = await sb.from('permissoes').insert(add); erro = erro || r.error; }
      for (const k of del) { const [p, f] = k.split('|'); const r = await sb.from('permissoes').delete().eq('perfil_id', p).eq('funcao_id', f); erro = erro || r.error; }
      if (erro) alert('Algumas alterações não foram salvas. Tente de novo.');
      await carregar(); abaPermissoes();
    };
  }

  // ---------- Histórico ----------
  async function abaHistorico() {
    const c = document.getElementById('cont'); c.innerHTML = '<p class="sm">Carregando…</p>';
    const { data } = await sb.from('historico_permissoes').select('*').order('feito_em', { ascending: false }).limit(100);
    const nome = id => { const p = perfis.find(x => x.id === id); return p ? (p.nome || p.email) : '—'; };
    const desc = id => (funcoes.find(f => f.id === id) || {}).descricao || id;
    c.innerHTML = (data || []).map(h => `<div class="pe" style="--c:${h.ligado ? '#22C984' : '#E5484D'}"><div style="flex:1"><b>${h.ligado ? 'Ligou' : 'Desligou'}:</b> ${esc(desc(h.funcao_id))}<div class="sm">Para ${esc(nome(h.perfil_id))} · por ${esc(nome(h.feito_por))} · ${new Date(h.feito_em).toLocaleString('pt-BR')}</div></div></div>`).join('') || '<p class="sm">Nenhuma alteração registrada ainda.</p>';
  }

  window.KESP_USUARIOS = { async abrir(cliente, perfil) { sb = cliente; eu = perfil; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>'; await carregar(); render(); } };
})();

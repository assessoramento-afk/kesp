// ===================== Busca de CEP e CNPJ =====================
window.KESP_BUSCA = (function () {
  const so = v => String(v || '').replace(/\D/g, '');
  const mCEP = v => { const d = so(v).slice(0, 8); return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; };
  const mCNPJ = v => { const d = so(v).slice(0, 14); return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2'); };
  async function cep(v) { const d = so(v); if (d.length !== 8) return null; try { const r = await fetch('https://viacep.com.br/ws/' + d + '/json/'); const j = await r.json(); return j.erro ? null : { logradouro: j.logradouro, bairro: j.bairro, cidade: j.localidade, uf: j.uf }; } catch (_) { return null; } }
  async function cnpj(v) { const d = so(v); if (d.length !== 14) return null; try { const r = await fetch('https://brasilapi.com.br/api/cnpj/v1/' + d); if (!r.ok) return null; const j = await r.json();
    const tel = String(j.ddd_telefone_1 || '').replace(/\D/g, ''); return { razao_social: j.razao_social, nome_fantasia: j.nome_fantasia || null, situacao_receita: j.descricao_situacao_cadastral, data_fundacao: j.data_inicio_atividade, natureza_juridica: j.natureza_juridica, logradouro: [j.descricao_tipo_de_logradouro, j.logradouro].filter(Boolean).join(' '), numero: j.numero, bairro: j.bairro, cidade: j.municipio, uf: j.uf, cep: mCEP(j.cep), telefone: tel.length >= 10 ? '(' + tel.slice(0, 2) + ') ' + tel.slice(2, -4) + '-' + tel.slice(-4) : null }; } catch (_) { return null; } }
  function preencher(form, dados) {
    if (!dados) return;
    const ocupados = Object.keys(dados).filter(n => { const i = form.querySelector('[name="' + n + '"]'); return i && i.value.trim() && dados[n] && i.value.trim() !== String(dados[n]).trim(); });
    const trocar = !ocupados.length || confirm('Encontramos dados para este campo. Substituir o que já está preenchido?');
    Object.entries(dados).forEach(([n, v]) => { const i = form.querySelector('[name="' + n + '"]'); if (i && v && (trocar || !i.value.trim())) i.value = v; });
  }
  function ligar(form) {
    form.querySelectorAll('[data-cep]').forEach(i => { i.addEventListener('input', () => { i.value = mCEP(i.value); }); i.addEventListener('blur', async () => preencher(form, await cep(i.value))); });
    form.querySelectorAll('[data-cnpj]').forEach(i => { i.addEventListener('input', () => { i.value = mCNPJ(i.value); }); i.addEventListener('blur', async () => { const d = await cnpj(i.value); if (d) { delete d.situacao_receita; delete d.data_fundacao; delete d.natureza_juridica; } preencher(form, d); }); });
  }
  return { cep, cnpj, ligar, mCEP, mCNPJ };
})();

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
      const v = window.KESP_CONFIG.kaiChaveVence, d = v ? Math.ceil((new Date(v + 'T12:00') - Date.now()) / 864e5) : null;
      if (d !== null && d <= 15) document.getElementById('pg').insertAdjacentHTML('afterbegin', `<div class="cd" style="--c:#F5A524;margin-bottom:12px"><b>A chave da KAI vence em ${Math.max(0, d)} dia(s).</b> <span class="sm">Crie uma nova no Claude Console e troque o segredo ANTHROPIC_API_KEY no Supabase.</span></div>`);
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
    if (m.id === 'kolping' && window.KESP_KOLPING) return window.KESP_KOLPING.abrir(sb, eu);
    if (m.id === 'sistema' && window.KESP_SISTEMA) return window.KESP_SISTEMA.abrir(sb, eu);
    if (m.id === 'kai' && window.KESP_KAI) return window.KESP_KAI.abrir(sb, eu);
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
    async iniciar(cliente, perfil) {
      sb = cliente; eu = perfil;
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
      html += `<div class="bloco"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div><b>${esc(m.nome)}</b><div class="sm">${esc(m.secao)} · ${nTem} de ${pessoas.length} ${pessoas.length === 1 ? 'pessoa' : 'pessoas'}</div></div></div>
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

// ===================== Cadastro da Kolping Estadual =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let sb, eu, k = {}, bancos = null, unidades = [], pessoas = [], verBanco = false;
  const linha = (r, v) => `<span>${esc(r)}</span><span>${v ? esc(v) : '<span class="sm">—</span>'}</span>`;

  async function carregar() {
    const [a, u, p] = await Promise.all([
      sb.from('kolping_cadastro').select('*').eq('id', 1).maybeSingle(),
      sb.from('unidades').select('*').order('ordem'),
      sb.from('perfis').select('id,nome,email').eq('situacao', 'ativo').order('nome')
    ]);
    k = a.data || {}; unidades = u.data || []; pessoas = p.data || [];
    const b = await sb.from('kolping_dados_bancarios').select('*').eq('id', 1).maybeSingle();
    bancos = b.data || null;
  }
  const nomePessoa = id => { const p = pessoas.find(x => x.id === id); return p ? (p.nome || p.email) : ''; };

  function render() {
    const pg = document.getElementById('pg');
    const end = [k.logradouro, k.numero].filter(Boolean).join(', ') + (k.bairro ? ' – ' + k.bairro : '');
    const dir = Array.isArray(k.diretoria) ? k.diretoria : [];
    const tit = Array.isArray(k.titulos) ? k.titulos : [];
    pg.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap"><div><h1>Kolping Estadual</h1><p class="sub">Painel de Controle · Cadastro${k.atualizado_em ? ' · atualizado em ' + new Date(k.atualizado_em).toLocaleDateString('pt-BR') : ''}</p></div>${eu.admin ? '<button class="btn" id="edK">Editar</button>' : ''}</div>
      <div class="g4">
        <div class="cd s2" style="--c:#F07830"><div class="hd"><span>IDENTIFICAÇÃO</span></div><div class="kv">${linha('Razão social', k.razao_social)}${linha('Nome fantasia', k.nome_fantasia)}${linha('CNPJ', k.cnpj)}${linha('Data de fundação', k.data_fundacao ? new Date(k.data_fundacao + 'T12:00').toLocaleDateString('pt-BR') : '')}${linha('Natureza jurídica', k.natureza_juridica)}${linha('Inscrição municipal', k.inscricao_municipal)}<span>Situação na Receita</span><span>${k.situacao_receita ? `<b style="color:${/ativa/i.test(k.situacao_receita) ? '#5FE0A8' : '#FF9A9D'}">${esc(k.situacao_receita)}</b> <span class="sm">· ${new Date(k.situacao_receita_em).toLocaleDateString('pt-BR')}</span>` : '<span class="sm">—</span>'}${eu.admin ? ' <a class="lk" id="cRec">Consultar agora</a>' : ''}</span></div></div>
        <div class="cd s2" style="--c:#3B82F6"><div class="hd"><span>CONTATO E ENDEREÇO</span></div><div class="kv">${linha('Telefones', [k.telefone, k.telefone2].filter(Boolean).join(' / '))}${linha('E-mail', k.email)}${linha('Site', k.site)}${linha('Facebook', k.facebook)}${linha('Endereço', end)}${linha('Cidade', [k.cidade, k.uf].filter(Boolean).join(' – ') + (k.cep ? ', ' + k.cep : ''))}</div></div>
        <div class="cd s2" style="--c:#22C984"><div class="hd"><span>UNIDADES</span></div>${unidades.map(u => `<div class="lin" style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><b>${esc(u.nome)}</b>${u.principal ? ' <span class="pl" style="background:rgba(240,120,48,.15);color:#FFB070">Principal</span>' : ''}<div class="sm">${esc([u.logradouro, u.numero].filter(Boolean).join(', ') || 'Endereço a cadastrar')}${u.bairro ? ' – ' + esc(u.bairro) : ''}${u.cidade ? ' · ' + esc(u.cidade) : ''}</div><div class="sm">Responsável: ${esc(nomePessoa(u.responsavel) || 'a definir')}</div></div>${eu.admin ? `<button class="mini neu" data-un="${u.id}">Editar</button>` : ''}</div>`).join('')}</div>
        <div class="cd s2" style="--c:#8B5CF6"><div class="hd"><span>DIRETORIA · IDENTIDADE VISUAL · TÍTULOS</span></div><div class="kv">${linha('Presidente', k.presidente)}${dir.map(d => linha(d.cargo, d.nome)).join('')}${linha('Logo oficial', 'Em uso nos documentos')}${linha('Títulos e certificações', tit.length ? tit.length + ' cadastrado(s)' : '')}</div></div>
        <div class="cd s4" style="--c:#E5484D"><div class="hd"><span>DADOS BANCÁRIOS</span><span class="restr"><i class="ti ti-lock"></i> Restrito</span></div>
          ${bancos ? (verBanco ? `<div class="kv">${linha('Banco', bancos.banco)}${linha('Agência', bancos.agencia)}${linha('Conta', bancos.conta)}${linha('Chave PIX', bancos.chave_pix)}</div>${eu.admin ? '<button class="mini neu" id="edB" style="margin-top:8px">Editar dados bancários</button>' : ''}` : '<a class="lk" id="verB">Toque para ver</a>') : '<p class="sm" style="margin:0">Visível só para quem tem a permissão.</p>'}</div>
      </div>`;
    const v = document.getElementById('verB'); if (v) v.onclick = () => { verBanco = true; render(); };
    const e = document.getElementById('edK'); if (e) e.onclick = editarKolping;
    const cr = document.getElementById('cRec'); if (cr) cr.onclick = async () => { cr.textContent = 'Consultando…'; const d = await window.KESP_BUSCA.cnpj(k.cnpj); if (!d) { cr.textContent = 'Não foi possível consultar agora'; return; } await sb.from('kolping_cadastro').update({ situacao_receita: d.situacao_receita, situacao_receita_em: new Date().toISOString(), natureza_juridica: k.natureza_juridica || d.natureza_juridica, data_fundacao: k.data_fundacao || d.data_fundacao, nome_fantasia: k.nome_fantasia || d.nome_fantasia }).eq('id', 1); await carregar(); render(); };
    const eb = document.getElementById('edB'); if (eb) eb.onclick = editarBancos;
    pg.querySelectorAll('[data-un]').forEach(b => b.onclick = () => editarUnidade(unidades.find(u => u.id === b.dataset.un)));
  }

  function modal(titulo, campos, aoSalvar) {
    const d = document.createElement('div'); d.className = 'conf';
    d.innerHTML = `<div class="cx fm" style="max-width:520px;max-height:90vh;overflow-y:auto"><b>${esc(titulo)}</b>${campos}<div style="display:flex;gap:8px;margin-top:14px"><button class="btn sec" style="flex:1" data-x>Cancelar</button><button class="btn" style="flex:1" data-ok>Salvar</button></div></div>`;
    document.body.appendChild(d);
    window.KESP_BUSCA.ligar(d);
    d.querySelector('[data-x]').onclick = () => d.remove();
    d.querySelector('[data-ok]').onclick = async () => {
      const val = {}; d.querySelectorAll('[name]').forEach(i => (val[i.name] = i.value.trim() || null));
      const btn = d.querySelector('[data-ok]'); btn.disabled = true;
      const r = await aoSalvar(val); btn.disabled = false;
      if (r && r.cancel) return;
      if (r && r.error) { alert('Não foi possível salvar. Tente de novo.'); try { await sb.from('erros_sistema').insert({ tela: 'kolping', mensagem: r.error.message }); } catch (_) {} return; }
      d.remove(); await carregar(); render();
    };
  }
  const campo = (n, r, v, t) => `<label>${esc(r)}</label><input name="${n}" value="${esc(v || '')}"${t ? ` type="${t}"` : ''}>`;

  function editarKolping() {
    modal('Editar cadastro da Kolping', `${campo('razao_social', 'Razão social', k.razao_social)}${campo('nome_fantasia', 'Nome fantasia', k.nome_fantasia)}<div class="dois"><div><label>CNPJ</label><input name="cnpj" data-cnpj value="${esc(k.cnpj || '')}" inputmode="numeric"></div><div>${campo('data_fundacao', 'Data de fundação', k.data_fundacao, 'date')}</div></div>
      <div class="dois"><div>${campo('natureza_juridica', 'Natureza jurídica', k.natureza_juridica)}</div><div>${campo('inscricao_municipal', 'Inscrição municipal', k.inscricao_municipal)}</div></div>${campo('presidente', 'Presidente', k.presidente)}
      <div class="dois"><div>${campo('telefone', 'Telefone', k.telefone)}</div><div>${campo('telefone2', 'Telefone 2', k.telefone2)}</div></div>
      ${campo('email', 'E-mail', k.email, 'email')}<div class="dois"><div>${campo('site', 'Site', k.site)}</div><div>${campo('facebook', 'Facebook', k.facebook)}</div></div>
      <div class="dois"><div>${campo('logradouro', 'Rua', k.logradouro)}</div><div>${campo('numero', 'Número', k.numero)}</div></div>
      <div class="dois"><div>${campo('bairro', 'Bairro', k.bairro)}</div><div><label>CEP</label><input name="cep" data-cep value="${esc(k.cep || '')}" inputmode="numeric"></div></div>
      <div class="dois"><div>${campo('cidade', 'Cidade', k.cidade)}</div><div>${campo('uf', 'UF', k.uf)}</div></div>`,
      val => { if (!val.razao_social || !val.cnpj) { alert('Razão social e CNPJ são obrigatórios.'); return { error: null, cancel: true }; } return sb.from('kolping_cadastro').update(val).eq('id', 1); });
  }
  function editarBancos() {
    const b = bancos || {};
    modal('Editar dados bancários', `${campo('banco', 'Banco', b.banco)}<div class="dois"><div>${campo('agencia', 'Agência', b.agencia)}</div><div>${campo('conta', 'Conta', b.conta)}</div></div>${campo('chave_pix', 'Chave PIX', b.chave_pix)}`,
      val => sb.from('kolping_dados_bancarios').update(val).eq('id', 1));
  }
  function editarUnidade(u) {
    const opts = '<option value="">A definir</option>' + pessoas.map(p => `<option value="${p.id}"${u.responsavel === p.id ? ' selected' : ''}>${esc(p.nome || p.email)}</option>`).join('');
    modal('Editar ' + u.nome, `<div class="dois"><div>${campo('logradouro', 'Rua', u.logradouro)}</div><div>${campo('numero', 'Número', u.numero)}</div></div>
      <div class="dois"><div>${campo('bairro', 'Bairro', u.bairro)}</div><div><label>CEP</label><input name="cep" data-cep value="${esc(u.cep || '')}" inputmode="numeric"></div></div>${campo('cidade', 'Cidade', u.cidade)}
      <label>Responsável</label><select name="responsavel">${opts}</select>`,
      val => sb.from('unidades').update(val).eq('id', u.id));
  }

  window.KESP_KOLPING = { async abrir(cliente, perfil) { sb = cliente; eu = perfil; verBanco = false; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>'; await carregar(); render(); } };
})();

// ===================== Sistema (saúde, módulos e cópia) =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TABELAS = ['kolping_cadastro', 'kolping_dados_bancarios', 'unidades', 'perfis', 'permissoes', 'modelos_cargo', 'funcoes', 'modulos', 'dominios_permitidos', 'convites', 'avisos', 'novidades', 'trilha_concluida', 'historico_permissoes', 'historico_cadastro', 'erros_sistema'];
  const SIT = { em_breve: 'Em breve', ativo: 'Ativo', manutencao: 'Em manutenção' };
  let sb, eu, aba = 'saude';

  function render() {
    const pg = document.getElementById('pg');
    pg.innerHTML = `<h1>Sistema</h1><p class="sub">Painel de Controle · saúde, módulos e cópias de segurança</p>
      <div class="abas"><a data-a="saude" class="${aba === 'saude' ? 'on' : ''}">Saúde</a><a data-a="modulos" class="${aba === 'modulos' ? 'on' : ''}">Módulos</a><a data-a="copia" class="${aba === 'copia' ? 'on' : ''}">Cópia</a></div><div id="cont"><p class="sm">Carregando…</p></div>`;
    pg.querySelectorAll('[data-a]').forEach(x => x.onclick = () => { aba = x.dataset.a; render(); });
    ({ saude: abaSaude, modulos: abaModulos, copia: abaCopia })[aba]();
  }

  async function abaSaude() {
    const sete = new Date(Date.now() - 7 * 864e5).toISOString();
    const [er, er7, at, ag, pf] = await Promise.all([
      sb.from('erros_sistema').select('*').order('criado_em', { ascending: false }).limit(30),
      sb.from('erros_sistema').select('id', { count: 'exact', head: true }).gte('criado_em', sete),
      sb.from('perfis').select('id', { count: 'exact', head: true }).eq('situacao', 'ativo'),
      sb.from('perfis').select('id', { count: 'exact', head: true }).eq('situacao', 'aguardando'),
      sb.from('perfis').select('id,nome,email')
    ]);
    const nome = id => { const p = (pf.data || []).find(x => x.id === id); return p ? (p.nome || p.email) : 'sem login'; };
    let ultima = null; try { ultima = localStorage.getItem('kesp.ultimaCopia'); } catch (_) {}
    const diasCopia = ultima ? Math.floor((Date.now() - new Date(ultima)) / 864e5) : null;
    const n7 = er7.count || 0;
    document.getElementById('cont').innerHTML = `<div class="g4">
      <div class="cd" style="--c:${n7 ? '#E5484D' : '#22C984'}"><div class="hd"><span>ERROS · 7 DIAS</span></div><div class="big">${n7}</div><div class="sm">${n7 ? 'veja a lista abaixo' : 'tudo funcionando'}</div></div>
      <div class="cd" style="--c:#3B82F6"><div class="hd"><span>USUÁRIOS</span></div><div class="big">${at.count || 0}</div><div class="sm">ativos · ${ag.count || 0} aguardando</div></div>
      ${(() => { const v = window.KESP_CONFIG.kaiChaveVence, d = v ? Math.ceil((new Date(v + 'T12:00') - Date.now()) / 864e5) : null, alerta = d !== null && d <= 15;
        return `<div class="cd" style="--c:${alerta ? '#F5A524' : '#22C984'}"><div class="hd"><span>KAI</span><span class="pl" style="background:rgba(34,201,132,.15);color:#5FE0A8">Haiku 5.5</span></div><div class="big">${alerta ? 'Trocar chave' : 'Ativa'}</div><div class="sm">chave vence em ${v ? new Date(v + 'T12:00').toLocaleDateString('pt-BR') : '—'}${alerta ? ' · faltam ' + Math.max(0, d) + ' dias' : ''}</div></div>`; })()}
      <div class="cd" style="--c:${diasCopia === null || diasCopia > 7 ? '#F5A524' : '#22C984'}"><div class="hd"><span>ÚLTIMA CÓPIA</span></div><div class="big">${diasCopia === null ? '—' : diasCopia === 0 ? 'Hoje' : diasCopia + ' dia' + (diasCopia > 1 ? 's' : '')}</div><div class="sm">${diasCopia === null || diasCopia > 7 ? 'faça uma cópia na aba Cópia' : 'neste computador'}</div></div>
      <div class="cd s4" style="--c:#E5484D"><div class="hd"><span>ERROS REGISTRADOS</span><span>últimos 30</span></div>
        ${(er.data || []).map(e => `<div class="lin"><b style="font-size:13px">${esc(e.mensagem)}</b><div class="sm">${esc(e.tela || '—')} · ${esc(nome(e.perfil_id))} · ${new Date(e.criado_em).toLocaleString('pt-BR')}</div>${e.detalhe ? `<div class="sm">${esc(e.detalhe)}</div>` : ''}<a class="lk" data-exp="${esc(e.mensagem + (e.detalhe ? ' — ' + e.detalhe : '') + ' (tela: ' + (e.tela || '—') + ')')}" style="font-size:12px">Explicar com a KAI ›</a></div>`).join('') || '<p class="sm" style="margin:0">Nenhum erro registrado.</p>'}</div></div>`;
    document.querySelectorAll('[data-exp]').forEach(a => a.onclick = () => { try { sessionStorage.setItem('kesp.kai.pergunta', 'Explique este erro do KESP em palavras simples e o que devo fazer: ' + a.dataset.exp); } catch (_) {} location.hash = '#kai'; });
  }

  async function abaModulos() {
    const { data } = await sb.from('modulos').select('*').order('ordem');
    const c = document.getElementById('cont');
    c.innerHTML = `<p class="sm">Use "Em manutenção" para desligar um módulo temporariamente. O restante do KESP continua funcionando.</p>` + (data || []).map(m => `<div class="pe fm" style="--c:${m.situacao === 'ativo' ? '#22C984' : m.situacao === 'manutencao' ? '#F5A524' : '#6E6A7C'};flex-wrap:wrap" data-m="${m.id}">
      <div style="flex:1;min-width:160px"><b>${esc(m.nome)}</b><div class="sm">${esc(m.secao)} · etapa ${esc(m.etapa)}</div></div>
      <select name="situacao" style="width:auto">${Object.entries(SIT).map(([k, v]) => `<option value="${k}"${m.situacao === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
      <input name="percentual" type="number" min="0" max="100" value="${m.percentual}" style="width:74px" aria-label="Percentual">
      <div class="mt" style="width:100%;display:${m.situacao === 'manutencao' ? 'grid' : 'none'};grid-template-columns:1fr 160px;gap:8px"><input name="motivo_manutencao" placeholder="Motivo" value="${esc(m.motivo_manutencao || '')}"><input name="previsao_retorno" type="date" value="${m.previsao_retorno || ''}"></div>
      <button class="mini" data-salvar>Salvar</button></div>`).join('');
    c.querySelectorAll('[data-m]').forEach(row => {
      const sel = row.querySelector('[name="situacao"]');
      sel.onchange = () => { row.querySelector('.mt').style.display = sel.value === 'manutencao' ? 'grid' : 'none'; };
      row.querySelector('[data-salvar]').onclick = async () => {
        const v = { situacao: sel.value, percentual: Math.max(0, Math.min(100, parseInt(row.querySelector('[name="percentual"]').value, 10) || 0)),
          motivo_manutencao: sel.value === 'manutencao' ? (row.querySelector('[name="motivo_manutencao"]').value.trim() || null) : null,
          previsao_retorno: sel.value === 'manutencao' ? (row.querySelector('[name="previsao_retorno"]').value || null) : null };
        const r = await sb.from('modulos').update(v).eq('id', row.dataset.m);
        if (r.error) { alert('Não foi possível salvar.'); return; }
        const b = row.querySelector('[data-salvar]'); b.textContent = 'Salvo ✓'; setTimeout(() => { location.reload(); }, 700);
      };
    });
  }

  function abaCopia() {
    document.getElementById('cont').innerHTML = `<div class="cd" style="--c:#3B82F6;max-width:640px"><div class="hd"><span>CÓPIA DE SEGURANÇA</span></div>
      <p style="margin:0 0 10px;line-height:1.55">Baixa um arquivo com <b>todos os dados do KESP</b> (cadastros, usuários, permissões, avisos e históricos). Guarde em local seguro, como a pasta "99 Sistema" do Drive. Recomendação: <b>uma vez por semana</b>, até a cópia automática para o Google Drive chegar na etapa 1B.</p>
      <p class="sm" style="margin:0 0 12px">O arquivo contém dados pessoais e bancários: não envie por WhatsApp nem e-mail.</p>
      <button class="btn" id="baixar">Baixar cópia agora</button><p class="sm" id="st" style="margin:10px 0 0"></p></div>`;
    document.getElementById('baixar').onclick = async () => {
      const st = document.getElementById('st'), b = document.getElementById('baixar'); b.disabled = true;
      const copia = { sistema: 'KESP', versao: '1A', gerado_em: new Date().toISOString(), gerado_por: eu.email, tabelas: {} };
      for (const t of TABELAS) { st.textContent = 'Copiando ' + t + '…'; const r = await sb.from(t).select('*'); copia.tabelas[t] = r.error ? { erro: r.error.message } : r.data; }
      const blob = new Blob([JSON.stringify(copia, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'KESP_copia_' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove();
      try { localStorage.setItem('kesp.ultimaCopia', new Date().toISOString()); } catch (_) {}
      st.textContent = 'Cópia baixada: ' + TABELAS.length + ' tabelas.'; b.disabled = false;
    };
  }

  window.KESP_SISTEMA = { abrir(cliente, perfil) { sb = cliente; eu = perfil; aba = 'saude'; render(); } };
})();

// ===================== KAI =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const OLHOS = {
    acolhendo: '<path d="M45 50 Q50 44 55 50" stroke="#FFB070" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M65 50 Q70 44 75 50" stroke="#FFB070" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M54 55 Q60 59 66 55" stroke="#FFB070" stroke-width="2" fill="none" stroke-linecap="round"/>',
    pensando: '<circle cx="51" cy="44" r="3" fill="#FFB070"/><circle cx="69" cy="44" r="3" fill="#FFB070"/><circle cx="51" cy="54" r="2.2" fill="#FFB070"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></circle><circle cx="60" cy="54" r="2.2" fill="#FFB070"><animate attributeName="opacity" values=".2;1;.2" dur="1.2s" repeatCount="indefinite"/></circle><circle cx="69" cy="54" r="2.2" fill="#FFB070"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" begin=".4s" repeatCount="indefinite"/></circle>',
    explicando: '<ellipse cx="51" cy="47" rx="3" ry="4.5" fill="#FFB070"/><ellipse cx="69" cy="47" rx="3" ry="4.5" fill="#FFB070"/><ellipse cx="60" cy="56" rx="4" ry="2.5" fill="#FFB070"/>',
    pausa: '<path d="M46 49 L55 49" stroke="#8A8478" stroke-width="2.5" stroke-linecap="round"/><path d="M65 49 L74 49" stroke="#8A8478" stroke-width="2.5" stroke-linecap="round"/>'
  };
  const robo = (estado, s) => `<svg width="${s}" height="${s * 0.9}" viewBox="20 8 80 72" aria-hidden="true"><line x1="60" y1="14" x2="60" y2="24" stroke="#9A9088" stroke-width="2"/><circle cx="60" cy="12" r="5" fill="${estado === 'pausa' ? '#9A9088' : '#F07830'}"/><rect x="22" y="38" width="8" height="18" rx="3" fill="${estado === 'pausa' ? '#C9C2B6' : '#F07830'}"/><rect x="90" y="38" width="8" height="18" rx="3" fill="${estado === 'pausa' ? '#C9C2B6' : '#F07830'}"/><rect x="28" y="24" width="64" height="50" rx="18" fill="#F4F1EC"/><rect x="36" y="34" width="48" height="28" rx="12" fill="${estado === 'pausa' ? '#3A3F5C' : '#2C3045'}"/>${OLHOS[estado]}</svg>`;
  const SUGESTOES = ['Como libero o acesso de alguém?', 'Como funcionam as permissões?', 'Como faço uma cópia de segurança?', 'O que vem nas próximas etapas?'];
  let sb, eu, msgs = [], ocupado = false;
  try { msgs = JSON.parse(sessionStorage.getItem('kesp.kai') || '[]'); } catch (_) { msgs = []; }
  const guardar = () => { try { sessionStorage.setItem('kesp.kai', JSON.stringify(msgs.slice(-30))); } catch (_) {} };

  function render(estado) {
    const pg = document.getElementById('pg');
    pg.innerHTML = `<div class="kai"><div class="kai-top"><span id="kRobo">${robo(estado || 'acolhendo', 54)}</span><div style="flex:1"><b style="font-size:17px">KAI</b><div class="sm">Assistente do KESP · ajuda no uso do sistema</div></div>${msgs.length ? '<a class="lk" id="kLimpar">Nova conversa</a>' : ''}</div>
      <div class="kai-msgs" id="kMsgs">${msgs.length ? '' : `<div class="bal ka">Oi, ${esc((eu.nome || eu.email).split(' ')[0])}! Em que posso ajudar hoje?</div><div class="kai-sug">${SUGESTOES.map(s => `<a>${esc(s)}</a>`).join('')}</div>`}${msgs.map(m => `<div class="bal ${m.papel === 'kai' ? 'ka' : 'eu'}">${esc(m.texto)}</div>`).join('')}</div>
      <div class="kai-in"><textarea id="kTxt" rows="1" placeholder="Pergunte à KAI…" maxlength="2000"></textarea><button id="kEnv" aria-label="Enviar">➤</button></div></div>`;
    const txt = document.getElementById('kTxt'), env = document.getElementById('kEnv'), box = document.getElementById('kMsgs');
    box.scrollTop = box.scrollHeight;
    txt.oninput = () => { txt.style.height = 'auto'; txt.style.height = Math.min(120, txt.scrollHeight) + 'px'; };
    txt.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(txt.value); } };
    env.onclick = () => enviar(txt.value);
    box.querySelectorAll('.kai-sug a').forEach(a => a.onclick = () => enviar(a.textContent));
    const l = document.getElementById('kLimpar'); if (l) l.onclick = () => { msgs = []; guardar(); render(); };
    txt.focus();
  }

  async function enviar(texto) {
    texto = String(texto || '').trim(); if (!texto || ocupado) return;
    ocupado = true; msgs.push({ papel: 'eu', texto }); guardar(); render('pensando');
    const box = document.getElementById('kMsgs'); box.insertAdjacentHTML('beforeend', '<div class="bal ka" id="kPens">Só um instante, estou procurando…</div>'); box.scrollTop = box.scrollHeight;
    document.getElementById('kEnv').disabled = true;
    let estado = 'explicando', resp;
    try {
      const { data, error } = await sb.functions.invoke('kai', { body: { mensagens: msgs } });
      if (error) {
        let corpo = null; try { corpo = await error.context.json(); } catch (_) {}
        resp = (corpo && corpo.erro) || 'Algo não saiu como esperado. Já registrei o problema para o administrador. Tente de novo em alguns instantes.';
      } else if (data && data.pausa) {
        estado = 'pausa';
        resp = 'Estou em pausa no momento. O administrador já foi avisado, e eu volto assim que for possível.';
      } else resp = (data && data.texto) || 'Não consegui responder agora.';
    } catch (_) {
      resp = navigator.onLine ? 'Algo não saiu como esperado. Tente de novo em alguns instantes.' : 'Parece que você está sem internet. Tente de novo quando a conexão voltar.';
    }
    msgs.push({ papel: 'kai', texto: resp }); guardar(); ocupado = false; render(estado);
  }

  window.KESP_KAI = {
    abrir(cliente, perfil) {
      sb = cliente; eu = perfil;
      let pre = null; try { pre = sessionStorage.getItem('kesp.kai.pergunta'); sessionStorage.removeItem('kesp.kai.pergunta'); } catch (_) {}
      render(); if (pre) enviar(pre);
    }
  };
})();

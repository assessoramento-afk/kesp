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
  const FUNCAO_MODULO = { comunidades: 'comunidades.ver', recibos: 'recibos.ver', cobranca: 'cobranca.ver', recadastramento: 'recadastramento.ver', questionarios: 'questionarios.ver', relatorios_ass: 'relatorios_ass.ver', distritos: 'comunidades.ver', usuarios: 'usuarios.ver', kolping: 'kolping.ver', sistema: 'sistema.saude', inicio: 'inicio.ver', andamento: 'andamento.ver', manual: 'manual.ver', kai: 'kai.usar' };

  let sb, eu, sair, modulos = [], perms = new Set(), avisosN = 0;
  const pode = f => eu.admin || perms.has(f);
  const visivel = m => m.situacao === 'em_breve' ? true : (FUNCAO_MODULO[m.id] ? pode(FUNCAO_MODULO[m.id]) : eu.admin);
  const primeiro = () => (eu.nome || eu.email).split(' ')[0];
  function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
  window.KESP_TOAST = t => toast(t);
  window.KESP_PODE = f => pode(f);
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
        <a class="it" id="pAss"><i class="ti ti-signature"></i>${eu.assinatura_url ? 'Trocar' : 'Cadastrar'} minha assinatura</a><a class="it" id="pBv"><i class="ti ti-sparkles"></i>Rever boas-vindas</a><a class="it" id="pSair"><i class="ti ti-logout"></i>Sair</a>`;
      fundo.classList.add('ab');
      document.getElementById('pSair').onclick = async () => { fundo.classList.remove('ab'); await sb.auth.signOut(); };
      document.getElementById('pBv').onclick = () => { fundo.classList.remove('ab'); boasVindas(true); };
      document.getElementById('pAss').onclick = () => { fundo.classList.remove('ab'); assinatura(); };
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
    if (id.startsWith('ck/')) { document.querySelectorAll('[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === 'comunidades')); return window.KESP_CKS.abrir(sb, eu, id.slice(3)); }
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
    if (m.id === 'manual' && window.KESP_MANUAL) return window.KESP_MANUAL.abrir(sb, eu);
    if (m.id === 'comunidades' && window.KESP_CKS) return window.KESP_CKS.abrir(sb, eu);
    if (m.id === 'distritos' && window.KESP_DISTRITOS) return window.KESP_DISTRITOS.abrir(sb, eu);
    if (m.id === 'recibos' && window.KESP_RECIBOS) return window.KESP_RECIBOS.abrir(sb, eu);
    pagConstrucao(m);
    window.scrollTo(0, 0);
  }

  // ---------- Assinatura ----------
  function assinatura() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/png,image/jpeg';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      if (f.size > 5 * 1024 * 1024) { toast('Imagem muito grande (máximo 5 MB).'); return; }
      const img = new Image(); img.onload = async () => {
        const esc2 = Math.min(1, 600 / img.width, 200 / img.height), cv = document.createElement('canvas');
        cv.width = Math.round(img.width * esc2); cv.height = Math.round(img.height * esc2);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        const url = cv.toDataURL('image/png');
        const r = await sb.from('perfis').update({ assinatura_url: url }).eq('id', eu.id);
        if (r.error) { toast('Não foi possível salvar a assinatura.'); return; }
        eu.assinatura_url = url; try { await sb.from('trilha_concluida').insert({ perfil_id: eu.id, passo: 'assinatura' }); } catch (_) {}
        toast('Assinatura salva. Ela aparece nos documentos que você emitir.');
      }; img.src = URL.createObjectURL(f);
    };
    inp.click();
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

// ===================== Manual =====================
(function () {
  'use strict';
  const T = [
    { g: 'Primeiros passos', c: '#22C984', t: 'Entrar no KESP', h: '<ol><li>Abra <b>assessoramento-afk.github.io/kesp</b>.</li><li>Digite seu e-mail e sua senha e toque em <b>Entrar</b>.</li><li>No celular, use "Adicionar à tela inicial" para abrir o KESP como um app.</li></ol>' },
    { g: 'Primeiros passos', c: '#22C984', t: 'Pedir acesso', h: '<ol><li>Na tela de entrada, toque em <b>Pedir acesso</b>.</li><li>Informe nome completo, e-mail institucional (@kolpingsp.org ou @kolping-sp.org.br) e crie uma senha com pelo menos 8 caracteres.</li><li>Confirme seu e-mail pelo link recebido.</li><li>Aguarde: um administrador libera o seu acesso, e você recebe um e-mail.</li></ol>' },
    { g: 'Primeiros passos', c: '#22C984', t: 'Esqueci a senha', h: '<ol><li>Na tela de entrada, toque em <b>Esqueci a senha</b> e informe seu e-mail.</li><li>Abra o link que chegar (vale por 1 hora) e crie a nova senha.</li></ol><p>Nunca compartilhe sua senha com ninguém, nem com a equipe.</p>' },
    { g: 'Usando o sistema', c: '#3B82F6', t: 'Início e menu', h: '<ul><li><b>Início:</b> cards com o que pede atenção, atalhos, etapas e novidades.</li><li><b>Menu:</b> no computador fica à esquerda; no celular, toque em <b>Menu</b> na barra de baixo.</li><li><b>A caminho:</b> reúne os módulos que ainda estão sendo construídos.</li></ul>' },
    { g: 'Usando o sistema', c: '#3B82F6', t: 'Perfil e boas-vindas', h: '<p>Toque no círculo com suas iniciais, no topo, para <b>rever as boas-vindas</b> ou <b>sair</b>.</p>' },
    { g: 'Usando o sistema', c: '#3B82F6', t: 'Conversar com a KAI', h: '<ol><li>Toque em <b>KAI</b> no menu ou na barra de baixo.</li><li>Escreva sua dúvida sobre como usar o KESP e toque na seta.</li><li>Use <b>Nova conversa</b> para começar outro assunto.</li></ol><p>A KAI ajuda a usar o sistema, mas não consulta nem altera dados. Se ela estiver "em pausa", o administrador já foi avisado.</p>' },
    { g: 'Usando o sistema', c: '#3B82F6', t: 'Andamento do KESP', h: '<p>Em <b>Ajuda › Andamento do KESP</b> você acompanha o progresso de cada etapa e as novidades de cada versão.</p>' },
    { g: 'Administração', c: '#F07830', a: 1, t: 'Liberar o acesso de alguém', h: '<ol><li>Painel de Controle › <b>Usuários e permissões</b>, aba <b>Pessoas</b>.</li><li>A pessoa aparece no topo como <b>Aguardando liberação</b>.</li><li>Toque em <b>Liberar</b>, escolha o cargo e confirme: as permissões do modelo do cargo são aplicadas.</li><li>Se não reconhecer o pedido, toque em <b>Recusar</b>.</li></ol>' },
    { g: 'Administração', c: '#F07830', a: 1, t: 'Ajustar permissões', h: '<ol><li>Aba <b>Permissões</b>, filtre pela seção ou busque a função.</li><li>Toque no botão na coluna da pessoa: <b>verde ✓ ligado</b>, <b>vermelho ✕ desligado</b>.</li><li>Ações <b>sensíveis</b> pedem confirmação.</li><li>Confira e toque em <b>Salvar</b> (ou <b>Descartar</b>).</li></ol><p>Toda mudança fica na aba <b>Histórico</b>.</p>' },
    { g: 'Administração', c: '#F07830', a: 1, t: 'Bloquear quem saiu da equipe', h: '<ol><li>Aba <b>Pessoas</b> › <b>Desativar</b> na pessoa.</li><li>Faça o checklist de saída: trocar senhas compartilhadas, recolher equipamentos, transferir tarefas e, se a chave da KAI estiver no nome dela, criar uma nova.</li></ol>' },
    { g: 'Administração', c: '#F07830', a: 1, t: 'Cadastro da Kolping', h: '<ol><li>Painel de Controle › <b>Cadastro da Kolping</b> › <b>Editar</b>.</li><li>CEP e CNPJ preenchem os demais campos sozinhos.</li><li>Use <b>Consultar agora</b> para atualizar a situação na Receita.</li></ol><p>Só administradores editam. Dados bancários aparecem só para quem tem permissão.</p>' },
    { g: 'Administração', c: '#F07830', a: 1, t: 'Colocar um módulo em manutenção', h: '<ol><li>Painel de Controle › <b>Sistema</b>, aba <b>Módulos</b>.</li><li>Mude a situação para <b>Em manutenção</b>, escreva o motivo e a previsão de volta e toque em <b>Salvar</b>.</li><li>Quando resolver, volte para <b>Ativo</b>.</li></ol>' },
    { g: 'Administração', c: '#F07830', a: 1, t: 'Quando algo der errado', h: '<ol><li>Abra <b>Sistema › Saúde</b> e veja o erro registrado.</li><li>Toque em <b>Explicar com a KAI</b>.</li><li>Se o sistema inteiro parar, avise o Henrique e coloque o módulo afetado em manutenção.</li></ol>' },
    { g: 'Administração', c: '#F07830', a: 1, t: 'Cópia de segurança', h: '<ol><li><b>Sistema › Cópia</b> › <b>Baixar cópia agora</b>, uma vez por semana.</li><li>Guarde o arquivo na pasta <b>99 Sistema</b> do Drive.</li><li>Não envie por WhatsApp nem e-mail: ele contém dados pessoais e bancários.</li></ol>' },
    { g: 'Administração', c: '#F07830', a: 1, t: 'Acessos importantes', h: '<p>Os acessos do Supabase, do GitHub e do Claude Console ficam no cofre de senhas do KESP (etapa 1B). A chave da KAI vence em 10/11/2028; o KESP avisa 15 dias antes.</p>' }
  ];
  let eu;
  function render(f) {
    const pg = document.getElementById('pg'); f = (f || '').toLowerCase();
    const lista = T.filter(x => (!x.a || eu.admin) && (!f || (x.t + x.h).toLowerCase().replace(/<[^>]+>/g, '').includes(f)));
    let html = '', grupo = '';
    lista.forEach(x => { if (x.g !== grupo) { grupo = x.g; html += `<div class="gr-t">${grupo.toUpperCase()}</div>`; } html += `<details style="--c:${x.c}"><summary>${x.t}</summary><div class="ct">${x.h}</div></details>`; });
    pg.querySelector('#manLista').innerHTML = html || '<p class="sm">Nada encontrado. Tente outra palavra ou pergunte à KAI.</p>';
  }
  window.KESP_MANUAL = {
    abrir(sb, perfil) {
      eu = perfil;
      document.getElementById('pg').innerHTML = `<div class="man" style="max-width:820px"><h1>Manual</h1><p class="sub">Como usar o KESP · cresce a cada módulo novo</p>
        <input id="manBus" placeholder="Buscar no manual" style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(8,12,20,.7);color:#F2EEEA;font-size:14px;margin-bottom:4px"><div id="manLista"></div></div>`;
      const b = document.getElementById('manBus'); b.oninput = () => render(b.value); render('');
    }
  };
})();

// ===================== Comunidades (lista e perfil) =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const R = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const COR = { em_dia: '#22C984', parcial: '#F5A524', atraso: '#E5484D', inativa: '#6E6A7C' };
  const NOME = { em_dia: 'Em dia', parcial: 'Com pendência parcial', atraso: 'Em atraso', inativa: 'Inativa' };
  const SIT_MES = { pago: ['rgba(34,201,132,.14)', '#5FE0A8'], parcial: ['rgba(245,165,36,.14)', '#F8C46A'], atraso: ['rgba(229,72,77,.14)', '#FF9A9D'], a_vencer: ['rgba(255,255,255,.04)', '#A8A3B4'], isento: ['rgba(255,255,255,.04)', '#6E6A7C'] };
  const ANO = new Date().getFullYear();
  let sb, eu, D = null, filtro = 'todas', busca = '', distrito = '';

  async function carregar() {
    const [c, d, r, q, t, cr, f] = await Promise.all([
      sb.from('comunidades').select('*').order('nome'),
      sb.from('distritos').select('*').order('ordem'),
      sb.from('recadastramentos').select('*').order('ano'),
      sb.from('quitacoes').select('comunidade_id,tipo,ano,mes,valor_pago,origem'),
      sb.from('taxas_ano').select('*'),
      sb.from('creditos').select('comunidade_id,valor'),
      sb.from('comunidades_favoritas').select('comunidade_id').eq('perfil_id', eu.id)
    ]);
    D = { cks: c.data || [], dist: d.data || [], recad: r.data || [], quit: q.data || [], taxas: t.data || [], cred: cr.data || [], fav: new Set((f.data || []).map(x => x.comunidade_id)) };
  }
  const taxa = ano => D.taxas.find(t => t.ano === ano) || D.taxas[D.taxas.length - 1] || { societaria: 0, solidariedade: 0, dia_vencimento: 15, venc_societaria: ano + '-03-31', minimo_efetivos: 12 };
  const recadAno = (ck, ano) => D.recad.filter(r => r.comunidade_id === ck && r.ano <= ano && r.situacao === 'aprovado').sort((a, b) => b.ano - a.ano)[0];

  // Extrato do ano calculado no aparelho (mesma regra da função extrato_ck do banco)
  function extrato(ck, ano) {
    const t = taxa(ano), r = recadAno(ck.id, ano), n = r ? r.efetivos + r.cooperadores : 0, hoje = new Date().toISOString().slice(0, 10);
    const ini = (ck.inicio_cobranca || ano + '-01-01').slice(0, 7);
    const pago = (tipo, mes) => D.quit.filter(q => q.comunidade_id === ck.id && q.ano === ano && q.tipo === tipo && (q.mes ?? null) === mes).reduce((s, q) => s + Number(q.valor_pago), 0);
    const sit = (dev, pg, venc) => dev === 0 ? 'isento' : pg >= dev - 0.001 ? 'pago' : pg > 0 ? 'parcial' : venc < hoje ? 'atraso' : 'a_vencer';
    const meses = MES.map((_, i) => {
      const venc = `${ano}-${String(i + 1).padStart(2, '0')}-${String(Math.min(t.dia_vencimento, 28)).padStart(2, '0')}`;
      const dev = venc.slice(0, 7) < ini ? 0 : Math.round(n * t.solidariedade * 100) / 100, pg = pago('solidariedade', i + 1);
      return { mes: i + 1, venc, devido: dev, pago: pg, sit: sit(dev, pg, venc) };
    });
    const sdev = String(t.venc_societaria).slice(0, 7) < ini ? 0 : Math.round(n * t.societaria * 100) / 100, spg = pago('societaria', null);
    const soc = { venc: t.venc_societaria, devido: sdev, pago: spg, sit: sit(sdev, spg, t.venc_societaria) };
    const todos = [...meses, soc];
    const aberto = todos.filter(m => m.sit === 'atraso' || (m.sit === 'parcial' && m.venc < hoje)).reduce((s, m) => s + (m.devido - m.pago), 0);
    const situacao = !ck.ativa ? 'inativa' : todos.some(m => m.sit === 'atraso') ? 'atraso' : todos.some(m => m.sit === 'parcial') ? 'parcial' : 'em_dia';
    return { meses, soc, n, r, situacao, aberto, atrasados: todos.filter(m => m.sit === 'atraso').length };
  }
  const credito = id => D.cred.filter(c => c.comunidade_id === id).reduce((s, c) => s + Number(c.valor), 0);
  const dist = id => D.dist.find(d => d.id === id);

  // ---------- Lista ----------
  function lista() {
    const pg = document.getElementById('pg');
    const min = taxa(ANO).minimo_efetivos;
    const linhas = D.cks.map(ck => ({ ck, e: extrato(ck, ANO) }));
    const ativos = linhas.filter(l => l.ck.ativa);
    const cont = s => ativos.filter(l => l.e.situacao === s).length;
    const passa = l => {
      if (distrito && l.ck.distrito_id !== distrito) return false;
      if (busca) { const b = busca.toLowerCase(); if (![l.ck.nome, l.ck.cidade, l.ck.cnpj, l.ck.codigo].some(v => String(v || '').toLowerCase().includes(b))) return false; }
      if (filtro === 'inativas') return !l.ck.ativa;
      if (!l.ck.ativa) return false;
      if (filtro === 'minimo') return l.e.r && l.e.r.efetivos < min;
      if (filtro === 'todas') return true;
      return l.e.situacao === filtro;
    };
    const vis = linhas.filter(passa).sort((a, b) => (D.fav.has(b.ck.id) - D.fav.has(a.ck.id)) || a.ck.nome.localeCompare(b.ck.nome, 'pt-BR'));
    const F = [['todas', 'Todas'], ['em_dia', 'Em dia'], ['parcial', 'Parcial'], ['atraso', 'Em atraso'], ['minimo', 'Abaixo do mínimo'], ['inativas', 'Inativas']];
    pg.innerHTML = `<h1>Comunidades</h1><p class="sub">${ativos.length} CKs ativas · ${linhas.length - ativos.length} ${linhas.length - ativos.length === 1 ? 'inativa' : 'inativas'}</p>
      <div class="g4" style="grid-template-columns:repeat(3,minmax(0,1fr))">
        <div class="cd" style="--c:#22C984"><div class="hd"><span>EM DIA</span></div><div class="big" style="color:#5FE0A8">${cont('em_dia')}</div></div>
        <div class="cd" style="--c:#F5A524"><div class="hd"><span>PARCIAL</span></div><div class="big" style="color:#F8C46A">${cont('parcial')}</div></div>
        <div class="cd" style="--c:#E5484D"><div class="hd"><span>EM ATRASO</span></div><div class="big" style="color:#FF9A9D">${cont('atraso')}</div><div class="sm">${R(ativos.reduce((s, l) => s + l.e.aberto, 0))} em aberto</div></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><input id="ckBus" class="in" placeholder="Buscar por nome, cidade ou CNPJ" value="${esc(busca)}" style="flex:1;min-width:180px">
        <select id="ckDist" class="in"><option value="">Todos os distritos</option>${D.dist.map(d => `<option value="${d.id}"${distrito === d.id ? ' selected' : ''}>${esc(d.nome)}</option>`).join('')}</select></div>
      <div class="flt">${F.map(([k, v]) => `<a data-f="${k}" class="${filtro === k ? 'on' : ''}">${v}</a>`).join('')}</div>
      <div class="g4" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${vis.map(({ ck, e }) => { const d = dist(ck.distrito_id);
        return `<div class="ckc" style="--c:${COR[e.situacao]}" data-ck="${ck.id}"><div style="flex:1;min-width:0"><b>${esc(ck.nome)}</b>${D.fav.has(ck.id) ? ' <span style="color:#F5C842">★</span>' : ''}
          <div class="sm">${d ? `<span class="dot" style="background:${esc(d.cor)}"></span>${esc(d.nome)} · ` : ''}${esc(ck.cidade || '—')}</div>
          <div class="sm">${e.r ? `${e.r.efetivos} efetivos · ${e.r.cooperadores} cooperadores` : 'Sem recadastramento'}</div>
          <div>${e.situacao !== 'em_dia' ? `<span class="tg2" style="background:${COR[e.situacao]}22;color:${COR[e.situacao]}">${NOME[e.situacao]}${e.aberto ? ' · ' + R(e.aberto) : ''}</span>` : ''}${e.r && e.r.efetivos < min && ck.ativa ? `<span class="tg2" style="background:rgba(229,72,77,.15);color:#FF9A9D">Abaixo do mínimo</span>` : ''}${!e.r && ck.ativa ? '<span class="tg2" style="background:rgba(245,165,36,.15);color:#F8C46A">Sem recadastramento</span>' : ''}</div></div>
          <span style="color:#6E6A7C">›</span></div>`; }).join('') || '<p class="sm">Nenhuma CK encontrada.</p>'}</div>`;
    const b = document.getElementById('ckBus'); b.oninput = () => { busca = b.value; lista(); const n = document.getElementById('ckBus'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
    document.getElementById('ckDist').onchange = e => { distrito = e.target.value; lista(); };
    pg.querySelectorAll('[data-f]').forEach(a => a.onclick = () => { filtro = a.dataset.f; lista(); });
    pg.querySelectorAll('[data-ck]').forEach(c => c.onclick = () => (location.hash = '#ck/' + c.dataset.ck));
  }

  // ---------- Perfil ----------
  let aba = 'resumo';
  async function perfil(id) {
    const ck = D.cks.find(c => c.id === id); const pg = document.getElementById('pg');
    if (!ck) { pg.innerHTML = '<p class="sm">CK não encontrada.</p>'; return; }
    const e = extrato(ck, ANO), d = dist(ck.distrito_id), t = taxa(ANO), cred = credito(id), r = e.r;
    const tel = String(ck.telefone || (r && r.dados.tel_presidente) || '').replace(/\D/g, '');
    const end = [ck.logradouro, ck.numero, ck.bairro, ck.cidade, ck.uf].filter(Boolean).join(', ');
    const anos = [...new Set(D.recad.filter(x => x.comunidade_id === id).map(x => x.ano))].sort().slice(-5);
    const delegados = r ? 1 + Math.floor(Math.max(0, r.efetivos - 1) / 50) : 0;
    const apta = ck.ativa && e.situacao === 'em_dia' && r && r.ano === ANO;
    pg.innerHTML = `<a class="lk" href="#comunidades">‹ Comunidades</a>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-top:6px"><div><h1>${esc(ck.nome)} <a id="fav" style="cursor:pointer;color:${D.fav.has(id) ? '#F5C842' : '#6E6A7C'}">★</a></h1>
        <p class="sub">${esc(ck.cnpj || ck.codigo || '')} · ${esc(ck.cidade || '')}${d ? ` · <span class="dot" style="background:${esc(d.cor)}"></span>${esc(d.nome)}` : ''}</p></div>
        <span class="pl" style="background:${COR[e.situacao]}22;color:${COR[e.situacao]};font-size:12px;padding:5px 12px">${NOME[e.situacao]}</span></div>
      <div class="acs">${tel ? `<a href="https://wa.me/55${tel}" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp"></i>WhatsApp</a>` : ''}${ck.email ? `<a href="mailto:${esc(ck.email)}"><i class="ti ti-mail"></i>E-mail</a>` : ''}<a id="acRec"><i class="ti ti-receipt"></i>Recibo</a>${end ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(end)}" target="_blank" rel="noopener"><i class="ti ti-route"></i>Rota</a>` : ''}${eu.admin || window.KESP_PODE('comunidades.editar') ? `<a id="acEd"><i class="ti ti-pencil"></i>Editar</a><a id="acInat"><i class="ti ti-${ck.ativa ? 'archive' : 'restore'}"></i>${ck.ativa ? 'Inativar' : 'Reativar'}</a>` : ''}</div>
      <div class="abas" style="grid-template-columns:repeat(4,1fr);max-width:560px">${[['resumo', 'Resumo'], ['pag', 'Pagamentos'], ['dir', 'Diretoria'], ['doc', 'Documentos']].map(([k, v]) => `<a data-a="${k}" class="${aba === k ? 'on' : ''}">${v}</a>`).join('')}</div><div id="ckCont"></div>`;
    pg.querySelectorAll('[data-a]').forEach(a => a.onclick = () => { aba = a.dataset.a; perfil(id); });
    document.getElementById('fav').onclick = async () => { if (D.fav.has(id)) { await sb.from('comunidades_favoritas').delete().eq('perfil_id', eu.id).eq('comunidade_id', id); D.fav.delete(id); } else { await sb.from('comunidades_favoritas').insert({ perfil_id: eu.id, comunidade_id: id }); D.fav.add(id); } perfil(id); };
    document.getElementById('acRec').onclick = () => { try { sessionStorage.setItem('kesp.recibo.ck', id); } catch (_) {} location.hash = '#recibos'; };
    const ed = document.getElementById('acEd'); if (ed) ed.onclick = () => editar(ck);
    const ia = document.getElementById('acInat'); if (ia) ia.onclick = () => inativar(ck);
    const c = document.getElementById('ckCont');
    if (aba === 'resumo') {
      c.innerHTML = `<div class="g4">
        <div class="cd s4" style="--c:${COR[e.situacao]}"><div class="hd"><span>SOLIDARIEDADE ${ANO}</span><span>${R(t.solidariedade)} por associado/mês · ${e.n} associados</span></div>
          <div class="meses">${e.meses.map(m => { const [bg, fg] = SIT_MES[m.sit]; return `<div style="background:${bg};color:${fg}">${MES[m.mes - 1]}<b>${m.pago ? R(m.pago) : m.sit === 'isento' ? '—' : 'R$ 0,00'}</b>${m.sit === 'parcial' ? `<span style="font-size:10px">falta ${R(m.devido - m.pago)}</span>` : ''}</div>`; }).join('')}</div>
          <div class="sm" style="margin-top:8px">Societária ${ANO}: <b style="color:${SIT_MES[e.soc.sit][1]}">${e.soc.sit === 'pago' ? 'paga' : e.soc.sit === 'parcial' ? 'parcial, falta ' + R(e.soc.devido - e.soc.pago) : e.soc.sit === 'atraso' ? 'em atraso, ' + R(e.soc.devido) : e.soc.sit === 'isento' ? 'isenta' : 'a vencer, ' + R(e.soc.devido)}</b>${cred ? ` · Crédito: <b style="color:#5FE0A8">${R(cred)}</b>` : ''}</div></div>
        <div class="cd s2" style="--c:#F07830"><div class="hd"><span>EVOLUÇÃO DE ASSOCIADOS</span><span>mín. ${t.minimo_efetivos} efetivos</span></div>${grafico(id, anos, t.minimo_efetivos)}</div>
        <div class="cd s2" style="--c:${apta ? '#22C984' : '#6E6A7C'}"><div class="hd"><span>ASSEMBLEIA E CADASTRO NACIONAL</span></div><div class="kv"><span>Apta para a Assembleia</span><span><b style="color:${apta ? '#5FE0A8' : '#FF9A9D'}">${apta ? 'Sim' : 'Não'}</b>${apta ? '' : ' <span class="sm">(pagamentos em dia e recadastramento do ano)</span>'}</span><span>Delegados</span><span>${delegados}</span><span>Cadastro Nacional (KB)</span><span>${ck.cn_efetivos != null ? ck.cn_efetivos + ' efetivos' + (r && ck.cn_efetivos !== r.efetivos ? ' <b style="color:#F8C46A">· diferente do recadastramento</b>' : ' ✓') : '<span class="sm">não conferido</span>'}</span><span>Recadastramento</span><span>${r ? r.ano + (r.ano === ANO ? ' ✓' : ' <b style="color:#F8C46A">· desatualizado</b>') : '<b style="color:#FF9A9D">nenhum</b>'}</span></div></div>
        <div class="cd s4" style="--c:#3B82F6"><div class="hd"><span>LINHA DO TEMPO</span></div><div class="tl" id="ckTl"><span class="sm">Carregando…</span></div></div></div>`;
      linhaTempo(id);
    } else if (aba === 'pag') {
      const { data } = await sb.from('recibos').select('serie,ano,numero,data_pagamento,valor,situacao,referencia,legado').eq('comunidade_id', id).order('data_pagamento', { ascending: false });
      c.innerHTML = (data || []).map(x => `<div class="pe" style="--c:${x.situacao === 'cancelado' ? '#6E6A7C' : '#22C984'}"><div style="flex:1;min-width:0"><b>Recibo ${x.numero}/${x.ano}</b>${x.situacao === 'cancelado' ? ' <span class="tg2" style="background:rgba(255,255,255,.08);color:#A8A3B4">Cancelado</span>' : ''}<div class="sm">${new Date(x.data_pagamento + 'T12:00').toLocaleDateString('pt-BR')} · ${esc(x.referencia || '')}</div></div><b>${R(x.valor)}</b></div>`).join('') || '<p class="sm">Nenhum recibo.</p>';
    } else if (aba === 'dir') {
      const dd = (r && r.dados) || {}, CG = [['presidente', 'Presidente', 'tel_presidente'], ['vice_presidente', 'Vice-presidente', 'tel_vice'], ['secretario_1', '1º secretário'], ['secretario_2', '2º secretário'], ['tesoureiro_1', '1º tesoureiro'], ['tesoureiro_2', '2º tesoureiro'], ['dir_juventude', 'Diretor(a) de juventude'], ['vice_dir_juventude', 'Vice de juventude'], ['membro_1', 'Membro'], ['membro_2', 'Membro'], ['membro_3', 'Membro'], ['coordenador', 'Coordenador(a) responsável']];
      c.innerHTML = r ? `<div class="cd" style="--c:#8B5CF6;max-width:640px"><div class="hd"><span>DIRETORIA · RECADASTRAMENTO ${r.ano}</span></div><div class="kv">${CG.filter(([k]) => dd[k]).map(([k, n, tk]) => `<span>${n}</span><span>${esc(dd[k])}${tk && dd[tk] ? ` · <a class="lk" href="https://wa.me/55${String(dd[tk]).replace(/\D/g, '')}" target="_blank" rel="noopener">${esc(dd[tk])}</a>` : ''}</span>`).join('')}<span>Mandato</span><span>${esc([dd.vigencia_ini, dd.vigencia_fim].filter(Boolean).map(v => new Date(v + 'T12:00').toLocaleDateString('pt-BR')).join(' a ') || '—')}</span><span>Última assembleia</span><span>${dd.data_ultima_assembleia ? new Date(dd.data_ultima_assembleia + 'T12:00').toLocaleDateString('pt-BR') : '—'}</span></div></div>` : '<p class="sm">Sem recadastramento.</p>';
    } else {
      const dd = (r && r.dados) || {}, docs = dd.documentos || [];
      c.innerHTML = `<div class="cd" style="--c:#3B82F6;max-width:640px"><div class="hd"><span>DOCUMENTOS E SEDE</span></div><div class="kv"><span>Sede</span><span>${esc(dd.sede || '—')}</span></div>${docs.length ? `<div style="margin-top:10px">${docs.map(x => `<div class="lin" style="font-size:13px">✓ ${esc(x)}</div>`).join('')}</div>` : '<p class="sm">Nenhum documento informado no recadastramento.</p>'}</div>`;
    }
  }

  function grafico(id, anos, min) {
    if (!anos.length) return '<p class="sm">Sem recadastramentos.</p>';
    const rs = anos.map(a => D.recad.find(x => x.comunidade_id === id && x.ano === a)), mx = Math.max(min, ...rs.map(r => r.efetivos + r.cooperadores)) * 1.15;
    const W = 300, H = 140, bw = W / anos.length, y = v => H - 18 - (v / mx) * (H - 34);
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-height:170px"><line x1="0" x2="${W}" y1="${y(min)}" y2="${y(min)}" stroke="#E5484D" stroke-dasharray="4 3"/><text x="2" y="${y(min) - 3}" fill="#FF9A9D" font-size="9">mín. ${min}</text>
      ${rs.map((r, i) => { const x = i * bw + bw * .2, w = bw * .6, ef = r.efetivos, co = r.cooperadores; return `<rect x="${x}" y="${y(ef)}" width="${w}" height="${H - 18 - y(ef)}" fill="#F07830" rx="3"/><rect x="${x}" y="${y(ef + co)}" width="${w}" height="${y(ef) - y(ef + co)}" fill="#3B82F6" rx="3"/><text x="${x + w / 2}" y="${y(ef + co) - 4}" fill="#F2EEEA" font-size="11" text-anchor="middle" font-weight="600">${ef + co}</text><text x="${x + w / 2}" y="${H - 4}" fill="#A8A3B4" font-size="10" text-anchor="middle">${anos[i]}</text>`; }).join('')}</svg>
      <div class="sm"><span class="dot" style="background:#F07830"></span>Efetivos · <span class="dot" style="background:#3B82F6"></span>Cooperadores</div>`;
  }

  async function linhaTempo(id) {
    const [h, rc, v] = await Promise.all([
      sb.from('comunidades_historico').select('*').eq('comunidade_id', id),
      sb.from('recibos').select('numero,ano,data_pagamento,valor,situacao').eq('comunidade_id', id),
      sb.from('visitas').select('data,tipo').eq('comunidade_id', id)
    ]);
    const ev = [
      ...(h.data || []).map(x => ({ d: x.feito_em.slice(0, 10), t: { inativada: 'CK inativada', reativada: 'CK reativada', distrito: 'Distrito alterado' }[x.tipo] || x.tipo, s: x.descricao, c: '#6E6A7C' })),
      ...(rc.data || []).map(x => ({ d: x.data_pagamento, t: `Recibo ${x.numero}/${x.ano}`, s: R(x.valor) + (x.situacao === 'cancelado' ? ' · cancelado' : ''), c: '#22C984' })),
      ...(v.data || []).map(x => ({ d: x.data, t: x.tipo, c: '#F07830' })),
      ...D.recad.filter(x => x.comunidade_id === id).map(x => ({ d: (x.aprovado_em || x.ano + '-01-01').slice(0, 10), t: `Recadastramento ${x.ano}`, s: x.situacao === 'aprovado' ? 'aprovado' : x.situacao, c: '#3B82F6' }))
    ].sort((a, b) => b.d.localeCompare(a.d)).slice(0, 15);
    const el = document.getElementById('ckTl'); if (!el) return;
    el.innerHTML = ev.map(x => `<div style="--c:${x.c}"><b>${esc(x.t)}</b> <span class="sm">· ${new Date(x.d + 'T12:00').toLocaleDateString('pt-BR')}${x.s ? ' · ' + esc(x.s) : ''}</span></div>`).join('') || '<span class="sm">Nada registrado ainda.</span>';
  }

  function editar(ck) {
    const opt = '<option value="">Sem distrito</option>' + D.dist.map(d => `<option value="${d.id}"${ck.distrito_id === d.id ? ' selected' : ''}>${esc(d.nome)}</option>`).join('');
    const f = (n, l, v, t) => `<label>${l}</label><input name="${n}" value="${esc(v ?? '')}"${t ? ` type="${t}"` : ''}>`;
    const dlg = document.createElement('div'); dlg.className = 'conf';
    dlg.innerHTML = `<div class="cx fm" style="max-width:520px;max-height:90vh;overflow-y:auto"><b>Editar ${esc(ck.nome)}</b>${f('nome', 'Nome', ck.nome)}<div class="dois"><div><label>CNPJ</label><input name="cnpj" data-cnpj value="${esc(ck.cnpj || '')}"></div><div><label>Distrito</label><select name="distrito_id">${opt}</select></div></div>
      ${f('razao_social', 'Razão social', ck.razao_social)}<div class="dois"><div>${f('telefone', 'Telefone', ck.telefone)}</div><div>${f('email', 'E-mail', ck.email, 'email')}</div></div>
      <div class="dois"><div>${f('logradouro', 'Rua', ck.logradouro)}</div><div>${f('numero', 'Número', ck.numero)}</div></div><div class="dois"><div>${f('bairro', 'Bairro', ck.bairro)}</div><div><label>CEP</label><input name="cep" data-cep value="${esc(ck.cep || '')}"></div></div>
      <div class="dois"><div>${f('cidade', 'Cidade', ck.cidade)}</div><div>${f('uf', 'UF', ck.uf)}</div></div><div class="dois"><div>${f('cn_efetivos', 'Efetivos no Cadastro Nacional', ck.cn_efetivos, 'number')}</div><div>${f('cn_conferido_em', 'Conferido em', ck.cn_conferido_em, 'date')}</div></div>
      <div style="display:flex;gap:8px;margin-top:14px"><button class="btn sec" style="flex:1" data-x>Cancelar</button><button class="btn" style="flex:1" data-ok>Salvar</button></div></div>`;
    document.body.appendChild(dlg); window.KESP_BUSCA.ligar(dlg);
    dlg.querySelector('[data-x]').onclick = () => dlg.remove();
    dlg.querySelector('[data-ok]').onclick = async () => {
      const v = {}; dlg.querySelectorAll('[name]').forEach(i => (v[i.name] = i.value.trim() || null));
      if (!v.nome) { alert('Informe o nome da CK.'); return; }
      v.cn_efetivos = v.cn_efetivos ? parseInt(v.cn_efetivos, 10) : null;
      const r = await sb.from('comunidades').update(v).eq('id', ck.id);
      if (r.error) { alert('Não foi possível salvar.' + (/unique/i.test(r.error.message) ? ' Esse CNPJ já está em outra CK.' : '')); return; }
      dlg.remove(); await carregar(); perfil(ck.id);
    };
  }

  async function inativar(ck) {
    let motivo = null;
    if (ck.ativa) { motivo = prompt('Motivo da inativação:'); if (motivo === null) return; if (!motivo.trim()) { alert('Informe o motivo.'); return; } }
    else if (!confirm('Reativar ' + ck.nome + '? Ela volta para a lista e para a cobrança.')) return;
    const r = await sb.from('comunidades').update(ck.ativa ? { ativa: false, motivo_inativacao: motivo.trim() } : { ativa: true }).eq('id', ck.id);
    if (r.error) { alert('Não foi possível concluir.'); return; }
    await carregar(); perfil(ck.id);
  }

  window.KESP_CKS = {
    base: {
      async carregar(cliente, perfilEu) { sb = cliente; eu = perfilEu; await carregar(); return D; },
      dados: () => D, extrato, taxa, credito, dist, COR, NOME, R, MES
    },
    async abrir(cliente, perfilEu, alvo) {
      sb = cliente; eu = perfilEu; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>';
      if (!D || !alvo) await carregar();
      if (alvo) { aba = 'resumo'; perfil(alvo); } else lista();
    }
  };
})();

// ===================== Distritos =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CORES = ['#2E9E5B', '#E0B000', '#D9363E', '#2F6FEB', '#8B5CF6', '#F07830', '#14B8A6', '#EC4899', '#6E6A7C'];
  let sb, eu, B;
  async function abrir(cliente, perfil) {
    sb = cliente; eu = perfil; B = window.KESP_CKS.base; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>';
    await B.carregar(sb, eu); render();
  }
  function render() {
    const D = B.dados(), ANO = new Date().getFullYear(), min = B.taxa(ANO).minimo_efetivos, R = B.R;
    const podeEd = eu.admin || window.KESP_PODE('comunidades.editar');
    const card = (d) => {
      const cks = D.cks.filter(c => c.ativa && (d ? c.distrito_id === d.id : !c.distrito_id)).map(ck => ({ ck, e: B.extrato(ck, ANO) }));
      const n = cks.length, c = s => cks.filter(x => x.e.situacao === s);
      const ed = c('em_dia').length, pa = c('parcial'), at = c('atraso'), abaixo = cks.filter(x => x.e.r && x.e.r.efetivos < min);
      const ef = cks.reduce((s, x) => s + (x.e.r ? x.e.r.efetivos : 0), 0), co = cks.reduce((s, x) => s + (x.e.r ? x.e.r.cooperadores : 0), 0);
      const pct = v => n ? (v / n * 100) : 0;
      const grupo = (t, lista, cor, txt, info) => lista.length ? `<div class="dgr" style="--c:${cor};--t:${txt}"><h4>${t}</h4>${lista.map(x => `<div data-ck="${x.ck.id}"><span>${esc(x.ck.nome)}</span><span style="color:${txt}">${info(x)}</span></div>`).join('')}</div>` : '';
      return `<div class="cd" style="--c:${d ? esc(d.cor) : '#6E6A7C'}"><div class="hd" style="font-size:13px;letter-spacing:0;color:#F2EEEA"><b><span class="dot" style="background:${d ? esc(d.cor) : '#6E6A7C'}"></span>${d ? 'Distrito ' + esc(d.nome) : 'Sem distrito'}</b><span class="sm">${n} CK${n === 1 ? '' : 's'}${podeEd && d ? ` · <a class="lk" data-ed="${d.id}">Editar</a>` : ''}</span></div>
        ${n ? `<p class="lb" style="font-size:10px;color:#A8A3B4;margin:6px 0 0;letter-spacing:.06em">PAGAMENTOS</p><div class="dbar">${ed ? `<i style="width:${pct(ed)}%;background:#22C984">${ed}</i>` : ''}${pa.length ? `<i style="width:${pct(pa.length)}%;background:#F5A524">${pa.length}</i>` : ''}${at.length ? `<i style="width:${pct(at.length)}%;background:#E5484D;color:#fff">${at.length}</i>` : ''}</div>
        <div class="sm"><span style="color:#5FE0A8">● ${ed} em dia</span> · <span style="color:#F8C46A">● ${pa.length} parcial</span> · <span style="color:#FF9A9D">● ${at.length} em atraso</span></div>
        <p style="margin:8px 0 0;font-size:13px"><b>${ef + co}</b> associados · ${ef} efetivos e ${co} cooperadores</p>
        ${grupo('PENDÊNCIA PARCIAL', pa, '#F5A524', '#F8C46A', x => 'falta ' + R(x.e.aberto))}${grupo('EM ATRASO', at, '#E5484D', '#FF9A9D', x => x.e.atrasados + (x.e.atrasados === 1 ? ' mês · ' : ' meses · ') + R(x.e.aberto))}${grupo('ABAIXO DO MÍNIMO DE EFETIVOS', abaixo, '#B4232A', '#FF9A9D', x => x.e.r.efetivos + ' efetivos')}
        ${!pa.length && !at.length && !abaixo.length ? '<div class="dgr" style="--c:#22C984;--t:#5FE0A8"><h4>✓ TUDO EM ORDEM</h4></div>' : ''}` : '<p class="sm" style="margin:6px 0 0">Nenhuma CK neste distrito.</p>'}</div>`;
    };
    const semDist = D.cks.some(c => c.ativa && !c.distrito_id);
    document.getElementById('pg').innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h1>Distritos</h1><p class="sub">Toque no nome da CK para abrir o perfil</p></div>${podeEd ? '<button class="btn" id="novoD">Novo distrito</button>' : ''}</div>
      <div class="g4" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">${D.dist.map(card).join('')}${semDist ? card(null) : ''}</div>`;
    document.querySelectorAll('[data-ck]').forEach(x => x.onclick = () => (location.hash = '#ck/' + x.dataset.ck));
    document.querySelectorAll('[data-ed]').forEach(x => x.onclick = () => editar(D.dist.find(d => d.id === x.dataset.ed)));
    const nv = document.getElementById('novoD'); if (nv) nv.onclick = () => editar(null);
  }
  function editar(d) {
    const D = B.dados(), nCks = d ? D.cks.filter(c => c.distrito_id === d.id).length : 0;
    let cor = d ? d.cor : CORES[D.dist.length % CORES.length];
    const dlg = document.createElement('div'); dlg.className = 'conf';
    dlg.innerHTML = `<div class="cx fm"><b>${d ? 'Editar distrito' : 'Novo distrito'}</b>
      <label>Nome</label><input name="nome" value="${esc(d ? d.nome : '')}" placeholder="Ex.: Verde">
      <label>Cor</label><div class="pal">${CORES.map(c => `<a data-c="${c}" style="background:${c}" class="${c === cor ? 'on' : ''}"></a>`).join('')}</div>
      <label>Ordem</label><input name="ordem" type="number" value="${d ? d.ordem : D.dist.length + 1}">
      <div style="display:flex;gap:8px;margin-top:14px">${d ? `<button class="btn sec" style="flex:1;color:#FF9A9D" data-del ${nCks ? 'disabled title="Mova as CKs antes de excluir"' : ''}>Excluir</button>` : ''}<button class="btn sec" style="flex:1" data-x>Cancelar</button><button class="btn" style="flex:1" data-ok>Salvar</button></div>
      ${d && nCks ? `<p class="sm" style="margin:8px 0 0">Este distrito tem ${nCks} CK(s). Para excluir, mova as CKs para outro distrito.</p>` : ''}</div>`;
    document.body.appendChild(dlg);
    dlg.querySelectorAll('[data-c]').forEach(a => a.onclick = () => { cor = a.dataset.c; dlg.querySelectorAll('[data-c]').forEach(x => x.classList.toggle('on', x === a)); });
    dlg.querySelector('[data-x]').onclick = () => dlg.remove();
    const del = dlg.querySelector('[data-del]');
    if (del) del.onclick = async () => { if (nCks || !confirm('Excluir o distrito ' + d.nome + '?')) return; const r = await sb.from('distritos').delete().eq('id', d.id); if (r.error) { alert('Não foi possível excluir.'); return; } dlg.remove(); await B.carregar(sb, eu); render(); };
    dlg.querySelector('[data-ok]').onclick = async () => {
      const nome = dlg.querySelector('[name=nome]').value.trim(), ordem = parseInt(dlg.querySelector('[name=ordem]').value, 10) || 0;
      if (!nome) { alert('Informe o nome.'); return; }
      const r = d ? await sb.from('distritos').update({ nome, cor, ordem }).eq('id', d.id) : await sb.from('distritos').insert({ nome, cor, ordem });
      if (r.error) { alert(/unique|duplicate/i.test(r.error.message) ? 'Já existe um distrito com esse nome.' : 'Não foi possível salvar.'); return; }
      dlg.remove(); await B.carregar(sb, eu); render();
    };
  }
  window.KESP_DISTRITOS = { abrir };
})();

// ===================== Recibos =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MESX = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const KOLPING = { nome: 'Kolping Estadual de São Paulo', cnpj: '15.766.152/0001-77', end: 'R. Rio Branco, 36 – Cohab II – Carapicuíba-SP · CEP 06326-030', fone: '(11) 4183-6018 / 4183-2194', email: 'oke-sp@kolping.org.br', site: 'www.kolping-sp.org.br' };
  let sb, eu, B, aba = 'emitir', st = null;
  const R = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dataBR = d => new Date(d + 'T12:00').toLocaleDateString('pt-BR');
  const r2 = v => Math.round(v * 100) / 100;

  // ---------- valor por extenso ----------
  function extenso(v) {
    const U = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const D = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const C = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    const ate999 = n => { if (n === 100) return 'cem'; const c = Math.floor(n / 100), r = n % 100, p = []; if (c) p.push(C[c]); if (r < 20) { if (r) p.push(U[r]); } else { p.push(D[Math.floor(r / 10)] + (r % 10 ? ' e ' + U[r % 10] : '')); } return p.join(' e '); };
    const inteiro = n => { if (!n) return 'zero'; const mil = Math.floor(n / 1000), r = n % 1000, p = []; if (mil) p.push(mil === 1 ? 'mil' : ate999(mil) + ' mil'); if (r) p.push(ate999(r)); return p.join(r && (r < 100 || r % 100 === 0) ? ' e ' : ' '); };
    const i = Math.floor(v + 1e-9), c = Math.round((v - i) * 100);
    let t = i ? inteiro(i) + (i === 1 ? ' real' : ' reais') : '';
    if (c) t += (t ? ' e ' : '') + ate999(c) + (c === 1 ? ' centavo' : ' centavos');
    return t || 'zero real';
  }

  // ---------- emissão ----------
  function chave(tipo, ano, mes) { return tipo + ':' + ano + ':' + (mes || 0); }
  function linhasAno(ck, ano) {
    const e = B.extrato(ck, ano), L = [];
    if (e.soc.devido > 0) L.push({ k: chave('societaria', ano, 0), tipo: 'societaria', ano, mes: null, devido: e.soc.devido, ja: e.soc.pago, venc: e.soc.venc, sit: e.soc.sit, nome: 'Societária ' + ano });
    e.meses.forEach(m => { if (m.devido > 0) L.push({ k: chave('solidariedade', ano, m.mes), tipo: 'solidariedade', ano, mes: m.mes, devido: m.devido, ja: m.pago, venc: m.venc, sit: m.sit, nome: MESX[m.mes - 1] + '/' + ano }); });
    return L;
  }
  function todasLinhas(ck) { const a = new Date().getFullYear(); return [a - 1, a, a + 1].flatMap(y => linhasAno(ck, y)); }

  function calcular() {
    const ck = st.ck; if (!ck) return null;
    const cred = Math.max(0, B.credito(ck.id)), V = r2(st.valor || 0), L = todasLinhas(ck).filter(l => st.sel.has(l.k)).sort((a, b) => a.venc.localeCompare(b.venc));
    let A = V + cred; const itens = [];
    L.forEach(l => { const need = r2(l.devido - l.ja), take = r2(Math.min(need, Math.max(A, 0))); A = r2(A - take); itens.push({ ...l, pago: take, falta: r2(need - take) }); });
    const T = r2(itens.reduce((s, i) => s + i.pago, 0)), cu = r2(Math.min(cred, T)), cn = r2(V - (T - cu));
    return { V, cred, itens, T, cu, cn: Math.max(0, cn), saldo: r2(cred - cu + Math.max(0, cn)), parcial: itens.find(i => i.falta > 0) };
  }
  function autoSelecionar() {
    const ck = st.ck; st.sel = new Set(); if (!ck) return;
    let A = (st.valor || 0) + Math.max(0, B.credito(ck.id));
    const abertos = todasLinhas(ck).filter(l => l.ja < l.devido - 0.001).sort((a, b) => a.venc.localeCompare(b.venc));
    for (const l of abertos) { if (A <= 0.001) break; st.sel.add(l.k); A -= (l.devido - l.ja); }
  }
  function texto(c, ck, dataPg) {
    const sol = c.itens.filter(i => i.tipo === 'solidariedade' && i.pago > 0), soc = c.itens.find(i => i.tipo === 'societaria' && i.pago > 0);
    const nomes = sol.map(i => MESX[i.mes - 1] + (sol.some(x => x.ano !== i.ano) || i.ano !== new Date(dataPg + 'T12:00').getFullYear() ? ' de ' + i.ano : ''));
    const lista = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1] : a[0] || '';
    const ant = sol.filter(i => i.venc > dataPg && i.venc.slice(0, 7) > dataPg.slice(0, 7));
    const anoRef = sol.length && sol.every(i => i.ano === sol[0].ano) ? ' de ' + sol[0].ano : '';
    let ref = [];
    if (sol.length) ref.push('à taxa de solidariedade de ' + lista(nomes.map((n, k) => n.replace(' de ' + sol[k].ano, ''))) + anoRef + (ant.length && ant.length < sol.length ? ' (sendo ' + lista(ant.map(i => MESX[i.mes - 1])) + ' antecipadamente)' : ant.length ? ', antecipadamente' : ''));
    if (soc) ref.push('à taxa societária de ' + soc.ano);
    let t = `A <b>${KOLPING.nome}</b>, CNPJ ${KOLPING.cnpj}, recebeu da <b>${esc((ck.razao_social || ck.nome).toUpperCase())}</b>${ck.cnpj ? ', CNPJ ' + esc(ck.cnpj) : ''}, o valor de <b>${R(c.V)}</b> (${extenso(c.V)}), referente ${ref.join(' e ') || 'a contribuições'}${c.parcial ? ' (pagamento parcial)' : ''}.`;
    if (c.cu > 0) t += ` Foram usados <b>${R(c.cu)}</b> de crédito de pagamentos anteriores.`;
    if (c.parcial) t += ` Permanece em aberto <b>${R(c.parcial.falta)}</b> de ${c.parcial.tipo === 'societaria' ? 'taxa societária de ' + c.parcial.ano : MESX[c.parcial.mes - 1] + ' de ' + c.parcial.ano}.`;
    if (c.cn > 0) t += ` O valor pago ficou <b>${R(c.cn)}</b> acima do devido e foi guardado como crédito, que será usado no próximo mês. Saldo de crédito após este pagamento: <b>${R(c.saldo)}</b>.`;
    return t;
  }

  function telaEmitir() {
    const D = B.dados(), ANO = new Date().getFullYear(), c = calcular(), ck = st.ck;
    const ativos = D.cks.filter(x => x.ativa).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const e = ck ? B.extrato(ck, ANO) : null, taxaSol = B.taxa(ANO).solidariedade;
    let alerta = '';
    if (ck && c && e.n && st.valor && Math.abs(st.valor / (e.n * taxaSol) - Math.round(st.valor / (e.n * taxaSol))) > 1e-6) { for (let m = 1; m <= 3; m++) { const k = st.valor / (m * taxaSol); if (Math.abs(k - Math.round(k)) < 1e-6 && Math.round(k) !== e.n && Math.abs(Math.round(k) - e.n) <= Math.max(3, e.n * 0.5)) { alerta = `<div class="alerta">⚠ Valor diferente do esperado: ${R(st.valor)} equivale a ${m === 1 ? '' : m + ' meses de '}${Math.round(k)} associados × ${R(taxaSol)}, mas o recadastramento tem ${e.n}. A CK pode estar pagando um valor desatualizado.</div>`; break; } } }
    const anos = [ANO - 1, ANO, ANO + 1];
    document.getElementById('cont').innerHTML = `<div class="rec2"><div class="fm">
      <label>Comunidade</label><select id="rCk"><option value="">Escolha a CK</option>${ativos.map(x => `<option value="${x.id}"${ck && ck.id === x.id ? ' selected' : ''}>${esc(x.nome)}</option>`).join('')}</select>
      ${ck ? `<p class="sm" style="margin:6px 0 0">${e.n} associados · ${R(e.n * taxaSol)} por mês · crédito atual <b style="color:#5FE0A8">${R(Math.max(0, B.credito(ck.id)))}</b></p>` : ''}
      <div class="dois"><div><label>Valor recebido</label><input id="rVal" inputmode="decimal" placeholder="0,00" value="${st.valor ? String(st.valor).replace('.', ',') : ''}"></div><div><label>Data do pagamento</label><input id="rData" type="date" value="${st.data}"></div></div>
      <div class="dois"><div><label>Forma de pagamento</label><select id="rForma">${['PIX', 'Transferência', 'Depósito', 'Dinheiro', 'Boleto'].map(f => `<option${st.forma === f ? ' selected' : ''}>${f}</option>`).join('')}</select></div><div><label>Modelo</label><select id="rMod"><option value="padrao"${st.modelo === 'padrao' ? ' selected' : ''}>Padrão</option><option value="timbrado"${st.modelo === 'timbrado' ? ' selected' : ''}>Papel timbrado</option></select></div></div>
      ${ck ? `<label>Meses (toque para marcar ou desmarcar)</label><div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 6px"><a class="lk" id="rAnt">‹</a><b>${anos[st.ano]}</b><a class="lk" id="rPro">›</a></div>
        <div class="gmes">${linhasAno(ck, anos[st.ano]).map(l => { const pago = l.ja >= l.devido - 0.001, it = c && c.itens.find(i => i.k === l.k);
          if (pago) return `<button class="pg">${l.tipo === 'societaria' ? 'Societária' : MESX[l.mes - 1].slice(0, 3)}<b>pago</b></button>`;
          return `<button data-k="${l.k}" class="${st.sel.has(l.k) ? (it && it.falta > 0 ? 'par' : 'sel') : l.sit === 'atraso' ? 'at' : ''}">${l.tipo === 'societaria' ? 'Societária' : MESX[l.mes - 1].slice(0, 3)}<b>${R(l.devido - l.ja)}</b></button>`; }).join('')}</div>` : ''}
      <label>Observação (opcional, aparece no recibo)</label><input id="rObs" value="${esc(st.obs)}">
      ${alerta}
      </div><div>
      ${ck && c && st.valor ? `<div class="cd" style="--c:${c.parcial ? '#F5A524' : '#22C984'};margin-bottom:10px"><div class="kv"><span>Disponível</span><span>${R(c.V)}${c.cred ? ' + ' + R(c.cred) + ' de crédito' : ''}</span><span>Meses selecionados</span><span>${c.itens.length} · ${R(c.T)}</span>${c.parcial ? `<span style="color:#F8C46A">Último parcial</span><span style="color:#F8C46A">falta ${R(c.parcial.falta)}</span>` : `<span style="color:#5FE0A8">Sobra → crédito</span><span style="color:#5FE0A8">${R(c.cn)}</span>`}</div></div>
        <div class="prev"><b>Prévia do recibo</b><p style="margin:6px 0 0">${texto(c, ck, st.data)}</p><table>${c.itens.map(i => `<tr><td>${i.tipo === 'societaria' ? 'Societária ' + i.ano : 'Solidariedade ' + MESX[i.mes - 1] + '/' + i.ano}${i.falta > 0 ? ' · parcial' : ''}</td><td>${R(i.pago)}</td></tr>`).join('')}${c.cu ? `<tr><td>Crédito anterior usado</td><td>− ${R(c.cu)}</td></tr>` : ''}${c.cn ? `<tr><td>Guardado como crédito</td><td>${R(c.cn)}</td></tr>` : ''}<tr><td><b>Valor recebido</b></td><td><b>${R(c.V)}</b></td></tr></table></div>
        <button class="btn" id="rEmit" style="width:100%;margin-top:12px"${c.itens.length || c.cn ? '' : ' disabled'}>Emitir recibo</button>` : '<div class="cd" style="--c:#6E6A7C"><p class="sm" style="margin:0">Escolha a CK e informe o valor recebido para ver os meses e a prévia do recibo.</p></div>'}
      </div></div>`;
    const g = id => document.getElementById(id);
    g('rCk').onchange = ev => { st.ck = D.cks.find(x => x.id === ev.target.value) || null; autoSelecionar(); setTimeout(telaEmitir, 0); };
    g('rVal').onchange = ev => { st.valor = parseFloat(ev.target.value.replace(/\./g, '').replace(',', '.')) || 0; autoSelecionar(); setTimeout(telaEmitir, 0); };
    g('rData').onchange = ev => { st.data = ev.target.value; setTimeout(telaEmitir, 0); };
    g('rForma').onchange = ev => (st.forma = ev.target.value);
    g('rMod').onchange = ev => (st.modelo = ev.target.value);
    g('rObs').onchange = ev => (st.obs = ev.target.value);
    if (g('rAnt')) { g('rAnt').onclick = () => { if (st.ano > 0) { st.ano--; telaEmitir(); } }; g('rPro').onclick = () => { if (st.ano < 2) { st.ano++; telaEmitir(); } }; }
    document.querySelectorAll('.gmes [data-k]').forEach(b => b.onclick = () => { st.sel.has(b.dataset.k) ? st.sel.delete(b.dataset.k) : st.sel.add(b.dataset.k); telaEmitir(); });
    const em = g('rEmit'); if (em) em.onclick = () => emitir(c);
  }

  async function emitir(c) {
    const ck = st.ck;
    if (!st.data) { alert('Informe a data do pagamento.'); return; }
    if (!confirm(`Emitir o recibo de ${R(c.V)} para ${ck.nome}?`)) return;
    const b = document.getElementById('rEmit'); b.disabled = true; b.textContent = 'Emitindo…';
    const itens = c.itens.map(i => ({ tipo: i.tipo, ano: i.ano, mes: i.mes, devido: i.devido, pago: i.pago, credito: 0 }));
    const { data: id, error } = await sb.rpc('emitir_recibo', { p_ck: ck.id, p_data: st.data, p_forma: st.forma, p_valor: c.V, p_itens: itens, p_credito_usado: c.cu, p_credito_novo: c.cn, p_referencia: texto(c, ck, st.data), p_modelo: st.modelo, p_obs: st.obs || null });
    if (error) { b.disabled = false; b.textContent = 'Emitir recibo'; alert('Não foi possível emitir: ' + error.message); try { await sb.from('erros_sistema').insert({ tela: 'recibos', mensagem: 'Falha ao emitir recibo', detalhe: error.message }); } catch (_) {} return; }
    await B.carregar(sb, eu); novoEstado(); abrirRecibo(id);
  }

  // ---------- documento ----------
  async function abrirRecibo(id) {
    const { data: r } = await sb.from('recibos').select('*').eq('id', id).maybeSingle(); if (!r) return;
    let quem = null; if (r.emitido_por) { const p = await sb.from('perfis').select('nome,cargo,assinatura_url').eq('id', r.emitido_por).maybeSingle(); quem = p.data; }
    const html = documento(r, quem);
    const dlg = document.createElement('div'); dlg.className = 'conf';
    dlg.innerHTML = `<div class="cx" style="max-width:720px;max-height:92vh;overflow-y:auto;padding:12px"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button class="btn" data-imp>Imprimir / Salvar PDF</button>${r.situacao !== 'cancelado' && (eu.admin || window.KESP_PODE('recibos.cancelar')) ? '<button class="btn sec" data-can style="color:#FF9A9D">Cancelar recibo</button>' : ''}<button class="btn sec" data-x style="margin-left:auto">Fechar</button></div><div style="background:#E9E5DF;padding:10px;border-radius:10px">${html}</div></div>`;
    document.body.appendChild(dlg);
    dlg.querySelector('[data-x]').onclick = () => { dlg.remove(); if (aba === 'historico') render(); };
    dlg.querySelector('[data-imp]').onclick = () => { const w = window.open('', '_blank'); w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Recibo ${r.numero}-${r.ano}</title><style>@page{size:A4;margin:12mm}body{margin:0;background:#fff}</style></head><body>${html}<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`); w.document.close(); };
    const cn = dlg.querySelector('[data-can]');
    if (cn) cn.onclick = async () => { const m = prompt('Motivo do cancelamento:'); if (m === null) return; if (!m.trim()) { alert('Informe o motivo.'); return; } const x = await sb.from('recibos').update({ situacao: 'cancelado', cancelado_motivo: m.trim() }).eq('id', r.id); if (x.error) { alert('Não foi possível cancelar: ' + x.error.message); return; } await B.carregar(sb, eu); dlg.remove(); abrirRecibo(r.id); };
  }

  function documento(r, quem) {
    const base = location.href.split('#')[0].replace(/[^/]*$/, '');
    const logo = base + 'logo-kolping.png';
    const timbrado = r.modelo === 'timbrado';
    const itens = (r.itens || []).map(i => `<tr><td style="padding:7px 0;border-bottom:1px solid #EFE9E2">${i.tipo === 'solidariedade' ? 'Solidariedade ' + (i.mes ? MESX[i.mes - 1] + '/' + i.ano : '') : i.tipo === 'societaria' ? 'Societária ' + (i.ano || '') : esc(i.descricao || i.tipo)}${i.devido && i.pago < i.devido - 0.001 ? ' · parcial' : ''}</td><td style="text-align:right;border-bottom:1px solid #EFE9E2">${i.devido ? R(i.devido) : ''}</td><td style="text-align:right;border-bottom:1px solid #EFE9E2">${R(i.pago)}</td></tr>`).join('');
    const corpo = r.referencia && /recebeu/.test(r.referencia) ? r.referencia : `A <b>${KOLPING.nome}</b>, CNPJ ${KOLPING.cnpj}, recebeu de <b>${esc(r.pagador_nome)}</b>${r.pagador_doc ? ', CNPJ ' + esc(r.pagador_doc) : ''}, o valor de <b>${R(r.valor)}</b> (${extenso(Number(r.valor))}), referente a ${esc(r.referencia || 'contribuições')}.`;
    const cancel = r.situacao === 'cancelado' ? `<div style="position:absolute;top:40%;left:0;right:0;text-align:center;transform:rotate(-18deg);font-size:64px;font-weight:800;color:rgba(217,54,62,.22);letter-spacing:6px">CANCELADO</div>` : '';
    const topo = timbrado
      ? `<div style="height:38px;background:#F26B1D;display:flex;align-items:center;padding:0 22px"><div style="background:#fff;padding:3px 6px;border-radius:2px;display:flex"><img src="${logo}" style="height:24px"></div></div>`
      : `<div style="height:6px;background:linear-gradient(90deg,#F07830,#FFB070)"></div><div style="padding:18px 30px 0"><img src="${logo}" style="height:42px"></div>`;
    const rodape = timbrado
      ? `<div style="margin:0 30px;border-top:1px solid #CFC8C0;padding:8px 0 14px;text-align:right;font-size:9.5px;color:#6E6E6E;line-height:1.5">${KOLPING.end}<br>Fone: ${KOLPING.fone} · Facebook: Kolping Estadual SP<br>E-mail: ${KOLPING.email} · ${KOLPING.site}</div>`
      : `<div style="background:#FAF8F4;border-top:1px solid #EDE8E0;padding:10px 30px;font-size:9.5px;color:#8A8078;text-align:center">${KOLPING.nome} · CNPJ ${KOLPING.cnpj} · ${KOLPING.end} · ${KOLPING.fone}</div>`;
    return `<div style="position:relative;max-width:680px;margin:0 auto;background:#fff;color:#1E1B19;font-family:Arial,Helvetica,sans-serif;font-size:13px;overflow:hidden;border-radius:4px">${cancel}${topo}
      <div style="padding:18px 30px 6px"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px"><div style="background:#FBF0E6;border-left:4px solid #F07830;border-radius:10px;padding:10px 16px"><div style="font-size:10px;letter-spacing:.15em;color:#C85E1C">RECIBO Nº</div><div style="font-size:24px;font-weight:700">${r.numero}/${r.ano}</div></div>
        <div style="text-align:right"><div style="font-size:10px;letter-spacing:.15em;color:#8A8078">VALOR RECEBIDO</div><div style="font-size:28px;font-weight:700;color:#C85E1C">${R(r.valor)}</div><div style="font-size:11px;color:#8A8078;font-style:italic">${extenso(Number(r.valor))}</div></div></div>
        <div style="background:#FFFBF7;border-left:3px solid #F07830;border-radius:8px;padding:12px 16px;line-height:1.6">${corpo}</div>
        ${itens ? `<table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:12px"><tr style="color:#8A8078;font-size:10px;letter-spacing:.08em"><td style="padding:6px 0">REFERÊNCIA</td><td style="text-align:right">DEVIDO</td><td style="text-align:right">PAGO</td></tr>${itens}</table>` : ''}
        <div style="display:flex;gap:40px;background:#F7F4F0;border-radius:8px;padding:10px 16px;margin-top:14px"><div><div style="font-size:10px;letter-spacing:.1em;color:#8A8078">FORMA DE PAGAMENTO</div><b>${esc(r.forma_pagamento || '—')}</b></div><div><div style="font-size:10px;letter-spacing:.1em;color:#8A8078">DATA DO PAGAMENTO</div><b>${dataBR(r.data_pagamento)}</b></div></div>
        ${r.observacao ? `<p style="font-size:12px;color:#5A4E46;margin:10px 0 0">Obs.: ${esc(r.observacao)}</p>` : ''}
        <p style="text-align:right;color:#5A4E46;margin:16px 0 0">Carapicuíba, ${new Date(r.data_pagamento + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
        <div style="text-align:center;margin:6px 0 14px">${quem && quem.assinatura_url ? `<img src="${esc(quem.assinatura_url)}" style="height:54px;display:block;margin:0 auto -4px">` : '<div style="height:50px"></div>'}<div style="border-top:1px solid #1E1B19;width:260px;margin:0 auto;padding-top:4px;font-weight:700">${esc(quem ? quem.nome : 'Kolping Estadual de São Paulo')}</div><div style="color:#8A8078;font-size:12px">${esc(quem && quem.cargo ? quem.cargo : '')}${quem && quem.cargo ? ' · ' : ''}${KOLPING.nome}</div></div>
        ${r.situacao === 'cancelado' ? `<p style="color:#D9363E;font-size:12px;text-align:center;margin:0 0 10px">Recibo cancelado em ${new Date(r.cancelado_em).toLocaleDateString('pt-BR')}: ${esc(r.cancelado_motivo || '')}</p>` : ''}
      </div>${rodape}</div>`;
  }

  // ---------- histórico ----------
  async function telaHistorico() {
    const c = document.getElementById('cont'); c.innerHTML = '<p class="sm">Carregando…</p>';
    const { data } = await sb.from('recibos').select('id,serie,ano,numero,pagador_nome,data_pagamento,valor,situacao,legado').order('emitido_em', { ascending: false }).limit(300);
    let f = '';
    const desenhar = () => {
      const lista = (data || []).filter(r => !f || (r.pagador_nome + ' ' + r.numero + '/' + r.ano).toLowerCase().includes(f.toLowerCase()));
      c.querySelector('#hl').innerHTML = lista.map(r => `<div class="pe" style="--c:${r.situacao === 'cancelado' ? '#6E6A7C' : '#22C984'};cursor:pointer" data-rec="${r.id}"><div style="flex:1;min-width:0"><b>${r.serie} ${r.numero}/${r.ano}</b>${r.situacao === 'cancelado' ? ' <span class="tg2" style="background:rgba(255,255,255,.08);color:#A8A3B4">Cancelado</span>' : ''}${r.legado ? ' <span class="tg2" style="background:rgba(59,130,246,.15);color:#93B8FF">Sistema anterior</span>' : ''}<div class="sm">${esc(r.pagador_nome)} · ${dataBR(r.data_pagamento)}</div></div><b>${R(r.valor)}</b></div>`).join('') || '<p class="sm">Nenhum recibo encontrado.</p>';
      c.querySelectorAll('[data-rec]').forEach(x => x.onclick = () => abrirRecibo(x.dataset.rec));
    };
    c.innerHTML = `<input class="in" id="hb" placeholder="Buscar por CK ou número" style="width:100%;margin-bottom:10px"><div id="hl"></div>`;
    c.querySelector('#hb').oninput = e => { f = e.target.value; desenhar(); }; desenhar();
  }

  function novoEstado() { st = { ck: null, valor: 0, data: new Date().toISOString().slice(0, 10), forma: 'PIX', modelo: 'padrao', obs: '', sel: new Set(), ano: 1 }; }
  function render() {
    const pg = document.getElementById('pg');
    pg.innerHTML = `<h1>Recibos</h1><p class="sub">Assessoramento · série CK</p><div class="abas" style="grid-template-columns:repeat(2,1fr);max-width:360px"><a data-a="emitir" class="${aba === 'emitir' ? 'on' : ''}">Emitir</a><a data-a="historico" class="${aba === 'historico' ? 'on' : ''}">Histórico</a></div><div id="cont"></div>`;
    pg.querySelectorAll('[data-a]').forEach(a => a.onclick = () => { aba = a.dataset.a; render(); });
    if (aba === 'emitir') { if (!(eu.admin || window.KESP_PODE('recibos.emitir'))) { document.getElementById('cont').innerHTML = '<p class="sm">Você pode consultar o histórico, mas não emitir recibos.</p>'; return; } telaEmitir(); } else telaHistorico();
  }
  window.KESP_RECIBOS = {
    async abrir(cliente, perfil) {
      sb = cliente; eu = perfil; B = window.KESP_CKS.base; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>';
      await B.carregar(sb, eu); if (!st) novoEstado();
      let pre = null; try { pre = sessionStorage.getItem('kesp.recibo.ck'); sessionStorage.removeItem('kesp.recibo.ck'); } catch (_) {}
      if (pre) { novoEstado(); st.ck = B.dados().cks.find(x => x.id === pre) || null; aba = 'emitir'; }
      render();
    }
  };
})();

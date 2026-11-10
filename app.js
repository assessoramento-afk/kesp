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
  const ICONES = { mapa: 'map-pin', inicio: 'home', agenda: 'calendar', eventos: 'confetti', oficios: 'file-text', documentos: 'folder', fornecedores: 'building-store', comunidades: 'users-group', distritos: 'map-2', recibos: 'receipt', cobranca: 'mail', recadastramento: 'clipboard-check', questionarios: 'list-check', relatorios_ass: 'chart-bar', pedidos: 'shopping-cart', manutencao: 'tool', consumo: 'flame', patrimonio: 'device-laptop', compras: 'package', contas: 'cash', conciliacao: 'building-bank', prestacao: 'file-certificate', nfp: 'receipt-tax', rh: 'id-badge-2', educacao: 'school', usuarios: 'lock', kolping: 'building', sistema: 'heartbeat', andamento: 'progress', manual: 'book', kai: 'message-chatbot' };
  const ETAPAS = [['1A', 'Base essencial'], ['1B', 'Base complementar'], ['2', 'Assessoramento'], ['3', 'Kolping Estadual'], ['4', 'Controles'], ['5', 'Conciliação bancária'], ['6', 'Financeiro'], ['7', 'RH'], ['8', 'Educação Infantil'], ['9', 'Prestação de contas']];
  const FUNCAO_MODULO = { mapa: 'comunidades.ver', compras: 'compras.ver', pedidos: 'pedidos.fazer', comunidades: 'comunidades.ver', recibos: 'recibos.ver', cobranca: 'cobranca.ver', recadastramento: 'recadastramento.ver', questionarios: 'questionarios.ver', relatorios_ass: 'relatorios_ass.ver', distritos: 'comunidades.ver', usuarios: 'usuarios.ver', kolping: 'kolping.ver', sistema: 'sistema.saude', inicio: 'inicio.ver', andamento: 'andamento.ver', manual: 'manual.ver', kai: 'kai.usar' };

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
    app.innerHTML = `<div class="sh"><nav class="lat" id="lat"><div style="display:flex;align-items:center;gap:10px;padding:4px 10px 8px"><div class="ik">${K(16)}</div><b style="letter-spacing:3px">KESP</b></div>${menu}<div class="versao">KESP versão ${esc(window.KESP_CONFIG.versao || '')} · ${esc(window.KESP_CONFIG.versaoData || '')}</div></nav>
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
      pop.innerHTML = `<div style="padding:8px 10px"><b>${esc(eu.nome || eu.email)}</b><div class="sm">${esc(eu.cargo || '')}${eu.admin ? ' · Administrador' : ''}</div><div class="sm" style="margin-top:4px;font-size:11px">KESP versão ${esc(window.KESP_CONFIG.versao || '')}</div></div>
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
    document.querySelectorAll('.conf').forEach(d => d.remove());
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
    if (m.id === 'cobranca' && window.KESP_COBRANCA) return window.KESP_COBRANCA.abrir(sb, eu);
    if (m.id === 'relatorios_ass' && window.KESP_RELATORIOS) return window.KESP_RELATORIOS.abrir(sb, eu);
    if (m.id === 'recadastramento' && window.KESP_RECAD) return window.KESP_RECAD.abrir(sb, eu);
    if (m.id === 'questionarios' && window.KESP_QUEST) return window.KESP_QUEST.abrir(sb, eu);
    if (m.id === 'pedidos' && window.KESP_PEDIDOS) return window.KESP_PEDIDOS.abrir(sb, eu);
    if (m.id === 'mapa' && window.KESP_MAPA) return window.KESP_MAPA.abrir(sb, eu);
    if (m.id === 'compras' && window.KESP_COMPRAS) return window.KESP_COMPRAS.abrir(sb, eu);
    pagConstrucao(m);
    window.scrollTo(0, 0);
  }

  // ---------- Nova versão ----------
  function verificarVersao() {
    const atual = window.KESP_CONFIG.versao;
    const checar = async () => {
      try { const t = await (await fetch('config.js?v=' + Date.now(), { cache: 'no-store' })).text(); const m = t.match(/versao:\s*'([^']+)'/);
        if (m && m[1] !== atual && !document.getElementById('novaVersao')) document.body.insertAdjacentHTML('beforeend', `<div id="novaVersao" class="nova-versao">Nova versão do KESP disponível (${m[1]}) <button class="mini" onclick="location.reload()">Atualizar</button></div>`);
      } catch (_) {}
    };
    setInterval(checar, 10 * 60 * 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checar(); });
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
      verificarVersao();
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
      <div class="abas"><a data-a="pessoas" class="${aba === 'pessoas' ? 'on' : ''}">Pessoas</a><a data-a="permissoes" class="${aba === 'permissoes' ? 'on' : ''}">Permissões</a><a data-a="lote" class="${aba === 'lote' ? 'on' : ''}">Lote</a><a data-a="itens" class="${aba === 'itens' ? 'on' : ''}">Itens</a><a data-a="historico" class="${aba === 'historico' ? 'on' : ''}">Histórico</a></div><div id="cont"></div>`;
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

// ===================== Gráfico de evolução (linha neon) =====================
window.KESP_EVOL = (function () {
  let n = 0;
  const v = (a, b) => { if (b == null) return ''; const d = a - b; return `<span class="var ${d > 0 ? 'up' : d < 0 ? 'dn' : ''}">${d > 0 ? '▲ +' : d < 0 ? '▼ ' : ''}${d === 0 ? 'igual' : d}${b ? '' : ''} vs ano anterior</span>`; };
  // serie: [{ano, ef, co}] em ordem crescente
  function card(serie, titulo) {
    if (!serie.length) return '<p class="sm">Sem dados de associados.</p>';
    const id = 'evo' + (++n), u = serie[serie.length - 1], p = serie.length > 1 ? serie[serie.length - 2] : null;
    const kp = `<div class="ek"><div><span>TOTAL ${u.ano}</span><b>${u.ef + u.co}</b>${v(u.ef + u.co, p && p.ef + p.co)}</div><div class="e"><span>EFETIVOS</span><b>${u.ef}</b>${v(u.ef, p && p.ef)}</div><div class="c"><span>COOPERADORES</span><b>${u.co}</b>${v(u.co, p && p.co)}</div></div>`;
    if (serie.length === 1) return `<div class="evo"><div class="hd"><span>${titulo || 'EVOLUÇÃO DE ASSOCIADOS'}</span><span>${u.ano}</span></div>${kp}<p class="sm" style="margin:6px 0 0">O histórico aparece aqui conforme os anos forem registrados.</p></div>`;
    const W = Math.max(560, serie.length * 70), mx = Math.max(...serie.map(s => Math.max(s.ef, s.co))) * 1.18 || 1;
    const x = i => 45 + i * ((W - 70) / (serie.length - 1)), y = val => 160 - val / mx * 140;
    const path = k => serie.map((s, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(s[k]).toFixed(1)).join('');
    let g = serie.map((s, i) => `<line x1="${x(i)}" x2="${x(i)}" y1="16" y2="160" stroke="rgba(255,255,255,.05)"/>`).join('');
    g += `<path d="${path('ef')}L${x(serie.length - 1)} 160L${x(0)} 160Z" fill="url(#${id}e)" class="fd"/><path d="${path('co')}L${x(serie.length - 1)} 160L${x(0)} 160Z" fill="url(#${id}c)" class="fd"/>`;
    g += `<path d="${path('ef')}" class="ln" fill="none" stroke="#FFB070" stroke-width="3" filter="url(#${id}g)" stroke-linecap="round" stroke-linejoin="round"/><path d="${path('co')}" class="ln ln2" fill="none" stroke="#7FB0FF" stroke-width="3" filter="url(#${id}g)" stroke-linecap="round" stroke-linejoin="round"/>`;
    serie.forEach((s, i) => { const ul = i === serie.length - 1, r = ul ? 5.5 : 3.5, f = ul ? 12 : 10;
      g += `<g class="fd"><circle cx="${x(i)}" cy="${y(s.ef)}" r="${r}" fill="#0B1019" stroke="#FFB070" stroke-width="2"/><text x="${x(i)}" y="${y(s.ef) - 10}" text-anchor="middle" font-size="${f}" font-weight="700" fill="#FFB070">${s.ef}</text><circle cx="${x(i)}" cy="${y(s.co)}" r="${r}" fill="#0B1019" stroke="#7FB0FF" stroke-width="2"/><text x="${x(i)}" y="${y(s.co) + (Math.abs(y(s.co) - y(s.ef)) < 16 ? 18 : -10)}" text-anchor="middle" font-size="${f}" font-weight="700" fill="#7FB0FF">${s.co}</text></g>
        <text x="${x(i)}" y="178" text-anchor="middle" font-size="10" fill="${ul ? '#F2EEEA' : '#8E899A'}" font-weight="${ul ? 700 : 400}">${s.ano}</text><rect x="${x(i) - 25}" y="10" width="50" height="175" fill="transparent" style="cursor:pointer" data-evo="${id}" data-a="${s.ano}" data-e="${s.ef}" data-c="${s.co}"/>`; });
    return `<div class="evo"><div class="hd"><span>${titulo || 'EVOLUÇÃO DE ASSOCIADOS'}</span><span>${serie[0].ano} → ${u.ano}</span></div>${kp}
      <div style="overflow-x:auto"><svg viewBox="0 0 ${W} 190" style="width:100%;min-width:${Math.min(W, 560)}px"><defs><linearGradient id="${id}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F07830" stop-opacity=".32"/><stop offset="1" stop-color="#F07830" stop-opacity="0"/></linearGradient><linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B82F6" stop-opacity=".32"/><stop offset="1" stop-color="#3B82F6" stop-opacity="0"/></linearGradient><filter id="${id}g"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${g}</svg></div>
      <div style="display:flex;gap:16px;font-size:11px;color:#D8D3DE;flex-wrap:wrap"><span><span style="display:inline-block;width:16px;height:3px;border-radius:2px;background:#FFB070;box-shadow:0 0 8px #F07830;margin-right:6px;vertical-align:middle"></span>Efetivos</span><span><span style="display:inline-block;width:16px;height:3px;border-radius:2px;background:#7FB0FF;box-shadow:0 0 8px #3B82F6;margin-right:6px;vertical-align:middle"></span>Cooperadores</span><span class="sm" style="margin-left:auto">Toque num ano para ver os detalhes</span></div><div class="tip" id="${id}t"></div></div>`;
  }
  function ligar(raiz) { (raiz || document).querySelectorAll('.evo > div[style*="overflow-x"]').forEach(d => (d.scrollLeft = d.scrollWidth)); (raiz || document).querySelectorAll('[data-evo]').forEach(r => r.onclick = () => { const t = document.getElementById(r.dataset.evo + 't'); if (t) t.innerHTML = `<b style="color:#F2EEEA">${r.dataset.a}</b> · total ${+r.dataset.e + +r.dataset.c} · <span style="color:#FFB070">${r.dataset.e} efetivos</span> · <span style="color:#7FB0FF">${r.dataset.c} cooperadores</span>`; }); }
  function spark(serie) {
    if (serie.length < 2) return '';
    const w = 90, h = 22, mx = Math.max(...serie.map(s => s.ef + s.co)) || 1, mn = Math.min(...serie.map(s => s.ef + s.co));
    const pts = serie.map((s, i) => `${(i / (serie.length - 1) * w).toFixed(1)},${(h - 2 - ((s.ef + s.co - mn) / ((mx - mn) || 1)) * (h - 4)).toFixed(1)}`).join(' ');
    const d = (serie[serie.length - 1].ef + serie[serie.length - 1].co) - (serie[serie.length - 2].ef + serie[serie.length - 2].co);
    return `<div class="spark"><svg width="${w}" height="${h}"><polyline points="${pts}" fill="none" stroke="#FFB070" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="filter:drop-shadow(0 0 3px rgba(240,120,48,.7))"/></svg><span class="var ${d > 0 ? 'up' : d < 0 ? 'dn' : ''}" style="font-size:11px">${d > 0 ? '▲ +' + d : d < 0 ? '▼ ' + d : 'igual'} desde ${serie[serie.length - 2].ano}</span></div>`;
  }
  return { card, ligar, spark };
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
    const [c, d, r, q, t, cr, f, h, vi] = await Promise.all([
      sb.from('comunidades').select('*').order('nome'),
      sb.from('distritos').select('*').order('ordem'),
      sb.from('recadastramentos').select('*').order('ano'),
      sb.from('quitacoes').select('comunidade_id,tipo,ano,mes,valor_pago,origem,quita_mes'),
      sb.from('taxas_ano').select('*'),
      sb.from('creditos').select('comunidade_id,valor'),
      sb.from('comunidades_favoritas').select('comunidade_id').eq('perfil_id', eu.id),
      sb.from('associados_historico').select('comunidade_id,ano,efetivos,cooperadores'),
      sb.from('visitas').select('comunidade_id,data').order('data', { ascending: false })
    ]);
    D = { cks: c.data || [], dist: d.data || [], recad: r.data || [], quit: q.data || [], taxas: t.data || [], cred: cr.data || [], fav: new Set((f.data || []).map(x => x.comunidade_id)), hist: (h && !h.error && h.data) || [], vis: (vi && !vi.error && vi.data) || [] };
  }
  const taxa = ano => D.taxas.find(t => t.ano === ano) || D.taxas[D.taxas.length - 1] || { societaria: 0, solidariedade: 0, dia_vencimento: 15, venc_societaria: ano + '-03-31', minimo_efetivos: 12 };
  const recadAno = (ck, ano) => D.recad.filter(r => r.comunidade_id === ck && r.ano <= ano && r.situacao === 'aprovado').sort((a, b) => b.ano - a.ano)[0];

  // Extrato do ano calculado no aparelho (mesma regra da função extrato_ck do banco)
  function extrato(ck, ano) {
    const t = taxa(ano), r = recadAno(ck.id, ano), hoje = new Date().toISOString().slice(0, 10);
    const ini = (ck.inicio_cobranca || ano + '-01-01').slice(0, 7);
    // associados que pagam no mês: o recadastramento aprovado vale a partir do mês da aprovação (vigente_desde)
    const aprov = D.recad.filter(x => x.comunidade_id === ck.id && x.situacao === 'aprovado').map(x => ({ x, d: (x.vigente_desde || x.ano + '-01-01').slice(0, 7) })).sort((a, b) => b.d.localeCompare(a.d));
    const nMes = ym => { const v = aprov.find(a => a.d <= ym) || aprov[aprov.length - 1]; return v ? v.x.efetivos + v.x.cooperadores : 0; };
    const n = nMes(hoje.slice(0, 7) < ano + '-01' ? ano + '-01' : hoje.slice(0, 4) > String(ano) ? ano + '-12' : hoje.slice(0, 7));
    const qs = (tipo, mes) => D.quit.filter(q => q.comunidade_id === ck.id && q.ano === ano && q.tipo === tipo && (q.mes ?? null) === mes);
    const pago = (tipo, mes) => qs(tipo, mes).reduce((s, q) => s + Number(q.valor_pago), 0);
    const quitado = (tipo, mes) => qs(tipo, mes).some(q => q.quita_mes);
    const sit = (dev, pg, venc) => dev === 0 ? 'isento' : pg >= dev - 0.001 ? 'pago' : pg > 0 ? 'parcial' : venc < hoje ? 'atraso' : 'a_vencer';
    const meses = MES.map((_, i) => {
      const ym = `${ano}-${String(i + 1).padStart(2, '0')}`, venc = `${ym}-${String(Math.min(t.dia_vencimento, 28)).padStart(2, '0')}`, pg = pago('solidariedade', i + 1);
      let dev = ym < ini ? 0 : Math.round(nMes(ym) * t.solidariedade * 100) / 100;
      if (quitado('solidariedade', i + 1)) dev = pg; // marcado como pago no sistema anterior: vale o valor pago na época
      return { mes: i + 1, venc, devido: dev, pago: pg, sit: sit(dev, pg, venc) };
    });
    const sVenc = ano + String(t.venc_societaria || '-03-31').slice(4), spg = pago('societaria', null);
    let sdev = sVenc.slice(0, 7) < ini ? 0 : Math.round(nMes(sVenc.slice(0, 7)) * t.societaria * 100) / 100;
    if (quitado('societaria', null)) sdev = spg;
    const soc = { venc: sVenc, devido: sdev, pago: spg, sit: sit(sdev, spg, sVenc) };
    const todos = [...meses, soc];
    const aberto = todos.filter(m => m.sit === 'atraso' || (m.sit === 'parcial' && m.venc < hoje)).reduce((s, m) => s + (m.devido - m.pago), 0);
    const situacao = !ck.ativa ? 'inativa' : todos.some(m => m.sit === 'atraso') ? 'atraso' : todos.some(m => m.sit === 'parcial') ? 'parcial' : 'em_dia';
    return { meses, soc, n, r, situacao, aberto, atrasados: todos.filter(m => m.sit === 'atraso').length };
  }
  const credito = id => D.cred.filter(c => c.comunidade_id === id).reduce((s, c) => s + Number(c.valor), 0);
  // série anual de associados: recadastramento aprovado de cada ano (o mais recente do ano) + histórico importado
  const serieCk = id => { const m = {}; (D.hist || []).filter(h => h.comunidade_id === id).forEach(h => (m[h.ano] = { ano: h.ano, ef: h.efetivos, co: h.cooperadores }));
    D.recad.filter(r => r.comunidade_id === id && r.situacao === 'aprovado').forEach(r => (m[r.ano] = { ano: r.ano, ef: r.efetivos, co: r.cooperadores }));
    return Object.values(m).sort((a, b) => a.ano - b.ano); };
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
          <div class="sm">${e.r ? `${e.r.efetivos} efetivos · ${e.r.cooperadores} cooperadores` : 'Sem recadastramento'}</div>${window.KESP_EVOL.spark(serieCk(ck.id))}
          <div>${e.situacao !== 'em_dia' ? `<span class="tg2" style="background:${COR[e.situacao]}22;color:${COR[e.situacao]}">${NOME[e.situacao]}${e.aberto ? ' · ' + R(e.aberto) : ''}</span>` : ''}${e.r && e.r.efetivos < min && ck.ativa ? `<span class="tg2" style="background:rgba(229,72,77,.15);color:#FF9A9D">Abaixo do mínimo</span>` : ''}${!e.r && ck.ativa ? '<span class="tg2" style="background:rgba(245,165,36,.15);color:#F8C46A">Sem recadastramento</span>' : ''}${ck.ativa && (() => { const v = D.vis.find(x => x.comunidade_id === ck.id); return !v || (Date.now() - new Date(v.data + 'T12:00')) / 864e5 > 180; })() ? '<span class="tg2" style="background:rgba(59,130,246,.15);color:#93B8FF">Sem visita há 180+ dias</span>' : ''}</div></div>
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
    if (!ck) { if (!perfil._re) { perfil._re = true; await carregar(); perfil._re = false; if (D.cks.find(c => c.id === id)) return perfil(id); }
      pg.innerHTML = `<div class="vazio"><h1>CK não encontrada</h1><p class="sub">Essa CK não existe mais ou o link é antigo (de antes da virada).</p><button class="btn" onclick="location.hash='#comunidades'">Voltar para Comunidades</button></div>`; return; }
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
      <div class="abas" style="grid-template-columns:repeat(5,1fr);max-width:700px">${[['resumo', 'Resumo'], ['pag', 'Pagamentos'], ['vis', 'Visitas'], ['dir', 'Diretoria'], ['doc', 'Documentos']].map(([k, v]) => `<a data-a="${k}" class="${aba === k ? 'on' : ''}">${v}</a>`).join('')}</div><div id="ckCont"></div>`;
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
        <div class="s2">${window.KESP_EVOL.card(serieCk(id))}</div>
        <div class="cd s2" style="--c:${apta ? '#22C984' : '#6E6A7C'}"><div class="hd"><span>ASSEMBLEIA E CADASTRO NACIONAL</span></div><div class="kv"><span>Apta para a Assembleia</span><span><b style="color:${apta ? '#5FE0A8' : '#FF9A9D'}">${apta ? 'Sim' : 'Não'}</b>${apta ? '' : ' <span class="sm">(pagamentos em dia e recadastramento do ano)</span>'}</span><span>Delegados</span><span>${delegados}</span><span>Cadastro Nacional (KB)</span><span>${ck.cn_efetivos != null ? ck.cn_efetivos + ' efetivos' + (r && ck.cn_efetivos !== r.efetivos ? ' <b style="color:#F8C46A">· diferente do recadastramento</b>' : ' ✓') : '<span class="sm">não conferido</span>'}</span><span>Recadastramento</span><span>${r ? r.ano + (r.ano === ANO ? ' ✓' : ' <b style="color:#F8C46A">· desatualizado</b>') : '<b style="color:#FF9A9D">nenhum</b>'}</span></div></div>
        <div class="cd s4" style="--c:#3B82F6"><div class="hd"><span>LINHA DO TEMPO</span></div><div class="tl" id="ckTl"><span class="sm">Carregando…</span></div></div></div>`;
      linhaTempo(id); window.KESP_EVOL.ligar(c);
    } else if (aba === 'pag') {
      const { data } = await sb.from('recibos').select('serie,ano,numero,data_pagamento,valor,situacao,referencia,legado').eq('comunidade_id', id).order('data_pagamento', { ascending: false });
      const { data: ar } = await sb.from('a_receber').select('*').eq('comunidade_id', id).eq('situacao', 'aberto');
      c.innerHTML = ((ar || []).length ? `<div class="cd" style="--c:#F5A524;margin-bottom:10px"><div class="hd"><span>A RECEBER (ITENS)</span></div>${ar.map(a => `<div class="lin" style="display:flex;justify-content:space-between;font-size:13px"><span>${esc(a.descricao)}</span><b style="color:#F8C46A">${R(a.valor)}</b></div>`).join('')}</div>` : '') + (data || []).map(x => `<div class="pe" style="--c:${x.situacao === 'cancelado' ? '#6E6A7C' : '#22C984'}"><div style="flex:1;min-width:0"><b>Recibo ${x.serie} ${x.numero}/${x.ano}</b>${x.situacao === 'cancelado' ? ' <span class="tg2" style="background:rgba(255,255,255,.08);color:#A8A3B4">Cancelado</span>' : ''}<div class="sm">${new Date(x.data_pagamento + 'T12:00').toLocaleDateString('pt-BR')} · ${esc(x.referencia || '')}</div></div><b>${R(x.valor)}</b></div>`).join('') || '<p class="sm">Nenhum recibo.</p>';
    } else if (aba === 'vis') {
      window.KESP_VISITAS.aba(sb, eu, ck, c, extrato(ck, ANO), r);
    } else if (aba === 'dir') {
      const dd = (r && r.dados) || {}, CG = [['presidente', 'Presidente', 'tel_presidente'], ['vice_presidente', 'Vice-presidente', 'tel_vice'], ['secretario_1', '1º secretário'], ['secretario_2', '2º secretário'], ['tesoureiro_1', '1º tesoureiro'], ['tesoureiro_2', '2º tesoureiro'], ['dir_juventude', 'Diretor(a) de juventude'], ['vice_dir_juventude', 'Vice de juventude'], ['membro_1', 'Membro'], ['membro_2', 'Membro'], ['membro_3', 'Membro'], ['coordenador', 'Coordenador(a) responsável']];
      c.innerHTML = r ? `<div class="cd" style="--c:#8B5CF6;max-width:640px"><div class="hd"><span>DIRETORIA · RECADASTRAMENTO ${r.ano}</span></div><div class="kv">${CG.filter(([k]) => dd[k]).map(([k, n, tk]) => `<span>${n}</span><span>${esc(dd[k])}${tk && dd[tk] ? ` · <a class="lk" href="https://wa.me/55${String(dd[tk]).replace(/\D/g, '')}" target="_blank" rel="noopener">${esc(dd[tk])}</a>` : ''}</span>`).join('')}<span>Mandato</span><span>${esc([dd.vigencia_ini, dd.vigencia_fim].filter(Boolean).map(v => new Date(v + 'T12:00').toLocaleDateString('pt-BR')).join(' a ') || '—')}</span><span>Última assembleia</span><span>${dd.data_ultima_assembleia ? new Date(dd.data_ultima_assembleia + 'T12:00').toLocaleDateString('pt-BR') : '—'}</span></div></div>` : '<p class="sm">Sem recadastramento.</p>';
    } else {
      const dd = (r && r.dados) || {}, docs = Array.isArray(dd.documentos) ? dd.documentos : Object.entries(dd.documentos || {}).map(([k, v]) => k + ' · ' + ({ tem: 'tem', andamento: 'em andamento', nao: 'não tem' }[v] || v));
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
      dados: () => D, extrato, taxa, credito, dist, serieCk, COR, NOME, R, MES
    },
    async abrir(cliente, perfilEu, alvo) {
      sb = cliente; eu = perfilEu; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>';
      if (!D || !alvo) await carregar();
      if (alvo) { let a2 = null; try { a2 = sessionStorage.getItem('kesp.ck.aba'); sessionStorage.removeItem('kesp.ck.aba'); } catch (_) {} aba = a2 || 'resumo'; perfil(alvo); } else lista();
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
      <div class="g4" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));align-items:start">${D.dist.map(card).join('')}${semDist ? card(null) : ''}</div>`;
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

  // ---------- cálculo (taxa + itens, evento ou livre) ----------
  function calcular() {
    const ck = st.ck, tipo = st.tipo || 'CK';
    if (tipo === 'CK' && !ck) return null;
    const V = r2(st.valor || 0), ex = (st.extras || []).map(e => ({ ...e, devido: r2((e.qtd || 1) * (e.unit || 0)) }));
    let restV = V; ex.forEach(e => { e.pago = r2(Math.min(e.devido, Math.max(restV, 0))); restV = r2(restV - e.pago); e.falta = r2(e.devido - e.pago); });
    let itens = [], T = 0, cu = 0, cred = 0, parcial = null;
    if (tipo === 'CK') {
      cred = Math.max(0, B.credito(ck.id));
      const L = todasLinhas(ck).filter(l => st.sel.has(l.k)).sort((x, y) => x.venc.localeCompare(y.venc));
      let A = restV + cred;
      L.forEach(l => { const need = r2(l.devido - l.ja), take = r2(Math.min(need, Math.max(A, 0))); A = r2(A - take); itens.push({ ...l, pago: take, falta: r2(need - take) }); });
      T = r2(itens.reduce((x, i) => x + i.pago, 0)); cu = r2(Math.min(cred, T)); restV = r2(restV - (T - cu)); parcial = itens.find(i => i.falta > 0);
    }
    const sobra = Math.max(0, restV), podeCred = !!ck && st.guarda !== false;
    return { V, cred, itens, ex, T, cu, cn: podeCred ? sobra : 0, sb: podeCred ? 0 : sobra, saldo: r2(cred - cu + (podeCred ? sobra : 0)), parcial, faltaEx: ex.filter(e => e.falta > 0) };
  }
  function autoSelecionar() {
    const ck = st.ck; st.sel = new Set(); if (!ck || (st.tipo || 'CK') !== 'CK') return;
    let A = (st.valor || 0) - (st.extras || []).reduce((x, e) => x + (e.qtd || 1) * (e.unit || 0), 0) + Math.max(0, B.credito(ck.id));
    const abertos = todasLinhas(ck).filter(l => l.ja < l.devido - 0.001).sort((a, b) => a.venc.localeCompare(b.venc));
    for (const l of abertos) { if (A <= 0.001) break; st.sel.add(l.k); A -= (l.devido - l.ja); }
  }
  function texto(c, ck, dataPg) {
    const sol = c.itens.filter(i => i.tipo === 'solidariedade' && i.pago > 0), soc = c.itens.find(i => i.tipo === 'societaria' && i.pago > 0);
    const lista = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1] : a[0] || '';
    const ant = sol.filter(i => i.venc.slice(0, 7) > dataPg.slice(0, 7)), anoRef = sol.length && sol.every(i => i.ano === sol[0].ano) ? ' de ' + sol[0].ano : '';
    const ref = [];
    if (sol.length) ref.push('à taxa de solidariedade de ' + lista(sol.map(i => MESX[i.mes - 1] + (anoRef ? '' : ' de ' + i.ano))) + anoRef + (ant.length && ant.length < sol.length ? ' (sendo ' + lista(ant.map(i => MESX[i.mes - 1])) + ' antecipadamente)' : ant.length ? ', antecipadamente' : ''));
    if (soc) ref.push('à taxa societária de ' + soc.ano);
    c.ex.filter(e => e.devido > 0).forEach(e => ref.push((ref.length ? '' : 'a ') + (e.qtd > 1 ? e.qtd + ' × ' : '') + e.desc));
    const quem = ck ? `da <b>${esc((ck.razao_social || ck.nome).toUpperCase())}</b>${ck.cnpj ? ', CNPJ ' + esc(ck.cnpj) : ''}` : `de <b>${esc((st.avulso.nome || '').toUpperCase())}</b>${st.avulso.doc ? ', CPF/CNPJ ' + esc(st.avulso.doc) : ''}`;
    let t = `A <b>${KOLPING.nome}</b>, CNPJ ${KOLPING.cnpj}, recebeu ${quem}, o valor de <b>${R(c.V)}</b> (${extenso(c.V)}), referente ${lista(ref) || 'a contribuições'}${c.parcial || c.faltaEx.length ? ' (pagamento parcial)' : ''}.`;
    if (c.cu > 0) t += ` Foram usados <b>${R(c.cu)}</b> de crédito de pagamentos anteriores.`;
    if (c.parcial) t += ` Permanece em aberto <b>${R(c.parcial.falta)}</b> de ${c.parcial.tipo === 'societaria' ? 'taxa societária de ' + c.parcial.ano : MESX[c.parcial.mes - 1] + ' de ' + c.parcial.ano}.`;
    c.faltaEx.forEach(e => (t += ` Fica a receber <b>${R(e.falta)}</b> de ${e.desc}.`));
    if (c.cn > 0) t += ` O valor pago ficou <b>${R(c.cn)}</b> acima do devido e foi guardado como crédito da Comunidade, que será usado na taxa do próximo mês. Saldo de crédito após este pagamento: <b>${R(c.saldo)}</b>.`;
    if (c.sb > 0) t += ` O valor pago ficou <b>${R(c.sb)}</b> acima do devido${st.destinoSobra === 'doacao' ? ', considerado como doação' : ', a ser devolvido'}.`;
    return t;
  }

  function telaEmitir() {
    const D = B.dados(), ANO = new Date().getFullYear(), tipo = st.tipo || 'CK', ck = st.ck, c = calcular();
    const ativos = D.cks.filter(x => x.ativa).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const e = ck ? B.extrato(ck, ANO) : null, taxaSol = B.taxa(ANO).solidariedade, anos = [ANO - 1, ANO, ANO + 1];
    let alerta = '';
    if (tipo === 'CK' && ck && c && e.n && st.valor && !(st.extras || []).length && Math.abs(st.valor / (e.n * taxaSol) - Math.round(st.valor / (e.n * taxaSol))) > 1e-6) { for (let m = 1; m <= 3; m++) { const k = st.valor / (m * taxaSol); if (Math.abs(k - Math.round(k)) < 1e-6 && Math.round(k) !== e.n && Math.abs(Math.round(k) - e.n) <= Math.max(3, e.n * 0.5)) { alerta = `<div class="alerta">⚠ Valor diferente do esperado: ${R(st.valor)} equivale a ${m === 1 ? '' : m + ' meses de '}${Math.round(k)} associados × ${R(taxaSol)}, mas o recadastramento tem ${e.n}.</div>`; break; } } }
    const abertosAR = ck ? AR.filter(a => a.comunidade_id === ck.id && a.situacao === 'aberto') : [];
    const exHtml = (st.extras || []).map((x, i) => `<div class="pe" style="--c:#8B5CF6;margin:4px 0"><span style="flex:1;font-size:13px">${x.qtd > 1 ? x.qtd + ' × ' : ''}${esc(x.desc)}</span><span class="sm">${R(x.qtd * x.unit)}</span><a class="lk" data-rx="${i}">✕</a></div>`).join('');
    document.getElementById('cont').innerHTML = `<div class="rec2"><div class="fm">
      <label>Tipo de recibo</label><div class="abas" style="grid-template-columns:repeat(3,1fr);margin:0">${[['CK', 'Taxa (+ itens)'], ['EV', 'Evento'], ['RL', 'Livre']].map(([k, n]) => `<a data-tp="${k}" class="${tipo === k ? 'on' : ''}">${n}</a>`).join('')}</div>
      ${tipo !== 'CK' ? `<label>Pagador</label><div class="abas" style="grid-template-columns:repeat(2,1fr);margin:0"><a data-pg="ck" class="${st.pagador !== 'avulso' ? 'on' : ''}">Comunidade Kolping</a><a data-pg="avulso" class="${st.pagador === 'avulso' ? 'on' : ''}">Pessoa ou empresa</a></div>` : ''}
      ${tipo === 'CK' || st.pagador !== 'avulso' ? `<label>Comunidade</label><select id="rCk"><option value="">Escolha a CK</option>${ativos.map(x => `<option value="${x.id}"${ck && ck.id === x.id ? ' selected' : ''}>${esc(x.nome)}</option>`).join('')}</select>${ck ? `<p class="sm" style="margin:6px 0 0">${tipo === 'CK' ? e.n + ' associados · ' + R(e.n * taxaSol) + ' por mês · ' : ''}crédito atual <b style="color:#5FE0A8">${R(Math.max(0, B.credito(ck.id)))}</b>${abertosAR.length ? ` · <b style="color:#F8C46A">a receber ${R(abertosAR.reduce((x, a) => x + Number(a.valor), 0))}</b>` : ''}</p>` : ''}`
        : `<div class="dois"><div><label>Nome</label><input id="aN" value="${esc(st.avulso.nome || '')}"></div><div><label>CPF ou CNPJ</label><input id="aD" data-cnpj value="${esc(st.avulso.doc || '')}"></div></div>`}
      <div class="dois"><div><label>Valor recebido (do comprovante)</label><input id="rVal" inputmode="decimal" placeholder="0,00" value="${st.valor ? String(st.valor).replace('.', ',') : ''}"></div><div><label>Data do pagamento</label><input id="rData" type="date" value="${st.data}"></div></div>
      <div class="dois"><div><label>Forma de pagamento</label><select id="rForma">${['PIX', 'Transferência', 'Depósito', 'Dinheiro', 'Boleto'].map(f => `<option${st.forma === f ? ' selected' : ''}>${f}</option>`).join('')}</select></div><div><label>Modelo</label><select id="rMod"><option value="padrao"${st.modelo === 'padrao' ? ' selected' : ''}>Padrão</option><option value="timbrado"${st.modelo === 'timbrado' ? ' selected' : ''}>Papel timbrado</option></select></div></div>
      <label>${tipo === 'CK' ? 'Itens além da taxa (camisetas, inscrições…)' : 'Itens'}</label>${exHtml}
      <div class="dois" style="grid-template-columns:2fr 70px 1fr auto;gap:6px;align-items:end"><select id="xI"><option value="">Item cadastrado…</option>${ITENS.filter(i => i.ativo && (tipo === 'CK' || i.tipo === (tipo === 'EV' ? 'evento' : 'livre'))).map(i => `<option value="${i.id}">${esc(i.nome)} · ${R(i.valor)}</option>`).join('')}${abertosAR.map(a => `<option value="ar:${a.id}">Complemento: ${esc(a.descricao)} · ${R(a.valor)}</option>`).join('')}<option value="outro">Outro (digitar)</option></select><input id="xQ" type="number" min="1" value="1"><input id="xV" placeholder="Valor unit." inputmode="decimal"><button class="mini" id="xAdd">+</button></div>
      ${tipo === 'CK' && ck ? `<label>Meses da taxa (toque para marcar ou desmarcar)</label><div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 6px"><a class="lk" id="rAnt">‹</a><b>${anos[st.ano]}</b><a class="lk" id="rPro">›</a></div>
        <div class="gmes">${linhasAno(ck, anos[st.ano]).map(l => { const pago = l.ja >= l.devido - 0.001, it = c && c.itens.find(i => i.k === l.k);
          if (pago) return `<button class="pg">${l.tipo === 'societaria' ? 'Societária' : MESX[l.mes - 1].slice(0, 3)}<b>pago</b></button>`;
          return `<button data-k="${l.k}" class="${st.sel.has(l.k) ? (it && it.falta > 0 ? 'par' : 'sel') : l.sit === 'atraso' ? 'at' : ''}">${l.tipo === 'societaria' ? 'Societária' : MESX[l.mes - 1].slice(0, 3)}<b>${R(l.devido - l.ja)}</b></button>`; }).join('')}</div>` : ''}
      <label>Observação (opcional, aparece no recibo)</label><input id="rObs" value="${esc(st.obs)}">${alerta}
      </div><div>
      ${c && st.valor && (tipo !== 'CK' || ck) && (st.pagador !== 'avulso' || tipo === 'CK' || st.avulso.nome) ? `<div class="cd" style="--c:${c.parcial || c.faltaEx.length ? '#F5A524' : '#22C984'};margin-bottom:10px"><div class="kv"><span>Recebido</span><span>${R(c.V)}${c.cred && tipo === 'CK' ? ' + ' + R(c.cred) + ' de crédito' : ''}</span>${c.ex.length ? `<span>Itens</span><span>${R(c.ex.reduce((x, e) => x + e.devido, 0))}</span>` : ''}${tipo === 'CK' ? `<span>Meses da taxa</span><span>${c.itens.length} · ${R(c.T)}</span>` : ''}
          ${c.parcial ? `<span style="color:#F8C46A">Taxa parcial</span><span style="color:#F8C46A">falta ${R(c.parcial.falta)}</span>` : ''}${c.faltaEx.map(x => `<span style="color:#F8C46A">A receber</span><span style="color:#F8C46A">${R(x.falta)} · ${esc(x.desc)}</span>`).join('')}
          ${c.cn + c.sb > 0 ? `<span style="color:#5FE0A8">Sobra</span><span style="color:#5FE0A8">${R(c.cn + c.sb)}${ck ? ' → crédito da Comunidade' : ''}</span>` : ''}</div>
          ${ck && c.cn + c.sb > 0 ? `<label style="display:flex;gap:8px;align-items:center;margin-top:8px;font-size:12px"><input type="checkbox" id="rGu" style="width:auto"${st.guarda !== false ? ' checked' : ''}> Guardar a sobra como crédito (abate a próxima taxa)</label>` : ''}
          ${c.sb > 0 ? `<div style="margin-top:6px;font-size:12px">A sobra será: <select id="rDs" style="width:auto"><option value="devolver"${st.destinoSobra !== 'doacao' ? ' selected' : ''}>devolvida</option><option value="doacao"${st.destinoSobra === 'doacao' ? ' selected' : ''}>considerada doação</option></select></div>` : ''}</div>
        <div class="prev"><b>Prévia do recibo · série ${tipo}</b><p style="margin:6px 0 0">${texto(c, ck, st.data)}</p></div>
        <button class="btn" id="rEmit" style="width:100%;margin-top:12px">Emitir recibo</button>` : '<div class="cd" style="--c:#6E6A7C"><p class="sm" style="margin:0">Escolha o pagador e informe o valor recebido para ver a prévia do recibo.</p></div>'}
      </div></div>`;
    const g = id => document.getElementById(id), re = () => setTimeout(telaEmitir, 0);
    document.querySelectorAll('[data-tp]').forEach(a => a.onclick = () => { st.tipo = a.dataset.tp; st.extras = []; st.sel = new Set(); if (st.tipo === 'CK') st.pagador = 'ck'; autoSelecionar(); re(); });
    document.querySelectorAll('[data-pg]').forEach(a => a.onclick = () => { st.pagador = a.dataset.pg; if (st.pagador === 'avulso') st.ck = null; re(); });
    if (g('rCk')) g('rCk').onchange = ev => { st.ck = D.cks.find(x => x.id === ev.target.value) || null; autoSelecionar(); re(); };
    if (g('aN')) { g('aN').onchange = ev => { st.avulso.nome = ev.target.value.trim(); re(); }; g('aD').onchange = ev => { st.avulso.doc = ev.target.value.trim(); }; window.KESP_BUSCA.ligar(document.getElementById('cont')); }
    g('rVal').onchange = ev => { st.valor = parseFloat(ev.target.value.replace(/\./g, '').replace(',', '.')) || 0; autoSelecionar(); re(); };
    g('rData').onchange = ev => { st.data = ev.target.value; re(); };
    g('rForma').onchange = ev => (st.forma = ev.target.value); g('rMod').onchange = ev => (st.modelo = ev.target.value); g('rObs').onchange = ev => (st.obs = ev.target.value);
    if (g('rGu')) g('rGu').onchange = ev => { st.guarda = ev.target.checked; re(); };
    if (g('rDs')) g('rDs').onchange = ev => { st.destinoSobra = ev.target.value; re(); };
    if (g('rAnt')) { g('rAnt').onclick = () => { if (st.ano > 0) { st.ano--; re(); } }; g('rPro').onclick = () => { if (st.ano < 2) { st.ano++; re(); } }; }
    document.querySelectorAll('.gmes [data-k]').forEach(b => b.onclick = () => { st.sel.has(b.dataset.k) ? st.sel.delete(b.dataset.k) : st.sel.add(b.dataset.k); re(); });
    document.querySelectorAll('[data-rx]').forEach(a => a.onclick = () => { const x = st.extras.splice(+a.dataset.rx, 1)[0]; if (x && x.ar) st.quitar = (st.quitar || []).filter(i => i !== x.ar); autoSelecionar(); re(); });
    g('xI').onchange = ev => { const v = ev.target.value, it = ITENS.find(i => i.id === v), ar = v.startsWith('ar:') ? AR.find(a => a.id === v.slice(3)) : null; g('xV').value = it ? String(it.valor).replace('.', ',') : ar ? String(ar.valor).replace('.', ',') : ''; };
    g('xAdd').onclick = () => { const v = g('xI').value, q = Math.max(1, parseInt(g('xQ').value, 10) || 1), un = parseFloat((g('xV').value || '').replace(/\./g, '').replace(',', '.')) || 0;
      let desc; if (v.startsWith('ar:')) { const ar = AR.find(a => a.id === v.slice(3)); desc = 'complemento de ' + ar.descricao; st.extras.push({ desc, qtd: 1, unit: un, ar: ar.id }); st.quitar = [...(st.quitar || []), ar.id]; }
      else { const it = ITENS.find(i => i.id === v); desc = it ? it.nome : (prompt('Descrição do item:') || '').trim(); if (!desc || !un) { alert('Informe o item e o valor.'); return; } st.extras.push({ desc, qtd: q, unit: un }); }
      autoSelecionar(); re(); };
    const em = g('rEmit'); if (em) em.onclick = () => emitir(c);
  }

  async function emitir(c) {
    const tipo = st.tipo || 'CK', ck = st.ck;
    if (!st.data) { alert('Informe a data do pagamento.'); return; }
    if (tipo !== 'CK' && !ck && !st.avulso.nome) { alert('Informe o pagador.'); return; }
    if (!confirm(`Emitir o recibo ${tipo} de ${R(c.V)}?`)) return;
    const b = document.getElementById('rEmit'); b.disabled = true; b.textContent = 'Emitindo…';
    const itens = [...c.ex.map(e => ({ tipo: 'item', descricao: e.desc, quantidade: e.qtd, unitario: e.unit, devido: e.devido, pago: e.pago })), ...c.itens.map(i => ({ tipo: i.tipo, ano: i.ano, mes: i.mes, devido: i.devido, pago: i.pago }))];
    const { data: id, error } = await sb.rpc('emitir_recibo2', { p_serie: tipo, p_ck: ck ? ck.id : null, p_pagador_nome: ck ? null : st.avulso.nome, p_pagador_doc: ck ? null : (st.avulso.doc || null), p_data: st.data, p_forma: st.forma, p_valor: c.V, p_itens: itens, p_credito_usado: c.cu, p_credito_novo: c.cn, p_sobra: c.sb, p_referencia: texto(c, ck, st.data), p_modelo: st.modelo, p_obs: st.obs || null, p_a_receber: c.faltaEx.map(e => ({ descricao: e.desc, valor: e.falta })), p_quitar: st.quitar || [] });
    if (error) { b.disabled = false; b.textContent = 'Emitir recibo'; alert('Não foi possível emitir: ' + error.message); return; }
    await B.carregar(sb, eu); await extras(); novoEstado(); abrirRecibo(id);
  }
  let ITENS = [], AR = [];
  async function extras() { const [i, a] = await Promise.all([sb.from('itens_cobranca').select('*').order('nome'), sb.from('a_receber').select('*').eq('situacao', 'aberto')]); ITENS = i.data || []; AR = a.data || []; }
  function telaItens() {
    const c = document.getElementById('cont');
    c.innerHTML = `<p class="sm">Itens com valor para usar nos recibos (camisetas, inscrições, materiais).</p><button class="btn" id="iNovo" style="margin-bottom:10px">Novo item</button>${ITENS.map(i => `<div class="pe" style="--c:${i.ativo ? '#8B5CF6' : '#6E6A7C'};cursor:pointer" data-i="${i.id}"><div style="flex:1"><b>${esc(i.nome)}</b><div class="sm">${i.tipo === 'evento' ? 'Evento' : 'Livre'}${i.ativo ? '' : ' · inativo'}</div></div><b>${R(i.valor)}</b></div>`).join('') || '<p class="sm">Nenhum item.</p>'}`;
    const ed = it => { const n = prompt('Nome do item:', it ? it.nome : ''); if (!n) return; const v = parseFloat((prompt('Valor (R$):', it ? String(it.valor).replace('.', ',') : '') || '').replace(/\./g, '').replace(',', '.')); if (!v) return;
      const t = confirm('É de evento? (OK = evento · Cancelar = livre)') ? 'evento' : 'livre', at = it ? confirm('Manter ativo? (Cancelar = inativar)') : true;
      (it ? sb.from('itens_cobranca').update({ nome: n.trim(), valor: v, tipo: t, ativo: at }).eq('id', it.id) : sb.from('itens_cobranca').insert({ nome: n.trim(), valor: v, tipo: t })).then(async r => { if (r.error) alert('Não foi possível salvar.'); await extras(); telaItens(); }); };
    c.querySelector('#iNovo').onclick = () => ed(null); c.querySelectorAll('[data-i]').forEach(d => d.onclick = () => ed(ITENS.find(i => i.id === d.dataset.i)));
  }

  // ---------- documento ----------
  async function abrirRecibo(id) {
    const { data: r } = await sb.from('recibos').select('*').eq('id', id).maybeSingle(); if (!r) return;
    let quem = null; if (r.emitido_por) { const p = await sb.from('perfis').select('nome,cargo,assinatura_url').eq('id', r.emitido_por).maybeSingle(); quem = p.data; }
    const { data: devs } = await sb.from('recibo_devolucoes').select('*').eq('recibo_id', r.id); r._devs = devs || [];
    const html = documento(r, quem);
    const dlg = document.createElement('div'); dlg.className = 'conf';
    dlg.innerHTML = `<div class="cx" style="max-width:720px;max-height:92vh;overflow-y:auto;padding:12px"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button class="btn" data-imp>Imprimir / Salvar PDF</button>${r.situacao !== 'cancelado' && (eu.admin || window.KESP_PODE('recibos.emitir')) ? '<button class="btn sec" data-dev>Registrar devolução</button>' : ''}${r.comunidade_id && r.situacao !== 'cancelado' ? `<button class="btn sec" data-mail>${r.enviado_em ? 'Enviar de novo' : 'Enviar por e-mail'}</button>` : ''}${r.situacao !== 'cancelado' && (eu.admin || window.KESP_PODE('recibos.cancelar')) ? '<button class="btn sec" data-can style="color:#FF9A9D">Cancelar recibo</button>' : ''}<button class="btn sec" data-x style="margin-left:auto">Fechar</button></div><div style="background:#E9E5DF;padding:10px;border-radius:10px">${html}</div></div>`;
    document.body.appendChild(dlg);
    dlg.querySelector('[data-x]').onclick = () => { dlg.remove(); if (aba === 'historico') render(); };
    dlg.querySelector('[data-imp]').onclick = () => { const w = window.open('', '_blank'); w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Recibo ${r.numero}-${r.ano}</title><style>@page{size:A4;margin:12mm}body{margin:0;background:#fff}</style></head><body>${html}<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`); w.document.close(); };
    const dv = dlg.querySelector('[data-dev]');
    if (dv) dv.onclick = async () => { const v = parseFloat((prompt('Valor devolvido (R$):') || '').replace(/\./g, '').replace(',', '.')); if (!v) return; const m = prompt('Motivo da devolução:'); if (!m || !m.trim()) return;
      const x = await sb.rpc('registrar_devolucao', { p_recibo: r.id, p_valor: v, p_motivo: m.trim() }); if (x.error) { alert('Não foi possível registrar: ' + x.error.message); return; }
      await B.carregar(sb, eu); dlg.remove(); abrirRecibo(r.id); };
    const ml = dlg.querySelector('[data-mail]');
    if (ml) ml.onclick = async () => {
      const ck = B.dados().cks.find(c => c.id === r.comunidade_id) || {};
      dlg.querySelector('[data-imp]').click();
      window.KESP_EMAIL(ck.email, `Recibo ${r.numero}/${r.ano} – Kolping Estadual de São Paulo`, `Prezada ${ck.razao_social || ck.nome || r.pagador_nome},\n\nSegue em anexo o recibo nº ${r.numero}/${r.ano}, no valor de ${R(r.valor)}, referente ao pagamento de ${dataBR(r.data_pagamento)}.\n\nAgradecemos a contribuição da Comunidade.\n\nAtenciosamente,`);
      await sb.from('recibos').update({ enviado_em: new Date().toISOString() }).eq('id', r.id);
      window.KESP_TOAST('Salve o PDF na janela de impressão e anexe ao e-mail que abriu.');
    };
    const cn = dlg.querySelector('[data-can]');
    if (cn) cn.onclick = async () => { const m = prompt('Motivo do cancelamento:'); if (m === null) return; if (!m.trim()) { alert('Informe o motivo.'); return; } const x = await sb.from('recibos').update({ situacao: 'cancelado', cancelado_motivo: m.trim() }).eq('id', r.id); if (x.error) { alert('Não foi possível cancelar: ' + x.error.message); return; } await B.carregar(sb, eu); dlg.remove(); abrirRecibo(r.id); };
  }

  function documento(r, quem) {
    const base = location.href.split('#')[0].replace(/[^/]*$/, '');
    const logo = base + 'logo-kolping.png';
    const timbrado = r.modelo === 'timbrado';
    const itens = (r.itens || []).map(i => `<tr><td style="padding:7px 0;border-bottom:1px solid #EFE9E2">${i.tipo === 'solidariedade' ? 'Solidariedade ' + (i.mes ? MESX[i.mes - 1] + '/' + i.ano : '') : i.tipo === 'societaria' ? 'Societária ' + (i.ano || '') : (i.quantidade > 1 ? i.quantidade + ' × ' : '') + esc(i.descricao || i.tipo)}${i.devido && i.pago < i.devido - 0.001 ? ' · parcial' : ''}</td><td style="text-align:right;border-bottom:1px solid #EFE9E2">${i.devido ? R(i.devido) : ''}</td><td style="text-align:right;border-bottom:1px solid #EFE9E2">${R(i.pago)}</td></tr>`).join('');
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
        ${(r._devs || []).map(d => `<p style="font-size:12px;color:#A3262C;margin:6px 0 0">Devolução de ${R(d.valor)} em ${new Date(d.feito_em).toLocaleDateString('pt-BR')}: ${esc(d.motivo)}</p>`).join('')}
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

  function telaLote() {
    const D = B.dados(), hoje = new Date().toISOString().slice(0, 10);
    const linhas = D.cks.filter(c => c.ativa).map(ck => {
      const ab = todasLinhas(ck).filter(l => l.ja < l.devido - 0.001).sort((a, b) => a.venc.localeCompare(b.venc))[0];
      if (!ab) return null; const cred = Math.max(0, B.credito(ck.id)), val = r2(Math.max(0, ab.devido - ab.ja - cred));
      return { ck, l: ab, val };
    }).filter(Boolean).sort((a, b) => a.ck.nome.localeCompare(b.ck.nome, 'pt-BR'));
    const c = document.getElementById('cont');
    c.innerHTML = `<p class="sm">Para várias CKs que pagaram o valor exato do mês em aberto mais antigo (já descontado o crédito). Marque, confira o valor e emita.</p>
      <div class="fm dois" style="max-width:420px"><div><label>Data do pagamento</label><input id="lData" type="date" value="${hoje}"></div><div><label>Forma</label><select id="lForma">${['PIX', 'Transferência', 'Depósito', 'Dinheiro', 'Boleto'].map(f => `<option>${f}</option>`).join('')}</select></div></div>
      <div style="margin-top:10px">${linhas.map((x, i) => `<div class="pe" style="--c:${x.l.venc < hoje ? '#E5484D' : '#6E6A7C'}"><input type="checkbox" data-i="${i}" style="width:20px;height:20px"><div style="flex:1;min-width:0"><b>${esc(x.ck.nome)}</b><div class="sm">${x.l.tipo === 'societaria' ? 'Societária ' + x.l.ano : MESX[x.l.mes - 1] + '/' + x.l.ano}${x.l.venc < hoje ? ' · em atraso' : ''}</div></div><input class="in" data-v="${i}" value="${String(x.val.toFixed(2)).replace('.', ',')}" style="width:100px;text-align:right"></div>`).join('') || '<p class="sm">Nenhuma CK com mês em aberto.</p>'}</div>
      ${linhas.length ? '<button class="btn" id="lEmit" style="margin-top:10px">Emitir selecionados</button><p class="sm" id="lSt"></p>' : ''}`;
    const b = document.getElementById('lEmit'); if (!b) return;
    b.onclick = async () => {
      const sel = [...c.querySelectorAll('[data-i]:checked')].map(x => +x.dataset.i); if (!sel.length) { alert('Marque ao menos uma CK.'); return; }
      const data = document.getElementById('lData').value, forma = document.getElementById('lForma').value;
      if (!confirm(`Emitir ${sel.length} recibo(s) com data ${dataBR(data)}?`)) return;
      b.disabled = true; let ok = 0, falhas = [];
      for (const i of sel) {
        const x = linhas[i], v = parseFloat(c.querySelector(`[data-v="${i}"]`).value.replace(/\./g, '').replace(',', '.')) || 0;
        if (v <= 0) { falhas.push(x.ck.nome + ' (valor zero)'); continue; }
        st = { ck: x.ck, valor: v, data, forma, modelo: 'padrao', obs: '', sel: new Set([x.l.k]), ano: 1 };
        const cc = calcular();
        const { error } = await sb.rpc('emitir_recibo', { p_ck: x.ck.id, p_data: data, p_forma: forma, p_valor: cc.V, p_itens: cc.itens.map(it => ({ tipo: it.tipo, ano: it.ano, mes: it.mes, devido: it.devido, pago: it.pago, credito: 0 })), p_credito_usado: cc.cu, p_credito_novo: cc.cn, p_referencia: texto(cc, x.ck, data), p_modelo: 'padrao', p_obs: null });
        if (error) falhas.push(x.ck.nome); else ok++;
        document.getElementById('lSt').textContent = `Emitidos ${ok} de ${sel.length}…`;
      }
      novoEstado(); await B.carregar(sb, eu);
      alert(`${ok} recibo(s) emitido(s).` + (falhas.length ? '\nNão emitidos: ' + falhas.join(', ') : '') + '\nEles estão no Histórico para conferir e enviar.');
      aba = 'historico'; render();
    };
  }

  function novoEstado() { st = { tipo: 'CK', pagador: 'ck', ck: null, avulso: {}, extras: [], quitar: [], guarda: true, destinoSobra: 'devolver', valor: 0, data: new Date().toISOString().slice(0, 10), forma: 'PIX', modelo: 'padrao', obs: '', sel: new Set(), ano: 1 }; }
  function render() {
    const pg = document.getElementById('pg');
    pg.innerHTML = `<h1>Recibos</h1><p class="sub">Taxas (CK), eventos (EV) e livres (RL)</p><div class="abas" style="grid-template-columns:repeat(4,1fr);max-width:600px"><a data-a="emitir" class="${aba === 'emitir' ? 'on' : ''}">Emitir</a><a data-a="lote" class="${aba === 'lote' ? 'on' : ''}">Lote</a><a data-a="itens" class="${aba === 'itens' ? 'on' : ''}">Itens</a><a data-a="historico" class="${aba === 'historico' ? 'on' : ''}">Histórico</a></div><div id="cont"></div>`;
    pg.querySelectorAll('[data-a]').forEach(a => a.onclick = () => { aba = a.dataset.a; render(); });
    if (aba !== 'historico' && !(eu.admin || window.KESP_PODE('recibos.emitir'))) { document.getElementById('cont').innerHTML = '<p class="sm">Você pode consultar o histórico, mas não emitir recibos.</p>'; return; }
    if (aba === 'emitir') telaEmitir(); else if (aba === 'lote') telaLote(); else if (aba === 'itens') telaItens(); else telaHistorico();
  }
  window.KESP_RECIBOS = {
    async abrir(cliente, perfil) {
      sb = cliente; eu = perfil; B = window.KESP_CKS.base; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>';
      await B.carregar(sb, eu); await extras(); if (!st) novoEstado();
      let pre = null; try { pre = sessionStorage.getItem('kesp.recibo.ck'); sessionStorage.removeItem('kesp.recibo.ck'); } catch (_) {}
      if (pre) { novoEstado(); st.ck = B.dados().cks.find(x => x.id === pre) || null; aba = 'emitir'; }
      render();
    }
  };
})();

// ===================== Apoio: e-mail e impressão =====================
window.KESP_EMAIL = function (para, assunto, corpo) {
  const u = 'mailto:' + encodeURIComponent(para || '') + '?subject=' + encodeURIComponent(assunto) + '&body=' + encodeURIComponent(corpo);
  const a = document.createElement('a'); a.href = u; document.body.appendChild(a); a.click(); a.remove();
};
window.KESP_IMPRIMIR = function (titulo, html, paisagem) {
  const w = window.open('', '_blank');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${titulo}</title><style>@page{size:A4 ${paisagem ? 'landscape' : 'portrait'};margin:12mm}body{margin:0;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#1E1B19}</style></head><body>${html}<script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
  w.document.close();
};

// ===================== Cobrança (inadimplência e cartas) =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MESX = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  let sb, eu, B;
  function pendencias(ck) {
    const ANO = new Date().getFullYear(), hoje = new Date().toISOString().slice(0, 10), L = [];
    [ANO - 1, ANO].forEach(a => { const e = B.extrato(ck, a);
      e.meses.forEach(m => { if (m.venc < hoje && m.devido > 0 && m.pago < m.devido - 0.001) L.push({ ref: 'Solidariedade ' + MESX[m.mes - 1] + '/' + a, devido: m.devido, pago: m.pago, falta: Math.round((m.devido - m.pago) * 100) / 100, parcial: m.pago > 0 }); });
      if (e.soc.venc < hoje && e.soc.devido > 0 && e.soc.pago < e.soc.devido - 0.001) L.push({ ref: 'Societária ' + a, devido: e.soc.devido, pago: e.soc.pago, falta: Math.round((e.soc.devido - e.soc.pago) * 100) / 100, parcial: e.soc.pago > 0 }); });
    let cred = Math.max(0, B.credito(ck.id));
    L.forEach(p => { const u = Math.min(cred, p.falta); p.falta = Math.round((p.falta - u) * 100) / 100; cred -= u; });
    return L.filter(p => p.falta > 0.001);
  }
  function render() {
    const D = B.dados(), R = B.R, grupos = { parcial: [], um: [], dois: [], quatro: [] };
    D.cks.filter(c => c.ativa).forEach(ck => { const p = pendencias(ck); if (!p.length) return; const tot = p.reduce((s, x) => s + x.falta, 0), cheios = p.filter(x => !x.parcial).length, item = { ck, p, tot };
      if (!cheios) grupos.parcial.push(item); else if (cheios === 1) grupos.um.push(item); else if (cheios <= 3) grupos.dois.push(item); else grupos.quatro.push(item); });
    const total = Object.values(grupos).flat().reduce((s, x) => s + x.tot, 0);
    const G = [['parcial', 'PENDÊNCIA PARCIAL', '#F5A524'], ['um', '1 MÊS EM ATRASO', '#F07830'], ['dois', '2 A 3 MESES', '#E5484D'], ['quatro', '4 MESES OU MAIS', '#B4232A']];
    document.getElementById('pg').innerHTML = `<h1>Cobrança</h1><p class="sub">Inadimplência considerando o crédito de cada CK</p>
      <div class="cd" style="--c:#E5484D;margin-bottom:12px"><div class="hd"><span>TOTAL EM ABERTO</span></div><div class="big" style="color:#FF9A9D">${R(total)}</div><div class="sm">${Object.values(grupos).flat().length} CKs com pendência</div></div>
      ${G.map(([k, t, c]) => grupos[k].length ? `<p class="gr-t" style="font-size:11px;letter-spacing:.08em;color:${c};margin:14px 0 6px">${t}</p>${grupos[k].sort((a, b) => b.tot - a.tot).map(x => `<div class="pe" style="--c:${c}"><div style="flex:1;min-width:0"><b>${esc(x.ck.nome)}</b><div class="sm">${x.p.map(p => p.ref + (p.parcial ? ' (parcial)' : '')).join(', ')}</div></div><b style="color:${c}">${R(x.tot)}</b><div class="ac"><button class="mini" data-carta="${x.ck.id}">Carta</button></div></div>`).join('')}` : '').join('') || '<div class="cd" style="--c:#22C984"><b style="color:#5FE0A8">Nenhuma CK com pendência. 🎉</b></div>'}`;
    document.querySelectorAll('[data-carta]').forEach(b => b.onclick = () => carta(D.cks.find(c => c.id === b.dataset.carta)));
  }
  async function carta(ck) {
    const R = B.R, p = pendencias(ck), tot = p.reduce((s, x) => s + x.falta, 0);
    const { data: kd } = await sb.from('kolping_dados_bancarios').select('*').eq('id', 1).maybeSingle();
    const pag = kd && (kd.chave_pix || kd.conta) ? `Dados para pagamento: ${[kd.banco, kd.agencia && 'Ag. ' + kd.agencia, kd.conta && 'C/C ' + kd.conta, kd.chave_pix && 'PIX ' + kd.chave_pix].filter(Boolean).join(' · ')}` : '';
    const texto = `Prezada ${ck.razao_social || ck.nome},\n\nIdentificamos as seguintes contribuições em aberto com a Kolping Estadual de São Paulo:\n\n${p.map(x => `• ${x.ref}: ${R(x.falta)}`).join('\n')}\n\nTotal em aberto: ${R(tot)}.\n\n${pag ? pag + '\n\n' : ''}Se o pagamento já foi feito, por favor desconsidere esta mensagem e nos envie o comprovante. Ficamos à disposição para conversar.\n\nAtenciosamente,`;
    const dlg = document.createElement('div'); dlg.className = 'conf';
    dlg.innerHTML = `<div class="cx fm" style="max-width:620px;max-height:92vh;overflow-y:auto"><b>Carta de cobrança · ${esc(ck.nome)}</b><p class="sm" style="margin:4px 0 8px">Revise o texto antes de enviar. ${ck.email ? 'Vai para ' + esc(ck.email) : '<b style="color:#F8C46A">A CK não tem e-mail cadastrado.</b>'}</p>
      <textarea id="ctx" rows="16" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(8,12,20,.7);color:#F2EEEA;font-size:13px;font-family:inherit;line-height:1.5">${esc(texto)}</textarea>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn sec" data-x>Cancelar</button><button class="btn sec" data-pdf>Imprimir / PDF</button><button class="btn" data-mail style="flex:1">Abrir no e-mail</button></div></div>`;
    document.body.appendChild(dlg);
    const salvar = async () => { await sb.from('cartas_cobranca').insert({ comunidade_id: ck.id, itens: p, total: tot, texto: dlg.querySelector('#ctx').value, situacao: 'enviada', criado_por: eu.id, enviada_em: new Date().toISOString() }); };
    dlg.querySelector('[data-x]').onclick = () => dlg.remove();
    dlg.querySelector('[data-pdf]').onclick = () => window.KESP_IMPRIMIR('Carta ' + ck.nome, `<div style="max-width:640px;margin:0 auto;font-size:13px;line-height:1.6"><img src="${location.href.split('#')[0].replace(/[^/]*$/, '')}logo-kolping.png" style="height:42px;margin-bottom:20px"><div style="white-space:pre-wrap">${esc(dlg.querySelector('#ctx').value)}</div></div>`);
    dlg.querySelector('[data-mail]').onclick = async () => { window.KESP_EMAIL(ck.email, 'Contribuições em aberto – Kolping Estadual de São Paulo', dlg.querySelector('#ctx').value); await salvar(); dlg.remove(); window.KESP_TOAST('Carta registrada como enviada.'); };
  }
  window.KESP_COBRANCA = { async abrir(c, p) { sb = c; eu = p; B = window.KESP_CKS.base; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>'; await B.carregar(sb, eu); render(); } };
})();

// ===================== Relatório de taxas =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  let sb, eu, B, ano = new Date().getFullYear(), dist = '';
  const COR = { pago: ['#DDF5E9', '#127A4A'], parcial: ['#FDF1D6', '#9A6A00'], atraso: ['#FBDADB', '#A3262C'], a_vencer: ['#F1EEEA', '#8A8078'], isento: ['#F1EEEA', '#B0A89F'] };
  function dados() {
    const D = B.dados(); const cks = D.cks.filter(c => c.ativa && (!dist || c.distrito_id === dist)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    return cks.map(ck => { const e = B.extrato(ck, ano); return { ck, e, total: e.meses.reduce((s, m) => s + m.pago, 0) }; });
  }
  function tabela(L, impresso) {
    const R = B.R, totMes = MESES.map((_, i) => L.reduce((s, x) => s + x.e.meses[i].pago, 0)), tot = L.reduce((s, x) => s + x.total, 0);
    const cel = m => { const [bg, fg] = COR[m.sit]; return `<td style="background:${bg};color:${fg};text-align:center;padding:5px 3px;border:2px solid #fff;font-size:${impresso ? 8.5 : 11}px;white-space:nowrap">${m.sit === 'a_vencer' || m.sit === 'isento' ? (m.devido ? R(m.devido) : '—') : R(m.pago)}</td>`; };
    return `<table style="width:100%;border-collapse:collapse;font-size:${impresso ? 9 : 12}px;color:#1E1B19"><tr style="font-size:${impresso ? 8 : 10}px;color:#8A8078"><th style="text-align:left;padding:5px">Comunidade</th>${MESES.map(m => `<th style="padding:5px 2px">${impresso ? m.slice(0, 3) : m}</th>`).join('')}<th style="color:#C85E1C">Total</th></tr>
      ${L.map(x => `<tr><td style="padding:5px;font-weight:600;white-space:nowrap">${esc(x.ck.nome)}</td>${x.e.meses.map(cel).join('')}<td style="text-align:right;font-weight:700;color:#C85E1C;padding:5px;white-space:nowrap">${R(x.total)}</td></tr>`).join('')}
      <tr style="background:#F7F4F0;font-weight:700"><td style="padding:6px 5px">Total do mês</td>${totMes.map(v => `<td style="text-align:center;font-size:${impresso ? 8.5 : 11}px;white-space:nowrap">${v ? R(v) : '—'}</td>`).join('')}<td style="text-align:right;color:#C85E1C;padding:5px;white-space:nowrap">${R(tot)}</td></tr></table>`;
  }
  let abaRel = 'taxas';
  function associados() {
    const D = B.dados(), min = B.taxa(new Date().getFullYear()).minimo_efetivos, R = B.R;
    const cks = D.cks.filter(c => (c.ativa || B.serieCk(c.id).length) && (!dist || c.distrito_id === dist)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const linhas = cks.map(ck => ({ ck, s: B.serieCk(ck.id) })), anos = [...new Set(linhas.flatMap(l => l.s.map(x => x.ano)))].sort();
    const tot = anos.map(a => { const r = { ano: a, ef: 0, co: 0 }; linhas.forEach(l => { const x = l.s.find(y => y.ano === a); if (x) { r.ef += x.ef; r.co += x.co; } }); return r; });
    const cel = (l, a) => { const x = l.s.find(y => y.ano === a); return x ? `<td title="${x.ef} efetivos · ${x.co} cooperadores" style="text-align:right;padding:6px;${x.ef < min ? 'color:#FF9A9D;' : ''}">${x.ef + x.co}</td>` : '<td style="text-align:right;padding:6px;color:#6E6A7C">—</td>'; };
    const varia = l => { const n = l.s.length; if (n < 2) return '<td style="text-align:right;padding:6px">—</td>'; const d = (l.s[n - 1].ef + l.s[n - 1].co) - (l.s[n - 2].ef + l.s[n - 2].co); return `<td class="var ${d > 0 ? 'up' : d < 0 ? 'dn' : ''}" style="font-size:12px;text-align:right;padding:6px">${d > 0 ? '+' + d : d}</td>`; };
    const tabela = `<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="color:#A8A3B4;font-size:11px"><td style="padding:6px">Comunidade</td>${anos.map(a => `<td style="text-align:right;padding:6px">${a}</td>`).join('')}<td style="text-align:right;padding:6px">Variação</td></tr>
      ${linhas.map(l => `<tr style="border-top:1px solid rgba(255,255,255,.06)"><td style="padding:6px"><a class="lk" href="#ck/${l.ck.id}" style="color:#F2EEEA">${esc(l.ck.nome)}</a>${l.ck.ativa ? '' : ' <span class="sm">(inativa)</span>'}</td>${anos.map(a => cel(l, a)).join('')}${varia(l)}</tr>`).join('')}
      <tr style="border-top:1px solid rgba(255,255,255,.15);font-weight:700"><td style="padding:6px">Total</td>${tot.map(t => `<td style="text-align:right;padding:6px">${t.ef + t.co}</td>`).join('')}<td></td></tr></table>`;
    document.getElementById('relCont').innerHTML = `${window.KESP_EVOL.card(tot, 'TOTAL DE TODAS AS CKs')}
      <div class="cd" style="--c:#3B82F6;margin-top:12px;overflow-x:auto"><div class="hd"><span>POR COMUNIDADE · EFETIVOS + COOPERADORES</span><span>em vermelho: abaixo de ${min} efetivos</span></div>${anos.length ? tabela : '<p class="sm">Sem dados.</p>'}</div>`;
    window.KESP_EVOL.ligar(document.getElementById('relCont'));
    document.getElementById('pdf').onclick = () => {
      const base = location.href.split('#')[0].replace(/[^/]*$/, ''), dd = D.dist.find(d => d.id === dist);
      const th = `<tr style="font-size:9px;color:#8A8078"><th style="text-align:left;padding:4px">Comunidade</th>${anos.map(a => `<th style="text-align:right;padding:4px">${a}</th>`).join('')}</tr>`;
      const tr = linhas.map(l => `<tr><td style="padding:4px;border-bottom:1px solid #EFE9E2">${esc(l.ck.nome)}${l.ck.ativa ? '' : ' (inativa)'}</td>${anos.map(a => { const x = l.s.find(y => y.ano === a); return `<td style="text-align:right;padding:4px;border-bottom:1px solid #EFE9E2;${x && x.ef < min ? 'color:#A3262C;' : ''}">${x ? `${x.ef + x.co} <span style="color:#8A8078;font-size:8px">(${x.ef}/${x.co})</span>` : '—'}</td>`; }).join('')}</tr>`).join('');
      const tt = `<tr style="font-weight:700;background:#F7F4F0"><td style="padding:5px 4px">Total</td>${tot.map(t => `<td style="text-align:right;padding:5px 4px">${t.ef + t.co} <span style="color:#8A8078;font-size:8px">(${t.ef}/${t.co})</span></td>`).join('')}</tr>`;
      window.KESP_IMPRIMIR('Relatório de associados', `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #F07830;padding-bottom:8px;margin-bottom:10px"><img src="${base}logo-kolping.png" style="height:36px"><div style="text-align:right"><div style="font-size:15px;font-weight:700">Relatório de Associados</div><div style="font-size:10px;color:#8A8078">${dd ? 'Distrito ' + esc(dd.nome) : 'Todos os distritos'} · gerado em ${new Date().toLocaleDateString('pt-BR')} por ${esc(eu.nome)}</div></div></div>
        <table style="width:100%;border-collapse:collapse;font-size:10px">${th}${tr}${tt}</table><p style="font-size:9px;color:#8A8078">Total (efetivos/cooperadores). Em vermelho: abaixo do mínimo de ${min} efetivos.</p>
        <div style="margin-top:18px;text-align:center"><div style="color:#5A4E46;font-size:11px">Carapicuíba, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</div>${eu.assinatura_url ? `<img src="${esc(eu.assinatura_url)}" style="height:46px;display:block;margin:4px auto -4px">` : '<div style="height:40px"></div>'}<div style="border-top:1px solid #1E1B19;width:240px;margin:0 auto;padding-top:3px;font-weight:700;font-size:11px">${esc(eu.nome)}</div><div style="color:#8A8078;font-size:10px">${esc(eu.cargo || '')} · Kolping Estadual de São Paulo</div></div>`, anos.length > 6);
    };
  }
  function render() {
    const D = B.dados(), L = dados(), R = B.R;
    document.getElementById('pg').innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start"><div><h1>Relatórios</h1><p class="sub">${abaRel === 'taxas' ? 'Solidariedade ' + ano + ' · valor pago em cada mês' : 'Evolução de associados de todos os anos com dados'}</p></div><button class="btn" id="pdf">Imprimir / Salvar PDF</button></div>
      <div class="abas" style="grid-template-columns:repeat(2,1fr);max-width:360px"><a data-ra="taxas" class="${abaRel === 'taxas' ? 'on' : ''}">Taxas</a><a data-ra="associados" class="${abaRel === 'associados' ? 'on' : ''}">Associados</a></div>
      <div style="display:flex;gap:8px;margin-bottom:12px"><select class="in" id="ano"${abaRel === 'associados' ? ' style="display:none"' : ''}>${[ano - 2, ano - 1, ano, ano + 1].map(a => `<option${a === ano ? ' selected' : ''}>${a}</option>`).join('')}</select><select class="in" id="dist"><option value="">Todos os distritos</option>${D.dist.map(d => `<option value="${d.id}"${dist === d.id ? ' selected' : ''}>${esc(d.nome)}</option>`).join('')}</select></div>
      <div id="relCont">${abaRel === 'taxas' ? `<div style="overflow-x:auto;background:#fff;border-radius:12px;padding:10px">${tabela(L)}</div>
      <p class="sm" style="margin-top:8px">Verde: pago · Amarelo: parcial · Vermelho: em atraso · Cinza: a vencer (valor devido)</p>` : ''}</div>`;
    document.querySelectorAll('[data-ra]').forEach(a => a.onclick = () => { abaRel = a.dataset.ra; render(); });
    document.getElementById('ano').onchange = e => { ano = +e.target.value; render(); };
    document.getElementById('dist').onchange = e => { dist = e.target.value; render(); };
    if (abaRel === 'associados') return associados();
    document.getElementById('pdf').onclick = () => {
      const base = location.href.split('#')[0].replace(/[^/]*$/, ''), tot = L.reduce((s, x) => s + x.total, 0), dd = D.dist.find(d => d.id === dist);
      const em = L.filter(x => x.e.situacao === 'em_dia').length, pa = L.filter(x => x.e.situacao === 'parcial').length, at = L.filter(x => x.e.situacao === 'atraso').length;
      window.KESP_IMPRIMIR('Relatório de taxas ' + ano, `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #F07830;padding-bottom:8px;margin-bottom:10px"><img src="${base}logo-kolping.png" style="height:36px"><div style="text-align:right"><div style="font-size:15px;font-weight:700">Relatório de Taxas · Solidariedade ${ano}</div><div style="font-size:10px;color:#8A8078">${dd ? 'Distrito ' + esc(dd.nome) : 'Todos os distritos'} · gerado em ${new Date().toLocaleDateString('pt-BR')} por ${esc(eu.nome)}</div></div></div>
        <div style="display:flex;gap:10px;margin-bottom:10px;font-size:11px">${[['Total recebido no ano', R(tot)], ['CKs em dia', em], ['Com pendência parcial', pa], ['Em atraso', at]].map(([t, v]) => `<div style="flex:1;background:#FBF5EF;border-radius:6px;padding:6px 10px"><span style="color:#8A8078">${t}</span><br><b style="font-size:14px">${v}</b></div>`).join('')}</div>
        ${tabela(L, true)}<p style="font-size:9px;color:#8A8078">Verde: pago · Amarelo: parcial · Vermelho: em atraso · Cinza: a vencer</p>
        <div style="margin-top:18px;text-align:center"><div style="color:#5A4E46;font-size:11px">Carapicuíba, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</div>${eu.assinatura_url ? `<img src="${esc(eu.assinatura_url)}" style="height:46px;display:block;margin:4px auto -4px">` : '<div style="height:40px"></div>'}<div style="border-top:1px solid #1E1B19;width:240px;margin:0 auto;padding-top:3px;font-weight:700;font-size:11px">${esc(eu.nome)}</div><div style="color:#8A8078;font-size:10px">${esc(eu.cargo || '')} · Kolping Estadual de São Paulo</div></div>
        <div style="margin-top:10px;font-size:8px;color:#9A9088;text-align:center">Kolping Estadual de São Paulo · R. Rio Branco, 36 – Cohab II, Carapicuíba – SP, 06326-030 · (11) 4183-6018</div>`, true);
    };
  }
  window.KESP_RELATORIOS = { async abrir(c, p) { sb = c; eu = p; B = window.KESP_CKS.base; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>'; await B.carregar(sb, eu); render(); } };
})();

// ===================== Recadastramento (campanha e conferência) =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let sb, eu, B, ano = new Date().getFullYear() + (new Date().getMonth() >= 9 ? 1 : 0), conv = [], recs = [];
  const SIT = { nao: ['Não abriu', '#6E6A7C'], rascunho: ['Começou', '#F5A524'], enviado: ['A conferir', '#3B82F6'], aprovado: ['Aprovado', '#22C984'], devolvido: ['Devolvido', '#E5484D'] };
  const link = t => location.href.split('#')[0].replace(/[^/]*$/, '') + 'recadastramento.html?t=' + t;
  async function carregar() {
    await B.carregar(sb, eu);
    const [c, r] = await Promise.all([sb.from('recad_convites').select('*').eq('ano', ano), sb.from('recadastramentos').select('*').in('ano', [ano, ano - 1])]);
    conv = c.data || []; recs = r.data || [];
  }
  function render() {
    const D = B.dados(), cks = D.cks.filter(c => c.ativa).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const linhas = cks.map(ck => { const r = recs.find(x => x.comunidade_id === ck.id && x.ano === ano), cv = conv.find(x => x.comunidade_id === ck.id); return { ck, r, cv, s: r ? r.situacao : 'nao' }; });
    const cont = s => linhas.filter(l => l.s === s).length;
    document.getElementById('pg').innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start"><div><h1>Recadastramento ${ano}</h1><p class="sub">Campanha e conferência</p></div><div style="display:flex;gap:8px"><select class="in" id="ano">${[ano - 1, ano, ano + 1].map(a => `<option${a === ano ? ' selected' : ''}>${a}</option>`).join('')}</select><button class="btn" id="gerar">Gerar links</button></div></div>
      <div class="g4">${['enviado', 'aprovado', 'rascunho', 'nao'].map(s => `<div class="cd" style="--c:${SIT[s][1]}"><div class="hd"><span>${SIT[s][0].toUpperCase()}</span></div><div class="big">${cont(s)}</div></div>`).join('')}</div>
      <div style="margin-top:12px">${linhas.sort((a, b) => ['enviado', 'devolvido', 'rascunho', 'nao', 'aprovado'].indexOf(a.s) - ['enviado', 'devolvido', 'rascunho', 'nao', 'aprovado'].indexOf(b.s)).map(l => `<div class="pe" style="--c:${SIT[l.s][1]}"><div style="flex:1;min-width:0"><b>${esc(l.ck.nome)}</b><div class="sm" style="color:${SIT[l.s][1]}">${SIT[l.s][0]}${l.cv && l.cv.enviado_em ? ' · link enviado em ' + new Date(l.cv.enviado_em).toLocaleDateString('pt-BR') : ''}</div></div><div class="ac">${l.s === 'enviado' ? `<button class="mini" data-conf="${l.ck.id}">Conferir</button>` : ''}${l.cv && l.s !== 'aprovado' ? `<button class="mini neu" data-copiar="${l.cv.token}">Copiar link</button><button class="mini neu" data-mail="${l.ck.id}">E-mail</button>` : ''}</div></div>`).join('')}</div>`;
    document.getElementById('ano').onchange = async e => { ano = +e.target.value; await carregar(); render(); };
    document.getElementById('gerar').onclick = async () => {
      const faltam = cks.filter(ck => !conv.some(c => c.comunidade_id === ck.id));
      if (!faltam.length) { window.KESP_TOAST('Todas as CKs ativas já têm link para ' + ano + '.'); return; }
      const r = await sb.from('recad_convites').insert(faltam.map(ck => ({ comunidade_id: ck.id, ano })));
      if (r.error) { alert('Não foi possível gerar os links.'); return; }
      await carregar(); render(); window.KESP_TOAST(faltam.length + ' links gerados.');
    };
    document.querySelectorAll('[data-copiar]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(link(b.dataset.copiar)); window.KESP_TOAST('Link copiado.'); } catch (_) { prompt('Copie o link:', link(b.dataset.copiar)); } });
    document.querySelectorAll('[data-mail]').forEach(b => b.onclick = async () => {
      const ck = D.cks.find(c => c.id === b.dataset.mail), cv = conv.find(c => c.comunidade_id === ck.id);
      window.KESP_EMAIL(ck.email, `Recadastramento ${ano} – ${ck.nome}`, `Prezada ${ck.razao_social || ck.nome},\n\nEstá aberto o recadastramento ${ano} das Comunidades Kolping. Acesse o link abaixo, confirme o CNPJ da CK e preencha as informações:\n\n${link(cv.token)}\n\nO formulário salva a cada etapa, então é possível continuar depois. O link vale por 90 dias.\n\nAtenciosamente,`);
      await sb.from('recad_convites').update({ enviado_em: new Date().toISOString() }).eq('token', cv.token); await carregar(); render();
    });
    document.querySelectorAll('[data-conf]').forEach(b => b.onclick = () => conferir(D.cks.find(c => c.id === b.dataset.conf)));
  }
  function conferir(ck) {
    const r = recs.find(x => x.comunidade_id === ck.id && x.ano === ano), a = recs.find(x => x.comunidade_id === ck.id && x.ano === ano - 1) || B.dados().recad.filter(x => x.comunidade_id === ck.id && x.ano < ano).sort((x, y) => y.ano - x.ano)[0];
    const R = B.R, t = B.taxa(ano), d = r.dados || {}, da = (a && a.dados) || {};
    const lin = (n, v, va) => { const mud = String(v ?? '') !== String(va ?? '') && a; return `<tr><td style="padding:5px 8px;color:#A8A3B4">${n}</td><td style="padding:5px 8px">${esc(va ?? '—')}</td><td style="padding:5px 8px;${mud ? 'color:#FFB070;font-weight:600' : ''}">${esc(v ?? '—')}</td></tr>`; };
    const docs = d.documentos && !Array.isArray(d.documentos) ? Object.entries(d.documentos).map(([k, v]) => k + ': ' + ({ tem: 'tem', andamento: 'em andamento', nao: 'não tem' }[v] || v)).join(' · ') : (d.documentos || []).join(', ');
    const n = r.efetivos + r.cooperadores;
    const dlg = document.createElement('div'); dlg.className = 'conf';
    dlg.innerHTML = `<div class="cx" style="max-width:760px;max-height:92vh;overflow-y:auto"><b>Conferência · ${esc(ck.nome)} · ${ano}</b><p class="sm" style="margin:4px 0 10px">Em laranja, o que mudou em relação a ${a ? a.ano : 'nenhum ano anterior'}.</p>
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="font-size:11px;color:#8E899A"><td></td><td style="padding:5px 8px">${a ? a.ano : 'Anterior'}</td><td style="padding:5px 8px">${ano}</td></tr>
      ${lin('Efetivos', r.efetivos, a && a.efetivos)}${lin('Cooperadores', r.cooperadores, a && a.cooperadores)}${lin('Honorários', r.honorarios, a && a.honorarios)}${lin('Voluntários', r.voluntarios, a && a.voluntarios)}${lin('Funcionários', r.funcionarios, a && a.funcionarios)}${lin('Prestadores', r.prestadores, a && a.prestadores)}
      ${lin('Presidente', d.presidente, da.presidente)}${lin('Vice-presidente', d.vice_presidente, da.vice_presidente)}${lin('1º tesoureiro(a)', d.tesoureiro_1, da.tesoureiro_1)}${lin('1º secretário(a)', d.secretario_1, da.secretario_1)}${lin('Mandato', [d.vigencia_ini, d.vigencia_fim].filter(Boolean).join(' a '), [da.vigencia_ini, da.vigencia_fim].filter(Boolean).join(' a '))}${lin('Sede', d.sede, da.sede)}${lin('E-mail da CK', d.contato && d.contato.email, ck.email)}${lin('Telefone da CK', d.contato && d.contato.telefone, ck.telefone)}</table></div>
      <p class="sm" style="margin:10px 0 0">Documentos: ${esc(docs || '—')}</p><p class="sm" style="margin:4px 0 0">Responsável: ${esc(d.resp_nome || '—')} ${esc(d.resp_telefone || '')} · LGPD: ${r.consentimento_lgpd_em ? '✓ ' + new Date(r.consentimento_lgpd_em).toLocaleString('pt-BR') : '—'} · Uso de imagem: ${r.uso_imagem === true ? 'autorizado' : r.uso_imagem === false ? 'não autorizado' : 'não respondeu'}</p>
      <div class="cd" style="--c:#22C984;margin-top:10px"><div class="kv"><span>Taxa de solidariedade</span><span><b>${R(n * t.solidariedade)}</b> por mês (${n} associados)</span><span>Taxa societária</span><span><b>${R(n * t.societaria)}</b> no ano</span>${r.efetivos < t.minimo_efetivos ? `<span style="color:#FF9A9D">Atenção</span><span style="color:#FF9A9D">abaixo do mínimo de ${t.minimo_efetivos} efetivos</span>` : ''}</div></div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn sec" data-x>Fechar</button><button class="btn sec" data-dev style="color:#FF9A9D">Devolver para correção</button><button class="btn" data-apr style="flex:1">Aprovar</button></div></div>`;
    document.body.appendChild(dlg);
    dlg.querySelector('[data-x]').onclick = () => dlg.remove();
    dlg.querySelector('[data-dev]').onclick = async () => { const m = prompt('O que a CK precisa corrigir?'); if (!m || !m.trim()) return; await sb.from('recadastramentos').update({ situacao: 'devolvido', motivo_devolucao: m.trim() }).eq('id', r.id);
      const cv = conv.find(c => c.comunidade_id === ck.id); if (cv) window.KESP_EMAIL(ck.email || (d.contato && d.contato.email), `Recadastramento ${ano} – correção necessária`, `Prezada ${ck.razao_social || ck.nome},\n\nConferimos o recadastramento ${ano} e precisamos de um ajuste:\n\n${m.trim()}\n\nPor favor, acesse o mesmo link, corrija e envie novamente:\n${link(cv.token)}\n\nAtenciosamente,`);
      dlg.remove(); await carregar(); render(); };
    dlg.querySelector('[data-apr]').onclick = async () => {
      const x = await sb.from('recadastramentos').update({ situacao: 'aprovado', aprovado_em: new Date().toISOString(), aprovado_por: eu.id, vigente_desde: new Date().toISOString().slice(0, 8) + '01' }).eq('id', r.id);
      if (x.error) { alert('Não foi possível aprovar.'); return; }
      const c = d.contato || {}; const up = {}; ['logradouro', 'numero', 'bairro', 'cidade', 'uf', 'cep', 'email', 'telefone'].forEach(k => { if (c[k]) up[k] = c[k]; });
      if (Object.keys(up).length) await sb.from('comunidades').update(up).eq('id', ck.id);
      await sb.from('avisos').update({ resolvido_em: new Date().toISOString() }).is('destinatario', null).is('resolvido_em', null).eq('texto', ck.nome);
      if (confirm('Aprovado! Abrir o e-mail de confirmação para a CK?')) window.KESP_EMAIL(ck.email || c.email, `Recadastramento ${ano} aprovado – ${ck.nome}`, `Prezada ${ck.razao_social || ck.nome},\n\nO recadastramento ${ano} foi conferido e aprovado. Obrigado!\n\nA partir de agora, a taxa de solidariedade é de ${R(n * t.solidariedade)} por mês (${n} associados) e a taxa societária de ${ano} é de ${R(n * t.societaria)}.\n\nAtenciosamente,`);
      dlg.remove(); await carregar(); render();
    };
  }
  window.KESP_RECAD = { async abrir(c, p) { sb = c; eu = p; B = window.KESP_CKS.base; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>'; await carregar(); render(); } };
})();


// ===================== Visitas =====================
window.KESP_VISITAS = (function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dBR = d => new Date(d + 'T12:00').toLocaleDateString('pt-BR');
  const TIPOS = ['Visita', 'Reunião', 'Assembleia', 'Formação', 'Evento'];
  const CARGOS = [['presidente', 'presidente'], ['vice_presidente', 'vice-presidente'], ['tesoureiro_1', 'tesoureiro(a)'], ['secretario_1', 'secretário(a)'], ['coordenador', 'coordenador(a)']];
  let sb, eu;
  async function aba(cli, perfil, ck, cont, ext, recad) {
    sb = cli; eu = perfil;
    const { data } = await sb.from('visitas').select('*').eq('comunidade_id', ck.id).order('data', { ascending: false });
    const pode = eu.admin || window.KESP_PODE('visitas.registrar');
    cont.innerHTML = `${pode ? '<button class="btn" id="vNova" style="margin-bottom:10px">Registrar visita</button>' : ''}${(data || []).map(v => `<div class="pe" style="--c:#F07830"><div style="flex:1;min-width:0"><b>${esc(v.tipo)} · ${dBR(v.data)}</b><div class="sm">${esc(v.objetivo || '')}</div><div class="sm">${(v.fotos || []).length} foto(s) · ${(v.encaminhamentos || []).length} encaminhamento(s)${v.versao > 1 ? ' · editado' : ''}</div></div><div class="ac"><button class="mini neu" data-pdf="${v.id}">PDF</button>${pode ? `<button class="mini" data-ed="${v.id}">Editar</button>` : ''}</div></div>`).join('') || '<p class="sm">Nenhuma visita registrada.</p>'}`;
    const nv = cont.querySelector('#vNova'); if (nv) nv.onclick = () => form(ck, null, recad, ext, () => aba(cli, perfil, ck, cont, ext, recad));
    cont.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => form(ck, data.find(v => v.id === b.dataset.ed), recad, ext, () => aba(cli, perfil, ck, cont, ext, recad)));
    cont.querySelectorAll('[data-pdf]').forEach(b => b.onclick = () => pdf(ck, data.find(v => v.id === b.dataset.pdf), ext));
  }
  function form(ck, v, recad, ext, fim) {
    const dd = (recad && recad.dados) || {}, pessoas = CARGOS.filter(([k]) => dd[k]).map(([k, c]) => dd[k] + ' (' + c + ')');
    const st = { participantes: new Set(v ? v.participantes : []), fotos: v ? [...v.fotos] : [], enc: v ? [...v.encaminhamentos] : [] };
    const dlg = document.createElement('div'); dlg.className = 'conf';
    const desenhar = () => {
      dlg.innerHTML = `<div class="cx fm" style="max-width:640px;max-height:92vh;overflow-y:auto"><b>${v ? 'Editar visita' : 'Registrar visita'} · ${esc(ck.nome)}</b>
      <div class="dois"><div><label>Data</label><input type="date" id="vD" value="${v ? v.data : new Date().toISOString().slice(0, 10)}"></div><div><label>Tipo</label><select id="vT">${TIPOS.map(t => `<option${v && v.tipo === t ? ' selected' : ''}>${t}</option>`).join('')}</select></div></div>
      <label>Participantes (toque para marcar)</label><div style="display:flex;flex-wrap:wrap;gap:6px">${[...new Set([...pessoas, ...st.participantes])].map(p => `<a class="ch" data-p="${esc(p)}" style="cursor:pointer;${st.participantes.has(p) ? '' : 'background:rgba(255,255,255,.06);color:#D8D3DE;border-color:transparent'}">${esc(p)}</a>`).join('')}<a class="ch" id="vOutro" style="cursor:pointer;background:transparent">+ outra pessoa</a></div>
      <label>Objetivo</label><input id="vO" value="${esc(v ? v.objetivo || '' : '')}">
      <label>Anotações</label><textarea id="vA" rows="5" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(8,12,20,.7);color:#F2EEEA;font-family:inherit;font-size:14px">${esc(v ? v.anotacoes || '' : '')}</textarea>
      <p class="sm" style="margin:4px 0 0">Para ditar, use o microfone do teclado do seu celular.</p>
      <label>Relatório (organizado pela KAI e revisado por você)</label><textarea id="vR" rows="6" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:rgba(8,12,20,.7);color:#F2EEEA;font-family:inherit;font-size:14px">${esc(v && v.relatorio ? v.relatorio.texto || '' : '')}</textarea>
      <button class="btn sec" id="vKai" style="margin-top:6px">Organizar com a KAI</button>
      <label>Fotos (até 6)</label><div style="display:flex;gap:6px;flex-wrap:wrap">${st.fotos.map((f, i) => `<div style="position:relative"><img src="${f.src}" style="width:72px;height:72px;object-fit:cover;border-radius:8px"><a data-rf="${i}" style="position:absolute;top:-6px;right:-6px;background:#E5484D;color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px">×</a></div>`).join('')}${st.fotos.length < 6 ? '<label style="width:72px;height:72px;border:1px dashed rgba(255,255,255,.3);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin:0;font-size:22px">+<input type="file" accept="image/*" multiple id="vF" style="display:none"></label>' : ''}</div>
      <label>Encaminhamentos</label>${st.enc.map((e, i) => `<div class="pe" style="--c:#3B82F6;margin:4px 0"><span style="flex:1">${esc(e.acao)}</span><span class="sm">${esc(e.responsavel || '')}${e.prazo ? ' · ' + dBR(e.prazo) : ''}</span><a data-re="${i}" class="lk">remover</a></div>`).join('')}
      <div class="dois" style="grid-template-columns:2fr 1fr 1fr;gap:6px"><input id="eA" placeholder="Ação"><input id="eR" placeholder="Responsável"><input id="eP" type="date"></div><a class="lk" id="eAdd" style="font-size:13px">+ adicionar encaminhamento</a>
      <div style="display:flex;gap:8px;margin-top:14px"><button class="btn sec" style="flex:1" data-x>Cancelar</button><button class="btn" style="flex:1" data-ok>Salvar</button></div></div>`;
      const g = id => dlg.querySelector('#' + id);
      const guardar = () => { st.data = g('vD').value; st.tipo = g('vT').value; st.objetivo = g('vO').value; st.anotacoes = g('vA').value; st.relatorio = g('vR').value; };
      dlg.querySelectorAll('[data-p]').forEach(a => a.onclick = () => { guardar(); st.participantes.has(a.dataset.p) ? st.participantes.delete(a.dataset.p) : st.participantes.add(a.dataset.p); desenhar(); rest(); });
      g('vOutro').onclick = () => { const n = prompt('Nome e função da pessoa:'); if (n && n.trim()) { guardar(); st.participantes.add(n.trim()); desenhar(); rest(); } };
      dlg.querySelectorAll('[data-rf]').forEach(a => a.onclick = () => { guardar(); st.fotos.splice(+a.dataset.rf, 1); desenhar(); rest(); });
      dlg.querySelectorAll('[data-re]').forEach(a => a.onclick = () => { guardar(); st.enc.splice(+a.dataset.re, 1); desenhar(); rest(); });
      g('eAdd').onclick = () => { if (!g('eA').value.trim()) return; guardar(); st.enc.push({ acao: g('eA').value.trim(), responsavel: g('eR').value.trim(), prazo: g('eP').value || null }); desenhar(); rest(); };
      const fi = g('vF'); if (fi) fi.onchange = async () => { guardar(); for (const f of [...fi.files].slice(0, 6 - st.fotos.length)) st.fotos.push({ src: await reduzir(f), legenda: '' }); desenhar(); rest(); };
      g('vKai').onclick = async () => { guardar(); if (!st.anotacoes.trim()) { alert('Escreva as anotações primeiro.'); return; } const b = g('vKai'); b.disabled = true; b.textContent = 'A KAI está organizando…';
        const pedido = `Organize as anotações de uma visita da Kolping Estadual de São Paulo à ${ck.nome} em um relatório interno curto, em português, com as seções "Principais pontos" (tópicos) e "Próximo passo" (uma frase). Não invente nada que não esteja nas anotações. Objetivo: ${st.objetivo || '—'}. Participantes: ${[...st.participantes].join(', ') || '—'}. Anotações: ${st.anotacoes}`;
        const { data, error } = await sb.functions.invoke('kai', { body: { mensagens: [{ papel: 'eu', texto: pedido }] } });
        b.disabled = false; b.textContent = 'Organizar com a KAI';
        if (error || !data || !data.texto) { alert(data && data.pausa ? 'A KAI está em pausa. Você pode escrever o relatório manualmente.' : 'A KAI não conseguiu responder agora.'); return; }
        g('vR').value = data.texto; };
      dlg.querySelector('[data-x]').onclick = () => dlg.remove();
      dlg.querySelector('[data-ok]').onclick = async () => { guardar(); if (!st.data) { alert('Informe a data.'); return; }
        const reg = { comunidade_id: ck.id, data: st.data, tipo: st.tipo, participantes: [...st.participantes], objetivo: st.objetivo || null, anotacoes: st.anotacoes || null, relatorio: st.relatorio ? { texto: st.relatorio } : null, encaminhamentos: st.enc, fotos: st.fotos };
        const r = v ? await sb.from('visitas').update(reg).eq('id', v.id) : await sb.from('visitas').insert({ ...reg, criado_por: eu.id });
        if (r.error) { alert('Não foi possível salvar: ' + r.error.message); return; } dlg.remove(); fim(); };
    };
    const rest = () => { ['data', 'tipo', 'objetivo', 'anotacoes', 'relatorio'].forEach(k => { const m = { data: 'vD', tipo: 'vT', objetivo: 'vO', anotacoes: 'vA', relatorio: 'vR' }[k], el = dlg.querySelector('#' + m); if (el && st[k] !== undefined) el.value = st[k]; }); };
    document.body.appendChild(dlg); desenhar();
  }
  function reduzir(f) { return new Promise(res => { const img = new Image(); img.onload = () => { const e = Math.min(1, 1024 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = img.width * e; c.height = img.height * e; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .7)); }; img.src = URL.createObjectURL(f); }); }
  function pdf(ck, v, ext) {
    const base = location.href.split('#')[0].replace(/[^/]*$/, ''), R = window.KESP_CKS.base.R;
    const sit = { em_dia: 'Em dia', parcial: 'Com pendência parcial', atraso: 'Em atraso', inativa: 'Inativa' }[ext.situacao];
    const corpo = v.relatorio && v.relatorio.texto ? esc(v.relatorio.texto).replace(/\n/g, '<br>') : esc(v.anotacoes || '').replace(/\n/g, '<br>');
    window.KESP_IMPRIMIR('Relatório de visita ' + ck.nome, `<div style="max-width:700px;margin:0 auto;font-size:12px;line-height:1.55">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #F07830;padding-bottom:8px"><img src="${base}logo-kolping.png" style="height:36px"><div style="text-align:right"><span style="font-size:9px;padding:2px 8px;border-radius:10px;background:#FBDADB;color:#A3262C;font-weight:700">USO INTERNO</span><div style="font-size:15px;font-weight:700;margin-top:4px">Relatório de ${esc(v.tipo)}</div><div style="color:#8A8078">${esc(ck.nome)}</div></div></div>
      <div style="display:flex;gap:8px;margin:12px 0">${[['Data', dBR(v.data)], ['Tipo', v.tipo], ['Cidade', ck.cidade || '—'], ['Situação no dia', sit + (ext.aberto ? ' · ' + R(ext.aberto) : '')]].map(([t, x]) => `<div style="flex:1;background:#FBF5EF;border-radius:6px;padding:6px 10px"><span style="color:#8A8078;font-size:10px">${t}</span><br><b>${esc(x)}</b></div>`).join('')}</div>
      <h3 style="font-size:11px;color:#C85E1C;letter-spacing:.06em;margin:14px 0 4px">PARTICIPANTES</h3><p style="margin:0">${esc(v.participantes.join(', ') || '—')}</p>
      <h3 style="font-size:11px;color:#C85E1C;letter-spacing:.06em;margin:14px 0 4px">OBJETIVO</h3><p style="margin:0">${esc(v.objetivo || '—')}</p>
      <h3 style="font-size:11px;color:#C85E1C;letter-spacing:.06em;margin:14px 0 4px">RELATÓRIO</h3><p style="margin:0">${corpo || '—'}</p>
      ${v.encaminhamentos.length ? `<h3 style="font-size:11px;color:#C85E1C;letter-spacing:.06em;margin:14px 0 4px">ENCAMINHAMENTOS</h3><table style="width:100%;border-collapse:collapse"><tr style="background:#FBF0E6"><th style="text-align:left;padding:4px">Ação</th><th style="text-align:left;padding:4px">Responsável</th><th style="text-align:left;padding:4px">Prazo</th></tr>${v.encaminhamentos.map(e => `<tr><td style="padding:4px;border-bottom:1px solid #EFE9E2">${esc(e.acao)}</td><td style="padding:4px;border-bottom:1px solid #EFE9E2">${esc(e.responsavel || '')}</td><td style="padding:4px;border-bottom:1px solid #EFE9E2">${e.prazo ? dBR(e.prazo) : ''}</td></tr>`).join('')}</table>` : ''}
      ${v.fotos.length ? `<h3 style="font-size:11px;color:#C85E1C;letter-spacing:.06em;margin:14px 0 4px">FOTOS</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${v.fotos.map(f => `<img src="${f.src}" style="width:100%;height:150px;object-fit:cover;border-radius:6px">`).join('')}</div>` : ''}
      <div style="margin-top:26px;text-align:center"><div style="color:#5A4E46">Carapicuíba, ${new Date(v.data + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</div>${eu.assinatura_url ? `<img src="${esc(eu.assinatura_url)}" style="height:50px;display:block;margin:4px auto -4px">` : '<div style="height:44px"></div>'}<div style="border-top:1px solid #1E1B19;width:260px;margin:0 auto;padding-top:4px;font-weight:700">${esc(eu.nome)}</div><div style="color:#8A8078">${esc(eu.cargo || '')} · Kolping Estadual de São Paulo</div></div>
      ${v.versao > 1 ? `<p style="font-size:9px;color:#8A8078;text-align:center">Editado em ${new Date(v.atualizado_em).toLocaleDateString('pt-BR')}</p>` : ''}</div>`);
  }
  return { aba };
})();

// ===================== Questionário da Kolping Internacional =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TIPOS = { texto: 'Texto', numero: 'Número', valor: 'Valor (R$)', simnao: 'Sim / Não', data: 'Data' };
  const PRE = { '': '—', nome: 'Nome da CK', endereco: 'Endereço', email: 'E-mail', telefone: 'Telefone', efetivos: 'Efetivos', cooperadores: 'Cooperadores', honorarios: 'Honorários', voluntarios: 'Voluntários', funcionarios: 'Funcionários', prestadores: 'Prestadores', presidente: 'Presidente', vigencia_fim: 'Fim do mandato' };
  let sb, eu, B, atual = null;
  const link = t => location.href.split('#')[0].replace(/[^/]*$/, '') + 'questionario.html?t=' + t;
  const txt = (p, ano) => p.titulo.replace(/\{ano\}/g, ano);
  async function lista() {
    const { data } = await sb.from('questionarios').select('*').order('criado_em', { ascending: false });
    const pg = document.getElementById('pg');
    pg.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><h1>Questionários</h1><p class="sub">Kolping Internacional e outros</p></div><label class="btn" style="cursor:pointer">Novo a partir da planilha<input type="file" id="qArq" accept=".xlsx,.xls,.csv" style="display:none"></label></div>
      ${(data || []).map(q => `<div class="pe" style="--c:${q.situacao === 'publicado' ? '#22C984' : q.situacao === 'encerrado' ? '#6E6A7C' : '#F5A524'};cursor:pointer" data-q="${q.id}"><div style="flex:1"><b>${esc(q.titulo)}</b><div class="sm">Dados de ${q.ano_ref} · ${(q.perguntas || []).length} perguntas · ${{ rascunho: 'Rascunho', publicado: 'Publicado', encerrado: 'Encerrado' }[q.situacao] || q.situacao}</div></div><span style="color:#6E6A7C">›</span></div>`).join('') || '<p class="sm">Nenhum questionário.</p>'}`;
    pg.querySelectorAll('[data-q]').forEach(x => x.onclick = () => abrir(data.find(q => q.id === x.dataset.q)));
    document.getElementById('qArq').onchange = e => importar(e.target.files[0]);
  }
  async function xlsxLib() { if (window.XLSX) return; await new Promise((ok, er) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = ok; s.onerror = er; document.head.appendChild(s); }); }
  async function importar(f) {
    if (!f) return; await xlsxLib();
    const wb = XLSX.read(await f.arrayBuffer(), { cellDates: true }), ws = wb.Sheets[wb.SheetNames[0]], rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
    const h = (rows[0] || []).map(v => String(v || '').trim()), dat = rows.slice(1).filter(r => r && r.length);
    const anos = (h.join(' ').match(/20\d\d/g) || []).map(Number), anoRef = anos.length ? Math.max(...anos) : new Date().getFullYear() - 1;
    const perg = []; h.forEach((t, i) => {
      if (!t || /carimbo|endere[cç]o de e-?mail$/i.test(t)) return;
      const vals = dat.map(r => r[i]).filter(v => v !== undefined && v !== null && v !== '');
      const l = t.toLowerCase(); let tipo = 'texto';
      if (/r\$|valor/.test(l)) tipo = 'valor'; else if (vals.length && vals.every(v => /^(sim|n[aã]o)$/i.test(String(v).trim()))) tipo = 'simnao'; else if (vals.length && vals.every(v => v instanceof Date)) tipo = 'data'; else if (vals.length && vals.every(v => typeof v === 'number' || /^\d+$/.test(String(v).trim()))) tipo = 'numero';
      let pre = ''; [[/nome da comunidade/, 'nome'], [/endere/, 'endereco'], [/e-?mail/, 'email'], [/telefone/, 'telefone'], [/efetiv/, 'efetivos'], [/cooperad/, 'cooperadores'], [/honor/, 'honorarios'], [/volunt/, 'voluntarios'], [/funcion/, 'funcionarios'], [/prestador/, 'prestadores']].some(([re, k]) => re.test(l) && (pre = k));
      const p = { id: 'q' + i, titulo: t.replace(new RegExp(String(anoRef), 'g'), '{ano}'), tipo, pre: pre || undefined };
      if (/^\d*\s*-?\s*se sim/i.test(t.replace(/^\d+\s*-\s*/, '')) || /se sim/i.test(l)) { const ant = [...perg].reverse().find(x => x.tipo === 'simnao'); if (ant) p.se = ant.id; }
      perg.push(p);
    });
    const titulo = prompt('Título do questionário:', 'Questionário Kolping Internacional ' + (anoRef + 1)); if (!titulo) return;
    const { data, error } = await sb.from('questionarios').insert({ titulo, ano_ref: anoRef, perguntas: perg }).select().single();
    if (error) { alert('Não foi possível criar: ' + error.message); return; }
    window.KESP_TOAST(perg.length + ' perguntas criadas. Confira os tipos antes de publicar.'); abrir(data);
  }
  async function abrir(q) {
    atual = q; await B.carregar(sb, eu);
    const [c, r] = await Promise.all([sb.from('quest_convites').select('*').eq('questionario_id', q.id), sb.from('questionario_respostas').select('comunidade_id,situacao,enviado_em,respostas').eq('questionario_id', q.id)]);
    const conv = c.data || [], resp = r.data || [], D = B.dados(), pg = document.getElementById('pg');
    const cks = D.cks.filter(x => x.ativa || resp.some(y => y.comunidade_id === x.id)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const sit = ck => { const x = resp.find(y => y.comunidade_id === ck.id); return x ? x.situacao : 'nao'; };
    const cnt = s => cks.filter(ck => sit(ck) === s).length;
    const ed = q.situacao === 'rascunho';
    pg.innerHTML = `<a class="lk" id="qVol">‹ Questionários</a><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:6px"><div><h1>${esc(q.titulo)}</h1><p class="sub">Dados de ${q.ano_ref} · ${{ rascunho: 'Rascunho', publicado: 'Publicado', encerrado: 'Encerrado' }[q.situacao]}</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${ed ? '<button class="btn sec" id="qSalvar">Salvar perguntas</button><button class="btn" id="qPub">Publicar e gerar links</button>' : ''}${q.situacao === 'publicado' ? '<button class="btn sec" id="qEnc">Encerrar</button>' : ''}<button class="btn" id="qExp">Exportar planilha</button></div></div>
      ${!ed ? `<div class="g4" style="margin-bottom:12px">${[['enviado', 'RESPONDERAM', '#22C984'], ['rascunho', 'COMEÇARAM', '#F5A524'], ['nao', 'NÃO ABRIRAM', '#E5484D']].map(([k, t, cor]) => `<div class="cd" style="--c:${cor}"><div class="hd"><span>${t}</span></div><div class="big">${cnt(k)}</div></div>`).join('')}</div>
        ${cks.map(ck => { const s = sit(ck), cv = conv.find(x => x.comunidade_id === ck.id); return `<div class="pe" style="--c:${{ enviado: '#22C984', rascunho: '#F5A524', nao: '#E5484D' }[s]}"><div style="flex:1;min-width:0"><b>${esc(ck.nome)}</b><div class="sm">${{ enviado: 'Respondeu', rascunho: 'Começou', nao: 'Não abriu' }[s]}${cv && cv.enviado_em ? ' · link enviado em ' + new Date(cv.enviado_em).toLocaleDateString('pt-BR') : ''}</div></div><div class="ac">${cv && q.situacao === 'publicado' && s !== 'enviado' ? `<button class="mini neu" data-cp="${cv.token}">Copiar link</button><button class="mini" data-ml="${ck.id}">E-mail</button>` : ''}</div></div>`; }).join('')}` : ''}
      <div class="cd" style="--c:#3B82F6;margin-top:12px"><div class="hd"><span>PERGUNTAS (${q.perguntas.length})</span><span>${ed ? 'ajuste os tipos e o preenchimento automático' : ''}</span></div>
        ${q.perguntas.map((p, i) => `<div class="lin fm" style="display:grid;grid-template-columns:1fr ${ed ? '130px 150px' : 'auto'};gap:8px;align-items:center"><span style="font-size:13px">${esc(txt(p, q.ano_ref))}${p.se ? ' <span class="sm">(só se a anterior for "Sim")</span>' : ''}</span>${ed ? `<select data-tp="${i}">${Object.entries(TIPOS).map(([k, v]) => `<option value="${k}"${p.tipo === k ? ' selected' : ''}>${v}</option>`).join('')}</select><select data-pr="${i}">${Object.entries(PRE).map(([k, v]) => `<option value="${k}"${(p.pre || '') === k ? ' selected' : ''}>${v}</option>`).join('')}</select>` : `<span class="sm">${TIPOS[p.tipo]}${p.pre ? ' · pré-preenchida' : ''}</span>`}</div>`).join('')}</div>`;
    const g = id => document.getElementById(id);
    g('qVol').onclick = lista;
    const lerPerg = () => { pg.querySelectorAll('[data-tp]').forEach(s => (q.perguntas[+s.dataset.tp].tipo = s.value)); pg.querySelectorAll('[data-pr]').forEach(s => (q.perguntas[+s.dataset.pr].pre = s.value || undefined)); };
    if (g('qSalvar')) g('qSalvar').onclick = async () => { lerPerg(); const x = await sb.from('questionarios').update({ perguntas: q.perguntas }).eq('id', q.id); window.KESP_TOAST(x.error ? 'Não foi possível salvar.' : 'Perguntas salvas.'); };
    if (g('qPub')) g('qPub').onclick = async () => { lerPerg(); const prazo = prompt('Prazo para as CKs responderem (dd/mm/aaaa), ou deixe em branco:', ''); const pz = prazo && /^\d{2}\/\d{2}\/\d{4}$/.test(prazo) ? prazo.split('/').reverse().join('-') : null;
      const x = await sb.from('questionarios').update({ perguntas: q.perguntas, situacao: 'publicado', prazo: pz }).eq('id', q.id); if (x.error) { alert('Não foi possível publicar.'); return; }
      await sb.from('quest_convites').insert(D.cks.filter(ck => ck.ativa).map(ck => ({ questionario_id: q.id, comunidade_id: ck.id })));
      q.situacao = 'publicado'; q.prazo = pz; abrir(q); };
    if (g('qEnc')) g('qEnc').onclick = async () => { if (!confirm('Encerrar o questionário? As CKs não poderão mais responder.')) return; await sb.from('questionarios').update({ situacao: 'encerrado' }).eq('id', q.id); q.situacao = 'encerrado'; abrir(q); };
    pg.querySelectorAll('[data-cp]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(link(b.dataset.cp)); window.KESP_TOAST('Link copiado.'); } catch (_) { prompt('Copie o link:', link(b.dataset.cp)); } });
    pg.querySelectorAll('[data-ml]').forEach(b => b.onclick = async () => { const ck = D.cks.find(x => x.id === b.dataset.ml), cv = conv.find(x => x.comunidade_id === ck.id);
      window.KESP_EMAIL(ck.email, `${q.titulo} – ${ck.nome}`, `Prezada ${ck.razao_social || ck.nome},\n\nEstá aberto o ${q.titulo}, com informações de ${q.ano_ref}. Acesse o link abaixo, confirme o CNPJ da CK e responda. Várias respostas já vêm preenchidas com os dados do recadastramento; é só conferir.\n\n${link(cv.token)}\n${q.prazo ? '\nPrazo: ' + new Date(q.prazo + 'T12:00').toLocaleDateString('pt-BR') + '\n' : ''}\nAtenciosamente,`);
      await sb.from('quest_convites').update({ enviado_em: new Date().toISOString() }).eq('token', cv.token); abrir(q); });
    g('qExp').onclick = async () => { await xlsxLib();
      const cab = ['Comunidade Kolping', 'Enviado em', ...q.perguntas.map(p => txt(p, q.ano_ref))];
      const linhas = cks.filter(ck => resp.some(y => y.comunidade_id === ck.id && y.situacao === 'enviado')).map(ck => { const x = resp.find(y => y.comunidade_id === ck.id); return [ck.nome, x.enviado_em ? new Date(x.enviado_em).toLocaleDateString('pt-BR') : '', ...q.perguntas.map(p => x.respostas[p.id] ?? '')]; });
      const ws = XLSX.utils.aoa_to_sheet([cab, ...linhas]), wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Respostas'); XLSX.writeFile(wb, q.titulo.replace(/[^\w\- ]+/g, '') + '.xlsx'); };
  }
  window.KESP_QUEST = { async abrir(c, p) { sb = c; eu = p; B = window.KESP_CKS.base; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>'; await lista(); } };
})();

// ===================== Compras e Pedidos de material (limpeza) =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MESX = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const mesTxt = m => MESX[+m.slice(5, 7) - 1] + '/' + m.slice(0, 4);
  const mesAtual = () => new Date().toISOString().slice(0, 8) + '01';
  const proxMes = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 8) + '01'; };
  const SIT0 = { rascunho: ['Rascunho', '#6E6A7C'], enviado: ['Enviado', '#3B82F6'], orcamento: ['Em orçamento', '#F5A524'], aprovado: ['Aprovado', '#8B5CF6'], recebido: ['Recebido', '#22C984'] };
  const SIT = new Proxy(SIT0, { get: (t, k) => t[k] || t.rascunho });
  let sb, eu, P = [], V = [], U = [], MOV = [], MIN = [];
  async function base() {
    const [p, v, u, m, mi] = await Promise.all([sb.from('produtos').select('*').eq('area', 'limpeza').order('ordem'), sb.from('produto_variacoes').select('*').order('ordem'), sb.from('unidades').select('*').order('ordem'), sb.from('estoque_mov').select('*').order('criado_em'), sb.from('estoque_minimo').select('*')]);
    P = p.data || []; V = (v.data || []).filter(x => P.some(y => y.id === x.produto_id)); U = u.data || []; MOV = m.data || []; MIN = mi.data || [];
  }
  const prod = vr => P.find(p => p.id === vr.produto_id) || {};
  const nomeItem = vr => { const p = prod(vr); return p.nome + (vr.nome ? ' · ' + vr.nome : ''); };
  const unidade = vr => vr.unidade_pedido || prod(vr).unidade_pedido;
  const specTxt = vr => [...(prod(vr).especificacao || []), ...(vr.especificacao || [])].map(e => (e.campo ? e.campo + ': ' : '') + e.valor);
  // estoque: última contagem + entradas depois dela
  function estoque(un, vid) {
    const ms = MOV.filter(m => m.unidade_id === un && m.variacao_id === vid); let q = null;
    ms.forEach(m => { if (m.tipo === 'contagem') q = Number(m.quantidade); else q = (q || 0) + Number(m.quantidade); });
    return q;
  }
  function consumoMedio(un, vid) {
    const ms = MOV.filter(m => m.unidade_id === un && m.variacao_id === vid), cs = []; let ant = null, ent = 0;
    ms.forEach(m => { if (m.tipo === 'contagem') { if (ant !== null) cs.push(Math.max(0, ant + ent - Number(m.quantidade))); ant = Number(m.quantidade); ent = 0; } else ent += Number(m.quantidade); });
    const u = cs.slice(-3); return u.length ? Math.round(u.reduce((s, x) => s + x, 0) / u.length * 10) / 10 : null;
  }
  const minimo = (un, vid) => { const x = MIN.find(m => m.unidade_id === un && m.variacao_id === vid); return x ? Number(x.minimo) : 0; };
  const contouMes = (un, mes) => MOV.some(m => m.unidade_id === un && m.tipo === 'contagem' && m.mes === mes);
  const lista = () => V.filter(v => v.ativo && prod(v).ativo).sort((a, b) => nomeItem(a).localeCompare(nomeItem(b), 'pt-BR'));

  // ---------- Unidades: contagem e pedido ----------
  async function pedidos(cli, perfil) {
    sb = cli; eu = perfil; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>'; await base();
    const minhas = eu.admin ? U : U.filter(u => u.responsavel === eu.id);
    if (!minhas.length) { document.getElementById('pg').innerHTML = '<div class="vazio"><h1>Pedidos de material</h1><p class="sub">Você não é responsável por nenhuma unidade. Fale com o administrador.</p></div>'; return; }
    let un = sessionStorage.getItem('kesp.unidade') || minhas[0].id; if (!minhas.some(u => u.id === un)) un = minhas[0].id;
    const mes = mesAtual(), entrega = proxMes();
    const { data: pd } = await sb.from('pedidos_material').select('*').eq('area', 'limpeza').eq('unidade_id', un).eq('mes', entrega).maybeSingle();
    const contou = contouMes(un, mes), pg = document.getElementById('pg');
    pg.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><h1>Pedido de limpeza</h1><p class="sub">Entrega em ${mesTxt(entrega)} · pedidos até o dia 20</p></div>${minhas.length > 1 ? `<select class="in" id="pUn">${minhas.map(u => `<option value="${u.id}"${u.id === un ? ' selected' : ''}>${esc(u.nome)}</option>`).join('')}</select>` : `<b>${esc(minhas[0].nome)}</b>`}</div>
      <div class="g4" style="margin:10px 0"><div class="cd" style="--c:${contou ? '#22C984' : '#F5A524'}"><div class="hd"><span>1 · CONTAGEM DO ESTOQUE</span></div><div class="big" style="font-size:16px">${contou ? 'Feita ✓' : 'Pendente'}</div></div>
        <div class="cd" style="--c:${pd ? SIT[pd.situacao][1] : '#6E6A7C'}"><div class="hd"><span>2 · PEDIDO</span></div><div class="big" style="font-size:16px">${pd ? SIT[pd.situacao][0] : 'Não iniciado'}</div></div></div>
      <div class="abas" style="grid-template-columns:repeat(2,1fr);max-width:360px"><a data-t="cont" class="${!contou ? 'on' : ''}">Contagem</a><a data-t="ped" class="${contou ? 'on' : ''}">Pedido</a></div><div id="pCont"></div>`;
    const sel = document.getElementById('pUn'); if (sel) sel.onchange = e => { sessionStorage.setItem('kesp.unidade', e.target.value); pedidos(sb, eu); };
    const t = k => { pg.querySelectorAll('[data-t]').forEach(a => a.classList.toggle('on', a.dataset.t === k)); k === 'cont' ? contagem(un, mes) : pedido(un, entrega, pd, contou); };
    pg.querySelectorAll('[data-t]').forEach(a => a.onclick = () => t(a.dataset.t)); t(contou ? 'ped' : 'cont');
  }
  function contagem(un, mes) {
    const c = document.getElementById('pCont'), it = lista();
    c.innerHTML = `<p class="sm">Conte o que sobrou de cada item na unidade. Deixe em branco o que não tem; use 0 se acabou.</p><input class="in" id="cBus" placeholder="Buscar item" style="width:100%;margin-bottom:8px">
      <div id="cLst">${it.map(v => { const at = estoque(un, v.id); return `<div class="pe" style="--c:#22C984" data-n="${esc(nomeItem(v).toLowerCase())}"><div style="flex:1;min-width:0"><b style="font-size:13px">${esc(nomeItem(v))}</b><div class="sm">${esc(unidade(v))}${at !== null ? ' · antes: ' + at : ''}</div></div><button class="mini neu" data-m="${v.id}">−</button><input class="in" data-q="${v.id}" inputmode="decimal" style="width:64px;text-align:center"><button class="mini neu" data-p="${v.id}">+</button></div>`; }).join('')}</div>
      <button class="btn" id="cSalvar" style="width:100%;margin-top:10px">Salvar contagem</button>`;
    c.querySelector('#cBus').oninput = e => c.querySelectorAll('[data-n]').forEach(d => (d.style.display = d.dataset.n.includes(e.target.value.toLowerCase()) ? '' : 'none'));
    const q = id => c.querySelector(`[data-q="${id}"]`);
    c.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const i = q(b.dataset.m); i.value = Math.max(0, (parseFloat(i.value) || 0) - 1); });
    c.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { const i = q(b.dataset.p); i.value = (parseFloat(i.value) || 0) + 1; });
    c.querySelector('#cSalvar').onclick = async () => {
      const regs = it.map(v => ({ v, x: q(v.id).value.trim() })).filter(r => r.x !== '').map(r => ({ unidade_id: un, variacao_id: r.v.id, tipo: 'contagem', quantidade: parseFloat(r.x.replace(',', '.')) || 0, mes, criado_por: eu.id }));
      const vazios = it.length - regs.length;
      if (!confirm(`Salvar a contagem de ${regs.length} itens?` + (vazios ? `\n${vazios} item(ns) em branco serão considerados como 0.` : ''))) return;
      it.forEach(v => { if (!regs.some(r => r.variacao_id === v.id)) regs.push({ unidade_id: un, variacao_id: v.id, tipo: 'contagem', quantidade: 0, mes, criado_por: eu.id }); });
      const r = await sb.from('estoque_mov').insert(regs); if (r.error) { alert('Não foi possível salvar: ' + r.error.message); return; }
      window.KESP_TOAST('Contagem salva.'); pedidos(sb, eu);
    };
  }
  function pedido(un, entrega, pd, contou) {
    const c = document.getElementById('pCont');
    if (!contou) { c.innerHTML = '<div class="cd" style="--c:#F5A524"><b>Faça a contagem do estoque primeiro.</b><p class="sm" style="margin:4px 0 0">O pedido é liberado depois da contagem do mês, e a sugestão de quantidade usa esse número.</p></div>'; return; }
    const bloq = pd && pd.situacao !== 'rascunho', it = lista(), atual = id => { const x = pd && pd.itens.find(i => i.variacao_id === id); return x ? x.quantidade : null; };
    const sug = v => { const cm = consumoMedio(un, v.id), at = estoque(un, v.id) || 0, mi = minimo(un, v.id); return cm === null && !mi ? null : Math.max(0, Math.ceil((cm || 0) + mi - at)); };
    c.innerHTML = `${bloq ? `<div class="cd" style="--c:${SIT[pd.situacao][1]};margin-bottom:8px"><b>Pedido ${SIT[pd.situacao][0].toLowerCase()}</b><p class="sm" style="margin:2px 0 0">Para mudar, fale com o setor de compras.</p></div>` : '<p class="sm">A sugestão usa o consumo médio dos últimos meses e o estoque contado. Ajuste o que precisar.</p>'}
      <input class="in" id="qBus" placeholder="Buscar item" style="width:100%;margin-bottom:8px">
      ${it.map(v => { const s = sug(v), a = atual(v.id); return `<div class="pe" style="--c:#3B82F6" data-n="${esc(nomeItem(v).toLowerCase())}"><div style="flex:1;min-width:0"><b style="font-size:13px">${esc(nomeItem(v))}</b><div class="sm">${esc(unidade(v))} · estoque ${estoque(un, v.id) ?? 0}${s !== null ? ' · sugestão <b style="color:#FFB070">' + s + '</b>' : ''}</div></div><input class="in" data-q="${v.id}" inputmode="decimal" value="${a ?? (s || '')}" style="width:64px;text-align:center"${bloq ? ' disabled' : ''}></div>`; }).join('')}
      ${bloq ? '' : '<div style="display:flex;gap:8px;margin-top:10px"><button class="btn sec" id="qRas" style="flex:1">Salvar rascunho</button><button class="btn" id="qEnv" style="flex:1">Enviar pedido</button></div>'}`;
    c.querySelector('#qBus').oninput = e => c.querySelectorAll('[data-n]').forEach(d => (d.style.display = d.dataset.n.includes(e.target.value.toLowerCase()) ? '' : 'none'));
    const salvar = async envia => {
      const itens = it.map(v => ({ variacao_id: v.id, quantidade: parseFloat((c.querySelector(`[data-q="${v.id}"]`).value || '').replace(',', '.')) || 0, sugerida: sug(v) })).filter(i => i.quantidade > 0);
      if (envia && !itens.length) { alert('O pedido está vazio.'); return; }
      if (envia && !confirm(`Enviar o pedido com ${itens.length} itens para o setor de compras?`)) return;
      const reg = { area: 'limpeza', unidade_id: un, mes: entrega, itens, situacao: envia ? 'enviado' : 'rascunho', enviado_em: envia ? new Date().toISOString() : null, criado_por: eu.id };
      const r = await sb.from('pedidos_material').upsert(reg, { onConflict: 'area,unidade_id,mes' });
      if (r.error) { alert('Não foi possível salvar: ' + r.error.message); return; }
      if (envia) { try { await sb.from('avisos').insert({ destinatario: null, tipo: 'fazer', prioridade: 'importante', titulo: 'Pedido de limpeza enviado · ' + (U.find(u => u.id === un) || {}).nome, link: '#compras', dispensavel: false }); } catch (_) {} }
      window.KESP_TOAST(envia ? 'Pedido enviado.' : 'Rascunho salvo.'); pedidos(sb, eu);
    };
    const r1 = c.querySelector('#qRas'); if (r1) { r1.onclick = () => salvar(false); c.querySelector('#qEnv').onclick = () => salvar(true); }
  }

  // ---------- Compras: catálogo, pedidos e estoques ----------
  let abaC = 'pedidos';
  async function compras(cli, perfil) {
    sb = cli; eu = perfil; document.getElementById('pg').innerHTML = '<p class="sm">Carregando…</p>'; await base();
    const pg = document.getElementById('pg');
    pg.innerHTML = `<h1>Compras · Limpeza</h1><p class="sub">Catálogo, pedidos das unidades, orçamentos e estoques</p><div class="abas" style="grid-template-columns:repeat(3,1fr);max-width:480px">${[['pedidos', 'Pedidos'], ['catalogo', 'Catálogo'], ['estoque', 'Estoques']].map(([k, n]) => `<a data-c="${k}" class="${abaC === k ? 'on' : ''}">${n}</a>`).join('')}</div><div id="cCont"></div>`;
    pg.querySelectorAll('[data-c]').forEach(a => a.onclick = () => { abaC = a.dataset.c; compras(sb, eu); });
    ({ pedidos: cPedidos, catalogo: cCatalogo, estoque: cEstoque })[abaC]();
  }
  async function cPedidos() {
    const c = document.getElementById('cCont'), entrega = proxMes();
    const { data } = await sb.from('pedidos_material').select('*').eq('area', 'limpeza').order('mes', { ascending: false }).limit(60);
    const doMes = (data || []).filter(p => p.mes === entrega);
    c.innerHTML = `<p class="sm">Entrega em ${mesTxt(entrega)}</p>${U.map(u => { const p = doMes.find(x => x.unidade_id === u.id), s = p ? SIT[p.situacao] : ['Não enviado', '#E5484D'];
      return `<div class="pe" style="--c:${s[1]}"><div style="flex:1;min-width:0"><b>${esc(u.nome)}</b><div class="sm" style="color:${s[1]}">${s[0]}${p ? ' · ' + p.itens.length + ' itens' + (p.numero_orc ? ' · ' + p.numero_orc : '') : ''}</div></div><div class="ac">${p && p.situacao !== 'rascunho' ? `<button class="mini" data-ver="${p.id}">Abrir</button>` : ''}</div></div>`; }).join('')}
      <p class="gr-t" style="font-size:11px;letter-spacing:.08em;color:#A8A3B4;margin:16px 0 6px">MESES ANTERIORES</p>${(data || []).filter(p => p.mes !== entrega && p.situacao !== 'rascunho').map(p => `<div class="pe" style="--c:${SIT[p.situacao][1]};cursor:pointer" data-ver="${p.id}"><div style="flex:1"><b>${esc((U.find(u => u.id === p.unidade_id) || {}).nome)}</b> <span class="sm">· ${mesTxt(p.mes)} · ${SIT[p.situacao][0]}</span></div></div>`).join('') || '<p class="sm">Nenhum.</p>'}`;
    c.querySelectorAll('[data-ver]').forEach(b => b.onclick = () => verPedido((data || []).find(p => p.id === b.dataset.ver)));
  }
  function verPedido(p) {
    const u = U.find(x => x.id === p.unidade_id) || {}, its = p.itens.map(i => ({ ...i, v: V.find(v => v.id === i.variacao_id) })).filter(i => i.v);
    const dlg = document.createElement('div'); dlg.className = 'conf';
    dlg.innerHTML = `<div class="cx" style="max-width:720px;max-height:92vh;overflow-y:auto"><b>${esc(u.nome)} · entrega ${mesTxt(p.mes)}</b><p class="sm" style="margin:2px 0 10px">${SIT[p.situacao][0]}${p.numero_orc ? ' · ' + p.numero_orc : ''}</p>
      ${its.map(i => `<div class="lin" style="display:flex;gap:10px;font-size:13px"><span style="flex:1">${esc(nomeItem(i.v))}</span><span class="sm">${i.sugerida != null && i.sugerida !== i.quantidade ? 'sugerido ' + i.sugerida + ' · ' : ''}</span><b>${i.quantidade} ${esc(unidade(i.v))}</b></div>`).join('')}
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn sec" data-x>Fechar</button>${p.situacao === 'enviado' || p.situacao === 'orcamento' ? '<button class="btn" data-orc>Solicitação de orçamento</button>' : ''}${p.situacao === 'orcamento' ? '<button class="btn sec" data-apr>Marcar como aprovado</button>' : ''}${p.situacao === 'aprovado' ? '<button class="btn" data-rec>Registrar recebimento</button>' : ''}</div></div>`;
    document.body.appendChild(dlg);
    dlg.querySelector('[data-x]').onclick = () => dlg.remove();
    const orc = dlg.querySelector('[data-orc]'); if (orc) orc.onclick = async () => {
      const num = p.numero_orc || `ORC-LIM-${p.mes.slice(0, 7)}-${String(U.findIndex(x => x.id === u.id) + 1).padStart(2, '0')}`;
      const prazo = prompt('Prazo para os fornecedores responderem (dd/mm/aaaa):', new Date(Date.now() + 5 * 864e5).toLocaleDateString('pt-BR')); if (prazo === null) return;
      await sb.from('pedidos_material').update({ situacao: 'orcamento', numero_orc: num }).eq('id', p.id);
      folha(p, u, its, num, prazo); dlg.remove(); cPedidos();
    };
    const apr = dlg.querySelector('[data-apr]'); if (apr) apr.onclick = async () => { await sb.from('pedidos_material').update({ situacao: 'aprovado' }).eq('id', p.id); dlg.remove(); cPedidos(); };
    const rec = dlg.querySelector('[data-rec]'); if (rec) rec.onclick = async () => {
      if (!confirm('Confirmar que a entrega chegou completa? As quantidades entram no estoque da unidade.')) return;
      const r = await sb.from('estoque_mov').insert(its.map(i => ({ unidade_id: p.unidade_id, variacao_id: i.variacao_id, tipo: 'entrada', quantidade: i.quantidade, mes: p.mes, referencia: p.numero_orc || 'Pedido ' + mesTxt(p.mes), criado_por: eu.id })));
      if (r.error) { alert('Não foi possível registrar.'); return; }
      await sb.from('pedidos_material').update({ situacao: 'recebido', recebido_em: new Date().toISOString() }).eq('id', p.id); await base(); dlg.remove(); cPedidos();
    };
  }
  function folha(p, u, its, num, prazo) {
    const base = location.href.split('#')[0].replace(/[^/]*$/, ''), end = [u.logradouro, u.numero, u.bairro].filter(Boolean).join(', ');
    window.KESP_IMPRIMIR('Solicitação de orçamento ' + num, `<div style="max-width:720px;margin:0 auto;font-size:11px;color:#1E1B19">
      <div style="height:38px;background:#F26B1D;display:flex;align-items:center;padding:0 20px;-webkit-print-color-adjust:exact;print-color-adjust:exact"><div style="background:#fff;padding:3px 6px;border-radius:2px;display:flex"><img src="${base}logo-kolping.png" style="height:24px"></div></div>
      <div style="padding:16px 24px"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px"><div><div style="font-size:17px;font-weight:700">Solicitação de orçamento</div><div style="color:#8A8078">Produtos de limpeza · entrega em ${mesTxt(p.mes)}</div></div><div style="background:#FBF0E6;border-left:3px solid #F07830;border-radius:6px;padding:5px 10px;text-align:right"><div style="color:#8A8078;font-size:9px">Nº</div><b style="font-size:13px">${num}</b></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px"><div style="background:#F7F4F0;border-radius:6px;padding:8px 10px;line-height:1.5"><b style="display:block;font-size:9px;color:#8A8078;letter-spacing:.08em">FATURAMENTO E COBRANÇA</b>Obra Kolping Estadual de São Paulo (O.K.E)<br>CNPJ 15.766.152/0001-77 · Inscr. Estadual: isento<br>R. Rio Branco, 36 – Cohab II – Carapicuíba-SP · 06326-030</div>
        <div style="background:#F7F4F0;border-radius:6px;padding:8px 10px;line-height:1.5"><b style="display:block;font-size:9px;color:#8A8078;letter-spacing:.08em">ENTREGA (FRETE)</b>${esc(u.nome)}<br>${esc(end || '[endereço da unidade]')}${u.cep ? ' · ' + esc(u.cep) : ''}<br>${esc(u.cidade || 'Carapicuíba')} – SP</div></div>
      <table style="width:100%;border-collapse:collapse"><tr style="background:#FBF0E6;font-size:9.5px;color:#5A4E46"><th style="text-align:left;padding:6px">#</th><th style="text-align:left;padding:6px">Produto</th><th style="text-align:left;padding:6px;width:38%">Especificação</th><th style="text-align:left;padding:6px">Marcas de preferência</th><th style="text-align:left;padding:6px">Un.</th><th style="text-align:right;padding:6px">Qtd.</th></tr>
        ${its.map((i, k) => { const sp = specTxt(i.v), mc = (i.v.marcas && i.v.marcas.length ? i.v.marcas : prod(i.v).marcas) || []; return `<tr><td style="padding:6px;border-bottom:1px solid #EFE9E2;vertical-align:top">${k + 1}</td><td style="padding:6px;border-bottom:1px solid #EFE9E2;vertical-align:top"><b>${esc(nomeItem(i.v))}</b></td><td style="padding:6px;border-bottom:1px solid #EFE9E2;vertical-align:top;font-size:10px;line-height:1.5;background:#FBF8F4">${sp.map(esc).join('<br>') || '—'}</td><td style="padding:6px;border-bottom:1px solid #EFE9E2;vertical-align:top">${esc(mc.join(', ') || '—')}</td><td style="padding:6px;border-bottom:1px solid #EFE9E2;vertical-align:top">${esc(unidade(i.v))}</td><td style="padding:6px;border-bottom:1px solid #EFE9E2;vertical-align:top;text-align:right"><b>${i.quantidade}</b></td></tr>`; }).join('')}</table>
      <p style="line-height:1.6;margin-top:12px"><b>Solicitamos</b> o envio do orçamento, <b>respeitando as especificações de cada item</b>, até <b>${esc(prazo || '—')}</b>, informando a marca de cada item, a validade, o prazo de entrega e a forma de pagamento.</p>
      <div style="border:1px solid #F07830;border-radius:6px;padding:8px 10px;line-height:1.5"><b>Observação obrigatória na nota fiscal:</b><br>“TERMO DE COLABORAÇÃO Nº 13/2017 – FONTE DE RECURSO MUNICIPAL – PREFEITURA DO MUNICÍPIO DE CARAPICUÍBA”<br><span style="color:#8A8078">Enviar a nota fiscal com o arquivo XML.</span></div>
      <p style="color:#8A8078;font-size:10px;margin-top:10px">Contato: ${esc(eu.nome)} · Compras · (11) 4183-6018 · coordenacao@kolping-sp.org.br</p></div>
      <div style="border-top:1px solid #CFC8C0;margin:0 24px;padding:6px 0 10px;text-align:right;font-size:8.5px;color:#6E6E6E;line-height:1.5">R. Rio Branco, 36 – Cohab II – Carapicuíba-SP · CEP 06326-030<br>Fone: (11) 4183-6018 / 4183-2194 · Facebook: Kolping Estadual SP<br>E-mail: oke-sp@kolping.org.br · www.kolping-sp.org.br</div></div>`);
    if (confirm('Abrir também o e-mail para o fornecedor? (salve o PDF e anexe)')) window.KESP_EMAIL('', `Solicitação de orçamento ${num} – Kolping Estadual de São Paulo`, `Prezados,\n\nSegue em anexo a solicitação de orçamento ${num}, de produtos de limpeza para entrega na ${u.nome}.\n\nPedimos que o orçamento respeite as especificações de cada item e seja enviado até ${prazo}, com marca, validade, prazo de entrega e forma de pagamento.\n\nAtenciosamente,`);
  }
  function cCatalogo() {
    const c = document.getElementById('cCont');
    c.innerHTML = `<div style="display:flex;gap:8px;margin-bottom:8px"><input class="in" id="kBus" placeholder="Buscar por nome, especificação ou marca" style="flex:1"><button class="btn" id="kNovo">Novo produto</button></div><p class="sm">${P.filter(p => p.ativo).length} produtos ativos · ${V.length} itens de pedido</p>
      <div id="kLst">${P.map(p => { const vs = V.filter(v => v.produto_id === p.id); return `<div class="pe" style="--c:${p.ativo ? '#22C984' : '#6E6A7C'};cursor:pointer" data-k="${p.id}" data-n="${esc((p.nome + ' ' + p.marcas.join(' ') + ' ' + JSON.stringify(p.especificacao) + vs.map(v => v.nome + JSON.stringify(v.especificacao)).join(' ')).toLowerCase())}"><div style="flex:1;min-width:0"><b style="font-size:13px">${esc(p.nome)}</b>${p.ativo ? '' : ' <span class="tg2" style="background:rgba(255,255,255,.08);color:#A8A3B4">Inativo</span>'}<div class="sm">Pedido por ${esc(p.unidade_pedido)}${vs.filter(v => v.nome).length ? ' · ' + vs.filter(v => v.nome).length + ' variações' : ''}${p.marcas.length ? ' · ' + esc(p.marcas.join(', ')) : ''}</div></div><span style="color:#6E6A7C">›</span></div>`; }).join('')}</div>`;
    c.querySelector('#kBus').oninput = e => c.querySelectorAll('[data-n]').forEach(d => (d.style.display = d.dataset.n.includes(e.target.value.toLowerCase()) ? '' : 'none'));
    c.querySelectorAll('[data-k]').forEach(d => d.onclick = () => editarProduto(P.find(p => p.id === d.dataset.k)));
    c.querySelector('#kNovo').onclick = () => editarProduto(null);
  }
  function editarProduto(p) {
    const vs = p ? V.filter(v => v.produto_id === p.id).map(v => ({ ...v, especificacao: [...v.especificacao] })) : [{ nome: null, especificacao: [] }];
    const st = { nome: p ? p.nome : '', un: p ? p.unidade_pedido : 'unidade', marcas: p ? p.marcas.join(', ') : '', spec: p ? [...p.especificacao] : [], ativo: p ? p.ativo : true, vs };
    const dlg = document.createElement('div'); dlg.className = 'conf';
    const specHtml = (arr, k) => arr.map((e, i) => `<div class="dois" style="grid-template-columns:1fr 2fr auto;gap:6px;margin-top:4px"><input data-sc="${k}:${i}" value="${esc(e.campo || '')}" placeholder="Campo (ex.: espessura)"><input data-sv="${k}:${i}" value="${esc(e.valor || '')}" placeholder="Valor"><a class="lk" data-sd="${k}:${i}">✕</a></div>`).join('') + `<a class="lk" data-sa="${k}" style="font-size:12px">+ campo de especificação</a>`;
    const ler = () => { const g = s => dlg.querySelector(s); st.nome = g('#eN').value.trim(); st.un = g('#eU').value.trim() || 'unidade'; st.marcas = g('#eM').value; st.ativo = g('#eA').checked;
      dlg.querySelectorAll('[data-sc]').forEach(x => { const [k, i] = x.dataset.sc.split(':'), arr = k === 'p' ? st.spec : st.vs[+k].especificacao; arr[+i] = { campo: x.value.trim(), valor: dlg.querySelector(`[data-sv="${k}:${i}"]`).value.trim() }; });
      dlg.querySelectorAll('[data-vn]').forEach(x => (st.vs[+x.dataset.vn].nome = x.value.trim() || null)); };
    const desenhar = () => {
      dlg.innerHTML = `<div class="cx fm" style="max-width:640px;max-height:92vh;overflow-y:auto"><b>${p ? 'Editar produto' : 'Novo produto'} · Limpeza</b>
        <label>Nome no padrão (tipo · característica · tamanho)</label><input id="eN" value="${esc(st.nome)}">
        <div class="dois"><div><label>Unidade de pedido</label><input id="eU" value="${esc(st.un)}" list="unl"><datalist id="unl">${['unidade', 'pacote', 'caixa', 'fardo', 'frasco', 'galão', 'litro', 'rolo', 'bobina', 'metro'].map(x => `<option value="${x}">`).join('')}</datalist></div><div><label>Marcas de preferência (separe por vírgula)</label><input id="eM" value="${esc(st.marcas)}"></div></div>
        <label>Especificação comum</label>${specHtml(st.spec, 'p')}
        <label style="margin-top:12px">Variações ${st.vs.length === 1 && !st.vs[0].nome ? '(este produto não tem variações)' : ''}</label>
        ${st.vs.map((v, k) => `<div class="cd" style="--c:#3B82F6;margin-top:6px"><input data-vn="${k}" value="${esc(v.nome || '')}" placeholder="${st.vs.length === 1 ? 'Sem variação (deixe em branco)' : 'Nome da variação (ex.: 100 L preto)'}">${specHtml(v.especificacao, k)}</div>`).join('')}
        <a class="lk" id="eVar" style="font-size:12px;display:inline-block;margin-top:6px">+ variação</a>
        <label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="eA" style="width:auto"${st.ativo ? ' checked' : ''}> Produto ativo (aparece nos pedidos)</label>
        <div style="display:flex;gap:8px;margin-top:14px"><button class="btn sec" style="flex:1" data-x>Cancelar</button><button class="btn" style="flex:1" data-ok>Salvar</button></div></div>`;
      dlg.querySelectorAll('[data-sa]').forEach(a => a.onclick = () => { ler(); const k = a.dataset.sa; (k === 'p' ? st.spec : st.vs[+k].especificacao).push({ campo: '', valor: '' }); desenhar(); });
      dlg.querySelectorAll('[data-sd]').forEach(a => a.onclick = () => { ler(); const [k, i] = a.dataset.sd.split(':'); (k === 'p' ? st.spec : st.vs[+k].especificacao).splice(+i, 1); desenhar(); });
      dlg.querySelector('#eVar').onclick = () => { ler(); st.vs.push({ nome: '', especificacao: [] }); desenhar(); };
      dlg.querySelector('[data-x]').onclick = () => dlg.remove();
      dlg.querySelector('[data-ok]').onclick = async () => { ler(); if (!st.nome) { alert('Informe o nome.'); return; }
        const reg = { area: 'limpeza', nome: st.nome, unidade_pedido: st.un, marcas: st.marcas.split(',').map(x => x.trim()).filter(Boolean), especificacao: st.spec.filter(e => e.valor), ativo: st.ativo };
        let pid = p && p.id;
        if (p) { const r = await sb.from('produtos').update(reg).eq('id', p.id); if (r.error) { alert('Não foi possível salvar: ' + r.error.message); return; } }
        else { const r = await sb.from('produtos').insert(reg).select().single(); if (r.error) { alert('Não foi possível salvar: ' + r.error.message); return; } pid = r.data.id; }
        for (const [k, v] of st.vs.entries()) { const rv = { produto_id: pid, nome: v.nome, especificacao: v.especificacao.filter(e => e.valor), ordem: k };
          if (v.id) await sb.from('produto_variacoes').update(rv).eq('id', v.id); else await sb.from('produto_variacoes').insert(rv); }
        dlg.remove(); await base(); cCatalogo(); };
    };
    document.body.appendChild(dlg); desenhar();
  }
  function cEstoque() {
    const c = document.getElementById('cCont'), it = lista();
    c.innerHTML = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="color:#A8A3B4;font-size:11px"><td style="padding:6px">Item</td>${U.map(u => `<td style="padding:6px;text-align:right">${esc(u.nome.replace('Sede (Kolping Estadual de São Paulo)', 'Sede'))}<br><span style="font-size:10px">estoque · consumo/mês</span></td>`).join('')}</tr>
      ${it.map(v => `<tr style="border-top:1px solid rgba(255,255,255,.06)"><td style="padding:6px">${esc(nomeItem(v))}</td>${U.map(u => { const e = estoque(u.id, v.id), cm = consumoMedio(u.id, v.id), mi = minimo(u.id, v.id), baixo = e !== null && mi && e < mi; return `<td style="padding:6px;text-align:right;white-space:nowrap;${baixo ? 'color:#FF9A9D;font-weight:600' : ''}">${e ?? '—'} · ${cm ?? '—'}</td>`; }).join('')}</tr>`).join('')}</table></div>
      <p class="sm">Estoque = última contagem + o que chegou depois. Consumo = média dos últimos 3 meses. Em vermelho: abaixo do mínimo.</p>`;
  }
  window.KESP_PEDIDOS = { abrir: pedidos };
  window.KESP_COMPRAS = { abrir: compras };
})();

// ===================== Mapa interativo =====================
(function () {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COR_SIT = { em_dia: '#22C984', parcial: '#F5A524', atraso: '#E5484D', inativa: '#6E6A7C' };
  const NOME_SIT = { em_dia: 'em dia', parcial: 'pendência parcial', atraso: 'em atraso', inativa: 'inativa' };
  let sb, eu, B, map, cluster, marcas = {}, filtroD = '', filtroS = '', fBusca = '', U = [];
  const css = h => new Promise(ok => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = h; l.onload = ok; l.onerror = ok; document.head.appendChild(l); });
  const js = h => new Promise((ok, er) => { const s = document.createElement('script'); s.src = h; s.onload = ok; s.onerror = er; document.head.appendChild(s); });
  async function libs() {
    if (window.L && L.markerClusterGroup) return;
    await css('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css');
    await css('https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.min.css');
    if (!window.L) await js('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js');
    await js('https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.min.js');
  }
  const K = '<rect x="-7" y="-8" width="5" height="16" fill="#1E1B19"/><path d="M-2 -8 L8 -8 L8 8 L-2 8Z" fill="#F07830"/><path d="M8 -8 L8 8 L-1 0Z" fill="#1E1B19"/>';
  const pinSvg = (borda, anel, unid) => `<svg width="52" height="62" viewBox="-26 -38 52 62">${anel ? `<circle r="23" cy="-12" fill="none" stroke="${anel}" stroke-width="3.5"/>` : ''}<path d="M0 22 C-5 12,-17 5,-17 -12 A17 17 0 1 1 17 -12 C17 5,5 12,0 22Z" fill="#fff" stroke="${borda}" stroke-width="4.5" stroke-linejoin="round"/><g transform="translate(0,-12)">${K}</g>${unid ? '<g transform="translate(12,-27)"><circle r="7" fill="#F07830"/><text y="3.5" text-anchor="middle" font-size="9" fill="#fff">★</text></g>' : ''}</svg>`;
  const icone = (borda, anel, unid) => L.divIcon({ className: 'kpin', html: pinSvg(borda, anel, unid), iconSize: [52, 62], iconAnchor: [26, 60] });
  const endCk = ck => [ck.logradouro && (ck.logradouro + (ck.numero ? ', ' + ck.numero : '')), ck.bairro, ck.cidade, ck.uf || 'SP', ck.cep, 'Brasil'].filter(Boolean).join(', ');
  const dist = (a, b) => { const R = 6371, r = x => x * Math.PI / 180, dLa = r(b[0] - a[0]), dLo = r(b[1] - a[1]); const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };

  async function geocodificar(lista, tabela) {
    let n = 0;
    for (const x of lista) {
      const end = tabela === 'unidades' ? [x.logradouro && (x.logradouro + (x.numero ? ', ' + x.numero : '')), x.bairro, x.cidade, 'SP', x.cep, 'Brasil'].filter(Boolean).join(', ') : endCk(x);
      if (!x.cidade || (x.lat && x.geo_endereco === end) || (x.geo_manual && x.geo_endereco === end)) continue;
      try {
        await new Promise(r => setTimeout(r, 1100));
        let j = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=' + encodeURIComponent(end))).json();
        if (!j.length) j = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=' + encodeURIComponent([x.bairro, x.cidade, 'SP', 'Brasil'].filter(Boolean).join(', ')))).json();
        if (j.length) { x.lat = +j[0].lat; x.lng = +j[0].lon; x.geo_endereco = end; if (tabela === 'comunidades') x.geo_manual = false; await sb.from(tabela).update(tabela === 'comunidades' ? { lat: x.lat, lng: x.lng, geo_endereco: end, geo_manual: false } : { lat: x.lat, lng: x.lng, geo_endereco: end }).eq('id', x.id); n++; }
      } catch (_) {}
    }
    return n;
  }

  function filtrar(l) { return l.filter(({ ck, e }) => (!filtroD || ck.distrito_id === filtroD) && (!filtroS || (filtroS === 'semvisita' ? semVisita(ck) : e.situacao === filtroS)) && (!fBusca || (ck.nome + ' ' + (ck.cidade || '')).toLowerCase().includes(fBusca))); }
  function semVisita(ck) { const v = (B.dados().vis || []).find(x => x.comunidade_id === ck.id); return !v || (Date.now() - new Date(v.data + 'T12:00')) / 864e5 > 180; }
  function linhas() { const D = B.dados(), ANO = new Date().getFullYear(); return D.cks.map(ck => ({ ck, e: B.extrato(ck, ANO), d: B.dist(ck.distrito_id) })); }

  function desenhar() {
    const L0 = filtrar(linhas()), com = L0.filter(x => x.ck.lat), sem = L0.filter(x => !x.ck.lat);
    cluster.clearLayers(); marcas = {};
    com.forEach(({ ck, e, d }) => { const m = L.marker([+ck.lat, +ck.lng], { icon: icone(d ? d.cor : '#6E6A7C', COR_SIT[e.situacao], false), title: ck.nome }); m.on('click', () => cartao(ck, e, d, m)); cluster.addLayer(m); marcas[ck.id] = m; });
    U.filter(u => u.lat).forEach(u => cluster.addLayer(L.marker([+u.lat, +u.lng], { icon: icone('#F07830', null, true), title: u.nome, zIndexOffset: 1000 }).on('click', () => cartaoU(u))));
    document.getElementById('mL').innerHTML = `<div style="padding:10px"><input id="mB" placeholder="Buscar CK ou cidade" value="${esc(fBusca)}" style="width:100%;box-sizing:border-box;padding:7px 9px;border-radius:9px;border:1px solid rgba(255,255,255,.14);background:rgba(8,12,20,.7);color:#F2EEEA;font-size:12px"><div class="sm" style="margin-top:6px">${com.length} no mapa${sem.length ? ` · <b style="color:#F8C46A">${sem.length} sem localização</b>` : ''}</div></div>
      <div style="overflow:auto">${com.sort((a, b) => a.ck.nome.localeCompare(b.ck.nome, 'pt-BR')).map(({ ck, e, d }) => `<div class="it" data-m="${ck.id}"><span style="width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid ${d ? esc(d.cor) : '#6E6A7C'};box-shadow:0 0 0 2px ${COR_SIT[e.situacao]};flex-shrink:0"></span><span style="flex:1">${esc(ck.nome)}</span></div>`).join('')}
      ${sem.length ? `<div class="sm" style="padding:10px;border-top:1px solid rgba(255,255,255,.06)">Sem localização (complete o endereço no cadastro):${sem.map(({ ck }) => `<div class="it" style="padding:6px 0;border:0" onclick="location.hash='#ck/${ck.id}'">${esc(ck.nome)}</div>`).join('')}</div>` : ''}</div>`;
    const mb = document.getElementById('mB'); mb.oninput = () => { fBusca = mb.value.toLowerCase(); clearTimeout(desenhar.t); desenhar.t = setTimeout(() => { desenhar(); const n = document.getElementById('mB'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
    document.querySelectorAll('[data-m]').forEach(x => x.onclick = () => { const m = marcas[x.dataset.m]; if (!m) return; cluster.zoomToShowLayer(m, () => m.fire('click')); });
  }

  function cartao(ck, e, d, m) {
    const R = B.R, sede = U.find(u => u.principal && u.lat), tel = String(ck.telefone || '').replace(/\D/g, ''), v = (B.dados().vis || []).find(x => x.comunidade_id === ck.id);
    const el = document.getElementById('mC'); el.style.display = 'block'; el.style.setProperty('--c', COR_SIT[e.situacao]);
    el.innerHTML = `<div style="display:flex;justify-content:space-between;gap:8px"><div class="sm">${d ? '● Distrito ' + esc(d.nome) : 'Sem distrito'} · ${esc(ck.cidade || '')}</div><a style="cursor:pointer" id="mCx">✕</a></div><b>${esc(ck.nome)}</b>
      <div class="sm" style="margin-top:4px">${e.r ? e.r.efetivos + e.r.cooperadores + ' associados · ' : ''}<span style="color:${COR_SIT[e.situacao]}">${NOME_SIT[e.situacao]}${e.aberto ? ' · ' + R(e.aberto) : ''}</span></div>
      <div class="sm">Última visita: ${v ? new Date(v.data + 'T12:00').toLocaleDateString('pt-BR') : 'nenhuma'}${sede ? ' · ' + dist([+sede.lat, +sede.lng], [+ck.lat, +ck.lng]).toFixed(1).replace('.', ',') + ' km da Sede' : ''}</div>
      <a class="bt" href="#ck/${ck.id}">Abrir perfil</a>${tel ? `<a class="bt" href="https://wa.me/55${tel}" target="_blank" rel="noopener">WhatsApp</a>` : ''}<a class="bt" href="https://www.google.com/maps/dir/?api=1&destination=${ck.lat},${ck.lng}" target="_blank" rel="noopener">Rota</a><a class="bt" id="mVis">Registrar visita</a>${eu.admin || window.KESP_PODE('comunidades.editar') ? '<a class="bt" id="mAj">Ajustar posição</a>' : ''}`;
    document.getElementById('mCx').onclick = () => (el.style.display = 'none');
    document.getElementById('mVis').onclick = () => { try { sessionStorage.setItem('kesp.ck.aba', 'vis'); } catch (_) {} location.hash = '#ck/' + ck.id; };
    const aj = document.getElementById('mAj'); if (aj) aj.onclick = () => {
      cluster.removeLayer(m); const dm = L.marker(m.getLatLng(), { icon: m.options.icon, draggable: true }).addTo(map); map.setView(m.getLatLng(), Math.max(map.getZoom(), 16));
      window.KESP_TOAST('Arraste o alfinete até o lugar certo e solte.');
      dm.on('dragend', async () => { const p = dm.getLatLng(); const r = await sb.from('comunidades').update({ lat: p.lat, lng: p.lng, geo_manual: true }).eq('id', ck.id); map.removeLayer(dm); if (!r.error) { ck.lat = p.lat; ck.lng = p.lng; window.KESP_TOAST('Posição salva.'); } desenhar(); });
    };
  }
  function cartaoU(u) { const el = document.getElementById('mC'); el.style.display = 'block'; el.style.setProperty('--c', '#F07830'); el.innerHTML = `<div style="display:flex;justify-content:space-between"><div class="sm">Unidade Kolping</div><a style="cursor:pointer" onclick="this.closest('.mcard').style.display='none'">✕</a></div><b>${esc(u.nome)}</b><div class="sm">${esc([u.logradouro, u.numero, u.bairro, u.cidade].filter(Boolean).join(', '))}</div><a class="bt" href="https://www.google.com/maps/dir/?api=1&destination=${u.lat},${u.lng}" target="_blank" rel="noopener">Rota</a>`; }

  async function abrir(cliente, perfil) {
    sb = cliente; eu = perfil; B = window.KESP_CKS.base; const pg = document.getElementById('pg');
    pg.innerHTML = '<p class="sm">Carregando o mapa…</p>';
    try { await libs(); } catch (_) { pg.innerHTML = '<p class="sm">Não foi possível carregar o mapa. Verifique a internet.</p>'; return; }
    await B.carregar(sb, eu); U = (await sb.from('unidades').select('*').order('ordem')).data || [];
    const D = B.dados();
    pg.innerHTML = `<h1>Mapa das Comunidades</h1><p class="sub">Estado de São Paulo · localização pelo endereço cadastrado</p>
      <div class="mapa-box" id="mBox"><div id="mapa"></div>
        <div class="mtopo"><div class="mvidro" style="display:flex;padding:3px;overflow-x:auto;max-width:100%"><span class="mch ${!filtroD ? 'on' : ''}" data-d="">Todos</span>${D.dist.map(d => `<span class="mch ${filtroD === d.id ? 'on' : ''}" data-d="${d.id}"><span style="color:${esc(d.cor)}">●</span> ${esc(d.nome)}</span>`).join('')}</div>
          <div class="mvidro" style="display:flex;padding:3px">${[['', 'Todas'], ['atraso', 'Em atraso'], ['parcial', 'Parcial'], ['semvisita', 'Sem visita 180+']].map(([k, n]) => `<span class="mch ${filtroS === k ? 'on' : ''}" data-s="${k}">${n}</span>`).join('')}</div></div>
        <div class="mlista mvidro" id="mL"></div>
        <div class="mctl"><a class="mvidro" id="mZi">+</a><a class="mvidro" id="mZo">−</a><a class="mvidro" id="mTd" title="Ver todas">⤢</a><a class="mvidro" id="mEu" title="Minha localização">◎</a><a class="mvidro" id="mCa" title="Camadas">▤</a><a class="mvidro" id="mFs" title="Tela cheia">⛶</a></div>
        <div class="mcard mvidro" id="mC" style="display:none"></div></div>`;
    map = L.map('mapa', { zoomControl: false, minZoom: 6, maxBoundsViscosity: .8, attributionControl: true });
    const escuro = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap · © CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri', maxZoom: 19 });
    const geo = await (await fetch('sp-contorno.json')).json();
    const contorno = L.geoJSON(geo, { style: { color: '#F07830', weight: 2.5, fill: false } }).addTo(map);
    const mundo = [[-90, -180], [-90, 180], [90, 180], [90, -180]], buracos = geo.coordinates.map(p => p[0].map(c => [c[1], c[0]]));
    L.polygon([mundo, ...buracos], { stroke: false, fillColor: '#05080E', fillOpacity: .78, interactive: false }).addTo(map);
    const lim = contorno.getBounds(); map.fitBounds(lim, { padding: [20, 20] }); map.setMaxBounds(lim.pad(.25));
    cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45, iconCreateFunction: c => L.divIcon({ className: 'kclu', html: `<div>${c.getChildCount()}</div>`, iconSize: [40, 40] }) }).addTo(map);
    document.querySelectorAll('[data-d]').forEach(x => x.onclick = () => { filtroD = x.dataset.d; document.querySelectorAll('[data-d]').forEach(y => y.classList.toggle('on', y === x)); desenhar(); });
    document.querySelectorAll('[data-s]').forEach(x => x.onclick = () => { filtroS = x.dataset.s; document.querySelectorAll('[data-s]').forEach(y => y.classList.toggle('on', y === x)); desenhar(); });
    document.getElementById('mZi').onclick = () => map.zoomIn(); document.getElementById('mZo').onclick = () => map.zoomOut();
    document.getElementById('mTd').onclick = () => { const b = cluster.getBounds(); b.isValid() ? map.fitBounds(b, { padding: [40, 40] }) : map.fitBounds(lim); };
    document.getElementById('mEu').onclick = () => navigator.geolocation && navigator.geolocation.getCurrentPosition(p => { L.circleMarker([p.coords.latitude, p.coords.longitude], { radius: 8, color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: .8 }).addTo(map); map.setView([p.coords.latitude, p.coords.longitude], 13); }, () => window.KESP_TOAST('Não foi possível obter sua localização.'));
    let satOn = false; document.getElementById('mCa').onclick = () => { satOn = !satOn; if (satOn) { map.removeLayer(escuro); sat.addTo(map); } else { map.removeLayer(sat); escuro.addTo(map); } };
    document.getElementById('mFs').onclick = () => { const b = document.getElementById('mBox'); document.fullscreenElement ? document.exitFullscreen() : b.requestFullscreen && b.requestFullscreen(); setTimeout(() => map.invalidateSize(), 300); };
    desenhar();
    // localiza pelo endereço o que estiver faltando ou desatualizado
    const pend = D.cks.filter(ck => ck.cidade && !(ck.lat && ck.geo_endereco === endCk(ck))).length + U.filter(u => u.cidade && !u.lat).length;
    if (pend && (eu.admin || window.KESP_PODE('comunidades.editar'))) { window.KESP_TOAST(`Localizando ${pend} endereço(s)… isso leva cerca de ${Math.ceil(pend * 1.2)} segundos.`);
      const n = await geocodificar(D.cks, 'comunidades') + await geocodificar(U, 'unidades'); if (n) { desenhar(); window.KESP_TOAST(n + ' localização(ões) atualizada(s).'); } }
  }
  window.KESP_MAPA = { abrir };
})();

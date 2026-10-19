// Ficha V20 (regras da mesa, 1999) + carteirinha. 100% no navegador: sem servidor.
const $ = s => document.querySelector(s);
const slug = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const NOMES = ['Primário', 'Secundário', 'Terciário'];
const PTS = { atr: [6, 4, 3], hab: [11, 7, 4] };
const KEY = 'yasogami-ficha-v1';

// ---------- Helpers de HTML ----------
const dots = (name, max = 5, min = 0, cap = max, lock = 0) => `<span class="dots" data-name="${name}" data-max="${max}" data-min="${min}" data-cap="${cap}" data-lock="${lock}"></span>`;
const campo = (rot, name, extra = '') => `<label class="campo">${rot}: <input type="text" name="${name}" ${extra}></label>`;
const linha = (rot, name, max, min, cap) => `<div class="linha"><span class="nome">${rot}</span>${dots(name, max, min, cap)}</div>`;
const veto = rot => `<div class="linha veto"><span class="nome">${rot}</span><b>VETADO</b></div>`;
const livre = (pref, max = 5, cap = max) => `<div class="linha"><input type="text" name="${pref}_nome" placeholder="(outro)">${dots(pref + '_nivel', max, 0, cap)}</div>`;
const col = (t, h) => `<div><h3>${t}</h3>${h}</div>`;
const cat = (pool, titulo, idx, itens) => `<div class="cat" data-pool="${pool}"><h3>${titulo}</h3><div class="prio">${pool === 'virt' ? '5 pontos extras ' : `<select name="prio_${pool}_${slug(titulo)}">${NOMES.map((n, i) => `<option value="${i}" ${i === idx ? 'selected' : ''}>${n} (${PTS[pool][i]})</option>`).join('')}</select>`} <span class="resta"></span></div>${itens}</div>`;
const boxes = (name, q) => `<span class="boxes">${Array.from({ length: q }, (_, i) => `<input type="checkbox" name="${name}_${i}">`).join('')}</span>`;
const opts = l => l.map(o => `<option>${o}</option>`).join('');
// Calculadora de Qualidades/Defeitos: campos sem "name", servem só de entrada.
const calc = (cls, rot, ph) => `<div class="calc"><h3>${rot}</h3><div class="linha"><input type="text" id="${cls}-nome" placeholder="${ph}"><input type="number" id="${cls}-pts" min="0" max="7" value="0"><input type="button" class="add no-img" data-cls="${cls}" value="Adicionar"></div></div>`;

// ---------- Dados ----------
const ATR = { 'Físico': ['Força', 'Destreza', 'Vigor'], 'Social': ['Carisma', 'Manipulação', 'Aparência'], 'Mental': ['Percepção', 'Inteligência', 'Raciocínio'] };
const HAB = {
  'Talentos': ['Prontidão', 'Esportes', 'Acuidade', 'Briga', 'Empatia', 'Expressão', 'Intimidação', 'Liderança', 'Manha', 'Lábia'],
  'Perícias': ['Emp. c/ Animais', 'Ofícios', 'Condução', 'Etiqueta', 'Armas de Fogo', 'Roubo', 'Armas Brancas', 'Performance', 'Furtividade', 'Sobrevivência'],
  'Conhecimentos': ['Acadêmicos', 'Computação', 'Finanças', 'Investigação', 'Direito', 'Medicina', 'Ocultismo', 'Política', 'Ciências', 'Tecnologia']
};
const VIT = [['Escoriado', ''], ['Machucado', '-1'], ['Ferido', '-1'], ['Ferido Gravemente', '-2'], ['Espancado', '-2'], ['Aleijado', '-5'], ['Incapacitado', '']];
const SIGNOS = ['', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
const SANGUE = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const habItem = i => i === 'Armas de Fogo' ? veto(i) : linha(i, slug(i), 5, i === 'Tecnologia' ? 1 : 0, 3);

// ---------- Página 1: Ficha ----------
$('#p1').innerHTML = `
<div class="tit">★ YASOGAMI HIGH SCHOOL ★ FICHA DE MATRÍCULA ★ 1999 ★</div>
<h2>:: Dados do Aluno ::</h2>
<div class="grid g3">
  ${campo('Nome', 'nome')}${campo('Natureza', 'natureza')}${campo('Clã', 'cla', 'value="Caitiff" readonly class="trava"')}
  ${campo('Jogador', 'jogador')}${campo('Comportamento', 'comportamento')}${campo('Geração', 'geracao')}
  ${campo('Crônica', 'cronica')}${campo('Conceito', 'conceito')}${campo('Senhor', 'senhor', 'placeholder="(desconhecido)"')}
</div>
<p class="nota">Todos são Caitiff, abraçados ontem. Teto de 3 em atributos e habilidades na criação.</p>

<h2>:: Atributos ::</h2>
<div class="grid g3">${Object.entries(ATR).map(([t, l], k) => cat('atr', t, k, l.map(i => linha(i, slug(i), 5, 1, 3)).join(''))).join('')}</div>
<p class="nota">Escolha uma prioridade diferente para cada grupo: 6 / 4 / 3 pontos (além do 1 inicial).</p>

<h2>:: Habilidades ::</h2>
<div class="grid g3">${Object.entries(HAB).map(([t, l], k) => cat('hab', t, k, l.map(habItem).join('') + livre('hab_' + slug(t), 5, 3))).join('')}</div>
<p class="nota">Prioridades: 11 / 7 / 4 pontos. Armas de Fogo vetadas. Tecnologia já começa com 1 ponto grátis.</p>

<h2>:: Vantagens ::</h2>
<div class="grid g3">
  ${col('Disciplinas', `<div class="caixa"><div class="vazio">Poderes vampíricos e seus níveis. Nenhum na criação: serão aprendidos em mesa.</div><textarea name="disciplinas" rows="6"></textarea></div>`)}
  ${col('Antecedentes', `<div class="caixa"><div class="vazio">Aliados, contatos, recursos etc. Vetados na criação (sem Senhor, rede cainita ou linhagem). Preencher durante a campanha.</div><textarea name="antecedentes" rows="6"></textarea></div>`)}
  <div class="cat" data-pool="virt"><h3>Virtudes</h3><div class="prio">5 pontos extras <span class="resta"></span></div>
    ${linha('Consciência/Convicção', 'virt_consciencia', 5, 1, 5)}${linha('Autocontrole/Instinto', 'virt_autocontrole', 5, 1, 5)}${linha('Coragem', 'virt_coragem', 5, 1, 5)}</div>
</div>

<h2>:: Qualidades e Defeitos ::</h2>
<div class="grid g2">
  ${calc('qua', 'Qualidade (custo)', 'Nome da qualidade')}
  ${calc('def', 'Defeito (bônus)', 'Nome do defeito')}
</div>
<input type="hidden" name="qua_total" value="0"><input type="hidden" name="def_total" value="0">
<div id="saldo" class="resta"></div>
<div class="centro"><input type="button" id="zerar" class="no-img" value="Zerar pontos"></div>
<p class="nota">Digite, confirme em Adicionar e o item vai para as Notas. As Qualidades não podem custar mais do que os Defeitos dão.</p>

<h2>:: Outros Registros ::</h2>
<div class="grid g3">
  <div class="caixa"><h3>Notas</h3><textarea name="notas" rows="12"></textarea></div>
  <div>
    <h3>Humanidade/Trilha</h3>
    ${campo('Trilha', 'trilha')}
    <div style="text-align:center">${dots('humanidade', 10, 0, 10, 1)}</div>
    <p class="nota">Consciência + Autocontrole + 2 (calculada)</p>
    <h3>Força de Vontade</h3>
    <div style="text-align:center">${dots('forca_vontade', 10, 0, 10, 1)}<br>${boxes('fv_atual', 10)}</div>
    <p class="nota">= Coragem (calculada)</p>
    <h3>Pontos de Sangue</h3>
    <div style="text-align:center">${boxes('sangue_a', 10)}<br>${boxes('sangue_b', 10)}</div>
    ${campo('Sangue por Turno', 'sangue_turno')}
  </div>
  <div class="caixa vit"><h3>Vitalidade</h3>
    ${VIT.map(([r, p], i) => `<label><span>${r}</span><span>${p}</span><input type="checkbox" name="vit_${i}"></label>`).join('')}
    <h3>Fraqueza</h3><textarea name="fraqueza" rows="3"></textarea>
    <h3>Experiência</h3><textarea name="experiencia" rows="3"></textarea>
  </div>
</div>`;

// ---------- Página 2: Carteirinha ----------
$('#p2').innerHTML = `
<div class="gaku">
  <div class="gh"><span class="jp">矢神高校 学生証</span><span class="en">YASOGAMI HIGH SCHOOL<br><small>STUDENT ID CARD</small></span></div>
  <div class="gb">
    <div class="gf">
      <label id="fotobox" for="fotoin">FOTO<br>3x4</label>
      <input type="file" id="fotoin" accept="image/*" hidden><input type="hidden" name="foto">
      <div class="holo">★ HOLO ★</div>
    </div>
    <div class="gd">
      ${campo('Nome', 'cart_nome', 'readonly')}
      ${campo('Turma/Série', 'serie', 'placeholder="2-B"')}
      ${campo('Clube', 'clube')}
      ${campo('Atividade extra', 'atividade_extra', 'placeholder="trabalho meio período"')}
      <div class="g2c">
        <label class="campo">Tipo sanguíneo: <select name="tipo_sanguineo">${opts(SANGUE)}</select></label>
        <label class="campo">Signo: <select name="signo">${opts(SIGNOS)}</select></label>
        <label class="campo">Altura (cm): <input type="text" name="altura" maxlength="6"></label>
        <label class="campo">Peso (kg): <input type="text" name="peso" maxlength="6"></label>
      </div>
      <label class="campo">Nascimento: <input type="date" name="nascimento"></label>
    </div>
  </div>
  <div class="gr"><span class="bar">${Array.from({ length: 90 }, (_, i) => `<i style="width:${[2, 1, 3, 1, 2, 1][i % 6]}px"></i>`).join('')}</span><span>Nº <input readonly name="matricula_no" class="mat"></span><span>VÁLIDO ATÉ 03/2000</span></div>
</div>
<p class="nota no-img">Toque na foto para escolher a imagem do aluno.</p>`;

// ---------- Bolinhas ----------
document.querySelectorAll('.dots').forEach(el => {
  const max = +el.dataset.max, min = +el.dataset.min, cap = +el.dataset.cap, lock = el.dataset.lock === '1';
  const h = document.createElement('input');
  h.type = 'hidden'; h.name = el.dataset.name; h.value = min; h.dataset.min = min; el.after(h);
  const draw = () => { el.innerHTML = Array.from({ length: max }, (_, i) => `<i data-v="${i + 1}" class="${i < h.value ? 'on' : ''} ${i >= cap ? 'lock' : ''}"></i>`).join(''); };
  el._set = v => { h.value = v; draw(); };
  el.addEventListener('click', e => {
    const v = +e.target.dataset.v;
    if (!v || lock || v > cap) return;
    h.value = Math.max(min, v === +h.value ? v - 1 : v); draw(); recalc();
  });
  draw();
});

// ---------- Regras da mesa ----------
const val = n => +document.querySelector(`input[name=${n}]`).value;
function recalc() {
  const erros = [];
  document.querySelectorAll('.cat').forEach(c => {
    const sel = c.querySelector('select'), pool = c.dataset.pool;
    const tot = sel ? PTS[pool][+sel.value] : 5;
    const usados = [...c.querySelectorAll('input[type=hidden]')].reduce((s, h) => s + (+h.value) - (+h.dataset.min), 0);
    const r = c.querySelector('.resta');
    r.textContent = `${usados}/${tot} pts`;
    r.className = 'resta ' + (usados > tot ? 'over' : usados === tot ? 'fin' : '');
    if (usados > tot) erros.push(`Pontos demais em ${c.querySelector('h3').textContent} (${usados}/${tot}).`);
    else if (usados < tot) erros.push(`sobram:${c.querySelector('h3').textContent}`);
  });
  ['atr', 'hab'].forEach(p => {
    const v = [...document.querySelectorAll(`.cat[data-pool="${p}"] select`)].map(s => s.value);
    if (new Set(v).size < 3) erros.push(`Use prioridades diferentes em ${p === 'atr' ? 'Atributos' : 'Habilidades'}.`);
  });
  $('[data-name=humanidade]')._set(Math.min(10, val('virt_consciencia') + val('virt_autocontrole') + 2));
  $('[data-name=forca_vontade]')._set(val('virt_coragem'));
  const q = val('qua_total'), d = val('def_total');
  $('#saldo').textContent = `Qualidades ${q} / Defeitos ${d}`;
  $('#saldo').className = 'resta ' + (q > d ? 'over' : '');
  if (q > d) erros.push('As Qualidades gastam mais do que os Defeitos compensam.');
  $('#avisos').innerHTML = erros.filter(e => !e.startsWith('sobram:')).map(e => `<div>⚠ ${e}</div>`).join('');
  guardar();
  return erros;
}
document.addEventListener('change', recalc);
document.addEventListener('input', recalc);

// ---------- Calculadora de Qualidades e Defeitos ----------
document.querySelectorAll('.add').forEach(b => b.addEventListener('click', () => {
  const c = b.dataset.cls, nome = $('#' + c + '-nome'), pts = $('#' + c + '-pts');
  if (!nome.value.trim() || +pts.value <= 0) return alert('Escreva o nome e uma pontuação maior que 0.');
  const total = $('[name=' + c + '_total]'), notas = $('[name=notas]');
  total.value = +total.value + +pts.value;
  notas.value += (notas.value && !notas.value.endsWith('\n') ? '\n' : '') +
    `${c === 'qua' ? 'Qualidade' : 'Defeito'}: ${nome.value.trim()} (${c === 'qua' ? '-' : '+'}${pts.value} pts)\n`;
  nome.value = ''; pts.value = 0;
  recalc();
}));
$('#zerar').addEventListener('click', () => {
  $('[name=qua_total]').value = 0; $('[name=def_total]').value = 0; recalc();
});

// ---------- Carteirinha ----------
const sync = () => { $('[name=cart_nome]').value = $('[name=nome]').value; };
$('[name=nome]').addEventListener('input', sync);
const mat = 'Y99-' + (Math.floor(Math.random() * 9000) + 1000);
$('[name=matricula_no]').defaultValue = mat; $('[name=matricula_no]').value = mat;
const mostraFoto = f => {
  const ok = f && f.startsWith('data:image/');
  $('#fotobox').style.backgroundImage = ok ? `url("${f}")` : '';
  $('#fotobox').innerHTML = ok ? '' : 'FOTO<br>3x4';
};
const fotoLimpa = () => { $('[name=foto]').value = ''; mostraFoto(''); };
$('#fotoin').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = 240; c.height = 320;
    const x = c.getContext('2d'), r = Math.max(240 / img.width, 320 / img.height);
    x.drawImage(img, (240 - img.width * r) / 2, (320 - img.height * r) / 2, img.width * r, img.height * r);
    const d = c.toDataURL('image/jpeg', .8);
    $('[name=foto]').value = d; mostraFoto(d); guardar();
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(f);
});

// ---------- Abas e modo celular ----------
const mostra = id => {
  document.querySelectorAll('.pag').forEach(p => { p.hidden = p.id !== id; });
  document.querySelectorAll('.abas a').forEach(a => a.classList.toggle('ativa', a.dataset.aba === id));
};
document.querySelectorAll('.abas a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); mostra(a.dataset.aba); }));
mostra('p1');
const mq = matchMedia('(max-width:640px)');
mq.addEventListener('change', () => document.body.classList.toggle('m', mq.matches));

// ---------- Salvar no navegador, exportar e importar ----------
const dados = () => Object.fromEntries(new FormData($('#ficha')));
let tSalvar;
function guardar() {
  clearTimeout(tSalvar);
  tSalvar = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(dados())); } catch {} }, 400);
}
function restaurar(d) {
  document.querySelectorAll('#ficha [name]').forEach(el => {
    if (el.name === 'matricula_no' && !d.matricula_no) return;
    if (el.type === 'checkbox') el.checked = el.name in d;
    else if (el.name in d) el.value = d[el.name];
  });
  document.querySelectorAll('.dots').forEach(el => { const n = el.dataset.name; el._set(n in d ? +d[n] || +el.dataset.min : +el.dataset.min); });
  mostraFoto(d.foto);
  sync();
}
function baixarArquivo(blob, nome) {
  const u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}
$('#btncarregar').addEventListener('click', () => $('#jsonin').click());
$('#jsonin').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || typeof d !== 'object' || Array.isArray(d)) throw 0;
      restaurar(d); recalc(); alert('Ficha carregada!');
    } catch { alert('Esse arquivo não parece ser uma ficha válida.'); }
  };
  r.readAsText(f); e.target.value = '';
});

// ---------- Baixar imagens (sempre no layout de desktop) ----------
async function baixar(pagina, alvo, arq, largura) {
  if (typeof html2canvas === 'undefined') return alert('Não consegui carregar o html2canvas (sem internet?).');
  const nome = slug($('[name=nome]').value) || 'aluno';
  const atual = document.querySelector('.pag:not([hidden])').id;
  mostra(pagina);
  // Captura uma cópia fixada em (0,0) com largura fixa: o resultado não depende da tela do aparelho.
  const orig = $(alvo);
  const copia = orig.cloneNode(true);
  copia.hidden = false; copia.style.margin = '0'; copia.style.width = largura + 'px';
  // O clone perde o valor dos <select>, e o html2canvas desenha mal <textarea>.
  const so = orig.querySelectorAll('select'), sc = copia.querySelectorAll('select');
  so.forEach((s, i) => { sc[i].value = s.value; });
  const to = orig.querySelectorAll('textarea'), tc = copia.querySelectorAll('textarea');
  tc.forEach((t, i) => {
    const d = document.createElement('div');
    d.className = 'ta-img'; d.textContent = to[i].value; d.style.height = to[i].offsetHeight + 'px';
    t.replaceWith(d);
  });
  const palco = document.createElement('div');
  palco.style.cssText = `position:fixed;left:0;top:0;z-index:-1;width:${largura}px`;
  palco.appendChild(copia); document.body.appendChild(palco);
  try {
    const c = await html2canvas(copia, {
      scale: 2, scrollX: 0, scrollY: 0, windowWidth: Math.max(innerWidth, largura + 20),
      backgroundColor: pagina === 'p1' ? '#eceadf' : null,
      ignoreElements: e => e.classList && e.classList.contains('no-img'),
      onclone: doc => doc.body.classList.remove('m')
    });
    const blob = await new Promise(res => c.toBlob(res, 'image/png'));
    baixarArquivo(blob, `${arq}-${nome}.png`);
  } catch (err) { console.error(err); alert('Não foi possível gerar a imagem.'); }
  palco.remove();
  mostra(atual);
}
$('#btnficha').addEventListener('click', () => baixar('p1', '#p1', 'ficha', 736));
$('#btncart').addEventListener('click', () => baixar('p2', '.gaku', 'carteirinha', 620));

// ---------- Reset e conclusão ----------
$('#ficha').addEventListener('reset', e => {
  if (!confirm('Limpar toda a ficha? Isso apaga o que foi preenchido neste aparelho.')) return e.preventDefault();
  setTimeout(() => {
    document.querySelectorAll('.dots').forEach(el => el._set(+el.dataset.min));
    $('[name=qua_total]').value = 0; $('[name=def_total]').value = 0;
    fotoLimpa(); sync(); recalc();
  });
});
$('#ficha').addEventListener('submit', e => {
  e.preventDefault();
  const d = dados();
  if (!d.nome) { mostra('p1'); return alert('Escreva o nome do aluno antes de concluir!'); }
  const erros = recalc();
  if (erros.some(x => !x.startsWith('sobram:'))) { mostra('p1'); return alert('Corrija os avisos em vermelho antes de concluir.'); }
  const sobras = erros.filter(x => x.startsWith('sobram:')).map(x => x.slice(7));
  if (sobras.length && !confirm(`Ainda sobram pontos em: ${sobras.join(', ')}. Concluir assim mesmo?`)) return;
  baixarArquivo(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }), `ficha-${slug(d.nome) || 'aluno'}.json`);
  const ok = $('#ok'); ok.hidden = false;
  ok.textContent = `Matrícula concluída, ${d.nome}! Baixe também as imagens e guarde o arquivo .json para carregar a ficha depois.`;
  ok.scrollIntoView({ behavior: 'smooth' });
});

// ---------- Contador decorativo (só neste aparelho) ----------
let vis = 1337;
try { vis = (+localStorage.getItem('yasogami-visitas') || 1336) + 1; localStorage.setItem('yasogami-visitas', vis); } catch {}
$('#contador').textContent = String(vis).padStart(7, '0');

// ---------- Início: recupera o que foi salvo e recalcula ----------
try { const salvo = JSON.parse(localStorage.getItem(KEY) || 'null'); if (salvo) restaurar(salvo); } catch {}
recalc();
(() => {
  'use strict';

  const canvas = document.querySelector('#game-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const stage = document.querySelector('#stage');
  const app = document.querySelector('#arcade');
  const touch = document.querySelector('#touch-jump');
  const $ = (selector) => document.querySelector(selector);
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const format = (n) => Math.max(0, Math.floor(n)).toLocaleString('en-US');
  const SAVE_KEY = 'neon-rush-save-v1';
  const DEFAULTS = { music: true, sfx: true, particles: true, shake: true, fps: false, difficulty: 'normal' };
  const MODES = { easy: .88, normal: 1, hard: 1.12 };
  const LEVEL_COUNT = 6;
  const DESIGN_H = 540;
  const MIN_VIEW_W = 780;
  const MIN_U = .9;
  const MAX_U = 1.5;

  const SKINS = [
    { id:'core', name:'CORE', tag:'Standard issue', color:'#61f1dc', accent:'#0d2029', style:'solid', unlock:null },
    { id:'ember', name:'EMBER', tag:'Warm signal', color:'#ff8a5c', accent:'#2a120a', style:'stripe', unlock:{ coins:8 } },
    { id:'violet', name:'VIOLET', tag:'First clear', color:'#c08bff', accent:'#1b1030', style:'glass', unlock:{ clear:0 } },
    { id:'frost', name:'FROST', tag:'Cold storage', color:'#a9ecff', accent:'#0b2530', style:'outline', unlock:{ coins:20 } },
    { id:'royale', name:'ROYALE', tag:'Gold plated', color:'#ffc861', accent:'#2b1d05', style:'core', unlock:{ clear:2 } },
    { id:'void', name:'VOID', tag:'Hollow state', color:'#6b8bff', accent:'#05070f', style:'hollow', unlock:{ clear:3 } },
    { id:'chrome', name:'CHROME', tag:'Polished alloy', color:'#c9d6de', accent:'#3d4a52', style:'chrome', unlock:{ coins:40 } },
    { id:'nova', name:'NOVA', tag:'Every route cleared', color:'#ff6ad5', accent:'#2a0b2a', style:'nova', unlock:{ all:true } }
  ];

  const ROUTES = [
    { name:'NEON START', difficulty:'EASY', color:'#61f1dc', gold:'#ffc36a', speed:315, length:5000, spikes:[[500,1],[870,2],[1390,1],[1810,3],[2410,1],[2840,2],[3420,1],[3840,3],[4430,2]], blocks:[[1120,46,54],[2110,48,66],[3230,46,52],[4160,54,64]], movers:[[1580,48,58,27],[3590,44,62,31]], gaps:[[2650,105],[4050,120]], ceilings:[[3020,2]], rotors:[4630], lasers:[[3710,44,1.1]], saws:[1210,4560], orbs:[[1740,86]], pads:[2590], coins:[[420,88],[755,125],[1245,140],[1700,110],[2215,128],[2735,155],[3130,120],[3525,155],[4275,128],[4770,145]], powers:[[1940,'shield'],[3310,'magnet']], portals:[[2470,'speed'],[3890,'size']], checkpoints:[2520],platforms:[] },
    { name:'CYBER DRIVE', difficulty:'NORMAL', color:'#8cb5ff', gold:'#ff82ae', speed:350, length:5400, spikes:[[460,2],[930,1],[1260,3],[1870,2],[2330,1],[2780,3],[3380,2],[3920,1],[4380,3],[4960,2]], blocks:[[720,50,60],[1620,54,74],[2510,48,57],[3650,54,72],[4710,48,61]], movers:[[1050,48,62,34],[3100,48,70,42],[4210,50,58,34]], gaps:[[2040,112],[3480,125],[4600,105]], ceilings:[[1450,2],[3190,3]], rotors:[2180,4110], lasers:[[2920,48,.25],[4830,42,1.4]], saws:[1700,4550], orbs:[[1450,86],[3700,88]], pads:[[1980],[3420],[4480]], coins:[[380,128],[840,160],[1160,115],[1760,145],[2260,190],[2680,140],[3280,175],[3830,115],[4490,175],[5160,140]], powers:[[1530,'double'],[3560,'slow'],[4510,'shield']], portals:[[1180,'slow'],[2610,'gravity'],[3760,'speed'],[4890,'size']], checkpoints:[2700],platforms:[[2050,102,76],[3450,115,82]] },
    { name:'VOID RUN', difficulty:'HARD', color:'#c398ff', gold:'#ff8a78', speed:385, length:5700, spikes:[[420,1],[760,3],[1190,2],[1570,3],[2090,1],[2450,3],[2990,2],[3370,3],[3870,1],[4210,3],[4780,2],[5210,3]], blocks:[[960,48,64],[1840,52,75],[2820,52,72],[3670,48,65],[4590,52,73],[5460,48,61]], movers:[[1320,50,67,39],[2240,52,70,42],[3560,46,65,38],[4920,50,74,44]], gaps:[[1720,105],[3170,120],[4400,115],[5350,110]], ceilings:[[1090,3],[2700,2],[4000,3]], rotors:[1990,3290,5070], lasers:[[1480,48,.2],[3000,48,1.2],[4480,48,2.1]], saws:[1400,3950,5550], orbs:[[2000,90],[4340,92]], pads:[[1580],[3080],[5330]], coins:[[350,150],[900,180],[1390,120],[1920,190],[2360,150],[2910,180],[3470,135],[4080,195],[4700,145],[5500,175]], powers:[[1040,'shield'],[2300,'double'],[3820,'magnet'],[5160,'slow']], portals:[[1160,'speed'],[2570,'gravity'],[3740,'slow'],[4880,'size']], checkpoints:[2850],platforms:[[1690,95,78],[3160,105,82],[4380,100,76]] },
    { name:'EMBER LOOP', difficulty:'HARD', color:'#ff9a5b', gold:'#ffd98a', speed:395, length:6000, spikes:[[320,2],[780,1],[1100,3],[1600,2],[2050,1],[2400,3],[2900,2],[3500,1],[3900,3],[4300,2],[4900,1],[5350,2],[5750,1]], blocks:[[560,52,62],[2200,50,58],[3300,52,68],[4700,50,64]], movers:[[1300,50,62,36],[4150,50,70,42]], gaps:[[1780,115],[3100,120],[5050,120]], ceilings:[[1400,2],[4500,3]], rotors:[2650,5250], lasers:[[980,48,.4],[3650,46,1.1],[5550,48,2]], saws:[1950,3800,5650], orbs:[[1500,86],[2800,78],[4790,80]], pads:[[1690],[2350]], coins:[[260,120],[700,150],[1050,135],[1560,160],[2000,145],[2320,170],[2760,150],[3200,165],[3600,140],[4100,175],[4600,150],[5150,160],[5600,145],[5850,165]], powers:[[1050,'magnet'],[2500,'double'],[4000,'shield'],[5450,'slow']], portals:[[700,'speed'],[2150,'size'],[3450,'gravity'],[5150,'slow']], checkpoints:[2600,4700], platforms:[[1790,105,76],[3110,110,80],[5060,115,78]] },
    { name:'FROST PROTOCOL', difficulty:'HARD', color:'#7fd4ff', gold:'#c9fff0', speed:420, length:6400, spikes:[[300,2],[700,3],[1000,1],[1550,2],[2100,1],[2450,3],[2950,2],[3500,1],[4100,3],[4450,1],[4850,2],[5400,3],[5950,1]], blocks:[[520,52,64],[2300,50,58],[3700,52,66],[5750,50,70]], movers:[[1150,50,64,38],[3900,50,68,40],[6200,48,62,36]], gaps:[[1800,120],[3200,125],[5100,115]], ceilings:[[1300,2],[4650,3]], rotors:[2700,5300], lasers:[[900,48,.5],[5650,48,1.6]], saws:[2000,3600,4350,6100], orbs:[[1500,88],[3020,84],[4550,86]], pads:[[1760],[5060]], coins:[[250,140],[600,165],[950,135],[1500,175],[1900,150],[2350,185],[2900,155],[3350,195],[3800,145],[4200,180],[4700,160],[5250,190],[5800,150],[6250,175]], powers:[[1250,'shield'],[2600,'double'],[4200,'magnet'],[5900,'slow']], portals:[[650,'slow'],[2200,'gravity'],[3800,'speed'],[5550,'size']], checkpoints:[2400,4700], platforms:[[1810,115,78],[3210,120,84],[5110,110,80]] },
    { name:'NULL SECTOR', difficulty:'INSANE', color:'#ff5f8f', gold:'#ffd36e', speed:450, length:6800, spikes:[[300,2],[760,3],[1250,1],[1780,3],[2200,1],[2500,2],[2950,3],[3550,1],[3900,2],[4400,3],[4800,1],[5350,2],[5850,3],[6400,2]], blocks:[[560,52,68],[2750,50,64],[4050,54,72],[5650,50,66]], movers:[[1000,50,66,40],[1950,48,60,38],[4250,52,74,46],[6250,48,62,36]], gaps:[[1560,130],[3200,125],[5150,120]], ceilings:[[1150,3],[3100,2],[5650,3]], rotors:[2050,3650,6100], lasers:[[900,48,.4],[3150,48,1.1],[5950,48,2]], saws:[2350,4650,6300], orbs:[[1980,88],[3320,90],[4600,88]], pads:[[1450],[5100]], coins:[[250,150],[600,180],[1000,140],[1500,190],[1900,155],[2400,200],[2850,165],[3300,205],[3800,150],[4350,185],[4900,160],[5500,200],[6000,165],[6550,190]], powers:[[1350,'shield'],[3050,'double'],[4500,'magnet'],[6150,'slow']], portals:[[700,'speed'],[2450,'gravity'],[3850,'slow'],[4750,'size']], checkpoints:[2400,4450,6100], platforms:[[1570,120,80],[3210,125,84],[5160,115,78]] }
  ];

  class SaveData {
    constructor() {
      try {
        const data = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
        const settings = { ...DEFAULTS, ...(data.settings || {}) };
        if (!MODES[settings.difficulty]) settings.difficulty = 'normal';
        this.data = { settings, unlocked: clamp(+data.unlocked || 1, 1, LEVEL_COUNT), records: data.records || {}, skin: SKINS.some(s => s.id === data.skin) ? data.skin : 'core' };
      } catch (_) { this.data = { settings: { ...DEFAULTS }, unlocked: 1, records: {}, skin: 'core' }; }
    }
    save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.data)); } catch (_) {} }
    record(i) { const r = this.data.records[i] || {}; return { best: +r.best || 0, coins: +r.coins || 0, completed: !!r.completed }; }
    run(i, score, coins, complete) {
      const r = this.record(i);
      this.data.records[i] = { best: Math.max(r.best, Math.floor(score)), coins: Math.max(r.coins, coins), completed: r.completed || complete };
      if (complete) this.data.unlocked = Math.max(this.data.unlocked, Math.min(LEVEL_COUNT, i + 2));
      this.save();
    }
    totalCoins() { return Object.values(this.data.records).reduce((sum, r) => sum + (r ? +r.coins || 0 : 0), 0); }
    completedCount() { return Object.values(this.data.records).filter(r => r && r.completed).length; }
    skinState(skin) {
      const need = skin.unlock;
      if (!need) return { open: true, label: 'ALWAYS AVAILABLE' };
      if (need.coins) { const have = this.totalCoins(); return { open: have >= need.coins, label: `${have} / ${need.coins} COINS` }; }
      if (need.clear !== undefined) { const done = this.completedCount(); return { open: done > need.clear, label: done > need.clear ? 'UNLOCKED' : `CLEAR ROUTE 0${need.clear + 1}` }; }
      if (need.all) { const done = this.completedCount(); return { open: done >= LEVEL_COUNT, label: done >= LEVEL_COUNT ? 'UNLOCKED' : `CLEAR ALL ${LEVEL_COUNT} ROUTES` }; }
      return { open: false, label: 'LOCKED' };
    }
  }

  const save = new SaveData();

  class Sound {
    constructor() { this.context = null; this.timer = 0; this.note = 0; }
    init() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        this.context ||= new AudioContext();
        if (this.context.state === 'suspended') this.context.resume().catch(() => {});
        return this.context;
      } catch (_) { return null; }
    }
    beep(hz, length, wave = 'sine', vol = .05, end = 0) {
      if (!save.data.settings.sfx) return;
      const ac = this.init(); if (!ac) return;
      try {
        const osc = ac.createOscillator(), gain = ac.createGain(), now = ac.currentTime;
        osc.type = wave; osc.frequency.setValueAtTime(hz, now);
        if (end) osc.frequency.exponentialRampToValueAtTime(end, now + length);
        gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(vol, now + .012); gain.gain.exponentialRampToValueAtTime(.0001, now + length);
        osc.connect(gain); gain.connect(ac.destination); osc.start(now); osc.stop(now + length + .02);
      } catch (_) {}
    }
    effect(name) {
      const sounds = { click:[410,.055,'sine',.025,540], jump:[330,.12,'triangle',.06,590], land:[150,.09,'sine',.04,92], coin:[680,.17,'sine',.065,1120], power:[390,.28,'triangle',.065,920], portal:[210,.32,'sawtooth',.03,720], death:[260,.38,'sawtooth',.05,68], complete:[520,.48,'triangle',.06,1040] };
      if (sounds[name]) this.beep(...sounds[name]);
    }
    music() {
      if (!save.data.settings.music || this.timer || !this.init()) return;
      const notes = [110,164.81,220,164.81,130.81,196,261.63,196];
      const play = () => {
        if (!save.data.settings.music) return;
        const ac = this.init(); if (!ac) return;
        try {
          const osc = ac.createOscillator(), gain = ac.createGain(), now = ac.currentTime;
          osc.type = 'triangle'; osc.frequency.value = notes[this.note++ % notes.length];
          gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.012, now + .04); gain.gain.exponentialRampToValueAtTime(.0001, now + .47);
          osc.connect(gain); gain.connect(ac.destination); osc.start(now); osc.stop(now + .5);
        } catch (_) {}
      };
      play(); this.timer = setInterval(play, 520);
    }
    stop() { clearInterval(this.timer); this.timer = 0; }
  }
  const sound = new Sound();

  class ParticleField {
    constructor() { this.items = []; this.unit = 1; }
    burst(x, y, count, color, speed = 150, life = .55, diamond = false) {
      if (!save.data.settings.particles) return;
      const u = this.unit;
      for (let i = 0; i < Math.min(count, 220 - this.items.length); i++) {
        const a = Math.random() * Math.PI * 2, v = speed * (.28 + Math.random() * .72);
        this.items.push({ x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, size:(1.5+Math.random()*4)*u, life:life*(.55+Math.random()*.65), max:life, color, diamond });
      }
    }
    update(dt) {
      for (let i=this.items.length-1;i>=0;i--) {
        const p=this.items[i]; p.life-=dt;
        if(p.life<=0){this.items[i]=this.items[this.items.length-1];this.items.pop();continue;}
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*this.unit*dt;p.vx*=Math.max(0,1-dt*1.15);
      }
    }
    draw(c,camera) {
      for(const p of this.items){c.globalAlpha=clamp(p.life/p.max,0,1);c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=p.size*2;if(p.diamond){c.save();c.translate(p.x-camera,p.y);c.rotate(Math.PI/4);c.fillRect(-p.size/2,-p.size/2,p.size,p.size);c.restore()}else c.fillRect(p.x-camera-p.size/2,p.y-p.size/2,p.size,p.size)}
      c.globalAlpha=1;c.shadowBlur=0;
    }
  }

  class Runner {
    constructor(game){this.game=game;this.reset()}
    reset(){Object.assign(this,{x:0,y:0,vy:0,angle:0,grounded:false,coyote:0,buffer:0,jumps:0,gravity:1,dead:0,squash:0,scale:1})}
    jump(){if(!this.dead)this.buffer=.14}
    update(dt){
      const g=this.game,size=g.playerSize,u=g.u,floor=g.floorY,oldBottom=this.y+size,oldTop=this.y;
      this.x+=g.speed*dt;this.buffer=Math.max(0,this.buffer-dt);this.coyote=this.grounded?.105:Math.max(0,this.coyote-dt);this.grounded=false;
      if(this.buffer>0&&(this.coyote>0||(g.effects.double>0&&this.jumps<2))){const inAir=this.coyote<=0;this.vy=-g.jumpSpeed*this.gravity;this.buffer=0;this.coyote=0;this.jumps++;if(inAir)g.effects.double=0;g.jumps++;sound.effect('jump');g.burst(this.x+size/2,this.y+size,7,g.skinColor(),90,.35)}
      this.vy+=1780*u*(g.effects.slow>0?.88:1)*this.gravity*dt;this.vy=clamp(this.vy,-940*u,940*u);this.y+=this.vy*dt;
      const center=this.x+size/2;let landing=null;
      if(this.gravity>0&&this.vy>=0){if(!g.inGap(center)&&oldBottom<=floor&&this.y+size>=floor)landing=floor;for(const p of g.level.platforms)if(center>=p.x&&center<=p.x+p.w&&oldBottom<=p.y&&this.y+size>=p.y&&(landing===null||p.y<landing))landing=p.y;if(landing!==null){this.y=landing-size;this.vy=0;this.grounded=true}}
      else if(this.gravity<0&&this.vy<=0&&oldTop>=g.ceilingY&&this.y<=g.ceilingY){this.y=g.ceilingY;this.vy=0;this.grounded=true}
      if(this.grounded){if(this.jumps){g.burst(this.x+size/2,this.y+size,5,g.skinColor(),65,.24);g.shake=Math.max(g.shake,.045);sound.effect('land')}this.jumps=0;this.angle=Math.round(this.angle/(Math.PI/2))*(Math.PI/2);this.squash=Math.max(this.squash,.1)}else{this.angle+=dt*(this.vy>=0?4.9:3.3)*this.gravity;this.coyote=Math.max(0,this.coyote-dt)}
      this.squash=Math.max(0,this.squash-dt*.9);if((this.gravity>0&&this.y>g.height+60*u)||(this.gravity<0&&this.y+size<-60*u))g.crash();
      if(Math.random()<dt*18&&!this.dead)g.burst(this.x+size*.16,this.y+size*.72,1,g.skinColor(),26,.34,true);
    }
    draw(c,camera){
      const g=this.game,size=g.playerSize*this.scale,fade=this.dead?Math.max(.03,1-this.dead*1.5):1,skin=g.skin,color=g.skinColor();
      c.save();c.translate(this.x-camera+g.playerSize/2,this.y+g.playerSize/2);c.rotate(this.angle);c.scale(1+this.squash,1-this.squash*.55);c.scale(fade,fade);
      const half=size/2,k=size/34;c.shadowColor=color;c.shadowBlur=(g.effects.shield?24:16)*g.u;
      if(g.effects.shield){
        c.fillStyle='#e9fbf8';c.fillRect(-half,-half,size,size);c.shadowBlur=0;c.strokeStyle='#adfff3bb';c.lineWidth=2*k;
        c.beginPath();c.arc(0,0,half*1.5+Math.sin(g.time*8)*2*g.u,0,Math.PI*2);c.stroke();
        c.fillStyle='#0b2a30';c.fillRect(-half*.3,-half*.3,half*.6,half*.6);c.restore();return;
      }
      const style=skin.style;
      if(style==='hollow'){
        c.fillStyle=skin.accent;c.globalAlpha=.6;c.fillRect(-half,-half,size,size);c.globalAlpha=1;
        c.lineWidth=2.6*k;c.strokeStyle=color;c.strokeRect(-half*1.03,-half*1.03,size*1.06,size*1.06);
        c.shadowBlur=0;c.strokeStyle='#e8f6ffb0';c.lineWidth=1.2*k;c.beginPath();c.moveTo(-half,-half);c.lineTo(half,half);c.moveTo(half,-half);c.lineTo(-half,half);c.stroke();
      }else if(style==='outline'){
        c.fillStyle=skin.accent;c.fillRect(-half,-half,size,size);
        c.lineWidth=3*k;c.strokeStyle=color;c.strokeRect(-half*1.04,-half*1.04,size*1.08,size*1.08);
        c.shadowBlur=0;c.fillStyle=color;c.beginPath();c.arc(0,0,size*.12,0,Math.PI*2);c.fill();
      }else if(style==='glass'){
        c.fillStyle=color;c.globalAlpha=.28;c.fillRect(-half,-half,size,size);c.globalAlpha=1;
        c.lineWidth=2*k;c.strokeRect(-half,-half,size,size);
        c.shadowBlur=0;c.globalAlpha=.75;c.lineWidth=1.4*k;c.strokeRect(-half*1.2,-half*1.2,size*1.4,size*1.4);c.globalAlpha=1;
      }else if(style==='stripe'){
        c.fillStyle=color;c.fillRect(-half,-half,size,size);
        c.save();c.beginPath();c.rect(-half,-half,size,size);c.clip();
        c.fillStyle=skin.accent;c.globalAlpha=.5;
        for(let i=-2;i<3;i++){const o=-half+i*size*.28;c.beginPath();c.moveTo(o,half);c.lineTo(o+size*.14,half);c.lineTo(o+size*.14+size,-half);c.lineTo(o+size,-half);c.closePath();c.fill()}
        c.globalAlpha=1;c.restore();
        c.shadowBlur=0;c.lineWidth=2*k;c.strokeStyle=color;c.strokeRect(-half,-half,size,size);
      }else if(style==='core'){
        const gr=c.createLinearGradient(-half,-half,half,half);gr.addColorStop(0,color);gr.addColorStop(1,skin.accent);
        c.fillStyle=gr;c.fillRect(-half,-half,size,size);
        c.shadowBlur=0;c.lineWidth=2*k;c.strokeStyle=color;c.strokeRect(-half,-half,size,size);
        c.fillStyle='#fff';c.globalAlpha=.92;c.beginPath();c.arc(0,0,size*.15,0,Math.PI*2);c.fill();c.globalAlpha=1;
      }else if(style==='chrome'){
        const gr=c.createLinearGradient(-half,-half,half,half);gr.addColorStop(0,'#f4f9fc');gr.addColorStop(.42,color);gr.addColorStop(.52,'#7d8c95');gr.addColorStop(1,'#39454c');
        c.fillStyle=gr;c.fillRect(-half,-half,size,size);
        c.shadowBlur=0;c.fillStyle='#ffffffcc';c.fillRect(-half,-half,size,size*.2);
        c.strokeStyle='#eaf3f7';c.lineWidth=1.6*k;c.strokeRect(-half,-half,size,size);
      }else if(style==='nova'){
        c.fillStyle=color;c.fillRect(-half,-half,size,size);
        c.shadowBlur=0;c.strokeStyle=`hsl(${Math.floor((g.time*95+180)%360)},95%,74%)`;c.lineWidth=2.4*k;c.strokeRect(-half*1.07,-half*1.07,size*1.14,size*1.14);
        c.fillStyle='#fff';c.beginPath();c.arc(0,0,size*.14,0,Math.PI*2);c.fill();
      }else{
        c.fillStyle=color;c.fillRect(-half,-half,size,size);
        c.shadowBlur=0;c.fillStyle=skin.accent;c.fillRect(-half*.58,-half*.58,half*1.16,half*1.16);
        c.fillStyle=color;c.fillRect(-half*.24,-half*.24,half*.48,half*.48);
      }
      c.shadowBlur=0;c.strokeStyle='rgba(9,15,21,.5)';c.lineWidth=1.5*k;c.strokeRect(-half,-half,size,size);
      c.restore();
    }
  }

  class Game {
    constructor(){
      this.state='MENU';this.returnState='MENU';this.levelIndex=0;this.level=null;this.width=960;this.height=540;this.scale=1;this.u=1;this.levelU=1;this.buildFloor=0;this.dpr=1;this.camera=0;this.time=0;this.visual=0;this.elapsed=0;this.coins=0;this.jumps=0;this.pickups=0;this.score=0;this.speed=0;this.shake=0;this.effects={};this.particles=new ParticleField();this.runner=new Runner(this);this.last=0;this.frames=0;this.fpsTime=0;this.fps=60;this.toastUntil=0;
      this.resize();window.addEventListener('resize',()=>this.resize(),{passive:true});window.addEventListener('orientationchange',()=>setTimeout(()=>this.resize(),80),{passive:true});window.addEventListener('keydown',e=>this.key(e));window.addEventListener('blur',()=>{if(this.state==='PLAYING')this.pause()});document.addEventListener('visibilitychange',()=>{this.last=0;if(document.hidden&&this.state==='PLAYING')this.pause()});
      stage.addEventListener('pointerdown',e=>{if(this.state==='PLAYING'&&!e.target.closest('button,a')&&(e.pointerType!=='mouse'||e.button===0)){sound.init();this.runner.jump()}});touch.addEventListener('pointerdown',e=>{e.preventDefault();this.runner.jump()});
      app.addEventListener('click',e=>{const b=e.target.closest('[data-action],[data-setting],[data-difficulty],[data-level],[data-skin]');if(!b)return;if(b.dataset.setting){this.toggle(b.dataset.setting);return}if(b.dataset.difficulty){this.difficulty(b.dataset.difficulty);return}if(b.dataset.skin!==undefined){this.pickSkin(b.dataset.skin);return}if(b.dataset.level!==undefined){this.select(+b.dataset.level);return}this.action(b.dataset.action)});
      this.syncSettings();this.updateMenuBest();this.updateMenuProfile();this.renderLevels();this.renderSkins();this.setState('MENU');sound.music();this.loop=this.loop.bind(this);requestAnimationFrame(this.loop);
    }
    get floorY(){return this.height*.81} get ceilingY(){return this.height*.105} get playerSize(){return 34*this.u} get jumpSpeed(){return 690*this.u*(save.data.settings.difficulty==='easy'?1.08:save.data.settings.difficulty==='hard'?.94:1)}
    get skin(){return SKINS.find(s=>s.id===save.data.skin)||SKINS[0]}
    skinColor(){const s=this.skin;return s.style==='nova'?`hsl(${Math.floor((this.time*95)%360)},95%,66%)`:s.color}
    burst(x,y,count,color,speed,life,diamond){this.particles.burst(x,y,count,color,speed*this.u,life,diamond)}
    resize(){
      const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;
      this.dpr=Math.min(2,devicePixelRatio||1);
      let s=r.height/DESIGN_H;
      if(r.width/s<MIN_VIEW_W)s=r.width/MIN_VIEW_W;
      this.scale=s;this.width=r.width/s;this.height=r.height/s;this.u=clamp(this.height/DESIGN_H,MIN_U,MAX_U);
      canvas.width=Math.max(1,Math.round(r.width*this.dpr));canvas.height=Math.max(1,Math.round(r.height*this.dpr));
      ctx.setTransform(this.dpr*s,0,0,this.dpr*s,0,0);this.particles.unit=this.u;
      if(this.level&&Math.abs(this.u-this.levelU)>.001)this.rebuildLevel();
      if(this.level&&this.runner.grounded)this.runner.y=this.floorY-this.playerSize;
    }
    buildLevel(i){
      const src=ROUTES[i],u=this.u,floor=this.floorY;
      const level={name:src.name,color:src.color,gold:src.gold,speed:src.speed*u,length:src.length*u,obstacles:[],
        coins:src.coins.map(([x,h])=>({x:x*u,y:floor-h*u,phase:x*.03,got:false})),
        powers:src.powers.map(([x,type])=>({x:x*u,y:floor-102*u,type,got:false})),
        portals:src.portals.map(([x,type])=>({x:x*u,type,used:false})),
        gaps:src.gaps.map(([x,w])=>({x:x*u,width:w*u})),
        platforms:(src.platforms||[]).map(([x,w,h])=>({x:x*u,y:floor-h*u,w:w*u})),
        checkpoints:src.checkpoints.map(x=>({x:x*u,hit:false}))};
      for(const [x,n] of src.spikes)level.obstacles.push({type:'spike',x:x*u,n,w:n*36*u,h:37*u});
      for(const [x,w,h] of src.blocks)level.obstacles.push({type:'block',x:x*u,w:w*u,h:h*u});
      for(const [x,w,h,amp] of src.movers)level.obstacles.push({type:'mover',x:x*u,w:w*u,h:h*u,amp:amp*u,phase:x*.012});
      for(const [x,n] of src.ceilings)level.obstacles.push({type:'ceiling',x:x*u,n,w:n*37*u,h:43*u});
      for(const x of src.rotors)level.obstacles.push({type:'rotor',x:x*u,r:25*u});
      for(const [x,w,phase] of src.lasers)level.obstacles.push({type:'laser',x:x*u,w:w*u,phase});
      for(const x of src.saws||[])level.obstacles.push({type:'saw',x:x*u,r:20*u});
      for(const [x,h] of src.orbs||[])level.obstacles.push({type:'orb',x:x*u,y:floor-h*u,used:false});
      for(const x of src.pads||[])level.obstacles.push({type:'pad',x:x*u,used:false});
      level.obstacles.sort((a,b)=>a.x-b.x);
      this.level=level;this.levelU=u;this.buildFloor=floor;this.levelIndex=i;
    }
    rebuildLevel(){
      const i=this.levelIndex,old=this.levelU||1,u=this.u;
      const rx=this.runner.x/old,ry=(this.runner.y-this.buildFloor)/old;
      const coins=this.level.coins.map(c=>c.got),powers=this.level.powers.map(p=>p.got),portals=this.level.portals.map(p=>p.used),marks=this.level.checkpoints.map(c=>c.hit);
      this.buildLevel(i);
      this.level.coins.forEach((c,n)=>c.got=coins[n]);
      this.level.powers.forEach((p,n)=>p.got=powers[n]);
      this.level.portals.forEach((p,n)=>p.used=portals[n]);
      this.level.checkpoints.forEach((c,n)=>c.hit=marks[n]);
      this.runner.x=rx*u;this.runner.y=this.buildFloor+ry*u;
      this.camera=Math.max(0,this.runner.x-this.width*.245);
    }
    key(e){const k=e.key.toLowerCase();if((k===' '||k==='arrowup'||k==='w')&&this.state==='PLAYING'){e.preventDefault();if(!e.repeat)this.runner.jump()}else if(k==='r'&&['PLAYING','PAUSED','DEAD','LEVEL_COMPLETE'].includes(this.state)){e.preventDefault();this.start(this.levelIndex)}else if(k==='escape'||k==='p'){if(this.state==='PLAYING'){e.preventDefault();this.pause()}else if(this.state==='PAUSED'){e.preventDefault();this.resume()}}}
    setState(s){this.state=s;app.dataset.state=s.toLowerCase();document.querySelectorAll('[data-screen]').forEach(x=>x.hidden=x.dataset.screen!==s);const on=['PLAYING','PAUSED','DEAD','LEVEL_COMPLETE'].includes(s);$('#game-hud').hidden=!on;$('#run-stats').hidden=!on;touch.hidden=s!=='PLAYING';this.updateHud()}
    action(a){sound.init();sound.effect('click');switch(a){case'play':this.start(this.levelIndex);break;case'levels':this.renderLevels();this.setState('LEVEL_SELECT');break;case'skins':this.returnState=this.state;this.renderSkins();this.setState('SKINS');break;case'how':this.setState('HOW_TO_PLAY');break;case'settings':this.returnState=this.state;this.setState('SETTINGS');break;case'back':this.setState(this.returnState);break;case'menu':this.updateMenuProfile();this.setState('MENU');break;case'pause':this.pause();break;case'resume':this.resume();break;case'restart':this.start(this.levelIndex);break;case'next':this.start(Math.min(LEVEL_COUNT-1,this.levelIndex+1));break;case'toggle-sfx':this.toggle('sfx');break}}
    start(i){if(i<0||i>=LEVEL_COUNT||i>=save.data.unlocked)return;this.buildLevel(i);this.runner.reset();this.runner.x=90*this.u;this.runner.y=this.floorY-this.playerSize;this.camera=this.time=this.visual=this.elapsed=this.coins=this.jumps=this.pickups=this.score=0;this.speed=this.level.speed*MODES[save.data.settings.difficulty];this.effects={shield:0,magnet:0,slow:0,double:0,speed:0,gravity:0,size:0};this.particles.items.length=0;this.shake=0;sound.init();sound.music();this.setState('PLAYING')}
    select(i){if(i>=save.data.unlocked){sound.effect('click');this.toast('CLEAR THE PREVIOUS ROUTE FIRST');return}this.start(i)}
    pause(){if(this.state==='PLAYING')this.setState('PAUSED')}resume(){if(this.state==='PAUSED'){this.last=0;this.setState('PLAYING')}}
    toggle(k){const v=!save.data.settings[k];save.data.settings[k]=v;save.save();this.syncSettings();if(k==='music')v?sound.music():sound.stop();if(k==='sfx'&&v)sound.effect('click')}
    difficulty(d){if(!MODES[d])return;save.data.settings.difficulty=d;save.save();this.syncSettings();if(this.level)this.speed=this.level.speed*MODES[d]*(this.effects.speed?1.2:this.effects.slow?.74:1);sound.effect('click')}
    syncSettings(){document.querySelectorAll('[data-setting]').forEach(b=>b.setAttribute('aria-pressed',String(!!save.data.settings[b.dataset.setting])));document.querySelectorAll('[data-difficulty]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.difficulty===save.data.settings.difficulty)));$('#fps-readout').hidden=!save.data.settings.fps;$('#settings-skin-name').textContent=this.skin.name;$('#skin-current-name').textContent=this.skin.name}
    record(){return save.record(this.levelIndex)}
    updateMenuBest(){const best=Math.max(0,...Object.values(save.data.records).map(r=>+r.best||0));$('#menu-best').textContent=String(best).padStart(6,'0')}
    updateMenuProfile(){const skin=this.skin;$('#menu-skin').textContent=skin.name;$('#menu-coins').textContent=save.totalCoins();$('#menu-routes').textContent=`${save.completedCount()} / ${LEVEL_COUNT}`;const cube=$('.hero-cube');if(cube){cube.dataset.style=skin.style;cube.style.setProperty('--skin',skin.color);cube.style.setProperty('--skin-accent',skin.accent);const label=$('.hero-caption span:last-child');if(label)label.textContent=skin.name}}
    renderSkins(){
      const grid=$('#skin-grid');grid.textContent='';
      SKINS.forEach(s=>{
        const state=save.skinState(s),active=s.id===save.data.skin;
        const b=document.createElement('button');
        b.type='button';b.className='skin-card';b.dataset.skin=s.id;b.disabled=!state.open;b.setAttribute('aria-pressed',String(active));
        b.style.setProperty('--skin',s.color);b.style.setProperty('--skin-accent',s.accent);b.style.setProperty('--skin-glow',s.color+'3d');
        b.setAttribute('aria-label',`${s.name} skin, ${state.label}`);
        b.innerHTML=`<span class="skin-card-top"><i class="skin-chip cube--${s.style}"></i><span class="skin-state">${state.open?(active?'EQUIPPED':'READY'):'LOCKED'}</span></span><strong>${s.name}</strong><small>${s.tag}</small><span class="skin-require">${state.label}</span>`;
        grid.append(b);
      });
      const cur=this.skin,chip=$('#skin-current-chip');
      chip.className=`skin-chip cube--${cur.style}`;
      chip.style.setProperty('--skin',cur.color);chip.style.setProperty('--skin-accent',cur.accent);
    }
    pickSkin(id){
      const skin=SKINS.find(s=>s.id===id);if(!skin)return;
      if(!save.skinState(skin).open){sound.effect('click');this.toast(`${skin.name} IS LOCKED`);return}
      save.data.skin=id;save.save();sound.effect('coin');this.renderSkins();this.updateMenuProfile();this.syncSettings();
    }
    renderLevels(){const grid=$('#level-grid');grid.textContent='';ROUTES.forEach((l,i)=>{const r=save.record(i),unlocked=i<save.data.unlocked,b=document.createElement('button');b.type='button';b.className='level-card';b.dataset.level=i;b.disabled=!unlocked;b.style.setProperty('--card-accent',l.color);b.style.setProperty('--card-glow',l.color+'3d');b.setAttribute('aria-label',`${unlocked?'Play':'Locked'} ${l.name}, ${l.difficulty}, best ${format(r.best)}, ${r.coins} of ${l.coins.length} coins`);const pips=l.coins.map((_,n)=>`<i class="${n<r.coins?'on':''}"></i>`).join('');b.innerHTML=`<span class="level-card-top"><span class="level-number">0${i+1} / ROUTE</span><span class="level-difficulty" data-d="${l.difficulty}">${l.difficulty}</span></span><h3>${l.name}</h3><p>${r.completed?'SIGNAL RESTORED':unlocked?'READY TO RUN':'CLEAR THE PREVIOUS ROUTE'}</p><span class="level-pips"><i class="pip-label">COIN SIGNAL</i><span class="pip-row">${pips}</span></span><span class="level-card-bottom"><span>BEST <strong>${format(r.best)}</strong></span><span>COINS <strong>${r.coins} / ${l.coins.length}</strong></span><span class="level-lock">${r.completed?'✓ COMPLETE':unlocked?'↗ PLAY':'LOCKED'}</span></span>`;grid.append(b)})}
    points(){return Math.floor(this.runner.x/this.u*.85)+this.coins*240+this.jumps*28+this.pickups*110}
    updateHud(){if(!this.level)return;const progress=clamp(this.runner.x/this.level.length,0,1),skin=this.skin;$('#hud-level-name').textContent=this.level.name;$('#progress-label').textContent=`${Math.floor(progress*100)}%`;$('#progress-fill').style.width=`${progress*100}%`;$('#coin-count').textContent=`${this.coins} / ${this.level.coins.length}`;$('#score-value').textContent=format(this.score||this.points());$('#best-value').textContent=format(this.record().best);$('#speed-value').textContent=`${(this.speed/this.level.speed).toFixed(1)}x`;$('#skin-value').textContent=skin.name;$('#shell-value').textContent=skin.name;const chip=$('#hud-skin-chip');if(chip){chip.className=`skin-chip cube--${skin.style}`;chip.style.setProperty('--skin',skin.color);chip.style.setProperty('--skin-accent',skin.accent)}}
    inGap(x){return this.level.gaps.some(g=>x>g.x&&x<g.x+g.width)}
    hit(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by}
    toast(text){const t=$('#toast');t.textContent=text;t.classList.add('is-on');this.toastUntil=performance.now()+1450}
    pickup(p){p.got=true;this.pickups++;this.effects[p.type]=p.type==='double'||p.type==='shield'?10:5.5;const colors={shield:'#61f1dc',slow:'#8cb5ff',magnet:'#ff82ae',double:'#ffc36a'};this.burst(p.x,p.y,22,colors[p.type],190,.65,true);this.shake=.075;sound.effect('power');this.toast(({shield:'SHIELD / ONE HIT',magnet:'MAGNET / COINS NEARBY',slow:'SLOW TIME / BREATHE',double:'DOUBLE JUMP / CHARGED'})[p.type])}
    portal(p){p.used=true;this.effects[p.type]=p.type==='gravity'?3.2:5;if(p.type==='gravity'){this.runner.gravity*=-1;this.runner.vy=-this.runner.gravity*130*this.u;this.runner.grounded=false;this.runner.jumps=0}this.shake=.09;this.burst(p.x,this.runner.y+this.playerSize/2,22,this.level.color,180,.62,true);sound.effect('portal');this.toast(({speed:'SPEED UP / 5 SEC',slow:'SLOW FIELD / 5 SEC',gravity:'GRAVITY FLIPPED',size:'SIZE SHIFT / 5 SEC'})[p.type])}
    crash(){if(this.state!=='PLAYING')return;if(this.effects.shield){this.effects.shield=0;this.runner.vy=-this.jumpSpeed*.75;this.burst(this.runner.x+this.playerSize/2,this.runner.y+this.playerSize/2,28,'#61f1dc',230,.65,true);this.shake=.16;sound.effect('power');this.toast('SHIELD BROKEN / KEEP RUNNING');return}this.score=this.points();save.run(this.levelIndex,this.score,this.coins,false);this.runner.dead=.01;this.burst(this.runner.x+this.playerSize/2,this.runner.y+this.playerSize/2,34,this.level.color,250,.72,true);this.shake=.25;sound.effect('death');$('#dead-score').textContent=format(this.score);$('#dead-coins').textContent=`${this.coins} / ${this.level.coins.length}`;$('#dead-best').textContent=format(save.record(this.levelIndex).best);this.updateMenuBest();this.updateMenuProfile();this.setState('DEAD')}
    complete(){if(this.state!=='PLAYING')return;this.score=this.points()+800+this.coins*35;save.run(this.levelIndex,this.score,this.coins,true);this.burst(this.runner.x+this.playerSize/2,this.runner.y+this.playerSize/2,70,this.level.color,300,1.1,true);this.burst(this.runner.x+this.playerSize/2,this.runner.y+this.playerSize/2,34,this.level.gold,200,.95);this.shake=.16;sound.effect('complete');$('#complete-level-name').textContent=`A clean run through ${this.level.name}.`;$('#complete-score').textContent=format(this.score);$('#complete-coins').textContent=`${this.coins} / ${this.level.coins.length}`;$('#complete-progress').textContent='100%';const t=Math.floor(this.elapsed);$('#complete-time').textContent=`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;$('#complete-best').textContent=format(save.record(this.levelIndex).best);$('[data-action="next"]').innerHTML=this.levelIndex===LEVEL_COUNT-1?'RUN IT AGAIN <span>↗</span>':'NEXT LEVEL <span>↗</span>';this.updateMenuBest();this.updateMenuProfile();this.renderLevels();this.setState('LEVEL_COMPLETE')}
    update(dt){
      if(['MENU','LEVEL_SELECT','HOW_TO_PLAY','SETTINGS'].includes(this.state)){this.visual+=dt;return}
      if(this.state==='DEAD'){this.visual+=dt;this.particles.update(dt);this.runner.dead+=dt;this.shake=Math.max(0,this.shake-dt*1.6);return}
      if(this.state!=='PLAYING')return;
      this.time+=dt;this.visual+=dt;this.elapsed+=dt;for(const k in this.effects)this.effects[k]=Math.max(0,this.effects[k]-dt);
      const u=this.u,size=this.playerSize,mult=MODES[save.data.settings.difficulty];this.speed=this.level.speed*mult*(this.effects.speed?1.2:this.effects.slow?.74:1);this.runner.scale=this.effects.size?.74:1;
      if(!this.effects.gravity&&this.runner.gravity<0){this.runner.gravity=1;this.runner.vy=80*u}
      this.runner.update(dt);if(this.state!=='PLAYING')return;this.camera=Math.max(0,this.runner.x-this.width*.245);
      for(const coin of this.level.coins){if(coin.got)continue;if(this.effects.magnet&&Math.abs(coin.x-this.runner.x)<240*u){coin.x+=(this.runner.x+size/2-coin.x)*Math.min(1,dt*2.7);coin.y+=(this.runner.y+size/2-coin.y)*Math.min(1,dt*2.7)}const y=coin.y+Math.sin(this.time*3+coin.phase)*5*u;if(this.hit(this.runner.x+4*u,this.runner.y+4*u,26*u,26*u,coin.x-13*u,y-14*u,26*u,28*u)){coin.got=true;this.coins++;this.burst(coin.x,y,13,this.level.gold,155,.5,true);sound.effect('coin');this.shake=Math.max(this.shake,.025)}}
      for(const p of this.level.powers)if(!p.got&&this.hit(this.runner.x+3*u,this.runner.y+3*u,28*u,28*u,p.x-15*u,p.y-15*u,30*u,30*u))this.pickup(p);
      for(const p of this.level.portals)if(!p.used&&this.runner.x+34*u>p.x-18*u&&this.runner.x<p.x+18*u)this.portal(p);
      this.triggers();if(this.state!=='PLAYING')return;
      this.collisions();if(this.state!=='PLAYING')return;
      for(const cp of this.level.checkpoints)if(!cp.hit&&this.runner.x>=cp.x){cp.hit=true;this.shake=.055;this.toast('CHECKPOINT / ROUTE MARKED')}
      this.particles.update(dt);this.shake=Math.max(0,this.shake-dt*1.3);this.score=this.points();if(this.runner.x>=this.level.length)this.complete();this.updateHud();
    }
    triggers(){
      const u=this.u,r=this.runner,f=this.floorY;
      for(const o of this.level.obstacles){
        if(o.x<r.x-140*u||o.x>r.x+this.width||o.used)continue;
        if(o.type==='orb'&&this.hit(r.x+6*u,r.y+6*u,22*u,22*u,o.x-16*u,o.y-16*u,32*u,32*u)){
          o.used=true;r.vy=-this.jumpSpeed*1.22;r.grounded=false;r.jumps=0;r.coyote=0;
          this.burst(o.x,o.y,18,this.level.color,210,.62,true);this.shake=.07;sound.effect('power');this.toast('ORB / LAUNCH BOOST');
        }else if(o.type==='pad'&&r.vy>=0&&this.hit(r.x+6*u,r.y+6*u,22*u,22*u,o.x+2*u,f-18*u,30*u,18*u)){
          o.used=true;r.vy=-this.jumpSpeed*1.5;r.grounded=false;r.jumps=0;r.coyote=0;
          this.burst(o.x+15*u,f-10*u,24,this.level.gold,240,.62,true);this.shake=.09;sound.effect('power');this.toast('PAD / BIG LAUNCH');
        }
      }
    }
    collisions(){const p=this.runner,u=this.u,x=p.x+6*u,y=p.y+6*u,s=22*u,f=this.floorY,c=this.ceilingY;for(const o of this.level.obstacles){if(o.x>p.x+this.width||o.x+(o.w||50*u)<p.x-20*u)continue;let hit=false;if(o.type==='spike'||o.type==='ceiling'){const each=o.w/o.n;for(let i=0;i<o.n;i++){const top=o.type==='ceiling',hy=top?c:f-o.h+7*u,hh=o.h-7*u;if(this.hit(x,y,s,s,o.x+each*i+7*u,hy,each-14*u,hh)){hit=true;break}}}else if(o.type==='block'||o.type==='mover'){const yy=f-o.h+(o.type==='mover'?Math.sin(this.time*2.2+o.phase)*o.amp:0);hit=this.hit(x,y,s,s,o.x+4*u,yy+4*u,o.w-8*u,o.h-5*u)}else if(o.type==='rotor'){const cx=o.x+17*u,cy=f-62*u,nx=clamp(cx,x,x+s),ny=clamp(cy,y,y+s);hit=Math.hypot(cx-nx,cy-ny)<o.r-4*u}else if(o.type==='saw'){const cx=o.x+20*u,cy=f-18*u,nx=clamp(cx,x,x+s),ny=clamp(cy,y,y+s);hit=Math.hypot(cx-nx,cy-ny)<o.r-3*u}else if(o.type==='laser'){o.active=Math.sin((this.time+o.phase)*3.1)>-.15;hit=o.active&&this.hit(x,y,s,s,o.x,f-67*u,o.w,7*u)}if(hit){this.crash();return}}}
    rgba(hex,a){const v=hex.slice(1);return`rgba(${parseInt(v.slice(0,2),16)},${parseInt(v.slice(2,4),16)},${parseInt(v.slice(4,6),16)},${a})`}
    shade(hex,t){const v=hex.slice(1),m=t>0?255:0,k=Math.abs(t),c=n=>Math.round(n+(m-n)*k).toString(16).padStart(2,'0');return'#'+c(parseInt(v.slice(0,2),16))+c(parseInt(v.slice(2,4),16))+c(parseInt(v.slice(4,6),16))}
    ridge(baseY,amp,step,color,parallax,cam){
      const off=-((cam*parallax)%step+step)%step;
      ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-step*2,this.height);
      for(let x=-step*2+off;x<=this.width+step*2;x+=step){ctx.lineTo(x,baseY);ctx.lineTo(x+step*.5,baseY-amp);ctx.lineTo(x+step,baseY)}
      ctx.lineTo(this.width+step*2,this.height);ctx.closePath();ctx.fill();
    }
    background(){
      const w=this.width,h=this.height,u=this.u,a=this.level?this.level.color:'#61f1dc',cam=this.level?this.camera:this.visual*9,cell=46*u;
      const sky=ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,this.shade(a,.42));sky.addColorStop(.46,a);sky.addColorStop(1,this.shade(a,-.34));
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
      const halo=ctx.createRadialGradient(w*.68,h*.3,4,w*.68,h*.3,w*.7);
      halo.addColorStop(0,this.rgba(this.shade(a,.75),.5));halo.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=this.rgba(this.shade(a,-.55),.16);ctx.lineWidth=Math.max(1,1*u);
      const gx=-(cam*.5)%cell,gy=-((this.visual*4)%cell);
      ctx.beginPath();
      for(let x=gx-cell;x<w+cell;x+=cell){ctx.moveTo(x,-cell);ctx.lineTo(x,h+cell)}
      for(let y=gy-cell;y<h+cell;y+=cell){ctx.moveTo(-cell,y);ctx.lineTo(w+cell,y)}
      ctx.stroke();
      const pane=w*.2;
      ctx.fillStyle=this.rgba(this.shade(a,.8),.16);
      ctx.fillRect(pane+((cam*.14)%(w*1.6))-w*.3,h*.06,pane,h*.2);
      this.ridge(h*.86,52*u,74*u,this.shade(a,-.14),.16,cam);
      this.ridge(h*.93,44*u,58*u,this.shade(a,-.3),.3,cam);
      this.ridge(h*.99,36*u,46*u,this.shade(a,-.46),.5,cam);
      for(let i=0;i<8;i++){
        const sp=.1+i*.045,x=(((i*347-cam*sp)%(w+400))+w+400)%(w+400)-200,y=h*.14+((i*113)%(h*.4))+Math.sin(this.visual*1.3+i*1.7)*7*u,s=(15+(i%3)*10)*u;
        ctx.save();ctx.translate(x,y);ctx.rotate((i%2?1:-1)*this.visual*.12);ctx.globalAlpha=.17;ctx.strokeStyle=this.shade(a,-.45);ctx.fillStyle=this.shade(a,-.4);ctx.lineWidth=2.2*u;
        if(i%3===0){ctx.beginPath();ctx.arc(0,0,s*.62,0,Math.PI*2);ctx.stroke()}
        else if(i%3===1){ctx.rotate(Math.PI/4);ctx.strokeRect(-s*.5,-s*.5,s,s)}
        else{ctx.fillRect(-s*.34,-s*.11,s*.68,s*.22);ctx.fillRect(-s*.11,-s*.34,s*.22,s*.68)}
        ctx.restore();
      }
      for(let i=0;i<16;i++){
        const x=(((i*191-cam*.07)%(w+120))+w+120)%(w+120)-60,y=24+((i*97)%(h*.62));
        ctx.globalAlpha=.3+Math.sin(this.visual*1.8+i)*.24;ctx.fillStyle=i%4===0?this.shade(a,.7):this.shade(a,.85);
        const s=(1.6+(i%5===0?1.6:0))*u;ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-s/2,-s/2,s,s);ctx.restore();
      }
      ctx.globalAlpha=1;
      const vig=ctx.createRadialGradient(w*.5,h*.46,Math.min(w,h)*.28,w*.5,h*.46,Math.max(w,h)*.78);
      vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,this.rgba(this.shade(a,-.86),.6));
      ctx.fillStyle=vig;ctx.fillRect(0,0,w,h);
    }
    groundSegment(start,end){
      const x=start-this.camera,w=end-start,f=this.floorY,a=this.level.color,u=this.u,cell=46*u;
      const body=ctx.createLinearGradient(0,f,0,this.height);
      body.addColorStop(0,this.shade(a,-.6));body.addColorStop(1,this.shade(a,-.84));
      ctx.fillStyle=body;ctx.fillRect(x,f,w,this.height-f+4);
      ctx.save();ctx.beginPath();ctx.rect(x,f,w,this.height-f);ctx.clip();
      ctx.strokeStyle=this.rgba(this.shade(a,.55),.15);ctx.lineWidth=Math.max(1,u);
      const off=-(this.camera%cell);
      ctx.beginPath();
      for(let gx=x+off-cell;gx<x+w+cell;gx+=cell){ctx.moveTo(gx,f);ctx.lineTo(gx,this.height)}
      for(let gy=f+cell;gy<this.height;gy+=cell){ctx.moveTo(x,gy);ctx.lineTo(x+w,gy)}
      ctx.stroke();ctx.restore();
      ctx.fillStyle=this.shade(a,.28);ctx.fillRect(x,f,w,4.5*u);
      ctx.shadowColor=this.shade(a,.5);ctx.shadowBlur=13*u;ctx.fillStyle=this.shade(a,.5);ctx.fillRect(x,f-.5,w,1.8*u);ctx.shadowBlur=0;
    }
    drawGround(){let start=this.camera-10,end=this.camera+this.width+10,at=start;for(const gap of this.level.gaps){if(gap.x+gap.width<start||gap.x>end)continue;if(gap.x>at)this.groundSegment(at,gap.x);at=Math.max(at,gap.x+gap.width)}if(at<end)this.groundSegment(at,end);for(const p of this.level.platforms){const x=p.x-this.camera;if(x< -p.w||x>this.width)continue;ctx.fillStyle=this.shade(this.level.color,-.6);ctx.fillRect(x,p.y,p.w,9*this.u);ctx.fillStyle=this.shade(this.level.color,.32);ctx.fillRect(x,p.y,p.w,2.6*this.u)}for(const cp of this.level.checkpoints){const px=cp.x-this.camera;if(px< -30||px>this.width+30)continue;ctx.strokeStyle=cp.hit?this.level.color:'rgba(219,236,234,.35)';ctx.beginPath();ctx.moveTo(px,this.floorY);ctx.lineTo(px,this.floorY-95*this.u);ctx.stroke();ctx.fillStyle=this.level.color;ctx.beginPath();ctx.moveTo(px,this.floorY-95*this.u);ctx.lineTo(px+11*this.u,this.floorY-86*this.u);ctx.lineTo(px,this.floorY-77*this.u);ctx.fill()}const fx=this.level.length-this.camera;if(fx>-70&&fx<this.width+70){const u=this.u,f=this.floorY,gh=this.height*.7,gw=46*u;ctx.save();ctx.globalAlpha=.16;ctx.fillStyle=this.level.color;ctx.fillRect(fx,f-gh,gw,gh);ctx.globalAlpha=.95;ctx.strokeStyle=this.level.color;ctx.lineWidth=2*u;ctx.shadowColor=this.level.color;ctx.shadowBlur=20*u;ctx.strokeRect(fx,f-gh,gw,gh);ctx.shadowBlur=0;ctx.globalAlpha=.85;ctx.lineWidth=1.4*u;for(let i=0;i<7;i++){const t=(this.visual*.9+i*.16)%1;ctx.beginPath();ctx.moveTo(fx+6*u,f-gh+t*gh);ctx.lineTo(fx+gw-6*u,f-gh+t*gh);ctx.stroke()}ctx.restore()}}
    drawObstacles(){const f=this.floorY,c=this.ceilingY,u=this.u;for(const o of this.level.obstacles){const x=o.x-this.camera;if(x< -100||x>this.width+100)continue;ctx.save();ctx.shadowColor=o.type==='laser'?this.level.gold:this.level.color;if(o.type==='spike'||o.type==='ceiling'){const top=o.type==='ceiling',base=top?c:f,each=o.w/o.n;ctx.fillStyle=top?'rgba(244,126,155,.28)':'rgba(246,112,137,.28)';ctx.strokeStyle='rgba(12,18,24,.7)';ctx.lineWidth=4.4*u;ctx.shadowBlur=0;for(let i=0;i<o.n;i++){const sx=x+i*each;ctx.beginPath();ctx.moveTo(sx,base);ctx.lineTo(sx+each/2,base+(top?o.h:-o.h));ctx.lineTo(sx+each,base);ctx.closePath();ctx.fill();ctx.stroke()}ctx.strokeStyle=this.shade(this.level.gold,-.05);ctx.lineWidth=1.7*u;ctx.shadowBlur=9*u;for(let i=0;i<o.n;i++){const sx=x+i*each;ctx.beginPath();ctx.moveTo(sx,base);ctx.lineTo(sx+each/2,base+(top?o.h:-o.h));ctx.lineTo(sx+each,base);ctx.closePath();ctx.stroke()}}else if(o.type==='block'||o.type==='mover'){const y=f-o.h+(o.type==='mover'?Math.sin(this.time*2.2+o.phase)*o.amp:0);ctx.shadowBlur=11*u;ctx.fillStyle=this.shade(this.level.color,-.66);ctx.strokeStyle=this.shade(this.level.color,-.3);ctx.lineWidth=2.4*u;ctx.fillRect(x,y,o.w,o.h);ctx.strokeRect(x,y,o.w,o.h);ctx.fillStyle=this.shade(this.level.color,.3);ctx.fillRect(x+6*u,y+6*u,o.w-12*u,2*u)}else if(o.type==='rotor'){const cx=x+17*u,cy=f-62*u,r=o.r,a=this.time*1.5;ctx.translate(cx,cy);ctx.rotate(a);ctx.shadowBlur=14*u;ctx.fillStyle='rgba(236,126,157,.24)';ctx.strokeStyle=this.level.gold;ctx.lineWidth=2*u;ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r,0);ctx.lineTo(0,r);ctx.lineTo(-r,0);ctx.closePath();ctx.fill();ctx.stroke()}else if(o.type==='saw'){const cx=x+20*u,cy=f-18*u,r=o.r;ctx.translate(cx,cy);ctx.rotate(this.time*7);ctx.shadowBlur=14*u;ctx.fillStyle=this.rgba(this.level.gold,.22);ctx.strokeStyle='rgba(12,18,24,.75)';ctx.lineWidth=4*u;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle=this.shade(this.level.gold,-.1);ctx.lineWidth=2*u;ctx.stroke();for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.moveTo(r*.34,0);ctx.lineTo(r*.82,0);ctx.stroke()}ctx.shadowBlur=0;ctx.fillStyle=this.shade(this.level.gold,-.2);ctx.beginPath();ctx.arc(0,0,r*.2,0,Math.PI*2);ctx.fill()}else if(o.type==='orb'){const pulse=1+Math.sin(this.time*4)*.07,rr=16*u*pulse;ctx.globalAlpha=o.used?.22:1;ctx.shadowBlur=18*u;ctx.fillStyle=this.rgba(this.shade(this.level.color,-.2),.32);ctx.strokeStyle=this.shade(this.level.color,-.42);ctx.lineWidth=2.4*u;ctx.beginPath();ctx.arc(x,o.y,rr,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=o.used?.1:.55;ctx.lineWidth=1.4*u;ctx.beginPath();ctx.arc(x,o.y,rr*.5,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=o.used?.3:1;ctx.fillStyle='#f0ffff';ctx.beginPath();ctx.arc(x,o.y,3.6*u,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}else if(o.type==='pad'){const w=34*u,hh=10*u,yy=f-hh;ctx.globalAlpha=o.used?.4:1;ctx.shadowBlur=14*u;ctx.fillStyle=this.rgba(this.shade(this.level.gold,-.28),.55);ctx.strokeStyle=this.shade(this.level.gold,-.42);ctx.lineWidth=3.4*u;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.lineTo(x+w-7*u,f);ctx.lineTo(x+7*u,f);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=this.rgba(this.level.gold,.85);ctx.lineWidth=1.6*u;const lift=this.time*1.6%1;for(let i=0;i<2;i++){const t=(lift+i*.5)%1;ctx.globalAlpha=(o.used?.1:.75)*(1-t);const cy2=yy-t*10*u;ctx.beginPath();ctx.moveTo(x+9*u,cy2+4*u);ctx.lineTo(x+w/2,cy2-2*u);ctx.lineTo(x+w-9*u,cy2+4*u);ctx.stroke()}ctx.globalAlpha=1}else{const active=o.active===undefined?Math.sin((this.time+o.phase)*3.1)>-.15:o.active;ctx.globalAlpha=active?.95:.25;ctx.strokeStyle='rgba(12,18,24,.7)';ctx.lineWidth=(active?5.6:3.4)*u;ctx.beginPath();ctx.moveTo(x,f-64*u);ctx.lineTo(x+o.w,f-64*u);ctx.stroke();ctx.strokeStyle=this.shade(this.level.gold,-.05);ctx.lineWidth=(active?3:1.5)*u;ctx.shadowBlur=(active?16:4)*u;ctx.beginPath();ctx.moveTo(x,f-64*u);ctx.lineTo(x+o.w,f-64*u);ctx.stroke();ctx.fillStyle=this.shade(this.level.gold,-.1);ctx.fillRect(x-2*u,f-69*u,4*u,10*u);ctx.fillRect(x+o.w-2*u,f-69*u,4*u,10*u)}ctx.restore()}}
    drawItems(){const u=this.u;for(const coin of this.level.coins){if(coin.got)continue;const x=coin.x-this.camera,y=coin.y+Math.sin(this.time*3+coin.phase)*5*u;if(x< -30||x>this.width+30)continue;ctx.save();ctx.translate(x,y);ctx.scale(Math.max(.13,Math.abs(Math.cos(this.time*3.2+coin.phase))),1);ctx.fillStyle='rgba(9,15,21,.5)';ctx.beginPath();ctx.arc(0,0,12.4*u,0,Math.PI*2);ctx.fill();ctx.shadowColor=this.level.gold;ctx.shadowBlur=14*u;ctx.strokeStyle=this.shade(this.level.gold,-.16);ctx.lineWidth=2*u;ctx.fillStyle=this.rgba(this.level.gold,.3);ctx.beginPath();ctx.arc(0,0,10*u,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore()}for(const p of this.level.powers){if(p.got)continue;const x=p.x-this.camera,y=p.y+Math.sin(this.time*2.2+p.x*.02)*5*u,color={shield:'#61f1dc',slow:'#8cb5ff',magnet:'#ff82ae',double:'#ffc36a'}[p.type];if(x< -35||x>this.width+35)continue;ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4+this.time*.5);ctx.shadowColor=color;ctx.shadowBlur=14*u;ctx.fillStyle='#09141c';ctx.strokeStyle=color;ctx.fillRect(-12*u,-12*u,24*u,24*u);ctx.strokeRect(-12*u,-12*u,24*u,24*u);ctx.rotate(-Math.PI/4-this.time*.5);ctx.fillStyle=color;ctx.font=`bold ${12*u}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(({shield:'S',magnet:'M',slow:'T',double:'2'})[p.type],0,1);ctx.restore()}for(const p of this.level.portals){if(p.used)continue;const x=p.x-this.camera,color={slow:'#8cb5ff',gravity:'#c398ff',size:'#ff82ae',speed:this.level.color}[p.type];if(x< -48||x>this.width+48)continue;ctx.save();ctx.translate(x,this.floorY-56*u);ctx.rotate(Math.sin(this.time*1.8+p.x*.02)*.12);ctx.shadowColor=color;ctx.shadowBlur=16*u;ctx.strokeStyle='rgba(10,16,22,.6)';ctx.lineWidth=6.4*u;ctx.beginPath();ctx.ellipse(0,0,(14+Math.sin(this.time*3)*2)*u,31*u,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=2*u;ctx.beginPath();ctx.ellipse(0,0,(14+Math.sin(this.time*3)*2)*u,31*u,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.4;ctx.lineWidth=5*u;ctx.beginPath();ctx.ellipse(0,0,11*u,27*u,0,0,Math.PI*2);ctx.stroke();ctx.restore()}}
    render(){ctx.setTransform(this.dpr*this.scale,0,0,this.dpr*this.scale,0,0);ctx.clearRect(0,0,this.width,this.height);this.background();if(this.level&&['PLAYING','PAUSED','DEAD','LEVEL_COMPLETE'].includes(this.state)){ctx.save();if(save.data.settings.shake&&this.shake)ctx.translate((Math.random()-.5)*this.shake*22*this.u,(Math.random()-.5)*this.shake*18*this.u);this.drawGround();this.drawObstacles();this.drawItems();this.particles.draw(ctx,this.camera);this.runner.draw(ctx,this.camera);ctx.restore()}if(save.data.settings.fps)$('#fps-readout').textContent=`${this.fps} FPS`}
    loop(now){if(!this.last)this.last=now;const dt=Math.min(.034,Math.max(0,(now-this.last)/1000));this.last=now;this.frames++;this.fpsTime+=dt;if(this.fpsTime>=.5){this.fps=Math.round(this.frames/this.fpsTime);this.frames=0;this.fpsTime=0}this.update(dt);this.render();if(this.toastUntil&&now>this.toastUntil){$('#toast').classList.remove('is-on');this.toastUntil=0}requestAnimationFrame(this.loop)}
  }
  new Game();
})();

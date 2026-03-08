(function () {
  'use strict';

  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentScreen = 0;

  // ==================== HEART CODE RAIN (Thắp sáng anh, sưởi ấm em) ====================
  const heartCodeRain = {
    canvas: null,
    ctx: null,
    columns: [],
    heartParticles: [],
    glowHearts: [],
    symbols: '♥♡❤💕💗💖💘💝❣♥♡'.split(''),
    codeChars: 'LOVE♥KHANH♡83VK♥'.split(''),
    fontSize: 14,
    running: false,

    init() {
      this.canvas = document.getElementById('heart-code-rain');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.running = true;
      this.animate();
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      const colCount = Math.floor(this.canvas.width / this.fontSize);
      this.columns = [];
      for (let i = 0; i < colCount; i++) {
        this.columns.push({
          y: Math.random() * this.canvas.height,
          speed: 0.5 + Math.random() * 2,
          opacity: 0.1 + Math.random() * 0.4,
          hue: 330 + Math.random() * 30,
          history: [] // store past Y positions for trail
        });
      }
    },

    createHeartShape(cx, cy, size) {
      const points = [];
      for (let t = 0; t < Math.PI * 2; t += 0.1) {
        const x = cx + size * 16 * Math.pow(Math.sin(t), 3) / 16;
        const y = cy - size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
        points.push({ x, y });
      }
      return points;
    },

    spawnGlowHeart() {
      if (this.glowHearts.length > 5) return;
      this.glowHearts.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height + 50,
        size: 20 + Math.random() * 40,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0,
        maxOpacity: 0.15 + Math.random() * 0.2,
        phase: 0,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        sway: Math.random() * 2
      });
    },

    drawHeart(x, y, size, rotation) {
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(rotation);
      this.ctx.beginPath();
      const s = size / 16;
      for (let t = 0; t < Math.PI * 2; t += 0.05) {
        const hx = s * 16 * Math.pow(Math.sin(t), 3);
        const hy = -s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        if (t === 0) this.ctx.moveTo(hx, hy);
        else this.ctx.lineTo(hx, hy);
      }
      this.ctx.closePath();
      this.ctx.restore();
    },

    animate() {
      if (!this.running) return;
      requestAnimationFrame(() => this.animate());

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Code rain columns
      for (let i = 0; i < this.columns.length; i++) {
        const col = this.columns[i];
        const x = i * this.fontSize;

        const char = this.codeChars[Math.floor(Math.random() * this.codeChars.length)];
        
        if (!col.history) col.history = [];
        col.history.unshift({ char, y: col.y });
        if (col.history.length > 25) col.history.pop();

        for (let j = 0; j < col.history.length; j++) {
          const point = col.history[j];
          const distToMouse = Math.sqrt(
            Math.pow(x - mouseX, 2) + Math.pow(point.y - mouseY, 2)
          );
          const nearCursor = distToMouse < 200;
          const trailOpacity = col.opacity * (1 - j / col.history.length);

          if (nearCursor && j === 0) {
            const intensity = 1 - distToMouse / 200;
            this.ctx.shadowBlur = 15 * intensity;
            this.ctx.shadowColor = 'rgba(255, 107, 157, 0.8)';
            this.ctx.fillStyle = `rgba(255, 107, 157, ${0.3 + intensity * 0.7})`;
            this.ctx.font = `bold ${this.fontSize + 2}px monospace`;
            const heartChar = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            this.ctx.fillText(heartChar, x, point.y);
          } else {
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = `hsla(${col.hue}, 80%, 70%, ${trailOpacity})`;
            this.ctx.font = `${this.fontSize}px monospace`;
            this.ctx.fillText(point.char, x, point.y);
          }
        }

        col.y += col.speed;

        if (col.y > this.canvas.height && Math.random() > 0.98) {
          col.y = 0;
          col.speed = 0.5 + Math.random() * 2;
          col.opacity = 0.1 + Math.random() * 0.4;
          col.history = [];
        }
      }

      this.ctx.shadowBlur = 0;

      // Floating glow hearts
      if (Math.random() < 0.02) this.spawnGlowHeart();

      for (let i = this.glowHearts.length - 1; i >= 0; i--) {
        const h = this.glowHearts[i];
        h.y -= h.speed;
        h.x += Math.sin(h.phase) * h.sway;
        h.phase += 0.02;
        h.rotation += h.rotSpeed;

        if (h.y > this.canvas.height * 0.7) {
          h.opacity = Math.min(h.opacity + 0.005, h.maxOpacity);
        } else if (h.y < this.canvas.height * 0.3) {
          h.opacity -= 0.005;
        }

        if (h.opacity <= 0 || h.y < -100) {
          this.glowHearts.splice(i, 1);
          continue;
        }

        const distToMouse = Math.sqrt(
          Math.pow(h.x - mouseX, 2) + Math.pow(h.y - mouseY, 2)
        );
        const cursorBoost = distToMouse < 150 ? (1 - distToMouse / 150) * 0.3 : 0;

        this.ctx.save();
        this.drawHeart(h.x, h.y, h.size, h.rotation);
        this.ctx.fillStyle = `rgba(255, 107, 157, ${h.opacity + cursorBoost})`;
        this.ctx.shadowBlur = 20 + cursorBoost * 40;
        this.ctx.shadowColor = `rgba(255, 107, 157, ${(h.opacity + cursorBoost) * 2})`;
        this.ctx.fill();

        this.ctx.strokeStyle = `rgba(255, 182, 193, ${(h.opacity + cursorBoost) * 0.5})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Cursor-attracted heart burst
      this.drawCursorHeartAura();
    },

    drawCursorHeartAura() {
      const time = Date.now() * 0.001;
      const rings = 3;
      for (let r = 0; r < rings; r++) {
        const heartCount = 5 + r * 3;
        const radius = 30 + r * 25;
        for (let i = 0; i < heartCount; i++) {
          const angle = (i / heartCount) * Math.PI * 2 + time * (0.5 - r * 0.15);
          const x = mouseX + Math.cos(angle) * radius;
          const y = mouseY + Math.sin(angle) * radius;
          const pulse = 0.5 + 0.5 * Math.sin(time * 3 + i);
          const size = (3 + r * 1.5) * (0.8 + pulse * 0.4);
          const opacity = (0.15 - r * 0.04) * (0.5 + pulse * 0.5);

          this.ctx.save();
          this.drawHeart(x, y, size, angle + Math.PI);
          this.ctx.fillStyle = `rgba(255, 107, 157, ${opacity})`;
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = `rgba(255, 20, 147, ${opacity})`;
          this.ctx.fill();
          this.ctx.restore();
        }
      }
    }
  };

  // ==================== CURSOR ENGINE ====================
  const cursorEngine = {
    init() {
      if (isMobile) return;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.documentElement.style.setProperty('--mouse-x', mouseX + 'px');
        document.documentElement.style.setProperty('--mouse-y', mouseY + 'px');
      });
    }
  };

  // ==================== PARTICLE TRAIL ====================
  const particleTrail = {
    container: null,
    lastTime: 0,
    maxParticles: 30,
    count: 0,
    particleTypes: {
      sparkle: ['✦', '✧', '⋆', '·'],
      heart: ['♥', '♡', '💕', '💗']
    },

    init() {
      this.container = document.getElementById('particle-container');
      if (isMobile) return;
      document.addEventListener('mousemove', (e) => this.onMove(e));
    },

    onMove(e) {
      const now = Date.now();
      if (now - this.lastTime < 50) return;
      this.lastTime = now;
      if (this.count >= this.maxParticles) return;

      const type = currentScreen >= 3 ? 'heart' : 'sparkle';
      const chars = this.particleTypes[type];
      const char = chars[Math.floor(Math.random() * chars.length)];

      const el = document.createElement('span');
      el.className = 'particle';
      el.textContent = char;
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
      el.style.color = `hsl(${330 + Math.random() * 30}, 80%, ${60 + Math.random() * 20}%)`;

      this.container.appendChild(el);
      this.count++;

      el.addEventListener('animationend', () => {
        el.remove();
        this.count--;
      });
    }
  };

  // ==================== TILT 3D ====================
  const tilt3D = {
    init() {
      if (isMobile) return;
      document.querySelectorAll('.tilt-el').forEach((el) => {
        if (el._tiltBound) return;
        el._tiltBound = true;
        el.addEventListener('mousemove', (e) => this.handleTilt(e, el));
        el.addEventListener('mouseleave', () => this.resetTilt(el));
      });
    },

    handleTilt(e, el) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 20;
      const rotateY = (x - 0.5) * 20;

      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;

      const shine = el.querySelector('.hero-shine, .gallery-shine');
      if (shine) {
        shine.style.backgroundPosition = `${x * 100}% ${y * 100}%`;
      }
    },

    resetTilt(el) {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    }
  };

  // ==================== MAGNETIC ELEMENTS ====================
  const magnetic = {
    init() {
      if (isMobile) return;
      document.querySelectorAll('.magnetic-el').forEach((el) => {
        if (el._magneticBound) return;
        el._magneticBound = true;
        el.addEventListener('mousemove', (e) => this.attract(e, el));
        el.addEventListener('mouseleave', () => this.release(el));
      });
    },

    attract(e, el) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      el.style.transform = `translate(${dx * 0.15}px, ${dy * 0.15}px)`;
      el.style.transition = 'transform 0.2s ease-out';
    },

    release(el) {
      el.style.transform = 'translate(0,0)';
    }
  };

  // ==================== GLOW BORDER ====================
  const glowBorder = {
    init() {
      if (isMobile) return;
      document.querySelectorAll('.glass-card').forEach((card) => {
        if (card._glowBound) return;
        card._glowBound = true;
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--card-glow-x', x + 'px');
          card.style.setProperty('--card-glow-y', y + 'px');
        });
      });
    }
  };

  // ==================== SCREEN MANAGER ====================
  const screenManager = {
    screens: [],

    init() {
      this.screens = document.querySelectorAll('.screen');
    },

    goTo(index) {
      this.screens.forEach((s) => s.classList.remove('active'));
      if (this.screens[index]) {
        this.screens[index].classList.add('active');
        currentScreen = index;
        this.onScreenEnter(index);
      }
    },

    onScreenEnter(index) {
      switch (index) {
        case 0: introScreen.start(); break;
        case 1: landingScreen.start(); break;
        case 2: scannerScreen.start(); break;
        case 3: resultScreen.start(); break;
        case 4: galleryScreen.start(); break;
        case 5: finalScreen.start(); break;
      }
      setTimeout(() => {
        tilt3D.init();
        magnetic.init();
        glowBorder.init();
      }, 200);
    }
  };

  // ==================== MÀN 0: INTRO ====================
  const introScreen = {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
    target: 'ĐANG KHỞI ĐỘNG HỆ THỐNG...',

    start() {
      this.scramble();
      setTimeout(() => screenManager.goTo(1), 2800);
    },

    scramble() {
      const el = document.getElementById('scramble-text');
      if (!el) return;
      let iteration = 0;
      const interval = setInterval(() => {
        el.textContent = this.target
          .split('')
          .map((char, idx) => {
            if (idx < iteration) return this.target[idx];
            return this.chars[Math.floor(Math.random() * this.chars.length)];
          })
          .join('');

        iteration += 1 / 3;
        if (iteration >= this.target.length) clearInterval(interval);
      }, 40);
    }
  };

  // ==================== MÀN 1: LANDING ====================
  const landingScreen = {
    typewriterText: 'Chào mừng Vân Khanh đến với Trung Tâm Kiểm Định Đặc Biệt',
    rejectCount: 0,
    started: false,

    start() {
      if (this.started) return;
      this.started = true;
      this.typewrite();
      this.createPetals();
      this.setupButtons();
      this.setupParallax();
    },

    typewrite() {
      const el = document.getElementById('typewriter-title');
      if (!el) return;
      let i = 0;
      const cursor = document.createElement('span');
      cursor.className = 'typewriter-cursor';
      el.appendChild(cursor);

      const interval = setInterval(() => {
        el.textContent = this.typewriterText.substring(0, i);
        el.appendChild(cursor);
        i++;
        if (i > this.typewriterText.length) clearInterval(interval);
      }, 50);
    },

    createPetals() {
      const container = document.getElementById('petal-container');
      if (!container) return;
      for (let i = 0; i < 18; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = (5 + Math.random() * 8) + 's';
        petal.style.animationDelay = Math.random() * 5 + 's';
        petal.style.width = (8 + Math.random() * 8) + 'px';
        petal.style.height = petal.style.width;
        petal.style.opacity = 0.3 + Math.random() * 0.4;
        container.appendChild(petal);
      }
    },

    setupButtons() {
      const btnAccept = document.getElementById('btn-accept');
      const btnReject = document.getElementById('btn-reject');
      const rejectMsg = document.getElementById('reject-msg');

      if (btnAccept) {
        btnAccept.addEventListener('click', () => this.showQuiz());
      }

      if (btnReject) {
        const dodge = (e) => {
          if (this.rejectCount < 4) {
            e.preventDefault();
            btnReject.style.position = 'fixed';
            const maxX = window.innerWidth - btnReject.offsetWidth - 20;
            const maxY = window.innerHeight - btnReject.offsetHeight - 20;
            btnReject.style.left = Math.max(20, Math.random() * maxX) + 'px';
            btnReject.style.top = Math.max(20, Math.random() * maxY) + 'px';
          }
        };

        btnReject.addEventListener('click', (e) => {
          this.rejectCount++;
          if (this.rejectCount >= 4) {
            btnReject.style.display = 'none';
            if (rejectMsg) rejectMsg.style.display = 'block';
          } else {
            dodge(e);
          }
        });

        btnReject.addEventListener('mouseenter', (e) => {
          if (!isMobile) dodge(e);
        });
      }
    },

    setupParallax() {
      if (isMobile) return;
      const bg = document.querySelector('#landing-bg img');
      if (!bg) return;
      document.addEventListener('mousemove', (e) => {
        if (currentScreen !== 1) return;
        const dx = (e.clientX / window.innerWidth - 0.5) * -20;
        const dy = (e.clientY / window.innerHeight - 0.5) * -20;
        bg.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    },

    showQuiz() {
      const landing = document.getElementById('landing-content');
      const quiz = document.getElementById('quiz-content');
      if (landing) {
        landing.style.opacity = '0';
        landing.style.transition = 'opacity 0.5s ease';
        setTimeout(() => { landing.style.display = 'none'; }, 500);
      }
      if (quiz) {
        setTimeout(() => {
          quiz.style.display = 'flex';
          quiz.style.opacity = '0';
          quiz.style.transition = 'opacity 0.5s ease';
          requestAnimationFrame(() => { quiz.style.opacity = '1'; });
        }, 500);
      }
      setTimeout(() => quizManager.start(), 600);
    }
  };

  // ==================== QUIZ ====================
  const quizManager = {
    currentQ: 0,
    questions: [
      {
        q: 'Vân Khanh ơi, bạn có biết hôm nay là ngày gì không?',
        options: [
          { text: 'Ngày 8/3 chứ gì', feedback: 'Chính xác! Thông minh quá đi~', expression: 'happy', image: 'images/cat_opt1.jpg' },
          { text: 'Không biết', feedback: 'Gợi ý: Conan cũng biết đáp án này mà, Khanh ơi~', expression: 'shock', image: 'images/cat_opt2.jpg' }
        ]
      },
      {
        q: 'Nếu Doraemon có bảo bối "Máy đo mức xinh", kết quả của bạn sẽ là?',
        options: [
          { text: 'Chắc cũng xinh lắm!', feedback: 'Hệ thống xác nhận: MÁY ĐO ĐÃ NỔ TUNG! 💥', expression: 'shock', image: 'images/cat_opt3.jpg' },
          { text: 'Không dám nhận', feedback: 'Hệ thống phản đối: Doraemon đã xác minh — BẠN XINH! ✨', expression: 'love', image: 'images/cat_opt4.jpg' }
        ]
      },
      {
        q: 'Bạn có đồng ý rằng người gửi link này rất đáng yêu không?',
        options: [
          { text: 'Đồng ý', feedback: 'Đáp án chính xác. Thám tử Conan cũng approve! 🔍', expression: 'happy', image: 'images/cat_opt5.jpg' },
          { text: 'Để suy nghĩ đã', feedback: 'Hệ thống sẽ chờ... nhưng sự thật chỉ có một, và đáp án là CÓ 💕', expression: 'love', image: 'images/cat_opt6.jpg' }
        ]
      }
    ],

    start() {
      this.currentQ = 0;
      this.showQuestion();
    },

    showQuestion() {
      const q = this.questions[this.currentQ];
      const questionEl = document.getElementById('quiz-question');
      const optionsEl = document.getElementById('quiz-options');
      const feedbackEl = document.getElementById('quiz-feedback');

      if (!questionEl || !optionsEl) return;

      feedbackEl.style.display = 'none';
      questionEl.textContent = q.q;
      optionsEl.innerHTML = '';

      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        
        // Tạo container chứa ảnh và text để style dễ hơn
        btn.innerHTML = `
          <div class="quiz-option-img" style="background-image: url('${opt.image}')"></div>
          <div class="quiz-option-text">${(idx === 0 ? 'A: ' : 'B: ') + opt.text}</div>
        `;
        
        btn.addEventListener('click', () => this.answer(btn, opt.feedback, opt.expression));
        optionsEl.appendChild(btn);
      });
    },

    answer(btn, feedback, expression) {
      const feedbackEl = document.getElementById('quiz-feedback');
      const optionsEl = document.getElementById('quiz-options');
      if (!feedbackEl || !optionsEl) return;

      feedbackEl.style.display = 'block';
      feedbackEl.textContent = feedback;
      
      btn.classList.add('selected');

      optionsEl.querySelectorAll('button').forEach((b) => {
        b.disabled = true;
      });

      // Spawn Cat Meme Effect
      this.spawnCatMemeEffect(expression);

      setTimeout(() => {
        this.currentQ++;
        if (this.currentQ < this.questions.length) {
          const inner = document.querySelector('.quiz-inner');
          const card = document.getElementById('quiz-card');
          if (inner) inner.style.opacity = '0';
          if (card) card.style.transform = 'scale(0.95) rotateY(90deg)';
          
          setTimeout(() => {
            this.showQuestion();
            if (card) card.style.transform = 'scale(1) rotateY(0deg)';
            if (inner) inner.style.opacity = '1';
          }, 300);
        } else {
          setTimeout(() => screenManager.goTo(2), 500);
        }
      }, 2500);
    },

    spawnCatMemeEffect(expression) {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '1'; // Phía sau nội dung quiz (z-index: 5)
      document.body.appendChild(container);

      let imgSrc = 'images/cat_happy.gif';
      if (expression === 'shock') imgSrc = 'images/cat_shock.gif';
      if (expression === 'love') imgSrc = 'images/cat_love.gif';

      const numParticles = 6 + Math.floor(Math.random() * 4); // 6-9 hình
      for (let i = 0; i < numParticles; i++) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'cat-meme-particle';
        
        // Random size between 100px and 160px
        const size = 100 + Math.random() * 60;
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;

        // Xuất hiện từ các cạnh (0: trên, 1: phải, 2: dưới, 3: trái)
        const edge = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;

        if (edge === 0) { // Top
          startX = Math.random() * 100;
          startY = -20;
          endX = startX + (Math.random() - 0.5) * 20;
          endY = 10 + Math.random() * 20;
        } else if (edge === 1) { // Right
          startX = 120;
          startY = Math.random() * 100;
          endX = 70 + Math.random() * 20;
          endY = startY + (Math.random() - 0.5) * 20;
        } else if (edge === 2) { // Bottom
          startX = Math.random() * 100;
          startY = 120;
          endX = startX + (Math.random() - 0.5) * 20;
          endY = 70 + Math.random() * 20;
        } else { // Left
          startX = -20;
          startY = Math.random() * 100;
          endX = 10 + Math.random() * 20;
          endY = startY + (Math.random() - 0.5) * 20;
        }

        img.style.setProperty('--start-x', `${startX}vw`);
        img.style.setProperty('--start-y', `${startY}vh`);
        img.style.setProperty('--end-x', `${endX}vw`);
        img.style.setProperty('--end-y', `${endY}vh`);
        img.style.setProperty('--rot-start', `${(Math.random() - 0.5) * 45}deg`);
        img.style.setProperty('--rot-end', `${(Math.random() - 0.5) * 60}deg`);

        // Random delay
        img.style.animationDelay = `${Math.random() * 0.4}s`;
        
        container.appendChild(img);
      }

      // Cleanup
      setTimeout(() => {
        container.remove();
      }, 4000);
    }
  };

  // ==================== MÀN 2: SCANNER ====================
  const scannerScreen = {
    terminalLines: [
      { text: '[INIT] Khởi động module nhận diện...                     ✓', type: 'normal' },
      { text: '[LOAD] Tải hồ sơ: HỒ NGỌC VÂN KHANH — ID:20082003     ✓', type: 'normal' },
      { text: '[SCAN] Đang quét nụ cười...                              ✓', type: 'normal' },
      { text: '[SCAN] Phân tích chỉ số đáng yêu...                     ✓', type: 'normal' },
      { text: '[DATA] So sánh với database nhân vật anime...             ✓', type: 'normal' },
      { text: '[WARN] Cảnh báo: chỉ số vượt cả Ran Mouri...            ⚠', type: 'warn' },
      { text: '[WARN] Đề xuất kích hoạt chế độ công chúa...             ⚠', type: 'warn' },
      { text: '[CRIT] Doraemon xác nhận: không có bảo bối nào tạo ra được phiên bản thứ 2!', type: 'crit' },
      { text: '[SYNC] Đồng bộ dữ liệu ngày 8/3...                     ✓', type: 'normal' },
      { text: '[DONE] Phân tích hoàn tất. Chuẩn bị trả kết quả...', type: 'normal' }
    ],
    started: false,

    start() {
      if (this.started) return;
      this.started = true;
      this.runProgress();
      this.runTerminal();
      this.setupSpotlight();
    },

    runProgress() {
      const fill = document.getElementById('progress-fill');
      const text = document.getElementById('progress-text');
      if (!fill || !text) return;

      const circumference = 2 * Math.PI * 90;
      fill.style.strokeDasharray = circumference;
      fill.style.strokeDashoffset = circumference;

      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        const offset = circumference - (progress / 100) * circumference;
        fill.style.strokeDashoffset = offset;
        text.textContent = progress + '%';

        if (progress >= 100) {
          clearInterval(interval);
          this.onComplete();
        }
      }, 80);
    },

    runTerminal() {
      const body = document.getElementById('terminal-body');
      if (!body) return;
      body.innerHTML = '';

      this.terminalLines.forEach((line, idx) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'terminal-line';
          if (line.type === 'warn') {
            div.innerHTML = `<span class="warn">${this.escapeHtml(line.text)}</span>`;
          } else if (line.type === 'crit') {
            div.innerHTML = `<span class="crit">${this.escapeHtml(line.text)}</span>`;
          } else {
            div.textContent = line.text;
          }
          body.appendChild(div);
          body.scrollTop = body.scrollHeight;
        }, idx * 500);
      });
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    setupSpotlight() {
      const container = document.getElementById('spotlight-container');
      const overlay = document.getElementById('spotlight-overlay');
      if (!container || !overlay || isMobile) {
        if (overlay) overlay.classList.add('revealed');
        return;
      }

      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        overlay.style.setProperty('--mouse-x', x + '%');
        overlay.style.setProperty('--mouse-y', y + '%');
      });
    },

    onComplete() {
      const overlay = document.getElementById('spotlight-overlay');
      if (overlay) overlay.classList.add('revealed');

      const flash = document.getElementById('glitch-flash');
      if (flash) {
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 600);
      }

      const transText = document.getElementById('transition-text');
      if (transText) transText.style.display = 'block';

      setTimeout(() => {
        if (transText) transText.style.display = 'none';
        screenManager.goTo(3);
      }, 1800);
    }
  };

  // ==================== MÀN 3: RESULT ====================
  const resultScreen = {
    started: false,

    start() {
      if (this.started) return;
      this.started = true;

      setTimeout(() => {
        this.animateCounters();
        this.animateBars();
        this.spawnConfetti();
      }, 300);

      const btn = document.getElementById('btn-to-gallery');
      if (btn) btn.addEventListener('click', () => screenManager.goTo(4));
    },

    animateCounters() {
      document.querySelectorAll('#screen-3 .stat-card').forEach((card) => {
        const counter = card.querySelector('.counter');
        if (!counter) return;

        const target = parseInt(counter.dataset.target, 10);
        let current = 0;
        let isHovered = false;

        card.addEventListener('mouseenter', () => isHovered = true);
        card.addEventListener('mouseleave', () => isHovered = false);

        const tick = () => {
          // Normal step vs fast step
          const step = Math.ceil(target / (isHovered ? 20 : 100));
          current += step;
          
          if (current >= target) {
            current = target;
            counter.textContent = current.toLocaleString();
            return; // stop
          }
          
          counter.textContent = current.toLocaleString();
          setTimeout(tick, 30);
        };
        
        tick();
      });
    },

    animateBars() {
      setTimeout(() => {
        document.querySelectorAll('#screen-3 .stat-bar-fill').forEach((bar) => {
          bar.classList.add('animated');
        });
        document.querySelectorAll('#screen-3 .gauge-fill').forEach((g) => {
          g.classList.add('animated');
        });
      }, 500);
    },

    spawnConfetti() {
      const container = document.getElementById('confetti-container');
      if (!container) return;

      const colors = ['#FF6B9D', '#FFB6C1', '#C084FC', '#FFD700', '#FF1493', '#FB7185'];

      for (let i = 0; i < 80; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + '%';
        conf.style.background = colors[Math.floor(Math.random() * colors.length)];
        conf.style.animationDuration = (2 + Math.random() * 3) + 's';
        conf.style.animationDelay = Math.random() * 2 + 's';

        if (Math.random() > 0.7) {
          conf.style.borderRadius = '50%';
          conf.style.width = '8px';
          conf.style.height = '8px';
        } else if (Math.random() > 0.5) {
          conf.style.width = '6px';
          conf.style.height = '12px';
        }

        container.appendChild(conf);
        conf.addEventListener('animationend', () => conf.remove());
      }
    }
  };

  // ==================== MÀN 4: GALLERY ====================
  const galleryScreen = {
    started: false,

    start() {
      if (this.started) return;
      this.started = true;
      this.setupLightbox();

      const btn = document.getElementById('btn-to-final');
      if (btn) btn.addEventListener('click', () => screenManager.goTo(5));
    },

    setupLightbox() {
      const lightbox = document.getElementById('lightbox');
      const lbImg = document.getElementById('lightbox-img');
      const lbClose = document.getElementById('lightbox-close');

      document.querySelectorAll('.polaroid-card').forEach((card) => {
        card.addEventListener('click', () => {
          const img = card.querySelector('img');
          if (lbImg) lbImg.src = img.src;
          if (lightbox) lightbox.style.display = 'flex';
        });
      });

      if (lbClose) {
        lbClose.addEventListener('click', () => {
          if (lightbox) lightbox.style.display = 'none';
        });
      }

      if (lightbox) {
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
            lightbox.style.display = 'none';
          }
        });
      }
    }
  };

  // ==================== MÀN 5: FINAL ====================
  const finalScreen = {
    started: false,

    start() {
      if (this.started) return;
      this.started = true;

      this.animateHeart();
      this.animateWishes();
      this.animateStamp();
      this.createFloatingHearts();
      this.setupModal();
    },

    animateHeart() {
      setTimeout(() => {
        const path = document.querySelector('.heart-path');
        const fill = document.querySelector('.heart-fill-path');
        if (path) path.classList.add('animate');
        if (fill) fill.classList.add('animate');
      }, 300);
    },

    animateWishes() {
      document.querySelectorAll('.wish-line').forEach((line) => {
        const delay = parseInt(line.dataset.delay, 10) || 0;
        setTimeout(() => line.classList.add('visible'), 3500 + delay * 500);
      });
    },

    animateStamp() {
      setTimeout(() => {
        const stamp = document.getElementById('stamp');
        if (stamp) stamp.classList.add('visible');
      }, 7000);
    },

    createFloatingHearts() {
      const container = document.getElementById('floating-hearts');
      if (!container) return;

      const hearts = ['♥', '♡', '💕', '💗'];
      for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (8 + Math.random() * 12) + 's';
        heart.style.animationDelay = Math.random() * 8 + 's';
        heart.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
        container.appendChild(heart);
      }

      if (!isMobile) {
        document.addEventListener('mousemove', (e) => {
          if (currentScreen !== 5) return;
          const hearts = container.querySelectorAll('.floating-heart');
          const dx = (e.clientX / window.innerWidth - 0.5) * 30;
          hearts.forEach((h, i) => {
            const factor = (i % 3 + 1) * 0.4;
            h.style.marginLeft = (dx * factor) + 'px';
          });
        });
      }
    },

    setupModal() {
      const btnSecret = document.getElementById('btn-secret');
      const modal = document.getElementById('modal-overlay');
      const btnClose = document.getElementById('btn-close-modal');

      if (btnSecret && modal) {
        btnSecret.addEventListener('click', () => {
          modal.style.display = 'flex';
        });
      }

      if (btnClose && modal) {
        btnClose.addEventListener('click', () => {
          modal.style.display = 'none';
          this.launchFireworks();
        });
      }

      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.style.display = 'none';
            this.launchFireworks();
          }
        });
      }
    },

    launchFireworks() {
      const container = document.getElementById('fireworks-container');
      if (!container) return;

      const colors = ['#FF6B9D', '#FFB6C1', '#C084FC', '#FFD700', '#FF1493'];

      for (let burst = 0; burst < 6; burst++) {
        setTimeout(() => {
          const cx = Math.random() * window.innerWidth;
          const cy = Math.random() * window.innerHeight * 0.6;
          const particleCount = 30;

          for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework';
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 60 + Math.random() * 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            particle.style.left = cx + 'px';
            particle.style.top = cy + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.boxShadow = `0 0 6px ${particle.style.background}`;
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            particle.style.animationDelay = Math.random() * 0.2 + 's';

            container.appendChild(particle);
            particle.addEventListener('animationend', () => particle.remove());
          }
        }, burst * 600);
      }
    }
  };

  // ==================== INIT ====================
  function init() {
    cursorEngine.init();
    particleTrail.init();
    screenManager.init();
    glowBorder.init();

    screenManager.goTo(0);

    setTimeout(() => {
      tilt3D.init();
      magnetic.init();
    }, 100);

    if (!isMobile) {
      heartCodeRain.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

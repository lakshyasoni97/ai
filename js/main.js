/* ═══════════════════════════════════════════════════════════
   MAIN JAVASCRIPT — Portfolio Website
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── FLOATING CHATBOT TOGGLE (commented out for now) ─────
    /*
    const chatWidget = document.getElementById('chatWidget');
    const chatFab = document.getElementById('chatFab');

    if (chatFab && chatWidget) {
        chatFab.addEventListener('click', () => {
            chatWidget.classList.toggle('open');
            // Auto-focus input when opening
            if (chatWidget.classList.contains('open')) {
                const input = document.getElementById('chatInput');
                if (input) setTimeout(() => input.focus(), 300);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && chatWidget.classList.contains('open')) {
                chatWidget.classList.remove('open');
            }
        });
    }
    */

    // ─── NAVBAR ──────────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const allNavLinks = document.querySelectorAll('.nav-link');

    // Scroll → shrink navbar
    const handleScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        updateActiveNavLink();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Active nav link on scroll
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('.section, .hero');
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });
        allNavLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }

    // ─── SCROLL REVEAL ───────────────────────────────────────
    const revealElements = document.querySelectorAll('.reveal-up');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger reveal animations
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, i * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));


    // ─── STAT COUNTER ANIMATION ──────────────────────────────
    const statNumbers = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => statObserver.observe(el));

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // ─── PARTICLE CANVAS ─────────────────────────────────────
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animFrame;

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        function createParticles() {
            particles = [];
            const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.4,
                    speedY: (Math.random() - 0.5) * 0.4,
                    opacity: Math.random() * 0.4 + 0.1,
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                // Move
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - p.x;
                    const dy = particles[j].y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });

            animFrame = requestAnimationFrame(drawParticles);
        }

        resizeCanvas();
        createParticles();
        drawParticles();

        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });
    }

    // ─── BLOG: MEDIUM RSS VIA RSS2JSON ───────────────────────
    const MEDIUM_USERNAME = 'lakshyasoni97';
    const blogGrid = document.getElementById('blogGrid');
    const blogFallback = document.getElementById('blogFallback');
    const blogCta = document.getElementById('blogCta');

    async function loadMediumPosts() {
        try {
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USERNAME}`);
            const data = await res.json();

            if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                showBlogFallback();
                return;
            }

            const posts = data.items.slice(0, 6);
            blogGrid.innerHTML = '';

            posts.forEach(post => {
                // Extract thumbnail
                let thumb = post.thumbnail;
                if (!thumb) {
                    const imgMatch = post.description.match(/<img[^>]+src="([^"]+)"/);
                    thumb = imgMatch ? imgMatch[1] : '';
                }

                // Clean excerpt
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = post.description;
                const excerpt = tempDiv.textContent.substring(0, 150).trim() + '...';

                // Format date
                const date = new Date(post.pubDate).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });

                const card = document.createElement('a');
                card.href = post.link;
                card.target = '_blank';
                card.rel = 'noopener';
                card.className = 'blog-card reveal-up revealed';
                card.innerHTML = `
                    ${thumb ? `<img src="${thumb}" alt="${post.title}" class="blog-card-thumb" loading="lazy">` : '<div class="blog-card-thumb"></div>'}
                    <div class="blog-card-body">
                        <span class="blog-card-date">${date}</span>
                        <h3 class="blog-card-title">${post.title}</h3>
                        <p class="blog-card-excerpt">${excerpt}</p>
                        <span class="blog-card-link">Read Article →</span>
                    </div>
                `;
                blogGrid.appendChild(card);
            });

            blogCta.style.display = 'block';

        } catch (err) {
            console.warn('Failed to load Medium posts:', err);
            showBlogFallback();
        }
    }

    function showBlogFallback() {
        blogGrid.style.display = 'none';
        blogFallback.style.display = 'block';
    }

    loadMediumPosts();

    // ─── AI CHATBOT WITH GEMINI API (commented out for now) ──
    /*
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatBox = document.getElementById('chatBox');
    const chatSubmit = document.getElementById('chatSubmit');

    // REPLACE THIS WITH YOUR ACTUAL GEMINI API KEY BEFORE DEPLOYMENT
    const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

    const SYSTEM_PROMPT = `
You are an AI assistant for Lakshya Soni's portfolio website. 
Lakshya is a Data Scientist specializing in Machine Learning, Generative AI, and Automation.

Key details about Lakshya:
- Experience: Data Scientist at Deloitte USI (Aug 2025 - Present), Senior Data Scientist at Network18 (Jun 2023 - Jul 2025), Data Scientist at Torrent Gas (Jul 2019 - Jul 2022).
- Education: PGP in AI & Data Science from Jio Institute (2023), B.Tech from NPTI (2019).
- Skills: Python, SQL, C++, TensorFlow, PyTorch, LangChain, Vertex AI, BigQuery, Docker.
- Highlights: Saved 3000+ man-hours/year at Network18 with automation, built multi-agent systems at Deloitte, developed CV models at Torrent Gas.

Rules:
1. Be concise, professional, and friendly.
2. Only answer questions related to Lakshya's professional background, skills, or projects.
3. If asked something unrelated, politely steer the conversation back to his resume.
4. Keep answers under 3-4 short sentences. No markdown formatting.
`;

    let conversationHistory = [];

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            addMessageToChat(message, 'user');
            chatInput.value = '';
            chatSubmit.disabled = true;

            const typingId = addTypingIndicator();

            try {
                const response = await fetchGeminiResponse(message);
                document.getElementById(typingId)?.remove();
                addMessageToChat(response, 'bot');
            } catch (error) {
                console.error("Chatbot Error:", error);
                document.getElementById(typingId)?.remove();
                addMessageToChat("Oops, something went wrong on my end. Please reach out to Lakshya directly via email!", 'bot');
            } finally {
                chatSubmit.disabled = false;
                chatInput.focus();
            }
        });
    }

    function addMessageToChat(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}-message`;

        let avatarSvg = sender === 'bot'
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4c0 4 4 6 4 6s4-2 4-6a4 4 0 0 0-4-4z"/><path d="M12 12v10"/><path d="M8 16l-4 4"/><path d="M16 16l4 4"/><path d="M4 12c2 0 4 1 4 4"/><path d="M20 12c-2 0-4 1-4 4"/></svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

        msgDiv.innerHTML = `
            <div class="message-avatar">${avatarSvg}</div>
            <div class="message-content"><p>${escapeHTML(text)}</p></div>
        `;

        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function addTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message bot-message';
        msgDiv.id = id;

        msgDiv.innerHTML = `
            <div class="message-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4c0 4 4 6 4 6s4-2 4-6a4 4 0 0 0-4-4z"/><path d="M12 12v10"/><path d="M8 16l-4 4"/><path d="M16 16l4 4"/><path d="M4 12c2 0 4 1 4 4"/><path d="M20 12c-2 0-4 1-4 4"/></svg>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
                </div>
            </div>
        `;

        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return id;
    }

    async function fetchGeminiResponse(userText) {
        if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return "Developer note: Please add your Gemini API key to main.js to enable the chatbot.";
        }

        conversationHistory.push({ role: "user", parts: [{ text: userText }] });

        const payload = {
            contents: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Understood. I will act as Lakshya's AI assistant according to those rules." }] },
                ...conversationHistory
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 250,
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API responded with ${response.status}`);

        const data = await response.json();
        const botReply = data.candidates[0].content.parts[0].text;

        conversationHistory.push({ role: "model", parts: [{ text: botReply }] });

        return botReply;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
    */

    // ─── SMOOTH SCROLL for anchor links ──────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

});

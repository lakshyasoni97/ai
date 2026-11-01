/* Lakshya Soni — site script
   Header scroll rule, dynamic header height, active nav observer,
   accessible copy-email button, and progressive Medium posts. */

const init = () => {
    // Year
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Header rule + dynamic scroll-padding-top + active section tracking
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('.nav-list a');
    const sections = [...navLinks]
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const updateHeaderHeight = () => {
        if (header) {
            document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
        }
    };
    window.addEventListener('resize', updateHeaderHeight, { passive: true });
    updateHeaderHeight();

    let clickedSection = null;
    let clickTimeout = null;

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            clickedSection = link.getAttribute('href').slice(1);
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => {
                clickedSection = null;
            }, 1000);
            updateNav();
        });
    });

    const getActiveSection = () => {
        if (clickedSection) return clickedSection;

        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const isNearBottom = (maxScroll - scrollY) <= 30;

        const contactSec = document.getElementById('contact');
        const writingSec = document.getElementById('writing');

        // Contact is at the end of the page
        if (contactSec && isNearBottom) {
            const cRect = contactSec.getBoundingClientRect();
            if (cRect.top < window.innerHeight * 0.75) return 'contact';
        }

        // Writing section is compact; check if it has entered the upper reading zone
        if (writingSec) {
            const wRect = writingSec.getBoundingClientRect();
            if (wRect.top <= (window.innerHeight * 0.45) && wRect.bottom > 80) return 'writing';
        }

        const headerH = header ? header.offsetHeight : 60;
        const focalY = headerH + 80;

        for (let i = sections.length - 1; i >= 0; i--) {
            const sec = sections[i];
            const rect = sec.getBoundingClientRect();
            if (rect.top <= focalY && rect.bottom > headerH) {
                return sec.id;
            }
        }

        const firstSec = sections[0];
        if (firstSec && firstSec.getBoundingClientRect().top > focalY) {
            return null; // in Hero / Intro
        }

        return sections[0] ? sections[0].id : null;
    };

    const updateNav = () => {
        const current = getActiveSection();
        navLinks.forEach(link => {
            const targetId = link.getAttribute('href').replace('#', '');
            if (current && targetId === current) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const onScroll = () => {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
        updateNav();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateNav();

    // Theme toggle (manual switch + persistent preference + OS sync)
    const themeToggle = document.getElementById('themeToggle');
    const themeLabel = document.getElementById('themeLabel');
    const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const getSystemTheme = () => {
        return darkQuery && darkQuery.matches ? 'dark' : 'light';
    };

    const getCurrentTheme = () => {
        const explicit = document.documentElement.getAttribute('data-theme');
        return explicit || getSystemTheme();
    };

    const updateThemeUI = (theme) => {
        if (!themeToggle || !themeLabel) return;
        const isDark = theme === 'dark';
        themeLabel.textContent = isDark ? 'light' : 'dark';
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        themeToggle.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    };

    updateThemeUI(getCurrentTheme());

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = getCurrentTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try {
                localStorage.setItem('theme', next);
            } catch (e) {}
            updateThemeUI(next);
            updateHeaderHeight();
        });
    }

    if (darkQuery) {
        const handleOSChange = (e) => {
            let stored = null;
            try {
                stored = localStorage.getItem('theme');
            } catch (err) {}
            if (!stored) {
                updateThemeUI(e.matches ? 'dark' : 'light');
            }
        };
        if (darkQuery.addEventListener) {
            darkQuery.addEventListener('change', handleOSChange);
        } else if (darkQuery.addListener) {
            darkQuery.addListener(handleOSChange);
        }
    }

    // Copy email with accessible feedback and safe fallback
    const copyBtn = document.getElementById('copyEmailBtn');
    const copyStatus = document.getElementById('copyStatus');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const email = copyBtn.dataset.email || 'lakshyasoni97@gmail.com';
            let success = false;
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(email);
                    success = true;
                } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = email;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-9999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    success = document.execCommand('copy');
                    document.body.removeChild(textArea);
                }
            } catch {
                success = false;
            }

            if (success) {
                copyBtn.textContent = 'copied';
                if (copyStatus) copyStatus.textContent = 'Email address copied to clipboard.';
                setTimeout(() => {
                    copyBtn.textContent = 'copy';
                    if (copyStatus) copyStatus.textContent = '';
                }, 2500);
            } else {
                const emailLink = document.getElementById('contactEmail');
                if (emailLink && window.getSelection) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(emailLink);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                copyBtn.textContent = 'press ⌘C';
                if (copyStatus) copyStatus.textContent = 'Email address selected. Press Control or Command C to copy.';
                setTimeout(() => {
                    copyBtn.textContent = 'copy';
                    if (copyStatus) copyStatus.textContent = '';
                }, 3000);
            }
        });
    }

    // Medium posts (via rss2json)
    // Enhances the static HTML list without showing errors if the proxy fails
    const MEDIUM_USERNAME = 'lakshyasoni97';
    const postList = document.getElementById('postList');

    async function loadPosts() {
        if (!postList) return;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(
                `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USERNAME}`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            const data = await res.json();
            if (data.status !== 'ok' || !Array.isArray(data.items) || data.items.length === 0) return;

            postList.innerHTML = '';
            data.items.slice(0, 6).forEach(post => {
                const li = document.createElement('li');
                li.className = 'post-item';

                const a = document.createElement('a');
                a.href = post.link;
                a.target = '_blank';
                a.rel = 'noopener';

                const title = document.createElement('span');
                title.className = 'post-title';
                title.textContent = post.title;

                const date = document.createElement('time');
                date.className = 'post-date';
                const d = new Date(post.pubDate.replace(' ', 'T'));
                if (!isNaN(d.getTime())) {
                    date.dateTime = d.toISOString().slice(0, 10);
                    date.textContent = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                } else {
                    date.textContent = post.pubDate;
                }

                a.append(title, date);
                li.append(a);
                postList.append(li);
            });
        } catch {
            // Static fallback remains in place
        }
    }

    loadPosts();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

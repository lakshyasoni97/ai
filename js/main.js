/* Lakshya Soni — site script
   Kept deliberately small: header rule on scroll, active nav link,
   copy-email button, and the Medium post list. */

document.addEventListener('DOMContentLoaded', () => {
    // Year
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Header rule + active section
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('.nav-list a');
    const sections = [...navLinks]
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    const onScroll = () => {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);

        let current = null;
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) current = section.id;
        });
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${current}`) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Copy email
    const copyBtn = document.getElementById('copyEmailBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const email = copyBtn.dataset.email;
            try {
                await navigator.clipboard.writeText(email);
                copyBtn.textContent = 'copied';
                setTimeout(() => { copyBtn.textContent = 'copy'; }, 2000);
            } catch {
                window.location.href = `mailto:${email}`;
            }
        });
    }

    // Medium posts (via rss2json) rendered as a plain list
    const MEDIUM_USERNAME = 'lakshyasoni97';
    const postList = document.getElementById('postList');

    async function loadPosts() {
        if (!postList) return;
        try {
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${MEDIUM_USERNAME}`);
            const data = await res.json();
            if (data.status !== 'ok' || !data.items?.length) throw new Error('No posts');

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
                date.dateTime = d.toISOString().slice(0, 10);
                date.textContent = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

                a.append(title, date);
                li.append(a);
                postList.append(li);
            });
        } catch (err) {
            postList.innerHTML = '<li class="post-loading">Couldn’t load posts right now — they’re all on Medium.</li>';
        }
    }

    loadPosts();
});

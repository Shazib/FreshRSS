/* Add a workspace heading using FreshRSS's existing, translated navigation.
 * No dependency on main.js: theme scripts can execute in either order.
 */
(() => {
	function decorate() {
		const stream = document.getElementById('stream');
		const title = stream?.querySelector(':scope > h1.title_hidden');
		if (!title || stream.querySelector('.corvus-page-heading')) return;
		const selected = document.querySelector('.aside_feed .feed.active .item-title') ||
			document.querySelector('.aside_feed .tree-folder.active .tree-folder-title .title');
		const heading = document.createElement('div');
		heading.className = 'corvus-page-heading';
		const eyebrow = document.createElement('div');
		eyebrow.className = 'corvus-view-label';
		eyebrow.textContent = 'FreshRSS / ' + title.textContent.trim();
		heading.append(eyebrow);
		title.textContent = selected?.textContent.trim() || title.textContent;
		title.classList.remove('title_hidden');
		heading.append(title);
		stream.prepend(heading);
	}
	function decorateAdmin() {
		const main = document.querySelector('main.post');
		const title = main?.querySelector(':scope > h1');
		if (!title) return;
		main.classList.add('cv-admin');
		const header = document.createElement('div');
		header.className = 'corvus-page-heading';
		const section = document.querySelector('.aside.nav-list .item.active')?.closest('.nav-section')?.querySelector('.nav-header');
		const crumb = document.createElement('div');
		crumb.className = 'corvus-view-label';
		crumb.textContent = (section?.textContent.trim() || 'FreshRSS') + ' / ' + title.textContent;
		header.append(crumb, title);
		main.prepend(header);
		const back = document.querySelector('.aside.nav-list > ul > .nav-section:first-child a');
		back?.classList.add('cv-back');
		document.querySelector('.aside.nav-list button.signout')?.classList.add('cv-signout');
	}

	function decorateLogs() {
		const filter = document.forms.log_search;
		if (!filter) return;
		const main = filter.closest('main');
		main.classList.add('cv-logs');
		const panel = document.createElement('section');
		panel.className = 'cv-log-panel';
		panel.setAttribute('aria-label', main.querySelector('h1').textContent);
		const post = main.querySelector('form[method="post"]');
		main.append(panel);
		panel.append(filter);
		if (!post) {
			const empty = main.querySelector('.alert');
			if (empty) panel.append(empty);
			return;
		}
		panel.append(post);
		const pagers = post.querySelectorAll('.nav-pagination');
		if (pagers.length > 1) filter.append(pagers[0]);
		for (const pager of main.querySelectorAll('.nav-pagination')) {
			pager.setAttribute('aria-label', 'Log pages');
			for (const item of pager.querySelectorAll('.item')) {
				if (!item.textContent.trim()) item.hidden = true;
			}
		}
		const rows = [...post.querySelectorAll('.log-item')];
		const emptyRows = [];
		for (const row of rows) {
			const level = [...row.classList].find(c => c.startsWith('log-') && c !== 'log-item')?.slice(4);
			const cell = row.querySelector('.log-level');
			if (level && cell) {
				cell.title = level;
				const badge = document.createElement('span');
				badge.className = 'cv-level';
				badge.textContent = level;
				cell.append(badge);
			}
			const time = row.querySelector('time');
			if (time) {
				const parts = time.textContent.trim().split(/\s+/);
				const date = document.createElement('span');
				date.className = 'cv-log-day';
				date.textContent = parts[0];
				const clock = document.createElement('span');
				clock.className = 'cv-log-clock';
				clock.textContent = parts.slice(1).join(' ');
				time.replaceChildren(date, clock);
			}
			const message = row.querySelector('.log-message');
			if (message && !message.textContent.trim()) {
				message.textContent = 'No message recorded';
				row.classList.add('cv-empty-log');
				emptyRows.push(row);
			}
		}
		if (emptyRows.length) {
			const label = document.createElement('label');
			label.className = 'cv-empty-toggle';
			const toggle = document.createElement('input');
			toggle.type = 'checkbox';
			toggle.checked = emptyRows.length < rows.length;
			label.append(toggle, document.createTextNode('Hide empty messages on this page (' + emptyRows.length + ')'));
			const update = () => { for (const row of emptyRows) row.hidden = toggle.checked; };
			toggle.addEventListener('change', update);
			update();
			// Outside the GET form: native server filtering never includes the local toggle.
			filter.after(label);
		}
	}

	function initialise() {
		decorate();
		decorateAdmin();
		decorateLogs();
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initialise, { once: true });
	} else {
		initialise();
	}
})();

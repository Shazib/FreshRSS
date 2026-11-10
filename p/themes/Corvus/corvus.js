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
		const main = document.querySelector('main.post, .post.extension-configure');
		const title = main?.querySelector(':scope > h1, :scope > h2');
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

	function decorateExtensions() {
		if (!document.documentElement.classList.contains('controller_extension')) return;
		const main = document.querySelector('main.post');
		if (!main) return;
		main.classList.add('cv-extensions');
		const table = main.querySelector(':scope > .table-wrapper > table');
		if (!table || table.closest('.cv-extension-panel')) return;
		table.classList.add('cv-community-table');
		const first = table.querySelector('tr');
		if (first?.querySelector('th') && !table.tHead) {
			const head = table.createTHead();
			head.append(first);
		}
		for (const th of table.querySelectorAll('th')) th.scope = 'col';
		const wrapper = table.parentElement;
		const panel = document.createElement('section');
		panel.className = 'cv-extension-panel';
		wrapper.before(panel);
		const toolbar = document.createElement('div');
		toolbar.className = 'cv-extension-toolbar';
		const search = document.createElement('input');
		search.type = 'search';
		search.placeholder = 'Search extensions';
		search.setAttribute('aria-label', 'Search community extensions');
		const count = document.createElement('span');
		count.className = 'cv-extension-count';
		count.setAttribute('aria-live', 'polite');
		const rows = [...table.querySelectorAll('tbody tr')];
		for (const row of rows) {
			// These refer to native columns before an installer adds its own columns.
			if (row.cells.length === 5) {
				row.cells[0].classList.add('cv-extension-name');
				row.cells[2].classList.add('cv-extension-author');
				row.cells[3].classList.add('cv-extension-description');
				row.cells[4].classList.add('cv-extension-compatibility');
			}
		}
		const update = () => {
			const query = search.value.trim().toLocaleLowerCase();
			let visible = 0;
			for (const row of rows) {
				row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
				if (!row.hidden) visible++;
			}
			count.textContent = visible + ' / ' + rows.length;
		};
		search.addEventListener('input', update);
		toolbar.append(search, count);
		panel.append(toolbar, wrapper);
		update();
	}

	let helpSequence = 0;
	function clarifyHelp(root) {
		for (const help of root.querySelectorAll('.help')) {
			if (!help.id) help.id = 'cv-field-help-' + (++helpSequence);
			const control = help.closest('.form-group')?.querySelector('input:not([type="hidden"]), select, textarea');
			if (control) {
				const ids = new Set((control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
				ids.add(help.id);
				control.setAttribute('aria-describedby', [...ids].join(' '));
			}
			if (help.querySelector('code') && !help.classList.contains('cv-example')) {
				help.classList.add('cv-example');
				const label = document.createElement('span');
				label.className = 'cv-example-label';
				label.textContent = 'Example — reference only';
				help.prepend(label);
			}
		}
	}

	function decorateForms() {
		document.querySelector('.aside.nav-list > ul > .nav-section:first-child a')?.classList.add('cv-back');
		const shortcuts = document.querySelector('input[name="shortcuts[normal_view]"]')?.closest('main');
		if (shortcuts && !shortcuts.classList.contains('cv-shortcuts')) {
			shortcuts.classList.add('cv-shortcuts');
			for (const row of shortcuts.querySelectorAll('.form-group')) {
				for (const help of row.querySelectorAll('.group-controls > .help')) row.append(help);
			}
			clarifyHelp(shortcuts);
		}
		for (const editor of document.querySelectorAll('#feed_update')) {
			if (editor.classList.contains('cv-feed-editor')) continue;
			editor.classList.add('cv-feed-editor', 'cv-admin');
			const title = editor.querySelector(':scope > h1');
			if (title) {
				const links = title.nextElementSibling;
				const heading = document.createElement('header');
				heading.className = 'cv-feed-heading';
				title.before(heading);
				heading.append(title);
				if (links?.tagName === 'DIV') {
					links.classList.add('cv-feed-links');
					heading.append(links);
				}
			}
			const form = editor.querySelector(':scope > form');
			if (form) {
				const groups = [...form.querySelectorAll('.form-actions')];
				const actions = groups[0];
				if (actions) {
					const submitText = actions.querySelector('button[type="submit"]')?.textContent.trim();
					const resetText = actions.querySelector('button[type="reset"]')?.textContent.trim();
					for (const duplicate of groups.slice(1)) {
						if (duplicate.querySelector('input, select, textarea, a')) continue;
						for (const button of [...duplicate.querySelectorAll('button')]) {
							if (!button.name && !button.hasAttribute('formaction') &&
								((button.type === 'submit' && button.textContent.trim() === submitText) ||
								(button.type === 'reset' && button.textContent.trim() === resetText))) button.remove();
						}
						if (!duplicate.querySelector('button')) duplicate.remove();
						else {
							duplicate.classList.remove('form-group', 'form-actions');
							duplicate.classList.add('cv-section-actions');
						}
					}
					actions.classList.add('cv-feed-actions');
					form.append(actions);
				}
			}
			for (const title of [...editor.querySelectorAll(':scope > h2')]) {
				const group = title.nextElementSibling;
				if (!group?.classList.contains('form-group')) continue;
				const section = document.createElement('section');
				section.className = 'cv-feed-tools';
				title.before(section);
				section.append(title, group);
			}
			clarifyHelp(editor);
		}
	}

	function initialise() {
		decorate();
		decorateAdmin();
		decorateLogs();
		decorateExtensions();
		decorateForms();
		document.addEventListener('freshrss:slider-load', decorateForms, true);
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initialise, { once: true });
	} else {
		initialise();
	}
})();

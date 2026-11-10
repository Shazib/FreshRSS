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
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', decorate, { once: true });
	} else {
		decorate();
	}
})();

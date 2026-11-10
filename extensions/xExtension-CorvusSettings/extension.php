<?php
declare(strict_types=1);

final class CorvusSettingsExtension extends Minz_Extension {
	/** @var array<string,string> */
	public array $values = [];
	/** @var list<string> */
	public array $errors = [];

	public const FONTS = [
		'system' => 'system-ui, -apple-system, "Segoe UI", sans-serif',
		'georgia' => 'Georgia, "Times New Roman", serif',
		'serif' => 'ui-serif, Georgia, serif',
		'arial' => 'Arial, Helvetica, sans-serif',
		'verdana' => 'Verdana, Geneva, sans-serif',
		'monospace' => 'ui-monospace, "Cascadia Code", monospace',
	];

	/** Numeric controls, grouped by their settings-page section. */
	public const FIELDS = [
		'interface' => [
			'ui_size' => ['default' => '14', 'min' => 12, 'max' => 18, 'step' => 1, 'var' => '--cv-ui-size', 'unit' => 'px'],
			'page_padding' => ['default' => '28', 'min' => 8, 'max' => 48, 'step' => 1, 'var' => '--cv-page-padding', 'unit' => 'px'],
			'section_spacing' => ['default' => '24', 'min' => 8, 'max' => 48, 'step' => 1, 'var' => '--cv-section-spacing', 'unit' => 'px'],
		],
		'reader' => [
			'article_size' => ['default' => '17', 'min' => 14, 'max' => 28, 'step' => 1, 'var' => '--cv-article-size', 'unit' => 'px'],
			'article_line' => ['default' => '1.8', 'min' => 1.3, 'max' => 2.4, 'step' => 0.1, 'var' => '--cv-article-line', 'unit' => ''],
			'reader_width' => ['default' => '0', 'min' => 0, 'max' => 1800, 'step' => 1, 'var' => '--cv-reader-width', 'unit' => 'px'],
			'article_padding' => ['default' => '56', 'min' => 12, 'max' => 80, 'step' => 1, 'var' => '--cv-article-padding', 'unit' => 'px'],
		],
		'sidebar' => [
			'sidebar_width' => ['default' => '240', 'min' => 180, 'max' => 400, 'step' => 1, 'var' => '--width-aside', 'unit' => 'px'],
			'sidebar_size' => ['default' => '13', 'min' => 11, 'max' => 18, 'step' => 1, 'var' => '--cv-sidebar-size', 'unit' => 'px'],
			'sidebar_row' => ['default' => '0', 'min' => 0, 'max' => 56, 'step' => 1, 'var' => '--cv-sidebar-row', 'unit' => 'px'],
			'sidebar_padding' => ['default' => '12', 'min' => 4, 'max' => 24, 'step' => 1, 'var' => '--cv-sidebar-padding', 'unit' => 'px'],
		],
		'list' => [
			'list_row' => ['default' => '48', 'min' => 36, 'max' => 96, 'step' => 1, 'var' => '--cv-list-row', 'unit' => 'px'],
		],
	];

	/** @return array<string,string> */
	public static function defaults(): array {
		$values = ['ui_font' => 'system', 'article_font' => 'system'];
		foreach (self::FIELDS as $fields) {
			foreach ($fields as $key => $field) {
				$values[$key] = $field['default'];
			}
		}
		return $values;
	}

	/**
	 * @param array<string,mixed> $input
	 * @return array{array<string,string>,list<string>}
	 */
	public static function validate(array $input): array {
		$values = self::defaults();
		$errors = [];
		foreach (['ui_font', 'article_font'] as $key) {
			if (is_string($input[$key] ?? null) && isset(self::FONTS[$input[$key]])) {
				$values[$key] = $input[$key];
			} else {
				$errors[] = $key;
			}
		}
		foreach (self::FIELDS as $fields) {
			foreach ($fields as $key => $field) {
				$raw = $input[$key] ?? null;
				if (!is_string($raw) || !preg_match('/^\d+(?:\.\d+)?$/D', $raw)) {
					$errors[] = $key;
					continue;
				}
				$n = (float)$raw;
				$steps = ($n - $field['min']) / $field['step'];
				if ($n < $field['min'] || $n > $field['max'] || abs($steps - round($steps)) > 0.00001
					|| ($key === 'reader_width' && $n > 0 && $n < 480)
					|| ($key === 'sidebar_row' && $n > 0 && $n < 24)) {
					$errors[] = $key;
					continue;
				}
				$values[$key] = (string)$n;
			}
		}
		return [$values, $errors];
	}

	/** @param array<string,string> $values */
	public static function stylesheet(array $values): string {
		// Validate again so even edited configuration cannot inject arbitrary CSS.
		[$values, $errors] = self::validate($values);
		if ($errors !== []) {
			return '';
		}
		$declarations = [];
		$defaults = self::defaults();
		foreach (['ui_font', 'article_font'] as $key) {
			if (isset(self::FONTS[$values[$key]])
				&& ($values[$key] !== $defaults[$key] || ($key === 'article_font' && $values['ui_font'] !== 'system'))) {
				$declarations[] = '--cv-' . str_replace('_', '-', $key) . ': ' . self::FONTS[$values[$key]] . ';';
			}
		}
		foreach (self::FIELDS as $fields) {
			foreach ($fields as $key => $field) {
				if ($values[$key] !== $defaults[$key]) {
					$declarations[] = $field['var'] . ': ' . $values[$key] . $field['unit'] . ';';
				}
			}
		}
		return $declarations === [] ? '' : ':root.theme_Corvus {' . implode(' ', $declarations) . '}';
	}

	#[\Override]
	public function init(): void {
		parent::init();
		$this->registerTranslates();
		if ($this->hasFile('style.css')) {
			// Content hash also busts the cache for two saves within the same second.
			$revision = substr(hash('sha256', $this->getFile('style.css') ?? ''), 0, 16);
			Minz_View::appendStyle($this->getFileUrl('style.css', isStatic: false) . '&amp;v=' . $revision);
		}
	}

	#[\Override]
	public function handleConfigureAction(): void {
		$this->registerTranslates();

		$stored = $this->getUserConfigurationArray('settings') ?? [];
		$saved = [];
		foreach (self::defaults() as $key => $default) {
			$saved[$key] = $stored[$key] ?? $default;
		}
		[$this->values] = self::validate($saved);
		if (!Minz_Request::isPost()) {
			return;
		}
		if (Minz_Request::paramString('preset') === 'reset') {
			$this->values = self::defaults();
		} else {
			$input = [];
			foreach (self::defaults() as $key => $unused) {
				$input[$key] = Minz_Request::paramString($key, plaintext: true);
			}
			[$values, $this->errors] = self::validate($input);
			if ($this->errors !== []) {
				return;
			}
			$this->values = $values;
		}
		$this->setUserConfigurationValue('settings', $this->values);
		$this->saveFile('style.css', self::stylesheet($this->values));
		FreshRSS_UserDAO::touch();
		Minz_Request::good(_t('feedback.conf.updated'), [
			'c' => 'extension', 'a' => 'configure', 'params' => ['e' => $this->getName()],
		]);
	}
}

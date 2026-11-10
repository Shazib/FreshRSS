<?php
declare(strict_types=1);

require dirname(__DIR__, 3) . '/constants.php';
require LIB_PATH . '/lib_rss.php';
require dirname(__DIR__) . '/extension.php';

function check(bool $condition, string $message): void {
	if (!$condition) {
		throw new RuntimeException($message);
	}
}

$defaults = CorvusSettingsExtension::defaults();
[$values, $errors] = CorvusSettingsExtension::validate($defaults);
check($errors === [], 'Defaults must validate.');
check(CorvusSettingsExtension::stylesheet($values) === '', 'Defaults must preserve responsive theme behaviour.');
foreach (['article_size' => '1; color:red', 'ui_font' => 'url(https://example.com)', 'reader_width' => '100',
	'sidebar_row' => '12', 'ui_size' => '14.5', 'article_line' => '1.85', 'page_padding' => '10000'] as $key => $bad) {
	[, $errors] = CorvusSettingsExtension::validate(array_replace($defaults, [$key => $bad]));
	check(in_array($key, $errors, true), 'Invalid value accepted: ' . $key);
}
[, $errors] = CorvusSettingsExtension::validate(array_replace($defaults, ['ui_size' => ['bad']]));
check(in_array('ui_size', $errors, true), 'Array value must be rejected.');
$custom = array_replace($defaults, ['article_font' => 'georgia', 'article_size' => '20', 'reader_width' => '1200',
	'sidebar_row' => '40', 'article_line' => '1.9']);
$css = CorvusSettingsExtension::stylesheet($custom);
check(str_contains($css, ':root.theme_Corvus'), 'Overrides must be scoped to Corvus.');
check(str_contains($css, '--cv-reader-width: 1200px'), 'Width missing.');
check(str_contains($css, '--cv-article-line: 1.9;'), 'Line height must be unitless.');
check(str_contains($css, 'Georgia'), 'Font preset missing.');
check(CorvusSettingsExtension::stylesheet(array_replace($defaults, ['ui_font' => 'bad'])) === '', 'Invalid data must not emit CSS.');
echo "PASS: defaults, bounds, steps, injection rejection and scoped CSS generation.\n";

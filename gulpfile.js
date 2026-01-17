const { src, dest } = require('gulp');

/**
 * Copy node icons to the dist folder during build
 */
function buildIcons() {
	return src('nodes/**/*.svg')
		.pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;

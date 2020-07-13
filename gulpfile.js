const {src, dest, parallel, series, watch} = require('gulp');
const browserSync  = require('browser-sync').create();
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const sass         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss     = require('gulp-clean-css');
const imagemin     = require('gulp-imagemin');
const newer        = require('gulp-newer');
const del          = require('del');


// Задача для перезагрузки страниц при изменении
function browsersync() {
    browserSync.init({
        server: { baseDir: 'app/' },
        notify: false
//   online: false, // Для работы offline
    })
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'app/js/app.js',
    ])
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream())
}

// Задача для компиляции scss файлов в css.

function styles() {
    return src('app/scss/main.scss')
    .pipe(sass())
    .pipe(concat('app.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid:true }))
    .pipe(cleancss(( { level: {1: {specialComments: 0 } }, /*format:'beautify'*/  } )))
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream())
}

// Задача для минимизации images.

function images () {
    return src('app/images/src/**/*')
    .pipe(newer('app/images/dest/'))
    .pipe(imagemin())
    .pipe(dest('app/images/dest/'))
}

function cleanimg () {
    return del('app/images/dest/**/*', { forse:true})
}

function cleandist () {
    return del('dist/**/*', { forse:true})
}

// Задача для сборки окончательного материала.

function buildcopy () {
    return src([
        'app/css/**/*.min.css',
        'app/js/**/*.min.js',
        'app/images/dest/**/*',
        'app/**/*.html',
    ], {base: 'app'})
    .pipe(dest('dist'));
}

// Задача для слежения за файлами и выполнения действий с ними

function startwatch() {
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
    watch('app/**/*.html').on('change', browserSync.reload)
    watch('app/images/src/**/*', images);
}

//Таски

exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.styles      = styles;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.build       = series(styles, scripts, images, buildcopy );

exports.default     = parallel(scripts, browsersync, startwatch);
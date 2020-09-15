/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */

'use strict';

const cssmin = require('cssmin');
const child_process = require('child_process')
const crypto = require('crypto')

module.exports = function(grunt) {
    const outputDir = 'build';

    /**
     * If this file exists then "distributeSources" task skips bump of the package version.
     * @type {string}
     */
    const BUMP_IGNORE_FILE_NAME = '.bumpignore';

    const SOURCES_FOLDER_NAME_TEMPLATE = '<%= pkg.name %>-sources-<%= pkg.version %>';
    const ARCHIVE_FILE_NAME_TEMPLATE = '<%= pkg.name %>-<%= pkg.version %>';
    const CSS_REPLACE_REGEXP = /..\/img\/icons.svg/g;

    const ORIGINAL_COMMIT_HASH_REPLACE_REGEXP = /("originalCommitHash": ")(")/g;
    const ORIGINAL_FILES_CHECKSUM_REPLACE_REGEXP = /("originalFilesChecksum": ")(")/g;

    const SRC_FILES_PATTERNS = [
        './**',
        '!./package.json',
        '!./package-lock.json',
        '!./.*',
        '!./build/**',
        '!./hybrid/**',
        '!./nvm/**',
        '!./node_modules/**',
        '!./ofsc-configuration/**',
        '!./web/**'
    ];

    const now = +(new Date());

    const gitCommitHash = getGitCommitHash();
    const isGitTreeDirty = getIsGitTreeDirty();
    const filesChecksum = getFilesChecksum();

    grunt.registerTask('autoIncrementVersion', 'Auto increment package version on every build', () => {
        grunt.task.run('bumpup:patch:' + now);
    });

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        addCopyright: {
            main: {
                files: [{
                    src: outputDir + '/main.js',
                    dest: outputDir + '/main.js'
                }, {
                    src: outputDir + '/app.css',
                    dest: outputDir + '/app.css'
                }]
            }
        },

        bumpup: {
            options: {
                updateProps: {
                    pkg: 'package.json'
                }
            },
            files: ['package.json']
        },

        clean: [outputDir],

        processhtml: {
            dist: {
                options: {
                    data: {
                        getVersion: () => grunt.config.get('pkg.version'),
                        commitHash: gitCommitHash + (isGitTreeDirty ? '.DIRTY' : ''),
                        filesChecksum: filesChecksum,
                        originalCommitHash: grunt.config.get('pkg.ofscMetadata.originalCommitHash'),
                        originalFilesChecksum: grunt.config.get('pkg.ofscMetadata.originalFilesChecksum')
                    }
                },
                files: [{
                    src: ['web/index.html'],
                    dest: outputDir + '/index.html'
                }],
            }
        },

        copy: {
            main: {
                src: "web/js/main.js",
                dest: outputDir + "/main.js"
            },
            main_offline: {
                src: "web/main-offline.js",
                dest: outputDir + "/main-offline.js"
            },
            manifest: {
                src: "web/manifest.appcache",
                dest: outputDir + "/manifest.appcache"
            },
            css_app: {
                src: "web/css/app.css",
                dest: outputDir + "/app.css",
                options: {
                    process: function (content) {
                        return cssmin(content.replace(CSS_REPLACE_REGEXP, 'icons.svg'));
                    }
                }
            },
            sprite_app: {
                src: "web/img/icons.svg",
                dest: outputDir + "/icons.svg"
            },
            sources: {
                src: SRC_FILES_PATTERNS,
                dest: outputDir + `/${SOURCES_FOLDER_NAME_TEMPLATE}/`
            },
            sources_package_json: {
                src: [
                    './package.json',
                ],
                dest: outputDir + `/${SOURCES_FOLDER_NAME_TEMPLATE}/`,
                options: {
                    process: function (content) {
                        return content
                            .replace(ORIGINAL_COMMIT_HASH_REPLACE_REGEXP, '$1' + gitCommitHash + (isGitTreeDirty ? '.DIRTY' : '') + '$2')
                            .replace(ORIGINAL_FILES_CHECKSUM_REPLACE_REGEXP, '$1' + filesChecksum + '$2');
                    }
                }
            }
        },

        compress: {
            main: {
                options: {
                    archive: outputDir + `/${ARCHIVE_FILE_NAME_TEMPLATE}.zip`
                },
                files: [
                    {
                        expand: true,
                        cwd: outputDir + '/',
                        src: [ '*.*' ],
                        dest: '/'
                    }
                ]
            },
            sources: {
                options: {
                    archive: outputDir + `/${SOURCES_FOLDER_NAME_TEMPLATE}.zip`
                },
                files: [
                    {
                        expand: true,
                        cwd: outputDir + '/',
                        src: [
                            SOURCES_FOLDER_NAME_TEMPLATE + '/**',
                            SOURCES_FOLDER_NAME_TEMPLATE + '/' + BUMP_IGNORE_FILE_NAME
                        ],
                        dest: '/'
                    }
                ]
            },
        },
        generatePluginXml: {
            options: {
                outputDir: outputDir,
                archive: outputDir + `/${ARCHIVE_FILE_NAME_TEMPLATE}.zip`
            }
        },

        generatePropertiesXml: {
            options: {
                outputDir: outputDir
            }
        }

    });

    grunt.option('platform', 'web');

    grunt.loadNpmTasks('@oracle/grunt-oraclejet');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-processhtml');

    grunt.loadTasks('grunt-tasks/generate-xml');
    grunt.loadTasks('grunt-tasks/add-copyright');

    grunt.registerTask('build', 'Public task. Calls oraclejet-build to build the oraclejet application. Can be customized with additional build tasks.', function () {
        grunt.task.run([`oraclejet-build:release`]);
    });

    grunt.registerTask('devBuild', 'Public task. Calls oraclejet-build to build the oraclejet application. Can be customized with additional build tasks.', function () {
        grunt.task.run([`oraclejet-build:dev`]);
    });

    grunt.registerTask('serve', 'Public task. Calls oraclejet-serve to serve the oraclejet application. Can be customized with additional serve tasks.', function (buildType) {
        grunt.task.run([`oraclejet-serve:${buildType}`]);
    });

    const distributeSourcesDescription = 'Copy source files and pack them into archive. ' +
        'It creates ".bumpignore" file in a copied folder and an archive';

    grunt.registerTask('distributeSources', distributeSourcesDescription, () => {
        grunt.task.run('copy:sources');
        grunt.task.run('copy:sources_package_json');

        addBumpVersionIgnore(outputDir + '/' + grunt.template.process(SOURCES_FOLDER_NAME_TEMPLATE));

        grunt.task.run('compress:sources');
    });

    grunt.registerTask('copyBuiltResources', [
        'copy:main',
        'copy:main_offline',
        'copy:manifest',
        'copy:css_app',
        'copy:sprite_app',
    ]);

    grunt.registerTask('updateManifest', 'Add to manifest service information', function() {
        const srcContent = grunt.file.read(outputDir + '/manifest.appcache');
        grunt.file.write(outputDir + '/manifest.appcache', srcContent + '\n# version ' + grunt.config.get('pkg.version') + '\n# repo-files-checksum ' + getFilesChecksum());
    });

    const distributeDescription = 'Build resources, make an archive and bump package version. \n' +
        'If ".bumpignore" file exists in the current folder then "autoIncrementVersion" would be skipped. \n' +
        'The task deletes ".bumpignore" in the current folder before finished if it exists.';

    // Internal task. Is run by 'oraclejet-build:release' task as defined in scripts/hooks/after_build.js
    grunt.registerTask('distribute', distributeDescription, function () {
        const ignoreBump = isBumpVersionIgnored();

        if (!ignoreBump) {
            grunt.task.run('autoIncrementVersion');
        }

        grunt.task.run('clean');
        grunt.task.run('processhtml');
        grunt.task.run('copyBuiltResources');
        grunt.task.run('addCopyright:main');
        grunt.task.run('updateManifest');
        grunt.task.run('compress:main');
        grunt.task.run('generateXml');

        if (ignoreBump) {
            deleteBumpVersionIgnore();
        }
    });

    /**
     * @param {String} [targetDir]
     */
    function addBumpVersionIgnore(targetDir) {
        if (targetDir) {
            grunt.file.write(targetDir + '/' + BUMP_IGNORE_FILE_NAME, null);
        } else {
            grunt.file.write(BUMP_IGNORE_FILE_NAME, null);
        }
    }

    /**
     * @param {String} [targetDir]
     */
    function deleteBumpVersionIgnore(targetDir) {
        if (targetDir) {
            grunt.file.delete(targetDir + '/' + BUMP_IGNORE_FILE_NAME);
        } else {
            grunt.file.delete(BUMP_IGNORE_FILE_NAME);
        }
    }

    /**
     * @param {String} [targetDir]
     * @returns {Boolean}
     */
    function isBumpVersionIgnored(targetDir) {
        if (targetDir) {
            return grunt.file.exists(targetDir + '/' + BUMP_IGNORE_FILE_NAME);
        } else {
            return grunt.file.exists(BUMP_IGNORE_FILE_NAME);
        }
    }

    function getIsGitTreeDirty() {

        let gitOutput;
        let changedFiles;

        try {
            gitOutput = child_process.execSync('git status --porcelain -uno', { timeout: 10000 }).toString();

            if (!gitOutput.length) {
                return false;
            }

            changedFiles = gitOutput.trim().split('\n').map(str => str.trim());
        } catch (e) {
            return true;
        }

        if (!changedFiles || changedFiles.length < 1) {
            return false;
        }

        if (changedFiles.length === 1) {
            return isDirtyStatusLine(changedFiles[0]);
        }

        return true;
    }

    function isDirtyStatusLine(statusLine) {
        return statusLine !== 'M package.json';
    }

    function getGitCommitHash() {
        try {
            const gitOutput = child_process.execSync('git rev-parse HEAD', { timeout: 10000 }).toString();

            if (!gitOutput.length) {
                return '';
            }

            return gitOutput.trim();
        } catch (e) { }

        return '';
    }

    function getFilesChecksum() {
        const filePaths = grunt.file.expand({ filter: 'isFile' },  SRC_FILES_PATTERNS);

        const fileSums = filePaths.map(path => crypto
            .createHash('sha256')
            .update(grunt.file.read(path, null))
            .digest('hex')
        );

        return crypto
            .createHash('sha256')
            .update(fileSums.join())
            .digest('hex');
    }

    grunt.registerTask('default', ['build']);
};

/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
'use strict';

const copyrightText = require('./copyright');

module.exports = (grunt) => {

    grunt.registerMultiTask('addCopyright', 'Prepend contents of passed files with a copyright note that\'s predefined in copyright.js', function () {

        this.files.forEach(function(filesItem) {

            if (filesItem.src.length > 1) {
                grunt.log.warn('Only one src file per one destination is supported.');

                return false;
            }

            const srcFilePath = filesItem.src[0];

            if (grunt.file.isDir(srcFilePath)) {
                return;
            }

            const srcContent = grunt.file.read(srcFilePath);

            grunt.file.write(filesItem.dest, copyrightText() + srcContent);

            grunt.log.writeln('File ' + filesItem.dest + ' processed.');
        });
    });
};

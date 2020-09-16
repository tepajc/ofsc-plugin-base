/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
'use strict';

const xml = require('xmlbuilder');
const crypto = require('crypto');
const config = require('./../../src/js/required-properties.json');

module.exports = (grunt) => {

    function writeXml(fileName, rootNode) {
        const xmlString = rootNode.end({ pretty: true});

        grunt.log.writeln('Writing ' + xmlString.length + ' bytes to file ' + fileName);
        grunt.file.write(fileName, xmlString);
    }

    grunt.registerTask('generateXml', ['generatePluginXml', 'generatePropertiesXml']);
    grunt.registerTask('generatePropertiesXml', 'Generate properties XML file suitable for importing to OFSC', function () {
        const outputDir = this.options().outputDir;

        const rootNode = xml.create('root');

        rootNode.ele('format', { version: config.format });
        rootNode.ele('product', { version: config.product });

        const propertiesNode = rootNode.ele('properties');

        const entityMap = {
            activity: 'appt',
            inventory: 'inventory',
            provider: 'provider'
        };

        config.properties.forEach(property => {
            if (!property.create) {
                return;
            }

            const propertyAttributes = {
                label: property.label,
                entity: entityMap[property.entity],
                type: property.type,
                gui: property.gui,
                duplicate: property.duplicate,
                line_count: property.line_count
            };

            if ('line_count' in property) {
                propertyAttributes.line_count = property.line_count;
            }

            if ('mime_types' in property) {
                propertyAttributes.mime_types = property.mime_types;
            }

            if ('file_size_limit' in property) {
                propertyAttributes.file_size_limit = property.file_size_limit;
            }

            const propertyNode = propertiesNode.ele('property', propertyAttributes);

            propertyNode.ele('names').ele('name', { lang: property.name.lang, active: property.name.active, val: property.name.val });

            if (property.lookups) {
                const lookupsNode = propertyNode.ele('lookups');
                property.lookups.forEach(lookup => {
                    lookupsNode.ele('lookup', {
                        lang: lookup.lang,
                        active: lookup.active,
                        val: lookup.val,
                        index: lookup.index
                    })
                });
            }
        });

        writeXml(outputDir + '/properties.xml', rootNode);
    });

    grunt.registerTask('generatePluginXml', 'Generate plugin XML file suitable for importing to OFSC', function () {
        const outputDir = this.options().outputDir;
        const archiveName = this.options().archive;

        const archiveContentsBuffer = new Buffer(grunt.file.read(archiveName, { encoding: null }));
        const archiveContentsBase64 = archiveContentsBuffer.toString('base64');
        const archiveHash = crypto.createHash('sha256').update(archiveContentsBuffer).digest('hex');

        let fieldNodeObjectList = [];
        let fieldsNodeObject = {
            fields: {
                field: fieldNodeObjectList
            }
        };

        config.properties.forEach( property => {

            fieldNodeObjectList.push({
                '@label': property.label,
                '@entity': property.entity
            });
        });

        const rootNode = xml.create('root');

        rootNode.ele('format', { version: config.format });
        rootNode.ele('product', { version: config.product });

        const pluginsNode = rootNode.ele('plugins');

        const pluginNode = pluginsNode.ele('plugin', { label: config.plugin.label, action_label: '', type: 'addon' });

        pluginNode.ele('translations').ele('translation', { lang: config.plugin.lang, val: config.plugin.val });
        pluginNode.ele(fieldsNodeObject);
        pluginNode
            .ele('plugin_data')
            .ele('plugin_data_item', { options: 32 })
            .ele('hosted_plugin_data', { name: config.plugin.label, content_hash: archiveHash })
            .ele('content')
            .cdata(archiveContentsBase64);

        writeXml(outputDir + '/plugins.xml', rootNode);
    });
};

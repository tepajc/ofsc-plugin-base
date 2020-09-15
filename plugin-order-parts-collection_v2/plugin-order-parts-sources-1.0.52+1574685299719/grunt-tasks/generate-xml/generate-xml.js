'use strict';

const xml = require('xmlbuilder');
const crypto = require('crypto');
const properties = require('../../src/js/property-list');

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

        rootNode.ele('format', { version: 1 });
        rootNode.ele('product', { version: '19.2.0' });

        const propertiesNode = rootNode.ele('properties');

        const entityMap = {
            1: 'appt',
            2: 'inventory',
            3: 'provider'
        };

        Object.entries(properties).forEach(([ propertyLabel, [ entity, configureForPlugin, createProperty, name ]]) => {
            if (!createProperty) {
                return;
            }

            const propertyNode = propertiesNode.ele('property', {
                label: propertyLabel,
                entity: entityMap[entity],
                type: 'string',
                gui: 'text',
                duplicate: 0,
                line_count: '1'
            });

            propertyNode.ele('names').ele('name', { lang: 'en', active: 1, val: name });
        });

        writeXml(outputDir + '/properties.xml', rootNode);
    });

    grunt.registerTask('generatePluginXml', 'Generate plugin XML file suitable for importing to OFSC', function () {
        const outputDir = this.options().outputDir;
        const archiveName = this.options().archive;
        const plugins = require('../../src/js/plugin-list');
        const defaultSecuredParams = require('./config/secured-params.json');

        if (!plugins) {
            return;
        }

        const archiveContentsBuffer = new Buffer(grunt.file.read(archiveName, { encoding: null }));
        const archiveContentsBase64 = archiveContentsBuffer.toString('base64');
        const archiveHash = crypto.createHash('sha256').update(archiveContentsBuffer).digest('hex');

        let fieldNodeObjectList = [];
        let fieldsNodeObject = {
            fields: {
                field: fieldNodeObjectList
            }
        };

        const entityMap = {
            1: 'activity',
            2: 'inventory',
            3: 'provider'
        };

        Object.entries(properties).forEach(([ propertyLabel, [ entity, configureForPlugin, createProperty, name ] ]) => {
            if (!configureForPlugin) {
                return;
            }

            fieldNodeObjectList.push({
                '@label': propertyLabel,
                '@entity': entityMap[entity]
            });
        });

        const rootNode = xml.create('root');

        rootNode.ele('format', { version: 1 });
        rootNode.ele('product', { version: '19.2.0' });

        const pluginsNode = rootNode.ele('plugins');

        Object.entries(plugins).forEach(([ pluginLabel, [ entity, name, securedParams ] ]) => {
            const pluginNode = pluginsNode.ele('plugin', { label: pluginLabel, action_label: '', type: 'addon' });

            pluginNode.ele('translations').ele('translation', { lang: 'en', val: name });
            pluginNode.ele(fieldsNodeObject);

            const securedParamsNode = pluginNode.ele('secured_params');

            Object.entries(Object.assign({}, defaultSecuredParams, securedParams)).forEach(([ paramLabel, paramValue ]) => {
                securedParamsNode.ele('secured_param', { name: paramLabel, value: paramValue });
            });

            pluginNode
                .ele('plugin_data')
                .ele('plugin_data_item', { options: 32 })
                .ele('hosted_plugin_data', { name: pluginLabel, content_hash: archiveHash })
                .ele('content')
                    .cdata(archiveContentsBase64);
        });

        writeXml(outputDir + '/plugins.xml', rootNode);
    });
};

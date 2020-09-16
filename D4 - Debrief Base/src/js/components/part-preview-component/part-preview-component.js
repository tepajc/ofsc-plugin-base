/**
 * @licence
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 * Oracle Technology Network Developer License Terms (http://www.oracle.com/technetwork/licenses/production-modify-license-2162709.html)
 */
"use strict";
define([
    'knockout',
    'text!./part-preview-component.html'
], (ko, template) => {
    class PartPreviewComponent {
        constructor({model, catalogCollection, onOpenDetails, searchRequest, showAllFields}) {
            /** @type PartModel */
            this.model = model;

            /** @type CatalogCollection */
            this.catalogCollection = catalogCollection;

            this.onOpenDetails = onOpenDetails || null;

            this.searchRequest = searchRequest || null;

            this.showAllFields = !!showAllFields;

            this.catalogName = this.catalogCollection.getByIdOrCreate(this.model.catalogId).name;

            this.previewFields = ko.pureComputed(() => {
                if (!this.catalogCollection.has(this.model.catalogId)) {
                    return [];
                }

                let catalogModel = this.catalogCollection.getByIdOrCreate(this.model.catalogId);

                return catalogModel.previewFieldSchemas.map(fieldSchema => ({
                    title: fieldSchema.name,
                    label: fieldSchema.label,
                    searchable: fieldSchema.searchable,
                    value: this.model.fields[fieldSchema.label]
                })).filter(resultFieldObject =>
                    resultFieldObject.value !== undefined
                    && resultFieldObject.value !== null
                );
            });

            this.detailFields = ko.pureComputed(() => {
                if (!this.catalogCollection.has(this.model.catalogId)) {
                    return [];
                }

                let catalogModel = this.catalogCollection.getByIdOrCreate(this.model.catalogId);

                return catalogModel.nonPreviewFieldSchemas.map(fieldSchema => ({
                    title: fieldSchema.name,
                    label: fieldSchema.label,
                    searchable: fieldSchema.searchable,
                    value: this.model.fields[fieldSchema.label]
                })).filter(resultFieldObject =>
                    resultFieldObject.value !== undefined
                    && resultFieldObject.value !== null
                );
            });

            this.previewImage = ko.pureComputed(() => {
                let images = this.model.images;
                if (images.length >= 1) {
                    return images[0];
                }
                return null;
            });

            this.noImage = ko.observable(true);
        }

        imageLoaded() {
            this.noImage(false);
        }

        openDetails(component, e) {
            if (this.onOpenDetails instanceof Function) {
                this.onOpenDetails(this.model);
            }

            e.stopPropagation();
        }

        dispose() {
            this.previewFields && this.previewFields.dispose();
            this.previewFields = null;

            this.previewImage && this.previewImage.dispose();
            this.previewImage = null;

            this.model = null;
        }
    }

    let viewModel = PartPreviewComponent;
    ko.components.register('part-preview', { viewModel, template });

    return PartPreviewComponent;
});
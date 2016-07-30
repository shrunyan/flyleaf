'use strict';

/**
 * Data model for a manga book
 * This will represent the properties of a
 * manga book in the flyleaf system. Sources
 * will need to map their data to this model.
 * @type {Object}
 */
module.exports = function getModel(data) {
    // Ensure the model contains these fields
    let model = {
        _id: '',
        title: '',
        slug: '',
        genres: '',
        hits: '',
        coverImage: '',
        lastChapterDate: '',
        status: ''
    }

    // Merge incoming data with default fields
    return Object.assign({}, model, data);
}

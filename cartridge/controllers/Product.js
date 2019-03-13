'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');

server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    var Site = require('dw/system/Site');

    var viewData = res.getViewData();
    viewData.pickUpInStore = {
        actionUrl: URLUtils.url('Stores-InventorySearch', 'showMap', false, 'horizontalView', true, 'isForm', true).toString(),
        atsActionUrl: URLUtils.url('Stores-getAtsValue').toString(),
        enabled: Site.getCurrent().getCustomPreferenceValue('enableStorePickUp')
    };
    res.setViewData(viewData);
    next();
});

module.exports = server.exports();

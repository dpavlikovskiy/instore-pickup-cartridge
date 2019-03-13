'use strict';

var addressHelpers = require('base/checkout/address');
var base = require('base/checkout/shipping');

/**
 * updates the shipping address selector within shipping forms
 * @param {Object} productLineItem - the productLineItem model
 * @param {Object} shipping - the shipping (shipment model) model
 * @param {Object} order - the order model
 * @param {Object} customer - the customer model
 */
function updateShippingAddressSelector(productLineItem, shipping, order, customer) {
    var uuidEl = $('input[value=' + productLineItem.UUID + ']');
    var shippings = order.shipping;

    var form;
    var $shippingAddressSelector;
    var hasSelectedAddress = false;

    if (uuidEl && uuidEl.length > 0) {
        form = uuidEl[0].form;
        $shippingAddressSelector = $('.addressSelector', form);
    }

    if ($shippingAddressSelector && $shippingAddressSelector.length === 1) {
        $shippingAddressSelector.empty();
        // Add New Address option
        $shippingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
            null,
            false,
            order));
        // Separator -
        $shippingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
            order.resources.shippingAddresses, false, order, { className: 'multi-shipping' }
        ));

        shippings.forEach(function (aShipping) {
            if (!aShipping.selectedShippingMethod || !aShipping.selectedShippingMethod.storePickupEnabled) {
                var isSelected = shipping.UUID === aShipping.UUID;
                hasSelectedAddress = hasSelectedAddress || isSelected;

                var addressOption = addressHelpers.methods.optionValueForAddress(
                        aShipping,
                        isSelected,
                        order,
                        { className: 'multi-shipping' }
                );
                var newAddress = addressOption.html() === order.resources.addNewAddress;
                var matchingUUID = aShipping.UUID === shipping.UUID;
                if ((newAddress && matchingUUID) || (!newAddress && matchingUUID) || (!newAddress && !matchingUUID)) {
                    $shippingAddressSelector.append(addressOption);
                }
                if (newAddress && !matchingUUID) {
                    $(addressOption[0]).remove();
                }
            }
        });
        if (customer.addresses && customer.addresses.length > 0) {
            $shippingAddressSelector.append(addressHelpers.methods.optionValueForAddress(
                order.resources.accountAddresses, false, order));
            customer.addresses.forEach(function (address) {
                var isSelected = shipping.matchingAddressId === address.ID;
                $shippingAddressSelector.append(
                    addressHelpers.methods.optionValueForAddress({
                        UUID: 'ab_' + address.ID,
                        shippingAddress: address
                    }, isSelected, order)
                );
            });
        }
    }

    if (!hasSelectedAddress) {
        // show
        $(form).addClass('hide-details');
    } else {
        $(form).removeClass('hide-details');
    }
}

/**
 * Update the shipping UI for a single shipping info (shipment model)
 * @param {Object} shipping - the shipping (shipment model) model
 * @param {Object} order - the order/basket model
 * @param {Object} customer - the customer model
 * @param {Object} [options] - options for updating PLI summary info
 * @param {Object} [options.keepOpen] - if true, prevent changing PLI view mode to 'view'
 */
function updateShippingInformation(shipping, order, customer, options) {
    // First copy over shipmentUUIDs from response, to each PLI form
    order.shipping.forEach(function (aShipping) {
        aShipping.productLineItems.items.forEach(function (productLineItem) {
            base.methods.updateProductLineItemShipmentUUIDs(productLineItem, aShipping);
        });
    });

    // Now update shipping information, based on those associations
    base.methods.updateShippingMethods(shipping);
    base.methods.updateShippingAddressFormValues(shipping);
    base.methods.updateShippingSummaryInformation(shipping, order);

    // And update the PLI-based summary information as well
    shipping.productLineItems.items.forEach(function (productLineItem) {
        updateShippingAddressSelector(productLineItem, shipping, order, customer);
        base.methods.updatePLIShippingSummaryInformation(productLineItem, shipping, order, options);
    });
}

base.methods.updateShippingInformation = updateShippingInformation;
base.methods.updateShippingAddressSelector = updateShippingAddressSelector;

module.exports = base;

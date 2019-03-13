'use strict';

var storeLocator = require('../base/storeLocator/storeLocator');

/**
 * Populate store finder html
 * @param {Object} target - Dom element that needs to be populated with store finder
 */
function loadStoreLocator(target) {
    $.ajax({
        url: target.data('url'),
        method: 'GET',
        success: function (response) {
            target.html(response.storesResultsHtml);
            storeLocator.search();
            storeLocator.changeRadius();
            storeLocator.selectStore();
            storeLocator.updateSelectStoreButton();
            if (!$('.results').data('has-results')) {
                $('.store-locator-no-results').show();
            }
        }
    });
}

/**
 * Show store locator when appropriate shipping method is selected
 * @param {Object} shippingForm - DOM element that contains current shipping form
 */
function showStoreFinder(shippingForm) {
    // hide address panel
    shippingForm
        .siblings('.shipment-selector-block')
        .addClass('d-none');

    shippingForm
        .siblings('.shipping-address-block')
        .addClass('d-none');

    shippingForm
        .siblings('.pickup-in-store')
        .empty()
        .removeClass('d-none');

    shippingForm.siblings('.change-store').addClass('d-none');

    loadStoreLocator(shippingForm.siblings('.pickup-in-store'));
}

/**
 * Show store finder in multiship
 * @param {Object} shippingForm - DOM element with current form
 */
function multishipShowStoreFinder(shippingForm) {
    shippingForm
        .siblings('.shipping-address')
        .find('.shipment-selector-block')
        .addClass('d-none')
        .end()
        .find('.shipping-address-form')
        .addClass('d-none')
        .end()
        .find('.pickup-in-store')
        .empty()
        .removeClass('d-none');

    shippingForm.siblings('.shipping-address').find('.change-store').addClass('d-none');

    loadStoreLocator(shippingForm.siblings('.shipping-address').find('.pickup-in-store'));
}

/**
 * Hide store finder and restore address form
 * @param {Object} shippingForm - DOM element with current form
 * @param {Object} data - data containing customer and order objects
 */
function hideStoreFinder(shippingForm, data) {
    if (data.customer.registeredUser) {
        if (data.customer.addresses.length) {
            shippingForm
                .siblings('.shipment-selector-block')
                .removeClass('d-none');
            if (!data.order.shipping[0].matchingAddressId) {
                shippingForm
                    .siblings('.shipping-address-block')
                    .removeClass('d-none');
            } else {
                shippingForm.closest('form').attr('data-address-mode', 'edit');
                var addressSelectorDropDown = shippingForm.siblings('.shipment-selector-block').find('.addressSelector option[value="ab_' + data.order.shipping[0].matchingAddressId + '"]');
                $(addressSelectorDropDown).prop('selected', true);
            }
        } else {
            shippingForm
                .siblings('.shipping-address-block')
                .removeClass('d-none');
        }
    } else {
        shippingForm
            .siblings('.shipping-address-block')
            .removeClass('d-none');
    }

    shippingForm
        .siblings('.pickup-in-store')
        .addClass('d-none')
        .end()
        .siblings('.change-store')
        .addClass('d-none');
    shippingForm.find('input[name="storeId"]').remove();
}

/**
 * Hide store finder for multiship and restore address form
 * @param {Object} shippingForm - DOM element with current form
 */
function hideMultishipStoreFinder(shippingForm) {
    shippingForm
        .siblings('.shipping-address')
        .find('.shipment-selector-block')
        .removeClass('d-none');

    shippingForm
        .siblings('.shipping-address')
        .find('.shipping-address-block')
        .removeClass('d-none')
        .end()
        .find('.shipping-address-form')
        .removeClass('d-none');

    shippingForm
        .siblings('.shipping-address')
        .find('.pickup-in-store')
        .addClass('d-none')
        .end()
        .find('.change-store')
        .addClass('d-none');

    shippingForm
        .siblings('.shipping-address')
        .find('.pickup-in-store')
        .find('input[name="storeId"]').remove();
}

/**
 * gets the correct shipping form
 * @param {boolean} multiShipFlag - multi ship flag
 * @param {string} shipmentUUID - shipment uuid
 * @returns {HTMLElement} the correct shipping element
 */
function getShippingForm(multiShipFlag, shipmentUUID) {
    var shippingForm = multiShipFlag
        ? $('.multi-shipping input[name="shipmentUUID"][value="' + shipmentUUID + '"]')
        : $('.single-shipping input[name="shipmentUUID"][value="' + shipmentUUID + '"]');

    return shippingForm;
}

/**
 * Handles the initial state of single shipping on page load
 */
function handleInitialSingleship() {
    var pickupSelected = $(':checked', '.shipping-method-list').data('pickup');
    var storeSelected = $('.store-details').length;
    var shippingForm = $('.single-shipping .shipping-method-list').parent().siblings();
    var storeID = storeSelected ? $('.store-details').data('store-id') : null;

    if (pickupSelected && !storeSelected) {
        showStoreFinder(shippingForm);
    } else if (pickupSelected && storeSelected) {
        shippingForm
            .siblings('.pickup-in-store')
            .removeClass('d-none')
            .append('<input type="hidden" name="storeId" value="' + storeID + '" />');

        shippingForm
            .siblings('.shipment-selector-block')
            .addClass('d-none');
    }
}

/**
 * Handles the initial state of multi-shipping on page load
 */
function handleInitialMultiship() {
    $(':checked', '.multi-shipping .shipping-method-list').each(function () {
        var pickupSelected = $(this).data('pickup');
        var shippingForm = $(this).parents('.shipping-method-block').siblings();
        var store = shippingForm.find('.store-details');
        var storeSelected = store.length;
        var storeID = storeSelected ? store.data('store-id') : null;

        if (pickupSelected && !storeSelected) {
            showStoreFinder(shippingForm);
        } else if (pickupSelected && storeSelected) {
            shippingForm
                .siblings('.pickup-in-store')
                .removeClass('d-none')
                .append('<input type="hidden" name="storeId" value="' + storeID + '" />');
        } else {
            shippingForm
                .siblings('.pickup-in-store')
                .addClass('d-none')
                .siblings('.shipping-address-block')
                .removeClass('d-none');
        }
    });
}

module.exports = {
    watchForInStoreShipping: function () {
        $('body').on('checkout:updateCheckoutView', function (e, data) {
            if (!data.urlParams || !data.urlParams.shipmentUUID) {
                if (!data.order.usingMultiShipping) {
                    var singleShipment = data.order.shipping[0];
                    $('.single-shipping .pickup-in-store').data('url', singleShipment.pickupInstoreUrl);
                    var singleShipForm = $('.single-shipping input[name="shipmentUUID"][value="' + singleShipment.UUID + '"]');
                    if (singleShipment.selectedShippingMethod.storePickupEnabled) {
                        showStoreFinder(singleShipForm);
                    } else {
                        hideStoreFinder(singleShipForm, data);
                    }
                } else {
                    data.order.shipping.forEach(function (shipment) {
                        var multiShipForm = $('.multi-shipping input[name="shipmentUUID"][value="' + shipment.UUID + '"]');
                        if (shipment.selectedShippingMethod.storePickupEnabled) {
                            multishipShowStoreFinder(multiShipForm);
                        } else {
                            hideMultishipStoreFinder(multiShipForm);
                        }
                    });
                }
                return;
            }

            var shipment = data.order.shipping.find(function (s) {
                return s.UUID === data.urlParams.shipmentUUID;
            });

            var shippingForm = getShippingForm(data.order.usingMultiShipping, shipment.UUID);

            if (data.order.usingMultiShipping) {
                shippingForm.siblings('.shipping-address').find('.pickup-in-store').data('url', shipment.pickupInstoreUrl);
            } else {
                shippingForm.siblings('.pickup-in-store').data('url', shipment.pickupInstoreUrl);
            }

            if (shipment.selectedShippingMethod.storePickupEnabled) {
                if (!data.order.usingMultiShipping) {
                    showStoreFinder(shippingForm);
                } else {
                    multishipShowStoreFinder(shippingForm);
                }
            } else if (!data.order.usingMultiShipping) {
                hideStoreFinder(shippingForm, data);
            } else {
                hideMultishipStoreFinder(shippingForm);
            }
        });
    },
    watchForStoreSelection: function () {
        $('body').on('store:selected', function (e, data) {
            var pickupInStorePanel = $(data.event.target).parents('.pickup-in-store');
            var card = pickupInStorePanel.parents('.card');
            if ($(window).scrollTop() > card.offset().top) {
                $('html, body').animate({
                    scrollTop: card.offset().top
                }, 200);
            }
            var newLabel = $(data.storeDetailsHtml);
            var content = $('<div class="selectedStore"></div>').append(newLabel)
                .append('<input type="hidden" name="storeId" value="' + data.storeID + '" />');
            pickupInStorePanel.empty().append(content);

            pickupInStorePanel.siblings('.change-store').removeClass('d-none');
        });
    },
    initialStoreMethodSelected: function () {
        $(document).ready(function () {
            var isMultiship = $('#checkout-main').hasClass('multi-ship');
            if (isMultiship) {
                handleInitialMultiship();
            } else {
                handleInitialSingleship();
            }
        });
    },
    updateAddressLabelText: function () {
        $('body').on('shipping:updateAddressLabelText', function (e, data) {
            var addressLabelText = data.selectedShippingMethod.storePickupEnabled ? data.resources.storeAddress : data.resources.shippingAddress;
            data.shippingAddressLabel.text(addressLabelText);
        });
    },
    changeStore: function () {
        $('body').on('click', '.change-store', (function () {
            showStoreFinder($(this).siblings());
            $(this).addClass('d-none');
        }));
    },
    updateAddressButtonClick: function () {
        $('body').on('click', '.btn-show-details', (function () {
            $(this).closest('.shipment-selector-block').siblings('.shipping-address-block').removeClass('d-none');
        }));
    },
    showAddressForm: function () {
        $('body').on('checkout:postUpdateCheckoutView', function (e, data) {
            var lastNameForm = data.el.closest('.shipping-address').find('.dwfrm_shipping_shippingAddress_addressFields_lastName input').val();
            if ($('#multiShipCheck').is(':checked') && !lastNameForm) {
                data.el
                .closest('form.address')
                .find('[data-action=enter]')
                .click();
            }
        });
    }
};

'use strict';

var base = module.superModule;

/**
 * Copies a raw address object to the basket billing address
 * @param {Object} address - an address-similar Object (firstName, ...)
 * @param {Object} basket - the current shopping basket
 */
function copyBillingAddressToBasket(address, basket) {
    var Transaction = require('dw/system/Transaction');
    var billingAddress = basket.billingAddress;
    // Only do copy when defaultShipment is not storepickup
    var storepickup = basket.defaultShipment.custom.shipmentType === 'instore';
    if (!storepickup) {
        Transaction.wrap(function () {
            if (!billingAddress) {
                billingAddress = basket.createBillingAddress();
            }

            billingAddress.setFirstName(address.firstName);
            billingAddress.setLastName(address.lastName);
            billingAddress.setAddress1(address.address1);
            billingAddress.setAddress2(address.address2);
            billingAddress.setCity(address.city);
            billingAddress.setPostalCode(address.postalCode);
            billingAddress.setStateCode(address.stateCode);
            billingAddress.setCountryCode(address.countryCode.value);
            if (!billingAddress.phone) {
                billingAddress.setPhone(address.phone);
            }
        });
    }
}

module.exports = {
    prepareShippingForm: base.prepareShippingForm,
    prepareBillingForm: base.prepareBillingForm,
    validateShippingForm: base.validateShippingForm,
    isShippingAddressInitialized: base.isShippingAddressInitialized,
    copyCustomerAddressToShipment: base.copyCustomerAddressToShipment,
    copyCustomerAddressToBilling: base.copyCustomerAddressToBilling,
    copyShippingAddressToShipment: base.copyShippingAddressToShipment,
    getFirstNonDefaultShipmentWithProductLineItems: base.getFirstNonDefaultShipmentWithProductLineItems,
    ensureValidShipments: base.ensureValidShipments,
    ensureNoEmptyShipments: base.ensureNoEmptyShipments,
    recalculateBasket: base.recalculateBasket,
    getProductLineItem: base.getProductLineItem,
    validateBillingForm: base.validateBillingForm,
    validateCreditCard: base.validateCreditCard,
    calculatePaymentTransaction: base.calculatePaymentTransaction,
    validatePayment: base.validatePayment,
    createOrder: base.createOrder,
    handlePayments: base.handlePayments,
    sendConfirmationEmail: base.sendConfirmationEmail,
    placeOrder: base.placeOrder,
    savePaymentInstrumentToWallet: base.savePaymentInstrumentToWallet,
    getRenderedPaymentInstruments: base.getRenderedPaymentInstruments,
    copyBillingAddressToBasket: copyBillingAddressToBasket,
    setGift: base.setGift

};

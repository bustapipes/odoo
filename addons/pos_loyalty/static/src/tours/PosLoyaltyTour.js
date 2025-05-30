/** @odoo-module **/

import { PosLoyalty } from 'pos_loyalty.tour.PosCouponTourMethods';
import { ProductScreen } from 'point_of_sale.tour.ProductScreenTourMethods';
import { getSteps, startSteps } from 'point_of_sale.tour.utils';
import Tour from 'web_tour.tour';

// --- PoS Loyalty Tour Basic Part 1 ---
// Generate coupons for PosLoyaltyTour2.
startSteps();

ProductScreen.do.confirmOpeningPopup();
ProductScreen.do.clickHomeCategory();

// basic order
// just accept the automatically applied promo program
// applied programs:
//   - on cheapest product
ProductScreen.exec.addOrderline('Whiteboard Pen', '5');
PosLoyalty.check.hasRewardLine('90% on the cheapest product', '-2.88');
PosLoyalty.do.selectRewardLine('on the cheapest product');
PosLoyalty.check.orderTotalIs('13.12');
PosLoyalty.exec.finalizeOrder('Cash');

// remove the reward from auto promo program
// no applied programs
ProductScreen.exec.addOrderline('Whiteboard Pen', '6');
PosLoyalty.check.hasRewardLine('on the cheapest product', '-2.88');
PosLoyalty.check.orderTotalIs('16.32');
PosLoyalty.exec.removeRewardLine('90% on the cheapest product');
PosLoyalty.check.orderTotalIs('19.2');
PosLoyalty.exec.finalizeOrder('Cash');

// order with coupon code from coupon program
// applied programs:
//   - coupon program
ProductScreen.exec.addOrderline('Desk Organizer', '9');
PosLoyalty.check.hasRewardLine('on the cheapest product', '-4.59');
PosLoyalty.exec.removeRewardLine('90% on the cheapest product');
PosLoyalty.check.orderTotalIs('45.90');
PosLoyalty.do.enterCode('invalid_code');
PosLoyalty.do.enterCode('1234');
PosLoyalty.check.hasRewardLine('Free Product - Desk Organizer', '-15.30');
PosLoyalty.exec.finalizeOrder('Cash');

// Use coupon but eventually remove the reward
// applied programs:
//   - on cheapest product
ProductScreen.exec.addOrderline('Letter Tray', '4');
ProductScreen.exec.addOrderline('Desk Organizer', '9');
PosLoyalty.check.hasRewardLine('90% on the cheapest product', '-4.75');
PosLoyalty.check.orderTotalIs('62.27');
PosLoyalty.do.enterCode('5678');
PosLoyalty.check.hasRewardLine('Free Product - Desk Organizer', '-15.30');
PosLoyalty.check.orderTotalIs('46.97');
PosLoyalty.exec.removeRewardLine('Free Product');
PosLoyalty.check.orderTotalIs('62.27');
PosLoyalty.exec.finalizeOrder('Cash');

// specific product discount
// applied programs:
//   - on cheapest product
//   - on specific products
ProductScreen.exec.addOrderline('Magnetic Board', '10') // 1.98
ProductScreen.exec.addOrderline('Desk Organizer', '3') // 5.1
ProductScreen.exec.addOrderline('Letter Tray', '4') // 4.8 tax 10%
PosLoyalty.check.hasRewardLine('90% on the cheapest product', '-1.78')
PosLoyalty.check.orderTotalIs('54.44')
PosLoyalty.do.enterCode('promocode')
PosLoyalty.check.hasRewardLine('50% on specific products', '-16.66') // 17.55 - 1.78*0.5
PosLoyalty.check.orderTotalIs('37.78')
PosLoyalty.exec.finalizeOrder('Cash')

Tour.register('PosLoyaltyTour1', { test: true, url: '/pos/web' }, getSteps());

// --- PoS Loyalty Tour Basic Part 2 ---
// Using the coupons generated from PosLoyaltyTour1.
startSteps();

ProductScreen.do.clickHomeCategory();

// Test that global discount and cheapest product discounts can be accumulated.
// Applied programs:
//   - global discount
//   - on cheapest discount
ProductScreen.exec.addOrderline('Desk Organizer', '10'); // 5.1
PosLoyalty.check.hasRewardLine('on the cheapest product', '-4.59');
ProductScreen.exec.addOrderline('Letter Tray', '4'); // 4.8 tax 10%
PosLoyalty.check.hasRewardLine('on the cheapest product', '-4.75');
PosLoyalty.do.enterCode('123456');
PosLoyalty.check.hasRewardLine('10% on your order', '-5.10');
PosLoyalty.check.hasRewardLine('10% on your order', '-1.64');
PosLoyalty.check.orderTotalIs('60.63'); //SUBTOTAL
PosLoyalty.exec.finalizeOrder('Cash');

// Scanning coupon twice.
// Also apply global discount on top of free product to check if the
// calculated discount is correct.
// Applied programs:
//  - coupon program (free product)
//  - global discount
//  - on cheapest discount
ProductScreen.exec.addOrderline('Desk Organizer', '11'); // 5.1 per item
PosLoyalty.check.hasRewardLine('90% on the cheapest product', '-4.59');
PosLoyalty.check.orderTotalIs('51.51');
// add global discount and the discount will be replaced
PosLoyalty.do.enterCode('345678');
PosLoyalty.check.hasRewardLine('10% on your order', '-5.15');
// add free product coupon (for qty=11, free=4)
// the discount should change after having free products
// it should go back to cheapest discount as it is higher
PosLoyalty.do.enterCode('5678');
PosLoyalty.check.hasRewardLine('Free Product - Desk Organizer', '-20.40');
PosLoyalty.check.hasRewardLine('90% on the cheapest product', '-4.59');
// set quantity to 18
// free qty stays the same since the amount of points on the card only allows for 4 free products
ProductScreen.do.pressNumpad('Backspace 8')
PosLoyalty.check.hasRewardLine('10% on your order', '-6.68');
PosLoyalty.check.hasRewardLine('Free Product - Desk Organizer', '-20.40');
// scan the code again and check notification
PosLoyalty.do.enterCode('5678');
PosLoyalty.check.orderTotalIs('60.13');
PosLoyalty.exec.finalizeOrder('Cash');

// Specific products discount (with promocode) and free product (1357)
// Applied programs:
//   - discount on specific products
//   - free product
ProductScreen.exec.addOrderline('Desk Organizer', '6'); // 5.1 per item
PosLoyalty.check.hasRewardLine('on the cheapest product', '-4.59');
PosLoyalty.exec.removeRewardLine('90% on the cheapest product');
PosLoyalty.do.enterCode('promocode');
PosLoyalty.check.hasRewardLine('50% on specific products', '-15.30');
PosLoyalty.do.enterCode('1357');
PosLoyalty.check.hasRewardLine('Free Product - Desk Organizer', '-10.20');
PosLoyalty.check.hasRewardLine('50% on specific products', '-10.20');
PosLoyalty.check.orderTotalIs('10.20');
PosLoyalty.exec.finalizeOrder('Cash');

// Check reset program
// Enter two codes and reset the programs.
// The codes should be checked afterwards. They should return to new.
// Applied programs:
//   - cheapest product
ProductScreen.exec.addOrderline('Monitor Stand', '6'); // 3.19 per item
PosLoyalty.do.enterCode('098765');
PosLoyalty.check.hasRewardLine('90% on the cheapest product', '-2.87');
PosLoyalty.check.hasRewardLine('10% on your order', '-1.63');
PosLoyalty.check.orderTotalIs('14.64');
PosLoyalty.exec.removeRewardLine('90% on the cheapest product');
PosLoyalty.check.hasRewardLine('10% on your order', '-1.91');
PosLoyalty.check.orderTotalIs('17.23');
PosLoyalty.do.resetActivePrograms();
PosLoyalty.check.hasRewardLine('90% on the cheapest product', '-2.87');
PosLoyalty.check.orderTotalIs('16.27');
PosLoyalty.exec.finalizeOrder('Cash');

Tour.register('PosLoyaltyTour2', { test: true, url: '/pos/web' }, getSteps());

// --- PoS Loyalty Tour Basic Part 3 ---

startSteps();

ProductScreen.do.confirmOpeningPopup();
ProductScreen.do.clickHomeCategory();

ProductScreen.do.clickDisplayedProduct('Promo Product');
PosLoyalty.check.orderTotalIs('34.50');
ProductScreen.do.clickDisplayedProduct('Product B');
PosLoyalty.check.hasRewardLine('100% on specific products', '25.00');
ProductScreen.do.clickDisplayedProduct('Product A');
PosLoyalty.check.hasRewardLine('100% on specific products', '15.00');
PosLoyalty.check.orderTotalIs('34.50');
ProductScreen.do.clickDisplayedProduct('Product A');
PosLoyalty.check.hasRewardLine('100% on specific products', '21.82');
PosLoyalty.check.hasRewardLine('100% on specific products', '18.18');
PosLoyalty.check.orderTotalIs('49.50');


Tour.register('PosLoyaltyTour3', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.confirmOpeningPopup();
ProductScreen.do.clickHomeCategory();

ProductScreen.exec.addOrderline('Test Product 1', '1');
ProductScreen.exec.addOrderline('Test Product 2', '1');
ProductScreen.do.clickPricelistButton();
ProductScreen.do.selectPriceList('Public Pricelist');
PosLoyalty.do.enterCode('abcda');
PosLoyalty.check.orderTotalIs('0.00');
ProductScreen.do.clickPricelistButton();
ProductScreen.do.selectPriceList('Test multi-currency');
PosLoyalty.check.orderTotalIs('0.00');

Tour.register('PosLoyaltyTour4', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.clickHomeCategory();

ProductScreen.exec.addOrderline('Test Product 1', '1.00', '100');
PosLoyalty.do.clickDiscountButton();
PosLoyalty.do.clickConfirmButton();
ProductScreen.check.totalAmountIs('92.00');

Tour.register('PosLoyaltyTour5', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.confirmOpeningPopup();
ProductScreen.do.clickHomeCategory();

ProductScreen.do.clickPartnerButton();
ProductScreen.do.clickCustomer('AAA Partner');
ProductScreen.do.clickDisplayedProduct('Test Product A');
PosLoyalty.do.clickRewardButton();
ProductScreen.check.totalAmountIs('139');

Tour.register('PosLoyaltyTour6', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.confirmOpeningPopup();
ProductScreen.do.clickHomeCategory();

ProductScreen.exec.addOrderline('Test Product', '1');
PosLoyalty.check.orderTotalIs('100');
PosLoyalty.do.enterCode('abcda');
PosLoyalty.check.orderTotalIs('90');

Tour.register('PosLoyaltyTour7', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.clickHomeCategory();
ProductScreen.do.confirmOpeningPopup();

ProductScreen.do.clickDisplayedProduct('Product B');
ProductScreen.do.clickDisplayedProduct('Product A');
ProductScreen.check.totalAmountIs('50.00');

Tour.register('PosLoyaltyTour8', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.clickHomeCategory();
ProductScreen.do.confirmOpeningPopup();

ProductScreen.do.clickPartnerButton();
ProductScreen.do.clickCustomer('AAA Partner');
ProductScreen.do.clickDisplayedProduct('Product B');
ProductScreen.do.clickDisplayedProduct('Product A');
ProductScreen.check.totalAmountIs('210.00');
PosLoyalty.check.isRewardButtonHighlighted(true);
PosLoyalty.do.clickRewardButton();
ProductScreen.check.totalAmountIs('205.00');
PosLoyalty.check.isRewardButtonHighlighted(true);
PosLoyalty.do.clickRewardButton();
ProductScreen.check.totalAmountIs('200.00');

Tour.register('PosLoyaltyTour9', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.clickHomeCategory();
ProductScreen.do.confirmOpeningPopup();

ProductScreen.do.clickPartnerButton();
ProductScreen.do.clickCustomer('AAA Partner');
ProductScreen.do.clickDisplayedProduct('Product Test');
ProductScreen.check.totalAmountIs('1.00');
PosLoyalty.check.isRewardButtonHighlighted(true);
PosLoyalty.do.claimReward('Free Product B');
PosLoyalty.check.hasRewardLine('Free Product B', '-1.00');
ProductScreen.check.totalAmountIs('1.00');
PosLoyalty.check.isRewardButtonHighlighted(false);

Tour.register('PosLoyaltyTour10', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.clickHomeCategory();
ProductScreen.do.confirmOpeningPopup();

ProductScreen.do.clickPartnerButton();
ProductScreen.do.clickCustomer('AAA Partner');
PosLoyalty.check.customerIs('AAA Partner');
ProductScreen.exec.addOrderline('Product Test', '3');
ProductScreen.check.totalAmountIs('150.00');
PosLoyalty.check.isRewardButtonHighlighted(false);
PosLoyalty.exec.finalizeOrder('Cash');

Tour.register('PosLoyaltyTour11.1', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.clickPartnerButton();
ProductScreen.do.clickCustomer('AAA Partner');
PosLoyalty.check.customerIs('AAA Partner');
ProductScreen.do.clickDisplayedProduct('Product Test');
ProductScreen.check.totalAmountIs('50.00');
PosLoyalty.check.isRewardButtonHighlighted(false);
PosLoyalty.do.enterCode('123456');
PosLoyalty.check.isRewardButtonHighlighted(true);
PosLoyalty.do.clickRewardButton();
PosLoyalty.check.hasRewardLine('Free Product', '-3.00');
PosLoyalty.check.isRewardButtonHighlighted(false);
ProductScreen.check.totalAmountIs('50.00');
PosLoyalty.exec.finalizeOrder('Cash');

Tour.register('PosLoyaltyTour11.2', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.confirmOpeningPopup();
ProductScreen.do.clickHomeCategory();

ProductScreen.exec.addOrderline('Free Product A', '2');
ProductScreen.do.clickDisplayedProduct('Free Product A');
ProductScreen.check.totalAmountIs('2.00');
PosLoyalty.check.hasRewardLine('Free Product', '-1.00');

ProductScreen.exec.addOrderline('Free Product B', '2');
ProductScreen.do.clickDisplayedProduct('Free Product B');
ProductScreen.check.totalAmountIs('4.00');
PosLoyalty.check.hasRewardLine('Free Product', '-2.00');

ProductScreen.exec.addOrderline('Free Product B', '5');
ProductScreen.do.clickDisplayedProduct('Free Product B');
ProductScreen.check.totalAmountIs('6.00');
PosLoyalty.check.hasRewardLine('Free Product', '-3.00');

Tour.register('PosLoyaltyTour12', { test: true, url: '/pos/web' }, getSteps());

startSteps();

ProductScreen.do.clickHomeCategory();
ProductScreen.do.confirmOpeningPopup();

ProductScreen.do.clickDisplayedProduct('Product A');
ProductScreen.check.selectedOrderlineHas('Product A', '1.00', '20.00');
PosLoyalty.check.orderTotalIs('20.00');

ProductScreen.do.clickDisplayedProduct('Product B');
ProductScreen.check.selectedOrderlineHas('Product B', '1.00', '30.00');
PosLoyalty.check.orderTotalIs('50.00');

ProductScreen.do.clickDisplayedProduct('Product A');
ProductScreen.check.selectedOrderlineHas('Product A', '2.00', '40.00');
PosLoyalty.check.orderTotalIs('66.00');

Tour.register('PosLoyaltyMinAmountAndSpecificProductTour', {test: true, url: '/pos/web'}, getSteps());

function createOrderCoupon(totalAmount, couponName, couponAmount, loyaltyPoints) {
    return [
        ProductScreen.do.confirmOpeningPopup(),
        ProductScreen.do.clickHomeCategory(),
        ProductScreen.do.clickPartnerButton(),
        ProductScreen.do.clickCustomer("partner_a"),
        ProductScreen.exec.addOrderline("product_a", "1"),
        ProductScreen.exec.addOrderline("product_b", "1"),
        PosLoyalty.do.enterCode("promocode"),
        PosLoyalty.check.hasRewardLine(`${couponName}`, `${couponAmount}`),
        PosLoyalty.check.orderTotalIs(`${totalAmount}`),
        PosLoyalty.check.pointsAwardedAre(`${loyaltyPoints}`),
        PosLoyalty.exec.finalizeOrder("Cash"),
    ];
}

startSteps();
createOrderCoupon("135.00", "10% on your order", "-15.00", "135");
Tour.register("PosLoyaltyPointsDiscountNoDomainProgramNoDomain", { test: true, url: "/pos/web" }, getSteps());

startSteps();
createOrderCoupon("135.00", "10% on your order", "-15.00", "100");
Tour.register("PosLoyaltyPointsDiscountNoDomainProgramDomain", { test: true, url: "/pos/web" }, getSteps());

startSteps();
createOrderCoupon("140.00", "10% on food", "-10.00", "90");
Tour.register("PosLoyaltyPointsDiscountWithDomainProgramDomain", { test: true, url: "/pos/web" }, getSteps());

startSteps();
ProductScreen.do.confirmOpeningPopup(),
ProductScreen.do.clickHomeCategory(),
ProductScreen.do.clickPartnerButton(),
ProductScreen.do.clickCustomer("partner_a"),
ProductScreen.exec.addOrderline("product_a", "1"),
PosLoyalty.check.hasRewardLine('10% on your order', '-10.00');
PosLoyalty.check.orderTotalIs('90'),
PosLoyalty.check.pointsAwardedAre("90"),
PosLoyalty.exec.finalizeOrder("Cash", "90"),
Tour.register("PosLoyaltyPointsGlobalDiscountProgramNoDomain", { test: true, url: "/pos/web" }, getSteps());

startSteps();

ProductScreen.do.clickHomeCategory();
ProductScreen.do.confirmOpeningPopup();

ProductScreen.do.clickPartnerButton();
ProductScreen.do.clickCustomer("partner_a");

ProductScreen.do.clickDisplayedProduct('Test Product A');
PosLoyalty.check.checkNoClaimableRewards();
ProductScreen.check.selectedOrderlineHas('Test Product A', '1.00', '100.00');
PosLoyalty.exec.finalizeOrder("Cash");

Tour.register('PosLoyaltyArchivedRewardProductsInactive', {test: true, url: '/pos/web'}, getSteps());

startSteps();

ProductScreen.do.clickPartnerButton();
ProductScreen.do.clickCustomer("partner_a");

ProductScreen.do.clickDisplayedProduct('Test Product A');
PosLoyalty.check.isRewardButtonHighlighted(true);
ProductScreen.check.selectedOrderlineHas('Test Product A', '1.00', '100.00');
PosLoyalty.exec.finalizeOrder("Cash");

Tour.register('PosLoyaltyArchivedRewardProductsActive', {test: true, url: '/pos/web'}, getSteps());

startSteps();

ProductScreen.do.confirmOpeningPopup();
ProductScreen.do.clickPartnerButton();
ProductScreen.do.clickCustomer("partner_a");

ProductScreen.exec.addOrderline("Test Product A", "5"),
ProductScreen.do.clickDisplayedProduct('Test Product B');
PosLoyalty.check.hasRewardLine('10% on your order', '-3.00');
PosLoyalty.check.hasRewardLine('10% on Test Product B', '-0.45');
PosLoyalty.exec.finalizeOrder("Cash");

Tour.register('PosLoyalty2DiscountsSpecificGlobal', {test: true, url: '/pos/web'}, getSteps());

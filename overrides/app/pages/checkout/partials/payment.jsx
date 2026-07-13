/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, { useState, useMemo, useEffect } from "react";
import { defineMessage, FormattedMessage, useIntl } from "react-intl";
import {
  Box,
  Button,
  Checkbox,
  Heading,
  Stack,
  Text,
  Divider,
} from "@salesforce/retail-react-app/app/components/shared/ui";
import { useForm } from "react-hook-form";
import {
  useShopperBasketsV2Mutation as useShopperBasketsMutation,
  useShopperOrdersMutation,
} from "@salesforce/commerce-sdk-react";
import useNavigation from "@salesforce/retail-react-app/app/hooks/use-navigation";
import { useCurrentBasket } from "@salesforce/retail-react-app/app/hooks/use-current-basket";
import { useCheckout } from "@salesforce/retail-react-app/app/pages/checkout/util/checkout-context";
import {
  getPaymentInstrumentCardType,
  getMaskCreditCardNumber,
} from "@salesforce/retail-react-app/app/utils/cc-utils";
import {
  ToggleCard,
  ToggleCardEdit,
  ToggleCardSummary,
} from "@salesforce/retail-react-app/app/components/toggle-card";
import ShippingAddressSelection from "@salesforce/retail-react-app/app/pages/checkout/partials/shipping-address-selection";
import AddressDisplay from "@salesforce/retail-react-app/app/components/address-display";
import {
  PromoCode,
  usePromoCode,
} from "@salesforce/retail-react-app/app/components/promo-code";
import { isPickupShipment } from "@salesforce/retail-react-app/app/utils/shipment-utils";
import AdyenPaymentComponent from "../../../components/adyen-checkout";

const Payment = () => {
  const { formatMessage } = useIntl();
  const navigate = useNavigation();
  const { data: basket } = useCurrentBasket();
  const isPickupOnly =
    basket?.shipments?.length > 0 &&
    basket.shipments.every((shipment) => isPickupShipment(shipment));
  const selectedShippingAddress = useMemo(() => {
    if (!basket?.shipments?.length || isPickupOnly) return null;
    const deliveryShipment = basket.shipments.find(
      (shipment) => !isPickupShipment(shipment)
    );
    return deliveryShipment?.shippingAddress || null;
  }, [basket?.shipments, isPickupShipment, isPickupOnly]);

  const selectedBillingAddress = basket?.billingAddress;
  const appliedPayment =
    basket?.paymentInstruments && basket?.paymentInstruments[0];
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(
    !isPickupOnly
  );
  const [adyenResult, setAdyenResult] = useState(null);
  const [adyenOrderError, setAdyenOrderError] = useState(null);
  const [isCompletingAdyenOrder, setIsCompletingAdyenOrder] = useState(false);
  const adyenAmount = Number(basket?.orderTotal ?? basket?.productTotal);

  useEffect(() => {
    if (isPickupOnly) {
      setBillingSameAsShipping(false);
    }
  }, [isPickupOnly]);

  const { mutateAsync: addPaymentInstrumentToBasket } =
    useShopperBasketsMutation("addPaymentInstrumentToBasket");
  const { mutateAsync: updateBillingAddressForBasket } =
    useShopperBasketsMutation("updateBillingAddressForBasket");
  const { mutateAsync: createOrder } = useShopperOrdersMutation("createOrder");

  const { step, STEPS, goToStep } = useCheckout();

  const billingAddressForm = useForm({
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: { ...selectedBillingAddress },
  });

  // Using destructuring to remove properties from the object...
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { removePromoCode, ...promoCodeProps } = usePromoCode();

  const onPaymentSubmit = async (formValue) => {
    // The form gives us the expiration date as `MM/YY` - so we need to split it into
    // month and year to submit them as individual fields.
    const [expirationMonth, expirationYear] = formValue.expiry.split("/");

    const paymentInstrument = {
      paymentMethodId: "CREDIT_CARD",
      paymentCard: {
        holder: formValue.holder,
        maskedNumber: getMaskCreditCardNumber(formValue.number),
        cardType: getPaymentInstrumentCardType(formValue.cardType),
        expirationMonth: parseInt(expirationMonth),
        expirationYear: parseInt(`20${expirationYear}`),
      },
    };

    return addPaymentInstrumentToBasket({
      parameters: { basketId: basket?.basketId },
      body: paymentInstrument,
    });
  };
  const onBillingSubmit = async () => {
    const isFormValid = await billingAddressForm.trigger();

    if (!isFormValid) {
      return;
    }
    const billingAddress = billingSameAsShipping
      ? selectedShippingAddress
      : billingAddressForm.getValues();
    // Using destructuring to remove properties from the object...
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { addressId, creationDate, lastModified, preferred, ...address } =
      billingAddress;
    return await updateBillingAddressForBasket({
      body: address,
      parameters: { basketId: basket.basketId },
    });
  };
  // Demo bridge only. It creates the stock PWA Kit payment instrument after
  // an Adyen authorisation; it never receives or stores Adyen card details.
  const completeAdyenDemoOrder = async (result = adyenResult) => {
    if (isCompletingAdyenOrder) return;

    setAdyenResult(result);
    setAdyenOrderError(null);
    setIsCompletingAdyenOrder(true);
    try {
      if (!appliedPayment) {
        await onPaymentSubmit({
          cardType: "mastercard",
          expiry: "03/30",
          holder: "Adyen test payment",
          number: "5454545454545454",
        });
      }

      const updatedBasket = await onBillingSubmit();
      if (!updatedBasket) {
        throw new Error(
          "Add a valid billing address before completing the demo order."
        );
      }

      const order = await createOrder({ body: { basketId: basket.basketId } });
      navigate(`/checkout/confirmation/${order.orderNo}`);
    } catch (error) {
      console.error("Adyen demo order creation error", error);
      setAdyenOrderError(
        error.message ||
          "The payment was authorised, but the demo order could not be created."
      );
    } finally {
      setIsCompletingAdyenOrder(false);
    }
  };

  const handleAdyenCompleted = (result) => completeAdyenDemoOrder(result);
  const handleAdyenFailed = () => setAdyenResult(null);

  const billingAddressAriaLabel = defineMessage({
    defaultMessage: "Billing Address Form",
    id: "checkout_payment.label.billing_address_form",
  });

  return (
    <ToggleCard
      id="step-3"
      title={formatMessage({
        defaultMessage: "Payment",
        id: "checkout_payment.title.payment",
      })}
      editing={step === STEPS.PAYMENT}
      isLoading={
        isCompletingAdyenOrder || billingAddressForm.formState.isSubmitting
      }
      disabled={appliedPayment == null}
      onEdit={() => goToStep(STEPS.PAYMENT)}
      editLabel={formatMessage({
        defaultMessage: "Edit Payment Info",
        id: "toggle_card.action.editPaymentInfo",
      })}
    >
      <ToggleCardEdit>
        <Box mt={-2} mb={4}>
          <PromoCode {...promoCodeProps} itemProps={{ border: "none" }} />
        </Box>

        <Box borderWidth="1px" borderRadius="md" borderColor="blue.200" p={4}>
          <Stack spacing={3}>
            <Heading as="h3" fontSize="md">
              Adyen Drop-in Test payment
            </Heading>
            <Text fontSize="sm" color="gray.700">
              Select a payment method below and submit it using Adyen’s own Pay
              button.
            </Text>
            {adyenResult ? (
              <Stack spacing={1} borderRadius="md" bg="green.50" p={3}>
                <Text fontSize="sm" color="green.700">
                  Adyen result: {adyenResult.resultCode || "Payment completed"}
                </Text>
                {adyenResult.merchantReference && (
                  <Text fontSize="sm" color="green.700">
                    Reference: {adyenResult.merchantReference}
                  </Text>
                )}
                {adyenResult.merchantAccount && (
                  <Text fontSize="sm" color="green.700">
                    Merchant account: {adyenResult.merchantAccount}
                  </Text>
                )}
                <Text fontSize="sm" color="green.700">
                  In Adyen Test Customer Area, switch to this merchant account,
                  then open Transactions → Payments.
                </Text>
              </Stack>
            ) : (
              <AdyenPaymentComponent
                amount={adyenAmount}
                currency={basket?.currency}
                onPaymentCompleted={handleAdyenCompleted}
                onPaymentFailed={handleAdyenFailed}
              />
            )}
          </Stack>
        </Box>

        <Stack spacing={6}>
          <Text fontSize="sm" color="gray.700">
            This demo checkout accepts payment through Adyen only. After
            authorisation, it creates the PWA Kit demo order automatically.
          </Text>

          {adyenOrderError && (
            <Stack spacing={2} borderRadius="md" bg="red.50" p={3}>
              <Text role="alert" fontSize="sm" color="red.700">
                {adyenOrderError}
              </Text>
              {adyenResult && (
                <Button
                  alignSelf="start"
                  isLoading={isCompletingAdyenOrder}
                  onClick={() => completeAdyenDemoOrder()}
                  size="sm"
                >
                  Retry demo order creation
                </Button>
              )}
            </Stack>
          )}

          <Divider borderColor="gray.100" />

          <Stack spacing={2}>
            <Heading as="h3" fontSize="md">
              <FormattedMessage
                defaultMessage="Billing Address"
                id="checkout_payment.heading.billing_address"
              />
            </Heading>

            {!isPickupOnly && (
              <Checkbox
                name="billingSameAsShipping"
                isChecked={billingSameAsShipping}
                onChange={(e) => setBillingSameAsShipping(e.target.checked)}
              >
                <Text fontSize="sm" color="gray.700">
                  <FormattedMessage
                    defaultMessage="Same as shipping address"
                    id="checkout_payment.label.same_as_shipping"
                  />
                </Text>
              </Checkbox>
            )}

            {billingSameAsShipping && selectedShippingAddress && (
              <Box pl={7}>
                <AddressDisplay address={selectedShippingAddress} />
              </Box>
            )}
          </Stack>

          {!billingSameAsShipping && (
            <ShippingAddressSelection
              form={billingAddressForm}
              selectedAddress={selectedBillingAddress}
              formTitleAriaLabel={billingAddressAriaLabel}
              hideSubmitButton
              isBillingAddress
            />
          )}
        </Stack>
      </ToggleCardEdit>

      <ToggleCardSummary>
        <Stack spacing={6}>
          <Text fontSize="sm">Adyen test payment</Text>

          {selectedBillingAddress && (
            <Stack spacing={2}>
              <Heading as="h3" fontSize="md">
                <FormattedMessage
                  defaultMessage="Billing Address"
                  id="checkout_payment.heading.billing_address"
                />
              </Heading>
              <AddressDisplay address={selectedBillingAddress} />
            </Stack>
          )}
        </Stack>
      </ToggleCardSummary>
    </ToggleCard>
  );
};

export default Payment;

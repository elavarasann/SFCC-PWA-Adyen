import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AdyenCheckout, Card, Dropin } from "@adyen/adyen-web";
import "@adyen/adyen-web/styles/adyen.css";

const AdyenPaymentComponent = ({
  amount,
  currency = "USD",
  onPaymentCompleted,
  onPaymentFailed,
}) => {
  const containerRef = useRef(null);
  const dropinRef = useRef(null);
  const emptyDropinTimerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReadyToPay, setIsReadyToPay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paymentAmount = Number(amount);
  const hasValidAmount = Number.isFinite(paymentAmount) && paymentAmount > 0;

  useEffect(() => {
    let isActive = true;

    const initializeCheckout = async () => {
      try {
        const [configResponse, sessionResponse] = await Promise.all([
          fetch("/api/adyen/config"),
          fetch("/api/adyen/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: {
                currency,
                // Adyen expects the value in the currency's minor unit.
                value: Math.round(paymentAmount * 100),
              },
              countryCode: "US",
            }),
          }),
        ]);

        if (!configResponse.ok || !sessionResponse.ok) {
          const response = !configResponse.ok
            ? configResponse
            : sessionResponse;
          const body = await response.json().catch(() => ({}));
          throw new Error(
            body.message || "Could not initialize Adyen checkout."
          );
        }

        const config = await configResponse.json();
        const session = await sessionResponse.json();
        if (!isActive || !containerRef.current) return;

        const checkout = await AdyenCheckout({
          environment: config.environment,
          clientKey: config.clientKey,
          session: { id: session.id, sessionData: session.sessionData },
          amount: { currency, value: Math.round(paymentAmount * 100) },
          countryCode: "US",
          locale: "en-US",
          onChange: (state) => {
            if (isActive) setIsReadyToPay(state.isValid);
          },
          onPaymentCompleted: (result) =>
            onPaymentCompleted?.({
              ...result,
              merchantAccount: session.merchantAccount,
              merchantReference: session.merchantReference,
            }),
          onError: (checkoutError) => {
            console.error("Adyen checkout error", checkoutError);
            setError(
              checkoutError.message || "The payment could not be completed."
            );
            setIsSubmitting(false);
            onPaymentFailed?.(checkoutError);
          },
        });

        // Adyen Web v6 uses component constructors. The legacy
        // `checkout.create('dropin')` API was removed in v6.
        dropinRef.current = new Dropin(checkout, {
          // Adyen Web v6 requires every supported payment-method
          // component to be registered with Drop-in explicitly.
          paymentMethodComponents: [Card],
          paymentMethodsConfiguration: {
            card: {
              styles: {
                base: {
                  color: "#1a202c",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "16px",
                },
                error: { color: "#c53030" },
                placeholder: { color: "#718096" },
              },
            },
          },
        });
        dropinRef.current.mount(containerRef.current);
        setLoading(false);

        // A session can be valid while the merchant account has no
        // payment method available for its country/currency. Adyen Web
        // then renders an empty container without raising an error.
        emptyDropinTimerRef.current = setTimeout(() => {
          if (isActive && !containerRef.current?.childElementCount) {
            setError(
              "Adyen returned no available payment methods. In the Adyen test Customer Area, activate Cards for this merchant account and make it available for US (or Any) and this cart currency."
            );
          }
        }, 500);
      } catch (checkoutError) {
        console.error("Adyen checkout initialization error", checkoutError);
        if (isActive) {
          setError(
            checkoutError.message || "Could not initialize Adyen checkout."
          );
          setLoading(false);
        }
      }
    };

    if (hasValidAmount) {
      initializeCheckout();
    } else {
      setLoading(false);
    }

    return () => {
      isActive = false;
      clearTimeout(emptyDropinTimerRef.current);
      dropinRef.current?.unmount?.();
      dropinRef.current = null;
    };
  }, [
    currency,
    hasValidAmount,
    onPaymentCompleted,
    onPaymentFailed,
    paymentAmount,
  ]);

  if (!hasValidAmount) {
    return (
      <div role="alert">
        Add an item to the cart before starting an Adyen payment.
      </div>
    );
  }

  const submitPayment = () => {
    if (!dropinRef.current?.isValid) {
      dropinRef.current?.showValidation();
      setError("Enter valid card details before submitting the payment.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      dropinRef.current.submit();
    } catch (submitError) {
      console.error("Adyen payment submission error", submitError);
      setError(submitError.message || "Could not submit the payment.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="adyen-pwa-dropin">
      <style>{`
                .adyen-pwa-dropin .adyen-checkout__field {
                    display: block !important;
                    width: 100% !important;
                }

                .adyen-pwa-dropin .adyen-checkout__input-wrapper {
                    background: #fff !important;
                    border: 1px solid #718096 !important;
                    border-radius: 4px !important;
                    box-sizing: border-box !important;
                    display: flex !important;
                    min-height: 44px !important;
                    overflow: hidden !important;
                    width: 100% !important;
                }

                .adyen-pwa-dropin .adyen-checkout__input {
                    box-sizing: border-box !important;
                    min-height: 42px !important;
                    padding: 0 12px !important;
                    width: 100% !important;
                }

                .adyen-pwa-dropin .adyen-checkout__input-wrapper iframe {
                    display: block !important;
                    height: 42px !important;
                    min-width: 100% !important;
                }

                .adyen-pwa-dropin .adyen-checkout__input-wrapper:focus-within {
                    border-color: #0176d3 !important;
                    box-shadow: 0 0 0 1px #0176d3 !important;
                }

                .adyen-pwa-dropin .adyen-checkout__label__text {
                    color: #1a202c !important;
                    display: block !important;
                    font-weight: 600 !important;
                    margin-bottom: 6px !important;
                }

                .adyen-pwa-dropin .adyen-checkout__error-text {
                    color: #c53030 !important;
                }

                .adyen-pwa-dropin .adyen-checkout__card__brands {
                    align-items: center !important;
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 8px !important;
                    list-style: none !important;
                    margin-top: 8px !important;
                    padding: 0 !important;
                }

                .adyen-pwa-dropin .adyen-checkout__card__brands > li {
                    list-style: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                .adyen-pwa-dropin .adyen-checkout__card__brands .adyen-checkout__image {
                    display: block !important;
                    height: 24px !important;
                    max-width: 40px !important;
                    object-fit: contain !important;
                    width: auto !important;
                }
            `}</style>
      {loading && <div>Loading Adyen test payment methods…</div>}
      {error && <div role="alert">{error}</div>}
      <div ref={containerRef} />
      <button
        type="button"
        disabled={loading || !isReadyToPay || isSubmitting}
        onClick={submitPayment}
        style={{
          background: "#0176d3",
          border: 0,
          borderRadius: "4px",
          color: "#fff",
          cursor:
            loading || !isReadyToPay || isSubmitting
              ? "not-allowed"
              : "pointer",
          fontSize: "16px",
          fontWeight: 600,
          marginTop: "16px",
          minHeight: "44px",
          opacity: loading || !isReadyToPay || isSubmitting ? 0.6 : 1,
          padding: "0 20px",
          width: "100%",
        }}
      >
        {isSubmitting
          ? "Submitting payment…"
          : `Pay ${currency} ${paymentAmount.toFixed(2)}`}
      </button>
    </div>
  );
};

export default AdyenPaymentComponent;

AdyenPaymentComponent.propTypes = {
  amount: PropTypes.number,
  currency: PropTypes.string,
  onPaymentCompleted: PropTypes.func,
  onPaymentFailed: PropTypes.func,
};

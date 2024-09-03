<?php

// File generated from our OpenAPI spec
namespace Forminator\Stripe\Util;

class ObjectTypes
{
    /**
     * @var array Mapping from object types to resource classes
     */
    const mapping = [\Forminator\Stripe\Account::OBJECT_NAME => \Forminator\Stripe\Account::class, \Forminator\Stripe\AccountLink::OBJECT_NAME => \Forminator\Stripe\AccountLink::class, \Forminator\Stripe\AlipayAccount::OBJECT_NAME => \Forminator\Stripe\AlipayAccount::class, \Forminator\Stripe\ApplePayDomain::OBJECT_NAME => \Forminator\Stripe\ApplePayDomain::class, \Forminator\Stripe\ApplicationFee::OBJECT_NAME => \Forminator\Stripe\ApplicationFee::class, \Forminator\Stripe\ApplicationFeeRefund::OBJECT_NAME => \Forminator\Stripe\ApplicationFeeRefund::class, \Forminator\Stripe\Balance::OBJECT_NAME => \Forminator\Stripe\Balance::class, \Forminator\Stripe\BalanceTransaction::OBJECT_NAME => \Forminator\Stripe\BalanceTransaction::class, \Forminator\Stripe\BankAccount::OBJECT_NAME => \Forminator\Stripe\BankAccount::class, \Forminator\Stripe\BillingPortal\Session::OBJECT_NAME => \Forminator\Stripe\BillingPortal\Session::class, \Forminator\Stripe\BitcoinReceiver::OBJECT_NAME => \Forminator\Stripe\BitcoinReceiver::class, \Forminator\Stripe\BitcoinTransaction::OBJECT_NAME => \Forminator\Stripe\BitcoinTransaction::class, \Forminator\Stripe\Capability::OBJECT_NAME => \Forminator\Stripe\Capability::class, \Forminator\Stripe\Card::OBJECT_NAME => \Forminator\Stripe\Card::class, \Forminator\Stripe\Charge::OBJECT_NAME => \Forminator\Stripe\Charge::class, \Forminator\Stripe\Checkout\Session::OBJECT_NAME => \Forminator\Stripe\Checkout\Session::class, \Forminator\Stripe\Collection::OBJECT_NAME => \Forminator\Stripe\Collection::class, \Forminator\Stripe\CountrySpec::OBJECT_NAME => \Forminator\Stripe\CountrySpec::class, \Forminator\Stripe\Coupon::OBJECT_NAME => \Forminator\Stripe\Coupon::class, \Forminator\Stripe\CreditNote::OBJECT_NAME => \Forminator\Stripe\CreditNote::class, \Forminator\Stripe\CreditNoteLineItem::OBJECT_NAME => \Forminator\Stripe\CreditNoteLineItem::class, \Forminator\Stripe\Customer::OBJECT_NAME => \Forminator\Stripe\Customer::class, \Forminator\Stripe\CustomerBalanceTransaction::OBJECT_NAME => \Forminator\Stripe\CustomerBalanceTransaction::class, \Forminator\Stripe\Discount::OBJECT_NAME => \Forminator\Stripe\Discount::class, \Forminator\Stripe\Dispute::OBJECT_NAME => \Forminator\Stripe\Dispute::class, \Forminator\Stripe\EphemeralKey::OBJECT_NAME => \Forminator\Stripe\EphemeralKey::class, \Forminator\Stripe\Event::OBJECT_NAME => \Forminator\Stripe\Event::class, \Forminator\Stripe\ExchangeRate::OBJECT_NAME => \Forminator\Stripe\ExchangeRate::class, \Forminator\Stripe\File::OBJECT_NAME => \Forminator\Stripe\File::class, \Forminator\Stripe\File::OBJECT_NAME_ALT => \Forminator\Stripe\File::class, \Forminator\Stripe\FileLink::OBJECT_NAME => \Forminator\Stripe\FileLink::class, \Forminator\Stripe\Invoice::OBJECT_NAME => \Forminator\Stripe\Invoice::class, \Forminator\Stripe\InvoiceItem::OBJECT_NAME => \Forminator\Stripe\InvoiceItem::class, \Forminator\Stripe\InvoiceLineItem::OBJECT_NAME => \Forminator\Stripe\InvoiceLineItem::class, \Forminator\Stripe\Issuing\Authorization::OBJECT_NAME => \Forminator\Stripe\Issuing\Authorization::class, \Forminator\Stripe\Issuing\Card::OBJECT_NAME => \Forminator\Stripe\Issuing\Card::class, \Forminator\Stripe\Issuing\CardDetails::OBJECT_NAME => \Forminator\Stripe\Issuing\CardDetails::class, \Forminator\Stripe\Issuing\Cardholder::OBJECT_NAME => \Forminator\Stripe\Issuing\Cardholder::class, \Forminator\Stripe\Issuing\Dispute::OBJECT_NAME => \Forminator\Stripe\Issuing\Dispute::class, \Forminator\Stripe\Issuing\Transaction::OBJECT_NAME => \Forminator\Stripe\Issuing\Transaction::class, \Forminator\Stripe\LineItem::OBJECT_NAME => \Forminator\Stripe\LineItem::class, \Forminator\Stripe\LoginLink::OBJECT_NAME => \Forminator\Stripe\LoginLink::class, \Forminator\Stripe\Mandate::OBJECT_NAME => \Forminator\Stripe\Mandate::class, \Forminator\Stripe\Order::OBJECT_NAME => \Forminator\Stripe\Order::class, \Forminator\Stripe\OrderItem::OBJECT_NAME => \Forminator\Stripe\OrderItem::class, \Forminator\Stripe\OrderReturn::OBJECT_NAME => \Forminator\Stripe\OrderReturn::class, \Forminator\Stripe\PaymentIntent::OBJECT_NAME => \Forminator\Stripe\PaymentIntent::class, \Forminator\Stripe\PaymentMethod::OBJECT_NAME => \Forminator\Stripe\PaymentMethod::class, \Forminator\Stripe\Payout::OBJECT_NAME => \Forminator\Stripe\Payout::class, \Forminator\Stripe\Person::OBJECT_NAME => \Forminator\Stripe\Person::class, \Forminator\Stripe\Plan::OBJECT_NAME => \Forminator\Stripe\Plan::class, \Forminator\Stripe\Price::OBJECT_NAME => \Forminator\Stripe\Price::class, \Forminator\Stripe\Product::OBJECT_NAME => \Forminator\Stripe\Product::class, \Forminator\Stripe\PromotionCode::OBJECT_NAME => \Forminator\Stripe\PromotionCode::class, \Forminator\Stripe\Radar\EarlyFraudWarning::OBJECT_NAME => \Forminator\Stripe\Radar\EarlyFraudWarning::class, \Forminator\Stripe\Radar\ValueList::OBJECT_NAME => \Forminator\Stripe\Radar\ValueList::class, \Forminator\Stripe\Radar\ValueListItem::OBJECT_NAME => \Forminator\Stripe\Radar\ValueListItem::class, \Forminator\Stripe\Recipient::OBJECT_NAME => \Forminator\Stripe\Recipient::class, \Forminator\Stripe\RecipientTransfer::OBJECT_NAME => \Forminator\Stripe\RecipientTransfer::class, \Forminator\Stripe\Refund::OBJECT_NAME => \Forminator\Stripe\Refund::class, \Forminator\Stripe\Reporting\ReportRun::OBJECT_NAME => \Forminator\Stripe\Reporting\ReportRun::class, \Forminator\Stripe\Reporting\ReportType::OBJECT_NAME => \Forminator\Stripe\Reporting\ReportType::class, \Forminator\Stripe\Review::OBJECT_NAME => \Forminator\Stripe\Review::class, \Forminator\Stripe\SetupAttempt::OBJECT_NAME => \Forminator\Stripe\SetupAttempt::class, \Forminator\Stripe\SetupIntent::OBJECT_NAME => \Forminator\Stripe\SetupIntent::class, \Forminator\Stripe\Sigma\ScheduledQueryRun::OBJECT_NAME => \Forminator\Stripe\Sigma\ScheduledQueryRun::class, \Forminator\Stripe\SKU::OBJECT_NAME => \Forminator\Stripe\SKU::class, \Forminator\Stripe\Source::OBJECT_NAME => \Forminator\Stripe\Source::class, \Forminator\Stripe\SourceTransaction::OBJECT_NAME => \Forminator\Stripe\SourceTransaction::class, \Forminator\Stripe\Subscription::OBJECT_NAME => \Forminator\Stripe\Subscription::class, \Forminator\Stripe\SubscriptionItem::OBJECT_NAME => \Forminator\Stripe\SubscriptionItem::class, \Forminator\Stripe\SubscriptionSchedule::OBJECT_NAME => \Forminator\Stripe\SubscriptionSchedule::class, \Forminator\Stripe\TaxId::OBJECT_NAME => \Forminator\Stripe\TaxId::class, \Forminator\Stripe\TaxRate::OBJECT_NAME => \Forminator\Stripe\TaxRate::class, \Forminator\Stripe\Terminal\ConnectionToken::OBJECT_NAME => \Forminator\Stripe\Terminal\ConnectionToken::class, \Forminator\Stripe\Terminal\Location::OBJECT_NAME => \Forminator\Stripe\Terminal\Location::class, \Forminator\Stripe\Terminal\Reader::OBJECT_NAME => \Forminator\Stripe\Terminal\Reader::class, \Forminator\Stripe\ThreeDSecure::OBJECT_NAME => \Forminator\Stripe\ThreeDSecure::class, \Forminator\Stripe\Token::OBJECT_NAME => \Forminator\Stripe\Token::class, \Forminator\Stripe\Topup::OBJECT_NAME => \Forminator\Stripe\Topup::class, \Forminator\Stripe\Transfer::OBJECT_NAME => \Forminator\Stripe\Transfer::class, \Forminator\Stripe\TransferReversal::OBJECT_NAME => \Forminator\Stripe\TransferReversal::class, \Forminator\Stripe\UsageRecord::OBJECT_NAME => \Forminator\Stripe\UsageRecord::class, \Forminator\Stripe\UsageRecordSummary::OBJECT_NAME => \Forminator\Stripe\UsageRecordSummary::class, \Forminator\Stripe\WebhookEndpoint::OBJECT_NAME => \Forminator\Stripe\WebhookEndpoint::class];
}
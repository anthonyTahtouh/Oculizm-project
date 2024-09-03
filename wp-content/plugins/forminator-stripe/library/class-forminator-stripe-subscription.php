<?php
if ( ! defined( 'ABSPATH' ) ) {
	die();
}

if ( ! class_exists( 'Forminator_Stripe_Subscription' ) ) {
	/**
	 * Subscriptions class.
	 */
	class Forminator_Stripe_Subscription {
		/**
		 * Plugin instance
		 *
		 * @var null
		 */
		private static $instance = null;

		/**
		 * API instance
		 *
		 * @var null
		 */
		public $api = null;

		/**
		 * Return the plugin instance
		 *
		 * @since 1.0
		 * @return Forminator_Stripe_Subscription
		 */
		public static function get_instance() {
			if ( is_null( self::$instance ) ) {
				self::$instance = new self();
			}

			return self::$instance;
		}

		/**
		 * Constructor.
		 *
		 * @since 1.0
		 */
		public function __construct() {
			$this->api = Forminator_Subscriptions_API_Stripe::get_instance();
			$this->api->set_stripe_key();

			add_action( 'forminator_custom_form_action_create', array( $this, 'update_products' ), 10, 5 );
			add_action( 'forminator_custom_form_action_update', array( $this, 'update_products' ), 10, 5 );
		}

		/**
		 * Handle subscription creation
		 *
		 * @since 1.0
		 *
		 * @param object $field_object Field object.
		 * @param object $custom_form  Custom form object.
		 * @param array  $submitted_data Submitted data.
		 * @param array  $field_data_array Field data array.
		 * @param object $entry Entry object.
		 * @param array  $payment_plan Payment plan data.
		 *
		 * @return array|WP_ERROR
		 */
		public function handle_subscription( $field_object, $custom_form, $submitted_data, $field_data_array, $entry, $payment_plan ) {

            $this->api->set_stripe_key( $field_data_array['mode'] );

			if ( $this->get_field_value( 'subscriptionid', $submitted_data, false ) ) {
				$subscription = $this->update_subscription( $field_object, $custom_form, $submitted_data, $field_data_array, $entry, $payment_plan );
			} else {
				$subscription = $this->create_subscription( $field_object, $custom_form, $submitted_data, $field_data_array, $entry, $payment_plan );

				if ( 'incomplete' === $subscription->status ) {
					$payment_intent = $subscription->latest_invoice->payment_intent;

					$response = array(
						'message'      => __( 'This payment require 3D Secure authentication! Please follow the instructions.', 'forminator-stripe' ),
						'success'      => false,
						'stripe3d'     => true,
						'secret'       => $payment_intent->client_secret,
						'amount'       => $payment_intent->amount,
						'subscription' => $subscription->id,
					);

					wp_send_json_error( $response );
				}
			}

			if ( 'active' === $subscription->status ) {
				$payment_intent = is_object( $subscription->latest_invoice->payment_intent ) ? $subscription->latest_invoice->payment_intent->id : $subscription->latest_invoice->payment_intent;

				return $this->update_submission( $payment_intent, $subscription, $custom_form, $submitted_data, $field_object, $field_data_array, $payment_plan );
			} elseif ( 'trialing' === $subscription->status ) {
				return $this->update_submission( 'Trialing', $subscription, $custom_form, $submitted_data, $field_object, $field_data_array, $payment_plan );
			} else {
				// Delete entry if capture is not successful.
				$entry->delete();

				return new WP_Error( 'forminator_stripe_error', __( 'Payment failed, please try again!', 'forminator-stripe' ) );
			}
		}

		/**
		 * Update Stripe products
		 *
		 * @since 1.0
		 *
		 * @param string $id Product ID.
		 * @param string $title Product Title.
		 * @param string $status Product Status.
		 * @param array  $fields Fields array.
		 * @param array  $settings Setting array.
		 */
		public function update_products( $id, $title, $status, $fields, $settings ) {
			$stripe = $this->get_stripe_field( $fields );

			if ( ! empty( $stripe['payments'] ) && is_array( $stripe['payments'] ) ) {
				$i = 0;
                $this->api->set_stripe_key( $stripe['mode'] );
                $plan_id = 'live' === $stripe['mode'] ? 'live_plan_id' : 'test_plan_id';
				$company = ! empty( $stripe['company_name'] ) ? $stripe['company_name'] : '' ;

				if ( ! empty( $company ) ) {
					if ( mb_strlen( $company ) > 22 ) {
						$company = mb_substr( $company, 0, 19 ) . '...';
					}
				}

				foreach ( $stripe['payments'] as $payment ) {
					if ( isset( $payment['payment_method'] ) && 'subscription' === $payment['payment_method'] ) {
						if ( empty( $payment[ $plan_id ] ) ) {
							$plan_name = isset( $payment['plan_name'] ) ? $payment['plan_name'] : __( 'My subscription plan', 'forminator-stripe' );

							// Create product on Stripe.
							$product = $this->api->create_product(
								array(
									'name' => $plan_name,
									'statement_descriptor' => $company,
								)
							);

							// Check for valid ID and append it to Payment plan.
							if ( ! is_wp_error( $product ) && isset( $product->id ) ) {
								$stripe['payments'][ $i ][ $plan_id ] = $product->id;
							}
						} else {
							// Retrieve plan from Stripe.
							$product = $this->api->get_product( $payment[ $plan_id ] );

							// Check if Plan name is different.
							if ( $product->name !== $payment['plan_name'] ) {

								// Update plan name on Stripe, we shouldn't update plan ID.
								$result = $this->api->update_product(
									$payment[ $plan_id ],
									array(
										'name' => $payment['plan_name'],
										'statement_descriptor' => $company,
									)
								);
							}
						}
					}

					// Update Stipe field.
					$result = Forminator_API::update_form_field( $id, $stripe['element_id'], $stripe );

					$i++;
				}
			}
		}

		/**
		 * Get stripe field from form wrappers
		 *
		 * @since 1.0
		 *
		 * @param array $wrappers Form wrappers.
		 *
		 * @return array
		 */
		public function get_stripe_field( $wrappers = array() ) {
			foreach ( $wrappers as $wrapper ) {
				if ( isset( $wrapper['fields'] ) && is_array( $wrapper['fields'] ) ) {
					foreach ( $wrapper['fields'] as $field ) {
						if ( isset( $field['type'] ) && 'stripe' === $field['type'] ) {
							return $field;
						}
					}
				}
			}

			return array();
		}

		/**
		 * Create subscription
		 *
		 * @since 1.0
		 *
		 * @param object $field_object Field object.
		 * @param object $custom_form  Custom form object.
		 * @param array  $submitted_data Submitted data.
		 * @param array  $field Field data array.
		 * @param object $entry Entry object.
		 * @param array  $payment_plan Payment plan data.
		 *
		 * @return array|WP_ERROR
		 */
		public function create_subscription( $field_object, $custom_form, $submitted_data, $field, $entry, $payment_plan ) {
			// Retrieve the payment method.
			$payment_method  = $field_object->get_paymentMethod( $field, $submitted_data );
			$metadata_object = self::subscription_metadata( $field, $custom_form );

            $plan_id = 'live' === $field['mode'] ? 'live_plan_id' : 'test_plan_id';

			$payment_description 	= $field_object::get_property( 'product_description', $field, '' );
			$company 				= $field_object::get_property( 'company_name', $field, '' );

			if ( ! empty( $company ) ) {
				$company = forminator_replace_form_data( $company );
				if ( mb_strlen( $company ) > 22 ) {
					$company = mb_substr( $company, 0, 19 ) . '...';
				}
			}

			// Check form has Product created, if not fallback and create product each time.
			if ( isset( $payment_plan[ $plan_id ] ) ) {
				// Retrieve the product.
				$plan_object = $this->api->get_product( $payment_plan[ $plan_id ] );
			} else {
				$plan_name = isset( $payment_plan['plan_name'] ) ? $payment_plan['plan_name'] : __( 'My subscription plan', 'forminator-stripe' );

				// Create product on Stripe.
				$plan_object = $this->api->create_product(
					array(
						'name' => $plan_name,
						'statement_descriptor' => $company,
					)
				);
			}

			$customer_data = array();
			if ( ! is_wp_error( $payment_method ) ) {
				$customer_data = array(
					'payment_method'   => $payment_method,
					'invoice_settings' => array(
						'default_payment_method' => $payment_method,
					),
				);
			}

			if ( ! empty( $metadata_object ) ) {
				$customer_data['metadata'] = $metadata_object;
			}

			// Retrieve billing setting.
			$billing = $field_object::get_property( 'billing', $field, false );
			$billing = filter_var( $billing, FILTER_VALIDATE_BOOLEAN );

			// If billing enabled, map fields and append to $customer_data.
			if ( $billing ) {
				// Retrieve billing data from submission.
				$billing_data = $this->get_billing_data( $field_object, $field, $submitted_data );

				// Merge billing data with customer data.
				$customer_data = array_merge( $customer_data, $billing_data );
			}

			// Create customer.
			$customer = $this->api->create_customer( $customer_data );
			$price    = $this->calculate_price( $payment_plan, $custom_form, $field_object, $submitted_data, $field );
			$currency = $this->get_currency( $field_object, $field );

			$subscription_data = array(
				'customer' => $customer->id,
				'items'    => array(
					array(
						'price_data' => array(
							'unit_amount' => $field_object->calculate_amount( $price, $currency ),
							'currency'    => $currency,
							'product'     => $plan_object->id,
							'recurring'   => $this->get_recurring( $payment_plan ),
						),
						'quantity'   => $this->get_quantity( $payment_plan, $custom_form, $field_object, $submitted_data, $field ),
					),
				),
				'expand'   => array(
					'latest_invoice.payment_intent',
				),
			);
			if ( ! empty( $metadata_object ) ) {
				$subscription_data['metadata'] = $metadata_object;
			}

			if ( ! empty( $payment_description ) ) {
				$subscription_data['description'] = forminator_replace_form_data( $payment_description );
			}

			// If we have trial settings enabled, setup trial.
			if ( $this->has_trial( $payment_plan ) ) {
				$subscription_data = $this->setup_trial( $subscription_data, $payment_plan );
			}

			// Create subscription.
			$subscription = $this->api->create_subscription( $subscription_data );

			return $subscription;
		}

		/**
		 * Create subscription
		 *
		 * @since 1.0
		 *
		 * @param object $field_object Field object.
		 * @param object $custom_form  Custom form object.
		 * @param array  $submitted_data Submitted data.
		 * @param array  $field Field data array.
		 * @param object $entry Entry object.
		 * @param array  $payment_plan Payment plan data.
		 *
		 * @return array|WP_ERROR
		 */
		public function update_subscription( $field_object, $custom_form, $submitted_data, $field, $entry, $payment_plan ) {
			// Retrieve subscription ID.
			$subscription_id = $this->get_field_value( 'subscriptionid', $submitted_data );

			// Validate subscription ID.
			if ( is_null( $subscription_id ) ) {
				return new WP_Error( 'forminator_stripe_error', __( 'Subscription ID is unknown, please try again!', 'forminator-stripe' ) );
			}

			$subscription = $this->api->get_subscription( $subscription_id );

			if ( isset( $subscription->latest_invoice ) ) {
				$subscription['latest_invoice'] = $this->api->get_invoice( $subscription->latest_invoice );
			}

			return $subscription;
		}

		/**
		 * Calculate subscription amount
		 *
		 * @since 1.0
		 *
		 * @param array  $plan Payment plan data.
		 * @param object $custom_form  Custom form object.
		 * @param object $field_object Field object.
		 * @param array  $submitted_data Submitted data.
		 * @param array  $field Field data array.
		 *
		 * @return float
		 */
		public function calculate_price( $plan, $custom_form, $field_object, $submitted_data, $field ) {
			$payment_amount  = 0.0;
			$amount_type     = isset( $plan['subscription_amount_type'] ) ? $plan['subscription_amount_type'] : 'fixed';
			$amount          = isset( $plan['subscription_amount'] ) ? $plan['subscription_amount'] : 0.0;
			$amount_variable = isset( $plan['subscription_variable'] ) ? $plan['subscription_variable'] : '';

			if ( 'fixed' === $amount_type ) {
				$payment_amount = $amount;
			} else {
				$amount_var = $amount_variable;
				$form_field = $custom_form->get_field( $amount_var, false );
				if ( $form_field ) {
					$form_field = $form_field->to_formatted_array();
					if ( isset( $form_field['type'] ) ) {
						if ( 'calculation' === $form_field['type'] ) {

							// Calculation field get the amount from pseudo_submit_data.
							if ( isset( $submitted_data[ $amount_var ] ) ) {
								$payment_amount = $submitted_data[ $amount_var ];
							}
						} elseif ( 'currency' === $form_field['type'] ) {
							// Currency field get the amount from submitted_data.
							$field_id       = $form_field['element_id'];
							$payment_amount = $field_object::forminator_replace_number( $form_field, $submitted_data[ $field_id ] );
						} else {
							$field_object = Forminator_Core::get_field_object( $form_field['type'] );
							if ( $field_object ) {
								$field_id             = $form_field['element_id'];
								$submitted_field_data = $this->get_field_value( $field_id, $submitted_data );
								$payment_amount       = $field_object::get_calculable_value( $submitted_field_data, $form_field );
							}
						}
					}
				}
			}

			if ( ! is_numeric( $payment_amount ) ) {
				$payment_amount = 0.0;
			}

			/**
			 * Filter payment amount of stripe
			 *
			 * @since 1.7
			 *
			 * @param double                       $payment_amount
			 * @param array                        $field field settings
			 * @param Forminator_Form_Model $custom_form
			 * @param array                        $submitted_data
			 */
			$payment_amount = apply_filters( 'forminator_field_stripe_payment_amount', $payment_amount, $field, $custom_form, $submitted_data );

			return $payment_amount;
		}

		/**
		 * Get subscription currency
		 *
		 * @since 1.0
		 *
		 * @param object $field_object Field object.
		 * @param array  $field Field settings.
		 *
		 * @return string
		 */
		public function get_currency( $field_object, $field ) {
			try {
				return $field_object::get_property( 'currency', $field, $this->api->get_default_currency() );
			} catch ( Forminator_Gateway_Exception $e ) {
				return 'USD';
			}
		}

		/**
		 * Retrieve billing data from submitted values
		 *
		 * @since 1.0
		 *
		 * @param object $field_object Field object.
		 * @param array  $field Field settings array.
		 * @param array  $submitted_data Submitted data array.
		 *
		 * @return array
		 */
		public function get_billing_data( $field_object, $field, $submitted_data ) {
			$billing = array();

			// Get mapped fields.
			$billing_name    = $field_object::get_property( 'billing_name', $field, '' );
			$billing_email   = $field_object::get_property( 'billing_email', $field, '' );
			$billing_address = $field_object::get_property( 'billing_address', $field, '' );

			// Handle customer name field.
			if ( ! empty( $billing_name ) ) {
				if ( $this->get_field_value( $billing_name, $submitted_data, false ) ) {
					$billing['name'] = $this->get_field_value( $billing_name, $submitted_data );
					if( ! empty( $billing['name'] ) ) { // To fix the error with multiple name field
						if( is_array( $billing['name'] ) ) {
							$billing['name'] = implode( ' ', $billing['name'] );
						}
					}
				}
			}

			// Handle customer email field.
			if ( ! empty( $billing_email ) ) {
				if ( $this->get_field_value( $billing_email, $submitted_data, false ) ) {
					$billing['email'] = $this->get_field_value( $billing_email, $submitted_data );
				}
			}

			// Handle customer address field.
			if ( ! empty( $billing_address ) ) {
				$billing_address_data = $this->get_address_data( $billing_address, $submitted_data );
				if ( ! empty( $billing_address_data ) ) {
					$billing['address'] = $billing_address_data;
				}
			}

			return $billing;
		}

		/**
		 * Retrieve address fields from submitted data
		 *
		 * @since 1.0
		 *
		 * @param array $field Address field from mapped settings.
		 * @param array $submitted_data Submitted data array.
		 *
		 * @return array
		 */
		public function get_address_data( $field, $submitted_data ) {
			$address = array();

			// Retrieve the submitted data.
			$street  = $this->get_field_value( $field . '-street_address', $submitted_data );
			$line2   = $this->get_field_value( $field . '-address_line', $submitted_data );
			$zip     = $this->get_field_value( $field . '-zip', $submitted_data );
			$country = $this->get_field_value( $field . '-country', $submitted_data );
			$city    = $this->get_field_value( $field . '-city', $submitted_data );
			$state   = $this->get_field_value( $field . '-state', $submitted_data );

			// Check if street is submitted and append it to array.
			if ( ! is_null( $street ) ) {
				$address['line1'] = $street;
			}

			// Check if address line 2 is submitted and append it to array.
			if ( ! is_null( $line2 ) ) {
				$address['line2'] = $line2;
			}

			// Check if post code is submitted and append it to array.
			if ( ! is_null( $zip ) ) {
				$address['postal_code'] = $zip;
			}

			// Check if country is submitted and append it to array.
			if ( ! is_null( $country ) ) {
				$address['country'] = $country;
			}

			// Check if city is submitted and append it to array.
			if ( ! is_null( $city ) ) {
				$address['city'] = $city;
			}

			// Check if state is submitted and append it to array.
			if ( ! is_null( $state ) ) {
				$address['state'] = $state;
			}

			return $address;
		}

		/**
		 * Get field value from submitted data
		 *
		 * @since 1.0
		 *
		 * @param string $id Field ID.
		 * @param array  $submitted_data Submitted data array.
		 * @param string $fallback Fallback value.
		 * @return mixed
		 */
		public function get_field_value( $id, $submitted_data, $fallback = false ) {
			if ( isset( $submitted_data[ $id ] ) ) {
				return $submitted_data[ $id ];
			}

			return $fallback ? $fallback : null;
		}

		/**
		 * Get subscription recurring options
		 *
		 * @since 1.0
		 *
		 * @param array $plan Payment plan data.
		 *
		 * @return array
		 */
		public function get_recurring( $plan ) {
			$interval = isset( $plan['bill_input'] ) ? $plan['bill_input'] : 0;
			$period   = isset( $plan['bill_period'] ) ? $plan['bill_period'] : 'day';

			$recurring = array(
				'interval'       => $period,
				'interval_count' => $interval,
			);

			/**
			 * Filter subscription recurring settings
			 *
			 * @since 1.0
			 *
			 * @param array $plan plan settings
			 */
			$recurring = apply_filters( 'forminator_field_stripe_subscription_recurring', $recurring, $plan );

			return $recurring;
		}

		/**
		 * Check if plan has trial enabled
		 *
		 * @since 1.0
		 *
		 * @param array $plan Plan settings.
		 *
		 * @return bool
		 */
		public function has_trial( $plan ) {
			if ( isset( $plan['allow_trial'] ) ) {
				$allow_trial = filter_var( $plan['allow_trial'], FILTER_VALIDATE_BOOLEAN );

				if ( $allow_trial ) {
					return true;
				}
			}

			return false;
		}

		/**
		 * Add trial settings to subscription data
		 *
		 * @since 1.0
		 *
		 * @param array $data Subscription settings.
		 * @param array $plan Plan settings.
		 *
		 * @return array
		 */
		public function setup_trial( $data, $plan ) {
			$trial_data = array();
			if ( $this->has_trial( $plan ) ) {
				$trial_days = isset( $plan['trial_days'] ) ? $plan['trial_days'] : 14;

				if ( $trial_days > 0 ) {
					$trial_data = array(
						'trial_end' => strtotime( '+' . $trial_days . ' days' ),
					);
				}
			}

			return array_merge( $data, $trial_data );
		}

		/**
		 * Get item quantity for subscription
		 *
		 * @since 1.0
		 *
		 * @param array  $plan Payment plan data.
		 * @param object $custom_form  Custom form object.
		 * @param object $field_object Field object.
		 * @param array  $submitted_data Submitted data.
		 * @param array  $field Field data array.
		 *
		 * @return int
		 */
		public function get_quantity( $plan, $custom_form, $field_object, $submitted_data, $field ) {
			$quantity          = 0;
			$quantity_type     = isset( $plan['quantity_type'] ) ? $plan['quantity_type'] : 'fixed';
			$quantity_fixed    = isset( $plan['quantity'] ) ? $plan['quantity'] : 0;
			$quantity_variable = isset( $plan['variable_quantity'] ) ? $plan['variable_quantity'] : '';

			if ( 'fixed' === $quantity_type ) {
				$quantity = $quantity_fixed;
			} else {
				$form_field = $custom_form->get_field( $quantity_variable, false );
				if ( $form_field ) {
					$form_field = $form_field->to_formatted_array();
					if ( isset( $form_field['type'] ) ) {
						if ( 'calculation' === $form_field['type'] ) {
							// Calculation field get the quantity from pseudo_submit_data.
							if ( isset( $submitted_data[ $quantity_variable ] ) ) {
								$quantity = $submitted_data[ $quantity_variable ];
							}
						} elseif ( 'currency' === $form_field['type'] ) {
							// Currency field get the quantity from submitted_data.
							$field_id = $form_field['element_id'];
							$quantity = $this->get_field_value( $field_id, $submitted_data, $quantity );
						} else {
							$field_object = Forminator_Core::get_field_object( $form_field['type'] );
							if ( $field_object ) {
								$field_id             = $form_field['element_id'];
								$submitted_field_data = $this->get_field_value( $field_id, $submitted_data );
								$quantity             = $field_object::get_calculable_value( $submitted_field_data, $form_field );
							}
						}
					}
				}
			}

			if ( ! is_numeric( $quantity ) ) {
				$quantity = 0;
			}

			/**
			 * Filter subscription quantity stripe
			 *
			 * @since 1.0
			 *
			 * @param int                          $quantity
			 * @param array                        $plan
			 * @param array                        $field field settings
			 * @param Forminator_Form_Model        $custom_form
			 * @param array                        $submitted_data
			 */
			$quantity = apply_filters( 'forminator_field_stripe_subscription_quantity', $quantity, $plan, $field, $custom_form, $submitted_data );

			return intval( $quantity );
		}

		/**
		 * Update submission data with payment details
		 *
		 * @since 1.0
		 *
		 * @param string $payment_intent Payment Intent ID.
		 * @param object $subscription Subscription object.
		 * @param object $custom_form Custom form object.
		 * @param array  $submitted_data Submitted data.
		 * @param object $field_object Field object.
		 * @param array  $field Field data array.
		 * @param array  $payment_plan Payment plan data.
		 *
		 * @return array
		 */
		public function update_submission( $payment_intent, $subscription, $custom_form, $submitted_data, $field_object, $field, $payment_plan ) {
			$entry_data = array(
				'mode'             => '',
				'product_name'     => '',
				'payment_type'     => '',
				'amount'           => '',
				'quantity'         => '',
				'currency'         => '',
				'transaction_id'   => '',
				'transaction_link' => '',
				'subscription_id'  => '',
			);

			$mode          = $field_object::get_property( 'mode', $field, 'test' );
			$currency      = $field_object::get_property( 'currency', $field, 'USD' );
			$charge_amount = $this->calculate_price( $payment_plan, $custom_form, $field_object, $submitted_data, $field );

			if ( ! empty( $payment_plan ) ) {
				$entry_data['product_name'] = $payment_plan['plan_name'];
				$entry_data['payment_type'] = $field_object->payment_method( $payment_plan['payment_method'] );
				$entry_data['quantity']     = $this->get_quantity( $payment_plan, $custom_form, $field_object, $submitted_data, $field );
			}

			$entry_data['mode']            = $mode;
			$entry_data['currency']        = $currency;
			$entry_data['amount']          = number_format( $charge_amount, 2, '.', '' );
			$entry_data['transaction_id']  = $payment_intent;
			$entry_data['subscription_id'] = $subscription->id;

			if ( 'active' === $subscription->status ) {
				$entry_data['status'] = __( 'Active', 'forminator-stripe' );
			}

			$transaction_link = 'https://dashboard.stripe.com/payments/' . rawurlencode( $payment_intent );
			if ( 'test' === $mode ) {
				$transaction_link = 'https://dashboard.stripe.com/test/payments/' . rawurlencode( $payment_intent );
			}

			if ( 'trialing' === $subscription->status ) {
				$entry_data['status']          = __( 'Trialing', 'forminator-stripe' );
				$entry_data['transaction_id']  = __( 'None', 'forminator-stripe' );
				$transaction_link              = 'https://dashboard.stripe.com/subscriptions/';

				if ( 'test' === $mode ) {
					$transaction_link = 'https://dashboard.stripe.com/test/subscriptions/';
				}
			}

			$entry_data['transaction_link'] = $transaction_link;

			return $entry_data;
		}

		/**
		 * Create manage subscription link
		 *
		 * @since 1.0
		 *
		 * @param string $id Subscription ID.
		 * @param array  $meta_value Meta values array.
		 *
		 * @return string
		 */
		public static function manage_subscription( $id, $meta_value ) {
			$mode        = isset( $meta_value['mode'] ) ? $meta_value['mode'] : 'test';
			$manage_link = 'https://dashboard.stripe.com/subscriptions/' . rawurlencode( $id );

			if ( 'test' === $mode ) {
				$manage_link = 'https://dashboard.stripe.com/test/subscriptions/' . rawurlencode( $id );
			}

			$manage_link = '<a href="' . $manage_link . '" target="_blank" rel="noopener noreferrer" title="' . $id . '">' . __( 'Manage subscription', 'forminator-stripe' ) . '</a>';

			/**
			 * Filter link to Stripe manage subscription
			 *
			 * @since 1.0
			 *
			 * @param string $manage_link
			 * @param string $id
			 * @param array  $meta_value
			 *
			 * @return string
			 */
			$manage_link = apply_filters( 'forminator_field_stripe_manage_subscription_link', $manage_link, $id, $meta_value );

			return $manage_link;
		}

		/**
		 * Subscription metadata
		 *
		 * @param $field
		 * @param $custom_form
		 *
		 * @return array
		 */
		public static function subscription_metadata( $field, $custom_form ) {
			$metadata = array();
			if ( ! empty( $field['options'] ) ) {
				foreach ( $field['options'] as $meta ) {
					$label = trim( $meta['label'] );
					// Payment doesn't work with empty meta labels
					if ( empty( $label ) && empty( $meta['value'] ) ) {
						continue;
					}
					if ( empty( $label ) ) {
						$label = $meta['value'];
					}
					$metadata[ $label ] = forminator_replace_form_data( '{' . $meta['value'] . '}', $custom_form );
				}
			}

			return $metadata;
		}
	}
}
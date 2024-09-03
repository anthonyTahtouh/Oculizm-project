<?php
if ( ! defined( 'ABSPATH' ) ) {
	die();
}

/**
 * Wrapper Stripe Subscription class
 * Class Forminator_Subscriptions_Gateway_Stripe
 *
 * @since 1.0
 */
class Forminator_Subscriptions_API_Stripe extends Forminator_Gateway_Stripe {
	/**
	 * Plugin instance
	 *
	 * @var null
	 */
	private static $instance = null;

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
	 * Set Stripe API key and App info
	 *
	 * @since 1.0
	 */
	public function set_stripe_key( $mode = 'test' ) {
        if ( 'live' === $mode || $this->is_live() ) {
            $api_key = $this->live_secret;
        } else {
            $api_key = $this->test_secret;
        }
		\Forminator\Stripe\Stripe::setApiKey( $api_key );

		if ( method_exists( 'Forminator_Stripe_Gateway', 'set_stripe_app_info' ) ) {
			self::set_stripe_app_info();
		}
	}

	/**
	 * Create Stripe customer
	 *
	 * @since 1.0
	 *
	 * @param array $data Customer data.
	 *
	 * @return mixed
	 */
	public function create_customer( $data ) {
		return \Forminator\Stripe\Customer::create( $data );
	}

	/**
	 * Get Stripe customer
	 *
	 * @since 1.0
	 *
	 * @param string $id Customer ID.
	 *
	 * @return mixed
	 */
	public function get_customer( $id ) {
		return \Forminator\Stripe\Customer::retrieve( $id );
	}

	/**
	 * Save Stripe customer
	 *
	 * @since 1.0
	 *
	 * @param object $customer Customer object.
	 *
	 * @return mixed
	 */
	public function save_customer( $customer ) {
		return $customer->save();
	}

	/**
	 * Update Stripe customers
	 *
	 * @since 1.0
	 *
	 * @param string $id   Customer ID.
	 * @param array  $data Customer data.
	 *
	 * @return mixed
	 */
	public function update_customer( $id, $data ) {
		return \Forminator\Stripe\Customer::update( $id, $data );
	}

	/**
	 * Delete Stripe customer
	 *
	 * @since 1.0
	 *
	 * @param string $id Customer ID.
	 *
	 * @return mixed
	 */
	public function delete_customer( $id ) {
		return \Forminator\Stripe\Customer::delete( $id );
	}

	/**
	 * Create Stripe product
	 *
	 * @since 1.0
	 *
	 * @param array $data Product data.
	 *
	 * @return mixed
	 */
	public function create_product( $data ) {
		return \Forminator\Stripe\Product::create( $data );
	}

	/**
	 * Get Stripe product
	 *
	 * @since 1.0
	 *
	 * @param string $id Product ID.
	 *
	 * @return mixed
	 */
	public function get_product( $id ) {
		return \Forminator\Stripe\Product::retrieve( $id );
	}

	/**
	 * Update Stripe product
	 *
	 * @since 1.0
	 *
	 * @param string $id   Product ID.
	 * @param array  $data Product data.
	 *
	 * @return mixed
	 */
	public function update_product( $id, $data ) {
		return \Forminator\Stripe\Product::update( $id, $data );
	}

	/**
	 * Delete Stripe product
	 *
	 * @since 1.0
	 *
	 * @param string $id Product ID.
	 *
	 * @return mixed
	 */
	public function delete_product( $id ) {
		return \Forminator\Stripe\Product::delete( $id );
	}

	/**
	 * Create Stripe subscription
	 *
	 * @since 1.0
	 *
	 * @param array $data Subscription data.
	 *
	 * @return mixed
	 */
	public function create_subscription( $data ) {
		return \Forminator\Stripe\Subscription::create( $data );
	}

	/**
	 * Get Stripe subscription
	 *
	 * @since 1.0
	 *
	 * @param string $id Subscription ID.
	 *
	 * @return mixed
	 */
	public function get_subscription( $id ) {
		return \Forminator\Stripe\Subscription::retrieve( $id );
	}

	/**
	 * Get Stripe invoice
	 *
	 * @since 1.0
	 *
	 * @param string $id Invoice ID.
	 *
	 * @return mixed
	 */
	public function get_invoice( $id ) {
		return \Forminator\Stripe\Invoice::retrieve( $id );
	}
}
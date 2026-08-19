<?php
/**
 * Plugin Name: Meridian Analytics
 * Plugin URI: https://meridian.app
 * Description: Privacy-first, real-time spatial analytics with Great-Circle 3D visual journey maps. Zero cookies, GDPR/ePrivacy compliant.
 * Version: 1.0.0
 * Author: Meridian
 * Author URI: https://meridian.app
 * License: MIT
 * Text Domain: meridian-analytics
 */

if (!defined('ABSPATH')) {
    exit;
}

class Meridian_Analytics_Plugin {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_tracker'));
        add_action('woocommerce_thankyou', array($this, 'track_woocommerce_order'));
    }

    public function add_settings_page() {
        add_options_page(
            'Meridian Analytics Settings',
            'Meridian Analytics',
            'manage_options',
            'meridian-analytics',
            array($this, 'render_settings_page')
        );
    }

    public function register_settings() {
        register_setting('meridian_settings', 'meridian_write_key', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => '',
        ));
        register_setting('meridian_settings', 'meridian_host', array(
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default' => 'https://analytics.discovercyclades.gr',
        ));
        register_setting('meridian_settings', 'meridian_cookieless', array(
            'type' => 'boolean',
            'default' => true,
        ));
        register_setting('meridian_settings', 'meridian_excluded_paths', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_textarea_field',
            'default' => "/wp-admin/*\n/preview/*",
        ));
    }

    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('meridian_settings');
                do_settings_sections('meridian_settings');
                ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><label for="meridian_write_key">Property Write Key</label></th>
                        <td>
                            <input name="meridian_write_key" type="text" id="meridian_write_key" value="<?php echo esc_attr(get_option('meridian_write_key', '')); ?>" class="regular-text" placeholder="mk_live_..." required />
                            <p class="description">Obtained from your Meridian Analytics dashboard settings.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="meridian_host">Meridian Collector Host</label></th>
                        <td>
                            <input name="meridian_host" type="url" id="meridian_host" value="<?php echo esc_attr(get_option('meridian_host', 'https://analytics.discovercyclades.gr')); ?>" class="regular-text" required />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Cookieless Mode</th>
                        <td>
                            <label for="meridian_cookieless">
                                <input name="meridian_cookieless" type="checkbox" id="meridian_cookieless" value="1" <?php checked(1, get_option('meridian_cookieless', true), true); ?> />
                                Strict zero-cookie operational mode (no consent banner required).
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="meridian_excluded_paths">Excluded Paths (one per line)</label></th>
                        <td>
                            <textarea name="meridian_excluded_paths" id="meridian_excluded_paths" rows="4" class="large-text code"><?php echo esc_textarea(get_option('meridian_excluded_paths', "/wp-admin/*\n/preview/*")); ?></textarea>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Save Meridian Settings'); ?>
            </form>
        </div>
        <?php
    }

    public function enqueue_tracker() {
        $write_key = get_option('meridian_write_key', '');
        if (empty($write_key) || is_admin()) {
            return;
        }

        $host = esc_url(get_option('meridian_host', 'https://analytics.discovercyclades.gr'));
        $src = rtrim($host, '/') . '/meridian.js';

        wp_enqueue_script(
            'meridian-tracker',
            $src,
            array(),
            '1.0.0',
            array('strategy' => 'defer', 'in_footer' => false)
        );

        wp_script_add_data('meridian-tracker', 'data-meridian-id', esc_attr($write_key));
    }

    public function track_woocommerce_order($order_id) {
        if (!$order_id) return;
        $order = wc_get_order($order_id);
        if (!$order) return;

        $write_key = get_option('meridian_write_key', '');
        $host = get_option('meridian_host', 'https://analytics.discovercyclades.gr');
        if (empty($write_key) || empty($host)) return;

        $amount_cents = (int) round($order->get_total() * 100);
        $currency = $order->get_currency();

        wp_remote_post(rtrim($host, '/') . '/api/payments', array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => wp_json_encode(array(
                'writeKey' => $write_key,
                'transaction_id' => 'wc_' . $order->get_id(),
                'amount_cents' => $amount_cents,
                'currency' => $currency,
            )),
            'timeout' => 5,
            'blocking' => false,
        ));
    }
}

new Meridian_Analytics_Plugin();

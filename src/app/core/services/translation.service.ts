import { Injectable, computed, signal } from '@angular/core';

export type LanguageCode = 'en' | 'ml';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    ml: string;
  };
}

export const TRANSLATIONS: TranslationDictionary = {
  // Navigation
  nav_home: { en: 'Home', ml: 'ഹോം' },
  nav_explore: { en: 'Explore', ml: 'കണ്ടെത്തുക' },
  nav_pools: { en: 'Pools', ml: 'ഗ്രൂപ്പ് ഡീലുകൾ' },
  nav_cart: { en: 'Cart', ml: 'കാർട്ട്' },
  nav_account: { en: 'Account', ml: 'അക്കൗണ്ട്' },

  // Brand & Taglines
  brand_tagline: { en: 'Kerala Group Buying Platform', ml: 'കേരളത്തിലെ കൂട്ടായ്മാ വാങ്ങൽ പ്ലാറ്റ്‌ഫോം' },
  delivering_discovery_to: { en: 'Shopping around', ml: 'ഷോപ്പിംഗ് ലൊക്കേഷൻ' },
  within_radius: { en: 'Within {radius} km', ml: '{radius} കി.മീ ചുറ്റളവിൽ' },

  // Location onboarding
  loc_heading: { en: 'Find stores and group deals near you', ml: 'നിങ്ങളുടെ അടുത്തുള്ള സ്റ്റോറുകളും ഗ്രൂപ്പ് ഓഫറുകളും കണ്ടെത്തുക' },
  loc_description: { en: 'Discover local shops and unlock better prices together.', ml: 'പ്രാദേശിക കടകൾ കണ്ടെത്തൂ, കുറഞ്ഞ നിരക്കിൽ ഒരുമിച്ച് സാധനങ്ങൾ വാങ്ങൂ.' },
  loc_use_current: { en: 'Use my current location', ml: 'എന്റെ ഇപ്പോഴത്തെ ലൊക്കേഷൻ ഉപയോഗിക്കുക' },
  loc_detecting: { en: 'Detecting your location...', ml: 'ലൊക്കേഷൻ കണ്ടെത്തുന്നു...' },
  loc_select_map: { en: 'Select location on map', ml: 'മാപ്പിൽ ലൊക്കേഷൻ തിരഞ്ഞെടുക്കുക' },
  loc_enter_manually: { en: 'Enter location manually', ml: 'മേൽവിലാസം ടൈപ്പ് ചെയ്യുക' },
  loc_change: { en: 'Change', ml: 'മാറ്റുക' },
  loc_showing_within: { en: 'Showing stores within {radius} km', ml: '{radius} കി.മീ പരിധിയിലുള്ള സ്റ്റോറുകൾ കാണിക്കുന്നു' },
  loc_radius_label: { en: 'Discovery Radius', ml: 'കണ്ടെത്തൽ പരിധി' },
  loc_confirm_selection: { en: 'Confirm Selected Location', ml: 'ലൊക്കേഷൻ സ്ഥിരീകരിക്കുക' },
  loc_pin_drag_hint: { en: 'Drag the pin or tap the map to adjust location', ml: 'ലൊക്കേഷൻ കൃത്യമാക്കാൻ മാപ്പിൽ തൊടുകയോ പിൻ നീക്കുകയോ ചെയ്യുക' },
  loc_permission_denied: { en: 'Location permission was denied. Please select on map or enter manually.', ml: 'ലൊക്കേഷൻ അനുമതി ലഭിച്ചില്ല. മാപ്പിൽ നിന്നോ സ്വയമോ തിരഞ്ഞെടുക്കുക.' },
  loc_locality: { en: 'Locality / Area', ml: 'പ്രദേശം / നാട്' },
  loc_city: { en: 'City / Town', ml: 'നഗരം' },
  loc_pincode: { en: 'PIN Code', ml: 'പിൻകോഡ്' },
  loc_latitude: { en: 'Latitude', ml: 'ലാറ്റിറ്റ്യൂഡ് (Latitude)' },
  loc_longitude: { en: 'Longitude', ml: 'ലോംഗിറ്റ്യൂഡ് (Longitude)' },
  loc_coordinates_label: { en: 'GPS Coordinates (Optional)', ml: 'ജിപിഎസ് കോർഡിനേറ്റുകൾ (ഐച്ഛികം)' },
  loc_save_address: { en: 'Save & Continue', ml: 'സംരക്ഷിച്ച് മുന്നോട്ട് പോകുക' },

  // Search
  search_placeholder: { en: 'Search products, stores and deals', ml: 'ഉൽപ്പന്നങ്ങൾ, കടകൾ, ഡീലുകൾ തിരയുക' },
  search_all: { en: 'All', ml: 'എല്ലാം' },
  search_products: { en: 'Products', ml: 'ഉൽപ്പന്നങ്ങൾ' },
  search_stores: { en: 'Stores', ml: 'സ്റ്റോറുകൾ' },
  search_pools: { en: 'Group Deals', ml: 'ഗ്രൂപ്പ് ഡീലുകൾ' },
  search_recent: { en: 'Recent Searches', ml: 'അടുത്തിടെ തിരഞ്ഞവ' },
  search_no_results: { en: 'No results found for', ml: 'തിരഞ്ഞ ഫലങ്ങൾ ഒന്നും ലഭ്യമല്ല' },
  search_clear: { en: 'Clear', ml: 'മായ്ക്കുക' },

  // Homepage Sections
  sec_active_pools: { en: 'Active Group-Buying Pools', ml: 'സജീവ ഗ്രൂപ്പ് ഓഫറുകൾ' },
  sec_active_pools_sub: { en: 'Join neighbors to reach volume targets and save', ml: 'കൂടുതൽ പേർക്കൊപ്പം വാങ്ങി വലിയ വിലക്കിഴിവ് നേടൂ' },
  sec_nearby_stores: { en: 'Nearby Stores', ml: 'അടുത്തുള്ള സ്റ്റോറുകൾ' },
  sec_nearby_stores_sub: { en: 'Local partner merchants ready for pickup', ml: 'നേരിട്ട് സാധനങ്ങൾ കൈപ്പറ്റാവുന്ന കടകൾ' },
  sec_popular_products: { en: 'Popular Products', ml: 'ജനപ്രിയ ഉൽപ്പന്നങ്ങൾ' },
  sec_browse_categories: { en: 'Browse Categories', ml: 'വിഭാഗങ്ങൾ' },
  sec_recently_viewed: { en: 'Recently Viewed', ml: 'അടുത്തിടെ കണ്ടവ' },
  view_all: { en: 'View all', ml: 'മുഴുവൻ കാണുക' },

  // Pool Card & Details
  pool_group_deal: { en: 'Group Deal', ml: 'ഗ്രൂപ്പ് ഡീൽ' },
  pool_joined: { en: '{count} joined', ml: '{count} പേർ പങ്കെടുത്തു' },
  pool_up_to_off: { en: 'Up to {discount}% off', ml: '{discount}% വരെ വിലക്കിഴിവ്' },
  pool_ends_in: { en: 'Ends in', ml: 'അവസാനിക്കാൻ ബാക്കി' },
  pool_ended: { en: 'Campaign Closed', ml: 'ഓഫർ അവസാനിച്ചു' },
  pool_join_btn: { en: 'Join Group Deal', ml: 'ഗ്രൂപ്പിൽ ചേരുക' },
  pool_view_deal: { en: 'View Pool', ml: 'ഡീൽ കാണുക' },
  pool_discount_tiers: { en: 'Volume Discount Tiers', ml: 'കൂട്ടായ്മാ വിലക്കിഴിവ് ഘട്ടങ്ങൾ' },
  pool_target_threshold: { en: 'When total group volume hits ₹{amount}', ml: 'മൊത്തം വാങ്ങൽ ₹{amount} എത്തുമ്പോൾ' },
  pool_current_tier: { en: 'Active Tier', ml: 'ഇപ്പോഴത്തെ കിഴിവ്' },
  pool_how_it_works: { en: 'How BuyMass Works', ml: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു?' },
  pool_explanation: {
    en: 'Add products from this store to your cart and join this group purchase. As more people buy together before the timer runs out, everyone unlocks higher collective discounts! Collect your order from the store.',
    ml: 'ഈ കടയിലെ ഉൽപ്പന്നങ്ങൾ കാർട്ടിൽ ചേർത്ത് ഗ്രൂപ്പിൽ ചേരുക. നിശ്ചിത സമയത്തിനുള്ളിൽ കൂടുതൽ ആളുകൾ പങ്കെടുക്കുമ്പോൾ എല്ലാവർക്കും ഉയർന്ന കിഴിവ് ലഭിക്കും! കടയിൽ നിന്ന് നേരിട്ട് ഓർഡർ കൈപ്പറ്റാം.'
  },
  pool_already_joined: { en: 'You have joined this pool', ml: 'നിങ്ങൾ ഈ ഗ്രൂപ്പിൽ പങ്കെടുത്തിട്ടുണ്ട്' },
  pool_withdraw: { en: 'Withdraw from Pool', ml: 'പങ്കാളിത്തം റദ്ദാക്കുക' },

  // Cart
  cart_title: { en: 'Your Carts', ml: 'നിങ്ങളുടെ കാർട്ട്' },
  cart_multi_notice: {
    en: 'BuyMass keeps your orders store-specific so local merchants can prepare each order for direct collection.',
    ml: 'ഓരോ കടയിൽ നിന്നുമുള്ള ഓർഡറുകൾ പ്രത്യേകം കൈകാര്യം ചെയ്യപ്പെടുന്നു.'
  },
  cart_store_cart: { en: 'Store Cart', ml: 'സ്റ്റോർ കാർട്ട്' },
  cart_items: { en: 'items', ml: 'ഇനങ്ങൾ' },
  cart_subtotal: { en: 'Store Subtotal', ml: 'ആകെ തുക' },
  cart_empty_title: { en: 'Your cart is empty', ml: 'നിങ്ങളുടെ കാർട്ട് കാലിയാണ്' },
  cart_empty_sub: { en: 'Explore nearby stores and group deals to add items.', ml: 'അടുത്തുള്ള സ്റ്റോറുകളിൽ നിന്നും ഉൽപ്പന്നങ്ങൾ ചേർക്കൂ.' },
  cart_continue_shopping: { en: 'Continue Shopping', ml: 'തുടർന്നും വാങ്ങുക' },
  cart_proceed_checkout: { en: 'Proceed to Store Checkout', ml: 'ഓർഡറിലേക്ക് കടക്കുക' },
  cart_join_pool_prompt: { en: 'Participate in Active Pool', ml: 'ഗ്രൂപ്പ് ഡീലിൽ പങ്കാളിയാകുക' },
  cart_clear: { en: 'Clear Cart', ml: 'കാർട്ട് കാലിയാക്കുക' },
  cart_remove: { en: 'Remove', ml: 'ഒഴിവാക്കുക' },
  add_to_cart: { en: 'Add to Cart', ml: 'കാർട്ടിലേക്ക് ചേർക്കുക' },
  added_to_cart: { en: 'Added to Cart', ml: 'കാർട്ടിൽ ചേർത്തു' },

  // Checkout
  checkout_title: { en: 'Store Checkout', ml: 'സ്റ്റോർ ചെക്ക്ഔട്ട്' },
  checkout_pickup_title: { en: 'Store Pickup Fulfilment', ml: 'കടയിൽ നിന്ന് നേരിട്ട് വാങ്ങൽ' },
  checkout_pickup_desc: {
    en: 'Orders are collected directly at the merchant store upon confirmation or pool completion. No delivery fees.',
    ml: 'ഓർഡർ തയ്യാറാകുമ്പോൾ കടയിൽ നിന്ന് നേരിട്ട് വാങ്ങാം. ഡെലിവറി ചാർജ്ജുകൾ ഇല്ല.'
  },
  checkout_place_order: { en: 'Confirm Store Order', ml: 'ഓർഡർ സ്ഥിരീകരിക്കുക' },
  checkout_summary: { en: 'Order Summary', ml: 'ഓർഡർ വിവരങ്ങൾ' },
  checkout_item_total: { en: 'Items Total', ml: 'സാധനങ്ങളുടെ തുക' },
  checkout_group_discount: { en: 'Estimated Group Discount', ml: 'പ്രതീക്ഷിക്കുന്ന ഗ്രൂപ്പ് കിഴിവ്' },
  checkout_final_estimate: { en: 'Final Payable at Store', ml: 'കടയിൽ നൽകേണ്ട തുക' },

  // Orders & Pickup
  orders_title: { en: 'My Orders', ml: 'എന്റെ ഓർഡറുകൾ' },
  orders_empty: { en: 'No orders found', ml: 'ഓർഡറുകൾ ഒന്നും കണ്ടെത്തിയില്ല' },
  order_number: { en: 'Order #', ml: 'ഓർഡർ നമ്പർ #' },
  order_status: { en: 'Status', ml: 'സ്ഥിതി' },
  order_pickup_otp_title: { en: 'Store Pickup Verification', ml: 'സ്റ്റോർ പിക്കപ്പ് പരിശോധന' },
  order_pickup_otp_desc: {
    en: 'For your security, a 6-digit verification code has been sent directly to your WhatsApp. Please present it to the storekeeper upon collection.',
    ml: 'സുരക്ഷയ്ക്കായി 6 അക്ക പിക്കപ്പ് കോഡ് നിങ്ങളുടെ വാട്ട്‌സ്ആപ്പിലേക്ക് അയച്ചിട്ടുണ്ട്. കടയിൽ സാധനങ്ങൾ വാങ്ങുമ്പോൾ ഈ കോഡ് നൽകുക.'
  },
  order_resend_otp: { en: 'Resend OTP to WhatsApp', ml: 'വാട്ട്‌സ്ആപ്പിലേക്ക് വീണ്ടും അയക്കുക' },
  order_resend_cooldown: { en: 'Resend in {seconds}s', ml: '{seconds} സെക്കൻഡിൽ വീണ്ടും അയക്കാം' },
  order_view_details: { en: 'View Order Details', ml: 'വിശദാംശങ്ങൾ കാണുക' },

  // Profile & Settings
  profile_title: { en: 'My Profile', ml: 'എന്റെ പ്രൊഫൈൽ' },
  profile_language: { en: 'App Language', ml: 'ആപ്പ് ഭാഷ' },
  profile_saved_locations: { en: 'Saved Addresses', ml: 'സംരക്ഷിച്ച മേൽവിലാസങ്ങൾ' },
  profile_wishlist: { en: 'My Wishlist', ml: 'ഇഷ്ടപ്പെട്ടവ' },
  profile_notifications: { en: 'Notifications', ml: 'അറിയിപ്പുകൾ' },
  profile_help: { en: 'Help & Support', ml: 'സഹായം' },
  profile_logout: { en: 'Log Out', ml: 'ലോഗ് ഔട്ട്' },
  profile_sign_in: { en: 'Sign In / Register', ml: 'സൈൻ ഇൻ ചെയ്യുക' },
  settings_title: { en: 'Settings & Preferences', ml: 'ക്രമീകരണങ്ങൾ' },

  // Common & Errors
  loading: { en: 'Loading...', ml: 'ലഭ്യമാക്കുന്നു...' },
  retry: { en: 'Retry', ml: 'വീണ്ടും ശ്രമിക്കുക' },
  save: { en: 'Save', ml: 'സംരക്ഷിക്കുക' },
  cancel: { en: 'Cancel', ml: 'റദ്ദാക്കുക' },
  back: { en: 'Back', ml: 'തിരികെ' },
  km_away: { en: '{distance} km away', ml: '{distance} കി.മീ അകലെ' },
};

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly STORAGE_KEY = 'buymass_customer_lang';

  private readonly _currentLang = signal<LanguageCode>(this.getInitialLanguage());
  readonly currentLang = this._currentLang.asReadonly();
  readonly isMalayalam = computed(() => this._currentLang() === 'ml');

  constructor() {
    this.applyBodyClass(this._currentLang());
  }

  setLanguage(lang: LanguageCode): void {
    this._currentLang.set(lang);
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    this.applyBodyClass(lang);
  }

  toggleLanguage(): void {
    const nextLang: LanguageCode = this._currentLang() === 'en' ? 'ml' : 'en';
    this.setLanguage(nextLang);
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const entry = TRANSLATIONS[key];
    const lang = this._currentLang();
    let text = entry ? entry[lang] || entry['en'] || key : key;

    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      });
    }
    return text;
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }

  private getInitialLanguage(): LanguageCode {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) as LanguageCode;
      if (stored === 'en' || stored === 'ml') {
        return stored;
      }
    } catch {
      // ignore
    }
    // Launch default: Malayalam
    return 'ml';
  }

  private applyBodyClass(lang: LanguageCode): void {
    if (typeof document !== 'undefined') {
      if (lang === 'ml') {
        document.body.classList.add('lang-ml');
      } else {
        document.body.classList.remove('lang-ml');
      }
    }
  }
}

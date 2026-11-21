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
  nav_explore: { en: 'Vehicles', ml: 'വാഹനങ്ങൾ' },
  nav_pools: { en: 'Group Deals', ml: 'ഗ്രൂപ്പ് ഡീലുകൾ' },
  nav_cart: { en: 'Bookings', ml: 'ബുക്കിംഗുകൾ' },
  nav_account: { en: 'Account', ml: 'അക്കൗണ്ട്' },

  // Brand & Taglines
  brand_tagline: { en: 'Vehicle Group Buying Platform • Cars & Bikes', ml: 'കാറുകളും ബൈക്കുകളും ഗ്രൂപ്പായി വൻ വിലക്കിഴിവിൽ' },
  delivering_discovery_to: { en: 'Showrooms around', ml: 'ഷോറൂം ലൊക്കേഷൻ' },
  within_radius: { en: 'Within {radius} km', ml: '{radius} കി.മീ ചുറ്റളവിൽ' },

  // Location onboarding
  loc_heading: { en: 'Find vehicle showrooms & group deals near you', ml: 'നിങ്ങളുടെ അടുത്തുള്ള ഷോറൂമുകളും വാഹന ഗ്രൂപ്പ് ഡീലുകളും കണ്ടെത്തുക' },
  loc_description: { en: 'Discover authorized car & bike dealerships and unlock massive collective volume discounts.', ml: 'അംഗീകൃത കാർ, ബൈക്ക് ഷോറൂമുകൾ കണ്ടെത്തി കൂടുതൽ പേർക്കൊപ്പം വലിയ വിലക്കിഴിവ് നേടൂ.' },
  loc_use_current: { en: 'Use my current location', ml: 'എന്റെ ഇപ്പോഴത്തെ ലൊക്കേഷൻ ഉപയോഗിക്കുക' },
  loc_detecting: { en: 'Detecting your location...', ml: 'ലൊക്കേഷൻ കണ്ടെത്തുന്നു...' },
  loc_select_map: { en: 'Select location on map', ml: 'മാപ്പിൽ ലൊക്കേഷൻ തിരഞ്ഞെടുക്കുക' },
  loc_enter_manually: { en: 'Enter location manually', ml: 'മേൽവിലാസം ടൈപ്പ് ചെയ്യുക' },
  loc_change: { en: 'Change', ml: 'മാറ്റുക' },
  loc_showing_within: { en: 'Showing dealerships within {radius} km', ml: '{radius} കി.മീ പരിധിയിലുള്ള ഷോറൂമുകൾ കാണിക്കുന്നു' },
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
  search_placeholder: { en: 'Search cars, bikes, showrooms or models', ml: 'കാറുകൾ, ബൈക്കുകൾ, ഷോറൂമുകൾ തിരയുക' },
  search_all: { en: 'All', ml: 'എല്ലാം' },
  search_products: { en: 'Vehicles', ml: 'വാഹനങ്ങൾ' },
  search_stores: { en: 'Showrooms', ml: 'ഷോറൂമുകൾ' },
  search_pools: { en: 'Group Deals', ml: 'ഗ്രൂപ്പ് ഡീലുകൾ' },
  search_recent: { en: 'Recent Searches', ml: 'അടുത്തിടെ തിരഞ്ഞവ' },
  search_no_results: { en: 'No results found for', ml: 'തിരഞ്ഞ ഫലങ്ങൾ ഒന്നും ലഭ്യമല്ല' },
  search_clear: { en: 'Clear', ml: 'മായ്ക്കുക' },

  // Homepage Sections
  sec_active_pools: { en: 'Active Vehicle Group Deals', ml: 'സജീവ വാഹന ഗ്രൂപ്പ് ഓഫറുകൾ' },
  sec_active_pools_sub: { en: 'Join buyers to reach booking volume targets and unlock fleet discounts', ml: 'കൂടുതൽ പേർക്കൊപ്പം ബുക്ക് ചെയ്ത് വലിയ വിലക്കിഴിവ് നേടൂ' },
  sec_nearby_stores: { en: 'Authorized Showrooms & Dealers', ml: 'അംഗീകൃത ഷോറൂമുകൾ' },
  sec_nearby_stores_sub: { en: 'Verified car & bike dealerships ready for test rides and handover', ml: 'ടെസ്റ്റ് ഡ്രൈവിനും ഡെലിവറിക്കും തയാറായ ഡീലർഷിപ്പുകൾ' },
  sec_popular_products: { en: 'Trending Cars & Bikes', ml: 'ജനപ്രിയ കാറുകളും ബൈക്കുകളും' },
  sec_browse_categories: { en: 'Browse by Vehicle Type', ml: 'വാഹന വിഭാഗങ്ങൾ' },
  sec_recently_viewed: { en: 'Recently Viewed Vehicles', ml: 'അടുത്തിടെ കണ്ടവ' },
  view_all: { en: 'View all', ml: 'മുഴുവൻ കാണുക' },

  // Pool Card & Details
  pool_group_deal: { en: 'Group Deal', ml: 'ഗ്രൂപ്പ് ഡീൽ' },
  pool_joined: { en: '{count} joined', ml: '{count} പേർ പങ്കെടുത്തു' },
  pool_up_to_off: { en: 'Up to {discount}% off', ml: '{discount}% വരെ വിലക്കിഴിവ്' },
  pool_ends_in: { en: 'Ends in', ml: 'അവസാനിക്കാൻ ബാക്കി' },
  pool_ended: { en: 'Campaign Closed', ml: 'ഓഫർ അവസാനിച്ചു' },
  pool_join_btn: { en: 'Join Vehicle Group Deal', ml: 'ഗ്രൂപ്പിൽ ചേരുക' },
  pool_view_deal: { en: 'View Pool', ml: 'ഡീൽ കാണുക' },
  pool_discount_tiers: { en: 'Volume Discount Tiers', ml: 'കൂട്ടായ്മാ വിലക്കിഴിവ് ഘട്ടങ്ങൾ' },
  pool_target_threshold: { en: 'When total group volume hits ₹{amount}', ml: 'മൊത്തം വാങ്ങൽ ₹{amount} എത്തുമ്പോൾ' },
  pool_current_tier: { en: 'Active Tier', ml: 'ഇപ്പോഴത്തെ കിഴിവ്' },
  pool_how_it_works: { en: 'How BuyMass Vehicle Deals Work', ml: 'ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു?' },
  pool_explanation: {
    en: 'Commit your vehicle booking from this showroom to the group deal pool. As more buyers join before the timer runs out, everyone unlocks higher collective volume discounts on their vehicle price! Collect your vehicle directly from the authorized showroom.',
    ml: 'ഈ ഷോറൂമിൽ നിന്നുള്ള വാഹനം ഗ്രൂപ്പിൽ ബുക്ക് ചെയ്യുക. കൂടുതൽ ആളുകൾ ഒന്നിച്ചു ചേരുമ്പോൾ എല്ലാവർക്കും ഉയർന്ന വിലക്കിഴിവ് ലഭിക്കും! ഷോറൂമിൽ നിന്ന് നേരിട്ട് വാഹനം കൈപ്പറ്റാം.'
  },
  pool_already_joined: { en: 'You have joined this pool', ml: 'നിങ്ങൾ ഈ ഗ്രൂപ്പിൽ പങ്കെടുത്തിട്ടുണ്ട്' },
  pool_withdraw: { en: 'Withdraw from Pool', ml: 'പങ്കാളിത്തം റദ്ദാക്കുക' },

  // Cart
  cart_title: { en: 'Vehicle Bookings & Cart', ml: 'നിങ്ങളുടെ ബുക്കിംഗുകൾ' },
  cart_multi_notice: {
    en: 'BuyMass keeps your vehicle bookings dealership-specific so authorized dealers can arrange pre-delivery inspection, registration, and handover directly.',
    ml: 'ഓരോ ഡീലർഷിപ്പിൽ നിന്നുമുള്ള വാഹന ബുക്കിംഗുകൾ പ്രത്യേകം കൈകാര്യം ചെയ്യപ്പെടുന്നു.'
  },
  cart_store_cart: { en: 'Dealership Booking', ml: 'ഡീലർഷിപ്പ് ബുക്കിംഗ്' },
  cart_items: { en: 'vehicles', ml: 'വാഹനങ്ങൾ' },
  cart_subtotal: { en: 'Dealership Subtotal', ml: 'ആകെ തുക' },
  cart_empty_title: { en: 'No vehicles in your booking list', ml: 'വാഹനങ്ങളൊന്നും ചേർത്തിട്ടില്ല' },
  cart_empty_sub: { en: 'Explore trending cars, bikes, and group deal pools to book.', ml: 'കാറുകളും ബൈക്കുകളും ഗ്രൂപ്പ് ഡീലുകളും കണ്ടെത്തൂ.' },
  cart_continue_shopping: { en: 'Browse Vehicles', ml: 'വാഹനങ്ങൾ കാണുക' },
  cart_proceed_checkout: { en: 'Proceed to Dealership Booking', ml: 'ബുക്കിംഗിലേക്ക് കടക്കുക' },
  cart_join_pool_prompt: { en: 'Participate in Active Pool', ml: 'ഗ്രൂപ്പ് ഡീലിൽ പങ്കാളിയാകുക' },
  cart_clear: { en: 'Clear Booking List', ml: 'ലിസ്റ്റ് മാറ്റുക' },
  cart_remove: { en: 'Remove', ml: 'ഒഴിവാക്കുക' },
  add_to_cart: { en: 'Book / Add Vehicle', ml: 'വാഹനം ചേർക്കുക' },
  added_to_cart: { en: 'Added to Booking', ml: 'ബുക്കിംഗിൽ ചേർത്തു' },

  // Checkout
  checkout_title: { en: 'Dealership Booking', ml: 'വാഹന ബുക്കിംഗ്' },
  checkout_pickup_title: { en: 'Showroom Delivery & Handover', ml: 'ഷോറൂമിൽ നിന്ന് നേരിട്ടുള്ള ഡെലിവറി' },
  checkout_pickup_desc: {
    en: 'Vehicle deliveries are fulfilled directly at the authorized dealership upon pool completion. Pre-delivery inspection and registration assistance included.',
    ml: 'ഓഫർ പൂർത്തിയാകുമ്പോൾ അംഗീകൃത ഷോറൂമിൽ നിന്ന് വാഹനം കൈപ്പറ്റാം. രജിസ്ട്രേഷൻ സഹായം ലഭ്യമാണ്.'
  },
  checkout_place_order: { en: 'Confirm Vehicle Booking', ml: 'വാഹന ബുക്കിംഗ് സ്ഥിരീകരിക്കുക' },
  checkout_summary: { en: 'Booking Summary', ml: 'ബുക്കിംഗ് വിവരങ്ങൾ' },
  checkout_item_total: { en: 'Vehicles Total', ml: 'വാഹനങ്ങളുടെ തുക' },
  checkout_group_discount: { en: 'Estimated Group Discount', ml: 'പ്രതീക്ഷിക്കുന്ന ഗ്രൂപ്പ് കിഴിവ്' },
  checkout_final_estimate: { en: 'Payable at Dealership', ml: 'ഡീലർഷിപ്പിൽ നൽകേണ്ട തുക' },

  // Orders & Pickup
  orders_title: { en: 'My Vehicle Bookings', ml: 'എന്റെ വാഹന ബുക്കിംഗുകൾ' },
  orders_empty: { en: 'No vehicle bookings found', ml: 'ബുക്കിംഗുകൾ ഒന്നും കണ്ടെത്തിയില്ല' },
  order_number: { en: 'Booking #', ml: 'ബുക്കിംഗ് നമ്പർ #' },
  order_status: { en: 'Status', ml: 'സ്ഥിതി' },
  order_pickup_otp_title: { en: 'Showroom Handover Verification', ml: 'ഷോറൂം ഹാൻഡ്‌ഓവർ പരിശോധന' },
  order_pickup_otp_desc: {
    en: 'For your security, a 6-digit handover OTP has been sent to your WhatsApp. Please present it at the dealership during vehicle inspection and key handover.',
    ml: 'സുരക്ഷയ്ക്കായി 6 അക്ക ഹാൻഡ്‌ഓവർ കോഡ് നിങ്ങളുടെ വാട്ട്‌സ്ആപ്പിലേക്ക് അയച്ചിട്ടുണ്ട്. വാഹനം കൈപ്പറ്റുമ്പോൾ ഈ കോഡ് നൽകുക.'
  },
  order_resend_otp: { en: 'Resend OTP to WhatsApp', ml: 'വാട്ട്‌സ്ആപ്പിലേക്ക് വീണ്ടും അയക്കുക' },
  order_resend_cooldown: { en: 'Resend in {seconds}s', ml: '{seconds} സെക്കൻഡിൽ വീണ്ടും അയക്കാം' },
  order_view_details: { en: 'View Booking Details', ml: 'വിശദാംശങ്ങൾ കാണുക' },

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

let isWebView = false;
class ShopAppUtil {
  constructor(params) {
    this.params = params;
    if (
      window.flutter_inappwebview != null &&
      window.flutter_inappwebview != false &&
      typeof window.flutter_inappwebview == 'object'
    ) {
      isWebView = true;
      console.log('flutter InAppWebViewPlatformReady, web view:', isWebView);
      params.readyCallback();
    }
  }
  callHandler = (methodName, ...params) => {
    if (isWebView && window.flutter_inappwebview) {
      do {
        if(window.flutter_inappwebview.callHandler) {
          return window.flutter_inappwebview.callHandler(methodName, ...params);
        }
      }
      while(window.flutter_inappwebview._platformReady === false);
      return window.flutter_inappwebview.callHandler(methodName, ...params);
    } else {
      return Promise.reject(`Calling methodName: ${methodName}, but webview not identified`);
    }
  };
  logger = (info, value) => {
    this.params.logger && console.log(`${info} ${value}`);
  };
  isWebView = () => {
    this.logger('Returning isWebView: ', isWebView);
    return isWebView;
  };
  getAppVersionCode = () =>
    new Promise((resolve, reject) => {
      this.callHandler('getAppVersionCode')
        .then((result) => {
          this.logger('App version', result);
          resolve(result);
        })
        .catch((err) => {
          this.logger('Error in App version', err);
          reject(err);
        });
    });
  triggerAnalytics = (data) =>
    new Promise((resolve, reject) => {
      console.log('analytics_data', JSON.stringify(data));
      this.callHandler('OnAnalyticsEvent', data)
        .then((result) => {
          this.logger('OnAnalyticsEvent Success', result);
          resolve(JSON.stringify(result));
        })
        .catch((err) => {
          this.logger('Error in OnAnalyticsEvent', err);
          reject(err);
        });
    });
  openExternalBrowser = (url) =>
    new Promise((resolve, reject) => {
      this.callHandler('openExternalBrowser', url)
        .then((result) => {
          this.logger('openExternalBrowser Success', result);
          resolve(JSON.stringify(result));
        })
        .catch((err) => {
          this.logger('Error in openExternalBrowser', err);
          reject(err);
        });
    });
  setupCloseForBack = (exit, confirm, hide, backCallback) => {
    /*
      configureBackV2 (boolean exit, boolean confirm, boolean hide, final String overrideBackCallback)
      exit - to close the app
      confirm - Confirm before closing the app
      hide - hide the app (in recent apps tray)
      overrideBackCallback - Web view's handler for back click
    */
    this.callHandler('configureBackV2', exit, confirm, hide, backCallback)
      .then(function (result) {
        console.log(JSON.stringify(result));
      })
      .catch(function (err) {
        console.log('Error in configureBackV2', err);
      });
  };
  setupNormalBack = () => {
    this.callHandler('configureBackV2', false, false, false, '')
      .then(function (result) {
        console.log(JSON.stringify(result));
      })
      .catch(function (err) {
        console.log('Error in configureBackV2', err);
      });
  };
  getUserDetails = () =>
    new Promise((resolve, reject) => {
      this.callHandler('getUserDetails', 'window.setUserDetails')
        .then((result) => {
          this.logger('User Details', result);
          resolve(result);
        })
        .catch((err) => {
          this.logger('Error in getUserDetails', err);
          reject(err);
        });
    });
  updateCartCount = (cartCount) =>
    new Promise((resolve, reject) => {
      this.callHandler('updateCartCount', cartCount)
        .then((result) => {
          this.logger('updated Cart Count', result);
          resolve(result);
        })
        .catch((err) => {
          this.logger('Error in updateCartCount', err);
          reject(err);
        });
    });
  getToken = () =>
    new Promise((resolve, reject) => {
      this.callHandler('getToken', false)
        .then((result) => {
          this.logger('GetToken Success', result);
          resolve(result);
        })
        .catch((err) => {
          this.logger('Error in getToken', err);
          reject(err);
        });
    });
  displayInAppReview = () =>
    new Promise((resolve, reject) => {
      this.callHandler('displayInAppReview')
        .then((result) => {
          this.logger('displayInAppReview success');
          resolve(result);
        })
        .catch((err) => {
          this.logger('displayInAppReview failed');
          reject(err);
        });
    });
  continueShopping = () =>
    new Promise((resolve, reject) => {
      this.callHandler('continueShopping')
        .then((result) => {
          this.logger('continueShopping success', result);
          resolve(result);
        })
        .catch((err) => {
          this.logger('continueShopping failed', err);
          reject(err);
        });
    });
  openDeeplink = (url) =>
    new Promise((resolve, reject) => {
      this.callHandler('openDeeplink', url)
        .then((result) => {
          this.logger('openDeeplink success', result);
          resolve(result);
        })
        .catch((err) => {
          this.logger('openDeeplink failed', err);
          reject(err);
        });
    });
  goToHome = (homePageUrl) =>
    new Promise((resolve, reject) => {
      this.callHandler('openDeeplink', homePageUrl)
        .then((result) => {
          this.logger('openDeeplink success', result);
          resolve(result);
        })
        .catch((err) => {
          this.logger('openDeeplink failed', err);
          reject(err);
        });
    });
  goToNativePdpPage = (ProductUrl) =>
    new Promise((resolve, reject) => {
      this.callHandler('openDeeplink', ProductUrl)
        .then((result) => {
          this.logger('openDeeplink success', result);
          resolve(result);
        })
        .catch((err) => {
          this.logger('openDeeplink failed', err);
          reject(err);
        });
    });
  isValidHREF = (href) => {
    const urlPattern = /^(https?:\/\/)?(www\.)?[\w.-]+\.\w{2,}(\/[\w./-]*)*(\?.*)?(#.*)?$/;
    return urlPattern.test(href) || href.startsWith('/');
  };
  handlePDF = (element, href = '') => {
    href = element && element?.getAttribute('href') ? element?.getAttribute('href') : href;
    if (href.indexOf('.pdf') != -1) {
      if (element && element?.hasAttribute('target')) element?.setAttribute('target', '');
      return { targetElement: element, isPdf: true };
    } else {
      return { targetElement: element, isPdf: false };
    }
  };
  handleContentLinks = (element, href, currentDomain) => {
    href = element && element?.getAttribute('href') ? element?.getAttribute('href') : href;
    if (!!href) {
      if (!this.hasDomain(href)) {
        href = currentDomain.concat(href);
      }
      let obj = this.isExternalDomain(href);
      if (obj.isExternalDomain && obj.isExternalUrl) {
        this.openExternalBrowser(href);
        return false;
      } else {
        element && element?.setAttribute('target', '_self');
        this.setupNormalBack();
        window.location.href = href;
      }
    }
  };
  hasDomain = (href) => {
    let hasDomain = false;
    let linkDomain = document.createElement('a');
    linkDomain.href = href;
    let parsedDomain = linkDomain.hostname;
    if (href.includes(parsedDomain)) {
      hasDomain = true;
    }
    return hasDomain;
  };
  isExternalDomain = (href) => {
    let domain = '.samsung.com';
    if (!href.includes(domain)) {
      return { isExternalDomain: true, isExternalUrl: true };
    }
    return { isExternalDomain: false, isExternalUrl: false };
  };
  handleExternalLink = (event) => {
    event.preventDefault();
    let currentDomain = window.location.origin;
    this.handleContentLinks(event.currentTarget, '', currentDomain);
  };
  handleDynamicSelfLink = () => {
    this.setupNormalBack();
  };
  appDynamicLinkHandler = (externalLinks) => {
    for (let i = 0; i < externalLinks?.length; i++) {
      const link = externalLinks[i];
      const isTargetBlank = link?.getAttribute('target') === '_blank' ? true : false;
      if (!!link?.getAttribute('href') && this.isValidHREF(link.getAttribute('href'))) {
        let obj = this.handlePDF(link);
        if (isTargetBlank && !obj.isPdf) {
          obj.targetElement.setAttribute('data-external-link-app-blank', '');
          obj.targetElement.addEventListener('click', this.handleExternalLink);
        } else {
          if (!obj.isPdf) {
            obj.targetElement.setAttribute('data-external-link-app-self', '');
            obj.targetElement.addEventListener('click', this.handleDynamicSelfLink);
          }
        }
      }
    }
  };
  hideStickyCart = () => {
    const stickycta = document.querySelector('div.sticky-cart-totals__wrapper');
    if (stickycta) {
    stickycta.style.display = 'none';
    }
  };
  checkLinksNavigation = (href, target, nativeElement = '', isCheckoutV2_0 = false, stopRedrection = false) => {
    if (this.isWebView()) {
      if (isCheckoutV2_0 && stopRedrection) {
        return;
      } else {
        if (!!href && this.isValidHREF(href)) {
          const currentDomain = window.location.origin;
          const isTargetBlank = target === '_blank' ? true : false;
          let obj = this.handlePDF(nativeElement, href);
          if (isTargetBlank && !obj.isPdf) {
            this.handleContentLinks(obj.targetElement, href, currentDomain);
          } else {
            if (!obj.isPdf) {
              this.setupNormalBack();
            }
          }
          window.open(href, target ? target : '_self');
        }
      }
    }
  };
}

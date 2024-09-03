(() => {
  const $q = window.sg.common.$q;
  const BREAKPOINTS = window.sg.common.constants.BREAKPOINTS;
  const utils = window.sg.common.utils;
  const lazyLoad = window.sg.common.lazyLoad;
  const swiperManager = window.sg.common.swiperManager;

  const selector = {
    section: '.my-recommended-product',
  };

  class MyRecommendedProduct {
    constructor(component) {
      this.ele = {
        window: $q(window),
        section: $q(component),
      };

      this.selector = {
        swiperContainer: '.my-recommended-product__card-swiper',
        itemWrap: '.my-recommended-product__card-item-wrap',
        sameHeightTarget: [
          '.my-recommended-product__card--color',
          '.my-recommended-product__card--capacity',
          '.my-recommended-product__card-info',
          '.my-recommended-product__card-energy-label',
          '.my-recommended-product__card-repairability',
          '.my-recommended-product__card-price',
        ],
      };

      this.desktopFlag = null;
      this.mobileFlag = null;

      this.isHomePage = document.querySelector('#tempTitle') && document.querySelector('#tempTitle').value === 'page-home';

      this.handler = {
        resize: this.resize.bind(this),
        setHomeTagging: this.setHomeTagging.bind(this),
      };

      MyRecommendedProduct.instances.set(component, this);

      this.init();
    }
    setProperty() {
      if (BREAKPOINTS.MOBILE < utils.getViewPort().width) {
        this.desktopFlag = true;
        this.mobileFlag = false;
      } else {
        this.desktopFlag = false;
        this.mobileFlag = true;
      }

      this.ele.swiperContainer = this.ele.section.find(this.selector.swiperContainer);
      this.ele.itemWrap = this.ele.section.find(this.selector.itemWrap);
    }

    init() {
      this.setProperty();
      this.bindEvents();
    }

    reInit() {
      this.setProperty();
      this.bindEvents();
    }

    resize() {
      if (BREAKPOINTS.MOBILE < utils.getViewPort().width) {
        if (this.desktopFlag === false) {
          this.desktopFlag = true;
          this.mobileFlag = false;
          this.reInitSwiper();

          if (this.ele.itemWrap.target.length < 5) {
            if (this.ele.swiperContainer.hasClass('swiper-container-initialized')) {
              this.ele.swiperContainer.target[0].swiper.params.followFinger = false;
            }
          }
        }
      } else {
        if (this.mobileFlag === false) {
          this.mobileFlag = true;
          this.desktopFlag = false;
          this.reInitSwiper();
          if (this.ele.swiperContainer.hasClass('swiper-container-initialized')) {
            this.ele.swiperContainer.target[0].swiper.params.followFinger = false;
          }
        }
      }

      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
      this.resizeTimer = setTimeout(() => {
        this.setDefault();
        this.setHeight();
      }, 400);
    }

    reInitSwiper() {
      if (BREAKPOINTS.MOBILE < utils.getViewPort().width) {
        this.perGroup = 1;
      } else {
        this.perGroup = 2;
      }
      const slideOption = {
        slidesPerGroup: this.perGroup,
      };
      swiperManager.slideRemove(this.ele.swiperContainer.target[0]);
      swiperManager.slideInit(this.ele.swiperContainer.target[0], slideOption);
      swiperManager.slideInitEnd(this.ele.swiperContainer.target[0], this.handler.setHomeTagging);
    }

    setHomeTagging() {
      if( !this.isHomePage ) return;
      this.ele.section.find('.indicator__item').target.forEach( (indicator,index) => {
        indicator.setAttribute('an-tr','myd11_recommended product card_cta-product_click2');
        indicator.setAttribute('an-ca','indication');
        indicator.setAttribute('an-ac','carousel');
        indicator.setAttribute('an-la',`carousel:index:${index + 1}`);
      });
    }

    setDefault() {
      this.selector.sameHeightTarget.forEach((element) => {
        this.same = this.ele.itemWrap.find(element);

        this.same.target.forEach((item) => {
          const $item = $q(item);

          $item.css({
            'height': '',
          });
        });
      });
    }

    setHeight() {
      this.selector.sameHeightTarget.forEach((element) => {
        const arrHeight = [];
        this.same = this.ele.itemWrap.find(element);

        this.same.target.forEach((item) => {
          const $item = $q(item);

          $item.css({
            'height': '',
          });

          if ($item.hasClass('my-recommended-product__card--color') && $item.find('.option-selector__wrap--color-chip').target.length > 0) {
            const outerHeight = $item.outerHeight();
            const colorChipMargin = parseInt($item.find('.option-selector__wrap--color-chip').css('margin-bottom'), 10);
            arrHeight.push(outerHeight + colorChipMargin);
          } else {
            arrHeight.push($item.outerHeight());
          }
        });

        const maxHeight = Math.max.apply(null, arrHeight);

        this.same.css({
          'height': `${maxHeight}px`,
        });
      });
    }

    bindEvents() {
      this.ele.window.off('resize', this.handler.resize).on('resize', this.handler.resize);
      this.setDefault();
      this.setHeight();
      this.reInitSwiper();

      if (BREAKPOINTS.MOBILE < utils.getViewPort().width) {
        if (this.ele.itemWrap.target.length < 5) {
          if (this.ele.swiperContainer.hasClass('swiper-container-initialized')) {
            this.ele.swiperContainer.target[0].swiper.params.followFinger = false;
          }
        }
      }
    }

    optionReInit(card) {
      window.sg.common.OptionSelector.reInit($q(card), true);
      lazyLoad.setLazyLoad();
      this.resize();
    }
  }

  MyRecommendedProduct.instances = new WeakMap();

  function init() {
    $q(selector.section).target.forEach((element) => {
      new MyRecommendedProduct(element);
    });
  }

  function reInit() {
    lazyLoad.setLazyLoad();

    $q(selector.section).target.forEach((element) => {
      if (MyRecommendedProduct.instances.has(element)) {
        MyRecommendedProduct.instances.get(element).reInit();
      } else {
        new MyRecommendedProduct(element);
      }
    });
  }

  /**
   * @param {HTMLelement} 옵션 클릭해서 새로 그린 .my-recommended-product__card-item element
   */
  function optionReInit(card) {
    $q(selector.section).target.forEach((element) => {
      if (MyRecommendedProduct.instances.has(element)) {
        MyRecommendedProduct.instances.get(element).optionReInit(card);
      }
    });
  }

  window.sg.components.myRecommendedProduct = {
    init,
    reInit,
    optionReInit,
  };

  //$q.ready(init);
})();

(function (window, $) {
	"use strict";
	let myRecommendedProductDvi = $('div.my-recommended-product');
	if (myRecommendedProductDvi.length < 1) {
		return;
	}
	const tempTitle = $("#tempTitle").val();
	const searchDomain = $("#searchDomain").val();
	
	const storeDomain = $("#storeDomain").val();
	const siteCode = $("#siteCode").val();
	const hybrisApiJson = $("#hybrisApiJson").first().val();
	const scene7Domain = $("#scene7domain").val();
	
	const priceCurrency = $("#myd11-priceCurrency").first().val();
	const priceDisplayYn = $("#myd11-priceDisplayYn").first().val();
	const cartUrl = $("#myd11-cartUrl").first().val();
	const wtbCtaBtnYN = $("#myd11-wtbCtaBtnYN").first().val();
	const offerCheckYn = $("#myd11-offerCheckYn").first().val();
	const emiUrl = $("#myd11-emiUrl").val();
	const financingUrl = $("#myd11-financingUrl").val();
	const recommendedProductYn = $("#myd11-recommendedProductYn").val();

	let shopSiteCode = "";
	let commonCodeYN = "";
	const shopIntegrationFlag = $("#shopIntegrationFlag").val();
	const isGPv2 = (shopIntegrationFlag === "GPv2");
	const isNewHybris = (shopIntegrationFlag === "Hybris-new");
	const isHybrisIntg = (shopIntegrationFlag === "Hybris-intg");
	const isNonShop = !(shopIntegrationFlag);
	const b2bFlag = $('#b2bFlag').val();
	
	const $myComponent = $(".my-recommended-product");
	
	const isUseReinitTemp =  $.inArray(tempTitle, ["page-search"]) >= 0 ? true : false;
	const isWishListRemoveTemp =  $.inArray(tempTitle, ["page-home", "page-search"]) >= 0 ? true : false;
	
	const isHomePage = "page-home" === tempTitle;
	
	// 제품 전체 데이터
	let componentList = [];

	let requestId = "";
	
	// Tagging data
	const pageTrack = (digitalData.page.pageInfo.pageTrack || "").toLowerCase();
	const addWishlistTaggingAttr = `an-tr="myd11_recommended product cart_cta-account3" an-ca="product click" an-ac="recommended product" an-la="add to wishlist"`;
	const removeWishlistTaggingAttr = `an-tr="myd11_recommended product cart_cta-account3" an-ca="product click" an-ac="recommended product" an-la="remove from wishlist"`;
	const linkToPDTaggingAttr = `an-tr="myd11_recommended product cart_cta-product_click2" an-ca="product click" an-ac="recommended product" an-la="learn more click"`;
	const getStockTaggingAttr = `an-tr="curation card-${pageTrack}-button-alert" an-ca="buy cta" an-ac="stock alert" an-la="stock alert" data-antr=""`; // data-antr="get stock alert cta tagging 세팅용"
	const buyNowtoLinkTaggingAttr = `an-tr="curation card-${pageTrack}-text-buy cta" an-ca="buy cta" an-ac="buy now" an-la="curation product card:buy now"`;
	const preOrderToLinkTaggingAttr = `an-tr="curation card-${pageTrack}-text-buy cta" an-ca="buy cta" an-ac="pre-order" an-la="curation product card:pre-order"`;
	let eneryLabelTaggingAttr = `an-tr="pd10_curation card-${pageTrack}-image-link" an-ca="option click" an-ac="product compare landing" an-la="product fiche"`;
	if(isHomePage){
		eneryLabelTaggingAttr = `an-tr="myd11_recommended product card-home_content_click3" an-ca="home content click" an-ac="recommended product" an-la="product fiche"`;
	}
	// 카트 페이지로 이동
	const buyNowToCartTaggingAttr = `an-tr="curation card-${pageTrack}-cta-cart page" an-ca="ecommerce" an-ac="addtocart" an-la="curation product card:buy now"`;
	const preOrderToCartTaggingAttr = `an-tr="curation card-${pageTrack}-cta-cart page" an-ca="ecommerce" an-ac="addtocart" an-la="curation product card:pre order"`;
	const addToCartTaggingAttr = `an-tr="curation card-${pageTrack}-cta-cart page" an-ca="ecommerce" an-ac="addToCart" an-la="curation product card:add to cart"`;

	const arrowRightTaggingAttr = `an-tr="myd11_recommended product card_cta-product_click2" an-ca="indicator" an-ac="carousel" an-la="carousel:arrow:right"`;
	const arrowLeftTaggingAttr = `an-tr="myd11_recommended product card_cta-product_click2" an-ca="indicator" an-ac="carousel" an-la="carousel:arrow:left"`;
	// card image Preset
	// PC : (w)216*(h)216 px
	// MO : (w)132*(h)132 px
	const desktopImagePreset = "?$216_216_PNG$";
	const mobileImagePreset = "?$132_132_PNG$";
	const lazyloadPreset = "?$LazyLoad_Home_PNG$";

	// i18n
	const ADD_TO_WISHLIST_I18n = Granite.I18n.get("Add to wishlist");
	const REMOVE_WISHLIST_I18n = Granite.I18n.get("Remove wishlist");
	const LEARN_MORE_I18n = Granite.I18n.get("Learn more");
	const BUY_NOW_I18n = Granite.I18n.get("Buy now");
	const GET_STOCK_I18n = Granite.I18n.get("Get stock alert");
	const OUT_OF_STOCK_I18n = Granite.I18n.get("Out Of Stock");
	const PRE_ORDER_I18n = Granite.I18n.get("pre order");
	const ADD_TO_CART_I18n = Granite.I18n.get("Add to cart");
	const NOT_FOR_SALE_I18n = Granite.I18n.get("not for sale");
	const SELECTED_I18n = Granite.I18n.get("Selected");
	const COLOR_I18n = Granite.I18n.get("Color");
	const RATING_I18n = Granite.I18n.get("Rating");
	const RATING_PRODUCT_I18n = Granite.I18n.get("Product Ratings");
	const NUMBER_RATING_I18n = Granite.I18n.get("Number Of Ratings");

	// lowestWasPrice 없을 시 strikethrough 제거
	const LOWEST_WAS_PRICE_STRIKETHROUGH_SITE_CODE = ["pl", "gr", "si", "fi", "hr", "it", "dk", "no", "se","fr"]; // lowestWasPrice strikethrough siteCode master up to fi
	const isStrikethroughRmSite = $.inArray(siteCode, LOWEST_WAS_PRICE_STRIKETHROUGH_SITE_CODE) >= 0 ? true : false;
	
	let searchApiUrl = "";
	/* 20210728수정 >> 플래그십 서버를 위한 API 호출 분기 */
	if(searchDomain.split("/")[2] == "searchapi-sa.samsung.com"){
		searchApiUrl = searchDomain + "/qa/b2c/product/card/detail/";
	}else{
		searchApiUrl = searchDomain + "/front/b2c/product/card/detail/";
	}
	if (isGPv2) {
		searchApiUrl += "gpv2";
		commonCodeYN = "N";
	} else if (isHybrisIntg) {
		searchApiUrl += "hybris";
	} else if (isNewHybris) {
		commonCodeYN = "N";
		searchApiUrl += "newhybris";
	} else {
		searchApiUrl += "global";

		if (siteCode === "ae" || siteCode === "ae_ar") {
			shopSiteCode = window.cookies.getCookie("dotcom_multistore") || siteCode;
		} else if (siteCode === "levant") {
			shopSiteCode = "jo";
		} else if (siteCode === "levant_ar") {
			shopSiteCode = "jo_ar";
		} else if (siteCode === "n_africa") {
			shopSiteCode = "ma";
		}
	}
	//제품 전체 데이터
	var productListData = [];
	
	// calculator popup 영역
	var $emiPopupEl = $('.eip-popup');
	
	var isNotNull = function(_str){
		
		return !fnIsNull(_str);
				
	};
	// saveText EURO -> KUNA  변환
	/*
	var euroToKunaPrice = function(saveText){
		let tempDecimalPoint = Math.pow(10, 2);
		let euroPriceTemp = Number(saveText)*7.53450;
		euroPriceTemp = Math.round(euroPriceTemp * tempDecimalPoint) / tempDecimalPoint;
		return currencyComma(euroPriceTemp, "HRK");
	}
	*/
	// 할인율
	var getDiscountRate = function(savePrice, originPrice){
		let tempDecimalPoint = Math.pow(10, 2);
		let discountRateTemp = Number(savePrice) / Number(originPrice) * tempDecimalPoint;
		discountRateTemp = Number(discountRateTemp).toFixed(2);
		return discountRateTemp.replace('.', ',');
	}
	function arrayContains(array, element) {
		for (var i = 0; i < array.length; i++) {
			if (array[i] === element) {
				return true;
			}
		}
		return false;
	};

	function escapeHtml(text) {
		var newText = text;
		if (newText) {
			newText = newText
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");
		}
		return newText;
	};
	
	var changeAddedWishlist = function($el, modelCode){
			var changeBtn = function($btnEl){
				$btnEl.addClass('pd-wishlist-cta--on js-delete-wishlist-btn');
				$btnEl.removeAttr('data-add-text').attr('data-added-text', Granite.I18n.get("Remove wishlist"));
				$btnEl.removeAttr('an-la').attr('an-la', 'remove from wishlist');
				$btnEl.attr('aria-selected', "true");
				$btnEl.removeAttr('aria-label').attr('aria-label', Granite.I18n.get("Remove wishlist"));
			};
			
			if(addedWishList.length > 0){
				for(var idx = 0; idx < addedWishList.length; idx++){
					var addedWishlistInfo = addedWishList[idx];
					if(addedWishlistInfo.deleted === false ){
						if(isNotNull(modelCode) && addedWishlistInfo.sku === modelCode){
							var $addedWishlistBtn = $el.find('.my-recommended-product__card-wishlist a');
							changeBtn($addedWishlistBtn);
							break;
						} else {
							var $addedWishlistBtn = $('.my-recommended-product__card-wishlist a[data-modelcode='+addedWishlistInfo.sku+']');
							changeBtn($addedWishlistBtn);
						}
					}
				}
			}
		};
	
	function getWishlist(frontModel) {
		const ctaType = frontModel.ctaTypeUpperCase;
		const prodDisplayNm = escapeHtml((frontModel.displayName || "").replace(/<br>/ig, " ").replace(/<sup>/ig, " "));
		let wishListClass = "";
		let isAddedClass = "";
		let isAddedWishlist = false;
		let wishlistBtnText = ADD_TO_WISHLIST_I18n;
		let wishlistAttr = "";

		if (isGPv2 || isNewHybris) {
			let shopSkuCode = "";
			if (frontModel.shopSKU) {
				shopSkuCode = frontModel.shopSKU;
			} else {
				shopSkuCode = frontModel.modelCode;
			}
			frontModel.shopSkuCode = shopSkuCode;

			// Added Wishlist Check
			if (addedWishList.length > 0) {
				for (let idx = 0; idx < addedWishList.length; idx++) {
					const addedWishlistInfo = addedWishList[idx];
					if (addedWishlistInfo.deleted === false && addedWishlistInfo.sku === shopSkuCode) {
						isAddedClass = " pd-wishlist-cta--on js-delete-wishlist-btn";
						isAddedWishlist = true;
						wishlistBtnText = REMOVE_WISHLIST_I18n;
						break;
					}
				}
			}

			wishlistAttr = `data-modelcode=${shopSkuCode} data-modelname="${frontModel.modelName}" data-stock="${frontModel.ctaType}"`;

			let wishlistPrice = "";
			if (frontModel.promotionPrice) {
				wishlistPrice = frontModel.promotionPrice;
			} else {
				wishlistPrice = frontModel.price;
			}
			if (wishlistPrice && wishlistPrice !== "null") {
				wishlistAttr += ` data-modelprice="${wishlistPrice}"`;
			}
		} else if (isHybrisIntg) {
			wishlistAttr = `data-modelcode="${frontModel.modelCode}" data-modelname="${frontModel.modelName}"`;
		}

		wishlistAttr += ` data-pagetrack="${pageTrack}" data-component="MYD11"`;

		if (isAddedWishlist) {
			wishlistAttr += removeWishlistTaggingAttr;
		} else {
			wishlistAttr += addWishlistTaggingAttr;
		}

		if (ctaType === "NOORDER" || ctaType === "LEARNMORE") {
			wishListClass = " js-learnmore";
		}

		let wishlistHtml = "";
		// page-home에서 wishlist 제거
		if(!isWishListRemoveTemp){
			if (isGPv2 || isHybrisIntg || isNewHybris) {
				wishlistHtml =
					`<div class="my-recommended-product__card-wishlist">
						<a class="pd-wishlist-cta js-layer-open${isAddedClass}${wishListClass}" href="javascript:void(0)" aria-haspopup="false" data-div-id="#wishlist-popup" role="button" aria-label="${wishlistBtnText}" data-add-text="${ADD_TO_WISHLIST_I18n}:${prodDisplayNm}" data-added-text="${REMOVE_WISHLIST_I18n}:${prodDisplayNm}" ${wishlistAttr}>
							<span class="hidden">${wishlistBtnText}</span>
							<svg class="icon unselect" focusable="false" aria-hidden="true">
								<use xlink:href="#wishlist-unselect-regular" href="#wishlist-unselect-regular"></use>
							</svg>
							<svg class="icon select" focusable="false" aria-hidden="true">
								<use xlink:href="#wishlist-select-bold" href="#wishlist-select-bold"></use>
							</svg>
						</a>
					</div>`;
			}
		}
		return wishlistHtml;
	};
	
	function buildBadge(tempModel){
		let badgeHtml = "";
		let badgeClass = "";
		let badgeText = "";
		let badgeFlag = false;
		
		if(isNotNull(tempModel.topFlags) && isNotNull(tempModel.topFlags.iconTypeCd)){
			if(tempModel.topFlags.iconTypeCd === "N"){
				badgeText = Granite.I18n.get("new");
				badgeClass = " badge-icon--bg-color-blue";
				badgeFlag = true;
			} else if(tempModel.topFlags.iconTypeCd === "H"){
				badgeText = Granite.I18n.get("hot");
				badgeClass = " badge-icon--bg-color-red";
				badgeFlag = true;
			} else if(tempModel.topFlags.iconTypeCd === "B"){
				badgeText = Granite.I18n.get("best seller");
				badgeClass = " badge-icon--bg-color-orange";
				badgeFlag = true;
			}
		}
		if(badgeFlag){
			badgeHtml = 
				`<div class="my-recommended-product__card-badge">
					<span class="badge-icon  badge-icon--label  ${badgeClass}">
					${badgeText}
					</span>
				</div>`;
		}
		return badgeHtml
	}
	
	//  CTA 
	function getCTAForNewGeneral(product) {
		const frontModel = product.modelList[product.frontModelIdx];
		const ctaType = frontModel.ctaTypeUpperCase;

		let useConfiguratorUrl = false;
		if (isNotNull(frontModel.configuratorUseYn) && frontModel.configuratorUseYn == "Y" && isNotNull(frontModel.configuratorUrl)) {
			useConfiguratorUrl = true;
		}

		let price = "";
		let discountPrice = "";
		if (frontModel.price) {
			price = frontModel.price;
		}
		if (frontModel.promotionPrice) {
			discountPrice = frontModel.promotionPrice;
		}
		
		const displayNameAttr = escapeHtml((frontModel.displayName || "").replace(/<br>/ig, " ").replace(/<sup>/ig, " "));
		const dataModelCodeAttr = `data-modelcode="${frontModel.modelCode}"`;
		const dataModelNameAttr = `data-modelname="${frontModel.modelName}"`;
		const dataRequestidAttr = `data-requestid="${requestId}"`;

		// pre order, buy now, add to cart 에 사용
		let taggingAttrForBuy =
			`an-tr="myd11_recommended product card_cta-product_click3" an-ca="product click" an-ac="recommended product" an-la="buy now" 
			 ${dataModelCodeAttr} ${dataModelNameAttr} ${dataRequestidAttr}`;
		if(isHomePage){
			taggingAttrForBuy =
				`an-tr="myd11_recommended product card_cta-home_content_click4" an-ca="home content click" an-ac="recommended product" an-la="buy now"
				 ${dataModelCodeAttr} ${dataModelNameAttr} ${dataRequestidAttr}`;
		}
		const isSimplePD = product.simplePdYN === "Y" ? true : false;
		let buyingPDUrl = frontModel.originPdpUrl;
		if(isSimplePD){
			buyingPDUrl = frontModel.originPdpUrl + "buy/";
		}
		
		let ctaHtml = "";
		if(useConfiguratorUrl) {
			let configuratorCtaText = isNotNull(frontModel.ctaLocalText) ? frontModel.ctaLocalText : BUY_NOW_I18n;
			ctaHtml =
					`<a class="cta cta--contained cta--black js-buy-now" href="javascript:;" aria-label="${BUY_NOW_I18n}:${displayNameAttr}" config_info="${frontModel.configuratorUrl}" ${taggingAttrForBuy} ${buyNowtoLinkTaggingAttr}>
						${configuratorCtaText}
					</a>`;
		}else{
			
			ctaHtml =
						`<a class="cta cta--contained cta--black" href="${buyingPDUrl}" aria-label="${BUY_NOW_I18n}:${displayNameAttr}" link_info="${buyingPDUrl}" ${taggingAttrForBuy} ${buyNowtoLinkTaggingAttr}>
							${BUY_NOW_I18n}
						</a>`;
			if(ctaType === "PREORDER"){
				ctaHtml =
							`<a class="cta cta--contained cta--black" href="${buyingPDUrl}" aria-label="${BUY_NOW_I18n}:${displayNameAttr}" link_info="${buyingPDUrl}" ${taggingAttrForBuy} ${buyNowtoLinkTaggingAttr}>
								${PRE_ORDER_I18n}
							</a>`;
			}
		}
//		if(isNonShop){
//			ctaHtml +=
//				`<a class="cta cta--outlined cta--black" href="${frontModel.pdpUrl}" aria-label="${LEARN_MORE_I18n}:${displayNameAttr}" ${dataModelCodeAttr} ${dataModelNameAttr} ${dataRequestidAttr} ${linkToPDTaggingAttr}>
//					${LEARN_MORE_I18n}
//				</a>`;
//		}else{
//			/* whereToBuy 경우 */
//			if(ctaType === "WHERETOBUY" || ctaType === "BACKORDER" || ctaType === "BACKORDERED" || ctaType === "INSTOCK"){
//				if (useConfiguratorUrl) {
//					ctaHtml +=
//						`<a class="cta cta--contained cta--black" href="${frontModel.configuratorUrl}" aria-label="${BUY_NOW_I18n}:${displayNameAttr}" config_info="${frontModel.configuratorUrl}" ${taggingAttrForBuy} ${buyNowtoLinkTaggingAttr}>
//							${BUY_NOW_I18n}
//						</a>`;
//				} else {
//					ctaHtml +=
//						`<a class="cta cta--contained cta--black" href="${buyingPDUrl}" aria-label="${BUY_NOW_I18n}:${displayNameAttr}" link_info="${buyingPDUrl}" ${taggingAttrForBuy} ${buyNowtoLinkTaggingAttr}>
//							${BUY_NOW_I18n}
//						</a>`;
//				}
//			} else if (ctaType === "OUTOFSTOCK") {
//				ctaHtml +=
//					`<a class="cta cta--outlined cta--black" href="${frontModel.pdpUrl}" aria-label="${LEARN_MORE_I18n}:${displayNameAttr}" ${dataModelCodeAttr} ${dataModelNameAttr} ${linkToPDTaggingAttr}>
//							${LEARN_MORE_I18n}
//						</a>`
//			} else {
//				ctaHtml +=
//					`<a class="cta cta--outlined cta--black" href="${frontModel.pdpUrl}" aria-label="${LEARN_MORE_I18n}:${displayNameAttr}" ${dataModelCodeAttr} ${dataModelNameAttr} ${linkToPDTaggingAttr}>
//							${LEARN_MORE_I18n}
//						</a>`;
//			}
//		}

		return ctaHtml;
	};
	
	// Product 데이터를 가공하여 반환
	function getProductInfo(product) {
		const tempProduct = product;

		const tmpOptionListInModel = {};
		for (let mi in tempProduct.modelList) {
			const tmpModel = tempProduct.modelList[mi];
			const tmpFmyChipList = tmpModel.fmyChipList;

			if (!tmpModel.displayName) { // Product Name SKU 단위로 조정
				tempProduct.modelList[mi].displayName = "";
			}
			tmpModel.ctaTypeUpperCase = (tmpModel.ctaType || "").toUpperCase();

			for (let fci in tmpFmyChipList) {
				//fmyChipCode에 " 제거 
				const thisOptionKey = tmpFmyChipList[fci].fmyChipType + '+' +
					tmpFmyChipList[fci].fmyChipCode.replace("\"", "").replace("&quot;", "") + '+' +
					tmpFmyChipList[fci].fmyChipLocalName.replace("\"", "").replace("&quot;", "");

				if (!tmpOptionListInModel[thisOptionKey]) {
					tmpOptionListInModel[thisOptionKey] = mi;
				} else {
					tmpOptionListInModel[thisOptionKey] += "," + mi;
				}
			}
			// SEF, SEBN, SEDA(rs, al, mk, ba은 스토어국가아니므로 패스), SENA, SEPOL, SEH (우선 pl만 반영)
			// 기존 price(원가, msrp price 포함)가 이미 노출되는 경우에 이를 lowestWasPrice 가 노출되도록 변경하는 작업
			// [EPP] epp meta 체크 추가
			// lowestwasprice 가 price 보다 낮거나 같고, promotion price보다 높을 때만 적용
			tmpModel['lowestWasPriceUseYn'] = "N";
			if((
				 (isStrikethroughRmSite || siteCode === "ro" )
				)
			&& isNotNull(tmpModel.lowestWasPrice)
			&& isNotNull(tmpModel.promotionPrice)
			&& (parseFloat(tmpModel.lowestWasPrice) <= parseFloat(tmpModel.price) && parseFloat(tmpModel.promotionPrice) < parseFloat(tmpModel.lowestWasPrice))
			){
				console.log("modelCode [{}] origin price::{}", tmpModel.modelCode, tmpModel.price);
				console.log("origin priceDisplay::"+tmpModel.priceDisplay);
				console.log("origin saveText::"+tmpModel.saveText);
				//[EPP] lowestWasPrice 적용
				tmpModel.price = tmpModel.lowestWasPrice;
				tmpModel.priceDisplay = currencyComma(tmpModel.lowestWasPrice, priceCurrency);
				/*
				if(siteCode === "hr"){
					tmpModel.priceDisplay = currencyComma(tmpModel.lowestWasPrice, priceCurrency)+" ("+euroToKunaPrice(tmpModel.lowestWasPrice)+")";
				}
				*/
				if(isNotNull(tmpModel.msrpPrice)){
					tmpModel.msrpPrice = tmpModel.lowestWasPrice;
					console.log("after msrpPrice::"+tmpModel.msrpPrice);
				}
				tmpModel.saveText = parseFloat(tmpModel.lowestWasPrice) - parseFloat(tmpModel.promotionPrice);
				tmpModel.lowestWasPriceUseYn = "Y";
				console.log("after price::"+tmpModel.price);
				console.log("after priceDisplay::"+tmpModel.priceDisplay);
				console.log("after saveText::"+tmpModel.saveText);
			}
		}

		/*
		 * viewOptionObj : 전체 옵션칩 리스트 
		 * optionTypeList : 옵션 타입만 담고 있는 리스트 ( 옵션타입의 index 값을 구하기 위해 생성함 )
		 */
		const optionTypeList = [];
		const viewOptionObj = {};
		if (tempProduct.chipOptions) {
			for (let a = 0; a < tempProduct.chipOptions.length; a++) {
				const optionData = tempProduct.chipOptions[a];
				const optionTypeTmp = optionData.fmyChipType;

				const optionListInType = optionData.optionList;
				for (let opl in optionListInType) {
					const thisOptionKey = optionData.fmyChipType + '+' +
						optionListInType[opl].optionCode.replace("\"", "").replace("&quot;", "") + '+' +
						optionListInType[opl].optionLocalName.replace("\"", "").replace("&quot;", "");
					if (tmpOptionListInModel[thisOptionKey] != null) {
						optionListInType[opl].modelIdx = tmpOptionListInModel[thisOptionKey];
					}
				}
				viewOptionObj[optionTypeTmp] = {};
				viewOptionObj[optionTypeTmp]["optionList"] = optionListInType;

				optionTypeList.push(optionTypeTmp);
			}
		}
		tempProduct.viewOptionObj = viewOptionObj;
		tempProduct.optionTypeList = optionTypeList;

		return tempProduct;
	};

	// imageUrl 앞에 scene7Domain을 붙임
	function imgDomain(imgUrl) {
		let newUrl = "";
		if (imgUrl) {
			if (imgUrl.indexOf("http:") > -1 || imgUrl.indexOf("//image-us.samsung.com/") > -1 || imgUrl.indexOf("//stg-images.samsung.com/") > -1 ||
				imgUrl.indexOf("//images.samsung.com/") > -1 || imgUrl.indexOf("image.samsung.com/") > -1) {
				newUrl = imgUrl;
			} else {
				newUrl = scene7Domain + imgUrl;
			}
		}
		return newUrl;
	};

	/**
	 *  Store Promotion / marketingMessage 영역
	 * 
	 *  GPv2 우선순위 (1개 노출)- buyBackDesc(in) > financeInfoAmount(갤럭시 포에버 문구) > financing > tradeIn > upgrade > premiumCare > storePromotions > usp( usp 는 optional이 아닐때 표시 )
	 *  HybrisIntg 우선순위 (1개 노출)-  tradeIn > financing >  upgrade > premiumCare > storePromotions > usp ( usp 는 optional이 아닐때 표시 )
	 *  Global - marketingMessage 상위 1 개
	 */
	function getPromotionText(frontModel) {
		let promotionText = "";

		if (isGPv2 || isNewHybris) {
			let tradeInDesc = [];
			let financingDesc = [];
			let upgradeDesc = [];
			let premiumCareDesc = [];

			if (frontModel.tradeInFormattedDesc != null && frontModel.tradeInFormattedDesc.length > 0) {
				tradeInDesc = frontModel.tradeInFormattedDesc;
			} else {
				tradeInDesc = frontModel.tradeInDesc;
			}
			if (frontModel.financingFormattedDesc != null && frontModel.financingFormattedDesc.length > 0) {
				financingDesc = frontModel.financingFormattedDesc;
			} else {
				financingDesc = frontModel.financingDesc;
			}
			if (frontModel.upgradeFormattedDesc != null && frontModel.upgradeFormattedDesc.length > 0) {
				upgradeDesc = frontModel.upgradeFormattedDesc;
			} else {
				upgradeDesc = frontModel.upgradeDesc;
			}
			if (frontModel.premiumCareFormattedDesc != null && frontModel.premiumCareFormattedDesc.length > 0) {
				premiumCareDesc = frontModel.premiumCareFormattedDesc;
			} else {
				premiumCareDesc = frontModel.premiumCareDesc;
			}

			// 20200810 IN Assured Buy Back 건 추가 :: S
			if (siteCode === "in" && frontModel.buyBackDesc != null) {
				promotionText = frontModel.buyBackDesc; // .replace(/(<([^>]+)>)/gi, "")
			} else if (frontModel.financeInfoAmount && frontModel.financeInfoValue) {
				promotionText = Granite.I18n.get("Enjoy the flagship experience at only {0} for {1} month", [currencyComma(frontModel.financeInfoAmount, priceCurrency), frontModel.financeInfoValue]);
			} else if (financingDesc && financingDesc.length > 0 && siteCode !== "uk") {
				// uk financingDesc 제거
				promotionText = financingDesc[0];
			} else if (tradeInDesc && tradeInDesc.length > 0) {
				promotionText = tradeInDesc[0];
			} else if (upgradeDesc && upgradeDesc.length > 0) {
				promotionText = upgradeDesc[0];
			} else if (premiumCareDesc && premiumCareDesc.length > 0) {
				promotionText = premiumCareDesc[0];
			} else if (frontModel.storePromotions && frontModel.storePromotions.length > 0) {
				if (frontModel.storePromotions[0].promotionFormattedText != null) {
					promotionText = frontModel.storePromotions[0].promotionFormattedText;
				} else {
					promotionText = frontModel.storePromotions[0].promotionText;
				}
			} else if (frontModel.usp && frontModel.usp.length > 0) {
				promotionText = frontModel.usp[0];
			}
		} else if (isHybrisIntg) {
			if (frontModel.tradeIn === "Y" && frontModel.tradeInDesc) {
				promotionText = frontModel.tradeInDesc;
			} else if (frontModel.financing === "Y" && frontModel.financingDesc) {
				promotionText = frontModel.financingDesc;
			} else if (frontModel.upgrade === "Y" && frontModel.upgradeDesc) {
				promotionText = frontModel.upgradeDesc;
			} else if (frontModel.premiumCare === "Y" && frontModel.premiumCareDesc) {
				promotionText = frontModel.premiumCareDesc;
			} else if (frontModel.storePromotions && frontModel.storePromotions.length > 0) {
				promotionText = frontModel.storePromotions[0];
			} else if (frontModel.usp && frontModel.usp.length > 0) {
				promotionText = frontModel.usp[0];
			}
		} else {
			if (frontModel.marketingMessage && frontModel.marketingMessage.length > 0) {
				promotionText = frontModel.marketingMessage[0];
			}
		}

		return promotionText;
	};
	
	/*
	* price Area
	*/
	function buildPriceArea(frontModel){
		
		var productCardTemplate = "";
		var priceDisplay = frontModel.priceDisplay;
		if((siteCode==="nl" || siteCode==="be" || siteCode ==="be_fr") && isNotNull(priceDisplay)){
			priceDisplay = deleteCurrency(priceDisplay, priceCurrency);
		}
		
		var emiPrice = "";
		var priceItem = "";
		
		var upperStock = frontModel.ctaType.toUpperCase();
		var usePriceArea = false;
		if((priceDisplayYn === "Y" && isNotNull(priceDisplay) && (siteCode !== "pl" || upperStock !== "OUTOFSTOCK"))
			|| (siteCode === "tr" && isNotNull(priceDisplay))){
			/* pl 국가이면서 Out Of Stock일경우 가격 미노출 */
			usePriceArea = true;
		}
		
		//Hybris Intg > tradeIn price text 표시
		var tradeInPriceText = "";
		
		if(isHybrisIntg && isNotNull(frontModel.tradeInPriceText) && !isMiniCardType) {
			tradeInPriceText = frontModel.tradeInPriceText;
		}
		
		if(usePriceArea){
			var promotionDisplay = "";
			var currentDisplay = priceDisplay;
			var priceTextForCompare = "";
			  
			// monthlyPrice data
			var useMonthlyPrice = false;
			var monthlyPrice = "";
			var tenureVal = "";
			var leasingInterest = "";
			
			// leasingInfo data
			var useLeasingInfo = false;
			var downPaymentFormatted = "";
			var tenureUnit = "";
			var monthlyRate = "";
			
			var usSuggestPriceAttr = "";
			var usUseTradeInDiscount = false;
			
			// msrpPrice
			var useMsrpPrice = false;
			var usCurrentPriceAttr = "";
			let financingInstallmentDescText = "";
			
			if(siteCode === "us"){
				// 기본 가격정보 셋팅 ( exit epp 할 경우 api 호출 없이 가격정보만 변경처리 )
				usDefaultCurrentPrice = frontModel.price;
				var usPromotionPriceForTradeIn = frontModel.listPrice;
				if(isNotNull(frontModel.promotionPrice)){
					usDefaultCurrentPrice = frontModel.promotionPrice;
					usPromotionPriceForTradeIn = frontModel.promotionPrice;
				}
				//[US] tradeInDiscount 가 있는 경우 > listPrice : 원가 , tradeInDiscount : save, 재고없음이 아닌 경우
				if(siteCode === "us" && isNotNull(frontModel.tradeInDiscount) && isNotNull(frontModel.listPrice)
						&& frontModel.tradeInDiscount != 0 && frontModel.listPrice != 0 && ( Number(frontModel.listPrice) > Number(frontModel.tradeInDiscount))
						&& upperStock !== "OUTOFSTOCK"){
					usUseTradeInDiscount = true;
					priceDisplay = currencyComma(frontModel.listPrice, priceCurrency);
					
					var usPromotionPriceForTradeIn = frontModel.listPrice;
					if(isNotNull(frontModel.promotionPrice)){
						usPromotionPriceForTradeIn = frontModel.promotionPrice;
					}
					
					usDefaultCurrentPrice = Number(usPromotionPriceForTradeIn) - Number(frontModel.tradeInDiscount);
					
					currentDisplay = 'From '+currencyComma(usDefaultCurrentPrice, priceCurrency)+' with trade-in<sup>θ</sup>';
				}
				usCurrentPriceAttr = ' data-de-currentprice="'+usDefaultCurrentPrice+'"';
				if(usUseTradeInDiscount){
					usCurrentPriceAttr += ' data-de-use-tradein="true"';
				}
				usSuggestPriceAttr = ' data-de-originpricetxt="'+priceDisplay+'"';
				
			}
			
			
			
			let rrpPricePSpan = ``;
			if((siteCode === "ro" || siteCode === "de") && parseFloat(frontModel.promotionPrice) !== parseFloat(frontModel.price)){
				rrpPricePSpan = `
				<span class="my-recommended-product__card-price-save-normal">${Granite.I18n.get("RRP {0}", [frontModel.priceDisplay])}</span>
				`;
			}
			
			if(isGPv2 || isNewHybris){
				if(isNotNull(frontModel.leasingInfo) && (siteCode === "nl" || siteCode === "be" ||siteCode === "be_fr") && frontModel.upgrade === "Y"){
					// nl 사이트만 leasingInfo 사용
					var leasingInfo = frontModel.leasingInfo;
					if(isNotNull(leasingInfo.monthlyRate) && isNotNull(leasingInfo.downPaymentFormatted)){
						monthlyRate = deleteCurrency(leasingInfo.monthlyRate, priceCurrency);
						tenureVal = leasingInfo.tenureVal;
						downPaymentFormatted = deleteCurrency(leasingInfo.downPaymentFormatted, priceCurrency);
						tenureUnit = leasingInfo.tenureUnit;
						useLeasingInfo = true;
					}
						
				} else if ( isNotNull(frontModel.monthlyPriceInfo)
						&& isNotNull(frontModel.monthlyPriceInfo.leasingMonthly) && isNotNull(frontModel.monthlyPriceInfo.leasingMonths) && isNotNull(frontModel.monthlyPriceInfo.interest)){
					monthlyPrice = frontModel.monthlyPriceInfo.leasingMonthly;
					monthlyPrice = currencyComma(monthlyPrice, priceCurrency);
					tenureVal = frontModel.monthlyPriceInfo.leasingMonths;
					leasingInterest = frontModel.monthlyPriceInfo.interest;
					useMonthlyPrice = true;
				}
				
				promotionDisplay = frontModel.promotionPriceDisplay;

				if(siteCode==="nl" || siteCode==="be" || siteCode ==="be_fr"){
					if(isNotNull(promotionDisplay)){
						promotionDisplay = deleteCurrency(promotionDisplay, priceCurrency);
					}
					if(isNotNull(frontModel.msrpPrice)){
						useMsrpPrice = true;
					}
				}
			} else {
				if( isNotNull(frontModel.monthlyPriceInfo) && 
						isNotNull(frontModel.monthlyPriceInfo.leasingMonthly) && isNotNull(frontModel.monthlyPriceInfo.leasingMonths) && 
						(siteCode === "au" || siteCode === "nz" || siteCode === "ae" || siteCode === "my" || siteCode === "sg" || siteCode === "ca" || siteCode === "ca_fr" ||
							siteCode === "it" || siteCode === "se" || siteCode === "dk" || siteCode === "fi" || siteCode === "no" || siteCode === "es" || siteCode === "pt" ||
							siteCode === "th" || siteCode === "tw" || siteCode === "ru" || siteCode === "ch" || siteCode === "ch_fr" || siteCode === "za" || siteCode === "br"  ||
							siteCode === "at")){
					var monthlyPriceInfo = frontModel.monthlyPriceInfo;
					monthlyPrice = monthlyPriceInfo.leasingMonthly;
					monthlyPrice = currencyComma(monthlyPrice, priceCurrency);
					tenureVal = monthlyPriceInfo.leasingMonths;

					useMonthlyPrice = true;
				}
				if(isHybrisIntg){
					promotionDisplay = frontModel.promotionPriceDisplay;
				}
			}
			
			if(isNotNull(promotionDisplay) && !usUseTradeInDiscount){
				currentDisplay = promotionDisplay;
			}
			
			//Save Text 영역 STR
			var topPrice = ``;
			var discountPrice = ``;
			if(isGPv2 || isNewHybris){
				if(isNotNull(promotionDisplay)){
					var listPrice = 0;
					if(frontModel.listPrice != null){
						listPrice = parseFloat(frontModel.listPrice) - parseFloat(frontModel.price);
					}
					
					var savePrice = parseFloat(frontModel.price) - parseFloat(frontModel.promotionPrice);
					
					if(usUseTradeInDiscount){
						savePrice = Number(frontModel.listPrice) - usCurrentPrice;
						frontModel.saveText = currencyComma(savePrice, priceCurrency);
					}
					
					if(savePrice !== 0 && isNotNull(frontModel.saveText)){
						var saveText = frontModel.saveText;
						var savePriceSpan = ``;
						
						if(siteCode !== "nl" && siteCode !== "be" && siteCode !== "be_fr"){
							/* GPv2 국가 save 문구 노출
							 * SEBN 국가 save 문구 미노출 처리 */
							savePriceSpan = `<span>${Granite.I18n.get("Save {0}", [currencyComma(saveText, priceCurrency)])}</span>`;
							/*
							if(siteCode === "hr") {
								savePriceSpan = `<span>${Granite.I18n.get("Save {0}", [currencyComma(saveText, priceCurrency) + " (" + euroToKunaPrice(saveText)+ ")"])}</span>`;
							}
							*/
						}
						var priceText = "";
						if(siteCode === "nl" || siteCode === "be" || siteCode === "be_fr" || siteCode === "de") {
							priceText = Granite.I18n.get("From {0}",[`<del>${priceDisplay}</del>`]);
						} else if((isStrikethroughRmSite && frontModel.lowestWasPriceUseYn !== "Y") || (siteCode === "ro" || siteCode === "de")) {
							priceText = "";
							savePriceSpan = ``;
							
						} else {
							priceText = `<del>${priceDisplay}</del>`;
						}
						
						topPrice = isNotNull(priceText) || isNotNull(savePriceSpan) ? `
								<span class="my-recommended-product__card-price-save-normal">${(siteCode=="in")? 'MRP (Inclusive of all taxes) ' : ''}</span>
								<span class="hidden">${Granite.I18n.get("Original Price")}: </span>
								${priceText}
								${savePriceSpan}
							`: ``;
					} else if(listPrice > 0 && (siteCode === "nl" || siteCode === "be" || siteCode === "be_fr")) {
						originPrice = frontModel.listPrice;
						discountPrice = frontModel.promotionPrice;
						topPrice = `
							<span class="hidden">${Granite.I18n.get("Original Price")}: </span>
							<span>${Granite.I18n.get("Listprice")}</span> ${currencyComma(frontModel.listPrice, priceCurrency)}
						`;
					}
					emiPrice = frontModel.promotionPrice;
				} else {
					emiPrice = frontModel.price;
				}
			} else if (isHybrisIntg){
				emiPrice = frontModel.price;
				if(isNotNull(frontModel.promotionPrice) && isNotNull(frontModel.promotionPriceDisplay) && (Number(frontModel.price) > Number(frontModel.promotionPrice))){
					emiPrice = frontModel.promotionPrice;
					discountPrice = frontModel.promotionPrice;
					topPrice = `
						<span class="hidden">${frontModel.afterTaxPriceDisplay}</span>
						<span class="hidden">${Granite.I18n.get("Original Price")}: </span>
						<del>${priceDisplay}</del>
					`;
				}
			} else {
				//global
				if(isNotNull(frontModel.formattedPriceSave) && siteCode !== "br"){
					topPrice = `
						<span class="hidden">${Granite.I18n.get("Price before discount")}: </span>
						${frontModel.formattedPriceSave}
					`;
				}
				if(isNotNull(frontModel.rrpPriceDisplay) && isNotNull(frontModel.formattedPriceSave) && siteCode === "br") {
					topPrice = `
						<span class="hidden">${Granite.I18n.get("Original Price")}: </span>
						<del>${frontModel.rrpPriceDisplay}</del>
						<span>${frontModel.formattedPriceSave}</span>
					`;
				}
				if(siteCode === "it"){
					topPrice = ``;
			
					if(isNotNull(frontModel.lowestWasPrice) && isNotNull(frontModel.promotionPrice)
							&& frontModel.promotionPrice < frontModel.lowestWasPrice
							){
						let savePrice = parseFloat(frontModel.lowestWasPrice) - parseFloat(frontModel.promotionPrice);
						let savePriceText = "";
						if(siteCode === "it"){
							savePriceText = Granite.I18n.get("Save the {0}%", [getDiscountRate(savePrice, frontModel.lowestWasPrice)]);
						} else {
							savePriceText = Granite.I18n.get("Save {0}", [currencyComma(savePrice, priceCurrency)]);
						}
						topPrice = `
							<span class="hidden">${Granite.I18n.get("Original Price")}: </span>
							<del>${frontModel.lowestWasPriceDisplay}</del>
							<span>${savePriceText}</span>
						`;
					}
				}
			}
			//Save Text 영역 END
			
			var mainPrice = "";
			//price area build
			if( (upperStock === "LEARNMORE" || upperStock === "NOORDER") && (siteCode === "nl" || siteCode === "be" || siteCode === "be_fr")){
				mainPrice = `
				<div class="my-recommended-product__card-price-current" data-pricetext="${priceDisplay}">
					<span class="hidden">${Granite.I18n.get("Total Price")}: </span>
					${priceDisplay}
				</div>
				`;
				emiPrice = frontModel.price;
			} else if(((isGPv2 || isNewHybris) && upperStock !== "LEARNMORE" && upperStock !== "NOORDER") || 
					(!isGPv2 && !isNewHybris && upperStock !== "LEARNMORE")){
				if( isNotNull(tradeInPriceText) ){
					mainPrice = `
					<div class="my-recommended-product__card-price-current" data-pricetext="${tradeInPriceText}">
						<span class="hidden">${Granite.I18n.get("Total Price")}: </span>
						${tradeInPriceText}
					</div>
					`;
				} else if(useMonthlyPrice && !usUseTradeInDiscount){
					
					if(siteCode === "id") {
						priceTextForCompare = Granite.I18n.get("pf From {0}/mo",[monthlyPrice]) + ' ';
					} else {
						priceTextForCompare = Granite.I18n.get("From {0}/mo",[monthlyPrice]) + ' ';
					}
					
					financingInstallmentDescText = priceTextForCompare;
					
					if(leasingInterest !== "" && siteCode !== "pe" && siteCode !== "cl" && siteCode !== "mx" && siteCode !== "co" && siteCode !== "de"){
						priceTextForCompare += Granite.I18n.get("for {0} mos at {1}% APR",[tenureVal, leasingInterest])+' ';
					} else {
						priceTextForCompare += Granite.I18n.get("for {0} mos",[tenureVal])+' ';
					}
					priceTextForCompare += Granite.I18n.get("or")+' ';
					
					
					var priceTextForCompareAttr = ' data-pricetext="' + priceTextForCompare + currentDisplay+'"';
					
					if(siteCode === "us"){
						priceTextForCompareAttr += ' data-de-pricetext="'+priceTextForCompare+'" data-de-currentprice="'+usDefaultCurrentPrice+'"'+ ' data-use-monthly="true"';
					}
					if(siteCode === "br") {
						var formattedPriceSave = isNotNull(frontModel.formattedPriceSave)?frontModel.formattedPriceSave:"";
						var afterTaxPriceDisplay = isNotNull(frontModel.afterTaxPriceDisplay)?frontModel.afterTaxPriceDisplay:"";
						priceTextForCompareAttr =
							' data-pricetext="' + currentDisplay + ' à vista ' + afterTaxPriceDisplay + ' em ' + tenureVal  + 'x ' + monthlyPrice + ' sem juros"';
						currentDisplay = currentDisplay + ' à vista ' + afterTaxPriceDisplay + ' em ' + tenureVal  + 'x ' + monthlyPrice + ' sem juros';

						let savingInformationTag = "";
						if(isNotNull(frontModel.rrpPriceDisplay) && isNotNull(frontModel.formattedPriceSave)){
							savingInformationTag = `
								<span class="my-recommended-product__card-price-current-normal">à vista</span>
								`;
						}
						mainPrice = `
						<div class="my-recommended-product__card-price-current" ${priceTextForCompareAttr} ${usCurrentPriceAttr}>
							<span class="hidden">${Granite.I18n.get("Total Price")}: </span>
							${currentDisplay}
							${savingInformationTag}
						</div>
						`;

					} else if(siteCode === "nl" || siteCode === "be" || siteCode === "be_fr"){
						var leasingUpfront = frontModel.monthlyPriceInfo.leasingUpfront;
						priceTextForCompareAttr = 
									' data-pricetext="'+currentDisplay+' '+Granite.I18n.get("or")+' '+ leasingUpfront  + " + " + monthlyPrice + " x " + tenureVal  + " " +  Granite.I18n.get("months")+'"';
						
						mainPrice = `
						<div class="my-recommended-product__card-price-current" ${priceTextForCompareAttr} ${usCurrentPriceAttr}>
							<span class="hidden">${Granite.I18n.get("Total Price")}: </span>
							${currentDisplay}
						</div>
						`;
					}else{
						mainPrice = `
						<div class="my-recommended-product__card-price-current" ${priceTextForCompareAttr} ${usCurrentPriceAttr}>
							<span class="hidden">${Granite.I18n.get("Total Price")}: </span>
							${currentDisplay}
						</div>
						`;
					}
				} else if(useLeasingInfo){

					if(downPaymentFormatted !== "" && tenureUnit !== "" && tenureVal !== "" && monthlyRate !== ""){
						var leasingText = " " + downPaymentFormatted + " + " + 
						tenureVal + " x " +
						monthlyRate + "/" + 
						Granite.I18n.get(tenureUnit);
						priceTextForCompare = currentDisplay + ' '+Granite.I18n.get("or")+' ' + leasingText;
						var priceTextForCompareAttr = ' data-pricetext="'+priceTextForCompare+'"';
						
						mainPrice = `
						<div class="my-recommended-product__card-price-current" ${priceTextForCompareAttr}>
							<span class="hidden">${Granite.I18n.get("Total Price")}: </span>
							${currentDisplay} ${Granite.I18n.get("or")} ${leasingText}
						</div>
						`;
					}
				} else {
					var priceTextForCompareAttr = ' data-pricetext="'+currentDisplay+'"';
					var defaultCurrentDisplay = currentDisplay;
					if(siteCode === "us"){
						priceTextForCompareAttr += ' data-de-pricetext="'+defaultCurrentDisplay+'" data-use-monthly="false"';
					}
					mainPrice = `
					<div class="my-recommended-product__card-price-current" ${priceTextForCompareAttr} ${usCurrentPriceAttr}>
						<span class="hidden">${Granite.I18n.get("Total Price")}: </span>
						${currentDisplay}
					</div>
					`;
				}
			}
			var advicedPriceDiv = "";
			var installmentSubSpan = "";
			/* Advice Price 적용 시 추가 */
			if(useMsrpPrice) {
				advicedPriceDiv = `${Granite.I18n.get("Listprice")} ${currencyComma(frontModel.msrpPrice, priceCurrency)}`;
			}
			if( useMonthlyPrice && (siteCode === "pe" || siteCode === "cl" || siteCode === "mx" || siteCode === "co" )){
				installmentSubSpan = `<span class="my-recommended-product__card-price-installment-sub">*Aplican condiciones</span>`;
			}
			var calcFinanceBtn = "";
			var financingHtml = "";
			
			let taggingAttrForEmi = `an-tr="myd11_recommended product cart_cta-product_click2" an-ca="option click" an-ac="recommended product" an-la="calculator"`;
			if(isHomePage){
				taggingAttrForEmi = `an-tr="myd11_recommended product card-home_content_click3" an-ca="home content click" an-ac="recommended product" an-la="calculator"`;
			}
			
			if(isGPv2 || isNewHybris) {
				var financingDesc = [];
				if(frontModel.financingFormattedDesc != null && frontModel.financingFormattedDesc.length > 0){
					financingDesc = frontModel.financingFormattedDesc;
				} else {
					financingDesc = frontModel.financingDesc;
				}
				if (isNotNull(financingDesc) && financingDesc.length > 0 && siteCode !== "us") {
					for(var fdi in financingDesc) {
						financingHtml = financingDesc[fdi];
						if(fdi == 0) {
							// var desc = String(financingDesc[fdi]).replace(Granite.I18n.get("Calculate Finance"), "").trim();
							if(isNotNull(emiPrice)) {
								if((siteCode === "in" || siteCode === "uk" || siteCode === "id" || siteCode === "ee" || siteCode === "lv" || siteCode === "lt" || siteCode === "pl" 
									|| siteCode === "ro" || siteCode === "ua" || siteCode === "ph"
									) && isNotNull(emiUrl)
									//&& frontModel.financing == "Y"
									) {
									financingHtml = `
										<button type="button" class="my-recommended-product__card-price-calculate js-pf-calculate-popup-open" data-type="install" data-modelcode="${frontModel.shopSkuCode}"
										data-link_info="${emiUrl}/?sku=${frontModel.shopSkuCode}&price=${emiPrice}&page=pf"
										${taggingAttrForEmi}>
											${Granite.I18n.get("Calculate Finance")}
										</button>
									`;//${financingDesc[fdi]}
								} else if(siteCode !== "in" && siteCode !== "uk" && isNotNull(financingUrl)) {
									var financeLayerUrl = financingUrl;
									if(siteCode !== "de") {
										financeLayerUrl +='/?total='+ emiPrice +'&page=pf';
									}
									if(siteCode!=="fr") {
										financingHtml = `
											<button type="button" class="my-recommended-product__card-price-calculate js-pf-calculate-popup-open" data-type="install"
											data-link_info="${financeLayerUrl}" aria-label="${financingDesc[fdi]}" ${isNewHybris? 'data-modelcode="' + frontModel.shopSkuCode + '"' : ""}
											${taggingAttrForEmi}>
												${Granite.I18n.get("Calculate Finance")}
											</button>
										`;//${financingDesc[fdi]}
									} else {
										financingHtml = `<button type="button" class="my-recommended-product__card-price-calculate">${Granite.I18n.get("Calculate Finance")}</button>`;
										//${financingDesc[fdi]}
									}
								}
							}
						}
					}
//					if(financingInstallmentDescText){
//						financingHtml = `
//										${financingInstallmentDescText}.
//										`;
//					}
					calcFinanceBtn = financingHtml;
				}
			} else if(isHybrisIntg) {
				if (frontModel.financing === "Y" && isNotNull(frontModel.financingDesc)) {
					financingHtml = frontModel.financingDesc;
					if(isNotNull(emiPrice) && isNotNull(financingUrl)) {
						var financeLayerUrl = financingUrl +'/?total='+ emiPrice +'&page=pf';
						financingHtml = `
							<button type="button" class="my-recommended-product__card-price-calculate js-pf-calculate-popup-open" data-type="install"
							aria-label="${Granite.I18n.get("Calculate Finance")}" data-link_info="${financeLayerUrl}" ${taggingAttrForEmi}>
								${frontModel.financingDesc}
							</button>
						`;
					}
				}
				calcFinanceBtn = financingHtml;
			}
			const lowestWasPriceDescription = (siteCode === "pl" && frontModel.lowestWasPriceUseYn === "Y")?`
						<span class="my-recommended-product__card-price-save-normal">${Granite.I18n.get("Lowest price 30 days before the discount:")}</span>
					`:``;
			if(siteCode === "co" && frontModel.vatEligible === "true"){
				priceItem = `
							<strong class="my-recommended-product__card-price-excluding-vat" data-pricetext="${frontModel.vatFreePriceDisplay}" >${Granite.I18n.get("Price without VAT")}: ${frontModel.vatFreePriceDisplay}</strong>
					`;
				if(isNotNull(promotionDisplay)){
					priceItem +=`
							<strong class="my-recommended-product__card-price-special" data-pricetext="${promotionDisplay}">${Granite.I18n.get("Price with discount")}: ${promotionDisplay}</strong>
							`;
				}
				priceItem += `
					<span class="my-recommended-product__card-price-rrp" data-pricetext="${priceDisplay}">${Granite.I18n.get("Price before")}: <del>${priceDisplay}</del></span>
					`;
			}else{
				priceItem = `
						${siteCode !== "cn" ? mainPrice : ""}
						<div class="my-recommended-product__card-price-save">
							${lowestWasPriceDescription}
							${isNotNull(rrpPricePSpan) ? rrpPricePSpan : topPrice}
						</div>
						${siteCode === "cn" ? mainPrice : ""}
						<div class="my-recommended-product__card-price-installment">
							<span class="my-recommended-product__card-price-installment-text">${advicedPriceDiv}${priceTextForCompare}</span>
							${installmentSubSpan}
							${calcFinanceBtn}
						</div>
						`;
			}
		}
		
		var productCardTemplate = `
			${priceItem}
		`;
		return productCardTemplate;
	}
	
	function buildRating(frontModel){
		let ratingHtml = "";
		var item = "";
		var ratings = frontModel.ratings;
		if(fnIsNull(ratings)){ 
			ratings = 0; 
			frontModel.ratings = 0;
		}

		// rating 반올림 처리
		var tmpCount = Math.pow(10,1);
		ratings = Math.round(ratings*tmpCount)/tmpCount;

		var ratingValue = parseFloat(ratings).toFixed(1),
		fullStarCnt = parseInt(ratings),
		cutStarWidthStyleNum = 0;
		cutStarWidthStyleNum = parseInt((ratingValue-fullStarCnt)*100);
		
		if(ratingValue !== "0.0"){
			frontModel.ratings = ratingValue;
		}

		for(var j=0; j<fullStarCnt;j++){
			item+='<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 100%;"></span></span>';
		}
		if(fullStarCnt < 5 && fullStarCnt > 0){
			item+='<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: ' + cutStarWidthStyleNum + '%;"></span></span>';
			for(var k=4;k>fullStarCnt;k--){
				item+='<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 0%;"></span></span>';
			}
		} else if ( fullStarCnt === 0 ){
			for(var empty_idx=0;empty_idx<5;empty_idx++){
				item+='<span class="rating__star-item"><span class="rating__star-empty"></span><span class="rating__star-filled" style="width: 0%;"></span></span>';
			}
		}
		frontModel.ratingHtml = item;
		frontModel.ratingsText = Granite.I18n.get("{0} out of {1} Stars",["<span>"+frontModel.ratings+"</span>","5"],siteCode);

		if(frontModel.ratings!=null && frontModel.ratings!=''){
			var ratingEmptyCls = "";
			if(frontModel.ratings == '0'){
				ratingEmptyCls = ' rating--empty';
			}
			var reviewUrl = '/'+siteCode+'/common/review/'+frontModel.modelCode+'/';
			if(frontModel.reviewUrl!=null && frontModel.reviewUrl!=''){
				reviewUrl = frontModel.reviewUrl;
			}
			
			ratingHtml +=
				`<span class="rating${ratingEmptyCls}">
					<span class="rating__inner">
						<span class="rating__star-list">
							${frontModel.ratingHtml}
						</span>
						<strong class="rating__point"><span class="hidden">${RATING_PRODUCT_I18n} : </span><span>${frontModel.ratings}</span></strong>
						<em class="rating__review-count">(<span class="hidden">${NUMBER_RATING_I18n} :</span><span>${frontModel.reviewCount}</span>)</em>
					</span>
				</span>`;
		}
		
		
		return ratingHtml;
	}

	function buildProductCardImage(product) {
		var frontModel = product.modelList[product.frontModelIdx];
		let imageItemHtml = "";
		let ctaType = frontModel.ctaTypeUpperCase;
		
		var price = "";
		var discountPrice = "";
		if (frontModel.price) {
			price = frontModel.price;
		}
		if (frontModel.promotionPrice) {
			discountPrice = frontModel.promotionPrice;
		}

		const displayNameAttr = escapeHtml((frontModel.displayName || "").replace(/<br>/ig, " ").replace(/<sup>/ig, " "));
		const dataModelCodeAttr = `data-modelcode="${frontModel.modelCode}"`;
		const dataModelNameAttr = `data-modelname="${frontModel.modelName}"`;
		const dataRequestidAttr = `data-requestid="${requestId}"`;

		let taggingAttr =
			`an-tr="myd11_recommended product card_cta-product_click2" an-ca="product click" an-ac="recommended product" an-la="image click" 
			${dataModelCodeAttr} ${dataModelNameAttr} ${dataRequestidAttr}`;
		if(isHomePage){
			taggingAttr =
			`an-tr="myd11_recommended product card_cta-home_content_click1" an-ca="home content click" an-ac="recommended product" an-la="image click" 
			${dataModelCodeAttr} ${dataModelNameAttr} ${dataRequestidAttr}`;
		}
		
		if (frontModel.thumbUrl) {
			const thumbImage = imgDomain(frontModel.thumbUrl);
			const thumbAlt = frontModel.thumbUrlAlt || "";

			imageItemHtml +=
				`
				<a class="my-recommended-product__card-image-link" href="${frontModel.pdpUrl}" ${taggingAttr}>
					<div class="my-recommended-product__card-image-item">
					<div class="image">
							<img class="image__preview lazy-load responsive-img" data-desktop-src="${thumbImage+lazyloadPreset}" data-mobile-src="${thumbImage+lazyloadPreset}" alt="${thumbAlt}">
							<img class="image__main lazy-load responsive-img" data-desktop-src="${thumbImage+desktopImagePreset}" data-mobile-src="${thumbImage+mobileImagePreset}" alt="${thumbAlt}">
						</div>
					</div>
				</a>
				`;
		}
		const cardImageHtml =
			`<div class="my-recommended-product__card-image">
				${imageItemHtml}
			</div>`
		return cardImageHtml;
	};

	/**
	 * viewOptionObj : 현재 그리고 있는 Product 의 전체 옵션정보
	 * optionChip 선택 시 화면에 표시해 줄 sku의 index 를 반환함
	 * selectOptionMoIdx : 현재 선택한 옵션의 moidx 값 
	 * otherSelectedOptionMoIdxList : 현재 선택한 타입을 제외한 타입중 선택된 나머지 옵션 리스트
	 * isColorType : 현재 타입이 color 인지에 대한 여부
	 * optionTypeList : 현재 그리고있는 Product 의  optionTypeList 
	 */
	function getSelectedModelIdx(viewOptionObj, selectOptionMoIdx, otherSelectedOptionMoIdxList, isColorType, optionTypeList) {
		var modelIdx = 0;
		var modelIdxList = selectOptionMoIdx.split(',');
		var firstIdx = modelIdxList[0];
		var memoryIdx = optionTypeList.indexOf("MEMORY");

		if (!isGPv2 && !isNewHybris && isColorType && memoryIdx > 0) {
			// [global, hybrisIntg] 상위 옵션이 color 이고, 하위에 같이 바뀌는 옵션이 memory 일 때 가장 큰값으로 선택처리
			var memoryOptionList = viewOptionObj["MEMORY"].optionList;
			var selectedModelIdx = 0;
			var highestOption = 0;
			for (var moi in memoryOptionList) {
				var temp_mi = memoryOptionList[moi].modelIdx.split(',');
				for (var tmi in temp_mi) {
					// 선택한 옵션칩의 modelIdx 리스트에 해당하는 model idx 가 있으면  비교 
					if (arrayContains(modelIdxList, temp_mi[tmi])) {
						var this_memory_num = memoryOptionList[moi].optionCode.replace("TB", "000").replace(/[^0-9]/g, "");
						if (highestOption < this_memory_num) {
							highestOption = this_memory_num;
							selectedModelIdx = temp_mi[tmi];
						}
						break;
					}
				}
			}
			modelIdx = selectedModelIdx;
		} else {
			var tempMappingModelIdx = [];
			for (var omi in otherSelectedOptionMoIdxList) {
				var otherMoIdx = otherSelectedOptionMoIdxList[omi];
				if (otherMoIdx) {
					var otherMoIdxArr = otherMoIdx.split(',');
					tempMappingModelIdx = [];
					for (var mli in modelIdxList) {
						if (otherMoIdxArr.indexOf(String(modelIdxList[mli])) > -1) {
							tempMappingModelIdx.push(modelIdxList[mli]);
						}
					}
					if (tempMappingModelIdx.length > 0) {
						modelIdxList = tempMappingModelIdx;
					}
				}
			}
			if (modelIdxList.length > 0) {
				modelIdx = modelIdxList[0];
			} else {
				modelIdx = firstIdx;
			}
		}
		return modelIdx;
	};
	/*
	* multiColor 유무, optionColorType에 따른 colorOptionHtml 작성(C1타입은 없음)
	*/
	var getColorOptionHtml = function(currentOption, isSelected){
		var resultColorOptionHtml = "";
		let colorOpt = ``;
		// multiColor 인경우
		if(isNotNull(currentOption.multiColorYN) && currentOption.multiColorYN === "Y"){
			const multiColorList = currentOption.multiColorList;
			const optionColorType = multiColorList.optionColorType;
			const optionCodeList = multiColorList.optionCodeList ?? [];

			const color1 = optionCodeList.length > 0? optionCodeList[0]: "";
			const color2 = optionCodeList.length > 1? optionCodeList[1]: "";
			const color3 = optionCodeList.length > 2? optionCodeList[2]: "";
			const color4 = optionCodeList.length > 3? optionCodeList[3]: "";
			const color5 = optionCodeList.length > 4? optionCodeList[4]: "";
			const color6 = optionCodeList.length > 5? optionCodeList[5]: "";
			
			if(optionColorType === "C1") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="35.999" viewBox="0 0 36 35.999">
						<g transform="translate(-18.001 9)">
							<rect width="36" height="35.999" transform="translate(18.001 -9)" fill="none" />
							<path d="M18,0A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="${color1}" />
							<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="rgba(0,0,0,0.5)" />
						</g>
					</svg>
				`;
			} else if(optionColorType === "C2_A") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 9)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g>
								<path d="M-3395,7250a18,18,0,0,1,18-18h0v36h0A18,18,0,0,1-3395,7250Z" transform="translate(3413 -7241)" fill="${color1}" />
								<path d="M-3377,7232a18,18,0,0,1,18,18,18,18,0,0,1-18,18Z" transform="translate(3413 -7241)" fill="${color2}" />
								<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(17.999 -9)" fill="rgba(0,0,0,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C2_B") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 9)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g>
								<path d="M-3395,7250a18,18,0,0,1,18-18,18,18,0,0,1,18,18Z" transform="translate(3413 -7241)" fill="${color1}" />
								<path d="M-3395,7250h36a18,18,0,0,1-18,18A18,18,0,0,1-3395,7250Z" transform="translate(3413 -7241)" fill="${color2}" />
								<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(17.999 -9)" fill="rgba(0,0,0,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C3_A") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(27.001 -17.999) rotate(90)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g transform="translate(18 -3.005) rotate(-90)">
								<path d="M-1047.672,8501.792a18.1,18.1,0,0,1-1.321-6.168c0-.027,0-.056,0-.083s0-.06,0-.09a18.092,18.092,0,0,1,1.906-8.522c.009-.017.017-.036.028-.053.017-.036.034-.068.051-.1.028-.054.058-.109.085-.162,0,0,0,0,0-.007.109-.205.22-.405.337-.608l0,0a18.019,18.019,0,0,1,1.92-2.717,18.076,18.076,0,0,1,2.2-2.157,18.042,18.042,0,0,1,2.467-1.712,18.109,18.109,0,0,1,2.674-1.264,18.212,18.212,0,0,1,3.76-.967.18.18,0,0,0,.032,0,.045.045,0,0,0,.017,0A18.394,18.394,0,0,1-1031,8477v18h0l-15.583,9A18.227,18.227,0,0,1-1047.672,8501.792Z" transform="translate(1019 -8477.001)" fill="${color1}" />
								<path d="M-1049,8494.994h0v-18a18.692,18.692,0,0,1,2.051.115,18.089,18.089,0,0,1,4.971,1.313.644.644,0,0,0,.068.025.02.02,0,0,0,.015.009,17.41,17.41,0,0,1,1.889.95,18.359,18.359,0,0,1,2.047,1.374c.015.013.032.023.047.036s.034.028.051.041a18.122,18.122,0,0,1,4.446,5.135h0a18.843,18.843,0,0,1,.9,1.783l.045.1s0,0,0,0a18.093,18.093,0,0,1,1.462,6.915c0,.023,0,.047,0,.073v.1a18.107,18.107,0,0,1-1.622,7.482l-.032.073c-.009.019-.019.038-.028.058-.22.474-.463.94-.73,1.4Z" transform="translate(1037.001 -8477)" fill="${color2}" />
								<path d="M-1034.289,8494.979a18.08,18.08,0,0,1-9.093-2.986c-.017-.013-.036-.023-.053-.036a.663.663,0,0,1-.062-.043,18.052,18.052,0,0,1-4.213-3.972l-.1-.128a18.141,18.141,0,0,1-1.2-1.816l15.589-9,15.585,9a18.048,18.048,0,0,1-2.04,2.858.119.119,0,0,1-.015.016l-.077.089a18.1,18.1,0,0,1-2.673,2.456l-.026.02-.1.077a18.052,18.052,0,0,1-9.792,3.466c-.051,0-.1.007-.158.007a.029.029,0,0,1-.013,0c-.228.009-.458.013-.689.013C-1033.709,8495-1034,8495-1034.289,8494.979Z" transform="translate(1021.412 -8459.007)" fill="${color3}" />
								<path d="M18,1A17,17,0,0,0,5.979,30.021,17,17,0,1,0,30.021,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(-30.004 0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C3_B") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 -4)">
							<rect width="36" height="36" transform="translate(18 4)" fill="none" />
							<g transform="translate(17.999 4.001)">
								<path d="M0,18A18.006,18.006,0,0,1,12,1.024v33.95A18.006,18.006,0,0,1,0,18Z" transform="translate(0 0)" fill="${color1}" />
								<path d="M0,34.974V1.024a18.086,18.086,0,0,1,12,0v33.95a18.085,18.085,0,0,1-12,0Z" transform="translate(12 0)" fill="${color2}" />
								<path d="M0,16.975A18.007,18.007,0,0,0,12,33.95V0A18.007,18.007,0,0,0,0,16.975Z" transform="translate(36 34.975) rotate(180)" fill="${color3}" />
								<path d="M18,35A17,17,0,0,0,30.02,5.979,17,17,0,1,0,5.979,30.019,16.889,16.889,0,0,0,18,35m0,1A18,18,0,1,1,36,18,18,18,0,0,1,18,36Z" transform="translate(0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C3_C") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
						<g transform="translate(-18 -4)">
							<rect width="36" height="36" transform="translate(18 4)" fill="none" />
							<g transform="translate(53.999 4) rotate(90)">
								<path d="M0,18A18.006,18.006,0,0,1,12,1.024v33.95A18.006,18.006,0,0,1,0,18Z" transform="translate(0 0)" fill="${color1}" />
								<path d="M0,34.974V1.024a18.086,18.086,0,0,1,12,0v33.95a18.085,18.085,0,0,1-12,0Z" transform="translate(12 0)" fill="${color2}" />
								<path d="M0,16.975A18.007,18.007,0,0,0,12,33.95V0A18.007,18.007,0,0,0,0,16.975Z" transform="translate(36 34.975) rotate(180)" fill="${color3}" />
								<path d="M18,35A17,17,0,0,0,30.02,5.979,17,17,0,1,0,5.979,30.019,16.889,16.889,0,0,0,18,35m0,1A18,18,0,1,1,36,18,18,18,0,0,1,18,36Z" transform="translate(0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "C4_A") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 9)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g>
								<path d="M-3395,7250a18,18,0,0,1,18-18v18Z" transform="translate(3413 -7241)" fill="${color1}" />
								<path d="M-3377,7250v-18a18,18,0,0,1,18,18Z" transform="translate(3413 -7241)" fill="${color2}" />
								<path d="M-3377,7250h18a18,18,0,0,1-18,18Z" transform="translate(3413 -7241)" fill="${color3}" />
								<path d="M-3395,7250h18v18h0A18,18,0,0,1-3395,7250Z" transform="translate(3413 -7241)" fill="${color4}" />
								<path d="M18,35A17,17,0,0,0,30.02,5.979,17,17,0,1,0,5.979,30.019,16.889,16.889,0,0,0,18,35m0,1A18,18,0,1,1,36,18,18,18,0,0,1,18,36Z" transform="translate(0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else if(optionColorType === "CP") {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36.001" height="36" viewBox="0 0 36.001 36">
						<g transform="translate(-17.999 9)">
							<rect width="36" height="36" transform="translate(18 -9)" fill="none" />
							<g>
								<path d="M1.333,15.8A18.1,18.1,0,0,1,.01,9.628c0-.027,0-.055,0-.082s0-.06,0-.089A18.086,18.086,0,0,1,1.91.935L1.938.88l.053-.1L2.074.614l0-.007Q2.239.3,2.413,0L18,9,2.413,18A18.157,18.157,0,0,1,1.333,15.8Z" transform="translate(-30.005 8.994)" fill="${color1}" />
								<path d="M0,9A17.9,17.9,0,0,1,6.584,2.41,18.351,18.351,0,0,1,9.257,1.145a18.061,18.061,0,0,1,3.667-.95l.132-.019.019,0A18.137,18.137,0,0,1,15.582,0V18Z" transform="translate(-27.587 0)" fill="${color2}" />
								<path d="M0,18V0A18.223,18.223,0,0,1,2.05.115,18.011,18.011,0,0,1,7.021,1.427l.068.026a.028.028,0,0,0,.015.008,17.506,17.506,0,0,1,1.89.949,18.328,18.328,0,0,1,2.047,1.376l.046.035.052.041A18.106,18.106,0,0,1,15.585,9Z" transform="translate(-12.003 0)" fill="${color3}" />
								<path d="M0,9,15.583,0a18.31,18.31,0,0,1,.9,1.785l.045.1v0A18.087,18.087,0,0,1,18,8.808c0,.023,0,.048,0,.072s0,.064,0,.1a18.082,18.082,0,0,1-1.621,7.483l-.033.073-.027.058q-.332.71-.731,1.4Z" transform="translate(-12.004 8.997)" fill="${color4}" />
								<path d="M0,0,15.585,9a18.082,18.082,0,0,1-2.041,2.858l-.014.016-.078.089a18.166,18.166,0,0,1-2.672,2.457l-.027.02-.1.075A18.057,18.057,0,0,1,.86,17.979L.7,17.986H.688C.46,18,.23,18,0,18Z" transform="translate(-12.005 17.994)" fill="${color5}" />
								<path d="M14.717,17.98a18.082,18.082,0,0,1-9.094-2.987l-.054-.036-.062-.042A18.087,18.087,0,0,1,1.3,10.942h0l-.1-.127A18.134,18.134,0,0,1,0,9L15.589,0V18C15.3,18,15.006,17.994,14.717,17.98Z" transform="translate(-27.593 17.993)" fill="${color6}" />
								<path d="M18,1A17,17,0,0,0,5.979,30.021,17,17,0,1,0,30.021,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(-30.004 0)" fill="rgba(29,29,27,0.5)" />
							</g>
						</g>
					</svg>
				`;
			} else {
				colorOpt = `
					<svg xmlns="http://www.w3.org/2000/svg" width="36" height="35.999" viewBox="0 0 36 35.999">
						<g transform="translate(-18.001 9)">
							<rect width="36" height="35.999" transform="translate(18.001 -9)" fill="none" />
							<path d="M18,0A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="${currentOption.optionCode}" />
							<!--/* [D] 제일 마지막 태그인 path의 fill 속성 값 변경 제외 */-->
							<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="rgba(0,0,0,0.5)" />
						</g>
					</svg>
				`;
			}
		} else {
			colorOpt = `
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="35.999" viewBox="0 0 36 35.999">
					<g transform="translate(-18.001 9)">
						<rect width="36" height="35.999" transform="translate(18.001 -9)" fill="none" />
						<path d="M18,0A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="${currentOption.optionCode}" />
						<!--/* [D] 제일 마지막 태그인 path의 fill 속성 값 변경 제외 */-->
						<path d="M18,1A17,17,0,0,0,5.979,30.019,17,17,0,1,0,30.02,5.979,16.889,16.889,0,0,0,18,1m0-1A18,18,0,1,1,0,18,18,18,0,0,1,18,0Z" transform="translate(18.001 -9)" fill="rgba(0,0,0,0.5)" />
					</g>
				</svg>
			`;
		}
		let currentOptionLocalNameTag = `<span class="hidden">${currentOption.optionLocalName}</span>`;
		
		resultColorOptionHtml = `
			<span class="option-selector__color-code">
				${colorOpt}
			</span>
			${currentOptionLocalNameTag}
		`;
		return resultColorOptionHtml;
	}
	
	function productCardFmyOptionBuild(product) {
		let optionHtml = "";
		let isColorOptionUse = false;
		let isOtherOptionUse = false;

		if (product.viewOptionObj && Object.keys(product.viewOptionObj).length > 0) {
			// 상위 선택된 옵션칩의 model idx : disable 처리 할때 사용 ( idx에 해당되지않으면 disabled )
			let parentOptionModelIdx = "";
			let viewOptionIdx = 0;
			const curViewOptionObj = product.viewOptionObj;
			const curOptionTypeList = product.optionTypeList;
			let prodCardNum = product.rank;
			
			for (let type in product.viewOptionObj) {
				const optionObj = product.viewOptionObj[type].optionList;
				let isSelected = false;
				let currentOption = {};
				let disabledClass = "";
				let selectorWrapperStyle = "";

				if (product.viewOptionObj[type].styleAttr) {
					selectorWrapperStyle = product.viewOptionObj[type].styleAttr;
				}
				
				var selectedColor = "";
				for(var option in optionObj){
					currentOption = optionObj[option];
					
					var modelIdxList = currentOption.modelIdx.split(',');
					if(currentOption.modelIdx != null && arrayContains(modelIdxList, String(product.frontModelIdx))){
						selectedColor = currentOption.optionLocalName;
					}
				}

				if (type === "COLOR") {
					isColorOptionUse = true;
					let curSelecteModelIdx = "";
					let colorOptionHtml = "";
					
					for (let oi = 0; oi < optionObj.length; oi++) {
						/* 선택되어있는(대표모델) 옵션 flag값 셋팅 */
						currentOption = optionObj[oi];
						isSelected = false;
						const modelIdxList = currentOption.modelIdx.split(',');
						let colorOptCnt = oi + 1;

						if (currentOption.modelIdx != null && arrayContains(modelIdxList, String(product.frontModelIdx))) {
							isSelected = true;
							curSelecteModelIdx = currentOption.modelIdx;
							disabledClass = "";
						} else {
							disabledClass = " is-disabled";

							if (viewOptionIdx === 0) {
								disabledClass = "";
							} else {
								const parentModelIdxList = parentOptionModelIdx.split(',');
								for (let mli in modelIdxList) {
									//상위 선택된 옵션칩 의 model idx 에 일치하는 model idx 가 있는 경우 활성화
									if (arrayContains(parentModelIdxList, modelIdxList[mli])) {
										disabledClass = "";
										break;
									}
								}
							}
						}

						// 각 옵션칩의 model 정보 셋팅 ( 태깅 )
						let modelCodeTagging = "";
						let modelNameTagging = "";
						let modelIdx;
						if (disabledClass === "") {
							const curSelectOptionMoIdx = currentOption.modelIdx;
							const otherSelectedOptionMoIdxList = [];
							const isColorType = true;

							for (let ooi in curViewOptionObj) {
								if (ooi !== type) {
									const tmp_optionList = curViewOptionObj[ooi].optionList;
									for (let toi in tmp_optionList) {
										const tmp_option = tmp_optionList[toi];
										const tmp_optionMoIdx = tmp_option.modelIdx;
										const tmp_optionMoIdxArr = tmp_optionMoIdx.split(',');

										// 현재 선택되어있는 option 색출
										if (tmp_optionMoIdxArr.indexOf(String(product.frontModelIdx)) > -1) {
											otherSelectedOptionMoIdxList.push(tmp_optionMoIdx);
										}
									}

								}
							}

							modelIdx = getSelectedModelIdx(curViewOptionObj, curSelectOptionMoIdx, otherSelectedOptionMoIdxList, isColorType, curOptionTypeList);
							if (product.modelList.length > modelIdx && product.modelList[modelIdx]) {
								modelCodeTagging = product.modelList[modelIdx].modelCode;
								modelNameTagging = product.modelList[modelIdx].modelName;
							}
						}
						let taggingAttrForOption = `
									an-tr="myd11_recommended product card_cta-product_click2" an-ca="option click" an-ac="recommended product" an-la="${type.toLowerCase()}:${currentOption.optionName.toLowerCase()}"
									data-modelcode="${modelCodeTagging}" data-modelname="${modelNameTagging}"`;
						if(isHomePage){
							taggingAttrForOption = `
									an-tr="myd11_recommended product card-home_content_click2" an-ca="home content click" an-ac="recommended product" an-la="${type.toLowerCase()}:${currentOption.optionName.toLowerCase()}"
									data-modelcode="${modelCodeTagging}" data-modelname="${modelNameTagging}"`;
						}
						colorOptionHtml +=`
							<span class="option-selector__swiper-slide${isSelected?" is-active":""}${disabledClass}" role="listitem">
								<span class="option-selector__color js-pf-product-fmychip">
									<input type="radio" id="color-0${colorOptCnt}-${modelCodeTagging}" name="product-0${prodCardNum}-color-${modelCodeTagging}"
									data-chiptype="color" data-modeli="${modelIdx}"${disabledClass?" disabled":""}
									${taggingAttrForOption} ${isSelected?" checked":""}>
									<label for="color-0${colorOptCnt}-${modelCodeTagging}">
										${getColorOptionHtml(currentOption, isSelected)}
									</label>
								</span>
							</span>
							`;
					}
					parentOptionModelIdx = curSelecteModelIdx;

					optionHtml +=`
						<div class="my-recommended-product__card--color">
							<div class="option-selector__color-name">${COLOR_I18n} : <span class="color-name-text">${selectedColor}</span></div>
							<div class="option-selector__wrap option-selector__wrap--color-chip" data-global-text='{ "selected" : "selected" }'>
								<div class="option-selector__swiper">
									<div class="option-selector__swiper-container">
										<div class="option-selector__swiper-wrapper" style="${selectorWrapperStyle}" role="list">
											${colorOptionHtml}
										</div>
									</div>
									<button type="button" class="option-selector__button-prev" aria-label="Previous" role="button" aria-disabled="true" ${arrowLeftTaggingAttr}>
										<span class="hidden">Previous</span>
										<svg class="icon" focusable="false">
											<use xlink:href="#previous-regular" href="#previous-regular"></use>
										</svg>
									</button>
									<button type="button" class="option-selector__button-next" aria-label="Next" role="button" aria-disabled="true" ${arrowRightTaggingAttr}>
										<span class="hidden">Next</span>
										<svg class="icon" focusable="false">
											<use xlink:href="#next-regular" href="#next-regular"></use>
										</svg>
									</button>
								</div>
							</div>
						</div>
						`;
				} else {
					isOtherOptionUse = true;
					let curSelecteModelIdx = "";
					let memoryOptionHtml = "";
					for (let oi = 0; oi < optionObj.length; oi++) {
						/* 선택되어있는(대표모델) 옵션 flag값 셋팅 */
						currentOption = optionObj[oi];
						isSelected = false;
						const modelIdxList = currentOption.modelIdx.split(',');
						let memoryOptCnt = oi + 1;

						if (currentOption.modelIdx != null && arrayContains(modelIdxList, String(product.frontModelIdx))) {
							isSelected = true;
							curSelecteModelIdx = currentOption.modelIdx;
							disabledClass = "";
						} else {
							disabledClass = " is-disabled";
							if (viewOptionIdx === 0) {
								disabledClass = "";
							} else {
								const parentModelIdxList = parentOptionModelIdx.split(',');

								for (let mli in modelIdxList) {
									//상위 선택된 옵션칩 의 model idx 에 일치하는 model idx 가 있는 경우 활성화
									if (arrayContains(parentModelIdxList, modelIdxList[mli])) {
										disabledClass = "";
										break;
									}
								}
							}
						}

						// 각 옵션칩의 model 정보 셋팅 ( 태깅 )
						let modelCodeTagging = "";
						let modelNameTagging = "";
						let modelIdx;

						if (disabledClass === "") {
							const curSelectOptionMoIdx = currentOption.modelIdx;
							const otherSelectedOptionMoIdxList = [];
							const isColorType = false;

							for (let ooi in curViewOptionObj) {
								if (ooi !== type) {
									const tmp_optionList = curViewOptionObj[ooi].optionList;
									for (let toi in tmp_optionList) {
										const tmp_option = tmp_optionList[toi];
										const tmp_optionMoIdx = tmp_option.modelIdx;
										const tmp_optionMoIdxArr = tmp_optionMoIdx.split(',');

										// 현재 선택되어있는 option 색출
										if (tmp_optionMoIdxArr.indexOf(String(product.frontModelIdx)) > -1) {
											otherSelectedOptionMoIdxList.push(tmp_optionMoIdx);
										}
									}

								}
							}

							modelIdx = getSelectedModelIdx(curViewOptionObj, curSelectOptionMoIdx, otherSelectedOptionMoIdxList, isColorType, curOptionTypeList);
							if (product.modelList.length > modelIdx && product.modelList[modelIdx]) {
								modelCodeTagging = product.modelList[modelIdx].modelCode;
								modelNameTagging = product.modelList[modelIdx].modelName;
							}
						}
						let taggingAttrForOption = `
									an-tr="myd11_recommended product card_cta-product_click2" an-ca="option click" an-ac="recommended product" an-la="${type.toLowerCase()}:${currentOption.optionName.toLowerCase()}"
									data-modelcode="${modelCodeTagging}" data-modelname="${modelNameTagging}"`;
						if(isHomePage){
							taggingAttrForOption = `
									an-tr="myd11_recommended product card-home_content_click2" an-ca="home content click" an-ac="recommended product" an-la="${type.toLowerCase()}:${currentOption.optionName.toLowerCase()}"
									data-modelcode="${modelCodeTagging}" data-modelname="${modelNameTagging}"`;
						}
						memoryOptionHtml +=`
							<span class="option-selector__swiper-slide${isSelected?" is-active":""}${disabledClass}" role="listitem">
								<span class="option-selector__size js-pf-product-fmychip">
									<input type="radio" id="memory-0${memoryOptCnt}-${modelCodeTagging}" name="product-0${prodCardNum}-${type.toLowerCase().replace(" ", "-")}-${modelCodeTagging}"
									data-chiptype="other" data-modeli="${modelIdx}"${disabledClass?" disabled":""} ${taggingAttrForOption} ${isSelected?" checked":""}>
									<label class="option-selector__size-label" for="memory-0${memoryOptCnt}-${modelCodeTagging}">
										<span class="option-selector__size-label-text">${currentOption.optionLocalName}<span></span></span>
									</label>
								</span>
							</span>
							`;
					}
					parentOptionModelIdx = curSelecteModelIdx;
					optionHtml +=`
						<div class="my-recommended-product__card--capacity">
							<div class="option-selector__wrap option-selector__wrap--capacity" data-global-text='{ "selected" : "selected" }'>
								<div class="option-selector__swiper">
									<div class="option-selector__swiper-container" aria-live="polite">
										<div class="option-selector__swiper-wrapper" style="${selectorWrapperStyle}" role="list">
											${memoryOptionHtml}
											<div class="option-selector__floating-bar" style="display: none;"></div>
										</div>
									</div>
									<button type="button" class="option-selector__button-prev" aria-label="Previous" role="button" aria-disabled="true" ${arrowLeftTaggingAttr}>
										<span class="hidden">Previous</span>
										<svg class="icon" focusable="false">
											<use xlink:href="#previous-regular" href="#previous-regular"></use>
										</svg>
									</button>
									<button type="button" class="option-selector__button-next" aria-label="Next" role="button" aria-disabled="true" ${arrowRightTaggingAttr}>
										<span class="hidden">Next</span>
										<svg class="icon" focusable="false">
											<use xlink:href="#next-regular" href="#next-regular"></use>
										</svg>
									</button>
								</div>
							</div>
						</div>
						`;
				}
				viewOptionIdx++;
			}
		}
		if(!isColorOptionUse){
			optionHtml = `
					<div class="my-recommended-product__card--color">
					</div>` + optionHtml;
		}
		if(!isOtherOptionUse){
			optionHtml = 
					optionHtml + `
					<div class="my-recommended-product__card--capacity">
					</div>`;
		}
		
		return optionHtml;
	};
	/*
	* energyLabe, repairbility
	*/
	function energyLabelBuild(frontModel){
		var energyLabelHtml = "";

		energyLabelHtml +=
			'<div class="my-recommended-product__card-energy-label">';
			
		var energySplitUrl,ficheSplitUrl = "";
		if(isNotNull(frontModel.energyFileUrl)){
			energySplitUrl = frontModel.energyFileUrl.split("/");
		}
		if(isNotNull(frontModel.ficheFileUrl)){
			ficheSplitUrl = frontModel.ficheFileUrl.split("/");
		}
		if(isNotNull(frontModel.energyLabelGrade) && isNotNull(frontModel.energyLabelClass1) && isNotNull(frontModel.newEnergyLabel) && frontModel.newEnergyLabel !== "Y"){
			energyLabelHtml += 
				'<div class="fiche-badge">';
			if(isNotNull(frontModel.ficheFileUrl)){
				energyLabelHtml +=
					'<a href="'+frontModel.ficheFileUrl+'" target="_blank" aria-label="'+Granite.I18n.get("Product Fiche")+' '+ficheSplitUrl[ficheSplitUrl.length-1]+': '+ Granite.I18n.get("Open in a new window")+'" class="cta-text" ' + eneryLabelTaggingAttr + '>'+
						Granite.I18n.get("Product Fiche")+
					'</a>';
			}
			energyLabelHtml +=
				'<a class="badge '+frontModel.energyLabelClass2+'" href="'+frontModel.energyFileUrl+'" aria-label="'+frontModel.energyLabelGrade+' '+energySplitUrl[energySplitUrl.length-1]+': '+ Granite.I18n.get("Open in a new window")+'" target="_blank" aria-label="'+Granite.I18n.get("Open in a new window")+'" ' + eneryLabelTaggingAttr + '>'+
					'<span class="badge__grade--with-text '+frontModel.energyLabelClass1+'">'+
						'<span class="hidden">'+frontModel.energyLabelGrade+'</span>'+
					'</span>'+
				'</a>';
			energyLabelHtml += 
				'</div>';
		}else if(isNotNull(frontModel.energyLabelGrade) && isNotNull(frontModel.energyLabelClass1) && isNotNull(frontModel.energyFileUrl) && frontModel.newEnergyLabel=="Y"){
			energyLabelHtml += 
				'<div class="badge-energy-label">';
			if(isNotNull(frontModel.ficheFileUrl)){
				energyLabelHtml +=
					'<a class="badge-energy-label__text" href="'+frontModel.ficheFileUrl+'" target="_blank" aria-label="'+Granite.I18n.get("PRODUCT INFORMATION SHEET")+' '+ficheSplitUrl[ficheSplitUrl.length-1]+': '+Granite.I18n.get("Open in a new window")+'" ' + eneryLabelTaggingAttr + '>' +
						Granite.I18n.get("PRODUCT INFORMATION SHEET") +
					'</a>';

				let energyLabelClass = "";
				if(frontModel.energyLabelClass){ //energyLabelClass 있으면
					energyLabelClass = frontModel.energyLabelClass;
				}else{ //energyLabelClass 없으면
					energyLabelClass = frontModel.energyLabelClass1;
				}
				energyLabelHtml += 
					'<a class="badge-energy-label__badge '+energyLabelClass+'" href="'+frontModel.energyFileUrl+'" target="_blank" aria-label="'+frontModel.energyLabelGrade+' '+energySplitUrl[energySplitUrl.length-1]+': '+ Granite.I18n.get("Open in a new window")+'"' + eneryLabelTaggingAttr + '>'+
						frontModel.energyLabelGrade +
					'</a>';
			}
			energyLabelHtml += 
				'</div>';
		}
		energyLabelHtml +=
			'</div>';
		//	Repairbility STR
		energyLabelHtml +=
			'<div class="my-recommended-product__card-repairability">';
			
		/* // repairability 가 있으면 아래 마크업 적용 */
		if(isNotNull(frontModel.repairabilityIndex)){
			var repairabilityIndex = Number(frontModel.repairabilityIndex);
			var repairabilityAlt = Granite.I18n.get("Repairability Index : {0} / 10", [repairabilityIndex] );
			
			if(siteCode=="fr" || siteCode=="test"){
				var reparabiliteUrl = isNotNull(frontModel.repairabilityIndexPdfUrl) ? frontModel.repairabilityIndexPdfUrl :'/fr/indice-reparabilite/';
				var tempArr = reparabiliteUrl.split("/");
				var reparabiliteFileName = tempArr[tempArr.length-1];
				let taggingAttr = `an-tr="myd11_recommended product:option-${pageTrack}-repairability index-option_click4" an-ca="option click" an-ac="recommended product" an-la="repairability index"`;
				if(isHomePage){
					taggingAttr = `an-tr="myd11_recommended product card-home_content_click3" an-ca="home content click" an-ac="recommended product" an-la="repairability index"`;
				}
				energyLabelHtml += 
					'<span class="badge-repairability">'+
						'<a href="'+ reparabiliteUrl +'" target="_blank" aria-label="Indice de réparabilité" '+ taggingAttr +'>'+
							'<img class="badge-repairability__image" src="//images.samsung.com/is/image/samsung/'+ siteCode +'/icon/consumer/repairability_index_'+ repairabilityIndex +'.png" alt="'+repairabilityAlt+'">'+
						'</a>'+
					'</span>';
			}else{
				energyLabelHtml += 
					'<span class="badge-repairability">'+
						'<img class="badge-repairability__image" src="//images.samsung.com/is/image/samsung/'+ siteCode +'/icon/consumer/repairability_index_'+ repairabilityIndex +'.png" alt="'+repairabilityAlt+'">'+
					'</span>';
			}
			
		}
		energyLabelHtml +=
			'</div>';
		
		return energyLabelHtml;
	}

	function buildProductCard(product, swiperIdx, wrapUse) {
		const frontModel = product.modelList[product.frontModelIdx];
		
		let ctaType = frontModel.ctaTypeUpperCase;
		
		var price = "";
		var discountPrice = "";
		if (frontModel.price) {
			price = frontModel.price;
		}
		if (frontModel.promotionPrice) {
			discountPrice = frontModel.promotionPrice;
		}

		const displayNameAttr = escapeHtml((frontModel.displayName || "").replace(/<br>/ig, " ").replace(/<sup>/ig, " "));
		const dataModelCodeAttr = `data-modelcode="${frontModel.modelCode}"`;
		const dataModelNameAttr = `data-modelname="${frontModel.modelName}"`;

		// pre order, buy now, add to cart 에 사용
		const taggingAttrForBuy =
			`data-pimsubtype="${(product.categorySubTypeEngName || "").toLowerCase()}" data-pvitype="${(frontModel.pviTypeName || "").toLowerCase()}" data-pvisubtype="${(frontModel.pviSubtypeName || "").toLowerCase()}" 
			data-modelrevenue="${price}" data-modelprice="${price}" data-modelqty="1" data-modelcurrency="${priceCurrency}" data-modeldisplay="${displayNameAttr}" data-discountprice="${discountPrice}" ${dataModelCodeAttr} ${dataModelNameAttr}`;

		let covatClass = "";
		if(siteCode === "co" && frontModel.vatEligible === "true"){
			covatClass = " my-recommended-product__card-price--samcol";
		}
		let noCnClass = ""
		if(siteCode !== "cn"){
			noCnClass = " my-recommended-product__card-price--current-first";
		}
		
		let cardItemHtml =`
				<div class="my-recommended-product__card-item">
					<div class="my-recommended-product__card-image-wrap">
						${buildBadge(frontModel)}
						${getWishlist(frontModel)}
						${buildProductCardImage(product)}
					</div>

					<div class="my-recommended-product__card-content">
						<div class="my-recommended-product__card-name">
							<p class="my-recommended-product__card-name-text">${frontModel.displayName}</p>
						</div>
						<div class="my-recommended-product__card-info">
							<div class="option-selector option-selector__color-text">
								${productCardFmyOptionBuild(product)}
							</div>
						</div>
						<div class="my-recommended-product__card-fiche">
							${energyLabelBuild(frontModel)}
						</div>
						<div class="my-recommended-product__card-price${covatClass}${noCnClass}">
							${buildPriceArea(frontModel)}
						</div>
						<div class="my-recommended-product__card-cta-wrap">
							<div class="my-recommended-product__card-cta">
								${getCTAForNewGeneral(product)}
							</div>
						</div>
					</div>
				</div>
				`;
				
		if(wrapUse){
			cardItemHtml =`
			<div class="my-recommended-product__card-item-wrap swiper-slide js-pf-product-card" role="listitem" data-productidx="${product.familyId}" 
							data-swiperidx="${swiperIdx}"
							data-type-headline="Indicator Text${swiperIdx}" 
							data-tagging='{
							"an-tr":"my recommended product image-swipe${swiperIdx}",
							"an-ca":"indication",
							"an-ac":"carousel",
							"an-la":"carousel:swiper:${swiperIdx}"
						}'>
				${cardItemHtml}
			</div>
			`;
		}
		return cardItemHtml;
	}
	/*
	* Swiper Button
	*/
	function getRecommendedProductSwiperWrapperHtml(swiperWrapperHtml){
		return `
				<button type="button" class="my-recommended-product__card-swiper-prev swiper-button-prev" ${arrowLeftTaggingAttr}>
					<span class="hidden">${Granite.I18n.get("Previous")}</span>
					<svg class="icon" focusable="false" aria-hidden="true">
						<use xlink:href="#previous-bold" href="#previous-bold"></use>
					</svg>
				</button>
				<div class="my-recommended-product__card-swiper swiper-container basic-swiper" data-swiper-option='{
					"breakpoints": {
						"1": {
							"slidesPerView":2
						},
						"768": {
							"slidesPerView":4
						}
					},
					"pagination":true,
					"keepWrapper":true,
					"autoplay":false,
					"componentEl":".my-recommended-product__card",
					"followFinger":true,
					"offTxtAccesibility":"true"
				}'>
				
					<div class="swiper-wrapper js-pf-content-wrap" role="list">
						<!--/* swiper-slide에 data-tagging={an-...} 태깅 정보를 넣어주면 indicator의 dot에 각 슬라이드의 정보가 노출됩니다. */-->
						<!--/* swiper-slide에 data-type-headline="Indicator Text" 정보를 부여해 주면 인디케이터 버튼에 노출 됩니다. */-->
						<!--/* product card */-->
						${swiperWrapperHtml}
					</div>
				</div>
				<button type="button" class="my-recommended-product__card-swiper-next swiper-button-next" ${arrowRightTaggingAttr}>
					<span class="hidden">${Granite.I18n.get("Next")}</span>
					<svg class="icon" focusable="false" aria-hidden="true">
						<use xlink:href="#next-bold" href="#next-bold"></use>
					</svg>
				</button>
				<div class="indicator dot-indicator" data-comp-name="indicator" data-indicator-data='{
				 "type": "dot-indicator",
				 "autoRolling": false,
				 "infiniteRolling": false
				 }'>
					<div class="indicator-wrap">
						<div class="indicator__list-wrap">
							<div class="indicator__list" role="tablist">
								<!--/* 웹 접근성을 위해 필요 시 carousel 과 연결할 id 추가 */-->
								<button class="indicator__item" role="tab" data-indicator-delay="">
									<span class="indicator__dot-wrap">
										<span class="indicator__dot">
											<span class="indicator__dot-inner"></span>
										</span>
										<!--/* (21/05/06 접근성) dialog 에서 indicator text 를 넣어야 하는 경우 아래 element 에 text 넣음 */-->
										<span class="hidden">Indicator 1</span>
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>
				`;
	}
	/*
	* fmychip click event
	*/
	function productCardEventListener() {
		//Wishlist icon Reinit
		window.sg.components.wishlistIcon.reInit();

		/* fmychip click event :: S */
		const fmyChipEl = $(".js-pf-product-fmychip");
		fmyChipEl.off("click");
		fmyChipEl.on("click", function () {
			const _this = $(this);
			const $targetContentEl = _this.closest('.js-pf-product-card');
			console.log("targetContentEl className="+$targetContentEl.attr("class"));
			const familyid = $targetContentEl.data("productidx");
			
			const modelIdx = _this.find("input[type=radio]").data("modeli");
			const chipType = _this.find("input[type=radio]").data("chiptype");

			setTimeout(function () {
				if (modelIdx != null) {
					const productData = productListData[familyid];
					productData.frontModelIdx = modelIdx;

					$targetContentEl.find(".option-selector__wrap").each(function (idx) {
						var tmpType = productData.optionTypeList[idx];
						var styleAttr = $(this).find(".option-selector__swiper-wrapper").attr("style");
						productData.viewOptionObj[tmpType].styleAttr = styleAttr;
					});
					
					$targetContentEl.html(buildProductCard(productData, 0, false));

					window.sg.components.myRecommendedProduct.optionReInit($targetContentEl.find(".my-recommended-product__card-item")[0]);
					productCardEventListener();
					
					var modelCode = productData.modelList[modelIdx].modelCode;
					changeAddedWishlist($targetContentEl, modelCode);
					
					$targetContentEl.find("input").each(function(){
						var type = $(this).data("chiptype");
						var code = $(this).data("modelcode");

						if(chipType === type && modelCode === code){
							$(this).focus();
						}
					});
					
				}
			}, 300);
		});
		/* fmychip click event :: E */

		/* CTA click event :: S */
		let isBuyNowClicked = false;
		const ctaBtn = $(".js-buy-now");
		ctaBtn.off("click");
		ctaBtn.on("click", function () {
			const _this = $(this);
			let modelCode = "";
			let configInfo = "";
			let configuratorURL = "";
			if (isGPv2) {
				configInfo = _this.attr("config_info");
				modelCode = _this.attr("data-modelcode");
				const addToCartFlag = _this.attr("data-cart");
				if (addToCartFlag === "true") {
					const shopSkuCode = _this.attr("data-sku-code");
					const addToCartUrl = cartUrl + "?addItem[]=" + shopSkuCode + ",1";
					window.location.href = addToCartUrl;
				} else {
					if (configInfo) {
						if (configInfo.indexOf("?modelCode") < 0) {
							configuratorURL = configInfo + "?modelCode=" + modelCode;
						} else {
							configuratorURL = configInfo;
						}
						window.location.href = configuratorURL;
					}
				}
			} else {
				if (isBuyNowClicked === true) {
					return;
				}
				configInfo = $(this).attr("config_info");
				modelCode = $(this).attr("data-modelcode");
				let linkInfo = $(this).attr("link_info");
				
				if(cartUrl.indexOf("http://") > -1 || cartUrl.indexOf("https://") > -1){
					linkInfo = cartUrl;
				}

				let addCartTimeout = 10000;
				if (siteCode === "vn") {
					addCartTimeout = 20000;
				}
				if (configInfo) {
					if (configInfo.indexOf("?modelCode") < 0) {
						configuratorURL = configInfo + "?modelCode=" + modelCode;
					} else {
						configuratorURL = configInfo;
					}
					window.location.href = configuratorURL;
				} else {
					//20231219 [cn new-hybris 전환] - addToCart uk와 동일 분기처리
					if((isNewHybris && (siteCode === "uk" || siteCode === "cn" || siteCode === "tr")) || siteCode === "au"){
						addToCartNewHybris(modelCode, linkInfo);
					} else if (hybrisApiJson === "Y") {
						$.ajax({
							url: storeDomain + "/" + siteCode + "/ng/p4v1/addCart",
							type: "GET",
							data: {
								"productCode": modelCode,
								"quantity": 1
							},
							contentType: "application/x-www-form-urlencoded",
							dataType: "json",
							xhrFields: {
								withCredentials: true
							},
							crossDomain: true,
							timeout: addCartTimeout,
							success: function (data) {
								if (data) {
									if (data.resultCode === "0000") {
										isBuyNowClicked = true;
										window.location.href = linkInfo;
									}
								}
							}
						});
					} else if (siteCode === "pe" || siteCode === "ar" || siteCode === "br") {
						const storeurl = storeDomain + "/" + siteCode + "/getServicesProduct?productCode=" + modelCode;
						window.location.href = storeurl;
					} else if (siteCode === "py" || siteCode === "mx" ) {
						let storeurl;
						storeurl = storeDomain + "/getServicesProduct?productCode=" + modelCode;
						window.location.href = storeurl;
					} else {
						let realSiteCode = siteCode;
						if (shopSiteCd) {
							realSiteCode = shopSiteCd;
						}
						
						var apiUrl =  storeDomain + "/" + realSiteCode + "/ng/p4v1/addCart";
						if(isNewHybris && siteCode !='uk' && siteCode !='cn'){
							var storeWebDomain = $("#storeWebDomain").val();
							apiUrl =  storeWebDomain + "/" + realSiteCode + "/ng/p4v1/addCart";
						}
						$.ajax({
							url: apiUrl,
							type: "GET",
							data: {
								"productCode": modelCode,
								"quantity": 1
							},
							dataType: "jsonp",
							jsonp: "callback",
							timeout: 10000,
							success: function (data) {
								if (data) {
									if (data.resultCode === "0000") {
										isBuyNowClicked = true;
										window.location.href = linkInfo;
									}
								}
							}
						});
					}
				}
			}
		});
		/* CTA click event :: E */
		
		// calculator click event  
		var $calculateCta = $('.js-pf-calculate-popup-open');
		$calculateCta.off("click.finder");
		$calculateCta.on("click.finder", function(e){
			var targetCta = $(this);
			var calType = targetCta.data("type");
			var targetHref = targetCta.attr("data-link_info");
			//new-hybris
			if(isNewHybris){
				window.sg.components.financePopup.showEmiPopup(targetCta.attr("data-modelcode"), targetCta);
			} else if(targetCta.hasClass('eip-ee-cal')){
				installmentPlansData.getPaymentData( $(this).attr("data-price"), $(this)[0], $(this).attr("data-modelcode"));
			} else if(isNotNull($emiPopupEl)){
					var $iframeEl = $emiPopupEl.find('iframe');
					
					var $emiPopupTitleEl = $emiPopupEl.find('.layer-popup__title');
					var popupTitle = "";
					if(calType==="emi"){
						popupTitle = Granite.I18n.get("EMIs (Pay in Easy Monthly installments)");
					}else if(calType==="install"){
						if(siteCode=="id"){
							popupTitle = Granite.I18n.get("Program CICILAN 0%");
						}else{
							popupTitle = Granite.I18n.get("Installment Calculate");
						}
					}
					$emiPopupTitleEl.html(popupTitle);
					$iframeEl.attr("src", targetHref);
					
					window.sg.components.eipPopup.showPopup();
			}
		});
	}
	/*
	* Product Card Grid
	*/
	function buildProductGrid(productList) {
		var productGridTemplate = "";
		if (productList != null) {

			for (let pl = 0; pl < productList.length; pl++) {
				let tempProduct = productList[pl];
				
				if (tempProduct.modelList != null && tempProduct.modelList.length > 0) {
					let selectedIndex = 0;

					/* selected가 Y인 모델의 마지막 index가 변수에 저장됨.*/
					for (let cnt = 0; cnt < tempProduct.modelList.length; cnt++) {
						const tempModel = tempProduct.modelList[cnt];
						if (tempModel.selected && tempModel.selected === "Y") {
							selectedIndex = cnt;
						}
					}
					tempProduct.frontModelIdx = selectedIndex;
					tempProduct = getProductInfo(tempProduct);
					//product까지 가공된 데이터를 productListData 에 저장해줌
					productListData[tempProduct.familyId] = tempProduct;
					
					productGridTemplate += buildProductCard(tempProduct, pl, true);
				}
			}
			
			$myComponent.find('.my-recommended-product__card').html(getRecommendedProductSwiperWrapperHtml(productGridTemplate));
		}
	}
	/*
	* Product Card Grid BDC
	*/
	function buildProductGridBDC(productList) {
		var productGridTemplate = "";
		if (productList != null) {

			for (let pl = 0; pl < productList.length; pl++) {
				let tempProduct = productList[pl].product;
				tempProduct["rank"] = productList[pl].rank;
				
				if (tempProduct.modelList != null && tempProduct.modelList.length > 0) {
					let selectedIndex = 0;

					/* selected가 Y인 모델의 마지막 index가 변수에 저장됨.*/
					for (let cnt = 0; cnt < tempProduct.modelList.length; cnt++) {
						const tempModel = tempProduct.modelList[cnt];
						if (tempModel.selected && tempModel.selected === "Y") {
							selectedIndex = cnt;
						}
					}
					tempProduct.frontModelIdx = selectedIndex;
					tempProduct = getProductInfo(tempProduct);
					//product까지 가공된 데이터를 productListData 에 저장해줌
					productListData[tempProduct.familyId] = tempProduct;
					
					productGridTemplate += buildProductCard(tempProduct, pl, true);
				}
			}

			$myComponent.find('.my-recommended-product__card').html(getRecommendedProductSwiperWrapperHtml(productGridTemplate));
		}
	}
	function getSearchProductCard() {
		var onlyRequestSkuYN = "";
		
		let AEMApiUrl = "/aemapi/v6/mysamsung/prodrec/recommendation";
		
		let pageType = "shop_home"; // Page Type 이 login 일때(my_page, login이 아닐때(shop_home )
		let guid = "";
		let visitorId = "";
		let num = 20;// max 20
		
		let ncpparam = Math.random();
		
		if(tempTitle.toLowerCase().indexOf('my') > -1){
			pageType = "my_page";
		}else if("page-home" === tempTitle){
			pageType = "home_bottom";
		}else if("page-search" === tempTitle){
			pageType = "search_no_result";
		}
		
		if(commonLoginCheck()){
			guid = $.cookies.get("guid",{domain:".samsung.com"});
			visitorId = $.cookies.get("s_ecid",{domain:".samsung.com"});
		}
		let recent_list = cookies.getCookie("recent_list");
		let visitorIdList = [];
		$.each(cookies.getCookies(), function(k, v) {
			if (k.indexOf('AMCV_') != -1) {
		 		visitorIdList.push(v.toString());
			}
		})
		
		const aemParam = {
						"siteCode": siteCode,
						"pageType": pageType,
						"guid": guid,
						"visitorId": visitorId,
						"num": num,
						"ncp" : ncpparam,
						"recent_list": recent_list,
						"visitorIdList": JSON.stringify(visitorIdList)
						};
						
		$.ajax({
			url: AEMApiUrl,
			type: "GET",
			data: aemParam,
			dataType: "json",
			cache: true,
			timeout: 20000
		}).done(function (data) {
			if (data && data.statusCode === 200 && data.resultData 
					&& data.resultData.result && data.resultData.result.code === 200
					) {
				
				let recommendations = data.resultData.result.recommendations;
				requestId = data.resultData.result.requestId;
				recommendations.sort(function(a,b) {
						return parseFloat(a.rank) - parseFloat(b.rank);
					});
				let result = [];
				recommendations.forEach((item,idx)=>{
					result.push(item.model);
				});
				let modelList = result.join(",");
				console.log(modelList);
				
				const param = {
							"siteCode": siteCode,
							"modelList": modelList,
							"saleSkuYN": "Y",
							"onlyRequestSkuYN": "N"
							};
		
				if (shopSiteCode) {
					param.shopSiteCode = shopSiteCode;
				}
				if (commonCodeYN) {
					param.commonCodeYN = commonCodeYN;
				}
				$.ajax({
					url: searchApiUrl,
					type: "GET",
					data: param,
					dataType: "json",
					cache: true,
					timeout: 20000
				}).done(function (data) {
					if (data.response && data.response.statusCode === 200 && data.response.resultData && data.response.resultData.productList) {
						const productList = data.response.resultData.productList;
						
						buildProductGrid(productList);
						
						if(commonLoginCheck()){
							commonGetWishlist(changeAddedWishlist);
						}
						productCardEventListener();
						
						console.log("window.sg.components.myRecommendedProduct.reInit...");
						if(isUseReinitTemp){
							$myComponent.find('.my-recommended-product__headline-text').show();
						}
						window.sg.components.myRecommendedProduct.reInit();
						window.sg.components.myRecommendedProduct.optionReInit($('.my-recommended-product').find('.my-recommended-product__card')[0]);
					}
				});
			}
		});
	}

	function getSearchProductCardForBDCApi() {
		var onlyRequestSkuYN = "";
		
		let BDCApiHost = "https://api-recommender.bigdata.samsung.com";
		let apiUrl = "/prodrec/recommendation";
		
		let setRequestId = `${siteCode}:${Math.floor(new Date/1000)}:${Math.floor(100000 + Math.random() * 900000)}`;
		let pageType = "shop_home"; // Page Type 이 login 일때(my_page, login이 아닐때(shop_home )
		let guid = "";
		let saId = "";
		let visitorId = "";
		let num = 20;// max 20
		
		if(tempTitle.toLowerCase().indexOf('my') > -1){
			pageType = "my_page";
		}else if("page-home" === tempTitle){
			pageType = "home_bottom";
		}else if("page-search" === tempTitle){
			pageType = "search_no_result";
		}
		
		if(commonLoginCheck()){
			guid = $.cookies.get("guid",{domain:".samsung.com"});
			saId = $.cookies.get("sa_id",{domain:".samsung.com"});
			visitorId = $.cookies.get("s_ecid",{domain:".samsung.com"});
		}
		let consent = $.cookies.get("cmapi_cookie_privacy",{domain:".samsung.com"});
		// let recent_list = $.cookies.get("recent_list",{domain:".samsung.com"});
		// TODO 뭐지 recent_list는 텍스트로 넘어가고 visitorIdList는 그냥 배열로???
		let recent_list = cookies.getCookie("recent_list");
		let visitorIdList = [];
		$.each(cookies.getCookies(), function(k, v) {
			if (k.indexOf('AMCV_') != -1) {
		 		visitorIdList.push(v.toString());
			}
		})
		const headers = {
						"requestId": setRequestId,
						"country": siteCode,
						"num": num
						};
		const bdcParam = {
						"pageType": pageType,
						"guid": guid,
						"saId": saId,// "sa_id" 쿠키값 활용(로그인 시 존재)
						"visitorId": visitorId,
						"visitorIdList": visitorIdList,
						"consent" : consent,// cmapi_cookie_privacy
						"recentList": recent_list,
						"targetModel": "",
						"rewardPoint": ""
						};
						
		$.ajax({
			headers: headers,
			url: BDCApiHost + apiUrl,
			type: "POST",
			data: JSON.stringify(bdcParam),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			xhrFields: { withCredentials: true },
			cache: true,
			timeout: 20000
		}).done(function (data) {
			if (data.code && data.code === 200 && data.recommendations && data.recommendations.length > 0) {
				
				console.log("data.recommendations::" + data.recommendations);
				const productList = data.recommendations;
				requestId = data.requestId;
				
				buildProductGridBDC(productList);
				
				if(commonLoginCheck()){
					commonGetWishlist(changeAddedWishlist);
				}
				productCardEventListener();
				
				console.log("window.sg.components.myRecommendedProduct.reInit...");
				if(isUseReinitTemp){
					$myComponent.find('.my-recommended-product__headline-text').show();
				}
				window.sg.components.myRecommendedProduct.reInit();
				window.sg.components.myRecommendedProduct.optionReInit($('.my-recommended-product').find('.my-recommended-product__card')[0]);
			}
		}).fail(function(xhr, status, error) {
			// error handling
			console.log("xhr.statusText::"+xhr.statusText);
			console.log("status::"+status);
			console.log("error::"+error);
		});
	}
	
	function init(){
		if(!isUseReinitTemp){
			$myComponent.find('.my-recommended-product__headline-text').show();
		}
		
		//getSearchProductCard();
		getSearchProductCardForBDCApi();
	}
	function reInit(){
		if(recommendedProductYn === "Y"){
			init();
		}
	}
	$(function () {
		if(!isUseReinitTemp){
			init();
		}
	});
	window.sg.components.recommendedProduct = {
		reInit
	};
}(window, window.jQuery));


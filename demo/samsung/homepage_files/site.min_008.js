var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(d){var f=0;return function(){return f<d.length?{done:!1,value:d[f++]}:{done:!0}}};$jscomp.arrayIterator=function(d){return{next:$jscomp.arrayIteratorImpl(d)}};$jscomp.makeIterator=function(d){var f="undefined"!=typeof Symbol&&Symbol.iterator&&d[Symbol.iterator];return f?f.call(d):$jscomp.arrayIterator(d)};$jscomp.arrayFromIterator=function(d){for(var f,m=[];!(f=d.next()).done;)m.push(f.value);return m};
$jscomp.arrayFromIterable=function(d){return d instanceof Array?d:$jscomp.arrayFromIterator($jscomp.makeIterator(d))};
(function(){function d(){0!==k.length&&(f(k),z(),[].concat($jscomp.arrayFromIterable(k)).forEach(function(b){[].concat($jscomp.arrayFromIterable(b.querySelectorAll(".showcase-card-tab-card__badge-wrap[data-start-time]"))).forEach(function(a){var e=A(a.dataset.startTime,a.dataset.endTime);a.classList.add(e);"live"===e&&(b.querySelector(".tab__item--shop-live").classList.add("live-on"),a=B(a,".showcase-card-tab-card__full-bleed-wrap"),e=a.querySelector(".showcase-card-tab-card__product-cta .cta--watch-live"))&&
(e.classList.add("on"),a.setAttribute("href",e.dataset.liveLinkPath),a.setAttribute("aria-label",e.dataset.liveLinkTitle),a.setAttribute("an-la",e.dataset.liveAnLa),e.classList.contains("cta--icon")?a.setAttribute("target","_blank"):a.removeAttribute("target"))})}))}function f(b){for(var a={$jscomp$loop$prop$i$2:0};a.$jscomp$loop$prop$i$2<b.length;a={$jscomp$loop$prop$i$2:a.$jscomp$loop$prop$i$2},a.$jscomp$loop$prop$i$2++){var e=b[a.$jscomp$loop$prop$i$2].querySelector(".showcase-card-tab__inner--without-cta")?
!1:!0;n[a.$jscomp$loop$prop$i$2]=b[a.$jscomp$loop$prop$i$2].querySelector(".tab");h[a.$jscomp$loop$prop$i$2]=c(b[a.$jscomp$loop$prop$i$2]).find(".showcase-card-tab__card-items .showcase-card-tab-card__full-bleed-wrap");q[a.$jscomp$loop$prop$i$2]=c(b[a.$jscomp$loop$prop$i$2]).find(".showcase-card-tab__card-items .showcase-card-tab-card__full-bleed-wrap--video");r[a.$jscomp$loop$prop$i$2]=b[a.$jscomp$loop$prop$i$2].querySelectorAll(".showcase-card-tab-card__product-cta");v[a.$jscomp$loop$prop$i$2]=
b[a.$jscomp$loop$prop$i$2].querySelector(".popup-video");n[a.$jscomp$loop$prop$i$2]&&(t[a.$jscomp$loop$prop$i$2]=b[a.$jscomp$loop$prop$i$2].querySelectorAll(".tab__item"),l[a.$jscomp$loop$prop$i$2]=b[a.$jscomp$loop$prop$i$2].querySelectorAll(".tab__item-title"),w[a.$jscomp$loop$prop$i$2]=b[a.$jscomp$loop$prop$i$2].querySelector(".showcase-card-tab__card-wrap"),p[a.$jscomp$loop$prop$i$2]=0,g[a.$jscomp$loop$prop$i$2]=new Swiper(w[a.$jscomp$loop$prop$i$2],{autoHeight:!0,on:{slideChange:function(a){return function(){u(a.$jscomp$loop$prop$i$2,
g[a.$jscomp$loop$prop$i$2].activeIndex)}}(a),slideChangeTransitionEnd:function(a){return function(){C.setLazyLoad();x(a.$jscomp$loop$prop$i$2)}}(a)}}),x(a.$jscomp$loop$prop$i$2),m(a.$jscomp$loop$prop$i$2));e&&(D(a.$jscomp$loop$prop$i$2),E(a.$jscomp$loop$prop$i$2))}y(0)}function m(b){for(var a={$jscomp$loop$prop$j$5:0};a.$jscomp$loop$prop$j$5<t[b].length;a={$jscomp$loop$prop$j$5:a.$jscomp$loop$prop$j$5},a.$jscomp$loop$prop$j$5++)t[b][a.$jscomp$loop$prop$j$5].addEventListener("click",function(a){return function(){u(b,
a.$jscomp$loop$prop$j$5)}}(a)),l[b][a.$jscomp$loop$prop$j$5].addEventListener("keydown",function(a){return function(c){"ArrowLeft"!==c.key&&"ArrowRight"!==c.key||l[b][(a.$jscomp$loop$prop$j$5+("ArrowLeft"===c.key?-1:1)+l[b].length)%l[b].length].focus()}}(a))}function D(b){h[b].target.forEach(function(a,e){var d=c(a).find(".showcase-card-tab-card__product-description-wrap");c(a).on("mouseleave",function(){d.target[0].classList.add("showcase-card-tab-card__product-description-wrap--show");r[b][e].classList.add("showcase-card-tab-card__product-cta--leave");
h[b].target[e].classList.remove("showcase-card--hover")});c(a).on("mouseenter",function(){h[b].target[e].classList.add("showcase-card--hover")});c(a).on("focus",function(){d.target[0].classList.add("showcase-card-tab-card__product-description-wrap--show");r[b][e].classList.add("showcase-card-tab-card__product-cta--leave");h[b].target[e].classList.add("showcase-card--hover")});c(a).on("blur",function(){h[b].target[e].classList.remove("showcase-card--hover")})})}function E(b){q[b]&&q[b].target.forEach(function(a,
c){a.addEventListener("click",function(){F.open(v[b],c,a)})})}function x(b){h[b].target.forEach(function(a){c(a).attr("tabindex","-1");c(a).attr("aria-hidden",!0)});c(k[b]).find(".swiper-slide-active .showcase-card-tab-card__full-bleed-wrap").target.forEach(function(a){"presentation"!==c(a).attr("role")&&"none"!==c(a).attr("role")?(c(a).attr("tabindex","0"),c(a).attr("aria-hidden",!1)):(c(a).removeAttr("tabindex"),c(a).removeAttr("aria-hidden"))});c(k[b]).find(".tab__item-title").target.forEach(function(a){"false"!==
c(a).attr("aria-selected")?c(a).attr("tabindex","0"):c(a).attr("tabindex","-1")})}function u(b,a){p[b]!==a&&(p[b]=a);g[b].slideTo(p[b]);G.selectTab(n[b],g[b].activeIndex);y(b)}function y(b){6<g[b].slides[g[b].activeIndex].querySelector(".showcase-card-tab-inner-container").childElementCount?g[b].$el.addClass("showcase-card-tab__card-wrap--long"):g[b].$el.removeClass("showcase-card-tab__card-wrap--long")}function z(){if(location.hash){var b=location.hash;b&&(b=b.trim().replace(/&/g,"\x26amp;").replace(/</g,
"\x26lt;").replace(/>/g,"\x26gt;").replace(/"/g,"\x26quot;").replace(/'/g,"\x26#039;").replace(/\./g,"\\."));var a=c(".showcase-card-tab "+b);0!==a.target.length&&(b=n.indexOf(a.closest(".tab").target[0]),a=a.parent(".tab__item-title").index(),u(b,a))}}var k=document.querySelectorAll(".showcase-card-tab"),c=window.sg.common.$q,G=window.sg.common.tab,C=window.sg.common.lazyLoad,F=window.sg.common.popupVideo,B=window.sg.common.utils.closest,A=window.sg.common.utils.getTimeStatus,n=[],t=[],l=[],w=[],
g=[],h=[],q=[],p=[],r=[],v=[];window.sg.components.showcaseCardTab={init:d,reInit:function(){f(k)}};c.ready(function(){return d()})})();
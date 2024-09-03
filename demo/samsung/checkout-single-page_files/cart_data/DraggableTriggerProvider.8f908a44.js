((self||this)["webpackJsonp@sprinklrjs/chat-web-client"]=(self||this)["webpackJsonp@sprinklrjs/chat-web-client"]||[]).push([[6],{1847:function(t,e,n){"use strict";n.r(e),n.d(e,"DraggableContainer",(function(){return y})),n.d(e,"DraggableTriggerContextProvider",(function(){return T}));var r=n(132),o=n(357),a=n(778),i=n(468),u=n.n(i),c=n(659),l=n(635),s=n(396),f=n(709),d=n(450),p=n(358),g=Object(f.c)(),y=function(t){var e=t.children,n=t.onDragStart,i=t.onDragStop,y=Object(c.a)().height,b=Object(l.c)(),h=Object(o.useRef)(),m=Object(o.useState)(!1),v=Object(r.a)(m,2),O=v[0],S=v[1],D=Object(s.a)(),w=Object(o.useState)(0),j=Object(r.a)(w,2),P=j[0],T=j[1],E=Object(o.useCallback)((function(t){h.current&&window.clearTimeout(h.current),S(!1),null!==b&&void 0!==b&&b.lazyIsDragging&&D({action:d.a.TRIGGER_DRAGGED}),i(t),null===b||void 0===b||b.onAction({type:"SET_DRAGGING_STATE",payload:!1}),setTimeout((function(){null===b||void 0===b||b.onAction({type:"SET_LAZY_DRAGGING_STATE",payload:!1})}),100)}),[null===b||void 0===b?void 0:b.lazyIsDragging,i,D]),M=u()((function(t,e,n){n({type:"UPDATE_BOTTOM",payload:e-t})}),100),x=Object(o.useCallback)((function(t,e){h.current=window.setTimeout((function(){h.current=void 0,Object(f.d)(200),S(!0)}),700),T(e.y),n(t)}),[n]);Object(o.useEffect)((function(){return function(){h.current&&window.clearTimeout(h.current),M.cancel()}}),[]);var _=Object(o.useCallback)((function(t,e){g&&!O||((null===b||void 0===b||!b.lazyIsDragging)&&Math.abs(e.y-P)>=4&&(null===b||void 0===b||b.onAction({type:"SET_LAZY_DRAGGING_STATE",payload:!0})),null!==b&&void 0!==b&&b.isDragging||null===b||void 0===b||b.onAction({type:"SET_DRAGGING_STATE",payload:!0}),M(e.y,y,null===b||void 0===b?void 0:b.onAction))}),[O,b,P,y]);return Object(p.jsx)(a.DraggableCore,{disabled:null===b||void 0===b?void 0:b.isFrameOpen,onStop:E,onDrag:_,onStart:x,cancel:".".concat(l.a)},e)},b=n(364),h=n(711),m=n.n(h),v=n(373),O=n(377),S=n(433),D=n(376),w=n(362),j=n(608),P=function(t){return Object(S.g)(Object(D.b)(t))},T=function(t){var e,n,a=t.children,i=Object(v.b)(),u=Object(o.useState)((function(){return Object(w.e)("trigger.yPadding")({theme:i})})),s=Object(r.a)(u,2),f=s[0],d=s[1],g=Object(o.useState)(!1),y=Object(r.a)(g,2),h=y[0],S=y[1],D=Object(o.useState)(!1),T=Object(r.a)(D,2),E=T[0],M=T[1],x=Object(o.useState)(0),_=Object(r.a)(x,2),C=_[0],N=_[1],A=Object(b.d)(P),k=Object(c.a)().height,R=Object(O.a)(),G=Object(w.b)("frame.height",{})({theme:i}).absoluteValue,I=Object(w.e)("trigger.size")({theme:i}),Y=Object(w.e)("frame.sYMargin")({theme:i}),X=Object(w.e)("proactivePrompt.sYMargin",Y)({theme:i}),L=!(null===R||void 0===R||null===(e=R.trigger)||void 0===e||!e.hideWhenOpen),B=!(null===R||void 0===R||null===(n=R.proactivePrompt)||void 0===n||!n.showWithBoxOpen),U=A?Object(w.e)("proactivePrompt.align",Object(w.e)("frame.align")({theme:i}))({theme:i}):Object(w.e)("frame.align")({theme:i}),W=U===j.b.TRIGGER_BOTTOM_LEFT__BOX_BOTTOM_RIGHT||U===j.b.TRIGGER_BOTTOM_RIGHT__BOX_BOTTOM_LEFT,H=Math.max(k-f-I,0),F=f>H;C>0&&A?F=F&&C+(W?0:X)>H+(W?I:0):A||(F=F&&C+(W?0:X)+G+Y>H+(W?I:0));var V=Object(o.useRef)(H);if((!A||C)&&F){var z=Math.max((A||B?C+(W?0:X):0)+(A?0:G+Y)-(W||L&&!A?I:0),0);d((function(t){return Math.max(t-z,0)}))}var Z=m()(f),J=!!Z&&Z!==f;J||(V.current=H);var K=Object(o.useCallback)((function(t){var e=t.type,n=t.payload;switch(e){case"UPDATE_PROMPT_HEIGHT":N(n);break;case"UPDATE_BOTTOM":d(n<0?0:Math.min(n,k-I));break;case"SET_DRAGGING_STATE":S(n);break;case"SET_LAZY_DRAGGING_STATE":M(n)}}),[I,k]),$=Object(o.useMemo)((function(){return{triggerOffsetTopBeforeReposition:V.current,triggerOffsetBottom:f,shouldRepositionTrigger:J,shouldAnimateTriggerOnReposition:!h&&J&&!(A&&C),onAction:K,isFrameOpen:!A||!!C,isDragging:h,lazyIsDragging:E}}),[f,J,h,A,C,K,E]);return Object(p.jsx)(l.b.Provider,{value:$},a)}},444:function(t,e,n){var r=n(3),o=n(37),a=n(45),i=n(4),u=n(9),c=n(47),l=n(678),s=n(0),f=o("Reflect","construct"),d=s((function(){function t(){}return!(f((function(){}),[],t)instanceof t)})),p=!s((function(){f((function(){}))})),g=d||p;r({target:"Reflect",stat:!0,forced:g,sham:g},{construct:function(t,e){a(t),i(e);var n=arguments.length<3?t:a(arguments[2]);if(p&&!d)return f(t,e,n);if(t==n){switch(e.length){case 0:return new t;case 1:return new t(e[0]);case 2:return new t(e[0],e[1]);case 3:return new t(e[0],e[1],e[2]);case 4:return new t(e[0],e[1],e[2],e[3])}var r=[null];return r.push.apply(r,e),new(l.apply(t,r))}var o=n.prototype,s=c(u(o)?o:Object.prototype),g=Function.apply.call(t,s,e);return u(g)?g:s}})},499:function(t,e,n){"use strict";n(11),n(210),n(131),Object.defineProperty(e,"__esModule",{value:!0}),e.findInArray=function(t,e){for(var n=0,r=t.length;n<r;n++)if(e.apply(e,[t[n],n,t]))return t[n]},e.isFunction=function(t){return"function"===typeof t||"[object Function]"===Object.prototype.toString.call(t)},e.isNum=function(t){return"number"===typeof t&&!isNaN(t)},e.int=function(t){return parseInt(t,10)},e.dontSetMe=function(t,e,n){if(t[e])return new Error("Invalid prop ".concat(e," passed to ").concat(n," - do not set this, set it on the child."))}},576:function(t,e,n){"use strict";function r(t){return r="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"===typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},r(t)}n(202),n(370),n(11),n(403),n(58),n(133),n(85),n(411),n(393),n(203),n(205),n(60),n(62),n(459),n(131),n(7),n(135),n(88),n(21),n(86),Object.defineProperty(e,"__esModule",{value:!0}),e.matchesSelector=f,e.matchesSelectorAndParentsTo=function(t,e,n){var r=t;do{if(f(r,e))return!0;if(r===n)return!1;r=r.parentNode}while(r);return!1},e.addEvent=function(t,e,n,r){if(!t)return;var o=c({capture:!0},r);t.addEventListener?t.addEventListener(e,n,o):t.attachEvent?t.attachEvent("on"+e,n):t["on"+e]=n},e.removeEvent=function(t,e,n,r){if(!t)return;var o=c({capture:!0},r);t.removeEventListener?t.removeEventListener(e,n,o):t.detachEvent?t.detachEvent("on"+e,n):t["on"+e]=null},e.outerHeight=function(t){var e=t.clientHeight,n=t.ownerDocument.defaultView.getComputedStyle(t);return e+=(0,o.int)(n.borderTopWidth),e+=(0,o.int)(n.borderBottomWidth)},e.outerWidth=function(t){var e=t.clientWidth,n=t.ownerDocument.defaultView.getComputedStyle(t);return e+=(0,o.int)(n.borderLeftWidth),e+=(0,o.int)(n.borderRightWidth)},e.innerHeight=function(t){var e=t.clientHeight,n=t.ownerDocument.defaultView.getComputedStyle(t);return e-=(0,o.int)(n.paddingTop),e-=(0,o.int)(n.paddingBottom)},e.innerWidth=function(t){var e=t.clientWidth,n=t.ownerDocument.defaultView.getComputedStyle(t);return e-=(0,o.int)(n.paddingLeft),e-=(0,o.int)(n.paddingRight)},e.offsetXYFromParent=function(t,e,n){var r=e===e.ownerDocument.body?{left:0,top:0}:e.getBoundingClientRect(),o=(t.clientX+e.scrollLeft-r.left)/n,a=(t.clientY+e.scrollTop-r.top)/n;return{x:o,y:a}},e.createCSSTransform=function(t,e){var n=d(t,e,"px");return l({},(0,a.browserPrefixToKey)("transform",a.default),n)},e.createSVGTransform=function(t,e){return d(t,e,"")},e.getTranslation=d,e.getTouch=function(t,e){return t.targetTouches&&(0,o.findInArray)(t.targetTouches,(function(t){return e===t.identifier}))||t.changedTouches&&(0,o.findInArray)(t.changedTouches,(function(t){return e===t.identifier}))},e.getTouchIdentifier=function(t){if(t.targetTouches&&t.targetTouches[0])return t.targetTouches[0].identifier;if(t.changedTouches&&t.changedTouches[0])return t.changedTouches[0].identifier},e.addUserSelectStyles=function(t){if(!t)return;var e=t.getElementById("react-draggable-style-el");e||((e=t.createElement("style")).type="text/css",e.id="react-draggable-style-el",e.innerHTML=".react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n",e.innerHTML+=".react-draggable-transparent-selection *::selection {all: inherit;}\n",t.getElementsByTagName("head")[0].appendChild(e));t.body&&p(t.body,"react-draggable-transparent-selection")},e.removeUserSelectStyles=function(t){if(!t)return;try{if(t.body&&g(t.body,"react-draggable-transparent-selection"),t.selection)t.selection.empty();else{var e=(t.defaultView||window).getSelection();e&&"Caret"!==e.type&&e.removeAllRanges()}}catch(n){}},e.addClassName=p,e.removeClassName=g;var o=n(499),a=function(t){if(t&&t.__esModule)return t;if(null===t||"object"!==r(t)&&"function"!==typeof t)return{default:t};var e=i();if(e&&e.has(t))return e.get(t);var n={},o=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var a in t)if(Object.prototype.hasOwnProperty.call(t,a)){var u=o?Object.getOwnPropertyDescriptor(t,a):null;u&&(u.get||u.set)?Object.defineProperty(n,a,u):n[a]=t[a]}n.default=t,e&&e.set(t,n);return n}(n(780));function i(){if("function"!==typeof WeakMap)return null;var t=new WeakMap;return i=function(){return t},t}function u(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function c(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?u(Object(n),!0).forEach((function(e){l(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function l(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var s="";function f(t,e){return s||(s=(0,o.findInArray)(["matches","webkitMatchesSelector","mozMatchesSelector","msMatchesSelector","oMatchesSelector"],(function(e){return(0,o.isFunction)(t[e])}))),!!(0,o.isFunction)(t[s])&&t[s](e)}function d(t,e,n){var r=t.x,o=t.y,a="translate(".concat(r).concat(n,",").concat(o).concat(n,")");if(e){var i="".concat("string"===typeof e.x?e.x:e.x+n),u="".concat("string"===typeof e.y?e.y:e.y+n);a="translate(".concat(i,", ").concat(u,")")+a}return a}function p(t,e){t.classList?t.classList.add(e):t.className.match(new RegExp("(?:^|\\s)".concat(e,"(?!\\S)")))||(t.className+=" ".concat(e))}function g(t,e){t.classList?t.classList.remove(e):t.className=t.className.replace(new RegExp("(?:^|\\s)".concat(e,"(?!\\S)"),"g"),"")}},639:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getBoundPosition=function(t,e,n){if(!t.props.bounds)return[e,n];var i=t.props.bounds;i="string"===typeof i?i:function(t){return{left:t.left,top:t.top,right:t.right,bottom:t.bottom}}(i);var u=a(t);if("string"===typeof i){var c,l=u.ownerDocument,s=l.defaultView;if(!((c="parent"===i?u.parentNode:l.querySelector(i))instanceof s.HTMLElement))throw new Error('Bounds selector "'+i+'" could not find an element.');var f=s.getComputedStyle(u),d=s.getComputedStyle(c);i={left:-u.offsetLeft+(0,r.int)(d.paddingLeft)+(0,r.int)(f.marginLeft),top:-u.offsetTop+(0,r.int)(d.paddingTop)+(0,r.int)(f.marginTop),right:(0,o.innerWidth)(c)-(0,o.outerWidth)(u)-u.offsetLeft+(0,r.int)(d.paddingRight)-(0,r.int)(f.marginRight),bottom:(0,o.innerHeight)(c)-(0,o.outerHeight)(u)-u.offsetTop+(0,r.int)(d.paddingBottom)-(0,r.int)(f.marginBottom)}}(0,r.isNum)(i.right)&&(e=Math.min(e,i.right));(0,r.isNum)(i.bottom)&&(n=Math.min(n,i.bottom));(0,r.isNum)(i.left)&&(e=Math.max(e,i.left));(0,r.isNum)(i.top)&&(n=Math.max(n,i.top));return[e,n]},e.snapToGrid=function(t,e,n){var r=Math.round(e/t[0])*t[0],o=Math.round(n/t[1])*t[1];return[r,o]},e.canDragX=function(t){return"both"===t.props.axis||"x"===t.props.axis},e.canDragY=function(t){return"both"===t.props.axis||"y"===t.props.axis},e.getControlPosition=function(t,e,n){var r="number"===typeof e?(0,o.getTouch)(t,e):null;if("number"===typeof e&&!r)return null;var i=a(n),u=n.props.offsetParent||i.offsetParent||i.ownerDocument.body;return(0,o.offsetXYFromParent)(r||t,u,n.props.scale)},e.createCoreData=function(t,e,n){var o=t.state,i=!(0,r.isNum)(o.lastX),u=a(t);return i?{node:u,deltaX:0,deltaY:0,lastX:e,lastY:n,x:e,y:n}:{node:u,deltaX:e-o.lastX,deltaY:n-o.lastY,lastX:o.lastX,lastY:o.lastY,x:e,y:n}},e.createDraggableData=function(t,e){var n=t.props.scale;return{node:e.node,x:t.state.x+e.deltaX/n,y:t.state.y+e.deltaY/n,deltaX:e.deltaX/n,deltaY:e.deltaY/n,lastX:t.state.x,lastY:t.state.y}};var r=n(499),o=n(576);function a(t){var e=t.findDOMNode();if(!e)throw new Error("<DraggableCore>: Unmounted during event!");return e}},640:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=function(){void 0}},678:function(t,e,n){"use strict";var r=n(45),o=n(9),a=[].slice,i={},u=function(t,e,n){if(!(e in i)){for(var r=[],o=0;o<e;o++)r[o]="a["+o+"]";i[e]=Function("C,a","return new C("+r.join(",")+")")}return i[e](t,n)};t.exports=Function.bind||function(t){var e=r(this),n=a.call(arguments,1),i=function(){var r=n.concat(a.call(arguments));return this instanceof i?u(e,r.length,r):e.apply(t,r)};return o(e.prototype)&&(i.prototype=e.prototype),i}},778:function(t,e,n){"use strict";var r=n(779),o=r.default,a=r.DraggableCore;t.exports=o,t.exports.default=o,t.exports.DraggableCore=a},779:function(t,e,n){"use strict";n(58),n(11),n(133),n(411),n(85),n(393),n(202),n(370),n(403),n(361),n(201),n(203),n(59),n(452),n(7),n(205),n(60),n(62),n(459),n(389),n(444),n(206),Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"DraggableCore",{enumerable:!0,get:function(){return s.default}}),e.default=void 0;var r=function(t){if(t&&t.__esModule)return t;if(null===t||"object"!==g(t)&&"function"!==typeof t)return{default:t};var e=p();if(e&&e.has(t))return e.get(t);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in t)if(Object.prototype.hasOwnProperty.call(t,o)){var a=r?Object.getOwnPropertyDescriptor(t,o):null;a&&(a.get||a.set)?Object.defineProperty(n,o,a):n[o]=t[o]}n.default=t,e&&e.set(t,n);return n}(n(357)),o=d(n(421)),a=d(n(472)),i=d(n(375)),u=n(576),c=n(639),l=n(499),s=d(n(781)),f=d(n(640));function d(t){return t&&t.__esModule?t:{default:t}}function p(){if("function"!==typeof WeakMap)return null;var t=new WeakMap;return p=function(){return t},t}function g(t){return g="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"===typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},g(t)}function y(){return y=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},y.apply(this,arguments)}function b(t,e){if(null==t)return{};var n,r,o=function(t,e){if(null==t)return{};var n,r,o={},a=Object.keys(t);for(r=0;r<a.length;r++)n=a[r],e.indexOf(n)>=0||(o[n]=t[n]);return o}(t,e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);for(r=0;r<a.length;r++)n=a[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o}function h(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"===typeof Symbol||!(Symbol.iterator in Object(t)))return;var n=[],r=!0,o=!1,a=void 0;try{for(var i,u=t[Symbol.iterator]();!(r=(i=u.next()).done)&&(n.push(i.value),!e||n.length!==e);r=!0);}catch(c){o=!0,a=c}finally{try{r||null==u.return||u.return()}finally{if(o)throw a}}return n}(t,e)||function(t,e){if(!t)return;if("string"===typeof t)return m(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return m(t,e)}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function m(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function v(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function O(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?v(Object(n),!0).forEach((function(e){M(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):v(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function S(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function D(t,e,n){return e&&S(t.prototype,e),n&&S(t,n),t}function w(t,e){return w=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},w(t,e)}function j(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=E(t);if(e){var o=E(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return P(this,n)}}function P(t,e){return!e||"object"!==g(e)&&"function"!==typeof e?T(t):e}function T(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function E(t){return E=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},E(t)}function M(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var x=function(t){!function(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&w(t,e)}(n,t);var e=j(n);function n(t){var r;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,n),M(T(r=e.call(this,t)),"onDragStart",(function(t,e){if((0,f.default)("Draggable: onDragStart: %j",e),!1===r.props.onStart(t,(0,c.createDraggableData)(T(r),e)))return!1;r.setState({dragging:!0,dragged:!0})})),M(T(r),"onDrag",(function(t,e){if(!r.state.dragging)return!1;(0,f.default)("Draggable: onDrag: %j",e);var n=(0,c.createDraggableData)(T(r),e),o={x:n.x,y:n.y};if(r.props.bounds){var a=o.x,i=o.y;o.x+=r.state.slackX,o.y+=r.state.slackY;var u=h((0,c.getBoundPosition)(T(r),o.x,o.y),2),l=u[0],s=u[1];o.x=l,o.y=s,o.slackX=r.state.slackX+(a-o.x),o.slackY=r.state.slackY+(i-o.y),n.x=o.x,n.y=o.y,n.deltaX=o.x-r.state.x,n.deltaY=o.y-r.state.y}if(!1===r.props.onDrag(t,n))return!1;r.setState(o)})),M(T(r),"onDragStop",(function(t,e){if(!r.state.dragging)return!1;if(!1===r.props.onStop(t,(0,c.createDraggableData)(T(r),e)))return!1;(0,f.default)("Draggable: onDragStop: %j",e);var n={dragging:!1,slackX:0,slackY:0};if(Boolean(r.props.position)){var o=r.props.position,a=o.x,i=o.y;n.x=a,n.y=i}r.setState(n)})),r.state={dragging:!1,dragged:!1,x:t.position?t.position.x:t.defaultPosition.x,y:t.position?t.position.y:t.defaultPosition.y,prevPropsPosition:O({},t.position),slackX:0,slackY:0,isElementSVG:!1},!t.position||t.onDrag||t.onStop||console.warn("A `position` was applied to this <Draggable>, without drag handlers. This will make this component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the `position` of this element."),r}return D(n,null,[{key:"getDerivedStateFromProps",value:function(t,e){var n=t.position,r=e.prevPropsPosition;return!n||r&&n.x===r.x&&n.y===r.y?null:((0,f.default)("Draggable: getDerivedStateFromProps %j",{position:n,prevPropsPosition:r}),{x:n.x,y:n.y,prevPropsPosition:O({},n)})}}]),D(n,[{key:"componentDidMount",value:function(){"undefined"!==typeof window.SVGElement&&this.findDOMNode()instanceof window.SVGElement&&this.setState({isElementSVG:!0})}},{key:"componentWillUnmount",value:function(){this.setState({dragging:!1})}},{key:"findDOMNode",value:function(){return this.props.nodeRef?this.props.nodeRef.current:a.default.findDOMNode(this)}},{key:"render",value:function(){var t,e=this.props,n=(e.axis,e.bounds,e.children),o=e.defaultPosition,a=e.defaultClassName,l=e.defaultClassNameDragging,f=e.defaultClassNameDragged,d=e.position,p=e.positionOffset,g=(e.scale,b(e,["axis","bounds","children","defaultPosition","defaultClassName","defaultClassNameDragging","defaultClassNameDragged","position","positionOffset","scale"])),h={},m=null,v=!Boolean(d)||this.state.dragging,S=d||o,D={x:(0,c.canDragX)(this)&&v?this.state.x:S.x,y:(0,c.canDragY)(this)&&v?this.state.y:S.y};this.state.isElementSVG?m=(0,u.createSVGTransform)(D,p):h=(0,u.createCSSTransform)(D,p);var w=(0,i.default)(n.props.className||"",a,(M(t={},l,this.state.dragging),M(t,f,this.state.dragged),t));return r.createElement(s.default,y({},g,{onStart:this.onDragStart,onDrag:this.onDrag,onStop:this.onDragStop}),r.cloneElement(r.Children.only(n),{className:w,style:O(O({},n.props.style),h),transform:m}))}}]),n}(r.Component);e.default=x,M(x,"displayName","Draggable"),M(x,"propTypes",O(O({},s.default.propTypes),{},{axis:o.default.oneOf(["both","x","y","none"]),bounds:o.default.oneOfType([o.default.shape({left:o.default.number,right:o.default.number,top:o.default.number,bottom:o.default.number}),o.default.string,o.default.oneOf([!1])]),defaultClassName:o.default.string,defaultClassNameDragging:o.default.string,defaultClassNameDragged:o.default.string,defaultPosition:o.default.shape({x:o.default.number,y:o.default.number}),positionOffset:o.default.shape({x:o.default.oneOfType([o.default.number,o.default.string]),y:o.default.oneOfType([o.default.number,o.default.string])}),position:o.default.shape({x:o.default.number,y:o.default.number}),className:l.dontSetMe,style:l.dontSetMe,transform:l.dontSetMe})),M(x,"defaultProps",O(O({},s.default.defaultProps),{},{axis:"both",bounds:!1,defaultClassName:"react-draggable",defaultClassNameDragging:"react-draggable-dragging",defaultClassNameDragged:"react-draggable-dragged",defaultPosition:{x:0,y:0},position:null,scale:1}))},780:function(t,e,n){"use strict";n(131),Object.defineProperty(e,"__esModule",{value:!0}),e.getPrefix=o,e.browserPrefixToKey=a,e.browserPrefixToStyle=function(t,e){return e?"-".concat(e.toLowerCase(),"-").concat(t):t},e.default=void 0;var r=["Moz","Webkit","O","ms"];function o(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"transform";if("undefined"===typeof window||"undefined"===typeof window.document)return"";var e=window.document.documentElement.style;if(t in e)return"";for(var n=0;n<r.length;n++)if(a(t,r[n])in e)return r[n];return""}function a(t,e){return e?"".concat(e).concat(function(t){for(var e="",n=!0,r=0;r<t.length;r++)n?(e+=t[r].toUpperCase(),n=!1):"-"===t[r]?n=!0:e+=t[r];return e}(t)):t}var i=o();e.default=i},781:function(t,e,n){"use strict";n(58),n(11),n(133),n(411),n(85),n(393),n(202),n(370),n(403),n(59),n(452),n(7),n(389),n(444),n(206),n(131),Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var r=function(t){if(t&&t.__esModule)return t;if(null===t||"object"!==d(t)&&"function"!==typeof t)return{default:t};var e=f();if(e&&e.has(t))return e.get(t);var n={},r=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in t)if(Object.prototype.hasOwnProperty.call(t,o)){var a=r?Object.getOwnPropertyDescriptor(t,o):null;a&&(a.get||a.set)?Object.defineProperty(n,o,a):n[o]=t[o]}n.default=t,e&&e.set(t,n);return n}(n(357)),o=s(n(421)),a=s(n(472)),i=n(576),u=n(639),c=n(499),l=s(n(640));function s(t){return t&&t.__esModule?t:{default:t}}function f(){if("function"!==typeof WeakMap)return null;var t=new WeakMap;return f=function(){return t},t}function d(t){return d="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"===typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},d(t)}function p(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"===typeof Symbol||!(Symbol.iterator in Object(t)))return;var n=[],r=!0,o=!1,a=void 0;try{for(var i,u=t[Symbol.iterator]();!(r=(i=u.next()).done)&&(n.push(i.value),!e||n.length!==e);r=!0);}catch(c){o=!0,a=c}finally{try{r||null==u.return||u.return()}finally{if(o)throw a}}return n}(t,e)||function(t,e){if(!t)return;if("string"===typeof t)return g(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return g(t,e)}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function g(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function y(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function b(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function h(t,e){return h=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},h(t,e)}function m(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=S(t);if(e){var o=S(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return v(this,n)}}function v(t,e){return!e||"object"!==d(e)&&"function"!==typeof e?O(t):e}function O(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function S(t){return S=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},S(t)}function D(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var w={start:"touchstart",move:"touchmove",stop:"touchend"},j={start:"mousedown",move:"mousemove",stop:"mouseup"},P=j,T=function(t){!function(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&h(t,e)}(s,t);var e,n,o,c=m(s);function s(){var t;y(this,s);for(var e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];return D(O(t=c.call.apply(c,[this].concat(n))),"state",{dragging:!1,lastX:NaN,lastY:NaN,touchIdentifier:null}),D(O(t),"mounted",!1),D(O(t),"handleDragStart",(function(e){if(t.props.onMouseDown(e),!t.props.allowAnyClick&&"number"===typeof e.button&&0!==e.button)return!1;var n=t.findDOMNode();if(!n||!n.ownerDocument||!n.ownerDocument.body)throw new Error("<DraggableCore> not mounted on DragStart!");var r=n.ownerDocument;if(!(t.props.disabled||!(e.target instanceof r.defaultView.Node)||t.props.handle&&!(0,i.matchesSelectorAndParentsTo)(e.target,t.props.handle,n)||t.props.cancel&&(0,i.matchesSelectorAndParentsTo)(e.target,t.props.cancel,n))){"touchstart"===e.type&&e.preventDefault();var o=(0,i.getTouchIdentifier)(e);t.setState({touchIdentifier:o});var a=(0,u.getControlPosition)(e,o,O(t));if(null!=a){var c=a.x,s=a.y,f=(0,u.createCoreData)(O(t),c,s);(0,l.default)("DraggableCore: handleDragStart: %j",f),(0,l.default)("calling",t.props.onStart),!1!==t.props.onStart(e,f)&&!1!==t.mounted&&(t.props.enableUserSelectHack&&(0,i.addUserSelectStyles)(r),t.setState({dragging:!0,lastX:c,lastY:s}),(0,i.addEvent)(r,P.move,t.handleDrag),(0,i.addEvent)(r,P.stop,t.handleDragStop))}}})),D(O(t),"handleDrag",(function(e){var n=(0,u.getControlPosition)(e,t.state.touchIdentifier,O(t));if(null!=n){var r=n.x,o=n.y;if(Array.isArray(t.props.grid)){var a=r-t.state.lastX,i=o-t.state.lastY,c=p((0,u.snapToGrid)(t.props.grid,a,i),2);if(a=c[0],i=c[1],!a&&!i)return;r=t.state.lastX+a,o=t.state.lastY+i}var s=(0,u.createCoreData)(O(t),r,o);if((0,l.default)("DraggableCore: handleDrag: %j",s),!1!==t.props.onDrag(e,s)&&!1!==t.mounted)t.setState({lastX:r,lastY:o});else try{t.handleDragStop(new MouseEvent("mouseup"))}catch(d){var f=document.createEvent("MouseEvents");f.initMouseEvent("mouseup",!0,!0,window,0,0,0,0,0,!1,!1,!1,!1,0,null),t.handleDragStop(f)}}})),D(O(t),"handleDragStop",(function(e){if(t.state.dragging){var n=(0,u.getControlPosition)(e,t.state.touchIdentifier,O(t));if(null!=n){var r=n.x,o=n.y,a=(0,u.createCoreData)(O(t),r,o);if(!1===t.props.onStop(e,a)||!1===t.mounted)return!1;var c=t.findDOMNode();c&&t.props.enableUserSelectHack&&(0,i.removeUserSelectStyles)(c.ownerDocument),(0,l.default)("DraggableCore: handleDragStop: %j",a),t.setState({dragging:!1,lastX:NaN,lastY:NaN}),c&&((0,l.default)("DraggableCore: Removing handlers"),(0,i.removeEvent)(c.ownerDocument,P.move,t.handleDrag),(0,i.removeEvent)(c.ownerDocument,P.stop,t.handleDragStop))}}})),D(O(t),"onMouseDown",(function(e){return P=j,t.handleDragStart(e)})),D(O(t),"onMouseUp",(function(e){return P=j,t.handleDragStop(e)})),D(O(t),"onTouchStart",(function(e){return P=w,t.handleDragStart(e)})),D(O(t),"onTouchEnd",(function(e){return P=w,t.handleDragStop(e)})),t}return e=s,(n=[{key:"componentDidMount",value:function(){this.mounted=!0;var t=this.findDOMNode();t&&(0,i.addEvent)(t,w.start,this.onTouchStart,{passive:!1})}},{key:"componentWillUnmount",value:function(){this.mounted=!1;var t=this.findDOMNode();if(t){var e=t.ownerDocument;(0,i.removeEvent)(e,j.move,this.handleDrag),(0,i.removeEvent)(e,w.move,this.handleDrag),(0,i.removeEvent)(e,j.stop,this.handleDragStop),(0,i.removeEvent)(e,w.stop,this.handleDragStop),(0,i.removeEvent)(t,w.start,this.onTouchStart,{passive:!1}),this.props.enableUserSelectHack&&(0,i.removeUserSelectStyles)(e)}}},{key:"findDOMNode",value:function(){return this.props.nodeRef?this.props.nodeRef.current:a.default.findDOMNode(this)}},{key:"render",value:function(){return r.cloneElement(r.Children.only(this.props.children),{onMouseDown:this.onMouseDown,onMouseUp:this.onMouseUp,onTouchEnd:this.onTouchEnd})}}])&&b(e.prototype,n),o&&b(e,o),s}(r.Component);e.default=T,D(T,"displayName","DraggableCore"),D(T,"propTypes",{allowAnyClick:o.default.bool,disabled:o.default.bool,enableUserSelectHack:o.default.bool,offsetParent:function(t,e){if(t[e]&&1!==t[e].nodeType)throw new Error("Draggable's offsetParent must be a DOM Node.")},grid:o.default.arrayOf(o.default.number),handle:o.default.string,cancel:o.default.string,nodeRef:o.default.object,onStart:o.default.func,onDrag:o.default.func,onStop:o.default.func,onMouseDown:o.default.func,scale:o.default.number,className:c.dontSetMe,style:c.dontSetMe,transform:c.dontSetMe}),D(T,"defaultProps",{allowAnyClick:!1,cancel:null,disabled:!1,enableUserSelectHack:!0,offsetParent:null,handle:null,grid:null,transform:null,onStart:function(){},onDrag:function(){},onStop:function(){},onMouseDown:function(){},scale:1})}}]);
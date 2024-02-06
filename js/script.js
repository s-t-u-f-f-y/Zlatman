/**
 * @typedef {Object} dNode
 * @property {HTMLElement} parent
 * @property {HTMLElement} element
 * @property {HTMLElement} to
 * @property {string} breakpoint
 * @property {string} order
 * @property {number} index
 */

/**
 * @typedef {Object} dMediaQuery
 * @property {string} query
 * @property {number} breakpoint
 */

/**
 * @param {'min' | 'max'} type
 */
function useDynamicAdapt(type = 'max') {
    const className = '_dynamic_adapt_'
    const attrName = 'data-da'
  
    /** @type {dNode[]} */
    const dNodes = getDNodes()
  
    /** @type {dMediaQuery[]} */
    const dMediaQueries = getDMediaQueries(dNodes)
  
    dMediaQueries.forEach((dMediaQuery) => {
      const matchMedia = window.matchMedia(dMediaQuery.query)
      // массив объектов с подходящим брейкпоинтом
      const filteredDNodes = dNodes.filter(({ breakpoint }) => breakpoint === dMediaQuery.breakpoint)
      const mediaHandler = getMediaHandler(matchMedia, filteredDNodes)
      matchMedia.addEventListener('change', mediaHandler)
  
      mediaHandler()
    })
  
    function getDNodes() {
      const result = []
      const elements = [...document.querySelectorAll(`[${attrName}]`)]
  
      elements.forEach((element) => {
        const attr = element.getAttribute(attrName)
        const [toSelector, breakpoint, order] = attr.split(',').map((val) => val.trim())
  
        const to = document.querySelector(toSelector)
  
        if (to) {
          result.push({
            parent: element.parentElement,
            element,
            to,
            breakpoint: breakpoint ?? '767',
            order: order !== undefined ? (isNumber(order) ? Number(order) : order) : 'last',
            index: -1,
          })
        }
      })
  
      return sortDNodes(result)
    }
  
    /**
     * @param {dNode} items
     * @returns {dMediaQuery[]}
     */
    function getDMediaQueries(items) {
      const uniqItems = [...new Set(items.map(({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`))]
  
      return uniqItems.map((item) => {
        const [query, breakpoint] = item.split(',')
  
        return { query, breakpoint }
      })
    }
  
    /**
     * @param {MediaQueryList} matchMedia
     * @param {dNodes} items
     */
    function getMediaHandler(matchMedia, items) {
      return function mediaHandler() {
        if (matchMedia.matches) {
          items.forEach((item) => {
            moveTo(item)
          })
  
          items.reverse()
        } else {
          items.forEach((item) => {
            if (item.element.classList.contains(className)) {
              moveBack(item)
            }
          })
  
          items.reverse()
        }
      }
    }
  
    /**
     * @param {dNode} dNode
     */
    function moveTo(dNode) {
      const { to, element, order } = dNode
      dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement)
      element.classList.add(className)
  
      if (order === 'last' || order >= to.children.length) {
        to.append(element)
  
        return
      }
  
      if (order === 'first') {
        to.prepend(element)
  
        return
      }
  
      to.children[order].before(element)
    }
  
    /**
     * @param {dNode} dNode
     */
    function moveBack(dNode) {
      const { parent, element, index } = dNode
      element.classList.remove(className)
  
      if (index >= 0 && parent.children[index]) {
        parent.children[index].before(element)
      } else {
        parent.append(element)
      }
    }
  
    /**
     * @param {HTMLElement} element
     * @param {HTMLElement} parent
     */
    function getIndexInParent(element, parent) {
      return [...parent.children].indexOf(element)
    }
  
    /**
     * Функция сортировки массива по breakpoint и order
     * по возрастанию для type = min
     * по убыванию для type = max
     *
     * @param {dNode[]} items
     */
    function sortDNodes(items) {
      const isMin = type === 'min' ? 1 : 0
  
      return [...items].sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.order === b.order) {
            return 0
          }
  
          if (a.order === 'first' || b.order === 'last') {
            return -1 * isMin
          }
  
          if (a.order === 'last' || b.order === 'first') {
            return 1 * isMin
          }
  
          return 0
        }
  
        return (a.breakpoint - b.breakpoint) * isMin
      })
    }
  
    function isNumber(value) {
      return !isNaN(value)
    }
  }
  
useDynamicAdapt()

document.addEventListener("click", documentActions);

function documentActions(e) {
    const targetElement = e.target;
    if (targetElement.closest('[data-parent]')) {
        const sunMenuId = targetElement.dataset.parent ? targetElement.dataset.parent : null;
        const subMenu = document.querySelector(`[data-submenu="${sunMenuId}"]`);
        const backBtn = document.querySelector('.show-header__back')
        const activeParent = document.querySelector('.show-header__body');

        if (subMenu) {
            const activeLink = document.querySelector('._sub-menu-active');
            const activeBlock = document.querySelector('._sub-menu-open');

            if (activeLink && activeLink !== targetElement) {
                activeLink.classList.remove('_sub-menu-active');
                activeBlock.classList.remove('_sub-menu-open');
            }
            targetElement.classList.toggle('_sub-menu-active');
            subMenu.classList.toggle('_sub-menu-open');

            if (subMenu.classList.contains('_sub-menu-open')) {
                activeParent.classList.add('_active');
            } else {
                activeParent.classList.remove('_active');
            }

            backBtn.addEventListener("click", function(e){
                activeParent.classList.remove('_active');
                subMenu.classList.remove('_sub-menu-open');
            });

        } else {
            console.log('Нет такого подменю.')
        }

        e.preventDefault(); 
    }
}


const iconMenu = document.querySelector('.menu__icon');
if(iconMenu){
    const menuBody = document.querySelector('.menu__list')
    iconMenu.addEventListener("click", function(e){
        document.body.classList.toggle('_lock');
        iconMenu.classList.toggle('_active');
        menuBody.classList.toggle('_active');
    });
};

const catalogMenu = document.querySelector('.menu__item_k');
if(catalogMenu){
    const catalogBody = document.querySelector('.bottom-header')
    const backBtn = document.querySelector('.bottom-header__back')
    catalogMenu.addEventListener("click", function(e){
        document.body.classList.add('_lock');
        catalogMenu.classList.toggle('_active');
        catalogBody.classList.toggle('_active');
    });
    iconMenu.addEventListener("click", function(e){
        catalogBody.classList.remove('_active')
    });
    backBtn.addEventListener("click", function(e){
        catalogBody.classList.remove('_active');
    });
};

window.addEventListener("load", footerAccordion);
function footerAccordion() {

    if ( window.innerWidth <= 960){
        const points = document.querySelectorAll('.menu-footer__title');

        points.forEach(function(item) {
            item.addEventListener("click", function (){

                const parent = item.parentNode;
                
                if (parent.classList.contains('_active')) {
                    parent.classList.remove('_active');
                } else {
                    document.querySelectorAll('.menu-footer__list').forEach(function(child){
                        child.classList.remove('_active');
                    });
                    parent.classList.add('_active');
                }


            });
        });
    }
}

const popupBtn = document.querySelector('.popup-link');
const popup = document.querySelector('.popup-header');
const popupClose = document.querySelector('.close-popup');
const popupContent = document.querySelector('.popup-header__content')

if(popupBtn){
    popupBtn.addEventListener("click", function(e){
        popup.classList.add('_open')
        document.body.classList.add('_lock')
    });
};

if(popupClose){
    popupClose.addEventListener("click", function(e){
        popup.classList.remove('_open')
        document.body.classList.remove('_lock')
    });
};

popup.addEventListener("click", function(e){
    const click = e.composedPath().includes(popupContent);
    if (!click) {
        popup.classList.remove('_open')
        document.body.classList.remove('_lock')
    }
});

if(document.querySelector('.slider-main-block')) {
    new Swiper('.slider-main-block',{

        pagination: {
            el: '.slider-main-block__bullets',

            type: 'bullets',
        },

        autoplay: {
            delay: 3000,
        },
        
        speed: 1000,
        
        slidesPerView: 1,

        spaceBetween: 20,
        
        on: {
            init: function (swiper) {
                const allSlides = document.querySelector('.fraction-main-block__all');
                allSlides.innerHTML = swiper.slides.length;
            },
            slideChange: function (swiper) {
                const currentSlide = document.querySelector('.fraction-main-block__current');
                currentSlide.innerHTML = swiper.activeIndex + 1 < 10 ? `0${swiper.activeIndex + 1}` : swiper.activeIndex + 1;
            }
        }

    });
}

if(document.querySelector('.card__body')) {
    const cardSlider = new Swiper('.card__body',{
        
        pagination: {
            el: '.card__bullets',

            type: 'bullets',
        },

        speed: 800,
        
        slidesPerView: 4,

        slidesPerGroup: 4,

        spaceBetween: 30,
        
        breakpoints: {
            1280: {
                slidesPerView: 4,
            },
            960: {
                slidesPerView: 3,
            },
        }
    });
}

if(document.querySelector('.new__slider')) {
    const newSlider = new Swiper('.new__slider',{
        
        pagination: {
            el: '.card__bullets',

            type: 'bullets',
        },

        speed: 800,
        
        slidesPerView: 3,

        slidesPerGroup: 3,

        spaceBetween: 30,

        breakpoints: {
            1280: {
                slidesPerView: 3,
            },
            961: {
                slidesPerView: 2,     
                slidesPerGroup: 2, 
                spaceBetween: 20,
            },
            320: {
                slidesPerView: 1,     
                slidesPerGroup: 1, 
                spaceBetween: 20,
            },
        }
        
    });
}

/*===========================================================================*/

const selectHeader = document.querySelector('.select-catalog__header');
const selectItem = document.querySelectorAll('.select-catalog__item');

if (selectHeader) {
    selectHeader.addEventListener("click", selectToggle);

    function selectToggle () {
        this.parentElement.classList.toggle('_active')
    };
}

if (selectItem) {
    selectItem.forEach(function(item) {
        item.addEventListener("click", selectChoose);
    });

    function selectChoose() {
        const text = this.innerText,
            select = this.closest('.select-catalog'),
            currentText = select.querySelector('.select-catalog__current');
        currentText.innerText = text;
        select.classList.remove('_active');
    };
}

const rangeInput = document.querySelectorAll(".range-input input"),
priceInput = document.querySelectorAll(".prise-filter__values input"),
range = document.querySelector(".prise-filter__bar .prise-filter__progress");
let priceGap = 1000;

if (priceInput){
    priceInput.forEach(input =>{

        input.addEventListener("input", e =>{
            let minPrice = parseInt(priceInput[0].value),
            maxPrice = parseInt(priceInput[1].value);
            
            if((maxPrice - minPrice >= priceGap) && maxPrice <= rangeInput[1].max){
                if(e.target.className === "input-min"){
                    rangeInput[0].value = minPrice;
                    range.style.left = ((minPrice / rangeInput[0].max) * 100) + "%";
                }else{
                    rangeInput[1].value = maxPrice;
                    range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
                }
            }

        });

    });
}

if (priceInput){
    rangeInput.forEach(input =>{
        input.addEventListener("input", e =>{
            let minVal = parseInt(rangeInput[0].value),
            maxVal = parseInt(rangeInput[1].value);
            if((maxVal - minVal) < priceGap){
                if(e.target.className === "range-min"){
                    rangeInput[0].value = maxVal - priceGap
                }else{
                    rangeInput[1].value = minVal + priceGap;
                }
            }else{
                priceInput[0].value = minVal;
                priceInput[1].value = maxVal;
                range.style.left = ((minVal / rangeInput[0].max) * 100) + "%";
                range.style.right = 100 - (maxVal / rangeInput[1].max) * 100 + "%";
            }
        });

    });
}

const priseBtn = document.querySelector(".prise-filter__title")

if (priseBtn){
    priseBtn.addEventListener("click", function (){

        this.parentElement.classList.toggle('_active')

    });
}

const pointsBtn = document.querySelectorAll(".points-filter__title")

if (pointsBtn){
    pointsBtn.forEach(function(item) {
        item.addEventListener("click", function (){

            this.parentElement.classList.toggle('_active')
        
        });
    });
}

if (document.documentElement.clientWidth < 960) {
    const filterHeader = document.querySelector('.filter__header');

    if (filterHeader){
        filterHeader.addEventListener("click", function(){
            filterHeader.classList.toggle('_active')
        });
    }
}

/*===========================================================================*/


if(document.querySelector('.thumbnail-post__slider')) {
    const thumbSlider = new Swiper('.thumbnail-post__slider',{

        loop: true,

        spaceBetween: 15,

        breakpoints: {
            320: {
                slidesPerView: 2,
                slidesPerView: 2,
            },
            425: {
                slidesPerView: 3,
            },
            540: {
                slidesPerView: 3,
                slidesPerView: 4,
            },
            960: {
                slidesPerView: 3,
            },
            1366: {
                slidesPerView: 4,
            },
        }
    });

    const mySlider = new Swiper('.knife-post__slider',{

        speed: 800,
        
        loop: true,

        slidesPerView: 1,

        effect: 'fade',

        fadeEffect: {
            crossFade: true
        },

        thumbs: {
            swiper: thumbSlider,
        },
        
    });
}



const selectHeader2 = document.querySelectorAll('.select-knife__header');
const selectItem2 = document.querySelectorAll('.select-knife__item');

selectHeader2.forEach(function(item) {
    item.addEventListener("click", selectToggle);
});

function selectToggle () {
    this.parentElement.classList.toggle('_active')
};

selectItem2.forEach(function(item) {
    item.addEventListener("click", selectChoose);
});

function selectChoose() {
    const text = this.innerText,
        select = this.closest('.select-knife__content'),
        currentText = select.querySelector('.select-knife__current');
    currentText.innerText = text;
    select.classList.remove('_active');
};

const tabsBtn = document.querySelectorAll(".tabs-description__title");
const tabsContent = document.querySelectorAll(".tabs-description__content");

tabsBtn.forEach(function(item) {
    item.addEventListener("click", function(){
        let currentBtn = item;
        let tabId = currentBtn.getAttribute("data-tab");
        let currentTab = document.querySelector(tabId);

        if( ! currentTab.classList.contains('_active')) {
            tabsBtn.forEach(function(item){
                item.classList.remove('_active')
            });

            tabsContent.forEach(function(item){
                item.classList.remove('_active')
            });

            currentBtn.classList.add('_active');
            currentTab.classList.add('_active')
        }
    });
});


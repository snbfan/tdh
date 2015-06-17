/**
 * Initiate gallery object
 *
 * @param url
 * @param category
 */
function gallery(url, category) {
    this.data = undefined;
    this.url = url;
    this.collection = [];
    this.category = category;

    // screen width
    this.width = undefined;
    // screen height
    this.height = undefined;
    // minimum allowed width for the gallery
    this.minWidth = 300;
    // minimum allowed width for ad block
    this.minAdWidth = 135;
    // arrow width
    this.arrowWidth = 64;
    // width of the ads container
    this.wrapperWidth = undefined;
    // actual calculated ad block width
    this.adWidth = undefined;
    // scroll offset
    this.offset = 0;
    // number of visible ads
    this.picsOnScreen = undefined;
    // image container
    this.imageContainer = undefined;

    // measure viewport first
    this.detectScreenSize();
}

/**
 * Renders template and ads
 *
 */
gallery.prototype.render = function() {
    // draw outer divs
    this.renderTemplate();
    // draw ads
    this.renderCollection();
}

/**
 * Parses json into object's collection by category
 *
 * @returns {gallery}
 */
gallery.prototype.parseData = function() {
    if (this.data) {
        for (var i in this.data) {
            if (this.data[i].category == this.category) {
                this.collection.push(this.data[i]);
            }
        }
    }
}

/**
 * Detects screen width
 *
 */
gallery.prototype.detectScreenSize = function() {
    this.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    this.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

/**
 * Detects if browse buttons has to be displayed
 *
 * @returns {string} block|none
 */
gallery.prototype.buttonDisplayStyle = function() {
    return ((this.width - 20) < (this.arrowWidth * 2 + this.minAdWidth * this.collection.length)) ? 'block' : 'none';
}

/**
 * Handler for browsing left
 *
 */
gallery.prototype.clickPrevious = function() {
    if (this.offset <= 0) {
        return false;
    }

    this.imageContainer.style.margin = '0 0 0 -' + (this.adWidth * --this.offset) + 'px';
}

/**
 * Handler for browsing right
 *
 */
gallery.prototype.clickNext = function() {
    if (this.offset >= (this.collection.length - this.picsOnScreen)) {
        return false;
    }

    this.imageContainer.style.margin = '0 0 0 -' + (this.adWidth * ++this.offset) + 'px';
}

/**
 * Renders outer template for image container
 *
 */
gallery.prototype.renderTemplate = function() {

    var buttonDisplayStyle = this.buttonDisplayStyle();

    var liquid = document.createElement('div');
    liquid.setAttribute('class', 'liquid');
    document.getElementsByTagName('body')[0].appendChild(liquid);
    liquid.style.width = (((this.width - 20) > this.minWidth) ? (this.width - 20) : this.minWidth) + 'px';

    var previous = document.createElement('span');
    previous.setAttribute('class', 'previous');
    previous.style.display = buttonDisplayStyle;
    previous.addEventListener('click', this.clickPrevious.bind(this));
    liquid.appendChild(previous);

    var wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');
    this.wrapperWidth = liquid.clientWidth - previous.clientWidth * 2;
    wrapper.style.width = this.wrapperWidth + 'px';
    liquid.appendChild(wrapper);

    var ul = this.imageContainer = document.createElement('ul');
    wrapper.appendChild(ul);

    var next = document.createElement('span');
    next.setAttribute('class', 'next');
    next.style.display = buttonDisplayStyle;
    next.addEventListener('click', this.clickNext.bind(this));
    liquid.appendChild(next);
}

/**
 * Calculates correct ad block width
 *
 * @returns {number}
 */
gallery.prototype.calcAdWidth = function() {
    var effectiveWidth = this.wrapperWidth - 10;
        numOfPics = Math.floor(effectiveWidth / this.minAdWidth);

    this.picsOnScreen = (numOfPics > this.collection.length) ? this.collection.length : ((this.width < this.height && this.width > 450) ? 3 : Math.floor(effectiveWidth / this.minAdWidth));

    return Math.floor(effectiveWidth / this.picsOnScreen);
}

/**
 * Renders ad blocks
 *
 */
gallery.prototype.renderCollection = function() {
    if (this.collection.length) {
        this.adWidth = this.calcAdWidth();

        this.collection.forEach((function(val, i) {

            var li = document.createElement('li');
            li.style.width = this.adWidth + 'px';
            this.imageContainer.appendChild(li);

            var spanUpper = document.createElement('span');
            spanUpper.setAttribute('class', 'price');
            li.appendChild(spanUpper);
            spanUpper.innerHTML = val.price;

            var img = document.createElement('img');
            img.setAttribute('width', '130px');
            img.setAttribute('border', '0');
            img.src = val.img;
            li.appendChild(img);

            var spanLower = document.createElement('span');
            spanLower.setAttribute('class', 'title');
            li.appendChild(spanLower);
            spanLower.innerHTML = this.beautifyTitle(val.title);

        }).bind(this));
    }
}

/**
 * Minor beautifying of title
 *
 * @param str
 * @returns {string}
 */
gallery.prototype.beautifyTitle = function(str) {
    return str.trim().substring(0, 20).split(" ").slice(0, -1).join(" ") + "...";
}

/**
 * Thenable ajax call
 *
 * @param a
 * @param xhr
 * @returns {XMLHttpRequest}
 */
gallery.prototype.ajax = function(a, xhr) {
    xhr = new XMLHttpRequest();

    // Open url
    xhr.open('GET', a);

    // Reuse a to store callbacks
    a = [];

    // onSuccess handler
    // onError   handler
    // cb        placeholder to avoid using var, should not be used
    xhr.onreadystatechange = xhr.then = function(onSuccess, onError, cb) {

        // Test if onSuccess is a function
        if (onSuccess && onSuccess.call) a = [,onSuccess, onError];

        // Test if request is complete
        if (xhr.readyState == 4) {

            // index will be:
            // 0 if undefined
            // 1 if status is between 200 and 399
            // 2 if status is over
            cb = a[0|xhr.status / 200];

            // Safari doesn't support xhr.responseType = 'json'
            // so the response is parsed
            if (cb) {
                try {
                    cb(JSON.parse(xhr.responseText), xhr);
                } catch (e) {
                    cb(null, xhr);
                }
            }
        }
    };

    // Send
    xhr.send();

    // Return request
    return xhr;
}

/**
 * Wrap over ajax call
 *
 * @returns {XMLHttpRequest|*}
 */
gallery.prototype.fetchData = function() {
    return this.ajax(this.url);
}

/**
 * Main process
 *
 */
gallery.prototype.process = function() {
    this.fetchData().then(this.processSuccess.bind(this), this.processError.bind(this));
}

/**
 * Error handling
 *
 * @param data
 * @param xhr
 */
gallery.prototype.processError = function(data, xhr) {
    console.error(data, xhr.status)
};

/**
 * Success handling
 *
 * @param data
 * @param xhr
 */
gallery.prototype.processSuccess = function(data, xhr) {
    this.data = data;
    this.parseData();
    this.render();
};

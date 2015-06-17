/**
 *
 * @param url
 * @param category
 */
function gallery(url, category) {
    this.data = undefined;
    this.url = url;
    this.collection = [];
    this.showCategory = category;
    this.width = undefined;
    this.height = undefined;
    this.minWidth = 320;
    this.basicWidth = (130+15) * 5;
    this.detectSizes();
    this.renderTemplate();
}

/**
 *
 * @returns {gallery}
 */
gallery.prototype.parseData = function() {
    if (this.data) {
        for (var i in this.data) {
            if (this.data[i].category == this.showCategory) {
                this.collection.push(this.data[i]);
            }
        }
    }

    return this;
}

/**
 *
 *
 */
gallery.prototype.detectSizes = function() {

    this.width = window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

    this.height = window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
}

/**
 *
 *
 */
gallery.prototype.buttonDisplayStyle = function() {
    return (/*this.height > this.width ||*/
    this.width < (128*2 + (130+11)*5)) ? 'block' : 'none';
}

/**
 *
 *
 */
gallery.prototype.clickPrevious = function() {

}

/**
 *
 *
 */
gallery.prototype.clickNext = function() {

}

/**
 *
 *
 */
gallery.prototype.renderTemplate = function() {

    var buttonDisplayStyle = this.buttonDisplayStyle();

    var div1 = document.createElement('div');
    div1.setAttribute('id', 'liquid');
    div1.setAttribute('class', 'liquid');
    document.getElementsByTagName('body')[0].appendChild(div1);

    var previous = document.createElement('span');
    previous.setAttribute('class', 'previous');
    previous.style.display = buttonDisplayStyle;
    previous.style.width = '128px;'
    previous.addEventListener('click', this.clickPrevious.bind(this));
    document.getElementById('liquid').appendChild(previous);

    var wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');
    document.getElementById('liquid').appendChild(wrapper);

    var ul = document.createElement('ul');
    ul.setAttribute('id', 'imageContainer');
    wrapper.appendChild(ul);

    if (ul.clientWidth < this.basicWidth) {
        ul.style.overflow = 'hidden';
    }

    this.containerWidth = ul.clientWidth;

    var next = document.createElement('span');
    next.setAttribute('class', 'next');
    next.style.display = buttonDisplayStyle;
    next.style.width = '128px;'
    next.addEventListener('click', this.clickNext.bind(this));
    document.getElementById('liquid').appendChild(next);
}

/**
 *
 *
 */
gallery.prototype.renderCollection = function() {
    if (this.collection.length) {
        var _this = this, liWidth = this.containerWidth / 5 - 15;
        //console.log(this.collection);

        this.collection.forEach(function(val, i) {

            var li = document.createElement('li');
            li.setAttribute('id', 'imgli' + i);
            li.style.width = liWidth + 'px';
            document.getElementById('imageContainer').appendChild(li);

            var spanUpper = document.createElement('span');
            spanUpper.setAttribute('id', 'price'+i);
            spanUpper.setAttribute('class', 'price');
            document.getElementById('imgli' + i).appendChild(spanUpper);
            document.getElementById('price' + i).innerHTML = val.price;

            var img = document.createElement('img');
            img.setAttribute('id', 'img' + i);
            img.setAttribute('width', '130px');
            img.setAttribute('border', '0');
            img.src = val.img;
            document.getElementById('imgli' + i).appendChild(img);

            var spanLower = document.createElement('span');
            spanLower.setAttribute('id', 'title'+i);
            spanLower.setAttribute('class', 'title');
            document.getElementById('imgli' + i).appendChild(spanLower);
            document.getElementById('title' + i).innerHTML = _this.beautifyTitle(val.title);
        });
    }
}

/**
 *
 * @param str
 * @returns {string}
 */
gallery.prototype.beautifyTitle = function(str) {
    str.trim();
    str = str.substring(0, 20).split(" ").slice(0, -1).join(" ") + "...";
    //str += "...";
    return str;
}

/**
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
 *
 * @returns {XMLHttpRequest|*}
 */
gallery.prototype.fetchData = function() {
    return this.ajax(this.url);
}

/**
 *
 *
 */
gallery.prototype.process = function() {
    this.fetchData().then(this.processSuccess.bind(this), this.processError.bind(this));
}

/**
 *
 * @param data
 * @param xhr
 */
gallery.prototype.processError = function(data, xhr) {
    console.error(data, xhr.status)
};

/**
 *
 * @param data
 * @param xhr
 */
gallery.prototype.processSuccess = function(data, xhr) {
    this.data = data;
    this.parseData().renderCollection();
};
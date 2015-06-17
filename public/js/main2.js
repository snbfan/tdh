document.addEventListener("DOMContentLoaded", function(event) {
    var g = new gallery('http://localhost:3000/data/data.json', 'cars');
    g.process();
});
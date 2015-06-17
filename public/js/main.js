$(document).ready(function () {
    $.get('http://localhost:3000/data/data.json', function(data) {
        for(var i in data) {
            if (data[i].category == 'cars') {
                $('<li id="'+ 'imgli' + i +'">').attr({}).appendTo('#imageContainer');
                $('<span id="'+ 'price' + i +'" class="price">').appendTo('#imgli'+i).html(data[i].price);
                $('<img id="'+ 'img' + i + '" />').attr({'width': 130, 'border': 0, 'src': data[i].img}).appendTo('#imgli'+i);
                $('<span id="' + 'title' + i + '" class="title">').appendTo('#imgli'+i).html(
                    ($.trim(data[i].title).substring(0, 20).split(" ").slice(0, -1).join(" ") + "...")
                );
            }
        }
        $('#liquid1').liquidcarousel({height: 129, duration: 100, hidearrows: true});
    });
});

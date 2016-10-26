var currentTime = moment().tz("America/Los_Angeles").format();

var refreshTime = function(){
	return moment(currentTime).format("ddd, h:mm a");
}

$('.current-time').text(refreshTime());


function scroll() {
  var dd = $('.right-side-body').easyTicker({
    direction: 'up',
    easing: 'easeInSine',
    speed: 'slow',
    interval: 3000,
    height: '100%',
    visible: 0,
    mousePause: 0
  }).data('easyTicker');
}

scroll();
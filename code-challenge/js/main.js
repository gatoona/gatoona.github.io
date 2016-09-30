//Menu Controls
$('.dd-header-menu-button').click(function(){
  $('.dd-header-menu').toggleClass( "hidden-menu-xs fadeInRight" );
  return false;
});

$('.popup-container-bg').click(function(){
  hidePopUp();
})

$('.dd-header-menu-item').click(function(){

  $('.dd-header-menu').addClass( "hidden-menu-xs" );
  
  if($(this).find('a#menu-signup').length != 0){
    if ($('.popup-container').hasClass('hidden')){
      $('.popup-container').addClass('animated fadeIn').removeClass('hidden');
    }
  }

  return false;
});

$('.content-close').click(function(){
  hideSelection();
  return false;
});

var hidePopUp = function(){
  $('.popup-container').addClass('hidden').removeClass('animated fadeIn');
  return false;
}



//Map Initial Variables
var url = 'http://beta.trimet.org/go/json/destinations'
var map = L.map('map', {zoomControl: false}).setView([45.510128, -122.677028], 13);



var OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);


var destinations = [];
var destinationsLayer = new L.MarkerClusterGroup({
  iconCreateFunction: function(cluster) {
    return L.divIcon({ name: cluster.getChildCount(), cluster: true, iconUrl: 'img/cluster.png', iconSize: new L.Point(42,42), iconAnchor: new L.Point(21, 21), shadowAnchor: new L.Point(21,-21)});
  },
  showCoverageOnHover: false
});
var selectLayer = new L.FeatureGroup();
var filterOut;
var contentOut;

new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

L.DivIcon = L.Icon.extend({
  options: {
    iconUrl: 'img/marker.png',
    imageIcon: '',
    name: '',
    cluster: false,
    shadowUrl: 'img/marker-shadow.png',
    iconSize: new L.Point(42,57),
    iconAnchor: new L.Point(21, 60),
    shadowSize:   new L.Point(42,6), // size of the shadow
    shadowAnchor: new L.Point(21,0),  // the same for the shadow
    className: 'leaflet-div-icon'
  },

  createIcon: function () {
    var div = document.createElement('div');
    var marker = this._createImg(this.options['iconUrl']);

    var dimg = document.createElement('div');
    dimg.setAttribute ( "class", "map-icon-bg");
    dimg.style.backgroundImage = "url('img/featured-projects/" + this.options['imageIcon'] + "')";

    var numdiv = document.createElement('div');
    numdiv.innerHTML = this.options['name'] || '';

    if (this.options['cluster']){
      numdiv.setAttribute ( "class", "ttRoute-map-cluster");
    }
    else {
      numdiv.setAttribute ( "class", "ttRoute-map");
    }

    div.appendChild ( marker );
    div.appendChild ( dimg );
    div.appendChild ( numdiv );

    var route = window.location.href.split('tracker/')[1];
    var line = '';
    if (route){line = route.split('/')[2];}

    this._setIconStyles(div, 'icon');
    return div;
  }
});

function clearCSSTimeout(){
  clearTimeout(filterOut);
  clearTimeout(contentOut);
}

function hideSelection(){
  selectLayer.clearLayers();
  window.location.href = "#/"
  var bigWidth = $(window).width() >= 640;
  if (bigWidth){
    $('.content-container').addClass('fadeOutRight');
  }
  else {
    $('.content-container').addClass('fadeOutDown');
  }
  $('.content-container').removeClass('fadeInRight fadeInUp fadeIn');
  contentOut = setTimeout(function() {
    $('.content-container').addClass('hidden')
  }, 1000);
}


function onMarkerClick(location, data){

  clearCSSTimeout();
  selectLayer.clearLayers();

  var bigWidth = $(window).width() >= 640;

  var circle = new L.CircleMarker(location, {
    radius: 50,
    fillColor: "#B82233",
    color: "#000",
    weight: 1,
    opacity: 0,
    fillOpacity: 0.3,
  });

  selectLayer.addLayer(circle);

  function inputData(data){
    $('.content-info .content-title').html(data.name);
    $('.content-info .content-city').html(data.city);
    $('.content-info .content-description').html(data.desc);
    $('.content-image img').attr("src", "img/featured-projects/" + data.image);
    $('.content-button a.site-visit').attr("href", data.url);
  }

  if ($('.content-container').is('.hidden, .fadeOutRight, .fadeOutDown')){
    inputData(data);
    $('.content-container').removeClass('hidden fadeOutRight fadeOutDown');

    if (bigWidth){
      $('.content-container').addClass('animated fadeInRight');
    }
    else {
      $('.content-container').addClass('animated fadeInUp');
    }
  }
  else {
    inputData(data);
    $('.content-container').removeClass('fadeInRight fadeInUp').addClass('animated fadeIn');
    var cloneContent = $('.content-container').clone(true);            
    $('.content-container').before(cloneContent);    
    $(".content-container:last").remove();

  }
}

var isExpired = function(indefinite, endDate){
  var isIndefinte = Number(indefinite);
  var endDate = new Date(endDate.split(' ').join('T'));
  var currentDate = new Date();
  var endDateEpoch = Math.round(endDate.getTime()/1000.0);
  var currentDateEpoch = Math.round(currentDate.getTime()/1000.0);

  if (isIndefinte) {
    return true;
  }
  else {
    if (endDateEpoch >= currentDateEpoch){
      return true;
    }
    else {
      return false;
    }
  }
}

//zIndexOffset

function zIndex(marker){
  $.each(destinationsLayer._featureGroup._layers, function( index, value ) {
    value.setZIndexOffset(0);
  }); 
  marker.setZIndexOffset(1000);
}

//Marker Controller
function setMarkers(destinations){
  destinationsLayer.clearLayers();
  
  $.each(destinations, function( index, value ) {
    var destination = value;
    var LatLng = destination.latlon.replace("(", "").replace(")", "").split(", ")
    var Lat = parseFloat(LatLng[0]);
    var Lng = parseFloat(LatLng[1]);
    

        var marker = L.marker([Lat, Lng], {
          title: destination.name,
          riseOnHover: true,
          riseOffset: 1000,
          icon: new L.DivIcon({name: destination.name, imageIcon: destination.image }),
          data: destination
        }).on('click', function(e) {
          zIndex(this);
          onMarkerClick(e.latlng, e.target.options.data);
        });
        destinationsLayer.addLayer(marker);

  });

  map.addLayer(destinationsLayer);
  map.addLayer(selectLayer);
  map.fitBounds(destinationsLayer.getBounds(), {padding: [150, 150]});
  map.on('click', function(e) {
    clearCSSTimeout();
    hideSelection();
  });
}


function getData(){
  $.each(projects, function( index, value ) {
    destinations.push(value);
  });
  setMarkers(destinations);
};

//Run Initial Functions
try{
  if(localStorage.getItem('popState') != 'shown'){
      $('.popup-container').removeClass('hidden');
      localStorage.setItem('popState','shown')
  }
}
catch(err) {
  $('.popup-container').removeClass('hidden');
}
getData();

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function upName (name){
  name = name.toLowerCase().replace(/\b[a-z]/g, function(first) {
      return first.toUpperCase();
  });
  return name;
}

$('.button-submit').click(function() {
  $( "#form1" ).submit();
});

$('.input').keypress(function (e) {
  if (e.which == 13) {
    $( "#form1" ).submit();
    return false;
  }
});

$( "#form1" ).submit(function( event ) {
  event.preventDefault();

  var formData = {
        'firstname' : upName($('input[name=firstname]').val()),
        'lastname' : upName($('input[name=lastname]').val()),
        'email' : $('input[name=email]').val(),
  };

  if (isEmail(formData.email)){
    hidePopUp(); 
    $.ajax({
      type: "POST",
      url: "http://beta.trimet.org/php-mailer/examples/gmail.php",
      crossDomain: true,
      data: formData,
      success: function(json) {
        console.log(json);
        $('.popup-container-content-body').html('<h2>Thanks for signing up!</h2>');
        $('.button-submit').remove();
        $('.form-error').remove();

      },
      error: function(xhr, textStatus, errorThrown) {
        console.log(textStatus);
        alert("Sorry, we can't submit your information at this time.")
      }
    });
  }
  else {
    $('.form-error').removeClass('hidden').addClass('animated fadeIn');
  }
});


